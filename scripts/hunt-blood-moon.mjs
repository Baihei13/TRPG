/**
 * 猎杀对决 · 血月场景 buff
 * 激活后：当前场景所有 huntMonster +1 挑战等级，并同步抬升 AC / 豁免 / 感知 / 技能 / 攻击 / 伤害 / HP。
 * 关闭时按快照还原。新投放的怪物在血月期间也会自动强化。
 */
const MODULE_ID = "wang-pf2e-homebrew";
const FLAG_SCENE = "bloodMoon";
const FLAG_APPLIED = "bloodMoonApplied";
const FLAG_SNAP = "bloodMoonSnapshot";
const EFFECT_ID = "whbHuntBldMoonFx";
const PACK_ITEMS = `${MODULE_ID}.homebrew-items`;

function isHuntMonster(actor) {
  return Boolean(actor?.flags?.[MODULE_ID]?.huntMonster);
}

export function isBloodMoonActive(scene = canvas.scene) {
  return Boolean(scene?.getFlag?.(MODULE_ID, FLAG_SCENE));
}

function monstersOnScene(scene = canvas.scene) {
  if (!scene) return [];
  const tokens = scene.tokens?.contents ?? [];
  const out = [];
  const seen = new Set();
  for (const td of tokens) {
    const actor = td.actor;
    if (!actor || !isHuntMonster(actor)) continue;
    if (seen.has(actor.uuid)) continue;
    seen.add(actor.uuid);
    out.push(actor);
  }
  return out;
}

function hpGainForLevel(level) {
  return Math.max(10, 10 + Math.floor(Number(level) || 1));
}

function bumpDamageFormula(formula) {
  const s = String(formula || "").trim();
  if (!s) return s;
  const m = s.match(/^(.*?)([+-]\d+)\s*$/);
  if (m) {
    const base = m[1];
    const n = Number(m[2]) + 1;
    return `${base}${n >= 0 ? `+${n}` : String(n)}`;
  }
  return `${s}+1`;
}

function bumpDescription(html = "") {
  return String(html).replace(/\|dc:(\d+)/gi, (_, n) => `|dc:${Number(n) + 1}`);
}

function unbumpDescription(html = "", original) {
  return original ?? html;
}

async function ensureBloodMoonEffect(actor) {
  const existing = actor.itemTypes?.effect?.find(
    (e) => e.flags?.[MODULE_ID]?.bloodMoonEffect || e.system?.slug === "effect-blood-moon",
  );
  if (existing) return existing;
  const pack = game.packs.get(PACK_ITEMS);
  const src = pack ? await pack.getDocument(EFFECT_ID) : null;
  if (!src) return null;
  const data = src.toObject();
  delete data._id;
  data.flags = data.flags || {};
  data.flags[MODULE_ID] = { ...(data.flags[MODULE_ID] || {}), bloodMoonEffect: true };
  const [created] = await actor.createEmbeddedDocuments("Item", [data], { render: false });
  return created;
}

async function removeBloodMoonEffect(actor) {
  const ids = (actor.itemTypes?.effect ?? [])
    .filter((e) => e.flags?.[MODULE_ID]?.bloodMoonEffect || e.system?.slug === "effect-blood-moon")
    .map((e) => e.id);
  if (ids.length) await actor.deleteEmbeddedDocuments("Item", ids, { render: false });
}

/**
 * 对单个怪物施加血月强化（幂等）。
 */
