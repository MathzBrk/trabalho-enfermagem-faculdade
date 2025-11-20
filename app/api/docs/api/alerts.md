# Alerts API Documentation

## Overview

The Alerts API provides real-time inventory monitoring and alerting functionality for managers. This endpoint aggregates critical alerts about vaccine stock levels and batch expiration dates to enable proactive inventory management.

**Base Path**: `/api/alerts`

**Authentication**: All endpoints require a valid JWT token in the `Authorization` header.

**Authorization**: Only users with the `MANAGER` role can access alerts.

---

## Alert Types

The system monitors three types of critical inventory conditions:

### 1. LOW_STOCK
Vaccines where the current stock level has fallen below the configured minimum stock threshold.

**Business Rule**: `currentStock < minimumStock`

**Purpose**: Enables managers to reorder vaccines before running out completely.

### 2. EXPIRED_BATCH
Vaccine batches that have already passed their expiration date.

**Business Rule**: `expirationDate < current date`

**Purpose**: Identifies batches that must be removed from inventory and disposed of according to regulations.

### 3. NEARING_EXPIRATION_BATCH
Vaccine batches that will expire within the next 30 days.

**Business Rule**: `0 < (expirationDate - current date) <= 30 days`

**Purpose**: Allows managers to prioritize usage of soon-to-expire batches and minimize waste.

---

## Endpoints

### 1. Get All Alerts

Retrieve all current alerts for the authenticated manager. This endpoint performs real-time calculations and returns alerts grouped by type.

**Endpoint**: `GET /api/alerts`

**Authentication**: Required (JWT token)

**Authorization**: Only `MANAGER` role can access this endpoint

**Module**: Alerts Service

#### Query Parameters

This endpoint does not accept any query parameters. The userId is automatically extracted from the authenticated user's JWT token.

#### Request Example

