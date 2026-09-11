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
const pubF = { ...pub, title: "猎杀对决 — 燃烧" };

function assertId(id, label) {
  if (!/^[a-zA-Z0-9]{16}$/.test(id)) throw new Error(`bad id ${label}: ${id} (${id.length})`);
}

const marksDelight = {
  _id: "whbHuntMarkDlgt1",
  folder: "whbHntFldWpn0001",
  name: "射手的乐趣 Marksman's Delight",
  type: "weapon",
  img: "modules/wang-pf2e-homebrew/assets/hunt/hand-crossbow.png",
  system: {
    description: {
      value:
        "<p>乡巴佬老爹用一罐<strong>沼泽之泪</strong>酒从威廉·卡特那里买了这把弩箭神射手。他常在十月的漫漫长夜里用它射猫头鹰，因为他认为猫头鹰是「魔鬼鸡」，一心想要诅咒他的家禽。但不管死了多少，总会有更多的猫头鹰飞来。</p>\n<blockquote><p><strong>兵器之书 · HAND CROSSBOW MARKSMAN · MARKSMAN'S DELIGHT</strong> 卡特手里买来的火弩：安静、恶毒，专治魔鬼鸡。</p></blockquote>\n<p><strong>熟练</strong> 持用期间视为受训。</p>\n<hr />\n<p><strong>类别</strong> 军用弩；负载 1；单手；射程增量 <strong>60 尺</strong>；装填 1；容量 1</p>\n<p><strong>伤害</strong> 1d8 穿刺；特质：致命 d8</p>\n<p><strong>火弩 / 龙息矢</strong> 命中额外 @Damage[1d6[fire]]，并施加 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntBurnFx001]{猎杀灼烬} 1 层（已有则 +1）。落点可点燃易燃物（5 尺内小火场 1 轮，GM）。</p>\n<p><strong>魔鬼鸡</strong> 对飞行生物或空中目标打击 +1 环境；对「诅咒家禽/偷鸡贼」类目标（GM）额外 +1d4 火焰。</p>",
      gm: "<p>Hand Crossbow Marksman skin「射手的乐趣」。火弩：1d8+1d6火+灼烬。打飞禽 +1。</p>",
    },
    rules: [
      { ...PROF },
      {
        key: "DamageDice",
        selector: "damage",
        label: "龙息矢",
        diceNumber: 1,
        dieSize: "d6",
        damageType: "fire",
        predicate: ["item:id:{item|_id}"],
      },
      {
        key: "Note",
        selector: "strike-damage",
        title: "火弩",
        text: "额外火焰；施加猎杀灼烬 1 层。",
        predicate: ["item:id:{item|_id}"],
      },
      {
        key: "RollOption",
        domain: "attack",
        option: "hunt-devil-chicken",
        toggleable: true,
        placement: "actions",
        label: "射手的乐趣 — 目标为飞行/魔鬼鸡（GM）",
      },
      {
        key: "FlatModifier",
        selector: "strike-attack-roll",
        type: "circumstance",
        value: 1,
        label: "魔鬼鸡",
        predicate: ["hunt-devil-chicken", "item:id:{item|_id}"],
        hideIfDisabled: true,
      },
    ],
    slug: "marksmans-delight",
    traits: {
      value: ["deadly-d8"],
      rarity: "uncommon",
      otherTags: ["hunt-showdown", "hunt-weapon", "hillbilly", "fire"],
    },
    publication: pub,
    level: { value: 3 },
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
        data: { description: { value: "<p>枪托熏黑的手弩。</p>" } },
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
    expend: 1,
    ammo: { baseType: "arrows", builtIn: false, capacity: 1 },
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
      enName: "Marksman's Delight",
      theme: "hillbilly-daddy",
      baseWeapon: "hand-crossbow-marksman",
      fireCrossbow: true,
    },
  },
};

const swampTear = {
  _id: "whbHuntSwmpTear1",
  folder: "whbHntFldFire001",
  name: "沼泽之泪火瓶 Swamp Tears",
  type: "consumable",
  img: "modules/wang-pf2e-homebrew/assets/hunt/fire-bomb.png",
  system: {
    description: {
      value:
        "<p>弗农用来换弩的同款私酿——灌进瓶子就是燃烧弹。酒香混着沼气，一点就着。</p>\n<blockquote><p><strong>火焰瓶 · SWAMP TEARS</strong> 买弩的酒，现在烧人。</p></blockquote>\n<hr />\n<p>规则同 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntFireBm001]{火焰瓶}：20 尺投掷，5 尺火场 3 轮，@Damage[1d6[fire]] + 猎杀灼烬。他管这叫「给魔鬼鸡加料」。</p>",
      gm: "<p>Fire Bomb skin「沼泽之泪」。弗农燃烧套件。</p>",
    },
    rules: [],
    slug: "swamp-tears-firebomb",
    traits: {
      value: ["alchemical", "bomb", "consumable", "fire"],
      rarity: "uncommon",
      otherTags: ["hunt-showdown", "hunt-fire", "hillbilly"],
    },
    publication: pubF,
    level: { value: 3 },
    quantity: 1,
    baseItem: null,
    bulk: { value: 0.1 },
    price: { value: { gp: 3 } },
    equipped: { carryType: "worn", invested: null },
    containerId: null,
    size: "med",
    identification: {
      status: "identified",
      unidentified: {
        name: "私酿瓶",
        img: "systems/pf2e/icons/unidentified_item_icons/other-consumables.webp",
        data: { description: { value: "<p>臭烘烘的酒瓶子。</p>" } },
      },
      misidentified: {},
    },
    category: "other",
    uses: { value: 1, max: 1, autoDestroy: true },
    damage: { formula: "1d6", kind: "damage", type: "fire" },
    usage: { value: "held-in-one-hand" },
    stackGroup: null,
  },
  flags: {
    "wang-pf2e-homebrew": {
      source: "hunt-showdown",
      huntCategory: "fire",
      enName: "Swamp Tears",
      theme: "hillbilly-daddy",
      skinOf: "whbHuntFireBm001",
    },
  },
};

