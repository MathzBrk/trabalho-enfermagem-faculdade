import { IBaseStore } from "./baseStore";

/**
 * BaseModel Interface
 *
 * Defines the minimum fields required for any model in the mocked store.
 * All models must have an id, createdAt, updatedAt, and deletedAt fields.
 */
export interface BaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/**
 * MockedBaseStore - Abstract base class for all in-memory mock stores
 *
 * Purpose:
 * - Provides generic CRUD operations for testing without database
 * - Eliminates code duplication across mock implementations
 * - Uses Template Method pattern for customization points
 * - Maintains data in Map for O(1) lookups
 *
 * Usage:
 * ```typescript
 * @injectable()
 * export class MockUserStore extends MockedBaseStore<User, Prisma.UserCreateInput, Prisma.UserUpdateInput>
 *   implements IUserStore {
 *
 *   protected seedData(): void {
 *     // Initialize with test data
 *   }
 *
 *   protected createModel(id: string, data: Prisma.UserCreateInput): User {
 *     // Transform input to model
 *   }
 *
 *   // ... implement other abstract methods
 * }
 * ```
 *
 * Design:
 * - Template Method Pattern: Concrete methods call abstract hooks
 * - Strategy Pattern: Child classes define data transformation strategies
 * - Repository Pattern: Abstracts data storage from business logic
 *
 * Benefits:
 * - Code reuse: ~50% reduction in mock store implementations
 * - Consistency: All mocks follow same patterns
 * - Type safety: Full TypeScript generics support
 * - Testability: Easy to create new mock stores
 *
 * @template TModel - The model type (must extend BaseModel)
 * @template TCreateInput - Prisma create input type
 * @template TUpdateInput - Prisma update input type
 */
export abstract class MockedBaseStore<
  TModel extends BaseModel,
  TCreateInput,
  TUpdateInput
