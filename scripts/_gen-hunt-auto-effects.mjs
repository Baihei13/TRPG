import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const itemsDir = path.join(root, "src", "packs", "homebrew-items");

const pub = {
  title: "猎杀对决 — 状态",
  authors: "Wang Homebrew / Hunt: Showdown",
  license: "ORC",
  remaster: true,
};

function assertId(id) {
  if (!/^[a-zA-Z0-9]{16}$/.test(id)) throw new Error(`bad id ${id} (${id.length})`);
}

function effect({
  _id,
  name,
  img,
  lore,
  gm,
  slug,
  rules = [],
  badge = null,
  duration = { value: 1, unit: "minutes", expiry: "turn-start", sustained: false },
  traits = [],
}) {
  const sys = {
    description: { value: lore, gm },
    rules,
    slug,
    traits: { value: traits, rarity: "uncommon", otherTags: ["hunt-showdown", "hunt-auto"] },
    publication: pub,
    level: { value: 1 },
    duration,
    start: { value: 0, initiative: null },
    tokenIcon: { show: true },
    badge: badge,
    context: null,
    unidentified: false,
  };
  return {
    _id,
    folder: "whbHntFldFx00001",
    name,
    type: "effect",
    img,
    system: sys,
    flags: { "wang-pf2e-homebrew": { source: "hunt-showdown", huntAuto: true } },
  };
}

