import { TOKENS } from '@infrastructure/di/tokens';
import type { UserService } from '@modules/user/services/userService';
import { ValidationError } from '@modules/user/errors';
import type {
  IVaccineApplicationStore,
  VaccineApplicationFilterParams,
} from '@shared/interfaces/vaccineApplication';
import type { IVaccineStore } from '@shared/interfaces/vaccine';
import type { IVaccineBatchStore } from '@shared/interfaces/vaccineBatch';
import type { IVaccineSchedulingStore } from '@shared/interfaces/vaccineScheduling';
import type {
  PaginatedResponse,
  PaginationParams,
} from '@shared/interfaces/pagination';
import type {
  VaccineApplication,
  VaccineApplicationWithRelations,
} from '@shared/models/vaccineApplication';
import type { Vaccine } from '@shared/models/vaccine';
import type { CreateVaccineApplicationDTO } from '@modules/vaccine-application/validators/createVaccineApplicationValidator';
import type { UpdateVaccineApplicationDTO } from '@modules/vaccine-application/validators/updateVaccineApplicationValidator';
import { inject, injectable } from 'tsyringe';
import { normalizeText } from '@shared/helpers/textHelper';
import {
  VaccineApplicationNotFoundError,
  DuplicateDoseError,
  InsufficientBatchQuantityError,
  InvalidDoseSequenceError,
  MinimumIntervalNotMetError,
  BatchNotAvailableError,
  ExceededRequiredDosesError,
  UnauthorizedApplicationUpdateError,
} from '../errors';
import { VaccineNotFoundError } from '@modules/vaccines/errors';
import { VaccineBatchNotFoundError } from '@modules/vaccines-batch/errors';
import { DEFAULT_USER_SYSTEM_ID } from '@modules/user/constants';
import {
  getCurrentTimestamp,
  getCurrentDate,
  MILLISECONDS_IN_A_DAY,
  transformDateToTimestamp,
} from '@shared/helpers/timeHelper';

/**
 * Response structure for vaccination history endpoint
 * Provides comprehensive vaccination card information with statistics and grouping
 */
export interface VaccinationHistoryResponse {
  /** Timestamp when the vaccination card was generated */
  issuedAt: Date;

  /** Summary statistics about the user's vaccination status */
  summary: {
    /** Total number of unique vaccines that have been applied */
    totalVaccinesApplied: number;
    /** Number of vaccines where all required doses have been completed */
    totalVaccinesCompleted: number;
    /** Number of mandatory vaccines that have not been started */
    totalMandatoryPending: number;
    /** Number of vaccines with incomplete dose schedules */
    totalDosesPending: number;
    /** Percentage of mandatory vaccines completed (0-100) */
    compliancePercentage: number;
  };

  /** Vaccines grouped by type, showing all doses and completion status */
  vaccinesByType: Array<{
    /** The vaccine information */
    vaccine: Vaccine;
    /** All doses of this vaccine applied to the user, sorted chronologically */
    doses: VaccineApplicationWithRelations[];
    /** Whether all required doses have been applied */
    isComplete: boolean;
    /** Percentage of required doses completed (0-100) */
    completionPercentage: number;
    /** Total number of doses required for this vaccine */
    totalDosesRequired: number;
    /** Number of doses that have been applied */
    dosesApplied: number;
  }>;

  /** Complete list of all vaccine applications for this user */
  applied: VaccineApplicationWithRelations[];

  /** Mandatory vaccines that have not been started */
  mandatoryNotTaken: Vaccine[];

  /** Vaccines with incomplete dose schedules */
  pendingDoses: Array<{
    /** The vaccine requiring additional doses */
    vaccine: Vaccine;
    /** Current highest dose number applied */
    currentDose: number;
    /** Next dose number that should be applied */
    nextDose: number;
    /** Expected date for next dose based on interval (null if no interval defined) */
    expectedDate: Date | null;
  }>;
}

