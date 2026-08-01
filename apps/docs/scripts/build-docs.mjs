import { mkdir, writeFile } from "node:fs/promises";

await import("./verify-docs.mjs");

const outputDir = new URL("../.zivvy-build/", import.meta.url);
await mkdir(outputDir, { recursive: true });
await writeFile(
  new URL("verified.json", outputDir),
  JSON.stringify({ verifiedAt: new Date().toISOString() }, null, 2)
);
