# Server Definition Examples

Starter templates for new server definitions. Every file here is a **copy of a real definition in [`servers/`](../servers/)**, so it shows a shape that works in McpMux today. `pnpm test` validates every example against the schema, so they can't drift into invalid JSON.

Copy the closest one to `servers/<your-id>.json` and edit it. Don't build from scratch.

## Pick an Example

| File | Transport | `auth.type` | What it demonstrates | Copied from |
|------|-----------|-------------|----------------------|-------------|
| [`stdio-no-auth.json`](./stdio-no-auth.json) | stdio (`npx`) | `none` | The simplest possible server: no inputs, `"inputs": []` | `community.sequential-thinking-npx` |
| [`stdio-local-path.json`](./stdio-local-path.json) | stdio (`npx`) | `none` | A **non-secret** `directory_path` input passed in `args`. Inputs don't imply auth | `community.filesystem` |
| [`stdio-select-toggle.json`](./stdio-select-toggle.json) | stdio (`npx`) | `none` | `select` with `options` and a `boolean` toggle, both optional. No `env` block: inputs are exported as env vars named after their `id` | `community.playwright-npx` |
| [`stdio-api-key.json`](./stdio-api-key.json) | stdio (`npx`) | `api_key` | A required secret input wired into `env`, with an `obtain` block | `community.brave-search-npx` |
| [`complete-example.json`](./complete-example.json) | stdio (`docker`) | `api_key` | Docker `-e NAME` passthrough, a required token and an optional non-secret setting | `com.github-mcp-docker` |
| [`sponsored-example.json`](./sponsored-example.json) | stdio (`npx`) | `api_key` | Integration token in `env`, with `obtain` steps that include a post-setup step (sharing pages with the integration) | `com.notion-mcp-npx` |
| [`stdio-multi-input.json`](./stdio-multi-input.json) | stdio (`uvx`) | `optional_api_key` | Python server with connection details: `number` / `boolean` inputs with `default` values and an optional secret password | `com.clickhouse-mcp-uvx` |
| [`read-only-example.json`](./read-only-example.json) | http | `none` | A hosted endpoint with no auth and `read_only_mode: true` | `com.cloudflare-docs` |
| [`http-api-key-header.json`](./http-api-key-header.json) | http | `api_key` | A required token sent as `Authorization: Bearer ${input:…}` in `headers` | `com.github-mcp-http-pat` |
| [`http-optional-api-key.json`](./http-optional-api-key.json) | http | `optional_api_key` | The same header wiring, but `required: false`. Anonymous access works | `co.huggingface-mcp` |
| [`remote-hosted-example.json`](./remote-hosted-example.json) | http | `oauth` | A hosted endpoint where McpMux runs the OAuth sign-in. No inputs, no headers | `com.atlassian-mcp` |

> `sponsored-example.json` keeps its old filename so existing links keep working. It's an ordinary npx + token definition. `sponsored` is a platform-managed field that contributors can't set.

## The One Rule People Miss

`auth.type` is only a **label**. The setup form comes from `transport.metadata.inputs`, and a value only reaches the server through a `${input:ID}` placeholder:

| Transport | Where placeholders go |
|-----------|-----------------------|
| stdio | `env` (preferred for secrets), `args`, `command` |
| http | `headers` or `url` — nothing else is sent |

So an `api_key` server needs **all three**: the `auth` label, a `secret` + `required` input, and a placeholder that puts the value where the server reads it. See [Auth, Inputs & Placeholders](../README.md#auth-inputs--placeholders--how-they-fit-together) in the main README.

## What to Change When You Copy

1. **`id`, `name`, `alias`.** Follow `{tld}.{publisher}-{name}` with a transport suffix (`-npx`, `-uvx`, `-docker`, `-http`). Rename the file to match the `id`. `pnpm check-conflicts` fails if you forget, because the copied ID already exists in `servers/`.
2. **`description`, `tags`, `categories`, `logo`, `contributor`, `links`, `changelog_url`.** Describe the new server; don't keep the example's.
3. **`transport`.** Take the package name, image, CLI flags, env var names and endpoint URL from the upstream README.
4. **`metadata.inputs`.** One entry per value the user provides. Every `${input:ID}` needs a matching `id`. Credentials get `"secret": true` and an `obtain` block.
5. **`auth`.** Re-check `auth.type` against your inputs: required secret → `api_key`, optional secret → `optional_api_key`, no secret → `none`, hosted OAuth endpoint → `oauth`.
6. **`capabilities`.** Set what the server really implements. `read_only_mode: true` only if it never writes.

## Validate

```bash
pnpm validate servers/<your-id>.json
pnpm check-conflicts
pnpm test
```

`pnpm test` also validates everything in `examples/`. If you add an example, add a row for it to the table above. A test checks that every example is listed.

## Best Practices

- **Logos:** an HTTP(S) URL to a PNG/SVG. Emoji aren't accepted. Prefer GitHub avatars (`https://avatars.githubusercontent.com/u/<id>?v=4`) or official brand URLs.
- **Descriptions:** one or two plain sentences on what the server does. No marketing hype.
- **`obtain` instructions:** numbered steps separated by `\n`, naming the exact scopes or permissions needed. Keep `button_label` short ("Get API Key", "Create Token").
- **Media (optional):** up to 5 screenshots (1200×800), a demo video, and a banner (1200×400).

See [CONTRIBUTING.md](../CONTRIBUTING.md) for the full contributor guide.
