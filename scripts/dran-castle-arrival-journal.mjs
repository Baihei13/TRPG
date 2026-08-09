/**
 * 《德兰回忆：城堡抵达》— Ephemera 经典信件（单页）
 * 原文：Lore: Dran Memory — Castle Arrival（遗迹2）
 */

import {
  buildEphemeraLetterDocument,
  buildJournalEntryFromDocument,
  createEphemeraBookInWorld,
} from "./ephemera-journal-util.mjs";

const TITLE = "德兰回忆：城堡抵达";
const JOURNAL_ID = "whbDranCastArr01";
const HANDOUT_ID = "whbDranCastHand1";

const BODY = [
  "它确实是从天而降的。我会把事情的来龙去脉完整地记录下来，留给后人，让他们知道。",
  "我当时正在散步，突然感觉空气中有些异样。之前已经下了好几天的雨，但就在那一刻，一场巨大的风暴凭空而起。巨浪滔天，电闪雷鸣，大地摇晃崩裂，各种景象令人触目惊心。然后我抬头一看，就看到了它。",
  "城堡旋转着从天而降，直到「噗通」一声！它开始坠落，我喊道：「如果非要找人算账，那就去抓那些傲慢自大的德兰人！」果然，我一声令下，城堡仿佛点了点头，飞走了，把上城区的德兰人碾成了纸片。",
  "这就是德兰国王和他的城堡来到这里的由来。",
].join("\n\n");

export async function buildDranCastleArrivalLetterDocument() {
  return buildEphemeraLetterDocument({
    title: TITLE,
    template: "classic-letter",
    fields: {
      date: "德兰回忆",
      to: "致后来人",
      body: BODY,
      signature: "某目击者",
      ps: "",
    },
    hideBlockIds: ["ps"],
    effects: { yellowing: 48, aging: 44, grain: 22, ink: 40, agingSeed: 902 },
  });
}

export async function buildDranCastleArrivalJournalDoc() {
  const document = await buildDranCastleArrivalLetterDocument();
  return buildJournalEntryFromDocument({
    journalId: JOURNAL_ID,
    handoutPageId: HANDOUT_ID,
    title: TITLE,
    img: "icons/sundries/documents/document-letter-sealed-brown.webp",
    source: "Dran Memory — Castle Arrival",
    document,
  });
}

export async function createDranCastleArrivalLetter({ open = true } = {}) {
  const document = await buildDranCastleArrivalLetterDocument();
  return createEphemeraBookInWorld({
    title: TITLE,
    document,
    source: "Dran Memory — Castle Arrival",
    open,
  });
}
