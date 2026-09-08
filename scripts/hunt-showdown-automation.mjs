/**
 * 猎杀对决：尽量自动化武器战术、专长与状态层数。
 */
const MODULE_ID = "wang-pf2e-homebrew";
const FLAG = "huntShowdown";

const SLUGS = {
  swift: "winfield-m1873-swift",
  bornheim: "bornheim-no-3",
  pax: "caldwell-pax",
  vetterli: "vetterli-71-karabiner",
  throwingAxe: "hunt-throwing-axes",
  burn: "effect-hunt-burning",
  poison: "effect-hunt-poisoned",
  soul: "effect-hunt-soul-burn",
  antidote: "effect-antidote-shot",
  vitality: "vitality-shot",
  regen: "regeneration-shot",
  doctor: "hunt-feat-doctor",
  ambi: "hunt-feat-ambi001",
  dauntless: "hunt-feat-dauntless",
  necro: "hunt-feat-necr001",
  vulture: "hunt-feat-vult001",
};

const ACTION_SLUGS = {
  bornheim: "hunt-bornheim-rapid",
  swiftStep: "hunt-swift-free-step",
  ambiReload: "hunt-ambi-free-reload",
  necro: "hunt-necromancer-revive",
  dauntless: "hunt-dauntless-defuse",
};

const syncing = new Set();
const handled = new Set();

function canManage(actor) {
  return !!actor && (actor.isOwner || game.user.isGM);
}

function findBySlug(actor, type, slug) {
  const list = actor?.itemTypes?.[type] ?? [];
  return list.find((i) => i.system?.slug === slug || i.slug === slug) ?? null;
}

function hasOption(actor, option) {
  return !!actor?.rollOptions?.all?.[option];
}

function roundKey() {
  return `${game.combat?.id ?? "none"}:${game.combat?.round ?? 0}:${game.combat?.turn ?? 0}`;
}

/** 叠层：同 slug 效果再施加时改为 +1 层，而不是重复挂 */
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

/** 猎杀中毒：回合结束自动 −1 层 */
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

/** 活力针清灼烬；解毒针清中毒；医生加倍治疗 */
function installMedicalHooks() {
  // 施加解毒针效果时清中毒
  Hooks.on("createItem", async (item) => {
    if (item.type !== "effect" || !canManage(item.parent)) return;
    const slug = item.system?.slug;
    const actor = item.parent;
    if (slug === SLUGS.antidote) {
      const poison = findBySlug(actor, "effect", SLUGS.poison);
      if (poison) await poison.delete();
    }
  });

  // 使用活力针：清灼烬；窒息炸弹：对选中令牌清灼烬
  Hooks.on("createChatMessage", async (message) => {
    if (message.author?.id !== game.user.id) return;
    const item = message.item;
    const actor = message.actor;
    if (!item || !canManage(actor)) return;
    const slug = item.system?.slug;

    if (slug === SLUGS.vitality && actor) {
      const burn = findBySlug(actor, "effect", SLUGS.burn);
      if (burn) await burn.delete();
    }

    if (slug === "choke-bomb") {
      const tokens =
        canvas.tokens?.controlled?.length > 0
          ? canvas.tokens.controlled
          : actor?.getActiveTokens?.(true, true) ?? [];
      for (const t of tokens) {
        const a = t.actor;
        if (!a || !canManage(a)) continue;
        const burn = findBySlug(a, "effect", SLUGS.burn);
        if (burn) await burn.delete();
        // 熄灭火场标记
        const blaze = a.itemTypes.effect.filter((e) =>
          [
            "effect-fire-bomb-blaze",
            "effect-liquid-fire-bomb-blaze",
            "effect-hellfire-bomb-blaze",
          ].includes(e.system?.slug)
        );
        if (blaze.length) {
          await a.deleteEmbeddedDocuments(
            "Item",
            blaze.map((i) => i.id)
          );
        }
      }
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content:
          "<p><strong>窒息炸弹</strong>：已对选中令牌清除灼烬/火场标记（请先选中云内目标）。豁免请按物品说明手动检定。</p>",
      });
    }
  });

  // 医生：applyDamage 治疗量翻倍（开关开启时）
  const ActorCls = CONFIG.Actor.documentClass;
  if (ActorCls.prototype.__huntDoctorPatched) return;
  const original = ActorCls.prototype.applyDamage;
  ActorCls.prototype.applyDamage = async function huntDoctorApplyDamage(params) {
    let damage = params?.damage;
    const doctor = findBySlug(this, "feat", SLUGS.doctor);
    if (
      doctor &&
      hasOption(this, "hunt-doctor-double-heal") &&
      typeof damage === "number" &&
      damage < 0
    ) {
      damage *= 2;
      params = { ...params, damage };
      // 用完关掉开关，避免一直翻倍
      try {
        const rule = doctor.system.rules?.find(
          (r) => r.key === "RollOption" && r.option === "hunt-doctor-double-heal"
        );
        if (rule) {
          // 通过 toggle 关闭：更新 domain selection
          await this.toggleRollOption?.("all", "hunt-doctor-double-heal", false);
        }
      } catch {
        /* ignore */
      }
    }
    return original.call(this, params);
  };
  ActorCls.prototype.__huntDoctorPatched = true;
}

