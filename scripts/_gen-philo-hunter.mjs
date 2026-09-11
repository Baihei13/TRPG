import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assets = path.join(root, "assets", "hunt");
const itemsDir = path.join(root, "src", "packs", "homebrew-items");
const actorsDir = path.join(root, "src", "packs", "homebrew-actors");

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

function ensureAsset(name, fallbacks) {
  const dest = path.join(assets, name);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 200) return `modules/wang-pf2e-homebrew/assets/hunt/${name}`;
  for (const fb of fallbacks) {
    const src = path.join(assets, fb);
    if (fs.existsSync(src) && fs.statSync(src).size > 200) {
      fs.copyFileSync(src, dest);
      console.log("asset", name, "←", fb);
      return `modules/wang-pf2e-homebrew/assets/hunt/${name}`;
    }
  }
  return "systems/pf2e/icons/default-icons/feat.svg";
}

const pubF = {
  title: "猎杀对决 — 专长",
  authors: "Wang Homebrew / Hunt: Showdown",
  license: "ORC",
  remaster: true,
};
const pub = { ...pubF, title: "猎杀对决 — 装备" };
const pubM = { ...pubF, title: "猎杀对决 — 医疗" };
const pubT = { ...pubF, title: "猎杀对决 — 战术" };
const pubH = { ...pubF, title: "猎杀对决 — 猎人" };

const PROF = {
  key: "MartialProficiency",
  label: "猎杀武装熟练",
  kind: "attack",
  definition: ["item:id:{item|_id}"],
  value: 1,
  requiresInvestment: false,
};

const KATANA_PRED = {
  or: ["item:base:katana", "item:tag:jiuli-katana", "item:slug:hunt-katana", "item:slug:jiuli-katana-lesser", "item:slug:jiuli-katana-moderate", "item:slug:jiuli-katana-greater"],
};

const imgTrait = (file, fbs) => ensureAsset(file, fbs);
const imgAdr = imgTrait("trait-adrenaline.png", ["trait-dauntless.png", "trait-bulwark.png"]);
const imgGator = imgTrait("trait-gator-legs.png", ["trait-ambidextrous.png", "trait-bulwark.png"]);
const imgMart = imgTrait("trait-martialist.png", ["trait-vulture.png", "trait-bulwark.png"]);
const imgRes = imgTrait("trait-resilience.png", ["trait-doctor.png", "trait-bulwark.png"]);
const imgVig = imgTrait("trait-vigilant.png", ["trait-necromancer.png", "trait-bulwark.png"]);
const imgKnives = ensureAsset("throwing-knives.png", ["knife.png", "heavy-knife.png"]);
const imgSpy = ensureAsset("spyglass.png", ["fusee.png", "first-aid-kit.png"]);
const imgAid = "modules/wang-pf2e-homebrew/assets/hunt/first-aid-kit.png";
const imgWire = "modules/wang-pf2e-homebrew/assets/hunt/concertina-trip-mine.png";
const imgKatana = ensureAsset("katana.png", ["machete.png", "cavalry-saber.png"]);
const imgPhilo = ensureAsset("philo.png", ["dorothy.png", "jonathan-redhill.png"]);

function featBase({ id, name, slug, img, cost, category, desc, gm, rules, actionType = "passive", actions = null }) {
  assertId(id, name);
  return {
    _id: id,
    folder: "whbHntFldFeat001",
    name,
    type: "feat",
    img,
    system: {
      description: { value: desc, gm },
      rules,
      slug,
      traits: { value: ["general"], rarity: "uncommon", otherTags: ["hunt-showdown", "hunt-trait"] },
      publication: pubF,
      level: { value: 1 },
      category: "general",
      actionType: { value: actionType },
      actions: { value: actions },
      prerequisites: { value: [] },
      location: null,
    },
    flags: {
      "wang-pf2e-homebrew": {
        source: "hunt-showdown",
        huntTrait: true,
        huntTraitCost: cost,
        huntTraitCategory: category,
      },
    },
  };
}

const adrenaline = featBase({
  id: "whbHuntFtAdrn001",
  name: "专长：肾上腺素 Adrenaline",
  slug: "hunt-feat-adrenaline",
  img: imgAdr,
  cost: 1,
  category: "defensive",
  actionType: "reaction",
  desc:
    "<p>濒死时硬挤出最后一口气。</p>\n<p><strong>猎杀特性花费</strong> 1 点（普通）</p>\n<hr />\n<p><strong>肾上腺素</strong> <span class=\"action-glyph\">R</span>（反应）</p>\n<p><strong>触发</strong> 你获得 @UUID[Compendium.pf2e.conditionitems.Item.yZRUzMqrMmfLu0V1]{濒死} 状态</p>\n<p><strong>效果</strong> 你立刻进行一次<strong>快步（Step）</strong>，并获得等同于你<strong>等级</strong>的临时生命值，持续 1 分钟。</p>",
  gm: "<p>Hunt Adrenaline。1 点。濒死时反应：快步 + 等级临时 HP（1 分钟）。自动化见 hunt-showdown-automation。</p>",
  rules: [
    {
      key: "Note",
      selector: "all",
      title: "肾上腺素",
      text: "获得濒死时可反应：快步，并获得等于等级的临时生命值（1 分钟）。",
    },
  ],
});

