/**
 * 夜织者奖赏全自动：装备投资后授动作；点动作自动结算；假面光环自动套/卸；
 * 残月织弦施放治疗法术时自动给目标挂心灵抗。
 */
const MODULE_ID = "wang-pf2e-homebrew";
const FLAG = "nightweaverReward";

const SLUGS = {
  armor: "cocoon-of-dreamsilk",
  mask: "nightweaver-visage",
  staff: "crescent-dreamstring",
  amulet: "lucid-cocoon-core",
};

const ACTION_SLUGS = {
  shroud: "nw-silk-shroud",
  unveil: "nw-unveil",
  pluck: "nw-pluck-string",
  sever: "nw-sever-dream",
};

const EFFECT_SLUGS = {
  shroud: "nw-silk-shroud-effect",
  veil: "nw-woven-shadow-veil",
  mend: "nw-moonstring-mend",
  unveilMark: "nw-unveil-mark",
};

const syncing = new Set();
const handledMessages = new Set();

function canManage(actor) {
  return !!actor && (actor.isOwner || game.user.isGM);
}

function dayKey() {
  return Math.floor((game.time?.worldTime ?? 0) / 86400);
}

function dailyUsed(actor, key) {
  return actor.getFlag(MODULE_ID, `${FLAG}.daily.${key}`) === dayKey();
}

async function markDaily(actor, key) {
  await actor.setFlag(MODULE_ID, `${FLAG}.daily.${key}`, dayKey());
}

const NAMES = {
  armor: "织梦残茧",
  mask: "夜织假面",
  staff: "残月织弦",
  amulet: "清醒茧核",
};

function findReward(actor, slug) {
  const name = Object.entries(SLUGS).find(([, s]) => s === slug)?.[0];
  const cn = name ? NAMES[name] : null;
  return (
    actor?.items?.find(
      (i) =>
        i.system?.slug === slug ||
        (cn && i.name === cn) ||
        i.flags?.[MODULE_ID]?.enNameSlug === slug
    ) ?? null
  );
}

function isInvestedReward(item) {
  if (!item) return false;
  if (item.type === "weapon") {
    return !!item.isInvested || item.system?.equipped?.invested === true || item.isEquipped;
  }
  return !!item.isInvested || item.system?.equipped?.invested === true;
}

function hasInvested(actor, slug) {
  const item = findReward(actor, slug);
  return !!(item && isInvestedReward(item));
}

function tokenCenter(token) {
  return token?.center ?? token?.object?.center ?? null;
}

function distanceFeet(a, b) {
  const ca = tokenCenter(a);
  const cb = tokenCenter(b);
  if (!ca || !cb || !canvas?.grid) return Infinity;
  return canvas.grid.measurePath([ca, cb]).distance;
}

function activeTokensOf(actor) {
  return actor?.getActiveTokens?.(true, true) ?? [];
}

async function ensureCondition(actor, slug, value = 1) {
  if (!actor) return;
  const current = actor.getCondition?.(slug);
  if (!current) {
    if (typeof actor.toggleCondition === "function") {
      await actor.toggleCondition(slug, { forceToggle: true });
    } else if (typeof actor.increaseCondition === "function") {
      await actor.increaseCondition(slug, { value });
    }
    return;
  }
  if (value > 1 && typeof actor.increaseCondition === "function") {
    const cur = Number(current?.value ?? 1);
    if (cur < value) await actor.increaseCondition(slug, { value: value - cur });
  }
}

async function reduceCondition(actor, slug, by = 1) {
  const cond = actor.getCondition?.(slug);
  if (!cond) return false;
  const cur = Number(cond.value ?? 1);
  if (cur <= by) {
    await cond.delete();
    return true;
  }
  if (typeof actor.decreaseCondition === "function") {
    await actor.decreaseCondition(slug, { value: by });
    return true;
  }
  await cond.update({ "system.value.value": cur - by });
  return true;
}

async function removeEffectsBySlug(actor, slug) {
  const old = actor.itemTypes?.effect?.filter((e) => e.slug === slug || e.system?.slug === slug) ?? [];
  if (old.length) await actor.deleteEmbeddedDocuments("Item", old.map((i) => i.id));
}

