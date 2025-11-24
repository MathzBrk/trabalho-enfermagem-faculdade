# User API Documentation

## Overview

The User API provides endpoints for user management, authentication, and authorization in the vaccination control system. It implements Role-Based Access Control (RBAC) with three user roles: EMPLOYEE, NURSE, and MANAGER.

**Base Path**: `/api/users` and `/api/auth`

**Authentication**: Most endpoints require a valid JWT token in the `Authorization` header (exceptions: login and register).

---

## User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **EMPLOYEE** | Regular system user | Can manage own profile and schedulings |
| **NURSE** | Licensed nurse (requires COREN) | Can view user lists, manage schedulings, apply vaccines |
| **MANAGER** | System administrator | Full access to all resources |

---

## Endpoints

### Authentication Endpoints

#### 1. Register User

Create a new user account and receive a JWT token.

**Endpoint**: `POST /api/auth/register`

**Authentication**: Not required (public endpoint)

**Rate Limiting**: 5 requests per 15 minutes per IP

##### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Full name (3-255 characters) |
| `email` | string | Yes | Valid email address (unique) |
| `password` | string | Yes | Password (minimum 6 characters) |
| `cpf` | string | Yes | Brazilian CPF (11 digits, unique) |
| `phone` | string | No | Phone number |
| `role` | string | Yes | User role: `EMPLOYEE`, `NURSE`, or `MANAGER` |
| `coren` | string | Conditional | Nursing license number (required if role is NURSE, must be unique) |

##### Request Example

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Maria Santos",
  "email": "maria@example.com",
  "password": "securepass123",
  "cpf": "12345678900",
  "phone": "11999999999",
  "role": "NURSE",
  "coren": "COREN-123456"
}
```

##### Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Maria Santos",
      "email": "maria@example.com",
      "cpf": "12345678900",
      "phone": "11999999999",
      "role": "NURSE",
      "coren": "COREN-123456",
      "isActive": true,
      "createdAt": "2025-11-23T10:00:00.000Z",
      "updatedAt": "2025-11-23T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  }
}
```

##### Error Responses

**400 Bad Request** - Validation failed

```json
{
  "error": "ValidationError",
  "message": "Validation failed",
  "statusCode": 400,
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**409 Conflict** - Email, CPF, or COREN already exists

```json
{
  "error": "EmailAlreadyExistsError",
  "message": "Email already registered",
  "statusCode": 409
}
```

```json
{
  "error": "CPFAlreadyExistsError",
  "message": "CPF already registered",
  "statusCode": 409
}
```

```json
{
  "error": "CORENAlreadyExistsError",
  "message": "COREN already registered",
  "statusCode": 409
}
```

**429 Too Many Requests** - Rate limit exceeded

```json
{
  "error": "TooManyRequestsError",
  "message": "Too many registration attempts. Please try again later.",
  "statusCode": 429
}
```

---

#### 2. Login

Authenticate a user and receive a JWT token.

**Endpoint**: `POST /api/auth/login`

**Authentication**: Not required (public endpoint)

**Rate Limiting**: 5 requests per 15 minutes per IP

##### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | User's email address |
| `password` | string | Yes | User's password |

##### Request Example

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "maria@example.com",
  "password": "securepass123"
}
```

##### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Maria Santos",
      "email": "maria@example.com",
      "cpf": "12345678900",
      "role": "NURSE",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  }
}
```

##### Error Responses

**401 Unauthorized** - Invalid credentials or inactive user

```json
{
  "error": "InvalidCredentialsError",
  "message": "Invalid email or password",
  "statusCode": 401
}
```

**429 Too Many Requests** - Rate limit exceeded

```json
{
  "error": "TooManyRequestsError",
  "message": "Too many login attempts. Please try again later.",
  "statusCode": 429
}
```

---

### User Management Endpoints

#### 3. List Users

Retrieve a paginated list of users with optional filters.

**Endpoint**: `GET /api/users`

**Authentication**: Required (JWT token)

**Authorization**: MANAGER or NURSE only

##### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number (1-indexed, minimum: 1) |
| `perPage` | number | No | 10 | Items per page (minimum: 1, maximum: 100) |
| `sortBy` | string | No | createdAt | Field to sort by (see valid fields below) |
| `sortOrder` | string | No | desc | Sort order: `asc` or `desc` |
| `role` | string | No | - | Filter by role: `EMPLOYEE`, `NURSE`, or `MANAGER` |
| `isActive` | boolean | No | true | Filter by active status |
| `excludeDeleted` | boolean | No | true | Exclude soft-deleted users |

**Valid sortBy fields**: id, name, email, cpf, coren, role, phone, isActive, createdAt, updatedAt

##### Request Example

```http
GET /api/users?page=1&perPage=20&role=NURSE&isActive=true&sortBy=name&sortOrder=asc
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

