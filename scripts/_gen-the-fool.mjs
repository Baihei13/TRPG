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

function readMod() {
  const raw = fs.readFileSync(path.join(root, "module.json"));
  const text =
    raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf
      ? raw.slice(3).toString("utf8")
      : raw.toString("utf8");
  return JSON.parse(text);
}

function firearmBase({
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
  range,
  capacity,
  traits,
  rulesExtra = [],
  unidentified = "杠杆步枪",
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
        otherTags: ["hunt-showdown", "hunt-weapon", "the-fool", "redmartin"],
      },
      publication: pub,
      level: { value: level },
      quantity: 1,
      baseItem: null,
      bulk: { value: 2 },
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
      usage: { value: "held-in-two-hands" },
      category: "martial",
      group: "firearm",
      bonus: { value: 0 },
      bonusDamage: { value: 0 },
      damage: { dice: 1, die: "d8", damageType: "piercing", persistent: null },
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
        huntSlots: 3,
        enName,
        wikiIcon,
        theme: "the-fool",
        baseWeapon,
      },
    },
  };
}

const plaque =
  "枪机铭牌：Since 1884 — Doc Redmartin’s Fine Remedies — Effective, Natural, & Absolutely Safe。";

const redmartin = firearmBase({
  _id: "whbHuntRedMart01",
  name: "红马丁 The Redmartin",
  img: "modules/wang-pf2e-homebrew/assets/hunt/ranger-73-swift.png",
  lore: `<p>臭名昭著的红马丁医生开玩笑说，他和酒保没什么两样，只不过他照顾的是身体，而埃迪·戴维斯照顾的是灵魂。当他付不起账单时，甜言蜜语毫无意义，最后埃迪开着一辆崭新的 Ranger 73 回家了。</p>
<blockquote><p><strong>兵器之书 · RANGER 73 · THE REDMARTIN</strong> 万能药换不了酒账；这把枪却成了债据。</p></blockquote>
<p><strong>熟练</strong> 持用期间视为受训。</p>
<hr />
<p><strong>类别</strong> 军用火器；负载 2；双手；射程增量 <strong>80 尺</strong>；装填 1；容量 7</p>
<p><strong>伤害</strong> 1d8 穿刺；特质：震荡、capacity-7</p>
<p>${plaque}</p>
<hr />
<p><strong>酒保笑话</strong> 恐吓或欺骗对抗「认识你/听过万能药」的目标时 +1 环境。命中已惊惧目标时额外 @Damage[1d4[mental]]（笑到抽搐）。</p>`,
  gm: "<p>Ranger 73 skin「红马丁」。1d8/80/cap7。对熟人恐吓/欺骗 +1；惊惧目标 +1d4 精神。</p>",
  slug: "the-redmartin",
  enName: "The Redmartin",
  wikiIcon: "Weapon_Ranger_73.png",
  baseWeapon: "ranger-73",
  level: 3,
  price: 14,
  range: 80,
  capacity: 7,
  traits: ["concussive", "capacity-7"],
  rulesExtra: [
    {
      key: "RollOption",
      domain: "damage",
      option: "hunt-redmartin-joke",
      toggleable: true,
      placement: "actions",
      label: "红马丁 — 目标已惊惧/听过笑话",
    },
    {
      key: "DamageDice",
      selector: "damage",
      label: "酒保笑话",
      diceNumber: 1,
      dieSize: "d4",
      damageType: "mental",
      predicate: ["hunt-redmartin-joke", "item:id:{item|_id}"],
    },
  ],
});

