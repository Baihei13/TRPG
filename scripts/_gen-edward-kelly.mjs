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
const pubM = { ...pub, title: "猎杀对决 — 医疗" };

function assertId(id, label) {
  if (!/^[a-zA-Z0-9]{16}$/.test(id)) throw new Error(`bad id ${label}: ${id} (${id.length})`);
}

const thatsLife = {
  _id: "whbHuntThatsLi01",
  folder: "whbHntFldWpn0001",
  name: "这就是人生 That's Life",
  type: "weapon",
  img: "modules/wang-pf2e-homebrew/assets/hunt/mosin-avtomat.png",
  system: {
    description: {
      value:
        "<p>铁甲战士不在乎什么隐蔽或委婉。这支<strong>莫辛-纳甘自动步枪</strong>是他最爱用来展现残忍死亡的手段。这支步枪扫射出的子弹完全无视受害者的立场。</p>\n<blockquote><p><strong>兵器之书 · MOSIN-NAGANT AVTOMAT · THAT'S LIFE</strong> 俄制栓动步枪改装自动机与加大弹匣：昂贵、嘈杂、弹药饥渴——却是权力对峙时最直白的答案。</p></blockquote>\n<p><strong>熟练</strong> 持用期间视为受训（无需火器熟练）。</p>\n<hr />\n<p><strong>类别</strong> 军用火器；<strong>负载</strong> 2；<strong>双手</strong>；<strong>射程增量</strong> 100 尺；<strong>装填</strong> 1；弹匣容量 15</p>\n<p><strong>伤害</strong> 1d10 穿刺；特质：震荡、volley、capacity-15</p>\n<p><strong>弹药</strong> @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntAmmoStd01]{标准枪弹}；特殊：达姆/毒/穿甲等同族长弹。</p>\n<hr />\n<p><strong>无视立场</strong> 以此武器发动的打击<strong>忽略</strong>目标因<strong>掩蔽</strong>与<strong>举盾</strong>获得的 AC 环境加值，并忽略目标的 @UUID[Compendium.pf2e.conditionitems.Item.DmAIPqOBomZ7H95W]{隐蔽}（无需持平检定；对躲藏等更强隐蔽无效，GM 裁定）。</p>\n<p><strong>扫射连发</strong>（开关）开启时，你可用一次操作发动<strong>两次</strong>此武器打击，各附加 −3 环境罚值，共享同一 MAP（弹药各耗 1）。每回合限用 1 次成功结算后建议关闭开关。</p>",
      gm: "<p>Hunt Mosin-Nagant Avtomat skin「That's Life / 这就是人生」。铁甲战士主题。1d10 P、capacity-15、无视掩蔽/举盾 circ 与隐蔽。扫射开关双击 −3。</p>",
    },
    rules: [
      { ...PROF },
      {
        key: "RollOption",
        domain: "attack",
        option: "hunt-thats-life-spray",
        toggleable: true,
        placement: "actions",
        label: "这就是人生 — 扫射连发（本回合）",
      },
      {
        key: "FlatModifier",
        selector: "strike-attack-roll",
        type: "circumstance",
        value: -3,
        label: "扫射连发",
        predicate: ["hunt-thats-life-spray", "item:id:{item|_id}"],
        hideIfDisabled: true,
      },
      {
        key: "Note",
        selector: "strike-attack-roll",
        title: "无视立场",
        text: "忽略掩蔽与举盾的 AC 环境加值；忽略隐蔽持平。",
        predicate: ["item:id:{item|_id}"],
      },
      {
        key: "Note",
        selector: "strike-attack-roll",
        title: "扫射连发",
        text: "开启时：一次操作两次打击，各 −3 环境，共享 MAP。",
        predicate: ["hunt-thats-life-spray", "item:id:{item|_id}"],
      },
    ],
    slug: "thats-life",
    traits: {
      value: ["concussive", "volley", "capacity-15"],
      rarity: "rare",
      otherTags: ["hunt-showdown", "hunt-weapon", "ironclad"],
    },
    publication: pub,
    level: { value: 4 },
    quantity: 1,
    baseItem: null,
    bulk: { value: 2 },
    hp: { value: 0, max: 0 },
    hardness: 0,
    price: { value: { gp: 50 } },
    equipped: { carryType: "worn", handsHeld: 0 },
    containerId: null,
    size: "med",
    material: { type: null, grade: null },
    identification: {
      status: "identified",
      unidentified: {
        name: "改装自动步枪",
        img: "systems/pf2e/icons/unidentified_item_icons/weapons.webp",
        data: { description: { value: "<p>沉甸甸的俄制长枪，机匣被粗暴加长。</p>" } },
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
    ammo: { baseType: "rounds", builtIn: false, capacity: 15 },
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
      huntSlots: 5,
      enName: "That's Life",
      wikiIcon: "Weapon_Mosin-Nagant_Avtomat.png",
      theme: "ironclad",
      baseWeapon: "mosin-nagant-avtomat",
    },
  },
};

const widowSon = {
  _id: "whbHuntWidowSo01",
  folder: "whbHntFldWpn0001",
  name: "寡妇之子 Widow's Son",
  type: "weapon",
  img: "modules/wang-pf2e-homebrew/assets/hunt/pax-trueshot.png",
  system: {
    description: {
      value:
        "<p>当当局像履行职责一样将他的父亲殴打致死时，铁甲战士眼睁睁地看着母亲被悲痛吞噬，却无能为力。他将母亲的痛苦通过这把<strong>「真射和平」</strong>传播出去——这把枪是母亲在他假死前送给他的。</p>\n<blockquote><p><strong>兵器之书 · CALDWELL PAX · WIDOW'S SON / TRUESHOT</strong> 拉丁语「和平」之名；这一把却只为让滥用权力的人听见寡妇的哭声。</p></blockquote>\n<p><strong>熟练</strong> 持用期间视为受训。</p>\n<hr />\n<p><strong>类别</strong> 军用火器；<strong>负载</strong> 1；<strong>单手</strong>；<strong>射程增量</strong> 50 尺；<strong>装填</strong> 1；弹巢 6</p>\n<p><strong>伤害</strong> 1d8 穿刺；特质：震荡、capacity-6</p>\n<p><strong>弹药</strong> 同 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntPax000001]{Caldwell Pax}。</p>\n<hr />\n<p><strong>真射</strong>（开关）开启时，下一次以此武器的攻击检定获得 <strong>+2 环境加值</strong>；每场遭遇限用 1 次成功加值后关闭。</p>\n<p><strong>寡妇之恸</strong> 命中时，目标须尝试 @Check[will|dc:resolve(@actor.level*2+14)|traits:emotion,fear,mental]{意志}（DC = 14+等级×2）。失败则获得 @UUID[Compendium.pf2e.conditionitems.Item.TBSHQidQVSrGRTuq]{惊惧 1}（1 分钟）；大失败惊惧 2。同一目标每场遭遇仅首次需豁免。</p>\n<p><strong>重击者枪柄</strong> 可用枪柄近战打击（1d8 钝击，震荡）。</p>",
      gm: "<p>Hunt Pax Trueshot skin「Widow's Son / 寡妇之子」。真射 +2/场；寡妇之恸 Will 惊惧。枪柄同 Pax。</p>",
    },
    rules: [
      { ...PROF },
      {
        key: "RollOption",
        domain: "attack",
        option: "hunt-widow-trueshot",
        toggleable: true,
        placement: "actions",
        label: "寡妇之子 — 真射（本场1次）",
      },
      {
        key: "FlatModifier",
        selector: "strike-attack-roll",
        type: "circumstance",
        value: 2,
        label: "真射",
        predicate: ["hunt-widow-trueshot", "item:id:{item|_id}"],
        hideIfDisabled: true,
      },
      {
        key: "Note",
        selector: "strike-damage",
        title: "寡妇之恸",
        text: "命中：意志失败则惊惧 1（同目标本场首次）。",
        predicate: ["item:id:{item|_id}", "check:outcome:success"],
      },
      {
        key: "Note",
        selector: "strike-damage",
        title: "寡妇之恸",
        text: "命中：意志失败则惊惧 1（同目标本场首次）。",
        predicate: ["item:id:{item|_id}", "check:outcome:critical-success"],
      },
      {
        key: "Strike",
        category: "martial",
        group: "brawling",
        slug: "widow-son-whip",
        label: "寡妇之子 枪柄打击",
        img: "systems/pf2e/icons/default-icons/melee.svg",
        damage: { base: { damageType: "bludgeoning", dice: 1, die: "d8" } },
        traits: ["concussive"],
        range: null,
      },
    ],
    slug: "widows-son",
    traits: {
      value: ["concussive", "capacity-6"],
      rarity: "uncommon",
      otherTags: ["hunt-showdown", "hunt-weapon", "ironclad"],
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
        name: "旧左轮",
        img: "systems/pf2e/icons/unidentified_item_icons/weapons.webp",
        data: { description: { value: "<p>枪柄缠着褪色丝带的单动左轮。</p>" } },
      },
    },
    usage: { value: "held-in-one-hand" },
    category: "martial",
    group: "firearm",
    bonus: { value: 0 },
    bonusDamage: { value: 0 },
    damage: { dice: 1, die: "d8", damageType: "piercing", persistent: null },
    splashDamage: { value: 0 },
    range: 50,
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
      enName: "Widow's Son",
      wikiIcon: "Weapon_Pax_Trueshot.png",
      theme: "ironclad",
      baseWeapon: "caldwell-pax",
    },
  },
};

