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
const pubT = { ...pub, title: "猎杀对决 — 战术" };

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

function gun({
  _id,
  name,
  img,
  lore,
  gm,
  slug,
  enName,
  wikiIcon,
  baseWeapon,
  folder = "whbHntFldWpn0001",
  level = 3,
  price = 14,
  bulk = 2,
  usage = "held-in-two-hands",
  range,
  capacity,
  die = "d8",
  dice = 1,
  traits,
  rulesExtra = [],
  unidentified = "步枪",
  slots = 3,
}) {
  return {
    _id,
    folder,
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
        otherTags: ["hunt-showdown", "hunt-weapon", "the-statesman"],
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
      damage: { dice, die, damageType: "piercing", persistent: null },
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
        theme: "the-statesman",
        baseWeapon,
      },
    },
  };
}

const items = [];

items.push(
  gun({
    _id: "whbHuntBirthrgt1",
    name: "天赋权利 Birthright",
    img: "modules/wang-pf2e-homebrew/assets/hunt/bornheim-no3.png",
    lore: `<p>政治家从一个愚蠢之人的尸体上夺走了这把博恩海姆 3 号手枪，那人根本不知道如何正确使用它。现在它以正义的精准度执行任务，就像某人的天赋权利一样自然，击倒任何阻碍它实现目标的人。</p>
<blockquote><p><strong>兵器之书 · BORNHEIM NO.3 · BIRTHRIGHT</strong> 从死人手里拿走的「天赋」。</p></blockquote>
<p><strong>熟练</strong> 持用期间视为受训。</p>
<hr />
<p>同 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntBornheim1]{Bornheim No.3}：30 尺、1d4、capacity-5、速射扳机（1 动作两次各 −3 同 MAP）。</p>
<hr />
<p><strong>天赋权利</strong> 对「挡路/阻挠你目标」的生物（GM 或已标记）攻击 +1 环境。速射时该加值仍适用。</p>`,
    gm: "<p>Bornheim skin「天赋权利」。速射 + 挡路目标 +1。</p>",
    slug: "birthright",
    enName: "Birthright",
    wikiIcon: "Weapon_Bornheim_No._3.png",
    baseWeapon: "bornheim-no-3",
    bulk: 0.1,
    usage: "held-in-one-hand",
    range: 30,
    capacity: 5,
    die: "d4",
    traits: ["concussive", "sweep", "capacity-5"],
    unidentified: "半自动手枪",
    slots: 2,
    rulesExtra: [
      {
        key: "RollOption",
        domain: "attack",
        option: "hunt-birthright-block",
        toggleable: true,
        placement: "actions",
        label: "天赋权利 — 目标挡路（GM）",
      },
      {
        key: "FlatModifier",
        selector: "strike-attack-roll",
        type: "circumstance",
        value: 1,
        label: "天赋权利",
        predicate: ["hunt-birthright-block", "item:id:{item|_id}"],
        hideIfDisabled: true,
      },
    ],
  }),
);

items.push(
  gun({
    _id: "whbHuntCorrEst01",
    name: "腐败庄园 Corruption's Estate",
    img: "modules/wang-pf2e-homebrew/assets/hunt/bornheim-no3.png",
    lore: `<p>这位政治家曾被原始契约俘虏。如今，作为荒芜之地的代表，他佩戴着这把刻有定制植物图案的手枪，以此表明他的观点：自然并非法律，他才是。</p>
<blockquote><p><strong>兵器之书 · BORNHEIM NO.3 · CORRUPTION'S ESTATE</strong> 植物纹样刻在枪上——嘲讽自然。</p></blockquote>
<p>基底同 Bornheim（30 尺、1d4、速射）。</p>
<hr />
<p><strong>他才是法律</strong> 对抗野兽、植物、或「原始契约/自然律」主题效果时，豁免 +1；以此枪命中此类目标额外 @Damage[1d4[precision]]。</p>`,
    gm: "<p>Bornheim skin「腐败庄园」。反自然主题。</p>",
    slug: "corruptions-estate",
    enName: "Corruption's Estate",
    wikiIcon: "Weapon_Bornheim_No._3.png",
    baseWeapon: "bornheim-no-3",
    bulk: 0.1,
    usage: "held-in-one-hand",
    range: 30,
    capacity: 5,
    die: "d4",
    traits: ["concussive", "sweep", "capacity-5"],
    unidentified: "雕花手枪",
    slots: 2,
    rulesExtra: [
      {
        key: "RollOption",
        domain: "damage",
        option: "hunt-corrupt-estate",
        toggleable: true,
        placement: "actions",
        label: "腐败庄园 — 目标为自然/野兽（GM）",
      },
      {
        key: "DamageDice",
        selector: "damage",
        label: "他才是法律",
        diceNumber: 1,
        dieSize: "d4",
        damageType: "precision",
        predicate: ["hunt-corrupt-estate", "item:id:{item|_id}"],
      },
    ],
  }),
);

