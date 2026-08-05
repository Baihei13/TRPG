#!/usr/bin/env python3
"""Emit 魔裁 shop items into src/packs/mocai and optional custom icons."""
from __future__ import annotations

import json
from pathlib import Path

MODULE_ROOT = Path(__file__).resolve().parents[1]
SRC = MODULE_ROOT / "src" / "packs" / "mocai"
ASSETS = MODULE_ROOT / "assets" / "mocai"

# Foundry core icon paths (resolve at runtime in VTT)
ITEMS = [
    {
        "id": "whbmcruleshop001",
        "name": "特殊校规 · 高价通报",
        "slug": "mocai-shop-broadcast-rule",
        "price_gp": 0,
        "tier": "校规",
        "img": "modules/wang-pf2e-homebrew/assets/mocai/mocai-school-rule.webp",
        "type": "equipment",
        "category_note": "商店特殊校规（非卖品，规则备忘）",
        "desc": (
            "<p><strong>特殊校规</strong></p>"
            "<p>在本商店中购买超过或等于 <strong>5 金币</strong>的物品时，将在 "
            "<strong>1 小时后</strong>进行全校通报。</p>"
            "<p><em>此条目为规则备忘，不可购买。</em></p>"
        ),
        "gm": "<p>GM 备忘用。购买 ≥5 金币商品后启动 1 小时延迟全校通报。</p>",
        "consumable": False,
    },
    # —— 10 ——
    {
        "id": "whbmcseedfraga01",
        "name": "悲叹之种的碎片 · 组件一",
        "slug": "mocai-lament-seed-fragment-1",
        "price_gp": 10,
        "tier": "终焉的安息",
        "img": "modules/wang-pf2e-homebrew/assets/mocai/mocai-seed-a.webp",
        "type": "equipment",
        "desc": (
            "<p><strong>价格</strong>：10 枚金币 · 【终焉的安息】组件</p>"
            "<p>传闻中集齐三个组件可开启？？仪式。仅此一件，售完即止。</p>"
            "<p><em>组件一 / 三（其余组件另行寻得）。</em></p>"
        ),
        "gm": "<p>悲叹之种仪式关键组件。限量 1。与组件二配套。</p>",
        "consumable": False,
        "limited": "仅此一件，售完即止",
    },
    {
        "id": "whbmcseedfragb01",
        "name": "悲叹之种的碎片 · 组件二",
        "slug": "mocai-lament-seed-fragment-2",
        "price_gp": 10,
        "tier": "终焉的安息",
        "img": "modules/wang-pf2e-homebrew/assets/mocai/mocai-seed-b.webp",
        "type": "equipment",
        "desc": (
            "<p><strong>价格</strong>：10 枚金币 · 【终焉的安息】组件</p>"
            "<p>传闻中集齐三个组件可开启？？仪式。仅此一件，售完即止。</p>"
            "<p><em>组件二 / 三（其余组件另行寻得）。</em></p>"
        ),
        "gm": "<p>悲叹之种仪式相关组件。限量 1。与组件一配套。</p>",
        "consumable": False,
        "limited": "仅此一件，售完即止",
    },
    # —— 7 ——
    {
        "id": "whbmcwitchtear01",
        "name": "魔女之泪",
        "slug": "mocai-witches-tear",
        "price_gp": 7,
        "tier": "命运扭转",
        "img": "modules/wang-pf2e-homebrew/assets/mocai/mocai-witch-tear.webp",
        "type": "consumable",
        "desc": (
            "<p><strong>价格</strong>：7 枚金币 · 命运扭转</p>"
            "<p>挂在 1F 教堂神坛上使用。24 小时内直接改写或者抹消一位魔法少女"
            "（包括自己）的一条精神禁忌。</p>"
            "<p><strong>购买限制</strong>：该道具只能使用单一角色身上持有的金币购买"
            "（不可凑钱/代付）。</p>"
        ),
        "gm": "<p>改写/抹消一条精神禁忌，持续窗口 24h。须个人金币支付。</p>",
        "consumable": True,
    },
    # —— 6 ——
    {
        "id": "whbmcabysstent01",
        "name": "深渊触手",
        "slug": "mocai-abyss-tentacle",
        "price_gp": 6,
        "tier": "强行介入",
        "img": "modules/wang-pf2e-homebrew/assets/mocai/mocai-abyss-tentacle.webp",
        "type": "consumable",
        "desc": (
            "<p><strong>价格</strong>：6 枚金币 · 强行介入</p>"
            "<p>强行夺走一个学生身上的指定物品，并在夺取时对其造成 "
            "<strong>1 点精神污染</strong>（扣除 1 点 SAN 值）。</p>"
            "<p>限定一件。</p>"
        ),
        "gm": "<p>强制夺取指定物品 + 目标 SAN−1。限量 1。</p>",
        "consumable": True,
        "limited": "限定一件",
    },
    # —— 5 ——
    {
        "id": "whbmcblindkey001",
        "name": "夜巡者的盲眼钥匙",
        "slug": "mocai-nightwatch-blind-key",
        "price_gp": 5,
        "tier": "控场与仪式前置",
        "img": "modules/wang-pf2e-homebrew/assets/mocai/mocai-blind-key.webp",
        "type": "equipment",
        "desc": (
            "<p><strong>价格</strong>：5 枚金币 · 控场与仪式前置</p>"
            "<p>任意一个指定房间的钥匙。</p>"
            "<p><em>购买 ≥5 金币：1 小时后全校通报（特殊校规）。</em></p>"
        ),
        "gm": "<p>指定任一房间钥匙。触发高价通报校规。</p>",
        "consumable": False,
    },
    {
        "id": "whbmcnightveil01",
        "name": "黑夜帷幕",
        "slug": "mocai-night-veil",
        "price_gp": 5,
        "tier": "控场与仪式前置",
        "img": "modules/wang-pf2e-homebrew/assets/mocai/mocai-night-veil.webp",
        "type": "consumable",
        "desc": (
            "<p><strong>价格</strong>：5 枚金币 · 控场与仪式前置</p>"
            "<p>关闭校内电力与常态光源 24 小时，但监控器和学校封锁等基础运行设施正常运行。"
            "除 2F 占星教室外，其余人在黑暗区域的战斗和侦查检定全部处于劣势。</p>"
            "<p>仅能使用一次。</p>"
            "<p><em>购买 ≥5 金币：1 小时后全校通报（特殊校规）。</em></p>"
        ),
        "gm": "<p>全校黑暗 24h；占星教室除外；战斗/侦查劣势。一次性。</p>",
        "consumable": True,
        "limited": "仅能使用一次",
    },
    {
        "id": "whbmcactappli001",
        "name": "活动申请书",
        "slug": "mocai-activity-application",
        "price_gp": 5,
        "tier": "控场与仪式前置",
        "img": "modules/wang-pf2e-homebrew/assets/mocai/mocai-activity-form.webp",
        "type": "consumable",
        "desc": (
            "<p><strong>价格</strong>：5 枚金币 · 控场与仪式前置</p>"
            "<p>申请一项【校内活动】（如在 1F 审判间开启全员强制参加、期间禁止暴力的弥撒活动）。</p>"
            "<p><em>购买 ≥5 金币：1 小时后全校通报（特殊校规）。</em></p>"
        ),
        "gm": "<p>自定义校内活动；具体规则由黑白熊裁定。</p>",
        "consumable": True,
    },
    {
        "id": "whbmcsecretarc01",
        "name": "秘密情报档案",
        "slug": "mocai-secret-intel-file",
        "price_gp": 5,
        "tier": "控场与仪式前置",
        "img": "modules/wang-pf2e-homebrew/assets/mocai/mocai-secret-file.webp",
        "type": "consumable",
        "desc": (
            "<p><strong>价格</strong>：5 枚金币 · 控场与仪式前置</p>"
            "<p>你得知关于某个学生的随机一条隐藏线索或其贩卖给商店的情报。</p>"
            "<p><em>购买 ≥5 金币：1 小时后全校通报（特殊校规）。</em></p>"
        ),
        "gm": "<p>随机隐藏线索，或该生卖给商店的情报条目。</p>",
        "consumable": True,
    },
    # —— 4 ——
    {
        "id": "whbmccausenee001",
        "name": "因果逆转刺针",
        "slug": "mocai-causality-needle",
        "price_gp": 4,
        "tier": "禁忌陷阱与防身",
        "img": "modules/wang-pf2e-homebrew/assets/mocai/mocai-causality-needle.webp",
        "type": "consumable",
        "desc": (
            "<p><strong>价格</strong>：4 枚金币 · 禁忌陷阱与防身</p>"
            "<p>一个圆形干扰器，可安置于任何附带电力或门把箱柜上。"
            "对第一个碰到该物品的角色造成 <strong>1d8+3</strong> 点物理伤害，"
            "并因看到恐怖景象立刻扣除 <strong>2 点 SAN</strong>。</p>"
        ),
        "gm": "<p>陷阱：首触者 1d8+3 物理 + SAN−2。</p>",
        "consumable": True,
    },
    {
        "id": "whbmcechocam0001",
        "name": "灵魂回响摄影机",
        "slug": "mocai-soul-echo-camera",
        "price_gp": 4,
        "tier": "禁忌陷阱与防身",
        "img": "modules/wang-pf2e-homebrew/assets/mocai/mocai-soul-camera.webp",
        "type": "consumable",
        "desc": (
            "<p><strong>价格</strong>：4 枚金币 · 禁忌陷阱与防身</p>"
            "<p>安置于门、柜、箱附近，当物件被打开时自动拍下一张照片。"
            "可设定是否使用灵体闪光：使用闪光灯必定会被发现，且被拍到的角色在接下来 "
            "1 小时内 AC（防御）−2。拍下一张照片后失效。</p>"
        ),
        "gm": "<p>开门触发拍照；闪光必被发现 + 目标 1h AC−2；拍一次失效。</p>",
        "consumable": True,
    },
    {
        "id": "whbmcweakness001",
        "name": "弱点调查",
        "slug": "mocai-weakness-probe",
        "price_gp": 4,
        "tier": "禁忌陷阱与防身",
        "img": "modules/wang-pf2e-homebrew/assets/mocai/mocai-weakness.webp",
        "type": "consumable",
        "desc": (
            "<p><strong>价格</strong>：4 枚金币 · 禁忌陷阱与防身</p>"
            "<p>知晓一个学生的禁忌。</p>"
        ),
        "gm": "<p>向买家揭示指定学生完整禁忌内容。</p>",
        "consumable": True,
    },
    {
        "id": "whbmcsilenthorn1",
        "name": "审判静默号角",
        "slug": "mocai-silent-judgment-horn",
        "price_gp": 4,
        "tier": "禁忌陷阱与防身",
        "img": "modules/wang-pf2e-homebrew/assets/mocai/mocai-silent-horn.webp",
        "type": "consumable",
        "desc": (
            "<p><strong>价格</strong>：4 枚金币 · 禁忌陷阱与防身</p>"
            "<p>持续 6 小时。持续时间内黑白熊除时间广播及尸体发现广播外不会通报其他任何事宜"
            "（如重伤消息）。</p>"
            "<p>限定 2 件，不会刷新。</p>"
        ),
        "gm": "<p>静默 6h；仅保留时间/尸体广播。限量 2，不刷新。</p>",
        "consumable": True,
        "limited": "限定 2 件，不会刷新",
    },
    # —— 3 ——
    {
        "id": "whbmcsleeppill01",
        "name": "安眠药",
        "slug": "mocai-sleeping-pills",
        "price_gp": 3,
        "tier": "恢复与功能道具",
        "img": "modules/wang-pf2e-homebrew/assets/mocai/mocai-sleep-pills.webp",
        "type": "consumable",
        "desc": (
            "<p><strong>价格</strong>：3 枚金币 · 恢复与功能道具</p>"
            "<p>服用后陷入 6 小时睡眠，醒来时恢复 <strong>4 点 HP</strong> 与 "
            "<strong>3 点 SAN</strong>。</p>"
        ),
        "gm": "<p>强制睡眠 6h；醒后 HP+4、SAN+3。</p>",
        "consumable": True,
    },
    {
        "id": "whbmcholywater01",
        "name": "圣水喷雾",
        "slug": "mocai-holy-water-spray",
        "price_gp": 3,
        "tier": "恢复与功能道具",
        "img": "modules/wang-pf2e-homebrew/assets/mocai/mocai-holy-spray.webp",
        "type": "consumable",
        "desc": (
            "<p><strong>价格</strong>：3 枚金币 · 恢复与功能道具</p>"
            "<p>进行一个命中检定，命中后使对方失明一小时。"
            "若目标为魔女化怪物，使其在 3 回合内无法移动。</p>"
        ),
        "gm": "<p>命中→失明 1h；对魔女化怪物另附加 3 回合无法移动。</p>",
        "consumable": True,
    },
    {
        "id": "whbmcincinerat01",
        "name": "焚烧炉使用权",
        "slug": "mocai-incinerator-pass",
        "price_gp": 3,
        "tier": "恢复与功能道具",
        "img": "modules/wang-pf2e-homebrew/assets/mocai/mocai-incinerator.webp",
        "type": "consumable",
        "desc": (
            "<p><strong>价格</strong>：3 枚金币 · 恢复与功能道具</p>"
            "<p>将一件物品送入 B1 焚烧炉彻底销毁，但垃圾处理器/炉体本身不会消失。</p>"
        ),
        "gm": "<p>销毁一件物品；炉体保留。</p>",
        "consumable": True,
    },
    {
        "id": "whbmcprocure0001",
        "name": "采购会议申请函",
        "slug": "mocai-procurement-meeting",
        "price_gp": 3,
        "tier": "恢复与功能道具",
        "img": "modules/wang-pf2e-homebrew/assets/mocai/mocai-procurement.webp",
        "type": "consumable",
        "desc": (
            "<p><strong>价格</strong>：3 枚金币 · 恢复与功能道具</p>"
            "<p>发起一次采购会议：每个人秘密提出一件商品或服务接着秘密投票，"
            "获得最多票数的商品将加入小卖部，价格由黑白熊决定。</p>"
        ),
        "gm": "<p>全体秘密提案+投票；最高票商品上架，价格由 GM/黑白熊定。</p>",
        "consumable": True,
    },
    {
        "id": "whbmcfriendprf01",
        "name": "友谊证明",
        "slug": "mocai-proof-of-friendship",
        "price_gp": 3,
        "tier": "恢复与功能道具",
        "img": "modules/wang-pf2e-homebrew/assets/mocai/mocai-friendship.webp",
        "type": "equipment",
        "desc": (
            "<p><strong>价格</strong>：3 枚金币 · 恢复与功能道具</p>"
            "<p>可以在他人的牢房里过夜。</p>"
        ),
        "gm": "<p>允许在指定他人牢房过夜（仍受其他校规约束）。</p>",
        "consumable": False,
    },
    {
        "id": "whbmcmagnifier01",
        "name": "放大镜",
        "slug": "mocai-magnifier",
        "price_gp": 3,
        "tier": "恢复与功能道具",
        "img": "modules/wang-pf2e-homebrew/assets/mocai/mocai-magnifier.webp",
        "type": "equipment",
        "desc": (
            "<p><strong>价格</strong>：3 枚金币 · 恢复与功能道具</p>"
            "<p>查看一条线索是否为虚假线索。</p>"
            "<p>限 2 件。</p>"
        ),
        "gm": "<p>鉴定线索真伪。限量 2。</p>",
        "consumable": False,
        "limited": "限 2 件",
    },
    # —— 2 ——
    {
        "id": "whbmcfactorac001",
        "name": "魔女因子的活性剂",
        "slug": "mocai-witch-factor-activator",
        "price_gp": 2,
        "tier": "等价交换",
        "img": "modules/wang-pf2e-homebrew/assets/mocai/mocai-factor-activator.webp",
        "type": "consumable",
        "desc": (
            "<p><strong>价格</strong>：2 枚金币 · 等价交换</p>"
            "<p>饮用后立刻回满全部 MP。但代价是体内因子暴走："
            "在接下来的一天内，触发精神禁忌时受到的 SAN 值扣除翻倍；"
            "初始 SAN 值上限永久 −2。</p>"
        ),
        "gm": "<p>MP 回满；24h 禁忌 SAN 扣翻倍；SAN 上限永久−2。</p>",
        "consumable": True,
    },
    {
        "id": "whbmcbloodvial01",
        "name": "诅咒的血瓶",
        "slug": "mocai-cursed-blood-vial",
        "price_gp": 2,
        "tier": "等价交换",
        "img": "modules/wang-pf2e-homebrew/assets/mocai/mocai-blood-vial.webp",
        "type": "consumable",
        "desc": (
            "<p><strong>价格</strong>：2 枚金币 · 等价交换</p>"
            "<p>服用/触碰/吸入后立刻恢复 <strong>4 点 HP</strong>，"
            "但接下来的两个回合内，AC（防御）下降 2 点。</p>"
            "<p>（或在特定配方下作为造成 <strong>1d8+5</strong> 点伤害的毒药使用。）</p>"
        ),
        "gm": "<p>治疗 4 HP + 2 回合 AC−2；或作毒药 1d8+5。</p>",
        "consumable": True,
    },
    {
        "id": "whbmcsealroom001",
        "name": "禁闭室封条",
        "slug": "mocai-detention-seal",
        "price_gp": 2,
        "tier": "等价交换",
        "img": "modules/wang-pf2e-homebrew/assets/mocai/mocai-detention-seal.webp",
        "type": "consumable",
        "desc": (
            "<p><strong>价格</strong>：2 枚金币 · 等价交换</p>"
            "<p>使指定的一个房间被封锁，任何人无法进出；"
            "若因此而违反某些校规不会受到警告。6 小时后解除。</p>"
        ),
        "gm": "<p>封锁一房间 6h；因封锁导致的校规违规免警告。</p>",
        "consumable": True,
    },
    {
        "id": "whbmcinsulglov01",
        "name": "绝缘手套",
        "slug": "mocai-insulated-gloves",
        "price_gp": 2,
        "tier": "等价交换",
        "img": "modules/wang-pf2e-homebrew/assets/mocai/mocai-insul-gloves.webp",
        "type": "equipment",
        "desc": (
            "<p><strong>价格</strong>：2 枚金币 · 等价交换</p>"
            "<p>一副隔绝电流的手套。</p>"
        ),
        "gm": "<p>防护电击/电流相关危害（具体由场景裁定）。</p>",
        "consumable": False,
        "usage": "worn",
    },
    {
        "id": "whbmcfireglove01",
        "name": "抗火手套",
        "slug": "mocai-fireproof-gloves",
        "price_gp": 2,
        "tier": "等价交换",
        "img": "modules/wang-pf2e-homebrew/assets/mocai/mocai-fire-gloves.webp",
        "type": "equipment",
        "desc": (
            "<p><strong>价格</strong>：2 枚金币 · 等价交换</p>"
            "<p>一副隔绝火焰的手套。</p>"
        ),
        "gm": "<p>防护接触火焰/高温（具体由场景裁定）。</p>",
        "consumable": False,
        "usage": "worn",
    },
    {
        "id": "whbmcfalseclue01",
        "name": "虚假线索",
        "slug": "mocai-false-clue",
        "price_gp": 2,
        "tier": "等价交换",
        "img": "modules/wang-pf2e-homebrew/assets/mocai/mocai-false-clue.webp",
        "type": "consumable",
        "desc": (
            "<p><strong>价格</strong>：2 枚金币 · 等价交换</p>"
            "<p>添加一条虚假线索。</p>"
        ),
        "gm": "<p>向线索池投入一条伪证/假线索，由买家描述、GM 审核。</p>",
        "consumable": True,
    },
    {
        "id": "whbmcfatedisc001",
        "name": "命运揭示",
        "slug": "mocai-fate-reveal",
        "price_gp": 2,
        "tier": "等价交换",
        "img": "modules/wang-pf2e-homebrew/assets/mocai/mocai-fate-reveal.webp",
        "type": "consumable",
        "desc": (
            "<p><strong>价格</strong>：2 枚金币 · 等价交换</p>"
            "<p>随机揭示一个未被持有的塔罗牌的所在。</p>"
        ),
        "gm": "<p>从未持有大阿卡纳中随机一张，告知其获取地点。</p>",
        "consumable": True,
    },
    # —— 1 ——
    {
        "id": "whbmclastfeast01",
        "name": "最后的奢华圣餐",
        "slug": "mocai-last-luxury-feast",
        "price_gp": 1,
        "tier": "基础补给",
        "img": "modules/wang-pf2e-homebrew/assets/mocai/mocai-last-feast.webp",
        "type": "consumable",
        "desc": (
            "<p><strong>价格</strong>：1 枚金币 · 基础补给</p>"
            "<p>预定一餐由黑白熊准备的大餐：开始时间、送达地点由你决定，"
            "可决定是否通报其他人。</p>"
            "<p>本回合内所有检定获得优势。</p>"
        ),
        "gm": "<p>可安排时间/地点/是否广播；食用当回合全检定优势。</p>",
        "consumable": True,
    },
    {
        "id": "whbmcfashion0001",
        "name": "时尚服饰",
        "slug": "mocai-fashionable-attire",
        "price_gp": 1,
        "tier": "基础补给",
        "img": "modules/wang-pf2e-homebrew/assets/mocai/mocai-fashion.webp",
        "type": "equipment",
        "desc": (
            "<p><strong>价格</strong>：1 枚金币 · 基础补给</p>"
            "<p>选择一套自选的服饰。</p>"
        ),
        "gm": "<p>外观换装；无默认机械效果，除非场景另定。</p>",
        "consumable": False,
        "usage": "worn",
    },
]


