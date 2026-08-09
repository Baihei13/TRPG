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
 * Ephemera 信件（单页 lore）
 * 署名并入正文，隐藏 to/signature/ps，拉高正文框，避免叠字。
 */
export async function buildEphemeraLetterDocument(opts) {
  const {
    title,
    fields,
    template = "classic-letter",
    effects = { yellowing: 42, aging: 40, grain: 18, ink: 36, agingSeed: 88 },
    hideBlockIds = [],
    mergeSignatureIntoBody = true,
  } = opts;

  const date = String(fields.date ?? "").trim();
  const to = String(fields.to ?? "").trim();
  const ps = String(fields.ps ?? "").trim();
  const signature = String(fields.signature ?? "").trim();
  let body = String(fields.body ?? "").trim();

  const placeholderTo = !to || /^[—\-–~\s]+$/.test(to);
  if (mergeSignatureIntoBody && signature) {
    body = `${body}\n\n——${signature}`;
  }

  const fieldMap = {
    date,
    to: placeholderTo ? "" : to,
    body,
    signature: mergeSignatureIntoBody ? "" : signature,
    ps,
  };

  const autoHide = new Set(hideBlockIds);
  if (placeholderTo || !fieldMap.to) autoHide.add("to");
  if (!fieldMap.signature) autoHide.add("signature");
  if (!fieldMap.ps) autoHide.add("ps");

  const bodyLen = [...body].length;
  let paperH = 980;
  let bodyH = 500;
  let fontSize = 17;
  if (bodyLen > 180) {
    paperH = 1100;
    bodyH = 640;
    fontSize = 16;
  }
  if (bodyLen > 380) {
    paperH = 1320;
    bodyH = 900;
    fontSize = 15;
  }
  if (bodyLen > 550) {
    paperH = 1480;
    bodyH = 1050;
    fontSize = 14;
  }
  const bodyY = autoHide.has("to") ? 155 : 205;
  const layoutPatch = {
    [`customText-${template}-date`]: { width: 240, height: 32, x: 400, y: 96 },
    [`customText-${template}-to`]: { width: 540, height: 32, x: 80, y: 150 },
    [`customText-${template}-body`]: {
      width: 560,
      height: bodyH,
      x: 80,
      y: bodyY,
    },
    [`customText-${template}-signature`]: {
      width: 260,
      height: 70,
      x: 360,
      y: Math.min(bodyY + bodyH + 12, paperH - 140),
    },
    [`customText-${template}-ps`]: {
      width: 560,
      height: 50,
      x: 80,
      y: paperH - 90,
    },
    [`customRule-${template}-bottom`]: {
      width: 570,
      height: 8,
      x: 75,
      y: paperH - 70,
    },
  };

  const stylePatch = {
    [`textBlocks.${template}-date`]: {
      fontSize: 15,
      fontWeight: 400,
      fontFamily: "",
      italic: false,
      color: "",
      textAlign: "right",
    },
    [`textBlocks.${template}-body`]: {
      fontSize,
      fontWeight: 400,
      fontFamily: "EB Garamond",
      italic: false,
      color: "",
      textAlign: "left",
    },
  };

  const resolveHideIds = (blocks) =>
    new Set(
      [...autoHide].flatMap((suffix) =>
        (blocks ?? [])
          .filter((b) => String(b.id).endsWith(`-${suffix}`) || String(b.id) === suffix)
          .map((b) => b.id)
      )
    );

  try {
    stubFoundry();
    const url =
      "file:///C:/Users/王昊/AppData/Local/FoundryVTT/Data/modules/ephemera/scripts/template-data.js";
    const m = await import(url);
    let doc = m.createDefaultDocument("letter", { template });
    doc.title = title;
    doc.paper = { ...(doc.paper ?? {}), width: 720, height: paperH };
    doc.textBlocks = (doc.textBlocks ?? []).map((b) => {
      const key = String(b.id).split("-").pop();
      return { ...b, text: fieldMap[key] ?? "", html: "" };
    });
    if (effects) doc.effects = { ...doc.effects, ...effects };
    doc.layout = { ...(doc.layout ?? {}), ...layoutPatch };
    doc.styles = { ...(doc.styles ?? {}), ...stylePatch };
    let hide = resolveHideIds(doc.textBlocks);
    doc.hiddenBlocks = [...new Set([...(doc.hiddenBlocks ?? []), ...hide])];
    doc = m.normalizeEphemeraDocument(doc);
    doc.title = title;
    doc.paper = { ...(doc.paper ?? {}), width: 720, height: paperH };
    doc.textBlocks = (doc.textBlocks ?? []).map((b) => {
      const key = String(b.id).split("-").pop();
      if (key in fieldMap) return { ...b, text: fieldMap[key], html: "" };
      return b;
    });
    doc.layout = { ...(doc.layout ?? {}), ...layoutPatch };
    doc.styles = { ...(doc.styles ?? {}), ...stylePatch };
    hide = resolveHideIds(doc.textBlocks);
    doc.hiddenBlocks = [...new Set([...(doc.hiddenBlocks ?? []), ...hide])];
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
      paper: { width: 720, height: paperH },
      textBlocks: [
        { id: `${prefix}-date`, text: fieldMap.date, html: "" },
        { id: `${prefix}-to`, text: fieldMap.to, html: "" },
        { id: `${prefix}-body`, text: fieldMap.body, html: "" },
        { id: `${prefix}-signature`, text: fieldMap.signature, html: "" },
        { id: `${prefix}-ps`, text: fieldMap.ps, html: "" },
      ],
      ruleBlocks: [],
      imageBlocks: [],
      styles: stylePatch,
      layout: layoutPatch,
      hiddenBlocks: [...autoHide].map((s) => `${prefix}-${s}`),
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