const aperture = firearmBase({
  _id: "whbHuntRmApert01",
  name: "红马丁：光圈 The Redmartin: Aperture",
  img: "modules/wang-pf2e-homebrew/assets/hunt/ranger-73-swift.png",
  lore: `<p>红马丁博士押注万能药的豪赌失败了。他只剩下自己命名的游侠 73 号来偿还欠戴维斯的债。当这位愚蠢的博士离开酒吧时，他本可以用上这把枪。戴维斯事先通风报信，让那些咧嘴笑着的受害者们等着他。复仇足以让他露出笑容。</p>
<blockquote><p><strong>兵器之书 · RANGER 73 APERTURE · THE REDMARTIN</strong> 光圈瞄准：看清谁在笑，谁在报仇。</p></blockquote>
<p><strong>熟练</strong> 持用期间视为受训。</p>
<hr />
<p><strong>类别</strong> 军用火器；负载 2；双手；射程增量 <strong>100 尺</strong>；装填 1；容量 7</p>
<p><strong>伤害</strong> 1d8 穿刺；特质：震荡、capacity-7</p>
<p>${plaque}</p>
<hr />
<p><strong>光圈</strong>（开关）开启瞄准时：此武器攻击 +1 环境，且忽略隐蔽持平；关闭则恢复普通腰射节奏。</p>
<p><strong>咧嘴仇人</strong> 对「曾被万能药伤害/咧嘴受害者」类目标（GM）伤害 +2。</p>`,
  gm: "<p>Ranger 73 Aperture skin。100ft、光圈 +1 攻与无视隐蔽；仇人 +2 伤。</p>",
  slug: "redmartin-aperture",
  enName: "The Redmartin: Aperture",
  wikiIcon: "Weapon_Ranger_73_Aperture.png",
  baseWeapon: "ranger-73-aperture",
  level: 3,
  price: 16,
  range: 100,
  capacity: 7,
  traits: ["concussive", "capacity-7"],
  unidentified: "带光圈的步枪",
  rulesExtra: [
    {
      key: "RollOption",
      domain: "attack",
      option: "hunt-rm-aperture",
      toggleable: true,
      placement: "actions",
      label: "红马丁光圈 — 瞄准（开）",
    },
    {
      key: "FlatModifier",
      selector: "strike-attack-roll",
      type: "circumstance",
      value: 1,
      label: "光圈",
      predicate: ["hunt-rm-aperture", "item:id:{item|_id}"],
      hideIfDisabled: true,
    },
    {
      key: "RollOption",
      domain: "damage",
      option: "hunt-rm-grinning-debt",
      toggleable: true,
      placement: "actions",
      label: "红马丁光圈 — 咧嘴仇人（GM）",
    },
    {
      key: "FlatModifier",
      selector: "damage",
      type: "status",
      value: 2,
      damageType: "piercing",
      label: "咧嘴仇人",
      predicate: ["hunt-rm-grinning-debt", "item:id:{item|_id}"],
      hideIfDisabled: true,
    },
    {
      key: "Note",
      selector: "strike-attack-roll",
      title: "光圈",
      text: "瞄准开启：忽略隐蔽持平。",
      predicate: ["hunt-rm-aperture", "item:id:{item|_id}"],
    },
  ],
});

