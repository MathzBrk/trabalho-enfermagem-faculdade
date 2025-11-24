# Vaccine Scheduling API Documentation

## Overview

The Vaccine Scheduling API provides endpoints for managing vaccine appointments in the system. It supports creating, updating, listing, and deleting vaccine schedules with role-based access control and comprehensive business rule validation.

**Base Path**: `/api/vaccine-schedulings`

**Authentication**: All endpoints require a valid JWT token in the `Authorization` header.

**Role-Based Authorization**:
- **MANAGER**: Full access to all schedulings
- **NURSE**: Can view their own assigned schedulings
- **EMPLOYEE**: Can only manage their own schedulings

---

## Endpoints

### 1. Create Vaccine Scheduling

Create a new vaccine appointment with automatic stock validation and dose sequence enforcement.

**Endpoint**: `POST /api/vaccine-schedulings`

**Authentication**: Required (JWT token)

**Authorization**:
- MANAGER: Can create for any user
- EMPLOYEE/NURSE: Can only create for themselves

#### Request Body

| Field           | Type   | Required | Description                                    |
|-----------------|--------|----------|------------------------------------------------|                    |
| `vaccineId`     | string | Yes      | Vaccine ID (UUID format)                       |
| `nurseId`       | string | No       | Assigned nurse ID (UUID format, must be NURSE) |
| `scheduledDate` | string | Yes      | Appointment date (ISO 8601 datetime)           |
| `doseNumber`    | number | Yes      | Dose number (1 to vaccine.dosesRequired)       |
| `notes`         | string | No       | Optional notes                                 |

#### Request Example

```http
POST /api/vaccine-schedulings
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "vaccineId": "660f9511-f39c-52e5-b827-557766551111",
  "nurseId": "770g0622-g40d-63f6-c938-668877662222",
  "scheduledDate": "2025-12-15T10:00:00.000Z",
  "doseNumber": 1,
  "notes": "First dose scheduling"
}
```

#### Success Response (201 Created)

```json
{
  "id": "880h1733-h51e-74g7-d049-779988773333",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "vaccineId": "660f9511-f39c-52e5-b827-557766551111",
  "assignedNurseId": "770g0622-g40d-63f6-c938-668877662222",
  "scheduledDate": "2025-12-15T10:00:00.000Z",
  "doseNumber": 1,
  "status": "SCHEDULED",
  "notes": "First dose scheduling",
  "createdAt": "2025-11-18T14:30:00.000Z",
  "updatedAt": "2025-11-18T14:30:00.000Z",
  "deletedAt": null
}
```

#### Error Responses

**401 Unauthorized** - Missing or invalid authentication token
```json
{
  "error": "UnauthorizedError",
  "message": "Authentication token is required",
  "statusCode": 401
}
```

**400 Bad Request** - Scheduled date is in the past
```json
{
  "error": "InvalidSchedulingDateError",
  "message": "Scheduled date must be in the future",
  "statusCode": 400
}
```

**400 Bad Request** - Dose number exceeds vaccine requirements
```json
{
  "error": "InvalidDoseNumberError",
  "message": "Dose number 3 exceeds the required doses (2) for vaccine ID 660f9511-f39c-52e5-b827-557766551111",
  "statusCode": 400
}
```

**400 Bad Request** - Previous dose not scheduled
```json
{
  "error": "MissingPreviousDoseError",
  "message": "Previous dose 1 must be scheduled before scheduling dose 2",
  "statusCode": 400
}
```

**400 Bad Request** - Duplicate scheduling exists
```json
{
  "error": "DuplicateSchedulingError",
  "message": "An active scheduling for dose 1 of this vaccine already exists",
  "statusCode": 400
}
```

**400 Bad Request** - Insufficient vaccine stock
```json
{
  "error": "InsufficientStockError",
  "message": "No available doses for vaccine ID 660f9511-f39c-52e5-b827-557766551111. Total stock: 50, Reserved: 50",
  "statusCode": 400
}
```

**400 Bad Request** - Interval between doses too short
```json
{
  "error": "InvalidSchedulingDateError",
  "message": "Dose 2 must be scheduled at least 30 days after dose 1",
  "statusCode": 400
}
```

**404 Not Found** - Vaccine not found
```json
{
  "error": "VaccineNotFoundError",
  "message": "Vaccine with ID 660f9511-f39c-52e5-b827-557766551111 not found",
  "statusCode": 404
}
```

**404 Not Found** - User not found
```json
{
  "error": "UserNotFoundError",
  "message": "User not found",
  "statusCode": 404
}
```

---

### 2. Get Vaccine Scheduling by ID

Retrieve a single vaccine scheduling with all related data.

