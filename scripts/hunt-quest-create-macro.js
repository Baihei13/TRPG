/**
 * 把猎杀对决任务日记写入当前世界，供 Simple Quest / 简单任务使用。
 * 热栏运行即可；不要包 (async () => {})()。
 * 已存在同名日记则更新第一页内容。
 */
const FOLDER_NAME = "猎杀对决·任务";

const QUESTS = [
  {
    title: "猎杀对决 · 寻找并放逐屠夫",
    pageName: "寻找并放逐屠夫",
    content: `<p><strong>任务描述:</strong></p>
<p>腐化在路易斯安那的沼泽与废镇间蔓延。猎人受命进入猎场：循着血迹、尖叫与焦糊气味搜集线索，锁定目标赏金——<strong>屠夫</strong>。完成放逐后，带着令牌从撤离点活着离开。</p>
<ul>
<li>搜集线索，寻找屠夫</li>
<li>放逐屠夫</li>
<li>带着赏金撤离</li>
</ul>
<hr />
<section class="secret">
<p>有人在猎场里另藏了一份赏金——不标在合同上，只留给仍肯往更深处走的人。</p>
<ul>
<li>寻找被隐藏的赏金</li>
</ul>
</section>
<p><strong>奖励：</strong>赏金令牌；猎金按完成度结算</p>`,
  },
  {
    title: "猎杀对决 · 血月之时",
    pageName: "血月之时",
    content: `<p><strong>任务描述:</strong></p>
<p>未知的异动让环境变成了血月。小心你见到的每一个怪物——它们比平时更凶、更硬、更难杀。血月会带来更大的报酬；结束它，你将获取黑暗的贡品。</p>
<ul>
<li>寻找并结束血月</li>
<li>或：活着撑过血月</li>
</ul>
<hr />
<section class="secret">
<p>若选择主动结束血月，而非只是挨过这一夜，黑暗会额外留下一份贡品。</p>
<ul>
<li>获取黑暗的贡品（结束血月）</li>
</ul>
</section>
<p><strong>奖励：</strong>猎金加成；结束血月可获黑暗的贡品</p>`,
  },
  {
    title: "猎杀对决 · 26军团的抵抗",
    pageName: "26军团的抵抗",
    content: `<p><strong>任务描述:</strong></p>
<p>惠特洛军官委派你们寻找失踪的侦察兵，并提醒你们提防神秘的厨师。沼泽里的枪声与炊烟一样可疑——别让任何人轻易摸到你们的后背。</p>
<ul>
<li>寻找失踪的侦察兵</li>
<li>向惠特洛军官复命</li>
<li>提防神秘的厨师</li>
</ul>
<p><strong>奖励：</strong>26军团补给与人情；按侦察兵生还情况结算猎金</p>`,
  },
  {
    title: "猎杀对决 · 情况有变！",
    pageName: "情况有变！",
    content: `<p><strong>任务描述:</strong></p>
<p><strong>任务2：情况有变！</strong>要塞遭遇了神秘势力的围攻。帮助26军团，或者加入围攻方——无论如何你们都将收获颇丰。</p>
<ul>
<li>抵达被围攻的要塞</li>
<li>选择：帮助26军团，或加入围攻方</li>
<li>在冲突中活着拿到报酬</li>
</ul>
<hr />
<section class="secret">
<p>两边开价都会抬高。谁先付钱、谁先开枪，也许比谁更正义更重要。</p>
<ul>
<li>（可选）同时榨取双方情报或报酬</li>
</ul>
</section>
<p><strong>奖励：</strong>依所选阵营发放；双方开价均可观</p>`,
  },
];

if (!game.user.isGM) {
  return ui.notifications.warn("需要 GM 才能创建任务日记。");
}

let folder = game.folders.find(
  (f) => f.type === "JournalEntry" && f.name === FOLDER_NAME,
);
if (!folder) {
  folder = await Folder.create({
    name: FOLDER_NAME,
    type: "JournalEntry",
    sorting: "a",
  });
}

const legacyNames = ["猎杀对决 · 赏金狩猎", "猎杀对决"];
for (const legacy of legacyNames) {
  const old = game.journals.find((j) => j.name === legacy);
  if (!old) continue;
  const butcher = QUESTS[0];
  const page =
    old.pages.contents.find((p) => /赏金狩猎|寻找并放逐屠夫|Quest Details/i.test(p.name)) ??
    old.pages.contents.find((p) => p.type === "text");
  if (page && page.name !== "Quest Details") {
    await page.update({ name: butcher.pageName, "text.content": butcher.content });
  } else if (page?.name === "Quest Details") {
    const playPage = old.pages.contents.find((p) => p.name !== "Quest Details" && p.type === "text");
    if (playPage) {
      await playPage.update({ name: butcher.pageName, "text.content": butcher.content });
    } else {
      await old.createEmbeddedDocuments("JournalEntryPage", [
        { name: butcher.pageName, type: "text", text: { format: 1, content: butcher.content } },
      ]);
    }
  }
  await old.update({ name: butcher.title, folder: folder.id });
}

let created = 0;
let updated = 0;
for (const q of QUESTS) {
  let journal =
    game.journals.find((j) => j.name === q.title && j.folder?.id === folder.id) ??
    game.journals.find((j) => j.name === q.title);
  if (!journal) {
    journal = await JournalEntry.create({
      name: q.title,
      folder: folder.id,
      pages: [
        {
          name: q.pageName,
          type: "text",
          text: { format: 1, content: q.content },
        },
      ],
    });
    created += 1;
  } else {
    const page =
      journal.pages.contents.find((p) => p.name === q.pageName) ??
      journal.pages.contents.find((p) => p.type === "text" && p.name !== "Quest Details") ??
      journal.pages.contents[0];
    if (page) {
      await page.update({ name: q.pageName, "text.content": q.content });
    } else {
      await journal.createEmbeddedDocuments("JournalEntryPage", [
        { name: q.pageName, type: "text", text: { format: 1, content: q.content } },
      ]);
    }
    if (journal.folder?.id !== folder.id) await journal.update({ folder: folder.id });
    updated += 1;
  }
}

ui.notifications.info(`猎杀任务已同步：新建 ${created}，更新 ${updated}。`);
const first = game.journals.find((j) => j.name === QUESTS[0].title);
await first?.sheet?.render(true);
