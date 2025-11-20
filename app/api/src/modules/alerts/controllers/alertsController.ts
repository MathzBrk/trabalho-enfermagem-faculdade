import { TOKENS } from '@infrastructure/di/tokens';
import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { AlertsService } from '../services/alertsService';

/**
 * AlertsController - HTTP request handler for alerts endpoints
 *
 * Responsibilities:
 * - HTTP request/response handling
 * - Extracting authenticated user information
 * - Calling appropriate service methods
 * - Formatting HTTP responses
 * - Error handling and appropriate status codes
 *
 * This controller stays thin by delegating business logic to AlertsService.
 * It focuses solely on HTTP concerns and request/response transformation.
 *
 * Dependencies:
 * - AlertsService: Injected via constructor for alerts business logic
 */
@injectable()
export class AlertsController {
  constructor(
    @inject(TOKENS.AlertsService)
    private readonly alertsService: AlertsService,
  ) {}

  /**
   * Gets all alerts for the authenticated manager
   *
   * HTTP Endpoint: GET /alerts
   *
   * Authentication: Required (JWT token via authMiddleware)
   * Authorization: Only MANAGER role can access alerts (enforced in service layer)
   *
   * Response: 200 OK
   * [
   *   {
   *     "alertType": "LOW_STOCK",
   *     "objects": [
   *       {
   *         "id": "uuid",
   *         "name": "Vaccine Name",
   *         "currentStock": 5,
   *         "minimumStock": 10,
   *         ...
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
   *         ...
   *       }
   *     ]
   *   },
   *   {
   *     "alertType": "NEARING_EXPIRATION_BATCH",
   *     "objects": [...]
   *   }
   * ]
   *
   * Alert Types:
   * - LOW_STOCK: Vaccines with stock below minimum threshold
   * - EXPIRED_BATCH: Vaccine batches that have already expired
   * - NEARING_EXPIRATION_BATCH: Vaccine batches expiring within 30 days
   *
   * Errors:
   * - 401 Unauthorized: No authentication token
   * - 403 Forbidden: User is not a MANAGER
   *
   * @param req - Express request (authenticated via middleware)
   * @param res - Express response
   * @param next - Express next function for error handling
   */
  async getAllAlerts(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId!;
      const alerts = await this.alertsService.getAllAlertsForManager(userId);

      res.status(200).json(alerts);
    } catch (error) {
      next(error);
    }
  }
}
