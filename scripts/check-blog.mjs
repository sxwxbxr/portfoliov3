// Prüft das Frontmatter der Blog-Posts mit einem echten YAML-Parser, so wie
// lib/blog/local.ts es später per zod erwartet (z. B. wird `1.0` als Zahl gelesen
// und muss als "1.0" in Anführungszeichen stehen).
// Aufruf: node scripts/check-blog.mjs <Pfad zu yaml>
import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";

const { parse } = createRequire(import.meta.url)(process.argv[2] || "yaml");
const dir = "content/blog";
const errors = [];

for (const name of readdirSync(dir).filter((n) => n.endsWith(".md"))) {
  const m = readFileSync(`${dir}/${name}`, "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) continue;
  let data;
  try {
    data = parse(m[1]) ?? {};
  } catch (e) {
    errors.push(`${dir}/${name}: ungültiges YAML (${e.message.split("\n")[0]})`);
    continue;
  }
  for (const key of ["title", "excerpt"]) {
    if (data[key] !== undefined && typeof data[key] !== "string") errors.push(`${dir}/${name}: ${key} muss ein String sein`);
  }
  for (const key of ["tags", "packages"]) {
    const v = data[key];
    if (v === undefined) continue;
    if (!Array.isArray(v)) errors.push(`${dir}/${name}: ${key} muss eine Liste sein`);
    else v.forEach((x, i) => {
      // Zahlen in tags toleriert lib/blog/local.ts (z.coerce.string()); packages muss String bleiben.
      if (typeof x !== "string" && !(key === "tags" && typeof x === "number")) errors.push(`${dir}/${name}: ${key}[${i}] ist ${JSON.stringify(x)} (${typeof x}), in Anführungszeichen setzen`);
    });
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Blog-Frontmatter OK");
