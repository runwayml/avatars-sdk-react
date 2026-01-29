/**
 * Shadow DOM Utilities
 *
 * Utilities for mounting the widget in a Shadow DOM for CSS isolation.
 */

const WIDGET_CONTAINER_ID = 'runway-avatar-widget-container';

/**
 * Creates a container element with Shadow DOM for the widget
 */
export function createShadowContainer(): {
  container: HTMLDivElement;
  shadowRoot: ShadowRoot;
} {
  // Remove existing container if present
  const existing = document.getElementById(WIDGET_CONTAINER_ID);
  if (existing) {
    existing.remove();
  }

  // Create container element
  const container = document.createElement('div');
  container.id = WIDGET_CONTAINER_ID;

  // Ensure container doesn't affect page layout
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    overflow: visible;
    pointer-events: none;
    z-index: 2147483647;
  `;

  // Attach shadow root
  const shadowRoot = container.attachShadow({ mode: 'open' });

  // Append to body
  document.body.appendChild(container);

  return { container, shadowRoot };
}

/**
 * Removes the widget container from the DOM
 */
export function removeShadowContainer(): void {
  const container = document.getElementById(WIDGET_CONTAINER_ID);
  if (container) {
    container.remove();
  }
}

/**
 * Injects styles into the shadow root
 */
export function injectStyles(shadowRoot: ShadowRoot, css: string): void {
  const style = document.createElement('style');
  style.textContent = css;
  shadowRoot.appendChild(style);
}
