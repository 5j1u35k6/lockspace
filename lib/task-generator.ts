export type TaskPropId =
  | "collar"
  | "leather-collar"
  | "metal-collar"
  | "dog-tag"
  | "collar-dog-tag"
  | "collar-leash"
  | "handcuffs"
  | "leather-cuffs"
  | "soft-restraints"
  | "ankle-cuffs"
  | "wrist-cuffs"
  | "nipple-clamps"
  | "chain-nipple-clamps"
  | "adjustable-nipple-clamps"
  | "decorative-nipple-clips"
  | "small-plug"
  | "plug"
  | "tail-plug"
  | "blindfold"
  | "earmuffs"
  | "mouth-accessory"
  | "paddle"
  | "whip"
  | "cane"
  | "crop"
  | "slapper"
  | "feather"
  | "pup-hood"
  | "pup-mask"
  | "dog-ears"
  | "dog-tail"
  | "harness"
  | "leather-harness";

export type GeneratedTask = {
  instruction: string;
  signature: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  exposureLevel: 1 | 2 | 3 | 4 | 5;
  parts: {
    postureId: string;
    handsId: string;
    orientationId: string;
    gazeId: string | null;
    clothingId: string;
    propId: TaskPropId | null;
  };
};

export type TaskGenerationOptions = {
  ownedProps?: readonly TaskPropId[];
  propFrequency?: number;
  maxExposureLevel?: 1 | 2 | 3 | 4 | 5;
  minDifficulty?: 1 | 2 | 3 | 4 | 5;
  maxDifficulty?: 1 | 2 | 3 | 4 | 5;
  avoidSignatures?: readonly string[];
};

type Choice = { id: string; label: string; difficulty: number };
type Clothing = Choice & { exposure: 1 | 2 | 3 | 4 | 5 };
type Prop = {
  id: TaskPropId;
  label: string;
  category: string;
  complexity: number;
  blocksEyes?: boolean;
  allowedClothing?: readonly string[];
  allowedOrientations?: readonly string[];
  forbiddenHands?: readonly string[];
  verb: "wear" | "show";
};

const POSTURES: readonly Choice[] = [
  { id: "P01", label: "站直", difficulty: 2 },
  { id: "P02", label: "自然站好", difficulty: 1 },
  { id: "P03", label: "雙腿併攏站好", difficulty: 2 },
  { id: "P04", label: "雙腿分開站好", difficulty: 2 },
  { id: "P05", label: "背靠牆站好", difficulty: 2 },
  { id: "P06", label: "面向牆壁站好", difficulty: 2 },
  { id: "P07", label: "保持彎腰站姿", difficulty: 4 },
  { id: "P08", label: "保持半蹲姿勢", difficulty: 3 },
  { id: "P09", label: "保持深蹲姿勢", difficulty: 3 },
  { id: "P10", label: "單膝跪下", difficulty: 3 },
  { id: "P11", label: "雙膝跪好", difficulty: 2 },
  { id: "P12", label: "以正坐跪姿坐好", difficulty: 2 },
  { id: "P13", label: "雙膝分開跪好", difficulty: 4 },
  { id: "P14", label: "在床邊雙膝跪好", difficulty: 3 },
  { id: "P15", label: "面向牆壁跪好", difficulty: 3 },
  { id: "P16", label: "坐在椅子上", difficulty: 1 },
  { id: "P17", label: "坐在床沿", difficulty: 1 },
  { id: "P18", label: "坐在地板上", difficulty: 2 },
  { id: "P19", label: "盤腿坐好", difficulty: 2 },
  { id: "P20", label: "坐好並將雙腿向前伸直", difficulty: 3 },
  { id: "P21", label: "趴好", difficulty: 4 },
  { id: "P22", label: "仰躺", difficulty: 4 },
  { id: "P23", label: "以雙手雙膝撐地", difficulty: 5 },
];

