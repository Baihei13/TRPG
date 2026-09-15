import fs from "fs";

const src = fs.readFileSync("scripts/hunt-showdown-automation.mjs", "utf8");
const missingH = [];
const monsterActs = [];

for (const f of fs.readdirSync("src/packs/homebrew-actors").filter((x) => x.startsWith("whbHunt") && x.endsWith(".json"))) {
  const j = JSON.parse(fs.readFileSync(`src/packs/homebrew-actors/${f}`, "utf8"));
  const fl = j.flags?.["wang-pf2e-homebrew"] || {};
  for (const it of j.items || []) {
    if (it.type !== "action" && it.type !== "melee") continue;
    const slug = it.system?.slug || "";
    const name = it.name || "";
    const desc = it.system?.description?.value || "";
    if (fl.huntHunter && it.type === "action") {
      if (!slug) continue;
      if (/tactics|tracker|passive|GM|备选|战术/.test(slug + name)) continue;
      if (!src.includes(`"${slug}"`)) missingH.push([fl.huntHunter, slug, name]);
    }
    if (fl.huntMonster) {
      monsterActs.push({
        monster: fl.huntMonster,
        type: it.type,
        slug,
        name,
        hasDamage: /@Damage/.test(desc),
        hasCheck: /@Check/.test(desc),
        hasTemplate: /@Template/.test(desc),
        hasBurn: /灼烬|BurnFx/.test(desc),
        hasPoison: /中毒|PsnFx/.test(desc),
      });
    }
  }
}

console.log("Missing hunter handlers:", missingH.length);
missingH.forEach((x) => console.log(x.join(" | ")));
console.log("\nMonster actions with Damage/Check/Template:");
monsterActs
  .filter((a) => a.hasDamage || a.hasCheck || a.hasTemplate)
  .forEach((a) =>
    console.log(
      [a.monster, a.type, a.slug || "-", a.name, a.hasDamage ? "DMG" : "", a.hasCheck ? "CHK" : "", a.hasTemplate ? "TPL" : "", a.hasBurn ? "BURN" : "", a.hasPoison ? "PSN" : ""].join(" | "),
    ),
  );
