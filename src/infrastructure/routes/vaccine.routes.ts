import { container } from '@infrastructure/di/container';
import { VaccineController } from '@modules/vaccines';
import { CreateVaccineBodySchema } from '@modules/vaccines/validators/createVaccineValidator';
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

export default vaccineRoutes;
