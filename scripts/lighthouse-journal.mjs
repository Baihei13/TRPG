/**
 * 《灯塔日志》— Ephemera 经典信件（单页）
 * 原文：Lore: Lighthouse Journal（遗迹2）
 */

import {
  buildEphemeraLetterDocument,
  buildJournalEntryFromDocument,
  createEphemeraBookInWorld,
} from "./ephemera-journal-util.mjs";

const TITLE = "灯塔日志";
const JOURNAL_ID = "whbLighthousJr01";
const HANDOUT_ID = "whbLighthousHan1";

const BODY = [
  "最近听了太多鬼故事，吵得我睡不着觉。一些愚蠢的渔民和工人失踪了，然后各种窃窃私语就开始流传。等他们最终回来的时候，大家都会明白是怎么回事。居然还有海巫之类的东西。真是荒谬至极。",
  "我承认，我着了迷。那个女巫传说远比我想象的要复杂得多。我原以为那只是个吓唬小孩的故事，没想到沉没女巫的传说竟然流传已久。我从小就住在这破灯塔里，却从未见过什么。可是，万一她真的存在呢？",
  "她嗓音沙哑，带着嘲讽，显然不适应陆地干燥的空气。她用一个巨大的锚来剖开猎物的肚子。在她发动攻击之前，远处传来一阵令人毛骨悚然的笑声。所有的故事都一样。如果她就在这里呢？",
  "我看见她了。在岸边。真的是她！这太危险了。就算拼了命，我也要搬到内陆去。这灯塔就让它坍塌吧，我才不在乎。",
].join("\n\n");

export async function buildLighthouseLetterDocument() {
  return buildEphemeraLetterDocument({
    title: TITLE,
    template: "classic-letter",
    fields: {
      date: "灯塔守夜",
      to: "——",
      body: BODY,
      signature: "灯塔看守",
      ps: "",
    },
    hideBlockIds: ["ps"],
    effects: { yellowing: 44, aging: 46, grain: 24, ink: 38, agingSeed: 721 },
  });
}

export async function buildLighthouseJournalDoc() {
  const document = await buildLighthouseLetterDocument();
  return buildJournalEntryFromDocument({
    journalId: JOURNAL_ID,
    handoutPageId: HANDOUT_ID,
    title: TITLE,
    img: "icons/sundries/documents/document-letter-sealed-brown.webp",
    source: "Lighthouse Journal",
    document,
  });
}

export async function createLighthouseEphemeraBook({ open = true } = {}) {
  const document = await buildLighthouseLetterDocument();
  return createEphemeraBookInWorld({
    title: TITLE,
    document,
    source: "Lighthouse Journal",
    open,
  });
}
