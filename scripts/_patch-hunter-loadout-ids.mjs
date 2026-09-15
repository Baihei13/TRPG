/**
 * 为所有 huntHunter 写入 preferredLoadoutIds（按 slug 映射合集 _id）
 * 并修正空石冢无效装载 slug。
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const itemsDir = path.join(root, "src", "packs", "homebrew-items");
const actorsDir = path.join(root, "src", "packs", "homebrew-actors");

const slugToId = {};
for (const f of fs.readdirSync(itemsDir).filter((x) => x.startsWith("whbHunt") && x.endsWith(".json"))) {
  const j = JSON.parse(fs.readFileSync(path.join(itemsDir, f), "utf8"));
  if (j.system?.slug && j._id) slugToId[j.system.slug] = j._id;
}

let patched = 0;
for (const f of fs.readdirSync(actorsDir).filter((x) => x.startsWith("whbHunt") && x.endsWith(".json"))) {
  const p = path.join(actorsDir, f);
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  const flags = j.flags?.["wang-pf2e-homebrew"];
  if (!flags?.huntHunter) continue;

  // 空石冢：尚无独立原型物品，清空无效 slug，避免同步报错
  if (flags.huntHunter === "john-victor") {
    flags.preferredLoadout = [];
    flags.preferredLoadoutIds = [];
    flags.loadoutNote = "NPC 打击自带莫辛刺刀/Rival；无合集原型物品可同步";
  } else {
    const loadout = Array.isArray(flags.preferredLoadout) ? flags.preferredLoadout : [];
    const ids = [];
    for (const slug of loadout) {
      const id = slugToId[slug];
      if (id && !ids.includes(id)) ids.push(id);
      else if (!id) console.warn("missing slug", flags.huntHunter, slug);
    }
    flags.preferredLoadoutIds = ids;
  }

  j.flags["wang-pf2e-homebrew"] = flags;
  fs.writeFileSync(p, JSON.stringify(j, null, 2) + "\n");
  patched++;
  console.log("patched", flags.huntHunter, flags.preferredLoadoutIds?.length ?? 0);
}
console.log("done", patched);
