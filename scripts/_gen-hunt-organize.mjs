import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const itemsDir = path.join(root, "src", "packs", "homebrew-items");
const assets = path.join(root, "assets", "hunt");
const PARENT = "whbfolderHunt001";

const FOLDERS = [
  { _id: "whbHntFldWpn0001", name: "猎杀·武器", folder: PARENT },
  { _id: "whbHntFldAmmo001", name: "猎杀·弹药", folder: PARENT },
  { _id: "whbHntFldExpl001", name: "猎杀·爆炸物", folder: PARENT },
  { _id: "whbHntFldFire001", name: "猎杀·火焰", folder: PARENT },
  { _id: "whbHntFldTrap001", name: "猎杀·陷阱", folder: PARENT },
  { _id: "whbHntFldTact001", name: "猎杀·战术", folder: PARENT },
  { _id: "whbHntFldMed0001", name: "猎杀·医疗", folder: PARENT },
  { _id: "whbHntFldFeat001", name: "猎杀·专长", folder: PARENT },
  { _id: "whbHntFldFx00001", name: "猎杀·效果", folder: PARENT },
];

for (const f of FOLDERS) {
  if (f._id.length !== 16) throw new Error(`bad folder id ${f._id}`);
}

const foldersPath = path.join(itemsDir, "_folders.json");
const foldersDoc = {
  folders: [
    { _id: "whbfolderRemIt01", name: "遗迹2", type: "Item", sorting: "a", folder: null },
    { _id: PARENT, name: "猎杀对决", type: "Item", sorting: "a", folder: null },
    ...FOLDERS.map((f) => ({
      ...f,
      type: "Item",
      sorting: "a",
    })),
  ],
};
fs.writeFileSync(foldersPath, JSON.stringify(foldersDoc, null, 2) + "\n", "utf8");
console.log("wrote folders", FOLDERS.length);

function folderFor(item) {
  const cat = item.flags?.["wang-pf2e-homebrew"]?.huntCategory;
  const type = item.type;
  if (type === "feat") return "whbHntFldFeat001";
  if (type === "effect") return "whbHntFldFx00001";
  if (type === "weapon" || cat === "weapon" || cat === "tool") return "whbHntFldWpn0001";
  if (cat === "ammo") return "whbHntFldAmmo001";
  if (cat === "explosive") return "whbHntFldExpl001";
  if (cat === "fire") return "whbHntFldFire001";
  if (cat === "trap") return "whbHntFldTrap001";
  if (cat === "medical") return "whbHntFldMed0001";
  if (cat === "tactical" || cat === "throwable") return "whbHntFldTact001";
  // fallback by name
  if (/效果：/.test(item.name)) return "whbHntFldFx00001";
  if (/专长：/.test(item.name)) return "whbHntFldFeat001";
  return "whbHntFldTact001";
}

let moved = 0;
for (const file of fs.readdirSync(itemsDir)) {
  if (!file.startsWith("whbHunt") || !file.endsWith(".json")) continue;
  const p = path.join(itemsDir, file);
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  const next = folderFor(j);
  if (j.folder !== next) {
    j.folder = next;
    fs.writeFileSync(p, JSON.stringify(j, null, 2) + "\n", "utf8");
    moved++;
  }
}
console.log("reassigned", moved);

const downloads = [
  ["bomb-lance.png", "https://huntshowdown.wiki.gg/images/Weapon_Bomb_Lance.png"],
  ["maynard-silencer.png", "https://huntshowdown.wiki.gg/images/Weapon_Maynard_Sniper_Silencer.png"],
  ["frontier-73c.png", "https://huntshowdown.wiki.gg/images/Weapon_Frontier_73C.png"],
  ["ammo-subsonic.png", "https://huntshowdown.wiki.gg/images/Ammo_Long_Subsonic.png"],
  ["ammo-highvel.png", "https://huntshowdown.wiki.gg/images/Ammo_Long_High_Velocity.png"],
];

for (const [name, url] of downloads) {
  const out = path.join(assets, name);
  if (fs.existsSync(out) && fs.statSync(out).size > 800) {
    console.log("skip", name);
    continue;
  }
  const res = await fetch(url, { headers: { "User-Agent": "WangHomebrewBot/1.0" } });
  if (!res.ok) throw new Error(`dl ${name} ${res.status}`);
  fs.writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  console.log("dl", name, fs.statSync(out).size);
}

const PROF = {
  key: "MartialProficiency",
  label: "猎杀武装熟练",
  kind: "attack",
  definition: ["item:id:{item|_id}"],
  value: 1,
  requiresInvestment: false,
};

