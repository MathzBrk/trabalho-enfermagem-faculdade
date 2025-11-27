import { container } from '@infrastructure/di/container';
import { VaccineApplicationController } from '@modules/vaccine-application';
import { CreateVaccineApplicationBodySchema } from '@modules/vaccine-application/validators/createVaccineApplicationValidator';
import { UpdateVaccineApplicationBodySchema } from '@modules/vaccine-application/validators/updateVaccineApplicationValidator';
import { ListVaccineApplicationsQuerySchema } from '@modules/vaccine-application/validators/listVaccineApplicationsValidator';
import { authMiddleware } from '@shared/middlewares/authMiddleware';
import { validateRequest } from '@shared/middlewares/validateRequest';
import { idParamsSchema } from '@shared/validators/idParamsSchema';
import { Router } from 'express';

const vaccineApplicationRoutes = Router();

// Resolve VaccineApplicationController from DI container
const vaccineApplicationController = container.resolve(
  VaccineApplicationController,
);

// POST /vaccine-applications - Create a new vaccine application
vaccineApplicationRoutes.post(
  '/',
  authMiddleware,
  validateRequest(CreateVaccineApplicationBodySchema),
  vaccineApplicationController.create.bind(vaccineApplicationController),
);


// GET /vaccine-applications/users/:id/history - Get user's vaccination history
vaccineApplicationRoutes.get(
  '/users/:id/history',
  authMiddleware,
  validateRequest({ params: idParamsSchema }),
  vaccineApplicationController.getUserHistory.bind(
    vaccineApplicationController,
  ),
);

// GET /vaccine-applications/:id - Get single vaccine application
vaccineApplicationRoutes.get(
  '/:id',
  authMiddleware,
  validateRequest({ params: idParamsSchema }),
  vaccineApplicationController.getById.bind(vaccineApplicationController),
);

// GET /vaccine-applications - List vaccine applications with pagination
vaccineApplicationRoutes.get(
  '/',
  authMiddleware,
  validateRequest({ query: ListVaccineApplicationsQuerySchema }),
  vaccineApplicationController.getPaginated.bind(vaccineApplicationController),
);

// PATCH /vaccine-applications/:id - Update a vaccine application
vaccineApplicationRoutes.patch(
  '/:id',
  authMiddleware,
  validateRequest({
    body: UpdateVaccineApplicationBodySchema,
    params: idParamsSchema,
  }),
  vaccineApplicationController.update.bind(vaccineApplicationController),
);

export default vaccineApplicationRoutes;
