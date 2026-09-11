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

const brassFlower = {
  _id: "whbHuntBrassFlw1",
  folder: "whbHntFldWpn0001",
  name: "黄铜花 Brass Flower",
  type: "weapon",
  img: "modules/wang-pf2e-homebrew/assets/hunt/lemat-mark-ii.png",
  system: {
    description: {
      value:
        "<p>哈丁警长最喜欢的配枪，据说在<strong>危急时刻</strong>威力十足。</p>\n<blockquote><p><strong>兵器之书 · LEMAT MARK II · BRASS FLOWER</strong> 九连发 + 霰弹筒；危急时砸下去最响。</p></blockquote>\n<p><strong>熟练</strong> 持用期间视为受训。</p>\n<hr />\n<p><strong>左轮模式</strong> 军用火器；负载 1；单手；射程增量 <strong>40 尺</strong>；装填 1；弹巢 9；伤害 1d8 穿刺；震荡、capacity-9</p>\n<p><strong>重拳（霰弹）</strong> 动作栏打击：射程增量 <strong>20 尺</strong>；1d8 穿刺；每场建议 1–2 发。命中：强韧 DC（14+等级×2）失败则 @UUID[Compendium.pf2e.conditionitems.Item.i3OJUmM1V6L8Lkbg]{击倒}（或退 5 尺）。</p>\n<hr />\n<p><strong>危急时刻</strong>（开关或半血自动）当你 HP ≤ 一半，或打开开关时：以此武器造成的伤害额外 @Damage[1d6[piercing]]。他最爱的配枪——筹码见底时才最狠。</p>",
      gm: "<p>LeMat skin「黄铜花」。1d8/40/cap9 + 霰弹。危急时刻 +1d6。</p>",
    },
    rules: [
      { ...PROF },
      {
        key: "RollOption",
        domain: "damage",
        option: "hunt-brass-chips-down",
        toggleable: true,
        placement: "actions",
        label: "黄铜花 — 危急时刻（半血/危机）",
      },
      {
        key: "DamageDice",
        selector: "damage",
        label: "危急时刻",
        diceNumber: 1,
        dieSize: "d6",
        damageType: "piercing",
        predicate: ["hunt-brass-chips-down", "item:id:{item|_id}"],
      },
      {
        key: "Strike",
        category: "martial",
        group: "firearm",
        slug: "brass-flower-punch",
        label: "黄铜花 · 重拳（霰弹）",
        img: "modules/wang-pf2e-homebrew/assets/hunt/lemat-mark-ii.png",
        damage: { base: { damageType: "piercing", dice: 1, die: "d8" } },
        traits: ["concussive", "scatter"],
        range: { increment: 20 },
      },
      {
        key: "Note",
        selector: "strike-damage",
        title: "重拳",
        text: "霰弹命中：强韧失败则击倒（或退 5 尺）。",
        predicate: ["item:slug:brass-flower-punch"],
      },
    ],
    slug: "brass-flower",
    traits: {
      value: ["concussive", "capacity-9"],
      rarity: "uncommon",
      otherTags: ["hunt-showdown", "hunt-weapon", "sheriff-hardin"],
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
        name: "黄铜左轮",
        img: "systems/pf2e/icons/unidentified_item_icons/weapons.webp",
        data: { description: { value: "<p>枪管下另有粗短筒。</p>" } },
      },
    },
    usage: { value: "held-in-one-hand" },
    category: "martial",
    group: "firearm",
    bonus: { value: 0 },
    bonusDamage: { value: 0 },
    damage: { dice: 1, die: "d8", damageType: "piercing", persistent: null },
    splashDamage: { value: 0 },
    range: 40,
    expend: 1,
    ammo: { baseType: "rounds", builtIn: false, capacity: 9 },
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
      enName: "Brass Flower",
      wikiIcon: "Weapon_LeMat.png",
      theme: "sheriff-hardin",
      baseWeapon: "lemat-mark-ii",
    },
  },
};

