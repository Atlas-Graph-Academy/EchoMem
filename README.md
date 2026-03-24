# EchoMemory Skill Repo

This repo contains a single publishable skill for the released EchoMemory OpenClaw plugin.

On OpenClaw `2026.3.22+`, users can install the published skill through native `openclaw skills` flows. On older hosts, keep using the existing ClawHub/manual install path.

The skill intentionally guides plugin installs through exact local paths, `--link`, or the exact scoped npm package. It does not rely on bare plugin names, because newer OpenClaw versions changed plugin source precedence.

Publish the skill from [`echo-memory/`](./echo-memory):

```bash
clawhub publish ./echo-memory --slug echo-memory --name "Echo Memory"
```

The skill is built to guide users through plugin install, local mode versus cloud mode switching, gateway-start local UI checks, and manual recovery when the local UI does not come up automatically.
