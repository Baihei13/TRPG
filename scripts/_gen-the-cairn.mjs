/**
 * 猎杀对决 · 空石冢 / 约翰·维克多（John Victor）
 * 仅猎人 Actor（不做武器皮肤物品）
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assets = path.join(root, "assets", "hunt");
const actorsDir = path.join(root, "src", "packs", "homebrew-actors");

const pubH = {
  title: "猎杀对决 — 猎人",
  authors: "Wang Homebrew / Hunt: Showdown",
  license: "ORC",
  remaster: true,
};

function assertId(id, label) {
  if (!/^[a-zA-Z0-9]{16}$/.test(id)) throw new Error(`bad id ${label}: ${id} (${id.length})`);
}

function ensureAsset(name, fallbacks = []) {
  const p = path.join(assets, name);
  if (fs.existsSync(p) && fs.statSync(p).size > 500) {
    return `modules/wang-pf2e-homebrew/assets/hunt/${name}`;
  }
  for (const fb of fallbacks) {
    const fp = path.join(assets, fb);
    if (fs.existsSync(fp) && fs.statSync(fp).size > 500) {
      fs.copyFileSync(fp, p);
      return `modules/wang-pf2e-homebrew/assets/hunt/${name}`;
    }
  }
  return `modules/wang-pf2e-homebrew/assets/hunt/${fallbacks[0] || name}`;
}

const imgPortrait = ensureAsset("the-cairn.png", ["john-victor.png", "john-victor-wiki.png"]);
const imgBayonet = ensureAsset("mosin-bayonet.png", ["mosin-nagant.png", "mosin-avtomat.png"]);
const imgThunder = ensureAsset("rival-78.png", ["rival-78-shorty.png"]);

const actor = {
  _id: "whbHuntJohnVic01",
  folder: "whbfolderHntHt01",
  name: "空石冢 John Victor",
  type: "npc",
  img: imgPortrait,
  items: [
    {
      _id: "whbJvBayonetSt01",
      img: imgBayonet,
      name: "莫辛-纳甘刺刀",
      sort: 100000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 16 },
        damageRolls: {
          whbJvDmgBay001: { damage: "2d10+4", damageType: "piercing" },
        },
        description: {
          value:
            "<p>俄制长步枪，刺刀常年不卸。射程增量 <strong>100 尺</strong>。</p>\n<p>枪与刃上仍留着刺穿黑心时的仪式痕迹——他一心想要找到双胞胎。</p>\n<p><strong>诅咒刻痕</strong>：射击重击时 @Check[will|dc:22|traits:emotion,fear,mental,occult]{意志 DC 22}，失败则 @UUID[Compendium.pf2e.conditionitems.Item.TBSHQidQVSrGRTuq]{惊惧 1}（同目标本场首次）。</p>",
        },
        publication: pubH,
        range: 100,
        rules: [],
        slug: "jv-mosin-bayonet",
        traits: { value: ["concussive", "volley"] },
      },
    },
    {
      _id: "whbJvBayonetMl01",
      img: imgBayonet,
      name: "空石冢刺刀（近战）",
      sort: 110000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 15 },
        damageRolls: {
          whbJvDmgBayM01: { damage: "2d8+4", damageType: "piercing" },
        },
        description: {
          value:
            "<p>长刺刀捅刺（触及）。命中可触发诅咒刻痕（同射击重击）。</p>\n<p>仪式后他曾怕刃被玷污而卸下刺刀——这一版仍带着刻痕，像空石冢还没封口。</p>",
        },
        publication: pubH,
        range: null,
        rules: [],
        slug: "jv-bayonet-melee",
        traits: { value: ["reach", "deadly-d8"] },
      },
    },
    {
      _id: "whbJvThunderSt01",
      img: imgThunder,
      name: "Rival 78 霰弹枪",
      sort: 200000,
      type: "melee",
      system: {
        action: { value: "" },
        attackEffects: { custom: "", value: [] },
        bonus: { value: 15 },
        damageRolls: {
          whbJvDmgThn001: { damage: "2d10+4", damageType: "piercing" },
        },
        description: {
          value:
            "<p>近距双管霰弹。射程增量 <strong>30 尺</strong>。威力足以震落树叶——他常把这类枪交给新人，直到有人活到足以真正拥有它。</p>\n<p><strong>震落树叶</strong>：命中时目标与相邻生物 @Check[fortitude|dc:22|traits:auditory]{强韧 DC 22}，失败则耳聋 1 轮（同目标本场首次）。</p>\n<p><strong>双管齐射</strong>：一次操作打空双管，伤害 +1d10，攻击 −2。</p>",
        },
        publication: pubH,
        range: 30,
        rules: [],
        slug: "jv-rival-78",
        traits: { value: ["concussive", "scatter"] },
      },
    },
    {
      _id: "whbJvBlackHeart1",
      img: "systems/pf2e/icons/actions/OneAction.webp",
      name: "刺穿黑心",
      sort: 300000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "offensive",
        description: {
          value:
            "<p><strong>频率</strong> 每场遭遇 1 次</p>\n<p>以刺刀或步枪发动一次打击，攻击 +2 环境。命中：额外 @Damage[2d6[mental]]，并造成 @Damage[1d4[persistent,mental]]——仪式刻痕亮起，像又一次捅进那颗长出牙齿的心。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "jv-pierce-black-heart",
        traits: { value: ["mental", "occult"] },
      },
    },
    {
      _id: "whbJvMentorAct01",
      img: "systems/pf2e/icons/actions/OneAction.webp",
      name: "猎人入门",
      sort: 400000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "interaction",
        description: {
          value:
            "<p>对 30 尺内一名盟友低声交代：对方下一次攻击或豁免获得 +1 环境加值。每场遭遇每名盟友限 1 次。</p>\n<p>「既然是我带你入会的，你就是我的血脉传承的一部分了。」</p>",
        },
        publication: pubH,
        rules: [],
        slug: "jv-hunter-primer",
        traits: { value: ["auditory", "linguistic"] },
      },
    },
    {
      _id: "whbJvTwinsSeek01",
      img: "systems/pf2e/icons/actions/OneAction.webp",
      name: "寻找双胞胎",
      sort: 500000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 1 },
        category: "interaction",
        description: {
          value:
            "<p>指定 60 尺内一名他见过或听闻过的目标为「通向双胞胎的线索」。直到遭遇结束：他对目标的感知与求生检定 +2 状态；对该目标的首次射击攻击 +1 环境。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "jv-seek-twins",
        traits: { value: ["concentrate"] },
      },
    },
    {
      _id: "whbJvHeirloom001",
      img: imgThunder,
      name: "传家宝分发",
      sort: 550000,
      type: "action",
      system: {
        actionType: { value: "action" },
        actions: { value: 2 },
        category: "interaction",
        description: {
          value:
            "<p>把副手霰弹枪交到一名盟友手上（需空闲双手）。该盟友本场遭遇持用时攻击 +1 环境。约翰本场不再使用此枪。</p>\n<p>反复分发，直到有人活到足以拥有它。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "jv-heirloom-hand",
        traits: { value: ["manipulate"] },
      },
    },
    {
      _id: "whbJvOccultEye01",
      img: "systems/pf2e/icons/actions/Passive.webp",
      name: "空石冢的眼睛",
      sort: 600000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "defensive",
        description: {
          value:
            "<p>见过裂开的黑心之后：对抗恐惧与异能心灵效应的意志 +2 状态；但对「牙齿/裂口/心脏」类视觉惊惧检定 −1 环境（GM）。</p>\n<p>高领与宽檐帽遮住大半张脸——只留下一双不肯再闭上的眼睛。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "jv-cairn-eyes",
        traits: { value: [] },
      },
    },
    {
      _id: "whbJvTactics0001",
      img: "systems/pf2e/icons/actions/Passive.webp",
      name: "空石冢战术（GM）",
      sort: 900000,
      type: "action",
      system: {
        actionType: { value: "passive" },
        actions: { value: null },
        category: "offensive",
        description: {
          value:
            "<p><strong>定位</strong>：导师型中距步枪手——先护新人，再捅穿邪秽。</p>\n<ol>\n<li>开场 <strong>猎人入门</strong> 稳住新兵</li>\n<li>中远距莫辛点名；近身换 <strong>刺穿黑心</strong> 或刺刀</li>\n<li>贴脸用霰弹震聋、清杂兵</li>\n<li>必要时 <strong>传家宝分发</strong> 把枪交给活下来的人</li>\n</ol>\n<p>他不是来当英雄的——他是来让别人也活过第一夜。</p>",
        },
        publication: pubH,
        rules: [],
        slug: "jv-tactics",
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
      int: { mod: 2 },
      wis: { mod: 4 },
      cha: { mod: 3 },
    },
    attributes: {
      ac: { details: "高领披风 + 弹带 + 宽檐帽", value: 21 },
      allSaves: { value: "" },
      hp: {
        details: "空石冢：活过仪式与邪教的老人",
        max: 78,
        temp: 0,
        value: 78,
      },
      speed: { value: 25, otherSpeeds: [] },
      resistances: [],
      weaknesses: [],
      immunities: [],
    },
    details: {
      blurb: "空石冢 · 猎人导师",
      languages: { details: "", value: ["common"] },
      level: { value: 4 },
      privateNotes:
        "<p>约翰·维克多（John Victor / Voelkel）。传奇外观「空石冢」：宽檐帽、高领、乌鸦颅骨弹带。主：莫辛-纳甘刺刀；副：Rival 78（新人传家宝风格）。</p>\n<p>主题：带新人入会、寻找双胞胎、黑心诅咒仪式、逃离鲍威尔邪教。Creature 4 导师中距。武器皮肤未单独做物品。</p>",
      publicNotes:
        "<p>宽檐帽与高领只露出一双眼睛。弹带上拴着乌鸦颅骨——他见过心脏长出牙齿，也从邪教日记里读到尚未到来的枪。沼泽地的新人若还能活着，多半听过他的名字：约翰·维克多。</p>\n<p><em>四人 2 级团 · Creature 4 · 导师/仪式幸存者</em></p>",
      publication: pubH,
    },
    initiative: { statistic: "perception" },
    perception: {
      details: "帽檐阴影；对邪秽与新兵失误同样敏感",
      mod: 14,
      senses: [{ type: "low-light-vision" }],
    },
    resources: {},
    saves: {
      fortitude: { saveDetail: "", value: 13 },
      reflex: { saveDetail: "", value: 12 },
      will: {
        saveDetail: "+2 vs 恐惧/异能心灵；见「空石冢的眼睛」",
        value: 14,
      },
    },
    skills: {
      athletics: { base: 11 },
      intimidation: { base: 12 },
      medicine: { base: 12 },
      occultism: { base: 13 },
      religion: { base: 12 },
      stealth: { base: 11 },
      survival: { base: 14 },
    },
    traits: {
      rarity: "unique",
      size: { value: "med" },
      value: ["human", "humanoid"],
    },
  },
  prototypeToken: {
    name: "空石冢",
    width: 1,
    height: 1,
    texture: { src: imgPortrait, scaleX: 1, scaleY: 1 },
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
      huntHunter: "john-victor",
      theme: "the-cairn",
      preferredLoadout: ["mosin-bayonet", "rival-78"],
    },
  },
};

assertId(actor._id, actor.name);
for (const it of actor.items) assertId(it._id, `${actor.name}/${it.name}`);

fs.writeFileSync(path.join(actorsDir, `${actor._id}.json`), JSON.stringify(actor, null, 2) + "\n");
console.log("wrote actor", actor._id, actor.name, "portrait", imgPortrait);
