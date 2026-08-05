/**
 * @module wang-pf2e-homebrew
 * 皇帝的戒指：Rule Elements 在戒指上（活化开关）；脚本处理隐蔽与浴血雄狮。
 */

import {
  createGroundskeeperEphemeraBook,
  buildGroundskeeperJournalDoc
} from "./groundskeeper-diary.mjs";
import {
  createMorrowEphemeraBook,
  buildMorrowJournalDoc
} from "./morrow-journal.mjs";

const MODULE_ID = "wang-pf2e-homebrew";

const RING_SLUG = "emperors-ring";
const RING_NAME = "皇帝的戒指";
const RING_ID = "whbEmperorRing01";
const ABILITY_SLUG = "bloodied-lion";
const UPRIGHT_OPTION = "emperors-ring-upright";
const CONCEALED_FLAG = "emperorsRingConcealed";
const EFFECT_FLAG = "emperorsRingEffect";

/** 妖刀·隐里切：装备时把「格挡 / 诱人诅咒」两个动作绑定到动作栏 */
const JIULI_TAG = "jiuli-katana";
const JIULI_GRANT_FLAG = "jiuliKatanaGranted";
const JIULI_ACTIONS = [
  { id: "whbJiuliParryA01", slug: "jiuli-parry-action" },
  { id: "whbJiuliEnticA01", slug: "jiuli-enticing-action" },
];

/** 与 whbEmperorRing01.json 中 system.rules 保持一致 */
const RING_RULES = [
  {
    key: "RollOption",
    domain: "all",
    option: UPRIGHT_OPTION,
    toggleable: true,
    placement: "actions",
    label: "皇帝的戒指 — 活化状态（Upright — 完全共鸣）",
    requiresInvestment: false,
  },
  {
    key: "FlatModifier",
    slug: "emperors-heart-skills",
    selector: ["intimidation", "diplomacy"],
    type: "item",
    value: 1,
    predicate: [UPRIGHT_OPTION],
    requiresInvestment: false,
  },
  {
    key: "AdjustDegreeOfSuccess",
    slug: "emperors-heart-resistance",
    selector: "saving-throw",
    adjustment: {
      success: "one-degree-better",
      failure: "one-degree-better",
      criticalFailure: "one-degree-better",
    },
    predicate: [
      UPRIGHT_OPTION,
      {
        or: [
          "item:trait:mental",
          "item:trait:charm",
          "item:trait:emotion",
          "origin:action:slug:coerce",
          "origin:action:slug:lie",
          "origin:action:slug:request",
          "origin:action:slug:make-an-impression",
          "origin:action:slug:gather-information",
        ],
      },
    ],
    requiresInvestment: false,
  },
  {
    key: "Note",
    selector: "saving-throw",
    title: "帝王之心 Emperor's Heart",
    text: "对抗社交/心灵效果时，你的成功度提升一级（成功→大成功，失败→成功，大失败→失败）。",
    predicate: [
      UPRIGHT_OPTION,
      {
        or: [
          "item:trait:mental",
          "item:trait:charm",
          "item:trait:emotion",
          "origin:action:slug:coerce",
          "origin:action:slug:lie",
          "origin:action:slug:request",
          "origin:action:slug:make-an-impression",
          "origin:action:slug:gather-information",
        ],
      },
    ],
    requiresInvestment: false,
  },
];

let bloodiedLionTemplate = null;

function isEmperorsRingItem(item) {
  return (
    item?.type === "equipment" &&
    (item.system.slug === RING_SLUG || item.name === RING_NAME)
  );
}

function canManage(actor) {
  return !!actor && (actor.isOwner || game.user.isGM);
}

function isActorLike(doc) {
  return !!doc?.itemTypes;
}

function actorFromApplication(app) {
  if (!app) return null;
  for (const c of [app.actor, app.document, app.object]) {
    if (isActorLike(c)) return c;
  }
  if (app.item?.actor) return app.item.actor;
  return null;
}

function iterateApplications() {
  const apps = [];
  if (ui.windows) apps.push(...Object.values(ui.windows));
  return apps;
}

/**
 * 世界演员 + 地图上令牌合成的 Actor（Foundry v14 ActorDelta）。
 * 从令牌拖入/装备的物品在 ActorDelta 上，不在 game.actors 里。
 */
