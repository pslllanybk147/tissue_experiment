# Calm Lab System Audit Fix Design

วันที่อนุมัติทิศทาง: 2026-08-10

## Goal

แก้ข้อบกพร่องจาก `E:\claude_code\audit_fix.md` ให้ protocol และข้อมูลรอบทำงานตามวิธีที่ผู้ใช้เลือกจริง พร้อมรวม visual system ของ public, workspace และ admin เป็น Calm Lab ที่อ่านง่าย ใช้ Torsilp ทั้งระบบ และให้ light/dark mode มี hierarchy เดียวกัน

## Approved Direction

Plantlover Lab เป็นพื้นที่ทำงานสำหรับผู้เริ่มต้นเพาะเลี้ยงเนื้อเยื่อ จัดลำดับตามงานจริงแบบทีละขั้น ใช้บรรยากาศห้องแล็บที่สงบและแม่นยำ โดยให้ข้อมูลรอบเพาะ สูตร และสถานะการทดลองเป็นเอกลักษณ์หลัก

ทิศทางนี้แทน Full Cyberpunk HUD เดิมด้วย Calm Lab:

- รักษาเอกลักษณ์ห้องแล็บและ botanical/scientific character
- ลด glow, HUD, grid ตกแต่ง, gradient ต่อเนื่อง, เส้นขอบหนา และ nested cards
- ใช้สีเขียวและ teal เฉพาะ action, focus, selection และสถานะที่มีความหมาย
- ให้คำเตือน ความเสี่ยง ข้อมูลทดลอง และค่าที่ผู้ใช้ต้องยืนยันเด่นกว่างานตกแต่ง
- ครอบคลุมทุก route ใน public, workspace และ admin โดยทยอยย้ายบน foundation เดียว
- ใช้ Torsilp เป็น font family เดียวทั้งระบบ

## Scope and Delivery Order

งานแบ่งเป็นห้าเฟสที่ตรวจสอบได้แยกกัน:

1. **Foundation** — รวม token, typography, theme และ shell ให้เป็นระบบเดียว
2. **Protocol integrity** — แก้ selection-driven instructions, round snapshots, R4 policy, calculator integration, BA/BAP และ pressure capability
3. **Core workflow UI** — ปรับ setup, protocol runner, calculator, round list และ interaction states
4. **System migration** — ย้าย public, workspace และ admin เข้าสู่ Calm Lab โดยรักษา route และ behavior เดิม
5. **Verification** — ตรวจ automated tests และ rendered behavior ทั้ง responsive, themes, keyboard และ content stress

ลำดับนี้ไม่อนุญาตให้งาน visual กลบปัญหา P0 ของ protocol หรือทำให้ระบบดูพร้อมใช้ทั้งที่ข้อมูลจริงยังไม่ถูกล็อกกับรอบ

## Layout System

ใช้ quiet grid เป็น alignment logic โดยไม่แสดงเส้นกริดตกแต่ง

### Responsive ranges

- Desktop ตั้งแต่ 1200px: container สูงสุด 1200px, gutter 32px และ 12-column grid
- Tablet 768–1199px: gutter 24px, 8-column grid และย้าย panel รองลงใต้เนื้อหาหลักเมื่อพื้นที่ไม่พอ
- Mobile ต่ำกว่า 768px: gutter 16px, single-column และเรียงตามลำดับงานแทนการย่อ desktop ตรง ๆ
- เนื้อหาสำหรับอ่านหรือทำ protocol จำกัดความกว้างประมาณ 720–800px
- dashboard, list และ audit surfaces ที่ต้องเปรียบเทียบข้อมูลใช้พื้นที่ได้ถึง 1200px

### Composition rules

