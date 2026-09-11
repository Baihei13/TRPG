import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const actorsDir = path.join(root, "src", "packs", "homebrew-actors");
const itemsDir = path.join(root, "src", "packs", "homebrew-items");

const pubH = {
  title: "猎杀对决 — 猎人",
  authors: "Wang Homebrew / Hunt: Showdown",
  license: "ORC",
  remaster: true,
};
const pub = {
  title: "猎杀对决 — 装备",
  authors: "Wang Homebrew / Hunt: Showdown",
  license: "ORC",
  remaster: true,
};

function assertId(id, label) {
  if (!/^[a-zA-Z0-9]{16}$/.test(id)) throw new Error(`bad id ${label}: ${id} (${id.length})`);
}

const PROF = {
  key: "MartialProficiency",
  label: "猎杀武装熟练",
  kind: "attack",
  definition: ["item:id:{item|_id}"],
  value: 1,
  requiresInvestment: false,
};

// Nightmare Rival skin (full Rival 78, not shorty) — flavored for Dorothy
const nightRival = {
  _id: "whbHuntNightRiv1",
  folder: "whbHntFldWpn0001",
  name: "弄臣茶会 Rival Nightmare",
  type: "weapon",
  img: "modules/wang-pf2e-homebrew/assets/hunt/rival-78-shorty.png",
  system: {
    description: {
      value:
        "<p>美梦碎裂后，双管成了茶话会的「礼炮」。银饰机匣映着墓地雾气——多萝西用它驱散一切还想把故事讲回光明的人。</p>\n<blockquote><p><strong>兵器之书 · RIVAL 78 · NIGHTMARE TEA</strong> 爱丽丝围裙下的双管；童话结尾改成霰弹。</p></blockquote>\n<p><strong>熟练</strong> 持用期间视为受训。</p>\n<hr />\n<p><strong>类别</strong> 军用火器；负载 2；双手；射程增量 <strong>30 尺</strong>；装填 1；双管容量 2</p>\n<p><strong>伤害</strong> 1d8 穿刺；特质：震荡、scatter、capacity-2</p>\n<p><strong>噩梦礼炮</strong> 命中惊惧或迷魂目标时额外 @Damage[1d6[mental]]。双管齐射：一次操作打空双管，伤害 +1d8，攻击 −2。</p>",
      gm: "<p>Rival 78（多萝西噩梦形态主武器）。30ft、cap2。对惊惧/迷魂 +心灵。</p>",
    },
    rules: [
      { ...PROF },
      {
        key: "RollOption",
        domain: "damage",
        option: "hunt-night-rival-both",
        toggleable: true,
        placement: "actions",
        label: "弄臣茶会 — 双管齐射",
      },
      {
        key: "FlatModifier",
        selector: "strike-attack-roll",
        type: "circumstance",
        value: -2,
        label: "双管齐射",
        predicate: ["hunt-night-rival-both", "item:id:{item|_id}"],
        hideIfDisabled: true,
      },
      {
        key: "DamageDice",
        selector: "damage",
        label: "双管齐射",
        diceNumber: 1,
        dieSize: "d8",
        damageType: "piercing",
        predicate: ["hunt-night-rival-both", "item:id:{item|_id}"],
      },
    ],
    slug: "rival-nightmare-tea",
    traits: {
      value: ["concussive", "scatter", "capacity-2"],
      rarity: "uncommon",
      otherTags: ["hunt-showdown", "hunt-weapon", "alice-farm", "nightmare"],
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
        name: "双管霰弹枪",
        img: "systems/pf2e/icons/unidentified_item_icons/weapons.webp",
        data: { description: { value: "<p>银饰双管。</p>" } },
      },
    },
    usage: { value: "held-in-two-hands" },
    category: "martial",
    group: "firearm",
    bonus: { value: 0 },
    bonusDamage: { value: 0 },
    damage: { dice: 1, die: "d8", damageType: "piercing", persistent: null },
    splashDamage: { value: 0 },
    range: 30,
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
      enName: "Nightmare Tea Rival",
      theme: "alice-farm",
      baseWeapon: "rival-78",
    },
  },
};

assertId(nightRival._id, "nightRival");
fs.writeFileSync(path.join(itemsDir, `${nightRival._id}.json`), JSON.stringify(nightRival, null, 2) + "\n");

