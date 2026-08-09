/**
 * 《仙灵的诞生》— Ephemera 原生神话书
 * 原文：Lore: Birth of the Fae（遗迹2）
 */

import {
  esc,
  emptyBlocks,
  chunkSegmentsByChars,
  padBookPagesEven,
  buildEphemeraBookDocument,
  buildJournalEntryFromDocument,
  createEphemeraBookInWorld,
} from "./ephemera-journal-util.mjs";

const TITLE = "仙灵的诞生";
const JOURNAL_ID = "whbFaeBirth00001";
const HANDOUT_ID = "whbFaeBirthHand1";

/** 字号略降 + 每页字数上限，避免单章撑爆书页被裁切 */
const BODY =
  "font-family:Georgia,'Songti SC',SimSun,serif;font-size:1.08rem;line-height:1.85;color:#1a120c;text-align:justify;";
const DATE =
  "margin:0 0 0.85rem;font-size:1.28rem;font-weight:700;letter-spacing:0.08em;color:#2a1408;border-bottom:1px solid rgba(60,35,20,0.35);padding-bottom:0.3rem;";
const PARA = "margin:0 0 0.85rem;font-size:1.08rem;line-height:1.85;text-align:justify;";
const QUOTE =
  "margin:0.35rem 0 0.85rem;padding:0.3rem 0 0.3rem 0.75rem;border-left:3px solid rgba(60,35,20,0.35);font-style:italic;font-size:1.05rem;line-height:1.8;color:#2a180c;";
const ORNAMENT =
  "margin:0 0 0.9rem;text-align:center;font-size:0.9rem;letter-spacing:0.35em;color:#6a4a30;opacity:0.85;";
const PAGE_CHARS = 380;

