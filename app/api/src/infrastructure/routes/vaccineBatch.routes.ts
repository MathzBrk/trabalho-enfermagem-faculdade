import { container } from '@infrastructure/di/container';
import { VaccineBatchController } from '@modules/vaccine-batch';
import { CreateVaccineBatchBodySchema } from '@modules/vaccine-batch/validators/createVaccineBatchValidator';
import { UpdateVaccineBatchBodySchema } from '@modules/vaccine-batch/validators/updateVaccineBatchValidator';
import { authMiddleware } from '@shared/middlewares/authMiddleware';
import { validateRequest } from '@shared/middlewares/validateRequest';
import { idParamsSchema } from '@shared/validators/idParamsSchema';
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
  validateRequest({
    body: UpdateVaccineBatchBodySchema,
    params: idParamsSchema,
  }),
  vaccineBatchController.update.bind(vaccineBatchController),
);

export default vaccineBatchRoutes;