/** 投掷斧：投掷打击 +2 命中（近似忽略轻甲物品 AC） */
function enhanceThrowingAxeRules() {
  // 规则已在 JSON 中补充；此处仅作运行时兜底 Note
}

function weaponEquipped(actor, slug) {
  const w = findBySlug(actor, "weapon", slug);
  return !!(w && (w.isEquipped || w.system?.equipped?.carryType === "held"));
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

    if (weaponEquipped(actor, SLUGS.bornheim)) {
      want.set(
        ACTION_SLUGS.bornheim,
        makeAction({
          slug: ACTION_SLUGS.bornheim,
          name: "Bornheim · 速射扳机",
          actions: 1,
          actionType: "action",
          description:
            "<p>进行两次 Bornheim 打击：各 −3 环境减值，共享当前 MAP（自动结算）。</p>",
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
            "<p>每轮一次：免费完成一次装填（需双手各持武器或半自动手枪）。点击后在聊天记录中声明，并手动完成弹药装填。</p>",
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
          description:
            "<p>拆除 10 尺内带引信的未爆物/黏性炸弹效果（自动寻找并移除相关效果）。</p>",
        })
      );
    }

    // Swift 免费快步：由装填钩授予临时动作，不在常驻 sync 里

    const existing = actor.itemTypes.action.filter(
      (a) => a.flags?.[MODULE_ID]?.huntGrantedAction
    );
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
      if (have.has(slug)) continue;
      toCreate.push(data);
    }
    if (toCreate.length) {
      await Item.createDocuments(toCreate, { parent: actor, render: false });
    }
  } finally {
    syncing.delete(key);
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
    game.pf2e?.Modifier?.modifier ??
    game.pf2e?.Modifier?.ModifierPF2e ??
    CONFIG.PF2E?.Modifier;
  if (!Mod) return null;
  return new Mod({ label, modifier: value, type: "circumstance", slug });
}