/** @type {Array<{title:string, paragraphs?:string[], quotes?:string[], closing?:boolean}>} */
const CHAPTERS = [
  {
    title: "序 · 衰弱",
    paragraphs: [
      "在远古时期，仙灵们饱受一种名为「衰弱」的可怕疾病的折磨。无论老幼、贫富，无人幸免——衰弱都会侵袭他们。这种疾病既无药可医，也无药可救。",
      "这就是他们如何战胜衰弱的故事。",
    ],
  },
  {
    title: "祈祷无应",
    paragraphs: [
      "他们日夜不停地向造物主祈祷，泪水与鲜血交织。",
    ],
    quotes: [
      "「伟大的光明之灵啊，请聆听我们的祈祷，让我们明白我们究竟做了什么！我们不再饮血，也不再沉溺于狂欢杀戮。我们恪守这些律法，以及更多。神啊，请告诉我们我们的罪孽，我们将忏悔！」",
    ],
    paragraphsAfter: [
      "然而，尽管他们虔诚祈祷，伟大的光明之灵却始终没有回应。",
    ],
  },
  {
    title: "启程",
    paragraphs: [
      "「我们必须找到他，」一位名叫阿拉明的战士说道。",
      "「如何找到他？」众人问道。「伟大的光明之灵居住在太阳之外，那是仙灵从未涉足的地方。」",
      "「除了我们，没有其他仙灵可以去那里，」阿拉明的兄弟、猎人阿拉莫尔说道。「还有谁比我们更适合呢？」",
      "阿拉明赞同道：「我们必须去。因为如果神灵不听从我们的祈祷，所有仙灵都将灭亡。」",
      "于是，两兄弟带着梦境者托拉和先知萨瑞尔，踏上了寻找伟大神灵居所的旅程。这四人一起，开始了前往太阳彼岸神庙的漫长而艰辛的跋涉。",
    ],
  },
  {
    title: "女王小径",
    paragraphs: [
      "接下来的几周里，萨瑞尔引导他们沿着女王小径进入荒野，然后又从那里前往禁忌之巅——就连阿拉莫尔也无法在那里找到食物。烈日炙烤着他们的头顶。他们的双腿如同塞满湿透衣物的箱子，饥饿感从内而外地撕扯着他们。",
      "第十七天，托拉发出一声凄厉的惨叫，倒在了地上。阿拉莫尔跑向她，但她对他的恳求毫无反应。她的脸上开始出现鳞片的轮廓——这是衰败的征兆。",
      "萨瑞尔悲痛欲绝地哀嚎道：「伟大的神灵抛弃了我们！我们对他来说什么都不是！」",
      "阿拉莫尔斥责道：「不！我们神圣的造物主不会如此抛弃我们。这只是对我们信仰的考验。」",
      "「我们快到了，」阿拉明说，「我们只需要到达那座山的顶峰。在那里，我们将找到伟大的神灵，结束这场诅咒——为了托拉，也为了我们所有人。」",
      "萨瑞尔点了点头，泪水却从她的眼中滑落。山峰高耸，日子漫长。托拉恢复了意识，但她脸上的鳞片却越来越明显。很快，她就无法支撑自己的重量，阿拉明不得不背着她。",
      "接着，阿拉明的脸上也出现了鳞片。",
    ],
  },
  {
    title: "信仰的考验",
    paragraphs: [
      "「没用的，」萨瑞尔说，「我们连一半的路程都没到。伟大的神灵根本不在乎我们。」",
      "「闭嘴！」阿拉莫尔拔出匕首，砍向先知。「你休想再亵渎造物主！」",
      "阿拉明抓住阿拉莫尔的手腕，但他的手无力地颤抖着。「兄弟，愿你平安。不要为悲伤的人玷污你的双手。我们这些踏上这条道路的人，最重要的是，绝不能犯罪。这是考验。」",
      "「她的异端邪说会动摇我们的根基，兄弟。造物主会乐见她死去！」",
      "「我们不杀人！」阿拉明说完，精疲力竭地坐了下来。「我们必须继续前进，无论付出什么代价。」",
      "他们又攀登了数日，直到阿拉莫尔不得不背着弟弟，托拉也时而昏迷时而清醒。饥饿折磨着他们的胃，但山顶近在眼前，驱使着他们不断前行。",
    ],
  },
  {
    title: "空山顶",
    paragraphs: [
      "他们终于到达了山顶。烈日炙烤着他们的脸庞，寒风吹拂着他们的脖颈。然而，山顶却空无一物。没有神庙——只有远处连绵起伏的群山，一座比一座高。",
      "阿拉莫尔绝望地跪倒在地。阿拉明仰面摔倒在地。",
      "萨瑞尔此前并未察觉，她爬上了阿拉明身后的山顶，悲痛地喊道：「托拉！不！」",
      "兄弟俩转过身。萨瑞尔将脸埋在托拉的胸口。托拉的皮肤变得惨白，双颊凹陷。她双眼睁着，凝视着远处绵延的群山，却什么也看不见。",
      "托拉死了。",
    ],
  },
  {
    title: "异端与血",
    paragraphs: [
      "萨瑞尔仰望天空，哭喊道：「为什么？这一切有什么用？伟大的神灵抛弃了我们。我们对他来说什么都不是。」",
      "「该死的先知！」阿拉莫尔怒吼道，痛苦的泪水也浸湿了他的脸颊。「闭上你的亵渎之言，否则我就替你闭嘴！伟大的神灵——」",
      "「根本不存在！」她啐了一口。「否则他就是个毫无用处、不值得崇拜的存在。你的『伟大的神灵』除了给我们带来痛苦，什么也没有。」",
      "阿拉莫尔紧紧握住腰间的匕首，指节因握柄而泛白。「你之所以还活着，只是因为我哥哥替你说话。我们的痛苦都是你造成的。」",
      "「不，是你造成的！我们根本不应该来。如果不是你那愚蠢的计划，托拉或许还能活下来！」她从姐姐的刀鞘中拔出刀刃，站起身来，胸膛随着每一次灼热的呼吸剧烈起伏。「够了！不会再有人为了你的教条而死！」",
      "萨瑞尔跃到阿拉莫尔身上。猎人试图拔出匕首自卫，却被刀鞘卡住。先知挥刀砍向他的脖子，他怒目而视。",
      "突然，她停了下来，喉咙里发出一声压抑的咳嗽。鲜血从她的下巴滴落——阿拉莫尔看到阿拉明在她身下，双手紧握着刀柄，刀深深地刺入她的胸膛。",
      "阿拉明猛地站起身，一把将她推开。刀刃从她身上滑落，她倒在姐姐身边，鲜血在冰冷的山间空气中凝结成晶。",
      "「哥哥……」阿拉莫尔轻声说道，「你的皮肤。」",
      "阿拉明看着自己的手臂，抚摸着脸颊。鳞片脱落了，他的力量也恢复了。衰弱之力已经离他而去。「但我犯了罪。我为你杀人，然而谋杀是……」",
      "「你杀了一个异教徒，兄弟，」阿拉莫尔说。「这是一个征兆。」",
      "阿拉明站了一会儿，惊讶地搓着胳膊。最后，他点了点头。「看来，伟大的神灵站在我们这边。我们继续前进吧。」",
    ],
  },
  {
    title: "伪神",
    paragraphs: [
      "他们还要过很多天才能到达目的地。「衰弱」再次降临——这一次，他们两人都受到了影响。随着时间的流逝，他们的体力逐渐耗尽。武器和行囊变得太过沉重，他们不得不把这些东西留在身后。他们再也抬不起胳膊，感觉呼吸的空气就像沙子一样。",
      "最终，他们登上了最高的山峰，在阳光的映照下，看到了他们苦苦寻觅已久的圣殿。他们勉强恢复了一些体力，推开大门走了进去。",
      "一个威严的存在高耸在他们面前，散发着美丽和光芒。兄弟俩本能地跪倒在地。阿拉明第一个开口说道：「哦，伟大的神灵！我们前来恳求您帮助我们的族人！」",
      "那存在注视着他们，却一言不发。",
      "兄弟俩互相看了一眼。阿拉莫尔开口了：「我们踏上了一段漫长而艰辛的旅程，只为拯救仙灵族。他们正遭受一种名为『衰败』的疾病的侵袭，而我们自己也可能因此丧命。」",
      "「我们一直恪守您的律法，」阿拉明说道，「然而，衰败依然肆虐。请您告诉我们，我们该如何忏悔？」",
      "伟大的灵体纹丝不动，它凝视着他们，仿佛过了永恒。",
      "兄弟俩将脸贴在神殿的地板上。「我们走了这么远，」阿拉莫尔说道，「我们需要您，伟大的造物主。没有您，我们将一无所有。」",
      "又是一阵沉默，兄弟俩甚至怀疑灵体是否能听到他们的声音。",
      "最终，尽管它没有开口，伟大的灵体的声音却响彻整个神殿：",
    ],
    quotes: ["「我没有创造你们。」"],
    paragraphsAfter: [
      "阿拉明和阿拉莫尔困惑地对视了一眼。「当然，是您创造的，」阿拉莫尔说道，「您是伟大的灵体，是所有仙灵的神。」",
      "「我是你们的伟大之灵，」它说道，「的确，我统治着所有的仙灵。但我并非你们的创造者。造物主赋予了祂的子民自由意志——一份被浪费和挥霍的礼物，因为仙灵是邪恶的种族，是混乱和毁灭的化身。我曾试图控制你们，给予你们指引、律法和导师——但这一切都被背叛了。仙灵只爱死亡，而我只能尽力阻止你们的毁灭。不，求道者们，我不会拯救你们，让你们免于那拯救世界的力量。」",
      "兄弟俩目瞪口呆，沉默不语，直到阿拉莫尔开口道：「毁灭……它来自你们。」",
      "伟大之灵一言不发，转身离去。神殿的光芒也随之黯淡。",
    ],
  },
  {
    title: "弑神",
    paragraphs: [
      "「它来自你们！」阿拉莫尔怒吼一声，站起身来，扑向伟大之灵。",
      "阿拉明也紧随其后。兄弟俩与他们的神灵搏斗，用利爪撕扯着它的眼睛，牙齿深深地刺入它的血肉。",
      "那灵体咆哮着撕咬着他们，召唤着风暴的怒火。神庙的大门轰然打开。狂风呼啸，碎片划破他们的皮肤。闪电震颤着墙壁，直到地板都裂开了——然而兄弟俩依然奋力击打着他们那虚假的创造者。",
      "最终，伴随着一声震天动地的怒吼，伟大的灵体倒在了地上。它的鲜血染红了神庙，它眼中的光芒也渐渐消逝。",
      "阿拉明和阿拉莫尔躺在它身旁，大口喘着气。鳞片从他们的皮肤上脱落，伤口也愈合了。在那一刻，毁灭之力离开了他们——离开了所有的仙灵——永不复返。",
    ],
  },
  {
    title: "尾声 · 除了我们自己",
    paragraphs: [
      "「兄弟，」阿拉莫尔问道，「我们做了什么？」",
      "阿拉明撑起身子，凝视着那庞大的身躯。「我们救了自己。」",
      "「可是伟大的灵体……我们杀死了我们的神。」",
      "「他不是神，兄弟。他从来就不是。」阿拉明转过身，透过神庙的大门，望向外面的世界。",
    ],
    closing: true,
  },
];