- Desktop ใช้ top navigation แบบกระชับและอยู่ตำแหน่งสม่ำเสมอทุก route
- Mobile ใช้ bottom navigation ต่อได้ แต่ต้องรองรับ safe area และมี page-end padding มากพอไม่ให้บัง content หรือ focus target
- แต่ละ viewport หรือ workflow stage มี dominant area เดียว เช่น ขั้นตอนปัจจุบันหรือแบบฟอร์มที่กำลังกรอก
- ลด nested cards โดยใช้ surface หลักหนึ่งชั้น แล้วแบ่งกลุ่มด้วย spacing, heading และ divider
- หน้า setup เป็น workflow สามช่วง: ข้อมูลสาร → เลือกวิธี → ตรวจทานและยืนยัน
- Desktop ใช้สองคอลัมน์สำหรับ main workflow กับ review summary เมื่อพื้นที่พอ; mobile เรียง main workflow ก่อน summary
- action สำคัญอยู่ท้าย section หรือใน sticky action bar เฉพาะ workflow ยาว โดยต้องไม่บัง content, validation message หรือ keyboard focus
- ตารางบน mobile เปลี่ยนเป็น prioritized rows หรือ horizontal scroll ที่มีชื่อคอลัมน์และคำอธิบายชัดเจน

### Spacing and density

ใช้ spacing scale `4, 8, 12, 16, 24, 32, 48, 64` px และมี density สองระดับ:

- `comfortable` สำหรับคู่มือ แบบฟอร์ม และ protocol execution
- `compact` สำหรับข้อมูลรอบ ตาราง audit และ metadata ที่ต้องเปรียบเทียบ

## Typography

Torsilp เป็น font family เดียวของ display, heading, body, label, button, metadata, scientific names, identifiers และ numeric data ห้ามให้ Geist, IBM Plex, Noto หรือ Georgia เป็น font หลักของ UI

### Type scale

- Display/H1: `clamp(32px, 4vw, 42px)`, line-height `1.15`
- H2: `26px`, line-height `1.25`
- H3: `21px`, line-height `1.35`
- Body หลัก: `17px`, line-height `1.65`
- Body กระชับ: `16px`, line-height `1.55`
- Label และ button: `15–16px`, line-height `1.4`
- Metadata และ status: อย่างน้อย `14px`, line-height `1.45`
- Input: อย่างน้อย `16px`
- Numeric emphasis เช่น ppm, mL และ pH: `18–22px`

### Typography rules

- จำกัด reading measure ประมาณ 55–70 ตัวอักษรต่อบรรทัด
- ห้ามใช้ข้อความเล็กกว่า 14px เมื่อข้อมูลนั้นต้องอ่านหรือใช้ตัดสินใจ
- ตรวจ metadata ของไฟล์ Torsilp ก่อน implementation หากมีเพียงน้ำหนักเดียวให้ใช้ขนาด สี spacing และตำแหน่งสร้าง hierarchy แทน synthetic bold ที่มากเกินไป
- ใช้ `font-variant-numeric: tabular-nums` กับข้อมูลที่ต้องจัดแนวเมื่อ glyph ของ Torsilp รองรับ; ถ้าไม่รองรับยังคงใช้ Torsilp และจัดแนวด้วย layout
- ชื่อวิทยาศาสตร์ใช้ italic แต่ไม่เปลี่ยน font family
- ลด uppercase และ letter-spacing แบบ HUD เหลือเฉพาะรหัสสั้นที่จำเป็น
- label และ button ใช้ถ้อยคำเต็มที่บอกงาน ไม่ย่อจนเสียความหมาย

## Color, Surfaces, and Themes

ใช้ semantic tokens จากแหล่งเดียวสำหรับ public, workspace และ admin

| Role | Light | Dark |
|---|---|---|
| Canvas | `#F4F6F2` | `#0D1714` |
| Primary surface | `#FFFFFF` | `#13201C` |
| Secondary surface | `#EAF0EC` | `#192923` |
| Primary text | `#17251F` | `#F1F7F3` |
| Secondary text | `#52645B` | `#A8BAB0` |
| Border | `#CDD8D1` | `#344A40` |
| Primary action | `#1F6B52` | `#9BC8AD` |
| Teal accent | `#287C86` | `#69B7BD` |
| Focus ring | `#167B88` | `#7DD3DA` |
| Warning | `#9A5B13` | `#F0B866` |
| Danger | `#A33A32` | `#F08A82` |

