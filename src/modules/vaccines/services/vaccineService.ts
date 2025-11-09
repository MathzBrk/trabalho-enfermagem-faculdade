import { TOKENS } from '@infrastructure/di/tokens';
import { ValidationError } from '@modules/user/errors';
import type { UserService } from '@modules/user/services/userService';
import { VaccineAlreadyExistsError } from '@modules/vaccines/errors';
import { normalizeText } from '@shared/helpers/textHelper';
import type {
  PaginatedResponse,
  PaginationParams,
} from '@shared/interfaces/pagination';
import type {
  IVaccineStore,
  VaccineFilterParams,
} from '@shared/interfaces/vaccine';
import type { UserRole } from '@shared/models/user';
import type {
  CreateVaccineDTO,
  UpdateVaccineDTO,
  Vaccine,
} from '@shared/models/vaccine';
import { inject, injectable } from 'tsyringe';
import { VaccineNotFoundError } from '../errors';
import type { VaccineBatchService } from '@modules/vaccines-batch';

/**
 * VaccineService - Service layer for vaccine business logic
 *
 * Responsible for:
 * - Vaccine creation with validation and authorization
 * - Vaccine retrieval with role-based filtering
 * - Business rules enforcement
 * - Orchestrating store operations
 *
 * Architecture:
 * - Follows Service → Service communication pattern
 * - Depends on UserService (not IUserStore) for proper encapsulation
 * - Respects bounded contexts and DDD principles
 */
@injectable()
export class VaccineService {
  constructor(
    @inject(TOKENS.IVaccineStore) private readonly vaccineStore: IVaccineStore,
    @inject(TOKENS.UserService) private readonly userService: UserService,
    @inject(TOKENS.VaccineBatchService)
    private readonly vaccineBatchService: VaccineBatchService,
  ) {}

  /**
   * Creates a new vaccine in the system
   *
   * Business Rules:
   * - Only MANAGER role can create vaccines
   * - Vaccine name and manufacturer combination must be unique (case-insensitive)
   * - Name and manufacturer are normalized for consistent storage
   * - Tracks which user created the vaccine
   *
   * Authorization:
   * - Uses UserService.validateManagerRole() for encapsulated authorization
   *
   * @param data - Vaccine creation data
   * @param userId - ID of the user creating the vaccine
   * @returns Created vaccine object
   * @throws UserNotFoundError if user not found (from UserService)
   * @throws ForbiddenError if user is not MANAGER (from UserService)
   * @throws VaccineAlreadyExistsError if vaccine already exists
   *
   * @example
   * const vaccine = await vaccineService.createVaccine({
   *   name: "COVID-19",
   *   manufacturer: "Pfizer",
   *   dosesRequired: 2,
   *   isObligatory: true,
   *   intervalDays: 21,
   *   minStockLevel: 100
   * }, 'manager-user-id');
   */
  async createVaccine(
    data: CreateVaccineDTO,
    userId: string,
  ): Promise<Vaccine> {
    // Authorization: validate user exists and has MANAGER role
    // This delegates to UserService, respecting bounded contexts
    await this.userService.validateManagerRole(userId);

    // Normalize input values for consistent storage and comparison
    // This ensures case-insensitive uniqueness and removes extra whitespace
    const normalizedName = normalizeText(data.name);
    const normalizedManufacturer = normalizeText(data.manufacturer);

    // Validate that normalized values are not empty
    if (!normalizedName || !normalizedManufacturer) {
      throw new ValidationError(
        'Vaccine name and manufacturer cannot be empty or whitespace only.',
      );
    }

    // Check if vaccine already exists (case-insensitive, excluding soft-deleted)
    const existingVaccine = await this.vaccineStore.findByNameAndManufacturer(
      normalizedName,
      normalizedManufacturer,
    );

    if (existingVaccine) {
      // Throw specific error with original input for better UX
      throw new VaccineAlreadyExistsError(data.name, data.manufacturer);
    }

    // Create vaccine with normalized values
    // All vaccines are stored with consistent normalization for reliable querying
    const newVaccine = await this.vaccineStore.create({
      name: normalizedName,
      description: data.description,
      manufacturer: normalizedManufacturer,
      dosesRequired: data.dosesRequired,
      isObligatory: data.isObligatory,
      intervalDays: data.intervalDays,
      minStockLevel: data.minStockLevel,
      createdBy: {
        connect: { id: userId },
      },
    });

    return newVaccine;
  }

