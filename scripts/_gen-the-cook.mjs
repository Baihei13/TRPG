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
const pubT = { ...pub, title: "猎杀对决 — 投掷" };
const pubTac = { ...pub, title: "猎杀对决 — 战术" };

function assertId(id, label) {
  if (!/^[a-zA-Z0-9]{16}$/.test(id)) throw new Error(`bad id ${label}: ${id} (${id.length})`);
}

const chefsKiss = {
  _id: "whbHuntChefKiss1",
  folder: "whbHntFldWpn0001",
  name: "主厨之吻 Chef's Kiss",
  type: "weapon",
  img: "modules/wang-pf2e-homebrew/assets/hunt/vandal-73c.png",
  system: {
    description: {
      value:
        "<p>这把步枪能用子弹将活肉打得血肉模糊，让恐惧的咸汗渗入伤口，如同大自然的调味料。这是厨师的招牌堕落食谱之一……他做不出其他任何方法烹制他的<strong>胆汁炖猎人腿肉</strong>！</p>\n<blockquote><p><strong>兵器之书 · VANDAL 73C · CHEF'S KISS</strong> 杠杆卡宾当嫩肉锤：先打松，再入锅。</p></blockquote>\n<p><strong>熟练</strong> 持用期间视为受训。</p>\n<hr />\n<p><strong>类别</strong> 军用火器；负载 2；双手；射程增量 <strong>70 尺</strong>；装填 1；容量 7</p>\n<p><strong>伤害</strong> 1d8 穿刺；特质：震荡、capacity-7</p>\n<hr />\n<p><strong>嫩肉处理</strong> 命中时目标获得 @Damage[1d4[persistent,bleed]]，且须尝试 @Check[will|dc:resolve(@actor.level*2+14)|traits:emotion,fear,mental]{意志}（DC=14+等级×2）。失败则惊惧 1（1 分钟；同目标本场首次）。恐惧的咸汗就是调味。</p>\n<p><strong>胆汁炖腿</strong>（开关）若目标已流血或惊惧，本武器伤害 +2 状态。</p>",
      gm: "<p>Vandal 73C skin「Chef's Kiss / 主厨之吻」。1d8、70ft、cap7。命中流血+惊惧；对流血/惊惧目标 +2。</p>",
    },
    rules: [
      { ...PROF },
      {
        key: "DamageDice",
        selector: "damage",
        slug: "hunt-chef-tenderize",
        label: "嫩肉处理",
        diceNumber: 1,
        dieSize: "d4",
        damageType: "bleed",
        category: "persistent",
        predicate: ["item:id:{item|_id}"],
      },
      {
        key: "RollOption",
        domain: "damage",
        option: "hunt-chef-braise",
        toggleable: true,
        placement: "actions",
        label: "主厨之吻 — 目标已流血/惊惧（胆汁炖腿）",
      },
      {
        key: "FlatModifier",
        selector: "damage",
        type: "status",
        value: 2,
        damageType: "piercing",
        label: "胆汁炖腿",
        predicate: ["hunt-chef-braise", "item:id:{item|_id}"],
        hideIfDisabled: true,
      },
      {
        key: "Note",
        selector: "strike-damage",
        title: "嫩肉处理",
        text: "1d4 持续流血；意志失败则惊惧 1（同目标本场首次）。",
        predicate: ["item:id:{item|_id}"],
      },
    ],
    slug: "chefs-kiss",
    traits: {
      value: ["concussive", "capacity-7"],
      rarity: "uncommon",
      otherTags: ["hunt-showdown", "hunt-weapon", "the-cook"],
    },
    publication: pub,
    level: { value: 3 },
    quantity: 1,
    baseItem: null,
    bulk: { value: 2 },
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
        name: "油污杠杆步枪",
        img: "systems/pf2e/icons/unidentified_item_icons/weapons.webp",
        data: { description: { value: "<p>枪管沾着可疑的油脂。</p>" } },
      },
    },
    usage: { value: "held-in-two-hands" },
    category: "martial",
    group: "firearm",
    bonus: { value: 0 },
    bonusDamage: { value: 0 },
    damage: { dice: 1, die: "d8", damageType: "piercing", persistent: null },
    splashDamage: { value: 0 },
    range: 70,
    expend: 1,
    ammo: { baseType: "rounds", builtIn: false, capacity: 7 },
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
      enName: "Chef's Kiss",
      wikiIcon: "Weapon_Vandal_73C.png",
      theme: "the-cook",
      baseWeapon: "vandal-73c",
    },
  },
};