**Endpoint**: `GET /api/vaccine-schedulings/:id`

**Authentication**: Required (JWT token)

**Authorization**:
- MANAGER: Can view any scheduling
- EMPLOYEE/NURSE: Can only view their own schedulings

#### Path Parameters

| Parameter | Type   | Required | Description             |
|-----------|--------|----------|-------------------------|
| `id`      | string | Yes      | Scheduling ID (UUID)    |

#### Request Example

```http
GET /api/vaccine-schedulings/880h1733-h51e-74g7-d049-779988773333
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Success Response (200 OK)

```json
{
  "id": "880h1733-h51e-74g7-d049-779988773333",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "vaccineId": "660f9511-f39c-52e5-b827-557766551111",
  "assignedNurseId": "770g0622-g40d-63f6-c938-668877662222",
  "scheduledDate": "2025-12-15T10:00:00.000Z",
  "doseNumber": 1,
  "status": "SCHEDULED",
  "notes": "First dose scheduling",
  "createdAt": "2025-11-18T14:30:00.000Z",
  "updatedAt": "2025-11-18T14:30:00.000Z",
  "deletedAt": null,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "João Silva",
    "email": "joao@example.com",
    "cpf": "123.456.789-00",
    "role": "EMPLOYEE"
  },
  "vaccine": {
    "id": "660f9511-f39c-52e5-b827-557766551111",
    "name": "COVID-19 Pfizer",
    "manufacturer": "Pfizer",
    "dosesRequired": 2,
    "intervalDays": 30,
    "totalStock": 100
  },
  "assignedNurse": {
    "id": "770g0622-g40d-63f6-c938-668877662222",
    "name": "Maria Santos",
    "email": "maria@example.com",
    "cpf": "987.654.321-00",
    "role": "NURSE"
  },
  "application": null
}
```

#### Error Responses

**404 Not Found** - Scheduling not found
```json
{
  "error": "VaccineSchedulingNotFoundError",
  "message": "Vaccine scheduling not found",
  "statusCode": 404
}
```

**403 Forbidden** - Unauthorized access
```json
{
  "error": "UnauthorizedSchedulingAccessError",
  "message": "You don't have permission to access this scheduling",
  "statusCode": 403
}
```

---

### 3. List Vaccine Schedulings

Retrieve a paginated list of vaccine schedulings with filters.

**Endpoint**: `GET /api/vaccine-schedulings`

**Authentication**: Required (JWT token)

**Authorization**:
- MANAGER: Can view all schedulings
- EMPLOYEE/NURSE: Automatically filtered to their own schedulings

#### Query Parameters

| Parameter   | Type   | Required | Default | Description                                     |
|-------------|--------|----------|---------|-------------------------------------------------|
| `page`      | number | No       | 1       | Page number (minimum: 1)                        |
| `limit`     | number | No       | 10      | Items per page (minimum: 1, maximum: 100)       |
| `userId`    | string | No       | -       | Filter by patient ID (MANAGER only)             |
| `vaccineId` | string | No       | -       | Filter by vaccine ID                            |
| `status`    | string | No       | -       | Filter by status (see valid statuses)           |
| `startDate` | string | No       | -       | Filter by date range start (ISO 8601 datetime)  |
| `endDate`   | string | No       | -       | Filter by date range end (ISO 8601 datetime)    |

#### Valid Status Values

- `SCHEDULED` - Appointment is scheduled
- `CONFIRMED` - Appointment is confirmed
- `CANCELLED` - Appointment was cancelled
- `COMPLETED` - Vaccine was administered

#### Request Example

```http
GET /api/vaccine-schedulings?page=1&limit=20&status=SCHEDULED&startDate=2025-12-01T00:00:00.000Z&endDate=2025-12-31T23:59:59.999Z
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Success Response (200 OK)

```json
{
  "data": [
    {
      "id": "880h1733-h51e-74g7-d049-779988773333",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "vaccineId": "660f9511-f39c-52e5-b827-557766551111",
      "assignedNurseId": "770g0622-g40d-63f6-c938-668877662222",
      "scheduledDate": "2025-12-15T10:00:00.000Z",
      "doseNumber": 1,
      "status": "SCHEDULED",
      "notes": "First dose scheduling",
      "createdAt": "2025-11-18T14:30:00.000Z",
      "updatedAt": "2025-11-18T14:30:00.000Z",
      "deletedAt": null
    }
  ],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 45,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Error Responses

**400 Bad Request** - Invalid date range
```json
{
  "error": "ValidationError",
  "message": "startDate must be before or equal to endDate",
  "statusCode": 400
}
```

---

### 4. Get Nurse Monthly Schedulings

Retrieve all schedulings assigned to a nurse for a specific month, grouped by date.

**Endpoint**: `GET /api/vaccine-schedulings/nurse/monthly`

**Authentication**: Required (JWT token)

**Authorization**: Only users with NURSE role can access

#### Query Parameters

| Parameter | Type   | Required | Default        | Description                                      |
|-----------|--------|----------|----------------|--------------------------------------------------|
| `month`   | number | No       | Current month  | Month (0-11, 0 = January, 11 = December)         |
| `year`    | number | No       | Current year   | Year (minimum: 2000, maximum: current year)      |

#### Request Example

```http
GET /api/vaccine-schedulings/nurse/monthly?month=1&year=2025
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Success Response (200 OK)

