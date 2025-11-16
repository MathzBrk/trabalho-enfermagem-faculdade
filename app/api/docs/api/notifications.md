# Notification API Documentation

## Overview

The Notification API provides endpoints for managing user notifications in the system. All endpoints require authentication and users can only access their own notifications.

**Base Path**: `/api/notifications`

**Authentication**: All endpoints require a valid JWT token in the `Authorization` header.

---

## Endpoints

### 1. List Notifications

Retrieve a paginated list of notifications for the authenticated user with optional filters.

**Endpoint**: `GET /api/notifications`

**Authentication**: Required (JWT token)

**Authorization**: Users can only view their own notifications

#### Query Parameters

| Parameter | Type    | Required | Default | Description                                      |
|-----------|---------|----------|---------|--------------------------------------------------|
| `page`    | number  | No       | 1       | Page number (1-indexed, minimum: 1)             |
| `perPage` | number  | No       | 10      | Items per page (minimum: 1, maximum: 100)        |
| `isRead`  | boolean | No       | -       | Filter by read status (true/false)               |
| `type`    | string  | No       | -       | Filter by notification type (see valid types)    |

#### Valid Notification Types

- `SCHEDULING_CONFIRMED` - Vaccine scheduling has been confirmed
- `SCHEDULING_CANCELLED` - Vaccine scheduling has been cancelled
- `SCHEDULING_REMINDER` - Reminder about upcoming vaccine appointment
- `VACCINE_DOSE_DUE` - Next vaccine dose is due
- `SYSTEM_ANNOUNCEMENT` - General system announcements

#### Request Example

```http
GET /api/notifications?page=1&perPage=20&isRead=false&type=SCHEDULING_CONFIRMED
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Success Response (200 OK)

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "SCHEDULING_CONFIRMED",
      "title": "Vaccine Scheduled",
      "message": "Your vaccine has been scheduled for November 20, 2025 at 10:00 AM",
      "isRead": false,
      "readAt": null,
      "metadata": {
        "schedulingId": "660f9511-f39c-52e5-b827-557766551111"
      },
      "userId": "770g0622-g40d-63f6-c938-668877662222",
      "createdAt": "2025-11-15T14:30:00.000Z"
    },
    {
      "id": "661f9512-f39c-52e5-b827-557766551222",
      "type": "SCHEDULING_REMINDER",
      "title": "Upcoming Vaccine Appointment",
      "message": "Reminder: Your vaccine appointment is tomorrow at 10:00 AM",
      "isRead": false,
      "readAt": null,
      "metadata": {
        "schedulingId": "660f9511-f39c-52e5-b827-557766551111"
      },
      "userId": "770g0622-g40d-63f6-c938-668877662222",
      "createdAt": "2025-11-19T09:00:00.000Z"
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
      "message": "Page must be at least 1"
    }
  ]
}
```

---

### 2. Mark Notification as Read

Mark a specific notification as read. Sets `isRead` to `true` and updates the `readAt` timestamp.

**Endpoint**: `PATCH /api/notifications/:id/read`

**Authentication**: Required (JWT token)

**Authorization**: Users can only mark their own notifications as read

#### Path Parameters

| Parameter | Type   | Required | Description                   |
|-----------|--------|----------|-------------------------------|
| `id`      | string | Yes      | Notification ID (UUID format) |

#### Request Example

