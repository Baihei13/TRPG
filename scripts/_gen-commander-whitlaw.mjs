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
const pubM = { ...pub, title: "猎杀对决 — 医疗" };
const pubTac = { ...pub, title: "猎杀对决 — 战术" };

function assertId(id, label) {
  if (!/^[a-zA-Z0-9]{16}$/.test(id)) throw new Error(`bad id ${label}: ${id} (${id.length})`);
}

function firearm({
  _id,
  name,
  img,
  lore,
  gm,
  slug,
  enName,
  wikiIcon,
  baseWeapon,
  level,
  price,
  bulk,
  hands,
  range,
  capacity,
  damageDie,
  damageDice = 1,
  traits,
  rulesExtra = [],
  usage,
  unidentified,
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
      traits: {
        value: traits,
        rarity: "uncommon",
        otherTags: ["hunt-showdown", "hunt-weapon", "26th-regiment"],
      },
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
      damage: { dice: damageDice, die: damageDie, damageType: "piercing", persistent: null },
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
        huntSlots: hands === "held-in-two-hands" ? 3 : 2,
        enName,
        wikiIcon,
        theme: "26th-regiment",
        baseWeapon,
      },
    },
  };
}

const dueProcess = firearm({
  _id: "whbHuntDueProc01",
  name: "正当程序 Due Process",
  img: "modules/wang-pf2e-homebrew/assets/hunt/due-process.png",
  lore:
    "<p>在入侵区，骇人听闻的罪行猖獗，腐败掩盖了这一切。惠特洛用这支步枪对那些妄图逃脱惩罚的人——或者犯下比之前罪行更加恶劣罪行的人——施以<strong>公正的审判</strong>。</p>\n<blockquote><p><strong>兵器之书 · 1890 CAVALRY · DUE PROCESS</strong> 弹簧田后门卡宾：一发一审，中距高伤。</p></blockquote>\n<p><strong>熟练</strong> 持用期间视为受训。</p>\n<hr />\n<p><strong>类别</strong> 军用火器；负载 2；双手；射程增量 <strong>80 尺</strong>；装填 1；容量 1</p>\n<p><strong>伤害</strong> 1d10 穿刺；特质：震荡、fatal-d10</p>\n<hr />\n<p><strong>正当程序</strong> 以此武器命中「试图逃脱/遁入隐蔽/躲藏」的目标时，额外造成 @Damage[1d6[precision]]{1d6 精密}，并忽略其隐蔽持平（躲藏仍由 GM 裁定）。</p>\n<p><strong>更恶劣的罪</strong>（开关）若 GM 认定目标刚犯下暴行或背叛，本回合下次伤害 +2 状态。</p>",
  gm: "<p>1890 Cavalry skin「Due Process」。单发 1d10 fatal-d10、80ft。对逃脱/隐蔽目标 +精密。</p>",
  slug: "due-process",
  enName: "Due Process",
  wikiIcon: "Weapon_1890_Cavalry.png",
  baseWeapon: "1890-cavalry",
  level: 4,
  price: 20,
  bulk: 2,
  hands: "held-in-two-hands",
  range: 80,
  capacity: 1,
  damageDie: "d10",
  traits: ["concussive", "fatal-d10"],
  usage: "held-in-two-hands",
  unidentified: "后门卡宾枪",
  rulesExtra: [
    {
      key: "RollOption",
      domain: "damage",
      option: "hunt-due-worse",
      toggleable: true,
      placement: "actions",
      label: "正当程序 — 更恶劣的罪（GM）",
    },
    {
      key: "FlatModifier",
      selector: "damage",
      type: "status",
      value: 2,
      damageType: "piercing",
      label: "更恶劣的罪",
      predicate: ["hunt-due-worse", "item:id:{item|_id}"],
      hideIfDisabled: true,
    },
    {
      key: "Note",
      selector: "strike-damage",
      title: "正当程序",
      text: "对逃脱/隐蔽目标：+1d6 精密，忽略隐蔽持平。",
      predicate: ["item:id:{item|_id}"],
    },
  ],
});

