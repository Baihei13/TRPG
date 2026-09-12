import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildButcherResearcherJournalDoc,
  buildButcherClippingsJournalDoc,
  buildButcherInterviewJournalDoc,
  buildButcherDiaryJournalDoc,
} from "./butcher-lore-journals.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "src", "packs", "homebrew-journals");

const docs = [
  await buildButcherResearcherJournalDoc(),
  await buildButcherClippingsJournalDoc(),
  await buildButcherInterviewJournalDoc(),
  await buildButcherDiaryJournalDoc(),
];

for (const doc of docs) {
  const out = path.join(outDir, `${doc._id}.json`);
  fs.writeFileSync(out, JSON.stringify(doc, null, 2) + "\n", "utf8");
  const d = doc.flags.ephemera.document;
  console.log("wrote", path.basename(out), d.type, d.template, "pages", d.pages?.length ?? "letter");
}
