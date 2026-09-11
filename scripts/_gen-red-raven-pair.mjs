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
const pubT = { ...pub, title: "猎杀对决 — 陷阱" };
const pubTac = { ...pub, title: "猎杀对决 — 战术" };

function assertId(id, label) {
  if (!/^[a-zA-Z0-9]{16}$/.test(id)) throw new Error(`bad id ${label}: ${id} (${id.length})`);
}

const theHound = {
  _id: "whbHuntTheHound1",
  folder: "whbHntFldWpn0001",
  name: "猎犬 The Hound",
  type: "weapon",
  img: "modules/wang-pf2e-homebrew/assets/hunt/the-hound.png",
  system: {
    description: {
      value:
        "<p>红渡鸦和飞翔者以前侦察时从不留下任何痕迹。然而，一旦受污染的疫苗扭曲了他们的心智，他们就无法控制自己，开始猎杀追踪他们的猎人。这支步枪就是他们被疾病蒙蔽心智的证据。</p>\n<blockquote><p><strong>兵器之书 · CENTENNIAL · THE HOUND</strong> Winfield M1876 Centennial 的污秽皮肤：泥与血糊住机匣，像猎犬在沼泽里拖出的尸痕。</p></blockquote>\n<p><strong>熟练</strong> 持用期间视为受训。</p>\n<hr />\n<p><strong>类别</strong> 军用火器；<strong>负载</strong> 2；<strong>双手</strong>；<strong>射程增量</strong> 90 尺；<strong>装填</strong> 1；弹匣容量 10</p>\n<p><strong>伤害</strong> 1d10 穿刺；特质：震荡、capacity-10</p>\n<p><strong>弹药</strong> 标准中弹；本皮肤默认配 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntAmmoDum01]{达姆弹}（命中额外 1d4 持续流血）。</p>\n<hr />\n<p><strong>污秽猎径</strong> 以此武器命中时，若使用达姆弹（或本皮肤默认达姆），额外造成 @Damage[1d4[persistent,bleed]]。目标在你下一次对其打击前，对你 Stealth 的察觉 DC −2（血迹与惨叫会暴露他，却也掩盖你的脚步——侦察员的反讽）。</p>",
      gm: "<p>Hunt Centennial skin「The Hound / 猎犬」。1d10 P、90 尺、capacity-10。默认达姆弹流血。侦察双人组主题。</p>",
    },
    rules: [
      { ...PROF },
      {
        key: "DamageDice",
        selector: "damage",
        slug: "hunt-hound-dumdum",
        label: "猎犬·达姆",
        diceNumber: 1,
        dieSize: "d4",
        damageType: "bleed",
        category: "persistent",
        predicate: ["item:id:{item|_id}"],
      },
      {
        key: "Note",
        selector: "strike-damage",
        title: "污秽猎径",
        text: "达姆：1d4 持续流血。命中后目标对你察觉 DC −2（直至你下次打他）。",
        predicate: ["item:id:{item|_id}"],
      },
    ],
    slug: "the-hound",
    traits: {
      value: ["concussive", "capacity-10"],
      rarity: "uncommon",
      otherTags: ["hunt-showdown", "hunt-weapon", "scout-pair"],
    },
    publication: pub,
    level: { value: 3 },
    quantity: 1,
    baseItem: null,
    bulk: { value: 2 },
    hp: { value: 0, max: 0 },
    hardness: 0,
    price: { value: { gp: 18 } },
    equipped: { carryType: "worn", handsHeld: 0 },
    containerId: null,
    size: "med",
    material: { type: null, grade: null },
    identification: {
      status: "identified",
      unidentified: {
        name: "泥污杠杆步枪",
        img: "systems/pf2e/icons/unidentified_item_icons/weapons.webp",
        data: { description: { value: "<p>糊满泥浆的长杠杆步枪。</p>" } },
      },
    },
    usage: { value: "held-in-two-hands" },
    category: "martial",
    group: "firearm",
    bonus: { value: 0 },
    bonusDamage: { value: 0 },
    damage: { dice: 1, die: "d10", damageType: "piercing", persistent: null },
    splashDamage: { value: 0 },
    range: 90,
    expend: 1,
    ammo: { baseType: "rounds", builtIn: false, capacity: 10 },
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
      enName: "The Hound",
      wikiIcon: "Weapon_Centennial.png",
      theme: "scout-pair",
      baseWeapon: "centennial",
      defaultAmmo: "whbHuntAmmoDum01",
    },
  },
};

