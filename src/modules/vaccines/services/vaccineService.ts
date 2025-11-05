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
import type { CreateVaccineDTO, Vaccine } from '@shared/models/vaccine';
import { inject, injectable } from 'tsyringe';

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
