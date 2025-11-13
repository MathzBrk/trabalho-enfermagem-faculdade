import { TOKENS } from '@infrastructure/di/tokens';
import type { UserService } from '@modules/user/services/userService';
import { ValidationError } from '@modules/user/errors';
import type {
  IVaccineSchedulingStore,
  VaccineSchedulingFilterParams,
} from '@shared/interfaces/vaccineScheduling';
import type {
  VaccineScheduling,
  VaccineSchedulingWithRelations,
  CreateVaccineSchedulingDTO,
  UpdateVaccineSchedulingDTO,
} from '@shared/models/vaccineScheduling';
import type { IVaccineStore } from '@shared/interfaces/vaccine';
import { inject, injectable } from 'tsyringe';
import {
  VaccineSchedulingNotFoundError,
  UnauthorizedSchedulingAccessError,
  InvalidSchedulingDateError,
  SchedulingAlreadyCompletedError,
  InvalidDoseNumberError,
  DuplicateSchedulingError,
  MissingPreviousDoseError,
} from '../errors';
import { VaccineNotFoundError } from '@modules/vaccines/errors';
import { DEFAULT_USER_SYSTEM_ID } from '@modules/user/constants';
import {
  getCurrentDate,
  getDate,
  getDifferenceBetweenDatesInDays,
} from '@shared/helpers/timeHelper';

/**
 * VaccineSchedulingService - Service layer for vaccine scheduling business logic
 *
 * Responsible for:
 * - Vaccine scheduling CRUD operations with comprehensive validation
 * - Authorization based on user roles (EMPLOYEE/NURSE can only manage their own, MANAGER can manage all)
 * - Business rules enforcement (future dates, dose validation, etc.)
 * - Date validation to ensure scheduled dates are in the future
 *
 * Architecture:
 * - Depends on UserService for authorization
 * - Uses VaccineSchedulingStore for database operations
 * - Uses VaccineStore for vaccine validation
 */
@injectable()
export class VaccineSchedulingService {
  constructor(
    @inject(TOKENS.IVaccineSchedulingStore)
    private readonly vaccineSchedulingStore: IVaccineSchedulingStore,
    @inject(TOKENS.UserService)
    private readonly userService: UserService,
    @inject(TOKENS.IVaccineStore)
    private readonly vaccineStore: IVaccineStore,
  ) {}

