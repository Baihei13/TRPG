/**
 * 队伍陷阱工具：可选目标，挂/卸状态或扣血/治疗。
 * 也可被 Active Tiles 等以参数直接调用（跳过对话框）。
 */

const COMMON_CONDITIONS = [
  ["restrained", "束缚 Restrained"],
  ["grabbed", "擒拿 Grabbed"],
  ["prone", "倒地 Prone"],
  ["off-guard", "无防备 Off-Guard"],
  ["frightened", "惊惧 Frightened"],
  ["sickened", "恶心 Sickened"],
  ["clumsy", "笨拙 Clumsy"],
  ["enfeebled", "虚弱 Enfeebled"],
  ["drained", "生命汲取 Drained"],
  ["stunned", "震慑 Stunned"],
  ["slowed", "迟缓 Slowed"],
  ["blinded", "目盲 Blinded"],
  ["deafened", "耳聋 Deafened"],
  ["paralyzed", "麻痹 Paralyzed"],
  ["confused", "困惑 Confused"],
  ["fascinated", "迷魂 Fascinated"],
  ["fleeing", "逃离 Fleeing"],
  ["immobilized", "定身 Immobilized"],
  ["petrified", "石化 Petrified"],
  ["unconscious", "昏迷 Unconscious"],
  ["dying", "濒死 Dying"],
  ["wounded", "受伤 Wounded"],
  ["doomed", "厄运 Doomed"],
  ["fatigued", "疲乏 Fatigued"],
  ["hidden", "隐蔽 Hidden"],
  ["invisible", "隐形 Invisible"],
];

const DAMAGE_TYPES = [
  ["untyped", "无类型"],
  ["bludgeoning", "钝击"],
  ["piercing", "穿刺"],
  ["slashing", "挥砍"],
  ["fire", "火焰"],
  ["cold", "寒冷"],
  ["electricity", "电击"],
  ["acid", "强酸"],
  ["poison", "毒素"],
  ["mental", "精神"],
  ["sonic", "音波"],
  ["force", "力场"],
  ["spirit", "精魂"],
  ["vitality", "生命"],
  ["void", "虚空"],
];

function partyMembers() {
  const party = game.actors.party;
  if (!party) return [];
  return party.members.filter((a) => a?.isOfType?.("character", "npc"));
}

function selectedActors() {
  return canvas.tokens.controlled
    .map((t) => t.actor)
    .filter((a) => a && a.isOfType("character", "npc", "familiar", "hazard"));
}

/**
 * @param {"party"|"selected"|"mixed"|string[]} targetMode
 * @param {string[]} [checkedIds]
 */
function resolveTargets(targetMode, checkedIds = []) {
  if (Array.isArray(targetMode)) {
    return targetMode.map((id) => game.actors.get(id)).filter(Boolean);
  }
  if (targetMode === "party") return partyMembers();
  if (targetMode === "selected") return selectedActors();
  if (targetMode === "mixed") {
    const byId = new Map();
    for (const a of [...partyMembers(), ...selectedActors()]) byId.set(a.id, a);
    for (const id of checkedIds) {
      const a = game.actors.get(id);
      if (a) byId.set(a.id, a);
    }
    return [...byId.values()];
  }
  return [];
}

async function applyCondition(actor, slug, value) {
  if (!slug) return;
  const valued = Number.isFinite(value) && value > 0;
  if (valued) {
    await actor.increaseCondition(slug, { value });
  } else if (!actor.hasCondition(slug)) {
    await actor.toggleCondition(slug);
  }
}

async function removeCondition(actor, slug) {
  if (!slug || !actor.hasCondition(slug)) return;
  const item = actor.itemTypes.condition.find((c) => c.slug === slug);
  if (item) await item.delete();
  else await actor.toggleCondition(slug);
}

async function applyHpChange(actor, amount, { heal = false, damageType = "untyped" } = {}) {
  const n = Math.abs(Number(amount) || 0);
  if (!n) return;
  const token = actor.getActiveTokens(true, true)[0]?.document;
  const delta = heal ? -n : n;
  await actor.applyDamage({ damage: delta, token });
  const verb = heal ? "恢复" : "受到";
  const typeNote = !heal && damageType !== "untyped" ? `（${damageType}）` : "";
  await ChatMessage.create({
    content: `<p><strong>${foundry.utils.escapeHTML(actor.name)}</strong> ${verb} ${n} 点生命${typeNote}。</p>`,
    speaker: ChatMessage.getSpeaker({ actor }),
    whisper: ChatMessage.getWhisperRecipients("GM").map((u) => u.id),
  });
}

/**
 * @param {object} [opts]
 * @param {"condition"|"remove-condition"|"damage"|"heal"} [opts.mode]
 * @param {string} [opts.condition]
 * @param {number} [opts.value]
 * @param {number} [opts.amount]
 * @param {string} [opts.damageType]
 * @param {"party"|"selected"|string[]} [opts.targets]
 * @param {boolean} [opts.silent]
 */