const gator = featBase({
  id: "whbHuntFtGator01",
  name: "专长：鳄鱼腿 Gator Legs",
  slug: "hunt-feat-gator-legs",
  img: imgGator,
  cost: 3,
  category: "exploration",
  desc:
    "<p>沼地与深水像自家门廊。</p>\n<p><strong>猎杀特性花费</strong> 3 点（普通）</p>\n<hr />\n<p>你在<strong>困难地形</strong>中移动时，速度<strong>不受减半影响</strong>（仍受更强困难地形等其它规则约束，GM）。</p>\n<p>你在<strong>水中</strong>进行的 @UUID[Compendium.pf2e.actionspf2e.Item.VMozDqMMuK5kpoX4]{隐秘} 检定获得 <strong>+2 环境加值</strong>（打开开关）。</p>",
  gm: "<p>Hunt Gator Legs。3 点。忽略困难地形减半；水中隐秘 +2（开关）。</p>",
  rules: [
    {
      key: "RollOption",
      option: "hunt-gator-water",
      toggleable: true,
      placement: "actions",
      label: "鳄鱼腿 — 身处水中",
    },
    {
      key: "FlatModifier",
      selector: "stealth",
      type: "circumstance",
      value: 2,
      label: "鳄鱼腿",
      predicate: ["hunt-gator-water"],
      hideIfDisabled: true,
    },
    {
      key: "Note",
      selector: "speed",
      title: "鳄鱼腿",
      text: "困难地形中移动速度不受减半影响。",
    },
  ],
});

const martialist = featBase({
  id: "whbHuntFtMart001",
  name: "专长：武术家 Martialist",
  slug: "hunt-feat-martialist",
  img: imgMart,
  cost: 2,
  category: "offensive",
  actionType: "action",
  actions: 1,
  desc:
    "<p>允许太刀居合，造成额外伤害。</p>\n<p><strong>猎杀特性花费</strong> 2 点（普通）</p>\n<hr />\n<p><strong>居合架势</strong> <span class=\"action-glyph\">1</span>（操作）</p>\n<p><strong>需求</strong> 你持用<strong>武士刀</strong>，或持用视为武士刀的刀剑（含 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbJiuliLsr00001]{妖刀·隐里切} 各档）</p>\n<p><strong>效果</strong> 进入居合架势（施加 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntIaiFx0001]{效果：居合架势}）。你的下一次符合条件的打击额外造成 @Damage[1d6[precision]]{1d6 精准伤害}。若目标对你<strong>未察觉</strong>，该次攻击在命中时视为<strong>重击</strong>（打开效果上的开关提示 GM）。</p>\n<p><em>菲洛裁定：其妖刀按武士刀结算，可吃本专长的居合。</em></p>",
  gm: "<p>Hunt Martialist。2 点。1 动作居合；下一次武士刀/妖刀打击 +1d6 精准。未察觉则命中即重击（手裁/开关）。</p>",
  rules: [
    {
      key: "Note",
      selector: "strike-damage",
      title: "武术家 · 居合",
      text: "可花 1 动作进入居合：下一次武士刀/妖刀打击 +1d6 精准。",
      predicate: [KATANA_PRED],
    },
  ],
});

const resilience = featBase({
  id: "whbHuntFtResil01",
  name: "专长：韧性 Resilience",
  slug: "hunt-feat-resilience",
  img: imgRes,
  cost: 3,
  category: "defensive",
  desc:
    "<p>被救起时恢复至一半生命，而非苟延残喘。</p>\n<p><strong>猎杀特性花费</strong> 3 点（普通）</p>\n<hr />\n<p>当你从 @UUID[Compendium.pf2e.conditionitems.Item.yZRUzMqrMmfLu0V1]{濒死} 状态被救起（濒死被移除且你仍存活）时，你的生命值恢复至<strong>最大生命值的一半</strong>（向上取整），而非通常的 1 点（若治疗量更高则取高）。</p>",
  gm: "<p>Hunt Resilience。3 点。脱离濒死时 HP→一半上限。自动化见 hunt-showdown-automation。</p>",
  rules: [
    {
      key: "Note",
      selector: "healing-received",
      title: "韧性",
      text: "从濒死被救起时，生命值至少恢复至上限一半。",
    },
  ],
});

