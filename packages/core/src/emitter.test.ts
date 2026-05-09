import { describe, expect, it, mock } from 'bun:test';
import { Emitter } from './emitter';

type TestEvents = {
  count: [n: number];
  ready: [];
  data: [a: string, b: number];
};

class TestEmitter extends Emitter<TestEvents> {
  fire<K extends keyof TestEvents>(event: K, ...args: TestEvents[K]) {
    this.emit(event, ...args);
  }
}

describe('Emitter', () => {
  it('calls handlers registered with on()', () => {
    const ee = new TestEmitter();
    const handler = mock();
    ee.on('count', handler);
    ee.fire('count', 42);
    expect(handler).toHaveBeenCalledWith(42);
  });

  it('supports multiple handlers for the same event', () => {
    const ee = new TestEmitter();
    const a = mock();
    const b = mock();
    ee.on('count', a);
    ee.on('count', b);
    ee.fire('count', 1);
    expect(a).toHaveBeenCalledWith(1);
    expect(b).toHaveBeenCalledWith(1);
  });

  it('supports events with no arguments', () => {
    const ee = new TestEmitter();
    const handler = mock();
    ee.on('ready', handler);
    ee.fire('ready');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('supports events with multiple arguments', () => {
    const ee = new TestEmitter();
    const handler = mock();
    ee.on('data', handler);
    ee.fire('data', 'hello', 99);
    expect(handler).toHaveBeenCalledWith('hello', 99);
  });

  it('removes a handler with off()', () => {
    const ee = new TestEmitter();
    const handler = mock();
    ee.on('count', handler);
    ee.off('count', handler);
    ee.fire('count', 1);
    expect(handler).not.toHaveBeenCalled();
  });

  it('once() fires the handler exactly once', () => {
    const ee = new TestEmitter();
    const handler = mock();
    ee.once('count', handler);
    ee.fire('count', 1);
    ee.fire('count', 2);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(1);
  });

  it('removeAllListeners(event) clears handlers for one event', () => {
    const ee = new TestEmitter();
    const countHandler = mock();
    const readyHandler = mock();
    ee.on('count', countHandler);
    ee.on('ready', readyHandler);
    ee.removeAllListeners('count');
    ee.fire('count', 1);
    ee.fire('ready');
    expect(countHandler).not.toHaveBeenCalled();
    expect(readyHandler).toHaveBeenCalledTimes(1);
  });

  it('removeAllListeners() clears all handlers', () => {
    const ee = new TestEmitter();
    const countHandler = mock();
    const readyHandler = mock();
    ee.on('count', countHandler);
    ee.on('ready', readyHandler);
    ee.removeAllListeners();
    ee.fire('count', 1);
    ee.fire('ready');
    expect(countHandler).not.toHaveBeenCalled();
    expect(readyHandler).not.toHaveBeenCalled();
  });

  it('does not throw when emitting with no handlers', () => {
    const ee = new TestEmitter();
    expect(() => ee.fire('count', 1)).not.toThrow();
  });

  it('returns this from on/off/once for chaining', () => {
    const ee = new TestEmitter();
    const handler = mock();
    const result = ee.on('count', handler).off('count', handler).once('count', handler);
    expect(result).toBe(ee);
  });
});
