import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const itemsDir = path.join(root, "src", "packs", "homebrew-items");

const PROF = {
  key: "MartialProficiency",
  label: "猎杀武装熟练",
  kind: "attack",
  definition: ["item:id:{item|_id}"],
  value: 1,
  requiresInvestment: false,
};

const pub = {
  title: "猎杀对决 — 装备",
  authors: "Wang Homebrew / Hunt: Showdown",
  license: "ORC",
  remaster: true,
};
const pubM = { ...pub, title: "猎杀对决 — 医疗" };
const pubT = { ...pub, title: "猎杀对决 — 战术" };

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

const staminaFx = {
  _id: "whbHuntStamFx001",
  folder: "whbHntFldFx00001",
  name: "效果：耐力针 Stamina Shot",
  type: "effect",
  img: "modules/wang-pf2e-homebrew/assets/hunt/stamina-shot.png",
  system: {
    description: {
      value:
        "<p>耐力针发挥作用：你获得 @UUID[Compendium.pf2e.conditionitems.Item.nlCjDvLMf2EkV2dl]{迅捷}，持续 1 分钟。</p>\n<p><strong>限制</strong> 由此获得的额外动作<strong>只能</strong>用于<strong>行走（Stride）</strong>或<strong>打击（Strike）</strong>。</p>\n<p>使用耐力针时应已移除 @UUID[Compendium.pf2e.conditionitems.Item.HL2l2VRSaQHu9lUw]{疲乏}（自动化会尝试清除）。</p>",
      gm: "<p>Quickened 1 分钟；额外动作限 Stride/Strike。疲乏在注射时清除。</p>",
    },
    rules: [
      {
        key: "GrantItem",
        uuid: "Compendium.pf2e.conditionitems.Item.nlCjDvLMf2EkV2dl",
        inMemoryOnly: true,
      },
      {
        key: "Note",
        selector: "all",
        title: "耐力针",
        text: "额外动作只能用于行走或打击。",
      },
    ],
    slug: "effect-stamina-shot",
    traits: {
      value: ["alchemical", "healing"],
      rarity: "uncommon",
      otherTags: ["hunt-showdown", "hunt-medical"],
    },
    publication: pubM,
    level: { value: 3 },
    duration: { value: 1, unit: "minutes", expiry: "turn-start", sustained: false },
    start: { value: 0, initiative: null },
    tokenIcon: { show: true },
    badge: null,
    context: null,
    unidentified: false,
  },
  flags: {
    "wang-pf2e-homebrew": {
      source: "hunt-showdown",
      pairedItem: "whbHuntStamShot1",
      removeFatigued: true,
      quickenedOnly: ["stride", "strike"],
    },
  },
};

const staminaShot = {
  _id: "whbHuntStamShot1",
  folder: "whbHntFldMed0001",
  name: "耐力针 Stamina Shot",
  type: "consumable",
  img: "modules/wang-pf2e-homebrew/assets/hunt/stamina-shot.png",
  system: {
    description: {
      value:
        "<p>提神针剂。注入后疲劳一扫而空，脚步与扳机都变得轻快——但那股劲只能用在跑路或开枪上。</p>\n<blockquote><p><strong>医疗 · STAMINA SHOT</strong> 清疲乏，换一分钟的迅捷冲刺/打击。</p></blockquote>\n<hr />\n<p><strong>启动</strong> <span class=\"action-glyph\">1</span>（操作）Interact；<strong>需求</strong> 一只空闲的手握持注射器</p>\n<p><strong>效果</strong> 立即移除 @UUID[Compendium.pf2e.conditionitems.Item.HL2l2VRSaQHu9lUw]{疲乏}。在接下来的 <strong>1 分钟</strong>内，你获得 @UUID[Compendium.pf2e.conditionitems.Item.nlCjDvLMf2EkV2dl]{迅捷}，但由此获得的额外动作<strong>只能</strong>用于「行走（Stride）」或「打击（Strike）」。</p>\n<p>@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntStamFx001]{效果：耐力针}</p>",
      gm: "<p>Stamina Shot。1 动作。清 Fatigued + Quickened 1 分钟（额外动作限 Stride/Strike）。自动化见 hunt-showdown-automation。</p>",
    },
    rules: [],
    slug: "stamina-shot",
    traits: {
      value: ["alchemical", "consumable", "elixir", "healing"],
      rarity: "uncommon",
      otherTags: ["hunt-showdown", "hunt-medical"],
    },
    publication: pubM,
    level: { value: 3 },
    quantity: 1,
    baseItem: null,
    bulk: { value: 0.1 },
    price: { value: { gp: 25 } },
    equipped: { carryType: "worn", invested: null },
    containerId: null,
    size: "med",
    identification: {
      status: "identified",
      unidentified: {
        name: "提神针剂",
        img: "systems/pf2e/icons/unidentified_item_icons/other-consumables.webp",
        data: { description: { value: "<p>装着琥珀色液体的注射器。</p>" } },
      },
      misidentified: {},
    },
    category: "other",
    uses: { value: 1, max: 1, autoDestroy: true },
    usage: { value: "held-in-one-hand" },
    stackGroup: null,
  },
  flags: {
    "wang-pf2e-homebrew": {
      source: "hunt-showdown",
      huntCategory: "medical",
      huntSlot: 1,
      enName: "Stamina Shot",
      grantsEffect: "whbHuntStamFx001",
    },
  },
};

