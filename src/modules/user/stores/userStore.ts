import { BaseStore } from "@shared/stores/BaseStore";
import type { User, Prisma } from "@infrastructure/database";

/**
 * UserStore - Store responsável por operações de banco de dados relacionadas a usuários
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

export class UserStore extends BaseStore<User, Prisma.UserDelegate> {
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
}
