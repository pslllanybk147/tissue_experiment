# Establishment Formula Comparison Sets and Explicit Term Annotations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เพิ่มชุดสูตรเปรียบเทียบสำหรับระยะตั้งต้นที่ไม่มีหลักฐานตรง และหยุดการทำหมายเหตุคำศัพท์อัตโนมัติที่รบกวนข้อความทั่วไป

**Architecture:** ข้อมูลสูตรยังคงอยู่ใน `PlantPack.mediaRecipes` โดยรักษา `establishment` เป็นชุดควบคุมและเพิ่ม recipe ids สองรายการต่อแผ่นเสริมที่เข้าเงื่อนไข เครื่องคำนวณที่มีอยู่แล้วจะรับรายการใหม่ผ่าน dropdown และจะแสดง note ของหลักฐานที่เลือก ส่วน `RichText` จะใช้ parser แบบห่อคำด้วยมือเท่านั้น เพื่อให้ผู้เขียนเป็นผู้กำหนดจุดที่ควรมีหมายเหตุ

**Tech Stack:** TypeScript, React 19, Next.js 16 App Router, Vitest, ESLint, PowerShell scripts

## Global Constraints

- สูตรใหม่ต้องใช้ BA 0.5 mg/L และ 6-BA (BAP) 1.0 mg/L + IBA 0.5 mg/L ตามสเปกที่อนุมัติ
- สูตรใหม่ที่ไม่มีงานตรงต้องระบุ `adapted` พร้อม source ids ที่มีอยู่จริงและ note ว่าเป็นจุดเริ่มคัดกรอง ไม่ใช่หลักฐานตรงระยะตั้งต้น
- `establishment` เดิมต้องยังเป็นค่าเริ่มต้นและยังเป็น MS ไม่ใส่ PGR
- หมายเหตุคำศัพท์ใน UI ต้องเกิดจาก `[[term-id|ข้อความ]]` เท่านั้น
- ห้ามเปลี่ยนสูตร multiplication/rooting ที่มีอยู่แล้ว
- ทุก production change ต้องมีเทสต์ที่เขียนและเห็นผลแดงก่อนแก้

---

### Task 1: เพิ่มชุดสูตรระยะตั้งต้นในแผ่นเสริมที่ไม่มีหลักฐานตรง

**Files:**
- Modify: `src/lib/manual/species/pink-princess.ts`
- Modify: `src/lib/manual/species/violin-variegated.ts`
- Modify: `src/lib/manual/species/thai-constellation.ts`
- Modify: `src/lib/manual/species/scindapsus-exotica.ts`
- Modify: `src/lib/manual/species/rhaphidophora-tetrasperma-variegata.ts`
- Modify: `src/lib/manual/species/generic-philodendron.ts`
- Test: `src/lib/manual/registry.test.ts`

**Interfaces:** ใช้ `MediaRecipe` เดิม ไม่เพิ่ม field ใหม่; recipe ใหม่ต้องมี id `establishment-ba` และ `establishment-bap-iba`, ใช้ชื่อสาร `BA`, `6-BA (BAP)`, `IBA` เพื่อให้ `stockIdForIngredient` ที่มีอยู่แล้วคำนวณได้

- [ ] **Step 1: เขียนเทสต์ที่ล้มเหลว**

เพิ่มใน `registry.test.ts` เทสต์ที่วนทั้งหก slug และตรวจว่ามี recipe ids ทั้งสาม, ค่า hormone ตรงตามสเปก, สูตรควบคุมไม่มี PGR และสูตรใหม่มีหลักฐาน `adapted` พร้อม note:

