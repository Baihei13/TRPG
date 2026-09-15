/**
 * 猎杀对决：武器皮肤、命中状态、招牌动作、双形态效果自动化。
 */
import { installHuntFullAuto } from "./hunt-full-auto.mjs";
import {
  installHuntBloodMoon,
  toggleBloodMoon,
  isBloodMoonActive,
  applyBloodMoonToActor,
  removeBloodMoonFromActor,
} from "./hunt-blood-moon.mjs";

export { toggleBloodMoon, isBloodMoonActive, applyBloodMoonToActor, removeBloodMoonFromActor };

/** 控制台调试：选中红鸦后调用 game.modules.get("wang-pf2e-homebrew").api.debugDeployTripMine() */
export async function debugDeployTripMine(actor) {
  actor = actor || canvas.tokens?.controlled?.[0]?.actor;
  if (!actor) return ui.notifications.warn("选中猎人");
  return deployTripMineFromActor(actor, TRIP_MINE_ACTIONS["red-raven-toxic"]);
}

const MODULE_ID = "wang-pf2e-homebrew";
const FLAG = "huntShowdown";
const PACK = `${MODULE_ID}.homebrew-items`;

const EFFECT_IDS = {
  burn: "whbHuntBurnFx001",
  poison: "whbHuntPsnFx0001",
  antidote: "whbHuntAntiFx001",
  dorothyNightmare: "whbHuntDorNtmFx1",
  foolFugitive: "whbHuntFoolFugFx",
  nooseSlow: "whbHuntNooseSlw1",
  threatMark: "whbHuntThreatMk1",
  debateNamed: "whbHuntDebateMk1",
  preyMark: "whbHuntPreyMark1",
  livingTarget: "whbHuntLivingTg1",
  vernonPipe: "whbHuntPipeFx001",
  finalConstitution: "whbHuntWeakAnti1",
  panaceaTwitch: "whbHuntConfuse01",
  stamina: "whbHuntStamFx001",
  fuseeLight: "whbHuntFuseeFx01",
  iai: "whbHuntIaiFx0001",
  infrared: "whbHuntIrVisFx01",
  wire: "whbHuntWireFx001",
};

const SLUGS = {
  burn: "effect-hunt-burning",
  poison: "effect-hunt-poisoned",
  soul: "effect-hunt-soul-burn",
  antidote: "effect-antidote-shot",
  vitality: "vitality-shot",
  stamina: "stamina-shot",
  fusee: "hunt-fusees",
  regen: "regeneration-shot",
  poisonAmmo: "hunt-poison-ammo",
  doctor: "hunt-feat-doctor",
  ambi: "hunt-feat-ambi001",
  dauntless: "hunt-feat-dauntless",
  necro: "hunt-feat-necr001",
  vulture: "hunt-feat-vult001",
  adrenaline: "hunt-feat-adrenaline",
  martialist: "hunt-feat-martialist",
  resilience: "hunt-feat-resilience",
  iaiStance: "hunt-iai-stance",
  firstAid: "hunt-first-aid-kit",
  bloodless: "hunt-feat-bloodless",
  nitro: "nitro-express",
  bountyToken: "hunt-bounty-token",
  infrared: "effect-hunt-infrared-vision",
};

const FATIGUED_SLUG = "fatigued";
const DYING_SLUG = "dying";

const MEDICAL_HEAL_SLUGS = new Set([
  "hunt-first-aid-kit",
  "vitality-shot",
  "regeneration-shot",
  "a-strong-constitution",
  "fight-back",
  "weak-vitality-shot",
]);

/** 拌雷消耗品 slug → 危境 Actor id */
const TRIP_MINE_HAZARDS = {
  "alert-trip-mine": "whbHuntHzAlert01",
  "heavy-footfalls": "whbHuntHzAlert01",
  "concertina-trip-mine": "whbHuntHzConc001",
  "damn-footsteps": "whbHuntHzConc001",
  "poison-trip-mine": "whbHuntHzPois001",
  "toxic-footfalls": "whbHuntHzPois001",
  "bear-trap": "whbHuntHzBear001",
};

/** 布置动作 slug → 危境 + 消耗品 slug 列表 */
const TRIP_MINE_ACTIONS = {
  "flymander-heavy": {
    hazardId: "whbHuntHzAlert01",
    itemSlugs: ["heavy-footfalls", "alert-trip-mine"],
    label: "沉重的脚步声",
  },
  "red-raven-damn": {
    hazardId: "whbHuntHzConc001",
    itemSlugs: ["damn-footsteps", "concertina-trip-mine"],
    label: "该死的脚步",
  },
  "red-raven-toxic": {
    hazardId: "whbHuntHzPois001",
    itemSlugs: ["toxic-footfalls", "poison-trip-mine"],
    label: "剧毒脚步",
  },
  "emilia-trap": {
    hazardId: "whbHuntHzBear001",
    itemSlugs: ["bear-trap"],
    label: "林间陷阱",
  },
};

/** 按中文名兜底匹配（世界里旧动作可能缺 slug） */
const TRIP_MINE_NAME_RE = [
  { re: /剧毒脚步|有毒脚步|毒气拌雷|toxic\s*foot/i, key: "red-raven-toxic" },
  { re: /该死的脚步|铁丝网拌雷|damn\s*foot|concertina/i, key: "red-raven-damn" },
  { re: /沉重的?脚步|警示拌雷|警报拌雷|heavy\s*foot|alert\s*trip/i, key: "flymander-heavy" },
  { re: /熊陷阱|林间陷阱|bear\s*trap/i, key: "emilia-trap" },
];


/** Bornheim 系：装备时授予速射扳机 */
const BORNHEIM_SLUGS = new Set([
  "bornheim-no-3",
  "birthright",
  "corruptions-estate",
]);

/** Swift 系：装填后免费快步 */
const SWIFT_SLUGS = new Set([
  "winfield-m1873-swift",
  "redmartin-swift",
  "noble-execution",
  "mako-1895",
  "the-redmartin",
  "redmartin-aperture",
  "false-inheritance",
  "debates-end",
]);

/** 命中成功 → 叠灼烬 */
const BURN_ON_HIT = new Set([
  "marksmans-delight",
  "brass-flower",
  "brass-flower-punch",
  "vernon-fire-crossbow",
  "swamp-tears-firebomb",
  "fire-bomb",
  "liquid-fire-bomb",
  "hellfire-bomb",
  "chefs-kiss",
  "path-revelation-punch",
  "lemat-punch",
]);

/** 命中 → 绞索减速 */
const NOOSE_SLUGS = new Set(["the-noose", "hardin-noose"]);

/** 命中（或重击）→ 尝试惊惧提示 / 条件 */
const FEAR_ON_HIT = new Set([
  "widows-son",
  "betrayed-loyalty",
  "batters-eye",
  "empty-cairn-bayonet",
  "calyptra",
]);

/** 达姆弹等 → 流血提示（持续流血由 GM/系统处理；此处叠备注） */
const BLEED_AMMO_SLUGS = new Set(["hunt-dumdum-ammo", "dumdum"]);

/** 怪物命中施加灼烬（按 huntMonster） */
const MONSTER_BURN = new Set(["immolator", "hellborn", "butcher"]);

/** 怪物命中施加猎杀中毒 */
const MONSTER_POISON = new Set(["hive-swarm", "meathead-leech", "grunt-doctor", "hive"]);

/** 怪物 melee/action 名关键词 → 灼烬 */
const MONSTER_BURN_NAME_RE = /喷焰|熔岩|燃烧|火把|焦爪|肉钩|自燃|火球|熔溅/;

/** 怪物名关键词 → 中毒 */
const MONSTER_POISON_NAME_RE = /叮刺|叮咬|毒锯|毒蜂|水蛭/;

const ACTION_SLUGS = {
  bornheim: "hunt-bornheim-rapid",
  swiftStep: "hunt-swift-free-step",
  ambiReload: "hunt-ambi-free-reload",
  necro: "hunt-necromancer-revive",
  dauntless: "hunt-dauntless-defuse",
  bountyDarkSight: "hunt-bounty-dark-sight",
};

const BOUNTY_MAX = 5;

const syncing = new Set();
const handled = new Set();

function canManage(actor) {
  return !!actor && (actor.isOwner || game.user.isGM);
}

function findBySlug(actor, type, slug) {
  const list = actor?.itemTypes?.[type] ?? [];
  return list.find((i) => i.system?.slug === slug || i.slug === slug) ?? null;
}

function findWeaponBySlugs(actor, slugSet) {
  return (actor?.itemTypes?.weapon ?? []).find((w) => {
    if (!slugSet.has(w.system?.slug)) return false;
    const carry = w.system?.equipped?.carryType;
    // NPC 猎人常把配枪标为 worn；只要没扔掉就算可用
    return w.isEquipped || carry === "held" || carry === "worn" || carry == null;
  });
}

function roundKey() {
  return `${game.combat?.id ?? "none"}:${game.combat?.round ?? 0}:${game.combat?.turn ?? 0}`;
}

function hasRollOption(actor, option) {
  return !!(
    actor?.rollOptions?.all?.[option] ||
    actor?.flags?.pf2e?.rollOptions?.all?.[option]
  );
}

async function getPackItem(id) {
  const pack = game.packs.get(PACK);
  if (!pack) return null;
  return pack.getDocument(id);
}

async function applyCompendiumEffect(target, effectId, { rename } = {}) {
  if (!target || !canManage(target) && !game.user.isGM) return null;
  const src = await getPackItem(effectId);
  if (!src) {
    console.warn(`${MODULE_ID} | missing effect ${effectId}`);
    return null;
  }
  const data = src.toObject();
  delete data._id;
  if (rename) data.name = rename;
  const created = await Item.createDocuments([data], { parent: target, render: false });
  return created?.[0] ?? null;
}

async function removeEffectsBySlug(actor, slug) {
  const victims = actor.itemTypes.effect.filter((e) => (e.system?.slug ?? e.slug) === slug);
  if (!victims.length) return 0;
  await actor.deleteEmbeddedDocuments(
    "Item",
    victims.map((i) => i.id)
  );
  return victims.length;
}

function getBountyToken(actor) {
  return findBySlug(actor, "equipment", SLUGS.bountyToken);
}

function getBountyCharges(item) {
  const max = Number(item?.flags?.[MODULE_ID]?.bountyChargesMax ?? BOUNTY_MAX);
  const raw = item?.flags?.[MODULE_ID]?.bountyCharges;
  if (typeof raw === "number") return Math.max(0, Math.min(max, raw));
  return max;
}

async function setBountyCharges(item, value) {
  const max = Number(item.flags?.[MODULE_ID]?.bountyChargesMax ?? BOUNTY_MAX);
  const next = Math.max(0, Math.min(max, Number(value) || 0));
  await item.update({
    [`flags.${MODULE_ID}.bountyCharges`]: next,
    [`flags.${MODULE_ID}.bountyChargesMax`]: max,
  });
  return next;
}

async function applyInfraredVision(actor, { label } = {}) {
  await removeEffectsBySlug(actor, SLUGS.infrared);
  return applyCompendiumEffect(actor, EFFECT_IDS.infrared, {
    rename: label || undefined,
  });
}