export async function applyBloodMoonToActor(actor) {
  if (!actor || !isHuntMonster(actor)) return false;
  if (actor.getFlag(MODULE_ID, FLAG_APPLIED)) {
    await ensureBloodMoonEffect(actor);
    return false;
  }

  const level = Number(actor.system?.details?.level?.value ?? 1);
  const hpMax = Number(actor.system?.attributes?.hp?.max ?? 0);
  const hpVal = Number(actor.system?.attributes?.hp?.value ?? hpMax);
  const hpGain = hpGainForLevel(level);

  const meleeSnap = [];
  const meleeUpdates = [];
  for (const item of actor.itemTypes?.melee ?? []) {
    const bonus = Number(item.system?.bonus?.value ?? 0);
    const rolls = foundry.utils.deepClone(item.system?.damageRolls ?? {});
    meleeSnap.push({
      id: item.id,
      bonus,
      damageRolls: foundry.utils.deepClone(rolls),
    });
    const nextRolls = foundry.utils.deepClone(rolls);
    for (const key of Object.keys(nextRolls)) {
      if (nextRolls[key]?.damage) {
        nextRolls[key].damage = bumpDamageFormula(nextRolls[key].damage);
      }
    }
    meleeUpdates.push({
      _id: item.id,
      "system.bonus.value": bonus + 1,
      "system.damageRolls": nextRolls,
    });
  }

  const actionSnap = [];
  const actionUpdates = [];
  for (const item of actor.itemTypes?.action ?? []) {
    const desc = item.system?.description?.value ?? "";
    actionSnap.push({ id: item.id, description: desc });
    const next = bumpDescription(desc);
    if (next !== desc) {
      actionUpdates.push({ _id: item.id, "system.description.value": next });
    }
  }

  const skills = foundry.utils.deepClone(actor.system?.skills ?? {});
  const skillsNext = foundry.utils.deepClone(skills);
  for (const key of Object.keys(skillsNext)) {
    if (typeof skillsNext[key]?.base === "number") skillsNext[key].base += 1;
  }

  const snapshot = {
    level,
    ac: Number(actor.system?.attributes?.ac?.value ?? 0),
    hpMax,
    hpValue: hpVal,
    perception: Number(actor.system?.perception?.mod ?? 0),
    saves: {
      fortitude: Number(actor.system?.saves?.fortitude?.value ?? 0),
      reflex: Number(actor.system?.saves?.reflex?.value ?? 0),
      will: Number(actor.system?.saves?.will?.value ?? 0),
    },
    skills,
    melee: meleeSnap,
    actions: actionSnap,
    hpGain,
  };

  await actor.update(
    {
      [`flags.${MODULE_ID}.${FLAG_APPLIED}`]: true,
      [`flags.${MODULE_ID}.${FLAG_SNAP}`]: snapshot,
      "system.details.level.value": level + 1,
      "system.attributes.ac.value": snapshot.ac + 1,
      "system.attributes.hp.max": hpMax + hpGain,
      "system.attributes.hp.value": Math.min(hpMax + hpGain, hpVal + hpGain),
      "system.perception.mod": snapshot.perception + 1,
      "system.saves.fortitude.value": snapshot.saves.fortitude + 1,
      "system.saves.reflex.value": snapshot.saves.reflex + 1,
      "system.saves.will.value": snapshot.saves.will + 1,
      "system.skills": skillsNext,
    },
    { render: false },
  );

  if (meleeUpdates.length) {
    await actor.updateEmbeddedDocuments("Item", meleeUpdates, { render: false });
  }
  if (actionUpdates.length) {
    await actor.updateEmbeddedDocuments("Item", actionUpdates, { render: false });
  }
  await ensureBloodMoonEffect(actor);
  return true;
}

/**
 * 还原单个怪物的血月强化。
 */