##### Success Response (200 OK)

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Ana Costa",
      "email": "ana@example.com",
      "cpf": "98765432100",
      "phone": "11988888888",
      "role": "NURSE",
      "coren": "COREN-789012",
      "isActive": true,
      "createdAt": "2025-11-20T10:00:00.000Z",
      "updatedAt": "2025-11-20T10:00:00.000Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Maria Santos",
      "email": "maria@example.com",
      "cpf": "12345678900",
      "phone": "11999999999",
      "role": "NURSE",
      "coren": "COREN-123456",
      "isActive": true,
      "createdAt": "2025-11-23T10:00:00.000Z",
      "updatedAt": "2025-11-23T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 2,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

##### Error Responses

**401 Unauthorized** - Missing or invalid authentication token

```json
{
  "error": "UnauthorizedError",
  "message": "Authentication token is required",
  "statusCode": 401
}
```

**403 Forbidden** - User is not MANAGER or NURSE

```json
{
  "error": "ForbiddenError",
  "message": "Only MANAGER or NURSE role can access user list",
  "statusCode": 403
}
```

**400 Bad Request** - Invalid query parameters

```json
{
  "error": "ValidationError",
  "message": "Validation failed",
  "statusCode": 400,
  "details": [
    {
      "field": "page",
      "message": "Page must be at least 1"
    }
  ]
}
```

---

#### 4. Get User by ID

Retrieve details of a specific user.

**Endpoint**: `GET /api/users/:id`

**Authentication**: Required (JWT token)

**Authorization**:
- MANAGER: Can view any user
- EMPLOYEE/NURSE: Can only view their own profile

##### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | User ID (UUID format) |

##### Request Example

```http
GET /api/users/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

##### Success Response (200 OK)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Maria Santos",
  "email": "maria@example.com",
  "cpf": "12345678900",
  "phone": "11999999999",
  "role": "NURSE",
  "coren": "COREN-123456",
  "isActive": true,
  "createdAt": "2025-11-23T10:00:00.000Z",
  "updatedAt": "2025-11-23T10:00:00.000Z"
}
```

##### Error Responses

**401 Unauthorized** - Missing or invalid authentication token

```json
{
  "error": "UnauthorizedError",
  "message": "Authentication token is required",
  "statusCode": 401
}
```

**403 Forbidden** - Attempting to view another user's profile without permission

```json
{
  "error": "ForbiddenError",
  "message": "You do not have permission to view this user",
  "statusCode": 403
}
```

**404 Not Found** - User not found or deleted

```json
{
  "error": "UserNotFoundError",
  "message": "User not found",
  "statusCode": 404
}
```

---

#### 5. Update User

Update user information.

**Endpoint**: `PATCH /api/users/:id`

**Authentication**: Required (JWT token)

**Authorization**:
- MANAGER: Can update any user, all fields
- EMPLOYEE/NURSE: Can only update their own profile (name and phone only)

##### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | User ID (UUID format) |

##### Request Body (all fields optional)

| Field | Type | Description | Allowed For |
|-------|------|-------------|-------------|
| `name` | string | Full name (3-255 characters) | All users (own profile) |
| `phone` | string | Phone number | All users (own profile) |
| `isActive` | boolean | Active status | MANAGER only |
| `role` | string | User role (EMPLOYEE, NURSE, MANAGER) | MANAGER only |
| `coren` | string | COREN (required if role is NURSE) | MANAGER only |

##### Request Example

```http
PATCH /api/users/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Maria Santos Silva",
  "phone": "11987654321"
}
```

