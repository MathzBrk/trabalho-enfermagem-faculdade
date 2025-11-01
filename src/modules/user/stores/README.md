# UserStore - Guia de Uso

## O que é uma Store?

A **Store** é a camada responsável por **acessar o banco de dados**. É uma abstração sobre o Prisma Client que fornece métodos específicos para cada entidade.

### Hierarquia

```
BaseStore (classe abstrata)
    ↓ herda
UserStore (implementação concreta)
```

---

## Métodos Disponíveis

### ✅ Herdados do BaseStore (já prontos)

```typescript
const userStore = new UserStore();

// CRUD básico
await userStore.findById(id)           // Buscar por ID
await userStore.findAll()              // Buscar todos
await userStore.create(data)           // Criar
await userStore.update(id, data)       // Atualizar
await userStore.delete(id)             // Deletar (hard delete)
await userStore.softDelete(id)         // Deletar (soft delete)
await userStore.count()                // Contar todos
await userStore.exists({ email })      // Verificar se existe
```

### ✨ Métodos Específicos do User

```typescript
// Buscar por campos únicos
await userStore.findByEmail(email)
await userStore.findByCPF(cpf)
await userStore.findByCOREN(coren)

// Buscar por role
await userStore.findByRole("NURSE")
await userStore.findActiveNurses()
await userStore.findActiveManagers()

// Buscar com relacionamentos
await userStore.findByIdWithRelations(id)

// Validações
await userStore.emailExists(email)
await userStore.cpfExists(cpf)
await userStore.corenExists(coren)

// Operações específicas
await userStore.updatePassword(id, hashedPassword)
await userStore.toggleActive(id, true)

// Contadores
await userStore.countByRole("EMPLOYEE")
await userStore.countActive()
```

---

## Exemplos de Uso

### 1. Importar a Store

```typescript
import { UserStore } from "@modules/user/stores/UserStore";

// Criar instância
const userStore = new UserStore();
```

### 2. Criar Usuário

```typescript
const newUser = await userStore.create({
  name: "João Silva",
  email: "joao@example.com",
  password: "hashed_password_here",
  cpf: "12345678900",
  role: "EMPLOYEE",
});
```

### 3. Buscar Usuário

```typescript
// Por ID
const user = await userStore.findById("uuid-123");

// Por email
const user = await userStore.findByEmail("joao@example.com");

// Por CPF
const user = await userStore.findByCPF("12345678900");
```

### 4. Validar antes de criar

```typescript
// Verificar se email já existe
if (await userStore.emailExists(email)) {
  throw new Error("Email já cadastrado");
}

// Verificar se CPF já existe
if (await userStore.cpfExists(cpf)) {
  throw new Error("CPF já cadastrado");
}

// Se passou nas validações, criar
const user = await userStore.create(userData);
```

### 5. Listar por Role

```typescript
// Listar todos os enfermeiros
const nurses = await userStore.findByRole("NURSE");

// Apenas enfermeiros ativos
const activeNurses = await userStore.findActiveNurses();

// Apenas gestores ativos
const managers = await userStore.findActiveManagers();
```

### 6. Buscar com Relacionamentos

```typescript
const userWithData = await userStore.findByIdWithRelations("uuid-123");

// Retorna:
// {
//   id: "uuid-123",
//   name: "João",
//   email: "joao@example.com",
//   // ... outros campos
//   schedulingsReceived: [...],      // Agendamentos
//   applicationsReceived: [...],     // Vacinas recebidas
//   applicationsPerformed: [...],    // Vacinas aplicadas (se enfermeiro)
//   notifications: [...]             // Notificações não lidas
// }
```

### 7. Atualizar Usuário

```typescript
// Atualização simples
const updated = await userStore.update("uuid-123", {
  name: "João Santos",
  phone: "11999999999",
});

// Atualizar senha
await userStore.updatePassword("uuid-123", hashedPassword);

// Ativar/Desativar
await userStore.toggleActive("uuid-123", false);
```

### 8. Deletar Usuário

