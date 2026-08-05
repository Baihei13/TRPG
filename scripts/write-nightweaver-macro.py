# -*- coding: utf-8 -*-
"""Thin Nightweaver macros — only summon + frenzy (AOE uses native action cards)."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "src" / "packs" / "homebrew-macros"
FOLDER = "whbfolderRemMac1"

for p in ROOT.glob("whbNw*.json"):
    p.unlink()

MACROS = [
    ("whbNwSummon00001", "夜织者·召唤梦魇幼蛛", "icons/creatures/invertebrates/spider-pink-teal.webp", "nightweaverSummon"),
    ("whbNwFrenzy00001", "夜织者·疯狂乱抓", "icons/skills/melee/blood-slash-purple.webp", "nightweaverFrenzy"),
]

for mid, name, img, api in MACROS:
    assert len(mid) == 16, (mid, len(mid))
    cmd = (
        f'const api = game.modules.get("wang-pf2e-homebrew")?.api;\n'
        f'if (!api?.{api}) return ui.notifications.error("夜织者 API 未加载，请确认模块已启用并刷新（F5）。");\n'
        f'await api.{api}();\n'
    )
    doc = {
        "_id": mid,
        "name": name,
        "type": "script",
        "img": img,
        "scope": "global",
        "command": cmd,
        "folder": FOLDER,
        "sort": 0,
        "ownership": {"default": 0},
        "flags": {
            "wang-pf2e-homebrew": {
                "purpose": "nightweaver-action",
                "source": "remnant2-nightweaver",
                "api": api,
            }
        },
    }
    out = ROOT / f"{mid}.json"
    out.write_bytes((json.dumps(doc, ensure_ascii=False, indent=2) + "\n").encode("utf-8"))
    print("wrote", out.name)

print("done")