const fightBack = {
  _id: "whbHuntFightBk01",
  folder: "whbHntFldMed0001",
  name: "奋起反击 Fight Back",
  type: "consumable",
  img: "modules/wang-pf2e-homebrew/assets/hunt/regeneration-shot.png",
  system: {
    description: {
      value:
        "<p>有时候，生活会让你证明，为了你的信仰，你愿意付出多大的代价。铁甲战士使用这剂活力注射剂，是为了重温那种在接受自己为事业献身之后，再次<strong>浴火重生</strong>的快感。</p>\n<blockquote><p><strong>医疗 · REGENERATION SHOT · FIGHT BACK</strong> 同族再生针的特制皮肤——针尖一刺，像把母亲的眼泪与自己的血一起打回血管。</p></blockquote>\n<hr />\n<p><strong>启动</strong> <span class=\"action-glyph\">1</span>（操作）Interact；<strong>需求</strong> 一只空闲的手握持注射器</p>\n<p><strong>效果</strong> 立刻恢复 @Damage[(2d8+4)[healing]]，并获得持续 1 分钟的再生（见效果）。若你在使用时<strong>生命值不高于上限一半</strong>，额外获得 @Damage[10[temporary|healing]]{10 临时生命值}（持续 1 分钟或被打光）。</p>\n<p>@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntRgnFx0001]{效果：再生针}</p>",
      gm: "<p>Hunt Regeneration Shot skin「Fight Back / 奋起反击」。即时 2d8+4 + 再生效果；≤半血时 +10 temp HP。价格同再生针 95 gp。</p>",
    },
    rules: [],
    slug: "fight-back",
    traits: {
      value: ["alchemical", "consumable", "elixir", "healing"],
      rarity: "uncommon",
      otherTags: ["hunt-showdown", "hunt-medical", "ironclad"],
    },
    publication: pubM,
    level: { value: 5 },
    quantity: 1,
    baseItem: null,
    bulk: { value: 0.1 },
    price: { value: { gp: 95 } },
    equipped: { carryType: "worn", invested: null },
    containerId: null,
    size: "med",
    identification: {
      status: "identified",
      unidentified: {
        name: "医用注射器",
        img: "systems/pf2e/icons/unidentified_item_icons/other-consumables.webp",
        data: { description: { value: "<p>一支装着暗红色液体的旧式金属注射器。</p>" } },
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
      huntCategory: "medical",
      huntPrice: 95,
      linkedEffect: "whbHuntRgnFx0001",
      enName: "Fight Back",
      theme: "ironclad",
      baseItem: "regeneration-shot",
    },
  },
};

assertId(thatsLife._id, "thatsLife");
assertId(widowSon._id, "widowSon");
assertId(fightBack._id, "fightBack");

fs.writeFileSync(path.join(itemsDir, "whbHuntThatsLi01.json"), JSON.stringify(thatsLife, null, 2) + "\n");
fs.writeFileSync(path.join(itemsDir, "whbHuntWidowSo01.json"), JSON.stringify(widowSon, null, 2) + "\n");
fs.writeFileSync(path.join(itemsDir, "whbHuntFightBk01.json"), JSON.stringify(fightBack, null, 2) + "\n");
console.log("wrote items");

const edward = {
  _id: "whbHuntEdwardK01",
  folder: "whbfolderHntHt01",
  name: "爱德华·凯利 Edward Kelly",
  type: "npc",
  img: "modules/wang-pf2e-homebrew/assets/hunt/edward-kelly.png",
  items: [
    {
      _id: "whbEkAvtoStrike1",
      img: "modules/wang-pf2e-homebrew/assets/hunt/mosin-avtomat.png",
      name: "这就是人生",
      sort: 100000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 16 },
        damageRolls: {
          whbEkDmgAvto001: { damage: "2d10+6", damageType: "piercing" },
        },
        description: {
          value:
            "<p>主手 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntThatsLi01]{这就是人生}（莫辛-纳甘自动）。射程增量 <strong>100 尺</strong>。</p>\n<p><strong>无视立场</strong>：忽略掩蔽与举盾的 AC 环境加值；忽略隐蔽持平。</p>",
        },
        publication: pubH,
        range: 100,
        rules: [],
        slug: "edward-thats-life",
        traits: { value: ["concussive", "volley"] },
      },
    },
    {
      _id: "whbEkBurstFire01",
      img: "systems/pf2e/icons/actions/OneAction.webp",
      name: "无情连射",
      sort: 110000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "offensive",
        description: {
          value:
            "<p>以一次操作发动<strong>两次</strong>「这就是人生」打击，各 −3 环境，共享同一 MAP。子弹不在乎你躲在哪——只在乎你还站不站得住。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "edward-burst",
        traits: { value: [] },
      },
    },
    {
      _id: "whbEkWidowShot01",
      img: "modules/wang-pf2e-homebrew/assets/hunt/pax-trueshot.png",
      name: "寡妇之子",
      sort: 200000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 15 },
        damageRolls: {
          whbEkDmgWid001: { damage: "2d8+4", damageType: "piercing" },
        },
        description: {
          value:
            "<p>副手 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntWidowSo01]{寡妇之子}。射程增量 <strong>50 尺</strong>。</p>\n<p>命中：@Check[will|dc:22|traits:emotion,fear,mental]{意志 DC 22}，失败则 @UUID[Compendium.pf2e.conditionitems.Item.TBSHQidQVSrGRTuq]{惊惧 1}（同目标本场首次）。真射（每场 1）：+2 环境攻击。</p>",
        },
        publication: pubH,
        range: 50,
        rules: [],
        slug: "edward-widow-son",
        traits: { value: ["concussive"] },
      },
    },
    {
      _id: "whbEkMeleeBash01",
      img: "systems/pf2e/icons/default-icons/melee.svg",
      name: "铁桶枪托",
      sort: 250000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 16 },
        damageRolls: {
          whbEkDmgBash001: { damage: "2d8+6", damageType: "bludgeoning" },
        },
        description: {
          value: "<p>用盔甲与枪托近身砸人。命中时目标对本回合内他的恐吓检定 −2 环境。</p>",
        },
        publication: pubH,
        range: null,
        rules: [],
        slug: "edward-buttstock",
        traits: { value: ["shove"] },
      },
    },
    {
      _id: "whbEkFightBack01",
      img: "modules/wang-pf2e-homebrew/assets/hunt/regeneration-shot.png",
      name: "奋起反击",
      sort: 300000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "defensive",
        description: {
          value:
            "<p><strong>频率</strong> 每场遭遇 1 次（他通常携带 1 支）</p>\n<p>注射 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntFightBk01]{奋起反击}：恢复 @Damage[(2d8+4)[healing]]，获得 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntRgnFx0001]{再生}（1 分钟）。若当前 HP ≤ 上限一半，另得 10 临时生命值。</p>\n<p>浴火重生——为信念再站起来。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "edward-fight-back",
        traits: { value: ["healing", "manipulate"] },
      },
    },
    {
      _id: "whbEkIronclad001",
      img: "systems/pf2e/icons/actions/Reaction.webp",
      name: "铁甲战士",
      sort: 400000,
      type: "action",
      system: {
        actionType: { value: "reaction" },
        actions: { value: null },
        category: "defensive",
        description: {
          value:
            "<p><strong>触发</strong> 他受到物理伤害</p>\n<p>钢板与头盔吃掉冲击：该次伤害减少 <strong>5</strong>（在抗性之后结算）。每轮限 1 次。</p>\n<p>他们称他为铁甲战士是有原因的。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "edward-ironclad",
        traits: { value: [] },
      },
    },
    {
      _id: "whbEkNameFear001",
      img: "systems/pf2e/icons/actions/OneAction.webp",
      name: "丛林强盗之名",
      sort: 500000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "interaction",
        description: {
          value:
            "<p>铁桶盔下传来低沉警告，恐吓 30 尺内目标：@Check[will|dc:22|traits:emotion,fear,mental,auditory]{意志 DC 22}。</p>\n<p>失败：@UUID[Compendium.pf2e.conditionitems.Item.TBSHQidQVSrGRTuq]{惊惧 1}（1 分钟）。大失败：惊惧 2，且对他下一次「这就是人生」打击措手不及。</p>\n<p>他希望在找到他们之前，他们就知道他的名字。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "edward-name",
        traits: { value: ["emotion", "fear", "mental", "auditory"] },
      },
    },
    {
      _id: "whbEkJustice0001",
      img: "systems/pf2e/icons/actions/Passive.webp",
      name: "由我定义正义",
      sort: 600000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "offensive",
        description: {
          value:
            "<p>爱德华或许铁石心肠，但那是被鞭子与权力打出来的。对 GM 认定为<strong>滥用权力</strong>的目标（警长、将军、暴吏、欺压者等），他的所有打击伤害获得 <strong>+2 状态加值</strong>，且「丛林强盗之名」的 DC 视为 24。</p>\n<p>在这样的地方，正义究竟是什么样子？——他觉得得由他来定义。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "edward-justice",
        traits: { value: [] },
      },
    },
    {
      _id: "whbEkBushranger1",
      img: "systems/pf2e/icons/actions/Passive.webp",
      name: "沼泽地的丛林法则",
      sort: 700000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "defensive",
        description: {
          value:
            "<p>祖国教会他如何智胜「时刻准备置你于死地的复杂因素」。在沼泽、密林、困难地形中，他的移动速度不因<strong>非魔法困难地形</strong>降低；生存与自然相关检定 +2 状态。</p>\n<p>抵达之后他便明白：仅凭此地之力就能吞噬多数猎人——而他不会成为其中之一。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "edward-bush",
        traits: { value: [] },
      },
    },
    {
      _id: "whbEkTactics0001",
      img: "systems/pf2e/icons/actions/Passive.webp",
      name: "铁甲侠战术（GM）",
      sort: 900000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "offensive",
        description: {
          value:
            "<p><strong>定位</strong>：前线坦克火力手。不玩隐蔽，用铁甲扛伤，用自动步枪撕开阵地。</p>\n<ol>\n<li><strong>丛林强盗之名</strong>先立规矩（尤其对警长/将军型 NPC）</li>\n<li>中远距 <strong>无情连射</strong> 无视掩蔽压制</li>\n<li>近身换 <strong>寡妇之子</strong> 真射+惊惧，或枪托砸开</li>\n<li>半血以下立刻 <strong>奋起反击</strong> 再战</li>\n<li>反应 <strong>铁甲战士</strong> 吃关键一击</li>\n</ol>\n<p>他不仅知道如何挑起战斗，更知道如何结束战斗。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "edward-tactics",
        traits: { value: [] },
      },
    },
  ],
  effects: [],
  system: {
    abilities: {
      str: { mod: 4 },
      dex: { mod: 2 },
      con: { mod: 4 },
      int: { mod: 1 },
      wis: { mod: 3 },
      cha: { mod: 3 },
    },
    attributes: {
      ac: { details: "铁桶盔 + 胸甲 + 风衣", value: 24 },
      allSaves: { value: "" },
      hp: {
        details: "铁甲战士：厚甲与顽固",
        max: 96,
        temp: 0,
        value: 96,
      },
      speed: { value: 25, otherSpeeds: [] },
      resistances: [{ type: "physical", value: 3, exceptions: [] }],
      weaknesses: [],
      immunities: [],
    },
    details: {
      blurb: "铁甲战士 · 丛林强盗",
      languages: { details: "", value: ["common"] },
      level: { value: 4 },
      privateNotes:
        "<p>爱德华·凯利「铁甲战士 / 铁甲侠」。澳大利亚丛林强盗：铁桶盔、胸甲、弹带。主：这就是人生（莫辛自动）；副：寡妇之子（Pax）；医疗：奋起反击（再生针皮）。</p>\n<p>主题：惩罚滥用权力、沼泽适应、正面碾压。Creature 4 坦克偏强；对 4×2 级团为严厉前线遭遇。</p>",
      publicNotes:
        "<p>铁桶盔的窄缝里是一双不肯退让的眼睛。沼泽地很快会明白，人们为何称他为「铁甲战士」——他不躲、不绕，只把滥用权力的人钉在自己的正义定义里。</p>\n<p><em>四人 2 级团 · Creature 4（坦克偏强）· 丛林强盗</em></p>",
      publication: pubH,
    },
    initiative: { statistic: "perception" },
    perception: {
      details: "盔缝视野受限，但对杀意极敏",
      mod: 13,
      senses: [{ type: "low-light-vision" }],
    },
    resources: {},
    saves: {
      fortitude: { saveDetail: "", value: 15 },
      reflex: { saveDetail: "", value: 11 },
      will: { saveDetail: "+2 vs 恐吓/胁迫若来自权威者", value: 13 },
    },
    skills: {
      athletics: { base: 15 },
      intimidation: { base: 14 },
      nature: { base: 12 },
      stealth: { base: 8 },
      survival: { base: 14 },
      thievery: { base: 10 },
    },
    traits: {
      rarity: "unique",
      size: { value: "med" },
      value: ["human", "humanoid"],
    },
  },
  prototypeToken: {
    name: "爱德华·凯利",
    width: 1,
    height: 1,
    texture: {
      src: "modules/wang-pf2e-homebrew/assets/hunt/edward-kelly.png",
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
      huntHunter: "edward-kelly",
      theme: "ironclad",
      preferredLoadout: ["thats-life", "widows-son", "fight-back"],
    },
  },
};

assertId(edward._id, "edward");
for (const i of edward.items) assertId(i._id, i.name);

fs.writeFileSync(path.join(actorsDir, "whbHuntEdwardK01.json"), JSON.stringify(edward, null, 2) + "\n");
console.log("wrote edward", edward.items.length);

const modPath = path.join(root, "module.json");
const mod = JSON.parse(fs.readFileSync(modPath, "utf8"));
mod.version = "1.14.0";
fs.writeFileSync(modPath, JSON.stringify(mod, null, 2) + "\n");
console.log("version", mod.version);
