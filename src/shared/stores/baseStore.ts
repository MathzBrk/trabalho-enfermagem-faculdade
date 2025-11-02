import prisma from "@infrastructure/database";

export abstract class BaseStore<TModel, TDelegate, TCreateInput, TUpdateInput> {
  protected readonly prisma: typeof prisma;
  protected abstract readonly model: TDelegate;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Busca por ID
   */
  async findById(id: string): Promise<TModel | null> {
    return (this.model as any).findUnique({
      where: { id },
    });
  }

  /**
   * Busca todos
   */
  async findAll(): Promise<TModel[]> {
    return (this.model as any).findMany();
  }

  /**
   * Cria um registro
   */
  async create(data: TCreateInput): Promise<TModel> {
    return (this.model as any).create({
      data,
    });
  }

  /**
   * Atualiza um registro
   */
  async update(id: string, data: TUpdateInput): Promise<TModel> {
    return (this.model as any).update({
      where: { id },
      data,
    });
  }

  /**
   * Deleta um registro (hard delete)
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
        isActive: false,
      },
    });
  }

  /**
   * Conta registros
   */
  async count(where?: any): Promise<number> {
    return (this.model as any).count({ where });
  }

  /**
   * Verifica se existe
   */
  async exists(where: any): Promise<boolean> {
    const count = await (this.model as any).count({ where });
    return count > 0;
  }
}
