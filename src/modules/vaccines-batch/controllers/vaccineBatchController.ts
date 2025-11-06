import type { CreateVaccineBatchDTO } from '@shared/models/vaccineBatch';
import type { NextFunction, Request, Response } from 'express';
import { injectable } from 'tsyringe';
// biome-ignore lint/style/useImportType: I need to import types this way because of TSyringe
import { VaccineBatchService } from '../services/vaccineBatchService';

@injectable()
export class VaccineBatchController {
  constructor(private readonly vaccineBatchService: VaccineBatchService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateVaccineBatchDTO = req.body;

      const userId = req.user?.userId!;
      const newVaccineBatch = await this.vaccineBatchService.createVaccineBatch(
        data,
        userId,
      );
      res.status(201).json(newVaccineBatch);
    } catch (error) {
      next(error);
    }
  }
}