/**
 * VaccineApplicationService - Service layer for vaccine application business logic
 *
 * Responsible for:
 * - Vaccine application creation with comprehensive validation
 * - Stock management integration
 * - Dose sequencing and interval validation
 * - Authorization based on user roles
 * - Business rules enforcement
 *
 * Architecture:
 * - Depends on UserService for authorization
 * - Uses multiple stores to orchestrate complex operations
 * - Implements atomic transactions for stock management
 */
@injectable()
export class VaccineApplicationService {
  constructor(
    @inject(TOKENS.IVaccineApplicationStore)
    private readonly vaccineApplicationStore: IVaccineApplicationStore,
    @inject(TOKENS.UserService)
    private readonly userService: UserService,
    @inject(TOKENS.IVaccineStore)
    private readonly vaccineStore: IVaccineStore,
    @inject(TOKENS.IVaccineBatchStore)
    private readonly vaccineBatchStore: IVaccineBatchStore,
    @inject(TOKENS.IVaccineSchedulingStore)
    private readonly vaccineSchedulingStore: IVaccineSchedulingStore,
  ) {}

  /**
   * Creates a new vaccine application
   *
   * Supports two scenarios:
   * 1. Scheduled appointment: schedulingId provided, derives user/vaccine/dose from scheduling
   * 2. Walk-in: No schedulingId, auto-creates scheduling then creates application
   *
   * Business Rules:
   * - Requesting user (who initiates the registration) must be NURSE or MANAGER
   * - Applicator (who physically applies the vaccine) must be NURSE
   * - Applicator and receiver must be different people
   * - Receiver (patient) must exist and be active
   * - Vaccine must exist and not be deleted
   * - Batch must exist, be AVAILABLE, and have sufficient quantity
   * - Batch must not be expired
   * - Cannot apply duplicate dose (unique constraint on scheduling)
   * - Dose number must not exceed vaccine.dosesRequired
   * - Previous doses must be applied before current dose (sequential validation)
   * - If vaccine has intervalDays, minimum interval must be met since last dose
   * - Batch quantity is decremented atomically in a transaction
   *
   * Authorization:
   * - Requesting user: NURSE or MANAGER can initiate vaccine application registration
   * - Applicator: Only NURSE can be the one who physically applies the vaccine
   *
   * @param data - Vaccine application creation data (schedulingId OR receivedById+vaccineId+doseNumber)
   * @param requestingUserId - ID of the user initiating the registration (from req.user)
   * @returns Created vaccine application with all related data
   * @throws ValidationError if requesting user is not NURSE or MANAGER
   * @throws ValidationError if applicator is not NURSE
   * @throws ValidationError if applicator and receiver are the same person
   * @throws ValidationError if scheduling not found (scheduled scenario)
   * @throws ValidationError if application already exists for scheduling
   * @throws UserNotFoundError if receiver not found (walk-in scenario)
   * @throws VaccineNotFoundError if vaccine not found or deleted
   * @throws VaccineBatchNotFoundError if batch not found or deleted
   * @throws ValidationError if batch does not belong to the specified vaccine
   * @throws BatchNotAvailableError if batch status is not AVAILABLE
   * @throws InsufficientBatchQuantityError if batch has no remaining doses
   * @throws BatchNotAvailableError if batch has expired
   * @throws ExceededRequiredDosesError if dose number exceeds vaccine.dosesRequired
   * @throws DuplicateDoseError if the same dose was already applied to this user (walk-in)
   * @throws InvalidDoseSequenceError if previous doses haven't been applied yet (walk-in)
   * @throws MinimumIntervalNotMetError if minimum interval not met since last dose (walk-in)
   */
  async createApplication(
    data: CreateVaccineApplicationDTO,
    requestingUserId: string,
  ): Promise<VaccineApplication> {
    // Validate requesting user and applicator in parallel
    const [requestingUser, applicator] = await Promise.all([
      this.userService.getUserById(requestingUserId, DEFAULT_USER_SYSTEM_ID),
      this.userService.getUserById(data.appliedById, DEFAULT_USER_SYSTEM_ID),
    ]);

    // Validate requesting user authorization
    if (requestingUser.role !== 'NURSE' && requestingUser.role !== 'MANAGER') {
      throw new ValidationError(
        'Only users with NURSE or MANAGER role can register vaccines',
      );
    }

    // Validate applicator is a nurse
    if (applicator.role !== 'NURSE') {
      throw new ValidationError(
        'Only users with NURSE role can apply vaccines',
      );
    }

    // Scenario A: Scheduled Appointment (schedulingId provided)
    if (data.schedulingId) {
      return this.createScheduledApplication(data);
    }

    // Scenario B: Walk-in (no schedulingId)
    return this.createWalkInApplication(data);
  }