function chapterSegments(chapter) {
  /** @type {Array<{kind: string, text: string}>} */
  const segs = [];
  for (const p of chapter.paragraphs ?? []) segs.push({ kind: "p", text: p });
  for (const q of chapter.quotes ?? []) segs.push({ kind: "q", text: q });
  for (const p of chapter.paragraphsAfter ?? []) segs.push({ kind: "p", text: p });
  return segs;
}

function renderSegments(segs) {
  return segs
    .map((s) =>
      s.kind === "q"
        ? `<p style="${QUOTE}">${esc(s.text)}</p>`
        : `<p style="${PARA}">${esc(s.text)}</p>`
    )
    .join("");
}

function flowHtmlPage(title, segs, { continuation = false, closing = false } = {}) {
  const heading = continuation ? `${title}（续）` : title;
  const content = renderSegments(segs);

  if (closing) {
    return `<div style="${BODY}">
<p style="${ORNAMENT}">✦ &nbsp;—&nbsp; ✦</p>
<p style="${DATE}">${esc(heading)}</p>
${content}
<p style="margin:1.4rem 0 0.45rem;text-align:center;font-size:1.35rem;font-weight:900;letter-spacing:0.28em;color:#1a2e22;text-shadow:0 0 6px rgba(20,50,35,0.35);">除了我们自己，别无神明</p>
<div aria-hidden="true" style="margin:1.1rem auto 0;max-width:55%;height:1px;background:linear-gradient(to right,transparent,#2a4a38 20%,#2a4a38 80%,transparent);opacity:0.7;"></div>
</div>`;
  }

  return `<div style="${BODY}">
<p style="${ORNAMENT}">✦ &nbsp;—&nbsp; ✦</p>
<p style="${DATE}">${esc(heading)}</p>
${content}
<div aria-hidden="true" style="margin:1.2rem auto 0;max-width:42%;height:1px;background:linear-gradient(to right,transparent,rgba(70,45,25,0.45) 30%,rgba(70,45,25,0.45) 70%,transparent);"></div>
</div>`;
}

