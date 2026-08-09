/**
 * 《德兰高城日志》— Ephemera 经典信件（单页）
 * 原文：Lore: Dran High City Journal（遗迹2）
 */

import {
  buildEphemeraLetterDocument,
  buildJournalEntryFromDocument,
  createEphemeraBookInWorld,
} from "./ephemera-journal-util.mjs";

const TITLE = "德兰高城日志";
const JOURNAL_ID = "whbDranHighJr001";
const HANDOUT_ID = "whbDranHighHand1";

const BODY = [
  "所有人都走了。亲爱的妈妈，爸爸，就连可怜的艾夫斯……我想他们都死了。庄园彻底沦为废墟。那座可怕的、邪恶的城堡毁了一切！",
  "哦，我以前从未如此孤单过。我该怎么办？",
  "艾夫斯之前不允许我去码头。他说那里不适合我这样爱幻想的女士，不应该让我忍受如此可怕的景象和刺鼻的气味。可是我还能怎么办呢？我必须尽快找到吃的，否则我肯定会饿死。",
  "我做到了，今天我独自一人去了码头。我在那里遇到了一位侍僧。他很和善。他告诉我，从今以后我会很安全，国王会保护我。这位真王从天而降，拯救我们所有人！哦，但我一直被教导说：「千万不要听信码头上那些无知之徒的话！」所以，我不太确定我是否相信这些……",
  "但艾夫斯说得对，我当然受不了鱼腥味！",
  "现在一切都说得通了！我又去拜访了那位侍僧，他告诉我，父母把我困在那座尘土飞扬的古老庄园里，是因为他们知道我与众不同。这么多年来，他们一直都知道！他说他们想让我远离救世主君王，所以君王才出手改造庄园——为了把我解救出来。想想看，就连我亲爱的艾夫斯也参与了他们的阴谋！我一直都知道，我的使命远不止于此，我注定要去往庄园之外更广阔的世界。",
  "我来此是为了最后一次告别这座庄园。再见了，妈妈、爸爸、艾夫斯，再见了，我过去的生活，也再见了，我亲爱的日记！我将和国王以及其他的德兰人一起，住进他那金碧辉煌的城堡。我将过上公主般的生活。哦，这简直就是梦想成真！",
].join("\n\n");

export async function buildDranHighLetterDocument() {
  return buildEphemeraLetterDocument({
    title: TITLE,
    template: "classic-letter",
    fields: {
      date: "告别庄园之日",
      to: "亲爱的日记",
      body: BODY,
      signature: "一名德兰小姐",
      ps: "",
    },
    hideBlockIds: ["ps"],
    effects: { yellowing: 38, aging: 35, grain: 20, ink: 40, agingSeed: 418 },
  });
}

export async function buildDranHighJournalDoc() {
  const document = await buildDranHighLetterDocument();
  return buildJournalEntryFromDocument({
    journalId: JOURNAL_ID,
    handoutPageId: HANDOUT_ID,
    title: TITLE,
    img: "icons/sundries/books/book-embossed-jewel-gold-green.webp",
    source: "Dran High City Journal",
    document,
  });
}

export async function createDranHighEphemeraBook({ open = true } = {}) {
  const document = await buildDranHighLetterDocument();
  return createEphemeraBookInWorld({
    title: TITLE,
    document,
    source: "Dran High City Journal",
    open,
  });
}