const peacemaker = {
  _id: "whbHuntPeaceMkr1",
  folder: "whbHntFldWpn0001",
  name: "和平缔造者 Peacemaker",
  type: "weapon",
  img: "modules/wang-pf2e-homebrew/assets/hunt/pax-trueshot.png",
  system: {
    description: {
      value:
        "<p>哈丁警长自诩为执法者的典范——为了维护辖区秩序，他会不惜一切代价。这把<strong>「真射和平」</strong>让他能够牢牢掌控自己的职责。消除威胁是通往和平最可靠的途径。</p>\n<blockquote><p><strong>兵器之书 · CALDWELL PAX TRUESHOT · PEACEMAKER</strong> 枪柄徽章写着：Wayne Hardin — Peacemaker — From the Grateful People of New Orleans — APR 1888。</p></blockquote>\n<p><strong>熟练</strong> 持用期间视为受训。</p>\n<hr />\n<p><strong>类别</strong> 军用火器；负载 1；单手；射程增量 <strong>60 尺</strong>（加长管）；装填 1；弹巢 6</p>\n<p><strong>伤害</strong> 1d8 穿刺；特质：震荡、capacity-6</p>\n<p><strong>弹药</strong> 同 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntPax000001]{Caldwell Pax}。</p>\n<hr />\n<p><strong>真射</strong>（开关）本场 1 次：下次此武器攻击检定 +2 环境。</p>\n<p><strong>消除威胁</strong> 对带有「威胁标记」、惊惧，或正在逃跑的目标：伤害额外 @Damage[1d4[precision]]，且忽略隐蔽持平。</p>\n<p><strong>重击者枪柄</strong> 可用枪柄近战打击（1d8 钝击，震荡）。</p>",
      gm: "<p>Pax Trueshot skin「和平缔造者」。60ft、真射+2、对威胁/惊惧/逃跑 +1d4 精密。</p>",
    },
    rules: [
      { ...PROF },
      {
        key: "RollOption",
        domain: "attack",
        option: "hunt-peace-trueshot",
        toggleable: true,
        placement: "actions",
        label: "和平缔造者 — 真射（本场1次）",
      },
      {
        key: "FlatModifier",
        selector: "strike-attack-roll",
        type: "circumstance",
        value: 2,
        label: "真射",
        predicate: ["hunt-peace-trueshot", "item:id:{item|_id}"],
        hideIfDisabled: true,
      },
      {
        key: "RollOption",
        domain: "damage",
        option: "hunt-peace-threat",
        toggleable: true,
        placement: "actions",
        label: "和平缔造者 — 目标为威胁/惊惧/逃跑",
      },
      {
        key: "DamageDice",
        selector: "damage",
        label: "消除威胁",
        diceNumber: 1,
        dieSize: "d4",
        damageType: "precision",
        predicate: ["hunt-peace-threat", "item:id:{item|_id}"],
      },
      {
        key: "Strike",
        category: "martial",
        group: "brawling",
        slug: "peacemaker-whip",
        label: "和平缔造者 枪柄打击",
        img: "systems/pf2e/icons/default-icons/melee.svg",
        damage: { base: { damageType: "bludgeoning", dice: 1, die: "d8" } },
        traits: ["concussive"],
        range: null,
      },
      {
        key: "Note",
        selector: "strike-damage",
        title: "消除威胁",
        text: "对威胁/惊惧/逃跑目标：+1d4 精密，忽略隐蔽持平。",
        predicate: ["hunt-peace-threat", "item:id:{item|_id}"],
      },
    ],
    slug: "peacemaker",
    traits: {
      value: ["concussive", "capacity-6"],
      rarity: "uncommon",
      otherTags: ["hunt-showdown", "hunt-weapon", "sheriff-hardin"],
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
        name: "加长左轮",
        img: "systems/pf2e/icons/unidentified_item_icons/weapons.webp",
        data: { description: { value: "<p>枪柄嵌着星徽。</p>" } },
      },
    },
    usage: { value: "held-in-one-hand" },
    category: "martial",
    group: "firearm",
    bonus: { value: 0 },
    bonusDamage: { value: 0 },
    damage: { dice: 1, die: "d8", damageType: "piercing", persistent: null },
    splashDamage: { value: 0 },
    range: 60,
    expend: 1,
    ammo: { baseType: "rounds", builtIn: false, capacity: 6 },
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
      enName: "Peacemaker",
      wikiIcon: "Weapon_Pax_Trueshot.png",
      theme: "sheriff-hardin",
      baseWeapon: "caldwell-pax-trueshot",
    },
  },
};

