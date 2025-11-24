import { TOKENS } from '@infrastructure/di/tokens';
import { EventNames, type VaccineScheduledEvent } from '@modules/notifications';
import { DEFAULT_USER_SYSTEM_ID } from '@modules/user/constants';
import { ForbiddenError, ValidationError } from '@modules/user/errors';
import type { UserService } from '@modules/user/services/userService';
import { VaccineNotFoundError } from '@modules/vaccines/errors';
import {
  createDate,
  formatDate,
  getCurrentDate,
  getDate,
  getDifferenceBetweenDatesInDays,
  getMonthDays,
} from '@shared/helpers/timeHelper';
import type { IEventBus } from '@shared/interfaces/eventBus';
import type { IVaccineStore } from '@shared/interfaces/vaccine';
import type {
  IVaccineSchedulingStore,
  VaccineSchedulingFilterParams,
} from '@shared/interfaces/vaccineScheduling';
import type { UserResponse } from '@shared/models/user';
import type {
  CreateVaccineSchedulingDTO,
  IntervalDateNurseScheduling,
  UpdateVaccineSchedulingDTO,
  VaccineScheduling,
  VaccineSchedulingWithRelations,
} from '@shared/models/vaccineScheduling';
import { inject, injectable } from 'tsyringe';
import {
  DuplicateSchedulingError,
  InvalidDoseNumberError,
  InvalidSchedulingDateError,
  MissingPreviousDoseError,
  SchedulingAlreadyCompletedError,
  UnauthorizedSchedulingAccessError,
  VaccineSchedulingNotFoundError,
} from '../errors';

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
    @inject(TOKENS.IEventBus)
    private readonly eventBus: IEventBus,
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
    // Fetch requesting user, patient, vaccine, and nurse in parallel

    const [patient, vaccine, nurse] = await Promise.all([
      this.userService.getUserById(requestingUserId, DEFAULT_USER_SYSTEM_ID),
      this.vaccineStore.findById(data.vaccineId),
      data.nurseId
        ? this.userService.getUserById(data.nurseId, DEFAULT_USER_SYSTEM_ID)
        : Promise.resolve(null),
    ]);

    if (nurse && nurse.role !== 'NURSE') {
      throw new ValidationError(
        'The assigned nurseId does not belong to a user with NURSE role',
      );
    }

    // Validate vaccine exists
    if (!vaccine || vaccine.deletedAt) {
      throw new VaccineNotFoundError(
        `Vaccine with ID ${data.vaccineId} not found`,
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
        patient.id,
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
          patient.id,
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

    // Create the scheduling with atomic stock validation
    // The store method handles stock validation atomically using pessimistic locking
    // to prevent race conditions where concurrent requests could both pass validation
    // and create schedulings, leading to overbooking
    const scheduling =
      await this.vaccineSchedulingStore.createSchedulingWithStockValidation(
        {
          scheduledDate,
          doseNumber: data.doseNumber,
          notes: data.notes,
          status: 'SCHEDULED',
          userId: patient.id,
          vaccineId: data.vaccineId,
          nurseId: nurse ? nurse.id : undefined,
        },
        data.vaccineId,
      );

    const usersInvolved: UserResponse[] = [];

    usersInvolved.push(patient);

    if (nurse) {
      usersInvolved.push(nurse);
    }

    await Promise.all(
      usersInvolved.map((user) => {
        try {
          this.eventBus.emit<VaccineScheduledEvent>(
            EventNames.VACCINE_SCHEDULED,
            {
              type: EventNames.VACCINE_SCHEDULED,
              channels: ['in-app'],
              data: {
                schedulingId: scheduling.id,
                patientId: patient.id,
                patientName: patient.name,
                patientEmail: patient.email,
                nurseId: nurse?.id,
                nurseName: nurse?.name,
                nurseEmail: nurse?.email,
                userRole: user.id === nurse?.id ? 'nurse' : 'patient',
                vaccineId: vaccine.id,
                vaccineName: vaccine.name,
                scheduledDate: scheduling.scheduledDate,
                doseNumber: scheduling.doseNumber,
              },
              priority: 'normal',
            },
          );
          console.log(
            `[VaccineSchedulingService] Emitted vaccine.scheduled event for user ${user.id}`,
          );
        } catch (error) {
          console.error(
            `[VaccineSchedulingService] Failed to emit vaccine.scheduled event for user ${user.id}:`,
            error,
          );
        }
      }),
    );

    return scheduling;
  }

  async getNurseSchedulingsDetailed(
    requestingUserId: string,
    intervalDate: IntervalDateNurseScheduling,
  ): Promise<Record<string, VaccineSchedulingWithRelations[]>> {
    const user = await this.userService.getUserById(
      requestingUserId,
      DEFAULT_USER_SYSTEM_ID,
    );

    if (user.role !== 'NURSE') {
      throw new ForbiddenError(
        `You are not a nurse and are not allowed to see nurse's schedulings`,
      );
    }

    const { year, month } = intervalDate;

    const currentYear = getCurrentDate().getFullYear();

    if (year > currentYear) {
      throw new ValidationError(
        `The year must not be in the future. Year received ${year} - Actual Year ${currentYear}`,
      );
    }

    const daysInMonth = getMonthDays(month, year);

    const response: Record<string, VaccineSchedulingWithRelations[]> = {};

    for (let i = 1; i <= daysInMonth; i++) {
      const date = createDate(i, month, year);
      const dateKey = formatDate(date, 'YYYY-MM-DD');

      const schedulingInDay =
        await this.vaccineSchedulingStore.getSchedulingsByDate(
          date,
          undefined,
          user.id,
        );

      response[dateKey] = schedulingInDay;
    }

    if (!Object.keys(response).length) {
      console.log(
        `User ${requestingUserId} doesn't have any scheduling in IntervalDate -> ${month + 1}/${year}`,
      );
    }

    return response;
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
    const [_, scheduling] = await Promise.all([
      this.userService.getUserById(requestingUserId, DEFAULT_USER_SYSTEM_ID),
      this.vaccineSchedulingStore.findByIdWithRelations(id),
    ]);

    if (!scheduling) {
      throw new VaccineSchedulingNotFoundError();
    }

    // Authorization check
    const isOwner = scheduling.userId === requestingUserId;

    if (!isOwner) {
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

  async getSchedulingsByDate(
    userId: string,
    date?: Date,
  ): Promise<VaccineSchedulingWithRelations[]> {
    const requestingUser = await this.userService.getUserById(
      userId,
      DEFAULT_USER_SYSTEM_ID,
    );

    if (requestingUser.role === 'EMPLOYEE') {
      throw new ForbiddenError(
        'EMPLOYEE users are not allowed to access vaccine schedulings by date',
      );
    }
    const dateToUse = date || getCurrentDate();

    return this.vaccineSchedulingStore.getSchedulingsByDate(dateToUse);
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

    if (data.nurseId) {
      await this.userService.getUserById(data.nurseId, DEFAULT_USER_SYSTEM_ID);
    }

    // Update the scheduling
    return this.vaccineSchedulingStore.update(id, {
      scheduledDate,
      notes: data.notes,
      status: data.status,
      nurseId: data.nurseId,
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