items.push(
  gun({
    _id: "whbHuntDebateEd1",
    name: "辩论结束 Debate's End",
    img: "modules/wang-pf2e-homebrew/assets/hunt/mako-1895.png",
    lore: `<p>这位政治家是个讲究礼仪的人——如果他心情好的话。其他时候，他更愿意用这支 1895 型马科步枪来尽快结束一场令人沮丧的谈话，尤其是在时间紧迫、悬赏名单又很长的时候。</p>
<blockquote><p><strong>兵器之书 · MAKO 1895 · DEBATE'S END</strong> 一发结束辩论。</p></blockquote>
<p><strong>熟练</strong> 持用期间视为受训。</p>
<hr />
<p><strong>类别</strong> 军用火器；负载 2；双手；射程增量 <strong>110 尺</strong>；装填 1；容量 1</p>
<p><strong>伤害</strong> 1d12 穿刺；特质：震荡、fatal-d12</p>
<hr />
<p><strong>辩论结束</strong> 若目标本回合曾对你使用语言相关动作（恐吓/交涉/欺骗/指挥等）或你已对其「点名发言」，命中额外 @Damage[1d6[precision]]，且目标下一次语言动作承受 −2。</p>`,
    gm: "<p>Mako 1895 skin「辩论结束」。单发 1d12 fatal-d12、110ft。</p>",
    slug: "debates-end",
    enName: "Debate's End",
    wikiIcon: "Weapon_Mako_1895.png",
    baseWeapon: "mako-1895",
    price: 18,
    range: 110,
    capacity: 1,
    die: "d12",
    traits: ["concussive", "fatal-d12"],
    unidentified: "单发卡宾",
    rulesExtra: [
      {
        key: "RollOption",
        domain: "damage",
        option: "hunt-debate-end",
        toggleable: true,
        placement: "actions",
        label: "辩论结束 — 目标已发言/被点名",
      },
      {
        key: "DamageDice",
        selector: "damage",
        label: "辩论结束",
        diceNumber: 1,
        dieSize: "d6",
        damageType: "precision",
        predicate: ["hunt-debate-end", "item:id:{item|_id}"],
      },
    ],
  }),
);

items.push(
  gun({
    _id: "whbHuntNewHeir01",
    name: "新传家宝 New Heirloom",
    img: "modules/wang-pf2e-homebrew/assets/hunt/mako-1895.png",
    lore: `<p>这支 1895 年产的 Mako Aperture 步枪曾传给一位石油继承人，他在一场土地纠纷中过于激进。他万万没想到自己会被河对岸的同名枪支击毙，而这支枪也成了《政治家报》的新传家宝。</p>
<blockquote><p><strong>兵器之书 · MAKO 1895 APERTURE · NEW HEIRLOOM</strong> 河对岸夺来的遗产。</p></blockquote>
<p>1d12、fatal-d12、射程 <strong>120 尺</strong>、容量 1。</p>
<hr />
<p><strong>光圈传家</strong>（开关）瞄准：攻击 +1，忽略隐蔽持平。</p>
<p><strong>土地纠纷</strong> 对 60 尺外目标伤害 +2。</p>`,
    gm: "<p>Mako Aperture skin「新传家宝」。120ft、瞄准+1、远距+2。</p>",
    slug: "new-heirloom",
    enName: "New Heirloom",
    wikiIcon: "Weapon_Mako_1895_Aperture.png",
    baseWeapon: "mako-1895-aperture",
    price: 20,
    range: 120,
    capacity: 1,
    die: "d12",
    traits: ["concussive", "fatal-d12"],
    unidentified: "带光圈的卡宾",
    rulesExtra: [
      {
        key: "RollOption",
        domain: "attack",
        option: "hunt-new-heirloom-sight",
        toggleable: true,
        placement: "actions",
        label: "新传家宝 — 光圈瞄准",
      },
      {
        key: "FlatModifier",
        selector: "strike-attack-roll",
        type: "circumstance",
        value: 1,
        label: "光圈传家",
        predicate: ["hunt-new-heirloom-sight", "item:id:{item|_id}"],
        hideIfDisabled: true,
      },
      {
        key: "RollOption",
        domain: "damage",
        option: "hunt-new-heirloom-far",
        toggleable: true,
        placement: "actions",
        label: "新传家宝 — 目标在 60 尺外",
      },
      {
        key: "FlatModifier",
        selector: "damage",
        type: "status",
        value: 2,
        damageType: "piercing",
        label: "土地纠纷",
        predicate: ["hunt-new-heirloom-far", "item:id:{item|_id}"],
        hideIfDisabled: true,
      },
    ],
  }),
);

