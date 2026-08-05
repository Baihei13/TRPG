#!/usr/bin/env python3
"""Download RWS Major Arcana, witch-grade them, emit PF2e equipment JSON."""
from __future__ import annotations

import json
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps

MODULE_ROOT = Path(__file__).resolve().parents[1]
ASSETS = MODULE_ROOT / "assets" / "tarot-major"
SRC_ITEMS = MODULE_ROOT / "src" / "packs" / "homebrew-items"
RAW = ASSETS / "_raw"

CARDS = [
    {
        "num": "00",
        "roman": "0",
        "en": "Fool",
        "file": "RWS_Tarot_00_Fool.jpg",
        "id": "whbtarotfool0001",
        "slug": "tarot-the-fool",
        "name": "塔罗·愚者",
        "obtain": "娱乐室台球桌球袋深处（巧手 DC14）",
        "upright_cond": "将自己持有的所有道具（不包括无法丢弃的物品）全部赠予他人，一件不留。然后手持愚者牌，独自走进一个你从未去过的房间。",
        "upright_fx": "获得一次新生。清除所有污染值，SAN 值回复至满。你失去的道具中，黑白熊随机选一件，以升级版形态归还（效果增强或使用次数翻倍）。",
        "reversed_cond": "身上持有至少 5 枚硬币。在商店关门前，将所有硬币花光（买什么都行），然后在空荡荡的钱袋上放置愚者牌。",
        "reversed_fx": "你获得了愚者的直觉——接下来 24 小时内，你无法进行任何计划性行动（不能提交杀人计划，不能使用攻略笔记等预演类能力），但你在此期间免疫所有污染值获取。24 小时后，你获得在此期间你目击的所有事件的模糊记录。",
    },
    {
        "num": "01",
        "roman": "I",
        "en": "Magician",
        "file": "RWS_Tarot_01_Magician.jpg",
        "id": "whbtarotmagi0001",
        "slug": "tarot-the-magician",
        "name": "塔罗·魔术师",
        "obtain": "法术教室魔力回路（用魔力触碰显现）",
        "upright_cond": "在法术教室，消耗至少 5 点魔力一次性注入卡牌，使卡牌悬浮在空中。",
        "upright_fx": "卡牌化作一枚魔力结晶镶嵌在你身上。接下来 48 小时内，你使用魔法时魔力消耗减半。结晶效果结束后自动碎裂，不产生污染。",
        "reversed_cond": "在你魔力为空（0 点）的状态下，将卡牌贴在自己额头上，用 1 点生命值激活。",
        "reversed_fx": "你获得透支魔力的能力——接下来 24 小时内，你可以无限使用魔法（仍需消耗魔力，但魔力消耗完后自动从生命值扣除，不造成昏迷但累积到生命值过半时仍昏迷）。在此期间每次使用魔法污染值获取概率翻倍。",
    },
    {
        "num": "02",
        "roman": "II",
        "en": "High Priestess",
        "file": "RWS_Tarot_02_High_Priestess.jpg",
        "id": "whbtarotpris0001",
        "slug": "tarot-the-high-priestess",
        "name": "塔罗·女祭司",
        "obtain": "教堂祭坛下方隐藏隔层（巧手 DC16）",
        "upright_cond": "在教堂，于深夜（21:00–6:00）独自静坐 2 回合（1 小时），全程不发出任何声音。结束时将卡牌放在祭坛上。",
        "upright_fx": "获得一次神谕——向黑白熊询问一个「是/否」问题，黑白熊必须真实回答。此外，接下来 24 小时内你对谎言的直觉敏锐（涉及欺骗的检定获得优势）。",
        "reversed_cond": "在教堂，当着至少两名其他角色的面，大声说出一个关于自己的真实秘密（必须是你从未对监狱中任何人透露过的）。",
        "reversed_fx": "黑白熊被你的自我暴露取悦了。你获得 3 枚硬币，但 SAN 值 −1。在场的其他角色中，随机一人对你产生怀疑（黑白熊会私下告知对方「你听到了一些让你不安的事情」，但不具体说明）。",
    },
    {
        "num": "03",
        "roman": "III",
        "en": "Empress",
        "file": "RWS_Tarot_03_Empress.jpg",
        "id": "whbtarotempr0001",
        "slug": "tarot-the-empress",
        "name": "塔罗·女皇",
        "obtain": "田地花丛中（仅早晨 6:00–9:00 可见）",
        "upright_cond": "从田地或花房采摘一束鲜花，连同女皇牌一起赠予另一名角色。对方必须自愿接受。赠予时不需要见证人，但你必须说出赠予理由。",
        "upright_fx": "接受者获得女皇的加护——48 小时内所有伤害 −2，且每天回复 1 点 SAN 值（共 2 天）。你与接受者成为朋友（等同于莱尔派对效果）。你获得 2 枚硬币。",
        "reversed_cond": "将女皇牌埋在田地的泥土中，浇上你自己的血（1 点生命值），然后离开。24 小时后回来挖出。",
        "reversed_fx": "牌已经腐烂了一半。你获得枯萎的加护——接下来 24 小时内，你受到的伤害 +1，但你造成的伤害也 +2。你变得危险但脆弱。",
    },
    {
        "num": "04",
        "roman": "IV",
        "en": "Emperor",
        "file": "RWS_Tarot_04_Emperor.jpg",
        "id": "whbtarotempe0001",
        "slug": "tarot-the-emperor",
        "name": "塔罗·皇帝",
        "obtain": "锻造教室熔炉底部（力量-破坏 DC16 砸开凝固金属）",
        "upright_cond": "在任意房间门口贴上皇帝牌，宣告该房间是你的领地。必须在场至少有两名其他角色听到你的宣告。贴牌后你必须在领地内连续停留至少 3 回合。",
        "upright_fx": "该房间成为你的绝对领地 48 小时。领地内其他角色所有检定处于劣势。你可以随时将一名角色驱逐出领地。领地存在期间，你在领地内免疫污染值获取。",
        "reversed_cond": "将皇帝牌烧毁于锻造教室的熔炉中。不需要任何人在场。",
        "reversed_fx": "你的统治欲灼伤了自己。你的污染值 +2。但在接下来 24 小时内，你下一次进入任何房间时，如果该房间内有其他角色，他们必须在你进入后的 1 回合内选择离开或接受你提出的一个要求（不能是自残或自杀类要求）。每个人都只能被此效果影响一次。",
    },
    {
        "num": "05",
        "roman": "V",
        "en": "Hierophant",
        "file": "RWS_Tarot_05_Hierophant.jpg",
        "id": "whbtarothier0001",
        "slug": "tarot-the-hierophant",
        "name": "塔罗·教皇",
        "obtain": "忏悔室暗格（需要在此进行一次真实告解才会显现）",
        "upright_cond": "在忏悔室，为一名不在场的角色进行辩护——说出你认为对方值得被信任的理由，必须是真实的。黑白熊会判断是否真诚。",
        "upright_fx": "你与辩护对象建立神圣羁绊。羁绊存在期间，一方触发禁忌时，另一方可主动代受 1 点 SAN 扣除（可拒绝）。此外，羁绊双方每天首次交谈后各回复 1 点 SAN。羁绊持续到有人死亡。",
        "reversed_cond": "在忏悔室，检举一名在场角色的罪行——必须是对方真实做过的事。如果对方否认但你坚持，检举仍然有效。",
        "reversed_fx": "你与被检举者之间产生罪孽连线。接下来 48 小时内，你知道对方所在的楼层（模糊位置），对方也知道你所在的楼层。如果其中一方在知道对方位置的前提下主动接近并造成伤害，伤害 +2。但如果最终没有互相伤害，48 小时后两人各净化 1 点污染。",
    },
    {
        "num": "06",
        "roman": "VI",
        "en": "Lovers",
        "file": "RWS_Tarot_06_Lovers.jpg",
        "id": "whbtarotlove0001",
        "slug": "tarot-the-lovers",
        "name": "塔罗·恋人",
        "obtain": "艺术教室未完成画作后面（发现颜料未干才能注意到）",
        "upright_cond": "与一名角色在任意房间独处至少 3 回合，期间两人必须交换一件随身物品作为信物。然后将恋人牌撕成两半，各持一半。",
        "upright_fx": "两人互相知晓对方的禁忌具体内容。交换的信物成为羁绊信物——持有对方信物者，在对方受到伤害时能感知到（知道对方受伤了，但不知道具体细节）。羁绊持续到有人死亡或信物被销毁。",
        "reversed_cond": "独自在艺术教室，用恋人牌作为画布，画上你最爱或最恨的人的脸（不需要画得像，只需要画出你心中所想）。完成后将牌留在画架上。",
        "reversed_fx": "你对那个人的执念被牌吸收。你获得执念印记——当你与画像对象同处一个房间时，你对 TA 造成的伤害 +3，但你也无法对 TA 说谎（说谎时对方智力-侦查自动成功）。持续到其中一人死亡。",
    },
    {
        "num": "07",
        "roman": "VII",
        "en": "Chariot",
        "file": "RWS_Tarot_07_Chariot.jpg",
        "id": "whbtarotchar0001",
        "slug": "tarot-the-chariot",
        "name": "塔罗·战车",
        "obtain": "道场榻榻米下（力量-破坏 DC14 掀开地板）",
        "upright_cond": "在道场，向一名角色发起正式对决邀请。双方同意后，使用木刀或徒手对决。你必须获胜（将对方生命值打到半血以下或对方认输）。",
        "upright_fx": "你的战斗意志得到淬炼。你下一次进入战斗时，先攻自动第一，第一次攻击伤害 +3。此效果持续到触发或 72 小时后失效。",
        "reversed_cond": "在道场，向一名角色发起正式对决邀请。你战败（被对方打到半血以下或你主动认输）。",
        "reversed_fx": "战败让你学会了谦卑。你的 AC 永久 +1（不叠加）。但你下一次战斗的第一次攻击自动失手（过于谨慎）。",
    },
    {
        "num": "08",
        "roman": "VIII",
        "en": "Strength",
        "file": "RWS_Tarot_08_Strength.jpg",
        "id": "whbtarotstre0001",
        "slug": "tarot-strength",
        "name": "塔罗·力量",
        "obtain": "军械室武器架顶部（敏捷-运动 DC14 攀爬，失败则武器架倒塌发出巨响）",
        "upright_cond": "成功通过一次 DC16 以上的力量检定（可以是任何力量分支：运动、举重、破坏）。在成功的那一瞬间，将力量牌高高举起。",
        "upright_fx": "你的力量值 +2，持续 48 小时。如果已满 6 则突破上限至 7。在此期间，你扛起重物时不需要进行举重检定（自动成功）。",
        "reversed_cond": "在一次力量检定中大失败（掷出 1–3 且最终结果未达到 DC）。在失败后将力量牌贴在胸口。",
        "reversed_fx": "力量从你的身体流入意志。你的力量值 −1（持续 24 小时），但智力值 +2（持续 24 小时）。如果智力已满 6 则改为 SAN 值 +2。",
    },
    {
        "num": "09",
        "roman": "IX",
        "en": "Hermit",
        "file": "RWS_Tarot_09_Hermit.jpg",
        "id": "whbtarotherm0001",
        "slug": "tarot-the-hermit",
        "name": "塔罗·隐者",
        "obtain": "占星教室天花板星图（仅凌晨 3:00–4:00 月光显现）",
        "upright_cond": "连续独处满 6 回合（3 小时游戏内时间），不与其他任何角色接触、交谈、传递物品。期间必须停留在同一个房间。结束时手持隐者牌。",
        "upright_fx": "获得一次隐遁——即刻传送到图书馆阅读室。接下来 12 小时内，你的行踪不会被任何魔法追踪，监控和预知能力对你失效。SAN 值回复 3 点，并获得 1 条关于监狱隐藏结构的信息。",
        "reversed_cond": "在地牢的牢房中，被锁在里面的状态下，独自待满 3 回合。不需要连续，可以被放出再进去，但总计必须满 3 回合。",
        "reversed_fx": "你习惯了孤独的黑暗。获得黑暗适应——在黑暗环境中你的侦查不再处于劣势。此外，你免疫「孤独」带来的 SAN 值惩罚。但你下次主动与人交谈时，需要先通过 SAN 检定 DC10，否则会不自觉地疏远对方（对方察觉到你不对劲）。",
    },
    {
        "num": "10",
        "roman": "X",
        "en": "Wheel of Fortune",
        "file": "RWS_Tarot_10_Wheel_of_Fortune.jpg",
        "id": "whbtarotwhee0001",
        "slug": "tarot-wheel-of-fortune",
        "name": "塔罗·命运之轮",
        "obtain": "娱乐室扑克牌堆中（与他人玩牌时随机抽出）",
        "upright_cond": "在商店消费恰好 5 枚硬币（不能多不能少），将消费的小票和命运之轮牌一起交给黑白熊。",
        "upright_fx": "命运眷顾精打细算者。掷 d20：1–5 不触发（牌退回但不碎裂，可重新激活）；6–20 你获得 2d6 硬币，并查看商店下一次刷新的完整清单（可以预购一件）。",
        "reversed_cond": "在持有命运之轮牌的状态下，参加一次学级裁判。在投票环节，故意投错票（你知道凶手是谁，但投了别人）。",
        "reversed_fx": "命运的恶作剧。你的投票被忽略不计（不影响结果）。但在学裁结束后，你秘密获得被处刑者的遗物（黑白熊私交给你）。你获得 2 枚硬币。污染值 +1。",
    },
    {
        "num": "11",
        "roman": "XI",
        "en": "Justice",
        "file": "RWS_Tarot_11_Justice.jpg",
        "id": "whbtarotjust0001",
        "slug": "tarot-justice",
        "name": "塔罗·正义",
        "obtain": "审判间主席台下方抽屉（仅学裁结束后可进入获取）",
        "upright_cond": "在学级裁判中，投票正确指认真凶。学裁结束后手持正义牌站在审判间中央。",
        "upright_fx": "获得正义执行——你下次对已确认凶手的攻击自动命中且伤害翻倍。可保留至下一案件。此外，你在下一次学裁中的发言权重 +1（你的指控更受重视）。",
        "reversed_cond": "在学级裁判中，公开指认了一个错误的人（在讨论环节就指认，不是投票环节），并且在投票前意识到自己错了。",
        "reversed_fx": "你为自己的误判付出代价。SAN 值 −1。但被你误指的角色对你产生一种奇怪的理解——你们成为暂时的盟友（接下来的 24 小时内，双方不能互相伤害）。",
    },
    {
        "num": "12",
        "roman": "XII",
        "en": "Hanged Man",
        "file": "RWS_Tarot_12_Hanged_Man.jpg",
        "id": "whbtarothang0001",
        "slug": "tarot-the-hanged-man",
        "name": "塔罗·倒吊人",
        "obtain": "地牢天花板铁钩上（需被束缚姿态抬头才能看到）",
        "upright_cond": "自愿进入地牢牢房，让人将你锁在里面。在束缚状态下保持至少 3 回合，期间不挣扎不求救不喊叫。结束时将倒吊人牌握在手中。",
        "upright_fx": "你的牺牲得到了回报。获得一条关于魔女审判真相的核心世界观碎片（比一般的碎片更详细）。SAN 值回复 2 点，污染值净化 3 点。",
        "reversed_cond": "在血池中，将倒吊人牌浸入血液，然后贴在受伤的部位（必须是自己已有的伤口，不能为此自残）。保持 1 回合。",
        "reversed_fx": "痛苦中你看到了不该看的东西。你获得一次血之预知——可以查看任意一名角色当前的 SAN 值和污染值。但你自己污染值 +1，且该伤口在 24 小时内无法被治疗。",
    },
    {
        "num": "13",
        "roman": "XIII",
        "en": "Death",
        "file": "RWS_Tarot_13_Death.jpg",
        "id": "whbtarotdeth0001",
        "slug": "tarot-death",
        "name": "塔罗·死神",
        "obtain": "焚尸炉内部灰烬中（需爬进去）",
        "upright_cond": "在焚尸房，将一件属于已死亡角色的遗物（必须是对方生前珍视的东西，不能是随便捡的）投入焚尸炉焚烧。焚烧时手持死神牌，默念死者的名字。",
        "upright_fx": "与死者灵魂对话 5 分钟（可问 5 个问题，黑白熊以死者身份真实回答）。死神牌变灰白，成为不可交易丢弃的纪念品。死者安息，你获得 1 点 SAN 回复。",
        "reversed_cond": "在焚尸房，将你自己的一件珍视物品投入焚尸炉焚烧。焚烧时将死神牌贴在胸口。",
        "reversed_fx": "你象征性地死了一次。你的污染值清零，SAN 值回复至满。但你下一次触发禁忌时，SAN 扣除翻倍（命运记住了你的逃避）。死神牌变灰白，永久保留。",
    },
    {
        "num": "14",
        "roman": "XIV",
        "en": "Temperance",
        "file": "RWS_Tarot_14_Temperance.jpg",
        "id": "whbtarottemp0001",
        "slug": "tarot-temperance",
        "name": "塔罗·节制",
        "obtain": "魔药教室配方书夹层（知识-魔药 DC14 发现空心书）",
        "upright_cond": "在魔药教室，亲手制作一瓶治疗药水（药草×2），并将它无偿送给一名非朋友关系的角色治疗伤势。对方必须真的有伤（生命值不满）。",
        "upright_fx": "你的无私获得了平衡的回报。你与接受者各回复 3 点 SAN 值，各净化污染值 2 点。两人建立临时的友好关系（24 小时内不能互相伤害）。",
        "reversed_cond": "在魔药教室，制作一瓶毒药（毒草×1），然后自己喝下去（承受毒药效果：1d8+5 伤害）。",
        "reversed_fx": "你从毒药中幸存（毒药伤害减半，向下取整）。你的身体产生了毒抗性——接下来 48 小时内，你对毒药和药物类效果的伤害/影响减半。但你呕吐出了污染——污染值 +2。",
    },
    {
        "num": "15",
        "roman": "XV",
        "en": "Devil",
        "file": "RWS_Tarot_15_Devil.jpg",
        "id": "whbtarotdevi0001",
        "slug": "tarot-the-devil",
        "name": "塔罗·恶魔",
        "obtain": "酿酒室最深酒桶底部（需喝下未过滤毒酒，体质 DC14 失败呕吐昏迷 1 小时）",
        "upright_cond": "向一名角色提出公平交易——用你持有的某件道具交换对方的某件道具。双方必须自愿、知情、且交换的物品价值相当（由双方自行判断）。交易完成后将恶魔牌放在交易物品之间。",
        "upright_fx": "契约成立。双方获得交换物品的永久所有权（无法被偷回或抢夺）。双方都知道对方的一个秘密（各自选一个告诉对方）。但双方成为契约绑定——其中一人触发禁忌时，另一人获得 1 枚硬币作为「违约金」。",
        "reversed_cond": "在商店购买任意一件标价 ≥5 硬币的商品。购买后将恶魔牌贴在商品上，然后将其赠予另一名角色。对方接受时并不知道你的意图。",
        "reversed_fx": "接受者获得了商品，但也被恶魔标记。接下来 24 小时内，接受者每次使用魔法，你获得 1 枚硬币（从虚空中产生，不是从对方那里拿）。接受者对此不知情。24 小时后标记消失，但如果期间接受者发现自己被标记，你的 SAN 值 −2。",
    },
    {
        "num": "16",
        "roman": "XVI",
        "en": "Tower",
        "file": "RWS_Tarot_16_Tower.jpg",
        "id": "whbtarottowr0001",
        "slug": "tarot-the-tower",
        "name": "塔罗·塔",
        "obtain": "血池底部骨堆（力量-游泳 DC14 潜入）",
        "upright_cond": "在血池旁，将一件你自己亲手制作或至少持有超过 48 小时的物品高举过头，大声宣告「我献上此物」，然后丢入血池。物品必须是你珍视的（由你定义，黑白熊会判断是否合格）。",
        "upright_fx": "血池翻涌接受祭品。你获得 1d4+3 枚硬币。你下一次攻击额外造成 2d4 伤害。物品被永久销毁，但你在血池中看到了一个短暂的幻象——关于这座监狱的秘密。",
        "reversed_cond": "在锻造教室，将塔牌烧熔在铁砧上，然后将熔化的牌液淬入冷水中。喝下那杯水。",
        "reversed_fx": "你在体内建造了一座塔。你的生命值上限永久 +2。但你的 SAN 值上限永久 −2（从 10 降为 8）。这意味着你更容易被禁忌触发推到魔女化边缘，但身体更强韧。",
    },
    {
        "num": "17",
        "roman": "XVII",
        "en": "Star",
        "file": "RWS_Tarot_17_Star.jpg",
        "id": "whbtarotstar0001",
        "slug": "tarot-the-star",
        "name": "塔罗·星",
        "obtain": "阳台栏杆刻字旁（仅夜晚 21:00–4:00 可见）",
        "upright_cond": "在阳台，于晴朗的夜晚（天空可见星星），手持星牌指向天空中最亮的一颗星，说出一个你最想实现的愿望（必须是具体可实现的，不能是「所有人复活」这种）。",
        "upright_fx": "星光照亮了通往愿望的道路。黑白熊会告诉你为了实现这个愿望，你需要做的下一步行动（模糊但真实的方向指引）。你获得一次重骰机会（未来任意一次检定失败时使用，必须接受新结果）。",
        "reversed_cond": "在占星教室（必须处于黑暗状态），将星牌放在望远镜镜头上，观测任意一颗可见的星。观测 1 回合后，将星牌撕碎撒向空中。",
        "reversed_fx": "你看到了一颗正在死亡的星。你获得一个预言——接下来 7 天内，随机一名角色将遭遇一次致命的危机（由黑白熊在暗中标记，不公开）。你知道危机会发生但不知道是谁。如果你能在那次危机中救下那个人，你获得一次祈愿权——可以改写一条小规则（强度低于世界牌）。如果你没能救下，你的 SAN 值 −3。",
    },
    {
        "num": "18",
        "roman": "XVIII",
        "en": "Moon",
        "file": "RWS_Tarot_18_Moon.jpg",
        "id": "whbtarotmoon0001",
        "slug": "tarot-the-moon",
        "name": "塔罗·月",
        "obtain": "占星教室望远镜镜片盒夹层（智力-侦查 DC16 发现夹层）",
        "upright_cond": "在占星教室（必须处于黑暗状态），将月牌贴在望远镜镜片上，观测占星教室内的一面镜子或反光物体（不能直接看窗外）。观测 1 回合。",
        "upright_fx": "月光揭示了隐藏的事物。获知当前所有处于隐蔽状态的角色位置（楼层+房间）。接下来 24 小时内，你识破伪装和隐藏的检定 +4。此外，你获得一条关于「谁在暗中监视谁」的信息。",
        "reversed_cond": "在浴场（必须处于蒸汽弥漫状态），将月牌浸入水池中，然后在蒸汽中静坐 1 回合，闭眼不看任何东西。",
        "reversed_fx": "你放弃了视觉，获得了心眼。接下来 24 小时内，你处于盲目状态（攻击和侦查劣势），但你能感知到以你为中心半径 2 米内所有人的情绪状态（恐惧、愤怒、悲伤、平静、欺骗）。你无法看到他们是谁，但你知道他们的情绪是否真诚。24 小时后视力恢复。",
    },
    {
        "num": "19",
        "roman": "XIX",
        "en": "Sun",
        "file": "RWS_Tarot_19_Sun.jpg",
        "id": "whbtarotsun00001",
        "slug": "tarot-the-sun",
        "name": "塔罗·太阳",
        "obtain": "花房玻璃穹顶下方（仅正午 12:00–14:00 阳光直射时可见）",
        "upright_cond": "在花房，于正午阳光直射时，将太阳牌高举过头顶，大声宣告「太阳升起」。不需要其他人在场，但你必须做到声音足够大（由黑白熊判断是否合格）。",
        "upright_fx": "光芒四射。全场通报你的名字和「太阳已升起」。你身上所有由魔法造成的负面状态全部清除。同楼层所有角色污染值 −1，SAN 值 +1。你获得 3 枚硬币。此外，你身上会持续散发微光 24 小时（照亮黑暗房间，侦查劣势免疫）。",
        "reversed_cond": "在焚尸房，将太阳牌投入焚尸炉中焚烧，同时在炉火前静坐 1 回合，承受高温的炙烤。",
        "reversed_fx": "你在火焰中看到了自己的影子。你的污染值 +2。但焚尸炉的火焰净化了你身上的一件诅咒物品（如果你持有恶魔牌灰白版、或任何带有负面效果的道具，可以选择销毁一件）。如果你没有可净化的物品，改为获得 1d4 硬币。",
    },
    {
        "num": "20",
        "roman": "XX",
        "en": "Judgement",
        "file": "RWS_Tarot_20_Judgement.jpg",
        "id": "whbtarotjudg0001",
        "slug": "tarot-judgement",
        "name": "塔罗·审判",
        "obtain": "行刑区处刑座椅下方（力量-破坏 DC16 撬开固定在地面的座椅）",
        "upright_cond": "在行刑区，面对至少两名见证者（可以是任何角色），公开指认一名角色犯下的具体罪行。罪行必须是监狱内真实发生过的（包括入狱前的罪行也算，但必须有证据或你自己亲眼所见）。被指认者不需要在场。",
        "upright_fx": "审判成立。被指认者 SAN 值 −3，污染值 +3（如果不在场则在下次见面时生效，黑白熊会通知）。你获得 4 枚硬币。在场的见证者中，随机一人获得 1 枚硬币（作为见证费）。",
        "reversed_cond": "在行刑区，独自站在处刑座椅前，用审判牌作为镜子照自己的脸，然后坦白一个你从未向任何人透露过的罪行（必须是你真实做过的，入狱前入狱后都算）。",
        "reversed_fx": "你审判了自己。SAN 值 −2，污染值净化 3 点（罪恶感转化为实质的净化）。你的秘密被黑白熊记录在案。下次有人购买《某人的过去》情报时，你的这份秘密将作为随机附赠信息提供给购买者。",
    },
    {
        "num": "21",
        "roman": "XXI",
        "en": "World",
        "file": "RWS_Tarot_21_World.jpg",
        "id": "whbtarotwrld0001",
        "slug": "tarot-the-world",
        "name": "塔罗·世界",
        "obtain": "图书馆禁书区保险箱内（巧手 DC20 + 至少 5 张其他塔罗牌的触发记录；不需要是持有者本人触发，但必须有 5 张牌已经在这个游戏中碎裂）",
        "upright_cond": (
            "手持世界牌，完成朝圣之旅每一个地点，各停留至少 1 回合：<br>"
            "• B1：在行刑区，触摸处刑座椅<br>"
            "• 1F：在教堂，点燃一支蜡烛（从商店购买或自己制作）<br>"
            "• 2F：在占星教室，于黑暗中静坐<br>"
            "• 3F：在图书馆，读完一本书的完整一章（由黑白熊判断长度，通常是 1 回合）<br>"
            "• 任意：回到你第一次获得塔罗牌的地方，放下世界牌<br>"
            "完成所有地点后，回到图书馆禁书区，将世界牌放在保险箱上。"
        ),
        "upright_fx": "获得世界之愿——改写一条当前存在的规则（不可改变魔女审判根本规则），持续 72 小时。例如：「血池不再增加污染值」「商店价格减半」「某人的禁忌暂时无效」「地牢不再触发束缚禁忌」。由黑白熊最终裁定范围和强度。",
        "reversed_cond": "持有世界牌的状态下，在游戏的最后阶段（只剩 3 名或更少魔法少女存活时），将它撕成 22 片，撒向空中。",
        "reversed_fx": "世界碎裂，但碎片中藏着出口。你获得一次脱出机会——你可以选择立刻离开监狱，带着所有记忆回到现实世界。但你留下的所有人将继续游戏，且因为少了一人，剩下的魔法少女中随机一人 SAN 值 −2。如果你选择留下，逆位效果不触发，世界牌回到你手中（不碎裂，可再次尝试正位）。",
    },
]


