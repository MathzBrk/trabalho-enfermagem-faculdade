import type { NextFunction, Request, Response } from 'express';
import type { VaccineApplicationService } from '@modules/vaccine-application/services/vaccineApplicationService';
import type { CreateVaccineApplicationDTO } from '@modules/vaccine-application/validators/createVaccineApplicationValidator';
import type { UpdateVaccineApplicationDTO } from '@modules/vaccine-application/validators/updateVaccineApplicationValidator';
import type { ListVaccineApplicationsQueryDTO } from '@modules/vaccine-application/validators/listVaccineApplicationsValidator';
import type { VaccineApplicationFilterParams } from '@shared/interfaces/vaccineApplication';
import { inject, injectable } from 'tsyringe';
import { TOKENS } from '@infrastructure/di/tokens';

/**
 * VaccineApplicationController - HTTP request handler for vaccine application endpoints
 *
 * Responsibilities:
 * - HTTP request/response handling
 * - Request validation and data extraction
 * - Calling appropriate service methods
 * - Formatting HTTP responses
 * - Error handling via Express middleware
 *
 * Architecture:
 * - Thin controller - all business logic in service layer
 * - Extracts appliedById from req.user (set by authMiddleware)
 * - Focuses solely on HTTP concerns
 */
@injectable()
export class VaccineApplicationController {
  constructor(
    @inject(TOKENS.VaccineApplicationService)
    private readonly vaccineApplicationService: VaccineApplicationService,
  ) {}

  /**
   * Creates a new vaccine application
   *
   * HTTP Endpoint: POST /vaccine-applications
   * Authorization: NURSE or MANAGER (requesting user)
   * Body: CreateVaccineApplicationDTO (validated by Zod middleware)
   *
   * Request Body:
   * - receivedById: UUID of the patient receiving the vaccine
   * - appliedById: UUID of the NURSE who physically applies the vaccine
   * - vaccineId: UUID of the vaccine being applied
   * - batchId: UUID of the vaccine batch
   * - doseNumber: Dose number (1, 2, 3, etc.)
   * - applicationSite: Body location where vaccine is applied
   * - observations: Optional notes about the application
   * - schedulingId: Optional link to a scheduling record
   *
   * Flow:
   * 1. Extracts validated data from request body
   * 2. Gets requesting user ID from authenticated session (req.user)
   * 3. Delegates to service layer for business logic validation
   * 4. Returns created application with 201 status
   *
   * @example
   * POST /vaccine-applications
   * Headers: Authorization: Bearer <token>
   * {
   *   "receivedById": "patient-uuid",
   *   "appliedById": "nurse-uuid",
   *   "vaccineId": "vaccine-uuid",
   *   "batchId": "batch-uuid",
   *   "doseNumber": 1,
   *   "applicationSite": "Left Deltoid",
   *   "observations": "Patient tolerated well"
   * }
   *
   * Response: 201 Created
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as CreateVaccineApplicationDTO;
      const requestingUserId = req.user?.userId!;

      const application =
        await this.vaccineApplicationService.createApplication(
          data,
          requestingUserId,
        );

      res.status(201).json(application);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single vaccine application by ID
   *
   * HTTP Endpoint: GET /vaccine-applications/:id
   * Authorization: Required
   * - EMPLOYEE: Can only see their own applications
   * - NURSE: Can see applications they performed + their own
   * - MANAGER: Can see all applications
   *
   * Response: 200 OK
   */
  async getById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const requestingUserId = req.user?.userId!;

      const application =
        await this.vaccineApplicationService.getApplicationById(
          id,
          requestingUserId,
        );

      res.status(200).json(application);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lists vaccine applications with pagination and filtering
   *
   * HTTP Endpoint: GET /vaccine-applications
   * Authorization: Required (role-based filtering applied)
   * Query Parameters:
   * - page: number (default: 1)
   * - perPage: number (default: 10, max: 100)
   * - sortBy: string (default: 'applicationDate')
   * - sortOrder: 'asc' | 'desc' (default: 'desc')
   * - userId: string (UUID) - Filter by patient
   * - vaccineId: string (UUID) - Filter by vaccine
   * - appliedById: string (UUID) - Filter by nurse who applied
   * - batchId: string (UUID) - Filter by batch
   * - doseNumber: number - Filter by dose number
   *
   * Examples:
   * - GET /vaccine-applications → List all (role-filtered)
   * - GET /vaccine-applications?userId=uuid → List for specific user
   * - GET /vaccine-applications?vaccineId=uuid&doseNumber=1 → List first doses of vaccine
   *
   * Response: 200 OK
   * {
   *   "data": [{ application objects }],
   *   "metadata": {
   *     "page": 1,
   *     "perPage": 10,
   *     "total": 50,
   *     "totalPages": 5,
   *     "hasNext": true,
   *     "hasPrev": false
   *   }
   * }
   */
  async getPaginated(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const query = req.query as unknown as ListVaccineApplicationsQueryDTO;
      const requestingUserId = req.user?.userId!;

      // Build pagination params
      const paginationParams = {
        page: query.page,
        perPage: query.perPage,
        sortBy: query.sortBy || 'applicationDate',
        sortOrder: query.sortOrder || 'desc',
      };

      // Build filter params
      const filters: VaccineApplicationFilterParams = {};
      if (query.userId) filters.userId = query.userId;
      if (query.vaccineId) filters.vaccineId = query.vaccineId;
      if (query.appliedById) filters.appliedById = query.appliedById;
      if (query.batchId) filters.batchId = query.batchId;
      if (query.doseNumber !== undefined) filters.doseNumber = query.doseNumber;

      const result =
        await this.vaccineApplicationService.getPaginatedApplications(
          paginationParams,
          requestingUserId,
          filters,
        );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a vaccine application
   *
   * HTTP Endpoint: PATCH /vaccine-applications/:id
   * Authorization: NURSE who applied it or MANAGER
   * Body: UpdateVaccineApplicationDTO (partial)
   *
   * @example
   * PATCH /vaccine-applications/uuid
   * Headers: Authorization: Bearer <token>
   * {
   *   "applicationSite": "Right Arm",
   *   "observations": "Updated observation"
   * }
   *
   * Response: 200 OK
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateVaccineApplicationDTO = req.body;
      const requestingUserId = req.user?.userId!;

      const application =
        await this.vaccineApplicationService.updateApplication(
          id,
          data,
          requestingUserId,
        );

      res.status(200).json(application);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's complete vaccination history
   *
   * HTTP Endpoint: GET /vaccine-applications/users/:userId/history
   * Authorization: Required
   * - EMPLOYEE: Can only view their own history
   * - NURSE/MANAGER: Can view any user's history
   *
   * Response: 200 OK
   * [{ application objects }]
   */
  async getUserHistory(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const requestingUserId = req.user?.userId!;

      const history =
        await this.vaccineApplicationService.getUserVaccinationHistory(
          id,
          requestingUserId,
        );

      res.status(200).json(history);
    } catch (error) {
      next(error);
    }
  }
}
