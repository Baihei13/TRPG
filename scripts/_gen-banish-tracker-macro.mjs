import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cmd = fs.readFileSync(path.join(root, "scripts", "banish-tracker-macro.js"), "utf8");

const foldersPath = path.join(root, "src", "packs", "homebrew-macros", "_folders.json");
const folders = JSON.parse(fs.readFileSync(foldersPath, "utf8"));
if (!folders.folders.some((f) => f._id === "whbHntFldMac0001")) {
  folders.folders.push({
    _id: "whbHntFldMac0001",
    name: "猎杀对决",
    type: "Macro",
    sorting: "a",
    folder: null,
  });
  fs.writeFileSync(foldersPath, JSON.stringify(folders, null, 2) + "\n");
}

const macro = {
  _id: "whbHuntBanishM01",
  name: "放逐仪式",
  type: "script",
  img: "modules/wang-pf2e-homebrew/assets/hunt/poetic-justice.png",
  scope: "global",
  command: cmd,
  folder: "whbHntFldMac0001",
  sort: 120,
  ownership: { default: 1 },
  flags: {
    "wang-pf2e-homebrew": {
      purpose: "banishing-tracker",
      source: "hunt-showdown",
      activeTiles: true,
      argsHint: "start | tick | status | complete | reset ; boss 名 | max 10",
    },
  },
};

if (!/^[a-zA-Z0-9]{16}$/.test(macro._id)) throw new Error(`bad id ${macro._id}`);
fs.writeFileSync(
  path.join(root, "src", "packs", "homebrew-macros", "whbHuntBanishM01.json"),
  JSON.stringify(macro, null, 2) + "\n"
);
console.log("ok", macro._id);
