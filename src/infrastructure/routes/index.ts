import { getCurrentTimestamp } from '@shared/helpers/timeHelper';
import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import vaccineRoutes from './vaccine.routes';

/**
 * Main Routes Index
 *
 * Combines all application routes with their respective prefixes
 */
const routes = Router();

/**
 * Health check endpoint
 * GET /api/health
 */
routes.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: getCurrentTimestamp(),
  });
});

/**
 * Authentication routes
 * Prefix: /api/auth
 *
 * - POST /api/auth/login - User login
 * - POST /api/auth/register - User registration
 */
routes.use('/auth', authRoutes);

/**
 * User routes
 * Prefix: /api/users
 */
routes.use('/users', userRoutes);

routes.use('/vaccines', vaccineRoutes);

/**
 * TODO: Add more routes here as you create new modules
 *
 * Example:
 * routes.use("/vaccines", vaccineRoutes);
 * routes.use("/schedulings", schedulingRoutes);
 */

export default routes;
