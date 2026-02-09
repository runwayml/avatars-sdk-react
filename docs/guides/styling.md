# Styling

## Default Styles

Import the optional stylesheet for a polished look:

```tsx
import '@runwayml/avatars-react/styles.css';
```

## CSS Custom Properties

Customize the default styles with CSS variables:

```css
:root {
  --avatar-bg: #a78bfa;           /* Video background color */
  --avatar-radius: 16px;          /* Container border radius */
  --avatar-control-size: 48px;    /* Control button size */
  --avatar-end-call-bg: #ef4444;  /* End call button color */
}
```

### Example: Dark Theme

```css
:root {
  --avatar-bg: #1a1a2e;
  --avatar-radius: 8px;
  --avatar-control-size: 56px;
  --avatar-end-call-bg: #dc2626;
}
```

---

## Data Attributes

All components expose data attributes for CSS targeting.

### AvatarCall

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-avatar-call` | `""` | Always present |
| `data-avatar-id` | Avatar ID | The requested avatar |

> **Note:** `AvatarCall` suspends during credential fetching — use `<Suspense>` for Phase 1 loading. See [Loading States](./loading-states.md).

### AvatarVideo

| Attribute | Values |
|-----------|--------|
| `data-avatar-video` | `""` |
| `data-status` | `"connecting"`, `"waiting"`, `"ready"` |

```css
[data-avatar-video][data-status="connecting"],
[data-avatar-video][data-status="waiting"] {
  background: linear-gradient(45deg, #333, #555);
  animation: pulse 1.5s infinite;
}
```

### UserVideo

| Attribute | Values |
|-----------|--------|
| `data-user-video` | `""` |
| `data-has-video` | `"true"`, `"false"` |
| `data-camera-enabled` | `"true"`, `"false"` |

```css
[data-user-video][data-camera-enabled="false"] {
  background: #333;
}
```

### ControlBar

| Attribute | Values |
|-----------|--------|
| `data-control-bar` | `""` |

```css
[data-control-bar] {
  display: flex;
  gap: 12px;
  justify-content: center;
}
```

---

## Background Image

Use `avatarImageUrl` prop to set a CSS variable for background images:

```tsx
<AvatarCall
  avatarId="game-host"
  connectUrl="/api/avatar/connect"
  avatarImageUrl="/avatars/game-host.png"
/>
```

The image is available via `--avatar-image` CSS variable:

```css
[data-avatar-call] {
  background-image: var(--avatar-image);
  background-size: cover;
  background-position: center;
}
```

---

## Custom Class Names

All components accept `className` prop:

```tsx
<AvatarCall
  avatarId="game-host"
  connectUrl="/api/avatar/connect"
  className="my-avatar-container"
>
  <AvatarVideo className="main-video" />
  <UserVideo className="pip-video" />
  <ControlBar className="bottom-controls" />
</AvatarCall>
```

```css
.my-avatar-container {
  width: 100%;
  max-width: 800px;
  aspect-ratio: 16/9;
  border-radius: 12px;
  overflow: hidden;
}

.main-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pip-video {
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 120px;
  border-radius: 8px;
}

.bottom-controls {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
}
```

---

## Inline Styles

Components also accept `style` prop:

```tsx
<AvatarVideo
  style={{
    width: '100%',
    height: 'auto',
    borderRadius: '12px',
  }}
/>
```

---

## Responsive Design

```css
/* Mobile */
[data-avatar-call] {
  width: 100%;
  aspect-ratio: 9/16;
}

/* Desktop */
@media (min-width: 768px) {
  [data-avatar-call] {
    aspect-ratio: 16/9;
    max-width: 800px;
  }
}
```

---

## Animation Examples

### Loading State

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

[data-avatar-video][data-status="connecting"]::before,
[data-avatar-video][data-status="waiting"]::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255,255,255,0.1),
    transparent
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

---

## Tailwind CSS

Works with Tailwind's arbitrary selectors:

```tsx
<AvatarCall
  avatarId="game-host"
  connectUrl="/api/avatar/connect"
  className="w-full max-w-3xl rounded-xl overflow-hidden"
>
  <AvatarVideo className="w-full h-full data-[status=connecting]:animate-pulse data-[status=waiting]:animate-pulse" />
  <ControlBar />
</AvatarCall>
```
