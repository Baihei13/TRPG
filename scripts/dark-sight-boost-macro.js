/**
 * 获取黑视强化
 * 对选中令牌 / 绑定角色施加 1 回合红外线视觉。
 * 与赏金令牌效果相同，但不消耗令牌、也不能靠击杀回充。
 */
const MODULE_ID = "wang-pf2e-homebrew";
const PACK = `${MODULE_ID}.homebrew-items`;
const EFFECT_ID = "whbHuntIrVisFx01";
const EFFECT_SLUG = "effect-hunt-infrared-vision";

const actorDoc =
  canvas.tokens?.controlled?.[0]?.actor ??
  game.user.character ??
  null;

if (!actorDoc) {
  return ui.notifications.warn("黑视强化：请先选中令牌，或绑定角色。");
}
if (!actorDoc.isOwner && !game.user.isGM) {
  return ui.notifications.warn("黑视强化：你只能对自己的角色使用。");
}

const pack = game.packs.get(PACK);
const src = pack ? await pack.getDocument(EFFECT_ID) : null;
if (!src) {
  return ui.notifications.error("缺少效果「红外线视觉（黑视）」，请确认合集已加载。");
}

const existing = actorDoc.itemTypes.effect.filter(
  (e) => (e.system?.slug ?? e.slug) === EFFECT_SLUG
);
if (existing.length) {
  await actorDoc.deleteEmbeddedDocuments(
    "Item",
    existing.map((e) => e.id)
  );
}

const data = src.toObject();
delete data._id;
data.name = "效果：黑视强化（红外线视觉）";
await Item.createDocuments([data], { parent: actorDoc, render: false });

await ChatMessage.create({
  speaker: ChatMessage.getSpeaker({ actor: actorDoc }),
  content: `<div class="pf2e chat-card">
    <header class="card-header flexrow">
      <img src="systems/pf2e/icons/features/classes/precise-strike.webp" width="36" height="36" alt=""/>
      <h3>黑视强化</h3>
    </header>
    <p><strong>${actorDoc.name}</strong> 获得 <strong>红外线视觉</strong>（1 回合）。此强化<strong>不能</strong>靠击杀回充。</p>
  </div>`,
});
ui.notifications.info(`${actorDoc.name}：黑视强化已生效（1 回合红外线视觉）。`);
