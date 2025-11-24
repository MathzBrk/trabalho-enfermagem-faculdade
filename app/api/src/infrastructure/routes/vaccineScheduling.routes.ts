import { container } from '@infrastructure/di/container';
import { VaccineSchedulingController } from '@modules/vaccine-scheduling';
import { CreateVaccineSchedulingBodySchema } from '@modules/vaccine-scheduling/validators/createVaccineSchedulingValidator';
import {
  UpdateVaccineSchedulingBodySchema,
  UpdateVaccineSchedulingParamsSchema,
} from '@modules/vaccine-scheduling/validators/updateVaccineSchedulingValidator';
import { ListVaccineSchedulingsQuerySchema } from '@modules/vaccine-scheduling/validators/listVaccineSchedulingsValidator';
import { GetVaccineSchedulingParamsSchema } from '@modules/vaccine-scheduling/validators/getVaccineSchedulingValidator';
import { DeleteVaccineSchedulingParamsSchema } from '@modules/vaccine-scheduling/validators/deleteVaccineSchedulingValidator';
import { GetNurseSchedulingMonthlyQuerySchema } from '@modules/vaccine-scheduling/validators/getNurseSchedulingMonthlyValidator';
import { GetSchedulingsByDateQuerySchema } from '@modules/vaccine-scheduling/validators/getSchedulingsByDateValidator';
import { authMiddleware } from '@shared/middlewares/authMiddleware';
import { validateRequest } from '@shared/middlewares/validateRequest';
import { Router } from 'express';

const vaccineSchedulingRoutes = Router();

// Resolve VaccineSchedulingController from DI container
const vaccineSchedulingController = container.resolve(
  VaccineSchedulingController,
);

// POST /vaccine-schedulings - Create a new vaccine scheduling
vaccineSchedulingRoutes.post(
  '/',
  authMiddleware,
  validateRequest({ body: CreateVaccineSchedulingBodySchema }),
  vaccineSchedulingController.create.bind(vaccineSchedulingController),
);

// GET /vaccine-schedulings/nurse/monthly - Get nurse monthly schedulings
vaccineSchedulingRoutes.get(
  '/nurse/monthly',
  authMiddleware,
  validateRequest({ query: GetNurseSchedulingMonthlyQuerySchema }),
  vaccineSchedulingController.getNurseSchedulingsDetailed.bind(
    vaccineSchedulingController,
  ),
);

// GET /vaccine-schedulings/by-date - Get schedulings by date
vaccineSchedulingRoutes.get(
  '/by-date',
  authMiddleware,
  validateRequest({ query: GetSchedulingsByDateQuerySchema }),
  vaccineSchedulingController.getSchedulingsByDate.bind(
    vaccineSchedulingController,
  ),
);

// GET /vaccine-schedulings/:id - Get single vaccine scheduling
vaccineSchedulingRoutes.get(
  '/:id',
  authMiddleware,
  validateRequest({ params: GetVaccineSchedulingParamsSchema }),
  vaccineSchedulingController.getById.bind(vaccineSchedulingController),
);

// GET /vaccine-schedulings - List vaccine schedulings with pagination and filters
vaccineSchedulingRoutes.get(
  '/',
  authMiddleware,
  validateRequest({ query: ListVaccineSchedulingsQuerySchema }),
  vaccineSchedulingController.list.bind(vaccineSchedulingController),
);

// PATCH /vaccine-schedulings/:id - Update a vaccine scheduling
vaccineSchedulingRoutes.patch(
  '/:id',
  authMiddleware,
  validateRequest({
    body: UpdateVaccineSchedulingBodySchema,
    params: UpdateVaccineSchedulingParamsSchema,
  }),
  vaccineSchedulingController.update.bind(vaccineSchedulingController),
);

// DELETE /vaccine-schedulings/:id - Soft delete a vaccine scheduling
vaccineSchedulingRoutes.delete(
  '/:id',
  authMiddleware,
  validateRequest({ params: DeleteVaccineSchedulingParamsSchema }),
  vaccineSchedulingController.delete.bind(vaccineSchedulingController),
);

export default vaccineSchedulingRoutes;
