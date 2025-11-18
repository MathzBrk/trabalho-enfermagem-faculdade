# Vaccine Batch API Documentation

## Overview

The Vaccine Batch API manages vaccine batches (lots) associated with vaccines in the system.

Base Path: `/api/vaccine-batches`

Authentication: All endpoints require a valid JWT in the `Authorization` header.

Authorization: Creation and updates typically require NURSE or MANAGER roles (enforced by service/authorization middleware).

---

## Endpoints

### 1. Create a Vaccine Batch

Create a new batch tied to an existing vaccine. The service layer updates the related vaccine's `totalStock` when appropriate.

- Endpoint: `POST /api/vaccine-batches`
- Authentication: Required
- Authorization: Typically NURSE or MANAGER

#### Request Body (application/json)

| Field | Type | Required | Description |
|---|---:|---:|---|
| `vaccineId` | string (UUID) | yes | ID of the vaccine this batch belongs to |
| `batchNumber` | string | yes | Unique batch identifier |
| `quantity` | number | yes | Initial quantity for the batch (integer >= 1) |
| `expirationDate` | string (ISO 8601) | yes | Expiration date (ISO format) |
| `receivedDate` | string (ISO 8601) | no | Date the batch was received (defaults to now if omitted) |

#### Request Example

```http
POST /api/vaccine-batches
Authorization: Bearer <token>
Content-Type: application/json

{
  "vaccineId": "550e8400-e29b-41d4-a716-446655440000",
  "batchNumber": "L-2025-001",
  "quantity": 100,
  "expirationDate": "2026-03-01T00:00:00.000Z",
  "receivedDate": "2025-11-01T00:00:00.000Z"
}
```

#### Success Response (201 Created)

```json
{
  "id": "660f9511-f39c-52e5-b827-557766551111",
  "vaccineId": "550e8400-e29b-41d4-a716-446655440000",
  "batchNumber": "L-2025-001",
  "initialQuantity": 100,
  "currentQuantity": 100,
  "expirationDate": "2026-03-01T00:00:00.000Z",
  "receivedDate": "2025-11-01T00:00:00.000Z",
  "status": "AVAILABLE",
  "createdById": "770g0622-g40d-63f6-c938-668877662222",
  "createdAt": "2025-11-16T12:00:00.000Z"
}
```

#### Error Responses

**400 Bad Request** — Validation failed (e.g. invalid `vaccineId`, invalid date format)
```json
{
  "error": "ValidationError",
  "message": "Validation failed",
  "statusCode": 400,
  "details": [ { "field": "vaccineId", "message": "Vaccine ID must be a valid UUID" } ]
}
```

**401 Unauthorized**
```json
{ "error": "UnauthorizedError", "message": "Authentication token is required", "statusCode": 401 }
```

**403 Forbidden** — Insufficient role/permissions

**404 Not Found** — Vaccine not found

**409 Conflict** — Duplicate `batchNumber`

---

### 2. Update a Vaccine Batch

Update editable fields of a batch (batch number, quantities, dates, status). The service implements rules for how `quantity` updates map to `initialQuantity`/`currentQuantity`.

- Endpoint: `PATCH /api/vaccine-batches/:id`
- Authentication: Required
- Authorization: Typically NURSE or MANAGER

#### Path Parameters

| Parameter | Type | Required | Description |
|---|---:|---:|---|
| `id` | string (UUID) | yes | Batch ID |

#### Request Body (application/json) — all fields optional

| Field | Type | Description |
|---|---:|---|
| `batchNumber` | string | New batch number |
| `quantity` | number | Quantity update (service decides how to apply) |
| `expirationDate` | string (ISO 8601) | New expiration date |
| `receivedDate` | string (ISO 8601) | New received date |
| `status` | string | One of: `AVAILABLE`, `EXPIRED`, `DEPLETED`, `DISCARDED` |

> Note: The service controls whether `quantity` modifies `currentQuantity` or `initialQuantity`. Clients should rely on API responses for final values.

#### Request Example

```http
PATCH /api/vaccine-batches/660f9511-f39c-52e5-b827-557766551111
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 80,
  "status": "AVAILABLE",
  "expirationDate": "2026-04-01T00:00:00.000Z"
}
```

#### Success Response (200 OK)

```json
{
  "id": "660f9511-f39c-52e5-b827-557766551111",
  "vaccineId": "550e8400-e29b-41d4-a716-446655440000",
  "batchNumber": "L-2025-001",
  "initialQuantity": 100,
  "currentQuantity": 80,
  "expirationDate": "2026-04-01T00:00:00.000Z",
  "receivedDate": "2025-11-01T00:00:00.000Z",
  "status": "AVAILABLE",
  "updatedAt": "2025-11-17T09:30:00.000Z"
}
```

#### Error Responses

**400 Bad Request** — Validation errors
**401 Unauthorized**
**403 Forbidden**
**404 Not Found** — Batch not found

---

## Business Rules and Notes

- `batchNumber` is globally unique; duplicates return 409 Conflict.
- `initialQuantity` is set on creation from the DTO `quantity`; `currentQuantity` is initialized equal to `initialQuantity`.
- When `currentQuantity` reaches 0, the service typically sets `status` to `DEPLETED`.
- Expired batches (`expirationDate` in the past) may be marked `EXPIRED` by background jobs.
- Quantity updates should reflect in `Vaccine.totalStock` (service/store keeps consistency).

## Response Fields (VaccineBatch)

| Field | Type | Description |
|---|---:|---|
| `id` | string | Batch UUID |
| `vaccineId` | string | Associated vaccine ID |
| `batchNumber` | string | Batch identifier (unique) |
| `initialQuantity` | number | Quantity at receipt |
| `currentQuantity` | number | Currently available quantity |
| `expirationDate` | string (ISO 8601) | Expiration date |
| `receivedDate` | string (ISO 8601) | Received date |
| `status` | string | `AVAILABLE` \| `EXPIRED` \| `DEPLETED` \| `DISCARDED` |
| `createdById` | string | User who created the batch |
| `createdAt` | string (ISO 8601) | Creation timestamp |
| `updatedAt` | string (ISO 8601) | Update timestamp |

## Integration Notes

- When registering a vaccine application, select a batch with `status=AVAILABLE` and `currentQuantity > 0`.
- To list batches close to expiration, use the query params available on `/api/vaccines/:id/batches` (see Vaccine API docs).
- Consider concurrency/locking when decrementing `currentQuantity` to avoid overselling batches during high concurrency (e.g., use database transactions or row-level locks).

---

## Example: Frontend flow for selecting a batch

1. Fetch `/api/vaccines/:vaccineId/batches?status=AVAILABLE&minQuantity=1`
2. Filter client-side for expiration threshold if necessary
3. Reserve/consume the batch using the vaccination application endpoint (server will decrement `currentQuantity`)

---

_End of Vaccine Batch API documentation._
