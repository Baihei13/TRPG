/**
 * 猎杀对决 · 屠夫传说文献（Ephemera）
 * - 研究者见解（短书）
 * - 新奥尔良真新月报·剪报（剪报簿，与日记分开）
 * - 弗洛伦斯·弗兰克夫人访谈（信件/打字稿）
 * - 阿里尔·达诺伊的日记（酒红日记本）
 */

import {
  esc,
  emptyBlocks,
  chunkSegmentsByChars,
  padBookPagesEven,
  buildEphemeraBookDocument,
  buildEphemeraLetterDocument,
  buildJournalEntryFromDocument,
  createEphemeraBookInWorld,
} from "./ephemera-journal-util.mjs";

const SOURCE = "Hunt: Showdown — Butcher Lore";

const BODY =
  "font-family:Georgia,'Songti SC',SimSun,serif;font-size:1.1rem;line-height:1.88;color:#1a120c;text-align:justify;";
const HEAD =
  "margin:0 0 0.85rem;font-size:1.28rem;font-weight:700;letter-spacing:0.08em;color:#2a1408;border-bottom:1px solid rgba(60,35,20,0.35);padding-bottom:0.3rem;";
const META =
  "margin:0 0 0.85rem;font-size:0.92rem;line-height:1.55;color:#5a4030;font-style:italic;";
const PARA = "margin:0 0 0.85rem;line-height:1.88;text-align:justify;";
const ORNAMENT =
  "margin:0 0 0.9rem;text-align:center;font-size:0.9rem;letter-spacing:0.35em;color:#6a4a30;opacity:0.85;";
const CLIP_DATE =
  "margin:0 0 0.4rem;font-size:0.95rem;letter-spacing:0.12em;color:#3a2818;font-weight:700;";
const CLIP_HEAD =
  "margin:0 0 0.75rem;font-size:1.2rem;font-weight:800;letter-spacing:0.04em;color:#1a1008;line-height:1.35;";

const PAGE_CHARS = 360;

function parasHtml(list) {
  return list.map((p) => `<p style="${PARA}">${esc(p)}</p>`).join("");
}

function bookPage(title, inner, { ornament = true } = {}) {
  return {
    title,
    flowContent: `<div style="${BODY}">${
      ornament ? `<p style="${ORNAMENT}">✦ &nbsp;—&nbsp; ✦</p>` : ""
    }${inner}</div>`,
  };
}

/* -------------------------------------------------------------------------- */
/* 1) 研究者见解                                                                */
/* -------------------------------------------------------------------------- */

const RESEARCHER = {
  title: "研究者对屠夫的见解",
  journalId: "whbHuntButchRs01",
  handoutId: "whbHuntButchRsH1",
  subtitle: "（日期不详）",
  paragraphs: [
    "这份文献显然不可靠。当我们拼凑出真相时，不得不做出许多逻辑和信念上的推断。考虑到资料来源和记忆的主观性，出现前后矛盾之处并不令人意外。整体来看，这似乎合情合理，遵循着它自身的内在逻辑。尽管如此，就连我自己也难以相信我所发现的关于它在路易斯安那州首次出现的说法。",
    "那具巨大臃肿的躯体——显然是「肉头怪」的近亲——皮肉间夹杂着木头和金属碎片。一条皮围裙遮住了它骇人的躯干、猪头，以及——不知为何，这才是最让我难以置信的细节——一根燃烧的钩子。它能与火共存，耐高温——这很可能要归功于那条围裙——也耐钝击。它简直就是个「子弹海绵」，虽然更容易被撕裂攻击击杀，但我实在难以想象这些人究竟是如何杀死它的。当它被激怒时，行为会变得异常狂暴，那根钩子上会燃起火焰。我不敢想象。当人们转过黑暗的拐角，与这头看似不可能存在的野兽面对面，面对它空洞的眼神和燃烧的钩子时，那该是怎样一种感受？",
    "如果这些报道属实，那么这些被猎杀者称为「屠夫」的家伙，简直就是噩梦的化身。要么就是，流传下来的全是些天马行空的传说。时隔多年，我们真的能分辨真假吗？或许不能，但我还是忍不住要继续尝试，即便我永远无法确定真相。",
  ],
};

