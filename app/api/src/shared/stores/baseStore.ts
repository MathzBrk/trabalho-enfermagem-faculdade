import prisma from '@infrastructure/database';

export interface IBaseStore<TModel, TCreateInput, TUpdateInput> {
  findById(id: string): Promise<TModel | null>;
  findAll(): Promise<TModel[]>;
  create(data: TCreateInput): Promise<TModel>;
  update(id: string, data: TUpdateInput): Promise<TModel>;
  delete(id: string): Promise<TModel>;
  softDelete(id: string): Promise<TModel>;
  count(where?: any): Promise<number>;
  exists(where: any): Promise<boolean>;
}

export abstract class BaseStore<TModel, TDelegate, TCreateInput, TUpdateInput>
  implements IBaseStore<TModel, TCreateInput, TUpdateInput>
{
  protected readonly prisma: typeof prisma;
  protected abstract readonly model: TDelegate;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Find by ID
   */
  async findById(id: string): Promise<TModel | null> {
    return (this.model as any).findUnique({
      where: { id },
    });
  }

  /**
   * Find all
   */
  async findAll(): Promise<TModel[]> {
    return (this.model as any).findMany();
  }

  /**
   * Create a record
   */
  async create(data: TCreateInput): Promise<TModel> {
    return (this.model as any).create({
      data,
    });
  }

  /**
   * Update a record
   */
  async update(id: string, data: TUpdateInput): Promise<TModel> {
    return (this.model as any).update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a record (hard delete)
   */
  async delete(id: string): Promise<TModel> {
    return (this.model as any).delete({
      where: { id },
    });
  }

  /**
   * Soft delete
   */
  async softDelete(id: string): Promise<TModel> {
    return (this.model as any).update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Count records
   */
  async count(where?: any): Promise<number> {
    return (this.model as any).count({ where });
  }

  /**
   * Check if exists
   */
  async exists(where: any): Promise<boolean> {
    const count = await (this.model as any).count({ where });
    return count > 0;
  }
}
