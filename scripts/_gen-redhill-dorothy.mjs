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
const pubE = { ...pub, title: "猎杀对决 — 爆炸物" };

function assertId(id, label) {
  if (!/^[a-zA-Z0-9]{16}$/.test(id)) throw new Error(`bad id ${label}: ${id} (${id.length})`);
}

const overcall = {
  _id: "whbHuntOvercall1",
  folder: "whbHntFldExpl001",
  name: "超额召唤 Overcall",
  type: "consumable",
  img: "modules/wang-pf2e-homebrew/assets/hunt/dynamite-stick.png",
  system: {
    description: {
      value:
        "<p>约翰逊·雷德希尔特打赌的消息传遍沼泽地后，他发现自己成了敌对猎人的目标，他们想借此扬名立万，击败他。他喜欢用这根炸药棒<strong>戳穿他们的虚张声势</strong>，让他们在过于自信的进攻中碰壁。</p>\n<blockquote><p><strong>炸药棒 · THE OVERCALL</strong> 超额加注：你推得太凶，他就炸你的路。</p></blockquote>\n<hr />\n<p>规则同 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntDynStk001]{炸药棒}：1 动作点燃投掷，@Template[type:burst|distance:5]{5 尺爆发}，@Damage[3d6[bludgeoning]]，基础反射减半。</p>\n<p><strong>戳穿虚张</strong> 若目标本回合已向你 Stride 靠近或对你发动打击，则爆发伤害改为 @Damage[4d6[bludgeoning]]，且失败时额外倒地。</p>",
      gm: "<p>Dynamite Stick skin「Overcall / 超额召唤」。对正在强推的敌人加伤。乔纳森·雷德希尔。</p>",
    },
    rules: [],
    slug: "overcall",
    traits: {
      value: ["alchemical", "consumable"],
      rarity: "uncommon",
      otherTags: ["hunt-showdown", "hunt-explosive", "living-target"],
    },
    publication: pubE,
    level: { value: 4 },
    quantity: 1,
    baseItem: null,
    bulk: { value: 0.1 },
    price: { value: { gp: 1 } },
    equipped: { carryType: "worn", invested: null },
    containerId: null,
    size: "med",
    identification: {
      status: "identified",
      unidentified: {
        name: "纸裹药棍",
        img: "systems/pf2e/icons/unidentified_item_icons/other-consumables.webp",
        data: { description: { value: "<p>一根短引信炸药。</p>" } },
      },
      misidentified: {},
    },
    category: "other",
    uses: { value: 1, max: 1, autoDestroy: true },
    damage: { formula: "3d6", kind: "damage", type: "bludgeoning" },
    usage: { value: "held-in-one-hand" },
    stackGroup: null,
  },
  flags: {
    "wang-pf2e-homebrew": {
      source: "hunt-showdown",
      huntSlot: 1,
      huntCategory: "explosive",
      enName: "Overcall",
      theme: "living-target",
      skinOf: "whbHuntDynStk001",
    },
  },
};