async function handleBountyDarkSight(actor) {
  const tokenItem = getBountyToken(actor);
  if (!tokenItem) {
    return ui.notifications.warn("赏金令牌：身上没有赏金令牌。");
  }
  const charges = getBountyCharges(tokenItem);
  if (charges <= 0) {
    return ui.notifications.warn("赏金令牌：充能耗尽（击杀敌人可回充）。");
  }
  const left = await setBountyCharges(tokenItem, charges - 1);
  await applyInfraredVision(actor);
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<p><strong>赏金令牌 · 黑视</strong>：${actor.name} 获得红外线视觉（1 回合）。剩余充能 <strong>${left}/${BOUNTY_MAX}</strong>。</p>`,
  });
  ui.notifications.info(`赏金令牌：已启用黑视（剩余 ${left}/${BOUNTY_MAX}）。`);
}

async function restoreBountyCharge(killer, victim) {
  if (!killer || !canManage(killer)) return false;
  const tokenItem = getBountyToken(killer);
  if (!tokenItem) return false;
  const charges = getBountyCharges(tokenItem);
  if (charges >= BOUNTY_MAX) return false;
  const left = await setBountyCharges(tokenItem, charges + 1);
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: killer }),
    content: `<p><strong>赏金令牌</strong>：击杀 ${victim?.name ?? "敌人"}，充能恢复至 <strong>${left}/${BOUNTY_MAX}</strong>。</p>`,
  });
  return true;
}

async function ensureEffect(actor, effectId, slug, want) {
  const has = !!findBySlug(actor, "effect", slug);
  if (want && !has) await applyCompendiumEffect(actor, effectId);
  if (!want && has) await removeEffectsBySlug(actor, slug);
}

function getDamageTargets(message) {
  const actors = new Set();
  for (const t of game.user.targets ?? []) if (t.actor) actors.add(t.actor);
  const ctxTarget = message.flags?.pf2e?.context?.target;
  const list = Array.isArray(ctxTarget) ? ctxTarget : ctxTarget ? [ctxTarget] : [];
  return { actors, list };
}

async function resolveTargetActors(message) {
  const { actors, list } = getDamageTargets(message);
  for (const ref of list) {
    const uuid = ref?.actor ?? ref?.uuid ?? ref;
    if (!uuid || typeof uuid !== "string") continue;
    try {
      const doc = await fromUuid(uuid);
      if (doc?.actor) actors.add(doc.actor);
      else if (doc?.isOfType?.("actor")) actors.add(doc);
    } catch {
      /* ignore */
    }
  }
  return [...actors];
}

function primaryTarget(actor) {
  const t = [...(game.user.targets ?? [])][0]?.actor;
  if (t) return t;
  const tokens = canvas.tokens?.controlled ?? [];
  for (const tok of tokens) {
    if (tok.actor && tok.actor !== actor) return tok.actor;
  }
  return null;
}

function targetsInRange(originActor, feet, { enemiesOnly = true } = {}) {
  const origin = originActor.getActiveTokens?.(true, true)?.[0];
  if (!origin) return [];
  return (canvas.tokens?.placeables ?? [])
    .filter((t) => {
      if (!t.actor || t.actor === originActor) return false;
      if (enemiesOnly && t.document.disposition === origin.document.disposition) return false;
      const d = canvas.grid.measurePath([origin.center, t.center]).distance;
      return d <= feet;
    })
    .map((t) => t.actor);
}

async function rollSave(target, type, dc, traits = []) {
  const save = target.saves?.[type];
  if (!save?.roll) {
    await ChatMessage.create({
      content: `<p>${target.name} 请进行 ${type} DC ${dc}（自动化未能直接掷骰）。</p>`,
    });
    return null;
  }
  const roll = await save.roll({
    dc: { value: dc },
    skipDialog: true,
    extraRollOptions: traits.map((tr) => `trait:${tr}`),
  });
  return roll?.degreeOfSuccess ?? roll?.options?.degreeOfSuccess ?? null;
}

async function applyPF2eCondition(actor, slug, value = 1) {
  if (!actor) return;
  try {
    if (typeof actor.increaseCondition === "function") {
      await actor.increaseCondition(slug, { min: value, max: value });
      return;
    }
    if (typeof actor.toggleCondition === "function") {
      await actor.toggleCondition(slug, { active: true });
    }
  } catch (err) {
    console.warn(`${MODULE_ID} | condition ${slug}`, err);
  }
}

/** 叠层：同 slug 效果再施加时改为 +1 层 */
function installStackingHook() {
  Hooks.on("preCreateItem", (item, data) => {
    if (item.type !== "effect" || !item.parent?.isOfType?.("character", "npc", "familiar")) return;
    const slug = data.system?.slug ?? item.system?.slug;
    const stackable = [SLUGS.burn, SLUGS.poison, SLUGS.soul];
    if (!stackable.includes(slug)) return;

    const existing = item.parent.itemTypes.effect.find((e) => (e.system?.slug ?? e.slug) === slug);
    if (!existing) return;

    const add = Math.max(1, Number(data.system?.badge?.value ?? 1));
    const cur = Number(existing.system?.badge?.value ?? 1);
    const max = Number(existing.system?.badge?.max ?? 6);
    const next = Math.min(max, cur + add);
    existing.update({ "system.badge.value": next }).catch(console.error);
    ui.notifications?.info?.(`${existing.name} 叠至 ${next} 层`);
    return false;
  });
}

function installPoisonTick() {
  Hooks.on("pf2e.endTurn", async (combatant) => {
    const actor = combatant?.actor;
    if (!canManage(actor)) return;
    const poison = findBySlug(actor, "effect", SLUGS.poison);
    if (!poison) return;
    const v = Number(poison.system.badge?.value ?? 1) - 1;
    if (v <= 0) {
      await poison.delete();
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `<p><strong>猎杀中毒</strong>：${actor.name} 的毒素已消退。</p>`,
      });
    } else {
      await poison.update({ "system.badge.value": v });
    }
  });
}

function installMedicalHooks() {
  Hooks.on("createItem", async (item) => {
    if (item.type !== "effect" || !canManage(item.parent)) return;
    const slug = item.system?.slug;
    const actor = item.parent;
    if (slug === SLUGS.antidote || slug === "effect-final-constitution") {
      const poison = findBySlug(actor, "effect", SLUGS.poison);
      if (poison) await poison.delete();
    }
  });

  Hooks.on("createChatMessage", async (message) => {
    if (message.author?.id !== game.user.id) return;
    const item = message.item;
    const actor = message.actor;
    if (!item || !canManage(actor)) return;
    const slug = item.system?.slug;

    if (slug === SLUGS.vitality && actor) {
      await removeEffectsBySlug(actor, SLUGS.burn);
    }

    if (slug === SLUGS.stamina && actor) {
      const fatigued = actor.itemTypes.condition?.find(
        (c) => (c.system?.slug ?? c.slug) === FATIGUED_SLUG
      );
      if (fatigued) {
        await fatigued.delete().catch(() => {});
      } else if (typeof actor.decreaseCondition === "function") {
        await actor.decreaseCondition(FATIGUED_SLUG).catch(() => {});
      }
      await removeEffectsBySlug(actor, "effect-stamina-shot");
      await applyCompendiumEffect(actor, EFFECT_IDS.stamina);
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content:
          "<p><strong>耐力针</strong>：已移除疲乏，并施加迅捷（1 分钟；额外动作仅限行走/打击）。</p>",
      });
    }

    if (slug === SLUGS.fusee && actor) {
      await removeEffectsBySlug(actor, "effect-fusee-light");
      await applyCompendiumEffect(actor, EFFECT_IDS.fuseeLight);
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content:
          "<p><strong>照明棒</strong>：已点燃（亮光 20 / 微光 40，约 10 分钟）。投掷落点请 GM 手动开灯。</p>",
      });
    }

    if (slug === "final-constitution" || slug === "antidote-shot") {
      await removeEffectsBySlug(actor, SLUGS.poison);
      if (slug === "final-constitution") {
        await applyCompendiumEffect(actor, EFFECT_IDS.finalConstitution);
      } else {
        await applyCompendiumEffect(actor, EFFECT_IDS.antidote);
      }
    }

    if (slug === "choke-bomb") {
      for (const t of canvas.tokens?.controlled ?? []) {
        const a = t.actor;
        if (!a) continue;
        await removeEffectsBySlug(a, SLUGS.burn);
        for (const e of a.itemTypes.effect.filter((x) => /blaze|火场|灼/.test(x.name ?? ""))) {
          await e.delete().catch(() => {});
        }
      }
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content:
          "<p><strong>窒息炸弹</strong>：已对选中令牌清除灼烬/火场标记（请先选中云内目标）。豁免请按物品说明手动检定。</p>",
      });
    }

    if ((slug === SLUGS.martialist || slug === SLUGS.iaiStance) && actor) {
      await removeEffectsBySlug(actor, "effect-hunt-iai");
      await applyCompendiumEffect(actor, EFFECT_IDS.iai);
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: "<p><strong>居合架势</strong>：请选择一把武器；下一次以该武器打击 +1d6 精准。</p>",
      });
    }

    if (slug === SLUGS.firstAid && actor) {
      const target =
        Array.from(game.user.targets ?? [])
          .map((t) => t.actor)
          .find(Boolean) ?? actor;
      if (canManage(target)) {
        const bleeds = target.itemTypes.condition.filter(
          (c) =>
            (c.system?.slug ?? c.slug) === "persistent-damage" &&
            /bleed/i.test(c.system?.persistent?.damageType ?? c.name ?? "")
        );
        if (bleeds.length) {
          await target.deleteEmbeddedDocuments(
            "Item",
            bleeds.map((b) => b.id)
          );
        }
      }
    }
  });
}

function actorHasFeatSlug(actor, slug) {
  return !!(actor?.itemTypes?.feat ?? []).find((f) => (f.system?.slug ?? f.slug) === slug);
}

function installPhiloTraitHooks() {
  Hooks.on("createItem", async (item) => {
    if (item.type !== "condition") return;
    const actor = item.parent;
    if (!canManage(actor)) return;
    if ((item.system?.slug ?? item.slug) !== DYING_SLUG) return;
    if (!actorHasFeatSlug(actor, SLUGS.adrenaline)) return;
    const lvl = actor.level ?? actor.system?.details?.level?.value ?? 1;
    const key = `adrn:${actor.uuid}:${roundKey()}`;
    if (handled.has(key)) return;
    handled.add(key);
    try {
      if (typeof actor.applyTemporaryHitPoints === "function") {
        await actor.applyTemporaryHitPoints({ amount: lvl, src: "肾上腺素" });
      } else {
        const cur = actor.hitPoints?.temp ?? actor.system?.attributes?.hp?.temp ?? 0;
        if (lvl > cur) {
          await actor.update({ "system.attributes.hp.temp": lvl });
        }
      }
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `<p><strong>肾上腺素</strong>：${actor.name} 获得 ${lvl} 临时生命值，并可立即快步（反应）。</p>`,
      });
    } catch (err) {
      console.warn(`${MODULE_ID} | adrenaline`, err);
    }
  });

  Hooks.on("deleteItem", async (item) => {
    if (item.type !== "condition") return;
    const actor = item.parent;
    if (!canManage(actor)) return;
    if ((item.system?.slug ?? item.slug) !== DYING_SLUG) return;
    if (!actorHasFeatSlug(actor, SLUGS.resilience)) return;
    if ((actor.hitPoints?.value ?? 0) <= 0 && (actor.system?.attributes?.hp?.value ?? 0) <= 0) {
      // still at 0 — wait for heal; apply after a tick if HP becomes positive
    }
    const max = actor.hitPoints?.max ?? actor.system?.attributes?.hp?.max ?? 0;
    const half = Math.ceil(max / 2);
    const cur = actor.hitPoints?.value ?? actor.system?.attributes?.hp?.value ?? 0;
    if (max <= 0) return;
    if (cur >= half) return;
    // If still 0 HP after dying removed, stabilize path often sets to 1; bump to half.
    const key = `resil:${actor.uuid}:${roundKey()}`;
    if (handled.has(key)) return;
    handled.add(key);
    try {
      const next = Math.max(cur, half);
      await actor.update({ "system.attributes.hp.value": next });
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `<p><strong>韧性</strong>：${actor.name} 从濒死被救起，生命值调整至至少一半（${next}/${max}）。</p>`,
      });
    } catch (err) {
      console.warn(`${MODULE_ID} | resilience`, err);
    }
  });

  Hooks.on("pf2e.damageRoll", async (rollData) => {
    try {
      const actor = rollData?.actor ?? rollData?.origin?.actor;
      if (!actor || !canManage(actor)) return;
      const iai = findBySlug(actor, "effect", "effect-hunt-iai");
      if (!iai) return;
      const item = rollData?.item ?? rollData?.origin?.item;
      if (!item) return;
      const selected =
        iai.flags?.pf2e?.rulesSelections?.huntIaiWeapon ??
        actor.flags?.pf2e?.rulesSelections?.huntIaiWeapon;
      if (selected && item.id !== selected && item.sourceId !== selected) {
        // selection may be UUID or id
        const sel = String(selected);
        if (item.id !== sel && !sel.includes(item.id) && item.uuid !== sel) return;
      }
      await iai.delete().catch(() => {});
    } catch (err) {
      console.warn(`${MODULE_ID} | iai clear`, err);
    }
  });
}

function makeAction({ slug, name, actions, actionType, description, img }) {
  return {
    name,
    type: "action",
    img: img ?? "systems/pf2e/icons/actions/OneAction.webp",
    system: {
      slug,
      description: { value: description },
      actionType: { value: actionType },
      actions: { value: actions },
      category: "offensive",
      traits: { value: [], rarity: "uncommon", otherTags: ["hunt-showdown"] },
      rules: [],
    },
    flags: { [MODULE_ID]: { [FLAG]: true, huntGrantedAction: slug } },
  };
}

async function syncGrantedActions(actor) {
  if (!canManage(actor) || !actor.isOfType?.("character", "npc")) return;
  const key = actor.uuid ?? actor.id;
  if (syncing.has(key)) return;
  syncing.add(key);
  try {
    const want = new Map();
    const bornheim = findWeaponBySlugs(actor, BORNHEIM_SLUGS);
    if (bornheim) {
      want.set(
        ACTION_SLUGS.bornheim,
        makeAction({
          slug: ACTION_SLUGS.bornheim,
          name: "Bornheim · 速射扳机",
          actions: 1,
          actionType: "action",
          description:
            "<p>进行两次 Bornheim 系打击：各 −3 环境减值，共享当前 MAP（自动结算）。兼容天赋权利 / 腐败庄园。</p>",
        })
      );
    }

    if (findBySlug(actor, "feat", SLUGS.ambi)) {
      want.set(
        ACTION_SLUGS.ambiReload,
        makeAction({
          slug: ACTION_SLUGS.ambiReload,
          name: "双持精通 · 免费装填",
          actions: null,
          actionType: "free",
          img: "systems/pf2e/icons/actions/FreeAction.webp",
          description:
            "<p>每轮一次：免费完成一次装填（需双手各持武器或半自动手枪）。</p>",
        })
      );
    }

    if (findBySlug(actor, "feat", SLUGS.necro)) {
      want.set(
        ACTION_SLUGS.necro,
        makeAction({
          slug: ACTION_SLUGS.necro,
          name: "死灵法师 · 暗视苏生",
          actions: 1,
          actionType: "action",
          description:
            "<p>每日 1 次：30 尺内濒死盟友。自动尝试宗教/奥秘 DC 15（取高熟练），成功则目标 HP=1 并清除濒死。</p>",
        })
      );
    }

    if (findBySlug(actor, "feat", SLUGS.dauntless)) {
      want.set(
        ACTION_SLUGS.dauntless,
        makeAction({
          slug: ACTION_SLUGS.dauntless,
          name: "无畏 · 拆引信",
          actions: 1,
          actionType: "action",
          description: "<p>拆除 10 尺内带引信的未爆物/黏性炸弹效果。</p>",
        })
      );
    }

    const bounty = getBountyToken(actor);
    if (bounty) {
      const ch = getBountyCharges(bounty);
      want.set(
        ACTION_SLUGS.bountyDarkSight,
        makeAction({
          slug: ACTION_SLUGS.bountyDarkSight,
          name: `赏金令牌 · 启用黑视（${ch}/${BOUNTY_MAX}）`,
          actions: null,
          actionType: "free",
          img: "systems/pf2e/icons/actions/FreeAction.webp",
          description: `<p>自由动作：消耗 1 点充能，获得红外线视觉 1 回合。当前充能 ${ch}/${BOUNTY_MAX}。击杀敌人可回充（上限 ${BOUNTY_MAX}）。</p>`,
        })
      );
    }

    const existing = actor.itemTypes.action.filter((a) => a.flags?.[MODULE_ID]?.huntGrantedAction);
    const toDelete = [];
    const have = new Set();
    for (const a of existing) {
      const s = a.flags[MODULE_ID].huntGrantedAction;
      if (!want.has(s) && s !== ACTION_SLUGS.swiftStep) toDelete.push(a.id);
      else have.add(s);
    }
    if (toDelete.length) await actor.deleteEmbeddedDocuments("Item", toDelete);

    const toCreate = [];
    for (const [slug, data] of want) {
      if (have.has(slug)) {
        if (slug === ACTION_SLUGS.bountyDarkSight) {
          const cur = existing.find((a) => a.flags?.[MODULE_ID]?.huntGrantedAction === slug);
          if (cur && cur.name !== data.name) {
            await cur.update({
              name: data.name,
              "system.description.value": data.system.description.value,
            });
          }
        }
        continue;
      }
      toCreate.push(data);
    }
    if (toCreate.length) {
      await Item.createDocuments(toCreate, { parent: actor, render: false });
    }

    await syncFormEffects(actor);
  } finally {
    syncing.delete(key);
  }
}

async function syncFormEffects(actor) {
  if (!actor) return;
  // 多萝西：RollOption 或已有切换动作
  const hasDorothy =
    findBySlug(actor, "action", "dorothy-form-tracker") ||
    findBySlug(actor, "action", "dorothy-form-swap") ||
    actor.flags?.[MODULE_ID]?.huntHunter === "dorothy-alice";
  if (hasDorothy) {
    await ensureEffect(
      actor,
      EFFECT_IDS.dorothyNightmare,
      "effect-dorothy-nightmare",
      hasRollOption(actor, "dorothy-form-nightmare")
    );
  }

  const hasFool =
    findBySlug(actor, "action", "fool-form-switch") ||
    actor.flags?.[MODULE_ID]?.huntHunter === "the-fool";
  if (hasFool) {
    await ensureEffect(
      actor,
      EFFECT_IDS.foolFugitive,
      "effect-fool-fugitive",
      hasRollOption(actor, "fool-form-fugitive")
    );
  }
}

async function grantSwiftStep(actor) {
  if (!canManage(actor)) return;
  const existing = actor.itemTypes.action.find(
    (a) => a.flags?.[MODULE_ID]?.huntGrantedAction === ACTION_SLUGS.swiftStep
  );
  if (existing) return;
  await Item.createDocuments(
    [
      makeAction({
        slug: ACTION_SLUGS.swiftStep,
        name: "Swift · 免费快步",
        actions: null,
        actionType: "free",
        img: "systems/pf2e/icons/actions/FreeAction.webp",
        description: "<p>装填后获得：不消耗动作移动 5 尺（快步）。使用后自动消失。</p>",
      }),
    ],
    { parent: actor, render: false }
  );
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<p><strong>快速循环</strong>：${actor.name} 获得一次免费快步（动作栏）。</p>`,
  });
}

