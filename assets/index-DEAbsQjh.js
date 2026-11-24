var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var _a, _b, _c;
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const list$2 = [
  { key: "str", label: "Str", group: "core", format: "number", description: "+2 max HP, 1% increased minimum damage and 2% increased maximum damage each, for every damage type." },
  { key: "dex", label: "Dex", group: "core", format: "number", description: "+1 evasion and +2 accuracy each. Accuracy drives multihits: after a hit lands, another hit is rolled at 1/2 accuracy, then 1/3, and so on until one misses." },
  { key: "int", label: "Int", group: "core", format: "number", description: "+1 ward and +1% crit chance each, with no cap. Crits chain: a crit rolls again at 1/2 the crit chance, then 1/3, and each crit level adds the crit multiplier bonus once more." },
  { key: "maxHealth", label: "max HP", group: "life", format: "number", description: "Added to max HP." },
  { key: "increasedMaxHealth", label: "increased max HP", group: "life", format: "percent", description: "Multiplies max HP." },
  { key: "lifeRegen", label: "life regen/s", group: "life", format: "number", scale: "defenseRating", description: "HP regained each second, in fights and while resting. Shortens rests." },
  { key: "lifeRegenPercent", label: "of max HP regen/s", group: "life", format: "percent", description: "Share of max HP regained each second, added to life regen." },
  { key: "lifeLeech", label: "life leech", group: "life", format: "percent", description: "Share of the damage you deal that comes back as HP." },
  { key: "lifeOnHit", label: "life on hit", group: "life", format: "number", description: "HP regained each time one of your hits lands." },
  { key: "armor", label: "armor", group: "defense", format: "number", scale: "defenseRating", description: "Reduces physical hits. Each half of a hit covered by armor halves it." },
  { key: "increasedArmor", label: "increased armor", group: "defense", format: "percent", description: "Multiplies armor." },
  { key: "evasion", label: "evasion", group: "defense", format: "number", scale: "defenseRating", description: "Chance to dodge, against the attacker's accuracy." },
  { key: "increasedEvasion", label: "increased evasion", group: "defense", format: "percent", description: "Multiplies evasion." },
  { key: "blockChance", label: "block", group: "defense", format: "percent", description: "Chance to take no damage from a hit that lands. Capped at 75%." },
  { key: "ward", label: "ward", group: "defense", format: "number", scale: "defenseRating", description: "Absorbs damage of any kind before HP, and refills at the start of each encounter. Adds to the ward from Int." },
  { key: "wardOnDodge", label: "ward on dodge", group: "defense", format: "number", description: "Ward gained each time a monster's attack misses you entirely, up to your max ward." },
  { key: "wardOnDodgePercent", label: "of max ward on dodge", group: "defense", format: "percent", description: "Share of your max ward gained each time a monster's attack misses you entirely." },
  { key: "wardOnBlock", label: "ward on block", group: "defense", format: "number", description: "Ward gained each time you block a hit, up to your max ward." },
  { key: "wardOnBlockPercent", label: "of max ward on block", group: "defense", format: "percent", description: "Share of your max ward gained each time you block a hit." },
  { key: "hpLostAsWard", label: "of HP lost gained as ward", group: "defense", format: "percent", description: "When a hit takes HP, you gain this share of the HP lost as ward, up to your max ward. Over 100% gives back more ward than the HP you lost." },
  { key: "fireResist", label: "fire res", group: "defense", format: "percent", description: "Reduces fire damage taken. Capped at 75%." },
  { key: "coldResist", label: "cold res", group: "defense", format: "percent", description: "Reduces cold damage taken. Capped at 75%." },
  { key: "lightningResist", label: "lightning res", group: "defense", format: "percent", description: "Reduces lightning damage taken. Capped at 75%." },
  { key: "physicalDamage", label: "phys dmg", group: "offense", format: "number", scale: "weaponDamage", description: "Added to each hit. Reduced by the target's armor." },
  { key: "fireDamage", label: "fire dmg", group: "offense", format: "number", scale: "weaponDamage", description: "Added to each hit. Ignores armor, reduced by fire resistance." },
  { key: "coldDamage", label: "cold dmg", group: "offense", format: "number", scale: "weaponDamage", description: "Added to each hit. Ignores armor, reduced by cold resistance." },
  { key: "lightningDamage", label: "lightning dmg", group: "offense", format: "number", scale: "weaponDamage", description: "Added to each hit. Ignores armor, reduced by lightning resistance." },
  { key: "physicalToFire", label: "phys converted to fire", group: "offense", format: "percent", description: "Share of physical damage dealt as fire instead. It ignores armor and uses elemental scaling." },
  { key: "physicalToCold", label: "phys converted to cold", group: "offense", format: "percent", description: "Share of physical damage dealt as cold instead. It ignores armor and uses elemental scaling." },
  { key: "physicalToLightning", label: "phys converted to lightning", group: "offense", format: "percent", description: "Share of physical damage dealt as lightning instead. It ignores armor and uses elemental scaling." },
  { key: "healthAsFire", label: "of max HP added as fire dmg", group: "offense", format: "percent", description: "Each hit adds this share of your max HP as fire damage, before increased damage. Best on heroes built for life." },
  { key: "evasionAsCold", label: "of evasion added as cold dmg", group: "offense", format: "percent", description: "Each hit adds this share of your evasion rating as cold damage, before increased damage. Best on heroes built for evasion." },
  { key: "wardAsLightning", label: "of max ward added as lightning dmg", group: "offense", format: "percent", description: "Each hit adds this share of your max ward as lightning damage, before increased damage. Best on heroes built for ward." },
  { key: "increasedDamage", label: "increased dmg", group: "offense", format: "percent", description: "Multiplies all damage." },
  { key: "increasedPhysicalDamage", label: "increased phys dmg", group: "offense", format: "percent", description: "Multiplies physical damage." },
  { key: "increasedElementalDamage", label: "increased elemental dmg", group: "offense", format: "percent", description: "Multiplies fire, cold and lightning damage." },
  { key: "attackSpeed", label: "attack speed", group: "offense", format: "percent", description: "Multiplies the weapon's attacks per second." },
  { key: "accuracy", label: "accuracy", group: "offense", format: "number", description: "Chance to hit, against the target's evasion." },
  { key: "critChance", label: "crit chance", group: "offense", format: "percent", description: "Chance for a hit to crit. Over 100% guarantees the first crit level." },
  { key: "critMultiplier", label: "crit multiplier", group: "offense", format: "percent", description: "Added to the +50% each crit level adds." },
  { key: "igniteChance", label: "chance to ignite", group: "offense", format: "percent", description: "Added to the 25% chance that a hit carrying fire damage sets the target burning." },
  { key: "chillChance", label: "chance to chill", group: "offense", format: "percent", description: "Added to the 25% chance that a hit carrying cold damage chills the target." },
  { key: "shockChance", label: "chance to shock", group: "offense", format: "percent", description: "Added to the 25% chance that a hit carrying lightning damage shocks the target." },
  { key: "ailmentEffect", label: "ailment effect", group: "offense", format: "percent", description: "Makes your burns deal more damage, and your chills and shocks stronger. Chill and Shock still stop at their 50% caps." }
];
const familyOf = {
  increasedMaxHealth: "maxHealth",
  increasedArmor: "armor",
  increasedEvasion: "evasion",
  increasedPhysicalDamage: "physicalDamage"
};
function statFamily(key) {
  return familyOf[key] ?? key;
}
function familyLabel(family) {
  var _a2;
  return ((_a2 = statDefs[family]) == null ? void 0 : _a2.label) ?? family;
}
const coreStats = ["armor", "evasion", "blockChance", "ward", "hpLostAsWard", "physicalDamage", "fireDamage", "coldDamage", "lightningDamage"];
function isCoreStat(key) {
  return coreStats.includes(key);
}
const cappedStats = ["armor", "evasion", "blockChance", "ward", "physicalDamage", "fireDamage", "coldDamage", "lightningDamage"];
function isCappedStat(key) {
  return cappedStats.includes(key);
}
function baseEntry(entry) {
  return typeof entry === "number" ? [entry, Infinity] : entry;
}
const statDefs = Object.fromEntries(list$2.map((s) => [s.key, s]));
const statOrder = list$2.map((s) => s.key);
const elements = ["fire", "cold", "lightning"];
const resistStat = { fire: "fireResist", cold: "coldResist", lightning: "lightningResist" };
function roundStat(key, value) {
  return statDefs[key].format === "percent" ? Math.round(value * 1e3) / 1e3 : Math.round(value * 10) / 10;
}
function formatStatValue(key, value) {
  const def = statDefs[key];
  if (def.format === "percent") {
    const pct2 = Math.round(value * 1e3) / 10;
    return `${pct2}%`;
  }
  if (value !== 0 && Math.abs(value) < 0.1) {
    return String(Math.round(value * 100) / 100);
  }
  return String(Math.round(value * 10) / 10);
}
function formatStat(key, value) {
  return `${value < 0 ? "" : "+"}${formatStatValue(key, value)} ${statDefs[key].label}`;
}
function formatStats(values) {
  if (!values) {
    return "";
  }
  return statOrder.filter((k) => values[k]).map((k) => formatStat(k, values[k])).join(", ");
}
function addStats(into, from, scale = 1) {
  if (!from) {
    return into;
  }
  for (const key of statOrder) {
    const v = from[key];
    if (v) {
      into[key] = (into[key] ?? 0) + v * scale;
    }
  }
  return into;
}
function baseStatEntries(base, scaleOf, roundOf = (_, v) => v) {
  return Object.entries(base.stats).map(([stat, entry]) => {
    const [raw, rawCap] = baseEntry(entry);
    const scale = scaleOf(stat);
    const value = roundOf(stat, raw * scale), cap = rawCap === Infinity ? Infinity : roundOf(stat, rawCap * scale);
    const text = cap === Infinity ? formatStat(stat, value) : `${formatStat(stat, value)} (cap ${formatStatValue(stat, cap)})`;
    return { stat, value, text };
  });
}
const CAP_RULE = "Core stats (flat damage, armor, evasion, ward, block and HP lost as ward) are summed across base materials and capped by the highest cap among them. Other stats add up with no cap.";
const PHYS = [0, 3, 6, 9, 13, 18, 24, 30, 36, 43, 50, 58, 66, 75, 85, 96];
const DEFENSE$1 = [0, 3, 6, 8, 11, 17, 21, 25, 30, 36, 41, 48, 55, 63, 72, 80];
const BLOCK = [0, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.1, 0.11, 0.12, 0.13, 0.14, 0.15, 0.16, 0.17, 0.18];
const ELEMENTAL_SHARE = 0.45;
const HP_UNIT = 3;
const DECORATIONS = [0, 1, 2, 2, 3, 3, 4, 4, 4, 5, 5, 6, 6, 6, 7, 7];
function coreValue(stat, power) {
  switch (stat) {
    case "physicalDamage":
      return PHYS[power];
    case "fireDamage":
    case "coldDamage":
    case "lightningDamage":
      return PHYS[power] * ELEMENTAL_SHARE;
    case "blockChance":
      return BLOCK[power];
    // Ward is 0.6x armor and evasion (0.3x here, doubled with the gear pool below).
    case "ward":
      return 0.3 * DEFENSE$1[power];
    case "hpLostAsWard":
      return BLOCK[power];
    default:
      return DEFENSE$1[power];
  }
}
const SECONDARY = {
  str: [1, "flat"],
  dex: [1, "flat"],
  int: [1, "flat"],
  accuracy: [3, "flat"],
  maxHealth: [HP_UNIT, "flat"],
  critChance: [0.03, "percent"],
  attackSpeed: [0.03, "percent"],
  lifeLeech: [0.012, "percent"],
  lifeRegenPercent: [5e-3, "percent"],
  critMultiplier: [0.1, "percent"],
  fireResist: [0.04, "percent"],
  coldResist: [0.04, "percent"],
  lightningResist: [0.04, "percent"],
  increasedElementalDamage: [0.06, "percent"],
  increasedDamage: [0.04, "percent"]
};
const LIFE_ON_HIT_TOP = [0, 0.5, 0.75, 1, 1.5, 2, 3, 5, 7, 11, 17, 24, 31, 40, 50, 60];
const LIFE_REGEN_TOP = [0, 1, 2, 3, 6, 10, 20, 40, 60, 90, 120, 140, 160, 180, 200, 220];
const CURVED = { lifeOnHit: LIFE_ON_HIT_TOP, lifeRegen: LIFE_REGEN_TOP };
function secondaryValue(stat, power) {
  const curve0 = CURVED[stat];
  if (curve0) return curve0[power] / 2;
  const [unit, curve] = SECONDARY[stat] ?? [0, "flat"];
  return unit * (curve === "flat" ? power : (power + 2) / 3);
}
const DEFENSE_AS_DAMAGE = {
  healthAsFire: { 2: 0.015, 7: 0.02, 12: 0.025 },
  evasionAsCold: { 4: 0.065, 8: 0.07, 11: 0.075 },
  wardAsLightning: { 5: 0.09, 7: 0.1, 11: 0.11 }
};
function fairDefenseAsDamage(stat, power) {
  const level = 1 + 3 * (power - 1);
  const typical = stat === "healthAsFire" ? Math.max(28, 15 * Math.pow(power, 1.75)) : stat === "evasionAsCold" ? 4 * DEFENSE$1[power] + 1.5 * level : 2.4 * DEFENSE$1[power] + 1.5 * level;
  return 0.3 * PHYS[power] / typical;
}
function defenseAsDamage(stat, power) {
  return DEFENSE_AS_DAMAGE[stat][power] ?? Math.round(200 * fairDefenseAsDamage(stat, power)) / 200;
}
const ROLES = {
  cap: { value: 0.6, cap: 3.75, secondary: 0, decorations: 0 },
  value: { value: 1.5, cap: 2.5, secondary: 0, decorations: 0 },
  decor: { value: 0.7, cap: 2, secondary: 0.5, decorations: 1 },
  secondary: { value: 0.4, cap: 1.5, secondary: 2, decorations: 0 },
  balanced: { value: 1, cap: 2.5, secondary: 1, decorations: 0 },
  capMixed: { value: 0.5, cap: 3.25, secondary: 0.75, decorations: 0 }
};
function round(value, percent) {
  if (percent) return Math.round(value * 100) / 100;
  return value < 3 ? Math.round(value * 10) / 10 : Math.round(value);
}
const isPercent = (stat) => {
  var _a2;
  return stat === "blockChance" || stat === "hpLostAsWard" || ((_a2 = SECONDARY[stat]) == null ? void 0 : _a2[1]) === "percent";
};
const PAIRED_ATTRIBUTE = [0, 1, 2, 4, 5, 6, 8, 9, 11, 12, 13, 15, 16, 18, 19, 20];
function craft(power, role, core, secondary = {}, options = {}) {
  const r = ROLES[role];
  const boost = options.boost ?? 1;
  const stats = {};
  for (const [stat, share] of Object.entries(core)) {
    const v = coreValue(stat, power) * share * boost;
    const value = round(v * r.value, isPercent(stat));
    stats[stat] = isCappedStat(stat) ? [value, round(v * r.cap, isPercent(stat))] : value;
  }
  for (const [stat, share] of Object.entries(secondary)) {
    stats[stat] = round(secondaryValue(stat, power) * r.secondary * share * boost, isPercent(stat));
  }
  if (options.attr) stats[options.attr] = (typeof stats[options.attr] === "number" ? stats[options.attr] : 0) + PAIRED_ATTRIBUTE[power];
  const base = { stats, maxDecorations: DECORATIONS[power] + r.decorations, role };
  if (options.itemLabel) base.itemLabel = options.itemLabel;
  if (options.labelPriority !== void 0) base.labelPriority = options.labelPriority;
  return base;
}
function withStats(base, extra) {
  return { ...base, stats: { ...base.stats, ...extra } };
}
const amuletWard = (power, boost = 1) => Math.round(0.3 * DEFENSE$1[power] * boost);
function accessory(role, stats, maxDecorations, itemLabel) {
  return itemLabel ? { stats, maxDecorations, role, itemLabel } : { stats, maxDecorations, role };
}
const roleLabel = {
  cap: "High cap",
  value: "High value",
  decor: "Extra decorations",
  secondary: "High secondary",
  balanced: "Balanced",
  capMixed: "High cap + secondary",
  focused: "Focused",
  paired: "Paired"
};
const roleHint = {
  cap: "Low core value but a high cap: one of these lets the rest of the craft fill higher.",
  value: "High core value for its tier, so you reach the cap in fewer slots.",
  decor: "More decoration slots than most of its tier.",
  secondary: "Light on the core stat, heavy on a secondary stat.",
  balanced: "Some core stat, some secondary stat.",
  capMixed: "A high cap and some secondary stat, with a low core value.",
  focused: "One stat at full strength.",
  paired: "Two stats at about half strength each."
};
const MYTHIC = 1.15, LEGENDARY = 1.25;
const GEMS = [
  { key: "ruby", name: "Ruby", attrs: ["str"], resists: ["fireResist"], text: "Red as a forge mouth. It hardens the arm, or the skin against fire." },
  { key: "sapphire", name: "Sapphire", attrs: ["int"], resists: ["lightningResist"], text: "Deep blue and still. It clears the mind, or grounds a storm." },
  { key: "emerald", name: "Emerald", attrs: ["dex"], resists: ["coldResist"], text: "Green and quick with light. It steadies the hand, or keeps out the cold." },
  { key: "tigerEye", name: "Tiger's Eye", attrs: ["str", "dex"], resists: ["fireResist", "coldResist"], text: "Banded gold and brown. Strength and speed, or shelter from fire and frost." },
  { key: "sunstone", name: "Sunstone", attrs: ["str", "int"], resists: ["fireResist", "lightningResist"], text: "Warm to the touch and bright inside. Strength and wit, or shelter from fire and storm." },
  { key: "opal", name: "Opal", attrs: ["int", "dex"], resists: ["lightningResist", "coldResist"], text: "Every color at once. Wit and speed, or shelter from storm and frost." }
];
const SINGLE_GRADES = [
  ["", "", " Shard", 2, 2, 0.05],
  ["", "", "", 5, 4, 0.1],
  ["flawless", "Flawless ", "", 8, 8, 0.2],
  ["radiant", "Radiant ", "", 12, 12, 0.3]
];
const COMBO_GRADES = [
  ["rough", "Rough ", "", 3, 1.5, 0.03],
  ["", "", "", 6, 3, 0.06],
  ["polished", "Polished ", "", 10, 6, 0.12],
  ["brilliant", "Brilliant ", "", 13, 8, 0.16]
];
function gemKey(gem, grade, suffix = "") {
  const base = grade ? grade + gem[0].toUpperCase() + gem.slice(1) : gem;
  return suffix ? base + suffix.trim() : base;
}
function gemMaterials() {
  return GEMS.flatMap((g) => (g.attrs.length > 1 ? COMBO_GRADES : SINGLE_GRADES).map(([grade, before, after, power, attr, resist]) => {
    const attrs = Object.fromEntries(g.attrs.map((a) => [a, attr]));
    const resists = Object.fromEntries(g.resists.map((r) => [r, resist]));
    return {
      key: gemKey(g.key, grade, after),
      name: before + g.name + after,
      prefix: before + g.name,
      power,
      description: g.text,
      decoration: { weapon: attrs, accessory: attrs, armor: resists }
    };
  }));
}
const list$1 = [
  // ---- Power 1: Quest 1 commons ----
  {
    key: "wood",
    name: "Wood",
    prefix: "Wooden",
    power: 1,
    description: "Light and cheap. Steadies a weapon and makes a fair shield.",
    base: {
      weapon: craft(1, "balanced", { physicalDamage: 1 }, { accuracy: 1 }),
      // A wooden bow outshoots other wooden weapons, and a staff carries a little focus.
      bow: craft(1, "value", { physicalDamage: 1 }, {}, { itemLabel: "Wooden Longbow" }),
      staff: craft(1, "balanced", { physicalDamage: 1 }, { int: 0.5, str: 0.5 }),
      wand: craft(1, "balanced", { physicalDamage: 1 }, { int: 1 }, { itemLabel: "Wooden Wand" }),
      shield: craft(1, "decor", { armor: 1, blockChance: 1 })
    },
    decoration: { weapon: { accuracy: 4 }, shield: { blockChance: 0.01 } }
  },
  {
    key: "copperOre",
    name: "Copper Ore",
    prefix: "Copper",
    power: 1,
    description: "A soft metal that carries a spark. Heavy for its size.",
    base: {
      weapon: craft(1, "value", { physicalDamage: 1 }),
      // A copper-banded bow: low damage, high cap, for wood to fill (the wooden longbow is the value bow).
      bow: craft(1, "cap", { physicalDamage: 1 }),
      armor: craft(1, "value", { armor: 1 }),
      bodyArmor: craft(1, "value", { armor: 1 }, {}, { itemLabel: "Copper Mail" }),
      accessory: accessory("focused", { lightningResist: 0.12 }, 1)
    },
    decoration: { weapon: { physicalToLightning: 0.25 }, armor: { lightningResist: 0.04 } }
  },
  {
    key: "roughHide",
    name: "Rough Hide",
    prefix: "Hide",
    power: 1,
    description: "Light armor that favors dodging over soaking hits.",
    base: {
      armor: craft(1, "value", { evasion: 1 }),
      bodyArmor: craft(1, "value", { evasion: 1 }, {}, { itemLabel: "Hide Vest" }),
      belt: accessory("focused", { maxHealth: 8 }, 1)
    },
    decoration: { armor: { maxHealth: 3 } },
    equip: { itemType: "bodyArmor", name: "Hide Wrap", stats: { evasion: 1 } }
  },
  {
    key: "boneShard",
    name: "Bone Shard",
    prefix: "Bone",
    power: 1,
    description: "Sharp splinters for charms and crude blades.",
    base: {
      dagger: craft(1, "balanced", { physicalDamage: 1 }, { critChance: 0.5, int: 0.5 }),
      accessory: accessory("decor", { critChance: 0.02 }, 2),
      ring: accessory("focused", { critMultiplier: 0.15 }, 1, "Bone Charm"),
      amulet: accessory("decor", { int: 2 }, 2),
      // Bramble Road's first ward and INT for casters' helmets and shields.
      helmet: craft(1, "balanced", { ward: 1 }, {}, { attr: "int", itemLabel: "Bone Circlet" }),
      shield: craft(1, "balanced", { ward: 1 }, {}, { attr: "int", itemLabel: "Bone Ward" })
    },
    decoration: { weapon: { critMultiplier: 0.08 }, armor: { ward: 1 }, accessory: { critChance: 0.02 } },
    equip: { itemType: "dagger", name: "Bone Shiv", stats: { physicalDamage: 2 } }
  },
  {
    key: "flint",
    name: "Flint",
    prefix: "Flint",
    power: 1,
    description: "Knaps to a wicked edge. Axes and daggers made from it find weak spots.",
    base: {
      axe: craft(1, "balanced", { physicalDamage: 1 }, { critChance: 0.5, dex: 0.5 }),
      dagger: craft(1, "secondary", { physicalDamage: 1 }, { critChance: 0.5, dex: 0.5 })
    },
    decoration: { weapon: { critChance: 0.02 }, ring: { fireDamage: 1 } }
  },
  {
    key: "hawkFeather",
    name: "Hawk Feather",
    prefix: "Feathered",
    power: 1,
    description: "Fletching for true arrows, and a light step in boots.",
    base: {
      bow: craft(1, "secondary", { physicalDamage: 1 }, { accuracy: 0.5, dex: 0.5 }),
      boots: craft(1, "balanced", { evasion: 1 }, {}, { attr: "dex" })
    },
    decoration: { bow: { dex: 1, accuracy: 3 }, weapon: { accuracy: 2, dex: 1 }, helmet: { accuracy: 3 }, boots: { evasion: 2 } }
  },
  {
    key: "healingMoss",
    name: "Healing Moss",
    prefix: "Mossy",
    power: 1,
    description: "Soft green moss that knits small wounds, even between fights.",
    base: {
      armor: craft(1, "secondary", { evasion: 1 }, { lifeRegen: 1 }),
      belt: accessory("paired", { maxHealth: 4, lifeRegen: 0.5 }, 1)
    },
    decoration: { armor: { lifeRegen: 0.5 } }
  },
  {
    key: "sinew",
    name: "Sinew",
    prefix: "Sinew",
    power: 1,
    description: "Tough cord from wolves and boars. Binds a grip that bites back.",
    base: {
      gloves: craft(1, "secondary", { evasion: 1 }, { accuracy: 0.5, lifeOnHit: 0.5 }),
      ring: accessory("focused", { dex: 2 }, 1)
    },
    decoration: { weapon: { lifeOnHit: 0.5 }, axe: { lifeOnHit: 0.5, dex: 1 }, dagger: { lifeOnHit: 0.5, dex: 1 }, gloves: { accuracy: 3 }, accessory: { dex: 1 } }
  },
  // ---- Power 2: Quest 1 uncommons, Quest 2 commons ----
  {
    key: "ironOre",
    name: "Iron Ore",
    prefix: "Iron",
    power: 2,
    description: "Plain, heavy and dependable. Holds up under a lot of work.",
    base: {
      weapon: craft(2, "cap", { physicalDamage: 1 }),
      armor: craft(2, "cap", { armor: 1 }),
      bodyArmor: craft(2, "cap", { armor: 1 }, {}, { itemLabel: "Iron Mail", attr: "str" }),
      shield: craft(2, "cap", { armor: 1, blockChance: 1 }),
      accessory: accessory("focused", { str: 2 }, 1),
      belt: craft(2, "balanced", { armor: 1 }, {}, { attr: "str" })
    },
    decoration: { weapon: { physicalDamage: 2 }, greatsword: { physicalDamage: 2, str: 1 }, axe: { physicalDamage: 2, str: 1 }, armor: { armor: 3 }, belt: { str: 1 } }
  },
  {
    key: "tannedLeather",
    name: "Tanned Leather",
    prefix: "Leather",
    power: 2,
    description: "Supple armor for quick fighters, with room for plenty of trim.",
    base: {
      armor: craft(2, "decor", { evasion: 1 }),
      gloves: craft(2, "decor", { evasion: 1 }, { accuracy: 1 }, { attr: "dex" }),
      bodyArmor: craft(2, "decor", { evasion: 1 }, {}, { itemLabel: "Leather Armor" }),
      belt: accessory("focused", { maxHealth: 15 }, 2)
    },
    decoration: { armor: { evasion: 3 }, gloves: { dex: 2 }, accessory: { evasion: 3 } }
  },
  {
    key: "wolfFang",
    name: "Wolf Fang",
    prefix: "Fang",
    power: 2,
    description: "A predator's tooth. Quickens the hand that wears it.",
    base: {
      dagger: craft(2, "balanced", { physicalDamage: 1 }, { attackSpeed: 0.5, dex: 0.5 }),
      accessory: accessory("focused", { physicalDamage: [3, 6] }, 2),
      ring: accessory("focused", { attackSpeed: 0.06 }, 2, "Fang Ring")
    },
    decoration: { weapon: { physicalDamage: 3 }, axe: { physicalDamage: 2, dex: 1 }, accessory: { attackSpeed: 0.03 } },
    equip: { itemType: "dagger", name: "Wolf Fang", stats: { physicalDamage: 5 } }
  },
  {
    key: "thornvine",
    name: "Thornvine",
    prefix: "Thorned",
    power: 2,
    description: "A barbed vine that drinks a little from every scratch it makes.",
    base: {
      weapon: craft(2, "secondary", { physicalDamage: 1 }, { lifeOnHit: 1 }),
      gloves: craft(2, "balanced", { evasion: 1 }, { lifeOnHit: 1 })
    },
    decoration: { weapon: { lifeOnHit: 0.5, physicalDamage: 1 }, gloves: { lifeOnHit: 0.5 } }
  },
  {
    key: "whetstone",
    name: "Whetstone",
    prefix: "Honed",
    power: 2,
    description: "Bandits carry these to keep a keen edge and a steady aim.",
    base: {
      sword: craft(2, "balanced", { physicalDamage: 1 }, { accuracy: 1 }),
      gloves: craft(2, "secondary", { armor: 1 }, { accuracy: 0.6, str: 0.4 }),
      helmet: craft(2, "balanced", { armor: 1 }, { accuracy: 1 })
    },
    decoration: { weapon: { increasedPhysicalDamage: 0.06, accuracy: 3 }, gloves: { accuracy: 6 }, helmet: { accuracy: 6 } }
  },
  {
    key: "trollBlood",
    name: "Troll Blood",
    prefix: "Trollblood",
    power: 2,
    description: "Thick, green and still trying to heal whatever it touches.",
    base: {
      armor: craft(2, "secondary", { armor: 1 }, { lifeRegen: 0.6, maxHealth: 0.4 }),
      belt: accessory("paired", { str: 2, lifeRegen: 1 }, 2)
    },
    decoration: { weapon: { healthAsFire: defenseAsDamage("healthAsFire", 2) }, armor: { lifeRegen: 1 }, accessory: { lifeRegen: 1 } }
  },
  // ---- Power 3: Quest 1 rares ----
  {
    key: "silverOre",
    name: "Silver Ore",
    prefix: "Silver",
    power: 3,
    description: "A bright, dense metal that wards off frost.",
    base: {
      weapon: craft(3, "value", { physicalDamage: 1 }),
      sword: craft(3, "balanced", { physicalDamage: 1 }, { str: 0.5, dex: 0.5, int: 0.5 }, { itemLabel: "Silver Blade" }),
      armor: craft(3, "balanced", { armor: 1 }, { coldResist: 1 }),
      bodyArmor: craft(3, "balanced", { armor: 1 }, { coldResist: 1 }, { itemLabel: "Silver Mail", attr: "str" }),
      accessory: accessory("paired", { maxHealth: 12, increasedDamage: 0.06 }, 3)
    },
    decoration: { weapon: { physicalDamage: 2, coldDamage: 1 }, sword: { str: 1, dex: 1, int: 1 }, armor: { coldResist: 0.06 }, accessory: { coldResist: 0.06 } }
  },
  {
    key: "moonstone",
    name: "Moonstone",
    prefix: "Moonstone",
    power: 3,
    description: "A cold, glowing gem. Sharpens the mind and shields it.",
    base: {
      staff: craft(3, "balanced", { coldDamage: 1 }, { int: 1 }),
      wand: craft(3, "balanced", { coldDamage: 1 }, { int: 1 }),
      armor: craft(3, "balanced", { ward: 1, hpLostAsWard: 1 }, { int: 1 }),
      accessory: accessory("paired", { int: 4, critChance: 0.04 }, 3),
      amulet: accessory("paired", { int: 4, ward: amuletWard(3) }, 3)
    },
    decoration: { weapon: { coldDamage: 2, physicalToCold: 0.2 }, staff: { int: 2, physicalToCold: 0.2 }, wand: { int: 2, physicalToCold: 0.2 }, dagger: { int: 1, coldDamage: 1 }, armor: { ward: 1, hpLostAsWard: 0.02 }, accessory: { ward: 2, increasedMaxHealth: 0.03 } }
  },
  {
    key: "bloodstone",
    name: "Bloodstone",
    prefix: "Bloodstone",
    power: 3,
    description: "A dark red gem that pulls life back from every wound you deal.",
    base: {
      weapon: craft(3, "secondary", { physicalDamage: 1 }, { lifeOnHit: 1 }),
      gloves: craft(3, "secondary", { evasion: 1 }, { accuracy: 0.4, lifeRegenPercent: 0.6 }),
      ring: accessory("focused", { lifeRegenPercent: 0.012 }, 3)
    },
    decoration: { weapon: { lifeRegenPercent: 4e-3 }, gloves: { lifeRegenPercent: 4e-3 }, accessory: { maxHealth: 8 } }
  },
  {
    key: "amber",
    name: "Amber",
    prefix: "Amber",
    power: 3,
    description: "Golden resin with a wasp trapped inside. Steadies the eye.",
    base: {
      bow: craft(3, "balanced", { physicalDamage: 1 }, { dex: 0.5, accuracy: 0.5 }),
      dagger: craft(3, "balanced", { physicalDamage: 1 }, { dex: 0.5, int: 0.5 }, { itemLabel: "Amber Kris" }),
      helmet: craft(3, "balanced", { evasion: 1 }, { accuracy: 1 }),
      accessory: accessory("paired", { dex: 4, accuracy: 6 }, 3)
    },
    decoration: { weapon: { accuracy: 8 }, armor: { dex: 1, accuracy: 4 }, accessory: { dex: 1, accuracy: 4 } }
  },
  // ---- Power 4: Quest 2 uncommons ----
  {
    key: "steelIngot",
    name: "Steel Ingot",
    prefix: "Steel",
    power: 4,
    description: "Refined iron. Takes a finer edge and a thicker plate than anything before it.",
    base: {
      weapon: craft(4, "value", { physicalDamage: 1 }),
      armor: craft(4, "value", { armor: 1 }),
      bodyArmor: craft(4, "value", { armor: 1 }, {}, { itemLabel: "Steel Plate", attr: "str" }),
      shield: craft(4, "value", { armor: 1, blockChance: 1 })
    },
    decoration: { weapon: { physicalDamage: 4 }, greatsword: { physicalDamage: 3, str: 2 }, armor: { armor: 5 }, gloves: { increasedPhysicalDamage: 0.05 } }
  },
  {
    key: "trollHide",
    name: "Troll Hide",
    prefix: "Trollhide",
    power: 4,
    description: "Thick, stubborn hide. Light enough to dodge in and tough enough to soak hits.",
    base: {
      armor: craft(4, "balanced", { evasion: 1 }, { maxHealth: 1 }),
      bodyArmor: craft(4, "balanced", { evasion: 1 }, { maxHealth: 1 }, { itemLabel: "Trollhide Coat" }),
      belt: accessory("focused", { maxHealth: 30 }, 3)
    },
    decoration: { armor: { maxHealth: 12 }, belt: { lifeRegen: 2 }, accessory: { increasedMaxHealth: 0.05 } }
  },
  {
    key: "garnet",
    name: "Garnet",
    prefix: "Garnet",
    power: 4,
    description: "A fiery gem with a different gift in every slot.",
    base: {
      weapon: craft(4, "value", { fireDamage: 1 }),
      armor: craft(4, "secondary", { armor: 1 }, { fireResist: 0.625 }),
      accessory: accessory("focused", { str: 5 }, 3)
    },
    decoration: { weapon: { fireDamage: 4 }, armor: { fireResist: 0.08 }, accessory: { str: 1, fireResist: 0.04 }, amulet: { increasedElementalDamage: 0.1 } }
  },
  {
    key: "spiderSilk",
    name: "Spider Silk",
    prefix: "Silken",
    power: 4,
    description: "Fine, strong thread from the mine's spiders. Makes the best bowstrings.",
    base: {
      bow: craft(4, "capMixed", { physicalDamage: 1 }, { dex: 1 }),
      dagger: craft(4, "capMixed", { physicalDamage: 1 }, { dex: 0.5, int: 0.5 }, { itemLabel: "Silken Stiletto" }),
      gloves: craft(4, "balanced", { evasion: 1 }, { accuracy: 1 }, { attr: "dex" }),
      armor: craft(4, "capMixed", { evasion: 1 }, { dex: 1 }),
      bodyArmor: craft(4, "capMixed", { evasion: 1 }, { dex: 1 }, { itemLabel: "Silk Robe" })
    },
    decoration: { weapon: { accuracy: 10 }, armor: { evasion: 5 }, accessory: { dex: 3 } }
  },
  {
    key: "ancientBone",
    name: "Ancient Bone",
    prefix: "Bonewrought",
    power: 4,
    description: "Bones of old miners, hard as stone and too stubborn to stay down.",
    base: {
      weapon: craft(4, "cap", { physicalDamage: 1 }),
      axe: craft(4, "capMixed", { physicalDamage: 1 }, { str: 1 }),
      greatsword: craft(4, "capMixed", { physicalDamage: 1 }, { str: 1 }),
      staff: craft(4, "capMixed", { physicalDamage: 1 }, { str: 0.5, int: 0.5 }),
      helmet: craft(4, "balanced", { armor: 1 }, { lifeRegen: 1 }),
      boots: craft(4, "balanced", { armor: 1 }, { lifeRegen: 1 })
    },
    decoration: { weapon: { str: 2, lifeOnHit: 0.5 }, helmet: { lifeRegen: 2 }, boots: { lifeRegen: 2 }, accessory: { str: 2, lifeRegen: 2 } }
  },
  {
    key: "ritualAsh",
    name: "Ritual Ash",
    prefix: "Ashen",
    power: 4,
    description: "Ash from kobold fire rites, still warm. Feeds a caster's mind and wards it.",
    base: {
      staff: craft(4, "capMixed", { fireDamage: 1 }, { int: 0.5, str: 0.5 }),
      wand: craft(4, "capMixed", { fireDamage: 1 }, { int: 1 }),
      helmet: craft(4, "secondary", { ward: 1, hpLostAsWard: 1 }, { fireResist: 0.4 }, { attr: "int" }),
      armor: craft(4, "value", { ward: 1 }),
      amulet: accessory("paired", { int: 4, increasedElementalDamage: 0.08 }, 3)
    },
    decoration: { weapon: { fireDamage: 2, int: 2 }, helmet: { int: 3, hpLostAsWard: 0.03 }, accessory: { int: 4 } }
  },
  // ---- Power 5: Quest 2 rare ----
  {
    key: "mithril",
    name: "Mithril",
    prefix: "Mithril",
    power: 5,
    description: "Light as leather and harder than steel. Takes fine work well.",
    base: {
      weapon: craft(5, "decor", { physicalDamage: 1 }, { attackSpeed: 1 }),
      armor: craft(5, "decor", { armor: 0.6, evasion: 0.6 }),
      bodyArmor: craft(5, "decor", { armor: 0.6, evasion: 0.6 }, {}, { itemLabel: "Mithril Mail" }),
      accessory: accessory("paired", { maxHealth: 25, physicalDamage: [6, 12] }, 4)
    },
    decoration: { weapon: { physicalDamage: 6 }, armor: { armor: 4 }, accessory: { increasedPhysicalDamage: 0.08 } }
  },
  {
    key: "broodfang",
    name: "Broodfang",
    prefix: "Broodfang",
    power: 5,
    description: "A fang from the Broodmother herself. It drinks deep.",
    base: {
      dagger: craft(5, "secondary", { physicalDamage: 1 }, { critChance: 0.5, lifeOnHit: 0.5 }),
      weapon: craft(5, "balanced", { physicalDamage: 1 }, { lifeOnHit: 1 }),
      gloves: craft(5, "secondary", { armor: 1 }, { lifeRegenPercent: 0.5, lifeOnHit: 0.5 })
    },
    decoration: { weapon: { lifeOnHit: 1 }, gloves: { lifeOnHit: 1 }, accessory: { maxHealth: 15 } }
  },
  // ---- Tier 3 area commons: one per area, alongside the shared Hollow Mines uncommons. ----
  {
    key: "brimstone",
    name: "Brimstone",
    prefix: "Brimstone",
    power: 4,
    description: "Yellow stone that smoulders on the Ashen slopes. Hot to work, hotter to be hit with.",
    base: {
      weapon: craft(4, "balanced", { fireDamage: 1 }, { increasedElementalDamage: 1 }),
      armor: craft(4, "balanced", { armor: 1 }, { fireResist: 0.5, maxHealth: 0.5 })
    },
    decoration: { weapon: { fireDamage: 3, physicalToFire: 0.15, igniteChance: 0.05 }, armor: { fireResist: 0.06 } }
  },
  {
    key: "marshReed",
    name: "Marsh Reed",
    prefix: "Reedwoven",
    power: 4,
    description: "Tough reeds from the Sunken Marsh. Woven tight, they keep the cold out.",
    base: {
      bow: craft(4, "secondary", { physicalDamage: 1 }, { coldResist: 0.5, accuracy: 0.5 }),
      smallArmor: craft(4, "secondary", { evasion: 1 }, { coldResist: 1 })
    },
    decoration: { weapon: { accuracy: 5, chillChance: 0.04 }, armor: { coldResist: 0.04, evasion: 4 }, accessory: { evasionAsCold: defenseAsDamage("evasionAsCold", 4) } }
  },
  {
    key: "thunderhorn",
    name: "Thunder Crab Claw",
    prefix: "Crabclaw",
    power: 4,
    description: "A claw from the thunder crabs of Stormwrack Coast. Struck, it rings like a bell.",
    base: {
      axe: craft(4, "balanced", { physicalDamage: 1 }, { critMultiplier: 1 }),
      helmet: craft(4, "secondary", { armor: 1 }, { lightningResist: 1 })
    },
    decoration: { weapon: { lightningDamage: 3 }, armor: { lightningResist: 0.06 } }
  },
  // ---- Tier 3, shared: drop as uncommons and rares in every tier 3 area. ----
  {
    key: "quicksilver",
    name: "Quicksilver",
    prefix: "Quicksilver",
    power: 5,
    description: "Metal that will not sit still. Edges made with it find the gaps.",
    base: {
      weapon: craft(5, "secondary", { physicalDamage: 1 }, { critChance: 1 }),
      gloves: craft(5, "secondary", { evasion: 1 }, { critChance: 0.5, attackSpeed: 0.5 }),
      accessory: accessory("paired", { critChance: 0.05, attackSpeed: 0.05 }, 3),
      amulet: accessory("paired", { attackSpeed: 0.05, dex: 4 }, 3)
    },
    decoration: { weapon: { critChance: 0.03 }, accessory: { critMultiplier: 0.12 } }
  },
  {
    key: "runedSlate",
    name: "Runed Slate",
    prefix: "Runed",
    power: 5,
    description: "Slate cut with old warding signs. It catches harm before it lands.",
    base: {
      armor: craft(5, "cap", { ward: 1 }),
      bodyArmor: craft(5, "cap", { ward: 1 }, {}, { itemLabel: "Runed Robe" }),
      shield: craft(5, "balanced", { blockChance: 1, ward: 1 }, {}, { attr: "int" }),
      staff: craft(5, "secondary", { physicalDamage: 1 }, { int: 1 })
    },
    decoration: { weapon: { wardAsLightning: defenseAsDamage("wardAsLightning", 5) }, armor: { ward: 2, int: 2 }, shield: { wardOnBlock: 5 }, accessory: { ward: 2, int: 4 } }
  },
  {
    key: "wyvernLeather",
    name: "Wyvern Leather",
    prefix: "Wyvernhide",
    power: 5,
    description: "Supple hide from the wyverns that roam all three wilds. Light and tough.",
    base: {
      smallArmor: craft(5, "value", { evasion: 1 }),
      bodyArmor: craft(5, "value", { evasion: 1 }, {}, { itemLabel: "Wyvernhide Jerkin" }),
      belt: accessory("paired", { maxHealth: 30, dex: 4 }, 3)
    },
    decoration: { armor: { evasion: 4 }, belt: { maxHealth: 8, fireResist: 0.04 } }
  },
  {
    key: "skyshard",
    name: "Skyshard",
    prefix: "Skyshard",
    power: 6,
    description: "A fallen star, still warm. Every tier 3 wild has a few.",
    base: {
      weapon: craft(6, "decor", { physicalDamage: 1 }, { increasedDamage: 1 }),
      armor: craft(6, "decor", { armor: 0.5, ward: 0.5 }),
      accessory: accessory("decor", { increasedDamage: 0.08 }, 5)
    },
    decoration: { weapon: { increasedDamage: 0.08 }, armor: { increasedMaxHealth: 0.06 }, accessory: { increasedDamage: 0.06 } }
  },
  // ---- Sunken Marsh: accuracy, life leech and lightning resistance, for answering Stormwrack Coast. ----
  {
    key: "bogIron",
    name: "Bog Iron",
    prefix: "Bog Iron",
    power: 5,
    description: "Iron pulled from the peat. Pitted, heavy, and it never misses its mark.",
    base: {
      weapon: craft(5, "balanced", { physicalDamage: 1 }, { accuracy: 1 }),
      gloves: craft(5, "balanced", { armor: 1 }, { accuracy: 1 })
    },
    decoration: { weapon: { accuracy: 15 }, gloves: { accuracy: 10 }, accessory: { accuracy: 8 } }
  },
  {
    key: "leechSac",
    name: "Leech Sac",
    prefix: "Leechling",
    power: 5,
    description: "A swollen leech, still hungry. Whatever it is bound to drinks.",
    base: {
      weapon: craft(5, "capMixed", { physicalDamage: 1 }, { lifeOnHit: 1 }),
      accessory: accessory("paired", { lifeRegenPercent: 0.012, maxHealth: 18 }, 3)
    },
    decoration: { weapon: { lifeRegenPercent: 5e-3 }, accessory: { lifeRegenPercent: 5e-3 } }
  },
  {
    key: "eelskin",
    name: "Eelskin",
    prefix: "Eelskin",
    power: 5,
    description: "Slick hide from the marsh eels, which shrug off lightning.",
    base: {
      smallArmor: craft(5, "balanced", { evasion: 1 }, { lightningResist: 1 }),
      bodyArmor: craft(5, "secondary", { evasion: 1 }, { lightningResist: 1 }, { itemLabel: "Eelskin Coat" }),
      accessory: accessory("paired", { lightningResist: 0.15, dex: 4 }, 3)
    },
    decoration: { armor: { lightningResist: 0.06, evasion: 4 }, accessory: { lightningResist: 0.06 } }
  },
  {
    key: "peatmoss",
    name: "Peat Moss",
    prefix: "Mossbound",
    power: 5,
    description: "Cold, damp and alive. Wounds packed with it close by themselves.",
    base: {
      armor: craft(5, "secondary", { ward: 1 }, { lifeRegen: 0.5, coldResist: 0.5 }),
      belt: accessory("paired", { lifeRegen: 6, coldResist: 0.12 }, 3),
      accessory: accessory("paired", { coldResist: 0.15, lifeRegen: 8 }, 3)
    },
    decoration: { armor: { coldResist: 0.05, maxHealth: 4 }, belt: { lifeRegen: 4 }, accessory: { coldResist: 0.05 } }
  },
  {
    key: "hagstone",
    name: "Hagstone",
    prefix: "Hagstone",
    power: 6,
    description: "A stone with a hole worn through it. Look through it and nothing hides.",
    base: {
      bow: craft(6, "capMixed", { physicalDamage: 1 }, { accuracy: 1 }),
      helmet: craft(6, "capMixed", { evasion: 1 }, { accuracy: 1 }),
      accessory: accessory("paired", { accuracy: 30, critChance: 0.06 }, 4),
      amulet: accessory("focused", { accuracy: 45 }, 4)
    },
    decoration: { weapon: { accuracy: 20 }, accessory: { accuracy: 12 } }
  },
  {
    key: "drownedSteel",
    name: "Drowned Steel",
    prefix: "Drowned",
    power: 6,
    description: "Armor from knights the marsh took long ago. Cold to the touch, and it bleeds the living.",
    base: {
      weapon: craft(6, "balanced", { physicalDamage: 1 }, { lifeOnHit: 2 }),
      armor: craft(6, "capMixed", { armor: 1 }, { coldResist: 0.5, lightningResist: 0.5 }),
      bodyArmor: craft(6, "capMixed", { armor: 1 }, { coldResist: 0.5, lightningResist: 0.5 }, { itemLabel: "Drowned Plate", attr: "str" })
    },
    decoration: { weapon: { lifeOnHit: 1, coldDamage: 6, chillChance: 0.05 }, armor: { lightningResist: 0.08, coldResist: 0.08 } }
  },
  // ---- Stormwrack Coast: evasion, block, attack speed and fire resistance, for answering Ashen Peaks. ----
  {
    key: "galeFeather",
    name: "Gale Feather",
    prefix: "Galewing",
    power: 5,
    description: "A pinion from the storm harpies. Arrows fletched with it fly before you loose them.",
    base: {
      bow: craft(5, "balanced", { physicalDamage: 1 }, { attackSpeed: 1 }),
      dagger: craft(5, "balanced", { physicalDamage: 1 }, { attackSpeed: 1 }),
      boots: craft(5, "balanced", { evasion: 1 }, { attackSpeed: 1 }, { attr: "dex" })
    },
    decoration: { weapon: { attackSpeed: 0.05 }, boots: { evasion: 4, wardOnDodge: 5 }, accessory: { attackSpeed: 0.05 } }
  },
  {
    key: "stormhide",
    name: "Stormhide",
    prefix: "Stormhide",
    power: 5,
    description: "Shell from the thunder crabs. Scorched a hundred times and never burnt through.",
    base: {
      armor: craft(5, "balanced", { evasion: 1 }, { fireResist: 1 }),
      bodyArmor: craft(5, "balanced", { evasion: 1 }, { fireResist: 1 }, { itemLabel: "Stormhide Vest" }),
      accessory: accessory("paired", { fireResist: 0.15, dex: 4 }, 3)
    },
    decoration: { armor: { fireResist: 0.06, lightningResist: 0.05 }, accessory: { fireResist: 0.03, lightningResist: 0.03 } }
  },
  {
    key: "cragGranite",
    name: "Wrackstone",
    prefix: "Wrack",
    power: 5,
    description: "Cliff stone worn smooth by a thousand storms. Heavy, and it turns every blow aside.",
    base: {
      shield: craft(5, "value", { armor: 1, blockChance: 1 }),
      helmet: craft(5, "value", { armor: 1 })
    },
    decoration: { shield: { blockChance: 0.04, wardOnBlock: 5 }, armor: { armor: 3, lightningResist: 0.03 }, accessory: { blockChance: 0.02 } }
  },
  {
    key: "ozoneShard",
    name: "Ozone Shard",
    prefix: "Ozone",
    power: 5,
    description: "Crystal grown where lightning strikes twice. It hums in the hand.",
    base: {
      weapon: craft(5, "value", { lightningDamage: 1 }),
      wand: craft(5, "balanced", { lightningDamage: 1 }, { int: 1 }),
      accessory: accessory("paired", { lightningDamage: [5, 10], attackSpeed: 0.04 }, 3)
    },
    decoration: { weapon: { lightningDamage: 5, physicalToLightning: 0.25, shockChance: 0.06 }, armor: { lightningResist: 0.05, ward: 2 } }
  },
  {
    key: "rocPlume",
    name: "Roc Plume",
    prefix: "Rocplume",
    power: 6,
    description: "A plume from the great birds of the storm cliffs. Wear it and you are never quite where they strike.",
    base: {
      smallArmor: craft(6, "capMixed", { evasion: 1 }, { attackSpeed: 1 }),
      bodyArmor: craft(6, "capMixed", { evasion: 1 }, { attackSpeed: 1 }, { itemLabel: "Rocplume Cloak" }),
      accessory: accessory("paired", { attackSpeed: 0.05, dex: 6 }, 4),
      belt: craft(6, "balanced", { evasion: 1 }, { attackSpeed: 0.5 })
    },
    decoration: { armor: { evasion: 5, wardOnDodge: 10 }, accessory: { increasedEvasion: 0.1, wardOnDodgePercent: 0.03 } }
  },
  {
    key: "thunderstone",
    name: "Thunderstone",
    prefix: "Thunder",
    power: 6,
    description: "A stone that crackles when struck. Shields made with it strike back.",
    base: {
      shield: craft(6, "capMixed", { blockChance: 1 }, { lightningResist: 0.5, fireResist: 0.5 }),
      staff: craft(6, "balanced", { lightningDamage: 1 }, { increasedElementalDamage: 1 })
    },
    decoration: { shield: { blockChance: 0.04, wardOnBlockPercent: 0.04 }, weapon: { lightningDamage: 7, increasedElementalDamage: 0.08, shockChance: 0.05 }, armor: { lightningResist: 0.12 } }
  },
  // ---- Mythics: only from rarity upgrades. A step above their tier, with effects normal crafting
  // can't reach yet, so they stay worth farming instead of being outgrown. ----
  {
    key: "thornheart",
    name: "Thornheart",
    prefix: "Thornheart",
    power: 4,
    description: "A knot of living bramble that turns blows aside. Worn as a charm, it blocks like a shield.",
    base: {
      shield: craft(4, "capMixed", { armor: 0.5, blockChance: 1.4 }, { maxHealth: 1 }, { boost: MYTHIC })
    },
    decoration: { shield: { blockChance: 0.03 }, armor: { blockChance: 0.02 }, accessory: { blockChance: 0.03 } },
    equip: { itemType: "amulet", name: "Thornheart Charm", stats: { blockChance: 0.15, maxHealth: 8 } }
  },
  {
    key: "wolfkingPelt",
    name: "Wolfking Pelt",
    prefix: "Wolfking",
    power: 4,
    description: "The pelt of the pack leader. Whoever wears it moves like a wolf.",
    base: {
      bodyArmor: craft(4, "balanced", { evasion: 1 }, { attackSpeed: 1 }, { boost: MYTHIC, itemLabel: "Wolfking Mantle" }),
      boots: craft(4, "balanced", { evasion: 1 }, { attackSpeed: 1 }, { boost: MYTHIC, attr: "dex" })
    },
    decoration: { boots: { attackSpeed: 0.04 }, armor: { evasion: 4, maxHealth: 5 } },
    equip: { itemType: "bodyArmor", name: "Wolfking Mantle", stats: { evasion: 8, attackSpeed: 0.08, accuracy: 6 } }
  },
  {
    key: "deepfireCore",
    name: "Deepfire Core",
    prefix: "Deepfire",
    power: 6,
    description: "A coal that never cools, from the bottom of the mines.",
    base: {
      accessory: accessory("paired", { fireDamage: [8, 16], fireResist: 0.15 }, 3)
    },
    decoration: { weapon: { increasedElementalDamage: 0.15, physicalToFire: 0.3 }, armor: { fireResist: 0.12 } },
    equip: { itemType: "ring", name: "Deepfire Ring", stats: { fireDamage: 8, fireResist: 0.15 } }
  },
  {
    key: "golemHeart",
    name: "Golem Heart",
    prefix: "Golemheart",
    power: 6,
    description: "The stone heart of an ore golem, still slowly beating.",
    base: {
      belt: withStats(craft(6, "balanced", { armor: 1 }, {}, { attr: "str" }), { increasedMaxHealth: 0.1 })
    },
    decoration: { armor: { increasedArmor: 0.1 }, belt: { increasedMaxHealth: 0.06 } },
    equip: { itemType: "belt", name: "Golem Heart Girdle", stats: { armor: 12, increasedMaxHealth: 0.1 } }
  },
  // ---- Ashen Peaks: fire resistance, armor and cold damage, for answering fire and armored foes. ----
  {
    key: "obsidian",
    name: "Obsidian",
    prefix: "Obsidian",
    power: 5,
    description: "Volcanic glass. Brittle alone, brutal when bound into a blade or plate.",
    base: {
      weapon: craft(5, "cap", { physicalDamage: 1 }),
      armor: craft(5, "cap", { armor: 1 }),
      bodyArmor: craft(5, "cap", { armor: 1 }, {}, { itemLabel: "Obsidian Plate" }),
      shield: craft(5, "cap", { armor: 1, blockChance: 1 })
    },
    decoration: { weapon: { physicalDamage: 3, critMultiplier: 0.1 }, armor: { armor: 3, fireResist: 0.04 }, shield: { blockChance: 0.03 } }
  },
  {
    key: "salamanderScale",
    name: "Salamander Scale",
    prefix: "Salamander",
    power: 5,
    description: "Scales that shrug off flame. The surest answer to the peaks.",
    base: {
      armor: craft(5, "secondary", { armor: 1 }, { fireResist: 1 }),
      bodyArmor: craft(5, "secondary", { armor: 1 }, { fireResist: 1 }, { itemLabel: "Salamander Hauberk" }),
      accessory: accessory("paired", { fireResist: 0.15, maxHealth: 18 }, 3)
    },
    decoration: { armor: { fireResist: 0.06, lifeRegen: 2 }, accessory: { fireResist: 0.06 } }
  },
  {
    key: "rimecoal",
    name: "Rimecoal",
    prefix: "Rimecoal",
    power: 5,
    description: "Coal that burns cold. The fire creatures of the peaks hate it.",
    base: {
      weapon: craft(5, "value", { coldDamage: 1 }),
      staff: craft(5, "balanced", { coldDamage: 1 }, { int: 1 }),
      wand: craft(5, "balanced", { coldDamage: 1 }, { int: 1 }),
      armor: craft(5, "capMixed", { ward: 1, hpLostAsWard: 1 }, { coldResist: 1 }),
      accessory: accessory("paired", { coldDamage: [5, 10], int: 4 }, 3)
    },
    decoration: { weapon: { coldDamage: 5, physicalToCold: 0.25, chillChance: 0.06 }, armor: { coldResist: 0.06, lifeRegen: 2 } }
  },
  {
    key: "cinderwool",
    name: "Cinderwool",
    prefix: "Cinderwool",
    power: 5,
    description: "Fleece from the mountain goats, singed but never burnt. Warm and forgiving.",
    base: {
      smallArmor: craft(5, "balanced", { evasion: 1 }, { lifeRegen: 1 }),
      belt: accessory("paired", { maxHealth: 35, lifeRegen: 6 }, 3)
    },
    decoration: { armor: { lifeRegen: 4 }, accessory: { lifeRegen: 3, fireResist: 0.03 } }
  },
  {
    key: "wyrmScale",
    name: "Wyrm Scale",
    prefix: "Wyrmscale",
    power: 6,
    description: "A scale from the Ashen Wyrm. Turns blades and flame alike.",
    base: {
      armor: craft(6, "capMixed", { armor: 1 }, { fireResist: 0.6, maxHealth: 0.4 }),
      bodyArmor: craft(6, "capMixed", { armor: 1 }, { fireResist: 0.6, maxHealth: 0.4 }, { itemLabel: "Wyrmscale Armor" }),
      shield: craft(6, "capMixed", { armor: 1, blockChance: 1 }, { fireResist: 1 })
    },
    decoration: { armor: { armor: 5, fireResist: 0.05 }, accessory: { increasedArmor: 0.1 } }
  },
  {
    key: "glacialHeart",
    name: "Glacial Heart",
    prefix: "Glacial",
    power: 6,
    description: "Ice that survived the mountain's fire. Holds a deep, patient cold.",
    base: {
      weapon: craft(6, "balanced", { coldDamage: 1 }, { increasedElementalDamage: 1 }),
      staff: craft(6, "capMixed", { coldDamage: 1 }, { increasedElementalDamage: 1 }),
      wand: craft(6, "capMixed", { coldDamage: 1 }, { increasedElementalDamage: 0.5, int: 0.5 }),
      armor: craft(6, "cap", { ward: 1, hpLostAsWard: 1 }),
      accessory: accessory("paired", { coldDamage: [7, 14], critChance: 0.1 }, 4),
      amulet: accessory("paired", { coldDamage: [7, 14], coldResist: 0.1 }, 4)
    },
    decoration: { weapon: { coldDamage: 6, physicalToCold: 0.3 }, armor: { hpLostAsWard: 0.05 }, amulet: { increasedElementalDamage: 0.12, hpLostAsWard: 0.06 }, ring: { coldResist: 0.07 } }
  },
  {
    key: "phoenixFeather",
    name: "Phoenix Feather",
    prefix: "Phoenix",
    power: 7,
    description: "A feather that rekindles itself. Whoever carries it keeps getting back up.",
    base: {
      accessory: accessory("paired", { lifeRegen: 24, fireResist: 0.15 }, 3)
    },
    decoration: { weapon: { healthAsFire: defenseAsDamage("healthAsFire", 7) }, armor: { lifeRegen: 16 }, accessory: { lifeRegen: 16 } },
    equip: { itemType: "amulet", name: "Phoenix Charm", stats: { lifeRegen: 30, fireResist: 0.2 } }
  },
  {
    key: "blackPearl",
    name: "Black Pearl",
    prefix: "Black Pearl",
    power: 7,
    description: "Grown in the marsh's deepest pool. It drinks the strength of whatever it touches.",
    base: {
      accessory: accessory("paired", { lifeRegenPercent: 0.018, lightningResist: 0.18 }, 4)
    },
    decoration: { weapon: { lifeOnHit: 2 }, accessory: { accuracy: 15 } },
    equip: { itemType: "ring", name: "Black Pearl Ring", stats: { lifeLeech: 0.05, accuracy: 25, lightningResist: 0.2 } }
  },
  {
    key: "tempestQuill",
    name: "Tempest Quill",
    prefix: "Tempest",
    power: 7,
    description: "A feather shed in the eye of a storm. Its bearer moves like the wind.",
    base: {
      accessory: accessory("paired", { attackSpeed: 0.09, dex: 7 }, 4)
    },
    decoration: { weapon: { attackSpeed: 0.06 }, accessory: { fireResist: 0.08 } },
    equip: { itemType: "amulet", name: "Tempest Charm", stats: { attackSpeed: 0.1, evasion: 50, fireResist: 0.15, wardOnDodgePercent: 0.05 } }
  },
  // ---- Tier 4, the Sundered Sanctum: all three elements at once, so every resistance matters. ----
  {
    key: "riftGlass",
    name: "Rift Glass",
    prefix: "Riftglass",
    power: 6,
    description: "Glass from where the three wilds' storms meet. Fire, frost and lightning are all frozen in it.",
    base: {
      weapon: craft(6, "balanced", { physicalDamage: 1 }, { increasedElementalDamage: 0.5, critChance: 0.5 }),
      wand: craft(6, "value", { fireDamage: 0.34, coldDamage: 0.33, lightningDamage: 0.33 }),
      armor: craft(6, "balanced", { ward: 1 }, { fireResist: 0.34, coldResist: 0.33, lightningResist: 0.33 })
    },
    decoration: { weapon: { fireDamage: 3, coldDamage: 3, lightningDamage: 3, igniteChance: 0.03, chillChance: 0.03, shockChance: 0.03 }, armor: { fireResist: 0.04, coldResist: 0.04, lightningResist: 0.04 } }
  },
  {
    key: "riftsteel",
    name: "Riftsteel",
    prefix: "Riftsteel",
    power: 7,
    description: "Steel forged in the rift's wild heat and sudden cold. Nothing else holds an edge so well.",
    base: {
      weapon: craft(7, "balanced", { physicalDamage: 1 }, { lifeOnHit: 2 }),
      armor: craft(7, "value", { armor: 1 }),
      bodyArmor: craft(7, "value", { armor: 1 }, {}, { itemLabel: "Riftsteel Plate" }),
      shield: craft(7, "value", { armor: 1, blockChance: 1 })
    },
    decoration: { weapon: { physicalDamage: 9 }, armor: { armor: 6 } }
  },
  {
    key: "prismShard",
    name: "Prism Shard",
    prefix: "Prismatic",
    power: 7,
    description: "A crystal that splits any light, or any spell, into three.",
    base: {
      staff: craft(7, "capMixed", { fireDamage: 0.34, coldDamage: 0.33, lightningDamage: 0.33 }, { int: 1 }),
      wand: craft(7, "capMixed", { fireDamage: 0.34, coldDamage: 0.33, lightningDamage: 0.33 }, { increasedElementalDamage: 1 }),
      helmet: craft(7, "secondary", { ward: 1 }, { increasedElementalDamage: 0.5 }, { attr: "int" }),
      accessory: accessory("paired", { increasedElementalDamage: 0.14, int: 6 }, 4)
    },
    decoration: { weapon: { increasedElementalDamage: 0.1, ailmentEffect: 0.15 }, accessory: { int: 6, ailmentEffect: 0.1 } }
  },
  {
    key: "voidSilk",
    name: "Void Silk",
    prefix: "Voidsilk",
    power: 7,
    description: "Thread spun by things that live between the storms. Blows pass through it like smoke.",
    base: {
      smallArmor: craft(7, "value", { evasion: 1 }),
      bodyArmor: craft(7, "secondary", { evasion: 1 }, { fireResist: 0.34, coldResist: 0.33, lightningResist: 0.33 }, { itemLabel: "Voidsilk Robe" }),
      belt: accessory("paired", { maxHealth: 45, dex: 6 }, 4)
    },
    decoration: { armor: { evasion: 6, wardOnDodgePercent: 0.03 }, accessory: { dex: 6 } }
  },
  {
    key: "wardenStone",
    name: "Warden Stone",
    prefix: "Warden",
    power: 7,
    description: "A stone from the walls the rift wardens raised. It still turns aside whatever comes through.",
    base: {
      shield: craft(7, "capMixed", { armor: 1, blockChance: 1 }, { fireResist: 0.34, coldResist: 0.33, lightningResist: 0.33 }),
      armor: craft(7, "capMixed", { ward: 1 }, { fireResist: 0.34, coldResist: 0.33, lightningResist: 0.33 }),
      helmet: craft(7, "balanced", { ward: 1 }, {}, { attr: "int" })
    },
    decoration: { weapon: { wardAsLightning: defenseAsDamage("wardAsLightning", 7) }, armor: { ward: 2 }, shield: { blockChance: 0.04, wardOnBlockPercent: 0.06 }, accessory: { ward: 4.5 } }
  },
  {
    key: "riftEssence",
    name: "Rift Essence",
    prefix: "Riftborn",
    power: 8,
    description: "The rift itself, bottled. It makes everything it touches a little more.",
    base: {
      weapon: craft(8, "decor", { physicalDamage: 1 }, { increasedDamage: 1 }),
      armor: craft(8, "decor", { armor: 0.5, ward: 0.5 }),
      accessory: accessory("decor", { increasedDamage: 0.1 }, 6)
    },
    decoration: { weapon: { increasedDamage: 0.095 }, armor: { increasedMaxHealth: 0.075 }, accessory: { increasedDamage: 0.075 } }
  },
  {
    key: "wardenPlate",
    name: "Warden Plate",
    prefix: "Wardenplate",
    power: 8,
    description: "Plate from a fallen rift warden, made to stand in all three storms at once.",
    base: {
      armor: craft(8, "capMixed", { armor: 1 }, { fireResist: 0.34, coldResist: 0.33, lightningResist: 0.33 }),
      bodyArmor: craft(8, "capMixed", { armor: 1 }, { fireResist: 0.34, coldResist: 0.33, lightningResist: 0.33 }, { itemLabel: "Warden Plate", attr: "str" }),
      shield: craft(8, "cap", { armor: 1, blockChance: 1 })
    },
    decoration: { armor: { fireResist: 0.06, coldResist: 0.06, lightningResist: 0.06 }, shield: { wardOnBlock: 30, wardOnBlockPercent: 0.03 } }
  },
  {
    key: "prismaticEye",
    name: "Prismatic Eye",
    prefix: "Prismatic",
    power: 9,
    description: "The eye of a rift warden, which saw all three storms at once. It still does.",
    base: {
      weapon: craft(9, "secondary", { physicalDamage: 1 }, { lifeOnHit: 1 }),
      accessory: accessory("paired", { increasedElementalDamage: 0.18, critChance: 0.08 }, 5)
    },
    decoration: { weapon: { increasedElementalDamage: 0.12 }, accessory: { fireResist: 0.06, coldResist: 0.06, lightningResist: 0.06 } },
    equip: { itemType: "amulet", name: "Prismatic Eye", stats: { increasedElementalDamage: 0.2, ailmentEffect: 0.25, fireResist: 0.15, coldResist: 0.15, lightningResist: 0.15 } }
  },
  // ---- Tier 5, the Amber Hive: Corrosion. Swarms of quick strikers, so avoiding hits matters most. ----
  {
    key: "hiveChitin",
    name: "Hive Chitin",
    prefix: "Chitin",
    power: 10,
    description: "Plates shed by the hive's workers: light, hard and slick enough that stings glance off.",
    base: {
      armor: craft(10, "balanced", { evasion: 0.5, armor: 0.5 }, { maxHealth: 1 }),
      shield: craft(10, "value", { armor: 1, blockChance: 1 })
    },
    decoration: { armor: { evasion: 10, armor: 10 }, shield: { blockChance: 0.06 } }
  },
  {
    key: "waspWing",
    name: "Wasp Wing",
    prefix: "Waspwing",
    power: 10,
    description: "A wing as thin as breath. Whatever wears it moves before the swarm does.",
    base: {
      smallArmor: craft(10, "value", { evasion: 1 }),
      weapon: craft(10, "secondary", { physicalDamage: 1 }, { attackSpeed: 1 })
    },
    decoration: { weapon: { attackSpeed: 0.04, accuracy: 15 }, armor: { evasion: 7, attackSpeed: 0.02 } }
  },
  {
    key: "hiveWax",
    name: "Hive Wax",
    prefix: "Waxen",
    power: 10,
    description: "Wax the hive seals its cells with. Layered on a shield it catches stingers and holds them.",
    base: {
      shield: craft(10, "secondary", { blockChance: 1 }, { maxHealth: 1 }),
      armor: craft(10, "secondary", { evasion: 1 }, { maxHealth: 1 })
    },
    decoration: { shield: { blockChance: 0.04 }, accessory: { maxHealth: 20, lifeRegen: 2 } }
  },
  {
    key: "mantisScythe",
    name: "Mantis Scythe",
    prefix: "Mantis",
    power: 11,
    description: "The forelimb of a thorn mantis. It strikes where the eye was a moment ago.",
    base: {
      weapon: craft(11, "balanced", { physicalDamage: 1 }, { critChance: 0.5, accuracy: 0.5 })
    },
    decoration: { weapon: { critChance: 0.04, accuracy: 30 } }
  },
  {
    key: "amberResin",
    name: "Amber Resin",
    prefix: "Amber",
    power: 11,
    description: "Fresh amber from the hive walls, still soft. It sets hard around anything that strikes it.",
    base: {
      shield: craft(11, "cap", { armor: 1, blockChance: 1 }),
      armor: craft(11, "capMixed", { evasion: 1 }, { fireResist: 0.5, coldResist: 0.5 })
    },
    decoration: { shield: { blockChance: 0.05, wardOnBlockPercent: 0.04 }, armor: { fireResist: 0.1, coldResist: 0.05 } }
  },
  {
    key: "stingerVenom",
    name: "Stinger Venom",
    prefix: "Venomous",
    power: 11,
    description: "Venom milked from a brood guard. A drop on the tongue and the world slows down.",
    base: {
      accessory: accessory("paired", { attackSpeed: 0.12, accuracy: 60 }, 5)
    },
    decoration: { weapon: { attackSpeed: 0.09 }, accessory: { accuracy: 40 } }
  },
  {
    key: "royalJelly",
    name: "Royal Jelly",
    prefix: "Royal",
    power: 12,
    description: "What the hive feeds its queens. It makes the body quick and hard to wound.",
    base: {
      accessory: accessory("paired", { maxHealth: 75, lifeRegenPercent: 0.02 }, 5)
    },
    decoration: { armor: { evasion: 14, maxHealth: 20 }, accessory: { maxHealth: 40 } }
  },
  {
    key: "queenCarapace",
    name: "Queen's Carapace",
    prefix: "Carapace",
    power: 12,
    description: "A piece of the hive queen's shell. Acid that eats through steel beads up and rolls off it.",
    base: {
      shield: craft(12, "capMixed", { blockChance: 1 }, { fireResist: 0.5, maxHealth: 0.5 }),
      bodyArmor: craft(12, "value", { evasion: 1 }, {}, { itemLabel: "Carapace Mail" })
    },
    decoration: { armor: { evasion: 14 }, shield: { blockChance: 0.04, evasion: 8 } }
  },
  {
    key: "hiveheart",
    name: "Hiveheart",
    prefix: "Hiveheart",
    power: 13,
    description: "The pulse at the center of the hive. Every swarm in it moves to this beat, and so does its bearer.",
    base: {
      accessory: accessory("paired", { blockChance: 0.08, increasedEvasion: 0.15 }, 6)
    },
    decoration: { armor: { evasion: 16, blockChance: 0.03 }, accessory: { evasion: 16 } },
    equip: { itemType: "ring", name: "Hiveheart Signet", stats: { evasion: 150, blockChance: 0.08, attackSpeed: 0.08 } }
  },
  // ---- Tier 5, Duskgrave Necropolis: Lifeless. Nothing heals, so a deep pool of life and ward wins. ----
  {
    key: "graveIron",
    name: "Grave Iron",
    prefix: "Grave-iron",
    power: 10,
    description: "Iron from the necropolis gates, cold to the touch for a thousand years.",
    base: {
      armor: craft(10, "value", { armor: 1 }),
      weapon: craft(10, "balanced", { physicalDamage: 1 }, { accuracy: 1 })
    },
    decoration: { armor: { armor: 7, coldResist: 0.04 }, weapon: { physicalDamage: 15 } }
  },
  {
    key: "shroudCloth",
    name: "Shroud Cloth",
    prefix: "Shrouded",
    power: 10,
    description: "Burial linen woven with old wards. The dead it wrapped never rose; the living it wraps rarely fall.",
    base: {
      armor: craft(10, "balanced", { ward: 1 }, { maxHealth: 1 }),
      bodyArmor: craft(10, "value", { ward: 1 }, {}, { itemLabel: "Shroud" })
    },
    decoration: { armor: { ward: 3 }, accessory: { ward: 6 } }
  },
  {
    key: "boneMarrow",
    name: "Bone Marrow",
    prefix: "Marrow",
    power: 10,
    description: "Dark marrow from the necropolis ossuaries. Bitter, and it makes the body hard to kill.",
    base: {
      weapon: craft(10, "secondary", { physicalDamage: 1 }, { lifeOnHit: 1 }),
      accessory: accessory("focused", { maxHealth: 90 }, 5)
    },
    decoration: { weapon: { lifeOnHit: 7 }, armor: { maxHealth: 18 }, accessory: { maxHealth: 30 } }
  },
  {
    key: "wraithEssence",
    name: "Wraith Essence",
    prefix: "Wraith",
    power: 11,
    description: "What a wraith leaves when it finally goes. It wraps whoever carries it in cold, unbroken light.",
    base: {
      armor: craft(11, "cap", { ward: 1 }),
      helmet: craft(11, "balanced", { ward: 1 }, {}, { attr: "int" }),
      shield: craft(11, "capMixed", { ward: 1 }, { maxHealth: 0.5 }, { attr: "int" })
    },
    decoration: { weapon: { wardAsLightning: defenseAsDamage("wardAsLightning", 11) }, armor: { ward: 2.5, coldResist: 0.04 }, accessory: { ward: 6, coldResist: 0.03 } }
  },
  {
    key: "barrowSteel",
    name: "Barrow Steel",
    prefix: "Barrow",
    power: 11,
    description: "Blades and plate from barrow kings, still sharp, still heavy, still waiting.",
    base: {
      weapon: craft(11, "balanced", { physicalDamage: 1 }, { increasedDamage: 0.5, lifeOnHit: 0.5 }),
      bodyArmor: craft(11, "capMixed", { armor: 1 }, { maxHealth: 0.5, coldResist: 0.5 }, { itemLabel: "Barrow Plate", attr: "str" })
    },
    decoration: { weapon: { increasedDamage: 0.065, lifeOnHit: 5 }, armor: { increasedMaxHealth: 0.09 } }
  },
  {
    key: "deathcap",
    name: "Deathcap",
    prefix: "Deathcap",
    power: 11,
    description: "A pale mushroom that grows only on graves. Eaten in tiny amounts it hardens the flesh.",
    base: {
      accessory: accessory("paired", { increasedMaxHealth: 0.1, coldResist: 0.15 }, 5)
    },
    decoration: { weapon: { evasionAsCold: defenseAsDamage("evasionAsCold", 11) }, armor: { coldResist: 0.12 }, accessory: { increasedMaxHealth: 0.09 } }
  },
  {
    key: "soulGem",
    name: "Soul Gem",
    prefix: "Soulbound",
    power: 12,
    description: "A gem with a soul asleep inside. It shields its bearer so it won't be woken.",
    base: {
      accessory: accessory("paired", { maxHealth: 70, int: 12 }, 5),
      amulet: accessory("paired", { ward: amuletWard(12), maxHealth: 70 }, 5),
      helmet: craft(12, "capMixed", { ward: 1 }, { maxHealth: 1 }, { attr: "int" })
    },
    decoration: { weapon: { lifeOnHit: 12 }, armor: { ward: 4 }, accessory: { ward: 3, int: 3 } }
  },
  {
    key: "cryptPlate",
    name: "Crypt Plate",
    prefix: "Crypt",
    power: 12,
    description: "Armor from the necropolis guardians, heavy enough to stand a thousand years of blows.",
    base: {
      armor: craft(12, "capMixed", { armor: 1 }, { maxHealth: 0.5, coldResist: 0.5 }),
      shield: craft(12, "value", { armor: 1, blockChance: 1 })
    },
    decoration: { armor: { armor: 14, maxHealth: 16 }, shield: { blockChance: 0.05 } }
  },
  {
    key: "paleCrown",
    name: "Pale Crown",
    prefix: "Pale",
    power: 13,
    description: "The Pale Lich's crown. It holds life in its wearer the way it held death in its maker.",
    base: {
      accessory: accessory("paired", { increasedMaxHealth: 0.15, int: 13 }, 6),
      amulet: accessory("paired", { increasedMaxHealth: 0.15, ward: amuletWard(13) }, 6)
    },
    decoration: { weapon: { lifeOnHit: 16 }, armor: { increasedMaxHealth: 0.08, coldResist: 0.08 }, accessory: { ward: 9, increasedMaxHealth: 0.03 } },
    equip: { itemType: "amulet", name: "Pale Crown Pendant", stats: { increasedMaxHealth: 0.15, ward: 120, coldResist: 0.2 } }
  },
  // ---- Tier 5, the Ironbound Foundry: Reflection. Every blow comes back, so measured hits and tough hides win. ----
  {
    key: "brassPlate",
    name: "Brass Plate",
    prefix: "Brass",
    power: 10,
    description: "Polished brass from the foundry's automatons. It throws back light, and blows.",
    base: {
      armor: craft(10, "balanced", { armor: 1 }, { lifeRegen: 1 }),
      shield: craft(10, "balanced", { armor: 1, blockChance: 1 }, { maxHealth: 1 })
    },
    decoration: { armor: { armor: 10 }, shield: { blockChance: 0.02, armor: 8 } }
  },
  {
    key: "cogwheel",
    name: "Cogwheel",
    prefix: "Geared",
    power: 10,
    description: "A toothed wheel from a broken construct. Set into a weapon, it keeps the arm turning.",
    base: {
      weapon: craft(10, "decor", { physicalDamage: 1 }, { attackSpeed: 1 }),
      accessory: accessory("focused", { attackSpeed: 0.1 }, 5)
    },
    decoration: { weapon: { attackSpeed: 0.075 }, accessory: { attackSpeed: 0.06 } }
  },
  {
    key: "coolingOil",
    name: "Cooling Oil",
    prefix: "Oiled",
    power: 10,
    description: "The oil that keeps the foundry's workers from seizing. On skin it closes wounds as they open.",
    base: {
      accessory: accessory("focused", { lifeRegen: 120 }, 5)
    },
    decoration: { armor: { lifeRegen: 48 }, accessory: { lifeRegen: 48 } }
  },
  {
    key: "temperedSteel",
    name: "Tempered Steel",
    prefix: "Tempered",
    power: 11,
    description: "Steel quenched and reheated a hundred times. It bends under a blow and springs back.",
    base: {
      armor: craft(11, "capMixed", { armor: 1 }, { coldResist: 1 }),
      weapon: craft(11, "value", { physicalDamage: 1 })
    },
    decoration: { armor: { increasedArmor: 0.08 }, weapon: { physicalDamage: 12 } }
  },
  {
    key: "mainspring",
    name: "Mainspring",
    prefix: "Wound",
    power: 11,
    description: "The coiled heart of a clockwork knight. Wound tight, it keeps whatever holds it going.",
    base: {
      accessory: accessory("paired", { lifeRegen: 84, str: 10 }, 5),
      belt: craft(11, "balanced", { armor: 1 }, { lifeRegen: 1 }, { attr: "str" })
    },
    decoration: { armor: { lifeRegen: 36, armor: 5 }, accessory: { armor: 12 } }
  },
  {
    key: "slagGlass",
    name: "Slag Glass",
    prefix: "Slag",
    power: 11,
    description: "Glass skimmed off the foundry's slag. It shrugs off heat that melts iron.",
    base: {
      armor: craft(11, "capMixed", { armor: 1 }, { fireResist: 1 }),
      helmet: craft(11, "balanced", { armor: 1 }, { fireResist: 0.5, lifeRegen: 0.5 })
    },
    decoration: { armor: { fireResist: 0.1, armor: 8 } }
  },
  {
    key: "titanAlloy",
    name: "Titan Alloy",
    prefix: "Titan",
    power: 12,
    description: "The alloy the Forge Titan was cast from. Nothing in the foundry can dent it.",
    base: {
      armor: craft(12, "value", { armor: 1 }),
      bodyArmor: craft(12, "capMixed", { armor: 1 }, { lifeRegen: 0.5, maxHealth: 0.5 }, { itemLabel: "Titan Plate", attr: "str" })
    },
    decoration: { armor: { armor: 14 }, shield: { blockChance: 0.03, armor: 10 } }
  },
  {
    key: "furnaceCore",
    name: "Furnace Core",
    prefix: "Furnace",
    power: 12,
    description: "A coal that has burned since the foundry was lit. Its heat keeps the blood moving.",
    base: {
      accessory: accessory("paired", { lifeRegen: 96, maxHealth: 70 }, 5)
    },
    decoration: { weapon: { healthAsFire: defenseAsDamage("healthAsFire", 12) }, armor: { lifeRegen: 64 }, accessory: { lifeRegen: 48, fireResist: 0.04 } }
  },
  {
    key: "forgeheart",
    name: "Forgeheart",
    prefix: "Forgeheart",
    power: 13,
    description: "The Forge Titan's heart, still glowing. Wounds close in its warmth faster than they open.",
    base: {
      accessory: accessory("paired", { lifeRegen: 108, increasedArmor: 0.2 }, 6)
    },
    decoration: { armor: { lifeRegen: 72, increasedArmor: 0.05 }, accessory: { lifeRegen: 72 } },
    equip: { itemType: "amulet", name: "Forgeheart Locket", stats: { lifeRegen: 200, increasedArmor: 0.2, fireResist: 0.2 } }
  },
  // ---- Tier 5, Skyspire Aerie: Karma. Every blow struck is judged, so the fewest, biggest blows win. ----
  {
    key: "stormIron",
    name: "Storm Iron",
    prefix: "Stormforged",
    power: 10,
    description: "Iron struck by lightning on the spire's peak. Blades of it fall like thunder.",
    base: {
      weapon: craft(10, "balanced", { physicalDamage: 1 }, { critMultiplier: 1 }),
      armor: craft(10, "balanced", { armor: 1 }, { lightningResist: 1 })
    },
    decoration: { weapon: { physicalDamage: 7, physicalToLightning: 0.2 }, armor: { lightningResist: 0.08, armor: 6 } }
  },
  {
    key: "skyFeather",
    name: "Sky Feather",
    prefix: "Skyfeather",
    power: 10,
    description: "A feather from the spire's hunters. Arrows fletched with it find the heart.",
    base: {
      smallArmor: craft(10, "balanced", { evasion: 1 }, { critChance: 1 }),
      boots: craft(10, "balanced", { evasion: 1 }, { critChance: 1 }, { attr: "dex" }),
      gloves: craft(10, "balanced", { evasion: 1 }, { critChance: 1 }, { attr: "dex" })
    },
    decoration: { weapon: { critChance: 0.04 }, armor: { evasion: 10 }, accessory: { accuracy: 30 } }
  },
  {
    key: "galeSilk",
    name: "Gale Silk",
    prefix: "Galesilk",
    power: 10,
    description: "Silk from the spire's spiders, who weave in the wind. Light enough to fly in.",
    base: {
      smallArmor: craft(10, "capMixed", { evasion: 1 }, { lightningResist: 1 }),
      bodyArmor: craft(10, "secondary", { evasion: 1 }, { lightningResist: 1 }, { itemLabel: "Galesilk Robe" })
    },
    decoration: { armor: { evasion: 6, lightningResist: 0.05 } }
  },
  {
    key: "eagleTalon",
    name: "Eagle Talon",
    prefix: "Taloned",
    power: 11,
    description: "A talon from a thunder eagle. One strike, and the prey never knew.",
    base: {
      weapon: craft(11, "balanced", { physicalDamage: 1 }, { critChance: 1 })
    },
    decoration: { weapon: { critChance: 0.05, critMultiplier: 0.15 } }
  },
  {
    key: "thunderGlass",
    name: "Thunder Glass",
    prefix: "Thunderglass",
    power: 11,
    description: "Sand fused by a lightning strike. It holds the instant of the strike forever.",
    base: {
      accessory: accessory("paired", { critMultiplier: 0.3, lightningResist: 0.15 }, 5),
      amulet: accessory("paired", { lightningResist: 0.15, lightningDamage: [6, 18] }, 5),
      wand: craft(11, "value", { lightningDamage: 1 })
    },
    decoration: { weapon: { critMultiplier: 0.2 }, accessory: { critMultiplier: 0.08, lightningResist: 0.04 } }
  },
  {
    key: "windCrystal",
    name: "Wind Crystal",
    prefix: "Windborne",
    power: 11,
    description: "A crystal that hums in still air. Blows struck beside it carry far more than their weight.",
    base: {
      accessory: accessory("focused", { increasedDamage: 0.18 }, 5)
    },
    decoration: { weapon: { increasedDamage: 0.13 }, accessory: { increasedDamage: 0.095 } }
  },
  {
    key: "sovereignPlume",
    name: "Sovereign Plume",
    prefix: "Sovereign",
    power: 12,
    description: "A plume from the Sky Sovereign's crest. Its bearer sees the one blow that ends a fight.",
    base: {
      accessory: accessory("paired", { critChance: 0.1, critMultiplier: 0.35 }, 5),
      amulet: accessory("paired", { accuracy: 80, increasedDamage: 0.12 }, 5)
    },
    decoration: { weapon: { critChance: 0.06 }, accessory: { critMultiplier: 0.15 } }
  },
  {
    key: "skyforged",
    name: "Skyforged Steel",
    prefix: "Skyforged",
    power: 12,
    description: "Steel forged in the spire's storm-kilns. It carries the force of the fall.",
    base: {
      weapon: craft(12, "balanced", { physicalDamage: 1 }, { critMultiplier: 1 })
    },
    decoration: { weapon: { physicalDamage: 14, increasedPhysicalDamage: 0.06 } }
  },
  {
    key: "stormcrown",
    name: "Stormcrown",
    prefix: "Stormcrowned",
    power: 13,
    description: "The Sky Sovereign's crown. Whoever wears it strikes once, and is believed.",
    base: {
      accessory: accessory("paired", { critMultiplier: 0.5, increasedDamage: 0.2 }, 6)
    },
    decoration: { weapon: { critMultiplier: 0.3 }, accessory: { increasedDamage: 0.115 } },
    equip: { itemType: "ring", name: "Stormcrown Band", stats: { critMultiplier: 0.5, increasedDamage: 0.2, critChance: 0.2 } }
  },
  // ---- The Oracle's Rite: the Veiled Oracle's drops, a step above tier 5's mythics. ----
  {
    key: "oracleEye",
    name: "Oracle's Eye",
    prefix: "Oracle",
    power: 14,
    description: "The Veiled Oracle's eye, which saw the keys before anyone found them. It shows where every blow will land.",
    base: {
      accessory: accessory("paired", { critChance: 0.12, accuracy: 160 }, 6)
    },
    decoration: { weapon: { critChance: 0.06, accuracy: 50 }, accessory: { accuracy: 60 } },
    equip: { itemType: "amulet", name: "Oracle's Eye", stats: { critChance: 0.3, accuracy: 200, critMultiplier: 0.3 } }
  },
  {
    key: "veilSilk",
    name: "Veil Silk",
    prefix: "Veiled",
    power: 14,
    description: "A strip of the Oracle's veil. Behind it, blows land on someone who was never quite there.",
    base: {
      armor: craft(14, "capMixed", { evasion: 0.5, ward: 0.5 }, { maxHealth: 1 }, { boost: 1.15 }),
      bodyArmor: craft(14, "balanced", { evasion: 0.5, ward: 0.5 }, { fireResist: 0.34, coldResist: 0.33, lightningResist: 0.33 }, { boost: 1.15, itemLabel: "Veil" })
    },
    decoration: { armor: { evasion: 18, ward: 5.5 }, accessory: { ward: 12 } }
  },
  {
    key: "sanctumShard",
    name: "Sanctum Shard",
    prefix: "Sanctified",
    power: 14,
    description: "A shard of the Sanctum's altar, cracked when the portal first opened. It still holds the door's force.",
    base: {
      weapon: craft(14, "balanced", { physicalDamage: 1 }, { increasedDamage: 0.5, lifeOnHit: 0.5 }, { boost: 1.15 }),
      shield: craft(14, "capMixed", { armor: 1, blockChance: 1 }, { maxHealth: 1 }, { boost: 1.15 })
    },
    decoration: { weapon: { physicalDamage: 18, increasedDamage: 0.08 }, shield: { blockChance: 0.04, ward: 8 } }
  },
  // ---- Tier 6, the Shattered Throne: past the portal. No single rule; every kind of monster at once. ----
  {
    key: "throneStone",
    name: "Throne Stone",
    prefix: "Throne",
    power: 12,
    description: "Stone from the broken throne room, heavy with something older than the stone.",
    base: {
      armor: craft(12, "capMixed", { armor: 1 }, { maxHealth: 1 }),
      shield: craft(12, "balanced", { armor: 1, blockChance: 1 }, { maxHealth: 1 })
    },
    decoration: { armor: { armor: 12, ward: 5 } }
  },
  {
    key: "voidIron",
    name: "Void Iron",
    prefix: "Void",
    power: 12,
    description: "Iron that fell through the portal from nowhere. It weighs nothing until it strikes.",
    base: {
      weapon: craft(12, "balanced", { physicalDamage: 1 }, { attackSpeed: 1 }),
      twoHanded: craft(12, "value", { physicalDamage: 1 })
    },
    decoration: { weapon: { physicalDamage: 14, attackSpeed: 0.04 } }
  },
  {
    key: "starSilk",
    name: "Star Silk",
    prefix: "Starwoven",
    power: 12,
    description: "Thread spun from the cold light between the throne's pillars.",
    base: {
      smallArmor: craft(12, "balanced", { evasion: 0.5, ward: 0.5 }, { maxHealth: 1 }),
      bodyArmor: craft(12, "value", { ward: 1 }, {}, { itemLabel: "Starwoven Robe" })
    },
    decoration: { armor: { evasion: 14, ward: 4 }, accessory: { ward: 9 } }
  },
  {
    key: "shatterglass",
    name: "Shatterglass",
    prefix: "Shattered",
    power: 13,
    description: "A piece of the sky that cracked when the throne fell. Every edge of it cuts.",
    base: {
      weapon: craft(13, "balanced", { physicalDamage: 1 }, { critChance: 0.5, critMultiplier: 0.5 }),
      wand: craft(13, "balanced", { fireDamage: 0.34, coldDamage: 0.33, lightningDamage: 0.33 }, { critChance: 1 })
    },
    decoration: { weapon: { critChance: 0.06, accuracy: 20 } }
  },
  {
    key: "kingsSteel",
    name: "King's Steel",
    prefix: "Kingsteel",
    power: 13,
    description: "Plate of the throne's last guard, who never left their post.",
    base: {
      armor: craft(13, "capMixed", { armor: 1 }, { fireResist: 0.34, coldResist: 0.33, lightningResist: 0.33 }),
      bodyArmor: craft(13, "capMixed", { armor: 0.5, evasion: 0.5 }, { maxHealth: 1 }, { itemLabel: "Kingsguard Plate" })
    },
    decoration: { armor: { fireResist: 0.13, coldResist: 0.13, lightningResist: 0.13 } }
  },
  {
    key: "emberOfAges",
    name: "Ember of Ages",
    prefix: "Ageless",
    power: 13,
    description: "A coal from a fire that has burned since before the throne was built.",
    base: {
      accessory: accessory("paired", { increasedDamage: 0.18, lifeOnHit: 24 }, 6)
    },
    decoration: { weapon: { increasedDamage: 0.155 }, accessory: { lifeOnHit: 16 } }
  },
  {
    key: "crownShard",
    name: "Crown Shard",
    prefix: "Crowned",
    power: 14,
    description: "A shard of the shattered crown. Whoever carries it is obeyed by their own body.",
    base: {
      accessory: accessory("paired", { increasedMaxHealth: 0.14, increasedDamage: 0.16 }, 6),
      helmet: craft(14, "balanced", { armor: 0.5, ward: 0.5 }, { maxHealth: 1 }, { attr: "int" })
    },
    decoration: { armor: { increasedMaxHealth: 0.11 }, accessory: { increasedDamage: 0.13 } }
  },
  {
    key: "riftmetal",
    name: "Riftmetal",
    prefix: "Riftmetal",
    power: 14,
    description: "Metal from the portal's rim, where the pocket rift meets the world. It is never quite one thing.",
    base: {
      weapon: craft(14, "value", { physicalDamage: 1 }),
      armor: craft(14, "balanced", { armor: 0.5, evasion: 0.5 }, { maxHealth: 1 })
    },
    decoration: { weapon: { physicalDamage: 20 }, armor: { armor: 18, evasion: 18 } }
  },
  {
    key: "throneheart",
    name: "Throneheart",
    prefix: "Throneheart",
    power: 15,
    description: "What the Shattered King kept in place of a heart. It beats for whoever holds it now.",
    base: {
      accessory: accessory("paired", { increasedDamage: 0.25, increasedMaxHealth: 0.2, lifeOnHit: 36 }, 7)
    },
    decoration: { weapon: { increasedDamage: 0.12, lifeOnHit: 12 }, armor: { increasedMaxHealth: 0.14 }, accessory: { increasedDamage: 0.1, lifeOnHit: 10 } },
    equip: { itemType: "amulet", name: "Throneheart", stats: { increasedDamage: 0.3, increasedMaxHealth: 0.2, critChance: 0.2, lifeOnHit: 40 } }
  },
  // Keys: no crafting use. A set of all four opens the way to the final area (see engine/portal.ts).
  {
    key: "amberKey",
    name: "Amber Key",
    power: 13,
    keyItem: true,
    description: "A key of amber with something still moving inside. One of four that open the way to the Shattered Throne."
  },
  {
    key: "graveKey",
    name: "Grave Key",
    power: 13,
    keyItem: true,
    description: "A key of black bone, cold as the crypt it locked. One of four that open the way to the Shattered Throne."
  },
  {
    key: "cogKey",
    name: "Cog Key",
    power: 13,
    keyItem: true,
    description: "A key of interlocking gears that turn on their own. One of four that open the way to the Shattered Throne."
  },
  {
    key: "galeKey",
    name: "Gale Key",
    power: 13,
    keyItem: true,
    description: "A key of storm glass that whistles in still air. One of four that open the way to the Shattered Throne."
  },
  // ---- Legendaries: one per quest, dropped only by its ambition boss, a step above its mythics. ----
  {
    key: "briarcrown",
    name: "Briarcrown",
    prefix: "Briarcrown",
    power: 5,
    legendary: true,
    description: "The Briar King's crown of living thorns. It feeds on every blow its wearer lands.",
    base: {
      helmet: craft(5, "balanced", { armor: 1 }, { maxHealth: 0.5, lifeOnHit: 0.5 }, { boost: LEGENDARY }),
      weapon: craft(5, "secondary", { physicalDamage: 1 }, { lifeOnHit: 1 }, { boost: LEGENDARY })
    },
    decoration: { weapon: { lifeOnHit: 1, attackSpeed: 0.03 }, armor: { maxHealth: 9 }, accessory: { lifeOnHit: 1 } },
    equip: { itemType: "amulet", name: "Briarcrown Circlet", stats: { lifeOnHit: 5, maxHealth: 15, blockChance: 0.05 } }
  },
  {
    key: "stormveinHeart",
    name: "Stormvein Heart",
    prefix: "Stormvein",
    power: 7,
    legendary: true,
    description: "The core of the Stormvein Colossus, still crackling. Lightning answers whoever holds it.",
    base: {
      weapon: craft(7, "balanced", { lightningDamage: 1 }, { attackSpeed: 1 }, { boost: LEGENDARY }),
      accessory: accessory("paired", { lightningDamage: [9, 18], lightningResist: 0.15 }, 3)
    },
    decoration: { weapon: { physicalToLightning: 0.4, increasedElementalDamage: 0.15 }, armor: { lightningResist: 0.15 } },
    equip: { itemType: "ring", name: "Stormvein Ring", stats: { lightningDamage: 12, attackSpeed: 0.08, lightningResist: 0.2 } }
  },
  {
    key: "wyrmqueenEmber",
    name: "Wyrmqueen's Ember",
    prefix: "Wyrmqueen",
    power: 8,
    legendary: true,
    description: "A coal from the heart of the Wyrmqueen. Strikes guided by it find the weak spot.",
    base: {
      weapon: craft(8, "balanced", { fireDamage: 1 }, { critChance: 1 }, { boost: LEGENDARY }),
      armor: craft(8, "capMixed", { armor: 1 }, { fireResist: 0.5, maxHealth: 0.5 }, { boost: LEGENDARY })
    },
    decoration: { weapon: { critMultiplier: 0.3, physicalToFire: 0.4 }, armor: { fireResist: 0.12, maxHealth: 15 } },
    equip: { itemType: "amulet", name: "Ember of the Wyrmqueen", stats: { critChance: 0.2, critMultiplier: 0.4, fireResist: 0.25 } }
  },
  {
    key: "mireheart",
    name: "Heart of the Mire",
    prefix: "Mireheart",
    power: 8,
    legendary: true,
    description: "The Mire Mother's heart, still beating slow and cold. It never lets its bearer go hungry.",
    base: {
      weapon: craft(8, "balanced", { coldDamage: 1 }, { lifeOnHit: 1.5, accuracy: 0.5 }, { boost: LEGENDARY }),
      armor: craft(8, "capMixed", { evasion: 1 }, { coldResist: 0.5, lifeRegen: 0.5 }, { boost: LEGENDARY }),
      accessory: accessory("paired", { coldResist: 0.15, accuracy: 30 }, 3)
    },
    decoration: { weapon: { lifeOnHit: 3, physicalToCold: 0.4 }, armor: { coldResist: 0.12, lifeRegen: 24 }, accessory: { evasionAsCold: defenseAsDamage("evasionAsCold", 8) } },
    equip: { itemType: "amulet", name: "Mireheart Locket", stats: { lifeLeech: 0.05, accuracy: 40, coldResist: 0.25 } }
  },
  {
    key: "tempestTalon",
    name: "Tempest Talon",
    prefix: "Tempest",
    power: 8,
    legendary: true,
    description: "A talon from the Tempest Roc. Strikes made with it land before the thunder.",
    base: {
      weapon: craft(8, "balanced", { lightningDamage: 1 }, { attackSpeed: 1 }, { boost: LEGENDARY }),
      shield: craft(8, "capMixed", { blockChance: 1 }, { lightningResist: 0.5, attackSpeed: 0.5 }, { boost: LEGENDARY })
    },
    decoration: { weapon: { attackSpeed: 0.08, physicalToLightning: 0.4 }, armor: { evasion: 8, lightningResist: 0.1 } },
    equip: { itemType: "ring", name: "Talon of the Tempest", stats: { attackSpeed: 0.1, evasion: 40, blockChance: 0.05 } }
  },
  {
    key: "riftheart",
    name: "Heart of the Rift",
    prefix: "Riftheart",
    power: 10,
    legendary: true,
    description: "What the Rift Tyrant was made around: a knot of fire, frost and lightning that never settles.",
    base: {
      weapon: craft(10, "balanced", { fireDamage: 0.34, coldDamage: 0.33, lightningDamage: 0.33 }, { critChance: 1 }, { boost: LEGENDARY }),
      armor: craft(10, "capMixed", { ward: 1 }, { fireResist: 0.34, coldResist: 0.33, lightningResist: 0.33 }, { boost: LEGENDARY })
    },
    decoration: { weapon: { physicalToFire: 0.15, physicalToCold: 0.15, physicalToLightning: 0.15 }, armor: { fireResist: 0.1, coldResist: 0.1, lightningResist: 0.1 } },
    equip: { itemType: "ring", name: "Heart of the Rift", stats: { increasedElementalDamage: 0.25, fireResist: 0.2, coldResist: 0.2, lightningResist: 0.2 } }
  },
  {
    key: "empressStinger",
    name: "Empress's Stinger",
    prefix: "Empress",
    power: 14,
    legendary: true,
    description: "The Amber Empress's stinger, still dripping. Whatever it touches burns, and the wielder is gone before the answer comes.",
    base: {
      weapon: craft(14, "balanced", { fireDamage: 1 }, { attackSpeed: 1 }, { boost: LEGENDARY }),
      armor: craft(14, "capMixed", { evasion: 1 }, { attackSpeed: 0.5, fireResist: 0.5 }, { boost: LEGENDARY })
    },
    decoration: { weapon: { igniteChance: 0.1, attackSpeed: 0.08 }, armor: { evasion: 18 }, accessory: { igniteChance: 0.08 } },
    equip: { itemType: "ring", name: "Signet of the Empress", stats: { evasion: 180, attackSpeed: 0.1, igniteChance: 0.15 } }
  },
  {
    key: "regentPhylactery",
    name: "Regent's Phylactery",
    prefix: "Regent",
    power: 14,
    legendary: true,
    description: "Where the Dusk Regent kept what was left of his life. It holds far more than one body should.",
    base: {
      armor: craft(14, "capMixed", { ward: 1 }, { maxHealth: 1 }, { boost: LEGENDARY }),
      accessory: accessory("paired", { maxHealth: 80, int: 14, lifeOnHit: 30 }, 6),
      amulet: accessory("paired", { maxHealth: 80, ward: amuletWard(14, 1.25) }, 6)
    },
    decoration: { armor: { maxHealth: 20, ward: 5.5 }, accessory: { increasedMaxHealth: 0.12 }, weapon: { chillChance: 0.1 } },
    equip: { itemType: "amulet", name: "Phylactery of the Regent", stats: { increasedMaxHealth: 0.15, ward: 100, chillChance: 0.15, lifeOnHit: 30 } }
  },
  {
    key: "overseerSeal",
    name: "Overseer's Seal",
    prefix: "Overseer",
    power: 14,
    legendary: true,
    description: "The Ironbound Overseer's seal of command. Blows glance off it, and the ones it returns are made to last.",
    base: {
      shield: craft(14, "capMixed", { blockChance: 1 }, { critMultiplier: 0.5, maxHealth: 0.5 }, { boost: LEGENDARY }),
      weapon: craft(14, "balanced", { physicalDamage: 1 }, { accuracy: 1 }, { boost: LEGENDARY })
    },
    decoration: { weapon: { critMultiplier: 0.2, accuracy: 25 }, shield: { blockChance: 0.09 }, armor: { armor: 18 } },
    equip: { itemType: "amulet", name: "Seal of the Overseer", stats: { blockChance: 0.1, increasedArmor: 0.25, critMultiplier: 0.4 } }
  },
  {
    key: "heraldBolt",
    name: "Herald's Thunderbolt",
    prefix: "Herald",
    power: 14,
    legendary: true,
    description: "A bolt the Storm Herald never got to throw. It waits for one perfect strike.",
    base: {
      weapon: craft(14, "balanced", { lightningDamage: 1 }, { critMultiplier: 1 }, { boost: LEGENDARY }),
      accessory: accessory("paired", { critMultiplier: 0.4, shockChance: 0.15 }, 6)
    },
    decoration: { weapon: { critMultiplier: 0.3, physicalToLightning: 0.4 }, accessory: { shockChance: 0.08 } },
    equip: { itemType: "ring", name: "Ring of the Herald", stats: { critMultiplier: 0.5, lightningDamage: 30, shockChance: 0.15 } }
  },
  {
    // Power 15 like the Throne's mythic (the tables stop there), with a bigger boost to stay a step above it.
    key: "borrowedCrown",
    name: "The Borrowed Crown",
    prefix: "Usurper's",
    power: 15,
    legendary: true,
    description: "The crown the Pretender took from the Shattered King. It still answers to whoever wears it, for now.",
    base: {
      helmet: craft(15, "balanced", { armor: 0.5, evasion: 0.5 }, { maxHealth: 1 }, { boost: 1.4 }),
      accessory: accessory("paired", { increasedDamage: 0.3, attackSpeed: 0.12 }, 7)
    },
    decoration: { weapon: { increasedDamage: 0.2 }, armor: { maxHealth: 25 }, accessory: { attackSpeed: 0.1 } },
    equip: { itemType: "amulet", name: "The Borrowed Crown", stats: { increasedDamage: 0.35, attackSpeed: 0.12, increasedMaxHealth: 0.15 } }
  },
  ...gemMaterials()
];
const materials = Object.fromEntries(list$1.map((m) => [m.key, m]));
const PREMIUM_CHANCE = 2e-3;
const PREMIUM_STAT_MULTIPLIER = 2;
const PREMIUM_CAP_MULTIPLIER = 1.2;
const PREMIUM = "premium:";
const isPremium = (key) => key.startsWith(PREMIUM);
const premiumKey = (key) => isPremium(key) ? key : PREMIUM + key;
const plainKey = (key) => isPremium(key) ? key.slice(PREMIUM.length) : key;
const double = (stats) => Object.fromEntries(Object.entries(stats).map(([k, v]) => [k, (v ?? 0) * PREMIUM_STAT_MULTIPLIER]));
const mapTable = (table, fn) => table && Object.fromEntries(Object.entries(table).map(([tag, value]) => [tag, fn(value)]));
function makePremium(m) {
  return {
    ...m,
    key: premiumKey(m.key),
    name: "Premium " + m.name,
    prefix: "Premium " + (m.prefix ?? m.name),
    description: `A premium ${m.name.toLowerCase()}: double the stats as a base, decoration or worn directly, and base caps 20% higher.` + (m.description ? " " + m.description : ""),
    base: mapTable(m.base, (b) => ({
      ...b,
      stats: Object.fromEntries(Object.entries(b.stats).map(([k, v]) => [k, Array.isArray(v) ? [v[0] * PREMIUM_STAT_MULTIPLIER, v[1] * PREMIUM_CAP_MULTIPLIER] : (v ?? 0) * PREMIUM_STAT_MULTIPLIER])),
      labelPriority: (b.labelPriority ?? m.power) + 0.5
    })),
    decoration: mapTable(m.decoration, double),
    equip: m.equip && { ...m.equip, name: "Premium " + m.equip.name, stats: double(m.equip.stats) },
    premium: true
  };
}
const GEAR_POOL_MULTIPLIER = 2;
const POOL_STATS = ["maxHealth", "ward"];
{
  const done = /* @__PURE__ */ new Set();
  const scale = (stats) => {
    if (!stats || done.has(stats)) return;
    done.add(stats);
    for (const k of POOL_STATS) {
      const v = stats[k];
      if (Array.isArray(v)) stats[k] = [v[0] * GEAR_POOL_MULTIPLIER, v[1] * GEAR_POOL_MULTIPLIER];
      else if (typeof v === "number") stats[k] = v * GEAR_POOL_MULTIPLIER;
    }
  };
  for (const m of list$1) {
    for (const b of Object.values(m.base ?? {})) scale(b.stats);
    for (const d of Object.values(m.decoration ?? {})) scale(d);
    scale((_a = m.equip) == null ? void 0 : _a.stats);
  }
}
const CRIT_BANDS = {
  // [lowest source now, highest source now, new low, new high]
  critChance: { base: [0.02, 0.15, 0.15, 0.4], decoration: [0.02, 0.06, 0.1, 0.25] },
  critMultiplier: { base: [0.15, 0.67, 0.15, 0.4], decoration: [0.08, 0.35, 0.1, 0.25] }
};
{
  const done = /* @__PURE__ */ new Set();
  const band = (stats, kind, power) => {
    if (!stats || done.has(stats)) return;
    done.add(stats);
    for (const k of ["critChance", "critMultiplier"]) {
      const v = stats[k];
      if (typeof v !== "number") continue;
      const [lo, hi, a, b] = CRIT_BANDS[k][kind];
      const t = (Math.min(1, Math.max(0, (v - lo) / (hi - lo))) + (Math.min(power, 15) - 1) / 14) / 2;
      stats[k] = Math.round((a + t * (b - a)) * 100) / 100;
    }
  };
  for (const m of list$1) {
    for (const b of Object.values(m.base ?? {})) band(b.stats, "base", m.power);
    for (const d of Object.values(m.decoration ?? {})) band(d, "decoration", m.power);
  }
}
for (const m of list$1) if (!m.keyItem) materials[premiumKey(m.key)] = makePremium(m);
const materialOrder = list$1.flatMap((m) => m.keyItem ? [m.key] : [m.key, premiumKey(m.key)]);
function requireMaterial(key) {
  const material = materials[key];
  if (!material) {
    throw new Error("Unknown material " + key);
  }
  return material;
}
const genericModifiers = [
  {
    key: "hardened",
    name: "Hardened foes",
    monster: { hp: { more: 1.4 } },
    bonuses: { extraRewardChance: 0.5 },
    feeWeight: 1,
    unlock: { kind: "firstClear" }
  },
  {
    key: "swift",
    name: "Swift foes",
    monster: { evasion: { more: 1.5 }, attacksPerSecond: { more: 1.2 } },
    bonuses: { rarityUpgradeChance: 0.15 },
    feeWeight: 1,
    unlock: { kind: "firstClear" }
  },
  {
    key: "brutal",
    name: "Brutal foes",
    monster: { damage: { more: 2 } },
    bonuses: { goldXpMultiplier: 1.5, extraRewardChance: 0.15 },
    feeWeight: 1,
    unlock: { kind: "clearWith", count: 1 }
  },
  {
    key: "elite",
    name: "Elite patrol",
    monster: { hp: { more: 1.8 }, damage: { more: 1.8 }, armor: { more: 1.8 } },
    bonuses: { bonusRareChance: 1, extraRewardChance: 0.2 },
    feeWeight: 2,
    unlock: { kind: "clearWith", count: 2 }
  },
  // Twice the monsters already pays twice the gold and XP, since both are paid per monster. Every
  // monster in a group attacks all fight, so doubling a group is a big step up: it sits between
  // Elite patrol and Juggernauts.
  {
    key: "horde",
    name: "Overwhelming numbers",
    monster: {},
    duplicate: true,
    bonuses: { extraRewardChance: 0.5 },
    feeWeight: 3,
    unlock: { kind: "clearWith", count: 3 }
  },
  // The top of the ladder: with everything on, even Bramble Road is harder than Ashen Peaks, and
  // no build in the game today should clear it.
  {
    key: "juggernaut",
    name: "Juggernauts",
    monster: { hp: { more: 2.5 }, damage: { more: 2 } },
    bonuses: { extraRewardChance: 1, rarityUpgradeChance: 0.25 },
    feeWeight: 3,
    unlock: { kind: "clearWith", count: 4 }
  },
  {
    key: "relentless",
    name: "Relentless",
    monster: { attacksPerSecond: { more: 1.5 }, accuracy: { more: 2 }, evasion: { more: 1.5 } },
    bonuses: { rarityUpgradeChance: 0.35, goldXpMultiplier: 2 },
    feeWeight: 3,
    unlock: { kind: "clearWith", count: 5 }
  }
];
const groundModifier = (key, name, element) => ({
  key,
  name,
  monster: {},
  addedDamage: { [element]: 0.4 },
  bonuses: { rarityUpgradeChance: 0.15 },
  feeWeight: 1,
  unlock: { kind: "clearWith", count: 1 }
});
const elementalModifiers = [
  groundModifier("burning", "Burning ground", "fire"),
  groundModifier("frozen", "Frozen ground", "cold"),
  groundModifier("shocking", "Shocking ground", "lightning")
];
function questModifiers(openElements = []) {
  return [
    ...genericModifiers,
    ...elementalModifiers.map((m) => openElements.includes(m.key) ? m : { ...m, exclusive: true })
  ];
}
const riteModifier = {
  key: "rite",
  name: "The Oracle's Rite",
  monster: { hp: { more: 1.5 }, damage: { more: 1.3 } },
  bonuses: { extraRewardChance: 0.5, rarityUpgradeChance: 0.2 },
  feeWeight: 4,
  unlock: { kind: "keys", keys: ["amberKey", "graveKey", "cogKey", "galeKey"] },
  rules: ["noRecovery"],
  rite: {
    schedule: [{ from: 0, rules: ["corrosion"] }, { from: 4, rules: ["reflect"] }, { from: 8, rules: ["karma"] }],
    boss: "veiledOracle",
    bossPhases: [["corrosion"], ["reflect"], ["karma"], ["corrosion", "reflect", "karma"]],
    keys: ["amberKey", "graveKey", "cogKey", "galeKey"],
    pool: [
      { material: "oracleEye", weight: 1, min: 1, max: 1 },
      { material: "veilSilk", weight: 1, min: 1, max: 1 },
      { material: "sanctumShard", weight: 1, min: 1, max: 1 }
    ]
  }
};
const classes = {
  warrior: {
    key: "warrior",
    suits: { weapons: ["sword", "axe", "greatsword"], defenses: ["armor", "blockChance"] },
    name: "Warrior",
    coreStat: "str",
    tier: 0,
    growth: { str: 2, dex: 1, int: 1 },
    starterWeapon: "sword",
    names: ["Brenna", "Garrick", "Hild", "Bram", "Petra"],
    description: "Grows Str: more HP and physical damage. Starts with a wooden sword and a free off hand.",
    passiveKey: "fury",
    passive: { name: "Fury", description: "+1 physical damage for every 5 missing life." }
  },
  ranger: {
    key: "ranger",
    suits: { weapons: ["bow"], defenses: ["evasion"] },
    name: "Ranger",
    coreStat: "dex",
    tier: 0,
    growth: { str: 1, dex: 2, int: 1 },
    starterWeapon: "bow",
    names: ["Ryn", "Tamsin", "Wren", "Corin", "Ash"],
    description: "Grows Dex: evasion and accuracy. Starts with a wooden longbow.",
    passiveKey: "followThrough",
    passive: { name: "Follow-through", description: "When a chain of hits kills its target, the remaining hits carry on to the next monster." }
  },
  priest: {
    key: "priest",
    suits: { weapons: ["staff", "wand"], defenses: ["ward"] },
    name: "Priest",
    coreStat: "int",
    tier: 0,
    growth: { str: 1, dex: 1, int: 2 },
    starterWeapon: "staff",
    names: ["Isolde", "Mirek", "Sable", "Odo", "Vesna"],
    description: "Grows Int: crit chance and elemental damage. Starts with a wooden staff.",
    passiveKey: "siphonWard",
    passive: { name: "Siphon ward", description: "1.5x max ward. Each hit you take restores 5% of max ward afterward." }
  },
  reaver: {
    key: "reaver",
    suits: { weapons: ["axe", "greatsword"], defenses: ["armor", "evasion"] },
    name: "Reaver",
    coreStat: "str",
    tier: 1,
    growth: { str: 2, dex: 2, int: 1 },
    starterWeapon: "axe",
    names: ["Hask", "Torva", "Grim", "Ulla", "Bjorn"],
    description: "Grows Str and Dex: HP, damage, evasion and accuracy. Starts with a wooden axe.",
    passiveKey: "cleave",
    passive: { name: "Cleave", description: "Each hit also deals 30% of its damage to every other monster." }
  },
  spellblade: {
    key: "spellblade",
    suits: { weapons: ["dagger", "sword"], defenses: ["evasion", "ward"] },
    name: "Spellblade",
    coreStat: "dex",
    tier: 1,
    growth: { str: 1, dex: 2, int: 2 },
    starterWeapon: "dagger",
    names: ["Lys", "Corvin", "Ilsa", "Maren", "Quill"],
    description: "Grows Dex and Int: evasion, accuracy, crit chance and ward. Starts with a wooden dagger.",
    passiveKey: "riposte",
    passive: { name: "Riposte", description: "+50% crit chance for each attack you dodged in the last 2 seconds." }
  },
  battlemage: {
    key: "battlemage",
    suits: { weapons: ["staff", "wand"], defenses: ["ward", "armor"] },
    name: "Battlemage",
    coreStat: "int",
    tier: 1,
    growth: { str: 2, dex: 1, int: 2 },
    starterWeapon: "staff",
    names: ["Aldric", "Seren", "Tobin", "Ysolde", "Kael"],
    description: "Grows Int and Str: ward, HP and damage. Starts with a wooden staff.",
    passiveKey: "spellward",
    passive: { name: "Spellward", description: "Healing past full HP becomes ward, up to twice max ward. Ward returns to max at the next encounter." }
  },
  monk: {
    key: "monk",
    suits: { weapons: [], defenses: ["armor", "evasion"], note: "Empty hands, no shield" },
    name: "Monk",
    coreStat: "str",
    tier: 2,
    growth: { str: 4, dex: 1, int: 1 },
    names: ["Shen", "Ilka", "Doran", "Mei", "Tarek"],
    description: "Grows Str: HP and damage. Fights with empty hands, and starts with nothing in them.",
    passiveKey: "martialArts",
    passive: { name: "Martial arts", description: "With nothing in either hand (no weapon or shield), attacks add your full core attribute as damage instead of half, attack 1.5 times a second, and gain +15% crit chance, +50% crit multiplier and 15% block chance." }
  },
  ninja: {
    key: "ninja",
    suits: { weapons: ["dagger"], defenses: ["evasion"], note: "Dual wielded" },
    name: "Ninja",
    coreStat: "dex",
    tier: 2,
    growth: { str: 1, dex: 4, int: 1 },
    starterWeapon: "dagger",
    starterOffHand: "dagger",
    names: ["Kaede", "Sorrel", "Jin", "Nyx", "Hollis"],
    description: "Grows Dex: evasion and accuracy. Starts with a wooden dagger in each hand.",
    passiveKey: "dualMastery",
    passive: { name: "Dual mastery", description: "Dual wielding swings at the full doubled speed instead of 75% of it, and deals 25% more damage." }
  },
  wizard: {
    key: "wizard",
    suits: { weapons: ["wand", "staff"], defenses: ["ward"] },
    name: "Wizard",
    coreStat: "int",
    tier: 2,
    growth: { str: 1, dex: 1, int: 4 },
    starterWeapon: "wand",
    names: ["Alaric", "Morwen", "Zephyr", "Ondine", "Cyprian"],
    description: "Grows Int: crit chance, ward and elemental damage. Starts with a wooden wand.",
    passiveKey: "elementalMastery",
    passive: { name: "Elemental mastery", description: "Doubles fire, cold and lightning damage." }
  },
  gladiator: {
    key: "gladiator",
    suits: { weapons: ["sword", "axe"], defenses: ["blockChance", "armor", "evasion"], note: "With a shield" },
    name: "Gladiator",
    coreStat: "str",
    tier: 3,
    growth: { str: 3, dex: 3, int: 1 },
    starterWeapon: "sword",
    starterOffHand: "shield",
    names: ["Varro", "Lucia", "Draco", "Brisa", "Maximo"],
    description: "Grows Str and Dex: HP, damage, evasion and accuracy. Starts with a wooden sword and shield.",
    passiveKey: "counterstrike",
    passive: { name: "Counterstrike", description: "Each blocked hit earns a free attack at 50% damage." }
  },
  saboteur: {
    key: "saboteur",
    suits: { weapons: ["dagger", "wand"], defenses: ["evasion", "ward"], note: "Ignite, chill and shock" },
    name: "Saboteur",
    coreStat: "dex",
    tier: 3,
    growth: { str: 1, dex: 3, int: 3 },
    starterWeapon: "dagger",
    names: ["Vex", "Nettle", "Rask", "Sienna", "Tobias"],
    description: "Grows Dex and Int: evasion, accuracy, crit chance and ward. Starts with a wooden dagger.",
    passiveKey: "exploit",
    passive: { name: "Exploit", description: "Hits deal +20% damage for each different ailment on the target, up to +60%. Your burns last twice as long, and your chill and shock can build to 75%." }
  },
  bloodmage: {
    key: "bloodmage",
    suits: { weapons: ["staff", "greatsword"], defenses: ["armor", "ward"], note: "Life regen and leech" },
    name: "Bloodmage",
    coreStat: "int",
    tier: 3,
    growth: { str: 3, dex: 1, int: 3 },
    starterWeapon: "staff",
    names: ["Morrigan", "Sanguin", "Ilyra", "Corvus", "Ezra"],
    description: "Grows Int and Str: ward, HP and damage. Starts with a wooden staff.",
    passiveKey: "bloodPact",
    passive: { name: "Blood pact", description: "Each attack costs 2% of current HP. Life leech heals over 1 second, and you deal 2% more damage for each 1 HP regenerated per second, leech included." }
  },
  berserker: {
    key: "berserker",
    suits: { weapons: ["axe", "greatsword"], defenses: ["armor"], note: "Dual wielded axes; big HP and recovery" },
    name: "Berserker",
    coreStat: "str",
    tier: 4,
    growth: { str: 4, dex: 2, int: 2 },
    starterWeapon: "axe",
    starterOffHand: "axe",
    names: ["Ragna", "Thorvald", "Ysra", "Gunnar", "Sigrun"],
    description: "Grows Str most: HP and damage. Starts with a wooden axe in each hand.",
    passiveKey: "rampage",
    passive: { name: "Rampage", description: "+1% damage and attack speed for every 10 damage taken in the last 4 seconds." }
  },
  marksman: {
    key: "marksman",
    suits: { weapons: ["bow"], defenses: ["evasion"], note: "Accuracy for big single hits" },
    name: "Marksman",
    coreStat: "dex",
    tier: 4,
    growth: { str: 2, dex: 4, int: 2 },
    starterWeapon: "bow",
    names: ["Hawke", "Linnea", "Orrin", "Talia", "Severin"],
    description: "Grows Dex most: evasion and accuracy. Starts with a wooden longbow.",
    passiveKey: "deadeye",
    passive: { name: "Deadeye", description: "All the hits of an attack land as one combined hit. Each hit still rolls its own crit, and any ailment rolled applies to the combined hit." }
  },
  warlock: {
    key: "warlock",
    suits: { weapons: ["wand", "staff"], defenses: ["ward"], note: "Ignite, chill and shock" },
    name: "Warlock",
    coreStat: "int",
    tier: 4,
    growth: { str: 2, dex: 2, int: 4 },
    starterWeapon: "wand",
    names: ["Malachai", "Ysmay", "Drust", "Hespera", "Oren"],
    description: "Grows Int most: crit chance, ward and elemental damage. Starts with a wooden wand.",
    passiveKey: "hex",
    passive: { name: "Hex", description: "Monsters deal 4% less damage and take 4% more for each second of ailments left on them (up to 80% less)." }
  },
  champion: {
    key: "champion",
    suits: { weapons: ["sword", "greatsword", "bow"], defenses: ["armor", "evasion", "ward"] },
    name: "Champion",
    coreStat: "str",
    tier: 5,
    growth: { str: 3, dex: 3, int: 3 },
    starterWeapon: "sword",
    names: ["Aurelia", "Cassian", "Thea", "Leander", "Isra"],
    description: "Grows every attribute evenly. Starts with a wooden sword.",
    special: "enhanced",
    passive: { name: "Paragon", description: "Rolls one core passive from another class, enhanced." }
  },
  vagabond: {
    key: "vagabond",
    suits: { weapons: [], defenses: [], note: "Whatever its rolled passives favor" },
    name: "Vagabond",
    coreStat: "str",
    tier: 5,
    growth: { str: 1, dex: 1, int: 1 },
    starterWeapon: "sword",
    names: ["Pip", "Moss", "Rook", "Juniper", "Fen"],
    description: "Grows slowly, but knows a bit of everything. Starts with a wooden sword.",
    special: "wildcard",
    passive: { name: "Jack of all trades", description: "Rolls three different core passives from other classes." }
  }
};
function damageStats(cls) {
  const top = Math.max(cls.growth.str, cls.growth.dex, cls.growth.int);
  return ["str", "dex", "int"].filter((k) => cls.growth[k] === top);
}
function classPassive(classKey) {
  var _a2;
  return (_a2 = classes[classKey]) == null ? void 0 : _a2.passiveKey;
}
const monsterList = [
  // Quest 1: Bramble Road
  { key: "rat", name: "Giant Rat", hp: 0.45, damage: 0.6, attacksPerSecond: 1.5, armor: 0, evasion: 1.5, abilities: [{ name: "Gnaw", every: 4, damage: 0.6, applies: { ailment: "bleed", amount: 0.5 }, effect: "bleed" }], basics: ["bite", "scratch"] },
  { key: "goblin", name: "Goblin", hp: 1, damage: 1, attacksPerSecond: 1, armor: 0, abilities: [{ name: "Rusty Shiv", every: 4, damage: 0.8, applies: { ailment: "bleed", amount: 0.5 }, effect: "bleed" }], basics: ["stab", "slash"] },
  { key: "wolf", name: "Wolf", hp: 0.9, damage: 1.1, attacksPerSecond: 1.3, armor: 0, evasion: 1.5, abilities: [{ name: "Pounce", every: 3, damage: 1.4, accuracy: 0.85, effect: "bite" }], basics: ["bite"] },
  { key: "bandit", name: "Bandit", hp: 1.2, damage: 1.2, attacksPerSecond: 1, armor: 1, accuracy: 1.2, abilities: [{ name: "Pocket Sand", every: 4, spell: true, applies: { ailment: "blind", amount: 0.25 }, effect: "dust" }], basics: ["slash", "stab"] },
  { key: "goblinBrute", name: "Goblin Brute", hp: 2.2, damage: 1.4, attacksPerSecond: 0.8, armor: 1, evasion: 0.5, accuracy: 0.8, abilities: [{ name: "Heavy Swing", every: 3, damage: 1.6, accuracy: 0.75, effect: "smash" }], basics: ["smash"] },
  { key: "alphaWolf", name: "Alpha Wolf", hp: 1.8, damage: 1.15, attacksPerSecond: 1.3, armor: 0.5, evasion: 1.5, abilities: [{ name: "Rending Bite", every: 3, damage: 1, applies: { ailment: "bleed", amount: 0.6 }, effect: "bleed" }], basics: ["bite", "scratch"] },
  { key: "banditCaptain", name: "Bandit Captain", hp: 2.5, damage: 1.6, attacksPerSecond: 1, armor: 1.5, accuracy: 1.3, abilities: [{ name: "Rally", every: 8, rally: { amount: 0.15, turns: 3 }, effect: "rally" }], basics: ["slash"] },
  { key: "troll", name: "Bridge Troll", hp: 6, damage: 2, attacksPerSecond: 0.7, armor: 2, evasion: 0.3, accuracy: 0.8, abilities: [{ name: "Club Smash", every: 3, damage: 1.4, accuracy: 0.75, effect: "smash" }, { name: "Troll Blood", every: 6, heal: 0.04, effect: "heal" }], basics: ["smash", "slam"] },
  // Quest 2: Hollow Mines
  { key: "kobold", name: "Kobold", hp: 0.9, damage: 1, attacksPerSecond: 1.2, armor: 0.5, abilities: [{ name: "Rock Toss", every: 3, damage: 1.3, accuracy: 0.75, effect: "throw" }], basics: ["stab"] },
  { key: "caveSpider", name: "Cave Spider", hp: 0.8, damage: 1.2, attacksPerSecond: 1.4, armor: 0, evasion: 2, accuracy: 1.3, abilities: [{ name: "Web Shot", every: 4, damage: 0.4, applies: { ailment: "snare", amount: 0.15 }, effect: "web" }], basics: ["bite"] },
  { key: "skeleton", name: "Skeleton Miner", hp: 1.3, damage: 1.1, attacksPerSecond: 1, armor: 1.5, resist: { cold: 0.5 }, basics: [["throw", "Bone Throw"], "smash"] },
  // Weak hangers-on: every monster in a group attacks all fight, so most groups pair one real
  // threat with one of these.
  { key: "caveBat", flying: true, name: "Cave Bat", hp: 0.45, damage: 0.6, attacksPerSecond: 1.5, armor: 0, evasion: 1.8, accuracy: 1.1, abilities: [{ name: "Sonar Screech", every: 5, spell: true, applies: { ailment: "weaken", amount: 0.15 }, effect: "sonar" }], basics: ["bite"] },
  { key: "koboldShaman", name: "Kobold Shaman", hp: 1.8, damage: 1.7, attacksPerSecond: 0.9, armor: 0.5, accuracy: 1.3, damageTypes: { fire: 1 }, resist: { fire: 0.5 }, abilities: [{ name: "Kindle", every: 4, spell: true, applies: { ailment: "burn", amount: 0.3 }, effect: "kindle" }], basics: [["bolt", "Fire Bolt"]] },
  // Quest 3: Ashen Peaks. Fire damage and heavy armor; most of them are weak to cold.
  { key: "emberMote", flying: true, name: "Ember Mote", hp: 0.45, damage: 0.6, attacksPerSecond: 1.4, armor: 0, evasion: 1.5, damageTypes: { fire: 1 }, resist: { fire: 0.75, cold: -0.5 }, abilities: [{ name: "Blinding Flare", every: 4, spell: true, applies: { ailment: "blind", amount: 0.2 }, effect: "dust" }], basics: [["touch", "Ember Touch"]] },
  { key: "ashImp", name: "Ash Imp", hp: 0.8, damage: 1, attacksPerSecond: 1.3, armor: 0.5, evasion: 1.3, damageTypes: { fire: 1 }, resist: { fire: 0.5, cold: -0.3 }, basics: [["scratch", "Searing Claw"], ["bolt", "Cinder Bolt"]] },
  { key: "cinderHound", name: "Cinder Hound", hp: 1, damage: 1.1, attacksPerSecond: 1.2, armor: 1, damageTypes: { physical: 0.5, fire: 0.5 }, resist: { fire: 0.3 }, abilities: [{ name: "Flame Breath", types: ["fire"], every: 2, spell: true, effect: "fire" }], basics: ["bite"] },
  { key: "obsidianGolem", name: "Obsidian Golem", hp: 2.4, damage: 1.3, attacksPerSecond: 0.7, armor: 4, evasion: 0.3, accuracy: 0.8, resist: { fire: 0.5, cold: -0.3 }, abilities: [{ name: "Rock Slam", every: 3, damage: 1.25, accuracy: 0.85, effect: "earth" }], basics: ["smash"] },
  { key: "salamander", name: "Magma Salamander", hp: 1.8, damage: 1.6, attacksPerSecond: 1, armor: 2, damageTypes: { fire: 1 }, resist: { fire: 0.75, cold: -0.5 }, abilities: [{ name: "Magma Spit", every: 3, damage: 0.8, spell: true, applies: { ailment: "burn", amount: 0.15 }, effect: "fire" }], basics: [["bite", "Searing Bite"], ["lash", "Tail Lash"]] },
  { key: "flameKnight", name: "Flame Knight", hp: 2.2, damage: 1.5, attacksPerSecond: 0.9, armor: 3, accuracy: 1.1, damageTypes: { physical: 0.6, fire: 0.4 }, resist: { fire: 0.3 }, abilities: [{ name: "Searing Slash", types: ["fire"], every: 3, spell: true, effect: "fire" }], basics: ["slash"] },
  { key: "ashenWyrm", name: "Ashen Wyrm", hp: 4, damage: 1.8, attacksPerSecond: 0.8, armor: 3, damageTypes: { physical: 0.4, fire: 0.6 }, resist: { fire: 0.5, cold: -0.4 }, abilities: [{ name: "Flame Breath", types: ["fire"], every: 2, spell: true, effect: "fire" }, { name: "Ash Cloud", every: 5, spell: true, applies: { ailment: "blind", amount: 0.25 }, effect: "dust" }], basics: ["bite", ["lash", "Tail Lash"]] },
  { key: "oreGolem", name: "Ore Golem", hp: 3, damage: 1.4, attacksPerSecond: 0.7, armor: 3, evasion: 0.3, resist: { lightning: 0.5 }, abilities: [{ name: "Rock Slam", every: 3, damage: 1.25, accuracy: 0.85, effect: "earth" }], basics: ["smash"] },
  { key: "broodmother", name: "Broodmother", hp: 3.6, damage: 1.6, attacksPerSecond: 1, armor: 1.5, accuracy: 0.7, damageTypes: { physical: 0.5, cold: 0.5 }, resist: { cold: 0.3, fire: -0.5 }, abilities: [{ name: "Web Spray", every: 3, damage: 0.4, applies: { ailment: "snare", amount: 0.25 }, effect: "web" }, { name: "Frost Bite", types: ["cold"], every: 2, effect: "ice" }], summon: { at: [0.5], monster: "caveSpider", count: 1, name: "Hatch", hp: 0.5 }, basics: ["bite", "sting"] },
  // Sunken Marsh: cold damage and evasive monsters. Weak to fire.
  { key: "bogLeech", name: "Bog Leech", hp: 0.5, damage: 0.6, attacksPerSecond: 1.4, armor: 0, evasion: 1.8, resist: { cold: 0.3, fire: -0.3 }, abilities: [{ name: "Drain", every: 3, damage: 1, drain: 1, effect: "drain" }], basics: ["bite"] },
  { key: "marshWisp", flying: true, name: "Marsh Wisp", hp: 0.45, damage: 0.6, attacksPerSecond: 1.4, armor: 0, evasion: 2, damageTypes: { cold: 1 }, resist: { cold: 0.75, fire: -0.5 }, abilities: [{ name: "Will-o'-wisp", every: 4, spell: true, applies: { ailment: "blind", amount: 0.2 }, effect: "dust" }], basics: [["touch", "Frost Touch"]] },
  { key: "mireStalker", name: "Mire Stalker", hp: 1, damage: 1.1, attacksPerSecond: 1.2, armor: 0.5, evasion: 2, accuracy: 1.1, damageTypes: { physical: 0.6, cold: 0.4 }, resist: { cold: 0.3 }, abilities: [{ name: "Mire Fang", types: ["cold"], every: 3, spell: true, effect: "ice" }], basics: ["scratch", "stab"] },
  { key: "frostToad", name: "Frost Toad", hp: 1.7, damage: 1.5, attacksPerSecond: 0.9, armor: 1, evasion: 1.3, damageTypes: { cold: 1 }, resist: { cold: 0.5, fire: -0.3 }, abilities: [{ name: "Sticky Tongue", every: 3, damage: 0.6, applies: { ailment: "snare", amount: 0.2 }, effect: "lash" }], basics: [["lash", "Tongue Lash"], ["slam", "Body Slam"]] },
  { key: "drownedKnight", name: "Drowned Knight", hp: 2.2, damage: 1.5, attacksPerSecond: 0.9, armor: 2.5, evasion: 1.1, damageTypes: { physical: 0.6, cold: 0.4 }, resist: { cold: 0.3, fire: -0.2 }, abilities: [{ name: "Tidal Slash", types: ["cold"], every: 3, spell: true, effect: "water" }], basics: ["slash"] },
  { key: "bogHag", name: "Bog Hag", hp: 3.6, damage: 1.7, attacksPerSecond: 1, armor: 1.5, evasion: 1.8, accuracy: 1.2, damageTypes: { physical: 0.3, cold: 0.7 }, resist: { cold: 0.5, fire: -0.4 }, abilities: [{ name: "Chilling Hex", every: 6, spell: true, applies: { ailment: "chill", amount: 0.2 }, effect: "chill" }, { name: "Hex of Frailty", every: 7, spell: true, applies: { ailment: "weaken", amount: 0.2 }, effect: "curse" }, { name: "Frost Shard", types: ["cold"], every: 2, spell: true, effect: "ice" }], basics: ["scratch"] },
  // Stormwrack Coast: lightning damage, fast and accurate attackers. Weak to cold.
  { key: "sparkWisp", flying: true, name: "Spark Wisp", hp: 0.45, damage: 0.55, attacksPerSecond: 1.7, armor: 0, evasion: 1.4, accuracy: 1.3, damageTypes: { lightning: 1 }, resist: { lightning: 0.75, cold: -0.3 }, abilities: [{ name: "Static Spark", every: 4, spell: true, applies: { ailment: "shock", amount: 0.1 }, effect: "static" }], basics: [["touch", "Shock Touch"]] },
  { key: "stormHarpy", name: "Storm Harpy", hp: 0.8, damage: 0.9, attacksPerSecond: 1.6, armor: 0.5, evasion: 1.5, accuracy: 1.5, damageTypes: { physical: 0.5, lightning: 0.5 }, resist: { lightning: 0.3 }, abilities: [{ name: "Shriek", every: 5, spell: true, applies: { ailment: "weaken", amount: 0.15 }, effect: "sonar" }, { name: "Lightning Bolt", types: ["lightning"], every: 2, spell: true, effect: "lightning" }], basics: ["talon"] },
  { key: "cragLynx", name: "Wrecker", hp: 1, damage: 1, attacksPerSecond: 1.6, armor: 0.5, evasion: 1.3, accuracy: 1.5, abilities: [{ name: "Harpoon", every: 4, damage: 0.8, applies: { ailment: "snare", amount: 0.2 }, effect: "chains" }], basics: ["smash", "stab"] },
  { key: "thunderRam", name: "Thunder Crab", hp: 2.2, damage: 1.5, attacksPerSecond: 1, armor: 2, accuracy: 1.3, damageTypes: { physical: 0.6, lightning: 0.4 }, resist: { lightning: 0.3, cold: -0.2 }, abilities: [{ name: "Lightning Bolt", types: ["lightning"], every: 3, spell: true, effect: "lightning" }], basics: [["smash", "Pincer"]] },
  { key: "stormcaller", name: "Stormcaller", hp: 1.8, damage: 1.6, attacksPerSecond: 1.2, armor: 1, accuracy: 1.6, damageTypes: { lightning: 1 }, resist: { lightning: 0.5, cold: -0.3 }, abilities: [{ name: "Static Charge", every: 4, spell: true, applies: { ailment: "shock", amount: 0.15 }, effect: "static" }], basics: [["bolt", "Lightning Bolt"]] },
  { key: "thunderbird", flying: true, name: "Thunderbird", hp: 3.6, damage: 1.5, attacksPerSecond: 1.4, armor: 1.5, evasion: 1.2, accuracy: 1.5, damageTypes: { physical: 0.4, lightning: 0.6 }, resist: { lightning: 0.6, cold: -0.4 }, abilities: [{ name: "Thunderclap", types: ["lightning"], every: 2, spell: true, effect: "lightning" }, { name: "Talon Dive", every: 4, damage: 1.5, accuracy: 0.75, effect: "dive" }], basics: ["talon"] },
  // Ambition bosses, fought after a quest's final encounter, on its baseline: about 1.5x the HP and
  // 1.1x the damage of the quest's own final monster.
  // The Sundered Sanctum: all three elements, often in one monster. Every resistance matters.
  { key: "riftMote", flying: true, name: "Rift Mote", hp: 0.5, damage: 0.6, attacksPerSecond: 1.5, armor: 0, evasion: 1.8, damageTypes: { fire: 0.34, cold: 0.33, lightning: 0.33 }, resist: { fire: 0.5, cold: 0.5, lightning: 0.5 }, abilities: [{ name: "Prismatic Spark", types: ["cold", "lightning"], every: 2, spell: true, effect: "prism" }], basics: ["touch"] },
  { key: "riftHound", name: "Rift Hound", hp: 1, damage: 1.1, attacksPerSecond: 1.4, armor: 0.5, evasion: 1.4, accuracy: 1.3, damageTypes: { physical: 0.5, fire: 0.25, cold: 0.25 }, resist: { fire: 0.3, cold: 0.3 }, abilities: [{ name: "Rift Fang", types: ["fire", "cold"], every: 3, effect: "prism" }], basics: ["bite"] },
  { key: "shardGolem", name: "Shard Golem", hp: 2.4, damage: 1.4, attacksPerSecond: 0.8, armor: 4, evasion: 0.4, accuracy: 0.9, damageTypes: { physical: 0.6, lightning: 0.4 }, resist: { lightning: 0.5, cold: 0.3, fire: -0.3 }, abilities: [{ name: "Rock Slam", types: ["physical"], every: 2, effect: "earth" }], basics: [["smash", "Static Fist"]] },
  { key: "emberRevenant", name: "Ember Revenant", hp: 1.8, damage: 1.6, attacksPerSecond: 1, armor: 2, damageTypes: { physical: 0.4, fire: 0.6 }, resist: { fire: 0.5, cold: -0.3 }, abilities: [{ name: "Searing Slash", types: ["fire"], every: 2, effect: "fire" }], basics: ["slash"] },
  { key: "frostRevenant", name: "Frost Revenant", hp: 1.8, damage: 1.5, attacksPerSecond: 1, armor: 2, evasion: 1.2, damageTypes: { physical: 0.4, cold: 0.6 }, resist: { cold: 0.5, fire: -0.3 }, abilities: [{ name: "Frost Slash", types: ["cold"], every: 2, effect: "ice" }], basics: ["slash"] },
  { key: "stormRevenant", name: "Storm Revenant", hp: 1.6, damage: 1.5, attacksPerSecond: 1.2, armor: 1.5, accuracy: 1.5, damageTypes: { physical: 0.4, lightning: 0.6 }, resist: { lightning: 0.5, cold: -0.3 }, abilities: [{ name: "Storm Slash", types: ["lightning"], every: 2, effect: "lightning" }], basics: ["slash"] },
  { key: "riftWarden", name: "Rift Warden", hp: 4, damage: 1.8, attacksPerSecond: 1, armor: 3, evasion: 1, accuracy: 1.3, damageTypes: { physical: 0.1, fire: 0.3, cold: 0.3, lightning: 0.3 }, resist: { fire: 0.4, cold: 0.4, lightning: 0.4 }, abilities: [{ name: "Rift Ward", every: 7, buff: { kind: "ward", amount: 0.15 }, effect: "shield" }, { name: "Fire Burst", types: ["fire"], every: 5, spell: true, effect: "fire" }, { name: "Frost Shard", types: ["cold"], every: 5, spell: true, effect: "ice" }, { name: "Lightning Bolt", types: ["lightning"], every: 5, spell: true, effect: "lightning" }], basics: ["slash"] },
  // The Amber Hive (tier 5, Corrosion): many quick, light strikes, so every hit that lands wears defenses down.
  { key: "swarmling", flying: true, name: "Swarmling", hp: 0.35, damage: 0.35, attacksPerSecond: 2.5, armor: 0, evasion: 2, accuracy: 1.2, abilities: [{ name: "Venom Sting", every: 4, damage: 0.7, applies: { ailment: "bleed", amount: 0.4 }, effect: "poison" }], basics: ["sting", "bite"] },
  { key: "hiveDrone", flying: true, name: "Hive Drone", hp: 0.55, damage: 0.45, attacksPerSecond: 2.2, armor: 0.5, evasion: 1.8, accuracy: 1.3, abilities: [{ name: "Drone Buzz", every: 5, spell: true, applies: { ailment: "weaken", amount: 0.12 }, effect: "sonar" }], basics: ["sting"] },
  { key: "acidSpitter", name: "Acid Spitter", hp: 0.9, damage: 0.6, attacksPerSecond: 1.8, armor: 0.5, accuracy: 1.4, damageTypes: { physical: 0.6, fire: 0.4 }, resist: { fire: 0.5 }, abilities: [{ name: "Acid Glob", types: ["fire"], every: 3, applies: { ailment: "sunder", amount: 0.2 }, effect: "acid" }], basics: ["bite"] },
  { key: "thornMantis", name: "Thorn Mantis", hp: 1.1, damage: 0.7, attacksPerSecond: 2, armor: 1, evasion: 1.5, accuracy: 1.6, abilities: [{ name: "Twin Scythes", every: 3, damage: 1, hits: 2, effect: "slash" }], basics: ["slash", "stab"] },
  { key: "amberBeetle", name: "Amber Beetle", hp: 2.6, damage: 0.9, attacksPerSecond: 1.2, armor: 4, evasion: 0.4, accuracy: 1, resist: { fire: 0.3, cold: 0.3 }, abilities: [{ name: "Amber Shell", every: 5, buff: { kind: "guard", amount: 0.4, turns: 2 }, effect: "shield" }], basics: ["slam", "bite"] },
  { key: "broodGuard", name: "Brood Guard", hp: 2, damage: 0.8, attacksPerSecond: 1.6, armor: 2.5, evasion: 1, accuracy: 1.4, abilities: [{ name: "Impale", every: 4, damage: 1.3, accuracy: 0.8, effect: "stab" }], basics: ["stab", "bite"] },
  { key: "hiveQueen", name: "The Hive Queen", hp: 3, damage: 0.55, attacksPerSecond: 1.8, armor: 2, evasion: 1.2, accuracy: 1.5, damageTypes: { physical: 0.6, fire: 0.4 }, resist: { fire: 0.5 }, abilities: [{ name: "Acid Spit", types: ["fire"], every: 3, spell: true, applies: { ailment: "sunder", amount: 0.25 }, effect: "acid" }], summon: { at: [0.5], monster: "swarmling", count: 2, name: "Call the Swarm", hp: 0.5 }, basics: ["sting"] },
  // Duskgrave Necropolis (tier 5, Lifeless): steady, hard-hitting undead. Nothing heals, so every hit adds up.
  { key: "boneThrall", name: "Bone Thrall", hp: 1, damage: 1, attacksPerSecond: 1, armor: 1.5, resist: { cold: 0.5 }, abilities: [{ name: "Bone Volley", every: 4, damage: 0.8, hits: 3, effect: "throw" }], basics: [["throw", "Bone Throw"], "slash"] },
  { key: "cryptGhoul", name: "Crypt Ghoul", hp: 1, damage: 0.9, attacksPerSecond: 1.5, armor: 0.5, evasion: 1.2, accuracy: 1.3, resist: { cold: 0.3 }, abilities: [{ name: "Paralytic Claw", every: 3, damage: 0.9, applies: { ailment: "snare", amount: 0.2 }, effect: "poison" }], basics: ["scratch", "bite"] },
  { key: "wailingShade", flying: true, name: "Wailing Shade", hp: 0.7, damage: 1, attacksPerSecond: 1.2, armor: 0, evasion: 2, accuracy: 1.4, damageTypes: { cold: 1 }, resist: { cold: 0.75, fire: -0.3 }, abilities: [{ name: "Wail", every: 4, spell: true, applies: { ailment: "weaken", amount: 0.2 }, effect: "sonar" }], basics: [["touch", "Frost Touch"]] },
  { key: "barrowKnight", name: "Barrow Knight", hp: 2.4, damage: 1.5, attacksPerSecond: 0.9, armor: 3.5, accuracy: 1.2, damageTypes: { physical: 0.7, cold: 0.3 }, resist: { cold: 0.5 }, abilities: [{ name: "Grave Blade", types: ["cold"], every: 3, effect: "ice" }], basics: ["slash", "smash"] },
  { key: "plagueBearer", name: "Plague Bearer", hp: 2, damage: 1.2, attacksPerSecond: 1, armor: 1.5, damageTypes: { physical: 0.5, cold: 0.5 }, resist: { cold: 0.5, fire: -0.3 }, abilities: [{ name: "Plague Cloud", every: 4, spell: true, applies: { ailment: "bleed", amount: 0.5 }, effect: "poison" }, { name: "Rot Touch", types: ["cold"], every: 2, effect: "ice" }], basics: ["smash"] },
  { key: "lichAcolyte", name: "Lich Acolyte", hp: 1.4, damage: 1.5, attacksPerSecond: 1, armor: 1, accuracy: 1.6, damageTypes: { cold: 1 }, resist: { cold: 0.6, fire: -0.3 }, abilities: [{ name: "Frost Nova", every: 4, spell: true, applies: { ailment: "chill", amount: 0.15 }, effect: "chill" }], basics: [["bolt", "Frost Bolt"]] },
  { key: "paleLich", name: "The Pale Lich", hp: 3, damage: 1.3, attacksPerSecond: 1, armor: 2, evasion: 1, accuracy: 1.5, damageTypes: { physical: 0.3, cold: 0.7 }, resist: { cold: 0.7, fire: -0.2 }, abilities: [{ name: "Frost Nova", every: 3, spell: true, damage: 0.8, applies: { ailment: "chill", amount: 0.15 }, effect: "ice" }, { name: "Soul Drain", every: 5, spell: true, damage: 1, drain: 0.5, effect: "drain" }], summon: { at: [0.5], monster: "boneThrall", count: 2, name: "Raise Dead", hp: 0.5 }, basics: [["touch", "Grave Touch"]] },
  // Ironbound Foundry (tier 5, Reflection): heavily armored constructs. Hits that land are smaller, and so is what comes back.
  { key: "cogSpider", name: "Cog Spider", hp: 0.7, damage: 0.7, attacksPerSecond: 1.8, armor: 2, evasion: 1.4, accuracy: 1.3, abilities: [{ name: "Wire Snare", every: 4, damage: 0.4, applies: { ailment: "snare", amount: 0.15 }, effect: "web" }], basics: ["bite", "stab"] },
  { key: "brassSentry", name: "Brass Sentry", hp: 1.3, damage: 1, attacksPerSecond: 1.1, armor: 4, accuracy: 1.2, abilities: [{ name: "Overclock", every: 6, rally: { amount: 0.3, turns: 3 }, effect: "steam" }], basics: ["stab", "throw"] },
  { key: "steamHound", name: "Steam Hound", hp: 1.1, damage: 1, attacksPerSecond: 1.4, armor: 2.5, evasion: 1.2, damageTypes: { physical: 0.6, fire: 0.4 }, resist: { fire: 0.4 }, abilities: [{ name: "Steam Breath", types: ["fire"], every: 3, spell: true, effect: "steam" }], basics: ["bite"] },
  { key: "smelterGolem", name: "Smelter Golem", hp: 2.6, damage: 1.4, attacksPerSecond: 0.8, armor: 5, evasion: 0.3, accuracy: 0.9, damageTypes: { physical: 0.5, fire: 0.5 }, resist: { fire: 0.6, cold: -0.2 }, abilities: [{ name: "Rock Slam", types: ["physical"], every: 2, effect: "earth" }], basics: [["smash", "Molten Fist"]] },
  { key: "clockworkKnight", name: "Clockwork Knight", hp: 2, damage: 1.3, attacksPerSecond: 1.1, armor: 4.5, evasion: 0.8, accuracy: 1.3, resist: { lightning: -0.3 }, abilities: [{ name: "Shield Wall", every: 5, buff: { kind: "guard", amount: 0.4, turns: 2 }, effect: "shield" }], basics: ["slash", "stab"] },
  { key: "forgeWarden", name: "Forge Warden", hp: 1.8, damage: 1.5, attacksPerSecond: 1, armor: 3, accuracy: 1.4, damageTypes: { physical: 0.4, fire: 0.6 }, resist: { fire: 0.5 }, abilities: [{ name: "Molten Strike", types: ["fire"], every: 2, effect: "fire" }, { name: "Forge Hammer", every: 4, damage: 1.3, accuracy: 0.8, effect: "earth" }], basics: ["smash"] },
  { key: "forgeTitan", name: "The Forge Titan", hp: 3.2, damage: 1.4, attacksPerSecond: 0.8, armor: 6, evasion: 0.4, accuracy: 1.2, damageTypes: { physical: 0.6, fire: 0.4 }, resist: { fire: 0.6, lightning: -0.2 }, abilities: [{ name: "Hammerfall", every: 4, damage: 1.6, accuracy: 0.7, applies: { ailment: "sunder", amount: 0.25 }, effect: "earth" }, { name: "Molten Spray", types: ["fire"], every: 3, spell: true, applies: { ailment: "burn", amount: 0.1 }, effect: "fire" }], basics: ["smash", "slam"] },
  // Skyspire Aerie (tier 5, Karma): quick, evasive flyers with thin hides. One clean blow beats a flurry.
  { key: "galeKestrel", flying: true, name: "Gale Kestrel", hp: 0.5, damage: 0.7, attacksPerSecond: 1.8, armor: 0, evasion: 2.2, accuracy: 1.4, abilities: [{ name: "Gust", every: 4, applies: { ailment: "gale", amount: 0.2 }, effect: "gust" }], basics: ["talon"] },
  { key: "skyHarpy", flying: true, name: "Sky Harpy", hp: 0.8, damage: 0.9, attacksPerSecond: 1.5, armor: 0.5, evasion: 1.8, accuracy: 1.5, damageTypes: { physical: 0.6, lightning: 0.4 }, resist: { lightning: 0.3 }, abilities: [{ name: "Storm Shriek", types: ["lightning"], every: 3, spell: true, effect: "lightning" }], basics: ["talon", "scratch"] },
  { key: "stormHawk", flying: true, name: "Storm Hawk", hp: 0.7, damage: 1, attacksPerSecond: 1.6, armor: 0, evasion: 2, accuracy: 1.5, damageTypes: { lightning: 1 }, resist: { lightning: 0.6 }, abilities: [{ name: "Static Dive", every: 4, damage: 1.4, accuracy: 0.75, effect: "dive" }], basics: ["talon", ["bolt", "Lightning Bolt"]] },
  { key: "cloudSerpent", flying: true, name: "Cloud Serpent", hp: 1.8, damage: 1.3, attacksPerSecond: 1, armor: 1.5, evasion: 1.3, damageTypes: { physical: 0.5, lightning: 0.5 }, resist: { lightning: 0.5 }, abilities: [{ name: "Cloud Coil", every: 4, damage: 0.6, applies: { ailment: "snare", amount: 0.2 }, effect: "lash" }, { name: "Thunder Breath", types: ["lightning"], every: 2, spell: true, effect: "lightning" }], basics: ["bite", "lash"] },
  { key: "thunderEagle", flying: true, name: "Thunder Eagle", hp: 1.5, damage: 1.4, attacksPerSecond: 1.2, armor: 1, evasion: 1.6, accuracy: 1.6, damageTypes: { physical: 0.4, lightning: 0.6 }, resist: { lightning: 0.5 }, abilities: [{ name: "Thunder Dive", types: ["lightning"], every: 2, effect: "lightning" }], basics: ["talon"] },
  { key: "windWarden", name: "Wind Warden", hp: 2.2, damage: 1.3, attacksPerSecond: 1.1, armor: 2.5, evasion: 1.4, accuracy: 1.4, resist: { lightning: 0.3 }, abilities: [{ name: "Gust", every: 4, applies: { ailment: "gale", amount: 0.2 }, effect: "gust" }], basics: ["stab", "slash"] },
  { key: "skySovereign", name: "The Sky Sovereign", hp: 3, damage: 1.25, attacksPerSecond: 1.3, armor: 2, evasion: 1.6, accuracy: 1.6, damageTypes: { physical: 0.4, lightning: 0.6 }, resist: { lightning: 0.6 }, abilities: [{ name: "Storm Call", types: ["lightning"], every: 2, spell: true, effect: "lightning" }, { name: "Sovereign Dive", every: 4, damage: 1.6, accuracy: 0.7, effect: "dive" }], basics: ["talon", "bite"] },
  // The Oracle's Rite (Sundered Sanctum): its boss shifts between the tier 5 rules as its life drops.
  { key: "veiledOracle", name: "The Veiled Oracle", hp: 9, damage: 2, attacksPerSecond: 1, armor: 3, evasion: 1.3, accuracy: 1.5, damageTypes: { physical: 0.25, fire: 0.25, cold: 0.25, lightning: 0.25 }, resist: { fire: 0.4, cold: 0.4, lightning: 0.4 }, abilities: [{ name: "Foresight", every: 5, buff: { kind: "evade", amount: 0.5, turns: 3 }, effect: "shimmer" }, { name: "Hex of Doom", every: 6, spell: true, applies: { ailment: "weaken", amount: 0.25 }, effect: "curse" }, { name: "Starfall", types: ["fire", "cold", "lightning"], every: 3, spell: true, effect: "starfall" }], basics: [["touch", "Veiled Touch"]] },
  // The Shattered Throne (tier 6): a bit of everything the earlier areas threw at you, all very strong.
  { key: "riftStalker", name: "Rift Stalker", hp: 0.9, damage: 1, attacksPerSecond: 1.7, armor: 1, evasion: 2.2, accuracy: 1.5, abilities: [{ name: "Shadowstep", every: 5, buff: { kind: "evade", amount: 0.5, turns: 2 }, effect: "shimmer" }], basics: ["slash", "stab"] },
  { key: "starfallMote", flying: true, name: "Starfall Mote", hp: 0.6, damage: 0.8, attacksPerSecond: 1.6, armor: 0, evasion: 1.8, accuracy: 1.3, damageTypes: { fire: 0.34, cold: 0.33, lightning: 0.33 }, resist: { fire: 0.5, cold: 0.5, lightning: 0.5 }, abilities: [{ name: "Starfall", types: ["cold", "lightning"], every: 2, spell: true, effect: "starfall" }], basics: ["touch"] },
  { key: "voidWraith", flying: true, name: "Void Wraith", hp: 1.2, damage: 1.3, attacksPerSecond: 1.2, armor: 0.5, evasion: 2, accuracy: 1.5, damageTypes: { cold: 0.7, physical: 0.3 }, resist: { cold: 0.6 }, abilities: [{ name: "Void Touch", types: ["cold"], every: 3, drain: 0.5, effect: "drain" }], basics: ["scratch"] },
  { key: "throneSentinel", name: "Throne Sentinel", hp: 2.6, damage: 1.4, attacksPerSecond: 0.9, armor: 5, evasion: 0.5, accuracy: 1.2, resist: { fire: 0.3, cold: 0.3, lightning: 0.3 }, abilities: [{ name: "Bulwark", every: 5, buff: { kind: "guard", amount: 0.4, turns: 2 }, effect: "shield" }], basics: ["smash", "stab"] },
  { key: "shatteredKnight", name: "Shattered Knight", hp: 2, damage: 1.5, attacksPerSecond: 1.1, armor: 3, evasion: 1, accuracy: 1.5, damageTypes: { physical: 0.6, lightning: 0.4 }, resist: { lightning: 0.4 }, abilities: [{ name: "Storm Blade", types: ["lightning"], every: 2, effect: "lightning" }], basics: ["slash"] },
  { key: "emberColossus", name: "Ember Colossus", hp: 3, damage: 1.7, attacksPerSecond: 0.8, armor: 3.5, evasion: 0.4, accuracy: 1, damageTypes: { physical: 0.4, fire: 0.6 }, resist: { fire: 0.6, cold: -0.2 }, abilities: [{ name: "Magma Slam", types: ["fire"], every: 2, effect: "fire" }], basics: ["smash", "slam"] },
  {
    key: "shatteredKing",
    name: "The Shattered King",
    hp: 9,
    damage: 1.2,
    attacksPerSecond: 1,
    armor: 3,
    evasion: 1.2,
    accuracy: 1.5,
    damageTypes: { physical: 0.4, fire: 0.2, cold: 0.2, lightning: 0.2 },
    resist: { fire: 0.4, cold: 0.4, lightning: 0.4 },
    abilities: [{ name: "Crown's Command", every: 6, spell: true, applies: { ailment: "weaken", amount: 0.25 }, effect: "curse" }, { name: "Shard Storm", types: ["fire", "cold", "lightning"], every: 3, spell: true, effect: "starfall" }],
    basics: ["slash", "smash"],
    shatter: { at: [0.75, 0.5, 0.25], shard: "kingShard", count: 2, damageTaken: 0.5 },
    risingWill: { every: 10, growth: 0.1, heal: 0.05 }
  },
  { key: "kingShard", name: "Shard of the King", hp: 0.6, damage: 0.5, attacksPerSecond: 1.2, armor: 2, evasion: 1, accuracy: 1.4, damageTypes: { physical: 0.4, fire: 0.2, cold: 0.2, lightning: 0.2 }, resist: { fire: 0.4, cold: 0.4, lightning: 0.4 }, abilities: [{ name: "Shard Pulse", types: ["fire", "cold", "lightning"], every: 3, spell: true, effect: "prism" }], basics: ["slam"] },
  { key: "briarKing", name: "The Briar King", hp: 9, damage: 2.2, attacksPerSecond: 0.9, armor: 2.5, accuracy: 1.1, thorns: 10, abilities: [{ name: "Root Snare", every: 4, spell: true, applies: { ailment: "snare", amount: 0.3 }, effect: "vines" }, { name: "Bramble Lash", every: 3, damage: 1, hits: 2, effect: "lash" }], basics: ["lash", "slash"] },
  { key: "stormveinColossus", name: "Stormvein Colossus", hp: 5.5, damage: 1.8, attacksPerSecond: 0.8, armor: 2.5, evasion: 0.4, damageTypes: { physical: 0.6, lightning: 0.4 }, resist: { lightning: 0.6 }, abilities: [{ name: "Rock Slam", types: ["physical"], every: 2, effect: "earth" }, { name: "Static Discharge", every: 5, spell: true, applies: { ailment: "shock", amount: 0.2 }, effect: "static" }], basics: [["smash", "Static Fist"], ["slam", "Static Slam"]] },
  { key: "wyrmqueen", name: "The Wyrmqueen", hp: 6, damage: 2, attacksPerSecond: 0.9, armor: 3, accuracy: 1.1, damageTypes: { physical: 0.4, fire: 0.6 }, resist: { fire: 0.6, cold: -0.3 }, abilities: [{ name: "Inferno", types: ["fire"], every: 2, spell: true, applies: { ailment: "burn", amount: 0.08 }, effect: "fire" }, { name: "Wing Buffet", every: 4, damage: 0.8, applies: { ailment: "weaken", amount: 0.2 }, effect: "gust" }], basics: ["bite", ["lash", "Tail Lash"], "talon"] },
  { key: "mireMother", name: "The Mire Mother", hp: 6, damage: 1.9, attacksPerSecond: 1, armor: 2, evasion: 1.8, accuracy: 1.2, damageTypes: { physical: 0.4, cold: 0.6 }, resist: { cold: 0.6, fire: -0.3 }, abilities: [{ name: "Drowning Grasp", every: 4, spell: true, applies: { ailment: "snare", amount: 0.35 }, effect: "water" }, { name: "Frost Shard", types: ["cold"], every: 2, spell: true, effect: "ice" }], summon: { at: [0.6, 0.3], monster: "bogLeech", count: 2, name: "Leech Brood" }, basics: [["lash", "Grasping Tide"], "slam"] },
  { key: "riftTyrant", name: "The Rift Tyrant", hp: 6.5, damage: 2, attacksPerSecond: 1, armor: 3, evasion: 1.2, accuracy: 1.3, damageTypes: { physical: 0.25, fire: 0.25, cold: 0.25, lightning: 0.25 }, resist: { fire: 0.5, cold: 0.5, lightning: 0.5 }, abilities: [{ name: "Prismatic Beam", types: ["fire", "cold", "lightning"], every: 3, spell: true, effect: "prism" }, { name: "Phase Shift", every: 5, buff: { kind: "evade", amount: 0.5, turns: 2 }, effect: "shimmer" }], basics: ["slash", "smash"] },
  // Ambition bosses for the tier 5 areas and the Throne.
  { key: "amberEmpress", name: "The Amber Empress", hp: 6.5, damage: 1.5, attacksPerSecond: 1.6, armor: 2.5, evasion: 1.7, accuracy: 1.6, damageTypes: { physical: 0.6, fire: 0.4 }, resist: { fire: 0.5 }, abilities: [{ name: "Amber Prison", every: 6, spell: true, applies: { ailment: "snare", amount: 0.4 }, effect: "chains" }, { name: "Royal Stinger", every: 3, damage: 1, applies: { ailment: "bleed", amount: 0.6 }, effect: "sting" }, { name: "Molten Amber", types: ["fire"], every: 2, spell: true, effect: "fire" }], basics: ["sting", "slash"] },
  { key: "duskRegent", name: "The Dusk Regent", hp: 7, damage: 2, attacksPerSecond: 0.9, armor: 3, evasion: 0.8, accuracy: 1.4, damageTypes: { physical: 0.4, cold: 0.6 }, resist: { cold: 0.7, fire: -0.2 }, abilities: [{ name: "Withering Curse", every: 5, spell: true, applies: { ailment: "weaken", amount: 0.25 }, effect: "curse" }, { name: "Blood Tithe", every: 3, damage: 1, drain: 1, effect: "drain" }, { name: "Night Frost", types: ["cold"], every: 2, spell: true, effect: "ice" }], basics: ["slash", "bite"] },
  { key: "ironOverseer", name: "The Ironbound Overseer", hp: 7, damage: 1.6, attacksPerSecond: 0.8, armor: 7, evasion: 0.4, accuracy: 1.3, damageTypes: { physical: 0.6, fire: 0.4 }, resist: { fire: 0.6, lightning: -0.2 }, abilities: [{ name: "Shackles", every: 5, spell: true, applies: { ailment: "snare", amount: 0.35 }, effect: "chains" }, { name: "Steam Burst", types: ["fire"], every: 3, spell: true, effect: "steam" }], summon: { at: [0.5], monster: "brassSentry", count: 2, name: "Call Sentries", hp: 0.5 }, basics: ["lash", "smash"] },
  { key: "stormHerald", name: "The Storm Herald", hp: 6, damage: 1.5, attacksPerSecond: 1.4, armor: 2, evasion: 1.8, accuracy: 1.7, damageTypes: { physical: 0.3, lightning: 0.7 }, resist: { lightning: 0.6, cold: -0.2 }, abilities: [{ name: "Chain Lightning", types: ["lightning"], every: 3, spell: true, hits: 3, effect: "lightning" }, { name: "Herald's Gale", every: 5, applies: { ailment: "gale", amount: 0.25 }, effect: "gust" }, { name: "Static Field", every: 6, spell: true, applies: { ailment: "shock", amount: 0.2 }, effect: "static" }], basics: ["slash"] },
  {
    key: "pretender",
    name: "The Pretender",
    hp: 10,
    damage: 1.6,
    attacksPerSecond: 1.1,
    armor: 3.5,
    evasion: 1.4,
    accuracy: 1.7,
    damageTypes: { physical: 0.25, fire: 0.25, cold: 0.25, lightning: 0.25 },
    resist: { fire: 0.5, cold: 0.5, lightning: 0.5 },
    abilities: [{ name: "Borrowed Crown", every: 6, buff: { kind: "guard", amount: 0.5, turns: 2 }, effect: "mirror" }, { name: "Mimicry", types: ["fire", "cold", "lightning"], every: 3, spell: true, mimic: true, effect: "mirror" }],
    basics: ["slash", "stab"],
    risingWill: { every: 12, growth: 0.08 }
  },
  { key: "tempestRoc", flying: true, name: "The Tempest Roc", hp: 5.5, damage: 1.7, attacksPerSecond: 1.4, armor: 2, evasion: 1.3, accuracy: 1.5, damageTypes: { physical: 0.4, lightning: 0.6 }, resist: { lightning: 0.6, cold: -0.3 }, abilities: [{ name: "Chain Lightning", types: ["lightning"], every: 3, spell: true, hits: 3, effect: "lightning" }, { name: "Gale", every: 5, applies: { ailment: "gale", amount: 0.25 }, effect: "gust" }], basics: ["talon", "slam"] }
];
const monsters = Object.fromEntries(monsterList.map((m) => [m.key, m]));
const MAX_MONSTERS_PER_ENCOUNTER = 4;
const questShape = ["C", "C", "C", "C", "U", "C", "C", "U", "U", "C", "C", "R"];
const growthPerEncounter = 0.2;
const RARE_POWER = 4.4 * (1 + 0.02 * 11);
const tierMultiplier = { C: 1, U: 1.4, R: RARE_POWER / (1 + growthPerEncounter * 11) };
function buildEncounters(groups) {
  if (groups.length !== questShape.length) {
    throw new Error("Quest needs " + questShape.length + " encounters");
  }
  if (groups.some((g) => g.length < 1 || g.length > MAX_MONSTERS_PER_ENCOUNTER)) {
    throw new Error(`Encounters need 1 to ${MAX_MONSTERS_PER_ENCOUNTER} monsters`);
  }
  return groups.map((monsters2, i) => ({ tier: questShape[i], monsters: monsters2 }));
}
const questList = [
  {
    key: "brambleRoad",
    levelBand: [3, 10],
    name: "Bramble Road",
    description: "Goblins, wolves and bandits along an overgrown trade road.",
    basePower: 1,
    monsterScale: 1.05,
    entryFee: 0,
    fameToUnlock: 0,
    fameForFirstClear: 10,
    travelSeconds: 0,
    mapPosition: { x: 430, y: 110 },
    encounters: buildEncounters([
      ["rat", "rat"],
      ["goblin"],
      ["goblin", "rat"],
      ["wolf", "rat"],
      ["goblinBrute"],
      ["goblin", "rat"],
      ["bandit", "rat"],
      ["alphaWolf", "rat"],
      ["banditCaptain"],
      ["bandit", "wolf"],
      ["bandit", "rat", "rat"],
      ["troll"]
    ]),
    pools: {
      C: [
        { material: "wood", weight: 3, min: 1, max: 1 },
        { material: "copperOre", weight: 3, min: 1, max: 1 },
        { material: "roughHide", weight: 3, min: 1, max: 1 },
        { material: "boneShard", weight: 2, min: 1, max: 1 },
        { material: "flint", weight: 2, min: 1, max: 1 },
        { material: "hawkFeather", weight: 2, min: 1, max: 1 },
        { material: "healingMoss", weight: 2, min: 1, max: 1 },
        { material: "sinew", weight: 2, min: 1, max: 1 }
      ],
      U: [
        { material: "rubyShard", weight: 1, min: 1, max: 1 },
        { material: "sapphireShard", weight: 1, min: 1, max: 1 },
        { material: "emeraldShard", weight: 1, min: 1, max: 1 },
        { material: "ironOre", weight: 3, min: 1, max: 1 },
        { material: "tannedLeather", weight: 3, min: 1, max: 1 },
        { material: "wolfFang", weight: 2, min: 1, max: 1 },
        { material: "thornvine", weight: 2, min: 1, max: 1 },
        { material: "whetstone", weight: 2, min: 1, max: 1 },
        { material: "trollBlood", weight: 2, min: 1, max: 1 }
      ],
      R: [
        { material: "silverOre", weight: 2, min: 1, max: 1 },
        { material: "moonstone", weight: 1, min: 1, max: 1 },
        { material: "bloodstone", weight: 1, min: 1, max: 1 },
        { material: "amber", weight: 1, min: 1, max: 1 }
      ],
      // Only reached by rarity upgrades from quest modifiers.
      M: [
        { material: "thornheart", weight: 1, min: 1, max: 1 },
        { material: "wolfkingPelt", weight: 1, min: 1, max: 1 }
      ]
    },
    modifiers: questModifiers(),
    boss: { monster: "briarKing", legendary: "briarcrown" }
  },
  {
    key: "hollowMines",
    levelBand: [8, 14],
    name: "Hollow Mines",
    description: "Abandoned mine shafts overrun by kobolds and worse things below.",
    basePower: 3.2,
    monsterScale: 1.05,
    entryFee: 20,
    fameToUnlock: 10,
    fameForFirstClear: 25,
    travelSeconds: 0,
    mapPosition: { x: 715, y: 145 },
    encounters: buildEncounters([
      ["kobold", "kobold"],
      ["caveSpider", "kobold"],
      ["skeleton"],
      ["caveSpider", "caveBat"],
      ["koboldShaman", "caveBat"],
      ["skeleton", "caveBat"],
      ["kobold", "caveSpider"],
      ["oreGolem"],
      ["koboldShaman", "caveBat"],
      ["skeleton", "kobold"],
      ["skeleton", "caveBat", "caveBat"],
      ["broodmother"]
    ]),
    pools: {
      // Quest 1's uncommon materials are common here.
      C: [
        { material: "ironOre", weight: 3, min: 1, max: 1 },
        { material: "tannedLeather", weight: 3, min: 1, max: 1 },
        { material: "wolfFang", weight: 2, min: 1, max: 1 },
        { material: "copperOre", weight: 1, min: 1, max: 1 },
        { material: "thornvine", weight: 2, min: 1, max: 1 },
        { material: "whetstone", weight: 2, min: 1, max: 1 },
        { material: "trollBlood", weight: 2, min: 1, max: 1 },
        { material: "sinew", weight: 1, min: 1, max: 1 }
      ],
      U: [
        { material: "roughTigerEye", weight: 1, min: 1, max: 1 },
        { material: "roughSunstone", weight: 1, min: 1, max: 1 },
        { material: "roughOpal", weight: 1, min: 1, max: 1 },
        { material: "steelIngot", weight: 3, min: 1, max: 1 },
        { material: "trollHide", weight: 2, min: 1, max: 1 },
        { material: "garnet", weight: 2, min: 1, max: 1 },
        { material: "silverOre", weight: 1, min: 1, max: 1 },
        { material: "spiderSilk", weight: 3, min: 1, max: 1 },
        { material: "ancientBone", weight: 2, min: 1, max: 1 },
        { material: "ritualAsh", weight: 2, min: 1, max: 1 },
        { material: "amber", weight: 1, min: 1, max: 1 }
      ],
      R: [
        { material: "mithril", weight: 2, min: 1, max: 1 },
        { material: "moonstone", weight: 1, min: 1, max: 1 },
        { material: "broodfang", weight: 2, min: 1, max: 1 },
        { material: "bloodstone", weight: 1, min: 1, max: 1 }
      ],
      M: [
        { material: "deepfireCore", weight: 1, min: 1, max: 1 },
        { material: "golemHeart", weight: 1, min: 1, max: 1 }
      ]
    },
    modifiers: questModifiers(),
    boss: { monster: "stormveinColossus", legendary: "stormveinHeart" }
  },
  {
    key: "ashenPeaks",
    levelBand: [14, 23],
    name: "Ashen Peaks",
    description: "Smoking slopes where fire-born beasts and burning knights guard the old wyrm's roost. Armor and fire resistance keep you alive; cold damage cuts through.",
    basePower: 6.5,
    monsterScale: 1.3,
    entryFee: 100,
    fameToUnlock: 0,
    unlockAchievement: "clear-hollowMines",
    fameForFirstClear: 0,
    travelSeconds: 0,
    mapPosition: { x: 630, y: 380 },
    encounters: buildEncounters([
      ["ashImp", "ashImp"],
      ["cinderHound", "ashImp"],
      ["obsidianGolem"],
      ["cinderHound", "emberMote"],
      ["salamander", "emberMote"],
      ["obsidianGolem", "emberMote"],
      ["cinderHound", "ashImp"],
      ["flameKnight"],
      ["salamander", "emberMote"],
      ["obsidianGolem", "ashImp"],
      ["flameKnight", "emberMote", "emberMote"],
      ["ashenWyrm"]
    ]),
    pools: {
      // Hollow Mines' uncommon materials are common in every tier 3 area, plus one of the area's own.
      C: [
        { material: "steelIngot", weight: 3, min: 1, max: 1 },
        { material: "trollHide", weight: 2, min: 1, max: 1 },
        { material: "garnet", weight: 2, min: 1, max: 1 },
        { material: "silverOre", weight: 2, min: 1, max: 1 },
        { material: "spiderSilk", weight: 2, min: 1, max: 1 },
        { material: "ancientBone", weight: 2, min: 1, max: 1 },
        { material: "ritualAsh", weight: 2, min: 1, max: 1 },
        { material: "amber", weight: 1, min: 1, max: 1 },
        { material: "brimstone", weight: 3, min: 1, max: 1 }
      ],
      // Half shared with the other tier 3 areas, half Ashen Peaks' own.
      U: [
        { material: "ruby", weight: 1, min: 1, max: 1 },
        { material: "obsidian", weight: 2, min: 1, max: 1 },
        { material: "salamanderScale", weight: 2, min: 1, max: 1 },
        { material: "rimecoal", weight: 2, min: 1, max: 1 },
        { material: "cinderwool", weight: 2, min: 1, max: 1 },
        { material: "mithril", weight: 1, min: 1, max: 1 },
        { material: "quicksilver", weight: 2, min: 1, max: 1 },
        { material: "runedSlate", weight: 2, min: 1, max: 1 },
        { material: "wyvernLeather", weight: 2, min: 1, max: 1 }
      ],
      R: [
        { material: "sunstone", weight: 1, min: 1, max: 1 },
        { material: "wyrmScale", weight: 2, min: 1, max: 1 },
        { material: "glacialHeart", weight: 2, min: 1, max: 1 },
        { material: "skyshard", weight: 1, min: 1, max: 1 },
        { material: "broodfang", weight: 1, min: 1, max: 1 }
      ],
      M: [
        { material: "phoenixFeather", weight: 1, min: 1, max: 1 }
      ]
    },
    modifiers: questModifiers(["burning"]),
    boss: { monster: "wyrmqueen", legendary: "wyrmqueenEmber" }
  },
  {
    key: "sunkenMarsh",
    levelBand: [14, 23],
    name: "Sunken Marsh",
    description: "Drowned woods where cold things slip between the reeds. Accuracy finds them; fire burns them out.",
    basePower: 6.5,
    monsterScale: 1.3,
    entryFee: 100,
    fameToUnlock: 0,
    unlockAchievement: "clear-hollowMines",
    fameForFirstClear: 0,
    travelSeconds: 0,
    mapPosition: { x: 860, y: 275 },
    encounters: buildEncounters([
      ["bogLeech", "bogLeech"],
      ["mireStalker", "bogLeech"],
      ["frostToad"],
      ["mireStalker", "marshWisp"],
      ["drownedKnight", "marshWisp"],
      ["frostToad", "bogLeech"],
      ["mireStalker", "marshWisp"],
      ["drownedKnight"],
      ["frostToad", "marshWisp"],
      ["mireStalker", "mireStalker"],
      ["drownedKnight", "marshWisp", "marshWisp"],
      ["bogHag"]
    ]),
    pools: {
      // Hollow Mines' uncommon materials are common in every tier 3 area, plus one of the area's own.
      C: [
        { material: "steelIngot", weight: 3, min: 1, max: 1 },
        { material: "trollHide", weight: 2, min: 1, max: 1 },
        { material: "garnet", weight: 2, min: 1, max: 1 },
        { material: "silverOre", weight: 2, min: 1, max: 1 },
        { material: "spiderSilk", weight: 2, min: 1, max: 1 },
        { material: "ancientBone", weight: 2, min: 1, max: 1 },
        { material: "ritualAsh", weight: 2, min: 1, max: 1 },
        { material: "amber", weight: 1, min: 1, max: 1 },
        { material: "marshReed", weight: 3, min: 1, max: 1 }
      ],
      U: [
        { material: "emerald", weight: 1, min: 1, max: 1 },
        { material: "bogIron", weight: 2, min: 1, max: 1 },
        { material: "leechSac", weight: 2, min: 1, max: 1 },
        { material: "eelskin", weight: 2, min: 1, max: 1 },
        { material: "peatmoss", weight: 2, min: 1, max: 1 },
        { material: "mithril", weight: 1, min: 1, max: 1 },
        { material: "quicksilver", weight: 2, min: 1, max: 1 },
        { material: "runedSlate", weight: 2, min: 1, max: 1 },
        { material: "wyvernLeather", weight: 2, min: 1, max: 1 }
      ],
      R: [
        { material: "tigerEye", weight: 1, min: 1, max: 1 },
        { material: "hagstone", weight: 2, min: 1, max: 1 },
        { material: "drownedSteel", weight: 2, min: 1, max: 1 },
        { material: "skyshard", weight: 1, min: 1, max: 1 },
        { material: "broodfang", weight: 1, min: 1, max: 1 }
      ],
      M: [
        { material: "blackPearl", weight: 1, min: 1, max: 1 }
      ]
    },
    modifiers: questModifiers(["frozen"]),
    boss: { monster: "mireMother", legendary: "mireheart" }
  },
  {
    key: "thunderheadCrags",
    levelBand: [14, 23],
    name: "Stormwrack Coast",
    description: "Sea cliffs and shipwrecks under a storm that never breaks. Everything here strikes fast and true. Evasion and block keep you standing; cold slows them down.",
    basePower: 6.5,
    monsterScale: 1.3,
    entryFee: 100,
    fameToUnlock: 0,
    unlockAchievement: "clear-hollowMines",
    fameForFirstClear: 0,
    travelSeconds: 0,
    mapPosition: { x: 1140, y: 140 },
    encounters: buildEncounters([
      ["sparkWisp", "sparkWisp"],
      ["cragLynx", "sparkWisp"],
      ["thunderRam"],
      ["stormHarpy", "sparkWisp"],
      ["stormcaller", "sparkWisp"],
      ["thunderRam", "cragLynx"],
      ["stormHarpy", "cragLynx"],
      ["stormcaller"],
      ["thunderRam", "sparkWisp"],
      ["stormHarpy", "stormHarpy"],
      ["stormcaller", "sparkWisp", "sparkWisp"],
      ["thunderbird"]
    ]),
    pools: {
      // Hollow Mines' uncommon materials are common in every tier 3 area, plus one of the area's own.
      C: [
        { material: "steelIngot", weight: 3, min: 1, max: 1 },
        { material: "trollHide", weight: 2, min: 1, max: 1 },
        { material: "garnet", weight: 2, min: 1, max: 1 },
        { material: "silverOre", weight: 2, min: 1, max: 1 },
        { material: "spiderSilk", weight: 2, min: 1, max: 1 },
        { material: "ancientBone", weight: 2, min: 1, max: 1 },
        { material: "ritualAsh", weight: 2, min: 1, max: 1 },
        { material: "amber", weight: 1, min: 1, max: 1 },
        { material: "thunderhorn", weight: 3, min: 1, max: 1 }
      ],
      U: [
        { material: "sapphire", weight: 1, min: 1, max: 1 },
        { material: "galeFeather", weight: 2, min: 1, max: 1 },
        { material: "stormhide", weight: 2, min: 1, max: 1 },
        { material: "cragGranite", weight: 2, min: 1, max: 1 },
        { material: "ozoneShard", weight: 2, min: 1, max: 1 },
        { material: "mithril", weight: 1, min: 1, max: 1 },
        { material: "quicksilver", weight: 2, min: 1, max: 1 },
        { material: "runedSlate", weight: 2, min: 1, max: 1 },
        { material: "wyvernLeather", weight: 2, min: 1, max: 1 }
      ],
      R: [
        { material: "opal", weight: 1, min: 1, max: 1 },
        { material: "rocPlume", weight: 2, min: 1, max: 1 },
        { material: "thunderstone", weight: 2, min: 1, max: 1 },
        { material: "skyshard", weight: 1, min: 1, max: 1 },
        { material: "broodfang", weight: 1, min: 1, max: 1 }
      ],
      M: [
        { material: "tempestQuill", weight: 1, min: 1, max: 1 }
      ]
    },
    modifiers: questModifiers(["shocking"]),
    boss: { monster: "tempestRoc", legendary: "tempestTalon" }
  },
  {
    key: "sunderedRift",
    levelBand: [22, 34],
    name: "Sundered Sanctum",
    description: "An oracle's ruined temple, raised where the storms of all three wilds meet and tear the world open. Its creatures burn, freeze and shock at once, so every resistance counts.",
    basePower: 14.5,
    monsterScale: 1.3,
    entryFee: 300,
    fameToUnlock: 0,
    unlockAchievement: ["clear-ashenPeaks", "clear-sunkenMarsh", "clear-thunderheadCrags"],
    fameForFirstClear: 0,
    travelSeconds: 0,
    mapPosition: { x: 1015, y: 410 },
    encounters: buildEncounters([
      ["riftMote", "riftMote", "riftMote"],
      ["riftHound", "riftMote"],
      ["shardGolem"],
      ["riftHound", "riftHound"],
      ["emberRevenant", "frostRevenant"],
      ["shardGolem", "riftMote"],
      ["riftHound", "riftMote", "riftMote"],
      ["stormRevenant", "frostRevenant"],
      ["emberRevenant", "stormRevenant"],
      ["shardGolem", "riftHound"],
      ["frostRevenant", "riftMote", "riftMote"],
      ["riftWarden", "riftMote"]
    ]),
    pools: {
      // Tier 3's shared materials are common here, plus the rift's own glass.
      C: [
        { material: "quicksilver", weight: 3, min: 1, max: 1 },
        { material: "runedSlate", weight: 2, min: 1, max: 1 },
        { material: "wyvernLeather", weight: 2, min: 1, max: 1 },
        { material: "mithril", weight: 1, min: 1, max: 1 },
        { material: "skyshard", weight: 1, min: 1, max: 1 },
        { material: "riftGlass", weight: 3, min: 1, max: 1 }
      ],
      U: [
        { material: "riftsteel", weight: 2, min: 1, max: 1 },
        { material: "prismShard", weight: 2, min: 1, max: 1 },
        { material: "voidSilk", weight: 2, min: 1, max: 1 },
        { material: "wardenStone", weight: 2, min: 1, max: 1 }
      ],
      R: [
        { material: "flawlessRuby", weight: 1, min: 1, max: 1 },
        { material: "flawlessSapphire", weight: 1, min: 1, max: 1 },
        { material: "flawlessEmerald", weight: 1, min: 1, max: 1 },
        { material: "riftEssence", weight: 2, min: 1, max: 1 },
        { material: "wardenPlate", weight: 2, min: 1, max: 1 }
      ],
      M: [
        { material: "prismaticEye", weight: 1, min: 1, max: 1 }
      ]
    },
    modifiers: [...questModifiers(["burning", "frozen", "shocking"]), riteModifier],
    boss: { monster: "riftTyrant", legendary: "riftheart" }
  },
  // ---- Tier 5: four areas past the Sanctum, each under one punishing rule. Each holds a key as a
  // mythic drop; all four open the way to the final area. ----
  {
    key: "amberHive",
    levelBand: [34, 44],
    name: "The Amber Hive",
    description: "A hive grown over a sunken forest, humming with things that sting. Their acid eats at armor and nerve alike, so the best answer is never to be hit at all.",
    rules: ["corrosion"],
    basePower: 32,
    monsterScale: 1.3,
    entryFee: 800,
    fameToUnlock: 0,
    unlockAchievement: "clear-sunderedRift",
    fameForFirstClear: 0,
    travelSeconds: 0,
    mapPosition: { x: 1245, y: 350 },
    encounters: buildEncounters([
      ["swarmling", "swarmling", "hiveDrone", "hiveDrone"],
      ["hiveDrone", "acidSpitter", "hiveDrone"],
      ["thornMantis", "swarmling", "swarmling"],
      ["amberBeetle", "hiveDrone"],
      ["broodGuard", "acidSpitter"],
      ["thornMantis", "thornMantis"],
      ["acidSpitter", "acidSpitter", "swarmling", "swarmling"],
      ["amberBeetle", "thornMantis"],
      ["broodGuard", "hiveDrone", "hiveDrone"],
      ["swarmling", "swarmling", "swarmling", "swarmling"],
      ["thornMantis", "acidSpitter", "hiveDrone"],
      ["hiveQueen", "swarmling", "swarmling"]
    ]),
    pools: {
      C: [
        { material: "polishedTigerEye", weight: 1, min: 1, max: 1 },
        { material: "hiveChitin", weight: 3, min: 1, max: 1 },
        { material: "waspWing", weight: 3, min: 1, max: 1 },
        { material: "hiveWax", weight: 3, min: 1, max: 1 },
        { material: "riftsteel", weight: 1, min: 1, max: 1 },
        { material: "voidSilk", weight: 1, min: 1, max: 1 }
      ],
      U: [
        { material: "mantisScythe", weight: 2, min: 1, max: 1 },
        { material: "amberResin", weight: 2, min: 1, max: 1 },
        { material: "stingerVenom", weight: 2, min: 1, max: 1 }
      ],
      R: [
        { material: "royalJelly", weight: 2, min: 1, max: 1 },
        { material: "queenCarapace", weight: 2, min: 1, max: 1 }
      ],
      // The key is a mythic: only reached by rarity upgrades from quest modifiers.
      M: [
        { material: "amberKey", weight: 1, min: 1, max: 1 },
        { material: "hiveheart", weight: 1, min: 1, max: 1 }
      ]
    },
    modifiers: questModifiers(),
    boss: { monster: "amberEmpress", legendary: "empressStinger" }
  },
  {
    key: "duskgraveNecropolis",
    levelBand: [34, 44],
    name: "Duskgrave Necropolis",
    description: "A city of the dead under a sky that never brightens. Nothing heals here and ward fades for good, so a hero walks in with all the life they will get.",
    rules: ["noRecovery"],
    basePower: 32,
    monsterScale: 1.3,
    entryFee: 800,
    fameToUnlock: 0,
    unlockAchievement: "clear-sunderedRift",
    fameForFirstClear: 0,
    travelSeconds: 0,
    mapPosition: { x: 1e3, y: 605 },
    encounters: buildEncounters([
      ["boneThrall", "boneThrall", "cryptGhoul"],
      ["wailingShade", "boneThrall"],
      ["cryptGhoul", "cryptGhoul"],
      ["barrowKnight"],
      ["plagueBearer", "wailingShade"],
      ["boneThrall", "boneThrall", "boneThrall"],
      ["lichAcolyte", "cryptGhoul"],
      ["barrowKnight", "wailingShade"],
      ["plagueBearer", "lichAcolyte"],
      ["cryptGhoul", "wailingShade", "boneThrall"],
      ["barrowKnight", "boneThrall"],
      ["paleLich", "wailingShade"]
    ]),
    pools: {
      C: [
        { material: "polishedOpal", weight: 1, min: 1, max: 1 },
        { material: "graveIron", weight: 3, min: 1, max: 1 },
        { material: "shroudCloth", weight: 3, min: 1, max: 1 },
        { material: "boneMarrow", weight: 3, min: 1, max: 1 },
        { material: "wardenStone", weight: 1, min: 1, max: 1 },
        { material: "riftsteel", weight: 1, min: 1, max: 1 }
      ],
      U: [
        { material: "wraithEssence", weight: 2, min: 1, max: 1 },
        { material: "barrowSteel", weight: 2, min: 1, max: 1 },
        { material: "deathcap", weight: 2, min: 1, max: 1 }
      ],
      R: [
        { material: "radiantEmerald", weight: 1, min: 1, max: 1 },
        { material: "soulGem", weight: 2, min: 1, max: 1 },
        { material: "cryptPlate", weight: 2, min: 1, max: 1 }
      ],
      M: [
        { material: "graveKey", weight: 1, min: 1, max: 1 },
        { material: "paleCrown", weight: 1, min: 1, max: 1 }
      ]
    },
    modifiers: questModifiers(),
    boss: { monster: "duskRegent", legendary: "regentPhylactery" }
  },
  {
    key: "ironboundFoundry",
    levelBand: [34, 44],
    name: "Ironbound Foundry",
    description: "A foundry that never stopped working after its makers left. Its brass constructs throw every blow back at the striker, so measured hits and a tough hide win.",
    rules: ["reflect"],
    basePower: 32,
    monsterScale: 1.3,
    entryFee: 800,
    fameToUnlock: 0,
    unlockAchievement: "clear-sunderedRift",
    fameForFirstClear: 0,
    travelSeconds: 0,
    mapPosition: { x: 1245, y: 520 },
    encounters: buildEncounters([
      ["cogSpider", "cogSpider", "brassSentry"],
      ["steamHound", "cogSpider"],
      ["brassSentry", "brassSentry"],
      ["smelterGolem"],
      ["clockworkKnight", "cogSpider"],
      ["steamHound", "steamHound"],
      ["forgeWarden", "brassSentry"],
      ["smelterGolem", "cogSpider"],
      ["clockworkKnight", "forgeWarden"],
      ["steamHound", "cogSpider", "cogSpider"],
      ["smelterGolem", "brassSentry"],
      ["forgeTitan", "cogSpider"]
    ]),
    pools: {
      C: [
        { material: "polishedSunstone", weight: 1, min: 1, max: 1 },
        { material: "brassPlate", weight: 3, min: 1, max: 1 },
        { material: "cogwheel", weight: 3, min: 1, max: 1 },
        { material: "coolingOil", weight: 3, min: 1, max: 1 },
        { material: "riftsteel", weight: 1, min: 1, max: 1 },
        { material: "riftGlass", weight: 1, min: 1, max: 1 }
      ],
      U: [
        { material: "temperedSteel", weight: 2, min: 1, max: 1 },
        { material: "mainspring", weight: 2, min: 1, max: 1 },
        { material: "slagGlass", weight: 2, min: 1, max: 1 }
      ],
      R: [
        { material: "radiantRuby", weight: 1, min: 1, max: 1 },
        { material: "titanAlloy", weight: 2, min: 1, max: 1 },
        { material: "furnaceCore", weight: 2, min: 1, max: 1 }
      ],
      M: [
        { material: "cogKey", weight: 1, min: 1, max: 1 },
        { material: "forgeheart", weight: 1, min: 1, max: 1 }
      ]
    },
    modifiers: questModifiers(),
    boss: { monster: "ironOverseer", legendary: "overseerSeal" }
  },
  {
    key: "skyspireAerie",
    levelBand: [34, 44],
    name: "Skyspire Aerie",
    description: "A spire above the clouds where the storm gods keep watch. Every blow struck there is judged, so the fewest, heaviest blows win.",
    rules: ["karma"],
    basePower: 32,
    monsterScale: 1.3,
    entryFee: 800,
    fameToUnlock: 0,
    unlockAchievement: "clear-sunderedRift",
    fameForFirstClear: 0,
    travelSeconds: 0,
    mapPosition: { x: 750, y: 560 },
    encounters: buildEncounters([
      ["galeKestrel", "galeKestrel", "skyHarpy"],
      ["stormHawk", "galeKestrel"],
      ["skyHarpy", "skyHarpy"],
      ["cloudSerpent"],
      ["thunderEagle", "galeKestrel"],
      ["stormHawk", "stormHawk"],
      ["windWarden", "skyHarpy"],
      ["cloudSerpent", "stormHawk"],
      ["thunderEagle", "windWarden"],
      ["galeKestrel", "galeKestrel", "galeKestrel"],
      ["cloudSerpent", "skyHarpy"],
      ["skySovereign", "galeKestrel"]
    ]),
    pools: {
      C: [
        { material: "stormIron", weight: 3, min: 1, max: 1 },
        { material: "skyFeather", weight: 3, min: 1, max: 1 },
        { material: "galeSilk", weight: 3, min: 1, max: 1 },
        { material: "voidSilk", weight: 1, min: 1, max: 1 },
        { material: "riftGlass", weight: 1, min: 1, max: 1 }
      ],
      U: [
        { material: "eagleTalon", weight: 2, min: 1, max: 1 },
        { material: "thunderGlass", weight: 2, min: 1, max: 1 },
        { material: "windCrystal", weight: 2, min: 1, max: 1 }
      ],
      R: [
        { material: "radiantSapphire", weight: 1, min: 1, max: 1 },
        { material: "sovereignPlume", weight: 2, min: 1, max: 1 },
        { material: "skyforged", weight: 2, min: 1, max: 1 }
      ],
      M: [
        { material: "galeKey", weight: 1, min: 1, max: 1 },
        { material: "stormcrown", weight: 1, min: 1, max: 1 }
      ]
    },
    modifiers: questModifiers(),
    boss: { monster: "stormHerald", legendary: "heraldBolt" }
  },
  // ---- Tier 6: past the portal the Oracle's Rite opens. Open only while the portal is. ----
  {
    key: "shatteredThrone",
    levelBand: [44, 56],
    name: "The Shattered Throne",
    description: "A throne room adrift in a pocket of the rift, reached only through the Sanctum's portal. Every kind of foe the wilds hold waits here, stronger than anywhere else.",
    portal: true,
    basePower: 70,
    monsterScale: 1.3,
    entryFee: 2e3,
    fameToUnlock: 0,
    fameForFirstClear: 0,
    travelSeconds: 0,
    mapPosition: { x: 1155, y: 685 },
    encounters: buildEncounters([
      ["riftStalker", "starfallMote", "starfallMote"],
      ["voidWraith", "riftStalker"],
      ["throneSentinel", "starfallMote"],
      ["shatteredKnight", "voidWraith"],
      ["emberColossus", "riftStalker"],
      ["starfallMote", "starfallMote", "starfallMote", "riftStalker"],
      ["throneSentinel", "shatteredKnight"],
      ["voidWraith", "voidWraith", "starfallMote"],
      ["emberColossus", "shatteredKnight"],
      ["riftStalker", "riftStalker", "voidWraith"],
      ["throneSentinel", "emberColossus"],
      ["shatteredKing", "shatteredKnight"]
    ]),
    pools: {
      C: [
        { material: "throneStone", weight: 3, min: 1, max: 1 },
        { material: "voidIron", weight: 3, min: 1, max: 1 },
        { material: "starSilk", weight: 3, min: 1, max: 1 }
      ],
      U: [
        { material: "brilliantTigerEye", weight: 1, min: 1, max: 1 },
        { material: "brilliantSunstone", weight: 1, min: 1, max: 1 },
        { material: "brilliantOpal", weight: 1, min: 1, max: 1 },
        { material: "shatterglass", weight: 2, min: 1, max: 1 },
        { material: "kingsSteel", weight: 2, min: 1, max: 1 },
        { material: "emberOfAges", weight: 2, min: 1, max: 1 }
      ],
      R: [
        { material: "crownShard", weight: 2, min: 1, max: 1 },
        { material: "riftmetal", weight: 2, min: 1, max: 1 }
      ],
      M: [
        { material: "throneheart", weight: 1, min: 1, max: 1 }
      ]
    },
    modifiers: questModifiers(["burning", "frozen", "shocking"]),
    boss: { monster: "pretender", legendary: "borrowedCrown" }
  }
];
const questOrder = questList.map((q) => q.key);
function unlockKeys(quest) {
  const u = quest.unlockAchievement;
  return !u ? [] : Array.isArray(u) ? u : [u];
}
function unlockMet(achievements, quest) {
  const keys = unlockKeys(quest);
  return !keys.length || keys.some((k) => achievements.includes(k));
}
function unlockQuestNames(quest) {
  const names = unlockKeys(quest).map((k) => {
    var _a2;
    return ((_a2 = questList.find((q) => "clear-" + q.key === k)) == null ? void 0 : _a2.name) ?? "an earlier quest";
  });
  return names.length > 1 ? names.slice(0, -1).join(", ") + " or " + names[names.length - 1] : names[0] ?? "";
}
const tierPowers = [...new Set(questList.map((q) => q.basePower))].sort((a, b) => a - b);
function questTier(questKey) {
  const quest = questList.find((q) => q.key === questKey);
  return quest ? tierPowers.indexOf(quest.basePower) : 0;
}
const ENDLESS_PATTERN = ["C", "C", "C", "U", "C", "C", "U", "C", "C", "R"];
const ENDLESS_FEES = [100, 500, 1e3, 5e3, 1e4, 5e4];
const ENDLESS_GROWTH = 0.05;
const ENDLESS_STEP = 1.1;
const ENDLESS_LENGTH = 500;
const endlessTierMultiplier = { C: 1, U: 1.6, R: 2.4 };
function endlessKey(questKey) {
  return questKey + ":endless";
}
function makeEndless(base) {
  const byTier = { C: [], U: [], R: [] };
  for (const e of base.encounters) {
    byTier[e.tier].push(e.monsters);
  }
  const used = { C: 0, U: 0, R: 0 };
  const encounters = Array.from({ length: ENDLESS_LENGTH }, (_, i) => {
    const tier = ENDLESS_PATTERN[i % ENDLESS_PATTERN.length];
    const groups = byTier[tier].length ? byTier[tier] : byTier.C;
    return { tier, monsters: groups[used[tier]++ % groups.length] };
  });
  return {
    ...base,
    key: endlessKey(base.key),
    name: `${base.name}: Endless`,
    description: `How deep can an adventurer get? ${base.name}'s monsters, growing stronger every encounter, with no rewards.`,
    basePower: base.basePower,
    monsterScale: base.monsterScale,
    growth: ENDLESS_GROWTH,
    stepMultiplier: { every: ENDLESS_PATTERN.length, factor: ENDLESS_STEP },
    tierMultiplier: endlessTierMultiplier,
    entryFee: ENDLESS_FEES[Math.min(questTier(base.key), ENDLESS_FEES.length - 1)],
    fameForFirstClear: 0,
    encounters,
    pools: { C: [], U: [], R: [], M: [] },
    modifiers: [],
    boss: void 0,
    // Endless gives nothing, so it stays open when the area's portal is closed.
    portal: void 0,
    endless: { baseKey: base.key }
  };
}
const quests = Object.fromEntries([...questList, ...questList.map(makeEndless)].map((q) => [q.key, q]));
function basePowerAt(quest, index) {
  const step = quest.stepMultiplier ? Math.pow(quest.stepMultiplier.factor, Math.floor(index / quest.stepMultiplier.every)) : 1;
  return quest.basePower * (1 + (quest.growth ?? growthPerEncounter) * index) * step;
}
function encounterPower(quest, index) {
  const tier = quest.encounters[index].tier;
  return basePowerAt(quest, index) * (quest.tierMultiplier ?? tierMultiplier)[tier];
}
function questPowerRange(quest) {
  const base = quest.endless ? quests[quest.endless.baseKey] : quest;
  const powers = base.encounters.map((_, i) => encounterPower(base, i));
  return { min: Math.min(...powers), max: Math.max(...powers) };
}
function encounterLevel(quest, index) {
  const [lo, hi] = quest.levelBand ?? [3, 10];
  const { min, max } = questPowerRange(quest);
  const t = max > min ? Math.log(encounterPower(quest, index) / min) / Math.log(max / min) : 1;
  return Math.max(1, Math.round(lo + (hi - lo) * t));
}
function powerForLevel(level) {
  const anchors = [[1, 1], ...questList.map((q) => {
    var _a2;
    return [((_a2 = q.levelBand) == null ? void 0 : _a2[1]) ?? 10, questPowerRange(q).max];
  })].sort((a, b) => a[0] - b[0]).filter((a, i2, all) => i2 === 0 || a[0] > all[i2 - 1][0]);
  let i = 1;
  while (i < anchors.length - 1 && level > anchors[i][0]) i++;
  const [l0, p0] = anchors[i - 1], [l1, p1] = anchors[i];
  return Math.exp(Math.log(p0) + (Math.log(p1) - Math.log(p0)) * (level - l0) / (l1 - l0));
}
function questXpLevel(quest) {
  return Math.max(...quest.encounters.map((_, i) => encounterLevel(quest, i)));
}
const XP_FALLOFF_PER_LEVEL = 0.2;
function xpMultiplier(heroLevel, encounterLvl) {
  return Math.max(0, 1 - XP_FALLOFF_PER_LEVEL * Math.max(0, heroLevel - encounterLvl));
}
const EVASION_GROWTH = 0.7;
const ACCURACY_GROWTH = 0.5;
const monsterBaseline = { hp: 24, damage: 3, armor: 1, accuracy: 8, evasion: 24 };
const PORTAL_KEYS = ["amberKey", "graveKey", "cogKey", "galeKey"];
function questHiddenOnMap(state2, key) {
  const quest = quests[key];
  if (!quest) return false;
  const p = state2.questProgress.sunderedRift;
  const sanctumCleared = state2.achievements.includes("clear-sunderedRift") || ((p == null ? void 0 : p.fullClears) ?? 0) > 0 || ((p == null ? void 0 : p.bestModifiedClear) ?? -1) >= 0;
  const keyFound = !!state2.portal || PORTAL_KEYS.some((k) => (state2.materials[k] ?? 0) > 0);
  return questTier(key) >= 4 && !sanctumCleared || !!quest.portal && !keyFound;
}
const passives = {
  fury: {
    key: "fury",
    name: "Fury",
    description: "+1 physical damage for every 5 missing life.",
    enhanced: "+1 physical damage for every 3 missing life."
  },
  followThrough: {
    key: "followThrough",
    name: "Follow-through",
    description: "When a chain of hits kills its target, the remaining hits carry on to the next monster.",
    enhanced: "When a chain of hits kills its target, the remaining hits carry on to the next monster with +50% damage."
  },
  siphonWard: {
    key: "siphonWard",
    name: "Siphon ward",
    description: "1.5x max ward. Each hit you take restores 5% of max ward afterward.",
    enhanced: "1.75x max ward. Each hit you take restores 7.5% of max ward afterward."
  },
  cleave: {
    key: "cleave",
    name: "Cleave",
    description: "Each hit also deals 30% of its damage to every other monster.",
    enhanced: "Each hit also deals 50% of its damage to every other monster."
  },
  riposte: {
    key: "riposte",
    name: "Riposte",
    description: "+50% crit chance for each attack you dodged in the last 2 seconds. Crit chance past 100% can crit more than once.",
    enhanced: "+50% crit chance for each attack you dodged in the last 3 seconds. Crit chance past 100% can crit more than once."
  },
  spellward: {
    key: "spellward",
    name: "Spellward",
    description: "Healing past full HP becomes ward, up to twice max ward. Ward returns to max at the next encounter.",
    enhanced: "Healing past full HP becomes ward, up to three times max ward. Ward returns to max at the next encounter."
  },
  martialArts: {
    key: "martialArts",
    name: "Martial arts",
    description: "With nothing in either hand (no weapon or shield), attacks add your full core attribute as damage instead of half, attack 1.5 times a second, and gain +15% crit chance, +50% crit multiplier and 15% block chance.",
    enhanced: "With nothing in either hand (no weapon or shield), attacks add your full core attribute as damage instead of half, attack 1.5 times a second, and gain +30% crit chance, +100% crit multiplier and 15% block chance."
  },
  dualMastery: {
    key: "dualMastery",
    name: "Dual mastery",
    description: "Dual wielding swings at the full doubled speed instead of 75% of it, and deals 25% more damage.",
    enhanced: "Dual wielding swings at the full doubled speed instead of 75% of it, and deals 50% more damage."
  },
  elementalMastery: {
    key: "elementalMastery",
    name: "Elemental mastery",
    description: "Doubles fire, cold and lightning damage.",
    enhanced: "Triples fire, cold and lightning damage."
  },
  counterstrike: {
    key: "counterstrike",
    name: "Counterstrike",
    description: "Each blocked hit earns a free attack at 50% damage.",
    enhanced: "Each blocked hit earns a free attack at full damage."
  },
  exploit: {
    key: "exploit",
    name: "Exploit",
    description: "Hits deal +20% damage for each different ailment on the target, up to +60%. Your burns last twice as long, and your chill and shock can build to 75% instead of 50%.",
    enhanced: "Hits deal +35% damage for each different ailment on the target, up to +105%. Your burns last twice as long, and your chill and shock can build to 75% instead of 50%."
  },
  bloodPact: {
    key: "bloodPact",
    name: "Blood pact",
    description: "You have 5% life leech. Each attack costs 2% of current HP. Life leech heals over 1 second instead of at once, and you deal 2% more damage for each 1 HP regenerated per second, leech included.",
    enhanced: "You have 5% life leech. Each attack costs 2% of current HP. Life leech heals over 1 second instead of at once, and you deal 3% more damage for each 1 HP regenerated per second, leech included."
  },
  rampage: {
    key: "rampage",
    name: "Rampage",
    description: "+1% damage and attack speed for every 10 damage taken in the last 4 seconds.",
    enhanced: "+1% damage and attack speed for every 10 damage taken in the last 6 seconds."
  },
  deadeye: {
    key: "deadeye",
    name: "Deadeye",
    description: "All the hits of an attack land as one combined hit. Each hit still rolls its own crit, and if any hit rolls an ailment, the combined hit inflicts it.",
    enhanced: "Every attack lands one extra hit, so it never misses entirely. All the hits land as one combined hit; each still rolls its own crit, and if any hit rolls an ailment, the combined hit inflicts it."
  },
  hex: {
    key: "hex",
    name: "Hex",
    description: "Monsters deal 4% less damage and take 4% more for each second of ailments left on them, adding burn, chill and shock. They deal at most 80% less.",
    enhanced: "Monsters deal 6% less damage and take 6% more for each second of ailments left on them, adding burn, chill and shock. They deal at most 80% less."
  }
};
function passiveLevel(hero, key, classPassive2) {
  const own = hero.passives ?? (classPassive2(hero.classKey) ? [{ key: classPassive2(hero.classKey) }] : []);
  const found = own.find((p) => p.key === key);
  return found ? found.enhanced ? 2 : 1 : 0;
}
const BONUS_STEP = 0.1;
const BONUS_SLOT_CHANCE = 0.5;
const bonusDefs = {
  str: { label: "Str", weight: 1 },
  dex: { label: "Dex", weight: 1 },
  int: { label: "Int", weight: 1 },
  maxHealth: { label: "max HP", weight: 1 },
  armor: { label: "armor", weight: 1 },
  evasion: { label: "evasion", weight: 1 },
  ward: { label: "max ward", weight: 1 },
  // The strongest per 10%, so they come up half as often.
  attackSpeed: { label: "attack speed", weight: 0.5 },
  damage: { label: "damage", weight: 0.5 },
  critChance: { label: "crit chance", weight: 1 },
  accuracy: { label: "accuracy", weight: 1 },
  // Life leech matters to few classes, so new applicants don't roll it. Heroes who already have it keep it.
  lifeRegen: { label: "life regen", weight: 1 },
  lifeLeech: { label: "life leech", weight: 0 }
};
const bonusOrder = Object.keys(bonusDefs);
function bonusMultiplier(hero, key) {
  var _a2;
  return 1 + BONUS_STEP * (((_a2 = hero.bonuses) == null ? void 0 : _a2[key]) ?? 0);
}
function bonusText$1(bonuses) {
  return bonusOrder.filter((k) => bonuses == null ? void 0 : bonuses[k]).map((k) => `×${(1 + BONUS_STEP * bonuses[k]).toFixed(1)} ${bonusDefs[k].label}`);
}
function rollBonuses(slots, rng) {
  const out = {};
  const total = bonusOrder.reduce((sum, k) => sum + bonusDefs[k].weight, 0);
  for (let i = 0; i < slots; i++) {
    if (rng() >= BONUS_SLOT_CHANCE) continue;
    let r = rng() * total;
    const key = bonusOrder.find((k) => (r -= bonusDefs[k].weight) < 0) ?? bonusOrder[0];
    out[key] = (out[key] ?? 0) + 1;
  }
  return out;
}
const BASICS = {
  scratch: { name: "Scratch", effect: "scratch" },
  bite: { name: "Bite", effect: "bite" },
  slash: { name: "Slash", effect: "slash" },
  stab: { name: "Stab", effect: "stab", accuracy: 1.15, damage: 0.9 },
  smash: { name: "Smash", effect: "thump", accuracy: 0.85, damage: 1.15 },
  lash: { name: "Lash", effect: "lash" },
  sting: { name: "Sting", effect: "sting" },
  talon: { name: "Talon", effect: "talon" },
  slam: { name: "Slam", effect: "slam", accuracy: 0.9, damage: 1.1 },
  throw: { name: "Throw", effect: "throw", accuracy: 0.75, damage: 1.3 },
  touch: { name: "Touch", effect: "element" },
  bolt: { name: "Bolt", effect: "element" }
};
const KIT_DAMAGE = 0.8;
const cache$1 = /* @__PURE__ */ new Map();
const DEFAULT_SPELLS = {
  fire: { name: "Fire Burst", effect: "fire" },
  cold: { name: "Frost Shard", effect: "ice" },
  lightning: { name: "Lightning Bolt", effect: "lightning" }
};
function defaultAbilities(types) {
  const entries = Object.entries(types).filter(([, v]) => v > 0);
  if (entries.length < 2) return [];
  const keep = entries.some(([t]) => t === "physical") ? "physical" : entries[0][0];
  const spells = entries.filter(([t]) => t !== keep).map(([t, v]) => ({ t, v, every: Math.max(2, Math.round(1 / v)) }));
  while (spells.reduce((sum, a) => sum + 1 / a.every, 0) > 0.8) for (const a of spells) a.every++;
  return spells.map((a) => ({ name: DEFAULT_SPELLS[a.t].name, types: [a.t], every: a.every, spell: true, effect: DEFAULT_SPELLS[a.t].effect }));
}
const ELEMENT_FX = { physical: "smash", fire: "fire", cold: "ice", lightning: "lightning" };
function basicEntries(def, shares) {
  var _a2, _b2;
  const refs = ((_a2 = def.basics) == null ? void 0 : _a2.length) ? def.basics : ["smash"];
  const main = ((_b2 = Object.entries(shares).sort((a, b) => b[1] - a[1])[0]) == null ? void 0 : _b2[0]) ?? "physical";
  return refs.map((ref) => {
    const [key, rename] = typeof ref === "string" ? [ref, void 0] : ref;
    const b = BASICS[key];
    const element = b.effect === "element";
    return {
      name: rename ?? b.name,
      shares,
      every: 1,
      spell: element,
      basic: true,
      effect: element ? ELEMENT_FX[main] : b.effect,
      effectScale: element ? 0.6 : void 0,
      accuracy: b.accuracy,
      damage: b.damage
    };
  });
}
function monsterKit(key) {
  if (cache$1.has(key)) return cache$1.get(key);
  const def = monsters[key];
  if (!def) return null;
  const types = def.damageTypes ?? { physical: 1 };
  const abilities = def.abilities ?? defaultAbilities(types);
  const split = abilities.some((a) => {
    var _a2;
    return (_a2 = a.types) == null ? void 0 : _a2.length;
  }) && Object.values(types).filter((v) => (v ?? 0) > 0).length > 1;
  const scale = split ? KIT_DAMAGE : 1;
  const covered = /* @__PURE__ */ new Set();
  const kit = abilities.map((a) => {
    const shares = {};
    for (const t of a.types ?? []) {
      shares[t] = (types[t] ?? 0) * a.every * scale;
      covered.add(t);
    }
    return {
      name: a.name,
      shares,
      every: a.every,
      spell: !!a.spell,
      basic: false,
      applies: a.applies,
      effect: a.effect,
      accuracy: a.accuracy,
      damage: a.damage,
      hits: a.hits,
      drain: a.drain,
      heal: a.heal,
      rally: a.rally,
      buff: a.buff,
      mimic: a.mimic
    };
  });
  const basicLike = (a) => {
    var _a2;
    return !((_a2 = a.types) == null ? void 0 : _a2.length) && a.damage !== void 0;
  };
  const left = Math.max(0.1, 1 - abilities.reduce((sum, a) => sum + (basicLike(a) ? 0 : 1 / a.every), 0));
  const basicShares = {};
  for (const [t, v] of Object.entries(types)) if (!covered.has(t)) basicShares[t] = v / left * scale;
  abilities.forEach((a, i) => {
    if (basicLike(a)) kit[i].shares = { ...basicShares };
  });
  kit.push(...basicEntries(def, basicShares));
  cache$1.set(key, kit);
  return kit;
}
function nextAbility(kit, ready, basicTurn = 0) {
  const r = ready && ready.length === kit.length ? ready : kit.map((_, i) => i + 2);
  const next = r.map((v) => v - 1);
  let index = kit.findIndex((a, i) => !a.basic && next[i] <= 0);
  if (index >= 0) {
    next[index] = kit[index].every;
    return { index, ready: next, basicTurn };
  }
  const first = kit.findIndex((a) => a.basic);
  const count = kit.length - first;
  index = first + basicTurn % count;
  return { index, ready: next, basicTurn: (basicTurn + 1) % count };
}
function kitHit(entry) {
  return Object.values(entry.shares).reduce((a, b) => a + (b ?? 0), 0);
}
const tierNames$2 = ["Bronze", "Silver", "Gold", "Platinum"];
const pct$1 = (v) => `${Math.round(v * 100)}%`;
const fmtPct = (v) => `${Math.round(v * 1e3) / 10}%`;
function questClearTrophy(questKey, name, fame, kind, amounts) {
  const quest = quests[questKey];
  return {
    key: "clear-" + questKey,
    name,
    goal: (t) => t === 0 ? `Fully clear ${quest.name}` : `Fully clear ${quest.name} with ${t} modifier${t > 1 ? "s" : ""} active`,
    tiers: [0, 1, 2].map((target, i) => ({ target, fame: fame[i], bonus: { [kind]: amounts[i] } })),
    // -1 = never cleared; otherwise the most modifiers on a full clear.
    value: (s) => {
      const p = s.questProgress[questKey];
      return Math.max((p == null ? void 0 : p.bestModifiedClear) ?? -1, ((p == null ? void 0 : p.fullClears) ?? 0) > 0 ? 0 : -1);
    },
    relevant: (s) => s.fame >= quest.fameToUnlock && unlockMet(s.achievements, quest) && !questHiddenOnMap(s, questKey),
    bonusText: (b) => kind === "gold" ? `+${pct$1(b.gold ?? 0)} gold from quests` : `+${pct$1(b.xp ?? 0)} XP from quests`
  };
}
function endlessTrophy(questKey, name, fame, bonus, text) {
  const quest = quests[questKey];
  return {
    key: "endless-" + questKey,
    name,
    goal: (t) => `Reach encounter ${t} in ${quest.name}: Endless`,
    tiers: [20, 50, 100].map((target, i) => ({ target, fame: fame[i], bonus: bonus(i) })),
    value: (s) => {
      var _a2;
      return (((_a2 = s.questProgress[endlessKey(questKey)]) == null ? void 0 : _a2.bestEncounter) ?? -1) + 1;
    },
    relevant: (s) => s.achievements.includes("clear-" + questKey),
    bonusText: text
  };
}
const coreAmounts = [2, 6, 12, 20];
const CLASS_FAME = [5, 15, 30, 50];
const targetsFor = (tier) => tier >= 3 ? [30, 45, 60, 75] : [5, 25, 50, 75];
function classTrophy(classKey, name, bonus) {
  const cls = classes[classKey];
  const stat = cls.coreStat.toUpperCase();
  const bonusFor = (i) => !bonus ? { stats: { [cls.coreStat]: coreAmounts[i] } } : "xp" in bonus ? { xp: bonus.xp[i] } : { stats: bonus.stats(i) };
  return {
    key: "class-" + classKey,
    name,
    goal: (t) => `Raise a ${cls.name} to level ${t}`,
    tiers: targetsFor(cls.tier).map((target, i) => ({ target, fame: CLASS_FAME[i], bonus: bonusFor(i) })),
    value: (s) => Math.max(0, ...s.adventurers.filter((a) => a.classKey === classKey).map((a) => a.level)),
    relevant: (s) => s.adventurers.some((a) => a.classKey === classKey),
    bonusText: (b) => {
      var _a2;
      return !bonus ? `+${((_a2 = b.stats) == null ? void 0 : _a2[cls.coreStat]) ?? 0} ${stat} for everyone` : "xp" in bonus ? `+${pct$1(b.xp ?? 0)} XP from quests` : bonus.text(b);
    }
  };
}
function statBonus(key, amounts, text) {
  return { stats: (i) => ({ [key]: amounts[i] }), text: (b) => {
    var _a2;
    return `${text(((_a2 = b.stats) == null ? void 0 : _a2[key]) ?? 0)} for everyone`;
  } };
}
const trophyList = [
  questClearTrophy("brambleRoad", "Bramble Road Waystone", [10, 10, 15], "gold", [0.1, 0.2, 0.3]),
  questClearTrophy("hollowMines", "Hollow Mines Lantern", [25, 20, 30], "xp", [0.1, 0.2, 0.3]),
  questClearTrophy("ashenPeaks", "Wyrmfire Brazier", [40, 30, 45], "gold", [0.15, 0.3, 0.45]),
  questClearTrophy("sunkenMarsh", "Mire Lantern", [40, 30, 45], "xp", [0.15, 0.3, 0.45]),
  questClearTrophy("thunderheadCrags", "Stormglass Bell", [40, 30, 45], "gold", [0.15, 0.3, 0.45]),
  questClearTrophy("sunderedRift", "Riftstone Lens", [70, 50, 70], "xp", [0.2, 0.4, 0.6]),
  questClearTrophy("amberHive", "Amber Reliquary", [100, 70, 100], "gold", [0.25, 0.5, 0.75]),
  questClearTrophy("duskgraveNecropolis", "Funeral Bell", [100, 70, 100], "xp", [0.25, 0.5, 0.75]),
  questClearTrophy("ironboundFoundry", "Brass Orrery", [100, 70, 100], "gold", [0.25, 0.5, 0.75]),
  questClearTrophy("skyspireAerie", "Stormwatch Lantern", [100, 70, 100], "xp", [0.25, 0.5, 0.75]),
  questClearTrophy("shatteredThrone", "Shattered Sceptre", [200, 120, 160], "gold", [0.4, 0.8, 1.2]),
  endlessTrophy(
    "brambleRoad",
    "Thornheart",
    [10, 20, 30],
    (i) => ({ stats: { increasedMaxHealth: [0.05, 0.1, 0.15][i] } }),
    (b) => {
      var _a2;
      return `+${pct$1(((_a2 = b.stats) == null ? void 0 : _a2.increasedMaxHealth) ?? 0)} max HP for everyone`;
    }
  ),
  endlessTrophy(
    "hollowMines",
    "Deepforge Ember",
    [15, 25, 40],
    (i) => ({ stats: { increasedDamage: [0.05, 0.1, 0.15][i] } }),
    (b) => {
      var _a2;
      return `+${pct$1(((_a2 = b.stats) == null ? void 0 : _a2.increasedDamage) ?? 0)} damage for everyone`;
    }
  ),
  endlessTrophy(
    "ashenPeaks",
    "Ashen Crown",
    [20, 35, 55],
    (i) => ({ stats: { attackSpeed: [0.04, 0.08, 0.12][i] } }),
    (b) => {
      var _a2;
      return `+${pct$1(((_a2 = b.stats) == null ? void 0 : _a2.attackSpeed) ?? 0)} attack speed for everyone`;
    }
  ),
  endlessTrophy(
    "sunkenMarsh",
    "Drowned Crown",
    [20, 35, 55],
    (i) => ({ stats: { critChance: [0.02, 0.04, 0.06][i] } }),
    (b) => {
      var _a2;
      return `+${pct$1(((_a2 = b.stats) == null ? void 0 : _a2.critChance) ?? 0)} crit chance for everyone`;
    }
  ),
  endlessTrophy(
    "thunderheadCrags",
    "Thunder Diadem",
    [20, 35, 55],
    (i) => ({ stats: { increasedEvasion: [0.05, 0.1, 0.15][i] } }),
    (b) => {
      var _a2;
      return `+${pct$1(((_a2 = b.stats) == null ? void 0 : _a2.increasedEvasion) ?? 0)} evasion for everyone`;
    }
  ),
  endlessTrophy(
    "sunderedRift",
    "Prism Crown",
    [25, 45, 70],
    (i) => ({ stats: { increasedElementalDamage: [0.08, 0.16, 0.24][i] } }),
    (b) => {
      var _a2;
      return `+${pct$1(((_a2 = b.stats) == null ? void 0 : _a2.increasedElementalDamage) ?? 0)} elemental damage for everyone`;
    }
  ),
  endlessTrophy(
    "amberHive",
    "Swarm Crown",
    [25, 45, 70],
    (i) => ({ stats: { blockChance: [0.02, 0.04, 0.06][i] } }),
    (b) => {
      var _a2;
      return `+${pct$1(((_a2 = b.stats) == null ? void 0 : _a2.blockChance) ?? 0)} block chance for everyone`;
    }
  ),
  endlessTrophy(
    "duskgraveNecropolis",
    "Grave Crown",
    [25, 45, 70],
    (i) => ({ stats: { increasedMaxHealth: [0.05, 0.1, 0.15][i] } }),
    (b) => {
      var _a2;
      return `+${pct$1(((_a2 = b.stats) == null ? void 0 : _a2.increasedMaxHealth) ?? 0)} max HP for everyone`;
    }
  ),
  endlessTrophy(
    "ironboundFoundry",
    "Iron Crown",
    [25, 45, 70],
    (i) => ({ stats: { increasedArmor: [0.08, 0.16, 0.24][i] } }),
    (b) => {
      var _a2;
      return `+${pct$1(((_a2 = b.stats) == null ? void 0 : _a2.increasedArmor) ?? 0)} armor for everyone`;
    }
  ),
  endlessTrophy(
    "skyspireAerie",
    "Gale Crown",
    [25, 45, 70],
    (i) => ({ stats: { critMultiplier: [0.1, 0.2, 0.3][i] } }),
    (b) => {
      var _a2;
      return `+${pct$1(((_a2 = b.stats) == null ? void 0 : _a2.critMultiplier) ?? 0)} crit multiplier for everyone`;
    }
  ),
  endlessTrophy(
    "shatteredThrone",
    "Crown of Ages",
    [40, 70, 100],
    (i) => ({ stats: { increasedDamage: [0.05, 0.1, 0.15][i], increasedMaxHealth: [0.05, 0.1, 0.15][i] } }),
    (b) => {
      var _a2, _b2;
      return `+${pct$1(((_a2 = b.stats) == null ? void 0 : _a2.increasedDamage) ?? 0)} damage and +${pct$1(((_b2 = b.stats) == null ? void 0 : _b2.increasedMaxHealth) ?? 0)} max HP for everyone`;
    }
  ),
  classTrophy("warrior", "Warlord's Banner"),
  classTrophy("ranger", "Pathfinder's Quiver"),
  classTrophy("priest", "Oracle's Censer"),
  classTrophy("reaver", "Reaver's Cleaver", statBonus("increasedPhysicalDamage", [0.03, 0.06, 0.09, 0.12], (v) => `+${pct$1(v)} physical damage`)),
  classTrophy("spellblade", "Spellblade's Sigil", statBonus("wardOnDodgePercent", [5e-3, 0.01, 0.015, 0.02], (v) => `${fmtPct(v)} of max ward on dodge`)),
  classTrophy("battlemage", "Battlemage's Aegis", statBonus("hpLostAsWard", [0.02, 0.04, 0.06, 0.08], (v) => `${pct$1(v)} of life lost gained as ward`)),
  classTrophy("monk", "Monk's Prayer Beads", statBonus("lifeOnHit", [1, 2, 3, 4], (v) => `+${v} life on hit`)),
  classTrophy("ninja", "Ninja's Shuriken", statBonus("attackSpeed", [0.01, 0.02, 0.03, 0.04], (v) => `+${pct$1(v)} attack speed`)),
  classTrophy("wizard", "Wizard's Orrery", {
    stats: (i) => {
      const v = [0.02, 0.04, 0.06, 0.08][i];
      return { fireResist: v, coldResist: v, lightningResist: v };
    },
    text: (b) => {
      var _a2;
      return `+${pct$1(((_a2 = b.stats) == null ? void 0 : _a2.fireResist) ?? 0)} to all elemental resistances for everyone`;
    }
  }),
  classTrophy("gladiator", "Gladiator's Laurel", statBonus("blockChance", [0.01, 0.02, 0.03, 0.04], (v) => `+${pct$1(v)} block chance`)),
  classTrophy("saboteur", "Saboteur's Fuse", statBonus("ailmentEffect", [0.05, 0.1, 0.15, 0.2], (v) => `+${pct$1(v)} ailment effect`)),
  classTrophy("bloodmage", "Bloodmage's Chalice", statBonus("lifeLeech", [5e-3, 0.01, 0.015, 0.02], (v) => `+${fmtPct(v)} life leech`)),
  classTrophy("berserker", "Berserker's Warpaint", statBonus("increasedMaxHealth", [0.02, 0.04, 0.06, 0.08], (v) => `+${pct$1(v)} max HP`)),
  classTrophy("marksman", "Marksman's Scope", statBonus("accuracy", [15, 30, 45, 60], (v) => `+${v} accuracy`)),
  classTrophy("warlock", "Warlock's Grimoire", {
    stats: (i) => {
      const v = [0.02, 0.04, 0.06, 0.08][i];
      return { igniteChance: v, chillChance: v, shockChance: v };
    },
    text: (b) => {
      var _a2;
      return `+${pct$1(((_a2 = b.stats) == null ? void 0 : _a2.igniteChance) ?? 0)} ignite, chill and shock chance for everyone`;
    }
  }),
  classTrophy("champion", "Champion's Standard", {
    stats: (i) => {
      const v = [2, 4, 6, 8][i];
      return { str: v, dex: v, int: v };
    },
    text: (b) => {
      var _a2;
      return `+${((_a2 = b.stats) == null ? void 0 : _a2.str) ?? 0} to all attributes for everyone`;
    }
  }),
  classTrophy("vagabond", "Vagabond's Compass", { xp: [0.05, 0.1, 0.15, 0.2] })
];
const trophies = Object.fromEntries(trophyList.map((t) => [t.key, t]));
function tierFor(def, value) {
  let tier = -1;
  def.tiers.forEach((t, i) => {
    if (value >= t.target) tier = i;
  });
  return tier;
}
const MAX_TROPHY_SLOTS = 10;
function equippedBonuses(state2) {
  return (state2.trophySlots ?? []).flatMap((key) => {
    var _a2;
    const tier = key ? ((_a2 = state2.trophies) == null ? void 0 : _a2[key]) ?? -1 : -1;
    return key && tier >= 0 && trophies[key] ? [trophies[key].tiers[tier].bonus] : [];
  });
}
function trophyGoldXp(state2) {
  let gold = 0, xp = 0;
  for (const b of equippedBonuses(state2)) {
    gold += b.gold ?? 0;
    xp += b.xp ?? 0;
  }
  return { gold, xp };
}
function earnedText(def, tier) {
  return def.goal(def.tiers[tier].target);
}
const slotNames = {
  mainHand: "Main hand",
  offHand: "Off hand",
  head: "Head",
  body: "Body",
  gloves: "Gloves",
  boots: "Boots",
  belt: "Belt",
  amulet: "Amulet",
  ring1: "Ring",
  ring2: "Ring"
};
const slotOrder = ["mainHand", "offHand", "head", "body", "gloves", "boots", "belt", "amulet", "ring1", "ring2"];
const list = [
  // Weapons. Each favors its own mix of core attributes through the materials that craft it:
  // greatsword Str, bow Dex, wand Int, axe Str+Dex, dagger Dex+Int, staff Int+Str, sword all three.
  // One-handed weapons. One in each hand is dual wielding: swings alternate between them at 1.5x the pace.
  // Each leans a little toward its own stats through statMultipliers.
  {
    key: "sword",
    name: "Sword",
    noun: "Sword",
    slots: ["mainHand", "offHand"],
    tags: ["sword", "oneHanded", "weapon"],
    attacksPerSecond: 1.4,
    damageMultiplier: 1,
    statMultipliers: { accuracy: 1.15, attackSpeed: 1.1 }
  },
  {
    key: "axe",
    name: "Axe",
    noun: "Axe",
    slots: ["mainHand", "offHand"],
    tags: ["axe", "oneHanded", "weapon"],
    attacksPerSecond: 1.2,
    damageMultiplier: 1.2,
    statMultipliers: { critMultiplier: 1.2, lifeLeech: 1.15, accuracy: 0.9 }
  },
  {
    key: "dagger",
    name: "Dagger",
    noun: "Dagger",
    slots: ["mainHand", "offHand"],
    tags: ["dagger", "oneHanded", "weapon"],
    attacksPerSecond: 1.8,
    damageMultiplier: 0.75,
    statMultipliers: { critChance: 1.25, lifeLeech: 0.8 }
  },
  {
    key: "wand",
    name: "Wand",
    noun: "Wand",
    slots: ["mainHand", "offHand"],
    tags: ["wand", "oneHanded", "weapon"],
    attacksPerSecond: 1.3,
    damageMultiplier: 0.9,
    statMultipliers: { increasedElementalDamage: 1.15, igniteChance: 1.25, chillChance: 1.25, shockChance: 1.25 }
  },
  // Two-handed weapons block the off hand, so their secondary stats and decorations count for
  // about 1.6 times as much: roughly what a second item in the off hand would add.
  {
    key: "greatsword",
    name: "Greatsword",
    noun: "Greatsword",
    slots: ["mainHand"],
    tags: ["greatsword", "twoHanded", "weapon"],
    twoHanded: true,
    attacksPerSecond: 0.9,
    damageMultiplier: 2,
    secondaryMultiplier: 1.6,
    statMultipliers: { critMultiplier: 2, str: 1.8, lifeLeech: 1.8, maxHealth: 1.8, attackSpeed: 1.3, accuracy: 1.4 }
  },
  {
    key: "bow",
    name: "Bow",
    noun: "Bow",
    slots: ["mainHand"],
    tags: ["bow", "twoHanded", "weapon"],
    twoHanded: true,
    attacksPerSecond: 1.1,
    damageMultiplier: 1.6,
    secondaryMultiplier: 1.6,
    statMultipliers: { accuracy: 2, critChance: 1.9, dex: 1.8, attackSpeed: 1.7, igniteChance: 1.8, chillChance: 1.8, shockChance: 1.8, lifeLeech: 1.3 }
  },
  {
    key: "staff",
    name: "Staff",
    noun: "Staff",
    slots: ["mainHand"],
    tags: ["staff", "twoHanded", "weapon"],
    twoHanded: true,
    attacksPerSecond: 1,
    damageMultiplier: 1.7,
    secondaryMultiplier: 1.6,
    statMultipliers: { int: 2, increasedElementalDamage: 2, ailmentEffect: 2, critChance: 1.5, attackSpeed: 1.3, lifeLeech: 1.3 }
  },
  // Off hand.
  { key: "shield", name: "Shield", noun: "Shield", slots: ["offHand"], tags: ["shield", "offHand", "armor"], armorMultiplier: 0.8 },
  // Armor. Material armor values are "body armor equivalents" scaled per piece.
  { key: "helmet", name: "Helmet", noun: "Helm", slots: ["head"], tags: ["helmet", "smallArmor", "armor"], armorMultiplier: 0.6 },
  { key: "bodyArmor", name: "Body armor", noun: "Armor", slots: ["body"], tags: ["bodyArmor", "armor"], armorMultiplier: 1 },
  { key: "gloves", name: "Gloves", noun: "Gloves", slots: ["gloves"], tags: ["gloves", "smallArmor", "armor"], armorMultiplier: 0.4 },
  { key: "boots", name: "Boots", noun: "Boots", slots: ["boots"], tags: ["boots", "smallArmor", "armor"], armorMultiplier: 0.5 },
  // Accessories.
  { key: "belt", name: "Belt", noun: "Belt", slots: ["belt"], tags: ["belt", "accessory"], armorMultiplier: 0.5 },
  { key: "ring", name: "Ring", noun: "Ring", slots: ["ring1", "ring2"], tags: ["ring", "accessory"] },
  { key: "amulet", name: "Amulet", noun: "Amulet", slots: ["amulet"], tags: ["amulet", "accessory"], armorMultiplier: 0.8 }
];
const itemTypes = Object.fromEntries(list.map((t) => [t.key, t]));
const itemTypeOrder = list.map((t) => t.key);
function resolveTag(table, itemType) {
  if (!table) {
    return void 0;
  }
  for (const tag of itemTypes[itemType].tags) {
    const value = table[tag];
    if (value) {
      return { tag, value };
    }
  }
  return void 0;
}
const baseCache = /* @__PURE__ */ new Map();
function getBaseStats(material, itemType) {
  var _a2;
  const id = material.key + "|" + itemType;
  let cached2 = baseCache.get(id);
  if (cached2 === void 0) {
    const raw = (_a2 = resolveTag(material.base, itemType)) == null ? void 0 : _a2.value;
    cached2 = raw ? { ...raw, maxDecorations: decorationSlots(material, itemType, raw) } : null;
    baseCache.set(id, cached2);
  }
  return cached2 ?? void 0;
}
const ACCESSORY_SLOT_TIERS = {
  belt: { two: 3, three: 7, four: 11 },
  amulet: { two: 4, three: 9, four: 13 },
  ring: { two: 5, three: 11 }
};
const DROP_RANK = { C: 0, U: 1, R: 2, M: 3 };
let dropTiers = null;
function commonestDrop(key) {
  if (!dropTiers) {
    dropTiers = /* @__PURE__ */ new Map();
    for (const q of Object.values(quests)) {
      for (const [tier, pool] of Object.entries(q.pools)) {
        for (const e of pool) {
          const rank = DROP_RANK[tier];
          if (!dropTiers.has(e.material) || rank < dropTiers.get(e.material)) dropTiers.set(e.material, rank);
        }
      }
    }
  }
  return dropTiers.get(key.replace(/^premium:/, ""));
}
function decorationSlots(material, itemType, base) {
  const p = material.power;
  const drop = commonestDrop(material.key);
  const acc = isAccessory(itemType);
  const special = base.role === "decor" || !!material.legendary || drop !== void 0 && drop >= (acc ? 2 : 3);
  if (acc) {
    const t = ACCESSORY_SLOT_TIERS[itemType] ?? { two: 4, three: 9 };
    const four = t.four ?? Infinity;
    const usual2 = p >= four + 1 ? 4 : p >= t.three + 2 ? 3 : p >= t.two ? 2 : 1;
    return special ? Math.max(usual2, p >= four ? 4 : p >= t.three ? 3 : p >= t.two - 1 ? 2 : 1) : usual2;
  }
  const usual = p >= 13 ? 5 : p >= 8 ? 4 : p >= 5 ? 3 : p >= 3 ? 2 : 1;
  return special ? Math.max(usual, p >= 10 ? 5 : p >= 6 ? 4 : p >= 4 ? 3 : 2) : usual;
}
function getDecorationStats(material, itemType) {
  var _a2;
  return (_a2 = resolveTag(material.decoration, itemType)) == null ? void 0 : _a2.value;
}
function statScale(itemType, stat) {
  const type = itemTypes[itemType];
  const scale = statDefs[stat].scale;
  const secondary = isCoreStat(stat) ? 1 : secondaryScale(itemType, stat);
  if (scale === "weaponDamage") return (type.damageMultiplier ?? 1) * secondary;
  if (scale === "defenseRating") return (isAccessory(itemType) && !isCoreStat(stat) ? 1 : type.armorMultiplier ?? 1) * secondary;
  return secondary;
}
const UNSCALED = /* @__PURE__ */ new Set(["physicalToFire", "physicalToCold", "physicalToLightning", "blockChance", "hpLostAsWard"]);
function secondaryScale(itemType, stat) {
  var _a2;
  const type = itemTypes[itemType];
  return ((_a2 = type.statMultipliers) == null ? void 0 : _a2[stat]) ?? (UNSCALED.has(stat) ? 1 : type.secondaryMultiplier ?? 1);
}
const UNSCALED_DECORATION = /* @__PURE__ */ new Set(["critChance", "critMultiplier"]);
function decorationScale(itemType, stat) {
  return UNSCALED_DECORATION.has(stat) ? 1 : secondaryScale(itemType, stat);
}
const STEPPED = /* @__PURE__ */ new Set(["lifeOnHit", "lifeRegen", "wardOnDodge", "wardOnBlock"]);
function itemStatRound(stat, value, itemType) {
  if (!STEPPED.has(stat) || value <= 0) return value;
  if (itemTypes[itemType].twoHanded) return Math.ceil(value - 1e-9);
  return value < 1.75 ? Math.max(0.5, Math.round(value * 2) / 2) : Math.round(value);
}
function isAccessory(itemType) {
  return itemTypes[itemType].tags.includes("accessory");
}
function getBaseLimit(state2, itemType) {
  return isAccessory(itemType) ? state2.guild.maxAccessoryBaseMaterials : state2.guild.maxBaseMaterials;
}
function getDecorationLimit(state2, itemType) {
  return isAccessory(itemType) ? state2.guild.maxAccessoryDecorations ?? 1 : state2.guild.maxDecorations;
}
const DECORATION_TIER_LEAD = 2;
function maxDecorationPower(itemType, baseKeys) {
  const powers = baseKeys.map(requireMaterial).filter((m) => getBaseStats(m, itemType)).map((m) => m.power);
  return powers.length ? Math.max(...powers) + DECORATION_TIER_LEAD : 0;
}
function previewCraft(itemType, baseKeys, decorationKeys, maxGuildDecorations = Infinity, keepAll = false) {
  const type = itemTypes[itemType];
  const raw = {}, caps = {}, decoration = {};
  let maxDecorations = 0, power = 0;
  let name = "", namePriority = -Infinity;
  let used = 0;
  for (const key of baseKeys) {
    const material = requireMaterial(key);
    const base = getBaseStats(material, itemType);
    if (!base) {
      continue;
    }
    used++;
    for (const [stat, entry] of Object.entries(base.stats)) {
      const [value, cap] = baseEntry(entry);
      raw[stat] = (raw[stat] ?? 0) + value;
      caps[stat] = Math.max(caps[stat] ?? 0, cap);
    }
    maxDecorations = Math.max(maxDecorations, base.maxDecorations);
    power = Math.max(power, material.power);
    const priority = base.labelPriority ?? material.power;
    if (priority > namePriority) {
      namePriority = priority;
      name = base.itemLabel ?? `${material.prefix ?? material.name} ${type.noun}`;
    }
  }
  if (!used) {
    return void 0;
  }
  const decorationLimit = keepAll ? decorationKeys.length : Math.min(maxDecorations, maxGuildDecorations);
  const decorationCap = power + DECORATION_TIER_LEAD;
  for (const key of decorationKeys.slice(0, decorationLimit)) {
    const material = requireMaterial(key);
    const extra = getDecorationStats(material, itemType);
    if (!extra || material.power > decorationCap) {
      continue;
    }
    addStats(decoration, extra);
  }
  const lines = [];
  const stats = {};
  for (const stat of statOrder) {
    if (!raw[stat] && !decoration[stat]) {
      continue;
    }
    const scale = statScale(itemType, stat);
    const r = (v) => roundStat(stat, itemStatRound(stat, v, itemType));
    const line = {
      stat,
      raw: r((raw[stat] ?? 0) * scale),
      cap: r((caps[stat] ?? 0) * scale),
      base: r(Math.min(raw[stat] ?? 0, caps[stat] ?? 0) * scale),
      decoration: r((decoration[stat] ?? 0) * decorationScale(itemType, stat)),
      total: 0
    };
    line.total = roundStat(stat, line.base + line.decoration);
    lines.push(line);
    stats[stat] = line.total;
  }
  return {
    name,
    stats: { stats, attacksPerSecond: type.attacksPerSecond },
    lines,
    maxDecorations: decorationLimit,
    power
  };
}
function getCraftedItemStats(item) {
  var _a2;
  return ((_a2 = previewCraft(item.itemType, item.base, item.decorations, Infinity, true)) == null ? void 0 : _a2.stats) ?? { stats: {} };
}
function getMaterialEquipStats(material) {
  if (!material.equip) {
    return void 0;
  }
  return { stats: material.equip.stats, attacksPerSecond: itemTypes[material.equip.itemType].attacksPerSecond };
}
function getSellValue(item) {
  let value = 0;
  for (const key of [...item.base, ...item.decorations]) {
    const power = requireMaterial(key).power;
    value += 2 * power * power;
  }
  return Math.max(1, Math.round(value * (itemTypes[item.itemType].twoHanded ? 1.2 : 1)));
}
function craftItem(state2, itemType, baseKeys, decorationKeys) {
  const preview = previewCraft(itemType, baseKeys, decorationKeys, getDecorationLimit(state2, itemType));
  if (!preview) {
    return "Add at least one base material.";
  }
  if (baseKeys.length > getBaseLimit(state2, itemType)) {
    return "Too many base materials.";
  }
  const decorations = decorationKeys.slice(0, preview.maxDecorations);
  const cap = maxDecorationPower(itemType, baseKeys);
  const tooStrong = decorations.find((k) => requireMaterial(k).power > cap);
  if (tooStrong) {
    return `${requireMaterial(tooStrong).name} is too strong a decoration for these base materials (P${cap} at most).`;
  }
  const needed = {};
  for (const key of [...baseKeys, ...decorations]) {
    needed[key] = (needed[key] ?? 0) + 1;
  }
  for (const [key, count] of Object.entries(needed)) {
    if ((state2.materials[key] ?? 0) < count) {
      return "Not enough " + requireMaterial(key).name + ".";
    }
  }
  for (const [key, count] of Object.entries(needed)) {
    state2.materials[key] -= count;
  }
  const item = {
    id: "item" + state2.nextId++,
    itemType,
    name: preview.name,
    base: [...baseKeys],
    decorations,
    power: preview.power
  };
  state2.craftedItems.push(item);
  state2.craftedCount = (state2.craftedCount ?? 0) + 1;
  state2.guide = { ...state2.guide, crafted: true, ...decorations.length ? { decorated: true } : {} };
  return item;
}
function resolveItemRef(state2, ref) {
  if (ref.kind === "crafted") {
    const item = state2.craftedItems.find((i) => i.id === ref.id);
    if (!item) {
      return void 0;
    }
    return { name: item.name, itemType: item.itemType, stats: getCraftedItemStats(item) };
  }
  const material = requireMaterial(ref.key);
  const stats = getMaterialEquipStats(material);
  if (!stats || !material.equip) {
    return void 0;
  }
  return { name: material.equip.name, itemType: material.equip.itemType, stats };
}
const RESIST_CAP = 0.75;
const BLOCK_CAP = 0.75;
const PARRY_BLOCK = 0.15;
const BASE_ACCURACY = 20;
function getAdventurerStats(state2, adventurer) {
  const gear = {};
  const weapons = [];
  for (const slot of slotOrder) {
    const ref = adventurer.equipment[slot];
    if (!ref) {
      continue;
    }
    const item = resolveItemRef(state2, ref);
    if (!item) {
      continue;
    }
    if ((slot === "mainHand" || slot === "offHand") && itemTypes[item.itemType].tags.includes("weapon")) {
      weapons.push(item);
    }
    addStats(gear, item.stats.stats);
  }
  for (const bonus of equippedBonuses(state2)) {
    addStats(gear, bonus.stats);
  }
  const g = (key) => gear[key] ?? 0;
  const cls = classes[adventurer.classKey];
  const level = adventurer.level;
  const pl = (key) => passiveLevel(adventurer, key, classPassive);
  const b = (key) => bonusMultiplier(adventurer, key);
  const str = Math.floor((cls.growth.str * level + g("str")) * b("str"));
  const dex = Math.floor((cls.growth.dex * level + g("dex")) * b("dex"));
  const int = Math.floor((cls.growth.int * level + g("int")) * b("int"));
  const attr = { str, dex, int };
  const tops = damageStats(cls);
  const coreValue2 = tops.reduce((sum, k) => sum + attr[k], 0) / tops.length;
  const unarmed = weapons.length === 0;
  const dual = weapons.length === 2;
  const emptyHands = unarmed && !adventurer.equipment.offHand;
  const martial = emptyHands ? pl("martialArts") : 0;
  const parry = dual || martial || weapons.some((w) => w.itemType === "staff") ? PARRY_BLOCK : 0;
  const maxHealth = Math.floor((20 + 4 * level + 2 * str + g("maxHealth")) * (1 + g("increasedMaxHealth")) * b("maxHealth"));
  const physicalMore = 1 + g("increasedDamage") + g("increasedPhysicalDamage");
  const elementalMore = (1 + g("increasedDamage") + g("increasedElementalDamage")) * (1 + pl("elementalMastery"));
  const toFire = g("physicalToFire"), toCold = g("physicalToCold"), toLightning = g("physicalToLightning");
  const converted = toFire + toCold + toLightning;
  const share = converted > 1 ? 1 / converted : 1;
  const kept = 1 - Math.min(1, converted);
  const dmg = b("damage");
  const strike = (flat) => ({
    physical: flat.physical * kept * physicalMore * dmg,
    fire: (flat.fire + flat.physical * toFire * share) * elementalMore * dmg,
    cold: (flat.cold + flat.physical * toCold * share) * elementalMore * dmg,
    lightning: (flat.lightning + flat.physical * toLightning * share) * elementalMore * dmg
  });
  const flatKeys = { physical: "physicalDamage", fire: "fireDamage", cold: "coldDamage", lightning: "lightningDamage" };
  const evasion = Math.floor((g("evasion") + dex) * (1 + g("increasedEvasion")) * b("evasion"));
  const maxWard = Math.floor((int + g("ward")) * b("ward") * (pl("siphonWard") > 1 ? 1.75 : pl("siphonWard") ? 1.5 : 1));
  const fromDefense = { physical: 0, fire: g("healthAsFire") * maxHealth, cold: g("evasionAsCold") * evasion, lightning: g("wardAsLightning") * maxWard };
  const gf = (t) => g(flatKeys[t]) + fromDefense[t];
  const coreFlat = (unarmed ? 1 : 0) + coreValue2 * (martial ? 1 : 0.5);
  let damage;
  const speedMore = (1 + g("attackSpeed")) * b("attackSpeed");
  let strikes;
  if (dual) {
    const others = Object.fromEntries(Object.keys(flatKeys).map((t) => [t, gf(t) - weapons.reduce((sum, w) => sum + (w.stats.stats[flatKeys[t]] ?? 0), 0)]));
    const mastery = pl("dualMastery");
    const mult = [1, 1.25, 1.5][mastery];
    const pace = mastery ? 2 : 1.5;
    strikes = weapons.map((w) => {
      const hit = strike(Object.fromEntries(Object.keys(flatKeys).map((t) => [t, others[t] + (w.stats.stats[flatKeys[t]] ?? 0) + (t === "physical" ? coreFlat : 0)])));
      return {
        weaponName: w.name,
        damage: Object.fromEntries(Object.keys(flatKeys).map((t) => [t, mult * hit[t]])),
        attacksPerSecond: pace * (w.stats.attacksPerSecond ?? 1) * speedMore
      };
    });
    damage = Object.fromEntries(Object.keys(flatKeys).map((t) => [t, (strikes[0].damage[t] + strikes[1].damage[t]) / 2]));
  } else {
    damage = strike({ physical: gf("physical") + coreFlat, fire: gf("fire"), cold: gf("cold"), lightning: gf("lightning") });
  }
  const attacksPerSecond = strikes ? 2 / strikes.reduce((sum, st) => sum + 1 / st.attacksPerSecond, 0) : (martial ? 1.5 : unarmed ? 1 : weapons[0].stats.attacksPerSecond ?? 1) * speedMore;
  const resist = Object.fromEntries(elements.map((e) => [e, Math.min(RESIST_CAP, g(resistStat[e]))]));
  return {
    str,
    dex,
    int,
    maxHealth,
    damage,
    damagePerHit: damage.physical + damage.fire + damage.cold + damage.lightning,
    attacksPerSecond,
    strikes,
    accuracy: Math.floor((BASE_ACCURACY + 2 * level + 2 * dex + g("accuracy")) * b("accuracy")),
    armor: Math.floor(g("armor") * (1 + g("increasedArmor")) * b("armor")),
    evasion,
    blockChance: Math.min(BLOCK_CAP, g("blockChance") + parry),
    resist,
    critChance: (int / 100 + g("critChance") + 0.15 * martial) * b("critChance"),
    critBonus: 0.5 + g("critMultiplier") + 0.5 * martial,
    rollMin: 0.85 * (1 + str / 100),
    rollMax: 1.15 * (1 + 2 * str / 100),
    // Siphon ward (the Priest's passive) also raises max ward: 1.5x, or 1.75x enhanced.
    maxWard,
    hpLostAsWard: g("hpLostAsWard"),
    // Percent regen counts toward life regen, so rests and Blood pact use it too.
    lifeRegen: (g("lifeRegen") + g("lifeRegenPercent") * maxHealth) * b("lifeRegen"),
    // Blood pact carries 5% life leech of its own.
    lifeLeech: (g("lifeLeech") + (pl("bloodPact") ? 0.05 : 0)) * b("lifeLeech"),
    lifeOnHit: g("lifeOnHit"),
    weaponName: weapons.map((w) => w.name).join(" & ") || "Unarmed",
    wieldNote: dual ? `dual wielding, alternating swings${pl("dualMastery") ? `, ${[100, 125, 150][pl("dualMastery")]}% damage` : ""}, +15% block` : martial ? "unarmed, Martial arts, +15% block" : unarmed && pl("martialArts") ? "unarmed, but the off hand item turns off Martial arts" : unarmed ? "unarmed" : parry ? "staff, +15% block" : "",
    gear
  };
}
function isTwoHandedEquipped(state2, adventurer) {
  const ref = adventurer.equipment.mainHand;
  if (!ref) {
    return false;
  }
  const item = resolveItemRef(state2, ref);
  return !!item && !!itemTypes[item.itemType].twoHanded;
}
function totalXpForLevel(level) {
  return 10 * (level - 1) * level * (2 * (level - 1) + 1) / 6;
}
const levelCap = 100;
const statsCache = /* @__PURE__ */ new Map();
function invalidateStats() {
  statsCache.clear();
}
function getCachedStats(state2, adventurer) {
  let stats = statsCache.get(adventurer.id);
  if (!stats) {
    stats = getAdventurerStats(state2, adventurer);
    statsCache.set(adventurer.id, stats);
  }
  return stats;
}
function armorReduce(damage, armor) {
  if (damage <= 0) {
    return 0;
  }
  return damage * Math.pow(0.5, 2 * Math.max(0, armor) / damage);
}
function mitigateHit(damage, armor) {
  return damage <= 0 ? 0 : armorReduce(damage, armor);
}
function mitigateDamage(damage, armor, resist, rng) {
  const m = mitigateByType(damage, armor, resist);
  const total = (m.physical ?? 0) + elements.reduce((sum, e) => sum + (m[e] ?? 0), 0);
  return total >= 1 ? total : rng() < total ? 1 : 0;
}
function mitigateByType(damage, armor, resist) {
  const out = {};
  if (damage.physical) out.physical = armorReduce(damage.physical, armor);
  for (const e of elements) {
    if (damage[e]) out[e] = damage[e] * (1 - (resist[e] ?? 0));
  }
  return out;
}
const HIT_RATING_EXPONENT = 0.5;
const HIT_RATING_OFFSET = 0.2;
function hitRating(accuracy, evasion) {
  if (evasion <= 0) {
    return 50;
  }
  return Math.max(0, Math.pow(Math.max(0, accuracy) / evasion, HIT_RATING_EXPONENT) - HIT_RATING_OFFSET);
}
const EXPOSED_STEP = 0.85;
function exposedEvasion(evasion, stacks = 0) {
  return evasion * Math.pow(EXPOSED_STEP, stacks);
}
function hitChance(accuracy, evasion) {
  return Math.min(1, hitRating(accuracy, evasion));
}
function rollHits(accuracy, evasion, rng, maxHits = 50) {
  const rating = hitRating(accuracy, evasion);
  let hits = 0;
  while (hits < maxHits && rng() < rating / (hits + 1)) {
    hits++;
  }
  return hits;
}
function rollCritLevels(critChance, rng, maxLevels = 50) {
  let levels = 0;
  while (levels < maxLevels && rng() < critChance / (levels + 1)) {
    levels++;
  }
  return levels;
}
function expectedHits(accuracy, evasion) {
  const rating = hitRating(accuracy, evasion);
  let p = 1, total = 0;
  for (let n = 1; n <= 50; n++) {
    p *= Math.min(1, rating / n);
    if (p < 1e-6) break;
    total += p;
  }
  return total;
}
function expectedCritMultiplier(critChance, critBonus) {
  let p = 1, levels = 0;
  for (let n = 1; n <= 50; n++) {
    p *= Math.min(1, critChance / n);
    if (p < 1e-6) break;
    levels += p;
  }
  return 1 + critBonus * levels;
}
const expansions = [
  { level: 1, fame: 50, gold: 500 },
  { level: 2, fame: 150, gold: 2e3 },
  { level: 3, fame: 300, gold: 5e3 },
  { level: 4, fame: 500, gold: 2e4 },
  { level: 5, fame: 800, gold: 5e4 },
  { level: 6, fame: 1200, gold: 1e5 },
  { level: 7, fame: 2e3, gold: 2e5 },
  { level: 8, fame: 2800, gold: 4e5 },
  { level: 9, fame: 4e3, gold: 8e5 }
];
const startingGuild = { memberSlots: 1, maxBaseMaterials: 1, maxAccessoryBaseMaterials: 1, maxDecorations: 1, maxAccessoryDecorations: 1, trophySlots: 0 };
const ladder = (track, firstSlot, prices) => prices.map(([gold, expansion], i) => ({ key: `${track}-${firstSlot + i}`, track, slot: firstSlot + i, gold, expansion }));
const slotUnlocks = [
  // What each expansion opens: 1 base + member, 2 decoration + accessory base, 3 base + accessory
  // decoration, 4 member (and the salvage yard), 5 decoration + accessory base, 6 base + accessory
  // decoration, 7 decoration + member, 8 accessory base + member, 9 accessory decoration + member.
  // Every expansion also opens one trophy slot.
  ...ladder("baseSlot", 2, [[100, 0], [500, 1], [5e3, 3], [1e5, 6]]),
  ...ladder("decorationSlot", 2, [[200, 0], [3e3, 2], [75e3, 5], [3e5, 7]]),
  ...ladder("memberSlot", 2, [[500, 0], [1e3, 1], [4e4, 4], [4e5, 7], [8e5, 8], [15e5, 9]]),
  ...ladder("accessorySlot", 2, [[2e3, 2], [5e4, 5], [25e4, 8]]),
  ...ladder("accessoryDecorationSlot", 2, [[7500, 3], [15e4, 6], [6e5, 9]]),
  // The first trophy slot is free with the first trophy; each expansion opens one more.
  ...ladder("trophySlot", 2, expansions.map((e) => [e.gold, e.level]))
];
const SLOT_FAME = [5, 10, 20, 50];
function slotFame(index) {
  return SLOT_FAME[index] ?? 0;
}
function unlockFame(unlock) {
  return slotFame(slotUnlocks.filter((u) => u.track === unlock.track).indexOf(unlock));
}
const trackNames = {
  baseSlot: "base slot for weapons and armor",
  decorationSlot: "decoration slot for weapons and armor",
  accessorySlot: "base slot for accessories",
  accessoryDecorationSlot: "decoration slot for accessories",
  memberSlot: "guild member slot",
  trophySlot: "trophy slot"
};
const ambitionTierNames = ["Novice", "Seasoned", "Veteran", "Legend", "Paragon", "Exalted", "Ascendant", "Eternal"];
const AMBITION_FAME = [4, 10, 25, 60, 120, 200, 350, 600];
const RETIRE_MULTIPLIER = [0, 1, 1.5, 2.5];
const HIRE_FEES = [50, 200, 1e3, 5e3, 15e3, 3e4, 6e4, 12e4];
const START_LEVEL_CAP = [1, 5, 10, 15, 20, 25, 30, 35];
const APPLICANT_SLOTS = [2, 2, 3, 3];
const THIRD_APPLICANT_EXPANSION = 2;
function applicantSlots(state2) {
  return APPLICANT_SLOTS[Math.min(state2.expansion ?? 0, APPLICANT_SLOTS.length - 1)];
}
function applicantSlotFame(before, after) {
  let fame = 0;
  for (let i = before; i < after; i++) fame += slotFame(i - APPLICANT_SLOTS[0]);
  return fame;
}
const REFRESH_COST = [20, 60, 200, 600, 1500, 3e3, 6e3, 12e3];
function emptyRecords() {
  return { bestHit: 0, bestChain: 0, bestKills: 0, modClears: {}, bareClears: [], bosses: [] };
}
function records(adventurer) {
  adventurer.records ?? (adventurer.records = emptyRecords());
  return adventurer.records;
}
const TIER_FAME = [50, 200, 1e3, 2e3, 4e3, 1e4, 2e4];
function tierStartFame(tier) {
  return tier <= 0 ? 0 : Math.round(0.8 * TIER_FAME[tier - 1]);
}
function atLeastTier(fame, tier) {
  if (tier <= 0) return 1;
  const target = TIER_FAME[tier - 1];
  return Math.max(0, Math.min(1, (fame - 0.8 * target) / (0.4 * target)));
}
function applicantTierOdds(state2) {
  return ambitionTierNames.map((_, t) => atLeastTier(state2.fame, t) - (t + 1 < ambitionTierNames.length ? atLeastTier(state2.fame, t + 1) : 0));
}
function guildTier(state2) {
  return TIER_FAME.filter((f) => state2.fame >= f).length;
}
const pick$2 = (list2, rng) => list2[Math.floor(rng() * list2.length)];
const progressTemplates = [
  { kind: "level", make: (tier) => ({ target: [10, 25, 45, 70, 90, 95, 100, 100][tier] }) },
  { kind: "endless", make: (tier, _c2, rng) => {
    const options = [
      [],
      [["brambleRoad", 15]],
      [["brambleRoad", 30], ["hollowMines", 20]],
      [["hollowMines", 30], ["ashenPeaks", 25], ["sunkenMarsh", 25], ["thunderheadCrags", 25]],
      [["ashenPeaks", 35], ["sunkenMarsh", 35], ["thunderheadCrags", 35], ["hollowMines", 40], ["sunderedRift", 20]],
      [["ashenPeaks", 50], ["sunkenMarsh", 50], ["thunderheadCrags", 50], ["hollowMines", 60], ["sunderedRift", 30]],
      [["ashenPeaks", 70], ["sunkenMarsh", 70], ["thunderheadCrags", 70], ["hollowMines", 80], ["sunderedRift", 45]],
      [["ashenPeaks", 100], ["sunkenMarsh", 100], ["thunderheadCrags", 100], ["hollowMines", 100], ["sunderedRift", 70]]
    ];
    if (!options[tier].length) return void 0;
    const [quest, target] = pick$2(options[tier], rng);
    return { quest, target };
  } }
];
const buildTemplates = [
  { kind: "bigHit", make: (tier) => ({ target: [60, 250, 600, 1500, 4e3, 8e3, 15e3, 3e4][tier] }) },
  { kind: "chain", make: (tier) => ({ target: [5, 6, 7, 8, 9, 10, 11, 12][tier] }) },
  { kind: "multiKill", make: (tier, info) => info.multiKill ? { target: [2, 3, 3, 4, 5, 5, 6, 6][tier] } : void 0 },
  { kind: "clearMods", make: (tier, _c2, rng) => {
    const options = [
      [["brambleRoad", 1]],
      [["brambleRoad", 3], ["hollowMines", 1]],
      [["hollowMines", 3], ["ashenPeaks", 1], ["sunkenMarsh", 1], ["thunderheadCrags", 1]],
      [["ashenPeaks", 3], ["sunkenMarsh", 3], ["thunderheadCrags", 3], ["hollowMines", 5]],
      [["ashenPeaks", 5], ["sunkenMarsh", 5], ["thunderheadCrags", 5], ["hollowMines", 7], ["sunderedRift", 1]],
      [["ashenPeaks", 6], ["sunkenMarsh", 6], ["thunderheadCrags", 6], ["hollowMines", 7], ["sunderedRift", 3]],
      [["ashenPeaks", 7], ["sunkenMarsh", 7], ["thunderheadCrags", 7], ["sunderedRift", 5]],
      [["ashenPeaks", 7], ["sunkenMarsh", 7], ["thunderheadCrags", 7], ["sunderedRift", 7]]
    ];
    const [quest, target] = pick$2(options[tier], rng);
    return { quest, target };
  } },
  { kind: "bareClear", make: (tier) => ({ quest: [`brambleRoad`, "brambleRoad", "hollowMines", "ashenPeaks", "sunkenMarsh", "thunderheadCrags", "sunderedRift", "sunderedRift"][tier], target: 1 }) }
];
const bossQuests = [
  { quest: "brambleRoad", minTier: 0, topTier: 1 },
  { quest: "hollowMines", minTier: 2, topTier: 2 },
  { quest: "ashenPeaks", minTier: 3, topTier: 2 },
  { quest: "sunkenMarsh", minTier: 3, topTier: 2 },
  { quest: "thunderheadCrags", minTier: 3, topTier: 2 },
  { quest: "sunderedRift", minTier: 4, topTier: 4 },
  { quest: "amberHive", minTier: 4, topTier: 4 },
  { quest: "duskgraveNecropolis", minTier: 4, topTier: 4 },
  { quest: "ironboundFoundry", minTier: 4, topTier: 4 },
  { quest: "skyspireAerie", minTier: 4, topTier: 4 },
  { quest: "shatteredThrone", minTier: 5, topTier: 5 }
];
const easyMods = ["hardened", "swift", "brutal"];
const nextMods = [...easyMods, "elite"];
const BOSS_LEVEL_MARGIN = 3;
function bossAmbition(tier, rng, startLevel = 1) {
  const options = bossQuests.filter((b) => {
    var _a2;
    return b.minTier <= tier && ((_a2 = quests[b.quest]) == null ? void 0 : _a2.boss) && questXpLevel(quests[b.quest]) >= startLevel + BOSS_LEVEL_MARGIN;
  });
  if (!options.length) return void 0;
  const option = pick$2(options, rng);
  const quest = option.quest;
  const elemental = quests[quest].modifiers.filter((m) => m.exclusive).map((m) => m.key);
  const mods = [rng() < 0.5 && elemental.length ? pick$2(elemental, rng) : pick$2(easyMods, rng)];
  for (let extra = 0; extra < tier - option.topTier; extra++) {
    let left = easyMods.filter((m) => !mods.includes(m));
    if (!left.length) left = nextMods.filter((m) => !mods.includes(m));
    if (!left.length) break;
    mods.push(pick$2(left, rng));
  }
  return { quest, target: 1, mods };
}
function rollAmbitions(tier, classKey, rng = Math.random, startLevel = 1, passiveKeys) {
  var _a2;
  const keys = passiveKeys ?? (((_a2 = classes[classKey]) == null ? void 0 : _a2.passiveKey) ? [classes[classKey].passiveKey] : []);
  const info = { classKey, multiKill: keys.includes("followThrough") || keys.includes("cleave") };
  const fame = AMBITION_FAME[tier];
  const out = [];
  const progress = progressTemplates.map((t) => ({ t, made: t.make(tier, info, rng) })).filter((x) => x.made);
  const p = pick$2(progress, rng);
  out.push({ kind: p.t.kind, tier, fame, ...p.made });
  if (rng() < 0.35) {
    const boss = bossAmbition(tier, rng, startLevel);
    if (boss) out.push({ kind: "boss", tier, fame: Math.round(fame * 1.5), ...boss });
  }
  const builds = buildTemplates.map((t) => ({ t, made: t.make(tier, info, rng) })).filter((x) => x.made);
  while (out.length < 3 && builds.length) {
    const i = Math.floor(rng() * builds.length);
    const b = builds.splice(i, 1)[0];
    out.push({ kind: b.t.kind, tier, fame, ...b.made });
  }
  return out;
}
const modName = (questKey, key) => {
  var _a2;
  return ((_a2 = quests[questKey].modifiers.find((m) => m.key === key)) == null ? void 0 : _a2.name) ?? key;
};
function ambitionText(a) {
  const q = a.quest ? quests[a.quest].name : "";
  switch (a.kind) {
    case "level":
      return `Reach level ${a.target}`;
    case "endless":
      return `Reach encounter ${a.target} in ${q}: Endless`;
    case "bigHit":
      return `Deal ${a.target.toLocaleString()} damage in one hit`;
    case "chain":
      return `Land ${a.target} hits with one attack`;
    case "multiKill":
      return `Kill ${a.target} monsters with one attack`;
    case "clearMods":
      return `Fully clear ${q} with ${a.target} modifier${a.target > 1 ? "s" : ""} on`;
    case "bareClear":
      return `Fully clear ${q} with no body armor, helmet, gloves or boots`;
    case "boss": {
      const boss = quests[a.quest].boss;
      return `Defeat ${monsters[boss.monster].name} in ${q}`;
    }
  }
}
function ambitionHint(a) {
  if (a.kind === "boss") {
    const boss = quests[a.quest].boss;
    return `Appears after ${quests[a.quest].name}'s final encounter on a full clear with ${(a.mods ?? []).map((m) => modName(a.quest, m)).join(" and ")} on (modifiers open after the first full clear). Drops ${requireMaterial(boss.legendary).name}, a legendary.`;
  }
  return "";
}
function ambitionProgress(adventurer, a) {
  var _a2;
  const r = records(adventurer);
  switch (a.kind) {
    case "level":
      return [adventurer.level, a.target];
    case "endless":
      return [(((_a2 = adventurer.endlessBest) == null ? void 0 : _a2[a.quest]) ?? -1) + 1, a.target];
    case "bigHit":
      return [Math.floor(r.bestHit), a.target];
    case "chain":
      return [r.bestChain, a.target];
    case "multiKill":
      return [r.bestKills, a.target];
    case "clearMods":
      return [r.modClears[a.quest] ?? 0, a.target];
    case "bareClear":
      return [r.bareClears.includes(a.quest) ? 1 : 0, 1];
    case "boss":
      return [r.bosses.includes(a.quest) ? 1 : 0, 1];
  }
}
function isMet(adventurer, a) {
  const [value, target] = ambitionProgress(adventurer, a);
  return value >= target;
}
function checkAmbitions(state2) {
  const out = [];
  for (const adventurer of state2.adventurers) {
    for (const a of adventurer.ambitions ?? []) {
      if (!a.done && isMet(adventurer, a)) {
        a.done = true;
        out.push({ adventurer, ambition: a });
      }
    }
  }
  return out;
}
function retireFame(adventurer) {
  const done = (adventurer.ambitions ?? []).filter((a) => a.done);
  return Math.round(done.reduce((sum, a) => sum + a.fame, 0) * RETIRE_MULTIPLIER[Math.min(3, done.length)]);
}
function bossAmbitionFor(adventurer, questKey) {
  return (adventurer.ambitions ?? []).find((a) => a.kind === "boss" && a.quest === questKey && !a.done);
}
function rollApplicantTier(state2, rng) {
  const odds = applicantTierOdds(state2);
  let r = rng();
  for (let t = 0; t < odds.length; t++) {
    r -= odds[t];
    if (r < 0) return t;
  }
  return 0;
}
function rollClass(tier, rng) {
  const options = Object.values(classes).filter((c) => c.tier <= tier);
  const total = options.reduce((sum, c) => sum + 1 + c.tier, 0);
  let r = rng() * total;
  return (options.find((c) => (r -= 1 + c.tier) < 0) ?? options[0]).key;
}
function rollCorePassives(classKey, rng) {
  const special = classes[classKey].special;
  if (!special) return void 0;
  const pool = [...new Set(Object.values(classes).filter((c) => !c.special && c.passiveKey).map((c) => c.passiveKey))];
  const out = [];
  for (let n = special === "enhanced" ? 1 : 3; n > 0 && pool.length; n--) {
    const key = pool.splice(Math.floor(rng() * pool.length), 1)[0];
    out.push(special === "enhanced" ? { key, enhanced: true } : { key });
  }
  return out;
}
function rollApplicant(state2, taken, rng = Math.random) {
  const tier = rollApplicantTier(state2, rng);
  const classKey = rollClass(tier, rng);
  const corePassives = rollCorePassives(classKey, rng);
  const bonuses = rollBonuses(Math.max(0, tier - classes[classKey].tier), rng);
  const bestLevel = Math.max(1, ...state2.adventurers.map((a) => a.level));
  const cap = Math.max(1, Math.min(START_LEVEL_CAP[tier], Math.floor(bestLevel / 2)));
  const level = 1 + Math.floor(rng() * cap);
  const names = classes[classKey].names.filter((n) => !taken.has(n));
  const name = names.length ? pick$2(names, rng) : `${pick$2(classes[classKey].names, rng)} ${state2.nextId}`;
  taken.add(name);
  const applicant = { id: "app" + state2.nextId++, name, classKey, level, tier, fee: HIRE_FEES[tier], ambitions: rollAmbitions(tier, classKey, rng, level, corePassives == null ? void 0 : corePassives.map((p) => p.key)) };
  if (corePassives) applicant.passives = corePassives;
  if (Object.keys(bonuses).length) applicant.bonuses = bonuses;
  return applicant;
}
function ensureApplicants(state2) {
  const slots = applicantSlots(state2);
  const list2 = (state2.applicants ?? []).slice(0, slots);
  const taken = /* @__PURE__ */ new Set([...state2.adventurers.map((a) => a.name), ...list2.map((a) => a.name)]);
  while (list2.length < slots) list2.push(rollApplicant(state2, taken));
  state2.applicants = list2;
}
function refreshCost(state2) {
  return REFRESH_COST[guildTier(state2)];
}
function refreshApplicants(state2) {
  const cost = refreshCost(state2);
  if (state2.gold < cost) return false;
  state2.gold -= cost;
  state2.applicants = [];
  ensureApplicants(state2);
  return true;
}
function giveAmbitions(state2, adventurer) {
  adventurer.ambitions ?? (adventurer.ambitions = rollAmbitions(guildTier(state2), adventurer.classKey, Math.random, adventurer.level));
  adventurer.records ?? (adventurer.records = emptyRecords());
}
const STARTER_CLASSES = ["warrior", "ranger", "priest"];
function rollStarters(state2, rng = Math.random) {
  return STARTER_CLASSES.map((classKey) => ({
    id: "app" + state2.nextId++,
    name: pick$2(classes[classKey].names, rng),
    classKey,
    level: 1,
    tier: 0,
    fee: 0,
    ambitions: rollAmbitions(0, classKey, rng, 1)
  }));
}
const GUILD_CONTRACT_COUNT = 2;
const pick$1 = (list2, rng) => list2[Math.floor(rng() * list2.length)];
function finalLevel(quest) {
  return encounterLevel(quest, quest.encounters.length - 1);
}
function openQuests(state2) {
  return questOrder.map((k) => quests[k]).filter((q) => isQuestUnlocked(state2, q.key));
}
function rollMods(quest, count, rng, elementalChance) {
  const generic = quest.modifiers.filter((m) => !m.addedDamage && !m.rite).map((m) => m.key);
  const elemental = quest.modifiers.filter((m) => m.addedDamage).map((m) => m.key);
  const mods = [];
  if (rng() < elementalChance) mods.push(pick$1(elemental, rng));
  const pool = [...generic];
  while (mods.length < count && pool.length) {
    const i = Math.floor(rng() * Math.min(pool.length, 4));
    mods.push(pool.splice(i, 1)[0]);
  }
  return mods;
}
function rollPersonalContract(state2, adventurer, rng = Math.random) {
  const open2 = openQuests(state2);
  if (!open2.length) return void 0;
  const fitting = open2.filter((q) => finalLevel(q) <= adventurer.level + 1);
  const quest = fitting.length ? fitting[fitting.length - 1] : open2[0];
  const over = Math.max(0, adventurer.level - finalLevel(quest));
  const count = Math.min(4, 1 + Math.floor(over / 4));
  const plain = pick$1(quest.pools.M, rng).material;
  const mythic = !requireMaterial(plain).keyItem && rng() < PREMIUM_CHANCE ? premiumKey(plain) : plain;
  return { id: "pc" + state2.nextId++, questKey: quest.key, mods: rollMods(quest, count, rng, 0.35), reward: { material: mythic, gold: Math.round(40 * quest.basePower) } };
}
function ensurePersonalContract(state2, adventurer) {
  if (!adventurer.contract) {
    adventurer.contract = rollPersonalContract(state2, adventurer);
  }
}
function personalRefreshCost(adventurer) {
  return 10 * adventurer.level;
}
function refreshPersonalContract(state2, adventurer) {
  var _a2;
  const cost = personalRefreshCost(adventurer);
  if (state2.gold < cost) return false;
  state2.gold -= cost;
  if (((_a2 = adventurer.activeContract) == null ? void 0 : _a2.kind) === "personal") adventurer.activeContract = null;
  adventurer.contract = rollPersonalContract(state2, adventurer);
  return true;
}
function guildContractBudget(state2, quest) {
  const index = questTier(quest.key);
  return Math.max(1, 1 + Math.floor(state2.fame / 75) - 2 * index);
}
function rollModsByWeight(quest, budget, rng, elementalChance) {
  const usable = quest.modifiers.filter((m) => !m.rite);
  const mods = [];
  let left = budget;
  const elemental = usable.filter((m) => m.addedDamage);
  if (rng() < elementalChance && elemental.length) {
    const m = pick$1(elemental, rng);
    mods.push(m.key);
    left -= m.feeWeight;
  }
  while (left > 0) {
    const options = usable.filter((m2) => !m2.addedDamage && !mods.includes(m2.key) && m2.feeWeight <= left);
    if (!options.length) break;
    const m = pick$1(options, rng);
    mods.push(m.key);
    left -= m.feeWeight;
  }
  return mods.length ? mods : rollMods(quest, 1, rng, 0);
}
function rollGuildContract(state2, rng = Math.random) {
  const open2 = openQuests(state2);
  if (!open2.length) return void 0;
  const tiers = [...new Set(open2.map((q) => questTier(q.key)))].sort((a, b) => b - a).slice(0, 2);
  const quest = pick$1(open2.filter((q) => tiers.includes(questTier(q.key))), rng);
  const index = questTier(quest.key);
  const mods = rollModsByWeight(quest, guildContractBudget(state2, quest), rng, 0.6);
  const weight = mods.reduce((sum, k) => {
    var _a2;
    return sum + (((_a2 = quest.modifiers.find((m) => m.key === k)) == null ? void 0 : _a2.feeWeight) ?? 1);
  }, 0);
  return {
    id: "gc" + state2.nextId++,
    questKey: quest.key,
    mods,
    reward: { fame: [3, 8, 15][index] ?? 15, gold: Math.round(80 * quest.basePower * weight) }
  };
}
function ensureGuildContracts(state2) {
  state2.guildContracts ?? (state2.guildContracts = []);
  while (state2.guildContracts.length < GUILD_CONTRACT_COUNT) {
    const c = rollGuildContract(state2);
    if (!c) break;
    state2.guildContracts.push(c);
  }
}
function guildRefreshCost(contract) {
  return Math.round(30 * quests[contract.questKey].basePower);
}
function refreshGuildContract(state2, id) {
  var _a2;
  const i = (state2.guildContracts ?? []).findIndex((c) => c.id === id);
  if (i < 0) return false;
  const cost = guildRefreshCost(state2.guildContracts[i]);
  if (state2.gold < cost) return false;
  state2.gold -= cost;
  for (const a of state2.adventurers) {
    if (((_a2 = a.activeContract) == null ? void 0 : _a2.id) === id) a.activeContract = null;
  }
  const next = rollGuildContract(state2);
  if (next) state2.guildContracts[i] = next;
  else state2.guildContracts.splice(i, 1);
  return true;
}
function findContract(state2, ref, adventurer) {
  var _a2, _b2;
  if (!ref) return void 0;
  if (ref.kind === "personal") {
    const owner = adventurer && ((_a2 = adventurer.contract) == null ? void 0 : _a2.id) === ref.id ? adventurer : state2.adventurers.find((a) => {
      var _a3;
      return ((_a3 = a.contract) == null ? void 0 : _a3.id) === ref.id;
    });
    return owner == null ? void 0 : owner.contract;
  }
  return (_b2 = state2.guildContracts) == null ? void 0 : _b2.find((c) => c.id === ref.id);
}
function contractHolder(state2, id) {
  return state2.adventurers.find((a) => {
    var _a2;
    return ((_a2 = a.activeContract) == null ? void 0 : _a2.id) === id;
  });
}
function takeContract(state2, adventurer, kind, id) {
  const ref = { kind, id };
  const contract = findContract(state2, ref, adventurer);
  if (!contract || !isQuestUnlocked(state2, contract.questKey)) return void 0;
  if (kind === "guild") {
    const holder = contractHolder(state2, id);
    if (holder && holder !== adventurer) holder.activeContract = null;
  }
  adventurer.activeContract = ref;
  const quest = quests[contract.questKey];
  const current = getActiveModifiers(state2, adventurer, quest);
  setActiveModifiers(adventurer, quest.key, [.../* @__PURE__ */ new Set([...current, ...contract.mods])]);
  return contract;
}
function dropContract(adventurer) {
  adventurer.activeContract = null;
}
function grantedModifiers(state2, adventurer, questKey) {
  var _a2;
  if (!adventurer) return [];
  const out = [];
  const contract = findContract(state2, adventurer.activeContract, adventurer);
  if ((contract == null ? void 0 : contract.questKey) === questKey) out.push(...contract.mods);
  if (isQuestCleared(state2, questKey)) out.push(...((_a2 = bossAmbitionFor(adventurer, questKey)) == null ? void 0 : _a2.mods) ?? []);
  return out;
}
function contractRewardText(contract) {
  return [
    contract.reward.material ? requireMaterial(contract.reward.material).name : "",
    contract.reward.fame ? `${contract.reward.fame} fame` : "",
    `${contract.reward.gold} gold`
  ].filter(Boolean).join(" + ");
}
function contractText(contract) {
  const quest = quests[contract.questKey];
  const names = contract.mods.map((k) => {
    var _a2;
    return ((_a2 = quest.modifiers.find((m) => m.key === k)) == null ? void 0 : _a2.name) ?? k;
  });
  return `Fully clear ${quest.name} with ${names.join(", ")} on`;
}
const PORTAL_SECONDS = 30 * 60;
function portalOpen(state2) {
  return !!state2.portal && state2.time < state2.portal.openUntil;
}
function portalSecondsLeft(state2) {
  return portalOpen(state2) ? state2.portal.openUntil - state2.time : 0;
}
function hasKeys(state2, keys) {
  return keys.every((k) => (state2.materials[k] ?? 0) > 0);
}
function openPortal(state2, keys) {
  var _a2;
  if (!hasKeys(state2, keys)) return false;
  for (const k of keys) state2.materials[k] -= 1;
  state2.portal = { openUntil: Math.max(state2.time, ((_a2 = state2.portal) == null ? void 0 : _a2.openUntil) ?? 0) + PORTAL_SECONDS };
  return true;
}
function isPortalQuest(questKey) {
  var _a2;
  return !!((_a2 = quests[questKey]) == null ? void 0 : _a2.portal);
}
const SAVE_VERSION = 8;
function createAdventurer(state2, name, classKey) {
  const adventurer = {
    id: "adv" + state2.nextId++,
    name,
    classKey,
    level: 1,
    xp: 0,
    hp: 1,
    equipment: {},
    assignment: null,
    activity: { kind: "idle" }
  };
  const cls = classes[classKey];
  const starters = [["mainHand", cls.starterWeapon], ["offHand", cls.starterOffHand]];
  for (const [slot, type] of starters) {
    const preview = type && previewCraft(type, ["wood"], []);
    if (type && preview) {
      const item = { id: "item" + state2.nextId++, itemType: type, name: preview.name, base: ["wood"], decorations: [], power: 1 };
      state2.craftedItems.push(item);
      adventurer.equipment[slot] = { kind: "crafted", id: item.id };
    }
  }
  adventurer.hp = getAdventurerStats(state2, adventurer).maxHealth;
  return adventurer;
}
function canHire(state2, fee) {
  if (state2.adventurers.length >= state2.guild.memberSlots) {
    return "No free member slots";
  }
  if (state2.gold < fee) {
    return `Needs ${fee} gold`;
  }
  return null;
}
function hireApplicant(state2, applicantId) {
  var _a2;
  const applicant = (_a2 = state2.applicants) == null ? void 0 : _a2.find((a) => a.id === applicantId);
  if (!applicant) {
    return "That applicant has left";
  }
  const blocked = canHire(state2, applicant.fee);
  if (blocked) {
    return blocked;
  }
  state2.gold -= applicant.fee;
  const adventurer = adventurerFromApplicant(state2, applicant);
  state2.applicants = state2.applicants.filter((a) => a !== applicant);
  ensureApplicants(state2);
  return adventurer;
}
function chooseStarter(state2, applicantId) {
  var _a2;
  const applicant = (_a2 = state2.starters) == null ? void 0 : _a2.find((a) => a.id === applicantId);
  if (!applicant || state2.adventurers.length) return null;
  delete state2.starters;
  return adventurerFromApplicant(state2, applicant);
}
function adventurerFromApplicant(state2, applicant) {
  const adventurer = createAdventurer(state2, applicant.name, applicant.classKey);
  adventurer.level = applicant.level;
  adventurer.xp = totalXpForLevel(applicant.level);
  adventurer.ambitions = applicant.ambitions;
  if (applicant.passives) adventurer.passives = applicant.passives;
  if (applicant.bonuses) adventurer.bonuses = applicant.bonuses;
  adventurer.records = emptyRecords();
  invalidateStats();
  adventurer.hp = getAdventurerStats(state2, adventurer).maxHealth;
  state2.adventurers.push(adventurer);
  return adventurer;
}
function getActiveModifiers(state2, adventurer, quest) {
  var _a2;
  if (quest.endless) return [];
  const chosen = ((_a2 = adventurer == null ? void 0 : adventurer.questModifiers) == null ? void 0 : _a2[quest.key]) ?? getQuestProgress(state2, quest.key).activeModifiers ?? [];
  const granted = grantedModifiers(state2, adventurer, quest.key);
  return chosen.filter((k) => isModifierUnlocked(state2, quest, k) || granted.includes(k));
}
function setActiveModifiers(adventurer, questKey, keys) {
  adventurer.questModifiers = { ...adventurer.questModifiers, [questKey]: keys };
}
function createNewGame() {
  const state2 = {
    version: SAVE_VERSION,
    time: 0,
    gold: 0,
    fame: 0,
    materials: {},
    obtained: {},
    benchOwned: false,
    guide: {},
    craftedItems: [],
    adventurers: [],
    guild: { ...startingGuild },
    trophies: {},
    trophySlots: [],
    achievements: [],
    questProgress: {},
    nextId: 1
  };
  state2.starters = rollStarters(state2);
  return state2;
}
function getQuestProgress(state2, questKey) {
  let progress = state2.questProgress[questKey];
  if (progress && !progress.revealed.M) {
    progress.revealed.M = [];
  }
  if (!progress) {
    progress = {
      revealed: { C: [], U: [], R: [], M: [] },
      seen: [],
      runs: 0,
      fullClears: 0,
      bestEncounter: -1,
      log: []
    };
    state2.questProgress[questKey] = progress;
  }
  return progress;
}
function addLog(state2, questKey, text, kind) {
  const progress = getQuestProgress(state2, questKey);
  progress.log.unshift({ time: state2.time, text, kind });
  progress.log.length = Math.min(progress.log.length, 30);
}
function addMaterial(state2, key, amount) {
  state2.materials[key] = (state2.materials[key] ?? 0) + amount;
  state2.obtained[key] = (state2.obtained[key] ?? 0) + amount;
}
function isQuestCleared(state2, questKey) {
  const progress = getQuestProgress(state2, questKey);
  return progress.fullClears > 0 || (progress.bestModifiedClear ?? -1) >= 0;
}
function isModifierUnlocked(state2, quest, key) {
  const def = quest.modifiers.find((m) => m.key === key);
  if (!def || def.exclusive) {
    return false;
  }
  const progress = getQuestProgress(state2, quest.key);
  if (def.unlock.kind === "firstClear") {
    return progress.fullClears > 0 || (progress.bestModifiedClear ?? -1) >= 0;
  }
  if (def.unlock.kind === "keys") {
    return hasKeys(state2, def.unlock.keys);
  }
  return (progress.bestModifiedClear ?? -1) >= def.unlock.count;
}
function modifierUnlockText(def) {
  if (def.unlock.kind === "keys") return `Needs one of each key: ${def.unlock.keys.map((k) => requireMaterial(k).name).join(", ")}`;
  return def.unlock.kind === "firstClear" ? "Unlocks after your first full clear" : `Unlocks after a full clear with ${def.unlock.count} modifier${def.unlock.count === 1 ? "" : "s"} active`;
}
function checkProgress(state2) {
  state2.trophies ?? (state2.trophies = {});
  const earned = [];
  for (const def of trophyList) {
    const had = state2.trophies[def.key] ?? -1;
    const tier = tierFor(def, def.value(state2));
    for (let t = had + 1; t <= tier; t++) {
      state2.fame += def.tiers[t].fame;
      earned.push({ key: def.key, tier: t, fame: def.tiers[t].fame });
    }
    if (tier > had) {
      state2.trophies[def.key] = tier;
      invalidateStats();
    }
  }
  state2.milestones ?? (state2.milestones = []);
  const notices = [];
  const announce = (key, text) => {
    if (!state2.milestones.includes(key)) {
      state2.milestones.push(key);
      notices.push(text);
    }
  };
  for (const e of expansions) {
    if (state2.fame >= e.fame && (state2.expansion ?? 0) < e.level) {
      announce("expansion-" + e.level, `${e.fame} fame: you can expand the guild for ${e.gold} gold`);
    }
  }
  for (const u of slotUnlocks) {
    if (u.fame && state2.fame >= u.fame && !(state2.unlocks ?? []).includes(u.key)) {
      announce(u.key, `${u.fame} fame: a ${trackNames[u.track]} can be bought for ${u.gold} gold`);
    }
  }
  for (const { adventurer, ambition } of checkAmbitions(state2)) {
    notices.push(`${adventurer.name} fulfilled an ambition: ${ambitionText(ambition)}. Retire them for ${retireFame(adventurer)} fame`);
  }
  applyGuildUnlocks(state2);
  return { trophies: earned, notices };
}
function applyGuildUnlocks(state2) {
  const g = { ...startingGuild };
  const bought = new Set(state2.unlocks ?? []);
  for (const u of slotUnlocks) {
    if (!bought.has(u.key)) continue;
    if (u.track === "baseSlot") g.maxBaseMaterials++;
    if (u.track === "accessorySlot") g.maxAccessoryBaseMaterials++;
    if (u.track === "decorationSlot") g.maxDecorations++;
    if (u.track === "accessoryDecorationSlot") g.maxAccessoryDecorations++;
    if (u.track === "memberSlot") g.memberSlots++;
    if (u.track === "trophySlot") g.trophySlots++;
  }
  if (Object.keys(state2.trophies ?? {}).length) g.trophySlots++;
  g.trophySlots = Math.min(MAX_TROPHY_SLOTS, g.trophySlots);
  g.memberSlots = Math.max(g.memberSlots, state2.adventurers.length);
  state2.guild = g;
  state2.trophySlots ?? (state2.trophySlots = []);
  state2.trophySlots.length = Math.min(state2.trophySlots.length, g.trophySlots);
}
function nextSlot(state2, track) {
  const bought = state2.unlocks ?? [];
  const unlock = slotUnlocks.find((u) => u.track === track && !bought.includes(u.key));
  if (!unlock) {
    return void 0;
  }
  if (track === "trophySlot" && !Object.keys(state2.trophies ?? {}).length) {
    return { unlock, blocked: "Opens with your first trophy", needsGoldOnly: false };
  }
  if (unlock.expansion && (state2.expansion ?? 0) < unlock.expansion) {
    return { unlock, blocked: `Requires Guild Expansion ${unlock.expansion}`, needsGoldOnly: false, expansion: unlock.expansion };
  }
  if (unlock.fame && state2.fame < unlock.fame) {
    return { unlock, blocked: `Requires ${unlock.fame} fame`, needsGoldOnly: false };
  }
  if (state2.gold < unlock.gold) {
    return { unlock, blocked: `Needs ${unlock.gold} gold`, needsGoldOnly: true };
  }
  return { unlock, blocked: null, needsGoldOnly: true };
}
function buySlot(state2, track) {
  const next = nextSlot(state2, track);
  if (!next || next.blocked) {
    return false;
  }
  state2.gold -= next.unlock.gold;
  state2.unlocks = [...state2.unlocks ?? [], next.unlock.key];
  state2.fame += unlockFame(next.unlock);
  applyGuildUnlocks(state2);
  return true;
}
function nextExpansion(state2) {
  return expansions.find((e) => e.level === (state2.expansion ?? 0) + 1);
}
function expandGuild(state2) {
  const e = nextExpansion(state2);
  if (!e || state2.fame < e.fame || state2.gold < e.gold) {
    return false;
  }
  const applicantsBefore = applicantSlots(state2);
  state2.gold -= e.gold;
  state2.expansion = e.level;
  state2.fame += applicantSlotFame(applicantsBefore, applicantSlots(state2));
  ensureApplicants(state2);
  return true;
}
function equipTrophy(state2, slot, key) {
  state2.trophySlots ?? (state2.trophySlots = []);
  if (key) {
    state2.trophySlots = state2.trophySlots.map((k) => k === key ? null : k);
  }
  while (state2.trophySlots.length <= slot) state2.trophySlots.push(null);
  state2.trophySlots[slot] = key;
  invalidateStats();
  for (const a of state2.adventurers) clampHp(state2, a);
}
function isQuestUnlocked(state2, questKey) {
  if (quests[questKey].portal && !portalOpen(state2)) return false;
  const endless = quests[questKey].endless;
  if (endless) {
    return state2.achievements.includes("clear-" + endless.baseKey);
  }
  const quest = quests[questKey];
  if (!unlockMet(state2.achievements, quest)) {
    return false;
  }
  return state2.fame >= quest.fameToUnlock;
}
function isItemEquipped(state2, itemId) {
  return state2.adventurers.find((a) => Object.values(a.equipment).some((ref) => (ref == null ? void 0 : ref.kind) === "crafted" && ref.id === itemId));
}
function clampHp(state2, adventurer) {
  invalidateStats();
  const max = getAdventurerStats(state2, adventurer).maxHealth;
  adventurer.hp = Math.min(adventurer.hp, max);
}
function unequip(state2, adventurer, slot) {
  const ref = adventurer.equipment[slot];
  if (!ref) {
    return;
  }
  if (ref.kind === "material") {
    state2.materials[ref.key] = (state2.materials[ref.key] ?? 0) + 1;
  }
  delete adventurer.equipment[slot];
  clampHp(state2, adventurer);
}
function levelForPower(power) {
  return 1 + 3 * Math.max(0, power - 1);
}
function itemLevelRequirement(state2, ref) {
  if (ref.kind === "crafted") {
    const item = state2.craftedItems.find((i) => i.id === ref.id);
    return levelForPower(Math.max(1, ...((item == null ? void 0 : item.base) ?? []).map((k) => requireMaterial(k).power)));
  }
  return levelForPower(requireMaterial(ref.key).power);
}
function canEquipInSlot(state2, adventurer, ref, slot, ignoreLevel = false) {
  const item = resolveItemRef(state2, ref);
  if (!item || !itemTypes[item.itemType].slots.includes(slot)) {
    return false;
  }
  if (!ignoreLevel && adventurer.level < itemLevelRequirement(state2, ref)) {
    return false;
  }
  if (slot === "offHand" && isTwoHandedEquipped(state2, adventurer)) {
    return false;
  }
  return true;
}
function equip(state2, adventurer, ref, slot) {
  var _a2;
  if (!canEquipInSlot(state2, adventurer, ref, slot)) {
    return false;
  }
  if (ref.kind === "material") {
    if ((state2.materials[ref.key] ?? 0) < 1) {
      return false;
    }
    state2.materials[ref.key] -= 1;
  } else {
    const other = isItemEquipped(state2, ref.id);
    if (other) {
      return false;
    }
  }
  unequip(state2, adventurer, slot);
  adventurer.equipment[slot] = ref;
  if ((_a2 = state2.guide) == null ? void 0 : _a2.bought) state2.guide.equipped = true;
  const item = resolveItemRef(state2, ref);
  if (slot === "mainHand" && item && itemTypes[item.itemType].twoHanded) {
    unequip(state2, adventurer, "offHand");
  }
  clampHp(state2, adventurer);
  return true;
}
function retireAdventurer(state2, adventurer) {
  if (state2.adventurers.length <= 1 || !state2.adventurers.includes(adventurer)) {
    return false;
  }
  checkAmbitions(state2);
  for (const slot of slotOrder) {
    unequip(state2, adventurer, slot);
  }
  const fame = retireFame(adventurer);
  state2.fame += fame;
  state2.legends = [...state2.legends ?? [], {
    name: adventurer.name,
    classKey: adventurer.classKey,
    level: adventurer.level,
    ambitions: adventurer.ambitions ?? [],
    fame,
    records: adventurer.records
  }];
  state2.adventurers = state2.adventurers.filter((a) => a !== adventurer);
  invalidateStats();
  return fame;
}
function sellItem(state2, itemId) {
  const index = state2.craftedItems.findIndex((i) => i.id === itemId);
  if (index < 0 || isItemEquipped(state2, itemId)) {
    return false;
  }
  state2.gold += getSellValue(state2.craftedItems[index]);
  state2.craftedItems.splice(index, 1);
  return true;
}
function applyMods(base, mods) {
  let flat = 0, increased = 0, more = 1;
  for (const m of mods) {
    if (!m) continue;
    flat += m.flat ?? 0;
    increased += m.increased ?? 0;
    more *= m.more ?? 1;
  }
  return (base + flat) * (1 + increased) * more;
}
function formatMod(label, m) {
  const parts = [];
  if (m.more && m.more !== 1) parts.push(`${Math.round(m.more * 100) / 100}× ${label}`);
  if (m.increased) parts.push(`${Math.round(m.increased * 100)}% increased ${label}`);
  if (m.flat) parts.push(`${m.flat > 0 ? "+" : ""}${Math.round(m.flat * 100) / 100} ${label}`);
  return parts.join(", ");
}
const AILMENT_CHANCE = 0.25;
const BURN_SHARE = 0.2;
const BURN_SECONDS = 2;
const MIN_DOT_DPS = 0.5;
const CHILL_CAP = 0.5;
const SHOCK_CAP = 0.5;
const AILMENT_DECAY = 0.1;
function ailmentSeconds(a) {
  var _a2;
  if (!a) return 0;
  const burn = ((_a2 = a.burns) == null ? void 0 : _a2.reduce((best, b) => Math.max(best, b.remaining), 0)) ?? 0;
  return burn + (a.chill ?? 0) / AILMENT_DECAY + (a.shock ?? 0) / AILMENT_DECAY;
}
function inflict(target, dealt, threshold, rng, bonus = {}) {
  const p = (k) => {
    var _a2;
    return Math.min(1, AILMENT_CHANCE + (((_a2 = bonus.chance) == null ? void 0 : _a2[k]) ?? 0));
  };
  const rolls = Math.max(1, bonus.rolls ?? 1);
  const chance = (k) => 1 - Math.pow(1 - p(k), rolls);
  const cap = bonus.cap ?? 0;
  const effect = 1 + (bonus.effect ?? 0);
  const landed = [];
  const fire = dealt.fire ?? 0, cold = dealt.cold ?? 0, lightning = dealt.lightning ?? 0;
  if (fire > 0 && rng() < chance("burn") && BURN_SHARE * fire * effect >= MIN_DOT_DPS) {
    (target.burns ?? (target.burns = [])).push({ dps: BURN_SHARE * fire * effect, remaining: bonus.burnSeconds ?? BURN_SECONDS });
    landed.push("burn");
  }
  if (cold > 0 && rng() < chance("chill")) {
    target.chill = Math.min(Math.max(CHILL_CAP, cap), (target.chill ?? 0) + effect * cold / Math.max(1, threshold));
    landed.push("chill");
  }
  if (lightning > 0 && rng() < chance("shock")) {
    target.shock = Math.min(Math.max(SHOCK_CAP, cap), (target.shock ?? 0) + effect * lightning / Math.max(1, threshold));
    landed.push("shock");
  }
  return landed;
}
function burnDps(a) {
  var _a2;
  return ((_a2 = a == null ? void 0 : a.burns) == null ? void 0 : _a2.reduce((best, b) => Math.max(best, b.dps), 0)) ?? 0;
}
function tickAilments(a, dt) {
  var _a2;
  if (!a) return 0;
  let damage = 0;
  if ((_a2 = a.burns) == null ? void 0 : _a2.length) {
    damage = burnDps(a) * dt;
    for (const b of a.burns) b.remaining -= dt;
    a.burns = a.burns.filter((b) => b.remaining > 0);
    if (!a.burns.length) delete a.burns;
  }
  if (a.chill) a.chill = Math.max(0, a.chill - AILMENT_DECAY * dt) || void 0;
  if (a.shock) a.shock = Math.max(0, a.shock - AILMENT_DECAY * dt) || void 0;
  if (a.weaken) a.weaken = Math.max(0, a.weaken - AILMENT_DECAY * dt) || void 0;
  if (a.snare) a.snare = Math.max(0, a.snare - AILMENT_DECAY * dt) || void 0;
  if (a.blind) a.blind = Math.max(0, a.blind - AILMENT_DECAY * dt) || void 0;
  if (a.sunder) a.sunder = Math.max(0, a.sunder - AILMENT_DECAY * dt) || void 0;
  if (a.gale) a.gale = Math.max(0, a.gale - AILMENT_DECAY * dt) || void 0;
  return damage;
}
const SLOW_LIMIT = 0.75;
const WEAKEN_CAP = 0.5;
const SNARE_CAP = 0.5;
const slowFactor = (a) => 1 - Math.min(SLOW_LIMIT, ((a == null ? void 0 : a.chill) ?? 0) + ((a == null ? void 0 : a.snare) ?? 0));
const BLIND_CAP = 0.5;
const BLEED_SECONDS = 3;
const blindFactor = (a) => 1 - ((a == null ? void 0 : a.blind) ?? 0);
function tickBleed(a, dt) {
  if (!(a == null ? void 0 : a.bleed)) return 0;
  const t = Math.min(dt, a.bleed.remaining);
  const damage = a.bleed.dps * t;
  a.bleed.remaining -= dt;
  if (a.bleed.remaining <= 0) delete a.bleed;
  return damage;
}
const weakenFactor = (a) => 1 - ((a == null ? void 0 : a.weaken) ?? 0);
const SUNDER_CAP = 0.5;
const GALE_CAP = 0.5;
const sunderFactor = (a) => 1 - ((a == null ? void 0 : a.sunder) ?? 0);
const galeFactor = (a) => 1 - ((a == null ? void 0 : a.gale) ?? 0);
const shockFactor = (a) => 1 + ((a == null ? void 0 : a.shock) ?? 0);
const CORROSION_PER_STACK = 0.01;
const KARMA_DPS = 10;
const REFLECT_SHARE = 0.05;
const ruleInfo = {
  corrosion: { name: "Corrosion", text: `Every hit you take (not blocked) adds a stack of Corrosion for the rest of the run. Each stack lowers evasion, armor, max ward, block chance and resistances by ${100 * CORROSION_PER_STACK}%.` },
  karma: { name: "Karma", text: `Every hit you deal, killing blows included, adds a stack of Karma for the rest of the run. Each stack deals ${KARMA_DPS} physical damage a second to you: armor reduces it, but it can't be blocked or evaded.` },
  reflect: { name: "Reflection", text: `${100 * REFLECT_SHARE}% of the damage of every hit you deal is reflected back at you as a hit of the same damage types. Your evasion rolls against your own accuracy, then block, armor and resistances apply.` },
  noRecovery: { name: "Lifeless", text: "You recover no life or ward during a run: no regen, leech, life on hit or life after encounters, and ward doesn't refill between encounters or from any effect. You start the run with full life and ward." }
};
function activeRules(quest, modifiers = [], encounterIndex = 0, bossLife) {
  const rules = new Set(quest.rules ?? []);
  for (const m of modifiers) {
    for (const r of m.rules ?? []) rules.add(r);
    if (!m.rite) continue;
    if (bossLife !== void 0) {
      for (const r of ritePhase(m.rite, bossLife)) rules.add(r);
      continue;
    }
    const step = m.rite.schedule.filter((s) => s.from <= encounterIndex).pop();
    for (const r of (step == null ? void 0 : step.rules) ?? []) rules.add(r);
  }
  return rules;
}
function ritePhase(rite, life) {
  const index = Math.min(rite.bossPhases.length - 1, Math.floor((1 - Math.max(0, Math.min(1, life))) * rite.bossPhases.length));
  return rite.bossPhases[Math.max(0, index)];
}
function corrosionFactor(stacks) {
  return Math.max(0, 1 - CORROSION_PER_STACK * stacks);
}
function corrode(stats, stacks) {
  if (stacks <= 0) return stats;
  const f = corrosionFactor(stacks);
  const resist = { ...stats.resist };
  for (const [e, v] of Object.entries(stats.resist)) resist[e] = v > 0 ? v * f : v;
  return { ...stats, evasion: stats.evasion * f, armor: stats.armor * f, maxWard: stats.maxWard * f, blockChance: stats.blockChance * f, resist };
}
const SALVAGE_EXPANSION = 4;
const SALVAGE_MAX = 4;
const SALVAGE_LEVEL_GOLD = [0, 1e4, 4e4, 8e4, 16e4];
const SALVAGE_TIER_COST = [0, 10, 20, 50, 100, 200, 500, 1e3, 2e3, 5e3, 1e4, 2e4, 5e4, 1e5, 2e5, 5e5];
function salvageLevel(state2) {
  return state2.salvageLevel ?? 0;
}
function salvageVisible(state2) {
  return salvageLevel(state2) > 0 || (state2.expansion ?? 0) >= SALVAGE_EXPANSION;
}
function nextSalvageLevel(state2) {
  const level = salvageLevel(state2) + 1;
  if (level > SALVAGE_MAX) return void 0;
  const expansion = SALVAGE_EXPANSION + level - 1;
  const gold = SALVAGE_LEVEL_GOLD[level];
  const blocked = (state2.expansion ?? 0) < expansion ? `Requires Guild Expansion ${expansion}` : state2.gold < gold ? `Needs ${gold} gold` : null;
  return { level, gold, expansion, blocked };
}
function upgradeSalvage(state2) {
  const next = nextSalvageLevel(state2);
  if (!next || next.blocked) return false;
  state2.gold -= next.gold;
  state2.salvageLevel = next.level;
  return true;
}
function salvageCost(materials2) {
  if (!materials2.length) return 0;
  const top = Math.max(...materials2.map((k) => SALVAGE_TIER_COST[Math.min(SALVAGE_TIER_COST.length - 1, requireMaterial(k).power)]));
  return top * Math.pow(2, materials2.length - 1);
}
function itemMaterials(state2, itemId) {
  const item = state2.craftedItems.find((i) => i.id === itemId);
  return item ? [...item.base, ...item.decorations] : [];
}
function salvageBlocked(state2, itemId, picks) {
  const level = salvageLevel(state2);
  if (!level) return "Build the salvage yard first";
  const item = state2.craftedItems.find((i) => i.id === itemId);
  if (!item) return "That item is gone";
  if (isItemEquipped(state2, itemId)) return "Unequip it first";
  if (!picks.length) return "Pick a material to recover";
  if (picks.length > level) return `The yard recovers up to ${level} material${level === 1 ? "" : "s"}`;
  const all = itemMaterials(state2, itemId);
  const cost = salvageCost(picks.map((i) => all[i]));
  if (state2.gold < cost) return `Needs ${cost} gold`;
  return null;
}
function salvageItem(state2, itemId, picks) {
  const blocked = salvageBlocked(state2, itemId, picks);
  if (blocked) return blocked;
  const all = itemMaterials(state2, itemId);
  const materials2 = [...new Set(picks)].map((i) => all[i]).filter(Boolean);
  state2.gold -= salvageCost(materials2);
  state2.craftedItems = state2.craftedItems.filter((i) => i.id !== itemId);
  for (const key of materials2) state2.materials[key] = (state2.materials[key] ?? 0) + 1;
  return materials2;
}
const BENCH_PRICE = 20;
const STOCK_KINDS = ["weapon", "armor", "armor", "accessory"];
const WEAPONS = { str: ["sword", "axe", "greatsword"], dex: ["dagger", "bow"], int: ["wand", "staff"] };
const DEFENSE = { str: "armor", dex: "evasion", int: "ward" };
const OFFENSE = {
  str: ["physicalDamage"],
  dex: ["physicalDamage", "accuracy", "critChance"],
  int: ["fireDamage", "coldDamage", "lightningDamage", "increasedElementalDamage"]
};
const ARMOR = ["helmet", "bodyArmor", "gloves", "boots", "shield"];
const ACCESSORIES = ["ring", "amulet", "belt"];
let commonTier;
function sellable(key) {
  if (!commonTier) {
    commonTier = {};
    const order = ["C", "U", "R", "M"];
    for (const q of questOrder) {
      order.forEach((t, i) => {
        for (const entry of quests[q].pools[t]) commonTier[entry.material] = Math.min(commonTier[entry.material] ?? 9, i);
      });
    }
  }
  return (commonTier[key] ?? 9) <= 2;
}
function shopTierCap(state2) {
  let cap = 1;
  for (const key of Object.keys(state2.obtained)) {
    if ((state2.obtained[key] ?? 0) > 0) cap = Math.max(cap, requireMaterial(key).power);
  }
  return cap;
}
function priceCoefficient(level) {
  return 0.2 + 1.8 * Math.min(1, Math.max(0, (level - 1) / 59));
}
function shopPrice(materials2, level) {
  const salvage = materials2.reduce((sum, k) => sum + SALVAGE_TIER_COST[Math.min(SALVAGE_TIER_COST.length - 1, requireMaterial(k).power)], 0);
  return Math.max(1, Math.round(salvage / 2 * priceCoefficient(level)));
}
function pick(list2, weight, rng) {
  const total = list2.reduce((s, t) => s + weight(t), 0);
  if (total <= 0) return void 0;
  let r = rng() * total;
  for (const t of list2) {
    r -= weight(t);
    if (r < 0) return t;
  }
  return list2[list2.length - 1];
}
function rollShopItem(state2, hero, kind, rng = Math.random) {
  const core = damageStats(classes[hero.classKey]);
  const main = core[Math.floor(rng() * core.length)];
  const wanted = /* @__PURE__ */ new Set([...core.map((c) => DEFENSE[c]), ...core.flatMap((c) => OFFENSE[c]), "maxHealth"]);
  const maxPower = Math.min(shopTierCap(state2), Math.max(1, Math.floor((hero.level - 1) / 3) + 1));
  const candidates2 = materialOrder.filter((k) => !isPremium(k) && sellable(k) && requireMaterial(k).power <= maxPower && levelForPower(requireMaterial(k).power) <= hero.level);
  const types = kind === "weapon" ? rng() < 0.75 ? WEAPONS[main] : itemTypeOrder.filter((t) => itemTypes[t].tags.includes("weapon")) : kind === "armor" ? ARMOR : ACCESSORIES;
  for (let attempt = 0; attempt < 8; attempt++) {
    const itemType = types[Math.floor(rng() * types.length)];
    const weight = (stats, power) => (stats.some((s) => wanted.has(s)) ? 4 : 1) * Math.pow(2, power - maxPower);
    const bases = candidates2.filter((k) => getBaseStats(requireMaterial(k), itemType));
    if (!bases.length) continue;
    const limit = getBaseLimit(state2, itemType);
    const count = Math.max(1, limit - (rng() < 0.5 ? 1 : 0));
    const base = [];
    for (let i = 0; i < count; i++) {
      const k = pick(bases, (k2) => weight(Object.keys(getBaseStats(requireMaterial(k2), itemType).stats), requireMaterial(k2).power), rng);
      if (k) base.push(k);
    }
    const supported = Math.min(getDecorationLimit(state2, itemType), Math.max(...base.map((k) => getBaseStats(requireMaterial(k), itemType).maxDecorations)));
    const decoPower = maxDecorationPower(itemType, base);
    const decos = candidates2.filter((k) => getDecorationStats(requireMaterial(k), itemType) && requireMaterial(k).power <= decoPower);
    const decorations = [];
    for (let i = 0; i < supported && decos.length; i++) {
      const k = pick(decos, (k2) => weight(Object.keys(getDecorationStats(requireMaterial(k2), itemType)), requireMaterial(k2).power), rng);
      if (k) decorations.push(k);
    }
    const preview = previewCraft(itemType, base, decorations);
    if (!preview) continue;
    return { itemType, base, decorations, name: preview.name, power: preview.power, kind, price: shopPrice([...base, ...decorations], hero.level) };
  }
  return void 0;
}
function shopStock(state2, hero) {
  state2.shop ?? (state2.shop = {});
  let stock = state2.shop[hero.id];
  if (!stock) {
    stock = STOCK_KINDS.map((kind) => rollShopItem(state2, hero, kind) ?? null);
    state2.shop[hero.id] = stock;
  }
  return stock;
}
let holdLevelRestock = null;
function setHoldLevelRestock(heroId) {
  holdLevelRestock = heroId;
}
function levelUpRestock(state2, heroId) {
  var _a2;
  if (!((_a2 = state2.shop) == null ? void 0 : _a2[heroId])) return;
  if (holdLevelRestock === heroId) {
    (state2.shopFreeRefresh ?? (state2.shopFreeRefresh = {}))[heroId] = true;
  } else {
    delete state2.shop[heroId];
    if (state2.shopFreeRefresh) delete state2.shopFreeRefresh[heroId];
  }
}
function shopRefreshCost(state2, hero) {
  var _a2;
  if ((_a2 = state2.shopFreeRefresh) == null ? void 0 : _a2[hero.id]) return 0;
  const stock = shopStock(state2, hero);
  return Math.max(2, Math.round(0.25 * stock.reduce((sum, i) => sum + (i && !i.sold ? i.price : 0), 0)));
}
function refreshShop(state2, hero) {
  const cost = shopRefreshCost(state2, hero);
  if (state2.gold < cost) return false;
  state2.gold -= cost;
  state2.shop[hero.id] = STOCK_KINDS.map((kind) => rollShopItem(state2, hero, kind) ?? null);
  if (state2.shopFreeRefresh) delete state2.shopFreeRefresh[hero.id];
  return true;
}
function buyShopItem(state2, hero, index) {
  const stock = shopStock(state2, hero);
  const offer = stock[index];
  if (!offer || offer.sold) return "Nothing to buy there.";
  if (state2.gold < offer.price) return `Needs ${offer.price} gold.`;
  state2.gold -= offer.price;
  const item = { id: "item" + state2.nextId++, itemType: offer.itemType, name: offer.name, base: [...offer.base], decorations: [...offer.decorations], power: offer.power };
  state2.craftedItems.push(item);
  stock[index] = { ...offer, sold: true };
  state2.guide = { ...state2.guide, bought: true };
  return item;
}
function restockSold(state2, hero) {
  var _a2;
  const stock = (_a2 = state2.shop) == null ? void 0 : _a2[hero.id];
  if (!stock) return 0;
  let n = 0;
  stock.forEach((offer, i) => {
    if (offer == null ? void 0 : offer.sold) {
      stock[i] = rollShopItem(state2, hero, offer.kind) ?? null;
      n++;
    }
  });
  return n;
}
function hasBench(state2) {
  return state2.benchOwned !== false;
}
function buyBench(state2) {
  if (hasBench(state2) || state2.gold < BENCH_PRICE) return false;
  state2.gold -= BENCH_PRICE;
  state2.benchOwned = true;
  return true;
}
const REFLECT_SOURCE = ":reflect";
const TICK_SECONDS = 1 / 60;
function assignQuest(state2, adventurer, questKey) {
  var _a2;
  if (!isQuestUnlocked(state2, questKey)) {
    return;
  }
  const wasAssigned = (_a2 = adventurer.assignment) == null ? void 0 : _a2.questKey;
  adventurer.assignment = { questKey };
  if (adventurer.activity.kind === "idle") {
    startRun(state2, adventurer);
  } else if (adventurer.activity.kind === "traveling" && wasAssigned !== questKey) {
    adventurer.activity = { kind: "idle" };
    startRun(state2, adventurer);
  } else if (adventurer.activity.kind === "fighting" && wasAssigned !== questKey) {
    startRest(state2, adventurer, adventurer.activity.questKey, false);
  }
}
function recall(state2, adventurer) {
  adventurer.assignment = null;
  if (adventurer.activity.kind === "traveling") {
    adventurer.activity = { kind: "idle" };
  } else if (adventurer.activity.kind === "fighting") {
    startRest(state2, adventurer, adventurer.activity.questKey, false);
  }
}
function runOutcome(run) {
  const quest = quests[run.questKey];
  if (run.defeatedAt !== void 0) return `defeated at encounter ${run.defeatedAt + 1}`;
  if (quest && run.cleared >= quest.encounters.length - 1) return "full clear";
  return run.cleared >= 0 ? `turned back after encounter ${run.cleared + 1}` : "turned back";
}
function getStopAt(adventurer, questKey) {
  var _a2;
  const last2 = quests[questKey].encounters.length - 1;
  return Math.min(((_a2 = adventurer.stopPoints) == null ? void 0 : _a2[questKey]) ?? last2, last2);
}
function setStopAt(adventurer, questKey, index) {
  var _a2;
  adventurer.stopPoints = { ...adventurer.stopPoints, [questKey]: index };
  if (((_a2 = adventurer.run) == null ? void 0 : _a2.questKey) === questKey) {
    adventurer.run.stopAt = index;
  }
}
function startRun(state2, adventurer) {
  var _a2, _b2;
  if (!adventurer.assignment) {
    adventurer.activity = { kind: "idle" };
    return;
  }
  const quest = quests[adventurer.assignment.questKey];
  const progress = getQuestProgress(state2, quest.key);
  const modifiers = getActiveModifiers(state2, adventurer, quest);
  const fee = getEntryFee(quest, modifiers);
  if (state2.gold < fee) {
    adventurer.activity = { kind: "idle", reason: `Needs ${fee} gold for the entry fee` };
    return;
  }
  state2.gold -= fee;
  progress.runs++;
  const previous = ((_a2 = adventurer.run) == null ? void 0 : _a2.questKey) === quest.key ? adventurer.run.number : 0;
  if ((_b2 = adventurer.run) == null ? void 0 : _b2.stats) {
    adventurer.previousRunStats = adventurer.run.stats;
    adventurer.previousRun = { questKey: adventurer.run.questKey, number: adventurer.run.number, outcome: runOutcome(adventurer.run) };
  }
  adventurer.run = { questKey: quest.key, number: previous + 1, cleared: -1, stopAt: getStopAt(adventurer, quest.key), loot: {}, gold: 0, xp: 0, fee, modifiers };
  const contract = findContract(state2, adventurer.activeContract, adventurer);
  if ((contract == null ? void 0 : contract.questKey) === quest.key && adventurer.activeContract) {
    adventurer.run.contract = { ...adventurer.activeContract };
  }
  if (quest.travelSeconds > 0) {
    adventurer.activity = { kind: "traveling", questKey: quest.key, remaining: quest.travelSeconds, total: quest.travelSeconds };
  } else {
    startEncounter(state2, adventurer, quest, 0);
  }
}
const HIT_STEP = 1.5;
const damageScaleCache = /* @__PURE__ */ new Map();
function topHit(quest, index, key) {
  const s = getMonsterStats(quest, index, key, [], false);
  return Math.max(0, ...(monsterKit(key) ?? []).map((k) => s.damage * s.baseShare * kitHit(k) * (k.damage ?? 1) * (k.hits ?? 1)));
}
function encounterDamageScale(quest, index) {
  if (quest.endless) return 1;
  let scales = damageScaleCache.get(quest.key);
  if (!scales) {
    const enc = quest.encounters;
    const tops = enc.map((e, i) => Math.max(...e.monsters.map((m) => topHit(quest, i, m))));
    const lastU = enc.map((e) => e.tier).lastIndexOf("U");
    const boss = enc.map((e) => e.tier).lastIndexOf("R");
    const ramp = (i) => lastU > 0 ? Math.min(1, i / lastU) : 1;
    const solve = (tier, upTo, target) => {
      const idx = enc.map((e, i) => e.tier === tier && i < upTo ? i : -1).filter((i) => i >= 0);
      const best = (f) => Math.max(0, ...idx.map((i) => tops[i] * (1 + (f - 1) * ramp(i))));
      if (!idx.length || best(1) >= target) return 1;
      let lo = 1, hi = 1;
      while (best(hi) < target && hi < 64) hi *= 2;
      for (let k = 0; k < 40; k++) {
        const mid = (lo + hi) / 2;
        if (best(mid) < target) lo = mid;
        else hi = mid;
      }
      return hi;
    };
    const fU = boss >= 0 ? solve("U", enc.length, tops[boss] / HIT_STEP) : 1;
    const maxU = Math.max(0, ...enc.map((e, i) => e.tier === "U" ? tops[i] * (1 + (fU - 1) * ramp(i)) : 0));
    const fC = lastU >= 0 ? solve("C", boss >= 0 ? boss : enc.length, maxU / HIT_STEP) : 1;
    scales = enc.map((e, i) => e.tier === "U" ? 1 + (fU - 1) * ramp(i) : e.tier === "C" ? 1 + (fC - 1) * ramp(i) : 1);
    damageScaleCache.set(quest.key, scales);
  }
  return scales[index] ?? 1;
}
const COMMON_HP_SCALE = 2;
const LEGENDARY_HP_SCALE = 2;
function encounterHpScale(quest, index, monsterKey) {
  var _a2, _b2;
  if (quest.endless) return 1;
  if (((_a2 = quest.boss) == null ? void 0 : _a2.monster) === monsterKey) return LEGENDARY_HP_SCALE;
  const tier = (_b2 = quest.encounters[index]) == null ? void 0 : _b2.tier;
  if (tier !== "C" && tier !== "U") return 1;
  if (quest.key !== "brambleRoad") return COMMON_HP_SCALE;
  const lastC = quest.encounters.map((e) => e.tier).lastIndexOf("C");
  return 1 + (COMMON_HP_SCALE - 1) * Math.min(1, index / Math.max(1, lastC));
}
function averageAttack(quest, index, key) {
  const s = getMonsterStats(quest, index, key);
  const kit = (monsterKit(key) ?? []).filter((k) => kitHit(k) > 0);
  if (!kit.length) return { hit: s.damage, accuracy: s.accuracy };
  const abilities = kit.filter((k) => !k.basic), basics = kit.filter((k) => k.basic);
  const abilityShare = Math.min(1, abilities.reduce((sum, k) => sum + 1 / Math.max(1, k.every), 0));
  const weighted = [
    ...abilities.map((k) => ({ k, w: 1 / Math.max(1, k.every) })),
    ...basics.map((k) => ({ k, w: (1 - abilityShare) / basics.length }))
  ];
  const total = weighted.reduce((sum, e) => sum + e.w, 0) || 1;
  const avg = (f) => weighted.reduce((sum, e) => sum + e.w * f(e.k), 0) / total;
  return { hit: avg((k) => s.damage * s.baseShare * kitHit(k) * (k.damage ?? 1)), accuracy: avg((k) => s.accuracy * (k.accuracy ?? 1)) };
}
const typicalCache = /* @__PURE__ */ new Map();
function typicalAttack(level) {
  const cached2 = typicalCache.get(level);
  if (cached2) return cached2;
  const all = [];
  for (const key of questOrder) {
    const quest = quests[key];
    if (quest.endless || quest.portal) continue;
    quest.encounters.forEach((e, i) => {
      for (const m of e.monsters) all.push({ level: encounterLevel(quest, i), ...averageAttack(quest, i, m) });
    });
  }
  const off = (l) => Math.max(0, Math.abs(l - level) - 1);
  const gap2 = Math.min(...all.map((a) => off(a.level)));
  const near = all.filter((a) => off(a.level) === gap2);
  const n = Math.max(1, near.length);
  const out = { hit: near.reduce((sum, a) => sum + a.hit, 0) / n, accuracy: near.reduce((sum, a) => sum + a.accuracy, 0) / n };
  typicalCache.set(level, out);
  return out;
}
const OPENING_SCALE = 0.5;
function openingScale(quest, index, monsterKey) {
  var _a2;
  if (quest.key !== "brambleRoad" || ((_a2 = quest.boss) == null ? void 0 : _a2.monster) === monsterKey) return 1;
  const last2 = quest.encounters.length - 1;
  return OPENING_SCALE + (1 - OPENING_SCALE) * Math.min(1, index / Math.max(1, last2));
}
function getMonsterStats(quest, encounterIndex, monsterKey, modifierKeys = [], ladder2 = true) {
  var _a2;
  const power = encounterPower(quest, encounterIndex);
  const def = monsters[monsterKey];
  const mods = getModifierDefs(quest, modifierKeys);
  const mod = (stat, base) => applyMods(base, mods.map((m) => m.monster[stat]));
  const scale = ((_a2 = quest.boss) == null ? void 0 : _a2.monster) === monsterKey || mods.some((m) => {
    var _a3;
    return ((_a3 = m.rite) == null ? void 0 : _a3.boss) === monsterKey;
  }) ? 1 : quest.monsterScale ?? 1;
  const ladderScale = ladder2 ? encounterDamageScale(quest, encounterIndex) * openingScale(quest, encounterIndex, monsterKey) : 1;
  const damage = monsterBaseline.damage * power * def.damage * scale * ladderScale;
  const shares = { ...def.damageTypes ?? { physical: 1 } };
  let added = 0;
  const addedTypes = {};
  for (const m of mods) {
    for (const [element, share] of Object.entries(m.addedDamage ?? {})) {
      shares[element] = (shares[element] ?? 0) + share;
      addedTypes[element] = (addedTypes[element] ?? 0) + share;
      added += share;
    }
  }
  const total = 1 + added;
  for (const type of Object.keys(shares)) {
    shares[type] = shares[type] / total;
  }
  return {
    name: def.name,
    hp: Math.round(mod("hp", monsterBaseline.hp * power * def.hp * scale * encounterHpScale(quest, encounterIndex, monsterKey))),
    damage: mod("damage", damage) * total,
    damageTypes: shares,
    attacksPerSecond: mod("attacksPerSecond", def.attacksPerSecond * openingScale(quest, encounterIndex, monsterKey)),
    armor: mod("armor", monsterBaseline.armor * power * def.armor),
    accuracy: mod("accuracy", monsterBaseline.accuracy * Math.pow(power, ACCURACY_GROWTH) * (def.accuracy ?? 1) * openingScale(quest, encounterIndex, monsterKey)),
    // Evasion grows slower than power so hero accuracy keeps up and multihits stay in reach.
    evasion: mod("evasion", monsterBaseline.evasion * Math.pow(power, EVASION_GROWTH) * (def.evasion ?? 1)),
    resist: def.resist ?? {},
    baseShare: 1 / total,
    addedTypes: Object.fromEntries(Object.entries(addedTypes).map(([k, v]) => [k, v / total]))
  };
}
function getModifierDefs(quest, keys) {
  return keys.map((k) => quest.modifiers.find((m) => m.key === k)).filter((m) => !!m);
}
function getRewardBonuses(quest, modifierKeys) {
  const total = { extraRewardChance: 0, rarityUpgradeChance: 0, bonusRareChance: 0, goldXpMultiplier: 1 };
  for (const m of getModifierDefs(quest, modifierKeys)) {
    total.extraRewardChance += m.bonuses.extraRewardChance ?? 0;
    total.rarityUpgradeChance += m.bonuses.rarityUpgradeChance ?? 0;
    total.bonusRareChance += m.bonuses.bonusRareChance ?? 0;
    total.goldXpMultiplier *= m.bonuses.goldXpMultiplier ?? 1;
  }
  return total;
}
function getEntryFee(quest, modifierKeys) {
  const weight = getModifierDefs(quest, modifierKeys).reduce((sum, m) => sum + m.feeWeight, 0);
  return quest.entryFee + weight * Math.round(5 * quest.basePower);
}
function splitDamage(total, shares) {
  const out = {};
  for (const [type, share] of Object.entries(shares)) {
    out[type] = total * share;
  }
  return out;
}
function encounterLineup(quest, index, modifierKeys = []) {
  const base = quest.encounters[index].monsters;
  return getModifierDefs(quest, modifierKeys).some((m) => m.duplicate) ? base.flatMap((k) => [k, k]) : [...base];
}
const ENTRANCE_SECONDS = 0.85;
let encounterRng = Math.random;
function startEncounter(state2, adventurer, quest, index, bonus = false, boss) {
  var _a2, _b2, _c2, _d;
  const progress = getQuestProgress(state2, quest.key);
  if (!quest.endless && !progress.seen.includes(index)) {
    progress.seen.push(index);
  }
  if (boss && boss === ((_a2 = quest.boss) == null ? void 0 : _a2.monster)) progress.bossFought = true;
  const lineup = boss ? [boss] : encounterLineup(quest, index, (_b2 = adventurer.run) == null ? void 0 : _b2.modifiers);
  const monsterStates = lineup.map((key) => {
    var _a3;
    const stats2 = getMonsterStats(quest, index, key, (_a3 = adventurer.run) == null ? void 0 : _a3.modifiers);
    return { key, hp: stats2.hp, maxHp: stats2.hp, cooldown: encounterRng() / stats2.attacksPerSecond };
  });
  monsterStates.forEach((m, slot) => {
    m.slot = slot;
  });
  const stats = getCachedStats(state2, adventurer);
  const lifeless = activeRules(quest, getModifierDefs(quest, ((_c2 = adventurer.run) == null ? void 0 : _c2.modifiers) ?? []), index).has("noRecovery");
  if (!lifeless || index === 0 && !bonus && !boss) adventurer.ward = corrode(stats, ((_d = adventurer.run) == null ? void 0 : _d.corrosion) ?? 0).maxWard;
  adventurer.activity = { kind: "fighting", questKey: quest.key, encounterIndex: index, monsters: monsterStates, cooldown: encounterRng() / stats.attacksPerSecond, lineup, entrance: ENTRANCE_SECONDS, ...bonus ? { bonus } : {}, ...boss ? { boss } : {} };
}
function startRest(state2, adventurer, questKey, defeated) {
  const stats = getCachedStats(state2, adventurer);
  adventurer.hp = Math.max(0, adventurer.hp);
  adventurer.activity = { kind: "resting", questKey, remaining: getRestSeconds(stats.maxHealth, adventurer.hp, defeated), defeated };
}
function heal(adventurer, maxHealth, amount) {
  if (amount > 0 && adventurer.hp > 0) {
    const before = adventurer.hp;
    adventurer.hp = Math.min(maxHealth, adventurer.hp + amount);
    return Math.max(0, adventurer.hp - before);
  }
  return 0;
}
function emptyRunStats() {
  return {
    fightSeconds: 0,
    kills: 0,
    attacks: 0,
    attacksLanded: 0,
    hits: 0,
    crits: 0,
    dealt: {},
    incomingAttacks: 0,
    attacksDodged: 0,
    incomingHits: 0,
    blocks: 0,
    taken: {},
    wardAbsorbed: 0,
    preventedArmor: 0,
    preventedResist: 0,
    preventedBlock: 0,
    healed: { regen: 0, leech: 0, onHit: 0, encounter: 0 },
    wardGained: 0,
    lowestHp: 1
  };
}
function runStats(adventurer, questKey) {
  const run = adventurer.run;
  if (!run || run.questKey !== questKey) return void 0;
  run.stats ?? (run.stats = emptyRunStats());
  return run.stats;
}
const elementsOf = (damage) => ["fire", "cold", "lightning"].filter((e) => damage[e]);
function addDamage(target, parts, total) {
  const sum = Object.values(parts).reduce((a, b) => a + (b ?? 0), 0);
  if (sum <= 0 || total <= 0) return;
  for (const [type, value] of Object.entries(parts)) {
    target[type] = (target[type] ?? 0) + value * total / sum;
  }
}
const FAST_REST_LEVEL = 10;
function restDurationScale(level) {
  return Math.min(1, 0.2 + 0.8 * Math.max(0, level - 1) / (FAST_REST_LEVEL - 1));
}
function restSpeed(maxHealth, lifeRegen, level) {
  return (1 + Math.max(0, lifeRegen) * 15 / Math.max(1, maxHealth)) / restDurationScale(level);
}
function getRestSeconds(maxHealth, hp, defeated) {
  const base = 15 * (maxHealth - hp) / maxHealth;
  return defeated ? base * 2 + 10 : base;
}
function getRecoverCost(state2, adventurer) {
  if (adventurer.activity.kind !== "resting") {
    return 0;
  }
  const stats = getCachedStats(state2, adventurer);
  const secondsLeft = adventurer.activity.remaining / restSpeed(stats.maxHealth, stats.lifeRegen, adventurer.level);
  return Math.max(1, Math.ceil(secondsLeft * 0.4 * adventurer.level));
}
function getAutoRecoverBudget(adventurer) {
  const share = adventurer.autoRecover ?? 0;
  const run = adventurer.run;
  if (!share || !run) {
    return 0;
  }
  return Math.floor(share * Math.max(0, run.gold - (run.fee ?? quests[run.questKey].entryFee)));
}
function recoverInstantly(state2, adventurer) {
  const cost = getRecoverCost(state2, adventurer);
  if (adventurer.activity.kind !== "resting" || state2.gold < cost) {
    return false;
  }
  state2.gold -= cost;
  adventurer.activity.remaining = 0;
  return true;
}
function rollPool(pool, rng) {
  const total = pool.reduce((sum, e) => sum + e.weight, 0);
  let roll = rng() * total;
  for (const entry2 of pool) {
    roll -= entry2.weight;
    if (roll < 0) {
      return { entry: entry2, amount: entry2.min + Math.floor(rng() * (entry2.max - entry2.min + 1)) };
    }
  }
  const entry = pool[pool.length - 1];
  return { entry, amount: entry.min };
}
function gainXp(state2, adventurer, xp) {
  adventurer.xp += xp;
  let leveled = false;
  while (adventurer.level < levelCap && adventurer.xp >= totalXpForLevel(adventurer.level + 1)) {
    const before = getCachedStats(state2, adventurer).maxHealth;
    adventurer.level++;
    invalidateStats();
    adventurer.hp += getCachedStats(state2, adventurer).maxHealth - before;
    leveled = true;
  }
  if (leveled) levelUpRestock(state2, adventurer.id);
  return leveled;
}
const dropEvents = [];
function drainDropEvents() {
  return dropEvents.splice(0);
}
function devDrop(state2, tier) {
  const options = questOrder.flatMap((q) => quests[q].pools[tier].map((entry) => ({ questKey: q, material: entry.material })));
  if (!options.length) {
    return;
  }
  const pick2 = options[Math.floor(Math.random() * options.length)];
  const first = !((state2.obtained[pick2.material] ?? 0) > 0);
  addMaterial(state2, pick2.material, 1);
  dropEvents.push({ material: pick2.material, tier, questKey: pick2.questKey, first, owned: state2.materials[pick2.material] ?? 0 });
}
function devPremiumDrop(state2) {
  const options = questOrder.flatMap((q) => ["C", "U", "R"].flatMap((t) => quests[q].pools[t].map((entry) => ({ questKey: q, material: premiumKey(entry.material), tier: t }))));
  const pick2 = options[Math.floor(Math.random() * options.length)];
  if (!pick2) return;
  const first = !((state2.obtained[pick2.material] ?? 0) > 0);
  addMaterial(state2, pick2.material, 1);
  dropEvents.push({ material: pick2.material, tier: pick2.tier, questKey: pick2.questKey, first, owned: state2.materials[pick2.material] ?? 0, premium: true });
}
const combatEvents = [];
function drainCombatEvents() {
  return combatEvents.splice(0);
}
function hasPendingCombatEvents(adventurerId) {
  return combatEvents.some((e) => e.adventurerId === adventurerId);
}
let leaveGate = () => true;
function setLeaveGate(gate) {
  leaveGate = gate;
}
function pushCombat(e) {
  combatEvents.push(e);
  if (combatEvents.length > 400) combatEvents.splice(0, combatEvents.length - 400);
}
function mainType(damage) {
  let best = "physical", most = -1;
  for (const [type, value] of Object.entries(damage)) {
    if ((value ?? 0) > most) {
      most = value ?? 0;
      best = type;
    }
  }
  return best;
}
const upgradeTier = { C: "U", U: "R", R: "M", M: void 0 };
function rollCount(chance, rng) {
  return Math.floor(chance) + (rng() < chance - Math.floor(chance) ? 1 : 0);
}
const ARMOR_SLOTS = ["body", "head", "gloves", "boots"];
function winBoss(state2, adventurer, quest) {
  var _a2;
  const boss = quest.boss;
  const r = records(adventurer);
  if (!r.bosses.includes(quest.key)) r.bosses.push(quest.key);
  const first = !((state2.obtained[boss.legendary] ?? 0) > 0);
  addMaterial(state2, boss.legendary, 1);
  dropEvents.push({ material: boss.legendary, tier: "M", questKey: quest.key, first, owned: state2.materials[boss.legendary] ?? 0, legendary: true });
  if (((_a2 = adventurer.run) == null ? void 0 : _a2.questKey) === quest.key) {
    adventurer.run.loot[boss.legendary] = (adventurer.run.loot[boss.legendary] ?? 0) + 1;
  }
  addLog(state2, quest.key, `${adventurer.name} defeated ${monsters[boss.monster].name}: +1 ${requireMaterial(boss.legendary).name} (legendary)`, "loot");
}
function completeContract(state2, adventurer, quest) {
  const run = adventurer.run;
  const ref = run == null ? void 0 : run.contract;
  const contract = findContract(state2, ref, adventurer);
  if (!run || !ref || !contract || contract.questKey !== quest.key || !contract.mods.every((m) => {
    var _a2;
    return (_a2 = run.modifiers) == null ? void 0 : _a2.includes(m);
  })) {
    return;
  }
  if (contract.reward.material) {
    const key = contract.reward.material;
    const first = !((state2.obtained[key] ?? 0) > 0);
    addMaterial(state2, key, 1);
    dropEvents.push({ material: key, tier: "M", questKey: quest.key, first, owned: state2.materials[key] ?? 0 });
    run.loot[key] = (run.loot[key] ?? 0) + 1;
  }
  state2.gold += contract.reward.gold;
  run.gold += contract.reward.gold;
  state2.fame += contract.reward.fame ?? 0;
  const parts = [contract.reward.material ? `+1 ${requireMaterial(contract.reward.material).name}` : "", contract.reward.fame ? `+${contract.reward.fame} fame` : "", `+${contract.reward.gold} gold`].filter(Boolean);
  addLog(state2, quest.key, `${adventurer.name} completed a ${ref.kind} contract: ${parts.join(", ")}`, "loot");
  contractEvents.push({ adventurerId: adventurer.id, kind: ref.kind, text: parts.join(", ") });
  if (ref.kind === "personal") {
    adventurer.contract = rollPersonalContract(state2, adventurer, rng0);
  } else {
    const list2 = state2.guildContracts ?? [];
    const i = list2.findIndex((c) => c.id === ref.id);
    const next = rollGuildContract(state2, rng0);
    if (i >= 0) {
      if (next) list2[i] = next;
      else list2.splice(i, 1);
    }
  }
  adventurer.activeContract = null;
  delete run.contract;
}
const rng0 = () => Math.random();
const contractEvents = [];
function drainContractEvents() {
  return contractEvents.splice(0);
}
function winEncounter(state2, adventurer, quest, index, rng, bonus = false, count = quest.encounters[index].monsters.length, boss) {
  var _a2, _b2, _c2, _d;
  const progress = getQuestProgress(state2, quest.key);
  const encounter = quest.encounters[index];
  const tier = bonus || boss ? "R" : encounter.tier;
  const power = encounterPower(quest, index);
  const run = ((_a2 = adventurer.run) == null ? void 0 : _a2.questKey) === quest.key ? adventurer.run : void 0;
  if (quest.endless) {
    progress.bestEncounter = Math.max(progress.bestEncounter, index);
    const baseKey = quest.endless.baseKey;
    adventurer.endlessBest = { ...adventurer.endlessBest, [baseKey]: Math.max(((_b2 = adventurer.endlessBest) == null ? void 0 : _b2[baseKey]) ?? -1, index) };
    if (run) run.cleared = index;
    if ((index + 1) % ENDLESS_PATTERN.length === 0) {
      addLog(state2, quest.key, `${adventurer.name} cleared endless encounter ${index + 1}`, "win");
    }
    return;
  }
  const rite = (_c2 = getModifierDefs(quest, (run == null ? void 0 : run.modifiers) ?? []).find((m) => m.rite)) == null ? void 0 : _c2.rite;
  if (boss && rite && boss === rite.boss) {
    winRite(state2, adventurer, quest, rite, rng);
  } else if (boss) {
    winBoss(state2, adventurer, quest);
  }
  const bonuses = getRewardBonuses(quest, (run == null ? void 0 : run.modifiers) ?? []);
  const trophy = trophyGoldXp(state2);
  const xp = Math.floor(4 * power * count * (bonuses.goldXpMultiplier ?? 1) * (1 + trophy.xp) * xpMultiplier(adventurer.level, questXpLevel(quest)));
  const gold = Math.round((1.5 * power * count + rng() * 2) * (bonuses.goldXpMultiplier ?? 1) * (1 + trophy.gold));
  state2.gold += gold;
  const drops = [];
  const dropCount = 1 + rollCount(bonuses.extraRewardChance ?? 0, rng);
  for (let d = 0; d < dropCount; d++) {
    let dropTier = tier;
    const next = upgradeTier[tier];
    if (next && quest.pools[next].length && rng() < (bonuses.rarityUpgradeChance ?? 0)) {
      dropTier = next;
    }
    const { entry, amount } = rollPool(quest.pools[dropTier], rng);
    let premium = 0;
    if (!requireMaterial(entry.material).keyItem) {
      for (let i = 0; i < amount; i++) if (rng() < PREMIUM_CHANCE) premium++;
    }
    const parts = [[entry.material, amount - premium], [premiumKey(entry.material), premium]];
    for (const [material, count2] of parts) {
      if (count2 < 1) continue;
      const first = !((state2.obtained[material] ?? 0) > 0);
      addMaterial(state2, material, count2);
      dropEvents.push({ material, tier: dropTier, questKey: quest.key, first, owned: state2.materials[material] ?? 0, premium: isPremium(material) });
      if (dropEvents.length > 50) dropEvents.shift();
      drops.push({ material, amount: count2, tier: dropTier });
      if (run) {
        run.loot[material] = (run.loot[material] ?? 0) + count2;
      }
    }
    if (!progress.revealed[dropTier].includes(entry.material)) {
      progress.revealed[dropTier].push(entry.material);
    }
  }
  progress.bestEncounter = Math.max(progress.bestEncounter, index);
  if (run) {
    run.cleared = index;
    run.gold += gold;
    run.xp += xp;
  }
  const leveled = gainXp(state2, adventurer, xp);
  const dropText2 = drops.map((d) => `+${d.amount} ${requireMaterial(d.material).name}${d.tier !== tier ? ` (upgraded to ${d.tier})` : ""}`).join(", ");
  addLog(state2, quest.key, `${bonus ? "Bonus encounter" : `Cleared ${index + 1}`} (${tier}): ${dropText2}, +${gold} gold`, tier === "C" && drops.every((d) => d.tier === "C") ? "win" : "loot");
  if (leveled) {
    addLog(state2, quest.key, `${adventurer.name} reached level ${adventurer.level}`, "info");
  }
  const last2 = quest.encounters.length - 1;
  if (index === last2 && !bonus && !boss) {
    progress.fullClears++;
    const modCount = ((_d = run == null ? void 0 : run.modifiers) == null ? void 0 : _d.length) ?? 0;
    progress.bestModifiedClear = Math.max(progress.bestModifiedClear ?? -1, modCount);
    const r = records(adventurer);
    r.modClears[quest.key] = Math.max(r.modClears[quest.key] ?? 0, modCount);
    if (ARMOR_SLOTS.every((slot) => !adventurer.equipment[slot]) && !r.bareClears.includes(quest.key)) {
      r.bareClears.push(quest.key);
    }
    completeContract(state2, adventurer, quest);
    const ambition = bossAmbitionFor(adventurer, quest.key);
    if (run && quest.boss && ambition && (ambition.mods ?? []).every((m) => {
      var _a3;
      return (_a3 = run.modifiers) == null ? void 0 : _a3.includes(m);
    }) && !run.bossEncounter) {
      run.bossEncounter = "pending";
      addLog(state2, quest.key, `${monsters[quest.boss.monster].name} awaits ${adventurer.name}${""}!`, "info");
    }
    if (run && rite && !run.riteBoss) {
      run.riteBoss = "pending";
      addLog(state2, quest.key, `${monsters[rite.boss].name} awaits ${adventurer.name}!`, "info");
    }
    const achievement = "clear-" + quest.key;
    if (!state2.achievements.includes(achievement)) {
      state2.achievements.push(achievement);
      addLog(state2, quest.key, "First clear!", "info");
    }
    if (run && !run.bonusEncounter && rng() < (bonuses.bonusRareChance ?? 0)) {
      run.bonusEncounter = "pending";
      addLog(state2, quest.key, `A bonus rare encounter awaits${""}!`, "info");
    }
  }
}
function startExtraFight(state2, adventurer) {
  const extra = pendingExtraFight(adventurer);
  const run = adventurer.run;
  const quest = quests[(run == null ? void 0 : run.questKey) ?? ""];
  if (extra === "rite") {
    run.riteBoss = "fought";
    const rite = getModifierDefs(quest, run.modifiers ?? []).find((m) => m.rite).rite;
    startEncounter(state2, adventurer, quest, quest.encounters.length - 1, false, rite.boss);
    return true;
  }
  if (extra === "boss") {
    run.bossEncounter = "fought";
    startEncounter(state2, adventurer, quest, quest.encounters.length - 1, false, quest.boss.monster);
    return true;
  }
  if (extra === "bonus") {
    run.bonusEncounter = "fought";
    startEncounter(state2, adventurer, quest, quest.encounters.length - 1, true);
    return true;
  }
  return false;
}
function pendingExtraFight(adventurer) {
  var _a2;
  const run = adventurer.run;
  if (!run || ((_a2 = adventurer.assignment) == null ? void 0 : _a2.questKey) !== run.questKey) return null;
  if (run.riteBoss === "pending") return "rite";
  if (run.bossEncounter === "pending" && quests[run.questKey].boss) return "boss";
  if (run.bonusEncounter === "pending") return "bonus";
  return null;
}
const ENCOUNTER_END_SECONDS = 1;
function advanceAfterWin(state2, adventurer, quest, index, bonus) {
  var _a2, _b2;
  const run = ((_a2 = adventurer.run) == null ? void 0 : _a2.questKey) === quest.key ? adventurer.run : void 0;
  const last2 = quest.encounters.length - 1;
  const stopAt = run ? run.stopAt : getStopAt(adventurer, quest.key);
  if (startExtraFight(state2, adventurer)) {
    return;
  }
  if (bonus || (run == null ? void 0 : run.bossEncounter) === "pending" || (run == null ? void 0 : run.riteBoss) === "pending" || index >= Math.min(stopAt, last2) || ((_b2 = adventurer.assignment) == null ? void 0 : _b2.questKey) !== quest.key) {
    startRest(state2, adventurer, quest.key, false);
  } else {
    startEncounter(state2, adventurer, quest, index + 1);
  }
}
function willFactor(m) {
  var _a2;
  const will = (_a2 = monsters[m.key]) == null ? void 0 : _a2.risingWill;
  return will ? 1 + will.growth * Math.floor((m.age ?? 0) / will.every) : 1;
}
function shielded(m, fighting) {
  var _a2;
  const shatter = (_a2 = monsters[m.key]) == null ? void 0 : _a2.shatter;
  return !!shatter && fighting.some((o) => o.key === shatter.shard && o.hp > 0);
}
const RIPOSTE_CRIT = 0.5;
const RIPOSTE_WINDOW = 2, RIPOSTE_WINDOW_ENHANCED = 3;
function tickFight(state2, adventurer, dt, rng) {
  var _a2, _b2, _c2, _d, _e, _f, _g, _h;
  const activity = adventurer.activity;
  if (activity.kind !== "fighting") {
    return;
  }
  if (activity.entrance) {
    activity.entrance -= dt;
    if (activity.entrance > 0) return;
    dt = -activity.entrance;
    delete activity.entrance;
    if (dt <= 0) return;
  }
  const quest = quests[activity.questKey];
  const run = ((_a2 = adventurer.run) == null ? void 0 : _a2.questKey) === quest.key ? adventurer.run : void 0;
  const runMods = getModifierDefs(quest, (run == null ? void 0 : run.modifiers) ?? []);
  const rite = (_b2 = runMods.find((m) => m.rite)) == null ? void 0 : _b2.rite;
  const riteBoss = rite && activity.boss === rite.boss ? activity.monsters.find((m) => m.key === rite.boss) : void 0;
  const rules = activeRules(quest, runMods, activity.encounterIndex, riteBoss ? riteBoss.hp / riteBoss.maxHp : rite && activity.boss === rite.boss ? 0 : void 0);
  const lifeless = rules.has("noRecovery");
  const stats = corrode(getCachedStats(state2, adventurer), (run == null ? void 0 : run.corrosion) ?? 0);
  const rs = runStats(adventurer, quest.key);
  const encounterEntry = () => {
    var _a3;
    if (!rs) return void 0;
    const names = [...new Set((activity.lineup ?? (activity.boss ? [activity.boss] : ((_a3 = quest.encounters[activity.encounterIndex]) == null ? void 0 : _a3.monsters) ?? [])).map((k) => {
      var _a4;
      return ((_a4 = monsters[k]) == null ? void 0 : _a4.name) ?? k;
    }))];
    const label = `${activity.boss ? "Ambition boss" : `Encounter ${activity.encounterIndex + 1}`}${activity.bonus ? " (bonus)" : ""} · ${names.join(", ")}`;
    rs.takenByEncounter ?? (rs.takenByEncounter = {});
    const entry = rs.takenByEncounter[label];
    return typeof entry === "object" ? entry : rs.takenByEncounter[label] = { taken: entry ?? 0, seconds: 0 };
  };
  const takenHere = (amount) => {
    const entry = amount > 0 ? encounterEntry() : void 0;
    if (entry) entry.taken += amount;
  };
  const pl = (key) => passiveLevel(adventurer, key, classPassive);
  const furyL = pl("fury"), followL = pl("followThrough"), siphonL = pl("siphonWard"), cleaveL = pl("cleave"), riposteL = pl("riposte"), spellL = pl("spellward");
  const counterL = pl("counterstrike"), exploitL = pl("exploit"), bloodL = pl("bloodPact"), rampageL = pl("rampage"), deadeyeL = pl("deadeye"), hexL = pl("hex");
  const hexFactor = (m) => hexL ? (hexL >= 2 ? 0.06 : 0.04) * ailmentSeconds(m.ailments) : 0;
  activity.clock = (activity.clock ?? 0) + dt;
  const spellCap = spellL ? (spellL >= 2 ? 3 : 2) * stats.maxWard : 0;
  const recoveryBand = RECOVERY_BAND * (stats.maxHealth + stats.maxWard);
  activity.recovered ?? (activity.recovered = []);
  while (activity.recovered.length && activity.clock - activity.recovered[0].at >= RECOVERY_WINDOW) {
    activity.recoveredSum = (activity.recoveredSum ?? 0) - activity.recovered.shift().amount;
  }
  if (!activity.recovered.length) activity.recoveredSum = 0;
  const softCap = (amount) => softCapRecovery(amount, activity.recoveredSum ?? 0, recoveryBand);
  const recordRecovery = (amount) => {
    if (amount <= 0) return;
    activity.recovered.push({ at: activity.clock, amount });
    activity.recoveredSum = (activity.recoveredSum ?? 0) + amount;
  };
  const healHero = (raw, leech = false) => {
    if (lifeless || raw <= 0) return 0;
    const amount = leech ? softCap(raw) : raw;
    const healed = heal(adventurer, stats.maxHealth, amount);
    let gained = 0;
    if (spellCap > 0 && adventurer.hp > 0 && amount > healed) {
      const before = adventurer.ward ?? 0;
      adventurer.ward = Math.max(before, Math.min(spellCap, before + amount - healed));
      gained = adventurer.ward - before;
      if (rs) rs.wardGained += gained;
    }
    if (leech) recordRecovery(healed + gained);
    return healed;
  };
  const gainWard = (amount) => {
    if (lifeless || amount <= 0) return;
    const before = adventurer.ward ?? 0;
    adventurer.ward = Math.max(before, Math.min(stats.maxWard, before + amount));
    if (rs) rs.wardGained += adventurer.ward - before;
  };
  const regen = healHero(stats.lifeRegen * dt);
  if (rs) rs.healed.regen += regen;
  if (activity.ending !== void 0) {
    activity.ending -= dt;
    if (activity.ending <= 0) {
      advanceAfterWin(state2, adventurer, quest, activity.encounterIndex, !!activity.bonus || !!activity.boss);
    }
    return;
  }
  if (rs) {
    rs.fightSeconds += dt;
    encounterEntry().seconds += dt;
  }
  const threshold = monsterBaseline.hp * encounterPower(quest, activity.encounterIndex) * (quest.monsterScale ?? 1);
  const ailmentBonus = {
    chance: { burn: stats.gear.igniteChance ?? 0, chill: stats.gear.chillChance ?? 0, shock: stats.gear.shockChance ?? 0 },
    effect: stats.gear.ailmentEffect ?? 0,
    // Exploit: burns last twice as long, and chill and shock build to 75%.
    ...exploitL ? { burnSeconds: 2 * BURN_SECONDS, cap: 0.75 } : {}
  };
  const defeat = (by) => {
    const progress = getQuestProgress(state2, quest.key);
    progress.bestEncounter = Math.max(progress.bestEncounter, activity.encounterIndex - 1);
    addLog(state2, quest.key, `Defeated at encounter ${activity.encounterIndex + 1} by ${by}`, "loss");
    if (adventurer.run) adventurer.run.defeatedAt = activity.encounterIndex;
    if (quest.endless) {
      adventurer.assignment = null;
    }
    startRest(state2, adventurer, quest.key, true);
  };
  const hurt = (m, amount) => {
    var _a3;
    amount *= 1 + hexFactor(m);
    if (m.guard) amount *= 1 - m.guard.amount;
    if (m.ward) {
      const soaked = Math.min(m.ward, amount);
      m.ward = m.ward - soaked || void 0;
      amount -= soaked;
    }
    const shatter = (_a3 = monsters[m.key]) == null ? void 0 : _a3.shatter;
    if (!shatter) return amount;
    if (shielded(m, activity.monsters)) amount *= shatter.damageTaken;
    const next = shatter.at[m.phase ?? 0];
    return next === void 0 ? amount : Math.min(amount, Math.max(0, m.hp - next * m.maxHp));
  };
  const summonCheck = (m) => {
    var _a3, _b3;
    const summon = (_a3 = monsters[m.key]) == null ? void 0 : _a3.summon;
    const next = summon == null ? void 0 : summon.at[m.summoned ?? 0];
    if (!summon || next === void 0 || m.hp <= 0 || m.hp > next * m.maxHp + 1e-6) return;
    m.summoned = (m.summoned ?? 0) + 1;
    const base = ((_b3 = activity.lineup) == null ? void 0 : _b3.length) ?? 0;
    const adds = activity.adds ?? (activity.adds = []);
    const spawned = [];
    for (let i = 0; i < summon.count; i++) {
      let index = adds.findIndex((_, j) => !activity.monsters.some((o) => o.slot === base + j) && !spawned.some((o) => o.slot === base + j));
      if (index < 0) index = adds.length;
      adds[index] = summon.monster;
      const st = getMonsterStats(quest, activity.encounterIndex, summon.monster, run == null ? void 0 : run.modifiers);
      spawned.push({ key: summon.monster, slot: base + index, hp: st.hp * (summon.hp ?? 1), maxHp: st.hp * (summon.hp ?? 1), cooldown: (0.5 + 0.5 * rng()) / st.attacksPerSecond });
    }
    activity.monsters.unshift(...spawned);
    activity.summonedCount = (activity.summonedCount ?? 0) + summon.count;
    pushCombat({ adventurerId: adventurer.id, side: "monster", slot: m.slot ?? 0, kind: "cast", ability: summon.name, effect: "hatch", spell: true, onSelf: true });
  };
  const shatterCheck = (m) => {
    var _a3, _b3;
    summonCheck(m);
    const shatter = (_a3 = monsters[m.key]) == null ? void 0 : _a3.shatter;
    const next = shatter == null ? void 0 : shatter.at[m.phase ?? 0];
    if (!shatter || next === void 0 || m.hp > next * m.maxHp + 1e-6) return;
    m.phase = (m.phase ?? 0) + 1;
    const base = ((_b3 = activity.lineup) == null ? void 0 : _b3.length) ?? 0;
    const adds = activity.adds ?? (activity.adds = []);
    const spawned = [];
    for (let i = 0; i < shatter.count; i++) {
      let index = adds.findIndex((_, j) => !activity.monsters.some((o) => o.slot === base + j) && !spawned.some((o) => o.slot === base + j));
      if (index < 0) index = adds.length;
      adds[index] = shatter.shard;
      const st = getMonsterStats(quest, activity.encounterIndex, shatter.shard, run == null ? void 0 : run.modifiers);
      spawned.push({ key: shatter.shard, slot: base + index, hp: st.hp, maxHp: st.hp, cooldown: (0.5 + 0.5 * rng()) / st.attacksPerSecond });
    }
    activity.monsters.unshift(...spawned);
    addLog(state2, quest.key, `${monsters[m.key].name} shatters: ${shatter.count} ${monsters[shatter.shard].name}s rise to guard him.`, "info");
  };
  const heroBurn = tickAilments(activity.heroAilments, dt) * shockFactor(activity.heroAilments);
  if (heroBurn > 0) {
    const absorbed = Math.min(adventurer.ward ?? 0, heroBurn);
    adventurer.ward = (adventurer.ward ?? 0) - absorbed;
    adventurer.hp -= heroBurn - absorbed;
    if (rs) {
      addDamage(rs.taken, { fire: heroBurn }, heroBurn);
      takenHere(heroBurn);
      rs.wardAbsorbed += absorbed;
      rs.lowestHp = Math.min(rs.lowestHp, Math.max(0, adventurer.hp) / stats.maxHealth);
    }
    if (adventurer.hp <= 0) {
      defeat("burning");
      return;
    }
  }
  const heroBleed = tickBleed(activity.heroAilments, dt) * shockFactor(activity.heroAilments);
  if (heroBleed > 0) {
    const absorbed = Math.min(adventurer.ward ?? 0, heroBleed);
    adventurer.ward = (adventurer.ward ?? 0) - absorbed;
    adventurer.hp -= heroBleed - absorbed;
    if (rs) {
      addDamage(rs.taken, { physical: heroBleed }, heroBleed);
      takenHere(heroBleed);
      rs.wardAbsorbed += absorbed;
      rs.lowestHp = Math.min(rs.lowestHp, Math.max(0, adventurer.hp) / stats.maxHealth);
    }
    if (adventurer.hp <= 0) {
      defeat("bleeding");
      return;
    }
  }
  if (run == null ? void 0 : run.karma) {
    const perSecond = KARMA_DPS * run.karma;
    const karma = armorReduce(perSecond, stats.armor) * dt;
    const absorbed = Math.min(adventurer.ward ?? 0, karma);
    adventurer.ward = (adventurer.ward ?? 0) - absorbed;
    adventurer.hp -= karma - absorbed;
    if (rs) {
      addDamage(rs.taken, { physical: karma }, karma);
      takenHere(karma);
      rs.preventedArmor += Math.max(0, perSecond * dt - karma);
      rs.wardAbsorbed += absorbed;
      rs.lowestHp = Math.min(rs.lowestHp, Math.max(0, adventurer.hp) / stats.maxHealth);
    }
    if (adventurer.hp <= 0) {
      defeat("Karma");
      return;
    }
  }
  const landHit = (split, slot, hitIndex, from, reflected = false) => {
    const refl = reflected ? { reflected: true } : {};
    const armor = stats.armor * sunderFactor(activity.heroAilments);
    let taken = mitigateDamage(split, armor, stats.resist, rng) * shockFactor(activity.heroAilments);
    const takenByType = mitigateByType(split, armor, stats.resist);
    if (rs) rs.incomingHits++;
    if (rng() < stats.blockChance) {
      if (rs) {
        rs.blocks++;
        rs.preventedBlock += taken;
      }
      const onBlock = (stats.gear.wardOnBlock ?? 0) + (stats.gear.wardOnBlockPercent ?? 0) * stats.maxWard;
      if (onBlock > 0) gainWard(onBlock);
      if (counterL) activity.counters = (activity.counters ?? 0) + 1;
      pushCombat({ adventurerId: adventurer.id, side: "hero", slot, kind: "block", hitIndex, ...refl });
      return true;
    }
    if (rs) {
      rs.preventedArmor += Math.max(0, (split.physical ?? 0) - (takenByType.physical ?? 0));
      rs.preventedResist += elementsOf(split).reduce((sum, e) => sum + Math.max(0, (split[e] ?? 0) - (takenByType[e] ?? 0)), 0);
      addDamage(rs.taken, takenByType, taken);
      takenHere(taken);
      const by = from ?? (reflected ? REFLECT_SOURCE : null);
      if (by) {
        rs.takenBy ?? (rs.takenBy = {});
        rs.takenBy[by] = (rs.takenBy[by] ?? 0) + taken;
      }
      if (reflected) {
        rs.reflected ?? (rs.reflected = { hits: 0, taken: 0 });
        rs.reflected.hits++;
        rs.reflected.taken += taken;
      }
    }
    if (from) inflict(activity.heroAilments ?? (activity.heroAilments = {}), takenByType, stats.maxHealth, rng);
    if (rules.has("corrosion") && run) {
      run.corrosion = (run.corrosion ?? 0) + 1;
    }
    if (rampageL && taken > 0) (activity.recentHits ?? (activity.recentHits = [])).push({ at: activity.clock ?? 0, amount: taken });
    const absorbed = Math.min(adventurer.ward ?? 0, taken);
    adventurer.ward = (adventurer.ward ?? 0) - absorbed;
    taken -= absorbed;
    adventurer.hp -= taken;
    if (rs) {
      rs.wardAbsorbed += absorbed;
      rs.lowestHp = Math.min(rs.lowestHp, Math.max(0, adventurer.hp) / stats.maxHealth);
    }
    if (taken > 0 && stats.hpLostAsWard > 0 && adventurer.hp > 0) gainWard(taken * stats.hpLostAsWard);
    if (siphonL && stats.maxWard > 0 && adventurer.hp > 0) gainWard((siphonL > 1 ? 0.075 : 0.05) * stats.maxWard);
    pushCombat({ adventurerId: adventurer.id, side: "hero", slot, kind: "hit", amount: taken, ward: absorbed, hitIndex, damageType: mainType(split), hpAfter: Math.max(0, adventurer.hp) / stats.maxHealth, wardAfter: (adventurer.ward ?? 0) / Math.max(1, stats.maxWard), pool: stats.maxHealth + stats.maxWard, ...refl });
    return adventurer.hp > 0;
  };
  let burnedOut = false;
  for (const m of [...activity.monsters]) {
    const burn = hurt(m, tickAilments(m.ailments, dt) * shockFactor(m.ailments));
    if (burn <= 0) continue;
    if (rs) addDamage(rs.dealt, { fire: burn }, Math.min(burn, Math.max(0, m.hp)));
    m.hp -= burn;
    shatterCheck(m);
    if (m.hp <= 0) {
      burnedOut = true;
      pushCombat({ adventurerId: adventurer.id, side: "monster", slot: m.slot ?? 0, kind: "hit", amount: 0, damageType: "fire", killed: true, hpAfter: 0, burn: true });
    }
  }
  if (burnedOut) {
    const fallen = activity.monsters.filter((m) => m.hp <= 0);
    activity.monsters = activity.monsters.filter((m) => m.hp > 0);
    for (const _ of fallen) {
      if (rs) rs.kills++;
    }
  }
  if (riposteL && ((_c2 = activity.recentDodges) == null ? void 0 : _c2.length)) {
    const window2 = riposteL >= 2 ? RIPOSTE_WINDOW_ENHANCED : RIPOSTE_WINDOW;
    activity.recentDodges = activity.recentDodges.filter((at) => (activity.clock ?? 0) - at <= window2);
  }
  if (rampageL) {
    const window2 = rampageL >= 2 ? 6 : 4;
    activity.recentHits = (activity.recentHits ?? []).filter((h2) => (activity.clock ?? 0) - h2.at <= window2);
  }
  const rampage = () => rampageL ? 1 + 0.01 * (activity.recentHits ?? []).reduce((sum, h2) => sum + h2.amount, 0) / 10 : 1;
  if ((_d = activity.leechPool) == null ? void 0 : _d.length) {
    let flowing = 0;
    for (const part of activity.leechPool) flowing += part.perSecond * Math.min(dt, part.left);
    const healed = healHero(flowing, true);
    if (rs) rs.healed.leech += healed;
    for (const part of activity.leechPool) part.left -= dt;
    activity.leechPool = activity.leechPool.filter((part) => part.left > 0);
  }
  const bloodBonus = () => {
    if (!bloodL || lifeless) return 1;
    const perSecond = stats.lifeRegen + (activity.leechPool ?? []).reduce((sum, part) => sum + part.perSecond, 0);
    return 1 + (bloodL >= 2 ? 0.03 : 0.02) * perSecond;
  };
  const attack = (mult, free) => {
    var _a3, _b3, _c3, _d2, _e2, _f2, _g2, _h2, _i;
    const swing = (_a3 = stats.strikes) == null ? void 0 : _a3[(activity.swing ?? 0) % stats.strikes.length];
    const swingDamage = (swing == null ? void 0 : swing.damage) ?? stats.damage;
    if (stats.strikes) activity.swing = ((activity.swing ?? 0) + 1) % stats.strikes.length;
    if (!free) activity.cooldown += 1 / (((swing == null ? void 0 : swing.attacksPerSecond) ?? stats.attacksPerSecond) * rampage());
    const critChance = stats.critChance + RIPOSTE_CRIT * (riposteL ? ((_b3 = activity.recentDodges) == null ? void 0 : _b3.length) ?? 0 : 0);
    const critBonus = stats.critBonus;
    if (bloodL) adventurer.hp -= 0.02 * Math.max(0, adventurer.hp);
    let carried = false;
    const frontTarget = activity.monsters[0];
    let hits = rollHits(stats.accuracy * blindFactor(activity.heroAilments), exposedEvasion(getMonsterStats(quest, activity.encounterIndex, frontTarget.key, (_c3 = adventurer.run) == null ? void 0 : _c3.modifiers).evasion * (1 + (((_d2 = frontTarget.evade) == null ? void 0 : _d2.amount) ?? 0)), frontTarget.exposed), rng);
    frontTarget.exposed = hits ? 0 : (frontTarget.exposed ?? 0) + 1;
    if (deadeyeL >= 2) hits++;
    let combine = deadeyeL && hits > 1 ? hits : 1;
    if (deadeyeL && hits > 1) hits = 1;
    if (!hits) {
      pushCombat({ adventurerId: adventurer.id, side: "monster", slot: activity.monsters[0].slot ?? 0, kind: "miss" });
    }
    if (rs) {
      rs.attacks++;
      if (hits) rs.attacksLanded++;
    }
    let hitIndex = 0;
    let landed = 0;
    let kills = 0;
    while (hits > 0 && activity.monsters.length) {
      hits--;
      const target = activity.monsters[0];
      const targetStats = getMonsterStats(quest, activity.encounterIndex, target.key, (_e2 = adventurer.run) == null ? void 0 : _e2.modifiers);
      const carry = carried && followL >= 2 ? 1.5 : 1;
      let roll = 0, scale = 0, critLevels = 0;
      for (let part = 0; part < combine; part++) {
        const levels = rollCritLevels(critChance, rng);
        const partScale = (1 + critBonus * levels) * carry;
        roll += (stats.rollMin + (stats.rollMax - stats.rollMin) * rng()) * partScale;
        scale += partScale;
        critLevels = Math.max(critLevels, levels);
      }
      const parts = combine;
      combine = 1;
      landed += parts;
      const hit = {};
      for (const type of Object.keys(swingDamage)) {
        hit[type] = swingDamage[type] * roll;
      }
      if (furyL) {
        const missing = Math.max(0, stats.maxHealth - adventurer.hp);
        hit.physical = (hit.physical ?? 0) + missing / (furyL >= 2 ? 3 : 5) * scale;
      }
      const a = target.ailments;
      const exploit = exploitL ? 1 + (exploitL >= 2 ? 0.35 : 0.2) * ((((_f2 = a == null ? void 0 : a.burns) == null ? void 0 : _f2.length) ? 1 : 0) + ((a == null ? void 0 : a.chill) ? 1 : 0) + ((a == null ? void 0 : a.shock) ? 1 : 0)) : 1;
      const more = mult * exploit * bloodBonus() * rampage() * weakenFactor(activity.heroAilments);
      if (more !== 1) for (const type of Object.keys(hit)) hit[type] = (hit[type] ?? 0) * more;
      const dealtByType = mitigateByType(hit, targetStats.armor, targetStats.resist);
      const dealt = hurt(target, mitigateDamage(hit, targetStats.armor, targetStats.resist, rng) * shockFactor(target.ailments));
      inflict(target.ailments ?? (target.ailments = {}), dealtByType, threshold, rng, parts > 1 ? { ...ailmentBonus, rolls: parts } : ailmentBonus);
      const effective = Math.min(dealt, Math.max(0, target.hp));
      const onHit = healHero(stats.lifeOnHit);
      let leech = 0;
      if (bloodL) {
        if (!lifeless && stats.lifeLeech * effective > 0) (activity.leechPool ?? (activity.leechPool = [])).push({ perSecond: stats.lifeLeech * effective, left: 1 });
      } else {
        leech = healHero(stats.lifeLeech * effective, true);
      }
      if (rs) {
        rs.hits++;
        if (critLevels) rs.crits++;
        addDamage(rs.dealt, dealtByType, effective);
        rs.healed.onHit += onHit;
        rs.healed.leech += leech;
      }
      target.hp -= dealt;
      shatterCheck(target);
      const rec2 = records(adventurer);
      if (dealt > rec2.bestHit) rec2.bestHit = dealt;
      pushCombat({ adventurerId: adventurer.id, side: "monster", slot: target.slot ?? 0, kind: "hit", amount: dealt, critLevels, hitIndex: hitIndex++, damageType: mainType(hit), killed: target.hp <= 0, hpAfter: Math.max(0, target.hp) / target.maxHp });
      if (rules.has("karma") && run) run.karma = (run.karma ?? 0) + 1;
      if (rules.has("reflect") && dealt > 0) {
        const sum = Object.values(dealtByType).reduce((acc, b) => acc + (b ?? 0), 0) || 1;
        const back = {};
        for (const [type, value] of Object.entries(dealtByType)) back[type] = value * dealt / sum * REFLECT_SHARE;
        if (rs) rs.incomingAttacks++;
        const reflectLands = rng() < hitChance(stats.accuracy, exposedEvasion(stats.evasion * galeFactor(activity.heroAilments), activity.heroExposed));
        activity.heroExposed = reflectLands ? 0 : (activity.heroExposed ?? 0) + 1;
        if (!reflectLands) {
          if (rs) rs.attacksDodged++;
          if (riposteL) (activity.recentDodges ?? (activity.recentDodges = [])).push(activity.clock ?? 0);
          const onDodge = (stats.gear.wardOnDodge ?? 0) + (stats.gear.wardOnDodgePercent ?? 0) * stats.maxWard;
          if (onDodge > 0) gainWard(onDodge);
          pushCombat({ adventurerId: adventurer.id, side: "hero", slot: target.slot ?? 0, kind: "miss", reflected: true });
        } else if (!landHit(back, target.slot ?? 0, 0, null, true)) {
          defeat("reflected damage");
          return false;
        }
      }
      const thorns = (_g2 = monsters[target.key]) == null ? void 0 : _g2.thorns;
      if (thorns && !landHit({ [((_h2 = monsters[target.key]) == null ? void 0 : _h2.thornsType) ?? "physical"]: thorns }, target.slot ?? 0, 0, target.key)) {
        defeat("thorns");
        return false;
      }
      const onKill = () => {
        kills++;
        if (rs) rs.kills++;
      };
      if (cleaveL) {
        const share = cleaveL >= 2 ? 0.5 : 0.3;
        const part = {};
        for (const type of Object.keys(hit)) part[type] = (hit[type] ?? 0) * share;
        for (const other of [...activity.monsters]) {
          if (other === target || other.hp <= 0) continue;
          const otherStats = getMonsterStats(quest, activity.encounterIndex, other.key, (_i = adventurer.run) == null ? void 0 : _i.modifiers);
          const otherDealt = hurt(other, mitigateDamage(part, otherStats.armor, otherStats.resist, rng) * shockFactor(other.ailments));
          if (rs) addDamage(rs.dealt, mitigateByType(part, otherStats.armor, otherStats.resist), Math.min(otherDealt, other.hp));
          other.hp -= otherDealt;
          shatterCheck(other);
          pushCombat({ adventurerId: adventurer.id, side: "monster", slot: other.slot ?? 0, kind: "hit", amount: otherDealt, critLevels, hitIndex: 0, damageType: mainType(part), killed: other.hp <= 0, hpAfter: Math.max(0, other.hp) / other.maxHp });
        }
        const fallen = activity.monsters.filter((m) => m !== target && m.hp <= 0);
        if (fallen.length) {
          activity.monsters = activity.monsters.filter((m) => m === target || m.hp > 0);
          fallen.forEach(onKill);
        }
      }
      if (target.hp <= 0) {
        activity.monsters = activity.monsters.filter((m) => m !== target);
        onKill();
        if (!followL) {
          break;
        }
        carried = true;
      }
    }
    const rec = records(adventurer);
    rec.bestChain = Math.max(rec.bestChain, landed);
    rec.bestKills = Math.max(rec.bestKills, kills);
    return true;
  };
  activity.cooldown -= dt * slowFactor(activity.heroAilments);
  while (activity.cooldown <= 0 && activity.monsters.length) {
    if (!attack(1, false)) return;
  }
  while (activity.counters && activity.monsters.length) {
    activity.counters--;
    if (!attack(counterL >= 2 ? 1 : 0.5, true)) return;
  }
  activity.counters = 0;
  if (!activity.monsters.length) {
    winEncounter(state2, adventurer, quest, activity.encounterIndex, rng, activity.bonus, (((_e = activity.lineup) == null ? void 0 : _e.length) ?? quest.encounters[activity.encounterIndex].monsters.length) + 0.5 * (activity.summonedCount ?? 0), activity.boss);
    activity.ending = ENCOUNTER_END_SECONDS;
    return;
  }
  for (const front of activity.monsters) {
    const frontStats = getMonsterStats(quest, activity.encounterIndex, front.key, (_f = adventurer.run) == null ? void 0 : _f.modifiers);
    front.age = (front.age ?? 0) + dt;
    const will = willFactor(front);
    const rising = (_g = monsters[front.key]) == null ? void 0 : _g.risingWill;
    if (rising) {
      const stacks = Math.floor(front.age / rising.every);
      if (stacks > (front.will ?? 0)) {
        if (rising.heal) front.hp = Math.min(front.maxHp, front.hp + rising.heal * front.maxHp * (stacks - (front.will ?? 0)));
        front.will = stacks;
      }
    }
    front.cooldown -= dt * slowFactor(front.ailments) * (1 + (((_h = front.haste) == null ? void 0 : _h.amount) ?? 0));
    while (front.cooldown <= 0) {
      front.cooldown += 1 / (frontStats.attacksPerSecond * will);
      if (front.haste && --front.haste.turns <= 0) delete front.haste;
      if (front.guard && --front.guard.turns <= 0) delete front.guard;
      if (front.evade && --front.evade.turns <= 0) delete front.evade;
      const kit = monsterKit(front.key);
      let entry = null;
      if (kit) {
        const pick2 = nextAbility(kit, front.ready, front.basicTurn);
        front.ready = pick2.ready;
        front.basicTurn = pick2.basicTurn;
        entry = kit[pick2.index];
        const self = !!(entry.heal || entry.rally || entry.buff) && !kitHit(entry) && !entry.applies;
        pushCombat({ adventurerId: adventurer.id, side: "monster", slot: front.slot ?? 0, kind: "cast", ability: entry.basic ? void 0 : entry.name, effect: entry.effect, spell: entry.spell, fxScale: entry.effectScale, onSelf: self });
      }
      if (entry && (entry.heal || entry.rally || entry.buff) && !kitHit(entry) && !entry.applies) {
        if (entry.heal) front.hp = Math.min(front.maxHp, front.hp + entry.heal * front.maxHp);
        const buff = entry.buff;
        if ((buff == null ? void 0 : buff.kind) === "ward") front.ward = Math.max(front.ward ?? 0, buff.amount * front.maxHp);
        else if (buff) front[buff.kind] = { amount: buff.amount, turns: buff.turns ?? 2 };
        if (entry.rally) for (const m of activity.monsters) m.haste = { amount: entry.rally.amount, turns: entry.rally.turns };
        continue;
      }
      const hits = rollHits(frontStats.accuracy * ((entry == null ? void 0 : entry.accuracy) ?? 1), exposedEvasion(stats.evasion * galeFactor(activity.heroAilments), activity.heroExposed), rng);
      activity.heroExposed = hits ? 0 : (activity.heroExposed ?? 0) + 1;
      if (rs) {
        rs.incomingAttacks++;
        if (!hits) rs.attacksDodged++;
      }
      if (!hits) {
        if (riposteL) (activity.recentDodges ?? (activity.recentDodges = [])).push(activity.clock ?? 0);
        const onDodge = (stats.gear.wardOnDodge ?? 0) + (stats.gear.wardOnDodgePercent ?? 0) * stats.maxWard;
        if (onDodge > 0) gainWard(onDodge);
        pushCombat({ adventurerId: adventurer.id, side: "hero", slot: front.slot ?? 0, kind: "miss" });
        continue;
      }
      const roll = () => frontStats.damage * will * (0.85 + 0.3 * rng()) * Math.max(0.2, 1 - hexFactor(front));
      if (!entry) {
        for (let hitIndex = 0; hitIndex < hits; hitIndex++) {
          if (!landHit(splitDamage(roll(), frontStats.damageTypes), front.slot ?? 0, hitIndex, front.key)) break;
        }
      } else {
        const e = entry;
        const abilityHit = (base) => {
          const raw = base * (e.damage ?? 1);
          const out = {};
          for (const [t, v] of Object.entries(e.shares)) out[t] = raw * frontStats.baseShare * v;
          if (kitHit(e) > 0) for (const [t, v] of Object.entries(frontStats.addedTypes)) out[t] = (out[t] ?? 0) + raw * v;
          if (e.mimic) {
            const total = Object.values(out).reduce((sum, v) => sum + (v ?? 0), 0);
            return { [mainType(stats.damage)]: total };
          }
          return out;
        };
        if (e.applies) {
          const kind = e.applies.ailment;
          const element = { burn: "fire", chill: "cold", shock: "lightning" }[kind];
          const amount = e.applies.amount * (element ? 1 - Math.max(0, stats.resist[element] ?? 0) : 1);
          const a = activity.heroAilments ?? (activity.heroAilments = {});
          let applied = true;
          if (kind === "burn") {
            const dps = amount * roll();
            if (dps >= MIN_DOT_DPS) (a.burns ?? (a.burns = [])).push({ dps, remaining: BURN_SECONDS + 1 });
            else applied = false;
          } else if (kind === "chill") a.chill = Math.min(CHILL_CAP, (a.chill ?? 0) + amount);
          else if (kind === "shock") a.shock = Math.min(SHOCK_CAP, (a.shock ?? 0) + amount);
          else if (kind === "weaken") a.weaken = Math.min(WEAKEN_CAP, (a.weaken ?? 0) + amount);
          else if (kind === "snare") a.snare = Math.min(SNARE_CAP, (a.snare ?? 0) + amount);
          else if (kind === "blind") a.blind = Math.min(BLIND_CAP, (a.blind ?? 0) + amount);
          else if (kind === "sunder") a.sunder = Math.min(SUNDER_CAP, (a.sunder ?? 0) + amount);
          else if (kind === "gale") a.gale = Math.min(GALE_CAP, (a.gale ?? 0) + amount);
          else {
            const total = armorReduce(amount * roll(), stats.armor * sunderFactor(a));
            if (total / BLEED_SECONDS < MIN_DOT_DPS) applied = false;
            else if (!a.bleed || a.bleed.dps < total / BLEED_SECONDS) a.bleed = { dps: total / BLEED_SECONDS, remaining: BLEED_SECONDS };
          }
          if (applied) pushCombat({ adventurerId: adventurer.id, side: "hero", slot: front.slot ?? 0, kind: "ailment", ailment: kind, ability: e.name });
        }
        if (kitHit(e) > 0) {
          const before = adventurer.hp + (adventurer.ward ?? 0);
          if (e.spell || e.hits) {
            let raw = 0;
            for (let i = 0; i < hits; i++) raw += roll();
            const n = e.hits ?? 1;
            for (let i = 0; i < n; i++) if (!landHit(abilityHit(raw / n), front.slot ?? 0, i, front.key)) break;
          } else {
            for (let hitIndex = 0; hitIndex < hits; hitIndex++) {
              if (!landHit(abilityHit(roll()), front.slot ?? 0, hitIndex, front.key)) break;
            }
          }
          if (e.drain) front.hp = Math.min(front.maxHp, front.hp + e.drain * Math.max(0, before - adventurer.hp - (adventurer.ward ?? 0)));
        }
        if (e.heal) front.hp = Math.min(front.maxHp, front.hp + e.heal * front.maxHp);
      }
      if (adventurer.hp <= 0) {
        defeat(frontStats.name);
        return;
      }
    }
  }
}
const RECOVERY_BAND = 0.1;
const RECOVERY_WINDOW = 1;
function softCapRecovery(raw, recent, band) {
  if (band <= 0) return raw;
  let left = raw, out = 0, total = recent;
  for (let guard = 0; left > 1e-9 && guard < 30; guard++) {
    const k = Math.floor(total / band + 1e-9);
    const rate = Math.pow(0.5, k);
    const room = (k + 1) * band - total;
    const used = Math.min(left, room / rate);
    out += used * rate;
    total += used * rate;
    left -= used;
  }
  return out;
}
function tickAdventurer(state2, adventurer, dt, rng) {
  encounterRng = rng;
  const activity = adventurer.activity;
  if (activity.kind === "fighting") {
    tickFight(state2, adventurer, dt, rng);
  } else if (activity.kind === "traveling") {
    activity.remaining -= dt;
    if (activity.remaining <= 0) {
      startEncounter(state2, adventurer, quests[activity.questKey], 0);
    }
  } else if (activity.kind === "resting") {
    const stats = getCachedStats(state2, adventurer);
    activity.remaining -= dt * restSpeed(stats.maxHealth, stats.lifeRegen, adventurer.level);
    if (activity.remaining > 0 && adventurer.autoRecover) {
      const cost = getRecoverCost(state2, adventurer);
      if (cost <= getAutoRecoverBudget(adventurer)) {
        recoverInstantly(state2, adventurer);
      }
    }
    const total = getRestSeconds(stats.maxHealth, 0, activity.defeated);
    const fraction = Math.max(0, Math.min(1, 1 - activity.remaining / (activity.defeated ? total : 15)));
    adventurer.hp = Math.max(adventurer.hp, Math.floor(stats.maxHealth * fraction));
    if (activity.remaining <= 0) {
      adventurer.hp = stats.maxHealth;
      if (startExtraFight(state2, adventurer)) ;
      else if (adventurer.assignment) {
        if (leaveGate(adventurer)) startRun(state2, adventurer);
        else activity.remaining = 0;
      } else {
        adventurer.activity = { kind: "idle" };
      }
    }
  } else if (activity.kind === "idle") {
    const stats = getCachedStats(state2, adventurer);
    if (adventurer.hp < stats.maxHealth) {
      adventurer.hp = Math.min(stats.maxHealth, adventurer.hp + stats.maxHealth / 15 * dt * restSpeed(stats.maxHealth, stats.lifeRegen, adventurer.level));
    }
    if (adventurer.assignment) startRun(state2, adventurer);
  }
}
const portalEvents = [];
function drainPortalEvents() {
  return portalEvents.splice(0);
}
function winRite(state2, adventurer, quest, rite, rng) {
  var _a2;
  const { entry } = rollPool(rite.pool, rng);
  const first = !((state2.obtained[entry.material] ?? 0) > 0);
  addMaterial(state2, entry.material, 1);
  dropEvents.push({ material: entry.material, tier: "M", questKey: quest.key, first, owned: state2.materials[entry.material] ?? 0, legendary: true });
  if (((_a2 = adventurer.run) == null ? void 0 : _a2.questKey) === quest.key) adventurer.run.loot[entry.material] = (adventurer.run.loot[entry.material] ?? 0) + 1;
  addLog(state2, quest.key, `${adventurer.name} defeated ${monsters[rite.boss].name}: +1 ${requireMaterial(entry.material).name}`, "loot");
  const wasOpen = !!state2.portal && state2.time < state2.portal.openUntil;
  if (openPortal(state2, rite.keys)) {
    addLog(state2, quest.key, `The keys are spent and the portal ${wasOpen ? `stays open ${PORTAL_SECONDS / 60} minutes longer` : `opens for ${PORTAL_SECONDS / 60} minutes`}.`, "info");
    portalEvents.push({ kind: wasOpen ? "extended" : "opened", adventurerId: adventurer.id });
  } else {
    addLog(state2, quest.key, "The keys were gone, so the portal stays shut.", "info");
    portalEvents.push({ kind: "noKeys", adventurerId: adventurer.id });
  }
}
function closePortalIfDue(state2) {
  var _a2;
  if (!state2.portal || state2.time < state2.portal.openUntil) return;
  delete state2.portal;
  for (const a of state2.adventurers) {
    const questKey = ((_a2 = a.assignment) == null ? void 0 : _a2.questKey) ?? (a.activity.kind === "fighting" || a.activity.kind === "traveling" ? a.activity.questKey : void 0);
    if (questKey && isPortalQuest(questKey)) recall(state2, a);
  }
  portalEvents.push({ kind: "closed" });
}
function tick(state2, rng = Math.random) {
  state2.time += TICK_SECONDS;
  closePortalIfDue(state2);
  for (const adventurer of state2.adventurers) {
    tickAdventurer(state2, adventurer, TICK_SECONDS, rng);
  }
}
const __vite_glob_0_0$6 = "" + new URL("fx-acid-q5bnM73j.webp", import.meta.url).href;
const __vite_glob_0_1$6 = "" + new URL("fx-bite-BbSyEdvt.webp", import.meta.url).href;
const __vite_glob_0_2$6 = "" + new URL("fx-bleed-D2vS0P16.webp", import.meta.url).href;
const __vite_glob_0_3$6 = "" + new URL("fx-chains-1QEZ2ZOi.webp", import.meta.url).href;
const __vite_glob_0_4$6 = "" + new URL("fx-chill-DUxVi4vb.webp", import.meta.url).href;
const __vite_glob_0_5$6 = "" + new URL("fx-curse-CW3xZwaZ.webp", import.meta.url).href;
const __vite_glob_0_6$5 = "" + new URL("fx-dive-DgQZ1KgN.webp", import.meta.url).href;
const __vite_glob_0_7$5 = "" + new URL("fx-drain-DfBDqeDT.webp", import.meta.url).href;
const __vite_glob_0_8$5 = "" + new URL("fx-dust-CXWZ4994.webp", import.meta.url).href;
const __vite_glob_0_9$5 = "" + new URL("fx-earth-DmwvrB-g.webp", import.meta.url).href;
const __vite_glob_0_10$5 = "" + new URL("fx-fire-cGQgshma.webp", import.meta.url).href;
const __vite_glob_0_11$5 = "" + new URL("fx-gust-CReCAUpa.webp", import.meta.url).href;
const __vite_glob_0_12$4 = "" + new URL("fx-hatch-DDHo4BNA.webp", import.meta.url).href;
const __vite_glob_0_13$4 = "" + new URL("fx-heal-91kYJ2bY.webp", import.meta.url).href;
const __vite_glob_0_14$4 = "" + new URL("fx-ice-B-nttNvB.webp", import.meta.url).href;
const __vite_glob_0_15$3 = "" + new URL("fx-kindle-vJlMjHkF.webp", import.meta.url).href;
const __vite_glob_0_16$3 = "" + new URL("fx-lash-Bl-Pg7wy.webp", import.meta.url).href;
const __vite_glob_0_17$2 = "" + new URL("fx-lightning-V3g3xQ8S.webp", import.meta.url).href;
const __vite_glob_0_18$2 = "" + new URL("fx-mirror-DzgiIux_.webp", import.meta.url).href;
const __vite_glob_0_19$2 = "" + new URL("fx-poison-DR4XzhPM.webp", import.meta.url).href;
const __vite_glob_0_20$2 = "" + new URL("fx-prism-Bu1Pp68h.webp", import.meta.url).href;
const __vite_glob_0_21$2 = "" + new URL("fx-rally-CGH92se6.webp", import.meta.url).href;
const __vite_glob_0_22$2 = "" + new URL("fx-scratch-BwNt9pRV.webp", import.meta.url).href;
const __vite_glob_0_23$2 = "" + new URL("fx-shield-sMrOG-qu.webp", import.meta.url).href;
const __vite_glob_0_24$2 = "" + new URL("fx-shimmer-CHBrY7Hs.webp", import.meta.url).href;
const __vite_glob_0_25$2 = "" + new URL("fx-slam-4Qyljkje.webp", import.meta.url).href;
const __vite_glob_0_26$2 = "" + new URL("fx-slash-DfNsCaGg.webp", import.meta.url).href;
const __vite_glob_0_27$2 = "" + new URL("fx-smash-B8PkiD44.webp", import.meta.url).href;
const __vite_glob_0_28$2 = "" + new URL("fx-sonar-wqRcf49G.webp", import.meta.url).href;
const __vite_glob_0_29$2 = "" + new URL("fx-stab-BInBXseM.webp", import.meta.url).href;
const __vite_glob_0_30$2 = "" + new URL("fx-starfall-Cgq6D6ti.webp", import.meta.url).href;
const __vite_glob_0_31$2 = "" + new URL("fx-static-zcldDflS.webp", import.meta.url).href;
const __vite_glob_0_32$2 = "" + new URL("fx-steam-tc__NyoS.webp", import.meta.url).href;
const __vite_glob_0_33$2 = "" + new URL("fx-sting-CANF8rWq.webp", import.meta.url).href;
const __vite_glob_0_34$1 = "" + new URL("fx-talon-BgGCxUDh.webp", import.meta.url).href;
const __vite_glob_0_35$1 = "" + new URL("fx-throw-B2Lhzm7i.webp", import.meta.url).href;
const __vite_glob_0_36$1 = "" + new URL("fx-thump-COGOQbv2.webp", import.meta.url).href;
const __vite_glob_0_37$1 = "" + new URL("fx-vines-Csfdo-oH.webp", import.meta.url).href;
const __vite_glob_0_38$1 = "" + new URL("fx-water-BjRZvrJG.webp", import.meta.url).href;
const __vite_glob_0_39$1 = "" + new URL("fx-web-D4pAiOy9.webp", import.meta.url).href;
const hasSwing = (el) => !!el.querySelector(".swing");
const ATTACK_ANIMS = [
  { key: "auto", label: "Auto (as in a fight)", available: () => true, cls: (el) => hasSwing(el) ? "swinging" : "lunge", impact: 110 },
  { key: "swing", label: "Sword swing strip", available: (el, side) => side === "hero" && hasSwing(el), cls: "swinging", impact: 120 },
  { key: "lunge", label: "Lunge", available: () => true, cls: "lunge", impact: 80 },
  { key: "none", label: "None (hit only)", available: () => true, cls: () => null, impact: 0 }
];
const HIT_EFFECTS = [
  { key: "auto", label: "Auto (the ability's own effect)" },
  { key: "flash", label: "Flash only", cls: "struck" },
  { key: "shake", label: "Flash + shake", cls: "struck shaking" },
  { key: "slash", label: "Flash + slash mark", cls: "struck", overlay: "fx-slash" },
  { key: "burst", label: "Flash + impact burst", cls: "struck", overlay: "fx-burst" },
  { key: "fx-fire", label: "Fire burst sprite", cls: "struck", fx: "fire" },
  { key: "fx-ice", label: "Frost shard sprite", cls: "struck", fx: "ice" },
  { key: "fx-lightning", label: "Lightning bolt sprite", cls: "struck", fx: "lightning" },
  { key: "fx-earth", label: "Rock slam sprite", cls: "struck", fx: "earth" },
  { key: "fx-chill", label: "Chill aura sprite", cls: "struck", fx: "chill" },
  { key: "fx-kindle", label: "Kindle aura sprite", cls: "struck", fx: "kindle" },
  { key: "fx-static", label: "Static aura sprite", cls: "struck", fx: "static" },
  { key: "fx-scratch", label: "Claw scratch sprite", cls: "struck", fx: "scratch" },
  { key: "fx-bite", label: "Bite sprite", cls: "struck", fx: "bite" },
  { key: "fx-slash", label: "Blade slash sprite", cls: "struck", fx: "slash" },
  { key: "fx-stab", label: "Stab sprite", cls: "struck", fx: "stab" },
  { key: "fx-smash", label: "Smash impact sprite", cls: "struck", fx: "smash" },
  { key: "fx-lash", label: "Whip lash sprite", cls: "struck", fx: "lash" },
  { key: "fx-sting", label: "Sting sprite", cls: "struck", fx: "sting" },
  { key: "fx-talon", label: "Talon rake sprite", cls: "struck", fx: "talon" },
  { key: "fx-slam", label: "Body slam sprite", cls: "struck", fx: "slam" },
  { key: "fx-throw", label: "Thrown bone sprite", cls: "struck", fx: "throw" },
  { key: "fx-vines", label: "Root vines sprite", cls: "struck", fx: "vines" },
  { key: "fx-web", label: "Web shot sprite", cls: "struck", fx: "web" },
  { key: "fx-sonar", label: "Sonar screech sprite", cls: "struck", fx: "sonar" },
  { key: "fx-heal", label: "Healing sprite", cls: "struck", fx: "heal" },
  { key: "fx-hatch", label: "Egg hatching sprite", cls: "struck", fx: "hatch" },
  { key: "fx-curse", label: "Weakening curse sprite", cls: "struck", fx: "curse" },
  { key: "fx-dust", label: "Blinding dust sprite", cls: "struck", fx: "dust" },
  { key: "fx-bleed", label: "Bleeding sprite", cls: "struck", fx: "bleed" },
  { key: "fx-drain", label: "Life drain sprite", cls: "struck", fx: "drain" },
  { key: "fx-rally", label: "War cry sprite", cls: "struck", fx: "rally" },
  { key: "fx-water", label: "Drowning grasp sprite", cls: "struck", fx: "water" },
  { key: "fx-gust", label: "Wing buffet sprite", cls: "struck", fx: "gust" },
  { key: "fx-thump", label: "Punch thump sprite", cls: "struck", fx: "thump" },
  { key: "fx-shield", label: "Shield bubble sprite", cls: "struck", fx: "shield" },
  { key: "fx-acid", label: "Acid splash sprite", cls: "struck", fx: "acid" },
  { key: "fx-chains", label: "Chains sprite", cls: "struck", fx: "chains" },
  { key: "fx-steam", label: "Steam burst sprite", cls: "struck", fx: "steam" },
  { key: "fx-prism", label: "Prismatic beam sprite", cls: "struck", fx: "prism" },
  { key: "fx-starfall", label: "Star rain sprite", cls: "struck", fx: "starfall" },
  { key: "fx-shimmer", label: "Phase shimmer sprite", cls: "struck", fx: "shimmer" },
  { key: "fx-mirror", label: "Mirror shimmer sprite", cls: "struck", fx: "mirror" },
  { key: "fx-dive", label: "Dive streak sprite", cls: "struck", fx: "dive" },
  { key: "fx-poison", label: "Poison cloud sprite", cls: "struck", fx: "poison" },
  { key: "none", label: "None" }
];
const fxFiles = /* @__PURE__ */ Object.assign({ "../assets/fx/fx-acid.webp": __vite_glob_0_0$6, "../assets/fx/fx-bite.webp": __vite_glob_0_1$6, "../assets/fx/fx-bleed.webp": __vite_glob_0_2$6, "../assets/fx/fx-chains.webp": __vite_glob_0_3$6, "../assets/fx/fx-chill.webp": __vite_glob_0_4$6, "../assets/fx/fx-curse.webp": __vite_glob_0_5$6, "../assets/fx/fx-dive.webp": __vite_glob_0_6$5, "../assets/fx/fx-drain.webp": __vite_glob_0_7$5, "../assets/fx/fx-dust.webp": __vite_glob_0_8$5, "../assets/fx/fx-earth.webp": __vite_glob_0_9$5, "../assets/fx/fx-fire.webp": __vite_glob_0_10$5, "../assets/fx/fx-gust.webp": __vite_glob_0_11$5, "../assets/fx/fx-hatch.webp": __vite_glob_0_12$4, "../assets/fx/fx-heal.webp": __vite_glob_0_13$4, "../assets/fx/fx-ice.webp": __vite_glob_0_14$4, "../assets/fx/fx-kindle.webp": __vite_glob_0_15$3, "../assets/fx/fx-lash.webp": __vite_glob_0_16$3, "../assets/fx/fx-lightning.webp": __vite_glob_0_17$2, "../assets/fx/fx-mirror.webp": __vite_glob_0_18$2, "../assets/fx/fx-poison.webp": __vite_glob_0_19$2, "../assets/fx/fx-prism.webp": __vite_glob_0_20$2, "../assets/fx/fx-rally.webp": __vite_glob_0_21$2, "../assets/fx/fx-scratch.webp": __vite_glob_0_22$2, "../assets/fx/fx-shield.webp": __vite_glob_0_23$2, "../assets/fx/fx-shimmer.webp": __vite_glob_0_24$2, "../assets/fx/fx-slam.webp": __vite_glob_0_25$2, "../assets/fx/fx-slash.webp": __vite_glob_0_26$2, "../assets/fx/fx-smash.webp": __vite_glob_0_27$2, "../assets/fx/fx-sonar.webp": __vite_glob_0_28$2, "../assets/fx/fx-stab.webp": __vite_glob_0_29$2, "../assets/fx/fx-starfall.webp": __vite_glob_0_30$2, "../assets/fx/fx-static.webp": __vite_glob_0_31$2, "../assets/fx/fx-steam.webp": __vite_glob_0_32$2, "../assets/fx/fx-sting.webp": __vite_glob_0_33$2, "../assets/fx/fx-talon.webp": __vite_glob_0_34$1, "../assets/fx/fx-throw.webp": __vite_glob_0_35$1, "../assets/fx/fx-thump.webp": __vite_glob_0_36$1, "../assets/fx/fx-vines.webp": __vite_glob_0_37$1, "../assets/fx/fx-water.webp": __vite_glob_0_38$1, "../assets/fx/fx-web.webp": __vite_glob_0_39$1 });
const FX_URLS = {};
for (const [path, url] of Object.entries(fxFiles)) {
  const m = /fx-(\w+)\.webp$/.exec(path);
  if (m) FX_URLS[m[1]] = url;
}
const FX_ANCHORS = {
  fire: { feet: false, ground: 52 },
  ice: { feet: true, ground: 81 },
  lightning: { feet: true, ground: 93 },
  earth: { feet: true, ground: 80 },
  chill: { feet: true, ground: 90 },
  kindle: { feet: true, ground: 86 },
  static: { feet: true, ground: 85 },
  chains: { feet: true, ground: 102 },
  thump: { feet: false, ground: 52 },
  shield: { feet: false, ground: 54 },
  acid: { feet: false, ground: 47 },
  steam: { feet: false, ground: 50 },
  prism: { feet: false, ground: 45 },
  starfall: { feet: false, ground: 49 },
  shimmer: { feet: false, ground: 55 },
  mirror: { feet: false, ground: 52 },
  dive: { feet: false, ground: 50 },
  poison: { feet: false, ground: 50 },
  slam: { feet: true, ground: 104 },
  vines: { feet: true, ground: 93 },
  heal: { feet: true, ground: 97 },
  hatch: { feet: true, ground: 86 },
  rally: { feet: true, ground: 95 },
  water: { feet: true, ground: 97 },
  scratch: { feet: false, ground: 53 },
  bite: { feet: false, ground: 55 },
  slash: { feet: false, ground: 50 },
  stab: { feet: false, ground: 51 },
  smash: { feet: false, ground: 55 },
  lash: { feet: false, ground: 48 },
  sting: { feet: false, ground: 51 },
  talon: { feet: false, ground: 57 },
  throw: { feet: false, ground: 52 },
  web: { feet: false, ground: 52 },
  sonar: { feet: false, ground: 52 },
  curse: { feet: false, ground: 55 },
  dust: { feet: false, ground: 52 },
  bleed: { feet: false, ground: 57 },
  drain: { feet: false, ground: 44 },
  gust: { feet: false, ground: 54 }
};
const FX_ANIMS = { shaking: ["hit-shake"] };
const __vite_glob_0_0$5 = "" + new URL("class-battlemage-female-C4Th_pzt.webp", import.meta.url).href;
const __vite_glob_0_1$5 = "" + new URL("class-battlemage-male-CkYW10Qn.webp", import.meta.url).href;
const __vite_glob_0_2$5 = "" + new URL("class-berserker-female-CDc-AaDo.webp", import.meta.url).href;
const __vite_glob_0_3$5 = "" + new URL("class-berserker-male-BG1J-7a4.webp", import.meta.url).href;
const __vite_glob_0_4$5 = "" + new URL("class-bloodmage-female-M1IyjNZf.webp", import.meta.url).href;
const __vite_glob_0_5$5 = "" + new URL("class-bloodmage-male-B2whXGK2.webp", import.meta.url).href;
const __vite_glob_0_6$4 = "" + new URL("class-champion-female-CiCLOUoZ.webp", import.meta.url).href;
const __vite_glob_0_7$4 = "" + new URL("class-champion-male-BJqbIApy.webp", import.meta.url).href;
const __vite_glob_0_8$4 = "" + new URL("class-gladiator-female-DMB74_O7.webp", import.meta.url).href;
const __vite_glob_0_9$4 = "" + new URL("class-gladiator-male-CGSO-VKO.webp", import.meta.url).href;
const __vite_glob_0_10$4 = "" + new URL("class-marksman-female-CFYzK2MF.webp", import.meta.url).href;
const __vite_glob_0_11$4 = "" + new URL("class-marksman-male-Bo91w9fc.webp", import.meta.url).href;
const __vite_glob_0_12$3 = "" + new URL("class-monk-female-mANNHCsV.webp", import.meta.url).href;
const __vite_glob_0_13$3 = "" + new URL("class-monk-male-B3ebGjTl.webp", import.meta.url).href;
const __vite_glob_0_14$3 = "" + new URL("class-ninja-female-BOg3A7eb.webp", import.meta.url).href;
const __vite_glob_0_15$2 = "" + new URL("class-ninja-male-BZJft4XZ.webp", import.meta.url).href;
const __vite_glob_0_16$2 = "" + new URL("class-priest-female-D-BSQ9Ir.webp", import.meta.url).href;
const __vite_glob_0_17$1 = "" + new URL("class-priest-male-CfkHbPGR.webp", import.meta.url).href;
const __vite_glob_0_18$1 = "" + new URL("class-ranger-female-CXQOPQQ5.webp", import.meta.url).href;
const __vite_glob_0_19$1 = "" + new URL("class-ranger-male-NgxRxuxe.webp", import.meta.url).href;
const __vite_glob_0_20$1 = "" + new URL("class-reaver-female-DBMpxhqr.webp", import.meta.url).href;
const __vite_glob_0_21$1 = "" + new URL("class-reaver-male-DGRasytn.webp", import.meta.url).href;
const __vite_glob_0_22$1 = "" + new URL("class-saboteur-female-BQGeGxuB.webp", import.meta.url).href;
const __vite_glob_0_23$1 = "" + new URL("class-saboteur-male-CJd3fj2L.webp", import.meta.url).href;
const __vite_glob_0_24$1 = "" + new URL("class-spellblade-female-DQUU1HwF.webp", import.meta.url).href;
const __vite_glob_0_25$1 = "" + new URL("class-spellblade-male-CPDc4D96.webp", import.meta.url).href;
const __vite_glob_0_26$1 = "" + new URL("class-vagabond-female-xGb8aV6q.webp", import.meta.url).href;
const __vite_glob_0_27$1 = "" + new URL("class-vagabond-male-B1bi2GSW.webp", import.meta.url).href;
const __vite_glob_0_28$1 = "" + new URL("class-warlock-female-3G91HoFQ.webp", import.meta.url).href;
const __vite_glob_0_29$1 = "" + new URL("class-warlock-male-D_3eW-uC.webp", import.meta.url).href;
const __vite_glob_0_30$1 = "" + new URL("class-warrior-female-CUCY5vu9.webp", import.meta.url).href;
const __vite_glob_0_31$1 = "" + new URL("class-warrior-male-CRcNptob.webp", import.meta.url).href;
const __vite_glob_0_32$1 = "" + new URL("class-wizard-female-BPTTx4DX.webp", import.meta.url).href;
const __vite_glob_0_33$1 = "" + new URL("class-wizard-male-AHq9bRfB.webp", import.meta.url).href;
const __vite_glob_1_0$2 = "" + new URL("hero-battlemage-female-DfLOytMG.webp", import.meta.url).href;
const __vite_glob_1_1$2 = "" + new URL("hero-battlemage-male-EuI2VqnN.webp", import.meta.url).href;
const __vite_glob_1_2$2 = "" + new URL("hero-berserker-female-B61Jm-ew.webp", import.meta.url).href;
const __vite_glob_1_3$2 = "" + new URL("hero-berserker-male-F4J7mG1z.webp", import.meta.url).href;
const __vite_glob_1_4$2 = "" + new URL("hero-bloodmage-female-DTzPkhcq.webp", import.meta.url).href;
const __vite_glob_1_5$2 = "" + new URL("hero-bloodmage-male-D3aTM7AQ.webp", import.meta.url).href;
const __vite_glob_1_6$2 = "" + new URL("hero-champion-female-fCEHlVOZ.webp", import.meta.url).href;
const __vite_glob_1_7$2 = "" + new URL("hero-champion-male-Db1ZefXx.webp", import.meta.url).href;
const __vite_glob_1_8$2 = "" + new URL("hero-gladiator-female-pgkmI27e.webp", import.meta.url).href;
const __vite_glob_1_9$2 = "" + new URL("hero-gladiator-male-mcjbfU0P.webp", import.meta.url).href;
const __vite_glob_1_10$2 = "" + new URL("hero-marksman-female-BkdEMKua.webp", import.meta.url).href;
const __vite_glob_1_11$2 = "" + new URL("hero-marksman-male-C6gciIi-.webp", import.meta.url).href;
const __vite_glob_1_12$2 = "" + new URL("hero-monk-female-zkc7Ce6_.webp", import.meta.url).href;
const __vite_glob_1_13$2 = "" + new URL("hero-monk-male-B7ycGS6Y.webp", import.meta.url).href;
const __vite_glob_1_14$2 = "" + new URL("hero-ninja-female-CeWSwuyS.webp", import.meta.url).href;
const __vite_glob_1_15$2 = "" + new URL("hero-ninja-male-ZTm8rgjK.webp", import.meta.url).href;
const __vite_glob_1_16$2 = "" + new URL("hero-priest-female-Cvps1k0C.webp", import.meta.url).href;
const __vite_glob_1_17$2 = "" + new URL("hero-priest-male-CrdHZpOk.webp", import.meta.url).href;
const __vite_glob_1_18$2 = "" + new URL("hero-ranger-female-JuWD819k.webp", import.meta.url).href;
const __vite_glob_1_19$2 = "" + new URL("hero-ranger-male-Cl14B8fT.webp", import.meta.url).href;
const __vite_glob_1_20$1 = "" + new URL("hero-reaver-female-Cpa6BwoN.webp", import.meta.url).href;
const __vite_glob_1_21$1 = "" + new URL("hero-reaver-male-DkOxAHER.webp", import.meta.url).href;
const __vite_glob_1_22$1 = "" + new URL("hero-saboteur-female-D9UJ85DQ.webp", import.meta.url).href;
const __vite_glob_1_23$1 = "" + new URL("hero-saboteur-male-Bl-HkRU4.webp", import.meta.url).href;
const __vite_glob_1_24$1 = "" + new URL("hero-spellblade-female-Byqz_UYp.webp", import.meta.url).href;
const __vite_glob_1_25$1 = "" + new URL("hero-spellblade-male-DCwceWHu.webp", import.meta.url).href;
const __vite_glob_1_26$1 = "" + new URL("hero-vagabond-female-DTzi3hI5.webp", import.meta.url).href;
const __vite_glob_1_27$1 = "" + new URL("hero-vagabond-male-CWdVS3_d.webp", import.meta.url).href;
const __vite_glob_1_28$1 = "" + new URL("hero-warlock-female-HF7_8YMg.webp", import.meta.url).href;
const __vite_glob_1_29$1 = "" + new URL("hero-warlock-male-Br0d3bwt.webp", import.meta.url).href;
const __vite_glob_1_30$1 = "" + new URL("hero-warrior-female-Csojog4U.webp", import.meta.url).href;
const __vite_glob_1_31$1 = "" + new URL("hero-warrior-male-B7AQJigi.webp", import.meta.url).href;
const __vite_glob_1_32$1 = "" + new URL("hero-wizard-female-juqaZ2P3.webp", import.meta.url).href;
const __vite_glob_1_33$1 = "" + new URL("hero-wizard-male-BsxWU2Tq.webp", import.meta.url).href;
const __vite_glob_2_0$1 = "" + new URL("attack-warrior-male-T_h5AE6u.webp", import.meta.url).href;
const __vite_glob_3_0 = "" + new URL("weapon-warrior-male-axe-BgqdB_l0.webp", import.meta.url).href;
const __vite_glob_3_1 = "" + new URL("weapon-warrior-male-greatsword-DmdtGWce.webp", import.meta.url).href;
const __vite_glob_3_2 = "" + new URL("weapon-warrior-male-sword-bviIVF0B.webp", import.meta.url).href;
function listen(el, type, handler) {
  el.handlers ?? (el.handlers = {});
  if (!(type in el.handlers)) el.addEventListener(type, (event) => {
    var _a2, _b2;
    return (_b2 = (_a2 = el.handlers) == null ? void 0 : _a2[type]) == null ? void 0 : _b2.call(_a2, event);
  });
  el.handlers[type] = handler;
  el.hasListeners = true;
}
function adoptHandlers(old, next) {
  if (!(old instanceof Element) || !(next instanceof Element)) return;
  const o = old, n = next;
  if (o.handlers || n.handlers) {
    const handlers = n.handlers ?? {};
    for (const type of Object.keys(handlers)) if (!o.handlers || !(type in o.handlers)) listen(o, type, handlers[type]);
    o.handlers = { ...handlers };
  }
  const oc = old.children, nc = next.children;
  for (let i = 0; i < Math.min(oc.length, nc.length); i++) adoptHandlers(oc[i], nc[i]);
}
function h(tag, attrs = null, ...children) {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (value === void 0 || value === false) {
        continue;
      }
      if (key.startsWith("on") && typeof value === "function") {
        listen(el, key.slice(2), value);
      } else if (value === true) {
        el.setAttribute(key, "");
      } else {
        el.setAttribute(key, String(value));
      }
    }
  }
  append(el, children);
  return el;
}
function append(el, children) {
  for (const child of children) {
    if (child === null || child === void 0 || child === false) {
      continue;
    }
    if (Array.isArray(child)) {
      append(el, child);
    } else if (child instanceof Node) {
      el.appendChild(child);
    } else {
      el.appendChild(document.createTextNode(String(child)));
    }
  }
}
function svg(markup) {
  const wrap = document.createElement("span");
  wrap.innerHTML = markup;
  return wrap.firstElementChild;
}
function num(value, digits = 2) {
  const f = 10 ** digits;
  return String(Math.round(value * f) / f);
}
function fmt(value, digits = 0) {
  return value.toFixed(digits);
}
const spriteHeadroom = {
  "hero-battlemage-female": 12,
  "hero-battlemage-male": 12,
  "hero-berserker-female": 12,
  "hero-berserker-male": 12,
  "hero-bloodmage-female": 12,
  "hero-bloodmage-male": 12,
  "hero-champion-female": 12,
  "hero-champion-male": 12,
  "hero-gladiator-female": 12,
  "hero-gladiator-male": 12,
  "hero-marksman-female": 12,
  "hero-marksman-male": 12,
  "hero-monk-female": 12,
  "hero-monk-male": 12,
  "hero-ninja-female": 12,
  "hero-ninja-male": 12,
  "hero-priest-female": 12,
  "hero-priest-male": 12,
  "hero-ranger-female": 12,
  "hero-ranger-male": 12,
  "hero-reaver-female": 12,
  "hero-reaver-male": 12,
  "hero-saboteur-female": 12,
  "hero-saboteur-male": 12,
  "hero-spellblade-female": 12,
  "hero-spellblade-male": 12,
  "hero-vagabond-female": 12,
  "hero-vagabond-male": 12,
  "hero-warlock-female": 12,
  "hero-warlock-male": 12,
  "hero-warrior-female": 12,
  "hero-warrior-male": 12,
  "hero-wizard-female": 12,
  "hero-wizard-male": 12,
  "monster-acidSpitter": 55,
  "monster-alphaWolf": 44,
  "monster-amberBeetle": 46,
  "monster-amberEmpress": 35,
  "monster-ashImp": 45,
  "monster-ashenWyrm": 35,
  "monster-bandit": 14,
  "monster-banditCaptain": 7,
  "monster-barrowKnight": 11,
  "monster-bogHag": 35,
  "monster-bogLeech": 40,
  "monster-boneThrall": 18,
  "monster-brassSentry": 22,
  "monster-briarKing": 37,
  "monster-broodGuard": 25,
  "monster-broodmother": 63,
  "monster-caveBat": 56,
  "monster-caveSpider": 53,
  "monster-cinderHound": 47,
  "monster-clockworkKnight": 14,
  "monster-cloudSerpent": 16,
  "monster-cogSpider": 53,
  "monster-cragLynx": 27,
  "monster-cryptGhoul": 22,
  "monster-drownedKnight": 19,
  "monster-duskRegent": 35,
  "monster-emberColossus": 6,
  "monster-emberMote": 45,
  "monster-emberRevenant": 20,
  "monster-flameKnight": 27,
  "monster-forgeTitan": 35,
  "monster-forgeWarden": 23,
  "monster-frostRevenant": 27,
  "monster-frostToad": 48,
  "monster-galeKestrel": 48,
  "monster-goblin": 40,
  "monster-goblinBrute": 13,
  "monster-hiveDrone": 53,
  "monster-hiveQueen": 43,
  "monster-ironOverseer": 35,
  "monster-kobold": 40,
  "monster-koboldShaman": 35,
  "monster-lichAcolyte": 14,
  "monster-marshWisp": 35,
  "monster-mireMother": 38,
  "monster-mireStalker": 34,
  "monster-obsidianGolem": 11,
  "monster-oreGolem": 23,
  "monster-paleLich": 35,
  "monster-plagueBearer": 23,
  "monster-pretender": 35,
  "monster-rat": 65,
  "monster-riftHound": 50,
  "monster-riftMote": 50,
  "monster-riftStalker": 13,
  "monster-riftTyrant": 35,
  "monster-riftWarden": 35,
  "monster-salamander": 67,
  "monster-shardGolem": 15,
  "monster-shatteredKing": 35,
  "monster-shatteredKnight": 21,
  "monster-skeleton": 16,
  "monster-skyHarpy": 16,
  "monster-skySovereign": 44,
  "monster-smelterGolem": 16,
  "monster-sparkWisp": 46,
  "monster-starfallMote": 65,
  "monster-steamHound": 26,
  "monster-stormHarpy": 29,
  "monster-stormHawk": 29,
  "monster-stormHerald": 35,
  "monster-stormRevenant": 28,
  "monster-stormcaller": 24,
  "monster-stormveinColossus": 45,
  "monster-swarmling": 61,
  "monster-tempestRoc": 46,
  "monster-thornMantis": 19,
  "monster-throneSentinel": 7,
  "monster-thunderEagle": 15,
  "monster-thunderRam": 47,
  "monster-thunderbird": 48,
  "monster-troll": 42,
  "monster-veiledOracle": 35,
  "monster-voidWraith": 16,
  "monster-wailingShade": 24,
  "monster-windWarden": 12,
  "monster-wolf": 56,
  "monster-wyrmqueen": 40
};
const files$2 = /* @__PURE__ */ Object.assign({ "../assets/portraits/class-battlemage-female.webp": __vite_glob_0_0$5, "../assets/portraits/class-battlemage-male.webp": __vite_glob_0_1$5, "../assets/portraits/class-berserker-female.webp": __vite_glob_0_2$5, "../assets/portraits/class-berserker-male.webp": __vite_glob_0_3$5, "../assets/portraits/class-bloodmage-female.webp": __vite_glob_0_4$5, "../assets/portraits/class-bloodmage-male.webp": __vite_glob_0_5$5, "../assets/portraits/class-champion-female.webp": __vite_glob_0_6$4, "../assets/portraits/class-champion-male.webp": __vite_glob_0_7$4, "../assets/portraits/class-gladiator-female.webp": __vite_glob_0_8$4, "../assets/portraits/class-gladiator-male.webp": __vite_glob_0_9$4, "../assets/portraits/class-marksman-female.webp": __vite_glob_0_10$4, "../assets/portraits/class-marksman-male.webp": __vite_glob_0_11$4, "../assets/portraits/class-monk-female.webp": __vite_glob_0_12$3, "../assets/portraits/class-monk-male.webp": __vite_glob_0_13$3, "../assets/portraits/class-ninja-female.webp": __vite_glob_0_14$3, "../assets/portraits/class-ninja-male.webp": __vite_glob_0_15$2, "../assets/portraits/class-priest-female.webp": __vite_glob_0_16$2, "../assets/portraits/class-priest-male.webp": __vite_glob_0_17$1, "../assets/portraits/class-ranger-female.webp": __vite_glob_0_18$1, "../assets/portraits/class-ranger-male.webp": __vite_glob_0_19$1, "../assets/portraits/class-reaver-female.webp": __vite_glob_0_20$1, "../assets/portraits/class-reaver-male.webp": __vite_glob_0_21$1, "../assets/portraits/class-saboteur-female.webp": __vite_glob_0_22$1, "../assets/portraits/class-saboteur-male.webp": __vite_glob_0_23$1, "../assets/portraits/class-spellblade-female.webp": __vite_glob_0_24$1, "../assets/portraits/class-spellblade-male.webp": __vite_glob_0_25$1, "../assets/portraits/class-vagabond-female.webp": __vite_glob_0_26$1, "../assets/portraits/class-vagabond-male.webp": __vite_glob_0_27$1, "../assets/portraits/class-warlock-female.webp": __vite_glob_0_28$1, "../assets/portraits/class-warlock-male.webp": __vite_glob_0_29$1, "../assets/portraits/class-warrior-female.webp": __vite_glob_0_30$1, "../assets/portraits/class-warrior-male.webp": __vite_glob_0_31$1, "../assets/portraits/class-wizard-female.webp": __vite_glob_0_32$1, "../assets/portraits/class-wizard-male.webp": __vite_glob_0_33$1 });
const urls$2 = {};
for (const [path, url] of Object.entries(files$2)) {
  const m = /class-(\w+)-(female|male)\.webp$/.exec(path);
  if (m) urls$2[`${m[1]}-${m[2]}`] = url;
}
const F = "female", M = "male";
const looks = {
  Brenna: F,
  Garrick: M,
  Hild: F,
  Bram: M,
  Petra: F,
  Ryn: M,
  Tamsin: F,
  Wren: F,
  Corin: M,
  Ash: M,
  Isolde: F,
  Mirek: M,
  Sable: F,
  Odo: M,
  Vesna: F,
  Hask: M,
  Torva: F,
  Grim: M,
  Ulla: F,
  Bjorn: M,
  Lys: F,
  Corvin: M,
  Ilsa: F,
  Maren: F,
  Quill: M,
  Aldric: M,
  Seren: F,
  Tobin: M,
  Ysolde: F,
  Kael: M,
  Shen: M,
  Ilka: F,
  Doran: M,
  Mei: F,
  Tarek: M,
  Kaede: F,
  Sorrel: F,
  Jin: M,
  Nyx: F,
  Hollis: M,
  Alaric: M,
  Morwen: F,
  Zephyr: M,
  Ondine: F,
  Cyprian: M,
  Varro: M,
  Lucia: F,
  Draco: M,
  Brisa: F,
  Maximo: M,
  Vex: F,
  Nettle: F,
  Rask: M,
  Sienna: F,
  Tobias: M,
  Morrigan: F,
  Sanguin: M,
  Ilyra: F,
  Corvus: M,
  Ezra: M,
  Ragna: F,
  Thorvald: M,
  Ysra: F,
  Gunnar: M,
  Sigrun: F,
  Hawke: M,
  Linnea: F,
  Orrin: M,
  Talia: F,
  Severin: M,
  Malachai: M,
  Ysmay: F,
  Drust: M,
  Hespera: F,
  Oren: M,
  Aurelia: F,
  Cassian: M,
  Thea: F,
  Leander: M,
  Isra: F,
  Pip: M,
  Moss: M,
  Rook: M,
  Juniper: F,
  Fen: F
};
const spriteFiles = /* @__PURE__ */ Object.assign({ "../assets/heroes/hero-battlemage-female.webp": __vite_glob_1_0$2, "../assets/heroes/hero-battlemage-male.webp": __vite_glob_1_1$2, "../assets/heroes/hero-berserker-female.webp": __vite_glob_1_2$2, "../assets/heroes/hero-berserker-male.webp": __vite_glob_1_3$2, "../assets/heroes/hero-bloodmage-female.webp": __vite_glob_1_4$2, "../assets/heroes/hero-bloodmage-male.webp": __vite_glob_1_5$2, "../assets/heroes/hero-champion-female.webp": __vite_glob_1_6$2, "../assets/heroes/hero-champion-male.webp": __vite_glob_1_7$2, "../assets/heroes/hero-gladiator-female.webp": __vite_glob_1_8$2, "../assets/heroes/hero-gladiator-male.webp": __vite_glob_1_9$2, "../assets/heroes/hero-marksman-female.webp": __vite_glob_1_10$2, "../assets/heroes/hero-marksman-male.webp": __vite_glob_1_11$2, "../assets/heroes/hero-monk-female.webp": __vite_glob_1_12$2, "../assets/heroes/hero-monk-male.webp": __vite_glob_1_13$2, "../assets/heroes/hero-ninja-female.webp": __vite_glob_1_14$2, "../assets/heroes/hero-ninja-male.webp": __vite_glob_1_15$2, "../assets/heroes/hero-priest-female.webp": __vite_glob_1_16$2, "../assets/heroes/hero-priest-male.webp": __vite_glob_1_17$2, "../assets/heroes/hero-ranger-female.webp": __vite_glob_1_18$2, "../assets/heroes/hero-ranger-male.webp": __vite_glob_1_19$2, "../assets/heroes/hero-reaver-female.webp": __vite_glob_1_20$1, "../assets/heroes/hero-reaver-male.webp": __vite_glob_1_21$1, "../assets/heroes/hero-saboteur-female.webp": __vite_glob_1_22$1, "../assets/heroes/hero-saboteur-male.webp": __vite_glob_1_23$1, "../assets/heroes/hero-spellblade-female.webp": __vite_glob_1_24$1, "../assets/heroes/hero-spellblade-male.webp": __vite_glob_1_25$1, "../assets/heroes/hero-vagabond-female.webp": __vite_glob_1_26$1, "../assets/heroes/hero-vagabond-male.webp": __vite_glob_1_27$1, "../assets/heroes/hero-warlock-female.webp": __vite_glob_1_28$1, "../assets/heroes/hero-warlock-male.webp": __vite_glob_1_29$1, "../assets/heroes/hero-warrior-female.webp": __vite_glob_1_30$1, "../assets/heroes/hero-warrior-male.webp": __vite_glob_1_31$1, "../assets/heroes/hero-wizard-female.webp": __vite_glob_1_32$1, "../assets/heroes/hero-wizard-male.webp": __vite_glob_1_33$1 });
const spriteUrls = {};
for (const [path, url] of Object.entries(spriteFiles)) {
  const m = /hero-(\w+)-(female|male)\.webp$/.exec(path);
  if (m) spriteUrls[`${m[1]}-${m[2]}`] = url;
}
function heroSpriteHeadroom(hero) {
  return spriteHeadroom[`hero-${hero.classKey}-${heroLook(hero)}`] ?? 0;
}
const attackFiles = /* @__PURE__ */ Object.assign({ "../assets/heroes/anim/attack-warrior-male.webp": __vite_glob_2_0$1 });
const attackUrls = {};
for (const [path, url] of Object.entries(attackFiles)) {
  const m = /attack-(\w+)-(female|male)\.webp$/.exec(path);
  if (m) attackUrls[`${m[1]}-${m[2]}`] = url;
}
function heroAttackUrl(hero) {
  return attackUrls[`${hero.classKey}-${heroLook(hero)}`];
}
const weaponFiles = /* @__PURE__ */ Object.assign({ "../assets/heroes/weapons/weapon-warrior-male-axe.webp": __vite_glob_3_0, "../assets/heroes/weapons/weapon-warrior-male-greatsword.webp": __vite_glob_3_1, "../assets/heroes/weapons/weapon-warrior-male-sword.webp": __vite_glob_3_2 });
const weaponUrls = {};
for (const [path, url] of Object.entries(weaponFiles)) {
  const m = /weapon-(\w+)-(female|male)-(\w+)\.webp$/.exec(path);
  if (m) (weaponUrls[_b = `${m[1]}-${m[2]}`] ?? (weaponUrls[_b] = {}))[m[3]] = url;
}
function heroWeaponSprites(hero) {
  return weaponUrls[`${hero.classKey}-${heroLook(hero)}`] ?? {};
}
function heroSpriteUrl(hero) {
  return spriteUrls[`${hero.classKey}-${heroLook(hero)}`];
}
function heroLook(hero) {
  const base = hero.name.split(" ")[0];
  let look = looks[base];
  if (!look) {
    let n = 0;
    for (const ch of hero.id ?? hero.name) n = n * 31 + ch.charCodeAt(0) >>> 0;
    look = n % 2 ? F : M;
  }
  return look;
}
function portraitUrl(hero) {
  const base = hero.name.split(" ")[0];
  let look = looks[base];
  if (!look) {
    let n = 0;
    for (const ch of hero.id ?? hero.name) n = n * 31 + ch.charCodeAt(0) >>> 0;
    look = n % 2 ? F : M;
  }
  return urls$2[`${hero.classKey}-${look}`];
}
function heroPortrait(hero, className = "") {
  const url = portraitUrl(hero);
  return url ? h("img", { class: "portrait " + className, src: url, alt: "", draggable: "false" }) : null;
}
const __vite_glob_0_0$4 = "" + new URL("amulet-qCndY_Cx.webp", import.meta.url).href;
const __vite_glob_0_1$4 = "" + new URL("axe-CvsZOHas.webp", import.meta.url).href;
const __vite_glob_0_2$4 = "" + new URL("belt-CeS-w7iL.webp", import.meta.url).href;
const __vite_glob_0_3$4 = "" + new URL("bodyArmor-DKE7uST7.webp", import.meta.url).href;
const __vite_glob_0_4$4 = "" + new URL("boots-BZA3DGdO.webp", import.meta.url).href;
const __vite_glob_0_5$4 = "" + new URL("bow-CFAChg0A.webp", import.meta.url).href;
const __vite_glob_0_6$3 = "" + new URL("dagger-CQ6OmBB0.webp", import.meta.url).href;
const __vite_glob_0_7$3 = "" + new URL("gloves-CqE9u2dh.webp", import.meta.url).href;
const __vite_glob_0_8$3 = "" + new URL("greatsword-DUMJ7qLK.webp", import.meta.url).href;
const __vite_glob_0_9$3 = "" + new URL("helmet-DLvzvq5v.webp", import.meta.url).href;
const __vite_glob_0_10$3 = "" + new URL("ring-VN1DNLQ5.webp", import.meta.url).href;
const __vite_glob_0_11$3 = "" + new URL("shield-DF0Vt6dP.webp", import.meta.url).href;
const __vite_glob_0_12$2 = "" + new URL("staff-C3c8UAFk.webp", import.meta.url).href;
const __vite_glob_0_13$2 = "" + new URL("sword-LGQi9dml.webp", import.meta.url).href;
const __vite_glob_0_14$2 = "" + new URL("wand-D64PxnLV.webp", import.meta.url).href;
const __vite_glob_1_0$1 = "" + new URL("amulet-high-BciKk2D9.webp", import.meta.url).href;
const __vite_glob_1_1$1 = "" + new URL("amulet-low-DTq6Mqqx.webp", import.meta.url).href;
const __vite_glob_1_2$1 = "" + new URL("amulet-mid-BXYOMq1d.webp", import.meta.url).href;
const __vite_glob_1_3$1 = "" + new URL("axe-high-fire-BnfKQHrr.webp", import.meta.url).href;
const __vite_glob_1_4$1 = "" + new URL("axe-high-lightning-Bv97igUh.webp", import.meta.url).href;
const __vite_glob_1_5$1 = "" + new URL("axe-high-SzbTqZOQ.webp", import.meta.url).href;
const __vite_glob_1_6$1 = "" + new URL("axe-low-cold-B8S5si-W.webp", import.meta.url).href;
const __vite_glob_1_7$1 = "" + new URL("axe-low-fire-CXGOth00.webp", import.meta.url).href;
const __vite_glob_1_8$1 = "" + new URL("axe-low-lightning-BRNWAVmm.webp", import.meta.url).href;
const __vite_glob_1_9$1 = "" + new URL("axe-low-BrClXvd5.webp", import.meta.url).href;
const __vite_glob_1_10$1 = "" + new URL("axe-mid-cold-9IIPVsaT.webp", import.meta.url).href;
const __vite_glob_1_11$1 = "" + new URL("axe-mid-fire-DMP83EDC.webp", import.meta.url).href;
const __vite_glob_1_12$1 = "" + new URL("axe-mid-lightning-BxhOZOM6.webp", import.meta.url).href;
const __vite_glob_1_13$1 = "" + new URL("axe-mid-D7WE-nIB.webp", import.meta.url).href;
const __vite_glob_1_14$1 = "" + new URL("belt-high-BjUWqmsM.webp", import.meta.url).href;
const __vite_glob_1_15$1 = "" + new URL("belt-low-0yMlpjaB.webp", import.meta.url).href;
const __vite_glob_1_16$1 = "" + new URL("belt-mid-D-v-8hRc.webp", import.meta.url).href;
const __vite_glob_1_17$1 = "" + new URL("bodyArmor-high-armor-CndmeG3T.webp", import.meta.url).href;
const __vite_glob_1_18$1 = "" + new URL("bodyArmor-high-evasion-BsS9psnc.webp", import.meta.url).href;
const __vite_glob_1_19$1 = "" + new URL("bodyArmor-high-ward-TbAKXVAh.webp", import.meta.url).href;
const __vite_glob_1_20 = "" + new URL("bodyArmor-low-armor-D5sksL0V.webp", import.meta.url).href;
const __vite_glob_1_21 = "" + new URL("bodyArmor-low-evasion-CPgJxFRt.webp", import.meta.url).href;
const __vite_glob_1_22 = "" + new URL("bodyArmor-low-ward-g56hGitk.webp", import.meta.url).href;
const __vite_glob_1_23 = "" + new URL("bodyArmor-mid-armor-Cl4wXxc0.webp", import.meta.url).href;
const __vite_glob_1_24 = "" + new URL("bodyArmor-mid-evasion-C5rkQfj7.webp", import.meta.url).href;
const __vite_glob_1_25 = "" + new URL("bodyArmor-mid-ward-DgmiLWp_.webp", import.meta.url).href;
const __vite_glob_1_26 = "" + new URL("boots-high-armor-BHuAHlPP.webp", import.meta.url).href;
const __vite_glob_1_27 = "" + new URL("boots-high-evasion-CMsx5SCR.webp", import.meta.url).href;
const __vite_glob_1_28 = "" + new URL("boots-high-ward-CR611tbj.webp", import.meta.url).href;
const __vite_glob_1_29 = "" + new URL("boots-low-armor-D9fQaONL.webp", import.meta.url).href;
const __vite_glob_1_30 = "" + new URL("boots-low-evasion-Btj8YUyb.webp", import.meta.url).href;
const __vite_glob_1_31 = "" + new URL("boots-low-ward-D19AqTFV.webp", import.meta.url).href;
const __vite_glob_1_32 = "" + new URL("boots-mid-armor-CrKWMf6J.webp", import.meta.url).href;
const __vite_glob_1_33 = "" + new URL("boots-mid-evasion-CqsaTv9p.webp", import.meta.url).href;
const __vite_glob_1_34 = "" + new URL("boots-mid-ward-DdgB-2DB.webp", import.meta.url).href;
const __vite_glob_1_35 = "" + new URL("bow-high-fire-gu6AmEf_.webp", import.meta.url).href;
const __vite_glob_1_36 = "" + new URL("bow-high-lightning-CTp26l4j.webp", import.meta.url).href;
const __vite_glob_1_37 = "" + new URL("bow-high-D2leaELJ.webp", import.meta.url).href;
const __vite_glob_1_38 = "" + new URL("bow-low-cold-tXRxOj5M.webp", import.meta.url).href;
const __vite_glob_1_39 = "" + new URL("bow-low-fire-hIllRG__.webp", import.meta.url).href;
const __vite_glob_1_40 = "" + new URL("bow-low-lightning-lip8BDuY.webp", import.meta.url).href;
const __vite_glob_1_41 = "" + new URL("bow-low-Bwq71wFC.webp", import.meta.url).href;
const __vite_glob_1_42 = "" + new URL("bow-mid-cold-CMciTdz3.webp", import.meta.url).href;
const __vite_glob_1_43 = "" + new URL("bow-mid-fire-BWSmpJx1.webp", import.meta.url).href;
const __vite_glob_1_44 = "" + new URL("bow-mid-lightning-DQGZQ71-.webp", import.meta.url).href;
const __vite_glob_1_45 = "" + new URL("bow-mid-C6ZOJZMA.webp", import.meta.url).href;
const __vite_glob_1_46 = "" + new URL("dagger-high-fire-D8jaCH-Y.webp", import.meta.url).href;
const __vite_glob_1_47 = "" + new URL("dagger-high-lightning-BFR0igT8.webp", import.meta.url).href;
const __vite_glob_1_48 = "" + new URL("dagger-high-BXvbM7po.webp", import.meta.url).href;
const __vite_glob_1_49 = "" + new URL("dagger-low-cold-0M1faVKl.webp", import.meta.url).href;
const __vite_glob_1_50 = "" + new URL("dagger-low-fire-C114TEP9.webp", import.meta.url).href;
const __vite_glob_1_51 = "" + new URL("dagger-low-lightning-BMP7WluO.webp", import.meta.url).href;
const __vite_glob_1_52 = "" + new URL("dagger-low-Bj9Tn1MO.webp", import.meta.url).href;
const __vite_glob_1_53 = "" + new URL("dagger-mid-cold-C-z8oK8g.webp", import.meta.url).href;
const __vite_glob_1_54 = "" + new URL("dagger-mid-fire-tFhKYEA-.webp", import.meta.url).href;
const __vite_glob_1_55 = "" + new URL("dagger-mid-lightning-Brf5ysqD.webp", import.meta.url).href;
const __vite_glob_1_56 = "" + new URL("dagger-mid-DRNmidNj.webp", import.meta.url).href;
const __vite_glob_1_57 = "" + new URL("gloves-high-armor-Brj-QyJf.webp", import.meta.url).href;
const __vite_glob_1_58 = "" + new URL("gloves-high-evasion-kFY3jKhs.webp", import.meta.url).href;
const __vite_glob_1_59 = "" + new URL("gloves-high-ward-CqnRBYIl.webp", import.meta.url).href;
const __vite_glob_1_60 = "" + new URL("gloves-low-armor-BLsK8P-D.webp", import.meta.url).href;
const __vite_glob_1_61 = "" + new URL("gloves-low-evasion-BxbkARDE.webp", import.meta.url).href;
const __vite_glob_1_62 = "" + new URL("gloves-low-ward-B9XcEM07.webp", import.meta.url).href;
const __vite_glob_1_63 = "" + new URL("gloves-mid-armor-Ctv9Lx6Y.webp", import.meta.url).href;
const __vite_glob_1_64 = "" + new URL("gloves-mid-evasion-ZFRM6epj.webp", import.meta.url).href;
const __vite_glob_1_65 = "" + new URL("gloves-mid-ward-Dzf_PoBz.webp", import.meta.url).href;
const __vite_glob_1_66 = "" + new URL("greatsword-high-fire-CLLkOsAX.webp", import.meta.url).href;
const __vite_glob_1_67 = "" + new URL("greatsword-high-lightning-D1aoBTCs.webp", import.meta.url).href;
const __vite_glob_1_68 = "" + new URL("greatsword-high-BeaJzMkr.webp", import.meta.url).href;
const __vite_glob_1_69 = "" + new URL("greatsword-low-cold-D2hvF4aK.webp", import.meta.url).href;
const __vite_glob_1_70 = "" + new URL("greatsword-low-fire-BB2gb070.webp", import.meta.url).href;
const __vite_glob_1_71 = "" + new URL("greatsword-low-lightning-BvfwJ2Fe.webp", import.meta.url).href;
const __vite_glob_1_72 = "" + new URL("greatsword-low-Bdpq9Q77.webp", import.meta.url).href;
const __vite_glob_1_73 = "" + new URL("greatsword-mid-cold-COas9AoC.webp", import.meta.url).href;
const __vite_glob_1_74 = "" + new URL("greatsword-mid-fire-DIbXxFTN.webp", import.meta.url).href;
const __vite_glob_1_75 = "" + new URL("greatsword-mid-lightning-BrkjysY5.webp", import.meta.url).href;
const __vite_glob_1_76 = "" + new URL("greatsword-mid-BS9XqQD-.webp", import.meta.url).href;
const __vite_glob_1_77 = "" + new URL("helmet-high-armor-BNvSXpqI.webp", import.meta.url).href;
const __vite_glob_1_78 = "" + new URL("helmet-high-evasion-BGjtnBhf.webp", import.meta.url).href;
const __vite_glob_1_79 = "" + new URL("helmet-high-ward-CpTVSE8_.webp", import.meta.url).href;
const __vite_glob_1_80 = "" + new URL("helmet-low-armor-10GbvaJu.webp", import.meta.url).href;
const __vite_glob_1_81 = "" + new URL("helmet-low-evasion-BaBSW13C.webp", import.meta.url).href;
const __vite_glob_1_82 = "" + new URL("helmet-low-ward-CIKpfhYM.webp", import.meta.url).href;
const __vite_glob_1_83 = "" + new URL("helmet-mid-armor-tv1tUl3W.webp", import.meta.url).href;
const __vite_glob_1_84 = "" + new URL("helmet-mid-evasion-DZjdefkX.webp", import.meta.url).href;
const __vite_glob_1_85 = "" + new URL("helmet-mid-ward-rxyE516H.webp", import.meta.url).href;
const __vite_glob_1_86 = "" + new URL("ring-high-C9qMsCtP.webp", import.meta.url).href;
const __vite_glob_1_87 = "" + new URL("ring-low-DGfuyw01.webp", import.meta.url).href;
const __vite_glob_1_88 = "" + new URL("ring-mid-DounLwbB.webp", import.meta.url).href;
const __vite_glob_1_89 = "" + new URL("shield-high-armor-CdlajzD8.webp", import.meta.url).href;
const __vite_glob_1_90 = "" + new URL("shield-high-evasion-DXiEgiRp.webp", import.meta.url).href;
const __vite_glob_1_91 = "" + new URL("shield-high-ward-aXXG3oIw.webp", import.meta.url).href;
const __vite_glob_1_92 = "" + new URL("shield-low-armor-Dh4Ka4GD.webp", import.meta.url).href;
const __vite_glob_1_93 = "" + new URL("shield-low-evasion-C9Y1bjt0.webp", import.meta.url).href;
const __vite_glob_1_94 = "" + new URL("shield-low-ward-B7vBep2_.webp", import.meta.url).href;
const __vite_glob_1_95 = "" + new URL("shield-mid-armor-DLNq5_Qj.webp", import.meta.url).href;
const __vite_glob_1_96 = "" + new URL("shield-mid-evasion-BFd_Mrrz.webp", import.meta.url).href;
const __vite_glob_1_97 = "" + new URL("shield-mid-ward-Bo3ck4mA.webp", import.meta.url).href;
const __vite_glob_1_98 = "" + new URL("staff-high-fire-aDKnDnA7.webp", import.meta.url).href;
const __vite_glob_1_99 = "" + new URL("staff-high-lightning-D0L4lPc9.webp", import.meta.url).href;
const __vite_glob_1_100 = "" + new URL("staff-high-ZKQq94i3.webp", import.meta.url).href;
const __vite_glob_1_101 = "" + new URL("staff-low-cold-HaCYanmd.webp", import.meta.url).href;
const __vite_glob_1_102 = "" + new URL("staff-low-fire-DuQOAESI.webp", import.meta.url).href;
const __vite_glob_1_103 = "" + new URL("staff-low-lightning-DqlUuorm.webp", import.meta.url).href;
const __vite_glob_1_104 = "" + new URL("staff-low-V3Ix-CaE.webp", import.meta.url).href;
const __vite_glob_1_105 = "" + new URL("staff-mid-cold-D1G14B1c.webp", import.meta.url).href;
const __vite_glob_1_106 = "" + new URL("staff-mid-fire-EWldpqGR.webp", import.meta.url).href;
const __vite_glob_1_107 = "" + new URL("staff-mid-lightning-BoJJ8nav.webp", import.meta.url).href;
const __vite_glob_1_108 = "" + new URL("staff-mid-D_om3vH5.webp", import.meta.url).href;
const __vite_glob_1_109 = "" + new URL("sword-high-fire-BEChfF05.webp", import.meta.url).href;
const __vite_glob_1_110 = "" + new URL("sword-high-lightning-Cw9JdCM4.webp", import.meta.url).href;
const __vite_glob_1_111 = "" + new URL("sword-high-C657o0yQ.webp", import.meta.url).href;
const __vite_glob_1_112 = "" + new URL("sword-low-cold-DsZ8rBrZ.webp", import.meta.url).href;
const __vite_glob_1_113 = "" + new URL("sword-low-fire-BrPns5Sy.webp", import.meta.url).href;
const __vite_glob_1_114 = "" + new URL("sword-low-lightning-D0c0s2EH.webp", import.meta.url).href;
const __vite_glob_1_115 = "" + new URL("sword-low-CL1RdOCA.webp", import.meta.url).href;
const __vite_glob_1_116 = "" + new URL("sword-mid-cold-CYAumM29.webp", import.meta.url).href;
const __vite_glob_1_117 = "" + new URL("sword-mid-fire-MsmgNAf2.webp", import.meta.url).href;
const __vite_glob_1_118 = "" + new URL("sword-mid-lightning-CMSEHAWZ.webp", import.meta.url).href;
const __vite_glob_1_119 = "" + new URL("sword-mid-DQl8D2sw.webp", import.meta.url).href;
const __vite_glob_1_120 = "" + new URL("wand-high-fire-gm72yWSq.webp", import.meta.url).href;
const __vite_glob_1_121 = "" + new URL("wand-high-lightning-BpakVZ5-.webp", import.meta.url).href;
const __vite_glob_1_122 = "" + new URL("wand-high-DlWWgWO-.webp", import.meta.url).href;
const __vite_glob_1_123 = "" + new URL("wand-low-cold-Cr7gsdVp.webp", import.meta.url).href;
const __vite_glob_1_124 = "" + new URL("wand-low-fire-DnOXxgrw.webp", import.meta.url).href;
const __vite_glob_1_125 = "" + new URL("wand-low-lightning--CnPu1ev.webp", import.meta.url).href;
const __vite_glob_1_126 = "" + new URL("wand-low-D_eaZUAK.webp", import.meta.url).href;
const __vite_glob_1_127 = "" + new URL("wand-mid-cold-CP0ArvFX.webp", import.meta.url).href;
const __vite_glob_1_128 = "" + new URL("wand-mid-fire-CJ3jFjqC.webp", import.meta.url).href;
const __vite_glob_1_129 = "" + new URL("wand-mid-lightning-98lswxw6.webp", import.meta.url).href;
const __vite_glob_1_130 = "" + new URL("wand-mid-CKg_OuO6.webp", import.meta.url).href;
const __vite_glob_2_0 = "" + new URL("amber-CXVyZdNX.webp", import.meta.url).href;
const __vite_glob_2_1 = "" + new URL("amberKey-CcAL-PoX.webp", import.meta.url).href;
const __vite_glob_2_2 = "" + new URL("amberResin-BJxRlEaR.webp", import.meta.url).href;
const __vite_glob_2_3 = "" + new URL("ancientBone-D0Uh48e7.webp", import.meta.url).href;
const __vite_glob_2_4 = "" + new URL("barrowSteel-gcy70LSs.webp", import.meta.url).href;
const __vite_glob_2_5 = "" + new URL("blackPearl-D0-oPw6L.webp", import.meta.url).href;
const __vite_glob_2_6 = "" + new URL("bloodstone-SeZJUXk9.webp", import.meta.url).href;
const __vite_glob_2_7 = "" + new URL("bogIron-BwZxFVzN.webp", import.meta.url).href;
const __vite_glob_2_8 = "" + new URL("boneMarrow-CF3D05tg.webp", import.meta.url).href;
const __vite_glob_2_9 = "" + new URL("boneShard-HgCeyiQ-.webp", import.meta.url).href;
const __vite_glob_2_10 = "" + new URL("borrowedCrown-gJMqZnzx.webp", import.meta.url).href;
const __vite_glob_2_11 = "" + new URL("brassPlate-DVbnZSPF.webp", import.meta.url).href;
const __vite_glob_2_12 = "" + new URL("briarcrown-s7SpEr4z.webp", import.meta.url).href;
const __vite_glob_2_13 = "" + new URL("brilliantOpal-X2zpfHEG.webp", import.meta.url).href;
const __vite_glob_2_14 = "" + new URL("brilliantSunstone-Bn-Sw1AC.webp", import.meta.url).href;
const __vite_glob_2_15 = "" + new URL("brilliantTigerEye-BTPiZC3t.webp", import.meta.url).href;
const __vite_glob_2_16 = "" + new URL("brimstone-B2V0F__A.webp", import.meta.url).href;
const __vite_glob_2_17 = "" + new URL("broodfang-DtynomKD.webp", import.meta.url).href;
const __vite_glob_2_18 = "" + new URL("cinderwool-zRABQQnP.webp", import.meta.url).href;
const __vite_glob_2_19 = "" + new URL("cogKey-BZLtPHaX.webp", import.meta.url).href;
const __vite_glob_2_20 = "" + new URL("cogwheel-DyFOQa3Q.webp", import.meta.url).href;
const __vite_glob_2_21 = "" + new URL("coolingOil-DRusQ3QP.webp", import.meta.url).href;
const __vite_glob_2_22 = "" + new URL("copperOre-CaNtq0PS.webp", import.meta.url).href;
const __vite_glob_2_23 = "" + new URL("cragGranite-OZ_aKUDZ.webp", import.meta.url).href;
const __vite_glob_2_24 = "" + new URL("crownShard-kEEDqUDN.webp", import.meta.url).href;
const __vite_glob_2_25 = "" + new URL("cryptPlate-xq1ioNTJ.webp", import.meta.url).href;
const __vite_glob_2_26 = "" + new URL("deathcap-WnzYlIIn.webp", import.meta.url).href;
const __vite_glob_2_27 = "" + new URL("deepfireCore-CWL9nHrz.webp", import.meta.url).href;
const __vite_glob_2_28 = "" + new URL("drownedSteel-CrGZI2ji.webp", import.meta.url).href;
const __vite_glob_2_29 = "" + new URL("eagleTalon-hDMaJHIk.webp", import.meta.url).href;
const __vite_glob_2_30 = "" + new URL("eelskin-FDpTmdX_.webp", import.meta.url).href;
const __vite_glob_2_31 = "" + new URL("emberOfAges-z5X8af6M.webp", import.meta.url).href;
const __vite_glob_2_32 = "" + new URL("emerald-B4HRfVYg.webp", import.meta.url).href;
const __vite_glob_2_33 = "" + new URL("emeraldShard-B8tM8-CG.webp", import.meta.url).href;
const __vite_glob_2_34 = "" + new URL("empressStinger-CpMKQvXC.webp", import.meta.url).href;
const __vite_glob_2_35 = "" + new URL("flawlessEmerald-CBZbLjhe.webp", import.meta.url).href;
const __vite_glob_2_36 = "" + new URL("flawlessRuby-euPEkRmQ.webp", import.meta.url).href;
const __vite_glob_2_37 = "" + new URL("flawlessSapphire-Bop3z5Ui.webp", import.meta.url).href;
const __vite_glob_2_38 = "" + new URL("flint-BuI-2Zjq.webp", import.meta.url).href;
const __vite_glob_2_39 = "" + new URL("forgeheart-C8X1w307.webp", import.meta.url).href;
const __vite_glob_2_40 = "" + new URL("furnaceCore-CbXirfHO.webp", import.meta.url).href;
const __vite_glob_2_41 = "" + new URL("galeFeather-CsxLY6gm.webp", import.meta.url).href;
const __vite_glob_2_42 = "" + new URL("galeKey-DwAbih0O.webp", import.meta.url).href;
const __vite_glob_2_43 = "" + new URL("galeSilk-vuTpHb5c.webp", import.meta.url).href;
const __vite_glob_2_44 = "" + new URL("garnet-y2oJn5W7.webp", import.meta.url).href;
const __vite_glob_2_45 = "" + new URL("glacialHeart-DkNQ8MR1.webp", import.meta.url).href;
const __vite_glob_2_46 = "" + new URL("golemHeart-Cfk4-c0g.webp", import.meta.url).href;
const __vite_glob_2_47 = "" + new URL("graveIron-B_tRSYwj.webp", import.meta.url).href;
const __vite_glob_2_48 = "" + new URL("graveKey-CBLpxrxu.webp", import.meta.url).href;
const __vite_glob_2_49 = "" + new URL("hagstone-3e75nhIE.webp", import.meta.url).href;
const __vite_glob_2_50 = "" + new URL("hawkFeather-AL2l4Cg9.webp", import.meta.url).href;
const __vite_glob_2_51 = "" + new URL("healingMoss-BxzKdWQ3.webp", import.meta.url).href;
const __vite_glob_2_52 = "" + new URL("heraldBolt-BlO6t6Bz.webp", import.meta.url).href;
const __vite_glob_2_53 = "" + new URL("hiveChitin-Boc1eO13.webp", import.meta.url).href;
const __vite_glob_2_54 = "" + new URL("hiveWax-CsH7_Njy.webp", import.meta.url).href;
const __vite_glob_2_55 = "" + new URL("hiveheart-CK3_oh52.webp", import.meta.url).href;
const __vite_glob_2_56 = "" + new URL("ironOre-DG3x0aN9.webp", import.meta.url).href;
const __vite_glob_2_57 = "" + new URL("kingsSteel-DdgsXp3J.webp", import.meta.url).href;
const __vite_glob_2_58 = "" + new URL("leechSac-B5gdc6kq.webp", import.meta.url).href;
const __vite_glob_2_59 = "" + new URL("mainspring-7DTCegpD.webp", import.meta.url).href;
const __vite_glob_2_60 = "" + new URL("mantisScythe-DAQPkoog.webp", import.meta.url).href;
const __vite_glob_2_61 = "" + new URL("marshReed-CSQ1rDUb.webp", import.meta.url).href;
const __vite_glob_2_62 = "" + new URL("mireheart-B8LXfwDq.webp", import.meta.url).href;
const __vite_glob_2_63 = "" + new URL("mithril-VZ2oRaWx.webp", import.meta.url).href;
const __vite_glob_2_64 = "" + new URL("moonstone-Bj-ycWb8.webp", import.meta.url).href;
const __vite_glob_2_65 = "" + new URL("obsidian-Cfe5RLnb.webp", import.meta.url).href;
const __vite_glob_2_66 = "" + new URL("opal-CR9_T6Ir.webp", import.meta.url).href;
const __vite_glob_2_67 = "" + new URL("oracleEye-C7t9ePF8.webp", import.meta.url).href;
const __vite_glob_2_68 = "" + new URL("overseerSeal-DxFPD0P_.webp", import.meta.url).href;
const __vite_glob_2_69 = "" + new URL("ozoneShard-D-KfPVCi.webp", import.meta.url).href;
const __vite_glob_2_70 = "" + new URL("paleCrown-CNQZjG5X.webp", import.meta.url).href;
const __vite_glob_2_71 = "" + new URL("peatmoss-Cy0smkxS.webp", import.meta.url).href;
const __vite_glob_2_72 = "" + new URL("phoenixFeather-BKLRBPSL.webp", import.meta.url).href;
const __vite_glob_2_73 = "" + new URL("polishedOpal-HTGpJCdl.webp", import.meta.url).href;
const __vite_glob_2_74 = "" + new URL("polishedSunstone-BIh9Qf9Z.webp", import.meta.url).href;
const __vite_glob_2_75 = "" + new URL("polishedTigerEye-Bdc2CV7J.webp", import.meta.url).href;
const __vite_glob_2_76 = "" + new URL("prismShard-BQfKDqlm.webp", import.meta.url).href;
const __vite_glob_2_77 = "" + new URL("prismaticEye-CQkRHd_2.webp", import.meta.url).href;
const __vite_glob_2_78 = "" + new URL("queenCarapace-BIlUZIzj.webp", import.meta.url).href;
const __vite_glob_2_79 = "" + new URL("quicksilver-DwuUZrb4.webp", import.meta.url).href;
const __vite_glob_2_80 = "" + new URL("radiantEmerald-DkERiMHp.webp", import.meta.url).href;
const __vite_glob_2_81 = "" + new URL("radiantRuby-f24LVXMO.webp", import.meta.url).href;
const __vite_glob_2_82 = "" + new URL("radiantSapphire-o7vld6Lp.webp", import.meta.url).href;
const __vite_glob_2_83 = "" + new URL("regentPhylactery-BY3jK4cC.webp", import.meta.url).href;
const __vite_glob_2_84 = "" + new URL("riftEssence-DBVxpwAK.webp", import.meta.url).href;
const __vite_glob_2_85 = "" + new URL("riftGlass-BcJo2jj9.webp", import.meta.url).href;
const __vite_glob_2_86 = "" + new URL("riftheart-CNT2iy8O.webp", import.meta.url).href;
const __vite_glob_2_87 = "" + new URL("riftmetal-DB3sEamj.webp", import.meta.url).href;
const __vite_glob_2_88 = "" + new URL("riftsteel-J2BVcW8V.webp", import.meta.url).href;
const __vite_glob_2_89 = "" + new URL("rimecoal-D4YcYZbC.webp", import.meta.url).href;
const __vite_glob_2_90 = "" + new URL("ritualAsh-DBUDfxTY.webp", import.meta.url).href;
const __vite_glob_2_91 = "" + new URL("rocPlume-B-561mcx.webp", import.meta.url).href;
const __vite_glob_2_92 = "" + new URL("roughHide-CM280nik.webp", import.meta.url).href;
const __vite_glob_2_93 = "" + new URL("roughOpal-Dzx0yXby.webp", import.meta.url).href;
const __vite_glob_2_94 = "" + new URL("roughSunstone-I2pCi25L.webp", import.meta.url).href;
const __vite_glob_2_95 = "" + new URL("roughTigerEye-De9JKS0C.webp", import.meta.url).href;
const __vite_glob_2_96 = "" + new URL("royalJelly-x2modIdv.webp", import.meta.url).href;
const __vite_glob_2_97 = "" + new URL("ruby-r6nqyoEM.webp", import.meta.url).href;
const __vite_glob_2_98 = "" + new URL("rubyShard-BjY2Jq6X.webp", import.meta.url).href;
const __vite_glob_2_99 = "" + new URL("runedSlate-DImyad4R.webp", import.meta.url).href;
const __vite_glob_2_100 = "" + new URL("salamanderScale-C3Q8Mnsp.webp", import.meta.url).href;
const __vite_glob_2_101 = "" + new URL("sanctumShard-BcaXIrl7.webp", import.meta.url).href;
const __vite_glob_2_102 = "" + new URL("sapphire-XAHvueXX.webp", import.meta.url).href;
const __vite_glob_2_103 = "" + new URL("sapphireShard-D7Ha3EXW.webp", import.meta.url).href;
const __vite_glob_2_104 = "" + new URL("shatterglass-COVRD7N2.webp", import.meta.url).href;
const __vite_glob_2_105 = "" + new URL("shroudCloth-UZ6yjuLm.webp", import.meta.url).href;
const __vite_glob_2_106 = "" + new URL("silverOre-TpPDL5E1.webp", import.meta.url).href;
const __vite_glob_2_107 = "" + new URL("sinew-DLfFrmzo.webp", import.meta.url).href;
const __vite_glob_2_108 = "" + new URL("skyFeather-RA01ZZk5.webp", import.meta.url).href;
const __vite_glob_2_109 = "" + new URL("skyforged-CyLBOfp7.webp", import.meta.url).href;
const __vite_glob_2_110 = "" + new URL("skyshard-0IhcI_21.webp", import.meta.url).href;
const __vite_glob_2_111 = "" + new URL("slagGlass-psFg6ppG.webp", import.meta.url).href;
const __vite_glob_2_112 = "" + new URL("soulGem-CfuoIGYA.webp", import.meta.url).href;
const __vite_glob_2_113 = "" + new URL("sovereignPlume-DGWm20Dn.webp", import.meta.url).href;
const __vite_glob_2_114 = "" + new URL("spiderSilk-1IurQ2mF.webp", import.meta.url).href;
const __vite_glob_2_115 = "" + new URL("starSilk-Q-H3VaXW.webp", import.meta.url).href;
const __vite_glob_2_116 = "" + new URL("steelIngot-Bi8t6DMR.webp", import.meta.url).href;
const __vite_glob_2_117 = "" + new URL("stingerVenom-t0Uuzn9a.webp", import.meta.url).href;
const __vite_glob_2_118 = "" + new URL("stormIron-DKp_h3iI.webp", import.meta.url).href;
const __vite_glob_2_119 = "" + new URL("stormcrown-MDEl1o80.webp", import.meta.url).href;
const __vite_glob_2_120 = "" + new URL("stormhide-DxCE_JJr.webp", import.meta.url).href;
const __vite_glob_2_121 = "" + new URL("stormveinHeart-GX2lgFOf.webp", import.meta.url).href;
const __vite_glob_2_122 = "" + new URL("sunstone-BVAQQYm0.webp", import.meta.url).href;
const __vite_glob_2_123 = "" + new URL("tannedLeather-a-h0L4r_.webp", import.meta.url).href;
const __vite_glob_2_124 = "" + new URL("temperedSteel-l_qjaLnC.webp", import.meta.url).href;
const __vite_glob_2_125 = "" + new URL("tempestQuill-yBk8vjmt.webp", import.meta.url).href;
const __vite_glob_2_126 = "" + new URL("tempestTalon-pkGFsonD.webp", import.meta.url).href;
const __vite_glob_2_127 = "" + new URL("thornheart-HEvxJ1Au.webp", import.meta.url).href;
const __vite_glob_2_128 = "" + new URL("thornvine-C2HjzhrY.webp", import.meta.url).href;
const __vite_glob_2_129 = "" + new URL("throneStone-B9LIpGNU.webp", import.meta.url).href;
const __vite_glob_2_130 = "" + new URL("throneheart-LuTJovcn.webp", import.meta.url).href;
const __vite_glob_2_131 = "" + new URL("thunderGlass-BYSlGZW7.webp", import.meta.url).href;
const __vite_glob_2_132 = "" + new URL("thunderhorn-Cx6V0W8x.webp", import.meta.url).href;
const __vite_glob_2_133 = "" + new URL("thunderstone-CYHNSjqo.webp", import.meta.url).href;
const __vite_glob_2_134 = "" + new URL("tigerEye-C0RHFOvv.webp", import.meta.url).href;
const __vite_glob_2_135 = "" + new URL("titanAlloy-D4kMPZzk.webp", import.meta.url).href;
const __vite_glob_2_136 = "" + new URL("trollBlood-Bkwfmbm7.webp", import.meta.url).href;
const __vite_glob_2_137 = "" + new URL("trollHide-hV0iai_V.webp", import.meta.url).href;
const __vite_glob_2_138 = "" + new URL("veilSilk-uX0LlvQW.webp", import.meta.url).href;
const __vite_glob_2_139 = "" + new URL("voidIron-C6BxIK-i.webp", import.meta.url).href;
const __vite_glob_2_140 = "" + new URL("voidSilk-Cd8bVVUM.webp", import.meta.url).href;
const __vite_glob_2_141 = "" + new URL("wardenPlate-Cgf21SPT.webp", import.meta.url).href;
const __vite_glob_2_142 = "" + new URL("wardenStone-DN8Sk-F7.webp", import.meta.url).href;
const __vite_glob_2_143 = "" + new URL("waspWing-CTjFRrv9.webp", import.meta.url).href;
const __vite_glob_2_144 = "" + new URL("whetstone-CgN-COEM.webp", import.meta.url).href;
const __vite_glob_2_145 = "" + new URL("windCrystal-BIztCx3V.webp", import.meta.url).href;
const __vite_glob_2_146 = "" + new URL("wolfFang-CC5FGAuy.webp", import.meta.url).href;
const __vite_glob_2_147 = "" + new URL("wolfkingPelt-DPSDuhUN.webp", import.meta.url).href;
const __vite_glob_2_148 = "" + new URL("wood-BjRjuGO2.webp", import.meta.url).href;
const __vite_glob_2_149 = "" + new URL("wraithEssence-BNAnLGdL.webp", import.meta.url).href;
const __vite_glob_2_150 = "" + new URL("wyrmScale-DEelVr2I.webp", import.meta.url).href;
const __vite_glob_2_151 = "" + new URL("wyrmqueenEmber-arGCHtuY.webp", import.meta.url).href;
const __vite_glob_2_152 = "" + new URL("wyvernLeather-DWm-nldG.webp", import.meta.url).href;
function iconTier(power) {
  return power <= 5 ? "low" : power <= 10 ? "mid" : "high";
}
const ARMOR_TYPES = ["shield", "helmet", "bodyArmor", "gloves", "boots"];
const DEFENSE_OF = { armor: "armor", blockChance: "armor", increasedArmor: "armor", evasion: "evasion", increasedEvasion: "evasion", ward: "ward", hpLostAsWard: "ward" };
const ELEMENT_OF = { fireDamage: "fire", coldDamage: "cold", lightningDamage: "lightning" };
function coreStat(itemType, materialKey) {
  var _a2;
  const base = getBaseStats(requireMaterial(materialKey), itemType);
  if (!base) return void 0;
  const entries = Object.entries(base.stats);
  return (_a2 = entries.find(([, v]) => Array.isArray(v)) ?? entries[0]) == null ? void 0 : _a2[0];
}
function iconVariant(itemType, materialKey) {
  const m = requireMaterial(plainKey(materialKey));
  const tier = iconTier(m.power);
  const core = coreStat(itemType, plainKey(materialKey));
  if (ARMOR_TYPES.includes(itemType)) return `${itemType}-${tier}-${(core && DEFENSE_OF[core]) ?? "armor"}`;
  if (itemTypes[itemType].damageMultiplier) {
    const element = core && ELEMENT_OF[core];
    return element ? `${itemType}-${tier}-${element}` : `${itemType}-${tier}`;
  }
  return `${itemType}-${tier}`;
}
function namingMaterial(itemType, baseKeys) {
  let best, bestPriority = -Infinity;
  for (const key of baseKeys) {
    const base = getBaseStats(requireMaterial(key), itemType);
    if (!base) continue;
    const priority = base.labelPriority ?? requireMaterial(key).power;
    if (priority > bestPriority) {
      bestPriority = priority;
      best = key;
    }
  }
  return best;
}
function wornMaterialFor(itemType, materialKey) {
  var _a2;
  return !!materialKey && ((_a2 = requireMaterial(plainKey(materialKey)).equip) == null ? void 0 : _a2.itemType) === itemType;
}
const P = (d) => `<path d="${d}"/>`;
const C = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`;
const shapes = {
  // ---- Classes ----
  warrior: P("M4 4l11 11M15 15l2.5 2.5M13.5 18.5l5-5M20 4L9 15M9 15l-2.5 2.5M10.5 18.5l-5-5"),
  ranger: P("M7 3c7 3 7 15 0 18M7 3v18M3 12h16M16 9l3 3-3 3"),
  priest: P("M12 4v16M7 9h10") + C(12, 9, 6.5),
  reaver: P("M6 21 16 6M12.5 4.5c3-1.5 7.5 0 7.5 5.5-3-1.2-5.5-1.5-7.5-2.8z"),
  spellblade: P("M4 20l9-9M11 9l4 4M13 11l5-5 1.5-.5-.5 1.5-5 5M19 15v5M16.5 17.5h5"),
  battlemage: P("M5 21l9-9M14 12l2-2M18 3l.6 1.8L20.5 5.5l-1.9.7L18 8l-.6-1.8-1.9-.7 1.9-.7z") + C(16.5, 8.5, 2.5),
  monk: P("M7 11V8a2 2 0 0 1 4 0v2M11 10V7a2 2 0 0 1 4 0v3M15 10a2 2 0 0 1 4 0v4c0 4-3 7-7 7h-1c-3 0-5-2-5-5v-3a2 2 0 0 1 4-1v2"),
  ninja: P("M12 2.5l2 7.5 7.5 2-7.5 2-2 7.5-2-7.5-7.5-2 7.5-2z") + C(12, 12, 1.5),
  wizard: P("M3 20h18M6.5 20 12 3l5.5 17M9 13.5h6M15 6l1-2 1 2"),
  gladiator: P("M9 4l5 2v4c0 4-2.5 6-5 7.5C6.5 16 4 14 4 10V6zM14 15l6-6M18 7l2 2M15.5 18.5l-2-2"),
  saboteur: C(10, 14, 6) + P("M14.5 9.5 18 6M18 6l1.5-1.5M20 3v2M22 4.5h-2"),
  bloodmage: P("M12 3c-3 5-6 8-6 11a6 6 0 0 0 12 0c0-3-3-6-6-11zM9.5 14a2.5 2.5 0 0 0 2.5 2.5"),
  berserker: P("M5 21 15 6M11.5 4.5c3-1.5 7 0 7 5-3-1-5-1.5-7-2.5zM19 21 9 6M12.5 4.5c-3-1.5-7 0-7 5 3-1 5-1.5 7-2.5z"),
  marksman: C(12, 12, 7) + C(12, 12, 1.5) + P("M12 2v5M12 17v5M2 12h5M17 12h5"),
  warlock: P("M3 12c3-5 15-5 18 0-3 5-15 5-18 0z") + C(12, 12, 2.5),
  champion: P("M4 19h16M4 19 3 8l5 4 4-7 4 7 5-4-1 11"),
  vagabond: P("M4 21 17 8M15.5 3.5c3 0 5 2 5 4.5 0 2-2 3.5-4 3.5s-4-1.5-4-4 1-4 3-4z"),
  // ---- Item types ----
  sword: P("M5 19 17 7l2-2v2L7 19M7.5 13.5l3 3M3.5 20.5l2-2"),
  axe: P("M6 21 16 6M12.5 4.5c3-1.5 7.5 0 7.5 5.5-3-1.2-5.5-1.5-7.5-2.8z"),
  dagger: P("M7 17l7-7 2-1-1 2-7 7M8 14l2 2M4.5 19.5l2-2"),
  wand: P("M4 20 14 10M17 3v4M15 5h4M19 9.5v2M18 10.5h2"),
  greatsword: P("M6 18 18 6l2.5-2.5v2.5L8 19M4 13.5l6.5 6.5M3 21l2.5-2.5"),
  bow: P("M8 3c7 3 7 15 0 18M8 3v18"),
  staff: P("M6 21 14 9") + C(16, 6.5, 3),
  shield: P("M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"),
  helmet: P("M5 16v-4a7 7 0 0 1 14 0v4M4 16h16M9 16v4M15 16v4"),
  bodyArmor: P("M8 4 4 7l2 5 2-1v9h8v-9l2 1 2-5-4-3-2 2h-4z"),
  gloves: P("M8 21v-6l-2-4V7a1 1 0 0 1 2 0v3M8 9V4.5a1 1 0 0 1 2 0V9M10 8.5V3.5a1 1 0 0 1 2 0V9M12 9V5a1 1 0 0 1 2 0v6l2-2a1.4 1.4 0 0 1 2 2l-4 5v5"),
  boots: P("M8 3h5v9l5 2a2.5 2.5 0 0 1 2 2.5V20H6V3zM6 17h14"),
  belt: P("M3 10h18v4H3zM10 8.5h4v7h-4z"),
  ring: C(12, 14.5, 5.5) + P("M10 6.5 12 4l2 2.5-2 2z"),
  amulet: P("M6 3c0 6 3 9 6 9s6-3 6-9M12 12l3 4-3 5-3-5z"),
  // ---- Material kinds ----
  ore: P("M4 17 7 9l6-4 6 5 1 7-6 3H8zM7 9l5 3 1-7M12 12l8 5M12 12l-4 8"),
  ingot: P("M3 17l3-6h12l3 6zM6 11l2-3h8l2 3"),
  hide: P("M6 4c2 1 4 1 6 0 2 1 4 1 6 0l-1 5 2 4-3 1-1 6c-2-1-4-1-6 0l-1-6-3-1 2-4z"),
  cloth: P("M6 4h12M6 20h12M8 4v16M16 4v16M8 8l8 3M8 12l8 3"),
  plant: P("M5 19C5 10 10 5 19 5c0 9-5 14-14 14zM5 19l8-8"),
  log: P("M5 8h11M5 17h11M5 8v9") + C(16, 12.5, 4.5) + C(16, 12.5, 1.5),
  gem: P("M6 4h12l3 5-9 11L3 9zM3 9h18M9 4l3 5 3-5"),
  shard: P("M12 2l5 8-5 12-5-12zM7 10h10"),
  feather: P("M19 4C11 4 6 10 6 18l-2 2M6 18c6 0 11-4 13-14M9 15h5M11 12h5"),
  fang: P("M6 4h12c0 7-3 13-6 16C9 17 6 11 6 4zM9 4c0 5 1.5 9 3 11"),
  bone: P("M8 16 16 8M6.5 18.5a2 2 0 1 1-1.5-3.5 2 2 0 1 1 3.5-1.5M17.5 5.5a2 2 0 1 1 1.5 3.5 2 2 0 1 1-3.5 1.5"),
  flask: P("M10 3h4M10 3v5L5 18a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-10V3M7 15h10"),
  scale: P("M4 9c2-3 6-3 8 0 2-3 6-3 8 0M4 9c0 5 4 9 8 11 4-2 8-6 8-11M8 13c1.3 1.3 2.7 1.3 4 0 1.3 1.3 2.7 1.3 4 0"),
  heart: P("M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"),
  crown: P("M4 18h16M4 18 3 8l5 4 4-7 4 7 5-4-1 10"),
  pearl: C(12, 12, 7) + P("M9 9a4 4 0 0 1 3-1.5"),
  eye: P("M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z") + C(12, 12, 3),
  key: C(8, 12, 4) + P("M12 12h9M18 12v3M21 12v4"),
  flame: P("M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4 3-6 1 2 2 3 3 3 0-3-1-5 0-8z"),
  // ---- Monster families ----
  beast: P("M6.5 16.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5c0 2.5-2.5 3.5-5.5 3.5s-5.5-1-5.5-3.5z") + C(6, 10, 1.6) + C(9.5, 6.5, 1.6) + C(14.5, 6.5, 1.6) + C(18, 10, 1.6),
  humanoid: P("M12 3a5 5 0 0 1 5 5v3H7V8a5 5 0 0 1 5-5zM7 11h10M9.5 11v3.5M14.5 11v3.5M5 21c1-4 3.5-6 7-6s6 2 7 6"),
  undead: P("M12 3a7 7 0 0 0-7 7c0 3 1 4 2 5v3h10v-3c1-1 2-2 2-5a7 7 0 0 0-7-7zM10 18v3M14 18v3") + C(9.2, 11, 1.6) + C(14.8, 11, 1.6),
  construct: P("M7 3h10v6H7zM5 9h14v8H5zM8 17v4M16 17v4M10 6h.01M14 6h.01"),
  wisp: P("M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4 3-6 1 2 2 3 3 3 0-3-1-5 0-8z"),
  spider: C(12, 13, 3.2) + C(12, 7.5, 2) + P("M9 11 4 7M9 13H3M9 15l-5 4M15 11l5-4M15 13h6M15 15l5 4"),
  flyer: P("M3 13c4-6 9-7 9-7s5 1 9 7c-3-1-5 0-6 2-1-2-2-2-3-2s-2 0-3 2c-1-2-3-3-6-2z"),
  serpent: P("M3 18c3 0 3-4 6-4s3 4 6 4 3-6 2-9-3-4-5-4M17 5h2")
};
function icon(name, className = "") {
  const el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  el.setAttribute("viewBox", "0 0 24 24");
  el.setAttribute("class", "ic" + (className ? " " + className : ""));
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = shapes[name] ?? shapes.gem;
  return el;
}
function classIcon(classKey, className = "") {
  return icon(shapes[classKey] ? classKey : "warrior", className);
}
function itemTypeIcon(itemType, className = "") {
  return icon(itemType, className);
}
const itemTypeArtUrls = {};
for (const [path, url] of Object.entries(/* @__PURE__ */ Object.assign({ "../assets/itemTypes/amulet.webp": __vite_glob_0_0$4, "../assets/itemTypes/axe.webp": __vite_glob_0_1$4, "../assets/itemTypes/belt.webp": __vite_glob_0_2$4, "../assets/itemTypes/bodyArmor.webp": __vite_glob_0_3$4, "../assets/itemTypes/boots.webp": __vite_glob_0_4$4, "../assets/itemTypes/bow.webp": __vite_glob_0_5$4, "../assets/itemTypes/dagger.webp": __vite_glob_0_6$3, "../assets/itemTypes/gloves.webp": __vite_glob_0_7$3, "../assets/itemTypes/greatsword.webp": __vite_glob_0_8$3, "../assets/itemTypes/helmet.webp": __vite_glob_0_9$3, "../assets/itemTypes/ring.webp": __vite_glob_0_10$3, "../assets/itemTypes/shield.webp": __vite_glob_0_11$3, "../assets/itemTypes/staff.webp": __vite_glob_0_12$2, "../assets/itemTypes/sword.webp": __vite_glob_0_13$2, "../assets/itemTypes/wand.webp": __vite_glob_0_14$2 }))) {
  const m = /\/(\w+)\.webp$/.exec(path);
  if (m) itemTypeArtUrls[m[1]] = url;
}
const variantArtUrls = {};
for (const [path, url] of Object.entries(/* @__PURE__ */ Object.assign({ "../assets/itemIcons/amulet-high.webp": __vite_glob_1_0$1, "../assets/itemIcons/amulet-low.webp": __vite_glob_1_1$1, "../assets/itemIcons/amulet-mid.webp": __vite_glob_1_2$1, "../assets/itemIcons/axe-high-fire.webp": __vite_glob_1_3$1, "../assets/itemIcons/axe-high-lightning.webp": __vite_glob_1_4$1, "../assets/itemIcons/axe-high.webp": __vite_glob_1_5$1, "../assets/itemIcons/axe-low-cold.webp": __vite_glob_1_6$1, "../assets/itemIcons/axe-low-fire.webp": __vite_glob_1_7$1, "../assets/itemIcons/axe-low-lightning.webp": __vite_glob_1_8$1, "../assets/itemIcons/axe-low.webp": __vite_glob_1_9$1, "../assets/itemIcons/axe-mid-cold.webp": __vite_glob_1_10$1, "../assets/itemIcons/axe-mid-fire.webp": __vite_glob_1_11$1, "../assets/itemIcons/axe-mid-lightning.webp": __vite_glob_1_12$1, "../assets/itemIcons/axe-mid.webp": __vite_glob_1_13$1, "../assets/itemIcons/belt-high.webp": __vite_glob_1_14$1, "../assets/itemIcons/belt-low.webp": __vite_glob_1_15$1, "../assets/itemIcons/belt-mid.webp": __vite_glob_1_16$1, "../assets/itemIcons/bodyArmor-high-armor.webp": __vite_glob_1_17$1, "../assets/itemIcons/bodyArmor-high-evasion.webp": __vite_glob_1_18$1, "../assets/itemIcons/bodyArmor-high-ward.webp": __vite_glob_1_19$1, "../assets/itemIcons/bodyArmor-low-armor.webp": __vite_glob_1_20, "../assets/itemIcons/bodyArmor-low-evasion.webp": __vite_glob_1_21, "../assets/itemIcons/bodyArmor-low-ward.webp": __vite_glob_1_22, "../assets/itemIcons/bodyArmor-mid-armor.webp": __vite_glob_1_23, "../assets/itemIcons/bodyArmor-mid-evasion.webp": __vite_glob_1_24, "../assets/itemIcons/bodyArmor-mid-ward.webp": __vite_glob_1_25, "../assets/itemIcons/boots-high-armor.webp": __vite_glob_1_26, "../assets/itemIcons/boots-high-evasion.webp": __vite_glob_1_27, "../assets/itemIcons/boots-high-ward.webp": __vite_glob_1_28, "../assets/itemIcons/boots-low-armor.webp": __vite_glob_1_29, "../assets/itemIcons/boots-low-evasion.webp": __vite_glob_1_30, "../assets/itemIcons/boots-low-ward.webp": __vite_glob_1_31, "../assets/itemIcons/boots-mid-armor.webp": __vite_glob_1_32, "../assets/itemIcons/boots-mid-evasion.webp": __vite_glob_1_33, "../assets/itemIcons/boots-mid-ward.webp": __vite_glob_1_34, "../assets/itemIcons/bow-high-fire.webp": __vite_glob_1_35, "../assets/itemIcons/bow-high-lightning.webp": __vite_glob_1_36, "../assets/itemIcons/bow-high.webp": __vite_glob_1_37, "../assets/itemIcons/bow-low-cold.webp": __vite_glob_1_38, "../assets/itemIcons/bow-low-fire.webp": __vite_glob_1_39, "../assets/itemIcons/bow-low-lightning.webp": __vite_glob_1_40, "../assets/itemIcons/bow-low.webp": __vite_glob_1_41, "../assets/itemIcons/bow-mid-cold.webp": __vite_glob_1_42, "../assets/itemIcons/bow-mid-fire.webp": __vite_glob_1_43, "../assets/itemIcons/bow-mid-lightning.webp": __vite_glob_1_44, "../assets/itemIcons/bow-mid.webp": __vite_glob_1_45, "../assets/itemIcons/dagger-high-fire.webp": __vite_glob_1_46, "../assets/itemIcons/dagger-high-lightning.webp": __vite_glob_1_47, "../assets/itemIcons/dagger-high.webp": __vite_glob_1_48, "../assets/itemIcons/dagger-low-cold.webp": __vite_glob_1_49, "../assets/itemIcons/dagger-low-fire.webp": __vite_glob_1_50, "../assets/itemIcons/dagger-low-lightning.webp": __vite_glob_1_51, "../assets/itemIcons/dagger-low.webp": __vite_glob_1_52, "../assets/itemIcons/dagger-mid-cold.webp": __vite_glob_1_53, "../assets/itemIcons/dagger-mid-fire.webp": __vite_glob_1_54, "../assets/itemIcons/dagger-mid-lightning.webp": __vite_glob_1_55, "../assets/itemIcons/dagger-mid.webp": __vite_glob_1_56, "../assets/itemIcons/gloves-high-armor.webp": __vite_glob_1_57, "../assets/itemIcons/gloves-high-evasion.webp": __vite_glob_1_58, "../assets/itemIcons/gloves-high-ward.webp": __vite_glob_1_59, "../assets/itemIcons/gloves-low-armor.webp": __vite_glob_1_60, "../assets/itemIcons/gloves-low-evasion.webp": __vite_glob_1_61, "../assets/itemIcons/gloves-low-ward.webp": __vite_glob_1_62, "../assets/itemIcons/gloves-mid-armor.webp": __vite_glob_1_63, "../assets/itemIcons/gloves-mid-evasion.webp": __vite_glob_1_64, "../assets/itemIcons/gloves-mid-ward.webp": __vite_glob_1_65, "../assets/itemIcons/greatsword-high-fire.webp": __vite_glob_1_66, "../assets/itemIcons/greatsword-high-lightning.webp": __vite_glob_1_67, "../assets/itemIcons/greatsword-high.webp": __vite_glob_1_68, "../assets/itemIcons/greatsword-low-cold.webp": __vite_glob_1_69, "../assets/itemIcons/greatsword-low-fire.webp": __vite_glob_1_70, "../assets/itemIcons/greatsword-low-lightning.webp": __vite_glob_1_71, "../assets/itemIcons/greatsword-low.webp": __vite_glob_1_72, "../assets/itemIcons/greatsword-mid-cold.webp": __vite_glob_1_73, "../assets/itemIcons/greatsword-mid-fire.webp": __vite_glob_1_74, "../assets/itemIcons/greatsword-mid-lightning.webp": __vite_glob_1_75, "../assets/itemIcons/greatsword-mid.webp": __vite_glob_1_76, "../assets/itemIcons/helmet-high-armor.webp": __vite_glob_1_77, "../assets/itemIcons/helmet-high-evasion.webp": __vite_glob_1_78, "../assets/itemIcons/helmet-high-ward.webp": __vite_glob_1_79, "../assets/itemIcons/helmet-low-armor.webp": __vite_glob_1_80, "../assets/itemIcons/helmet-low-evasion.webp": __vite_glob_1_81, "../assets/itemIcons/helmet-low-ward.webp": __vite_glob_1_82, "../assets/itemIcons/helmet-mid-armor.webp": __vite_glob_1_83, "../assets/itemIcons/helmet-mid-evasion.webp": __vite_glob_1_84, "../assets/itemIcons/helmet-mid-ward.webp": __vite_glob_1_85, "../assets/itemIcons/ring-high.webp": __vite_glob_1_86, "../assets/itemIcons/ring-low.webp": __vite_glob_1_87, "../assets/itemIcons/ring-mid.webp": __vite_glob_1_88, "../assets/itemIcons/shield-high-armor.webp": __vite_glob_1_89, "../assets/itemIcons/shield-high-evasion.webp": __vite_glob_1_90, "../assets/itemIcons/shield-high-ward.webp": __vite_glob_1_91, "../assets/itemIcons/shield-low-armor.webp": __vite_glob_1_92, "../assets/itemIcons/shield-low-evasion.webp": __vite_glob_1_93, "../assets/itemIcons/shield-low-ward.webp": __vite_glob_1_94, "../assets/itemIcons/shield-mid-armor.webp": __vite_glob_1_95, "../assets/itemIcons/shield-mid-evasion.webp": __vite_glob_1_96, "../assets/itemIcons/shield-mid-ward.webp": __vite_glob_1_97, "../assets/itemIcons/staff-high-fire.webp": __vite_glob_1_98, "../assets/itemIcons/staff-high-lightning.webp": __vite_glob_1_99, "../assets/itemIcons/staff-high.webp": __vite_glob_1_100, "../assets/itemIcons/staff-low-cold.webp": __vite_glob_1_101, "../assets/itemIcons/staff-low-fire.webp": __vite_glob_1_102, "../assets/itemIcons/staff-low-lightning.webp": __vite_glob_1_103, "../assets/itemIcons/staff-low.webp": __vite_glob_1_104, "../assets/itemIcons/staff-mid-cold.webp": __vite_glob_1_105, "../assets/itemIcons/staff-mid-fire.webp": __vite_glob_1_106, "../assets/itemIcons/staff-mid-lightning.webp": __vite_glob_1_107, "../assets/itemIcons/staff-mid.webp": __vite_glob_1_108, "../assets/itemIcons/sword-high-fire.webp": __vite_glob_1_109, "../assets/itemIcons/sword-high-lightning.webp": __vite_glob_1_110, "../assets/itemIcons/sword-high.webp": __vite_glob_1_111, "../assets/itemIcons/sword-low-cold.webp": __vite_glob_1_112, "../assets/itemIcons/sword-low-fire.webp": __vite_glob_1_113, "../assets/itemIcons/sword-low-lightning.webp": __vite_glob_1_114, "../assets/itemIcons/sword-low.webp": __vite_glob_1_115, "../assets/itemIcons/sword-mid-cold.webp": __vite_glob_1_116, "../assets/itemIcons/sword-mid-fire.webp": __vite_glob_1_117, "../assets/itemIcons/sword-mid-lightning.webp": __vite_glob_1_118, "../assets/itemIcons/sword-mid.webp": __vite_glob_1_119, "../assets/itemIcons/wand-high-fire.webp": __vite_glob_1_120, "../assets/itemIcons/wand-high-lightning.webp": __vite_glob_1_121, "../assets/itemIcons/wand-high.webp": __vite_glob_1_122, "../assets/itemIcons/wand-low-cold.webp": __vite_glob_1_123, "../assets/itemIcons/wand-low-fire.webp": __vite_glob_1_124, "../assets/itemIcons/wand-low-lightning.webp": __vite_glob_1_125, "../assets/itemIcons/wand-low.webp": __vite_glob_1_126, "../assets/itemIcons/wand-mid-cold.webp": __vite_glob_1_127, "../assets/itemIcons/wand-mid-fire.webp": __vite_glob_1_128, "../assets/itemIcons/wand-mid-lightning.webp": __vite_glob_1_129, "../assets/itemIcons/wand-mid.webp": __vite_glob_1_130 }))) {
  const m = /\/([\w-]+)\.webp$/.exec(path);
  if (m) variantArtUrls[m[1]] = url;
}
function itemArt(itemType, baseKeys, className = "") {
  const naming = baseKeys ? namingMaterial(itemType, baseKeys) : void 0;
  if (naming && wornMaterialFor(itemType, naming)) return materialIcon(naming, "typeart" + (className ? " " + className : ""));
  const url = naming ? variantArtUrls[iconVariant(itemType, naming)] : void 0;
  if (!url) return itemTypeArt(itemType, className);
  const img = document.createElement("img");
  img.src = url;
  img.alt = "";
  img.className = "ic typeart" + (className ? " " + className : "");
  img.setAttribute("aria-hidden", "true");
  return img;
}
function itemTypeArt(itemType, className = "") {
  const art = itemTypeArtUrls[itemType];
  if (!art) return icon(itemType, className);
  const img = document.createElement("img");
  img.src = art;
  img.alt = "";
  img.className = "ic typeart" + (className ? " " + className : "");
  img.setAttribute("aria-hidden", "true");
  return img;
}
const materialLooks = {
  rubyShard: ["shard", "blood"],
  ruby: ["gem", "blood"],
  flawlessRuby: ["gem", "blood"],
  radiantRuby: ["gem", "blood"],
  sapphireShard: ["shard", "cold"],
  sapphire: ["gem", "cold"],
  flawlessSapphire: ["gem", "cold"],
  radiantSapphire: ["gem", "cold"],
  emeraldShard: ["shard", "green"],
  emerald: ["gem", "green"],
  flawlessEmerald: ["gem", "green"],
  radiantEmerald: ["gem", "green"],
  roughTigerEye: ["shard", "gold"],
  tigerEye: ["gem", "gold"],
  polishedTigerEye: ["gem", "gold"],
  brilliantTigerEye: ["gem", "gold"],
  roughSunstone: ["shard", "fire"],
  sunstone: ["gem", "fire"],
  polishedSunstone: ["gem", "fire"],
  brilliantSunstone: ["gem", "fire"],
  roughOpal: ["shard", "silver"],
  opal: ["gem", "silver"],
  polishedOpal: ["gem", "silver"],
  brilliantOpal: ["gem", "silver"],
  wood: ["log", "wood"],
  copperOre: ["ore", "copper"],
  roughHide: ["hide", "leather"],
  boneShard: ["bone", "bone"],
  flint: ["shard", "stone"],
  hawkFeather: ["feather", "leather"],
  healingMoss: ["plant", "green"],
  sinew: ["cloth", "blood"],
  ironOre: ["ore", "iron"],
  tannedLeather: ["hide", "leather"],
  wolfFang: ["fang", "bone"],
  thornvine: ["plant", "green"],
  whetstone: ["ore", "stone"],
  trollBlood: ["flask", "blood"],
  silverOre: ["ore", "silver"],
  moonstone: ["gem", "arcane"],
  bloodstone: ["gem", "blood"],
  amber: ["gem", "gold"],
  steelIngot: ["ingot", "iron"],
  trollHide: ["hide", "green"],
  garnet: ["gem", "blood"],
  spiderSilk: ["cloth", "silver"],
  ancientBone: ["bone", "bone"],
  ritualAsh: ["flask", "fire"],
  mithril: ["ingot", "silver"],
  broodfang: ["fang", "blood"],
  brimstone: ["ore", "fire"],
  marshReed: ["plant", "green"],
  thunderhorn: ["fang", "lightning"],
  quicksilver: ["flask", "silver"],
  runedSlate: ["ore", "arcane"],
  wyvernLeather: ["hide", "leather"],
  skyshard: ["shard", "gold"],
  bogIron: ["ingot", "iron"],
  leechSac: ["flask", "blood"],
  eelskin: ["hide", "cold"],
  peatmoss: ["plant", "green"],
  hagstone: ["ore", "stone"],
  drownedSteel: ["ingot", "cold"],
  galeFeather: ["feather", "cold"],
  stormhide: ["hide", "lightning"],
  cragGranite: ["ore", "stone"],
  ozoneShard: ["shard", "lightning"],
  rocPlume: ["feather", "gold"],
  thunderstone: ["ore", "lightning"],
  thornheart: ["heart", "green"],
  wolfkingPelt: ["hide", "silver"],
  deepfireCore: ["heart", "fire"],
  golemHeart: ["heart", "stone"],
  obsidian: ["shard", "stone"],
  salamanderScale: ["scale", "fire"],
  rimecoal: ["ore", "cold"],
  cinderwool: ["cloth", "fire"],
  wyrmScale: ["scale", "fire"],
  glacialHeart: ["heart", "cold"],
  phoenixFeather: ["feather", "fire"],
  blackPearl: ["pearl", "arcane"],
  tempestQuill: ["feather", "lightning"],
  riftGlass: ["shard", "rift"],
  riftsteel: ["ingot", "rift"],
  prismShard: ["gem", "rift"],
  voidSilk: ["cloth", "arcane"],
  wardenStone: ["ore", "arcane"],
  riftEssence: ["flask", "rift"],
  wardenPlate: ["scale", "silver"],
  prismaticEye: ["eye", "rift"],
  briarcrown: ["crown", "green"],
  stormveinHeart: ["heart", "lightning"],
  wyrmqueenEmber: ["flame", "fire"],
  mireheart: ["heart", "cold"],
  tempestTalon: ["fang", "lightning"],
  riftheart: ["heart", "rift"],
  hiveChitin: ["scale", "gold"],
  waspWing: ["feather", "gold"],
  hiveWax: ["flask", "gold"],
  mantisScythe: ["fang", "green"],
  amberResin: ["gem", "gold"],
  stingerVenom: ["flask", "green"],
  royalJelly: ["pearl", "gold"],
  queenCarapace: ["scale", "green"],
  hiveheart: ["heart", "gold"],
  amberKey: ["key", "gold"],
  graveIron: ["ingot", "iron"],
  shroudCloth: ["cloth", "bone"],
  boneMarrow: ["bone", "blood"],
  wraithEssence: ["flask", "arcane"],
  barrowSteel: ["ingot", "silver"],
  deathcap: ["plant", "bone"],
  soulGem: ["gem", "arcane"],
  cryptPlate: ["scale", "iron"],
  paleCrown: ["crown", "bone"],
  graveKey: ["key", "bone"],
  brassPlate: ["ingot", "gold"],
  cogwheel: ["ore", "copper"],
  coolingOil: ["flask", "iron"],
  temperedSteel: ["ingot", "iron"],
  mainspring: ["ring", "copper"],
  slagGlass: ["shard", "fire"],
  titanAlloy: ["ingot", "fire"],
  furnaceCore: ["flame", "fire"],
  forgeheart: ["heart", "fire"],
  cogKey: ["key", "copper"],
  stormIron: ["ingot", "lightning"],
  skyFeather: ["feather", "lightning"],
  galeSilk: ["cloth", "silver"],
  eagleTalon: ["fang", "leather"],
  thunderGlass: ["shard", "lightning"],
  windCrystal: ["gem", "silver"],
  sovereignPlume: ["feather", "gold"],
  skyforged: ["ingot", "silver"],
  stormcrown: ["crown", "lightning"],
  galeKey: ["key", "lightning"],
  oracleEye: ["eye", "arcane"],
  veilSilk: ["cloth", "arcane"],
  sanctumShard: ["shard", "rift"],
  throneStone: ["ore", "stone"],
  voidIron: ["ingot", "rift"],
  starSilk: ["cloth", "arcane"],
  shatterglass: ["shard", "arcane"],
  kingsSteel: ["ingot", "gold"],
  emberOfAges: ["flame", "fire"],
  crownShard: ["crown", "gold"],
  riftmetal: ["ingot", "arcane"],
  throneheart: ["heart", "rift"]
};
const materialArt = {};
for (const [path, url] of Object.entries(/* @__PURE__ */ Object.assign({ "../assets/materials/amber.webp": __vite_glob_2_0, "../assets/materials/amberKey.webp": __vite_glob_2_1, "../assets/materials/amberResin.webp": __vite_glob_2_2, "../assets/materials/ancientBone.webp": __vite_glob_2_3, "../assets/materials/barrowSteel.webp": __vite_glob_2_4, "../assets/materials/blackPearl.webp": __vite_glob_2_5, "../assets/materials/bloodstone.webp": __vite_glob_2_6, "../assets/materials/bogIron.webp": __vite_glob_2_7, "../assets/materials/boneMarrow.webp": __vite_glob_2_8, "../assets/materials/boneShard.webp": __vite_glob_2_9, "../assets/materials/borrowedCrown.webp": __vite_glob_2_10, "../assets/materials/brassPlate.webp": __vite_glob_2_11, "../assets/materials/briarcrown.webp": __vite_glob_2_12, "../assets/materials/brilliantOpal.webp": __vite_glob_2_13, "../assets/materials/brilliantSunstone.webp": __vite_glob_2_14, "../assets/materials/brilliantTigerEye.webp": __vite_glob_2_15, "../assets/materials/brimstone.webp": __vite_glob_2_16, "../assets/materials/broodfang.webp": __vite_glob_2_17, "../assets/materials/cinderwool.webp": __vite_glob_2_18, "../assets/materials/cogKey.webp": __vite_glob_2_19, "../assets/materials/cogwheel.webp": __vite_glob_2_20, "../assets/materials/coolingOil.webp": __vite_glob_2_21, "../assets/materials/copperOre.webp": __vite_glob_2_22, "../assets/materials/cragGranite.webp": __vite_glob_2_23, "../assets/materials/crownShard.webp": __vite_glob_2_24, "../assets/materials/cryptPlate.webp": __vite_glob_2_25, "../assets/materials/deathcap.webp": __vite_glob_2_26, "../assets/materials/deepfireCore.webp": __vite_glob_2_27, "../assets/materials/drownedSteel.webp": __vite_glob_2_28, "../assets/materials/eagleTalon.webp": __vite_glob_2_29, "../assets/materials/eelskin.webp": __vite_glob_2_30, "../assets/materials/emberOfAges.webp": __vite_glob_2_31, "../assets/materials/emerald.webp": __vite_glob_2_32, "../assets/materials/emeraldShard.webp": __vite_glob_2_33, "../assets/materials/empressStinger.webp": __vite_glob_2_34, "../assets/materials/flawlessEmerald.webp": __vite_glob_2_35, "../assets/materials/flawlessRuby.webp": __vite_glob_2_36, "../assets/materials/flawlessSapphire.webp": __vite_glob_2_37, "../assets/materials/flint.webp": __vite_glob_2_38, "../assets/materials/forgeheart.webp": __vite_glob_2_39, "../assets/materials/furnaceCore.webp": __vite_glob_2_40, "../assets/materials/galeFeather.webp": __vite_glob_2_41, "../assets/materials/galeKey.webp": __vite_glob_2_42, "../assets/materials/galeSilk.webp": __vite_glob_2_43, "../assets/materials/garnet.webp": __vite_glob_2_44, "../assets/materials/glacialHeart.webp": __vite_glob_2_45, "../assets/materials/golemHeart.webp": __vite_glob_2_46, "../assets/materials/graveIron.webp": __vite_glob_2_47, "../assets/materials/graveKey.webp": __vite_glob_2_48, "../assets/materials/hagstone.webp": __vite_glob_2_49, "../assets/materials/hawkFeather.webp": __vite_glob_2_50, "../assets/materials/healingMoss.webp": __vite_glob_2_51, "../assets/materials/heraldBolt.webp": __vite_glob_2_52, "../assets/materials/hiveChitin.webp": __vite_glob_2_53, "../assets/materials/hiveWax.webp": __vite_glob_2_54, "../assets/materials/hiveheart.webp": __vite_glob_2_55, "../assets/materials/ironOre.webp": __vite_glob_2_56, "../assets/materials/kingsSteel.webp": __vite_glob_2_57, "../assets/materials/leechSac.webp": __vite_glob_2_58, "../assets/materials/mainspring.webp": __vite_glob_2_59, "../assets/materials/mantisScythe.webp": __vite_glob_2_60, "../assets/materials/marshReed.webp": __vite_glob_2_61, "../assets/materials/mireheart.webp": __vite_glob_2_62, "../assets/materials/mithril.webp": __vite_glob_2_63, "../assets/materials/moonstone.webp": __vite_glob_2_64, "../assets/materials/obsidian.webp": __vite_glob_2_65, "../assets/materials/opal.webp": __vite_glob_2_66, "../assets/materials/oracleEye.webp": __vite_glob_2_67, "../assets/materials/overseerSeal.webp": __vite_glob_2_68, "../assets/materials/ozoneShard.webp": __vite_glob_2_69, "../assets/materials/paleCrown.webp": __vite_glob_2_70, "../assets/materials/peatmoss.webp": __vite_glob_2_71, "../assets/materials/phoenixFeather.webp": __vite_glob_2_72, "../assets/materials/polishedOpal.webp": __vite_glob_2_73, "../assets/materials/polishedSunstone.webp": __vite_glob_2_74, "../assets/materials/polishedTigerEye.webp": __vite_glob_2_75, "../assets/materials/prismShard.webp": __vite_glob_2_76, "../assets/materials/prismaticEye.webp": __vite_glob_2_77, "../assets/materials/queenCarapace.webp": __vite_glob_2_78, "../assets/materials/quicksilver.webp": __vite_glob_2_79, "../assets/materials/radiantEmerald.webp": __vite_glob_2_80, "../assets/materials/radiantRuby.webp": __vite_glob_2_81, "../assets/materials/radiantSapphire.webp": __vite_glob_2_82, "../assets/materials/regentPhylactery.webp": __vite_glob_2_83, "../assets/materials/riftEssence.webp": __vite_glob_2_84, "../assets/materials/riftGlass.webp": __vite_glob_2_85, "../assets/materials/riftheart.webp": __vite_glob_2_86, "../assets/materials/riftmetal.webp": __vite_glob_2_87, "../assets/materials/riftsteel.webp": __vite_glob_2_88, "../assets/materials/rimecoal.webp": __vite_glob_2_89, "../assets/materials/ritualAsh.webp": __vite_glob_2_90, "../assets/materials/rocPlume.webp": __vite_glob_2_91, "../assets/materials/roughHide.webp": __vite_glob_2_92, "../assets/materials/roughOpal.webp": __vite_glob_2_93, "../assets/materials/roughSunstone.webp": __vite_glob_2_94, "../assets/materials/roughTigerEye.webp": __vite_glob_2_95, "../assets/materials/royalJelly.webp": __vite_glob_2_96, "../assets/materials/ruby.webp": __vite_glob_2_97, "../assets/materials/rubyShard.webp": __vite_glob_2_98, "../assets/materials/runedSlate.webp": __vite_glob_2_99, "../assets/materials/salamanderScale.webp": __vite_glob_2_100, "../assets/materials/sanctumShard.webp": __vite_glob_2_101, "../assets/materials/sapphire.webp": __vite_glob_2_102, "../assets/materials/sapphireShard.webp": __vite_glob_2_103, "../assets/materials/shatterglass.webp": __vite_glob_2_104, "../assets/materials/shroudCloth.webp": __vite_glob_2_105, "../assets/materials/silverOre.webp": __vite_glob_2_106, "../assets/materials/sinew.webp": __vite_glob_2_107, "../assets/materials/skyFeather.webp": __vite_glob_2_108, "../assets/materials/skyforged.webp": __vite_glob_2_109, "../assets/materials/skyshard.webp": __vite_glob_2_110, "../assets/materials/slagGlass.webp": __vite_glob_2_111, "../assets/materials/soulGem.webp": __vite_glob_2_112, "../assets/materials/sovereignPlume.webp": __vite_glob_2_113, "../assets/materials/spiderSilk.webp": __vite_glob_2_114, "../assets/materials/starSilk.webp": __vite_glob_2_115, "../assets/materials/steelIngot.webp": __vite_glob_2_116, "../assets/materials/stingerVenom.webp": __vite_glob_2_117, "../assets/materials/stormIron.webp": __vite_glob_2_118, "../assets/materials/stormcrown.webp": __vite_glob_2_119, "../assets/materials/stormhide.webp": __vite_glob_2_120, "../assets/materials/stormveinHeart.webp": __vite_glob_2_121, "../assets/materials/sunstone.webp": __vite_glob_2_122, "../assets/materials/tannedLeather.webp": __vite_glob_2_123, "../assets/materials/temperedSteel.webp": __vite_glob_2_124, "../assets/materials/tempestQuill.webp": __vite_glob_2_125, "../assets/materials/tempestTalon.webp": __vite_glob_2_126, "../assets/materials/thornheart.webp": __vite_glob_2_127, "../assets/materials/thornvine.webp": __vite_glob_2_128, "../assets/materials/throneStone.webp": __vite_glob_2_129, "../assets/materials/throneheart.webp": __vite_glob_2_130, "../assets/materials/thunderGlass.webp": __vite_glob_2_131, "../assets/materials/thunderhorn.webp": __vite_glob_2_132, "../assets/materials/thunderstone.webp": __vite_glob_2_133, "../assets/materials/tigerEye.webp": __vite_glob_2_134, "../assets/materials/titanAlloy.webp": __vite_glob_2_135, "../assets/materials/trollBlood.webp": __vite_glob_2_136, "../assets/materials/trollHide.webp": __vite_glob_2_137, "../assets/materials/veilSilk.webp": __vite_glob_2_138, "../assets/materials/voidIron.webp": __vite_glob_2_139, "../assets/materials/voidSilk.webp": __vite_glob_2_140, "../assets/materials/wardenPlate.webp": __vite_glob_2_141, "../assets/materials/wardenStone.webp": __vite_glob_2_142, "../assets/materials/waspWing.webp": __vite_glob_2_143, "../assets/materials/whetstone.webp": __vite_glob_2_144, "../assets/materials/windCrystal.webp": __vite_glob_2_145, "../assets/materials/wolfFang.webp": __vite_glob_2_146, "../assets/materials/wolfkingPelt.webp": __vite_glob_2_147, "../assets/materials/wood.webp": __vite_glob_2_148, "../assets/materials/wraithEssence.webp": __vite_glob_2_149, "../assets/materials/wyrmScale.webp": __vite_glob_2_150, "../assets/materials/wyrmqueenEmber.webp": __vite_glob_2_151, "../assets/materials/wyvernLeather.webp": __vite_glob_2_152 }))) {
  const m = /\/(\w+)\.webp$/.exec(path);
  if (m) materialArt[m[1]] = url;
}
function materialIcon(key, className = "") {
  const [shape, color] = materialLooks[plainKey(key)] ?? ["gem", "stone"];
  const cls = `c-${color}${isPremium(key) ? " premium" : ""}${className ? " " + className : ""}`;
  const art = materialArt[plainKey(key)];
  if (art) {
    const img = document.createElement("img");
    img.src = art;
    img.alt = "";
    img.className = "ic matart " + cls;
    img.setAttribute("aria-hidden", "true");
    return img;
  }
  return icon(shape, cls);
}
const monsterFamily = {
  rat: "beast",
  goblin: "humanoid",
  wolf: "beast",
  bandit: "humanoid",
  goblinBrute: "humanoid",
  alphaWolf: "beast",
  banditCaptain: "humanoid",
  troll: "humanoid",
  kobold: "humanoid",
  caveSpider: "spider",
  skeleton: "undead",
  caveBat: "flyer",
  koboldShaman: "humanoid",
  emberMote: "wisp",
  ashImp: "wisp",
  cinderHound: "beast",
  obsidianGolem: "construct",
  salamander: "serpent",
  flameKnight: "humanoid",
  ashenWyrm: "serpent",
  oreGolem: "construct",
  broodmother: "spider",
  bogLeech: "serpent",
  marshWisp: "wisp",
  mireStalker: "beast",
  frostToad: "beast",
  drownedKnight: "undead",
  bogHag: "humanoid",
  sparkWisp: "wisp",
  stormHarpy: "flyer",
  cragLynx: "humanoid",
  thunderRam: "beast",
  stormcaller: "humanoid",
  thunderbird: "flyer",
  riftMote: "wisp",
  riftHound: "beast",
  shardGolem: "construct",
  emberRevenant: "undead",
  frostRevenant: "undead",
  stormRevenant: "undead",
  riftWarden: "humanoid",
  briarKing: "humanoid",
  stormveinColossus: "construct",
  wyrmqueen: "serpent",
  mireMother: "humanoid",
  riftTyrant: "wisp",
  tempestRoc: "flyer",
  swarmling: "flyer",
  hiveDrone: "flyer",
  acidSpitter: "spider",
  thornMantis: "spider",
  amberBeetle: "spider",
  broodGuard: "spider",
  hiveQueen: "flyer",
  boneThrall: "undead",
  cryptGhoul: "undead",
  wailingShade: "wisp",
  barrowKnight: "undead",
  plagueBearer: "undead",
  lichAcolyte: "undead",
  paleLich: "undead",
  cogSpider: "spider",
  brassSentry: "construct",
  steamHound: "construct",
  smelterGolem: "construct",
  clockworkKnight: "construct",
  forgeWarden: "construct",
  forgeTitan: "construct",
  galeKestrel: "flyer",
  skyHarpy: "flyer",
  stormHawk: "flyer",
  cloudSerpent: "serpent",
  thunderEagle: "flyer",
  windWarden: "humanoid",
  skySovereign: "flyer",
  veiledOracle: "wisp",
  riftStalker: "beast",
  starfallMote: "wisp",
  voidWraith: "undead",
  throneSentinel: "construct",
  shatteredKnight: "humanoid",
  emberColossus: "construct",
  shatteredKing: "humanoid",
  kingShard: "construct",
  amberEmpress: "flyer",
  duskRegent: "undead",
  ironOverseer: "construct",
  stormHerald: "flyer",
  pretender: "humanoid"
};
function monsterColor(key) {
  var _a2;
  const types = ((_a2 = monsters[key]) == null ? void 0 : _a2.damageTypes) ?? { physical: 1 };
  const elemental = ["fire", "cold", "lightning"].filter((e) => (types[e] ?? 0) >= 0.25);
  if (elemental.length >= 3) return "rift";
  const best = elemental.sort((a, b) => (types[b] ?? 0) - (types[a] ?? 0))[0];
  return best && (types[best] ?? 0) >= 0.4 ? best : "plain";
}
function monsterIcon(key, className = "") {
  return icon(monsterFamily[key] ?? "beast", `c-${monsterColor(key)}${className ? " " + className : ""}`);
}
const __vite_glob_0_0$3 = "" + new URL("monster-acidSpitter-Dgo7PXje.webp", import.meta.url).href;
const __vite_glob_0_1$3 = "" + new URL("monster-alphaWolf-B3Lum9NE.webp", import.meta.url).href;
const __vite_glob_0_2$3 = "" + new URL("monster-amberBeetle-D1SQmf-c.webp", import.meta.url).href;
const __vite_glob_0_3$3 = "" + new URL("monster-amberEmpress-CYIuctIR.webp", import.meta.url).href;
const __vite_glob_0_4$3 = "" + new URL("monster-ashImp-CiAH0uhQ.webp", import.meta.url).href;
const __vite_glob_0_5$3 = "" + new URL("monster-ashenWyrm-Cnuym51q.webp", import.meta.url).href;
const __vite_glob_0_6$2 = "" + new URL("monster-bandit-DGOE0Zbz.webp", import.meta.url).href;
const __vite_glob_0_7$2 = "" + new URL("monster-banditCaptain-B-CpT7Jn.webp", import.meta.url).href;
const __vite_glob_0_8$2 = "" + new URL("monster-barrowKnight-DbwS6Jvz.webp", import.meta.url).href;
const __vite_glob_0_9$2 = "" + new URL("monster-bogHag-kLh7T29k.webp", import.meta.url).href;
const __vite_glob_0_10$2 = "" + new URL("monster-bogLeech-h7YEAtAX.webp", import.meta.url).href;
const __vite_glob_0_11$2 = "" + new URL("monster-boneThrall-DgUXfiqQ.webp", import.meta.url).href;
const __vite_glob_0_12$1 = "" + new URL("monster-brassSentry-CnzRY3Cp.webp", import.meta.url).href;
const __vite_glob_0_13$1 = "" + new URL("monster-briarKing-DTiiihfc.webp", import.meta.url).href;
const __vite_glob_0_14$1 = "" + new URL("monster-broodGuard-DUP_f9Q7.webp", import.meta.url).href;
const __vite_glob_0_15$1 = "" + new URL("monster-broodmother-D6VlPnI6.webp", import.meta.url).href;
const __vite_glob_0_16$1 = "" + new URL("monster-caveBat-Bt1jMtpm.webp", import.meta.url).href;
const __vite_glob_0_17 = "" + new URL("monster-caveSpider-BkfV5uWL.webp", import.meta.url).href;
const __vite_glob_0_18 = "" + new URL("monster-cinderHound-DpT75Z-W.webp", import.meta.url).href;
const __vite_glob_0_19 = "" + new URL("monster-clockworkKnight-BDQ0TcKp.webp", import.meta.url).href;
const __vite_glob_0_20 = "" + new URL("monster-cloudSerpent-DMHIbP5J.webp", import.meta.url).href;
const __vite_glob_0_21 = "" + new URL("monster-cogSpider-DkOKxDop.webp", import.meta.url).href;
const __vite_glob_0_22 = "" + new URL("monster-cragLynx-CDVmHa-N.webp", import.meta.url).href;
const __vite_glob_0_23 = "" + new URL("monster-cryptGhoul-8pVhc9TZ.webp", import.meta.url).href;
const __vite_glob_0_24 = "" + new URL("monster-drownedKnight-BTQHP5Nz.webp", import.meta.url).href;
const __vite_glob_0_25 = "" + new URL("monster-duskRegent-DT-8l5R0.webp", import.meta.url).href;
const __vite_glob_0_26 = "" + new URL("monster-emberColossus-BkO2HscR.webp", import.meta.url).href;
const __vite_glob_0_27 = "" + new URL("monster-emberMote-BZ33w8L0.webp", import.meta.url).href;
const __vite_glob_0_28 = "" + new URL("monster-emberRevenant-Dedp_e_f.webp", import.meta.url).href;
const __vite_glob_0_29 = "" + new URL("monster-flameKnight-ByovAbGy.webp", import.meta.url).href;
const __vite_glob_0_30 = "" + new URL("monster-forgeTitan-C9cj3itH.webp", import.meta.url).href;
const __vite_glob_0_31 = "" + new URL("monster-forgeWarden-CEkJaQwO.webp", import.meta.url).href;
const __vite_glob_0_32 = "" + new URL("monster-frostRevenant-Bk52TlhT.webp", import.meta.url).href;
const __vite_glob_0_33 = "" + new URL("monster-frostToad-B9lNbLBa.webp", import.meta.url).href;
const __vite_glob_0_34 = "" + new URL("monster-galeKestrel-DLmTHx6L.webp", import.meta.url).href;
const __vite_glob_0_35 = "" + new URL("monster-goblin-CzE60BpW.webp", import.meta.url).href;
const __vite_glob_0_36 = "" + new URL("monster-goblinBrute-T7AobANq.webp", import.meta.url).href;
const __vite_glob_0_37 = "" + new URL("monster-hiveDrone-BXFevj4A.webp", import.meta.url).href;
const __vite_glob_0_38 = "" + new URL("monster-hiveQueen-DiI8ELHc.webp", import.meta.url).href;
const __vite_glob_0_39 = "" + new URL("monster-ironOverseer-DlMRAY5T.webp", import.meta.url).href;
const __vite_glob_0_40 = "" + new URL("monster-kobold-DQ9jA_Fo.webp", import.meta.url).href;
const __vite_glob_0_41 = "" + new URL("monster-koboldShaman-BgDjp6ij.webp", import.meta.url).href;
const __vite_glob_0_42 = "" + new URL("monster-lichAcolyte-CfcVkiXn.webp", import.meta.url).href;
const __vite_glob_0_43 = "" + new URL("monster-marshWisp-B5MlmX0j.webp", import.meta.url).href;
const __vite_glob_0_44 = "" + new URL("monster-mireMother-STQmUdc4.webp", import.meta.url).href;
const __vite_glob_0_45 = "" + new URL("monster-mireStalker-CrIR_boQ.webp", import.meta.url).href;
const __vite_glob_0_46 = "" + new URL("monster-obsidianGolem-CuJPbPi4.webp", import.meta.url).href;
const __vite_glob_0_47 = "" + new URL("monster-oreGolem-BfdvUKIS.webp", import.meta.url).href;
const __vite_glob_0_48 = "" + new URL("monster-paleLich-KsUhdpw4.webp", import.meta.url).href;
const __vite_glob_0_49 = "" + new URL("monster-plagueBearer-ihMyqu51.webp", import.meta.url).href;
const __vite_glob_0_50 = "" + new URL("monster-pretender-10edDg2J.webp", import.meta.url).href;
const __vite_glob_0_51 = "" + new URL("monster-rat-DfaxG7DG.webp", import.meta.url).href;
const __vite_glob_0_52 = "" + new URL("monster-riftHound-25_8AfdR.webp", import.meta.url).href;
const __vite_glob_0_53 = "" + new URL("monster-riftMote-CVlgGaPW.webp", import.meta.url).href;
const __vite_glob_0_54 = "" + new URL("monster-riftStalker-D8G2vRs_.webp", import.meta.url).href;
const __vite_glob_0_55 = "" + new URL("monster-riftTyrant-D0L_1QcQ.webp", import.meta.url).href;
const __vite_glob_0_56 = "" + new URL("monster-riftWarden-BIANCqdj.webp", import.meta.url).href;
const __vite_glob_0_57 = "" + new URL("monster-salamander-gCAnKrlA.webp", import.meta.url).href;
const __vite_glob_0_58 = "" + new URL("monster-shardGolem-BKGeg-uz.webp", import.meta.url).href;
const __vite_glob_0_59 = "" + new URL("monster-shatteredKing-RKq8A5BU.webp", import.meta.url).href;
const __vite_glob_0_60 = "" + new URL("monster-shatteredKnight-Ck-0_qV-.webp", import.meta.url).href;
const __vite_glob_0_61 = "" + new URL("monster-skeleton-B1B7P21c.webp", import.meta.url).href;
const __vite_glob_0_62 = "" + new URL("monster-skyHarpy-DclB9tyr.webp", import.meta.url).href;
const __vite_glob_0_63 = "" + new URL("monster-skySovereign-CuqhUllF.webp", import.meta.url).href;
const __vite_glob_0_64 = "" + new URL("monster-smelterGolem-zDQky2NU.webp", import.meta.url).href;
const __vite_glob_0_65 = "" + new URL("monster-sparkWisp-BtPNlxVg.webp", import.meta.url).href;
const __vite_glob_0_66 = "" + new URL("monster-starfallMote-BYdqiPnG.webp", import.meta.url).href;
const __vite_glob_0_67 = "" + new URL("monster-steamHound-DopTTH7C.webp", import.meta.url).href;
const __vite_glob_0_68 = "" + new URL("monster-stormHarpy-Br3TBpe0.webp", import.meta.url).href;
const __vite_glob_0_69 = "" + new URL("monster-stormHawk-yVRH4u0U.webp", import.meta.url).href;
const __vite_glob_0_70 = "" + new URL("monster-stormHerald-CVQ8N9Vl.webp", import.meta.url).href;
const __vite_glob_0_71 = "" + new URL("monster-stormRevenant-C88Z3cQJ.webp", import.meta.url).href;
const __vite_glob_0_72 = "" + new URL("monster-stormcaller-_3iEjpg2.webp", import.meta.url).href;
const __vite_glob_0_73 = "" + new URL("monster-stormveinColossus-Km5NnCna.webp", import.meta.url).href;
const __vite_glob_0_74 = "" + new URL("monster-swarmling-PP1iCfiw.webp", import.meta.url).href;
const __vite_glob_0_75 = "" + new URL("monster-tempestRoc-CymCPj3Q.webp", import.meta.url).href;
const __vite_glob_0_76 = "" + new URL("monster-thornMantis-CaAsoMWd.webp", import.meta.url).href;
const __vite_glob_0_77 = "" + new URL("monster-throneSentinel-DNE1W_56.webp", import.meta.url).href;
const __vite_glob_0_78 = "" + new URL("monster-thunderEagle-ComrqRKm.webp", import.meta.url).href;
const __vite_glob_0_79 = "" + new URL("monster-thunderRam-sRl5WZVE.webp", import.meta.url).href;
const __vite_glob_0_80 = "" + new URL("monster-thunderbird-D9XekI7-.webp", import.meta.url).href;
const __vite_glob_0_81 = "" + new URL("monster-troll-D18OFrMw.webp", import.meta.url).href;
const __vite_glob_0_82 = "" + new URL("monster-veiledOracle-lRdVxqxP.webp", import.meta.url).href;
const __vite_glob_0_83 = "" + new URL("monster-voidWraith-DnndAhlh.webp", import.meta.url).href;
const __vite_glob_0_84 = "" + new URL("monster-wailingShade-DlGijTdM.webp", import.meta.url).href;
const __vite_glob_0_85 = "" + new URL("monster-windWarden-vRAYTjEo.webp", import.meta.url).href;
const __vite_glob_0_86 = "" + new URL("monster-wolf-BnV7Mzl3.webp", import.meta.url).href;
const __vite_glob_0_87 = "" + new URL("monster-wyrmqueen-D6OEeFNx.webp", import.meta.url).href;
const files$1 = /* @__PURE__ */ Object.assign({ "../assets/monsters/monster-acidSpitter.webp": __vite_glob_0_0$3, "../assets/monsters/monster-alphaWolf.webp": __vite_glob_0_1$3, "../assets/monsters/monster-amberBeetle.webp": __vite_glob_0_2$3, "../assets/monsters/monster-amberEmpress.webp": __vite_glob_0_3$3, "../assets/monsters/monster-ashImp.webp": __vite_glob_0_4$3, "../assets/monsters/monster-ashenWyrm.webp": __vite_glob_0_5$3, "../assets/monsters/monster-bandit.webp": __vite_glob_0_6$2, "../assets/monsters/monster-banditCaptain.webp": __vite_glob_0_7$2, "../assets/monsters/monster-barrowKnight.webp": __vite_glob_0_8$2, "../assets/monsters/monster-bogHag.webp": __vite_glob_0_9$2, "../assets/monsters/monster-bogLeech.webp": __vite_glob_0_10$2, "../assets/monsters/monster-boneThrall.webp": __vite_glob_0_11$2, "../assets/monsters/monster-brassSentry.webp": __vite_glob_0_12$1, "../assets/monsters/monster-briarKing.webp": __vite_glob_0_13$1, "../assets/monsters/monster-broodGuard.webp": __vite_glob_0_14$1, "../assets/monsters/monster-broodmother.webp": __vite_glob_0_15$1, "../assets/monsters/monster-caveBat.webp": __vite_glob_0_16$1, "../assets/monsters/monster-caveSpider.webp": __vite_glob_0_17, "../assets/monsters/monster-cinderHound.webp": __vite_glob_0_18, "../assets/monsters/monster-clockworkKnight.webp": __vite_glob_0_19, "../assets/monsters/monster-cloudSerpent.webp": __vite_glob_0_20, "../assets/monsters/monster-cogSpider.webp": __vite_glob_0_21, "../assets/monsters/monster-cragLynx.webp": __vite_glob_0_22, "../assets/monsters/monster-cryptGhoul.webp": __vite_glob_0_23, "../assets/monsters/monster-drownedKnight.webp": __vite_glob_0_24, "../assets/monsters/monster-duskRegent.webp": __vite_glob_0_25, "../assets/monsters/monster-emberColossus.webp": __vite_glob_0_26, "../assets/monsters/monster-emberMote.webp": __vite_glob_0_27, "../assets/monsters/monster-emberRevenant.webp": __vite_glob_0_28, "../assets/monsters/monster-flameKnight.webp": __vite_glob_0_29, "../assets/monsters/monster-forgeTitan.webp": __vite_glob_0_30, "../assets/monsters/monster-forgeWarden.webp": __vite_glob_0_31, "../assets/monsters/monster-frostRevenant.webp": __vite_glob_0_32, "../assets/monsters/monster-frostToad.webp": __vite_glob_0_33, "../assets/monsters/monster-galeKestrel.webp": __vite_glob_0_34, "../assets/monsters/monster-goblin.webp": __vite_glob_0_35, "../assets/monsters/monster-goblinBrute.webp": __vite_glob_0_36, "../assets/monsters/monster-hiveDrone.webp": __vite_glob_0_37, "../assets/monsters/monster-hiveQueen.webp": __vite_glob_0_38, "../assets/monsters/monster-ironOverseer.webp": __vite_glob_0_39, "../assets/monsters/monster-kobold.webp": __vite_glob_0_40, "../assets/monsters/monster-koboldShaman.webp": __vite_glob_0_41, "../assets/monsters/monster-lichAcolyte.webp": __vite_glob_0_42, "../assets/monsters/monster-marshWisp.webp": __vite_glob_0_43, "../assets/monsters/monster-mireMother.webp": __vite_glob_0_44, "../assets/monsters/monster-mireStalker.webp": __vite_glob_0_45, "../assets/monsters/monster-obsidianGolem.webp": __vite_glob_0_46, "../assets/monsters/monster-oreGolem.webp": __vite_glob_0_47, "../assets/monsters/monster-paleLich.webp": __vite_glob_0_48, "../assets/monsters/monster-plagueBearer.webp": __vite_glob_0_49, "../assets/monsters/monster-pretender.webp": __vite_glob_0_50, "../assets/monsters/monster-rat.webp": __vite_glob_0_51, "../assets/monsters/monster-riftHound.webp": __vite_glob_0_52, "../assets/monsters/monster-riftMote.webp": __vite_glob_0_53, "../assets/monsters/monster-riftStalker.webp": __vite_glob_0_54, "../assets/monsters/monster-riftTyrant.webp": __vite_glob_0_55, "../assets/monsters/monster-riftWarden.webp": __vite_glob_0_56, "../assets/monsters/monster-salamander.webp": __vite_glob_0_57, "../assets/monsters/monster-shardGolem.webp": __vite_glob_0_58, "../assets/monsters/monster-shatteredKing.webp": __vite_glob_0_59, "../assets/monsters/monster-shatteredKnight.webp": __vite_glob_0_60, "../assets/monsters/monster-skeleton.webp": __vite_glob_0_61, "../assets/monsters/monster-skyHarpy.webp": __vite_glob_0_62, "../assets/monsters/monster-skySovereign.webp": __vite_glob_0_63, "../assets/monsters/monster-smelterGolem.webp": __vite_glob_0_64, "../assets/monsters/monster-sparkWisp.webp": __vite_glob_0_65, "../assets/monsters/monster-starfallMote.webp": __vite_glob_0_66, "../assets/monsters/monster-steamHound.webp": __vite_glob_0_67, "../assets/monsters/monster-stormHarpy.webp": __vite_glob_0_68, "../assets/monsters/monster-stormHawk.webp": __vite_glob_0_69, "../assets/monsters/monster-stormHerald.webp": __vite_glob_0_70, "../assets/monsters/monster-stormRevenant.webp": __vite_glob_0_71, "../assets/monsters/monster-stormcaller.webp": __vite_glob_0_72, "../assets/monsters/monster-stormveinColossus.webp": __vite_glob_0_73, "../assets/monsters/monster-swarmling.webp": __vite_glob_0_74, "../assets/monsters/monster-tempestRoc.webp": __vite_glob_0_75, "../assets/monsters/monster-thornMantis.webp": __vite_glob_0_76, "../assets/monsters/monster-throneSentinel.webp": __vite_glob_0_77, "../assets/monsters/monster-thunderEagle.webp": __vite_glob_0_78, "../assets/monsters/monster-thunderRam.webp": __vite_glob_0_79, "../assets/monsters/monster-thunderbird.webp": __vite_glob_0_80, "../assets/monsters/monster-troll.webp": __vite_glob_0_81, "../assets/monsters/monster-veiledOracle.webp": __vite_glob_0_82, "../assets/monsters/monster-voidWraith.webp": __vite_glob_0_83, "../assets/monsters/monster-wailingShade.webp": __vite_glob_0_84, "../assets/monsters/monster-windWarden.webp": __vite_glob_0_85, "../assets/monsters/monster-wolf.webp": __vite_glob_0_86, "../assets/monsters/monster-wyrmqueen.webp": __vite_glob_0_87 });
const urls$1 = {};
for (const [path, url] of Object.entries(files$1)) {
  const m = /monster-(\w+)\.webp$/.exec(path);
  if (m) urls$1[m[1]] = url;
}
function monsterArtUrl(key) {
  return urls$1[key];
}
const BOSSES = /* @__PURE__ */ new Set([
  "troll",
  "briarKing",
  "broodmother",
  "stormveinColossus",
  "ashenWyrm",
  "wyrmqueen",
  "bogHag",
  "mireMother",
  "thunderbird",
  "tempestRoc",
  "riftWarden",
  "riftTyrant",
  "veiledOracle",
  "hiveQueen",
  "amberEmpress",
  "paleLich",
  "duskRegent",
  "forgeTitan",
  "ironOverseer",
  "skySovereign",
  "stormHerald",
  "shatteredKing",
  "pretender"
]);
function monsterHeadroom(key) {
  return spriteHeadroom[`monster-${key}`] ?? 0;
}
function monsterArtSize(key) {
  return BOSSES.has(key) ? 192 : 96;
}
function spriteSize(n) {
  return n > 5 ? 24 : n >= 3 ? 48 : n === 2 ? 64 : 96;
}
function spriteLayout(keys, featured) {
  const n = keys.length;
  if (!featured || n < 2 || keys.every((k) => k === keys[0])) {
    return keys.map(() => ({ lead: false, size: spriteSize(n) }));
  }
  const leads = keys.filter((k) => k === keys[0]).length;
  const leadSize = n > 5 ? 48 : leads > 1 ? 64 : 96;
  const minionSize = Math.min(48, spriteSize(n - leads));
  return keys.map((k) => k === keys[0] ? { lead: true, size: leadSize } : { lead: false, size: minionSize });
}
function fightLayout(keys, featured) {
  return spriteLayout(keys, featured).map((l, i) => monsterArtUrl(keys[i]) ? { ...l, size: monsterArtSize(keys[i]) } : l);
}
const __vite_glob_0_0$2 = "" + new URL("bg-amberHive-C-HM_j30.webp", import.meta.url).href;
const __vite_glob_0_1$2 = "" + new URL("bg-ashenPeaks-CHEdJu_X.webp", import.meta.url).href;
const __vite_glob_0_2$2 = "" + new URL("bg-brambleRoad-DNfTNO1k.webp", import.meta.url).href;
const __vite_glob_0_3$2 = "" + new URL("bg-duskgraveNecropolis-DOQVE2O5.webp", import.meta.url).href;
const __vite_glob_0_4$2 = "" + new URL("bg-guild-CmMq6GJH.webp", import.meta.url).href;
const __vite_glob_0_5$2 = "" + new URL("bg-hollowMines-DVzuiz4I.webp", import.meta.url).href;
const __vite_glob_0_6$1 = "" + new URL("bg-ironboundFoundry-OmRHF7Be.webp", import.meta.url).href;
const __vite_glob_0_7$1 = "" + new URL("bg-shatteredThrone-D3jg0tbR.webp", import.meta.url).href;
const __vite_glob_0_8$1 = "" + new URL("bg-skyspireAerie-BN52tg0B.webp", import.meta.url).href;
const __vite_glob_0_9$1 = "" + new URL("bg-sunderedRift-C7aXStba.webp", import.meta.url).href;
const __vite_glob_0_10$1 = "" + new URL("bg-sunkenMarsh-CE_8bZNd.webp", import.meta.url).href;
const __vite_glob_0_11$1 = "" + new URL("bg-thunderheadCrags-D6ld5jZq.webp", import.meta.url).href;
const files = /* @__PURE__ */ Object.assign({ "../assets/backgrounds/bg-amberHive.webp": __vite_glob_0_0$2, "../assets/backgrounds/bg-ashenPeaks.webp": __vite_glob_0_1$2, "../assets/backgrounds/bg-brambleRoad.webp": __vite_glob_0_2$2, "../assets/backgrounds/bg-duskgraveNecropolis.webp": __vite_glob_0_3$2, "../assets/backgrounds/bg-guild.webp": __vite_glob_0_4$2, "../assets/backgrounds/bg-hollowMines.webp": __vite_glob_0_5$2, "../assets/backgrounds/bg-ironboundFoundry.webp": __vite_glob_0_6$1, "../assets/backgrounds/bg-shatteredThrone.webp": __vite_glob_0_7$1, "../assets/backgrounds/bg-skyspireAerie.webp": __vite_glob_0_8$1, "../assets/backgrounds/bg-sunderedRift.webp": __vite_glob_0_9$1, "../assets/backgrounds/bg-sunkenMarsh.webp": __vite_glob_0_10$1, "../assets/backgrounds/bg-thunderheadCrags.webp": __vite_glob_0_11$1 });
const urls = {};
for (const [path, url] of Object.entries(files)) {
  const m = /bg-(\w+)\.webp$/.exec(path);
  if (m) urls[m[1]] = url;
}
function backgroundUrl(key) {
  return urls[key];
}
const floors = {
  brambleRoad: 0.56,
  guild: 0.7,
  hollowMines: 0.54,
  ashenPeaks: 0.56,
  sunkenMarsh: 0.55,
  thunderheadCrags: 0.48,
  sunderedRift: 0.52,
  amberHive: 0.5,
  duskgraveNecropolis: 0.51,
  ironboundFoundry: 0.55,
  skyspireAerie: 0.46,
  shatteredThrone: 0.57
};
function backgroundFloor(key) {
  return floors[key] ?? 0.6;
}
const HIT_STAGGER_MS = 110;
const hitDelay = (hitIndex) => Math.min(hitIndex, 6) * HIT_STAGGER_MS;
const MAX_FLOATERS = 40;
const MAX_LOG = 7;
function shortNum(n) {
  n = Math.max(0, n);
  return n >= 1e6 ? `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)}M` : n >= 1e4 ? `${Math.round(n / 1e3)}k` : String(Math.ceil(n));
}
const AILMENT_WORDS = { burn: ["burning", "fire"], chill: ["chilled", "cold"], shock: ["shocked", "lightning"], weaken: ["weakened", "weaken"], snare: ["snared", "snare"], blind: ["blinded", "blind"], bleed: ["bleeding", "bleed"], sunder: ["sundered", "sunder"], gale: ["off balance", "gale"] };
const FX_MIRRORED = /* @__PURE__ */ new Set(["scratch", "slash", "stab", "lash", "sting", "throw", "web", "dust", "gust", "bleed", "drain", "sonar", "acid", "steam", "prism", "starfall"]);
const BASIC_FX_SCALE = 0.65;
const basicFxScale = (effect) => effect === "thump" ? 1 : BASIC_FX_SCALE;
const BASIC_FX_JITTER = 14;
function renderAilments(el, a, extra = []) {
  const parts = [...extra];
  const burn = burnDps(a) * shockFactor(a);
  if (burn > 0) parts.push(["burn", `Burn ${burn >= 10 ? Math.round(burn) : burn.toFixed(1)}/s`]);
  if (((a == null ? void 0 : a.chill) ?? 0) >= 0.01) parts.push(["chill", `Chill ${Math.round(100 * a.chill)}%`]);
  if (((a == null ? void 0 : a.shock) ?? 0) >= 0.01) parts.push(["shock", `Shock ${Math.round(100 * a.shock)}%`]);
  if (((a == null ? void 0 : a.weaken) ?? 0) >= 0.01) parts.push(["weaken", `Weak ${Math.round(100 * a.weaken)}%`]);
  if (((a == null ? void 0 : a.snare) ?? 0) >= 0.01) parts.push(["snare", `Snare ${Math.round(100 * a.snare)}%`]);
  if (((a == null ? void 0 : a.blind) ?? 0) >= 0.01) parts.push(["blind", `Blind ${Math.round(100 * a.blind)}%`]);
  if (((a == null ? void 0 : a.sunder) ?? 0) >= 0.01) parts.push(["sunder", `Sunder ${Math.round(100 * a.sunder)}%`]);
  if (((a == null ? void 0 : a.gale) ?? 0) >= 0.01) parts.push(["gale", `Gale ${Math.round(100 * a.gale)}%`]);
  if ((a == null ? void 0 : a.bleed) && a.bleed.remaining > 0) parts.push(["bleed", `Bleed ${a.bleed.dps >= 10 ? Math.round(a.bleed.dps) : a.bleed.dps.toFixed(1)}/s`]);
  const sig = parts.map((p) => p[1]).join("|");
  if (el.dataset.sig === sig) return;
  el.dataset.sig = sig;
  el.replaceChildren(...parts.map(([k, t]) => h("span", { class: "ailb " + k }, t)));
}
class CombatView {
  constructor() {
    __publicField(this, "el");
    __publicField(this, "heroEl");
    __publicField(this, "heroHp");
    __publicField(this, "heroWard");
    __publicField(this, "heroWardRow");
    __publicField(this, "heroAil");
    __publicField(this, "heroHpNum");
    __publicField(this, "heroWardNum");
    __publicField(this, "heroName", "");
    // The battle view's short combat log. Lines are only added while it's on the page.
    __publicField(this, "log");
    // Top-right button on the small arena that opens the full battle view. main.ts sets its click.
    __publicField(this, "expand");
    // Over the faded hero while they rest, in the battle view: pay to recover now. main.ts sets its
    // click and calls setRecover each frame.
    __publicField(this, "recover");
    // The quest's diorama and the guild bedroom, drawn on the arena's pixel grid behind the fighters.
    // Centered across the arena with their floor row at its middle; the arena crops what doesn't fit,
    // and the full battle view (which scales the arena) lets them run on to the view's edges.
    __publicField(this, "bgQuest");
    __publicField(this, "bgGuild");
    __publicField(this, "monsterLayer");
    __publicField(this, "overlay");
    __publicField(this, "floaters");
    __publicField(this, "cards", /* @__PURE__ */ new Map());
    __publicField(this, "encounterSig", "");
    __publicField(this, "encounterKey", "");
    // Set while the dev preview builds its monsters, so their entrance plays at this speed.
    __publicField(this, "previewSpeed", null);
    __publicField(this, "adventurerId", null);
    // When the adventurer stopped fighting, in page time. The last fight stays up for a second.
    // View time (see viewTime) when the fight ended.
    __publicField(this, "idleSince", null);
    // Set once the view shows the hero's defeat; late hit numbers from that fight can't refill the bars.
    __publicField(this, "heroDown", false);
    // The hero's max HP as last synced, for numbers set from hit events.
    __publicField(this, "heroMaxHp", 0);
    __publicField(this, "heroHoldUntil", 0);
    // Hits are numbered in the order the engine resolved them. A bar only moves to a later hit, so at
    // high speed a chain's staggered number can't land after the next attack's and push the bar back up.
    __publicField(this, "barSeq", 0);
    __publicField(this, "heroShown", 0);
    // The hero is shown resting at the guild (the battle view fades to the guild background).
    __publicField(this, "resting", false);
    // The run on show (quest and run number). A new one starts from a clean arena.
    __publicField(this, "runSig", "");
    // Delayed parts of shown events (staggered bars, flashes) still to come; reset cancels them.
    // Effects still to play, on the view's own timeline (see viewTime), run in time order.
    __publicField(this, "queue", []);
    __publicField(this, "queueSeq", 0);
    __publicField(this, "pumping", false);
    // When settled() first had to hold a hero back, in page time.
    __publicField(this, "waitSince", null);
    __publicField(this, "previewKeys", []);
    __publicField(this, "paceRate", 1);
    // Monsters that just cast (their hit shouldn't lunge again), and the effect their hit brings.
    __publicField(this, "castSlots", /* @__PURE__ */ new Set());
    __publicField(this, "pendingFx", /* @__PURE__ */ new Map());
    this.heroHp = h("span");
    this.heroWard = h("span");
    this.heroHpNum = h("span", { class: "hpnum" });
    this.heroWardNum = h("span", { class: "hpnum" });
    this.heroWardRow = h("div", { class: "bar ward" }, this.heroWard, this.heroWardNum);
    this.heroAil = h("div", { class: "ails" });
    this.log = h("ol", { class: "battlelog", "aria-label": "Combat log" });
    this.heroEl = h(
      "div",
      { class: "fighter hero" },
      h("div", { class: "avatar" }),
      h("div", { class: "fname" }),
      h("div", { class: "bar" }, this.heroHp, this.heroHpNum),
      this.heroWardRow,
      this.heroAil
    );
    this.monsterLayer = h("div", { class: "monsters" });
    this.overlay = h("div", { class: "arena-overlay" });
    this.floaters = h("div", { class: "floaters", "aria-hidden": "true" });
    this.recover = h("button", { class: "btn small primary arena-recover", hidden: true });
    this.expand = h(
      "button",
      { class: "arena-expand", title: "Open the full battle view", "aria-label": "Open the full battle view" },
      svgEl('<svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7"/></svg>')
    );
    this.bgQuest = h("img", { class: "arena-bg", alt: "", draggable: "false" });
    this.bgGuild = h("img", { class: "arena-bg guild", alt: "", draggable: "false" });
    this.el = h(
      "div",
      { class: "arena", role: "group", "aria-label": "Combat view" },
      this.bgQuest,
      this.bgGuild,
      this.heroEl,
      this.monsterLayer,
      this.floaters,
      this.overlay,
      this.recover,
      this.expand
    );
  }
  // Runs `fn` `ms` later on the view's timeline (slowed by the dilation), unless reset() comes
  // first. Counts as an effect still playing.
  later(fn, ms) {
    this.queue.push({ at: viewTime() + ms, seq: this.queueSeq++, fn });
    this.pump();
  }
  // Runs every queued effect whose time has come, earliest first (ties in the order queued), on
  // each animation frame while any are waiting. The dilation only slows the timeline, so effects
  // always play in the order they were scheduled for.
  pump() {
    if (this.pumping) return;
    this.pumping = true;
    const step = () => {
      const t = viewTime();
      while (this.queue.length) {
        let next = 0;
        for (let k = 1; k < this.queue.length; k++) {
          const q = this.queue[k], b = this.queue[next];
          if (q.at < b.at || q.at === b.at && q.seq < b.seq) next = k;
        }
        if (this.queue[next].at > t) break;
        const [item] = this.queue.splice(next, 1);
        item.fn();
      }
      if (this.queue.length) requestAnimationFrame(step);
      else this.pumping = false;
    };
    requestAnimationFrame(step);
  }
  // Clears everything a fight left on the arena: numbers, effect strips, monsters, pending hits,
  // the hero's running animations, the log and any slowdown. Used when a new run starts.
  reset() {
    this.queue = [];
    this.floaters.replaceChildren();
    this.log.replaceChildren();
    this.cards.clear();
    this.monsterLayer.replaceChildren();
    this.encounterSig = "";
    this.encounterKey = "";
    this.castSlots.clear();
    this.pendingFx.clear();
    this.heroHoldUntil = 0;
    this.heroShown = 0;
    this.idleSince = null;
    this.heroDown = false;
    this.heroEl.classList.remove("down");
    this.waitSince = null;
    for (const cls of Object.keys(ANIMS)) {
      this.heroEl.classList.remove(cls);
      delete this.heroEl.dataset[cls];
    }
    this.heroEl.style.animationDelay = "";
    this.heroEl.style.animationDuration = "";
    endDilation();
  }
  // Whether this adventurer can leave their quest now: true unless the arena shows them and the
  // last fight's numbers, effects or events are still to play. Never holds longer than
  // MAX_SETTLE_MS, in case something never finishes.
  settled(adventurerId, eventsPending) {
    if (!this.el.isConnected || adventurerId !== this.adventurerId) return true;
    if (!eventsPending && !this.floaters.childElementCount && !this.queue.length) {
      this.waitSince = null;
      return true;
    }
    const now = viewTime();
    this.waitSince ?? (this.waitSince = now);
    if (now - this.waitSince < MAX_SETTLE_MS) return false;
    this.waitSince = null;
    return true;
  }
  setBackground(img, key) {
    const url = backgroundUrl(key);
    img.hidden = !url;
    if (url && img.getAttribute("src") !== url) {
      img.src = url;
      const place = () => {
        img.style.marginLeft = `${-img.naturalWidth / 2}px`;
        img.style.top = `${Math.round(105 - img.naturalHeight * backgroundFloor(key))}px`;
      };
      if (img.complete && img.naturalWidth) place();
      else img.addEventListener("load", place, { once: true });
    }
    return !!url;
  }
  // `spriteOverride` (dev preview) swaps in another battle sprite, such as a weapon-swap test,
  // and drops the attack strip, which is drawn for the standard sprite.
  setHero(hero, spriteOverride) {
    const avatar = this.heroEl.children[0];
    const sig = hero.classKey + hero.name + (spriteOverride ?? "");
    if (avatar.dataset.cls !== sig) {
      avatar.dataset.cls = sig;
      const sprite = spriteOverride ?? heroSpriteUrl(hero);
      avatar.classList.toggle("sprite", !!sprite);
      this.heroEl.classList.toggle("has-art", !!sprite);
      this.heroEl.dataset.head = String(sprite ? heroSpriteHeadroom(hero) : 0);
      const attack = sprite && !spriteOverride ? heroAttackUrl(hero) : void 0;
      const parts = sprite ? [h("img", { src: sprite, alt: "", draggable: "false" })] : [heroPortrait(hero) ?? classIcon(hero.classKey)];
      if (attack) parts.push(h("div", { class: "swing", style: `background-image:url(${attack})` }));
      avatar.replaceChildren(...parts);
    }
    this.heroEl.children[1].textContent = hero.name;
  }
  // Shows the recover button while the hero rests here, or hides it (text null).
  setRecover(text, enabled) {
    const show = text !== null && this.resting;
    this.recover.hidden = !show;
    if (!show) return;
    if (this.recover.textContent !== text) this.recover.textContent = text;
    this.recover.disabled = !enabled;
  }
  // Dev preview: lay out one encounter as the battle view would, with full bars and no fight.
  // `entrance` replays the walk-ins at 1x speed.
  preview(questKey, keys, boss, featured, hero, entrance, sprite) {
    var _a2;
    const quest = quests[questKey];
    const hasBg = this.setBackground(this.bgQuest, ((_a2 = quest == null ? void 0 : quest.endless) == null ? void 0 : _a2.baseKey) ?? questKey);
    this.setBackground(this.bgGuild, "guild");
    this.el.classList.toggle("has-bg", hasBg);
    this.el.classList.remove("at-guild");
    this.setHero(hero, sprite);
    this.heroHp.style.width = "100%";
    this.heroWardRow.hidden = true;
    this.heroHpNum.textContent = "100 / 100";
    this.heroAil.replaceChildren();
    this.heroEl.hidden = false;
    this.heroEl.classList.remove("resting", "down");
    this.overlay.hidden = true;
    this.floaters.replaceChildren();
    this.encounterSig = "preview";
    this.encounterKey = "preview";
    this.previewSpeed = 1;
    this.previewKeys = keys;
    this.buildMonsters(keys, boss, featured, entrance);
    this.previewSpeed = null;
    for (const [slot, card] of this.cards) {
      card.bar.style.width = "100%";
      card.hpNum.textContent = "100 / 100";
      card.root.classList.toggle("front", slot === 0);
    }
    if (entrance) enter(this.heroEl, 0, 0.55, 1);
  }
  // Dev preview: one attack. `slot` -1 is the hero attacking the front monster; otherwise that
  // monster attacks the hero. `anim` is a registry key or 'ability:<n>' for the monster's own kit
  // entry, which casts, calls its name and brings its effect when `effect` is 'auto'. Returns
  // what played, for the caption.
  previewAttack(opts) {
    var _a2, _b2;
    const side = opts.slot < 0 ? "hero" : "monster";
    const foe = (_a2 = this.cards.get(Math.max(0, opts.slot))) == null ? void 0 : _a2.root;
    const attacker = side === "hero" ? this.heroEl : foe;
    const target = side === "hero" ? foe : this.heroEl;
    if (!attacker || !target) return "nothing (no monster in that slot)";
    const kit = side === "monster" ? monsterKit(this.previewKeys[opts.slot] ?? "") : null;
    const kitIndex = opts.anim.startsWith("ability:") ? Number(opts.anim.slice(8)) : -1;
    const entry = kit == null ? void 0 : kit[kitIndex];
    let label, impact, fx, type = "physical", fxScale = 1;
    const self = !!entry && !Object.keys(entry.shares).length && !entry.applies && !!(entry.heal || entry.rally || entry.buff);
    if (entry) {
      restartClass(attacker, entry.spell ? "casting" : "lunge");
      if (!entry.basic) this.float(attacker, entry.name, "word ability", 0);
      label = `${entry.name}${entry.spell ? " (spell)" : ""}${entry.applies ? `, applies ${entry.applies.ailment}` : ""}`;
      impact = entry.spell ? 260 : 90;
      fx = entry.effect;
      fxScale = entry.effectScale ?? (entry.basic ? basicFxScale(entry.effect) : 1);
      type = ((_b2 = Object.entries(entry.shares).sort((x, y) => (y[1] ?? 0) - (x[1] ?? 0))[0]) == null ? void 0 : _b2[0]) ?? "physical";
    } else {
      let anim = ATTACK_ANIMS.find((a) => a.key === opts.anim && a.available(attacker, side)) ?? ATTACK_ANIMS[0];
      const cls = typeof anim.cls === "string" ? anim.cls : anim.cls(attacker, side);
      if (anim.key === "auto") anim = ATTACK_ANIMS.find((a) => a.cls === cls) ?? anim;
      if (cls) restartClass(attacker, cls);
      label = anim.label;
      impact = anim.impact;
    }
    const effect = HIT_EFFECTS.find((e) => e.key === opts.effect) ?? HIT_EFFECTS[0];
    if (effect.key !== "auto") fx = effect.fx;
    this.later(() => {
      if (self) {
        if (fx) this.abilityFx(attacker, fx, fxScale);
        const b = entry.buff;
        this.float(attacker, entry.heal ? `+${Math.round(100 * entry.heal)}%` : b ? { guard: "guarded", evade: "evasive", ward: "warded" }[b.kind] : "hasted", "word heal", 0);
        return;
      }
      for (const c of (effect.cls ?? (effect.key === "auto" ? "struck" : "")).split(" ").filter(Boolean)) restartClass(target, c);
      if (effect.overlay) this.fxOverlay(target, effect.overlay);
      if (fx) this.abilityFx(target, fx, effect.key === "auto" ? fxScale : 1, effect.key === "auto" && !!(entry == null ? void 0 : entry.basic));
      if (entry == null ? void 0 : entry.applies) {
        const word = AILMENT_WORDS[entry.applies.ailment];
        this.float(target, word[0], `word ${word[1]}`, 0);
      }
      if (opts.number !== "none" && (!entry || Object.keys(entry.shares).length)) {
        const crit = opts.number === "crit";
        this.float(target, crit ? "248!!" : "62", `dmg ${type}${crit ? " crit crit2" : ""}`, 0, crit ? 1.4 : 1);
      }
    }, impact);
    return label + (fx ? ` · ${fx} effect` : "");
  }
  // A one-shot effect drawn over a fighter's body, in the floaters layer so it sits on top.
  fxOverlay(target, cls) {
    const avatar = target.querySelector(".avatar") ?? target;
    const arena = this.el.getBoundingClientRect(), box = avatar.getBoundingClientRect();
    const k = arena.width / (this.el.offsetWidth || arena.width) || 1;
    const head = Number(target.dataset.head ?? 0);
    const x = (box.left - arena.left + box.width / 2) / k;
    const y = (box.top - arena.top + (box.height + head * k) / 2) / k;
    const el = h("div", { class: "fx " + cls, style: `left:${x}px;top:${y}px` });
    el.addEventListener("animationend", () => el.remove());
    window.setTimeout(() => el.remove(), 1500);
    this.floaters.appendChild(el);
    const rate = this.fxRate();
    if (rate !== 1) for (const a of el.getAnimations()) a.playbackRate = rate;
  }
  update(state2, adventurer) {
    var _a2, _b2, _c2, _d, _e;
    const runQuest = adventurer.run ? quests[adventurer.run.questKey] : void 0;
    const hasBg = this.setBackground(this.bgQuest, ((_a2 = runQuest == null ? void 0 : runQuest.endless) == null ? void 0 : _a2.baseKey) ?? (runQuest == null ? void 0 : runQuest.key) ?? "");
    const hasGuild = this.setBackground(this.bgGuild, "guild");
    this.el.classList.toggle("has-bg", hasBg);
    const runSig = adventurer.run ? `${adventurer.run.questKey}:${adventurer.run.number}` : "";
    if (this.adventurerId !== adventurer.id || runSig !== this.runSig) {
      this.adventurerId = adventurer.id;
      this.runSig = runSig;
      this.reset();
    }
    const stats = getCachedStats(state2, adventurer);
    this.heroMaxHp = stats.maxHealth;
    this.setHero(adventurer);
    this.heroName = adventurer.name;
    if (adventurer.activity.kind === "fighting" && viewTime() >= this.heroHoldUntil) {
      this.heroHp.style.width = `${100 * Math.max(0, adventurer.hp) / stats.maxHealth}%`;
      this.heroWardRow.hidden = stats.maxWard <= 0;
      this.heroWard.style.width = `${100 * Math.max(0, Math.min(stats.maxWard, adventurer.ward ?? 0)) / Math.max(1, stats.maxWard)}%`;
      this.heroHpNum.textContent = `${shortNum(adventurer.hp)} / ${shortNum(stats.maxHealth)}`;
      this.heroWardNum.textContent = `${shortNum(Math.min(stats.maxWard, adventurer.ward ?? 0))} / ${shortNum(stats.maxWard)}`;
    }
    const a = adventurer.activity;
    if (a.kind === "fighting") {
      const sig = `${a.questKey}:${a.encounterIndex}:${a.bonus ? "b" : ""}:${a.boss ?? ""}:${((_b2 = adventurer.run) == null ? void 0 : _b2.number) ?? 0}:${(a.adds ?? []).join(",")}`;
      if (sig !== this.encounterSig) {
        this.encounterSig = sig;
        const tier = (_c2 = quests[a.questKey].encounters[a.encounterIndex]) == null ? void 0 : _c2.tier;
        const encounterKey = sig.slice(0, sig.lastIndexOf(":"));
        const fresh = encounterKey !== this.encounterKey;
        this.encounterKey = encounterKey;
        this.buildMonsters([...a.lineup ?? quests[a.questKey].encounters[a.encounterIndex].monsters, ...a.adds ?? []], !!a.boss, !!a.boss || tier === "R", fresh);
        if (fresh && a.encounterIndex === 0 && !a.bonus && !a.boss) enter(this.heroEl, 0, 0.55);
      }
      const run = ((_d = adventurer.run) == null ? void 0 : _d.questKey) === a.questKey ? adventurer.run : void 0;
      const stacks = [];
      if (run == null ? void 0 : run.corrosion) stacks.push(["corrosion", `Corrosion ${run.corrosion}`]);
      if (run == null ? void 0 : run.karma) stacks.push(["karma", `Karma ${run.karma}`]);
      renderAilments(this.heroAil, a.heroAilments, stacks);
      const alive = new Map(a.monsters.map((m, i) => [m.slot ?? i, m]));
      const front = ((_e = a.monsters[0]) == null ? void 0 : _e.slot) ?? 0;
      const now = viewTime();
      for (const [slot, card] of this.cards) {
        const m = alive.get(slot);
        if (m && m.hp > 0) card.root.classList.remove("dead");
        if (now < card.holdUntil) {
          continue;
        }
        const marks = [];
        if (m && shielded(m, a.monsters)) marks.push(["shielded", "Shielded"]);
        const will = m ? willFactor(m) : 1;
        if (will > 1) marks.push(["will", `Will +${Math.round(100 * (will - 1))}%`]);
        if (m == null ? void 0 : m.guard) marks.push(["guard", `Guard ${Math.round(100 * m.guard.amount)}%`]);
        if (m == null ? void 0 : m.evade) marks.push(["evade", `Evade +${Math.round(100 * m.evade.amount)}%`]);
        if (m == null ? void 0 : m.ward) marks.push(["ward", `Ward ${shortNum(m.ward)}`]);
        renderAilments(card.ail, m == null ? void 0 : m.ailments, marks);
        card.root.classList.toggle("dead", !m);
        card.root.classList.toggle("front", !!m && slot === front);
        card.bar.style.width = m ? `${100 * Math.max(0, m.hp) / m.maxHp}%` : "0%";
        if (m) card.maxHp = m.maxHp;
        card.hpNum.textContent = m ? `${shortNum(m.hp)} / ${shortNum(m.maxHp)}` : "Defeated";
      }
      this.overlay.hidden = true;
      this.heroEl.hidden = false;
      this.heroEl.classList.remove("resting", "down");
      this.resting = false;
      this.el.classList.remove("at-guild");
      this.idleSince = null;
      this.heroDown = false;
    } else {
      if (this.idleSince === null && a.kind === "resting" && a.defeated) {
        this.heroHp.style.width = "0%";
        this.heroWard.style.width = "0%";
        this.heroHpNum.textContent = `0 / ${shortNum(stats.maxHealth)}`;
        this.heroWardNum.textContent = `0 / ${shortNum(stats.maxWard)}`;
        this.heroDown = true;
        this.heroEl.classList.add("down");
      }
      this.idleSince ?? (this.idleSince = viewTime());
      const cleared = viewTime() - this.idleSince >= 1e3 && !this.queue.length || !this.cards.size;
      this.overlay.hidden = !cleared;
      this.overlay.textContent = a.kind === "resting" ? a.defeated ? "Recovering at the guild" : "Resting at the guild" : a.kind === "traveling" ? "On the road" : "Waiting at the guild";
      const resting = cleared && a.kind === "resting";
      this.resting = resting;
      const onSite = a.kind === "resting" && !a.defeated && !!pendingExtraFight(adventurer);
      this.el.classList.toggle("at-guild", resting && !onSite && hasGuild);
      this.heroEl.classList.toggle("resting", resting);
      if (resting) {
        this.heroHp.style.width = `${100 * Math.max(0, adventurer.hp) / stats.maxHealth}%`;
        this.heroWardRow.hidden = stats.maxWard <= 0;
        this.heroWard.style.width = `${100 * Math.max(0, stats.maxWard) / Math.max(1, stats.maxWard)}%`;
        this.heroHpNum.textContent = `${shortNum(adventurer.hp)} / ${shortNum(stats.maxHealth)}`;
        this.heroWardNum.textContent = `${shortNum(stats.maxWard)} / ${shortNum(stats.maxWard)}`;
        renderAilments(this.heroAil, void 0);
      }
      if (cleared) {
        this.heroEl.hidden = !resting;
        this.cards.clear();
        this.monsterLayer.replaceChildren();
        this.encounterSig = "";
      }
    }
  }
  buildMonsters(keys, boss, featured, entrance = false) {
    this.cards.clear();
    const n = keys.length;
    this.monsterLayer.classList.toggle("many", n > 5);
    this.monsterLayer.classList.toggle("boss", boss);
    const layout = fightLayout(keys, featured);
    const split = layout.some((l) => l.lead);
    const groups = split ? [layout.map((l, i) => l.lead ? i : -1).filter((i) => i >= 0), layout.map((l, i) => l.lead ? -1 : i).filter((i) => i >= 0)] : [keys.map((_, i) => i)];
    const place = /* @__PURE__ */ new Map();
    groups.forEach((slots, g) => {
      const cols = slots.length <= MAX_COLUMN ? 1 : Math.max(Math.ceil(slots.length / MAX_COLUMN), Math.min(3, Math.ceil(slots.length / 3)));
      const per = Math.ceil(slots.length / cols);
      const xs = (split ? g === 0 ? LEAD_COLUMNS : MINION_COLUMNS : COLUMNS)[Math.min(cols, 4) - 1];
      slots.forEach((slot, j) => {
        const c = Math.floor(j / per);
        place.set(slot, { x: xs[Math.min(c, xs.length - 1)], dx: split ? g === 0 ? 4 : 8 : cols > 1 ? 12 : 17, row: j % per, count: Math.min(per, slots.length - c * per) });
      });
    });
    this.monsterLayer.classList.toggle("split", split);
    this.monsterLayer.replaceChildren(...keys.map((key, slot) => {
      const bar = h("span");
      const ail = h("div", { class: "ails" });
      const hpNum = h("span", { class: "hpnum" });
      const name = monsters[key].name;
      const art = monsterArtUrl(key);
      const { lead, size } = layout[slot];
      const row = (i, count) => (art ? GROUND_OFFSET : 0) + (0.5 + 0.7 * i) * 100 / count;
      const at = place.get(slot);
      let top = row(at.row, at.count);
      if (art && size > 96) top = Math.min(top, BOSS_GROUND_MAX);
      const role = split ? lead ? " lead" : " minion" : "";
      const fly = !!art && !!monsters[key].flying;
      const lift = Math.round(FLY_REF * FLY_LIFT);
      const flyStyle = fly ? `;--lift:${lift}px;--bob:${Math.round(FLY_REF * (0.1 + 0.1 * Math.random()))}px;--bob-t:${(1.6 + 0.8 * Math.random()).toFixed(2)}s;--bob-d:${(-2 * Math.random()).toFixed(2)}s` : "";
      const head = art ? monsterHeadroom(key) - (fly ? lift : 0) : 0;
      const root = h(
        "div",
        { class: "fighter monster" + role + (art ? " has-art" : "") + (fly ? " flying" : ""), style: `top:round(${top}%, 1px);--x:${at.x}%;--dx:${at.dx}%;--sprite:${size}px;z-index:${1 + Math.round(top)}${flyStyle}`, "data-head": String(head) },
        art ? h("div", { class: "avatar sprite" }, fly ? h("div", { class: "flyshadow" }) : null, h("img", { src: art, alt: "", draggable: "false" })) : h("div", { class: "avatar" }, monsterIcon(key)),
        h("div", { class: "fname" }, name),
        h("div", { class: "bar" }, bar, hpNum),
        ail
      );
      this.cards.set(slot, { root, bar, ail, hpNum, name, maxHp: 0, holdUntil: 0, shown: 0 });
      if (entrance) enter(root, 0.12 + slot * (n > 1 ? Math.min(0.09, 0.25 / (n - 1)) : 0), 0.45, this.previewSpeed ?? combatSpeed);
      return root;
    }));
  }
  // Runs every animation in the arena (lunges, flashes, numbers, flyers, entrances) at the game
  // clock's current rate, so a big blow's slowdown shows on everything that moves.
  pace(rate) {
    var _a2;
    if (rate === this.paceRate && rate === 1 && combatSpeed === 1) return;
    this.paceRate = rate;
    for (const a of this.el.getAnimations({ subtree: true })) {
      const target = (_a2 = a.effect) == null ? void 0 : _a2.target;
      const want = target instanceof HTMLElement && target.classList.contains("fx") ? this.fxRate() : rate;
      if (a.playbackRate !== want) a.playbackRate = want;
    }
  }
  // Effect strips and overlays play at the game speed too (but not in the effect preview).
  fxRate() {
    return this.paceRate * (this.encounterSig === "preview" ? 1 : combatSpeed);
  }
  // An ability's effect strip played once over a fighter. Ground effects stand on the target's
  // feet (the lowest opaque row of its sprite) and fire bursts on the middle of its body; the strip
  // follows the sprite while it plays, so a lunging or flying target carries it along.
  // Strips are drawn for the hero striking a monster on the right; on the hero, directional ones
  // are mirrored so they come from the monster's side. Basic attacks draw smaller and land at a
  // random spot on the body, so quick repeats don't stack into one strip that seems to rewind.
  abilityFx(target, effect, scale = 1, basic = false) {
    const url = FX_URLS[effect];
    if (!url) return;
    const anchor = FX_ANCHORS[effect] ?? { feet: false, ground: 56 };
    const avatar = target.querySelector(".avatar") ?? target;
    const img = avatar.querySelector("img");
    const flip = target === this.heroEl && FX_MIRRORED.has(effect) ? -1 : 1;
    const size = scale !== 1 || flip < 0 ? `;scale:${flip * scale} ${scale};transform-origin:50% ${anchor.ground}px` : "";
    const dx = basic ? (Math.random() * 2 - 1) * BASIC_FX_JITTER : 0;
    const dy = basic ? (Math.random() * 2 - 1) * BASIC_FX_JITTER * (anchor.feet ? 0.25 : 0.8) : 0;
    const el = h("div", { class: `fx fx-strip fx-${effect}`, style: `background-image:url(${url})${size}` });
    const place = () => {
      const arena = this.el.getBoundingClientRect();
      const box = (img ?? avatar).getBoundingClientRect();
      const k = arena.width / (this.el.offsetWidth || arena.width) || 1;
      const b = img ? opaqueRows(img) : { top: 0, bottom: 1 };
      const at = anchor.feet ? b.bottom : (b.top + b.bottom) / 2;
      el.style.left = `${(box.left - arena.left + box.width / 2) / k + dx}px`;
      el.style.top = `${(box.top - arena.top + box.height * at) / k - anchor.ground + dy}px`;
    };
    place();
    const follow = () => {
      if (el.isConnected) {
        place();
        requestAnimationFrame(follow);
      }
    };
    requestAnimationFrame(follow);
    el.addEventListener("animationend", () => el.remove());
    window.setTimeout(() => el.remove(), 2e3);
    this.floaters.appendChild(el);
    const rate = this.fxRate();
    if (rate !== 1) for (const a of el.getAnimations()) a.playbackRate = rate;
  }
  // Shows a frame's combat events. A blow to the hero worth 25% or more of their life plus ward
  // (a multihit's hits summed as one blow) slows the fight and enlarges its numbers.
  events(list2) {
    var _a2;
    const scale = /* @__PURE__ */ new Map();
    for (let i = 0; i < list2.length; i++) {
      const first = list2[i];
      if (first.side !== "hero" || (first.hitIndex ?? 0) > 0) continue;
      let j = i + 1;
      while (j < list2.length && list2[j].side === "hero" && list2[j].slot === first.slot && (list2[j].hitIndex ?? 0) > 0) j++;
      const blow = list2.slice(i, j);
      const pool = ((_a2 = blow.find((e) => e.pool)) == null ? void 0 : _a2.pool) ?? 0;
      const total = blow.reduce((sum, e) => sum + (e.kind === "hit" ? (e.amount ?? 0) + (e.ward ?? 0) : 0), 0);
      const share = pool > 0 ? total / pool : 0;
      if (share >= BIG_HIT) {
        const t = Math.min(1, (share - BIG_HIT) / (1 - BIG_HIT));
        dilate(0.3 + 0.5 * t);
        for (const e of blow) scale.set(e, 1.5 + 0.5 * t);
      }
    }
    for (const e of list2) this.event(e, scale.get(e) ?? 1);
  }
  // Shows one combat event: a floating number or word on whoever it happened to.
  event(e, emphasis = 1) {
    var _a2, _b2;
    if (!this.el.isConnected) {
      return;
    }
    const target = e.side === "hero" ? this.heroEl : (_a2 = this.cards.get(e.slot)) == null ? void 0 : _a2.root;
    const attacker = e.side === "hero" ? (_b2 = this.cards.get(e.slot)) == null ? void 0 : _b2.root : this.heroEl;
    if (!target) {
      return;
    }
    this.syncBars(e);
    this.logEvent(e);
    if (e.burn) {
      this.float(target, "burned", "word fire", 0);
      return;
    }
    if (e.kind === "cast") {
      restartClass(target, e.spell ? "casting" : "lunge");
      if (e.ability) this.float(target, e.ability, "word ability", 0);
      if (e.onSelf) {
        if (e.effect) this.abilityFx(target, e.effect, e.fxScale);
        return;
      }
      this.castSlots.add(e.slot);
      if (e.effect) this.pendingFx.set(e.slot, { effect: e.effect, scale: e.fxScale ?? (e.ability ? 1 : basicFxScale(e.effect)), basic: !e.ability });
      return;
    }
    if (e.reflected) {
      if (e.kind === "miss") this.float(target, "dodge", "word reflect", 0);
      else if (e.kind === "block") this.float(target, "block", "word block reflect", 0);
      else this.float(target, `↩${Math.round((e.amount ?? 0) + (e.ward ?? 0))}`, `dmg ${e.damageType ?? "physical"} reflect`, 0, emphasis);
      return;
    }
    const fx = e.side === "hero" && (e.hitIndex ?? 0) === 0 ? this.pendingFx.get(e.slot) : void 0;
    if (fx && e.kind !== "miss") this.abilityFx(this.heroEl, fx.effect, fx.scale, fx.basic);
    if (e.side === "hero" && (e.hitIndex ?? 0) === 0) this.pendingFx.delete(e.slot);
    if (e.kind === "ailment") {
      const word = AILMENT_WORDS[e.ailment ?? "chill"];
      this.float(target, word[0], `word ${word[1]}`, 0);
      restartClass(target, "struck");
      return;
    }
    const cast = e.side === "hero" && this.castSlots.delete(e.slot);
    if (attacker && (e.hitIndex ?? 0) === 0 && !cast) {
      if (attacker.querySelector(".swing")) restartClass(attacker, "swinging");
      else lunge(attacker);
    }
    if (e.kind === "miss") {
      this.float(target, e.side === "hero" ? "dodge" : "miss", "word", 0);
    } else if (e.kind === "block") {
      this.float(target, "block", "word block", e.hitIndex ?? 0);
    } else {
      const amount = (e.amount ?? 0) + (e.ward ?? 0);
      const crit = e.critLevels ?? 0;
      const text = `${Math.round(amount)}${"!".repeat(Math.min(crit, 5))}`;
      const cls = `dmg ${e.damageType ?? "physical"}${crit ? ` crit crit${Math.min(crit, 3)}` : ""}`;
      this.float(target, text, cls, e.hitIndex ?? 0, emphasis);
      if (e.side === "monster") {
        const delay = hitDelay(e.hitIndex ?? 0);
        if (delay) this.later(() => flash(target), delay);
        else flash(target);
      }
    }
  }
  // Moves the target's bars when this hit's number appears, not when the engine resolved it, so a
  // chain's bar drops hit by hit and a kill shows with the killing number.
  syncBars(e) {
    if (e.kind !== "hit" || e.hpAfter === void 0) {
      return;
    }
    const delay = hitDelay(e.hitIndex ?? 0);
    const hitCard = e.side === "monster" ? this.cards.get(e.slot) : void 0;
    const order = ++this.barSeq;
    const apply = () => {
      if (e.side === "hero") {
        if (this.heroDown || order < this.heroShown) return;
        this.heroShown = order;
        if (e.hpAfter <= 0) this.heroEl.classList.add("down");
        this.heroHp.style.width = `${100 * e.hpAfter}%`;
        if (e.wardAfter !== void 0) this.heroWard.style.width = `${100 * Math.min(1, e.wardAfter)}%`;
        if (this.heroMaxHp) this.heroHpNum.textContent = `${shortNum(Math.max(0, e.hpAfter) * this.heroMaxHp)} / ${shortNum(this.heroMaxHp)}`;
      } else {
        const card = hitCard;
        if (!card || !card.root.isConnected || order < card.shown) return;
        card.shown = order;
        card.bar.style.width = `${100 * e.hpAfter}%`;
        if (card.maxHp) card.hpNum.textContent = e.killed ? "Defeated" : `${shortNum(e.hpAfter * card.maxHp)} / ${shortNum(card.maxHp)}`;
        if (e.killed) {
          card.root.classList.add("dead");
          card.root.classList.remove("front");
        }
      }
    };
    const until = viewTime() + delay + 50;
    if (e.side === "hero") {
      this.heroHoldUntil = Math.max(this.heroHoldUntil, until);
    } else {
      const card = this.cards.get(e.slot);
      if (card) card.holdUntil = Math.max(card.holdUntil, until);
    }
    if (delay) this.later(apply, delay);
    else apply();
  }
  // One line in the battle view's log: who hit whom, for how much.
  logEvent(e) {
    var _a2, _b2;
    if (!this.log.isConnected || (e.hitIndex ?? 0) > 0 && e.kind !== "hit") return;
    const foe = ((_a2 = this.cards.get(e.slot)) == null ? void 0 : _a2.name) ?? "A monster";
    const hero = this.heroName;
    const amount = Math.round((e.amount ?? 0) + (e.ward ?? 0));
    const crit = e.critLevels ? ` (crit${e.critLevels > 1 ? " ×" + e.critLevels : ""})` : "";
    const type = e.damageType && e.damageType !== "physical" ? ` ${e.damageType}` : "";
    let text;
    let cls = e.side;
    if (e.kind === "cast") {
      if (!e.ability) return;
      text = `${foe} uses ${e.ability}`;
      cls = "hero";
    } else if (e.kind === "ailment") text = `${foe}'s ${e.ability ?? "spell"} ${{ burn: "sets", chill: "chills", shock: "shocks", weaken: "weakens", snare: "snares", blind: "blinds", bleed: "cuts", sunder: "sunders", gale: "unbalances" }[e.ailment ?? "chill"]} ${hero}${e.ailment === "burn" ? " alight" : e.ailment === "bleed" ? " open" : ""}`;
    else if (e.burn) text = `${foe} burns${e.killed ? " to death" : ""}`;
    else if (e.reflected) text = e.kind === "miss" ? `${hero} dodges the reflection` : e.kind === "block" ? `${hero} blocks the reflection` : `${foe} reflects ${amount}${type} back at ${hero}`;
    else if (e.kind === "miss") text = e.side === "hero" ? `${hero} dodges ${foe}` : `${hero} misses ${foe}`;
    else if (e.kind === "block") text = e.side === "hero" ? `${hero} blocks ${foe}` : `${foe} blocks ${hero}`;
    else text = e.side === "hero" ? `${foe} hits ${hero} for ${amount}${type}${crit}` : `${hero} hits ${foe} for ${amount}${type}${crit}${e.killed ? ", defeating it" : ""}`;
    if (e.killed) cls += " kill";
    this.log.appendChild(h("li", { class: cls }, text));
    while (this.log.childElementCount > MAX_LOG) (_b2 = this.log.firstElementChild) == null ? void 0 : _b2.remove();
  }
  float(target, text, cls, hitIndex, emphasis = 1) {
    var _a2;
    while (this.floaters.childElementCount >= MAX_FLOATERS) {
      (_a2 = this.floaters.firstElementChild) == null ? void 0 : _a2.remove();
    }
    const arena = this.el.getBoundingClientRect();
    const box = target.getBoundingClientRect();
    const k = arena.width / (this.el.offsetWidth || arena.width) || 1;
    const spread = (hitIndex % 2 ? 1 : -1) * Math.ceil(hitIndex / 2) * 16;
    const dir = target === this.heroEl ? floatDir(text, cls) : null;
    const [ox, oy] = dir ? FLOAT_DIRS[dir].start : [0, 0];
    const x = (box.left - arena.left + box.width / 2) / k + spread + ox + (Math.random() - 0.5) * (dir && dir !== "up" ? 14 : 30);
    const low = cls.includes("ability") ? 8 : 0;
    const y = (box.top - arena.top) / k + Number(target.dataset.head ?? 0) + 4 + oy + low + (Math.random() - 0.5) * 16;
    const big = emphasis > 1 ? `;scale:${emphasis.toFixed(2)};z-index:1` : "";
    const fly = dir ? `;--fx:${FLOAT_DIRS[dir].end[0]}px;--fy:${FLOAT_DIRS[dir].end[1]}px` : "";
    const el = h("div", { class: "floater " + cls + (dir ? " fly" : ""), style: `left:${x}px;top:${y}px;animation-delay:${hitDelay(hitIndex)}ms${big}${fly}` }, text);
    el.addEventListener("animationend", () => el.remove());
    window.setTimeout(() => el.remove(), 5 * (1200 + hitDelay(hitIndex)) + 300);
    this.floaters.appendChild(el);
  }
}
const FLOAT_DIRS = {
  up: { start: [0, -6], end: [0, -38] },
  left: { start: [-26, 6], end: [-36, -8] },
  right: { start: [26, 6], end: [36, -8] },
  // Starts at the body, below the face.
  downRight: { start: [24, 54], end: [30, 26] }
};
function floatDir(text, cls) {
  if (cls.includes("reflect") && cls.includes("dmg")) return "downRight";
  if (text === "dodge") return "left";
  if (cls.includes("block")) return "right";
  if (cls.includes("dmg")) return "up";
  return null;
}
function svgEl(markup) {
  const t = document.createElement("template");
  t.innerHTML = markup;
  return t.content.firstElementChild;
}
let combatSpeed = 1;
function setCombatSpeed(speed2) {
  combatSpeed = speed2;
}
const BIG_HIT = 0.25;
const MAX_SETTLE_MS = 3e3;
const DILATION_HOLD_MS = 900;
const DILATION_EASE_MS = 600;
let dilationSlow = 0;
let dilationAt = -Infinity;
function currentSlow(now) {
  const t = now - dilationAt - DILATION_HOLD_MS;
  return t <= 0 ? dilationSlow : dilationSlow * Math.max(0, 1 - t / DILATION_EASE_MS);
}
let viewClock = 0;
let viewLast = performance.now();
function viewTime(now = performance.now()) {
  if (now > viewLast) {
    viewClock += (now - viewLast) * timeScale(now);
    viewLast = now;
  }
  return viewClock;
}
function endDilation() {
  viewTime();
  dilationSlow = 0;
  dilationAt = -Infinity;
}
function dilate(slow) {
  const now = performance.now();
  viewTime(now);
  if (slow < currentSlow(now)) return;
  dilationSlow = slow;
  dilationAt = now;
}
function timeScale(now = performance.now()) {
  return 1 - currentSlow(now);
}
const GROUND_OFFSET = 17;
const MAX_COLUMN = 4;
const COLUMNS = [[38], [24, 60], [14, 42, 70], [10, 32, 54, 76]];
const LEAD_COLUMNS = [[26], [16, 36], [10, 26, 42], [8, 22, 36, 50]];
const MINION_COLUMNS = [[72], [60, 82], [54, 70, 86], [52, 64, 76, 88]];
const FLY_LIFT = 0.45;
const FLY_REF = 96;
const BOSS_GROUND_MAX = 68;
function enter(el, delay, duration, speed2 = combatSpeed) {
  const d = delay * 1e3 / speed2, t = duration * 1e3 / speed2;
  el.style.animationDelay = `${d}ms`;
  el.style.animationDuration = `${t}ms`;
  restartClass(el, "entering", 5 * (d + t) + 50, () => {
    el.style.animationDelay = "";
    el.style.animationDuration = "";
  });
}
const ANIMS = { ...FX_ANIMS, casting: ["cast"], swinging: ["swing"], lunge: ["lunge-left", "lunge-right"], struck: ["struck", "struck-sprite"], entering: ["enter-left", "enter-right", "fade-in"] };
function restartClass(el, cls, ms = 1e3, done) {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
  const token = String(Math.random());
  el.dataset[cls] = token;
  const finish = () => {
    if (el.dataset[cls] !== token) return;
    delete el.dataset[cls];
    el.classList.remove(cls);
    el.removeEventListener("animationend", onEnd);
    done == null ? void 0 : done();
  };
  const onEnd = (e) => {
    var _a2;
    if ((_a2 = ANIMS[cls]) == null ? void 0 : _a2.includes(e.animationName)) finish();
  };
  el.addEventListener("animationend", onEnd);
  window.setTimeout(finish, ms);
}
const rowCache = /* @__PURE__ */ new Map();
function opaqueRows(img) {
  const hit = rowCache.get(img.src);
  if (hit) return hit;
  const w = img.naturalWidth, hgt = img.naturalHeight;
  if (!w || !hgt) return { top: 0, bottom: 1 };
  let out = { top: 0, bottom: 1 };
  try {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = hgt;
    const g = c.getContext("2d");
    g.drawImage(img, 0, 0);
    const data = g.getImageData(0, 0, w, hgt).data;
    let top = -1, bottom = -1;
    for (let y = 0; y < hgt; y++) {
      for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] > 40) {
          if (top < 0) top = y;
          bottom = y;
          break;
        }
      }
    }
    if (top >= 0) out = { top: top / hgt, bottom: (bottom + 1) / hgt };
  } catch {
  }
  rowCache.set(img.src, out);
  return out;
}
function lunge(el) {
  restartClass(el, "lunge");
}
function flash(el) {
  restartClass(el, "struck");
}
const ARENA_H$1 = 210;
const STORE = "guildwright-preview";
const LOOKS = ["female", "male"];
const WEAPON_ORDER = ["sword", "axe", "greatsword"];
function questEntries(questKey) {
  var _a2;
  const quest = quests[questKey];
  const out = quest.encounters.map((e, i) => ({ label: `${i + 1} · ${e.tier}`, keys: e.monsters, boss: false, featured: e.tier === "R" }));
  if (quest.boss) out.push({ label: "Ambition boss", keys: [quest.boss.monster], boss: true, featured: true });
  const rite = (_a2 = quest.modifiers.find((m) => m.rite)) == null ? void 0 : _a2.rite;
  if (rite) out.push({ label: "Rite boss", keys: [rite.boss], boss: true, featured: true });
  return out;
}
function lookName(classKey, look) {
  const names = classes[classKey].names;
  return names.find((n) => heroLook({ name: n }) === look) ?? names[0];
}
function loadPrefs() {
  const base = { tab: "encounters", quest: questOrder[0], index: 0, cls: "warrior", look: "female", size: "battle", doubled: false, weapon: "", attacker: -1, anim: "auto", effect: "auto", number: "normal", loop: false };
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) ?? "null");
    if (saved && typeof saved === "object") Object.assign(base, saved);
  } catch {
  }
  if (!quests[base.quest]) base.quest = questOrder[0];
  if (!classes[base.cls]) base.cls = "warrior";
  return base;
}
function savePrefs(p) {
  try {
    localStorage.setItem(STORE, JSON.stringify(p));
  } catch {
  }
}
let open = null;
function previewOpen() {
  return !!open;
}
function closePreview() {
  open == null ? void 0 : open.close();
}
function openPreview(parent) {
  if (open) return;
  const prefs = loadPrefs();
  const view = new CombatView();
  const stage = h("div", { class: "pv-stage" }, view.el);
  const caption = h("div", { class: "pv-caption" });
  const classesEl = h("div", { class: "pv-classes" });
  const select = (options, value, onchange) => {
    const el2 = h("select", { onchange: () => onchange(el2.value) }, ...options.map(([v, label]) => h("option", { value: v }, label)));
    el2.value = value;
    return el2;
  };
  const questSel = select(questOrder.map((k) => [k, quests[k].name]), prefs.quest, (v) => {
    prefs.quest = v;
    prefs.index = 0;
    draw(true);
  });
  const encSel = h("select", { onchange: () => {
    prefs.index = Number(encSel.value);
    draw(true);
  } });
  const step = (d) => {
    const n = questEntries(prefs.quest).length;
    prefs.index = (prefs.index + d + n) % n;
    draw(true);
  };
  const doubled = h("input", { type: "checkbox", onchange: () => {
    prefs.doubled = doubled.checked;
    draw(true);
  } });
  doubled.checked = prefs.doubled;
  const weaponSel = h("select", { title: "Weapon (weapon-swap test sprites)", onchange: () => {
    prefs.weapon = weaponSel.value;
    draw(false);
  } });
  const sideSel = h("select", { title: "Who attacks", onchange: () => {
    prefs.attacker = Number(sideSel.value);
    prefs.anim = "auto";
    syncAttack();
  } });
  const animSel = h("select", { title: "Attack animation or monster ability", onchange: () => {
    prefs.anim = animSel.value;
    savePrefs(prefs);
  } });
  const effectSel = select(HIT_EFFECTS.map((e) => [e.key, e.label]), prefs.effect, (v) => {
    prefs.effect = v;
    savePrefs(prefs);
  });
  const numberSel = select([["normal", "Damage number"], ["crit", "Crit number"], ["none", "No number"]], prefs.number, (v) => {
    prefs.number = v;
    savePrefs(prefs);
  });
  const loop = h("input", { type: "checkbox", onchange: () => {
    prefs.loop = loop.checked;
    savePrefs(prefs);
    restartLoop();
  } });
  loop.checked = prefs.loop;
  const attackNote = h("span", { class: "muted small" });
  const attack = () => {
    const played = view.previewAttack({ slot: prefs.attacker, anim: prefs.anim, effect: prefs.effect, number: prefs.number });
    attackNote.textContent = `Played: ${played}`;
  };
  let loopTimer = 0;
  const restartLoop = () => {
    window.clearInterval(loopTimer);
    if (prefs.loop && prefs.tab === "encounters") loopTimer = window.setInterval(attack, 1400);
  };
  const kitMonsters = Object.values(monsters).filter((m) => monsterKit(m.key)).map((m) => {
    for (const q of questOrder) {
      const i = questEntries(q).findIndex((e) => e.keys.includes(m.key));
      if (i >= 0) return { key: m.key, name: m.name, quest: q, index: i, hand: !!m.abilities };
    }
    return null;
  }).filter((x) => !!x).sort((x, y) => Number(y.hand) - Number(x.hand) || x.name.localeCompare(y.name));
  const jumpSel = h(
    "select",
    { title: "Jump to a monster with abilities", onchange: () => {
      const m = kitMonsters.find((k) => k.key === jumpSel.value);
      jumpSel.value = "";
      if (!m) return;
      prefs.quest = m.quest;
      questSel.value = m.quest;
      prefs.index = m.index;
      currentKeys = [];
      pendingAttacker = m.key;
      draw(true);
    } },
    h("option", { value: "" }, "Jump to monster with abilities…"),
    ...kitMonsters.map((m) => h("option", { value: m.key }, `${m.name}${m.hand ? " ★" : ""}`))
  );
  let currentKeys = [];
  let pendingAttacker = null;
  const syncAttack = () => {
    if (pendingAttacker) {
      const slot = currentKeys.indexOf(pendingAttacker);
      if (slot >= 0) {
        prefs.attacker = slot;
        prefs.anim = "auto";
      }
      pendingAttacker = null;
    }
    if (prefs.attacker >= currentKeys.length) prefs.attacker = -1;
    sideSel.replaceChildren(h("option", { value: "-1" }, "Hero attacks"), ...currentKeys.map((k, i) => {
      var _a2;
      return h("option", { value: String(i) }, `${((_a2 = monsters[k]) == null ? void 0 : _a2.name) ?? k} attacks${monsterKit(k) ? " (abilities)" : ""}`);
    }));
    sideSel.value = String(prefs.attacker);
    const side = prefs.attacker < 0 ? "hero" : "monster";
    const attacker = side === "hero" ? view.el.querySelector(".hero") : view.el.querySelector(".monster");
    const kit = side === "monster" ? monsterKit(currentKeys[prefs.attacker]) : null;
    const kitOptions = (kit ?? []).map((k, i) => h("option", { value: `ability:${i}` }, `${k.basic ? "Basic" : "Ability"}: ${k.name}${k.basic ? "" : ` (every ${k.every} turns)`}`));
    animSel.replaceChildren(...kitOptions, ...ATTACK_ANIMS.map((a) => {
      const ok = !!attacker && a.available(attacker, side);
      return h("option", { value: a.key, disabled: !ok }, ok ? a.label : `${a.label} (not drawn)`);
    }));
    const valid = [...animSel.options].some((o) => o.value === prefs.anim && !o.disabled);
    if (!valid) prefs.anim = kit ? "ability:0" : "auto";
    animSel.value = prefs.anim;
    weaponSel.disabled = side !== "hero";
    savePrefs(prefs);
  };
  const attackTools = h(
    "div",
    { class: "pv-tools" },
    h("strong", { class: "small" }, "Attack test"),
    jumpSel,
    sideSel,
    weaponSel,
    animSel,
    effectSel,
    numberSel,
    h("button", { class: "btn", title: "Play one attack (A)", onclick: () => attack() }, "Play attack"),
    h("label", { class: "pv-check", title: "Repeat the attack every 1.2 seconds" }, loop, "Loop"),
    attackNote
  );
  const encTools = h(
    "div",
    { class: "pv-tools" },
    questSel,
    h("button", { class: "btn", title: "Previous encounter (←)", onclick: () => step(-1) }, "‹"),
    encSel,
    h("button", { class: "btn", title: "Next encounter (→)", onclick: () => step(1) }, "›"),
    select(Object.values(classes).map((c) => [c.key, c.name]), prefs.cls, (v) => {
      prefs.cls = v;
      draw(false);
    }),
    select(LOOKS.map((l) => [l, l === "female" ? "Female" : "Male"]), prefs.look, (v) => {
      prefs.look = v;
      draw(false);
    }),
    select([["battle", "Battle view"], ["panel", "Run panel"]], prefs.size, (v) => {
      prefs.size = v;
      draw(false);
    }),
    h("label", { class: "pv-check", title: "As under a modifier that doubles every monster" }, doubled, "Doubled"),
    h("button", { class: "btn", title: "Replay the entrance (R)", onclick: () => draw(true) }, "Replay")
  );
  const encPane = h("div", { class: "pv-pane" }, encTools, attackTools, caption, stage);
  const classPane = h("div", { class: "pv-pane pv-scroll" }, classesEl);
  const tabBtn = (tab, label) => h("button", { class: "btn", onclick: () => {
    prefs.tab = tab;
    draw(tab === "encounters");
  } }, label);
  const tabs = [tabBtn("encounters", "Encounters"), tabBtn("classes", "Classes")];
  const el = h(
    "section",
    { class: "artpreview", "aria-label": "Art preview" },
    h(
      "header",
      { class: "pv-head" },
      h("strong", null, "Art preview"),
      h("div", { class: "pv-tabs" }, ...tabs),
      h("button", { class: "btn", title: "Close (Esc)", onclick: () => closePreview() }, "Close")
    ),
    encPane,
    classPane
  );
  const place = () => {
    const w = stage.clientWidth, hgt = stage.clientHeight;
    if (!w || !hgt) return;
    const big = prefs.size === "battle";
    const k = big ? Math.max(1, Math.min(3, Math.floor((hgt - 16) / ARENA_H$1), Math.floor(w / 300))) : 1;
    const baseW = big ? Math.min(600, Math.floor((w - 24) / k)) : Math.min(360, w - 24);
    view.el.classList.toggle("big", big);
    stage.classList.toggle("big", big);
    Object.assign(view.el.style, { left: `${Math.round((w - baseW * k) / 2)}px`, top: `${Math.max(0, Math.round((hgt - ARENA_H$1 * k) / 2))}px`, width: `${baseW}px`, transform: `scale(${k})` });
    stage.style.setProperty("--k", String(k));
  };
  const drawClasses = () => {
    classesEl.replaceChildren(...Object.values(classes).map((c) => h(
      "div",
      { class: "pv-class" },
      h("h3", null, c.name),
      h("div", { class: "pv-looks" }, ...LOOKS.map((look) => {
        const hero = { name: lookName(c.key, look), classKey: c.key };
        const portrait = portraitUrl(hero), sprite = heroSpriteUrl(hero), swing = heroAttackUrl(hero);
        const weapons = Object.entries(heroWeaponSprites(hero)).sort(([a], [b]) => WEAPON_ORDER.indexOf(a) - WEAPON_ORDER.indexOf(b));
        return h(
          "div",
          { class: "pv-look" },
          h("div", { class: "pv-label" }, `${look === "female" ? "Female" : "Male"} · ${hero.name}`),
          h(
            "div",
            { class: "pv-art" },
            portrait ? h("img", { class: "pv-portrait", src: portrait, alt: `${c.name} ${look} portrait` }) : h("div", { class: "pv-missing" }, "No portrait"),
            sprite ? h("div", { class: "pv-sprite" }, h("img", { src: sprite, alt: `${c.name} ${look} battle sprite` })) : h("div", { class: "pv-missing" }, "No battle sprite")
          ),
          swing || weapons.length ? h("div", { class: "pv-label" }, "Animation tests") : null,
          swing || weapons.length ? h(
            "div",
            { class: "pv-art" },
            swing ? h("div", { class: "pv-sprite pv-anim", title: "Attack swing, looping" }, h("div", { class: "pv-swing", style: `background-image:url(${swing})` })) : null,
            ...weapons.map(([w, url]) => h("div", { class: "pv-sprite", title: `Weapon-swap test: ${w}` }, h("img", { src: url, alt: `${c.name} ${look} with ${w}` })))
          ) : null,
          swing || weapons.length ? h("div", { class: "muted small" }, [swing ? "Swing" : "", ...weapons.map(([w]) => w[0].toUpperCase() + w.slice(1))].filter(Boolean).join(" · ")) : null
        );
      }))
    )));
  };
  function draw(entrance) {
    savePrefs(prefs);
    tabs.forEach((b, i) => b.classList.toggle("on", i === 0 === (prefs.tab === "encounters")));
    encPane.hidden = prefs.tab !== "encounters";
    classPane.hidden = prefs.tab !== "classes";
    if (prefs.tab === "classes") {
      restartLoop();
      if (!classesEl.childElementCount) drawClasses();
      return;
    }
    const entries = questEntries(prefs.quest);
    prefs.index = Math.min(prefs.index, entries.length - 1);
    encSel.replaceChildren(...entries.map((e, i) => h("option", { value: String(i) }, e.label)));
    encSel.value = String(prefs.index);
    const entry = entries[prefs.index];
    const keys = prefs.doubled && !entry.boss ? entry.keys.flatMap((k) => [k, k]) : entry.keys;
    caption.textContent = `${quests[prefs.quest].name} · ${entry.label} · ${keys.map((k) => {
      var _a2;
      return ((_a2 = monsters[k]) == null ? void 0 : _a2.name) ?? k;
    }).join(", ")}`;
    const hero = { name: lookName(prefs.cls, prefs.look), classKey: prefs.cls };
    const weapons = heroWeaponSprites(hero);
    if (!weapons[prefs.weapon]) prefs.weapon = "";
    weaponSel.replaceChildren(h("option", { value: "" }, "Standard weapon"), ...WEAPON_ORDER.map((w) => {
      const name = w[0].toUpperCase() + w.slice(1);
      return h("option", { value: w, disabled: !weapons[w] }, weapons[w] ? name : `${name} (not drawn)`);
    }));
    weaponSel.value = prefs.weapon;
    attackNote.textContent = "";
    place();
    view.preview(prefs.quest, keys, entry.boss, entry.featured, hero, entrance, weapons[prefs.weapon]);
    currentKeys = keys;
    syncAttack();
    restartLoop();
  }
  const onKey = (e) => {
    if (prefs.tab !== "encounters" || e.target.tagName === "SELECT") return;
    if (e.key === "ArrowLeft") {
      step(-1);
      e.preventDefault();
    } else if (e.key === "ArrowRight") {
      step(1);
      e.preventDefault();
    } else if (e.key === "r" || e.key === "R") draw(true);
    else if (e.key === "a" || e.key === "A") attack();
  };
  const onResize = () => place();
  document.addEventListener("keydown", onKey);
  window.addEventListener("resize", onResize);
  parent.appendChild(el);
  open = { el, close: () => {
    window.clearInterval(loopTimer);
    document.removeEventListener("keydown", onKey);
    window.removeEventListener("resize", onResize);
    el.remove();
    open = null;
  } };
  draw(true);
}
const SAVE_KEY = "guild-crafting-mockup-save";
function saveGame(state2) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state2));
  } catch (error) {
    console.warn("Could not save game", error);
  }
}
function exportSave(state2) {
  const bytes = new TextEncoder().encode(JSON.stringify(state2));
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}
function importSave(text) {
  const trimmed = text.trim();
  if (!trimmed) return "No save text to import.";
  let json = trimmed;
  if (!trimmed.startsWith("{")) {
    try {
      const bin = atob(trimmed.replace(/\s+/g, ""));
      json = new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
    } catch {
      return "That isn't save text.";
    }
  }
  try {
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== "object" || typeof parsed.version !== "number" || !Array.isArray(parsed.adventurers)) return "That isn't a Guildwright save.";
    if (parsed.version > SAVE_VERSION) return "That save is from a newer version.";
    localStorage.setItem(SAVE_KEY, JSON.stringify(parsed));
    return null;
  } catch {
    return "That isn't a Guildwright save.";
  }
}
function loadGame() {
  var _a2, _b2, _c2, _d, _e;
  invalidateStats();
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.version === 1) {
        parsed.guild = { ...parsed.guild, maxBaseMaterials: 2, maxAccessoryBaseMaterials: 1 };
        parsed.version = 2;
      }
      if (parsed.version === 2) {
        parsed.fame = 0;
        parsed.milestones = [];
        parsed.trophies = {};
        parsed.trophySlots = [];
        parsed.version = 3;
        const state2 = fitToQuests({ ...createNewGame(), ...parsed });
        checkProgress(state2);
        return state2;
      }
      if (parsed.version === 3) {
        const g = parsed.guild;
        const keep = (track, extra) => slotUnlocks.filter((u) => u.track === track).slice(0, Math.max(0, extra)).map((u) => u.key);
        parsed.unlocks = [
          ...keep("baseSlot", g.maxBaseMaterials - startingGuild.maxBaseMaterials),
          ...keep("accessorySlot", g.maxAccessoryBaseMaterials - startingGuild.maxAccessoryBaseMaterials),
          ...keep("decorationSlot", g.maxDecorations - startingGuild.maxDecorations),
          ...keep("accessoryDecorationSlot", g.maxDecorations - startingGuild.maxAccessoryDecorations),
          ...keep("memberSlot", g.memberSlots - startingGuild.memberSlots),
          ...keep("trophySlot", (g.trophySlots ?? 0) - 1)
        ];
        parsed.expansion = 0;
        parsed.version = 4;
      }
      if (parsed.version === 4) {
        const rename = (keys) => keys == null ? void 0 : keys.map((k) => k === "overwhelming" ? "juggernaut" : k);
        for (const a of parsed.adventurers) {
          if (a.questModifiers) {
            a.questModifiers = Object.fromEntries(Object.entries(a.questModifiers).map(([q, keys]) => [q, rename(keys)]));
          }
          if ((_a2 = a.run) == null ? void 0 : _a2.modifiers) a.run.modifiers = rename(a.run.modifiers);
        }
        parsed.version = 5;
      }
      if (parsed.version === 5) {
        const fix = (o) => {
          if (o && o.classKey === "wizard") o.classKey = "priest";
        };
        parsed.adventurers.forEach(fix);
        (_b2 = parsed.applicants) == null ? void 0 : _b2.forEach(fix);
        (_c2 = parsed.legends) == null ? void 0 : _c2.forEach(fix);
        if (((_d = parsed.trophies) == null ? void 0 : _d["class-wizard"]) !== void 0) {
          parsed.trophies["class-priest"] = parsed.trophies["class-wizard"];
          delete parsed.trophies["class-wizard"];
        }
        parsed.trophySlots = (_e = parsed.trophySlots) == null ? void 0 : _e.map((k) => k === "class-wizard" ? "class-priest" : k);
        parsed.version = 6;
      }
      if (parsed.version === 6) {
        const bought = new Set(parsed.unlocks ?? []);
        parsed.fame += slotUnlocks.filter((u) => bought.has(u.key)).reduce((sum, u) => sum + unlockFame(u), 0);
        parsed.fame += applicantSlotFame(APPLICANT_SLOTS[0], applicantSlots(parsed));
        parsed.version = 7;
      }
      if (parsed.version === 7) {
        parsed.benchOwned = true;
        parsed.guide = { firstRunDone: true, bought: true, equipped: true, crafted: true };
        parsed.version = 8;
      }
      if (parsed.version === SAVE_VERSION) {
        return fitToQuests({ ...createNewGame(), ...parsed });
      }
      console.warn("Discarding save from an older version");
    }
  } catch (error) {
    console.warn("Could not load save", error);
  }
  return createNewGame();
}
function fitToQuests(state2) {
  var _a2;
  if (state2.adventurers.length) delete state2.starters;
  for (const [key, progress] of Object.entries(state2.questProgress)) {
    const quest = quests[key];
    if (!quest) continue;
    const last2 = quest.encounters.length - 1;
    progress.bestEncounter = Math.min(progress.bestEncounter, last2);
    progress.seen = progress.seen.filter((i) => i <= last2);
  }
  for (const item of state2.craftedItems) {
    const cap = maxDecorationPower(item.itemType, item.base);
    const removed = item.decorations.filter((k) => requireMaterial(k).power > cap);
    if (!removed.length) continue;
    item.decorations = item.decorations.filter((k) => requireMaterial(k).power <= cap);
    for (const k of removed) state2.materials[k] = (state2.materials[k] ?? 0) + 1;
    (state2.notices ?? (state2.notices = [])).push(`${item.name}: ${removed.map((k) => requireMaterial(k).name).join(", ")} returned to your materials (too strong a decoration for its bases)`);
  }
  if ((_a2 = state2.notices) == null ? void 0 : _a2.length) invalidateStats();
  for (const adventurer of state2.adventurers) {
    giveAmbitions(state2, adventurer);
    const a = adventurer.activity;
    if (a.kind === "fighting" && a.encounterIndex > quests[a.questKey].encounters.length - 1) {
      adventurer.activity = { kind: "resting", questKey: a.questKey, remaining: 1, defeated: false };
    }
    if (adventurer.run) {
      const last2 = quests[adventurer.run.questKey].encounters.length - 1;
      adventurer.run.cleared = Math.min(adventurer.run.cleared, last2);
      adventurer.run.stopAt = Math.min(adventurer.run.stopAt, last2);
      if (adventurer.run.defeatedAt !== void 0 && adventurer.run.defeatedAt > last2) delete adventurer.run.defeatedAt;
    }
  }
  return state2;
}
function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (error) {
    console.warn("Could not clear save", error);
  }
}
function referenceMonster(level) {
  const power = powerForLevel(level);
  return {
    damage: monsterBaseline.damage * power,
    damageTypes: { physical: 0.7, fire: 0.1, cold: 0.1, lightning: 0.1 },
    attacksPerSecond: 1,
    armor: monsterBaseline.armor * power,
    accuracy: monsterBaseline.accuracy * Math.pow(power, ACCURACY_GROWTH),
    evasion: monsterBaseline.evasion * Math.pow(power, EVASION_GROWTH)
  };
}
function sumDamage(map2) {
  return (map2.physical ?? 0) + elements.reduce((s, e) => s + (map2[e] ?? 0), 0);
}
function gearPower(stats, level) {
  const m = referenceMonster(level);
  const avgRoll = (stats.rollMin + stats.rollMax) / 2;
  const perHit = (damage) => Math.max(1, sumDamage(mitigateByType(damage, m.armor, {})));
  const hits = expectedHits(stats.accuracy, m.evasion);
  const crit = expectedCritMultiplier(stats.critChance, stats.critBonus);
  const strikeDps = stats.strikes ? stats.strikes.reduce((s, st) => s + perHit(st.damage), 0) / stats.strikes.reduce((s, st) => s + 1 / st.attacksPerSecond, 0) : perHit(stats.damage) * stats.attacksPerSecond;
  const dps = strikeDps * hits * crit * avgRoll;
  const hit = {};
  for (const [type, share] of Object.entries(m.damageTypes)) hit[type] = m.damage * share;
  const landed = expectedHits(m.accuracy, stats.evasion) * (1 - stats.blockChance);
  const taken = Math.max(0.01, sumDamage(mitigateByType(hit, stats.armor, stats.resist)) * landed);
  const g = stats.gear;
  const dodgeWard = (g.wardOnDodge ?? 0) + (g.wardOnDodgePercent ?? 0) * stats.maxWard;
  const blockWard = (g.wardOnBlock ?? 0) + (g.wardOnBlockPercent ?? 0) * stats.maxWard;
  const wardBack = m.attacksPerSecond * ((1 - hitChance(m.accuracy, stats.evasion)) * dodgeWard + expectedHits(m.accuracy, stats.evasion) * stats.blockChance * blockWard);
  const pool = stats.maxHealth + stats.maxWard;
  const hitsPerSecond = hits * (stats.strikes ? stats.strikes.length / stats.strikes.reduce((s, st) => s + 1 / st.attacksPerSecond, 0) : stats.attacksPerSecond);
  const recovery = stats.lifeRegen + (stats.maxWard > 0 ? wardBack : 0) + stats.lifeLeech * dps + stats.lifeOnHit * hitsPerSecond;
  const toughness = survivalSeconds(pool, taken * m.attacksPerSecond, recovery);
  return { dps, toughness };
}
const ENRAGE_GROWTH = 0.1;
const ENRAGE_STEP = 10;
const ENRAGE_RATE = Math.log(1 + ENRAGE_GROWTH) / ENRAGE_STEP;
function survivalSeconds(pool, incoming, recovery) {
  const k = ENRAGE_RATE;
  const lost = (t) => incoming * Math.expm1(k * t) / k - recovery * t;
  let hi = 1;
  while (lost(hi) < pool && hi < 1e6) hi *= 2;
  let lo = 0;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (lost(mid) < pool) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}
const PREVIEW_ID = "__preview";
function withGear(adventurer, slot, ref, twoHanded) {
  const equipment = { ...adventurer.equipment };
  if ((ref == null ? void 0 : ref.kind) === "crafted") {
    for (const k of Object.keys(equipment)) {
      const r = equipment[k];
      if ((r == null ? void 0 : r.kind) === "crafted" && r.id === ref.id) delete equipment[k];
    }
  }
  if (ref) equipment[slot] = ref;
  else delete equipment[slot];
  if (slot === "mainHand" && twoHanded) delete equipment.offHand;
  return { ...adventurer, equipment };
}
const shownStats = ["str", "dex", "int", "maxHealth", "damagePerHit", "attacksPerSecond", "accuracy", "armor", "evasion", "blockChance", "critChance", "critBonus", "maxWard", "lifeRegen", "lifeLeech", "lifeOnHit"];
function compareGear(state2, adventurer, slot, ref) {
  var _a2;
  let previewState = state2;
  let itemRef;
  if (ref && "itemType" in ref) {
    previewState = { ...state2, craftedItems: [...state2.craftedItems, { ...ref, id: PREVIEW_ID }] };
    itemRef = { kind: "crafted", id: PREVIEW_ID };
  } else {
    itemRef = ref;
  }
  const resolved = itemRef ? resolveItemRef(previewState, itemRef) : void 0;
  const twoHanded = !!resolved && !!itemTypes[resolved.itemType].twoHanded;
  const before = getAdventurerStats(state2, adventurer);
  const after = getAdventurerStats(previewState, withGear(adventurer, slot, itemRef, twoHanded));
  const pb = gearPower(before, adventurer.level), pa = gearPower(after, adventurer.level);
  const current = adventurer.equipment[slot];
  const changes = [];
  for (const key of shownStats) {
    const b = before[key], a = after[key];
    if (Math.abs(a - b) > 1e-9) changes.push({ key, before: b, after: a });
  }
  for (const e of elements) {
    if (Math.abs(after.resist[e] - before.resist[e]) > 1e-9) changes.push({ key: e + "Resist", before: before.resist[e], after: after.resist[e] });
  }
  const gear = [];
  for (const stat of statOrder) {
    const b = before.gear[stat] ?? 0, a = after.gear[stat] ?? 0;
    if (Math.abs(a - b) > 1e-9) gear.push({ stat, before: b, after: a });
  }
  return {
    slot,
    replacing: current ? (_a2 = resolveItemRef(state2, current)) == null ? void 0 : _a2.name : void 0,
    dps: { before: pb.dps, after: pa.dps },
    toughness: { before: pb.toughness, after: pa.toughness },
    changes,
    gear
  };
}
function comparisonSlots(state2, adventurer, slots) {
  const usable = slots.filter((s) => !(s === "offHand" && isTwoHanded$1(state2, adventurer)));
  const open2 = usable.filter((s) => !adventurer.equipment[s]);
  const shown = open2.length ? [open2[0]] : usable;
  if (usable.includes("mainHand") && !shown.includes("mainHand")) shown.unshift("mainHand");
  return shown;
}
function isTwoHanded$1(state2, adventurer) {
  const r = adventurer.equipment.mainHand;
  const item = r ? resolveItemRef(state2, r) : void 0;
  return !!item && !!itemTypes[item.itemType].twoHanded;
}
const RECIPE_VERSION = 1;
function exportBuild(state2, hero) {
  var _a2, _b2, _c2;
  const slots = {};
  for (const slot of slotOrder) {
    const ref = hero.equipment[slot];
    if (!ref) continue;
    if (ref.kind === "crafted") {
      const item = state2.craftedItems.find((i) => i.id === ref.id);
      if (item) slots[slot] = { itemType: item.itemType, base: [...item.base], decorations: [...item.decorations], name: item.name };
    } else {
      slots[slot] = { material: ref.key, name: requireMaterial(ref.key).name };
    }
  }
  const stats = getAdventurerStats(state2, hero);
  const power = gearPower(stats, hero.level);
  const questKey = ((_a2 = hero.assignment) == null ? void 0 : _a2.questKey) ?? ((_b2 = hero.run) == null ? void 0 : _b2.questKey);
  const quest = questKey ? quests[questKey] : void 0;
  const progress = quest ? getQuestProgress(state2, quest.key) : void 0;
  const g = state2.guild;
  const r = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
  return {
    version: RECIPE_VERSION,
    name: `${classes[hero.classKey].name} level ${hero.level}${quest ? ` for ${quest.name}` : ""}`,
    notes: "",
    classKey: hero.classKey,
    level: hero.level,
    ...((_c2 = hero.passives) == null ? void 0 : _c2.length) ? { passives: hero.passives } : {},
    ...hero.bonuses && Object.keys(hero.bonuses).length ? { bonuses: hero.bonuses } : {},
    slots,
    guildSlots: { base: g.maxBaseMaterials, decorations: g.maxDecorations, accessoryBase: g.maxAccessoryBaseMaterials, accessoryDecorations: g.maxAccessoryDecorations ?? g.maxDecorations },
    ...quest && progress ? { quest: { key: quest.key, name: quest.name, modifiers: getActiveModifiers(state2, hero, quest), bestEncounter: progress.bestEncounter + 1, fullClears: progress.fullClears } } : {},
    summary: {
      maxHealth: stats.maxHealth,
      maxWard: stats.maxWard,
      str: stats.str,
      dex: stats.dex,
      int: stats.int,
      damagePerHit: r(stats.damagePerHit),
      attacksPerSecond: r(stats.attacksPerSecond),
      accuracy: r(stats.accuracy, 0),
      critChance: r(stats.critChance),
      armor: r(stats.armor, 0),
      evasion: r(stats.evasion, 0),
      blockChance: r(stats.blockChance),
      fireResist: r(stats.resist.fire ?? 0),
      coldResist: r(stats.resist.cold ?? 0),
      lightningResist: r(stats.resist.lightning ?? 0),
      lifeRegen: r(stats.lifeRegen),
      lifeLeech: r(stats.lifeLeech),
      lifeOnHit: r(stats.lifeOnHit),
      dps: r(power.dps, 1),
      toughness: r(power.toughness, 1),
      wield: stats.wieldNote || stats.weaponName
    }
  };
}
const cache = /* @__PURE__ */ new Map();
function cached(state2, hero, slot, ref) {
  const refKey = !ref ? "-" : "itemType" in ref ? `p:${ref.itemType}:${ref.base.join(",")}:${ref.decorations.join(",")}` : ref.kind === "crafted" ? "c:" + ref.id : "m:" + ref.key;
  const key = [hero.id, hero.level, hero.classKey, JSON.stringify(hero.equipment), JSON.stringify(hero.passives ?? []), JSON.stringify(hero.bonuses ?? {}), JSON.stringify(state2.trophySlots ?? []), slot, refKey].join("|");
  let c = cache.get(key);
  if (!c) {
    if (cache.size > 400) cache.clear();
    c = compareGear(state2, hero, slot, ref);
    cache.set(key, c);
  }
  return c;
}
function pctChange(before, after) {
  if (before <= 0) return after > 0 ? Infinity : 0;
  return after / before - 1;
}
function chip(label, before, after) {
  const change = pctChange(before, after);
  const small = Math.abs(change) < 5e-3;
  const text = small ? `±0% ${label}` : change === Infinity ? `+${label}` : `${change > 0 ? "+" : "−"}${num(Math.abs(change) * 100, Math.abs(change) < 0.1 ? 1 : 0)}% ${label}`;
  return h("span", { class: "dchip " + (small ? "same" : change > 0 ? "up" : "down") }, text);
}
function speedRow(c) {
  const aps = c.changes.find((x) => x.key === "attacksPerSecond");
  return aps ? h("div", { class: "row small" }, h("span", { class: "grow" }, "Attacks/s"), h("span", { class: "num" }, `${num(aps.before)} → ${num(aps.after)}`)) : null;
}
function detail(c) {
  return h(
    "div",
    { class: "delta-detail", role: "tooltip" },
    h("div", { class: "row" }, h("span", { class: "grow" }, "DPS"), h("span", { class: "num" }, `${num(c.dps.before, 1)} → ${num(c.dps.after, 1)}`)),
    h("div", { class: "row" }, h("span", { class: "grow" }, "Toughness"), h("span", { class: "num" }, `${num(c.toughness.before, 1)}s → ${num(c.toughness.after, 1)}s`)),
    speedRow(c),
    c.gear.length ? h("div", { class: "dstats" }, ...c.gear.map((g) => h("span", { class: g.after > g.before ? "up" : "down" }, formatStat(g.stat, g.after - g.before)))) : h("div", { class: "muted" }, "No stat changes."),
    h("div", { class: "muted" }, `Against a typical level-matched monster. Toughness is how long the hero lasts against it, counting regeneration, while its damage grows 10% every 10 seconds.${c.replacing ? ` Replaces ${c.replacing}.` : ""}`)
  );
}
function deltaLine(state2, hero, slot, ref, label, action) {
  const c = cached(state2, hero, slot, ref);
  return h(
    "div",
    { class: "delta small", tabindex: "0" },
    label ? h("span", { class: "dlabel" }, label) : null,
    chip("DPS", c.dps.before, c.dps.after),
    chip("toughness", c.toughness.before, c.toughness.after),
    action ?? null,
    detail(c)
  );
}
function deltaLines(state2, hero, slots, ref, action) {
  const shown = comparisonSlots(state2, hero, slots);
  return h("div", { class: "deltas" }, ...shown.map((slot) => deltaLine(
    state2,
    hero,
    slot,
    ref,
    shown.length > 1 || slots.length > 1 ? `${hero.name} · ${slotNames[slot]}${hero.equipment[slot] ? "" : " (empty)"}` : hero.name,
    action == null ? void 0 : action(slot)
  )));
}
function deltaColumn(state2, hero, slots, item, action, links) {
  const statText = (stat, before, after) => {
    const cls = after > before ? "up" : "down";
    if (!links) return h("span", { class: cls }, formatStat(stat, after - before));
    const on = links.active.includes(statFamily(stat));
    return h("button", {
      class: `statlink ${cls}${on ? " match" : ""}`,
      "aria-pressed": on ? "true" : "false",
      title: on ? `Remove the ${familyLabel(statFamily(stat))} filter` : `Filter materials and items by ${familyLabel(statFamily(stat))}`,
      onclick: () => links.toggle(stat)
    }, formatStat(stat, after - before));
  };
  const shown = comparisonSlots(state2, hero, slots);
  return h(
    "div",
    { class: "comparecol" },
    h("h3", null, `Compared with ${hero.name}'s gear`),
    ...shown.map((slot) => {
      const c = cached(state2, hero, slot, item);
      return h(
        "div",
        { class: "comparebox" },
        h("div", { class: "small" }, h("strong", null, slotNames[slot]), h("span", { class: "muted" }, c.replacing ? ` · replacing ${c.replacing}` : " · empty now")),
        h("div", { class: "delta small static" }, chip("DPS", c.dps.before, c.dps.after), chip("toughness", c.toughness.before, c.toughness.after)),
        h("div", { class: "small" }, `DPS ${num(c.dps.before, 1)} → ${num(c.dps.after, 1)} · Toughness ${num(c.toughness.before, 1)}s → ${num(c.toughness.after, 1)}s`),
        speedRow(c),
        c.gear.length ? h("div", { class: "dstats small" }, ...c.gear.map((g) => statText(g.stat, g.before, g.after))) : null,
        (action == null ? void 0 : action(slot)) ?? null
      );
    }),
    h("div", { class: "muted small" }, "Against a typical monster at the hero's level. Toughness is how many seconds the hero lasts against it, counting regeneration, while its damage grows 10% every 10 seconds.")
  );
}
function bestDelta(state2, hero, slots, ref) {
  const shown = comparisonSlots(state2, hero, slots);
  if (!shown.length) return null;
  const score = (c2) => {
    const d = pctChange(c2.dps.before, c2.dps.after), t = pctChange(c2.toughness.before, c2.toughness.after);
    return (Number.isFinite(d) ? d : 10) + (Number.isFinite(t) ? t : 10);
  };
  const ranked = shown.map((slot2) => ({ slot: slot2, c: cached(state2, hero, slot2, ref) })).sort((a, b) => score(b.c) - score(a.c));
  const { slot, c } = ranked[0];
  return { slot, el: h(
    "div",
    { class: "delta small static oneline" },
    shown.length > 1 || slots.length > 1 ? h("span", { class: "dlabel" }, `${slotNames[slot]}${hero.equipment[slot] ? "" : " (empty)"}`) : null,
    chip("DPS", c.dps.before, c.dps.after),
    chip("toughness", c.toughness.before, c.toughness.after),
    shown.length > 1 ? h("span", { class: "dlabel" }, `+${shown.length - 1} more`) : null
  ) };
}
const __vite_glob_0_0$1 = "" + new URL("header-bench-CzfZlsCx.webp", import.meta.url).href;
const __vite_glob_0_1$1 = "" + new URL("header-guild-DHWXxYmp.webp", import.meta.url).href;
const __vite_glob_0_2$1 = "" + new URL("header-hire-Ifcqg9iR.webp", import.meta.url).href;
const __vite_glob_0_3$1 = "" + new URL("header-merchant-CF-p9tbl.webp", import.meta.url).href;
const __vite_glob_0_4$1 = "" + new URL("header-peddler-CpC4F3MR.webp", import.meta.url).href;
const __vite_glob_0_5$1 = "" + new URL("header-salvage-BAzzLS07.webp", import.meta.url).href;
const defaultStatExplorer = () => ({ stat: "lifeOnHit", kinds: ["base", "decoration", "worn"], premium: false, group: "all", minPower: 1, maxPower: 15 });
const kindLabel = { base: "Base", decoration: "Decoration", worn: "Worn" };
function inGroup(type, group) {
  if (group === "all") return true;
  if (group === "accessory") return isAccessory(type);
  const weapon = itemTypes[type].tags.includes("weapon");
  return group === "weapon" ? weapon : !weapon && !isAccessory(type);
}
let dropCache = null;
function dropText(key) {
  if (!dropCache) {
    dropCache = /* @__PURE__ */ new Map();
    for (const q of questOrder.map((k) => quests[k])) {
      for (const tier of ["C", "U", "R", "M"]) {
        for (const e of q.pools[tier]) if (!dropCache.has(e.material)) dropCache.set(e.material, `${q.name.replace(/^The /, "")} · ${tier}`);
      }
      if (q.boss && !dropCache.has(q.boss.legendary)) dropCache.set(q.boss.legendary, `${q.name.replace(/^The /, "")} · boss`);
    }
  }
  const plain = key.replace(/^premium:/, "");
  return (dropCache.get(plain) ?? "—") + (isPremium(key) ? " · premium" : "");
}
function statRows(s) {
  var _a2, _b2;
  const rows = /* @__PURE__ */ new Map();
  const add = (r, type) => {
    const id = [r.key, r.kind, r.value, r.cap ?? ""].join("|");
    const row = rows.get(id);
    if (row) row.types.push(type);
    else rows.set(id, { ...r, types: [type] });
  };
  for (const key of materialOrder) {
    if (!s.premium && isPremium(key)) continue;
    const m = requireMaterial(key);
    if (m.power < s.minPower || m.power > s.maxPower) continue;
    for (const type of itemTypeOrder) {
      if (!inGroup(type, s.group)) continue;
      if (s.kinds.includes("base")) {
        const base = getBaseStats(m, type);
        const entry = base == null ? void 0 : base.stats[s.stat];
        if (entry !== void 0) {
          const [v, cap] = baseEntry(entry);
          const scale = statScale(type, s.stat);
          add({ key, power: m.power, kind: "base", value: itemStatRound(s.stat, v * scale, type), cap: Array.isArray(entry) ? itemStatRound(s.stat, cap * scale, type) : void 0, role: base.role }, type);
        }
      }
      if (s.kinds.includes("decoration")) {
        const v = (_a2 = getDecorationStats(m, type)) == null ? void 0 : _a2[s.stat];
        if (v) add({ key, power: m.power, kind: "decoration", value: itemStatRound(s.stat, v * decorationScale(type, s.stat), type) }, type);
      }
    }
    if (s.kinds.includes("worn") && m.equip && inGroup(m.equip.itemType, s.group)) {
      const v = (_b2 = getMaterialEquipStats(m)) == null ? void 0 : _b2.stats[s.stat];
      if (v) add({ key, power: m.power, kind: "worn", value: v }, m.equip.itemType);
    }
  }
  return [...rows.values()].sort((a, b) => b.value - a.value || b.power - a.power);
}
function countFor(s, stat) {
  return statRows({ ...s, stat }).length;
}
function statExplorerPanel(ctx2, shell2) {
  const { ui: ui2 } = ctx2;
  const s = ui2.statExplorer ?? (ui2.statExplorer = defaultStatExplorer());
  const set = (patch) => {
    Object.assign(s, patch);
    ctx2.refresh();
  };
  const rows = statRows(s);
  const fmt2 = (v) => formatStatValue(s.stat, v);
  const picker = h(
    "select",
    { class: "filteradd", "aria-label": "Stat", onchange: (e) => set({ stat: e.target.value }) },
    ...statOrder.map((k) => {
      const n = countFor(s, k);
      return h("option", { value: k, selected: k === s.stat ? "selected" : void 0 }, `${statDefs[k].label} (${n})`);
    })
  );
  const kindBox = (k) => h(
    "label",
    { class: "toggle small" },
    h("input", { type: "checkbox", checked: s.kinds.includes(k), onchange: (e) => set({ kinds: e.target.checked ? [...s.kinds, k] : s.kinds.filter((x) => x !== k) }) }),
    " " + kindLabel[k]
  );
  const groupSel = h(
    "select",
    { class: "filteradd", "aria-label": "Item types", onchange: (e) => set({ group: e.target.value }) },
    ...["all", "weapon", "armor", "accessory"].map((g) => h("option", { value: g, selected: g === s.group ? "selected" : void 0 }, g === "all" ? "All item types" : g[0].toUpperCase() + g.slice(1) + "s"))
  );
  const powerSel = (field, label) => h(
    "select",
    { class: "filteradd", "aria-label": label, onchange: (e) => set({ [field]: Number(e.target.value) }) },
    ...Array.from({ length: 15 }, (_, i) => i + 1).map((p) => h("option", { value: String(p), selected: p === s[field] ? "selected" : void 0 }, `P${p}`))
  );
  const controls = h(
    "div",
    { class: "sx-controls" },
    h("div", { class: "row" }, picker, groupSel),
    h(
      "div",
      { class: "row small" },
      kindBox("base"),
      kindBox("decoration"),
      kindBox("worn"),
      h("label", { class: "toggle small" }, h("input", { type: "checkbox", checked: s.premium, onchange: (e) => set({ premium: e.target.checked }) }), " Premium"),
      h("span", { class: "muted" }, "Power"),
      powerSel("minPower", "Lowest power"),
      h("span", { class: "muted" }, "to"),
      powerSel("maxPower", "Highest power")
    ),
    h("div", { class: "muted small" }, statDefs[s.stat].description ?? "")
  );
  const powers = Array.from({ length: s.maxPower - s.minPower + 1 }, (_, i) => s.minPower + i);
  const best = (kind, p) => Math.max(0, ...rows.filter((r) => r.kind === kind && r.power === p).map((r) => r.value));
  const curve = h("div", { class: "sx-curvewrap" }, h(
    "table",
    { class: "sx-curve" },
    h("thead", null, h("tr", null, h("th", null, "Best"), ...powers.map((p) => h("th", null, `P${p}`)))),
    h("tbody", null, ...s.kinds.map((kind) => h(
      "tr",
      null,
      h("th", null, kindLabel[kind]),
      ...powers.map((p) => {
        const v = best(kind, p);
        return h("td", { class: v ? "" : "muted" }, v ? fmt2(v) : "·");
      })
    )))
  ));
  const table = rows.length ? h(
    "table",
    { class: "sx-table" },
    h("thead", null, h("tr", null, ...["Amount", "Material", "Item type", "Kind", "Drops"].map((t) => h("th", null, t)))),
    h("tbody", null, ...rows.map((r) => {
      const m = requireMaterial(r.key);
      const types = r.kind === "worn" ? `Worn as ${itemTypes[r.types[0]].name.toLowerCase()}` : r.types.length === itemTypeOrder.filter((t) => inGroup(t, s.group)).length ? "Any" : r.types.map((t) => itemTypes[t].name).join(", ");
      return h(
        "tr",
        { class: "sx-" + r.kind },
        h("td", { class: "num" }, fmt2(r.value), r.cap !== void 0 ? h("span", { class: "muted" }, ` / cap ${fmt2(r.cap)}`) : null),
        h(
          "td",
          null,
          h("span", { class: "power" }, `P${r.power}`),
          " ",
          h("button", {
            class: "matlink" + (isPremium(r.key) ? " premium" : ""),
            title: "Show every use of this material",
            onclick: () => {
              ui2.materialDetail = r.key;
              ctx2.refresh();
            }
          }, materialIcon(r.key), m.name)
        ),
        h("td", { class: "small" }, types),
        h("td", { class: "small" }, kindLabel[r.kind] + (r.role ? ` · ${roleLabel[r.role] ?? r.role}` : "")),
        h("td", { class: "small muted" }, dropText(r.key))
      );
    }))
  ) : h("div", { class: "muted small" }, "No sources with these filters.");
  return shell2(
    "Stat explorer",
    `${rows.length} source${rows.length === 1 ? "" : "s"} of ${statDefs[s.stat].label}, highest first. Bases show value / cap; amounts are as each item type scales them.`,
    controls,
    curve,
    table
  );
}
function pct(before, after) {
  return before > 0 ? after / before - 1 : after > 0 ? 1 : 0;
}
function gearScore(state2, hero, slot, ref) {
  const c = compareGear(state2, hero, slot, ref);
  return pct(c.dps.before, c.dps.after) + pct(c.toughness.before, c.toughness.after);
}
function candidates(state2, hero, slot) {
  const out = [];
  for (const item of state2.craftedItems) {
    const ref = { kind: "crafted", id: item.id };
    if (!isItemEquipped(state2, item.id) && canEquipInSlot(state2, hero, ref, slot)) out.push(ref);
  }
  for (const key of materialOrder) {
    const ref = { kind: "material", key };
    if ((state2.materials[key] ?? 0) > 0 && requireMaterial(key).equip && canEquipInSlot(state2, hero, ref, slot)) out.push(ref);
  }
  return out;
}
function isTwoHanded(state2, ref) {
  const item = resolveItemRef(state2, ref);
  return !!item && !!itemTypes[item.itemType].twoHanded;
}
function bestFor(state2, hero, slot, keep, floor) {
  let best = null;
  let bestScore = floor ?? -Infinity;
  for (const ref of candidates(state2, hero, slot)) {
    if (!keep(ref)) continue;
    const score = gearScore(state2, hero, slot, ref);
    if (score > bestScore) {
      best = ref;
      bestScore = score;
    }
  }
  return best;
}
function totalScore(before, hero, after, changed) {
  const b = gearPower(getAdventurerStats(before, hero), hero.level);
  const a = gearPower(getAdventurerStats(after, changed), changed.level);
  return pct(b.dps, a.dps) + pct(b.toughness, a.toughness);
}
function equipHands(state2, hero) {
  const heroIndex = state2.adventurers.indexOf(hero);
  const pairState = structuredClone(state2);
  const pairHero = pairState.adventurers[heroIndex];
  const main = hero.equipment.mainHand;
  if (main && isTwoHanded(state2, main)) unequip(pairState, pairHero, "mainHand");
  invalidateStats();
  const oneHand = bestFor(pairState, pairHero, "mainHand", (ref) => !isTwoHanded(pairState, ref), pairHero.equipment.mainHand ? 1e-3 : null);
  if (oneHand) equip(pairState, pairHero, oneHand, "mainHand");
  invalidateStats();
  const offHand = bestFor(pairState, pairHero, "offHand", () => true, 1e-3);
  if (offHand) equip(pairState, pairHero, offHand, "offHand");
  invalidateStats();
  const pairScore = totalScore(state2, hero, pairState, pairHero);
  const twoState = structuredClone(state2);
  const twoHero = twoState.adventurers[heroIndex];
  const twoHand = bestFor(twoState, twoHero, "mainHand", (ref) => isTwoHanded(twoState, ref), null);
  if (twoHand) equip(twoState, twoHero, twoHand, "mainHand");
  invalidateStats();
  const twoScore = twoHand ? totalScore(state2, hero, twoState, twoHero) : -Infinity;
  invalidateStats();
  const changed = [];
  if (twoScore > 1e-3 && twoScore >= pairScore) {
    if (equip(state2, hero, twoHand, "mainHand")) changed.push("mainHand");
  } else if (pairScore > 1e-3) {
    if (main && isTwoHanded(state2, main) && oneHand) unequip(state2, hero, "mainHand");
    if (oneHand && equip(state2, hero, oneHand, "mainHand")) changed.push("mainHand");
    if (offHand && equip(state2, hero, offHand, "offHand")) changed.push("offHand");
  }
  invalidateStats();
  return changed;
}
function autoEquip(state2, hero) {
  const changed = equipHands(state2, hero);
  for (const slot of slotOrder) {
    if (slot === "mainHand" || slot === "offHand") continue;
    const best = bestFor(state2, hero, slot, () => true, 1e-3);
    if (best && equip(state2, hero, best, slot)) {
      changed.push(slot);
      invalidateStats();
    }
  }
  return changed;
}
const PEDDLER_UNLOCK = "clear-hollowMines";
const VISIT_SECONDS = 15 * 60;
const VISIT_GAP = [10 * 60, 15 * 60];
const BONUS_CHANCE = 0.25;
const PRICE_MULTIPLIER = 3;
const PREMIUM_PRICE_MULTIPLIER = 5;
const RARE_FOUND = 3;
const RARE_MARKUP = 1.5;
const HOLD_BASE = 100;
function peddlerUnlocked(state2) {
  return state2.achievements.includes(PEDDLER_UNLOCK) || !!state2.peddler;
}
function peddlerHere(state2) {
  const p = state2.peddler;
  return !!p && p.leavesAt !== void 0 && state2.time < p.leavesAt;
}
function gap(rng) {
  return VISIT_GAP[0] + rng() * (VISIT_GAP[1] - VISIT_GAP[0]);
}
function poolPick(state2, tier, exclude, rng) {
  const entries = [];
  for (const key of questOrder) {
    if (!isQuestUnlocked(state2, key)) continue;
    if (tier === "M" && !isQuestCleared(state2, key)) continue;
    for (const e of quests[key].pools[tier]) {
      if (!requireMaterial(e.material).keyItem && !exclude.has(e.material) && !exclude.has(premiumKey(e.material))) entries.push(e);
    }
  }
  const total = entries.reduce((s, e) => s + e.weight, 0);
  if (total <= 0) return void 0;
  let r = rng() * total;
  for (const e of entries) {
    r -= e.weight;
    if (r < 0) return e.material;
  }
  return entries[entries.length - 1].material;
}
function rollOffer(state2, slot, exclude, rng) {
  const [high, low] = slot === "main" ? ["R", "C"] : ["M", "U"];
  const order = rng() < 0.5 ? [high, low] : [low, high];
  for (const tier of order) {
    const key = poolPick(state2, tier, exclude, rng);
    if (!key) continue;
    const material = tier === high ? rng() < PREMIUM_CHANCE ? premiumKey(key) : key : premiumKey(key);
    return { material, tier, slot };
  }
  return void 0;
}
function rollStock(state2, previous, rng) {
  const held = previous.filter((o) => o.held && !o.sold);
  const used = new Set(held.map((o) => plainKey(o.material)));
  const slots = ["main", "main", ...rng() < BONUS_CHANCE ? ["bonus"] : []];
  const stock = [];
  for (const slot of slots) {
    const keep = held.find((o) => o.slot === slot && !stock.includes(o));
    if (keep) {
      stock.push(keep);
      continue;
    }
    const offer = rollOffer(state2, slot, used, rng);
    if (offer) {
      used.add(plainKey(offer.material));
      stock.push(offer);
    }
  }
  for (const o of held) if (!stock.includes(o)) stock.push(o);
  return stock;
}
function updatePeddler(state2, rng = Math.random) {
  if (!peddlerUnlocked(state2)) return null;
  if (!state2.peddler) {
    state2.peddler = { nextVisit: state2.time + 30, stock: [], visits: 0 };
    return "unlocked";
  }
  const p = state2.peddler;
  if (p.leavesAt !== void 0 && state2.time < p.leavesAt) return null;
  if (state2.time >= p.nextVisit) {
    p.stock = rollStock(state2, p.stock, rng);
    p.leavesAt = state2.time >= p.nextVisit + VISIT_SECONDS ? state2.time + VISIT_SECONDS : p.nextVisit + VISIT_SECONDS;
    p.nextVisit = p.leavesAt + gap(rng);
    p.visits++;
    return "arrived";
  }
  if (p.stock.some((o) => !o.held || o.sold)) p.stock = p.stock.filter((o) => o.held && !o.sold);
  return null;
}
function offerPrice(state2, offer) {
  const m = requireMaterial(offer.material);
  const base = SALVAGE_TIER_COST[Math.min(SALVAGE_TIER_COST.length - 1, m.power)] * PRICE_MULTIPLIER;
  const scarce = (state2.obtained[plainKey(offer.material)] ?? 0) < RARE_FOUND ? RARE_MARKUP : 1;
  return Math.round(base * scarce * (isPremium(offer.material) ? PREMIUM_PRICE_MULTIPLIER : 1));
}
function holdCount(state2) {
  var _a2;
  return ((_a2 = state2.peddler) == null ? void 0 : _a2.stock.filter((o) => o.held && !o.sold).length) ?? 0;
}
function holdCost(state2) {
  return HOLD_BASE * Math.pow(2, holdCount(state2));
}
function buyOffer(state2, index) {
  var _a2;
  const offer = (_a2 = state2.peddler) == null ? void 0 : _a2.stock[index];
  if (!offer || offer.sold) return "That is gone.";
  if (!peddlerHere(state2)) return "The peddler is away.";
  const price = offerPrice(state2, offer);
  if (state2.gold < price) return `Needs ${price} gold.`;
  state2.gold -= price;
  state2.materials[offer.material] = (state2.materials[offer.material] ?? 0) + 1;
  offer.sold = true;
  offer.held = false;
  const p = state2.peddler;
  if (p.stock.every((o) => o.sold)) {
    p.leavesAt = state2.time;
    p.nextVisit = state2.time + gap(Math.random);
  }
  return null;
}
function holdOffer(state2, index) {
  var _a2;
  const offer = (_a2 = state2.peddler) == null ? void 0 : _a2.stock[index];
  if (!offer || offer.sold || offer.held) return "That can't be held.";
  const cost = holdCost(state2);
  if (state2.gold < cost) return `Needs ${cost} gold.`;
  state2.gold -= cost;
  offer.held = true;
  return null;
}
function releaseOffer(state2, index) {
  const p = state2.peddler;
  const offer = p == null ? void 0 : p.stock[index];
  if (!p || !offer) return;
  offer.held = false;
  if (!peddlerHere(state2)) p.stock.splice(index, 1);
}
const tierNames$1 = { C: "Common", U: "Uncommon", R: "Rare", M: "Mythic" };
function materialLink(ctx2, key) {
  return h("button", {
    class: "matlink" + (isPremium(key) ? " premium" : ""),
    title: "Show every use of this material",
    onclick: (event) => {
      event.stopPropagation();
      ctx2.ui.materialDetail = key;
      ctx2.refresh();
    }
  }, materialIcon(key), requireMaterial(key).name);
}
function recipeFill(state2, item) {
  const left = { ...state2.materials };
  const missing = [];
  const take = (keys, limit) => keys.filter((k, i) => {
    if (i < limit && (left[k] ?? 0) > 0) {
      left[k]--;
      return true;
    }
    missing.push(k);
    return false;
  });
  const base = take(item.base, getBaseLimit(state2, item.itemType));
  const decorations = take(item.decorations, getDecorationLimit(state2, item.itemType));
  return { base, decorations, missing };
}
function recipeButton(ctx2, item) {
  const { state: state2, ui: ui2 } = ctx2;
  if (!hasBench(state2)) return null;
  const fill = recipeFill(state2, item);
  const names = (keys) => keys.map((k) => requireMaterial(k).name).join(", ");
  const status = !fill.base.length ? "none" : fill.missing.length ? "partial" : "full";
  return h("button", {
    class: "btn small recipe " + status,
    disabled: status === "none",
    title: status === "none" ? `None of its base materials in stock (${names(item.base)})` : status === "partial" ? `Put the recipe on the bench. Missing: ${names(fill.missing)}` : "Put the recipe on the bench: every material is in stock",
    onclick: (ev) => {
      ev.stopPropagation();
      ui2.bench = { itemType: item.itemType, base: fill.base, decorations: fill.decorations };
      ui2.shopOpen = false;
      ui2.benchOpen = true;
      ui2.picker = null;
      ui2.selectedSlot = null;
      ui2.materialDetail = null;
      if (matchMedia("(max-width: 760px)").matches) ui2.panel = null;
      if (fill.missing.length) ctx2.toast(`Missing ${names(fill.missing)}`);
      ctx2.refresh();
    }
  }, "Recraft");
}
function currentHero(ctx2) {
  const { state: state2, ui: ui2 } = ctx2;
  const hero = state2.adventurers.find((a) => a.id === ui2.hero) ?? state2.adventurers[0];
  ui2.hero = (hero == null ? void 0 : hero.id) ?? null;
  return hero;
}
function selectHero(ui2, id) {
  ui2.hero = id;
  if (ui2.runPanel) ui2.runPanel = id;
}
function showRun(ui2, id, sent) {
  ui2.hero = id;
  ui2.runPanel = id;
  const narrow = matchMedia("(max-width: 760px)").matches;
  if (sent) {
    const guide = sent.guide ?? (sent.guide = {});
    const firstSend = !guide.firstSend && !guide.firstRunDone;
    guide.firstSend = true;
    if (narrow || firstSend) ui2.view = "battle";
  } else ui2.view = "battle";
  if (matchMedia("(max-width: 760px)").matches) {
    ui2.panel = null;
    ui2.picker = null;
  }
}
function renderPanel(ctx2) {
  const panel = ctx2.ui.panel;
  if (!panel) {
    return null;
  }
  if (panel.kind === "adventurer") {
    const adventurer = currentHero(ctx2);
    return adventurer ? adventurerPanel(ctx2, adventurer) : null;
  }
  if (panel.kind === "quest") {
    return questPanel(ctx2, panel.key);
  }
  if (panel.kind === "hire") {
    return hirePanel(ctx2);
  }
  if (panel.kind === "salvage") {
    return salvagePanel(ctx2);
  }
  if (panel.kind === "shop") {
    ctx2.ui.panel = null;
    ctx2.ui.shopOpen = true;
    return null;
  }
  if (panel.kind === "peddler") {
    return peddlerPanel(ctx2);
  }
  if (panel.kind === "statExplorer") {
    const el = statExplorerPanel(ctx2, (title, subtitle, ...body) => shell(ctx2, title, subtitle, ...body));
    el.classList.add("wide");
    return el;
  }
  return guildPanel(ctx2);
}
function renderBenchPanel(ctx2) {
  if (!hasBench(ctx2.state)) ctx2.ui.benchOpen = false;
  if (ctx2.ui.benchOpen) ctx2.ui.shopOpen = false;
  return ctx2.ui.benchOpen ? benchPanel(ctx2) : ctx2.ui.shopOpen ? shopPanel(ctx2) : null;
}
const headerFiles = /* @__PURE__ */ Object.assign({ "../assets/ui/header-bench.webp": __vite_glob_0_0$1, "../assets/ui/header-guild.webp": __vite_glob_0_1$1, "../assets/ui/header-hire.webp": __vite_glob_0_2$1, "../assets/ui/header-merchant.webp": __vite_glob_0_3$1, "../assets/ui/header-peddler.webp": __vite_glob_0_4$1, "../assets/ui/header-salvage.webp": __vite_glob_0_5$1 });
const headerByTitle = { "Merchant": "merchant", "Guild hall": "guild", "Crafting bench": "bench", "Travelling peddler": "peddler", "Salvage yard": "salvage", "Hire an adventurer": "hire", "Applicants": "hire" };
const questBackgroundByName = Object.fromEntries(Object.values(quests).flatMap((q) => {
  var _a2;
  const url = backgroundUrl(((_a2 = q.endless) == null ? void 0 : _a2.baseKey) ?? q.key);
  return url ? [[q.name, url]] : [];
}));
function panelHeader(title) {
  var _a2;
  const key = headerByTitle[title];
  const url = key ? (_a2 = Object.entries(headerFiles).find(([path]) => path.endsWith(`/header-${key}.webp`))) == null ? void 0 : _a2[1] : void 0;
  if (url) return { url, pixel: false };
  const bg = questBackgroundByName[title];
  return bg ? { url: bg, pixel: true } : void 0;
}
function shell(ctx2, title, subtitle, ...body) {
  return panelShell(ctx2, "right", title, subtitle, ...body);
}
function panelShell(ctx2, side, title, subtitle, ...body) {
  const close = () => {
    if (side === "left") {
      ctx2.ui.benchOpen = false;
      ctx2.ui.shopOpen = false;
    } else ctx2.ui.panel = null;
    ctx2.refresh();
  };
  const header = panelHeader(title);
  return h(
    "section",
    { class: "panel " + side + (header ? " has-header" : ""), "aria-label": title },
    header ? h("img", { class: "panel-header-art" + (header.pixel ? " pixel" : ""), src: header.url, alt: "", draggable: "false" }) : null,
    h(
      "div",
      { class: "panel-head" },
      h(
        "div",
        { class: "grow" },
        h("h2", null, title),
        typeof subtitle === "string" ? h("div", { class: "muted small" }, subtitle) : subtitle
      ),
      h("button", { class: "btn", "aria-label": "Close panel", onclick: close }, "Close")
    ),
    h("div", { class: "panel-body" }, ...body.filter(Boolean))
  );
}
function itemStatsText(stats) {
  const parts = [];
  const text = formatStats(stats.stats);
  if (text) parts.push(text);
  if (stats.attacksPerSecond) parts.push(`${num(stats.attacksPerSecond)} attacks/s`);
  return parts.join(" · ") || "No stats";
}
const damageLabels = { physical: "phys", fire: "fire", cold: "cold", lightning: "lightning" };
function damageSplitText(total, shares) {
  return Object.entries(shares).filter(([, share]) => share > 0).map(([type, share]) => `${fmt(total * share, 1)} ${damageLabels[type]}`).join(" + ");
}
function activityText(state2, adventurer) {
  const a = adventurer.activity;
  if (a.kind === "fighting") {
    const quest = quests[a.questKey];
    const front = a.monsters[0];
    const where = quest.endless ? `Endless encounter ${a.encounterIndex + 1}` : `Encounter ${a.encounterIndex + 1}/${quest.encounters.length}`;
    return `${where} · ${front ? monsters[front.key].name : "cleared"}`;
  }
  if (a.kind === "traveling") {
    return `Traveling to ${quests[a.questKey].name} · ${Math.ceil(a.remaining)}s`;
  }
  if (a.kind === "resting") {
    const stats = getCachedStats(state2, adventurer);
    const extra = pendingExtraFight(adventurer);
    const label = a.defeated ? "Recovering from defeat" : extra === "boss" ? `Resting before ${monsters[quests[a.questKey].boss.monster].name}` : extra === "bonus" ? "Resting before a bonus encounter" : "Resting";
    return `${label} · ${Math.ceil(a.remaining / restSpeed(stats.maxHealth, stats.lifeRegen, adventurer.level))}s`;
  }
  return a.reason ?? (state2.adventurers.length ? "Idle at the guild" : "");
}
function hpXpBars(state2, adventurer) {
  const stats = getCachedStats(state2, adventurer);
  const levelStart = totalXpForLevel(adventurer.level);
  const levelEnd = totalXpForLevel(adventurer.level + 1);
  const xpFraction = (adventurer.xp - levelStart) / (levelEnd - levelStart);
  return h(
    "div",
    null,
    h(
      "div",
      { class: "row small" },
      h("span", { style: "width:24px" }, "HP"),
      h("div", { class: "bar wide grow" }, h("span", { style: `width:${100 * Math.max(0, adventurer.hp) / stats.maxHealth}%` })),
      h("span", { class: "num" }, `${Math.max(0, Math.ceil(adventurer.hp))}/${stats.maxHealth}`)
    ),
    stats.maxWard > 0 ? h(
      "div",
      { class: "row small", style: "margin-top:4px" },
      h("span", { style: "width:24px", title: "Ward absorbs damage before HP and refills at the start of each encounter" }, "Ward"),
      h("div", { class: "bar wide ward grow" }, h("span", { style: `width:${100 * Math.max(0, Math.min(stats.maxWard, adventurer.ward ?? stats.maxWard)) / stats.maxWard}%` })),
      h("span", { class: "num" }, `${Math.ceil(Math.max(0, adventurer.activity.kind === "fighting" ? adventurer.ward ?? 0 : stats.maxWard))}/${stats.maxWard}`)
    ) : null,
    h(
      "div",
      { class: "row small", style: "margin-top:4px" },
      h("span", { style: "width:24px" }, "XP"),
      h("div", { class: "bar wide xp grow" }, h("span", { style: `width:${100 * Math.min(1, xpFraction)}%` })),
      h("span", { class: "num" }, `${adventurer.xp - levelStart}/${levelEnd - levelStart}`)
    )
  );
}
function adventurerPanel(ctx2, adventurer) {
  const { state: state2, ui: ui2 } = ctx2;
  const stats = getCachedStats(state2, adventurer);
  const cls = classes[adventurer.classKey];
  const pct2 = (v) => `${fmt(v * 100)}%`;
  const damageParts = Object.keys(stats.damage).filter((t) => stats.damage[t] > 0).map((t) => `${fmt(stats.damage[t], 1)} ${damageLabels[t]}`);
  const statGrid = h(
    "div",
    null,
    h("h3", null, "Stats"),
    hpXpBars(state2, adventurer),
    h("div", { class: "statgroup" }, "Offense"),
    h(
      "div",
      { class: "statgrid small" },
      statRow("Weapon", stats.weaponName + (stats.wieldNote && stats.wieldNote !== "unarmed" ? ` (${stats.wieldNote})` : "")),
      stats.strikes ? stats.strikes.map((st, i) => statRow(i ? "Off-hand hit" : "Main-hand hit", `${Object.keys(st.damage).filter((t) => st.damage[t] > 0).map((t) => `${fmt(st.damage[t], 1)} ${damageLabels[t]}`).join(" + ") || "0"} · ${fmt(st.attacksPerSecond, 2)}/s pace`)) : statRow("Hit", damageParts.join(" + ") || "0"),
      statRow("Roll", `${num(stats.rollMin)}× to ${num(stats.rollMax)}×`),
      statRow("Attacks/s", fmt(stats.attacksPerSecond, 2)),
      statRow("Accuracy", stats.accuracy),
      statRow("Crit", `${pct2(stats.critChance)} · +${pct2(stats.critBonus)}/level`),
      statRow("Avg crit", `${num(expectedCritMultiplier(stats.critChance, stats.critBonus))}×`),
      statRow("Ailment chance", `${pct2(AILMENT_CHANCE + (stats.gear.igniteChance ?? 0))} ignite · ${pct2(AILMENT_CHANCE + (stats.gear.chillChance ?? 0))} chill · ${pct2(AILMENT_CHANCE + (stats.gear.shockChance ?? 0))} shock`),
      stats.gear.ailmentEffect ? statRow("Ailment effect", `+${pct2(stats.gear.ailmentEffect)}`) : null
    ),
    h("div", { class: "statgroup" }, "Defense"),
    h(
      "div",
      { class: "statgrid small" },
      statRow("Max HP", stats.maxHealth),
      statRow("Ward", stats.maxWard),
      stats.hpLostAsWard ? statRow("HP lost as ward", pct2(stats.hpLostAsWard)) : null,
      stats.gear.wardOnDodge || stats.gear.wardOnDodgePercent ? statRow("Ward on dodge", [stats.gear.wardOnDodge ? fmt(stats.gear.wardOnDodge, 1) : "", stats.gear.wardOnDodgePercent ? `${pct2(stats.gear.wardOnDodgePercent)} of max` : ""].filter(Boolean).join(" + ")) : null,
      stats.gear.wardOnBlock || stats.gear.wardOnBlockPercent ? statRow("Ward on block", [stats.gear.wardOnBlock ? fmt(stats.gear.wardOnBlock, 1) : "", stats.gear.wardOnBlockPercent ? `${pct2(stats.gear.wardOnBlockPercent)} of max` : ""].filter(Boolean).join(" + ")) : null,
      statRow("Armor", stats.armor),
      statRow("Evasion", stats.evasion),
      ...(() => {
        const typical = typicalAttack(adventurer.level);
        const hit = typical.hit, after = mitigateHit(hit, stats.armor);
        const dp = hit < 10 ? 1 : 0;
        const armorRow = statRow("Armor vs typical hit", `${fmt(after, dp)} (~${fmt(100 * (1 - after / Math.max(1e-9, hit)))}% less)`);
        armorRow.classList.add("wide");
        armorRow.title = `An average monster hit around level ${adventurer.level} is about ${fmt(hit, dp)}. Armor cuts it to ${fmt(after, dp)}, before resistances and block. A hit under 1 deals 1 with that chance, else 0.`;
        const hits = expectedHits(typical.accuracy, stats.evasion);
        const evasionRow = statRow("Hits taken per typical attack", fmt(hits, 2));
        evasionRow.classList.add("wide");
        evasionRow.title = `Monsters around level ${adventurer.level} have about ${fmt(typical.accuracy)} accuracy. Against ${stats.evasion} evasion an attack lands ${fmt(hits, 2)} hits on average (${pct2(hitChance(typical.accuracy, stats.evasion))} chance the first lands), before block and Exposed.`;
        return [armorRow, evasionRow];
      })(),
      statRow("Block", pct2(stats.blockChance)),
      ...elements.map((e) => statRow(`${e[0].toUpperCase()}${e.slice(1)} res`, pct2(stats.resist[e])))
    ),
    h("div", { class: "statgroup" }, "Recovery"),
    h(
      "div",
      { class: "statgrid small" },
      statRow("Regen", `${fmt(stats.lifeRegen, 1)}/s`),
      statRow("Leech", pct2(stats.lifeLeech)),
      statRow("Life on hit", fmt(stats.lifeOnHit, 1)),
      statRow("Full rest", `${fmt(15 / restSpeed(stats.maxHealth, stats.lifeRegen, adventurer.level), 1)}s`)
    ),
    h("div", { class: "statgroup" }, "Attributes"),
    h(
      "div",
      { class: "statgrid small" },
      statRow("Str", stats.str),
      statRow("Dex", stats.dex),
      statRow("Int", stats.int)
    ),
    h(
      "p",
      { class: "muted small", style: "margin:6px 0 0" },
      `Grows ${growthText(adventurer.classKey)} per level. ${damageStats(cls).map((k) => k[0].toUpperCase() + k.slice(1)).join(" and ")}: half ${damageStats(cls).length > 1 ? "their average" : "of it"} is added as physical damage. Str: ${statDefs.str.description} Dex: ${statDefs.dex.description} Int: ${statDefs.int.description} Resistances cap at ${pct2(RESIST_CAP)}, block at ${pct2(BLOCK_CAP)}. Hits chain: hit n of an attack lands with chance (hit rating) / n. Hit rating is √(accuracy / evasion) − 0.2: an attacker with accuracy equal to your evasion has a rating of ${pct2(hitRating(stats.evasion, stats.evasion))}, and 1.44× that accuracy never misses the first hit. After whole attacks miss in a row, the next first hit rolls with accuracy × (1 + misses in a row).`
    )
  );
  const assignment = h(
    "div",
    { class: "row small" },
    h("span", { class: "grow muted" }, adventurer.assignment ? `On ${quests[adventurer.assignment.questKey].name} · ${activityText(state2, adventurer)}` : activityText(state2, adventurer) + ". Open a quest on the map to send them out."),
    adventurer.run ? h("button", { class: "btn small", onclick: () => {
      showRun(ui2, adventurer.id);
      ctx2.refresh();
    } }, "Show run") : null
  );
  const equipList = h(
    "div",
    { id: "equipment" },
    h(
      "div",
      { class: "row h3row" },
      h("h3", { class: "grow" }, "Equipment"),
      h("button", { class: "btn small", title: "In each slot, from the top, wear the free item with the best DPS % + toughness % change. Items other members wear are left alone.", onclick: () => {
        const changed = autoEquip(state2, adventurer);
        if (changed.length) state2.guide = { ...state2.guide, manualEquip: true };
        if (!changed.length) ctx2.toast(`Nothing better for ${adventurer.name} right now`);
        ctx2.refresh();
      } }, "Auto equip")
    ),
    h(
      "div",
      { class: "list" },
      ...slotOrder.map((slot) => {
        var _a2;
        const ref = adventurer.equipment[slot];
        const item = ref ? resolveItemRef(state2, ref) : void 0;
        const blocked = slot === "offHand" && !ref && isTwoHandedWielded(state2, adventurer);
        const pick2 = h(
          "button",
          {
            class: "item grow" + (ui2.selectedSlot === slot ? " selected" : ""),
            title: slotNames[slot],
            "aria-label": `${slotNames[slot]}: ${item ? item.name : blocked ? "blocked by two-handed weapon" : "empty"}`,
            "data-guide": !ref && ui2.selectedSlot !== slot && hasFreeGear(state2, adventurer, slot) ? "equip" : void 0,
            onclick: () => {
              ui2.selectedSlot = ui2.selectedSlot === slot ? null : slot;
              ctx2.refresh();
            }
          },
          h("span", { class: "slot-art" + (item ? "" : " empty") }, !ref ? itemTypeArt(emptySlotType(adventurer, slot)) : ref.kind === "material" ? materialIcon(ref.key, "typeart") : itemArt(item.itemType, (_a2 = state2.craftedItems.find((c) => c.id === ref.id)) == null ? void 0 : _a2.base)),
          h(
            "span",
            { class: "grow" },
            item ? h("div", { class: "equipname", title: item.name }, h("span", { class: "lvtag lvpre", title: `Requires level ${itemLevelRequirement(state2, ref)}` }, `Lv ${itemLevelRequirement(state2, ref)} `), item.name, (ref == null ? void 0 : ref.kind) === "material" ? h("span", { class: "muted small" }, " (material)") : null) : h("div", { class: "muted equipname" }, `${slotNames[slot]}: ${blocked ? "blocked by two-handed weapon" : "empty"}`),
            item ? h("div", { class: "mods equipmods", title: itemStatsText(item.stats) }, itemStatsText(item.stats)) : null
          )
        );
        const craftedItem = (ref == null ? void 0 : ref.kind) === "crafted" ? state2.craftedItems.find((c) => c.id === ref.id) : void 0;
        return h(
          "div",
          { class: "row memberrow equiprow slotrow" },
          pick2,
          item ? h(
            "div",
            { class: "equipbtns" },
            craftedItem ? recipeButton(ctx2, craftedItem) : null,
            h("button", { class: "btn small", title: `Take off ${item.name}`, "aria-label": `Take off ${item.name}`, onclick: () => {
              unequip(state2, adventurer, slot);
              ctx2.refresh();
            } }, "Take off")
          ) : null
        );
      })
    )
  );
  const passive = heroPassives(adventurer.classKey, adventurer.passives, adventurer.bonuses, "passive small");
  const ambitions = adventurer.ambitions ?? [];
  const doneCount = ambitions.filter((a) => a.done).length;
  const ambitionSection = ambitions.length ? h(
    "div",
    null,
    h("h3", null, `Ambitions (${doneCount}/${ambitions.length})`),
    ambitionList(ambitions, adventurer),
    h(
      "div",
      { class: "row small", style: "margin-top:4px" },
      h("span", { class: "grow muted" }, doneCount < ambitions.length ? `Fulfilling ${doneCount + 1} would pay ×${RETIRE_MULTIPLIER[doneCount + 1]} on retirement.` : "Every ambition fulfilled."),
      h("button", {
        class: "btn small",
        title: `Open the guild roster, where ${adventurer.name} can retire`,
        onclick: () => openGuildSection(ctx2, "guild-roster")
      }, `Retire now: ${retireFame(adventurer)} fame`)
    )
  ) : null;
  return shell(
    ctx2,
    adventurer.name,
    h("div", { class: "panel-title-sub" }, `Level ${adventurer.level} ${cls.name}`),
    // The portrait sits beside the class passive at the top of the character panel.
    h("div", { class: "herohead" }, heroPortrait(adventurer, "large"), passive),
    assignment,
    equipList,
    ambitionSection,
    contractsOpen(state2) ? contractSection(ctx2, adventurer) : null,
    statGrid
  );
}
function contractsOpen(state2) {
  return (state2.expansion ?? 0) >= 1;
}
function startContract(ctx2, adventurer, kind, id) {
  var _a2;
  const { state: state2, ui: ui2 } = ctx2;
  const contract = takeContract(state2, adventurer, kind, id);
  if (!contract) {
    ctx2.toast("That contract is not available");
    return;
  }
  const quest = quests[contract.questKey];
  setStopAt(adventurer, quest.key, quest.encounters.length - 1);
  if (((_a2 = adventurer.assignment) == null ? void 0 : _a2.questKey) === quest.key && adventurer.activity.kind !== "idle" && adventurer.activity.kind !== "resting") {
    recall(state2, adventurer);
  }
  assignQuest(state2, adventurer, quest.key);
  showRun(ui2, adventurer.id, state2);
}
function contractCard(ctx2, contract, extra, ...buttons) {
  const quest = quests[contract.questKey];
  return h(
    "div",
    { class: "contract" },
    h("div", { class: "small" }, contractText(contract)),
    h("div", { class: "mods" }, contract.mods.map((k) => {
      const def = quest.modifiers.find((m) => m.key === k);
      return def ? `${def.name}: ${modifierPenaltyText(def)}` : k;
    }).join(" · ")),
    h("div", { class: "mods good" }, "Reward: ", ...contract.reward.material ? [materialLink(ctx2, contract.reward.material), ` + ${contractRewardText({ ...contract, reward: { ...contract.reward, material: void 0 } })}`] : [contractRewardText(contract)]),
    extra,
    h("div", { class: "row", style: "margin-top:4px" }, ...buttons.filter(Boolean))
  );
}
function contractSection(ctx2, adventurer) {
  const { state: state2 } = ctx2;
  ensurePersonalContract(state2, adventurer);
  const offer = adventurer.contract;
  const active = adventurer.activeContract;
  const onGuild = (active == null ? void 0 : active.kind) === "guild" ? findContract(state2, active) : void 0;
  const cost = personalRefreshCost(adventurer);
  const working = (active == null ? void 0 : active.kind) === "personal" && offer && active.id === offer.id;
  const drop = h("button", { class: "btn small", onclick: () => {
    dropContract(adventurer);
    ctx2.refresh();
  } }, "Drop");
  return h(
    "div",
    null,
    h("h3", null, "Contracts"),
    onGuild ? contractCard(ctx2, onGuild, h("div", { class: "mods" }, h("strong", null, "Working on this guild contract.")), drop) : null,
    offer ? contractCard(
      ctx2,
      offer,
      h("div", { class: "mods muted" }, working ? h("strong", null, "Working on it. Runs started now count.") : `Personal contract, pitched at level ${adventurer.level}. A guaranteed mythic.`),
      working ? drop : h("button", { class: "btn small primary", onclick: () => {
        startContract(ctx2, adventurer, "personal", offer.id);
        ctx2.refresh();
      } }, "Take contract"),
      h("button", { class: "btn small", disabled: state2.gold < cost, title: `Replace it with a new contract pitched at level ${adventurer.level}`, onclick: () => {
        refreshPersonalContract(state2, adventurer);
        ctx2.refresh();
      } }, `New contract · ${cost} gold`)
    ) : h("div", { class: "muted small" }, "No contract on offer.")
  );
}
function contractBoard(ctx2) {
  const { state: state2 } = ctx2;
  ensureGuildContracts(state2);
  return h(
    "div",
    null,
    h("h3", null, "Guild contracts"),
    h("p", { class: "muted small", style: "margin:0 0 6px" }, "Open to any member. New contracts ask for more modifiers as the guild's fame grows, while the fame they pay stays the same. A contract counts only for runs started after it is taken, and a new one replaces it when done."),
    h("div", { class: "list" }, ...(state2.guildContracts ?? []).map((c) => {
      var _a2;
      const holder = contractHolder(state2, c.id);
      const pickId = (_a2 = currentHero(ctx2)) == null ? void 0 : _a2.id;
      const pickHero = state2.adventurers.find((a) => a.id === pickId);
      const select = (pickHero == null ? void 0 : pickHero.activeContract) ? h("div", { class: "mods" }, `${pickHero.name} is already on another contract.`) : null;
      const cost = guildRefreshCost(c);
      return contractCard(
        ctx2,
        c,
        holder ? h("div", { class: "mods" }, h("strong", null, `${holder.name} is working on it.`)) : null,
        holder ? null : select,
        holder ? h("button", { class: "btn small", onclick: () => {
          dropContract(holder);
          ctx2.refresh();
        } }, `Drop`) : h("button", { class: "btn small primary", disabled: !pickHero, onclick: () => {
          if (pickHero) startContract(ctx2, pickHero, "guild", c.id);
          ctx2.refresh();
        } }, `Send ${(pickHero == null ? void 0 : pickHero.name) ?? ""}`),
        h("button", { class: "btn small", disabled: state2.gold < cost, onclick: () => {
          refreshGuildContract(state2, c.id);
          ctx2.refresh();
        } }, `Replace · ${cost} gold`)
      );
    }))
  );
}
function hallOfLegends(state2) {
  const legends = state2.legends ?? [];
  if (!legends.length) return null;
  return h(
    "div",
    null,
    h("h3", null, `Hall of Legends (${legends.length})`),
    h("div", { class: "list" }, ...[...legends].reverse().map((l) => {
      var _a2;
      return h(
        "div",
        { class: "legend small" },
        h("div", { class: "row" }, h("strong", { class: "grow" }, `${l.name}, level ${l.level} ${((_a2 = classes[l.classKey]) == null ? void 0 : _a2.name) ?? ""}`), h("span", { class: "num" }, `${l.fame} fame`)),
        ...l.ambitions.map((a) => h("div", { class: "mods" + (a.done ? "" : " muted") }, `${a.done ? "✓" : "✗"} ${ambitionText(a)}`)),
        l.records ? h("div", { class: "mods muted" }, `Best hit ${Math.floor(l.records.bestHit).toLocaleString()} · longest chain ${l.records.bestChain}`) : null
      );
    }))
  );
}
function runTrack(ctx2, adventurer) {
  const run = adventurer.run;
  const quest = quests[run.questKey];
  const activity = adventurer.activity;
  const fighting = activity.kind === "fighting" && activity.questKey === run.questKey ? activity.encounterIndex : -1;
  const last2 = quest.encounters.length - 1;
  const endlessAt = Math.max(0, fighting >= 0 ? fighting : run.defeatedAt ?? run.cleared + 1);
  const endlessStart = endlessAt - endlessAt % ENDLESS_PATTERN.length;
  return quest.endless ? h(
    "div",
    { class: "track" },
    ...quest.encounters.slice(endlessStart, endlessStart + ENDLESS_PATTERN.length).map((encounter, k) => {
      const i = endlessStart + k;
      return h("span", {
        class: ["enc", encounter.tier, i <= run.cleared ? "cleared" : "", i === fighting ? "current" : "", i === run.defeatedAt ? "failed" : ""].filter(Boolean).join(" "),
        title: `Endless encounter ${i + 1} · ${tierNames$1[encounter.tier]}`
      }, String(i + 1));
    })
  ) : h(
    "div",
    {
      class: "track",
      // Press on an encounter and drag along the track to move the stop point. Panels hold still while
      // a pointer is down, so the cards are restyled in place and the panel refreshes on release.
      onpointerdown: (event) => {
        const ev = event;
        const track = ev.currentTarget;
        const at = (x, y) => {
          var _a2;
          const el = (_a2 = document.elementFromPoint(x, y)) == null ? void 0 : _a2.closest(".enc[data-enc]");
          return el && track.contains(el) ? Number(el.dataset.enc) : null;
        };
        const start = at(ev.clientX, ev.clientY);
        if (start === null || ev.button !== 0) return;
        ev.preventDefault();
        track.setPointerCapture(ev.pointerId);
        const place = (i) => {
          var _a2;
          setStopAt(adventurer, run.questKey, i);
          const stop = ((_a2 = adventurer.run) == null ? void 0 : _a2.stopAt) ?? i;
          track.querySelectorAll(".enc[data-enc]").forEach((el) => {
            const k = Number(el.dataset.enc);
            el.classList.toggle("beyond", k > stop);
            el.classList.toggle("stop", k === stop && k !== last2);
          });
        };
        place(start);
        const move = (e) => {
          const i = at(e.clientX, e.clientY);
          if (i !== null) place(i);
        };
        const end = () => {
          track.removeEventListener("pointermove", move);
          track.removeEventListener("pointerup", end);
          track.removeEventListener("pointercancel", end);
          ctx2.refresh();
        };
        track.addEventListener("pointermove", move);
        track.addEventListener("pointerup", end);
        track.addEventListener("pointercancel", end);
      }
    },
    ...quest.encounters.map((encounter, i) => h("button", {
      "data-enc": String(i),
      onclick: (ev) => {
        if (ev.detail === 0) {
          setStopAt(adventurer, run.questKey, i);
          ctx2.refresh();
        }
      },
      "aria-label": `Stop after encounter ${i + 1}`,
      class: [
        "enc",
        encounter.tier,
        i <= run.cleared ? "cleared" : "",
        i > run.stopAt ? "beyond" : "",
        i === fighting ? "current" : "",
        i === run.defeatedAt ? "failed" : "",
        i === run.stopAt && i !== last2 ? "stop" : ""
      ].filter(Boolean).join(" "),
      title: `Encounter ${i + 1} · ${tierNames$1[encounter.tier]}. Click or drag along the track to stop after this one.`
    }, encounter.tier))
  );
}
function renderRunStrip(ctx2) {
  const { state: state2, ui: ui2 } = ctx2;
  const adventurer = currentHero(ctx2);
  const run = adventurer == null ? void 0 : adventurer.run;
  if (!adventurer || !run) return null;
  const quest = quests[run.questKey];
  return h(
    "section",
    { class: "runstrip", "aria-label": `${adventurer.name}'s run strip` },
    h(
      "div",
      { class: "rs-title" },
      h("strong", { class: "runtitle" }, `${adventurer.name} · ${quest.name}`),
      h("span", { class: "muted small" }, `Run ${run.number}`)
    ),
    runTrack(ctx2, adventurer),
    quest.endless ? null : h("span", { class: "rs-gains small muted" }, `+${run.gold} gold · +${run.xp} XP`),
    adventurer.assignment ? h("button", { class: "btn small", onclick: () => {
      recall(state2, adventurer);
      ui2.view = "map";
      ctx2.refresh();
    } }, "Recall") : null,
    h("button", { class: "btn small" + (ui2.stripOpen ? " on" : ""), "aria-expanded": ui2.stripOpen ? "true" : "false", title: "Loot, modifiers, auto recover and the recap for this run", onclick: () => {
      ui2.stripOpen = !ui2.stripOpen;
      ctx2.refresh();
    } }, ui2.stripOpen ? "Hide details" : "Run details"),
    // The recover button sits over the resting hero in the arena.
    ui2.stripOpen ? h("div", { class: "rs-details" }, ...runInfo(ctx2, adventurer, true)) : null
  );
}
function runInfo(ctx2, adventurer, strip = false) {
  var _a2;
  const { state: state2, ui: ui2 } = ctx2;
  const run = adventurer.run;
  const quest = quests[run.questKey];
  const activity = adventurer.activity;
  const autoShare = adventurer.autoRecover ?? 0;
  const runFee = run.fee ?? quest.entryFee;
  const netGold = Math.max(0, run.gold - runFee);
  const autoRow = h(
    "div",
    { class: "row small", style: "flex-wrap:nowrap;margin-top:6px" },
    h("span", { class: "muted oneline" }, "Auto recover"),
    h(
      "div",
      { class: "seg", role: "group", "aria-label": "Auto recover budget" },
      ...[0, 0.25, 0.5, 0.75, 1].map((share) => h("button", {
        class: autoShare === share ? "on" : "",
        title: share ? `Spend up to ${num(share * 100)}% of the last run's gold to skip resting` : "Never pay to skip resting",
        onclick: () => {
          adventurer.autoRecover = share;
          ctx2.refresh();
        }
      }, share ? `${num(share * 100)}%` : "Off"))
    )
  );
  const autoText = autoShare ? netGold > 0 ? `Recovers when the cost drops to ${getAutoRecoverBudget(adventurer)} gold: ${num(autoShare * 100)}% of this run's ${run.gold} gold${runFee ? ` after the ${runFee} gold entry fee` : ""}. Never spends more than a run earned.` : run.gold > 0 ? `This run's ${run.gold} gold hasn't covered its ${runFee} gold entry fee yet, so nothing will be spent.` : "This run has earned no gold yet, so nothing will be spent." : "Off. Rests run their full time unless you pay.";
  const modNames = (keys) => (keys ?? []).map((k) => {
    var _a3;
    return ((_a3 = quest.modifiers.find((m) => m.key === k)) == null ? void 0 : _a3.name) ?? k;
  }).join(", ");
  const lootText = Object.entries(run.loot).map(([key, n]) => `${n} ${requireMaterial(key).name}`).join(", ");
  return [
    quest.endless ? h("div", { class: "muted small" }, `No rewards. Monsters grow ${num(ENDLESS_GROWTH * 100)}% stronger every encounter, and ${num(ENDLESS_STEP)}× every ${ENDLESS_PATTERN.length}, until ${adventurer.name} falls or is recalled, then they head home.`) : null,
    quest.endless ? null : h("div", { class: "muted small oneline" }, "Click or drag along the encounters to turn back after one, including this run."),
    quest.endless ? null : h("div", { class: "muted small oneline", title: lootText }, ...lootText ? ["Loot: ", ...Object.entries(run.loot).flatMap(([key, n], i) => [i ? ", " : "", `${n} `, materialLink(ctx2, key)])] : ["No loot yet this run."]),
    quest.endless || strip ? null : h("div", { class: "muted small oneline" }, `+${run.gold} gold${runFee ? ` (fee ${runFee})` : ""} · +${run.xp} XP`),
    quest.endless ? null : h(
      "div",
      { class: "row small", style: "flex-wrap:nowrap;margin-top:6px" },
      h(
        "span",
        { class: "muted grow oneline", title: modNames(run.modifiers) },
        ((_a2 = run.modifiers) == null ? void 0 : _a2.length) ? `Modifiers: ${modNames(run.modifiers)}` : "No modifiers this run"
      ),
      h("button", { class: "btn small", onclick: () => {
        ui2.panel = { kind: "quest", key: run.questKey };
        ctx2.refresh();
      } }, "Change")
    ),
    run.contract ? h("div", { class: "muted small oneline" }, (() => {
      const c = findContract(state2, run.contract, adventurer);
      return c ? `On a ${run.contract.kind} contract: ${contractText(c)}` : "Contract done";
    })()) : null,
    quest.endless ? null : autoRow,
    quest.endless ? null : h("div", { class: "muted small" }, autoText),
    // This run's recap once it's over (resting or back home), however it ended. While the
    // next run is under way, the last run's recap stays up.
    (() => {
      const over = activity.kind === "resting" || activity.kind === "idle";
      const prev = adventurer.previousRun;
      if (over && run.stats) {
        return renderRunRecap(run.stats, false, {
          title: `Run recap · ${runOutcome(run)}`,
          onDetails: () => {
            ui2.recap = {
              title: `${adventurer.name} · ${quest.name}`,
              subtitle: `Run ${run.number}, ${runOutcome(run)}`,
              stats: JSON.parse(JSON.stringify(run.stats)),
              previous: adventurer.previousRunStats ? JSON.parse(JSON.stringify(adventurer.previousRunStats)) : void 0
            };
            ctx2.refresh();
          },
          onFind: (type) => findDefenseFor(ctx2, type)
        });
      }
      if (!over && adventurer.previousRunStats && prev) {
        const stats = adventurer.previousRunStats;
        return renderRunRecap(stats, false, {
          title: `Last run · ${prev.outcome}`,
          onDetails: () => {
            var _a3;
            ui2.recap = { title: `${adventurer.name} · ${((_a3 = quests[prev.questKey]) == null ? void 0 : _a3.name) ?? prev.questKey}`, subtitle: `Run ${prev.number}, ${prev.outcome}`, stats: JSON.parse(JSON.stringify(stats)) };
            ctx2.refresh();
          },
          onFind: (type) => findDefenseFor(ctx2, type)
        });
      }
      return null;
    })()
  ];
}
function renderRunPanel(ctx2) {
  var _a2, _b2;
  const { state: state2, ui: ui2 } = ctx2;
  const adventurer = ui2.runPanel ? currentHero(ctx2) : void 0;
  const run = adventurer == null ? void 0 : adventurer.run;
  if (!adventurer || !run) {
    return null;
  }
  const quest = quests[run.questKey];
  const activity = adventurer.activity;
  const fighting = activity.kind === "fighting" && activity.questKey === run.questKey ? activity.encounterIndex : -1;
  const last2 = quest.encounters.length - 1;
  const recoverCost = getRecoverCost(state2, adventurer);
  const track = runTrack(ctx2, adventurer);
  let outcome;
  const endlessBest = quest.endless ? ((_a2 = adventurer.endlessBest) == null ? void 0 : _a2[quest.endless.baseKey]) ?? -1 : -1;
  if (quest.endless && activity.kind !== "traveling") {
    const best = endlessBest >= 0 ? ` · ${adventurer.name}'s best: ${endlessBest + 1}` : "";
    outcome = (fighting >= 0 ? `Fighting endless encounter ${fighting + 1}` : run.defeatedAt !== void 0 ? `Defeated at endless encounter ${run.defeatedAt + 1}` : `Left after endless encounter ${run.cleared + 1}`) + best;
  } else if (activity.kind === "traveling" && activity.questKey === run.questKey) {
    outcome = "On the way to the first encounter";
  } else if (activity.kind === "fighting" && activity.boss) {
    outcome = `Fighting ${monsters[activity.boss].name}, an ambition boss`;
  } else if (run.bossEncounter === "pending") {
    outcome = `${monsters[quest.boss.monster].name} awaits after resting`;
  } else if (activity.kind === "fighting" && activity.bonus) {
    outcome = "Fighting a bonus rare encounter";
  } else if (run.bonusEncounter === "pending") {
    outcome = "A bonus rare encounter awaits after resting";
  } else if (fighting >= 0 && activity.kind === "fighting" && activity.ending !== void 0) {
    outcome = `Cleared encounter ${fighting + 1} of ${run.stopAt + 1}`;
  } else if (fighting >= 0) {
    outcome = `Fighting encounter ${fighting + 1} of ${run.stopAt + 1}`;
  } else if (run.defeatedAt !== void 0) {
    outcome = `Defeated at encounter ${run.defeatedAt + 1}`;
  } else if (run.cleared >= run.stopAt) {
    outcome = run.cleared === last2 ? "Cleared the whole quest" : `Reached the stopping point after encounter ${run.cleared + 1}`;
  } else {
    outcome = `Turned back after encounter ${run.cleared + 1}`;
  }
  const restRow = h(
    "div",
    { class: "row small", style: "flex-wrap:nowrap;min-height:28px" },
    // The track and the arena already show the fight, so this line is for resting and travel.
    h("span", { class: "grow oneline" }, activity.kind === "fighting" ? "" : activityText(state2, adventurer)),
    h("button", {
      class: "btn small",
      hidden: activity.kind !== "resting" || activity.remaining <= 0,
      disabled: activity.kind !== "resting" || state2.gold < recoverCost,
      onclick: () => {
        recoverInstantly(state2, adventurer);
        ctx2.refresh();
      }
    }, `Recover now (${recoverCost} gold)`)
  );
  return h(
    "section",
    { class: "runpanel", "aria-label": `${adventurer.name}'s run` },
    h(
      "div",
      { class: "row" },
      h(
        "div",
        { class: "grow" },
        h("strong", { class: "runtitle" }, `${adventurer.name} · ${quest.name}`),
        h("span", { class: "muted small" }, ` · run ${run.number}`),
        ((_b2 = run.modifiers) == null ? void 0 : _b2.length) ? h("span", { class: "muted small", title: run.modifiers.map((k) => {
          var _a3;
          return (_a3 = quest.modifiers.find((m) => m.key === k)) == null ? void 0 : _a3.name;
        }).join(", ") }, ` · ${run.modifiers.length} modifier${run.modifiers.length > 1 ? "s" : ""}`) : null
      ),
      h("button", { class: "btn small", onclick: () => {
        ui2.panel = { kind: "adventurer", id: adventurer.id };
        ctx2.refresh();
      } }, "Character"),
      adventurer.assignment ? h("button", { class: "btn small", onclick: () => {
        recall(state2, adventurer);
        ctx2.refresh();
      } }, "Recall") : null,
      h("button", { class: "btn small", "aria-label": "Close run panel", onclick: () => {
        ui2.runPanel = null;
        ctx2.refresh();
      } }, "×")
    ),
    h(
      "div",
      { class: "runcols" },
      h(
        "div",
        { class: "grow" },
        h("h3", null, "This run"),
        track,
        quest.endless ? h(
          "div",
          { class: "track-legend" },
          h("span", { class: "oneline" }, outcome)
        ) : null,
        ...runInfo(ctx2, adventurer)
      ),
      h(
        "div",
        { class: "runnow" },
        h("h3", null, "Now"),
        hpXpBars(state2, adventurer),
        h("div", { style: "margin-top:6px" }, restRow),
        // The combat view is a persistent element that main.ts moves in here.
        h("div", { class: "arena-slot", style: "margin-top:6px" })
      )
    )
  );
}
function isTwoHandedWielded(state2, adventurer) {
  const ref = adventurer.equipment.mainHand;
  const item = ref ? resolveItemRef(state2, ref) : void 0;
  return !!item && !!itemTypes[item.itemType].twoHanded;
}
function renderRecapPanel(ctx2) {
  const recap = ctx2.ui.recap;
  if (!recap) return null;
  return h(
    "section",
    { class: "panel picker recappanel", "aria-label": "Run recap" },
    h(
      "div",
      { class: "panel-head" },
      h(
        "div",
        { class: "grow" },
        h("h2", null, "Run recap"),
        h("div", { class: "muted small" }, `${recap.title} · ${recap.subtitle}`)
      ),
      h("button", { class: "btn", onclick: () => {
        ctx2.ui.recap = null;
        ctx2.refresh();
      } }, "Close")
    ),
    h("div", { class: "panel-body" }, renderRunRecap(recap.stats, true, { onFind: (type) => findDefenseFor(ctx2, type), previous: recap.previous }))
  );
}
function damageBar(damage, label, total, extra, onType) {
  const types = Object.keys(damageLabels).filter((t) => (damage[t] ?? 0) > 0);
  const share = (t) => (damage[t] ?? 0) / Math.max(1e-9, total);
  return h(
    "div",
    { class: "recapdmg" },
    h(
      "div",
      { class: "row small" },
      h("span", { class: "grow" }, h("strong", null, label), ` ${fmt(total)}`),
      h("span", { class: "muted" }, extra)
    ),
    h(
      "div",
      { class: "dmgbar", role: "img", "aria-label": types.map((t) => `${damageLabels[t]} ${fmt(share(t) * 100)}%`).join(", ") || "none" },
      ...types.map((t) => h("span", { class: t, style: `width:${100 * share(t)}%` }))
    ),
    h(
      "div",
      { class: "dmglegend small muted" },
      ...types.map((t) => onType ? h("button", { class: "dmgfind", title: `Show materials with ${t === "physical" ? "armor" : `${t} resistance`}`, onclick: () => onType(t) }, h("i", { class: t }), `${damageLabels[t]} ${fmt(share(t) * 100)}%`) : h("span", null, h("i", { class: t }), `${damageLabels[t]} ${fmt(share(t) * 100)}%`))
    )
  );
}
function findDefenseFor(ctx2, type) {
  const { ui: ui2, state: state2 } = ctx2;
  const bench = ui2.bench;
  const family = type === "physical" ? "armor" : resistStat[type];
  if (!bench.base.length) {
    bench.itemType = "bodyArmor";
    bench.decorations = [];
  }
  ui2.benchOpen = true;
  ui2.picker = { kind: "base", index: Math.min(bench.base.length, Math.max(0, getBaseLimit(state2, bench.itemType) - 1)) };
  ui2.statFilters = [family];
  ctx2.refresh();
}
function renderRunRecap(stats, full, opts = {}) {
  const { onDetails, onFind, previous } = opts;
  const sum = (d) => Object.values(d).reduce((a, b) => a + (b ?? 0), 0);
  const pct2 = (n, d) => d > 0 ? `${fmt(100 * n / d)}%` : "-";
  const dealt = sum(stats.dealt), taken = sum(stats.taken);
  const secs = Math.max(1, stats.fightSeconds);
  const healed = stats.healed.regen + stats.healed.leech + stats.healed.onHit + stats.healed.encounter;
  const physicalIn = (stats.taken.physical ?? 0) + stats.preventedArmor;
  const healParts = [["regen", stats.healed.regen], ["leech", stats.healed.leech], ["on hit", stats.healed.onHit], ["per enc", stats.healed.encounter]].filter(([, v]) => v >= 0.5).map(([k, v]) => `${k} ${fmt(v)}`).join(" · ");
  const bars = [
    damageBar(stats.dealt, "Dealt", dealt, `${fmt(dealt / secs, 1)}/s · ${stats.kills} kill${stats.kills === 1 ? "" : "s"}`),
    damageBar(stats.taken, "Taken", taken, `${fmt(taken / secs, 1)}/s${stats.wardAbsorbed >= 0.5 ? ` · ${fmt(stats.wardAbsorbed)} by ward` : ""}`, onFind)
  ];
  if (onFind && full) bars.push(h("div", { class: "muted small" }, "Click a damage type you took to find materials that defend against it."));
  if (!full) {
    return h(
      "div",
      { class: "recap" },
      h(
        "div",
        { class: "row" },
        h("h3", { class: "grow oneline" }, opts.title ?? "Run recap"),
        onDetails ? h("button", { class: "btn small", onclick: onDetails }, "View recap details") : null
      ),
      ...bars
    );
  }
  return h(
    "div",
    { class: "recap full" },
    ...bars,
    h(
      "div",
      { class: "statgrid small recapgrid" },
      h("div", { title: "Attacks that landed at least one hit, out of all your attacks. A multihit counts once." }, h("span", null, "Hit rate"), h("span", { class: "num" }, pct2(stats.attacksLanded, stats.attacks))),
      h("div", { title: "Average hits for each attack that landed." }, h("span", null, "Hits per landed attack"), h("span", { class: "num" }, stats.attacksLanded ? fmt(stats.hits / stats.attacksLanded, 2) : "-")),
      h("div", { title: "Hits that crit, out of all hits." }, h("span", null, "Crit rate"), h("span", { class: "num" }, pct2(stats.crits, stats.hits))),
      h("div", { title: "Monster attacks that missed entirely, out of all their attacks. A monster multihit stops at its first miss, so this counts whole attacks." }, h("span", null, "Evaded"), h("span", { class: "num" }, pct2(stats.attacksDodged, stats.incomingAttacks))),
      h("div", { title: "Monster hits blocked, out of all hits that got past evasion." }, h("span", null, "Blocked"), h("span", { class: "num" }, pct2(stats.blocks, stats.incomingHits))),
      h("div", { title: "Physical damage armor stopped, and its share of the physical damage aimed at you." }, h("span", null, "Armor prevented"), h("span", { class: "num" }, `${fmt(stats.preventedArmor)} (${pct2(stats.preventedArmor, physicalIn)})`)),
      stats.preventedResist >= 0.5 ? h("div", null, h("span", null, "Resist prevented"), h("span", { class: "num" }, fmt(stats.preventedResist))) : null,
      stats.preventedBlock >= 0.5 ? h("div", null, h("span", null, "Block prevented"), h("span", { class: "num" }, fmt(stats.preventedBlock))) : null,
      stats.reflected ? h("div", { title: `Reflection sends ${Math.round(REFLECT_SHARE * 100)}% of each hit you land back at you, after the monster's armor and resistances. Your evasion, block, armor and resistances then apply. Damage before ward.` }, h("span", null, "Reflected at you"), h("span", { class: "num" }, `${fmt(stats.reflected.taken)} · ${stats.reflected.hits} hits`)) : null,
      h("div", { title: healParts }, h("span", null, "Healed"), h("span", { class: "num" }, fmt(healed))),
      stats.wardGained >= 0.5 ? h("div", { title: "Ward refilled during fights, from kills or HP lost." }, h("span", null, "Ward regained"), h("span", { class: "num" }, fmt(stats.wardGained))) : null,
      h("div", null, h("span", null, "Lowest HP"), h("span", { class: "num" }, `${fmt(100 * stats.lowestHp)}%`)),
      h("div", null, h("span", null, "Time fighting"), h("span", { class: "num" }, `${fmt(stats.fightSeconds)}s`))
    ),
    healParts ? h("div", { class: "muted small" }, `Healing: ${healParts}`) : null,
    stats.takenBy && taken > 0 ? h(
      "div",
      null,
      h("h3", null, "Damage taken by monster type"),
      h("div", { class: "statgrid small recapgrid" }, ...Object.entries(stats.takenBy).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([key, v]) => {
        var _a2;
        return h("div", null, h("span", null, key === REFLECT_SOURCE ? "Your reflected hits" : ((_a2 = monsters[key]) == null ? void 0 : _a2.name) ?? key), h("span", { class: "num" }, `${fmt(v)} (${pct2(v, taken)})`));
      }))
    ) : null,
    stats.takenByEncounter && taken > 0 ? h(
      "div",
      null,
      h("h3", null, "Damage taken per encounter"),
      h("div", { class: "statgrid small recapgrid encgrid" }, ...Object.entries(stats.takenByEncounter).map(([label, e]) => ({ label, ...typeof e === "number" ? { taken: e, seconds: 0 } : e })).sort((a, b) => b.taken - a.taken).slice(0, 4).map(({ label, taken: v, seconds }) => h("div", null, h("span", { title: label }, label), h(
        "span",
        { class: "num" },
        `${fmt(v)} (${pct2(v, taken)})${seconds > 0 ? ` · ${fmt(seconds, 1)}s · ${fmt(v / seconds, 1)}/s` : ""}`
      ))))
    ) : null,
    previous ? (() => {
      const pSecs = Math.max(1, previous.fightSeconds);
      const change = (now, before) => before > 0 ? `${now >= before ? "+" : ""}${fmt(100 * (now - before) / before)}%` : "-";
      return h(
        "div",
        null,
        h("h3", null, "Against the run before"),
        h(
          "div",
          { class: "statgrid small recapgrid" },
          h("div", null, h("span", null, "Damage dealt per second"), h("span", { class: "num" }, change(dealt / secs, sum(previous.dealt) / pSecs))),
          h("div", null, h("span", null, "Damage taken per second"), h("span", { class: "num" }, change(taken / secs, sum(previous.taken) / pSecs))),
          h("div", null, h("span", null, "Hit rate"), h("span", { class: "num" }, `${pct2(previous.attacksLanded, previous.attacks)} → ${pct2(stats.attacksLanded, stats.attacks)}`)),
          h("div", null, h("span", null, "Evaded"), h("span", { class: "num" }, `${pct2(previous.attacksDodged, previous.incomingAttacks)} → ${pct2(stats.attacksDodged, stats.incomingAttacks)}`))
        )
      );
    })() : null
  );
}
function statRow(label, value) {
  return h("div", null, h("span", null, label), h("span", { class: "num" }, typeof value === "number" ? num(value) : value));
}
function pickerShell(ctx2, title, subtitle, label, onClose, ...body) {
  return h(
    "section",
    { class: "panel right gearpick", "aria-label": label },
    h(
      "div",
      { class: "panel-head" },
      h("div", { class: "grow" }, h("h2", null, title), h("div", { class: "muted small" }, subtitle)),
      h("button", { class: "btn", "aria-label": `Close ${label.toLowerCase()}`, onclick: () => {
        onClose();
        ctx2.refresh();
      } }, "Close")
    ),
    h("div", { class: "panel-body" }, ...body)
  );
}
function trophyPicker(ctx2) {
  const { state: state2, ui: ui2 } = ctx2;
  const picking = ui2.trophyPick;
  const slots = state2.guild.trophySlots ?? 0;
  if (picking === null || picking === void 0 || picking >= slots) return null;
  const earned = trophyList.filter((def) => {
    var _a2;
    return (((_a2 = state2.trophies) == null ? void 0 : _a2[def.key]) ?? -1) >= 0;
  });
  const equipped = state2.trophySlots ?? [];
  const close = () => {
    ui2.trophyPick = null;
  };
  return pickerShell(
    ctx2,
    `Trophy slot ${picking + 1}`,
    "Its bonus applies to every member while it sits in a slot.",
    "Trophy picker",
    close,
    earned.length ? h(
      "div",
      { class: "list" },
      ...earned.map((def) => {
        const tier = state2.trophies[def.key];
        const at = equipped.indexOf(def.key);
        return h("button", {
          class: "item" + (at === picking ? " selected" : at >= 0 ? " used" : ""),
          "data-guide": "trophy",
          title: at >= 0 && at !== picking ? `Already in slot ${at + 1}. Choosing it moves it here.` : void 0,
          onclick: () => {
            equipTrophy(state2, picking, def.key);
            close();
            ctx2.refresh();
          }
        }, h(
          "span",
          { class: "grow" },
          h("div", null, trophyTierLabel(def, tier), at === picking ? h("span", { class: "usedtag" }, " In this slot") : at >= 0 ? h("span", { class: "usedtag" }, ` In slot ${at + 1} · moves here`) : null),
          h("div", { class: "mods" }, def.bonusText(def.tiers[tier].bonus)),
          h("div", { class: "mods muted" }, `Earned: ${earnedText(def, tier)}`)
        ));
      })
    ) : h("p", { class: "muted small" }, "No trophies earned yet."),
    equipped[picking] ? h(
      "div",
      { class: "row", style: "margin-top:8px" },
      h("button", { class: "btn small", onclick: () => {
        equipTrophy(state2, picking, null);
        close();
        ctx2.refresh();
      } }, "Empty this slot")
    ) : null
  );
}
function renderGearPanel(ctx2) {
  const { ui: ui2 } = ctx2;
  const panel = ui2.panel;
  if ((panel == null ? void 0 : panel.kind) === "guild") {
    return trophyPicker(ctx2);
  }
  if ((panel == null ? void 0 : panel.kind) !== "adventurer" || !ui2.selectedSlot) {
    return null;
  }
  const adventurer = currentHero(ctx2);
  if (!adventurer) {
    return null;
  }
  const slot = ui2.selectedSlot;
  return pickerShell(
    ctx2,
    slotNames[slot],
    `For ${adventurer.name}, level ${adventurer.level}`,
    "Gear picker",
    () => {
      ui2.selectedSlot = null;
    },
    slotChooser(ctx2, adventurer, slot)
  );
}
function hasFreeGear(state2, adventurer, slot) {
  return state2.craftedItems.some((item) => {
    const ref = { kind: "crafted", id: item.id };
    return !isItemEquipped(state2, item.id) && canEquipInSlot(state2, adventurer, ref, slot, true) && adventurer.level >= itemLevelRequirement(state2, ref);
  });
}
function slotChooser(ctx2, adventurer, slot) {
  var _a2;
  const { state: state2 } = ctx2;
  const options = [];
  for (const item of state2.craftedItems) {
    const ref = { kind: "crafted", id: item.id };
    const wearer = isItemEquipped(state2, item.id);
    if (wearer || !canEquipInSlot(state2, adventurer, ref, slot, true)) {
      continue;
    }
    options.push({ ref, name: item.name, stats: getCraftedItemStats(item), note: itemTypes[item.itemType].name });
  }
  for (const key of materialOrder) {
    const ref = { kind: "material", key };
    if ((state2.materials[key] ?? 0) < 1 || !requireMaterial(key).equip || !canEquipInSlot(state2, adventurer, ref, slot, true)) {
      continue;
    }
    const resolved = resolveItemRef(state2, ref);
    options.push({ ref, name: resolved.name, stats: resolved.stats, note: `${requireMaterial(key).name} worn directly · ${state2.materials[key]} owned` });
  }
  const current = adventurer.equipment[slot];
  const craftType = !hasBench(state2) || slot === "offHand" && isTwoHandedWielded(state2, adventurer) ? void 0 : slot === "offHand" ? "shield" : itemTypeOrder.find((key) => itemTypes[key].slots.includes(slot));
  return h(
    "div",
    null,
    h(
      "div",
      { class: "row" },
      h("h3", { class: "grow", style: "margin:0" }, "Options"),
      craftType ? h("button", { class: "btn small", onclick: () => {
        const bench = ctx2.ui.bench;
        bench.itemType = craftType;
        bench.base = bench.base.filter((m) => getBaseStats(requireMaterial(m), craftType));
        ctx2.ui.benchOpen = true;
        if (matchMedia("(max-width: 760px)").matches) {
          ctx2.ui.panel = null;
          ctx2.ui.picker = null;
          ctx2.ui.shopOpen = false;
          ctx2.ui.materialDetail = null;
        }
        ctx2.refresh();
      } }, "+ Craft new") : null
    ),
    h(
      "div",
      { class: "list", style: "margin-top:6px" },
      current ? h(
        "div",
        { class: "row" },
        h("span", { class: "grow small muted" }, "Currently wearing " + (((_a2 = resolveItemRef(state2, current)) == null ? void 0 : _a2.name) ?? "an item")),
        h("button", { class: "btn small", onclick: () => {
          unequip(state2, adventurer, slot);
          ctx2.refresh();
        } }, "Take off")
      ) : null,
      options.length ? options.map((option) => {
        const crafted = option.ref.kind === "crafted" ? state2.craftedItems.find((c) => c.id === option.ref.id) : void 0;
        const pick2 = h(
          "button",
          {
            class: "item" + (crafted ? " grow" : ""),
            "data-guide": crafted && adventurer.level >= itemLevelRequirement(state2, option.ref) ? "equip" : void 0,
            id: option.ref.kind === "material" ? "gearopt-" + option.ref.key : void 0,
            disabled: adventurer.level < itemLevelRequirement(state2, option.ref),
            onclick: () => {
              if (equip(state2, adventurer, option.ref, slot)) {
                ctx2.ui.selectedSlot = null;
                state2.guide = { ...state2.guide, manualEquip: true };
              }
              ctx2.refresh();
            }
          },
          h("span", { class: "rowart" }, crafted ? itemArt(crafted.itemType, crafted.base) : option.ref.kind === "material" ? materialIcon(option.ref.key, "typeart") : null),
          h(
            "span",
            { class: "grow" },
            h(
              "div",
              null,
              option.name,
              h("span", { class: "muted small" }, " · " + option.note),
              levelTag(itemLevelRequirement(state2, option.ref), adventurer.level)
            ),
            h("div", { class: "mods" }, itemStatsText(option.stats)),
            deltaLine(state2, adventurer, slot, option.ref)
          )
        );
        const recraft = crafted ? recipeButton(ctx2, crafted) : null;
        return recraft ? h("div", { class: "row memberrow equiprow" }, pick2, recraft) : pick2;
      }) : h("div", { class: "muted small" }, slot === "offHand" && isTwoHandedWielded(state2, adventurer) ? "Two-handed weapons use both hands." : hasBench(state2) ? "Nothing fits this slot yet. Craft one at the crafting bench." : "Nothing fits this slot yet. The merchant sells gear."),
      hasBench(state2) ? null : h("button", { class: "btn small", onclick: () => {
        ctx2.ui.selectedSlot = null;
        ctx2.ui.benchOpen = false;
        ctx2.ui.shopOpen = true;
        ctx2.refresh();
      } }, "Visit the merchant")
    )
  );
}
function shopPanel(ctx2) {
  var _a2, _b2;
  const { state: state2 } = ctx2;
  const hero = currentHero(ctx2);
  const benchCard = hasBench(state2) ? null : h(
    "div",
    { class: "shopbench" },
    h(
      "div",
      { class: "grow" },
      h("div", null, h("strong", null, "Crafting bench")),
      h("div", { class: "small muted" }, "Make your own gear from the materials your heroes bring back, built for exactly what you need.")
    ),
    h("button", {
      class: "btn primary",
      "data-guide": "bench",
      disabled: state2.gold < BENCH_PRICE,
      title: state2.gold < BENCH_PRICE ? `Needs ${BENCH_PRICE} gold` : void 0,
      onclick: () => {
        if (buyBench(state2)) {
          ctx2.ui.shopOpen = false;
          ctx2.ui.benchOpen = true;
        }
        ctx2.refresh();
      }
    }, `Buy · ${BENCH_PRICE} gold`)
  );
  if (!hero) {
    return panelShell(ctx2, "left", "Merchant", "Ready-made gear", benchCard, h("div", { class: "muted small" }, "Hire a member to see gear for them."));
  }
  const stock = shopStock(state2, hero);
  const refresh = shopRefreshCost(state2, hero);
  const canEquip = !!(((_a2 = state2.guide) == null ? void 0 : _a2.manualEquip) || ((_b2 = state2.guide) == null ? void 0 : _b2.crafted));
  const now = performance.now();
  const arrivals = trackShopArrivals(hero.id, stock, now);
  if (stock.some((o) => o == null ? void 0 : o.sold) && !shopRestockTimer) {
    const heroId = hero.id;
    shopRestockTimer = window.setTimeout(() => {
      shopRestockTimer = 0;
      const who = ctx2.state.adventurers.find((a) => a.id === heroId);
      if (who && restockSold(ctx2.state, who)) ctx2.refresh();
    }, SHOP_SOLD_MS);
  }
  const guarded = (index) => {
    const a = shopSeen == null ? void 0 : shopSeen.arrivals[index];
    return !!a && performance.now() < a.start + SHOP_SLIDE_MS + SHOP_GUARD_MS;
  };
  const buy = (index, slot) => {
    if (guarded(index)) return;
    const bought = buyShopItem(state2, hero, index);
    if (typeof bought === "string") ctx2.toast(bought);
    else if (slot) equip(state2, hero, { kind: "crafted", id: bought.id }, slot);
    if (ctx2.ui.shopDetail === index) ctx2.ui.shopDetail = null;
    ctx2.refresh();
  };
  const need = (offer) => levelForPower(Math.max(1, ...offer.base.map((k) => requireMaterial(k).power)));
  const asItem = (offer) => ({ id: "offer", itemType: offer.itemType, name: offer.name, base: offer.base, decorations: offer.decorations, power: offer.power });
  const card = (offer, index, extra = "") => {
    if (!offer) return h("div", { class: "shopcard empty" + extra }, h("div", { class: "muted small" }, "Nothing here right now."));
    const item = asItem(offer);
    const lv = need(offer);
    const affordable = state2.gold >= offer.price && hero.level >= lv;
    const best = offer.sold ? null : bestDelta(state2, hero, itemTypes[offer.itemType].slots, item);
    const buttons = offer.sold ? [h("span", { class: "soldtag" }, `Sold · ${offer.price}g`)] : [
      canEquip && best ? h("button", {
        class: "btn small primary",
        "data-guide": affordable ? "buy" : void 0,
        disabled: state2.gold < offer.price || hero.level < lv,
        title: hero.level < lv ? `${hero.name} needs level ${lv}` : state2.gold < offer.price ? `Needs ${offer.price} gold` : `Buy for ${offer.price} gold and equip in ${hero.name}'s ${slotNames[best.slot].toLowerCase()}`,
        onclick: (ev) => {
          ev.stopPropagation();
          buy(index, best.slot);
        }
      }, `Buy + equip · ${offer.price}g`) : null,
      h("button", {
        class: "btn small" + (canEquip ? "" : " primary"),
        "data-guide": affordable && !canEquip ? "buy" : void 0,
        disabled: state2.gold < offer.price,
        title: state2.gold < offer.price ? `Needs ${offer.price} gold` : `Buy for ${offer.price} gold`,
        onclick: (ev) => {
          ev.stopPropagation();
          buy(index);
        }
      }, canEquip ? "Buy" : `Buy · ${offer.price}g`)
    ];
    return h(
      "div",
      {
        class: "shopcard" + (offer.sold ? " sold" : "") + extra,
        role: offer.sold ? void 0 : "button",
        tabindex: offer.sold ? void 0 : "0",
        title: offer.sold ? void 0 : "Show details",
        onclick: offer.sold ? void 0 : () => {
          if (!guarded(index)) {
            ctx2.ui.shopDetail = index;
            ctx2.refresh();
          }
        }
      },
      h("span", { class: "rowart" }, itemArt(offer.itemType, offer.base)),
      h(
        "div",
        { class: "shopinfo" },
        h("div", { class: "line name" }, offer.name, h("span", { class: "muted" }, ` · ${itemTypes[offer.itemType].name}`), levelTag(lv, hero.level)),
        h("div", { class: "line mods" }, itemStatsText(getCraftedItemStats(item))),
        h(
          "div",
          { class: "line mats" },
          ...offer.base.map((k) => h("span", { class: "maticon", title: requireMaterial(k).name }, materialIcon(k))),
          ...offer.decorations.length ? [h("span", { class: "matsep", "aria-hidden": "true" }, "·"), ...offer.decorations.map((k) => h("span", { class: "maticon", title: `${requireMaterial(k).name} (decoration)` }, materialIcon(k)))] : []
        ),
        best ? best.el : h("div", { class: "line" })
      ),
      h("div", { class: "shopacts" }, ...buttons)
    );
  };
  const slots = stock.map((offer, index) => {
    const a = arrivals[index];
    if (!a) return h("div", { class: "shopslot" }, card(offer, index));
    const el = card(offer, index, " arrive");
    el.style.animationDelay = `${Math.round(a.start - now)}ms`;
    return h("div", { class: "shopslot" }, a.prev ? card(a.prev, index, " under") : null, el);
  });
  const detailIndex = ctx2.ui.shopDetail;
  const detailOffer = detailIndex != null ? stock[detailIndex] : null;
  if (detailIndex != null && (!detailOffer || detailOffer.sold)) ctx2.ui.shopDetail = null;
  const closeDetail = () => {
    ctx2.ui.shopDetail = null;
    ctx2.refresh();
  };
  const detail2 = detailOffer && !detailOffer.sold && detailIndex != null ? (() => {
    const offer = detailOffer, item = asItem(offer), lv = need(offer);
    let placed = false;
    const deltas = deltaLines(state2, hero, itemTypes[offer.itemType].slots, item, (slot) => {
      if (!canEquip) return null;
      const btn = h("button", {
        class: "btn small primary",
        disabled: state2.gold < offer.price || hero.level < lv,
        title: hero.level < lv ? `${hero.name} needs level ${lv}` : `Buy for ${offer.price} gold and equip in ${hero.name}'s ${slotNames[slot].toLowerCase()}`,
        onclick: () => buy(detailIndex, slot)
      }, `Buy + equip · ${offer.price}g`);
      placed = true;
      return btn;
    });
    return h(
      "div",
      { class: "shoppop-back", onclick: (ev) => {
        if (ev.target === ev.currentTarget) closeDetail();
      } },
      h(
        "div",
        { class: "shoppop", role: "dialog", "aria-label": offer.name },
        h(
          "div",
          { class: "row" },
          h("span", { class: "rowart" }, itemArt(offer.itemType, offer.base)),
          h("div", { class: "grow" }, h("strong", null, offer.name), h("span", { class: "muted small" }, ` · ${itemTypes[offer.itemType].name}`), levelTag(lv, hero.level)),
          h("button", { class: "dropclose soldclose", "aria-label": "Close", title: "Close", onclick: closeDetail }, "×")
        ),
        h("div", { class: "mods" }, itemStatsText(getCraftedItemStats(item))),
        h("div", { class: "mods" }, "Made from ", ...madeFromList(ctx2, offer.base, offer.decorations)),
        deltas,
        h(
          "div",
          { class: "row", style: "margin-top:8px;justify-content:flex-end" },
          h("button", { class: "btn small" + (placed ? "" : " primary"), disabled: state2.gold < offer.price, onclick: () => buy(detailIndex) }, `Buy · ${offer.price}g`)
        )
      )
    );
  })() : null;
  return panelShell(
    ctx2,
    "left",
    "Merchant",
    `Gear for ${hero.name}, level ${hero.level} ${classes[hero.classKey].name}`,
    benchCard,
    h(
      "div",
      { class: "shopwrap" },
      h(
        "div",
        { class: "row" },
        h("h3", { class: "grow", style: "margin:0" }, `For ${hero.name}`),
        h("button", {
          class: "btn small",
          disabled: state2.gold < refresh,
          title: refresh ? `Replace every item for ${refresh} gold` : `Free: ${hero.name} leveled up while you were browsing, so this restock costs nothing`,
          onclick: () => {
            refreshShop(state2, hero);
            ctx2.ui.shopDetail = null;
            ctx2.refresh();
          }
        }, refresh ? `New stock · ${refresh} gold` : "New stock · free")
      ),
      h("p", { class: "muted small", style: "margin:4px 0 6px" }, `Each member gets their own stock, scaled to their level and leaning on their class's stats. A bought item is replaced a moment later. Tap an item for details. Pick a member at the top to see their stock.`),
      h("div", { class: "list shoplist" }, ...slots),
      detail2
    )
  );
}
const SHOP_SOLD_MS = 1500, SHOP_SLIDE_MS = 350, SHOP_STAGGER_MS = 90, SHOP_GUARD_MS = 500;
let shopRestockTimer = 0;
let shopSeen = null;
function trackShopArrivals(heroId, stock, now) {
  const id = (o) => o ? [o.itemType, o.name, ...o.base, "|", ...o.decorations, o.price].join(",") : "-";
  const keys = stock.map(id);
  if (!shopSeen || shopSeen.heroId !== heroId || now - shopSeen.seenAt > 1500) {
    shopSeen = { heroId, keys, offers: stock.map((o) => o ? { ...o } : null), seenAt: now, arrivals: {} };
  } else {
    let n = 0;
    keys.forEach((k, i) => {
      if (k !== shopSeen.keys[i]) shopSeen.arrivals[i] = { start: now + SHOP_STAGGER_MS * n++, prev: shopSeen.offers[i] };
    });
    shopSeen.keys = keys;
    shopSeen.offers = stock.map((o) => o ? { ...o } : null);
    shopSeen.seenAt = now;
  }
  for (const [i, a] of Object.entries(shopSeen.arrivals)) if (now > a.start + SHOP_SLIDE_MS + SHOP_GUARD_MS) delete shopSeen.arrivals[Number(i)];
  const live = {};
  for (const [i, a] of Object.entries(shopSeen.arrivals)) if (now < a.start + SHOP_SLIDE_MS) live[Number(i)] = a;
  return live;
}
function clock(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
function peddlerPanel(ctx2) {
  const { state: state2 } = ctx2;
  const p = state2.peddler;
  const here = peddlerHere(state2);
  const subtitle = !p ? `Visits after the first full clear of ${quests[PEDDLER_UNLOCK.slice(6)].name}` : here ? `Here for another ${clock(p.leavesAt - state2.time)}` : `Away · back in ${clock(p.nextVisit - state2.time)}`;
  const holds = (p == null ? void 0 : p.stock.filter((o) => o.held && !o.sold).length) ?? 0;
  const nextHold = holdCost(state2);
  const offers = ((p == null ? void 0 : p.stock) ?? []).map((offer, index) => ({ offer, index })).filter(({ offer }) => here || offer.held);
  const tierTag = (offer) => isPremium(offer.material) ? `Premium ${tierNames$1[offer.tier].toLowerCase()}` : tierNames$1[offer.tier];
  return shell(
    ctx2,
    "Travelling peddler",
    subtitle,
    h(
      "p",
      { class: "muted small", style: "margin:0 0 8px" },
      `Stays for ${VISIT_SECONDS / 60} minutes, or until sold out, and comes back ${VISIT_GAP[0] / 60} to ${VISIT_GAP[1] / 60} minutes of play after leaving. Sells one of each material from the quests you have unlocked, including ones you haven't found. Materials found fewer than ${RARE_FOUND} times cost 50% more. Hold an offer to keep it for the next visit: the first hold costs ${HOLD_BASE} gold and each one after doubles. Releasing is free.`
    ),
    offers.length ? h("div", { class: "list" }, ...offers.map(({ offer, index }) => {
      const m = requireMaterial(offer.material);
      const price = offerPrice(state2, offer);
      const found = state2.obtained[offer.material] ?? 0;
      return h("div", { class: "craftedrow" + (offer.sold ? " sold" : "") }, h(
        "div",
        { class: "row small" },
        h(
          "div",
          { class: "grow" },
          h("div", null, materialLink(ctx2, offer.material)),
          h("div", { class: "mods" }, `${tierTag(offer)} · power ${m.power} · ${found} found · ${state2.materials[offer.material] ?? 0} owned` + (offer.held ? here ? " · held" : " · held for the next visit" : ""))
        ),
        offer.sold ? h("span", { class: "muted" }, "Sold") : null,
        offer.sold ? null : offer.held ? h("button", { class: "btn small", title: here ? "Stop holding it; it can be replaced on the next visit" : "Stop holding it; the peddler is away, so it leaves the stock now", onclick: () => {
          releaseOffer(state2, index);
          ctx2.refresh();
        } }, "Release") : h("button", {
          class: "btn small",
          disabled: state2.gold < nextHold,
          title: state2.gold < nextHold ? `Needs ${nextHold} gold` : `Keep it in stock for the next visit, for ${nextHold} gold`,
          onclick: () => {
            const err = holdOffer(state2, index);
            if (err) ctx2.toast(err);
            ctx2.refresh();
          }
        }, `Hold · ${nextHold}g`),
        offer.sold || !here ? null : h("button", {
          class: "btn small primary",
          disabled: !here || state2.gold < price,
          title: !here ? "The peddler is away" : state2.gold < price ? `Needs ${price} gold` : `Buy for ${price} gold`,
          onclick: () => {
            const err = buyOffer(state2, index);
            if (err) ctx2.toast(err);
            ctx2.refresh();
          }
        }, `Buy · ${price}g`)
      ));
    })) : h("div", { class: "muted small" }, here ? "Sold out." : "Nothing held for the next visit."),
    holds ? h("p", { class: "muted small", style: "margin:8px 0 0" }, `${holds} held. The next hold costs ${nextHold} gold.`) : null
  );
}
function bossMechanics(quest) {
  const keys = [...new Set(quest.encounters.flatMap((e) => e.monsters))];
  const out = [];
  for (const key of keys) {
    const m = monsters[key];
    if (m.shatter) {
      const at = m.shatter.at.map((x) => `${Math.round(100 * x)}%`).join(", ").replace(/, ([^,]*)$/, " and $1");
      out.push(h("div", null, h("strong", null, `${m.name}: Shatter. `), `At ${at} life, ${m.shatter.count} ${monsters[m.shatter.shard].name}s rise in front of him, and he takes ${Math.round(100 * m.shatter.damageTaken)}% damage until they fall.`));
    }
    if (m.risingWill) {
      out.push(h("div", null, h("strong", null, `${m.name}: Rising will. `), `Every ${m.risingWill.every} seconds of the fight his damage and attack speed grow by ${Math.round(100 * m.risingWill.growth)}%${m.risingWill.heal ? `, and he heals ${Math.round(100 * m.risingWill.heal)}% of his life` : ""}.`));
    }
  }
  return out;
}
function areaRules(quest, state2) {
  var _a2;
  if (quest.portal && state2) {
    const left = portalSecondsLeft(state2);
    return h("div", { class: "arearules" }, ...bossMechanics(quest), left > 0 ? h("div", null, h("strong", null, "Portal open. "), `It closes in ${clock(left)} of play, and everyone here is recalled. Completing the Oracle's Rite in the Sundered Sanctum again adds ${PORTAL_SECONDS / 60} minutes.`) : h("div", null, h("strong", null, "Portal closed. "), "Complete the Oracle's Rite in the Sundered Sanctum to open it."));
  }
  if (!((_a2 = quest.rules) == null ? void 0 : _a2.length)) return null;
  return h("div", { class: "arearules" }, ...quest.rules.map((r) => h("div", null, h("strong", null, ruleInfo[r].name + ". "), ruleInfo[r].text)));
}
function availableQuests(state2) {
  return questOrder.filter((k) => !quests[k].endless && quests[k].mapPosition && (isQuestUnlocked(state2, k) || isQuestUnlocked(state2, endlessKey(k))));
}
function questNav(ctx2, questKey, panel) {
  const list2 = availableQuests(ctx2.state);
  const at = list2.indexOf(questKey);
  const step = (d) => {
    const from = at < 0 ? 0 : at;
    ctx2.ui.panel = { kind: "quest", key: list2[(from + d + list2.length) % list2.length] };
    ctx2.refresh();
  };
  const off = list2.length < 2;
  const title = panel.querySelector(".panel-head h2");
  if (title) {
    const row = h(
      "div",
      { class: "questnav" },
      h("button", { class: "btn small navbtn", disabled: off, "aria-label": "Previous quest", title: "Previous quest", onclick: () => step(-1) }, "<"),
      title.cloneNode(true),
      h("button", { class: "btn small navbtn", disabled: off, "aria-label": "Next quest", title: "Next quest", onclick: () => step(1) }, ">")
    );
    title.replaceWith(row);
  }
  return panel;
}
function questPanel(ctx2, questKey) {
  var _a2, _b2;
  const { state: state2, ui: ui2 } = ctx2;
  const quest = quests[questKey];
  const progress = getQuestProgress(state2, questKey);
  const unlocked = isQuestUnlocked(state2, questKey);
  const hero = currentHero(ctx2);
  const heroMods = getActiveModifiers(state2, hero, quest);
  const bossKnown = !!quest.boss && (!!progress.bossFought || (state2.obtained[quest.boss.legendary] ?? 0) > 0);
  const selected = Math.min(ui2.selectedEncounter[questKey] ?? 0, quest.encounters.length - (bossKnown ? 0 : 1));
  const endlessQuest = quests[endlessKey(questKey)];
  const endlessOpen = !!endlessQuest && isQuestUnlocked(state2, endlessQuest.key);
  if (!unlocked && endlessOpen) {
    return shell(
      ctx2,
      `${quest.name}: Endless`,
      "The portal is closed, but Endless stays open: it gives no items, gold or XP, and only records depth. Complete the Oracle's Rite in the Sundered Sanctum to reopen the portal for normal runs.",
      hero ? h("div", { class: "forhero muted small" }, `For ${hero.name}, level ${hero.level} ${classes[hero.classKey].name} · ${activityText(state2, hero)}`) : null,
      ...endlessBody(ctx2, quest, hero)
    );
  }
  if (!unlocked) {
    return questNav(ctx2, questKey, shell(
      ctx2,
      quest.name,
      "Locked",
      h("p", null, quest.description),
      quest.portal ? areaRules(quest, state2) : h("p", null, !unlockMet(state2.achievements, quest) ? `Opens after the first full clear of ${unlockQuestNames(quest)}.` : `Unlocks at ${quest.fameToUnlock} fame. You have ${state2.fame}. Clearing quests earns trophies, and trophies grant fame.`)
    ));
  }
  const track = h(
    "div",
    null,
    h("h3", null, "Encounters"),
    h(
      "div",
      { class: "track" },
      ...quest.encounters.map((encounter, i) => h("button", {
        class: [
          "enc",
          encounter.tier,
          i <= progress.bestEncounter ? "cleared" : "",
          i === selected ? "selected" : ""
        ].filter(Boolean).join(" "),
        title: `Encounter ${i + 1} · ${tierNames$1[encounter.tier]}` + (progress.seen.includes(i) ? encounterThreats(quest, i, heroMods).map((t) => " · " + t.label).join("") : ""),
        "aria-label": `Encounter ${i + 1}, ${tierNames$1[encounter.tier]}`,
        onclick: () => {
          ui2.selectedEncounter[questKey] = i;
          ctx2.refresh();
        }
      }, encounter.tier)),
      // The ambition boss: fought after a full clear, so it sits apart at the end of the track.
      bossKnown && quest.boss ? h("button", {
        class: ["enc", "L", "legendary", selected === quest.encounters.length ? "selected" : ""].filter(Boolean).join(" "),
        title: `Legendary encounter · ${monsters[quest.boss.monster].name}, after a full clear, for adventurers with the ambition to face it`,
        "aria-label": `Legendary encounter, ${monsters[quest.boss.monster].name}`,
        onclick: () => {
          ui2.selectedEncounter[questKey] = quest.encounters.length;
          ctx2.refresh();
        }
      }, "L") : null
    ),
    h(
      "div",
      { class: "track-legend" },
      h("span", null, "Start"),
      h("span", null, "Set where each adventurer turns back from their run panel")
    )
  );
  const bossSlot = bossKnown && selected === quest.encounters.length;
  const bossSeen = progress.seen.includes(quest.encounters.length - 1) || !!progress.legendaryRevealed || (quest.boss ? (state2.obtained[quest.boss.legendary] ?? 0) > 0 : false);
  const detail2 = encounterDetail(ctx2, quest, selected, heroMods, hero, bossSlot ? bossSeen : progress.seen.includes(selected));
  const pools = h(
    "div",
    null,
    h("h3", null, "Reward pools"),
    h(
      "div",
      { class: "pools" },
      ...["C", "U", "R", "M"].filter((t) => quest.pools[t].length).map((tier) => {
        const pool = quest.pools[tier];
        const revealed = progress.revealed[tier];
        const hidden = pool.length - revealed.length;
        return h(
          "div",
          { class: "pool" },
          h("div", null, h("span", { class: "tag " + tier }, tier), " ", tierNames$1[tier]),
          ...pool.filter((e) => revealed.includes(e.material)).map((e) => h(
            "div",
            null,
            materialLink(ctx2, e.material),
            // Drops are one at a time, so a plain ×1 is left off.
            e.min === 1 && e.max === 1 ? null : h("span", { class: "muted num" }, e.min === e.max ? ` ×${e.min}` : ` ×${e.min}-${e.max}`)
          )),
          hidden ? h("div", { class: "hidden" }, `${"? ".repeat(hidden).trim()}`) : h("div", { class: "muted small" }, "All found"),
          tier === "M" && !revealed.length ? h("div", { class: "muted small" }, "Only from rarity upgrades on rare drops") : null
        );
      }),
      bossKnown && quest.boss ? h(
        "div",
        { class: "pool" },
        h("div", null, h("span", { class: "tag L" }, "L"), " Legendary"),
        (state2.obtained[quest.boss.legendary] ?? 0) > 0 || progress.legendaryRevealed ? h("div", null, materialLink(ctx2, quest.boss.legendary)) : h("div", { class: "hidden" }, "?"),
        h("div", { class: "muted small" }, `Only from ${monsters[quest.boss.monster].name}, who appears for adventurers with the ambition to defeat it, once each`)
      ) : null
    )
  );
  const tab = endlessOpen && ((_a2 = ui2.questTab) == null ? void 0 : _a2[questKey]) === "endless" ? "endless" : "normal";
  const setTab = (t) => {
    ui2.questTab = { ...ui2.questTab, [questKey]: t };
    ctx2.refresh();
  };
  const tabs = endlessQuest ? h(
    "div",
    { class: "seg wide", role: "group", "aria-label": "Quest mode" },
    h("button", { class: tab === "normal" ? "on" : "", "aria-pressed": tab === "normal" ? "true" : "false", onclick: () => setTab("normal") }, "Normal"),
    h("button", {
      class: tab === "endless" ? "on" : "",
      "aria-pressed": tab === "endless" ? "true" : "false",
      disabled: !endlessOpen,
      title: endlessOpen ? "How deep can an adventurer get?" : `Opens after the first full clear of ${quest.name}`,
      onclick: () => setTab("endless")
    }, endlessOpen ? "Endless" : "Endless (locked)")
  ) : null;
  const fee = getEntryFee(quest, heroMods);
  const assigned = ((_b2 = hero == null ? void 0 : hero.assignment) == null ? void 0 : _b2.questKey) === questKey;
  const elsewhere = (hero == null ? void 0 : hero.assignment) && !assigned ? quests[hero.assignment.questKey].name : null;
  const picker = hero ? h(
    "div",
    { class: "forhero muted small" },
    `For ${hero.name}, level ${hero.level} ${classes[hero.classKey].name} · ${activityText(state2, hero)}`
  ) : null;
  const actions = h(
    "div",
    { class: "row" },
    assigned ? h("button", { class: "btn", onclick: () => {
      recall(state2, hero);
      ctx2.refresh();
    } }, `Recall ${hero.name}`) : h("button", { class: "btn primary", "data-guide": "send", disabled: !hero, onclick: () => {
      assignQuest(state2, hero, questKey);
      showRun(ui2, hero.id, state2);
      ctx2.refresh();
    } }, `Send ${(hero == null ? void 0 : hero.name) ?? ""}`),
    h("span", { class: "muted small grow" }, [
      fee ? `Entry fee ${fee} gold per run` : "No entry fee",
      elsewhere ? `${hero.name} will leave ${elsewhere}` : ""
    ].filter(Boolean).join(" · "))
  );
  const record = h(
    "div",
    { class: "statgrid small" },
    statRow("Runs", progress.runs),
    statRow("Full clears", progress.fullClears),
    statRow("Best", progress.bestEncounter >= 0 ? `encounter ${progress.bestEncounter + 1}` : "none")
  );
  const log = h(
    "div",
    null,
    h("h3", null, "Recent results"),
    progress.log.length ? h("div", { class: "log" }, ...progress.log.slice(0, 12).map((entry) => h("div", { class: entry.kind }, entry.text))) : h("div", { class: "muted small" }, "No runs yet.")
  );
  if (tab === "endless") {
    return shell(ctx2, `${quest.name}: Endless`, `How deep can an adventurer get? No items, gold or XP: it only records depth.`, tabs, picker, ...endlessBody(ctx2, quest, hero));
  }
  return questNav(ctx2, questKey, shell(
    ctx2,
    quest.name,
    quest.description,
    tabs,
    areaRules(quest, state2),
    picker,
    actions,
    hero && (isQuestCleared(state2, quest.key) || grantedModifiers(state2, hero, quest.key).length) ? modifiersSection(ctx2, quest, hero) : null,
    track,
    detail2,
    pools,
    record,
    endlessOpen ? null : h("p", { class: "muted small" }, `Endless opens after the first full clear of ${quest.name}.`),
    log
  ));
}
function encounterDetail(ctx2, quest, selected, heroMods, hero, seen) {
  const { state: state2 } = ctx2;
  const boss = quest.boss && selected === quest.encounters.length ? quest.boss.monster : void 0;
  const index = boss ? quest.encounters.length - 1 : selected;
  const encounter = quest.encounters[index];
  const lineup = boss ? [boss] : encounterLineup(quest, index, heroMods);
  const threats = seen ? encounterThreats(quest, index, heroMods, boss ? lineup : void 0) : [];
  const layout = fightLayout(lineup, !!boss || encounter.tier === "R");
  const riteDef = boss ? quest.modifiers.find((d) => d.rite) : void 0;
  const rite = riteDef == null ? void 0 : riteDef.rite;
  return h(
    "div",
    null,
    h("h3", null, boss ? `Legendary encounter · ${monsters[boss].name}` : `${quest.endless ? "Endless encounter" : "Encounter"} ${selected + 1} · ${tierNames$1[encounter.tier]}`),
    boss ? h("p", { class: "muted small" }, `Appears after a full clear, only for adventurers with the ambition to defeat it, once each.`) : null,
    threats.length ? h("div", { class: "threats" }, ...threats.map((t) => h("span", { class: "threat " + t.kind, title: t.hint }, t.label))) : null,
    h(
      "div",
      { class: "list" },
      seen ? lineup.map((key, slot) => monsterRow(key, heroMods, layout[slot].size)) : h("div", { class: "muted small" }, boss ? `Not revealed yet. ${monsters[boss].name} shows itself once an adventurer reaches the final encounter.` : "Not reached yet. Monsters are revealed when your adventurer gets here.")
    ),
    // The Sanctum's rite boss also waits after a full clear (with the rite on), so it shares the slot.
    boss && rite && seen ? h("h3", null, `Rite boss · ${monsters[rite.boss].name}`) : null,
    boss && rite && seen ? h("p", { class: "muted small" }, `Appears after a full clear with ${riteDef.name} on, on top of the rite's own monster bonuses.`) : null,
    boss && rite && seen ? h("div", { class: "list" }, monsterRow(rite.boss, [...heroMods.filter((k) => k !== riteDef.key), riteDef.key], 96)) : null,
    h(
      "div",
      { class: "row small", style: "margin-top:6px" },
      h("span", { class: "grow muted" }, [
        `Level ${encounterLevel(quest, index)}`,
        `difficulty ${fmt(encounterPower(quest, index), 2)}`,
        `${lineup.length} monster${lineup.length > 1 ? "s" : ""}`,
        hero && !quest.endless ? xpNote(hero.name, hero.level, questXpLevel(quest)) : ""
      ].filter(Boolean).join(" · "))
    )
  );
  function monsterRow(key, mods, size) {
    var _a2, _b2, _c2;
    const m = getMonsterStats(quest, index, key, mods);
    const art = monsterArtUrl(key);
    const kit = monsterKit(key);
    const kitText = kit ? kit.map((k) => {
      const shares = {};
      const tweak = k.damage ?? 1;
      for (const [t, v] of Object.entries(k.shares)) shares[t] = v * m.baseShare * tweak;
      if (kitHit(k) > 0) for (const [t, v] of Object.entries(m.addedTypes)) shares[t] = (shares[t] ?? 0) + v * tweak;
      const dmg = kitHit(k) > 0 ? damageSplitText(m.damage, shares) + (k.hits && k.hits > 1 ? ` over ${k.hits} hits` : "") : "";
      const amt = k.applies ? fmt(k.applies.amount * 100) : "";
      const ail = k.applies ? { burn: "burns", chill: `chills ${amt}%`, shock: `shocks ${amt}%`, weaken: `weakens ${amt}%`, snare: `snares ${amt}%`, blind: `blinds ${amt}%`, bleed: "bleeds", sunder: `sunders ${amt}% armor`, gale: `cuts evasion ${amt}%` }[k.applies.ailment] : "";
      const notes = [
        dmg,
        ail,
        k.accuracy !== void 0 && k.accuracy !== 1 ? `${fmt(k.accuracy * 100)}% accuracy` : "",
        k.drain ? `heals itself ${fmt(k.drain * 100)}% of damage dealt` : "",
        k.heal ? `heals ${fmt(k.heal * 100)}% of its life` : "",
        k.buff ? { guard: `takes ${fmt(k.buff.amount * 100)}% less damage for ${k.buff.turns ?? 2} turns`, evade: `${fmt(k.buff.amount * 100)}% more evasion for ${k.buff.turns ?? 2} turns`, ward: `ward of ${fmt(k.buff.amount * 100)}% of its life` }[k.buff.kind] : "",
        k.mimic ? "becomes the damage type you deal most" : "",
        k.rally ? `the pack attacks ${fmt(k.rally.amount * 100)}% faster for ${k.rally.turns} turns` : ""
      ];
      return `${k.name}${k.basic ? "" : ` (every ${k.every} turns${k.spell ? ", spell" : ""})`}: ${notes.filter(Boolean).join(", ")}`;
    }).join(" · ") : "";
    const statsLine = h("span", { class: "num muted" }, [
      kit ? `HP ${m.hp} · ${num(m.attacksPerSecond)} turns/s` : `HP ${m.hp} · hit ${damageSplitText(m.damage, m.damageTypes)} × ${num(m.attacksPerSecond)}/s`,
      kitText,
      `armor ${fmt(m.armor, 1)} · acc ${fmt(m.accuracy)} · eva ${fmt(m.evasion)}`,
      ((_a2 = monsters[key]) == null ? void 0 : _a2.thorns) ? `thorns ${monsters[key].thorns} ${monsters[key].thornsType ?? "physical"} per hit taken` : "",
      ((_b2 = monsters[key]) == null ? void 0 : _b2.summon) ? `${monsters[key].summon.name}: calls ${monsters[key].summon.count} ${((_c2 = monsters[monsters[key].summon.monster]) == null ? void 0 : _c2.name) ?? "adds"}${monsters[key].summon.hp ? ` (${fmt(monsters[key].summon.hp * 100)}% life)` : ""} at ${monsters[key].summon.at.map((a) => fmt(a * 100) + "%").join(", ")} life` : "",
      ...Object.entries(m.resist).map(([e, r]) => `${fmt(r * 100)}% ${e} res`),
      hero ? `${hero.name} lands ${num(expectedHits(getCachedStats(state2, hero).accuracy, m.evasion))} hits per attack` : ""
    ].filter(Boolean).join(" · "));
    return art ? h(
      "div",
      { class: "row small monrow" },
      // The same size the fight view shows it at.
      h("img", { class: "monart", src: art, alt: "", draggable: "false", style: `--sprite:${size}px` }),
      h("div", { class: "grow" }, h("div", { class: "monname" }, m.name), statsLine)
    ) : h("div", { class: "row small" }, h("span", { class: "grow" }, monsterIcon(key), m.name), statsLine);
  }
}
function xpNote(name, heroLevel, level) {
  const mult = xpMultiplier(heroLevel, level);
  return mult >= 1 ? "" : mult <= 0 ? `no XP for ${name} (level ${heroLevel})` : `${name} gets ${num(mult * 100)}% XP`;
}
function endlessBody(ctx2, quest, hero) {
  var _a2, _b2;
  const { state: state2, ui: ui2 } = ctx2;
  const key = endlessKey(quest.key);
  const endless = quests[key];
  const progress = getQuestProgress(state2, key);
  const on = ((_a2 = hero == null ? void 0 : hero.assignment) == null ? void 0 : _a2.questKey) === key;
  const elsewhere = (hero == null ? void 0 : hero.assignment) && !on ? quests[hero.assignment.questKey].name : null;
  const records2 = state2.adventurers.map((a) => {
    var _a3;
    return { a, best: ((_a3 = a.endlessBest) == null ? void 0 : _a3[quest.key]) ?? -1 };
  }).filter((r) => r.best >= 0).sort((x, y) => y.best - x.best);
  const actions = h(
    "div",
    { class: "row" },
    on ? h("button", { class: "btn", onclick: () => {
      recall(state2, hero);
      ctx2.refresh();
    } }, `Recall ${hero.name}`) : h("button", {
      class: "btn primary",
      disabled: !hero || state2.gold < endless.entryFee,
      onclick: () => {
        assignQuest(state2, hero, key);
        showRun(ui2, hero.id, state2);
        ctx2.refresh();
      }
    }, `Send ${(hero == null ? void 0 : hero.name) ?? ""} into the endless`),
    h("span", { class: "muted small grow" }, [
      `${endless.entryFee} gold per attempt`,
      !on && hero && state2.gold < endless.entryFee ? `you have ${state2.gold}` : "",
      elsewhere ? `${hero.name} will leave ${elsewhere}` : ""
    ].filter(Boolean).join(" · "))
  );
  const about = h("p", { class: "muted small", style: "margin:0" }, `${quest.name}'s monsters, starting at this quest's opening difficulty and growing ${num(ENDLESS_GROWTH * 100)}% stronger every encounter, and ${num(ENDLESS_STEP)}× stronger again every ${ENDLESS_PATTERN.length}. Quest modifiers don't apply. One attempt per ${endless.entryFee} gold, until the adventurer falls or is recalled.`);
  const block = ENDLESS_PATTERN.length;
  const selected = Math.min(endless.encounters.length - 1, ui2.selectedEncounter[key] ?? Math.max(0, progress.bestEncounter + 1));
  const start = selected - selected % block;
  const select = (i) => {
    ui2.selectedEncounter[key] = Math.max(0, Math.min(endless.encounters.length - 1, i));
    ctx2.refresh();
  };
  const trophy = trophies["endless-" + quest.key];
  const targets = new Set((trophy == null ? void 0 : trophy.tiers.map((t) => t.target - 1)) ?? []);
  const track = h(
    "div",
    null,
    h(
      "div",
      { class: "row" },
      h("h3", { class: "grow", style: "margin:0" }, `Encounters ${start + 1}–${start + block}`),
      h("button", { class: "btn small", disabled: start === 0, "aria-label": "Previous ten encounters", onclick: () => select(start - block) }, "‹"),
      h("button", { class: "btn small", onclick: () => select(Math.max(0, progress.bestEncounter + 1)), title: "Jump to the next encounter past the guild best" }, "Best"),
      h("button", { class: "btn small", disabled: start + block >= endless.encounters.length, "aria-label": "Next ten encounters", onclick: () => select(start + block) }, "›")
    ),
    h(
      "div",
      { class: "track" },
      ...endless.encounters.slice(start, start + block).map((encounter, k) => {
        const i = start + k;
        return h("button", {
          class: ["enc", encounter.tier, i <= progress.bestEncounter ? "cleared" : "", i === selected ? "selected" : "", targets.has(i) ? "goal" : ""].filter(Boolean).join(" "),
          title: `Endless encounter ${i + 1} · ${tierNames$1[encounter.tier]}${targets.has(i) ? " · trophy goal" : ""}`,
          "aria-label": `Endless encounter ${i + 1}, ${tierNames$1[encounter.tier]}`,
          onclick: () => select(i)
        }, encounter.tier);
      })
    ),
    h(
      "div",
      { class: "track-legend" },
      h("span", null, `${start + 1}`),
      h("span", null, progress.bestEncounter >= 0 ? `Guild best: ${progress.bestEncounter + 1}` : "No attempts yet"),
      h("span", null, `${start + block}`)
    )
  );
  const detail2 = encounterDetail(ctx2, endless, selected, [], hero, true);
  const record = h(
    "div",
    { class: "statgrid small" },
    statRow("Attempts", progress.runs),
    statRow("Guild best", progress.bestEncounter >= 0 ? `encounter ${progress.bestEncounter + 1}` : "none"),
    ...records2.map((r) => statRow(r.a.name, `encounter ${r.best + 1}`))
  );
  const earned = trophy ? ((_b2 = state2.trophies) == null ? void 0 : _b2[trophy.key]) ?? -1 : -1;
  const trophyBox = trophy ? h(
    "div",
    null,
    h("h3", null, `Trophy: ${trophy.name}`),
    h("div", { class: "list" }, ...trophy.tiers.map((t, i) => h(
      "div",
      { class: "row small" + (i <= earned ? "" : " muted") },
      h("span", { "aria-hidden": "true" }, i <= earned ? "✓" : "○"),
      h(
        "span",
        { class: "grow" },
        h("div", null, `${tierNames$2[i]}: reach encounter ${t.target}`, i <= earned ? h("span", { class: "sr-only" }, " (earned)") : null),
        h("div", { class: "mods" }, trophy.bonusText(t.bonus))
      ),
      h("span", { class: "num" }, `${t.fame} fame`)
    )))
  ) : null;
  const log = h(
    "div",
    null,
    h("h3", null, "Recent results"),
    progress.log.length ? h("div", { class: "log" }, ...progress.log.slice(0, 12).map((entry) => h("div", { class: entry.kind }, entry.text))) : h("div", { class: "muted small" }, "No attempts yet.")
  );
  return [actions, about, track, detail2, record, trophyBox, log];
}
function encounterThreats(quest, index, modifiers, lineup) {
  var _a2;
  const power = encounterPower(quest, index);
  const tags = /* @__PURE__ */ new Map();
  for (const key of lineup ?? quest.encounters[index].monsters) {
    const m = getMonsterStats(quest, index, key, modifiers);
    for (const e of elements) {
      if ((m.damageTypes[e] ?? 0) >= 0.25) {
        tags.set("dmg-" + e, { label: `${e} damage`, kind: e, hint: `${m.name} deals ${Math.round((m.damageTypes[e] ?? 0) * 100)}% of its damage as ${e}. ${e[0].toUpperCase() + e.slice(1)} resistance reduces it; armor does not.` });
      }
      if ((m.resist[e] ?? 0) >= 0.3) {
        tags.set("res-" + e, { label: `resists ${e}`, kind: "resist", hint: `${m.name} resists ${Math.round((m.resist[e] ?? 0) * 100)}% of ${e} damage.` });
      }
      if ((m.resist[e] ?? 0) <= -0.3) {
        tags.set("weak-" + e, { label: `weak to ${e}`, kind: e, hint: `${m.name} takes ${Math.round(-(m.resist[e] ?? 0) * 100)}% more ${e} damage.` });
      }
    }
    const thorns = (_a2 = monsters[key]) == null ? void 0 : _a2.thorns;
    if (thorns) {
      tags.set("thorns", { label: "thorns", kind: "armored", hint: `Each hit you land on ${m.name} deals ${thorns} physical damage back to you. Armor and block reduce it, and fewer, bigger hits take less of it.` });
    }
    if (m.evasion >= 1.4 * monsterBaseline.evasion * Math.pow(power, EVASION_GROWTH)) {
      tags.set("evasive", { label: "evasive", kind: "evasive", hint: `${m.name} dodges often. Accuracy helps you land hits.` });
    }
    if (m.armor >= 2 * monsterBaseline.armor * power) {
      tags.set("armored", { label: "armored", kind: "armored", hint: `${m.name} is heavily armored. Big hits and elemental damage get through better.` });
    }
    if (m.accuracy >= 1.2 * monsterBaseline.accuracy * Math.pow(power, ACCURACY_GROWTH)) {
      tags.set("accurate", { label: "accurate", kind: "accurate", hint: `${m.name} rarely misses, so evasion helps less.` });
    }
  }
  return [...tags.values()];
}
const monsterStatLabels = {
  hp: "monster HP",
  damage: "monster damage",
  armor: "monster armor",
  accuracy: "monster accuracy",
  evasion: "monster evasion",
  attacksPerSecond: "monster attack speed"
};
function modifierPenaltyText(def) {
  const parts = Object.entries(def.monster).map(([stat, m]) => formatMod(monsterStatLabels[stat], m));
  for (const [element, share] of Object.entries(def.addedDamage ?? {})) {
    parts.push(`monsters add ${Math.round(share * 100)}% of their damage as ${element}`);
  }
  if (def.duplicate) {
    parts.push("every monster appears twice (so twice the gold and XP)");
  }
  if (def.rite) {
    const names = (rules) => rules.map((r) => ruleInfo[r].name).join(" and ");
    const steps = def.rite.schedule.map((s) => `${names(s.rules)} from encounter ${s.from + 1}`);
    parts.push(`Lifeless all run; ${steps.join(", ")}. Stacks last the whole run. A full clear calls ${monsters[def.rite.boss].name}, whose rules change at each quarter of its life (${def.rite.bossPhases.map(names).join(", then ")}). Beating it uses up one of each key and opens the portal to the final area`);
  }
  return parts.join(", ");
}
function bonusText(b) {
  const pct2 = (v) => `${Math.round(v * 100)}%`;
  return [
    b.extraRewardChance ? `+${pct2(b.extraRewardChance)} extra reward chance` : "",
    b.rarityUpgradeChance ? `+${pct2(b.rarityUpgradeChance)} rarity upgrade chance` : "",
    b.bonusRareChance ? `+${pct2(b.bonusRareChance)} bonus rare encounter chance` : "",
    b.goldXpMultiplier && b.goldXpMultiplier !== 1 ? `${Math.round(b.goldXpMultiplier * 100) / 100}× gold and XP` : ""
  ].filter(Boolean).join(", ");
}
function modifiersSection(ctx2, quest, adventurer) {
  const { state: state2 } = ctx2;
  const active = getActiveModifiers(state2, adventurer, quest);
  const granted = grantedModifiers(state2, adventurer, quest.key);
  const taken = findContract(state2, adventurer.activeContract, adventurer);
  const fromContract = (taken == null ? void 0 : taken.questKey) === quest.key ? taken.mods : [];
  const feeStep = getEntryFee(quest, []);
  const hiddenExclusive = quest.modifiers.filter((def) => def.exclusive && !granted.includes(def.key));
  const rows = quest.modifiers.filter((def) => !def.exclusive || granted.includes(def.key)).map((def) => {
    const unlocked = isModifierUnlocked(state2, quest, def.key);
    const usable = unlocked || granted.includes(def.key);
    const on = active.includes(def.key);
    const body = h(
      "span",
      { class: "grow" },
      h(
        "div",
        null,
        def.name,
        h("span", { class: "muted small" }, ` · +${getEntryFee(quest, [def.key]) - feeStep} gold fee`),
        granted.includes(def.key) ? h("span", { class: "granttag" }, fromContract.includes(def.key) ? " For the contract" : " For the ambition") : null
      ),
      h("div", { class: "mods" }, modifierPenaltyText(def)),
      h("div", { class: "mods good" }, bonusText(def.bonuses)),
      usable ? null : h("div", { class: "mods" }, modifierUnlockText(def))
    );
    return usable ? h("button", {
      class: "item modtoggle" + (on ? " selected" : ""),
      "aria-pressed": on ? "true" : "false",
      "data-guide": "modifier",
      onclick: () => {
        state2.guide = { ...state2.guide, modifierToggled: true };
        setActiveModifiers(adventurer, quest.key, on ? active.filter((k) => k !== def.key) : [...active, def.key]);
        ctx2.refresh();
      }
    }, h("span", { class: "check", "aria-hidden": "true" }, on ? "✓" : ""), body) : h("div", { class: "item locked" }, h("span", { class: "check", "aria-hidden": "true" }, "🔒"), body);
  });
  const total = getRewardBonuses(quest, active);
  return h(
    "div",
    null,
    h("h3", null, `${adventurer.name}'s modifiers (${active.length} on)`),
    h("div", { class: "list" }, ...rows),
    hiddenExclusive.length ? h("p", { class: "muted small", style: "margin:6px 0 0" }, `${hiddenExclusive.map((d) => d.name).join(", ")}: only on contracts and ambitions that ask for them.`) : null,
    h("p", { class: "muted small", style: "margin:6px 0 0" }, active.length ? `Together: ${bonusText(total)}. Entry fee ${getEntryFee(quest, active)} gold. Changes apply from ${adventurer.name}'s next run.` : `Modifiers make the quest harder for better rewards, and combine freely. Each adventurer picks their own, and changes apply from their next run. Unlocks are shared by the guild.`)
  );
}
let benchComparison = null;
function renderBenchCompare(ctx2) {
  const { ui: ui2 } = ctx2;
  if (!ui2.benchOpen || ui2.picker || !ui2.compareBeside || !benchComparison) return null;
  return h("section", { class: "comparefloat", "aria-label": "Comparison with the selected hero" }, benchComparison);
}
function benchPanel(ctx2) {
  benchComparison = null;
  const { state: state2, ui: ui2 } = ctx2;
  const bench = ui2.bench;
  const type = itemTypes[bench.itemType];
  const baseLimit = getBaseLimit(state2, bench.itemType);
  bench.base = bench.base.slice(0, baseLimit);
  const decoLimit = getDecorationLimit(state2, bench.itemType);
  compactBench(bench);
  if (bench.decorations.length > decoLimit) bench.decorations.length = decoLimit;
  const problems = decorationProblems(state2, bench);
  const supported = problems.supported;
  const validDecorations = bench.decorations.filter((k, i) => !!k && !problems.reasons[i]);
  const invalidCount = problems.reasons.filter(Boolean).length;
  const preview = previewCraft(bench.itemType, bench.base, validDecorations, decoLimit);
  const hero = currentHero(ctx2);
  const filters = statFilters(ui2);
  const seen = seenMaterials(state2);
  const fadedType = (key) => filters.length > 0 && !typeSupports(seen, key, filters);
  const pickType = (key) => {
    bench.itemType = key;
    bench.base = bench.base.filter((m) => getBaseStats(requireMaterial(m), key));
    ui2.typeOpen = false;
    ctx2.refresh();
  };
  const typeGroups = (labeled) => h(
    "div",
    { class: "typegroups" + (labeled ? " labeled" : "") },
    ...[TYPE_GROUPS].map((line) => h("div", { class: "typeline" }, ...line.map(([label, keys]) => h(
      "div",
      { class: "typegroup" },
      h("span", { class: "typegroup-label" }, label),
      h("div", { class: "typegroup-row" }, ...keys.map((key) => h("button", {
        class: ["typetile", key === bench.itemType ? "on" : "", fadedType(key) ? "faded" : ""].filter(Boolean).join(" "),
        title: fadedType(key) ? `${itemTypes[key].name}: none of your materials give a ${itemTypes[key].name.toLowerCase()} ${filterNames(filters)}` : itemTypes[key].name,
        "aria-label": itemTypes[key].name,
        "aria-pressed": String(key === bench.itemType),
        onclick: () => pickType(key)
      }, itemTypeArt(key), labeled ? h("span", { class: "typetile-name" }, itemTypes[key].name) : null)))
    ))))
  );
  const chips = typeFacts(type).map((f) => h("span", { class: "typechip" }, f));
  const leanText = typeLeans(type);
  const types = h(
    "div",
    null,
    h("h3", null, "Item type"),
    // Wide screens: the grouped grid and a summary line.
    h(
      "div",
      { class: "typepick-wide" },
      typeGroups(false),
      h(
        "div",
        { class: "typesum" },
        h("span", { class: "typesum-name" }, type.name),
        h("span", { class: "typechips" }, ...chips, leanText ? h("span", { class: "typechip lean", title: "Stats this type scales up" }, `leans ${leanText}`) : null)
      )
    ),
    // Narrow screens: the chosen type, with Change opening the grouped chooser.
    h(
      "div",
      { class: "typepick-narrow" },
      h(
        "button",
        { class: "typebar", "aria-expanded": String(!!ui2.typeOpen), "aria-label": `Item type: ${type.name}. ${ui2.typeOpen ? "Close the list" : "Change it"}`, onclick: () => {
          ui2.typeOpen = !ui2.typeOpen;
          ctx2.refresh();
        } },
        h("span", { class: "typebar-icon" }, itemTypeArt(bench.itemType)),
        h(
          "span",
          { class: "typebar-mid" },
          h("span", { class: "typesum-name" }, type.name),
          h("span", { class: "typechips" }, ...typeFacts(type).map((f) => h("span", { class: "typechip" }, f)))
        ),
        h("span", { class: "typebar-action" }, ui2.typeOpen ? "Close" : "Change")
      ),
      ui2.typeOpen ? h("div", { class: "typedrop" }, typeGroups(true)) : null
    )
  );
  const slotBox = (kind, index, key, onRemove, unsupported = false, invalid = null) => {
    var _a2, _b2;
    const picking = ((_a2 = ui2.picker) == null ? void 0 : _a2.kind) === kind && ui2.picker.index === index;
    return h(
      "div",
      {
        class: "slotbox" + (key ? " filled" : "") + (unsupported ? " unsupported" : "") + (invalid ? " invalid" : "") + (picking ? " picking" : "") + (!key && !unsupported ? " addslot" : ""),
        title: invalid ?? (unsupported ? `The base materials support ${supported} decoration slot${supported === 1 ? "" : "s"}` : void 0)
      },
      h(
        "button",
        {
          class: "slotpick grow",
          // The first craft: the empty first base slot, then a material, then Craft + equip.
          "data-guide": kind === "base" && index === 0 && !key && !picking && !bench.base.length ? "craft" : kind === "decoration" && !key && !unsupported && !picking && ui2.decoSkipped && !((_b2 = state2.guide) == null ? void 0 : _b2.decorated) && hasUsableDecoration(state2, bench) ? "deco" : void 0,
          "aria-label": `Choose ${kind} material ${index + 1}${invalid ? " (invalid)" : ""}`,
          onclick: () => {
            ui2.picker = picking ? null : { kind, index };
            ctx2.refresh();
          }
        },
        key ? requireMaterial(key).name : unsupported ? "Not supported by the base" : kind === "base" ? "Add base material" : "Add decoration",
        invalid ? h("div", { class: "slotwhy" }, invalid) : null
      ),
      key ? h("button", { class: "btn small", "aria-label": "Remove", onclick: onRemove }, "×") : null
    );
  };
  const accessory2 = isAccessory(bench.itemType);
  const slots = h(
    "div",
    { class: "bench" },
    h(
      "div",
      null,
      h("h3", null, `Base (${bench.base.length}/${baseLimit})`),
      h(
        "div",
        { class: "list", style: "border:none;gap:4px" },
        ...Array.from({ length: Math.min(baseLimit, bench.base.length + 1) }, (_, i) => slotBox("base", i, bench.base[i], () => {
          bench.base.splice(i, 1);
          fixPicker(ui2);
          ctx2.refresh();
        })),
        unlockBox(ctx2, accessory2 ? "accessorySlot" : "baseSlot")
      )
    ),
    h(
      "div",
      null,
      h("h3", null, `Decorations (${validDecorations.length}/${supported})`),
      h(
        "div",
        { class: "list", style: "border:none;gap:4px" },
        ...Array.from({ length: Math.min(decoLimit, bench.decorations.length + 1) }, (_, i) => slotBox("decoration", i, bench.decorations[i], () => {
          bench.decorations.splice(i, 1);
          fixPicker(ui2);
          ctx2.refresh();
        }, i >= supported, problems.reasons[i])),
        unlockBox(ctx2, accessory2 ? "accessoryDecorationSlot" : "decorationSlot")
      )
    )
  );
  const previewItem = preview ? { id: "preview", itemType: bench.itemType, name: preview.name, base: [...bench.base], decorations: validDecorations, power: preview.power } : null;
  const equipNeed = levelForPower(Math.max(1, ...bench.base.map((k) => requireMaterial(k).power)));
  const equipWhy = !hero ? "No hero selected" : invalidCount ? "Remove or replace the invalid decorations first" : hero.level < equipNeed ? `${hero.name} needs level ${equipNeed}` : null;
  const craftEquipButton = (slot, label, cls) => h("button", {
    class: cls,
    "data-guide": cls.includes("primary") && bench.base.length && !equipWhy ? "craft" : void 0,
    disabled: !!equipWhy,
    title: equipWhy ?? `Craft it and equip it in ${hero.name}'s ${slotNames[slot].toLowerCase()}`,
    onclick: () => {
      const result = craftItem(state2, bench.itemType, bench.base, validDecorations);
      if (typeof result === "string") {
        ctx2.toast(result);
      } else {
        equip(state2, hero, { kind: "crafted", id: result.id }, slot);
        bench.base = [];
        bench.decorations = [];
      }
      ctx2.refresh();
    }
  }, label);
  const primarySlot = hero ? comparisonSlots(state2, hero, type.slots)[0] : void 0;
  const comparison = benchComparison = hero && previewItem ? deltaColumn(
    state2,
    hero,
    type.slots,
    previewItem,
    (slot) => slot === primarySlot ? null : h("div", { class: "row" }, craftEquipButton(slot, `Craft + equip in ${slotNames[slot].toLowerCase()}`, "btn small")),
    { active: filters, toggle: (stat) => toggleFilter(ctx2, statFamily(stat)) }
  ) : null;
  const previewBox = preview ? h(
    "div",
    { class: "preview" },
    h(
      "div",
      { class: "previewhead" },
      h("span", { class: "rowart" }, itemArt(bench.itemType, bench.base)),
      h(
        "div",
        { class: "grow" },
        h("div", { class: "pname" }, preview.name, levelTag(levelForPower(preview.power), hero == null ? void 0 : hero.level)),
        h("div", null, itemStatsText(preview.stats))
      )
    ),
    h("div", { class: "statlines" }, ...preview.lines.map((line) => h(
      "div",
      { class: "row small" + (line.raw > line.cap ? " capped" : "") },
      h("span", { class: "grow" }, formatStat(line.stat, line.total)),
      h("span", { class: "num muted" }, [
        line.raw ? `base ${formatStatValue(line.stat, line.raw)}${line.cap === Infinity ? "" : line.raw > line.cap ? `, capped at ${formatStatValue(line.stat, line.cap)}` : ` of ${formatStatValue(line.stat, line.cap)} cap`}` : "",
        line.decoration ? `+${formatStatValue(line.stat, line.decoration)} deco` : ""
      ].filter(Boolean).join(" · "))
    ))),
    preview.lines.some((l) => l.raw > l.cap) ? h("div", { class: "muted small" }, "Core stats are capped by the highest cap among the base materials. Decorations add past the cap.") : null,
    h(
      "div",
      { class: "row", style: "margin-top:4px" },
      primarySlot ? craftEquipButton(primarySlot, "Craft + equip", "btn primary") : null,
      h("button", {
        class: "btn" + (primarySlot ? "" : " primary"),
        disabled: invalidCount > 0,
        title: invalidCount ? "Remove or replace the invalid decorations first" : void 0,
        onclick: () => {
          const result = craftItem(state2, bench.itemType, bench.base, validDecorations);
          if (typeof result === "string") {
            ctx2.toast(result);
          } else {
            bench.base = [];
            bench.decorations = [];
          }
          ctx2.refresh();
        }
      }, primarySlot ? "Craft only" : "Craft"),
      h("button", { class: "btn", onclick: () => {
        bench.base = [];
        bench.decorations = [];
        ctx2.refresh();
      } }, "Clear")
    ),
    invalidCount ? h("div", { class: "muted small bad" }, `${invalidCount} decoration${invalidCount > 1 ? "s don't" : " doesn't"} fit ${invalidCount > 1 ? "their slots" : "its slot"}. Remove or replace ${invalidCount > 1 ? "them" : "it"} to craft.`) : null,
    hero && preview && levelForPower(preview.power) > hero.level ? h("div", { class: "muted small" }, `${hero.name} (level ${hero.level}) can't wear this until level ${levelForPower(preview.power)}.`) : null
  ) : h("div", { class: "muted small" }, "Add a base material to see the item it makes.");
  const equippedCount = state2.craftedItems.filter((item) => isItemEquipped(state2, item.id)).length;
  const unfiltered = ctx2.ui.showEquipped ? state2.craftedItems : state2.craftedItems.filter((item) => !isItemEquipped(state2, item.id));
  const byStats = filters.length ? unfiltered.filter((item) => matchesFilters(filters, Object.keys(getCraftedItemStats(item).stats))) : unfiltered;
  const levelCut = ui2.hideTooHigh && hero ? hero.level : Infinity;
  const shownItems = byStats.filter((item) => itemLevelRequirement(state2, { kind: "crafted", id: item.id }) <= levelCut);
  const hiddenByFilter = unfiltered.length - byStats.length;
  const hiddenByLevel = byStats.length - shownItems.length;
  const crafted = h(
    "div",
    null,
    h(
      "div",
      { class: "craftedhead" },
      h("h3", null, `Crafted items (${shownItems.length})`),
      equippedCount ? h(
        "label",
        { class: "toggle small" },
        h("input", { type: "checkbox", checked: !!ctx2.ui.showEquipped, onchange: (e) => {
          ctx2.ui.showEquipped = e.target.checked;
          ctx2.refresh();
        } }),
        ` Show equipped items (${equippedCount})`
      ) : null
    ),
    shownItems.length ? h(
      "div",
      { class: "list" },
      ...[...shownItems].reverse().map((item) => {
        var _a2;
        const wearer = isItemEquipped(state2, item.id);
        const salvaging = ((_a2 = ctx2.ui.salvaging) == null ? void 0 : _a2.itemId) === item.id ? ctx2.ui.salvaging : null;
        const equipFor = [];
        return h("div", { class: "craftedrow" }, h(
          "div",
          { class: "small craftedbody" },
          h("span", { class: "rowart" }, itemArt(item.itemType, item.base)),
          h(
            "div",
            { class: "grow" },
            h("div", null, item.name, " ", h("span", { class: "power" }, `P${Math.max(...item.base.map((k) => requireMaterial(k).power))}`), h("span", { class: "muted" }, ` · ${itemTypes[item.itemType].name}`)),
            h("div", { class: "mods" }, itemStatsText(getCraftedItemStats(item))),
            h("div", { class: "mods" }, "Made from ", ...madeFromList(ctx2, item.base, item.decorations)),
            hero && !wearer ? deltaLines(state2, hero, itemTypes[item.itemType].slots, { kind: "crafted", id: item.id }, (slot) => {
              const ref = { kind: "crafted", id: item.id };
              const need = itemLevelRequirement(state2, ref);
              equipFor.push([slot, h("button", {
                class: "btn small",
                disabled: !canEquipInSlot(state2, hero, ref, slot),
                title: hero.level < need ? `${hero.name} needs level ${need}` : `Equip on ${hero.name} (${slotNames[slot]})`,
                onclick: () => {
                  if (equip(state2, hero, ref, slot)) {
                    state2.guide = { ...state2.guide, manualEquip: true };
                  }
                  ctx2.refresh();
                }
              })]);
              return null;
            }) : null
          ),
          wearer ? h("div", { class: "muted" }, `Worn by ${wearer.name}`) : h(
            "div",
            { class: "itemactions bottom" },
            ...equipFor.map(([slot, btn]) => {
              btn.textContent = equipFor.length > 1 ? `Equip ${slotNames[slot]}` : "Equip";
              return btn;
            }),
            recipeButton(ctx2, item),
            h("button", { class: "btn small", onclick: () => {
              sellItem(state2, item.id);
              ctx2.refresh();
            } }, `Sell ${getSellValue(item)}g`),
            salvageLevel(state2) ? h("button", { class: "btn small" + (salvaging ? " on" : ""), "aria-expanded": salvaging ? "true" : "false", onclick: () => {
              ctx2.ui.salvaging = salvaging ? null : { itemId: item.id, picks: defaultSalvagePicks(item.base, item.decorations) };
              ctx2.refresh();
            } }, "Salvage") : null
          )
        ), salvaging ? salvageBox(ctx2, item.id, salvaging) : null);
      })
    ) : h("div", { class: "muted small" }, hiddenByLevel ? `Every crafted item here is above ${hero.name}'s level ${hero.level}.` : hiddenByFilter ? `No crafted items with ${filterNames(filters)}.` : state2.craftedItems.length ? "Every crafted item is equipped." : "Nothing crafted yet."),
    hiddenByFilter && shownItems.length ? h("div", { class: "muted small" }, `${hiddenByFilter} more hidden by the stat filters.`) : null,
    hiddenByLevel && shownItems.length ? h("div", { class: "muted small" }, `${hiddenByLevel} more above ${hero.name}'s level hidden.`) : null
  );
  const levelToggle = hero ? h(
    "label",
    { class: "toggle small" },
    h("input", { type: "checkbox", checked: !!ui2.hideTooHigh, onchange: (e) => {
      ui2.hideTooHigh = e.target.checked;
      ctx2.refresh();
    } }),
    ` Hide items and base materials above ${hero.name}'s level (${hero.level})`
  ) : null;
  return panelShell(
    ctx2,
    "left",
    "Crafting bench",
    "Combine base materials into an item, then add decorations.",
    levelToggle,
    filterBar(ctx2),
    types,
    slots,
    h("div", { class: "previewrow" }, previewBox, ui2.compareBeside ? null : comparison),
    crafted
  );
}
function compactBench(bench) {
  if (bench.decorations.some((k) => !k)) bench.decorations = bench.decorations.filter(Boolean);
}
function fixPicker(ui2) {
  const p = ui2.picker;
  if (!p) return;
  const list2 = p.kind === "base" ? ui2.bench.base : ui2.bench.decorations;
  if (p.index > list2.length) ui2.picker = { ...p, index: list2.length };
}
function hasUsableDecoration(state2, bench) {
  if (!bench.base.length) return false;
  const cap = maxDecorationPower(bench.itemType, bench.base);
  return materialOrder.some((key) => (state2.materials[key] ?? 0) > 0 && requireMaterial(key).power <= cap && !!getDecorationStats(requireMaterial(key), bench.itemType));
}
function decorationProblems(state2, bench) {
  var _a2;
  const type = itemTypes[bench.itemType];
  const supported = ((_a2 = previewCraft(bench.itemType, bench.base, [], getDecorationLimit(state2, bench.itemType))) == null ? void 0 : _a2.maxDecorations) ?? 0;
  const cap = maxDecorationPower(bench.itemType, bench.base);
  const reasons = bench.decorations.map((key, i) => {
    if (!key) return null;
    const m = requireMaterial(key);
    if (!getDecorationStats(m, bench.itemType)) return `Doesn't decorate a ${type.name.toLowerCase()}`;
    if (!bench.base.length) return "Needs a base material";
    if (i >= supported) return `The base materials support ${supported} decoration slot${supported === 1 ? "" : "s"}`;
    if (m.power > cap) return `Needs a base of P${m.power - DECORATION_TIER_LEAD} or higher`;
    return null;
  });
  return { supported, reasons };
}
function defaultSalvagePicks(base, decorations) {
  const all = [...base, ...decorations];
  if (!all.length) return [];
  let best = 0;
  all.forEach((k, i) => {
    if (requireMaterial(k).power > requireMaterial(all[best]).power) best = i;
  });
  return [best];
}
function salvageBox(ctx2, itemId, salvaging) {
  const { state: state2 } = ctx2;
  const level = salvageLevel(state2);
  const all = itemMaterials(state2, itemId);
  const picks = salvaging.picks.filter((i) => i < all.length);
  const cost = salvageCost(picks.map((i) => all[i]));
  const blocked = salvageBlocked(state2, itemId, picks);
  const toggle = (i) => {
    if (picks.includes(i)) salvaging.picks = picks.filter((p) => p !== i);
    else if (level === 1) salvaging.picks = [i];
    else if (picks.length < level) salvaging.picks = [...picks, i];
    else return;
    ctx2.refresh();
  };
  return h(
    "div",
    { class: "salvagebox" },
    h("div", { class: "muted small" }, `Recover up to ${level} material${level === 1 ? "" : "s"}. The item is destroyed and the rest are lost.`),
    h("div", { class: "statchips" }, ...all.map((key, i) => {
      const m = requireMaterial(key);
      const on = picks.includes(i);
      return h("button", {
        class: "statchip" + (on ? " match" : ""),
        "aria-pressed": on ? "true" : "false",
        disabled: !on && level > 1 && picks.length >= level,
        onclick: () => toggle(i)
      }, `${m.name} P${m.power}`);
    })),
    h(
      "div",
      { class: "row small" },
      h("span", { class: "grow muted" }, picks.length > 1 ? `${SALVAGE_TIER_COST[Math.max(...picks.map((i) => requireMaterial(all[i]).power))]} gold for the strongest, ×${Math.pow(2, picks.length - 1)} for ${picks.length} materials` : "Price by the material's tier"),
      h("button", { class: "btn small primary", disabled: !!blocked, title: blocked ?? void 0, onclick: () => {
        const result = salvageItem(state2, itemId, picks);
        if (typeof result === "string") ctx2.toast(result);
        ctx2.ui.salvaging = null;
        ctx2.refresh();
      } }, `Salvage · ${cost} gold`),
      h("button", { class: "btn small", onclick: () => {
        ctx2.ui.salvaging = null;
        ctx2.refresh();
      } }, "Cancel")
    )
  );
}
function salvagePanel(ctx2) {
  const { state: state2 } = ctx2;
  const level = salvageLevel(state2);
  const next = nextSalvageLevel(state2);
  const tiers = SALVAGE_TIER_COST.map((c, p) => p > 0 && p <= 8 ? `P${p} ${c}` : "").filter(Boolean).join(" · ");
  const action = next ? h(
    "div",
    { class: "expansion row small" },
    h(
      "span",
      { class: "grow" },
      h("div", null, level ? `Upgrade: recover ${next.level} materials per item` : "Build the salvage yard"),
      h("div", { class: "mods" }, next.blocked && next.blocked.startsWith("Requires") ? next.blocked : `${next.gold} gold`)
    ),
    h(
      "button",
      {
        class: "btn small primary",
        disabled: !!next.blocked,
        title: next.blocked ?? void 0,
        onclick: () => {
          upgradeSalvage(state2);
          ctx2.refresh();
        }
      },
      `${level ? "Upgrade" : "Build"} · ${next.gold} gold`
    )
  ) : h("div", { class: "muted small" }, `Fully upgraded: recovers up to ${SALVAGE_MAX} materials per item.`);
  return shell(
    ctx2,
    "Salvage yard",
    level ? `Recovers ${level} material${level === 1 ? "" : "s"} per item` : "Not built yet",
    h("p", { class: "muted small", style: "margin:0" }, "Take a crafted item apart to recover some of its materials. The item is destroyed and the materials you don't pick are lost. Salvage from the Crafted items list on the crafting bench."),
    h("p", { class: "muted small", style: "margin:0" }, `Price for one material, by its tier: ${tiers}. Picking several uses the strongest one's price, doubled for each extra material (×2, ×4, ×8).`),
    h("p", { class: "muted small", style: "margin:0" }, `Each guild expansion after Guild Expansion ${SALVAGE_EXPANSION} opens an upgrade for one more material, up to ${SALVAGE_MAX}.`),
    action,
    level ? h("div", { class: "row" }, h("button", { class: "btn", onclick: () => {
      ctx2.ui.benchOpen = true;
      ctx2.refresh();
    } }, "Open the crafting bench")) : null
  );
}
function statFilters(ui2) {
  return ui2.statFilters ?? [];
}
function matchesFilters(filters, stats) {
  if (!filters.length) return true;
  const families = new Set(stats.map(statFamily));
  return filters.every((f) => families.has(f));
}
function toggleFilter(ctx2, family) {
  const filters = statFilters(ctx2.ui);
  ctx2.ui.statFilters = filters.includes(family) ? filters.filter((f) => f !== family) : [...filters, family];
  ctx2.refresh();
}
function filterNames(filters) {
  const names = filters.map(familyLabel);
  return names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : names[0] ?? "";
}
function seenMaterials(state2) {
  return materialOrder.filter((k) => (state2.obtained[k] ?? 0) > 0 || (state2.materials[k] ?? 0) > 0).map(requireMaterial);
}
function materialTypeStats(material, itemType) {
  var _a2;
  return [...Object.keys(((_a2 = getBaseStats(material, itemType)) == null ? void 0 : _a2.stats) ?? {}), ...Object.keys(getDecorationStats(material, itemType) ?? {})];
}
function typeSupports(seen, itemType, filters) {
  return matchesFilters(filters, seen.flatMap((m) => materialTypeStats(m, itemType)));
}
function filterFamilies(state2) {
  const found = /* @__PURE__ */ new Set();
  for (const m of seenMaterials(state2)) for (const t of itemTypeOrder) materialTypeStats(m, t).forEach((s) => found.add(statFamily(s)));
  for (const item of state2.craftedItems) Object.keys(getCraftedItemStats(item).stats).forEach((s) => found.add(statFamily(s)));
  const order = (f) => {
    const i = statOrder.indexOf(f);
    return i < 0 ? 999 : i;
  };
  return [...found].sort((a, b) => order(a) - order(b));
}
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
function filterBar(ctx2) {
  const filters = statFilters(ctx2.ui);
  const available = filterFamilies(ctx2.state).filter((f) => !filters.includes(f));
  const select = h(
    "select",
    { class: "filteradd", "aria-label": "Add a stat filter" },
    h("option", { value: "" }, "+ Filter"),
    ...available.map((f) => h("option", { value: f }, capitalize(familyLabel(f))))
  );
  select.hasListeners = true;
  select.addEventListener("change", () => {
    const value = select.value;
    if (value) {
      ctx2.ui.statFilters = [...filters, value];
      ctx2.refresh();
    }
  });
  return h(
    "div",
    { class: "filterbar", role: "group", "aria-label": "Stat filters" },
    ...filters.map((f) => h("button", {
      class: "fchip",
      "aria-label": `Remove ${familyLabel(f)} filter`,
      title: "Remove this filter",
      onclick: () => toggleFilter(ctx2, f)
    }, capitalize(familyLabel(f)), h("span", { "aria-hidden": "true" }, " ×"))),
    available.length ? select : null,
    filters.length > 1 ? h("button", { class: "fchip clear", onclick: () => {
      ctx2.ui.statFilters = [];
      ctx2.refresh();
    } }, "Clear all") : null,
    filters.length ? null : h("span", { class: "muted small" }, "Narrow materials, item types and crafted items to a stat.")
  );
}
function renderPickerPanel(ctx2) {
  var _a2, _b2;
  const { state: state2, ui: ui2 } = ctx2;
  const picker = ui2.picker;
  if (!ui2.benchOpen || !picker) {
    return null;
  }
  const bench = ui2.bench;
  compactBench(bench);
  const type = itemTypes[bench.itemType];
  const list2 = picker.kind === "base" ? bench.base : bench.decorations;
  const current = list2[picker.index];
  const heroLevel = (_a2 = currentHero(ctx2)) == null ? void 0 : _a2.level;
  const reserved = {};
  [...bench.base, ...bench.decorations].forEach((k) => {
    if (k) reserved[k] = (reserved[k] ?? 0) + 1;
  });
  if (current) reserved[current]--;
  const others = bench.base.filter((_, i) => i !== picker.index);
  const otherPower = Math.max(0, ...others.map((k) => requireMaterial(k).power));
  const baseLevel = levelForPower(Math.max(1, otherPower));
  const filters = statFilters(ui2);
  const matches = (e) => filters.includes(statFamily(e.stat));
  const decoCapPower = maxDecorationPower(bench.itemType, bench.base);
  const options = materialOrder.flatMap((key) => {
    const count = (state2.materials[key] ?? 0) - (reserved[key] ?? 0);
    if (count < 1 && !list2.includes(key)) return [];
    const material = requireMaterial(key);
    let entries;
    let extra = "";
    if (picker.kind === "base") {
      const base = getBaseStats(material, bench.itemType);
      if (!base) return [];
      entries = baseStatEntries(base, (stat) => statScale(bench.itemType, stat), (stat, v) => itemStatRound(stat, v, bench.itemType));
      extra = [base.role ? roleLabel[base.role] : "", `${base.maxDecorations} decoration slot${base.maxDecorations === 1 ? "" : "s"}`].filter(Boolean).join(" · ");
    } else {
      const deco = getDecorationStats(material, bench.itemType);
      if (!deco) return [];
      entries = statOrder.filter((k) => deco[k]).map((stat) => {
        const v = roundStat(stat, itemStatRound(stat, deco[stat] * decorationScale(bench.itemType, stat), bench.itemType));
        return { stat, value: v, text: formatStat(stat, v) };
      });
    }
    if (!matchesFilters(filters, entries.map((e) => e.stat))) return [];
    return [{ key, material, count, entries, extra }];
  });
  const first = filters[0];
  const amount = (o, flat) => first ? o.entries.filter((e) => statFamily(e.stat) === first && e.stat === first === flat).reduce((sum, e) => sum + e.value, 0) : 0;
  options.sort((a, b) => amount(b, true) - amount(a, true) || amount(b, false) - amount(a, false) || b.material.power - a.material.power);
  const baseLimit = getBaseLimit(state2, bench.itemType);
  const nextPicker = () => {
    if (bench.base.length < baseLimit) return { kind: "base", index: bench.base.length };
    const supported = Math.min(getDecorationLimit(state2, bench.itemType), decorationProblems(state2, bench).supported);
    const decos = bench.decorations.filter(Boolean).length;
    return decos < supported ? { kind: "decoration", index: decos } : null;
  };
  const choose = (key) => {
    compactBench(bench);
    const list22 = picker.kind === "base" ? bench.base : bench.decorations;
    if (picker.index < list22.length) list22[picker.index] = key;
    else list22.push(key);
    ui2.picker = nextPicker();
    ctx2.refresh();
  };
  const columnLimit = picker.kind === "base" ? baseLimit : Math.min(getDecorationLimit(state2, bench.itemType), decorationProblems(state2, bench).supported);
  const addOne = (key) => {
    compactBench(bench);
    const list22 = picker.kind === "base" ? bench.base : bench.decorations;
    if (list22.length >= columnLimit) return;
    list22.push(key);
    ui2.picker = list22.length < columnLimit ? { kind: picker.kind, index: list22.length } : nextPicker();
    ctx2.refresh();
  };
  const removeOne = (key) => {
    compactBench(bench);
    const list22 = picker.kind === "base" ? bench.base : bench.decorations;
    const at = list22.lastIndexOf(key);
    if (at >= 0) list22.splice(at, 1);
    ui2.picker = { kind: picker.kind, index: Math.min(picker.index, list22.length) };
    ctx2.refresh();
  };
  const rows = [];
  const inCraft = new Set(list2.filter((k) => !!k));
  const inColumn = (key) => list2.filter((k) => k === key).length;
  const usedOptions = options.filter((o) => inCraft.has(o.key));
  const usedRows = [];
  let hiddenCount = 0;
  for (const o of [...usedOptions, ...options.filter((o2) => !inCraft.has(o2.key))]) {
    const used = inCraft.has(o.key);
    const tooStrong = picker.kind === "decoration" && decoCapPower > 0 && o.material.power > decoCapPower;
    const level = levelForPower(Math.max(otherPower, o.material.power));
    const raises = level > baseLevel;
    const tooHigh = heroLevel !== void 0 && level > heroLevel;
    if (!used && (tooStrong || picker.kind === "base" && ui2.hideTooHigh && tooHigh)) {
      hiddenCount++;
      continue;
    }
    const head = h(
      "div",
      null,
      materialIcon(o.key),
      o.material.name,
      " ",
      h("span", { class: "power" }, `P${o.material.power}`),
      h("span", { class: "muted num" }, ` ×${o.count}`),
      picker.kind === "base" ? h("span", { class: "reqtag" + (raises ? " raises" : "") + (raises && tooHigh ? " short" : ""), title: (raises ? `Raises the item's level requirement to ${level}` : `Item level requirement stays ${level}`) + (tooHigh ? `, above ${currentHero(ctx2).name}'s level ${heroLevel}` : "") }, ` Item Lv ${level}${raises ? " ↑" : ""}`) : null
    );
    const chips = h(
      "div",
      { class: "statchips" },
      ...o.entries.map((e) => {
        const on = matches(e);
        return h("button", {
          class: "statlink" + (on ? " match" : ""),
          "aria-pressed": on ? "true" : "false",
          title: on ? `Remove the ${familyLabel(statFamily(e.stat))} filter` : `Filter by ${familyLabel(statFamily(e.stat))}`,
          onclick: (ev) => {
            ev.stopPropagation();
            toggleFilter(ctx2, statFamily(e.stat));
          }
        }, e.text);
      })
    );
    const extra = o.extra ? h("div", { class: "mods" }, o.extra) : null;
    const noneLeft = o.count < 1;
    const locked = tooStrong || noneLeft;
    const free = o.count - (o.key === current ? 1 : 0);
    const stop = (fn) => (ev) => {
      ev.stopPropagation();
      fn();
    };
    const counter = used ? h(
      "div",
      { class: "pickcount" },
      h("span", { class: "muted small" }, `${inColumn(o.key)} in this craft`),
      h("button", { class: "btn small", "aria-label": `One less ${o.material.name}`, title: `Take one ${o.material.name} out`, onclick: stop(() => removeOne(o.key)) }, "−"),
      list2.length < columnLimit && free > 0 && !tooStrong ? h("button", { class: "btn small", "aria-label": `One more ${o.material.name}`, title: `Add another ${o.material.name}`, onclick: stop(() => addOne(o.key)) }, "+") : null
    ) : null;
    (used ? usedRows : rows).push(h(
      "div",
      {
        class: "pickrow" + (o.key === current ? " selected" : "") + (locked ? " locked" : " pickable"),
        "data-guide": picker.kind === "base" && !bench.base.length && !locked ? "craft" : void 0,
        onclick: locked ? void 0 : () => choose(o.key)
      },
      h(
        "div",
        { class: "grow pickmain" },
        tooStrong ? h("div", { class: "pickname" }, head, extra, h("div", { class: "mods" }, `Needs a base of P${o.material.power - DECORATION_TIER_LEAD} or higher`)) : noneLeft ? h("div", { class: "pickname" }, head, extra) : h("button", { class: "pickname", title: `Use ${o.material.name}` }, head, extra),
        chips,
        counter
      ),
      h("button", {
        class: "btn small info",
        "aria-label": `All uses of ${o.material.name}`,
        title: "Show every use of this material",
        onclick: (ev) => {
          ev.stopPropagation();
          ui2.materialDetail = o.key;
          ctx2.refresh();
        }
      }, "i")
    ));
  }
  const missingText = () => {
    const fits = materialOrder.filter((key) => {
      var _a3;
      const material = requireMaterial(key);
      const stats = picker.kind === "base" ? Object.keys(((_a3 = getBaseStats(material, bench.itemType)) == null ? void 0 : _a3.stats) ?? {}) : Object.keys(getDecorationStats(material, bench.itemType) ?? {});
      return matchesFilters(filters, stats);
    });
    const seen = fits.filter((key) => (state2.obtained[key] ?? 0) > 0);
    const unseen = fits.length - seen.length;
    if (!fits.length) return `No material gives a ${type.name.toLowerCase()} ${filterNames(filters)} as a ${picker.kind === "base" ? "base" : "decoration"}.`;
    return `None owned. ${seen.length ? `${seen.map((k) => `${requireMaterial(k).name} (P${requireMaterial(k).power})`).join(", ")} ${seen.length === 1 ? "has" : "have"} it` : ""}${seen.length && unseen ? ", and " : ""}${unseen ? `${unseen} material${unseen === 1 ? "" : "s"} you haven't found yet ${unseen === 1 ? "has" : "have"} it` : ""}.`;
  };
  const title = `${picker.kind === "base" ? "Base" : "Decoration"} ${picker.index + 1}`;
  return h(
    "section",
    { class: "panel left picker", "aria-label": `Choose ${title.toLowerCase()} material` },
    h(
      "div",
      { class: "panel-head" },
      h(
        "div",
        { class: "grow" },
        h("h2", null, title),
        h("div", { class: "muted small" }, `Materials for a ${type.name.toLowerCase()}`)
      ),
      h("button", { class: "btn", onclick: () => {
        if (picker.kind === "decoration" && !bench.decorations[picker.index]) ui2.decoSkipped = true;
        ui2.picker = null;
        ctx2.refresh();
      } }, "Close")
    ),
    h(
      "div",
      { class: "panel-body" },
      h("div", { class: "muted small" }, filters.length ? `Showing materials with ${filterNames(filters)}. Change the filters at the top of the bench.` : "Strongest first. Click a stat to filter by it."),
      usedRows.length ? h("div", null, h("h3", null, "In this craft"), h("div", { class: "list" }, ...usedRows)) : null,
      usedRows.length && rows.length ? h("h3", null, "Other materials") : null,
      rows.length || usedRows.length || hiddenCount ? rows.length ? h("div", { class: "list" }, ...rows) : null : h(
        "div",
        { class: "muted small" },
        filters.length ? missingText() : picker.kind === "base" ? `None of your materials can be the base of a ${type.name.toLowerCase()}.` : `None of your materials can decorate a ${type.name.toLowerCase()}.`
      ),
      hiddenCount ? h("div", { class: "muted small" }, picker.kind === "decoration" ? `${hiddenCount} stronger material${hiddenCount === 1 ? "" : "s"} hidden: they need a stronger base.` : `${hiddenCount} material${hiddenCount === 1 ? "" : "s"} above ${((_b2 = currentHero(ctx2)) == null ? void 0 : _b2.name) ?? "the hero"}'s level hidden.`) : null,
      h("p", { class: "muted small" }, picker.kind === "decoration" ? `Decorations add on top of the base caps; two-handed weapons get larger values. They can be at most ${DECORATION_TIER_LEAD} tiers above the strongest base material.` : CAP_RULE + " A core stat with no cap from any base is 0."),
      picker.kind === "base" ? h("p", { class: "muted small" }, `An item requires level 1 + 3 per power above 1 of its strongest base material. Without this slot it requires level ${baseLevel}.`) : null
    )
  );
}
function applicantCard(app2, action, showAmbitions = true) {
  const cls = classes[app2.classKey];
  const fameIfAll = Math.round(app2.ambitions.reduce((sum, a) => sum + a.fame, 0) * RETIRE_MULTIPLIER[3]);
  return h(
    "div",
    { class: "applicant" },
    h(
      "div",
      { class: "row applicanthead" },
      h(
        "div",
        { class: "grow" },
        h("div", { class: "applicantname" }, app2.name),
        h("div", { class: "panel-title-sub" }, `Level ${app2.level} ${cls.name} · `, h("span", { class: "ambtier t" + app2.tier }, ambitionTierNames[app2.tier]))
      ),
      action
    ),
    h("div", { class: "herohead" }, heroPortrait(app2, "large"), heroPassives(app2.classKey, app2.passives, app2.bonuses, "passive small")),
    showAmbitions ? ambitionList(app2.ambitions) : null,
    showAmbitions ? h("div", { class: "mods muted" }, `All three fulfilled: ${fameIfAll} fame on retirement`) : null
  );
}
function renderStarterPick(ctx2) {
  var _a2;
  const { state: state2, ui: ui2 } = ctx2;
  if (state2.adventurers.length || !((_a2 = state2.starters) == null ? void 0 : _a2.length)) return null;
  return h(
    "div",
    { class: "matdetail-backdrop starter-backdrop" },
    h(
      "section",
      { class: "panel matdetail starterpick", role: "dialog", "aria-label": "Choose your first adventurer" },
      h("div", { class: "panel-head" }, h(
        "div",
        { class: "grow" },
        h("h2", null, "Your first adventurer"),
        h("div", { class: "muted small" }, "Pick one to found the guild. You can hire more later from the guild hall.")
      )),
      h("div", { class: "panel-body" }, h("div", { class: "starterlist" }, ...state2.starters.map((app2) => applicantCard(app2, h("button", {
        class: "btn small primary",
        onclick: () => {
          const hero = chooseStarter(state2, app2.id);
          if (hero) selectHero(ui2, hero.id);
          ctx2.refresh();
        }
      }, `Choose ${app2.name}`), false))))
    )
  );
}
function hirePanel(ctx2) {
  const { state: state2 } = ctx2;
  ensureApplicants(state2);
  const full = state2.adventurers.length >= state2.guild.memberSlots;
  const cost = refreshCost(state2);
  return shell(
    ctx2,
    full ? "Applicants" : "Hire an adventurer",
    `${state2.adventurers.length}/${state2.guild.memberSlots} members${full ? " · roster full" : ""}`,
    full ? h(
      "div",
      { class: "rosterfull", role: "status" },
      h("div", null, h("strong", null, "Roster full. "), "You can look, but hiring needs a free member slot: retire a member or unlock another slot."),
      h("button", { class: "btn small", onclick: () => openGuildSection(ctx2, "guild-roster") }, "Go to members")
    ) : null,
    h("p", { class: "muted small", style: "margin:0" }, "Each applicant brings three ambitions. Fulfilled ambitions pay fame when you retire them, more for completing more of the set (×1, ×1.5, ×2.5). More guild fame brings stronger applicants with bigger ambitions."),
    h("p", { class: "muted small", style: "margin:0" }, `At ${state2.fame} fame: ` + applicantTierOdds(state2).map((p, t) => p > 0 ? `${num(p * 100)}% ${ambitionTierNames[t]}` : "").filter(Boolean).join(", ") + (guildTier(state2) < TIER_FAME.length ? `. ${ambitionTierNames[guildTier(state2) + 1]} applicants start at ${Math.round(0.8 * TIER_FAME[guildTier(state2)])} fame.` : ".")),
    h(
      "div",
      null,
      h("h3", null, `Applicants (${applicantSlots(state2)})`),
      (state2.expansion ?? 0) < THIRD_APPLICANT_EXPANSION ? h("div", { class: "muted small", style: "margin-bottom:4px" }, `Hired applicants are replaced right away. Guild Expansion ${THIRD_APPLICANT_EXPANSION} adds a third applicant (+${applicantSlotFame(2, 3)} fame).`) : null,
      h("div", { class: "list" }, ...(state2.applicants ?? []).map((app2) => {
        const blocked = canHire(state2, app2.fee);
        return applicantCard(app2, full ? h("span", { class: "hirelocked small", title: "No free member slots" }, `${app2.fee} gold · no free slot`) : h("button", {
          class: "btn small primary",
          disabled: !!blocked,
          title: blocked ?? `Hire ${app2.name} for ${app2.fee} gold`,
          onclick: () => {
            const hired = hireApplicant(state2, app2.id);
            if (typeof hired === "string") {
              ctx2.toast(hired);
            } else {
              ctx2.ui.panel = { kind: "adventurer", id: hired.id };
              selectHero(ctx2.ui, hired.id);
            }
            ctx2.refresh();
          }
        }, `Hire · ${app2.fee} gold`));
      }))
    ),
    h(
      "div",
      { class: "row" },
      h("button", { class: "btn", disabled: state2.gold < cost, onclick: () => {
        refreshApplicants(state2);
        ctx2.refresh();
      } }, `New applicants · ${cost} gold`),
      h("button", { class: "btn", onclick: () => {
        ctx2.ui.panel = { kind: "guild" };
        ctx2.refresh();
      } }, "Back to the guild hall")
    )
  );
}
function growthText(classKey) {
  const g = classes[classKey].growth;
  return `Str ${g.str} · Dex ${g.dex} · Int ${g.int}`;
}
const pluralTypes = { staff: "Staves", axe: "Axes", bow: "Bows", sword: "Swords", greatsword: "Greatswords", dagger: "Daggers", wand: "Wands" };
const defenseNames = { armor: "Armor", evasion: "Evasion", ward: "Ward", blockChance: "Block" };
const joinOr = (parts, word) => parts.flatMap((p, i) => [...i ? [document.createTextNode(i === parts.length - 1 ? ` ${word} ` : ", ")] : [], ...p]);
function suitsLine(classKey) {
  const { weapons, defenses, note } = classes[classKey].suits;
  const weaponPart = weapons.length ? joinOr(weapons.map((t) => [itemTypeIcon(t), document.createTextNode(pluralTypes[t] ?? itemTypes[t].name)]), "or") : note ? [document.createTextNode(note)] : [];
  const defensePart = joinOr(defenses.map((d) => [document.createTextNode(defenseNames[d] ?? statDefs[d].label)]), "and");
  return h(
    "div",
    { class: "suits" },
    h("span", { class: "muted" }, "Suits "),
    ...weaponPart,
    weapons.length && note ? ` (${note.toLowerCase()})` : null,
    weaponPart.length && defensePart.length ? " · " : null,
    ...defensePart
  );
}
function heroPassives(classKey, rolled, bonuses, cls) {
  const c = classes[classKey];
  const lines = rolled ? rolled.map((p) => h("div", null, h("strong", null, `${p.enhanced ? "Enhanced " : ""}${passives[p.key].name}: `), p.enhanced ? passives[p.key].enhanced : passives[p.key].description)) : [h("div", null, h("strong", null, `${c.passive.name}: `), c.passive.description)];
  const rare = bonusText$1(bonuses);
  return h(
    "div",
    { class: cls },
    ...lines,
    suitsLine(classKey),
    h("div", { class: "muted" }, `Grows ${growthText(classKey)} per level`),
    rare.length ? h("div", null, h("span", { class: "raretag" }, "Rare"), " ", rare.join(", ")) : null
  );
}
function ambitionList(ambitions, adventurer) {
  return h("div", { class: "ambitions" }, ...ambitions.map((a) => {
    const [value, target] = adventurer ? ambitionProgress(adventurer, a) : [0, 0];
    const showCount = adventurer && !a.done && target > 1;
    const met = a.done || !!adventurer && value >= target && target > 0;
    const hint = met ? "" : ambitionHint(a);
    return h(
      "div",
      { class: "ambition" + (a.done ? " done" : "") },
      h("span", { class: "check", "aria-hidden": "true" }, a.done ? "✓" : a.kind === "boss" ? "♛" : "○"),
      h("span", { class: "grow" }, h("div", null, ambitionText(a), a.done ? h("span", { class: "sr-only" }, " (fulfilled)") : null), hint ? h("div", { class: "mods muted" }, hint) : null),
      showCount ? h("span", { class: "num muted" }, `${Math.min(value, target).toLocaleString()}/${target.toLocaleString()}`) : null,
      h("span", { class: "num" }, `${a.fame} fame`)
    );
  }));
}
function rosterSection(ctx2) {
  const { state: state2, ui: ui2 } = ctx2;
  const canRetire = state2.adventurers.length > 1;
  const confirming = state2.adventurers.find((a) => a.id === ui2.confirmRetire);
  const open2 = state2.adventurers.length < state2.guild.memberSlots;
  const hireSlot = open2 ? h(
    "button",
    { class: "slotbox hireslot", onclick: () => {
      ui2.panel = { kind: "hire" };
      ctx2.refresh();
    } },
    h("span", { class: "grow" }, "+ Hire"),
    h("span", { class: "muted small" }, "See applicants")
  ) : h(
    "div",
    { class: "list" },
    unlockBox(ctx2, "memberSlot"),
    h(
      "button",
      { class: "slotbox hireslot viewonly", onclick: () => {
        ui2.panel = { kind: "hire" };
        ctx2.refresh();
      } },
      h("span", { class: "grow" }, "View applicants"),
      h("span", { class: "muted small" }, "Roster full: retire someone to hire")
    ),
    nextSlot(state2, "memberSlot") ? null : h("div", { class: "muted small" }, "Every member slot is unlocked.")
  );
  return h(
    "div",
    { id: "guild-roster" },
    h("h3", null, `Members (${state2.adventurers.length}/${state2.guild.memberSlots})`),
    h(
      "div",
      { class: "list roster" },
      ...state2.adventurers.map((a) => {
        var _a2;
        return h(
          "div",
          { class: "row memberrow" },
          h(
            "button",
            {
              class: "item grow" + (a.id === ((_a2 = currentHero(ctx2)) == null ? void 0 : _a2.id) ? " selected" : ""),
              onclick: () => {
                ui2.panel = { kind: "adventurer", id: a.id };
                selectHero(ui2, a.id);
                ctx2.refresh();
              }
            },
            heroPortrait(a, "member") ?? classIcon(a.classKey),
            h(
              "span",
              { class: "grow memberinfo" },
              h(
                "span",
                { class: "membername" },
                h("strong", null, a.name),
                h("span", { class: "num small", title: "Ambitions fulfilled, and the fame for retiring now" }, `${(a.ambitions ?? []).filter((x) => x.done).length}/3 · ${retireFame(a)} fame`)
              ),
              h("span", { class: "small" }, `Level ${a.level} ${classes[a.classKey].name}`),
              h("span", { class: "mods" }, activityText(state2, a))
            )
          ),
          canRetire ? h("button", { class: "btn small", onclick: () => {
            ui2.confirmRetire = a.id;
            ctx2.refresh();
          } }, "Retire") : null
        );
      })
    ),
    h("div", { style: "margin-top:6px" }, hireSlot),
    confirming ? retireDialog(ctx2, confirming) : null
  );
}
function retireDialog(ctx2, adventurer) {
  const { state: state2, ui: ui2 } = ctx2;
  const worn = slotOrder.map((slot) => adventurer.equipment[slot]).filter((r) => !!r).map((ref) => {
    var _a2;
    return (_a2 = resolveItemRef(state2, ref)) == null ? void 0 : _a2.name;
  }).filter(Boolean);
  const cancel = () => {
    ui2.confirmRetire = null;
    ctx2.refresh();
  };
  return h(
    "div",
    { class: "modal-backdrop", onclick: (e) => {
      if (e.target === e.currentTarget) cancel();
    } },
    h(
      "div",
      { class: "modal", role: "dialog", "aria-modal": "true", "aria-label": `Retire ${adventurer.name}` },
      h("h3", { style: "margin-top:0" }, `Retire ${adventurer.name}?`),
      h("p", { class: "small" }, `${adventurer.name}, level ${adventurer.level} ${classes[adventurer.classKey].name}, leaves the guild for good and joins the Hall of Legends. ` + (worn.length ? `Their gear goes back to storage: ${worn.join(", ")}.` : "They have no gear to return.")),
      ambitionList(adventurer.ambitions ?? [], adventurer),
      h(
        "p",
        { class: "small" },
        h("strong", null, `The guild gains ${retireFame(adventurer)} fame.`),
        (adventurer.ambitions ?? []).some((a) => !a.done) ? " Unfulfilled ambitions pay nothing." : ""
      ),
      h(
        "div",
        { class: "row", style: "justify-content:flex-end" },
        h("button", { class: "btn", onclick: cancel }, "Cancel"),
        h("button", { class: "btn danger", onclick: () => {
          const fame = retireAdventurer(state2, adventurer);
          if (fame !== false) {
            if (ui2.hero === adventurer.id) {
              ui2.hero = null;
              ui2.runPanel = null;
            }
          }
          ui2.confirmRetire = null;
          ctx2.refresh();
        } }, `Retire ${adventurer.name}`)
      )
    )
  );
}
function guildPanel(ctx2) {
  const { state: state2 } = ctx2;
  const owned = materialOrder.filter((key) => (state2.obtained[key] ?? 0) > 0);
  const anyTrophy = Object.keys(state2.trophies ?? {}).length > 0;
  return shell(
    ctx2,
    "Guild hall",
    `Fame ${state2.fame} · ${state2.adventurers.length}/${state2.guild.memberSlots} members`,
    expansionSection(ctx2),
    rosterSection(ctx2),
    anyTrophy ? trophySection(ctx2) : null,
    contractsOpen(state2) ? contractBoard(ctx2) : null,
    h(
      "div",
      { id: "guild-achievements" },
      h("h3", null, "Upcoming achievements"),
      h("p", { class: "muted small", style: "margin:0 0 6px" }, "Each trophy tier earns fame once, and so does each slot you unlock (5, 10, 20, then 50 fame per kind of slot). Fame opens guild expansions and trophy slots."),
      upcomingAchievements(state2)
    ),
    hallOfLegends(state2),
    h(
      "div",
      null,
      h("h3", null, "Material ledger"),
      owned.length ? h("div", { class: "list" }, ...owned.map((key) => h(
        "div",
        { class: "row small" },
        h("span", { class: "grow" }, materialLink(ctx2, key), " ", h("span", { class: "power" }, `P${requireMaterial(key).power}`)),
        h("span", { class: "num" }, `${state2.materials[key] ?? 0} owned`),
        h("span", { class: "num muted", title: "Found in total, including ones since used or sold" }, `${state2.obtained[key] ?? 0} found`)
      ))) : h("div", { class: "muted small" }, "Nothing gathered yet.")
    )
  );
}
function trophyTierLabel(def, tier) {
  return `${def.name} · ${tierNames$2[tier]}`;
}
function trophySection(ctx2) {
  const { state: state2, ui: ui2 } = ctx2;
  const earned = trophyList.filter((def) => {
    var _a2;
    return (((_a2 = state2.trophies) == null ? void 0 : _a2[def.key]) ?? -1) >= 0;
  });
  const slots = state2.guild.trophySlots ?? 0;
  const equipped = state2.trophySlots ?? [];
  const picking = ui2.trophyPick;
  const trophyUnlocks = slotUnlocks.filter((u) => u.track === "trophySlot");
  const nextTrophySlot = nextSlot(state2, "trophySlot");
  const slotEls = Array.from({ length: MAX_TROPHY_SLOTS }, (_, i) => {
    var _a2;
    if (i >= slots) {
      if (i === slots && i > 0 && nextTrophySlot && nextTrophySlot.needsGoldOnly) {
        return h("button", {
          class: "trophy-slot buy",
          disabled: !!nextTrophySlot.blocked,
          title: `Unlock a trophy slot for ${nextTrophySlot.unlock.gold} gold${unlockFame(nextTrophySlot.unlock) ? ` and gain ${unlockFame(nextTrophySlot.unlock)} fame` : ""}`,
          onclick: () => {
            buySlot(state2, "trophySlot");
            ctx2.refresh();
          }
        }, h("div", { class: "small" }, "Unlock"), h("div", { class: "small muted" }, `${nextTrophySlot.unlock.gold} gold`), unlockFame(nextTrophySlot.unlock) ? h("div", { class: "small fame-gain" }, `+${unlockFame(nextTrophySlot.unlock)} fame`) : null);
      }
      const u = trophyUnlocks[i - 1];
      const why = i === 0 ? "Opens with your first trophy" : !u ? "Locked" : (state2.expansion ?? 0) >= (u.expansion ?? 0) ? "Unlock the slot before" : `Requires Guild Expansion ${u.expansion}`;
      return h("div", { class: "trophy-slot locked" }, h("div", { class: "small" }, "🔒"), h("div", { class: "small muted" }, why));
    }
    const key = equipped[i] ?? null;
    const def = key ? trophies[key] : void 0;
    const tier = key ? ((_a2 = state2.trophies) == null ? void 0 : _a2[key]) ?? -1 : -1;
    return h(
      "button",
      {
        class: "trophy-slot" + (def ? " filled tier" + tier : "") + (picking === i ? " picking" : ""),
        "data-guide": !def && picking !== i ? "trophy" : void 0,
        "aria-label": def ? `Trophy slot ${i + 1}: ${def.name}. Change` : `Trophy slot ${i + 1}: empty. Choose a trophy`,
        onclick: () => {
          ui2.trophyPick = picking === i ? null : i;
          ctx2.refresh();
        }
      },
      def ? h("div", { class: "tname" }, def.name) : h("div", { class: "muted small" }, "Empty"),
      def ? h("div", { class: "small" }, tierNames$2[tier]) : null,
      def ? h("div", { class: "mods" }, def.bonusText(def.tiers[tier].bonus)) : null,
      def ? h("div", { class: "mods muted" }, earnedText(def, tier)) : null
    );
  });
  return h(
    "div",
    { id: "guild-trophies" },
    h("h3", null, `Trophies (${earned.length} earned)`),
    h("div", { class: "trophy-slots" }, ...slotEls),
    earned.length ? null : h("p", { class: "muted small" }, "Trophies come from clearing quests, pushing endless depths and leveling each class. Each one is upgraded through Bronze, Silver, Gold and Platinum, and gives a bonus while it sits in a slot.")
  );
}
function upcomingAchievements(state2) {
  const rows = trophyList.filter((def) => def.relevant(state2)).flatMap((def) => {
    const value = def.value(state2);
    const next = tierFor(def, value) + 1;
    if (next >= def.tiers.length) return [];
    const t = def.tiers[next];
    const progress = def.key.startsWith("clear-") ? "" : `${Math.max(0, value)}/${t.target}`;
    return [h(
      "div",
      { class: "row small" },
      h(
        "span",
        { class: "grow" },
        h("div", null, def.goal(t.target)),
        h("div", { class: "mods" }, `${trophyTierLabel(def, next)}: ${def.bonusText(t.bonus)}`)
      ),
      progress ? h("span", { class: "num muted" }, progress) : null,
      h("span", { class: "num" }, `+${t.fame} fame`)
    )];
  });
  return rows.length ? h("div", { class: "list" }, ...rows) : h("div", { class: "muted small" }, "Nothing new in reach right now.");
}
function levelTag(required, level) {
  if (required <= 1) return null;
  const short = level !== void 0 && level < required;
  return h("span", { class: "lvtag" + (short ? " short" : ""), title: `Requires level ${required}` }, ` Lv ${required}`);
}
function unlockBox(ctx2, track) {
  const { state: state2 } = ctx2;
  const next = nextSlot(state2, track);
  if (!next) {
    return null;
  }
  const name = trackNames[track];
  const fame = unlockFame(next.unlock);
  if (next.needsGoldOnly) {
    return h(
      "button",
      {
        class: "slotbox buyslot",
        disabled: !!next.blocked,
        title: next.blocked ?? `Unlock a ${name} for ${next.unlock.gold} gold${fame ? ` and gain ${fame} fame` : ""}`,
        onclick: () => {
          buySlot(state2, track);
          ctx2.refresh();
        }
      },
      h("span", { class: "grow" }, h("div", null, `+ Unlock slot ${next.unlock.slot}`), h("div", { class: "small muted" }, next.blocked ?? `A ${name}`)),
      h("span", { class: "num" }, h("div", null, `${next.unlock.gold} gold`), fame ? h("div", { class: "small fame-gain" }, `+${fame} fame`) : null)
    );
  }
  if (next.expansion) {
    return h(
      "div",
      { class: "slotbox locked goal" },
      h("span", { class: "grow" }, h("div", null, `🔒 Slot ${next.unlock.slot}`), expansionLink(ctx2, next.expansion))
    );
  }
  return h(
    "div",
    { class: "slotbox locked goal" },
    h("span", { class: "grow" }, h("div", null, `🔒 Slot ${next.unlock.slot}`), h("div", { class: "small" }, next.blocked))
  );
}
function expansionLink(ctx2, level) {
  return h("button", {
    class: "textlink small",
    onclick: (e) => {
      e.stopPropagation();
      openGuildSection(ctx2, "guild-expansion");
    }
  }, `Requires Guild Expansion ${level}`);
}
function openGuildSection(ctx2, id) {
  ctx2.ui.panel = { kind: "guild" };
  ctx2.ui.scrollTo = id;
  ctx2.refresh();
}
function expansionSection(ctx2) {
  var _a2;
  const { state: state2 } = ctx2;
  const e = nextExpansion(state2);
  if (!e) {
    return null;
  }
  const short = { baseSlot: "base", decorationSlot: "decoration", accessorySlot: "accessory base", accessoryDecorationSlot: "accessory decoration", memberSlot: "member", trophySlot: "trophy" };
  const opens = slotUnlocks.filter((u) => u.expansion === e.level).map((u) => `${short[u.track]} slot ${u.slot}`);
  if (e.level === 1) opens.push("contracts");
  if (e.level === THIRD_APPLICANT_EXPANSION) opens.push(`a third applicant (+${applicantSlotFame(APPLICANT_SLOTS[e.level - 1], APPLICANT_SLOTS[e.level])} fame)`);
  if (e.level === SALVAGE_EXPANSION) opens.push("the salvage yard");
  else if (e.level > SALVAGE_EXPANSION && e.level - SALVAGE_EXPANSION + 1 <= SALVAGE_MAX) opens.push(`salvage upgrade ${e.level - SALVAGE_EXPANSION + 1}`);
  const ready = state2.fame >= e.fame;
  const prevFame = ((_a2 = expansions.find((x) => x.level === e.level - 1)) == null ? void 0 : _a2.fame) ?? 0;
  const arriving = ambitionTierNames.map((name, t) => ({ name, t, at: tierStartFame(t) })).filter((x) => x.t > 0 && x.at > prevFame && x.at <= e.fame).map((x) => {
    const newClasses = Object.values(classes).filter((c) => c.tier === x.t).map((c) => c.name);
    return `${x.name} applicants from ${x.at} fame${newClasses.length ? ` (${newClasses.join(", ")})` : ""}`;
  });
  return h(
    "div",
    { id: "guild-expansion" },
    h("h3", null, `Guild expansion ${e.level}`),
    h(
      "div",
      { class: "expansion row small" },
      h(
        "span",
        { class: "grow" },
        h("div", null, ready ? `Ready: you have ${state2.fame} fame` : `Needs ${e.fame} fame (${state2.fame}/${e.fame})`),
        h("div", { class: "mods" }, `Makes available: ${opens.join(", ")}`),
        arriving.length ? h("div", { class: "mods" }, `Around this fame: ${arriving.join("; ")}`) : null
      ),
      h("button", {
        class: "btn small" + (ready ? " primary" : ""),
        disabled: !ready || state2.gold < e.gold,
        title: !ready ? `Needs ${e.fame} fame (you have ${state2.fame})` : state2.gold < e.gold ? `Needs ${e.gold} gold` : `Expand the guild for ${e.gold} gold`,
        onclick: () => {
          expandGuild(state2);
          ctx2.refresh();
        }
      }, `Expand · ${e.gold} gold`)
    )
  );
}
const TYPE_GROUPS = [
  ["One-handed", ["sword", "axe", "dagger", "wand"]],
  ["Two-handed", ["greatsword", "bow", "staff"]],
  ["Armor", ["shield", "helmet", "bodyArmor", "gloves", "boots"]],
  ["Jewelry", ["belt", "ring", "amulet"]]
];
const SLOT_WORDS = { offHand: "Off hand", head: "Head", body: "Body", gloves: "Hands", boots: "Feet", belt: "Waist", amulet: "Neck", ring1: "Ring slots" };
function typeFacts(type) {
  const facts = [];
  if (type.damageMultiplier) facts.push(type.twoHanded ? "Two-handed" : "One-handed", `${num(type.attacksPerSecond ?? 1)} att/s`, `${num(type.damageMultiplier)}× damage`);
  else facts.push(SLOT_WORDS[type.slots[0]] ?? slotNames[type.slots[0]]);
  if (type.armorMultiplier) facts.push(`${num(type.armorMultiplier)}× armor`);
  else if (!type.damageMultiplier) facts.push("material stats only");
  return facts;
}
function typeLeans(type) {
  const names = [];
  const entries = Object.entries(type.statMultipliers ?? {}).filter(([, v]) => (v ?? 0) > 1).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));
  for (const [k] of entries) {
    const name = /^(ignite|chill|shock)Chance$|^ailmentEffect$/.test(k) ? "ailments" : k === "increasedElementalDamage" ? "elemental" : k === "critMultiplier" ? "crit damage" : k === "critChance" ? "crit chance" : k === "lifeLeech" ? "leech" : familyLabel(k).toLowerCase();
    if (!names.includes(name)) names.push(name);
    if (names.length === 3) break;
  }
  return names.join(", ");
}
const SLOT_TYPES = { mainHand: "sword", offHand: "shield", head: "helmet", body: "bodyArmor", gloves: "gloves", boots: "boots", belt: "belt", amulet: "amulet", ring1: "ring", ring2: "ring" };
function emptySlotType(adventurer, slot) {
  const def = classes[adventurer.classKey];
  if (slot === "mainHand" && (def == null ? void 0 : def.starterWeapon)) return def.starterWeapon;
  if (slot === "offHand" && (def == null ? void 0 : def.starterOffHand)) return def.starterOffHand;
  return SLOT_TYPES[slot];
}
function madeFromList(ctx2, base, decorations) {
  const list2 = (keys) => keys.flatMap((k, i) => [i ? ", " : "", materialLink(ctx2, k)]);
  return decorations.length ? [...list2(base), h("span", { class: "matsep", title: "Decorations follow" }, " · "), ...list2(decorations)] : list2(base);
}
const tierNames = { C: "common", U: "uncommon", R: "rare", M: "mythic" };
function groupByTag(table) {
  const groups = [];
  for (const type of itemTypeOrder) {
    const resolved = resolveTag(table, type);
    if (!resolved) {
      continue;
    }
    const group = groups.find((g) => g.tag === resolved.tag);
    if (group) {
      group.types.push(type);
    } else {
      groups.push({ tag: resolved.tag, value: resolved.value, types: [type] });
    }
  }
  return groups;
}
function craftLink(ctx2, key, type, extra) {
  const owned = ctx2.state.materials[key] ?? 0;
  const noBench = !hasBench(ctx2.state);
  return h("button", {
    class: "craftlink",
    disabled: owned <= 0 || noBench,
    title: noBench ? "Buy the crafting bench from the merchant first" : owned > 0 ? `Craft a ${itemTypes[type].name.toLowerCase()} with ${requireMaterial(key).name} as the first base` : "None owned",
    onclick: () => {
      ctx2.ui.bench = { itemType: type, base: [key], decorations: [] };
      ctx2.ui.picker = null;
      ctx2.ui.benchOpen = true;
      ctx2.ui.materialDetail = null;
      ctx2.refresh();
    }
  }, itemTypes[type].name + extra);
}
function baseGroupRow(ctx2, key, base, types) {
  const rows = clusterBy(types, (t) => baseStatEntries(base, (stat) => statScale(t, stat), (stat, v) => itemStatRound(stat, v, t)).map((e) => e.text).join(", "));
  return h(
    "div",
    { class: "usage" },
    ...rows.flatMap(([text, ts]) => [
      h("div", { class: "usage-types craftlinks" }, ...ts.map((t) => craftLink(ctx2, key, t, ""))),
      h("div", null, text)
    ]),
    h("div", { class: "muted small", title: base.role ? roleHint[base.role] : void 0 }, [
      base.role ? roleLabel[base.role] : "",
      slotsText(key, types),
      base.itemLabel ? `named "${base.itemLabel}"` : ""
    ].filter(Boolean).join(" · "))
  );
}
function slotsText(key, types) {
  const material = requireMaterial(key);
  const groups = clusterBy(types, (t) => {
    var _a2;
    return String(((_a2 = getBaseStats(material, t)) == null ? void 0 : _a2.maxDecorations) ?? 0);
  });
  const label = (n) => `${n} decoration slot${n === "1" ? "" : "s"}`;
  return groups.length === 1 ? label(groups[0][0]) : groups.map(([n, ts]) => `${label(n)} (${ts.map((t) => itemTypes[t].name.toLowerCase()).join(", ")})`).join(", ");
}
function clusterBy(types, label) {
  const out = [];
  for (const t of types) {
    const text = label(t);
    const row = out.find((r) => r[0] === text);
    if (row) row[1].push(t);
    else out.push([text, [t]]);
  }
  return out;
}
function decorationLink(ctx2, key, type) {
  const bench = ctx2.ui.bench;
  const same = bench.itemType === type;
  const limit = getDecorationLimit(ctx2.state, type);
  const filled = bench.decorations.filter(Boolean).length;
  const slot = same ? filled < limit ? filled : void 0 : 0;
  const used = same ? [...bench.base, ...bench.decorations].filter((k) => k === key).length : 0;
  const owned = ctx2.state.materials[key] ?? 0;
  const blocked = !hasBench(ctx2.state) ? "Buy the crafting bench from the merchant first" : owned <= used ? owned ? "All of them are already on the bench" : "None owned" : slot === void 0 ? "No empty decoration slot on the bench" : null;
  return h("button", {
    class: "craftlink",
    disabled: !!blocked,
    title: blocked ?? (same ? `Add ${requireMaterial(key).name} to the ${itemTypes[type].name.toLowerCase()} on the bench` : `Start a ${itemTypes[type].name.toLowerCase()} with ${requireMaterial(key).name} as a decoration`),
    onclick: () => {
      if (same) {
        bench.decorations = [...bench.decorations.filter(Boolean), key];
      } else {
        ctx2.ui.bench = { itemType: type, base: [], decorations: [key] };
      }
      ctx2.ui.picker = null;
      ctx2.ui.benchOpen = true;
      ctx2.ui.materialDetail = null;
      ctx2.refresh();
    }
  }, itemTypes[type].name + (same ? " (on bench)" : ""));
}
function decorationGroupRow(ctx2, key, stats, types) {
  const scaled = (t) => Object.fromEntries(Object.entries(stats).map(([stat, v]) => [stat, roundStat(stat, itemStatRound(stat, v * decorationScale(t, stat), t))]));
  const rows = clusterBy(types, (t) => formatStats(scaled(t)));
  return h("div", { class: "usage" }, ...rows.flatMap(([text, ts]) => [
    h("div", { class: "usage-types craftlinks" }, ...ts.map((t) => decorationLink(ctx2, key, t))),
    h("div", null, text)
  ]));
}
function equipRow(ctx2, key, type) {
  const { state: state2, ui: ui2 } = ctx2;
  const hero = currentHero(ctx2);
  if (!hero) return null;
  const ref = { kind: "material", key };
  const slots = itemTypes[type].slots;
  const slot = slots.find((s) => !hero.equipment[s] && canEquipInSlot(state2, hero, ref, s)) ?? slots.find((s) => canEquipInSlot(state2, hero, ref, s)) ?? slots[0];
  const owned = state2.materials[key] ?? 0;
  const level = itemLevelRequirement(state2, ref);
  const why = owned < 1 ? "None owned" : hero.level < level ? `${hero.name} needs level ${level} (now ${hero.level})` : slot === "offHand" && isTwoHandedEquipped(state2, hero) ? `${hero.name}'s two-handed weapon uses the off hand` : !canEquipInSlot(state2, hero, ref, slot) ? `Doesn't fit ${hero.name}'s ${slotNames[slot].toLowerCase()}` : null;
  const replaces = hero.equipment[slot];
  const openSlot = () => {
    ui2.panel = { kind: "adventurer", id: hero.id };
    ui2.selectedSlot = slot;
    ui2.scrollTo = "gearopt-" + key;
    ui2.materialDetail = null;
    ctx2.refresh();
  };
  const compare = slot === "offHand" && isTwoHandedEquipped(state2, hero) ? null : deltaLine(state2, hero, slot, ref, `${hero.name} · ${slotNames[slot]}`);
  return h("div", null, h(
    "div",
    { class: "row small", style: "margin-top:4px" },
    why ? h("button", { class: "btn small", onclick: openSlot }, `Show ${hero.name}'s ${slotNames[slot].toLowerCase()}`) : h("button", { class: "btn small primary", onclick: () => {
      if (equip(state2, hero, ref, slot)) state2.guide = { ...state2.guide, manualEquip: true };
      ui2.materialDetail = null;
      ui2.panel = { kind: "adventurer", id: hero.id };
      ui2.selectedSlot = null;
      ui2.scrollTo = "equipment";
      ctx2.refresh();
    } }, `Equip on ${hero.name}`),
    h("span", { class: "grow" + (why ? " bad" : " muted") }, why ?? (replaces ? `Replaces what's in the ${slotNames[slot].toLowerCase()} slot` : `Goes in the empty ${slotNames[slot].toLowerCase()} slot`))
  ), compare);
}
function foundIn(ctx2, key) {
  const found = [];
  for (const questKey of questOrder) {
    const progress = getQuestProgress(ctx2.state, questKey);
    for (const tier of ["C", "U", "R", "M"]) {
      if (progress.revealed[tier].includes(key)) {
        found.push(`${quests[questKey].name} (${tierNames[tier]})`);
      }
    }
    const boss = quests[questKey].boss;
    if ((boss == null ? void 0 : boss.legendary) === key && (ctx2.state.obtained[key] ?? 0) > 0) {
      found.push(`${monsters[boss.monster].name} in ${quests[questKey].name} (legendary, ambition boss)`);
    }
  }
  return found;
}
function unusedTypes(material) {
  return itemTypeOrder.filter((t) => {
    var _a2;
    return !resolveTag(material.base, t) && !resolveTag(material.decoration, t) && ((_a2 = material.equip) == null ? void 0 : _a2.itemType) !== t;
  });
}
function renderMaterialDetail(ctx2) {
  const key = ctx2.ui.materialDetail;
  if (!key) {
    return null;
  }
  const material = requireMaterial(key);
  const close = () => {
    ctx2.ui.materialDetail = null;
    ctx2.refresh();
  };
  const baseGroups = groupByTag(material.base);
  const decoGroups = groupByTag(material.decoration);
  const equip2 = material.equip ? getMaterialEquipStats(material) : void 0;
  const premium = isPremium(key);
  const found = foundIn(ctx2, plainKey(key));
  const otherKey = premium ? plainKey(key) : premiumKey(key);
  const otherOwned = (ctx2.state.obtained[otherKey] ?? 0) > 0;
  const openOther = () => {
    ctx2.ui.materialDetail = otherKey;
    ctx2.refresh();
  };
  const unused = unusedTypes(material);
  const known = (ctx2.state.obtained[key] ?? 0) > 0 || (ctx2.state.obtained[otherKey] ?? 0) > 0;
  const section = (title, hint, rows) => rows.length ? h(
    "div",
    null,
    h("h3", null, title),
    h("p", { class: "muted small", style: "margin:0 0 6px" }, hint),
    h("div", { class: "list" }, ...rows)
  ) : null;
  return h(
    "div",
    { class: "matdetail-backdrop", onclick: (event) => {
      if (event.target === event.currentTarget) close();
    } },
    h(
      "section",
      { class: "panel matdetail", role: "dialog", "aria-label": `${material.name} details` },
      h(
        "div",
        { class: "panel-head" },
        h(
          "div",
          { class: "grow" },
          h("h2", { class: premium ? "premium-name" : "" }, materialIcon(key), material.name, " ", h("span", { class: "power" }, `P${material.power}`)),
          h("div", { class: "muted small" }, `${ctx2.state.materials[key] ?? 0} owned · ${ctx2.state.obtained[key] ?? 0} gathered in total`)
        ),
        h("button", { class: "btn", onclick: close }, "Close")
      ),
      h(
        "div",
        { class: "panel-body" },
        ...!known ? [
          h(
            "div",
            { class: "unknownmat" },
            h("strong", null, "Not found yet"),
            h("div", { class: "small" }, "What it is and how it crafts are revealed once the guild obtains one.")
          ),
          premium ? h(
            "div",
            { class: "small" },
            h("button", { class: "textlink", onclick: openOther }, `See ${requireMaterial(otherKey).name}, its plain version`),
            ` · a ${requireMaterial(otherKey).name} drop has a ${num(PREMIUM_CHANCE * 100)}% chance to be premium`
          ) : null,
          h("div", { class: "muted small" }, found.length ? `Found in ${found.join(", ")}.` : "You have not found where this drops yet.")
        ] : [
          material.description ? h("p", { style: "margin:0" }, material.description) : null,
          h("div", { class: "muted small" }, premium ? `Any ${requireMaterial(otherKey).name} drop has a ${num(PREMIUM_CHANCE * 100)}% chance to be premium` + (found.length ? `: ${found.join(", ")}.` : ".") : found.length ? `Found in ${found.join(", ")}.` : "You have not found where this drops yet."),
          premium || otherOwned ? h(
            "div",
            { class: "small" },
            h("button", { class: "textlink" + (premium ? "" : " premium-name"), onclick: openOther }, premium ? `Compare with ${requireMaterial(otherKey).name}` : `See ${requireMaterial(otherKey).name} (${ctx2.state.materials[otherKey] ?? 0} owned)`)
          ) : null,
          section(
            "As a base material",
            CAP_RULE + " Pick an item type to start crafting it with this material.",
            baseGroups.map((g) => baseGroupRow(ctx2, key, g.value, g.types))
          ),
          section(
            "As a decoration",
            "Added on top of the base caps. Two-handed weapons get larger values to make up for the missing off hand. Pick an item type to put it on the bench; add a base to make its slot valid.",
            decoGroups.map((g) => decorationGroupRow(ctx2, key, g.value, g.types))
          ),
          material.equip && equip2 ? section("Worn directly", "Equip the material itself without crafting. It uses up one from your stock while worn.", [
            h(
              "div",
              { class: "usage" },
              h("div", { class: "usage-types" }, `${material.equip.name} · ${itemTypes[material.equip.itemType].name}`),
              h("div", null, [formatStats(equip2.stats), equip2.attacksPerSecond ? `${num(equip2.attacksPerSecond)} attacks/s` : ""].filter(Boolean).join(" · ")),
              equipRow(ctx2, key, material.equip.itemType)
            )
          ]) : null,
          unused.length ? h("div", { class: "muted small" }, `No use in: ${unused.map((t) => itemTypes[t].name).join(", ")}.`) : null
        ]
      )
    )
  );
}
const parchment = "" + new URL("parchment-EPwGY_yQ.webp", import.meta.url).href;
const darkwood = "" + new URL("darkwood-CHWeJTaY.webp", import.meta.url).href;
function installTextures() {
  const root = document.documentElement.style;
  root.setProperty("--tex-parchment", `url("${parchment}")`);
  root.setProperty("--tex-darkwood", `url("${darkwood}")`);
}
const __vite_glob_0_0 = "" + new URL("amberHive-CpPswkvp.webp", import.meta.url).href;
const __vite_glob_0_1 = "" + new URL("ashenPeaks-Dkeo3plI.webp", import.meta.url).href;
const __vite_glob_0_2 = "" + new URL("bench-4T9FS6hz.webp", import.meta.url).href;
const __vite_glob_0_3 = "" + new URL("brambleRoad-DiQa68NB.webp", import.meta.url).href;
const __vite_glob_0_4 = "" + new URL("duskgraveNecropolis-Pd0mQqm_.webp", import.meta.url).href;
const __vite_glob_0_5 = "" + new URL("guild-DWbDXXL4.webp", import.meta.url).href;
const __vite_glob_0_6 = "" + new URL("hollowMines-BksNyQcL.webp", import.meta.url).href;
const __vite_glob_0_7 = "" + new URL("ironboundFoundry-Bf4EePH7.webp", import.meta.url).href;
const __vite_glob_0_8 = "" + new URL("locked-BrRXN8Zb.webp", import.meta.url).href;
const __vite_glob_0_9 = "" + new URL("merchant-CrPrnnSF.webp", import.meta.url).href;
const __vite_glob_0_10 = "" + new URL("peddler-hxf03nbm.webp", import.meta.url).href;
const __vite_glob_0_11 = "" + new URL("salvage-Y0eJzyX7.webp", import.meta.url).href;
const __vite_glob_0_12 = "" + new URL("shatteredThrone-Bl6Bl3ao.webp", import.meta.url).href;
const __vite_glob_0_13 = "" + new URL("skyspireAerie-i2jN_FZy.webp", import.meta.url).href;
const __vite_glob_0_14 = "" + new URL("sunderedRift-BrF-yD1M.webp", import.meta.url).href;
const __vite_glob_0_15 = "" + new URL("sunkenMarsh-VyrwcZiR.webp", import.meta.url).href;
const __vite_glob_0_16 = "" + new URL("thunderheadCrags-D9_ITqgr.webp", import.meta.url).href;
const __vite_glob_1_0 = "" + new URL("autumn-B-r_oVCF.webp", import.meta.url).href;
const __vite_glob_1_1 = "" + new URL("berrybush-BCUZJyFZ.webp", import.meta.url).href;
const __vite_glob_1_2 = "" + new URL("birch-ghSJPKhS.webp", import.meta.url).href;
const __vite_glob_1_3 = "" + new URL("boulders-CPSsP6nx.webp", import.meta.url).href;
const __vite_glob_1_4 = "" + new URL("bush-Czq0Wraz.webp", import.meta.url).href;
const __vite_glob_1_5 = "" + new URL("flowers-BieqtazO.webp", import.meta.url).href;
const __vite_glob_1_6 = "" + new URL("grass-Cqra7EVP.webp", import.meta.url).href;
const __vite_glob_1_7 = "" + new URL("hill-_7hIL384.webp", import.meta.url).href;
const __vite_glob_1_8 = "" + new URL("mesa-CVU1rofs.webp", import.meta.url).href;
const __vite_glob_1_9 = "" + new URL("oak-Cmo_n4VD.webp", import.meta.url).href;
const __vite_glob_1_10 = "" + new URL("peaks-DpLzSicW.webp", import.meta.url).href;
const __vite_glob_1_11 = "" + new URL("pine1-TpEUXgx6.webp", import.meta.url).href;
const __vite_glob_1_12 = "" + new URL("pine2-CILT1_us.webp", import.meta.url).href;
const __vite_glob_1_13 = "" + new URL("pine3-CO7z9hEB.webp", import.meta.url).href;
const __vite_glob_1_14 = "" + new URL("pine4-CepdmMme.webp", import.meta.url).href;
const __vite_glob_1_15 = "" + new URL("pine5-Bme7TOpy.webp", import.meta.url).href;
const __vite_glob_1_16 = "" + new URL("pond-Dl15t8zT.webp", import.meta.url).href;
const __vite_glob_1_17 = "" + new URL("snowpeak-BH9Rui85.webp", import.meta.url).href;
const __vite_glob_1_18 = "" + new URL("stump-DXxK9PYd.webp", import.meta.url).href;
const __vite_glob_1_19 = "" + new URL("volcano-C_flx5BQ.webp", import.meta.url).href;
const groundUrl = "" + new URL("base-bNqKrVP1.webp", import.meta.url).href;
const siteFiles = /* @__PURE__ */ Object.assign({ "../assets/map/sites/amberHive.webp": __vite_glob_0_0, "../assets/map/sites/ashenPeaks.webp": __vite_glob_0_1, "../assets/map/sites/bench.webp": __vite_glob_0_2, "../assets/map/sites/brambleRoad.webp": __vite_glob_0_3, "../assets/map/sites/duskgraveNecropolis.webp": __vite_glob_0_4, "../assets/map/sites/guild.webp": __vite_glob_0_5, "../assets/map/sites/hollowMines.webp": __vite_glob_0_6, "../assets/map/sites/ironboundFoundry.webp": __vite_glob_0_7, "../assets/map/sites/locked.webp": __vite_glob_0_8, "../assets/map/sites/merchant.webp": __vite_glob_0_9, "../assets/map/sites/peddler.webp": __vite_glob_0_10, "../assets/map/sites/salvage.webp": __vite_glob_0_11, "../assets/map/sites/shatteredThrone.webp": __vite_glob_0_12, "../assets/map/sites/skyspireAerie.webp": __vite_glob_0_13, "../assets/map/sites/sunderedRift.webp": __vite_glob_0_14, "../assets/map/sites/sunkenMarsh.webp": __vite_glob_0_15, "../assets/map/sites/thunderheadCrags.webp": __vite_glob_0_16 });
const decoFiles = /* @__PURE__ */ Object.assign({ "../assets/map/deco/autumn.webp": __vite_glob_1_0, "../assets/map/deco/berrybush.webp": __vite_glob_1_1, "../assets/map/deco/birch.webp": __vite_glob_1_2, "../assets/map/deco/boulders.webp": __vite_glob_1_3, "../assets/map/deco/bush.webp": __vite_glob_1_4, "../assets/map/deco/flowers.webp": __vite_glob_1_5, "../assets/map/deco/grass.webp": __vite_glob_1_6, "../assets/map/deco/hill.webp": __vite_glob_1_7, "../assets/map/deco/mesa.webp": __vite_glob_1_8, "../assets/map/deco/oak.webp": __vite_glob_1_9, "../assets/map/deco/peaks.webp": __vite_glob_1_10, "../assets/map/deco/pine1.webp": __vite_glob_1_11, "../assets/map/deco/pine2.webp": __vite_glob_1_12, "../assets/map/deco/pine3.webp": __vite_glob_1_13, "../assets/map/deco/pine4.webp": __vite_glob_1_14, "../assets/map/deco/pine5.webp": __vite_glob_1_15, "../assets/map/deco/pond.webp": __vite_glob_1_16, "../assets/map/deco/snowpeak.webp": __vite_glob_1_17, "../assets/map/deco/stump.webp": __vite_glob_1_18, "../assets/map/deco/volcano.webp": __vite_glob_1_19 });
function byName(files2) {
  const out = {};
  for (const [path, url] of Object.entries(files2)) {
    const m = /\/(\w+)\.webp$/.exec(path);
    if (m) out[m[1]] = url;
  }
  return out;
}
const siteUrls = byName(siteFiles);
const decoUrls = byName(decoFiles);
function siteArtUrl(key) {
  return siteUrls[key];
}
function decoUrl(key) {
  return decoUrls[key];
}
const mapGroundUrl = groundUrl;
const GROUND = { x: -1e3, y: -420, w: 2700, h: 1519 };
const SEA_X = 1060;
const TREES = ["pine1", "pine2", "oak", "pine3", "pine4", "birch", "pine5", "oak", "pine2", "pine4", "oak", "autumn"];
const BUSHES = ["bush", "berrybush"];
const SMALL = ["grass", "flowers"];
const ROCKS = ["boulders", "stump"];
const MOUNTAINS = [
  { x: 700, y: 30, key: "peaks", h: 54 },
  { x: 870, y: 10, key: "snowpeak", h: 60 },
  { x: 1030, y: 20, key: "snowpeak", h: 52 },
  { x: 640, y: 110, key: "hill", h: 40 },
  { x: 880, y: 140, key: "volcano", h: 44 },
  { x: 1020, y: 170, key: "peaks", h: 46 },
  { x: 560, y: -40, key: "hill", h: 42 },
  { x: 760, y: -60, key: "snowpeak", h: 56 },
  { x: 980, y: -70, key: "peaks", h: 50 },
  { x: 300, y: -70, key: "hill", h: 40 },
  { x: 1180, y: -20, key: "mesa", h: 44 },
  { x: 300, y: 700, key: "hill", h: 40 },
  { x: 940, y: 520, key: "mesa", h: 40 },
  { x: 640, y: 690, key: "hill", h: 38 }
];
const glyphs = {
  guild: '<svg viewBox="0 0 32 32"><path d="M5 15 16 6l11 9"/><path d="M8 13v13h16V13"/><path d="M13 26v-7h6v7"/><path d="M16 6V2l5 1.5L16 5"/></svg>',
  bench: '<svg viewBox="0 0 32 32"><path d="M4 11h17c0 4 3 5 7 5v3H19l-2 3h3v4H8v-4h3l-2-3H4z"/></svg>',
  quest: '<svg viewBox="0 0 32 32"><path d="M8 29V4"/><path d="M8 5h16l-4 5 4 5H8"/></svg>',
  salvage: '<svg viewBox="0 0 32 32"><path d="M5 27 17 15"/><path d="M14 10l7-6 7 7-6 7z"/><path d="M6 8h6M9 5v6"/></svg>',
  merchant: '<svg viewBox="0 0 32 32"><path d="M5 13h22l-2-6H7z"/><path d="M7 13v13h18V13"/><path d="M13 26v-7h6v7"/><path d="M5 13c0 2 2 3 4 3s4-1 4-3c0 2 2 3 3 3s3-1 3-3c0 2 2 3 4 3s4-1 4-3"/></svg>',
  peddler: '<svg viewBox="0 0 32 32"><path d="M4 22h18l3-9H8"/><path d="M8 13 6 7H3"/><circle cx="9" cy="26" r="2"/><circle cx="20" cy="26" r="2"/><path d="M12 13l3-5 3 5"/></svg>',
  map: '<svg viewBox="0 0 32 32"><path d="M4 8l7-3 10 3 7-3v19l-7 3-10-3-7 3z"/><path d="M11 5v19M21 8v19"/></svg>',
  battle: '<svg viewBox="0 0 32 32"><path d="M5 5l15 15M27 5 12 20"/><path d="M17 23l6-6M9 17l6 6"/><path d="M21 21l5 5M11 21l-5 5"/></svg>',
  lock: '<svg viewBox="0 0 32 32"><rect x="8" y="14" width="16" height="13" rx="2"/><path d="M11 14v-4a5 5 0 0 1 10 0v4"/></svg>'
};
const questLooks = {
  brambleRoad: { color: "#4f8a3a", glyph: '<svg viewBox="0 0 32 32"><path d="M16 29V17"/><path d="M16 4c-6 0-9 4-9 8 0 3 3 6 9 6s9-3 9-6c0-4-3-8-9-8z"/><path d="M12 22l4-3 4 3"/></svg>' },
  hollowMines: { color: "#7b6650", glyph: '<svg viewBox="0 0 32 32"><path d="M8 27 21 14"/><path d="M6 11c7-6 15-5 20 2-6-3-11-3-15 1z"/></svg>' },
  ashenPeaks: { color: "#c2532c", glyph: '<svg viewBox="0 0 32 32"><path d="M3 27 12 13h8l9 14z"/><path d="M12 13l2 3 2-2 2 2 2-3"/><path d="M14 9c-1-2 0-4 2-5M18 9c1-2 3-3 5-3"/></svg>' },
  sunkenMarsh: { color: "#3d7f70", glyph: '<svg viewBox="0 0 32 32"><path d="M4 25c3-2 5-2 8 0s5 2 8 0 5-2 8 0"/><path d="M10 21V10M16 21V6M22 21V12"/><path d="M16 6c-2 1-2 5 0 6 2-1 2-5 0-6z"/></svg>' },
  thunderheadCrags: { color: "#356fb5", glyph: '<svg viewBox="0 0 32 32"><path d="M19 3 9 17h7l-3 12 10-15h-7z"/></svg>' },
  sunderedRift: { color: "#7a55b8", glyph: '<svg viewBox="0 0 32 32"><path d="M16 3l8 9-8 17-8-17z"/><path d="M8 12h16M13 12l3-9 3 9-3 17z"/></svg>' },
  amberHive: { color: "#cf8f22", glyph: '<svg viewBox="0 0 32 32"><path d="M16 4l5 3v6l-5 3-5-3V7z"/><path d="M10 15l5 3v6l-5 3-5-3v-6z"/><path d="M22 15l5 3v6l-5 3-5-3v-6z"/></svg>' },
  duskgraveNecropolis: { color: "#565c7c", glyph: '<svg viewBox="0 0 32 32"><path d="M9 27V13a7 7 0 0 1 14 0v14z"/><path d="M16 13v9M12.5 16.5h7"/><path d="M5 27h22"/></svg>' },
  ironboundFoundry: { color: "#97632b", glyph: '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="4"/><circle cx="16" cy="16" r="9"/><path d="M16 3v4M16 25v4M3 16h4M25 16h4M6.8 6.8l2.8 2.8M22.4 22.4l2.8 2.8M6.8 25.2l2.8-2.8M22.4 9.6l2.8-2.8"/></svg>' },
  skyspireAerie: { color: "#3c97bf", glyph: '<svg viewBox="0 0 32 32"><path d="M25 4C13 6 7 14 7 28"/><path d="M25 4c-1 9-7 15-15 17"/><path d="M13 17l7-1M11 22l6-1M16 12l6-1"/></svg>' },
  shatteredThrone: { color: "#a5345a", glyph: '<svg viewBox="0 0 32 32"><path d="M6 24 4 10l7 6 5-9 5 9 7-6-2 14z"/><path d="M6 28h20"/></svg>' }
};
const siteColors = { guild: "#8a5a12", bench: "#7a4f2a", merchant: "#2f7d4f", salvage: "#6a6f78", peddler: "#9a6b2e" };
installTextures();
const MAP_W = 1300, MAP_H = 720;
const sites = {
  guild: { x: 125, y: 180 },
  bench: { x: 265, y: 310 },
  merchant: { x: 220, y: 20 },
  salvage: { x: 110, y: 395 },
  // The travelling peddler stops between Bramble Road and the tier 2 areas.
  peddler: { x: 505, y: 260 }
};
const futureSites = [
  { key: "g1", name: "Guild building", sub: "Reserved", x: -55, y: 270 },
  { key: "g2", name: "Guild building", sub: "Reserved", x: -10, y: 80 }
];
const roads = [
  ["guild", "bench", false, -0.12],
  ["guild", "brambleRoad", false, -0.12],
  ["brambleRoad", "hollowMines", false, 0.12],
  ["hollowMines", "ashenPeaks", false, 0],
  ["hollowMines", "sunkenMarsh", false, 0.12],
  ["hollowMines", "thunderheadCrags", false, -0.3],
  ["ashenPeaks", "sunderedRift", false, 0.06],
  ["sunkenMarsh", "sunderedRift", false, -0.12],
  ["thunderheadCrags", "sunderedRift", false, -0.2],
  ["sunderedRift", "amberHive", false, -0.12],
  ["sunderedRift", "duskgraveNecropolis", false, -0.06],
  ["sunderedRift", "ironboundFoundry", false, -0.12],
  ["sunderedRift", "skyspireAerie", false, 0.12],
  ["sunderedRift", "shatteredThrone", false, -0.12],
  ["merchant", "brambleRoad", false, 0.12],
  ["g1", "guild", true, 0.12],
  ["g2", "guild", true, 0.12],
  ["salvage", "bench", false, 0.12]
];
let showFuture = false;
let state = loadGame();
let speed = 1;
let theme = "auto";
function applyTheme() {
  if (theme === "auto") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;
}
const themeIcons = {
  auto: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/></svg>',
  light: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/></svg>',
  dark: '<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></svg>'
};
let devOpen = false;
let toastTimer = 0;
function freshUi() {
  return {
    panel: null,
    benchOpen: false,
    picker: null,
    runPanel: null,
    view: "map",
    selectedSlot: null,
    selectedEncounter: {},
    bench: { itemType: "sword", base: [], decorations: [] },
    materialDetail: null,
    // On for new players; a saved view keeps the player's choice.
    hideTooHigh: true
  };
}
const ui = freshUi();
const ctx = {
  get state() {
    return state;
  },
  ui,
  refresh: () => {
    renderAll();
  },
  toast: showToast
};
const app = document.getElementById("app");
const hud = h("header", { class: "hud" });
const map = h("main", { class: "map" });
const world = h("div", { class: "world" });
const canvas = h("div", { class: "canvas", style: `width:${MAP_W}px;height:${MAP_H}px` });
world.appendChild(canvas);
map.appendChild(world);
app.append(hud, map);
function renderHud() {
  hud.replaceChildren(
    h("div", { class: "hud-title" }, "Guildwright"),
    h("div", { class: "hud-stat" }, h("span", { class: "label" }, "Gold"), h("span", { class: "value", id: "hud-gold" }, shortNumber(state.gold))),
    h("div", { class: "hud-stat" }, h("span", { class: "label" }, "Fame"), h("span", { class: "value", id: "hud-fame" }, shortNumber(state.fame))),
    hudActions(),
    heroBar(),
    h(
      "div",
      { class: "seg", role: "group", "aria-label": "Game speed", title: "Game speed (Space)" },
      ...[1, 4, 16].map((s, i, all) => h("button", { class: speed === s ? "on" : "", onclick: () => {
        speed = narrowScreen.matches && speed === s ? all[(i + 1) % all.length] : s;
        renderHud();
        saveView();
      } }, `${s}×`))
    ),
    h("button", {
      class: "btn themebtn",
      title: `Theme: ${theme === "auto" ? "follows your device" : theme}. Click to change.`,
      "aria-label": `Theme: ${theme}. Change theme`,
      onclick: () => {
        theme = theme === "auto" ? "light" : theme === "light" ? "dark" : "auto";
        applyTheme();
        renderHud();
        saveView();
      }
    }, svg(themeIcons[theme]), h("span", { class: "themelabel" }, theme === "auto" ? "Auto" : theme === "light" ? "Light" : "Dark")),
    h("button", { class: "btn devbtn", onclick: () => {
      devOpen = !devOpen;
      renderHud();
    } }, "Dev"),
    ...devOpen ? [devMenu()] : []
  );
}
const narrowScreen = matchMedia("(max-width: 760px)");
narrowScreen.addEventListener("change", () => renderAll());
function panelsOpen() {
  return !!(ui.panel || ui.benchOpen || ui.shopOpen || ui.picker || ui.materialDetail);
}
function closePanels() {
  ui.panel = null;
  ui.benchOpen = false;
  ui.shopOpen = false;
  ui.picker = null;
  ui.materialDetail = null;
}
let hudActionEls = [];
function hudAction(key, label, glyph, color, onclick) {
  const el = h("button", { class: "hudact", style: `--site:${color}`, title: label, "aria-label": label, onclick }, svg(glyph));
  return { key, el };
}
function hudActions() {
  hudActionEls = [
    hudAction("map", "Show the map (M)", glyphs.map, "#8c3b2e", () => {
      closePanels();
      ui.view = "map";
      renderAll();
    }),
    hudAction("view", "", glyphs.battle, "#8c3b2e", () => {
      if (narrowScreen.matches) {
        closePanels();
        ui.view = "battle";
      } else ui.view = ui.view === "battle" ? "map" : "battle";
      renderAll();
    }),
    // Each place button toggles: a second press closes what it opened.
    hudAction("quest", "Quest (Q)", glyphs.quest, "#4f6a8c", () => {
      toggleHudQuest();
    }),
    hudAction("guild", "Guild hall (G)", glyphs.guild, siteColors.guild, () => togglePanel("guild")),
    hudAction("merchant", "Merchant (S)", glyphs.merchant, siteColors.merchant, () => {
      if (ui.shopOpen) closeLeft();
      else openShop();
    }),
    hudAction("bench", "Crafting bench (W)", glyphs.bench, siteColors.bench, () => {
      if (ui.benchOpen || !hasBench(state) && ui.shopOpen) closeLeft();
      else openBench();
    }),
    hudAction("peddler", "Travelling peddler (P)", glyphs.peddler, siteColors.peddler, () => togglePanel("peddler")),
    hudAction("salvage", "Salvage yard (Y)", glyphs.salvage, siteColors.salvage, () => togglePanel("salvage"))
  ];
  updateHudActions();
  return h("div", { class: "hud-actions", role: "group", "aria-label": "Places" }, ...hudActionEls.map((a) => a.el));
}
function updateHudActions() {
  var _a2, _b2, _c2;
  for (const { key, el } of hudActionEls) {
    const split = narrowScreen.matches;
    if (key === "map") {
      el.hidden = !split;
      el.classList.toggle("viewact", true);
      el.classList.toggle("open", split && ui.view !== "battle" && !panelsOpen());
      continue;
    }
    if (key === "view") {
      el.classList.toggle("open", split && ui.view === "battle" && !panelsOpen());
      const battle = ui.view === "battle" && !split;
      const hero = state.adventurers.find((a) => a.id === ui.hero) ?? state.adventurers[0];
      const onQuest = !!((hero == null ? void 0 : hero.run) && hero.assignment);
      const label = battle ? "Back to the map (M)" : onQuest ? `Watch ${hero.name}'s fight (B)` : `${(hero == null ? void 0 : hero.name) ?? "The selected hero"} isn't on a quest`;
      const glyph = battle ? "map" : "battle";
      if (el.dataset.glyph !== glyph) {
        el.dataset.glyph = glyph;
        el.replaceChildren(svg(glyphs[glyph]));
      }
      el.disabled = !battle && !onQuest;
      el.title = label;
      el.setAttribute("aria-label", label);
      el.classList.toggle("viewact", true);
      continue;
    }
    if (key === "quest") {
      const qk = hudQuestKey();
      el.hidden = !qk;
      el.classList.toggle("open", !!qk && ((_a2 = ui.panel) == null ? void 0 : _a2.kind) === "quest" && ui.panel.key === qk);
      const label = qk ? `${quests[qk].name} (Q)` : "Quest (Q)";
      if (el.title !== label) {
        el.title = label;
        el.setAttribute("aria-label", label);
      }
      continue;
    }
    const visible = key === "peddler" ? peddlerUnlocked(state) && !!state.peddler : key === "salvage" ? salvageVisible(state) : key === "bench" ? hasBench(state) : true;
    el.hidden = !visible;
    const open2 = key === "guild" ? ((_b2 = ui.panel) == null ? void 0 : _b2.kind) === "guild" : key === "merchant" ? !!ui.shopOpen : key === "bench" ? ui.benchOpen : ((_c2 = ui.panel) == null ? void 0 : _c2.kind) === key;
    el.classList.toggle("open", open2);
    el.classList.toggle("dim", key === "bench" && !hasBench(state) || key === "salvage" && !salvageLevel(state) || key === "peddler" && !peddlerHere(state));
  }
}
function clearGameUi() {
  Object.assign(ui, {
    view: "map",
    panel: null,
    benchOpen: false,
    shopOpen: false,
    picker: null,
    decoSkipped: false,
    runPanel: null,
    selectedSlot: null,
    selectedEncounter: {},
    bench: { itemType: "sword", base: [], decorations: [] },
    materialDetail: null,
    hero: null,
    confirmRetire: null,
    trophyPick: null,
    recap: null,
    salvaging: null,
    scrollTo: null,
    questTab: {}
  });
  saveView();
}
function saveTools() {
  const box = h("textarea", { class: "savebox", rows: "2", placeholder: "Save text", "aria-label": "Save text" });
  const doImport = (text) => {
    const error = importSave(text);
    if (error) {
      showToast(error);
      return;
    }
    state = loadGame();
    invalidateStats();
    clearGameUi();
    devOpen = false;
    buildMap();
    renderAll();
    showToast("Save imported");
  };
  return h(
    "div",
    { class: "savetools" },
    h(
      "div",
      { class: "row" },
      h("button", { class: "btn", onclick: async () => {
        saveGame(state);
        box.value = exportSave(state);
        try {
          await navigator.clipboard.writeText(box.value);
          showToast("Save copied to the clipboard");
        } catch {
          box.select();
          showToast("Copy the save text from the box");
        }
      } }, "Export save"),
      h("button", { class: "btn", onclick: async () => {
        if (box.value.trim()) {
          doImport(box.value);
          return;
        }
        try {
          doImport(await navigator.clipboard.readText());
        } catch {
          box.focus();
          showToast("Paste the save text into the box, then import");
        }
      } }, "Import save"),
      h("button", { class: "btn", title: "Copy the selected hero's gear and stats as a build recipe (JSON) to report", onclick: async () => {
        const hero = state.adventurers.find((a) => a.id === ui.hero) ?? state.adventurers[0];
        if (!hero) {
          showToast("No hero to export");
          return;
        }
        box.value = JSON.stringify(exportBuild(state, hero), null, 2);
        try {
          await navigator.clipboard.writeText(box.value);
          showToast(`${hero.name}'s build copied to the clipboard`);
        } catch {
          box.select();
          showToast("Copy the build from the box");
        }
      } }, "Export build")
    ),
    box
  );
}
function devMenu() {
  const confirmReset = h("button", { class: "btn danger", onclick: () => {
    clearSave();
    state = createNewGame();
    invalidateStats();
    clearGameUi();
    for (const key of Object.keys(ui)) delete ui[key];
    Object.assign(ui, freshUi());
    speed = 1;
    dropToasts = [];
    window.clearTimeout(toastTimer);
    toastEl == null ? void 0 : toastEl.remove();
    toastEl = null;
    userPanned = false;
    drainDropEvents();
    drainCombatEvents();
    drainContractEvents();
    drainPortalEvents();
    guideSig = "";
    devOpen = false;
    renderAll();
    saveView();
    showToast("Started a new game");
  } }, "Yes, erase my save");
  confirmReset.hidden = true;
  const menu = h(
    "div",
    { class: "devmenu" },
    h("strong", null, "Testing tools"),
    h("button", { class: "btn", onclick: () => {
      state.gold += 100;
      renderAll();
    } }, "+100 gold"),
    h("button", { class: "btn", onclick: () => {
      state.fame += 10;
      renderAll();
    } }, "+10 fame"),
    h("button", { class: "btn", onclick: () => {
      for (const key of materialOrder) if (!isPremium(key)) addMaterial(state, key, 5);
      renderAll();
    } }, "+5 of every material"),
    h("button", { class: "btn", onclick: () => {
      devDrop(state, "R");
      renderAll();
    } }, "Drop a rare"),
    h("button", { class: "btn", onclick: () => {
      devDrop(state, "M");
      renderAll();
    } }, "Drop a mythic"),
    h("button", { class: "btn", onclick: () => {
      devPremiumDrop(state);
      renderAll();
    } }, "Drop a premium"),
    h("button", { class: "btn", onclick: () => {
      for (const hero of state.adventurers) {
        hero.xp = Math.max(hero.xp, totalXpForLevel(hero.level + 1));
        hero.level++;
        invalidateStats();
        hero.hp = getCachedStats(state, hero).maxHealth;
      }
      renderAll();
    } }, "Level up every adventurer"),
    // Later slots need a guild expansion, which needs fame.
    h("button", { class: "btn", title: "Raise fame to the next expansion and add its gold cost to your gold", onclick: () => {
      const next = nextExpansion(state);
      if (next) {
        state.fame = Math.max(state.fame, next.fame);
        state.gold += next.gold;
      }
      renderAll();
    } }, "Fame + gold to next expansion"),
    h("button", { class: "btn", title: "Step through every encounter as the battle view lays it out, and every class portrait and battle sprite", onclick: () => {
      devOpen = false;
      renderAll();
      openPreview(document.body);
    } }, "Art preview"),
    h("button", { class: "btn", title: "Every source of a stat from bases, decorations and worn materials", onclick: () => {
      ui.panel = { kind: "statExplorer" };
      devOpen = false;
      renderAll();
    } }, "Stat explorer"),
    h("button", { class: "btn", onclick: () => {
      showFuture = !showFuture;
      buildMap();
      renderAll();
    } }, showFuture ? "Hide future map areas" : "Preview future map areas"),
    h("button", { class: "btn", title: "Drag places to move them, add or remove roads and change their curves, then copy the layout", onclick: () => {
      devOpen = false;
      openLayoutEditor();
      renderAll();
    } }, "Edit map layout"),
    h("button", { class: "btn", onclick: () => {
      state.peddler ?? (state.peddler = { nextVisit: state.time, stock: [], visits: 0 });
      state.peddler.nextVisit = state.time;
      delete state.peddler.leavesAt;
      renderAll();
    } }, "Bring the peddler now"),
    h("button", { class: "btn", onclick: () => {
      for (const key of ["amberKey", "graveKey", "cogKey", "galeKey"]) addMaterial(state, key, 1);
      renderAll();
    } }, "Give one of each key"),
    h("button", { class: "btn", title: "Meets every quest's unlock (earlier clears and fame), unlocks every modifier, reveals every encounter and reward pool, and opens the Shattered Throne portal for 60 minutes", onclick: () => {
      var _a2;
      for (const key of questOrder) {
        const quest = quests[key];
        for (const a of unlockKeys(quest)) if (!state.achievements.includes(a)) state.achievements.push(a);
        state.fame = Math.max(state.fame, quest.fameToUnlock);
        getQuestProgress(state, key).bestModifiedClear = 5;
      }
      for (const quest of Object.values(quests)) {
        const progress = getQuestProgress(state, quest.key);
        progress.seen = quest.encounters.map((_, i) => i);
        for (const tier of ["C", "U", "R", "M"]) progress.revealed[tier] = quest.pools[tier].map((e) => e.material);
        if (quest.boss) {
          progress.legendaryRevealed = true;
          progress.bossFought = true;
        }
      }
      state.portal = { openUntil: Math.max(((_a2 = state.portal) == null ? void 0 : _a2.openUntil) ?? 0, state.time + 60 * 60) };
      renderAll();
      showToast("Every quest, modifier, encounter and reward pool is unlocked. The portal is open for 60 minutes.");
    } }, "Unlock all quests and modifiers"),
    h("button", { class: "btn", title: "Sets every trophy to its top tier and adds the fame those tiers give", onclick: () => {
      state.trophies ?? (state.trophies = {});
      for (const def of trophyList) {
        const top = def.tiers.length - 1;
        for (let t = (state.trophies[def.key] ?? -1) + 1; t <= top; t++) state.fame += def.tiers[t].fame;
        state.trophies[def.key] = top;
      }
      invalidateStats();
      renderAll();
      showToast("Every trophy is at its top tier");
    } }, "Unlock all trophies"),
    saveTools(),
    h("button", { class: "btn danger", onclick: (event) => {
      event.currentTarget.hidden = true;
      confirmReset.hidden = false;
    } }, "Reset save…"),
    confirmReset
  );
  requestAnimationFrame(() => fitDevMenu(menu));
  return menu;
}
function fitDevMenu(menu) {
  if (menu.isConnected) menu.style.maxHeight = `${Math.max(120, window.innerHeight - menu.getBoundingClientRect().top - 12)}px`;
}
window.addEventListener("resize", () => {
  const m = document.querySelector(".devmenu");
  if (m) fitDevMenu(m);
});
let heroCards = [];
function heroBar() {
  heroCards = state.adventurers.map((hero) => {
    const cls = h("span", { class: "hc-class", "aria-hidden": "true" });
    const lv = h("b");
    const name = document.createTextNode("");
    const hp = h("span"), xp = h("span");
    const el = h("button", {
      class: "herocard",
      onclick: () => {
        var _a2, _b2, _c2, _d, _e, _f, _g;
        if (ui.view === "battle" && !(hero.run && hero.assignment)) ui.view = "map";
        const selected = (ui.hero ?? ((_a2 = state.adventurers[0]) == null ? void 0 : _a2.id)) === hero.id;
        if (!selected) {
          selectHero(ui, hero.id);
          renderAll();
          return;
        }
        const lastQuest = ((_b2 = hero.assignment) == null ? void 0 : _b2.questKey) ?? ((_c2 = hero.run) == null ? void 0 : _c2.questKey);
        const questKey = lastQuest ? ((_e = (_d = quests[lastQuest]) == null ? void 0 : _d.endless) == null ? void 0 : _e.baseKey) ?? lastQuest : void 0;
        if (((_f = ui.panel) == null ? void 0 : _f.kind) === "adventurer" && questKey && !(isNarrow() && (ui.benchOpen || ui.shopOpen))) {
          openPanel({ kind: "quest", key: questKey });
          return;
        }
        if (!ui.runPanel && hero.run && hero.assignment) ui.runPanel = hero.id;
        if (((_g = ui.panel) == null ? void 0 : _g.kind) !== "adventurer" || isNarrow() && (ui.benchOpen || ui.shopOpen)) {
          openPanel({ kind: "adventurer", id: hero.id });
          return;
        }
        renderAll();
      }
    }, cls, h(
      "span",
      { class: "hc-main" },
      h("span", { class: "hc-name" }, h("span", { class: "hc-lv" }, "Lv", lv), name),
      h("span", { class: "hc-bar hp" }, hp),
      h("span", { class: "hc-bar xp" }, xp)
    ));
    return { hero, el, cls, lv, name, hp, xp };
  });
  updateHeroCards();
  const bar = h("div", { class: "hud-heroes", role: "group", "aria-label": "Selected hero" }, ...heroCards.map((c) => c.el));
  dragScroll(bar);
  return bar;
}
function dragScroll(el) {
  let start = null;
  let dragged = false;
  el.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || el.scrollWidth <= el.clientWidth) return;
    start = { x: e.clientX, left: el.scrollLeft, id: e.pointerId };
    dragged = false;
  });
  el.addEventListener("pointermove", (e) => {
    if (!start || e.pointerId !== start.id) return;
    const dx = e.clientX - start.x;
    if (!dragged && Math.abs(dx) > 5) {
      dragged = true;
      el.setPointerCapture(e.pointerId);
      el.classList.add("dragging");
    }
    if (dragged) el.scrollLeft = start.left - dx;
  });
  const end = () => {
    start = null;
    el.classList.remove("dragging");
  };
  el.addEventListener("pointerup", end);
  el.addEventListener("pointercancel", end);
  el.addEventListener("click", (e) => {
    if (dragged) {
      e.stopPropagation();
      e.preventDefault();
      dragged = false;
    }
  }, true);
}
function updateHeroCards() {
  const selected = state.adventurers.find((a) => a.id === ui.hero) ?? state.adventurers[0];
  for (const c of heroCards) {
    const hero = c.hero;
    c.el.classList.toggle("on", hero === selected);
    c.el.setAttribute("aria-pressed", hero === selected ? "true" : "false");
    const maxHp = getCachedStats(state, hero).maxHealth;
    const from = totalXpForLevel(hero.level), to = totalXpForLevel(hero.level + 1);
    const xp = hero.level >= levelCap ? 1 : Math.max(0, Math.min(1, (hero.xp - from) / (to - from)));
    const hp = Math.max(0, Math.min(1, hero.hp / maxHp));
    c.el.title = `${hero.name}, level ${hero.level} ${classes[hero.classKey].name} · HP ${Math.max(0, Math.round(hero.hp))}/${maxHp} · ${Math.round(xp * 100)}% to level ${hero.level + 1}`;
    if (c.cls.dataset.cls !== hero.classKey + hero.name) {
      c.cls.dataset.cls = hero.classKey + hero.name;
      c.cls.replaceChildren(heroPortrait(hero) ?? classIcon(hero.classKey));
      c.cls.classList.toggle("has-portrait", !!c.cls.querySelector(".portrait"));
    }
    c.lv.textContent = String(hero.level);
    c.name.data = hero.name;
    c.hp.style.width = `${hp * 100}%`;
    c.xp.style.width = `${xp * 100}%`;
  }
}
function updateHudNumbers() {
  updateHeroCards();
  const gold = document.getElementById("hud-gold");
  const fame = document.getElementById("hud-fame");
  for (const [el, n] of [[gold, state.gold], [fame, state.fame]]) {
    if (!el) continue;
    const text = shortNumber(n);
    if (el.textContent !== text) el.textContent = text;
    const full = Math.floor(n).toLocaleString("en-US");
    if (el.title !== full) el.title = text === String(Math.floor(n)) ? "" : full;
  }
}
function shortNumber(n) {
  const v = Math.floor(n);
  if (v < 1e6) return String(v);
  const units = ["M", "B", "T", "Qa"];
  let i = 0, x = v / 1e6;
  while (x >= 1e3 && i < units.length - 1) {
    x /= 1e3;
    i++;
  }
  const s = x < 10 ? (Math.floor(x * 100) / 100).toFixed(2) : x < 100 ? (Math.floor(x * 10) / 10).toFixed(1) : String(Math.floor(x));
  return s + units[i];
}
let tokenEls = [];
const questSiteEls = {};
let salvageEl = null;
let benchSiteEl = null;
let guildSiteEl = null;
let merchantEl = null;
let peddlerEl = null;
const isNarrow = () => window.innerWidth < 900;
function openShop() {
  ui.benchOpen = false;
  ui.shopOpen = true;
  ui.picker = null;
  if (isNarrow()) ui.panel = null;
  else showCharacterPanel();
  renderAll();
}
function openBench() {
  if (!hasBench(state)) {
    openShop();
    return;
  }
  ui.shopOpen = false;
  ui.benchOpen = true;
  if (isNarrow()) ui.panel = null;
  else showCharacterPanel();
  renderAll();
}
function showCharacterPanel() {
  var _a2, _b2, _c2;
  if (((_a2 = ui.panel) == null ? void 0 : _a2.kind) === "guild" || ((_b2 = ui.panel) == null ? void 0 : _b2.kind) === "quest" || isNarrow() && (ui.benchOpen || ui.shopOpen)) return;
  const hero = state.adventurers.find((a) => a.id === ui.hero) ?? state.adventurers[0];
  if (!hero) return;
  if (((_c2 = ui.panel) == null ? void 0 : _c2.kind) === "adventurer") {
    ui.panel.id = hero.id;
    return;
  }
  ui.panel = { kind: "adventurer", id: hero.id };
  ui.selectedSlot = null;
  ui.trophyPick = null;
}
function closeLeft() {
  ui.benchOpen = false;
  ui.shopOpen = false;
  ui.picker = null;
  renderAll();
}
function togglePanel(kind) {
  var _a2;
  if (((_a2 = ui.panel) == null ? void 0 : _a2.kind) === kind) {
    ui.panel = null;
    renderAll();
  } else openPanel({ kind });
}
function openPanel(panel) {
  var _a2, _b2;
  ui.panel = panel;
  if ((panel == null ? void 0 : panel.kind) === "quest") ui.lastQuest = ((_b2 = (_a2 = quests[panel.key]) == null ? void 0 : _a2.endless) == null ? void 0 : _b2.baseKey) ?? panel.key;
  if (isNarrow()) {
    ui.benchOpen = false;
    ui.shopOpen = false;
  }
  ui.selectedSlot = null;
  ui.trophyPick = null;
  renderAll();
}
function buildMap() {
  const paths = roadPaths();
  const terrainEl = svg(`<svg class="terrain" viewBox="0 0 ${MAP_W} ${MAP_H}" width="${MAP_W}" height="${MAP_H}">${terrainArt()}${ROAD_DEFS}<g class="trails" filter="url(#road-rough)">${trailLayers(paths)}</g></svg>`);
  const roadEl = svg(`<svg class="roads" viewBox="0 0 ${MAP_W} ${MAP_H}" width="${MAP_W}" height="${MAP_H}">${paths}</svg>`);
  const guild = guildSiteEl = h(
    "button",
    { class: "site", "data-key": "guild", style: pos(sites.guild) + `;--site:${siteColors.guild}`, onclick: () => openPanel({ kind: "guild" }) },
    siteGlyph("guild", glyphs.guild),
    h("div", { class: "name" }, "Guild hall"),
    h("div", { class: "sub" }, "Members and ledger")
  );
  const bench = benchSiteEl = h(
    "button",
    { class: "site", "data-key": "bench", style: pos(sites.bench) + `;--site:${siteColors.bench}`, onclick: openBench },
    siteGlyph("bench", glyphs.bench),
    h("div", { class: "name" }, "Crafting bench"),
    h("div", { class: "sub" }, "Make gear from materials")
  );
  merchantEl = h(
    "button",
    { class: "site", "data-key": "merchant", style: pos(sites.merchant) + `;--site:${siteColors.merchant}`, onclick: () => openShop() },
    siteGlyph("merchant", glyphs.merchant),
    h("div", { class: "name" }, "Merchant"),
    h("div", { class: "sub" }, "Buy gear")
  );
  salvageEl = h(
    "button",
    { class: "site", "data-key": "salvage", style: pos(sites.salvage) + `;--site:${siteColors.salvage}`, onclick: () => openPanel({ kind: "salvage" }) },
    siteGlyph("salvage", glyphs.salvage),
    h("div", { class: "name" }, "Salvage yard"),
    h("div", { class: "sub" }, "Recover materials")
  );
  peddlerEl = h(
    "button",
    { class: "site peddler", "data-key": "peddler", style: pos(sites.peddler) + `;--site:${siteColors.peddler}`, onclick: () => openPanel({ kind: "peddler" }) },
    siteGlyph("peddler", glyphs.peddler),
    h("div", { class: "name" }, "Travelling peddler"),
    h("div", { class: "sub" }, "")
  );
  const questEls = questOrder.map((key) => {
    var _a2;
    const quest = quests[key];
    const el = h("button", { class: "site", "data-key": key, hidden: !questShown(key), style: pos(quest.mapPosition) + `;--site:${((_a2 = questLooks[key]) == null ? void 0 : _a2.color) ?? "#7a6a58"}`, onclick: () => openPanel({ kind: "quest", key }) });
    questSiteEls[key] = el;
    return el;
  });
  tokenEls = state.adventurers.map((_, index) => h("button", { class: "token", onclick: () => {
    const hero = state.adventurers[index];
    if (!hero) return;
    selectHero(ui, hero.id);
    if (hero.run && hero.assignment) ui.runPanel = hero.id;
    openPanel({ kind: "adventurer", id: hero.id });
  } }));
  const future = showFuture ? futureSites.map((f) => h(
    "div",
    { class: "site locked future", "data-key": f.key, style: pos(f) },
    siteGlyph("locked", glyphs.lock),
    h("div", { class: "name" }, f.name),
    h("div", { class: "sub" }, f.sub)
  )) : [];
  const groundEl = h("img", { class: "ground", src: mapGroundUrl, alt: "", draggable: "false", style: `left:${GROUND.x}px;top:${GROUND.y}px;width:${GROUND.w}px;height:${GROUND.h}px` });
  canvas.replaceChildren(groundEl, terrainEl, sceneryEl(), roadEl, guild, bench, merchantEl, salvageEl, peddlerEl, ...questEls, ...future, ...tokenEls);
  clampPan();
}
function siteGlyph(key, glyph) {
  const url = siteArtUrl(key);
  return url ? h("div", { class: "glyph art" }, h("img", { src: url, alt: "", draggable: "false" })) : h("div", { class: "glyph" }, svg(glyph));
}
function lockText(quest) {
  if (quest.portal) return isQuestUnlocked(state, endlessKey(quest.key)) ? "Portal closed · Endless open" : "Portal closed";
  if (!unlockMet(state.achievements, quest)) {
    return unlockKeys(quest).length > 1 ? "Needs a tier 3 clear" : `Needs a ${unlockQuestNames(quest)} clear`;
  }
  return `Needs ${quest.fameToUnlock} fame`;
}
function pos(p) {
  return `left:${p.x}px;top:${p.y}px`;
}
function pointOf(key) {
  var _a2;
  return sites[key] ?? ((_a2 = quests[key]) == null ? void 0 : _a2.mapPosition) ?? futureSites.find((f) => f.key === key);
}
let scenery = [];
function sceneryEl() {
  return h("div", { class: "scenery", "aria-hidden": "true" }, ...scenery.map((d) => {
    const url = decoUrl(d.key);
    return url ? h("img", { src: url, alt: "", draggable: "false", style: `left:${Math.round(d.x)}px;top:${Math.round(d.y)}px;height:${Math.round(d.h)}px` }) : null;
  }));
}
function terrainArt() {
  const points = [...Object.values(sites), ...questOrder.map((k) => quests[k].mapPosition).filter(Boolean)];
  const washes = questOrder.filter((k) => quests[k].mapPosition && questLooks[k]).map((k) => {
    const p = quests[k].mapPosition;
    return `<circle cx="${p.x}" cy="${p.y}" r="120" fill="url(#wash-${k})"/>`;
  }).join("");
  const defs = questOrder.filter((k) => questLooks[k]).map((k) => `<radialGradient id="wash-${k}"><stop offset="0" stop-color="${questLooks[k].color}" stop-opacity="0.22"/><stop offset="1" stop-color="${questLooks[k].color}" stop-opacity="0"/></radialGradient>`).join("");
  const roadPts = [];
  for (const { p, q, cx, cy } of roadCurves(true)) {
    for (let t = 0; t <= 1; t += 0.05) roadPts.push({ x: (1 - t) ** 2 * p.x + 2 * (1 - t) * t * cx + t * t * q.x, y: (1 - t) ** 2 * p.y + 2 * (1 - t) * t * cy + t * t * q.y });
  }
  let seed = 7;
  const rnd = () => (seed = seed * 16807 % 2147483647) / 2147483647;
  const art = [];
  scenery = [];
  let n = 0;
  const pick2 = (list2) => list2[(n++ * 7 + Math.floor(rnd() * 3)) % list2.length];
  for (let y = -260; y < MAP_H + 260; y += 46) {
    for (let x = -360; x < MAP_W + 360; x += 46) {
      const px = x + rnd() * 40, py = y + rnd() * 40, kind = rnd();
      if (kind > 0.55) continue;
      if (points.some((p) => (p.x - px) ** 2 + (p.y - py) ** 2 < 100 ** 2)) continue;
      if (roadPts.some((p) => (p.x - px) ** 2 + (p.y - py) ** 2 < 26 ** 2)) continue;
      const s = 0.8 + rnd() * 0.5;
      if (px > SEA_X) continue;
      if (kind < 0.2) scenery.push(n % 5 === 0 ? { x: px, y: py, key: pick2(BUSHES), h: 22 * s } : { x: px, y: py, key: pick2(TREES), h: 36 * s });
      else if (kind < 0.42) {
        if (n++ % 3 === 0) scenery.push({ x: px, y: py, key: pick2(SMALL), h: 16 * s });
      } else scenery.push({ x: px, y: py, key: pick2(ROCKS), h: 15 * s });
    }
  }
  for (const m of MOUNTAINS) {
    if (points.some((p) => (p.x - m.x) ** 2 + (p.y - m.y) ** 2 < 70 ** 2)) continue;
    scenery.push(m);
  }
  scenery.sort((a, b) => a.y - b.y);
  return `<defs>${defs}</defs>${washes}${art.join("")}`;
}
function mapReveal() {
  if (layoutEdit || showFuture) return null;
  const open2 = /* @__PURE__ */ new Set(["guild", "bench", "merchant", "peddler"]);
  if (salvageVisible(state)) open2.add("salvage");
  const cleared = (key) => state.achievements.includes("clear-" + key) || isQuestCleared(state, key);
  const hidden = (key) => questHiddenOnMap(state, key);
  for (const key of questOrder) if (!hidden(key) && (isQuestUnlocked(state, key) || cleared(key))) open2.add(key);
  const shown = new Set(open2);
  for (const [a, b] of roads) {
    if (open2.has(a) && !hidden(b)) shown.add(b);
    if (open2.has(b) && !hidden(a)) shown.add(a);
  }
  return { shown, open: open2 };
}
function mapRevealKey() {
  const r = mapReveal();
  return r ? [...r.shown].sort().join(",") + "|" + [...r.open].sort().join(",") : "all";
}
function questShown(key) {
  var _a2;
  return ((_a2 = mapReveal()) == null ? void 0 : _a2.shown.has(key)) ?? true;
}
function roadBend(index, shown) {
  return roads[index][3] ?? (shown % 2 ? 0.12 : -0.12);
}
function roadCurves(all = false) {
  const hiddenSites = all || layoutEdit ? [] : [...salvageVisible(state) ? [] : ["salvage"], ...hasBench(state) ? [] : ["bench"]];
  const out = [];
  const reveal = all ? null : mapReveal();
  let shown = 0;
  roads.forEach(([a, b, future], index) => {
    if (future && !showFuture || hiddenSites.includes(a) || hiddenSites.includes(b)) return;
    if (reveal && !(reveal.shown.has(a) && reveal.shown.has(b) && (reveal.open.has(a) || reveal.open.has(b)))) {
      shown++;
      return;
    }
    const p = pointOf(a), q = pointOf(b);
    if (!p || !q) return;
    const bend = roadBend(index, shown++);
    const dx = q.x - p.x, dy = q.y - p.y;
    out.push({ index, future: !!future, p, q, cx: (p.x + q.x) / 2 - dy * bend, cy: (p.y + q.y) / 2 + dx * bend });
  });
  return out;
}
const ROAD_DEFS = '<defs><filter id="road-rough" filterUnits="userSpaceOnUse" x="-600" y="-500" width="2600" height="1800"><feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G"/></filter></defs>';
function trailLayers(paths) {
  return `<g class="road-edge">${paths}</g><g class="road-dirt">${paths}</g><g class="road-rut">${paths}</g>`;
}
function roadPaths() {
  return roadCurves().map(({ index, future, p, q, cx, cy }) => `<path${future ? ' class="future"' : ""} data-road="${index}" d="M${p.x} ${p.y} Q${Math.round(cx)} ${Math.round(cy)} ${q.x} ${q.y}"/>`).join("");
}
const PAN_MARGIN = 140;
const pan = { x: 0, y: 0 };
let userPanned = false;
function siteBounds() {
  const points = [sites.guild, ...hasBench(state) || layoutEdit ? [sites.bench] : [], sites.merchant, ...salvageVisible(state) ? [sites.salvage] : [], ...questOrder.filter(questShown).map((k) => quests[k].mapPosition).filter(Boolean), ...showFuture ? futureSites : []];
  return {
    minX: Math.min(...points.map((p) => p.x)),
    maxX: Math.max(...points.map((p) => p.x)),
    minY: Math.min(...points.map((p) => p.y)),
    maxY: Math.max(...points.map((p) => p.y))
  };
}
function clampPan() {
  const w = world.clientWidth, hgt = world.clientHeight;
  if (!w || !hgt) return;
  const b = siteBounds();
  if (!userPanned) {
    const pad = 70, top = b.minY - 50, bottom = b.maxY + 70, left = b.minX - pad, right = b.maxX + pad;
    pan.x = right - left <= w ? (w - (left + right)) / 2 : -left;
    pan.y = bottom - top <= hgt ? (hgt - (top + bottom)) / 2 : -top;
  }
  pan.x = Math.min(w - PAN_MARGIN - b.minX, Math.max(PAN_MARGIN - b.maxX, pan.x));
  pan.y = Math.min(hgt - PAN_MARGIN - b.minY, Math.max(PAN_MARGIN - b.maxY, pan.y));
  if (GROUND.w >= w) pan.x = Math.min(1e3, Math.max(w - GROUND.x - GROUND.w, pan.x));
  if (GROUND.h >= hgt) pan.y = Math.min(420, Math.max(hgt - GROUND.y - GROUND.h, pan.y));
  canvas.style.transform = `translate(${Math.round(pan.x)}px, ${Math.round(pan.y)}px)`;
  world.style.backgroundPosition = `${Math.round(pan.x)}px ${Math.round(pan.y)}px, ${Math.round(pan.x)}px ${Math.round(pan.y)}px`;
}
let drag = null;
let suppressClick = false;
world.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  const target = event.target;
  if (target !== world && !canvas.contains(target)) return;
  drag = { id: event.pointerId, x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y, moved: false };
});
world.addEventListener("pointermove", (event) => {
  if (!drag || event.pointerId !== drag.id) return;
  const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
  if (!drag.moved && Math.hypot(dx, dy) < 6) return;
  if (!drag.moved) {
    drag.moved = true;
    world.setPointerCapture(event.pointerId);
    world.classList.add("dragging");
  }
  userPanned = true;
  pan.x = drag.panX + dx;
  pan.y = drag.panY + dy;
  clampPan();
});
function endDrag(event) {
  if (!drag || event.pointerId !== drag.id) return;
  if (drag.moved) {
    suppressClick = true;
    window.setTimeout(() => {
      suppressClick = false;
    }, 0);
    world.classList.remove("dragging");
  }
  drag = null;
}
world.addEventListener("pointerup", endDrag);
world.addEventListener("pointercancel", endDrag);
world.addEventListener("click", (event) => {
  if (suppressClick) {
    event.stopPropagation();
    event.preventDefault();
    suppressClick = false;
  }
}, true);
new ResizeObserver(() => clampPan()).observe(world);
const LAYOUT_KEY = "guildwright-layout-draft";
const BENDS = [-0.3, -0.2, -0.12, -0.06, 0, 0.06, 0.12, 0.2, 0.3];
let layoutEdit = false;
let futureBeforeEdit = false;
let layoutBar = null;
let layoutPick = null;
let siteDrag = null;
function currentLayout() {
  const curves = new Map(roadCurves().map((c, i) => [c.index, i]));
  return {
    sites: Object.fromEntries(Object.entries(sites).map(([k, p]) => [k, { x: p.x, y: p.y }])),
    quests: Object.fromEntries(questOrder.filter((k) => quests[k].mapPosition).map((k) => [k, { ...quests[k].mapPosition }])),
    future: Object.fromEntries(futureSites.map((f) => [f.key, { x: f.x, y: f.y }])),
    // Every road gets an explicit bend, so the curves no longer depend on the roads' order.
    roads: roads.map(([a, b, future], i) => {
      const bend = Math.round(roadBend(i, curves.get(i) ?? i) * 100) / 100;
      return future ? [a, b, bend, true] : [a, b, bend];
    })
  };
}
function applyLayout(l) {
  var _a2;
  for (const [k, p] of Object.entries(l.sites ?? {})) if (k in sites) Object.assign(sites[k], p);
  for (const [k, p] of Object.entries(l.quests ?? {})) if ((_a2 = quests[k]) == null ? void 0 : _a2.mapPosition) Object.assign(quests[k].mapPosition, p);
  for (const [k, p] of Object.entries(l.future ?? {})) {
    const f = futureSites.find((f2) => f2.key === k);
    if (f) Object.assign(f, p);
  }
  if (Array.isArray(l.roads)) roads.splice(0, roads.length, ...l.roads.map(([a, b, bend, future]) => [a, b, future, bend]));
}
const layoutOriginal = currentLayout();
function layoutChanged() {
  try {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(currentLayout()));
  } catch {
  }
  buildMap();
  renderLayoutBar();
}
function openLayoutEditor() {
  if (layoutEdit) return;
  applyLayout(currentLayout());
  try {
    const draft = localStorage.getItem(LAYOUT_KEY);
    if (draft) {
      applyLayout(JSON.parse(draft));
      showToast("Restored your layout draft");
    }
  } catch {
  }
  layoutEdit = true;
  futureBeforeEdit = showFuture;
  showFuture = true;
  ui.panel = null;
  ui.benchOpen = false;
  ui.shopOpen = false;
  ui.picker = null;
  ui.view = "map";
  world.classList.add("layout-edit");
  layoutBar = h("div", { class: "layoutbar" });
  document.body.appendChild(layoutBar);
  buildMap();
  renderLayoutBar();
}
function closeLayoutEditor() {
  layoutEdit = false;
  layoutPick = null;
  showFuture = futureBeforeEdit;
  world.classList.remove("layout-edit");
  layoutBar == null ? void 0 : layoutBar.remove();
  layoutBar = null;
  buildMap();
  renderAll();
}
function renderLayoutBar() {
  if (!layoutBar) return;
  canvas.querySelectorAll(".site[data-key]").forEach((el) => el.classList.toggle("road-pick", el.dataset.key === layoutPick));
  const text = JSON.stringify(currentLayout());
  const box = h("textarea", { class: "savebox", rows: "2", readonly: "true", "aria-label": "Layout JSON" }, text);
  layoutBar.replaceChildren(
    h(
      "div",
      { class: "grow" },
      h("strong", null, "Map layout"),
      h("div", { class: "small muted" }, layoutPick ? `Click another place to add or remove its road to ${layoutPick}, or click ${layoutPick} again to cancel.` : "Drag places to move them. Click one place, then another, to add or remove a road. Click a road to change its curve."),
      box
    ),
    h(
      "div",
      { class: "col" },
      h("button", { class: "btn primary", onclick: async () => {
        try {
          await navigator.clipboard.writeText(text);
          showToast("Layout copied: paste it in the chat");
        } catch {
          box.select();
          showToast("Copy the layout from the box");
        }
      } }, "Copy layout"),
      h("button", { class: "btn", onclick: () => {
        applyLayout(layoutOriginal);
        try {
          localStorage.removeItem(LAYOUT_KEY);
        } catch {
        }
        layoutPick = null;
        buildMap();
        renderLayoutBar();
      } }, "Reset"),
      h("button", { class: "btn", onclick: closeLayoutEditor }, "Done")
    )
  );
}
canvas.addEventListener("pointerdown", (event) => {
  if (!layoutEdit || event.button !== 0) return;
  const el = event.target.closest(".site[data-key]");
  if (!el) return;
  event.stopPropagation();
  event.preventDefault();
  const key = el.dataset.key;
  const p = pointOf(key);
  if (!p) return;
  siteDrag = { id: event.pointerId, key, el, x: event.clientX, y: event.clientY, ox: p.x, oy: p.y, moved: false };
  el.setPointerCapture(event.pointerId);
}, true);
canvas.addEventListener("pointermove", (event) => {
  if (!siteDrag || event.pointerId !== siteDrag.id) return;
  const dx = event.clientX - siteDrag.x, dy = event.clientY - siteDrag.y;
  if (!siteDrag.moved && Math.hypot(dx, dy) < 4) return;
  siteDrag.moved = true;
  const p = pointOf(siteDrag.key);
  p.x = Math.round((siteDrag.ox + dx) / 5) * 5;
  p.y = Math.round((siteDrag.oy + dy) / 5) * 5;
  siteDrag.el.style.left = `${p.x}px`;
  siteDrag.el.style.top = `${p.y}px`;
  const paths = roadPaths();
  canvas.querySelector("svg.roads").innerHTML = paths;
  canvas.querySelector("svg.terrain .trails").innerHTML = trailLayers(paths);
});
function endSiteDrag(event) {
  if (!siteDrag || event.pointerId !== siteDrag.id) return;
  const { key, moved } = siteDrag;
  siteDrag = null;
  if (moved) {
    layoutChanged();
    return;
  }
  if (!layoutPick) layoutPick = key;
  else if (layoutPick === key) layoutPick = null;
  else {
    const i = roads.findIndex(([a, b]) => a === layoutPick && b === key || a === key && b === layoutPick);
    if (i >= 0) roads.splice(i, 1);
    else roads.push([layoutPick, key, futureSites.some((f) => f.key === key || f.key === layoutPick) || void 0, 0.12]);
    layoutPick = null;
  }
  layoutChanged();
}
canvas.addEventListener("pointerup", endSiteDrag);
canvas.addEventListener("pointercancel", endSiteDrag);
canvas.addEventListener("click", (event) => {
  if (!layoutEdit) return;
  event.stopPropagation();
  event.preventDefault();
  const path = event.target.closest("path[data-road]");
  if (!path) return;
  const road = roads[Number(path.dataset.road)];
  const at = BENDS.findIndex((b) => Math.abs(b - (road[3] ?? 0.12)) < 1e-3);
  road[3] = BENDS[(at + 1) % BENDS.length];
  layoutChanged();
}, true);
function spot(p, dx, row) {
  return { x: p.x + dx, y: p.y - 20 + row * 66 };
}
function placeOf(hero) {
  const a = hero.activity;
  if (a.kind === "resting" && !a.defeated && pendingExtraFight(hero)) return a.questKey;
  return a.kind === "fighting" || a.kind === "traveling" ? a.questKey : "home";
}
function slotAt(place, index) {
  return state.adventurers.slice(0, index).filter((o) => placeOf(o) === place || place === "home" && o.activity.kind === "traveling").length;
}
let builtWithSalvage = false;
let builtReveal = "";
let builtWithBench = false;
function updateMap() {
  var _a2, _b2, _c2, _d;
  const reveal = mapRevealKey();
  if (tokenEls.length !== state.adventurers.length || builtWithSalvage !== salvageVisible(state) || builtWithBench !== hasBench(state) || builtReveal !== reveal) {
    builtWithSalvage = salvageVisible(state);
    builtWithBench = hasBench(state);
    builtReveal = reveal;
    buildMap();
  }
  updateHudActions();
  if (benchSiteEl) {
    benchSiteEl.hidden = !hasBench(state) && !layoutEdit;
    benchSiteEl.classList.toggle("locked", !hasBench(state));
    benchSiteEl.classList.toggle("open", ui.benchOpen);
    benchSiteEl.querySelector(".sub").textContent = hasBench(state) ? "Make gear from materials" : `Sold by the merchant · ${BENCH_PRICE} gold`;
  }
  merchantEl == null ? void 0 : merchantEl.classList.toggle("open", !!ui.shopOpen);
  if (salvageEl) {
    salvageEl.style.display = salvageVisible(state) ? "" : "none";
    salvageEl.classList.toggle("locked", !salvageLevel(state));
    salvageEl.classList.toggle("open", ((_a2 = ui.panel) == null ? void 0 : _a2.kind) === "salvage");
    salvageEl.querySelector(".sub").textContent = salvageLevel(state) ? "Recover materials" : "Ready to build";
  }
  if (peddlerEl) {
    const p = state.peddler;
    const here = peddlerHere(state);
    peddlerEl.style.display = peddlerUnlocked(state) && p ? "" : "none";
    peddlerEl.className = "site peddler" + (here ? " visiting" : " locked") + (((_b2 = ui.panel) == null ? void 0 : _b2.kind) === "peddler" ? " open" : "");
    peddlerEl.querySelector(".sub").textContent = !p ? "" : here ? `Leaves in ${clock(p.leavesAt - state.time)}` : `Back in ${clock(p.nextVisit - state.time)}`;
  }
  for (const key of questOrder) {
    const quest = quests[key];
    const el = questSiteEls[key];
    const unlocked = isQuestUnlocked(state, key);
    const progress = getQuestProgress(state, key);
    const fightingAt = new Set(state.adventurers.map((a) => a.activity.kind === "fighting" && a.activity.questKey === key ? a.activity.encounterIndex : -1));
    el.className = "site" + (unlocked ? "" : " locked") + (((_c2 = ui.panel) == null ? void 0 : _c2.kind) === "quest" && ui.panel.key === key ? " open" : "") + (el.classList.contains("pulse") ? " pulse" : "");
    const sig = [unlocked, quest.portal && unlocked ? clock(portalSecondsLeft(state)) : "", progress.bestEncounter, [...fightingAt].join(), unlocked ? "" : lockText(quest)].join("|");
    if (el.dataset.sig === sig) continue;
    el.dataset.sig = sig;
    el.replaceChildren(
      siteGlyph(unlocked ? key : "locked", unlocked ? ((_d = questLooks[key]) == null ? void 0 : _d.glyph) ?? glyphs.quest : glyphs.lock),
      h("div", { class: "name" }, quest.name),
      ...quest.portal && unlocked ? [h("div", { class: "sub" }, `Portal open · ${clock(portalSecondsLeft(state))}`)] : [],
      unlocked ? h("div", { class: "pips", "aria-hidden": "true" }, ...questShape.map((tier, i) => h("span", { class: `pip ${tier}` + (i <= progress.bestEncounter ? " reached" : "") + (fightingAt.has(i) ? " current" : "") }))) : h("div", { class: "sub" }, lockText(quest))
    );
  }
  state.adventurers.forEach((hero, index) => {
    var _a3;
    const tokenEl = tokenEls[index];
    const home = spot(sites.guild, 95, slotAt("home", index));
    const questSpot = (key) => spot(quests[key].mapPosition, -95, slotAt(key, index));
    const a = hero.activity;
    let at = home;
    if (placeOf(hero) !== "home" && a.kind !== "traveling") {
      at = questSpot(placeOf(hero));
    } else if (a.kind === "traveling") {
      const to = questSpot(a.questKey), t = Math.min(1, 1 - a.remaining / a.total);
      at = { x: home.x + (to.x - home.x) * t, y: home.y + (to.y - home.y) * t };
    }
    tokenEl.classList.toggle("selected", hero.id === (ui.hero ?? ((_a3 = state.adventurers[0]) == null ? void 0 : _a3.id)));
    tokenEl.style.left = `${at.x}px`;
    tokenEl.style.top = `${at.y}px`;
    const stats = getCachedStats(state, hero);
    tokenEl.replaceChildren(
      h("div", { class: "name" }, hero.name),
      h("div", { class: "body" }, heroPortrait(hero) ?? classIcon(hero.classKey)),
      h("div", { class: "bar" }, h("span", { style: `width:${100 * Math.max(0, hero.hp) / stats.maxHealth}%` })),
      h("div", { class: "state" }, activityText(state, hero))
    );
    tokenEl.setAttribute("aria-label", `${hero.name}, open character panel`);
  });
  applyGuidePulse();
}
let panelEl = null;
let benchEl = null;
function pathTo(root, target) {
  const path = [];
  for (let el = target; el && el !== root; el = el.parentElement) {
    if (!el.parentElement) return null;
    path.unshift([...el.parentElement.children].indexOf(el));
  }
  return path;
}
function syncAttributes(el, from) {
  for (const a of [...el.attributes]) if (!from.hasAttribute(a.name)) el.removeAttribute(a.name);
  for (const a of [...from.attributes]) if (el.getAttribute(a.name) !== a.value) el.setAttribute(a.name, a.value);
}
let morphReuse = false;
let morphStateRef = null;
function reconcile(old, next) {
  if (old.isEqualNode(next)) {
    adoptHandlers(old, next);
    return old;
  }
  if (old instanceof Element && next instanceof Element && old.tagName === next.tagName && !old.hasListeners && !next.hasListeners) {
    syncAttributes(old, next);
    reconcileChildren(old, next);
    return old;
  }
  return next;
}
function reconcileChildren(old, next) {
  const incoming = [...next.childNodes];
  incoming.forEach((node, i) => {
    const current = old.childNodes[i];
    if (!current) {
      old.appendChild(node);
      return;
    }
    const kept = reconcile(current, node);
    if (kept !== current) current.replaceWith(kept);
  });
  while (old.childNodes.length > incoming.length) old.lastChild.remove();
}
function morphInto(old, next, path) {
  syncAttributes(old, next);
  if (!path.length) {
    if (morphReuse) reconcileChildren(old, next);
    else old.replaceChildren(...next.childNodes);
    return;
  }
  const keep = old.children[path[0]], incoming = next.children[path[0]];
  for (const node of [...old.childNodes]) if (node !== keep) node.remove();
  const nodes = [...next.childNodes];
  const at = nodes.indexOf(incoming);
  keep.before(...nodes.slice(0, at));
  keep.after(...nodes.slice(at + 1));
  morphInto(keep, incoming, path.slice(1));
}
function swapPanel(old, next, insert) {
  var _a2;
  if (next) markGuide(next);
  morphReuse = morphStateRef === state;
  morphStateRef = state;
  const oldBody = old == null ? void 0 : old.querySelector(".panel-body"), nextBody = next == null ? void 0 : next.querySelector(".panel-body");
  if ((old == null ? void 0 : old.isConnected) && next && oldBody && nextBody && old.tagName === next.tagName && old.getAttribute("aria-label") === next.getAttribute("aria-label")) {
    const oldPath = pathTo(old, oldBody), nextPath = pathTo(next, nextBody);
    if (oldPath && nextPath && oldPath.join() === nextPath.join()) {
      morphInto(old, next, nextPath);
      return old;
    }
  }
  const scroll = old && next && old.getAttribute("aria-label") === next.getAttribute("aria-label") ? ((_a2 = old.querySelector(".panel-body")) == null ? void 0 : _a2.scrollTop) ?? 0 : 0;
  old == null ? void 0 : old.remove();
  if (next) {
    insert(next);
    const body = next.querySelector(".panel-body");
    if (body) body.scrollTop = scroll;
  }
  return next;
}
let runEl = null;
const RUN_PANEL_MIN = 610;
const combatView = new CombatView();
setLeaveGate((a) => combatView.settled(a.id, hasPendingCombatEvents(a.id)));
function placeCombatView() {
  const slot = runEl == null ? void 0 : runEl.querySelector(".arena-slot");
  const parent = combatView.el.parentElement;
  if (!slot || !parent) return;
  const s = slot.getBoundingClientRect(), p = parent.getBoundingClientRect();
  combatView.el.style.left = `${s.left - p.left}px`;
  combatView.el.style.top = `${s.top - p.top}px`;
  combatView.el.style.width = `${s.width}px`;
}
const ARENA_H = 210;
combatView.expand.onclick = () => {
  ui.view = "battle";
  renderAll();
};
combatView.recover.onclick = () => {
  const hero = state.adventurers.find((a) => a.id === ui.hero) ?? state.adventurers[0];
  if ((hero == null ? void 0 : hero.activity.kind) === "resting") {
    recoverInstantly(state, hero);
    renderAll();
  }
};
const battleStage = h("div", { class: "bv-stage" }, combatView.log);
const battleEl = h("section", { class: "battleview", "aria-label": "Battle view" }, battleStage);
let stripEl = null;
let battleFit = "";
function battleActive() {
  var _a2;
  if (ui.view !== "battle") return false;
  const hero = state.adventurers.find((a) => a.id === ui.hero) ?? state.adventurers[0];
  if (!(hero == null ? void 0 : hero.run) || hero.activity.kind === "idle" && ((_a2 = hero.assignment) == null ? void 0 : _a2.questKey) !== hero.run.questKey) {
    ui.view = "map";
    return false;
  }
  return true;
}
function placeBattle() {
  const w = battleStage.clientWidth, hgt = battleStage.clientHeight;
  if (!w || !hgt) return;
  const k = Math.max(1, Math.min(3, Math.floor((hgt - 16) / ARENA_H), Math.floor(w / 300)));
  const baseW = Math.min(600, Math.floor((w - 24) / k));
  const left = Math.round((w - baseW * k) / 2), top = Math.max(0, Math.round((hgt - ARENA_H * k) / 2));
  const fit = `${k}:${baseW}:${left}:${top}`;
  if (fit === battleFit) return;
  battleFit = fit;
  Object.assign(combatView.el.style, { left: `${left}px`, top: `${top}px`, width: `${baseW}px`, transform: `scale(${k})` });
  battleEl.style.setProperty("--k", String(k));
}
function updateCombatView() {
  const battle = combatView.el.parentElement === battleStage;
  if (combatView.el.isConnected) {
    if (battle) placeBattle();
    else placeCombatView();
  }
  const strip = battle && (stripEl == null ? void 0 : stripEl.isConnected) ? Math.max(0, Math.round(map.getBoundingClientRect().bottom - stripEl.getBoundingClientRect().top)) : 0;
  if (map.dataset.strip !== String(strip)) {
    map.dataset.strip = String(strip);
    map.style.setProperty("--strip-h", `${strip}px`);
  }
  const events = drainCombatEvents();
  const hero = ui.runPanel || battle ? state.adventurers.find((a) => a.id === ui.hero) ?? state.adventurers[0] : void 0;
  if (!hero || !combatView.el.isConnected) {
    return;
  }
  combatView.events(events.filter((e) => e.adventurerId === hero.id).slice(-12));
  combatView.update(state, hero);
  const resting = hero.activity.kind === "resting" && hero.activity.remaining > 0;
  const cost = resting ? getRecoverCost(state, hero) : 0;
  combatView.setRecover(resting ? `Recover now · ${cost} gold` : null, state.gold >= cost);
  combatView.pace(timeScale());
  combatView.update(state, hero);
}
let pickerEl = null;
let gearEl = null;
let flashId = null;
let detailEl = null;
let recapEl = null;
let starterEl = null;
let compareEl = null;
function placeCompare() {
  if (!compareEl || !benchEl) return;
  const preview = benchEl.querySelector(".preview");
  const mapRect = map.getBoundingClientRect();
  const benchRect = benchEl.getBoundingClientRect();
  const top = preview ? preview.getBoundingClientRect().top - mapRect.top : 12;
  const height = compareEl.offsetHeight;
  const clamped = Math.max(8, Math.min(top, mapRect.height - height - 8));
  compareEl.style.left = `${benchRect.right - mapRect.left + 8}px`;
  compareEl.style.top = `${clamped}px`;
}
function renderPanelNow() {
  var _a2, _b2, _c2, _d, _e;
  ui.compareBeside = !isNarrow();
  benchEl = swapPanel(benchEl, renderBenchPanel(ctx), (el) => map.insertBefore(el, world));
  const nextCompare = renderBenchCompare(ctx);
  if ((compareEl == null ? void 0 : compareEl.isConnected) && nextCompare) {
    morphInto(compareEl, nextCompare, []);
  } else {
    compareEl == null ? void 0 : compareEl.remove();
    compareEl = nextCompare;
    if (compareEl) map.appendChild(compareEl);
  }
  if (compareEl) {
    placeCompare();
    const body = benchEl == null ? void 0 : benchEl.querySelector(".panel-body");
    if (body && !body.dataset.compareScroll) {
      body.dataset.compareScroll = "1";
      body.addEventListener("scroll", placeCompare, { passive: true });
    }
  }
  pickerEl = swapPanel(pickerEl, renderPickerPanel(ctx), (el) => map.insertBefore(el, world));
  recapEl = swapPanel(recapEl, renderRecapPanel(ctx), (el) => map.insertBefore(el, world));
  starterEl = swapPanel(starterEl, renderStarterPick(ctx), (el) => map.appendChild(el));
  panelEl = swapPanel(panelEl, renderPanel(ctx), (el) => (gearEl == null ? void 0 : gearEl.isConnected) ? gearEl.after(el) : world.after(el));
  gearEl = swapPanel(gearEl, renderGearPanel(ctx), (el) => world.after(el));
  if (ui.scrollTo && (panelEl || gearEl)) {
    const target = (gearEl == null ? void 0 : gearEl.querySelector("#" + ui.scrollTo)) ?? (panelEl == null ? void 0 : panelEl.querySelector("#" + ui.scrollTo));
    ui.scrollTo = null;
    if (target) {
      target.scrollIntoView({ block: "start" });
      target.classList.add("flash");
      flashId = target.id;
      window.setTimeout(() => {
        flashId = null;
      }, 1600);
    }
  } else if (flashId && (panelEl || gearEl)) {
    (_a2 = (gearEl == null ? void 0 : gearEl.querySelector("#" + flashId)) ?? (panelEl == null ? void 0 : panelEl.querySelector("#" + flashId))) == null ? void 0 : _a2.classList.add("flash", "flash-hold");
  }
  if (battleActive()) {
    if (!battleEl.isConnected) world.appendChild(battleEl);
    world.classList.add("battle");
    const quest = quests[((_c2 = (_b2 = state.adventurers.find((a) => a.id === ui.hero)) == null ? void 0 : _b2.run) == null ? void 0 : _c2.questKey) ?? ""];
    const baseKey = ((_d = quest == null ? void 0 : quest.endless) == null ? void 0 : _d.baseKey) ?? (quest == null ? void 0 : quest.key) ?? "";
    battleEl.style.setProperty("--site", ((_e = questLooks[baseKey]) == null ? void 0 : _e.color) ?? "#7a6a58");
    battleEl.classList.toggle("has-bg", !!backgroundUrl(baseKey));
    runEl == null ? void 0 : runEl.remove();
    runEl = null;
    stripEl = swapPanel(stripEl, renderRunStrip(ctx), (el) => battleEl.appendChild(el));
    if (combatView.el.parentElement !== battleStage) {
      battleStage.appendChild(combatView.el);
      combatView.el.classList.add("big");
      battleFit = "";
    }
    placeBattle();
    detailEl = swapPanel(detailEl, renderMaterialDetail(ctx), (el) => map.appendChild(el));
    return;
  }
  if (battleEl.isConnected) {
    battleEl.remove();
    stripEl == null ? void 0 : stripEl.remove();
    stripEl = null;
    world.classList.remove("battle");
    combatView.el.remove();
    combatView.el.classList.remove("big");
    combatView.el.style.transform = "";
  }
  const roomy = world.clientWidth >= RUN_PANEL_MIN + 32;
  const runParent = roomy ? world : map;
  if (runEl && runEl.parentElement !== runParent) {
    runEl.remove();
  }
  runEl = swapPanel(runEl, narrowScreen.matches ? null : renderRunPanel(ctx), (el) => combatView.el.parentElement === runParent ? runParent.insertBefore(el, combatView.el) : runParent.appendChild(el));
  if (runEl == null ? void 0 : runEl.querySelector(".arena-slot")) {
    if (combatView.el.parentElement !== runParent) runParent.appendChild(combatView.el);
    placeCombatView();
  } else {
    combatView.el.remove();
  }
  detailEl = swapPanel(detailEl, renderMaterialDetail(ctx), (el) => map.appendChild(el));
}
const VIEW_KEY = "guildwright-view";
const VIEW_FIELDS = ["panel", "stripOpen", "benchOpen", "shopOpen", "picker", "hero", "runPanel", "view", "selectedSlot", "selectedEncounter", "bench", "materialDetail", "statFilters", "compareBeside", "showEquipped", "hideTooHigh", "statExplorer", "questTab", "lastQuest"];
function saveView() {
  try {
    const scroll = {};
    document.querySelectorAll(".panel-body").forEach((body) => {
      var _a2;
      const label = (_a2 = body.closest("[aria-label]")) == null ? void 0 : _a2.getAttribute("aria-label");
      if (label && body.scrollTop > 0) scroll[label] = body.scrollTop;
    });
    const view = { scroll, speed, theme };
    for (const f of VIEW_FIELDS) view[f] = ui[f];
    localStorage.setItem(VIEW_KEY, JSON.stringify(view));
  } catch {
  }
}
function restoreView() {
  let view = null;
  try {
    view = JSON.parse(localStorage.getItem(VIEW_KEY) ?? "null");
  } catch {
    view = null;
  }
  const before = { ...ui };
  if (view && [1, 4, 16].includes(view.speed)) speed = view.speed;
  if (view && ["auto", "light", "dark"].includes(view.theme)) {
    theme = view.theme;
    applyTheme();
  }
  if (view) {
    for (const f of VIEW_FIELDS) if (f in view) ui[f] = view[f];
  }
  const owned = (key) => !!key && (state.materials[key] ?? 0) > 0;
  if (ui.bench) ui.bench = { ...ui.bench, base: (ui.bench.base ?? []).filter(owned), decorations: (ui.bench.decorations ?? []).map((k) => owned(k) ? k : null) };
  try {
    renderAll();
  } catch (e) {
    console.warn("Discarding saved view", e);
    Object.assign(ui, before);
    renderAll();
    return;
  }
  const scroll = (view == null ? void 0 : view.scroll) ?? {};
  document.querySelectorAll(".panel-body").forEach((body) => {
    var _a2;
    const label = (_a2 = body.closest("[aria-label]")) == null ? void 0 : _a2.getAttribute("aria-label");
    if (label && scroll[label]) body.scrollTop = scroll[label];
  });
}
function renderAll() {
  renderHud();
  updateMap();
  renderPanelNow();
  renderGuide();
}
function guideTargetOpen(t) {
  var _a2, _b2, _c2;
  if (!t) return false;
  switch (t.kind) {
    case "merchant":
      return !!ui.shopOpen;
    case "bench":
      return ui.benchOpen;
    case "guild":
      return ((_a2 = ui.panel) == null ? void 0 : _a2.kind) === "guild";
    case "quest":
      return ((_b2 = ui.panel) == null ? void 0 : _b2.kind) === "quest" && ui.panel.key === t.key;
    case "hero":
      return ((_c2 = ui.panel) == null ? void 0 : _c2.kind) === "adventurer";
  }
}
function guideFocusKey(t) {
  var _a2;
  if (!t) return null;
  if (t.kind === "quest") return t.focus ?? "send";
  if (t.kind === "merchant") return ((_a2 = state.guide) == null ? void 0 : _a2.bought) ? "bench" : "buy";
  if (t.kind === "hero") return "equip";
  if (t.kind === "bench") return "craft";
  return t.focus ?? null;
}
function trophyWaiting() {
  return Object.keys(state.trophies ?? {}).length > 0 && (state.guild.trophySlots ?? 0) > 0 && !anyTrophyEquipped();
}
let focusedSite = null;
function focusSite(id, at) {
  if (!at || focusedSite === id) return;
  focusedSite = id;
  const w = world.clientWidth, hgt = world.clientHeight;
  if (!w || !hgt) {
    focusedSite = null;
    return;
  }
  pan.x = w / 2 - at.x;
  pan.y = hgt * 0.25 - at.y;
  userPanned = true;
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    canvas.style.transition = "transform 450ms ease";
    world.style.transition = "background-position 450ms ease";
    window.setTimeout(() => {
      canvas.style.transition = "";
      world.style.transition = "";
    }, 500);
  }
  clampPan();
}
function guideKeys() {
  return new Set([guideFocusKey(guideTarget), trophyWaiting() ? "trophy" : null, "deco"].filter((k) => !!k));
}
function markGuide(root) {
  const keys = guideKeys();
  root.querySelectorAll("[data-guide]").forEach((el) => el.classList.toggle("guide-hl", keys.has(el.dataset.guide)));
}
function applyGuidePulse() {
  var _a2, _b2, _c2;
  const t = guideTarget;
  const open2 = guideTargetOpen(t);
  const trophy = trophyWaiting();
  const guildOpen = ((_a2 = ui.panel) == null ? void 0 : _a2.kind) === "guild";
  benchSiteEl == null ? void 0 : benchSiteEl.classList.toggle("pulse", (t == null ? void 0 : t.kind) === "bench" && !open2);
  merchantEl == null ? void 0 : merchantEl.classList.toggle("pulse", (t == null ? void 0 : t.kind) === "merchant" && !open2);
  guildSiteEl == null ? void 0 : guildSiteEl.classList.toggle("pulse", ((t == null ? void 0 : t.kind) === "guild" || trophy) && !guildOpen);
  for (const { key, el } of hudActionEls) {
    el.classList.toggle("pulse", key === "bench" ? (t == null ? void 0 : t.kind) === "bench" && !open2 : key === "merchant" ? (t == null ? void 0 : t.kind) === "merchant" && !open2 : key === "guild" ? ((t == null ? void 0 : t.kind) === "guild" || trophy) && !guildOpen : key === "view" ? ui.view === "battle" && (t == null ? void 0 : t.kind) === "quest" && t.focus !== "modifier" && !open2 : key === "quest" ? (t == null ? void 0 : t.kind) === "quest" && t.focus === "modifier" && !open2 : false);
  }
  markGuide(document.body);
  document.querySelectorAll(".guide-hl:not([data-guide])").forEach((el) => el.classList.remove("guide-hl"));
  const site = t && !open2 ? t.kind === "quest" ? t.focus === "modifier" ? null : ["quest:" + t.key, quests[t.key].mapPosition] : t.kind === "merchant" ? ["merchant", sites.merchant] : t.kind === "bench" ? ["bench", sites.bench] : t.kind === "guild" ? ["guild", sites.guild] : null : trophy && !guildOpen ? ["guild", sites.guild] : null;
  if (site) focusSite(site[0], site[1]);
  else if (!t) focusedSite = null;
  for (const key of questOrder) (_b2 = questSiteEls[key]) == null ? void 0 : _b2.classList.toggle("pulse", (t == null ? void 0 : t.kind) === "quest" && t.focus !== "modifier" && t.key === key && !open2);
  const heroId = ui.hero ?? ((_c2 = state.adventurers[0]) == null ? void 0 : _c2.id);
  heroCards.forEach((card) => card.el.classList.toggle("pulse", (t == null ? void 0 : t.kind) === "hero" && card.hero.id === heroId && !open2));
  if (guideEl) {
    guideEl.hidden = open2;
    placeGuide();
  }
}
let guideEl = null;
let guideSig = "";
function guideStep() {
  var _a2;
  const g = state.guide ?? (state.guide = {});
  if (!g.firstRunDone && state.adventurers.some((a) => a.run && (a.run.defeatedAt !== void 0 || a.run.cleared >= Math.min(a.run.stopAt, quests[a.run.questKey].encounters.length - 1) || a.run.number > 1 || a.activity.kind !== "fighting" && a.activity.kind !== "traveling"))) {
    g.firstRunDone = true;
  }
  const started = state.adventurers.some((a) => a.run) || questOrder.some((k) => getQuestProgress(state, k).runs > 0);
  if (!g.firstRunDone && !started && state.adventurers.length) {
    const first = questOrder.find((k) => isQuestUnlocked(state, k));
    if (first) {
      const hero = state.adventurers.find((a) => a.id === ui.hero) ?? state.adventurers[0];
      return { text: `Send ${hero.name} on a quest: open ${quests[first].name} and start a run to bring back gold and materials.`, target: { kind: "quest", key: first } };
    }
  }
  if (g.firstRunDone && !g.bought && !hasBench(state)) {
    return { text: "Visit the merchant to buy equipment and become stronger.", target: { kind: "merchant" } };
  }
  if (g.bought && !g.equipped) {
    const hero = state.adventurers.find((a) => a.id === ui.hero) ?? state.adventurers[0];
    return { text: `Equip your new gear to become stronger: open ${(hero == null ? void 0 : hero.name) ?? "your hero"}'s card at the top and pick an equipment slot.`, target: { kind: "hero" } };
  }
  if (g.equipped && !hasBench(state)) {
    return { text: `Save ${BENCH_PRICE} gold for a crafting bench at the merchant, and make your own gear (${Math.min(state.gold, BENCH_PRICE)}/${BENCH_PRICE}).`, target: { kind: "merchant" } };
  }
  if (state.benchOwned === true && !g.crafted) {
    return { text: "Craft an item at the crafting bench: pick an item type, then add materials.", target: { kind: "bench" } };
  }
  if (!g.modifierToggled && (state.adventurers.some((a) => Object.values(a.questModifiers ?? {}).some((m) => m.length)) || questOrder.some((k) => (getQuestProgress(state, k).bestModifiedClear ?? 0) > 0))) g.modifierToggled = true;
  if (!g.modifierToggled && g.crafted) {
    const hasMods = (k) => isQuestUnlocked(state, k) && quests[k].modifiers.some((def) => !def.exclusive && isModifierUnlocked(state, quests[k], def.key));
    const hudKey = hudQuestKey();
    const withMods = hudKey && hasMods(hudKey) ? hudKey : questOrder.find(hasMods);
    if (withMods && ((_a2 = ui.panel) == null ? void 0 : _a2.kind) === "quest") g.modifierToggled = true;
    else if (withMods) {
      return { text: `Quest modifiers are open: in ${quests[withMods].name}, turn one on to make runs harder for better rewards.`, target: { kind: "quest", key: withMods, focus: "modifier" } };
    }
  }
  return null;
}
let guideTarget = null;
function renderGuide() {
  const step = guideStep();
  guideTarget = (step == null ? void 0 : step.target) ?? null;
  applyGuidePulse();
  const sig = step ? step.text : "";
  if (sig === guideSig && (!guideEl || guideEl.isConnected)) return;
  guideSig = sig;
  guideEl == null ? void 0 : guideEl.remove();
  guideEl = step ? h(
    "div",
    { class: "guidecard", role: "status" },
    h("span", { class: "grow" }, step.text)
  ) : null;
  if (guideEl) {
    guideEl.hidden = guideTargetOpen(guideTarget);
    guideEl.appendChild(h("span", { class: "guidearrow", "aria-hidden": "true" }));
    document.body.appendChild(guideEl);
  }
  placeGuide();
}
function guideAnchor() {
  var _a2, _b2;
  const t = guideTarget;
  if (!t) return null;
  const hud2 = (key) => {
    var _a3;
    return ((_a3 = hudActionEls.find((a) => a.key === key)) == null ? void 0 : _a3.el) ?? null;
  };
  switch (t.kind) {
    case "merchant":
      return hud2("merchant");
    case "bench":
      return hud2("bench");
    case "guild":
      return hud2("guild");
    case "hero": {
      const heroId = ui.hero ?? ((_a2 = state.adventurers[0]) == null ? void 0 : _a2.id);
      return ((_b2 = heroCards.find((c) => c.hero.id === heroId)) == null ? void 0 : _b2.el) ?? null;
    }
    case "quest":
      return t.focus === "modifier" ? hud2("quest") : ui.view === "battle" ? hud2("view") : questSiteEls[t.key] ?? null;
  }
}
let guideFrame = 0;
function placeGuide() {
  cancelAnimationFrame(guideFrame);
  const el = guideEl;
  const showing = !!el && el.isConnected && !el.hidden;
  document.body.classList.toggle("guiding", showing);
  if (!showing) return;
  const anchor = guideAnchor();
  const r = (anchor == null ? void 0 : anchor.isConnected) ? anchor.getBoundingClientRect() : null;
  const vw = document.documentElement.clientWidth, vh = window.innerHeight;
  if (!r || !r.width) {
    el.classList.add("floating");
    el.style.left = el.style.top = "";
  } else {
    el.classList.remove("floating");
    const w = el.offsetWidth, hgt = el.offsetHeight, gap2 = 12;
    const cx = r.left + r.width / 2;
    const left = Math.max(8, Math.min(vw - w - 8, cx - w / 2));
    const below = r.bottom + gap2 + hgt <= vh - 8 || r.top - gap2 - hgt < 8;
    el.classList.toggle("above", !below);
    el.style.left = `${Math.round(left)}px`;
    el.style.top = `${Math.round(below ? r.bottom + gap2 : r.top - gap2 - hgt)}px`;
    el.style.setProperty("--arrow-x", `${Math.round(Math.max(14, Math.min(w - 14, cx - left)))}px`);
  }
  guideFrame = requestAnimationFrame(placeGuide);
}
const tierWords = { C: "common", U: "uncommon", R: "rare", M: "mythic", L: "legendary" };
let dropToasts = [];
let dropToastId = 0;
const lastDropAt = {};
let dropsEl = null;
let dropsSig = "";
const QUIET_AFTER = 10;
function processDrops() {
  const now = performance.now();
  for (const drop of drainDropEvents()) {
    const e = { ...drop, tier: drop.legendary ? "L" : drop.tier };
    const recent = now - (lastDropAt[e.material] ?? -Infinity) < 15e3;
    lastDropAt[e.material] = now;
    if ((state.obtained[e.material] ?? 0) >= QUIET_AFTER) continue;
    if (e.premium && e.owned > 10) {
      dropToasts.push({ id: dropToastId++, kind: "scarce", material: e.material, tier: e.tier, questKey: e.questKey, owned: e.owned, expires: now + 4e3 });
    } else if (e.premium) {
      dropToasts.push({ id: dropToastId++, kind: "premium", material: e.material, tier: e.tier, questKey: e.questKey, owned: e.owned, expires: now + 9e3 });
    } else if (e.first) {
      if (!dropToasts.some((t) => t.kind === "new" && t.material === e.material)) {
        dropToasts.push({ id: dropToastId++, kind: "new", material: e.material, tier: e.tier, questKey: e.questKey, owned: e.owned, expires: now + 9e3 });
      }
    } else if (e.tier === "M" || e.tier === "L") {
      dropToasts.push({ id: dropToastId++, kind: "mythic", material: e.material, tier: e.tier, questKey: e.questKey, owned: e.owned, expires: now + 6e3 });
    } else if (e.owned < 3 && !recent) {
      dropToasts = dropToasts.filter((t) => !(t.kind === "scarce" && t.material === e.material));
      dropToasts.push({ id: dropToastId++, kind: "scarce", material: e.material, tier: e.tier, questKey: e.questKey, owned: e.owned, expires: now + 4e3 });
    }
  }
  dropToasts = dropToasts.filter((t) => t.expires > now && !(t.expires === Infinity && t.kind === "trophy" && anyTrophyEquipped()));
  const cards = dropToasts.filter((t) => t.kind !== "scarce");
  for (const waiting of cards.slice(2)) waiting.expires = Math.max(waiting.expires, now + (waiting.kind === "new" ? 9e3 : 6e3));
  renderDrops();
}
function anyTrophyEquipped() {
  return (state.trophySlots ?? []).some(Boolean);
}
function equipFromCard(t) {
  if (t.expires !== Infinity) dropToasts = dropToasts.filter((x) => x.id !== t.id);
  ui.trophyPick = null;
  openGuildSection(ctx, "guild-trophies");
}
function renderDrops() {
  const cards = dropToasts.filter((t) => t.kind !== "scarce").slice(0, 2);
  const notes = cards.length ? [] : dropToasts.filter((t) => t.kind === "scarce").slice(-2);
  const sig = [...cards, ...notes].map((t) => t.id).join(",");
  if (sig === dropsSig && (!dropsEl || dropsEl.isConnected)) {
    return;
  }
  dropsSig = sig;
  const open2 = (t) => {
    dropToasts = dropToasts.filter((x) => x.id !== t.id);
    ui.materialDetail = t.material;
    renderAll();
  };
  const dismiss = (t) => {
    dropToasts = dropToasts.filter((x) => x.id !== t.id);
    renderDrops();
  };
  const closable = (t, el) => h(
    "div",
    { class: "dropwrap" + (el.classList.contains("dropnote") ? " note" : "") },
    el,
    h("button", { class: "dropclose", "aria-label": "Dismiss", title: "Dismiss", onclick: (ev) => {
      ev.stopPropagation();
      dismiss(t);
    } }, "×")
  );
  const next = h(
    "div",
    { class: "drops", "aria-live": "polite" },
    ...cards.map((t) => closable(t, (() => {
      if (t.trophy) {
        const def = trophies[t.trophy.key];
        const equipped = (state.trophySlots ?? []).includes(t.trophy.key);
        if (t.expires === Infinity) {
          return h(
            "div",
            { class: `dropcard trophycard tier${t.trophy.tier}` },
            h("div", { class: "dropkicker" }, `Trophy earned · +${t.trophy.fame} fame`),
            h("div", { class: "dropname" }, `${def.name} · ${tierNames$2[t.trophy.tier]}`),
            h("div", { class: "small muted" }, `${def.bonusText(def.tiers[t.trophy.tier].bonus)} while equipped`),
            h("div", { class: "small", style: "margin-top:4px" }, "Open the guild hall on the map and put it in a trophy slot.")
          );
        }
        return h(
          "button",
          { class: `dropcard trophycard tier${t.trophy.tier}`, onclick: () => equipFromCard(t) },
          h("div", { class: "dropkicker" }, `Trophy earned · +${t.trophy.fame} fame`),
          h("div", { class: "dropname" }, `${def.name} · ${tierNames$2[t.trophy.tier]}`),
          h("div", { class: "small muted" }, `${def.bonusText(def.tiers[t.trophy.tier].bonus)} while equipped`),
          h("div", { class: "row", style: "margin-top:4px" }, h("span", { class: "btn small primary" }, equipped ? "See trophies" : "Equip"))
        );
      }
      const material = requireMaterial(t.material);
      if (t.kind === "premium") {
        return h(
          "button",
          { class: "dropcard premium", onclick: () => open2(t) },
          h("div", { class: "dropkicker" }, "Premium drop · double stats"),
          h("div", { class: "dropname" }, materialIcon(material.key), material.name, " ", h("span", { class: "power" }, `P${material.power}`)),
          h("div", { class: "small muted" }, `From ${quests[t.questKey].name} · ${t.owned} owned. Click to see what it can make.`)
        );
      }
      if (t.kind === "mythic") {
        return h(
          "button",
          { class: `dropcard ${t.tier}`, onclick: () => open2(t) },
          h("div", { class: "dropkicker" }, t.tier === "L" ? "Legendary drop" : "Mythic drop"),
          h("div", { class: "dropname" }, materialIcon(material.key), material.name, " ", h("span", { class: "power" }, `P${material.power}`)),
          h("div", { class: "small muted" }, `From ${quests[t.questKey].name} · ${t.owned} owned`)
        );
      }
      return h(
        "button",
        { class: `dropcard ${t.tier}`, onclick: () => open2(t) },
        h("div", { class: "dropkicker" }, `New ${tierWords[t.tier]} material`),
        h("div", { class: "dropname" }, materialIcon(material.key), material.name, " ", h("span", { class: "power" }, `P${material.power}`)),
        h("div", { class: "small muted" }, `From ${quests[t.questKey].name}. Click to see what it can make.`)
      );
    })())),
    ...notes.map((t) => closable(t, h(
      "button",
      { class: `dropnote ${isPremium(t.material) ? "premium" : t.tier}`, onclick: () => open2(t) },
      `+1 ${t.tier === "C" || isPremium(t.material) ? "" : tierWords[t.tier] + " "}${requireMaterial(t.material).name} · ${t.owned} owned`
    )))
  );
  dropsEl == null ? void 0 : dropsEl.remove();
  dropsEl = cards.length || notes.length ? next : null;
  if (dropsEl) world.appendChild(dropsEl);
}
let toastEl = null;
function showToast(message, ms = 2200, onActivate) {
  toastEl == null ? void 0 : toastEl.remove();
  const close = () => {
    window.clearTimeout(toastTimer);
    toastEl == null ? void 0 : toastEl.remove();
    toastEl = null;
  };
  const stop = (e) => e.stopPropagation();
  toastEl = h(
    "div",
    {
      class: "toast" + (onActivate ? " action" : ""),
      role: onActivate ? "button" : "status",
      onpointerdown: stop,
      onmousedown: stop,
      ontouchstart: stop,
      onwheel: stop,
      onclick: (e) => {
        e.stopPropagation();
        if (onActivate) {
          close();
          onActivate();
        }
      }
    },
    h("span", null, message),
    h("button", { class: "toastclose", "aria-label": "Dismiss", title: "Dismiss", onclick: (e) => {
      e.stopPropagation();
      close();
    } }, "×")
  );
  map.appendChild(toastEl);
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toastEl == null ? void 0 : toastEl.remove();
    toastEl = null;
  }, ms);
}
let last = performance.now();
let accumulator = 0;
let sinceSlowRender = 0;
let sinceSave = 0;
function frame(now) {
  var _a2, _b2;
  const dt = Math.min(0.1, (now - last) / 1e3);
  last = now;
  accumulator += dt * speed * timeScale(now);
  setCombatSpeed(speed);
  setHoldLevelRestock(ui.shopOpen ? ((_a2 = state.adventurers.find((a) => a.id === ui.hero) ?? state.adventurers[0]) == null ? void 0 : _a2.id) ?? null : null);
  let ticks = 0;
  while (accumulator >= TICK_SECONDS && ticks < 2e3) {
    tick(state);
    accumulator -= TICK_SECONDS;
    ticks++;
  }
  const peddler = updatePeddler(state);
  if (peddler === "unlocked") showToast("A travelling peddler has started visiting. Watch the road out of the guild.", 6e3);
  for (const e of drainPortalEvents()) {
    const who = ((_b2 = state.adventurers.find((a) => a.id === e.adventurerId)) == null ? void 0 : _b2.name) ?? "Someone";
    if (e.kind === "opened") showToast(`${who} completed the Oracle's Rite. The portal to the Shattered Throne is open for 30 minutes.`, 8e3);
    if (e.kind === "extended") showToast(`${who} completed the Oracle's Rite again. The portal stays open 30 minutes longer.`, 8e3);
    if (e.kind === "noKeys") showToast(`${who} beat the Veiled Oracle, but the keys were already spent. The portal stays shut.`, 8e3);
    if (e.kind === "closed") showToast("The portal to the Shattered Throne has closed. Everyone there was recalled.", 8e3);
  }
  if (peddler === "arrived") showToast(`The travelling peddler stopped by with ${state.peddler.stock.length} materials for sale, for ${clock(state.peddler.leavesAt - state.time)}. Tap to see it.`, 6e3, () => openPanel({ kind: "peddler" }));
  updateHudNumbers();
  updateCombatView();
  sinceSlowRender += dt;
  if (sinceSlowRender >= 0.4 && !pointerDown) {
    sinceSlowRender = 0;
    announceUnlocks();
    processDrops();
    updateMap();
    renderGuide();
    if (!detailOpen()) {
      renderPanelNow();
      applyGuidePulse();
    }
    saveView();
  }
  sinceSave += dt;
  if (sinceSave >= 5) {
    sinceSave = 0;
    saveGame(state);
  }
  requestAnimationFrame(frame);
}
let knownModifiers = unlockedModifierKeys();
function unlockedModifierKeys() {
  const keys = /* @__PURE__ */ new Set();
  for (const questKey of questOrder) {
    for (const m of quests[questKey].modifiers) {
      if (isModifierUnlocked(state, quests[questKey], m.key)) keys.add(questKey + ":" + m.key);
    }
  }
  return keys;
}
function announceUnlocks() {
  var _a2;
  const messages = [];
  if (contractsOpen(state)) {
    ensureGuildContracts(state);
    for (const a of state.adventurers) ensurePersonalContract(state, a);
  }
  for (const c of drainContractEvents()) {
    const who = ((_a2 = state.adventurers.find((a) => a.id === c.adventurerId)) == null ? void 0 : _a2.name) ?? "Someone";
    messages.push(`${who} completed a ${c.kind} contract: ${c.text}`);
  }
  const progress = checkProgress(state);
  for (const t of progress.trophies) {
    dropToasts = dropToasts.filter((x) => {
      var _a3;
      return ((_a3 = x.trophy) == null ? void 0 : _a3.key) !== t.key;
    });
    const sticky = !anyTrophyEquipped();
    dropToasts.push({ id: dropToastId++, kind: "trophy", trophy: { key: t.key, tier: t.tier, fame: t.fame }, material: "", tier: "C", questKey: "", owned: 0, expires: sticky ? Infinity : performance.now() + 1e4 });
  }
  if (progress.trophies.length) renderDrops();
  messages.push(...progress.notices);
  const now = unlockedModifierKeys();
  const fresh = [...now].filter((k) => !knownModifiers.has(k));
  knownModifiers = now;
  if (fresh.length) {
    const [questKey] = fresh[0].split(":");
    messages.push(`${fresh.length} new modifier${fresh.length > 1 ? "s" : ""} unlocked for ${quests[questKey].name}`);
  }
  if (messages.length) {
    showToast(messages.join(" · "));
  }
}
let hoveredDelta = null;
document.addEventListener("mouseover", (event) => {
  var _a2, _b2;
  hoveredDelta = ((_b2 = (_a2 = event.target).closest) == null ? void 0 : _b2.call(_a2, ".delta")) ?? null;
}, true);
document.addEventListener("mouseleave", () => {
  hoveredDelta = null;
});
function detailOpen() {
  if (hoveredDelta && !hoveredDelta.isConnected) hoveredDelta = null;
  const focused = document.activeElement;
  return !!hoveredDelta || !!((focused == null ? void 0 : focused.closest(".delta")) && focused.matches(":focus-visible")) || !!(focused == null ? void 0 : focused.matches("select.filteradd"));
}
let pointerDown = false;
document.addEventListener("pointerdown", () => {
  pointerDown = true;
}, true);
document.addEventListener("pointerup", () => {
  window.setTimeout(() => {
    pointerDown = false;
  }, 30);
}, true);
document.addEventListener("pointercancel", () => {
  pointerDown = false;
}, true);
const SHORTCUTS = { b: "battle", m: "map", s: "merchant", q: "quest", g: "guild", c: "character", w: "bench", p: "peddler", y: "salvage" };
function hudQuestKey() {
  var _a2, _b2;
  const hero = state.adventurers.find((a) => a.id === ui.hero) ?? state.adventurers[0];
  const base = (k) => {
    var _a3, _b3;
    return k ? ((_b3 = (_a3 = quests[k]) == null ? void 0 : _a3.endless) == null ? void 0 : _b3.baseKey) ?? k : void 0;
  };
  const active = (hero == null ? void 0 : hero.assignment) && hero.run ? base(hero.assignment.questKey) : void 0;
  if (!state.adventurers.length) return void 0;
  return active ?? (ui.lastQuest && quests[ui.lastQuest] && isQuestUnlocked(state, ui.lastQuest) ? ui.lastQuest : void 0) ?? base(((_a2 = hero == null ? void 0 : hero.assignment) == null ? void 0 : _a2.questKey) ?? ((_b2 = hero == null ? void 0 : hero.run) == null ? void 0 : _b2.questKey)) ?? questOrder.find((k) => isQuestUnlocked(state, k));
}
function toggleHudQuest() {
  var _a2;
  const key = hudQuestKey();
  if (!key) return false;
  if (((_a2 = ui.panel) == null ? void 0 : _a2.kind) === "quest" && ui.panel.key === key) {
    ui.panel = null;
    renderAll();
  } else openPanel({ kind: "quest", key });
  return true;
}
function hudShortcut(action) {
  var _a2;
  const hero = state.adventurers.find((a) => a.id === ui.hero) ?? state.adventurers[0];
  const button = (key) => {
    var _a3;
    return (_a3 = hudActionEls.find((a) => a.key === key)) == null ? void 0 : _a3.el;
  };
  switch (action) {
    case "battle": {
      if (!(hero == null ? void 0 : hero.run) || !hero.assignment) return false;
      if (isNarrow()) closePanels();
      ui.view = "battle";
      renderAll();
      return true;
    }
    case "map":
      if (isNarrow()) closePanels();
      ui.view = "map";
      renderAll();
      return true;
    case "quest":
      return toggleHudQuest();
    case "character":
      if (!hero) return false;
      if (((_a2 = ui.panel) == null ? void 0 : _a2.kind) === "adventurer" && !(isNarrow() && (ui.benchOpen || ui.shopOpen))) {
        ui.panel = null;
        renderAll();
      } else openPanel({ kind: "adventurer", id: hero.id });
      return true;
    default: {
      const el = button(action);
      if (!el || el.hidden || el.disabled) return false;
      el.click();
      return true;
    }
  }
}
document.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const target = event.target;
  if (target && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))) return;
  if (previewOpen() || layoutEdit) return;
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    const list2 = state.adventurers;
    if (list2.length < 2) return;
    const at = Math.max(0, list2.findIndex((a) => a.id === ui.hero));
    const next = list2[(at + (event.key === "ArrowRight" ? 1 : list2.length - 1)) % list2.length];
    selectHero(ui, next.id);
    if (ui.view === "battle" && !(next.run && next.assignment)) ui.view = "map";
    renderAll();
    event.preventDefault();
    return;
  }
  if (event.key === " ") {
    event.preventDefault();
    if (event.repeat) return;
    const speeds = [1, 4, 16];
    speed = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
    renderHud();
    saveView();
    return;
  }
  const action = SHORTCUTS[event.key.toLowerCase()];
  if (action && !event.repeat && hudShortcut(action)) event.preventDefault();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && previewOpen()) {
    closePreview();
    return;
  }
  if (event.key === "Escape") {
    if (ui.materialDetail) {
      ui.materialDetail = null;
    } else if (ui.picker) {
      if (ui.picker.kind === "decoration" && !ui.bench.decorations[ui.picker.index]) ui.decoSkipped = true;
      ui.picker = null;
    } else if (ui.panel || ui.benchOpen || ui.shopOpen || ui.view !== "battle") {
      ui.panel = null;
      ui.benchOpen = false;
      ui.shopOpen = false;
    } else {
      ui.view = "map";
    }
    devOpen = false;
    renderAll();
  }
});
window.addEventListener("beforeunload", () => {
  saveGame(state);
  saveView();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    saveGame(state);
    saveView();
  }
});
buildMap();
restoreView();
if ((_c = state.notices) == null ? void 0 : _c.length) {
  const text = state.notices.join(". ") + ".";
  state.notices = [];
  window.setTimeout(() => showToast(text, 8e3), 2500);
}
requestAnimationFrame(frame);