export async function buildButcherResearcherDocument() {
  const chunks = chunkSegmentsByChars(
    RESEARCHER.paragraphs.map((text) => ({ kind: "p", text })),
    340
  );
  let pages = chunks.map((segs, i) => {
    const title = i === 0 ? RESEARCHER.title : `${RESEARCHER.title}（续）`;
    const head =
      i === 0
        ? `<p style="${HEAD}">${esc(RESEARCHER.title)}</p><p style="${META}">${esc(
            RESEARCHER.subtitle
          )}</p>`
        : `<p style="${META}">${esc(title)}</p>`;
    return bookPage(title, `${head}${parasHtml(segs.map((s) => s.text))}`);
  });
  pages = padBookPagesEven(
    pages,
    `<div style="${BODY}"><p style="${ORNAMENT}">✦</p></div>`
  );
  const document = await buildEphemeraBookDocument({
    title: RESEARCHER.title,
    pages,
    template: "old-book",
    bookLabels: {
      appearance: {
        coverColor: "#3d2a1c",
        colorStrength: 44,
        gloss: 28,
        leather: 52,
        aging: 55,
      },
    },
    effects: { yellowing: 48, aging: 45, grain: 22, ink: 38, agingSeed: 713 },
  });
  document.pages = pages.map((src, i) => ({
    ...(document.pages[i] ?? { id: `page-${i + 1}`, ...emptyBlocks() }),
    title: src.title,
    flowContent: src.flowContent,
  }));
  return document;
}

export async function buildButcherResearcherJournalDoc() {
  return buildJournalEntryFromDocument({
    journalId: RESEARCHER.journalId,
    handoutPageId: RESEARCHER.handoutId,
    title: RESEARCHER.title,
    img: "icons/sundries/books/book-embossed-gold-red.webp",
    source: SOURCE,
    document: await buildButcherResearcherDocument(),
  });
}

export async function createButcherResearcherBook({ open = true } = {}) {
  return createEphemeraBookInWorld({
    title: RESEARCHER.title,
    document: await buildButcherResearcherDocument(),
    source: SOURCE,
    open,
  });
}

/* -------------------------------------------------------------------------- */
/* 2) 剪报簿（与日记分开）                                                       */
/* -------------------------------------------------------------------------- */

const CLIPPINGS = [
  {
    date: "1893年7月19日",
    headline: "一场难得的展览",
    body: [
      "或许您听说过动物标本制作这门艺术。虽然您可能不会把它列入人类已知的最高雅艺术之列，但它依然可以精雕细琢，技艺精湛。而沃尔特·波特（Walter Potter）这位在英国同行中颇有名气的艺术家，将这门艺术演绎得如此充满奇思妙想。本周六，波特的作品照片将在当地从业者阿里·达诺伊（Ari D'aunoy）的家中展出，门票仅需5美分。",
    ],
  },
  {
    date: "1893年9月22日",
    headline: "快来参观巴纳姆美国博物馆！",
    body: [
      "仅限一周，就在城里！这里展出各种奇特而美妙的独一无二的生物，保证让您惊叹不已，它们由科学家精心保存，旨在启发和教育大众。门票可在 A. D'aunoy 先生家中购买。",
    ],
  },
  {
    date: "1894年6月1日",
    headline: "你再也不用和罗孚说再见了！",
    body: [
      "如果您正为失去心爱的宠物而悲痛，不妨考虑一下 A. D'AUNOY 先生的服务。鸟类、犬类、兔子、松鼠和猫咪都可以被制成动物标本，永远陪伴着您。让它们成为您珍藏的美好回忆，也让您的客人眼前一亮！",
      "请在上午 11 点至下午 3 点之间到 D'aunoy 先生家进行咨询。",
    ],
  },
  {
    date: "1895年3月31日",
    headline: "准备履行他的职业职责",
    body: [
      "上周日，一群渔民在通往斯蒂尔沃特河口的路上发现了标本剥制师阿里尔·达诺伊先生的遗体。目前尚不清楚他为何会出现在那里，也不清楚他被发现时为何如此狼狈，仅能辨认出他的身份，只剩下一只做工粗糙的玻璃眼珠。如有读者了解达诺伊先生近几日的行踪，请于上午8点至10点之间联系警员。再次提醒大家，天黑后出行务必谨慎。",
    ],
  },
  {
    date: "1895年10月23日",
    headline: "保存完好",
    body: [
      "阿尔及尔大火烧毁了许多珍贵的物品。虽然我们的报道通常都比较严肃，但其中一则奇闻轶事却格外引人注目，值得刊登。一位消防员在清理一处房屋废墟时，发现了一批保存完好的奇特收藏：一群被制成动物标本的动物。这位古怪的收藏家如果知道标本制作师采取的防火措施取得了超乎想象的成功，一定会感到欣慰。",
    ],
  },
];

