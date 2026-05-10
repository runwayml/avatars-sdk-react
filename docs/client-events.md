# Client Events

> **Compatibility:** Client events (tool calling) are supported on avatars that use a **preset voice**. Custom voice avatars do not currently support client events.

Avatars can trigger UI events via tool calls sent over the data channel. Define tools with a [Standard Schema](https://standardschema.dev/) (Zod, Valibot, ArkType, etc.), pass them when creating a session, and subscribe on the client.

## Defining Tools

```ts
// lib/tools.ts — shared between server and client
import { clientTool, type ClientEventsFrom } from '@runwayml/avatars/api';
import { z } from 'zod';

export const showCaption = clientTool('show_caption', {
  description: 'Display a caption overlay',
  schema: z.object({ text: z.string() }),
});

export const tools = [showCaption];
export type MyEvent = ClientEventsFrom<typeof tools>;
```

## Server — Pass Tools When Creating the Session

```ts
const { id } = await client.realtimeSessions.create({
  model: 'gwm1_avatars',
  avatar: { type: 'custom', avatarId: '...' },
  tools,
});
```

## Client — Subscribe to Events

### React

```tsx
import { useClientEvent } from '@runwayml/avatars-react';
import { showCaption } from '@/lib/tools';

function CaptionOverlay() {
  const caption = useClientEvent(showCaption);
  return caption ? <p>{caption.text}</p> : null;
}
```

### Vanilla JS

```ts
const session = await streamTo({ credentials, target: videoEl });

session.onClientEvent(showCaption, (args) => {
  document.getElementById('caption').textContent = args.text;
});
```

## Runtime Validation

Passing a tool definition with a schema to `useClientEvent()` or `onClientEvent()` validates incoming args at runtime — malformed events are dropped instead of crashing your UI.

Without runtime validation (type-only):

```ts
export const showCaption = clientTool('show_caption', {
  description: 'Display a caption overlay',
  args: {} as { text: string },
});
```

## Page Actions

Pre-built tools for DOM interactions:

```ts
import { pageActionTools } from '@runwayml/avatars/api';

// Pass to session creation
tools: [...pageActionTools, ...myTools],
```

```tsx
// React — drop in the component
<PageActions highlightDuration={3000} />
```

Available actions: `click`, `scroll_to`, `highlight`. Elements are targeted by `id` or `data-avatar-target` attribute.
