import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildAhaWelcomeLetterJournalDoc } from "./aha-welcome-letter.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const doc = await buildAhaWelcomeLetterJournalDoc();
const out = path.join(root, "src", "packs", "homebrew-journals", `${doc._id}.json`);
fs.writeFileSync(out, JSON.stringify(doc, null, 2) + "\n", "utf8");
const d = doc.flags.ephemera.document;
console.log("wrote", path.basename(out), d.type, d.template);
