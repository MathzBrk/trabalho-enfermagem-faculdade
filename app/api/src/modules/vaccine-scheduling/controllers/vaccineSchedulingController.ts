import { TOKENS } from '@infrastructure/di/tokens';
import type { VaccineSchedulingService } from '@modules/vaccine-scheduling/services/vaccineSchedulingService';
import type { GetNurseSchedulingMonthlyDTO } from '@modules/vaccine-scheduling/validators/getNurseSchedulingMonthlyValidator';
import type { ListVaccineSchedulingsDTO } from '@modules/vaccine-scheduling/validators/listVaccineSchedulingsValidator';
import { getDate } from '@shared/helpers/timeHelper';
import type { VaccineSchedulingFilterParams } from '@shared/interfaces/vaccineScheduling';
import type {
  CreateVaccineSchedulingDTO,
  UpdateVaccineSchedulingDTO,
} from '@shared/models/vaccineScheduling';
import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';

/**
 * VaccineSchedulingController - HTTP request handler for vaccine scheduling endpoints
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
 * - Extracts userId from req.user (set by authMiddleware)
 * - Focuses solely on HTTP concerns
 */
@injectable()
export class VaccineSchedulingController {
  constructor(
    @inject(TOKENS.VaccineSchedulingService)
    private readonly vaccineSchedulingService: VaccineSchedulingService,
  ) {}

  /**
   * Creates a new vaccine scheduling
   *
   * HTTP Endpoint: POST /vaccine-schedulings
   * Authorization: Required
   * - MANAGER: Can create for any user
   * - EMPLOYEE/NURSE: Can only create for themselves
   * Body: CreateVaccineSchedulingDTO (validated by Zod middleware)
   *
   * Request Body:
   * - userId: UUID of the user to schedule for
   * - vaccineId: UUID of the vaccine
   * - scheduledDate: ISO 8601 datetime string
   * - doseNumber: Dose number (default: 1)
   * - notes: Optional notes
   *
   * @example
   * POST /vaccine-schedulings
   * Headers: Authorization: Bearer <token>
   * {
   *   "userId": "user-uuid",
   *   "vaccineId": "vaccine-uuid",
   *   "scheduledDate": "2025-12-15T10:00:00.000Z",
   *   "doseNumber": 1,
   *   "notes": "First dose scheduling"
   * }
   *
   * Response: 201 Created
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as CreateVaccineSchedulingDTO;
      const requestingUserId = req.user?.userId!;

      const scheduling = await this.vaccineSchedulingService.createScheduling(
        data,
        requestingUserId,
      );

      res.status(201).json(scheduling);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single vaccine scheduling by ID
   *
   * HTTP Endpoint: GET /vaccine-schedulings/:id
   * Authorization: Required
   * - MANAGER: Can see all schedulings
   * - EMPLOYEE/NURSE: Can only see their own schedulings
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

      const scheduling = await this.vaccineSchedulingService.getSchedulingById(
        id,
        requestingUserId,
      );

      res.status(200).json(scheduling);
    } catch (error) {
      next(error);
    }
  }

  async getNurseSchedulingsDetailed(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const requestingUserId = req.user?.userId;

      const { month, year } =
        req.query as unknown as GetNurseSchedulingMonthlyDTO;

      const schedulings =
        await this.vaccineSchedulingService.getNurseSchedulingsDetailed(
          requestingUserId!,
          {
            month,
            year,
          },
        );

      res.status(200).json(schedulings);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lists vaccine schedulings with pagination and filtering
   *
   * HTTP Endpoint: GET /vaccine-schedulings
   * Authorization: Required (role-based filtering applied)
   * Query Parameters:
   * - page: number (default: 1)
   * - limit: number (default: 10, max: 100)
   * - userId: string (UUID) - Filter by user
   * - vaccineId: string (UUID) - Filter by vaccine
   * - status: SCHEDULED | CONFIRMED | CANCELLED | COMPLETED
   * - startDate: ISO 8601 datetime - Filter by date range start
   * - endDate: ISO 8601 datetime - Filter by date range end
   *
   * Examples:
   * - GET /vaccine-schedulings → List all (role-filtered)
   * - GET /vaccine-schedulings?userId=uuid → List for specific user (MANAGER only)
   * - GET /vaccine-schedulings?status=SCHEDULED → List scheduled appointments
   * - GET /vaccine-schedulings?startDate=2025-11-01T00:00:00Z&endDate=2025-11-30T23:59:59Z
   *
   * Response: 200 OK
   * {
   *   "data": [{ scheduling objects with relations }],
   *   "total": 50
   * }
   */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as ListVaccineSchedulingsDTO;
      const requestingUserId = req.user?.userId!;

      const filters: VaccineSchedulingFilterParams = {
        userId: query.userId,
        assignedNurseId: query.assignedNurseId,
        vaccineId: query.vaccineId,
        status: query.status,
        startDate: query.startDate ? getDate(query.startDate) : undefined,
        endDate: query.endDate ? getDate(query.endDate) : undefined,
      };

      const result = await this.vaccineSchedulingService.getSchedulings(
        filters,
        Number(query.page),
        Number(query.limit),
        requestingUserId,
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getSchedulingsByDate(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const requestingUserId = req.user?.userId;
      const { date } = req.query as { date?: string };

      let dateToUse: Date | undefined;
      if (date) {
        // Extract only the date part (YYYY-MM-DD) to avoid timezone issues
        const datePart = date.split('T')[0];
        dateToUse = getDate(datePart);
      }

      const schedulings =
        await this.vaccineSchedulingService.getSchedulingsByDate(
          requestingUserId!,
          dateToUse,
        );

      res.status(200).json(schedulings);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Updates a vaccine scheduling
   *
   * HTTP Endpoint: PATCH /vaccine-schedulings/:id
   * Authorization: Required
   * - MANAGER: Can update any scheduling
   * - EMPLOYEE/NURSE: Can only update their own schedulings
   * Body: UpdateVaccineSchedulingDTO (validated by Zod middleware)
   *
   * Request Body (all optional, at least one required):
   * - scheduledDate: ISO 8601 datetime string
   * - notes: string
   * - status: SCHEDULED | CONFIRMED | CANCELLED | COMPLETED
   *
   * @example
   * PATCH /vaccine-schedulings/:id
   * Headers: Authorization: Bearer <token>
   * {
   *   "scheduledDate": "2025-12-20T14:00:00.000Z",
   *   "status": "CONFIRMED"
   * }
   *
   * Response: 200 OK
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body as UpdateVaccineSchedulingDTO;
      const requestingUserId = req.user?.userId!;

      const scheduling = await this.vaccineSchedulingService.updateScheduling(
        id,
        data,
        requestingUserId,
      );

      res.status(200).json(scheduling);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deletes a vaccine scheduling (soft delete)
   *
   * HTTP Endpoint: DELETE /vaccine-schedulings/:id
   * Authorization: Required
   * - MANAGER: Can delete any scheduling
   * - EMPLOYEE/NURSE: Can only delete their own schedulings
   *
   * Sets deletedAt timestamp and changes status to CANCELLED
   *
   * Response: 200 OK
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const requestingUserId = req.user?.userId!;

      const scheduling = await this.vaccineSchedulingService.deleteScheduling(
        id,
        requestingUserId,
      );

      res.status(200).json(scheduling);
    } catch (error) {
      next(error);
    }
  }
}
