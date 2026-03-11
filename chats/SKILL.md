# Echo Chat

Memory-powered chat helpers backed by EchoMem retrieval/context endpoints.

## Commands

```bash
echo-chat search --query "what did I say about roadmap"
echo-chat context --context-id "<context-uuid>"
echo-chat time-range --start "2026-02-01T00:00:00Z" --end "2026-03-01T00:00:00Z"
```

## Required environment

- `ECHOMEM_BASE_URL`
- `ECHOMEM_API_KEY`

## Notes

- `search` uses semantic retrieval (`/api/extension/memories/search`)
- `context` fetches message history (`/api/extension/contexts/{id}/messages`)
- `time-range` returns chronological memory slices