  /**
   * Creates an application for a scheduled appointment
   * @private
   */
  private async createScheduledApplication(
    data: CreateVaccineApplicationDTO,
  ): Promise<VaccineApplication> {
    // Fetch scheduling, existing application, and batch in parallel
    const [scheduling, existingApplication, batch] = await Promise.all([
      this.vaccineSchedulingStore.findById(data.schedulingId!),
      this.vaccineApplicationStore.findBySchedulingId(data.schedulingId!),
      this.vaccineBatchStore.findById(data.batchId),
    ]);

    // Validate scheduling exists
    if (!scheduling || scheduling.deletedAt) {
      throw new ValidationError(
        `Scheduling with ID ${data.schedulingId} not found`,
      );
    }

    // Check if application already exists for this scheduling
    if (existingApplication) {
      throw new ValidationError(
        'An application already exists for this scheduling',
      );
    }

    // Validate scheduling status
    if (scheduling.status === 'CANCELLED') {
      throw new ValidationError('Cannot apply vaccine to cancelled scheduling');
    }

    // Validate applicator and receiver are different
    if (data.appliedById === scheduling.userId) {
      throw new ValidationError(
        'The applicator and the receiver cannot be the same person',
      );
    }

    // Validate batch
    if (!batch || batch.deletedAt) {
      throw new VaccineBatchNotFoundError(
        `Batch with ID ${data.batchId} not found`,
      );
    }

    if (batch.vaccineId !== scheduling.vaccineId) {
      throw new ValidationError(
        `Batch ${data.batchId} does not belong to vaccine ${scheduling.vaccineId}`,
      );
    }

    if (batch.status !== 'AVAILABLE') {
      throw new BatchNotAvailableError(
        `Batch ${batch.batchNumber} is not available (status: ${batch.status})`,
      );
    }

    if (batch.currentQuantity <= 0) {
      throw new InsufficientBatchQuantityError(
        `Batch ${batch.batchNumber} has no remaining doses`,
      );
    }

    if (
      new Date(batch.expirationDate).setHours(23, 59, 59, 999) <
      getCurrentTimestamp()
    ) {
      throw new BatchNotAvailableError(
        `Batch ${batch.batchNumber} has expired`,
      );
    }

    // Create application linked to scheduling
    return this.vaccineApplicationStore.createApplicationAndDecrementStock({
      schedulingId: data.schedulingId!,
      appliedById: data.appliedById,
      batchId: data.batchId,
      applicationSite: data.applicationSite,
      observations: data.observations,
    });
  }