const knife = {
  _id: "whbHuntKnife0001",
  folder: "whbHntFldWpn0001",
  name: "小刀 Knife",
  type: "weapon",
  img: "modules/wang-pf2e-homebrew/assets/hunt/knife.png",
  system: {
    description: {
      value:
        "<p>猎人工具带上的短刃。安静、便宜，贴身时往往比枪声更管用。</p>\n<blockquote><p><strong>兵器之书 · KNIFE</strong>（另见刀具、工具）沼地里人人都有一把刀：剥皮、开路、割绳——以及结束近战。</p></blockquote>\n<p><strong>熟练</strong> 持用期间视为受训。</p>\n<hr />\n<p><strong>类别</strong> 简易刀剑；负载 L；单手</p>\n<p><strong>伤害</strong> 1d4 挥砍；特质：敏捷、灵巧、致命 d8、thrown-10</p>\n<hr />\n<p><strong>工具刃</strong> 用此武器进行撬锁/割绳/剥皮等探索动作时，相关技巧检定 +1 环境（GM）。</p>",
      gm: "<p>Hunt Knife。1d4、agile/finesse/deadly-d8/thrown-10。工具用。</p>",
    },
    rules: [
      { ...PROF },
      {
        key: "Note",
        selector: "skill-check",
        title: "工具刃",
        text: "撬锁/割绳/剥皮等：+1 环境（GM）。",
        predicate: ["item:id:{item|_id}"],
      },
    ],
    slug: "hunt-knife",
    traits: {
      value: ["agile", "finesse", "deadly-d8", "thrown-10"],
      rarity: "common",
      otherTags: ["hunt-showdown", "hunt-tool", "hunt-weapon"],
    },
    publication: pub,
    level: { value: 0 },
    quantity: 1,
    baseItem: "knife",
    bulk: { value: 0.1 },
    hp: { value: 0, max: 0 },
    hardness: 0,
    price: { value: { gp: 1 } },
    equipped: { carryType: "worn", handsHeld: 0 },
    containerId: null,
    size: "med",
    material: { type: null, grade: null },
    identification: {
      status: "identified",
      unidentified: {
        name: "短刀",
        img: "systems/pf2e/icons/unidentified_item_icons/weapons.webp",
        data: { description: { value: "<p>一把旧刀。</p>" } },
      },
    },
    usage: { value: "held-in-one-hand" },
    category: "simple",
    group: "knife",
    bonus: { value: 0 },
    bonusDamage: { value: 0 },
    damage: { dice: 1, die: "d4", damageType: "slashing", persistent: null },
    splashDamage: { value: 0 },
    range: 10,
    reload: { value: "-" },
    grade: null,
    runes: { potency: 0, striking: 0, property: [] },
    specific: null,
    subitems: [],
  },
  flags: {
    "wang-pf2e-homebrew": {
      source: "hunt-showdown",
      huntCategory: "weapon",
      huntSlots: 1,
      enName: "Knife",
      baseWeapon: "knife",
    },
  },
};

