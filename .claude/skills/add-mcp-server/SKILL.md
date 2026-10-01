---
name: add-mcp-server
description: Add or update an MCP server definition in this registry (servers/*.json) from an upstream repo URL, npm/PyPI package, Docker image, or hosted MCP endpoint. Use when asked to "add a server", "add <product> MCP", "create a definition for <url>", or to add another transport variant (npx/uvx/docker/http) of an existing server.
---

# Add an MCP server definition

Follow **AGENTS.md → "Agent Workflow: Adding a Server"** step by step, and apply **"The Credential Model"** from the same file. Don't skip the research step. Every package name, env var, flag and URL must come from the upstream docs.

## Inputs to collect first

- The upstream source: repo URL, package name, image, or endpoint. If the user gave only a product name, find the upstream repo and confirm it with the user if more than one candidate exists.
- Which variant(s) to add: `-npx`, `-uvx`, `-docker`, `-http`. Default to the ones the upstream README documents.

## Procedure

1. Check `servers/` for an existing definition (name, repo URL, package). If one exists, update it and never change its `id`.
2. Read the upstream README and manifest. Record the runner, env vars and flags (required vs optional), the auth method (header name for http), the capabilities, and whether anything writes.
3. Confirm the artefact exists with metadata lookups only (`npm view`, the PyPI JSON API, the registry page). Never run the server.
4. Copy the closest file listed in `examples/README.md` to `servers/<id>.json` and replace every field.
5. Wire every input with a `${input:ID}` placeholder. For http that means `headers` or `url` only. Derive `auth.type` from the inputs table in AGENTS.md.
6. Run `pnpm validate servers/<id>.json && pnpm check-conflicts && pnpm test` (or the npm equivalents) and fix everything they report.
7. Self-review with AGENTS.md → "Reviewing a Definition".
8. Report to the user:
   - the file(s) created
   - the auth/input wiring in one line, e.g. "api_key: BRAVE_API_KEY (required, secret) → env BRAVE_API_KEY"
   - anything you couldn't verify from the upstream docs

   Commit with `git commit -s` only if asked.
