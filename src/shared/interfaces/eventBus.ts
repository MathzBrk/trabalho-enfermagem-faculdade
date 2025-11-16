/**
 * IEventBus - Event Bus Interface
 *
 * Provider-agnostic abstraction for event publishing and subscription.
 * Enables seamless migration from EventEmitter (MVP) → BullMQ (Production) → RabbitMQ (Scale)
 * without any changes to business logic or handlers.
 *
 * Design Philosophy:
 * - Generic methods that work with any event-driven system
 * - Type-safe event payloads using TypeScript generics
 * - No coupling to specific implementations (EventEmitter, Redis, AMQP)
 *
 * Evolution Path:
 * 1. MVP: NodeEventBus (EventEmitter) - in-memory, fast, simple
 * 2. Production: BullMQEventBus (Redis queue) - persistent, retry, scaling
 * 3. Scale: RabbitMQEventBus (AMQP) - distributed, complex routing
 *
 * @example
 * // Publishing an event
 * await eventBus.emit('vaccine.scheduled', {
 *   type: 'vaccine.scheduled',
 *   channels: ['in-app', 'email'],
 *   data: { userId: '123', vaccineName: 'COVID-19' }
 * });
 *
 * // Subscribing to an event
 * eventBus.on('vaccine.scheduled', async (payload) => {
 *   console.log('Vaccine scheduled:', payload.data);
 * });
 */
export interface IEventBus {
  /**
   * Emit an event with a typed data payload
   *
   * The generic type T represents the type of the event's data field,
   * enabling TypeScript autocomplete and type safety when building the payload.
   *
   * @template T - Type of the data field (e.g., VaccineScheduledEventData)
   * @param eventName - Name of the event (e.g., 'vaccine.scheduled')
   * @param payload - Complete NotificationEvent with typed data field
   * @returns Promise that resolves when emission is complete
   *
   * @example
   * // T = VaccineScheduledEventData
   * await eventBus.emit<VaccineScheduledEventData>('vaccine.scheduled', {
   *   type: 'vaccine.scheduled',
   *   channels: ['in-app'],
   *   data: {  // <- TypeScript knows this is VaccineScheduledEventData!
   *     schedulingId: '123',
   *     userId: '456',
   *     userName: 'João Silva',
   *     // ... autocomplete works here!
   *   },
   *   priority: 'normal'
   * });
   */
  emit<T = unknown>(eventName: string, payload: T): Promise<void>;

  /**
   * Subscribe to an event with a typed handler
   *
   * The generic type T represents the complete NotificationEvent type,
   * including the data field and all metadata.
   *
   * @template T - Type of the complete event (e.g., VaccineScheduledEvent)
   * @param eventName - Name of the event to listen for
   * @param handler - Async function that processes the event
   *
   * @example
   * // T = VaccineScheduledEvent (NotificationEvent<VaccineScheduledEventData>)
   * eventBus.on<VaccineScheduledEvent>('vaccine.scheduled', async (event) => {
   *   if (event.channels.includes('in-app')) {
   *     await createNotification(event.data);  // event.data is typed!
   *   }
   * });
   */
  on<T = unknown>(
    eventName: string,
    handler: (payload: T) => Promise<void>,
  ): void;

  /**
   * Unsubscribe from an event
   *
   * Removes a specific handler from an event. If the same handler was
   * registered multiple times, only one instance is removed.
   *
   * @param eventName - Name of the event to stop listening for
   * @param handler - Handler function to remove
   *
   * @example
   * const handler = async (event) => { ... };
   * eventBus.on('vaccine.scheduled', handler);
   * // Later...
   * eventBus.off('vaccine.scheduled', handler);
   */
  off<T = unknown>(
    eventName: string,
    handler: (payload: T) => Promise<void>,
  ): void;
}
