---
name: echo-memory
description: "Guide users through installing, configuring, using, and troubleshooting the EchoMemory Cloud OpenClaw Plugin. Use for plugin setup, API key onboarding, local mode vs cloud mode switching, local UI startup, gateway restart checks, localhost viewer issues, normal /echo-memory command usage, and natural-language routing to current EchoMemory plugin functions."
---

# EchoMemory Plugin

Use this skill when the user is setting up, using, or debugging the EchoMemory OpenClaw plugin.

Also use it for normal EchoMemory usage requests after setup, especially when the user asks in plain language instead of naming the exact command.

Prefer the plugin's current runtime behavior over old repo habits:

- the plugin starts the local UI during `openclaw gateway` startup
- `localUiAutoOpenOnGatewayStart` defaults to `true`
- browser auto-open is skipped automatically on headless, SSH, or CI sessions
- removing the API key from the local UI forces local-only mode for future loads

## Initial setup from zero

Use this flow when the user has not installed the plugin yet.

Official references:

- OpenClaw Marketplace: `https://openclawdir.com/plugins/echomemory-ArQh3g`
- NPM package: `https://www.npmjs.com/package/@echomem/echo-memory-cloud-openclaw-plugin`
- GitHub repo: `https://github.com/Atlas-Graph-Academy/EchoMemory-Cloud-OpenClaw-Plugin`

Recommended setup order:

1. Confirm the user already has OpenClaw installed and can run `openclaw`.
2. Install the plugin from a published source or local repo.
3. Create an EchoMemory account and API key.
4. Add the plugin config and set `tools.profile` to `"full"`.
5. Restart the gateway.
6. Verify the local UI and command surface.

### Install options

Published package install inside the OpenClaw home directory:

```powershell
cd $HOME\.openclaw
npm install @echomem/echo-memory-cloud-openclaw-plugin
```

Local repo install:

```powershell
openclaw plugins install "C:\Users\Your Name\Documents\GitHub\EchoMemory-Cloud-OpenClaw-Plugin"
```

Linked local repo install for active development:

```powershell
openclaw plugins install --link "C:\Users\Your Name\Documents\GitHub\EchoMemory-Cloud-OpenClaw-Plugin"
```

Important Windows pitfall:

- quote the plugin path if it contains spaces, or `openclaw plugins install` may parse the path incorrectly

### Account and API key

For first-time users:

1. Sign up at `https://iditor.com/signup/openclaw`.
2. Complete the 6-digit OTP email flow.
3. If prompted on first login, use referral code:

```text
openclawyay
```

4. Open `https://www.iditor.com/api`.
5. Create an API key that starts with `ec_`.
6. Recommended scopes: `ingest:write` and `memory:read`.

### Required host setup

In `~/.openclaw/openclaw.json`, set:

```json5
{
  "tools": {
    "profile": "full"
  }
}
```

The default `coding` profile is too restrictive for normal EchoMemory plugin usage.

### Valid first config

Use this as the baseline cloud-mode setup for a new install:

```json5
{
  "tools": {
    "profile": "full"
  },
  "plugins": {
    "entries": {
      "echo-memory-cloud-openclaw-plugin": {
        "enabled": true,
        "config": {
          "apiKey": "ec_your_key_here",
          "memoryDir": "C:\\Users\\your-user\\.openclaw\\workspace\\memory",
          "autoSync": false,
          "localOnlyMode": false,
          "localUiAutoOpenOnGatewayStart": true,
          "localUiAutoInstall": true,
          "syncIntervalMinutes": 15,
          "batchSize": 10,
          "requestTimeoutMs": 300000
        }
      }
    }
  }
}
```

Environment file alternative in `~/.openclaw/.env`:

```env
ECHOMEM_API_KEY=ec_your_key_here
ECHOMEM_MEMORY_DIR=C:\Users\your-user\.openclaw\workspace\memory
ECHOMEM_AUTO_SYNC=false
ECHOMEM_LOCAL_ONLY_MODE=false
ECHOMEM_LOCAL_UI_AUTO_OPEN_ON_GATEWAY_START=true
ECHOMEM_LOCAL_UI_AUTO_INSTALL=true
ECHOMEM_SYNC_INTERVAL_MINUTES=15
ECHOMEM_BATCH_SIZE=10
ECHOMEM_REQUEST_TIMEOUT_MS=300000
```

### First restart and verification

After install and config changes:

```powershell
openclaw gateway restart
```

Successful startup usually includes:

- plugin discovery succeeded
- local UI dependency install/build messages on first run if assets are missing
- `[echo-memory] Local workspace viewer: http://127.0.0.1:17823`

Recommended first smoke test order:

1. `/echo-memory whoami`
2. `/echo-memory status`
3. `/echo-memory sync`
4. `/echo-memory search <known memory topic>`

If the user is not ready for cloud setup yet, local-only mode is still valid. Read [`references/mode-switching.md`](./references/mode-switching.md).

## First checks

1. Confirm the plugin is installed or linked.

```powershell
openclaw plugins install "C:\path\to\EchoMemory-Cloud-OpenClaw-Plugin"
```

or

```powershell
openclaw plugins install --link "C:\path\to\EchoMemory-Cloud-OpenClaw-Plugin"
```