items.push(
  gun({
    _id: "whbHuntFalseInh1",
    name: "虚假的继承 False Inheritance",
    img: "modules/wang-pf2e-homebrew/assets/hunt/mako-1895.png",
    lore: `<p>人们常说政治没有金钱可赚——也就是说，为职位服务没有金钱可赚。然而，友谊和人情关系随着时间的推移却能带来丰厚的回报，而这位马科可以立即完成剩下的工作。</p>
<blockquote><p><strong>兵器之书 · MAKO 1895 · FALSE INHERITANCE</strong> 人情收尾，枪做公证人。</p></blockquote>
<p>同辩论结束基底：1d12、110 尺、fatal-d12。</p>
<hr />
<p><strong>人情公证</strong> 若目标本场曾与你交涉成功/失败，或你宣称「人情债」（GM），命中造成额外 @Damage[1d8[precision]]（一次了结）。</p>`,
    gm: "<p>Mako skin「虚假的继承」。人情债 +1d8 精密。</p>",
    slug: "false-inheritance",
    enName: "False Inheritance",
    wikiIcon: "Weapon_Mako_1895.png",
    baseWeapon: "mako-1895",
    price: 18,
    range: 110,
    capacity: 1,
    die: "d12",
    traits: ["concussive", "fatal-d12"],
    rulesExtra: [
      {
        key: "RollOption",
        domain: "damage",
        option: "hunt-false-inheritance",
        toggleable: true,
        placement: "actions",
        label: "虚假的继承 — 人情债了结（GM）",
      },
      {
        key: "DamageDice",
        selector: "damage",
        label: "人情公证",
        diceNumber: 1,
        dieSize: "d8",
        damageType: "precision",
        predicate: ["hunt-false-inheritance", "item:id:{item|_id}"],
      },
    ],
  }),
);

items.push(
  gun({
    _id: "whbHuntFilibust1",
    name: "冗长辩论 Filibuster",
    img: "modules/wang-pf2e-homebrew/assets/hunt/frontier-73c-silencer.png",
    lore: `<p>有时候，人们会不合时宜地发言，却不知道这位政治家的脾气有多暴躁。他用这把 Frontier 73C 消音器悄无声息地消除这些喋喋不休的人，因为他没时间听那些自以为比他懂得多的人胡言乱语。</p>
<blockquote><p><strong>兵器之书 · FRONTIER 73C SILENCER · FILIBUSTER</strong> 消音结束冗长发言。</p></blockquote>
<p>基底近 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntFront73C1]{Frontier 73C}：1d8、70 尺（消音略短）、capacity-7。</p>
<hr />
<p><strong>无声打断</strong> 枪声沉闷。目标未察觉你时，打开开关：目标对此次打击措手不及。</p>
<p><strong>闭嘴</strong> 命中后目标 1 轮内语言动作需意志 DC（14+等级×2），失败则浪费该动作。</p>`,
    gm: "<p>Frontier 73C Silencer「冗长辩论」。静音措手不及 + 闭嘴。</p>",
    slug: "filibuster",
    enName: "Filibuster",
    wikiIcon: "Weapon_Frontier_73C_Silencer.png",
    baseWeapon: "frontier-73c-silencer",
    price: 16,
    range: 70,
    capacity: 7,
    die: "d8",
    traits: ["concussive", "capacity-7"],
    unidentified: "消音杠杆枪",
    rulesExtra: [
      {
        key: "RollOption",
        domain: "attack",
        option: "hunt-filibuster-silent",
        toggleable: true,
        placement: "actions",
        label: "冗长辩论 — 目标未察觉你",
      },
      {
        key: "Note",
        selector: "strike-attack-roll",
        title: "无声打断",
        text: "未察觉：目标措手不及。命中后语言动作可能被打断。",
        predicate: ["hunt-filibuster-silent", "item:id:{item|_id}"],
      },
    ],
  }),
);

