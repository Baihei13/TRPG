/**
 * 要塞货气球
 * 热栏 / Active Tiles「点击 → 运行宏」。
 *
 * args（可选）:
 *   valve | close | launch | status | reset | ready
 * 无 args 时弹出菜单。
 *
 * 货箱本身不记账、不标记；放飞只输出事后发奖清单。
 * 不要包 (async () => {})()，MATT 已在 async 里执行。
 */
const MODULE_ID = "wang-pf2e-homebrew";
const FLAG_KEY = "cargoBalloon";
const PROGRESS_MAX = 12;
const MAX_VALVES = 3;
const MAX_CRATES = 4;
const MAX_BOUNTY = 1;

const CRATE_TIERS = {
  worn: { id: "whbHuntCrgWorn01", label: "磨损货箱", hint: "低档（约 10 gp / 稀缺弹×1 等）" },
  standard: { id: "whbHuntCrgStd001", label: "标准货箱", hint: "中档（约 25 gp / 稀缺弹×2 等）" },
  confiscated: { id: "whbHuntCrgConf01", label: "充公货箱", hint: "放飞后掷 1d8（暗贡式）" },
};

const argList = typeof args !== "undefined" && Array.isArray(args) ? args : [];
const mattToken = typeof token !== "undefined" ? token : null;
const mattTile = typeof tile !== "undefined" ? tile : null;
const mattActor = typeof actor !== "undefined" ? actor : null;

const modeRaw = argList[0] ? String(argList[0]).toLowerCase() : "";

function isBalloonActor(a) {
  if (!a) return false;
  const f = a.getFlag?.(MODULE_ID, "huntProp") ?? a.flags?.[MODULE_ID]?.huntProp;
  if (f === "cargo-balloon") return true;
  const n = String(a.name ?? "");
  return /货气球|Cargo Balloon/i.test(n);
}

function getState(balloon) {
  const raw = balloon.getFlag(MODULE_ID, FLAG_KEY) || {};
  return {
    valvesOpen: Math.max(0, Math.min(MAX_VALVES, Number(raw.valvesOpen) || 0)),
    progress: Math.max(0, Math.min(PROGRESS_MAX, Number(raw.progress) || 0)),
    launched: Boolean(raw.launched),
  };
}

async function setState(balloon, next) {
  await balloon.setFlag(MODULE_ID, FLAG_KEY, {
    valvesOpen: next.valvesOpen,
    progress: next.progress,
    launched: next.launched,
  });
}

function findBalloonActor() {
  if (mattActor && isBalloonActor(mattActor)) return mattActor;
  const controlled = canvas.tokens?.controlled ?? [];
  for (const t of controlled) {
    if (isBalloonActor(t.actor)) return t.actor;
  }
  const sceneTokens = canvas.tokens?.placeables ?? [];
  const balloons = sceneTokens.filter((t) => isBalloonActor(t.actor)).map((t) => t.actor);
  if (balloons.length === 1) return balloons[0];
  if (balloons.length > 1) {
    const from = mattToken?.center ?? controlled[0]?.center ?? null;
    if (from) {
      balloons.sort((a, b) => {
        const ta = a.getActiveTokens?.(true, true)?.[0];
        const tb = b.getActiveTokens?.(true, true)?.[0];
        const da = ta ? Math.hypot(ta.center.x - from.x, ta.center.y - from.y) : 1e9;
        const db = tb ? Math.hypot(tb.center.x - from.x, tb.center.y - from.y) : 1e9;
        return da - db;
      });
      return balloons[0];
    }
  }
  return balloons[0] ?? game.actors.find((a) => isBalloonActor(a)) ?? null;
}

function classifyCargo(item) {
  const tier = item.getFlag?.(MODULE_ID, "cargoTier") ?? item.flags?.[MODULE_ID]?.cargoTier;
  if (tier && CRATE_TIERS[tier]) return { kind: "crate", tier, ...CRATE_TIERS[tier] };
  const slug = item.system?.slug ?? "";
  if (slug.includes("worn-cargo")) return { kind: "crate", tier: "worn", ...CRATE_TIERS.worn };
  if (slug.includes("standard-cargo")) return { kind: "crate", tier: "standard", ...CRATE_TIERS.standard };
  if (slug.includes("confiscated-cargo")) return { kind: "crate", tier: "confiscated", ...CRATE_TIERS.confiscated };
  if (
    item.id === "whbHuntBountyTk1" ||
    slug === "hunt-bounty-token" ||
    /赏金令牌|Bounty Token/i.test(item.name ?? "")
  ) {
    return { kind: "bounty", label: "赏金令牌", hint: "抽出令牌（黑视充能等，事后处理）" };
  }
  return { kind: "other", label: item.name, hint: "其他物品" };
}

