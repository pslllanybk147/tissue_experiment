# Botanical Atlas System Redesign Design

วันที่อนุมัติทิศทาง: 2026-08-11

## Goal

ออกแบบ Plantlover Lab ใหม่ทั้งระบบให้การ์ดขั้นตอนอ่านง่าย ปุ่มหลักไม่กลืนกับพื้นหลัง ภาษาไทยเป็นระเบียบ และ Light/Dark theme มีคุณภาพเท่ากัน โดยคง route, ข้อมูล, สูตรคำนวณ, validation และ workflow เดิมทั้งหมด

เอกสารนี้แทนข้อกำหนดด้านภาพ สี typography และ component presentation ในเอกสาร Calm Lab เดิม ส่วนข้อกำหนดทางวิทยาศาสตร์ ข้อมูล และ workflow ที่ไม่ขัดกับเอกสารนี้ยังคงใช้ต่อ

## Approved Direction

**Botanical Atlas** เป็นคู่มือภาคสนามร่วมสมัยสำหรับผู้เริ่มต้นเพาะเลี้ยงเนื้อเยื่อ จัดเนื้อหาด้วยลำดับบทและ reading flow แบบบรรณาธิการ ใช้กระดาษโทนอุ่น กรมท่า และสีพฤกษศาสตร์เป็นบุคลิกหลัก โดยให้หมายเลขขั้น เกณฑ์จบ และสถานะการทดลองเป็น motif ประจำผลิตภัณฑ์

ผู้ใช้เลือกทิศทางนี้จาก mockup 5 แบบ และอนุมัติ foundation กับ component system แล้ว โดยกำหนดความหนาแน่นระดับสมดุล: อ่านง่ายแต่ไม่เว้นพื้นที่จนต้องเลื่อนมากเกินไป

### Preserved

- ลำดับงานทีละขั้นและข้อมูลจริงของ protocol
- semantic status ได้แก่ success, warning, danger/blocked และ disabled
- Light/Dark theme, keyboard navigation และ responsive behavior
- action labels ภาษาไทยที่อธิบายงานจริง
- สูตรคำนวณ การบันทึกข้อมูล และ validation ปัจจุบัน

### Evolved

- quiet grid เปลี่ยนเป็น editorial sequence ที่มองเห็นลำดับบทชัดขึ้น
- การ์ดที่เส้นและพื้นผิวใกล้กัน เปลี่ยนเป็น section anatomy ที่แยกหัวข้อ คำสั่ง รายละเอียด และเกณฑ์จบ
- CTA สีเขียวที่กลืนกับบริบท botanical เปลี่ยนเป็นกรมท่าใน Light และ periwinkle ใน Dark
- mobile เปลี่ยน composition ตามลำดับความสำคัญ ไม่ย่อ desktop ตรง ๆ

### Replaced

- MN Chaeo Hon และ Torsilp ถูกแทนด้วย Sarabun ในข้อความ UI ทั้งระบบ
- ค่าสีเฉพาะจุดและ legacy aliases ที่ซ้ำกันถูกแทนด้วย semantic token source เดียว
- fixed-height card/control และการบีบข้อความให้อยู่บรรทัดเดียวถูกถอดออก
- คำกำกับ mockup เช่น `Primary`, `Keyboard focus`, `Destructive` และ `Disabled` ห้ามปรากฏใน production UI

## Typography

ใช้ Sarabun เป็น local font เพื่อให้หน้าจอทำงานได้โดยไม่ต้องโหลด font จากบริการภายนอก แพ็กเกจต้องมีไฟล์ font น้ำหนัก 400, 500, 600 และ 700 พร้อม OFL license จากแหล่งต้นทาง

### Roles

| Role | Size | Weight | Line height |
|---|---:|---:|---:|
| Display / H1 | `clamp(34px, 4vw, 44px)` | 600 | 1.25 |
| H2 | `28px` | 600 | 1.35 |
| H3 | `22px` | 600 | 1.4 |
| Body | `18px` | 400 | 1.7 |
| Compact body | `16px` | 400–500 | 1.6 |
| Label / button | `15–16px` | 600–700 | 1.45 |
| Metadata | `14px` | 500 | 1.5 |
| Numeric emphasis | `20–24px` | 600 | 1.35 |

### Thai text rules

- ห้ามใช้ negative letter-spacing กับข้อความไทย
- line-height ของข้อความไทยห้ามต่ำกว่า 1.5 เพื่อเผื่อสระและวรรณยุกต์
- heading ใช้น้ำหนักและระยะห่างสร้าง hierarchy แทนการบีบตัวอักษร
- ข้อความ human-facing ทั้งหมด รวมปุ่ม label help text metadata และสถานะ ใช้ Sarabun
- system monospace ใช้ได้เฉพาะ code หรือ machine identifier ที่ไม่มีข้อความไทย
- fallback คือ `Tahoma, sans-serif`
- font loading ใช้ `display: swap` และต้องไม่มี layout ที่พังระหว่าง fallback/loaded state