items.push(
  gun({
    _id: "whbHuntNobleEx01",
    name: "高尚的处决 Noble Execution",
    img: "modules/wang-pf2e-homebrew/assets/hunt/caldwell-marathon.png",
    lore: `<p>有些击杀比其他击杀更重要。政治家深谙此道，他将这招马拉松式迅捷留到必须以高尚的死亡来维持平衡之时——或者需要快速装弹以应对之后可能发生的任何情况时。</p>
<blockquote><p><strong>兵器之书 · CALDWELL MARATHON SWIFT · NOBLE EXECUTION</strong> 重要的死亡，要留到账本需要平衡时。</p></blockquote>
<p><strong>类别</strong> 军用；双手；80 尺；装填 1；容量 5；1d8 穿刺；震荡、横扫、capacity-5</p>
<p><strong>马拉松迅捷</strong> 打击不引发借机；装填后免费快步 5 尺（每轮 1）。</p>
<hr />
<p><strong>高尚处决</strong>（本场 1 次开关）声明「平衡账本」：下次命中升一档判定（失败→成功，成功→重击），或改为装填后本回合可再免费打击一次（−5 MAP）。</p>`,
    gm: "<p>Marathon Swift skin「高尚的处决」。Swift 循环 + 本场一次升档/追加。</p>",
    slug: "noble-execution",
    enName: "Noble Execution",
    wikiIcon: "Weapon_Caldwell_Marathon_Swift.png",
    baseWeapon: "caldwell-marathon-swift",
    price: 16,
    range: 80,
    capacity: 5,
    die: "d8",
    traits: ["concussive", "sweep", "capacity-5"],
    rulesExtra: [
      {
        key: "Note",
        selector: "strike-attack-roll",
        title: "马拉松迅捷",
        text: "不引发借机；装填后本轮可免费快步一次。",
        predicate: ["item:id:{item|_id}"],
      },
      {
        key: "RollOption",
        domain: "attack",
        option: "hunt-noble-execution",
        toggleable: true,
        placement: "actions",
        label: "高尚的处决 — 平衡账本（本场1次）",
      },
      {
        key: "Note",
        selector: "strike-attack-roll",
        title: "高尚的处决",
        text: "本场一次：升档或装填后追加打击。",
        predicate: ["hunt-noble-execution", "item:id:{item|_id}"],
      },
    ],
  }),
);

items.push(
  gun({
    _id: "whbHuntHubris001",
    name: "妄自尊大 Hubris",
    img: "modules/wang-pf2e-homebrew/assets/hunt/caldwell-marathon.png",
    lore: `<p>荒芜的使者深知许多人想要他所拥有的，却不愿付出努力。这场由他自身努力铸就的马拉松，将迅速粉碎对手微不足道的野心。</p>
<blockquote><p><strong>兵器之书 · CALDWELL MARATHON · HUBRIS</strong> 用努力砸碎别人的野心。</p></blockquote>
<p>1d8、80 尺、capacity 6（标准马拉松弹仓）。</p>
<hr />
<p><strong>粉碎野心</strong> 对有临时生命、或本场曾对你示威/恐吓的目标，伤害 +1d6。</p>`,
    gm: "<p>Marathon skin「妄自尊大」。对虚张声势目标 +1d6。</p>",
    slug: "hubris-marathon",
    enName: "Hubris",
    wikiIcon: "Weapon_Caldwell_Marathon.png",
    baseWeapon: "caldwell-marathon",
    price: 14,
    range: 80,
    capacity: 6,
    die: "d8",
    traits: ["concussive", "capacity-6"],
    rulesExtra: [
      {
        key: "RollOption",
        domain: "damage",
        option: "hunt-hubris",
        toggleable: true,
        placement: "actions",
        label: "妄自尊大 — 目标虚张/有临时生命",
      },
      {
        key: "DamageDice",
        selector: "damage",
        label: "粉碎野心",
        diceNumber: 1,
        dieSize: "d6",
        damageType: "piercing",
        predicate: ["hunt-hubris", "item:id:{item|_id}"],
      },
    ],
  }),
);

const spear = {
  _id: "whbHuntDeathSen1",
  folder: "whbHntFldWpn0001",
  name: "死刑判决 Death Sentence",
  type: "weapon",
  img: "modules/wang-pf2e-homebrew/assets/hunt/throwing-spear.png",
  system: {
    description: {
      value: `<p>偷猎者跪在他们在《政治家报》花园里猎杀的一头大象前，象牙被锯断后摆放在他们面前。苍白的法官被请来宣判。他掂了掂象牙，刺向每个偷猎者，然后用象牙打造了这支投掷长矛。</p>
<blockquote><p><strong>兵器之书 · THROWING SPEAR · DEATH SENTENCE</strong> 苍白法官的象牙判决。</p></blockquote>
<p><strong>熟练</strong> 持用期间视为受训。</p>
<hr />
<p><strong>近战</strong> 1d8 穿刺；投掷射程增量 <strong>20 尺</strong>。</p>
<hr />
<p><strong>宣判</strong>（1 动作）点名邻接或 20 尺内目标为「死刑犯」：下次此矛对其攻击 +2；命中则额外 @Damage[1d6[piercing]] 且目标惊惧 1（意志 DC 14+等级×2 免惊惧）。每场每目标 1 次。</p>`,
      gm: "<p>Throwing Spear「死刑判决」。宣判 +2 与额外伤害/惊惧。与苍白法官 lore 相连。</p>",
    },
    rules: [
      { ...PROF },
      {
        key: "RollOption",
        domain: "attack",
        option: "hunt-death-sentence",
        toggleable: true,
        placement: "actions",
        label: "死刑判决 — 已宣判目标",
      },
      {
        key: "FlatModifier",
        selector: "strike-attack-roll",
        type: "circumstance",
        value: 2,
        label: "宣判",
        predicate: ["hunt-death-sentence", "item:id:{item|_id}"],
        hideIfDisabled: true,
      },
      {
        key: "DamageDice",
        selector: "damage",
        label: "象牙判决",
        diceNumber: 1,
        dieSize: "d6",
        damageType: "piercing",
        predicate: ["hunt-death-sentence", "item:id:{item|_id}"],
      },
    ],
    slug: "death-sentence",
    traits: {
      value: ["thrown-20", "versatile-s"],
      rarity: "uncommon",
      otherTags: ["hunt-showdown", "hunt-weapon", "the-statesman"],
    },
    publication: pub,
    level: { value: 3 },
    quantity: 1,
    baseItem: null,
    bulk: { value: 1 },
    hp: { value: 0, max: 0 },
    hardness: 0,
    price: { value: { gp: 10 } },
    equipped: { carryType: "worn", handsHeld: 0 },
    containerId: null,
    size: "med",
    material: { type: null, grade: null },
    identification: {
      status: "identified",
      unidentified: {
        name: "象牙长矛",
        img: "systems/pf2e/icons/unidentified_item_icons/weapons.webp",
        data: { description: { value: "<p>象牙削成的矛。</p>" } },
      },
    },
    usage: { value: "held-in-one-hand" },
    category: "martial",
    group: "spear",
    bonus: { value: 0 },
    bonusDamage: { value: 0 },
    damage: { dice: 1, die: "d8", damageType: "piercing", persistent: null },
    splashDamage: { value: 0 },
    range: 20,
    expend: null,
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
      huntSlots: 1,
      enName: "Death Sentence",
      theme: "the-statesman",
      baseWeapon: "throwing-spear",
      loreLinks: ["pale-judge"],
    },
  },
};
items.push(spear);

