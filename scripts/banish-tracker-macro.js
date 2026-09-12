/**
 * 放逐仪式 Banishing
 * 可在当前场景（含大地图）直接落下标记 Token + 地图便签，并跟踪进度。
 * 热栏 / Active Tiles；不要包 (async () => {})()。
 *
 * args: start | tick | status | complete | reset | place
 * 可选: boss 屠夫 | max 10 | n 1
 */
const MODULE_ID = "wang-pf2e-homebrew";
const FLAG_KEY = "banishing";
const DEFAULT_MAX = 10;
const HUNT_PROP = "banishing-site";
const PACK_ACTOR = "whbHuntBanish001";
const ICON = "modules/wang-pf2e-homebrew/assets/hunt/poetic-justice.png";

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
    noteId: raw.noteId || null,
    sceneId: raw.sceneId || null,
  };
}

async function setState(site, next) {
  await site.setFlag(MODULE_ID, FLAG_KEY, {
    active: next.active,
    progress: next.progress,
    max: next.max,
    bossName: next.bossName,
    complete: next.complete,
    noteId: next.noteId ?? null,
    sceneId: next.sceneId ?? null,
  });
}

function bar(progress, max) {
  const filled = Math.min(10, Math.round((progress / max) * 10));
  return "█".repeat(filled) + "░".repeat(10 - filled);
}

function pct(progress, max) {
  return Math.round((progress / max) * 100);
}

function labelFor(state) {
  if (state.complete) return `放逐完成 · ${state.bossName}`;
  if (state.active) return `放逐中 · ${state.bossName} ${state.progress}/${state.max}`;
  return `放逐点 · ${state.bossName}`;
}

function getDropPosition() {
  const grid = canvas.grid?.size || 100;
  const controlled = canvas.tokens?.controlled?.[0];
  if (mattToken?.center) {
    return {
      x: mattToken.center.x - grid / 2,
      y: mattToken.center.y - grid / 2,
      cx: mattToken.center.x,
      cy: mattToken.center.y,
    };
  }
  if (controlled?.center) {
    return {
      x: controlled.center.x - grid / 2,
      y: controlled.center.y - grid / 2,
      cx: controlled.center.x,
      cy: controlled.center.y,
    };
  }
  // 当前视野中心（大地图常用）
  const view = canvas.stage?.pivot ?? canvas.scene?._viewPosition;
  if (view) {
    return {
      x: view.x - grid / 2,
      y: view.y - grid / 2,
      cx: view.x,
      cy: view.y,
    };
  }
  const w = canvas.dimensions?.width ?? 1000;
  const h = canvas.dimensions?.height ?? 1000;
  return { x: w / 2 - grid / 2, y: h / 2 - grid / 2, cx: w / 2, cy: h / 2 };
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
  return sites[0] ?? null;
}

async function syncTokenLabel(site, state) {
  const label = labelFor(state);
  for (const t of site.getActiveTokens?.(true) ?? []) {
    const doc = t.document ?? t;
    const patch = { name: label };
    if (doc.displayName !== 50 && CONST?.TOKEN_DISPLAY_MODES?.ALWAYS != null) {
      patch.displayName = CONST.TOKEN_DISPLAY_MODES.ALWAYS;
    } else if (doc.displayName !== 50) {
      patch.displayName = 50; // ALWAYS
    }
    await doc.update(patch).catch(() => {});
  }
}

async function syncMapNote(site, state, drop = null) {
  if (!canvas.scene) return null;
  const label = labelFor(state);
  const st = getState(site);
  let note = st.noteId ? canvas.scene.notes.get(st.noteId) : null;

  if (!note) {
    // 找同 actor 关联便签
    note = canvas.scene.notes.find(
      (n) => n.flags?.[MODULE_ID]?.banishActorId === site.id
    );
  }

  const pos = drop || {
    cx: note?.center?.x ?? getDropPosition().cx,
    cy: note?.center?.y ?? getDropPosition().cy,
  };

  const noteData = {
    entryId: null,
    pageId: null,
    text: label,
    x: pos.cx,
    y: pos.cy,
    iconSize: 64,
    fontSize: 36,
    textAnchor: CONST?.TEXT_ANCHOR_POINTS?.BOTTOM ?? 1,
    textColor: "#9ecbff",
    texture: { src: ICON },
    flags: {
      [MODULE_ID]: {
        banishingNote: true,
        banishActorId: site.id,
      },
    },
  };

  // Foundry v12+ uses texture.src; older used icon
  noteData.icon = ICON;

  if (note) {
    await note.update({
      text: label,
      "flags.wang-pf2e-homebrew.banishActorId": site.id,
      "flags.wang-pf2e-homebrew.banishingNote": true,
    }).catch(() => {});
    return note.id;
  }

  const [created] = await canvas.scene.createEmbeddedDocuments("Note", [noteData]);
  return created?.id ?? null;
}

