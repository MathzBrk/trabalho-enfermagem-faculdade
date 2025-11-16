# 📐 Arquitetura de Módulos Backend

Este documento detalha a estrutura e padrões de implementação dos módulos backend do projeto.
Todos os módulos seguem **Clean Architecture** com separação clara de responsabilidades em camadas.

## 🏗️ Estrutura de um Módulo

```
src/modules/{module-name}/
├── index.ts                    # Exports públicos do módulo
├── README.md                   # Documentação específica do módulo
├── controllers/                # Camada HTTP
│   └── {module}Controller.ts   # Request/Response handlers
├── services/                   # Camada de Negócio
│   └── {module}Service.ts      # Lógica de negócio e orquestração
├── stores/                     # Camada de Dados
│   ├── {module}Store.ts        # Implementação Prisma (produção)
│   └── mock{Module}Store.ts    # Implementação Mock (testes)
├── validators/                 # Validação de entrada (Zod)
│   ├── create{Module}Validator.ts
│   ├── update{Module}Validator.ts
│   └── list{Module}Validator.ts
├── errors/                     # Erros específicos do módulo
│   └── index.ts                # Custom errors (extends AppError)
├── types/                      # Tipos específicos do módulo
│   └── {module}Types.ts        # DTOs e tipos auxiliares
└── constants/                  # Constantes do módulo
    └── index.ts                # Valores fixos, enums, configs
```

## 📦 Camadas e Responsabilidades

### 1. **Controller Layer** (HTTP Interface)
**Localização**: `controllers/{Module}Controller.ts`

**Responsabilidades**:
- Receber e validar requisições HTTP
- Chamar métodos do Service
- Formatar respostas HTTP (status codes, JSON)
- Tratar erros e delegar para middleware de erro
- **NÃO contém lógica de negócio**

**Características**:
- Usa decorador `@injectable()` para DI (tsyringe)
- Injeta Service via construtor
- Métodos assíncronos com assinatura `(req, res, next)`
- Usa `try/catch` e delega erros para `next(error)`

**Exemplo**:
```typescript
@injectable()
export class UserController {
  constructor(private readonly userService: UserService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData: CreateUserDTO = req.body;
      const user = await this.userService.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }
}
```

### 2. **Service Layer** (Business Logic)
**Localização**: `services/{Module}Service.ts`

**Responsabilidades**:
- **Lógica de negócio e regras**
- Validação de dados e regras de negócio
- Orquestrar chamadas ao Store
- Transformação de dados (DTOs, hashing, sanitização)
- Autorização (verificar permissões)
- **NÃO lida com HTTP diretamente**

**Características**:
- Usa decorador `@injectable()` para DI
- Injeta Store via construtor usando `@inject(TOKENS.I{Module}Store)`
- Lança erros customizados (ex: `UserNotFoundError`, `ForbiddenError`)
- Métodos bem documentados com JSDoc

**Exemplo**:
```typescript
@injectable()
export class UserService {
  constructor(
    @inject(TOKENS.IUserStore) private readonly userStore: IUserStore
  ) {}

  async createUser(data: CreateUserDTO): Promise<UserResponse> {
    // Validação de unicidade
    await this.validateUserUniqueness(data);

    // Transformação de dados
    const hashedPassword = await hashPassword(data.password);

    // Chamada ao store
    const user = await this.userStore.create({
      ...data,
      email: normalizeEmail(data.email),
      password: hashedPassword,
    });

    // Sanitização da resposta
    return toUserResponse(user);
  }
}
```

### 3. **Store Layer** (Data Access)
**Localização**: `stores/{Module}Store.ts`

**Responsabilidades**:
- **Acesso direto ao banco de dados (Prisma)**
- Operações CRUD básicas
- Queries específicas do domínio
- **NÃO contém lógica de negócio**
- **NÃO faz validações de negócio**

**Características**:
- Usa decorador `@injectable()` para DI
- Estende `BaseStore<Model, Delegate, CreateInput, UpdateInput>`
- Implementa interface `I{Module}Store`
- Herda métodos CRUD básicos do BaseStore
- Adiciona métodos específicos do domínio

**Métodos Herdados do BaseStore**:
- `findById(id)` - Buscar por ID
- `findAll()` - Listar todos
- `create(data)` - Criar registro
- `update(id, data)` - Atualizar registro
- `delete(id)` - Deletar (hard delete)
- `softDelete(id)` - Deletar (soft delete)
- `count(where?)` - Contar registros
- `exists(where)` - Verificar existência

**Exemplo**:
```typescript
@injectable()
export class UserStore
  extends BaseStore<User, UserDelegate, UserCreateInput, UserUpdateInput>
  implements IUserStore
{
  protected readonly model = this.prisma.user;

  // Métodos específicos do domínio
  async findByEmail(email: string): Promise<User | null> {
    return this.model.findUnique({ where: { email } });
  }

  async findUsersPaginated(
    params: PaginationParams,
    filters?: UserFilterParams
  ): Promise<PaginatedResponse<User>> {
    // Implementação com Prisma
  }
}
```

### 4. **Validators** (Input Validation)
**Localização**: `validators/{action}Validator.ts`

**Responsabilidades**:
- Validar estrutura e formato de dados de entrada
- Usar **Zod** para schemas de validação
- Exportar schemas e tipos TypeScript inferidos

**Exemplo**:
```typescript
import { z } from 'zod';

export const CreateUserSchema = z.object({
  name: z.string().min(2).max(255).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain number'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF must be 11 digits'),
  role: z.enum(['EMPLOYEE', 'NURSE', 'MANAGER']),
});

export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
```

### 5. **Errors** (Custom Errors)
**Localização**: `errors/index.ts`

**Responsabilidades**:
- Definir erros específicos do domínio
- Estender `AppError` (base class)
- Incluir statusCode HTTP apropriado