const forkRoad = {
  _id: "whbHuntForkRoad1",
  folder: "whbHntFldWpn0001",
  name: "岔路口 Fork in the Road",
  type: "weapon",
  img: "modules/wang-pf2e-homebrew/assets/hunt/throwing-axes.png",
  system: {
    description: {
      value:
        "<p>在厨师为受害者的肉调味准备食用之前，他会先用粗暴、冷酷的精准手法肢解尸体。他用这些<strong>锯齿状的投掷斧</strong>将四肢从躯干上砍下，将血肉从骨髓上剔除。</p>\n<blockquote><p><strong>兵器之书 · THROWING AXES · FORK IN THE ROAD</strong> 分尸的岔路：一斧定肢。</p></blockquote>\n<p><strong>熟练</strong> 持用期间视为受训。</p>\n<hr />\n<p><strong>类别</strong> 军用斧；负载 L；单手；伤害 1d8 挥砍；特质：敏捷、横扫、thrown-20</p>\n<p>同 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntThrAxe001]{投掷斧} 的破甲投掷。</p>\n<hr />\n<p><strong>肢解预备</strong> 投掷命中时，目标速度 −5 尺（1 轮，不叠），且你下次近战该目标 +1 环境（已分开的「部位」更好下刀）。</p>",
      gm: "<p>Throwing Axes skin「Fork in the Road / 岔路口」。肢解：减速 5 尺 + 下次近战 +1。</p>",
    },
    rules: [
      { ...PROF },
      {
        key: "FlatModifier",
        selector: "strike-attack-roll",
        type: "circumstance",
        value: 2,
        label: "破甲投掷",
        predicate: ["item:id:{item|_id}", "item:ranged"],
      },
      {
        key: "Note",
        selector: "strike-damage",
        title: "肢解预备",
        text: "投掷命中：目标速度 −5 尺（1 轮）；你下次近战该目标 +1。",
        predicate: ["item:id:{item|_id}", "item:ranged"],
      },
    ],
    slug: "fork-in-the-road",
    traits: {
      value: ["agile", "sweep", "thrown"],
      rarity: "uncommon",
      otherTags: ["hunt-showdown", "hunt-weapon", "the-cook"],
    },
    publication: pub,
    level: { value: 2 },
    quantity: 2,
    baseItem: "hatchet",
    bulk: { value: 0.1 },
    hp: { value: 0, max: 0 },
    hardness: 0,
    price: { value: { gp: 3 } },
    equipped: { carryType: "worn", handsHeld: 0 },
    containerId: null,
    size: "med",
    material: { type: null, grade: null },
    identification: {
      status: "identified",
      unidentified: {
        name: "锯齿小斧",
        img: "systems/pf2e/icons/unidentified_item_icons/weapons.webp",
        data: { description: { value: "<p>刃口开齿的投掷斧。</p>" } },
      },
    },
    usage: { value: "held-in-one-hand" },
    category: "martial",
    group: "axe",
    bonus: { value: 0 },
    bonusDamage: { value: 0 },
    damage: { dice: 1, die: "d8", damageType: "slashing", persistent: null },
    splashDamage: { value: 0 },
    range: 20,
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
      enName: "Fork in the Road",
      theme: "the-cook",
      baseWeapon: "throwing-axes",
    },
  },
};

