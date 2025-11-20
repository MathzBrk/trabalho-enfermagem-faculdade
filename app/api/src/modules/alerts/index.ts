/**
 * Alerts Module
 *
 * This module provides real-time alerting functionality for inventory management.
 *
 * Features:
 * - Low stock alerts: Vaccines where currentStock < minimumStock
 * - Expired batch alerts: Batches that have already expired
 * - Nearing expiration alerts: Batches expiring within 30 days
 *
 * Architecture:
 * - Controller: HTTP request handling and response formatting
 * - Service: Business logic and alert aggregation
 * - Types: TypeScript type definitions for alerts
 * - Validators: Request validation schemas
 *
 * Access Control:
 * - Only MANAGER role can access alerts
 * - Authorization is enforced at the service layer
 */

export * from './controllers/alertsController';
export * from './services/alertsService';
export * from './types';
