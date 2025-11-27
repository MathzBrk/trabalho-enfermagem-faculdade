import { TOKENS } from '@infrastructure/di/tokens';
import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { VaccinationCoverageService } from '../services/vaccinationCoverage';

/**
 * VaccinationCoverageController - HTTP request handler for vaccination coverage endpoints
 *
 * Responsibilities:
 * - HTTP request/response handling
 * - Extracting authenticated user information
 * - Calling appropriate service methods
 * - Formatting HTTP responses
 * - Error handling and appropriate status codes
 *
 * This controller stays thin by delegating business logic to VaccinationCoverageService.
 * It focuses solely on HTTP concerns and request/response transformation.
 *
 * Dependencies:
 * - VaccinationCoverageService: Injected via constructor for coverage calculation logic
 */
@injectable()
export class VaccinationCoverageController {
  constructor(
    @inject(TOKENS.VaccinationCoverageService)
    private readonly vaccinationCoverageService: VaccinationCoverageService,
  ) {}

  /**
   * Gets vaccination coverage statistics for the organization
   *
   * HTTP Endpoint: GET /vaccination-coverage
   *
   * Authentication: Required (JWT token via authMiddleware)
   * Authorization: Only MANAGER role can access coverage data (enforced in service layer)
   *
   * Response: 200 OK
   * {
   *   "summary": {
   *     "averageCoverage": 75.5,
   *     "targetReached": 3,
   *     "criticalVaccines": 1,
   *     "defaultTargetValue": 95
   *   },
   *   "details": [
   *     {
   *       "vaccineName": "BCG",
   *       "isObligatory": true,
   *       "coveragePercentage": 92.5,
   *       "status": "below_target",
   *       "completeDoses": 185,
   *       "shoudHaveDoses": 200,
   *       "partialDoses": 10
   *     },
   *     {
   *       "vaccineName": "Hepatite B",
   *       "isObligatory": true,
   *       "coveragePercentage": 45.0,
   *       "status": "critical",
   *       "completeDoses": 90,
   *       "shoudHaveDoses": 200,
   *       "partialDoses": 15
   *     }
   *   ],
   *   "criticalVaccines": [
   *     {
   *       "vaccineName": "Hepatite B",
   *       "coveragePercentage": 45.0,
   *       "gapToTarget": 50.0
   *     }
   *   ],
   *   "completion": {
   *     "fullyVaccinatedUsers": 150,
   *     "partiallyVaccinatedUsers": 30,
   *     "notStartedUsers": 20,
   *     "completionRate": 75.0
   *   }
   * }
   *
   * Coverage Status Definitions:
   * - critical: Coverage <= 50% of target (default target is 95%)
   * - below_target: Coverage > 50% but < target
   * - at_target: Coverage exactly matches target
   * - above_target: Coverage > target
   *
   * Business Rules:
   * - Only managers can access vaccination coverage data
   * - Coverage is calculated based on active users only
   * - Complete doses = users who completed all required doses for a vaccine
   * - Partial doses = users who started but haven't completed all doses
   * - Default target is 95% coverage (configurable via constants)
   *
   * Errors:
   * - 401 Unauthorized: No authentication token
   * - 403 Forbidden: User is not a MANAGER
   * - 404 Not Found: Requesting user not found in database
   *
   * @param req - Express request (authenticated via middleware)
   * @param res - Express response
   * @param next - Express next function for error handling
   */
  async getCoverage(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId!;
      const coverage =
        await this.vaccinationCoverageService.calculateVaccinationCoverage(
          userId,
        );

      res.status(200).json(coverage);
    } catch (error) {
      next(error);
    }
  }
}
