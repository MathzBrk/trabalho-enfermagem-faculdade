import type { User, Prisma} from "@infrastructure/database";
import { BaseStore } from "@shared/stores/baseStore";
import { IUserStore, UserFilterParams } from "@shared/interfaces/user";
import { injectable } from "tsyringe";
import { UserDelegate, UserUpdateInput, UserCreateInput } from "@shared/models/user";
import { PaginationParams, PaginatedResponse, calculatePaginationMetadata } from "@shared/interfaces/pagination";
import { allowedSortFields } from "../constants";

/**
 * UserStore - Prisma-based implementation of IUserStore
 *
 * This is the production implementation that uses Prisma ORM for database operations.
 * Registered as singleton in DI container to maintain connection pooling and caching.
 *
 * Herda métodos CRUD básicos do BaseStore:
 * - findById(id)
 * - findAll()
 * - create(data)
 * - update(id, data)
 * - delete(id)
 * - softDelete(id)
 * - count(where?)
 * - exists(where)
 *
 * E adiciona métodos específicos para User
 */

@injectable()
export class UserStore extends BaseStore<User, UserDelegate, UserCreateInput, UserUpdateInput> implements IUserStore {
  // Define o model que será usado pela classe base
  protected readonly model = this.prisma.user;

  /**
   * Busca usuário por email
   *
   * @param email - Email do usuário
   * @returns User ou null se não encontrado
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.model.findUnique({
      where: { email },
    });
  }

  /**
   * Busca usuário por CPF
   *
   * @param cpf - CPF do usuário (11 dígitos)
   * @returns User ou null se não encontrado
   */
  async findByCPF(cpf: string): Promise<User | null> {
    return this.model.findUnique({
      where: { cpf },
    });
  }

  /**
   * Busca usuário por COREN (registro de enfermeiro)
   *
   * @param coren - Número do COREN
   * @returns User ou null se não encontrado
   */
  async findByCOREN(coren: string): Promise<User | null> {
    return this.model.findUnique({
      where: { coren },
    });
  }

  /**
   * Busca usuários por role (perfil)
   *
   * @param role - EMPLOYEE | NURSE | MANAGER
   * @returns Array de usuários
   */
  async findByRole(role: "EMPLOYEE" | "NURSE" | "MANAGER"): Promise<User[]> {
    return this.model.findMany({
      where: { role },
    });
  }

