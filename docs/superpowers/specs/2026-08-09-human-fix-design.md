# Human-First Protocol Repair Design

วันที่: 2026-08-09
สถานะ: ผู้ใช้อนุมัติทิศทาง 2026-08-09
ข้อกำหนดต้นทาง: `human_fix.md`

## เป้าหมาย

ทำให้ Plantlover Lab ใช้ได้โดยผู้ที่ไม่มีความรู้เพาะเลี้ยงเนื้อเยื่อมาก่อน โดยคำสั่งของแต่ละแขนงต้องไม่ขัดกัน ระบบต้องหยุดผู้ใช้เมื่ออุปกรณ์หรือหลักฐานไม่พร้อม และข้อมูลที่บันทึกต้องอธิบายได้ว่าผู้ใช้ทำอะไรจริง

งานแบ่งเป็นสามระยะที่ส่งมอบต่อเนื่อง:

1. P0 — ความปลอดภัยและความถูกต้องของ workflow
2. P1 — ความครบถ้วนของอุปกรณ์ สูตร และข้อมูลทดลอง
3. P2 — ภาษา ภาพประกอบ และประสบการณ์มือใหม่

## ข้อเท็จจริงจากการตรวจระบบปัจจุบัน

- เว็บ production ที่ทดสอบตาม `human_fix.md` เก่ากว่า local code
- commit `b0af609` แก้เลขขั้นของ Control-B ให้ใช้ตำแหน่งหลังกรองแล้ว แต่ Control-B ยังใช้เนื้อหาฟอกและวาง explant จากคู่มือเต็ม
- local baseline ณ วันออกแบบมี 125 test files ผ่าน, 568 tests ผ่าน, 4 files/10 tests skipped และ lint ผ่าน
- T3 ใช้แบนเนอร์ทับคำสั่ง Haiter เดิม จึงยังแสดงคำสั่งที่ขัดกัน
- T1/T2/T3 ยังได้รับ bracket table 150/300/450 จากคู่มือ Violin แม้ trial arm ถูกกำหนดไว้ที่ 300 ppm
- `StepRunner` บังคับ numeric fields แต่ยังไม่บังคับรูป และใช้ placeholder เดียวทุกขั้น
- equipment kit เก็บรายการอุปกรณ์แบบ boolean เป็นหลัก จึงอธิบาย 75% alcohol, Haiter 6% w/w, น้ำ 15 ppm ที่ไม่ sterile และ NaDCC เชิงพาณิชย์ไม่ได้ครบ

## ทิศทางผลิตภัณฑ์และภาพ

คงทิศทาง Cyber Greenhouse ที่ผู้ใช้เคยอนุมัติไว้ สี ฟอนต์ navigation และธีมไม่ถูกเปลี่ยนเป็น visual thesis ใหม่ งานนี้เปลี่ยนลำดับข้อมูล สถานะ และองค์ประกอบของ workflow เพื่อให้ทำงานได้จริง

Design thesis:

> พื้นที่ทำงานทีละขั้นสำหรับผู้เพาะเลี้ยงเนื้อเยื่อมือใหม่ จัดตามลำดับการตัดสินใจจริง ใช้ภาษาตรงไปตรงมาและสถานะความพร้อมที่มองเห็นได้ ภายใต้บรรยากาศ Cyber Greenhouse เดิม

กฎภาพประกอบ:

- ภาพสายพันธุ์จริงใช้รูปของผู้ใช้หรือแหล่งที่มีสิทธิ์ใช้งานชัดเจน
- ภาพที่สร้างด้วย generative image ใช้เฉพาะ diagram/ภาพสอน และต้องมีคำว่า “ภาพประกอบ ไม่ใช่ภาพตัวอย่างผลทดลองจริง”
- ห้ามใช้ภาพสร้างแทนหลักฐานทางวิชาการหรือหลักฐานว่าชิ้นพืชของผู้ใช้ทำสำเร็จ
- ภาพ anatomy ต้องชี้ส่วนที่ใช้จริง เช่น ข้อ ตาข้าง โคน ยอด รากอากาศ และด้านที่วางลงอาหาร
- ใช้ `next/image` กับ local raster assets และกำหนดขนาด/alt text เพื่อไม่ให้ layout กระโดด