const HANDS: readonly Choice[] = [
  { id: "H01", label: "雙手自然垂下", difficulty: 1 },
  { id: "H02", label: "雙手放在大腿上", difficulty: 1 },
  { id: "H03", label: "雙手放在膝蓋上", difficulty: 1 },
  { id: "H04", label: "雙手放在腰間", difficulty: 2 },
  { id: "H05", label: "雙手叉腰", difficulty: 2 },
  { id: "H06", label: "雙手交叉放在胸前", difficulty: 2 },
  { id: "H07", label: "雙手放在頭頂", difficulty: 3 },
  { id: "H08", label: "雙手交扣放在後腦", difficulty: 3 },
  { id: "H09", label: "雙手高舉", difficulty: 4 },
  { id: "H10", label: "雙手放到身後", difficulty: 4 },
  { id: "H11", label: "雙手在背後交扣", difficulty: 4 },
  { id: "H12", label: "雙手貼牆", difficulty: 3 },
  { id: "H13", label: "單手放在後腦", difficulty: 2 },
  { id: "H15", label: "雙手扶床", difficulty: 2 },
  { id: "H16", label: "雙手扶椅背", difficulty: 2 },
  { id: "H17", label: "雙手撐地", difficulty: 5 },
  { id: "H18", label: "雙手向前伸直", difficulty: 3 },
];

const ORIENTATIONS: readonly Choice[] = [
  { id: "O01", label: "正面面向鏡頭", difficulty: 1 },
  { id: "O02", label: "背對鏡頭", difficulty: 2 },
  { id: "O03", label: "左側身面向鏡頭", difficulty: 2 },
  { id: "O04", label: "右側身面向鏡頭", difficulty: 2 },
  { id: "O05", label: "以四十五度斜側角度面向鏡頭", difficulty: 2 },
  { id: "O06", label: "面向鏡子", difficulty: 2 },
  { id: "O07", label: "背對鏡子並讓鏡面入鏡", difficulty: 3 },
  { id: "O08", label: "面向牆壁", difficulty: 2 },
];

const GAZES: readonly Choice[] = [
  { id: "G01", label: "直視鏡頭", difficulty: 1 },
  { id: "G02", label: "看向左側", difficulty: 1 },
  { id: "G03", label: "看向右側", difficulty: 1 },
];

const CLOTHING: readonly Clothing[] = [
  { id: "C01", label: "全裸，只保留貞操鎖", difficulty: 5, exposure: 5 },
  { id: "C02", label: "只穿短襪", difficulty: 4, exposure: 4 },
  { id: "C03", label: "只穿長襪", difficulty: 4, exposure: 4 },
  { id: "C04", label: "只穿四角褲", difficulty: 1, exposure: 1 },
  { id: "C05", label: "只穿三角褲", difficulty: 2, exposure: 2 },
  { id: "C06", label: "只穿後空內褲", difficulty: 3, exposure: 3 },
  { id: "C07", label: "只圍浴巾或毛巾", difficulty: 1, exposure: 1 },
];

const POSTURE_HANDS: Record<string, readonly string[]> = {
  P01: ["H01","H02","H03","H04","H05","H06","H07","H08","H09","H10","H11","H13"],
  P02: ["H01","H02","H03","H04","H05","H06","H07","H08","H09","H10","H11","H13"],
  P03: ["H01","H02","H03","H04","H05","H06","H07","H08","H09","H10","H11","H13"],
  P04: ["H01","H02","H03","H04","H05","H06","H07","H08","H09","H10","H11","H13"],
  P05: ["H01","H02","H03","H04","H05","H06","H07","H08","H09","H10","H11","H13"],
  P06: ["H01","H02","H04","H05","H06","H07","H08","H09","H10","H11","H12","H13"],
  P07: ["H02","H03","H04","H10","H11","H15","H16"],
  P08: ["H01","H02","H03","H06","H07","H08","H09","H10"],
  P09: ["H01","H02","H03","H06","H07","H08","H09","H10"],
  P10: ["H01","H02","H03","H04","H05","H06","H07","H08","H09","H10","H11","H13"],
  P11: ["H01","H02","H03","H04","H05","H06","H07","H08","H09","H10","H11","H13"],
  P12: ["H01","H02","H03","H04","H05","H06","H07","H08","H09","H10","H11","H13"],
  P13: ["H01","H02","H03","H04","H05","H06","H07","H08","H09","H10","H11","H13"],
  P14: ["H01","H02","H03","H04","H05","H06","H07","H08","H09","H10","H11","H13","H15"],
  P15: ["H02","H03","H06","H07","H08","H09","H10","H11","H12"],
  P16: ["H02","H03","H04","H05","H06","H07","H08","H09","H10","H11","H13","H16"],
  P17: ["H02","H03","H04","H05","H06","H07","H08","H09","H10","H11","H13","H15"],
  P18: ["H02","H03","H04","H05","H06","H07","H08","H09","H10","H11","H13","H18"],
  P19: ["H02","H03","H06","H07","H08","H09","H10","H11","H13","H18"],
  P20: ["H02","H03","H06","H07","H08","H09","H10","H11","H13","H18"],
  P21: ["H07","H08","H10","H11","H18"],
  P22: ["H01","H06","H07","H08","H09","H18"],
  P23: ["H17"],
};