```ts
it.each([
  "pink-princess",
  "violin-variegated",
  "thai-constellation",
  "scindapsus-exotica",
  "rhaphidophora-tetrasperma-variegata",
  "generic-philodendron",
])("%s มีชุดสูตรตั้งต้นสามชุดสำหรับคัดกรอง", (slug) => {
  const recipes = resolveBySlug(slug)!.mediaRecipes;
  const control = recipes.find((recipe) => recipe.id === "establishment");
  const ba = recipes.find((recipe) => recipe.id === "establishment-ba");
  const bapIba = recipes.find((recipe) => recipe.id === "establishment-bap-iba");

  expect(control?.ingredients.some((ingredient) => ["BA", "BAP", "6-BA (BAP)", "IBA"].includes(ingredient.name))).toBe(false);
  expect(ba?.ingredients.find((ingredient) => ingredient.name === "BA")?.amountPerLiter).toBe(0.5);
  expect(bapIba?.ingredients.find((ingredient) => ingredient.name === "6-BA (BAP)")?.amountPerLiter).toBe(1);
  expect(bapIba?.ingredients.find((ingredient) => ingredient.name === "IBA")?.amountPerLiter).toBe(0.5);
  expect(ba?.evidence.level).toBe("adapted");
  expect(bapIba?.evidence.level).toBe("adapted");
  expect(ba?.evidence.note).toContain("ไม่ใช่หลักฐานตรงระยะตั้งต้น");
  expect(bapIba?.evidence.note).toContain("ไม่ใช่หลักฐานตรงระยะตั้งต้น");
});
```

- [ ] **Step 2: รันเทสต์ให้เห็นผลแดง**

Run: `npx vitest run src/lib/manual/registry.test.ts -t "มีชุดสูตรตั้งต้นสามชุด"`

Expected: FAIL เพราะแต่ละแผ่นเสริมยังไม่มี recipe ids ใหม่

- [ ] **Step 3: เพิ่มข้อมูลสูตรขั้นต่ำ**

ต่อท้าย recipe `establishment` เดิมในแต่ละไฟล์ด้วยสอง object ที่ใช้ MS/sucrose/agar/pH เดิมของไฟล์นั้น:

```ts
{
  id: "establishment-ba",
  title: "ระยะตั้งต้น · MS + BA (ชุดทดลอง)",
  pH: "5.7 ถึง 5.8",
  ingredients: [
    { name: "MS basal salts", amountPerLiter: 1, unit: "×" },
    { name: "Sucrose", amountPerLiter: 30, unit: "g/L" },
    { name: "Agar", amountPerLiter: 7.5, unit: "g/L" },
    { name: "BA", amountPerLiter: 0.5, unit: "mg/L", note: "ใช้น้ำยาแม่; ค่าตั้งต้นสำหรับคัดกรอง ไม่ใช่หลักฐานตรงระยะตั้งต้น" },
  ],
  evidence: {
    level: "adapted",
    sourceIds: ["source-selfheading-philodendron-2012"],
    note: "ค่าความเข้มข้นยืมจากงานพืชใกล้เคียงเพื่อทำชุดคัดกรอง ไม่ใช่หลักฐานตรงระยะตั้งต้น",
  },
},
{
  id: "establishment-bap-iba",
  title: "ระยะตั้งต้น · MS + 6-BA (BAP) + IBA (ชุดทดลอง)",
  pH: "5.7 ถึง 5.8",
  ingredients: [
    { name: "MS basal salts", amountPerLiter: 1, unit: "×" },
    { name: "Sucrose", amountPerLiter: 30, unit: "g/L" },
    { name: "Agar", amountPerLiter: 7.5, unit: "g/L" },
    { name: "6-BA (BAP)", amountPerLiter: 1, unit: "mg/L", note: "ใช้น้ำยาแม่; ค่าตั้งต้นสำหรับคัดกรอง ไม่ใช่หลักฐานตรงระยะตั้งต้น" },
    { name: "IBA", amountPerLiter: 0.5, unit: "mg/L", note: "ใช้น้ำยาแม่; ค่าตั้งต้นสำหรับคัดกรอง ไม่ใช่หลักฐานตรงระยะตั้งต้น" },
  ],
  evidence: {
    level: "adapted",
    sourceIds: ["source-selfheading-philodendron-2012"],
    note: "ค่าความเข้มข้นยืมจากงานพืชใกล้เคียงเพื่อทำชุดคัดกรอง ไม่ใช่หลักฐานตรงระยะตั้งต้น",
  },
},
```

ใช้ source ids ตามตารางนี้ใน object ของแต่ละแผ่น (ทั้งสองสูตรของแผ่นเดียวกันใช้ชุดเดียวกัน) และห้ามสร้าง source id ใหม่:

