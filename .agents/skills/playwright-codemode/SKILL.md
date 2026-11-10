---
name: playwright-codemode
description: Use only when the Playwright MCP server is running (its `browser_*` tools are available) and the user explicitly asks to drive a browser (navigate, fill, click, assert, read text, check console errors, screenshot) — especially multi-step flows like login, form submit, or verifying a UI change. Compiles a JSON step plan into one `browser_run_code_unsafe` call that returns a terse digest instead of many snapshot-heavy round trips. Triggers on "check it in the browser", "verify with playwright", "click through", "test this page".
---

# Playwright codemode

Each Playwright MCP call (`browser_click`, `browser_type`, …) returns a full accessibility snapshot. A 10-step flow costs 10 snapshots. Instead, write a JSON step plan, compile it to ONE function, and paste it into `browser_run_code_unsafe`. The function returns a terse digest, never a snapshot.

**Preconditions — both required, else do not invoke:** (1) the Playwright MCP is running, i.e. `browser_run_code_unsafe` is listed in the available tools (load it via ToolSearch if deferred; if it is absent or the server failed to connect, stop and tell the user instead of falling back to other automation); (2) the user explicitly asked for browser automation against the app.

## Workflow

1. Write the plan (inline JSON or a file in the scratchpad).
2. Compile it:

   ```sh
   node <skill-dir>/scripts/codemode.mjs plan.json
   echo '<json>' | node <skill-dir>/scripts/codemode.mjs -
   node <skill-dir>/scripts/codemode.mjs --help
   ```

3. Pass stdout as the `code` of `browser_run_code_unsafe`.
4. Read the digest. On `ok: false`, fix only the failed step (`fail.i`) and rerun. Take one `browser_snapshot` only when you can't tell why a target is missing.

Invalid plans exit 1 with `step <i>: <reason>` on stderr.

## Example plan

```json
{
  "base": "http://localhost:3000",
  "steps": [
    { "goto": "/login" },
    { "fill": { "label": "Email" }, "value": "a@b.c" },
    { "click": { "role": "button", "name": "Sign in" } },
    { "waitUrl": "/dashboard" },
    { "text": "css=h1", "as": "title" },
    { "console": "errors", "as": "errs" }
  ]
}
```

## Example output

```json
{ "ok": true, "url": "http://localhost:3000/dashboard", "steps": 6,
  "data": { "title": "Dashboard", "errs": [] } }
```

On failure: `"ok": false, "fail": { "i": 2, "step": "click role=button[Sign in]", "error": "..." }`.

## Plan options

`base` (joined to `goto`), `timeout` (ms, default 5000), `stopOnFail` (default true).

## Steps

| Step          | Fields                                  |
| ------------- | --------------------------------------- |
| goto          | `goto` path                             |
| click / check | target                                  |
| fill / select | target, `value`                         |
| press         | key, `on`? target                       |
| wait          | target or ms                            |
| waitUrl       | path glob                               |
| expect        | target, `text`?, `visible`?, `count`?   |
| text / count  | target, `as`                            |
| attr          | target, `name`, `as`                    |
| eval          | fn string, `as`                         |
| console       | `"errors"`, `as`                        |
| shot          | file name                               |

Target: a string or an object.

- String: `role=`, `text=`, `css=`, `xpath=`, `#`, `.`, `[`, `//` go to `page.locator`. Anything else is a `getByText` substring match, so a bare tag like `h1` must be written `css=h1`.
- Object: `{ role, name? }`, `{ label }`, `{ testid }`, `{ placeholder }`, with optional `nth` (default first).

Prefer role/label/testid objects over CSS; they survive markup changes.

## Maintenance

Tests: `node --test scripts/codemode.test.mjs`.