ค่าข้างต้นเป็น foundation/semantic direction และต้องผ่าน rendered contrast verification ก่อนถือว่าใช้ได้จริง คู่สี foreground ของ action, warning, danger, success และ disabled ต้องประกาศอย่างชัดเจนใน implementation แทนการรับสีข้อความจาก parent

### Color and surface rules

- พื้นหลังเป็นสีเรียบ ไม่มี decorative grid, glow หรือ continuous gradient
- ใช้ border 1px เพื่ออธิบาย containment, adjacency หรือ state ไม่ล้อมทุกข้อความด้วย card
- primary green ใช้กับ dominant action เพียงหนึ่งจุดต่อ section
- teal ใช้กับ focus, link และข้อมูลเชิงระบบ
- warning และ danger ใช้เฉพาะสถานะจริง พร้อม icon หรือข้อความ ไม่สื่อด้วยสีอย่างเดียว
- selected state ใช้ indicator, border และ label ร่วมกัน
- disabled state ต้องยังอ่านข้อความและเหตุผลได้
- shadow ใช้เฉพาะ sticky, overlay หรือ surface ที่ลอยจริง และใช้ค่าเดียวกันอย่างสม่ำเสมอ

### Theme behavior

- ลำดับการเลือกธีม: user preference → system preference → light
- ตั้ง `data-theme` ก่อน first paint เพื่อป้องกัน theme flash
- ประกาศ `color-scheme: light dark` เพื่อให้ native form controls สอดคล้องกับธีม
- theme toggle แสดง current state และ target action ด้วย accessible name ที่ชัดเจน
- ทุก semantic pair ต้องตรวจใน default, hover, focus, active, selected, disabled, loading, success, warning และ error states

## Protocol Integrity Architecture

### Selection-driven resolver

สร้าง resolver กลางที่รับ locked `LotSterilizationSnapshot` และ context ของขั้น แล้วคืน execution plan ที่ใช้ได้กับรอบนั้นเท่านั้น:

- `prep-media` แสดงเฉพาะ pressure sterilization, Haiter หรือ NaDCC ที่เลือก
- `sterilize` แสดงเฉพาะ surface sterilization method ที่เลือก
- `rinse` แสดงเฉพาะ sterile water, NaDCC หรือ NaOCl rinse ที่เลือก
- method ที่ไม่ได้เลือกต้องไม่ปรากฏใน materials, execution instructions, calculator หรือ troubleshooting
- calculator อยู่ใน protocol และรับ chemistry จาก locked snapshot ไม่ให้ผู้ใช้เปิด calculator แยกแล้วคัดลอกค่าเอง

### Locked R4 decision

T1 และ T2 ใช้ chlorinated rinse 300 ppm จำนวน 3 รอบ รอบละประมาณหนึ่งนาที และ **ไม่มี final sterile-water rinse หรือ R4** ข้อความ setup, summary, protocol, tests และ troubleshooting ต้องใช้ policy เดียวกัน

นี่เป็น product requirement ที่อนุมัติแล้ว ไม่ใช่การรับรองความถูกต้องทางวิทยาศาสตร์ ก่อนใช้กับการปฏิบัติจริงยังต้องตรวจฉลาก ผลิตภัณฑ์ protocol รายพืช และผู้เชี่ยวชาญ

### Round snapshot contract

แต่ละ preparation snapshot ต้องเก็บ:

- method และ protocol version
- product name และ batch/lot
- label concentration
- target และ actual ppm
- calculated และ actual dose
- stock volume, final volume และ container count
- `preparedAt`, `confirmedAt` และ `lockedAt`
- evidence status: `planned`, `prepared` หรือ `verified`

