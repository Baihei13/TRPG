/**
 * 《莫罗医生的日记》— Ephemera 原生书，较大字号 + 装饰
 * 原文：Lore: Morrow's Journal
 */

import {
  esc,
  emptyBlocks,
  buildEphemeraBookDocument,
  buildJournalEntryFromDocument,
  createEphemeraBookInWorld,
} from "./ephemera-journal-util.mjs";

const TITLE = "莫罗医生的日记";
const JOURNAL_ID = "whbMorrowJrnl001";
const HANDOUT_ID = "whbMorrowHand001";

const BODY =
  "font-family:Georgia,'Songti SC',SimSun,serif;font-size:1.22rem;line-height:1.95;color:#1a120c;text-align:justify;";
const DATE =
  "margin:0 0 1rem;font-size:1.45rem;font-weight:700;letter-spacing:0.1em;color:#2a1408;border-bottom:1px solid rgba(60,35,20,0.35);padding-bottom:0.35rem;";
const PARA = "margin:0 0 1rem;font-size:1.22rem;line-height:1.95;text-align:justify;";
const ORNAMENT =
  "margin:0 0 1.1rem;text-align:center;font-size:0.95rem;letter-spacing:0.35em;color:#6a4a30;opacity:0.85;";
const EMPH = "font-weight:700;color:#3a0c04;letter-spacing:0.04em;";

const ENTRIES = [
  {
    title: "乌拉月 2 日 · 560年",
    paragraphs: [
      "三利拉敏显示183号病人出现轻微变化——眼动与心率增加。仍对任何言语刺激全无反应。建议将日推荐剂量增至 48 cc。",
      "47号病人今日再度发作。建议每次发作后电休克治疗两天，并预先减少卓司匹拉剂量。",
      "须当面告知莱文这些变更。此人惯于「忘记」书面指示。",
    ],
  },
  {
    title: "乌拉月 29 日",
    paragraphs: [
      "昨日数名病人被误用剂量，乃至误用药物。一人不得不洗胃，长期影响仍不确定。本月已是第三次，莱文已被解职。其余职员亦将接受严格审查。",
      "我必须建立更严的给药规程。例行与严谨细致乃吾辈至高准则。无此则改造无从谈起。纵令改造已不可能（多数病人或属此类），仍须一丝不苟记录药物与效应，以资借鉴。今日于无望者身上所得，或能救明日下一病人。",
      "我敢发誓，若无我在，此地不出多时便会沦为残弱者的监狱——职员亦在其中。",
    ],
  },
  {
    title: "雷朱尔月 17 日",
    paragraphs: [
      "多名病人发狂了！这是充满痉挛、胡言乱语与癫狂的一日。痴呆发作在所有病人中激增十倍，隔离翼变得喧闹不堪。",
      "多名病人胡言乱语，从惊呼「一切都变了」，到关于阴影中怪物的骇人警告。就连若干木僵或退缩的病人也显出新的躁动迹象。",
      "显然是药物被调包，或更糟。我必须彻底讯问职员，找出罪魁祸首并杀一儆百。",
    ],
  },
  {
    title: "雷朱尔月 22 日",
    paragraphs: [
      "我又累又兴奋。经过数日严审与调查，我相信问题根本不在用药不当！我推测，近期事件激增或系院内某种集体癔症所致。",
      "但究竟是什么引发了这种事？",
      "我已宣布暂时全面停药的实验。看这癔症会把我们引向何方，倒也有趣。",
    ],
  },
  {
    title: "塔瓦德月 14 日 · 561年",
    paragraphs: [
      "癔症似乎并不局限于本院。多名新入院者呈现类似症状。就在昨日，一名鞋匠学徒到来，自称在执行一项「斩除恶物」的任务——现已寻求治疗，并服用实验性药物多佐皮翁。",
      "贵族精神病学院下周将议此事。我如此专注于己务，难以就民间事态发言，但请放心，我自有满囊数据与疑问。",
    ],
  },
  {
    title: "诺瓦齐斯月 17 日",
    paragraphs: [
      "我心神不宁。我对病人发作的恼怒，已超出应有分寸。",
      "此处与学院皆无结论。我必须尽量记录，却谈何容易。职员……他们竟开始殴打那些讲述所见之物的病人。不可信任（他们可曾可信？），连我自己也几乎难以抑止动手。",
      "不。我必须倾听并记录。",
      "胡话中有几条反复出现的线索，或许只是集体癔症中彼此传染所致：怪物、邪物，以及他们称为「夜织者」的某一存在。",
      "我必须承认，关于这最后一个传说的描述令我着迷，尽管我不明白为何……",
    ],
  },
  {
    title: "罗玛月 3 日",
    paragraphs: [],
    closing: true,
  },
];

