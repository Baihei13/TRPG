import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
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

function assertId(id, label) {
  if (!/^[a-zA-Z0-9]{16}$/.test(id)) throw new Error(`bad id ${label}: ${id} (${id.length})`);
}

const poetic = {
  _id: "whbHuntPoetJust1",
  folder: "whbHntFldWpn0001",
  name: "诗意的正义 Poetic Justice",
  type: "weapon",
  img: "modules/wang-pf2e-homebrew/assets/hunt/poetic-justice.png",
  system: {
    description: {
      value:
        "<p>他们不该死得这么惨。他们只想调查并提供帮助。但第26团根本无法与腐败抗衡，所以他们以前的军士锻造了这把霰弹枪，试图以此来<strong>平衡他们灵魂的重量</strong>。</p>\n<blockquote><p><strong>兵器之书 · RIVAL 78 SHORTY · POETIC JUSTICE</strong> 短双管并排霰弹：近距诗意，远距只剩回声。</p></blockquote>\n<p><strong>熟练</strong> 持用期间视为受训。</p>\n<hr />\n<p><strong>类别</strong> 军用火器；<strong>负载</strong> 1；<strong>单手</strong>（短管）；<strong>射程增量</strong> 20 尺；<strong>装填</strong> 1；双管容量 2</p>\n<p><strong>伤害</strong> 1d8 穿刺；特质：震荡、scatter、capacity-2</p>\n<hr />\n<p><strong>灵魂天平</strong> 以此武器击杀或重击时，你获得 @Damage[5[temporary|healing]]{5 临时生命值}（不叠，取高），持续 1 分钟——把战友灵魂的重量暂时压回枪膛这一边。</p>\n<p><strong>双管齐射</strong>（开关）开启时，一次操作同时打空双管：一次打击，伤害骰 <strong>+1d8</strong>，攻击 −2 环境；之后须分别装填。</p>",
      gm: "<p>Hunt Rival 78 Shorty skin「Poetic Justice / 诗意的正义」。1d8 P、20ft、cap2。击杀/重击给 5 temp HP。双管齐射开关。</p>",
    },
    rules: [
      { ...PROF },
      {
        key: "RollOption",
        domain: "damage",
        option: "hunt-poetic-both",
        toggleable: true,
        placement: "actions",
        label: "诗意的正义 — 双管齐射",
      },
      {
        key: "FlatModifier",
        selector: "strike-attack-roll",
        type: "circumstance",
        value: -2,
        label: "双管齐射",
        predicate: ["hunt-poetic-both", "item:id:{item|_id}"],
        hideIfDisabled: true,
      },
      {
        key: "DamageDice",
        selector: "damage",
        label: "双管齐射",
        diceNumber: 1,
        dieSize: "d8",
        damageType: "piercing",
        predicate: ["hunt-poetic-both", "item:id:{item|_id}"],
      },
      {
        key: "Note",
        selector: "strike-damage",
        title: "灵魂天平",
        text: "击杀或重击：获得 5 临时生命值（不叠）。",
        predicate: ["item:id:{item|_id}"],
      },
    ],
    slug: "poetic-justice",
    traits: {
      value: ["concussive", "scatter", "capacity-2"],
      rarity: "uncommon",
      otherTags: ["hunt-showdown", "hunt-weapon", "26th-regiment"],
    },
    publication: pub,
    level: { value: 3 },
    quantity: 1,
    baseItem: null,
    bulk: { value: 1 },
    hp: { value: 0, max: 0 },
    hardness: 0,
    price: { value: { gp: 14 } },
    equipped: { carryType: "worn", handsHeld: 0 },
    containerId: null,
    size: "med",
    material: { type: null, grade: null },
    identification: {
      status: "identified",
      unidentified: {
        name: "短双管霰弹枪",
        img: "systems/pf2e/icons/unidentified_item_icons/weapons.webp",
        data: { description: { value: "<p>锯短的并排双管，枪托刻着名字。</p>" } },
      },
    },
    usage: { value: "held-in-one-hand" },
    category: "martial",
    group: "firearm",
    bonus: { value: 0 },
    bonusDamage: { value: 0 },
    damage: { dice: 1, die: "d8", damageType: "piercing", persistent: null },
    splashDamage: { value: 0 },
    range: 20,
    expend: 1,
    ammo: { baseType: "rounds", builtIn: false, capacity: 2 },
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
      huntSlots: 2,
      enName: "Poetic Justice",
      wikiIcon: "Weapon_Rival_78_Shorty.png",
      theme: "26th-regiment",
      baseWeapon: "rival-78-shorty",
    },
  },
};