function collectRelevantActors() {
  const seen = new Set();
  const list = [];
  const add = (actor) => {
    if (!isActorLike(actor)) return;
    const key = actor.uuid ?? actor.id;
    if (seen.has(key)) return;
    seen.add(key);
    list.push(actor);
  };

  for (const actor of game.actors.contents) add(actor);
  for (const token of canvas.tokens?.placeables ?? []) add(token.actor);

  return list;
}

/** 从打开的角色卡、令牌、或戴戒角色推断（含 ActorDelta） */
function resolveActor(explicit) {
  if (explicit) return explicit;

  for (const app of iterateApplications()) {
    const ctor = app.constructor?.name ?? "";
    if (
      ctor.includes("CharacterSheet") ||
      ctor.includes("CreatureSheet") ||
      ctor.includes("ActorSheet")
    ) {
      const actor = actorFromApplication(app);
      if (actor) return actor;
    }
  }

  for (const app of iterateApplications()) {
    const actor = actorFromApplication(app);
    if (actor) return actor;
  }

  if (canvas?.token?.actor) return canvas.token.actor;
  if (game.user?.character) return game.user.character;

  for (const actor of collectRelevantActors()) {
    if (findRingOnActor(actor)) return actor;
  }

  return null;
}

function findRingOnActor(actor) {
  return actor.itemTypes.equipment.find((i) => isEmperorsRingItem(i));
}

async function prepareRingSlot(ring) {
  if (!ring?.actor || ring.system.usage?.value !== "wornring") return ring;
  const eq = ring.system.equipped;
  if (eq.carryType === "worn" && eq.inSlot !== true) {
    await ring.update({ "system.equipped.inSlot": true });
  }
  return ring;
}

function getRing(actor) {
  const ring = findRingOnActor(actor);
  if (!ring?.isEquipped) return null;
  return ring;
}

function isUpright(actor) {
  const ring = getRing(actor);
  if (!ring) return false;
  const rule = ring.system.rules?.find(
    (r) => r.key === "RollOption" && r.option === UPRIGHT_OPTION
  );
  if (rule?.value) return true;
  return !!actor.rollOptions?.all?.[UPRIGHT_OPTION];
}

function isActive(actor) {
  return !!getRing(actor) && isUpright(actor);
}

function isInjured(actor) {
  const hp = actor.system.attributes?.hp;
  return !!hp && hp.value < hp.max;
}

function shouldGrantBloodiedLion(actor) {
  return isActive(actor) && isInjured(actor);
}

function findGrantedBloodiedLion(actor) {
  return actor.itemTypes.action.find(
    (a) =>
      a.system.slug === ABILITY_SLUG ||
      a.flags?.pf2e?.emperorsRingGranted === true
  );
}

function findGrantedConcealed(actor) {
  return actor.itemTypes.condition.find(
    (c) => c.slug === "concealed" && c.flags?.pf2e?.[CONCEALED_FLAG] === true
  );
}

async function loadBloodiedLionTemplate() {
  if (bloodiedLionTemplate) return bloodiedLionTemplate;
  const res = await fetch(`modules/${MODULE_ID}/scripts/data/bloodied-lion-action.json`);
  if (!res.ok) {
    console.warn(`PF2e | ${MODULE_ID}：无法加载浴血雄狮模板`);
    return null;
  }
  bloodiedLionTemplate = await res.json();
  return bloodiedLionTemplate;
}

async function getRingRulesFromPack() {
  const pack = game.packs.get(`${MODULE_ID}.homebrew-items`);
  if (!pack) return foundry.utils.deepClone(RING_RULES);
  const doc =
    (await pack.getDocument(RING_ID)) ??
    (await pack.getDocuments({ "system.slug": RING_SLUG }))[0];
  return doc?.system?.rules?.length
    ? foundry.utils.deepClone(doc.system.rules)
    : foundry.utils.deepClone(RING_RULES);
}

async function ensureRingRules(ring) {
  if (!ring?.actor) return;
  const hasToggle = ring.system.rules?.some(
    (r) => r.key === "RollOption" && r.option === UPRIGHT_OPTION
  );
  if (hasToggle) return;
  const rules = await getRingRulesFromPack();
  await ring.update({ "system.rules": rules });
}

async function removeLegacyResonanceEffect(actor) {
  const stale = actor.itemTypes.effect.filter((e) => e.flags?.pf2e?.[EFFECT_FLAG]);
  if (stale.length) {
    await actor.deleteEmbeddedDocuments("Item", stale.map((i) => i.id));
  }
}

