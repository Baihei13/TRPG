/**
 * 将 packs-staging 复制到 packs（Foundry 关闭后运行）。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODULE_ROOT = path.resolve(__dirname, "..");
const PACK_NAMES = ["homebrew-items", "homebrew-actors"];

function rimraf(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) rimraf(p);
    else fs.unlinkSync(p);
  }
  fs.rmdirSync(dir);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

for (const name of PACK_NAMES) {
  const staging = path.join(MODULE_ROOT, "packs-staging", name);
  const target = path.join(MODULE_ROOT, "packs", name);
  if (!fs.existsSync(staging)) {
    console.warn(`跳过 ${name}：staging 不存在，请先 npm run pack`);
    continue;
  }
  try {
    rimraf(target);
  } catch (err) {
    if (err.code === "EBUSY" || err.code === "EPERM") {
      console.error(
        `[${name}] 无法替换 ${target}：Foundry 正在占用。请先完全关闭 Foundry 再运行 npm run promote-packs`
      );
      process.exitCode = 1;
      continue;
    }
    throw err;
  }
  copyDir(staging, target);
  console.log(`[${name}] staging → packs 完成`);
}

if (!process.exitCode) {
  console.log("合集已发布。请重新打开 Foundry 并 F5 刷新。");
}
