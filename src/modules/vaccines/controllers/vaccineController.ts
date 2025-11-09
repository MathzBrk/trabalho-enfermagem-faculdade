import type {
  CreateVaccineDTO,
  UpdateVaccineDTO,
} from '@shared/models/vaccine';
import type { NextFunction, Request, Response } from 'express';
import { injectable } from 'tsyringe';
// biome-ignore lint/style/useImportType: I need to import types this way because of TSyringe
import { VaccineService } from '../services/vaccineService';
import type { ListVaccinesQuery } from '../validators/listVaccinesValidator';
import type { VaccineFilterParams } from '@shared/interfaces/vaccine';
import type { ListVaccineBatchesQuery } from '../validators/listVaccineBatchesValidator';
import type { VaccineBatchFilterParams } from '@shared/interfaces/vaccineBatch';

@injectable()
export class VaccineController {
  constructor(private readonly vaccineService: VaccineService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        dosesRequired,
        isObligatory,
        manufacturer,
        name,
        description,
        intervalDays,
        minStockLevel,
      }: CreateVaccineDTO = req.body;

      const userId = req.user?.userId!;
      const newVaccine = await this.vaccineService.createVaccine(
        {
          dosesRequired,
          isObligatory,
          manufacturer,
          name,
          description,
          intervalDays,
          minStockLevel,
        },
        userId,
      );
      res.status(201).json(newVaccine);
    } catch (error) {
      next(error);
    }
  }

  async getPaginatedVaccines(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { isObligatory, page, perPage, manufacturer, sortBy, sortOrder } =
        req.query as unknown as ListVaccinesQuery;

      const userId = req.user?.userId!;

      const filters: VaccineFilterParams = {};
      if (manufacturer) {
        filters.manufacturer = manufacturer;
      }
      if (isObligatory !== undefined) {
        filters.isObligatory = isObligatory;
      }

      const paginatedVaccines = await this.vaccineService.getPaginatedVaccines(
        { page, perPage, sortBy, sortOrder },
        userId,
        Object.keys(filters).length ? filters : undefined,
      );

      res.status(200).json(paginatedVaccines);
    } catch (error) {
      next(error);
    }
  }

  async getById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { include } = req.query;
      const userId = req.user?.userId!;

      const includeBatches = include === 'batches';

      const vaccine = await this.vaccineService.getVaccineById(
        id,
        userId,
        includeBatches,
      );

      res.status(200).json(vaccine);
    } catch (error) {
      next(error);
    }
  }

  async getVaccineBatches(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const {
        page,
        perPage,
        sortBy,
        sortOrder,
        status,
        expiringBefore,
        expiringAfter,
        minQuantity,
      } = req.query as unknown as ListVaccineBatchesQuery;

      const userId = req.user?.userId!;

      const filters: Partial<VaccineBatchFilterParams> = {};
      if (status) {
        filters.status = status;
      }
      if (expiringBefore) {
        filters.expiringBefore = new Date(expiringBefore);
      }
      if (expiringAfter) {
        filters.expiringAfter = new Date(expiringAfter);
      }
      if (minQuantity !== undefined) {
        filters.minQuantity = minQuantity;
      }

      const paginatedBatches = await this.vaccineService.getVaccineBatches(
        id,
        userId,
        { page, perPage, sortBy, sortOrder },
        Object.keys(filters).length ? filters : undefined,
      );

      res.status(200).json(paginatedBatches);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateVaccineDTO = req.body;
      const userId = req.user?.userId!;

      const updatedVaccine = await this.vaccineService.updateVaccine(
        id,
        data,
        userId,
      );

      res.status(200).json(updatedVaccine);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId!;

      await this.vaccineService.deleteVaccine(id, userId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