const tastemaker = {
  _id: "whbHuntTasteMkr1",
  folder: "whbHntFldWpn0001",
  name: "品味制造者 Tastemaker",
  type: "weapon",
  img: "modules/wang-pf2e-homebrew/assets/hunt/heavy-knife.png",
  system: {
    description: {
      value:
        "<p>起初，这把重刀的刀刃只知晓适合精致佳肴的食材。后来，它在生死搏斗中尝到了血肉的滋味。如今，它渴望一种病态的混合体，因为在沼泽地带，<strong>敌人和食物</strong>之间的界限已经变得模糊不清。</p>\n<blockquote><p><strong>兵器之书 · HEAVY KNIFE · TASTEMAKER</strong> 厨刀进修杀手课。</p></blockquote>\n<p><strong>熟练</strong> 持用期间视为受训。</p>\n<hr />\n<p><strong>类别</strong> 军用刀剑；负载 L；单手；伤害 1d6 挥砍；特质：灵巧、致命 d8</p>\n<hr />\n<p><strong>尝味</strong> 若目标本回合已被你的火器或投掷斧命中，此刀打击 +1 环境且额外 @Damage[1d4[precision]]。</p>\n<p><strong>敌即食</strong> 击杀或重击时，你恢复 @Damage[(1d6)[healing]]（每轮最多一次）——食欲得到片刻满足。</p>",
      gm: "<p>Heavy Knife skin「Tastemaker」。1d6 灵巧致命d8。火器/斧后接刀精密；击杀/重击回 1d6。</p>",
    },
    rules: [
      { ...PROF },
      {
        key: "RollOption",
        domain: "attack",
        option: "hunt-taste-prepped",
        toggleable: true,
        placement: "actions",
        label: "品味制造者 — 本回合已火器/斧命中该目标",
      },
      {
        key: "FlatModifier",
        selector: "strike-attack-roll",
        type: "circumstance",
        value: 1,
        label: "尝味",
        predicate: ["hunt-taste-prepped", "item:id:{item|_id}"],
        hideIfDisabled: true,
      },
      {
        key: "DamageDice",
        selector: "damage",
        label: "尝味",
        diceNumber: 1,
        dieSize: "d4",
        damageType: "precision",
        predicate: ["hunt-taste-prepped", "item:id:{item|_id}"],
      },
      {
        key: "Note",
        selector: "strike-damage",
        title: "敌即食",
        text: "击杀或重击：恢复 1d6（每轮一次）。",
        predicate: ["item:id:{item|_id}"],
      },
    ],
    slug: "tastemaker",
    traits: {
      value: ["agile", "finesse", "deadly-d8"],
      rarity: "uncommon",
      otherTags: ["hunt-showdown", "hunt-weapon", "the-cook"],
    },
    publication: pub,
    level: { value: 2 },
    quantity: 1,
    baseItem: "dagger",
    bulk: { value: 0.1 },
    hp: { value: 0, max: 0 },
    hardness: 0,
    price: { value: { gp: 4 } },
    equipped: { carryType: "worn", handsHeld: 0 },
    containerId: null,
    size: "med",
    material: { type: null, grade: null },
    identification: {
      status: "identified",
      unidentified: {
        name: "厚背厨刀",
        img: "systems/pf2e/icons/unidentified_item_icons/weapons.webp",
        data: { description: { value: "<p>沾着暗红的重刀。</p>" } },
      },
    },
    usage: { value: "held-in-one-hand" },
    category: "martial",
    group: "knife",
    bonus: { value: 0 },
    bonusDamage: { value: 0 },
    damage: { dice: 1, die: "d6", damageType: "slashing", persistent: null },
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
      enName: "Tastemaker",
      theme: "the-cook",
      baseWeapon: "heavy-knife",
    },
  },
};

