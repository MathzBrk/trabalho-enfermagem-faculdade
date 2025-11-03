import { container } from 'tsyringe';
import { UserStore } from '@modules/user/stores/userStore';
import { VaccineStore } from '@modules/vaccines/stores/vaccineStore';
import { UserService } from '@modules/user/services/userService';
import { AuthService } from '@modules/user/services/authService';
import { TOKENS } from './tokens';

/**
 * DI Container Setup
 *
 * Configures and initializes the TSyringe dependency injection container.
 * This function should be called once at application startup, before any
 * controllers or services are instantiated.
 *
 * Container Registration Strategy:
 * - SINGLETON: UserStore is registered as singleton to maintain shared cache
 *   and connection pooling across the application lifecycle
 * - Interface-based: Services depend on IUserStore interface, not concrete class
 * - Environment-aware: Can switch between UserStore and MockUserStore based on NODE_ENV
 *
 * Why Singleton for Stores?
 * - Maintains consistent state across all service instances
 * - Optimizes database connection pooling
 * - Enables caching strategies at the store level
 * - Reduces memory overhead by reusing the same instance
 */
export function setupContainer(): void {
  // Register stores as singleton implementation for their interfaces
  // Using singleton ensures all services share the same store instance,
  // which is critical for caching and connection pooling
  container.registerSingleton(TOKENS.IUserStore, UserStore);
  container.registerSingleton(TOKENS.IVaccineStore, VaccineStore);

  // Register services
  container.registerSingleton('UserService', UserService);
  container.registerSingleton('AuthService', AuthService);

  console.log('📦 DI Container configured');
  console.log('   └─ IUserStore → Using UserStore (Prisma)');
  console.log('   └─ IVaccineStore → Using VaccineStore (Prisma)');
  console.log('   └─ UserService → Registered');
  console.log('   └─ AuthService → Registered');

  // Future: Add environment-based switching
  // if (process.env.NODE_ENV === 'test') {
  //   container.registerSingleton(TOKENS.IUserStore, MockUserStore);
  //   console.log('   └─ IUserStore → Using MockUserStore (in-memory)');
  // }
}

// Export the container for manual resolution when needed
// (e.g., in route files to resolve controllers)
export { container };
