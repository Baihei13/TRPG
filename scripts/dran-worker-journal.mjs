/**
 * 《德兰工人的日记》— Ephemera 经典信件（单页）
 * 原文：Lore: Dran Worker's Journal（遗迹2）
 */

import {
  buildEphemeraLetterDocument,
  buildJournalEntryFromDocument,
  createEphemeraBookInWorld,
} from "./ephemera-journal-util.mjs";

const TITLE = "德兰工人的日记";
const JOURNAL_ID = "whbDranWorkJr001";
const HANDOUT_ID = "whbDranWorkHand1";

const BODY = [
  "我上了夜班。没人愿意上，但工资更高。要想在艾尔德丽面前露面，就得挣钱养家。能有多糟呢？工作就是工作，我常说。",
  "我一切都还算顺利，但我的脑袋总是跟我作对。这是最糟糕的地方。在黑暗中，任何一点声响都会变得格外可怕。我会找到办法挺过去的。",
  "这次我确定我听到了。码头下面传来奇怪的声音。像是吟唱之类的。我一直以为那些故事只是为了吓唬我们这些上夜班的人而编造的。也许是个恶作剧。对，就是这样。我很好奇下面到底发生了什么。如果我能找到答案，我就能成为英雄了。那样的话，她或许就会注意到我了。",
  "我决定行动。我带了把利器，今晚我要把这一切闹剧彻底查个水落石出。说不定还能拿到更高的报酬。我不怕打架，而且我能保护自己，最坏又能怎样？",
].join("\n\n");

export async function buildDranWorkerLetterDocument() {
  return buildEphemeraLetterDocument({
    title: TITLE,
    template: "classic-letter",
    fields: {
      date: "夜班",
      to: "",
      body: BODY,
      signature: "一名德兰工人",
      ps: "",
    },
    hideBlockIds: ["ps"],
    effects: { yellowing: 52, aging: 48, grain: 26, ink: 36, agingSeed: 314 },
  });
}

export async function buildDranWorkerJournalDoc() {
  const document = await buildDranWorkerLetterDocument();
  return buildJournalEntryFromDocument({
    journalId: JOURNAL_ID,
    handoutPageId: HANDOUT_ID,
    title: TITLE,
    img: "icons/sundries/documents/document-symbol-circle-brown.webp",
    source: "Dran Worker's Journal",
    document,
  });
}

export async function createDranWorkerEphemeraBook({ open = true } = {}) {
  const document = await buildDranWorkerLetterDocument();
  return createEphemeraBookInWorld({
    title: TITLE,
    document,
    source: "Dran Worker's Journal",
    open,
  });
}