const pubW = {
  title: "猎杀对决 — 装备",
  authors: "Wang Homebrew / Hunt: Showdown",
  license: "ORC",
  remaster: true,
};
const pubA = { ...pubW, title: "猎杀对决 — 弹药" };

function write(id, data) {
  if (id.length !== 16) throw new Error(`${id} ${id.length}`);
  data._id = id;
  fs.writeFileSync(path.join(itemsDir, `${id}.json`), JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("wrote", id, data.name);
}

const OFF_GUARD = "Compendium.pf2e.conditionitems.Item.AJh5ex99aV6VTggg";

write("whbHuntAmmoSub01", {
  folder: "whbHntFldAmmo001",
  name: "亚音速弹 Subsonic Ammo",
  type: "consumable",
  img: "modules/wang-pf2e-homebrew/assets/hunt/ammo-subsonic.png",
  system: {
    description: {
      value:
        "<p>装药更少、弹头更重的亚音速弹药，枪声沉闷短促，便于伏击；代价是射程大幅缩短。</p>\n<hr />\n<p><strong>用法</strong> 弹药（特殊）；装入兼容火器后打击生效。</p>\n<ul>\n<li><strong>短射程</strong>：该次打击的射程增量视为<strong>减半</strong>（向下取整至 5 尺；已自动化近似为 −50%）。</li>\n<li><strong>无声伏击</strong>：若目标<strong>未察觉你</strong>（你对其隐蔽 / 躲藏 / 未被发现），打开动作栏开关「亚音速 · 目标未察觉」——目标对此次打击处于 @UUID[" +
        OFF_GUARD +
        "]{措手不及}；若你拥有<strong>偷袭</strong>，可正常计入。</li>\n</ul>\n<p>兼容：@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntMaynSil01]{梅纳德消音狙击} 等使用中型/长弹的猎杀步枪。</p>",
      gm: "<p>Hunt Subsonic。原「无法听声定位」改为措手不及/偷袭。射程减半用 AdjustStrike；伏击靠开关 + EphemeralEffect。</p>",
    },
    rules: [
      {
        key: "RollOption",
        domain: "attack",
        option: "hunt-subsonic-ambush",
        toggleable: true,
        placement: "actions",
        label: "亚音速 · 目标未察觉你",
      },
      {
        key: "EphemeralEffect",
        uuid: OFF_GUARD,
        selectors: ["strike-attack-roll", "strike-damage"],
        predicate: ["hunt-subsonic-ambush"],
      },
      {
        key: "AdjustStrike",
        mode: "multiply",
        property: "range-increment",
        value: 0.5,
      },
      {
        key: "Note",
        selector: "strike-attack-roll",
        title: "亚音速弹",
        text: "射程增量减半。目标未察觉你时可开开关：措手不及（可偷袭）。",
      },
    ],
    slug: "hunt-subsonic-ammo",
    traits: {
      value: ["consumable"],
      rarity: "uncommon",
      otherTags: ["hunt-showdown", "hunt-ammo", "hunt-special-ammo"],
    },
    publication: pubA,
    level: { value: 2 },
    quantity: 5,
    baseItem: "rounds",
    bulk: { value: 0.1 },
    price: { value: { gp: 1 }, per: 5 },
    equipped: { carryType: "worn", invested: null },
    containerId: null,
    size: "med",
    identification: {
      status: "identified",
      unidentified: {
        name: "弹药",
        img: "systems/pf2e/icons/unidentified_item_icons/other-consumables.webp",
        data: { description: { value: "<p>一盒沉甸甸的枪弹。</p>" } },
      },
      misidentified: {},
    },
    category: "ammo",
    uses: { value: 1, max: 1, autoDestroy: true },
    damage: null,
    usage: { value: "held-in-one-hand" },
    stackGroup: "rounds10",
  },
  flags: {
    "wang-pf2e-homebrew": {
      source: "hunt-showdown",
      huntCategory: "ammo",
      huntSpecialAmmo: "subsonic",
      wikiIcon: "Ammo_Long_Subsonic.png",
    },
  },
});

write("whbHuntAmmoHvel1", {
  folder: "whbHntFldAmmo001",
  name: "高速弹 High Velocity Ammo",
  type: "consumable",
  img: "modules/wang-pf2e-homebrew/assets/hunt/ammo-highvel.png",
  system: {
    description: {
      value:
        "<p>强装药与较轻弹尖，显著提高初速，适合远距离交战；后坐略增，备用弹略少。</p>\n<hr />\n<p><strong>用法</strong> 弹药（特殊）。</p>\n<ul>\n<li>射程增量 <strong>+20 尺</strong>（已自动化）。</li>\n<li>忽略目标对该伤害类型的前 <strong>2</strong> 点物理抗力（手裁；聊天有提示）。</li>\n</ul>",
      gm: "<p>Hunt High Velocity。+20 射程；抗 2 靠 Note。</p>",
    },
    rules: [
      {
        key: "AdjustStrike",
        mode: "add",
        property: "range-increment",
        value: 20,
      },
      {
        key: "Note",
        selector: "strike-damage",
        title: "高速弹",
        text: "忽略目标对应物理抗力的前 2 点。",
      },
    ],
    slug: "hunt-high-velocity-ammo",
    traits: {
      value: ["consumable"],
      rarity: "uncommon",
      otherTags: ["hunt-showdown", "hunt-ammo", "hunt-special-ammo"],
    },
    publication: pubA,
    level: { value: 2 },
    quantity: 5,
    baseItem: "rounds",
    bulk: { value: 0.1 },
    price: { value: { gp: 1 }, per: 5 },
    equipped: { carryType: "worn", invested: null },
    containerId: null,
    size: "med",
    identification: {
      status: "identified",
      unidentified: {
        name: "弹药",
        img: "systems/pf2e/icons/unidentified_item_icons/other-consumables.webp",
        data: { description: { value: "<p>一盒枪弹。</p>" } },
      },
      misidentified: {},
    },
    category: "ammo",
    uses: { value: 1, max: 1, autoDestroy: true },
    damage: null,
    usage: { value: "held-in-one-hand" },
    stackGroup: "rounds10",
  },
  flags: {
    "wang-pf2e-homebrew": {
      source: "hunt-showdown",
      huntCategory: "ammo",
      huntSpecialAmmo: "high-velocity",
      wikiIcon: "Ammo_Long_High_Velocity.png",
    },
  },
});

write("whbHuntMaynSil01", {
  folder: "whbHntFldWpn0001",
  name: "Maynard Sniper Silencer 梅纳德消音狙击",
  type: "weapon",
  img: "modules/wang-pf2e-homebrew/assets/hunt/maynard-silencer.png",
  system: {
    description: {
      value:
        "<p>梅纳德狙击步枪的消音型号，牺牲部分射程换取隐蔽性；两段式装填，配长瞄具。</p>\n<blockquote><p><strong>兵器之书 · MAYNARD SNIPER SILENCER</strong> 火帽击发的单发狙击步枪消音版，枪声被压得发闷，适合在沼地里先下手。</p></blockquote>\n<p><strong>熟练</strong> 持用此武器期间视为对其拥有<strong>受训</strong>熟练（无需火器熟练）。</p>\n<hr />\n<p><strong>类别</strong> 进阶火器；<strong>负载</strong> 2；<strong>双手</strong>；<strong>射程增量</strong> 100 尺；<strong>装填</strong> 2；弹容量 1</p>\n<p><strong>伤害</strong> 1d10 穿刺；特质：震荡、fatal-d10、kickback</p>\n<p><strong>弹药</strong> @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntAmmoStd01]{标准枪弹}；特殊：@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntAmmoDum01]{达姆弹}、@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntAmmoSub01]{亚音速弹}、@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntAmmoHvel1]{高速弹}。</p>\n<hr />\n<p><strong>无声伏击</strong> 此武器射击噪音极小。若目标<strong>未察觉你</strong>，打开开关「消音狙击 · 目标未察觉」：目标对此次打击处于 @UUID[" +
        OFF_GUARD +
        "]{措手不及}（可触发偷袭）；同时忽略其敏捷对 AC 的加值（措手不及已涵盖大多数情况）。</p>",
      gm: "<p>Hunt Maynard Sniper Silencer。35 gp。进阶，reload 2，fatal-d10，kickback。静音→措手不及开关。</p>",
    },
    rules: [
      { ...PROF },
      {
        key: "RollOption",
        domain: "attack",
        option: "hunt-maynard-ambush",
        toggleable: true,
        placement: "actions",
        label: "消音狙击 · 目标未察觉你",
      },
      {
        key: "EphemeralEffect",
        uuid: OFF_GUARD,
        selectors: ["strike-attack-roll", "strike-damage"],
        predicate: ["hunt-maynard-ambush", "item:id:{item|_id}"],
      },
      {
        key: "Note",
        selector: "strike-attack-roll",
        title: "无声伏击",
        text: "目标未察觉你时可开开关：措手不及（可偷袭）。",
        predicate: ["item:id:{item|_id}"],
      },
    ],
    slug: "maynard-sniper-silencer",
    traits: {
      value: ["concussive", "fatal-d10", "kickback"],
      rarity: "uncommon",
      otherTags: ["hunt-showdown", "hunt-weapon"],
    },
    publication: pubW,
    level: { value: 4 },
    quantity: 1,
    baseItem: null,
    bulk: { value: 2 },
    hp: { value: 0, max: 0 },
    hardness: 0,
    price: { value: { gp: 35 } },
    equipped: { carryType: "worn", handsHeld: 0 },
    containerId: null,
    size: "med",
    material: { type: null, grade: null },
    identification: {
      status: "identified",
      unidentified: {
        name: "消音步枪",
        img: "systems/pf2e/icons/unidentified_item_icons/weapons.webp",
        data: { description: { value: "<p>带粗大消音筒的单发步枪。</p>" } },
      },
    },
    usage: { value: "held-in-two-hands" },
    category: "advanced",
    group: "firearm",
    bonus: { value: 0 },
    bonusDamage: { value: 0 },
    damage: { dice: 1, die: "d10", damageType: "piercing", persistent: null },
    splashDamage: { value: 0 },
    range: 100,
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
      huntSlots: 4,
      wikiIcon: "Weapon_Maynard_Sniper_Silencer.png",
    },
  },
});

