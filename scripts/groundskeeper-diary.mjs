/**
 * 《园丁日记》— 用 Ephemera 的 createDefaultDocument + normalize 生成原生书。
 * 合集条目 / 运行时创建共用同一结构。
 */

const TITLE = "园丁日记";

const ENTRIES = [
  {
    title: "乌拉月 8 日",
    paragraphs: [
      "最让我受不了的，是那些尖叫。这不该是医院吗？哪有医院会有这种鬼哭狼嚎。",
      "可我什么都不能说。我有份差事。比多数人强，而我家里比多数人更需要这份工。只管低着头，把庭院收拾干净。别的什么都别多管。",
    ],
  },
  {
    title: "雷朱尔月 18 日",
    paragraphs: [
      "今天在楼附近打理庭院，听见里头在搞什么「团体治疗」。要我说全是胡扯。一半的病人药吃得神志不清，根本不知道发生了什么。医生就一个劲儿问他们有没有副作用之类的。看不出这有什么用。依我看，不过是喂他们吃药、做做笔记罢了。",
      "可我什么都不能说。不想丢饭碗，更怕惹出更大的麻烦。",
      "反正我也不是大夫。我只懂自己日子里见到的那些。谁知道呢？兴许药也能帮上我女儿。可她又没伤害过谁，而且她得到的照料，比这诸神遗弃的地方里谁都多。",
    ],
  },
  {
    title: "布里吉尔月 10 日",
    paragraphs: [
      "园子里的灯又暗了。我总算弄明白那是什么意思——为什么那会儿总有人喊。里头干的简直就是折磨。他们说不能放人出去，因为会伤人。可他们在里头又在干什么？",
      "那些也是人啊。那也是在害人。",
    ],
  },
  {
    title: "塔瓦德月 1 日",
    paragraphs: [
      "今天新收进来一个病人，跟我女儿没什么两样。说话不利索。怪声、吠叫之类的。手停不下来。那不算病，只是不一样。那病人是人家的孩子。",
      "我寻思，是谁把他送进来的——是声称会照顾他的社会，还是声称爱他的家人？",
    ],
  },
  {
    title: "诺瓦齐斯月 22 日",
    paragraphs: [
      "今天在园子里碰上了莫罗医生。她从我身边走过，像我根本不存在一样。要我说，这也算这差事的好处之一。没人会注意到园丁。",
      "这样更好。我最不想的就是莫罗医生盯上我的活儿，或者我家的日子。",
    ],
  },
  {
    title: "罗玛月 2 日",
    paragraphs: [
      "昨天有人到家里来过——疯人院那边的人。他们什么也没找到，可着实吓死人了。我女儿发作的时候我都会请事假。他们是不是察觉了？不然凭什么关心我干了什么？",
      "我绝不会失去她，这话我说定了。我女儿啊，或许这辈子都过不上你们所谓的正常生活，可在我还能撑着的时候，我他妈一定要给她最好的日子。她绝不会住进这座恐怖屋。他们敢来抢，我就跟他们拼到底。",
      "或许，这就是我一直守在这么近的地方的缘故。",
    ],
  },
];

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function flowHtml(entry) {
  return `<p><strong>${esc(entry.title)}</strong></p>${entry.paragraphs
    .map((p) => `<p>${esc(p)}</p>`)
    .join("")}`;
}

function emptyBlocks() {
  return {
    textBlocks: [],
    ruleBlocks: [],
    imageBlocks: [],
    styles: {},
    layout: {},
    hiddenBlocks: [],
    elementLayer: { strokes: [] },
  };
}

function buildPages() {
  return ENTRIES.map((entry, i) => ({
    id: `page-${i + 1}`,
    title: entry.title,
    ...emptyBlocks(),
    flowContent: flowHtml(entry),
  }));
}

/**
 * 离线：动态加载 Ephemera 的 createDefaultDocument / normalizeEphemeraDocument
 */
async function buildViaEphemeraModule() {
  const stubFoundry = () => {
    if (globalThis.foundry?.utils?.randomID) return;
    globalThis.foundry = {
      utils: {
        mergeObject: Object.assign,
        duplicate: (x) => structuredClone(x),
        deepClone: (x) => structuredClone(x),
        randomID: (n = 16) =>
          Array.from({ length: n }, () =>
            "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]
          ).join(""),
        expandObject: (o) => o,
        flattenObject: (o) => o,
        isEmpty: (o) => !o || !Object.keys(o).length,
        getProperty: (o, p) => p.split(".").reduce((a, k) => a?.[k], o),
        setProperty() {},
      },
    };
    globalThis.game ??= { i18n: { localize: (k) => k, format: (k) => k } };
  };

  stubFoundry();
  const url =
    "file:///C:/Users/王昊/AppData/Local/FoundryVTT/Data/modules/ephemera/scripts/template-data.js";
  const m = await import(url);
  let doc = m.createDefaultDocument("book", {
    template: "old-book",
    layoutMode: "flow",
  });
  doc.title = TITLE;
  doc.bookLabels = {
    ...doc.bookLabels,
    cover: TITLE,
    spine: TITLE,
    appearance: {
      ...(doc.bookLabels?.appearance ?? {}),
      coverColor: "#5c3a24",
      colorStrength: 40,
      gloss: 40,
      leather: 55,
      aging: 45,
    },
  };
  doc.pages = buildPages();
  doc.flowContent = doc.pages[0]?.flowContent ?? "";
  doc.currentPageIndex = 0;
  doc = m.normalizeEphemeraDocument(doc);
  doc.title = TITLE;
  doc.bookLabels.cover = TITLE;
  doc.bookLabels.spine = TITLE;
  return doc;
}

