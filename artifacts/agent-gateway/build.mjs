import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import { rm } from "node:fs/promises";

const artifactDir = path.dirname(fileURLToPath(import.meta.url));

async function buildAll() {
  const distDir = path.resolve(artifactDir, "dist");
  await rm(distDir, { recursive: true, force: true });

  const shared = {
    platform: "node",
    bundle: true,
    format: "esm",
    outdir: distDir,
    outExtension: { ".js": ".mjs" },
    logLevel: "info",
    // Do not bundle npm packages — let Node resolve them at runtime.
    // This avoids CJS dynamic-require issues inside bundled ESM.
    packages: "external",
    define: {
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV ?? "production"
      ),
    },
  };

  await esbuild({
    ...shared,
    entryPoints: [path.resolve(artifactDir, "src/index.ts")],
  });

  await esbuild({
    ...shared,
    entryPoints: [path.resolve(artifactDir, "src/mcp/server.ts")],
    outdir: path.resolve(distDir, "mcp"),
  });

  console.log("Build complete.");
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
