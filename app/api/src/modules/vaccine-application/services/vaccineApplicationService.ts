import { TOKENS } from '@infrastructure/di/tokens';
import {
  EventNames,
  type IEventBus,
  type VaccineAppliedEvent,
} from '@modules/notifications/contracts';
import { UserNotFoundError, ValidationError } from '@modules/user/errors';
import type {
  CreateVaccineApplicationDTO,
  ScheduledApplicationDTO,
  WalkInApplicationDTO,
} from '@modules/vaccine-application/validators/createVaccineApplicationValidator';
import { isScheduledApplication } from '@modules/vaccine-application/validators/createVaccineApplicationValidator';
import type { UpdateVaccineApplicationDTO } from '@modules/vaccine-application/validators/updateVaccineApplicationValidator';
import { VaccineBatchNotFoundError } from '@modules/vaccine-batch/errors';
import { VaccineSchedulingNotFoundError } from '@modules/vaccine-scheduling';
import { VaccineNotFoundError } from '@modules/vaccines/errors';
import { normalizeText } from '@shared/helpers/textHelper';
import {
  MILLISECONDS_IN_A_DAY,
  getCurrentDate,
  getCurrentTimestamp,
  transformDateToTimestamp,
} from '@shared/helpers/timeHelper';
import type {
  PaginatedResponse,
  PaginationParams,
} from '@shared/interfaces/pagination';
import type { IUserStore } from '@shared/interfaces/user';
import type { IVaccineStore } from '@shared/interfaces/vaccine';
import type {
  IVaccineApplicationStore,
  VaccineApplicationFilterParams,
} from '@shared/interfaces/vaccineApplication';
import type { IVaccineBatchStore } from '@shared/interfaces/vaccineBatch';
import type { IVaccineSchedulingStore } from '@shared/interfaces/vaccineScheduling';
import type { User } from '@shared/models/user';
import type { Vaccine } from '@shared/models/vaccine';
import type {
  VaccineApplication,
  VaccineApplicationWithRelations,
} from '@shared/models/vaccineApplication';
import type { VaccineBatch } from '@shared/models/vaccineBatch';
import { inject, injectable } from 'tsyringe';
import {
  BatchNotAvailableError,
  DuplicateDoseError,
  ExceededRequiredDosesError,
  InsufficientBatchQuantityError,
  InvalidDoseSequenceError,
  MinimumIntervalNotMetError,
  UnauthorizedApplicationUpdateError,
  VaccineApplicationNotFoundError,
} from '../errors';
import type { ValidateApplicationDataParams } from '../types';

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
    @inject(TOKENS.IVaccineSchedulingStore)
    private readonly vaccineSchedulingStore: IVaccineSchedulingStore,
    @inject(TOKENS.IUserStore)
    private readonly userStore: IUserStore,
    @inject(TOKENS.IVaccineStore)
    private readonly vaccineStore: IVaccineStore,
    @inject(TOKENS.IVaccineBatchStore)
    private readonly vaccineBatchStore: IVaccineBatchStore,
    @inject(TOKENS.IEventBus)
    private readonly eventBus: IEventBus,
  ) {}

  /**
   * Creates a new vaccine application
   *
   * Business Rules:
   * - Requesting user (who initiates the registration) must be NURSE or MANAGER
   * - Applicator (who physically applies the vaccine) must be NURSE
   * - Applicator and receiver must be different people
   * - Receiver (patient) must exist and be active
   * - Vaccine must exist and not be deleted
   * - Batch must exist, be AVAILABLE, and have sufficient quantity
   * - Batch must not be expired
   * - Cannot apply duplicate dose (receivedById + vaccineId + doseNumber must be unique)
   * - Dose number must not exceed vaccine.dosesRequired
   * - Previous doses must be applied before current dose (sequential validation)
   * - If vaccine has intervalDays, minimum interval must be met since last dose
   * - Batch quantity is decremented atomically in a transaction
   *
   * Authorization:
   * - Requesting user: NURSE or MANAGER can initiate vaccine application registration
   * - Applicator: Only NURSE can be the one who physically applies the vaccine
   *
   * @param data - Vaccine application creation data including receivedById and appliedById
   * @param requestingUserId - ID of the user initiating the registration (from req.user)
   * @returns Created vaccine application with all related data
   * @throws ValidationError if requesting user is not NURSE or MANAGER
   * @throws ValidationError if applicator is not NURSE
   * @throws ValidationError if applicator and receiver are the same person
   * @throws UserNotFoundError if receiver not found
   * @throws VaccineNotFoundError if vaccine not found or deleted
   * @throws VaccineBatchNotFoundError if batch not found or deleted
   * @throws ValidationError if batch does not belong to the specified vaccine
   * @throws BatchNotAvailableError if batch status is not AVAILABLE
   * @throws InsufficientBatchQuantityError if batch has no remaining doses
   * @throws BatchNotAvailableError if batch has expired
   * @throws ExceededRequiredDosesError if dose number exceeds vaccine.dosesRequired
   * @throws DuplicateDoseError if the same dose was already applied to this user
   * @throws InvalidDoseSequenceError if previous doses haven't been applied yet
   * @throws MinimumIntervalNotMetError if minimum interval not met since last dose
   */
  async createApplication(
    data: CreateVaccineApplicationDTO,
    requestingUserId: string,
  ): Promise<VaccineApplication> {
    const [requestingUser, batch] = await Promise.all([
      this.userStore.findById(requestingUserId),
      this.vaccineBatchStore.findById(data.batchId),
    ]);

    if (!requestingUser) {
      throw new UserNotFoundError(`User with ID ${requestingUserId} not found`);
    }

    if (requestingUser.role !== 'NURSE' && requestingUser.role !== 'MANAGER') {
      throw new ValidationError(
        'Only users with NURSE or MANAGER role can register vaccines',
      );
    }

    if (!batch || batch.deletedAt) {
      throw new VaccineBatchNotFoundError(
        `Batch with ID ${data.batchId} not found`,
      );
    }

    let application: VaccineApplication;

    if (isScheduledApplication(data)) {
      application = await this.createApplicationWithExistingScheduling(
        data,
        batch,
        requestingUser,
      );
    } else {
      application = await this.createWalkInApplication(
        data,
        batch,
        requestingUser,
      );
    }

    await this.eventBus.emit<VaccineAppliedEvent>(EventNames.VACCINE_APPLIED, {
      channels: ['in-app'],
      type: EventNames.VACCINE_APPLIED,
      priority: 'normal',
      data: {
        applicationId: application.id,
        receiverId: application.userId,
        vaccineId: application.vaccineId,
        doseNumber: application.doseNumber,
        appliedById: application.appliedById,
        batchId: batch.id,
      },
    });

    return application;
  }

  async createApplicationWithExistingScheduling(
    data: ScheduledApplicationDTO,
    batch: VaccineBatch,
    requestingUser: User,
  ): Promise<VaccineApplication> {
    const { applicationSite, observations, schedulingId } = data;
    const scheduling =
      await this.vaccineSchedulingStore.findByIdWithRelations(schedulingId);

    if (!scheduling || scheduling.deletedAt) {
      throw new VaccineSchedulingNotFoundError(
        `Scheduling with ID ${schedulingId} not found`,
      );
    }

    if (
      scheduling.status === 'CANCELLED' ||
      scheduling.status === 'COMPLETED'
    ) {
      throw new ValidationError(
        `Scheduling with ID ${schedulingId} is not in a valid state`,
      );
    }

    await this.validateApplicationData({
      applicator: requestingUser,
      receiver: scheduling.user,
      batch,
      vaccine: scheduling.vaccine,
      doseNumber: scheduling.doseNumber,
    });

    return this.vaccineApplicationStore.createApplicationAndDecrementStock({
      receivedById: scheduling.userId,
      appliedById: scheduling.assignedNurseId
        ? scheduling.assignedNurseId
        : requestingUser.id,
      applicationDate: getCurrentDate(),
      vaccineId: scheduling.vaccineId,
      batchId: batch.id,
      doseNumber: scheduling.doseNumber,
      applicationSite: normalizeText(applicationSite),
      observations: observations ? normalizeText(observations) : undefined,
      schedulingId: scheduling.id,
    });
  }

  async createWalkInApplication(
    data: WalkInApplicationDTO,
    batch: VaccineBatch,
    requestingUser: User,
  ): Promise<VaccineApplication> {
    const {
      receivedById,
      vaccineId,
      doseNumber,
      batchId,
      applicationSite,
      observations,
    } = data;
    const [receiver, vaccine] = await Promise.all([
      this.userStore.findById(receivedById),
      this.vaccineStore.findById(vaccineId),
    ]);

    if (!receiver) {
      throw new UserNotFoundError(`User with ID ${receivedById} not found`);
    }

    if (!vaccine || vaccine.deletedAt) {
      throw new VaccineNotFoundError(`Vaccine with ID ${vaccineId} not found`);
    }

    await this.validateApplicationData({
      applicator: requestingUser,
      receiver,
      batch,
      vaccine,
      doseNumber,
    });

    return this.vaccineApplicationStore.createApplicationAndDecrementStock({
      receivedById,
      appliedById: requestingUser.id,
      applicationDate: getCurrentDate(),
      vaccineId,
      batchId,
      doseNumber,
      applicationSite: normalizeText(applicationSite),
      observations: observations ? normalizeText(observations) : undefined,
    });
  }

  private async validateApplicationData({
    applicator,
    receiver,
    batch,
    vaccine,
    doseNumber,
  }: ValidateApplicationDataParams): Promise<void> {
    if (applicator.role !== 'NURSE') {
      throw new ValidationError(
        'Only users with NURSE role can apply vaccines',
      );
    }

    if (applicator.id === receiver.id) {
      throw new ValidationError(
        'The applicator and the receiver cannot be the same person',
      );
    }

    if (!receiver.isActive || !applicator.isActive) {
      throw new ValidationError(
        'Both applicator and receiver must be active users',
      );
    }

    if (batch.vaccineId !== vaccine.id) {
      throw new ValidationError(
        `Batch ${batch.batchNumber} is not compatible with vaccine ${vaccine.id}`,
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
    if (doseNumber > vaccine.dosesRequired) {
      throw new ExceededRequiredDosesError(vaccine.id, vaccine.dosesRequired);
    }
    const isDuplicate =
      await this.vaccineApplicationStore.existsByUserVaccineDose(
        receiver.id,
        vaccine.id,
        doseNumber,
      );
    if (isDuplicate) {
      throw new DuplicateDoseError(receiver.id, vaccine.id, doseNumber);
    }
    if (doseNumber > 1) {
      const previousDoseExists =
        await this.vaccineApplicationStore.existsByUserVaccineDose(
          receiver.id,
          vaccine.id,
          doseNumber - 1,
        );
      if (!previousDoseExists) {
        throw new InvalidDoseSequenceError(
          `Dose ${doseNumber - 1} must be applied before dose ${doseNumber}`,
        );
      }
    }
    if (vaccine.intervalDays && vaccine.intervalDays > 0 && doseNumber > 1) {
      const latestApplication =
        await this.vaccineApplicationStore.findLatestApplicationForUserVaccine(
          receiver.id,
          vaccine.id,
        );
      if (latestApplication) {
        const timeDifference =
          getCurrentTimestamp() -
          transformDateToTimestamp(latestApplication.applicationDate);
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
    const user = await this.userStore.findById(requestingUserId);
    if (!user) {
      throw new UserNotFoundError(`User with ID ${requestingUserId} not found`);
    }
    const role = user.role;

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
    const user = await this.userStore.findById(requestingUserId);
    if (!user) {
      throw new UserNotFoundError(`User with ID ${requestingUserId} not found`);
    }
    const role = user.role;

    // Authorization: Only the nurse who applied it or a MANAGER can update
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
      this.userStore.findById(requestingUserId),
      this.userStore.findById(userId),
    ]);

    if (!requestingUser) {
      throw new UserNotFoundError(`User with ID ${requestingUserId} not found`);
    }

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
        const key = app.vaccineId;

        if (!acc[key]) {
          acc[key] = {
            vaccine: app.vaccine,
            lastDose: app.doseNumber,
            lastDate: app.applicationDate,
          };
        } else if (app.doseNumber > acc[key].lastDose) {
          acc[key].lastDose = app.doseNumber;
          acc[key].lastDate = app.applicationDate;
        }

        return acc;
      },
      {} as Record<
        string,
        {
          vaccine: VaccineApplicationWithRelations['vaccine'];
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
        const key = app.vaccineId;

        if (!acc[key]) {
          acc[key] = {
            vaccine: app.vaccine,
            doses: [],
            totalDosesRequired: app.vaccine.dosesRequired,
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
          vaccine: VaccineApplicationWithRelations['vaccine'];
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
    const user = await this.userStore.findById(requestingUserId);
    if (!user) {
      throw new UserNotFoundError(`User with ID ${requestingUserId} not found`);
    }
    const role = user.role;

    if (role === 'MANAGER') {
      return; // Managers can see everything
    }

    if (role === 'NURSE') {
      // Nurses can see applications they performed or their own
      if (
        application.appliedById === requestingUserId ||
        application.userId === requestingUserId
      ) {
        return;
      }
    }

    if (role === 'EMPLOYEE') {
      // Employees can only see their own
      if (application.userId === requestingUserId) {
        return;
      }
    }

    throw new ValidationError('You do not have access to this application');
  }
}
