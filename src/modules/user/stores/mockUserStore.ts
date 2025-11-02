import type { User, Prisma } from "@infrastructure/database";
import { IUserStore } from "@shared/interfaces/user";
import { injectable } from "tsyringe";
import { MockedBaseStore } from "@shared/stores/mockedBaseStore";

/**
 * MockUserStore - In-memory implementation of IUserStore
 *
 * Purpose:
 * - Fast testing without database connections
 * - Development mode with quick reset capability
 * - Integration tests that need isolated data
 * - Demo/preview environments
 *
 * Implementation:
 * - Extends MockedBaseStore for CRUD operations
 * - Uses Map for O(1) lookups by ID
 * - Maintains secondary indices for email, CPF, COREN
 * - Pre-seeded with example users
 * - Supports all IUserStore operations
 *
 * Note: This is NOT thread-safe. For production, use UserStore (Prisma).
 */

@injectable()
export class MockUserStore
  extends MockedBaseStore<User, Prisma.UserCreateInput, Prisma.UserUpdateInput>
  implements IUserStore {

  // ============================================
  // Secondary Indices for Fast Lookups
  // ============================================

  private emailIndex: Map<string, string> = new Map(); // email -> userId
  private cpfIndex: Map<string, string> = new Map();   // cpf -> userId
  private corenIndex: Map<string, string> = new Map(); // coren -> userId

  // ============================================
  // Template Method Implementations
  // ============================================

  /**
   * Seeds the store with initial test data
   */
  protected seedData(): void {
    const seedUsers: User[] = [
      {
        id: "1",
        name: "João Silva",
        email: "joao@example.com",
        password: "$2b$10$hashedpassword1", // Password: Password123!
        cpf: "12345678901",
        phone: "11999999999",
        role: "MANAGER",
        isActive: true,
        coren: null,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        deletedAt: null,
      },
      {
        id: "2",
        name: "Maria Santos",
        email: "maria@example.com",
        password: "$2b$10$hashedpassword2", // Password: Password123!
        cpf: "98765432100",
        phone: "11988888888",
        role: "NURSE",
        isActive: true,
        coren: "COREN-SP-123456",
        createdAt: new Date("2024-01-02"),
        updatedAt: new Date("2024-01-02"),
        deletedAt: null,
      },
      {
        id: "3",
        name: "Pedro Costa",
        email: "pedro@example.com",
        password: "$2b$10$hashedpassword3", // Password: Password123!
        cpf: "11122233344",
        phone: "11977777777",
        role: "EMPLOYEE",
        isActive: true,
        coren: null,
        createdAt: new Date("2024-01-03"),
        updatedAt: new Date("2024-01-03"),
        deletedAt: null,
      },
    ];

    for (const user of seedUsers) {
      this.data.set(user.id, user);
      this.emailIndex.set(user.email, user.id);
      this.cpfIndex.set(user.cpf, user.id);
      if (user.coren) {
        this.corenIndex.set(user.coren, user.id);
      }
    }

    this.idCounter = 4; // Start after seeded users
  }

  /**
   * Creates a new User model from input data
   */
  protected createModel(id: string, data: Prisma.UserCreateInput): User {
    const now = new Date();

    return {
      id,
      name: data.name,
      email: data.email,
      password: data.password,
      cpf: data.cpf,
      phone: data.phone || null,
      role: data.role || "EMPLOYEE",
      isActive: data.isActive ?? true,
      coren: data.coren || null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
  }

  /**
   * Updates an existing User with new data
   */
  protected updateModel(existing: User, data: Prisma.UserUpdateInput): User {
    return {
      ...existing,
      name: (data.name as string) ?? existing.name,
      email: (data.email as string) ?? existing.email,
      password: (data.password as string) ?? existing.password,
      cpf: (data.cpf as string) ?? existing.cpf,
      phone: data.phone !== undefined ? (data.phone as string | null) : existing.phone,
      role: (data.role as any) ?? existing.role,
      isActive: data.isActive !== undefined ? (data.isActive as boolean) : existing.isActive,
      coren: data.coren !== undefined ? (data.coren as string | null) : existing.coren,
      updatedAt: new Date(),
    };
  }

  /**
   * Updates secondary indices when a User changes
   */
  protected updateIndices(id: string, model: User, old?: User): void {
    // If old exists and is same as model, it's a delete operation
    if (old && old === model) {
      this.emailIndex.delete(old.email);
      this.cpfIndex.delete(old.cpf);
      if (old.coren) {
        this.corenIndex.delete(old.coren);
      }
      return;
    }

    // Update email index
    if (old && old.email !== model.email) {
      this.emailIndex.delete(old.email);
    }
    this.emailIndex.set(model.email, id);

    // Update CPF index
    if (old && old.cpf !== model.cpf) {
      this.cpfIndex.delete(old.cpf);
    }
    this.cpfIndex.set(model.cpf, id);

    // Update COREN index
    if (old && old.coren && old.coren !== model.coren) {
      this.corenIndex.delete(old.coren);
    }
    if (model.coren) {
      this.corenIndex.set(model.coren, id);
    }
  }

  /**
   * Clears all secondary indices
   */
  protected clearIndices(): void {
    this.emailIndex.clear();
    this.cpfIndex.clear();
    this.corenIndex.clear();
  }

  // ============================================
  // IUserStore Specific Methods
  // ============================================

  /**
   * Busca usuário por email
   *
   * @param email - Email do usuário
   * @returns User ou null se não encontrado
   */
  async findByEmail(email: string): Promise<User | null> {
    const userId = this.emailIndex.get(email);
    if (!userId) return null;
    return this.data.get(userId) || null;
  }

  /**
   * Busca usuário por CPF
   *
   * @param cpf - CPF do usuário (11 dígitos)
   * @returns User ou null se não encontrado
   */
  async findByCPF(cpf: string): Promise<User | null> {
    const userId = this.cpfIndex.get(cpf);
    if (!userId) return null;
    return this.data.get(userId) || null;
  }

  /**
   * Busca usuário por COREN (registro de enfermeiro)
   *
   * @param coren - Número do COREN
   * @returns User ou null se não encontrado
   */
  async findByCOREN(coren: string): Promise<User | null> {
    const userId = this.corenIndex.get(coren);
    if (!userId) return null;
    return this.data.get(userId) || null;
  }

  /**
   * Busca usuários por role (perfil)
   *
   * @param role - EMPLOYEE | NURSE | MANAGER
   * @returns Array de usuários
   */
  async findByRole(role: "EMPLOYEE" | "NURSE" | "MANAGER"): Promise<User[]> {
    return Array.from(this.data.values()).filter(user => user.role === role);
  }

  /**
   * Busca apenas usuários ativos (não deletados)
   *
   * @returns Array de usuários ativos
   */
  async findAllActive(): Promise<User[]> {
    return Array.from(this.data.values()).filter(
      user => user.isActive && !user.deletedAt
    );
  }

  /**
   * Busca enfermeiros ativos
   *
   * Útil para listar enfermeiros disponíveis para aplicar vacinas
   *
   * @returns Array de enfermeiros ativos
   */
  async findActiveNurses(): Promise<User[]> {
    return Array.from(this.data.values()).filter(
      user => user.role === "NURSE" && user.isActive && !user.deletedAt
    );
  }

  /**
   * Busca gestores ativos
   *
   * @returns Array de gestores ativos
   */
  async findActiveManagers(): Promise<User[]> {
    return Array.from(this.data.values()).filter(
      user => user.role === "MANAGER" && user.isActive && !user.deletedAt
    );
  }

  /**
   * Busca usuário com todos os relacionamentos incluídos
   *
   * @param id - ID do usuário
   * @returns User com relacionamentos ou null
   */
  async findByIdWithRelations(id: string): Promise<User | null> {
    // Mock implementation doesn't support relations
    // In a real test scenario, you'd need to mock related data too
    return this.findById(id);
  }

  /**
   * Verifica se email já está em uso
   *
   * @param email - Email a verificar
   * @returns true se já existe
   */
  async emailExists(email: string): Promise<boolean> {
    return this.emailIndex.has(email);
  }

  /**
   * Verifica se CPF já está em uso
   *
   * @param cpf - CPF a verificar
   * @returns true se já existe
   */
  async cpfExists(cpf: string): Promise<boolean> {
    return this.cpfIndex.has(cpf);
  }

  /**
   * Verifica se COREN já está em uso
   *
   * @param coren - COREN a verificar
   * @returns true se já existe
   */
  async corenExists(coren: string): Promise<boolean> {
    return this.corenIndex.has(coren);
  }

  /**
   * Atualiza a senha de um usuário
   *
   * @param id - ID do usuário
   * @param hashedPassword - Senha já hasheada
   * @returns User atualizado
   */
  async updatePassword(id: string, hashedPassword: string): Promise<User> {
    return this.update(id, { password: hashedPassword });
  }

  /**
   * Ativa ou desativa um usuário
   *
   * @param id - ID do usuário
   * @param isActive - true para ativar, false para desativar
   * @returns User atualizado
   */
  async toggleActive(id: string, isActive: boolean): Promise<User> {
    return this.update(id, { isActive });
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
}
