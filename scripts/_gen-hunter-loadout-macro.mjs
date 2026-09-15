/**
 * 猎人装载同步宏
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const macrosDir = path.join(root, "src", "packs", "homebrew-macros");

const macro = {
  _id: "whbHuntLoadoutM1",
  name: "猎人装载同步",
  type: "script",
  img: "icons/weapons/guns/gun-pistol-flintlock.webp",
  scope: "global",
  command: `/**
 * 选中猎人 Token → 按 preferredLoadoutIds / preferredLoadout 从合集补齐物品栏。
 * 用于旧猎人只有 melee、没有真实武器/针剂导致自动化不触发的情况。
 */
const api = game.modules.get("wang-pf2e-homebrew")?.api;
if (!api?.forceSyncHunterInventory) {
  ui.notifications.error("模块 API 未就绪：forceSyncHunterInventory");
} else {
  await api.forceSyncHunterInventory();
}
`,
  folder: "whbHntFldMac0001",
  sort: 120,
  ownership: { default: 1 },
  flags: {
    "wang-pf2e-homebrew": {
      purpose: "hunt-hunter-loadout-sync",
      source: "hunt-showdown",
    },
  },
};

if (!/^[a-zA-Z0-9]{16}$/.test(macro._id)) throw new Error("bad macro id");
fs.writeFileSync(path.join(macrosDir, `${macro._id}.json`), JSON.stringify(macro, null, 2) + "\n");
console.log("wrote macro", macro._id);