const theNoose = {
  _id: "whbHuntTheNoose1",
  folder: "whbHntFldWpn0001",
  name: "绞索 The Noose",
  type: "weapon",
  img: "modules/wang-pf2e-homebrew/assets/hunt/vetterli-71.png",
  system: {
    description: {
      value:
        "<p>作为法律和秩序的最后遗迹，哈丁警长人手不足，却依然能从那些欣赏他出色工作的人那里获得奢侈品。哈丁就是这样讲述这把维特利 71 的故事的，尽管街头巷尾的传闻却讲述了一个更加骇人听闻的版本。</p>\n<blockquote><p><strong>兵器之书 · VETTERLI 71 KARABINER · THE NOOSE</strong> 他口中的「礼物」；巷子里叫它绞索。</p></blockquote>\n<p><strong>熟练</strong> 持用期间视为受训。</p>\n<hr />\n<p><strong>类别</strong> 军用火器；负载 2；双手；射程增量 <strong>100 尺</strong>；装填 1</p>\n<p><strong>伤害</strong> 1d10 穿刺；特质：震荡、fatal-d10</p>\n<p><strong>弹药</strong> 同 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntVet71Kb01]{Vetterli 71 Karabiner}。</p>\n<hr />\n<p><strong>稳定架构</strong> 同 Vetterli：上回合未移动则本回合射程 +20、首次打击忽略隐蔽持平。</p>\n<p><strong>绞索</strong> 命中时目标速度 −10 尺（1 轮，不叠加）。重击时额外：目标须 @Check[fortitude|dc:resolve(@actor.level*2+14)|traits:incapacitation]{强韧}，失败则无法 Step（1 轮），且获得 @UUID[Compendium.pf2e.conditionitems.Item.TBSHQidQVSrGRTuq]{惊惧 1}（巷谣版「套索」）。</p>",
      gm: "<p>Vetterli 71 skin「绞索」。稳定架构 + 命中减速；重击套索惊惧/禁 Step。</p>",
    },
    rules: [
      { ...PROF },
      {
        key: "RollOption",
        domain: "all",
        option: "hunt-noose-braced",
        toggleable: true,
        placement: "actions",
        label: "绞索 — 稳定架构（上回合未移动）",
      },
      {
        key: "AdjustStrike",
        mode: "add",
        property: "range-increment",
        value: 20,
        definition: ["item:id:{item|_id}"],
        predicate: ["hunt-noose-braced"],
      },
      {
        key: "Note",
        selector: "strike-attack-roll",
        title: "稳定架构",
        text: "本回合第一次打击：忽略隐蔽持平。",
        predicate: ["hunt-noose-braced", "item:id:{item|_id}"],
      },
      {
        key: "Note",
        selector: "strike-damage",
        title: "绞索",
        text: "命中：速度 −10 尺（1 轮）。重击：强韧失败则无法 Step + 惊惧 1。",
        predicate: ["item:id:{item|_id}"],
      },
    ],
    slug: "the-noose",
    traits: {
      value: ["concussive", "fatal-d10"],
      rarity: "uncommon",
      otherTags: ["hunt-showdown", "hunt-weapon", "sheriff-hardin"],
    },
    publication: pub,
    level: { value: 3 },
    quantity: 1,
    baseItem: null,
    bulk: { value: 2 },
    hp: { value: 0, max: 0 },
    hardness: 0,
    price: { value: { gp: 16 } },
    equipped: { carryType: "worn", handsHeld: 0 },
    containerId: null,
    size: "med",
    material: { type: null, grade: null },
    identification: {
      status: "identified",
      unidentified: {
        name: "卡宾枪",
        img: "systems/pf2e/icons/unidentified_item_icons/weapons.webp",
        data: { description: { value: "<p>枪托磨得发亮的卡宾。</p>" } },
      },
    },
    usage: { value: "held-in-two-hands" },
    category: "martial",
    group: "firearm",
    bonus: { value: 0 },
    bonusDamage: { value: 0 },
    damage: { dice: 1, die: "d10", damageType: "piercing", persistent: null },
    splashDamage: { value: 0 },
    range: 100,
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
      enName: "The Noose",
      wikiIcon: "Weapon_Vetterli_71.png",
      theme: "sheriff-hardin",
      baseWeapon: "vetterli-71-karabiner",
    },
  },
};

