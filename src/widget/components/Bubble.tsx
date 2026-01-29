'use client';

/**
 * Bubble Component (The Orb)
 *
 * The floating orb shown when the widget is collapsed.
 * Features ambient glow, breathing ring, and dots that appear on hover.
 */

import { useWidgetContext } from '../WidgetProvider';

export function Bubble() {
  const { toggle } = useWidgetContext();

  return (
    <div
      className="widget-bubble-container"
      onClick={toggle}
      role="button"
      tabIndex={0}
      aria-label="Open avatar chat"
      onKeyDown={(e) => e.key === 'Enter' && toggle()}
    >
      {/* Ambient glow */}
      <div className="widget-bubble-glow" />

      {/* Breathing ring */}
      <div className="widget-bubble-ring" />

      {/* The orb */}
      <button type="button" className="widget-bubble">
        <OrbDots />
      </button>
    </div>
  );
}

function OrbDots() {
  // Two dots that appear on hover (like eyes/face hint)
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="widget-dot" cx="8" cy="12" r="2" />
      <circle className="widget-dot" cx="16" cy="12" r="2" />
    </svg>
  );
}