```json
{
  "2025-02-01": [
    {
      "id": "880h1733-h51e-74g7-d049-779988773333",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "vaccineId": "660f9511-f39c-52e5-b827-557766551111",
      "assignedNurseId": "770g0622-g40d-63f6-c938-668877662222",
      "scheduledDate": "2025-02-01T10:00:00.000Z",
      "doseNumber": 1,
      "status": "SCHEDULED",
      "notes": "First dose",
      "createdAt": "2025-01-15T14:30:00.000Z",
      "updatedAt": "2025-01-15T14:30:00.000Z",
      "deletedAt": null,
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "João Silva",
        "email": "joao@example.com",
        "cpf": "123.456.789-00",
        "role": "EMPLOYEE"
      },
      "vaccine": {
        "id": "660f9511-f39c-52e5-b827-557766551111",
        "name": "COVID-19 Pfizer",
        "manufacturer": "Pfizer",
        "dosesRequired": 2
      },
      "assignedNurse": {
        "id": "770g0622-g40d-63f6-c938-668877662222",
        "name": "Maria Santos",
        "email": "maria@example.com",
        "cpf": "987.654.321-00",
        "role": "NURSE"
      },
      "application": null
    },
    {
      "id": "990i2844-i62f-85h8-e150-880099884444",
      "userId": "661f9512-f39c-52e5-b827-557766551222",
      "vaccineId": "771g0623-g40d-63f6-c938-668877662333",
      "assignedNurseId": "770g0622-g40d-63f6-c938-668877662222",
      "scheduledDate": "2025-02-01T14:00:00.000Z",
      "doseNumber": 2,
      "status": "SCHEDULED",
      "notes": "Second dose",
      "createdAt": "2025-01-20T10:00:00.000Z",
      "updatedAt": "2025-01-20T10:00:00.000Z",
      "deletedAt": null,
      "user": {
        "id": "661f9512-f39c-52e5-b827-557766551222",
        "name": "Ana Costa",
        "email": "ana@example.com",
        "cpf": "111.222.333-44",
        "role": "EMPLOYEE"
      },
      "vaccine": {
        "id": "771g0623-g40d-63f6-c938-668877662333",
        "name": "Hepatitis B",
        "manufacturer": "GSK",
        "dosesRequired": 3
      },
      "assignedNurse": {
        "id": "770g0622-g40d-63f6-c938-668877662222",
        "name": "Maria Santos",
        "email": "maria@example.com",
        "cpf": "987.654.321-00",
        "role": "NURSE"
      },
      "application": null
    }
  ],
  "2025-02-02": [],
  "2025-02-03": [
    {
      "id": "aa0j3955-j73g-96i9-f261-991100995555",
      "userId": "772g0623-g40d-63f6-c938-668877662444",
      "vaccineId": "660f9511-f39c-52e5-b827-557766551111",
      "assignedNurseId": "770g0622-g40d-63f6-c938-668877662222",
      "scheduledDate": "2025-02-03T09:00:00.000Z",
      "doseNumber": 1,
      "status": "CONFIRMED",
      "notes": null,
      "createdAt": "2025-01-25T16:00:00.000Z",
      "updatedAt": "2025-02-02T11:00:00.000Z",
      "deletedAt": null,
      "user": {
        "id": "772g0623-g40d-63f6-c938-668877662444",
        "name": "Pedro Oliveira",
        "email": "pedro@example.com",
        "cpf": "222.333.444-55",
        "role": "EMPLOYEE"
      },
      "vaccine": {
        "id": "660f9511-f39c-52e5-b827-557766551111",
        "name": "COVID-19 Pfizer",
        "manufacturer": "Pfizer",
        "dosesRequired": 2
      },
      "assignedNurse": {
        "id": "770g0622-g40d-63f6-c938-668877662222",
        "name": "Maria Santos",
        "email": "maria@example.com",
        "cpf": "987.654.321-00",
        "role": "NURSE"
      },
      "application": null
    }
  ],
  "2025-02-04": []
}
```