const vigilant = featBase({
  id: "whbHuntFtVigil01",
  name: "专长：警戒 Vigilant",
  slug: "hunt-feat-vigilant",
  img: imgVig,
  cost: 1,
  category: "exploration",
  desc:
    "<p>暗视中高亮附近陷阱与甲虫。</p>\n<p><strong>猎杀特性花费</strong> 1 点（普通）</p>\n<hr />\n<p>你可以侦察到 <strong>30 尺</strong>内的陷阱与埋伏，即使它们处于隐蔽——对相关 @UUID[Compendium.pf2e.actionspf2e.Item.BlACk2YbfTKJFUBY]{寻求} / 察觉检定获得 <strong>+2 环境加值</strong>（对抗陷阱、拌索、埋伏，打开开关）。</p>",
  gm: "<p>Hunt Vigilant。1 点。30 尺感知陷阱/埋伏；Seek vs 陷阱 +2（开关）。</p>",
  rules: [
    {
      key: "RollOption",
      option: "hunt-vigilant-traps",
      toggleable: true,
      placement: "actions",
      label: "警戒 — 侦测陷阱/埋伏",
    },
    {
      key: "FlatModifier",
      selector: ["perception", "skill-check"],
      type: "circumstance",
      value: 2,
      label: "警戒",
      predicate: ["hunt-vigilant-traps"],
      hideIfDisabled: true,
    },
  ],
});

const iaiFx = {
  _id: "whbHuntIaiFx0001",
  folder: "whbHntFldFx00001",
  name: "效果：居合架势",
  type: "effect",
  img: imgMart,
  system: {
    description: {
      value:
        "<p>你处于居合架势。下一次以<strong>武士刀</strong>或<strong>妖刀·隐里切</strong>进行的打击额外造成 1d6 精准伤害；结算后本效果移除。</p>\n<p>若目标对你<strong>未察觉</strong>，打开开关：该次命中视为重击（GM）。</p>",
      gm: "<p>Martialist 居合。+1d6 precision on next katana/jiuli strike；未察觉重击手裁。</p>",
    },
    rules: [
      {
        key: "RollOption",
        domain: "attack",
        option: "hunt-iai-unnoticed",
        toggleable: true,
        placement: "actions",
        label: "居合 — 目标未察觉（命中即重击）",
      },
      {
        key: "DamageDice",
        selector: "strike-damage",
        label: "居合斩",
        diceNumber: 1,
        dieSize: "d6",
        damageType: "precision",
        predicate: [KATANA_PRED],
      },
      {
        key: "Note",
        selector: "strike-attack-roll",
        title: "居合斩",
        text: "目标未察觉时：命中视为重击。",
        predicate: ["hunt-iai-unnoticed", KATANA_PRED],
      },
      {
        key: "Note",
        selector: "strike-damage",
        title: "居合斩",
        text: "额外 1d6 精准；打击后请移除本效果。",
        predicate: [KATANA_PRED],
      },
    ],
    slug: "effect-hunt-iai",
    traits: { value: [], rarity: "uncommon", otherTags: ["hunt-showdown"] },
    publication: pubF,
    level: { value: 1 },
    duration: { value: 1, unit: "rounds", expiry: "turn-end", sustained: false },
    start: { value: 0, initiative: null },
    tokenIcon: { show: true },
    badge: null,
    context: null,
    unidentified: false,
  },
  flags: {
    "wang-pf2e-homebrew": {
      source: "hunt-showdown",
      pairedFeat: "whbHuntFtMart001",
      removeAfterStrike: true,
    },
  },
};

const throwingKnives = {
  _id: "whbHuntThrKniv01",
  folder: "whbHntFldWpn0001",
  name: "投掷小刀 Throwing Knives",
  type: "weapon",
  img: imgKnives,
  system: {
    description: {
      value:
        "<p>可投掷的无声匕首。成组携带，专为闷声了结而磨。</p>\n<blockquote><p><strong>工具 · THROWING KNIVES</strong> 无声投掷，射程增量 20 尺。</p></blockquote>\n<p><strong>熟练</strong> 持用期间视为受训。</p>\n<hr />\n<p><strong>类别</strong> 简易刀剑；负载 L；单手；数量默认 3</p>\n<p><strong>伤害</strong> 1d4 穿刺；特质：敏捷、灵巧、致命 d8、thrown-20</p>\n<hr />\n<p><strong>无声投掷</strong> 以投掷方式打击时，该次攻击<strong>不产生听觉特质</strong>（仍可被看见）。近战捅刺不适用。</p>",
      gm: "<p>Hunt Throwing Knives。1d4 P、thrown-20、silent when thrown。quantity 3。</p>",
    },
    rules: [
      { ...PROF },
      {
        key: "Note",
        selector: "strike-attack-roll",
        title: "无声投掷",
        text: "投掷时不产生听觉信号。",
        predicate: ["item:id:{item|_id}", "item:ranged"],
      },
    ],
    slug: "hunt-throwing-knives",
    traits: {
      value: ["agile", "finesse", "deadly-d8", "thrown-20"],
      rarity: "common",
      otherTags: ["hunt-showdown", "hunt-tool", "hunt-weapon"],
    },
    publication: pub,
    level: { value: 0 },
    quantity: 3,
    baseItem: "dagger",
    bulk: { value: 0.1 },
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
        name: "一捆短刃",
        img: "systems/pf2e/icons/unidentified_item_icons/weapons.webp",
        data: { description: { value: "<p>几把磨得发亮的短刀。</p>" } },
      },
    },
    usage: { value: "held-in-one-hand" },
    category: "simple",
    group: "knife",
    bonus: { value: 0 },
    bonusDamage: { value: 0 },
    damage: { dice: 1, die: "d4", damageType: "piercing", persistent: null },
    splashDamage: { value: 0 },
    range: 20,
    reload: { value: "-" },
    grade: null,
    runes: { potency: 0, striking: 0, property: [] },
    specific: null,
    subitems: [],
  },
  flags: {
    "wang-pf2e-homebrew": {
      source: "hunt-showdown",
      huntCategory: "tool",
      huntSlots: 2,
      enName: "Throwing Knives",
    },
  },
};