/** 无 Ephemera 模块文件时的后备结构（仍含 composition） */
function buildFallbackDocument() {
  const now = Date.now();
  const pages = buildPages();
  return {
    version: 1,
    type: "book",
    template: "old-book",
    composition: "blocks",
    title: TITLE,
    theme: "oldpage-newsprint",
    createdAt: now,
    updatedAt: now,
    data: {},
    paper: { width: 760, height: 980 },
    ...emptyBlocks(),
    bookLabels: {
      cover: TITLE,
      spine: TITLE,
      backCover: "",
      backSpine: "",
      appearance: {
        coverColor: "#5c3a24",
        colorStrength: 40,
        gloss: 40,
        leather: 55,
        aging: 45,
      },
      appearances: {},
      areas: [],
    },
    effects: {
      yellowing: 50,
      aging: 35,
      grain: 20,
      ink: 35,
      agingSeed: 101,
    },
    layoutMode: "flow",
    flowContent: pages[0]?.flowContent ?? "",
    currentPageIndex: 0,
    pages,
  };
}

export async function buildEphemeraDocument() {
  try {
    return await buildViaEphemeraModule();
  } catch (err) {
    console.warn("[groundskeeper-diary] Ephemera normalize 失败，用后备结构", err);
    return buildFallbackDocument();
  }
}

export async function buildGroundskeeperJournalDoc() {
  const document = await buildEphemeraDocument();
  const handoutHtml = document.pages.map((p) => p.flowContent).filter(Boolean).join("<hr>");

  return {
    _id: "whbGrndJrnl00001",
    name: TITLE,
    img: "icons/sundries/books/book-embossed-bound-brown.webp",
    pages: [
      {
        _id: "whbGrndJrnlHan01",
        name: "讲义",
        type: "text",
        title: { show: false, level: 1 },
        image: {},
        text: { format: 1, content: handoutHtml || `<p>${TITLE}</p>` },
        video: { controls: true, loop: false, autoplay: false, volume: 0.5 },
        src: null,
        system: {},
        sort: 0,
        ownership: { default: -1 },
        flags: { ephemera: { renderedPage: true } },
      },
    ],
    folder: null,
    sort: 0,
    ownership: { default: 0 },
    flags: {
      ephemera: { document },
      "wang-pf2e-homebrew": {
        source: "Groundskeeper's Journal",
        translated: "zh-CN",
        style: "ephemera-book",
      },
    },
  };
}

/**
 * 运行时：优先走 Ephemera manager.createDocument，再写入正文并打开 ViewApp。
 * @returns {Promise<JournalEntry>}
 */
export async function createGroundskeeperEphemeraBook({ open = true } = {}) {
  if (typeof game === "undefined") {
    throw new Error("只能在 Foundry 世界内调用");
  }

  const eph = game.modules.get("ephemera");
  if (!eph?.active) {
    throw new Error("请先启用 Ephemera 模块");
  }

  const document = await buildEphemeraDocument();
  let entry;

  const manager = eph.api?.manager;
  if (manager?.createDocument) {
    entry = await manager.createDocument("book", {
      template: "old-book",
      layoutMode: "flow",
    });
    // createDocument 返回的可能是 JournalEntry
    const journal = entry?.documentName === "JournalEntry" ? entry : entry;
    if (manager.saveDocument) {
      await manager.saveDocument(journal, document);
      entry = journal;
    } else if (journal?.setFlag) {
      await journal.update({ name: TITLE });
      await journal.setFlag("ephemera", "document", document);
      entry = journal;
    }
  }

  if (!entry) {
    const format = CONST.JOURNAL_ENTRY_PAGE_FORMATS?.HTML ?? 1;
    const handoutHtml = document.pages.map((p) => p.flowContent).join("<hr>");
    entry = await JournalEntry.create(
      {
        name: TITLE,
        pages: [
          {
            name: "讲义",
            type: "text",
            title: { show: false, level: 1 },
            text: { content: handoutHtml, format },
            flags: { ephemera: { renderedPage: true } },
          },
        ],
        flags: {
          ephemera: { document },
          "wang-pf2e-homebrew": {
            source: "Groundskeeper's Journal",
            translated: "zh-CN",
            style: "ephemera-book",
          },
        },
      },
      { renderSheet: false }
    );
  } else {
    await entry.update({ name: TITLE });
    await entry.setFlag("ephemera", "document", document);
  }

  if (open) {
    const ViewApp = eph.api?.ViewApp;
    if (ViewApp) {
      new ViewApp(entry).render(true);
    } else if (eph.api?.openView) {
      eph.api.openView(entry);
    } else {
      entry.sheet?.render?.(true);
    }
  }

  return entry;
}
