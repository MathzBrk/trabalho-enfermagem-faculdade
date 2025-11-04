import type { CreateVaccineDTO } from '@shared/models/vaccine';
import type { NextFunction, Request, Response } from 'express';
import { injectable } from 'tsyringe';
// biome-ignore lint/style/useImportType: I need to import types this way because of TSyringe
import { VaccineService } from '../services/vaccineService';

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
}