const talon = firearmBase({
  _id: "whbHuntRmTalon01",
  name: "红马丁：利爪 The Redmartin: Talon",
  img: "modules/wang-pf2e-homebrew/assets/hunt/ranger-73-swift.png",
  lore: `<p>埃迪·戴维斯把游骑兵 73 型步枪挂在壁炉架上，不再想起他背叛的那个朋友——直到有一天他回家，发现那个傻瓜正等着他，脸上带着一丝诡异的笑容。他回来是为了拿回他的旧步枪，并查明是谁出卖了他。</p>
<blockquote><p><strong>兵器之书 · RANGER 73 TALON · THE REDMARTIN</strong> 枪托利爪：讨债、讨命、讨答案。</p></blockquote>
<p><strong>熟练</strong> 持用期间视为受训。</p>
<hr />
<p><strong>类别</strong> 军用火器；负载 2；双手；射程增量 <strong>80 尺</strong>；装填 1；容量 7</p>
<p><strong>伤害</strong> 1d8 穿刺；特质：震荡、capacity-7</p>
<p>${plaque}</p>
<hr />
<p><strong>利爪</strong> 动作栏另有近战打击（枪托刃）：1d8 挥砍，敏捷。命中可尝试 Interact 威吓（同目标本场首次 +1）。</p>
<p><strong>讨回旧枪</strong> 若目标本场曾对你造成伤害或「背叛」标记（GM），此武器伤害 +1d4。</p>`,
  gm: "<p>Ranger 73 Talon skin。射击 + 枪托刃近战。讨回旧枪 +1d4。</p>",
  slug: "redmartin-talon",
  enName: "The Redmartin: Talon",
  wikiIcon: "Weapon_Ranger_73_Talon.png",
  baseWeapon: "ranger-73-talon",
  level: 3,
  price: 15,
  range: 80,
  capacity: 7,
  traits: ["concussive", "capacity-7"],
  unidentified: "带刃枪托的步枪",
  rulesExtra: [
    {
      key: "Strike",
      category: "martial",
      group: "knife",
      slug: "redmartin-talon-blade",
      label: "红马丁利爪 · 枪托刃",
      img: "modules/wang-pf2e-homebrew/assets/hunt/ranger-73-swift.png",
      damage: { base: { damageType: "slashing", dice: 1, die: "d8" } },
      traits: ["agile", "finesse"],
      range: null,
    },
    {
      key: "RollOption",
      domain: "damage",
      option: "hunt-rm-reclaim",
      toggleable: true,
      placement: "actions",
      label: "红马丁利爪 — 讨回旧枪/被背叛",
    },
    {
      key: "DamageDice",
      selector: "damage",
      label: "讨回旧枪",
      diceNumber: 1,
      dieSize: "d4",
      damageType: "piercing",
      predicate: ["hunt-rm-reclaim", "item:id:{item|_id}"],
    },
  ],
});

const swift = firearmBase({
  _id: "whbHuntRmSwift01",
  name: "红马丁：迅捷 The Redmartin: Swift",
  img: "modules/wang-pf2e-homebrew/assets/hunt/ranger-73-swift.png",
  lore: `<p>愚者将这把「红燕」迅捷视为他一路走来的象征。从医生到逃犯，再到被通缉者。他以此庆祝自己终于摆脱了惩罚，摆脱了伪装成审判和正义的残酷暴力循环。</p>
<blockquote><p><strong>兵器之书 · RANGER 73 SWIFT · THE REDMARTIN</strong> 一推即填；没人能抓住他。</p></blockquote>
<p><strong>熟练</strong> 持用期间视为受训。</p>
<hr />
<p><strong>类别</strong> 军用火器；负载 2；双手；射程增量 <strong>80 尺</strong>；装填 1；容量 5</p>
<p><strong>伤害</strong> 1d8 穿刺；特质：震荡、横扫、capacity-5</p>
<p>规则基底同 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntRgrSwft01]{Winfield M1873 Swift}：打击不引发借机；装填后免费快步 5 尺（每轮 1 次）。</p>
<p>${plaque}</p>
<hr />
<p><strong>没人能抓住他</strong> 本回合若你已因装填获得免费快步，则下次此武器打击对反应类攻击视为隐蔽（对方需持平，或 GM 直接 −2）。</p>`,
  gm: "<p>Ranger 73 Swift skin「红燕/迅捷」。Swift 循环 + 逃脱隐蔽。</p>",
  slug: "redmartin-swift",
  enName: "The Redmartin: Swift",
  wikiIcon: "Weapon_Ranger_73_Swift.png",
  baseWeapon: "ranger-73-swift",
  level: 3,
  price: 16,
  range: 80,
  capacity: 5,
  traits: ["concussive", "sweep", "capacity-5"],
  unidentified: "速射杠杆步枪",
  rulesExtra: [
    {
      key: "Note",
      selector: "strike-attack-roll",
      title: "快速循环",
      text: "打击不引发借机。装填后本轮可免费快步 5 尺一次。",
      predicate: ["item:id:{item|_id}"],
    },
    {
      key: "RollOption",
      domain: "defense",
      option: "hunt-rm-uncatchable",
      toggleable: true,
      placement: "actions",
      label: "红马丁迅捷 — 本回合已免费快步（没人能抓住他）",
    },
    {
      key: "Note",
      selector: "strike-attack-roll",
      title: "没人能抓住他",
      text: "已免费快步后：对反应攻击视为隐蔽。",
      predicate: ["hunt-rm-uncatchable", "item:id:{item|_id}"],
    },
  ],
});