const betrayed = {
  _id: "whbHuntBetrLoy01",
  folder: "whbHntFldWpn0001",
  name: "背叛的忠诚 Betrayed Loyalty",
  type: "weapon",
  img: "modules/wang-pf2e-homebrew/assets/hunt/cavalry-saber.png",
  system: {
    description: {
      value:
        "<p>他们满怀热情地来到这里，准备发现伟大的秘密，凯旋而归。然而，腐败却另有打算。这把弯刀上刻着那些最终不得不扪心自问的人的名字——他们不得不问：<strong>盲目忠诚的代价是否值得</strong>。</p>\n<blockquote><p><strong>兵器之书 · CAVALRY SABER · BETRAYED LOYALTY</strong> 刃上刻名，像点名册；每一刀都是自问。</p></blockquote>\n<p><strong>熟练</strong> 持用期间视为受训。</p>\n<hr />\n<p><strong>类别</strong> 军用刀剑；<strong>负载</strong> 1；<strong>单手</strong></p>\n<p><strong>伤害</strong> 1d8 挥砍；特质：灵巧、致命 d8</p>\n<hr />\n<p><strong>点名册</strong> 命中时，你可低声念出一个刻名：目标须尝试 @Check[will|dc:resolve(@actor.level*2+14)|traits:emotion,mental,auditory]{意志}（DC = 14+等级×2）。失败则 @UUID[Compendium.pf2e.conditionitems.Item.TBSHQidQVSrGRTuq]{惊惧 1}（1 分钟）。同一目标每场遭遇仅首次。</p>\n<p><strong>扪心自问</strong>（开关）开启时，你下一次以此武器的攻击检定 +1 环境，且若目标是「权威/指挥官/要求盲目服从者」（GM），伤害额外 +2 状态。每场遭遇限用 1 次成功后关闭。</p>",
      gm: "<p>Hunt Cavalry Saber skin「Betrayed Loyalty / 背叛的忠诚」。1d8 S、灵巧、致命d8。点名册惊惧；扪心自问开关。</p>",
    },
    rules: [
      { ...PROF },
      {
        key: "RollOption",
        domain: "attack",
        option: "hunt-betrayed-question",
        toggleable: true,
        placement: "actions",
        label: "背叛的忠诚 — 扪心自问（本场1次）",
      },
      {
        key: "FlatModifier",
        selector: "strike-attack-roll",
        type: "circumstance",
        value: 1,
        label: "扪心自问",
        predicate: ["hunt-betrayed-question", "item:id:{item|_id}"],
        hideIfDisabled: true,
      },
      {
        key: "FlatModifier",
        selector: "damage",
        type: "status",
        value: 2,
        damageType: "slashing",
        label: "盲目忠诚的代价",
        predicate: ["hunt-betrayed-question", "item:id:{item|_id}", "hunt-target-authority"],
        hideIfDisabled: true,
      },
      {
        key: "RollOption",
        domain: "damage",
        option: "hunt-target-authority",
        toggleable: true,
        placement: "actions",
        label: "目标为权威/盲忠压迫者（GM）",
      },
      {
        key: "Note",
        selector: "strike-damage",
        title: "点名册",
        text: "命中可令目标意志豁免，失败惊惧 1（同目标本场首次）。",
        predicate: ["item:id:{item|_id}"],
      },
    ],
    slug: "betrayed-loyalty",
    traits: {
      value: ["agile", "finesse", "deadly-d8"],
      rarity: "uncommon",
      otherTags: ["hunt-showdown", "hunt-weapon", "26th-regiment"],
    },
    publication: pub,
    level: { value: 3 },
    quantity: 1,
    baseItem: "shortsword",
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
        name: "旧军刀",
        img: "systems/pf2e/icons/unidentified_item_icons/weapons.webp",
        data: { description: { value: "<p>刃上密密麻麻刻着人名。</p>" } },
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
    reload: { value: null },
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
      enName: "Betrayed Loyalty",
      wikiIcon: "Weapon_Cavalry_Saber.png",
      theme: "26th-regiment",
      baseWeapon: "cavalry-saber",
    },
  },
};

assertId(poetic._id, "poetic");
assertId(betrayed._id, "betrayed");
fs.writeFileSync(path.join(itemsDir, "whbHuntPoetJust1.json"), JSON.stringify(poetic, null, 2) + "\n");
fs.writeFileSync(path.join(itemsDir, "whbHuntBetrLoy01.json"), JSON.stringify(betrayed, null, 2) + "\n");
console.log("wrote weapons");

