import fs from "node:fs";
import { buildDranCastleArrivalJournalDoc } from "./dran-castle-arrival-journal.mjs";

const doc = await buildDranCastleArrivalJournalDoc();
const out = "src/packs/homebrew-journals/whbDranCastArr01.json";
fs.writeFileSync(out, JSON.stringify(doc, null, 2), "utf8");
const d = doc.flags.ephemera.document;
console.log("wrote", out);
console.log({
  type: d.type,
  template: d.template,
  title: d.title,
  blocks: (d.textBlocks ?? []).map((b) => ({
    id: b.id,
    text: String(b.text ?? "").slice(0, 40),
  })),
  hidden: d.hiddenBlocks,
});