```http
GET /api/alerts
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Success Response (200 OK)

The response is an array of alert objects. Each alert object contains:
- `alertType`: The type of alert (LOW_STOCK, EXPIRED_BATCH, or NEARING_EXPIRATION_BATCH)
- `objects`: An array of the affected vaccines or batches

**Response Structure**:

```json
[
  {
    "alertType": "LOW_STOCK",
    "objects": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "BCG",
        "manufacturer": "Fundação Ataulpho de Paiva",
        "diseasesPrevented": ["Tuberculose"],
        "currentStock": 5,
        "minimumStock": 10,
        "description": "Vacina BCG contra tuberculose",
        "ageGroup": "Recém-nascidos",
        "dosesRequired": 1,
        "intervalBetweenDoses": null,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-11-15T10:30:00.000Z"
      },
      {
        "id": "661f9512-f39c-52e5-b827-557766551111",
        "name": "Hepatite B",
        "manufacturer": "Instituto Butantan",
        "diseasesPrevented": ["Hepatite B"],
        "currentStock": 3,
        "minimumStock": 15,
        "description": "Vacina contra hepatite B",
        "ageGroup": "Todas as idades",
        "dosesRequired": 3,
        "intervalBetweenDoses": 30,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-11-18T14:20:00.000Z"
      }
    ]
  },
  {
    "alertType": "EXPIRED_BATCH",
    "objects": [
      {
        "id": "770g0622-g40d-63f6-c938-668877662222",
        "batchNumber": "BATCH-2024-001",
        "expirationDate": "2025-10-15T00:00:00.000Z",
        "quantity": 50,
        "vaccineId": "550e8400-e29b-41d4-a716-446655440000",
        "createdAt": "2024-01-15T00:00:00.000Z",
        "updatedAt": "2024-01-15T00:00:00.000Z"
      }
    ]
  },
  {
    "alertType": "NEARING_EXPIRATION_BATCH",
    "objects": [
      {
        "id": "881h1733-h51e-74g7-d049-779988773333",
        "batchNumber": "BATCH-2025-042",
        "expirationDate": "2025-12-10T00:00:00.000Z",
        "quantity": 100,
        "vaccineId": "661f9512-f39c-52e5-b827-557766551111",
        "createdAt": "2025-02-10T00:00:00.000Z",
        "updatedAt": "2025-02-10T00:00:00.000Z"
      },
      {
        "id": "992i2844-i62f-85h8-e150-880099884444",
        "batchNumber": "BATCH-2025-055",
        "expirationDate": "2025-12-20T00:00:00.000Z",
        "quantity": 75,
        "vaccineId": "550e8400-e29b-41d4-a716-446655440000",
        "createdAt": "2025-03-01T00:00:00.000Z",
        "updatedAt": "2025-03-01T00:00:00.000Z"
      }
    ]
  }
]
```

**Response Field Descriptions**:

**Alert Object**:
- `alertType` (string): Type of alert - `LOW_STOCK`, `EXPIRED_BATCH`, or `NEARING_EXPIRATION_BATCH`
- `objects` (array): Array of affected vaccines (for LOW_STOCK) or vaccine batches (for expiration alerts)

**Vaccine Object Fields** (for LOW_STOCK alerts):
- `id` (string): Unique identifier for the vaccine (UUID)
- `name` (string): Name of the vaccine
- `manufacturer` (string): Manufacturer name
- `diseasesPrevented` (array): List of diseases this vaccine prevents
- `currentStock` (number): Current stock level (below minimumStock)
- `minimumStock` (number): Configured minimum stock threshold
- `description` (string): Detailed description of the vaccine
- `ageGroup` (string): Target age group for this vaccine
- `dosesRequired` (number): Number of doses required for full immunization
- `intervalBetweenDoses` (number|null): Days between doses (null if single dose)
- `createdAt` (ISO 8601 datetime): Record creation timestamp
- `updatedAt` (ISO 8601 datetime): Last update timestamp

**Vaccine Batch Object Fields** (for EXPIRED_BATCH and NEARING_EXPIRATION_BATCH alerts):
- `id` (string): Unique identifier for the batch (UUID)
- `batchNumber` (string): Batch number/identifier from manufacturer
- `expirationDate` (ISO 8601 datetime): Expiration date of the batch
- `quantity` (number): Number of doses in this batch
- `vaccineId` (string): Reference to the vaccine this batch belongs to (UUID)
- `createdAt` (ISO 8601 datetime): Record creation timestamp
- `updatedAt` (ISO 8601 datetime): Last update timestamp

#### Error Responses

**401 Unauthorized** - Missing or invalid authentication token

```json
{
  "error": "UnauthorizedError",
  "message": "Authentication token is required",
  "statusCode": 401
}
```

**403 Forbidden** - User is not a MANAGER

```json
{
  "error": "ForbiddenError",
  "message": "Access denied. Only managers can view alerts.",
  "statusCode": 403
}
```

**500 Internal Server Error** - Server error during alert calculation

```json
{
  "error": "InternalServerError",
  "message": "An error occurred while fetching alerts",
  "statusCode": 500
}
```

---

## Edge Cases and Constraints

### Business Rules

1. **Real-time Calculation**: Alerts are calculated on-demand when the endpoint is called. There is no caching to ensure data accuracy.

2. **Empty Alert Types**: If there are no alerts of a particular type, that alert type will still be included in the response with an empty `objects` array.

3. **Manager-Only Access**: Only users with the `MANAGER` role can access alerts. This is enforced at the service layer using role-based validation.

4. **Date Calculations**:
   - Expired batches: Any batch where `expirationDate < current date`
   - Nearing expiration: Any batch where the expiration date is between 1 and 30 days in the future

5. **Stock Comparison**: Low stock alerts are triggered when `currentStock < minimumStock` (strict less than, not less than or equal to).

### Edge Cases

1. **No Alerts**: If there are no alerts of any type, the endpoint returns an empty array `[]`.

2. **Multiple Alert Types**: A single response can contain multiple alert types simultaneously (e.g., both low stock alerts and expiration alerts).

3. **Same Vaccine Multiple Batches**: The same vaccine can appear in both EXPIRED_BATCH and NEARING_EXPIRATION_BATCH alerts if it has multiple batches in different states.

4. **Timezone Handling**: All dates are stored and returned in UTC. The expiration date comparison is done using the current UTC date/time.

### Constraints

- **Performance**: Alert calculation involves multiple database queries (vaccines, batches). Response time may increase with large inventories.

- **No Pagination**: This endpoint does not support pagination. All current alerts are returned in a single response.

- **No Filtering**: This endpoint does not support filtering by alert type. All alert types are always included in the response.

- **Read-Only**: This endpoint is read-only. It does not modify any data or mark alerts as acknowledged.

---

## Integration Notes for Frontend Developers

### Display Recommendations

1. **Alert Priority**: Consider displaying alerts in this priority order:
   - EXPIRED_BATCH (highest priority - immediate action required)
   - LOW_STOCK (high priority - order needed)
   - NEARING_EXPIRATION_BATCH (medium priority - plan usage)

2. **Visual Indicators**:
   - EXPIRED_BATCH: Red/critical indicator
   - LOW_STOCK: Orange/warning indicator
   - NEARING_EXPIRATION_BATCH: Yellow/info indicator

3. **Empty States**: Handle the case where `objects` is an empty array for a specific alert type.

### Polling and Real-time Updates

- **Recommended Polling Interval**: Poll this endpoint every 5-10 minutes for dashboard updates.

- **On-Demand Refresh**: Provide a manual refresh button for managers to get the latest alerts immediately.

- **Cache Invalidation**: If your frontend caches this data, invalidate the cache after:
  - Vaccine stock updates
  - Vaccine batch creation/updates
  - Vaccine application recording

### Error Handling

```javascript
// Example error handling
try {
  const response = await fetch('/api/alerts', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.status === 401) {
    // Redirect to login
    redirectToLogin();
  } else if (response.status === 403) {
    // Show "access denied" message
    showError('You do not have permission to view alerts');
  } else if (response.ok) {
    const alerts = await response.json();
    displayAlerts(alerts);
  }
} catch (error) {
  // Handle network errors
  showError('Failed to load alerts. Please try again.');
}
```

### TypeScript Interface

```typescript
type AlertType = 'LOW_STOCK' | 'EXPIRED_BATCH' | 'NEARING_EXPIRATION_BATCH';