const patriot = firearm({
  _id: "whbHuntPatrShad1",
  name: "爱国者的阴影 Patriot's Shadow",
  img: "modules/wang-pf2e-homebrew/assets/hunt/patriots-shadow.png",
  lore:
    "<p>注定覆灭的第26团指挥官，在抵达猎场之初，恐怕无法预料到即将面临的惨败。其他战友阵亡后，他重铸了这支步枪，以纪念他牺牲的战友——此时的他已不知何为真正的荣誉。</p>\n<blockquote><p><strong>兵器之书 · INFANTRY 73L · PATRIOT'S SHADOW</strong> 步兵长枪的影：荣誉熔进枪管，却不再认得自己。</p></blockquote>\n<p><strong>熟练</strong> 持用期间视为受训。</p>\n<hr />\n<p><strong>类别</strong> 军用火器；负载 2；双手；射程增量 <strong>90 尺</strong>；装填 1；容量 7</p>\n<p><strong>伤害</strong> 1d8 穿刺；特质：震荡、capacity-7</p>\n<hr />\n<p><strong>战友之名</strong> 每场遭遇第一次以此武器造成伤害时，你获得 5 临时生命值，且 30 尺内盟友下次豁免 +1 环境（荣誉的残影）。</p>\n<p><strong>不知荣誉</strong> 若你本回合曾攻击盟友或对盟友使用恐吓，此武器伤害额外 +1d8（自毁的阴影）。</p>",
  gm: "<p>Infantry 73L skin「Patriot's Shadow」。1d8、90ft、cap7。首伤给 temp HP；攻击盟友时加伤。</p>",
  slug: "patriots-shadow",
  enName: "Patriot's Shadow",
  wikiIcon: "Weapon_Infantry_73L.png",
  baseWeapon: "infantry-73l",
  level: 3,
  price: 16,
  bulk: 2,
  hands: "held-in-two-hands",
  range: 90,
  capacity: 7,
  damageDie: "d8",
  traits: ["concussive", "capacity-7"],
  usage: "held-in-two-hands",
  unidentified: "步兵步枪",
  rulesExtra: [
    {
      key: "RollOption",
      domain: "damage",
      option: "hunt-patriot-ally",
      toggleable: true,
      placement: "actions",
      label: "爱国者的阴影 — 本回合已对盟友出手",
    },
    {
      key: "DamageDice",
      selector: "damage",
      label: "不知荣誉",
      diceNumber: 1,
      dieSize: "d8",
      damageType: "piercing",
      predicate: ["hunt-patriot-ally", "item:id:{item|_id}"],
    },
    {
      key: "Note",
      selector: "strike-damage",
      title: "战友之名",
      text: "本场首次伤害：5 临时生命；30 尺内盟友下次豁免 +1。",
      predicate: ["item:id:{item|_id}"],
    },
  ],
});

