/**
 * Widget Styles
 *
 * CSS styles as a string constant for injection into Shadow DOM.
 * Inspired by the "orb" design - ambient glow, portrait avatar, floating controls.
 */

export const widgetStyles = `
/* CSS Custom Properties */
:host {
  /* Color palette - emerald theme */
  --widget-bg: #0a0a0a;
  --widget-text: #ffffff;
  --widget-text-secondary: rgba(255, 255, 255, 0.6);
  --widget-text-dark: #334155;
  --widget-border: rgba(255, 255, 255, 0.1);
  --widget-error: #ff4444;

  /* Emerald accent */
  --widget-emerald-light: #6ee7a0;
  --widget-emerald: #34d475;
  --widget-emerald-dark: #22a55b;
  --widget-emerald-glow: rgba(52, 212, 117, 0.3);

  /* Sizing */
  --widget-bubble-size: 56px;
  --widget-avatar-width: 256px;
  --widget-avatar-height: 384px;

  /* Animation */
  --widget-transition: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --widget-transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);

  /* Position */
  --widget-offset: 24px;
}

/* Base reset for shadow DOM */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Widget root */
.widget-root {
  position: fixed;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--widget-text);
  pointer-events: auto;
  z-index: var(--widget-z-index, 2147483646);
}

/* Position variants */
.widget-root[data-position='bottom-right'] {
  bottom: var(--widget-offset);
  right: var(--widget-offset);
}

.widget-root[data-position='bottom-left'] {
  bottom: var(--widget-offset);
  left: var(--widget-offset);
}

.widget-root[data-position='top-right'] {
  top: var(--widget-offset);
  right: var(--widget-offset);
}

.widget-root[data-position='top-left'] {
  top: var(--widget-offset);
  left: var(--widget-offset);
}

/* ==================== */
/* THE ORB (collapsed)  */
/* ==================== */

.widget-bubble-container {
  position: relative;
  cursor: pointer;
}

/* Ambient glow behind orb */
.widget-bubble-glow {
  position: absolute;
  inset: 0;
  background: var(--widget-emerald-glow);
  border-radius: 50%;
  filter: blur(16px);
  transition: all 700ms ease;
  transform: scale(1.1);
  opacity: 0.5;
}

.widget-bubble-container:hover .widget-bubble-glow {
  transform: scale(1.5);
  opacity: 0.8;
}

/* The orb itself */
.widget-bubble {
  position: relative;
  width: var(--widget-bubble-size);
  height: var(--widget-bubble-size);
  border-radius: 50%;
  background: linear-gradient(135deg, var(--widget-emerald-light) 0%, var(--widget-emerald-dark) 100%);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--widget-transition-slow);
  overflow: hidden;
}

.widget-bubble-container:hover .widget-bubble {
  background: linear-gradient(135deg, #a7f3c9 0%, var(--widget-emerald) 100%);
  transform: scale(1.1);
}

.widget-bubble:active {
  transform: scale(0.95);
}

/* Inner highlight on orb */
.widget-bubble::before {
  content: '';
  position: absolute;
  top: 8px;
  left: 8px;
  width: 16px;
  height: 16px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  filter: blur(4px);
}

/* Dots container - hidden by default, shown on hover */
.widget-bubble svg {
  width: 24px;
  height: 24px;
  opacity: 0;
  transition: opacity 300ms ease;
}

.widget-bubble-container:hover .widget-bubble svg {
  opacity: 1;
}

/* The dots themselves */
.widget-dot {
  fill: rgba(6, 78, 59, 0.6);
}

/* Breathing ring animation */
.widget-bubble-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid var(--widget-emerald);
  opacity: 0.3;
  animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  0% {
    transform: scale(1);
    opacity: 0.3;
  }
  75%, 100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

/* ========================= */
/* FLOATING AVATAR (expanded) */
/* ========================= */

.widget-floating-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  animation: float-in var(--widget-transition-slow) ease-out;
}

@keyframes float-in {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Glow behind avatar */
.widget-avatar-glow {
  position: absolute;
  inset: -20px;
  background: var(--widget-emerald-glow);
  filter: blur(32px);
  border-radius: 24px;
  opacity: 0.4;
  z-index: -1;
}

/* Main avatar container - vertical portrait */
.widget-avatar-window {
  position: relative;
  width: var(--widget-avatar-width);
  height: var(--widget-avatar-height);
  border-radius: 24px;
  overflow: hidden;
  background: linear-gradient(to bottom, #065f46 0%, #022c22 100%);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

/* Subtle inner border */
.widget-avatar-window::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  pointer-events: none;
}

/* Video element fills the window */
.widget-avatar-window video,
.widget-avatar-window > div,
.widget-avatar-window [data-lk-participant-tile],
.widget-avatar-window [data-lk-video-track] {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
}

/* Speech bubble overlay */
.widget-speech-bubble {
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 16px;
  padding: 12px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.widget-speech-text {
  color: var(--widget-text-dark);
  font-size: 14px;
  line-height: 1.5;
}

/* Minimal controls - floating below */
.widget-controls-floating {
  display: flex;
  gap: 8px;
}

.widget-control-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  transition: all var(--widget-transition);
}

.widget-control-btn:hover {
  color: #334155;
  transform: scale(1.05);
}

.widget-control-btn:active {
  transform: scale(0.95);
}

.widget-control-btn svg {
  width: 20px;
  height: 20px;
}

.widget-control-btn[data-muted='true'] {
  background: rgba(239, 68, 68, 0.2);
  color: #dc2626;
}

/* ==================== */
/* CONNECTING STATE     */
/* ==================== */

.widget-avatar-connecting {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: linear-gradient(to bottom, #065f46 0%, #022c22 100%);
}

.widget-spinner {
  width: 48px;
  height: 48px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: var(--widget-emerald-light);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.widget-connection-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-weight: 400;
}

/* ==================== */
/* ERROR STATE          */
/* ==================== */

.widget-avatar-error {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: linear-gradient(to bottom, #065f46 0%, #022c22 100%);
  padding: 24px;
  text-align: center;
}

.widget-error-icon {
  width: 32px;
  height: 32px;
  color: var(--widget-error);
  opacity: 0.8;
}

.widget-error-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.widget-retry-btn {
  margin-top: 8px;
  padding: 10px 24px;
  border-radius: 20px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: var(--widget-text);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--widget-transition);
}

.widget-retry-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.widget-retry-btn:active {
  transform: scale(0.98);
}
`;
