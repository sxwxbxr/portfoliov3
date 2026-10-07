// Parst alle .ts/.tsx-Dateien und meldet Syntaxfehler (z. B. ungeschützte
// Anführungszeichen in lib/copy.ts), ohne dass die Abhängigkeiten installiert sind.
// Aufruf: node scripts/check-syntax.mjs <Pfad zu typescript>
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

const ts = createRequire(import.meta.url)(process.argv[2] || "typescript");
const skip = new Set(["node_modules", ".next", ".git", "obj", "pw"]);
let failed = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (skip.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.tsx?$/.test(name) && !name.endsWith(".d.ts")) check(p);
  }
}

function check(file) {
  const kind = file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, kind);
  for (const d of sf.parseDiagnostics ?? []) {
    const { line, character } = sf.getLineAndCharacterOfPosition(d.start ?? 0);
    console.error(`${file}:${line + 1}:${character + 1} ${ts.flattenDiagnosticMessageText(d.messageText, "\n")}`);
    failed++;
  }
}

walk(".");
if (failed) {
  console.error(`${failed} Syntaxfehler`);
  process.exit(1);
}
console.log("Syntax OK");