**Response Structure**:
- Object with date keys in `YYYY-MM-DD` format
- Each date contains an array of schedulings (can be empty)
- All days in the month are included
- Schedulings include full user, vaccine, and nurse relations

#### Error Responses

**403 Forbidden** - User is not a nurse
```json
{
  "error": "ForbiddenError",
  "message": "You are not a nurse and are not allowed to see nurse's schedulings",
  "statusCode": 403
}
```

**400 Bad Request** - Year is in the future
```json
{
  "error": "ValidationError",
  "message": "The year must not be in the future. Year received 2026 - Actual Year 2025",
  "statusCode": 400
}
```

**400 Bad Request** - Month is in the future for current year
```json
{
  "error": "ValidationError",
  "message": "The month must not be in the future when the year is the current. Month received 11 - Actual Month 10",
  "statusCode": 400
}
```

---

### 5. Get Schedulings by Date

Retrieve all vaccine schedulings for a specific date. If no date is provided, returns schedulings for the current date.

**Endpoint**: `GET /api/vaccine-schedulings/by-date`

**Authentication**: Required (JWT token)

**Authorization**:
- MANAGER: Can view all schedulings for the date
- NURSE: Can view all schedulings for the date
- EMPLOYEE: Not allowed (403 Forbidden)

#### Query Parameters

| Parameter | Type   | Required | Default       | Description                                    |
|-----------|--------|----------|---------------|------------------------------------------------|
| `date`    | string | No       | Current date  | Date to filter schedulings (ISO 8601 datetime) |

#### Request Examples

**Get schedulings for a specific date:**
```http
GET /api/vaccine-schedulings/by-date?date=2025-12-15T00:00:00.000Z
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Get schedulings for current date:**
```http
GET /api/vaccine-schedulings/by-date
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Success Response (200 OK)

```json
[
  {
    "id": "880h1733-h51e-74g7-d049-779988773333",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "vaccineId": "660f9511-f39c-52e5-b827-557766551111",
    "assignedNurseId": "770g0622-g40d-63f6-c938-668877662222",
    "scheduledDate": "2025-12-15T10:00:00.000Z",
    "doseNumber": 1,
    "status": "SCHEDULED",
    "notes": "First dose scheduling",
    "createdAt": "2025-11-18T14:30:00.000Z",
    "updatedAt": "2025-11-18T14:30:00.000Z",
    "deletedAt": null,
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "João Silva",
      "email": "joao@example.com",
      "cpf": "123.456.789-00",
      "role": "EMPLOYEE"
    },
    "vaccine": {
      "id": "660f9511-f39c-52e5-b827-557766551111",
      "name": "COVID-19 Pfizer",
      "manufacturer": "Pfizer",
      "dosesRequired": 2,
      "intervalDays": 30
    },
    "assignedNurse": {
      "id": "770g0622-g40d-63f6-c938-668877662222",
      "name": "Maria Santos",
      "email": "maria@example.com",
      "cpf": "987.654.321-00",
      "role": "NURSE"
    },
    "application": null
  },
  {
    "id": "990i2844-i62f-85h8-e150-880099884444",
    "userId": "661f9512-f39c-52e5-b827-557766551222",
    "vaccineId": "771g0623-g40d-63f6-c938-668877662333",
    "assignedNurseId": "770g0622-g40d-63f6-c938-668877662222",
    "scheduledDate": "2025-12-15T14:00:00.000Z",
    "doseNumber": 2,
    "status": "CONFIRMED",
    "notes": "Second dose",
    "createdAt": "2025-11-20T10:00:00.000Z",
    "updatedAt": "2025-11-22T15:00:00.000Z",
    "deletedAt": null,
    "user": {
      "id": "661f9512-f39c-52e5-b827-557766551222",
      "name": "Ana Costa",
      "email": "ana@example.com",
      "cpf": "111.222.333-44",
      "role": "EMPLOYEE"
    },
    "vaccine": {
      "id": "771g0623-g40d-63f6-c938-668877662333",
      "name": "Hepatitis B",
      "manufacturer": "GSK",
      "dosesRequired": 3
    },
    "assignedNurse": {
      "id": "770g0622-g40d-63f6-c938-668877662222",
      "name": "Maria Santos",
      "email": "maria@example.com",
      "cpf": "987.654.321-00",
      "role": "NURSE"
    },
    "application": null
  }
]
```

**Response Structure**:
- Array of schedulings with full relations
- All schedulings matching the specified date (or current date)
- Includes user, vaccine, nurse, and application data
- Empty array if no schedulings found for the date

#### Error Responses