  /**
   * Retrieves paginated list of vaccines with optional filtering
   *
   * Business Rules:
   * - User must exist to retrieve vaccines
   * - Manufacturer filter is normalized for consistent querying
   * - Results can be transformed based on user role (future extensibility)
   *
   * Authorization:
   * - Uses UserService.getUserRole() to get user role for transformations
   *
   * @param pagination - Pagination parameters (page, perPage, sortBy, sortOrder)
   * @param userId - ID of the user requesting the vaccines
   * @param filters - Optional filter criteria (manufacturer, isObligatory, etc.)
   * @returns Paginated list of vaccines
   * @throws UserNotFoundError if user not found (from UserService)
   *
   * @example
   * const result = await vaccineService.getPaginatedVaccines(
   *   { page: 1, perPage: 20, sortBy: 'name', sortOrder: 'asc' },
   *   'user-id',
   *   { manufacturer: 'Pfizer', isObligatory: true }
   * );
   */
  async getPaginatedVaccines(
    pagination: PaginationParams,
    userId: string,
    filters?: VaccineFilterParams,
  ): Promise<PaginatedResponse<Vaccine>> {
    // Validate user exists and get role for potential transformations
    // This delegates to UserService, respecting bounded contexts
    const userRole = await this.userService.getUserRole(userId);

    // Normalize manufacturer filter for consistent querying
    const normalizedFilters = filters
      ? {
          ...filters,
          manufacturer: filters.manufacturer
            ? normalizeText(filters.manufacturer)
            : undefined,
        }
      : undefined;

    const result = await this.vaccineStore.findPaginatedVaccines(
      pagination,
      normalizedFilters,
    );

    return {
      data: this.transformVaccinesBasedOnUserRole(result.data, userRole),
      pagination: result.pagination,
    };
  }

  /**
   * Retrieves a single vaccine by ID
   *
   * Business Rules:
   * - User must exist to retrieve vaccine
   * - Returns vaccine if found and not deleted
   * - Throws error if vaccine not found or deleted
   *
   * Authorization:
   * - Any authenticated user can retrieve vaccines
   *
   * @param id - Vaccine UUID
   * @param userId - ID of the user requesting the vaccine
   * @returns Vaccine object
   * @throws UserNotFoundError if user not found (from UserService)
   * @throws VaccineNotFoundError if vaccine not found or deleted
   *
   * @example
   * const vaccine = await vaccineService.getVaccineById('vaccine-id', 'user-id');
   */
  async getVaccineById(id: string, userId: string): Promise<Vaccine> {
    // Validate user exists
    await this.userService.validateUserExists(userId);

    // Find vaccine by ID
    const vaccine = await this.vaccineStore.findById(id);

    // Check if vaccine exists and is not deleted
    if (!vaccine) {
      throw new VaccineNotFoundError(`Vaccine with ID ${id} not found`);
    }

    return vaccine;
  }

