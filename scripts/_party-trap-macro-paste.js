/**
 * 队伍陷阱工具（紧凑可滚动版）
 * Active Tiles 可传 args：
 * { mode:"condition", condition:"restrained", targets:"party" }
 * { mode:"damage", amount:10, damageType:"piercing", targets:"party" }
 */

const COMMON_CONDITIONS = [
  ["restrained", "束缚"],
  ["grabbed", "擒拿"],
  ["prone", "倒地"],
  ["off-guard", "无防备"],
  ["frightened", "惊惧"],
  ["sickened", "恶心"],
  ["clumsy", "笨拙"],
  ["enfeebled", "虚弱"],
  ["drained", "生命汲取"],
  ["stunned", "震慑"],
  ["slowed", "迟缓"],
  ["blinded", "目盲"],
  ["deafened", "耳聋"],
  ["paralyzed", "麻痹"],
  ["confused", "困惑"],
  ["fascinated", "迷魂"],
  ["fleeing", "逃离"],
  ["immobilized", "定身"],
  ["petrified", "石化"],
  ["unconscious", "昏迷"],
  ["dying", "濒死"],
  ["wounded", "受伤"],
  ["doomed", "厄运"],
  ["fatigued", "疲乏"],
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
];

function esc(s) {
  return foundry.utils.escapeHTML(String(s ?? ""));
}

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

function resolveTargets(targetMode) {
  if (Array.isArray(targetMode)) {
    return targetMode.map((id) => game.actors.get(id)).filter(Boolean);
  }
  if (targetMode === "party") return partyMembers();
  if (targetMode === "selected") return selectedActors();
  if (targetMode === "party+selected") {
    const m = new Map();
    for (const a of [...partyMembers(), ...selectedActors()]) m.set(a.id, a);
    return [...m.values()];
  }
  return [];
}

async function applyCondition(actor, slug, value) {
  if (!slug) return;
  if (Number.isFinite(value) && value > 0) await actor.increaseCondition(slug, { value });
  else if (!actor.hasCondition(slug)) await actor.toggleCondition(slug);
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
  await actor.applyDamage({ damage: heal ? -n : n, token });
  const verb = heal ? "恢复" : "受到";
  const typeNote = !heal && damageType !== "untyped" ? `（${damageType}）` : "";
  await ChatMessage.create({
    content: `<p><strong>${esc(actor.name)}</strong> ${verb} ${n} 点生命${typeNote}。</p>`,
    speaker: ChatMessage.getSpeaker({ actor }),
    whisper: ChatMessage.getWhisperRecipients("GM").map((u) => u.id),
  });
}

async function applyPartyTrap(opts = {}) {
  const {
    mode,
    condition,
    value,
    amount,
    damageType = "untyped",
    targets = "party",
    silent = false,
  } = opts;

  let actorList;
  if (Array.isArray(targets) || targets === "party" || targets === "selected" || targets === "party+selected") {
    actorList = resolveTargets(targets);
  } else {
    actorList = resolveTargets("party");
  }

  if (!actorList.length) {
    ui.notifications.warn("没有可用目标（检查 Party 成员或选中的 token）");
    return { ok: false, count: 0 };
  }

  let done = 0;
  for (const actor of actorList) {
    try {
      if (mode === "condition") await applyCondition(actor, condition, value);
      else if (mode === "remove-condition") await removeCondition(actor, condition);
      else if (mode === "damage") await applyHpChange(actor, amount, { damageType });
      else if (mode === "heal") await applyHpChange(actor, amount, { heal: true });
      else continue;
      done++;
    } catch (err) {
      console.error(`party-trap → ${actor.name}`, err);
    }
  }

  if (!silent) {
    const label =
      mode === "condition" ? `挂上 ${condition}`
      : mode === "remove-condition" ? `移除 ${condition}`
      : mode === "damage" ? `伤害 ${amount}`
      : mode === "heal" ? `治疗 ${amount}`
      : mode;
    ui.notifications.info(`已对 ${done} 名目标执行：${label}`);
  }
  return { ok: true, count: done };
}