Equipment profile เป็นค่าเริ่มต้นเท่านั้น ผู้ใช้ต้องตรวจทานก่อนสร้างรอบ การแก้ profile หลังจากนั้นต้องไม่เปลี่ยน locked round snapshot และ planned data ต้องไม่ถูกนำเสนอเป็นหลักฐานว่าเตรียมจริงแล้ว

### Related correctness fixes

- BA และ BAP แยกชื่อใน UI พร้อมอธิบายความสัมพันธ์ และตรวจ ingredient-to-stock mapping ก่อนใช้ค่าคำนวณ
- pressure sterilization เปิดหรือปิดจาก equipment capability ไม่ hard-code
- lot เก่าที่ไม่มีข้อมูลใหม่ยังเปิดอ่านได้ในสถานะ legacy โดยระบบไม่สร้างค่าที่ไม่มีหลักฐานขึ้นมาเอง

## Component Grammar

### WorkflowShell

ประกอบด้วย heading, progress, main workflow, review summary และ action area มีหนึ่ง dominant action และรองรับ main/review stacking บน narrow containers

### FieldGroup

ประกอบด้วย label, hint, input, unit, validation และ recovery message รักษาค่าที่ผู้ใช้กรอกเมื่อ validation หรือ save ล้มเหลว

### MethodSelector

ใช้ radio rows ที่มี default, selected, disabled และ experimental states แสดงเหตุผลของ disabled และไม่ซ่อนตัวเลือกอื่นเมื่อมีการเลือก

### PreparationSummary

แสดง method, product, calculated เทียบ actual values, timestamps และ evidence status โดยแยก planned ออกจาก prepared/verified อย่างชัดเจน

### StatusNotice

รองรับ info, success, warning, error และ blocked แต่ละ variant มี semantic role, icon/text cue และ recovery action เมื่อทำได้

### ActionBar

มี secondary action และ primary actionหนึ่งรายการ รองรับ sticky behavior เฉพาะ workflow ยาวโดยไม่บัง content หรือ focus

### DataList and DataTable

ใช้กับข้อมูลรอบและ audit มี compact density, long-content handling, explicit empty/loading/error states และ mobile transformation ที่รักษาลำดับความสำคัญของข้อมูล

## Error and Recovery Behavior

- ข้อมูลจำเป็นไม่ครบ: block การยืนยัน แสดง summary และย้าย focus ไป field แรกที่ผิด
- calculator คำนวณไม่ได้: เก็บค่าที่กรอก แสดงสาเหตุ และบอกวิธีแก้ที่เจาะจง
- save ล้มเหลว: ไม่สร้างหรือแสดง round ที่บันทึกไม่ครบ และให้ retry โดยไม่สูญเสีย input
- loading: รักษา geometry ของหน้าและไม่ทำให้ action ที่ยังใช้ไม่ได้ดูเหมือนพร้อม
- empty: อธิบายว่าทำไมยังไม่มีข้อมูลและเสนอ next action ที่ตรงกับ workflow
- destructive: ยืนยันก่อนทำและใช้ soft delete ตาม behavior เดิม
- legacy: เปิดอ่านได้ มีป้าย legacy และระบุข้อมูลที่ไม่มีแทนการเติมค่าคาดเดา

## Migration Strategy

1. รวม theme/token/font foundation โดยรักษา behavior เดิม
2. เพิ่ม Calm Lab primitives พร้อม state tests
3. แก้ protocol resolver, snapshots, calculator integration, R4, BA/BAP และ capability logic
4. ย้าย round setup และ protocol runner
5. ย้าย public guide, home, search, problem, substances, forms และ calculators
6. ย้าย workspace rounds, equipment, trials, dataset, knowledge และ admin
7. ลบ CSS tokens, raw colors, font roles และ component variants เก่าหลังไม่มี consumer เหลือ

การ migration ต้องไม่สร้าง Big Bang rewrite ทุก task ต้องมี independently testable deliverable และต้องไม่เปลี่ยน route, persistence behavior หรือ scientific copy นอกข้อกำหนดที่อนุมัติ