## Color and Themes

foundation token เป็น raw palette ส่วน component ต้องเรียกผ่าน semantic role เท่านั้น

### Light theme

| Token | Value |
|---|---|
| Canvas | `#F7F3EA` |
| Surface | `#FFFEFA` |
| Surface subtle | `#F2EAD9` |
| Surface hover | `#EEE6D5` |
| Text | `#292D29` |
| Text muted | `#646860` |
| Text faint | `#77786F` |
| Border | `#C8C3B7` |
| Border strong | `#8F8A7F` |
| Primary action | `#293E63` |
| Primary hover | `#203552` |
| On primary | `#FFFFFF` |
| Botanical accent | `#6C663D` |
| Focus | `#2E69A3` |
| Success / subtle | `#35654A` / `#E6EFE8` |
| Warning / subtle | `#8A5A19` / `#FBEFD9` |
| Danger / subtle | `#963D34` / `#F8E7E4` |
| Disabled / on disabled | `#DEDCD3` / `#77786F` |

### Dark theme

| Token | Value |
|---|---|
| Canvas | `#1C1D1A` |
| Surface | `#262722` |
| Surface subtle | `#2E302A` |
| Surface warm | `#3B3427` |
| Surface hover | `#363831` |
| Text | `#F7F4ED` |
| Text muted | `#C2BEB1` |
| Text faint | `#A6A398` |
| Border | `#5A5C55` |
| Border strong | `#7C7F76` |
| Primary action | `#9BB0D9` |
| Primary hover | `#B0C1E3` |
| On primary | `#18223A` |
| Botanical accent | `#C9BC7C` |
| Focus | `#9BCAFF` |
| Success / subtle | `#8BC09A` / `#263B2D` |
| Warning / subtle | `#E4BA75` / `#433522` |
| Danger / subtle | `#F09286` / `#482926` |
| Disabled / on disabled | `#3F413B` / `#999B92` |

### Theme rules

- Dark theme เป็น palette ที่ออกแบบแยก ไม่ใช่ invert Light theme
- CTA ใช้กรมท่า/periwinkle เพื่อไม่กลืนกับ success และ botanical accent
- สถานะห้ามพึ่งสีอย่างเดียว ต้องมีข้อความ หัวข้อ หรือสัญลักษณ์ร่วมด้วย
- focus ring ต้องชัดบน canvas, surface และ action ทุกชนิด
- disabled ต้องดูต่างจาก active แต่ยังอ่านข้อความได้
- forced-colors ต้องคง outline, border และชื่อสถานะที่มีความหมาย

## Layout and Spacing

ใช้ quiet editorial grid โดยให้ reading order เป็นตัวนำและใช้เส้นเฉพาะการแบ่งบท ความสัมพันธ์ และสถานะ

### Widths and breakpoints

- Desktop ตั้งแต่ 1200px: wide container สูงสุด 1200px, gutter 32px
- Tablet 768–1199px: gutter 24px, panel รองย้ายลงเมื่อพื้นที่ไม่พอ
- Mobile ต่ำกว่า 768px: gutter 16px, single column ตามลำดับงาน
- protocol และ long-form reading จำกัดความกว้างประมาณ 780px
- dashboard, table และ audit surface ใช้พื้นที่ได้ถึง 1200px
- ห้ามเกิด horizontal page overflow ที่ 320px ขึ้นไป

### Rhythm

ใช้ spacing scale `4, 8, 12, 16, 24, 32, 48, 64` px

- section หลักเว้น 32–48px
- card anatomy ใช้ 12–20px ตามระดับข้อมูล
- control gap ใช้ 8–12px
- body measure เป้าหมาย 45–75 ตัวอักษรต่อบรรทัดเมื่อ viewport เอื้อ
- card, button และ field ที่มีข้อความห้ามกำหนด fixed height

### Responsive transformation

- desktop สามารถใช้ main content + contextual aside ได้
- tablet ย้าย aside ใต้ main content โดยรักษาลำดับ heading ก่อนรายละเอียด
- mobile ใช้คอลัมน์เดียว ปุ่มหลักอยู่หลังปุ่มรองใน DOM แต่แสดงเป็น full width ตาม task order
- table ที่ต้องเปรียบเทียบหลายคอลัมน์ใช้ horizontal scroll พร้อมหัวตาราง sticky; ตารางสำหรับอ่านรายรายการเปลี่ยนเป็น label/value rows
- bottom/sticky action bar ต้องเผื่อ safe area และห้ามบัง error, content หรือ focus target

## Component Grammar

### Protocol step card

