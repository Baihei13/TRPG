/**
 * 沙漠玫瑰（梅西·斯克里布纳）+ 午夜之影（艾比盖尔·海瑟薇）
 * 皮肤不做独立物品；补齐原型武器并嵌入猎人物品栏以触发自动化。
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assets = path.join(root, "assets", "hunt");
const itemsDir = path.join(root, "src", "packs", "homebrew-items");
const actorsDir = path.join(root, "src", "packs", "homebrew-actors");

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
const pubH = { ...pub, title: "猎杀对决 — 猎人" };
const pubT = { ...pub, title: "猎杀对决 — 战术" };
const pubM = { ...pub, title: "猎杀对决 — 医疗" };

function assertId(id, label) {
  if (!/^[a-zA-Z0-9]{16}$/.test(id)) throw new Error(`bad id ${label}: ${id} (${id.length})`);
}

function ensureAsset(name, fallbacks = []) {
  const p = path.join(assets, name);
  if (fs.existsSync(p) && fs.statSync(p).size > 500) {
    return `modules/wang-pf2e-homebrew/assets/hunt/${name}`;
  }
  for (const fb of fallbacks) {
    const fp = path.join(assets, fb);
    if (fs.existsSync(fp) && fs.statSync(fp).size > 500) {
      fs.copyFileSync(fp, p);
      return `modules/wang-pf2e-homebrew/assets/hunt/${name}`;
    }
  }
  return `modules/wang-pf2e-homebrew/assets/hunt/${fallbacks[0] || name}`;
}

const imgRose = ensureAsset("desert-rose.png", ["dorothy.png"]);
const imgShadow = ensureAsset("midnights-shadow.png", ["the-cairn.png", "dorothy.png"]);
const imgMako = ensureAsset("mako-1895.png", ["frontier-73c.png"]);
const imgBorn = ensureAsset("bornheim-no3.png", ["pax-trueshot.png"]);
const imgStam = ensureAsset("stamina-shot.png", ["regeneration-shot.png"]);
const imgAuto = ensureAsset("auto-5.png", ["rival-78.png", "romero-77.png"]);
const imgCav = ensureAsset("1890-cavalry.png", ["mako-1895.png"]);
const imgLeMat = ensureAsset("lemat-mark-ii.png", ["pax-trueshot.png"]);
const imgXbow = ensureAsset("hand-crossbow-plain.png", ["hand-crossbow.png"]);
const imgCaly = ensureAsset("calyptra.png", ["dream-glass.png", "stonewaller.png"]);

function gunBase({
  _id,
  name,
  img,
  lore,
  gm,
  slug,
  enName,
  wikiIcon,
  baseWeapon,
  level = 3,
  price = 20,
  bulk = 2,
  usage = "held-in-two-hands",
  range,
  capacity,
  die = "d10",
  traits,
  rulesExtra = [],
  unidentified = "火器",
  slots = 3,
  otherTags = ["hunt-showdown", "hunt-weapon"],
}) {
  return {
    _id,
    folder: "whbHntFldWpn0001",
    name,
    type: "weapon",
    img,
    system: {
      description: { value: lore, gm },
      rules: [{ ...PROF }, ...rulesExtra],
      slug,
      traits: { value: traits, rarity: "uncommon", otherTags },
      publication: pub,
      level: { value: level },
      quantity: 1,
      baseItem: null,
      bulk: { value: bulk },
      hp: { value: 0, max: 0 },
      hardness: 0,
      price: { value: { gp: price } },
      equipped: { carryType: "worn", handsHeld: 0 },
      containerId: null,
      size: "med",
      material: { type: null, grade: null },
      identification: {
        status: "identified",
        unidentified: {
          name: unidentified,
          img: "systems/pf2e/icons/unidentified_item_icons/weapons.webp",
          data: { description: { value: `<p>${unidentified}。</p>` } },
        },
      },
      usage: { value: usage },
      category: "martial",
      group: "firearm",
      bonus: { value: 0 },
      bonusDamage: { value: 0 },
      damage: { dice: 1, die, damageType: "piercing", persistent: null },
      splashDamage: { value: 0 },
      range,
      expend: 1,
      ammo: { baseType: "rounds", builtIn: false, capacity },
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
        huntSlots: slots,
        enName,
        wikiIcon,
        baseWeapon,
      },
    },
  };
}

/** —— 原型武器（无皮肤） —— */
const mako = gunBase({
  _id: "whbHuntMako18951",
  name: "Mako 1895 杠杆步枪",
  img: imgMako,
  enName: "Mako 1895",
  wikiIcon: "Weapon_Mako_1895.png",
  baseWeapon: "mako-1895",
  slug: "mako-1895",
  range: 80,
  capacity: 5,
  die: "d10",
  traits: ["concussive", "volley", "capacity-5"],
  slots: 3,
  price: 28,
  unidentified: "杠杆步枪",
  lore: `<p>美制杠杆步枪，循环快、单发伤高，可随时补弹。</p>
<blockquote><p><strong>兵器之书 · MAKO 1895</strong> 同族 Winfield 杠杆枪的亲戚：威力换精度；厂方曾吹嘘沿海农夫可用它打短鳍鲭鲨。</p></blockquote>
<p><strong>熟练</strong> 持用期间视为受训。</p>
<hr />
<p><strong>类别</strong> 军用火器；负载 2；双手；射程增量 <strong>80 尺</strong>；装填 1；容量 5</p>
<p><strong>伤害</strong> 1d10 穿刺；特质：震荡、volley、capacity-5</p>
<p><strong>弹药</strong> @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntAmmoStd01]{标准枪弹}。</p>
<hr />
<p><strong>补弹循环</strong> 此武器打击不引发借机；装填后可免费快步 5 尺（每轮 1 次，见自动化）。</p>`,
  gm: "<p>Hunt 原型 Mako 1895。1d10 P、80ft、cap5。补弹后免费快步（Swift 系）。</p>",
  rulesExtra: [
    {
      key: "Note",
      selector: "strike-attack-roll",
      title: "补弹循环",
      text: "打击不引发借机；装填后可免费快步（每轮 1）。",
      predicate: ["item:id:{item|_id}"],
    },
  ],
});

