# Vaccine Application API Documentation

## Overview

The Vaccine Application API provides endpoints for managing vaccine applications (administrations) in the system. This includes recording vaccine doses, tracking vaccination history, and managing application records. All endpoints require authentication and implement role-based authorization.

**Base Path**: `/api/vaccine-applications`

**Authentication**: All endpoints require a valid JWT token in the `Authorization` header.

---

## Endpoints

### 1. Create Vaccine Application

Record a new vaccine administration. Supports both scheduled applications (linked to an existing appointment) and walk-in applications (no prior scheduling).

**Endpoint**: `POST /api/vaccine-applications`

**Authentication**: Required (JWT token)

**Authorization**: NURSE or MANAGER roles only

#### Request Body

The API supports two types of applications via a discriminated union:

**Type A: Scheduled Application** (linked to existing scheduling)
```json
{
  "schedulingId": "uuid",
  "batchId": "uuid",
  "applicationSite": "string",
  "observations": "string (optional)"
}
```

**Type B: Walk-in Application** (no prior scheduling)
```json
{
  "receivedById": "uuid",
  "vaccineId": "uuid",
  "doseNumber": 1,
  "batchId": "uuid",
  "applicationSite": "string",
  "observations": "string (optional)"
}
```

#### Request Parameters

| Parameter | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| `schedulingId` | string | Conditional* | UUID format | Link to existing scheduling (Type A) |
| `receivedById` | string | Conditional* | UUID format | Patient receiving vaccine (Type B) |
| `vaccineId` | string | Conditional* | UUID format | Vaccine being applied (Type B) |
| `doseNumber` | number | Conditional* | Integer, 1-10 | Dose number (Type B) |
| `batchId` | string | Yes | UUID format | Vaccine batch being used |
| `applicationSite` | string | Yes | 1-100 chars | Body location (e.g., "Left Deltoid") |
| `observations` | string | No | Max 500 chars | Additional notes |

*Either provide `schedulingId` (Type A) OR `receivedById`, `vaccineId`, and `doseNumber` (Type B), but not both.

#### Valid Application Sites

- `Left Arm`
- `Right Arm`
- `Left Deltoid`
- `Right Deltoid`
- `Left Thigh`
- `Right Thigh`
- `Abdomen`
- `Buttocks`

#### Request Examples

**Scheduled Application:**
```http
POST /api/vaccine-applications
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "schedulingId": "550e8400-e29b-41d4-a716-446655440000",
  "batchId": "660f9511-f39c-52e5-b827-557766551111",
  "applicationSite": "Left Deltoid",
  "observations": "Patient tolerated well"
}
```

**Walk-in Application:**
```http
POST /api/vaccine-applications
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "receivedById": "770g0622-g40d-63f6-c938-668877662222",
  "vaccineId": "880h1733-h51e-74g7-d049-779988773333",
  "doseNumber": 1,
  "batchId": "660f9511-f39c-52e5-b827-557766551111",
  "applicationSite": "Right Arm",
  "observations": "First dose"
}
```

#### Success Response (201 Created)