items.push({
  _id: "whbHuntFinlCon01",
  folder: "whbHntFldMed0001",
  name: "最终宪法 Final Constitution",
  type: "consumable",
  img: "modules/wang-pf2e-homebrew/assets/hunt/antidote-shot.png",
  system: {
    description: {
      value: `<p>这位政治家深知毒药的危害；许多人因他所掌握的权力而感到威胁。这支弱效解毒剂可以作为保险，抵御那些企图以如此卑鄙手段谋害他的人。</p>
<blockquote><p><strong>医疗 · ANTIDOTE SHOT (WEAK) · FINAL CONSTITUTION</strong></p></blockquote>
<p>规则同弱效版 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntAnti00001]{解毒针}：1 动作注射，清除猎杀中毒；毒素伤害抗性 5（1 分钟）而非全免疫——「弱效」保险，够用但不夸张。</p>`,
      gm: "<p>Weak Antidote skin。清中毒 + 毒抗 5 / 1 分钟。</p>",
    },
    rules: [],
    slug: "final-constitution",
    traits: {
      value: ["alchemical", "consumable", "elixir", "healing"],
      rarity: "uncommon",
      otherTags: ["hunt-showdown", "hunt-medical", "the-statesman"],
    },
    publication: pubM,
    level: { value: 2 },
    quantity: 1,
    baseItem: null,
    bulk: { value: 0.1 },
    price: { value: { gp: 12 } },
    equipped: { carryType: "worn", invested: null },
    containerId: null,
    size: "med",
    identification: {
      status: "identified",
      unidentified: {
        name: "绿色针剂",
        img: "systems/pf2e/icons/unidentified_item_icons/other-consumables.webp",
        data: { description: { value: "<p>保险用的针。</p>" } },
      },
      misidentified: {},
    },
    category: "other",
    uses: { value: 1, max: 1, autoDestroy: true },
    usage: { value: "held-in-one-hand" },
    stackGroup: null,
  },
  flags: {
    "wang-pf2e-homebrew": {
      source: "hunt-showdown",
      huntCategory: "medical",
      enName: "Final Constitution",
      theme: "the-statesman",
      skinOf: "whbHuntAnti00001",
    },
  },
});

