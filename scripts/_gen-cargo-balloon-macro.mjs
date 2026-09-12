import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cmd = fs.readFileSync(path.join(root, "scripts", "cargo-balloon-macro.js"), "utf8");

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
  _id: "whbHuntBalloonM1",
  name: "要塞货气球",
  type: "script",
  img: "modules/wang-pf2e-homebrew/assets/hunt/fusee.png",
  scope: "global",
  command: cmd,
  folder: "whbHntFldMac0001",
  sort: 110,
  ownership: { default: 1 },
  flags: {
    "wang-pf2e-homebrew": {
      purpose: "cargo-balloon",
      source: "hunt-showdown",
      activeTiles: true,
      argsHint: "valve | close | ready | launch | status | reset",
    },
  },
};

if (!/^[a-zA-Z0-9]{16}$/.test(macro._id)) throw new Error(`bad id ${macro._id}`);
fs.writeFileSync(
  path.join(root, "src", "packs", "homebrew-macros", "whbHuntBalloonM1.json"),
  JSON.stringify(macro, null, 2) + "\n"
);
console.log("ok", macro._id);