const boneBroth = {
  _id: "whbHuntBoneBroth",
  folder: "whbHntFldTact001",
  name: "骨汤 Bone Broth",
  type: "consumable",
  img: "modules/wang-pf2e-homebrew/assets/hunt/hive-bomb.png",
  system: {
    description: {
      value:
        "<p>这颗蜂巢炸弹里装满了堕落的肉蜂，它们对人肉中的蛋白质有着邪恶的渴望。它们特殊的毒液会渗入骨髓，为厨师特制的<strong>骨汤</strong>做好充分的准备。</p>\n<blockquote><p><strong>蜂巢炸弹 · BONE BROTH</strong> 肉蜂入髓，汤底自来。</p></blockquote>\n<hr />\n<p>规则同 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntHive00001]{蜂巢炸弹}：30 尺投掷，5 尺爆发，非怪物获得猎杀中毒 <strong>3 层</strong>。</p>\n<p><strong>入髓</strong> 首次被此炸弹上毒的目标额外获得 @Damage[1d4[poison]]，且对你的「品味制造者」打击措手不及 1 轮（骨髓已入味）。</p>",
      gm: "<p>Hive Bomb skin「Bone Broth / 骨汤」。中毒3层 +1d4毒；对厨刀措手不及1轮。</p>",
    },
    rules: [],
    slug: "bone-broth",
    traits: {
      value: ["alchemical", "consumable", "poison"],
      rarity: "uncommon",
      otherTags: ["hunt-showdown", "hunt-throwable", "the-cook"],
    },
    publication: pubT,
    level: { value: 4 },
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
        name: "蜂巢罐",
        img: "systems/pf2e/icons/unidentified_item_icons/other-consumables.webp",
        data: { description: { value: "<p>嗡鸣的铁罐。</p>" } },
      },
      misidentified: {},
    },
    category: "other",
    uses: { value: 1, max: 1, autoDestroy: true },
    damage: null,
    usage: { value: "held-in-one-hand" },
    stackGroup: null,
  },
  flags: {
    "wang-pf2e-homebrew": {
      source: "hunt-showdown",
      huntSlot: 1,
      huntCategory: "tactic",
      enName: "Bone Broth",
      theme: "the-cook",
      skinOf: "whbHuntHive00001",
    },
  },
};

const finalSip = {
  _id: "whbHuntFinalSip1",
  folder: "whbHntFldTact001",
  name: "最后一口 Final Sip",
  type: "equipment",
  img: "systems/pf2e/icons/equipment/worn-items/other-worn-items/demon-mask.webp",
  system: {
    description: {
      value:
        "<p>每天，渗入厨师血管的腐败都会更深地渗入他的体内。他随身携带这件护符，以防万一他感觉到需要<strong>食物中毒</strong>——这是对他永无止境的死亡渴望的一种残酷的情感上的安全感。</p>\n<blockquote><p><strong>武器护符 · FINAL SIP</strong> 最后一口：中毒也是安全感。</p></blockquote>\n<hr />\n<p><strong>用法</strong> 附着武器（投资）。</p>\n<p><strong>效果</strong> 你对毒素伤害抗性 3。每场遭遇 1 次，当你造成猎杀中毒或持续流血时，可额外令目标尝试强韧 DC（14+等级×2）：失败则恶心 1（1 分钟）——「食物中毒」上桌。</p>",
      gm: "<p>Charm「Final Sip / 最后一口」。毒抗 3；本场1次附加恶心。</p>",
    },
    rules: [
      {
        key: "Resistance",
        type: "poison",
        value: 3,
      },
      {
        key: "Note",
        selector: "strike-damage",
        title: "最后一口",
        text: "本场 1 次：造成中毒/流血时可令目标强韧，失败恶心 1。",
      },
    ],
    slug: "final-sip",
    traits: {
      value: ["invested"],
      rarity: "uncommon",
      otherTags: ["hunt-showdown", "hunt-charm", "the-cook"],
    },
    publication: pubTac,
    level: { value: 3 },
    quantity: 1,
    baseItem: null,
    bulk: { value: 0 },
    price: { value: { gp: 18 } },
    equipped: { carryType: "worn", invested: true },
    containerId: null,
    size: "med",
    identification: {
      status: "identified",
      unidentified: {
        name: "油腻护符",
        img: "systems/pf2e/icons/unidentified_item_icons/other-consumables.webp",
        data: { description: { value: "<p>挂着小勺的护符。</p>" } },
      },
      misidentified: {},
    },
    usage: { value: "worn" },
  },
  flags: {
    "wang-pf2e-homebrew": {
      source: "hunt-showdown",
      huntCategory: "tactic",
      enName: "Final Sip",
      theme: "the-cook",
    },
  },
};

const items = [chefsKiss, forkRoad, tastemaker, boneBroth, finalSip];
for (const it of items) {
  assertId(it._id, it.name);
  fs.writeFileSync(path.join(itemsDir, `${it._id}.json`), JSON.stringify(it, null, 2) + "\n");
}
console.log("wrote items", items.length);

