# Sterilization Profiles and Beginner UX Design

Date: 2026-07-25  
Status: Approved  
Scope: Guided Protocol workflow for Philodendron tissue culture

## 1. Objective

ปรับ Philodendron Lab ให้ผู้ใช้ที่ไม่เคยเพาะเลี้ยงเนื้อเยื่อมาก่อนสามารถเริ่มจากต้นไม้หนึ่งต้น เลือกวิธีฆ่าเชื้อที่ตรงกับอุปกรณ์ และทำงานตามลำดับที่ปลอดภัยโดยไม่ตัด explant ก่อนอาหารและพื้นที่ทำงานพร้อม

ระบบต้องแยกให้ชัดเจนระหว่าง:

- การฆ่าเชื้ออาหาร
- การฟอกฆ่าเชื้อผิว explant

การใช้ Haiter ในน้ำยาเตรียมอาหารไม่ได้แทนการฟอกผิว explant และการใช้หม้อนึ่งแรงดันก็ไม่ได้ยกเลิกขั้นตอนฟอกผิว explant

## 2. Approved Architecture

ใช้แนวทาง `Base Protocol + Sterilization Profile`

Base Protocol เก็บเนื้อหาที่ขึ้นกับชนิดพืชและวิธีเก็บ explant เช่น Pink Princess nodal culture หรือ Violin nodal culture ส่วน Sterilization Profile เก็บลำดับและกฎเฉพาะของการฆ่าเชื้ออาหาร

รองรับสอง profile ในรุ่นแรก:

1. `haiter-chemical`
2. `pressure-sterilization`

ไม่สร้าง Protocol ซ้ำทั้งฉบับสำหรับแต่ละวิธี และยังไม่ใช้ rule engine ทั่วไปในรุ่นนี้

## 3. First-Time User Journey

Wizard สำหรับมือใหม่:

1. เพิ่มต้นไม้
2. เลือกเป้าหมาย เช่น nodal culture หรือ shoot-tip culture
3. เลือกวิธีฆ่าเชื้ออาหาร
4. ตรวจอุปกรณ์และความพร้อม
5. สร้าง Experiment Lot

ผู้มีประสบการณ์สามารถข้าม Wizard ได้ แต่ต้องระบุข้อมูลขั้นต่ำที่จำเป็นก่อนสร้าง Lot

คำศัพท์ภายในที่ไม่จำเป็นต่อมือใหม่ เช่น Lot ID และ Protocol version ควรถูกสร้างให้อัตโนมัติหรือซ่อนอยู่ใน Advanced settings

## 4. Sterilization Method Selection

หน้าการเลือกวิธีต้องอธิบายจากอุปกรณ์ที่ผู้ใช้มี ไม่ใช่แสดงเพียงชื่อทางเทคนิค

### Haiter / sodium hypochlorite

- เหมาะกับ Home Lab ที่ไม่มีหม้อนึ่งแรงดัน
- ผู้ใช้กรอกค่า `% sodium hypochlorite` หรือ `% active chlorine` จากฉลาก
- ระบบคำนวณปริมาตรที่ต้องใช้ตามปริมาตรอาหารจริง
- ต้องแสดงสูตรคำนวณ ค่าที่ป้อน ผลลัพธ์ หน่วย และคำเตือน
- ห้ามสมมติว่าผลิตภัณฑ์ทุกยี่ห้อมีความเข้มข้นเท่ากัน
- Blank test เป็นคำแนะนำที่ข้ามได้ แต่ต้องบันทึกเหตุผล

### Pressure sterilization

- เหมาะกับผู้ใช้ที่มีอุปกรณ์ควบคุมอุณหภูมิ ความดัน และเวลา
- Profile แสดงขั้นตอนบรรจุภาชนะ ฆ่าเชื้อ ทำให้เย็น และตรวจสภาพอาหาร
- ค่าอุณหภูมิ ความดัน และเวลาต้องมาจาก Protocol version และหลักฐานที่อ้างอิง ไม่ hard-code เป็นมาตรฐานเดียวสำหรับทุกสูตร

## 5. Locked Lot Behavior

เมื่อสร้าง Lot แล้ว:

- บันทึก `sterilizationProfileId` และ snapshot ของ profile/version
- ล็อกวิธีฆ่าเชื้อเมื่อเริ่มทำขั้นตอนแรก
- ห้ามเปลี่ยนวิธีกลาง Lot
- หากต้องเปลี่ยน ให้สร้าง Lot ใหม่หรือ Protocol version ใหม่
- บันทึก audit event สำหรับการเลือก การล็อก และความพยายามเปลี่ยนวิธี

