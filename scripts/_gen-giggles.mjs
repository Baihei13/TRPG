import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assets = path.join(root, "assets", "hunt");
const itemsDir = path.join(root, "src", "packs", "homebrew-items");
const actorsDir = path.join(root, "src", "packs", "homebrew-actors");

const batUrl = "https://huntshowdown.wiki.gg/images/Weapon_Baseball_Bat.png";
const batImg = path.join(assets, "baseball-bat.png");
if (!fs.existsSync(batImg) || fs.statSync(batImg).size < 800) {
  const res = await fetch(batUrl, { headers: { "User-Agent": "WangHomebrewBot/1.0" } });
  if (!res.ok) throw new Error(`bat dl ${res.status}`);
  fs.writeFileSync(batImg, Buffer.from(await res.arrayBuffer()));
  console.log("dl bat", fs.statSync(batImg).size);
}

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

const bat = {
  _id: "whbHuntSlugEye01",
  folder: "whbHntFldWpn0001",
  name: "击球手之眼 Batter's Eye",
  type: "weapon",
  img: "modules/wang-pf2e-homebrew/assets/hunt/baseball-bat.png",
  system: {
    description: {
      value:
        "<p>当腐败势力逼近她挚爱的马戏团家族时，据说<strong>命运夫人</strong>将她特殊的视力赋予了这根棒球棒。在一位技艺精湛的猎人手中，它能轻易击碎骨骼，那令人作呕的碎裂声证明了命中注定。</p>\n<blockquote><p><strong>兵器之书 · BASEBALL BAT · BATTER'S EYE</strong> 手工球棒本为击球而生，这一根却只为打碎头骨——被命运浸透过的木质，挥动时像能看见下一记落点。</p></blockquote>\n<p><strong>熟练</strong> 持用期间视为受训。</p>\n<hr />\n<p><strong>类别</strong> 军用钝器；<strong>负载</strong> 1；<strong>单手</strong></p>\n<p><strong>伤害</strong> 1d8 钝击；特质：横扫、后坐力（近战重挥感）</p>\n<hr />\n<p><strong>碎骨注定</strong> 此武器造成的重击额外造成 @Damage[1d8[bludgeoning]]，且目标须尝试 @Check[fortitude|dc:resolve(@actor.level*2+14)|basic]{强韧}（DC = 14+等级×2，物品持有者）。失败则获得 @UUID[Compendium.pf2e.conditionitems.Item.xYTAsEpcJE1Ccni3]{迟缓 1}，持续 1 轮。</p>\n<p><strong>命运视界</strong>（开关）开启时，你下一次以此武器的攻击检定获得 <strong>+1 环境加值</strong>（命运夫人的「看见落点」）；每场遭遇限用 1 次成功加值后自动关闭（手关开关）。</p>",
      gm: "<p>Hunt Baseball Bat skin「Batter's Eye / 击球手之眼」。谋杀马戏团主题。1d8 B、碎骨重击、命运视界开关。</p>",
    },
    rules: [
      { ...PROF },
      {
        key: "RollOption",
        domain: "attack",
        option: "hunt-batters-eye",
        toggleable: true,
        placement: "actions",
        label: "击球手之眼 — 命运视界（本场1次）",
      },
      {
        key: "FlatModifier",
        selector: "strike-attack-roll",
        type: "circumstance",
        value: 1,
        label: "命运视界",
        predicate: ["hunt-batters-eye", "item:id:{item|_id}"],
        hideIfDisabled: true,
      },
      {
        key: "Note",
        selector: "strike-damage",
        title: "碎骨注定",
        text: "重击：额外 1d8 钝击；目标强韧失败则迟缓 1（1 轮）。",
        predicate: ["item:id:{item|_id}", "check:outcome:critical-success"],
      },
    ],
    slug: "batters-eye",
    traits: {
      value: ["sweep", "shove"],
      rarity: "uncommon",
      otherTags: ["hunt-showdown", "hunt-weapon", "murder-circus"],
    },
    publication: pub,
    level: { value: 3 },
    quantity: 1,
    baseItem: "club",
    bulk: { value: 1 },
    hp: { value: 0, max: 0 },
    hardness: 0,
    price: { value: { gp: 1 } },
    equipped: { carryType: "worn", handsHeld: 0 },
    containerId: null,
    size: "med",
    material: { type: null, grade: null },
    identification: {
      status: "identified",
      unidentified: {
        name: "棒球棒",
        img: "systems/pf2e/icons/unidentified_item_icons/weapons.webp",
        data: { description: { value: "<p>缠着旧布的粗木棒。</p>" } },
      },
    },
    usage: { value: "held-in-one-hand" },
    category: "martial",
    group: "club",
    bonus: { value: 0 },
    bonusDamage: { value: 0 },
    damage: { dice: 1, die: "d8", damageType: "bludgeoning", persistent: null },
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
      enName: "Batter's Eye",
      wikiIcon: "Weapon_Baseball_Bat.png",
      theme: "murder-circus",
    },
  },
};