const effects = [
  effect({
    _id: "whbHuntDorNtmFx1",
    name: "效果：多萝西·噩梦形态",
    img: "modules/wang-pf2e-homebrew/assets/hunt/dorothy-nightmare.png",
    lore: "<p>多萝西当前为<strong>噩梦形态</strong>。美梦能力不可用；改用弄臣霰弹、终梦弹、人偶与追捕驱魔人。</p>\n<p>切换：使用「形态切换」动作，或开关「dorothy-form-nightmare」。Token 立绘由 GM 自行更换。</p>",
    gm: "<p>自动化：与 RollOption dorothy-form-nightmare 同步。</p>",
    slug: "effect-dorothy-nightmare",
    rules: [
      {
        key: "RollOption",
        domain: "all",
        option: "dorothy-form-nightmare",
        value: true,
      },
      { key: "Note", selector: "all", title: "噩梦", text: "当前为噩梦形态。" },
    ],
    duration: { value: -1, unit: "unlimited", expiry: null, sustained: false },
    traits: ["mental"],
  }),
  effect({
    _id: "whbHuntFoolFugFx",
    name: "效果：愚者·逃犯形态",
    img: "modules/wang-pf2e-homebrew/assets/hunt/the-fool-fugitive.png",
    lore: "<p>愚者当前为<strong>逃犯 Fugitive</strong>（黑衣铁丝）。侧重利爪与复仇；亡命徒侧重迅捷逃脱与万能药。</p>\n<p>切换：使用「双相」动作，或开关「fool-form-fugitive」。Token 由 GM 自行更换。</p>",
    gm: "<p>自动化：与 RollOption fool-form-fugitive 同步。</p>",
    slug: "effect-fool-fugitive",
    rules: [
      {
        key: "RollOption",
        domain: "all",
        option: "fool-form-fugitive",
        value: true,
      },
    ],
    duration: { value: -1, unit: "unlimited", expiry: null, sustained: false },
  }),
  effect({
    _id: "whbHuntNooseSlw1",
    name: "效果：绞索束缚（减速）",
    img: "modules/wang-pf2e-homebrew/assets/hunt/vetterli-71.png",
    lore: "<p>被绞索命中：速度 <strong>−10 尺</strong>（1 轮，不叠加）。</p>",
    gm: "<p>the-noose 命中自动施加。</p>",
    slug: "effect-noose-slow",
    rules: [{ key: "FlatModifier", selector: "speed", type: "untyped", value: -10, label: "绞索" }],
    duration: { value: 1, unit: "rounds", expiry: "turn-end", sustained: false },
  }),
  effect({
    _id: "whbHuntThreatMk1",
    name: "效果：威胁标记",
    img: "systems/pf2e/icons/conditions/hunted.webp",
    lore: "<p>你被点名为<strong>威胁</strong>。哈丁/政治家对你恐吓 +2；和平缔造者/辩论结束等视为消除威胁目标。</p>",
    gm: "<p>hardin-mark-threat / statesman-patron。</p>",
    slug: "effect-hunt-threat-mark",
    rules: [
      { key: "RollOption", domain: "all", option: "hunt-marked-threat", value: true },
    ],
    duration: { value: 1, unit: "encounters", expiry: "turn-end", sustained: false },
    traits: ["mental"],
  }),
  effect({
    _id: "whbHuntDebateMk1",
    name: "效果：点名发言",
    img: "systems/pf2e/icons/conditions/observed.webp",
    lore: "<p>政治家已点名你发言。对他的「辩论结束」视为已发言；盟友对你下次攻击 +1。</p>",
    gm: "<p>statesman-patron。</p>",
    slug: "effect-debate-named",
    rules: [{ key: "RollOption", domain: "all", option: "hunt-debate-named", value: true }],
    duration: { value: 1, unit: "rounds", expiry: "turn-end", sustained: false },
  }),
  effect({
    _id: "whbHuntPreyMark1",
    name: "效果：猎物印记",
    img: "modules/wang-pf2e-homebrew/assets/hunt/emilia-montgomery.png",
    lore: "<p>艾米莉亚的<strong>猎物印记</strong>。她对你的荒原步枪命中额外精密。</p>",
    gm: "<p>emilia-mark-prey。</p>",
    slug: "effect-emilia-prey",
    rules: [{ key: "RollOption", domain: "all", option: "hunt-emilia-prey", value: true }],
    duration: { value: 1, unit: "encounters", expiry: "turn-end", sustained: false },
  }),
  effect({
    _id: "whbHuntLivingTg1",
    name: "效果：活靶子",
    img: "modules/wang-pf2e-homebrew/assets/hunt/jonathan-redhill.png",
    lore: "<p>乔纳森成为<strong>活靶</strong>：敌人优先攻击他时获得环境加值（GM）；他可对攻击者报复。</p>",
    gm: "<p>redhill-target。</p>",
    slug: "effect-living-target",
    rules: [
      { key: "FlatModifier", selector: "ac", type: "circumstance", value: -1, label: "活靶子" },
    ],
    duration: { value: 1, unit: "minutes", expiry: "turn-start", sustained: false },
  }),
  effect({
    _id: "whbHuntPipeFx001",
    name: "效果：烟斗硬扛",
    img: "systems/pf2e/icons/spells/endure-elements.webp",
    lore: "<p>弗农抽了一口烟斗：火焰抗性 5；下次豁免 +1 状态。</p>",
    gm: "<p>vernon-pipe。</p>",
    slug: "effect-vernon-pipe",
    rules: [
      { key: "Resistance", type: "fire", value: 5 },
      { key: "FlatModifier", selector: "saving-throw", type: "status", value: 1, label: "烟斗硬扛" },
    ],
    duration: { value: 1, unit: "minutes", expiry: "turn-start", sustained: false },
  }),
  effect({
    _id: "whbHuntWeakAnti1",
    name: "效果：最终宪法（弱效抗毒）",
    img: "modules/wang-pf2e-homebrew/assets/hunt/antidote-shot.png",
    lore: "<p>弱效解毒保险：毒素抗性 5（1 分钟）。猎杀中毒应已被清除。</p>",
    gm: "<p>final-constitution / statesman-constitution。</p>",
    slug: "effect-final-constitution",
    rules: [{ key: "Resistance", type: "poison", value: 5 }],
    duration: { value: 1, unit: "minutes", expiry: "turn-start", sustained: false },
  }),
  effect({
    _id: "whbHuntConfuse01",
    name: "效果：万能药抽搐",
    img: "modules/wang-pf2e-homebrew/assets/hunt/the-fool-outlaw.png",
    lore: "<p>神奇万能药：嘴角抽搐，对恐吓检定 −2；并应另有困惑状态。</p>",
    gm: "<p>fool-panacea 附加。</p>",
    slug: "effect-panacea-twitch",
    rules: [
      { key: "FlatModifier", selector: "intimidation", type: "status", value: -2, label: "嘴角抽搐" },
    ],
    duration: { value: 1, unit: "rounds", expiry: "turn-end", sustained: false },
    traits: ["mental", "poison"],
  }),
];

for (const e of effects) {
  assertId(e._id);
  if (!e.system.badge) e.system.badge = null;
  fs.writeFileSync(path.join(itemsDir, `${e._id}.json`), JSON.stringify(e, null, 2) + "\n");
}
console.log("effects", effects.length);

const modPath = path.join(root, "module.json");
const raw = fs.readFileSync(modPath);
const text =
  raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf
    ? raw.slice(3).toString("utf8")
    : raw.toString("utf8");
const mod = JSON.parse(text);
mod.version = "1.25.0";
fs.writeFileSync(modPath, JSON.stringify(mod, null, 2) + "\n");
console.log("version", mod.version);
