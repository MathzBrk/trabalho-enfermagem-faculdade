import { container } from '@infrastructure/di/container';
import { VaccineBatchController } from '@modules/vaccines-batch';
import { CreateVaccineBatchBodySchema } from '@modules/vaccines-batch/validators/createVaccineBatchValidator';
import { UpdateVaccineBatchBodySchema } from '@modules/vaccines-batch/validators/updateVaccineBatchValidator';
import { authMiddleware } from '@shared/middlewares/authMiddleware';
import { validateRequest } from '@shared/middlewares/validateRequest';
import { Router } from 'express';

const vaccineBatchRoutes = Router();

// Resolve VaccineBatchController from DI container
const vaccineBatchController = container.resolve(VaccineBatchController);

// POST /vaccine-batches - Create a new vaccine batch
vaccineBatchRoutes.post(
  '/',
  authMiddleware,
  validateRequest(CreateVaccineBatchBodySchema),
  vaccineBatchController.create.bind(vaccineBatchController),
);

vaccineBatchRoutes.patch(
  '/:id',
  authMiddleware,
  validateRequest(UpdateVaccineBatchBodySchema),
  vaccineBatchController.update.bind(vaccineBatchController),
);

export default vaccineBatchRoutes;