def _http_get(url: str, timeout: int = 120) -> bytes:
    headers = {
        "User-Agent": "WangFoundryTarot/1.0 (local Foundry homebrew; contact: local-gm)",
        "Accept": "*/*",
    }
    last_err: Exception | None = None
    for attempt in range(8):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return resp.read()
        except urllib.error.HTTPError as err:
            last_err = err
            if err.code in (429, 503):
                wait = 8 + attempt * 6
                print(f"  rate-limited ({err.code}), wait {wait}s…")
                time.sleep(wait)
                continue
            raise
        except Exception as err:  # noqa: BLE001
            last_err = err
            time.sleep(3 + attempt)
    raise RuntimeError(f"failed to GET {url}: {last_err}")


def download_card(filename: str, dest: Path) -> None:
    if dest.exists() and dest.stat().st_size > 1000:
        return
    title = f"File:{filename}"
    api = (
        "https://commons.wikimedia.org/w/api.php?"
        + urllib.parse.urlencode(
            {
                "action": "query",
                "titles": title,
                "prop": "imageinfo",
                "iiprop": "url",
                "format": "json",
            }
        )
    )
    data = json.loads(_http_get(api, timeout=60).decode("utf-8"))
    pages = data["query"]["pages"]
    page = next(iter(pages.values()))
    url = page["imageinfo"][0]["url"]
    dest.write_bytes(_http_get(url, timeout=120))
    print(f"  downloaded {filename}")
    time.sleep(2.5)