## 1. Branch-specific protocol projection

### หลักการ

คู่มือพืชยังเป็นแหล่งข้อมูลกลาง แต่ trial runner ห้าม render ขั้น `sterilize` แบบเดียวกันแล้วใช้แบนเนอร์แก้ความหมายภายหลัง ระบบจะสร้าง “projected steps” ตามแขนงก่อนส่งให้ UI

เพิ่มโมดูลที่รับ:

- resolved manual
- trial arm role
- sterilization snapshot
- blank-control flag

และคืน step sequence ที่มี title, summary, materials, actions, pass criteria, stop conditions, measurements, note prompt, evidence requirement และ bracket design ที่ตรงกับแขนงนั้น

### Control-A

- Haiter/NaOCl เป็นการฟอกหลัก
- rinse ด้วยน้ำปลอดเชื้อธรรมดา
- ไม่มีคำสั่ง NaDCC
- ใช้แบบฟอร์มบันทึก active chlorine, เวลาฟอก, จำนวนรอบล้าง และ final sterile-water rinse

### Control-B

Control-B เป็น blank medium/container control ไม่ใช่ต้นไม้หนึ่งต้น จึงใช้ workflow เฉพาะ:

1. ตั้งรหัสกระปุกเปล่าคุม
2. เตรียมอาหารและจำนวนกระปุก
3. เตรียมพื้นที่/ภาชนะ
4. แบ่งอาหารและปิดฝาโดยไม่ใส่ explant
5. บ่มในสภาพเดียวกับชุดทดลอง
6. ตรวจการปนเปื้อนโดยไม่เปิดฝา
7. สรุปว่าแหล่งปนเปื้อนน่ามาจากอาหาร/ภาชนะหรือไม่

Control-B ต้องไม่มีคำว่าเลือกข้อ ตัดชิ้นพืช ฟอกชิ้นพืช วางชิ้นพืช ชิ้นยังเขียว หรือยอดเริ่มบวม

### T1

- ฟอกหลักด้วย Haiter ตาม baseline
- rinse เพิ่มด้วย NaClO 300 ppm ตามจำนวนรอบที่กำหนด
- final rinse ด้วยน้ำปลอดเชื้อ
- ไม่มี bracket 150/300/450 เพราะ arm นี้ล็อกที่ 300 ppm

### T2

- ฟอกหลักด้วย Haiter ตาม baseline
- rinse เพิ่มด้วย NaDCC 300 ppm
- final rinse ด้วยน้ำปลอดเชื้อ
- ไม่มี bracket 150/300/450
- แบบฟอร์มเก็บ NaDCC product, stock, actual ppm, rinse volume และจำนวนรอบ

### T3

- ไม่มีเนื้อหา Haiter/NaOCl หลงเหลือใน materials, actions, form หรือ troubleshooting ที่สื่อให้ใช้ Haiter
- แช่ NaDCC 300 ppm เป็นเวลา 24–48 ชั่วโมงตาม design ที่อนุมัติ
- ล้างด้วยน้ำปลอดเชื้อหลัง soak
- ไม่มี chlorinated rinse เพิ่ม
- แบบฟอร์มเก็บเวลาที่แช่เป็นชั่วโมง ไม่ใช่นาที
- UI แสดงระดับหลักฐานและคำเตือนว่าเป็นแขนงทดลองความเสี่ยงสูง

### Bracket design

Bracket 150/300/450 ยังคงใช้ได้ใน “รอบค้นหาช่วงความเข้มข้น” ที่ผู้ใช้เลือกโดยตรง แต่ต้องถูกถอดออกจาก fixed-arm trial T1/T2/T3 ทั้งหมด

## 2. T3 risk lock

### ค่าเริ่มต้น

- สร้าง T3 lot พร้อมชุดทดลองได้เพื่อให้เห็น design ทั้งชุดและอ่าน protocol ล่วงหน้า
- สถานะ T3 เริ่มเป็น `locked`
- หน้า trial overview แสดงเหตุผลที่ล็อกและเงื่อนไขปลดล็อก
- หน้า T3 อ่านได้ แต่ปุ่มบันทึกผ่านและการเริ่มจับเวลาถูกปิด

