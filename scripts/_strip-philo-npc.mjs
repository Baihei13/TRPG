import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const script = path.join(root, "scripts", "_gen-philo-hunter.mjs");
let t = fs.readFileSync(script, "utf8");

const start = t.indexOf("// —— 菲洛猎人");
const start2 = start >= 0 ? start : t.indexOf("const philo =");
const end = t.indexOf("const mod = readMod()");
if (start2 < 0 || end < 0) {
  console.error("markers not found", { start2, end });
  process.exit(1);
}

t = t.slice(0, start2) + t.slice(end);
t = t.replace(
  'console.log("wrote", items.length, "items + philo; version", mod.version);',
  'console.log("wrote", items.length, "PC feats/gear (no NPC); version", mod.version);'
);
t = t.replace('mod.version = "1.27.0"', 'mod.version = "1.27.1"');
t = t.replace('mod.version = "1.27.1"', 'mod.version = "1.27.1"');

// drop unused actorsDir if present
if (!t.includes("actorsDir)")) {
  t = t.replace(/\nconst actorsDir = path\.join\(root, "src", "packs", "homebrew-actors"\);\n/, "\n");
}

fs.writeFileSync(script, t);
console.log("stripped NPC block");
