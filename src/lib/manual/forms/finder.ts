export type FinderChoice = { value: string; label: string; hint: string };
export type FinderQuestion = { key: string; ask: string; choices: FinderChoice[] };
/** planned เป็นจริงเมื่อทรงนั้นยังไม่ได้เขียน หน้าจอต้องบอกตรง ๆ
 *  ไม่ใช่ซ่อนตัวเลือกจนผู้ใช้คิดว่าต้นของตัวเองไม่มีในระบบ
 *
 *  reason แยกสองกรณีที่ต้องพูดคนละแบบ
 *  identified คือระบุทรงได้แล้วแต่ยังไม่ได้เขียนคู่มือของทรงนั้น
 *  uncovered คือผู้ใช้บอกเองว่าต้นไม่ตรงกับทรงใดเลย เรายังระบุไม่ได้ด้วยซ้ำ */
export type FinderOutcome = {
  formId: string;
  planned: boolean;
  reason?: "identified" | "uncovered";
};

export const finderQuestions: FinderQuestion[] = [
  {
    key: "stem",
    ask: "ลำต้นของต้นคุณเป็นแบบไหน",
    choices: [
      { value: "vine", label: "เลื้อยหรือพาดขึ้นหลัก", hint: "ลำต้นทอดยาว มีใบออกเป็นระยะตลอดความยาว" },
      { value: "upright", label: "ตั้งตรง เห็นลำต้นหรือกอก้านใบ", hint: "ก้านใบซ้อนกันออกจากโคนเดียว หรือแตกกิ่งเป็นพุ่ม" },
      { value: "underground", label: "ส่วนที่อ้วนอยู่ใต้ดินหรือที่โคนกอ", hint: "ขุดดินขึ้นมาเจอแง่ง หรือมีลำอ้วนตั้งจากโคนกอ" },
      { value: "leaf-only", label: "ใบออกจากดินเลย ไม่เห็นลำต้น", hint: "ใบตั้งขึ้นตรงจากดินเป็นกอ หรือเป็นใบเฟิร์นแตกจากเหง้า" },
      { value: "none", label: "ไม่ตรงสักข้อ", hint: "เช่นปาล์ม กระบองเพชร หรือต้นที่หน้าตาไม่เหมือนข้อไหนเลย" },
    ],
  },
  {
    key: "texture",
    ask: "ลำต้นเป็นแบบไหนเมื่อจับดู",
    choices: [
      { value: "soft", label: "อวบน้ำ งอได้ ผิวยังเขียว", hint: "บีบแล้วนุ่ม เช่นเถาไม้ใบในบ้าน" },
      { value: "woody", label: "แข็งเป็นไม้ ผิวออกน้ำตาล", hint: "งอแล้วหักดัง เช่นกุหลาบ ชวนชม" },
      { value: "hollow", label: "กลวง เคาะแล้วเสียงโปร่ง", hint: "มีข้อเป็นวงนูนถี่ ๆ เช่นไผ่" },
    ],
  },
  {
    key: "leaf",
    ask: "ใบของต้นคุณเป็นแบบไหน",
    choices: [
      { value: "thick", label: "หนา แข็ง ตั้งขึ้นตรง", hint: "หักแล้วมีน้ำเมือก เช่นลิ้นมังกร" },
      { value: "thin", label: "บาง นุ่ม เห็นเส้นใบนูนที่หลังใบ", hint: "เช่นบีโกเนีย" },
      { value: "frond", label: "แผ่ออกเป็นแฉกหรือขนนก อาจมีจุดสีน้ำตาลเรียงแถวที่หลังใบ", hint: "เช่นเฟิร์นทุกชนิด" },
    ],
  },
  {
    key: "bulb",
    ask: "มีลำอ้วนเป็นท่อนตั้งขึ้นจากโคนกอไหม",
    choices: [
      { value: "yes", label: "มี และรากออกจากโคนกอไม่ใช่จากดิน", hint: "เช่นกล้วยไม้สกุลหวาย" },
      { value: "no", label: "ไม่มี ส่วนที่อ้วนอยู่ใต้ดิน", hint: "ขุดขึ้นมาเจอแง่งทอดขวาง เช่นขิง ข่า" },
    ],
  },
];

/** ปลายทางของแต่ละเส้นทางคำตอบ คีย์คือค่าที่ตอบต่อกันด้วย "/"
 *  ทุกทรงในตารางของสเปกมีเส้นทางมาถึงครบแล้ว จึงไม่มีปลายทางที่ planned เหลืออยู่ */
const outcomes: Record<string, FinderOutcome> = {
  "vine/soft": { formId: "climbing-vine-visible-node", planned: false },
  "vine/woody": { formId: "woody-shrub-node", planned: false },
  "vine/hollow": { formId: "culm-node", planned: false },
  "upright/soft": { formId: "rosette-sheathed-node", planned: false },
  "upright/woody": { formId: "woody-shrub-node", planned: false },
  "upright/hollow": { formId: "culm-node", planned: false },
  "leaf-only/thick": { formId: "thick-leaf-no-stem", planned: false },
  "leaf-only/thin": { formId: "leaf-vein-bud", planned: false },
  "leaf-only/frond": { formId: "fern-frond-or-spore", planned: false },
  "underground/yes": { formId: "pseudobulb-node", planned: false },
  "underground/no": { formId: "rhizome-bud", planned: false },
  /** ต้นที่ไม่เข้าทรงใดในเก้าทรงที่มี เช่นปาล์ม กระบองเพชร
   *  ให้ปลายทางเป็นทรงที่ยังไม่ได้เขียน เพื่อให้ระบบบอกตรง ๆ แทนการยัดผู้ใช้เข้าทรงที่ผิด */
  none: { formId: "not-yet-covered", planned: true, reason: "uncovered" },
};

const byKey = Object.fromEntries(finderQuestions.map((question) => [question.key, question]));

/** ถามเฉพาะคำถามที่จำเป็นกับเส้นทางนั้น คำถามที่สองต่างกันตามคำตอบแรก
 *  เพราะ "ใบหนาหรือบาง" ถามกับต้นที่ไม่มีลำต้นเท่านั้นจึงจะมีความหมาย */
function questionsFor(stem: string | undefined): FinderQuestion[] {
  const first = finderQuestions[0];
  if (stem === "vine" || stem === "upright") return [first, byKey.texture];
  if (stem === "leaf-only") return [first, byKey.leaf];
  if (stem === "underground") return [first, byKey.bulb];
  return [first];
}

function answered(question: FinderQuestion, answers: Record<string, string | undefined>): string | null {
  const given = answers[question.key];
  return question.choices.some((choice) => choice.value === given) ? given! : null;
}

export function resolveFinder(answers: Record<string, string | undefined>): {
  question: FinderQuestion | null;
  outcome: FinderOutcome | null;
} {
  const path: string[] = [];

  for (const question of questionsFor(answers.stem)) {
    const value = answered(question, answers);
    if (value === null) return { question, outcome: null };
    path.push(value);
  }

  return { question: null, outcome: outcomes[path.join("/")] ?? null };
}
