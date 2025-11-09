import { container } from '@infrastructure/di/container';
import { VaccineController } from '@modules/vaccines';
import { CreateVaccineBodySchema } from '@modules/vaccines/validators/createVaccineValidator';
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

// GET /vaccines/:id - Get vaccine by ID
vaccineRoutes.get(
  '/:id',
  authMiddleware,
  validateRequest({ params: VaccineIdParamSchema }),
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

// DELETE /vaccines/:id - Soft delete vaccine
vaccineRoutes.delete(
  '/:id',
  authMiddleware,
  validateRequest({ params: VaccineIdParamSchema }),
  vaccineController.delete.bind(vaccineController),
);

export default vaccineRoutes;