write("whbHuntBombLn001", {
  folder: "whbHntFldWpn0001",
  name: "Bomb Lance 炸弹鱼叉",
  type: "weapon",
  img: "modules/wang-pf2e-homebrew/assets/hunt/bomb-lance.png",
  system: {
    description: {
      value:
        "<p>近战长柄鱼叉，亦可发射爆炸鱼叉头；命中后嵌入血肉，拔除费事。</p>\n<blockquote><p><strong>兵器之书 · BOMB LANCE</strong> 近战可捅，远程可射——沼地里最野蛮的「两用」兵器之一。</p></blockquote>\n<p><strong>熟练</strong> 持用期间视为受训（无需进阶武器熟练）。</p>\n<hr />\n<p><strong>类别</strong> 进阶；<strong>负载</strong> 2；<strong>双手</strong></p>\n<p><strong>近战</strong> 伤害 1d10 穿刺；特质：reach、两手</p>\n<p><strong>远程发射</strong> 使用动作栏「炸弹鱼叉 · 发射」（射程增量 20 尺）。</p>\n<hr />\n<p><strong>鱼叉爆炸</strong> 远程<strong>命中</strong>后：目标及周围 @Template[type:burst|distance:5]{5 尺爆发}内的每个生物尝试 @Check[reflex|dc:resolve(@actor.attributes.classOrSpellDC.value)|traits:fire,weapon]{反射}（DC = 你的职业 DC，无职业 DC 则用 10+等级+关键健/敏捷较高者，GM 裁定）。失败额外受到 @Damage[2d6[fire]]{2d6 火焰}；成功则伤害减半（GM 可改为仅失败受伤）。</p>\n<p>鱼叉嵌入目标：目标获得效果提示，拔除需 <span class=\"action-glyph\">1</span> Interact。</p>",
      gm: "<p>Hunt Bomb Lance。30 gp。近战 spear+reach；Strike RE 远程。爆炸用 Check/Damage 嵌入说明。嵌入效果可拖 sticky 类手办。</p>",
    },
    rules: [
      { ...PROF },
      {
        key: "Strike",
        category: "advanced",
        group: "firearm",
        slug: "bomb-lance-launch",
        label: "炸弹鱼叉 · 发射",
        img: "modules/wang-pf2e-homebrew/assets/hunt/bomb-lance.png",
        damage: {
          base: {
            damageType: "piercing",
            dice: 1,
            die: "d8",
          },
        },
        traits: ["concussive", "range-increment-20"],
        range: 20,
      },
      {
        key: "Note",
        selector: "strike-damage",
        title: "鱼叉爆炸",
        text: "远程发射命中后：5 尺爆发内反射豁免（职业 DC），失败 2d6 火焰。鱼叉嵌入，拔除 1 动作。",
        predicate: ["item:slug:bomb-lance-launch"],
      },
    ],
    slug: "bomb-lance",
    traits: {
      value: ["reach"],
      rarity: "uncommon",
      otherTags: ["hunt-showdown", "hunt-weapon"],
    },
    publication: pubW,
    level: { value: 4 },
    quantity: 1,
    baseItem: null,
    bulk: { value: 2 },
    hp: { value: 0, max: 0 },
    hardness: 0,
    price: { value: { gp: 30 } },
    equipped: { carryType: "worn", handsHeld: 0 },
    containerId: null,
    size: "med",
    material: { type: null, grade: null },
    identification: {
      status: "identified",
      unidentified: {
        name: "铁矛",
        img: "systems/pf2e/icons/unidentified_item_icons/weapons.webp",
        data: { description: { value: "<p>粗重的长柄，矛头像可拆卸的铁匣。</p>" } },
      },
    },
    usage: { value: "held-in-two-hands" },
    category: "advanced",
    group: "spear",
    bonus: { value: 0 },
    bonusDamage: { value: 0 },
    damage: { dice: 1, die: "d10", damageType: "piercing", persistent: null },
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
      huntSlots: 3,
      wikiIcon: "Weapon_Bomb_Lance.png",
    },
  },
});