const CLIPPING_BOOK = {
  title: "新奥尔良真新月报·剪报",
  journalId: "whbHuntButchNp01",
  handoutId: "whbHuntButchNpH1",
};

function clippingFlow(clip, continuation = false) {
  const head = continuation
    ? `<p style="${META}">${esc(clip.headline)}（续）</p>`
    : `<p style="${CLIP_DATE}">${esc(clip.date)}</p><p style="${CLIP_HEAD}">${esc(
        clip.headline
      )}</p><p style="${META}">摘自《新奥尔良真新月报》　作者不详　新闻纸</p>`;
  return `<div style="${BODY}">${head}${parasHtml(clip.body)}</div>`;
}

export async function buildButcherClippingsDocument() {
  let pages = [];
  for (const clip of CLIPPINGS) {
    const chunks = chunkSegmentsByChars(
      clip.body.map((text) => ({ kind: "p", text })),
      300
    );
    chunks.forEach((segs, i) => {
      const body = segs.map((s) => s.text);
      const clipPage = { ...clip, body };
      pages.push({
        title: i === 0 ? `${clip.date} · ${clip.headline}` : `${clip.headline}（续）`,
        flowContent: clippingFlow(clipPage, i > 0),
      });
    });
  }
  pages = padBookPagesEven(
    pages,
    `<div style="${BODY}"><p style="${ORNAMENT}">✂</p></div>`
  );

  const document = await buildEphemeraBookDocument({
    title: CLIPPING_BOOK.title,
    pages,
    template: "old-book",
    bookLabels: {
      appearance: {
        coverColor: "#5a5040",
        colorStrength: 30,
        gloss: 18,
        leather: 25,
        aging: 62,
      },
    },
    effects: { yellowing: 62, aging: 55, grain: 28, ink: 30, agingSeed: 1893 },
  });
  document.theme = "oldpage-newsprint";
  document.pages = pages.map((src, i) => ({
    ...(document.pages[i] ?? { id: `page-${i + 1}`, ...emptyBlocks() }),
    title: src.title,
    flowContent: src.flowContent,
  }));
  return document;
}

export async function buildButcherClippingsJournalDoc() {
  return buildJournalEntryFromDocument({
    journalId: CLIPPING_BOOK.journalId,
    handoutPageId: CLIPPING_BOOK.handoutId,
    title: CLIPPING_BOOK.title,
    img: "icons/sundries/documents/document-newspaper.webp",
    source: SOURCE,
    document: await buildButcherClippingsDocument(),
  });
}

export async function createButcherClippingsBook({ open = true } = {}) {
  return createEphemeraBookInWorld({
    title: CLIPPING_BOOK.title,
    document: await buildButcherClippingsDocument(),
    source: SOURCE,
    open,
  });
}

/* -------------------------------------------------------------------------- */
/* 3) 访谈录（信件/打字稿）                                                      */
/* -------------------------------------------------------------------------- */