```typescript
// Soft delete (recomendado - mantém histórico)
await userStore.softDelete("uuid-123");

// Hard delete (remove completamente)
await userStore.delete("uuid-123");
```

---

## Uso em Services

A UserStore **não deve ser usada diretamente nos controllers**. Use através de um Service:

```typescript
// src/modules/user/services/UserService.ts
import { UserStore } from "../stores/UserStore";
import { hashPassword } from "@shared/helpers/passwordHelper";

export class UserService {
  private userStore: UserStore;

  constructor() {
    this.userStore = new UserStore();
  }

  /**
   * Cria um novo usuário
   */
  async createUser(data: CreateUserDTO) {
    // Validações
    if (await this.userStore.emailExists(data.email)) {
      throw new Error("Email já cadastrado");
    }

    if (await this.userStore.cpfExists(data.cpf)) {
      throw new Error("CPF já cadastrado");
    }

    // Hash da senha
    const hashedPassword = await hashPassword(data.password);

    // Criar no banco
    return this.userStore.create({
      ...data,
      password: hashedPassword,
    });
  }

  /**
   * Busca usuário por ID
   */
  async getUserById(id: string) {
    const user = await this.userStore.findById(id);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }
    return user;
  }

  /**
   * Lista enfermeiros disponíveis
   */
  async getAvailableNurses() {
    return this.userStore.findActiveNurses();
  }
}
```

---

## Criar Stores para Outros Módulos

### VaccineStore

```typescript
import { BaseStore } from "@shared/stores/BaseStore";
import type { Vaccine, Prisma } from "@infrastructure/database";

export class VaccineStore extends BaseStore<Vaccine, Prisma.VaccineDelegate> {
  protected readonly model = this.prisma.vaccine;

  async findByName(name: string) {
    return this.model.findFirst({ where: { name } });
  }

  async findLowStock() {
    return this.model.findMany({
      where: {
        stockQuantity: { lte: this.prisma.vaccine.fields.minStockLevel },
      },
    });
  }

  async findExpiringSoon(days: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.model.findMany({
      where: {
        expirationDate: {
          lte: futureDate,
          gte: new Date(),
        },
      },
    });
  }
}
```

---

## Padrão da Arquitetura

```
Controller → Service → Store → Prisma → Database
   ↓           ↓         ↓
Recebe      Lógica    Acessa
Request     Negócio    Banco
```

### Responsabilidades

- **Controller**: Recebe HTTP request, valida entrada, chama service
- **Service**: Lógica de negócio, validações complexas, usa stores
- **Store**: Acessa banco de dados, queries, sem lógica de negócio
- **Prisma**: ORM que faz queries SQL

---

## Transações

Quando precisar de transações (múltiplas operações atômicas):

```typescript
export class UserService {
  private userStore: UserStore;

  async createUserWithNotification(userData: CreateUserDTO) {
    // Acessa o prisma direto para transação
    return this.userStore.prisma.$transaction(async (tx) => {
      // Criar usuário
      const user = await tx.user.create({
        data: userData,
      });

      // Criar notificação
      await tx.notification.create({
        data: {
          userId: user.id,
          type: "GENERAL",
          title: "Bem-vindo!",
          message: "Sua conta foi criada",
        },
      });

      return user;
    });
  }
}
```

---

## Testes

Facilita criar mocks para testes:

```typescript
// Mock da UserStore
class MockUserStore extends UserStore {
  async findByEmail(email: string) {
    return {
      id: "mock-id",
      email,
      name: "Mock User",
      // ... outros campos
    } as User;
  }
}

// Usar no teste
const mockStore = new MockUserStore();
const service = new UserService();
service.userStore = mockStore; // Injeta o mock
```

---

## Resumo

✅ **Store** = Acesso ao banco de dados
✅ **BaseStore** = Métodos CRUD genéricos
✅ **UserStore** = Métodos específicos do User
✅ **Herança** = Evita duplicação de código
✅ **Type-safe** = TypeScript sabe os tipos
✅ **Testável** = Fácil fazer mocks