**Exemplo**:
```typescript
export class UserNotFoundError extends AppError {
  constructor(message: string = 'User not found') {
    super(message, 404);
    this.name = 'UserNotFoundError';
  }
}

export class EmailAlreadyExistsError extends AppError {
  constructor(message: string = 'Email already registered') {
    super(message, 409);
    this.name = 'EmailAlreadyExistsError';
  }
}
```

## 🔄 Fluxo de uma Requisição

```
HTTP Request
    ↓
[Middleware] validateRequest (Zod validation)
    ↓
[Controller] Recebe req/res, extrai dados
    ↓
[Service] Aplica regras de negócio, orquestra
    ↓
[Store] Acessa banco via Prisma
    ↓
[Database] PostgreSQL
    ↓
[Store] Retorna entidade
    ↓
[Service] Transforma/sanitiza dados (remove password)
    ↓
[Controller] Formata resposta HTTP
    ↓
HTTP Response (JSON)
```

## 📝 Exports Públicos (index.ts)

Cada módulo expõe apenas os componentes principais via `index.ts`:

```typescript
// src/modules/{module}/index.ts
export { ModuleController } from './controllers/moduleController';
export { ModuleService } from './services/moduleService';
export { ModuleStore } from './stores/moduleStore';
```

**Importação recomendada**:
```typescript
import { UserController, UserService, UserStore } from '@modules/user';
```

## 🧪 Dependency Injection (DI)

O projeto usa **tsyringe** para injeção de dependências:

1. **Registrar no container** (`src/infrastructure/di/container.ts`):
```typescript
container.registerSingleton<IUserStore>(TOKENS.IUserStore, UserStore);
container.registerSingleton<UserService>(UserService);
container.registerSingleton<UserController>(UserController);
```

2. **Injetar no Service**:
```typescript
@injectable()
export class UserService {
  constructor(
    @inject(TOKENS.IUserStore) private readonly userStore: IUserStore
  ) {}
}
```

3. **Injetar no Controller**:
```typescript
@injectable()
export class UserController {
  constructor(private readonly userService: UserService) {}
}
```

## ✅ Convenções e Boas Práticas

### Nomenclatura:
- **Controllers**: `{Module}Controller.ts` (ex: `UserController`)
- **Services**: `{Module}Service.ts` (ex: `UserService`)
- **Stores**: `{Module}Store.ts` (ex: `UserStore`)
- **Interfaces**: `I{Module}Store` (ex: `IUserStore`)
- **DTOs**: `Create{Module}DTO`, `Update{Module}DTO`
- **Errors**: `{Entity}{Action}Error` (ex: `UserNotFoundError`)

### Regras:
1. **Controller**: Nunca contém lógica de negócio
2. **Service**: Nunca lida com HTTP diretamente
3. **Store**: Nunca faz validações de negócio
4. **Validators**: Sempre usar Zod para validação de entrada
5. **Errors**: Sempre estender `AppError` com statusCode apropriado
6. **DTOs**: Sempre inferir tipos do Zod (`z.infer<typeof Schema>`)
7. **Responses**: Sempre remover dados sensíveis (passwords, tokens internos)
8. **Soft Delete**: Usar `deletedAt` ao invés de hard delete
9. **Timestamps**: Sempre incluir `createdAt`, `updatedAt`, `deletedAt`

## 📚 Exemplo Completo: Módulo User

```
src/modules/user/
├── index.ts                          # Exports: Controller, Service, Store
├── README.md                         # Documentação completa do módulo
├── controllers/
│   ├── userController.ts             # CRUD de usuários
│   └── authController.ts             # Login, registro, logout
├── services/
│   ├── userService.ts                # Lógica de gestão de usuários
│   └── authService.ts                # Lógica de autenticação
├── stores/
│   ├── userStore.ts                  # Prisma implementation
│   ├── mockUserStore.ts              # Mock para testes
│   └── README.md                     # Docs sobre stores
├── validators/
│   ├── registerValidator.ts          # Schema de registro (Zod)
│   ├── loginValidator.ts             # Schema de login (Zod)
│   ├── updateUserValidator.ts        # Schema de atualização (Zod)
│   ├── listUsersValidator.ts         # Schema de listagem (Zod)
│   └── idParamValidator.ts           # Schema de params (Zod)
├── errors/
│   └── index.ts                      # UserNotFoundError, EmailAlreadyExistsError, etc
├── types/
│   ├── userTypes.ts                  # DTOs específicos
│   └── authTypes.ts                  # Tipos de autenticação
└── constants/
    └── index.ts                      # Campos permitidos para sort, etc
```

## 🔍 Como Criar um Novo Módulo

1. **Copie a estrutura** de um módulo existente (ex: `user`)
2. **Crie as interfaces** em `src/shared/interfaces/{module}.ts`
3. **Crie os models** em `src/shared/models/{module}.ts`
4. **Implemente Store** → **Service** → **Controller** (nessa ordem)
5. **Adicione validators** com Zod
6. **Defina errors** customizados
7. **Registre no DI container**
8. **Crie rotas** em `src/routes/{module}Routes.ts`
9. **Documente** no README.md do módulo

## 🎯 Benefícios desta Arquitetura

✅ **Testabilidade**: Cada camada pode ser testada isoladamente
✅ **Manutenibilidade**: Separação clara de responsabilidades
✅ **Escalabilidade**: Fácil adicionar novos módulos
✅ **Flexibilidade**: Trocar Store (Prisma ↔ Mock) sem afetar Service
✅ **Type Safety**: TypeScript + Zod para validação em runtime
✅ **Consistência**: Todos os módulos seguem o mesmo padrão
✅ **Reutilização**: BaseStore fornece métodos CRUD comuns
