import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildAllAiMonsterLoreJournalDocs } from "./hunt-ai-monster-lores.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "src", "packs", "homebrew-journals");

const docs = await buildAllAiMonsterLoreJournalDocs();
for (const doc of docs) {
  const out = path.join(outDir, `${doc._id}.json`);
  fs.writeFileSync(out, JSON.stringify(doc, null, 2) + "\n", "utf8");
  const d = doc.flags.ephemera.document;
  console.log("wrote", path.basename(out), d.type, "pages", d.pages?.length ?? "?");
}
console.log("total", docs.length);