const POSTURE_ORIENTATIONS: Record<string, readonly string[]> = {
  P01: ["O01","O02","O03","O04","O05","O06","O07"],
  P02: ["O01","O02","O03","O04","O05","O06","O07"],
  P03: ["O01","O02","O03","O04","O05","O06","O07"],
  P04: ["O01","O02","O03","O04","O05","O06","O07"],
  P05: ["O01","O02","O03","O04","O05","O06","O07"],
  P06: ["O08"],
  P07: ["O01","O02","O03","O04","O05"],
  P08: ["O01","O02","O03","O04","O05","O06"],
  P09: ["O01","O02","O03","O04","O05","O06"],
  P10: ["O01","O02","O03","O04","O05","O06","O07"],
  P11: ["O01","O02","O03","O04","O05","O06","O07"],
  P12: ["O01","O02","O03","O04","O05","O06","O07"],
  P13: ["O01","O02","O03","O04","O05","O06","O07"],
  P14: ["O01","O02","O03","O04","O05","O06","O07"],
  P15: ["O08"],
  P16: ["O01","O02","O03","O04","O05","O06"],
  P17: ["O01","O02","O03","O04","O05","O06"],
  P18: ["O01","O02","O03","O04","O05","O06"],
  P19: ["O01","O02","O03","O04","O05","O06"],
  P20: ["O01","O02","O03","O04","O05","O06"],
  P21: ["O02","O03","O04","O05"],
  P22: ["O01","O03","O04","O05"],
  P23: ["O02","O03","O04","O05"],
};