function inventorySummary(balloon) {
  const items = balloon.items?.contents ?? balloon.items ?? [];
  const crates = [];
  const bounties = [];
  const other = [];
  for (const it of items) {
    if (it.type === "action" || it.type === "melee" || it.type === "lore") continue;
    const c = classifyCargo(it);
    const row = { item: it, ...c };
    if (c.kind === "crate") crates.push(row);
    else if (c.kind === "bounty") bounties.push(row);
    else other.push(row);
  }
  return { crates, bounties, other };
}

function statusHtml(balloon, state) {
  const { crates, bounties, other } = inventorySummary(balloon);
  const ready = state.progress >= PROGRESS_MAX && !state.launched;
  return `<div class="pf2e chat-card">
    <header class="card-header flexrow">
      <img src="modules/wang-pf2e-homebrew/assets/hunt/fusee.png" width="36" height="36" alt=""/>
      <h3>货气球 · ${balloon.name}</h3>
    </header>
    <ul>
      <li>气阀：<strong>${state.valvesOpen}</strong> / ${MAX_VALVES}（每轮充气 +${state.valvesOpen || 0}）</li>
      <li>充气：<strong>${state.progress}</strong> / ${PROGRESS_MAX}${ready ? " · <em>可放飞</em>" : ""}</li>
      <li>货箱：${crates.length} / ${MAX_CRATES}${crates.length ? " — " + crates.map((c) => c.label).join("、") : ""}</li>
      <li>赏金令牌：${bounties.length} / ${MAX_BOUNTY}</li>
      ${other.length ? `<li>其他：${other.map((o) => o.label).join("、")}</li>` : ""}
      ${state.launched ? "<li><strong>已放飞</strong></li>" : ""}
    </ul>
  </div>`;
}

async function doStatus(balloon) {
  const state = getState(balloon);
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: balloon }),
    content: statusHtml(balloon, state),
  });
}

async function doValve(balloon, delta) {
  const state = getState(balloon);
  if (state.launched) {
    return ui.notifications.warn("气球已放飞。");
  }
  const nextValves = Math.max(0, Math.min(MAX_VALVES, state.valvesOpen + delta));
  if (nextValves === state.valvesOpen) {
    return ui.notifications.info(delta > 0 ? "气阀已全部打开。" : "没有打开的气阀。");
  }
  state.valvesOpen = nextValves;
  await setState(balloon, state);

  const who =
    mattActor && !isBalloonActor(mattActor)
      ? mattActor.name
      : canvas.tokens?.controlled?.[0]?.actor?.name ?? game.user.name;

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: mattActor && !isBalloonActor(mattActor) ? mattActor : balloon }),
    content: `<div class="pf2e chat-card">
      <h3>货气球 · ${delta > 0 ? "开阀" : "关阀"}</h3>
      <p><strong>${who}</strong> ${delta > 0 ? "打开" : "关闭"}了一只气阀。</p>
      <p>当前 <strong>${state.valvesOpen}</strong> 阀 · 充气 ${state.progress}/${PROGRESS_MAX}
      ${game.combat ? `（每轮 +${state.valvesOpen}）` : "（非战斗：可用宏「跳过等待 / ready」直接灌满）"}</p>
    </div>`,
  });
  ui.notifications.info(`气阀 ${state.valvesOpen}/${MAX_VALVES}`);
}

async function doReady(balloon) {
  if (!game.user.isGM && !balloon.isOwner) {
    return ui.notifications.warn("跳过等待需要 GM 或气球所有者。");
  }
  const state = getState(balloon);
  if (state.launched) return ui.notifications.warn("气球已放飞。");
  if (state.valvesOpen < 1) {
    return ui.notifications.warn("至少开 1 只气阀再跳过等待。");
  }
  state.progress = PROGRESS_MAX;
  await setState(balloon, state);
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: balloon }),
    content: `<p><strong>${balloon.name}</strong> 按 ${state.valvesOpen} 阀视为充气完成，可以放飞。</p>`,
  });
}