2. Confirm `tools.profile` is `"full"` in `~/.openclaw/openclaw.json`.
3. Confirm the plugin config entry exists at `plugins.entries.echo-memory-cloud-openclaw-plugin`.
4. Restart the gateway after install or config changes.

```powershell
openclaw gateway restart
```

## Mode switching

Use cloud mode when the user wants sync and retrieval from EchoMemory cloud:

- `localOnlyMode: false`
- `apiKey: "ec_..."`
- key scopes should include `ingest:write` and `memory:read`

Use local mode when the user only wants localhost browsing of markdown files:

- `localOnlyMode: true`
- API key can be blank
- the local UI should still be available

If the user wants to switch modes, read [`references/mode-switching.md`](./references/mode-switching.md).

## Local UI behavior

If the user asks to "view memories" and does not explicitly mention graph, public memories, or iditor.com, treat that as the local UI, not the cloud graph.

Successful gateway startup usually includes:

```text
[echo-memory] Local workspace viewer: http://127.0.0.1:17823
```

If the plugin is loaded but the user still cannot open the viewer:

1. confirm the gateway was restarted
2. confirm localhost port `17823` is listening
3. confirm `localUiAutoInstall` was not disabled before the first run
4. use the fallback script at [`scripts/start-local-ui.mjs`](./scripts/start-local-ui.mjs)

## Normal usage routing

Map normal-language requests to the current plugin surface instead of replying from generic memory or setup knowledge.

Use `echo_memory_onboard` or `/echo-memory onboard` when the user asks about:

- install or link steps
- marketplace, npm, or GitHub sources
- first-time setup from zero
- signup, OTP, referral code, API key creation
- configuration, troubleshooting, or how the plugin works
- the command list itself

Use `echo_memory_local_ui` or `/echo-memory view` when the user asks to:

- open, browse, launch, or get the URL for local memories
- view markdown memories on localhost
- open the workspace viewer or local UI

Use `echo_memory_search` or `/echo-memory search <query>` when the user asks:

- "what do you remember about ..."
- "search my memories for ..."
- "find my notes about ..."
- for prior facts, plans, dates, preferences, or decisions already stored in EchoMemory cloud

Use `echo_memory_status` or `/echo-memory status` when the user asks about:

- whether EchoMemory is working
- sync health, last sync, import progress, or recent imports

Use `echo_memory_sync` or `/echo-memory sync` when the user asks to:

- sync, refresh, import, upload, or push local markdown memories to the cloud

Use `/echo-memory whoami` when the user wants to verify:

- the current EchoMemory identity
- the token type
- the active scopes on the current API key

Use `echo_memory_graph_link` or graph commands when the user asks for:

- the memory graph
- the cloud graph or graph view
- an iditor.com memory page
- the public memories page

Choose the graph target carefully:

- private graph: `echo_memory_graph_link` with `visibility: private` or `/echo-memory graph`
- public memories page: `echo_memory_graph_link` with `visibility: public` or `/echo-memory graph public`

Use `/echo-memory help` when the user explicitly asks for the command list.

## Working flow

1. Install or link the plugin.
2. Set `tools.profile` to `"full"`.
3. Set plugin config or `~/.openclaw/.env`.
4. Restart `openclaw gateway`.
5. Verify the localhost viewer URL appears in gateway logs.
6. For cloud mode, run:

```text
/echo-memory whoami
/echo-memory status
/echo-memory sync
/echo-memory search <known topic>
```

If the user is already set up and wants a quick usage reference, read [`references/normal-usage.md`](./references/normal-usage.md).

## Configuration examples

Cloud mode:

```json5
{
  "plugins": {
    "entries": {
      "echo-memory-cloud-openclaw-plugin": {
        "enabled": true,
        "config": {
          "apiKey": "ec_your_key_here",
          "localOnlyMode": false,
          "memoryDir": "C:\\Users\\your-user\\.openclaw\\workspace\\memory",
          "localUiAutoOpenOnGatewayStart": true,
          "localUiAutoInstall": true
        }
      }
    }
  }
}
```

Local mode:

```json5
{
  "plugins": {
    "entries": {
      "echo-memory-cloud-openclaw-plugin": {
        "enabled": true,
        "config": {
          "localOnlyMode": true,
          "memoryDir": "C:\\Users\\your-user\\.openclaw\\workspace\\memory",
          "localUiAutoOpenOnGatewayStart": true,
          "localUiAutoInstall": true
        }
      }
    }
  }
}
```

## References

- [`references/initial-setup.md`](./references/initial-setup.md): zero-to-working install path, account creation, config, and first verification checks
- [`references/normal-usage.md`](./references/normal-usage.md): current commands, plain-language trigger mapping, and when to use local UI versus graph
- [`references/mode-switching.md`](./references/mode-switching.md): exact local/cloud toggles, config precedence, and restart rules
- [`references/troubleshooting.md`](./references/troubleshooting.md): failure patterns for plugin discovery, local UI startup, auth, and sync
- [`scripts/start-local-ui.mjs`](./scripts/start-local-ui.mjs): manual fallback to launch the local UI when the gateway cannot start it