async function applyEffect(actor, data) {
  await removeEffectsBySlug(actor, data.system.slug);
  await Item.createDocuments([data], { parent: actor, render: false });
}

function shroudEffectData() {
  return {
    name: "抽丝蔽体",
    type: "effect",
    img: "modules/wang-pf2e-homebrew/assets/remnant/nightweaver-armor.png",
    system: {
      slug: EFFECT_SLUGS.shroud,
      description: { value: "<p>蛛丝蔽体：你处于隐蔽，直至下个回合开始（攻击/施法提前结束）。</p>" },
      rules: [],
      traits: { value: ["magical", "occult"], rarity: "uncommon" },
      level: { value: 3 },
      duration: { value: 1, unit: "rounds", sustained: false, expiry: "turn-start" },
      tokenIcon: { show: true },
    },
    flags: { [MODULE_ID]: { [FLAG]: true } },
  };
}

function veilEffectData() {
  return {
    name: "织影帷幕",
    type: "effect",
    img: "modules/wang-pf2e-homebrew/assets/remnant/nightweaver-mask.png",
    system: {
      slug: EFFECT_SLUGS.veil,
      description: {
        value: "<p>夜织假面蛛纱帷幕：对抗恐惧/情绪的意志豁免获得环境加值 +1。</p>",
      },
      rules: [
        {
          key: "FlatModifier",
          slug: "nw-veil-will",
          selector: "will",
          type: "circumstance",
          value: 1,
          predicate: [{ or: ["item:trait:fear", "item:trait:emotion", "fear", "emotion"] }],
        },
      ],
      traits: { value: ["aura", "emotion", "magical", "occult"], rarity: "uncommon" },
      level: { value: 3 },
      duration: { value: -1, unit: "unlimited", sustained: false, expiry: null },
      tokenIcon: { show: true },
    },
    flags: { [MODULE_ID]: { [FLAG]: true, autoVeil: true } },
  };
}

function mendEffectData() {
  return {
    name: "月弦缝心",
    type: "effect",
    img: "modules/wang-pf2e-homebrew/assets/remnant/nightweaver-staff.png",
    system: {
      slug: EFFECT_SLUGS.mend,
      description: { value: "<p>残月织弦缝住心神：心灵抗性 2。</p>" },
      rules: [{ key: "Resistance", type: "mental", value: 2 }],
      traits: { value: ["magical", "divine", "occult"], rarity: "uncommon" },
      level: { value: 3 },
      duration: { value: 1, unit: "rounds", sustained: false, expiry: "turn-start" },
      tokenIcon: { show: true },
    },
    flags: { [MODULE_ID]: { [FLAG]: true } },
  };
}

function unveilMarkData() {
  return {
    name: "揭纱印记",
    type: "effect",
    img: "modules/wang-pf2e-homebrew/assets/remnant/nightweaver-mask.png",
    system: {
      slug: EFFECT_SLUGS.unveilMark,
      description: { value: "<p>对佩戴夜织假面者恐吓时环境加值 +1；对其攻击措手不及已另结算。</p>" },
      rules: [],
      traits: { value: ["emotion", "fear", "mental"], rarity: "uncommon" },
      level: { value: 3 },
      duration: { value: 1, unit: "minutes", sustained: false, expiry: "turn-start" },
      tokenIcon: { show: true },
    },
    flags: { [MODULE_ID]: { [FLAG]: true } },
  };
}

function actionTemplate(def) {
  return {
    name: def.name,
    type: "action",
    img: def.img,
    system: {
      slug: def.slug,
      description: { value: def.description },
      rules: [],
      traits: { value: def.traits ?? [], rarity: "uncommon", otherTags: ["nightweaver-reward"] },
      actionType: { value: def.actionType },
      actions: { value: def.actions ?? null },
      category: def.category ?? "interaction",
      frequency: { max: 1, per: "day", value: 1 },
      deathNote: false,
      level: { value: 3 },
    },
    flags: { [MODULE_ID]: { [FLAG]: true, rewardAction: def.key } },
  };
}

