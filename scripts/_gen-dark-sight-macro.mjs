import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cmd = fs.readFileSync(path.join(root, "scripts", "dark-sight-boost-macro.js"), "utf8");

const macro = {
  _id: "whbHuntDarkSght1",
  name: "获取黑视强化",
  type: "script",
  img: "systems/pf2e/icons/features/classes/precise-strike.webp",
  scope: "global",
  command: cmd,
  folder: "whbHntFldMac0001",
  sort: 110,
  ownership: { default: 1 },
  flags: {
    "wang-pf2e-homebrew": {
      purpose: "dark-sight-boost",
      source: "hunt-showdown",
    },
  },
};

if (!/^[a-zA-Z0-9]{16}$/.test(macro._id)) throw new Error(`bad id ${macro._id}`);
fs.writeFileSync(
  path.join(root, "src", "packs", "homebrew-macros", "whbHuntDarkSght1.json"),
  JSON.stringify(macro, null, 2) + "\n"
);

const modPath = path.join(root, "module.json");
const raw = fs.readFileSync(modPath);
const text =
  raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf
    ? raw.slice(3).toString("utf8")
    : raw.toString("utf8");
const mod = JSON.parse(text);
mod.version = "1.29.0";
fs.writeFileSync(modPath, JSON.stringify(mod, null, 2) + "\n");
console.log("ok", macro._id, mod.version);
