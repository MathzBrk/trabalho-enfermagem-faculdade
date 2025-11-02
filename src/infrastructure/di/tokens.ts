/**
 * DI Tokens
 *
 * Symbol-based tokens for dependency injection using TSyringe.
 * Using Symbol.for() ensures tokens are globally unique and can be
 * referenced across different modules.
 *
 * Benefits of Symbol-based tokens:
 * - Type-safe: TypeScript can infer the type from the interface
 * - No string collisions: Symbols are guaranteed unique
 * - Clear naming: Tokens match interface names
 * - Refactor-safe: Can rename implementations without breaking DI
 */

export const TOKENS = {
  /**
   * Token for IUserStore interface
   *
   * Implementations:
   * - UserStore (Prisma-based, production)
   * - MockUserStore (in-memory, testing/development)
   */
  IUserStore: Symbol.for('IUserStore'),
} as const;
