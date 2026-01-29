/**
 * Widget Types
 *
 * TypeScript types for the embeddable avatar widget.
 */

import type { SessionCredentials } from '../types';

/**
 * Widget position on the page
 */
export type WidgetPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

/**
 * Widget theme
 */
export type WidgetTheme = 'light' | 'dark';

/**
 * Widget UI state
 */
export type WidgetUIState = 'collapsed' | 'expanded';

/**
 * Widget connection state
 */
export type WidgetConnectionState = 'idle' | 'connecting' | 'active' | 'error';

/**
 * Configuration options for the widget
 */
export interface WidgetConfig {
  /** Pre-created session ID (alternative to apiKey + avatarId) */
  sessionId?: string;

  /** API key for client-side session creation */
  apiKey?: string;

  /** Avatar ID for custom avatars */
  avatarId?: string;

  /** Preset ID for Runway preset avatars (e.g., 'cleo') */
  presetId?: string;

  /** Avatar image URL for the launcher bubble */
  avatarImage?: string;

  /** Session duration in seconds (10-300, default: 120) */
  duration?: number;

  /** Server endpoint URL for creating sessions (avoids CORS issues) */
  serverUrl?: string;

  /** Widget position on the page */
  position?: WidgetPosition;

  /** Color theme */
  theme?: WidgetTheme;

  /** Custom accent color (CSS color value) */
  accentColor?: string;

  /** Custom z-index for the widget */
  zIndex?: number;

  /** Start with expanded view */
  startExpanded?: boolean;

  /** Callback when widget is ready */
  onReady?: () => void;

  /** Callback when an error occurs */
  onError?: (error: Error) => void;

  /** Callback when session ends */
  onEnd?: () => void;

  /** Base URL for Runway API (defaults to production) */
  baseUrl?: string;
}

/**
 * Widget instance returned from init()
 */
export interface WidgetInstance {
  /** Open the widget (expand from bubble) */
  open(): void;

  /** Close the widget (collapse to bubble) */
  close(): void;

  /** Toggle between open and closed */
  toggle(): void;

  /** Destroy the widget and clean up */
  destroy(): void;
}

/**
 * Internal widget state
 */
export interface WidgetState {
  /** Current UI state (collapsed/expanded) */
  uiState: WidgetUIState;

  /** Current connection state */
  connectionState: WidgetConnectionState;

  /** Session credentials once available */
  credentials: SessionCredentials | null;

  /** Current error, if any */
  error: Error | null;
}

/**
 * Widget context value
 */
export interface WidgetContextValue {
  /** Widget configuration */
  config: Required<Pick<WidgetConfig, 'position' | 'theme' | 'zIndex'>> &
    Omit<WidgetConfig, 'position' | 'theme' | 'zIndex'>;

  /** Current widget state */
  state: WidgetState;

  /** Open the widget */
  open: () => void;

  /** Close the widget */
  close: () => void;

  /** Toggle the widget */
  toggle: () => void;

  /** Start a session */
  startSession: () => Promise<void>;

  /** End the current session */
  endSession: () => Promise<void>;

  /** Set error state */
  setError: (error: Error | null) => void;

  /** Set connection state */
  setConnectionState: (state: WidgetConnectionState) => void;
}

/**
 * Global RunwayCharacters API
 */
export interface RunwayCharactersAPI {
  /** Initialize the widget */
  init(config: WidgetConfig): WidgetInstance;

  /** Destroy the current widget instance */
  destroy(): void;

  /** SDK version */
  version: string;
}

declare global {
  interface Window {
    RunwayCharacters: RunwayCharactersAPI;
  }
}
