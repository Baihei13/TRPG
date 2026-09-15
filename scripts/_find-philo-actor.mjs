import { ClassicLevel } from "classic-level";

const dir =
  "C:\\Users\\王昊\\AppData\\Local\\FoundryVTT\\Data\\worlds\\6859vh6iaxbfbj4m\\data\\actors";
const db = new ClassicLevel(dir, { keyEncoding: "utf8", valueEncoding: "json" });
let total = 0;
const hits = [];
for await (const [k, v] of db.iterator()) {
  total++;
  const name = v?.name ?? "";
  if (/菲洛|Philo|philo|Filo|jiuli|妖刀/i.test(name)) {
    hits.push({ k, name, type: v.type, level: v.system?.details?.level?.value });
  }
}
console.log(JSON.stringify({ total, hits }, null, 2));
await db.close();
