import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const contentDir = new URL("../content/", import.meta.url);
const files = (await readdir(contentDir)).filter((file) => file.endsWith(".mdx"));

if (files.length === 0) {
  throw new Error("No MDX docs found in apps/docs/content");
}

const failures = [];

for (const file of files) {
  const text = await readFile(join(contentDir.pathname, file), "utf8");
  if (!text.trim()) failures.push(`${file}: empty file`);
  if (/coming soon/i.test(text) && !/SDKs are/i.test(text)) {
    failures.push(`${file}: contains stale 'coming soon' copy`);
  }
  if (file === "webhooks.mdx" && !/Webhooks are \*\*live\*\*/.test(text)) {
    failures.push("webhooks.mdx: must state that webhooks are live");
  }
}

if (failures.length > 0) {
  throw new Error(`Docs verification failed:\n${failures.join("\n")}`);
}

console.log(`Verified ${files.length} docs files.`);