const auto5 = gunBase({
  _id: "whbHuntAuto5Base",
  name: "Auto-5 半自动霰弹枪",
  img: imgAuto,
  enName: "Auto-5",
  wikiIcon: "Weapon_Auto-5.png",
  baseWeapon: "auto-5",
  slug: "auto-5",
  range: 30,
  capacity: 5,
  die: "d10",
  traits: ["concussive", "scatter", "capacity-5"],
  slots: 3,
  price: 32,
  unidentified: "半自动霰弹枪",
  lore: `<p>半自动霰弹：管匣连发，近距撕开成群飞蛾与血渴者。</p>
<blockquote><p><strong>兵器之书 · BROWNING AUTO-5</strong> 早期半自动霰弹；后坐力驱动退壳上膛，射速高、噪音更大。</p></blockquote>
<p><strong>熟练</strong> 持用期间视为受训。</p>
<hr />
<p><strong>类别</strong> 军用火器；负载 2；双手；射程增量 <strong>30 尺</strong>；装填 1；容量 5</p>
<p><strong>伤害</strong> 1d10 穿刺；特质：震荡、scatter、capacity-5</p>
<hr />
<p><strong>连匣扫射</strong>（开关）开启时，一次操作发动<strong>两次</strong>此武器打击，各 −3 环境，共享同一 MAP。每回合限 1 次后建议关闭。</p>`,
  gm: "<p>Hunt 原型 Auto-5。1d10 scatter、30ft、cap5；扫射开关双击 −3。</p>",
  rulesExtra: [
    {
      key: "RollOption",
      domain: "attack",
      option: "hunt-auto5-spray",
      toggleable: true,
      placement: "actions",
      label: "Auto-5 — 连匣扫射（本回合）",
    },
    {
      key: "FlatModifier",
      selector: "strike-attack-roll",
      type: "circumstance",
      value: -3,
      label: "连匣扫射",
      predicate: ["hunt-auto5-spray", "item:id:{item|_id}"],
      hideIfDisabled: true,
    },
  ],
});

const cavalry = gunBase({
  _id: "whbHuntCavalry01",
  name: "1890 Cavalry 骑兵卡宾",
  img: imgCav,
  enName: "1890 Cavalry",
  wikiIcon: "Weapon_1890_Cavalry.png",
  baseWeapon: "1890-cavalry",
  slug: "1890-cavalry",
  range: 80,
  capacity: 1,
  die: "d10",
  traits: ["concussive", "fatal-d10"],
  slots: 3,
  price: 24,
  unidentified: "单发卡宾",
  lore: `<p>弹簧田式后门单发卡宾：一发一审，中距高伤。</p>
<blockquote><p><strong>兵器之书 · 1890 CAVALRY</strong> 骑兵卡宾；装填慢，命中疼。</p></blockquote>
<p><strong>熟练</strong> 持用期间视为受训。</p>
<hr />
<p><strong>类别</strong> 军用火器；负载 2；双手；射程增量 <strong>80 尺</strong>；装填 1；容量 1</p>
<p><strong>伤害</strong> 1d10 穿刺；特质：震荡、fatal-d10</p>`,
  gm: "<p>Hunt 原型 1890 Cavalry。1d10 fatal-d10、80ft、cap1。</p>",
});