const pathRev = {
  _id: "whbHuntPathRev01",
  folder: "whbHntFldWpn0001",
  name: "启示之路 Path of Revelation",
  type: "weapon",
  img: "modules/wang-pf2e-homebrew/assets/hunt/lemat-mark-ii.png",
  system: {
    description: {
      value:
        "<p>当红鸦和飞翔者最初登上侦察塔时，他们对即将发生的一切一无所知。几乎立刻，他们就被迫用这支<strong>勒马特</strong>杀死了一名感染者——这是在他们获得疫苗之前众多不祥之兆中的第一个。</p>\n<p>被卷入狩猎场后，他们又用这把枪的<strong>重拳</strong>（霰弹筒）锁住侦察塔周围。不幸的是，再多的准备也无法保护他们的心智免受最终吞噬他们的腐化。</p>\n<blockquote><p><strong>兵器之书 · LEMAT MARK II · PATH OF REVELATION</strong> 九连发左轮 + 底下一根霰弹筒；启示来得又快又近。</p></blockquote>\n<p><strong>熟练</strong> 持用期间视为受训。</p>\n<hr />\n<p><strong>左轮模式</strong> 军用火器；负载 1；单手；射程增量 <strong>40 尺</strong>；装填 1；弹巢 9；伤害 1d8 穿刺；震荡、capacity-9</p>\n<p><strong>重拳（霰弹）</strong> 另见动作栏打击：射程增量 <strong>20 尺</strong>；伤害 1d8 穿刺（散射感）；每场遭遇建议限 1–2 发（容量 1）。命中时目标对该次豁免失败则 @UUID[Compendium.pf2e.conditionitems.Item.i3OJUmM1V6L8Lkbg]{击倒}（或 GM 改为退 5 尺）。</p>\n<hr />\n<p><strong>不祥之兆</strong> 每当你以此武器造成一次击杀（或重击），本回合内你的下一次打击获得 <strong>+1 环境加值</strong>（打开开关）。</p>",
      gm: "<p>Hunt LeMat Mark II skin「Path of Revelation / 启示之路」。左轮 1d8/40ft/cap9 + Strike「重拳」霰弹。侦察双人组。</p>",
    },
    rules: [
      { ...PROF },
      {
        key: "RollOption",
        domain: "attack",
        option: "hunt-path-omen",
        toggleable: true,
        placement: "actions",
        label: "启示之路 — 不祥之兆（本回合）",
      },
      {
        key: "FlatModifier",
        selector: "strike-attack-roll",
        type: "circumstance",
        value: 1,
        label: "不祥之兆",
        predicate: ["hunt-path-omen", "item:id:{item|_id}"],
        hideIfDisabled: true,
      },
      {
        key: "Strike",
        category: "martial",
        group: "firearm",
        slug: "path-revelation-punch",
        label: "启示之路 · 重拳（霰弹）",
        img: "modules/wang-pf2e-homebrew/assets/hunt/lemat-mark-ii.png",
        damage: { base: { damageType: "piercing", dice: 1, die: "d8" } },
        traits: ["concussive", "scatter"],
        range: { increment: 20 },
      },
      {
        key: "Note",
        selector: "strike-damage",
        title: "重拳",
        text: "霰弹命中：失败则击倒（或退 5 尺）。每场弹药紧张。",
        predicate: ["item:slug:path-revelation-punch"],
      },
    ],
    slug: "path-of-revelation",
    traits: {
      value: ["concussive", "capacity-9"],
      rarity: "uncommon",
      otherTags: ["hunt-showdown", "hunt-weapon", "scout-pair"],
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
        name: "双管左轮",
        img: "systems/pf2e/icons/unidentified_item_icons/weapons.webp",
        data: { description: { value: "<p>枪管下另有一根粗短的筒。</p>" } },
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
      enName: "Path of Revelation",
      wikiIcon: "Weapon_LeMat.png",
      theme: "scout-pair",
      baseWeapon: "lemat-mark-ii",
    },
  },
};