def make_item(card: dict) -> dict:
    price = int(card["price_gp"])
    limited = card.get("limited")
    limited_html = f"<p><strong>库存</strong>：{limited}</p>" if limited else ""
    broadcast = (
        "<p><em>⚠ 特殊校规：购买 ≥5 金币物品将在 1 小时后全校通报。</em></p>"
        if price >= 5
        else ""
    )

    value = (
        f"<p><strong>【魔裁商店】{card['tier']}</strong></p>\n"
        f"{card['desc']}\n"
        f"{limited_html}"
        f"{broadcast}"
        f"<p><em>无自动化：由 GM / 黑白熊裁定。</em></p>"
    )

    if card.get("consumable"):
        system = {
            "description": {"value": value, "gm": card.get("gm", "")},
            "rules": [],
            "slug": card["slug"],
            "traits": {
                "value": ["consumable", "magical"] if price > 0 else ["consumable"],
                "rarity": "rare" if price >= 5 else "uncommon",
                "otherTags": ["magical-girl-trial", "mocai-shop"],
            },
            "publication": {
                "title": "魔裁 — 黑白熊商店",
                "authors": "Wang",
                "license": "OGL",
                "remaster": False,
            },
            "level": {"value": max(1, min(10, price))},
            "quantity": 1,
            "baseItem": None,
            "bulk": {"value": 0.1 if price else 0},
            "category": "other",
            "uses": {"value": 1, "max": 1, "autoDestroy": True},
            "damage": None,
            "usage": {"value": "held-in-one-hand"},
            "price": {"value": {"gp": price}},
        }
        item_type = "consumable"
    else:
        usage = card.get("usage", "held-in-one-hand")
        system = {
            "description": {"value": value, "gm": card.get("gm", "")},
            "rules": [],
            "slug": card["slug"],
            "traits": {
                "value": ["magical"] if price > 0 else [],
                "rarity": "rare" if price >= 5 else ("unique" if price == 0 else "uncommon"),
                "otherTags": ["magical-girl-trial", "mocai-shop"],
            },
            "publication": {
                "title": "魔裁 — 黑白熊商店",
                "authors": "Wang",
                "license": "OGL",
                "remaster": False,
            },
            "level": {"value": max(0, min(10, price))},
            "quantity": 1,
            "baseItem": None,
            "bulk": {"value": 0},
            "hp": {"value": 0, "max": 0},
            "hardness": 0,
            "price": {"value": {"gp": price}},
            "equipped": {
                "carryType": "worn" if usage == "worn" else "held",
                "handsHeld": 0 if usage == "worn" else 1,
                "inSlot": False,
                "invested": None,
            },
            "containerId": None,
            "size": "med",
            "material": {"type": None, "grade": None},
            "identification": {
                "status": "identified",
                "unidentified": {
                    "name": "神秘的商店货物",
                    "img": "",
                    "data": {"description": {"value": "<p>黑白熊商店货架上的一件商品。</p>"}},
                },
            },
            "usage": {"value": usage},
            "subitems": [],
        }
        item_type = "equipment"

    return {
        "_id": card["id"],
        "name": card["name"],
        "type": item_type,
        "img": card["img"],
        "system": system,
        "flags": {
            "wang-pf2e-homebrew": {
                "source": "mocai-shop",
                "priceCoins": price,
                "tier": card["tier"],
            }
        },
    }


def main() -> None:
    SRC.mkdir(parents=True, exist_ok=True)
    ASSETS.mkdir(parents=True, exist_ok=True)

    seen = set()
    for card in ITEMS:
        assert len(card["id"]) == 16, (card["id"], len(card["id"]))
        assert card["id"] not in seen, card["id"]
        seen.add(card["id"])
        doc = make_item(card)
        path = SRC / f"{card['id']}.json"
        path.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("wrote", path.name, "←", card["name"])

    print("Done:", len(ITEMS), "items")


if __name__ == "__main__":
    main()