```json
{
  "id": "990i2844-i62f-85h8-e150-880099884444",
  "userId": "770g0622-g40d-63f6-c938-668877662222",
  "appliedById": "aa1j3955-j73g-96i9-f261-991100995555",
  "vaccineId": "880h1733-h51e-74g7-d049-779988773333",
  "batchId": "660f9511-f39c-52e5-b827-557766551111",
  "doseNumber": 1,
  "applicationDate": "2025-11-18T00:00:00.000Z",
  "applicationSite": "left deltoid",
  "observations": "patient tolerated well",
  "schedulingId": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-11-18T14:30:00.000Z",
  "updatedAt": "2025-11-18T14:30:00.000Z"
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

**403 Forbidden** - User lacks required role
```json
{
  "error": "ValidationError",
  "message": "Only users with NURSE or MANAGER role can register vaccines",
  "statusCode": 400
}
```

**400 Bad Request** - Validation error
```json
{
  "error": "ValidationError",
  "message": "Validation failed",
  "statusCode": 400,
  "details": [
    {
      "field": "batchId",
      "message": "Batch ID must be a valid UUID"
    }
  ]
}
```

**400 Bad Request** - Invalid application type
```json
{
  "error": "ValidationError",
  "message": "Either schedulingId (for scheduled applications) OR (receivedById, vaccineId, doseNumber) (for walk-in applications) must be provided, but not both",
  "statusCode": 400
}
```

**404 Not Found** - User not found
```json
{
  "error": "UserNotFoundError",
  "message": "User with ID 770g0622-g40d-63f6-c938-668877662222 not found",
  "statusCode": 404
}
```

**404 Not Found** - Vaccine not found
```json
{
  "error": "VaccineNotFoundError",
  "message": "Vaccine with ID 880h1733-h51e-74g7-d049-779988773333 not found",
  "statusCode": 404
}
```

**404 Not Found** - Batch not found
```json
{
  "error": "VaccineBatchNotFoundError",
  "message": "Batch with ID 660f9511-f39c-52e5-b827-557766551111 not found",
  "statusCode": 404
}
```

**404 Not Found** - Scheduling not found
```json
{
  "error": "VaccineSchedulingNotFoundError",
  "message": "Scheduling with ID 550e8400-e29b-41d4-a716-446655440000 not found",
  "statusCode": 404
}
```

**400 Bad Request** - Batch not available
```json
{
  "error": "BatchNotAvailableError",
  "message": "Batch is not available for use",
  "statusCode": 400
}
```

**400 Bad Request** - Insufficient batch quantity
```json
{
  "error": "InsufficientBatchQuantityError",
  "message": "Batch has insufficient quantity for this application",
  "statusCode": 400
}
```

**409 Conflict** - Duplicate dose
```json
{
  "error": "DuplicateDoseError",
  "message": "User 770g0622-g40d-63f6-c938-668877662222 already received dose 1 of vaccine 880h1733-h51e-74g7-d049-779988773333",
  "statusCode": 409
}
```

**400 Bad Request** - Invalid dose sequence
```json
{
  "error": "InvalidDoseSequenceError",
  "message": "Dose sequence is invalid. Previous doses must be applied first",
  "statusCode": 400
}
```

**400 Bad Request** - Minimum interval not met
```json
{
  "error": "MinimumIntervalNotMetError",
  "message": "Minimum interval of 30 days not met. Only 15 days have passed since last dose",
  "statusCode": 400
}
```

**400 Bad Request** - Exceeded required doses
```json
{
  "error": "ExceededRequiredDosesError",
  "message": "Cannot apply more doses than required. Vaccine 880h1733-h51e-74g7-d049-779988773333 requires only 2 doses",
  "statusCode": 400
}
```

---

### 2. Get Vaccine Application by ID

Retrieve a single vaccine application record by its ID.

**Endpoint**: `GET /api/vaccine-applications/:id`

**Authentication**: Required (JWT token)

**Authorization**: Role-based access
- **EMPLOYEE**: Can only view their own applications (as receiver)
- **NURSE**: Can view applications they performed + their own
- **MANAGER**: Can view all applications

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Vaccine application ID (UUID format) |

#### Request Example

```http
GET /api/vaccine-applications/990i2844-i62f-85h8-e150-880099884444
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Success Response (200 OK)