async function syncConcealed(actor) {
  if (!canManage(actor) || !actor.isOfType?.("character", "npc")) return;

  const existing = findGrantedConcealed(actor);
  const grant = isActive(actor);

  if (grant && !existing) {
    const source = game.pf2e.ConditionManager.getCondition("concealed").toObject();
    source.flags = { pf2e: { [CONCEALED_FLAG]: true } };
    source.system.duration = {
      value: -1,
      unit: "unlimited",
      expiry: null,
      perpetual: false,
      text: "",
    };
    delete source._id;
    await Item.createDocuments([source], { parent: actor, render: false });
    return;
  }

  if (!grant && existing) {
    await existing.delete();
  }
}

async function syncBloodiedLion(actor) {
  if (!canManage(actor) || !actor.isOfType?.("character", "npc")) return;

  const existing = findGrantedBloodiedLion(actor);
  const grant = shouldGrantBloodiedLion(actor);

  if (grant && !existing) {
    const template = await loadBloodiedLionTemplate();
    if (!template) return;
    const data = foundry.utils.deepClone(template);
    delete data._id;
    await Item.createDocuments([data], { parent: actor, render: false });
    return;
  }

  if (!grant && existing) {
    await existing.delete();
  }
}

function isJiuliWeaponItem(item) {
  return (
    item?.type === "weapon" &&
    (item.system?.traits?.otherTags?.includes(JIULI_TAG) === true ||
      item.flags?.[MODULE_ID]?.source === "jiuli-katana")
  );
}

function findJiuliWeapon(actor) {
  return actor.itemTypes?.weapon?.find((w) => isJiuliWeaponItem(w)) ?? null;
}

function findGrantedJiuliActions(actor) {
  const slugs = JIULI_ACTIONS.map((a) => a.slug);
  return actor.itemTypes.action.filter(
    (a) =>
      a.flags?.[MODULE_ID]?.[JIULI_GRANT_FLAG] === true ||
      slugs.includes(a.system.slug)
  );
}

async function getJiuliActionSource(id) {
  const pack = game.packs.get(`${MODULE_ID}.homebrew-items`);
  const doc = pack ? await pack.getDocument(id) : null;
  if (!doc) return null;
  const source = doc.toObject();
  delete source._id;
  source.flags = foundry.utils.mergeObject(source.flags ?? {}, {
    [MODULE_ID]: { [JIULI_GRANT_FLAG]: true },
  });
  return source;
}

/** 防止多个钩子并发同步同一角色导致重复授予 */
const jiuliSyncing = new Set();

/** 演员身上有妖刀 → 授予两个动作（去重）；无妖刀 → 收回。 */
async function syncJiuliActions(actor) {
  if (!canManage(actor) || !actor.isOfType?.("character", "npc")) return;

  const key = actor.uuid ?? actor.id;
  if (jiuliSyncing.has(key)) return;
  jiuliSyncing.add(key);
  try {
    const hasWeapon = !!findJiuliWeapon(actor);
    const existing = findGrantedJiuliActions(actor);

    if (!hasWeapon) {
      if (existing.length) {
        await actor.deleteEmbeddedDocuments("Item", existing.map((i) => i.id));
      }
      return;
    }

    // 每个 slug 仅保留一个，删除并发产生的重复项
    const bySlug = new Map();
    const dupes = [];
    for (const a of existing) {
      if (bySlug.has(a.system.slug)) dupes.push(a.id);
      else bySlug.set(a.system.slug, a);
    }
    if (dupes.length) {
      await actor.deleteEmbeddedDocuments("Item", dupes);
    }

    const toCreate = [];
    for (const { id, slug } of JIULI_ACTIONS) {
      if (bySlug.has(slug)) continue;
      const source = await getJiuliActionSource(id);
      if (source) toCreate.push(source);
    }
    if (toCreate.length) {
      await Item.createDocuments(toCreate, { parent: actor, render: false });
    }
  } finally {
    jiuliSyncing.delete(key);
  }
}

/** 妖刀档位 → 诱人诅咒状态加值 */
function jiuliBonus(actor) {
  const slug = findJiuliWeapon(actor)?.system?.slug ?? "";
  return slug.includes("greater") ? 3 : slug.includes("moderate") ? 2 : 1;
}

async function removeJiuliEffect(actor, slug) {
  const old = actor.itemTypes.effect.filter((e) => e.slug === slug);
  if (old.length) {
    await actor.deleteEmbeddedDocuments("Item", old.map((i) => i.id));
  }
}

