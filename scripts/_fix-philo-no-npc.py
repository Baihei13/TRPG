import pathlib
p = pathlib.Path(r"C:\Users\王昊\AppData\Local\FoundryVTT\Data\modules\wang-pf2e-homebrew\scripts\_gen-philo-hunter.mjs")
t = p.read_text(encoding="utf-8")
start = t.find("// —— 菲洛猎人")
if start < 0:
    start = t.find("const philo =")
end = t.find("const mod = readMod()")
if start < 0 or end < 0:
    raise SystemExit(f"markers missing {start} {end}")
t = t[:start] + t[end:]
t = t.replace(
    'console.log("wrote", items.length, "items + philo; version", mod.version);',
    'console.log("wrote", items.length, "PC feats/gear (no NPC); version", mod.version);',
)
t = t.replace('mod.version = "1.27.0"', 'mod.version = "1.27.1"')
# drop unused actorsDir if present
lines = []
for line in t.splitlines(True):
    if "actorsDir" in line and ("const actorsDir" in line or "homebrew-actors" in line):
        continue
    lines.append(line)
p.write_text("".join(lines), encoding="utf-8")
print("ok", start, end)
