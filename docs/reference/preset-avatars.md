# Preset Avatars

Runway provides ready-to-use avatar presets for common use cases.

## Available Presets

| Avatar ID | Description | Use Case |
|-----------|-------------|----------|
| `game-host` | Enthusiastic game show host personality | Gaming, entertainment, trivia |
| `coding-teacher` | Patient technical instructor | Programming tutorials, code reviews |
| `language-tutor` | Multilingual language teacher | Language learning, conversation practice |
| `trivia-host` | Quiz master personality | Trivia games, educational quizzes |
| `customer-service` | Professional support representative | Customer support, help desk |

## Usage

```tsx
<AvatarCall
  avatarId="game-host"
  connectUrl="/api/avatar/connect"
/>
```

## Listing Avatars

Check the [Runway Developer Portal](https://dev.runwayml.com/) for:
- Complete list of available presets
- Avatar preview images
- Personality descriptions
- Custom avatar creation

---

## Avatar Selection by Use Case

### Entertainment & Gaming

```tsx
// Trivia and quiz games
<AvatarCall avatarId="trivia-host" ... />

// General gaming
<AvatarCall avatarId="game-host" ... />
```

### Education

```tsx
// Programming tutorials
<AvatarCall avatarId="coding-teacher" ... />

// Language learning
<AvatarCall avatarId="language-tutor" ... />
```

### Business

```tsx
// Customer support
<AvatarCall avatarId="customer-service" ... />
```

---

## Avatar Placeholder Images

Use `avatarImageUrl` to show a preview during connection:

```tsx
<AvatarCall
  avatarId="game-host"
  connectUrl="/api/avatar/connect"
  avatarImageUrl="/avatars/game-host-preview.png"
/>
```

---

## Custom Avatars

For custom avatars beyond presets, see the [Runway Developer Portal](https://dev.runwayml.com/) for creating and managing custom avatar models.

Custom avatars use a different configuration:

```typescript
// Server-side session creation
const created = await client.post('/v1/realtime_sessions', {
  body: {
    model: 'gwm1_avatars',
    avatar: {
      type: 'custom',
      customId: 'your-custom-avatar-id',
    },
  },
});
```

---

## Best Practices

1. **Match avatar to use case** - Choose an avatar personality that fits your application's purpose

2. **Test before production** - Try different avatars to find the best fit for your users

3. **Provide fallback UI** - Handle cases where avatar connection is slow or fails

4. **Consider branding** - Custom avatars can better represent your brand than presets