**403 Forbidden** - EMPLOYEE users cannot access
```json
{
  "error": "ForbiddenError",
  "message": "EMPLOYEE users are not allowed to access vaccine schedulings by date",
  "statusCode": 403
}
```

**400 Bad Request** - Invalid date format
```json
{
  "error": "ValidationError",
  "message": "Invalid date format. Must be ISO 8601 datetime",
  "statusCode": 400
}
```

---

### 6. Update Vaccine Scheduling

Update an existing vaccine scheduling. Cannot update completed schedulings.

**Endpoint**: `PATCH /api/vaccine-schedulings/:id`

**Authentication**: Required (JWT token)

**Authorization**:
- MANAGER: Can update any scheduling
- EMPLOYEE/NURSE: Can only update their own schedulings

#### Path Parameters

| Parameter | Type   | Required | Description             |
|-----------|--------|----------|-------------------------|
| `id`      | string | Yes      | Scheduling ID (UUID)    |

#### Request Body

All fields are optional, but at least one must be provided.

| Field           | Type   | Required | Description                                |
|-----------------|--------|----------|--------------------------------------------|
| `scheduledDate` | string | No       | New appointment date (ISO 8601 datetime)   |
| `nurseId`       | string | No       | New assigned nurse ID (UUID)               |
| `notes`         | string | No       | Updated notes                              |
| `status`        | string | No       | New status (SCHEDULED/CONFIRMED/CANCELLED) |

#### Request Example

```http
PATCH /api/vaccine-schedulings/880h1733-h51e-74g7-d049-779988773333
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "scheduledDate": "2025-12-20T14:00:00.000Z",
  "status": "CONFIRMED",
  "notes": "Patient confirmed attendance"
}
```

#### Success Response (200 OK)

```json
{
  "id": "880h1733-h51e-74g7-d049-779988773333",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "vaccineId": "660f9511-f39c-52e5-b827-557766551111",
  "assignedNurseId": "770g0622-g40d-63f6-c938-668877662222",
  "scheduledDate": "2025-12-20T14:00:00.000Z",
  "doseNumber": 1,
  "status": "CONFIRMED",
  "notes": "Patient confirmed attendance",
  "createdAt": "2025-11-18T14:30:00.000Z",
  "updatedAt": "2025-11-19T10:15:00.000Z",
  "deletedAt": null
}
```

#### Error Responses

**404 Not Found** - Scheduling not found
```json
{
  "error": "VaccineSchedulingNotFoundError",
  "message": "Vaccine scheduling not found",
  "statusCode": 404
}
```

**403 Forbidden** - Unauthorized access
```json
{
  "error": "UnauthorizedSchedulingAccessError",
  "message": "You don't have permission to update this scheduling",
  "statusCode": 403
}
```

**400 Bad Request** - Cannot update completed scheduling
```json
{
  "error": "SchedulingAlreadyCompletedError",
  "message": "Cannot update a completed scheduling",
  "statusCode": 400
}
```

**400 Bad Request** - New date is in the past
```json
{
  "error": "InvalidSchedulingDateError",
  "message": "New scheduled date must be in the future",
  "statusCode": 400
}
```

---

### 7. Delete Vaccine Scheduling

Soft delete a vaccine scheduling. Sets `deletedAt` timestamp and status to `CANCELLED`.

**Endpoint**: `DELETE /api/vaccine-schedulings/:id`

**Authentication**: Required (JWT token)

**Authorization**:
- MANAGER: Can delete any scheduling
- EMPLOYEE/NURSE: Can only delete their own schedulings

#### Path Parameters

| Parameter | Type   | Required | Description             |
|-----------|--------|----------|-------------------------|
| `id`      | string | Yes      | Scheduling ID (UUID)    |

#### Request Example