def witchify(src: Path, dest: Path) -> None:
    """Dark magenta/crimson grade + vignette + gothic frame for witch aesthetic."""
    img = Image.open(src).convert("RGBA")
    # Normalize to portrait card-ish size
    w, h = img.size
    target_h = 1024
    target_w = int(w * target_h / h)
    img = img.resize((target_w, target_h), Image.Resampling.LANCZOS)

    base = img.convert("RGB")
    # Cool moonlight + violet cast
    r, g, b = base.split()
    r = r.point(lambda x: min(255, int(x * 0.72 + 28)))
    g = g.point(lambda x: min(255, int(x * 0.55 + 10)))
    b = b.point(lambda x: min(255, int(x * 0.95 + 40)))
    tinted = Image.merge("RGB", (r, g, b))
    tinted = ImageEnhance.Contrast(tinted).enhance(1.25)
    tinted = ImageEnhance.Color(tinted).enhance(1.15)
    tinted = ImageEnhance.Brightness(tinted).enhance(0.88)
    tinted = tinted.filter(ImageFilter.SMOOTH_MORE)

    # Soft crimson overlay
    overlay = Image.new("RGB", tinted.size, (90, 10, 45))
    tinted = Image.blend(tinted, overlay, 0.18)

    # Vignette
    vignette = Image.new("L", tinted.size, 0)
    draw = ImageDraw.Draw(vignette)
    margin_x, margin_y = int(target_w * 0.08), int(target_h * 0.08)
    draw.ellipse(
        [margin_x, margin_y, target_w - margin_x, target_h - margin_y],
        fill=255,
    )
    vignette = vignette.filter(ImageFilter.GaussianBlur(radius=80))
    dark = Image.new("RGB", tinted.size, (12, 4, 18))
    tinted = Image.composite(tinted, dark, vignette)

    # Outer gothic frame
    framed = ImageOps.expand(tinted, border=18, fill=(18, 6, 22))
    draw = ImageDraw.Draw(framed)
    fw, fh = framed.size
    draw.rectangle([6, 6, fw - 7, fh - 7], outline=(140, 50, 90), width=3)
    draw.rectangle([12, 12, fw - 13, fh - 13], outline=(70, 25, 55), width=1)

    framed.save(dest, "WEBP", quality=88, method=6)
    print(f"  witchified -> {dest.name}")


