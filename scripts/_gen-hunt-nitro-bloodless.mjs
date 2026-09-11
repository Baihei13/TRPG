import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assets = path.join(root, "assets", "hunt");
const itemsDir = path.join(root, "src", "packs", "homebrew-items");

function assertId(id, label) {
  if (!/^[a-zA-Z0-9]{16}$/.test(id)) throw new Error(`bad id ${label}: ${id} (${id.length})`);
}
function readMod() {
  const raw = fs.readFileSync(path.join(root, "module.json"));
  const text =
    raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf
      ? raw.slice(3).toString("utf8")
      : raw.toString("utf8");
  return JSON.parse(text);
}
function ensureAsset(name, fbs) {
  const dest = path.join(assets, name);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 200) {
    return `modules/wang-pf2e-homebrew/assets/hunt/${name}`;
  }
  for (const fb of fbs) {
    const src = path.join(assets, fb);
    if (fs.existsSync(src) && fs.statSync(src).size > 200) {
      fs.copyFileSync(src, dest);
      console.log("asset", name, "←", fb);
      return `modules/wang-pf2e-homebrew/assets/hunt/${name}`;
    }
  }
  return "systems/pf2e/icons/default-icons/weapon.svg";
}

const pubF = {
  title: "猎杀对决 — 专长",
  authors: "Wang Homebrew / Hunt: Showdown",
  license: "ORC",
  remaster: true,
};
const pub = { ...pubF, title: "猎杀对决 — 装备" };
const PROF = {
  key: "MartialProficiency",
  label: "猎杀武装熟练",
  kind: "attack",
  definition: ["item:id:{item|_id}"],
  value: 1,
  requiresInvestment: false,
};

const imgBlood = ensureAsset("trait-bloodless.png", ["trait-doctor.png", "trait-bulwark.png"]);
const imgNitro = ensureAsset("nitro-express.png", ["mosin-avtomat.png", "maynard-silencer.png"]);

const bloodless = {
  _id: "whbHuntFtBlood01",
  folder: "whbHntFldFeat001",
  name: "专长：无血 Bloodless",
  type: "feat",
  img: imgBlood,
  system: {
    description: {
      value:
        "<p>流血不会从轻度升级为中度或重度。</p>\n<p><strong>猎杀特性花费</strong> 3 点（普通）</p>\n<hr />\n<p>你免疫<strong>持续流血伤害的升级</strong>（流血骰不会从 1d4 升为 1d6 或更高；若被施加更高骰，自动化会压回 d4）。</p>\n<p>你为结束 @UUID[Compendium.pf2e.conditionitems.Item.lDVqvLKA6eF3Df60]{持续流血} 所做的强韧豁免获得 <strong>+2 环境加值</strong>。</p>",
      gm: "<p>Hunt Bloodless。3 点。压流血骰≤d4；结束流血强韧 +2。自动化见 hunt-showdown-automation。</p>",
    },
    rules: [
      {
        key: "FlatModifier",
        selector: "saving-throw",
        type: "circumstance",
        value: 2,
        label: "无血",
        predicate: ["check:flat:recover-from-persistent-bleed", "damage:type:bleed"],
      },
      {
        key: "FlatModifier",
        selector: "fortitude",
        type: "circumstance",
        value: 2,
        label: "无血（结束流血）",
        predicate: ["hunt-bloodless-bleed-save"],
        hideIfDisabled: true,
      },
      {
        key: "RollOption",
        option: "hunt-bloodless-bleed-save",
        toggleable: true,
        placement: "actions",
        label: "无血 — 结束流血豁免",
      },
      {
        key: "Note",
        selector: "saving-throw",
        title: "无血",
        text: "结束流血时强韧 +2；流血骰不会升级超过 d4。",
      },
    ],
    slug: "hunt-feat-bloodless",
    traits: { value: ["general"], rarity: "uncommon", otherTags: ["hunt-showdown", "hunt-trait"] },
    publication: pubF,
    level: { value: 1 },
    category: "general",
    actionType: { value: "passive" },
    actions: { value: null },
    prerequisites: { value: [] },
    location: null,
  },
  flags: {
    "wang-pf2e-homebrew": {
      source: "hunt-showdown",
      huntTrait: true,
      huntTraitCost: 3,
      huntTraitCategory: "defensive",
    },
  },
};

