/**
 * 放逐仪式 Banishing
 * 标记此地正在放逐，并显示进度（Token 名会更新）。
 * 热栏 / Active Tiles；不要包 (async () => {})()。
 *
 * args: start | tick | status | complete | reset
 * 可选: boss 屠夫 | max 10 | n 1
 */
const MODULE_ID = "wang-pf2e-homebrew";
const FLAG_KEY = "banishing";
const DEFAULT_MAX = 10;
const HUNT_PROP = "banishing-site";

const argList = typeof args !== "undefined" && Array.isArray(args) ? args : [];
const mattToken = typeof token !== "undefined" ? token : null;
const mattActor = typeof actor !== "undefined" ? actor : null;
const modeRaw = argList[0] ? String(argList[0]).toLowerCase() : "";

function argValue(key, fallback = null) {
  const i = argList.findIndex((a) => String(a).toLowerCase() === String(key).toLowerCase());
  if (i < 0 || i + 1 >= argList.length) return fallback;
  return argList[i + 1];
}

function isBanishActor(a) {
  if (!a) return false;
  const f = a.getFlag?.(MODULE_ID, "huntProp") ?? a.flags?.[MODULE_ID]?.huntProp;
  if (f === HUNT_PROP) return true;
  return /放逐|Banishing/i.test(String(a.name ?? ""));
}

function getState(site) {
  const raw = site.getFlag(MODULE_ID, FLAG_KEY) || {};
  const max = Math.max(1, Number(raw.max) || DEFAULT_MAX);
  return {
    active: Boolean(raw.active),
    progress: Math.max(0, Math.min(max, Number(raw.progress) || 0)),
    max,
    bossName: String(raw.bossName || "Boss"),
    complete: Boolean(raw.complete),
  };
}

async function setState(site, next) {
  await site.setFlag(MODULE_ID, FLAG_KEY, {
    active: next.active,
    progress: next.progress,
    max: next.max,
    bossName: next.bossName,
    complete: next.complete,
  });
}

function bar(progress, max) {
  const filled = Math.min(10, Math.round((progress / max) * 10));
  return "█".repeat(filled) + "░".repeat(10 - filled);
}

function pct(progress, max) {
  return Math.round((progress / max) * 100);
}

async function syncTokenLabel(site, state) {
  const tokens = site.getActiveTokens?.(true) ?? [];
  let label = `放逐点 · ${state.bossName}`;
  if (state.complete) label = `放逐完成 · ${state.bossName}`;
  else if (state.active) label = `放逐中 · ${state.bossName} ${state.progress}/${state.max}`;

  for (const t of tokens) {
    const doc = t.document ?? t;
    if (doc?.name !== label) await doc.update({ name: label }).catch(() => {});
  }
}

function findBanishSite() {
  if (mattActor && isBanishActor(mattActor)) return mattActor;
  const controlled = canvas.tokens?.controlled ?? [];
  for (const t of controlled) {
    if (isBanishActor(t.actor)) return t.actor;
  }
  const from = mattToken?.center ?? controlled[0]?.center ?? null;
  const sites = (canvas.tokens?.placeables ?? [])
    .filter((t) => isBanishActor(t.actor))
    .map((t) => t.actor);
  if (sites.length === 1) return sites[0];
  if (sites.length > 1 && from) {
    sites.sort((a, b) => {
      const ta = a.getActiveTokens?.(true, true)?.[0];
      const tb = b.getActiveTokens?.(true, true)?.[0];
      const da = ta ? Math.hypot(ta.center.x - from.x, ta.center.y - from.y) : 1e9;
      const db = tb ? Math.hypot(tb.center.x - from.x, tb.center.y - from.y) : 1e9;
      return da - db;
    });
    return sites[0];
  }
  return sites[0] ?? game.actors.find((a) => isBanishActor(a)) ?? null;
}

function statusHtml(site, state) {
  const full = state.progress >= state.max;
  return `<div class="pf2e chat-card">
    <header class="card-header flexrow">
      <img src="modules/wang-pf2e-homebrew/assets/hunt/poetic-justice.png" width="36" height="36" alt=""/>
      <h3>放逐 · ${state.bossName}</h3>
    </header>
    <p><code>${bar(state.progress, state.max)}</code>
      <strong>${state.progress}/${state.max}</strong>（${pct(state.progress, state.max)}%）</p>
    <ul>
      <li>状态：${
        state.complete
          ? "<strong>已完成</strong>"
          : state.active
            ? "<em>此地正在放逐</em>"
            : "未开始"
      }</li>
      <li>参考：满 ${state.max} 格 ≈ 探索约 3 分钟；战斗每轮自动 +1</li>
      ${full && !state.complete ? "<li>进度已满 — 点「完成」结算令牌</li>" : ""}
    </ul>
  </div>`;
}

async function doStatus(site) {
  const state = getState(site);
  await syncTokenLabel(site, state);
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: site }),
    content: statusHtml(site, state),
  });
}

async function askStartOptions(defaults) {
  const DialogV2 = foundry.applications?.api?.DialogV2;
  if (!DialogV2) return defaults;
  try {
    const data = await DialogV2.prompt({
      window: { title: "开始放逐" },
      content: `<form>
        <p>Boss 名称（显示在标记上）：</p>
        <input type="text" name="boss" value="${foundry.utils.escapeHTML(defaults.bossName)}" style="width:100%"/>
        <p>进度格数（默认 ${DEFAULT_MAX} ≈ 3 分钟）：</p>
        <input type="number" name="max" value="${defaults.max}" min="1" max="40" style="width:100%"/>
      </form>`,
      ok: {
        label: "开始",
        callback: (_event, button) => {
          const form = button.form ?? button.querySelector?.("form");
          if (!form) return defaults;
          const fd = new FormDataExtended(form).object;
          return {
            bossName: String(fd.boss || defaults.bossName || "Boss"),
            max: Math.max(1, Number(fd.max) || defaults.max),
          };
        },
      },
      rejectClose: false,
    });
    if (data && typeof data === "object" && (data.bossName || data.max)) return { ...defaults, ...data };
  } catch (_) {
    /* cancel */
  }
  return defaults;
}

