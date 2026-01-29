'use client';

/**
 * FloatingAvatar Component
 *
 * Vertical portrait avatar window with floating controls below.
 * Inspired by the "orb" mockup design.
 */

import { useWidgetContext } from '../WidgetProvider';
import { AvatarSession } from '../../components/AvatarSession';
import { FloatingAvatarContent } from './FloatingAvatarContent';

export function FloatingAvatar() {
  const { state, close, endSession, setConnectionState, startSession } = useWidgetContext();

  const handleSessionEnd = () => {
    endSession();
  };

  const handleSessionError = () => {
    setConnectionState('error');
  };

  const handleRetry = () => {
    startSession();
  };

  return (
    <div className="widget-floating-avatar">
      {/* Glow behind avatar */}
      <div className="widget-avatar-glow" />

      {/* Main avatar window - vertical portrait */}
      <div className="widget-avatar-window">
        {/* Connecting state */}
        {state.connectionState === 'connecting' && !state.credentials && (
          <div className="widget-avatar-connecting">
            <div className="widget-spinner" />
            <span className="widget-connection-text">Connecting...</span>
          </div>
        )}

        {/* Error state */}
        {state.connectionState === 'error' && (
          <div className="widget-avatar-error">
            <ErrorIcon />
            <span className="widget-error-text">Connection failed</span>
            <button type="button" className="widget-retry-btn" onClick={handleRetry}>
              Retry
            </button>
          </div>
        )}

        {/* Active session */}
        {state.credentials && state.connectionState !== 'error' && (
          <AvatarSession
            credentials={state.credentials}
            video={false}
            onEnd={handleSessionEnd}
            onError={handleSessionError}
          >
            <FloatingAvatarContent />
          </AvatarSession>
        )}
      </div>

      {/* Floating controls below */}
      <div className="widget-controls-floating">
        <button
          type="button"
          className="widget-control-btn"
          onClick={close}
          aria-label="Close"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg className="widget-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="10" strokeWidth={2} />
      <path strokeLinecap="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
    </svg>
  );
}