function flowHtml(entry, { closing = false } = {}) {
  const paras = (entry.paragraphs ?? [])
    .map((p) => `<p style="${PARA}">${esc(p)}</p>`)
    .join("");

  if (closing) {
    return `<div style="${BODY}">
<p style="${ORNAMENT}">✦ &nbsp;—&nbsp; ✦</p>
<p style="${DATE}">${esc(entry.title)}</p>
<p style="${PARA}font-style:italic;font-size:1.28rem;">我看见了。</p>
<p style="${PARA}font-style:italic;font-size:1.28rem;">不可告诉职员。不可。</p>
<p style="${PARA}">于梦中而来。与病人描述的一模一样。</p>
<p style="${PARA}">该与他们谈谈吗？要。了解更多……为了记录。</p>
<p style="${PARA}">必须更多地了解她。</p>
<p style="margin:1.6rem 0 0.5rem;text-align:center;font-size:1.75rem;font-weight:900;letter-spacing:0.45em;color:#2a0804;text-shadow:0 0 6px rgba(45,6,2,0.35);">夜 织 者</p>
<div aria-hidden="true" style="margin:1.2rem auto 0;max-width:55%;height:1px;background:linear-gradient(to right,transparent,#4a1e0e 20%,#4a1e0e 80%,transparent);opacity:0.7;"></div>
</div>`;
  }

  return `<div style="${BODY}">
<p style="${ORNAMENT}">✦ &nbsp;—&nbsp; ✦</p>
<p style="${DATE}">${esc(entry.title)}</p>
${paras}
<div aria-hidden="true" style="margin:1.4rem auto 0;max-width:42%;height:1px;background:linear-gradient(to right,transparent,rgba(70,45,25,0.45) 30%,rgba(70,45,25,0.45) 70%,transparent);"></div>
</div>`;
}

export async function buildMorrowEphemeraDocument() {
  const pages = ENTRIES.map((entry) => ({
    title: entry.title,
    flowContent: flowHtml(entry, { closing: entry.closing }),
  }));

  // 双页展开需偶数页；补一页空白衬页
  if (pages.length % 2 === 1) {
    pages.push({
      title: "",
      flowContent: `<div style="${BODY}"><p style="${ORNAMENT}">✦</p></div>`,
    });
  }

  const document = await buildEphemeraBookDocument({
    title: TITLE,
    pages,
    template: "old-book",
    bookLabels: {
      appearance: {
        coverColor: "#3a2438",
        colorStrength: 45,
        gloss: 35,
        leather: 60,
        aging: 50,
      },
    },
    effects: { yellowing: 45, aging: 40, grain: 22, ink: 38, agingSeed: 207 },
  });

  // normalize 会把缺省页标题改成 "Page N"，写回我们的正文
  document.pages = pages.map((src, i) => ({
    ...(document.pages[i] ?? { id: `page-${i + 1}`, ...emptyBlocks() }),
    title: src.title,
    flowContent: src.flowContent,
  }));
  return document;
}

export async function buildMorrowJournalDoc() {
  const document = await buildMorrowEphemeraDocument();
  return buildJournalEntryFromDocument({
    journalId: JOURNAL_ID,
    handoutPageId: HANDOUT_ID,
    title: TITLE,
    img: "icons/sundries/documents/document-signed-red.webp",
    source: "Morrow's Journal",
    document,
  });
}

export async function createMorrowEphemeraBook({ open = true } = {}) {
  const document = await buildMorrowEphemeraDocument();
  return createEphemeraBookInWorld({
    title: TITLE,
    document,
    source: "Morrow's Journal",
    open,
  });
}
