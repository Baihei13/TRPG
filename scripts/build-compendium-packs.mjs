/**
 * 将 src/packs/*.json 写入 Foundry LevelDB 合集（修复 fvtt-cli 空库问题）。
 * 用法：node scripts/build-compendium-packs.mjs
 */
import { ClassicLevel } from "classic-level";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODULE_ROOT = path.resolve(__dirname, "..");

const PACKS = [
  {
    name: "homebrew-items",
    docType: "items",
    src: path.join(MODULE_ROOT, "src", "packs", "homebrew-items"),
    foldersFile: "_folders.json",
  },
  {
    name: "mocai",
    docType: "items",
    src: path.join(MODULE_ROOT, "src", "packs", "mocai"),
  },
  {
    name: "homebrew-actors",
    docType: "actors",
    src: path.join(MODULE_ROOT, "src", "packs", "homebrew-actors"),
    foldersFile: "_folders.json",
  },
  {
    name: "homebrew-macros",
    docType: "macros",
    src: path.join(MODULE_ROOT, "src", "packs", "homebrew-macros"),
    foldersFile: "_folders.json",
  },
  {
    name: "homebrew-journals",
    docType: "journal",
    src: path.join(MODULE_ROOT, "src", "packs", "homebrew-journals"),
    foldersFile: "_folders.json",
  },
];

const STALE_KEYS = {
  "homebrew-items": [
    "!items!whbemperorsring01",
    "!items!whbemperorcoc01",
    "!items!whbemperorrevcp01",
    "!items!whbsilveramulet01",
    "!items!whbJiuliPrA00001",
    "!items!whbJiuliPrE00001",
    "!items!whbJiuliEnA00001",
    "!items!whbJiuliEnE00001",
    "!folders!whbfolderRemItm01",
  ],
  "homebrew-actors": [
    "!actors!whbmafthug0001",
    "!actors!whbmafelite001",
    "!actors!whbmafshota01",
    "!actors!whbmafvet0001",
    "!actors!whbleonardo001",
    "!actors!whbantonio001",
    "!actors!whbromiana001",
    "!actors!whbmedium0001",
    "!actors!whbconti00001",
    "!actors!whbbyakhee001",
    "!actors!whbeaterseed1",
  ],
};

function rimraf(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) rimraf(p);
    else fs.unlinkSync(p);
  }
  fs.rmdirSync(dir);
}

function tryRimraf(dir) {
  try {
    rimraf(dir);
    return true;
  } catch (err) {
    if (err.code === "EBUSY" || err.code === "EPERM") {
      console.warn(`无法清空 ${dir}（Foundry 可能正在占用），改为增量更新…`);
      return false;
    }
    throw err;
  }
}

function normalizeActorItem(item) {
  const copy = structuredClone(item);
  if (copy.type === "melee") {
    copy.system ??= {};
    copy.system.attack ??= { value: "" };
    copy.system.attackEffects ??= { custom: "", value: [] };
    if (!("custom" in copy.system.attackEffects)) {
      copy.system.attackEffects.custom = "";
    }
  }
  return copy;
}

/** PF2e v14 Actor 合集：内嵌 items 须拆为 !actors.items!{actorId}.{itemId} */
async function writeActorDocument(db, doc) {
  const actor = structuredClone(doc);
  const embedded = Array.isArray(actor.items) ? actor.items : [];
  let subCount = 0;

  if (embedded.length > 0 && typeof embedded[0] === "object") {
    const itemIds = [];
    for (const raw of embedded) {
      const item = normalizeActorItem(raw);
      if (!item._id) {
        throw new Error(`[${actor.name}] 有条目缺少 _id`);
      }
      if (!/^[a-zA-Z0-9]{16}$/.test(item._id)) {
        throw new Error(
          `[${actor.name}] 条目「${item.name}」_id "${item._id}" 无效（须 16 位字母数字）`
        );
      }
      itemIds.push(item._id);
      await db.put(`!actors.items!${actor._id}.${item._id}`, item);
      subCount++;
    }
    actor.items = itemIds;
  }

  await db.put(`!actors!${actor._id}`, actor);
  return 1 + subCount;
}