const lemat = gunBase({
  _id: "whbHuntLeMat0001",
  name: "LeMat Mark II 左轮",
  img: imgLeMat,
  enName: "LeMat Mark II",
  wikiIcon: "Weapon_LeMat.png",
  baseWeapon: "lemat-mark-ii",
  slug: "lemat-mark-ii",
  range: 40,
  capacity: 9,
  die: "d8",
  bulk: 1,
  usage: "held-in-one-hand",
  traits: ["concussive", "capacity-9"],
  slots: 2,
  price: 22,
  unidentified: "九连发左轮",
  lore: `<p>九连发左轮，枪管下另有霰弹筒「重拳」。</p>
<blockquote><p><strong>兵器之书 · LEMAT MARK II</strong> 弹巢九发 + 中央霰弹筒。</p></blockquote>
<p><strong>熟练</strong> 持用期间视为受训。</p>
<hr />
<p><strong>左轮</strong> 单手；40 尺；装填 1；容量 9；1d8 穿刺；震荡、capacity-9</p>
<p><strong>重拳</strong> 动作栏另有霰弹打击：20 尺、1d8 穿刺（散射感）、容量 1（每场建议 1–2 发）。</p>`,
  gm: "<p>Hunt 原型 LeMat。1d8/40/cap9 + Strike 重拳霰弹。</p>",
  rulesExtra: [
    {
      key: "Strike",
      category: "martial",
      group: "firearm",
      slug: "lemat-punch",
      label: "LeMat · 重拳（霰弹）",
      img: imgLeMat,
      damage: { base: { damageType: "piercing", dice: 1, die: "d8" } },
      traits: ["concussive", "scatter"],
      range: { increment: 20 },
    },
  ],
});

const handXbow = {
  _id: "whbHuntHandXbow1",
  folder: "whbHntFldWpn0001",
  name: "手弩 Hand Crossbow",
  type: "weapon",
  img: imgXbow,
  system: {
    description: {
      value: `<p>单手轻弩：安静、致命，适合黑暗里送人「穿过帷幕」。</p>
<blockquote><p><strong>兵器之书 · HAND CROSSBOW</strong> 短弩臂，拔弦上箭；枪声喧哗时它几乎不说话。</p></blockquote>
<p><strong>熟练</strong> 持用期间视为受训。</p>
<hr />
<p><strong>类别</strong> 军用弩；负载 1；单手；射程增量 <strong>60 尺</strong>；装填 1；容量 1</p>
<p><strong>伤害</strong> 1d8 穿刺；特质：致命 d8</p>
<hr />
<p><strong>无声致命</strong> 此武器打击不带 auditory 特质；对未察觉你的目标，攻击 +1 环境。</p>`,
      gm: "<p>Hunt 原型 Hand Crossbow。1d8 deadly-d8、60ft；无声；对未察觉 +1。</p>",
    },
    rules: [
      { ...PROF },
      {
        key: "RollOption",
        domain: "attack",
        option: "hunt-target-unaware",
        toggleable: true,
        placement: "actions",
        label: "手弩 — 目标未察觉你",
      },
      {
        key: "FlatModifier",
        selector: "strike-attack-roll",
        type: "circumstance",
        value: 1,
        label: "无声致命",
        predicate: ["hunt-target-unaware", "item:id:{item|_id}"],
        hideIfDisabled: true,
      },
    ],
    slug: "hand-crossbow",
    traits: {
      value: ["deadly-d8"],
      rarity: "uncommon",
      otherTags: ["hunt-showdown", "hunt-weapon"],
    },
    publication: pub,
    level: { value: 2 },
    quantity: 1,
    baseItem: null,
    bulk: { value: 1 },
    hp: { value: 0, max: 0 },
    hardness: 0,
    price: { value: { gp: 12 } },
    equipped: { carryType: "worn", handsHeld: 0 },
    containerId: null,
    size: "med",
    material: { type: null, grade: null },
    identification: {
      status: "identified",
      unidentified: {
        name: "手弩",
        img: "systems/pf2e/icons/unidentified_item_icons/weapons.webp",
        data: { description: { value: "<p>短臂弩。</p>" } },
      },
    },
    usage: { value: "held-in-one-hand" },
    category: "martial",
    group: "bow",
    bonus: { value: 0 },
    bonusDamage: { value: 0 },
    damage: { dice: 1, die: "d8", damageType: "piercing", persistent: null },
    splashDamage: { value: 0 },
    range: 60,
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
      huntSlots: 1,
      enName: "Hand Crossbow",
      wikiIcon: "Weapon_Hand_Crossbow.png",
      baseWeapon: "hand-crossbow",
    },
  },
};

