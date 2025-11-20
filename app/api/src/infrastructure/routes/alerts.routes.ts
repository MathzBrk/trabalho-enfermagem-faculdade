import { container } from '@infrastructure/di/container';
import { AlertsController } from '@modules/alerts/controllers/alertsController';
import { authMiddleware } from '@shared/middlewares/authMiddleware';
import { Router } from 'express';

/**
 * Alerts Routes
 *
 * Defines all HTTP endpoints for alerts-related operations.
 * Controller is resolved from DI container to ensure all dependencies
 * are properly injected.
 *
 * Alerts provide real-time information about:
 * - Vaccines with low stock levels
 * - Expired vaccine batches
 * - Vaccine batches nearing expiration (within 30 days)
 */
const alertsRoutes = Router();

// Resolve AlertsController from DI container
const alertsController = container.resolve(AlertsController);

/**
 * GET /alerts
 * Get all alerts for the authenticated manager
 *
 * Authentication: Required (JWT token via authMiddleware)
 * Authorization: Only MANAGER role can access alerts (enforced in service layer)
 *
 * This endpoint aggregates multiple alert types in a single response:
 * - LOW_STOCK: Vaccines where totalStock <= minStockLevel
 * - EXPIRED_BATCH: Batches where expirationDate < current date
 * - NEARING_EXPIRATION_BATCH: Batches expiring within 30 days
 *
 * Example:
 * GET /api/alerts
 * Authorization: Bearer <JWT_TOKEN>
 *
 * Response: 200 OK
 * [
 *   {
 *     "alertType": "LOW_STOCK",
 *     "objects": [
 *       {
 *         "id": "uuid",
 *         "name": "BCG",
 *         "manufacturer": "Manufacturer Name",
 *         "currentStock": 5,
 *         "minimumStock": 10,
 *         "createdAt": "2025-01-01T00:00:00.000Z",
 *         "updatedAt": "2025-01-15T00:00:00.000Z"
 *       }
 *     ]
 *   },
 *   {
 *     "alertType": "EXPIRED_BATCH",
 *     "objects": [
 *       {
 *         "id": "uuid",
 *         "batchNumber": "BATCH-001",
 *         "expirationDate": "2025-10-15T00:00:00.000Z",
 *         "quantity": 50,
 *         "vaccineId": "uuid",
 *         "createdAt": "2025-01-01T00:00:00.000Z",
 *         "updatedAt": "2025-01-01T00:00:00.000Z"
 *       }
 *     ]
 *   },
 *   {
 *     "alertType": "NEARING_EXPIRATION_BATCH",
 *     "objects": [
 *       {
 *         "id": "uuid",
 *         "batchNumber": "BATCH-002",
 *         "expirationDate": "2025-12-10T00:00:00.000Z",
 *         "quantity": 100,
 *         "vaccineId": "uuid",
 *         "createdAt": "2025-01-01T00:00:00.000Z",
 *         "updatedAt": "2025-01-01T00:00:00.000Z"
 *       }
 *     ]
 *   }
 * ]
 *
 * Business Rules:
 * - Only managers can access alerts
 * - Alerts are calculated in real-time (no caching)
 * - Empty alert types are still included in response with empty arrays
 * - Alerts help managers proactively manage inventory
 *
 * Use Cases:
 * - Dashboard alert widget
 * - Email digest notifications
 * - Proactive inventory management
 * - Compliance and audit requirements
 *
 * Errors:
 * - 401 Unauthorized: No authentication token
 * - 403 Forbidden: User is not a MANAGER
 *
 * Middleware Chain:
 * 1. authMiddleware - Verifies JWT token, sets req.user
 * 2. alertsController.getAllAlerts - Handles business logic
 */
alertsRoutes.get(
  '/',
  authMiddleware,
  alertsController.getAllAlerts.bind(alertsController),
);

export default alertsRoutes;