const dagger = {
  _id: "whbHuntDagger001",
  folder: "whbHntFldWpn0001",
  name: "匕首 Dagger",
  type: "weapon",
  img: "modules/wang-pf2e-homebrew/assets/hunt/dagger.png",
  system: {
    description: {
      value:
        "<p>比工具小刀更锋利的战斗匕首。可刺可投，专为捅穿软肋而磨。</p>\n<blockquote><p><strong>兵器之书 · DAGGER</strong> 短刃长恨；近身一捅，或亮银一线飞过去。</p></blockquote>\n<p><strong>熟练</strong> 持用期间视为受训。</p>\n<hr />\n<p><strong>类别</strong> 简易刀剑；负载 L；单手</p>\n<p><strong>伤害</strong> 1d4 穿刺；特质：敏捷、灵巧、多用 S、致命 d6、thrown-10</p>\n<hr />\n<p><strong>暗刺</strong> 若目标对你措手不及，此武器伤害额外 @Damage[1d4[precision]]（每目标每轮一次，打开开关）。</p>",
      gm: "<p>Hunt/PF2e 匕首。1d4 P、versatile-s、thrown-10。暗刺对措手不及 +1d4 精密。</p>",
    },
    rules: [
      { ...PROF },
      {
        key: "RollOption",
        domain: "damage",
        option: "hunt-dagger-ambush",
        toggleable: true,
        placement: "actions",
        label: "匕首 — 暗刺（目标措手不及）",
      },
      {
        key: "DamageDice",
        selector: "damage",
        label: "暗刺",
        diceNumber: 1,
        dieSize: "d4",
        damageType: "precision",
        predicate: ["hunt-dagger-ambush", "item:id:{item|_id}"],
      },
    ],
    slug: "hunt-dagger",
    traits: {
      value: ["agile", "finesse", "versatile-s", "deadly-d6", "thrown-10"],
      rarity: "common",
      otherTags: ["hunt-showdown", "hunt-weapon"],
    },
    publication: pub,
    level: { value: 0 },
    quantity: 1,
    baseItem: "dagger",
    bulk: { value: 0.1 },
    hp: { value: 0, max: 0 },
    hardness: 0,
    price: { value: { gp: 2 } },
    equipped: { carryType: "worn", handsHeld: 0 },
    containerId: null,
    size: "med",
    material: { type: null, grade: null },
    identification: {
      status: "identified",
      unidentified: {
        name: "匕首",
        img: "systems/pf2e/icons/unidentified_item_icons/weapons.webp",
        data: { description: { value: "<p>一把短匕。</p>" } },
      },
    },
    usage: { value: "held-in-one-hand" },
    category: "simple",
    group: "knife",
    bonus: { value: 0 },
    bonusDamage: { value: 0 },
    damage: { dice: 1, die: "d4", damageType: "piercing", persistent: null },
    splashDamage: { value: 0 },
    range: 10,
    reload: { value: "-" },
    grade: null,
    runes: { potency: 0, striking: 0, property: [] },
    specific: null,
    subitems: [],
  },
  flags: {
    "wang-pf2e-homebrew": {
      source: "hunt-showdown",
      huntCategory: "weapon",
      huntSlots: 1,
      enName: "Dagger",
      baseWeapon: "dagger",
    },
  },
};