const PROPS: readonly Prop[] = [
  { id: "collar", label: "項圈", category: "identity", complexity: 1, verb: "wear" },
  { id: "leather-collar", label: "皮革項圈", category: "identity", complexity: 1, verb: "wear" },
  { id: "metal-collar", label: "金屬項圈", category: "identity", complexity: 1, verb: "wear" },
  { id: "dog-tag", label: "犬牌", category: "identity", complexity: 1, verb: "wear", allowedOrientations: ["O01","O03","O04","O05","O06"] },
  { id: "collar-dog-tag", label: "項圈與犬牌", category: "identity", complexity: 2, verb: "wear", allowedOrientations: ["O01","O03","O04","O05","O06"] },
  { id: "collar-leash", label: "項圈與牽繩", category: "identity", complexity: 2, verb: "wear" },
  { id: "handcuffs", label: "手銬", category: "restraint", complexity: 3, verb: "wear", forbiddenHands: ["H05","H13","H17"] },
  { id: "leather-cuffs", label: "皮革手銬", category: "restraint", complexity: 3, verb: "wear", forbiddenHands: ["H05","H13","H17"] },
  { id: "soft-restraints", label: "軟式束縛帶", category: "restraint", complexity: 3, verb: "wear", forbiddenHands: ["H05","H13","H17"] },
  { id: "ankle-cuffs", label: "腳銬", category: "restraint", complexity: 3, verb: "wear" },
  { id: "wrist-cuffs", label: "手腕束帶", category: "restraint", complexity: 3, verb: "wear", forbiddenHands: ["H05","H13","H17"] },
  { id: "nipple-clamps", label: "乳夾", category: "chest", complexity: 3, verb: "wear", allowedOrientations: ["O01","O03","O04","O05","O06"] },
  { id: "chain-nipple-clamps", label: "鏈式乳夾", category: "chest", complexity: 3, verb: "wear", allowedOrientations: ["O01","O03","O04","O05","O06"] },
  { id: "adjustable-nipple-clamps", label: "可調式乳夾", category: "chest", complexity: 3, verb: "wear", allowedOrientations: ["O01","O03","O04","O05","O06"] },
  { id: "decorative-nipple-clips", label: "乳環或裝飾夾", category: "chest", complexity: 3, verb: "wear", allowedOrientations: ["O01","O03","O04","O05","O06"] },
  { id: "small-plug", label: "小型肛塞", category: "insertable", complexity: 5, verb: "wear", allowedClothing: ["C01","C02","C03","C06"], allowedOrientations: ["O02","O03","O04","O05","O07"] },
  { id: "plug", label: "肛塞", category: "insertable", complexity: 5, verb: "wear", allowedClothing: ["C01","C02","C03","C06"], allowedOrientations: ["O02","O03","O04","O05","O07"] },
  { id: "tail-plug", label: "尾巴肛塞", category: "insertable", complexity: 5, verb: "wear", allowedClothing: ["C01","C02","C03","C06"], allowedOrientations: ["O02","O03","O04","O05","O07"] },
  { id: "blindfold", label: "眼罩", category: "sensory", complexity: 2, verb: "wear", blocksEyes: true },
  { id: "earmuffs", label: "耳罩", category: "sensory", complexity: 2, verb: "wear" },
  { id: "mouth-accessory", label: "嘴部配件", category: "sensory", complexity: 4, verb: "wear" },
  { id: "paddle", label: "拍板", category: "display", complexity: 1, verb: "show" },
  { id: "whip", label: "鞭子", category: "display", complexity: 1, verb: "show" },
  { id: "cane", label: "藤條", category: "display", complexity: 1, verb: "show" },
  { id: "crop", label: "教鞭", category: "display", complexity: 1, verb: "show" },
  { id: "slapper", label: "拍打器", category: "display", complexity: 1, verb: "show" },
  { id: "feather", label: "羽毛棒", category: "display", complexity: 1, verb: "show" },
  { id: "pup-hood", label: "Pup hood", category: "role", complexity: 4, verb: "wear", blocksEyes: true },
  { id: "pup-mask", label: "Pup mask", category: "role", complexity: 4, verb: "wear", blocksEyes: true },
  { id: "dog-ears", label: "犬耳", category: "role", complexity: 1, verb: "wear" },
  { id: "dog-tail", label: "外掛式犬尾", category: "role", complexity: 2, verb: "wear", allowedOrientations: ["O02","O03","O04","O05","O07"] },
  { id: "harness", label: "Harness", category: "role", complexity: 2, verb: "wear" },
  { id: "leather-harness", label: "Leather harness", category: "role", complexity: 2, verb: "wear" },
];

