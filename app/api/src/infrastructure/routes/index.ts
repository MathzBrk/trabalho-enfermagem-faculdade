import { getCurrentTimestamp } from '@shared/helpers/timeHelper';
import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import vaccineRoutes from './vaccine.routes';
import vaccineBatchRoutes from './vaccineBatch.routes';
import vaccineApplicationRoutes from './vaccineApplication.routes';
import vaccineSchedulingRoutes from './vaccineScheduling.routes';
import notificationRoutes from './notification.routes';
import alertsRoutes from './alerts.routes';

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

/**
 * Vaccine routes
 * Prefix: /api/vaccines
 */
routes.use('/vaccines', vaccineRoutes);

/**
 * Vaccine Batch routes
 * Prefix: /api/vaccine-batches
 */
routes.use('/vaccine-batches', vaccineBatchRoutes);

/**
 * Vaccine Application routes
 * Prefix: /api/vaccine-applications
 */
routes.use('/vaccine-applications', vaccineApplicationRoutes);

/**
 * Vaccine Scheduling routes
 * Prefix: /api/vaccine-schedulings
 */
routes.use('/vaccine-schedulings', vaccineSchedulingRoutes);

/**
 * Notification routes
 * Prefix: /api/notifications
 *
 * - GET /api/notifications - List notifications for authenticated user
 * - PATCH /api/notifications/:id/read - Mark notification as read
 * - PATCH /api/notifications/read-all - Mark all notifications as read
 */
routes.use('/notifications', notificationRoutes);

/**
 * Alerts routes
 * Prefix: /api/alerts
 *
 * Provides real-time inventory alerts for managers:
 * - Low stock alerts
 * - Expired batch alerts
 * - Nearing expiration alerts (within 30 days)
 *
 * - GET /api/alerts - Get all alerts (MANAGER only)
 */
routes.use('/alerts', alertsRoutes);

export default routes;