async function doStart(site) {
  const prev = getState(site);
  if (prev.active && !prev.complete) {
    return ui.notifications.info("此地已在放逐中。看 Token 名或点「查看进度」。");
  }

  let bossName = argValue("boss") ? String(argValue("boss")) : prev.bossName || "Boss";
  let max = Number(argValue("max"));
  if (!Number.isFinite(max) || max < 1) max = prev.max || DEFAULT_MAX;

  if (!argValue("boss")) {
    const opted = await askStartOptions({ bossName, max });
    bossName = opted.bossName;
    max = opted.max;
  }

  const next = {
    active: true,
    progress: 0,
    max: Math.max(1, max),
    bossName,
    complete: false,
  };
  await setState(site, next);
  await syncTokenLabel(site, next);

  const who =
    mattActor && !isBanishActor(mattActor)
      ? mattActor.name
      : canvas.tokens?.controlled?.[0]?.actor?.name ?? game.user.name;

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({
      actor: mattActor && !isBanishActor(mattActor) ? mattActor : site,
    }),
    content: `<div class="pf2e chat-card">
      <header class="card-header flexrow">
        <img src="modules/wang-pf2e-homebrew/assets/hunt/poetic-justice.png" width="36" height="36" alt=""/>
        <h3>放逐开始</h3>
      </header>
      <p><strong>${who}</strong> 在此地开始放逐 <strong>${next.bossName}</strong>。</p>
      <p>Token 已标成 <em>放逐中</em>。进度 0/${next.max}。
      战斗每轮自动 +1；也可用宏「推进」。</p>
      <p><em>全图可知该点正在放逐（告知其他队伍）。</em></p>
    </div>`,
  });
  ui.notifications.info(`放逐开始：${next.bossName}`);
}

async function doTick(site, amount = 1) {
  const state = getState(site);
  if (!state.active || state.complete) {
    return ui.notifications.warn("没有进行中的放逐。");
  }
  state.progress = Math.min(state.max, state.progress + Math.max(1, Number(amount) || 1));
  await setState(site, state);
  await syncTokenLabel(site, state);

  const full = state.progress >= state.max;
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: site }),
    content: `<p><strong>放逐 · ${state.bossName}</strong>
      <code>${bar(state.progress, state.max)}</code>
      ${state.progress}/${state.max}（${pct(state.progress, state.max)}%）
      ${full ? " — <em>可点「完成」结算</em>" : ""}</p>`,
  });
  if (full) ui.notifications.info("放逐进度已满。");
}

async function doComplete(site) {
  const state = getState(site);
  if (!state.active && !state.complete) {
    return ui.notifications.warn("尚未开始放逐。");
  }
  if (state.progress < state.max && !game.user.isGM) {
    return ui.notifications.warn(`进度未满（${state.progress}/${state.max}）。`);
  }
  state.progress = state.max;
  state.complete = true;
  state.active = false;
  await setState(site, state);
  await syncTokenLabel(site, state);

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: site }),
    content: `<div class="pf2e chat-card">
      <header class="card-header flexrow">
        <img src="modules/wang-pf2e-homebrew/assets/hunt/poetic-justice.png" width="36" height="36" alt=""/>
        <h3>放逐完成 · ${state.bossName}</h3>
      </header>
      <p>尸体消散。在该处放置 1～2 枚
      @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntBountyTk1]{赏金令牌}。</p>
    </div>`,
  });
  ui.notifications.info(`放逐完成：${state.bossName}`);
}

async function doReset(site) {
  if (!game.user.isGM) return ui.notifications.warn("重置需要 GM。");
  const state = {
    active: false,
    progress: 0,
    max: DEFAULT_MAX,
    bossName: getState(site).bossName || "Boss",
    complete: false,
  };
  await setState(site, state);
  await syncTokenLabel(site, state);
  ui.notifications.info("放逐标记已重置。");
  await doStatus(site);
}

async function pickMode() {
  if (modeRaw) return modeRaw;
  const DialogV2 = foundry.applications?.api?.DialogV2;
  if (!DialogV2) return "status";
  const choice = await DialogV2.wait({
    window: { title: "放逐仪式" },
    content: `<p>标记此地放逐并跟踪进度：</p>`,
    buttons: [
      { action: "start", label: "开始放逐", default: true },
      { action: "tick", label: "推进 +1" },
      { action: "status", label: "查看进度" },
      { action: "complete", label: "完成结算" },
      { action: "reset", label: "重置(GM)" },
    ],
    rejectClose: false,
  });
  return choice || "status";
}

const site = findBanishSite();
if (!site) {
  return ui.notifications.warn(
    "找不到放逐标记：请把合集「放逐标记」拖到 Boss 尸体旁并选中它。"
  );
}

const mode = await pickMode();
switch (mode) {
  case "start":
  case "begin":
    await doStart(site);
    break;
  case "tick":
  case "advance":
  case "+1":
    await doTick(site, Number(argValue("n")) || 1);
    break;
  case "complete":
  case "finish":
    await doComplete(site);
    break;
  case "reset":
    await doReset(site);
    break;
  case "status":
  default:
    await doStatus(site);
    break;
}
