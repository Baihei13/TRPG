"""Generate PF2e NPC JSON for wang-pf2e-homebrew (level 1 module scale)."""
import json
import os
import random
import string

OUT = os.path.join(
    os.path.dirname(__file__),
    "..",
    "src",
    "packs",
    "homebrew-actors",
)
ITEMS_SRC = os.path.join(
    os.path.dirname(__file__),
    "..",
    "src",
    "packs",
    "homebrew-items",
)
PUB = {
    "title": "再见教父 — 圣卡琳娜的大秘仪 II 期 · IV 皇帝",
    "authors": "叉烧饭加蛋",
    "license": "OGL",
    "remaster": False,
}
PUB_REMNANT = {
    "title": "遗迹2 — PF2e 自制转换",
    "authors": "Wang",
    "license": "OGL",
    "remaster": False,
}
FLAG = {"wang-pf2e-homebrew": {"source": "goodbye-godfather-iv-emperor"}}
FLAG_REMNANT = {"wang-pf2e-homebrew": {"source": "remnant2-nightweaver"}}
FOLDERS = {
    "mafia": "whbfolderMafia01",
    "npc": "whbfolderNpc0001",
    "monster": "whbfolderMonst01",
    "remnant": "whbfolderRemnt01",
}


def rand_id():
    chars = string.ascii_letters + string.digits
    return "".join(random.choice(chars) for _ in range(16))


def melee(
    name,
    bonus,
    damage,
    dtype="bludgeoning",
    traits=None,
    slug=None,
    linked=None,
    sort=100000,
    extra_damage=None,
    attack_effects=None,
    description="",
):
    iid = rand_id()
    damage_rolls = {rand_id(): {"damage": damage, "damageType": dtype}}
    for edmg, etype in extra_damage or []:
        damage_rolls[rand_id()] = {"damage": edmg, "damageType": etype}
    item = {
        "_id": iid,
        "img": "systems/pf2e/icons/default-icons/melee.svg",
        "name": name,
        "sort": sort,
        "system": {
            "action": {"value": ""},
            "attackEffects": {"custom": "", "value": attack_effects or []},
            "bonus": {"value": bonus},
            "damageRolls": damage_rolls,
            "description": {"value": description},
            "publication": {"license": "OGL", "remaster": False, "title": ""},
            "range": None,
            "rules": [],
            "slug": slug,
            "traits": {"value": traits or []},
        },
        "type": "melee",
    }
    if linked:
        item["flags"] = {"pf2e": {"linkedWeapon": linked}}
    return item


def ranged(name, bonus, damage, range_inc=30, dtype="piercing", traits=None, sort=200000):
    return {
        "_id": rand_id(),
        "img": "systems/pf2e/icons/default-icons/melee.svg",
        "name": name,
        "sort": sort,
        "system": {
            "action": {"value": ""},
            "attackEffects": {"custom": "", "value": []},
            "bonus": {"value": bonus},
            "damageRolls": {rand_id(): {"damage": damage, "damageType": dtype}},
            "description": {"value": ""},
            "publication": {"license": "OGL", "remaster": False, "title": ""},
            "range": {"increment": range_inc, "max": range_inc * 6},
            "rules": [],
            "slug": None,
            "traits": {"value": traits or ["range-increment-30"]},
        },
        "type": "melee",
    }


def action_passive(name, desc, sort=500000):
    return {
        "_id": rand_id(),
        "img": "systems/pf2e/icons/actions/Passive.webp",
        "name": name,
        "sort": sort,
        "system": {
            "actionType": {"value": "passive"},
            "actions": {"value": None},
            "category": "offensive",
            "description": {"value": desc},
            "publication": PUB,
            "rules": [],
            "slug": None,
            "traits": {"value": []},
        },
        "type": "action",
    }


def action_ability(name, actions, desc, category="offensive", sort=600000, publication=None, traits=None):
    glyphs = {1: "OneAction", 2: "TwoActions", 3: "ThreeActions"}
    glyph = glyphs.get(actions, "OneAction")
    return {
        "_id": rand_id(),
        "img": f"systems/pf2e/icons/actions/{glyph}.webp",
        "name": name,
        "sort": sort,
        "system": {
            "actionType": {"value": "action" if actions else "free"},
            "actions": {"value": actions},
            "category": category,
            "description": {"value": desc},
            "publication": publication or PUB,
            "rules": [],
            "slug": None,
            "traits": {"value": traits or []},
        },
        "type": "action",
    }


def action_reaction(name, desc, category="defensive", sort=700000, publication=None):
    return {
        "_id": rand_id(),
        "img": "systems/pf2e/icons/actions/Reaction.webp",
        "name": name,
        "sort": sort,
        "system": {
            "actionType": {"value": "reaction"},
            "actions": {"value": None},
            "category": category,
            "description": {"value": desc},
            "publication": publication or PUB,
            "rules": [],
            "slug": None,
            "traits": {"value": []},
        },
        "type": "action",
    }


def action_passive_pub(name, desc, sort=500000, publication=None, category="defensive"):
    item = action_passive(name, desc, sort=sort)
    item["system"]["publication"] = publication or PUB
    item["system"]["category"] = category
    return item


def embed_item(filename, equipped_overrides=None, sort=400000):
    """Embed a homebrew item JSON (new _id) onto an NPC."""
    path = os.path.join(ITEMS_SRC, filename)
    with open(path, encoding="utf-8") as f:
        item = json.load(f)
    item["_id"] = rand_id()
    item["sort"] = sort
    if equipped_overrides:
        item["system"]["equipped"].update(equipped_overrides)
    return item


def prototype_token(name, img, disposition=-1):
    """Foundry v14-compatible prototype token (depth etc. required)."""
    return {
        "name": name,
        "width": 1,
        "height": 1,
        "depth": 0,
        "texture": {"src": img, "scaleX": 1, "scaleY": 1},
        "disposition": disposition,
        "displayBars": 40,
        "bar1": {"attribute": "attributes.hp"},
        "sight": {
            "enabled": True,
            "range": 0,
            "angle": 360,
            "visionMode": "basic",
            "color": None,
            "attenuation": 0.1,
            "brightness": 0,
            "saturation": 0,
            "contrast": 0,
        },
        "flags": {
            "pf2e": {
                "linkToActorSize": True,
                "autoscale": True,
            }
        },
        "actorLink": False,
    }