/** 点「格挡」动作 → +1 环境 AC，至下回合开始自动消失 */
async function applyJiuliParry(actor) {
  if (!canManage(actor)) return;
  const slug = "jiuli-parry";
  await removeJiuliEffect(actor, slug);
  const effect = {
    name: "格挡（妖刀·隐里切）",
    type: "effect",
    img: "icons/skills/melee/sword-block-blue.webp",
    system: {
      slug,
      description: { value: "<p>举刀格架，直到你的下一回合开始获得 +1 环境 AC。</p>" },
      rules: [
        { key: "FlatModifier", selector: "ac", type: "circumstance", value: 1, label: "格挡 Parry" },
      ],
      traits: { value: ["magical"], rarity: "rare", otherTags: [JIULI_TAG] },
      level: { value: 4 },
      duration: { value: 1, unit: "rounds", sustained: false, expiry: "turn-start" },
      tokenIcon: { show: true },
    },
    flags: { [MODULE_ID]: { [JIULI_GRANT_FLAG]: true } },
  };
  await Item.createDocuments([effect], { parent: actor, render: false });
  ui.notifications?.info(`${actor.name}：格挡生效，+1 环境 AC（至你下回合开始）。`);
}

/** 点「诱人诅咒」动作 → 本回合以妖刀攻击/伤害 +N，回合结束自动消失 */
async function applyJiuliEnticing(actor) {
  if (!canManage(actor)) return;
  const slug = "jiuli-enticing";
  const bonus = jiuliBonus(actor);
  await removeJiuliEffect(actor, slug);
  const effect = {
    name: "诱人诅咒（妖刀·隐里切）",
    type: "effect",
    img: "icons/magic/death/mouth-bite-fangs-red.webp",
    system: {
      slug,
      description: {
        value: `<p>本回合内，你以妖刀·隐里切进行的攻击与伤害获得 +${bonus} 状态加值。</p>`,
      },
      rules: [
        { key: "FlatModifier", selector: ["attack", "attack-roll"], type: "status", value: bonus, label: "诱人诅咒" },
        { key: "FlatModifier", selector: "damage", type: "status", value: bonus, label: "诱人诅咒" },
      ],
      traits: { value: ["curse", "magical"], rarity: "rare", otherTags: [JIULI_TAG] },
      level: { value: 4 },
      duration: { value: 1, unit: "rounds", sustained: false, expiry: "turn-end" },
      tokenIcon: { show: true },
    },
    flags: { [MODULE_ID]: { [JIULI_GRANT_FLAG]: true } },
  };
  await Item.createDocuments([effect], { parent: actor, render: false });
  ui.notifications?.info(`${actor.name}：诱人诅咒 +${bonus}（本回合，以妖刀攻击时生效）。`);
}

async function syncEmperorsRing(actor) {
  if (!actor) return;

  let ring = findRingOnActor(actor);
  if (ring) {
    ring = await prepareRingSlot(ring);
    await ensureRingRules(ring);
  }
  await removeLegacyResonanceEffect(actor);
  await syncConcealed(actor);
  await syncBloodiedLion(actor);
}

async function syncAllActors() {
  for (const actor of collectRelevantActors()) {
    if (findRingOnActor(actor)) await syncEmperorsRing(actor);
    if (findJiuliWeapon(actor) || findGrantedJiuliActions(actor).length) {
      await syncJiuliActions(actor);
    }
  }
}