const calyptra = {
  _id: "whbHuntCalyptra1",
  folder: "whbHntFldTact001",
  name: "卡吕普特拉 Calyptra",
  type: "equipment",
  img: imgCaly,
  system: {
    description: {
      value: `<p>这枚护身符曾是午夜之影在成为赏金猎人之前佩戴在胸前的胸针。如今，它装饰着她用来实现内心目标的武器：终结所有嗜血之人的生命，让他们化为飞蛾。</p>
<hr />
<p><strong>用法</strong> 佩戴（投资）。</p>
<p><strong>嗜血猎手</strong> 对 GM 认定为「嗜血者 / 亡灵吸血者 / 白发女巫同党」的目标，你的打击伤害 +1 状态。</p>
<p><strong>化为飞蛾</strong>（开关）本场 1 次：下次命中令目标 @Check[will|dc:resolve(@actor.level*2+14)|traits:emotion,fear,mental,occult]{意志}，失败则 @UUID[Compendium.pf2e.conditionitems.Item.TBSHQidQVSrGRTuq]{惊惧 1}（1 分钟），并视为「飞蛾」——对你下一次打击措手不及。</p>`,
      gm: "<p>Charm Calyptra。对嗜血目标 +1 伤；化为飞蛾 1/场惊惧。</p>",
    },
    rules: [
      {
        key: "RollOption",
        domain: "damage",
        option: "hunt-bloodthirsty-target",
        toggleable: true,
        placement: "actions",
        label: "卡吕普特拉 — 目标为嗜血者（GM）",
      },
      {
        key: "FlatModifier",
        selector: "damage",
        type: "status",
        value: 1,
        label: "嗜血猎手",
        predicate: ["hunt-bloodthirsty-target"],
        hideIfDisabled: true,
      },
      {
        key: "RollOption",
        domain: "attack",
        option: "hunt-calyptra-moth",
        toggleable: true,
        placement: "actions",
        label: "卡吕普特拉 — 化为飞蛾（本场1次）",
      },
      {
        key: "Note",
        selector: "strike-damage",
        title: "化为飞蛾",
        text: "命中：意志失败则惊惧 1，且对你下一次打击措手不及。关闭开关。",
        predicate: ["hunt-calyptra-moth"],
      },
    ],
    slug: "calyptra",
    traits: {
      value: ["invested"],
      rarity: "rare",
      otherTags: ["hunt-showdown", "hunt-charm", "midnights-shadow"],
    },
    publication: pubT,
    level: { value: 3 },
    quantity: 1,
    baseItem: null,
    bulk: { value: 0 },
    price: { value: { gp: 25 } },
    equipped: { carryType: "worn", invested: true },
    containerId: null,
    size: "med",
    identification: {
      status: "identified",
      unidentified: {
        name: "飞蛾胸针",
        img: "systems/pf2e/icons/unidentified_item_icons/other-consumables.webp",
        data: { description: { value: "<p>暗色飞蛾纹样胸针。</p>" } },
      },
      misidentified: {},
    },
    usage: { value: "worn" },
  },
  flags: {
    "wang-pf2e-homebrew": {
      source: "hunt-showdown",
      huntCategory: "tactic",
      enName: "Calyptra",
      theme: "midnights-shadow",
    },
  },
};

/** 把合集物品缩成 Actor 嵌入副本（保留 slug 以触发自动化） */
function embedFrom(src, { _id, equipped = null, quantity = null, name = null } = {}) {
  const copy = structuredClone(src);
  copy._id = _id;
  delete copy.folder;
  if (name) copy.name = name;
  if (equipped) copy.system.equipped = { ...copy.system.equipped, ...equipped };
  if (quantity != null) copy.system.quantity = quantity;
  return copy;
}

function meleeStrike({ _id, name, img, bonus, damage, damageType, range, traits, desc, slug, sort }) {
  return {
    _id,
    img,
    name,
    sort,
    type: "melee",
    system: {
      action: { value: "" },
      attackEffects: { custom: "", value: [] },
      bonus: { value: bonus },
      damageRolls: {
        [`${_id}dmg`]: { damage, damageType },
      },
      description: { value: desc },
      publication: pubH,
      range,
      rules: [],
      slug,
      traits: { value: traits },
    },
  };
}

