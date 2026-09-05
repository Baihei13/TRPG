/**
 * 烧焦的戒指「燃烧」：造成的伤害忽略目标对应抗力的前 2 点。
 * PF2e 原生仅支持「整段抗力无视」，不支持「降低 N 点」；
 * 此处在 applyDamage 前临时目标抗力结算值，实现忽略 2 点。
 */

const RING_SLUG = "charred-ring";
const RING_ID = "whbCharredRing01";
const IGNORE_AMOUNT = 2;

function isInvestedCharredRing(item) {
  if (!item?.isOfType?.("equipment")) return false;
  const match =
    item.slug === RING_SLUG ||
    item.id === RING_ID ||
    item.sourceId?.includes(RING_ID) ||
    item.flags?.["wang-pf2e-homebrew"]?.enName === "Burning Ring";
  return match && item.isInvested;
}

export function actorHasCharredRingBurn(actor) {
  return !!actor?.itemTypes?.equipment?.some(isInvestedCharredRing);
}

function actorFromUuid(uuid) {
  try {
    const doc = fromUuidSync(uuid);
    if (doc?.documentName === "Actor") return doc;
    if (doc?.actor) return doc.actor;
  } catch {
    /* ignore */
  }
  return null;
}

function resolveOriginActor(params) {
  const fromItem = params?.item?.actor;
  if (fromItem) return fromItem;

  const options = params?.rollOptions;
  if (!options) return null;
  const list = options instanceof Set ? [...options] : Array.from(options);
  for (const o of list) {
    const s = String(o);
    const uuidMatch = /^origin:actor:uuid:(.+)$/.exec(s);
    if (uuidMatch) {
      const a = actorFromUuid(uuidMatch[1]);
      if (a) return a;
    }
    const idMatch = /^origin:actor:id:(.+)$/.exec(s);
    if (idMatch) {
      const a =
        game.actors.get(idMatch[1]) ||
        canvas.tokens?.placeables?.find((t) => t.actor?.id === idMatch[1])?.actor;
      if (a) return a;
    }
  }
  return null;
}

function patchResistancesForIgnore(actor, amount) {
  const attrs = actor.attributes;
  if (!attrs?.resistances?.length) return () => {};

  const originals = attrs.resistances;
  const proxied = originals.map(
    (res) =>
      new Proxy(res, {
        get(target, prop, receiver) {
          if (prop === "getDoubledValue") {
            return (...args) =>
              Math.max(0, target.getDoubledValue(...args) - amount);
          }
          if (prop === "value") {
            const v = Reflect.get(target, prop, receiver);
            return typeof v === "number" ? Math.max(0, v - amount) : v;
          }
          return Reflect.get(target, prop, receiver);
        },
      })
  );

  const hadOwn = Object.prototype.hasOwnProperty.call(actor, "attributes");
  const prevDesc = Object.getOwnPropertyDescriptor(actor, "attributes");

  Object.defineProperty(actor, "attributes", {
    configurable: true,
    enumerable: true,
    get() {
      return new Proxy(attrs, {
        get(t, p, r) {
          if (p === "resistances") return proxied;
          return Reflect.get(t, p, r);
        },
      });
    },
  });

  return () => {
    delete actor.attributes;
    if (hadOwn && prevDesc) Object.defineProperty(actor, "attributes", prevDesc);
  };
}

let patched = false;

/** 在 ready 后挂钩 Actor.applyDamage */
export function installCharredRingIwrPatch() {
  if (patched || game.system.id !== "pf2e") return;
  const Cls = CONFIG.Actor.documentClass;
  if (!Cls?.prototype?.applyDamage) return;

  const original = Cls.prototype.applyDamage;
  Cls.prototype.applyDamage = async function applyDamageWithCharredRing(params = {}) {
    const origin = resolveOriginActor(params);
    const should =
      origin &&
      actorHasCharredRingBurn(origin) &&
      params.damage &&
      typeof params.damage !== "number" &&
      !params.skipIWR &&
      !params.final;

    if (!should) return original.call(this, params);

    const restore = patchResistancesForIgnore(this, IGNORE_AMOUNT);
    try {
      return await original.call(this, params);
    } finally {
      restore();
    }
  };

  patched = true;
  console.log(`[wang-pf2e-homebrew] 烧焦戒指「燃烧」：已挂钩忽略抗力 ${IGNORE_AMOUNT}`);
}