const INTERVIEW = {
  title: "弗洛伦斯·弗兰克夫人访谈录",
  journalId: "whbHuntButchIv01",
  handoutId: "whbHuntButchIvH1",
  date: "1895年4月2日",
  to: "新奥尔良警员（问题略）",
  body: `先生，恕我冒昧，但我确信是那个人把瘟疫带到了这座城镇，愿他安息。流感已经夺走了许多人的生命。我的儿子们也咳嗽了。但上帝已经惩罚了他。

现在我知道，仁慈的上帝规定动物体内没有灵魂。从这个意义上讲，这并没有错。但是，任何一个心智健全的人都不会选择这样的职业！我发誓绝不！

……

几年前，达诺伊先生搬进了我们隔壁的房子。作为好邻居，我向他转达了我们全家的问候。他邀请我参观他的店铺，因为他将在那里生活和工作。当他带我去看那些成排的兽皮时，我大吃一惊。一排排精致锋利的刀具，以及其他我从未见过的奇怪工具。我不知道它们是做什么用的，但从它们的样子来看，它们很可怕。锋利又可怕的东西。我甚至都不敢想它们。我立刻就对他产生了反感。

我一直以为动物标本都是像玩具熊那样用某种方法做成的。我不知道具体是怎么做的。但达诺伊先生兴奋地向我解释说，他先用黏土制作动物模型，然后把皮毛像外套一样套在上面！难怪上帝会用这种瘟疫诅咒我们。只有魔鬼才会做这种事，我敢肯定。

我和我丈夫明确表示不欢迎他，我们也鼓励邻居们这样做。这是我们作为基督徒应尽的责任。当然，我们家的汤米却很喜欢那个人。真是个傻瓜。我禁止他踏进我家门，但我确信他已经来过了，而且无论怎么教训他，都无济于事。

有一天，他就这么走了。听到他去世的消息，我真希望自己能说声遗憾，毕竟他被发现时的样子那么凄惨。但这都是上帝的旨意，你记住我的话。

——弗洛伦斯·弗兰克夫人
打字稿，8.5×11 英寸`,
};

export async function buildButcherInterviewDocument() {
  return buildEphemeraLetterDocument({
    title: INTERVIEW.title,
    template: "classic-letter",
    fields: {
      date: INTERVIEW.date,
      to: INTERVIEW.to,
      body: INTERVIEW.body,
      signature: "",
      ps: "",
    },
    effects: { yellowing: 40, aging: 35, grain: 16, ink: 28, agingSeed: 1895 },
  });
}

export async function buildButcherInterviewJournalDoc() {
  return buildJournalEntryFromDocument({
    journalId: INTERVIEW.journalId,
    handoutPageId: INTERVIEW.handoutId,
    title: INTERVIEW.title,
    img: "icons/sundries/documents/document-letter-sealed-brown.webp",
    source: SOURCE,
    document: await buildButcherInterviewDocument(),
  });
}

export async function createButcherInterviewLetter({ open = true } = {}) {
  return createEphemeraBookInWorld({
    title: INTERVIEW.title,
    document: await buildButcherInterviewDocument(),
    source: SOURCE,
    open,
  });
}

/* -------------------------------------------------------------------------- */
/* 4) 达诺伊日记                                                                */
/* -------------------------------------------------------------------------- */

