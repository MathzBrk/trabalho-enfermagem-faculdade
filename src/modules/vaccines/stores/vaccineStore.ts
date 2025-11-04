import type { Vaccine } from '@infrastructure/database';
import type { IVaccineStore } from '@shared/interfaces/vaccine';
import type {
  VaccineCreateInput,
  VaccineDelegate,
  VaccineUpdateInput,
} from '@shared/models/vaccine';
import { BaseStore } from '@shared/stores/baseStore';
import { injectable } from 'tsyringe';

/**
 * VaccineStore - Prisma-based implementation of IVaccineStore
 *
 * This is the production implementation that uses Prisma ORM for database operations.
 * Registered as singleton in DI container to maintain connection pooling and caching.
 *
 * Inherits basic CRUD methods from BaseStore:
 * - findById(id)
 * - findAll()
 * - create(data)
 * - update(id, data)
 * - delete(id)
 * - softDelete(id)
 * - count(where?)
 * - exists(where)
 *
 * And adds Vaccine-specific methods
 */

@injectable()
export class VaccineStore
  extends BaseStore<
    Vaccine,
    VaccineDelegate,
    VaccineCreateInput,
    VaccineUpdateInput
  >
  implements IVaccineStore
{
  // Defines the model to be used by the base class
  protected readonly model = this.prisma.vaccine;

  /**
   * Finds vaccine by name
   *
   * @param name - Vaccine's name
   * @returns Vaccine or null if not found
   */
  async findByName(name: string): Promise<Vaccine | null> {
    return this.model.findFirst({
      where: { name },
    });
  }

  /**
   * Finds vaccine by name and manufacturer (case-insensitive)
   *
   * This method is used to check for duplicate vaccines before creation.
   * The search uses normalized values to ensure case-insensitive comparison.
   * Only returns non-deleted vaccines (deletedAt is null).
   *
   * @param name - Normalized vaccine name (should be pre-normalized by caller)
   * @param manufacturer - Normalized manufacturer name (should be pre-normalized by caller)
   * @returns Vaccine or null if not found
   */
  async findByNameAndManufacturer(
    name: string,
    manufacturer: string,
  ): Promise<Vaccine | null> {
    return this.model.findFirst({
      where: {
        name,
        manufacturer,
        deletedAt: null,
      },
    });
  }

  /**
   * Finds all vaccines by manufacturer
   *
   * @param manufacturer - Manufacturer name
   * @returns Array of vaccines from this manufacturer
   */
  async findAllByManufacturer(manufacturer: string): Promise<Vaccine[]> {
    return this.model.findMany({
      where: { manufacturer },
    });
  }

  /**
   * Finds all obligatory vaccines
   *
   * @returns Array of obligatory vaccines
   */
  async findObligatoryVaccines(): Promise<Vaccine[]> {
    return this.model.findMany({
      where: {
        isObligatory: true,
        deletedAt: null,
      },
    });
  }
}
