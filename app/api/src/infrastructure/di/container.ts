import { UserService } from '@modules/user/services/userService';
import { UserStore } from '@modules/user/stores/userStore';
import { VaccineApplicationService } from '@modules/vaccine-application/services/vaccineApplicationService';
import { VaccineApplicationStore } from '@modules/vaccine-application/stores/vaccineApplicationStore';
import { VaccineSchedulingService } from '@modules/vaccine-scheduling/services/vaccineSchedulingService';
import { VaccineSchedulingStore } from '@modules/vaccine-scheduling/stores/vaccineSchedulingStore';
import { VaccineBatchService } from '@modules/vaccines-batch/services/vaccineBatchService';
import { VaccineBatchStore } from '@modules/vaccines-batch/stores/vaccineBatchStore';
import { VaccineService } from '@modules/vaccines/services/vaccineService';
import { VaccineStore } from '@modules/vaccines/stores/vaccineStore';
import { container } from 'tsyringe';
import { TOKENS } from './tokens';

// Notification module imports
import { NodeEventBus } from '@infrastructure/messaging/NodeEventBus';
import { JobServiceManager } from '@modules/jobs/services/jobServiceManager';
import { NotificationController } from '@modules/notifications/controllers/NotificationController';
import { InAppBatchExpiringHandler } from '@modules/notifications/handlers/InAppBatchExpiringHandler';
import { InAppLowStockHandler } from '@modules/notifications/handlers/InAppLowStockHandler';
import { InAppNurseChangedHandler } from '@modules/notifications/handlers/InAppNurseChangedHandler';
import { InAppReportGeneratedHandler } from '@modules/notifications/handlers/InAppReportGeneratedHandler';
import { InAppVaccineAppliedHandler } from '@modules/notifications/handlers/InAppVaccineAppliedHandler';
import { InAppVaccineScheduledHandler } from '@modules/notifications/handlers/InAppVaccineScheduledHandler';
import { NotificationBootstrap } from '@modules/notifications/services/NotificationBootstrap';
import { NotificationService } from '@modules/notifications/services/NotificationService';
import { NotificationStore } from '@modules/notifications/stores/NotificationStore';
import { getAndResolveAllCronJobs } from '@shared/helpers/cronJobHelper';

/**
 * DI Container Setup
 *
 * Configures and initializes the TSyringe dependency injection container.
 * This function should be called once at application startup, before any
 * controllers or services are instantiated.
 *
 * Container Registration Strategy:
 * - SINGLETON: Stores and Services are registered as singletons to maintain
 *   shared state and optimize resource usage across the application lifecycle
 * - Interface-based: Services depend on store interfaces, not concrete classes
 * - Store-first: Stores are registered before services to avoid circular dependencies
 * - Services use stores directly to maintain separation of concerns
 * - Environment-aware: Can switch between implementations based on NODE_ENV
 *
 * Why Singleton for Stores?
 * - Maintains consistent state across all service instances
 * - Optimizes database connection pooling
 * - Enables caching strategies at the store level
 * - Reduces memory overhead by reusing the same instance
 *
 * Why Singleton for Services?
 * - Services are stateless and can be safely shared
 * - Reduces memory overhead and initialization time
 * - Maintains consistent behavior across the application
 */
export function setupContainer(): void {
  // Register stores as singleton implementation for their interfaces
  // Using singleton ensures all services share the same store instance,
  // which is critical for caching and connection pooling
  container.registerSingleton(TOKENS.IUserStore, UserStore);
  container.registerSingleton(TOKENS.IVaccineStore, VaccineStore);
  container.registerSingleton(TOKENS.IVaccineBatchStore, VaccineBatchStore);
  container.registerSingleton(
    TOKENS.IVaccineApplicationStore,
    VaccineApplicationStore,
  );
  container.registerSingleton(
    TOKENS.IVaccineSchedulingStore,
    VaccineSchedulingStore,
  );

  // Register notification module stores
  container.registerSingleton(TOKENS.INotificationStore, NotificationStore);

  // Register services as singletons
  // Services are stateless and can be safely shared across the application
  // Services use stores directly to avoid circular dependencies
  container.registerSingleton(TOKENS.UserService, UserService);
  container.registerSingleton(TOKENS.VaccineService, VaccineService);
  container.registerSingleton(TOKENS.VaccineBatchService, VaccineBatchService);
  container.registerSingleton(
    TOKENS.VaccineApplicationService,
    VaccineApplicationService,
  );
  container.registerSingleton(
    TOKENS.VaccineSchedulingService,
    VaccineSchedulingService,
  );

  // Register notification module services and infrastructure
  container.registerSingleton(TOKENS.IEventBus, NodeEventBus);
  container.registerSingleton(TOKENS.NotificationService, NotificationService);
  container.registerSingleton(
    TOKENS.NotificationBootstrap,
    NotificationBootstrap,
  );

  // Register notification event handlers
  container.registerSingleton(
    TOKENS.VaccineScheduledHandler,
    InAppVaccineScheduledHandler,
  );
  container.registerSingleton(
    TOKENS.NurseChangedHandler,
    InAppNurseChangedHandler,
  );
  container.registerSingleton(
    TOKENS.BatchExpiringHandler,
    InAppBatchExpiringHandler,
  );
  container.registerSingleton(TOKENS.LowStockHandler, InAppLowStockHandler);
  container.registerSingleton(
    TOKENS.ReportGeneratedHandler,
    InAppReportGeneratedHandler,
  );
  container.registerSingleton(
    TOKENS.VaccineAppliedHandler,
    InAppVaccineAppliedHandler,
  );

  // Register notification controller
  container.registerSingleton(NotificationController);

  // Initialize notification system (register event handlers with event bus)
  const notificationBootstrap = container.resolve<NotificationBootstrap>(
    TOKENS.NotificationBootstrap,
  );
  notificationBootstrap.initialize();

  container.registerSingleton(JobServiceManager);
  const jobServiceManager = container.resolve(JobServiceManager);

  const jobs = getAndResolveAllCronJobs(container);
  jobServiceManager.registerMany(jobs);
  jobServiceManager.initializeAll();

  console.log('📦 DI Container configured');
  console.log('   Stores:');
  console.log('   └─ IUserStore → Using UserStore (Prisma)');
  console.log('   └─ IVaccineStore → Using VaccineStore (Prisma)');
  console.log('   └─ IVaccineBatchStore → Using VaccineBatchStore (Prisma)');
  console.log(
    '   └─ IVaccineApplicationStore → Using VaccineApplicationStore (Prisma)',
  );
  console.log(
    '   └─ IVaccineSchedulingStore → Using VaccineSchedulingStore (Prisma)',
  );
  console.log('   └─ INotificationStore → Using NotificationStore (Prisma)');
  console.log('   Services:');
  console.log('   └─ UserService → Registered as singleton');
  console.log('   └─ VaccineService → Registered as singleton');
  console.log('   └─ VaccineBatchService → Registered as singleton');
  console.log('   └─ VaccineApplicationService → Registered as singleton');
  console.log('   └─ VaccineSchedulingService → Registered as singleton');
  console.log('   └─ NotificationService → Registered as singleton');
  console.log('   Infrastructure:');
  console.log('   └─ IEventBus → Using NodeEventBus (EventEmitter)');

  // Future: Add environment-based switching
  // if (process.env.NODE_ENV === 'test') {
  //   container.registerSingleton(TOKENS.IUserStore, MockUserStore);
  //   console.log('   └─ IUserStore → Using MockUserStore (in-memory)');
  // }
}

// Export the container for manual resolution when needed
// (e.g., in route files to resolve controllers)
export { container };