fs.writeFileSync(path.join(itemsDir, "whbHuntSlugEye01.json"), JSON.stringify(bat, null, 2) + "\n");
console.log("wrote bat");

const pubH = { ...pub, title: "猎杀对决 — 猎人" };

const giggles = {
  _id: "whbHuntGiggles01",
  folder: "whbfolderHntHt01",
  name: "吉格尔斯 Giggles",
  type: "npc",
  img: "modules/wang-pf2e-homebrew/assets/hunt/giggles.png",
  items: [
    {
      _id: "whbGgBornheim001",
      img: "modules/wang-pf2e-homebrew/assets/hunt/bornheim-no3.png",
      name: "Bornheim 半自动",
      sort: 100000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 16 },
        damageRolls: {
          whbGgDmgBor001: { damage: "2d4+5", damageType: "piercing" },
        },
        description: {
          value:
            "<p>主手 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntBornheim1]{Bornheim No.3}。射程增量 30 尺。外表像玩笑，子弹不讲笑话。</p>",
        },
        publication: pubH,
        range: 30,
        rules: [],
        slug: "giggles-bornheim",
        traits: { value: ["concussive", "agile"] },
      },
    },
    {
      _id: "whbGgRapidFire01",
      img: "systems/pf2e/icons/actions/OneAction.webp",
      name: "速射玩笑",
      sort: 110000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "offensive",
        description: {
          value:
            "<p>以一次操作发动两次 Bornheim 打击，各 −3 环境，共享同一 MAP（同武器「速射扳机」）。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "giggles-rapid",
        traits: { value: [] },
      },
    },
    {
      _id: "whbGgSlugBat0001",
      img: "modules/wang-pf2e-homebrew/assets/hunt/baseball-bat.png",
      name: "击球手之眼",
      sort: 200000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 16 },
        damageRolls: {
          whbGgDmgBat001: { damage: "2d8+5", damageType: "bludgeoning" },
        },
        description: {
          value:
            "<p>副手 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntSlugEye01]{击球手之眼}。碎骨重击：额外 @Damage[1d8[bludgeoning]]，强韧 DC 22 失败则 @UUID[Compendium.pf2e.conditionitems.Item.xYTAsEpcJE1Ccni3]{迟缓 1}（1 轮）。</p>\n<p>她笑着走到近前，下一记就是「命中注定」。</p>",
        },
        publication: pubH,
        range: null,
        rules: [],
        slug: "giggles-batters-eye",
        traits: { value: ["sweep", "shove"] },
      },
    },
    {
      _id: "whbGgKnife000001",
      img: "systems/pf2e/icons/default-icons/melee.svg",
      name: "袖藏飞刀",
      sort: 250000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 15 },
        damageRolls: {
          whbGgDmgKnf001: { damage: "1d4+4", damageType: "piercing" },
        },
        description: {
          value: "<p>领口别着的小刀，可近战或投掷（射程增量 10 尺）。命中时目标对本回合内她的下一次恐吓检定 −2 环境。</p>",
        },
        publication: pubH,
        range: 10,
        rules: [],
        slug: "giggles-knife",
        traits: { value: ["agile", "finesse", "thrown"] },
      },
    },
    {
      _id: "whbGgMisdirect01",
      img: "systems/pf2e/icons/actions/OneAction.webp",
      name: "马戏障眼",
      sort: 300000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "offensive",
        description: {
          value:
            "<p>对 30 尺内一个能看见她的生物尝试 @Check[deception|defense:perception]{欺骗} 对抗察觉 DC（马戏团式假动作/声东击西）。</p>\n<p>成功：目标对她措手不及，直至她下个回合结束；她对本回合下一次打击该目标获得 <strong>+2 环境加值</strong>。</p>\n<p>这是阴谋的起手——先让你看错方向。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "giggles-misdirect",
        traits: { value: ["mental", "visual"] },
      },
    },
    {
      _id: "whbGgCurtain0001",
      img: "systems/pf2e/icons/actions/OneAction.webp",
      name: "落幕恐吓",
      sort: 400000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "interaction",
        description: {
          value:
            "<p>以马戏团报幕的腔调恐吓 30 尺内目标：@Check[will|dc:22|traits:emotion,fear,mental,auditory]{意志 DC 22}。</p>\n<p>失败：@UUID[Compendium.pf2e.conditionitems.Item.TBSHQidQVSrGRTuq]{惊惧 1}（1 分钟）。大失败：惊惧 2，并对其「马戏障眼」的察觉 DC 视为降低 2（更易被骗）。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "giggles-curtain",
        traits: { value: ["emotion", "fear", "mental", "auditory"] },
      },
    },
    {
      _id: "whbGgFatedHit001",
      img: "systems/pf2e/icons/actions/TwoActions.webp",
      name: "命中注定",
      sort: 500000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 2 },
        category: "offensive",
        description: {
          value:
            "<p><strong>频率</strong> 每场遭遇 1 次</p>\n<p>Stride，然后发动一次<strong>击球手之眼</strong>打击，该次攻击检定获得命运视界（+1 环境）。若命中，视为重击判定时骰面结果提高一档（失败→成功，成功→重击；大失败不变），且碎骨效果 DC 视为 24。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "giggles-fated",
        traits: { value: [] },
      },
    },
    {
      _id: "whbGgPatient0001",
      img: "systems/pf2e/icons/actions/Passive.webp",
      name: "狡猾而耐心",
      sort: 600000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "defensive",
        description: {
          value:
            "<p>谋杀马戏团的幕后主使：外表疯癫，实则算计。对抗侦测谎言、读心与「看穿伪装」类效果时，欺骗检定与意志豁免获得 <strong>+2 状态加值</strong>。</p>\n<p>先攻检定可用欺骗替代察觉（报幕后的伏笔）。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "giggles-patient",
        traits: { value: [] },
      },
    },
    {
      _id: "whbGgTroupe00001",
      img: "systems/pf2e/icons/actions/OneAction.webp",
      name: "指挥班子",
      sort: 700000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "offensive",
        description: {
          value:
            "<p><strong>需求</strong> 30 尺内有至少一名盟友（或 GM 允许的马戏团僵尸/召唤物）</p>\n<p>一声尖笑下令：该盟友立刻获得一次反应，可 Step、Interact 或一次 MAP 打击。每轮限 1 次。</p>\n<p>独处时改为：在空格制造「幻影乐手」干扰（持续至她下回合结束）——该格及相邻视为困难地形，且对敌人 Hide 的察觉 DC +2。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "giggles-direct",
        traits: { value: ["auditory", "concentrate"] },
      },
    },
    {
      _id: "whbGgSticky00001",
      img: "modules/wang-pf2e-homebrew/assets/hunt/sticky-bomb.png",
      name: "马戏彩蛋（黏弹）",
      sort: 800000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "offensive",
        description: {
          value:
            "<p>投掷 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntSticky001]{黏性炸弹}（或等效）。命中后依物品结算；她称之为开场彩蛋。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "giggles-sticky",
        traits: { value: [] },
      },
    },
    {
      _id: "whbGgTactics0001",
      img: "systems/pf2e/icons/actions/Passive.webp",
      name: "马戏团阴谋（GM）",
      sort: 900000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "offensive",
        description: {
          value:
            "<p><strong>定位</strong>：阴谋家近战收割。Bornheim 风筝试探 → 障眼/落幕控场 → 贴脸棒球棒「命中注定」砸碎。</p>\n<ol>\n<li>远距用手枪与黏弹搅局，绝不先亮棒球棒</li>\n<li><strong>马戏障眼</strong>或<strong>落幕恐吓</strong>让目标措手不及/惊惧</li>\n<li>进身 <strong>命中注定</strong> 或普通球棒重击收尸</li>\n<li>有僵尸时 <strong>指挥班子</strong> 让别人挡刀</li>\n</ol>\n<p>比外表致命：玩家以为小丑杂耍，其实全程在排剧本。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "giggles-tactics",
        traits: { value: [] },
      },
    },
  ],
  effects: [],
  system: {
    abilities: {
      str: { mod: 3 },
      dex: { mod: 4 },
      con: { mod: 2 },
      int: { mod: 2 },
      wis: { mod: 2 },
      cha: { mod: 4 },
    },
    attributes: {
      ac: { details: "戏服下的护衬", value: 22 },
      allSaves: { value: "" },
      hp: {
        details: "笑着挨打，也笑着还手",
        max: 80,
        temp: 0,
        value: 80,
      },
      speed: { value: 30, otherSpeeds: [] },
      resistances: [],
      weaknesses: [],
      immunities: [],
    },
    details: {
      blurb: "谋杀马戏团主使 · 阴谋与碎骨",
      languages: { details: "", value: ["common"] },
      level: { value: 4 },
      privateNotes:
        "<p>「谋杀马戏团」幕后主使。指挥班子穿越亡灵之地。狡猾耐心，远比小丑外表致命。副手：击球手之眼；主手 Bornheim。</p>\n<p>Creature 4 偏强。主题：阴谋、马戏障眼、命运碎骨。</p>",
      publicNotes:
        "<p>白面红唇，双髻戏服——「谋杀马戏团」的笑声从她喉咙里漏出来。她带着班子穿过亡灵之地，每一步都像排演好的节目；等你听懂笑点，棒球棒已经到了。</p>\n<p><em>四人 2 级团 · Creature 4（偏强）· 马戏阴谋家</em></p>",
      publication: pubH,
    },
    initiative: { statistic: "deception" },
    perception: {
      details: "",
      mod: 12,
      senses: [{ type: "low-light-vision" }],
    },
    resources: {},
    saves: {
      fortitude: { saveDetail: "", value: 12 },
      reflex: { saveDetail: "", value: 14 },
      will: { saveDetail: "+2 vs 看穿伪装/读心", value: 13 },
    },
    skills: {
      acrobatics: { base: 13 },
      deception: { base: 16 },
      intimidation: { base: 14 },
      performance: { base: 15 },
      stealth: { base: 13 },
      thievery: { base: 12 },
    },
    traits: {
      rarity: "unique",
      size: { value: "med" },
      value: ["human", "humanoid"],
    },
  },
  prototypeToken: {
    name: "吉格尔斯",
    width: 1,
    height: 1,
    texture: {
      src: "modules/wang-pf2e-homebrew/assets/hunt/giggles.png",
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
      huntHunter: "giggles",
      theme: "murder-circus",
      preferredLoadout: ["bornheim-no-3", "batters-eye", "sticky-bomb"],
    },
  },
};

for (const i of giggles.items) {
  if (!/^[a-zA-Z0-9]{16}$/.test(i._id)) {
    throw new Error(`bad ${i._id} ${i._id.length} ${i.name}`);
  }
}

fs.writeFileSync(path.join(actorsDir, "whbHuntGiggles01.json"), JSON.stringify(giggles, null, 2) + "\n");
console.log("wrote giggles", giggles.items.length);

const modPath = path.join(root, "module.json");
const mod = JSON.parse(fs.readFileSync(modPath, "utf8"));
mod.version = "1.13.0";
fs.writeFileSync(modPath, JSON.stringify(mod, null, 2) + "\n");
console.log("version", mod.version);