items.push({
  _id: "whbHuntStonewl01",
  folder: "whbHntFldTact001",
  name: "石墙者 Stonewaller",
  type: "equipment",
  img: "systems/pf2e/icons/equipment/worn-items/other-worn-items/brooch-of-avoidance.webp",
  system: {
    description: {
      value: `<p>荒芜之地的代表认为，最有效的谈判策略就是省口舌。把话语当作珍贵的礼物，并且要精准地把握时机，确保别人在你开口时会认真倾听。</p>
<hr />
<p><strong>用法</strong> 佩戴（投资）。</p>
<p><strong>效果</strong> 你在遭遇中第一次使用交涉或恐吓前，对该技能的检定 +2 环境（「开口即礼物」）。此后该加值消失，直到下次遭遇。被动：对抗语言/听觉威压类效果豁免 +1。</p>`,
      gm: "<p>Charm「石墙者」。首句社交 +2；抗语言威压 +1。</p>",
    },
    rules: [
      {
        key: "RollOption",
        domain: "skill-check",
        option: "hunt-stonewall-first-word",
        toggleable: true,
        placement: "actions",
        label: "石墙者 — 本场首次发言（交涉/恐吓）",
      },
      {
        key: "FlatModifier",
        selector: ["diplomacy", "intimidation"],
        type: "circumstance",
        value: 2,
        label: "开口即礼物",
        predicate: ["hunt-stonewall-first-word"],
        hideIfDisabled: true,
      },
    ],
    slug: "stonewaller",
    traits: {
      value: ["invested"],
      rarity: "uncommon",
      otherTags: ["hunt-showdown", "hunt-charm", "the-statesman"],
    },
    publication: pubT,
    level: { value: 3 },
    quantity: 1,
    baseItem: null,
    bulk: { value: 0 },
    price: { value: { gp: 16 } },
    equipped: { carryType: "worn", invested: true },
    containerId: null,
    size: "med",
    identification: {
      status: "identified",
      unidentified: {
        name: "袖扣",
        img: "systems/pf2e/icons/unidentified_item_icons/other-consumables.webp",
        data: { description: { value: "<p>沉默的饰物。</p>" } },
      },
      misidentified: {},
    },
    usage: { value: "worn" },
  },
  flags: {
    "wang-pf2e-homebrew": {
      source: "hunt-showdown",
      huntCategory: "tactic",
      enName: "Stonewaller",
      theme: "the-statesman",
    },
  },
});

items.push({
  _id: "whbHuntBefrFire1",
  folder: "whbHntFldTact001",
  name: "烟火之前 Before the Fireworks",
  type: "equipment",
  img: "systems/pf2e/icons/equipment/worn-items/other-worn-items/ring-of-lies.webp",
  system: {
    description: {
      value: `<p>荒凉之地的代表在一场扑克牌局中，于一处偏僻小屋的深处赢得了这件纪念品。男士戒指内侧刻着「玛丽」的字样，女士戒指内侧刻着「彼得」。他觉得这太甜腻了。</p>
<hr />
<p><strong>用法</strong> 佩戴（投资）。</p>
<p><strong>效果</strong> 欺骗检定 +1 环境。每场遭遇 1 次：当你即将成为打击目标时，可宣称「还不到烟火」——该次攻击对你有 −1 环境（分心想起甜腻情话）。</p>`,
      gm: "<p>Charm「烟火之前」。欺骗 +1；本场 1 次被打 −1。</p>",
    },
    rules: [
      {
        key: "FlatModifier",
        selector: "deception",
        type: "circumstance",
        value: 1,
        label: "烟火之前",
      },
    ],
    slug: "before-the-fireworks",
    traits: {
      value: ["invested"],
      rarity: "uncommon",
      otherTags: ["hunt-showdown", "hunt-charm", "the-statesman"],
    },
    publication: pubT,
    level: { value: 2 },
    quantity: 1,
    baseItem: null,
    bulk: { value: 0 },
    price: { value: { gp: 10 } },
    equipped: { carryType: "worn", invested: true },
    containerId: null,
    size: "med",
    identification: {
      status: "identified",
      unidentified: {
        name: "对戒",
        img: "systems/pf2e/icons/unidentified_item_icons/other-consumables.webp",
        data: { description: { value: "<p>一对刻名戒指。</p>" } },
      },
      misidentified: {},
    },
    usage: { value: "worn" },
  },
  flags: {
    "wang-pf2e-homebrew": {
      source: "hunt-showdown",
      huntCategory: "tactic",
      enName: "Before the Fireworks",
      theme: "the-statesman",
    },
  },
});

for (const it of items) {
  assertId(it._id, it.name);
  fs.writeFileSync(path.join(itemsDir, `${it._id}.json`), JSON.stringify(it, null, 2) + "\n");
}
console.log("items", items.length);

