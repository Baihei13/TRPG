/**
 * 将 packs-staging 逐条同步到 packs（Foundry 运行时也可用，无需删库）。
 */
import { ClassicLevel } from "classic-level";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODULE_ROOT = path.resolve(__dirname, "..");
const PACK_NAMES = [
  "homebrew-items",
  "mocai",
  "homebrew-actors",
  "homebrew-macros",
  "homebrew-journals",
];

export async function syncStagingToLive(names = PACK_NAMES) {
  for (const name of names) {
    const staging = path.join(MODULE_ROOT, "packs-staging", name);
    const live = path.join(MODULE_ROOT, "packs", name);
    if (!fs.existsSync(staging)) continue;

    fs.mkdirSync(live, { recursive: true });
    const src = new ClassicLevel(staging, { keyEncoding: "utf8", valueEncoding: "json" });
    const dst = new ClassicLevel(live, {
      keyEncoding: "utf8",
      valueEncoding: "json",
      createIfMissing: true,
    });

    await src.open();
    await dst.open();
    let n = 0;
    for await (const [key, value] of src.iterator()) {
      await dst.put(key, value);
      n++;
    }
    await src.close();
    await dst.close();
    console.log(`[${name}] staging → packs 同步 ${n} 条`);
  }
}

const isMain =
  process.argv[1] &&
  path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1]);

if (isMain) {
  await syncStagingToLive();
  console.log("同步完成。请在 Foundry 中 F5 刷新。");
}