| แผ่นเสริม | `sourceIds` ของสองสูตรทดลอง |
| --- | --- |
| Pink Princess | `["source-pp-2023", "source-pp-thai-2023"]` |
| Violin Variegated | `["source-selfheading-philodendron-2012"]` |
| Thai Constellation | `["source-monstera-thai-constellation-2023"]` |
| Scindapsus exotica | `["source-miller-murashige-1976"]` |
| Rhaphidophora tetrasperma variegata | `["source-chan-tan-chew-2003"]` |
| Generic Philodendron | `["source-selfheading-philodendron-2012"]` |

- [ ] **Step 4: รันเทสต์ให้เขียว**

Run: `npx vitest run src/lib/manual/registry.test.ts -t "มีชุดสูตรตั้งต้นสามชุด"`

Expected: PASS

- [ ] **Step 5: ตรวจสูตรทั้ง registry และ commit**

Run: `npx vitest run src/lib/manual/evidence-rules.test.ts src/lib/manual/evidence-level.test.ts src/lib/manual/registry.test.ts`

Expected: PASS; จากนั้น commit ด้วย `git add src/lib/manual/species src/lib/manual/registry.test.ts && git commit -m "feat: add establishment comparison recipes"`

### Task 2: แสดงหมายเหตุหลักฐานของสูตรที่เลือกในเครื่องคำนวณ

**Files:**
- Modify: `src/components/rounds/medium-calculator.tsx`
- Test: `src/components/rounds/medium-calculator.test.tsx`

**Interfaces:** `MediumCalculator` รับ `MediaRecipe[]` เดิม; ใช้ `recipe.evidence.note` ที่มีอยู่แล้ว ไม่เพิ่ม prop ใหม่

- [ ] **Step 1: เขียนเทสต์ที่ล้มเหลว**

เพิ่มเทสต์ render สูตรที่มี note และตรวจว่าป้ายระดับหลักฐานกับ note แสดงในส่วนเครื่องคำนวณ:

```tsx
it("แสดงข้อจำกัดของหลักฐานของสูตรที่เลือก", () => {
  const html = renderToStaticMarkup(
    <MediumCalculator
      recipes={[{
        id: "establishment-ba",
        title: "ระยะตั้งต้น · MS + BA (ชุดทดลอง)",
        pH: "5.7 ถึง 5.8",
        ingredients: [],
        evidence: {
          level: "adapted",
          sourceIds: ["source-selfheading-philodendron-2012"],
          note: "ค่าคัดกรอง ไม่ใช่หลักฐานตรงระยะตั้งต้น",
        },
      }]}
      tools={{ scaleMinimumMg: 10, pipetteMinimumMl: 0.2, msLabelRateGPerL: 4.43 }}
    />,
  );

  expect(html).toContain("ค่าคัดกรอง ไม่ใช่หลักฐานตรงระยะตั้งต้น");
});
```

- [ ] **Step 2: รันเทสต์ให้เห็นผลแดง**

Run: `npx vitest run src/components/rounds/medium-calculator.test.tsx -t "แสดงข้อจำกัด"`

Expected: FAIL เพราะ component แสดง EvidenceBadge แต่ยังไม่แสดง note

- [ ] **Step 3: เพิ่มการแสดง note หลัง EvidenceBadge**

ใน `MediumCalculator` แสดง note เมื่อมีค่า:

```tsx
{recipe.evidence.note ? <p className="pl-meta" style={{ marginTop: "6px" }}>{recipe.evidence.note}</p> : null}
```

- [ ] **Step 4: รันเทสต์ให้เขียวและตรวจ calculator เดิม**

Run: `npx vitest run src/components/rounds/medium-calculator.test.tsx src/lib/rounds/medium-plan.test.ts src/lib/domain/hormone-stock-mapping.test.ts`

Expected: PASS (ไฟล์ `hormone-stock-mapping.test.ts` มีอยู่ใน repository)

- [ ] **Step 5: Commit**

Run: `git add src/components/rounds/medium-calculator.tsx src/components/rounds/medium-calculator.test.tsx && git commit -m "feat: show selected media evidence notes"`

### Task 3: จำกัดหมายเหตุคำศัพท์ให้เป็นการระบุด้วยมือ

