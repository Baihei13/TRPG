import fs from "node:fs";
import { buildDranHighJournalDoc } from "./dran-high-journal.mjs";

const doc = await buildDranHighJournalDoc();
const out = "src/packs/homebrew-journals/whbDranHighJr001.json";
fs.writeFileSync(out, JSON.stringify(doc, null, 2), "utf8");
const d = doc.flags.ephemera.document;
console.log("wrote", out, d.type, d.template);
