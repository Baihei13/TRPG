/**
 * 猎杀对决 · 尽可能全自动
 * - 通用解析动作描述中的 @Damage / @Check / @Template
 * - 怪物放蜂/水蛭/临终喷焰等生成与 AOE
 * - 补全猎人招牌动作
 */
const MODULE_ID = "wang-pf2e-homebrew";
const FLAG = "huntShowdown";
const PACK_ACTORS = "wang-pf2e-homebrew.homebrew-actors";
const PACK_ITEMS = "wang-pf2e-homebrew.homebrew-items";

const EFFECT = {
  burn: "whbHuntBurnFx001",
  poison: "whbHuntPsnFx0001",
};

const SPAWN = {
  bee: "whbHuntBeeSwm001",
  leech: "whbHuntLeech0001",
};

/**
 * @param {object} api 主自动化导出的工具函数集
 */
export function installHuntFullAuto(api) {
  const {
    canManage,
    handled,
    applyCompendiumEffect,
    applyPF2eCondition,
    rollSave,
    primaryTarget,
    targetsInRange,
    grantSwiftStep,
    handleDoubleStrike,
    handleBornheimRapid,
    findBySlug,
    getPackItem,
  } = api;

  async function dealDamage(actor, formula, { type = "untyped", token = null, label = "" } = {}) {
    if (!actor) return null;
    const roll = await new Roll(String(formula)).evaluate();
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: label || `猎杀伤害（${type}）`,
    });
    try {
      if (typeof actor.applyDamage === "function") {
        await actor.applyDamage({
          damage: roll,
          token: token?.document ?? actor.getActiveTokens?.(true, true)?.[0]?.document,
          damageType: type,
        });
      } else {
        const hp = actor.system?.attributes?.hp;
        if (hp) {
          await actor.update({
            "system.attributes.hp.value": Math.max(0, Number(hp.value) - Number(roll.total)),
          });
        }
      }
    } catch (err) {
      console.warn(`${MODULE_ID} | dealDamage`, err);
    }
    return roll;
  }

  async function healActor(actor, formula, label = "治疗") {
    if (!actor) return;
    const roll = await new Roll(String(formula)).evaluate();
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: label,
    });
    try {
      if (typeof actor.applyDamage === "function") {
        await actor.applyDamage({
          damage: -roll.total,
          token: actor.getActiveTokens?.(true, true)?.[0]?.document,
        });
      } else {
        const hp = actor.system?.attributes?.hp;
        if (hp) {
          await actor.update({
            "system.attributes.hp.value": Math.min(
              Number(hp.max),
              Number(hp.value) + Number(roll.total),
            ),
          });
        }
      }
    } catch (err) {
      console.warn(`${MODULE_ID} | heal`, err);
    }
  }

  function parseDesc(html = "") {
    const text = String(html);
    const damages = [...text.matchAll(/@Damage\[([^\]]+)\]/g)].map((m) => m[1]);
    const checks = [...text.matchAll(/@Check\[([^|\]]+)\|dc:(\d+)[^\]]*\]/g)].map((m) => ({
      type: m[1].replace(/\|.*/, "").trim(),
      dc: Number(m[2]),
    }));
    const templates = [
      ...text.matchAll(/@Template\[type:(\w+)\|distance:(\d+)\]/g),
    ].map((m) => ({ type: m[1], distance: Number(m[2]) }));
    return {
      damages,
      checks,
      templates,
      burn: /灼烬|BurnFx001|猎杀灼烬/.test(text),
      poison: /中毒|PsnFx0001|猎杀中毒/.test(text),
      frightened: /惊惧|frightened/.test(text),
      prone: /倒地|prone/.test(text),
      offGuard: /措手不及|off-guard|无防备/.test(text),
      heal: /healing|治疗|恢复/.test(text),
    };
  }

  function victimsForAction(originActor, meta) {
    const tpl = meta.templates[0];
    const feet = tpl?.distance || (meta.checks.length || meta.damages.length ? 15 : 5);
    const selected = [...(game.user.targets ?? [])].map((t) => t.actor).filter(Boolean);
    if (selected.length) return selected;
    return targetsInRange(originActor, feet, { enemiesOnly: true });
  }

  async function spawnNear(originActor, actorId, { label = "", maxCount = 99, tag = "" } = {}) {
    const pack = game.packs.get(PACK_ACTORS);
    const token = originActor.getActiveTokens?.(true, true)?.[0];
    if (!pack || !token || !canvas.scene) {
      ui.notifications.warn("无法生成：需要场景上的令牌与合集。");
      return null;
    }
    if (tag) {
      const existing = (canvas.tokens?.placeables ?? []).filter(
        (t) => t.actor?.getFlag?.(MODULE_ID, "spawnTag") === tag,
      );
      if (existing.length >= maxCount) {
        ui.notifications.info(`${label || "召唤物"}已达上限（${maxCount}）。`);
        return null;
      }
    }
    const src = await pack.getDocument(actorId);
    if (!src) {
      ui.notifications.warn(`缺少 Actor ${actorId}`);
      return null;
    }
    const data = src.toObject();
    delete data._id;
    data.folder = null;
    data.ownership = { default: 0, [game.user.id]: 3 };
    data.flags = data.flags || {};
    data.flags[MODULE_ID] = {
      ...(data.flags[MODULE_ID] || {}),
      spawnTag: tag || actorId,
      spawnedBy: originActor.id,
    };
    const [created] = await Actor.createDocuments([data]);
    const grid = canvas.grid.size;
    const td = foundry.utils.mergeObject(created.prototypeToken.toObject(), {
      actorId: created.id,
      actorLink: true,
      x: token.document.x + token.document.width * grid,
      y: token.document.y,
      name: created.name,
    });
    await canvas.scene.createEmbeddedDocuments("Token", [td]);
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: originActor }),
      content: `<p><strong>${label || "生成"}</strong>：已放置 <em>${created.name}</em>。</p>`,
    });
    return created;
  }

  async function executeParsedAction(actor, item) {
    const desc = item.system?.description?.value || "";
    const meta = parseDesc(desc);
    const name = item.name || "";
    const victims = victimsForAction(actor, meta);

    // 生成类（名称匹配）
    if (/放出毒蜂|再放一群/.test(name)) {
      await spawnNear(actor, SPAWN.bee, {
        label: "放出毒蜂",
        maxCount: 1,
        tag: `hive-bee:${actor.id}`,
      });
      return true;
    }
    if (/滋生水蛭/.test(name)) {
      await spawnNear(actor, SPAWN.leech, {
        label: "滋生水蛭",
        maxCount: 4,
        tag: `meathead-leech:${actor.id}`,
      });
      return true;
    }
    if (/掉落药包/.test(name)) {
      for (const v of victims.slice(0, 1)) await healActor(v, "2d8", "掉落药包");
      if (!victims.length) await healActor(actor, "2d8", "掉落药包（自用）");
      return true;
    }

    if (!meta.damages.length && !meta.checks.length && !meta.burn && !meta.poison) {
      return false;
    }

    if (!victims.length) {
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `<p><strong>${name}</strong>：请先选中目标（或靠近敌人），以便自动结算 AOE/豁免。</p>`,
      });
      return true;
    }

    for (const v of victims) {
      const tok = v.getActiveTokens?.(true, true)?.[0];
      for (const chk of meta.checks) {
        const type = /reflex|反射/i.test(chk.type)
          ? "reflex"
          : /fort|强韧/i.test(chk.type)
            ? "fortitude"
            : "will";
        const dos = await rollSave(v, type, chk.dc, []);
        const failed = dos !== null && dos <= 1;
        const critFail = dos !== null && dos <= 0;

        for (const dmg of meta.damages) {
          // basic save: half on success
          let formula = dmg;
          const isBasic = /basic|基础/.test(desc);
          if (isBasic && dos !== null && dos >= 2) {
            // success: half — approximate by rolling then halving message
            const roll = await new Roll(dmg.replace(/\[.*?\]/g, "").replace(/[^\dd+\-*/() ]/gi, "") || "1d6").evaluate().catch(() => null);
            if (roll) {
              const half = Math.floor(roll.total / 2);
              await ChatMessage.create({
                content: `<p><strong>${name}</strong>：${v.name} 豁免成功，半伤约 ${half}（请对照公式 ${dmg}）。</p>`,
              });
            }
            continue;
          }
          if (isBasic && dos !== null && dos === 3) continue; // crit success 0
          // strip pf2e damage type brackets for Roll: 2d6[fire] -> 2d6
          const clean = dmg.replace(/\[[^\]]+\]/g, "");
          const dtype = (dmg.match(/\[([a-z]+)\]/i) || [])[1] || "untyped";
          if (!isBasic || failed) {
            await dealDamage(v, clean, { type: dtype, token: tok, label: `${name} → ${v.name}` });
          }
        }

        if (failed || !meta.checks.length) {
          if (meta.burn) await applyCompendiumEffect(v, EFFECT.burn);
          if (meta.poison) await applyCompendiumEffect(v, EFFECT.poison);
          if (meta.frightened) await applyPF2eCondition(v, "frightened", critFail ? 2 : 1);
          if (meta.prone) await applyPF2eCondition(v, "prone");
          if (meta.offGuard) await applyPF2eCondition(v, "off-guard");
        } else if (meta.burn && /失败则获得.*灼烬|失败则.*灼烬/.test(desc) === false && meta.burn && !meta.checks.length) {
          await applyCompendiumEffect(v, EFFECT.burn);
        }
      }

      // 无豁免，仅伤害
      if (!meta.checks.length) {
        for (const dmg of meta.damages) {
          if (meta.heal || /healing/.test(dmg)) {
            const clean = dmg.replace(/\[[^\]]+\]/g, "");
            await healActor(v, clean, name);
          } else {
            const clean = dmg.replace(/\[[^\]]+\]/g, "");
            const dtype = (dmg.match(/\[([a-z]+)\]/i) || [])[1] || "untyped";
            await dealDamage(v, clean, { type: dtype, token: tok, label: `${name} → ${v.name}` });
          }
        }
        if (meta.burn) await applyCompendiumEffect(v, EFFECT.burn);
        if (meta.poison) await applyCompendiumEffect(v, EFFECT.poison);
        if (meta.frightened) await applyPF2eCondition(v, "frightened", 1);
        if (meta.offGuard) await applyPF2eCondition(v, "off-guard");
      }
    }

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><strong>${name}</strong>：已自动结算 ${victims.length} 个目标。</p>`,
    });
    return true;
  }

  /** 猎人：补全此前缺失的招牌动作 */
  const EXTRA_HUNTER = {
    "dr-circus-vengeance": async (actor) => {
      await actor.setFlag(MODULE_ID, `${FLAG}.circusVengeance`, true);
      await ChatMessage.create({
        content: `<p><strong>马戏复仇</strong>：本场对谋杀马戏团相关目标伤害/恐吓 +2（请 GM 打开对应开关或口述）。</p>`,
      });
    },
    "dr-deadeye": async (actor) => {
      await actor.setFlag(MODULE_ID, `${FLAG}.deadeye`, true);
      await ChatMessage.create({
        content: `<p><strong>沙漠神枪</strong>：30 尺外射击 +1；重击忽略标准掩蔽（本场标记已开）。</p>`,
      });
    },
    "edward-ironclad": async (actor) => {
      await ChatMessage.create({
        content: `<p><strong>铁甲战士</strong>：本轮下次受到的物理伤害 −5（反应已声明）。</p>`,
      });
    },
    "edward-name": async (actor) => {
      const t = primaryTarget(actor);
      if (!t) return ui.notifications.warn("请选中恐吓目标");
      const dos = await rollSave(t, "will", 22, ["emotion", "fear", "mental", "auditory"]);
      if (dos !== null && dos <= 1) await applyPF2eCondition(t, "frightened", dos <= 0 ? 2 : 1);
      if (dos !== null && dos <= 0) await applyPF2eCondition(t, "off-guard");
    },
    "edward-justice": async () => {
      await ChatMessage.create({
        content: `<p><strong>由我定义正义</strong>：对滥用权力目标伤害 +2、恐吓 DC 24（被动已生效，请 GM 标记目标）。</p>`,
      });
    },
    "edward-bush": async () => {
      await ChatMessage.create({
        content: `<p><strong>沼泽地的丛林法则</strong>：非魔法困难地形不减速；生存/自然 +2。</p>`,
      });
    },
    "emilia-wolf-chase": async (actor) => {
      await grantSwiftStep(actor);
      await ChatMessage.create({ content: `<p><strong>狼途追猎</strong>：获得一次免费快步（追猎节奏）。</p>` });
    },
    "emilia-trap": async (actor) => {
      const pack = game.packs.get(PACK_ITEMS);
      const src = pack ? await pack.getDocument("whbHuntBearTrp01") : null;
      if (src) {
        const data = src.toObject();
        delete data._id;
        await Item.createDocuments([data], { parent: actor, render: false });
      }
      await ChatMessage.create({ content: `<p><strong>林间陷阱</strong>：已尝试放入捕熊陷阱到物品栏。</p>` });
    },
    "emilia-wolf-skull": async (actor) => {
      const t = primaryTarget(actor);
      if (t) await applyCompendiumEffect(t, "whbHuntPreyMark1");
      await ChatMessage.create({ content: `<p><strong>宿敌颅骨</strong>：已尝试标记猎物。</p>` });
    },
    "emilia-red-hunter": async () => {
      await ChatMessage.create({ content: `<p><strong>红帽猎人</strong>：对猎物印记目标攻击/伤害优势（被动）。</p>` });
    },
    "flymander-pride": async (actor) => {
      await ChatMessage.create({ content: `<p><strong>骄傲之点</strong>：请打开护符开关；对措手不及目标 +精密。</p>` });
    },
    "flymander-raven": async () => {
      await ChatMessage.create({ content: `<p><strong>独眼与乌鸦</strong>：与红鸦共享侦察线（被动）。</p>` });
    },
    "flymander-pair": async () => {
      await ChatMessage.create({ content: `<p><strong>表亲侦察线</strong>：30 尺内红鸦可视即你可视（被动）。</p>` });
    },
    "flymander-joy": async (actor) => {
      await healActor(actor, "1d8", "腐化的快感");
    },
    "giggles-fated": async () => {
      await ChatMessage.create({ content: `<p><strong>命中注定</strong>：击球手之眼重击碎骨（武器规则）。</p>` });
    },
    "giggles-patient": async () => {
      await ChatMessage.create({ content: `<p><strong>狡猾而耐心</strong>：欺骗/意志抗读心 +2（被动）。</p>` });
    },
    "giggles-direct": async (actor) => {
      for (const a of targetsInRange(actor, 30, { enemiesOnly: false }).slice(0, 3)) {
        await ChatMessage.create({ content: `<p><strong>指挥班子</strong>：${a.name} 下一次攻击 +1 环境。</p>` });
      }
    },
    "cook-recipe": async (actor) => {
      const t = primaryTarget(actor);
      if (t) await applyCompendiumEffect(t, EFFECT.poison);
      await ChatMessage.create({ content: `<p><strong>胆汁炖腿</strong>：已尝试对目标叠中毒。</p>` });
    },
    "cook-cravings": async (actor) => {
      await healActor(actor, "2d8", "难以启齿的欲望");
    },
    "cook-butcher": async (actor) => {
      const t = primaryTarget(actor);
      if (!t) return ui.notifications.warn("请选中分尸目标（濒死/尸体）");
      await healActor(actor, "2d8+4", "分尸备料");
      await ChatMessage.create({ content: `<p><strong>分尸备料</strong>：从 ${t.name} 获取给养。</p>` });
    },
    "jv-hunter-primer": async (actor) => {
      const ally = primaryTarget(actor) || targetsInRange(actor, 30, { enemiesOnly: false })[0];
      if (!ally) return ui.notifications.warn("请选中盟友");
      await ChatMessage.create({
        content: `<p><strong>猎人入门</strong>：${ally.name} 下次攻击或豁免 +1 环境。</p>`,
      });
    },
    "jv-seek-twins": async (actor) => {
      const t = primaryTarget(actor);
      if (!t) return ui.notifications.warn("请选中线索目标");
      await actor.setFlag(MODULE_ID, `${FLAG}.twinMark`, t.id);
      await ChatMessage.create({ content: `<p><strong>寻找双胞胎</strong>：已标记 ${t.name}。</p>` });
    },
    "jv-heirloom-hand": async (actor) => {
      const ally = primaryTarget(actor);
      if (!ally) return ui.notifications.warn("请选中接收传家宝的盟友");
      await ChatMessage.create({
        content: `<p><strong>传家宝分发</strong>：将霰弹枪交给 ${ally.name}；其本场攻击 +1。约翰本场不再使用该枪。</p>`,
      });
    },
    "jv-cairn-eyes": async () => {
      await ChatMessage.create({ content: `<p><strong>空石冢的眼睛</strong>：抗恐惧/异能意志 +2（被动）。</p>` });
    },
    "laura-silent-ambush": async (actor) => {
      await ChatMessage.create({ content: `<p><strong>无声伏击</strong>：下次消音狙对未察觉目标升一档。</p>` });
      await actor.setFlag(MODULE_ID, `${FLAG}.silentAmbush`, true);
    },
    "laura-kite": async (actor) => {
      await grantSwiftStep(actor);
      await grantSwiftStep(actor);
      await ChatMessage.create({ content: `<p><strong>抽身远遁</strong>：已授予快步节奏（请移动）。</p>` });
    },
    "laura-fade": async (actor) => {
      await applyPF2eCondition(actor, "hidden");
      await ChatMessage.create({ content: `<p><strong>枝影隐没</strong>：尝试获得隐蔽/躲藏。</p>` });
    },
    "laura-reload": async (actor) => {
      await ChatMessage.create({ content: `<p><strong>冷静装填</strong>：装填不引发反应；可免费快步。</p>` });
      await grantSwiftStep(actor);
    },
    "laura-ghillie": async () => {
      await ChatMessage.create({ content: `<p><strong>枯枝伪装</strong>：在植被中 Stealth +2（被动）。</p>` });
    },
    "laura-cult-nihilism": async () => {
      await ChatMessage.create({ content: `<p><strong>猎人之夜 · 虚无傲慢</strong>：抗恐惧 +2（被动）。</p>` });
    },
    "redhill-overcall": async (actor) => {
      await handleDoubleStrike(actor, "redhill-overcall-strike", "超额召唤");
      await ChatMessage.create({ content: `<p><strong>超额召唤</strong>：请用主武器完成连打。</p>` });
    },
    "redhill-bluff": async (actor) => {
      const t = primaryTarget(actor);
      if (!t) return ui.notifications.warn("请选中目标");
      const dos = await rollSave(t, "will", 20, ["mental", "emotion"]);
      if (dos !== null && dos <= 1) await applyPF2eCondition(t, "off-guard");
    },
    "redhill-deed": async (actor) => {
      const t = primaryTarget(actor);
      if (t) await applyCompendiumEffect(t, "whbHuntLivingTg1");
      await ChatMessage.create({ content: `<p><strong>地契赌约</strong>：已尝试标记活靶子。</p>` });
    },
    "red-raven-sky": async (actor) => {
      await ChatMessage.create({ content: `<p><strong>血染天空</strong>：本回合飞行/高处打击 +1d6 精密。</p>` });
      await actor.setFlag(MODULE_ID, `${FLAG}.bloodSky`, true);
    },
    "red-raven-pair": async () => {
      await ChatMessage.create({ content: `<p><strong>表亲侦察线</strong>：与飞翔者共享视野（被动）。</p>` });
    },
    "riggins-ritual": async (actor) => {
      await ChatMessage.create({ content: `<p><strong>秩序仪式</strong>：本分钟豁免 +1 状态。</p>` });
      await actor.setFlag(MODULE_ID, `${FLAG}.orderRitual`, true);
    },
    "riggins-learn": async () => {
      await ChatMessage.create({ content: `<p><strong>军队仍须学习</strong>：对军官/盲忠目标扪心自问增强（被动）。</p>` });
    },
    "riggins-scales": async (actor) => {
      const hp = actor.system?.attributes?.hp;
      if (hp) {
        const add = 5;
        await actor.update({ "system.attributes.hp.temp": Math.max(Number(hp.temp || 0), add) });
      }
      await ChatMessage.create({ content: `<p><strong>灵魂天平</strong>：获得 5 临时生命值。</p>` });
    },
    "statesman-delegate": async (actor) => {
      const ally = primaryTarget(actor);
      await ChatMessage.create({
        content: `<p><strong>荒芜之地的代表</strong>：${ally?.name ?? "盟友"} 获得一次援助式 +1。</p>`,
      });
    },
    "fool-endless-joke": async (actor) => {
      const t = primaryTarget(actor);
      if (!t) return ui.notifications.warn("请选中目标");
      const dos = await rollSave(t, "will", 20, ["emotion", "fear", "mental", "visual"]);
      if (dos !== null && dos <= 1) await applyPF2eCondition(t, "frightened", dos <= 0 ? 2 : 1);
    },
    "vernon-beetle": async (actor) => {
      const t = primaryTarget(actor);
      if (t) {
        await applyCompendiumEffect(t, EFFECT.burn);
        await dealDamage(t, "1d6", { type: "fire", label: "火焰甲虫" });
      } else ui.notifications.warn("请选中甲虫目标");
    },
    "vernon-patriarch": async () => {
      await ChatMessage.create({ content: `<p><strong>坚定族长</strong>：盟友 15 尺内对抗恐惧 +1（被动）。</p>` });
    },
    "hardin-last-law": async (actor) => {
      await ChatMessage.create({ content: `<p><strong>法律与秩序的遗迹</strong>：半血以下打击 +1（被动标记）。</p>` });
      await actor.setFlag(MODULE_ID, `${FLAG}.lastLaw`, true);
    },
    "whitlaw-paranoia": async (actor) => {
      await ChatMessage.create({ content: `<p><strong>只有枪能稳住手</strong>：持枪时意志 +1；空手 −1。</p>` });
    },
    "whitlaw-aid": async (actor) => {
      const shot = findBySlug(actor, "consumable", "a-strong-constitution");
      await applyCompendiumEffect(actor, "whbHuntWeakAnti1");
      if (shot) {
        const qty = Number(shot.system?.quantity ?? 1);
        if (qty > 1) await shot.update({ "system.quantity": qty - 1 });
        else await shot.delete().catch(() => {});
      }
      await ChatMessage.create({ content: `<p><strong>强大的宪法</strong>：已施加抗毒效果。</p>` });
    },
    "whitlaw-charms": async () => {
      await ChatMessage.create({ content: `<p><strong>荣耀之梦 / 光泽</strong>：请使用物品栏护符开关。</p>` });
    },
    "whitlaw-26th": async (actor) => {
      await ChatMessage.create({ content: `<p><strong>第26团残影</strong>：本场对第26团相关记忆检定 +2。</p>` });
      await actor.setFlag(MODULE_ID, `${FLAG}.reg26`, true);
    },
    "dorothy-hunt-exorcist": async (actor) => {
      const t = primaryTarget(actor);
      if (t) await applyPF2eCondition(t, "frightened", 1);
      await ChatMessage.create({ content: `<p><strong>追捕驱魔人</strong>：已尝试施加惊惧。</p>` });
    },
    "dorothy-nightmare-walk": async (actor) => {
      await grantSwiftStep(actor);
      await applyPF2eCondition(actor, "concealed");
    },
    "dorothy-end": async (actor) => {
      const t = primaryTarget(actor);
      if (t) {
        await dealDamage(t, "2d8", { type: "mental", label: "终结噩梦" });
        await applyPF2eCondition(t, "frightened", 2);
      }
    },
    "dorothy-keepsakes": async (actor) => {
      await healActor(actor, "2d8", "家人遗物");
    },
  };

  // 合并进主文件的 handlers 表：通过 hook 调用
  Hooks.on("createChatMessage", async (message) => {
    if (message.author?.id !== game.user.id) return;
    const item = message.item;
    const actor = message.actor;
    if (!item || !actor || !canManage(actor)) return;
    if (item.type !== "action" && item.type !== "melee") return;

    const flags = actor.flags?.[MODULE_ID] || {};
    const isHunt = flags.huntHunter || flags.huntMonster || flags.huntProp;
    if (!isHunt) return;

    const slug =
      item.flags?.[MODULE_ID]?.huntGrantedAction || item.system?.slug || "";
    const key = `full:${message.id}:${slug || item.name}`;
    if (handled.has(key)) return;

    // 猎人额外动作（优先于描述解析）
    if (slug && EXTRA_HUNTER[slug]) {
      handled.add(key);
      setTimeout(() => handled.delete(key), 5000);
      await EXTRA_HUNTER[slug](actor);
      return;
    }

    // 已由主文件处理则跳过
    if (slug && handled.has(`${message.id}:${slug}`)) return;

    // 怪物 / 猎人动作：解析 @Damage/@Check/@Template 自动结算
    if (flags.huntMonster || (flags.huntHunter && item.type === "action")) {
      if (item.type === "action") {
        handled.add(key);
        setTimeout(() => handled.delete(key), 5000);
        const ok = await executeParsedAction(actor, item);
        if (!ok && flags.huntMonster) {
          if (/水蛭护卫|几乎失明|不直接攻击|惧火|群猎|贴身|特性残渣|尸体驱逐|狂暴|断头|第三/.test(item.name || "")) {
            await ChatMessage.create({
              speaker: ChatMessage.getSpeaker({ actor }),
              content: `<p><strong>${item.name}</strong>：阶段/被动类动作——相关效果见阶段自动化或手动。</p>`,
            });
          }
        }
      }
    }
  });

  // 喷火怪死亡：邻接自动喷焰
  Hooks.on("updateActor", async (actor, changes) => {
    if (!game.user.isGM) return;
    if (actor.flags?.[MODULE_ID]?.huntMonster !== "immolator") return;
    const hp = changes.system?.attributes?.hp?.value;
    if (typeof hp !== "number" || hp > 0) return;
    const key = `immolatorAutoDeath:${actor.id}`;
    if (handled.has(key)) return;
    handled.add(key);

    // 毒素击杀例外：检查最近伤害类型很难，简化为仍触发但聊天注明
    const token = actor.getActiveTokens?.(true, true)?.[0];
    const adj = token
      ? (canvas.tokens?.placeables ?? []).filter((t) => {
          if (!t.actor || t === token) return false;
          return canvas.grid.measurePath([token.center, t.center]).distance <= 5;
        })
      : [];
    for (const t of adj) {
      await dealDamage(t.actor, "2d6", { type: "fire", token: t, label: "临终喷焰" });
      await applyCompendiumEffect(t.actor, EFFECT.burn);
      const dos = await rollSave(t.actor, "reflex", 18, ["fire"]);
      if (dos !== null && dos <= 1) await applyCompendiumEffect(t.actor, EFFECT.burn);
    }
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><strong>喷火怪临终喷焰</strong>：已对 ${adj.length} 个邻接目标结算（毒素击杀请手动撤销）。</p>`,
    });
  });

  // 肉头：水蛭死亡反应滋生
  Hooks.on("updateActor", async (leech, changes) => {
    if (!game.user.isGM) return;
    if (leech.flags?.[MODULE_ID]?.huntMonster !== "meathead-leech") return;
    const hp = changes.system?.attributes?.hp?.value;
    if (typeof hp !== "number" || hp > 0) return;
    const hostId = leech.flags?.[MODULE_ID]?.spawnedBy;
    const host = hostId ? game.actors.get(hostId) : null;
    if (!host || host.flags?.[MODULE_ID]?.huntMonster !== "meathead") return;
    const key = `leechReplenish:${leech.id}`;
    if (handled.has(key)) return;
    handled.add(key);
    await spawnNear(host, SPAWN.leech, {
      label: "蛭巢反哺",
      maxCount: 4,
      tag: `meathead-leech:${host.id}`,
    });
  });

  // 蜂群离母体过远消散
  Hooks.on("updateToken", async (tokenDoc, changes) => {
    if (!game.user.isGM) return;
    if (changes.x === undefined && changes.y === undefined) return;
    const actor = tokenDoc.actor;
    if (actor?.flags?.[MODULE_ID]?.huntMonster !== "hive-swarm") return;
    const hostId = actor.flags?.[MODULE_ID]?.spawnedBy;
    if (!hostId) return;
    const host = game.actors.get(hostId);
    const hostTok = host?.getActiveTokens?.(true, true)?.[0];
    const tok = tokenDoc.object;
    if (!hostTok || !tok) return;
    const d = canvas.grid.measurePath([hostTok.center, tok.center]).distance;
    if (d > 60) {
      await ChatMessage.create({
        content: `<p><strong>毒蜂群</strong>：离母体超过 60 尺，消散并删除令牌。</p>`,
      });
      await tokenDoc.delete();
      // 触发母体「再放一群」提示
      if (host) {
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: host }),
          content: `<p><strong>再放一群</strong>：蜂群消散——可使用反应再放（或点击「再放一群」自动生成）。</p>`,
        });
      }
    }
  });

  console.log(`${MODULE_ID} | Hunt full-auto layer ready`);
}
