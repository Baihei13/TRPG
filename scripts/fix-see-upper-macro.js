/**
 * 要塞 · 一楼看见二楼（Foundry V14 Scene Levels）
 * GM 在「要塞」场景运行一次即可。
 *
 * 会做：
 * 1) 给所有 Define Surface 打开 exposure（Reveal Elevated Surface）
 * 2) 汇报场景 Level / Region / Token elevation
 * 3) 可选：把明显在上层平台、却 elevation=0 的 Token 抬到上层高度
 */
(async () => {
  if (!game.user.isGM) return ui.notifications.error("需要 GM 权限。");
  const scene = canvas.scene;
  if (!scene) return ui.notifications.error("没有活动场景。");

  const lines = [];
  const log = (s) => lines.push(s);

  log(`场景：${scene.name}`);

  // ---- Levels ----
  const levels = [...(scene.levels ?? scene.collections?.levels ?? [])];
  try {
    const avail = scene.availableLevels ? [...scene.availableLevels] : [];
    if (avail.length) {
      log(
        `Levels(${avail.length}): ` +
          avail
            .map((l) => {
              const name = l.name ?? l.id;
              const bot = l.elevation?.bottom ?? l.bottom ?? "?";
              const top = l.elevation?.top ?? l.top ?? "?";
              return `${name}[${bot}~${top}]`;
            })
            .join(" | ")
      );
    } else {
      log("Levels：无（或 API 不同）");
    }
  } catch (e) {
    log(`Levels 读取失败：${e.message}`);
  }

  // ---- Define Surface → 开 exposure ----
  let surfaceCount = 0;
  let exposureFixed = 0;
  for (const region of scene.regions ?? []) {
    const elev = region.elevation ?? region.system?.elevation;
    const elevStr = elev
      ? `elev ${elev.bottom ?? elev.min ?? "?"}-${elev.top ?? elev.max ?? "?"}`
      : "elev ?";
    for (const behavior of region.behaviors ?? []) {
      const type = behavior.type ?? behavior.system?.type;
      if (type !== "defineSurface") continue;
      surfaceCount++;
      const sys = behavior.system ?? {};
      log(
        `Surface「${region.name}」${elevStr} | placement=${sys.placement} sight=${sys.sight} exposure=${sys.exposure} occlusion=${sys.occlusion}`
      );
      const patch = {};
      if (sys.exposure !== true) patch["system.exposure"] = true;
      // 阳台/栈道：保留挡移动，但允许下方看见上方（exposure）
      // 若仍完全看不见，可再把 sight 关掉（会变成“地板完全透视”）
      if (Object.keys(patch).length) {
        await behavior.update(patch);
        exposureFixed++;
        log(`  → 已开启 Reveal Elevated Surface (exposure)`);
      }
    }
  }
  log(`Define Surface 共 ${surfaceCount} 个，修正 exposure ${exposureFixed} 个`);

  // ---- Tokens ----
  const tokens = canvas.tokens.placeables.map((t) => t.document);
  log(
    "Tokens: " +
      tokens
        .map((t) => `${t.name}@${t.elevation ?? 0}`)
        .join(", ")
  );

  // 启发式：同一场景里若已有 elevation>=10 的“上层”，把名字在木栈/桥附近且 elev=0 的友好 Token 抬上去不自动做（太危险）
  // 仅提示
  const upper = tokens.filter((t) => (t.elevation ?? 0) >= 10);
  const ground = tokens.filter((t) => (t.elevation ?? 0) === 0);
  if (upper.length && ground.length) {
    log(
      `提示：有 ${upper.length} 个高层 Token、${ground.length} 个 elev=0。若某人站在二楼却是 0，请手动改 elevation 对齐上层 Level。`
    );
  }

  // ---- 旧 Levels 模块冲突提示 ----
  if (game.modules.get("levels")?.active) {
    log("⚠ 模块「levels」仍启用，可能与 V14 原生 Scene Levels 冲突，建议在本世界关掉再测。");
  }
  if (game.modules.get("wall-height")?.active) {
    log("⚠ 「wall-height」仍启用；V14 墙高已原生，冲突时建议关掉。");
  }

  const text = lines.join("\n");
  console.log(text);
  await ChatMessage.create({
    speaker: { alias: "楼层视力修复" },
    content: `<pre style="white-space:pre-wrap;font-size:12px">${foundry.utils.escapeHTML(text)}</pre>`,
  });
  ui.notifications.info(
    exposureFixed
      ? `已开启 ${exposureFixed} 处 elevated surface 透视，请用 1 楼 Token 再看 2 楼。`
      : surfaceCount
        ? "Surface 已有 exposure，若仍看不见请检查 Token elevation / 关掉旧 levels 模块。"
        : "未找到 Define Surface：请在 Region 层给二楼平台加 Define Surface，并勾选 Reveal Elevated Surface。"
  );
})();
