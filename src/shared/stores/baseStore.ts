import prisma from "@infrastructure/database";

/**
 * Base Store - Classe abstrata para stores de dados
 *
 * Fornece métodos CRUD básicos que são herdados por todas as stores.
 * Cada store específica deve definir o model do Prisma que irá usar.
 *
 * @template TModel - Tipo do modelo Prisma (User, Vaccine, etc)
 * @template TDelegate - Tipo do delegate do Prisma (prisma.user, prisma.vaccine, etc)
 *
 * @example
 * ```typescript
 * export class UserStore extends BaseStore<User, Prisma.UserDelegate> {
 *   protected readonly model = this.prisma.user;
 * }
 * ```
 */
export abstract class BaseStore<TModel, TDelegate> {
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
  async create(data: any): Promise<TModel> {
    return (this.model as any).create({
      data,
    });
  }

  /**
   * Atualiza um registro
   */
  async update(id: string, data: any): Promise<TModel> {
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
