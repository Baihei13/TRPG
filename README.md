# PF2e 自制合集 (Wang Homebrew)

Foundry 模块 ID：`wang-pf2e-homebrew`

> **以后做的 PF2e homebrew 物品，统一放在本模块里。**

## 目录结构

```
wang-pf2e-homebrew/
├── module.json                 # 模块清单
├── README.md                   # 本说明
├── src/packs/homebrew-items/   # ★ 物品 JSON 源文件
├── src/packs/homebrew-actors/  # ★ 怪物/NPC JSON 源文件
├── src/packs/homebrew-journals/# ★ 日志 / lore JSON 源文件
├── packs/homebrew-items/       # 编译后的物品合集
├── packs/homebrew-actors/      # 编译后的 Actor 合集
├── packs/homebrew-journals/    # 编译后的日志合集
├── scripts/
│   ├── homebrew-automation.mjs # 需要脚本的自动化逻辑
│   └── data/                   # 脚本引用的模板 JSON
└── package.json                # 可选：npm run pack 编译合集
```

## 安装（推荐）

在 Foundry **安装模块** → 粘贴清单地址：

```
https://raw.githubusercontent.com/Baihei13/ziyong/main/module.json
```

之后有更新时，在模块管理里点「检查更新」即可。

## 玩家 / GM 使用

1. 在 Foundry **模块管理** 中启用 **PF2e 自制合集 (Wang Homebrew)**
2. 进入世界后，侧边栏 **合集**：
   - **PF2e 自制物品** — 拖装备给角色
   - **PF2e 自制怪物与 NPC** — 拖演员到场景
   - **PF2e 自制日志** — 打开汉化 lore（如《园丁日记》）
3. PC 佩戴 **皇帝的戒指** 时 Invest 并开启 **活化状态**；李奥纳多 NPC 请另拖 **皇帝的戒指（逆转·剧情版）** 到其物品栏

手动安装：复制整个 `wang-pf2e-homebrew` 文件夹到 `Data/modules/`，启用模块即可。

## 添加新物品

1. 在 `src/packs/homebrew-items/` 新建 `{16位_id}.json`（完整 Item 文档，含 `_id`）
2. 若只需 Rule Elements，写进物品的 `system.rules` 即可，**不必改脚本**
3. 若需要脚本（类似隐蔽、受伤快疗），在 `scripts/homebrew-automation.mjs` 扩展逻辑
4. 重新编译合集：

```bash
cd Data/modules/wang-pf2e-homebrew
npm install
npm run pack
```

（使用 `scripts/build-compendium-packs.mjs` 写入 LevelDB；勿单独用 `fvtt package pack`，在 Windows 上可能生成空库。）

5. **F5 刷新 Foundry**（若仍空白，完全退出 Foundry 再进一次）

## 当前内容（《再见教父》· IV 皇帝）

| 物品 | 类型 | 自动化 |
|------|------|--------|
| 皇帝的戒指 | 装备 | Rule Elements + 模块脚本（隐蔽、浴血雄狮） |
| 皇帝的戒指（逆转·剧情版） | 装备 | 给 NPC 李奥纳多用的 COC 衰退版规则 |
| 皇帝卡牌·复制品 | 装备 | Rule Elements（击碎冠冕结局） |
| 皇帝卡牌·逆位复制品 | 装备 | Rule Elements（诅咒逆位碎片） |
| 银质护身符 | 装备 | 意志豁免 +1（M 古董店） |
| 星月仿制品（低阶） | 消耗品 | 描述 + 联动「星月幻影」效果 |
| 星月幻影 | 效果 | 免疫惊惧 1 分钟 |
| 血肉护符 | 消耗品 | TempHP 2d6 + 联动「血肉防护术」效果 |
| 血肉防护术 | 效果 | 2d6 临时 HP |
| 芭丝特的祝福 | 药水 | 治疗 1d6+4（移除惊惧由 GM/手动） |
| 拜亚基召唤哨 | 装备 | 每日恐惧哨声（Note + 手动开关） |

## 怪物与 NPC（1 级团强度）

合集：**PF2e 自制怪物与 NPC**（`homebrew-actors`）

| 名称 | 等级 | 用途 |
|------|------|------|
| 西西里帮杂兵 | -1 | 成组出现（3–4 名） |
| 帮派枪手 | 0 | 远程骚扰 |
| 西西里帮精英打手 | 1 | 小头目、压制射击 |
| 卡亨家族保镖 | 1 | 李/安两侧护卫 |
| 李奥纳多·卡亨 | 2 | 新教父（社交向，配剧情戒指） |
| 安东尼奥·卡亨 | 2 | 幼子、传统派 |
| 罗蜜安娜·卡亨 | 1 | 非战斗贵妇 |
| 灵媒 | 1 | 支援/剧情 |
| 小孔蒂 | -1 | 孩童剧情 |
| 硕鼠·弗兰克 | 2 | 李奥纳多亲信 |
| 拜亚基（削弱） | 3 | 可逃跑精英战 |
| 吞噬之物·窥影 | 3 | Eater 早期显形，宜驱散/逃跑 |

重新生成 Actor JSON：`python scripts/build-homebrew-actors.py`  
编译全部合集：`npm run pack:all`

## 自制日志（Lore）

合集：**PF2e 自制日志**（`homebrew-journals`）

| 名称 | 说明 |
|------|------|
| 园丁日记 | Ephemera 原生书（`old-book`） |
| 莫罗医生的日记 | Ephemera 原生书；**较大字号** + 装饰分隔线；末页「夜织者」 |
| 生成：园丁日记（Ephemera） | 宏 |
| 生成：莫罗医生的日记（Ephemera） | 宏 |

源文件：`src/packs/homebrew-journals/`（`npm run build:journals`）  
**必须启用 Ephemera。**

```js
await game.modules.get("wang-pf2e-homebrew").api.createMorrowEphemeraBook()
await game.modules.get("wang-pf2e-homebrew").api.createGroundskeeperEphemeraBook()
```

来源模组：`叉烧饭加蛋-《再见教父》圣卡琳娜的大秘仪II期 IV皇帝`

## 从旧世界迁移

若之前在测试世界 `6859vh6iaxbfbj4m` 使用世界脚本：

1. 启用本模块
2. 从模块合集重新拖入戒指（或删除旧戒指后导入）
3. `world.json` 中已移除 `esmodules`，不再依赖世界脚本