const firstAid = {
  _id: "whbHuntFirstAid1",
  folder: "whbHntFldMed0001",
  name: "医疗包 First Aid Kit",
  type: "consumable",
  img: imgAid,
  system: {
    description: {
      value:
        "<p>可治疗各类创伤的医疗用品。</p>\n<blockquote><p><strong>医疗 · FIRST AID KIT</strong> 战场急救。</p></blockquote>\n<hr />\n<p><strong>启动</strong> <span class=\"action-glyph\">2</span>（操作）Interact；Manipulate</p>\n<p><strong>效果</strong> 你或邻接盟友恢复 @Damage[(2d8+4)[healing]]，并结束目标身上的 @UUID[Compendium.pf2e.conditionitems.Item.lDVqvLKA6eF3Df60]{持续伤害（流血）}（若有）。本包可使用 <strong>3</strong> 次。</p>",
      gm: "<p>Hunt First Aid Kit。2 动作，2d8+4，清流血，uses 3。</p>",
    },
    rules: [],
    slug: "hunt-first-aid-kit",
    traits: {
      value: ["consumable", "healing", "manipulate"],
      rarity: "common",
      otherTags: ["hunt-showdown", "hunt-medical"],
    },
    publication: pubM,
    level: { value: 2 },
    quantity: 1,
    baseItem: null,
    bulk: { value: 0.2 },
    price: { value: { gp: 10 } },
    equipped: { carryType: "worn", invested: null },
    containerId: null,
    size: "med",
    identification: {
      status: "identified",
      unidentified: {
        name: "药箱",
        img: "systems/pf2e/icons/unidentified_item_icons/other-consumables.webp",
        data: { description: { value: "<p>塞满绷带的小箱子。</p>" } },
      },
      misidentified: {},
    },
    category: "other",
    uses: { value: 3, max: 3, autoDestroy: true },
    damage: { formula: "2d8+4", kind: "healing", type: "vitality" },
    usage: { value: "held-in-one-hand" },
    stackGroup: null,
  },
  flags: {
    "wang-pf2e-homebrew": {
      source: "hunt-showdown",
      huntCategory: "medical",
      huntSlots: 2,
      enName: "First Aid Kit",
      clearBleed: true,
    },
  },
};

const spyglass = {
  _id: "whbHuntSpyglas01",
  folder: "whbHntFldTact001",
  name: "望远镜 Spyglass",
  type: "equipment",
  img: imgSpy,
  system: {
    description: {
      value:
        "<p>单筒光学仪器，用于远距离观察。</p>\n<blockquote><p><strong>战术 · SPYGLASS</strong> 远眺。</p></blockquote>\n<hr />\n<p><strong>远眺</strong> <span class=\"action-glyph\">1</span>（操作）Interact</p>\n<p>你透过镜筒观察：本次 @UUID[Compendium.pf2e.actionspf2e.Item.BlACk2YbfTKJFUBY]{寻求} 可将视觉侦察距离延伸至 <strong>300 尺</strong>（对极端天候/烟雾无效，GM）。对仅依赖视觉的隐蔽目标，本次寻求忽略超过 30 尺通常带来的额外难度一级（由 GM 裁定）。</p>",
      gm: "<p>Hunt Spyglass。1 动作寻求视野至 300 尺。</p>",
    },
    rules: [
      {
        key: "RollOption",
        option: "hunt-spyglass",
        toggleable: true,
        placement: "actions",
        label: "望远镜 — 远眺寻求中",
      },
      {
        key: "Note",
        selector: "perception",
        title: "远眺",
        text: "寻求距离可延伸至 300 尺。",
        predicate: ["hunt-spyglass"],
      },
    ],
    slug: "hunt-spyglass",
    traits: { value: [], rarity: "common", otherTags: ["hunt-showdown", "hunt-tool"] },
    publication: pubT,
    level: { value: 0 },
    quantity: 1,
    baseItem: null,
    bulk: { value: 0.1 },
    price: { value: { gp: 4 } },
    equipped: { carryType: "worn", invested: null },
    containerId: null,
    size: "med",
    identification: {
      status: "identified",
      unidentified: {
        name: "铜筒",
        img: "systems/pf2e/icons/unidentified_item_icons/adventuring-gear.webp",
        data: { description: { value: "<p>一截可伸缩的铜管。</p>" } },
      },
      misidentified: {},
    },
    usage: { value: "held-in-one-hand" },
  },
  flags: {
    "wang-pf2e-homebrew": {
      source: "hunt-showdown",
      huntCategory: "tool",
      huntSlots: 1,
      enName: "Spyglass",
    },
  },
};

