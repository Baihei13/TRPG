/**
 * 猎人入门 — 菲利普·赫夫·琼斯（AHA）欢迎信（Ephemera 信件）
 */

import {
  buildEphemeraLetterDocument,
  buildJournalEntryFromDocument,
  createEphemeraBookInWorld,
} from "./ephemera-journal-util.mjs";

const SOURCE = "Hunt: Showdown — AHA Welcome / Hunter Primer";
const TITLE = "猎人入门 · 美国猎人协会欢迎信";
const JOURNAL_ID = "whbHuntAhaWelc01";
const HANDOUT_ID = "whbHuntAhaWelcH1";

const BODY = `我非常高兴有机会给您写信，并欢迎您加入美国猎人协会。即使是为了如此正义的事业，您也将承担远超常人想象的风险，但如果您成功了，获得的奖励将不仅仅让您的钱包鼓起来。

协会以各种形式存在了数百年，但它留下的遗产却是沉默——以及一个摆脱了残暴、无脑、食人怪物的世界；摆脱了那些曾经是人、如今却空洞腐朽、只想用你的血肉填满那腐烂躯壳的生物。你或许听说过荒野中等待着你的是什么。千万不要低估它邪恶的力量。

恐怕我的誓言不允许我将更多细节诉诸笔端。总之，我们在这项事业上并肩作战——但我必须提醒你们：并非所有猎人都会这么说，而且你们务必记住，背叛的形式多种多样。

高度评价，

菲利普·赫夫·琼斯，医学博士
美国猎人协会主任兼
杰克逊路易斯安那州精神病院院长`;

export async function buildAhaWelcomeLetterDocument() {
  return buildEphemeraLetterDocument({
    title: TITLE,
    template: "classic-letter",
    fields: {
      date: "——",
      to: "新晋猎人",
      body: BODY,
      signature: "",
      ps: "",
    },
    effects: { yellowing: 36, aging: 32, grain: 14, ink: 30, agingSeed: 1885 },
  });
}

export async function buildAhaWelcomeLetterJournalDoc() {
  return buildJournalEntryFromDocument({
    journalId: JOURNAL_ID,
    handoutPageId: HANDOUT_ID,
    title: TITLE,
    img: "icons/sundries/documents/document-letter-sealed-burgundy.webp",
    source: SOURCE,
    document: await buildAhaWelcomeLetterDocument(),
  });
}

export async function createAhaWelcomeLetter({ open = true } = {}) {
  return createEphemeraBookInWorld({
    title: TITLE,
    document: await buildAhaWelcomeLetterDocument(),
    source: SOURCE,
    open,
  });
}