## Verification

### Render matrix

- Viewports: 360, 768, 1280 และ 1600px
- Themes: light, dark และ system preference
- Inputs: mouse, touch และ keyboard-only
- States: default, hover, focus, active, selected, disabled, loading, empty, success, warning, error, blocked และ destructive
- Content stress: ข้อความไทยยาว ชื่อวิทยาศาสตร์ยาว ค่าเป็นศูนย์ ค่าขาด รูปไม่โหลด และข้อมูล legacy

### Accessibility and interaction checks

- landmarks และ heading order
- form labels, descriptions และ error associations
- keyboard order, visible focus และ focus restoration
- touch targets และ safe-area behavior
- rendered foreground/background contrast
- non-color state cues
- reduced motion
- overlay close behavior และ scroll/overflow

### Protocol E2E matrix

- medium/container: pressure, Haiter และ NaDCC
- surface sterilization: Haiter และ NaDCC
- rinse: sterile water, NaDCC และ NaOCl
- แต่ละกรณีต้องยืนยันว่า method อื่นไม่แสดง
- T1/T2 ต้องไม่มี R4
- calculated/actual values และ preparation metadata ต้องคงเดิมหลัง reload และหลังแก้ equipment profile
- create, open, save, resume และ soft delete round ต้องผ่าน flow จริง

### Automated sequence

รัน focused tests ระหว่างแต่ละ task แล้วจึงรัน:

1. `npm test`
2. `npm run lint`
3. `npm run build`
4. `npm run ui:verify`
5. `git diff --check`

ปรับ `ui:verify` ให้รายงาน route, theme และ viewport ที่ timeout และเก็บ failure screenshot แทนการหยุดด้วยข้อความที่ระบุต้นเหตุไม่ได้

## Definition of Done

- protocol เปลี่ยนตาม method ที่ล็อกกับรอบและไม่มีคำสั่งของ method อื่น
- round เก็บ preparation data จริงตาม contract และแยก planned จาก prepared/verified
- R4 policy สอดคล้องกันทั้ง setup, protocol, tests และ troubleshooting
- calculator อยู่ใน protocol และใช้ locked chemistry
- pressure capability และ BA/BAP mapping ทำงานตามข้อมูลจริง
- public, workspace และ admin ใช้ Calm Lab tokens, Torsilp และ theme contract เดียวกัน
- responsive composition ไม่บัง content และไม่บีบ desktop layout ลง mobile ตรง ๆ
- automated checks ผ่าน และมี rendered evidence ตาม matrix ที่ระบุ
- ส่วน scientific correctness ที่ยังไม่ได้รับรองถูกระบุเป็นข้อจำกัด ไม่ถูกนำเสนอว่า verified หรือ safe

## Out of Scope

- การรับรองสูตร เวลา หรือความเข้มข้นทางวิทยาศาสตร์โดยไม่มีการตรวจจากแหล่งอ้างอิง ฉลากจริง และผู้เชี่ยวชาญ
- การเปลี่ยน route หรือ product workflow ที่ไม่เกี่ยวกับ audit และ Calm Lab migration
- การสร้าง dependency ใหม่เพื่อทำ effect ที่ CSS เดิมรองรับได้
- การคง Full Cyberpunk HUD, decorative glow, animated grid หรือ ambient motion เป็น visual direction หลัก

## Approval Record

- Visual direction: Calm Lab
- Scope: public, workspace และ admin ทั้งระบบ
- Font direction: Torsilp ทั้งระบบ
- Delivery approach: unified foundation แบบทยอย migration
- Layout direction: quiet grid, responsive recomposition และลด nested cards
- Theme direction: approved Calm Lab light/dark palette and semantic roles
- R4 decision: T1/T2 ไม่มี final sterile-water rinse
- Mockups: approved as directional references; implementation must use exact project tokens and the real Torsilp font rather than treating generated pixels as specifications