function actionItem({ _id, name, img, actionType, actions, category, desc, slug, traits, sort }) {
  return {
    _id,
    img,
    name,
    sort,
    type: "action",
    system: {
      actionType: { value: actionType },
      actions: { value: actions },
      category,
      description: { value: desc },
      publication: pubH,
      rules: [],
      slug,
      traits: { value: traits },
    },
  };
}

/** —— 沙漠玫瑰 —— */
const desertRose = {
  _id: "whbHuntDsrtRose1",
  folder: "whbfolderHntHt01",
  name: "沙漠玫瑰 梅西·斯克里布纳",
  type: "npc",
  img: imgRose,
  items: [
    embedFrom(mako, {
      _id: "whbDrMakoEmbed01",
      equipped: { carryType: "held", handsHeld: 2 },
    }),
    embedFrom(
      JSON.parse(fs.readFileSync(path.join(itemsDir, "whbHuntBornheim1.json"), "utf8")),
      {
        _id: "whbDrBornEmbed01",
        equipped: { carryType: "worn", handsHeld: 0 },
      },
    ),
    embedFrom(
      JSON.parse(fs.readFileSync(path.join(itemsDir, "whbHuntStamShot1.json"), "utf8")),
      {
        _id: "whbDrStamEmbed01",
        quantity: 2,
        name: "耐力针（玫瑰水）",
      },
    ),
    meleeStrike({
      _id: "whbDrMakoStrike1",
      name: "Mako 1895",
      img: imgMako,
      bonus: 16,
      damage: "2d10+4",
      damageType: "piercing",
      range: 80,
      traits: ["concussive", "volley"],
      slug: "dr-mako",
      sort: 100000,
      desc: `<p>主手嵌入 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntMako18951]{Mako 1895}。射程 <strong>80 尺</strong>。</p>
<p>团长曾送她「幸运」步枪也救不了马戏团——如今她用同样的准头对准马戏残骸。</p>`,
    }),
    meleeStrike({
      _id: "whbDrBornStrike1",
      name: "Bornheim No.3",
      img: imgBorn,
      bonus: 17,
      damage: "2d4+4",
      damageType: "piercing",
      range: 30,
      traits: ["concussive", "sweep"],
      slug: "dr-bornheim",
      sort: 200000,
      desc: `<p>副手 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntBornheim1]{Bornheim No.3}。射程 <strong>30 尺</strong>。美貌与凶猛的展示品。</p>
<p>物品栏中的 Bornheim 可触发<strong>速射扳机</strong>自动化。</p>`,
    }),
    actionItem({
      _id: "whbDrRapidFire01",
      name: "神枪连射",
      img: "systems/pf2e/icons/actions/OneAction.webp",
      actionType: "action",
      actions: 1,
      category: "offensive",
      sort: 300000,
      slug: "dr-trick-shot",
      traits: [],
      desc: `<p>以 Bornheim 发动两次打击（各 −3，共享 MAP），或对同一目标声明「爆头排练」：下次射击攻击 +2 环境（本场 1 次，与速射不同时叠）。</p>
<p>一整天的射击训练让她知道：每一颗子弹都至关重要。</p>`,
    }),
    actionItem({
      _id: "whbDrRosewater01",
      name: "玫瑰水提神",
      img: imgStam,
      actionType: "action",
      actions: 1,
      category: "defensive",
      sort: 400000,
      slug: "dr-rosewater",
      traits: ["manipulate", "healing"],
      desc: `<p>使用物品栏 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntStamShot1]{耐力针}：清除疲乏，获得迅捷 1 分钟（额外动作限行走/打击）。自动化会套用效果。</p>`,
    }),
    actionItem({
      _id: "whbDrCircusVeng1",
      name: "马戏复仇",
      img: "systems/pf2e/icons/actions/Passive.webp",
      actionType: "passive",
      actions: null,
      category: "offensive",
      sort: 500000,
      slug: "dr-circus-vengeance",
      traits: [],
      desc: `<p>对 GM 认定为「谋杀马戏团」相关目标（团员、残党、赫利奥石爪牙等）：打击伤害 +2 状态，且恐吓检定 +2 状态。</p>
<p>波斯特·马龙告诉她真相之后，清醒与怒火同行。</p>`,
    }),
    actionItem({
      _id: "whbDrDeadeye0001",
      name: "沙漠神枪",
      img: "systems/pf2e/icons/actions/Passive.webp",
      actionType: "passive",
      actions: null,
      category: "offensive",
      sort: 600000,
      slug: "dr-deadeye",
      traits: [],
      desc: `<p>距离 30 尺及以上的射击攻击 +1 环境。重击时忽略目标的标准掩蔽 AC 环境加值。</p>`,
    }),
    actionItem({
      _id: "whbDrTactics0001",
      name: "沙漠玫瑰战术（GM）",
      img: "systems/pf2e/icons/actions/Passive.webp",
      actionType: "passive",
      actions: null,
      category: "offensive",
      sort: 900000,
      slug: "dr-tactics",
      traits: [],
      desc: `<p><strong>定位</strong>：神枪手中距压制——Mako 点名，Bornheim 收尾。</p>
<ol>
<li>远距 Mako 点杀优先目标</li>
<li>逼近用 Bornheim <strong>速射/神枪连射</strong></li>
<li>听感麻木时立刻 <strong>玫瑰水</strong></li>
<li>对马戏团残党打出 <strong>马戏复仇</strong></li>
</ol>`,
    }),
  ],
  effects: [],
  system: {
    abilities: {
      str: { mod: 2 },
      dex: { mod: 4 },
      con: { mod: 2 },
      int: { mod: 2 },
      wis: { mod: 3 },
      cha: { mod: 3 },
    },
    attributes: {
      ac: { details: "牛仔帽 + 表演外套 + 勋章绶带", value: 21 },
      allSaves: { value: "" },
      hp: { details: "沙漠玫瑰：准头与怒火", max: 72, temp: 0, value: 72 },
      speed: { value: 30, otherSpeeds: [] },
      resistances: [],
      weaknesses: [],
      immunities: [],
    },
    details: {
      blurb: "沙漠玫瑰 · 神枪手复仇",
      languages: { details: "", value: ["common"] },
      level: { value: 4 },
      privateNotes: `<p>梅西·斯克里布纳（Mercy Scribner）「沙漠玫瑰」。幼年随父习枪，加入谋杀马戏团；赫利奥石来后逃离。波斯特·马龙告知真相后，带清醒与复仇逼近马戏团。</p>
<p>装载：Mako 1895 + Bornheim No.3 + 耐力针×2（玫瑰水皮 lore）。皮肤不做独立物品。</p>
<p>Creature 4 神枪手。</p>`,
      publicNotes: `<p>勋章挂满前襟，红领带在风里抖。她曾是马戏团的神枪明星——如今准星对准的是当年的班子。美貌仍在，凶猛不再表演。</p>
<p><em>四人 2 级团 · Creature 4 · 神枪手/马戏复仇</em></p>`,
      publication: pubH,
    },
    initiative: { statistic: "perception" },
    perception: {
      details: "神枪手视力；对哑火与「霉运」异常敏感",
      mod: 14,
      senses: [{ type: "low-light-vision" }],
    },
    resources: {},
    saves: {
      fortitude: { saveDetail: "", value: 11 },
      reflex: { saveDetail: "", value: 14 },
      will: { saveDetail: "+2 vs 恐吓若来自马戏残党", value: 12 },
    },
    skills: {
      acrobatics: { base: 14 },
      athletics: { base: 10 },
      deception: { base: 12 },
      intimidation: { base: 13 },
      performance: { base: 14 },
      stealth: { base: 12 },
      survival: { base: 12 },
    },
    traits: {
      rarity: "unique",
      size: { value: "med" },
      value: ["human", "humanoid"],
    },
  },
  prototypeToken: {
    name: "沙漠玫瑰",
    width: 1,
    height: 1,
    texture: { src: imgRose, scaleX: 1, scaleY: 1 },
    disposition: -1,
    displayBars: 40,
    bar1: { attribute: "attributes.hp" },
    sight: { enabled: true, range: 60, visionMode: "basic" },
    flags: { pf2e: { linkToActorSize: true, autoscale: true } },
    actorLink: false,
  },
  ownership: { default: 0 },
  flags: {
    "wang-pf2e-homebrew": {
      source: "hunt-showdown",
      huntHunter: "desert-rose",
      theme: "murder-circus",
      preferredLoadout: ["mako-1895", "bornheim-no-3", "stamina-shot"],
          preferredLoadoutIds: ["whbHuntMako18951", "whbHuntBornheim1", "whbHuntStamShot1"],
    },
  },
};