async function doLaunch(balloon) {
  const state = getState(balloon);
  if (state.launched) return ui.notifications.warn("气球已经放飞过了。");
  if (state.progress < PROGRESS_MAX) {
    return ui.notifications.warn(
      `尚未充满气（${state.progress}/${PROGRESS_MAX}）。战斗中开阀等进度，或 GM 用 ready 跳过。`
    );
  }

  const { crates, bounties, other } = inventorySummary(balloon);
  if (crates.length > MAX_CRATES) {
    ui.notifications.warn(`货箱超过 ${MAX_CRATES} 个，仍继续放飞（请 GM 裁定多余箱）。`);
  }
  if (bounties.length > MAX_BOUNTY) {
    ui.notifications.warn(`赏金令牌超过 ${MAX_BOUNTY} 枚，仍继续放飞。`);
  }

  const launcher =
    mattActor && !isBalloonActor(mattActor)
      ? mattActor
      : canvas.tokens?.controlled?.[0]?.actor ?? null;
  const teamName = launcher?.name ?? game.user.name;

  const rewardLines = [];
  for (const c of crates) {
    rewardLines.push(`<li><strong>${c.label}</strong> — ${c.hint}（事后发）</li>`);
  }
  for (const b of bounties) {
    rewardLines.push(`<li><strong>${b.label}</strong> — ${b.hint}</li>`);
  }
  for (const o of other) {
    rewardLines.push(`<li>${o.label}</li>`);
  }
  if (!rewardLines.length) {
    rewardLines.push("<li>（吊舱是空的）</li>");
  }

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: launcher ?? balloon }),
    content: `<div class="pf2e chat-card">
      <header class="card-header flexrow">
        <img src="modules/wang-pf2e-homebrew/assets/hunt/fusee.png" width="36" height="36" alt=""/>
        <h3>货气球放飞 · 抽出结算清单</h3>
      </header>
      <p><strong>${teamName}</strong> 放飞了气球。奖励<strong>事后发放</strong>（货箱无领取标记）。</p>
      <ul>${rewardLines.join("")}</ul>
      <p><em>GM：按箱子档位在会话后发猎金/弹药/充公 1d8 等即可。</em></p>
    </div>`,
  });

  const toDelete = [...crates, ...bounties].map((r) => r.item.id).filter(Boolean);
  if (toDelete.length) {
    await balloon.deleteEmbeddedDocuments("Item", toDelete);
  }

  state.launched = true;
  state.progress = 0;
  state.valvesOpen = 0;
  await setState(balloon, state);
  ui.notifications.info("气球已放飞：清单已发到聊天（事后发奖）。");
}

async function doReset(balloon) {
  if (!game.user.isGM) return ui.notifications.warn("重置需要 GM。");
  await setState(balloon, { valvesOpen: 0, progress: 0, launched: false });
  ui.notifications.info("货气球状态已重置。");
  await doStatus(balloon);
}

async function pickMode() {
  if (modeRaw) return modeRaw;
  const DialogV2 = foundry.applications?.api?.DialogV2;
  if (!DialogV2) return "status";
  const choice = await DialogV2.wait({
    window: { title: "要塞货气球" },
    content: `<p>选择操作（货箱不做领取标记；放飞只出事后发奖清单）：</p>`,
    buttons: [
      { action: "valve", label: "开阀", default: true },
      { action: "close", label: "关阀" },
      { action: "ready", label: "跳过等待" },
      { action: "launch", label: "放飞抽出" },
      { action: "status", label: "状态" },
      { action: "reset", label: "重置(GM)" },
    ],
    rejectClose: false,
  });
  return choice || "status";
}

const balloon = findBalloonActor();
if (!balloon) {
  return ui.notifications.warn(
    "找不到货气球：请选中气球 Token，或把「要塞货气球」拖进场景。"
  );
}

const mode = await pickMode();
switch (mode) {
  case "valve":
  case "open":
    await doValve(balloon, 1);
    break;
  case "close":
  case "closevalve":
    await doValve(balloon, -1);
    break;
  case "ready":
  case "inflate":
    await doReady(balloon);
    break;
  case "launch":
  case "extract":
    await doLaunch(balloon);
    break;
  case "reset":
    await doReset(balloon);
    break;
  case "status":
  default:
    await doStatus(balloon);
    break;
}
