# User Module

This module handles all user-related operations following Clean Architecture principles.

## Architecture

```
src/modules/user/
├── controllers/
│   └── UserController.ts    # HTTP request handlers
├── services/
│   └── UserService.ts        # Business logic layer
├── stores/
│   └── UserStore.ts          # Database access layer
└── index.ts                  # Public API exports
```

## Layers

### 1. Store Layer (Data Access)
**Location**: `stores/UserStore.ts`

- Direct database interaction via Prisma
- CRUD operations
- Database-specific queries
- No business logic

**Example**:
```typescript
const userStore = new UserStore();
const user = await userStore.findByEmail("user@example.com");
```

### 2. Service Layer (Business Logic)
**Location**: `services/UserService.ts`

- Business rules enforcement
- Data validation
- Orchestrates store operations
- No HTTP concerns

**Example**:
```typescript
const userService = new UserService();
const user = await userService.createUser({
  name: "João Silva",
  email: "joao@example.com",
  password: "securepass123",
  cpf: "12345678900",
  role: "EMPLOYEE"
});
```

### 3. Controller Layer (HTTP)
**Location**: `controllers/UserController.ts`

- HTTP request/response handling
- Request validation
- Status code management
- Error formatting

**Example**:
```typescript
const userController = new UserController();
app.post("/users", userController.create.bind(userController));
```

## Usage Example (Routes)

When you create routes, use it like this:

```typescript
import { Router } from "express";
import { UserController } from "@modules/user";

const router = Router();
const userController = new UserController();

// POST /users - Create new user
router.post("/users", userController.create.bind(userController));

export default router;
```

## API Endpoints

### Create User
**POST** `/users`

**Request Body**:
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "securepass123",
  "cpf": "12345678900",
  "phone": "+5531999999999",
  "role": "EMPLOYEE"
}
```

For NURSE role, COREN is required:
```json
{
  "name": "Maria Santos",
  "email": "maria@example.com",
  "password": "securepass123",
  "cpf": "98765432100",
  "role": "NURSE",
  "coren": "123456-MG"
}
```

**Success Response** (201 Created):
```json
{
  "id": "uuid-here",
  "name": "João Silva",
  "email": "joao@example.com",
  "cpf": "12345678900",
  "phone": "+5531999999999",
  "role": "EMPLOYEE",
  "coren": null,
  "isActive": true,
  "createdAt": "2025-10-30T12:00:00.000Z",
  "updatedAt": "2025-10-30T12:00:00.000Z"
}
```

**Error Responses**:

400 Bad Request - Missing fields:
```json
{
  "error": "Missing required fields",
  "required": ["name", "email", "password", "cpf", "role"]
}
```

400 Bad Request - Invalid role:
```json
{
  "error": "Invalid role",
  "validRoles": ["EMPLOYEE", "NURSE", "MANAGER"]
}
```

400 Bad Request - Duplicate email:
```json
{
  "error": "Email already registered"
}
```

400 Bad Request - Duplicate CPF:
```json
{
  "error": "CPF already registered"
}
```

400 Bad Request - Missing COREN for NURSE:
```json
{
  "error": "COREN is required for NURSE role"
}
```

500 Internal Server Error:
```json
{
  "error": "Internal server error"
}
```

## Business Rules

1. **Email Uniqueness**: Each email must be unique in the system
2. **CPF Uniqueness**: Each CPF must be unique in the system
3. **COREN for Nurses**: NURSE role requires a valid and unique COREN
4. **Password Security**: All passwords are hashed using bcrypt before storage
5. **Data Sanitization**: Password is never returned in responses

## Next Steps

This implementation provides a solid foundation. Future improvements:

1. Add input validation library (e.g., Zod, Yup)
2. Add authentication/authorization middleware
3. Add pagination for list endpoints
4. Add filtering and sorting
5. Add unit and integration tests
6. Add API documentation (Swagger/OpenAPI)