const cook = {
  _id: "whbHuntGrizzLev1",
  folder: "whbfolderHntHt01",
  name: "格里兹·莱文森 Grizz Levinson",
  type: "npc",
  img: "modules/wang-pf2e-homebrew/assets/hunt/grizz-levinson.png",
  items: [
    {
      _id: "whbCkChefKiss001",
      img: "modules/wang-pf2e-homebrew/assets/hunt/vandal-73c.png",
      name: "主厨之吻",
      sort: 100000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 16 },
        damageRolls: { whbCkDmgKiss01: { damage: "2d8+5", damageType: "piercing" } },
        description: {
          value:
            "<p>主手 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntChefKiss1]{主厨之吻}（Vandal 73C）。射程 <strong>70 尺</strong>。命中：1d4 持续流血 + 意志 DC22 惊惧 1（同目标本场首次）。对流血/惊惧目标伤害 +2。</p>",
        },
        publication: pubH,
        range: 70,
        rules: [],
        slug: "cook-chefs-kiss",
        traits: { value: ["concussive"] },
      },
    },
    {
      _id: "whbCkForkRoad001",
      img: "modules/wang-pf2e-homebrew/assets/hunt/throwing-axes.png",
      name: "岔路口",
      sort: 200000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 16 },
        damageRolls: { whbCkDmgFork01: { damage: "2d8+5", damageType: "slashing" } },
        description: {
          value:
            "<p>@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntForkRoad1]{岔路口}（锯齿投掷斧）。近战或投掷 20 尺。投掷命中：速度 −5 尺（1 轮）；下次近战该目标 +1。</p>",
        },
        publication: pubH,
        range: 20,
        rules: [],
        slug: "cook-fork",
        traits: { value: ["agile", "sweep", "thrown"] },
      },
    },
    {
      _id: "whbCkTasteMkr001",
      img: "modules/wang-pf2e-homebrew/assets/hunt/heavy-knife.png",
      name: "品味制造者",
      sort: 300000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 16 },
        damageRolls: { whbCkDmgTaste1: { damage: "2d6+5", damageType: "slashing" } },
        description: {
          value:
            "<p>@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntTasteMkr1]{品味制造者}。若本回合已用步枪/斧命中该目标：+1 攻击与 +1d4 精密。击杀/重击恢复 1d6。</p>",
        },
        publication: pubH,
        range: null,
        rules: [],
        slug: "cook-tastemaker",
        traits: { value: ["agile", "finesse", "deadly-d8"] },
      },
    },
    {
      _id: "whbCkBoneBroth01",
      img: "modules/wang-pf2e-homebrew/assets/hunt/hive-bomb.png",
      name: "骨汤",
      sort: 400000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "offensive",
        description: {
          value:
            "<p>投掷 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntBoneBroth]{骨汤}（蜂巢皮）。5 尺爆发：猎杀中毒 3 层 +1d4 毒；入髓者对品味制造者措手不及 1 轮。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "cook-broth",
        traits: { value: ["poison"] },
      },
    },
    {
      _id: "whbCkRecipe00001",
      img: "systems/pf2e/icons/actions/TwoActions.webp",
      name: "招牌食谱：胆汁炖腿",
      sort: 500000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 2 },
        category: "offensive",
        description: {
          value:
            "<p><strong>频率</strong> 每场遭遇 1 次</p>\n<p>主厨之吻打击（嫩肉），然后 Stride，再品味制造者打击（自动视为已「尝味」）。他喃喃报菜名。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "cook-recipe",
        traits: { value: [] },
      },
    },
    {
      _id: "whbCkCravings001",
      img: "systems/pf2e/icons/actions/Passive.webp",
      name: "难以启齿的欲望",
      sort: 600000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "offensive",
        description: {
          value:
            "<p>战争与入侵扭曲了他。半血以下：所有打击 +1 状态，但意志 −1（食欲压过理智）。对已流血生物恐吓 +2。</p>\n<p>佩戴 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntFinalSip1]{最后一口}：毒抗 3；本场 1 次可附加恶心。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "cook-cravings",
        traits: { value: ["mental"] },
      },
    },
    {
      _id: "whbCkButcher0001",
      img: "systems/pf2e/icons/actions/OneAction.webp",
      name: "分尸备料",
      sort: 700000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "offensive",
        description: {
          value:
            "<p>对邻接的倒地、定身或 0 HP 生物「备料」：造成 2d8 挥砍（不触发反应），并获得 5 临时生命。活着的目标视为敌食一体——他不再分得清。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "cook-butcher",
        traits: { value: ["manipulate"] },
      },
    },
    {
      _id: "whbCkTactics0001",
      img: "systems/pf2e/icons/actions/Passive.webp",
      name: "厨师战术（GM）",
      sort: 900000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "offensive",
        description: {
          value:
            "<p><strong>定位</strong>：堕落厨子——先用步枪调味，斧头分尸，厨刀尝味，蜂巢入髓。</p>\n<ol>\n<li><strong>主厨之吻</strong>打出流血+惊惧</li>\n<li><strong>岔路口</strong>投斧减速</li>\n<li><strong>骨汤</strong>叠毒</li>\n<li><strong>招牌食谱</strong>或厨刀收割</li>\n</ol>",
        },
        publication: pubH,
        rules: [],
        slug: "cook-tactics",
        traits: { value: [] },
      },
    },
  ],
  effects: [],
  system: {
    abilities: {
      str: { mod: 4 },
      dex: { mod: 2 },
      con: { mid: 3 },
      int: { mod: 1 },
      wis: { mod: 2 },
      cha: { mod: 2 },
    },
    attributes: {
      ac: { details: "血污厨袍下的皮革束带", value: 21 },
      allSaves: { value: "" },
      hp: { details: "战争创伤与腐败食欲", max: 88, temp: 0, value: 88 },
      speed: { value: 25, otherSpeeds: [] },
      resistances: [{ type: "poison", value: 3, exceptions: [] }],
      weaknesses: [],
      immunities: [],
    },
    details: {
      blurb: "堕落厨师 · 敌食一体",
      languages: { details: "报菜名式低语", value: ["common"] },
      level: { value: 4 },
      privateNotes:
        "<p>格里兹·莱文森 / The Cook (Griz Levenson)。主厨之吻(Vandal)、岔路口(投斧)、品味制造者(重刀)、骨汤(蜂巢)、最后一口护符。Creature 4 近中距屠夫。</p>",
      publicNotes:
        "<p>血污厨帽下是一双瞪大的眼。战争与入侵把他变成食谱的奴隶——猎人腿要先用子弹嫩化，再用斧头与厨刀分装入锅。</p>\n<p><em>四人 2 级团 · Creature 4 · 流血/肢解/毒蜂</em></p>",
      publication: pubH,
    },
    initiative: { statistic: "perception" },
    perception: { details: "闻得出恐惧的咸味", mod: 12, senses: [{ type: "low-light-vision" }, { type: "scent", range: 30 }] },
    resources: {},
    saves: {
      fortitude: { saveDetail: "", value: 14 },
      reflex: { saveDetail: "", value: 11 },
      will: { saveDetail: "半血 −1；对已流血目标恐吓时视为 +2 意志对抗反恐吓", value: 11 },
    },
    skills: {
      athletics: { base: 15 },
      cooking: { base: 14 },
      crafting: { base: 12 },
      intimidation: { base: 13 },
      survival: { base: 12 },
    },
    traits: { rarity: "unique", size: { value: "med" }, value: ["human", "humanoid"] },
  },
  prototypeToken: {
    name: "格里兹·莱文森",
    width: 1,
    height: 1,
    texture: {
      src: "modules/wang-pf2e-homebrew/assets/hunt/grizz-levinson.png",
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
      huntHunter: "the-cook",
      theme: "the-cook",
      preferredLoadout: ["chefs-kiss", "fork-in-the-road", "tastemaker", "bone-broth", "final-sip"],
    },
  },
};

cook.system.abilities.con = { mod: 3 };
// cooking isn't a PF2e skill - use crafting already; remove cooking or map to crafting only
delete cook.system.skills.cooking;
cook.system.skills.crafting = { base: 14 };

assertId(cook._id, "cook");
for (const i of cook.items) assertId(i._id, i.name);

fs.writeFileSync(path.join(actorsDir, "whbHuntGrizzLev1.json"), JSON.stringify(cook, null, 2) + "\n");
console.log("wrote cook", cook.items.length);

const mod = JSON.parse(fs.readFileSync(path.join(root, "module.json"), "utf8"));
mod.version = "1.20.0";
fs.writeFileSync(path.join(root, "module.json"), JSON.stringify(mod, null, 2) + "\n");
console.log("version", mod.version);
