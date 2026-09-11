import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assets = path.join(root, "assets", "hunt");
const itemsDir = path.join(root, "src", "packs", "homebrew-items");
const folder = "whbfolderHunt001";
const pub = {
  title: "猎杀对决 — 弹药",
  authors: "Wang Homebrew / Hunt: Showdown",
  license: "ORC",
  remaster: true,
};

const downloads = [
  ["ammo-long.png", "https://huntshowdown.wiki.gg/images/Ammo_Long.png"],
  ["ammo-dumdum.png", "https://huntshowdown.wiki.gg/images/Ammo_Special_Long_Dumdum.png"],
  ["ammo-poison.png", "https://huntshowdown.wiki.gg/images/Ammo_Long_Poison.png"],
  ["ammo-fmj.png", "https://huntshowdown.wiki.gg/images/Ammo_Long_Full_Metal_Jacket.png"],
];

for (const [name, url] of downloads) {
  const out = path.join(assets, name);
  if (fs.existsSync(out) && fs.statSync(out).size > 500) {
    console.log("skip", name);
    continue;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${name} ${res.status}`);
  fs.writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  console.log("dl", name, fs.statSync(out).size);
}

function write(id, data) {
  if (id.length !== 16) throw new Error(`${id} len ${id.length}`);
  data._id = id;
  fs.writeFileSync(path.join(itemsDir, `${id}.json`), JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("wrote", id);
}

function ammoBase(extra) {
  const { system: sysExtra = {}, flags: flagExtra = {}, ...rest } = extra;
  return {
    folder,
    type: "consumable",
    system: {
      rules: [],
      traits: {
        value: ["consumable"],
        rarity: "common",
        otherTags: ["hunt-showdown", "hunt-ammo"],
      },
      publication: pub,
      level: { value: 1 },
      quantity: 10,
      baseItem: "rounds",
      bulk: { value: 0.1 },
      price: { value: { gp: 1 }, per: 10 },
      equipped: { carryType: "worn", invested: null },
      containerId: null,
      size: "med",
      identification: {
        status: "identified",
        unidentified: {
          name: "弹药",
          img: "systems/pf2e/icons/unidentified_item_icons/other-consumables.webp",
          data: { description: { value: "<p>一盒旧式金属枪弹。</p>" } },
        },
        misidentified: {},
      },
      category: "ammo",
      uses: { value: 1, max: 1, autoDestroy: true },
      damage: null,
      usage: { value: "held-in-one-hand" },
      stackGroup: "rounds10",
      ...sysExtra,
    },
    flags: {
      "wang-pf2e-homebrew": {
        source: "hunt-showdown",
        huntCategory: "ammo",
        ...flagExtra,
      },
    },
    ...rest,
  };
}

write(
  "whbHuntAmmoStd01",
  ammoBase({
    name: "标准枪弹 Standard Rounds",
    img: "modules/wang-pf2e-homebrew/assets/hunt/ammo-long.png",
    system: {
      description: {
        value:
          "<p>沼地猎人通用的黑火药金属弹，口径兼容多数猎杀火器（手枪与步枪共用本弹药作 PF2e 简化）。</p>\n<hr />\n<p><strong>用法</strong> 弹药；装入火器后每次打击消耗 1 发。</p>\n<p>默认一叠 <strong>20</strong> 发；价格 <strong>1 gp / 10 发</strong>（占位）。</p>",
        gm: "<p>Hunt 常规弹药合并。stackGroup rounds10。特殊弹另见达姆/毒/穿甲。</p>",
      },
      slug: "hunt-standard-rounds",
      quantity: 20,
      price: { value: { gp: 1 }, per: 10 },
    },
    flags: { wikiIcon: "Ammo_Long.png" },
  })
);

write(
  "whbHuntAmmoDum01",
  ammoBase({
    name: "达姆弹 Dumdum Ammo",
    img: "modules/wang-pf2e-homebrew/assets/hunt/ammo-dumdum.png",
    system: {
      description: {
        value:
          "<p>弹头撞击后扩张碎裂，撕裂血肉，但穿透力大减。</p>\n<blockquote><p>These modified bullets expand and shatter on impact, causing severe bleeding, but at the expense of penetration power and muzzle velocity.</p></blockquote>\n<hr />\n<p><strong>用法</strong> 弹药（特殊）；装入兼容火器后打击生效。</p>\n<p><strong>效果</strong> 命中时额外造成 <strong>1d4 持续流血</strong>伤害（已自动化）。对构装、不死等无血生物由 GM 裁定无效或减半。</p>\n<p>兼容：@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntRgrSwft01]{Swift}、@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntVet71Kb01]{Vetterli}、@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntPax000001]{Pax} 等。</p>",
        gm: "<p>Hunt Dumdum。流血；弱穿透。PF2e：DamageDice persistent bleed 1d4。</p>",
      },
      slug: "hunt-dumdum-ammo",
      traits: {
        value: ["consumable"],
        rarity: "uncommon",
        otherTags: ["hunt-showdown", "hunt-ammo", "hunt-special-ammo"],
      },
      level: { value: 2 },
      quantity: 5,
      price: { value: { gp: 1 }, per: 5 },
      rules: [
        {
          key: "DamageDice",
          selector: "damage",
          slug: "hunt-dumdum-bleed",
          label: "达姆弹",
          diceNumber: 1,
          dieSize: "d4",
          damageType: "bleed",
          category: "persistent",
        },
        {
          key: "Note",
          selector: "strike-damage",
          title: "达姆弹",
          text: "额外 1d4 持续流血；穿透力弱，对掩体/重甲效果较差（GM 裁定）。",
        },
      ],
    },
    flags: { wikiIcon: "Ammo_Special_Long_Dumdum.png", huntSpecialAmmo: "dumdum" },
  })
);

write(
  "whbHuntAmmoPsn01",
  ammoBase({
    name: "毒弹 Poison Ammo",
    img: "modules/wang-pf2e-homebrew/assets/hunt/ammo-poison.png",
    system: {
      description: {
        value:
          "<p>弹头碎裂后释放毒素，抑制愈合。</p>\n<blockquote><p>This bullet shatters on impact, releasing a toxic agent fatal in high doses, but cannot penetrate surfaces.</p></blockquote>\n<hr />\n<p><strong>用法</strong> 弹药（特殊）；装入兼容火器后打击生效。</p>\n<p><strong>效果</strong> 命中时目标获得 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntPsnFx0001]{猎杀中毒} <strong>1 层</strong>（已有则叠层；模块尽量在伤害结算后自动施加）。</p>\n<p>兼容：Swift、Vetterli、Pax、@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntBornheim1]{Bornheim} 等。</p>",
        gm: "<p>Hunt Poison Ammo。禁疗叠层。自动化见 hunt-showdown-automation。</p>",
      },
      slug: "hunt-poison-ammo",
      traits: {
        value: ["consumable", "poison"],
        rarity: "uncommon",
        otherTags: ["hunt-showdown", "hunt-ammo", "hunt-special-ammo"],
      },
      level: { value: 2 },
      quantity: 5,
      price: { value: { gp: 1 }, per: 5 },
      rules: [
        {
          key: "Note",
          selector: "strike-damage",
          title: "毒弹",
          text: "命中：目标获得猎杀中毒 1 层（叠层）。穿透力差。",
        },
      ],
    },
    flags: { wikiIcon: "Ammo_Long_Poison.png", huntSpecialAmmo: "poison" },
  })
);

write(
  "whbHuntAmmoFMJ01",
  ammoBase({
    name: "穿甲弹 FMJ Ammo",
    img: "modules/wang-pf2e-homebrew/assets/hunt/ammo-fmj.png",
    system: {
      description: {
        value:
          "<p>全金属被甲弹，穿透力强，弹道更稳，但初速略降。</p>\n<blockquote><p>Full Metal Jacket (FMJ) bullets have a hardened casing that increases penetration power, though additional weight reduces muzzle speed.</p></blockquote>\n<hr />\n<p><strong>用法</strong> 弹药（特殊）；装入兼容火器后打击生效。</p>\n<p><strong>效果</strong> 此打击对目标额外 <strong>+1 穿刺</strong>（状态，已自动化），并忽略 <strong>硬度 2</strong>（结算时手裁）。</p>\n<p>兼容：Swift、Vetterli、Pax 等。</p>",
        gm: "<p>Hunt FMJ。穿透。PF2e：+1 piercing status；硬度 2 靠 Note。</p>",
      },
      slug: "hunt-fmj-ammo",
      traits: {
        value: ["consumable"],
        rarity: "uncommon",
        otherTags: ["hunt-showdown", "hunt-ammo", "hunt-special-ammo"],
      },
      level: { value: 2 },
      quantity: 5,
      price: { value: { gp: 1 }, per: 5 },
      rules: [
        {
          key: "FlatModifier",
          selector: "damage",
          slug: "hunt-fmj-pen",
          type: "status",
          value: 1,
          damageType: "piercing",
          label: "穿甲弹",
        },
        {
          key: "Note",
          selector: "strike-damage",
          title: "穿甲弹",
          text: "忽略硬度 2；对掩体/护甲后目标更有效。",
        },
      ],
    },
    flags: { wikiIcon: "Ammo_Long_Full_Metal_Jacket.png", huntSpecialAmmo: "fmj" },
  })
);

const PROF = {
  key: "MartialProficiency",
  label: "猎杀武装熟练",
  kind: "attack",
  definition: ["item:id:{item|_id}"],
  value: 1,
  requiresInvestment: false,
};

const ammoLine =
  "<p><strong>弹药</strong> @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntAmmoStd01]{标准枪弹}；特殊：@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntAmmoDum01]{达姆弹}、@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntAmmoPsn01]{毒弹}、@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntAmmoFMJ01]{穿甲弹}。</p>";
const ammoLineBornheim =
  "<p><strong>弹药</strong> @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntAmmoStd01]{标准枪弹}；特殊：@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntAmmoPsn01]{毒弹}。</p>";

const weapons = [
  ["whbHuntRgrSwft01.json", ammoLine],
  ["whbHuntVet71Kb01.json", ammoLine],
  ["whbHuntPax000001.json", ammoLine],
  ["whbHuntBornheim1.json", ammoLineBornheim],
  ["whbHuntThrAxe001.json", null],
];

for (const [file, replaceAmmo] of weapons) {
  const p = path.join(itemsDir, file);
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  j.system.rules ??= [];
  if (!j.system.rules.some((r) => r.key === "MartialProficiency")) {
    j.system.rules.unshift({ ...PROF });
  }
  if (replaceAmmo) {
    j.system.description.value = j.system.description.value.replace(
      /<p><strong>弹药<\/strong>[\s\S]*?<\/p>/,
      replaceAmmo
    );
  }
  if (j.system.ammo && j.type === "weapon") {
    j.system.ammo.baseType = "rounds";
  }
  if (!j.system.description.value.includes("视为对其拥有")) {
    const note =
      "<p><strong>熟练</strong> 持用此武器期间视为对其拥有<strong>受训</strong>熟练（无需火器或其他武器熟练）。</p>\n";
    if (j.system.description.value.includes("<hr />")) {
      j.system.description.value = j.system.description.value.replace(
        "<hr />",
        `${note}<hr />`
      );
    } else {
      j.system.description.value += note;
    }
  }
  fs.writeFileSync(p, JSON.stringify(j, null, 2) + "\n", "utf8");
  console.log("patched", file);
}

console.log("done");