function pagesFromChapter(chapter) {
  const segs = chapterSegments(chapter);
  if (!segs.length) {
    return [
      {
        title: chapter.title,
        flowContent: flowHtmlPage(chapter.title, [], { closing: !!chapter.closing }),
      },
    ];
  }
  const chunks = chunkSegmentsByChars(segs, PAGE_CHARS);
  return chunks.map((chunk, i) => ({
    title: i === 0 ? chapter.title : `${chapter.title}（续）`,
    flowContent: flowHtmlPage(chapter.title, chunk, {
      continuation: i > 0,
      closing: !!chapter.closing && i === chunks.length - 1,
    }),
  }));
}

export async function buildFaeBirthEphemeraDocument() {
  let pages = CHAPTERS.flatMap((chapter) => pagesFromChapter(chapter));
  pages = padBookPagesEven(
    pages,
    `<div style="${BODY}"><p style="${ORNAMENT}">✦</p></div>`
  );

  const document = await buildEphemeraBookDocument({
    title: TITLE,
    pages,
    template: "old-book",
    bookLabels: {
      appearance: {
        coverColor: "#1e3a32",
        colorStrength: 48,
        gloss: 32,
        leather: 58,
        aging: 42,
      },
    },
    effects: { yellowing: 40, aging: 38, grain: 18, ink: 42, agingSeed: 529 },
  });

  document.pages = pages.map((src, i) => ({
    ...(document.pages[i] ?? { id: `page-${i + 1}`, ...emptyBlocks() }),
    title: src.title,
    flowContent: src.flowContent,
  }));
  return document;
}

export async function buildFaeBirthJournalDoc() {
  const document = await buildFaeBirthEphemeraDocument();
  return buildJournalEntryFromDocument({
    journalId: JOURNAL_ID,
    handoutPageId: HANDOUT_ID,
    title: TITLE,
    img: "icons/sundries/books/book-symbol-tree-brown.webp",
    source: "Birth of the Fae",
    document,
  });
}

export async function createFaeBirthEphemeraBook({ open = true } = {}) {
  const document = await buildFaeBirthEphemeraDocument();
  return createEphemeraBookInWorld({
    title: TITLE,
    document,
    source: "Birth of the Fae",
    open,
  });
}