function hashSeed(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRandom(seed: string) {
  let state = hashSeed(seed) || 0x9e3779b9;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(items: readonly T[], random: () => number): T {
  return items[Math.floor(random() * items.length)]!;
}

function clampLevel(value: number): 1 | 2 | 3 | 4 | 5 {
  return Math.max(1, Math.min(5, Math.round(value))) as 1 | 2 | 3 | 4 | 5;
}

function similarity(a: string, b: string) {
  const left = a.split("|");
  const right = b.split("|");
  const size = Math.min(left.length, right.length);
  if (!size) return 0;
  let equal = 0;
  for (let i = 0; i < size; i += 1) if (left[i] === right[i]) equal += 1;
  return equal / size;
}

function renderInstruction(
  clothing: Clothing,
  posture: Choice,
  hands: Choice,
  orientation: Choice,
  gaze: Choice | null,
  prop: Prop | null,
) {
  const pieces = [
    `${clothing.label}，${posture.label}`,
    orientation.label,
    hands.label,
  ];
  if (gaze) pieces.push(gaze.label);
  if (prop?.verb === "wear") pieces.push(`並佩戴${prop.label}`);
  if (prop?.verb === "show") pieces.push(`並讓${prop.label}清楚入鏡`);
  return `保持貞操鎖配戴狀態，${pieces.join("，")}。`;
}

function validGazes(orientationId: string, prop: Prop | null) {
  if (prop?.blocksEyes) return [];
  if (["O02", "O07", "O08"].includes(orientationId)) return GAZES.filter((gaze) => gaze.id !== "G01");
  return GAZES;
}

function propCandidates(ownedProps: readonly TaskPropId[]) {
  const owned = new Set(ownedProps);
  return PROPS.filter((prop) => owned.has(prop.id));
}

export function generateDailyTask(seed: string, options: TaskGenerationOptions = {}): GeneratedTask {
  const random = createRandom(seed);
  const ownedProps = options.ownedProps ?? [];
  const propFrequency = Math.max(0, Math.min(1, options.propFrequency ?? 0.6));
  const maxExposure = options.maxExposureLevel ?? 5;
  const minDifficulty = options.minDifficulty ?? 1;
  const maxDifficulty = options.maxDifficulty ?? 5;
  const avoid = options.avoidSignatures ?? [];

  for (let attempt = 0; attempt < 80; attempt += 1) {
    const availableProps = propCandidates(ownedProps);
    const prop = availableProps.length > 0 && random() < propFrequency ? pick(availableProps, random) : null;

    let clothingPool = CLOTHING.filter((item) => item.exposure <= maxExposure);
    if (prop?.allowedClothing) {
      const allowed = new Set(prop.allowedClothing);
      clothingPool = clothingPool.filter((item) => allowed.has(item.id));
    }
    if (!clothingPool.length) continue;
    const clothing = pick(clothingPool, random);

    const posture = pick(POSTURES, random);
    let handPool = HANDS.filter((item) => POSTURE_HANDS[posture.id]?.includes(item.id));
    if (prop?.forbiddenHands) {
      const forbidden = new Set(prop.forbiddenHands);
      handPool = handPool.filter((item) => !forbidden.has(item.id));
    }
    if (!handPool.length) continue;
    const hands = pick(handPool, random);

    let orientationPool = ORIENTATIONS.filter((item) => POSTURE_ORIENTATIONS[posture.id]?.includes(item.id));
    if (prop?.allowedOrientations) {
      const allowed = new Set(prop.allowedOrientations);
      orientationPool = orientationPool.filter((item) => allowed.has(item.id));
    }
    if (!orientationPool.length) continue;
    const orientation = pick(orientationPool, random);

    const gazePool = validGazes(orientation.id, prop);
    const gaze = gazePool.length && random() < 0.7 ? pick(gazePool, random) : null;

    const propDifficulty = prop?.complexity ?? 1;
    const difficulty = clampLevel(
      posture.difficulty * 0.35 +
      hands.difficulty * 0.20 +
      clothing.exposure * 0.25 +
      propDifficulty * 0.20,
    );
    if (difficulty < minDifficulty || difficulty > maxDifficulty) continue;

    const signature = [posture.id, hands.id, clothing.id, prop?.id ?? "NONE"].join("|");
    if (avoid.some((previous) => similarity(signature, previous) >= 0.75)) continue;

    return {
      instruction: renderInstruction(clothing, posture, hands, orientation, gaze, prop),
      signature,
      difficulty,
      exposureLevel: clothing.exposure,
      parts: {
        postureId: posture.id,
        handsId: hands.id,
        orientationId: orientation.id,
        gazeId: gaze?.id ?? null,
        clothingId: clothing.id,
        propId: prop?.id ?? null,
      },
    };
  }

  const fallback = {
    posture: POSTURES.find((item) => item.id === "P11")!,
    hands: HANDS.find((item) => item.id === "H08")!,
    orientation: ORIENTATIONS.find((item) => item.id === "O01")!,
    clothing: CLOTHING.find((item) => item.id === "C04")!,
  };
  return {
    instruction: renderInstruction(fallback.clothing, fallback.posture, fallback.hands, fallback.orientation, null, null),
    signature: "P11|H08|C04|NONE",
    difficulty: 2,
    exposureLevel: 1,
    parts: {
      postureId: "P11",
      handsId: "H08",
      orientationId: "O01",
      gazeId: null,
      clothingId: "C04",
      propId: null,
    },
  };
}

export const taskPropCatalog = PROPS.map(({ id, label, category }) => ({ id, label, category }));