def html_desc(card: dict) -> str:
    return (
        f"<p><strong>{card['roman']} · {card['name'].replace('塔罗·', '')}</strong>"
        f"（{card['en']}）</p>\n"
        f"<p><strong>获取</strong>：{card['obtain']}</p>\n"
        f"<hr />\n"
        f"<p><strong>正位条件</strong></p>\n"
        f"<p>{card['upright_cond']}</p>\n"
        f"<p><strong>正位效果</strong></p>\n"
        f"<p>{card['upright_fx']}</p>\n"
        f"<hr />\n"
        f"<p><strong>逆位条件</strong></p>\n"
        f"<p>{card['reversed_cond']}</p>\n"
        f"<p><strong>逆位效果</strong></p>\n"
        f"<p>{card['reversed_fx']}</p>\n"
        f"<p><em>无自动化：由 GM 裁定触发与结算。触发后卡牌通常碎裂（个别效果另有说明）。</em></p>"
    )


def make_item(card: dict, img_path: str) -> dict:
    return {
        "_id": card["id"],
        "name": f"{card['roman']} · {card['name'].replace('塔罗·', '')}",
        "type": "equipment",
        "img": img_path,
        "system": {
            "description": {
                "value": html_desc(card),
                "gm": (
                    "<p>魔女审判自制大阿卡纳。仅描述效果，无 Rule Elements。"
                    "获取位置与正/逆位仪式需现场裁定。图片基于公有领域 Rider–Waite–Smith，"
                    "经魔女风色调处理。</p>"
                ),
            },
            "rules": [],
            "slug": card["slug"],
            "traits": {
                "value": ["magical"],
                "rarity": "rare",
                "otherTags": ["magical-girl-trial", "tarot-major"],
            },
            "publication": {
                "title": "魔女审判 — 大阿卡纳塔罗",
                "authors": "Wang",
                "license": "OGL",
                "remaster": False,
            },
            "level": {"value": 5},
            "quantity": 1,
            "baseItem": None,
            "bulk": {"value": 0},
            "hp": {"value": 0, "max": 0},
            "hardness": 0,
            "price": {"value": {"gp": 0}},
            "equipped": {"carryType": "held", "handsHeld": 1, "inSlot": False, "invested": None},
            "containerId": None,
            "size": "med",
            "material": {"type": None, "grade": None},
            "identification": {
                "status": "identified",
                "unidentified": {
                    "name": "神秘的塔罗牌",
                    "img": "",
                    "data": {"description": {"value": "<p>一张散发不祥魔力的卡牌。</p>"}},
                },
            },
            "usage": {"value": "held-in-one-hand"},
            "subitems": [],
        },
        "flags": {
            "wang-pf2e-homebrew": {
                "source": "magical-girl-trial-tarot",
                "arcana": card["roman"],
                "english": card["en"],
                "number": card["num"],
            }
        },
    }


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    RAW.mkdir(parents=True, exist_ok=True)
    SRC_ITEMS.mkdir(parents=True, exist_ok=True)

    print("Downloading & grading Major Arcana…")
    for card in CARDS:
        raw = RAW / card["file"]
        out = ASSETS / f"{card['num']}-{card['slug']}.webp"
        download_card(card["file"], raw)
        witchify(raw, out)
        item = make_item(card, f"modules/wang-pf2e-homebrew/assets/tarot-major/{out.name}")
        path = SRC_ITEMS / f"{card['id']}.json"
        path.write_text(json.dumps(item, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"  wrote {path.name}")

    print("Done:", len(CARDS), "cards")


if __name__ == "__main__":
    main()