##### Success Response (200 OK)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Maria Santos Silva",
  "email": "maria@example.com",
  "cpf": "12345678900",
  "phone": "11987654321",
  "role": "NURSE",
  "coren": "COREN-123456",
  "isActive": true,
  "createdAt": "2025-11-23T10:00:00.000Z",
  "updatedAt": "2025-11-23T14:30:00.000Z"
}
```

##### Error Responses

**401 Unauthorized** - Missing or invalid authentication token

**403 Forbidden** - Attempting to update another user or restricted fields

```json
{
  "error": "ForbiddenError",
  "message": "You do not have permission to modify this user or these fields",
  "statusCode": 403
}
```

**404 Not Found** - User not found or deleted

```json
{
  "error": "UserNotFoundError",
  "message": "User not found",
  "statusCode": 404
}
```

**409 Conflict** - COREN already exists

```json
{
  "error": "CORENAlreadyExistsError",
  "message": "COREN already registered",
  "statusCode": 409
}
```

---

#### 6. Delete User (Soft Delete)

Soft delete a user account. Sets `deletedAt` timestamp and `isActive` to false.

**Endpoint**: `DELETE /api/users/:id`

**Authentication**: Required (JWT token)

**Authorization**: MANAGER only

**Business Rule**: Cannot delete yourself (prevents system lockout)

##### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | User ID (UUID format) |

##### Request Example

```http
DELETE /api/users/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

##### Success Response (204 No Content)

No response body.

##### Error Responses

**401 Unauthorized** - Missing or invalid authentication token

**403 Forbidden** - Not a MANAGER or attempting to delete yourself

```json
{
  "error": "ForbiddenError",
  "message": "Only MANAGER can delete users and you cannot delete yourself",
  "statusCode": 403
}
```

**404 Not Found** - User not found or already deleted

```json
{
  "error": "UserNotFoundError",
  "message": "User not found",
  "statusCode": 404
}
```

---

## Business Rules

### Authentication

**JWT Token**:
- Issued on successful login or registration
- Expires after 7 days
- Must be included in `Authorization` header as `Bearer <token>`
- Payload contains `userId` and `iat` (issued at timestamp)

**Password Security**:
- Minimum 6 characters (enforced during registration)
- Hashed using bcrypt before storage
- Never returned in API responses

**Email Normalization**:
- Converted to lowercase
- Trimmed of whitespace
- Must be unique across the system

### Authorization Matrix

| Operation | EMPLOYEE | NURSE | MANAGER |
|-----------|----------|-------|---------|
| Register account | ✅ | ✅ | ✅ |
| Login | ✅ | ✅ | ✅ |
| List all users | ❌ | ✅ | ✅ |
| View own profile | ✅ | ✅ | ✅ |
| View other profiles | ❌ | ❌ | ✅ |
| Update own profile (name, phone) | ✅ | ✅ | ✅ |
| Update other profiles | ❌ | ❌ | ✅ |
| Update restricted fields (role, isActive) | ❌ | ❌ | ✅ |
| Delete users | ❌ | ❌ | ✅ |

### User Uniqueness

- **Email**: Must be unique (case-insensitive)
- **CPF**: Must be unique (11 digits)
- **COREN**: Must be unique (required for NURSE role)

### Nurse Requirements

- NURSE role requires a valid, unique COREN
- Changing role to NURSE requires providing COREN
- Cannot remove COREN if user has NURSE role

### Soft Delete

- Deleted users have `deletedAt` timestamp set
- `isActive` is set to false
- Data is preserved for audit trail
- Deleted users are excluded from queries by default
- Deleted users cannot be updated

---

## Response Field Descriptions

### User Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (UUID) |
| `name` | string | User's full name |
| `email` | string | User's email address (normalized) |
| `cpf` | string | Brazilian CPF (11 digits) |
| `phone` | string? | Phone number (optional) |
| `role` | string | User role: EMPLOYEE, NURSE, or MANAGER |
| `coren` | string? | Nursing license number (required for NURSE) |
| `isActive` | boolean | Whether user account is active |
| `createdAt` | string | ISO 8601 timestamp when user was created |
| `updatedAt` | string | ISO 8601 timestamp when user was last updated |

**Note**: The `password` field is never returned in responses. Deleted users include a `deletedAt` field (ISO 8601 timestamp).

### Authentication Response Object

| Field | Type | Description |
|-------|------|-------------|
| `user` | object | User object (without password) |
| `token` | string | JWT authentication token |
| `expiresIn` | string | Token expiration time (e.g., "7d") |

### Pagination Object

