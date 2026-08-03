# เฟส 1: ระบบนำทางใหม่ + แยกเครื่องคำนวณออกมาเป็นเมนู

> วันที่ 3 สิงหาคม 2026 · นี่คือเฟส 1 ของงานปรับ UX/UI สองเฟส
> เฟส 2 (ปรับโทนสี/เงา/เส้นขอบทั้งระบบให้เป็นแนว organic & botanical) เป็นเอกสารแยกในอนาคต ไม่อยู่ในสโคปนี้

## 1 · ปัญหาที่แก้

ผู้ใช้รู้สึกว่าระบบ "แข็งกระด้าง" ทั้งสี่ด้าน: สไตล์ภาพ (เส้นขอบหนา เงาทึบ), โครงสร้างนำทาง
(ไม่มีเมนูเลย ต้องคลิกผ่านเนื้อหาเท่านั้น), การจัดวางเนื้อหา (คอลัมน์แคบ 760px), และโทนรวมของแบรนด์

ตรวจโค้ดพบว่า **ไม่มี nav bar อยู่จริง** — `GuideShell` มีแค่แถบหัวโชว์ชื่อแบรนด์กับปุ่มสลับธีม
ไม่มีลิงก์เมนูใด ๆ และ **เครื่องคำนวณสองในสามตัวไม่มี UI เรียกใช้เลย**
(`working-stock-calculator.ts` และ `haiter-calculations.ts` เป็นฟังก์ชันบริสุทธิ์ที่ทดสอบไว้
แต่ไม่มี component ไหนเรียกใช้) มีแค่ `MediumCalculator` ที่ฝังอยู่ในขั้น `prep-media` เท่านั้น

เฟส 1 นี้แก้สองเรื่อง: **(ก)** เพิ่มระบบนำทางที่ใช้งานได้จริง **(ข)** แยกเครื่องคำนวณทั้งสามตัว
ออกมาเป็นเมนูที่เปิดถึงได้จากทุกหน้า ไม่ต้องอยู่ในขั้นตอนที่เกี่ยวข้องเท่านั้น

โทนภาพของ**คอมโพเนนต์ใหม่**ในเฟสนี้ เริ่มนุ่มกว่าสไตล์เดิมทันที (ไม่รอเฟส 2) เพื่อเป็นเมล็ดพันธุ์
ของทิศทาง organic & botanical ที่จะ retrofit ทั้งระบบในเฟส 2

## 2 · สถาปัตยกรรม

คอมโพเนนต์ใหม่ทั้งหมดอยู่ในโฟลเดอร์ใหม่ แยกจาก `src/components/guide/` และ `src/components/rounds/` เดิม:

```
src/components/nav/
  primary-nav.tsx                  "use client" — เมนูหลัก responsive
  calculator-overlay-context.tsx   Context + Provider คุมสถานะเปิด/ปิดของ overlay

src/components/calculators/
  calculator-overlay.tsx           "use client" — modal/sheet ลอยทับ มี 4 หน้าจอย่อย
  working-stock-calculator.tsx     ฟอร์มใหม่ ครอบ calculateWorkingStock
  haiter-calculator.tsx            ฟอร์มใหม่ ครอบ calculateHaiterDose + planHaiterWorkingDilution
```

`medium-calculator.tsx` เดิม (ที่ `src/components/rounds/`) ถูกนำมาใช้ซ้ำใน overlay ไม่เขียนใหม่

`CalculatorOverlayProvider` ห่อไว้ใน `GuideShell` ครั้งเดียว (จุดเดียวกับที่มี `ThemeToggle` อยู่แล้ว)
`PrimaryNav` เรียก `useCalculatorOverlay().open()` เมื่อแตะเมนู "เครื่องคำนวณ" — ไม่ต้องส่ง prop
ลอดหลายชั้น และหน้า Server Component เดิมทั้งหมดไม่ต้องแก้

สโคปของงานนี้ครอบคลุมเฉพาะโซนสาธารณะ + โซนผู้ใช้ (ที่ใช้ `GuideShell` ร่วมกัน)
ไม่รวมโซนหลังบ้าน (`LabShell`/admin)

## 3 · ระบบนำทาง (`PrimaryNav`)

3 รายการเท่ากันทั้งมือถือและเดสก์ท็อป:

| รายการ | พฤติกรรม |
|---|---|
| หน้าแรก | ลิงก์ไป `/` |
| อุปกรณ์ของฉัน | ลิงก์ไป `/my/equipment` |
| เครื่องคำนวณ | เปิด `CalculatorOverlay` ไม่ลิงก์ไปหน้าไหน |