const freeSong = firearm({
  _id: "whbHuntFreeSong1",
  name: "让自由之歌 Let Freedom Sing",
  img: "modules/wang-pf2e-homebrew/assets/hunt/officer.png",
  lore:
    "<p>这把左轮手枪被惠特洛指挥官发现后，经过重新改装，恢复了最佳状态，得以继续它最初的用途：让子弹划破夜空，发出呼啸的声响，为每一个勇敢扣动扳机的人带来<strong>自由</strong>。</p>\n<blockquote><p><strong>兵器之书 · OFFICER · LET FREEDOM SING</strong> 纳甘军官双动：射速高，枪声像自由的歌。</p></blockquote>\n<p><strong>熟练</strong> 持用期间视为受训。</p>\n<hr />\n<p><strong>类别</strong> 军用火器；负载 1；单手；射程增量 <strong>40 尺</strong>；装填 1；弹巢 7</p>\n<p><strong>伤害</strong> 1d6 穿刺；特质：震荡、agile、capacity-7</p>\n<hr />\n<p><strong>自由之歌</strong> 你可以一次操作发动两次此武器打击，共享 MAP，第二次 −2 环境（双动射速）。</p>\n<p><strong>稳住手</strong> 持用此武器期间，对抗恐惧与颤抖类效应的豁免 +1 环境（枪稳住手——也对准盟友）。</p>",
  gm: "<p>Officer skin「Let Freedom Sing / 让自由之歌」。1d6 agile、40ft、cap7。双动双击；持枪抗恐惧 +1。</p>",
  slug: "let-freedom-sing",
  enName: "Let Freedom Sing",
  wikiIcon: "Weapon_Officer.png",
  baseWeapon: "officer",
  level: 3,
  price: 12,
  bulk: 1,
  hands: "held-in-one-hand",
  range: 40,
  capacity: 7,
  damageDie: "d6",
  traits: ["concussive", "agile", "capacity-7"],
  usage: "held-in-one-hand",
  unidentified: "军官左轮",
  rulesExtra: [
    {
      key: "FlatModifier",
      selector: "will",
      type: "circumstance",
      value: 1,
      label: "稳住手",
      predicate: ["item:id:{item|_id}", { or: ["fear", "emotion"] }],
      hideIfDisabled: true,
    },
    {
      key: "Note",
      selector: "strike-attack-roll",
      title: "自由之歌",
      text: "可 1 动作两次打击，共享 MAP，第二次 −2。",
      predicate: ["item:id:{item|_id}"],
    },
  ],
});

const counterpart = firearm({
  _id: "whbHuntCounterp1",
  name: "对应物 The Counterpart",
  img: "modules/wang-pf2e-homebrew/assets/hunt/the-counterpart.png",
  lore:
    "<p>这把装饰性手枪曾被挂在当地法院的墙上，后来成为代表与第26团指挥官惠特洛之间<strong>协议</strong>的象征。它并非仅仅是一件装饰品，许多敌人都会倒在它华丽的枪口之下。</p>\n<blockquote><p><strong>兵器之书 · CONVERSION · THE COUNTERPART</strong> 法院墙上的展品；协议的另一半。</p></blockquote>\n<p><strong>熟练</strong> 持用期间视为受训。</p>\n<hr />\n<p><strong>类别</strong> 军用火器；负载 1；单手；射程增量 <strong>50 尺</strong>；装填 1；弹巢 6</p>\n<p><strong>伤害</strong> 1d8 穿刺；特质：震荡、capacity-6</p>\n<hr />\n<p><strong>协议象征</strong> 每场遭遇 1 次：声明「协议条款」后，下一次此武器攻击 +2 环境，命中则目标意志 DC（14+等级×2）失败获得惊惧 1（违约的恐惧）。</p>",
  gm: "<p>Conversion skin「The Counterpart」。1d8、50ft、cap6。协议条款：+2 攻击与惊惧。</p>",
  slug: "the-counterpart",
  enName: "The Counterpart",
  wikiIcon: "Weapon_Conversion.png",
  baseWeapon: "conversion",
  level: 3,
  price: 14,
  bulk: 1,
  hands: "held-in-one-hand",
  range: 50,
  capacity: 6,
  damageDie: "d8",
  traits: ["concussive", "capacity-6"],
  usage: "held-in-one-hand",
  unidentified: "装饰左轮",
  rulesExtra: [
    {
      key: "RollOption",
      domain: "attack",
      option: "hunt-counterpart-pact",
      toggleable: true,
      placement: "actions",
      label: "对应物 — 协议条款（本场1次）",
    },
    {
      key: "FlatModifier",
      selector: "strike-attack-roll",
      type: "circumstance",
      value: 2,
      label: "协议条款",
      predicate: ["hunt-counterpart-pact", "item:id:{item|_id}"],
      hideIfDisabled: true,
    },
    {
      key: "Note",
      selector: "strike-damage",
      title: "协议条款",
      text: "命中：意志失败则惊惧 1。",
      predicate: ["hunt-counterpart-pact", "item:id:{item|_id}"],
    },
  ],
});