  /**
   * Creates an application for a walk-in patient (auto-creates scheduling)
   * @private
   */
  private async createWalkInApplication(
    data: CreateVaccineApplicationDTO,
  ): Promise<VaccineApplication> {
    // Validate required fields for walk-in
    if (!data.receivedById || !data.vaccineId || data.doseNumber === undefined) {
      throw new ValidationError(
        'receivedById, vaccineId, and doseNumber are required for walk-in vaccinations',
      );
    }

    // Validate applicator and receiver are different
    if (data.appliedById === data.receivedById) {
      throw new ValidationError(
        'The applicator and the receiver cannot be the same person',
      );
    }

    // Fetch all independent data in parallel
    const [_, vaccine, batch, isDuplicate] = await Promise.all([
      this.userService.validateUserExists(data.receivedById),
      this.vaccineStore.findById(data.vaccineId),
      this.vaccineBatchStore.findById(data.batchId),
      this.vaccineSchedulingStore.existsByUserVaccineDose(
        data.receivedById,
        data.vaccineId,
        data.doseNumber,
      ),
    ]);

    // Validate vaccine
    if (!vaccine || vaccine.deletedAt) {
      throw new VaccineNotFoundError(
        `Vaccine with ID ${data.vaccineId} not found`,
      );
    }

    // Validate batch
    if (!batch || batch.deletedAt) {
      throw new VaccineBatchNotFoundError(
        `Batch with ID ${data.batchId} not found`,
      );
    }

    if (batch.vaccineId !== data.vaccineId) {
      throw new ValidationError(
        `Batch ${data.batchId} does not belong to vaccine ${data.vaccineId}`,
      );
    }

    if (batch.status !== 'AVAILABLE') {
      throw new BatchNotAvailableError(
        `Batch ${batch.batchNumber} is not available (status: ${batch.status})`,
      );
    }

    if (batch.currentQuantity <= 0) {
      throw new InsufficientBatchQuantityError(
        `Batch ${batch.batchNumber} has no remaining doses`,
      );
    }

    if (
      new Date(batch.expirationDate).setHours(23, 59, 59, 999) <
      getCurrentTimestamp()
    ) {
      throw new BatchNotAvailableError(
        `Batch ${batch.batchNumber} has expired`,
      );
    }

    // Validate dose number
    if (data.doseNumber > vaccine.dosesRequired) {
      throw new ExceededRequiredDosesError(
        data.vaccineId,
        vaccine.dosesRequired,
      );
    }

    // Check for duplicate dose via scheduling (unique constraint will catch this too)
    if (isDuplicate) {
      throw new DuplicateDoseError(
        data.receivedById,
        data.vaccineId,
        data.doseNumber,
      );
    }

    // Validate dose sequence and interval (sequential - depends on previous validations)
    if (data.doseNumber > 1) {
      const [previousDoseExists, previousSchedulings] = await Promise.all([
        this.vaccineSchedulingStore.existsByUserVaccineDose(
          data.receivedById,
          data.vaccineId,
          data.doseNumber - 1,
        ),
        vaccine.intervalDays && vaccine.intervalDays > 0
          ? this.vaccineSchedulingStore.findByUserAndVaccine(
              data.receivedById,
              data.vaccineId,
            )
          : Promise.resolve([]),
      ]);

      if (!previousDoseExists) {
        throw new InvalidDoseSequenceError(
          `Dose ${data.doseNumber - 1} must be applied before dose ${data.doseNumber}`,
        );
      }

      // Validate minimum interval if required
      if (vaccine.intervalDays && vaccine.intervalDays > 0) {
        const previousDoseScheduling = previousSchedulings.find(
          (s) => s.doseNumber === data.doseNumber! - 1 && !s.deletedAt,
        );

        if (previousDoseScheduling) {
          const timeDifference =
            getCurrentTimestamp() -
            transformDateToTimestamp(previousDoseScheduling.scheduledDate);

          const daysSinceLastDose = Math.floor(
            timeDifference / MILLISECONDS_IN_A_DAY,
          );

          if (daysSinceLastDose < vaccine.intervalDays) {
            throw new MinimumIntervalNotMetError(
              vaccine.intervalDays,
              daysSinceLastDose,
            );
          }
        }
      }
    }

    // Auto-create scheduling for walk-in
    const scheduling = await this.vaccineSchedulingStore.create({
      userId: data.receivedById,
      vaccineId: data.vaccineId,
      doseNumber: data.doseNumber,
      scheduledDate: getCurrentDate(),
      status: 'COMPLETED', // Walk-in is immediately completed
      assignedNurseId: data.appliedById,
      notes: 'Walk-in application - auto-created scheduling',
    });

    // Create application linked to auto-created scheduling
    return this.vaccineApplicationStore.createApplicationAndDecrementStock({
      schedulingId: scheduling.id,
      appliedById: data.appliedById,
      batchId: data.batchId,
      applicationSite: data.applicationSite,
      observations: data.observations,
    });
  }

