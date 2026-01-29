/**
 * Imperative API Utilities
 *
 * Manages global state for imperative widget control.
 */

import type { WidgetUIState } from '../types';

// Global state for imperative API - updated by Widget component
let widgetUIState: WidgetUIState = 'collapsed';
let setWidgetUIState: ((state: WidgetUIState) => void) | null = null;

/**
 * Register widget state setters for imperative control
 * Called from Widget component
 */
export function registerWidgetControls(
  state: WidgetUIState,
  setState: (state: WidgetUIState) => void
): void {
  widgetUIState = state;
  setWidgetUIState = setState;
}

/**
 * Unregister widget controls
 * Called when widget is destroyed
 */
export function unregisterWidgetControls(): void {
  setWidgetUIState = null;
}

/**
 * Get current UI state
 */
export function getUIState(): WidgetUIState {
  return widgetUIState;
}

/**
 * Set UI state imperatively
 */
export function setUIState(state: WidgetUIState): void {
  setWidgetUIState?.(state);
}
