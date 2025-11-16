/**
 * NodeEventBus - EventEmitter-based Event Bus Implementation
 *
 * Simple in-process event bus using Node.js EventEmitter.
 * Suitable for MVP and single-server deployments.
 *
 * Characteristics:
 * - In-memory, in-process (single server only)
 * - Synchronous event handling (handlers run sequentially)
 * - No persistence (events lost on restart)
 * - No retry mechanism
 * - Low latency (microseconds)
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

@injectable()
export class NodeEventBus implements IEventBus {
  private readonly emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
    // Increase max listeners to avoid memory leak warnings
    // (we may have multiple handlers per event type)
    this.emitter.setMaxListeners(100);
  }

  async emit<T = unknown>(eventName: string, payload: T): Promise<void> {
    try {
      // Emit the event to all registered handlers
      // EventEmitter.emit is synchronous, but we wrap it in Promise.resolve
      // to maintain async interface consistency
      this.emitter.emit(eventName, payload);
    } catch (error) {
      // Log error but don't throw - we don't want event emission to crash the app
      console.error(
        `[NodeEventBus] Error emitting event '${eventName}':`,
        error,
      );
      // In production, you might want to use a proper logger here
      // logger.error('[NodeEventBus] Event emission failed', { eventName, error });
    }
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

    this.emitter.on(eventName, wrappedHandler);
  }

  off<T = unknown>(
    eventName: string,
    handler: (payload: T) => Promise<void>,
  ): void {
    // Remove the specific handler for this event
    this.emitter.off(eventName, handler);
  }
}
