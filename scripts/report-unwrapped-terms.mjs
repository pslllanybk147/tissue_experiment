// รายงานตำแหน่งที่อาจลืมห่อคำศัพท์ ใช้ตาคนตัดสินอีกที ไม่ใช่เกตอัตโนมัติ
//
// เหตุผลที่ไม่ทำเป็นเทสต์ คือภาษาไทยไม่มีช่องว่างคั่นคำ คำว่า "ข้อ" จะไปตรงกับ
// "ข้อมูล" "ข้อควรระวัง" "ข้อจำกัด" ทำให้เทสต์แดงจากของที่ไม่ผิด
// สิ่งที่บังคับด้วยเทสต์แทนอยู่ที่ src/lib/manual/term-integrity.test.ts
// คือทิศทางกลับกัน ทุกคำที่ห่อไว้ต้องมีอยู่จริงในทะเบียน
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const contentRoot = "src/lib/manual";
const formsRoot = "src/lib/manual/forms";
const isTest = /\.test\.tsx?$/;

// บรรทัดคอมเมนต์ไม่ใช่เนื้อหาที่ผู้ใช้อ่าน ข้ามไป
const isComment = (line) => /^\s*(\/\/|\/\*|\*)/.test(line.trim());

// คำประสมที่มีคำศัพท์อยู่ข้างในแต่คนละความหมาย ถอดออกก่อนตรวจ ไม่งั้นรายงานจะเสียงดัง
// จนไม่มีใครอ่าน เพิ่มคำใหม่ที่นี่เมื่อเจอ false positive ซ้ำ ๆ
const compounds = {
  node: ["ข้อมูล", "ข้อความ", "หัวข้อ", "ข้อจำกัด", "ข้ออ้าง", "ข้อควรระวัง", "ข้อดี", "ข้อเสีย", "ข้อสรุป", "ข้อกำหนด", "ข้อผิดพลาด", "ข้อเสนอ"],
  internode: [],
  "axillary-bud": ["ตาราง", "ตามที่", "ตาย"],
};

function stripCompounds(line, id) {
  let cleaned = line;
  for (const word of compounds[id] ?? []) cleaned = cleaned.split(word).join("");
  return cleaned;
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) yield* walk(path);
    else if (path.endsWith(".ts")) yield path;
  }
}

// อ่านคำจากไฟล์ทรงโดยตรงด้วย regex เพื่อไม่ต้อง compile TypeScript
function knownTerms() {
  const terms = [];
  for (const file of walk(formsRoot)) {
    if (isTest.test(file)) continue;
    const text = readFileSync(file, "utf8");
    for (const match of text.matchAll(/id:\s*"([a-z0-9-]+)",\s*\r?\n\s*term:\s*"([^"]+)"/g)) {
      terms.push({ id: match[1], term: match[2] });
    }
  }
  return terms;
}

const terms = knownTerms();
if (terms.length === 0) {
  console.log("ไม่พบคำศัพท์ในทะเบียนทรง ตรวจว่า src/lib/manual/forms มีไฟล์ทรงอยู่จริง");
  process.exit(0);
}

let found = 0;

for (const file of walk(contentRoot)) {
  if (isTest.test(file)) continue;
  if (file.includes("forms")) continue;
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, index) => {
    if (isComment(line)) return;
    for (const { id, term } of terms) {
      if (!stripCompounds(line, id).includes(term)) continue;
      if (line.includes(`[[${id}|`)) continue;
      found += 1;
      console.log(`${file}:${index + 1}  อาจลืมห่อ "${term}" (${id})`);
      console.log(`  ${line.trim()}`);
    }
  });
}

console.log(
  found === 0
    ? `ตรวจ ${terms.length} คำ ไม่พบจุดที่น่าสงสัย`
    : `ตรวจ ${terms.length} คำ พบ ${found} จุดที่ควรตรวจด้วยตา`,
);
