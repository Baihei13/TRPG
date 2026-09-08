/**
 * 转轮门控 — 供 Monk's Active Tiles「运行宏」调用，也可在热栏手动点。
 *
 * Active Tiles 参数（可选）：
 *   { doorIds: ["墙ID1", "墙ID2"] }
 *   { mode: "ask" | "open" | "lock" }   // ask=弹窗（默认）
 *
 * 默认门 ID 可在下方修改；第二扇门请换成你场景里的真实墙 ID。
 */
(async () => {
  const DEFAULT_DOOR_IDS = [
    "htggKllXKcbhsdnf", // 已知密门之一（可改）
    "", // ← 填入第二扇门的墙 ID；留空则只操作第一扇
  ];

  const tileArgs =
    typeof args !== "undefined" && args && typeof args === "object" ? args : {};
  const doorIds = (tileArgs.doorIds ?? DEFAULT_DOOR_IDS)
    .map((id) => String(id || "").trim())
    .filter(Boolean);
  const mode = tileArgs.mode ?? "ask";

  if (!doorIds.length) {
    return ui.notifications.error("转轮门控：未配置 doorIds。请在宏里填写两扇门的墙 ID。");
  }

  const scene = canvas.scene;
  if (!scene) return ui.notifications.error("没有活动场景。");

  const walls = doorIds.map((id) => scene.walls.get(id)).filter(Boolean);
  if (!walls.length) {
    return ui.notifications.error(
      `转轮门控：场景里找不到这些墙/门：${doorIds.join(", ")}`
    );
  }
  if (walls.length < doorIds.length) {
    const missing = doorIds.filter((id) => !scene.walls.get(id));
    ui.notifications.warn(`转轮门控：部分门未找到：${missing.join(", ")}`);
  }

  const OPEN = CONST.WALL_DOOR_STATES?.OPEN ?? 1;
  const LOCKED = CONST.WALL_DOOR_STATES?.LOCKED ?? 2;
  const CLOSED = CONST.WALL_DOOR_STATES?.CLOSED ?? 0;

  const speaker = () => {
    const tok = canvas.tokens.controlled[0];
    return ChatMessage.getSpeaker({
      actor: tok?.actor ?? game.user.character,
      token: tok?.document,
    });
  };

  async function setDoors(state, label) {
    const updates = walls.map((w) => ({ _id: w.id, ds: state }));
    await scene.updateEmbeddedDocuments("Wall", updates);
    await ChatMessage.create({
      speaker: speaker(),
      content: `<div class="pf2e chat-card">
        <header class="card-header flexrow">
          <img src="icons/environment/settlement/wheel.webp" width="36" height="36" alt=""/>
          <h3>转轮机关</h3>
        </header>
        <p><strong>${game.user.name}</strong> 转动了转轮：<em>${label}</em></p>
        <p class="hint">影响 ${walls.length} 扇密门。</p>
      </div>`,
    });
    ui.notifications.info(`转轮：${label}（${walls.length} 扇门）`);
  }

  async function doOpen() {
    // 解锁并打开
    await setDoors(OPEN, "打开密门");
  }

  async function doLock() {
    // 关闭并上锁
    await setDoors(LOCKED, "锁上密门");
  }

  if (mode === "open") return doOpen();
  if (mode === "lock") return doLock();

  // 两个行动选项
  new Dialog({
    title: "转轮机关",
    content: `
      <p>你把手放上沉重的转轮。铁锈与石屑在轴上摩擦作响。</p>
      <p><strong>选择一个行动：</strong></p>
      <ul>
        <li><strong>打开密门</strong> — 解锁并推开关联的门</li>
        <li><strong>锁上密门</strong> — 关闭并锁住关联的门</li>
      </ul>
      <p class="notes" style="opacity:.75">当前绑定 ${walls.length} 扇门</p>
    `,
    buttons: {
      open: {
        icon: '<i class="fas fa-door-open"></i>',
        label: "打开密门",
        callback: () => doOpen(),
      },
      lock: {
        icon: '<i class="fas fa-lock"></i>',
        label: "锁上密门",
        callback: () => doLock(),
      },
    },
    default: "open",
  }).render(true);
})();