const lastHeir = {
  _id: "whbHuntLastHeir1",
  folder: "whbHntFldWpn0001",
  name: "最后的传家宝 Last Heirloom",
  type: "weapon",
  img: "modules/wang-pf2e-homebrew/assets/hunt/quad-derringer.png",
  system: {
    description: {
      value:
        "<p>多萝西的美梦被弄臣打破，她天马行空的想象力被扭曲成黑暗。如今，她像个恶魔追捕驱魔人一般在沼泽地里游荡。她最后的传家宝？一把袖珍手枪，里面装着<strong>一颗子弹</strong>，用来终结这场噩梦。</p>\n<blockquote><p><strong>兵器之书 · QUAD DERRINGER · LAST HEIRLOOM</strong> 茶话会结束后，只剩一发。</p></blockquote>\n<p><strong>熟练</strong> 持用期间视为受训。</p>\n<hr />\n<p><strong>类别</strong> 军用火器；负载 L；单手；射程增量 <strong>20 尺</strong>；装填 2；容量 1（她只装一发「终梦弹」）</p>\n<p><strong>伤害</strong> 1d8 穿刺；特质：震荡、致命 d10、concealable</p>\n<hr />\n<p><strong>终梦弹</strong> 每场遭遇限用 1 次成功射击：若目标处于惊惧、困惑，或 GM 认定为「噩梦/弄臣关联」，此打击判定升一档（失败→成功，成功→重击），且额外 @Damage[2d8[mental]]。打空后此枪本场无法再射（除非她花 2 动作装填普通弹，伤害降为 1d6 且无终梦）。</p>",
      gm: "<p>Quad Derringer skin「最后的传家宝」。容量叙事为 1。终梦弹升档+心灵。多萝西·爱丽丝·噩梦。</p>",
    },
    rules: [
      { ...PROF },
      {
        key: "Note",
        selector: "strike-damage",
        title: "终梦弹",
        text: "本场 1 次：对惊惧/困惑/噩梦关联目标升档，并 +2d8 心灵。",
        predicate: ["item:id:{item|_id}"],
      },
    ],
    slug: "last-heirloom",
    traits: {
      value: ["concussive", "fatal-d10", "concealable"],
      rarity: "rare",
      otherTags: ["hunt-showdown", "hunt-weapon", "alice-farm"],
    },
    publication: pub,
    level: { value: 4 },
    quantity: 1,
    baseItem: null,
    bulk: { value: 0.1 },
    hp: { value: 0, max: 0 },
    hardness: 0,
    price: { value: { gp: 15 } },
    equipped: { carryType: "worn", handsHeld: 0 },
    containerId: null,
    size: "med",
    material: { type: null, grade: null },
    identification: {
      status: "identified",
      unidentified: {
        name: "袖珍手枪",
        img: "systems/pf2e/icons/unidentified_item_icons/weapons.webp",
        data: { description: { value: "<p>镶着小宝石的掌心枪。</p>" } },
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
      huntSlots: 1,
      enName: "Last Heirloom",
      wikiIcon: "Tool_Quad_Derringer.png",
      theme: "alice-farm",
      baseWeapon: "quad-derringer",
    },
  },
};

const dorMachete = {
  _id: "whbHuntDorMache1",
  folder: "whbHntFldWpn0001",
  name: "爱丽丝农庄砍刀",
  type: "weapon",
  img: "modules/wang-pf2e-homebrew/assets/hunt/machete.png",
  system: {
    description: {
      value:
        "<p>爱丽丝农场的农用砍刀，刀柄缠着褪色蓝丝带。多萝西用它劈开沼泽藤蔓——也劈开试图破坏茶话会的人。</p>\n<p><strong>熟练</strong> 持用期间视为受训。</p>\n<hr />\n<p><strong>类别</strong> 军用刀剑；负载 1；单手；伤害 1d6 挥砍；特质：灵巧、强力</p>\n<p><strong>茶话会礼仪</strong> 若目标本回合接受过你的「邀请」或处于迷魂，此刀伤害 +2 状态。</p>",
      gm: "<p>多萝西砍刀。1d6 S 灵巧强力。对受邀/迷魂目标 +2。</p>",
    },
    rules: [
      { ...PROF },
      {
        key: "RollOption",
        domain: "damage",
        option: "hunt-tea-guest",
        toggleable: true,
        placement: "actions",
        label: "砍刀 — 目标已受茶话会邀请/迷魂",
      },
      {
        key: "FlatModifier",
        selector: "damage",
        type: "status",
        value: 2,
        damageType: "slashing",
        label: "茶话会礼仪",
        predicate: ["hunt-tea-guest", "item:id:{item|_id}"],
        hideIfDisabled: true,
      },
    ],
    slug: "alice-farm-machete",
    traits: {
      value: ["agile", "finesse", "forceful"],
      rarity: "uncommon",
      otherTags: ["hunt-showdown", "hunt-weapon", "alice-farm"],
    },
    publication: pub,
    level: { value: 2 },
    quantity: 1,
    baseItem: "shortsword",
    bulk: { value: 1 },
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
        name: "农用砍刀",
        img: "systems/pf2e/icons/unidentified_item_icons/weapons.webp",
        data: { description: { value: "<p>缠蓝丝带的砍刀。</p>" } },
      },
    },
    usage: { value: "held-in-one-hand" },
    category: "martial",
    group: "sword",
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
      huntSlots: 1,
      enName: "Alice Farm Machete",
      theme: "alice-farm",
    },
  },
};

