/**
 * @module wang-pf2e-homebrew / jiuli-katana
 * 妖刀·隐里切：让「格挡」「诱人诅咒」等自施效果动作一键生效。
 *
 * PF2e 原生 selfEffect 是两步（使用动作 → 聊天卡再点“施加效果”）。
 * 本脚本监听使用动作产生的 self-effect 聊天消息，自动把效果施加到使用者身上。
 */

const MODULE_ID = "wang-pf2e-homebrew";
const TAG = "jiuli-katana";

function isActive() {
  return game.system.id === "pf2e" && !!game.modules.get(MODULE_ID)?.active;
}

Hooks.on("createChatMessage", async (message) => {
  if (!isActive()) return;

  try {
    const ctx = message.flags?.pf2e?.context;
    if (ctx?.type !== "self-effect") return;

    // 只由使用该动作的客户端处理，避免多端重复施加。
    const authorId = message.author?.id ?? message.user?.id;
    if (game.user.id !== authorId) return;

    const actor =
      message.actor ??
      (message.speaker?.actor ? game.actors.get(message.speaker.actor) : null);
    if (!actor) return;

    // 找到发起动作的物品（self-effect 消息把物品 id 存在 context.item）。
    const item = actor.items.get(ctx.item) ?? message.item;
    const otherTags = item?.system?.traits?.otherTags ?? [];
    if (!Array.isArray(otherTags) || !otherTags.includes(TAG)) return;

    const uuid = item.system?.selfEffect?.uuid;
    if (!uuid) return;
    const effect = await fromUuid(uuid);
    if (!effect || effect.type !== "effect") return;

    const source = effect.toObject();
    source._id = null;

    // 避免同一动作重复叠加：先移除同 slug 的旧效果。
    const slug = source.system?.slug;
    if (slug) {
      const stale = actor.itemTypes.effect.filter((e) => e.slug === slug);
      if (stale.length) {
        await actor.deleteEmbeddedDocuments(
          "Item",
          stale.map((e) => e.id)
        );
      }
    }

    await actor.createEmbeddedDocuments("Item", [source]);
  } catch (err) {
    console.error(`${MODULE_ID} | 妖刀自施效果自动施加失败：`, err);
  }
});
