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

  const docType = document?.type === "letter" ? "letter" : "book";

  let entry;
  const manager = eph.api?.manager;
  if (manager?.createDocument) {
    entry = await manager.createDocument(docType, {
      template: document.template ?? (docType === "letter" ? "classic-letter" : "old-book"),
      layoutMode: document.layoutMode ?? (docType === "book" ? "flow" : undefined),
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
    const handoutHtml = handoutHtmlFromDocument(document);
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
          "wang-pf2e-homebrew": { source, translated: "zh-CN", style: "ephemera-" + docType },
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

function handoutHtmlFromDocument(document) {
  if (document?.pages?.length) {
    return document.pages.map((p) => p.flowContent).filter(Boolean).join("<hr>");
  }
  const blocks = document?.textBlocks ?? [];
  const parts = blocks
    .map((b) => String(b.text ?? "").trim())
    .filter(Boolean)
    .map((t) => `<p>${esc(t).replace(/\n+/g, "</p><p>")}</p>`);
  return parts.join("") || `<p>${esc(document?.title ?? "")}</p>`;
}

/**
 * Ephemera 信件（单页，适合短文/回忆/便条）
 * @param {object} opts
 * @param {string} opts.title
 * @param {{date?:string,to?:string,body:string,signature?:string,ps?:string}} opts.fields
 * @param {string} [opts.template]
 * @param {object} [opts.effects]
 * @param {string[]} [opts.hideBlockIds] 隐藏的 block id 后缀，如 ['ps']
 */
export async function buildEphemeraLetterDocument(opts) {
  const {
    title,
    fields,
    template = "classic-letter",
    effects = { yellowing: 42, aging: 40, grain: 18, ink: 36, agingSeed: 88 },
    hideBlockIds = [],
  } = opts;

  const fieldMap = {
    date: fields.date ?? "",
    to: fields.to ?? "",
    body: fields.body ?? "",
    signature: fields.signature ?? "",
    ps: fields.ps ?? "",
  };

  try {
    stubFoundry();
    const url =
      "file:///C:/Users/王昊/AppData/Local/FoundryVTT/Data/modules/ephemera/scripts/template-data.js";
    const m = await import(url);
    let doc = m.createDefaultDocument("letter", { template });
    doc.title = title;
    doc.textBlocks = (doc.textBlocks ?? []).map((b) => {
      const key = String(b.id).split("-").pop();
      const text = fieldMap[key] ?? b.text ?? "";
      return { ...b, text, html: "" };
    });
    if (effects) doc.effects = { ...doc.effects, ...effects };
    const hide = new Set(
      hideBlockIds.flatMap((suffix) =>
        (doc.textBlocks ?? [])
          .filter((b) => String(b.id).endsWith(`-${suffix}`) || String(b.id) === suffix)
          .map((b) => b.id)
      )
    );
    if (hide.size) doc.hiddenBlocks = [...new Set([...(doc.hiddenBlocks ?? []), ...hide])];
    doc = m.normalizeEphemeraDocument(doc);
    doc.title = title;
    // normalize 可能清掉自定义 text，再写回
    doc.textBlocks = (doc.textBlocks ?? []).map((b) => {
      const key = String(b.id).split("-").pop();
      if (key in fieldMap) return { ...b, text: fieldMap[key], html: "" };
      return b;
    });
    if (hide.size) doc.hiddenBlocks = [...new Set([...(doc.hiddenBlocks ?? []), ...hide])];
    return doc;
  } catch (err) {
    console.warn("[ephemera-journal-util] letter normalize 失败，用后备结构", err);
    const now = Date.now();
    const prefix = template;
    return {
      version: 1,
      type: "letter",
      template,
      composition: "blocks",
      title,
      theme: "oldpage-newsprint",
      createdAt: now,
      updatedAt: now,
      data: {},
      paper: { width: 760, height: 980 },
      textBlocks: [
        { id: `${prefix}-date`, text: fieldMap.date, html: "" },
        { id: `${prefix}-to`, text: fieldMap.to, html: "" },
        { id: `${prefix}-body`, text: fieldMap.body, html: "" },
        { id: `${prefix}-signature`, text: fieldMap.signature, html: "" },
        { id: `${prefix}-ps`, text: fieldMap.ps, html: "" },
      ],
      ruleBlocks: [],
      imageBlocks: [],
      styles: {},
      layout: {},
      hiddenBlocks: hideBlockIds.map((s) => `${prefix}-${s}`),
      elementLayer: { strokes: [] },
      effects,
    };
  }
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
  const handoutHtml = handoutHtmlFromDocument(document);
  const style =
    document?.type === "letter" ? "ephemera-letter" : "ephemera-book";
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
      "wang-pf2e-homebrew": { source, translated: "zh-CN", style },
    },
  };
}
