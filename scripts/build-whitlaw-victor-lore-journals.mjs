import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildScoutReportsJournalDoc,
  buildOtisLettersJournalDoc,
  buildJohnVictorLetterJournalDoc,
  buildJohnVictorHandbookJournalDoc,
} from "./whitlaw-victor-lore-journals.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "src", "packs", "homebrew-journals");

const docs = [
  await buildScoutReportsJournalDoc(),
  await buildOtisLettersJournalDoc(),
  await buildJohnVictorLetterJournalDoc(),
  await buildJohnVictorHandbookJournalDoc(),
];

for (const doc of docs) {
  const out = path.join(outDir, `${doc._id}.json`);
  fs.writeFileSync(out, JSON.stringify(doc, null, 2) + "\n", "utf8");
  const d = doc.flags.ephemera.document;
  console.log(
    "wrote",
    path.basename(out),
    d.type,
    d.template,
    "pages",
    d.pages?.length ?? "letter"
  );
}
