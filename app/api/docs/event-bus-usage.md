# Event Bus Usage Guide

## Overview

The Event Bus uses a **fire-and-forget** pattern that never blocks the caller. All handler execution happens asynchronously in the background using `Promise.allSettled()` to track successes and failures.

## How It Works

```typescript
// Example: Emitting vaccine scheduled event
await eventBus.emit<VaccineScheduledEvent>(
  EventNames.VACCINE_SCHEDULED,
  {
    type: EventNames.VACCINE_SCHEDULED,
    channels: ['in-app'],
    data: {
      schedulingId: scheduling.id,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userRole: 'patient',
      vaccineId: vaccine.id,
      vaccineName: vaccine.name,
      scheduledDate: scheduling.scheduledDate,
      doseNumber: scheduling.doseNumber,
    },
    priority: 'normal',
  }
);

// Returns IMMEDIATELY - handlers execute in background ✅
console.log('Event emitted! (handlers running in background)');
```

## Background Execution & Monitoring

The Event Bus **internally** uses `Promise.allSettled()` to:
- Execute all handlers in parallel
- Track which handlers succeeded and which failed
- Log failures automatically for debugging
- Never crash the application due to handler errors

Example logs you'll see:

```
✅ Success:
[NodeEventBus] Event 'vaccine.scheduled' completed: 2 succeeded, 0 failed

❌ Failures:
[NodeEventBus] Event 'vaccine.scheduled' had 1 handler failure(s):
  - Handler 'InAppVaccineScheduledHandler' failed: Error: Database connection lost
```

## Handler Isolation

Each handler is wrapped in an error boundary:
- One handler failure **does not** affect others
- Failed handlers are logged but don't throw
- The emit() call **never throws** due to handler errors

```typescript
// Even if some handlers fail, this code continues normally
await eventBus.emit(EventNames.VACCINE_SCHEDULED, payload);
await otherService.doSomething(); // ✅ Always executes
```

## Use Cases

### Perfect For:
- User notifications (in-app, email, SMS)
- Logging and analytics events
- Triggering background jobs
- Updating caches
- Sending webhooks
- All async side effects that shouldn't block the main flow

## Type Safety

The Event Bus is fully typed. TypeScript will provide autocomplete for event data:

```typescript
// Type parameter tells TypeScript what the event payload looks like
await eventBus.emit<VaccineScheduledEvent>(
  EventNames.VACCINE_SCHEDULED,
  {
    type: EventNames.VACCINE_SCHEDULED,
    channels: ['in-app'],
    data: {
      // TypeScript knows all these fields and provides autocomplete!
      schedulingId: '...',
      userId: '...',
      userName: '...',
      // ...
    },
    priority: 'normal',
  }
);
```

## Future: Dead Letter Queue & Retry

The current implementation logs all failures. In the future, you can extend `executeHandlersInBackground()` to:

```typescript
// Inside NodeEventBus.executeHandlersInBackground()
if (failed.length > 0) {
  // Send to dead letter queue for retry (similar to SQS)
  await this.sendToDeadLetterQueue(eventName, payload, failed);

  // Emit monitoring event
  await this.emit('handler.failures', {
    eventName,
    failures: failed.map(f => ({
      handler: f.handler.name,
      error: f.reason,
      timestamp: new Date()
    }))
  });
}
```

This pattern allows you to:
- Retry failed handlers automatically
- Send alerts when critical handlers fail
- Track failure rates in monitoring systems
- Build a self-healing event system

## Migration to BullMQ

When you're ready to scale, you can migrate to BullMQ without changing your service code:

1. Create `BullMQEventBus.ts` implementing `IEventBus`
2. Update DI container to use `BullMQEventBus` instead of `NodeEventBus`
3. All existing service code continues to work without changes!

The `emit()` signature remains the same:
- Still fire-and-forget from caller's perspective
- BullMQ handles queuing, retries, and worker distribution
- Same Promise.allSettled pattern for tracking results