const fusee = {
  _id: "whbHuntFusee0001",
  folder: "whbHntFldTact001",
  name: "照明棒 Fusees",
  type: "consumable",
  img: "modules/wang-pf2e-homebrew/assets/hunt/fusee.png",
  system: {
    description: {
      value:
        "<p>化学照明棒（Fusees）。划燃后发出刺眼红光，既照路也能当信号——偶尔还能把东西点着。</p>\n<blockquote><p><strong>工具 · FUSEES</strong> 沼地里的人造月亮。</p></blockquote>\n<hr />\n<p><strong>启动</strong> <span class=\"action-glyph\">1</span>（操作）Interact：划燃一根。你或落点获得<strong>明亮光照 20 尺</strong>与微光再 20 尺，持续 <strong>10 分钟</strong>（或至熄灭）。</p>\n<p><strong>投掷</strong> 可投掷到 30 尺内一点（仍耗 Interact），光照以落点为中心。</p>\n<p><strong>引火</strong> 可点燃邻接易燃物/火场（GM）；对已有猎杀灼烬的目标不额外叠层。</p>\n<p>一包默认 3 根。</p>",
      gm: "<p>Hunt Fusees。1 动作点燃：亮光 20/微光 20，10 分钟。可投掷。quantity 3。</p>",
    },
    rules: [],
    slug: "hunt-fusees",
    traits: {
      value: ["consumable", "fire"],
      rarity: "common",
      otherTags: ["hunt-showdown", "hunt-tool"],
    },
    publication: pubT,
    level: { value: 0 },
    quantity: 3,
    baseItem: null,
    bulk: { value: 0.1 },
    price: { value: { gp: 1 } },
    equipped: { carryType: "worn", invested: null },
    containerId: null,
    size: "med",
    identification: {
      status: "identified",
      unidentified: {
        name: "红棒",
        img: "systems/pf2e/icons/unidentified_item_icons/other-consumables.webp",
        data: { description: { value: "<p>几根红纸包着的棒。</p>" } },
      },
      misidentified: {},
    },
    category: "other",
    uses: { value: 1, max: 1, autoDestroy: false },
    usage: { value: "held-in-one-hand" },
    stackGroup: null,
  },
  flags: {
    "wang-pf2e-homebrew": {
      source: "hunt-showdown",
      huntCategory: "tool",
      huntSlots: 1,
      enName: "Fusees",
      light: { bright: 20, dim: 40, durationMinutes: 10 },
    },
  },
};

const fuseeLightFx = {
  _id: "whbHuntFuseeFx01",
  folder: "whbHntFldFx00001",
  name: "效果：照明棒光照",
  type: "effect",
  img: "modules/wang-pf2e-homebrew/assets/hunt/fusee.png",
  system: {
    description: {
      value: "<p>照明棒燃烧中：明亮光照 20 尺，微光再 20 尺（共 40 尺微光边缘）。</p>",
      gm: "<p>Token 光照请 GM 开灯或用 Light 工具；此效果作标记。</p>",
    },
    rules: [
      {
        key: "TokenLight",
        value: {
          bright: 20,
          dim: 40,
          color: "#ff6633",
          alpha: 0.4,
          animation: { type: "torch", speed: 2, intensity: 3 },
        },
      },
    ],
    slug: "effect-fusee-light",
    traits: { value: ["fire"], rarity: "common", otherTags: ["hunt-showdown"] },
    publication: pubT,
    level: { value: 0 },
    duration: { value: 10, unit: "minutes", expiry: "turn-start", sustained: false },
    start: { value: 0, initiative: null },
    tokenIcon: { show: true },
    badge: null,
    context: null,
    unidentified: false,
  },
  flags: { "wang-pf2e-homebrew": { source: "hunt-showdown", pairedItem: "whbHuntFusee0001" } },
};

