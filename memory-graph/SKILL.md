# Memory Graph

Use EchoMem graph and narrative APIs to explore memory structure and story context.

## Commands

```bash
memory-graph render --page 1 --page-size 220 --include-details
memory-graph narrative-context --memory-id "<memory-uuid>"
memory-graph narrative-text --input ./examples/narrative-memories.json
```

## Required environment

- `ECHOMEM_BASE_URL`
- `ECHOMEM_API_KEY`

## Notes

- `render` calls `/api/extension/memories/graph-data`
- `narrative-context` calls `/api/extension/memories/narrative-context`
- `narrative-text` calls `/api/extension/memories/narrative-text`