### ปลดล็อกอัตโนมัติ

T3 ปลดล็อกเมื่อ T1 และ T2 มีผลตรวจการปนเปื้อนครบ โดยทั้งสองแขนงต้องมี:

- ขั้นตรวจการปนเปื้อนถูกบันทึก
- จำนวนกระปุกทั้งหมด (`container-total`)
- จำนวนกระปุกไม่ติดเชื้อ (`container-clean`)
- จำนวนชิ้นที่ยังใช้ได้ (`container-usable`)
- วันที่สังเกต (`observed-at`)

### Override

ผู้ใช้ปลดล็อกก่อนเงื่อนไขได้เมื่อ:

- เปิดกล่องคำเตือน
- ทำเครื่องหมายยืนยันว่าเข้าใจว่าไม่มีงานตรงพันธุ์
- กรอกเหตุผลอย่างน้อย 20 ตัวอักษร
- ระบบบันทึกเวลา เหตุผล และชนิดการ override

โหมด demo อนุญาตให้ทดสอบหน้าจอ override แต่ติดป้าย `demo-only` และไม่ถูกนับเป็นผลทดลองจริง

## 3. Equipment readiness

### ข้อมูลที่ต้องเก็บ

ขยาย equipment profile ให้เก็บข้อมูลที่ตรวจสอบได้แทน boolean อย่างเดียว:

- alcohol: มีหรือไม่, เปอร์เซ็นต์, หน่วยบนฉลาก
- bleach: ยี่ห้อ, เปอร์เซ็นต์, basis (`w/w`, `w/v`, `available chlorine`, `unknown`)
- water: ppm, ผ่านการฆ่าเชื้อหรือไม่, วิธีฆ่าเชื้อ
- NaDCC: น้ำหนักเม็ด, NaDCC ต่อเม็ด, available chlorine, ประเภทสินค้า, batch และวันหมดอายุ
- vessels: จำนวน, ปริมาตร, วัสดุ, ทนความร้อนหรือไม่/ไม่ทราบ
- flame: แหล่งไฟ, มีเชื้อเพลิงหรือไม่, ใช้ในพื้นที่ใด
- workspace: SAB, ห้องพลาสติก หรืออื่น ๆ
- thermometer, pH meter, scale minimum และ measuring minimum

### Readiness result

resolver คืนค่าต่อ capability เป็น:

- `ready`
- `experimental`
- `blocked`
- `unknown`

พร้อมเหตุผลและสิ่งที่ต้องทำต่อ ระบบต้องไม่ตีความ “น้ำ 15 ppm” ว่าเป็นน้ำ sterile และต้องไม่ปฏิเสธ 75% alcohol เพียงเพราะ ID เดิมชื่อ `alcohol-70`; ให้ประเมินจากค่าความเข้มข้นจริง

### Trial gate

ก่อนสร้าง trial แสดง checklist สำหรับ:

- medium/container preparation
- sterile rinse water
- tool handling
- workspace safety
- plant-surface protocol
- measurement capability

ถ้ามี `blocked` ใน capability ที่จำเป็น ปุ่มเริ่มถูกปิดและลิงก์กลับไปหน้าอุปกรณ์ ถ้าเป็น `experimental` ผู้ใช้ต้องรับทราบก่อนเริ่ม

## 4. Step fields and data integrity

### Field model

เพิ่ม field schema แบบ discriminated union:

- number พร้อม unit/min/max/step
- select
- checkbox
- short text
- long text

ข้อมูลเดิมใน `measurements` ยังอ่านได้เพื่อรองรับรอบเก่า ข้อมูลใหม่เก็บใน `responses` และมี migration adapter รวมสองรูปแบบให้ UI

### หน่วย

เพิ่มหน่วยที่ใช้จริง ได้แก่ `mm`, `cm`, `ppm`, `hour`, `day` และ `boolean` แทนการใช้ `count` กับทุกอย่าง

### Required evidence

แต่ละขั้นประกาศ requirement ได้:

- ไม่มีรูปบังคับ
- อย่างน้อยหนึ่งรูป
- รูปพร้อม caption

