import fs from "fs";

const src = fs.readFileSync("scripts/party-trap-macro.mjs", "utf8");
const body = src
  .replace(/^export async function /gm, "async function ")
  .replace(/^export function /gm, "function ");

const command = `${body}

const preset = typeof args !== "undefined" && args?.[0] && typeof args[0] === "object" ? args[0] : null;
if (preset?.mode) await applyPartyTrap(preset);
else await openPartyTrapDialog();
`;

const doc = {
  _id: "whbPartyTrap0001",
  name: "队伍陷阱：状态 / 扣血",
  type: "script",
  img: "icons/skills/traps/trap-jaw-steel-orange.webp",
  scope: "global",
  command,
  folder: null,
  sort: 50,
  ownership: { default: 0 },
  flags: { "wang-pf2e-homebrew": { purpose: "party-trap-dialog" } },
};

fs.writeFileSync(
  "src/packs/homebrew-macros/whbPartyTrap0001.json",
  `${JSON.stringify(doc, null, 2)}\n`
);
console.log("wrote standalone macro, chars:", command.length);