  /**
   * Updates an existing vaccine
   *
   * Business Rules:
   * - Only MANAGER role can update vaccines
   * - Vaccine must exist and not be deleted
   * - If name/manufacturer changed, must maintain uniqueness
   * - Name and manufacturer are normalized for consistency
   *
   * Authorization:
   * - Uses UserService.validateManagerRole() for encapsulated authorization
   *
   * @param id - Vaccine UUID
   * @param data - Update data with optional fields
   * @param userId - ID of the user updating the vaccine
   * @returns Updated vaccine object
   * @throws UserNotFoundError if user not found (from UserService)
   * @throws ForbiddenError if user is not MANAGER (from UserService)
   * @throws VaccineNotFoundError if vaccine not found or deleted
   * @throws VaccineAlreadyExistsError if update causes duplicate name+manufacturer
   *
   * @example
   * const updated = await vaccineService.updateVaccine(
   *   'vaccine-id',
   *   { minStockLevel: 200, description: 'Updated description' },
   *   'manager-user-id'
   * );
   */
  async updateVaccine(
    id: string,
    data: UpdateVaccineDTO,
    userId: string,
  ): Promise<Vaccine> {
    // Authorization: validate user exists and has MANAGER role
    await this.userService.validateManagerRole(userId);

    // Find existing vaccine and validate it exists
    const existingVaccine = await this.vaccineStore.findById(id);
    if (!existingVaccine || existingVaccine.deletedAt) {
      throw new VaccineNotFoundError(`Vaccine with ID ${id} not found`);
    }

    // Prepare update data with normalization
    const updateData: Record<string, any> = {};

    // Normalize name if provided
    if (data.name !== undefined) {
      const normalizedName = normalizeText(data.name);
      if (!normalizedName) {
        throw new ValidationError(
          'Vaccine name cannot be empty or whitespace only',
        );
      }
      updateData.name = normalizedName;
    }

    // Normalize manufacturer if provided
    if (data.manufacturer !== undefined) {
      const normalizedManufacturer = normalizeText(data.manufacturer);
      if (!normalizedManufacturer) {
        throw new ValidationError(
          'Manufacturer cannot be empty or whitespace only',
        );
      }
      updateData.manufacturer = normalizedManufacturer;
    }

    // Check for uniqueness if name or manufacturer changed
    if (updateData.name || updateData.manufacturer) {
      const nameToCheck = updateData.name || existingVaccine.name;
      const manufacturerToCheck =
        updateData.manufacturer || existingVaccine.manufacturer;

      // Only check if the combination actually changed
      if (
        nameToCheck !== existingVaccine.name ||
        manufacturerToCheck !== existingVaccine.manufacturer
      ) {
        const duplicate = await this.vaccineStore.findByNameAndManufacturer(
          nameToCheck,
          manufacturerToCheck,
        );

        if (duplicate && duplicate.id !== id) {
          throw new VaccineAlreadyExistsError(
            data.name || existingVaccine.name,
            data.manufacturer || existingVaccine.manufacturer,
          );
        }
      }
    }

    // Add other fields if provided
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.dosesRequired !== undefined) {
      updateData.dosesRequired = data.dosesRequired;
    }
    if (data.intervalDays !== undefined) {
      updateData.intervalDays = data.intervalDays;
    }
    if (data.isObligatory !== undefined) {
      updateData.isObligatory = data.isObligatory;
    }
    if (data.minStockLevel !== undefined) {
      updateData.minStockLevel = data.minStockLevel;
    }

    // Update vaccine
    const updatedVaccine = await this.vaccineStore.update(id, updateData);

    return updatedVaccine;
  }

  /**
   * Deletes a vaccine and all associated batches
   *
   * Business Rules:
   * - Only MANAGER role can delete vaccines
   * - Vaccine must exist
   * - Hard delete (permanently removes from database)
   * - Cascade delete: all vaccine batches are deleted first to maintain referential integrity
   *
   * Authorization:
   * - Uses UserService.validateManagerRole() for encapsulated authorization
   *
   * @param id - Vaccine UUID
   * @param userId - ID of the user deleting the vaccine
   * @throws UserNotFoundError if user not found (from UserService)
   * @throws ForbiddenError if user is not MANAGER (from UserService)
   * @throws VaccineNotFoundError if vaccine not found
   *
   * @example
   * await vaccineService.deleteVaccine('vaccine-id', 'manager-user-id');
   */
  async deleteVaccine(id: string, userId: string): Promise<void> {
    // Authorization: validate user exists and has MANAGER role
    await this.userService.validateManagerRole(userId);

    // Find vaccine and validate it exists
    const vaccine = await this.vaccineStore.findById(id);
    if (!vaccine) {
      throw new VaccineNotFoundError(`Vaccine with ID ${id} not found`);
    }

    // Find all batches associated with this vaccine
    const vaccineBatchs = await this.vaccineBatchService.findVaccineBatchs(id);

    // Delete all batches FIRST (to avoid foreign key constraint violation)
    if (vaccineBatchs.length > 0) {
      console.log(`Vaccine ${id} has ${vaccineBatchs.length} batches. Deleting them first...`);

      await Promise.all(
        vaccineBatchs.map(async (batch) => {
          console.log(`Deleting batch ${batch.id} of vaccine ${id}.`);
          await this.vaccineBatchService.deleteVaccineBatch(batch.id);
        }),
      );
    } else {
      console.log(`Vaccine ${id} has no batches.`);
    }

    // Now delete the vaccine (after all batches are deleted)
    await this.vaccineStore.delete(id);
    console.log(`Vaccine ${id} deleted successfully.`);
  }

  private transformVaccinesBasedOnUserRole(
    vaccines: Vaccine[],
    role: UserRole,
  ): Vaccine[] {
    console.log(`Transforming vaccines for role: ${role}`);
    // For now, all roles see the same data.
    // This method can be expanded in the future to tailor vaccine data
    // based on user roles (e.g., hide certain fields for specific roles).
    return vaccines;
  }
}