write("whbHuntFront73C1", {
  folder: "whbHntFldWpn0001",
  name: "Frontier 73C 荒原步枪",
  type: "weapon",
  img: "modules/wang-pf2e-homebrew/assets/hunt/frontier-73c.png",
  system: {
    description: {
      value:
        "<p>经典杠杆步枪（Frontier 73C / Winfield M1873C），平衡伤害与射速，是沼地开拓者的老伙计。</p>\n<blockquote><p><strong>兵器之书 · FRONTIER 73C</strong>（又名 Winfield M1873C）可靠的杠杆供弹步枪，没有 Swift 的装填管花活，胜在朴实耐用。</p></blockquote>\n<p><strong>熟练</strong> 持用期间视为受训（无需火器熟练）。</p>\n<hr />\n<p><strong>类别</strong> 军用火器；<strong>负载</strong> 2；<strong>双手</strong>；<strong>射程增量</strong> 80 尺；<strong>装填</strong> 1；弹匣容量 7</p>\n<p><strong>伤害</strong> 1d8 穿刺；特质：震荡、capacity-7</p>\n<p><strong>弹药</strong> @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntAmmoStd01]{标准枪弹}；特殊：@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntAmmoDum01]{达姆弹}、@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntAmmoPsn01]{毒弹}、@UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntAmmoFMJ01]{穿甲弹}。</p>\n<hr />\n<p><strong>杠杆虚招</strong> 当你对此武器进行装填（Interact）时，可尝试 @Check[deception|traits:weapon]{欺骗} 对抗目标的察觉 DC。若成功，同一回合内你用此武器对该目标的下一次打击伤害获得 <strong>+2 状态加值</strong>（打开开关「杠杆虚招已成功」以自动加伤）。</p>",
      gm: "<p>Hunt Frontier 73C / Winfield M1873C「荒原步枪」。10 gp。军用，capacity-7。杠杆虚招靠欺骗检定 + 开关 FlatModifier。</p>",
    },
    rules: [
      { ...PROF },
      {
        key: "RollOption",
        domain: "damage",
        option: "hunt-frontier-feint",
        toggleable: true,
        placement: "actions",
        label: "杠杆虚招已成功（本回合下一次）",
      },
      {
        key: "FlatModifier",
        selector: "damage",
        type: "status",
        value: 2,
        damageType: "piercing",
        label: "杠杆虚招",
        predicate: ["hunt-frontier-feint", "item:id:{item|_id}"],
        hideIfDisabled: true,
      },
      {
        key: "Note",
        selector: "strike-attack-roll",
        title: "杠杆虚招",
        text: "装填时可欺骗对抗察觉 DC；成功则开开关，本回合下次伤害 +2 状态。",
        predicate: ["item:id:{item|_id}"],
      },
    ],
    slug: "frontier-73c",
    traits: {
      value: ["concussive", "capacity-7"],
      rarity: "common",
      otherTags: ["hunt-showdown", "hunt-weapon"],
    },
    publication: pubW,
    level: { value: 2 },
    quantity: 1,
    baseItem: null,
    bulk: { value: 2 },
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
        name: "杠杆步枪",
        img: "systems/pf2e/icons/unidentified_item_icons/weapons.webp",
        data: { description: { value: "<p>保养尚可的旧式杠杆步枪。</p>" } },
      },
    },
    usage: { value: "held-in-two-hands" },
    category: "martial",
    group: "firearm",
    bonus: { value: 0 },
    bonusDamage: { value: 0 },
    damage: { dice: 1, die: "d8", damageType: "piercing", persistent: null },
    splashDamage: { value: 0 },
    range: 80,
    expend: 1,
    ammo: { baseType: "rounds", builtIn: false, capacity: 7 },
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
      wikiIcon: "Weapon_Frontier_73C.png",
      enName: "Frontier 73C",
      aka: "Winfield M1873C / 荒原步枪",
    },
  },
});

console.log("all done");