const nitro = {
  _id: "whbHuntNitroEx01",
  folder: "whbHntFldWpn0001",
  name: "Nitro Express 步枪",
  type: "weapon",
  img: imgNitro,
  system: {
    description: {
      value:
        "<p>大口径狩猎步枪，无视大部分护甲。</p>\n<blockquote><p><strong>兵器之书 · NITRO EXPRESS</strong> 一响撼沼；邻接亦遭气浪。</p></blockquote>\n<p><strong>熟练</strong> 持用期间视为受训。</p>\n<hr />\n<p><strong>类别</strong> 进阶火器；负载 2；双手；射程增量 <strong>150 尺</strong>；装填 2；容量 1（5 格）</p>\n<p><strong>伤害</strong> 1d12 穿刺；特质：致命 d12、助力、后坐力、震荡</p>\n<hr />\n<p><strong>高爆冲击</strong> 命中时，目标及所有邻接生物须通过强韧豁免（<strong>DC = 本次攻击检定结果</strong>），失败则被推离 5 尺并 @UUID[Compendium.pf2e.conditionitems.Item.i3OJUmM1V6L8Lkbg]{倒地}。即使未命中，目标邻接方格仍受到 @Damage[1d4[bludgeoning]]{1d4 溅射钝击}（自动化）。</p>",
      gm: "<p>Nitro Express。进阶 1d12 fatal-d12、kickback、propulsive、concussive、150ft reload 2。命中：邻接+目标 Fort DC=攻击总值，失败推 5+倒地；未命中仍溅射邻接 1d4 B。</p>",
    },
    rules: [
      { ...PROF },
      {
        key: "Note",
        selector: "strike-attack-roll",
        title: "高爆冲击",
        text: "命中：目标与邻接强韧（DC=攻击结果），失败推离 5 尺并倒地。未命中：邻接仍受 1d4 溅射钝击。",
        predicate: ["item:id:{item|_id}"],
      },
    ],
    slug: "nitro-express",
    traits: {
      value: ["concussive", "fatal-d12", "kickback", "propulsive"],
      rarity: "uncommon",
      otherTags: ["hunt-showdown", "hunt-weapon"],
    },
    publication: pub,
    level: { value: 5 },
    quantity: 1,
    baseItem: null,
    bulk: { value: 2 },
    hp: { value: 0, max: 0 },
    hardness: 0,
    price: { value: { gp: 100 } },
    equipped: { carryType: "worn", handsHeld: 0 },
    containerId: null,
    size: "med",
    material: { type: null, grade: null },
    identification: {
      status: "identified",
      unidentified: {
        name: "大口径步枪",
        img: "systems/pf2e/icons/unidentified_item_icons/weapons.webp",
        data: { description: { value: "<p>枪管粗得吓人的双管/单发猎枪。</p>" } },
      },
    },
    usage: { value: "held-in-two-hands" },
    category: "advanced",
    group: "firearm",
    bonus: { value: 0 },
    bonusDamage: { value: 0 },
    damage: { dice: 1, die: "d12", damageType: "piercing", persistent: null },
    splashDamage: { value: 0 },
    range: 150,
    expend: 1,
    ammo: { baseType: "rounds", builtIn: false, capacity: 1 },
    reload: { value: "2" },
    grade: null,
    runes: { potency: 0, striking: 0, property: [] },
    specific: null,
    subitems: [],
  },
  flags: {
    "wang-pf2e-homebrew": {
      source: "hunt-showdown",
      huntCategory: "weapon",
      huntSlots: 5,
      enName: "Nitro Express",
      highExplosiveImpact: true,
    },
  },
};

for (const it of [bloodless, nitro]) {
  assertId(it._id, it.name);
  fs.writeFileSync(path.join(itemsDir, `${it._id}.json`), JSON.stringify(it, null, 2) + "\n");
}

// Doctor cost → 9（对齐完整文档）+ 写明医疗包
const docPath = path.join(itemsDir, "whbHuntFtDoc0001.json");
const doc = JSON.parse(fs.readFileSync(docPath, "utf8"));
doc.system.description.value =
  "<p>急救包治疗效果翻倍。</p>\n<p><strong>猎杀特性花费</strong> 9 点（普通）</p>\n<hr />\n<p>当你使用<strong>医疗工具 / 医疗针剂</strong>（如 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntFirstAid1]{医疗包}、@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntVital0001]{活力针}、@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntRegen0001]{再生针} 等）恢复生命值时，恢复量<strong>加倍</strong>（自动化）。</p>\n<p>亦可打开开关「医生 — 强制下次医疗加倍」用于其它治疗来源。</p>";
doc.system.description.gm = "<p>Hunt Doctor。9 点。医疗包/针剂自动 ×2；开关用于其它治疗。</p>";
doc.flags["wang-pf2e-homebrew"].huntTraitCost = 9;
fs.writeFileSync(docPath, JSON.stringify(doc, null, 2) + "\n");

// 警示=警报：补中文别名
const alertPath = path.join(itemsDir, "whbHuntAlrtTM001.json");
const alert = JSON.parse(fs.readFileSync(alertPath, "utf8"));
alert.name = "警示拌雷 / 警报拌雷 Alert Trip Mine";
if (!alert.system.description.value.includes("警示绊雷")) {
  alert.system.description.value = alert.system.description.value.replace(
    "<p>便携绊线雷",
    "<p>（亦称<strong>警示绊雷</strong>）便携绊线雷"
  );
}
fs.writeFileSync(alertPath, JSON.stringify(alert, null, 2) + "\n");

// 毒气拌雷文档为 1d6：同步物品说明中的 1d4→说明保留危境，改描述
const poisPath = path.join(itemsDir, "whbHuntPoisTM001.json");
const pois = JSON.parse(fs.readFileSync(poisPath, "utf8"));
pois.system.description.value = pois.system.description.value.replace(
  /@Damage\[1d4\[poison\]\]/g,
  "@Damage[1d6[poison]]"
);
pois.system.description.gm = "<p>Hunt Poison Trip Mine。5 尺毒云 3 轮：每轮 1d6 毒素 + 猎杀中毒。危境 whbHuntHzPois001。布置自动化。</p>";
if (pois.system.damage) pois.system.damage.formula = "1d6";
fs.writeFileSync(poisPath, JSON.stringify(pois, null, 2) + "\n");

const poisFx = path.join(itemsDir, "whbHuntPoisFx001.json");
if (fs.existsSync(poisFx)) {
  const fx = JSON.parse(fs.readFileSync(poisFx, "utf8"));
  fx.system.description.value = fx.system.description.value.replace(
    /@Damage\[1d4\[poison\]\]/g,
    "@Damage[1d6[poison]]"
  );
  fs.writeFileSync(poisFx, JSON.stringify(fx, null, 2) + "\n");
}

const mod = readMod();
mod.version = "1.28.0";
fs.writeFileSync(path.join(root, "module.json"), JSON.stringify(mod, null, 2) + "\n");
console.log("wrote bloodless + nitro; patched doctor/alert/poison; version", mod.version);
