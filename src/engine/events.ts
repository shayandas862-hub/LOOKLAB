// In-process event bus. The HTTP layer streams it to the UI as server-sent events.
export type EngineEvent =
  | { type: 'action'; action: string; via: string; ok: boolean; stand_in: boolean }
  | { type: 'settings' }
  | { type: 'hello'; version: string };

type Listener = (e: EngineEvent) => void;

export class EventBus {
  private listeners = new Set<Listener>();

  on(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  emit(e: EngineEvent): void {
    for (const fn of this.listeners) {
      try {
        fn(e);
      } catch {
        // A broken listener (a closed stream) must not stop the action that emitted.
      }
    }
  }

  get size(): number {
    return this.listeners.size;
  }
}