  /**
   * Creates a new vaccine scheduling
   *
   * Business Rules:
   * - MANAGER can create scheduling for any user
   * - EMPLOYEE/NURSE can only create scheduling for themselves
   * - Vaccine must exist and not be deleted
   * - User (patient) must exist and be active
   * - Scheduled date must be in the future
   * - Dose number must not exceed vaccine.doses
   * - Cannot create duplicate scheduling for same user + vaccine + dose (with status SCHEDULED or CONFIRMED)
   *
   * Authorization:
   * - MANAGER: Can create for any userId
   * - EMPLOYEE/NURSE: Can only create for themselves (userId must match requestingUserId)
   *
   * @param data - Vaccine scheduling creation data
   * @param requestingUserId - ID of the user initiating the request (from req.user)
   * @returns Created vaccine scheduling
   * @throws ValidationError if EMPLOYEE/NURSE tries to create for another user
   * @throws VaccineNotFoundError if vaccine not found or deleted
   * @throws UserNotFoundError if user not found
   * @throws InvalidSchedulingDateError if date is not in the future
   * @throws MissingPreviousDoseError if previous dose is not scheduled
   * @throws DuplicateSchedulingError if scheduling already exists
   */
  async createScheduling(
    data: CreateVaccineSchedulingDTO,
    requestingUserId: string,
  ): Promise<VaccineScheduling> {
    // Fetch requesting user and validate existence in parallel
    const [requestingUser, vaccine, _] = await Promise.all([
      this.userService.getUserById(requestingUserId, DEFAULT_USER_SYSTEM_ID),
      this.vaccineStore.findById(data.vaccineId),
      this.userService.validateUserExists(data.userId),
    ]);

    // Authorization: Non-MANAGER can only create for themselves
    if (requestingUser.role !== 'MANAGER' && data.userId !== requestingUserId) {
      throw new ValidationError(
        'You can only create vaccine schedules for yourself',
      );
    }

    // Validate vaccine exists
    if (!vaccine || vaccine.deletedAt) {
      throw new VaccineNotFoundError(
        `Vaccine with ID ${data.vaccineId} not found`,
      );
    }

    const vaccineSchedulingsForVaccine =
      await this.vaccineSchedulingStore.findByVaccineId(data.vaccineId);

    const activeSchedulings = vaccineSchedulingsForVaccine.filter(
      (scheduling) =>
        scheduling.status === 'SCHEDULED' || scheduling.status === 'CONFIRMED',
    );

    const dosesReserved = activeSchedulings.length;

    const availableDoses = vaccine.totalStock - dosesReserved;

    if (availableDoses <= 0) {
      throw new ValidationError(
        `No available doses for vaccine ID ${data.vaccineId}`,
      );
    }
    // Validate scheduled date is in the future
    const scheduledDate = getDate(data.scheduledDate);
    const now = getCurrentDate();
    if (scheduledDate <= now) {
      throw new InvalidSchedulingDateError(
        'Scheduled date must be in the future',
      );
    }

    // Validate dose number doesn't exceed vaccine doses
    if (data.doseNumber > vaccine.dosesRequired) {
      throw new InvalidDoseNumberError(data.vaccineId, vaccine.dosesRequired);
    }

    // Check for duplicate scheduling (same user + vaccine + dose with active status)
    const duplicateExists =
      await this.vaccineSchedulingStore.existsByUserVaccineDose(
        data.userId,
        data.vaccineId,
        data.doseNumber,
      );

    if (duplicateExists) {
      throw new DuplicateSchedulingError(
        `An active scheduling for dose ${data.doseNumber} of this vaccine already exists`,
      );
    }

    if (data.doseNumber > 1) {
      const vaccineSchedulings =
        await this.vaccineSchedulingStore.findByUserAndVaccine(
          data.userId,
          data.vaccineId,
        );

      const previousDose = vaccineSchedulings.find(
        (scheduling) =>
          scheduling.doseNumber === data.doseNumber - 1 &&
          scheduling.status !== 'CANCELLED',
      );

      if (!previousDose) {
        throw new MissingPreviousDoseError(
          `Previous dose ${data.doseNumber - 1} must be scheduled before scheduling dose ${data.doseNumber}`,
        );
      }

      if (!vaccine.intervalDays) {
        throw new ValidationError(
          `Vaccine with ID ${data.vaccineId} does not have a valid intervalDays configured`,
        );
      }

      const differenceInDays = getDifferenceBetweenDatesInDays(
        previousDose.scheduledDate,
        scheduledDate,
      );

      if (differenceInDays < vaccine.intervalDays) {
        throw new InvalidSchedulingDateError(
          `Dose ${data.doseNumber} must be scheduled at least ${vaccine.intervalDays} days after dose ${
            data.doseNumber - 1
          }`,
        );
      }
    }

    // Create the scheduling
    return this.vaccineSchedulingStore.create({
      scheduledDate,
      doseNumber: data.doseNumber,
      notes: data.notes,
      status: 'SCHEDULED',
      userId: data.userId,
      vaccineId: data.vaccineId,
    });
  }

  /**
   * Retrieves a single scheduling by ID with relations
   *
   * Authorization:
   * - MANAGER: Can view any scheduling
   * - EMPLOYEE/NURSE: Can only view their own schedulings
   *
   * @param id - Scheduling ID
   * @param requestingUserId - ID of the user requesting
   * @returns Scheduling with user and vaccine relations
   * @throws VaccineSchedulingNotFoundError if not found
   * @throws UnauthorizedSchedulingAccessError if user doesn't have permission
   */
  async getSchedulingById(
    id: string,
    requestingUserId: string,
  ): Promise<VaccineSchedulingWithRelations> {
    const [requestingUser, scheduling] = await Promise.all([
      this.userService.getUserById(requestingUserId, DEFAULT_USER_SYSTEM_ID),
      this.vaccineSchedulingStore.findByIdWithRelations(id),
    ]);

    if (!scheduling) {
      throw new VaccineSchedulingNotFoundError();
    }

    // Authorization check
    const isOwner = scheduling.userId === requestingUserId;
    const isManager = requestingUser.role === 'MANAGER';

    if (!isOwner && !isManager) {
      throw new UnauthorizedSchedulingAccessError();
    }

    return scheduling;
  }

