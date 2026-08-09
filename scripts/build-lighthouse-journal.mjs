import fs from "node:fs";
import { buildLighthouseJournalDoc } from "./lighthouse-journal.mjs";

const doc = await buildLighthouseJournalDoc();
const out = "src/packs/homebrew-journals/whbLighthousJr01.json";
fs.writeFileSync(out, JSON.stringify(doc, null, 2), "utf8");
const d = doc.flags.ephemera.document;
console.log("wrote", out, d.type, d.template);