หน้าที่คือบอก “ทำอะไร ใช้อะไร ใช้เวลาเท่าไร และจบเมื่อใด” ในหน่วยเดียว

Anatomy:

1. top rule สี primary เพื่อแสดงขอบเขตขั้น
2. หมายเลขลำดับพร้อม divider
3. heading และ action copy
4. detail list แบบ label/value
5. completion block ที่ใช้ warm subtle surface
6. optional next/stop guidance ที่เป็น semantic notice แยกจาก completion

การ์ดขยายตามเนื้อหา ไม่มี fixed height และไม่บังคับ label ยาวให้อยู่บรรทัดเดียว

### Buttons

- Primary: action หลักหนึ่งรายการต่อ action group ใช้ primary action token
- Secondary: ย้อนกลับ เปลี่ยน หรือ action รอง ใช้ surface + strong border
- Quiet: action ความสำคัญต่ำ ไม่มี container ถาวร แต่ต้องมี focus state
- Destructive: ใช้ danger pair และคำกริยาชัด เช่น “ลบบันทึก”
- Disabled: ใช้ disabled pair และเก็บ label งานจริงไว้ เช่น “ยังไปต่อไม่ได้”
- minimum target 48px; ปุ่มงานสำคัญใน mobile สูงอย่างน้อย 52px
- production UI ไม่แสดงชื่อ variant ภาษาอังกฤษใต้ปุ่ม

### Photo evidence

- container แยก purpose copy ออกจาก selection target
- selection target ใช้ dotted/dashed accent border อย่างน้อย 2px และข้อความไทยชัดเจน
- หลังเลือกไฟล์ แสดงชื่อ/preview/status และทำ upload submit ให้เป็น primary action
- ก่อนเลือกไฟล์ upload submit เป็น disabled พร้อมข้อความเหตุผลที่อ่านได้
- mobile เรียง purpose, picker, preview และ submit แนวตั้ง

### Forms

ลำดับคงที่คือ label → hint → control → error

- control สูงอย่างน้อย 48px และ font อย่างน้อย 16px
- error อยู่ใต้ control และเชื่อมด้วย `aria-describedby`
- validation ต้องไม่ทำให้ layout กระโดดจน action หายจาก viewport
- number input ต้องยอมให้ผู้ใช้ลบค่าเป็นค่าว่างระหว่างแก้ไข
- unit อยู่ใน control group ที่ยืดหยุ่นและห้ามทับค่าตัวเลข

### Status notices

- anatomy คือ symbol → title → explanation → optional action
- success, warning และ blocked/error ใช้คู่สี semantic พร้อมข้อความกำกับ
- warning เชิงคำนวณต้องแยก “ค่าประมาณจากสูตร” ออกจาก “ค่าที่ตรวจจริง”
- blocked/error ต้องอยู่ใกล้ control หรือ action ที่แก้ปัญหาได้

### Data and navigation surfaces

- list ใช้ divider และ alignment มากกว่า nested card
- table header/row state ต้องยังอ่านได้ในทั้งสองธีม
- current step ใช้หมายเลข บท และข้อความสถานะร่วมกัน
- pagination ใช้ secondary สำหรับย้อนกลับและ primary สำหรับไปต่อ
- app navigation คงลำดับ route เดิม แต่รับ typography, token และ state grammar ใหม่

## Content Stress and Overlap Prevention

กติกานี้เป็น acceptance requirement ไม่ใช่ polish ภายหลัง:

- ทุก grid/flex child ที่รับข้อความใช้ `min-width: 0`
- ใช้ `overflow-wrap: break-word` หรือ behavior เทียบเท่า และ `word-break: normal` สำหรับภาษาไทย
- ห้ามใช้ `white-space: nowrap` กับข้อความที่ผู้ใช้หรือข้อมูลระบบทำให้ยาวได้ ยกเว้น identifier ที่มี overflow strategy
- heading, button, badge, unit และ metadata ต้องทดสอบด้วยข้อความยาวอย่างน้อยสองเท่าของกรณีปกติ
- font fallback และ font loaded state ต้องไม่มี clipping ของสระหรือวรรณยุกต์
- zoom 200% ต้องไม่มีข้อความทับกันและ action ยังเข้าถึงได้
- mobile ไม่ใช้ scale transform เพื่อย่อ desktop composition

## Motion and Depth

- border และ spacing เป็นเครื่องมือหลัก; shadow ใช้เฉพาะ modal, overlay และ raised transient surface
- radius ใช้ 0–4px กับ card/control ตาม editorial geometry; modal ใช้ได้ถึง 8px
- hover/focus transition 120–180ms เฉพาะ color, border, shadow และ transform ที่สื่อ feedback
- `prefers-reduced-motion` ตัด nonessential transition และ animation
- ไม่มี gradient ตกแต่ง, glow หรือ ambient motion