const liggins = {
  _id: "whbHuntSgtRigg01",
  folder: "whbfolderHntHt01",
  name: "里金斯中士 Sergeant Riggins",
  type: "npc",
  img: "modules/wang-pf2e-homebrew/assets/hunt/sergeant-liggins.png",
  items: [
    {
      _id: "whbSgPoetJust001",
      img: "modules/wang-pf2e-homebrew/assets/hunt/poetic-justice.png",
      name: "诗意的正义",
      sort: 100000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 16 },
        damageRolls: { whbSgDmgPoet001: { damage: "2d8+5", damageType: "piercing" } },
        description: {
          value:
            "<p>主手 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntPoetJust1]{诗意的正义}（Rival 78 Shorty）。射程增量 <strong>20 尺</strong>。击杀/重击：5 临时生命。</p>",
        },
        publication: pubH,
        range: 20,
        rules: [],
        slug: "riggins-poetic",
        traits: { value: ["concussive", "scatter"] },
      },
    },
    {
      _id: "whbSgDoubleBar01",
      img: "systems/pf2e/icons/actions/OneAction.webp",
      name: "双管齐射",
      sort: 110000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "offensive",
        description: {
          value:
            "<p>一次操作打空双管：一次「诗意的正义」打击，伤害 +1d8，攻击 −2 环境。用诗意去平衡灵魂。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "riggins-both",
        traits: { value: [] },
      },
    },
    {
      _id: "whbSgBetrLoy0001",
      img: "modules/wang-pf2e-homebrew/assets/hunt/cavalry-saber.png",
      name: "背叛的忠诚",
      sort: 200000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 16 },
        damageRolls: { whbSgDmgBetr001: { damage: "2d8+5", damageType: "slashing" } },
        description: {
          value:
            "<p>副手 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntBetrLoy01]{背叛的忠诚}。灵巧、致命 d8。命中可点名：@Check[will|dc:22|traits:emotion,mental,auditory]{意志 DC 22}，失败惊惧 1。</p>",
        },
        publication: pubH,
        range: null,
        rules: [],
        slug: "riggins-betrayed",
        traits: { value: ["agile", "finesse", "deadly-d8"] },
      },
    },
    {
      _id: "whbSgQuestion001",
      img: "systems/pf2e/icons/actions/TwoActions.webp",
      name: "扪心自问",
      sort: 300000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 2 },
        category: "offensive",
        description: {
          value:
            "<p><strong>频率</strong> 每场遭遇 1 次</p>\n<p>Stride，然后发动一次「背叛的忠诚」打击（+1 环境）。若目标是指挥官、军官或强迫他人盲从者，该次伤害 +2 状态，且点名册 DC 视为 24。</p>\n<p>他亲眼见过指挥官在压力下崩溃——刃上的名字都在问同一个问题。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "riggins-question",
        traits: { value: [] },
      },
    },
    {
      _id: "whbSgOrderMyst01",
      img: "systems/pf2e/icons/actions/OneAction.webp",
      name: "秩序 entreaty",
      sort: 400000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "defensive",
        description: {
          value:
            "<p>迷信式整顿：调整防毒面具、红绶与勋章，低声背诵军规。你获得 +2 状态加值于下一次豁免，或移除自己身上一个情绪/恐惧状态等级 1。每轮限 1 次。</p>\n<p>他对秩序的渴望已变成仪式。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "riggins-ritual",
        traits: { value: ["concentrate", "mental"] },
      },
    },
    {
      _id: "whbSgStillLearn1",
      img: "systems/pf2e/icons/actions/Passive.webp",
      name: "军队仍须学习",
      sort: 500000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "defensive",
        description: {
          value:
            "<p>他相信：若军队足够渴望学习，他们还有很多要学。对抗恐吓与「命令式」心灵效应时意志 +2 状态；但对魅惑与幻术 −1（神秘主义的裂缝）。</p>\n<p>先攻可用战争学或察觉。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "riggins-learn",
        traits: { value: [] },
      },
    },
    {
      _id: "whbSgSoulScales1",
      img: "systems/pf2e/icons/actions/Reaction.webp",
      name: "灵魂天平",
      sort: 600000,
      type: "action",
      system: {
        actionType: { value: "reaction" },
        actions: { value: null },
        category: "defensive",
        description: {
          value:
            "<p><strong>触发</strong> 30 尺内一个盟友降至 0 生命值或死亡</p>\n<p>他低吼第26团的名字：立刻获得 5 临时生命，并对触发来源的下一次打击 +2 环境。每场遭遇 1 次。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "riggins-scales",
        traits: { value: ["emotion"] },
      },
    },
    {
      _id: "whbSgTactics0001",
      img: "systems/pf2e/icons/actions/Passive.webp",
      name: "里金斯战术（GM）",
      sort: 900000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "offensive",
        description: {
          value:
            "<p><strong>定位</strong>：近距军士——霰弹开路，弯刀点名。</p>\n<ol>\n<li>贴脸 <strong>双管齐射</strong> 撕开阵型</li>\n<li>弯刀 <strong>点名册</strong> 制造惊惧</li>\n<li>对军官/盲忠压迫者打出 <strong>扪心自问</strong></li>\n<li>压力大时用 <strong>秩序仪式</strong> 稳住豁免</li>\n</ol>\n<p>忠诚崩坏后的神秘主义：纪律还在，信仰已经歪了。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "riggins-tactics",
        traits: { value: [] },
      },
    },
  ],
  effects: [],
  system: {
    abilities: {
      str: { mod: 3 },
      dex: { mod: 3 },
      con: { mod: 3 },
      int: { mod: 1 },
      wis: { mod: 2 },
      cha: { mod: 3 },
    },
    attributes: {
      ac: { details: "军装 + 防毒面具", value: 22 },
      allSaves: { value: "" },
      hp: {
        details: "第26团幸存者；靠仪式硬撑",
        max: 82,
        temp: 0,
        value: 82,
      },
      speed: { value: 25, otherSpeeds: [] },
      resistances: [],
      weaknesses: [],
      immunities: [],
    },
    details: {
      blurb: "第26团军士 · 秩序变迷信",
      languages: { details: "", value: ["common"] },
      level: { value: 4 },
      privateNotes:
        "<p>里金斯中士（Sgt. Riggins）。目睹指挥官崩溃后，忠诚→迷信→神秘主义。主：诗意的正义（Rival Shorty）；副：背叛的忠诚（骑兵弯刀）。</p>\n<p>Creature 4 近距军士。对 4×2 级团为严厉贴脸遭遇。</p>",
      publicNotes:
        "<p>防毒面具后是一双不肯松懈的眼睛。红绶、勋章与刻名弯刀证明：第26团死过一次，而他还在用霰弹与仪式给灵魂称重。</p>\n<p><em>四人 2 级团 · Creature 4 · 近距军士/神秘主义</em></p>",
      publication: pubH,
    },
    initiative: { statistic: "perception" },
    perception: {
      details: "面具滤镜；对腐败气味敏感",
      mod: 12,
      senses: [{ type: "low-light-vision" }],
    },
    resources: {},
    saves: {
      fortitude: { saveDetail: "", value: 14 },
      reflex: { saveDetail: "", value: 12 },
      will: { saveDetail: "+2 vs 恐吓/命令式心灵；−1 vs 魅惑/幻术", value: 12 },
    },
    skills: {
      athletics: { base: 14 },
      intimidation: { base: 14 },
      religion: { base: 11 },
      stealth: { base: 10 },
      warfare: { base: 14 },
    },
    traits: {
      rarity: "unique",
      size: { value: "med" },
      value: ["human", "humanoid"],
    },
  },
  prototypeToken: {
    name: "里金斯中士",
    width: 1,
    height: 1,
    texture: {
      src: "modules/wang-pf2e-homebrew/assets/hunt/sergeant-liggins.png",
      scaleX: 1,
      scaleY: 1,
    },
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
      huntHunter: "sergeant-riggins",
      theme: "26th-regiment",
      preferredLoadout: ["poetic-justice", "betrayed-loyalty"],
    },
  },
};

assertId(liggins._id, "liggins");
for (const i of liggins.items) assertId(i._id, i.name);

// fix awkward English action name
liggins.items.find((i) => i._id === "whbSgOrderMyst01").name = "秩序仪式";

fs.writeFileSync(path.join(actorsDir, "whbHuntSgtRigg01.json"), JSON.stringify(liggins, null, 2) + "\n");
console.log("wrote liggins", liggins.items.length);

const modPath = path.join(root, "module.json");
const mod = JSON.parse(fs.readFileSync(modPath, "utf8"));
mod.version = "1.16.0";
fs.writeFileSync(modPath, JSON.stringify(mod, null, 2) + "\n");
console.log("version", mod.version);
