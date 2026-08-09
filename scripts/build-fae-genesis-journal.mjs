import fs from "node:fs";
import { buildFaeBirthJournalDoc } from "./fae-genesis-journal.mjs";

const doc = await buildFaeBirthJournalDoc();
const out = "src/packs/homebrew-journals/whbFaeBirth00001.json";
fs.writeFileSync(out, JSON.stringify(doc, null, 2), "utf8");
const d = doc.flags.ephemera.document;
console.log("wrote", out);
console.log({
  type: d.type,
  template: d.template,
  composition: d.composition,
  layoutMode: d.layoutMode,
  pages: d.pages.map((p) => p.title),
});