export async function applyPartyTrap(opts = {}) {
  const {
    mode,
    condition,
    value,
    amount,
    damageType = "untyped",
    targets = "party",
    silent = false,
  } = opts;

  const actors = resolveTargets(targets);
  if (!actors.length) {
    ui.notifications.warn("没有可用目标（检查 Party 成员或选中的 token）");
    return { ok: false, count: 0 };
  }

  let done = 0;
  for (const actor of actors) {
    try {
      if (mode === "condition") await applyCondition(actor, condition, value);
      else if (mode === "remove-condition") await removeCondition(actor, condition);
      else if (mode === "damage") await applyHpChange(actor, amount, { damageType });
      else if (mode === "heal") await applyHpChange(actor, amount, { heal: true });
      else continue;
      done++;
    } catch (err) {
      console.error(`[wang-pf2e-homebrew] party-trap → ${actor.name}`, err);
    }
  }

  if (!silent) {
    const label =
      mode === "condition"
        ? `挂上 ${condition}`
        : mode === "remove-condition"
          ? `移除 ${condition}`
          : mode === "damage"
            ? `伤害 ${amount}`
            : mode === "heal"
              ? `治疗 ${amount}`
              : mode;
    ui.notifications.info(`已对 ${done} 名目标执行：${label}`);
  }
  return { ok: true, count: done, actors };
}

function buildDialogContent() {
  const members = partyMembers();
  const selected = selectedActors();
  const memberBoxes = members.length
    ? members
        .map(
          (a) =>
            `<label class="whb-trap-row"><input type="checkbox" name="actorIds" value="${a.id}" checked/> ${foundry.utils.escapeHTML(a.name)}</label>`
        )
        .join("")
    : `<p class="notes">当前没有活动 Party 成员。可改用「仅当前选中」。</p>`;

  const selectedNote = selected.length
    ? `<p class="notes">当前选中：${selected.map((a) => foundry.utils.escapeHTML(a.name)).join("、")}</p>`
    : `<p class="notes">画布上尚未选中 token。</p>`;

  const condOpts = COMMON_CONDITIONS.map(
    ([slug, label]) => `<option value="${slug}">${label}</option>`
  ).join("");
  const dmgOpts = DAMAGE_TYPES.map(
    ([slug, label]) => `<option value="${slug}">${label}</option>`
  ).join("");

  return `
<form class="whb-party-trap flexcol" style="gap:0.6rem;min-width:22rem;">
  <fieldset>
    <legend>动作</legend>
    <label><input type="radio" name="mode" value="condition" checked/> 挂状态</label>
    <label><input type="radio" name="mode" value="remove-condition"/> 移除状态</label>
    <label><input type="radio" name="mode" value="damage"/> 扣血</label>
    <label><input type="radio" name="mode" value="heal"/> 治疗</label>
  </fieldset>

  <fieldset>
    <legend>目标范围</legend>
    <label><input type="radio" name="targetMode" value="checked" checked/> 勾选的队员（下方列表）</label>
    <label><input type="radio" name="targetMode" value="party"/> 活动队伍全部成员</label>
    <label><input type="radio" name="targetMode" value="selected"/> 仅当前选中的 token</label>
    <label><input type="radio" name="targetMode" value="party+selected"/> 队伍成员 + 当前选中</label>
    ${selectedNote}
    <div style="max-height:10rem;overflow:auto;display:flex;flex-direction:column;gap:0.25rem;margin-top:0.35rem;">
      ${memberBoxes}
    </div>
  </fieldset>

  <fieldset>
    <legend>状态</legend>
    <div class="form-group">
      <label>状态</label>
      <select name="condition">${condOpts}</select>
    </div>
    <div class="form-group">
      <label>层数（惊惧/恶心等；无层数则留空或 0）</label>
      <input type="number" name="value" min="0" step="1" placeholder="例如 1"/>
    </div>
  </fieldset>

  <fieldset>
    <legend>生命值</legend>
    <div class="form-group">
      <label>数值</label>
      <input type="number" name="amount" min="0" step="1" value="5"/>
    </div>
    <div class="form-group">
      <label>伤害类型（仅扣血）</label>
      <select name="damageType">${dmgOpts}</select>
    </div>
  </fieldset>
</form>`;
}

function readForm(root) {
  const form = root.querySelector?.("form") ?? root;
  const mode = form.querySelector('input[name="mode"]:checked')?.value ?? "condition";
  const targetMode = form.querySelector('input[name="targetMode"]:checked')?.value ?? "checked";
  const condition = form.querySelector('select[name="condition"]')?.value ?? "restrained";
  const valueRaw = form.querySelector('input[name="value"]')?.value;
  const value = valueRaw === "" || valueRaw == null ? undefined : Number(valueRaw);
  const amount = Number(form.querySelector('input[name="amount"]')?.value || 0);
  const damageType = form.querySelector('select[name="damageType"]')?.value ?? "untyped";
  const checkedIds = [...form.querySelectorAll('input[name="actorIds"]:checked')].map((el) => el.value);

  let targets;
  if (targetMode === "party") targets = "party";
  else if (targetMode === "selected") targets = "selected";
  else if (targetMode === "party+selected") {
    targets = [...new Set([...partyMembers(), ...selectedActors()].map((a) => a.id))];
  } else {
    targets = checkedIds;
  }

  return { mode, condition, value, amount, damageType, targets };
}

/** 打开交互对话框（给宏 / Hotbar 用） */
export async function openPartyTrapDialog() {
  const DialogV2 = foundry.applications.api.DialogV2;
  const data = await DialogV2.prompt({
    window: { title: "队伍陷阱 / 效果工具", icon: "fa-solid fa-skull-crossbones" },
    content: buildDialogContent(),
    ok: {
      label: "执行",
      icon: "fa-solid fa-check",
      callback: (_event, button, dialog) => {
        const root = button?.form ?? dialog?.element ?? button;
        return readForm(root);
      },
    },
    cancel: { label: "取消" },
  });
  if (!data) return null;
  return applyPartyTrap(data);
}
