/**
 * 一次性：将 homebrew-actors 中无效 _id 改为 16 位字母数字，并重命名源文件。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ACTORS_DIR = path.resolve(__dirname, "..", "src", "packs", "homebrew-actors");
const PY_FILE = path.resolve(__dirname, "build-homebrew-actors.py");

const ID_MAP = {
  whbmafthug0001: "whbMafThug000001",
  whbmafelite001: "whbMafElite00001",
  whbmafshota01: "whbMafShota00001",
  whbmafvet0001: "whbMafVet0000001",
  whbleonardo001: "whbLeonardo00001",
  whbantonio001: "whbAntonio000001",
  whbromiana001: "whbRomiana000001",
  whbmedium0001: "whbMedium0000001",
  whbconti00001: "whbConti00000001",
  whbbyakhee001: "whbByakhee000001",
  whbeaterseed1: "whbEaterSeed0001",
};

for (const [oldId, newId] of Object.entries(ID_MAP)) {
  if (!/^[a-zA-Z0-9]{16}$/.test(newId)) {
    throw new Error(`新 ID 无效: ${newId}`);
  }
}

let py = fs.readFileSync(PY_FILE, "utf8");
for (const [oldId, newId] of Object.entries(ID_MAP)) {
  py = py.replaceAll(oldId, newId);
}
fs.writeFileSync(PY_FILE, py);

for (const file of fs.readdirSync(ACTORS_DIR)) {
  if (!file.endsWith(".json") || file === "_folders.json") continue;

  const filePath = path.join(ACTORS_DIR, file);
  let text = fs.readFileSync(filePath, "utf8");
  const doc = JSON.parse(text);

  if (!doc._id) continue;

  const newId = ID_MAP[doc._id];
  if (!newId) {
    if (!/^[a-zA-Z0-9]{16}$/.test(doc._id)) {
      console.warn(`跳过未映射的无效 ID: ${file} → ${doc._id}`);
    }
    continue;
  }

  text = text.replace(`"_id": "${doc._id}"`, `"_id": "${newId}"`);
  for (const [oldId, mapped] of Object.entries(ID_MAP)) {
    text = text.replaceAll(oldId, mapped);
  }

  const newFile = `${newId}.json`;
  const newPath = path.join(ACTORS_DIR, newFile);
  fs.writeFileSync(newPath, text);
  if (file !== newFile) fs.unlinkSync(filePath);
  console.log(`${file} → ${newFile}`);
}

console.log("Actor _id 修复完成。");