/** —— 午夜之影 —— */
const midnight = {
  _id: "whbHuntMidShad01",
  folder: "whbfolderHntHt01",
  name: "午夜之影 艾比盖尔·海瑟薇",
  type: "npc",
  img: imgShadow,
  items: [
    embedFrom(auto5, {
      _id: "whbMsAutoEmbed01",
      equipped: { carryType: "held", handsHeld: 2 },
    }),
    embedFrom(lemat, {
      _id: "whbMsLematEmbed1",
      equipped: { carryType: "worn", handsHeld: 0 },
    }),
    embedFrom(handXbow, {
      _id: "whbMsXbowEmbed01",
      equipped: { carryType: "worn", handsHeld: 0 },
    }),
    embedFrom(calyptra, {
      _id: "whbMsCalyEmbed01",
      equipped: { carryType: "worn", invested: true },
    }),
    meleeStrike({
      _id: "whbMsAutoStrike1",
      name: "Auto-5",
      img: imgAuto,
      bonus: 15,
      damage: "2d10+3",
      damageType: "piercing",
      range: 30,
      traits: ["concussive", "scatter"],
      slug: "ms-auto5",
      sort: 100000,
      desc: `<p>主手 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntAuto5Base]{Auto-5}。射程 <strong>30 尺</strong>。</p>
<p>把某些飞蛾送往<strong>吞噬它们的光</strong>——不是温暖，是焚尽。</p>`,
    }),
    meleeStrike({
      _id: "whbMsLematStr001",
      name: "LeMat",
      img: imgLeMat,
      bonus: 16,
      damage: "2d8+3",
      damageType: "piercing",
      range: 40,
      traits: ["concussive"],
      slug: "ms-lemat",
      sort: 200000,
      desc: `<p>腋下安慰枪 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntLeMat0001]{LeMat}。40 尺；亦可打<strong>重拳</strong>霰弹。</p>
<p>一种如同她脾气般短暂的、发自内心的死亡。</p>`,
    }),
    meleeStrike({
      _id: "whbMsXbowStrike1",
      name: "手弩",
      img: imgXbow,
      bonus: 16,
      damage: "2d8+3",
      damageType: "piercing",
      range: 60,
      traits: ["deadly-d8"],
      slug: "ms-hand-xbow",
      sort: 250000,
      desc: `<p>@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntHandXbow1]{手弩}。60 尺；黑暗中快速而无声。</p>
<p>弩箭把夜行生物化作飞蛾，送回它们真正该去的地方。</p>`,
    }),
    actionItem({
      _id: "whbMsMothCurse01",
      name: "飞蛾之刑",
      img: "systems/pf2e/icons/actions/OneAction.webp",
      actionType: "action",
      actions: 1,
      category: "offensive",
      sort: 300000,
      slug: "ms-moth-doom",
      traits: ["emotion", "fear", "mental", "occult"],
      desc: `<p>指定 30 尺内一名你看见的生物：@Check[will|dc:22|traits:emotion,fear,mental,occult,visual]{意志 DC 22}。</p>
<p>失败：惊惧 1，且视为「飞蛾」——对你的下一次打击措手不及。大失败惊惧 2。每场每目标 1 次。</p>
<p>有些灵魂不配安宁；她确保他们永远找不到。</p>`,
    }),
    actionItem({
      _id: "whbMsDevourLite1",
      name: "吞噬之光",
      img: imgAuto,
      actionType: "action",
      actions: 1,
      category: "offensive",
      sort: 350000,
      slug: "ms-devouring-light",
      traits: [],
      desc: `<p><strong>频率</strong> 每场 1 次。以 Auto-5 打击；若目标带惊惧或「飞蛾」，伤害额外 @Damage[2d6[fire]] 并施加 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntBurnFx001]{猎杀灼烬} 1 层。</p>`,
    }),
    actionItem({
      _id: "whbMsNightFall01",
      name: "夜幕降临",
      img: imgXbow,
      actionType: "action",
      actions: 1,
      category: "offensive",
      sort: 400000,
      slug: "ms-nightfall",
      traits: ["manipulate"],
      desc: `<p>在微光或黑暗中：以手弩打击，若你此前本回合已成功潜行或躲藏，该次打击视为对目标隐蔽（对方需持平），且命中后可免费快步 5 尺。</p>`,
    }),
    actionItem({
      _id: "whbMsCavalryAlt1",
      name: "备选：1890 骑兵卡宾",
      img: imgCav,
      actionType: "passive",
      actions: null,
      category: "offensive",
      sort: 700000,
      slug: "ms-cavalry-alt",
      traits: [],
      desc: `<p>GM 可把 Auto-5 换成 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntCavalry01]{1890 Cavalry}（死神之蜜皮 lore）：单发 80 尺、fatal-d10，专斩白发女巫与嗜血者。</p>`,
    }),
    actionItem({
      _id: "whbMsTactics0001",
      name: "午夜之影战术（GM）",
      img: "systems/pf2e/icons/actions/Passive.webp",
      actionType: "passive",
      actions: null,
      category: "offensive",
      sort: 900000,
      slug: "ms-tactics",
      traits: [],
      desc: `<p><strong>定位</strong>：暗影处决者——先标飞蛾，再无声或焚尽。</p>
<ol>
<li><strong>飞蛾之刑</strong> 点名</li>
<li>黑暗里手弩 <strong>夜幕降临</strong>，或贴脸 LeMat 重拳</li>
<li>群敌用 Auto-5；对飞蛾打出 <strong>吞噬之光</strong></li>
<li>卡吕普特拉开关对准嗜血者</li>
</ol>`,
    }),
  ],
  effects: [],
  system: {
    abilities: {
      str: { mod: 2 },
      dex: { mod: 4 },
      con: { mod: 3 },
      int: { mod: 2 },
      wis: { mod: 3 },
      cha: { mod: 2 },
    },
    attributes: {
      ac: { details: "宽檐帽影 + 菱纹皮甲 + 弹带", value: 22 },
      allSaves: { value: "" },
      hp: { details: "午夜之影：不给灵魂安息", max: 78, temp: 0, value: 78 },
      speed: { value: 30, otherSpeeds: [] },
      resistances: [],
      weaknesses: [],
      immunities: [],
    },
    details: {
      blurb: "午夜之影 · 飞蛾与复仇",
      languages: { details: "", value: ["common"] },
      level: { value: 4 },
      privateNotes: `<p>艾比盖尔·海瑟薇「午夜之影」。飞蛾=死亡象征；她拒绝让嗜血者安息。装载：Auto-5 + LeMat + 手弩 + 卡吕普特拉。可选换 1890 Cavalry。皮肤不做独立物品。</p>
<p>Creature 4 暗影处决。</p>`,
      publicNotes: `<p>帽檐压住眼睛，红唇是唯一亮色。她把灵魂当成飞蛾——有的该扑向光，有的该被光吞掉。午夜不是掩护，是判决。</p>
<p><em>四人 2 级团 · Creature 4 · 暗影处决/反嗜血</em></p>`,
      publication: pubH,
    },
    initiative: { statistic: "perception" },
    perception: {
      details: "帽檐阴影；黑暗中仍能「看见」该灭的灵魂",
      mod: 13,
      senses: [{ type: "darkvision", range: 60 }],
    },
    resources: {},
    saves: {
      fortitude: { saveDetail: "", value: 12 },
      reflex: { saveDetail: "", value: 14 },
      will: { saveDetail: "+2 vs 恐惧/心灵若来自亡灵", value: 13 },
    },
    skills: {
      athletics: { base: 11 },
      intimidation: { base: 12 },
      occultism: { base: 12 },
      religion: { base: 11 },
      stealth: { base: 15 },
      survival: { base: 12 },
      thievery: { base: 13 },
    },
    traits: {
      rarity: "unique",
      size: { value: "med" },
      value: ["human", "humanoid"],
    },
  },
  prototypeToken: {
    name: "午夜之影",
    width: 1,
    height: 1,
    texture: { src: imgShadow, scaleX: 1, scaleY: 1 },
    disposition: -1,
    displayBars: 40,
    bar1: { attribute: "attributes.hp" },
    sight: { enabled: true, range: 60, visionMode: "darkvision" },
    flags: { pf2e: { linkToActorSize: true, autoscale: true } },
    actorLink: false,
  },
  ownership: { default: 0 },
  flags: {
    "wang-pf2e-homebrew": {
      source: "hunt-showdown",
      huntHunter: "midnights-shadow",
      theme: "blood-testament",
      preferredLoadout: ["auto-5", "lemat-mark-ii", "hand-crossbow", "calyptra"],
      preferredLoadoutIds: [
        "whbHuntAuto5Base",
        "whbHuntLeMat0001",
        "whbHuntHandXbow1",
        "whbHuntCalyptra1",
      ],
      alternateLoadout: ["1890-cavalry"],
    },
  },
};

// Mako 加入 Swift 系以便装填快步——在自动化里补 slug
const items = [mako, auto5, cavalry, lemat, handXbow, calyptra];
for (const it of items) assertId(it._id, it.name);
assertId(desertRose._id, desertRose.name);
assertId(midnight._id, midnight.name);
for (const a of [desertRose, midnight]) {
  for (const it of a.items) assertId(it._id, `${a.name}/${it.name}`);
}

for (const it of items) {
  fs.writeFileSync(path.join(itemsDir, `${it._id}.json`), JSON.stringify(it, null, 2) + "\n");
}
fs.writeFileSync(path.join(actorsDir, `${desertRose._id}.json`), JSON.stringify(desertRose, null, 2) + "\n");
fs.writeFileSync(path.join(actorsDir, `${midnight._id}.json`), JSON.stringify(midnight, null, 2) + "\n");

console.log("wrote", {
  items: items.map((i) => i._id),
  actors: [desertRose._id, midnight._id],
});