function diagnose(explicitActor) {
  const mod = game.modules.get(MODULE_ID);
  const lines = [];
  const push = (s) => lines.push(s);

  push(`模块 ${MODULE_ID}：${mod?.active ? "已启用" : "未启用"} v${mod?.version ?? "?"}`);

  const actor = resolveActor(explicitActor);
  if (!actor) {
    push("✗ 未找到佩戴戒指的角色。");
    push("  → 请打开角色卡，或确认戒指在角色/令牌物品栏（非仅世界物品目录）。");
    return lines.join("\n");
  }

  push(`角色：${actor.name} (${actor.type})`);
  if (actor.token) {
    push("  来源：地图令牌（ActorDelta）— 装备存在令牌上，这是正常的");
  }

  const ring = findRingOnActor(actor);
  if (!ring) {
    push("✗ 该角色身上没有「皇帝的戒指」");
    push("  → 请从合集 PF2e 自制物品 拖入 PC 版（不是「逆转·剧情版」）");
  } else {
    const eq = ring.system.equipped;
    push(`✓ 找到戒指：${ring.name}`);
    push(`  carryType=${eq.carryType} inSlot=${eq.inSlot}`);
    push(`  isEquipped=${ring.isEquipped}`);
    push(`  rules=${ring.system.rules?.length ?? 0} 条`);
    if (!ring.isEquipped) push("  → 须穿戴到戒指槽");
    if (!ring.system.rules?.some((r) => r.key === "RollOption")) {
      push("  → 戒指缺少 Rule Elements，请运行「修复：皇帝的戒指」宏");
    }
  }

  const toggles = Object.values(actor.synthetics?.toggles?.all ?? {});
  const uprightToggle = toggles.find((t) => t.option === UPRIGHT_OPTION);
  push(
    uprightToggle
      ? `✓ 动作栏开关：${uprightToggle.label}`
      : `✗ 动作栏无活化开关（穿戴到戒指槽后，打开角色卡「动作」栏）`
  );

  console.log(lines.join("\n"));
  return lines.join("\n");
}

