/**
 * Notifications Module - Public Exports
 *
 * Exports all public interfaces, types, and classes from the notification module.
 * Other modules should import from here instead of reaching into internal files.
 */

// ============================================
// Contracts (Interfaces & Types)
// ============================================
export * from './contracts';

// ============================================
// Errors
// ============================================
export * from './errors';

// ============================================
// Services
// ============================================
export { NotificationService } from './services/NotificationService';
export { NotificationBootstrap } from './services/NotificationBootstrap';

// ============================================
// Stores
// ============================================
export { NotificationStore } from './stores/NotificationStore';

// ============================================
// Infrastructure
// ============================================
// Note: NodeEventBus moved to @infrastructure/messaging/NodeEventBus
// Import directly from infrastructure layer if needed

// ============================================
// Handlers
// ============================================
export { InAppVaccineScheduledHandler } from './handlers/InAppVaccineScheduledHandler';
export { InAppNurseChangedHandler } from './handlers/InAppNurseChangedHandler';
export { InAppBatchExpiringHandler } from './handlers/InAppBatchExpiringHandler';
export { InAppLowStockHandler } from './handlers/InAppLowStockHandler';
export { InAppReportGeneratedHandler } from './handlers/InAppReportGeneratedHandler';