const DIARY = {
  title: "阿里尔·达诺伊的日记",
  journalId: "whbHuntButchDy01",
  handoutId: "whbHuntButchDyH1",
  entries: [
    {
      title: "3月4日",
      paragraphs: [
        "我被迫逃离家园。流感蔓延到我们社区，我却成了替罪羊。我原以为更多人会理解我的职业，尤其是在那么多人来看过波特展览之后！我并不渴望死亡。我制作动物标本是为了欣赏它们！这是一种对生命的礼赞。我感到自己被深深地误解了，但我不得不苦笑。我和许多前辈伟大的艺术家有着同样的困境。虽然起初我技艺不精，作品并不尽如人意。我做眼睛总是失败，结果令人毛骨悚然。当我把克利夫兰的标本带回给格洛弗夫人时，她晕了过去，让我把标本拿走烧掉。从那以后，我制作眼睛的技艺有了很大的提高。她说的没错。克利夫兰的眼睛看起来呆滞而诡异。等到轮到我自己制作标本时，我的技艺已经突飞猛进。",
        "我希望几周后能回家，虽然这可能有点乐观。也许到那时，瘟疫已经夺走了我那些可怜邻居的生命。我离开的那天晚上，那三个男孩已经开始咳嗽了。如果他们的遭遇可以作为这种疾病发展趋势的参考，那么他们的母亲在他们死后不久也会去世。想到他们是如何让我曾经视为朋友的人与我反目成仇的，我的思绪变得阴郁起来。也许我应该回去把那三个男孩做成标本。那样就能让那个落魄的女人见识到我的巧手了。可是，我这是在说什么呢？我连动物都没杀过。我能保存一个人类的孩子吗？我想不能。",
      ],
    },
    {
      title: "3月5日",
      paragraphs: [
        "这栋建筑以前是个屠宰场，让我想起了家。一个房间里挂着几具猪的尸体——虽然这里似乎已经废弃很久了——而且还有很多木材，我可以做些晾皮架。我得找点事做，才能打发在这里避难的时间，所以我打算专心做些动物标本。为了养活自己，我必须克服对狩猎的厌恶，而且我计划把所有注定要由我亲手宰杀的动物都做成标本。我在一间带结实门的小房间里安顿了下来，在另一间房间里，我摆放了从家里带来的工具。",
        "在探索其他房间的过程中，我发现了一些证据，表明这里曾经住着一个有着类似癖好，甚至更加残忍的人。我希望不会遇到他，不过正如我所说，这里似乎已经空置了一段时间。",
        "明天我会搭几个架子，先把之前提到的猪胴体的皮晒干，也许还会处理一个猪头以备将来使用。至少，这会是一次很好的练习。",
      ],
    },
    {
      title: "3月9日",
      paragraphs: [
        "过去两天的事件或许具有重要的历史意义。虽然我写下这些文字时手都在颤抖，但我仍想在记忆的偏差和臆想扭曲事实之前，将真相记录下来。如果你正在阅读这篇文章，请相信我，这绝非夸大其词或捏造事实。这个故事是真实的。",
        "我当时正在散步。我的枪法实在不敢恭维，狩猎技术也差强人意，所以不得不把大部分时间都花在这里猎取一些小猎物来充饥。散步时，我发现了一具巨大的尸体，超过六英尺高，至少有350磅重。它的肉质柔软、粉状，颜色苍白，肩部有一窝水蛭，虽然已经死了，但显然不是后来添加的，而是身体的一部分。我从未见过这样的东西，无论是动物还是人。而且这东西没有头！不是被砍掉的头——而是一具自然形成的、没有头的尸体。",
        "眼前的景象让我震惊不已，但也让我兴奋不已。一个念头立刻在我脑海中形成——我可以把这具精美的标本保存下来，卖给马戏团（或者——我敢奢望吗？——沃德百货公司？），然后发大财！独自搬运这具尸体费了不少力气，但我找到绳子，慢慢地把它吊到一辆小车上，然后推回我的临时办公室。门足够大，可以直接推进实验室。我立刻剥了皮。",
        "它的器官形状和材质我都从未见过。它的皮肤比看起来更厚更硬，或许像大象的皮。水蛭应该很容易保存——它们有坚硬的甲壳，形状也简单，很容易用黏土模仿。但制作这种生物就比较困难了。我已经开始制作业余作品，目前为止对自己的作品还算满意。由于不需要取出大脑和眼睛，这比制作最小的狗还要容易得多。这次制作眼睛完全没有问题！",
      ],
    },
    {
      title: "3月11日",
      paragraphs: [
        "皮肤还在晾干。有些焦躁不安，于是进城喝了点东西。消息很糟糕。由于疫情恶化，他们现在称之为瘟疫。许多人已经死亡，街上到处都是尸体。我最好还是尽可能待在这里，避开病人。",
      ],
    },
    {
      title: "3月17日",
      paragraphs: [
        "皮肤终于干了，今天早上我把它套在了骨架上。我找到一大卷铁丝，应该能支撑起形状，但它太笨重了，我不得不把身体固定在几根树枝上才能让它直立起来。由于没有更现代的材料，我只能想办法凑合。它看起来非常吓人。我确信它能卖个好价钱。",
      ],
    },
    {
      title: "3月18日",
      paragraphs: [
        "它居然撑过了一夜！昨天天气很暖和，我担心高温会加速它的变形。不过，它现在很稳定。我用皮围裙把尸体裹起来，确保它在凝固过程中不会散开，也为了遮住我惊慌失措地为了检查内部而匆忙划开的口子。",
        "这里住起来很凄凉，但作为工作室却还不错。我在储藏室里发现了一大堆腌肉。起初味道很刺鼻，但工作时它们正好能填饱我的肚子。我感觉比以往任何时候都更加乐观。能来到这里纯属运气，这位先生肯定会成就我的事业。夜里会传来可怕的噪音，但不知怎的，我还是睡着了。",
      ],
    },
    {
      title: "3月19日",
      paragraphs: [
        "这怪物没有头，实在太吓人了。也许听起来很傻——它可是个怪物！——但我还是决定把一个猪头安到它身上，让它看起来更完整，而且实验成功了。这东西看起来更恐怖了。现在得想想回去的时候怎么把它运进城里。今晚有暴风雨，我房间的天花板塌了一部分。如果雷声不吵得我睡不着，今晚就睡在工作室里吧。",
      ],
    },
  ],
};