```json
{
  "id": "990i2844-i62f-85h8-e150-880099884444",
  "userId": "770g0622-g40d-63f6-c938-668877662222",
  "appliedById": "aa1j3955-j73g-96i9-f261-991100995555",
  "vaccineId": "880h1733-h51e-74g7-d049-779988773333",
  "batchId": "660f9511-f39c-52e5-b827-557766551111",
  "doseNumber": 1,
  "applicationDate": "2025-11-18T00:00:00.000Z",
  "applicationSite": "left deltoid",
  "observations": "patient tolerated well",
  "schedulingId": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-11-18T14:30:00.000Z",
  "updatedAt": "2025-11-18T14:30:00.000Z"
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

**404 Not Found** - Application doesn't exist
```json
{
  "error": "VaccineApplicationNotFoundError",
  "message": "Vaccine application not found",
  "statusCode": 404
}
```

**400 Bad Request** - Invalid ID format
```json
{
  "error": "ValidationError",
  "message": "Validation failed",
  "statusCode": 400,
  "details": [
    {
      "field": "id",
      "message": "Invalid UUID format"
    }
  ]
}
```

---

### 3. List Vaccine Applications (Paginated)

Retrieve a paginated list of vaccine applications with optional filtering and sorting.

**Endpoint**: `GET /api/vaccine-applications`

**Authentication**: Required (JWT token)

**Authorization**: Role-based filtering
- **EMPLOYEE**: Only see their own applications
- **NURSE**: See applications they performed + their own
- **MANAGER**: See all applications

#### Query Parameters

| Parameter | Type | Required | Default | Validation | Description |
|-----------|------|----------|---------|------------|-------------|
| `page` | number | No | 1 | Min: 1 | Page number (1-indexed) |
| `perPage` | number | No | 10 | 1-100 | Items per page |
| `sortBy` | string | No | `applicationDate` | See valid fields | Field to sort by |
| `sortOrder` | string | No | `desc` | `asc` or `desc` | Sort direction |
| `userId` | string | No | - | UUID format | Filter by patient |
| `vaccineId` | string | No | - | UUID format | Filter by vaccine |
| `appliedById` | string | No | - | UUID format | Filter by nurse |
| `batchId` | string | No | - | UUID format | Filter by batch |
| `doseNumber` | number | No | - | Positive integer | Filter by dose number |

#### Valid Sort Fields

- `applicationDate` (default)
- `doseNumber`
- `createdAt`
- `updatedAt`

#### Request Examples

```bash
GET /api/vaccine-applications

GET /api/vaccine-applications?userId=770g0622-g40d-63f6-c938-668877662222

GET /api/vaccine-applications?vaccineId=880h1733-h51e-74g7-d049-779988773333&doseNumber=1

