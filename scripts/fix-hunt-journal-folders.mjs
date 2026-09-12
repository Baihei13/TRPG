/**
 * Fix Hunt journals: folders, balloon GM UTF-8, larger body fonts.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "src", "packs", "homebrew-journals");

const folders = {
  folders: [
    { _id: "whbfolderHuntJ01", name: "猎杀对决", type: "JournalEntry", sorting: "a", folder: null },
    { _id: "whbHntJrIntro001", name: "猎杀·猎人入门", type: "JournalEntry", sorting: "a", folder: "whbfolderHuntJ01" },
    { _id: "whbHntJrWhitw001", name: "猎杀·惠特劳战役", type: "JournalEntry", sorting: "a", folder: "whbfolderHuntJ01" },
    { _id: "whbHntJrRules001", name: "猎杀·规则备忘", type: "JournalEntry", sorting: "a", folder: "whbfolderHuntJ01" },
    { _id: "whbHntJrButch001", name: "猎杀·屠夫", type: "JournalEntry", sorting: "a", folder: "whbfolderHuntJ01" },
    { _id: "whbHntJrHellH001", name: "猎杀·地狱犬", type: "JournalEntry", sorting: "a", folder: "whbfolderHuntJ01" },
    { _id: "whbHntJrMeatH001", name: "猎杀·肉头怪", type: "JournalEntry", sorting: "a", folder: "whbfolderHuntJ01" },
    { _id: "whbHntJrGrunt001", name: "猎杀·僵尸", type: "JournalEntry", sorting: "a", folder: "whbfolderHuntJ01" },
    { _id: "whbHntJrArmor001", name: "猎杀·装甲兵", type: "JournalEntry", sorting: "a", folder: "whbfolderHuntJ01" },
    { _id: "whbHntJrHive0001", name: "猎杀·蜂巢怪", type: "JournalEntry", sorting: "a", folder: "whbfolderHuntJ01" },
    { _id: "whbHntJrImmol001", name: "猎杀·喷火怪", type: "JournalEntry", sorting: "a", folder: "whbfolderHuntJ01" },
    { _id: "whbHntJrBrute001", name: "猎杀·蛮兽", type: "JournalEntry", sorting: "a", folder: "whbfolderHuntJ01" },
    { _id: "whbHntJrHborn001", name: "猎杀·地狱之子", type: "JournalEntry", sorting: "a", folder: "whbfolderHuntJ01" },
  ],
};

for (const f of folders.folders) {
  if (!/^[A-Za-z0-9]{16}$/.test(f._id)) throw new Error(`bad folder id ${f._id} (${f._id.length})`);
}

const folderOf = {
  whbHuntAhaWelc01: "whbHntJrIntro001",
  whbHuntJVicLt001: "whbHntJrIntro001",
  whbHuntJVicBk001: "whbHntJrIntro001",
  whbHuntScoutRp01: "whbHntJrWhitw001",
  whbHuntOtisLt001: "whbHntJrWhitw001",
  whbHuntBlnGm0001: "whbHntJrRules001",
  whbHuntButchRs01: "whbHntJrButch001",
  whbHuntButchNp01: "whbHntJrButch001",
  whbHuntButchIv01: "whbHntJrButch001",
  whbHuntButchDy01: "whbHntJrButch001",
  whbHuntHhResr001: "whbHntJrHellH001",
  whbHuntHhScog001: "whbHntJrHellH001",
  whbHuntHhBonn001: "whbHntJrHellH001",
  whbHuntHhClip001: "whbHntJrHellH001",
  whbHuntMhResr001: "whbHntJrMeatH001",
  whbHuntMhSalt001: "whbHntJrMeatH001",
  whbHuntMhPhj0001: "whbHntJrMeatH001",
  whbHuntGrResr001: "whbHntJrGrunt001",
  whbHuntGrWink001: "whbHntJrGrunt001",
  whbHuntArResr001: "whbHntJrArmor001",
  whbHuntArScog001: "whbHntJrArmor001",
  whbHuntArBlak001: "whbHntJrArmor001",
  whbHuntArClip001: "whbHntJrArmor001",
  whbHuntHvResr001: "whbHntJrHive0001",
  whbHuntHvIda0001: "whbHntJrHive0001",
  whbHuntImResr001: "whbHntJrImmol001",
  whbHuntImClem001: "whbHntJrImmol001",
  whbHuntImPulp001: "whbHntJrImmol001",
  whbHuntBrResr001: "whbHntJrBrute001",
  whbHuntBrGrah001: "whbHntJrBrute001",
  whbHuntHbResr001: "whbHntJrHborn001",
  whbHuntHbPrst001: "whbHntJrHborn001",
};

const balloon = {
  _id: "whbHuntBlnGm0001",
  name: "要塞货气球 · 场景流程",
  img: "modules/wang-pf2e-homebrew/assets/hunt/fusee.png",
  pages: [
    {
      _id: "whbHuntBlnGmP001",
      name: "怎么摆、怎么玩",
      type: "text",
      title: { show: true, level: 1 },
      image: {},
      text: {
        format: 1,
        content: `<div style="font-family:Georgia,'Songti SC',SimSun,serif;font-size:1.24rem;line-height:1.9;color:#1a120c;">
<h2 style="font-size:1.4rem;">分工</h2>
<ul>
<li><strong>气球</strong>：有自动化（宏 + 战斗充气）。</li>
<li><strong>货箱</strong>：普通物品，<strong>无领取标记</strong>；奖励<strong>事后发</strong>。</li>
</ul>
<h2 style="font-size:1.4rem;">摆场景</h2>
<ol>
<li>拖 @UUID[Compendium.wang-pf2e-homebrew.homebrew-actors.Actor.whbHuntBalloon01]{要塞货气球} 到要塞（建议 Actor Link）。</li>
<li>周围放 3 个气阀 Tile/Token。可选 Active Tiles → 运行宏 @UUID[Compendium.wang-pf2e-homebrew.homebrew-macros.Macro.whbHuntBalloonM1]{要塞货气球}，参数 <code>valve</code>（关阀用 <code>close</code>）。</li>
<li>散放磨损/标准/充公货箱；玩家扛箱后拖进气球物品栏。</li>
</ol>
<h2 style="font-size:1.4rem;">宏操作</h2>
<p>热栏点「要塞货气球」弹出菜单，或传参：</p>
<ul>
<li><code>valve</code> 开阀</li>
<li><code>close</code> 关阀</li>
<li><code>ready</code> 非战斗跳过等待（需已开 ≥1 阀）</li>
<li><code>launch</code> 放飞 → 聊天输出事后发奖清单，清空吊舱货箱</li>
<li><code>status</code> / <code>reset</code></li>
</ul>
<p>战斗中：每轮按开阀数自动 +进度（满 12 可放飞）。</p>
<h2 style="font-size:1.4rem;">记住</h2>
<ul>
<li>气球不撤人。</li>
<li>谁放飞谁拿抽出权（清单写在聊天里）。</li>
<li>货箱表只给 GM 事后发奖参考。</li>
</ul>
</div>`,
      },
      video: { controls: true, loop: false, autoplay: false, volume: 0.5 },
      src: null,
      system: {},
      sort: 0,
      ownership: { default: -1 },
      flags: {},
    },
    {
      _id: "whbHuntBlnGmP002",
      name: "坠毁气球补给（可选）",
      type: "text",
      title: { show: true, level: 1 },
      image: {},
      text: {
        format: 1,
        content: `<div style="font-family:Georgia,'Songti SC',SimSun,serif;font-size:1.24rem;line-height:1.9;color:#1a120c;">
<p>随机 POI，不标小地图。建议掉落：武器、猎金、弹药，以及必出 1× @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbHuntCrgConf01]{充公货箱}。充公箱仍扛去要塞气球放飞后，再事后结算。</p>
</div>`,
      },
      video: { controls: true, loop: false, autoplay: false, volume: 0.5 },
      src: null,
      system: {},
      sort: 100000,
      ownership: { default: -1 },
      flags: {},
    },
  ],
  folder: "whbHntJrRules001",
  sort: 200,
  ownership: { default: 0 },
  flags: {
    "wang-pf2e-homebrew": {
      source: "hunt-showdown",
      huntCategory: "cargo-balloon-gm",
    },
  },
};

fs.writeFileSync(path.join(dir, "_folders.json"), JSON.stringify(folders, null, 2) + "\n", "utf8");
fs.writeFileSync(path.join(dir, "whbHuntBlnGm0001.json"), JSON.stringify(balloon, null, 2) + "\n", "utf8");

const fontMap = [
  [/font-size:1\.06rem/g, "font-size:1.24rem"],
  [/font-size:1\.08rem/g, "font-size:1.24rem"],
  [/font-size:1\.1rem/g, "font-size:1.26rem"],
  [/font-size:1\.18rem/g, "font-size:1.36rem"],
  [/font-size:1\.22rem/g, "font-size:1.38rem"],
  [/font-size:1\.28rem/g, "font-size:1.42rem"],
  [/font-size:0\.85rem/g, "font-size:0.98rem"],
  [/font-size:0\.88rem/g, "font-size:1.05rem"],
  [/font-size:0\.9rem/g, "font-size:1.08rem"],
];

let assigned = 0;
let fonted = 0;
for (const file of fs.readdirSync(dir)) {
  if (!file.startsWith("whbHunt") || !file.endsWith(".json")) continue;
  const fp = path.join(dir, file);
  let raw = fs.readFileSync(fp, "utf8");
  const id = file.replace(/\.json$/, "");
  const j = JSON.parse(raw);
  if (folderOf[id]) {
    j.folder = folderOf[id];
    assigned++;
  }
  let text = JSON.stringify(j, null, 2);
  const before = text;
  for (const [re, to] of fontMap) text = text.replace(re, to);
  if (text !== before) fonted++;
  fs.writeFileSync(fp, text + "\n", "utf8");
}

console.log({ assigned, fonted, folders: folders.folders.length });
