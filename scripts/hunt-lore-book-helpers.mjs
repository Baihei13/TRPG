/**
 * 猎杀怪物 lore 共用排版 / 建书辅助
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

export const BODY =
  "font-family:Georgia,'Songti SC',SimSun,serif;font-size:1.06rem;line-height:1.82;color:#1a120c;text-align:justify;";
export const HEAD =
  "margin:0 0 0.7rem;font-size:1.18rem;font-weight:700;letter-spacing:0.06em;color:#2a1408;border-bottom:1px solid rgba(60,35,20,0.35);padding-bottom:0.25rem;";
export const META =
  "margin:0 0 0.7rem;font-size:0.88rem;line-height:1.5;color:#5a4030;font-style:italic;";
export const PARA = "margin:0 0 0.75rem;line-height:1.82;text-align:justify;";
export const ORNAMENT =
  "margin:0 0 0.8rem;text-align:center;font-size:0.85rem;letter-spacing:0.35em;color:#6a4a30;opacity:0.85;";
export const PAGE_CHARS = 330;

export function parasHtml(list) {
  return list.map((p) => `<p style="${PARA}">${esc(p)}</p>`).join("");
}

export function bookPage(title, inner) {
  return {
    title,
    flowContent: `<div style="${BODY}"><p style="${ORNAMENT}">✦ &nbsp;—&nbsp; ✦</p>${inner}</div>`,
  };
}

export function sectionPages({ title, meta, paragraphs, maxChars = PAGE_CHARS }) {
  const chunks = chunkSegmentsByChars(
    paragraphs.map((text) => ({ kind: "p", text })),
    maxChars
  );
  return chunks.map((segs, i) => {
    const heading = i === 0 ? title : `${title}（续）`;
    const head =
      i === 0
        ? `<p style="${HEAD}">${esc(title)}</p>${
            meta ? `<p style="${META}">${esc(meta)}</p>` : ""
          }`
        : `<p style="${META}">${esc(heading)}</p>`;
    return bookPage(heading, `${head}${parasHtml(segs.map((s) => s.text))}`);
  });
}

export async function makeLoreBook({
  title,
  pages,
  coverColor,
  agingSeed,
  journalId,
  handoutId,
  img,
  source,
}) {
  const padded = padBookPagesEven(
    pages,
    `<div style="${BODY}"><p style="${ORNAMENT}">✦</p></div>`
  );
  const document = await buildEphemeraBookDocument({
    title,
    pages: padded,
    template: "old-book",
    bookLabels: {
      appearance: {
        coverColor,
        colorStrength: 46,
        gloss: 28,
        leather: 54,
        aging: 50,
      },
    },
    effects: { yellowing: 46, aging: 44, grain: 20, ink: 36, agingSeed },
  });
  document.pages = padded.map((src, i) => ({
    ...(document.pages[i] ?? { id: `page-${i + 1}`, ...emptyBlocks() }),
    title: src.title,
    flowContent: src.flowContent,
  }));
  return { document, journalId, handoutId, title, img, source };
}

export async function toJournalEntry(built) {
  return buildJournalEntryFromDocument({
    journalId: built.journalId,
    handoutPageId: built.handoutId,
    title: built.title,
    img: built.img,
    source: built.source,
    document: built.document,
  });
}

export async function createInWorld(built, { open = true } = {}) {
  return createEphemeraBookInWorld({
    title: built.title,
    document: built.document,
    source: built.source,
    open,
  });
}

export { buildEphemeraLetterDocument, buildJournalEntryFromDocument, createEphemeraBookInWorld, esc };
