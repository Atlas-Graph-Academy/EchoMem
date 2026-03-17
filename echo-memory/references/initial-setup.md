# EchoMemory Initial Setup

Use this reference when the user has not installed the plugin yet.

## Official plugin links

- OpenClaw Marketplace: `https://openclawdir.com/plugins/echomemory-ArQh3g`
- NPM package: `https://www.npmjs.com/package/@echomem/echo-memory-cloud-openclaw-plugin`
- GitHub repo: `https://github.com/Atlas-Graph-Academy/EchoMemory-Cloud-OpenClaw-Plugin`

## What the plugin does

- syncs local markdown memories into EchoMemory cloud
- exposes `/echo-memory` commands for status, sync, search, graph, onboarding, and identity checks
- starts a local localhost workspace UI during gateway startup
- makes EchoMemory functions reachable from natural language through the registered tool surface

## Install paths

Published package install:

```powershell
cd $HOME\.openclaw
npm install @echomem/echo-memory-cloud-openclaw-plugin
```

Install from a local repo path:

```powershell
openclaw plugins install "C:\Users\Your Name\Documents\GitHub\EchoMemory-Cloud-OpenClaw-Plugin"
```

Install as a link during active development:

```powershell
openclaw plugins install --link "C:\Users\Your Name\Documents\GitHub\EchoMemory-Cloud-OpenClaw-Plugin"
```

Important install rule:

- OpenClaw needs the plugin discoverable from its own plugin resolution path
- a global npm install by itself is not enough
- the most reliable paths are:
  - `npm install` inside `$HOME/.openclaw`
  - `openclaw plugins install ...`
  - `openclaw plugins install --link ...`

Do not assume "installed somewhere on the machine" means OpenClaw can load it.

## Account setup

1. Sign up at `https://iditor.com/signup/openclaw`.
2. Complete the email OTP flow.
3. If first login asks for it, use referral code:

```text
openclawyay
```

4. Create an API key at `https://www.iditor.com/api`.
5. Use scopes `ingest:write` and `memory:read`.

## Required OpenClaw host config

Set `tools.profile` to `"full"` in `~/.openclaw/openclaw.json`.

Use the exact plugin entry key:

```text
plugins.entries.echo-memory-cloud-openclaw-plugin
```

Do not use old or guessed keys like:

- `echomemory-cloud`
- any other shortened alias

If an old key is already present, remove it instead of keeping both.

## Minimum working plugin config

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
          "localUiAutoInstall": true
        }
      }
    }
  }
}
```

## First restart

```powershell
openclaw gateway restart
```

Use `openclaw gateway restart`, not a generic `openclaw restart`, when you want the plugin service lifecycle to reload cleanly.

Expected signs of a healthy startup:

- the plugin loads without `plugin not found`
- the local UI may install/build assets on first run
- the gateway log shows `[echo-memory] Local workspace viewer: http://127.0.0.1:17823`

Transient restart pitfall:

- right after enabling or patching the plugin config, OpenClaw can briefly reject new work with messages like `Gateway is draining for restart; new tasks are not accepted`
- that is usually a restart timing issue, not proof that the plugin is broken
- wait for the gateway to finish restarting, then retry

## First checks

1. `/echo-memory whoami`
2. `/echo-memory status`
3. `/echo-memory sync`
4. `/echo-memory search <known topic>`

If the localhost UI is not active after restart:

1. check gateway logs for the local workspace viewer line
2. check whether the plugin was actually discovered
3. if discovery is blocked, use the fallback script in [`../scripts/start-local-ui.mjs`](../scripts/start-local-ui.mjs)

## Common install pitfalls

- Windows paths with spaces must be quoted
- restart the gateway after install or config changes
- `tools.profile` must be `full`
- the plugin entry key must be exactly `echo-memory-cloud-openclaw-plugin`
- stale config entries can keep producing misleading warnings even after the real plugin is installed
- a plugin installed globally but not under OpenClaw's resolution path will still look "not found"
- if OpenClaw is older than the plugin target version, discovery can fail even though the package is installed

## Valuable real-world setup lessons

These came from an actual setup/debug session and are worth checking early:

1. Wrong plugin ID wastes time fast.
   Use `echo-memory-cloud-openclaw-plugin` exactly.

2. Stale config entries create noisy false trails.
   If logs mention something like `plugins.entries.echomemory-cloud: plugin not found`, remove the stale key and keep only the real plugin entry.

3. Global install is not enough.
   If OpenClaw says the plugin is missing, install it into `~/.openclaw` or via `openclaw plugins install`.

4. Gateway restart timing can look like failure.
   If tasks are rejected while the gateway is draining, wait for restart completion before debugging further.

5. Local mode can persist unexpectedly.
   If the UI sidebar saved an API key but the app still says local mode, verify both:
   - `localOnlyMode` is `false`
   - the API key is available from the winning config source

6. Manual local UI startup is a fallback, not the preferred steady state.
   It is useful when discovery fails, especially around version mismatch, but normal operation should come from plugin startup on `openclaw gateway restart`.