function diaryEntryPages(entry) {
  const chunks = chunkSegmentsByChars(
    entry.paragraphs.map((text) => ({ kind: "p", text })),
    PAGE_CHARS
  );
  return chunks.map((segs, i) => {
    const title = i === 0 ? entry.title : `${entry.title}（续）`;
    const head =
      i === 0
        ? `<p style="${HEAD}">${esc(entry.title)}</p>`
        : `<p style="${META}">${esc(title)}</p>`;
    return bookPage(title, `${head}${parasHtml(segs.map((s) => s.text))}`);
  });
}

export async function buildButcherDiaryDocument() {
  let pages = [
    bookPage(
      "扉页",
      `<p style="${HEAD}">${esc(DIARY.title)}</p><p style="${META}">字迹潦草　酒红色装订　约 4.9 × 6.9 英寸</p><p style="${PARA}">阿里尔·达诺伊（Ariel D'aunoy）——标本剥制师。以下为其避难期间所记。</p>`
    ),
    ...DIARY.entries.flatMap((e) => diaryEntryPages(e)),
  ];
  pages = padBookPagesEven(
    pages,
    `<div style="${BODY}"><p style="${ORNAMENT}">✦</p></div>`
  );

  const document = await buildEphemeraBookDocument({
    title: DIARY.title,
    pages,
    template: "old-book",
    bookLabels: {
      appearance: {
        coverColor: "#6b1e2a",
        colorStrength: 52,
        gloss: 30,
        leather: 60,
        aging: 48,
      },
    },
    effects: { yellowing: 44, aging: 48, grain: 20, ink: 42, agingSeed: 304 },
  });
  document.pages = pages.map((src, i) => ({
    ...(document.pages[i] ?? { id: `page-${i + 1}`, ...emptyBlocks() }),
    title: src.title,
    flowContent: src.flowContent,
  }));
  return document;
}

export async function buildButcherDiaryJournalDoc() {
  return buildJournalEntryFromDocument({
    journalId: DIARY.journalId,
    handoutPageId: DIARY.handoutId,
    title: DIARY.title,
    img: "icons/sundries/books/book-worn-brown.webp",
    source: SOURCE,
    document: await buildButcherDiaryDocument(),
  });
}

export async function createButcherDiaryBook({ open = true } = {}) {
  return createEphemeraBookInWorld({
    title: DIARY.title,
    document: await buildButcherDiaryDocument(),
    source: SOURCE,
    open,
  });
}

/** 世界内一次性创建全部四份 */
export async function createAllButcherLoreBooks({ open = false } = {}) {
  const created = [];
  created.push(await createButcherResearcherBook({ open }));
  created.push(await createButcherClippingsBook({ open }));
  created.push(await createButcherInterviewLetter({ open }));
  created.push(await createButcherDiaryBook({ open: true }));
  return created;
}
