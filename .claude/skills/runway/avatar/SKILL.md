---
name: runway/avatar
description: Runway Avatar SDK - React components for real-time AI avatar interactions
---

# Runway Avatar SDK Skills

React SDK for building real-time AI avatar experiences via WebRTC.

## Reference Documentation

| Topic | File |
|-------|------|
| Quick start | `references/getting-started.md` |
| Components | `references/components.md` |
| Hooks | `references/hooks.md` |
| Types | `references/types.md` |
| Server setup | `references/server-setup.md` |
| Styling | `references/styling.md` |
| Render props | `references/render-props.md` |
| Next.js | `references/nextjs.md` |
| Preset avatars | `references/preset-avatars.md` |
| Troubleshooting | `references/troubleshooting.md` |

## Key Patterns

**Component hierarchy:**
```
AvatarCall → AvatarSession → AvatarVideo/UserVideo/ControlBar
```

**Session states:** `idle` → `connecting` → `active` → `ending` → `ended` (or `error`)

**Hooks require context:** Must be inside `<AvatarCall>` or `<AvatarSession>`

## Workflows

### Future Workflows

- Project scaffolding (create new avatar app)
- Version migration guides (v1 → v2)
- Integration templates (Express, Remix, etc.)
