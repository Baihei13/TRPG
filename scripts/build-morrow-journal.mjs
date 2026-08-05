import fs from "node:fs";
import { buildMorrowJournalDoc } from "./morrow-journal.mjs";

const doc = await buildMorrowJournalDoc();
const out = "src/packs/homebrew-journals/whbMorrowJrnl001.json";
fs.writeFileSync(out, JSON.stringify(doc, null, 2), "utf8");
const d = doc.flags.ephemera.document;
console.log("wrote", out);
console.log({
  title: d.title,
  pages: d.pages.map((p) => p.title),
});
