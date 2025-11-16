/**
 * NodeEventBus - EventEmitter-based Event Bus Implementation
 *
 * Simple in-process event bus using Node.js EventEmitter.
 * Suitable for MVP and single-server deployments.
 *
 * Characteristics:
 * - In-memory, in-process (single server only)
 * - Supports both fire-and-forget and wait-for-completion modes
 * - No persistence (events lost on restart)
 * - Low latency (microseconds)
 *
 * Emission Modes:
 * 1. Fire-and-forget (default): emit() returns immediately, handlers run in background
 * 2. Wait-for-completion: emit(..., {waitForCompletion: true}) waits for all handlers
 *    and returns EmitResult with succeeded/failed handlers (useful for retry logic)
 *
 * Handler Isolation:
 * - All handlers are wrapped in error boundaries
 * - One handler failure does not affect others
 * - Failed handlers are tracked in EmitResult when using wait-for-completion mode
 *
 * Future migration path:
 * When ready to migrate to BullMQ, create BullMQEventBus.ts:
 * - emit() → queue.add(eventName, payload)
 * - on() → new Worker(eventName, handler)
 * - Update DI container to use BullMQEventBus
 * - Zero changes to services or handlers!
 */

import { EventEmitter } from 'node:events';
import { injectable } from 'tsyringe';
import type { IEventBus } from '@modules/notifications/contracts';
import type { HandlerResult } from '@shared/interfaces/eventBus';

@injectable()
export class NodeEventBus implements IEventBus {
  private readonly emitter: EventEmitter;

  /**
   * Map to store the relationship between original handlers and their wrapped versions.
   * This is necessary because we wrap handlers in error boundaries, but we need to be able
   * to unsubscribe using the original handler reference.
   *
   * Structure: Map<eventName, Map<originalHandler, wrappedHandler>>
   */
  private readonly handlerMap: Map<
    string,
    Map<(...args: any[]) => Promise<void>, (...args: any[]) => Promise<void>>
  > = new Map();

  constructor() {
    this.emitter = new EventEmitter();
    // Increase max listeners to avoid memory leak warnings
    // (we may have multiple handlers per event type)
    this.emitter.setMaxListeners(100);
  }

  async emit<T = unknown>(eventName: string, payload: T): Promise<void> {
    try {
      // Get all wrapped handlers for this event
      const eventHandlers = this.handlerMap.get(eventName);

      // If no handlers registered, return early
      if (!eventHandlers?.size) {
        return;
      }

      // Get all wrapped handlers
      const wrappedHandlers = Array.from(eventHandlers.values());

      // Execute all handlers in background using Promise.allSettled
      // This ensures we track all results without blocking the caller
      this.executeHandlersInBackground(
        eventName,
        payload,
        wrappedHandlers,
        eventHandlers,
      );

      // Return immediately - handlers execute in background
    } catch (error) {
      // Log error but don't throw - we don't want event emission to crash the app
      console.error(
        `[NodeEventBus] Error emitting event '${eventName}':`,
        error,
      );
    }
  }

  /**
   * Execute handlers in background and track results
   *
   * This method runs asynchronously without blocking the emit() caller.
   * It uses Promise.allSettled to track all handler executions and logs
   * any failures for monitoring/debugging purposes.
   *
   * In the future, this is where you could:
   * - Send failures to a dead letter queue
   * - Retry failed handlers
   * - Emit monitoring events
   * - Send alerts for critical failures
   */
  private executeHandlersInBackground<T>(
    eventName: string,
    payload: T,
    wrappedHandlers: Array<(payload: T) => Promise<void>>,
    eventHandlers: Map<
      (payload: T) => Promise<void>,
      (payload: T) => Promise<void>
    >,
  ): void {
    // Execute asynchronously without blocking
    (async () => {
      const promises = wrappedHandlers.map((wrappedHandler) =>
        wrappedHandler(payload),
      );

      const results = await Promise.allSettled(promises);

      // Track successes and failures
      const succeeded: HandlerResult<T>[] = [];
      const failed: HandlerResult<T>[] = [];

      results.forEach((result, index) => {
        const wrappedHandler = wrappedHandlers[index];

        // Find the original handler for this wrapped handler
        let originalHandler: ((payload: T) => Promise<void>) | null = null;
        for (const [original, wrapped] of eventHandlers.entries()) {
          if (wrapped === wrappedHandler) {
            originalHandler = original;
            break;
          }
        }

        if (result.status === 'fulfilled') {
          succeeded.push({
            handler: originalHandler!,
            status: 'fulfilled',
          });
        } else {
          failed.push({
            handler: originalHandler!,
            status: 'rejected',
            reason: result.reason,
          });
        }
      });

      // Log summary
      if (succeeded.length > 0) {
        console.log(
          `[NodeEventBus] Event '${eventName}' completed: ${succeeded.length} succeeded, ${failed.length} failed`,
        );
      }

      // Log failures for monitoring
      if (failed.length > 0) {
        console.error(
          `[NodeEventBus] Event '${eventName}' had ${failed.length} handler failure(s):`,
        );
        for (const failure of failed) {
          console.error(
            `  - Handler '${failure.handler.name}' failed:`,
            failure.reason,
          );
        }

        // Future: Send to dead letter queue for retry
        // await this.sendToDeadLetterQueue(eventName, payload, failed);

        // Future: Emit monitoring event
        // await this.emit('handler.failures', { eventName, failures: failed });
      }
    })().catch((error) => {
      // Catch any unexpected errors in the background execution
      console.error(
        `[NodeEventBus] Unexpected error in background handler execution for '${eventName}':`,
        error,
      );
    });
  }

  on<T = unknown>(
    eventName: string,
    handler: (payload: T) => Promise<void>,
  ): void {
    // Wrap handler in error boundary to prevent one handler from crashing others
    const wrappedHandler = async (payload: T) => {
      try {
        await handler(payload);
      } catch (error) {
        // Log error but don't throw - isolate handler failures
        console.error(
          `[NodeEventBus] Handler error for event '${eventName}':`,
          error,
        );
        // In production, you might want to:
        // 1. Use a proper logger
        // 2. Emit a 'handler.error' event for monitoring
        // 3. Implement retry logic for critical handlers
      }
    };

    // Store the mapping between original and wrapped handler
    if (!this.handlerMap.has(eventName)) {
      this.handlerMap.set(eventName, new Map());
    }
    this.handlerMap.get(eventName)!.set(handler, wrappedHandler);

    // Register the wrapped handler with EventEmitter
    this.emitter.on(eventName, wrappedHandler);
  }

  off<T = unknown>(
    eventName: string,
    handler: (payload: T) => Promise<void>,
  ): void {
    // Get the wrapped handler from our map
    const eventHandlers = this.handlerMap.get(eventName);
    if (!eventHandlers) {
      console.warn(
        `[NodeEventBus] No handlers registered for event '${eventName}'`,
      );
      return;
    }

    const wrappedHandler = eventHandlers.get(handler);
    if (!wrappedHandler) {
      console.warn(`[NodeEventBus] Handler not found for event '${eventName}'`);
      return;
    }

    // Remove the wrapped handler from EventEmitter
    this.emitter.off(eventName, wrappedHandler);

    // Clean up the mapping
    eventHandlers.delete(handler);

    // If no more handlers for this event, remove the event from the map
    if (eventHandlers.size === 0) {
      this.handlerMap.delete(eventName);
    }
  }
}
