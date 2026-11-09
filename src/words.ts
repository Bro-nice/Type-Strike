/**
 * Word banks and generators for TypeStrike keyboard typing game.
 */

export const SHORT_WORDS = [
  "ace", "arc", "bay", "bit", "bot", "bug", "cam", "cpu", "cry", "cue",
  "cut", "dam", "dot", "dry", "dub", "fan", "fax", "fit", "fix", "fly",
  "fog", "fox", "gap", "gas", "gel", "gem", "gig", "glow", "grid", "gun",
  "gut", "gym", "hex", "hip", "hit", "hop", "hot", "hub", "hue", "hut",
  "ice", "ink", "ion", "jam", "jar", "jaw", "jet", "jig", "job", "jog",
  "joy", "key", "lab", "lap", "law", "led", "leg", "lid", "lip", "lit",
  "log", "low", "lux", "map", "mat", "mix", "mob", "mod", "mud", "mug",
  "nan", "net", "new", "nib", "nod", "nor", "not", "now", "nut", "oar",
  "oil", "one", "opt", "orb", "ore", "our", "out", "owl", "pan", "pat",
  "paw", "pay", "peg", "pen", "pet", "pie", "pin", "pit", "ply", "pod",
  "pop", "pot", "pro", "pry", "pub", "pug", "pun", "pup", "rad", "rag",
  "ram", "ran", "rap", "rat", "raw", "ray", "red", "rib", "rid", "rig",
  "rim", "rip", "rob", "rod", "rot", "row", "rub", "rug", "run", "rust",
  "rye", "sad", "sap", "sat", "saw", "say", "sea", "set", "sew", "sin",
  "sip", "sir", "sit", "six", "ski", "sky", "sly", "son", "sop", "sow",
  "soy", "spa", "spy", "sub", "sun", "tab", "tag", "tan", "tap", "tar",
  "tax", "tea", "tee", "ten", "the", "tie", "tin", "tip", "toe", "ton",
  "top", "tow", "toy", "try", "tub", "tug", "two", "urn", "use", "van",
  "vat", "vet", "vex", "via", "vim", "vow", "war", "was", "wax", "way",
  "web", "wed", "wee", "wet", "who", "why", "wig", "win", "wit", "woe",
  "won", "wow", "yap", "yaw", "yea", "yen", "yep", "yes", "yet", "zip"
];

export const MEDIUM_WORDS = [
  "action", "active", "aerial", "agency", "agenda", "aimbot", "alarms", "alerts",
  "aliens", "allied", "anchor", "angles", "anthem", "apex", "apollo", "arcade",
  "arrows", "ascend", "aspect", "astral", "atomic", "attack", "avatar", "avenge",
  "ballot", "beacon", "binary", "blades", "blasts", "blazer", "blinks", "blocks",
  "boosts", "bounce", "breach", "buffer", "bullet", "bypassed", "cables", "candid",
  "cannon", "carbon", "cascaded", "chains", "charge", "charts", "chaser", "chrome",
  "cipher", "circus", "clever", "clicks", "clones", "clouds", "cluster", "coders",
  "combat", "comets", "command", "coords", "cosmic", "crafts", "crater", "cruise",
  "crypto", "curved", "cyber", "cypher", "damage", "danger", "dashes", "data",
  "dazzle", "debris", "debugs", "defeat", "defend", "deploy", "design", "device",
  "digits", "divide", "domain", "drifts", "drones", "dynasty", "eagles", "echoes",
  "elixir", "emblem", "empire", "enable", "energy", "engine", "entity", "escape",
  "events", "exceed", "expert", "falcon", "faster", "fibers", "fields", "filter",
  "finish", "firing", "flares", "flight", "flux", "forces", "format", "freeze",
  "fusion", "galaxy", "gamers", "gaming", "garage", "gears", "glitch", "global",
  "graviton", "growth", "guided", "gunner", "hackers", "havens", "hazard", "heroes",
  "hologram", "hybrid", "hyper", "ignite", "impact", "impulse", "infiniti", "inputs",
  "inside", "ionics", "jumper", "kernel", "knight", "lasers", "launch", "layers",
  "legend", "levels", "lights", "linear", "locate", "locked", "logic", "lunar"
];