function trapSkin({ _id, name, img, baseUuid, baseName, hazardUuid, hazardName, lore, gm, slug, enName, wikiIcon }) {
  return {
    _id,
    folder: "whbHntFldTrap001",
    name,
    type: "consumable",
    img,
    system: {
      description: {
        value: `${lore}\n<hr />\n<p>规则同 @UUID[${baseUuid}]{${baseName}}：布置 2 动作，放置危境 @UUID[${hazardUuid}]{${hazardName}}。</p>`,
        gm,
      },
      rules: [],
      slug,
      traits: {
        value: ["consumable", "mechanical", "snare", "trap"],
        rarity: "uncommon",
        otherTags: ["hunt-showdown", "hunt-trap", "scout-pair"],
      },
      publication: pubT,
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
          name: "绊线装置",
          img: "systems/pf2e/icons/unidentified_item_icons/other-consumables.webp",
          data: { description: { value: "<p>缠线与木桩。</p>" } },
        },
        misidentified: {},
      },
      category: "snare",
      uses: { value: 1, max: 1, autoDestroy: true },
      damage: null,
      usage: { value: "held-in-one-hand" },
      stackGroup: null,
    },
    flags: {
      "wang-pf2e-homebrew": {
        source: "hunt-showdown",
        huntSlot: 1,
        huntCategory: "trap",
        enName,
        wikiIcon,
        theme: "scout-pair",
        skinOf: baseUuid.split(".").pop(),
      },
    },
  };
}

const heavyFoot = trapSkin({
  _id: "whbHuntHvyFoot01",
  name: "沉重的脚步声 Heavy Footfalls",
  img: "modules/wang-pf2e-homebrew/assets/hunt/alert-trip-mine.png",
  baseUuid: "Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntAlrtTM001",
  baseName: "警报拌雷",
  hazardUuid: "Compendium.wang-pf2e-homebrew.homebrew-actors.Actor.whbHuntHzAlert01",
  hazardName: "警报拌雷",
  lore: "<p>「飞翔者」过去一直偏爱速战速决、悄无声息的杀戮——但那是在他来到沼泽地之前。如今，他沉溺于腐化之中，用这些警示绊雷让未来的猎物们预感到死神即将降临，并从中获得一种被腐化力量侵蚀的快感。</p>\n<blockquote><p><strong>警报拌雷 · HEAVY FOOTFALLS</strong> 故意弄响的警告：死神喜欢先敲门。</p></blockquote>",
  gm: "<p>Alert Trip Mine skin「沉重的脚步声」。飞翔者专用风味；规则同警报拌雷。</p>",
  slug: "heavy-footfalls",
  enName: "Heavy Footfalls",
  wikiIcon: "Tool_Alert_Trip_Mines.png",
});

const damnFt = trapSkin({
  _id: "whbHuntDamnFt001",
  name: "该死的脚步声 Damn Footsteps",
  img: "modules/wang-pf2e-homebrew/assets/hunt/concertina-trip-mine.png",
  baseUuid: "Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntConcTM001",
  baseName: "铁丝网拌雷",
  hazardUuid: "Compendium.wang-pf2e-homebrew.homebrew-actors.Actor.whbHuntHzConc001",
  hazardName: "铁丝网拌雷",
  lore: "<p>红鸦曾是一位技艺精湛、受人尊敬的捕兽人，如今她却发现自己享受着手风琴的残酷，尽管它会毁坏兽皮。她设置这些手风琴绊雷，让猎物猝不及防地被利刃般的死亡之握所击倒。</p>\n<blockquote><p><strong>铁丝网拌雷 · DAMN FOOTSTEPS</strong> 刀丝展开的脆响，像该死的脚步落下。</p></blockquote>",
  gm: "<p>Concertina Trip Mine skin「该死的脚步声」。红鸦；规则同铁丝网拌雷。</p>",
  slug: "damn-footsteps",
  enName: "Damn Footsteps",
  wikiIcon: "Tool_Concertina_Trip_Mines.png",
});

const toxicFt = trapSkin({
  _id: "whbHuntToxicFt01",
  name: "剧毒脚步 Toxic Footfalls",
  img: "modules/wang-pf2e-homebrew/assets/hunt/poison-trip-mine.png",
  baseUuid: "Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntPoisTM001",
  baseName: "毒气拌雷",
  hazardUuid: "Compendium.wang-pf2e-homebrew.homebrew-actors.Actor.whbHuntHzPois001",
  hazardName: "毒气拌雷",
  lore: "<p>红渡鸦很快就意识到，沼泽里的怪物和她携带的武器一样有用。例如，她喜欢在遍布肉头怪的区域使用这些毒绊雷，让敌人自取灭亡。</p>\n<blockquote><p><strong>毒气拌雷 · TOXIC FOOTFALLS</strong> 把怪物变成陷阱的一部分。</p></blockquote>",
  gm: "<p>Poison Trip Mine skin「剧毒脚步」。红鸦；规则同毒气拌雷。</p>",
  slug: "toxic-footfalls",
  enName: "Toxic Footfalls",
  wikiIcon: "Tool_Poison_Trip_Mines.png",
});