เหตุผลคือการเปลี่ยนวิธีกลางรอบทำให้ลำดับงาน หลักฐาน และความสามารถในการทำซ้ำของการทดลองไม่สอดคล้องกัน

## 6. Composed Step Order

Runner ประกอบลำดับจาก Base Protocol และ Sterilization Profile

### Common preparation

1. รับต้นและบันทึก baseline
2. ตรวจสุขภาพและกักต้นแม่
3. ยืนยันชนิดและเป้าหมายการทดลอง
4. ทำเครื่องหมายตำแหน่ง explant โดยยังไม่ตัด
5. ตรวจอุปกรณ์และวัสดุ

### Haiter branch

1. อ่านค่าความเข้มข้นบนฉลาก
2. คำนวณปริมาตร Haiter
3. เตรียมอาหารและเติมสารตาม profile
4. บรรจุภาชนะ
5. ทำ Blank test หรือบันทึกเหตุผลที่ข้าม
6. ตรวจอาหารและภาชนะ
7. เตรียมพื้นที่ปลอดเชื้อ

### Pressure branch

1. เตรียมอาหาร
2. บรรจุภาชนะ
3. ฆ่าเชื้อด้วยความดันตาม Protocol version
4. ทำให้เย็นและตรวจอาหาร
5. ทำ Blank test ตามข้อกำหนดของ Protocol
6. เตรียมพื้นที่ปลอดเชื้อ

### Readiness gate

ระบบยังไม่เปิดขั้นตัด explant จนกว่าจะยืนยันว่า:

- อาหารพร้อม
- ภาชนะพร้อม
- พื้นที่ทำงานพร้อม
- เครื่องมือพร้อม
- ผล Blank test ถูกบันทึก หรือมีเหตุผลที่ข้าม

### Explant and culture

1. เลือกตำแหน่งตัดจริง
2. ตัด explant
3. ล้างและฟอกฆ่าเชื้อผิว explant
4. ตัดแต่งในพื้นที่ปลอดเชื้อ
5. วาง explant ลงอาหาร
6. ตรวจ contamination และการตั้งตัว
7. ทำ establishment, multiplication, rooting และ acclimatization ตาม Base Protocol

## 7. Beginner Runner UX

Runner ต้องแสดงเพียงขั้นปัจจุบันเป็นหลัก และสรุปขั้นถัดไป ไม่เปิดรายละเอียดทุกขั้นพร้อมกัน

ทุกขั้นต้องตอบเจ็ดคำถาม:

1. ทำอะไร
2. ทำไปเพื่ออะไร
3. ต้องเตรียมอะไร
4. ทำอย่างไร
5. ต้องตรวจและบันทึกอะไร
6. ผลผ่านและไม่ผ่านเป็นอย่างไร
7. ผ่านแล้วไปไหน ไม่ผ่านแล้วทำอะไร

สถานะที่ผู้ใช้เห็นเป็นภาษาไทย:

- ผ่าน
- ต้องตรวจเพิ่ม
- ไม่ผ่าน
- ยังไม่เริ่ม

คำว่า `Verified`, `Adapted`, `Experimental` และ `Pending review` ยังคงแสดงเป็น evidence labels พร้อมคำอธิบายภาษาไทย

คำเตือนก่อน readiness gate ต้องใช้ข้อความชัดเจน:

> อย่าเพิ่งตัดต้นไม้ — ตัดเมื่ออาหารผ่านการตรวจและพื้นที่ปลอดเชื้อพร้อมแล้วเท่านั้น

## 8. Visual and Accessibility Contract

ใช้ visual direction เดิมของ Gridgeist:

- technical, calm, evidence-led
- grid และเส้นแบ่งช่วยจัดโครงสร้าง
- ไม่ใช้ generic SaaS card wall

การทดสอบภาพจำลองทำให้เพิ่มข้อกำหนด:

- ใช้ข้อความสีเข้มบนพื้นอ่อน
- ข้อความรองต้องไม่ใช้สีเทาอ่อนจนกลืนกับพื้น
- เส้นแบ่งและขอบ input ต้องมองเห็นชัด
- สถานะต้องมีทั้งข้อความ ไอคอน และรูปทรง ไม่พึ่งสีอย่างเดียว
- focus ring ต้องมี contrast ชัดเจน
- คำเตือนใช้พื้นและกรอบที่ต่างจากเนื้อหาปกติ
- รองรับข้อความไทยยาวโดยไม่ล้น
- mobile แสดง progress ด้านบนและเรียงเนื้อหาแนวตั้ง

## 9. Proposed Domain Model