const katana = {
  _id: "whbHuntKatana001",
  folder: "whbHntFldWpn0001",
  name: "武士刀 Katana",
  type: "weapon",
  img: imgKatana,
  system: {
    description: {
      value:
        "<p>来自东方的利刃：轻击挥砍、重击突刺。</p>\n<blockquote><p><strong>兵器之书 · KATANA</strong> 居合斩见武术家专长；妖刀按武士刀结算。</p></blockquote>\n<p><strong>熟练</strong> 持用期间视为受训。</p>\n<hr />\n<p><strong>类别</strong> 军用剑；负载 1；单手（可双手）</p>\n<p><strong>伤害</strong> 1d8 挥砍；特质：灵巧、致命 d8、two-hand-d10、versatile-p</p>\n<p><strong>居合斩</strong> 需 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntFtMart001]{武术家}：1 动作进入居合，下一次打击 +1d6 精准；对未察觉目标命中即重击。</p>",
      gm: "<p>Hunt Katana。1d8 S、finesse、deadly-d8。居合在 Martialist。</p>",
    },
    rules: [{ ...PROF }],
    slug: "hunt-katana",
    traits: {
      value: ["finesse", "deadly-d8", "two-hand-d10", "versatile-p"],
      rarity: "uncommon",
      otherTags: ["hunt-showdown", "hunt-weapon"],
    },
    publication: pub,
    level: { value: 1 },
    quantity: 1,
    baseItem: "katana",
    bulk: { value: 1 },
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
        name: "长刀",
        img: "systems/pf2e/icons/unidentified_item_icons/weapons.webp",
        data: { description: { value: "<p>一柄弯长的单刃刀。</p>" } },
      },
    },
    usage: { value: "held-in-one-hand" },
    category: "martial",
    group: "sword",
    bonus: { value: 0 },
    bonusDamage: { value: 0 },
    damage: { dice: 1, die: "d8", damageType: "slashing", persistent: null },
    splashDamage: { value: 0 },
    range: null,
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
      huntSlots: 2,
      enName: "Katana",
      baseWeapon: "katana",
    },
  },
};

// Annotate jiuli lesser/moderate/greater: Martialist counts as katana
for (const jiuliId of ["whbJiuliLsr00001", "whbJiuliMod00001", "whbJiuliGtr00001"]) {
  const p = path.join(itemsDir, `${jiuliId}.json`);
  if (!fs.existsSync(p)) continue;
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  const marker = "猎杀·武术家";
  if (!(j.system?.description?.value ?? "").includes(marker)) {
    j.system.description.value +=
      `\n<hr />\n<p><strong>${marker}</strong> 此刀 <code>baseItem: katana</code>，对 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntFtMart001]{武术家} 的<strong>居合架势</strong>视为武士刀。</p>`;
  }
  j.flags = j.flags || {};
  j.flags["wang-pf2e-homebrew"] = {
    ...(j.flags["wang-pf2e-homebrew"] || {}),
    countsAsKatanaForMartialist: true,
  };
  fs.writeFileSync(p, JSON.stringify(j, null, 2) + "\n");
  console.log("annotated", jiuliId);
}

const items = [
  adrenaline,
  gator,
  martialist,
  resilience,
  vigilant,
  iaiFx,
  throwingKnives,
  firstAid,
  spyglass,
  katana,
];
for (const it of items) {
  assertId(it._id, it.name);
  fs.writeFileSync(path.join(itemsDir, `${it._id}.json`), JSON.stringify(it, null, 2) + "\n");
}