def leather_armor(equipped=True, sort=300000):
    return {
        "_id": rand_id(),
        "img": "icons/equipment/chest/breastplate-layered-leather-brown.webp",
        "name": "皮夹克",
        "sort": sort,
        "system": {
            "acBonus": 1,
            "baseItem": "leather-armor",
            "bulk": {"value": 1},
            "category": "light",
            "checkPenalty": -1,
            "containerId": None,
            "description": {"value": "<p>1920 年代黑帮常见的皮夹克，略能挡子弹。</p>"},
            "dexCap": 4,
            "equipped": {
                "carryType": "worn",
                "handsHeld": 0,
                "inSlot": equipped,
                "invested": None,
            },
            "group": "leather",
            "hardness": 0,
            "hp": {"max": 0, "value": 0},
            "level": {"value": 0},
            "material": {"grade": None, "type": None},
            "price": {"value": {}},
            "publication": PUB,
            "quantity": 1,
            "rules": [],
            "runes": {"potency": 0, "property": [], "resilient": 0},
            "size": "med",
            "slug": "leather-armor",
            "speedPenalty": 0,
            "strength": 0,
            "traits": {"rarity": "common", "value": []},
        },
        "type": "armor",
    }


def npc(
    _id,
    name,
    level,
    ac,
    hp,
    perception,
    saves,
    abilities,
    skills,
    items,
    notes,
    folder,
    traits=None,
    speed=25,
    img="systems/pf2e/icons/default-icons/npc.svg",
    blurb="",
    size="med",
    rarity="common",
    other_speeds=None,
    senses=None,
    languages=None,
    language_details="",
    ac_details="",
    hp_details="",
    perception_details="",
    publication=None,
    flags=None,
    token_width=1,
    token_height=1,
    immunities=None,
    weaknesses=None,
):
    token = prototype_token(name, img)
    token["width"] = token_width
    token["height"] = token_height
    attributes = {
        "ac": {"details": ac_details, "value": ac},
        "allSaves": {"value": ""},
        "hp": {"details": hp_details, "max": hp, "temp": 0, "value": hp},
        "speed": {"otherSpeeds": other_speeds or [], "value": speed},
    }
    if immunities:
        attributes["immunities"] = [{"type": t} for t in immunities]
    if weaknesses:
        attributes["weaknesses"] = [{"type": t, "value": v} for t, v in weaknesses]
    return {
        "_id": _id,
        "folder": folder,
        "name": name,
        "type": "npc",
        "img": img,
        "items": items,
        "effects": [],
        "system": {
            "abilities": {k: {"mod": v} for k, v in abilities.items()},
            "attributes": attributes,
            "details": {
                "blurb": blurb,
                "languages": {
                    "details": language_details,
                    "value": languages if languages is not None else ["common"],
                },
                "level": {"value": level},
                "privateNotes": "",
                "publicNotes": notes,
                "publication": publication or PUB,
            },
            "initiative": {"statistic": "perception"},
            "perception": {
                "details": perception_details,
                "mod": perception,
                "senses": senses or [],
            },
            "resources": {},
            "saves": {
                "fortitude": {"saveDetail": "", "value": saves[0]},
                "reflex": {"saveDetail": "", "value": saves[1]},
                "will": {"saveDetail": "", "value": saves[2]},
            },
            "skills": {k: {"base": v} for k, v in skills.items()},
            "traits": {
                "rarity": rarity,
                "size": {"value": size},
                "value": traits or ["human", "humanoid"],
            },
        },
        "prototypeToken": token,
        "ownership": {"default": 2},
        "flags": flags if flags is not None else FLAG,
    }