GET /api/vaccine-applications?page=2&perPage=20&sortBy=applicationDate&sortOrder=asc
```

#### Success Response (200 OK)

```json
{
  "data": [
    {
      "id": "990i2844-i62f-85h8-e150-880099884444",
      "userId": "770g0622-g40d-63f6-c938-668877662222",
      "appliedById": "aa1j3955-j73g-96i9-f261-991100995555",
      "vaccineId": "880h1733-h51e-74g7-d049-779988773333",
      "batchId": "660f9511-f39c-52e5-b827-557766551111",
      "doseNumber": 1,
      "applicationDate": "2025-11-18T00:00:00.000Z",
      "applicationSite": "left deltoid",
      "observations": "patient tolerated well",
      "schedulingId": "550e8400-e29b-41d4-a716-446655440000",
      "createdAt": "2025-11-18T14:30:00.000Z",
      "updatedAt": "2025-11-18T14:30:00.000Z"
    }
  ],
  "metadata": {
    "page": 1,
    "perPage": 10,
    "total": 45,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
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

**400 Bad Request** - Invalid query parameters
```json
{
  "error": "ValidationError",
  "message": "Validation failed",
  "statusCode": 400,
  "details": [
    {
      "field": "page",
      "message": "Page must be a positive integer"
    }
  ]
}
```

---

### 4. Update Vaccine Application

Update an existing vaccine application record. Only allows updating non-critical fields.

**Endpoint**: `PATCH /api/vaccine-applications/:id`

**Authentication**: Required (JWT token)

**Authorization**:
- **NURSE** who applied the vaccine can update it
- **MANAGER** can update any application

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Vaccine application ID (UUID format) |

#### Request Body

| Parameter | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| `applicationSite` | string | No | 1-100 chars | Update body location |
| `observations` | string | No | Max 500 chars | Update notes |

#### Request Example

```http
PATCH /api/vaccine-applications/990i2844-i62f-85h8-e150-880099884444
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "applicationSite": "Right Deltoid",
  "observations": "Updated: Patient reported mild soreness"
}
```

#### Success Response (200 OK)

```json
{
  "id": "990i2844-i62f-85h8-e150-880099884444",
  "userId": "770g0622-g40d-63f6-c938-668877662222",
  "appliedById": "aa1j3955-j73g-96i9-f261-991100995555",
  "vaccineId": "880h1733-h51e-74g7-d049-779988773333",
  "batchId": "660f9511-f39c-52e5-b827-557766551111",
  "doseNumber": 1,
  "applicationDate": "2025-11-18T00:00:00.000Z",
  "applicationSite": "right deltoid",
  "observations": "updated: patient reported mild soreness",
  "schedulingId": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-11-18T14:30:00.000Z",
  "updatedAt": "2025-11-18T15:45:30.000Z"
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

**403 Forbidden** - User not authorized to update this application
```json
{
  "error": "UnauthorizedApplicationUpdateError",
  "message": "Only the nurse who applied this vaccine or a manager can update it",
  "statusCode": 403
}
```

**404 Not Found** - Application doesn't exist
```json
{
  "error": "VaccineApplicationNotFoundError",
  "message": "Vaccine application not found",
  "statusCode": 404
}
```

**400 Bad Request** - Validation error
```json
{
  "error": "ValidationError",
  "message": "Validation failed",
  "statusCode": 400,
  "details": [
    {
      "field": "applicationSite",
      "message": "Application site cannot exceed 100 characters"
    }
  ]
}
```

---

### 5. Get User Vaccination History

Retrieve complete vaccination history for a specific user. Returns a comprehensive vaccination card with statistics, dose tracking, and compliance information.

**Endpoint**: `GET /api/vaccine-applications/users/:id/history`

**Authentication**: Required (JWT token)

**Authorization**:
- **EMPLOYEE**: Can only view their own history
- **NURSE**: Can view any user's history
- **MANAGER**: Can view any user's history

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | User ID (UUID format) |

#### Request Example

```http
GET /api/vaccine-applications/users/770g0622-g40d-63f6-c938-668877662222/history
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Success Response (200 OK)

```json
{
  "issuedAt": "2025-11-18T14:30:00.000Z",
  "summary": {
    "totalVaccinesApplied": 5,
    "totalVaccinesCompleted": 3,
    "totalMandatoryPending": 2,
    "totalDosesPending": 1,
    "compliancePercentage": 60
  },
  "vaccinesByType": [
    {
      "vaccine": {
        "id": "880h1733-h51e-74g7-d049-779988773333",
        "name": "COVID-19",
        "manufacturer": "Pfizer",
        "dosesRequired": 2,
        "intervalDays": 90,
        "isObligatory": true
      },
      "doses": [
        {
          "id": "990i2844-i62f-85h8-e150-880099884444",
          "doseNumber": 1,
          "applicationDate": "2025-09-18T00:00:00.000Z",
          "applicationSite": "left deltoid",
          "appliedBy": {
            "id": "aa1j3955-j73g-96i9-f261-991100995555",
            "name": "Nurse Maria Silva",
            "role": "NURSE"
          },
          "batch": {
            "id": "660f9511-f39c-52e5-b827-557766551111",
            "batchNumber": "LOT-2025-001",
            "expirationDate": "2026-12-31T00:00:00.000Z"
          }
        },
        {
          "id": "aa1j3955-j73g-96i9-f261-991100995556",
          "doseNumber": 2,
          "applicationDate": "2025-12-17T00:00:00.000Z",
          "applicationSite": "right deltoid",
          "appliedBy": {
            "id": "aa1j3955-j73g-96i9-f261-991100995555",
            "name": "Nurse Maria Silva",
            "role": "NURSE"
          },
          "batch": {
            "id": "660f9511-f39c-52e5-b827-557766551111",
            "batchNumber": "LOT-2025-001",
            "expirationDate": "2026-12-31T00:00:00.000Z"
          }
        }
      ],
      "isComplete": true,
      "completionPercentage": 100,
      "totalDosesRequired": 2,
      "dosesApplied": 2
    },
    {
      "vaccine": {
        "id": "bb2k4066-k84h-07j0-g372-002211006666",
        "name": "Hepatitis B",
        "manufacturer": "GSK",
        "dosesRequired": 3,
        "intervalDays": 30,
        "isMandatory": true
      },
      "doses": [
        {
          "id": "cc3l5177-l95i-18k1-h483-113322117777",
          "doseNumber": 1,
          "applicationDate": "2025-10-01T00:00:00.000Z",
          "applicationSite": "left arm",
          "appliedBy": {
            "id": "aa1j3955-j73g-96i9-f261-991100995555",
            "name": "Nurse Maria Silva",
            "role": "NURSE"
          },
          "batch": {
            "id": "dd4m6288-m06j-29l2-i594-224433228888",
            "batchNumber": "LOT-2025-002",
            "expirationDate": "2027-06-30T00:00:00.000Z"
          }
        }
      ],
      "isComplete": false,
      "completionPercentage": 33,
      "totalDosesRequired": 3,
      "dosesApplied": 1
    }
  ],
  "applied": [
    {
      "id": "990i2844-i62f-85h8-e150-880099884444",
      "vaccineId": "880h1733-h51e-74g7-d049-779988773333",
      "doseNumber": 1,
      "applicationDate": "2025-09-18T00:00:00.000Z",
      "applicationSite": "left deltoid",
      "observations": "patient tolerated well"
    }
  ],
  "mandatoryNotTaken": [
    {
      "id": "ee5n7399-n17k-30m3-j605-335544339999",
      "name": "Yellow Fever",
      "manufacturer": "Bio-Manguinhos",
      "dosesRequired": 1,
      "intervalDays": null,
      "isMandatory": true
    }
  ],
  "pendingDoses": [
    {
      "vaccine": {
        "id": "bb2k4066-k84h-07j0-g372-002211006666",
        "name": "Hepatitis B",
        "manufacturer": "GSK",
        "dosesRequired": 3,
        "intervalDays": 30,
        "isMandatory": true
      },
      "currentDose": 1,
      "nextDose": 2,
      "expectedDate": "2025-10-31T00:00:00.000Z"
    }
  ]
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

**403 Forbidden** - User not authorized to view this history
```json
{
  "error": "ValidationError",
  "message": "You can only view your own vaccination history",
  "statusCode": 400
}
```

**404 Not Found** - User doesn't exist
```json
{
  "error": "UserNotFoundError",
  "message": "User with ID 770g0622-g40d-63f6-c938-668877662222 not found",
  "statusCode": 404
}
```

**400 Bad Request** - Invalid ID format
```json
{
  "error": "ValidationError",
  "message": "Validation failed",
  "statusCode": 400,
  "details": [
    {
      "field": "id",
      "message": "Invalid UUID format"
    }
  ]
}
```

---

## Business Rules

### Authorization Matrix

| Endpoint | EMPLOYEE | NURSE | MANAGER |
|----------|----------|-------|---------|
| Create application | No | Yes | Yes |
| Get by ID | Own only | Own + applied | All |
| List applications | Own only | Own + applied | All |
| Update application | No | If applied it | All |
| Get user history | Own only | All | All |

### Vaccine Application Validation

#### Role Requirements
- **Requesting User** (who initiates registration): Must be NURSE or MANAGER
- **Applicator** (who physically applies vaccine): Must be NURSE
- **Receiver** (patient): Can be any active user

#### Application Types
1. **Scheduled Application**: Links to existing scheduling
   - Uses scheduling data for patient, vaccine, and dose
   - Applicator comes from scheduling's assigned nurse (if set) or requesting user
   - Validates scheduling status (must be SCHEDULED)

2. **Walk-in Application**: No prior scheduling
   - Requires explicit patient, vaccine, and dose information
   - Applicator is the requesting user (must be NURSE)

#### Dose Validation
- **No Duplicates**: Same user cannot receive same dose of same vaccine twice
- **Sequential**: Must apply doses in order (dose 2 requires dose 1 first, etc.)
- **Max Doses**: Cannot exceed vaccine's `dosesRequired`
- **Minimum Interval**: If vaccine has `intervalDays`, must wait between doses

#### Batch Validation
- Must exist and not be deleted
- Status must be `AVAILABLE`
- Must have sufficient quantity (>0)
- Must not be expired (`expirationDate` > today)
- Must belong to the specified vaccine
- Quantity is decremented atomically in transaction

### Stock Management

All vaccine applications trigger atomic stock operations:
1. Validate batch quantity > 0
2. Create application record
3. Decrement batch quantity by 1
4. All operations within a single database transaction
5. If any step fails, entire operation rolls back

### Event Integration

When a vaccine application is successfully created:
- Event `VACCINE_APPLIED` is emitted
- Triggers in-app notification to patient
- Contains application details (vaccine, dose, batch, nurse)

---

## Response Field Descriptions

### VaccineApplication Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (UUID) |
| `userId` | string | Patient who received the vaccine |
| `appliedById` | string | Nurse who applied the vaccine |
| `vaccineId` | string | Vaccine that was applied |
| `batchId` | string | Batch used for this application |
| `doseNumber` | number | Dose number (1, 2, 3, etc.) |
| `applicationDate` | string | Date vaccine was applied (ISO 8601, date only) |
| `applicationSite` | string | Body location where vaccine was applied |
| `observations` | string? | Optional notes (null if not provided) |
| `schedulingId` | string? | Link to scheduling (null for walk-in) |
| `createdAt` | string | Record creation timestamp (ISO 8601) |
| `updatedAt` | string | Last update timestamp (ISO 8601) |

### Vaccination History Response

| Field | Type | Description |
|-------|------|-------------|
| `issuedAt` | string | Timestamp when history was generated |
| `summary` | object | Statistics about vaccination status |
| `summary.totalVaccinesApplied` | number | Count of unique vaccines received |
| `summary.totalVaccinesCompleted` | number | Count of vaccines with all doses |
| `summary.totalMandatoryPending` | number | Mandatory vaccines not started |
| `summary.totalDosesPending` | number | Incomplete vaccine series count |
| `summary.compliancePercentage` | number | Percentage of mandatory vaccines completed (0-100) |
| `vaccinesByType` | array | Vaccines grouped with dose details |
| `applied` | array | Complete list of all applications |
| `mandatoryNotTaken` | array | Mandatory vaccines not yet received |
| `pendingDoses` | array | Vaccines needing additional doses |

---

## Examples

### Example 1: Create Scheduled Application

```bash
curl -X POST "http://localhost:3000/api/vaccine-applications" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "schedulingId": "550e8400-e29b-41d4-a716-446655440000",
    "batchId": "660f9511-f39c-52e5-b827-557766551111",
    "applicationSite": "Left Deltoid",
    "observations": "Patient tolerated well"
  }'
```

### Example 2: Create Walk-in Application

```bash
curl -X POST "http://localhost:3000/api/vaccine-applications" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receivedById": "770g0622-g40d-63f6-c938-668877662222",
    "vaccineId": "880h1733-h51e-74g7-d049-779988773333",
    "doseNumber": 1,
    "batchId": "660f9511-f39c-52e5-b827-557766551111",
    "applicationSite": "Right Arm"
  }'