async function handleBornheimRapid(actor) {
  const weapon = findBySlug(actor, "weapon", SLUGS.bornheim);
  if (!weapon) {
    ui.notifications.warn("未装备 Bornheim No.3");
    return;
  }
  const strike = actor.system?.actions?.find(
    (a) => a.item?.id === weapon.id || a.slug === weapon.system?.slug
  );
  const mod = makeCircumstanceMod("速射扳机", -3, "hunt-bornheim-rapid");
  const rollOpts = {
    skipDialog: true,
    // 共享同一 MAP：不推进 MAP（若 API 支持）
    consumeAmmo: true,
  };
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
    if (typeof weapon.rollAttack === "function") {
      await weapon.rollAttack(rollOpts);
      await weapon.rollAttack(rollOpts);
      return;
    }
  } catch (err) {
    console.warn(`${MODULE_ID} | Bornheim rapid failed`, err);
  }
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content:
      "<p><strong>速射扳机</strong>：请立即进行两次 Bornheim 打击（各 −3 环境，共享当前 MAP）。</p>",
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
  const allies = canvas.tokens?.placeables?.filter((t) => {
    if (!t.actor || t.actor === actor) return false;
    if (!t.actor.hasCondition?.("dying")) return false;
    if (!origin) return true;
    const d = canvas.grid.measurePath([origin.center, t.center]).distance;
    return d <= 30;
  }) ?? [];

  let target = allies[0]?.actor;
  if (!target && actor.hasCondition?.("dying")) target = actor; // 孤狼自救
  if (!target) {
    ui.notifications.warn("30 尺内没有濒死盟友（可选中自身孤狼自救）");
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
    // success or better
    const dying = target.getCondition?.("dying");
    if (dying) await target.toggleCondition?.("dying", { forceRemove: true });
    await target.update({ "system.attributes.hp.value": 1 });
    if (dos >= 3) {
      await target.applyDamage({ damage: -Math.max(1, (await new Roll("1d8").evaluate()).total), token: target.getActiveTokens?.()?.[0] });
    }
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><strong>暗视苏生</strong>成功：${target.name} 恢复至 1 HP${dos >= 3 ? "（并额外治疗）" : ""}。</p>`,
    });
  } else if (dos <= 0) {
    await actor.applyDamage({ damage: (await new Roll("1d6").evaluate()).total });
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><strong>暗视苏生</strong>大失败：你受到虚体伤害。</p>`,
    });
  } else {
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><strong>暗视苏生</strong>失败，无效。</p>`,
    });
  }
}

async function handleDauntless(actor) {
  const tokens = actor.getActiveTokens?.(true, true) ?? [];
  const origin = tokens[0];
  const fuseSlugs = [
    "effect-sticky-bomb",
    "effect-hunt-sticky",
    "whbHuntStkFx0001",
  ];
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
    content: `<p><strong>双持精通</strong>：本次装填视为<strong>自由动作</strong>。请完成弹药装填。</p>`,
  });
}

function installActionHandler() {
  Hooks.on("createChatMessage", async (message) => {
    if (message.author?.id !== game.user.id) return;
    const item = message.item;
    const actor = message.actor;
    if (!item || !actor || !canManage(actor)) return;
    if (item.type !== "action") return;
    const slug =
      item.flags?.[MODULE_ID]?.huntGrantedAction ?? item.system?.slug;
    const key = `${message.id}:${slug}`;
    if (handled.has(key)) return;
    handled.add(key);
    setTimeout(() => handled.delete(key), 4000);

    if (slug === ACTION_SLUGS.bornheim) await handleBornheimRapid(actor);
    else if (slug === ACTION_SLUGS.necro) await handleNecromancer(actor);
    else if (slug === ACTION_SLUGS.dauntless) await handleDauntless(actor);
    else if (slug === ACTION_SLUGS.swiftStep) await handleSwiftStep(actor, item);
    else if (slug === ACTION_SLUGS.ambiReload) await handleAmbiReload(actor);
  });
}

/** 侦测装填聊天 → Swift 免费快步 */
function installReloadHook() {
  Hooks.on("createChatMessage", async (message) => {
    if (message.author?.id !== game.user.id) return;
    const actor = message.actor;
    if (!actor || !canManage(actor)) return;
    if (!weaponEquipped(actor, SLUGS.swift)) return;

    const flavor = `${message.flavor ?? ""} ${message.content ?? ""}`;
    const ctx = message.flags?.pf2e?.context;
    const isReload =
      ctx?.type === "weapon-reload" ||
      /reload|装填|Reload|Interact/i.test(flavor);
    // 更严：有武器引用且为 swift
    const item = message.item;
    const isSwiftItem =
      item?.system?.slug === SLUGS.swift ||
      message.flags?.pf2e?.origin?.slug === SLUGS.swift;

    if (isReload && (isSwiftItem || /swift|速射|Winfield|快速循环/i.test(flavor))) {
      const rk = `${FLAG}.swiftStep:${roundKey()}:${actor.id}`;
      if (actor.getFlag(MODULE_ID, rk)) return;
      await actor.setFlag(MODULE_ID, rk, true);
      await grantSwiftStep(actor);
    }
  });
}

/** 火场标记效果：回合开始叠灼烬 */
function installFireFieldTick() {
  const fireSlugs = [
    "effect-fire-bomb-blaze",
    "effect-liquid-fire-bomb-blaze",
    "effect-hellfire-bomb-blaze",
  ];
  Hooks.on("pf2e.startTurn", async (combatant) => {
    const actor = combatant?.actor;
    if (!canManage(actor)) return;
    const inFire = actor.itemTypes.effect.some((e) =>
      fireSlugs.includes(e.system?.slug)
    );
    if (!inFire) return;

    const pack = game.packs.get(`${MODULE_ID}.homebrew-items`);
    const src = pack ? await pack.getDocument("whbHuntBurnFx001") : null;
    if (!src) return;
    const data = src.toObject();
    delete data._id;
    // preCreate 叠层钩子会处理已有灼烬
    await Item.createDocuments([data], { parent: actor, render: false });
  });
}

function installSyncHooks() {
  const sync = (doc) => {
    const actor = doc?.actor ?? (doc?.documentName === "Actor" ? doc : null);
    if (actor) syncGrantedActions(actor).catch(console.error);
  };
  Hooks.on("createItem", (item) => {
    if (item.parent) sync(item.parent);
  });
  Hooks.on("deleteItem", (item) => {
    if (item.parent) sync(item.parent);
  });
  Hooks.on("updateItem", (item) => {
    if (item.type === "weapon" && item.parent) sync(item.parent);
  });
  Hooks.on("createToken", (tokenDoc) => {
    if (tokenDoc.actor) sync(tokenDoc.actor);
  });
  Hooks.once("ready", () => {
    for (const a of game.actors.contents) syncGrantedActions(a).catch(() => {});
  });
}

export function installHuntShowdownAutomation() {
  installStackingHook();
  installPoisonTick();
  installMedicalHooks();
  installActionHandler();
  installReloadHook();
  installFireFieldTick();
  installSyncHooks();
  enhanceThrowingAxeRules();
  console.log(`${MODULE_ID} | Hunt: Showdown automation ready`);
}
