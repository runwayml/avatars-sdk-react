/**
 * Tiny typed event emitter. No Node.js polyfills, no dependencies.
 *
 * @example
 * ```ts
 * type Events = { count: [number]; ready: [] };
 * const ee = new Emitter<Events>();
 * ee.on('count', (n) => console.log(n));
 * ee.emit('count', 42);
 * ```
 */
export type EventMap = Record<string, Array<unknown>>;

type Handler<Args extends Array<unknown>> = (...args: Args) => void;

export class Emitter<E extends EventMap> {
  private listeners = new Map<keyof E, Set<Handler<Array<unknown>>>>();

  on<K extends keyof E>(event: K, handler: Handler<E[K]>): this {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(handler as Handler<Array<unknown>>);
    return this;
  }

  once<K extends keyof E>(event: K, handler: Handler<E[K]>): this {
    const wrapper = ((...args: E[K]) => {
      this.off(event, wrapper);
      handler(...args);
    }) as Handler<E[K]>;
    return this.on(event, wrapper);
  }

  off<K extends keyof E>(event: K, handler: Handler<E[K]>): this {
    this.listeners.get(event)?.delete(handler as Handler<Array<unknown>>);
    return this;
  }

  protected emit<K extends keyof E>(event: K, ...args: E[K]): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const handler of set) {
      try {
        handler(...args);
      } catch (err) {
        console.error(`[@runwayml/avatars] Error in ${String(event)} handler:`, err);
      }
    }
  }

  removeAllListeners(event?: keyof E): this {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
    return this;
  }
}
