# Echo Memory

Sync OpenClaw markdown memories to EchoMem cloud using the new public ingestion job APIs.

## Commands

```bash
echo-memory sync --dir "$OPENCLAW_MEMORY_DIR" --process-mode deferred --run-jobs
echo-memory status --limit 50
echo-memory search --query "project kickoff" --k 10
echo-memory time-range --start "2026-01-01T00:00:00Z" --end "2026-03-01T00:00:00Z"
```

## Required environment

- `ECHOMEM_BASE_URL`
- `ECHOMEM_API_KEY`
- `OPENCLAW_MEMORY_DIR` (or pass `--dir`)

## Notes

- `sync` uses `POST /api/public/v1/ingestion/markdown`
- `--process-mode deferred` plus `--run-jobs` is recommended for large batches
- Use `--dry-run` to preview scanned markdown files