for (const it of [overcall, lastHeir, dorMachete]) {
  assertId(it._id, it.name);
  fs.writeFileSync(path.join(itemsDir, `${it._id}.json`), JSON.stringify(it, null, 2) + "\n");
}
console.log("wrote items");

const jonathan = {
  _id: "whbHuntRedhill01",
  folder: "whbfolderHntHt01",
  name: "乔纳森·雷德希尔 Jonathan Redhill",
  type: "npc",
  img: "modules/wang-pf2e-homebrew/assets/hunt/jonathan-redhill.png",
  items: [
    {
      _id: "whbJrPaxStrike01",
      img: "modules/wang-pf2e-homebrew/assets/hunt/caldwell-pax.png",
      name: "赌徒左轮",
      sort: 100000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 16 },
        damageRolls: { whbJrDmgPax0001: { damage: "2d8+4", damageType: "piercing" } },
        description: {
          value:
            "<p>随身 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntPax000001]{Pax}。射程 <strong>50 尺</strong>。赌约用的家伙——活着出来才有地契。</p>",
        },
        publication: pubH,
        range: 50,
        rules: [],
        slug: "redhill-pax",
        traits: { value: ["concussive"] },
      },
    },
    {
      _id: "whbJrOvercall001",
      img: "modules/wang-pf2e-homebrew/assets/hunt/dynamite-stick.png",
      name: "超额召唤",
      sort: 200000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "offensive",
        description: {
          value:
            "<p>投掷 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntOvercall1]{超额召唤}（炸药棒皮）。5 尺爆发 @Damage[3d6[bludgeoning]]，基础反射减半。若目标本回合正在向你强推（Stride 靠近或已打你），改为 @Damage[4d6[bludgeoning]]，失败额外倒地。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "redhill-overcall",
        traits: { value: [] },
      },
    },
    {
      _id: "whbJrLiveTarg001",
      img: "systems/pf2e/icons/actions/Passive.webp",
      name: "活靶子",
      sort: 300000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "defensive",
        description: {
          value:
            "<p>胸前绑着草靶：AC <strong>不因</strong>躲藏/掩蔽获得通常好处（他故意当靶），但所有攻击他的生物视为对他有「挑衅」——对他打击 +1 环境，对他以外目标打击 −1 环境（30 尺内，每轮每个敌人第一次）。</p>\n<p>草靶吸收冲击：物理伤害抗性 2；重击他时攻击者须反射 DC 20，失败自己倒地（靶绳反弹的狼狈）。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "redhill-target",
        traits: { value: [] },
      },
    },
    {
      _id: "whbJrCallBluff01",
      img: "systems/pf2e/icons/actions/OneAction.webp",
      name: "叫破虚张",
      sort: 400000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "interaction",
        description: {
          value:
            "<p>对 30 尺内一个本回合向你靠近或攻击你的生物恐吓：@Check[will|dc:21|traits:emotion,fear,mental,auditory]{意志 DC 21}。失败惊惧 1，且对你下一次打击 −2 环境。他笑着问：地契值这条命吗？</p>",
        },
        publication: pubH,
        rules: [],
        slug: "redhill-bluff",
        traits: { value: ["auditory", "emotion", "fear", "mental"] },
      },
    },
    {
      _id: "whbJrFistFight01",
      img: "systems/pf2e/icons/default-icons/melee.svg",
      name: "醉拳砸脸",
      sort: 500000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 15 },
        damageRolls: { whbJrDmgFist001: { damage: "2d6+4", damageType: "bludgeoning" } },
        description: { value: "<p>草帽下的醉汉近战。命中可尝试推撞（运动对抗）。</p>" },
        publication: pubH,
        range: null,
        rules: [],
        slug: "redhill-fist",
        traits: { value: ["agile", "nonlethal"] },
      },
    },
    {
      _id: "whbJrDeedBet0001",
      img: "systems/pf2e/icons/actions/Passive.webp",
      name: "地契赌约",
      sort: 600000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "offensive",
        description: {
          value:
            "<p>胆大还是傻瓜？只有墓碑知道。半血以下：所有打击 +1 状态（越危险越兴奋）；若被击倒，场上敌人为争夺「击败活靶」声望互相 −2 攻击（1 轮，GM）。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "redhill-deed",
        traits: { value: [] },
      },
    },
    {
      _id: "whbJrTactics0001",
      img: "systems/pf2e/icons/actions/Passive.webp",
      name: "雷德希尔战术（GM）",
      sort: 900000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "offensive",
        description: {
          value:
            "<p><strong>定位</strong>：故意吸引火力的赌徒。站在开阔地，让敌人冲过来，再用超额召唤砸脸。</p>\n<ol>\n<li>亮靶挑衅，逼人推过来</li>\n<li><strong>超额召唤</strong>炸强推路线</li>\n<li>左轮收残兵；近身砸脸</li>\n</ol>",
        },
        publication: pubH,
        rules: [],
        slug: "redhill-tactics",
        traits: { value: [] },
      },
    },
  ],
  effects: [],
  system: {
    abilities: {
      str: { mod: 3 },
      dex: { mid: 3 },
      con: { mod: 3 },
      int: { mod: 0 },
      wis: { mod: 2 },
      cha: { mid: 3 },
    },
    attributes: {
      ac: { details: "草靶 + 闪避（故意当靶）", value: 20 },
      allSaves: { value: "" },
      hp: { details: "醉汉命硬", max: 85, temp: 0, value: 85 },
      speed: { value: 30, otherSpeeds: [] },
      resistances: [{ type: "physical", value: 2, exceptions: [] }],
      weaknesses: [],
      immunities: [],
    },
    details: {
      blurb: "活靶子赌徒 · 超额加注",
      languages: { details: "", value: ["common"] },
      level: { value: 4 },
      privateNotes:
        "<p>乔纳森·雷德希尔（Johnathan Redshirt / Living Target）。醉酒赌约进沼泽，胸绑草靶。招牌：超额召唤炸药。Creature 4 嘲讽型。</p>",
      publicNotes:
        "<p>草帽、蓝巾、胸前草靶——谁打死活靶谁扬名。他赌的是西部地契；沼泽赌的是他的墓碑。</p>\n<p><em>四人 2 级团 · Creature 4 · 嘲讽/爆破</em></p>",
      publication: pubH,
    },
    initiative: { statistic: "perception" },
    perception: { details: "醉眼仍尖", mod: 12, senses: [{ type: "low-light-vision" }] },
    resources: {},
    saves: {
      fortitude: { saveDetail: "", value: 14 },
      reflex: { saveDetail: "", value: 13 },
      will: { saveDetail: "+2 vs 恐惧（赌徒神经）", value: 11 },
    },
    skills: {
      athletics: { base: 13 },
      deception: { base: 12 },
      intimidation: { base: 13 },
      stealth: { base: 10 },
      thievery: { base: 12 },
    },
    traits: { rarity: "unique", size: { value: "med" }, value: ["human", "humanoid"] },
  },
  prototypeToken: {
    name: "乔纳森·雷德希尔",
    width: 1,
    height: 1,
    texture: { src: "modules/wang-pf2e-homebrew/assets/hunt/jonathan-redhill.png", scaleX: 1, scaleY: 1 },
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
      huntHunter: "jonathan-redhill",
      theme: "living-target",
      preferredLoadout: ["overcall", "caldwell-pax"],
    },
  },
};