const pride = {
  _id: "whbHuntPridePt01",
  folder: "whbHntFldTact001",
  name: "骄傲之点 Pride Point",
  type: "equipment",
  img: "systems/pf2e/icons/equipment/worn-items/other-worn-items/demon-mask.webp",
  system: {
    description: {
      value:
        "<p>飞翔者从一名猎人的尸体上取下了这件护符。那名猎人曾试图残忍地将他推入废喙鸟的巢穴，企图谋杀他。但他没有意识到，腐化扭曲了他的记忆——<strong>他才是那个挑衅者</strong>。</p>\n<blockquote><p><strong>武器护符 · PRIDE POINT</strong> 挂在枪上的骄傲残片；腐败会改写谁先动手的故事。</p></blockquote>\n<hr />\n<p><strong>用法</strong> 附着于一件武器（投资）。</p>\n<p><strong>效果</strong> 该武器的打击在目标对你<strong>措手不及</strong>时额外造成 @Damage[1d4[precision]]{1d4 精密}。每场遭遇你第一次成功命中后，你须尝试 @Check[will|dc:18|traits:mental]{意志 DC 18}：失败则获得 @UUID[Compendium.pf2e.conditionitems.Item.yblD8fOR1ToFIqO3]{困惑 1} 1 轮（记忆错乱的余波）。</p>",
      gm: "<p>Weapon charm「骄傲之点」。飞翔者。措手不及 +1d4 精密；本场首次命中后 Will DC18 或困惑 1。</p>",
    },
    rules: [
      {
        key: "DamageDice",
        selector: "strike-damage",
        label: "骄傲之点",
        diceNumber: 1,
        dieSize: "d4",
        damageType: "precision",
        predicate: ["target:condition:off-guard"],
      },
      {
        key: "Note",
        selector: "strike-damage",
        title: "骄傲之点",
        text: "对措手不及 +1d4 精密。本场首次命中后意志 DC18，失败困惑 1。",
      },
    ],
    slug: "pride-point",
    traits: {
      value: ["invested", "magical"],
      rarity: "uncommon",
      otherTags: ["hunt-showdown", "hunt-charm", "scout-pair"],
    },
    publication: pubTac,
    level: { value: 3 },
    quantity: 1,
    baseItem: null,
    bulk: { value: 0 },
    price: { value: { gp: 20 } },
    equipped: { carryType: "worn", invested: true },
    containerId: null,
    size: "med",
    identification: {
      status: "identified",
      unidentified: {
        name: "骨制护符",
        img: "systems/pf2e/icons/unidentified_item_icons/other-consumables.webp",
        data: { description: { value: "<p>从死人身上摘下的小护符。</p>" } },
      },
      misidentified: {},
    },
    usage: { value: "worn" },
  },
  flags: {
    "wang-pf2e-homebrew": {
      source: "hunt-showdown",
      huntCategory: "tactic",
      enName: "Pride Point",
      theme: "scout-pair",
      wearer: "flymander",
    },
  },
};

const items = [theHound, pathRev, heavyFoot, damnFt, toxicFt, pride];
for (const it of items) assertId(it._id, it.name);
for (const it of items) {
  fs.writeFileSync(path.join(itemsDir, `${it._id}.json`), JSON.stringify(it, null, 2) + "\n");
}
console.log("wrote", items.length, "items");

function scoutBase(overrides) {
  return {
    folder: "whbfolderHntHt01",
    type: "npc",
    effects: [],
    ownership: { default: 0 },
    ...overrides,
  };
}

