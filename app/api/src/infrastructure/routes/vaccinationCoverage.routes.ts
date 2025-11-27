import { container } from '@infrastructure/di/container';
import { VaccinationCoverageController } from '@modules/vaccination-coverage/controllers/vaccinationCoverageController';
import { authMiddleware } from '@shared/middlewares/authMiddleware';
import { Router } from 'express';

/**
 * Vaccination Coverage Routes
 *
 * Defines all HTTP endpoints for vaccination coverage operations.
 * Controller is resolved from DI container to ensure all dependencies
 * are properly injected.
 *
 * Vaccination coverage provides comprehensive statistics about:
 * - Overall vaccination coverage across all vaccines
 * - Individual vaccine coverage with status (critical, below_target, at_target, above_target)
 * - Critical vaccines that require immediate attention
 * - User vaccination completion rates (fully, partially, not started)
 *
 * All endpoints require MANAGER role authorization.
 */
const vaccinationCoverageRoutes = Router();

// Resolve VaccinationCoverageController from DI container
const vaccinationCoverageController = container.resolve(
  VaccinationCoverageController,
);

/**
 * GET /vaccination-coverage
 * Get comprehensive vaccination coverage statistics for the organization
 *
 * Authentication: Required (JWT token via authMiddleware)
 * Authorization: Only MANAGER role can access coverage data (enforced in service layer)
 *
 * This endpoint calculates real-time vaccination coverage metrics across
 * all active users and vaccines in the system.
 *
 * Example:
 * GET /api/vaccination-coverage
 * Authorization: Bearer <JWT_TOKEN>
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
 *     },
 *     {
 *       "vaccineName": "Tríplice Viral",
 *       "isObligatory": true,
 *       "coveragePercentage": 98.5,
 *       "status": "above_target",
 *       "completeDoses": 197,
 *       "shoudHaveDoses": 200,
 *       "partialDoses": 2
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
 * Response Fields:
 *
 * summary:
 * - averageCoverage: Mean coverage percentage across all vaccines
 * - targetReached: Count of vaccines that reached or exceeded target (95% default)
 * - criticalVaccines: Count of vaccines in critical status (<= 47.5% coverage)
 * - defaultTargetValue: The target percentage used for calculations (95%)
 *
 * details: Array of coverage data per vaccine
 * - vaccineName: Name of the vaccine
 * - isObligatory: Whether the vaccine is mandatory
 * - coveragePercentage: Percentage of active users with complete doses
 * - status: Coverage status (critical | below_target | at_target | above_target)
 * - completeDoses: Number of users who completed all required doses
 * - shoudHaveDoses: Expected total doses (dosesRequired * active users)
 * - partialDoses: Number of users who started but haven't completed
 *
 * criticalVaccines: Array of vaccines requiring immediate attention
 * - vaccineName: Name of the vaccine
 * - coveragePercentage: Current coverage percentage
 * - gapToTarget: Percentage points below target (target - current)
 *
 * completion: User vaccination completion statistics
 * - fullyVaccinatedUsers: Users who completed all obligatory vaccines
 * - partiallyVaccinatedUsers: Users who started but haven't completed all
 * - notStartedUsers: Users who haven't received any obligatory vaccines
 * - completionRate: Percentage of users fully vaccinated
 *
 * Coverage Status Logic:
 * - critical: coverage <= 47.5% (50% of 95% target)
 * - below_target: 47.5% < coverage < 95%
 * - at_target: coverage === 95%
 * - above_target: coverage > 95%
 *
 * Business Rules:
 * - Only managers can access vaccination coverage data
 * - Coverage is calculated based on active users only (deleted/inactive users excluded)
 * - Complete doses = users who completed dosesRequired for that vaccine
 * - Partial doses = users who have at least one dose but not all required
 * - Default target is 95% (WHO recommended minimum for herd immunity)
 * - Calculations are performed in real-time (no caching)
 *
 * Use Cases:
 * - Dashboard overview for managers
 * - Identify which vaccines need immediate action
 * - Monitor overall vaccination program effectiveness
 * - Generate coverage reports for stakeholders
 * - Compliance and regulatory reporting
 *
 * Performance Considerations:
 * - Uses concurrency limit (p-limit) to prevent database overload
 * - Optimized queries with parallel processing
 * - Consider adding caching for large organizations (future enhancement)
 *
 * Errors:
 * - 401 Unauthorized: No authentication token or invalid token
 * - 403 Forbidden: User is not a MANAGER
 * - 404 Not Found: Requesting user not found in database
 * - 500 Internal Server Error: Database or calculation errors
 *
 * Middleware Chain:
 * 1. authMiddleware - Verifies JWT token, sets req.user
 * 2. vaccinationCoverageController.getCoverage - Handles business logic
 */
vaccinationCoverageRoutes.get(
  '/',
  authMiddleware,
  vaccinationCoverageController.getCoverage.bind(vaccinationCoverageController),
);

export default vaccinationCoverageRoutes;