const ACTION_DEFS = {
  shroud: {
    key: "shroud",
    slug: ACTION_SLUGS.shroud,
    name: "抽丝蔽体（织梦残茧）",
    img: "modules/wang-pf2e-homebrew/assets/remnant/nightweaver-armor.png",
    actionType: "reaction",
    actions: null,
    traits: ["manipulate"],
    category: "defensive",
    description:
      "<p><strong>触发</strong> 你被造成伤害时。<strong>效果</strong>（自动）：你变为隐蔽，直至你下个回合开始。</p>",
  },
  unveil: {
    key: "unveil",
    slug: ACTION_SLUGS.unveil,
    name: "揭纱（夜织假面）",
    img: "modules/wang-pf2e-homebrew/assets/remnant/nightweaver-mask.png",
    actionType: "action",
    actions: 1,
    traits: ["manipulate", "emotion", "fear", "mental", "visual"],
    description:
      "<p>选中一名敌人后点击。自动进行意志 DC 17，并按结果施加隐蔽/措手不及/惧怕。</p>",
  },
  pluck: {
    key: "pluck",
    slug: ACTION_SLUGS.pluck,
    name: "拨弦（残月织弦）",
    img: "modules/wang-pf2e-homebrew/assets/remnant/nightweaver-staff.png",
    actionType: "action",
    actions: 1,
    traits: ["manipulate", "concentrate"],
    description:
      "<p>选中目标后点击。盟友：治疗并清惧怕/呆滞；敌人：意志 DC 17 惧怕并措手不及。</p>",
  },
  sever: {
    key: "sever",
    slug: ACTION_SLUGS.sever,
    name: "断梦（清醒茧核）",
    img: "modules/wang-pf2e-homebrew/assets/remnant/nightweaver-amulet.png",
    actionType: "free",
    actions: null,
    traits: [],
    category: "defensive",
    description:
      "<p><strong>触发</strong> 你将因心灵/情绪/恐惧陷入呆滞、惧怕或困惑时。自动降低该状态 1 级；若隐蔽/躲藏则记下对来源下次打击 +1d4 心灵。</p>",
  },
};

async function syncGrantedActions(actor) {
  if (!canManage(actor) || !actor.isOfType?.("character")) return;
  const key = actor.uuid ?? actor.id;
  if (syncing.has(key)) return;
  syncing.add(key);
  try {
    const want = [];
    if (hasInvested(actor, SLUGS.armor)) want.push("shroud");
    if (hasInvested(actor, SLUGS.mask)) want.push("unveil");
    if (hasInvested(actor, SLUGS.staff)) want.push("pluck");
    if (hasInvested(actor, SLUGS.amulet)) want.push("sever");

    const existing = actor.itemTypes.action.filter(
      (a) => a.flags?.[MODULE_ID]?.[FLAG] === true || Object.values(ACTION_SLUGS).includes(a.system?.slug)
    );
    const bySlug = new Map(existing.map((a) => [a.system.slug, a]));
    const toDelete = [];
    for (const a of existing) {
      const k = Object.entries(ACTION_SLUGS).find(([, s]) => s === a.system.slug)?.[0];
      if (!k || !want.includes(k)) toDelete.push(a.id);
    }
    if (toDelete.length) await actor.deleteEmbeddedDocuments("Item", toDelete);

    const toCreate = [];
    for (const k of want) {
      const slug = ACTION_SLUGS[k];
      if (bySlug.has(slug) && want.includes(k) && !toDelete.includes(bySlug.get(slug)?.id)) continue;
      if (actor.itemTypes.action.some((a) => a.system?.slug === slug)) continue;
      toCreate.push(actionTemplate(ACTION_DEFS[k]));
    }
    if (toCreate.length) await Item.createDocuments(toCreate, { parent: actor, render: false });
  } finally {
    syncing.delete(key);
  }
}