const cavBlade = {
  _id: "whbHuntCavBlade1",
  folder: "whbHntFldWpn0001",
  name: "骑兵佩剑 Cavalry Sabre",
  type: "weapon",
  img: "modules/wang-pf2e-homebrew/assets/hunt/cavalry-saber.png",
  system: {
    description: {
      value:
        "<p>这把骑兵佩剑来自博尔登堡城墙内发现的一个秘密收藏。曾经挥舞它的人或许永远无法理解他脚下的这片土地将会发生怎样的变化……也无法想象，即便死后，他仍将行走在这片土地上。</p>\n<blockquote><p><strong>兵器之书 · CAVALRY SABER</strong> 博尔登堡秘藏；亡者仍可能握着它走路。</p></blockquote>\n<p><strong>熟练</strong> 持用期间视为受训。</p>\n<hr />\n<p><strong>类别</strong> 军用刀剑；负载 1；单手；伤害 1d8 挥砍；特质：灵巧、致命 d8</p>\n<hr />\n<p><strong>亡者仍行</strong> 对不死生物的打击额外 +1 状态伤害；若你本回合已用火器命中同一目标，此近战打击 +1 环境攻击（先审后斩）。</p>",
      gm: "<p>Cavalry Saber（惠特洛/博尔登堡风味）。1d8 灵巧致命d8。对不死 +1；火器后接刀 +1 攻击。</p>",
    },
    rules: [
      { ...PROF },
      {
        key: "FlatModifier",
        selector: "damage",
        type: "status",
        value: 1,
        damageType: "slashing",
        label: "亡者仍行",
        predicate: ["item:id:{item|_id}", "target:trait:undead"],
        hideIfDisabled: true,
      },
      {
        key: "RollOption",
        domain: "attack",
        option: "hunt-sabre-after-gun",
        toggleable: true,
        placement: "actions",
        label: "骑兵佩剑 — 本回合已火器命中该目标",
      },
      {
        key: "FlatModifier",
        selector: "strike-attack-roll",
        type: "circumstance",
        value: 1,
        label: "先审后斩",
        predicate: ["hunt-sabre-after-gun", "item:id:{item|_id}"],
        hideIfDisabled: true,
      },
    ],
    slug: "cavalry-sabre-whitlaw",
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
        name: "旧骑兵刀",
        img: "systems/pf2e/icons/unidentified_item_icons/weapons.webp",
        data: { description: { value: "<p>来历不明的军官佩剑。</p>" } },
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
      enName: "Cavalry Sabre",
      wikiIcon: "Weapon_Cavalry_Saber.png",
      theme: "26th-regiment",
      baseWeapon: "cavalry-saber",
    },
  },
};

const strongCon = {
  _id: "whbHuntStrConst1",
  folder: "whbHntFldMed0001",
  name: "强大的宪法 A Strong Constitution",
  type: "consumable",
  img: "modules/wang-pf2e-homebrew/assets/hunt/first-aid-kit.png",
  system: {
    description: {
      value:
        "<p>这个急救箱上的数字可能被认为是不吉利的，但对于一位叛逆的军事指挥官来说，它提醒着他为何要与腐败作斗争：为了他应征入伍所服务的<strong>国家的健康</strong>。</p>\n<blockquote><p><strong>急救箱 · A STRONG CONSTITUTION</strong> 不吉利的数字；为国体而包扎。</p></blockquote>\n<hr />\n<p><strong>启动</strong> <span class=\"action-glyph\">2</span>（操作）Interact；Manipulate</p>\n<p><strong>效果</strong> 你或邻接盟友恢复 @Damage[(3d8+6)[healing]]。若目标当前 HP ≤ 一半，额外移除一个非魔法的惊惧或笨拙状态（等级 1）。使用后消耗。</p>",
      gm: "<p>First Aid Kit skin「A Strong Constitution」。2 动作治疗 3d8+6；半血清惊惧/笨拙 1。</p>",
    },
    rules: [],
    slug: "a-strong-constitution",
    traits: {
      value: ["consumable", "healing", "manipulate"],
      rarity: "uncommon",
      otherTags: ["hunt-showdown", "hunt-medical", "26th-regiment"],
    },
    publication: pubM,
    level: { value: 4 },
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
        name: "军用急救箱",
        img: "systems/pf2e/icons/unidentified_item_icons/other-consumables.webp",
        data: { description: { value: "<p>印着不详编号的急救箱。</p>" } },
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
      enName: "A Strong Constitution",
      theme: "26th-regiment",
      baseItem: "first-aid-kit",
    },
  },
};