const redRaven = scoutBase({
  _id: "whbHuntRedRaven1",
  name: "红鸦 Red Raven",
  img: "modules/wang-pf2e-homebrew/assets/hunt/red-raven.png",
  items: [
    {
      _id: "whbRrHound000001",
      img: "modules/wang-pf2e-homebrew/assets/hunt/the-hound.png",
      name: "猎犬",
      sort: 100000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 16 },
        damageRolls: { whbRrDmgHound01: { damage: "2d10+4", damageType: "piercing" } },
        description: {
          value:
            "<p>主手 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntTheHound1]{猎犬}（Centennial）。射程 <strong>90 尺</strong>。达姆：额外 @Damage[1d4[persistent,bleed]]。</p>",
        },
        publication: pubH,
        range: 90,
        rules: [],
        slug: "red-raven-hound",
        traits: { value: ["concussive"] },
      },
    },
    {
      _id: "whbRrPathRev0001",
      img: "modules/wang-pf2e-homebrew/assets/hunt/lemat-mark-ii.png",
      name: "启示之路",
      sort: 200000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 16 },
        damageRolls: { whbRrDmgPath001: { damage: "2d8+4", damageType: "piercing" } },
        description: {
          value:
            "<p>副手 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntPathRev01]{启示之路}（勒马特）。射程 <strong>40 尺</strong>。</p>",
        },
        publication: pubH,
        range: 40,
        rules: [],
        slug: "red-raven-path",
        traits: { value: ["concussive"] },
      },
    },
    {
      _id: "whbRrHeavyPunch1",
      img: "modules/wang-pf2e-homebrew/assets/hunt/lemat-mark-ii.png",
      name: "重拳（霰弹）",
      sort: 210000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: ["knockout"] },
        bonus: { value: 15 },
        damageRolls: { whbRrDmgPunch01: { damage: "2d8+5", damageType: "piercing" } },
        description: {
          value:
            "<p>勒马特底筒「重拳」。射程增量 <strong>20 尺</strong>。命中：@Check[fortitude|dc:20]{强韧 DC 20} 失败则 @UUID[Compendium.pf2e.conditionitems.Item.i3OJUmM1V6L8Lkbg]{击倒}（或退 5 尺）。封锁塔区用的那一击。</p>",
        },
        publication: pubH,
        range: 20,
        rules: [],
        slug: "red-raven-punch",
        traits: { value: ["concussive"] },
      },
    },
    {
      _id: "whbRrEyeKnife001",
      img: "systems/pf2e/icons/default-icons/melee.svg",
      name: "剜眼短刃",
      sort: 250000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 15 },
        damageRolls: { whbRrDmgKnife01: { damage: "2d6+4", damageType: "slashing" } },
        description: {
          value:
            "<p>她以前总是挖掉不肯正视她的敌人眼睛。疫苗让刀子刺得更深，速度也更慢：此打击<strong>无敏捷</strong>，但命中额外 @Damage[1d6[precision]]；重击时目标 @UUID[Compendium.pf2e.conditionitems.Item.XgEqL1kFApUbl5Z2]{目盲} 1 轮（一眼已瞎的叙事可改为隐蔽）。</p>",
        },
        publication: pubH,
        range: null,
        rules: [],
        slug: "red-raven-knife",
        traits: { value: ["finesse"] },
      },
    },
    {
      _id: "whbRrDamnFt00001",
      img: "modules/wang-pf2e-homebrew/assets/hunt/concertina-trip-mine.png",
      name: "该死的脚步声",
      sort: 300000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 2 },
        category: "offensive",
        description: {
          value:
            "<p>布置 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntDamnFt001]{该死的脚步声}（铁丝网拌雷皮）。隐匿 DC <strong>22</strong>。她享受刀丝毁坏兽皮的残酷。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "red-raven-damn",
        traits: { value: ["manipulate"] },
      },
    },
    {
      _id: "whbRrToxicFt0001",
      img: "modules/wang-pf2e-homebrew/assets/hunt/poison-trip-mine.png",
      name: "剧毒脚步",
      sort: 310000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 2 },
        category: "offensive",
        description: {
          value:
            "<p>布置 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntToxicFt01]{剧毒脚步}。她喜欢把它布在肉头怪出没区，让敌人自取灭亡。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "red-raven-toxic",
        traits: { value: ["manipulate"] },
      },
    },
    {
      _id: "whbRrBloodySky01",
      img: "systems/pf2e/icons/actions/Passive.webp",
      name: "血染天空",
      sort: 400000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "defensive",
        description: {
          value:
            "<p>实验性疫苗扭曲汇报：她的话语常变成血染天空的胡言。对抗读心、侦测谎言与魅惑时意志 +2 状态；但社交检定 −2。先攻可用察觉或生存。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "red-raven-sky",
        traits: { value: ["mental"] },
      },
    },
    {
      _id: "whbRrScoutPair01",
      img: "systems/pf2e/icons/actions/Passive.webp",
      name: "表亲侦察线",
      sort: 500000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "offensive",
        description: {
          value:
            "<p>若 30 尺内有 @UUID[Compendium.wang-pf2e-homebrew.homebrew-actors.Actor.whbHuntFlymandr1]{飞翔者}：两人共享猎物印记——对同一目标的打击 +1 环境；任一方布置陷阱时另一方可免费 Step。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "red-raven-pair",
        traits: { value: [] },
      },
    },
    {
      _id: "whbRrTactics0001",
      img: "systems/pf2e/icons/actions/Passive.webp",
      name: "红鸦战术（GM）",
      sort: 900000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "offensive",
        description: {
          value:
            "<p><strong>定位</strong>：腐化捕兽侦察兵。先布雷再猎杀。</p>\n<ol>\n<li>战前布<strong>该死的脚步</strong>/<strong>剧毒脚步</strong></li>\n<li>猎犬达姆点射逼人进陷阱</li>\n<li>近身启示之路或重拳清场</li>\n<li>贴脸剜眼短刃收割不肯正视者</li>\n</ol>",
        },
        publication: pubH,
        rules: [],
        slug: "red-raven-tactics",
        traits: { value: [] },
      },
    },
  ],
  system: {
    abilities: {
      str: { mod: 2 },
      dex: { mod: 4 },
      con: { mod: 2 },
      int: { mod: 1 },
      wis: { mod: 3 },
      cha: { mod: 2 },
    },
    attributes: {
      ac: { details: "军装 + 闪避", value: 22 },
      allSaves: { value: "" },
      hp: { details: "侦察兵偏脆，靠陷阱与风筝", max: 72, temp: 0, value: 72 },
      speed: { value: 30, otherSpeeds: [] },
      resistances: [],
      weaknesses: [],
      immunities: [],
    },
    details: {
      blurb: "红渡鸦 · 腐化捕兽侦察",
      languages: { details: "常语无伦次提及血染天空", value: ["common"] },
      level: { value: 4 },
      privateNotes:
        "<p>红鸦 Red Raven。与表兄飞翔者参军侦察。实验疫苗令刀更深更慢、汇报变成血天呓语。主猎犬+达姆；副启示之路；陷阱：该死的脚步、剧毒脚步。</p>\n<p>Creature 4 侦察偏脆。宜与飞翔者成对遭遇。</p>",
      publicNotes:
        "<p>军装肩章上挂着兽骨与羽毛，红战纹封住双眼。她曾是受人尊敬的捕兽人；疫苗之后，她把刀丝与毒雾当成新的「陷阱艺术」，并猎杀那些追踪她的猎人。</p>\n<p><em>四人 2 级团 · Creature 4 · 侦察/陷阱 · 建议与飞翔者同场</em></p>",
      publication: pubH,
    },
    initiative: { statistic: "perception" },
    perception: { details: "", mod: 14, senses: [{ type: "low-light-vision" }] },
    resources: {},
    saves: {
      fortitude: { saveDetail: "", value: 11 },
      reflex: { saveDetail: "", value: 14 },
      will: { saveDetail: "+2 vs 魅惑/读心", value: 12 },
    },
    skills: {
      crafting: { base: 12 },
      nature: { base: 12 },
      stealth: { base: 15 },
      survival: { base: 15 },
      thievery: { base: 13 },
    },
    traits: { rarity: "unique", size: { value: "med" }, value: ["human", "humanoid"] },
  },
  prototypeToken: {
    name: "红鸦",
    width: 1,
    height: 1,
    texture: { src: "modules/wang-pf2e-homebrew/assets/hunt/red-raven.png", scaleX: 1, scaleY: 1 },
    disposition: -1,
    displayBars: 40,
    bar1: { attribute: "attributes.hp" },
    sight: { enabled: true, range: 60, visionMode: "basic" },
    flags: { pf2e: { linkToActorSize: true, autoscale: true } },
    actorLink: false,
  },
  flags: {
    "wang-pf2e-homebrew": {
      source: "hunt-showdown",
      huntHunter: "red-raven",
      theme: "scout-pair",
      pairWith: "whbHuntFlymandr1",
      preferredLoadout: ["the-hound", "path-of-revelation", "damn-footsteps", "toxic-footfalls"],
    },
  },
});