// —— 菲洛猎人 NPC ——
const philo = {
  _id: "whbHuntPhilo0001",
  folder: "whbfolderHntHt01",
  name: "菲洛",
  type: "npc",
  img: imgPhilo,
  items: [
    {
      _id: "whbPhiloJiuli001",
      name: "妖刀·隐里切（猎杀）",
      type: "weapon",
      img: "icons/weapons/swords/greatsword-crossguard-red.webp",
      system: {
        description: {
          value:
            "<p>菲洛的诅咒之刃。按武士刀结算，可触发武术家居合。</p>\n<p>合集完整版见 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbJiuliLsr00001]{妖刀·隐里切（初现）}。</p>",
        },
        slug: "jiuli-katana-lesser",
        traits: {
          value: ["cursed", "deadly-d8", "magical", "parry", "two-hand-d10", "versatile-p"],
          rarity: "rare",
          otherTags: ["jiuli-katana", "hunt-showdown"],
        },
        publication: pubH,
        level: { value: 4 },
        quantity: 1,
        baseItem: "katana",
        bulk: { value: 1 },
        price: { value: { gp: 100 } },
        equipped: { carryType: "held", handsHeld: 1 },
        usage: { value: "held-in-one-hand" },
        category: "martial",
        group: "sword",
        bonus: { value: 1 },
        bonusDamage: { value: 0 },
        damage: { dice: 1, die: "d8", damageType: "slashing", persistent: null },
        range: null,
        reload: { value: "-" },
        runes: { potency: 1, striking: 1, property: [] },
        rules: [],
        identification: { status: "identified" },
      },
      flags: { "wang-pf2e-homebrew": { source: "jiuli-katana", huntPhilo: true } },
    },
    {
      _id: "whbPhiloThrKn001",
      name: "投掷小刀",
      type: "weapon",
      img: imgKnives,
      system: {
        description: { value: "<p>@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntThrKniv01]{投掷小刀}</p>" },
        slug: "hunt-throwing-knives",
        traits: { value: ["agile", "finesse", "deadly-d8", "thrown-20"], rarity: "common", otherTags: ["hunt-showdown"] },
        publication: pubH,
        level: { value: 0 },
        quantity: 3,
        baseItem: "dagger",
        bulk: { value: 0.1 },
        equipped: { carryType: "worn", handsHeld: 0 },
        usage: { value: "held-in-one-hand" },
        category: "simple",
        group: "knife",
        bonus: { value: 1 },
        damage: { dice: 1, die: "d4", damageType: "piercing", persistent: null },
        range: 20,
        reload: { value: "-" },
        rules: [],
        identification: { status: "identified" },
      },
    },
    {
      _id: "whbPhiloFirstA01",
      name: "医疗包",
      type: "consumable",
      img: imgAid,
      system: {
        description: {
          value:
            "<p><span class=\"action-glyph\">2</span> 恢复 @Damage[(2d8+4)[healing]] 并停止流血。剩余次数见 uses。</p>",
        },
        slug: "hunt-first-aid-kit",
        traits: { value: ["consumable", "healing"], rarity: "common", otherTags: ["hunt-showdown"] },
        publication: pubH,
        level: { value: 2 },
        quantity: 1,
        bulk: { value: 0.2 },
        equipped: { carryType: "worn" },
        category: "other",
        uses: { value: 3, max: 3, autoDestroy: true },
        damage: { formula: "2d8+4", kind: "healing", type: "vitality" },
        usage: { value: "held-in-one-hand" },
        rules: [],
        identification: { status: "identified" },
      },
    },
    {
      _id: "whbPhiloSpygls01",
      name: "望远镜",
      type: "equipment",
      img: imgSpy,
      system: {
        description: { value: "<p>1 动作远眺：寻求可视距离至 300 尺。</p>" },
        slug: "hunt-spyglass",
        traits: { value: [], rarity: "common", otherTags: ["hunt-showdown"] },
        publication: pubH,
        level: { value: 0 },
        quantity: 1,
        bulk: { value: 0.1 },
        equipped: { carryType: "worn" },
        usage: { value: "held-in-one-hand" },
        rules: [],
        identification: { status: "identified" },
      },
    },
    {
      _id: "whbPhiloConcTM01",
      name: "铁丝网拌雷",
      type: "consumable",
      img: imgWire,
      system: {
        description: {
          value:
            "<p><span class=\"action-glyph\">2</span> 布置。触发后 2×2 格铁丝网：1d6 挥砍 + 困难地形。见 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntConcTM001]{铁丝网拌雷}。</p>",
        },
        slug: "concertina-trip-mine",
        traits: { value: ["consumable", "snare", "trap"], rarity: "uncommon", otherTags: ["hunt-showdown"] },
        publication: pubH,
        level: { value: 4 },
        quantity: 1,
        bulk: { value: 0.1 },
        equipped: { carryType: "worn" },
        category: "snare",
        uses: { value: 1, max: 1, autoDestroy: true },
        usage: { value: "held-in-one-hand" },
        rules: [],
        identification: { status: "identified" },
      },
    },
    // feat copies (lightweight)
    {
      _id: "whbPhiloFtAdrn01",
      name: "肾上腺素",
      type: "feat",
      img: imgAdr,
      system: {
        description: { value: "<p>濒死时反应：快步 + 等级临时 HP（1 分钟）。</p>" },
        slug: "hunt-feat-adrenaline",
        traits: { value: ["general"], rarity: "uncommon", otherTags: ["hunt-trait"] },
        publication: pubH,
        level: { value: 1 },
        category: "general",
        actionType: { value: "reaction" },
        actions: { value: null },
        rules: [],
      },
    },
    {
      _id: "whbPhiloFtBulw01",
      name: "堡垒",
      type: "feat",
      img: "modules/wang-pf2e-homebrew/assets/hunt/trait-bulwark.png",
      system: {
        description: { value: "<p>范围伤害抗 5；抗致盲/目眩豁免 +2。</p>" },
        slug: "hunt-feat-bulw001",
        traits: { value: ["general"], rarity: "uncommon", otherTags: ["hunt-trait"] },
        publication: pubH,
        level: { value: 1 },
        category: "general",
        actionType: { value: "passive" },
        actions: { value: null },
        rules: [
          { key: "Resistance", type: "physical", value: 5, predicate: ["area-damage"], label: "堡垒" },
          { key: "Resistance", type: "fire", value: 5, predicate: ["area-damage"], label: "堡垒·火" },
        ],
      },
    },
    {
      _id: "whbPhiloFtGator1",
      name: "鳄鱼腿",
      type: "feat",
      img: imgGator,
      system: {
        description: { value: "<p>困难地形不减半；水中隐秘 +2。</p>" },
        slug: "hunt-feat-gator-legs",
        traits: { value: ["general"], rarity: "uncommon", otherTags: ["hunt-trait"] },
        publication: pubH,
        level: { value: 1 },
        category: "general",
        actionType: { value: "passive" },
        actions: { value: null },
        rules: [
          {
            key: "RollOption",
            option: "hunt-gator-water",
            toggleable: true,
            placement: "actions",
            label: "鳄鱼腿 — 水中",
          },
          {
            key: "FlatModifier",
            selector: "stealth",
            type: "circumstance",
            value: 2,
            predicate: ["hunt-gator-water"],
            label: "鳄鱼腿",
          },
        ],
      },
    },
    {
      _id: "whbPhiloFtMart01",
      name: "武术家",
      type: "feat",
      img: imgMart,
      system: {
        description: {
          value:
            "<p><span class=\"action-glyph\">1</span> 居合架势：下一次妖刀/武士刀打击 +1d6 精准。妖刀视为武士刀。</p>",
        },
        slug: "hunt-feat-martialist",
        traits: { value: ["general"], rarity: "uncommon", otherTags: ["hunt-trait"] },
        publication: pubH,
        level: { value: 1 },
        category: "general",
        actionType: { value: "action" },
        actions: { value: 1 },
        rules: [],
      },
    },
    {
      _id: "whbPhiloFtResil1",
      name: "韧性",
      type: "feat",
      img: imgRes,
      system: {
        description: { value: "<p>从濒死被救起时，HP 至少回到上限一半。</p>" },
        slug: "hunt-feat-resilience",
        traits: { value: ["general"], rarity: "uncommon", otherTags: ["hunt-trait"] },
        publication: pubH,
        level: { value: 1 },
        category: "general",
        actionType: { value: "passive" },
        actions: { value: null },
        rules: [],
      },
    },
    {
      _id: "whbPhiloFtVigil1",
      name: "警戒",
      type: "feat",
      img: imgVig,
      system: {
        description: { value: "<p>30 尺内察觉陷阱/埋伏；相关寻求 +2。</p>" },
        slug: "hunt-feat-vigilant",
        traits: { value: ["general"], rarity: "uncommon", otherTags: ["hunt-trait"] },
        publication: pubH,
        level: { value: 1 },
        category: "general",
        actionType: { value: "passive" },
        actions: { value: null },
        rules: [
          {
            key: "RollOption",
            option: "hunt-vigilant-traps",
            toggleable: true,
            placement: "actions",
            label: "警戒 — 侦测陷阱",
          },
          {
            key: "FlatModifier",
            selector: "perception",
            type: "circumstance",
            value: 2,
            predicate: ["hunt-vigilant-traps"],
            label: "警戒",
          },
        ],
      },
    },
    {
      _id: "whbPhiloIaiAct01",
      name: "居合架势",
      type: "action",
      img: imgMart,
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "offensive",
        description: {
          value:
            "<p>进入居合：下一次妖刀打击额外 @Damage[1d6[precision]]；未察觉目标命中即重击。请向自身施加合集效果「居合架势」，或依赖自动化。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "hunt-iai-stance",
        traits: { value: [] },
      },
    },
    {
      _id: "whbPhiloAdrnAct1",
      name: "肾上腺素爆发",
      type: "action",
      img: imgAdr,
      system: {
        actionType: { value: "reaction" },
        actions: { value: null },
        category: "defensive",
        description: {
          value: "<p><strong>触发</strong> 获得濒死。效果：快步；获得 4 临时生命值（等级），1 分钟。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "philo-adrenaline",
        traits: { value: [] },
      },
    },
    {
      _id: "whbPhiloTactic01",
      name: "菲洛战术（GM）",
      type: "action",
      img: imgPhilo,
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "offensive",
        description: {
          value:
            "<p><strong>定位</strong> 近战刀客 / 侦察。特质：肾上腺素 1、堡垒 2、鳄鱼腿 3、武术家 2、韧性 3、警戒 1。</p>\n<ol>\n<li>望远镜或警戒找陷阱与埋伏</li>\n<li>铁丝网拌雷封路</li>\n<li>妖刀居合切入；飞刀无声补刀</li>\n<li>倒地靠韧性与肾上腺素翻盘；医疗包续命</li>\n</ol>",
        },
        publication: pubH,
        rules: [],
        slug: "philo-tactics",
        traits: { value: [] },
      },
    },
  ],
  effects: [],
  system: {
    abilities: {
      str: { mod: 3 },
      dex: { mod: 4 },
      con: { mod: 3 },
      int: { mod: 1 },
      wis: { mod: 3 },
      cha: { mod: 2 },
    },
    attributes: {
      ac: { details: "轻甲 + 居合身法", value: 21 },
      allSaves: { value: "" },
      hp: { details: "韧性：被救起回半血", max: 68, temp: 0, value: 68 },
      speed: { value: 30, otherSpeeds: [{ type: "swim", value: 20 }] },
      resistances: [{ type: "physical", value: 5, exceptions: [], doubleOn: [], predicate: ["area-damage"] }],
      weaknesses: [],
      immunities: [],
    },
    details: {
      blurb: "刀客 · 沼泽侦察",
      languages: { details: "", value: ["common"] },
      level: { value: 4 },
      privateNotes:
        "<p>玩家菲洛的猎杀构筑：肾上腺素1 / 堡垒2 / 鳄鱼腿3 / 武术家2 / 韧性3 / 警戒1。装备：妖刀（武士刀结算）、飞刀、医疗包、望远镜、铁丝网拌雷。</p>",
      publicNotes:
        "<p>沼地里的刀客。望远镜扫过铁丝与甲虫，鞘中妖刀按武士刀吃居合——疲乏与濒死都只是下一刀前的喘息。</p>\n<p><em>四人 2 级团 · Creature 4 · 菲洛构筑</em></p>",
      publication: pubH,
    },
    initiative: { statistic: "perception" },
    perception: {
      details: "警戒：30 尺陷阱/埋伏",
      mod: 13,
      senses: [{ type: "low-light-vision" }],
    },
    resources: {},
    saves: {
      fortitude: { saveDetail: "韧性", value: 12 },
      reflex: { saveDetail: "", value: 14 },
      will: { saveDetail: "", value: 11 },
    },
    skills: {
      acrobatics: { base: 14 },
      athletics: { base: 12 },
      medicine: { base: 11 },
      stealth: { base: 14 },
      survival: { base: 12 },
      thievery: { base: 12 },
    },
    traits: {
      rarity: "unique",
      size: { value: "med" },
      value: ["human", "humanoid"],
    },
  },
  prototypeToken: {
    name: "菲洛",
    width: 1,
    height: 1,
    texture: { src: imgPhilo, scaleX: 1, scaleY: 1 },
    disposition: -1,
    displayBars: 40,
    bar1: { attribute: "attributes.hp" },
    sight: { enabled: true, range: 45, visionMode: "basic" },
    flags: { pf2e: { linkToActorSize: true, autoscale: true } },
    actorLink: false,
  },
  ownership: { default: 0 },
  flags: {
    "wang-pf2e-homebrew": {
      source: "hunt-showdown",
      huntHunter: "philo",
      preferredLoadout: ["jiuli-katana", "throwing-knives", "first-aid-kit", "spyglass", "concertina-trip-mine"],
      huntTraits: {
        adrenaline: 1,
        bulwark: 2,
        gatorLegs: 3,
        martialist: 2,
        resilience: 3,
        vigilant: 1,
      },
    },
  },
};

assertId(philo._id, "philo");
for (const i of philo.items) assertId(i._id, i.name);
fs.writeFileSync(path.join(actorsDir, "whbHuntPhilo0001.json"), JSON.stringify(philo, null, 2) + "\n");

const mod = readMod();
mod.version = "1.27.0";
fs.writeFileSync(path.join(root, "module.json"), JSON.stringify(mod, null, 2) + "\n");
console.log("wrote", items.length, "items + philo; version", mod.version);