```

### Example 3: List Applications for Specific Vaccine

```bash
curl -X GET "http://localhost:3000/api/vaccine-applications?vaccineId=880h1733-h51e-74g7-d049-779988773333&page=1&perPage=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example 4: Update Application Notes

```bash
curl -X PATCH "http://localhost:3000/api/vaccine-applications/990i2844-i62f-85h8-e150-880099884444" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "observations": "Patient reported mild soreness after 24 hours"
  }'
```

### Example 5: Get User Vaccination History

```bash
curl -X GET "http://localhost:3000/api/vaccine-applications/users/770g0622-g40d-63f6-c938-668877662222/history" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Error Reference

### All Possible Error Types

| Error Name | Status Code | Description | When It Occurs |
|------------|-------------|-------------|----------------|
| `UnauthorizedError` | 401 | Missing/invalid token | No auth token provided or expired |
| `ValidationError` | 400 | Request validation failed | Invalid input data or business rule violation |
| `VaccineApplicationNotFoundError` | 404 | Application not found | Invalid application ID |
| `UserNotFoundError` | 404 | User not found | Invalid receiver or applicator ID |
| `VaccineNotFoundError` | 404 | Vaccine not found | Invalid vaccine ID |
| `VaccineBatchNotFoundError` | 404 | Batch not found | Invalid batch ID |
| `VaccineSchedulingNotFoundError` | 404 | Scheduling not found | Invalid scheduling ID |
| `BatchNotAvailableError` | 400 | Batch cannot be used | Batch expired or status not AVAILABLE |
| `InsufficientBatchQuantityError` | 400 | No doses left | Batch quantity is 0 |
| `DuplicateDoseError` | 409 | Duplicate application | User already received this dose |
| `InvalidDoseSequenceError` | 400 | Wrong dose order | Previous doses not applied yet |
| `MinimumIntervalNotMetError` | 400 | Too soon for next dose | Minimum days between doses not met |
| `ExceededRequiredDosesError` | 400 | Too many doses | Attempting to exceed dosesRequired |
| `UnauthorizedApplicationUpdateError` | 403 | Cannot update | User not authorized to modify application |

---

## Integration Notes

### Frontend Integration

#### Recording Vaccine Applications
1. **From Scheduling**: Use scheduled application type with `schedulingId`
   - Pre-fills patient, vaccine, and dose from scheduling
   - Simplifies nurse workflow for appointments

2. **Walk-in Patients**: Use walk-in application type
   - Requires manual entry of patient, vaccine, and dose
   - Validates all business rules server-side

#### Displaying Vaccination History
The history endpoint provides:
- Vaccination card view with all doses
- Progress tracking for multi-dose vaccines
- Compliance statistics for mandatory vaccines
- Next dose recommendations with expected dates

#### Real-time Updates
After creating an application:
- Patient receives in-app notification
- Vaccination history is updated
- Batch stock is decremented
- Consider refreshing relevant views

### Error Handling Best Practices

```typescript
try {
  const response = await fetch('/api/vaccine-applications', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(applicationData)
  });

  if (response.status === 409) {
    // Duplicate dose - user already received this
    showError('This dose has already been applied to this patient');
  } else if (response.status === 400) {
    const error = await response.json();

    if (error.error === 'MinimumIntervalNotMetError') {
      showError('Too soon for next dose. Please wait longer.');
    } else if (error.error === 'InsufficientBatchQuantityError') {
      showError('This batch has no doses remaining. Please select another batch.');
    } else if (error.error === 'InvalidDoseSequenceError') {
      showError('Previous doses must be applied first.');
    } else {
      // Handle other validation errors
      showError(error.message);
    }
  } else if (!response.ok) {
    throw new Error('Failed to record vaccine application');
  }

  const application = await response.json();
  showSuccess('Vaccine application recorded successfully');

} catch (error) {
  console.error('Network error:', error);
  showError('Unable to connect to server');
}
```

### Testing Considerations

#### Test Data Setup
For testing dose sequence validation:
1. Create vaccine with `dosesRequired: 3`, `intervalDays: 30`
2. Apply dose 1 on day 0
3. Attempt dose 3 on day 1 → Should fail (InvalidDoseSequenceError)
4. Apply dose 2 on day 1 → Should fail (MinimumIntervalNotMetError)
5. Apply dose 2 on day 31 → Should succeed
6. Apply dose 3 on day 32 → Should fail (MinimumIntervalNotMetError)
7. Apply dose 3 on day 62 → Should succeed

#### Stock Management Testing
1. Create batch with quantity 1
2. Apply vaccine → Should succeed, quantity becomes 0
3. Attempt second application → Should fail (InsufficientBatchQuantityError)

---

## Common Use Cases

### Use Case 1: Scheduled Vaccination

**Scenario**: Nurse is ready to administer a vaccine for a scheduled appointment

**Steps**:
1. Nurse opens patient's appointment in system
2. System displays scheduling details (patient, vaccine, dose, date)
3. Nurse selects batch from available stock
4. Nurse enters application site and any observations
5. System validates all business rules
6. Vaccine is recorded and patient is notified

**API Call**:
```json
POST /api/vaccine-applications
{
  "schedulingId": "uuid-of-appointment",
  "batchId": "uuid-of-batch",
  "applicationSite": "Left Deltoid",
  "observations": "No adverse reactions"
}
```

### Use Case 2: Walk-in Vaccination

**Scenario**: Patient walks in without appointment for routine vaccine

**Steps**:
1. Nurse searches for patient in system
2. Nurse selects vaccine and verifies patient hasn't received this dose
3. Nurse selects batch and enters application details
4. System validates dose sequence and intervals
5. Vaccine is recorded

**API Call**:
```json
POST /api/vaccine-applications
{
  "receivedById": "patient-uuid",
  "vaccineId": "vaccine-uuid",
  "doseNumber": 2,
  "batchId": "batch-uuid",
  "applicationSite": "Right Arm"
}
```

### Use Case 3: Viewing Patient Vaccination Card

**Scenario**: Patient requests their complete vaccination history

**Steps**:
1. Patient logs in or nurse looks up patient
2. System retrieves comprehensive vaccination history
3. Display shows completed vaccines, pending doses, and mandatory vaccines not taken
4. Next dose recommendations with expected dates

**API Call**:
```
GET /api/vaccine-applications/users/{patient-id}/history
```

---

## Troubleshooting

### Common Issues

**Issue**: Getting 409 Duplicate Dose error
- **Cause**: Attempting to apply same dose of same vaccine to same patient twice
- **Solution**: Check patient's vaccination history first. If dose was incorrectly recorded, contact administrator to correct the record.

**Issue**: Getting 400 Invalid Dose Sequence error
- **Cause**: Attempting to apply dose N when dose N-1 hasn't been applied yet
- **Solution**: Apply doses in order. Check patient's vaccination history to see which doses are already applied.

**Issue**: Getting 400 Minimum Interval Not Met error
- **Cause**: Not enough days have passed since previous dose
- **Solution**: Wait until the required interval has passed. The error message shows required days vs. actual days elapsed.

**Issue**: Getting 400 Insufficient Batch Quantity error
- **Cause**: Selected batch has no remaining doses (quantity = 0)
- **Solution**: Select a different batch with available quantity. Consider batch expiration dates when choosing.

**Issue**: Getting 403 Unauthorized for creating application
- **Cause**: User role is EMPLOYEE (not NURSE or MANAGER)
- **Solution**: Only nurses and managers can record vaccine applications. Ensure correct user is logged in.

**Issue**: Cannot see expected applications in list
- **Cause**: Role-based filtering is hiding applications
- **Solution**:
  - EMPLOYEES only see their own applications
  - NURSES see applications they performed + their own
  - MANAGERS see all applications

**Issue**: Cannot update application - 403 Unauthorized Update
- **Cause**: User is not the nurse who applied it, and is not a manager
- **Solution**: Only the nurse who performed the application or a manager can update it. This prevents unauthorized modifications to medical records.

**Issue**: Batch validation errors
- **Cause**: Batch status is not AVAILABLE or batch is expired
- **Solution**: Check batch details. Only AVAILABLE batches that haven't expired can be used. Contact manager to manage batch inventory.

---

## Changelog

### Version 1.0.0 (2025-11-18)
- Initial release
- Added `POST /vaccine-applications` endpoint with scheduled and walk-in types
- Added `GET /vaccine-applications/:id` endpoint
- Added `GET /vaccine-applications` endpoint with pagination and filtering
- Added `PATCH /vaccine-applications/:id` endpoint
- Added `GET /vaccine-applications/users/:id/history` endpoint
- Comprehensive business rules validation
- Role-based authorization
- Atomic stock management
- Event integration for notifications
- Support for dose sequencing and interval validation