for (const it of [redmartin, aperture, talon, swift]) {
  assertId(it._id, it.name);
  fs.writeFileSync(path.join(itemsDir, `${it._id}.json`), JSON.stringify(it, null, 2) + "\n");
}

const fool = {
  _id: "whbHuntTheFool01",
  folder: "whbfolderHntHt01",
  name: "雷德马丁医生 / 愚者 Doc Redmartin",
  type: "npc",
  img: "modules/wang-pf2e-homebrew/assets/hunt/the-fool-outlaw.png",
  items: [
    {
      _id: "whbRmFormSwitch1",
      img: "systems/pf2e/icons/actions/FreeAction.webp",
      name: "双相：亡命徒⇄逃犯",
      sort: 50000,
      type: "action",
      system: {
        actionType: { value: "free" },
        actions: { value: null },
        category: "interaction",
        description: {
          value:
            "<p>愚者有两副面孔：<strong>亡命徒 Outlaw</strong>（黄西装，永无止境的笑话）与 <strong>逃犯 Fugitive</strong>（黑衣铁丝，讨债的笑容）。</p>\n<p>免费动作切换形象（改 token/肖像：亡命徒 / 逃犯）。不改变数值；逃犯侧重利爪与复仇开关，亡命徒侧重迅捷逃脱与万能药。</p>",
        },
        publication: pubH,
        rules: [
          {
            key: "RollOption",
            domain: "all",
            option: "fool-form-fugitive",
            toggleable: true,
            placement: "actions",
            label: "愚者 — 当前＝逃犯 Fugitive（关＝亡命徒）",
          },
        ],
        slug: "fool-form-switch",
        traits: { value: [] },
      },
    },
    {
      _id: "whbRmSwiftStrik1",
      img: "modules/wang-pf2e-homebrew/assets/hunt/ranger-73-swift.png",
      name: "红马丁：迅捷",
      sort: 100000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 17 },
        damageRolls: { whbRmDmgSwift01: { damage: "2d8+4", damageType: "piercing" } },
        description: {
          value:
            "<p>主火 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntRmSwift01]{红马丁：迅捷}（Ranger 73 Swift / 红燕）。射程 <strong>80 尺</strong>。装填后免费快步；逃脱中对反应视为隐蔽。</p>",
        },
        publication: pubH,
        range: 80,
        rules: [],
        slug: "fool-swift",
        traits: { value: ["concussive", "sweep"] },
      },
    },
    {
      _id: "whbRmApertStrik1",
      img: "modules/wang-pf2e-homebrew/assets/hunt/ranger-73-swift.png",
      name: "红马丁：光圈",
      sort: 110000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 16 },
        damageRolls: { whbRmDmgApert01: { damage: "2d8+4", damageType: "piercing" } },
        description: {
          value:
            "<p>@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntRmApert01]{红马丁：光圈}。射程 <strong>100 尺</strong>。光圈瞄准 +1、忽略隐蔽；对咧嘴仇人 +2 伤。</p>",
        },
        publication: pubH,
        range: 100,
        rules: [],
        slug: "fool-aperture",
        traits: { value: ["concussive"] },
      },
    },
    {
      _id: "whbRmTalonStrik1",
      img: "modules/wang-pf2e-homebrew/assets/hunt/ranger-73-swift.png",
      name: "红马丁：利爪",
      sort: 200000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 16 },
        damageRolls: { whbRmDmgTalon01: { damage: "2d8+4", damageType: "piercing" } },
        description: {
          value:
            "<p>@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntRmTalon01]{红马丁：利爪}。射程 80 尺。讨回旧枪时 +1d4。枪托刃见下。</p>",
        },
        publication: pubH,
        range: 80,
        rules: [],
        slug: "fool-talon-shot",
        traits: { value: ["concussive"] },
      },
    },
    {
      _id: "whbRmTalonMelee1",
      img: "modules/wang-pf2e-homebrew/assets/hunt/ranger-73-swift.png",
      name: "利爪枪托刃",
      sort: 210000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 15 },
        damageRolls: { whbRmDmgBlade01: { damage: "2d8+3", damageType: "slashing" } },
        description: {
          value: "<p>枪托利爪近战。命中可 Interact 恐吓（同目标本场首次 +1）。</p>",
        },
        publication: pubH,
        range: null,
        rules: [],
        slug: "fool-talon-blade",
        traits: { value: ["agile", "finesse"] },
      },
    },
    {
      _id: "whbRmBaseStrik01",
      img: "modules/wang-pf2e-homebrew/assets/hunt/ranger-73-swift.png",
      name: "红马丁",
      sort: 220000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 16 },
        damageRolls: { whbRmDmgBase001: { damage: "2d8+3", damageType: "piercing" } },
        description: {
          value:
            "<p>备用 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntRedMart01]{红马丁}。酒保笑话：惊惧目标 +1d4 精神。</p>",
        },
        publication: pubH,
        range: 80,
        rules: [],
        slug: "fool-redmartin",
        traits: { value: ["concussive"] },
      },
    },
    {
      _id: "whbRmPanacea0001",
      img: "systems/pf2e/icons/actions/TwoActions.webp",
      name: "神奇万能药",
      sort: 300000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 2 },
        category: "offensive",
        description: {
          value:
            "<p><strong>频率</strong> 每场遭遇 1 次</p>\n<p>泼洒或强灌「Miracle Mouth All-Cure」。15 尺锥形或邻接单目标：@Check[will|dc:21|traits:mental,poison]{意志 DC 21}。失败：困惑 1 轮且嘴角抽搐（对恐吓 −2）；大失败：困惑持续至你下回合结束，并获得惊惧 1。本意止疫——灵异者证明它只传播疯狂。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "fool-panacea",
        traits: { value: ["mental", "poison"] },
      },
    },
    {
      _id: "whbRmFoolGrin001",
      img: "systems/pf2e/icons/actions/OneAction.webp",
      name: "惩罚性笑容",
      sort: 310000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "offensive",
        description: {
          value:
            "<p>展示被挖宽的嘴。30 尺内一个能看见你的生物 @Check[will|dc:20|traits:emotion,fear,mental,visual]{意志 DC 20}。失败惊惧 1；大失败惊惧 2 且本回合无法对你使用援助。苍白法官的愚者牌留下的面具——笑话永无止境。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "fool-grin",
        traits: { value: ["emotion", "fear", "mental", "visual"] },
      },
    },
    {
      _id: "whbRmUncaught001",
      img: "systems/pf2e/icons/actions/Reaction.webp",
      name: "没人能抓住他",
      sort: 400000,
      type: "action",
      system: {
        actionType: { value: "reaction" },
        actions: { value: null },
        category: "defensive",
        description: {
          value:
            "<p><strong>触发</strong> 你被擒抱、束缚，或成为打击目标且攻击者邻接</p>\n<p>咧嘴一笑并扭脱：尝试逃脱检定（运动或杂技）+2 环境；若成功，可立刻快步 10 尺且不引发该触发者的借机。每场遭遇 1 次。乘客们笑着跳出火车——他仍在车厢里讲笑话。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "fool-uncatchable",
        traits: { value: [] },
      },
    },
    {
      _id: "whbRmTrainJoke01",
      img: "systems/pf2e/icons/actions/Passive.webp",
      name: "永无止境的笑话",
      sort: 500000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "defensive",
        description: {
          value:
            "<p>通往疯狂之路是用笑容铺成的。对抗恐惧免疫不适用——你免疫「因自己外貌/笑容」产生的惊惧。对魅惑 +2。半血以下恐吓检定 +2（面具勒得更紧）。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "fool-endless-joke",
        traits: { value: [] },
      },
    },
    {
      _id: "whbRmTactics0001",
      img: "systems/pf2e/icons/actions/Passive.webp",
      name: "愚者战术（GM）",
      sort: 900000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "offensive",
        description: {
          value:
            "<p><strong>定位</strong>：疯狂医生 / 塔罗愚者。移动风筝 + 精神干扰。可与多萝西（lore 关联）、吉格尔斯同场。</p>\n<ol>\n<li>笑容破胆 → 迅捷风筝</li>\n<li>光圈点杀咧嘴仇人 / 利爪讨债</li>\n<li>万能药打乱阵型</li>\n<li>反应逃脱：没人能抓住他</li>\n</ol>",
        },
        publication: pubH,
        rules: [],
        slug: "fool-tactics",
        traits: { value: [] },
      },
    },
  ],
  effects: [],
  system: {
    abilities: {
      str: { mod: 1 },
      dex: { mod: 4 },
      con: { mod: 2 },
      int: { mod: 2 },
      wis: { mod: 1 },
      cha: { mod: 4 },
    },
    attributes: {
      ac: { details: "旧西装 + 逃命本能", value: 21 },
      allSaves: { value: "" },
      hp: { details: "笑容撑开的裂口", max: 78, temp: 0, value: 78 },
      speed: { value: 30, otherSpeeds: [] },
      resistances: [{ type: "mental", value: 3, exceptions: [] }],
      weaknesses: [],
      immunities: [],
    },
    details: {
      blurb: "愚者 · 万能药与永无止境的笑话",
      languages: { details: "笑话与处方", value: ["common"] },
      level: { value: 4 },
      privateNotes:
        "<p>雷德马丁 / 愚者 Doc Redmartin (The Fool)。亡命徒⇄逃犯双相肖像。主：红马丁迅捷；辅：光圈、利爪、红马丁。万能药传播疯狂。Creature 4 移动/精神。与多萝西有 lore 关联。</p>",
      publicNotes:
        "<p>苍白法官抽到愚者牌，给他戴上惩罚面具后放走。火车上乘客笑着跳出窗外——笑话没有结尾。神奇万能药本要止疫，却把无辜者的嘴扭成永恒的笑；作为报复，他们挖宽了他的嘴。</p>\n<p><em>四人 2 级团 · Creature 4 · 愚者/逃脱/精神</em></p>",
      publication: pubH,
    },
    initiative: { statistic: "perception" },
    perception: { details: "专找谁在笑、谁在躲债", mod: 14, senses: [{ type: "low-light-vision" }] },
    resources: {},
    saves: {
      fortitude: { saveDetail: "", value: 12 },
      reflex: { saveDetail: "逃得比笑话快", value: 15 },
      will: { saveDetail: "+2 vs 魅惑；自嘲免疫惊惧", value: 13 },
    },
    skills: {
      acrobatics: { base: 15 },
      crafting: { base: 12 },
      deception: { base: 15 },
      intimidation: { base: 15 },
      medicine: { base: 13 },
      stealth: { base: 14 },
      thievery: { base: 13 },
    },
    traits: { rarity: "unique", size: { value: "med" }, value: ["human", "humanoid"] },
  },
  prototypeToken: {
    name: "愚者",
    width: 1,
    height: 1,
    texture: {
      src: "modules/wang-pf2e-homebrew/assets/hunt/the-fool-outlaw.png",
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
      huntHunter: "the-fool",
      theme: "the-fool",
      portraits: {
        outlaw: "modules/wang-pf2e-homebrew/assets/hunt/the-fool-outlaw.png",
        fugitive: "modules/wang-pf2e-homebrew/assets/hunt/the-fool-fugitive.png",
      },
      preferredLoadout: ["redmartin-swift", "redmartin-aperture", "redmartin-talon", "the-redmartin"],
      loreLinks: ["dorothy-alice"],
    },
  },
};

assertId(fool._id, "fool");
for (const i of fool.items) assertId(i._id, i.name);

fs.writeFileSync(path.join(actorsDir, "whbHuntTheFool01.json"), JSON.stringify(fool, null, 2) + "\n");
console.log("wrote fool", fool.items.length);

const mod = readMod();
mod.version = "1.23.0";
fs.writeFileSync(path.join(root, "module.json"), JSON.stringify(mod, null, 2) + "\n");
console.log("version", mod.version);