function makeCircumstanceMod(label, value, slug) {
  const Mod =
    game.pf2e?.Modifier?.Modifier ??
    game.pf2e?.Modifier?.ModifierPF2e ??
    CONFIG.PF2E?.Modifier;
  if (!Mod) return null;
  return new Mod({ label, modifier: value, type: "circumstance", slug });
}

async function handleBornheimRapid(actor) {
  const weapon = findWeaponBySlugs(actor, BORNHEIM_SLUGS);
  if (!weapon) {
    ui.notifications.warn("未装备 Bornheim 系武器（含天赋权利/腐败庄园）");
    return;
  }
  const strike = actor.system?.actions?.find(
    (a) => a.item?.id === weapon.id || a.slug === weapon.system?.slug
  );
  const mod = makeCircumstanceMod("速射扳机", -3, "hunt-bornheim-rapid");
  const rollOpts = { skipDialog: true, consumeAmmo: true };
  if (mod) rollOpts.modifiers = [mod];

  try {
    if (strike?.variants?.[0]?.roll) {
      await strike.variants[0].roll(rollOpts);
      await strike.variants[0].roll(rollOpts);
      return;
    }
    if (typeof strike?.attack === "function") {
      await strike.attack(rollOpts);
      await strike.attack(rollOpts);
      return;
    }
  } catch (err) {
    console.warn(`${MODULE_ID} | Bornheim rapid failed`, err);
  }
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content:
      "<p><strong>速射扳机</strong>：请立即进行两次打击（各 −3 环境，共享当前 MAP）。</p>",
  });
}

async function handleDoubleStrike(actor, meleeSlug, label) {
  const melee = findBySlug(actor, "melee", meleeSlug) || findBySlug(actor, "weapon", meleeSlug);
  const strike = actor.system?.actions?.find(
    (a) => a.slug === meleeSlug || a.item?.id === melee?.id || a.label === melee?.name
  );
  const mod = makeCircumstanceMod(label, -3, `hunt-double-${meleeSlug}`);
  const rollOpts = { skipDialog: true };
  if (mod) rollOpts.modifiers = [mod];
  try {
    if (strike?.variants?.[0]?.roll) {
      await strike.variants[0].roll(rollOpts);
      await strike.variants[0].roll(rollOpts);
      return;
    }
  } catch (err) {
    console.warn(err);
  }
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<p><strong>${label}</strong>：请进行两次打击（各 −3，共享 MAP）。</p>`,
  });
}

async function handleNecromancer(actor) {
  const day = Math.floor((game.time?.worldTime ?? 0) / 86400);
  if (actor.getFlag(MODULE_ID, `${FLAG}.necroDay`) === day) {
    ui.notifications.warn("死灵法师今日已使用");
    return;
  }
  const tokens = canvas.tokens?.controlled?.length
    ? canvas.tokens.controlled
    : actor.getActiveTokens?.(true, true) ?? [];
  const origin = tokens[0];
  const allies =
    canvas.tokens?.placeables?.filter((t) => {
      if (!t.actor || t.actor === actor) return false;
      if (!t.actor.hasCondition?.("dying")) return false;
      if (!origin) return true;
      const d = canvas.grid.measurePath([origin.center, t.center]).distance;
      return d <= 30;
    }) ?? [];

  let target = allies[0]?.actor;
  if (!target && actor.hasCondition?.("dying")) target = actor;
  if (!target) {
    ui.notifications.warn("30 尺内没有濒死盟友");
    return;
  }

  const skill =
    (actor.skills?.religion?.rank ?? -1) >= (actor.skills?.arcana?.rank ?? -1)
      ? actor.skills.religion
      : actor.skills.arcana;
  const dc = target === actor ? 17 : 15;
  const roll = await skill.roll({ dc: { value: dc }, skipDialog: true });
  const dos = roll?.degreeOfSuccess ?? roll?.options?.degreeOfSuccess;
  await actor.setFlag(MODULE_ID, `${FLAG}.necroDay`, day);

  if (dos >= 2) {
    const dying = target.getCondition?.("dying");
    if (dying) await target.toggleCondition?.("dying", { forceRemove: true });
    await target.update({ "system.attributes.hp.value": 1 });
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><strong>暗视苏生</strong>成功：${target.name} 恢复至 1 HP。</p>`,
    });
  } else {
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><strong>暗视苏生</strong>未成功。</p>`,
    });
  }
}

async function handleDauntless(actor) {
  const tokens = actor.getActiveTokens?.(true, true) ?? [];
  const origin = tokens[0];
  const fuseSlugs = ["effect-sticky-bomb", "effect-hunt-sticky", "whbHuntStkFx0001"];
  let removed = 0;
  for (const t of canvas.tokens?.placeables ?? []) {
    if (!t.actor) continue;
    if (origin) {
      const d = canvas.grid.measurePath([origin.center, t.center]).distance;
      if (d > 10) continue;
    }
    const victims = t.actor.itemTypes.effect.filter(
      (e) =>
        fuseSlugs.includes(e.system?.slug) ||
        fuseSlugs.includes(e.id) ||
        /sticky|引信|延时|炸弹/.test(e.name ?? "")
    );
    if (victims.length) {
      await t.actor.deleteEmbeddedDocuments(
        "Item",
        victims.map((i) => i.id)
      );
      removed += victims.length;
    }
  }
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<p><strong>无畏 · 拆引信</strong>：移除了 ${removed} 个延时/引信效果（10 尺内）。</p>`,
  });
}

async function handleSwiftStep(actor, actionItem) {
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<p><strong>快速循环</strong>：${actor.name} 进行免费快步（5 尺）。请在地图上移动令牌。</p>`,
  });
  if (actionItem) await actionItem.delete();
}

async function handleAmbiReload(actor) {
  const key = `${FLAG}.ambi:${roundKey()}:${actor.id}`;
  if (actor.getFlag(MODULE_ID, key)) {
    ui.notifications.warn("本轮已使用双持精通免费装填");
    return;
  }
  await actor.setFlag(MODULE_ID, key, true);
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<p><strong>双持精通</strong>：本次装填视为<strong>自由动作</strong>。</p>`,
  });
}

/* ---------- 双形态切换 ---------- */
async function handleDorothySwap(actor) {
  const nightmare = !!findBySlug(actor, "effect", "effect-dorothy-nightmare");
  if (nightmare) {
    await removeEffectsBySlug(actor, "effect-dorothy-nightmare");
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><strong>形态切换</strong>：${actor.name} → <em>美梦</em>。请自行更换 token。</p>`,
    });
  } else {
    await applyCompendiumEffect(actor, EFFECT_IDS.dorothyNightmare);
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><strong>形态切换</strong>：${actor.name} → <em>噩梦</em>。请自行更换 token。</p>`,
    });
  }
}

async function handleFoolSwap(actor) {
  const fugitive = !!findBySlug(actor, "effect", "effect-fool-fugitive");
  if (fugitive) {
    await removeEffectsBySlug(actor, "effect-fool-fugitive");
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><strong>双相</strong>：${actor.name} → <em>亡命徒 Outlaw</em>。请自行更换 token。</p>`,
    });
  } else {
    await applyCompendiumEffect(actor, EFFECT_IDS.foolFugitive);
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><strong>双相</strong>：${actor.name} → <em>逃犯 Fugitive</em>。请自行更换 token。</p>`,
    });
  }
}

