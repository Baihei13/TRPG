/**
 * 把「猎杀对决 · 赏金狩猎」写入当前世界，供 Simple Quest / 简单任务使用。
 * 结构：同一栏两条主目标 + secret 单列隐藏赏金。
 * 热栏运行即可；不要包 (async () => {})()。
 */
const TITLE = "猎杀对决 · 赏金狩猎";
const PAGE_NAME = "赏金狩猎";
const FOLDER_NAME = "猎杀对决·任务";
const CONTENT = `<p><strong>任务描述:</strong></p>
<p>腐化在路易斯安那的沼泽与废镇间蔓延。猎人受命进入猎场：循着血迹、尖叫与焦糊气味搜集线索，锁定目标赏金；完成放逐后，带着令牌从撤离点活着离开。</p>
<ul>
<li>搜集线索寻找赏金</li>
<li>带着赏金撤离</li>
</ul>
<hr />
<section class="secret">
<p>有人在猎场里另藏了一份赏金——不标在合同上，只留给仍肯往更深处走的人。</p>
<ul>
<li>寻找被隐藏的赏金</li>
</ul>
</section>
<p><strong>奖励：</strong>赏金令牌 1～2 枚；猎金按完成度结算</p>`;

if (!game.user.isGM) {
  return ui.notifications.warn("需要 GM 才能创建任务日记。");
}

let folder = game.folders.find(
  (f) => f.type === "JournalEntry" && f.name === FOLDER_NAME
);
if (!folder) {
  folder = await Folder.create({
    name: FOLDER_NAME,
    type: "JournalEntry",
    sorting: "a",
  });
}

let journal = game.journals.find((j) => j.name === TITLE && j.folder?.id === folder.id)
  ?? game.journals.find((j) => j.name === TITLE);

if (!journal) {
  journal = await JournalEntry.create({
    name: TITLE,
    folder: folder.id,
    pages: [
      {
        name: PAGE_NAME,
        type: "text",
        text: { format: 1, content: CONTENT },
      },
    ],
  });
  ui.notifications.info(`已创建任务日记：「${TITLE}」`);
} else {
  const page = journal.pages.contents[0];
  if (page) {
    await page.update({ name: PAGE_NAME, "text.content": CONTENT });
  } else {
    await journal.createEmbeddedDocuments("JournalEntryPage", [
      { name: PAGE_NAME, type: "text", text: { format: 1, content: CONTENT } },
    ]);
  }
  ui.notifications.info(`已更新任务日记：「${TITLE}」`);
}

await journal.sheet?.render(true);