const romero = {
  _id: "whbHuntRomero771",
  folder: "whbHntFldWpn0001",
  name: "Romero 77 单发霰弹枪",
  type: "weapon",
  img: "modules/wang-pf2e-homebrew/assets/hunt/romero-77.png",
  system: {
    description: {
      value:
        "<p>美制单管折开式霰弹枪。伤害高、便宜、弹道紧——沼地猎人的入门与保命搭档。</p>\n<blockquote><p><strong>兵器之书 · ROMERO 77</strong>（另见霰弹枪）单管、无弹仓，折开装填。结构朴素却致命：近距一响，往往就够了。</p></blockquote>\n<p><strong>熟练</strong> 持用期间视为受训。</p>\n<hr />\n<p><strong>类别</strong> 军用火器；负载 2；双手；射程增量 <strong>40 尺</strong>；装填 1；容量 1</p>\n<p><strong>伤害</strong> 1d10 穿刺；特质：震荡、scatter、fatal-d10</p>\n<p><strong>弹药</strong> 霰弹；特殊：龙息弹等（GM）。</p>\n<hr />\n<p><strong>紧束喷口</strong> 在第一个射程增量内，此武器攻击 +1 环境（单管 choke 的精度）。</p>\n<p><strong>折开装填</strong> 装填为 Interact；装填后本回合若未移动，下次打击忽略隐蔽持平（打开开关）。</p>",
      gm: "<p>Romero 77。单发 1d10 fatal-d10 scatter、40ft。首增量 +1；装填后未移动可无视隐蔽。</p>",
    },
    rules: [
      { ...PROF },
      {
        key: "RollOption",
        domain: "attack",
        option: "hunt-romero-close",
        toggleable: true,
        placement: "actions",
        label: "Romero 77 — 第一射程增量内",
      },
      {
        key: "FlatModifier",
        selector: "strike-attack-roll",
        type: "circumstance",
        value: 1,
        label: "紧束喷口",
        predicate: ["hunt-romero-close", "item:id:{item|_id}"],
        hideIfDisabled: true,
      },
      {
        key: "RollOption",
        domain: "attack",
        option: "hunt-romero-braced",
        toggleable: true,
        placement: "actions",
        label: "Romero 77 — 装填后未移动",
      },
      {
        key: "Note",
        selector: "strike-attack-roll",
        title: "折开装填",
        text: "装填后未移动：忽略隐蔽持平。",
        predicate: ["hunt-romero-braced", "item:id:{item|_id}"],
      },
    ],
    slug: "romero-77",
    traits: {
      value: ["concussive", "scatter", "fatal-d10"],
      rarity: "common",
      otherTags: ["hunt-showdown", "hunt-weapon"],
    },
    publication: pub,
    level: { value: 2 },
    quantity: 1,
    baseItem: null,
    bulk: { value: 2 },
    hp: { value: 0, max: 0 },
    hardness: 0,
    price: { value: { gp: 8 } },
    equipped: { carryType: "worn", handsHeld: 0 },
    containerId: null,
    size: "med",
    material: { type: null, grade: null },
    identification: {
      status: "identified",
      unidentified: {
        name: "单管霰弹枪",
        img: "systems/pf2e/icons/unidentified_item_icons/weapons.webp",
        data: { description: { value: "<p>折开式单管散弹枪。</p>" } },
      },
    },
    usage: { value: "held-in-two-hands" },
    category: "martial",
    group: "firearm",
    bonus: { value: 0 },
    bonusDamage: { value: 0 },
    damage: { dice: 1, die: "d10", damageType: "piercing", persistent: null },
    splashDamage: { value: 0 },
    range: 40,
    expend: 1,
    ammo: { baseType: "rounds", builtIn: false, capacity: 1 },
    reload: { value: "1" },
    grade: null,
    runes: { potency: 0, striking: 0, property: [] },
    specific: null,
    subitems: [],
  },
  flags: {
    "wang-pf2e-homebrew": {
      source: "hunt-showdown",
      huntCategory: "weapon",
      huntSlots: 3,
      enName: "Romero 77",
      wikiIcon: "Weapon_Romero_77.png",
      baseWeapon: "romero-77",
    },
  },
};

const items = [staminaFx, staminaShot, knife, dagger, fusee, fuseeLightFx, romero];
for (const it of items) {
  assertId(it._id, it.name);
  fs.writeFileSync(path.join(itemsDir, `${it._id}.json`), JSON.stringify(it, null, 2) + "\n");
}

// 补全投掷斧 _id
const axePath = path.join(itemsDir, "whbHuntThrAxe001.json");
const axe = JSON.parse(fs.readFileSync(axePath, "utf8"));
axe._id = "whbHuntThrAxe001";
if (!axe.flags) axe.flags = {};
axe.flags["wang-pf2e-homebrew"] = {
  ...(axe.flags["wang-pf2e-homebrew"] || {}),
  source: "hunt-showdown",
  huntCategory: "weapon",
  huntSlots: 1,
  enName: "Throwing Axes",
  baseWeapon: "throwing-axes",
};
fs.writeFileSync(axePath, JSON.stringify(axe, null, 2) + "\n");
console.log("patched throwing axes _id");

const mod = readMod();
mod.version = "1.26.0";
fs.writeFileSync(path.join(root, "module.json"), JSON.stringify(mod, null, 2) + "\n");
console.log("wrote", items.length, "items; version", mod.version);