ปุ่ม “บันทึกว่าผ่าน” ถูกปิดเมื่อ field หรือ evidence ไม่ครบ แต่ปุ่ม “ติดปัญหา” ยังใช้ได้

ใน demo mode ผู้ใช้ยังเปิด next step เพื่อทดสอบ UI ได้ แต่ระบบไม่สร้าง Passed record ปลอมและแสดงข้อความว่า “กำลังดูตัวอย่างขั้นต่อไป ยังไม่ได้ผ่านขั้นนี้”

### Contextual note prompt

แต่ละ step มี `noteLabel` และ `notePlaceholder` ของตัวเอง ไม่ใช้ข้อความหลังล้างกับทุกขั้น

## 5. NaDCC preparation record

สร้าง domain calculation ที่แยก:

- product mass
- NaDCC mass
- available chlorine fraction
- stock concentration
- target concentration
- final volume
- measuring resolution

ผลลัพธ์ต้องปัดตามอุปกรณ์ตวงจริงและแสดงค่าทฤษฎีกับค่าที่ตวงได้แยกกัน เช่น “คำนวณได้ 1.684 mL; อุปกรณ์ 0.1 mL จึงตวง 1.7 mL” พร้อม calculated actual ppm

ถ้า product เป็นเม็ดฟู่เชิงพาณิชย์:

- แสดงคำเตือนสารเติมแต่ง
- ไม่ใช้คำว่า NaDCC บริสุทธิ์ถ้าฉลากระบุเพียงส่วนประกอบต่อเม็ด
- บังคับยืนยันฉลากก่อนนำค่าไปสร้าง preparation record

## 6. Beginner step composition

ลำดับในหน้า step:

1. ตอนนี้กำลังทำอะไร
2. สถานะความพร้อมและสิ่งที่ยังขาด
3. เกณฑ์สำเร็จและเงื่อนไขหยุดแบบย่อ
4. ของที่ต้องเตรียม
5. ทำทีละข้อ
6. คำเตือนที่วางติดกับ action ที่เกี่ยวข้อง
7. บันทึกค่าที่ทำจริง
8. หลักฐานภาพ
9. ปัญหาและสิ่งที่ทำต่อ

ศัพท์อังกฤษใช้ชื่อไทยก่อนและมี inline glossary คงระบบ `RichText` เดิม ส่วน evidence note เชิงวิชาการอยู่ใน `<details>` เพื่อไม่แทรกกลางคำสั่งลงมือ

## 7. ภาพประกอบ

ตรวจภาพเดิมก่อนสร้างใหม่ ภาพขั้นต่ำที่ต้องมีสำหรับมือใหม่:

- node/axillary bud ของไม้เลื้อย
- ตำแหน่งตัดเหนือและใต้ตา
- ด้านโคนและด้านยอดตอนวาง explant
- blank control เทียบกับกระปุกที่มี explant
- ลักษณะรา แบคทีเรีย browning และ chlorine injury แบบ diagram
- ลำดับ Haiter rinse และ NaDCC soak ที่ไม่ใช้ภาพ/สีเดียวกันจนสับสน

ภาพ generated ต้องเก็บใน `public/illustrations/`, มีไฟล์ metadata ระบุ prompt, วันที่, วัตถุประสงค์ และคำเตือนว่าเป็นภาพประกอบ พร้อม alt text ภาษาไทย

## 8. Error, loading และ state behavior

- Trial creation แสดง loading และปิดปุ่มซ้ำ
- Repository error แสดงข้อความที่ช่วยแก้ ไม่ใช้เพียง “สร้างไม่สำเร็จ”
- Readiness loading ห้ามแสดงว่าพร้อมก่อนโหลด equipment เสร็จ
- Existing rounds ที่ไม่มี field/schema ใหม่ยังเปิดได้
- Locked T3, blocked readiness, missing evidence และ demo-only เป็น state แยกกัน ไม่ใช้ข้อความเตือนก้อนเดียว

## 9. Testing strategy

ใช้ TDD ทุก behavior change:

1. เขียน regression test ที่แสดงปัญหาเดิม
2. รันให้เห็น fail ด้วยเหตุผลที่คาด
3. แก้ production code ขั้นต่ำ
4. รัน targeted test ให้ผ่าน
5. รัน full suite ก่อนขยับระยะ

ชุดทดสอบหลัก:

- branch projection ไม่มีคำต้องห้ามในแต่ละ arm
- Control-B sequence และ copy ไม่มี explant language
- display number/route ต่อเนื่องทุก branch
- fixed arm ไม่มี bracket table
- T3 lock/unlock/override
- equipment resolver สำหรับ inventory ที่ผู้ใช้แจ้ง
- required fields และ required photo gate
- legacy step-run compatibility
- NaDCC rounding ตาม 0.1 mL
- generated/local image metadata และ alt text
- accessibility, keyboard, mobile overflow และ reduced motion

ตรวจ browser ที่อย่างน้อย:

- desktop 1440×900
- tablet 768×1024
- mobile 390×844 ซึ่งใกล้กับ Samsung S24 FE
- light/dark theme
- demo mode และ authenticated state ที่ทดสอบได้

## 10. Implementation decomposition

สเปกนี้เป็น umbrella design แต่การลงมือทำต้องแยกเป็นสามแผนและส่งมอบตามลำดับ เพื่อให้แต่ละช่วงตรวจสอบและย้อนกลับได้โดยไม่ลากการเปลี่ยนหลายระบบมาปนกัน:

1. `P0 — protocol integrity`: branch projection, Control-B, fixed-dose display, T3 evidence lock/override และ required evidence
2. `P1 — equipment and records`: inventory profile, readiness resolver, field schema, NaDCC calculation/rounding และ jar allocation
3. `P2 — beginner communication`: copy, glossary, instructional images, accessibility และ responsive polish

P1 เริ่มหลัง P0 ผ่าน targeted tests และ full suite; P2 เริ่มหลัง P1 ผ่านเงื่อนไขเดียวกัน แต่ละแผนต้องมีรายการไฟล์ คำสั่งทดสอบ และ browser scenario ของตัวเอง

## 11. Rollout และ compatibility

- ทำ data changes แบบ additive ก่อน ไม่ลบ field เดิม
- adapters อ่าน round เก่าได้
- trial ที่สร้างก่อนการแก้ต้องถูก project เป็น branch-specific UI จาก metadata เดิม
- เพิ่ม schema version สำหรับ equipment และ step responses
- deployment verification ต้องเทียบ commit SHA ของเว็บกับ local เพื่อไม่สรุปจาก deployment เก่าอีก

## สิ่งที่ไม่ทำ

- ไม่อ้างว่า protocol NaDCC ได้รับการยืนยันทางชีววิทยาจากการแก้ software
- ไม่สร้างภาพผลทดลองปลอม
- ไม่เปลี่ยนธีม Cyber Greenhouse เป็นทิศทางภาพใหม่
- ไม่ลบหรือเขียนทับรอบเก่า
- ไม่ deploy production จนกว่าการทดสอบ local และ browser จะผ่าน และผู้ใช้สั่งให้ deploy

## เกณฑ์สำเร็จ

- มือใหม่อ่านแต่ละหน้าแล้วไม่ต้องเลือกเองระหว่างคำสั่งที่ขัดกัน
- Control-B เป็น blank workflow จริง
- T1/T2/T3 แสดงเฉพาะ protocol ของตัวเอง
- T3 ถูกล็อกตามเงื่อนไขที่อนุมัติ
- inventory ของผู้ใช้ถูกอธิบายโดยระบบได้โดยไม่ทำให้ 75% alcohol หายหรือเปลี่ยนน้ำ 15 ppm เป็น sterile water
- ข้อมูลที่บันทึกย้อนตอบได้ว่าใช้สารใด ความเข้มข้นเท่าไร ปริมาตรเท่าไร เวลาเท่าไร และวัดด้วยอุปกรณ์ละเอียดเท่าไร
- required evidence ถูกบังคับจริง
- หน่วยและ placeholder ตรงบริบท
- ภาพ generated ทุกภาพติดป้ายว่าเป็นภาพประกอบ
- tests, lint, build และ browser verification ผ่านด้วยหลักฐานสด
