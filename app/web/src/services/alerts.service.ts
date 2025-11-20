/**
 * Alerts Service - API integration for inventory alerts
 *
 * Provides real-time inventory monitoring for managers including:
 * - Low stock alerts
 * - Expired batch alerts
 * - Nearing expiration batch alerts
 *
 * @requires MANAGER role
 */

import { api, handleApiError } from './api';
import type { AlertsResponse } from '../types/alerts';

/**
 * Alerts service class
 */
class AlertsService {
  private readonly baseURL = '/alerts';

  /**
   * Get all alerts for the authenticated manager
   *
   * Performs real-time calculations and returns alerts grouped by type.
   *
   * @returns Promise<AlertsResponse> Array of alerts (LOW_STOCK, EXPIRED_BATCH, NEARING_EXPIRATION_BATCH)
   * @throws {ApiError} 401 if not authenticated
   * @throws {ApiError} 403 if user is not a MANAGER
   * @throws {ApiError} 500 if server error occurs
   *
   * @example
   * ```typescript
   * const alerts = await alertsService.getAlerts();
   * alerts.forEach(alert => {
   *   console.log(`${alert.alertType}: ${alert.objects.length} items`);
   * });
   * ```
   */
  async getAlerts(): Promise<AlertsResponse> {
    try {
      const response = await api.get<AlertsResponse>(this.baseURL);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Helper method to check if user has manager role
   * Can be used before calling getAlerts to prevent unnecessary API calls
   *
   * @param userRole - The role of the current user
   * @returns boolean indicating if user is a manager
   */
  canAccessAlerts(userRole: string): boolean {
    return userRole === 'MANAGER';
  }
}

/**
 * Singleton instance of AlertsService
 */
export const alertsService = new AlertsService();