```http
DELETE /api/vaccine-schedulings/880h1733-h51e-74g7-d049-779988773333
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Success Response (200 OK)

```json
{
  "id": "880h1733-h51e-74g7-d049-779988773333",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "vaccineId": "660f9511-f39c-52e5-b827-557766551111",
  "assignedNurseId": "770g0622-g40d-63f6-c938-668877662222",
  "scheduledDate": "2025-12-15T10:00:00.000Z",
  "doseNumber": 1,
  "status": "CANCELLED",
  "notes": "First dose scheduling",
  "createdAt": "2025-11-18T14:30:00.000Z",
  "updatedAt": "2025-11-19T11:00:00.000Z",
  "deletedAt": "2025-11-19T11:00:00.000Z"
}
```

#### Error Responses

**404 Not Found** - Scheduling not found
```json
{
  "error": "VaccineSchedulingNotFoundError",
  "message": "Vaccine scheduling not found",
  "statusCode": 404
}
```

**403 Forbidden** - Unauthorized access
```json
{
  "error": "UnauthorizedSchedulingAccessError",
  "message": "You don't have permission to delete this scheduling",
  "statusCode": 403
}
```

---

## Business Rules

### Stock Management

**Atomic Validation**:
- Stock availability is validated atomically using pessimistic locking (SELECT FOR UPDATE)
- Prevents race conditions where multiple requests could create schedulings exceeding stock
- Reserved doses = schedulings with status `SCHEDULED` or `CONFIRMED`
- Available doses = `totalStock - reservedDoses`

**Stock Reservation Flow**:
1. Transaction begins
2. Vaccine row is locked (FOR UPDATE)
3. Reserved doses are counted
4. Stock availability is validated
5. Scheduling is created if stock is available
6. Transaction commits, releasing the lock

### Dose Sequence Rules

**Previous Dose Requirement**:
- For doses > 1, the previous dose (N-1) must be scheduled first
- Previous dose cannot have status `CANCELLED`
- Ensures proper vaccination sequence

**Interval Between Doses**:
- For multi-dose vaccines, `intervalDays` defines minimum days between doses
- Calculated from previous dose's `scheduledDate`
- Example: If dose 1 is scheduled for Jan 1 and `intervalDays = 30`, dose 2 cannot be before Jan 31

**Duplicate Prevention**:
- Cannot create multiple active schedulings for same user + vaccine + dose
- Active statuses: `SCHEDULED`, `CONFIRMED`, `COMPLETED`
- Cancelled schedulings don't count as duplicates

### Date Validation

**Future Dates Only**:
- `scheduledDate` must be in the future when creating
- When updating, new date must also be in the future
- Prevents scheduling appointments in the past

**Nurse Monthly Validation**:
- Year cannot be in the future
- For current year, month cannot be in the future
- Month is 0-indexed (0 = January, 11 = December)

### Authorization Rules

**Role-Based Access**:
- **MANAGER**:
  - Can create schedulings for any user
  - Can view, update, and delete any scheduling
  - Can filter by `userId` in list endpoint
- **EMPLOYEE/NURSE**:
  - Can only create schedulings for themselves
  - Can only view/update/delete their own schedulings
  - `userId` filter is automatically applied in list endpoint

**Nurse Assignment**:
- `nurseId` must belong to a user with role `NURSE`
- System validates role when assigning or updating nurse

### Status Transitions

**Valid Status Flow**:
```
SCHEDULED → CONFIRMED → COMPLETED
    ↓
CANCELLED (terminal state)
```

**Update Restrictions**:
- Cannot update schedulings with status `COMPLETED`
- Can update `CANCELLED` schedulings (but typically shouldn't)

**Delete Behavior**:
- Soft delete: sets `deletedAt` and changes status to `CANCELLED`
- Deleted schedulings are filtered out from all queries
- Cannot delete already deleted schedulings (404 error)

### Notifications

**Automatic Notifications**:
When a scheduling is created, notifications are sent to:
- **Patient**: Always receives a notification
- **Assigned Nurse**: Receives notification if `nurseId` is provided

**Event Type**: `VACCINE_SCHEDULED`

**Notification Channels**: `['in-app']`

**Event Data**:
```json
{
  "schedulingId": "uuid",
  "patientId": "uuid",
  "patientName": "string",
  "patientEmail": "string",
  "nurseId": "uuid | null",
  "nurseName": "string | null",
  "nurseEmail": "string | null",
  "userRole": "patient" | "nurse",
  "vaccineId": "uuid",
  "vaccineName": "string",
  "scheduledDate": "Date",
  "doseNumber": "number"
}
```

---

## Integration Notes

### Frontend Integration

#### Creating a Scheduling Flow
```typescript
// Step 1: Check vaccine stock and details
const vaccine = await fetch(`/api/vaccines/${vaccineId}`);

// Step 2: Validate user can schedule (check previous doses if needed)
const existingSchedulings = await fetch(`/api/vaccine-schedulings?userId=${userId}&vaccineId=${vaccineId}`);

