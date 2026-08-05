# -*- coding: utf-8 -*-
import json
from pathlib import Path

root = Path(r"C:\Users\王昊\AppData\Local\FoundryVTT\Data\modules\wang-pf2e-homebrew\src\packs\homebrew-actors")
for name in ["whbNwShard000001", "whbNwCrawl000001", "whbNmSpawn000001"]:
    d = json.loads((root / f"{name}.json").read_text(encoding="utf-8"))
    print("===", d["name"], "L" + str(d["system"]["details"]["level"]["value"]), "===")
    print("AC", d["system"]["attributes"]["ac"]["value"], "HP", d["system"]["attributes"]["hp"]["max"])
    print("speed", d["system"]["attributes"]["speed"])
    print("saves F/R/W", d["system"]["saves"]["fortitude"]["value"], d["system"]["saves"]["reflex"]["value"], d["system"]["saves"]["will"]["value"])
    print("hp_details:", d["system"]["attributes"]["hp"].get("details"))
    print("traits:", d["system"]["traits"])
    for it in d["items"]:
        if it["type"] == "melee":
            dmgs = [(v["damage"], v["damageType"]) for v in it["system"]["damageRolls"].values()]
            print(
                f"  melee {it['name']} +{it['system']['bonus']['value']} {dmgs} "
                f"traits={it['system']['traits']['value']} fx={it['system']['attackEffects']['value']}"
            )
        else:
            desc = (it["system"].get("description") or {}).get("value", "")
            has_check = "@Check" in desc
            has_uuid = "@UUID" in desc
            has_dos = ("失败" in desc) or ("大失败" in desc)
            print(
                f"  {it['type']} {it['name']} actions={it['system'].get('actions', {}).get('value')} "
                f"check={has_check} uuid={has_uuid} dos={has_dos}"
            )
            # flag potential issues
            if it["name"] == "织梦者" and "e1XGnhKNSQIm5IXg" not in desc:
                print("    !! 织梦者缺少呆滞 UUID")
            if it["name"] == "噩梦爆破" and "TBSHQspnbcqxsmjL" not in desc:
                print("    !! 爆破缺少惊惧 UUID")
            if it["name"] == "贴墙伏击" and "j91X7x0XSomq8d60" not in desc:
                print("    !! 贴墙缺少倒地 UUID")
            if it["name"] == "濒死爆发" and "@Check" not in desc:
                print("    !! 幼蛛爆发无 @Check")
            if it["name"] == "遁入梦魇" and "@Check[flat" not in desc:
                print("    !! 遁入缺少 flat check")
    print()