function charm({ _id, name, lore, gm, slug, enName, rules }) {
  return {
    _id,
    folder: "whbHntFldTact001",
    name,
    type: "equipment",
    img: "systems/pf2e/icons/equipment/worn-items/other-worn-items/demon-mask.webp",
    system: {
      description: { value: lore, gm },
      rules,
      slug,
      traits: {
        value: ["invested"],
        rarity: "uncommon",
        otherTags: ["hunt-showdown", "hunt-charm", "26th-regiment"],
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
          name: "旧护符",
          img: "systems/pf2e/icons/unidentified_item_icons/other-consumables.webp",
          data: { description: { value: "<p>童年玩物般的护符。</p>" } },
        },
        misidentified: {},
      },
      usage: { value: "worn" },
    },
    flags: {
      "wang-pf2e-homebrew": {
        source: "hunt-showdown",
        huntCategory: "tactic",
        enName,
        theme: "26th-regiment",
      },
    },
  };
}

const dreamGlory = charm({
  _id: "whbHuntDreamGl01",
  name: "荣耀之梦 Dream of Glory",
  lore:
    "<p>惠特洛指挥官小时候就玩弄着这件护身符，梦想着有一天自己也能自由奔跑。后来，当他深陷腐化的恐怖之中时，它有了新的、更加阴暗的意义，象征着他<strong>从未寻得的荣耀</strong>。</p>\n<hr />\n<p><strong>用法</strong> 附着武器（投资）。</p>\n<p><strong>效果</strong> 持用附着武器时，先攻 +1 环境。每场遭遇第一次重击后，你须尝试意志 DC 18：失败则对最近盟友产生敌意一轮（疑神疑鬼——GM 可令其对盟友一次打击或恐吓），成功则获得 5 临时生命。</p>",
  gm: "<p>Charm「Dream of Glory」。先攻 +1；本场首个重击后 Will DC18 或敌视盟友。</p>",
  slug: "dream-of-glory",
  enName: "Dream of Glory",
  rules: [
    { key: "FlatModifier", selector: "initiative", type: "circumstance", value: 1, label: "荣耀之梦" },
    {
      key: "Note",
      selector: "strike-damage",
      title: "荣耀之梦",
      text: "本场首次重击后：意志 DC18，失败则敌视最近盟友一轮。",
      predicate: ["check:outcome:critical-success"],
    },
  ],
});

const goldLust = charm({
  _id: "whbHuntGoldLust1",
  name: "荣耀的光泽 Golden Signet",
  lore:
    "<p>荒芜之地的代表多年前在一次政治活动中结识了惠特洛指挥官。惠特洛告诉他，荣誉是一种货币。虽然这并非这位代表最乐于拥有的货币，但这个教训在与理想主义者和空想家打交道时却非常有用。</p>\n<hr />\n<p><strong>用法</strong> 佩戴（投资）。</p>\n<p><strong>效果</strong> 交涉与恐吓检定 +1 环境（荣誉当货币）。对「理想主义者/空想家」（GM）的社交 DC 视为降低 2。若你在遭遇中欺骗过盟友，此加值改为对察觉检定 −1（光泽剥落）。</p>",
  gm: "<p>Charm「Golden Signet / 荣耀的光泽」。社交 +1；对理想主义者更易压；骗盟友则察觉 −1。</p>",
  slug: "golden-signet",
  enName: "Golden Signet",
  rules: [
    {
      key: "FlatModifier",
      selector: ["diplomacy", "intimidation"],
      type: "circumstance",
      value: 1,
      label: "荣耀的光泽",
    },
  ],
});