  /**
   * Busca apenas usuários ativos (não deletados)
   *
   * @returns Array de usuários ativos
   */
  async findAllActive(): Promise<User[]> {
    return this.model.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
    });
  }

  /**
   * Busca enfermeiros ativos
   *
   * Útil para listar enfermeiros disponíveis para aplicar vacinas
   *
   * @returns Array de enfermeiros ativos
   */
  async findActiveNurses(): Promise<User[]> {
    return this.model.findMany({
      where: {
        role: "NURSE",
        isActive: true,
        deletedAt: null,
      },
    });
  }

  /**
   * Busca gestores ativos
   *
   * @returns Array de gestores ativos
   */
  async findActiveManagers(): Promise<User[]> {
    return this.model.findMany({
      where: {
        role: "MANAGER",
        isActive: true,
        deletedAt: null,
      },
    });
  }

  /**
   * Busca usuário com todos os relacionamentos incluídos
   *
   * @param id - ID do usuário
   * @returns User com relacionamentos ou null
   */
  async findByIdWithRelations(id: string) {
    return this.model.findUnique({
      where: { id },
      include: {
        schedulingsReceived: true,
        applicationsReceived: true,
        applicationsPerformed: true,
        notifications: {
          where: { isRead: false },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  /**
   * Verifica se email já está em uso
   *
   * @param email - Email a verificar
   * @returns true se já existe
   */
  async emailExists(email: string): Promise<boolean> {
    return this.exists({ email });
  }

  /**
   * Verifica se CPF já está em uso
   *
   * @param cpf - CPF a verificar
   * @returns true se já existe
   */
  async cpfExists(cpf: string): Promise<boolean> {
    return this.exists({ cpf });
  }

  /**
   * Verifica se COREN já está em uso
   *
   * @param coren - COREN a verificar
   * @returns true se já existe
   */
  async corenExists(coren: string): Promise<boolean> {
    return this.exists({ coren });
  }

  /**
   * Atualiza a senha de um usuário
   *
   * @param id - ID do usuário
   * @param hashedPassword - Senha já hasheada
   * @returns User atualizado
   */
  async updatePassword(id: string, hashedPassword: string): Promise<User> {
    return this.model.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  /**
   * Ativa ou desativa um usuário
   *
   * @param id - ID do usuário
   * @param isActive - true para ativar, false para desativar
   * @returns User atualizado
   */
  async toggleActive(id: string, isActive: boolean): Promise<User> {
    return this.model.update({
      where: { id },
      data: { isActive },
    });
  }

  /**
   * Conta usuários por role
   *
   * @param role - EMPLOYEE | NURSE | MANAGER
   * @returns Número de usuários com essa role
   */
  async countByRole(role: "EMPLOYEE" | "NURSE" | "MANAGER"): Promise<number> {
    return this.count({ role });
  }

  /**
   * Conta usuários ativos
   *
   * @returns Número de usuários ativos
   */
  async countActive(): Promise<number> {
    return this.count({
      isActive: true,
      deletedAt: null,
    });
  }

  /**
   * Finds users with pagination, sorting, and optional filtering
   *
   * Implementation Details:
   * - Uses Prisma's skip/take for database-level pagination (efficient)
   * - Executes two queries in parallel: count + data (via Promise.all)
   * - Builds dynamic WHERE clause based on provided filters
   * - Validates sortBy field against whitelist (prevents invalid queries)
   * - Defaults to createdAt DESC if sortBy is invalid or not provided
   *
   * Default Behavior (backward compatible):
   * - isActive: true (only active users)
   * - excludeDeleted: true (exclude soft-deleted users)
   * - role: undefined (all roles)
   *
   * Performance Considerations:
   * - Count query is optimized (only counts, no SELECT *)
   * - Indexed fields (id, email, cpf, role, createdAt) sort faster
   * - Parallel queries reduce total latency by ~50%
   * - Consider adding composite index: (role, isActive, deletedAt)
   *
   * @param params - Pagination and sorting parameters
   * @param filters - Optional filter criteria (role, isActive, excludeDeleted)
   * @returns Paginated list of users matching criteria
   *
   * @example
   * // List all active nurses
   * const result = await userStore.findUsersPaginated(
   *   { page: 1, perPage: 20, sortBy: 'name', sortOrder: 'asc' },
   *   { role: 'NURSE' }
   * );
   *
   * @example
   * // List inactive managers
   * const result = await userStore.findUsersPaginated(
   *   { page: 1, perPage: 20 },
   *   { role: 'MANAGER', isActive: false }
   * );
   */
  async findUsersPaginated(
    params: PaginationParams,
    filters: UserFilterParams = {}
  ): Promise<PaginatedResponse<User>> {
    const { page, perPage, sortBy = 'createdAt', sortOrder = 'desc' } = params;

    // Default filters for backward compatibility
    const {
      role,
      isActive = true,        // Default: only active users
      excludeDeleted = true   // Default: exclude soft-deleted
    } = filters;

    // Build dynamic WHERE clause
    const where: Prisma.UserWhereInput = {};

    if (role !== undefined) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (excludeDeleted) {
      where.deletedAt = null;
    }

    // Validate and sanitize sortBy field
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    // Execute count and data queries in parallel
    const [total, users] = await Promise.all([
      this.model.count({ where }),
      this.model.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: {
          [safeSortBy]: sortOrder,
        },
      }),
    ]);

    // Calculate pagination metadata
    const pagination = calculatePaginationMetadata(page, perPage, total);

    return {
      data: users,
      pagination,
    };
  }
}