```ts
type SterilizationMethod =
  | "haiter-chemical"
  | "pressure-sterilization";

interface SterilizationProfile {
  id: string;
  title: string;
  method: SterilizationMethod;
  version: string;
  evidenceState: EvidenceState;
  referenceIds: string[];
  equipmentRequirements: EquipmentRequirement[];
  steps: ProtocolStep[];
  calculation?: SterilizationCalculationDefinition;
  blankPolicy: "required" | "recommended-skippable" | "optional";
  publishedAt?: string;
}

interface LotSterilizationSnapshot {
  profileId: string;
  profileVersion: string;
  method: SterilizationMethod;
  lockedAt?: string;
  activeChlorinePercent?: number;
  mediumVolumeMl?: number;
  calculatedDoseMl?: number;
  blankDecision?: "completed" | "skipped";
  blankSkipReason?: string;
}
```

Experiment Lot ต้องเก็บ snapshot ไม่อ้างอิงเฉพาะ profile ปัจจุบัน เพื่อให้ประวัติยังทำซ้ำได้หลัง profile มี version ใหม่

## 10. Calculation Safety

ตัวคำนวณ Haiter ต้อง:

- รับค่าความเข้มข้นที่มากกว่า 0
- ตรวจช่วงที่สมเหตุผลและเตือนค่าผิดปกติ
- รับปริมาตรอาหารเป็น mL
- แสดงความละเอียดที่เหมาะกับเครื่องมือวัด
- หากปริมาตรน้อยกว่าความสามารถของอุปกรณ์ ให้เสนอการทำ working dilution
- แสดงสูตร `C1V1 = C2V2`
- ไม่บันทึก `undefined` ลง Firestore
- เก็บค่าที่ผู้ใช้ป้อนและค่าที่ระบบคำนวณใน audit

ผลการคำนวณเป็นเครื่องมือช่วยปฏิบัติ ไม่เปลี่ยน evidence state ของสูตร และไม่ควรเรียกค่าประยุกต์ว่า Verified

## 11. Error and Recovery States

ต้องมีข้อความเฉพาะกรณี:

- ไม่มี Sterilization Profile ที่ publish แล้ว
- Profile version ถูกถอนหรือหาไม่พบ
- ค่า active chlorine ไม่ถูกต้อง
- ไม่สามารถคำนวณด้วยเครื่องมือที่ผู้ใช้มี
- ยังไม่ผ่าน readiness gate
- พยายามเปลี่ยนวิธีของ Lot ที่ล็อกแล้ว
- ข้อมูล Lot รุ่นเก่าไม่มี sterilization method

Lot รุ่นเก่าใช้สถานะ migration-required และให้ผู้ใช้เลือก profile ก่อนทำขั้นต่อไป โดยไม่แก้ประวัติที่เกิดขึ้นแล้ว

## 12. Verification

เพิ่ม automated tests สำหรับ:

- Wizard มือใหม่ครบห้าขั้น
- ผู้มีประสบการณ์ข้าม Wizard แต่ยังผ่าน validation
- การประกอบขั้นตอน Haiter และ pressure ถูกลำดับ
- readiness gate ปิดขั้นตัด explant
- Blank test ข้ามได้เฉพาะเมื่อมีเหตุผล
- Lot ล็อกวิธีหลังเริ่ม
- snapshot ไม่เปลี่ยนตาม profile รุ่นใหม่
- การคำนวณ Haiter และ working dilution
- validation ของหน่วยและค่าผิดปกติ
- migration ของ Lot รุ่นเก่า
- contrast/focus semantics และ keyboard navigation
- responsive 390px, 1024px และ 1440px
- long Thai text และ reduced motion
- Firestore rules และ emulator flow

ก่อนส่งงานต้องผ่าน:

- `npm test`
- `npm run lint`
- `npm run build`
- `npm run firebase:verify`
- Firebase emulator/sandbox
- browser verification ของ Wizard และ Runner

## 13. Out of Scope

- การใช้ image processing เพื่อเลือก Sterilization Profile
- การเปลี่ยนวิธีกลาง Lot
- rule engine ทั่วไปสำหรับทุกวงศ์พืช
- การรับรองสูตรที่ยังไม่มีหลักฐานตรงให้เป็น Verified

## 14. Approved Decisions

- ใช้ Base Protocol + Sterilization Profile
- รองรับ Haiter และ pressure sterilization
- Blank test ของ Haiter แนะนำเสมอแต่ข้ามได้พร้อมเหตุผล
- ล็อกวิธีต่อ Lot
- ใช้ Wizard สำหรับมือใหม่
- Haiter รับค่า active chlorine จากฉลาก
- เตรียมอาหารและพื้นที่ให้พร้อมก่อนตัด explant
- ใช้ visual direction คอนทราสต์สูงที่ผู้ใช้ตรวจแล้ว

