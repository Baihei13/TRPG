/**
 * 经验赠礼 · 四针效果
 * Monk's Active Tiles「点击 → 运行宏」；也可热栏手动点。
 *
 * 规则：换地方可再领；同一图块每位角色只能领一次。
 * 注意：不要包 (async () => {})()，MATT 已在 async 函数里执行本命令。
 */
const MODULE_ID = "wang-pf2e-homebrew";
const PACK = `${MODULE_ID}.homebrew-items`;
const FLAG = "xpGiftClaimedTiles";

const EFFECT_IDS = {
  stamina: "whbHuntStamFx001",
  regen: "whbHuntRgnFx0001",
  antidote: "whbHuntAntiFx001",
};
const BURN_SLUG = "effect-hunt-burning";
const POISON_SLUG = "effect-hunt-poisoned";
const FATIGUED = "fatigued";

const mattActor = typeof actor !== "undefined" ? actor : null;
const mattToken = typeof token !== "undefined" ? token : null;
const mattTile = typeof tile !== "undefined" ? tile : null;
const argList = typeof args !== "undefined" && Array.isArray(args) ? args : [];

const once = !(
  argList.includes("once") &&
  String(argList[argList.indexOf("once") + 1]).toLowerCase() === "false"
);
const healIdx = argList.indexOf("vitalityHeal");
const healFormula =
  healIdx >= 0 && argList[healIdx + 1] ? String(argList[healIdx + 1]) : "4d8+4";

const tileId = mattTile?.id ?? mattTile?.document?.id ?? null;

let actorDoc = mattActor;
if (!actorDoc && mattToken?.actor) actorDoc = mattToken.actor;
if (!actorDoc && mattToken?.document?.actor) actorDoc = mattToken.document.actor;
if (!actorDoc) actorDoc = canvas.tokens?.controlled?.[0]?.actor ?? null;
if (!actorDoc) actorDoc = game.user.character ?? null;

if (!actorDoc) {
  return ui.notifications.warn(
    "经验赠礼：请先选中自己的令牌，或绑定角色后再点击。"
  );
}
if (!actorDoc.isOwner && !game.user.isGM) {
  return ui.notifications.warn("经验赠礼：你只能对自己的角色使用。");
}

const claimed = foundry.utils.duplicate(actorDoc.getFlag(MODULE_ID, FLAG) || {});
if (once && tileId && claimed[tileId]) {
  return ui.notifications.info(
    `${actorDoc.name} 已经在这个地方领取过经验赠礼。`
  );
}

const getPackItem = async (id) => {
  const pack = game.packs.get(PACK);
  if (!pack) return null;
  return pack.getDocument(id);
};

const applyEffect = async (who, effectId) => {
  const src = await getPackItem(effectId);
  if (!src) {
    ui.notifications.warn(`缺少效果 ${effectId}，请确认合集已加载。`);
    return null;
  }
  const data = src.toObject();
  delete data._id;
  const existing = who.itemTypes.effect.filter(
    (e) => e.system?.slug === data.system?.slug
  );
  if (existing.length) {
    await who.deleteEmbeddedDocuments(
      "Item",
      existing.map((e) => e.id)
    );
  }
  const [created] = await Item.createDocuments([data], {
    parent: who,
    render: false,
  });
  return created ?? null;
};

const removeBySlug = async (who, slug) => {
  const list = who.itemTypes.effect.filter(
    (e) => (e.system?.slug ?? e.slug) === slug
  );
  if (!list.length) return 0;
  await who.deleteEmbeddedDocuments(
    "Item",
    list.map((e) => e.id)
  );
  return list.length;
};

const lines = [];

try {
  const roll = await new Roll(healFormula).evaluate();
  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor: actorDoc }),
    flavor: `<strong>经验赠礼 · 活力针</strong>`,
  });
  if (typeof actorDoc.applyDamage === "function") {
    await actorDoc.applyDamage({
      damage: -roll.total,
      token: actorDoc.getActiveTokens?.(true, true)?.[0]?.document,
    });
  } else {
    const hp = actorDoc.system?.attributes?.hp;
    if (hp) {
      await actorDoc.update({
        "system.attributes.hp.value": Math.min(hp.max, hp.value + roll.total),
      });
    }
  }
  await removeBySlug(actorDoc, BURN_SLUG);
  lines.push(`活力针：恢复 ${roll.total} HP，清除灼烬`);
} catch (err) {
  console.error(err);
  lines.push("活力针：治疗失败（请看控制台）");
}

try {
  const fatigued = actorDoc.itemTypes.condition?.find(
    (c) => (c.system?.slug ?? c.slug) === FATIGUED
  );
  if (fatigued) await fatigued.delete().catch(() => {});
  else if (typeof actorDoc.decreaseCondition === "function") {
    await actorDoc.decreaseCondition(FATIGUED).catch(() => {});
  }
  await applyEffect(actorDoc, EFFECT_IDS.stamina);
  lines.push("耐力针：移除疲乏，迅捷 1 分钟（额外动作仅行走/打击）");
} catch (err) {
  console.error(err);
  lines.push("耐力针：失败");
}

try {
  await applyEffect(actorDoc, EFFECT_IDS.regen);
  lines.push("再生针：快速愈合 4（1 分钟）");
} catch (err) {
  console.error(err);
  lines.push("再生针：失败");
}

try {
  await removeBySlug(actorDoc, POISON_SLUG);
  await applyEffect(actorDoc, EFFECT_IDS.antidote);
  lines.push("解毒针：清除猎杀中毒，毒素免疫 1 分钟");
} catch (err) {
  console.error(err);
  lines.push("解毒针：失败");
}

if (once && tileId) {
  claimed[tileId] = true;
  await actorDoc.setFlag(MODULE_ID, FLAG, claimed);
}

await ChatMessage.create({
  speaker: ChatMessage.getSpeaker({ actor: actorDoc }),
  content: `<div class="pf2e chat-card">
    <header class="card-header flexrow">
      <img src="modules/wang-pf2e-homebrew/assets/hunt/vitality-shot.png" width="36" height="36" alt=""/>
      <h3>经验赠礼</h3>
    </header>
    <p><strong>${actorDoc.name}</strong> 打开了赠礼，四根针剂同时生效：</p>
    <ul>${lines.map((l) => `<li>${l}</li>`).join("")}</ul>
  </div>`,
});
ui.notifications.info(`${actorDoc.name}：已获取四根针效果。`);