// Step 3: Create scheduling
const response = await fetch('/api/vaccine-schedulings', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId,
    vaccineId,
    nurseId, // optional
    scheduledDate: '2025-12-15T10:00:00.000Z',
    doseNumber: 1,
    notes: 'First dose'
  })
});
```

#### Nurse Calendar Integration
For building a nurse's monthly calendar:

```typescript
// Fetch nurse's monthly schedulings
const response = await fetch('/api/vaccine-schedulings/nurse/monthly?month=1&year=2025', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const schedulings = await response.json();
// schedulings = { "2025-02-01": [...], "2025-02-02": [], ... }

// Render calendar
Object.entries(schedulings).forEach(([date, appointments]) => {
  renderDateCell(date, appointments);
});
```

#### Status Badge Colors
Recommended color scheme:
- `SCHEDULED`: Blue
- `CONFIRMED`: Green
- `CANCELLED`: Red
- `COMPLETED`: Gray

### Error Handling Best Practices

```typescript
try {
  const response = await fetch('/api/vaccine-schedulings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(schedulingData)
  });

  if (response.status === 401) {
    // Token expired - redirect to login
    redirectToLogin();
  } else if (response.status === 400) {
    // Business rule violation
    const error = await response.json();

    switch (error.error) {
      case 'InsufficientStockError':
        showMessage('No available vaccine doses. Please try again later.');
        break;
      case 'InvalidSchedulingDateError':
        showMessage('Please select a future date.');
        break;
      case 'MissingPreviousDoseError':
        showMessage('You must schedule previous doses first.');
        break;
      case 'DuplicateSchedulingError':
        showMessage('You already have an appointment for this dose.');
        break;
      default:
        showMessage(error.message);
    }
  } else if (!response.ok) {
    throw new Error('Failed to create scheduling');
  }

  const scheduling = await response.json();
  // Success - show confirmation
} catch (error) {
  console.error('Network error:', error);
  showMessage('Network error. Please check your connection.');
}
```

### Date Formatting

**Important**: The API uses ISO 8601 datetime strings with timezone information.

```typescript
// Creating a date for API
const scheduledDate = new Date('2025-12-15T10:00:00');
const isoString = scheduledDate.toISOString(); // "2025-12-15T10:00:00.000Z"

// Parsing response dates
const scheduling = await response.json();
const date = new Date(scheduling.scheduledDate);
const formattedDate = date.toLocaleDateString(); // Uses user's locale
```

### Pagination Best Practices

```typescript
// Load more pattern
let page = 1;
const limit = 20;
let hasMore = true;