**มือถือ (<768px):** fixed bottom tab bar สูง ~64px มุมบนโค้งมน ไอคอน + label ใต้ไอคอน
เว้น safe-area สำหรับ iOS home indicator แท็บ active ใช้สีเน้น `--pl-leaf`

**เดสก์ท็อป (≥768px):** 3 รายการย้ายเข้าไปอยู่ในแถบบน (`pl-bar`) เดิม ต่อจากโลโก้ แนวนอน
ไม่มี bottom bar ซ้อน

Active state ใช้ `usePathname()` ยกเว้น "เครื่องคำนวณ" ที่ไม่มี route — highlight เฉพาะตอน
overlay เปิดอยู่จริง

## 4 · Calculator Overlay

โครงสร้างภายในเป็น 4 หน้าจอย่อยสลับกันในกล่องเดียว ไม่มีการเปลี่ยน route จริง:

```
picker (เริ่มต้น) ──เลือก──> medium | working-stock | haiter
   ▲                              │
   └──────────── ← กลับ ──────────┘
```

ปุ่ม `×` ปิด overlay ทั้งหมด อยู่ตรงหัวเสมอทุกหน้าจอย่อย

- **หน้า picker:** การ์ด 3 ใบ "สูตรอาหาร" / "น้ำยาแม่ (working stock)" / "ไฮเตอร์ฆ่าเชื้อ"
  แต่ละใบมีไอคอน + คำอธิบายสั้นว่าใช้ตอนไหน
- **ที่วาง (มือถือ):** bottom sheet เลื่อนขึ้นจากล่าง มุมบนโค้ง 24px สูงสุด 85vh
  เนื้อหาข้างในเลื่อนดูได้ ลาก handle บาร์ด้านบนเพื่อปิดได้ (เสริมจากปุ่ม ×)
- **ที่วาง (เดสก์ท็อป):** การ์ดกึ่งกลางจอ กว้างสุด 480px มุมโค้ง 20px มี backdrop เบลอจาง
  ด้านหลัง คลิก backdrop เพื่อปิด
- ปิดได้ 3 ทาง: ปุ่ม × / คลิก backdrop / กด Esc

### 4.1 สูตรอาหาร (ใช้ `MediumCalculator` เดิม)

ต่างจากตอนฝังในขั้น `prep-media` ตรงที่ใน overlay ไม่มีบริบทว่ากำลังดูพืชต้นไหน
เพิ่ม dropdown เลือกพืชก่อนหนึ่งช่อง (ดึง `MediaRecipe` จาก registry ทั้งหมด) แล้วแสดงฟอร์มเดิมต่อ
ตัวคำนวณเบื้องหลังไม่เปลี่ยน

### 4.2 Working Stock Calculator (ใหม่)

ครอบ `calculateWorkingStock` จาก `src/lib/domain/working-stock-calculator.ts`

ช่องกรอก: มวลที่ต้องการ (mg) · ความเข้มข้น stock เดิม (mg/mL) · ปริมาตรตวงต่ำสุดของเครื่องมือ (mL)
· ปริมาตร working solution ที่จะเตรียม (mL) — ดึงค่า pipette ต่ำสุดจาก equipment repository
มาใส่ล่วงหน้าถ้าล็อกอินอยู่ (เหมือนที่ `MediumCalculator` รับ `tools` prop) ถ้าไม่ล็อกอินใช้ค่ากลาง

ผลลัพธ์ตาม `WorkingStockResult.state`:
- `blocked` → การ์ดสีแดงอ่อน (`--pl-stop`) บอก `reason` + `safeAction`
- `direct` → ตัวเลขใหญ่ตวงตรง + รายการ `actions`
- `working-dilution` → แสดงอัตราส่วนเจือจาง (`1:${dilutionFactor}`) ความเข้มข้น working stock
  ที่ได้ และรายการ `actions` เป็นลำดับขั้น (pattern เดียวกับที่ `MediumCalculator` แสดงขั้นทำน้ำยาแม่)

### 4.3 Haiter / สารฟอกฆ่าเชื้อ (ใหม่)

ครอบ `calculateHaiterDose` และ `planHaiterWorkingDilution` จาก `src/lib/domain/haiter-calculations.ts`

สองโหมดสลับด้วยแท็บเล็กบนสุดของฟอร์ม (ไม่ต้อง back ออกไป picker):

1. **คำนวณตรง** (`calculateHaiterDose`) — กรอก % สารต้นทาง, % เป้าหมาย, ปริมาตรสุดท้าย (mL),
   ปริมาตรตวงต่ำสุด (mL) ถ้า `needsWorkingDilution === true` โชว์คำเตือนพร้อมปุ่ม
   "ไปทำ working dilution" สลับไปโหมด 2 พร้อมพา % ต้นทางที่กรอกไว้ติดไปด้วย