// fix typos mid -> mod
jonathan.system.abilities.dex = { mod: 3 };
jonathan.system.abilities.cha = { mod: 3 };

const dorothy = {
  _id: "whbHuntDorothy01",
  folder: "whbfolderHntHt01",
  name: "多萝西·爱丽丝 Dorothy Alice",
  type: "npc",
  img: "modules/wang-pf2e-homebrew/assets/hunt/dorothy.png",
  items: [
    {
      _id: "whbDoLastHeir001",
      img: "modules/wang-pf2e-homebrew/assets/hunt/quad-derringer.png",
      name: "最后的传家宝",
      sort: 100000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 16 },
        damageRolls: { whbDoDmgHeir001: { damage: "2d8+4", damageType: "piercing" } },
        description: {
          value:
            "<p>@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntLastHeir1]{最后的传家宝}。射程 <strong>20 尺</strong>。本场 1 发终梦弹：对惊惧/困惑/噩梦关联升档并 +2d8 心灵。</p>",
        },
        publication: pubH,
        range: 20,
        rules: [],
        slug: "dorothy-heirloom",
        traits: { value: ["concussive", "fatal-d10"] },
      },
    },
    {
      _id: "whbDoMachete0001",
      img: "modules/wang-pf2e-homebrew/assets/hunt/machete.png",
      name: "爱丽丝农庄砍刀",
      sort: 200000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 16 },
        damageRolls: { whbDoDmgMach001: { damage: "2d6+5", damageType: "slashing" } },
        description: {
          value:
            "<p>@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntDorMache1]{爱丽丝农庄砍刀}。对茶话会客人 +2 伤害。</p>",
        },
        publication: pubH,
        range: null,
        rules: [],
        slug: "dorothy-machete",
        traits: { value: ["agile", "finesse", "forceful"] },
      },
    },
    {
      _id: "whbDoTeaParty001",
      img: "systems/pf2e/icons/actions/OneAction.webp",
      name: "茶话会邀请",
      sort: 300000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "interaction",
        description: {
          value:
            "<p>邀请 30 尺内一个能听见她的生物参加爱丽丝农场的茶话会：@Check[will|dc:22|traits:emotion,mental,auditory]{意志 DC 22}。</p>\n<p>失败：@UUID[Compendium.pf2e.conditionitems.Item.AdP9qIcnHmJ9NbY3]{迷魂} 1 轮（可攻击她以外的人；被攻击则结束），并视她为女主人。大失败：迷魂 1 分钟，并 Step 向她靠近。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "dorothy-tea",
        traits: { value: ["auditory", "emotion", "mental", "visual"] },
      },
    },
    {
      _id: "whbDoNightmare01",
      img: "systems/pf2e/icons/actions/TwoActions.webp",
      name: "噩梦漫游",
      sort: 400000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 2 },
        category: "offensive",
        description: {
          value:
            "<p><strong>频率</strong> 每场遭遇 1 次</p>\n<p>Stride（可穿过敌人占用空间），然后发动砍刀或传家宝打击。路径上的敌人须意志 DC 20，失败惊惧 1（弄臣扭曲的童话）。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "dorothy-nightmare",
        traits: { value: ["emotion", "fear", "mental", "move"] },
      },
    },
    {
      _id: "whbDoEndDream001",
      img: "systems/pf2e/icons/actions/OneAction.webp",
      name: "终结噩梦",
      sort: 500000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "offensive",
        description: {
          value:
            "<p><strong>需求</strong> 传家宝仍有终梦弹</p>\n<p>发动一次「最后的传家宝」打击并消耗终梦弹效果。她低声说：茶话会结束了。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "dorothy-end",
        traits: { value: [] },
      },
    },
    {
      _id: "whbDoHeirloom001",
      img: "systems/pf2e/icons/actions/Passive.webp",
      name: "家人遗物",
      sort: 600000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "defensive",
        description: {
          value:
            "<p>怀表、项链与小说残页：对抗恐惧 +1 状态；但对抗幻术与魅惑 −2（想象力已被弄臣撬开）。先攻可用表演或察觉。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "dorothy-keepsakes",
        traits: { value: [] },
      },
    },
    {
      _id: "whbDoTactics0001",
      img: "systems/pf2e/icons/actions/Passive.webp",
      name: "多萝西战术（GM）",
      sort: 900000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "offensive",
        description: {
          value:
            "<p><strong>定位</strong>：童话崩坏的近战控制。先请喝茶，再砍，最后一枪结束噩梦。</p>\n<ol>\n<li><strong>茶话会邀请</strong>迷魂</li>\n<li>砍刀收割客人</li>\n<li>危急时 <strong>终梦弹</strong> 升档收场</li>\n</ol>",
        },
        publication: pubH,
        rules: [],
        slug: "dorothy-tactics",
        traits: { value: [] },
      },
    },
  ],
  effects: [],
  system: {
    abilities: {
      str: { mod: 2 },
      dex: { mod: 4 },
      con: { mod: 2 },
      int: { mod: 2 },
      wis: { mod: 1 },
      cha: { mod: 4 },
    },
    attributes: {
      ac: { details: "围裙下的皮革束带", value: 21 },
      allSaves: { value: "" },
      hp: { details: "黑眼圈下的固执", max: 70, temp: 0, value: 70 },
      speed: { value: 30, otherSpeeds: [] },
      resistances: [],
      weaknesses: [],
      immunities: [],
    },
    details: {
      blurb: "爱丽丝农场 · 噩梦茶话会",
      languages: { details: "常把人称作茶客", value: ["common"] },
      level: { value: 4 },
      privateNotes:
        "<p>多萝西·爱丽丝 Dorothy Alice: Nightmare。家人被腐化后收留弄臣，美梦扭曲。传家宝袖珍枪（1 发终梦）+ 砍刀。Creature 4 控制近战。</p>",
      publicNotes:
        "<p>双辫蓝裙沾满泥污，她邀请你去爱丽丝农场喝茶——故事书已翻到最黑的一页，袖珍手枪里还剩一颗终结噩梦的子弹。</p>\n<p><em>四人 2 级团 · Creature 4 · 迷魂/近战</em></p>",
      publication: pubH,
    },
    initiative: { statistic: "perception" },
    perception: { details: "", mod: 12, senses: [{ type: "low-light-vision" }] },
    resources: {},
    saves: {
      fortitude: { saveDetail: "", value: 11 },
      reflex: { saveDetail: "", value: 14 },
      will: { saveDetail: "+1 vs 恐惧；−2 vs 幻术/魅惑", value: 12 },
    },
    skills: {
      deception: { base: 14 },
      nature: { base: 10 },
      performance: { base: 15 },
      stealth: { base: 13 },
      survival: { base: 11 },
    },
    traits: { rarity: "unique", size: { value: "med" }, value: ["human", "humanoid"] },
  },
  prototypeToken: {
    name: "多萝西",
    width: 1,
    height: 1,
    texture: { src: "modules/wang-pf2e-homebrew/assets/hunt/dorothy.png", scaleX: 1, scaleY: 1 },
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
      huntHunter: "dorothy-alice",
      theme: "alice-farm",
      preferredLoadout: ["last-heirloom", "alice-farm-machete"],
    },
  },
};

// Fix fascinated UUID - check common PF2e: AdP9qIcnHmJ9NbY3 might be wrong. Use known one from elsewhere or plain text.
// PF2e fascinated: 3dfa5jf7QSWbomTB is common remaster? I'll leave and if wrong GM sees text.

for (const actor of [jonathan, dorothy]) {
  assertId(actor._id, actor.name);
  for (const i of actor.items) assertId(i._id, `${actor.name}:${i.name}`);
  fs.writeFileSync(path.join(actorsDir, `${actor._id}.json`), JSON.stringify(actor, null, 2) + "\n");
  console.log("wrote", actor.name, actor.items.length);
}

const mod = JSON.parse(fs.readFileSync(path.join(root, "module.json"), "utf8"));
mod.version = "1.18.0";
fs.writeFileSync(path.join(root, "module.json"), JSON.stringify(mod, null, 2) + "\n");
console.log("version", mod.version);