const statesman = {
  _id: "whbHuntStatemn01",
  folder: "whbfolderHntHt01",
  name: "政治家 / 荒芜代表 The Statesman",
  type: "npc",
  img: "modules/wang-pf2e-homebrew/assets/hunt/the-statesman.png",
  items: [
    {
      _id: "whbStDebate00001",
      img: "modules/wang-pf2e-homebrew/assets/hunt/mako-1895.png",
      name: "辩论结束",
      sort: 100000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 17 },
        damageRolls: { whbStDmgDebate1: { damage: "2d12+5", damageType: "piercing" } },
        description: {
          value:
            "<p>主火力 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntDebateEd1]{辩论结束}（Mako 1895）。射程 <strong>110 尺</strong>；单发。目标已发言/被点名时 +1d6 精密。</p>",
        },
        publication: pubH,
        range: 110,
        rules: [],
        slug: "statesman-debate",
        traits: { value: ["concussive", "fatal-d12"] },
      },
    },
    {
      _id: "whbStHeirloom001",
      img: "modules/wang-pf2e-homebrew/assets/hunt/mako-1895.png",
      name: "新传家宝",
      sort: 110000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 16 },
        damageRolls: { whbStDmgHeir001: { damage: "2d12+5", damageType: "piercing" } },
        description: {
          value:
            "<p>@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntNewHeir01]{新传家宝}（Mako Aperture）。120 尺；光圈 +1；60 尺外 +2 伤。</p>",
        },
        publication: pubH,
        range: 120,
        rules: [],
        slug: "statesman-heirloom",
        traits: { value: ["concussive", "fatal-d12"] },
      },
    },
    {
      _id: "whbStFilibust001",
      img: "modules/wang-pf2e-homebrew/assets/hunt/frontier-73c-silencer.png",
      name: "冗长辩论",
      sort: 200000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 16 },
        damageRolls: { whbStDmgFili001: { damage: "2d8+4", damageType: "piercing" } },
        description: {
          value:
            "<p>@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntFilibust1]{冗长辩论}（Frontier 消音）。70 尺。未察觉→措手不及；命中可打断语言动作。</p>",
        },
        publication: pubH,
        range: 70,
        rules: [],
        slug: "statesman-filibuster",
        traits: { value: ["concussive"] },
      },
    },
    {
      _id: "whbStBirthrgt001",
      img: "modules/wang-pf2e-homebrew/assets/hunt/bornheim-no3.png",
      name: "天赋权利",
      sort: 210000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 16 },
        damageRolls: { whbStDmgBirth01: { damage: "2d4+3", damageType: "piercing" } },
        description: {
          value:
            "<p>@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntBirthrgt1]{天赋权利}（Bornheim）。30 尺；可速射。挡路目标 +1。另携 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntCorrEst01]{腐败庄园}。</p>",
        },
        publication: pubH,
        range: 30,
        rules: [],
        slug: "statesman-birthright",
        traits: { value: ["concussive", "agile"] },
      },
    },
    {
      _id: "whbStMarathon001",
      img: "modules/wang-pf2e-homebrew/assets/hunt/caldwell-marathon.png",
      name: "高尚的处决",
      sort: 220000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 16 },
        damageRolls: { whbStDmgNoble01: { damage: "2d8+4", damageType: "piercing" } },
        description: {
          value:
            "<p>@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntNobleEx01]{高尚的处决}（Marathon Swift）。账本平衡时升档。备用 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntHubris001]{妄自尊大} / @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntFalseInh1]{虚假的继承}。</p>",
        },
        publication: pubH,
        range: 80,
        rules: [],
        slug: "statesman-noble",
        traits: { value: ["concussive", "sweep"] },
      },
    },
    {
      _id: "whbStSpear000001",
      img: "modules/wang-pf2e-homebrew/assets/hunt/throwing-spear.png",
      name: "死刑判决",
      sort: 300000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 15 },
        damageRolls: { whbStDmgSpear01: { damage: "2d8+3", damageType: "piercing" } },
        description: {
          value:
            "<p>@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntDeathSen1]{死刑判决}。近战或投掷 20 尺。宣判后 +2 攻与 +1d6。</p>",
        },
        publication: pubH,
        range: 20,
        rules: [],
        slug: "statesman-spear",
        traits: { value: ["thrown"] },
      },
    },
    {
      _id: "whbStPatronage01",
      img: "systems/pf2e/icons/actions/OneAction.webp",
      name: "点名发言 / 赞助人意志",
      sort: 400000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "offensive",
        description: {
          value:
            "<p>匿名有用，野心需要强硬。点名 60 尺内一个生物：其语言动作触发「辩论结束」条件；你对其恐吓/交涉 +2。同时向 30 尺内盟友传播「主人意志」：盟友下次攻击该目标 +1 环境（代币与意志）。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "statesman-patron",
        traits: { value: ["auditory", "linguistic", "mental"] },
      },
    },
    {
      _id: "whbStSilent00001",
      img: "systems/pf2e/icons/actions/OneAction.webp",
      name: "石墙谈判",
      sort: 410000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "defensive",
        description: {
          value:
            "<p>佩戴 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntStonewl01]{石墙者}：本场首次恐吓或交涉 +2。此动作可改为「沉默施压」——目标意志 DC 21，失败惊惧 1 且本回合不能对你提要求（语言）。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "statesman-stonewall",
        traits: { value: ["mental"] },
      },
    },
    {
      _id: "whbStAntiShot001",
      img: "modules/wang-pf2e-homebrew/assets/hunt/antidote-shot.png",
      name: "最终宪法",
      sort: 500000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "defensive",
        description: {
          value:
            "<p>注射 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntFinlCon01]{最终宪法}：清除猎杀中毒，毒素抗性 5（1 分钟）。佩戴 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntGoldLust1]{荣耀的光泽}（惠特洛的教训）与 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntBefrFire1]{烟火之前}。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "statesman-constitution",
        traits: { value: ["manipulate"] },
      },
    },
    {
      _id: "whbStStonewall01",
      img: "systems/pf2e/icons/actions/Passive.webp",
      name: "荒芜之地的代表",
      sort: 600000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "defensive",
        description: {
          value:
            "<p>上次交锋以「政治家」之名幸存，捐助者源源不断。对抗毒素 +1；社交检定可用交涉代替部分恐吓（GM）。半血以下辩论结束射程内攻击 +1（名单很长，时间紧迫）。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "statesman-delegate",
        traits: { value: [] },
      },
    },
    {
      _id: "whbStTactics0001",
      img: "systems/pf2e/icons/actions/Passive.webp",
      name: "政治家战术（GM）",
      sort: 900000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "offensive",
        description: {
          value:
            "<p><strong>定位</strong>：远距单发终结者 + 社交控场。与惠特洛有旧识（荣耀的光泽）。</p>\n<ol>\n<li>点名发言 → 辩论结束/新传家宝收头</li>\n<li>喋喋不休者用冗长辩论消音</li>\n<li>贴身天赋权利速射或死刑判决</li>\n<li>账本关键时高尚处决</li>\n</ol>",
        },
        publication: pubH,
        rules: [],
        slug: "statesman-tactics",
        traits: { value: [] },
      },
    },
  ],
  effects: [],
  system: {
    abilities: {
      str: { mod: 2 },
      dex: { mod: 3 },
      con: { mid: 2 },
      int: { mod: 3 },
      wis: { mod: 2 },
      cha: { mod: 4 },
    },
    attributes: {
      ac: { details: "礼服下的软甲", value: 21 },
      allSaves: { value: "" },
      hp: { details: "捐助者买来的命", max: 84, temp: 0, value: 84 },
      speed: { value: 25, otherSpeeds: [] },
      resistances: [{ type: "poison", value: 3, exceptions: [] }],
      weaknesses: [],
      immunities: [],
    },
    details: {
      blurb: "政治家 · 荒芜之地的代表",
      languages: { details: "只在必要时开口", value: ["common"] },
      level: { value: 4 },
      privateNotes:
        "<p>The Statesman / Desolation's Delegate。主：辩论结束；辅：新传家宝、冗长辩论、天赋权利、高尚处决、死刑判决。护符：荣耀的光泽、石墙者、烟火之前。Creature 4 政治控场/远距单发。与惠特洛旧识。</p>",
      publicNotes:
        "<p>匿名有用，野心需要强硬。他从权术迷雾中现身，为效忠的主人攫取代币，把意志传给四面八方的猎人——并以「政治家」之名在上次交锋中幸存。</p>\n<p><em>四人 2 级团 · Creature 4 · 政治/单发终结</em></p>",
      publication: pubH,
    },
    initiative: { statistic: "perception" },
    perception: { details: "谁在浪费他的时间", mod: 14, senses: [{ type: "low-light-vision" }] },
    resources: {},
    saves: {
      fortitude: { saveDetail: "+1 vs 毒素", value: 12 },
      reflex: { saveDetail: "", value: 13 },
      will: { saveDetail: "石墙", value: 15 },
    },
    skills: {
      deception: { base: 14 },
      diplomacy: { base: 15 },
      intimidation: { base: 15 },
      society: { base: 14 },
      stealth: { base: 12 },
      survival: { base: 11 },
    },
    traits: { rarity: "unique", size: { value: "med" }, value: ["human", "humanoid"] },
  },
  prototypeToken: {
    name: "政治家",
    width: 1,
    height: 1,
    texture: {
      src: "modules/wang-pf2e-homebrew/assets/hunt/the-statesman.png",
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
      huntHunter: "the-statesman",
      theme: "the-statesman",
      preferredLoadout: [
        "debates-end",
        "new-heirloom",
        "filibuster",
        "birthright",
        "noble-execution",
        "death-sentence",
        "final-constitution",
        "golden-signet",
        "stonewaller",
      ],
      loreLinks: ["commander-whitlaw", "pale-judge"],
    },
  },
};

statesman.system.abilities.con = { mod: 2 };

assertId(statesman._id, "statesman");
for (const i of statesman.items) assertId(i._id, i.name);
fs.writeFileSync(path.join(actorsDir, "whbHuntStatemn01.json"), JSON.stringify(statesman, null, 2) + "\n");
console.log("wrote statesman", statesman.items.length);

const mod = readMod();
mod.version = "1.24.0";
fs.writeFileSync(path.join(root, "module.json"), JSON.stringify(mod, null, 2) + "\n");
console.log("version", mod.version);
