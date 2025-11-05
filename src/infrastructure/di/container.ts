import { container } from 'tsyringe';
import { UserStore } from '@modules/user/stores/userStore';
import { UserService } from '@modules/user/services/userService';
import { VaccineStore } from '@modules/vaccines/stores/vaccineStore';
import { TOKENS } from './tokens';

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
 * - Interface-based: Services depend on IUserStore interface, not concrete class
 * - Service-to-Service: Services can depend on other services (e.g., VaccineService → UserService)
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

  // Register services as singletons
  // Services are stateless and can be safely shared across the application
  // This follows the Service → Service communication pattern for proper encapsulation
  container.registerSingleton(TOKENS.UserService, UserService);

  console.log('📦 DI Container configured');
  console.log('   Stores:');
  console.log('   └─ IUserStore → Using UserStore (Prisma)');
  console.log('   └─ IVaccineStore → Using VaccineStore (Prisma)');
  console.log('   Services:');
  console.log('   └─ UserService → Registered as singleton');

  // Future: Add environment-based switching
  // if (process.env.NODE_ENV === 'test') {
  //   container.registerSingleton(TOKENS.IUserStore, MockUserStore);
  //   console.log('   └─ IUserStore → Using MockUserStore (in-memory)');
  // }
}

// Export the container for manual resolution when needed
// (e.g., in route files to resolve controllers)
export { container };