for (const it of [marksDelight, swampTear]) {
  assertId(it._id, it.name);
  fs.writeFileSync(path.join(itemsDir, `${it._id}.json`), JSON.stringify(it, null, 2) + "\n");
}

const vernon = {
  _id: "whbHuntVernonMo1",
  folder: "whbfolderHntHt01",
  name: "弗农·摩西 Vernon Mose",
  type: "npc",
  img: "modules/wang-pf2e-homebrew/assets/hunt/vernon-mose.png",
  items: [
    {
      _id: "whbVmFireXbow001",
      img: "modules/wang-pf2e-homebrew/assets/hunt/hand-crossbow.png",
      name: "射手的乐趣",
      sort: 100000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 17 },
        damageRolls: {
          whbVmDmgBolt01: { damage: "2d8+4", damageType: "piercing" },
          whbVmDmgFire01: { damage: "1d6", damageType: "fire" },
        },
        description: {
          value:
            "<p>主手 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntMarkDlgt1]{射手的乐趣}（火弩）。射程 <strong>60 尺</strong>。命中施加猎杀灼烬 1 层。打飞行/「魔鬼鸡」+1。</p>",
        },
        publication: pubH,
        range: 60,
        rules: [],
        slug: "vernon-fire-crossbow",
        traits: { value: ["deadly-d8"] },
      },
    },
    {
      _id: "whbVmReload00001",
      img: "systems/pf2e/icons/actions/OneAction.webp",
      name: "摇椅式装填",
      sort: 110000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "offensive",
        description: {
          value:
            "<p>装填火弩。若你本回合未移动，装填后下次打击 +1 环境（三十年摇椅练出来的稳）。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "vernon-reload",
        traits: { value: ["manipulate"] },
      },
    },
    {
      _id: "whbVmSwampTear01",
      img: "modules/wang-pf2e-homebrew/assets/hunt/fire-bomb.png",
      name: "沼泽之泪",
      sort: 200000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "offensive",
        description: {
          value:
            "<p>投掷 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntSwmpTear1]{沼泽之泪火瓶}（或 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntLiqFire01]{液体火焰瓶} / @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntHellFr001]{地狱火瓶}，他随身「居多」）。火场 + 灼烬。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "vernon-swamp-tears",
        traits: { value: ["fire"] },
      },
    },
    {
      _id: "whbVmFireBeetl01",
      img: "modules/wang-pf2e-homebrew/assets/hunt/fire-beetle.png",
      name: "放火焰甲虫",
      sort: 210000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "offensive",
        description: {
          value:
            "<p>放出 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntFireBt001]{火焰甲虫} 侦察/引爆。他说这比猫头鹰听话。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "vernon-beetle",
        traits: { value: ["fire"] },
      },
    },
    {
      _id: "whbVmPipeSmoke01",
      img: "systems/pf2e/icons/actions/OneAction.webp",
      name: "烟斗硬扛",
      sort: 300000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "defensive",
        description: {
          value:
            "<p>抽一口烟斗、骂一声。获得火焰抗性 5（1 分钟）与下次豁免 +1 状态。每场遭遇 1 次。谣言说他只会喝酒咒骂——其实这是他活到拿赏金比你妈加起来还多的办法。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "vernon-pipe",
        traits: { value: [] },
      },
    },
    {
      _id: "whbVmDevilOwl001",
      img: "systems/pf2e/icons/actions/TwoActions.webp",
      name: "十月猎猫头鹰",
      sort: 400000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 2 },
        category: "offensive",
        description: {
          value:
            "<p><strong>频率</strong> 每场遭遇 1 次</p>\n<p>瞄准「魔鬼鸡」式猎物：火弩打击升一档判定（失败→成功，成功→重击），且忽略隐蔽持平。对非飞行目标改为伤害额外 +1d6 火焰。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "vernon-october",
        traits: { value: [] },
      },
    },
    {
      _id: "whbVmPatriarch01",
      img: "systems/pf2e/icons/actions/Passive.webp",
      name: "坚定族长",
      sort: 500000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "defensive",
        description: {
          value:
            "<p>三十年摇椅不是谣言的全部。对抗恐惧、魅惑与「把你从椅子上拽走」类效果意志 +2。半血以下仍可恐吓：他咒骂时敌人意志 DC 视为 22。</p>\n<p>获得的赏金比你和你妈加起来都多——先攻可用生存或感知。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "vernon-patriarch",
        traits: { value: [] },
      },
    },
    {
      _id: "whbVmKnife000001",
      img: "modules/wang-pf2e-homebrew/assets/hunt/heavy-knife.png",
      name: "屠禽短刀",
      sort: 600000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 14 },
        damageRolls: { whbVmDmgKnf001: { damage: "2d4+3", damageType: "slashing" } },
        description: {
          value: "<p>杀鸡杀猫头鹰用的。近身不得已。命中可 Interact 尝试点燃邻接易燃物（已有火种时）。</p>",
        },
        publication: pubH,
        range: null,
        rules: [],
        slug: "vernon-knife",
        traits: { value: ["agile", "finesse"] },
      },
    },
    {
      _id: "whbVmTactics0001",
      img: "systems/pf2e/icons/actions/Passive.webp",
      name: "弗农战术（GM）",
      sort: 900000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "offensive",
        description: {
          value:
            "<p><strong>定位</strong>：燃烧系赏金族长。火弩点名 → 火瓶/甲虫铺场 → 烟斗硬扛。</p>\n<ol>\n<li>远距火弩叠灼烬</li>\n<li>沼泽之泪/液体火/地狱火封路</li>\n<li>十月猎猫头鹰收高价值目标</li>\n<li>别信他只会坐摇椅喝酒</li>\n</ol>",
        },
        publication: pubH,
        rules: [],
        slug: "vernon-tactics",
        traits: { value: [] },
      },
    },
  ],
  effects: [],
  system: {
    abilities: {
      str: { mod: 2 },
      dex: { mod: 3 },
      con: { mod: 3 },
      int: { mod: 0 },
      wis: { mod: 4 },
      cha: { mod: 2 },
    },
    attributes: {
      ac: { details: "工装背带 + 老皮", value: 21 },
      allSaves: { value: "" },
      hp: { details: "顽固得像摇椅腿", max: 86, temp: 0, value: 86 },
      speed: { value: 25, otherSpeeds: [] },
      resistances: [{ type: "fire", value: 3, exceptions: [] }],
      weaknesses: [],
      immunities: [],
    },
    details: {
      blurb: "乡巴佬老爹 · 火弩赏金族长",
      languages: { details: "私酿与咒骂", value: ["common"] },
      level: { value: 4 },
      privateNotes:
        "<p>弗农·摩西 Vernon Mose / Hillbilly Daddy。主：射手的乐趣（火弩）；辅：沼泽之泪等燃烧物、火焰甲虫。Creature 4 燃烧风筝。</p>",
      publicNotes:
        "<p>烟斗、工装、三十年摇椅的谣言——挡不住这位族长的赏金簿。火弩专治「魔鬼鸡」，火瓶专治还敢靠近鸡舍的人。</p>\n<p><em>四人 2 级团 · Creature 4 · 火弩/燃烧</em></p>",
      publication: pubH,
    },
    initiative: { statistic: "perception" },
    perception: { details: "夜观猫头鹰最精", mod: 15, senses: [{ type: "low-light-vision" }] },
    resources: {},
    saves: {
      fortitude: { saveDetail: "", value: 14 },
      reflex: { saveDetail: "", value: 12 },
      will: { saveDetail: "+2 vs 恐惧/魅惑/拖离摇椅", value: 14 },
    },
    skills: {
      crafting: { base: 11 },
      intimidation: { base: 13 },
      nature: { base: 14 },
      stealth: { base: 12 },
      survival: { base: 15 },
    },
    traits: { rarity: "unique", size: { value: "med" }, value: ["human", "humanoid"] },
  },
  prototypeToken: {
    name: "弗农·摩西",
    width: 1,
    height: 1,
    texture: {
      src: "modules/wang-pf2e-homebrew/assets/hunt/vernon-mose.png",
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
      huntHunter: "vernon-mose",
      theme: "hillbilly-daddy",
      preferredLoadout: ["marksmans-delight", "swamp-tears-firebomb", "fire-beetle", "liquid-fire-bomb"],
    },
  },
};

vernon.system.abilities.wis = { mod: 4 };

assertId(vernon._id, "vernon");
for (const i of vernon.items) assertId(i._id, i.name);

fs.writeFileSync(path.join(actorsDir, "whbHuntVernonMo1.json"), JSON.stringify(vernon, null, 2) + "\n");
console.log("wrote vernon", vernon.items.length);

const mod = JSON.parse(fs.readFileSync(path.join(root, "module.json"), "utf8"));
if (String(mod.version).localeCompare("1.21.0", undefined, { numeric: true }) < 0) {
  mod.version = "1.21.0";
  fs.writeFileSync(path.join(root, "module.json"), JSON.stringify(mod, null, 2) + "\n");
}
console.log("version", mod.version);