/* ---------- 招牌动作 ---------- */
async function handleHardinMarkThreat(actor) {
  const target = primaryTarget(actor);
  if (!target) return ui.notifications.warn("请先选中威胁目标");
  for (const a of game.actors) {
    await removeEffectsBySlug(a, "effect-hunt-threat-mark").catch(() => {});
  }
  // 只清场景令牌上的更稳妥
  for (const t of canvas.tokens?.placeables ?? []) {
    if (t.actor) await removeEffectsBySlug(t.actor, "effect-hunt-threat-mark").catch(() => {});
  }
  await applyCompendiumEffect(target, EFFECT_IDS.threatMark);
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<p><strong>点名威胁</strong>：${target.name} 被标记。恐吓 +2；和平缔造者视为消除威胁。</p>`,
  });
}

async function handleHardinRearrest(actor) {
  const target = primaryTarget(actor);
  if (!target) return ui.notifications.warn("请选中邻接目标");
  const will = await rollSave(target, "will", 21, ["mental", "auditory"]);
  if (will === null) return;
  if (will >= 2) {
    await ChatMessage.create({
      content: `<p><strong>重新逮捕</strong>：${target.name} 意志成功，未被铐住。</p>`,
    });
    return;
  }
  const upgrade =
    findBySlug(target, "effect", "effect-hunt-threat-mark") ||
    target.hasCondition?.("frightened") ||
    /囚犯|猎人|prisoner/i.test(target.name ?? "");
  if (upgrade || will <= 0) {
    await applyPF2eCondition(target, "restrained");
    await ChatMessage.create({
      content: `<p><strong>重新逮捕</strong>：${target.name} 被<strong>束缚</strong>。</p>`,
    });
  } else {
    await applyPF2eCondition(target, "grabbed");
    await ChatMessage.create({
      content: `<p><strong>重新逮捕</strong>：${target.name} 被<strong>擒抱</strong>。</p>`,
    });
  }
}

async function handleHardinQuarantine(actor) {
  const key = `${FLAG}.quarantine:${actor.id}:${game.combat?.id ?? "x"}`;
  if (actor.getFlag(MODULE_ID, key)) {
    return ui.notifications.warn("本场已使用疫情封锁令");
  }
  await actor.setFlag(MODULE_ID, key, true);
  const victims = targetsInRange(actor, 15);
  for (const t of victims) {
    const dos = await rollSave(t, "will", 20, ["auditory", "fear", "mental"]);
    if (dos === null) continue;
    if (dos <= 0) await applyPF2eCondition(t, "frightened", 2);
    else if (dos === 1) await applyPF2eCondition(t, "frightened", 1);
  }
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<p><strong>疫情封锁令</strong>：15 尺内 ${victims.length} 名敌人已结算意志 DC 20（失败惊惧，速度减半请手裁）。</p>`,
  });
}

async function handleFoolPanacea(actor) {
  const key = `${FLAG}.panacea:${actor.id}:${game.combat?.id ?? "x"}`;
  if (actor.getFlag(MODULE_ID, key)) return ui.notifications.warn("本场已使用万能药");
  await actor.setFlag(MODULE_ID, key, true);
  let victims = [...(game.user.targets ?? [])].map((t) => t.actor).filter(Boolean);
  if (!victims.length) victims = targetsInRange(actor, 15);
  for (const t of victims) {
    const dos = await rollSave(t, "will", 21, ["mental", "poison"]);
    if (dos === null) continue;
    if (dos <= 1) {
      await applyPF2eCondition(t, "confused");
      await applyCompendiumEffect(t, EFFECT_IDS.panaceaTwitch);
    }
    if (dos <= 0) await applyPF2eCondition(t, "frightened", 1);
  }
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<p><strong>神奇万能药</strong>：已对 ${victims.length} 个目标结算意志 DC 21。</p>`,
  });
}

async function handleFoolGrin(actor) {
  const target = primaryTarget(actor);
  if (!target) return ui.notifications.warn("请选中能看见你的目标");
  const dos = await rollSave(target, "will", 20, ["emotion", "fear", "mental", "visual"]);
  if (dos === null) return;
  if (dos <= 0) await applyPF2eCondition(target, "frightened", 2);
  else if (dos === 1) await applyPF2eCondition(target, "frightened", 1);
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<p><strong>惩罚性笑容</strong>：${target.name} 意志结算完毕。</p>`,
  });
}

async function handleFoolUncatchable(actor) {
  const key = `${FLAG}.uncatch:${actor.id}:${game.combat?.id ?? "x"}`;
  if (actor.getFlag(MODULE_ID, key)) return ui.notifications.warn("本场已使用逃脱");
  await actor.setFlag(MODULE_ID, key, true);
  const skill =
    (actor.skills?.acrobatics?.rank ?? 0) >= (actor.skills?.athletics?.rank ?? 0)
      ? actor.skills.acrobatics
      : actor.skills.athletics;
  const mod = makeCircumstanceMod("没人能抓住他", 2, "hunt-uncatchable");
  const roll = await skill?.roll?.({
    skipDialog: true,
    modifiers: mod ? [mod] : [],
  });
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<p><strong>没人能抓住他</strong>：逃脱检定 +2 已掷。成功则快步 10 尺且不引发该触发者借机（请移动令牌）。</p>`,
  });
  return roll;
}

async function handleStatesmanPatron(actor) {
  const target = primaryTarget(actor);
  if (!target) return ui.notifications.warn("请选中目标");
  for (const t of canvas.tokens?.placeables ?? []) {
    if (t.actor) await removeEffectsBySlug(t.actor, "effect-debate-named").catch(() => {});
  }
  await applyCompendiumEffect(target, EFFECT_IDS.debateNamed);
  await applyCompendiumEffect(target, EFFECT_IDS.threatMark);
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<p><strong>点名发言</strong>：${target.name} 被点名。辩论结束条件满足；盟友下次对其攻击 +1（手裁或开关）。</p>`,
  });
}

async function handleStatesmanStonewall(actor) {
  const target = primaryTarget(actor);
  if (!target) {
    await ChatMessage.create({
      content: `<p><strong>石墙谈判</strong>：本场首次交涉/恐吓请打开「石墙者 — 本场首次发言」开关（+2）。</p>`,
    });
    return;
  }
  const dos = await rollSave(target, "will", 21, ["mental"]);
  if (dos !== null && dos <= 1) await applyPF2eCondition(target, "frightened", 1);
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<p><strong>沉默施压</strong>：${target.name} 已结算意志 DC 21。</p>`,
  });
}

async function handleStatesmanConstitution(actor) {
  await removeEffectsBySlug(actor, SLUGS.poison);
  await applyCompendiumEffect(actor, EFFECT_IDS.finalConstitution);
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<p><strong>最终宪法</strong>：已清除猎杀中毒，并获得毒素抗性 5（1 分钟）。</p>`,
  });
}

async function handleVernonPipe(actor) {
  const key = `${FLAG}.pipe:${actor.id}:${game.combat?.id ?? "x"}`;
  if (actor.getFlag(MODULE_ID, key)) return ui.notifications.warn("本场已烟斗硬扛");
  await actor.setFlag(MODULE_ID, key, true);
  await applyCompendiumEffect(actor, EFFECT_IDS.vernonPipe);
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<p><strong>烟斗硬扛</strong>：火焰抗性 5 + 下次豁免 +1（1 分钟）。</p>`,
  });
}

async function handleVernonSwamp(actor) {
  const targets = [...(game.user.targets ?? [])].map((t) => t.actor).filter(Boolean);
  if (!targets.length) return ui.notifications.warn("请选中火瓶落点上的目标");
  for (const t of targets) {
    await applyCompendiumEffect(t, EFFECT_IDS.burn);
  }
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<p><strong>沼泽之泪</strong>：已对目标叠灼烬。请另结算 1d6 火焰与火场（5 尺 / 3 轮）。</p>`,
  });
}

async function handleEmiliaMark(actor) {
  const target = primaryTarget(actor);
  if (!target) return ui.notifications.warn("请选中猎物");
  for (const t of canvas.tokens?.placeables ?? []) {
    if (t.actor) await removeEffectsBySlug(t.actor, "effect-emilia-prey").catch(() => {});
  }
  await applyCompendiumEffect(target, EFFECT_IDS.preyMark);
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<p><strong>猎物印记</strong>：${target.name} 被标记。</p>`,
  });
}

async function handleRedhillTarget(actor) {
  await applyCompendiumEffect(actor, EFFECT_IDS.livingTarget);
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<p><strong>活靶子</strong>：${actor.name} AC −1，嘲讽开启。请优先打他。</p>`,
  });
}

async function handleWhitlawCourt(actor) {
  const key = `${FLAG}.court:${actor.id}:${game.combat?.id ?? "x"}`;
  if (actor.getFlag(MODULE_ID, key)) return ui.notifications.warn("本场已战场军法");
  await actor.setFlag(MODULE_ID, key, true);
  const target = primaryTarget(actor);
  if (!target) return ui.notifications.warn("请选中逃兵/罪犯");
  const dos = await rollSave(target, "will", 24, ["emotion", "fear", "mental", "auditory"]);
  if (dos !== null && dos <= 1) await applyPF2eCondition(target, "frightened", 2);
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<p><strong>战场军法</strong>：${target.name} 已结算。可 Stride 并对其发动正当程序打击。</p>`,
  });
}

async function handleGigglesCurtain(actor) {
  const target = primaryTarget(actor);
  if (!target) return ui.notifications.warn("请选中目标");
  const intim = actor.skills?.intimidation;
  if (intim?.roll) {
    await intim.roll({ skipDialog: true });
  }
  await applyPF2eCondition(target, "frightened", 1);
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<p><strong>落幕恐吓</strong>：已对 ${target.name} 尝试恐吓并施加惊惧 1（请对照豁免结果调整）。</p>`,
  });
}