```http
PATCH /api/notifications/550e8400-e29b-41d4-a716-446655440000/read
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Success Response (200 OK)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "SCHEDULING_CONFIRMED",
  "title": "Vaccine Scheduled",
  "message": "Your vaccine has been scheduled for November 20, 2025 at 10:00 AM",
  "isRead": true,
  "readAt": "2025-11-16T15:45:30.000Z",
  "metadata": {
    "schedulingId": "660f9511-f39c-52e5-b827-557766551111"
  },
  "userId": "770g0622-g40d-63f6-c938-668877662222",
  "createdAt": "2025-11-15T14:30:00.000Z"
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

**403 Forbidden** - Notification doesn't belong to authenticated user
```json
{
  "error": "UnauthorizedNotificationAccessError",
  "message": "You can only mark your own notifications as read",
  "statusCode": 403
}
```

**404 Not Found** - Notification doesn't exist
```json
{
  "error": "NotificationNotFoundError",
  "message": "Notification not found",
  "statusCode": 404
}
```

**400 Bad Request** - Invalid notification ID format
```json
{
  "error": "ValidationError",
  "message": "Validation failed",
  "statusCode": 400,
  "details": [
    {
      "field": "id",
      "message": "Invalid notification ID format"
    }
  ]
}
```

---

### 3. Mark All Notifications as Read

Mark all notifications as read for the authenticated user. This is a bulk operation that updates all unread notifications.

**Endpoint**: `PATCH /api/notifications/read-all`

**Authentication**: Required (JWT token)

**Authorization**: Users can only mark their own notifications as read

#### Request Example

```http
PATCH /api/notifications/read-all
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Success Response (200 OK)

```json
{
  "count": 12
}
```

The `count` field indicates the number of notifications that were updated (marked as read).

#### Error Responses

**401 Unauthorized** - Missing or invalid authentication token
```json
{
  "error": "UnauthorizedError",
  "message": "Authentication token is required",
  "statusCode": 401
}
```

---

## Business Rules

### Authorization
- **User Isolation**: Users can only access their own notifications. All endpoints automatically filter notifications by the authenticated user's ID.
- **No Cross-User Access**: Attempting to access another user's notification (e.g., using their notification ID) will result in a 403 Forbidden error.

### Read Status
- **Idempotency**: Marking an already-read notification as read is safe and won't cause errors. The `readAt` timestamp will be updated to the latest request time.
- **Bulk Operation**: The "Mark All as Read" endpoint only affects unread notifications. Already-read notifications are not re-processed.

### Pagination
- **Performance**: Use pagination to avoid large data transfers. The default `perPage` is 10, maximum is 100.
- **Ordering**: Notifications are returned in reverse chronological order (newest first) by `createdAt` timestamp.

### Filtering
- **Combining Filters**: The `isRead` and `type` filters can be combined. For example, `?isRead=false&type=SCHEDULING_REMINDER` returns unread reminder notifications.
- **Type Validation**: Invalid notification types in the `type` filter will not cause errors; they will simply return no results.

---

## Integration Notes

### Frontend Integration

#### Notification Badge Counter
To display an unread notification count:
1. Call `GET /api/notifications?perPage=1&isRead=false`
2. Use the `pagination.total` field from the response

#### Real-time Updates (Future)
Currently, notifications are fetched via polling. Future versions may include WebSocket/Server-Sent Events (SSE) for real-time push notifications.

#### Recommended Polling Interval
- **Active Users**: Poll every 30-60 seconds
- **Background**: Poll every 2-5 minutes
- **Consider**: Implementing exponential backoff if the user is inactive

### Error Handling Best Practices

```typescript
// Example error handling
try {
  const response = await fetch('/api/notifications', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.status === 401) {
    // Token expired - redirect to login
    redirectToLogin();
  } else if (response.status === 400) {
    // Validation error - check request parameters
    const error = await response.json();
    console.error('Validation error:', error.details);
  } else if (!response.ok) {
    // Other errors
    throw new Error('Failed to fetch notifications');
  }

  const data = await response.json();
  // Process notifications...
} catch (error) {
  // Network error or other issues
  console.error('Network error:', error);
}
```

### Rate Limiting
- **Current**: No rate limiting is currently enforced
- **Future**: May implement rate limiting (e.g., 100 requests per minute per user)
- **Recommendation**: Implement client-side throttling/debouncing for user actions

---

## Notification Types Reference

### SCHEDULING_CONFIRMED
Sent when a vaccine scheduling is successfully created or confirmed.

