# UserStore - Usage Guide

## What is a Store?

The **Store** is the layer responsible for **accessing the database**. It is an abstraction over the Prisma Client that provides specific methods for each entity.

### Hierarchy

```
BaseStore (abstract class)
    ↓ inherits
UserStore (concrete implementation)
```

---

## Available Methods

### ✅ Inherited from BaseStore (ready to use)

```typescript
const userStore = new UserStore();

// Basic CRUD
await userStore.findById(id)           // Find by ID
await userStore.findAll()              // Find all
await userStore.create(data)           // Create
await userStore.update(id, data)       // Update
await userStore.delete(id)             // Delete (hard delete)
await userStore.softDelete(id)         // Delete (soft delete)
await userStore.count()                // Count all
await userStore.exists({ email })      // Check if exists
```

### ✨ User-Specific Methods

```typescript
// Find by unique fields
await userStore.findByEmail(email)
await userStore.findByCPF(cpf)
await userStore.findByCOREN(coren)

// Find by role
await userStore.findByRole("NURSE")
await userStore.findActiveNurses()
await userStore.findActiveManagers()

// Find with relationships
await userStore.findByIdWithRelations(id)

// Validations
await userStore.emailExists(email)
await userStore.cpfExists(cpf)
await userStore.corenExists(coren)

// Specific operations
await userStore.updatePassword(id, hashedPassword)
await userStore.toggleActive(id, true)

// Counters
await userStore.countByRole("EMPLOYEE")
await userStore.countActive()
```

---

## Usage Examples

### 1. Import the Store

```typescript
import { UserStore } from "@modules/user/stores/UserStore";

// Create instance
const userStore = new UserStore();
```

### 2. Create User

```typescript
const newUser = await userStore.create({
  name: "João Silva",
  email: "joao@example.com",
  password: "hashed_password_here",
  cpf: "12345678900",
  role: "EMPLOYEE",
});
```

### 3. Find User

```typescript
// By ID
const user = await userStore.findById("uuid-123");

// By email
const user = await userStore.findByEmail("joao@example.com");

// By CPF
const user = await userStore.findByCPF("12345678900");
```

### 4. Validate Before Creating

```typescript
// Check if email already exists
if (await userStore.emailExists(email)) {
  throw new Error("Email already registered");
}

// Check if CPF already exists
if (await userStore.cpfExists(cpf)) {
  throw new Error("CPF already registered");
}

// If validations pass, create
const user = await userStore.create(userData);
```

### 5. List by Role

```typescript
// List all nurses
const nurses = await userStore.findByRole("NURSE");

// Only active nurses
const activeNurses = await userStore.findActiveNurses();

// Only active managers
const managers = await userStore.findActiveManagers();
```

### 6. Find with Relationships

```typescript
const userWithData = await userStore.findByIdWithRelations("uuid-123");

// Returns:
// {
//   id: "uuid-123",
//   name: "João",
//   email: "joao@example.com",
//   // ... other fields
//   schedulingsReceived: [...],      // Appointments
//   applicationsReceived: [...],     // Vaccines received
//   applicationsPerformed: [...],    // Vaccines administered (if nurse)
//   notifications: [...]             // Unread notifications
// }
```

### 7. Update User

```typescript
// Simple update
const updated = await userStore.update("uuid-123", {
  name: "João Santos",
  phone: "11999999999",
});

// Update password
await userStore.updatePassword("uuid-123", hashedPassword);

// Activate/Deactivate
await userStore.toggleActive("uuid-123", false);
```

### 8. Delete User

```typescript
// Soft delete (recommended - maintains history)
await userStore.softDelete("uuid-123");

// Hard delete (removes completely)
await userStore.delete("uuid-123");
```

---

## Usage in Services

The UserStore **should not be used directly in controllers**. Use it through a Service:

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
   * Creates a new user
   */
  async createUser(data: CreateUserDTO) {
    // Validations
    if (await this.userStore.emailExists(data.email)) {
      throw new Error("Email already registered");
    }

    if (await this.userStore.cpfExists(data.cpf)) {
      throw new Error("CPF already registered");
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create in database
    return this.userStore.create({
      ...data,
      password: hashedPassword,
    });
  }

  /**
   * Finds user by ID
   */
  async getUserById(id: string) {
    const user = await this.userStore.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  /**
   * Lists available nurses
   */
  async getAvailableNurses() {
    return this.userStore.findActiveNurses();
  }
}
```

---

## Creating Stores for Other Modules

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

## Architecture Pattern

```
Controller → Service → Store → Prisma → Database
   ↓           ↓         ↓
Receives    Business   Accesses
Request     Logic      Database
```

### Responsibilities

- **Controller**: Receives HTTP request, validates input, calls service
- **Service**: Business logic, complex validations, uses stores
- **Store**: Accesses database, queries, no business logic
- **Prisma**: ORM that executes SQL queries

---

## Transactions

When you need transactions (multiple atomic operations):

```typescript
export class UserService {
  private userStore: UserStore;

  async createUserWithNotification(userData: CreateUserDTO) {
    // Access prisma directly for transaction
    return this.userStore.prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: userData,
      });

      // Create notification
      await tx.notification.create({
        data: {
          userId: user.id,
          type: "GENERAL",
          title: "Welcome!",
          message: "Your account has been created",
        },
      });

      return user;
    });
  }
}
```

---

## Testing

Makes it easy to create mocks for testing:

```typescript
// Mock of UserStore
class MockUserStore extends UserStore {
  async findByEmail(email: string) {
    return {
      id: "mock-id",
      email,
      name: "Mock User",
      // ... other fields
    } as User;
  }
}

// Use in test
const mockStore = new MockUserStore();
const service = new UserService();
service.userStore = mockStore; // Inject the mock
```

---

## Summary

✅ **Store** = Database access
✅ **BaseStore** = Generic CRUD methods
✅ **UserStore** = User-specific methods
✅ **Inheritance** = Avoids code duplication
✅ **Type-safe** = TypeScript knows the types
✅ **Testable** = Easy to create mocks
