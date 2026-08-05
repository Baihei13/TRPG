# PF2e 自制日志 / Lore

在此目录放置 JournalEntry JSON（含 `pages` 内嵌页）。

- `_id`：16 位字母数字
- 页面 `_id`：各 16 位字母数字
- 编译：`npm run pack`（脚本会把 pages 拆成 `!journal.pages!{journalId}.{pageId}`）