/** JournalEntry：内嵌 pages 须拆为 !journal.pages!{journalId}.{pageId} */
async function writeJournalDocument(db, doc) {
  const journal = structuredClone(doc);
  const embedded = Array.isArray(journal.pages) ? journal.pages : [];
  let subCount = 0;

  if (embedded.length > 0 && typeof embedded[0] === "object") {
    const pageIds = [];
    for (const page of embedded) {
      if (!page._id) {
        throw new Error(`[${journal.name}] 有页面缺少 _id`);
      }
      if (!/^[a-zA-Z0-9]{16}$/.test(page._id)) {
        throw new Error(
          `[${journal.name}] 页面「${page.name}」_id "${page._id}" 无效（须 16 位字母数字）`
        );
      }
      pageIds.push(page._id);
      await db.put(`!journal.pages!${journal._id}.${page._id}`, page);
      subCount++;
    }
    journal.pages = pageIds;
  }

  await db.put(`!journal!${journal._id}`, journal);
  return 1 + subCount;
}

async function openPackDb(name, outDir) {
  const stagingDir = path.join(MODULE_ROOT, "packs-staging", name);
  for (const dir of [outDir, stagingDir]) {
    fs.mkdirSync(dir, { recursive: true });
    const db = new ClassicLevel(dir, { keyEncoding: "utf8", valueEncoding: "json" });
    try {
      await db.put("!pack-build-test!", { ok: true });
      await db.del("!pack-build-test!");
      if (dir !== outDir) {
        console.warn(
          `[${name}] 无法写入 ${outDir}（Foundry 占用）。已改用 ${dir}，请关闭 Foundry 后运行 npm run pack。`
        );
      }
      return { db, targetDir: dir };
    } catch {
      await db.close().catch(() => {});
    }
  }
  throw new Error(`[${name}] 无法写入合集目录，请先关闭 Foundry 再运行 npm run pack。`);
}

async function writePack({ name, docType, src, foldersFile }) {
  const outDir = path.join(MODULE_ROOT, "packs", name);
  const fresh = tryRimraf(outDir);
  fs.mkdirSync(outDir, { recursive: true });

  const { db, targetDir } = await openPackDb(name, outDir);

  let count = 0;

  if (foldersFile) {
    const foldersPath = path.join(src, foldersFile);
    if (fs.existsSync(foldersPath)) {
      const { folders = [] } = JSON.parse(fs.readFileSync(foldersPath, "utf8"));
      for (const folder of folders) {
        if (!/^[a-zA-Z0-9]{16}$/.test(folder._id)) {
          throw new Error(
            `[${name}] 文件夹「${folder.name}」_id "${folder._id}" 无效（须 16 位字母数字）`
          );
        }
        const doc = {
          sort: 0,
          color: null,
          description: "",
          flags: {},
          ...folder,
        };
        await db.put(`!folders!${doc._id}`, doc);
        count++;
      }
    }
  }

  for (const file of fs.readdirSync(src)) {
    if (!file.endsWith(".json")) continue;
    if (file === foldersFile || file === "README.md") continue;

    const doc = JSON.parse(fs.readFileSync(path.join(src, file), "utf8"));
    const isJournal = docType === "journal";
    if (!doc._id || (!isJournal && !doc.type) || (isJournal && !doc.name)) {
      console.warn(`跳过无效文件: ${file}`);
      continue;
    }
    if (!/^[a-zA-Z0-9]{16}$/.test(doc._id)) {
      console.warn(
        `[${name}] 跳过无效 _id「${doc._id}」文件: ${file}（须为 16 位字母数字）`
      );
      continue;
    }
    if (docType === "actors") {
      count += await writeActorDocument(db, doc);
    } else if (docType === "journal") {
      count += await writeJournalDocument(db, doc);
    } else {
      await db.put(`!${docType}!${doc._id}`, doc);
      count++;
    }
  }

  if (!fresh) {
    for (const key of STALE_KEYS[name] ?? []) {
      try {
        await db.del(key);
        console.log(`[${name}] 删除旧记录 ${key}`);
      } catch {
        /* 可能不存在 */
      }
    }
  }

  await db.close();
  const mode = targetDir === outDir ? (fresh ? "" : "（增量）") : "（staging）";
  console.log(`[${name}] 写入 ${count} 条记录 → ${targetDir}${mode}`);

  if (targetDir === outDir) {
    const stagingDir = path.join(MODULE_ROOT, "packs-staging", name);
    tryRimraf(stagingDir);
  }
}

for (const pack of PACKS) {
  await writePack(pack);
}

console.log("合集编译完成。请 F5 刷新 Foundry。");