async function syncVeilAura() {
  if (!canvas?.ready || !game.user.isGM) return;
  const wearers = [];
  for (const token of canvas.tokens.placeables) {
    const actor = token.actor;
    if (!actor || !hasInvested(actor, SLUGS.mask)) continue;
    wearers.push(token);
  }

  const shouldHave = new Set();
  for (const wearer of wearers) {
    for (const token of canvas.tokens.placeables) {
      const ally = token.actor;
      if (!ally?.isOfType?.("character", "npc", "familiar")) continue;
      if (token.document.disposition < 0 && token !== wearer) continue;
      // allies + self: disposition friendly/neutral same side
      const sameSide =
        token === wearer ||
        (wearer.document.disposition >= 0 && token.document.disposition >= 0);
      if (!sameSide) continue;
      if (distanceFeet(wearer, token) > 15) continue;
      shouldHave.add(ally.uuid);
      if (!canManage(ally)) continue;
      const has = ally.itemTypes.effect.some(
        (e) => e.system?.slug === EFFECT_SLUGS.veil && e.flags?.[MODULE_ID]?.autoVeil
      );
      if (!has) await applyEffect(ally, veilEffectData());
    }
  }

  for (const token of canvas.tokens.placeables) {
    const ally = token.actor;
    if (!ally || !canManage(ally)) continue;
    const veils = ally.itemTypes.effect.filter(
      (e) => e.system?.slug === EFFECT_SLUGS.veil && e.flags?.[MODULE_ID]?.autoVeil
    );
    if (!veils.length) continue;
    if (!shouldHave.has(ally.uuid)) {
      await ally.deleteEmbeddedDocuments(
        "Item",
        veils.map((v) => v.id)
      );
    }
  }
}

async function applyShroud(actor) {
  if (!canManage(actor)) return;
  if (dailyUsed(actor, "shroud")) {
    ui.notifications.warn(`${actor.name}：抽丝蔽体今日已使用。`);
    return;
  }
  await applyEffect(actor, shroudEffectData());
  await ensureCondition(actor, "concealed");
  await markDaily(actor, "shroud");
  ui.notifications.info(`${actor.name}：抽丝蔽体 — 隐蔽至下回合开始。`);
}

