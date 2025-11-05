import { TOKENS } from '@infrastructure/di/tokens';
import { UserNotFoundError, ValidationError } from '@modules/user/errors';
import { VaccineAlreadyExistsError } from '@modules/vaccines/errors';
import { normalizeText } from '@shared/helpers/textHelper';
import type {
  PaginatedResponse,
  PaginationParams,
} from '@shared/interfaces/pagination';
import type { IUserStore } from '@shared/interfaces/user';
import type {
  IVaccineStore,
  VaccineFilterParams,
} from '@shared/interfaces/vaccine';
import type { UserRole } from '@shared/models/user';
import type { CreateVaccineDTO, Vaccine } from '@shared/models/vaccine';
import { inject, injectable } from 'tsyringe';

@injectable()
export class VaccineService {
  constructor(
    @inject(TOKENS.IVaccineStore) private readonly vaccineStore: IVaccineStore,
    @inject(TOKENS.IUserStore) private readonly userStore: IUserStore,
  ) {}

  async createVaccine(
    data: CreateVaccineDTO,
    userId: string,
  ): Promise<Vaccine> {
    // Validate user exists and has permissions
    const user = await this.userStore.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    if (user.role !== 'MANAGER') {
      throw new ValidationError('Only managers can create vaccines.');
    }

    // Normalize input values for consistent storage and comparison
    // This ensures case-insensitive uniqueness and removes extra whitespace
    const normalizedName = normalizeText(data.name);
    const normalizedManufacturer = normalizeText(data.manufacturer);

    // Validate that normalized values are not empty
    if (!normalizedName || !normalizedManufacturer) {
      throw new ValidationError(
        'Vaccine name and manufacturer cannot be empty.',
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

  async getPaginatedVaccines(
    pagination: PaginationParams,
    userId: string,
    filters?: VaccineFilterParams,
  ): Promise<PaginatedResponse<Vaccine>> {
    const user = await this.userStore.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

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
      data: this.transformVaccinesBasedOnUserRole(result.data, user.role),
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