const items = [dueProcess, patriot, freeSong, counterpart, cavBlade, strongCon, dreamGlory, goldLust];
for (const it of items) {
  assertId(it._id, it.name);
  fs.writeFileSync(path.join(itemsDir, `${it._id}.json`), JSON.stringify(it, null, 2) + "\n");
}
console.log("wrote items", items.length);

const whitlaw = {
  _id: "whbHuntWhitlaw01",
  folder: "whbfolderHntHt01",
  name: "惠特洛指挥官 Commander Whitlaw",
  type: "npc",
  img: "modules/wang-pf2e-homebrew/assets/hunt/commander-whitlaw.png",
  items: [
    {
      _id: "whbWlDueProc0001",
      img: "modules/wang-pf2e-homebrew/assets/hunt/due-process.png",
      name: "正当程序",
      sort: 100000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 18 },
        damageRolls: { whbWlDmgDue0001: { damage: "2d10+6", damageType: "piercing" } },
        description: {
          value:
            "<p>主火力 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntDueProc01]{正当程序}（1890 Cavalry）。射程 <strong>80 尺</strong>；单发高伤。对逃脱/隐蔽目标 +1d6 精密。</p>",
        },
        publication: pubH,
        range: 80,
        rules: [],
        slug: "whitlaw-due-process",
        traits: { value: ["concussive", "fatal-d10"] },
      },
    },
    {
      _id: "whbWlPatrShad001",
      img: "modules/wang-pf2e-homebrew/assets/hunt/patriots-shadow.png",
      name: "爱国者的阴影",
      sort: 110000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 17 },
        damageRolls: { whbWlDmgPatr001: { damage: "2d8+5", damageType: "piercing" } },
        description: {
          value:
            "<p>备用 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntPatrShad1]{爱国者的阴影}（Infantry 73L）。射程 <strong>90 尺</strong>。纪念战友——也提醒他不知荣誉为何物。</p>",
        },
        publication: pubH,
        range: 90,
        rules: [],
        slug: "whitlaw-patriot",
        traits: { value: ["concussive"] },
      },
    },
    {
      _id: "whbWlFreeSong001",
      img: "modules/wang-pf2e-homebrew/assets/hunt/officer.png",
      name: "让自由之歌",
      sort: 200000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 17 },
        damageRolls: { whbWlDmgFree001: { damage: "2d6+4", damageType: "piercing" } },
        description: {
          value:
            "<p>@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntFreeSong1]{让自由之歌}（Officer）。射程 <strong>40 尺</strong>。可 1 动作双击。持枪稳住颤抖的手。</p>",
        },
        publication: pubH,
        range: 40,
        rules: [],
        slug: "whitlaw-freedom",
        traits: { value: ["concussive", "agile"] },
      },
    },
    {
      _id: "whbWlCounterp001",
      img: "modules/wang-pf2e-homebrew/assets/hunt/the-counterpart.png",
      name: "对应物",
      sort: 210000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 17 },
        damageRolls: { whbWlDmgCnt0001: { damage: "2d8+4", damageType: "piercing" } },
        description: {
          value:
            "<p>@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntCounterp1]{对应物}。射程 <strong>50 尺</strong>。与「荒芜之地代表」协议的象征；协议条款每场 1 次。</p>",
        },
        publication: pubH,
        range: 50,
        rules: [],
        slug: "whitlaw-counterpart",
        traits: { value: ["concussive"] },
      },
    },
    {
      _id: "whbWlCavBlade001",
      img: "modules/wang-pf2e-homebrew/assets/hunt/cavalry-saber.png",
      name: "骑兵佩剑",
      sort: 250000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 17 },
        damageRolls: { whbWlDmgSab0001: { damage: "2d8+5", damageType: "slashing" } },
        description: {
          value:
            "<p>@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntCavBlade1]{骑兵佩剑}。博尔登堡秘藏。火器命中后接刀 +1 攻击。</p>",
        },
        publication: pubH,
        range: null,
        rules: [],
        slug: "whitlaw-sabre",
        traits: { value: ["agile", "finesse", "deadly-d8"] },
      },
    },
    {
      _id: "whbWlDoubleTap01",
      img: "systems/pf2e/icons/actions/OneAction.webp",
      name: "自由连射",
      sort: 300000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "offensive",
        description: {
          value: "<p>以「让自由之歌」发动两次打击，共享 MAP，第二次 −2 环境。子弹呼啸如自由之歌。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "whitlaw-double",
        traits: { value: [] },
      },
    },
    {
      _id: "whbWlParanoia001",
      img: "systems/pf2e/icons/actions/Passive.webp",
      name: "只有枪能稳住手",
      sort: 400000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "defensive",
        description: {
          value:
            "<p>疑神疑鬼：若未握持火器，对抗恐惧/情绪效应意志 −2，且手颤抖（灵巧攻击 −1）。握持火器时意志豁免 +2 状态对抗恐惧——也可对<strong>盟友</strong>发动打击而不受队友攻击惩罚的良心压力（他已分不清敌友）。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "whitlaw-paranoia",
        traits: { value: ["mental"] },
      },
    },
    {
      _id: "whbWlCourtMart01",
      img: "systems/pf2e/icons/actions/TwoActions.webp",
      name: "战场军法",
      sort: 500000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 2 },
        category: "offensive",
        description: {
          value:
            "<p><strong>频率</strong> 每场遭遇 1 次</p>\n<p>点名 30 尺内一个生物为「逃兵/罪犯」：@Check[will|dc:24|traits:emotion,fear,mental,auditory]{意志 DC 24}。失败惊惧 2；然后你可 Stride 并对该目标发动一次正当程序或对应物打击。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "whitlaw-court",
        traits: { value: ["auditory", "emotion", "fear", "mental"] },
      },
    },
    {
      _id: "whbWlFirstAid001",
      img: "modules/wang-pf2e-homebrew/assets/hunt/first-aid-kit.png",
      name: "强大的宪法",
      sort: 600000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 2 },
        category: "defensive",
        description: {
          value:
            "<p>使用 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntStrConst1]{强大的宪法}：恢复 @Damage[(3d8+6)[healing]]；半血时可清惊惧/笨拙 1。为国体而包扎。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "whitlaw-aid",
        traits: { value: ["healing", "manipulate"] },
      },
    },
    {
      _id: "whbWlCharms00001",
      img: "systems/pf2e/icons/actions/Passive.webp",
      name: "荣耀之梦 / 光泽",
      sort: 700000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "offensive",
        description: {
          value:
            "<p>佩戴 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntDreamGl01]{荣耀之梦}（先攻 +1；首个重击后可能敌视盟友）与 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntGoldLust1]{荣耀的光泽}（社交货币）。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "whitlaw-charms",
        traits: { value: [] },
      },
    },
    {
      _id: "whbWlPair26th001",
      img: "systems/pf2e/icons/actions/Passive.webp",
      name: "第26团残影",
      sort: 800000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "offensive",
        description: {
          value:
            "<p>若场上有 @UUID[Compendium.wang-pf2e-homebrew.homebrew-actors.Actor.whbHuntSgtRigg01]{里金斯中士}：两人共享「军令」——里金斯 30 尺内时，惠特洛恐吓 DC +1；惠特洛点名逃兵后，里金斯可免费 Step。若有红鸦/飞翔者，他可能认定他们是失踪侦察兵的「证据」而优先交涉或优先开火（GM）。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "whitlaw-26th",
        traits: { value: [] },
      },
    },
    {
      _id: "whbWlTactics0001",
      img: "systems/pf2e/icons/actions/Passive.webp",
      name: "惠特洛战术（GM）",
      sort: 900000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "offensive",
        description: {
          value:
            "<p><strong>定位</strong>：第26团指挥官，偏执中距火力。比里金斯更强、更不稳。</p>\n<ol>\n<li><strong>战场军法</strong>点名「逃兵」再正当程序审判</li>\n<li>近距用自由之歌连射或对应物协议条款</li>\n<li>贴身骑兵佩剑收尾</li>\n<li>半血打强大的宪法；重击后注意荣耀之梦敌视盟友</li>\n</ol>\n<p>他组建叛军来救侦察兵——如今枪口对准一切让他手抖的人。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "whitlaw-tactics",
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
      int: { mod: 2 },
      wis: { mod: 2 },
      cha: { mod: 4 },
    },
    attributes: {
      ac: { details: "军官制服 + 皮质装具", value: 23 },
      allSaves: { value: "" },
      hp: {
        details: "指挥官体质；偏执消耗他",
        max: 105,
        temp: 0,
        value: 105,
      },
      speed: { value: 25, otherSpeeds: [] },
      resistances: [],
      weaknesses: [],
      immunities: [],
    },
    details: {
      blurb: "第26团指挥官 · 偏执军法",
      languages: { details: "", value: ["common"] },
      level: { value: 5 },
      privateNotes:
        "<p>惠特洛指挥官 Commander Whitlaw。被拒救援侦察兵后组建叛军第26团。主：正当程序；备：爱国者的阴影；副：让自由之歌/对应物；近战：骑兵佩剑；医疗：强大的宪法；护符：荣耀之梦、荣耀的光泽。</p>\n<p>Creature 5。可与里金斯同场（严厉+）；对 4×2 级团为首领级遭遇。</p>",
      publicNotes:
        "<p>战役帽檐下，鹰徽已褪色。他拒绝等待许可，把第26团拖进入侵区——如今只有枪还能按住颤抖的手，对准敌人，或对准盟友。</p>\n<p><em>四人 2 级团 · Creature 5 · 第26团指挥官</em></p>",
      publication: pubH,
    },
    initiative: { statistic: "perception" },
    perception: {
      details: "疑神疑鬼；总在找逃兵",
      mod: 14,
      senses: [{ type: "low-light-vision" }],
    },
    resources: {},
    saves: {
      fortitude: { saveDetail: "", value: 14 },
      reflex: { saveDetail: "", value: 13 },
      will: { saveDetail: "持枪时 +2 vs 恐惧；空手 −2", value: 13 },
    },
    skills: {
      diplomacy: { base: 14 },
      intimidation: { base: 16 },
      society: { base: 12 },
      stealth: { base: 11 },
      warfare: { base: 16 },
    },
    traits: {
      rarity: "unique",
      size: { value: "med" },
      value: ["human", "humanoid"],
    },
  },
  prototypeToken: {
    name: "惠特洛指挥官",
    width: 1,
    height: 1,
    texture: {
      src: "modules/wang-pf2e-homebrew/assets/hunt/commander-whitlaw.png",
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
      huntHunter: "commander-whitlaw",
      theme: "26th-regiment",
      pairWith: "whbHuntSgtRigg01",
      preferredLoadout: [
        "due-process",
        "patriots-shadow",
        "let-freedom-sing",
        "the-counterpart",
        "cavalry-sabre-whitlaw",
        "a-strong-constitution",
        "dream-of-glory",
        "golden-signet",
      ],
    },
  },
};

assertId(whitlaw._id, "whitlaw");
for (const i of whitlaw.items) assertId(i._id, i.name);
fs.writeFileSync(path.join(actorsDir, "whbHuntWhitlaw01.json"), JSON.stringify(whitlaw, null, 2) + "\n");
console.log("wrote whitlaw", whitlaw.items.length);

const modPath = path.join(root, "module.json");
const mod = JSON.parse(fs.readFileSync(modPath, "utf8"));
mod.version = "1.17.0";
fs.writeFileSync(modPath, JSON.stringify(mod, null, 2) + "\n");
console.log("version", mod.version);