**Metadata Structure**:
```json
{
  "schedulingId": "uuid",
  "vaccineId": "uuid",
  "scheduledDate": "2025-11-20T10:00:00.000Z"
}
```

### SCHEDULING_CANCELLED
Sent when a vaccine scheduling is cancelled (by user or system).

**Metadata Structure**:
```json
{
  "schedulingId": "uuid",
  "reason": "User requested cancellation"
}
```

### SCHEDULING_REMINDER
Sent as a reminder before a scheduled vaccine appointment.

**Metadata Structure**:
```json
{
  "schedulingId": "uuid",
  "scheduledDate": "2025-11-20T10:00:00.000Z",
  "hoursUntil": 24
}
```

### VACCINE_DOSE_DUE
Sent when the next dose of a multi-dose vaccine is due.

**Metadata Structure**:
```json
{
  "vaccineId": "uuid",
  "doseNumber": 2,
  "dueDate": "2025-12-01T00:00:00.000Z"
}
```

### SYSTEM_ANNOUNCEMENT
General system announcements and updates.

**Metadata Structure**:
```json
{
  "priority": "high" | "medium" | "low",
  "category": "maintenance" | "feature" | "alert"
}
```

---

## Response Field Descriptions

### Notification Object

| Field       | Type    | Description                                                    |
|-------------|---------|----------------------------------------------------------------|
| `id`        | string  | Unique identifier (UUID)                                       |
| `type`      | string  | Notification type (enum)                                       |
| `title`     | string  | Short notification title                                       |
| `message`   | string  | Full notification message                                      |
| `isRead`    | boolean | Whether the notification has been read                         |
| `readAt`    | string? | ISO 8601 timestamp when notification was read (null if unread) |
| `metadata`  | object  | Type-specific additional data                                  |
| `userId`    | string  | User who owns this notification                                |
| `createdAt` | string  | ISO 8601 timestamp when notification was created               |

### Pagination Object

| Field        | Type    | Description                                    |
|--------------|---------|------------------------------------------------|
| `page`       | number  | Current page number (1-indexed)                |
| `perPage`    | number  | Number of items per page                       |
| `total`      | number  | Total number of notifications matching filters |
| `totalPages` | number  | Total number of pages                          |
| `hasNext`    | boolean | Whether there are more pages after this one    |
| `hasPrev`    | boolean | Whether there are pages before this one        |

---

## Examples

### Example 1: Get All Unread Notifications

```bash
curl -X GET "http://localhost:3000/api/notifications?isRead=false" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example 2: Mark a Notification as Read

```bash
curl -X PATCH "http://localhost:3000/api/notifications/550e8400-e29b-41d4-a716-446655440000/read" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example 3: Mark All Notifications as Read

```bash
curl -X PATCH "http://localhost:3000/api/notifications/read-all" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example 4: Get Scheduling Reminders (Paginated)

```bash
curl -X GET "http://localhost:3000/api/notifications?type=SCHEDULING_REMINDER&page=1&perPage=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Troubleshooting

### Common Issues

**Issue**: Getting 401 Unauthorized errors
- **Solution**: Verify JWT token is valid and not expired. Token should be in the format `Bearer <token>`.

**Issue**: Getting 403 Forbidden when marking notification as read
- **Solution**: The notification doesn't belong to your user account. Verify you're using the correct notification ID.

**Issue**: Pagination returns fewer items than expected
- **Solution**: Check if filters (`isRead`, `type`) are applied. The `total` field shows the count after filters.

**Issue**: Empty `data` array with `total: 0`
- **Solution**: No notifications match your filters, or you have no notifications yet.

---

## Changelog

### Version 1.0.0 (2025-11-16)
- Initial release
- Added `GET /notifications` endpoint
- Added `PATCH /notifications/:id/read` endpoint
- Added `PATCH /notifications/read-all` endpoint
- Support for pagination and filtering
- Five notification types supported