async function placeBanishOnScene({ bossName, max, reuse = false }) {
  if (!canvas.scene) {
    ui.notifications.warn("没有打开的场景，无法在大地图落点。");
    return null;
  }
  if (!game.user.isGM && !canvas.scene.isOwner) {
    ui.notifications.warn("在场景上放置放逐标记需要 GM（或场景所有者）。");
    return null;
  }

  let site = reuse ? findBanishSite() : null;
  const drop = getDropPosition();

  if (!site) {
    const pack = game.packs.get(`${MODULE_ID}.homebrew-actors`);
    const src = pack ? await pack.getDocument(PACK_ACTOR) : null;
    let data;
    if (src) {
      data = src.toObject();
      delete data._id;
    } else {
      data = {
        name: "放逐标记",
        type: "npc",
        img: ICON,
        system: {
          details: { level: { value: -1 }, blurb: "放逐进度标记" },
          attributes: { hp: { value: 1, max: 1 }, ac: { value: 5 } },
        },
        prototypeToken: {
          name: "放逐点",
          texture: { src: ICON },
          displayName: 50,
          disposition: 0,
          light: {
            dim: 20,
            bright: 0,
            color: "#4a7cff",
            alpha: 0.4,
            animation: { type: "pulse", speed: 2, intensity: 3 },
          },
        },
        flags: { [MODULE_ID]: { huntProp: HUNT_PROP, source: "hunt-showdown" } },
      };
    }
    data.name = `放逐 · ${bossName}`;
    data.flags = foundry.utils.mergeObject(data.flags || {}, {
      [MODULE_ID]: { huntProp: HUNT_PROP, source: "hunt-showdown" },
    });
    if (data.prototypeToken) {
      data.prototypeToken.displayName = 50;
      data.prototypeToken.actorLink = true;
      data.prototypeToken.texture = data.prototypeToken.texture || {};
      data.prototypeToken.texture.src = ICON;
    }
    const [created] = await Actor.createDocuments([data]);
    site = created;
  }

  // 当前场景已有该 actor 的 token？没有则创建
  let tokenDoc = site.getActiveTokens?.(true)?.[0]?.document;
  if (!tokenDoc || tokenDoc.parent?.id !== canvas.scene.id) {
    const proto = site.prototypeToken?.toObject?.() ?? site.prototypeToken ?? {};
    const [tok] = await canvas.scene.createEmbeddedDocuments("Token", [
      {
        ...proto,
        actorId: site.id,
        actorLink: true,
        name: labelFor({
          active: true,
          complete: false,
          bossName,
          progress: 0,
          max,
        }),
        x: drop.x,
        y: drop.y,
        displayName: 50,
        disposition: 0,
        texture: { ...(proto.texture || {}), src: ICON },
        light: proto.light || {
          dim: 20,
          bright: 0,
          color: "#4a7cff",
          alpha: 0.4,
          animation: { type: "pulse", speed: 2, intensity: 3 },
        },
      },
    ]);
    tokenDoc = tok;
  }

  const noteId = await syncMapNote(site, {
    active: true,
    complete: false,
    bossName,
    progress: 0,
    max,
  }, drop);

  await setState(site, {
    active: true,
    progress: 0,
    max,
    bossName,
    complete: false,
    noteId,
    sceneId: canvas.scene.id,
  });
  await syncTokenLabel(site, getState(site));
  return site;
}