  /**
   * Get a single vaccine application by ID
   *
   * Authorization:
   * - EMPLOYEE: Can only see their own applications
   * - NURSE: Can see applications they performed + their own
   * - MANAGER: Can see all applications
   *
   * @param applicationId - ID of the application
   * @param requestingUserId - ID of the user requesting the data
   * @returns Vaccine application
   * @throws VaccineApplicationNotFoundError if not found
   * @throws ForbiddenError if not authorized
   */
  async getApplicationById(
    applicationId: string,
    requestingUserId: string,
  ): Promise<VaccineApplication> {
    const application =
      await this.vaccineApplicationStore.findById(applicationId);

    if (!application || application.deletedAt) {
      throw new VaccineApplicationNotFoundError(
        `Application with ID ${applicationId} not found`,
      );
    }

    // Authorization check
    await this.validateAccessToApplication(application, requestingUserId);

    return application;
  }

  /**
   * Get paginated list of vaccine applications with filters
   *
   * Authorization:
   * - EMPLOYEE: Can only see their own applications (userId filter forced)
   * - NURSE: Can see all applications
   * - MANAGER: Can see all applications
   *
   * @param params - Pagination parameters
   * @param filters - Filter parameters
   * @param requestingUserId - ID of the user requesting the data
   * @returns Paginated vaccine applications
   */
  async getPaginatedApplications(
    params: PaginationParams,
    requestingUserId: string,
    filters: VaccineApplicationFilterParams = {},
  ): Promise<PaginatedResponse<VaccineApplication>> {
    const role = await this.userService.getUserRole(requestingUserId);

    // Apply role-based filtering
    if (role === 'EMPLOYEE') {
      // Employees can only see their own applications
      filters.userId = requestingUserId;
    } else if (role === 'NURSE') {
      // Nurses can see applications they performed OR their own
      // If no filter specified, show both
      if (!filters.userId && !filters.appliedById) {
        // This would require OR logic in the store
        // For simplicity, we'll just allow the filters as-is
        // The nurse can use filters to narrow down results
      }
    }
    // MANAGER can see all without restrictions

    return this.vaccineApplicationStore.findPaginatedApplications(
      params,
      filters,
    );
  }

  /**
   * Update a vaccine application
   *
   * Business Rules:
   * - Only applicationSite and observations can be updated
   * - Only the nurse who applied it or a MANAGER can update
   *
   * @param applicationId - ID of the application to update
   * @param data - Update data
   * @param requestingUserId - ID of the user requesting the update
   * @returns Updated vaccine application
   * @throws VaccineApplicationNotFoundError if not found
   * @throws UnauthorizedApplicationUpdateError if not authorized
   */
  async updateApplication(
    applicationId: string,
    data: UpdateVaccineApplicationDTO,
    requestingUserId: string,
  ): Promise<VaccineApplication> {
    if (!Object.keys(data).length) {
      throw new ValidationError(
        'At least one field must be provided for update',
      );
    }

    // Get existing application
    const application =
      await this.vaccineApplicationStore.findById(applicationId);

    if (!application || application.deletedAt) {
      throw new VaccineApplicationNotFoundError(
        `Application with ID ${applicationId} not found`,
      );
    }

    // Authorization: Only the nurse who applied it or a MANAGER can update
    const role = await this.userService.getUserRole(requestingUserId);
    const isApplier = application.appliedById === requestingUserId;
    const isManager = role === 'MANAGER';

    if (!isApplier && !isManager) {
      throw new UnauthorizedApplicationUpdateError();
    }

    // Update only allowed fields
    const updateData: Partial<UpdateVaccineApplicationDTO> = {};

    if (data.applicationSite !== undefined) {
      updateData.applicationSite = normalizeText(data.applicationSite);
    }

    if (data.observations !== undefined) {
      updateData.observations = data.observations
        ? normalizeText(data.observations)
        : undefined;
    }

    return this.vaccineApplicationStore.update(applicationId, updateData);
  }