async function loadSchedulings() {
  const response = await fetch(
    `/api/vaccine-schedulings?page=${page}&limit=${limit}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );

  const data = await response.json();

  // Append data to list
  appendSchedulings(data.data);

  // Update pagination state
  hasMore = data.pagination.hasNext;
  page++;
}

// Infinite scroll
if (hasMore && userScrolledToBottom()) {
  await loadSchedulings();
}
```

---

## Response Field Descriptions

### VaccineScheduling Object

| Field             | Type    | Description                                           |
|-------------------|---------|-------------------------------------------------------|
| `id`              | string  | Unique identifier (UUID)                              |
| `userId`          | string  | Patient ID (UUID)                                     |
| `vaccineId`       | string  | Vaccine ID (UUID)                                     |
| `assignedNurseId` | string? | Assigned nurse ID (UUID), null if not assigned        |
| `scheduledDate`   | string  | Appointment date (ISO 8601 datetime)                  |
| `doseNumber`      | number  | Dose number (1 to vaccine.dosesRequired)              |
| `status`          | string  | Scheduling status (enum)                              |
| `notes`           | string? | Optional notes                                        |
| `createdAt`       | string  | ISO 8601 timestamp when created                       |
| `updatedAt`       | string  | ISO 8601 timestamp when last updated                  |
| `deletedAt`       | string? | ISO 8601 timestamp when deleted (null if not deleted) |

### VaccineSchedulingWithRelations Object

Extends `VaccineScheduling` with:

| Field           | Type    | Description                                  |
|-----------------|---------|----------------------------------------------|
| `user`          | object  | Patient information (excludes password)      |
| `vaccine`       | object  | Vaccine information                          |
| `assignedNurse` | object? | Nurse information (null if not assigned)     |
| `application`   | object? | Application record (null if not applied yet) |

### User Object (in relations)

| Field   | Type   | Description           |
|---------|--------|-----------------------|
| `id`    | string | User ID (UUID)        |
| `name`  | string | Full name             |
| `email` | string | Email address         |
| `cpf`   | string | CPF (formatted)       |
| `role`  | string | User role (enum)      |

### Vaccine Object (in relations)

| Field           | Type    | Description                            |
|-----------------|---------|----------------------------------------|
| `id`            | string  | Vaccine ID (UUID)                      |
| `name`          | string  | Vaccine name                           |
| `manufacturer`  | string  | Manufacturer name                      |
| `dosesRequired` | number  | Number of required doses               |
| `intervalDays`  | number? | Minimum days between doses (optional)  |
| `totalStock`    | number  | Total available stock (only in detail) |

### Pagination Object

| Field        | Type    | Description                                    |
|--------------|---------|------------------------------------------------|
| `page`       | number  | Current page number (1-indexed)                |
| `perPage`    | number  | Number of items per page                       |
| `total`      | number  | Total number of schedulings matching filters   |
| `totalPages` | number  | Total number of pages                          |
| `hasNext`    | boolean | Whether there are more pages after this one    |
| `hasPrev`    | boolean | Whether there are pages before this one        |

---

## Examples

### Example 1: Create First Dose Scheduling

```bash
curl -X POST "http://localhost:3000/api/vaccine-schedulings" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "vaccineId": "660f9511-f39c-52e5-b827-557766551111",
    "nurseId": "770g0622-g40d-63f6-c938-668877662222",
    "scheduledDate": "2025-12-15T10:00:00.000Z",
    "doseNumber": 1,
    "notes": "First dose of COVID-19 vaccine"
  }'
```

### Example 2: Get All Confirmed Schedulings for December 2025

```bash
curl -X GET "http://localhost:3000/api/vaccine-schedulings?status=CONFIRMED&startDate=2025-12-01T00:00:00.000Z&endDate=2025-12-31T23:59:59.999Z&limit=50" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example 3: Get Nurse's February 2025 Calendar

```bash
curl -X GET "http://localhost:3000/api/vaccine-schedulings/nurse/monthly?month=1&year=2025" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example 4: Update Scheduling Status to Confirmed

```bash
curl -X PATCH "http://localhost:3000/api/vaccine-schedulings/880h1733-h51e-74g7-d049-779988773333" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CONFIRMED",
    "notes": "Patient called to confirm"
  }'
```

### Example 5: Cancel a Scheduling

```bash
curl -X DELETE "http://localhost:3000/api/vaccine-schedulings/880h1733-h51e-74g7-d049-779988773333" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example 6: Get Patient's Vaccination History

```bash
curl -X GET "http://localhost:3000/api/vaccine-schedulings?userId=550e8400-e29b-41d4-a716-446655440000&limit=100" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example 7: Get Schedulings for Specific Date

```bash
curl -X GET "http://localhost:3000/api/vaccine-schedulings/by-date?date=2025-12-15T00:00:00.000Z" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example 8: Get Schedulings for Current Date

```bash
curl -X GET "http://localhost:3000/api/vaccine-schedulings/by-date" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Troubleshooting

### Common Issues

**Issue**: Getting `InsufficientStockError` when creating scheduling
- **Solution**: Check vaccine stock using `GET /api/vaccines/:id`. Stock may be fully reserved by other schedulings.

**Issue**: Getting `MissingPreviousDoseError` for dose 2
- **Solution**: Create dose 1 scheduling first. Multi-dose vaccines must be scheduled in sequence.

**Issue**: Getting `InvalidSchedulingDateError` about interval
- **Solution**: Check the vaccine's `intervalDays`. Dose 2+ must be scheduled at least this many days after the previous dose.

**Issue**: Getting `DuplicateSchedulingError`
- **Solution**: A scheduling for this dose already exists. Check existing schedulings with `GET /api/vaccine-schedulings?userId=X&vaccineId=Y`.

**Issue**: Cannot update scheduling - `SchedulingAlreadyCompletedError`
- **Solution**: Completed schedulings cannot be modified. This is intentional to maintain vaccine administration records.

**Issue**: Getting 403 when accessing another user's scheduling
- **Solution**: Non-MANAGER users can only access their own schedulings. Verify the scheduling belongs to the authenticated user.

**Issue**: Nurse monthly endpoint returns 403
- **Solution**: Only users with role `NURSE` can access this endpoint. Verify the authenticated user has the correct role.

**Issue**: Empty arrays for all dates in nurse monthly response
- **Solution**: The nurse has no scheduled appointments for that month, or the nurse is not assigned to any schedulings.

**Issue**: Invalid date format errors
- **Solution**: Ensure dates are in ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`. Use `new Date().toISOString()` in JavaScript.

---

## Changelog

### Version 1.1.0 (2025-11-24)
- Added `GET /vaccine-schedulings/by-date` endpoint
- Support for filtering schedulings by specific date or current date
- EMPLOYEE role restriction for date-based queries

### Version 1.0.0 (2025-11-18)
- Initial release
- Added `POST /vaccine-schedulings` endpoint
- Added `GET /vaccine-schedulings/:id` endpoint
- Added `GET /vaccine-schedulings` endpoint with pagination and filters
- Added `GET /vaccine-schedulings/nurse/monthly` endpoint
- Added `PATCH /vaccine-schedulings/:id` endpoint
- Added `DELETE /vaccine-schedulings/:id` endpoint
- Implemented atomic stock validation with pessimistic locking
- Implemented dose sequence validation
- Implemented role-based authorization
- Integrated with notification system
- Support for nurse assignment
