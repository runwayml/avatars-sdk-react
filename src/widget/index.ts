/**
 * RunwayCharacters Widget
 *
 * Embeddable widget entry point that exposes the global RunwayCharacters API.
 *
 * @example
 * ```html
 * <script src="https://cdn.runwayml.com/avatars.js"></script>
 * <script>
 *   RunwayCharacters.init({
 *     avatarId: 'avatar_abc123',
 *     apiKey: 'your-api-key',
 *     position: 'bottom-right'
 *   });
 * </script>
 * ```
 */

import { createRoot, type Root } from 'react-dom/client';
import { createElement } from 'react';
import { Widget } from './Widget';
import { createShadowContainer, removeShadowContainer, injectStyles } from './utils/shadowDom';
import { widgetStyles } from './styles/widgetStyles';
import { getUIState, setUIState, unregisterWidgetControls } from './utils/imperativeApi';
import type { WidgetConfig, WidgetInstance, RunwayCharactersAPI } from './types';

const VERSION = '0.1.0';

let currentInstance: WidgetInstanceImpl | null = null;

/**
 * Internal widget instance implementation
 */
class WidgetInstanceImpl implements WidgetInstance {
  private root: Root | null = null;
  private config: WidgetConfig;

  constructor(config: WidgetConfig) {
    this.config = config;
    this.mount();
  }

  private mount(): void {
    // Create shadow DOM container
    const { container, shadowRoot } = createShadowContainer();

    // Inject styles into shadow root
    injectStyles(shadowRoot, widgetStyles);

    // Set theme attribute on shadow host for CSS :host selector
    if (this.config.theme) {
      container.setAttribute('data-theme', this.config.theme);
    }

    // Create mount point inside shadow root
    const mountPoint = document.createElement('div');
    shadowRoot.appendChild(mountPoint);

    // Create React root and render widget
    this.root = createRoot(mountPoint);

    // Create widget element
    const widgetElement = createElement(Widget, {
      config: {
        ...this.config,
        onReady: () => {
          this.config.onReady?.();
        },
      },
    });

    this.root.render(widgetElement);
  }

  open(): void {
    setUIState('expanded');
  }

  close(): void {
    setUIState('collapsed');
  }

  toggle(): void {
    setUIState(getUIState() === 'collapsed' ? 'expanded' : 'collapsed');
  }

  destroy(): void {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
    removeShadowContainer();
    unregisterWidgetControls();
    currentInstance = null;
  }
}

/**
 * Initialize the RunwayCharacters widget
 */
function init(config: WidgetConfig): WidgetInstance {
  // Validate config
  if (!config.sessionId && !config.apiKey && !config.serverUrl) {
    throw new Error('RunwayCharacters.init requires sessionId, apiKey, or serverUrl');
  }

  if ((config.apiKey || config.serverUrl) && !config.avatarId && !config.presetId) {
    throw new Error('RunwayCharacters.init requires either avatarId or presetId');
  }

  // Destroy existing instance if any
  if (currentInstance) {
    currentInstance.destroy();
  }

  // Create new instance
  currentInstance = new WidgetInstanceImpl(config);
  return currentInstance;
}

/**
 * Destroy the current widget instance
 */
function destroy(): void {
  if (currentInstance) {
    currentInstance.destroy();
    currentInstance = null;
  }
}

// Export the global API
const RunwayCharacters: RunwayCharactersAPI = {
  init,
  destroy,
  version: VERSION,
};

// Expose on window for IIFE build
if (typeof window !== 'undefined') {
  window.RunwayCharacters = RunwayCharacters;
}

export { RunwayCharacters, init, destroy, VERSION as version };
export type { WidgetConfig, WidgetInstance } from './types';