2. **Working dilution** (`planHaiterWorkingDilution`) — เพิ่มช่อง dilution factor แสดง % working
   ที่ได้ + ปริมาตร source/diluent ที่ต้องผสม + โดสสุดท้าย พร้อม flag `isMeasurable`

ทั้งสองฟังก์ชัน **throw Error** เมื่อ input ผิด (เช่น target ≥ source, ค่าไม่เป็นบวก)
ฟอร์มต้อง try/catch แล้วโชว์เป็นการ์ดเตือนแบบเดียวกับ `blocked` state ของ working stock
ห้ามปล่อยให้ error โผล่เป็นหน้าขาว/crash

## 5 · โทนภาพของคอมโพเนนต์ใหม่

องค์ประกอบใหม่ทั้งหมด (nav, overlay, การ์ด 2 ฟอร์มใหม่) ใช้ token ชุดใหม่ที่นุ่มกว่าเดิม
แทนการ hardcode `2.5px solid` + เงา offset ทึบตามที่การ์ดเดิมใช้:

```css
border: 1.5px solid var(--pl-line-soft);   /* บางลง จางลง แทน 2.5px ทึบ */
border-radius: 18px – 24px;                 /* โค้งมนขึ้นจาก 14px เดิม */
box-shadow: 0 8px 24px rgba(29, 26, 21, 0.12); /* เงานุ่ม blur แทน offset ทึบ */
```

เพิ่ม token ใหม่หนึ่งตัวคือ `--pl-line-soft` (เส้นขอบจางกว่า `--pl-line` เดิม) ใน `src/app/guide.css`
พร้อมค่าคู่ dark mode ของมัน สีหลักอื่นยังใช้ชุด `--pl-` เดิม (`--pl-leaf`/`--pl-agar` เด่นขึ้น
เพราะเป็นโทนเขียวธรรมชาติอยู่แล้ว เหมาะกับทิศทาง organic & botanical)

Token นี้เป็นจุดเริ่มที่เฟส 2 จะเอาไป retrofit การ์ดเก่าทั้งระบบทีหลัง ไม่ใช่ขอบเขตของเฟสนี้

## 6 · ชั้นข้อมูล และการจัดการ error

- ทุก calculator ใหม่เป็น client state ล้วน ไม่เขียนลง Firestore ไม่มี repository ใหม่
  ตรงกับหลักการเดิมของ `MediumCalculator`
- ถ้าล็อกอินอยู่ ดึงค่าเริ่มต้น (scale/pipette minimum) จาก equipment repository ครั้งเดียว
  ตอน overlay เปิด ถ้าไม่ล็อกอินใช้ค่ากลาง (fallback)
- ฟังก์ชันคำนวณที่ throw ต้องถูก catch ในฟอร์ม ไม่ปล่อยหลุดขึ้นไป error boundary ของ Next.js

## 7 · แนวทางเทสต์

ตามธรรมเนียมโปรเจกต์ (`renderToStaticMarkup` ไม่มี jsdom ไม่มี testing-library):

- ตรรกะสลับหน้าจอย่อยของ overlay (`picker` ↔ `medium`/`working-stock`/`haiter`) แยกเป็น
  ฟังก์ชันบริสุทธิ์ (เช่น reducer function) ทดสอบได้โดยไม่ต้องพึ่ง DOM
- ฟอร์มคำนวณใหม่ทั้งสองตัว เทสต์ด้วย snapshot ของ `renderToStaticMarkup` ผ่าน state ต่าง ๆ
  (blocked / direct / working-dilution สำหรับ working stock, สองโหมดของ haiter)
- พฤติกรรมคลิก/แตะจริง ที่จับด้วยเทสต์ไม่ได้ (open/close, bottom sheet drag, breakpoint switch)
  ตรวจด้วย `npm run ui:verify` ข้ามความกว้างจอ ตามข้อจำกัดที่ระบุไว้แล้วใน `project_summary.md` ส่วนที่ 10

## 8 · สิ่งที่ไม่อยู่ในสโคปเฟสนี้

- ปรับโทนสี/เงา/เส้นขอบของการ์ดและหน้าที่มีอยู่แล้วทั้งระบบ (เฟส 2)
- โซนหลังบ้าน (`LabShell`/admin) — ยังไม่มี bottom tab bar หรือ calculator overlay
- การจัดวางคอลัมน์กว้าง 760px คอลัมน์เดียว — ไม่แตะในเฟสนี้
- เมนู "รอบเพาะของฉัน" และ "โปรไฟล์" ใน nav — ผู้ใช้เลือกให้ nav หลักมีแค่ 3 รายการที่ระบุ
  ไม่รวมสองอันนี้ (ยังเข้าถึงได้ผ่าน `/my` เดิม)
