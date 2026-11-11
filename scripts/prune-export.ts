/** Removes the placeholder pages emitted for empty dynamic routes (see lib/static-params.ts). */
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "out");
const MARK = "__none__";
let removed = 0;

function walk(dir: string) {
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, d.name);
    if (d.name.includes(MARK)) {
      fs.rmSync(p, { recursive: true, force: true });
      removed++;
    } else if (d.isDirectory()) walk(p);
  }
}

if (fs.existsSync(OUT)) walk(OUT);
console.log(`prune-export: removed ${removed} placeholder file(s)/folder(s)`);
