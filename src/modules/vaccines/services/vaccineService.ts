import type { Vaccine } from '@infrastructure/database';
import { TOKENS } from '@infrastructure/di/tokens';
import { UserNotFoundError, ValidationError } from '@modules/user/errors';
import { VaccineAlreadyExistsError } from '@modules/vaccines/errors';
import {
  normalizeManufacturerName,
  normalizeVaccineName,
} from '@shared/helpers/textHelper';
import type { IUserStore } from '@shared/interfaces/user';
import type { IVaccineStore } from '@shared/interfaces/vaccine';
import type { CreateVaccineDTO } from '@shared/models/vaccine';
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
    const normalizedName = normalizeVaccineName(data.name);
    const normalizedManufacturer = normalizeManufacturerName(data.manufacturer);

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
}