async function handleGigglesMisdirect(actor) {
  const target = primaryTarget(actor);
  if (!target) return ui.notifications.warn("请选中目标");
  await applyPF2eCondition(target, "off-guard");
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<p><strong>马戏障眼</strong>：${target.name} 获得措手不及（若规则允许）。</p>`,
  });
}

const HUNTER_ACTION_HANDLERS = {
  "dorothy-form-swap": handleDorothySwap,
  "fool-form-switch": handleFoolSwap,
  "hardin-mark-threat": handleHardinMarkThreat,
  "hardin-rearrest": handleHardinRearrest,
  "hardin-quarantine": handleHardinQuarantine,
  "fool-panacea": handleFoolPanacea,
  "fool-grin": handleFoolGrin,
  "fool-uncatchable": handleFoolUncatchable,
  "statesman-patron": handleStatesmanPatron,
  "statesman-stonewall": handleStatesmanStonewall,
  "statesman-constitution": handleStatesmanConstitution,
  "vernon-pipe": handleVernonPipe,
  "vernon-swamp-tears": handleVernonSwamp,
  "emilia-mark-prey": handleEmiliaMark,
  "emilia-twin-fang": (a) => handleDoubleStrike(a, "emilia-dual-pax", "双牙齐射"),
  "redhill-target": handleRedhillTarget,
  "whitlaw-court": handleWhitlawCourt,
  "whitlaw-double": (a) => handleDoubleStrike(a, "whitlaw-freedom", "自由连射"),
  "riggins-both": (a) => handleDoubleStrike(a, "riggins-poetic", "双管齐射"),
  "giggles-rapid": handleBornheimRapid,
  "giggles-curtain": handleGigglesCurtain,
  "giggles-misdirect": handleGigglesMisdirect,
  "edward-burst": (a) => handleDoubleStrike(a, "edward-thats-life", "无情连射"),
  "edward-fight-back": async (actor) => {
    const src = await getPackItem("whbHuntFightBk01");
    if (src) {
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `<p><strong>奋起反击</strong>：请使用物品栏中的奋起反击针，或手动结算治疗 + 再生效果。</p>`,
      });
    }
    const half = Number(actor.system?.attributes?.hp?.max ?? 0) / 2;
    const hp = Number(actor.system?.attributes?.hp?.value ?? 0);
    if (hp <= half) {
      await ChatMessage.create({
        content: `<p>半血以下：另得 10 临时生命值（请手动加）。</p>`,
      });
    }
  },
  "dr-rosewater": async (actor) => {
    const shot = findBySlug(actor, "consumable", SLUGS.stamina);
    try {
      if (typeof actor.decreaseCondition === "function") await actor.decreaseCondition(FATIGUED_SLUG, { forceRemove: true });
      else if (typeof actor.toggleCondition === "function") await actor.toggleCondition(FATIGUED_SLUG, { active: false });
    } catch {
      /* ignore */
    }
    if (shot) {
      await removeEffectsBySlug(actor, "effect-stamina-shot");
      await applyCompendiumEffect(actor, EFFECT_IDS.stamina);
      const qty = Number(shot.system?.quantity ?? 1);
      if (qty > 1) await shot.update({ "system.quantity": qty - 1 });
      else if (shot.system?.uses) {
        const left = Math.max(0, Number(shot.system.uses.value ?? 1) - 1);
        if (left <= 0 && shot.system.uses.autoDestroy) await shot.delete();
        else await shot.update({ "system.uses.value": left });
      } else await shot.delete().catch(() => {});
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `<p><strong>玫瑰水提神</strong>：已尝试清除疲乏并施加耐力针效果。</p>`,
      });
    } else {
      await applyCompendiumEffect(actor, EFFECT_IDS.stamina);
      await ChatMessage.create({
        content: `<p><strong>玫瑰水</strong>：无耐力针物品，仍施加耐力效果（GM 可扣消耗）。</p>`,
      });
    }
  },
  "dr-trick-shot": async (actor) => {
    await handleBornheimRapid(actor);
  },
  "ms-moth-doom": async (actor) => {
    const target = primaryTarget(actor);
    if (!target) return ui.notifications.warn("请选中飞蛾之刑目标");
    const dos = await rollSave(target, "will", 22, ["emotion", "fear", "mental", "occult", "visual"]);
    if (dos !== null && dos <= 1) {
      await applyPF2eCondition(target, "frightened", dos <= 0 ? 2 : 1);
      await applyPF2eCondition(target, "off-guard");
    }
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><strong>飞蛾之刑</strong>：已对 ${target.name} 结算意志 DC 22。</p>`,
    });
  },
  "ms-devouring-light": async (actor) => {
    const target = primaryTarget(actor);
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><strong>吞噬之光</strong>：对本场 1 次 Auto-5 打击；若目标惊惧/飞蛾，额外火焰并叠灼烬。请手动完成打击。</p>`,
    });
    if (target) await applyCompendiumEffect(target, EFFECT_IDS.burn);
  },
  "ms-nightfall": async (actor) => {
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><strong>夜幕降临</strong>：黑暗中手弩打击视为隐蔽，命中后可免费快步 5 尺。</p>`,
    });
    await grantSwiftStep(actor);
  },
  "jv-pierce-black-heart": async (actor) => {
    const target = primaryTarget(actor);
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><strong>刺穿黑心</strong>：下次刺刀/步枪打击 +2；命中额外 2d6 心灵 + 1d4 持续心灵。请手动完成打击。</p>`,
    });
    if (target) {
      await ChatMessage.create({
        content: `<p>目标 ${target.name}：命中后请结算心灵伤害。</p>`,
      });
    }
  },
  "cook-broth": async (actor) => {
    const allies = targetsInRange(actor, 30, { enemiesOnly: false }).filter(
      (a) => a !== actor
    );
    const list = allies.length ? allies : [actor];
    for (const a of list.slice(0, 4)) {
      await ChatMessage.create({
        content: `<p><strong>骨汤</strong>：${a.name} 恢复 @Damage[(2d8+4)[healing]]（请点击结算）。</p>`,
      });
    }
  },
  "laura-sneak-attack": async (actor) => {
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><strong>消音狙伏击</strong>：对未察觉/隐蔽目标下次梅纳德打击额外精密（见角色卡）。</p>`,
    });
  },
  "flymander-heavy": async (actor) => {
    await deployTripMineFromActor(actor, TRIP_MINE_ACTIONS["flymander-heavy"]);
  },
  "red-raven-damn": async (actor) => {
    await deployTripMineFromActor(actor, TRIP_MINE_ACTIONS["red-raven-damn"]);
  },
  "red-raven-toxic": async (actor) => {
    await deployTripMineFromActor(actor, TRIP_MINE_ACTIONS["red-raven-toxic"]);
  },
  "emilia-trap": async (actor) => {
    await deployTripMineFromActor(actor, TRIP_MINE_ACTIONS["emilia-trap"]);
  },
  "riggins-question": async (actor) => {
    const target = primaryTarget(actor);
    if (!target) return ui.notifications.warn("请选中扪心自问目标");
    const dos = await rollSave(target, "will", 22, ["emotion", "mental", "auditory"]);
    if (dos !== null && dos <= 1) await applyPF2eCondition(target, "frightened", 1);
    await ChatMessage.create({
      content: `<p><strong>扪心自问 / 点名册</strong>：已对 ${target.name} 结算意志。</p>`,
    });
  },
  "hardin-unreliable": async (actor) => {
    const target = primaryTarget(actor);
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><strong>不可靠则铐回</strong>：对 ${target?.name ?? "触发者"} 立刻打击或冲近逮捕（本场 1 次）。请手动完成打击。</p>`,
    });
  },
  "vernon-october": async (actor) => {
    const key = `${FLAG}.october:${actor.id}:${game.combat?.id ?? "x"}`;
    if (actor.getFlag(MODULE_ID, key)) return ui.notifications.warn("本场已十月猎猫头鹰");
    await actor.setFlag(MODULE_ID, key, true);
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><strong>十月猎猫头鹰</strong>：下次火弩打击升一档，忽略隐蔽持平。</p>`,
    });
  },
  "dorothy-tea": async (actor) => {
    const victims = targetsInRange(actor, 15);
    for (const t of victims) {
      const dos = await rollSave(t, "will", 20, ["auditory", "mental", "emotion"]);
      if (dos !== null && dos <= 1) await applyPF2eCondition(t, "fascinated");
    }
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><strong>茶话会邀请</strong>：15 尺内已结算意志 DC 20。</p>`,
    });
  },
  "giggles-sticky": async (actor) => {
    const target = primaryTarget(actor);
    if (!target) return ui.notifications.warn("请选中黏弹目标");
    const src = await getPackItem("whbHuntStkFx0001");
    if (src) {
      const data = src.toObject();
      delete data._id;
      await Item.createDocuments([data], { parent: target, render: false });
    }
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><strong>马戏彩蛋</strong>：已对 ${target.name} 尝试挂黏弹效果。</p>`,
    });
  },
};

/** 医生专长：医疗包/针剂治疗量 ×2；开关可强制其它治疗加倍 */
function installDoctorPatch() {
  const ActorCls = CONFIG.Actor.documentClass;
  if (!ActorCls || ActorCls.prototype.__huntDoctorPatched) return;
  const original = ActorCls.prototype.applyDamage;
  if (typeof original !== "function") return;
  ActorCls.prototype.applyDamage = async function (params, ...rest) {
    try {
      const dmg = Number(params?.damage ?? params?.hpAdjustment ?? 0);
      const healing = dmg < 0 || params?.damageType === "healing" || params?.kind === "healing";
      if (healing) {
        const healers = new Set(
          [
            this,
            game.user.character,
            ...(canvas.tokens?.controlled ?? []).map((t) => t.actor),
          ].filter(Boolean)
        );
        let multiply = false;
        for (const h of healers) {
          if (!findBySlug(h, "feat", SLUGS.doctor)) continue;
          if (hasRollOption(h, "hunt-doctor-double-heal")) {
            multiply = true;
            break;
          }
          // 无开关时：医疗包/针剂也自动加倍（由聊天钩子打标记）
          if (h.getFlag?.(MODULE_ID, `${FLAG}.doctorMedicalBurst`)) {
            multiply = true;
            break;
          }
        }
        if (multiply) {
          if (typeof params.damage === "number") params.damage *= 2;
          else if (typeof params.hpAdjustment === "number") params.hpAdjustment *= 2;
        }
      }
    } catch {
      /* ignore */
    }
    return original.call(this, params, ...rest);
  };
  ActorCls.prototype.__huntDoctorPatched = true;

  Hooks.on("createChatMessage", async (message) => {
    if (message.author?.id !== game.user.id) return;
    const actor = message.actor;
    const item = message.item;
    if (!actor || !item || !canManage(actor)) return;
    const slug = item.system?.slug ?? "";
    if (!MEDICAL_HEAL_SLUGS.has(slug) && !/first-aid|vitality|regeneration|医疗包|活力针|再生/.test(slug + (item.name ?? ""))) {
      return;
    }
    if (!findBySlug(actor, "feat", SLUGS.doctor)) return;
    await actor.setFlag(MODULE_ID, `${FLAG}.doctorMedicalBurst`, true);
    setTimeout(() => actor.unsetFlag(MODULE_ID, `${FLAG}.doctorMedicalBurst`).catch(() => {}), 8000);
  });
}

/** 无血：压低流血骰；强韧结束流血见专长开关 */
function installBloodlessHook() {
  const clampBleed = (data, actor) => {
    if (!actor || !findBySlug(actor, "feat", SLUGS.bloodless)) return;
    const slug = data.system?.slug ?? data.slug;
    const isBleed =
      slug === "persistent-damage" &&
      (/bleed/i.test(data.system?.persistent?.damageType ?? "") ||
        /bleed|流血/i.test(data.name ?? ""));
    if (!isBleed) return;
    const formula = data.system?.persistent?.formula ?? data.system?.badge?.value;
    if (typeof formula === "string" && /(\d+)d([6-9]|1[0-2])/i.test(formula)) {
      data.system.persistent.formula = formula.replace(/d([6-9]|1[0-2])/gi, "d4");
      ui.notifications?.info?.(`${actor.name}：无血将流血压为 d4。`);
    }
  };

  Hooks.on("preCreateItem", (item, data) => {
    if (item.type !== "condition") return;
    clampBleed(data, item.parent);
  });

  Hooks.on("preUpdateItem", (item, changes) => {
    if (item.type !== "condition" || !item.parent) return;
    if (!findBySlug(item.parent, "feat", SLUGS.bloodless)) return;
    const formula = changes.system?.persistent?.formula;
    if (typeof formula === "string" && /(\d+)d([6-9]|1[0-2])/i.test(formula)) {
      changes.system.persistent.formula = formula.replace(/d([6-9]|1[0-2])/gi, "d4");
    }
  });
}

async function resolveMessageItem(message) {
  try {
    if (message.item) return message.item;
  } catch (_) {
    /* pf2e getter may throw */
  }
  const uuid =
    message.flags?.pf2e?.origin?.uuid ||
    message.flags?.pf2e?.itemUuid ||
    message.flags?.core?.sourceId;
  if (uuid) {
    try {
      const doc = await fromUuid(uuid);
      if (doc?.documentName === "Item" || doc?.type) return doc;
    } catch (_) {
      /* ignore */
    }
  }
  return null;
}

function findActorToken(actor) {
  if (!actor) return null;
  const linked = actor.getActiveTokens?.(true, true)?.[0];
  if (linked) return linked;
  const controlled = canvas.tokens?.controlled?.find(
    (t) => t.actor?.id === actor.id || t.actor?.uuid === actor.uuid,
  );
  if (controlled) return controlled;
  return (
    canvas.tokens?.placeables?.find(
      (t) => t.actor?.id === actor.id || t.actor?.uuid === actor.uuid || t.actor?.name === actor.name,
    ) ?? null
  );
}

function resolveTripMineSpec(item) {
  if (!item) return null;
  const slug = item.system?.slug || item.flags?.[MODULE_ID]?.huntGrantedAction || "";
  if (TRIP_MINE_ACTIONS[slug]) return TRIP_MINE_ACTIONS[slug];
  if (TRIP_MINE_HAZARDS[slug]) {
    return {
      hazardId: TRIP_MINE_HAZARDS[slug],
      itemSlugs: [slug],
      label: item.name,
    };
  }
  const name = item.name || "";
  for (const row of TRIP_MINE_NAME_RE) {
    if (row.re.test(name) && TRIP_MINE_ACTIONS[row.key]) return TRIP_MINE_ACTIONS[row.key];
  }
  return null;
}