> implements IBaseStore<TModel, TCreateInput, TUpdateInput> {

  /**
   * Main data storage using Map for O(1) lookups
   * Key: model ID
   * Value: model instance
   */
  protected data: Map<string, TModel> = new Map();

  /**
   * Auto-incrementing ID counter
   * Child classes should set this after seeding
   */
  protected idCounter: number = 1;

  /**
   * Constructor initializes the store with seed data
   */
  constructor() {
    this.seedData();
  }

  // ============================================
  // Abstract Methods (Template Method Pattern)
  // ============================================

  /**
   * Seeds the store with initial test data
   *
   * Implement this to provide realistic test data for your mock store.
   * Remember to update idCounter to start after seeded IDs.
   *
   * Example:
   * ```typescript
   * protected seedData(): void {
   *   const user1 = { id: "1", name: "John", ... };
   *   this.data.set("1", user1);
   *   this.idCounter = 2; // Start after seeded users
   * }
   * ```
   */
  protected abstract seedData(): void;

  /**
   * Creates a new model instance from input data
   *
   * Transform the Prisma create input into a full model with all required fields.
   *
   * @param id - The generated ID for this model
   * @param data - The input data from create()
   * @returns A complete model instance with timestamps
   *
   * Example:
   * ```typescript
   * protected createModel(id: string, data: Prisma.UserCreateInput): User {
   *   return {
   *     id,
   *     name: data.name,
   *     email: data.email,
   *     createdAt: new Date(),
   *     updatedAt: new Date(),
   *     deletedAt: null,
   *   };
   * }
   * ```
   */
  protected abstract createModel(id: string, data: TCreateInput): TModel;

  /**
   * Updates an existing model with new data
   *
   * Merge the update input with existing model, handling partial updates.
   * Always update the updatedAt timestamp.
   *
   * @param existing - The current model instance
   * @param data - The update data (partial)
   * @returns Updated model instance
   *
   * Example:
   * ```typescript
   * protected updateModel(existing: User, data: Prisma.UserUpdateInput): User {
   *   return {
   *     ...existing,
   *     name: (data.name as string) ?? existing.name,
   *     updatedAt: new Date(),
   *   };
   * }
   * ```
   */
  protected abstract updateModel(existing: TModel, data: TUpdateInput): TModel;

  /**
   * Updates secondary indices when a model changes
   *
   * Implement this to maintain secondary indices for fast lookups
   * (e.g., email -> userId, cpf -> userId).
   *
   * @param id - The model ID
   * @param model - The new/updated model
   * @param old - The old model (for updates/deletes), undefined for creates
   *
   * Example:
   * ```typescript
   * protected updateIndices(id: string, model: User, old?: User): void {
   *   if (old) {
   *     this.emailIndex.delete(old.email);
   *   }
   *   this.emailIndex.set(model.email, id);
   * }
   * ```
   */
  protected abstract updateIndices(id: string, model: TModel, old?: TModel): void;

  /**
   * Clears all secondary indices
   *
   * Called during clear() to reset the store.
   *
   * Example:
   * ```typescript
   * protected clearIndices(): void {
   *   this.emailIndex.clear();
   *   this.cpfIndex.clear();
   * }
   * ```
   */
  protected abstract clearIndices(): void;

  // ============================================
  // IBaseStore Implementation (Concrete Methods)
  // ============================================

  /**
   * Finds a model by its ID
   *
   * @param id - The model ID
   * @returns The model or null if not found
   */
  async findById(id: string): Promise<TModel | null> {
    return this.data.get(id) || null;
  }

  /**
   * Finds all models in the store
   *
   * @returns Array of all models
   */
  async findAll(): Promise<TModel[]> {
    return Array.from(this.data.values());
  }

  /**
   * Creates a new model
   *
   * @param data - The create input data
   * @returns The created model
   */
  async create(data: TCreateInput): Promise<TModel> {
    const id = String(this.idCounter++);
    const model = this.createModel(id, data);

    this.data.set(id, model);
    this.updateIndices(id, model);

    return model;
  }

  /**
   * Updates an existing model
   *
   * @param id - The model ID
   * @param data - The update input data
   * @returns The updated model
   * @throws Error if model not found
   */
  async update(id: string, data: TUpdateInput): Promise<TModel> {
    const existing = this.data.get(id);
    if (!existing) {
      throw new Error(`Model with id ${id} not found`);
    }

    const updated = this.updateModel(existing, data);

    this.data.set(id, updated);
    this.updateIndices(id, updated, existing);

    return updated;
  }

  /**
   * Hard deletes a model from the store
   *
   * @param id - The model ID
   * @returns The deleted model
   * @throws Error if model not found
   */
  async delete(id: string): Promise<TModel> {
    const model = this.data.get(id);
    if (!model) {
      throw new Error(`Model with id ${id} not found`);
    }

    this.data.delete(id);
    this.updateIndices(id, model, model); // Pass same model to signal deletion

    return model;
  }

  /**
   * Soft deletes a model (sets deletedAt and isActive = false)
   *
   * @param id - The model ID
   * @returns The soft-deleted model
   * @throws Error if model not found
   */
  async softDelete(id: string): Promise<TModel> {
    const model = this.data.get(id);
    if (!model) {
      throw new Error(`Model with id ${id} not found`);
    }

    const softDeleted: TModel = {
      ...model,
      deletedAt: new Date(),
      updatedAt: new Date(),
    } as TModel;

    this.data.set(id, softDeleted);
    this.updateIndices(id, softDeleted, model);

    return softDeleted;
  }

  /**
   * Counts models matching a where clause
   *
   * @param where - Optional filter conditions
   * @returns Number of matching models
   */
  async count(where?: any): Promise<number> {
    if (!where) {
      return this.data.size;
    }

    const models = Array.from(this.data.values());
    return models.filter(model => this.matchesWhere(model, where)).length;
  }

  /**
   * Checks if any model matches a where clause
   *
   * @param where - Filter conditions
   * @returns True if at least one model matches
   */
  async exists(where: any): Promise<boolean> {
    const count = await this.count(where);
    return count > 0;
  }

  // ============================================
  // Helper Methods for Testing
  // ============================================

  /**
   * Clears all data from the store
   *
   * Useful for test isolation between test cases.
   * Resets ID counter to 1.
   */
  clear(): void {
    this.data.clear();
    this.clearIndices();
    this.idCounter = 1;
  }

  /**
   * Resets the store to initial seeded state
   *
   * Useful for resetting between test suites.
   * Clears everything and re-seeds.
   */
  reset(): void {
    this.clear();
    this.seedData();
  }

  /**
   * Simple where clause matching
   *
   * Supports basic equality checks only.
   * For complex queries, override this method in child classes.
   *
   * @param model - The model to check
   * @param where - Filter conditions
   * @returns True if model matches all conditions
   */
  protected matchesWhere(model: TModel, where: any): boolean {
    return Object.entries(where).every(([key, value]) => {
      return (model as any)[key] === value;
    });
  }
}
