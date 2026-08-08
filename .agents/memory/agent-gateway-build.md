---
name: Agent Gateway build pattern
description: Key lessons from building the agent-gateway Node/ESM package with esbuild + MCP stdio subprocess.
---

## Rule: use `packages: "external"` in esbuild for Node.js servers

Express (v5) and its deps use `require()` internally. When bundled into ESM with esbuild's default settings, the generated `__require2` shim cannot satisfy dynamic requires for Node built-ins like `tty`. Setting `packages: "external"` leaves all npm packages unresolved, letting Node.js find them in `node_modules` at runtime.

**Why:** ESM bundles that wrap CJS packages inline break on any dynamic `require(builtIn)` call inside those packages.

**How to apply:** Any Node.js server using CJS packages (express, debug, cors, etc.) must use `packages: "external"` in esbuild.

## Rule: resolve MCP server subprocess path from `process.cwd()`

When the MCP client (bundled into `dist/index.mjs`) tries to find the MCP server binary, `import.meta.url` resolves to `dist/index.mjs`, not the original `src/mcp/client.ts` — so relative paths computed from `import.meta.url` are wrong.

**Why:** esbuild collapses all source files into one output; `import.meta.url` always points to the bundle entry, not the source file.

**How to apply:** Use `join(process.cwd(), "dist", "mcp", "server.mjs")` to locate the MCP server. `process.cwd()` is the artifact directory when run via `pnpm --filter`.

## Rule: load skill file by walking up from `process.cwd()`

Same issue as MCP path — `import.meta.url` doesn't tell you where source files lived. Use `process.cwd()` + relative path `../../skills/...` to find workspace-root files from the artifact directory.