| Field | Type | Description |
|-------|------|-------------|
| `page` | number | Current page number (1-indexed) |
| `perPage` | number | Number of items per page |
| `total` | number | Total number of users matching filters |
| `totalPages` | number | Total number of pages |
| `hasNext` | boolean | Whether there are more pages after this one |
| `hasPrev` | boolean | Whether there are pages before this one |

---

## Integration Notes

### Frontend Integration

#### Storing JWT Token

```typescript
// After successful login/register
const { token } = response.data;
localStorage.setItem('authToken', token);
```

#### Making Authenticated Requests

```typescript
const token = localStorage.getItem('authToken');

const response = await fetch('/api/users', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

#### Handling Token Expiration

```typescript
if (response.status === 401) {
  // Token expired or invalid
  localStorage.removeItem('authToken');
  redirectToLogin();
}
```

#### Role-Based UI

```typescript
const user = getUserFromToken(); // Decode JWT to get user data

if (user.role === 'MANAGER') {
  // Show admin features
  showUserManagement();
}
```

### Error Handling Best Practices

```typescript
try {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (response.status === 401) {
    showError('Invalid email or password');
  } else if (response.status === 429) {
    showError('Too many attempts. Please try again later.');
  } else if (!response.ok) {
    const error = await response.json();
    showError(error.message);
  } else {
    const data = await response.json();
    // Handle successful login
  }
} catch (error) {
  showError('Network error. Please check your connection.');
}
```

### Rate Limiting

- **Login**: 5 attempts per 15 minutes per IP
- **Register**: 5 attempts per 15 minutes per IP
- **Recommendation**: Display countdown timer after rate limit is hit

---

## Examples

### Example 1: Complete Registration Flow

```bash
# Register new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "password123",
    "cpf": "11122233344",
    "role": "EMPLOYEE"
  }'

# Response includes token
# {
#   "success": true,
#   "data": {
#     "user": { ... },
#     "token": "eyJhbGc...",
#     "expiresIn": "7d"
#   }
# }
```

### Example 2: Login and Update Profile

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "password123"
  }'

# Update own profile using token
curl -X PATCH http://localhost:3000/api/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva Santos",
    "phone": "11999999999"
  }'
```

### Example 3: Manager Lists Active Nurses

```bash
curl -X GET "http://localhost:3000/api/users?role=NURSE&isActive=true&page=1&perPage=20" \
  -H "Authorization: Bearer <MANAGER_TOKEN>"
```

### Example 4: Manager Deactivates User

```bash
curl -X PATCH http://localhost:3000/api/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <MANAGER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```

---

## Troubleshooting

### Common Issues

**Issue**: Getting 401 Unauthorized errors
- **Solution**: Verify JWT token is valid and not expired. Token should be in the format `Bearer <token>`.

**Issue**: Getting 403 Forbidden when updating user
- **Solution**: Check if you're trying to update another user's profile or restricted fields without MANAGER role.

**Issue**: Getting 409 Conflict on registration
- **Solution**: Email, CPF, or COREN already exists in the system. Use different values.

**Issue**: Cannot register NURSE without COREN
- **Solution**: COREN is required for NURSE role. Include `coren` field in request body.

**Issue**: Rate limit errors on login
- **Solution**: Wait 15 minutes before attempting login again. Implement exponential backoff in client.

---

## Security Considerations

### Password Security
- Minimum 6 characters enforced
- Hashed using bcrypt with salt rounds
- Never logged or returned in responses

### Token Security
- JWT tokens expire after 7 days
- Tokens are signed with secret key (configured via `JWT_SECRET` env variable)
- Tokens should be stored securely (localStorage or httpOnly cookies)

### Data Privacy
- Sensitive data (passwords) never exposed in API
- Soft delete preserves data for compliance
- Authorization checks prevent unauthorized access

### Input Validation
- All inputs validated using Zod schemas
- Email format validation
- CPF format validation (11 digits)
- SQL injection prevention via Prisma ORM

---

## Changelog

### Version 1.0.0 (2025-11-23)
- Initial release
- Added user registration and login endpoints
- Added user CRUD operations
- Implemented role-based access control (RBAC)
- Support for three user roles: EMPLOYEE, NURSE, MANAGER
- Soft delete functionality
- Pagination and filtering for user lists
- Rate limiting on authentication endpoints
