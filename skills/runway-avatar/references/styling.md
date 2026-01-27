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

## Data Attributes

All components expose data attributes for CSS targeting.

### AvatarCall

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-avatar-call` | `""` | Always present |
| `data-state` | `"connecting"`, `"connected"`, `"error"` | Connection state |
| `data-avatar-id` | Avatar ID | The requested avatar |
| `data-error` | Error message | Present when state is error |

```css
[data-avatar-call][data-state="connecting"] {
  opacity: 0.7;
}

[data-avatar-call][data-state="error"] {
  border: 2px solid red;
}
```

### AvatarVideo

| Attribute | Values |
|-----------|--------|
| `data-avatar-video` | `""` |
| `data-has-video` | `"true"`, `"false"` |
| `data-connecting` | `"true"`, `"false"` |
| `data-speaking` | `"true"`, `"false"` |

```css
[data-avatar-video][data-speaking="true"] {
  box-shadow: 0 0 0 3px #22c55e;
}
```

### UserVideo

| Attribute | Values |
|-----------|--------|
| `data-user-video` | `""` |
| `data-has-video` | `"true"`, `"false"` |
| `data-camera-enabled` | `"true"`, `"false"` |

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

## Tailwind CSS

Works with Tailwind's arbitrary selectors:

```tsx
<AvatarCall
  avatarId="game-host"
  connectUrl="/api/avatar/connect"
  className="w-full max-w-3xl rounded-xl overflow-hidden
             data-[state=connecting]:opacity-50
             data-[state=error]:border-2 data-[state=error]:border-red-500"
/>
```

## Animation Examples

### Speaking Indicator

```css
@keyframes speaking-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
}

[data-avatar-video][data-speaking="true"] {
  animation: speaking-pulse 1s infinite;
}
```

### Loading State

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

[data-avatar-video][data-connecting="true"]::before {
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
