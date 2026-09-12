import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cmd = fs.readFileSync(path.join(root, "scripts", "xp-gift-four-shots-macro.js"), "utf8");

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
  _id: "whbHuntGiftShot1",
  name: "经验赠礼 · 四针",
  type: "script",
  img: "modules/wang-pf2e-homebrew/assets/hunt/vitality-shot.png",
  scope: "global",
  command: cmd,
  folder: "whbHntFldMac0001",
  sort: 100,
  ownership: { default: 1 },
  flags: {
    "wang-pf2e-homebrew": {
      purpose: "xp-gift-four-shots",
      source: "hunt-showdown",
      activeTiles: true,
    },
  },
};

if (!/^[a-zA-Z0-9]{16}$/.test(macro._id)) throw new Error(`bad id ${macro._id}`);
fs.writeFileSync(
  path.join(root, "src", "packs", "homebrew-macros", "whbHuntGiftShot1.json"),
  JSON.stringify(macro, null, 2) + "\n"
);

const modPath = path.join(root, "module.json");
const raw = fs.readFileSync(modPath);
const text =
  raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf
    ? raw.slice(3).toString("utf8")
    : raw.toString("utf8");
const mod = JSON.parse(text);
mod.version = "1.28.1";
fs.writeFileSync(modPath, JSON.stringify(mod, null, 2) + "\n");
console.log("ok", macro._id, mod.version);