**Files:**
- Modify: `src/components/guide/rich-text.tsx`
- Test: `src/components/guide/rich-text.test.tsx`

**Interfaces:** คง `RichText({ source: string })` และ `TermHelp` เดิม; เปลี่ยนเฉพาะการแปลง text spans ภายใน component

- [ ] **Step 1: เขียนเทสต์กัน false positive ที่ล้มเหลว**

เพิ่มเทสต์:

```tsx
it("ไม่ทำหมายเหตุอัตโนมัติให้คำทั่วไปในประโยค", () => {
  const html = renderToStaticMarkup(<RichText source="ข้อถัดไปให้วัดน้ำ 300 ppm" />);
  expect(html).not.toContain("<details");
  expect(html).toContain("ข้อถัดไปให้วัดน้ำ 300 ppm");
});

it("ยังทำหมายเหตุเมื่อผู้เขียนห่อคำศัพท์โดยตั้งใจ", () => {
  const html = renderToStaticMarkup(<RichText source="[[ppm|ppm]]" />);
  expect(html).toContain("<details");
  expect(html).toContain("หน่วยส่วนในล้านส่วน");
});
```

- [ ] **Step 2: รันเทสต์ให้เห็นผลแดง**

Run: `npx vitest run src/components/guide/rich-text.test.tsx -t "ไม่ทำหมายเหตุอัตโนมัติ"`

Expected: FAIL เพราะ `ContextualText` เรียก `parseContextualTerms` และสร้าง `<details>` จาก “ข้อ”/`ppm`

- [ ] **Step 3: แก้ render ให้ใช้ explicit parser เท่านั้น**

ลบ import และ function `ContextualText`; ให้ `RichText` map `parseTerms(source)` โดย text span เป็น `<span key={index}>{span.text}</span>` และ term span เป็น `TermHelp` เดิม

- [ ] **Step 4: รันเทสต์ให้เขียวและตรวจจุดเรียกทั้งหมด**

Run: `npx vitest run src/components/guide/rich-text.test.tsx src/lib/manual/terms.test.ts src/components/rounds/step-section.test.tsx`

Expected: PASS; จากนั้น `rg -n "parseContextualTerms" src` ต้องเหลือเฉพาะ utility/test ไม่ใช่ component render

- [ ] **Step 5: Commit**

Run: `git add src/components/guide/rich-text.tsx src/components/guide/rich-text.test.tsx && git commit -m "fix: require explicit term annotations"`

### Task 4: ตรวจทั้งระบบและปิดงาน

**Files:**
- Test/verify: `src/lib/manual/protocol-completeness.test.ts`, `src/lib/manual/term-integrity.test.ts`, `scripts/report-unwrapped-terms.mjs`, all `src/components/**` RichText call sites

- [ ] **Step 1: รันชุดเทสต์รวม**

Run: `npm test`

Expected: PASS ทุกเทสต์

- [ ] **Step 2: รัน static checks และ build**

Run: `npm run lint; npm run build`

Expected: lint และ build ผ่านโดยไม่มี TypeScript error

- [ ] **Step 3: รัน protocol/UI verification**

Run: `npm run protocol:verify; npm run ui:verify`

Expected: ผ่าน หรือบันทึกข้อจำกัดจาก external service/browser ที่ไม่เกี่ยวกับการแก้ไข

- [ ] **Step 4: ตรวจซ้ำด้วย search และ diff**

Run: `rg -n "parseContextualTerms" src/components src/lib; rg -n 'id: "establishment-(ba|bap-iba)"' src/lib/manual/species; git diff --check; git status --short`

Expected: component ไม่เรียก auto parser, ทุกแผ่นเสริมเป้าหมายมี recipe ids ครบ, diff ไม่มี whitespace error และไม่มีไฟล์แก้ค้างโดยไม่ตั้งใจ

- [ ] **Step 5: Commit verification notes if needed and report**

ถ้ามีเฉพาะไฟล์เอกสารผลตรวจ ให้ commit ด้วย `git add docs/superpowers/verification && git commit -m "docs: record full system verification"`; หากไม่มีการแก้ไฟล์ ให้สรุปคำสั่งและผลใน handoff โดยไม่สร้าง commit เปล่า