export const HARD_WORDS = [
  "accelerate", "activation", "adaptation", "aerospace", "algorithm", "ammunition",
  "amplifier", "apocalypse", "assembler", "astronomy", "atmosphere", "barricade",
  "battleship", "biometrics", "blackholes", "blockbuster", "broadband", "cadence",
  "calibrate", "capacitance", "centrifuge", "challenger", "chronicles", "combustion",
  "compressor", "connection", "controller", "coordinate", "counteract", "cybernetics",
  "darkmatter", "decentral", "deconstruct", "deflection", "detonation", "devastator",
  "dimensions", "disconnect", "disruption", "distribute", "electromagnet", "encryption",
  "evaporation", "hyperdrive", "illumination", "interstellar", "juggernaut", "microchips",
  "navigation", "neutralize", "observatory", "oscilloscope", "overclocking", "payload",
  "perpendicular", "photosphere", "propulsion", "radioactivity", "refraction", "resilience",
  "singularity", "spacecraft", "stratosphere", "supercharger", "supernova", "teleportation",
  "thermonuclear", "trajectory", "transceiver", "ultraviolet", "wavelength", "wormholes"
];

export const CODE_WORDS = [
  "function", "variable", "interface", "component", "useEffect", "useState", "useMemo",
  "useCallback", "useRef", "useContext", "typescript", "javascript", "developer",
  "framework", "express", "backend", "frontend", "fullstack", "database", "mongodb",
  "postgresql", "middleware", "async", "await", "promise", "resolve", "reject",
  "prototype", "inheritance", "polymorphism", "encapsulation", "refactor", "iteration",
  "recursion", "algorithm", "binarytree", "hashtable", "repository", "gitcommit",
  "gitbranch", "gitmerge", "pullrequest", "deployment", "container", "kubernetes",
  "dockerfile", "serverless", "microservice", "websocket", "streaming", "bandwidth",
  "encryption", "tokenauth", "jwtsecret", "bearer", "security", "firewall", "endpoint"
];

export type TargetKind = "normal" | "scout" | "heavy" | "emp" | "heal" | "freeze";

export interface WordTarget {
  id: string;
  word: string;
  typedIndex: number;
  x: number; // percentage 5-95
  y: number; // percentage 0-100
  speed: number;
  kind: TargetKind;
  maxHealth?: number;
  currentHealth?: number;
  points: number;
  glowColor: string;
  shake?: number;
  spawnTime: number;
}

export function getRandomWord(mode: "arcade" | "time-attack" | "code" | "hard" | "zen", wave: number = 1): { word: string; kind: TargetKind; points: number } {
  // Determine kind by probability
  const rand = Math.random();
  let kind: TargetKind = "normal";

  // Rare powerup drops
  if (rand < 0.05) {
    kind = "emp";
  } else if (rand < 0.09) {
    kind = "heal";
  } else if (rand < 0.13) {
    kind = "freeze";
  } else if (rand < 0.35) {
    kind = "scout";
  } else if (rand < 0.55 && wave >= 3) {
    kind = "heavy";
  }

  let wordList = MEDIUM_WORDS;
  if (mode === "code") {
    wordList = CODE_WORDS;
  } else if (mode === "hard" || wave > 6) {
    wordList = HARD_WORDS;
  } else if (kind === "scout" || (wave === 1 && Math.random() < 0.7)) {
    wordList = SHORT_WORDS;
  } else if (kind === "heavy") {
    wordList = HARD_WORDS;
  }

  const word = wordList[Math.floor(Math.random() * wordList.length)].toLowerCase();

  let points = word.length * 10;
  if (kind === "scout") points = Math.round(points * 1.3);
  if (kind === "heavy") points = Math.round(points * 2.2);
  if (kind === "emp") points += 50;

  return { word, kind, points };
}
