# API Setup - Estrutura Completa

## 🎉 Configuração Concluída!

A API está completa e pronta para uso. Veja a estrutura criada:

## 📁 Estrutura Final

```
src/
├── index.ts                          # Entry point - inicia servidor
│
├── infrastructure/
│   ├── http/
│   │   └── app.ts                    # Express app setup
│   ├── routes/
│   │   ├── index.ts                  # Combina todas as rotas
│   │   └── user.routes.ts            # Rotas de usuário
│   └── database/
│       └── ...                       # Prisma (já configurado)
│
├── modules/
│   └── user/
│       ├── controllers/
│       │   └── userController.ts     # HTTP handlers
│       ├── services/
│       │   └── userService.ts        # Business logic
│       └── stores/
│           └── UserStore.ts          # Database access
│
└── shared/
    ├── middlewares/
    │   └── errorHandler.ts           # Global error handling
    ├── helpers/
    │   └── passwordHelper.ts         # Utilities
    └── models/
        └── user.ts                   # Types/Interfaces
```

---

## 🚀 Como Executar

### 1. Iniciar PostgreSQL
```bash
npm run docker:up
```

### 2. Gerar Prisma Client (se ainda não fez)
```bash
npm run prisma:generate
```

### 3. Aplicar Migrations
```bash
npx prisma migrate dev --name init
```

### 4. Iniciar API
```bash
npm run start:dev
```

**Servidor rodando em:** `http://localhost:3000`

---

## 📡 Endpoints Disponíveis

### Root
```http
GET http://localhost:3000/
```
Retorna informações da API

### Health Check
```http
GET http://localhost:3000/api/health
```
Verifica se a API está funcionando

### Criar Usuário
```http
POST http://localhost:3000/api/users
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123",
  "cpf": "12345678900",
  "role": "EMPLOYEE"
}
```

**Roles disponíveis:**
- `EMPLOYEE` - Funcionário comum
- `NURSE` - Enfermeiro (requer `coren`)
- `MANAGER` - Gestor

---

## 🧪 Testando com cURL

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Criar Usuário Funcionário
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "senha123",
    "cpf": "12345678900",
    "role": "EMPLOYEE",
    "phone": "11999999999"
  }'
```

### Criar Enfermeiro
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Enfermeira",
    "email": "maria@example.com",
    "password": "senha123",
    "cpf": "98765432100",
    "role": "NURSE",
    "coren": "COREN-123456"
  }'
```

---

## 🔄 Fluxo de uma Request

```
HTTP Request
    ↓
[index.ts] - Servidor Express
    ↓
[app.ts] - Middlewares globais
    ↓
[routes/index.ts] - Roteamento
    ↓
[user.routes.ts] - Rotas específicas
    ↓
[userController.ts] - Validação HTTP
    ↓
[userService.ts] - Regras de negócio
    ↓
[UserStore.ts] - Acesso ao banco
    ↓
[Prisma] - ORM
    ↓
[PostgreSQL] - Banco de dados
```

---

## 🛡️ Error Handling

A API usa um middleware centralizado de erro em `errorHandler.ts`.

### Tipos de Erro:

#### 400 Bad Request
Erros de validação ou regras de negócio:
```json
{
  "error": "Email already registered"
}
```

#### 404 Not Found
Rota não encontrada:
```json
{
  "error": "Route not found",
  "path": "/api/invalid"
}
```

#### 409 Conflict
Violação de constraint única (Prisma):
```json
{
  "error": "Resource already exists",
  "field": ["email"]
}
```

#### 500 Internal Server Error
Erro inesperado:
```json
{
  "error": "Internal server error"
}
```

---

## 📝 Middlewares Aplicados

### Global (em todas as rotas)

1. **express.json()** - Parse JSON bodies
2. **express.urlencoded()** - Parse URL-encoded bodies
3. **Request Logger** - Log de todas requests
4. **Error Handler** - Tratamento de erros centralizado

### Específicos (a serem adicionados)

- **Authentication** - JWT validation
- **Rate Limiting** - Prevenir abuse
- **CORS** - Cross-origin requests
- **Validation** - Zod/Joi validation

---

## 🔐 Segurança Implementada

✅ **Password Hashing** - bcrypt com salt 10
✅ **Password não retornado** - UserResponse omite senha
✅ **Validação de duplicados** - Email, CPF, COREN únicos
✅ **Error messages sanitized** - Não expõe internals

---

## 🎯 Próximos Passos

### Autenticação
1. Criar `AuthService` e `AuthController`
2. Implementar JWT (login, refresh token)
3. Criar middleware de autenticação
4. Proteger rotas que precisam de auth

### Validação Robusta
1. Adicionar Zod schemas
2. Criar middleware de validação
3. Validar CPF, email, COREN com regex

### Outros Módulos
Seguir o mesmo padrão de User:
1. **Vaccines** - CRUD de vacinas
2. **Scheduling** - Agendamentos
3. **Application** - Aplicação de vacinas
4. **Reports** - Relatórios

### Melhorias
1. Add Swagger/OpenAPI docs
2. Add rate limiting
3. Add CORS configuration
4. Add logging (Winston/Pino)
5. Add tests (Jest)

---

## 📚 Documentação de Referência

- **UserController**: `src/modules/user/controllers/userController.ts`
- **UserService**: `src/modules/user/services/userService.ts`
- **UserStore**: `src/modules/user/stores/UserStore.ts`
- **Routes**: `src/infrastructure/routes/`

Use esses como **template** para criar novos módulos!

---

## 🐛 Troubleshooting

### Erro: Cannot find module '@infrastructure/...'
```bash
# Compile novamente
npm run build
# Ou reinicie o dev server
npm run start:dev
```

### Erro: Port 3000 already in use
```bash
# Mude a porta no .env
APP_PORT=3001
```

### Erro: Database connection
```bash
# Verifique se o Docker está rodando
npm run docker:logs

# Reinicie se necessário
npm run docker:reset
```

---

Tudo pronto! 🎉 Sua API está funcionando!