function buildDialogContent() {
  const members = partyMembers();
  const selected = selectedActors();
  const memberBoxes = members.length
    ? members
        .map(
          (a) =>
            `<label style="display:inline-flex;align-items:center;gap:0.25rem;margin:0.15rem 0.5rem 0.15rem 0;"><input type="checkbox" name="actorIds" value="${a.id}" checked/>${esc(a.name)}</label>`
        )
        .join("")
    : `<span class="notes">无 Party 成员</span>`;

  const selectedNote = selected.length
    ? `已选中：${selected.map((a) => esc(a.name)).join("、")}`
    : "画布未选中 token";

  const condOpts = COMMON_CONDITIONS.map(
    ([slug, label]) => `<option value="${slug}">${label}</option>`
  ).join("");
  const dmgOpts = DAMAGE_TYPES.map(
    ([slug, label]) => `<option value="${slug}">${label}</option>`
  ).join("");

  return `
<style>
  .whb-trap { display:flex; flex-direction:column; gap:0.55rem; max-height:min(70vh, 560px); overflow-y:auto; padding-right:0.25rem; }
  .whb-trap .row { display:flex; flex-wrap:wrap; gap:0.45rem 0.75rem; align-items:center; }
  .whb-trap label { white-space:nowrap; }
  .whb-trap .block { border:1px solid #555; border-radius:6px; padding:0.45rem 0.55rem; }
  .whb-trap .title { font-weight:700; margin-bottom:0.3rem; opacity:0.9; }
  .whb-trap .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:0.4rem 0.6rem; align-items:center; }
  .whb-trap select, .whb-trap input[type="number"] { width:100%; }
</style>
<div class="whb-trap">
  <div class="block">
    <div class="title">动作</div>
    <div class="row">
      <label><input type="radio" name="mode" value="condition" checked/> 挂状态</label>
      <label><input type="radio" name="mode" value="remove-condition"/> 移除状态</label>
      <label><input type="radio" name="mode" value="damage"/> 扣血</label>
      <label><input type="radio" name="mode" value="heal"/> 治疗</label>
    </div>
  </div>

  <div class="block">
    <div class="title">目标</div>
    <div class="row">
      <label><input type="radio" name="targetMode" value="checked" checked/> 勾选队员</label>
      <label><input type="radio" name="targetMode" value="party"/> 全队</label>
      <label><input type="radio" name="targetMode" value="selected"/> 仅选中</label>
      <label><input type="radio" name="targetMode" value="party+selected"/> 全队+选中</label>
    </div>
    <div class="notes" style="margin:0.25rem 0;">${selectedNote}</div>
    <div class="row">${memberBoxes}</div>
  </div>

  <div class="block">
    <div class="title">状态 / 生命</div>
    <div class="grid2">
      <label>状态<select name="condition">${condOpts}</select></label>
      <label>层数<input type="number" name="value" min="0" step="1" placeholder="可选"/></label>
      <label>数值<input type="number" name="amount" min="0" step="1" value="5"/></label>
      <label>伤害类型<select name="damageType">${dmgOpts}</select></label>
    </div>
  </div>
</div>`;
}

function readForm(root) {
  const form = root.querySelector?.(".whb-trap") ?? root;
  const q = (sel) => form.querySelector(sel);
  const mode = q('input[name="mode"]:checked')?.value ?? "condition";
  const targetMode = q('input[name="targetMode"]:checked')?.value ?? "checked";
  const condition = q('select[name="condition"]')?.value ?? "restrained";
  const valueRaw = q('input[name="value"]')?.value;
  const value = valueRaw === "" || valueRaw == null ? undefined : Number(valueRaw);
  const amount = Number(q('input[name="amount"]')?.value || 0);
  const damageType = q('select[name="damageType"]')?.value ?? "untyped";
  const checkedIds = [...form.querySelectorAll('input[name="actorIds"]:checked')].map((el) => el.value);

  let targets;
  if (targetMode === "checked") targets = checkedIds;
  else targets = targetMode;

  return { mode, condition, value, amount, damageType, targets };
}

async function openPartyTrapDialog() {
  const DialogV2 = foundry.applications.api.DialogV2;
  const data = await DialogV2.wait({
    window: {
      title: "队伍陷阱 / 效果工具",
      icon: "fa-solid fa-skull-crossbones",
      resizable: true,
    },
    position: { width: 460 },
    content: buildDialogContent(),
    buttons: [
      {
        action: "ok",
        label: "执行",
        icon: "fa-solid fa-check",
        default: true,
        callback: (_event, button, dialog) => {
          const root = dialog?.element ?? button?.form ?? button;
          return readForm(root);
        },
      },
      {
        action: "cancel",
        label: "取消",
        icon: "fa-solid fa-xmark",
      },
    ],
  });
  if (!data) return null;
  return applyPartyTrap(data);
}

const preset = typeof args !== "undefined" && args?.[0] && typeof args[0] === "object" ? args[0] : null;
if (preset?.mode) await applyPartyTrap(preset);
else await openPartyTrapDialog();