interface Vaccine {
  id: string;
  name: string;
  manufacturer: string;
  diseasesPrevented: string[];
  currentStock: number;
  minimumStock: number;
  description: string;
  ageGroup: string;
  dosesRequired: number;
  intervalBetweenDoses: number | null;
  createdAt: string;
  updatedAt: string;
}

interface VaccineBatch {
  id: string;
  batchNumber: string;
  expirationDate: string;
  quantity: number;
  vaccineId: string;
  createdAt: string;
  updatedAt: string;
}

type AlertPayload =
  | { alertType: 'LOW_STOCK'; objects: Vaccine[] }
  | { alertType: 'EXPIRED_BATCH'; objects: VaccineBatch[] }
  | { alertType: 'NEARING_EXPIRATION_BATCH'; objects: VaccineBatch[] };

type AlertsResponse = AlertPayload[];
```

---

## Use Cases

### Dashboard Alert Widget

Display a summary of all current alerts on the manager dashboard:

```
Alerts Summary:
- 2 vaccines with low stock
- 1 expired batch (requires immediate attention)
- 3 batches expiring soon (within 30 days)
```

### Email Digest Notifications

The alerts data can be used to generate daily or weekly email digests for managers summarizing inventory issues.

### Proactive Inventory Management

Managers can use this endpoint to:
- Plan vaccine reordering based on low stock alerts
- Prioritize usage of batches nearing expiration
- Identify and remove expired batches from inventory

### Compliance and Audit

The alerts system helps maintain compliance by:
- Preventing use of expired vaccines
- Ensuring adequate stock levels for scheduled vaccinations
- Providing data for inventory audit trails

---

## Related Endpoints

- **Vaccines API**: `/api/vaccines` - Manage vaccine records and stock levels
- **Vaccine Batches API**: `/api/vaccine-batches` - Manage vaccine batches and expiration dates
- **Notifications API**: `/api/notifications` - Managers receive in-app notifications when new alerts are detected (via background jobs)

---

## Implementation Notes

### Service Architecture

The alerts endpoint delegates to `AlertsService.getAllAlertsForManager()` which:
1. Validates the requesting user has MANAGER role
2. Fetches vaccines with low stock using `getVaccinesWithLowStock()` helper
3. Fetches all vaccine batches
4. Filters expired batches (expirationDate < current date)
5. Filters batches nearing expiration (0-30 days until expiration)
6. Constructs and returns the alert payload array

### Background Job Integration

The system also has a background job (`LowStockCheckJob`) that runs periodically to:
- Check for new low stock conditions
- Check for newly expired batches
- Check for batches that have entered the 30-day expiration window
- Send in-app notifications to managers via the event bus

This ensures managers are proactively notified of new alerts rather than having to constantly poll this endpoint.