const flymander = scoutBase({
  _id: "whbHuntFlymandr1",
  name: "飞翔者 Flymander",
  img: "modules/wang-pf2e-homebrew/assets/hunt/flymander.png",
  items: [
    {
      _id: "whbFmHound000001",
      img: "modules/wang-pf2e-homebrew/assets/hunt/the-hound.png",
      name: "猎犬",
      sort: 100000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 16 },
        damageRolls: { whbFmDmgHound01: { damage: "2d10+5", damageType: "piercing" } },
        description: {
          value:
            "<p>主手 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntTheHound1]{猎犬}。射程 <strong>90 尺</strong>。达姆流血。肩上乌鸦有时在开枪前先叫一声。</p>",
        },
        publication: pubH,
        range: 90,
        rules: [],
        slug: "flymander-hound",
        traits: { value: ["concussive"] },
      },
    },
    {
      _id: "whbFmPathRev0001",
      img: "modules/wang-pf2e-homebrew/assets/hunt/lemat-mark-ii.png",
      name: "启示之路",
      sort: 200000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 15 },
        damageRolls: { whbFmDmgPath001: { damage: "2d8+4", damageType: "piercing" } },
        description: {
          value:
            "<p>副手 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntPathRev01]{启示之路}。射程 <strong>40 尺</strong>。若装备 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntPridePt01]{骄傲之点}，对措手不及额外精密。</p>",
        },
        publication: pubH,
        range: 40,
        rules: [],
        slug: "flymander-path",
        traits: { value: ["concussive"] },
      },
    },
    {
      _id: "whbFmHeavyPunch1",
      img: "modules/wang-pf2e-homebrew/assets/hunt/lemat-mark-ii.png",
      name: "重拳（霰弹）",
      sort: 210000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 15 },
        damageRolls: { whbFmDmgPunch01: { damage: "2d8+5", damageType: "piercing" } },
        description: {
          value:
            "<p>封锁侦察塔的那一记。射程 <strong>20 尺</strong>。命中：@Check[fortitude|dc:20]{强韧 DC 20} 失败则击倒或退 5 尺。</p>",
        },
        publication: pubH,
        range: 20,
        rules: [],
        slug: "flymander-punch",
        traits: { value: ["concussive"] },
      },
    },
    {
      _id: "whbFmHvyFoot0001",
      img: "modules/wang-pf2e-homebrew/assets/hunt/alert-trip-mine.png",
      name: "沉重的脚步声",
      sort: 300000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 2 },
        category: "offensive",
        description: {
          value:
            "<p>布置 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntHvyFoot01]{沉重的脚步声}（警报拌雷皮）。隐匿 DC <strong>20</strong>——他故意让猎物听见死神临近。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "flymander-heavy",
        traits: { value: ["manipulate", "auditory"] },
      },
    },
    {
      _id: "whbFmPridePt0001",
      img: "systems/pf2e/icons/equipment/worn-items/other-worn-items/demon-mask.webp",
      name: "骄傲之点",
      sort: 350000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "offensive",
        description: {
          value:
            "<p>佩戴 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntPridePt01]{骄傲之点}。对措手不及目标的打击 +1d4 精密。腐败改写记忆：他以为自己是受害者。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "flymander-pride",
        traits: { value: [] },
      },
    },
    {
      _id: "whbFmRavenEye001",
      img: "systems/pf2e/icons/actions/Passive.webp",
      name: "独眼与乌鸦",
      sort: 400000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "defensive",
        description: {
          value:
            "<p>右眼浑浊，却凭乌鸦与战纹补全视野：对隐蔽生物的持平检定 +2。侧翼攻击对他不额外获益（乌鸦会叫）。对抗废喙鸟与鸟类恐惧效果 +2 状态。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "flymander-raven",
        traits: { value: [] },
      },
    },
    {
      _id: "whbFmScoutPair01",
      img: "systems/pf2e/icons/actions/Passive.webp",
      name: "表亲侦察线",
      sort: 500000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "offensive",
        description: {
          value:
            "<p>若 30 尺内有 @UUID[Compendium.wang-pf2e-homebrew.homebrew-actors.Actor.whbHuntRedRaven1]{红鸦}：共享猎物印记（同目标打击 +1 环境）；一方布雷时另一方免费 Step。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "flymander-pair",
        traits: { value: [] },
      },
    },
    {
      _id: "whbFmCorruptJoy1",
      img: "systems/pf2e/icons/actions/OneAction.webp",
      name: "腐化的快感",
      sort: 600000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "offensive",
        description: {
          value:
            "<p><strong>需求</strong> 本回合已有敌人触发你的警报拌雷，或你已对其造成流血</p>\n<p>Stride，然后一次猎犬或启示之路打击，该次攻击 +2 环境。他沉溺于让猎物「先听见死神」。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "flymander-joy",
        traits: { value: [] },
      },
    },
    {
      _id: "whbFmTactics0001",
      img: "systems/pf2e/icons/actions/Passive.webp",
      name: "飞翔者战术（GM）",
      sort: 900000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "offensive",
        description: {
          value:
            "<p><strong>定位</strong>：曾无声猎杀，如今故意弄响警报再开火。</p>\n<ol>\n<li>布<strong>沉重的脚步声</strong>逼走位</li>\n<li>警报响后 <strong>腐化的快感</strong> 进身射击</li>\n<li>近距重拳或骄傲之点左轮</li>\n<li>与红鸦夹击共享印记</li>\n</ol>",
        },
        publication: pubH,
        rules: [],
        slug: "flymander-tactics",
        traits: { value: [] },
      },
    },
  ],
  system: {
    abilities: {
      str: { mod: 3 },
      dex: { mod: 3 },
      con: { mod: 3 },
      int: { mod: 1 },
      wis: { mod: 3 },
      cha: { mod: 2 },
    },
    attributes: {
      ac: { details: "军装军士 + 弹带", value: 22 },
      allSaves: { value: "" },
      hp: { details: "比表妹稍抗打", max: 78, temp: 0, value: 78 },
      speed: { value: 30, otherSpeeds: [] },
      resistances: [],
      weaknesses: [],
      immunities: [],
    },
    details: {
      blurb: "飞翔者 · 腐化军士侦察",
      languages: { details: "", value: ["common"] },
      level: { value: 4 },
      privateNotes:
        "<p>飞翔者 Flymander / The Skinned。红鸦表兄。主猎犬+达姆；副启示之路+骄傲之点；陷阱：沉重的脚步声。记忆被腐化改写。</p>\n<p>Creature 4。宜与红鸦成对。</p>",
      publicNotes:
        "<p>军士肩章、铁灰盔檐、右眼已盲——乌鸦停在肩头。他曾是无声的侦察兵；沼泽教会他先拉响死神的门铃，再扣扳机。</p>\n<p><em>四人 2 级团 · Creature 4 · 侦察/警报 · 建议与红鸦同场</em></p>",
      publication: pubH,
    },
    initiative: { statistic: "perception" },
    perception: { details: "独眼；乌鸦协助", mod: 13, senses: [{ type: "low-light-vision" }] },
    resources: {},
    saves: {
      fortitude: { saveDetail: "", value: 13 },
      reflex: { saveDetail: "", value: 13 },
      will: { saveDetail: "记忆不稳", value: 11 },
    },
    skills: {
      athletics: { base: 13 },
      intimidation: { base: 12 },
      nature: { base: 12 },
      stealth: { base: 13 },
      survival: { base: 14 },
      warfare: { base: 12 },
    },
    traits: { rarity: "unique", size: { value: "med" }, value: ["human", "humanoid"] },
  },
  prototypeToken: {
    name: "飞翔者",
    width: 1,
    height: 1,
    texture: { src: "modules/wang-pf2e-homebrew/assets/hunt/flymander.png", scaleX: 1, scaleY: 1 },
    disposition: -1,
    displayBars: 40,
    bar1: { attribute: "attributes.hp" },
    sight: { enabled: true, range: 45, visionMode: "basic" },
    flags: { pf2e: { linkToActorSize: true, autoscale: true } },
    actorLink: false,
  },
  flags: {
    "wang-pf2e-homebrew": {
      source: "hunt-showdown",
      huntHunter: "flymander",
      theme: "scout-pair",
      pairWith: "whbHuntRedRaven1",
      preferredLoadout: ["the-hound", "path-of-revelation", "heavy-footfalls", "pride-point"],
    },
  },
});

for (const actor of [redRaven, flymander]) {
  assertId(actor._id, actor.name);
  for (const i of actor.items) assertId(i._id, `${actor.name}:${i.name}`);
  fs.writeFileSync(path.join(actorsDir, `${actor._id}.json`), JSON.stringify(actor, null, 2) + "\n");
  console.log("wrote", actor.name, actor.items.length);
}

const modPath = path.join(root, "module.json");
const mod = JSON.parse(fs.readFileSync(modPath, "utf8"));
mod.version = "1.15.0";
fs.writeFileSync(modPath, JSON.stringify(mod, null, 2) + "\n");
console.log("version", mod.version);
