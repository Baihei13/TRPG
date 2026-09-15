import fs from "fs";

const p = "src/packs/homebrew-actors/whbHuntEmiliaMo1.json";
let buf = fs.readFileSync(p);
let raw = buf.toString("utf8");
console.log("tail", JSON.stringify(raw.slice(-20)));

// Keep only up to last closing brace of root object
const last = raw.lastIndexOf("\n}");
const last2 = raw.lastIndexOf("}");
raw = raw.slice(0, last2 + 1);

const j = JSON.parse(raw);

function unesc(s) {
  if (typeof s !== "string") return s;
  return s.replaceAll("\\n", "\n");
}

const idMap = {
  双持帕克斯: "whbEmDualPax0001",
  双牙齐射: "whbEmTwinFang001",
};

for (const i of j.items) {
  if (idMap[i.name]) i._id = idMap[i.name];
  if (i.system?.description?.value) i.system.description.value = unesc(i.system.description.value);
}
j.system.details.privateNotes = unesc(j.system.details.privateNotes);
j.system.details.publicNotes = unesc(j.system.details.publicNotes);

for (const i of j.items) {
  if (!/^[a-zA-Z0-9]{16}$/.test(i._id)) {
    throw new Error(`bad id ${i._id} (${i._id.length}) ${i.name}`);
  }
}

fs.writeFileSync(p, JSON.stringify(j, null, 2) + "\n", "utf8");
console.log("OK", j.name, "items", j.items.length);
console.log(j.items.map((i) => i._id + " " + i.name).join("\n"));