  /**
   * Get user's complete vaccination history with comprehensive statistics
   *
   * Returns vaccination card information including:
   * - Timestamp of when the card was generated
   * - Summary statistics (vaccines applied, completed, compliance percentage)
   * - Vaccines grouped by type with dose details and completion status
   * - Complete list of applied vaccines
   * - Mandatory vaccines not yet taken
   * - Pending doses with expected dates
   *
   * Authorization:
   * - EMPLOYEE: Can only view their own vaccination history
   * - NURSE/MANAGER: Can view any user's vaccination history
   *
   * @param userId - ID of the user whose history is being requested
   * @param requestingUserId - ID of the user requesting the data
   * @returns Comprehensive vaccination history with statistics and grouping
   * @throws ValidationError if employee tries to view another user's history
   */
  async getUserVaccinationHistory(
    userId: string,
    requestingUserId: string,
  ): Promise<VaccinationHistoryResponse> {
    const [requestingUser, _] = await Promise.all([
      this.userService.getUserById(requestingUserId, DEFAULT_USER_SYSTEM_ID),
      this.userService.getUserById(userId, DEFAULT_USER_SYSTEM_ID),
    ]);

    // Authorization: Employees can only view their own history
    if (requestingUserId !== userId) {
      if (requestingUser.role === 'EMPLOYEE') {
        throw new ValidationError(
          'Employees can only view their own vaccination history',
        );
      }
    }

    // Fetch all necessary data in parallel
    const [appliedVaccines, mandatoryNotTakenVaccines] = await Promise.all([
      this.vaccineApplicationStore.findByUserId(userId),
      this.vaccineStore.findMandatoryVaccinesNotTakenByUser(userId),
    ]);

    // Build a map of vaccines with their current dose status
    const vaccinesWithMissingDoses = appliedVaccines.reduce(
      (acc, app) => {
        if (!app.scheduling) return acc; // Skip if scheduling is null (shouldn't happen)

        const key = app.scheduling.vaccineId;

        if (!acc[key]) {
          acc[key] = {
            vaccine: app.scheduling.vaccine,
            lastDose: app.scheduling.doseNumber,
            lastDate: app.applicationDate,
          };
        } else if (app.scheduling.doseNumber > acc[key].lastDose) {
          acc[key].lastDose = app.scheduling.doseNumber;
          acc[key].lastDate = app.applicationDate;
        }

        return acc;
      },
      {} as Record<
        string,
        {
          vaccine: NonNullable<VaccineApplicationWithRelations['scheduling']>['vaccine'];
          lastDose: number;
          lastDate: Date;
        }
      >,
    );

    // Calculate pending doses (vaccines started but not completed)
    const pendingDoses = Object.values(vaccinesWithMissingDoses)
      .filter((v) => v.lastDose < v.vaccine.dosesRequired)
      .map((v) => ({
        vaccine: v.vaccine,
        currentDose: v.lastDose,
        nextDose: v.lastDose + 1,
        expectedDate: v.vaccine.intervalDays
          ? new Date(
              v.lastDate.getTime() +
                v.vaccine.intervalDays * MILLISECONDS_IN_A_DAY,
            )
          : null,
      }));

    // Group applied vaccines by vaccine type with all doses and completion status
    const vaccinesByTypeMap = appliedVaccines.reduce(
      (acc, app) => {
        if (!app.scheduling) return acc; // Skip if scheduling is null (shouldn't happen)

        const key = app.scheduling.vaccineId;

        if (!acc[key]) {
          acc[key] = {
            vaccine: app.scheduling.vaccine,
            doses: [],
            totalDosesRequired: app.scheduling.vaccine.dosesRequired,
            dosesApplied: 0,
          };
        }

        acc[key].doses.push(app);
        acc[key].dosesApplied++;

        return acc;
      },
      {} as Record<
        string,
        {
          vaccine: NonNullable<VaccineApplicationWithRelations['scheduling']>['vaccine'];
          doses: VaccineApplicationWithRelations[];
          totalDosesRequired: number;
          dosesApplied: number;
        }
      >,
    );

    // Transform map to array and calculate completion metrics
    const vaccinesByType = Object.values(vaccinesByTypeMap).map((item) => {
      // Sort doses chronologically (earliest first)
      const sortedDoses = item.doses.sort(
        (a, b) =>
          new Date(a.applicationDate).getTime() -
          new Date(b.applicationDate).getTime(),
      );

      const isComplete = item.dosesApplied >= item.totalDosesRequired;
      const completionPercentage =
        (item.dosesApplied / item.totalDosesRequired) * 100;

      return {
        vaccine: item.vaccine,
        doses: sortedDoses,
        isComplete,
        completionPercentage: Math.min(completionPercentage, 100), // Cap at 100%
        totalDosesRequired: item.totalDosesRequired,
        dosesApplied: item.dosesApplied,
      };
    });

    // Calculate summary statistics
    const totalVaccinesApplied = vaccinesByType.length;

    const totalVaccinesCompleted = vaccinesByType.filter(
      (v) => v.isComplete,
    ).length;

    const totalMandatoryPending = mandatoryNotTakenVaccines.length;

    const totalDosesPending = pendingDoses.length;

    // Calculate compliance percentage
    // Compliance is based on mandatory vaccines only
    // Formula: (mandatory vaccines completed / total mandatory vaccines) * 100

    // First: count mandatory vaccines that are fully completed
    const mandatoryVaccinesCompleted = vaccinesByType.filter(
      (v) => v.isComplete && v.vaccine.isObligatory,
    ).length;

    // Then: calculate total mandatory vaccines (completed + pending + partially completed)
    const totalMandatoryVaccines =
      mandatoryVaccinesCompleted +
      totalMandatoryPending +
      // Count partially completed mandatory vaccines
      vaccinesByType.filter((v) => !v.isComplete && v.vaccine.isObligatory)
        .length;

    const compliancePercentage =
      totalMandatoryVaccines > 0
        ? (mandatoryVaccinesCompleted / totalMandatoryVaccines) * 100
        : 100; // If no mandatory vaccines exist, compliance is 100%

    return {
      issuedAt: new Date(),
      summary: {
        totalVaccinesApplied,
        totalVaccinesCompleted,
        totalMandatoryPending,
        totalDosesPending,
        compliancePercentage: Math.round(compliancePercentage * 100) / 100, // Round to 2 decimal places
      },
      vaccinesByType,
      applied: appliedVaccines,
      mandatoryNotTaken: mandatoryNotTakenVaccines,
      pendingDoses,
    };
  }

  /**
   * Validate user has access to view an application
   * @private
   */
  private async validateAccessToApplication(
    application: VaccineApplication,
    requestingUserId: string,
  ): Promise<void> {
    const role = await this.userService.getUserRole(requestingUserId);

    if (role === 'MANAGER') {
      return; // Managers can see everything
    }

    // Fetch scheduling to get userId (application no longer has userId directly)
    const scheduling = await this.vaccineSchedulingStore.findById(
      application.schedulingId,
    );

    if (!scheduling) {
      throw new ValidationError('Associated scheduling not found');
    }

    if (role === 'NURSE') {
      // Nurses can see applications they performed or their own
      if (
        application.appliedById === requestingUserId ||
        scheduling.userId === requestingUserId
      ) {
        return;
      }
    }

    if (role === 'EMPLOYEE') {
      // Employees can only see their own
      if (scheduling.userId === requestingUserId) {
        return;
      }
    }

    throw new ValidationError('You do not have access to this application');
  }
}