def build_all():
    os.makedirs(OUT, exist_ok=True)

    actors = []

    # --- 黑手帮杂兵 level -1 ---
    actors.append(
        npc(
            "whbMafThug000001",
            "西西里帮杂兵",
            -1,
            14,
            8,
            3,
            (5, 5, 3),
            {"str": 2, "dex": 1, "con": 1, "int": 0, "wis": 0, "cha": 0},
            {"athletics": 4, "intimidation": 3},
            [
                leather_armor(),
                melee("拳头", 5, "1d4+1", "bludgeoning", ["agile", "nonlethal", "unarmed"]),
                ranged("左轮手枪", 5, "1d6", 20, "piercing", ["range-increment-20"]),
            ],
            "<p>卡亨家族或敌对帮派的普通打手。适合成组出现（建议 3–4 名对付 4 名 1 级 PC）。</p><p><em>COC 黑帮打手弱化版。</em></p>",
            FOLDERS["mafia"],
            blurb="黑手帮杂兵",
            img="icons/equipment/head/hood-cloth-red.webp",
        )
    )

    # --- 精英打手 level 1 ---
    actors.append(
        npc(
            "whbMafElite00001",
            "西西里帮精英打手",
            1,
            16,
            20,
            5,
            (7, 7, 5),
            {"str": 3, "dex": 2, "con": 2, "int": 0, "wis": 1, "cha": 1},
            {"athletics": 7, "intimidation": 6, "stealth": 5},
            [
                leather_armor(),
                melee("铜指虎", 7, "1d4+3", "bludgeoning", ["agile"]),
                ranged("汤姆逊冲锋枪", 7, "1d6+2", 30, "piercing", ["range-increment-30"]),
                action_ability(
                    "压制射击",
                    2,
                    "<p>对 30 尺内一个 10 尺区域进行扫射，区域内每个生物受到 @Damage[(1d6+2)[piercing]] 伤害（基础反射 DC 17）。</p>",
                ),
            ],
            "<p>帮派老兵或小头目，负责安保与火并。比杂兵更耐打，仍适合 1 级团。</p>",
            FOLDERS["mafia"],
            blurb="精英打手",
            img="icons/equipment/head/hood-cloth-black.webp",
        )
    )

    # --- 枪手 level 0 ---
    actors.append(
        npc(
            "whbMafShota00001",
            "帮派枪手",
            0,
            15,
            14,
            6,
            (6, 8, 4),
            {"str": 1, "dex": 3, "con": 1, "int": 0, "wis": 1, "cha": 0},
            {"acrobatics": 6, "stealth": 7},
            [
                leather_armor(),
                ranged("手枪", 7, "1d6+1", 30),
                melee("匕首", 6, "1d4+1", "piercing", ["agile", "versatile-s"]),
            ],
            "<p>专精射击的帮派成员，近战较弱。适合远程骚扰。</p>",
            FOLDERS["mafia"],
            img="icons/weapons/guns/gun-pistol-flintlock-metal.webp",
        )
    )

    # --- 卡亨家族保镖 level 1 ---
    actors.append(
        npc(
            "whbMafVet0000001",
            "卡亨家族保镖",
            1,
            17,
            22,
            5,
            (8, 6, 5),
            {"str": 3, "dex": 1, "con": 2, "int": 0, "wis": 2, "cha": 1},
            {"athletics": 8, "intimidation": 7},
            [
                leather_armor(),
                melee("重拳", 8, "1d6+3", "bludgeoning"),
                action_passive(
                    "戒指庇护",
                    "<p>当与李奥纳多·卡亨相距 10 尺以内时，AC 获得 +1 状态加值（已计入较高 AC 时由 GM 忽略）。</p>",
                ),
            ],
            "<p>李奥纳多或安东尼奥的贴身护卫。葬礼火并场景可用。</p>",
            FOLDERS["mafia"],
            img="icons/equipment/shoulder/epaulet-white-gold.webp",
        )
    )

    # --- 李奥纳多 level 2 ---
    actors.append(
        npc(
            "whbLeonardo00001",
            "李奥纳多·卡亨",
            2,
            17,
            28,
            6,
            (7, 6, 8),
            {"str": 1, "dex": 1, "con": 1, "int": 2, "wis": 0, "cha": 3},
            {"deception": 8, "diplomacy": 9, "intimidation": 7, "society": 8},
            [
                embed_item(
                    "whbEmperorCoc001.json",
                    {"carryType": "worn", "inSlot": True, "invested": None},
                    sort=100000,
                ),
                melee("拳头", 7, "1d4+1", "bludgeoning", ["agile", "nonlethal", "unarmed"]),
                ranged("手枪", 6, "1d6", 20),
                action_ability(
                    "权威呵斥",
                    1,
                    "<p>30 尺内一名生物尝试 @UUID[Compendium.pf2e.conditionitems.Item.TBSHQspnbcqxsmjL]{惊惧} 豁免 DC 18；失败则惊惧 1。</p>",
                    category="offensive",
                ),
            ],
            "<p><strong>新教父继承人</strong>，野心勃勃，佩戴衰退中的皇帝权戒。战斗非其强项；建议以社交、追逐与帮派冲突为主，而非硬碰。</p>",
            FOLDERS["npc"],
            blurb="新教父",
            img="icons/equipment/head/hat-top-hat-grey.webp",
        )
    )

    # --- 安东尼奥 level 2 ---
    actors.append(
        npc(
            "whbAntonio000001",
            "安东尼奥·卡亨",
            2,
            18,
            30,
            7,
            (9, 8, 6),
            {"str": 3, "dex": 2, "con": 2, "int": 1, "wis": 2, "cha": 1},
            {"athletics": 9, "intimidation": 8, "stealth": 7},
            [
                leather_armor(),
                melee("重拳", 9, "1d6+4", "bludgeoning"),
                ranged("手枪", 8, "1d6+1", 20),
                action_ability(
                    "家族荣耀",
                    1,
                    "<p>对一名刚伤害其盟友的敌人，下一次打击获得 +2 状态加值。</p>",
                ),
            ],
            "<p>教父幼子，传统西西里价值观的捍卫者。模块中主要盟友/对立面取决于调查员立场。</p>",
            FOLDERS["npc"],
            blurb="幼子",
            img="icons/equipment/head/hat-fedora-brown.webp",
        )
    )

    # --- 罗蜜安娜 level 1 ---
    actors.append(
        npc(
            "whbRomiana000001",
            "罗蜜安娜·卡亨",
            1,
            15,
            18,
            6,
            (5, 6, 8),
            {"str": 0, "dex": 1, "con": 1, "int": 1, "wis": 2, "cha": 3},
            {"deception": 8, "diplomacy": 7, "society": 8},
            [
                melee("巴掌", 5, "1d4", "bludgeoning", ["agile", "nonlethal"]),
                action_ability(
                    "贵妇恳求",
                    1,
                    "<p>以家族名誉请求停火，一名敌人需通过意志 DC 18，失败则对你无法使用敌对动作 1 轮。</p>",
                    category="defensive",
                ),
            ],
            "<p>李奥纳多之妻，表面浮华、内心传统。非战斗 NPC，但可带保镖。</p>",
            FOLDERS["npc"],
            img="icons/equipment/head/hat-bonnet-flowers-white.webp",
        )
    )

    # --- 灵媒 level 1 ---
    actors.append(
        npc(
            "whbMedium0000001",
            "灵媒",
            1,
            14,
            16,
            7,
            (4, 5, 9),
            {"str": 0, "dex": 0, "con": 0, "int": 2, "wis": 3, "cha": 2},
            {"occultism": 9, "religion": 7, "stealth": 5},
            [
                melee("匕首", 5, "1d4", "piercing", ["agile"]),
                embed_item(
                    "whbbyakheewhist1.json",
                    {"carryType": "held", "handsHeld": 1, "invested": None},
                    sort=350000,
                ),
                embed_item("whbfleshwardchrm.json", sort=360000),
                embed_item("whbbastetbless01.json", sort=370000),
                action_ability(
                    "血肉防护",
                    2,
                    "<p>触碰一名盟友，赋予 @Damage[(2d6)[temporary]]{2d6 临时 HP}（24 小时）。每日一次。</p>",
                    category="defensive",
                ),
                action_ability(
                    "拜亚基哨声",
                    2,
                    "<p>吹响 @UUID[Compendium.wang-pf2e-homebrew.homebrew-items.Item.whbbyakheewhist1]{拜亚基召唤哨}，60 尺内敌人意志 DC 18 或惊惧 2。</p>",
                ),
            ],
            "<p>安东尼奥阵营的神秘学家，了解大秘仪与逆转之祸。战斗极弱，应受保护。</p>",
            FOLDERS["npc"],
            img="icons/magic/symbols/circled-gem-teal.webp",
        )
    )

    # --- 小孔蒂 level -1 ---
    actors.append(
        npc(
            "whbConti00000001",
            "小孔蒂",
            -1,
            13,
            6,
            8,
            (3, 6, 5),
            {"str": -1, "dex": 2, "con": 1, "int": 1, "wis": 2, "cha": 1},
            {"perception": 8, "stealth": 7, "society": 4},
            [
                melee("石头", 3, "1d4-1", "bludgeoning"),
            ],
            "<p>污点证人之女，模块关键剧情孩童。几乎不应进入战斗。</p>",
            FOLDERS["npc"],
            img="icons/creatures/mammals/human-child-gray.webp",
        )
    )

    # --- 硕鼠 level 2 ---
    actors.append(
        npc(
            "whbshuoshufrnk01",
            "硕鼠·弗兰克",
            2,
            17,
            26,
            7,
            (8, 9, 5),
            {"str": 2, "dex": 3, "con": 2, "int": 1, "wis": 1, "cha": 0},
            {"athletics": 8, "intimidation": 8, "stealth": 9, "thievery": 8},
            [
                leather_armor(),
                melee("匕首", 9, "1d4+3", "piercing", ["agile", "finesse"]),
                ranged("手枪", 9, "1d6+2", 20),
                action_ability(
                    "暗算",
                    1,
                    "<p>对 @UUID[Compendium.pf2e.conditionitems.Item.AJh5ex99aRb6T4Qd]{措手不及} 的目标，Strike 造成额外 1d6 精准伤害。</p>",
                ),
            ],
            "<p>李奥纳多亲信，负责暗杀与赌场。狡猾而非蛮力。</p>",
            FOLDERS["npc"],
            blurb="硕鼠",
            img="icons/magic/unholy/silhouette-robe-evil-power.webp",
        )
    )

    # --- 拜亚基 level 3 (weakened) ---
    actors.append(
        npc(
            "whbByakhee000001",
            "拜亚基（削弱）",
            3,
            18,
            42,
            9,
            (10, 12, 8),
            {"str": 4, "dex": 3, "con": 3, "int": 1, "wis": 2, "cha": 0},
            {"acrobatics": 10, "stealth": 9},
            [
                melee("利爪", 12, "1d6+4", "slashing", ["agile", "finesse"]),
                melee("啃咬", 12, "1d4+4", "piercing"),
                action_passive(
                    "宇宙寒意",
                    "<p>5 尺内生物在回合开始时受到 1 点寒冷伤害。飞行速度 40 尺。</p>",
                ),
                action_ability(
                    "俯冲掠袭",
                    2,
                    "<p>飞行至多速度，进行一次利爪 Strike；若命中，目标额外惊惧 1（意志 DC 20 _negates）。</p>",
                ),
            ],
            "<p>灵媒召唤的异界仆从，<strong>已按 1 级团削弱</strong>（原 COC 拜亚基远强于此）。建议作为可逃跑的精英战或剧情 Boss，而非必死战。</p>",
            FOLDERS["monster"],
            traits=["aberration", "dream"],
            speed=25,
            img="icons/creatures/mammals/bat-giant-tattered-purple.webp",
        )
    )
    actors[-1]["system"]["attributes"]["speed"]["otherSpeeds"] = [
        {"type": "fly", "value": 40}
    ]

    # --- Eater 窥影 level 3 ---
    actors.append(
        npc(
            "whbEaterSeed0001",
            "吞噬之物·窥影",
            3,
            19,
            35,
            11,
            (8, 14, 12),
            {"str": -5, "dex": 4, "con": 2, "int": 3, "wis": 3, "cha": 0},
            {"stealth": 12},
            [
                melee("噬咬", 11, "1d8+2", "void", ["finesse", "magical"]),
                action_passive(
                    "概念生物",
                    "<p>免疫非魔法物理伤害；对 @Trait[cold-iron]{寒铁} 与 @Trait[silver]{银} 武器失去免疫。虚体。</p>",
                ),
                action_ability(
                    "贪婪吞噬",
                    2,
                    "<p>对受伤（未满 HP）目标发动噬咬；命中则你恢复 1d8 生命值，目标额外受到 @Damage[1d4[mental]] 伤害。</p>",
                ),
                action_ability(
                    "次元窥视",
                    1,
                    "<p>30 尺内所有生物意志 DC 20，失败则 @UUID[Compendium.pf2e.conditionitems.Item.TBSHQspnbcqxsmjL]{惊惧 1}（大失败惊惧 2）。</p>",
                    category="offensive",
                ),
            ],
            "<p><strong>Eater 早期显形</strong>，非完全体。建议用于 Day 4–5 的恐怖场景：打几下就消散，或靠星月仿制品驱逐。完全体不适合 1 级团。</p>",
            FOLDERS["monster"],
            traits=["aberration", "incorporeal"],
            img="icons/magic/unholy/orb-beam-pink.webp",
        )
    )

    # ==================================================================
    # 遗迹2 — 德兰人 / 翡族 小怪与精英（1 级团）
    # ==================================================================

    # --- 德兰剑客 Creature 0（Melee Dran）---
    actors.append(
        npc(
            "whbDranSword0001",
            "德兰剑客",
            0,
            16,
            16,
            6,
            (6, 8, 4),
            {"str": 2, "dex": 3, "con": 1, "int": 0, "wis": 1, "cha": 0},
            {"acrobatics": 7, "athletics": 6, "stealth": 6},
            [
                melee(
                    "军刀",
                    8,
                    "1d6+2",
                    "slashing",
                    ["agile", "finesse"],
                    sort=100000,
                ),
                action_ability(
                    "冲刺突刺",
                    2,
                    "<p>疾行，然后以军刀打击。若此次疾行至少移动 10 尺，该次打击获得 +1 环境加值。</p>",
                    sort=600000,
                    publication=PUB_REMNANT,
                ),
            ],
            "<p><strong>Melee Dran</strong>——洛索姆街头的沉睡德兰人。尖耳、蜡黄皮肤，挥着简陋军刀。"
            "受集体无意识驱使，成群扑向外来者。适合巷战与伏击的杂兵。</p>",
            FOLDERS["remnant"],
            traits=["humanoid", "dran"],
            speed=25,
            img="icons/weapons/swords/sword-guard-worn.webp",
            blurb="德兰小怪 · 近战",
            size="med",
            rarity="common",
            senses=[{"type": "low-light-vision"}],
            languages=["common"],
            language_details="德兰口音；多数沉睡者只会低语与嘶吼",
            perception_details="微光视觉",
            publication=PUB_REMNANT,
            flags=FLAG_REMNANT,
        )
    )

    # --- 德兰火枪手 Creature 0（Rifleman）---
    actors.append(
        npc(
            "whbDranRifle0001",
            "德兰火枪手",
            0,
            15,
            14,
            6,
            (5, 8, 4),
            {"str": 1, "dex": 3, "con": 1, "int": 0, "wis": 1, "cha": 0},
            {"acrobatics": 6, "stealth": 7},
            [
                ranged(
                    "步枪",
                    7,
                    "1d8",
                    40,
                    "piercing",
                    ["range-increment-40"],
                    sort=200000,
                ),
                melee(
                    "枪托砸击",
                    6,
                    "1d4+1",
                    "bludgeoning",
                    ["agile"],
                    sort=100000,
                ),
                action_ability(
                    "点射",
                    2,
                    "<p>以步枪连续射击两次（正常多重攻击罚值）。射击后通常需花费 1 动作装填（由 GM 手操）。</p>",
                    sort=600000,
                    publication=PUB_REMNANT,
                ),
            ],
            "<p><strong>Dran Rifleman</strong>——远距离支援的德兰射手。偏好保持距离点射，被逼近时用枪托砸人。</p>",
            FOLDERS["remnant"],
            traits=["humanoid", "dran"],
            speed=25,
            img="icons/weapons/guns/gun-rifle.webp",
            blurb="德兰小怪 · 远程",
            size="med",
            rarity="common",
            senses=[{"type": "low-light-vision"}],
            languages=["common"],
            language_details="德兰口音",
            perception_details="微光视觉",
            publication=PUB_REMNANT,
            flags=FLAG_REMNANT,
        )
    )

    # --- 德兰拆卸者 Creature 1（Demolisher，精英）---
    actors.append(
        npc(
            "whbDranDemo00001",
            "德兰拆卸者",
            1,
            17,
            28,
            7,
            (9, 6, 5),
            {"str": 3, "dex": 1, "con": 3, "int": -1, "wis": 1, "cha": 0},
            {"athletics": 8, "intimidation": 6},
            [
                melee(
                    "动力锯",
                    9,
                    "1d10+4",
                    "slashing",
                    [],
                    sort=100000,
                    description="<p>触及 10 尺。命中时附加 @Damage[1[persistent,bleed]]。</p>",
                ),
                action_passive_pub(
                    "旋转锯刃",
                    "<p>只要动力锯在运转，与拆卸者相邻开始回合的生物受到 @Damage[1[slashing]]。"
                    "（锯大约每数轮熄火一次，重启需 1 动作——GM 可偶尔给玩家喘息。）</p>",
                    sort=500000,
                    publication=PUB_REMNANT,
                    category="offensive",
                ),
                action_ability(
                    "锯刃冲锋",
                    2,
                    "<p>疾行两次，然后以动力锯打击。命中时目标须尝试 @Check[fortitude|dc:15]，"
                    "失败则陷入 @UUID[Compendium.pf2e.conditionitems.Item.j91X7x0XSomq8d60]{倒地}。</p>",
                    sort=600000,
                    publication=PUB_REMNANT,
                ),
                action_ability(
                    "废气喷吐",
                    2,
                    "<p>10 尺爆发内生物须尝试 @Check[fortitude|dc:15|traits:poison,inhaled]。</p>"
                    "<p>@Template[type:burst|distance:10]</p>"
                    "<hr />"
                    "<p><strong>失败</strong> 陷入 @UUID[Compendium.pf2e.conditionitems.Item.fesdP3LZ4CV37rQo]{恶心 1}。</p>"
                    "<p><strong>大失败</strong> 陷入恶心 2。</p>",
                    sort=610000,
                    publication=PUB_REMNANT,
                    traits=["poison", "inhaled"],
                ),
            ],
            "<p><strong>Dran Demolisher</strong>——体型魁梧的德兰精英，挥着轰鸣动力锯。"
            "常见于下水道与巷战伏击。流血与近身压力是其威胁核心。</p>",
            FOLDERS["remnant"],
            traits=["humanoid", "dran"],
            speed=20,
            img="icons/weapons/axes/axe-broadaxe-worn.webp",
            blurb="德兰精英",
            size="med",
            rarity="uncommon",
            senses=[{"type": "low-light-vision"}],
            languages=["common"],
            language_details="德兰口音；低吼多于言语",
            perception_details="微光视觉",
            publication=PUB_REMNANT,
            flags=FLAG_REMNANT,
        )
    )

    # --- 翡族卫兵 Creature 0（Fae Soldier）---
    actors.append(
        npc(
            "whbFaeSoldier001",
            "翡族卫兵",
            0,
            16,
            15,
            6,
            (5, 8, 6),
            {"str": 2, "dex": 3, "con": 1, "int": 0, "wis": 1, "cha": 1},
            {"acrobatics": 7, "deception": 5, "stealth": 6},
            [
                melee(
                    "华饰长刃",
                    8,
                    "1d8+2",
                    "slashing",
                    ["finesse"],
                    sort=100000,
                ),
                action_ability(
                    "魅影步",
                    1,
                    "<p>疾行 5 尺并变得隐蔽，直至下回合开始，或直到你发动攻击/施法。</p>",
                    sort=600000,
                    publication=PUB_REMNANT,
                    traits=["illusion", "visual", "manipulate"],
                ),
            ],
            "<p><strong>Fae Soldier</strong>——宫殿走廊上的翡族士兵，华美却致命。"
            "幻术短步让他们难以被锁定。弱点寒铁。</p>",
            FOLDERS["remnant"],
            traits=["fey", "fae"],
            speed=30,
            img="icons/weapons/swords/sword-gold-winged.webp",
            blurb="翡族小怪 · 近战",
            size="med",
            rarity="common",
            senses=[{"type": "low-light-vision"}],
            languages=["common", "fey"],
            language_details="",
            hp_details="弱点 寒铁 2",
            perception_details="微光视觉",
            publication=PUB_REMNANT,
            flags=FLAG_REMNANT,
            weaknesses=[("cold-iron", 2)],
        )
    )

    # --- 翡族皇家弓手 Creature 0（Royal Fae Archer）---
    actors.append(
        npc(
            "whbFaeArcher0001",
            "翡族皇家弓手",
            0,
            15,
            14,
            7,
            (4, 8, 6),
            {"str": 1, "dex": 3, "con": 1, "int": 0, "wis": 2, "cha": 1},
            {"acrobatics": 7, "stealth": 7, "survival": 5},
            [
                ranged(
                    "皇家猎弓",
                    8,
                    "1d8",
                    60,
                    "piercing",
                    ["range-increment-60"],
                    sort=200000,
                ),
                melee(
                    "短刃",
                    6,
                    "1d4+1",
                    "piercing",
                    ["agile", "finesse"],
                    sort=100000,
                ),
                action_ability(
                    "游猎齐射",
                    2,
                    "<p>后退一步（若可能），然后以皇家猎弓打击两次（正常多重攻击罚值）。</p>",
                    sort=600000,
                    publication=PUB_REMNANT,
                ),
            ],
            "<p><strong>Royal Fae Archer</strong>——翡族宫廷猎手，用华丽长弓从回廊与阳台压制旅人。</p>",
            FOLDERS["remnant"],
            traits=["fey", "fae"],
            speed=30,
            img="icons/weapons/bows/shortbow-recurve-bone.webp",
            blurb="翡族小怪 · 远程",
            size="med",
            rarity="common",
            senses=[{"type": "low-light-vision"}],
            languages=["common", "fey"],
            language_details="",
            hp_details="弱点 寒铁 2",
            perception_details="微光视觉",
            publication=PUB_REMNANT,
            flags=FLAG_REMNANT,
            weaknesses=[("cold-iron", 2)],
        )
    )

    # --- 翡族处刑者 Creature 1（Heavy Fae / Executioner，精英）---
    actors.append(
        npc(
            "whbFaeExecut0001",
            "翡族处刑者",
            1,
            17,
            26,
            7,
            (9, 6, 7),
            {"str": 3, "dex": 1, "con": 2, "int": 0, "wis": 2, "cha": 1},
            {"athletics": 8, "intimidation": 7},
            [
                melee(
                    "处刑戟",
                    9,
                    "1d10+4",
                    "slashing",
                    ["reach"],
                    sort=100000,
                    description="<p>触及 10 尺。</p>",
                ),
                action_reaction(
                    "借机攻击",
                    "<p>标准借机攻击。触发后使用处刑戟打击（点攻击区的 +9）。</p>",
                    category="offensive",
                    sort=700000,
                    publication=PUB_REMNANT,
                ),
                action_ability(
                    "处决斩",
                    2,
                    "<p>以处刑戟打击。若目标处于惊惧或措手不及，额外造成 @Damage[1d8[slashing]]。</p>",
                    sort=600000,
                    publication=PUB_REMNANT,
                ),
                action_ability(
                    "威压冲锋",
                    2,
                    "<p>疾行两次，然后以处刑戟打击。命中时目标须尝试 @Check[will|dc:15|traits:fear,mental,emotion]，"
                    "失败则陷入 @UUID[Compendium.pf2e.conditionitems.Item.TBSHQspnbcqxsmjL]{惊惧 1}。</p>",
                    sort=610000,
                    publication=PUB_REMNANT,
                    traits=["fear", "mental", "emotion"],
                ),
            ],
            "<p><strong>Heavy Fae / Executioner</strong>——挥着巨大处刑戟的翡族精英。"
            "负责清理「僭越者」与德兰俘虏。借机与处决斩让近身周旋很危险。</p>",
            FOLDERS["remnant"],
            traits=["fey", "fae"],
            speed=20,
            img="icons/weapons/polearms/halberd-crescent-engraved-steel.webp",
            blurb="翡族精英",
            size="med",
            rarity="uncommon",
            senses=[{"type": "low-light-vision"}],
            languages=["common", "fey"],
            language_details="",
            hp_details="弱点 寒铁 3",
            perception_details="微光视觉",
            publication=PUB_REMNANT,
            flags=FLAG_REMNANT,
            weaknesses=[("cold-iron", 3)],
        )
    )

    # ==================================================================
    # 遗迹2 — 夜织者·梦魇碎片（1 级团终局 Boss）
    # 生物 2：一阶段 + 弱化二阶段；无贴墙 / 无遁入；召唤每场 1 只
    # ==================================================================
    NW_ATK = 10
    NW_DC = 16
    shard_items = [
        melee(
            "爪击",
            NW_ATK,
            "1d8+3",
            "slashing",
            ["agile", "finesse"],
            sort=100000,
            extra_damage=[("1", "mental")],
            description="<p>触及 10 尺。</p>",
        ),
        melee(
            "梦魇攫抓",
            NW_ATK,
            "1d4+2",
            "mental",
            ["agile", "finesse"],
            sort=110000,
            attack_effects=["grabbed"],
            description="<p>触及 10 尺。命中后目标被 "
            "@UUID[Compendium.pf2e.conditionitems.Item.kWc1fhmv9LBiTuei]{擒抱}"
            f"（逃脱 DC {NW_DC}）。</p>",
        ),
        ranged(
            "噩梦钉刺",
            NW_ATK,
            "1d4+2",
            30,
            "force",
            ["range-increment-30"],
            sort=200000,
        ),
        action_passive_pub(
            "织梦者",
            f"<p>任何试图以心灵、情绪或睡眠效果影响夜织者的生物，必须尝试 "
            f"@Check[will|dc:{NW_DC}|traits:mental,emotion,fear]。</p>"
            "<hr />"
            "<p><strong>大成功 / 成功</strong> 不受影响。</p>"
            "<p><strong>失败 / 大失败</strong> 陷入 "
            "@UUID[Compendium.pf2e.conditionitems.Item.e1XGnhKNSQIm5IXg]{呆滞 1}，持续 1 轮。</p>",
            sort=500000,
            publication=PUB_REMNANT,
            category="defensive",
        ),
        action_ability(
            "噩梦爆破",
            2,
            f"<p>释放锥形梦魇能量。区域内每个生物受到 @Damage[2d6[force]|options:area-damage]，"
            f"并须尝试 @Check[reflex|dc:{NW_DC}|basic|traits:fear,mental,force]。</p>"
            "<p>@Template[type:cone|distance:15]</p>"
            "<hr />"
            "<p><strong>大成功 / 成功</strong> 不受额外惊惧影响。</p>"
            "<p><strong>失败 / 大失败</strong> 额外陷入 "
            "@UUID[Compendium.pf2e.conditionitems.Item.TBSHQspnbcqxsmjL]{惊惧 1}。</p>",
            sort=600000,
            publication=PUB_REMNANT,
            traits=["force", "mental", "fear"],
        ),
        action_ability(
            "召唤梦魇幼蛛",
            2,
            "<p><strong>频率</strong> 每场战斗一次</p>"
            "<p>站立召唤，陷入措手不及。点播放会在身旁生成 <strong>1</strong> 只梦魇幼蛛"
            "（幼蛛立即获得 1 个动作）。</p>"
            "<p><strong>中断：</strong>下回合开始前若被近战命中，召唤失败；额外 @Damage[1d6[mental]]，"
            "并陷入 @UUID[Compendium.pf2e.conditionitems.Item.dfCMdR4wnpbYNTix]{震慑 1}。</p>",
            sort=610000,
            publication=PUB_REMNANT,
        ),
        action_ability(
            "疯狂乱抓",
            2,
            "<p>点播放会连续掷两次爪击。若两次均命中同一目标，附加 @Damage[1d4[persistent,bleed]]。</p>",
            sort=620000,
            publication=PUB_REMNANT,
        ),
        action_passive_pub(
            "二阶段：爬行恶鬼",
            "<p>当 HP 降至 0 时，她尖啸碎裂但<strong>并不死亡</strong>：当轮无法被选为目标。"
            "在她的下一回合开始时，删除本 Token，换成"
            "@UUID[Compendium.wang-pf2e-homebrew.homebrew-actors.Actor.whbNwCrawl000001]{夜织者·爬行恶鬼}"
            "（<strong>20 HP</strong>）。</p>",
            sort=520000,
            publication=PUB_REMNANT,
            category="defensive",
        ),
    ]

    actors.append(
        npc(
            "whbNwShard000001",
            "夜织者·梦魇碎片",
            2,
            18,
            40,
            8,
            (7, 11, 8),
            {"str": 2, "dex": 3, "con": 1, "int": -1, "wis": 2, "cha": 2},
            {
                "acrobatics": 9,
                "deception": 8,
                "intimidation": 8,
                "stealth": 9,
                "occultism": 5,
            },
            shard_items,
            "<p><strong>Shard of the Nightweaver</strong>——夜织者投射的梦魇碎片。"
            "<strong>按 1 级团终局战削砍</strong>：生物 2；无贴墙 / 无遁入；召唤每场 1 只。"
            "一阶段 HP 40，归零后换二阶段「爬行恶鬼」（20 HP）。对 1 级四人团约为严重～极限。</p>",
            FOLDERS["remnant"],
            traits=["fey", "dream", "unholy"],
            speed=25,
            img="icons/magic/death/skull-horned-goat-pentagram-red.webp",
            blurb="遗迹2 · Boss 一阶段",
            size="med",
            rarity="unique",
            other_speeds=[{"type": "fly", "value": 25}],
            senses=[{"type": "darkvision"}],
            languages=["common", "fey"],
            language_details="只能说零碎词语；心灵感应 30 尺",
            hp_details="免疫睡眠；弱点 寒铁 3、神圣 3",
            perception_details="黑暗视觉；心灵感应 30 尺",
            publication=PUB_REMNANT,
            flags=FLAG_REMNANT,
            immunities=["sleep"],
            weaknesses=[("cold-iron", 3), ("holy", 3)],
        )
    )

    # 二阶段：保留形态变化，但数值与机制同步削弱
    crawl_items = [
        melee(
            "爪击",
            NW_ATK,
            "1d8+3",
            "slashing",
            ["agile", "finesse"],
            sort=100000,
            extra_damage=[("1", "mental")],
            description="<p>触及 10 尺。</p>",
        ),
        melee(
            "梦魇攫抓",
            NW_ATK,
            "1d4+2",
            "mental",
            ["agile", "finesse"],
            sort=110000,
            attack_effects=["grabbed"],
            description="<p>触及 10 尺。命中后目标被 "
            "@UUID[Compendium.pf2e.conditionitems.Item.kWc1fhmv9LBiTuei]{擒抱}"
            f"（逃脱 DC {NW_DC}）。</p>",
        ),
        ranged(
            "噩梦钉刺",
            NW_ATK,
            "1d4+2",
            30,
            "force",
            ["range-increment-30"],
            sort=200000,
        ),
        action_passive_pub(
            "织梦者",
            f"<p>任何试图以心灵、情绪或睡眠效果影响夜织者的生物，必须尝试 "
            f"@Check[will|dc:{NW_DC}|traits:mental,emotion,fear]。</p>"
            "<hr />"
            "<p><strong>大成功 / 成功</strong> 不受影响。</p>"
            "<p><strong>失败 / 大失败</strong> 陷入 "
            "@UUID[Compendium.pf2e.conditionitems.Item.e1XGnhKNSQIm5IXg]{呆滞 1}，持续 1 轮。</p>",
            sort=500000,
            publication=PUB_REMNANT,
            category="defensive",
        ),
        action_reaction(
            "借机攻击",
            "<p>标准借机攻击。触发后使用爪击打击（点攻击区的 +10）。</p>",
            category="offensive",
            sort=700000,
            publication=PUB_REMNANT,
        ),
        action_ability(
            "噩梦爆破",
            2,
            f"<p>释放锥形梦魇能量。区域内每个生物受到 @Damage[2d6[force]|options:area-damage]，"
            f"并须尝试 @Check[reflex|dc:{NW_DC}|basic|traits:fear,mental,force]。</p>"
            "<p>@Template[type:cone|distance:15]</p>"
            "<hr />"
            "<p><strong>大成功 / 成功</strong> 不受额外惊惧影响。</p>"
            "<p><strong>失败 / 大失败</strong> 额外陷入 "
            "@UUID[Compendium.pf2e.conditionitems.Item.TBSHQspnbcqxsmjL]{惊惧 1}。</p>",
            sort=600000,
            publication=PUB_REMNANT,
            traits=["force", "mental", "fear"],
        ),
        action_ability(
            "召唤梦魇幼蛛",
            2,
            "<p><strong>频率</strong> 每场战斗一次（与一阶段共用，GM 记次）</p>"
            "<p>若本场尚未召唤过：点播放生成 1 只幼蛛并陷入措手不及。"
            "中断：近战命中则召唤失败；@Damage[1d6[mental]] 并震慑 1。</p>",
            sort=610000,
            publication=PUB_REMNANT,
        ),
        action_ability(
            "疯狂乱抓",
            2,
            "<p>点播放会连续掷两次爪击。若两次均命中同一目标，附加 @Damage[1d4[persistent,bleed]]。</p>",
            sort=620000,
            publication=PUB_REMNANT,
        ),
    ]

    actors.append(
        npc(
            "whbNwCrawl000001",
            "夜织者·爬行恶鬼",
            2,
            18,
            20,
            8,
            (7, 11, 8),
            {"str": 2, "dex": 3, "con": 1, "int": -1, "wis": 2, "cha": 2},
            {
                "acrobatics": 9,
                "deception": 8,
                "intimidation": 8,
                "stealth": 9,
                "occultism": 5,
            },
            crawl_items,
            "<p>夜织者二阶段（Crawling Horror）。一阶段 HP 归零后换上本 Token，"
            "<strong>20 HP</strong> 入场。失去飞行；陆地 30、攀爬 20；获得借机攻击。"
            "无贴墙 / 无遁入；攻击与 DC 同一阶段。</p>",
            FOLDERS["remnant"],
            traits=["fey", "dream", "unholy"],
            speed=30,
            img="icons/creatures/magical/humanoid-silhouette-dashing-blue.webp",
            blurb="遗迹2 · Boss 二阶段",
            size="med",
            rarity="unique",
            other_speeds=[{"type": "climb", "value": 20}],
            senses=[{"type": "darkvision"}],
            languages=["common", "fey"],
            language_details="只能说零碎词语；心灵感应 30 尺",
            hp_details="免疫睡眠；弱点 寒铁 3、神圣 3",
            perception_details="黑暗视觉；心灵感应 30 尺",
            publication=PUB_REMNANT,
            flags=FLAG_REMNANT,
            immunities=["sleep"],
            weaknesses=[("cold-iron", 3), ("holy", 3)],
        )
    )

    actors.append(
        npc(
            "whbNmSpawn000001",
            "梦魇幼蛛",
            -1,
            14,
            6,
            4,
            (2, 6, 3),
            {"str": 0, "dex": 2, "con": 0, "int": -4, "wis": 0, "cha": -2},
            {"acrobatics": 6, "stealth": 6},
            [
                melee(
                    "啃咬",
                    6,
                    "1d4+1",
                    "piercing",
                    ["agile", "finesse"],
                    sort=100000,
                ),
                action_passive_pub(
                    "濒死爆发",
                    "<p>HP 降至 0 时炸裂。5 尺弥漫内生物受到 @Damage[1d4[mental]|options:area-damage]，"
                    "并须尝试 @Check[reflex|dc:13|basic]。</p>",
                    sort=500000,
                    publication=PUB_REMNANT,
                    category="offensive",
                ),
            ],
            "<p>夜织者召唤的弱小梦魇虫豸。每场战斗通常只出现 1 只。</p>",
            FOLDERS["remnant"],
            traits=["fey", "dream"],
            speed=25,
            img="icons/creatures/invertebrates/spider-pink-teal.webp",
            blurb="夜织者仆从",
            size="sm",
            rarity="common",
            other_speeds=[{"type": "climb", "value": 15}],
            senses=[{"type": "darkvision"}],
            languages=[],
            language_details="",
            hp_details="弱点 寒铁 2、神圣 2",
            perception_details="黑暗视觉",
            publication=PUB_REMNANT,
            flags=FLAG_REMNANT,
            weaknesses=[("cold-iron", 2), ("holy", 2)],
        )
    )

    folders = {
        "folders": [
            {
                "_id": FOLDERS["mafia"],
                "name": "黑手帮",
                "type": "Actor",
                "sorting": "a",
                "folder": None,
            },
            {
                "_id": FOLDERS["npc"],
                "name": "剧情 NPC",
                "type": "Actor",
                "sorting": "a",
                "folder": None,
            },
            {
                "_id": FOLDERS["monster"],
                "name": "怪物",
                "type": "Actor",
                "sorting": "a",
                "folder": None,
            },
            {
                "_id": FOLDERS["remnant"],
                "name": "遗迹2",
                "type": "Actor",
                "sorting": "a",
                "folder": None,
            },
        ]
    }

    with open(os.path.join(OUT, "_folders.json"), "w", encoding="utf-8") as f:
        json.dump(folders, f, ensure_ascii=False, indent=2)

    for actor in actors:
        path = os.path.join(OUT, f"{actor['_id']}.json")
        with open(path, "w", encoding="utf-8") as f:
            json.dump(actor, f, ensure_ascii=False, indent=2)

    print(f"Wrote {len(actors)} actors to {OUT}")


if __name__ == "__main__":
    build_all()