function statusHtml(site, state) {
  const full = state.progress >= state.max;
  const sceneName =
    (state.sceneId && game.scenes.get(state.sceneId)?.name) ||
    canvas.scene?.name ||
    "当前场景";
  return `<div class="pf2e chat-card">
    <header class="card-header flexrow">
      <img src="${ICON}" width="36" height="36" alt=""/>
      <h3>放逐 · ${state.bossName}</h3>
    </header>
    <p><code>${bar(state.progress, state.max)}</code>
      <strong>${state.progress}/${state.max}</strong>（${pct(state.progress, state.max)}%）</p>
    <ul>
      <li>场景：<strong>${sceneName}</strong>（Token + 地图便签）</li>
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
  await syncMapNote(site, state);
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
      window: { title: "开始放逐（可落在大地图）" },
      content: `<form>
        <p>Boss 名称：</p>
        <input type="text" name="boss" value="${foundry.utils.escapeHTML(defaults.bossName)}" style="width:100%"/>
        <p>进度格数（默认 ${DEFAULT_MAX}）：</p>
        <input type="number" name="max" value="${defaults.max}" min="1" max="40" style="width:100%"/>
        <p style="opacity:0.85;font-size:0.9em;">会在<strong>当前打开的场景</strong>视野中心／选中令牌处放置 Token 与地图便签。</p>
      </form>`,
      ok: {
        label: "落点并开始",
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
    if (data && typeof data === "object" && (data.bossName || data.max)) {
      return { ...defaults, ...data };
    }
  } catch (_) {
    /* cancel */
  }
  return defaults;
}

async function doStart() {
  let bossName = argValue("boss") ? String(argValue("boss")) : "Boss";
  let max = Number(argValue("max"));
  if (!Number.isFinite(max) || max < 1) max = DEFAULT_MAX;

  if (!argValue("boss")) {
    const opted = await askStartOptions({ bossName, max });
    bossName = opted.bossName;
    max = opted.max;
  }

  const site = await placeBanishOnScene({ bossName, max, reuse: false });
  if (!site) return;

  const who =
    mattActor && !isBanishActor(mattActor)
      ? mattActor.name
      : canvas.tokens?.controlled?.[0]?.actor?.name ?? game.user.name;
  const sceneName = canvas.scene?.name ?? "当前场景";

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({
      actor: mattActor && !isBanishActor(mattActor) ? mattActor : site,
    }),
    content: `<div class="pf2e chat-card">
      <header class="card-header flexrow">
        <img src="${ICON}" width="36" height="36" alt=""/>
        <h3>放逐开始 · 地图已标记</h3>
      </header>
      <p><strong>${who}</strong> 在场景「<strong>${sceneName}</strong>」开始放逐 <strong>${bossName}</strong>。</p>
      <p>已放置：<em>放逐 Token</em>（常显名）+ <em>地图便签</em>。大地图上也看得见。</p>
      <p>进度 0/${max}。战斗每轮自动 +1；也可用宏「推进」。</p>
    </div>`,
  });
  ui.notifications.info(`已在「${sceneName}」标记放逐：${bossName}`);
}

async function doTick(site, amount = 1) {
  const state = getState(site);
  if (!state.active || state.complete) {
    return ui.notifications.warn("没有进行中的放逐。先「开始放逐」落点。");
  }
  state.progress = Math.min(state.max, state.progress + Math.max(1, Number(amount) || 1));
  await setState(site, state);
  await syncTokenLabel(site, state);
  await syncMapNote(site, state);

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
  await syncMapNote(site, state);

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: site }),
    content: `<div class="pf2e chat-card">
      <header class="card-header flexrow">
        <img src="${ICON}" width="36" height="36" alt=""/>
        <h3>放逐完成 · ${state.bossName}</h3>
      </header>
      <p>尸体消散。在该处放置 1～2 枚
      @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntBountyTk1]{赏金令牌}。</p>
      <p>地图便签已改为「放逐完成」。</p>
    </div>`,
  });
  ui.notifications.info(`放逐完成：${state.bossName}`);
}

async function doReset(site) {
  if (!game.user.isGM) return ui.notifications.warn("重置需要 GM。");
  const prev = getState(site);
  if (prev.noteId && canvas.scene) {
    const note = canvas.scene.notes.get(prev.noteId);
    if (note) await note.delete().catch(() => {});
  }
  const state = {
    active: false,
    progress: 0,
    max: DEFAULT_MAX,
    bossName: prev.bossName || "Boss",
    complete: false,
    noteId: null,
    sceneId: prev.sceneId,
  };
  await setState(site, state);
  await syncTokenLabel(site, state);
  ui.notifications.info("放逐标记已重置（便签已删，Token 仍在）。");
  await doStatus(site);
}

async function pickMode() {
  if (modeRaw) return modeRaw;
  const DialogV2 = foundry.applications?.api?.DialogV2;
  if (!DialogV2) return "status";
  const choice = await DialogV2.wait({
    window: { title: "放逐仪式" },
    content: `<p>在<strong>当前场景／大地图</strong>落点并跟踪放逐进度：</p>`,
    buttons: [
      { action: "start", label: "落点并开始", default: true },
      { action: "tick", label: "推进 +1" },
      { action: "status", label: "查看进度" },
      { action: "complete", label: "完成结算" },
      { action: "reset", label: "重置(GM)" },
    ],
    rejectClose: false,
  });
  return choice || "status";
}

const mode = await pickMode();

if (mode === "start" || mode === "begin" || mode === "place") {
  await doStart();
} else {
  const site = findBanishSite();
  if (!site) {
    return ui.notifications.warn(
      "当前场景没有选中的放逐标记。请先选中标记 Token，或点「落点并开始」。"
    );
  }
  switch (mode) {
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
}
