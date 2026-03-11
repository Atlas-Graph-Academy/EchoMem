# Echo Page

Generate privacy-aware personal page payloads from memory/profile data in a testable OSS-safe workflow.

## Usage

```bash
echo-page generate --user-id <uuid> [--output <file>]
echo-page customize --user-id <uuid> [--layout timeline|cards] [--visibility public|friends|private] [--output <file>]
echo-page publish --user-id <uuid> [--slug <slug>]
```

## First-pass behavior

- `generate` builds a sanitized page JSON payload from profile + memory summaries.
- `customize` emits customization metadata for downstream renderers.
- `publish` returns a preview publication payload only.
- Direct publish/storage endpoints are intentionally not exposed in OSS runtime.