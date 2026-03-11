# Echo Community

Discover and draft communities from social memory surfaces without exposing internal create/persist pipelines.

## Usage

```bash
echo-community discover --topic <text> --user-id <uuid> [--limit <n>]
echo-community create --name <text> --seed-user-id <uuid> [--topic <text>] [--limit <n>]
echo-community insights --group-id <text> [--map-type category|description]
```

## First-pass behavior

- `discover` returns topic resonance candidates via friends-prior search.
- `create` returns a draft community object and member candidates (non-persistent in OSS runtime).
- `insights` returns convergence stats from memory-map APIs.
- Group persistence and invite flows are intentionally out of OSS boundary.