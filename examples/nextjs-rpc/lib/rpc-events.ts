import { EventEmitter } from 'events';

export interface RpcEvent {
  tool: string;
  args: Record<string, unknown>;
  result: unknown;
  durationMs: number;
  time: string;
}

const emitter = new EventEmitter();
emitter.setMaxListeners(20);

export function emitRpcEvent(event: RpcEvent) {
  emitter.emit('rpc', event);
}

export function onRpcEvent(listener: (event: RpcEvent) => void): () => void {
  emitter.on('rpc', listener);
  return () => emitter.off('rpc', listener);
}
