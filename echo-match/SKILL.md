# Echo Match

Find resonant people using existing social memory endpoints, with sanitized outputs and no internal pipeline exposure.

## Usage

```bash
echo-match find --user-id <uuid> --query <text> [--limit <n>]
echo-match compare --id-a <uuid> --id-b <uuid>
echo-match explain --match-id <memory-id>
```

## First-pass behavior

- `find` uses friends-prior memory search to return candidate resonance memories.
- `compare` computes overlap summaries (emotion/category) from both users' feeds.
- `explain` resolves a match candidate via similar-memory evidence for a memory id.
- Responses are DTO-sanitized for OSS safety.