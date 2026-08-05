/**
 * Ephemera 原生日志：共用构建 / 运行时创建
 */

export function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function emptyBlocks() {
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

function stubFoundry() {
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
}

/**
 * @param {object} opts
 * @param {string} opts.title
 * @param {Array<{title:string, flowContent:string}>} opts.pages
 * @param {object} [opts.bookLabels]
 * @param {object} [opts.effects]
 * @param {string} [opts.template]
 */
export async function buildEphemeraBookDocument(opts) {
  const {
    title,
    pages,
    template = "old-book",
    bookLabels = {},
    effects = { yellowing: 50, aging: 35, grain: 20, ink: 35, agingSeed: 101 },
  } = opts;

  const buildPages = () =>
    pages.map((p, i) => ({
      id: `page-${i + 1}`,
      title: p.title,
      ...emptyBlocks(),
      flowContent: p.flowContent,
    }));

  try {
    stubFoundry();
    const url =
      "file:///C:/Users/王昊/AppData/Local/FoundryVTT/Data/modules/ephemera/scripts/template-data.js";
    const m = await import(url);
    let doc = m.createDefaultDocument("book", { template, layoutMode: "flow" });
    doc.title = title;
    doc.bookLabels = {
      ...doc.bookLabels,
      cover: title,
      spine: title,
      ...bookLabels,
      appearance: {
        ...(doc.bookLabels?.appearance ?? {}),
        ...(bookLabels.appearance ?? {}),
      },
    };
    doc.pages = buildPages();
    doc.flowContent = doc.pages[0]?.flowContent ?? "";
    doc.currentPageIndex = 0;
    if (effects) doc.effects = { ...doc.effects, ...effects };
    doc = m.normalizeEphemeraDocument(doc);
    doc.title = title;
    doc.bookLabels.cover = title;
    doc.bookLabels.spine = title;
    return doc;
  } catch (err) {
    console.warn("[ephemera-journal-util] normalize 失败，用后备结构", err);
    const now = Date.now();
    const built = buildPages();
    return {
      version: 1,
      type: "book",
      template,
      composition: "blocks",
      title,
      theme: "oldpage-newsprint",
      createdAt: now,
      updatedAt: now,
      data: {},
      paper: { width: 760, height: 980 },
      ...emptyBlocks(),
      bookLabels: {
        cover: title,
        spine: title,
        backCover: "",
        backSpine: "",
        appearance: {
          coverColor: "#5c3a24",
          colorStrength: 40,
          gloss: 40,
          leather: 55,
          aging: 45,
          ...(bookLabels.appearance ?? {}),
        },
        appearances: {},
        areas: [],
      },
      effects,
      layoutMode: "flow",
      flowContent: built[0]?.flowContent ?? "",
      currentPageIndex: 0,
      pages: built,
    };
  }
}

/**
 * @param {object} opts
 * @param {string} opts.title
 * @param {object} opts.document
 * @param {string} opts.source
 * @param {boolean} [opts.open]
 */
export async function createEphemeraBookInWorld({ title, document, source, open = true }) {
  if (typeof game === "undefined") throw new Error("只能在 Foundry 世界内调用");

  const eph = game.modules.get("ephemera");
  if (!eph?.active) throw new Error("请先启用 Ephemera 模块");

  let entry;
  const manager = eph.api?.manager;
  if (manager?.createDocument) {
    entry = await manager.createDocument("book", {
      template: document.template ?? "old-book",
      layoutMode: "flow",
    });
    const journal = entry?.documentName === "JournalEntry" ? entry : entry;
    if (manager.saveDocument) {
      await manager.saveDocument(journal, document);
      entry = journal;
    } else if (journal?.setFlag) {
      await journal.update({ name: title });
      await journal.setFlag("ephemera", "document", document);
      entry = journal;
    }
  }

  if (!entry) {
    const format = CONST.JOURNAL_ENTRY_PAGE_FORMATS?.HTML ?? 1;
    const handoutHtml = document.pages.map((p) => p.flowContent).join("<hr>");
    entry = await JournalEntry.create(
      {
        name: title,
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
          "wang-pf2e-homebrew": { source, translated: "zh-CN", style: "ephemera-book" },
        },
      },
      { renderSheet: false }
    );
  } else {
    await entry.update({ name: title });
    await entry.setFlag("ephemera", "document", document);
  }

  if (open) {
    const ViewApp = eph.api?.ViewApp;
    if (ViewApp) new ViewApp(entry).render(true);
    else if (eph.api?.openView) eph.api.openView(entry);
    else entry.sheet?.render?.(true);
  }

  return entry;
}

/**
 * @param {object} opts
 * @param {string} opts.journalId
 * @param {string} opts.handoutPageId
 * @param {string} opts.title
 * @param {string} opts.img
 * @param {string} opts.source
 * @param {object} opts.document
 */
export function buildJournalEntryFromDocument({
  journalId,
  handoutPageId,
  title,
  img,
  source,
  document,
}) {
  const handoutHtml = document.pages.map((p) => p.flowContent).filter(Boolean).join("<hr>");
  return {
    _id: journalId,
    name: title,
    img,
    pages: [
      {
        _id: handoutPageId,
        name: "讲义",
        type: "text",
        title: { show: false, level: 1 },
        image: {},
        text: { format: 1, content: handoutHtml || `<p>${esc(title)}</p>` },
        video: { controls: true, loop: false, autoplay: false, volume: 0.5 },
        src: null,
        system: {},
        sort: 0,
        ownership: { default: -1 },
        flags: { ephemera: { renderedPage: true } },
      },
    ],
    folder: null,
    sort: 100,
    ownership: { default: 0 },
    flags: {
      ephemera: { document },
      "wang-pf2e-homebrew": { source, translated: "zh-CN", style: "ephemera-book" },
    },
  };
}