export async function removeBloodMoonFromActor(actor) {
  if (!actor) return false;
  const snap = actor.getFlag(MODULE_ID, FLAG_SNAP);
  if (!snap && !actor.getFlag(MODULE_ID, FLAG_APPLIED)) {
    await removeBloodMoonEffect(actor);
    return false;
  }

  if (snap) {
    const updates = {
      [`flags.${MODULE_ID}.${FLAG_APPLIED}`]: false,
      [`flags.${MODULE_ID}.-=${FLAG_SNAP}`]: null,
      "system.details.level.value": snap.level,
      "system.attributes.ac.value": snap.ac,
      "system.attributes.hp.max": snap.hpMax,
      "system.perception.mod": snap.perception,
      "system.saves.fortitude.value": snap.saves.fortitude,
      "system.saves.reflex.value": snap.saves.reflex,
      "system.saves.will.value": snap.saves.will,
      "system.skills": snap.skills,
    };
    // 当前 HP：尽量按「去掉增益」回退，但不把已死怪物拉活
    const cur = Number(actor.system?.attributes?.hp?.value ?? 0);
    if (cur > 0) {
      updates["system.attributes.hp.value"] = Math.max(
        1,
        Math.min(snap.hpMax, cur - Number(snap.hpGain || 0)),
      );
    } else {
      updates["system.attributes.hp.value"] = 0;
    }
    await actor.update(updates, { render: false });

    const meleeUpdates = (snap.melee ?? []).map((m) => ({
      _id: m.id,
      "system.bonus.value": m.bonus,
      "system.damageRolls": m.damageRolls,
    })).filter((u) => actor.items.get(u._id));
    if (meleeUpdates.length) {
      await actor.updateEmbeddedDocuments("Item", meleeUpdates, { render: false });
    }

    const actionUpdates = (snap.actions ?? [])
      .filter((a) => actor.items.get(a.id))
      .map((a) => ({
        _id: a.id,
        "system.description.value": unbumpDescription(undefined, a.description),
      }));
    if (actionUpdates.length) {
      await actor.updateEmbeddedDocuments("Item", actionUpdates, { render: false });
    }
  } else {
    await actor.update(
      {
        [`flags.${MODULE_ID}.${FLAG_APPLIED}`]: false,
        [`flags.${MODULE_ID}.-=${FLAG_SNAP}`]: null,
      },
      { render: false },
    );
  }

  await removeBloodMoonEffect(actor);
  return true;
}

/**
 * 切换或设定当前场景血月。
 * @param {boolean} [force] 指定开/关；省略则切换
 */
export async function toggleBloodMoon(force) {
  if (!game.user.isGM) {
    ui.notifications.warn("只有 GM 可以开关血月。");
    return isBloodMoonActive();
  }
  const scene = canvas.scene;
  if (!scene) {
    ui.notifications.warn("没有活动场景。");
    return false;
  }

  const next = typeof force === "boolean" ? force : !isBloodMoonActive(scene);
  await scene.setFlag(MODULE_ID, FLAG_SCENE, next);

  const monsters = monstersOnScene(scene);
  let changed = 0;
  for (const actor of monsters) {
    const ok = next ? await applyBloodMoonToActor(actor) : await removeBloodMoonFromActor(actor);
    if (ok) changed += 1;
  }

  await ChatMessage.create({
    content: next
      ? `<div class="hunt-blood-moon"><p><strong>🩸 血月升起</strong></p><p>当前场景 <strong>${monsters.length}</strong> 只猎杀怪物挑战等级 +1，AC / 豁免 / 感知 / 技能 / 攻击 / 伤害 / HP 已同步上调（本次新强化 ${changed}）。</p><p><em>新投放的怪物也会自动吃到血月。</em></p></div>`
      : `<div class="hunt-blood-moon"><p><strong>血月消退</strong></p><p>已尝试还原 <strong>${monsters.length}</strong> 只怪物的基础数据（本次还原 ${changed}）。</p></div>`,
  });

  ui.notifications.info(next ? `血月已激活（${monsters.length} 只怪物）` : "血月已关闭");
  return next;
}

export function installHuntBloodMoon() {
  Hooks.on("createToken", async (tokenDoc) => {
    if (!game.user.isGM) return;
    const scene = tokenDoc.parent;
    if (!scene?.getFlag?.(MODULE_ID, FLAG_SCENE)) return;
    // 等 actor 就绪
    await foundry.utils.delay(50);
    const actor = tokenDoc.actor;
    if (!actor || !isHuntMonster(actor)) return;
    const ok = await applyBloodMoonToActor(actor);
    if (ok) {
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `<p><strong>血月</strong>：${actor.name} 已自动 +1 挑战等级。</p>`,
      });
    }
  });

  // 画布就绪时：若场景血月开着，补强漏网怪物
  Hooks.on("canvasReady", async () => {
    if (!game.user.isGM) return;
    if (!isBloodMoonActive()) return;
    for (const actor of monstersOnScene()) {
      await applyBloodMoonToActor(actor);
    }
  });

  console.log(`${MODULE_ID} | Hunt blood moon ready`);
}