for (const it of [brassFlower, peacemaker, theNoose]) {
  assertId(it._id, it.name);
  fs.writeFileSync(path.join(itemsDir, `${it._id}.json`), JSON.stringify(it, null, 2) + "\n");
}

const wayne = {
  _id: "whbHuntWayneHar1",
  folder: "whbfolderHntHt01",
  name: "韦恩·哈丁警长 Sheriff Wayne Hardin",
  type: "npc",
  img: "modules/wang-pf2e-homebrew/assets/hunt/wayne-hardin.png",
  items: [
    {
      _id: "whbWhNooseStrik1",
      img: "modules/wang-pf2e-homebrew/assets/hunt/vetterli-71.png",
      name: "绞索",
      sort: 100000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 17 },
        damageRolls: { whbWhDmgNoose01: { damage: "2d10+5", damageType: "piercing" } },
        description: {
          value:
            "<p>主火力 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntTheNoose1]{绞索}（Vetterli 71）。射程 <strong>100 尺</strong>。命中速度 −10；重击「套索」强韧失败则无法 Step + 惊惧 1。</p>",
        },
        publication: pubH,
        range: 100,
        rules: [],
        slug: "hardin-noose",
        traits: { value: ["concussive", "fatal-d10"] },
      },
    },
    {
      _id: "whbWhPeaceStrik1",
      img: "modules/wang-pf2e-homebrew/assets/hunt/pax-trueshot.png",
      name: "和平缔造者",
      sort: 200000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 16 },
        damageRolls: { whbWhDmgPeace01: { damage: "2d8+4", damageType: "piercing" } },
        description: {
          value:
            "<p>@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntPeaceMkr1]{和平缔造者}（Pax Trueshot）。射程 <strong>60 尺</strong>。真射本场 1 次 +2；对威胁/惊惧/逃跑 +1d4 精密。</p>",
        },
        publication: pubH,
        range: 60,
        rules: [],
        slug: "hardin-peacemaker",
        traits: { value: ["concussive"] },
      },
    },
    {
      _id: "whbWhBrassStrik1",
      img: "modules/wang-pf2e-homebrew/assets/hunt/lemat-mark-ii.png",
      name: "黄铜花",
      sort: 210000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 16 },
        damageRolls: { whbWhDmgBrass01: { damage: "2d8+3", damageType: "piercing" } },
        description: {
          value:
            "<p>最爱的配枪 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntBrassFlw1]{黄铜花}（LeMat）。射程 <strong>40 尺</strong>；弹巢 9。半血/危急时伤害 +1d6。另有霰弹重拳 20 尺。</p>",
        },
        publication: pubH,
        range: 40,
        rules: [],
        slug: "hardin-brass-flower",
        traits: { value: ["concussive"] },
      },
    },
    {
      _id: "whbWhThreatMark1",
      img: "systems/pf2e/icons/actions/OneAction.webp",
      name: "点名威胁",
      sort: 300000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "offensive",
        description: {
          value:
            "<p>点名 60 尺内一个生物为「威胁」（听觉、心智）。目标获得威胁标记至遭遇结束（同时仅 1 个）。你对其恐吓检定 +2；和平缔造者对其视为消除威胁目标。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "hardin-mark-threat",
        traits: { value: ["auditory", "mental"] },
      },
    },
    {
      _id: "whbWhReArrest001",
      img: "systems/pf2e/icons/actions/TwoActions.webp",
      name: "重新逮捕",
      sort: 400000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 2 },
        category: "offensive",
        description: {
          value:
            "<p>他招过的「猎人」囚犯不可靠——失控时他把他们再铐回去。</p>\n<p>对邻接生物：运动或杂技对抗其反射 DC，或对方 @Check[will|dc:21|traits:mental,auditory]{意志 DC 21}（徽章威压，二选一）。成功则目标 @UUID[Compendium.pf2e.conditionitems.Item.kWc1fhmv9LBiTuei]{擒抱}；若目标已是你的「前囚犯/不可靠猎人」（GM）或已有惊惧，改为 @UUID[Compendium.pf2e.conditionitems.Item.VcDeM8A5oI6VqhbM]{束缚}（至你下回合结束，或挣脱）。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "hardin-rearrest",
        traits: { value: ["attack"] },
      },
    },
    {
      _id: "whbWhQuarant0001",
      img: "systems/pf2e/icons/actions/OneAction.webp",
      name: "疫情封锁令",
      sort: 410000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "offensive",
        description: {
          value:
            "<p><strong>频率</strong> 每场遭遇 1 次</p>\n<p>疫情初期他拦过蔓延——现在仍会喊封锁。15 尺爆发（听觉）：区域内敌人 @Check[will|dc:20|traits:auditory,fear,mental]{意志 DC 20}。失败惊惧 1 且本回合速度减半；大失败惊惧 2。盟友可选择不豁免并获得下次对「感染/疫病」类效果豁免 +1（1 分钟）。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "hardin-quarantine",
        traits: { value: ["auditory", "fear", "mental"] },
      },
    },
    {
      _id: "whbWhHandcuff001",
      img: "systems/pf2e/icons/actions/Reaction.webp",
      name: "不可靠则铐回",
      sort: 420000,
      type: "action",
      system: {
        actionType: { value: "reaction" },
        actions: { value: null },
        category: "defensive",
        description: {
          value:
            "<p><strong>触发</strong> 30 尺内一个你曾视为「囚犯猎人/不可靠」的生物对你造成伤害，或试图逃跑/遁入隐蔽</p>\n<p>立刻对其发动一次黄铜花或和平缔造者打击，或 Stride 至邻接后尝试重新逮捕（仍耗反应，该次逮捕视为 1 动作版：仅擒抱，不升束缚）。每场遭遇 1 次。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "hardin-unreliable",
        traits: { value: [] },
      },
    },
    {
      _id: "whbWhLastLaw0001",
      img: "systems/pf2e/icons/actions/Passive.webp",
      name: "法律与秩序的遗迹",
      sort: 500000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "defensive",
        description: {
          value:
            "<p>人手不足仍撑着辖区。对抗恐惧/魅惑 +1 状态；对「逃跑、躲藏、违约」目标先攻与察觉 +2 环境。半血时黄铜花自动视为危急时刻开启。</p>\n<p>他会不惜一切维持秩序——包括把当初招来的猎人重新逮捕。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "hardin-last-law",
        traits: { value: [] },
      },
    },
    {
      _id: "whbWhTactics0001",
      img: "systems/pf2e/icons/actions/Passive.webp",
      name: "哈丁战术（GM）",
      sort: 900000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "offensive",
        description: {
          value:
            "<p><strong>定位</strong>：执法警长，远距卡宾 + 双左轮控场。疫情老手，囚犯猎人克星。</p>\n<ol>\n<li>绞索远点减速，点名威胁</li>\n<li>和平缔造者真射收威胁</li>\n<li>贴身黄铜花 / 重拳；半血叠危急</li>\n<li>不可靠则铐回 + 重新逮捕</li>\n</ol>",
        },
        publication: pubH,
        rules: [],
        slug: "hardin-tactics",
        traits: { value: [] },
      },
    },
  ],
  effects: [],
  system: {
    abilities: {
      str: { mod: 2 },
      dex: { mid: 3 },
      con: { mod: 2 },
      int: { mod: 1 },
      wis: { mod: 3 },
      cha: { mod: 3 },
    },
    attributes: {
      ac: { details: "皮风衣 + 星徽", value: 21 },
      allSaves: { value: "" },
      hp: { details: "秩序撑着的老骨头", max: 82, temp: 0, value: 82 },
      speed: { value: 25, otherSpeeds: [] },
      resistances: [],
      weaknesses: [],
      immunities: [],
    },
    details: {
      blurb: "警长 · 疫情初期的法律遗迹",
      languages: { details: "", value: ["common"] },
      level: { value: 4 },
      privateNotes:
        "<p>韦恩·哈丁警长 Sheriff Wayne Hardin。主：绞索；副：和平缔造者、黄铜花。招过不可靠猎人囚犯，失控则再逮捕。Creature 4 执法控场。</p>",
      publicNotes:
        "<p>疫情初期，他拦过蔓延；招来的猎人囚犯却不可靠，失控后他亲手铐回许多人。星徽、真射和平、巷谣里的绞索——秩序的最后遗迹。</p>\n<p><em>四人 2 级团 · Creature 4 · 执法/控场</em></p>",
      publication: pubH,
    },
    initiative: { statistic: "perception" },
    perception: { details: "盯着谁在逃跑", mod: 15, senses: [{ type: "low-light-vision" }] },
    resources: {},
    saves: {
      fortitude: { saveDetail: "", value: 12 },
      reflex: { saveDetail: "", value: 13 },
      will: { saveDetail: "+1 vs 恐惧/魅惑", value: 15 },
    },
    skills: {
      athletics: { base: 12 },
      intimidation: { base: 14 },
      medicine: { base: 11 },
      society: { base: 13 },
      stealth: { base: 11 },
      survival: { base: 13 },
    },
    traits: { rarity: "unique", size: { value: "med" }, value: ["human", "humanoid"] },
  },
  prototypeToken: {
    name: "哈丁警长",
    width: 1,
    height: 1,
    texture: {
      src: "modules/wang-pf2e-homebrew/assets/hunt/wayne-hardin.png",
      scaleX: 1,
      scaleY: 1,
    },
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
      huntHunter: "wayne-hardin",
      theme: "sheriff-hardin",
      preferredLoadout: ["the-noose", "peacemaker", "brass-flower"],
    },
  },
};

wayne.system.abilities.dex = { mod: 3 };

assertId(wayne._id, "wayne");
for (const i of wayne.items) assertId(i._id, i.name);

fs.writeFileSync(path.join(actorsDir, "whbHuntWayneHar1.json"), JSON.stringify(wayne, null, 2) + "\n");
console.log("wrote wayne", wayne.items.length);

const modRaw = fs.readFileSync(path.join(root, "module.json"));
const modText = modRaw[0] === 0xef && modRaw[1] === 0xbb && modRaw[2] === 0xbf
  ? modRaw.slice(3).toString("utf8")
  : modRaw.toString("utf8");
const mod = JSON.parse(modText);
mod.version = "1.22.0";
fs.writeFileSync(path.join(root, "module.json"), JSON.stringify(mod, null, 2) + "\n");
console.log("version", mod.version);