const dorothy = {
  _id: "whbHuntDorothy01",
  folder: "whbfolderHntHt01",
  name: "多萝西·爱丽丝 Dorothy Alice",
  type: "npc",
  img: "modules/wang-pf2e-homebrew/assets/hunt/dorothy-dream.png",
  items: [
    {
      _id: "whbDoFormTrack01",
      img: "systems/pf2e/icons/actions/Passive.webp",
      name: "双形态：当前＝美梦",
      sort: 1000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "defensive",
        description: {
          value:
            "<p><strong>美梦 Dorothy Alice: Dream</strong> 与 <strong>噩梦 Dorothy Alice: Nightmare</strong> 双形态。</p>\n<p>开场默认<strong>美梦</strong>。用「形态切换」或触发条件进入噩梦（见下）。切换时更新本条标题为「当前＝美梦/噩梦」，并换用对应打击与能力（标有形态标签的条目）。</p>\n<p>立绘：美梦用金发围裙；噩梦用黑发红结与人偶。</p>",
        },
        publication: pubH,
        rules: [
          {
            key: "RollOption",
            option: "dorothy-form-nightmare",
            toggleable: true,
            placement: "actions",
            label: "多萝西 — 噩梦形态（开＝噩梦 / 关＝美梦）",
          },
        ],
        slug: "dorothy-form-tracker",
        traits: { value: [] },
      },
    },
    {
      _id: "whbDoFormSwap001",
      img: "systems/pf2e/icons/actions/OneAction.webp",
      name: "形态切换：美梦⇄噩梦",
      sort: 2000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "defensive",
        description: {
          value:
            "<p><strong>频率</strong> 每场遭遇可自由切换；第一次进入噩梦不耗动作（见触发）。</p>\n<p><strong>效果</strong> 切换形态并打开/关闭动作栏开关「多萝西 — 噩梦形态」。</p>\n<ul>\n<li><strong>→噩梦</strong>：获得 10 临时生命；本回合打击 +1 环境；人偶睁眼（见噩梦能力）。立绘换噩梦。</li>\n<li><strong>→美梦</strong>：移除上述临时生命剩余；可立即茶话会邀请一次（仍耗其动作，若同回合已切换则需另付）。</li>\n</ul>\n<p><strong>强制触发（免费进入噩梦）</strong>：首次降至半血；或她目睹盟友「弄臣」倒下；或她打出终梦弹前后。强制触发每场限 1 次免费。</p>\n<p>弄臣打破美梦——想象力拧成黑暗后，她像恶魔追捕驱魔人。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "dorothy-form-swap",
        traits: { value: ["concentrate", "polymorph"] },
      },
    },
    // —— 美梦打击 ——
    {
      _id: "whbDoDreamMach01",
      img: "modules/wang-pf2e-homebrew/assets/hunt/machete.png",
      name: "【美梦】爱丽丝农庄砍刀",
      sort: 100000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 16 },
        damageRolls: { whbDoDmgDMach1: { damage: "2d6+4", damageType: "slashing" } },
        description: {
          value:
            "<p><strong>仅美梦</strong>。@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntDorMache1]{爱丽丝农庄砍刀}。茶话会客人 +2 伤害。</p>",
        },
        publication: pubH,
        range: null,
        rules: [],
        slug: "dorothy-dream-machete",
        traits: { value: ["agile", "finesse", "forceful"] },
      },
    },
    {
      _id: "whbDoDreamHeir01",
      img: "modules/wang-pf2e-homebrew/assets/hunt/quad-derringer.png",
      name: "【美梦】袖珍传家宝（未终梦）",
      sort: 110000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 15 },
        damageRolls: { whbDoDmgDHeir1: { damage: "2d4+3", damageType: "piercing" } },
        description: {
          value:
            "<p><strong>仅美梦</strong>。她还把枪当护身符，不肯打出终梦弹：射程 20 尺，伤害较弱。提醒玩家：终梦弹要等噩梦。</p>",
        },
        publication: pubH,
        range: 20,
        rules: [],
        slug: "dorothy-dream-pistol",
        traits: { value: ["concussive", "agile"] },
      },
    },
    // —— 噩梦打击 ——
    {
      _id: "whbDoNightRival1",
      img: "modules/wang-pf2e-homebrew/assets/hunt/rival-78-shorty.png",
      name: "【噩梦】弄臣茶会霰弹",
      sort: 200000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 16 },
        damageRolls: { whbDoDmgNRival: { damage: "2d8+5", damageType: "piercing" } },
        description: {
          value:
            "<p><strong>仅噩梦</strong>。@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntNightRiv1]{弄臣茶会}。射程 <strong>30 尺</strong>。对惊惧/迷魂额外 1d6 心灵。可双管齐射。</p>",
        },
        publication: pubH,
        range: 30,
        rules: [],
        slug: "dorothy-night-rival",
        traits: { value: ["concussive", "scatter"] },
      },
    },
    {
      _id: "whbDoLastHeir001",
      img: "modules/wang-pf2e-homebrew/assets/hunt/quad-derringer.png",
      name: "【噩梦】最后的传家宝",
      sort: 210000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 17 },
        damageRolls: { whbDoDmgHeir001: { damage: "2d8+5", damageType: "piercing" } },
        description: {
          value:
            "<p><strong>仅噩梦</strong>。@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntLastHeir1]{最后的传家宝}。射程 20 尺。本场 1 发<strong>终梦弹</strong>：对惊惧/困惑/「驱魔人」或弄臣关联目标升档，并 +2d8 心灵——用来终结这场噩梦。</p>",
        },
        publication: pubH,
        range: 20,
        rules: [],
        slug: "dorothy-heirloom",
        traits: { value: ["concussive", "fatal-d10"] },
      },
    },
    {
      _id: "whbDoNightDoll01",
      img: "systems/pf2e/icons/default-icons/melee.svg",
      name: "【噩梦】人偶绞绳",
      sort: 220000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 15 },
        damageRolls: { whbDoDmgDoll01: { damage: "2d4+4", damageType: "slashing" } },
        description: {
          value:
            "<p><strong>仅噩梦</strong>。腰间独眼人偶伸出麻绳。命中：目标笨拙 1（1 轮）或被人偶「盯住」（对她隐蔽无效 1 轮）。</p>",
        },
        publication: pubH,
        range: null,
        rules: [],
        slug: "dorothy-doll",
        traits: { value: ["agile", "finesse"] },
      },
    },
    // —— 共享 / 形态能力 ——
    {
      _id: "whbDoTeaParty001",
      img: "systems/pf2e/icons/actions/OneAction.webp",
      name: "【美梦】茶话会邀请",
      sort: 300000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "interaction",
        description: {
          value:
            "<p><strong>仅美梦</strong>。邀请 30 尺内生物：@Check[will|dc:22|traits:emotion,mental,auditory]{意志 DC 22}。失败迷魂 1 轮并视她为女主人；大失败迷魂更久并 Step 靠近。她仍相信故事可以美好。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "dorothy-tea",
        traits: { value: ["auditory", "emotion", "mental", "visual"] },
      },
    },
    {
      _id: "whbDoHuntExorc01",
      img: "systems/pf2e/icons/actions/OneAction.webp",
      name: "【噩梦】追捕驱魔人",
      sort: 310000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "offensive",
        description: {
          value:
            "<p><strong>仅噩梦</strong>。点名 30 尺内一个她视为「驱魔人/审判者/要叫醒她的人」：该目标对她措手不及至她下回合结束，且她下次对该目标打击 +2 环境。像恶魔追捕驱魔人。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "dorothy-hunt-exorcist",
        traits: { value: ["mental", "fear"] },
      },
    },
    {
      _id: "whbDoNightmare01",
      img: "systems/pf2e/icons/actions/TwoActions.webp",
      name: "【噩梦】噩梦漫游",
      sort: 400000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 2 },
        category: "offensive",
        description: {
          value:
            "<p><strong>仅噩梦；每场 1 次</strong>。Stride（可穿敌格），路径敌人意志 DC 21 失败惊惧 1，然后霰弹或传家宝打击。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "dorothy-nightmare-walk",
        traits: { value: ["emotion", "fear", "mental", "move"] },
      },
    },
    {
      _id: "whbDoEndDream001",
      img: "systems/pf2e/icons/actions/OneAction.webp",
      name: "【噩梦】终结噩梦",
      sort: 500000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "offensive",
        description: {
          value:
            "<p><strong>仅噩梦</strong>。消耗终梦弹发动「最后的传家宝」。若因此重击或击杀，她可免费切回美梦（故事短暂合上），或保持噩梦（每场限免费回美梦 1 次）。</p>",
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
      name: "家人遗物 / 人偶",
      sort: 600000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "defensive",
        description: {
          value:
            "<p><strong>美梦</strong>：怀表与项链 — 抗恐惧 +1；社交表演 +2。</p>\n<p><strong>噩梦</strong>：独眼人偶 — 抗恐惧改为免疫惊惧 1；对幻术/魅惑 −2；30 尺内敌人隐匿 DC −2（人偶在看）。</p>",
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
      name: "双形态战术（GM）",
      sort: 900000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "offensive",
        description: {
          value:
            "<p><strong>美梦</strong>：茶话会控场 → 砍刀。装天真。</p>\n<p><strong>噩梦</strong>（半血/弄臣倒/终梦）：开关打开 → 追捕驱魔人 → 霰弹/漫游 → 终梦弹收束。</p>\n<p>立绘与 token：美梦 <code>dorothy-dream.png</code>；噩梦 <code>dorothy-nightmare.png</code>。</p>",
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
      dex: { mid: 4 },
      con: { mod: 2 },
      int: { mod: 2 },
      wis: { mod: 1 },
      cha: { mid: 4 },
    },
    attributes: {
      ac: { details: "美梦围裙束带 / 噩梦皮具（AC 同值）", value: 21 },
      allSaves: { value: "" },
      hp: {
        details: "双形态共享生命；噩梦切换时 +10 临时生命",
        max: 74,
        temp: 0,
        value: 74,
      },
      speed: { value: 30, otherSpeeds: [] },
      resistances: [],
      weaknesses: [],
      immunities: [],
    },
    details: {
      blurb: "爱丽丝双形态 · 美梦⇄噩梦",
      languages: { details: "美梦称茶客；噩梦称驱魔人", value: ["common"] },
      level: { value: 4 },
      privateNotes:
        "<p>Dorothy Alice 双形态。Dream：茶话会+砍刀。Nightmare：弄臣茶会霰弹+最后的传家宝终梦弹+人偶；追捕驱魔人。半血/弄臣倒地/终梦强制进噩梦。</p>\n<p>Creature 4。开关 dorothy-form-nightmare。</p>",
      publicNotes:
        "<p>金发围裙时她请你喝茶；黑发红结与人偶现身时，美梦已被弄臣打碎——袖珍枪里只剩一颗终结噩梦的子弹。</p>\n<p><em>四人 2 级团 · Creature 4 · 双形态（美梦/噩梦）</em></p>",
      publication: pubH,
    },
    initiative: { statistic: "perception" },
    perception: { details: "美梦天真；噩梦多疑", mod: 12, senses: [{ type: "low-light-vision" }] },
    resources: {},
    saves: {
      fortitude: { saveDetail: "", value: 11 },
      reflex: { saveDetail: "", value: 14 },
      will: { saveDetail: "美梦 +1 vs 恐惧；噩梦免疫惊惧1、−2 vs 幻术/魅惑", value: 12 },
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
    name: "多萝西·美梦",
    width: 1,
    height: 1,
    texture: {
      src: "modules/wang-pf2e-homebrew/assets/hunt/dorothy-dream.png",
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
      huntHunter: "dorothy-alice",
      theme: "alice-farm",
      dualForm: {
        dream: {
          label: "美梦 Dream",
          img: "modules/wang-pf2e-homebrew/assets/hunt/dorothy-dream.png",
          tokenName: "多萝西·美梦",
        },
        nightmare: {
          label: "噩梦 Nightmare",
          img: "modules/wang-pf2e-homebrew/assets/hunt/dorothy-nightmare.png",
          tokenName: "多萝西·噩梦",
        },
      },
      preferredLoadout: ["last-heirloom", "alice-farm-machete", "rival-nightmare-tea"],
    },
  },
};

dorothy.system.abilities.dex = { mod: 4 };
dorothy.system.abilities.cha = { mod: 4 };

assertId(dorothy._id, "dorothy");
for (const i of dorothy.items) assertId(i._id, i.name);

fs.writeFileSync(path.join(actorsDir, "whbHuntDorothy01.json"), JSON.stringify(dorothy, null, 2) + "\n");
console.log("wrote dorothy dual", dorothy.items.length);

const mod = JSON.parse(fs.readFileSync(path.join(root, "module.json"), "utf8"));
mod.version = "1.19.0";
fs.writeFileSync(path.join(root, "module.json"), JSON.stringify(mod, null, 2) + "\n");
console.log("version", mod.version);