async function applyUnveil(actor) {
  if (!canManage(actor)) return;
  if (dailyUsed(actor, "unveil")) {
    ui.notifications.warn(`${actor.name}：揭纱今日已使用。`);
    return;
  }
  const targetToken = [...game.user.targets][0];
  const target = targetToken?.actor;
  if (!target) {
    ui.notifications.warn("请先选中一名敌人作为揭纱目标。");
    return;
  }

  const save = target.saves?.will;
  if (!save) {
    ui.notifications.error("目标没有意志豁免。");
    return;
  }

  const roll = await save.roll({
    dc: { value: 17 },
    item: findReward(actor, SLUGS.mask),
    origin: actor,
    traits: ["emotion", "fear", "mental", "visual"],
  });
  // PF2e DegreeOfSuccess: 0 crit fail, 1 fail, 2 success, 3 crit success
  const dos = Number(roll?.degreeOfSuccess ?? 2);
  await markDaily(actor, "unveil");

  if (dos >= 2) {
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><strong>揭纱</strong> vs ${target.name}：${dos === 3 ? "大成功" : "成功"} — 不受影响。</p>`,
    });
    return;
  }

  await ensureCondition(actor, "concealed");
  await applyEffect(actor, {
    name: "揭纱·隐蔽",
    type: "effect",
    img: "modules/wang-pf2e-homebrew/assets/remnant/nightweaver-mask.png",
    system: {
      slug: "nw-unveil-conceal",
      description: { value: "<p>揭纱后你保持隐蔽 1 分钟（攻击/施法仍会暴露）。</p>" },
      rules: [],
      traits: { value: ["magical", "occult"], rarity: "uncommon" },
      level: { value: 3 },
      duration: { value: 1, unit: "minutes", sustained: false, expiry: "turn-start" },
      tokenIcon: { show: true },
    },
    flags: { [MODULE_ID]: { [FLAG]: true } },
  });
  await ensureCondition(target, "off-guard");
  await applyEffect(target, unveilMarkData());
  if (dos === 0) await ensureCondition(target, "frightened", 2);

  ui.notifications.info(
    dos === 0
      ? `${target.name}：揭纱大失败 — 惧怕 2、措手不及；你获得隐蔽。`
      : `${target.name}：揭纱失败 — 措手不及；你获得隐蔽。`
  );
}

async function applyPluck(actor) {
  if (!canManage(actor)) return;
  if (dailyUsed(actor, "pluck")) {
    ui.notifications.warn(`${actor.name}：拨弦今日已使用。`);
    return;
  }
  const targetToken = [...game.user.targets][0];
  const target = targetToken?.actor;
  if (!target) {
    ui.notifications.warn("请先选中拨弦目标（盟友或敌人）。");
    return;
  }

  const cha = actor.system.abilities?.cha?.mod ?? 0;
  const friendly =
    target === actor ||
    (targetToken.document.disposition >= 0 &&
      (actor.getActiveTokens()?.[0]?.document?.disposition ?? 1) >= 0 &&
      targetToken.document.disposition === (actor.getActiveTokens()?.[0]?.document?.disposition ?? 1)) ||
    targetToken.document.disposition === 1;

  await markDaily(actor, "pluck");

  if (friendly || targetToken.document.disposition >= 1) {
    const formula = `1d8 + ${cha}`;
    const roll = await new Roll(formula).evaluate();
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: `拨弦治疗 → ${target.name}`,
    });
    if (typeof target.applyDamage === "function") {
      await target.applyDamage({ damage: -roll.total, token: targetToken });
    }
    await reduceCondition(target, "frightened", 1);
    await reduceCondition(target, "stupefied", 1);
    ui.notifications.info(`${target.name}：拨弦治疗 ${roll.total}，并尝试移除惧怕1/呆滞1。`);
    return;
  }

  const save = target.saves?.will;
  const roll = await save.roll({
    dc: { value: 17 },
    origin: actor,
    traits: ["emotion", "fear", "mental", "visual"],
  });
  const dos = Number(roll?.degreeOfSuccess);
  if (dos <= 1) {
    await ensureCondition(target, "frightened", dos === 0 ? 2 : 1);
    await ensureCondition(target, "off-guard");
    ui.notifications.info(
      `${target.name}：拨弦${dos === 0 ? "大失败" : "失败"} — 惧怕 ${dos === 0 ? 2 : 1}、措手不及。`
    );
  } else {
    ui.notifications.info(`${target.name}：拨弦豁免成功。`);
  }
}

async function applySever(actor) {
  if (!canManage(actor)) return;
  if (dailyUsed(actor, "sever")) {
    ui.notifications.warn(`${actor.name}：断梦今日已使用。`);
    return;
  }
  let reduced = false;
  for (const slug of ["stupefied", "frightened", "confused"]) {
    if (actor.getCondition?.(slug)) {
      reduced = (await reduceCondition(actor, slug, 1)) || reduced;
      break;
    }
  }
  if (!reduced) {
    ui.notifications.warn("当前没有呆滞/惧怕/困惑可降低。仍可在触发时使用。");
    return;
  }
  await markDaily(actor, "sever");

  const hidden =
    actor.getCondition?.("concealed") ||
    actor.getCondition?.("hidden") ||
    actor.statuses?.has?.("concealed") ||
    actor.statuses?.has?.("hidden");
  if (hidden) {
    await actor.setFlag(MODULE_ID, `${FLAG}.dreamSting`, true);
    ui.notifications.info(`${actor.name}：断梦成功；下次打击将对来源附加 1d4 心灵（自动）。`);
  } else {
    ui.notifications.info(`${actor.name}：断梦成功，状态降低 1 级。`);
  }
}

async function handleDreamSting(message) {
  const actor = message.actor;
  if (!actor || !canManage(actor)) return;
  if (!actor.getFlag(MODULE_ID, `${FLAG}.dreamSting`)) return;
  const item = message.item;
  if (!item || item.type !== "weapon") return;
  // append note / extra damage via chat
  await actor.unsetFlag(MODULE_ID, `${FLAG}.dreamSting`);
  const roll = await new Roll("1d4").evaluate();
  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: "清醒茧核·断梦：附加心灵伤害",
  });
}

async function handleStaffHeal(message) {
  const actor = message.actor;
  if (!actor || !hasInvested(actor, SLUGS.staff)) return;
  const item = message.item;
  if (!item || item.type !== "spell") return;
  const traits = item.system?.traits?.value ?? [];
  if (!traits.includes("healing")) return;

  const targets = [];
  for (const t of message.targetTokens ?? []) {
    if (t.actor) targets.push(t.actor);
  }
  // fallback: user targets / speaker target
  if (!targets.length) {
    for (const t of game.user.targets) if (t.actor) targets.push(t.actor);
  }
  if (!targets.length && message.token?.actor) {
    // heal self sometimes
  }

  for (const t of targets) {
    if (!canManage(t) && !game.user.isGM) continue;
    // GM applies to all
    if (game.user.isGM || t.isOwner) {
      await applyEffect(t, mendEffectData());
    }
  }
  if (targets.length && game.user.isGM) {
    ui.notifications.info(`残月织弦：已为 ${targets.map((t) => t.name).join("、")} 缝心（心灵抗 2）。`);
  }
}

async function onRewardAction(slug, actor) {
  if (slug === ACTION_SLUGS.shroud) return applyShroud(actor);
  if (slug === ACTION_SLUGS.unveil) return applyUnveil(actor);
  if (slug === ACTION_SLUGS.pluck) return applyPluck(actor);
  if (slug === ACTION_SLUGS.sever) return applySever(actor);
}

async function syncActor(actor) {
  if (!actor) return;
  await syncGrantedActions(actor);
}

async function syncAll() {
  for (const actor of game.actors ?? []) {
    if (actor.isOfType?.("character")) await syncActor(actor);
  }
  for (const token of canvas?.tokens?.placeables ?? []) {
    if (token.actor?.isOfType?.("character")) await syncActor(token.actor);
  }
  await syncVeilAura();
}

export function installNightweaverRewards() {
  const mod = game.modules.get(MODULE_ID);
  if (mod?.api) {
    mod.api.syncNightweaverRewards = syncAll;
    mod.api.syncNightweaverActor = syncActor;
  }

  Hooks.on("createChatMessage", (message) => {
    if (!game.modules.get(MODULE_ID)?.active) return;
    if (message.author?.id !== game.user.id && !game.user.isGM) return;
    const key = message.id;
    if (handledMessages.has(key)) return;
    handledMessages.add(key);
    setTimeout(() => handledMessages.delete(key), 8000);

    const actor = message.actor;
    const item = message.item;
    if (actor && item) {
      const slug = item.system?.slug ?? item.slug;
      if (Object.values(ACTION_SLUGS).includes(slug)) {
        onRewardAction(slug, actor).catch((err) => {
          console.error(`${MODULE_ID} | nightweaver action`, err);
          ui.notifications.error(`夜织奖赏动作失败：${item.name}`);
        });
      }
    }
    handleStaffHeal(message).catch(console.error);
    handleDreamSting(message).catch(console.error);
  });

  Hooks.on("updateItem", (item) => {
    const actor = item.actor;
    if (!actor) return;
    const slug = item.system?.slug;
    if (Object.values(SLUGS).includes(slug) || item.flags?.[MODULE_ID]?.source === "remnant-2") {
      syncActor(actor);
      if (game.user.isGM) syncVeilAura();
    }
  });

  Hooks.on("createItem", (item) => {
    if (!item.actor) return;
    if (Object.values(SLUGS).includes(item.system?.slug)) syncActor(item.actor);
  });

  Hooks.on("deleteItem", (item) => {
    if (!item.actor) return;
    if (Object.values(SLUGS).includes(item.system?.slug)) syncActor(item.actor);
  });

  Hooks.on("updateToken", () => {
    if (game.user.isGM) syncVeilAura();
  });

  Hooks.on("createToken", () => {
    if (game.user.isGM) syncVeilAura();
  });

  Hooks.on("pf2e.startTurn", () => {
    if (game.user.isGM) syncVeilAura();
  });

  Hooks.once("ready", async () => {
    if (game.system.id !== "pf2e") return;
    await foundry.utils.delay(200);
    await syncAll();
  });

  Hooks.on("canvasReady", () => {
    syncAll();
  });

  Hooks.on("renderActorSheet", (sheet) => {
    syncActor(sheet.actor);
  });
}
