import { container } from '@infrastructure/di/container';
import { VaccineController } from '@modules/vaccines';
import { CreateVaccineBodySchema } from '@modules/vaccines/validators/createVaccineValidator';
import { GetVaccineByIdQuerySchema } from '@modules/vaccines/validators/getVaccineByIdValidator';
import { ListVaccineBatchesQuerySchema } from '@modules/vaccines/validators/listVaccineBatchesValidator';
import { ListVaccinesQuerySchema } from '@modules/vaccines/validators/listVaccinesValidator';
import { UpdateVaccineBodySchema } from '@modules/vaccines/validators/updateVaccineValidator';
import { VaccineIdParamSchema } from '@modules/vaccines/validators/vaccineIdParamValidator';
import { authMiddleware } from '@shared/middlewares/authMiddleware';
import { validateRequest } from '@shared/middlewares/validateRequest';
import { Router } from 'express';

const vaccineRoutes = Router();

// Resolve VaccineController from DI container
const vaccineController = container.resolve(VaccineController);

// POST /vaccines - Create a new vaccine
vaccineRoutes.post(
  '/',
  authMiddleware,
  validateRequest(CreateVaccineBodySchema),
  vaccineController.create.bind(vaccineController),
);

// GET /vaccines - List vaccines with pagination and filters
vaccineRoutes.get(
  '/',
  authMiddleware,
  validateRequest({ query: ListVaccinesQuerySchema }),
  vaccineController.getPaginatedVaccines.bind(vaccineController),
);

// GET /vaccines/:id/batches - Get paginated batches for a specific vaccine
// IMPORTANT: This route MUST be before /:id to avoid route conflicts
vaccineRoutes.get(
  '/:id/batches',
  authMiddleware,
  validateRequest({
    params: VaccineIdParamSchema,
    query: ListVaccineBatchesQuerySchema,
  }),
  vaccineController.getVaccineBatches.bind(vaccineController),
);

// GET /vaccines/:id - Get vaccine by ID (with optional ?include=batches)
vaccineRoutes.get(
  '/:id',
  authMiddleware,
  validateRequest({
    params: VaccineIdParamSchema,
    query: GetVaccineByIdQuerySchema,
  }),
  vaccineController.getById.bind(vaccineController),
);

// PATCH /vaccines/:id - Update vaccine
vaccineRoutes.patch(
  '/:id',
  authMiddleware,
  validateRequest({
    params: VaccineIdParamSchema,
    body: UpdateVaccineBodySchema,
  }),
  vaccineController.update.bind(vaccineController),
);

// DELETE /vaccines/:id - hard delete vaccine
vaccineRoutes.delete(
  '/:id',
  authMiddleware,
  validateRequest({ params: VaccineIdParamSchema }),
  vaccineController.delete.bind(vaccineController),
);

export default vaccineRoutes;