async function diagnoseAndSync(explicitActor) {
  const actor = resolveActor(explicitActor);
  const report = diagnose(actor);
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<pre style="white-space:pre-wrap;font-size:12px">${foundry.utils.escapeHTML(report)}</pre>`,
  });
  if (actor) {
    await syncEmperorsRing(actor);
    ui.notifications.info("已同步。请打开角色卡「动作」栏查看活化开关。");
  }
  return report;
}

async function fixEmperorsRing() {
  const rules = await getRingRulesFromPack();

  for (const actor of collectRelevantActors()) {
    const rings = actor.itemTypes.equipment.filter((i) => isEmperorsRingItem(i));
    for (const ring of rings) {
      await ring.update({ "system.rules": foundry.utils.deepClone(rules) });
      await prepareRingSlot(ring);
    }

    const stale = [
      ...actor.itemTypes.effect.filter((e) => e.flags?.pf2e?.[EFFECT_FLAG]),
      ...actor.itemTypes.action.filter(
        (a) => a.system.slug === ABILITY_SLUG || a.flags?.pf2e?.emperorsRingGranted
      ),
      ...actor.itemTypes.condition.filter(
        (c) => c.slug === "concealed" && c.flags?.pf2e?.[CONCEALED_FLAG]
      ),
    ];
    if (stale.length) {
      await actor.deleteEmbeddedDocuments("Item", stale.map((i) => i.id));
    }

    if (rings.length) await syncEmperorsRing(actor);
  }

  ui.notifications.info("戒指规则已恢复。穿戴到戒指槽后，在角色卡「动作」栏开启活化状态。");
}

async function importEmperorsRing() {
  const pack = game.packs.get(`${MODULE_ID}.homebrew-items`);
  if (!pack) {
    ui.notifications.error("合集中找不到物品，请确认模块已启用。");
    return null;
  }
  const item =
    (await pack.getDocument(RING_ID)) ??
    (await pack.getDocuments({ "system.slug": RING_SLUG }))[0];
  if (!item) {
    ui.notifications.error("合集中找不到皇帝的戒指，请运行 npm run pack。");
    return null;
  }
  const created = await Item.create(item.toObject());
  ui.notifications.info(`已导入：${created.name}。请拖到戒指槽并穿戴。`);
  return created;
}

Hooks.once("init", () => {
  const mod = game.modules.get(MODULE_ID);
  if (mod) {
    mod.api = {
      diagnose,
      diagnoseAndSync,
      fixEmperorsRing,
      importEmperorsRing,
      syncEmperorsRing,
      syncJiuliActions,
      applyJiuliParry,
      applyJiuliEnticing,
      findJiuliWeapon,
      syncAllActors,
      resolveActor,
      collectRelevantActors,
      executeNightweaverMacro,
      isNightweaverActor,
      nightweaverSummon,
      nightweaverBurst,
      nightweaverWallPop,
      nightweaverWallOffGuard,
      nightweaverFrenzy,
      createGroundskeeperEphemeraBook,
      buildGroundskeeperJournalDoc,
      createMorrowEphemeraBook,
      buildMorrowJournalDoc,
    };
  }
});

Hooks.once("ready", async () => {
  if (game.system.id !== "pf2e") return;
  if (!game.modules.get(MODULE_ID)?.active) return;
  await foundry.utils.delay(100);
  await syncAllActors();
});

Hooks.on("canvasReady", () => {
  if (!game.modules.get(MODULE_ID)?.active) return;
  syncAllActors();
});

Hooks.on("renderActorSheet", (sheet) => {
  if (!game.modules.get(MODULE_ID)?.active) return;
  if (findRingOnActor(sheet.actor)) syncEmperorsRing(sheet.actor);
  if (findJiuliWeapon(sheet.actor) || findGrantedJiuliActions(sheet.actor).length) {
    syncJiuliActions(sheet.actor);
  }
});

Hooks.on("renderItemSheet", (sheet) => {
  if (!game.modules.get(MODULE_ID)?.active) return;
  const item = sheet.item;
  if (!isEmperorsRingItem(item) || !item.actor) return;
  syncEmperorsRing(item.actor);
});

Hooks.on("updateActor", (actor, changes) => {
  if (!game.modules.get(MODULE_ID)?.active) return;
  if (!foundry.utils.hasProperty(changes, "system.attributes.hp")) return;
  syncEmperorsRing(actor);
});

Hooks.on("updateItem", (item, changes) => {
  if (!game.modules.get(MODULE_ID)?.active) return;
  const actor = item.actor;
  if (!actor) return;

  if (
    isEmperorsRingItem(item) &&
    (changes.system?.equipped || changes.system?.rules)
  ) {
    syncEmperorsRing(actor);
  }
});

Hooks.on("createItem", (item) => {
  if (!game.modules.get(MODULE_ID)?.active) return;
  if (!item.actor) return;
  if (isEmperorsRingItem(item)) syncEmperorsRing(item.actor);
  if (isJiuliWeaponItem(item)) syncJiuliActions(item.actor);
});

Hooks.on("deleteItem", (item) => {
  if (!game.modules.get(MODULE_ID)?.active) return;
  if (!item.actor) return;
  if (isEmperorsRingItem(item)) syncEmperorsRing(item.actor);
  if (isJiuliWeaponItem(item)) syncJiuliActions(item.actor);
});

/** 夜织者（遗迹2）——逻辑在模块 API；宏只做薄封装。指示物 ActorDelta 上禁用 toggleCondition。 */
const NW_SOURCE = "remnant2-nightweaver";
const NW_SPAWN_ID = "whbNmSpawn000001";
const NW_SPAWN_FOLDER = "遗迹2·召唤物";
const NW_ACTION_HANDLERS = {
  // AOE（爆破/贴墙）交给原生动作卡：@Check + 成功度段落里的 @UUID 状态
  召唤梦魇幼蛛: "nightweaverSummon",
  疯狂乱抓: "nightweaverFrenzy",
};
const nwActionFired = new Set();

function isNightweaverActor(actor) {
  return actor?.flags?.[MODULE_ID]?.source === NW_SOURCE;
}

async function nightweaverResolveContext(opts = {}) {
  let token =
    opts.token ??
    canvas.tokens?.controlled?.[0] ??
    null;
  if (!token && opts.actor) {
    token = opts.actor.getActiveTokens?.()?.[0] ?? null;
  }
  const actor = opts.actor ?? token?.actor ?? null;
  if (!token || !actor) {
    ui.notifications.warn("请先选中夜织者令牌。");
    return null;
  }
  try {
    token.control?.({ releaseOthers: true });
  } catch (_) {
    /* ignore */
  }
  return { token, actor };
}

/** 在指示物（ActorDelta）上 toggleCondition 常会炸 EmbeddedCollectionDelta，改用 create。 */
async function nightweaverEnsureCondition(actor, slug) {
  const already =
    actor.itemTypes?.condition?.some((c) => c.slug === slug) ||
    [...(actor.conditions ?? [])].some((c) => c.slug === slug);
  if (already) return true;

  const mgr = game.pf2e?.ConditionManager;
  const cond = mgr?.getCondition?.(slug);
  if (!cond) {
    ui.notifications.warn(`找不到状态：${slug}，请手动添加。`);
    return false;
  }
  const data = cond.toObject();
  delete data._id;
  try {
    await actor.createEmbeddedDocuments("Item", [data]);
    return true;
  } catch (err) {
    console.warn(`${MODULE_ID} | ensureCondition(${slug}) failed`, err);
    ui.notifications.warn(`无法自动施加「${slug}」，请手动添加。`);
    return false;
  }
}

async function nightweaverEnsureActorFolder(name) {
  let folder = game.folders.find((f) => f.type === "Actor" && f.name === name);
  if (!folder) {
    folder = await Folder.create({ name, type: "Actor", sorting: "a" });
  }
  return folder;
}

async function nightweaverGetSpawnActor() {
  const existing = game.actors.find(
    (a) => a.getFlag(MODULE_ID, "spawnSlug") === "nightmare-spawn"
  );
  if (existing) return existing;

  const pack = game.packs.get(`${MODULE_ID}.homebrew-actors`);
  const source = await pack?.getDocument(NW_SPAWN_ID);
  if (!source) {
    ui.notifications.error("合集中找不到梦魇幼蛛，请重新 pack 模块。");
    return null;
  }
  const folder = await nightweaverEnsureActorFolder(NW_SPAWN_FOLDER);
  const data = source.toObject();
  delete data._id;
  data.folder = folder.id;
  data.flags = foundry.utils.mergeObject(data.flags ?? {}, {
    [MODULE_ID]: { spawnSlug: "nightmare-spawn", source: NW_SOURCE },
  });
  return Actor.create(data);
}

async function nightweaverSummon(opts = {}) {
  const ctx = await nightweaverResolveContext(opts);
  if (!ctx) return;
  const { token, actor } = ctx;

  const spawnActor = await nightweaverGetSpawnActor();
  if (!spawnActor) return;

  const grid = canvas.grid.size;
  const td = await spawnActor.getTokenDocument({
    x: token.document.x + grid,
    y: token.document.y,
  });
  const obj = td.toObject();
  obj.actorLink = false;
  obj.hidden = false;
  obj.disposition = token.document.disposition;

  const placed = await canvas.scene.createEmbeddedDocuments("Token", [obj]);
  await nightweaverEnsureCondition(actor, "off-guard");

  const speaker = ChatMessage.getSpeaker({ actor, token: token.document });
  await ChatMessage.create({
    speaker,
    content: `<p><strong>召唤梦魇幼蛛</strong>：${actor.name} 陷入<strong>措手不及</strong>，召唤了 1 只梦魇幼蛛。</p>
<p>幼蛛立即获得 <strong>1 个动作</strong>并可在本轮行动。</p>
<p><em>中断：</em>下回合开始前若被<strong>近战命中</strong>——召唤失败；额外 @Damage[1d6[mental]] 并<strong>震慑 1</strong>。</p>
<p style="font-size:12px">频率：每场战斗一次（GM 记次）。召唤物在演员目录「${NW_SPAWN_FOLDER}」。</p>`,
  });
  ui.notifications.info(`已召唤 1 只梦魇幼蛛。`);
}

async function nightweaverWallOffGuard(opts = {}) {
  const ctx = await nightweaverResolveContext(opts);
  if (!ctx) return;
  await nightweaverEnsureCondition(ctx.actor, "off-guard");
}

async function nightweaverBurst(opts = {}) {
  // 保留 API 兼容；正式流程已改用动作描述内的 @Template/@Check/@Damage
  return nightweaverResolveContext(opts);
}

async function nightweaverWallPop(opts = {}) {
  return nightweaverWallOffGuard(opts);
}

async function nightweaverFrenzy(opts = {}) {
  const ctx = await nightweaverResolveContext(opts);
  if (!ctx) return;
  const { token, actor } = ctx;

  const strike = (actor.system.actions ?? []).find((a) => {
    const n = a.item?.name ?? a.label ?? "";
    return n === "爪击";
  });
  if (!strike) {
    return ui.notifications.error("找不到「爪击」打击。请从合集重新拖入夜织者。");
  }

  const speaker = ChatMessage.getSpeaker({ actor, token: token.document });
  await ChatMessage.create({
    speaker,
    content: `<p><strong>疯狂乱抓</strong>：连续两次爪击。若两次均命中同一目标，附加 @Damage[1d4[persistent,bleed]]。</p>`,
  });

  const rollOne = async (index) => {
    const variant = strike.variants?.[index];
    if (variant?.roll) {
      await variant.roll({});
      return;
    }
    if (typeof strike.attack === "function") {
      await strike.attack({ mapIncreases: index });
      return;
    }
    throw new Error("strike API unavailable");
  };

  try {
    await rollOne(0);
    await rollOne(1);
  } catch (err) {
    console.error(`${MODULE_ID} | frenzy roll failed`, err);
    ui.notifications.error("疯狂乱抓掷骰失败。请手动点两次爪击（+10 / +6）。");
  }
}

async function executeNightweaverMacro(macroId, actor, token) {
  const byId = {
    whbNwSummon00001: nightweaverSummon,
    whbNwBurst000001: nightweaverBurst,
    whbNwWallPop0001: nightweaverWallPop,
    whbNwFrenzy00001: nightweaverFrenzy,
  };
  const fn = byId[macroId];
  if (!fn) {
    ui.notifications.error(`未知夜织者宏：${macroId}`);
    return;
  }
  await fn({ actor, token });
}

Hooks.on("createChatMessage", (message) => {
  if (!game.modules.get(MODULE_ID)?.active) return;
  if (message.author?.id !== game.user.id) return;
  const item = message.item;
  const actor = message.actor;
  if (!item || !actor) return;
  const slug = item.system?.slug ?? item.slug;
  if (slug === "jiuli-parry-action") applyJiuliParry(actor);
  else if (slug === "jiuli-enticing-action") applyJiuliEnticing(actor);

  if (!isNightweaverActor(actor)) return;
  if (item.type !== "action") return;
  const handlerName = NW_ACTION_HANDLERS[item.name];
  if (!handlerName) return;
  const key = `${message.id}:${handlerName}`;
  if (nwActionFired.has(key)) return;
  nwActionFired.add(key);
  setTimeout(() => nwActionFired.delete(key), 5000);

  const token = message.token?.object ?? actor.getActiveTokens?.()?.[0] ?? null;
  const fn = {
    nightweaverSummon,
    nightweaverBurst,
    nightweaverWallPop,
    nightweaverWallOffGuard,
    nightweaverFrenzy,
  }[handlerName];
  fn({ actor, token }).catch((err) => {
    console.error(`${MODULE_ID} | Nightweaver action failed`, err);
    ui.notifications.error(`夜织者动作执行失败：${item.name}（详见控制台）`);
  });
});

Hooks.on("pf2e.startTurn", async (combatant) => {
  if (!game.modules.get(MODULE_ID)?.active) return;
  const actor = combatant?.actor;
  if (!canManage(actor)) return;

  await syncBloodiedLion(actor);

  if (!shouldGrantBloodiedLion(actor)) return;

  const hp = actor.system.attributes?.hp;
  if (!hp || hp.value >= hp.max) return;

  await actor.applyDamage({ damage: -1, token: combatant.token?.object ?? undefined });

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor, token: combatant.token }),
    content: `<p><strong>浴血雄狮 Bloodied Lion</strong>：${actor.name} 获得快速治疗，恢复 @Damage[1[healing]] 生命值。</p>`,
  });
});

/** 自制 lore：注入 scriptorium 纸面 CSS（scriptorium 未启用时的兜底） */
function injectScriptoriumCssFallback(entry) {
  if (!entry) return;
  const css = entry.getFlag?.("scriptorium", "css") ?? entry.flags?.scriptorium?.css;
  const uid = entry.getFlag?.("scriptorium", "uid") ?? entry.flags?.scriptorium?.uid;
  if (!css || !uid) return;
  const id = `scriptorium-css-${uid}`;
  if (document.getElementById(id)) return;
  // 若 scriptorium 已注入则跳过
  if (game.modules.get("scriptorium")?.active) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
}

function markDiaryJournalSheet(app, html) {
  const doc = app?.document ?? app?.object;
  if (!doc || doc.documentName !== "JournalEntry") return;
  injectScriptoriumCssFallback(doc);
  const style = doc.getFlag?.(MODULE_ID, "style") ?? doc.flags?.[MODULE_ID]?.style;
  if (style !== "ephemera-sc-paper" && doc.getFlag?.(MODULE_ID, "sheet") !== "diary") return;
  const root = html instanceof HTMLElement ? html : html?.[0];
  root?.classList?.add("whb-diary-sheet");
  app.element?.classList?.add("whb-diary-sheet");
}

for (const hook of [
  "renderJournalSheet",
  "renderJournalEntrySheet",
  "renderJournalPageSheet",
  "renderJournalEntryPageSheet",
  "renderJournalTextPageSheet",
]) {
  Hooks.on(hook, (app, html) => {
    const doc = app?.document ?? app?.object;
    const entry = doc?.documentName === "JournalEntry" ? doc : doc?.parent;
    if (entry) injectScriptoriumCssFallback(entry);
    markDiaryJournalSheet(app, html);
  });
}