  /**
   * Retrieves paginated list of schedulings with filters
   *
   * Authorization:
   * - MANAGER: Can view all schedulings (no filter forced)
   * - EMPLOYEE/NURSE: Can only view their own schedulings (userId filter forced)
   *
   * @param params - Filter and pagination parameters
   * @param requestingUserId - ID of the user requesting
   * @returns Paginated schedulings with relations
   */
  async getSchedulings(
    filters: VaccineSchedulingFilterParams,
    page: number,
    limit: number,
    requestingUserId: string,
  ): Promise<{
    data: VaccineScheduling[];
    pagination: {
      page: number;
      perPage: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    // Get requesting user role
    const requestingUser = await this.userService.getUserById(
      requestingUserId,
      DEFAULT_USER_SYSTEM_ID,
    );

    // Apply row-level security for non-MANAGER users
    const filterParams: VaccineSchedulingFilterParams = { ...filters };
    if (requestingUser.role !== 'MANAGER') {
      filterParams.userId = requestingUserId;
    }

    return this.vaccineSchedulingStore.findPaginatedSchedulings(
      { page, perPage: limit },
      filterParams,
    );
  }

  /**
   * Updates a vaccine scheduling
   *
   * Business Rules:
   * - MANAGER can update any scheduling
   * - EMPLOYEE/NURSE can only update their own schedulings
   * - Cannot update if status is COMPLETED
   * - If changing scheduledDate, new date must be in the future
   * - Cannot update deleted schedulings
   *
   * Authorization:
   * - MANAGER: Can update any scheduling
   * - EMPLOYEE/NURSE: Can only update their own schedulings
   *
   * @param id - Scheduling ID to update
   * @param data - Update data (scheduledDate, notes, status)
   * @param requestingUserId - ID of the user requesting the update
   * @returns Updated scheduling
   * @throws VaccineSchedulingNotFoundError if not found
   * @throws UnauthorizedSchedulingAccessError if user doesn't have permission
   * @throws SchedulingAlreadyCompletedError if status is COMPLETED
   * @throws InvalidSchedulingDateError if new date is not in the future
   */
  async updateScheduling(
    id: string,
    data: UpdateVaccineSchedulingDTO,
    requestingUserId: string,
  ): Promise<VaccineScheduling> {
    // Get existing scheduling
    const scheduling = await this.vaccineSchedulingStore.findById(id);

    if (!scheduling || scheduling.deletedAt) {
      throw new VaccineSchedulingNotFoundError();
    }

    // Get requesting user role
    const requestingUser = await this.userService.getUserById(
      requestingUserId,
      DEFAULT_USER_SYSTEM_ID,
    );

    // Authorization check
    const isOwner = scheduling.userId === requestingUserId;
    const isManager = requestingUser.role === 'MANAGER';

    if (!isOwner && !isManager) {
      throw new UnauthorizedSchedulingAccessError();
    }

    // Business rule: Cannot update completed schedulings
    if (scheduling.status === 'COMPLETED') {
      throw new SchedulingAlreadyCompletedError();
    }

    // If changing date, validate it's in the future
    let scheduledDate: Date | undefined;
    if (data.scheduledDate) {
      const newDate = getDate(data.scheduledDate);
      const now = getCurrentDate();
      if (newDate <= now) {
        throw new InvalidSchedulingDateError(
          'New scheduled date must be in the future',
        );
      }
      scheduledDate = newDate;
    }

    // Update the scheduling
    return this.vaccineSchedulingStore.update(id, {
      scheduledDate,
      notes: data.notes,
      status: data.status,
    });
  }

  /**
   * Soft deletes a vaccine scheduling
   *
   * Sets deletedAt timestamp and changes status to CANCELLED
   *
   * Authorization:
   * - MANAGER: Can delete any scheduling
   * - EMPLOYEE/NURSE: Can only delete their own schedulings
   *
   * @param id - Scheduling ID to delete
   * @param requestingUserId - ID of the user requesting deletion
   * @returns Deleted scheduling
   * @throws VaccineSchedulingNotFoundError if not found
   * @throws UnauthorizedSchedulingAccessError if user doesn't have permission
   */
  async deleteScheduling(
    id: string,
    requestingUserId: string,
  ): Promise<VaccineScheduling> {
    // Get existing scheduling
    const scheduling = await this.vaccineSchedulingStore.findById(id);

    if (!scheduling || scheduling.deletedAt) {
      throw new VaccineSchedulingNotFoundError();
    }

    // Get requesting user role
    const requestingUser = await this.userService.getUserById(
      requestingUserId,
      DEFAULT_USER_SYSTEM_ID,
    );

    // Authorization check
    const isOwner = scheduling.userId === requestingUserId;
    const isManager = requestingUser.role === 'MANAGER';

    if (!isOwner && !isManager) {
      throw new UnauthorizedSchedulingAccessError();
    }

    // Soft delete the scheduling
    return this.vaccineSchedulingStore.update(id, {
      deletedAt: new Date(),
      status: 'CANCELLED',
    });
  }
}