## Architecture and Migration

### Source of truth

- `src/app/calm-lab.css` เป็น semantic token และ shared component foundation
- `src/app/globals.css` เก็บ layout/feature rules ที่ยังจำเป็น แต่ห้ามประกาศ token หรือ font source ซ้ำ
- `src/app/guide.css` เก็บเฉพาะ composition ของ guide/manual ที่ไม่ซ้ำกับ common primitives
- `src/app/layout.tsx` โหลด Sarabun local font และประกาศ CSS variable เดียว
- common components เช่น button, field group, status notice, action bar, protocol section และ media uploader ต้องรับ grammar จาก shared classes

ต้องถอด global `body * { font-family: ... !important; }` และ specificity override ที่ทำให้ component inheritance คาดเดาไม่ได้ โดยแทนด้วย root inheritance และ explicit exception เฉพาะ code/identifier

### Delivery slices

1. Font files, license, semantic tokens และ theme contract
2. Shared primitives และ state variants
3. App shell, dashboard และ navigation
4. Guide/manual และ protocol runner รวม step cards/pagination/media
5. Setup, forms, calculators และ preparation snapshots
6. Admin, knowledge, tables, audits และ remaining routes
7. Delete unreachable legacy typography/color rules หลัง route inventory ผ่าน

แต่ละ slice ต้อง build และทดสอบได้เอง ห้ามปล่อยหน้าใดอยู่ในสถานะที่ font หรือ token ครึ่งเก่าครึ่งใหม่

## Behavior and Data Preservation

- ไม่มีการเปลี่ยน route หรือ navigation destination
- ไม่มีการเปลี่ยน schema, repository, API, persistence หรือ calculation formula จากงาน visual นี้
- form name, validation rule, disabled condition และ save semantics เดิมต้องคงอยู่
- loading, empty, error, success, disabled, destructive และ unauthorized states ต้องได้รับ presentation ใหม่ครบ
- copy ทางวิทยาศาสตร์เปลี่ยนได้เฉพาะเพื่อแก้ hierarchy หรือความกำกวมที่ผู้ใช้อนุมัติแยกต่างหาก

## Verification

### Automated

- contract tests ยืนยัน Sarabun และห้ามอ้าง MN Chaeo Hon/Torsilp ใน runtime CSS/layout
- component tests ครอบคลุม anatomy และ accessible relationships ของ button, field, status, action bar และ media upload
- theme tests ยืนยัน semantic token ครบทั้ง Light/Dark
- regression tests รักษา route, validation, calculation และ persistence behavior
- lint, TypeScript, production build และ full test suite ต้องผ่าน

### Rendered browser verification

ตรวจอย่างน้อยที่ 1440px, 1024px, 768px, 390px และ 320px ใน Light/Dark:

- app shell/dashboard
- guide/manual step
- round protocol step ที่มี card ยาวและ photo evidence
- setup/form/calculator ที่มี hint, unit และ validation error
- table/audit surface
- modal/overlay และ destructive action

ตรวจ default, hover, keyboard focus, selected, disabled, loading, empty, error, success และ destructive states ตามที่ applicable รวมถึง:

- ไม่มี horizontal page overflow
- ไม่มีข้อความ สระ วรรณยุกต์ unit หรือ button label ซ้อน/ถูกตัด
- keyboard order และ visible focus ตรงกับ task order
- zoom 200% และข้อความ stress ยาวสองเท่ายังใช้งานได้
- reduced motion ไม่ซ่อน state change
- Light/Dark มี hierarchy และ contrast ที่เทียบเท่ากัน

## Acceptance Criteria

- ทุก route ใช้ Sarabun และ Botanical Atlas tokens โดยไม่มี Chaeo Hon/Torsilp runtime reference
- card ขั้นตอนแยก action, detail และ completion ได้ด้วยการกวาดสายตา
- primary CTA เด่นจาก canvas, card และ success state ในทั้งสองธีม
- production UI ไม่มีคำกำกับ variant ภาษาอังกฤษจาก mockup
- layout ผ่าน viewport, zoom และ Thai content-stress checks โดยไม่มี overlap หรือ clipping
- behavior, validation, calculations, persistence และ routes เดิมผ่าน regression tests
- automated suite, lint, build และ browser verification ผ่านด้วยหลักฐานสดก่อน merge/push implementation

## Non-goals

- เปลี่ยนสูตรหรือรับรองค่าทางวิทยาศาสตร์ใหม่
- เปลี่ยนข้อมูลทดลองหรือ migration schema
- เปลี่ยน product navigation architecture หรือ route structure
- เพิ่ม illustration, stock photography หรือ decorative animation
- สร้าง component library ภายนอกหรือเพิ่ม dependency เพียงเพื่อ styling

