export type FinderChoice = { value: string; label: string; hint: string };
export type FinderQuestion = { key: string; ask: string; choices: FinderChoice[] };
/** planned เป็นจริงเมื่อทรงนั้นอยู่ในแผนแต่ยังไม่ได้เขียน หน้าจอต้องบอกตรง ๆ
 *  ไม่ใช่ซ่อนตัวเลือกจนผู้ใช้คิดว่าต้นของตัวเองไม่มีในระบบ */
export type FinderOutcome = { formId: string; planned: boolean };

export const finderQuestions: FinderQuestion[] = [
  {
    key: "stem",
    ask: "ลำต้นของต้นคุณเป็นแบบไหน",
    choices: [
      { value: "vine", label: "เลื้อยหรือพาดขึ้นหลัก", hint: "ลำต้นทอดยาว มีใบออกเป็นระยะตลอดความยาว" },
      { value: "rosette", label: "ตั้งตรง ใบออกรอบจุดเดียว", hint: "ก้านใบซ้อนกันออกจากโคนเดียว มองไม่เห็นลำต้นชัด" },
      { value: "rhizome", label: "มีหัวหรือเหง้าอยู่ใต้ดิน", hint: "ขุดดินขึ้นมาเจอหัวหรือแง่งทอดขวาง" },
      { value: "leaf-only", label: "ใบออกจากดินเลย ไม่เห็นลำต้น", hint: "ใบหนาตั้งขึ้นตรงจากดิน" },
    ],
  },
  {
    key: "node",
    ask: "ตามลำต้นมีวงนูนหรือปุ่มเป็นระยะ ๆ ไหม",
    choices: [
      { value: "visible", label: "เห็นชัด บางทีมีรากเล็ก ๆ งอกออกมา", hint: "ไล่นิ้วไปตามลำต้นแล้วสะดุดเป็นปุ่ม" },
      { value: "faint", label: "เห็นราง ๆ หรือไม่แน่ใจ", hint: "ลำต้นค่อนข้างเรียบ หาปุ่มไม่เจอชัด" },
    ],
  },
];

/** ปลายทางของแต่ละเส้นทางคำตอบ คีย์คือค่าที่ตอบต่อกันด้วย "/" */
const outcomes: Record<string, FinderOutcome> = {
  "vine/visible": { formId: "climbing-vine-visible-node", planned: false },
  "vine/faint": { formId: "climbing-vine-hidden-node", planned: true },
  rosette: { formId: "rosette-sheathed-node", planned: true },
  rhizome: { formId: "rhizome-bud", planned: true },
  "leaf-only": { formId: "thick-leaf-no-stem", planned: true },
};

/** ถามเฉพาะคำถามที่จำเป็นกับเส้นทางนั้น เส้นทางที่ไม่ใช่เถาเลื้อยจบตั้งแต่ข้อแรก */
function questionsFor(stem: string | undefined): FinderQuestion[] {
  if (stem === "vine") return finderQuestions;
  return finderQuestions.slice(0, 1);
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