async function placeTripMineHazard(actor, hazardId, itemName) {
  try {
    const pack = game.packs.get(`${MODULE_ID}.homebrew-actors`);
    if (!pack) {
      ui.notifications.error("找不到 homebrew-actors 合集，无法布置拌雷");
      return null;
    }
    const src = await pack.getDocument(hazardId);
    if (!src) {
      ui.notifications.error(`缺少危境 ${hazardId}（请确认合集已 pack）`);
      return null;
    }
    const token = findActorToken(actor);
    if (!token || !canvas.scene) {
      ui.notifications.error("请先把猎人令牌放在场景上，并选中/保持可见后再布置拌雷");
      return null;
    }
    const kind =
      hazardId === "whbHuntHzConc001"
        ? "concertina"
        : hazardId === "whbHuntHzPois001"
          ? "poison"
          : hazardId === "whbHuntHzBear001"
            ? "bear"
            : "alert";
    const data = src.toObject();
    delete data._id;
    data.folder = null;
    data.ownership = { default: 0, [game.user.id]: 3 };
    data.flags = data.flags || {};
    data.flags[MODULE_ID] = {
      ...(data.flags[MODULE_ID] || {}),
      source: "hunt-showdown",
      tripMine: kind,
      tripMineArmed: true,
      tripMinePlacedBy: actor.id,
    };
    const [created] = await Actor.createDocuments([data]);
    if (!created) {
      ui.notifications.error("创建危境 Actor 失败");
      return null;
    }
    const grid = canvas.grid.size;
    const width = Number(created.prototypeToken?.width || src.prototypeToken?.width || 1);
    const height = Number(created.prototypeToken?.height || src.prototypeToken?.height || 1);
    const tx = token.document.x + token.document.width * grid;
    const ty = token.document.y;
    const td = foundry.utils.mergeObject(created.prototypeToken.toObject(), {
      actorId: created.id,
      actorLink: true,
      x: tx,
      y: ty,
      width,
      height,
      name: created.name,
      hidden: true,
    });
    td.flags = td.flags || {};
    td.flags[MODULE_ID] = { tripMine: kind, tripMineArmed: true };
    const [tok] = await canvas.scene.createEmbeddedDocuments("Token", [td]);
    ui.notifications.info(`${itemName}：已布置隐藏危境「${created.name}」（邻格，可拖动）`);
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><strong>${itemName}</strong>：已在邻格放置<strong>隐藏</strong>危境 <em>${created.name}</em>。靠近约 10 尺会自动察觉；踩上绊线格会自动触发。</p>`,
    });
    return tok ?? created;
  } catch (err) {
    console.error(`${MODULE_ID} | placeTripMineHazard`, err);
    ui.notifications.error(`布置拌雷失败：${err?.message || err}`);
    return null;
  }
}

/**
 * 猎人招牌「布置拌雷」动作 / 消耗品：放下危境并尽量扣数量。
 */
async function deployTripMineFromActor(actor, spec) {
  if (!spec?.hazardId) return null;
  const item = (spec.itemSlugs || [])
    .map((s) => findBySlug(actor, "consumable", s))
    .find(Boolean);
  const placed = await placeTripMineHazard(actor, spec.hazardId, item?.name || spec.label);
  if (!placed) return null;
  if (item) {
    const qty = Number(item.system?.quantity ?? 1);
    if (qty > 1) await item.update({ "system.quantity": qty - 1 });
    else await item.delete().catch(() => {});
  } else {
    ui.notifications.info(`${spec.label}：物品栏没有对应消耗品，已仍放置危境。`);
  }
  return placed;
}

function tripMineKind(actor) {
  if (!actor || actor.type !== "hazard") return null;
  const f = actor.flags?.[MODULE_ID] || {};
  if (f.tripMine) return f.tripMine;
  const paired = f.pairedItem || "";
  if (paired.includes("Conc") || /铁丝网/.test(actor.name || "")) return "concertina";
  if (paired.includes("Pois") || /毒气/.test(actor.name || "")) return "poison";
  if (paired.includes("Bear") || /熊陷阱/.test(actor.name || "")) return "bear";
  if (paired.includes("Alrt") || paired.includes("Alert") || /警报|警示/.test(actor.name || "")) {
    return "alert";
  }
  return null;
}

function tripMineStealthDc(hazard) {
  const ste = Number(hazard.system?.attributes?.stealth?.value ?? 0);
  return 10 + ste;
}

function tokensOverlap(a, b) {
  if (!a || !b) return false;
  const ax1 = a.document.x;
  const ay1 = a.document.y;
  const ax2 = ax1 + a.w;
  const ay2 = ay1 + a.h;
  const bx1 = b.document.x;
  const by1 = b.document.y;
  const bx2 = bx1 + b.w;
  const by2 = by1 + b.h;
  return ax1 < bx2 && ax2 > bx1 && ay1 < by2 && ay2 > by1;
}

function tokensWithinFeet(a, b, feet) {
  if (!a || !b || !canvas.grid) return false;
  try {
    return canvas.grid.measurePath([a.center, b.center]).distance <= feet;
  } catch {
    return false;
  }
}

async function dealSimpleDamage(actor, formula, { type = "untyped", token = null, label = "" } = {}) {
  if (!actor) return;
  const roll = await new Roll(String(formula)).evaluate();
  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: label || `伤害（${type}）`,
  });
  try {
    if (typeof actor.applyDamage === "function") {
      await actor.applyDamage({
        damage: roll,
        token: token?.document ?? actor.getActiveTokens?.(true, true)?.[0]?.document,
        damageType: type,
      });
    } else {
      const hp = actor.system?.attributes?.hp;
      if (hp) {
        await actor.update({
          "system.attributes.hp.value": Math.max(0, Number(hp.value) - Number(roll.total)),
        });
      }
    }
  } catch (err) {
    console.warn(`${MODULE_ID} | tripMine damage`, err);
  }
}

async function noticeTripMine(mover, hazardTok) {
  const hazard = hazardTok.actor;
  if (!hazard) return false;
  const noticed = hazard.getFlag(MODULE_ID, "tripMineNoticed") || [];
  if (noticed.includes(mover.id)) return true;
  const dc = tripMineStealthDc(hazard);
  let total = null;
  try {
    if (typeof mover.perception?.roll === "function") {
      const roll = await mover.perception.roll({
        dc: { value: dc },
        skipDialog: true,
        extraRollOptions: ["action:seek", "hunt-trip-mine"],
      });
      total = roll?.total ?? roll?.dice?.[0]?.total ?? null;
      if (total === null && roll?.degreeOfSuccess !== undefined) {
        // degreeOfSuccess: 0 crit fail … 3 crit success; success if >= 2
        if (roll.degreeOfSuccess >= 2) total = dc;
        else total = dc - 1;
      }
    }
  } catch (err) {
    console.warn(`${MODULE_ID} | perception roll`, err);
  }
  if (total === null) {
    try {
      const mod = Number(mover.perception?.mod ?? mover.system?.perception?.mod ?? 0);
      const roll = await new Roll(`1d20+${mod}`).evaluate();
      await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: mover }),
        flavor: `察觉拌雷（DC ${dc}）`,
      });
      total = roll.total;
    } catch {
      return false;
    }
  }
  const ok = Number(total) >= dc;
  if (ok) {
    await hazard.setFlag(MODULE_ID, "tripMineNoticed", [...noticed, mover.id]);
    if (hazardTok.document.hidden) {
      await hazardTok.document.update({ hidden: false });
    }
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: mover }),
      content: `<p><strong>察觉</strong>：${mover.name} 发现了 <em>${hazard.name}</em>（DC ${dc}）。</p>`,
    });
    return true;
  }
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: mover }),
    whisper: ChatMessage.getWhisperRecipients("GM").map((u) => u.id),
    content: `<p><strong>察觉</strong>：${mover.name} 未发现附近的拌雷（DC ${dc}）。</p>`,
  });
  return false;
}

async function triggerTripMine(moverTok, hazardTok) {
  const hazard = hazardTok.actor;
  const mover = moverTok.actor;
  if (!hazard || !mover) return;
  if (hazard.getFlag(MODULE_ID, "tripMineTriggered")) return;
  const kind = tripMineKind(hazard);
  if (!kind) return;

  await hazard.setFlag(MODULE_ID, "tripMineTriggered", true);
  await hazard.setFlag(MODULE_ID, "tripMineArmed", false);
  if (hazardTok.document.hidden) await hazardTok.document.update({ hidden: false });

  if (kind === "concertina") {
    const victims = (canvas.tokens?.placeables ?? []).filter(
      (t) => t.actor && t.actor.type !== "hazard" && tokensWithinFeet(t, hazardTok, 10),
    );
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: hazard }),
      content: `<p><strong>铁丝网拌雷 · 刀丝展开</strong>：${mover.name} 踩上绊线！约 2×2 格刀丝网展开。</p>`,
    });
    for (const t of victims) {
      await dealSimpleDamage(t.actor, "1d6", {
        type: "slashing",
        token: t,
        label: "刀丝展开",
      });
      const dos = await rollSave(t.actor, "reflex", 19, ["trap"]);
      if (dos !== null && dos <= 1) await applyPF2eCondition(t.actor, "slowed", 1);
      await applyCompendiumEffect(t.actor, EFFECT_IDS.wire);
    }
  } else if (kind === "poison") {
    const victims = (canvas.tokens?.placeables ?? []).filter(
      (t) => t.actor && t.actor.type !== "hazard" && tokensWithinFeet(t, hazardTok, 5),
    );
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: hazard }),
      content: `<p><strong>毒气拌雷</strong>：${mover.name} 触发！5 尺毒云（持续 3 轮，请在回合开始继续结算）。</p>`,
    });
    for (const t of victims) {
      await dealSimpleDamage(t.actor, "1d6", { type: "poison", token: t, label: "毒气拌雷" });
      await applyCompendiumEffect(t.actor, EFFECT_IDS.poison);
    }
  } else if (kind === "bear") {
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: hazard }),
      content: `<p><strong>熊陷阱 · 钢颚咬合</strong>：${mover.name} 踩中捕兽夹！</p>`,
    });
    await dealSimpleDamage(mover, "1d10", { type: "bludgeoning", token: moverTok, label: "钢颚咬合" });
    const dos = await rollSave(mover, "reflex", 20, ["trap"]);
    if (dos !== null && dos <= 1) {
      await applyCompendiumEffect(mover, "whbHuntBearFx001");
      await applyPF2eCondition(mover, "restrained");
      try {
        const roll = await new Roll(dos <= 0 ? "1d8" : "1d6").evaluate();
        await roll.toMessage({ flavor: "熊陷阱持续流血" });
      } catch (_) {
        /* ignore */
      }
    }
  } else {
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: hazard }),
      content: `<p><strong>警报拌雷 · 烟花示警</strong>：${mover.name} 触发！约 150 尺内可闻巨响；闪光短暂照亮邻格。</p>`,
    });
    await dealSimpleDamage(mover, "1d4", { type: "fire", token: moverTok, label: "信号焰灼伤" });
    const dos = await rollSave(mover, "fortitude", 16, ["fire", "visual"]);
    if (dos !== null && dos <= 1) await applyPF2eCondition(mover, "dazzled");
  }

  // 危境耗尽：HP 归零提示
  try {
    const hp = hazard.system?.attributes?.hp;
    if (hp) await hazard.update({ "system.attributes.hp.value": 0 });
  } catch (_) {
    /* ignore */
  }
}

function installTripMineHooks() {
  // 消耗品 / 动作布置：统一入口（延迟一帧以等 PF2e 填好 message.item）
  Hooks.on("createChatMessage", async (message) => {
    if (message.author?.id !== game.user.id && message.user?.id !== game.user.id) return;
    await foundry.utils.delay(50);
    const actor = message.actor;
    if (!actor || !canManage(actor)) return;

    const item = await resolveMessageItem(message);
    const key = `mineDeploy:${message.id}`;
    if (handled.has(key)) return;

    let spec = resolveTripMineSpec(item);
    if (!spec) {
      // 聊天标题/内容兜底（有些动作卡 item 为空）
      const blob = `${item?.name || ""} ${message.flavor || ""} ${message.content || ""}`;
      for (const row of TRIP_MINE_NAME_RE) {
        if (row.re.test(blob) && TRIP_MINE_ACTIONS[row.key]) {
          spec = TRIP_MINE_ACTIONS[row.key];
          break;
        }
      }
    }
    if (!spec) return;

    // 仅处理动作或消耗品卡
    const typ = item?.type;
    if (typ && typ !== "action" && typ !== "consumable") return;

    handled.add(key);
    setTimeout(() => handled.delete(key), 8000);
    await deployTripMineFromActor(actor, spec);
  });

  // 靠近自动察觉；踩上绊线格自动触发
  Hooks.on("updateToken", async (tokenDoc, changes) => {
    if (!game.user.isGM) return;
    if (changes.x === undefined && changes.y === undefined) return;
    const moverTok = tokenDoc.object;
    const mover = tokenDoc.actor;
    if (!moverTok || !mover || mover.type === "hazard") return;
    if (mover.flags?.[MODULE_ID]?.tripMine) return;

    const hazards = (canvas.tokens?.placeables ?? []).filter((t) => {
      const a = t.actor;
      if (!a || a.type !== "hazard") return false;
      if (a.getFlag(MODULE_ID, "tripMineTriggered")) return false;
      return Boolean(tripMineKind(a));
    });

    for (const hz of hazards) {
      const noticedKey = `notice:${tokenDoc.id}:${hz.id}`;
      if (tokensWithinFeet(moverTok, hz, 10) && !handled.has(noticedKey)) {
        const noticed = hz.actor.getFlag(MODULE_ID, "tripMineNoticed") || [];
        if (!noticed.includes(mover.id)) {
          handled.add(noticedKey);
          setTimeout(() => handled.delete(noticedKey), 8000);
          await noticeTripMine(mover, hz);
        }
      }
      if (tokensOverlap(moverTok, hz)) {
        const trigKey = `trig:${hz.id}`;
        if (handled.has(trigKey)) continue;
        handled.add(trigKey);
        await triggerTripMine(moverTok, hz);
      }
    }
  });
}

function adjacentTokens(centerToken, { includeSelf = false } = {}) {
  if (!centerToken) return [];
  const origin = centerToken.center;
  return (canvas.tokens?.placeables ?? []).filter((t) => {
    if (!t.actor) return false;
    if (!includeSelf && t === centerToken) return false;
    const d = canvas.grid.measurePath([origin, t.center]).distance;
    return d <= 5;
  });
}

async function pushTokenAway(targetToken, fromToken, feet = 5) {
  if (!targetToken?.document || !fromToken || !canvas.scene || !canvas.grid) return;
  try {
    const a = fromToken.center;
    const b = targetToken.center;
    let dx = b.x - a.x;
    let dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    const dist = (feet / canvas.dimensions.distance) * canvas.grid.size;
    const nx = targetToken.document.x + dx * dist;
    const ny = targetToken.document.y + dy * dist;
    await targetToken.document.update({ x: nx, y: ny });
  } catch (err) {
    console.warn(`${MODULE_ID} | push`, err);
  }
}

async function applyNitroImpact({ attacker, targetToken, attackTotal, hit }) {
  const shooter = attacker.getActiveTokens?.(true, true)?.[0];
  const adj = adjacentTokens(targetToken, { includeSelf: false });

  if (hit) {
    const victims = [targetToken, ...adj].filter((t, i, arr) => arr.indexOf(t) === i);
    for (const tok of victims) {
      const a = tok.actor;
      if (!a || (!canManage(a) && !game.user.isGM)) continue;
      const dos = await rollSave(a, "fortitude", attackTotal, ["concussive"]);
      if (dos !== null && dos <= 1) {
        await applyPF2eCondition(a, "prone");
        if (shooter) await pushTokenAway(tok, shooter, 5);
        await ChatMessage.create({
          content: `<p><strong>高爆冲击</strong>：${a.name} 强韧失败 → 推离 5 尺并倒地。</p>`,
        });
      } else if (dos !== null) {
        await ChatMessage.create({
          content: `<p><strong>高爆冲击</strong>：${a.name} 强韧成功。</p>`,
        });
      }
    }
  } else {
    for (const tok of adj) {
      const a = tok.actor;
      if (!a) continue;
      try {
        if (typeof a.applyDamage === "function") {
          await a.applyDamage({ damage: await new Roll("1d4").evaluate(), token: tok.document });
        } else {
          const roll = await new Roll("1d4").evaluate();
          await ChatMessage.create({
            content: `<p><strong>高爆冲击（溅射）</strong>：${a.name} 受到 ${roll.total} 钝击。</p>`,
            rolls: [roll],
          });
          const hp = a.system?.attributes?.hp;
          if (hp) await a.update({ "system.attributes.hp.value": Math.max(0, hp.value - roll.total) });
        }
      } catch {
        const roll = await new Roll("1d4").evaluate();
        await ChatMessage.create({
          content: `<p><strong>高爆冲击（溅射）</strong>：${a.name} 受到 ${roll.total} 钝击（请手动结算）。</p>`,
          rolls: [roll],
        });
      }
    }
  }
}

function installNitroHook() {
  Hooks.on("createChatMessage", async (message) => {
    if (message.author?.id !== game.user.id) return;
    const ctx = message.flags?.pf2e?.context;
    if (!ctx || ctx.type !== "attack-roll") return;
    const item = message.item;
    const slug = item?.system?.slug ?? "";
    if (slug !== SLUGS.nitro && !/nitro-express/.test(slug)) return;
    const actor = message.actor;
    if (!actor || !canManage(actor)) return;

    const attackTotal = message.rolls?.[0]?.total ?? message.rolls?.[0]?._total;
    if (typeof attackTotal !== "number") return;
    const outcome = ctx.outcome ?? "";
    const hit = ["success", "criticalSuccess"].includes(outcome);

    const targets = await resolveTargetActors(message);
    let targetToken =
      (canvas.tokens?.placeables ?? []).find((t) => targets.includes(t.actor)) ??
      Array.from(game.user.targets ?? [])[0] ??
      null;

    if (!targetToken && targets[0]) {
      targetToken = targets[0].getActiveTokens?.(true, true)?.[0] ?? null;
    }
    if (!targetToken) {
      await ChatMessage.create({
        content: `<p><strong>Nitro Express</strong>：未找到目标令牌，请手动结算高爆冲击（DC ${attackTotal}）。</p>`,
      });
      return;
    }

    const key = `nitro:${message.id}`;
    if (handled.has(key)) return;
    handled.add(key);
    await applyNitroImpact({ attacker: actor, targetToken, attackTotal, hit });
  });
}

function installActionHandler() {
  Hooks.on("createChatMessage", async (message) => {
    if (message.author?.id !== game.user.id && message.user?.id !== game.user.id) return;
    await foundry.utils.delay(50);
    const actor = message.actor;
    if (!actor || !canManage(actor)) return;
    const item = await resolveMessageItem(message);
    if (!item || item.type !== "action") return;

    // 拌雷布置已由 installTripMineHooks 统一处理，这里跳过避免双布置
    if (resolveTripMineSpec(item)) return;

    const slug = item.flags?.[MODULE_ID]?.huntGrantedAction ?? item.system?.slug;
    if (!slug) return;

    const isKnown =
      slug === ACTION_SLUGS.bornheim ||
      slug === ACTION_SLUGS.necro ||
      slug === ACTION_SLUGS.dauntless ||
      slug === ACTION_SLUGS.swiftStep ||
      slug === ACTION_SLUGS.ambiReload ||
      slug === ACTION_SLUGS.bountyDarkSight ||
      Boolean(HUNTER_ACTION_HANDLERS[slug]);
    if (!isKnown) return;

    const key = `${message.id}:${slug}`;
    if (handled.has(key)) return;
    handled.add(key);
    setTimeout(() => handled.delete(key), 4000);

    if (slug === ACTION_SLUGS.bornheim) await handleBornheimRapid(actor);
    else if (slug === ACTION_SLUGS.necro) await handleNecromancer(actor);
    else if (slug === ACTION_SLUGS.dauntless) await handleDauntless(actor);
    else if (slug === ACTION_SLUGS.swiftStep) await handleSwiftStep(actor, item);
    else if (slug === ACTION_SLUGS.ambiReload) await handleAmbiReload(actor);
    else if (slug === ACTION_SLUGS.bountyDarkSight) await handleBountyDarkSight(actor);
    else if (HUNTER_ACTION_HANDLERS[slug]) {
      await HUNTER_ACTION_HANDLERS[slug](actor);
    }
  });
}

function installReloadHook() {
  Hooks.on("createChatMessage", async (message) => {
    if (message.author?.id !== game.user.id) return;
    const actor = message.actor;
    if (!actor || !canManage(actor)) return;
    if (!findWeaponBySlugs(actor, SWIFT_SLUGS)) return;

    const flavor = `${message.flavor ?? ""} ${message.content ?? ""}`;
    const ctx = message.flags?.pf2e?.context;
    const isReload =
      ctx?.type === "weapon-reload" || /reload|装填|Reload|Interact|快速循环|摇椅式装填/i.test(flavor);
    const item = message.item;
    const itemSlug = item?.system?.slug ?? message.flags?.pf2e?.origin?.slug;
    const isSwiftItem = SWIFT_SLUGS.has(itemSlug) || /swift|速射|红燕|高尚的处决|快速循环|马拉松/i.test(flavor);

    if (isReload && (isSwiftItem || /swift|速射|Winfield|快速循环|红马丁：迅捷/i.test(flavor))) {
      const rk = `${FLAG}.swiftStep:${roundKey()}:${actor.id}`;
      if (actor.getFlag(MODULE_ID, rk)) return;
      await actor.setFlag(MODULE_ID, rk, true);
      await grantSwiftStep(actor);
    }

    // 弗农摇椅装填：下击 +1 用聊天提示
    if (item?.system?.slug === "vernon-reload") {
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `<p><strong>摇椅式装填</strong>：若本回合未移动，下次打击 +1 环境（请打开对应开关或手加）。</p>`,
      });
    }
  });
}

function installFireFieldTick() {
  const fireSlugs = [
    "effect-fire-bomb-blaze",
    "effect-liquid-fire-bomb-blaze",
    "effect-hellfire-bomb-blaze",
  ];
  Hooks.on("pf2e.startTurn", async (combatant) => {
    const actor = combatant?.actor;
    if (!canManage(actor)) return;
    const inFire = actor.itemTypes.effect.some((e) => fireSlugs.includes(e.system?.slug));
    if (!inFire) return;
    await applyCompendiumEffect(actor, EFFECT_IDS.burn);
  });
}

function installHitEffectHook() {
  Hooks.on("createChatMessage", async (message) => {
    if (message.author?.id !== game.user.id) return;
    const ctx = message.flags?.pf2e?.context;
    if (!ctx || ctx.type !== "damage-roll") return;
    if (ctx.outcome === "failure" || ctx.outcome === "criticalFailure") return;

    const item = message.item;
    const slug = item?.system?.slug ?? message.flags?.pf2e?.origin?.slug ?? "";
    const itemName = item?.name ?? "";
    const options = ctx.options ?? [];
    const optionStr = options.join(" ");
    const flavor = `${slug} ${optionStr} ${message.flavor ?? ""} ${itemName}`;

    const targets = await resolveTargetActors(message);
    if (!targets.length) return;

    const attacker = message.actor;
    const huntMonster = attacker?.flags?.[MODULE_ID]?.huntMonster;

    const isBurn =
      BURN_ON_HIT.has(slug) ||
      options.some((o) => [...BURN_ON_HIT].some((s) => o.includes(s))) ||
      /marksmans-delight|brass-flower|火弩|龙息|灼烬|chef.?s.?kiss|主厨之吻/.test(flavor) ||
      (MONSTER_BURN.has(huntMonster) && (MONSTER_BURN_NAME_RE.test(itemName) || /fire|火焰|灼烬/.test(flavor))) ||
      (MONSTER_BURN.has(huntMonster) && item?.type === "melee" && /火|焰|熔|焦|燃/.test(itemName));

    if (isBurn) {
      for (const t of targets) await applyCompendiumEffect(t, EFFECT_IDS.burn);
    }

    const isPoisonMonster =
      MONSTER_POISON.has(huntMonster) &&
      (MONSTER_POISON_NAME_RE.test(itemName) || item?.type === "melee" || /poison|毒/.test(flavor));
    if (isPoisonMonster) {
      for (const t of targets) await applyCompendiumEffect(t, EFFECT_IDS.poison);
    }

    if (NOOSE_SLUGS.has(slug) || /the-noose|绞索/.test(flavor)) {
      for (const t of targets) await applyCompendiumEffect(t, EFFECT_IDS.nooseSlow);
    }

    // 毒弹
    let ammoSlug =
      item?.ammo?.system?.slug ??
      item?.ammo?.slug ??
      (typeof item?.system?.selectedAmmoId === "string"
        ? message.actor?.items?.get?.(item.system.selectedAmmoId)?.system?.slug
        : null);
    const isPoisonAmmo =
      ammoSlug === SLUGS.poisonAmmo ||
      options.includes(`item:slug:${SLUGS.poisonAmmo}`) ||
      options.includes(`ammo:slug:${SLUGS.poisonAmmo}`) ||
      /hunt-poison-ammo|毒弹/.test(`${message.flavor ?? ""}`);
    if (isPoisonAmmo) {
      for (const t of targets) await applyCompendiumEffect(t, EFFECT_IDS.poison);
    }

    const isBleedAmmo =
      BLEED_AMMO_SLUGS.has(ammoSlug) ||
      /dumdum|达姆/.test(`${ammoSlug ?? ""} ${message.flavor ?? ""}`);
    if (isBleedAmmo) {
      for (const t of targets) {
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: attacker }),
          content: `<p><strong>达姆弹</strong>：请对 ${t.name} 施加持续流血（若尚未施加）。</p>`,
        });
      }
    }

    // 惊惧类武器：重击或 Note 开关时提示豁免
    if (
      (FEAR_ON_HIT.has(slug) || /widows-son|betrayed-loyalty|batters-eye|寡妇|背叛的忠诚|击球手/.test(flavor)) &&
      (ctx.outcome === "criticalSuccess" || /fear|惊惧|诅咒刻痕|点名册/.test(flavor))
    ) {
      const dc = 14 + 2 * Number(attacker?.level ?? attacker?.system?.details?.level?.value ?? 4);
      for (const t of targets) {
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: attacker }),
          content: `<p><strong>精神冲击</strong>：${t.name} 请进行 @Check[will|dc:${dc}|traits:emotion,fear,mental]{意志 DC ${dc}}（失败惊惧 1）。</p>`,
        });
      }
    }
  });
}

/** 赏金令牌：击杀回充 + 物品入包时同步动作 */
function installBountyTokenHooks() {
  Hooks.on("createChatMessage", async (message) => {
    if (message.author?.id !== game.user.id) return;
    const ctx = message.flags?.pf2e?.context;
    if (!ctx || ctx.type !== "damage-roll") return;
    if (ctx.outcome === "failure" || ctx.outcome === "criticalFailure") return;
    const attacker = message.actor;
    if (!attacker || !getBountyToken(attacker)) return;

    const targets = await resolveTargetActors(message);
    if (!targets.length) return;

    // 等伤害落地后再看 HP / 濒死
    setTimeout(async () => {
      try {
        for (const victim of targets) {
          if (!victim || victim === attacker) continue;
          const hp = Number(victim.system?.attributes?.hp?.value ?? 1);
          const dying =
            victim.hasCondition?.(DYING_SLUG) ||
            !!findBySlug(victim, "condition", DYING_SLUG);
          if (hp > 0 && !dying) continue;
          const key = `bountyKill:${attacker.id}:${victim.id}:${game.combat?.round ?? 0}`;
          if (handled.has(key)) continue;
          handled.add(key);
          setTimeout(() => handled.delete(key), 8000);
          await restoreBountyCharge(attacker, victim);
          await syncGrantedActions(attacker);
        }
      } catch (err) {
        console.warn(`${MODULE_ID} | bounty kill restore`, err);
      }
    }, 400);
  });

  Hooks.on("updateItem", (item) => {
    if (item.type !== "equipment") return;
    if ((item.system?.slug ?? item.slug) !== SLUGS.bountyToken) return;
    if (item.parent) syncGrantedActions(item.parent).catch(() => {});
  });
}

function installSyncHooks() {
  const sync = (doc) => {
    const actor = doc?.actor ?? (doc?.documentName === "Actor" ? doc : null);
    if (actor) {
      syncGrantedActions(actor).catch(console.error);
      syncHunterInventory(actor).catch(console.error);
    }
  };
  Hooks.on("createItem", (item) => {
    if (item.parent) sync(item.parent);
  });
  Hooks.on("deleteItem", (item) => {
    if (item.parent) sync(item.parent);
  });
  Hooks.on("updateItem", (item) => {
    if (item.parent) sync(item.parent);
  });
  Hooks.on("updateActor", (actor, changes) => {
    if (changes.flags?.pf2e?.rollOptions || changes.flags?.pf2e) {
      syncFormEffects(actor).catch(console.error);
    }
  });
  Hooks.on("createToken", (tokenDoc) => {
    if (tokenDoc.actor) sync(tokenDoc.actor);
  });
  Hooks.once("ready", () => {
    for (const a of game.actors.contents) {
      syncGrantedActions(a).catch(() => {});
      syncHunterInventory(a).catch(() => {});
    }
  });
}

/**
 * 猎人物品栏同步：按 preferredLoadoutIds / preferredLoadout 从合集嵌入缺失的原型装备。
 * 解决多数猎人只有 melee 打击、没有真实武器/消耗品因而无法触发自动化的问题。
 */
async function syncHunterInventory(actor) {
  if (!actor || actor.type !== "npc") return;
  if (!game.user.isGM && !actor.isOwner) return;
  const flags = actor.flags?.[MODULE_ID];
  if (!flags?.huntHunter) return;
  if (syncing.has(actor.id)) return;
  syncing.add(actor.id);
  try {
    const pack = game.packs.get(PACK);
    if (!pack) return;

    const ids = Array.isArray(flags.preferredLoadoutIds) ? flags.preferredLoadoutIds.filter(Boolean) : [];
    const slugs = Array.isArray(flags.preferredLoadout) ? flags.preferredLoadout.filter(Boolean) : [];

    /** @type {string[]} */
    let toFetch = [...ids];
    if (!toFetch.length && slugs.length) {
      const index = pack.index?.size ? pack.index : await pack.getIndex({ fields: ["system.slug"] });
      for (const slug of slugs) {
        const hit = [...index].find((e) => e.system?.slug === slug || e.slug === slug);
        if (hit?._id) toFetch.push(hit._id);
      }
    }
    if (!toFetch.length) return;

    const existingSlugs = new Set(
      actor.items.contents
        .map((i) => i.system?.slug)
        .filter(Boolean),
    );
    const createData = [];
    for (const id of toFetch) {
      const src = await pack.getDocument(id);
      if (!src) continue;
      const slug = src.system?.slug;
      if (slug && existingSlugs.has(slug)) continue;
      // 已有同名嵌入（无 slug）也跳过
      if (actor.items.find((i) => i.name === src.name && i.type === src.type)) continue;
      const data = src.toObject();
      delete data._id;
      delete data.folder;
      if (data.type === "consumable") {
        data.system = data.system ?? {};
        data.system.quantity = Math.max(1, Number(data.system.quantity) || 1);
      }
      createData.push(data);
      if (slug) existingSlugs.add(slug);
    }
    if (!createData.length) return;
    await Item.createDocuments(createData, { parent: actor, render: false });
    await syncGrantedActions(actor);
  } catch (err) {
    console.warn(`${MODULE_ID} | syncHunterInventory`, err);
  } finally {
    syncing.delete(actor.id);
  }
}

/** 供宏 / 控制台：强制为选中猎人同步装载 */
export async function forceSyncHunterInventory(actor) {
  if (!actor) {
    actor = canvas.tokens?.controlled?.[0]?.actor ?? game.user.character;
  }
  if (!actor) {
    ui.notifications.warn("请先选中一名猎人 Token / Actor");
    return;
  }
  await syncHunterInventory(actor);
  ui.notifications.info(`已尝试同步装载：${actor.name}`);
}

/** 要塞货气球：战斗每轮按开阀数推进充气进度（货箱本身不记账）。 */
function installCargoBalloonHooks() {
  const FLAG_KEY = "cargoBalloon";
  const PROGRESS_MAX = 12;

  const isBalloon = (a) => {
    if (!a) return false;
    if (a.getFlag?.(MODULE_ID, "huntProp") === "cargo-balloon") return true;
    return /货气球|Cargo Balloon/i.test(String(a.name ?? ""));
  };

  Hooks.on("combatRound", async (combat, _update, _opts) => {
    if (!game.user.isGM) return;
    if (!combat?.started) return;
    const seen = new Set();
    for (const c of combat.combatants) {
      const actor = c.actor;
      if (!actor || !isBalloon(actor) || seen.has(actor.id)) continue;
      seen.add(actor.id);
      const st = actor.getFlag(MODULE_ID, FLAG_KEY) || {};
      if (st.launched) continue;
      const valves = Math.max(0, Math.min(3, Number(st.valvesOpen) || 0));
      if (!valves) continue;
      const prev = Math.max(0, Number(st.progress) || 0);
      if (prev >= PROGRESS_MAX) continue;
      const progress = Math.min(PROGRESS_MAX, prev + valves);
      await actor.setFlag(MODULE_ID, FLAG_KEY, {
        valvesOpen: valves,
        progress,
        launched: false,
      });
      const ready = progress >= PROGRESS_MAX;
      ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `<p><strong>${actor.name}</strong> 充气 ${progress}/${PROGRESS_MAX}（本轮 +${valves}）${
          ready ? " — <em>可以放飞</em>" : ""
        }</p>`,
      }).catch(() => {});
    }
  });
}

/** 放逐标记：战斗每轮推进进度，并刷新 Token 名。 */
function installBanishingHooks() {
  const FLAG_KEY = "banishing";
  const HUNT_PROP = "banishing-site";

  const isSite = (a) => {
    if (!a) return false;
    if (a.getFlag?.(MODULE_ID, "huntProp") === HUNT_PROP) return true;
    return /放逐|Banishing/i.test(String(a.name ?? ""));
  };

  const syncLabel = async (actor, st) => {
    const max = Math.max(1, Number(st.max) || 10);
    const progress = Math.max(0, Math.min(max, Number(st.progress) || 0));
    let label = `放逐点 · ${st.bossName || "Boss"}`;
    if (st.complete) label = `放逐完成 · ${st.bossName || "Boss"}`;
    else if (st.active) label = `放逐中 · ${st.bossName || "Boss"} ${progress}/${max}`;
    for (const t of actor.getActiveTokens?.(true) ?? []) {
      const doc = t.document ?? t;
      if (doc?.name !== label) {
        await doc.update({ name: label, displayName: 50 }).catch(() => {});
      }
    }
    // 同步地图便签文字（大地图可见）
    const scene = st.sceneId ? game.scenes.get(st.sceneId) : canvas.scene;
    if (scene && st.noteId) {
      const note = scene.notes.get(st.noteId);
      if (note && note.text !== label) {
        await note.update({ text: label }).catch(() => {});
      }
    } else if (scene) {
      const note = scene.notes.find(
        (n) => n.flags?.[MODULE_ID]?.banishActorId === actor.id
      );
      if (note && note.text !== label) {
        await note.update({ text: label }).catch(() => {});
      }
    }
  };

  Hooks.on("combatRound", async (combat) => {
    if (!game.user.isGM) return;
    if (!combat?.started) return;
    const seen = new Set();
    const candidates = [
      ...combat.combatants.map((c) => c.actor),
      ...(canvas.tokens?.placeables ?? []).map((t) => t.actor),
    ];
    for (const actor of candidates) {
      if (!actor || !isSite(actor) || seen.has(actor.id)) continue;
      seen.add(actor.id);
      const st = actor.getFlag(MODULE_ID, FLAG_KEY) || {};
      if (!st.active || st.complete) continue;
      const max = Math.max(1, Number(st.max) || 10);
      const prev = Math.max(0, Number(st.progress) || 0);
      if (prev >= max) continue;
      const progress = Math.min(max, prev + 1);
      const next = {
        active: true,
        progress,
        max,
        bossName: st.bossName || "Boss",
        complete: false,
      };
      await actor.setFlag(MODULE_ID, FLAG_KEY, next);
      await syncLabel(actor, next);
      const filled = Math.min(10, Math.round((progress / max) * 10));
      const bar = "█".repeat(filled) + "░".repeat(10 - filled);
      const full = progress >= max;
      ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `<p><strong>放逐 · ${next.bossName}</strong>
          <code>${bar}</code> ${progress}/${max}
          ${full ? " — <em>可完成结算</em>" : ""}</p>`,
      }).catch(() => {});
    }
  });
}

/** 怪物阶段：屠夫狂暴/断头、喷火怪临终提示 */
function installMonsterPhaseHooks() {
  Hooks.on("updateActor", async (actor, changes) => {
    if (!game.user.isGM) return;
    const monster = actor.flags?.[MODULE_ID]?.huntMonster;
    if (!monster) return;
    const hp = changes.system?.attributes?.hp?.value;
    if (typeof hp !== "number") return;
    const max = Number(actor.system?.attributes?.hp?.max ?? 0);
    if (!max) return;

    if (monster === "butcher") {
      const flagged = actor.getFlag(MODULE_ID, "butcherPhases") || {};
      if (hp <= max * (2 / 3) && !flagged.rage) {
        await actor.setFlag(MODULE_ID, "butcherPhases", { ...flagged, rage: true });
        const has = findBySlug(actor, "effect", "effect-butcher-rage") || findBySlug(actor, "effect", "butcher-rage");
        if (!has) await applyCompendiumEffect(actor, "whbHuntBtcRgFx01");
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor }),
          content: `<p><strong>屠夫 · 狂暴</strong>：已尝试施加狂暴效果（2/3 血）。</p>`,
        });
      }
      if (hp <= max * 0.25 && !flagged.headless) {
        await actor.setFlag(MODULE_ID, "butcherPhases", { ...flagged, rage: true, headless: true });
        await applyCompendiumEffect(actor, "whbHuntBtcHdFx01");
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor }),
          content: `<p><strong>屠夫 · 断头</strong>：已尝试施加断头效果（1/4 血）。</p>`,
        });
      }
    }

    if (monster === "immolator" && hp <= 0) {
      const key = `immolatorDeath:${actor.id}`;
      if (handled.has(key)) return;
      handled.add(key);
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `<p><strong>喷火怪 · 临终喷焰</strong>：以尸体为中心 5 尺爆发 2d6 火焰 + 灼烬（毒素击杀除外）。请对邻接生物结算。</p>`,
      });
    }

    if (monster === "hellborn" && hp <= max * 0.5) {
      const flagged = actor.getFlag(MODULE_ID, "hellbornHalf");
      if (!flagged) {
        await actor.setFlag(MODULE_ID, "hellbornHalf", true);
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor }),
          content: `<p><strong>狱生 · 半血</strong>：熔岩连射改为 4 枚火球。</p>`,
        });
      }
    }
  });
}

export function installHuntShowdownAutomation() {
  installStackingHook();
  installPoisonTick();
  installMedicalHooks();
  installPhiloTraitHooks();
  installDoctorPatch();
  installBloodlessHook();
  installTripMineHooks();
  installNitroHook();
  installActionHandler();
  installReloadHook();
  installFireFieldTick();
  installHitEffectHook();
  installBountyTokenHooks();
  installCargoBalloonHooks();
  installBanishingHooks();
  installMonsterPhaseHooks();
  installSyncHooks();
  installHuntBloodMoon();
  installHuntFullAuto({
    canManage,
    handled,
    applyCompendiumEffect,
    applyPF2eCondition,
    rollSave,
    primaryTarget,
    targetsInRange,
    grantSwiftStep,
    handleDoubleStrike,
    handleBornheimRapid,
    findBySlug,
    getPackItem,
  });
  console.log(`${MODULE_ID} | Hunt: Showdown automation ready (v1.36.12 trip-mine harden)`);
}
