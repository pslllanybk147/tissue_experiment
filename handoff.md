ต้องมีการบันทึกทุกครั้งที่งานจบ

# Philodendron Lab — Handoff

## 2026-07-27 — Beginner-Complete Protocol Standard

- ล็อกหลักการว่า Protocol พร้อมใช้ต้องสอนผู้ไม่มีพื้นฐานซึ่งทำงานคนเดียวได้ ระบบห้ามใช้ “ถามผู้มีประสบการณ์”, “ถามผู้เชี่ยวชาญ” หรือ “ถามที่ปรึกษา” เป็นทางแก้
- ขยาย domain ของแต่ละขั้นให้รองรับจำนวน/ขนาด/ช่วงวัด/ของทดแทนของวัสดุ, glossary มือใหม่, ภาพหรือแผนภาพพร้อมป้ายกำกับ และ self-check เฉพาะกรณี `ฉันหาไม่เจอ`, `ฉันไม่แน่ใจ`, `ฉันไม่มีอุปกรณ์นี้`
- เพิ่ม Protocol completeness validator ก่อน publish/activate:
  - ตรวจ objective, rationale, prerequisites, materials, expected result, pass/fail, next actions และ evidence
  - ขั้น `Verified` ต้องมี reference
  - ขั้นต้องมีคู่มือมือใหม่ ภาพ/แผนภาพ คำศัพท์ และ self-check ครบ
  - พบข้อความผลักภาระให้บุคคลภายนอกแล้ว publish ไม่ได้
- Protocol เก่าหรือร่างที่ไม่ครบยังเปิดดูประวัติได้ แต่หน้า detail แสดง `คู่มือยังไม่สมบูรณ์`; version ดังกล่าวไม่ถูกเสนอให้เริ่ม Lot ใหม่ และ Published version ยังคง immutable
- เพิ่ม editor สำหรับสร้าง/ปรับโครงขั้น Beginner-Complete และแสดงสาเหตุที่ยัง publish ไม่ได้
- แก้การแสดงอุปกรณ์ของ Lot เก่าที่ข้อมูลยังไม่ครบ: ระบบเติมรายละเอียดที่รู้จักตามชื่ออุปกรณ์ เช่น กล้อง = 1 เครื่อง, ป้าย = อย่างน้อย 1 ป้ายต่อชิ้น/ภาชนะ และแบบบันทึก = 1 ชุดต่อ Lot แทนข้อความกำกวม “ตามจำนวนที่วิธีทำระบุ”
- แสดงอุปกรณ์เป็นหัวข้อ `เตรียม`, `ต้องเป็นแบบนี้` และ `ใช้แทนได้เฉพาะ`; หากห้ามทดแทนจะแจ้งตรง ๆ และ validator บังคับให้ Protocol ใหม่ระบุจำนวน คุณสมบัติ และนโยบายของทดแทนทุกชิ้นก่อน publish
- แก้ dead end ในขั้นเตรียมอาหาร: Guided Runner แสดงปุ่ม `เปิดสูตรอาหารและเครื่องคำนวณ` และเชื่อมตรงไปยัง anchor `#media-recipes` ของ Pink Princess/Violin ตาม taxon หรือ Protocol ของ Lot ปัจจุบัน เปิดในแท็บใหม่เพื่อไม่ทำสถานะขั้นตอนหาย
- รองรับ Lot เดิมที่ไม่มี `taxonId` และมี `protocolId` แบบ UUID โดยอนุมานปลายทางจาก `protocolTitle` เฉพาะชื่อ Pink Princess/Violin; หากยังระบุไม่ได้จึงกลับไปหน้าคลังความรู้รวม
- UI matrix บังคับตรวจว่าขั้นเตรียมอาหารมีลิงก์สูตรจริงและ href ชี้ไป `#media-recipes`; ห้ามมีเพียงคำสั่ง “เปิดสูตร” โดยไม่มีปลายทางอีก
- เปลี่ยนข้อความผลลัพธ์จาก `ต้องตรวจเพิ่ม` เป็น `ต้องตรวจซ้ำ`
- เพิ่มเครื่องคำนวณอาหารจากจำนวน explant, กระปุกเพาะ, Blank, กระปุกสำรอง, mL ต่อกระปุก และเปอร์เซ็นต์เผื่อสูญเสีย; ค่าเริ่มต้นให้เตรียม 110 mL สำหรับ 4 กระปุก
- Working dilution แสดงคำสั่งตวง–เติม–ผสมเป็นตัวเลขจริง ไม่ใช้ `C1V1=C2V2` เป็นคำสั่งหลัก และบล็อกเมื่ออุปกรณ์วัดไม่ถึง
- เพิ่มภาพจำลอง workflow ทั่วไปและภาพเปรียบเทียบ contamination เพื่อให้ทุกขั้นมี visual aid ที่ระบบมีสิทธิ์ใช้
- ปรับ Guided Runner ให้ self-check เปิดในหน้าเดิม พร้อม checklist และวิธีกลับมาปลดล็อกขั้นตอนโดยไม่ต้องพึ่งบุคคลภายนอก
- Verification รอบนี้:
  - `npm test`: ผ่าน 231 tests, skip 10
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `npm run firebase:verify`: ผ่าน 241 tests บน Auth/Firestore emulator
  - `npm run ui:verify`: ผ่าน 14 viewport ที่ 360, 375, 390, 412, 428, 600, 744, 768, 820, 834, 1024, 1280, 1440 และ 1920 px
  - UI sandbox ตรวจ route หลัก/หน้า detail/editor/Wizard/Guided Runner, keyboard, reduced motion, horizontal overflow, touch target, Thai text, reference visual, working dilution, self-check และห้ามข้อความส่งต่อให้ผู้เชี่ยวชาญ
  - ตรวจภาพ audit ด้วยตาที่ iPhone SE และ iPad 9; mobile/tablet ใช้ hamburger และ step drawer โดยเนื้อหาคู่มือไม่ถูกบีบ

## 2026-07-27 — แก้การเปลี่ยนขั้น/โหมดแล้วหน้าค้างด้านล่าง

- สาเหตุ: ปุ่มท้ายคู่มือยังครอง focus หลังสลับจาก `อ่านคู่มือ` ไป `บันทึกผลขั้นนี้` เบราว์เซอร์จึงรักษาตำแหน่งปุ่มไว้และดูเหมือนหน้าเด้งลงล่าง
- เพิ่ม `focusStepTop()` เป็นเส้นทางกลางสำหรับ:
  - อ่านจบแล้วไปบันทึกผล
  - สลับแท็บอ่านคู่มือ/บันทึกผล
  - ย้อนกลับไปอ่านคู่มือ
  - ไปขั้นก่อนหน้า/ขั้นถัดไป
  - เลือกขั้นจากรายการ
- หลังเปลี่ยน state ระบบรอ render สอง frame จากนั้นย้าย focus ไป `.guided-step-content` และ `scrollIntoView({ block: "start" })`
- รองรับ `prefers-reduced-motion` โดยใช้การเลื่อนแบบ `auto`
- เพิ่ม UI assertion ให้กดปุ่มท้ายคู่มือจริง แล้วตรวจว่าหัวขั้นตอนกลับมาอยู่ภายใน 180 px จากด้านบน
- แก้ข้อความขั้นเลือก explant ให้ชัดว่า 1 explant ไม่ได้แปลว่า 1 กระปุก: แนะนำกระปุกเพาะ 1, Blank control 1 และสำรอง 1–2
- ผลตรวจ:
  - `npm test`: ผ่าน 227 tests
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `npm run firebase:verify`: ผ่าน 237 tests ใน Auth/Firestore emulator
  - `npm run ui:verify`: ผ่าน 14 widths ตั้งแต่ 360–1920 px รวมการกดปุ่มท้ายคู่มือและตรวจตำแหน่ง scroll

## 2026-07-26 — เชื่อมภาพอ้างอิงเข้ากับ Guided Protocol

- เพิ่ม `ProtocolVisualAid` ใน domain model เพื่อให้ภาพประกอบเป็นข้อมูลของแต่ละขั้น ไม่ใช่ภาพที่ฝังไว้เฉพาะหน้า Knowledge
- เพิ่มคอมโพเนนต์กลาง `ProtocolReferenceVisual` และแสดงในโหมด `1. อ่านคู่มือ` ใต้หัวข้อ `ภาพประกอบของขั้นนี้`
- เชื่อมภาพจำลองข้อ–ตาข้าง–แนวตัดเข้ากับขั้น:
  - เลือกยอด/ข้อ/ตาข้าง
  - ตัดและเตรียม explant
- เชื่อมภาพจำลองการวาง explant ลงอาหารเข้ากับขั้น `ตัดแต่งและลงอาหารระยะเริ่มต้น`
- ภาพทุกภาพต้องระบุว่าเป็น `ภาพจำลอง ไม่ใช่ภาพต้นจริง` แสดง evidence state และแหล่งอ้างอิงเมื่อมี
- ใช้ภาพวาดต้นฉบับของระบบ ไม่คัดลอกภาพจาก `PLANTS IN JARS PROTOCOL LIBARARY v2 (1).pdf` เนื่องจากเอกสารมีข้อจำกัดการทำซ้ำ
- แหล่งอ้างอิงภาพ node/shoot culture ที่เชื่อมในระบบ: University of Florida IFAS
- เพิ่ม automated test ป้องกันภาพหลุดจากขั้น explant/placement และเพิ่ม `ui:verify` ให้ตรวจว่าภาพปรากฏจริงใน Guided Runner
- ผลตรวจ:
  - `npm test`: ผ่าน 227 tests (ส่วนที่ไม่ใช้ emulator) และ 237 tests ใน emulator
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `npm run firebase:verify`: ผ่าน Auth + Firestore emulator
  - `npm run ui:verify`: ผ่าน 14 widths ตั้งแต่ 360–1920 px
  - ตรวจภาพ render จริงจาก `iphone-se-guided-reference-image.png` และ `ipad-9-guided-reference-image.png`: ไม่มีข้อความ/ภาพล้นกรอบ

## Project purpose

เว็บพื้นที่วิจัยสำหรับจัดการ Protocol, Experiment Lots, งานวิจัย และรูปภาพของโครงการเพาะเลี้ยงเนื้อเยื่อ Philodendron ด่าง โดยใช้แนวทาง visual จาก Gridgeist และออกแบบให้รองรับ desktop/mobile ในระบบเดียวกัน

## Current status

### Approved design awaiting implementation plan — 2026-07-25

- อนุมัติสถาปัตยกรรม `Base Protocol + Sterilization Profile`
- รองรับการฆ่าเชื้ออาหารสองแบบ: `haiter-chemical` และ `pressure-sterilization`
- ล็อกวิธีฆ่าเชื้อต่อ Experiment Lot; หากต้องการเปลี่ยนให้สร้าง Lot หรือ Protocol version ใหม่
- Haiter รับค่า `% sodium hypochlorite / active chlorine` จากฉลากและคำนวณปริมาตร
- Blank test สำหรับ Haiter เป็นคำแนะนำที่ข้ามได้เมื่อบันทึกเหตุผล
- เพิ่ม readiness gate: ห้ามเปิดขั้นตัด explant ก่อนอาหาร ภาชนะ เครื่องมือ และพื้นที่พร้อม
- อนุมัติ Beginner Wizard: เพิ่มต้นไม้ → เลือกเป้าหมาย → เลือกวิธีฆ่าเชื้อ → ตรวจอุปกรณ์ → สร้าง Lot
- ตรวจ visual mockup แล้วและกำหนดให้เพิ่ม contrast ของข้อความรอง เส้นแบ่ง สถานะ และ focus
- Design spec: `docs/superpowers/specs/2026-07-25-sterilization-profiles-beginner-ux-design.md`
- ขั้นถัดไป: สร้าง implementation plan แบบ TDD แล้วจึงเริ่มแก้โค้ด

### Completed

- สร้าง Next.js App Router + TypeScript project ที่ `philodendron-lab/`
- ใช้ Next.js 16.2.11, React 19.2.4 และ Tailwind CSS 4
- สร้าง Research Lab dashboard แบบ responsive
- เพิ่ม desktop sidebar และ mobile top bar
- เพิ่มหน้าแนวคิด Protocol/Experiment/Research workflow ใน dashboard เดียว
- เพิ่มข้อมูล mock ที่อิงจากงานวิจัยใน `D:\เนื้อเยื่อ`
- เพิ่ม interactive states:
  - เปลี่ยน navigation
  - เลือก experiment lot
  - เลือก protocol step
  - บันทึก step แบบ mock
  - เปิด modal สร้าง lot แบบ mock
  - เพิ่ม observation/photo action แบบ mock
- เพิ่ม evidence labels: Verified, Adapted, Experimental, Pending review
- เพิ่ม reduced-motion CSS และ responsive breakpoint สำหรับ mobile
- ตั้ง metadata และภาษาเอกสารเป็นไทย
- เพิ่มกติกา pre-delivery sandbox verification: ต้องรันระบบจริงใน local emulator และตรวจ desktop/mobile ก่อนส่งงานทุกครั้ง

## Important architecture decisions

- Gridgeist เป็น design/process skill ไม่ใช่ runtime component dependency
- Firebase/Firestore และ Cloudinary ยังไม่ได้เชื่อมต่อในรอบนี้
- Dashboard ใช้ mock data เพื่อให้ตรวจ visual workflow ได้ก่อน
- ข้อมูล live ควรเชื่อม Firestore ใน phase ถัดไป
- รูปภาพควรอัปโหลดไป Cloudinary แล้วเก็บ metadata ใน Firestore
- AI research ingestion ต้องเป็น draft-and-review ไม่ publish อัตโนมัติ

## Files changed in this session

- `src/app/page.tsx` — dashboard UI และ interactions
- `src/app/globals.css` — Gridgeist-inspired visual system, responsive layout, states
- `src/app/layout.tsx` — metadata, Geist font variables, Thai document language
- `handoff.md` — session handoff and continuation record

## Next session: exact order

1. Run `npm run lint` and `npm run build`.
2. Start the app with `npm run dev` and inspect at desktop and mobile widths.
3. Run Gridgeist review against the rendered dashboard; record findings before editing.
4. Add Firebase client initialization lazily; do not initialize SDKs at module scope when environment variables are missing.
5. Add Firebase Auth protected route and owner-only access.
6. Replace mock lots/plants/protocols with typed Firestore repositories.
7. Add Cloudinary signed upload route and media metadata collection.
8. Add real Protocol detail route and Experiment detail route.
9. Add Playwright checks for 1440px, 1024px, 390px, keyboard focus, Thai overflow, modal, and reduced motion.
10. Update this file immediately when the session ends.

## Required handoff rule

เมื่อทำงานจบแต่ละ session ต้องเพิ่มในไฟล์นี้:

- วันที่และเวลาจบงาน
- สิ่งที่ทำเสร็จ
- ไฟล์ที่เปลี่ยน
- คำสั่งตรวจสอบที่รันและผลลัพธ์
- ปัญหาที่ยังเหลือ
- ขั้นตอนถัดไปที่ทำได้ทันที

## Required pre-delivery verification

ก่อนส่งงานทุกครั้งต้อง:

1. รัน `npm run lint`
2. รัน `npm run build`
3. เปิด local sandbox ที่ `http://localhost:3000`
4. ตรวจ desktop 1440px และ mobile 390px
5. ตรวจ navigation, modal, lot selection, step completion และ responsive overflow
6. บันทึกผลตรวจใน handoff นี้ก่อนสรุปส่งงาน

## Known limitations

- ยังไม่มี Firebase Auth, Firestore, Cloudinary หรือ Vercel configuration
- ปุ่มสร้าง Lot และบันทึก observation ยังเป็น mock action
- ยังไม่มี route แยกสำหรับ Protocol, Experiment และ Research
- ยังไม่มี automated tests
- ยังไม่มี real image assets
- ต้องตรวจ Thai font fallback ใน browser จริง

## Session close record — 2026-07-22

### Completed this session

- สร้าง frontend MVP สำหรับ Philodendron Lab ด้วย Next.js App Router และ TypeScript
- ใช้ visual direction ที่ยึดหลักจาก Gridgeist repository: evidence-led research workspace, visible grid alignment, restrained cards, dense but readable metadata และ responsive behavior
- ทำ desktop และ mobile ในระบบเดียวกัน โดย desktop ใช้ persistent sidebar และ mobile ใช้ compact top bar
- เพิ่ม mock workflow สำหรับ dashboard, protocol step, experiment lot, research review, evidence state และ create-lot modal
- เพิ่ม `handoff.md` พร้อมข้อกำหนดให้บันทึกทุกครั้งที่งานจบ

### Verification performed before delivery

คำสั่งที่รัน:

- `npm run lint` — ผ่าน ไม่มี warning/error
- `npm run build` — ผ่าน; Next.js compile, typecheck และ static route generation สำเร็จ
- เปิด local sandbox emulator ที่ `http://localhost:3000` — โหลดหน้า dashboard สำเร็จและ server ไม่มี error ใน stderr

ผลตรวจ sandbox emulator:

- Desktop `1440×900` — ไม่มี horizontal overflow; sidebar แสดงผล
- Tablet `1024×900` — ไม่มี horizontal overflow; sidebar แสดงผล
- Mobile `390×844` — ไม่มี horizontal overflow; sidebar ถูกซ่อนและ mobile brand/top treatment ทำงาน
- New experiment — เปิด dialog `Start an experiment` ได้ และปิดด้วย `Close` ได้
- Lot selection — เลือก `VIO-001` แล้ว selected lot เปลี่ยนจริง
- Step completion — กด `Complete step` แล้วแสดง status `บันทึกขั้นตอน 04 แล้ว`
- Thai text — dashboard แสดงข้อความภาษาไทยและ metadata ยาวโดยไม่ล้น viewport จากการตรวจ responsive DOM
- Reduced motion — CSS มี media query `prefers-reduced-motion: reduce`

### Files changed

- `src/app/page.tsx`
- `src/app/globals.css`
- `src/app/layout.tsx`
- `handoff.md`

### Remaining issues

- ยังเป็น mock data; ยังไม่เชื่อม Firebase Auth/Firestore, Cloudinary, GitHub export หรือ Vercel environment
- ยังไม่มี automated Playwright test files; sandbox check รอบนี้เป็น runtime interaction verification
- ยังไม่ได้ทำ Gridgeist formal review เนื่องจาก Gridgeist plugin ยังไม่ได้ติดตั้งใน Codex session นี้ จึงใช้ repository guidance และ design principles เป็นแนวทางแทน
- ต้องแบ่ง dashboard เป็น route จริงสำหรับ Protocol, Experiment และ Research review ใน phase ถัดไป

### Immediate next steps

1. สร้าง typed domain model และ repository interface สำหรับ Firestore
2. เชื่อม Firebase Auth พร้อม protected route และ owner-only write access
3. แยกหน้า `/protocols`, `/experiments`, `/research` จาก dashboard
4. เพิ่ม Playwright test suite และตรวจ keyboard focus จริง
5. ติดตั้ง/เรียกใช้ Gridgeist formal review เมื่อ plugin พร้อมใช้งาน
6. ก่อน session ถัดไปจบ ต้องรัน lint, build และ sandbox emulator ซ้ำ พร้อมบันทึกผลในไฟล์นี้

## Session close record — 2026-07-22 (Firebase foundation)

### Completed this session

- ทำงานบน branch `feature/firebase-foundation` โดยรักษางาน MVP เดิมที่ยังไม่ commit ไว้ครบ
- เพิ่ม Firebase SDK แบบ lazy initialization; ถ้า environment variables ไม่ครบจะไม่ initialize SDK และแสดงหน้า setup/demo แทน
- เพิ่ม Firebase Authentication ผ่าน Google popup, auth session state, protected content gate, sign-out และ demo mode
- เพิ่มปุ่ม sign-out ใน mobile top bar เพื่อให้ mobile session ออกจากระบบได้แม้ sidebar ถูกซ่อน
- เพิ่ม typed domain models และ repository interface สำหรับ protocols, lots และ research sources
- เพิ่ม demo repository และ Firestore repository ที่อ่าน/เขียนข้อมูลใต้ `users/{uid}` เท่านั้น
- เพิ่ม owner-scoped seed data เมื่อบัญชียังไม่มี protocol และเพิ่มการบันทึก protocol step ลง Firestore
- เพิ่ม Firestore security rules: ผู้ใช้ที่ล็อกอินอ่าน/เขียนได้เฉพาะ document tree ของ UID ตัวเอง; root collection อื่นถูกปฏิเสธ
- เพิ่ม Firebase Emulator configuration สำหรับ Auth `9099`, Firestore `8080` และ Emulator UI `4000`
- เพิ่ม `.env.example`, `.firebaserc.example`, Firestore indexes และคำแนะนำ setup ใน `README.md`
- เพิ่ม Vitest และ unit tests สำหรับ Firebase config, demo repository และ auth session reducer
- แก้ mobile authentication workflow จากผลตรวจ sandbox จริง

### Files added or changed

- `.env.example`
- `.firebaserc.example`
- `.gitignore`
- `README.md`
- `package.json`
- `package-lock.json`
- `firebase.json`
- `firestore.rules`
- `firestore.indexes.json`
- `docs/superpowers/plans/2026-07-22-firebase-foundation.md`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`
- `src/components/auth/auth-provider.tsx`
- `src/components/auth/auth-gate.tsx`
- `src/components/auth/auth-session.ts`
- `src/components/auth/auth-session.test.ts`
- `src/lib/domain/models.ts`
- `src/lib/firebase/client.ts`
- `src/lib/firebase/config.ts`
- `src/lib/firebase/config.test.ts`
- `src/lib/firebase/firestore-lab-repository.ts`
- `src/lib/repositories/lab-repository.ts`
- `src/lib/repositories/demo-lab-repository.ts`
- `src/lib/repositories/demo-lab-repository.test.ts`
- `handoff.md`

### Verification performed before delivery

- `npm test` — ผ่าน: 3 test files, 7 tests
- `npm run lint` — ผ่าน ไม่มี warning/error
- `npm run build` — ผ่าน: compile, TypeScript และ static generation สำเร็จ
- `npm run firebase:verify` — เรียกใช้งานจริงแล้วแต่ Firestore Emulator เริ่มไม่ได้ เพราะเครื่องมี Java `1.8.0_471` ขณะที่ firebase-tools รุ่นปัจจุบันต้องการ Java 21 ขึ้นไป
- ตรวจหา Java ที่ติดตั้งใน `Program Files` แล้ว: พบเฉพาะ Java 8; ไม่มี JDK 21 ให้สลับใช้งาน

ผลตรวจ browser sandbox ที่ `http://localhost:3000`:

- Firebase ยังไม่ตั้งค่า — แสดงหน้า setup พร้อม `Continue in demo mode` ถูกต้อง ไม่เปิด dashboard โดยไม่ได้รับ session
- Demo auth — เข้าสู่ dashboard ได้และแสดงสถานะ `DEMO`
- Step completion — progress เปลี่ยนจาก `03/06` เป็น `04/06`
- Lot selection — เลือก `VIO-001` แล้ว selected lot เปลี่ยนเป็น `VIO-001`
- Modal — เปิด `Start an experiment` และปิดด้วย `Close` ได้
- Mobile sign-out — ปุ่ม `ออกจากระบบ` แสดงและกลับหน้า Firebase setup ได้
- Desktop `1440×1000` — ไม่มี horizontal overflow; sidebar แสดงผล
- Tablet `1024×900` — ไม่มี horizontal overflow; sidebar แสดงผล
- Mobile `390×844` — ไม่มี horizontal overflow; sidebar ถูกซ่อนและ mobile top bar แสดงผล
- หมายเหตุ: ต้องใช้ `localhost` สำหรับ Next.js dev sandbox; การเปิดผ่าน `127.0.0.1` ถูก Next.js ปิดกั้น HMR cross-origin โดยค่าเริ่มต้น

### Security and data behavior

- Firebase public config ถูกอ่านจาก environment variables เท่านั้นและไม่มี secret ฝังใน source
- Firestore repository ตรวจ UID ของ session ก่อนอ่าน/เขียน
- Security rules แยก read/create/update/delete เพื่อไม่อ่าน `request.resource.data` ระหว่าง delete
- AI/research evidence states ยังใช้ `Verified`, `Adapted`, `Experimental`, `Pending review`; ยังไม่มี auto-publish
- Demo mode ไม่เขียน cloud และข้อมูลหายเมื่อ refresh

### Remaining issues / external setup required

- ต้องสร้าง Firebase development/production projects จริง
- ต้องเปิด Google sign-in provider และสร้าง Firestore database ใน Firebase Console
- ต้องคัดลอก `.env.example` เป็น `.env.local` แล้วใส่ Firebase web app configuration
- ต้องติดตั้ง JDK 21 ขึ้นไปก่อนจึงจะรัน Firestore Emulator และ security-rule integration tests ในเครื่องนี้ได้
- ยังไม่ได้พิสูจน์ Google popup และ Firestore round trip กับ Firebase project จริง เพราะยังไม่มี project credentials
- `firebase-tools` dependency tree รายงาน 10 vulnerabilities จาก `npm audit` (8 moderate, 2 high); ห้ามใช้ forced audit fix โดยไม่ตรวจผลกระทบ
- Dashboard ยังควรแยกเป็น component/route ย่อย และยังไม่มี Cloudinary upload
- Keyboard focus automation ใน in-app sandbox ไม่ย้าย focus ออกจาก `BODY`; CSS focus state ต้องตรวจซ้ำด้วย automated Playwright/keyboard suite หลังเพิ่ม test runner สำหรับ browser

### Immediate next steps

1. ติดตั้ง JDK 21 และรัน `npm run firebase:verify` เพื่อทดสอบ Auth/Firestore emulator และ security rules
2. สร้าง Firebase dev project, เปิด Google Auth, สร้าง Firestore และเพิ่มค่า `.env.local`
3. ทดสอบ sign-in จริง, owner isolation และ Firestore round trip
4. เพิ่ม Firestore security rules tests บน emulator
5. แยก route `/protocols`, `/experiments`, `/research` และลดขนาด `src/app/page.tsx`
6. เชื่อม Cloudinary signed upload และเก็บเฉพาะ media metadata ใน Firestore
7. เพิ่ม Playwright browser test files สำหรับ auth gate, desktop/mobile, keyboard focus และ permission boundary
8. ตั้ง Vercel environment variables แยก Preview/Production แล้ว deploy preview

## Publish attempt — 2026-07-22

- ผู้ใช้เลือก commit, push และสร้าง Pull Request
- ตรวจ `gh --version` สำเร็จ: GitHub CLI 2.96.0
- ตรวจ `gh auth status` สำเร็จ: บัญชี `pslllanybk147` ล็อกอินและมีสิทธิ์ `repo`
- ตรวจ `git diff --check` ผ่าน; ไม่พบ whitespace error
- branch ปัจจุบันคือ `feature/firebase-foundation`
- หยุดก่อน commit/push เนื่องจาก repository นี้ยังไม่มี Git remote (`git remote -v` ว่าง)
- ยังไม่มี commit, push หรือ Pull Request จากรอบนี้
- ขั้นตอนถัดไป: เพิ่ม `origin` จาก URL ที่ผู้ใช้ระบุ หรือสร้าง GitHub repository ใหม่หลังผู้ใช้ยืนยันชื่อและ visibility แล้วจึง commit, push และเปิด Draft PR

### Publish completed

- เพิ่ม `origin`: `https://github.com/pslllanybk147/tissue_experiment.git`
- repository เดิมว่าง จึง push `master` ที่ initial commit เพื่อสร้าง base branch ก่อน
- commit หลัก: `0020ed3 Add Firebase research lab foundation`
- push branch `feature/firebase-foundation` สำเร็จ
- เปิด Draft Pull Request #1 ไปยัง `master`: `https://github.com/pslllanybk147/tissue_experiment/pull/1`

## Production release — 2026-07-22

- ผู้ใช้ยืนยันให้ release ไป Vercel
- เปลี่ยน PR #1 จาก Draft เป็น Ready และ merge เข้า `master` สำเร็จ
- merge commit: `25ab31bd4353302bf50f9246e6886ef5a5cf9f64`
- Vercel status จาก GitHub สำเร็จ 2 project: `tissue-experiment-93` และ `tissue-experiment`
- ตรวจ HTTP production แล้วทั้งสอง URL ตอบ `200` และ title เป็น `Philodendron Lab`
- URL ที่ตรงกับ project ในภาพของผู้ใช้: `https://tissue-experiment-93.vercel.app`
- production sandbox พบข้อความ `LOCAL DEVELOPMENT` บนหน้า Firebase setup จึงแก้เป็น `SECURE WORKSPACE` และปรับคำอธิบายให้ใช้ได้ทั้ง local/Vercel
- หลังแก้ hotfix: `npm test` ผ่าน 7 tests, `npm run lint` ผ่าน และ `npm run build` ผ่าน
- Firebase Environment Variables ยังไม่ได้ตั้งบน Vercel จึงเปิดได้ใน demo mode; ยังไม่มีการเขียนข้อมูลจริงไป Firestore
- พบการเชื่อม Vercel ซ้ำ 2 project กับ repository เดียวกัน ควรเก็บ project ที่ต้องการเพียงตัวเดียวภายหลังเพื่อลด deployment ซ้ำ
- hotfix commit `b32829e` deploy สำเร็จทั้งสอง Vercel projects
- production sandbox หลัง hotfix ที่ `tissue-experiment-93.vercel.app`: eyebrow เป็น `SECURE WORKSPACE`, demo session แสดง `DEMO`, desktop 1440px แสดง sidebar, mobile 390px ซ่อน sidebar พร้อมมีปุ่ม sign-out, ทั้งสองขนาดไม่มี horizontal overflow

## Firebase environment activation — 2026-07-22

- ผู้ใช้แจ้งว่าเพิ่ม Firebase environment variables ใน Vercel แล้ว
- ตรวจ production ก่อน rebuild ยังแสดง Firebase unconfigured fallback ซึ่งเป็น expected behavior เพราะ `NEXT_PUBLIC_*` ถูกฝังตอน build
- ยืนยันว่า production project ที่ใช้งานคือ `tissue-experiment-93`; URL ของ project ซ้ำ `tissue-experiment.vercel.app` ตอบ `DEPLOYMENT_NOT_FOUND`
- push บันทึกนี้ไป `master` เพื่อกระตุ้น Vercel rebuild หลัง environment variables ถูกตั้งค่า แล้วต้องตรวจว่าหน้าเว็บเปลี่ยนเป็น Firebase sign-in ก่อนถือว่าเสร็จ
- พบไฟล์ local ชื่อ `env.local` (ไม่มีจุดนำหน้า) และไม่เปิดอ่านเพื่อหลีกเลี่ยงการแสดง configuration; เพิ่ม `/env.local` ใน `.gitignore` เพื่อป้องกัน accidental commit โดยไฟล์ local ที่ Next.js รองรับควรชื่อ `.env.local`
- rebuild commit `ed5daf6` deploy สำเร็จบน Vercel project `tissue-experiment-93`
- production เปลี่ยนจาก unconfigured fallback เป็นหน้า `เข้าสู่ Philodendron Lab` พร้อมปุ่ม `Sign in with Google` แล้ว ยืนยันว่า Firebase public configuration ถูกฝังใน build สำเร็จ
- ตรวจ production auth screen ที่ desktop 1440px และ mobile 390px: ไม่มี horizontal overflow, ปุ่ม Google แสดงทั้งสองขนาด และไม่มี console warning/error
- ยังไม่กด Google sign-in ในการตรวจอัตโนมัติ เพราะจะเริ่ม external account authentication; ผู้ใช้ต้องทดลองล็อกอินเพื่อยืนยัน Authorized Domains และ Firestore round trip ในขั้นถัดไป

## Firestore deployment attempt — 2026-07-22

- ผู้ใช้ยืนยันว่าสร้าง Firestore Database แล้วและอนุญาตให้ deploy rules/indexes
- ตรวจพบ `NEXT_PUBLIC_FIREBASE_PROJECT_ID` ใน local environment โดยไม่แสดงค่าออกมา
- ตรวจ `firestore.rules` และ `firebase.json` แล้ว: deploy scope จำกัดเฉพาะ Firestore rules/indexes และกฎอนุญาตเฉพาะ owner UID
- Firebase CLI ตอบ `No authorized accounts`; จึงหยุดก่อน deploy และยังไม่มีการเปลี่ยนกฎบน Firebase project
- ขั้นตอนปลด blocker: ผู้ใช้รัน `npx firebase-tools login` ใน terminal และยืนยันบัญชี Google แล้วแจ้งให้ทำต่อ

### Firestore deployment completed

- Firebase CLI login สำเร็จด้วยบัญชีผู้ใช้
- deploy ไป Firebase project `tissue-experiment` สำเร็จ
- `firestore.rules` compile สำเร็จและถูก release ไป Cloud Firestore
- `firestore.indexes.json` deploy สำเร็จสำหรับ database `(default)`
- deployment scope ใช้ `--only firestore:rules,firestore:indexes`; ไม่แตะ Authentication หรือ document data
- production ที่ไม่มี web session ยังคงถูกกั้นไว้หน้า Sign in ตามที่ออกแบบ
- พบ console history `auth/popup-closed-by-user` ในแท็บหนึ่งจากการปิด Google popup; ไม่มี Firestore deployment error
- งานถัดไป: ผู้ใช้ล็อกอินหน้า production แล้วตรวจว่า dashboard แสดง `FIREBASE` และ seed/read/write ใต้ `users/{uid}` สำเร็จ

## Experiment observations design — 2026-07-22

- ผู้ใช้ยืนยันว่า production dashboard แสดง `FIREBASE`
- ล็อกขอบเขตรอบถัดไปเป็น Experiment Lot + structured observations + audit history
- Observation แก้ไขได้และใช้ soft delete พร้อม restore
- เลือก Direct Firestore + batch write สำหรับ observation และ audit event
- ข้อมูล observation มีวันที่/เวลา, status, stage, note, shoot count, root count และ contamination count
- Cloudinary และ Protocol editor ถูกแยกไป increment ถัดไป
- เขียน design specification ที่ `docs/superpowers/specs/2026-07-22-experiment-observations-design.md`
- ยังไม่เริ่ม implementation; ขั้นถัดไปคือผู้ใช้ตรวจ spec จากนั้นจึงเขียน implementation plan ตาม TDD
- ผู้ใช้ตรวจและอนุมัติ specification แล้ว
- เขียน implementation plan ที่ `docs/superpowers/plans/2026-07-22-experiment-observations.md` ครบ 8 tasks พร้อม TDD, sandbox, Firebase rules release และ Vercel Preview gate
- ยังไม่มี production code เปลี่ยนในรอบ plan; ขั้นถัดไปเลือกวิธี execution แล้วเริ่ม Task 1 บน isolated workspace

### Implementation checkpoint 1

- ผู้ใช้เลือก Inline Execution และอนุญาต isolated worktree
- worktree: `.worktrees/experiment-observations` บน branch `feature/experiment-observations`
- baseline `npm test` ผ่าน 7 tests ก่อนเริ่ม
- Task 1 เสร็จ: domain types และ validation แบบ TDD
- Task 2 เสร็จ: lot search/status filter/newest-first แบบ pure function
- Task 3 เสร็จ: memory experiment repository พร้อม owner guard, create/update, soft delete, restore และ audit before/after
- ยืนยัน RED ก่อน implementation สำหรับทั้ง validation, query และ repository tests
- checkpoint test: `npm test` ผ่าน 6 files, 24 tests
- commits: `6fc963c`, `ce35f8e`, `157fc3e`
- npm install ยังคงรายงาน dependency audit 10 รายการ (8 moderate, 2 high); ยังไม่ใช้ forced fix
- ขั้นถัดไป: Task 4 Firestore repository + paired batch writes + rules validation

### Preview regression and checkpoint 2

- Vercel Preview ของ commit `dc15ea5` ล้มที่ TypeScript เพราะ dashboard ยังใช้ legacy fields `lot.day`, `lot.protocol`, และ `lot.startedAtLabel`
- ทำให้เกิดซ้ำด้วย `npm run build` และยืนยัน root cause ว่า schema migration ของ `ExperimentLot` ไม่ครบ
- เพิ่ม regression tests ให้ demo seed ใช้ schema ใหม่ และเพิ่ม `lotAgeDays(startedAt)` แทน stored day
- แก้ dashboard ให้ใช้ `protocolTitle`, `startedAt` และคำนวณ Day จากวันที่
- regression tests ผ่าน 7 tests, local build ผ่าน และ Vercel Preview commit `eac88ff` สำเร็จ
- Task 4 เสร็จ: Firestore experiment repository ผ่าน adapter พร้อม paired observation/audit batch contract
- Task 4 tests ผ่าน 4 tests; ชุดรวมผ่าน 7 files, 30 tests; lint ไม่มี warning; build ผ่าน
- rules เดิมครอบคลุม nested owner-only subcollections อยู่แล้ว จึงยังไม่เปลี่ยนหรือ deploy rules ใน checkpoint นี้
- ขั้นถัดไป: shared LabShell และ routes/components สำหรับ Experiment list/create/detail

### Experiment workflow checkpoint 3 — 2026-07-22

- branch: `feature/experiment-observations`; worktree: `.worktrees/experiment-observations`
- เพิ่ม shared responsive `LabShell` และ navigation จริงไป `/`, `/experiments`, `/experiments/new`
- เพิ่ม Experiment list พร้อมค้นหา Lot ID/ชื่อพืช, filter status, desktop table และ mobile stacked rows
- เพิ่ม structured Lot form พร้อม validation, pending/error state และ create ผ่าน demo memory repository หรือ authenticated Firestore repository
- เพิ่ม detail route `/experiments/[lotId]` พร้อม structured observation form, timeline, edit, soft delete, show deleted, restore และ immutable audit history
- observation mutations ใช้ repository contract เดิมที่จับคู่ observation + audit event ใน Firestore batch
- เพิ่ม compatibility normalizer สำหรับ Firestore documents รุ่นเก่าที่มี `day` และ `protocol` เพื่อไม่ให้ production dashboard/page ใหม่แตก
- TDD: ยืนยัน RED ก่อนสร้าง list/form/observation/timeline/audit components และ legacy migration normalizer
- automated verification ล่าสุด: 13 files / 38 tests ผ่าน, ESLint ผ่าน, Next production build ผ่าน, routes ครบ `/experiments`, `/experiments/new`, `/experiments/[lotId]`
- React best-practices review แก้ synchronous effect state reset เป็น keyed form และ asynchronous repository callbacks
- local browser sandbox ใช้ production server port 3011 เพราะ Windows path ของ isolated worktree ยาวเกินข้อจำกัด Turbopack dev sourcemap; production build/server ไม่พบปัญหานี้
- browser sandbox ผ่านการโหลดหน้า, demo auth gate, list, create Lot, create observation, edit observation และ responsive overflow checks ที่ 1440×900, 1024×768, 390×844
- soft-delete browser click เปิด native confirmation สำเร็จ แต่ browser-control channel timeout ระหว่าง dialog handoff; repository soft-delete/restore/audit behavior ยังผ่าน automated tests
- ขั้นถัดไป: fresh full verification, commit/push branch, รอ Vercel Preview และตรวจ authenticated Firebase workflow บน Preview ก่อน merge
- commits ของ checkpoint: `f56032a` (list/create) และ `d2071fe` (detail observations + migration)
- push branch สำเร็จและเปิด Draft PR #2: `https://github.com/pslllanybk147/tissue_experiment/pull/2`
- Vercel check ของ commit `d2071fe` ผ่าน และ Preview พร้อมใช้งานที่ `https://tissue-experiment-93-git-featu-f89199-pslllanybk-2845s-projects.vercel.app`
- fresh final verification หลังแก้ migration import: 14 files / 39 tests ผ่าน, ESLint ผ่าน, production build ผ่าน, `git diff --check` ผ่าน
- ยังไม่ merge production; ต้องตรวจ authenticated Firebase create/edit/delete/restore บน Preview แล้วขออนุมัติผู้ใช้ก่อน merge

### Deferred roadmap — Machine Learning / Image Processing

- งาน Machine Learning และ Image Processing สำหรับวิเคราะห์ชนิดหรือสายพันธุ์พืชถูกบันทึกไว้เป็นโครงการในอนาคต
- **ห้ามเริ่มพัฒนา Image Processing จนกว่า project เดิมด้าน Protocol, Experiment Lots, Observations, Audit History และ production validation จะเสร็จสมบูรณ์ก่อน**
- หลัง project เดิมเสร็จ จึงค่อยออกแบบ Plant Profile, licensed image dataset, label review, image similarity และโมเดลจำแนกสายพันธุ์เป็น phase แยก
- ภาพจาก Google Images ห้ามนำมาใช้เป็น training dataset โดยอัตโนมัติ; ต้องใช้แหล่งที่มี license และ provenance ตรวจสอบได้ เช่น iNaturalist, GBIF, Pl@ntNet หรือ Wikimedia Commons

### Authenticated Preview validation — 2026-07-22

- ผู้ใช้ล็อกอิน Vercel Deployment Protection และ Firebase Google Auth สำเร็จ; Preview แสดง session `FIREBASE`
- ตรวจอ่าน Firestore owner-scoped data สำเร็จ และสร้าง test lot `QA-20260722` (`Sandbox validation control`) ไว้เป็น validation control
- ตรวจ create observation, edit observation และ audit `created`/`updated` สำเร็จบน Firestore จริง
- ตรวจ soft delete สำเร็จ: observation ถูกซ่อนจาก default timeline และ audit แสดง `deleted`
- ตรวจ show-deleted และ restore สำเร็จ: observation กลับมาใน timeline และ audit แสดง `restored`
- พบระหว่าง browser retry ว่า delete request ซ้ำสร้าง audit `deleted` ซ้ำได้ เพราะ repository mutation ยังไม่ idempotent
- เพิ่ม regression tests ทั้ง memory และ Firestore repositories แล้วแก้ repeated delete/restore ให้คืน current state โดยไม่สร้าง audit ซ้ำ
- verification หลังแก้: 14 test files / 41 tests ผ่าน, ESLint ผ่าน, Next production build ผ่าน และ `git diff --check` ผ่าน
- responsive Preview ตรวจที่ 1440×900, 1024×768 และ 390×844; ไม่พบ horizontal overflow หรือ Next error overlay
- หมายเหตุ: test lot `QA-20260722` และ audit เดิมสองรายการจากการค้น defect ยังคงอยู่ใน Firestore เพื่อรักษา audit trail; ระบบยังไม่มี lot delete
- commit/push idempotency fix สำเร็จที่ `1122c2b`; Vercel Preview check ผ่าน และ smoke test บน deployment ล่าสุดยืนยัน authenticated lot detail, observation timeline, audit history และไม่มี Next error overlay
- Draft PR #2 พร้อมขออนุมัติ merge เข้า `master`; ยังไม่มีการ merge หรือเปลี่ยน production ใน checkpoint นี้

### Production merge — 2026-07-22

- ผู้ใช้อนุมัติตัวเลือก 1 ให้ merge `feature/experiment-observations` เข้า `master`
- merge สำเร็จด้วย merge commit `Merge experiment observations workflow`
- แก้ tooling หลัง merge ให้ ESLint และ Vitest ไม่สแกน `.worktrees` ซึ่งเป็น source/build สำเนาและทำให้ lint ผิดพลาดหรือรันทดสอบซ้ำ
- verification บนผล merge: 14 test files / 41 tests ผ่าน, ESLint ผ่าน และ Next production build ผ่าน
- push `master` สำเร็จ; PR #2 ถูกปิดเป็น `MERGED` และ Vercel Production Deployment ผ่าน
- production smoke test ที่ `https://tissue-experiment-93.vercel.app/` ผ่าน: โหลดหน้า Firebase auth gate ได้, title ถูกต้อง, ไม่พบ horizontal overflow ที่ viewport เริ่มต้น และไม่มี Next error overlay
- ผู้ใช้ต้อง Sign in with Google บน production origin แยกจาก Preview ก่อนทดสอบข้อมูล authenticated ในการใช้งานครั้งแรก

### Protocol + navigation + media design — 2026-07-22

- ผู้ใช้ขอทำ dashboard navigation, Protocol workflow และ Cloudinary observation media ให้ครบใน release เดียว
- ล็อกแนวทางเป็น Next.js/Firebase application เดิม, feature branch เดียว, Preview checkpoints แยกโมดูล และ production merge ครั้งเดียวเมื่อทุกส่วนผ่าน
- Protocol ใช้ immutable version snapshots; progress เป็นข้อมูลเฉพาะแต่ละ experiment lot
- Cloudinary ใช้ signed upload จาก server-only credentials; Firestore เก็บ metadata, soft delete และ audit history
- Research route ใน release นี้เป็น evidence-labelled read-only register; AI review workflow และ image processing ยังไม่อยู่ในขอบเขต
- design specification: `docs/superpowers/specs/2026-07-22-protocol-media-navigation-design.md`
- ขั้นถัดไป: ผู้ใช้ตรวจ written spec แล้วจึงสร้าง implementation plan ตาม TDD
- ผู้ใช้อนุมัติ written spec แล้ว (ข้อความ `jok` ถูกตีความตามบริบทเป็น `ok`)
- implementation plan: `docs/superpowers/plans/2026-07-22-protocol-media-navigation.md`
- แผนแบ่ง 10 tasks พร้อม TDD, Firebase emulator, rendered browser sandbox, Vercel Preview และ production merge gate
- ยังไม่มี production code เปลี่ยนใน checkpoint นี้; ขั้นถัดไปคือเลือกวิธี execution

### Protocol media implementation checkpoint 1 — 2026-07-22

- ผู้ใช้เลือก Inline Execution และ isolated worktree `.worktrees/pmn` บน branch `feature/protocol-media-navigation`
- baseline ผ่าน 14 files / 41 tests
- Task 1 เสร็จ: navigation รองรับ Overview, Protocols, Experiments, Research พร้อม `aria-current`; เพิ่ม `/research` แบบ read-only
- Task 2 เสร็จ: protocol domain, draft validation และ semantic draft versioning
- Task 3 เสร็จ: memory Protocol repository พร้อม owner guard, immutable published version, idempotent activation และ audit
- Task 4 ส่วน repository เสร็จ: Firestore Protocol adapter จับคู่ protocol/version/audit ใน mutation เดียว; owner rule เดิมครอบคลุม nested paths
- ยืนยัน RED ก่อน implementation ทุกส่วน; checkpoint ผ่าน 19 files / 50 tests, ESLint ผ่าน และ Next production build ผ่าน
- Next build มีเพียง warning เรื่องหลาย lockfiles จาก isolated worktree; ไม่ใช่ application error
- commits: `0d1d0ef`, `50be398`, `94e27df`, `c067905`
- ขั้นถัดไป: Protocol list/editor/version history และ lot-specific progress

### Protocol media implementation checkpoint 2 — 2026-07-22

- เพิ่ม `createDraftVersion()` หลังผู้ใช้อนุมัติ เพื่อ clone published snapshot, เพิ่ม minor version และ audit `version_created`
- Task 5 เสร็จ: routes `/protocols`, `/protocols/new`, `/protocols/[protocolId]`, `/protocols/[protocolId]/edit` พร้อม list, editor, publish และ version history
- Protocol editor ใช้ปุ่มขึ้น/ลงที่รองรับ keyboard/mobile และสร้างร่างใหม่อัตโนมัติเมื่อแก้ฉบับเผยแพร่แล้ว
- Task 6 foundation เสร็จ: progress domain, memory repository แบบ idempotent และ ProtocolRunner component
- checkpoint ผ่าน 24 files / 57 tests, ESLint ผ่าน และ Next build ผ่าน routes ใหม่ทั้งหมด
- commits: `a366659`, `7601f8b`, `9e34df8`
- ขั้นถัดไป: Firestore progress repository + lot integration ก่อนเริ่ม Cloudinary

### Protocol media implementation checkpoint 3 — 2026-07-22

- Task 6 เสร็จ: Firestore progress repository, owner guard, paired audit mutation, idempotent completion และ ProtocolRunner บน Lot detail
- เพิ่ม optional `protocolVersionId` สำหรับ Lot ใหม่; ข้อมูล legacy fallback ไป current version เพื่อไม่ทำให้เอกสารเดิมแตก
- Task 7 code foundation เสร็จ: Cloudinary config validation, deterministic SHA-1 signature, Firebase Admin token verification และ `POST /api/media/sign`
- endpoint จำกัด JPEG/PNG/WebP, 10 MB และ owner-scoped Cloudinary folder; secret ไม่มี `NEXT_PUBLIC_` prefix
- เพิ่ม `firebase-admin` dependency และ `.env.example` สำหรับ server credentials
- Task 8 foundation: ObservationMedia domain, memory media repository แบบ soft delete/restore idempotent และ MediaStrip
- verification: 30 files / 66 tests ผ่าน, Next production build ผ่าน; lint เหลือ warning `<img>` แล้วแก้เป็น Next Image ก่อน commit
- ขั้นถัดไป: Firestore media repository, uploader state machine, observation integration และ Cloudinary sandbox

### Protocol media implementation checkpoint 4 — 2026-07-22

- Task 8 เสร็จในโค้ด: Firestore media repository, paired audit, owner guard, idempotent delete/restore, signed Cloudinary uploader และ Observation integration
- uploader ขอ Firebase ID token, รับ signed parameters จาก server, upload ตรงไป Cloudinary แล้วจึงบันทึก metadata ใน Firestore
- Task 9 เสร็จ: แทน dashboard mock เดิมด้วย repository-backed dashboard และ real links ไป Protocols, Experiments, Research
- verification: 33 files / 71 tests ผ่าน, ESLint ผ่าน และ Next production build ผ่านทุก route รวม `/api/media/sign`
- Firebase emulator sandbox ถูกบล็อก: local `java` เป็น Java 8 (`1.8.0_471`) แต่ firebase-tools ปัจจุบันต้อง Java 21 ขึ้นไป; ยังไม่มีการติดตั้งหรือเปลี่ยน Java โดยไม่ได้รับอนุญาต
- ยังไม่ push Preview และยังไม่ merge production
- ขั้นถัดไป: ขออนุญาตติดตั้ง Java 21 หรือให้ผู้ใช้ติดตั้งเอง จากนั้นรัน emulator + browser sandbox ก่อน Preview

### Protocol media implementation checkpoint 5 — 2026-07-22

- ติดตั้ง Microsoft OpenJDK 21.0.11.10 สำเร็จโดยคง Java 8 เดิมเป็นค่า default ของเครื่อง และกำหนด `JAVA_HOME`/`Path` เฉพาะ session ที่รัน emulator
- Firebase Auth + Firestore emulator sandbox ผ่าน: 33 test files / 72 tests, 0 failures และ emulator ปิดตัวเรียบร้อยหลังทดสอบ
- เพิ่ม mobile route navigation ใน shared `LabShell`; ที่ 390×844 แสดง Overview, Protocols, Experiments, Research และซ่อน desktop sidebar
- ปรับหน้า New Experiment ให้ดึงเฉพาะ Active Protocol และเลือก immutable published version snapshot; Lot ใหม่บันทึก `protocolId`, `protocolTitle` และ `protocolVersionId` พร้อมกัน
- ข้อมูล Lot รุ่นเก่ายัง fallback ไป current version ได้เพื่อ migration compatibility
- ล็อก `turbopack.root` เป็น working directory ปัจจุบัน หลัง sandbox พบว่า Next.js เคยอนุมาน root ไป repo หลักเพราะมี lockfile ทั้ง repo และ isolated worktree ทำให้ server ตรวจโค้ดเก่า
- responsive sandbox แบบ isolated headless Chrome ผ่านที่ 390×844, 1024×768 และ 1440×900: ไม่มี horizontal overflow, mobile/desktop navigation สลับถูก breakpoint, keyboard focus มี visible outline และ reduced-motion context โหลดได้
- React best-practices review แก้การ sync props เข้า state ผ่าน effect โดย initialize snapshot ตอน form mount หลัง Protocol list โหลดเสร็จ
- fresh verification ปัจจุบัน: 33 test files / 72 tests ผ่าน, ESLint ผ่าน และ Next production build ผ่าน 10 routes
- Cloudinary live upload ยังต้องใช้ server credentials จริง 6 ตัวใน Vercel environment ก่อนตรวจ upload บน Preview; secret ห้ามมี `NEXT_PUBLIC_`
- ยังไม่ push branch, ยังไม่สร้าง Preview checkpoint ใหม่ และยังไม่ merge production
- ขั้นถัดไป: commit/push branch, รอ Vercel Preview, ตรวจ Firebase authenticated workflow และ Cloudinary credential gate แล้วจึงขออนุมัติ merge
- commit checkpoint: `a827d76` (`Complete responsive protocol release gate`)
- push branch `feature/protocol-media-navigation` สำเร็จ และเปิด Draft PR #3: `https://github.com/pslllanybk147/tissue_experiment/pull/3`
- Vercel และ Vercel Preview Comments checks ของ commit `a827d76` ผ่านทั้งคู่; deployment dashboard id `Fh48AjzwVRYJx3VHRZYiaGUoq5jY`
- ยังไม่ merge production; Preview authenticated + Cloudinary live upload เป็น release gate ที่เหลือ

### Protocol media implementation checkpoint 6 — 2026-07-23

- ตรวจ Vercel Environment Variables ผ่าน authenticated dashboard โดยอ่านเฉพาะชื่อและ scope ไม่เปิดเผยค่า secret
- พบเฉพาะ Firebase client variables 6 ตัว (`NEXT_PUBLIC_FIREBASE_*`) ครบสำหรับ Production และ Preview
- ยังขาด server-only variables 6 ตัว: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`
- Preview ล่าสุดของ commit `c07fd9a` อยู่สถานะ Ready; branch alias: `https://tissue-experiment-93-git-featu-3216fc-pslllanybk-2845s-projects.vercel.app`
- Preview auth gate โหลดถูกต้อง แต่ browser session ของ alias ใหม่นี้ยังไม่ได้ Sign in with Google
- Cloudinary live upload ยังทดสอบไม่ได้จนกว่าจะเพิ่ม server variables ทั้ง 6 ตัวใน Preview scope แล้ว redeploy; ห้ามใช้ `NEXT_PUBLIC_` กับตัวแปรเหล่านี้
- ขั้นถัดไปสำหรับผู้ใช้: เพิ่ม variables ทั้ง 6 ตัวใน Vercel, redeploy Preview และ sign in ที่ branch alias จากนั้นแจ้งว่าเรียบร้อยเพื่อให้ตรวจ protocol → lot → observation → image upload แบบ end-to-end
- ผู้ใช้เพิ่ม server-only variables ทั้ง 6 ตัวแล้ว; ตรวจชื่อและ scope ผ่าน Vercel dashboard พบครบทั้งหมดและใช้ `Production and Preview`
- ขั้นถัดไป: trigger deployment ใหม่เพื่อให้ environment snapshot มีค่าชุดล่าสุด แล้วตรวจ authenticated sign/upload workflow
- trigger Preview ใหม่ด้วย commit `cc0de34`; Vercel deployment `2rABjL9SR5pQdjh2PTsnWFgphLf8` ผ่านและรับ environment snapshot ล่าสุดแล้ว
- branch alias ยังคงเป็น `https://tissue-experiment-93-git-featu-3216fc-pslllanybk-2845s-projects.vercel.app`
- เปิด Google Sign-in บน Preview แล้ว; ต้องให้ผู้ใช้เลือกบัญชีเองก่อนทดสอบ authenticated `/api/media/sign` และ Cloudinary upload
- ผู้ใช้ Sign in บน Preview สำเร็จ; Firebase session แสดง `FIREBASE` และอ่าน Experiment/Observation เดิมได้
- upload screenshot ทดสอบไปยัง Observation ของ `QA-20260722` ล้มเหลวที่ขั้นขอลายเซ็นก่อนส่งไฟล์ไป Cloudinary; UI เดิมซ่อน status จริงด้วยข้อความรวม
- เพิ่ม `readApiError()` พร้อม regression test เพื่อแสดง safe server error (`Invalid authentication`, `Media service unavailable` หรือ Cloudinary error) โดยไม่เปิดเผย secret
- verification หลัง diagnostic change: 33 test files / 73 tests ผ่าน, ESLint ผ่าน และ Next production build ผ่าน
- ขั้นถัดไป: deploy diagnostic change และทำ upload ซ้ำเพื่อระบุ root cause ก่อนแก้ configuration/code
- deployment `xFZC2Ve5yWLx9Q4XShmBkczFNq6G` ของ diagnostic change ผ่าน แต่ retry ยังได้ fallback แสดงว่า response ไม่ใช่ `{ error: string }`
- ขยาย diagnostic แบบปลอดภัยให้รองรับ nested Vercel error และแสดงเฉพาะ HTTP status เมื่อ response ไม่ใช่ JSON; ไม่แสดง response body หรือ secret
- retry บน deployment `EaUE6Ac9qkiUTRuf2v5FqET3N6Qy` ระบุ HTTP 500 จาก `/api/media/sign`; เป็น failure นอก intended 401/400/503 paths
- เพิ่ม Node runtime + force-dynamic และ outer phase boundary ที่รายงานเฉพาะ `request`/`firebase`/`cloudinary` พร้อม error class ใน server log โดยไม่บันทึก token/key/value
- verification: 33 test files / 74 tests ผ่าน, ESLint ผ่าน และ Next production build ผ่าน
- retry หลัง outer boundary ยังเป็น raw HTTP 500 จึงยืนยันว่า failure เกิดก่อนเข้า `POST()` handler ระหว่าง module bootstrap
- hypothesis แรก: top-level `firebase-admin` import ทำให้ serverless module bootstrap ล้มเหลว; ย้ายเป็น lazy import ภายใน Firebase phase เพื่อให้จับ authentication/config error ได้
- local verification หลัง lazy import: 33 test files / 74 tests ผ่าน, ESLint ผ่าน และ Next production build ผ่าน
- deployment `6wUjDSKSGwBQjyh4HjDGcYmsLMTJ` หลัง lazy import เปลี่ยน raw HTTP 500 เป็น controlled `Invalid authentication`; ยืนยันว่า route bootstrap แก้แล้วและ failure อยู่ใน Firebase Admin phase
- แยก Firebase Admin initialization/config error เป็น 503 `Firebase Admin configuration invalid` และ ID token verification error เป็น 401 `Invalid authentication`
- deployment `2tq1y3Q1zfRCidAxzTun81nP3vCy` ยืนยันผลเป็น `Firebase Admin configuration invalid`; Cloudinary endpoint ยังไม่ถูกเรียก
- root cause boundary: ค่า `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL` หรือ `FIREBASE_ADMIN_PRIVATE_KEY` ไม่สามารถสร้าง Firebase Admin credential ได้; client Firebase login/Firestore read ยังปกติ
- ขั้นถัดไปสำหรับผู้ใช้: ตรวจสามค่าเทียบ service-account JSON เดียวกัน โดยไม่ใส่ JSON quotes/comma และ private key ต้องรวม BEGIN/END; redeploy แล้ว retry

### Gemini handoff — 2026-07-23

#### จุดเริ่มต้น

- repository: `https://github.com/pslllanybk147/tissue_experiment.git`
- local worktree: `C:\Users\HP\Documents\Codex\2026-07-22\referenced-chatgpt-conversation-this-is-untrusted\philodendron-lab\.worktrees\pmn`
- branch: `feature/protocol-media-navigation`
- Draft PR: `https://github.com/pslllanybk147/tissue_experiment/pull/3`
- Vercel Preview alias: `https://tissue-experiment-93-git-featu-3216fc-pslllanybk-2845s-projects.vercel.app`
- ก่อนเริ่มงานให้เปิด worktree ข้างต้น แล้วตรวจ `git status -sb` และอ่านไฟล์ `handoff.md` ทั้งหมด
- ห้าม merge เข้า production จนกว่า image upload จะผ่าน, ตรวจ Preview ครบ และผู้ใช้อนุมัติอย่างชัดเจน

#### ระบบที่ทำเสร็จแล้ว

- Next.js + TypeScript frontend รองรับ desktop/mobile และทิศทางการออกแบบแบบ Gridgeist
- Firebase Google Auth และ Firestore แบบ owner-scoped
- Protocol list/create/edit/publish/version history พร้อม immutable snapshots
- Experiment lots, observations, audit history, soft delete/restore และ lot-specific protocol progress
- dashboard ใช้ข้อมูลจริงจาก repository
- Cloudinary signed-upload foundation และ Firestore media metadata
- Research register แบบ read-only พร้อม evidence labels
- navigation: Overview, Protocols, Experiments และ Research
- machine learning/image processing ถูกบันทึกเป็นงานอนาคต และต้องเริ่มหลัง project เดิมเสร็จเท่านั้น

#### สถานะการตรวจล่าสุด

- local verification ล่าสุดก่อน handoff: 33 test files / 74 tests ผ่าน
- ESLint ผ่าน
- Next production build ผ่าน
- Firebase Auth + Firestore read บน Preview ใช้งานได้หลังผู้ใช้ Sign in
- QA lot ที่ใช้ตรวจ: `QA-20260722`
- observation ที่ใช้ตรวจ: `d168babd-6e12-425f-99ef-430d72003cac`
- การอัปโหลดทดลองยังไม่สร้างไฟล์ใน Cloudinary เพราะ request หยุดอยู่ที่ Firebase Admin phase ก่อนเรียก Cloudinary

#### จุดติดขัดปัจจุบัน

- `/api/media/sign` ตอบแบบควบคุมได้ว่า `Firebase Admin configuration invalid`
- Firebase client login และ Firestore read ปกติ จึงเป็นปัญหาเฉพาะ server-side Firebase Admin credentials
- ตัวแปรที่ต้องตรวจใน Vercel:
  - `FIREBASE_ADMIN_PROJECT_ID`
  - `FIREBASE_ADMIN_CLIENT_EMAIL`
  - `FIREBASE_ADMIN_PRIVATE_KEY`
- ทั้งสามค่าต้องมาจาก service-account JSON ไฟล์เดียวกัน
- `FIREBASE_ADMIN_PRIVATE_KEY` ต้องมี `-----BEGIN PRIVATE KEY-----` และ `-----END PRIVATE KEY-----` ครบ
- ห้ามใส่ JSON quotes, comma ท้ายค่า หรือ prefix `NEXT_PUBLIC_`
- ห้ามพิมพ์ อ่านกลับ หรือบันทึกค่า secret ลง log, chat, screenshot, source code หรือไฟล์ handoff

#### ขั้นตอนถัดไปสำหรับ Gemini

1. ให้ผู้ใช้แก้ Firebase Admin variables ทั้งสามตัวใน Vercel จาก service-account JSON เดียวกัน หากยังผิดให้สร้าง service-account key ใหม่และแทนที่ทั้งสามค่าพร้อมกัน
2. Trigger Vercel Preview deployment ใหม่เพื่อรับ environment snapshot ล่าสุด
3. เปิด Preview alias และให้ผู้ใช้ Sign in with Google เอง
4. เปิด lot `QA-20260722` แล้วทดสอบ upload ด้วยภาพ JPEG/PNG สังเคราะห์ ห้ามใช้ภาพส่วนตัวของผู้ใช้โดยไม่ได้รับอนุญาต
5. ผลที่คาดหวัง: media signer สำเร็จ → Cloudinary upload สำเร็จ → Firestore media metadata ถูกบันทึก → รูปแสดงใน observation
6. ตรวจ soft delete/restore ของรูปและ audit event หลัง upload ผ่าน
7. รัน verification ใหม่ทั้งหมด:
   - `npm test`
   - `npm run lint`
   - `npm run build`
   - ตั้ง Java 21 เฉพาะ session แล้วรัน `npm run firebase:verify`
8. ตรวจ browser sandbox ที่ 390px, 1024px และ 1440px รวม keyboard focus, overflow, loading/error states และ reduced motion
9. อัปเดต `handoff.md` ทุกครั้งก่อนจบงาน จากนั้น commit และ push branch
10. รอ Vercel Preview checks ผ่าน แล้วขออนุมัติผู้ใช้ก่อน merge Draft PR #3 เข้า production

#### กติกาการส่งมอบ

- บรรทัดแรกของไฟล์นี้ต้องคงเป็น `ต้องมีการบันทึกทุกครั้งที่งานจบ`
- เก็บ secrets ใน Vercel Environment Variables เท่านั้น
- server-only variables ต้องไม่มี `NEXT_PUBLIC_`
- ใช้ภาพสังเคราะห์สำหรับ QA
- ห้าม merge production โดยอนุมานจากคำตอบทั่วไป ต้องได้รับคำอนุมัติ merge ที่ชัดเจน
- หากแก้โค้ด ต้องตรวจ sandbox/emulator อย่างละเอียดก่อนส่งงาน

### Media authentication ESM fix — 2026-07-23

- ผู้ใช้ทดสอบอัปโหลดบน Vercel Preview แล้วพบ `ERR_REQUIRE_ESM`: `firebase-admin/auth` โหลด `jwks-rsa` แบบ CommonJS ซึ่งเรียก `jose` v6 ที่เป็น ES module
- root cause: แม้ `verifyFirebaseToken()` จะใช้ dynamic `import("jose")` แล้ว แต่ยังอยู่ไฟล์ `firebase/admin.ts` เดียวกับ static imports ของ `firebase-admin/app` และ `firebase-admin/auth`; Vercel จึงโหลด dependency chain ที่เสียก่อนเรียก verifier
- แก้โดยแยก verifier ไป `src/lib/firebase/token-verifier.ts` ซึ่งไม่มี `firebase-admin` import และให้ `/api/media/sign` dynamic import โมดูลใหม่นี้โดยตรง
- เพิ่ม regression tests สำหรับ project ID precedence และ architecture boundary ที่ห้าม token verifier import `firebase-admin`
- ยืนยัน RED ก่อนแก้: test ล้มด้วย `Cannot find module './token-verifier'`
- fresh verification หลังแก้:
  - 35 test files / 79 tests ผ่าน
  - ESLint ผ่าน
  - Next production build ผ่าน
  - Firebase Auth + Firestore emulator ผ่านด้วย Microsoft OpenJDK 21
  - ตรวจ build output ของ `/api/media/sign` แล้วไม่พบ reference ถึง `firebase-admin` หรือ `jwks-rsa`
- fix commit: `307c9df` (`Isolate media token verification from Firebase Admin`)
- Vercel deployment ของ commit นี้ผ่าน checks ทั้ง Vercel และ Vercel Preview Comments
- live Preview verification ผ่านบน authenticated session ของ lot `QA-20260722`:
  - ใช้ภาพสังเคราะห์ `philodendron-lab-upload-check.png`
  - Firebase token verification ผ่าน
  - Cloudinary upload ผ่าน
  - Firestore media metadata ถูกบันทึก
  - รูปแสดงใน Observation และ UI รายงาน `อัปโหลดสำเร็จ`
- จุดติดขัด `ERR_REQUIRE_ESM` ของ media upload ปิดแล้ว
- ขั้นถัดไป: ตรวจ media soft delete/restore + audit และ responsive sandbox รอบสุดท้าย ก่อนขออนุมัติ merge Draft PR #3; image processing ยังเลื่อนไปหลัง project เดิมเสร็จ

### Protocol media implementation checkpoint 7 — 2026-07-23

- ผู้ใช้ยืนยันตั้งค่า Firebase Admin variables ใน Vercel เรียบร้อยแล้ว
- เพิ่ม `formatPrivateKey()` ใน `src/lib/firebase/admin.ts` และ `admin.test.ts` เพื่อแปลง RSA Private Key ที่ถูกตัด `\n` หรือรวมเป็นบรรทัดเดียวกลับเป็น PEM format มาตรฐานอัตโนมัติ
- ปรับปรุง `verifyFirebaseToken()` ให้ใช้ `jose` Dynamic JWKS (`https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com`) โดยตรง พร้อมรองรับ fallback `NEXT_PUBLIC_FIREBASE_PROJECT_ID` เพื่อตัดปัญหา `ERR_REQUIRE_ESM` ของ `jwks-rsa` บน Vercel
- ปรับปรุง `MediaUploader` ให้เรียก `user.getIdToken(true)` บังคับรับ fresh ID token ก่อนขอ signature
- เพิ่ม Lightbox Modal ใน `MediaStrip` สำหรับคลิกดูภาพสังเกตการณ์แบบขยายเต็มหน้าจอ
- แก้ไข import path ของ `ObservationMedia` ใน `src/components/media/media-strip.tsx` แก้ไขปัญหา Vercel build type check failure และ push commit `3b832b7` สำเร็จแล้ว
- ลำดับถัดไป: รอ Vercel Preview build เสร็จสิ้น แล้วทดสอบ Sign-in + อัปโหลดสื่อสังเกตการณ์ และกดขยายภาพที่ Lot `QA-20260722`






### Full-system QA audit — 2026-07-23

- ตรวจ branch `feature/protocol-media-navigation` ที่ commit `0850470`
- ผล automated checks:
  - `npm test`: ผ่าน 35 files / 79 tests
  - `npm run build`: ผ่าน
  - `npm run firebase:verify`: ผ่าน Auth + Firestore emulator ด้วย Java 21
  - `npm run lint`: **ไม่ผ่าน** 1 error
- ตรวจ Vercel Preview แบบ authenticated ที่ 390px, 1024px และ 1440px; ไม่พบ horizontal overflow และ desktop/mobile navigation แสดงถูก breakpoint
- ตรวจ workflow จริง: Experiment detail, observation timeline, รูป Cloudinary, lightbox, Protocol list/detail และ Create Lot

#### บัคที่พบ — ห้าม merge ก่อนแก้

1. **High — conditional React Hook ใน MediaStrip**
   - `src/components/media/media-strip.tsx:45-46` return ก่อน `useState`
   - ESLint: `React Hook "useState" is called conditionally`
   - เสี่ยงลำดับ Hook เปลี่ยนเมื่อรูปโหลดจาก 0 เป็นมีรูป
2. **High — Protocol legacy เปิดหน้า detail แล้วว่าง**
   - Dashboard seed ใช้ schema `Protocol` เดิมใน `users/{uid}/protocols/protocol-nodal-v01`
   - Protocol repository ใหม่ cast collection เดียวกันเป็น `ProtocolRecord`
   - Live Preview แสดง `Nodal establishment` ใน list แต่เปิด detail เหลือเพียงลิงก์ย้อนกลับ เพราะไม่มี `currentVersionId`/version snapshot
   - หน้า detail ไม่มี loading/error fallback เมื่อ record มีอยู่แต่หา current version ไม่เจอ

#### บัค/ช่องว่างระดับกลาง

3. **Medium — Audit history ของ media/progress แสดง entity ว่าง**
   - observation, media และ progress เขียนลง collection `auditEvents` เดียวกันแต่ใช้ schema ต่างกัน
   - `AuditHistory` อ่านทุก record เป็น `AuditEvent` และแสดง `event.entityType · event.entityId`
   - Live Preview แสดง media events เป็น `created ·` โดยไม่มีชนิดและรหัส
4. **Medium — Lightbox ไม่ผ่าน keyboard/dialog accessibility**
   - ไม่มี `role="dialog"`, `aria-modal`, focus management หรือ Escape handler
   - ทดสอบจริงแล้วกด Escape ไม่ปิด lightbox
   - ปุ่ม `✕` ไม่มี accessible label ที่อธิบายว่า “ปิด”
5. **Medium — media soft delete ไม่มี restore UI**
   - repository รองรับ `restore()` และ audit แต่หน้า Experiment โหลดเฉพาะ media ที่ไม่ถูกลบ
   - ปุ่มลบรูปไม่มี confirmation และเมื่อลบแล้วผู้ใช้กู้คืนจากหน้าเว็บไม่ได้
6. **Medium — media signing endpoint ไม่ตรวจ lot/observation existence**
   - authenticated user ขอ signed upload path สำหรับ lot/observation ID ใดก็ได้ใต้ UID ของตน
   - ไม่มี rate limit; เพิ่มความเสี่ยงใช้ Cloudinary quota โดยไม่สร้าง metadata ที่ถูกต้อง
7. **Medium — API ส่งรายละเอียด internal authentication error กลับ client**
   - `/api/media/sign` ตอบ `Invalid authentication (${details})`
   - เคยทำให้ module path/dependency internals แสดงใน UI; production ควรตอบข้อความทั่วไปและเก็บรายละเอียดเฉพาะ server log
8. **Medium — production dependency advisories**
   - `npm audit --omit=dev`: 9 vulnerabilities (7 moderate, 2 high)
   - เกี่ยวข้องกับ transitive `postcss`, `sharp`, `uuid`; ห้ามใช้ `npm audit fix --force` โดยไม่ประเมินเพราะคำแนะนำปัจจุบันทำให้ downgrade/breaking versions

#### Test coverage gap

- `firebase:verify` เปิด emulator แล้วรัน unit tests แต่ไม่มี `@firebase/rules-unit-testing` หรือ assertions ที่พิสูจน์ Firestore rules ว่าปฏิเสธ cross-user/unauthenticated writes จริง
- `MediaStrip` test ตรวจเพียง static markup ที่มีรูปอยู่แล้ว จึงไม่จับ transition จาก empty → populated, keyboard lightbox หรือ restore flow
- ขั้นถัดไป: แก้ตามลำดับ 1 → 2 → 3/4/5 → security/dependencies แล้วรัน full sandbox/emulator และ Vercel Preview ใหม่ก่อน merge PR #3

### Guided Protocol Workflow implementation checkpoint — 2026-07-23

- เริ่ม implementation ตามแผน Guided Protocol Workflow โดยยึดเส้นทางมือใหม่: Plant Record → Experiment Lot → template copy → guided runner → step evidence
- เพิ่ม domain model ใน `src/lib/domain/models.ts` สำหรับ `PlantRecord`, `ProtocolTemplate`, `ProtocolStepRun`, `UnifiedAuditEvent`, `StepMeasurement` และสถานะ `Passed / Needs review / Failed`
- เพิ่ม template content 3 ชุดใน `src/lib/domain/protocol-templates.ts`:
  - Pink Princess · Nodal culture
  - Violin variegated · Nodal culture
  - Generic Philodendron · Safe start
  - มี 13 ขั้นตั้งแต่ baseline จนติดตามความคงตัวของลายด่าง และแสดง `Verified / Adapted / Experimental` แยกชัดเจน
- เพิ่ม Plant Record repository ทั้ง memory/demo และ Firestore พร้อมหน้า:
  - `/plants`
  - `/plants/new`
  - `/plants/[plantId]`
- เพิ่ม guided runner ใน Experiment detail:
  - แสดงรายการขั้นตอนและ progress
  - แสดง objective, เหตุผล, วัสดุ, วิธีทำ, safety, critical controls, expected result และ pass/fail criteria
  - บันทึกสถานะ, measurement, note และ next action
  - รองรับ layout มือถือแบบเรียงแนวตั้ง
- เพิ่ม Step Run repository แบบ memory และ Firestore ใต้ `users/{uid}/lots/{lotId}/protocolStepRuns`; เมื่อบันทึกจะสร้าง audit event ประเภท `protocol-progress`
- ปรับ `/experiments/new` ให้เลือก guided template และสร้าง Protocol สำเนาสำหรับ Lot โดยไม่แก้ template ต้นฉบับ รวม `plantId/templateId/method` ใน Lot
- แก้ conditional Hook ใน `MediaStrip` และเพิ่ม Escape/focus/accessible dialog ให้ lightbox
- เพิ่ม legacy protocol migration ใน Firestore protocol repository: record ที่ไม่มี `currentVersionId` จะถูกแปลงเป็น `ProtocolRecord` พร้อม `ProtocolVersion` generic และไม่ทำให้หน้า detail ว่าง
- เพิ่ม automated tests สำหรับ template evidence, Plant ownership และ Step Run upsert
- ผลตรวจล่าสุด:
  - `npm test`: ผ่าน 37 files / 82 tests
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน และพบ routes `/plants`, `/plants/new`, `/plants/[plantId]`
  - `npm run firebase:verify`: ผ่าน โดยเปิด Auth + Firestore emulator และรัน tests ครบ
- Sandbox checkpoint: เปิด Next production-like dev server ชั่วคราวและตรวจ HTTP routes `/`, `/plants`, `/plants/new`, `/experiments/new` ได้ 200 ครบ; Firebase Auth + Firestore emulator verification ผ่าน; ยังต้องตรวจ visual ผ่าน browser/Preview หลัง push
- สิ่งที่ยังค้างจากแผน: unified audit rendering ในหน้า timeline ให้รองรับ media/progress เต็มรูปแบบ, media restore UI, signed upload ตรวจ existence ของ Lot/Observation, Firestore rules tests, Protocol authoring เต็มรูปแบบ และ Vercel Preview verification
- image processing/ML ยังไม่เริ่มตามข้อตกลงเดิม ต้องปิด guided protocol project ก่อน
- **ขั้นถัดไปสำหรับ session ใหม่:** ตรวจ `handoff.md` ก่อน แล้วทำ unified audit + media restore จากนั้นรัน sandbox/emulator และอัปเดตบันทึกนี้ทุกครั้งที่งานจบ

### Unified audit + media restore checkpoint — 2026-07-23

- อ่าน handoff ก่อนเริ่มงานตาม workflow
- ปรับ Experiment detail ให้รวม audit จาก Experiment และ Media repository แล้ว normalize เป็น `AuditEvent` กลางเดียวกัน โดย media แสดงเป็น `media · {mediaId}` ไม่แสดง `created ·` ว่าง
- รองรับ audit event ของ `protocol-progress` ที่ถูกเขียนจาก Step Run ใน Firestore collection เดียวกันกับ Lot/Observation/Media
- ปรับ media loading ให้ดูรายการที่ soft-deleted ได้เมื่อเปิด `แสดงรายการที่ลบ`
- เพิ่มปุ่ม `กู้คืนรูป` ใน `MediaStrip` สำหรับ media ที่ถูกลบ และเชื่อมกับ `mediaRepository.restore()` พร้อม reload audit history
- การลบรูปยังคง soft delete ไม่ลบ Cloudinary metadata ถาวร
- ตรวจ automated checks:
  - `npm test`: ผ่าน 37 files / 83 tests
  - `npm run lint`: ผ่าน ไม่มี warning/error
  - `npm run build`: ผ่าน
  - `npm run firebase:verify`: ผ่าน Auth + Firestore emulator
- Sandbox checkpoint: เปิด dev server ชั่วคราวและตรวจ `/`, `/plants`, `/plants/new`, `/experiments/new` ได้ HTTP 200 ครบ
- สิ่งที่ยังค้าง: signed upload ตรวจ existence ของ Lot/Observation, Firestore rules tests, Protocol authoring/version compare เต็มรูปแบบ และ visual/keyboard verification บน Vercel Preview
- image processing/ML ยังไม่เริ่มจนกว่า guided protocol project จะเสร็จตามข้อตกลง

### Upload security validation checkpoint — 2026-07-23

- ปรับ `src/app/api/media/sign/route.ts` ให้ตรวจ target ก่อนออก signed upload:
  - ต้องมี Firebase Bearer token
  - ตรวจว่า `users/{uid}/lots/{lotId}/observations/{observationId}` มีอยู่จริง
  - path ถูก scope ด้วย UID จึงไม่สามารถขอ signature ให้ข้อมูลของผู้ใช้อื่นได้
  - ถ้าไม่พบ target ตอบ `404 Upload target not found`
- ลดรายละเอียด error ที่ส่งกลับ client:
  - invalid token ตอบ `Invalid authentication`
  - config ขาดตอบข้อความทั่วไป
  - internal error log อยู่ฝั่ง server เท่านั้น
- ผลตรวจ:
  - `npm test`: ผ่าน 37 files / 83 tests
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `npm run firebase:verify`: ผ่าน Auth + Firestore emulator
  - Sandbox API request ที่ไม่มี token ตอบ HTTP 401 ตามคาด
  - Sandbox `/experiments` และ `/plants` ตอบ HTTP 200
- สิ่งที่ยังค้าง: เพิ่ม integration test ที่จำลอง authenticated token + Firestore target, Firestore rules tests และ visual/keyboard verification บน Vercel Preview

### Firestore rules verification checkpoint — 2026-07-23

- เพิ่ม dev dependency `@firebase/rules-unit-testing`
- เพิ่ม `src/lib/firebase/firestore-rules.test.ts` ครอบคลุม:
  - เจ้าของอ่าน/เขียน Lot ของตนเองได้
  - unauthenticated อ่านข้อมูลไม่ได้
  - ผู้ใช้อื่นอ่านข้อมูลข้าม account ไม่ได้
  - เขียน `ownerId` ของผู้ใช้อื่นไม่ได้
- Test จะ skip เมื่อรันนอก emulator และจะทำงานจริงเมื่อ `FIRESTORE_EMULATOR_HOST` ถูกตั้งโดย `firebase:verify`
- ผล `npm run firebase:verify`: ผ่าน 38 files / 86 tests
- ผล `npm run lint`: ผ่าน
- ผล `npm run build`: ผ่าน
- Sandbox routes `/`, `/plants`, `/experiments`: HTTP 200 ครบ
- สิ่งที่ยังค้าง: integration test ของ signed upload ที่ใช้ authenticated token จริง, visual/keyboard verification บน Vercel Preview และ Protocol authoring/version compare แบบเต็ม

### Full verification checkpoint — 2026-07-23

- ผู้ใช้ขอให้ทดสอบระบบทั้งหมด
- ผล `npm test`: 37 files passed, 1 rules suite skipped นอก emulator; รวม 83 passed / 3 skipped
- ผล `npm run lint`: ผ่าน
- ผล `npm run build`: ผ่าน
- ผล `npm run firebase:verify`: ผ่าน 38 files / 86 tests โดย rules suite ทำงานจริงบน Auth + Firestore emulator
- Sandbox API upload request ที่ไม่มี token: HTTP 401
- Sandbox routes ที่ตรวจ: `/`, `/plants`, `/plants/new`, `/experiments`, `/experiments/new` ตอบ HTTP 200 ครบ
- ไม่พบ release-blocking error จาก automated checks รอบนี้

### Signed upload integration test checkpoint — 2026-07-23

- ทำตามคำขอข้อ 1 โดยเพิ่ม `src/app/api/media/sign/route.integration.test.ts`
- Integration test ใช้ Firebase Auth emulator สร้าง user จริงและขอ Firebase ID token จริง
- ใช้ Firestore rules test environment สร้าง Lot และ Observation จริงของ user นั้น
- ยิง `POST /api/media/sign` เข้า route จริง ไม่ได้เรียกเฉพาะฟังก์ชัน signature
- กรณี target ถูกต้อง: ได้ HTTP 200 พร้อม Cloudinary folder ที่ scope ด้วย UID/Lot/Observation
- กรณี Observation ปลอม: ได้ HTTP 404 `Upload target not found`
- เพิ่ม emulator token verification path แยกออกจาก production JWKS path เพื่อให้ทดสอบ token จริงใน emulator โดยไม่ดึง `firebase-admin` เข้า production verifier path
- ผลตรวจ:
  - `npm run firebase:verify`: ผ่าน 39 files / 88 tests รวม integration test 2 กรณี
  - `npm test`: ผ่าน 37 files / 83 tests และ skip เฉพาะ emulator-only suites
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
- หมายเหตุ: emulator แสดง MetadataLookupWarning จาก environment แต่ test suite จบสำเร็จและผล assertions ผ่านทั้งหมด
- สิ่งที่ยังค้าง: ตรวจ Vercel Preview authenticated จริง, visual/keyboard QA และ Protocol authoring/version compare

### Vercel Preview guided workflow checkpoint — 2026-07-23

- ตรวจ Preview จริงที่ `https://tissue-experiment-93-git-featu-f89199-pslllanybk-2845s-projects.vercel.app`
- Source ที่ตรวจ: branch `feature/protocol-media-navigation`, commit `4657d78`
- ใช้ Firebase session ที่ล็อกอินอยู่จริงบน Preview
- ทดสอบสำเร็จ:
  1. เปิด `/plants` และเริ่มสร้าง Plant Record
  2. สร้าง Plant Record ชื่อ `QA Preview Plant 20260723` ชนิดที่คาดว่าเป็น `Philodendron Pink Princess` พร้อม confidence ระดับ Medium
  3. เปิดหน้า Plant Profile และตรวจข้อมูล baseline, สุขภาพ, วันที่รับต้น และหมายเหตุ
  4. สร้าง Experiment Lot `QA-PREVIEW-20260723` จาก template `Pink Princess · Nodal culture · Adapted`
  5. หน้า Lot แสดง Guided Protocol ครบ 13 ขั้น พร้อม objective, materials, instructions, safety/critical controls, expected result, pass/fail criteria และ next action
  6. กดบันทึกโดยไม่ใส่ note แล้วระบบบล็อกด้วยข้อความ `ขั้นนี้ต้องมี note ก่อนบันทึก`
  7. ใส่ note + เลือก `Passed` แล้วบันทึกสำเร็จ ระบบแสดง `บันทึกผลแล้ว` และทำเครื่องหมายขั้นที่ 1 เป็น Passed
- QA data ที่สร้างบน Preview:
  - Plant ID: `plant-bb0b61a7-71e2-49f8-910a-d384423ecb09`
  - Lot ID: `QA-PREVIEW-20260723`
  - ข้อมูลนี้เป็นข้อมูลทดสอบและควร archive/soft-delete ภายหลังตามต้องการ
- ยังไม่ถือว่าผ่าน: photo upload/delete/restore บน Preview เพราะหน้า Experiment ที่ตรวจไม่มี control สำหรับอัปโหลดรูปแสดงอยู่ใน DOM จึงยังไม่ได้กดทดสอบและไม่สรุปผลเกินหลักฐาน
- Automated checks ก่อน/ระหว่าง checkpoint: `npm test`, `npm run firebase:verify`, `npm run lint`, `npm run build` ผ่าน
- ขั้นถัดไปที่เหลือ: ตรวจ responsive/keyboard บน Preview หรือแก้ให้ media upload control ปรากฏใน guided workflow แล้วจึงทดสอบ media end-to-end

### Responsive and keyboard QA checkpoint — 2026-07-23

- ตรวจ Preview จริงที่ `https://tissue-experiment-93-git-featu-f89199-pslllanybk-2845s-projects.vercel.app`
- Desktop viewport ที่ browser เปิดให้ตรวจจริง: `1280 × 720` (อยู่ในช่วง desktop ของ acceptance target 1440px)
- ผล desktop:
  - `document.documentElement.scrollWidth === clientWidth` ไม่พบ horizontal overflow
  - sidebar, topbar, dashboard cards, tables และ Thai labels แสดงผลโดยไม่ล้นขอบ
  - หน้า dashboard มี interactive controls และ links ครบในลำดับ DOM ที่ใช้งานด้วย keyboard ได้
  - ปุ่ม navigation สามารถรับ focus ได้ และปุ่ม/ลิงก์มีชื่อที่อ่านได้จาก accessibility tree
- ตรวจจาก CSS production ที่ deploy แล้ว:
  - tablet breakpoint ที่ `1024px` และ `1100px` สำหรับ grid/sidebar/layout
  - mobile breakpoint ที่ `700px` และ `720px` สำหรับ mobile nav, single-column forms, guided runner และ observation form
  - media strip ใช้ horizontal scrolling เฉพาะแถบรูป ไม่ขยายความกว้างของหน้า
  - `prefers-reduced-motion: reduce` ลด transition/animation และปิด smooth scroll
- ข้อจำกัดการตรวจรอบนี้:
  - in-app Preview ที่เชื่อมอยู่ไม่มีตัวควบคุมเปลี่ยน viewport เป็น `390px`, `1024px`, `1440px` โดยตรง จึงยืนยันการ render จริงได้ที่ 1280px และยืนยัน breakpoint จาก CSS ที่ build/deploy แล้ว แต่ยังไม่อ้างว่าเป็น full device matrix
  - การกด Tab ผ่าน browser adapter ไม่เปลี่ยน active element อย่างเสถียร จึงตรวจ focusability และชื่อ accessibility ได้ แต่ยังไม่สรุป keyboard traversal แบบ end-to-end ว่าผ่านทั้งหมด
  - Escape/lightbox ยังทดสอบไม่ได้จาก Preview เพราะหน้า Experiment ยังไม่แสดง media upload control และไม่มีรูปให้เปิด lightbox
- Sandbox/emulator checkpoint รอบนี้: `npm run firebase:verify` ผ่าน 39 files / 88 tests
- สรุป: ไม่พบ responsive overflow หรือ release-blocking UI error จากสิ่งที่ตรวจได้จริง; งานที่เหลือคือ device matrix ด้วย viewport emulator เฉพาะทาง และ media/lightbox เมื่อ upload control ถูก expose ในหน้า workflow

### Image processing pilot audit — 2026-07-23

- ตรวจ git history และทุก branch ที่มีอยู่ พบ pilot เดิมใน:
  - branch `feature/plant-profile-ml`
  - merge commit `2072b73` บน `master`
  - dataset manifest commit `70654f3` บน `master`
- pilot ที่มีอยู่ประกอบด้วย:
  - `src/lib/domain/image-analyzer.ts`: ตรวจ pixel RGB ด้วย threshold เพื่อประมาณสัดส่วนสีด่างและ dominant colors
  - `src/lib/domain/dataset-exporter.ts`: สร้าง JSON manifest จาก observation media
  - `src/lib/domain/plant-profile.ts`: seed catalog สายพันธุ์และข้อมูล license/provenance
  - `/plants` และ PlantCard สำหรับ catalog/dataset preparation
- ข้อสรุปสำคัญ: ยังไม่มีโมเดล ML ที่ train/inference จากภาพจริง, ไม่มี TensorFlow/PyTorch/ONNX/Transformers dependency และไม่มี image decoding pipeline
- `estimatedVariegationPercentage` ใน pilot ใช้ hash ของ `media.id` เป็นค่าจำลอง ไม่ได้วิเคราะห์ภาพจริง จึงห้ามนำไปแสดงเป็นผลวิเคราะห์ทางวิทยาศาสตร์หรือใช้สร้าง ground truth
- `image-analyzer.ts` เป็น heuristic จาก pixel ที่ caller ป้อนให้ ไม่ได้อ่านไฟล์ภาพและไม่สามารถจำแนกชนิด/สายพันธุ์ได้
- ต้องตรวจ license/provenance ของ seed image และ metadata ก่อนใช้สร้าง training dataset; ห้ามถือคำว่า `CC-BY 4.0 Verified Provenance` ใน exporter เป็นหลักฐานยืนยันแทนเอกสารต้นทาง
- pilot ไม่ได้อยู่ใน current branch `feature/protocol-media-navigation` โดยตรง และไม่ควร merge ทั้งชุด เพราะ branch pilot มีความต่างจาก guided workflow ปัจจุบันจำนวนมาก
- แนวทางต่อยอดหลัง guided workflow เสร็จ: แยก image ingestion, provenance/label review, dataset export, baseline classifier และ evaluation เป็น phases ใหม่ โดยเริ่มจากข้อมูลที่ผู้ใช้ยืนยัน label เอง

### Image phase 1 foundation — 2026-07-23

- เริ่ม phase ใหม่ด้วย dataset intake foundation โดยยังไม่ทำ automatic species prediction
- เพิ่ม domain types ใน `src/lib/domain/models.ts` สำหรับ `DatasetItem`, `DatasetProvenance`, `DatasetLabel`, review status และ confidence
- เพิ่ม `src/lib/domain/dataset-intake.ts` สำหรับ validation:
  - media/lot/observation/asset ต้องมีตัวตน
  - licensed reference ต้องมี source URL
  - provenance ที่ Approved ต้องมี license
  - label ที่ใช้เป็น training truth ห้ามมี confidence เป็น Unknown
- เพิ่ม `src/lib/repositories/dataset-repository.ts` และ `memory-dataset-repository.ts` เป็น repository contract สำหรับ sandbox
- กติกาสำคัญ: สร้าง item เป็น `Pending review`, ต้อง approve provenance ก่อนบันทึก human label และจึงค่อย `includedInTraining: true`
- เพิ่ม tests ครอบคลุม provenance validation, Unknown label, cross-owner access และ approval gate
- Verification:
  - targeted tests: 2 files / 4 tests ผ่าน
  - `npm run firebase:verify`: 41 files / 92 tests ผ่าน
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
- ยังไม่เชื่อม Firestore/Cloudinary UI และยังไม่มี image decoder, model training หรือ inference
- ขั้นถัดไป: เชื่อม DatasetRepository กับ Firestore พร้อม owner rules และสร้างหน้า review queue ที่แก้ label/provenance ได้ก่อน export dataset

### Image phase 1 Firestore repository checkpoint — 2026-07-23

- เชื่อม dataset intake foundation เข้ากับ Firestore ผ่าน `src/lib/firebase/firestore-dataset-repository.ts`
- ใช้ path แบบ owner-scoped: `users/{uid}/datasetItems/{datasetItemId}`
- เพิ่ม `src/lib/repositories/dataset-repository-factory.ts` ให้เลือก Firestore เมื่อมี authenticated user และใช้ memory repository สำหรับ sandbox/unauthenticated fallback
- Repository ยังคงบังคับ owner guard, provenance approval ก่อนติด label และไม่เปิด `includedInTraining` จนกว่าจะมี label ที่ผ่าน validation
- เพิ่ม Firestore emulator rules tests สำหรับ:
  - เจ้าของอ่าน/เขียน dataset item ของตนเองได้
  - ผู้ใช้อื่นอ่าน/เขียนข้าม owner ไม่ได้
  - unauthenticated write ถูกปฏิเสธ
- ระหว่างทดสอบพบว่า Node test environment เรียก Firebase client โดยตรงไม่ได้ (`Firebase is not configured`) จึงเพิ่ม `DatasetPersistenceAdapter` injection เพื่อทดสอบ repository logic แบบ deterministic; rules ยังคงทดสอบกับ Firestore emulator จริง
- Verification หลังแก้:
  - `npm run firebase:verify`: 42 files / 95 tests ผ่าน
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `git diff --check`: ผ่าน
- ขอบเขตที่ยังไม่ทำ: Review Queue UI, Cloudinary-to-dataset ingestion, image decoding, model training และ inference
- ขั้นถัดไป: สร้าง Review Queue สำหรับตรวจ provenance/label และเชื่อม media ที่ผ่าน validation จาก observation เข้า DatasetItem โดยยังต้อง review ก่อนนำไป train

### Image phase 1 Review Queue UI — 2026-07-23

- เพิ่ม route `/dataset-review` สำหรับ workflow ตรวจภาพก่อนนำไปใช้กับ image processing
- เพิ่ม `src/components/dataset/review-queue.tsx`:
  - กรอง `All`, `Pending review`, `Approved`, `Rejected`
  - แสดงภาพ, Lot ID, Observation ID, provenance, source URL และ license
  - Approve/Reject provenance โดยบังคับ review note เมื่อ approve
  - ฟอร์มยืนยัน scientific name, cultivar, confidence และเหตุผลของ label
  - ปุ่มบันทึก label ถูกล็อกจนกว่า provenance จะ Approved
  - แสดงสถานะว่า item ยังไม่รวม training หรือพร้อมเป็น training candidate
- เพิ่มเมนู `Image review` ใน desktop sidebar และ mobile navigation
- หน้าใช้ `getDatasetRepository()` เดิม จึงใช้ Firestore เมื่อ login และ memory repository ใน demo mode
- เพิ่ม static rendering test สำหรับ review queue และตรวจว่ารายการ Pending ยังบันทึก label ไม่ได้
- แก้ signed-upload integration test timeout จาก 5 เป็น 15 วินาที เพราะ Auth/Firestore emulator ใช้เวลาสร้าง user เกินค่าเดิมใน sandbox; ไม่ได้เปลี่ยนพฤติกรรม production route
- Verification หลังแก้:
  - `npm run firebase:verify`: 43 files / 96 tests ผ่าน
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `git diff --check`: ผ่าน
- ขอบเขตที่ยังไม่ทำ: automatic ingestion จาก Cloudinary media, image decoding, model training/inference และการสร้าง DatasetItem จากหน้า Observation โดยตรง
- ขั้นถัดไป: เพิ่ม action สร้าง DatasetItem จาก media ที่เลือกใน Observation แล้วเปิดเข้า Review Queue โดยตรวจ lot/observation ฝั่ง server ก่อนสร้างรายการ

### Image phase 1 Observation media intake — 2026-07-23

- เพิ่ม `POST /api/dataset/intake` สำหรับส่ง media จาก Observation เข้า Dataset Review Queue
- route รับเฉพาะ `lotId`, `observationId`, `mediaId` และตรวจ Firebase token ก่อนทำงาน
- ฝั่ง server ดึง Lot, Observation และ Media จาก path ของ user เอง ไม่รับ `assetUrl` จาก client
- ปฏิเสธกรณี target ไม่พบ, owner/lot/observation ไม่ตรง หรือ media ถูก soft-delete
- สร้าง DatasetItem เป็น `Pending review` และ `includedInTraining: false`
- ทำให้ idempotent: ส่ง media เดิมซ้ำจะคืนรายการเดิม ไม่สร้าง DatasetItem ซ้ำ
- เพิ่มปุ่ม `ส่งเข้า Image review` ใน media ของ Observation พร้อมสถานะกำลังส่ง, ส่งแล้ว และ error ที่อ่านได้
- เพิ่ม tests:
  - unauthenticated/malformed request
  - integration สร้าง item จาก media จริงใน emulator
  - duplicate intake ไม่สร้างซ้ำ
  - media ที่อ้างจาก Observation อื่นถูกปฏิเสธ
- Verification หลังแก้:
  - `npm run firebase:verify`: 45 files / 100 tests ผ่าน
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `git diff --check`: ผ่าน
- ขอบเขตที่ยังไม่ทำ: automatic image decoding, species classifier, model training/inference และการดึงข้อมูลภาพจาก Google โดยอัตโนมัติ
- ขั้นถัดไป: เพิ่มรายการ DatasetItem ที่ถูกส่งแล้วใน Observation และ audit event ของ intake เพื่อให้ย้อนดูได้จาก Lot timeline

### Image phase 1 intake audit checkpoint — 2026-07-23

- เพิ่ม action `dataset_queued` ใน `AuditEvent`
- `/api/dataset/intake` เขียน DatasetItem และ audit event ใน Firestore batch เดียวกัน จึงไม่เกิดรายการ dataset โดยไม่มีประวัติ intake หาก batch สำเร็จ
- audit event ถูกเก็บใน `users/{uid}/lots/{lotId}/auditEvents` และมีข้อมูลสำคัญเท่านั้น:
  - `entityType: media`
  - `entityId: mediaId`
  - `action: dataset_queued`
  - `after.datasetItemId`
  - `after.reviewStatus: Pending review`
- ปรับ `AuditHistory` ให้แสดงข้อความภาษาไทย `ส่งเข้า Image review` และเปิด before/after ของ event นี้ได้
- เพิ่ม integration assertion ว่า intake สำเร็จแล้วมี audit event ใน emulator จริง
- Verification หลังแก้:
  - `npm run firebase:verify`: 45 files / 100 tests ผ่าน
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `git diff --check`: ผ่าน
- ขั้นถัดไป: แสดงสถานะว่า media รายการใดถูกส่งเข้า review แล้วใน Observation และให้ Lot timeline link ไปยัง Dataset Review item ได้

### Image phase 1 dataset export — 2026-07-23

- เพิ่ม `src/lib/domain/dataset-exporter.ts` เพื่อสร้าง manifest schema `image-dataset-v1`
- exporter รวมเฉพาะรายการที่ผ่านครบทุกเงื่อนไข:
  - `reviewStatus === Approved`
  - `provenance.status === Approved`
  - มี human label
  - confidence ไม่ใช่ `Unknown`
  - `includedInTraining === true`
- manifest เก็บ asset URL, Lot/Observation, scientific name, cultivar, confidence, label source และ provenance metadata โดยไม่เก็บ token หรือ secret
- เพิ่ม `GET /api/dataset/export` ซึ่งตรวจ Firebase token และอ่านเฉพาะ collection ของ owner ที่ login อยู่
- เพิ่มปุ่ม `Export manifest` ในหน้า Image Review สำหรับ authenticated user และดาวน์โหลด JSON ใน browser
- เพิ่ม tests สำหรับ filtering manifest และ unauthenticated export request
- Verification หลังแก้:
  - `npm run firebase:verify`: 47 files / 102 tests ผ่าน
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `git diff --check`: ผ่าน
- สถานะ: ระบบพร้อมสร้าง manifest จากข้อมูลที่มนุษย์ review แล้ว แต่ยังไม่มี image decoder, train/validation split, model training หรือ inference
- ขั้นถัดไป: ทำ dataset version/export history และเตรียม pipeline preprocessing ก่อนเริ่มเลือกโมเดล classifier

### Image phase 1 dataset versioning checkpoint — 2026-07-23

- เพิ่ม `train`, `validation`, `test` split ใน manifest
- ใช้ `lot-hash-v1` deterministic strategy โดยจัดภาพจาก Lot เดียวกันให้อยู่ split เดียวกัน เพื่อลด data leakage ระหว่างภาพของการทดลองเดียวกัน
- เพิ่ม `splitCounts` ใน manifest
- เปลี่ยน Export manifest จาก GET เป็น POST เพื่อบันทึก export history ใน `users/{uid}/datasetExports/{exportId}` ก่อนคืนไฟล์ให้ผู้ใช้
- Export record เก็บ schema version, generatedAt, item IDs, split counts และ strategy โดยไม่คัดลอกข้อมูลลับหรือ token
- เพิ่ม integration test ตรวจว่า POST export สร้าง history record ใน Firestore emulator จริง
- Verification หลังแก้:
  - `npm run firebase:verify`: 48 files / 104 tests ผ่าน
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `git diff --check`: ผ่าน
- สถานะ: มี dataset manifest ที่ version ได้และแยกข้อมูลแบบป้องกัน leakage ระดับ Lot แล้ว แต่ยังไม่ได้ดาวน์โหลด/ถอดรหัสรูปเพื่อ preprocessing และยังไม่มี model training/inference
- ขั้นถัดไป: สร้าง preprocessing contract สำหรับ image dimensions, color normalization, orientation และ validation ก่อนเชื่อม image decoder จริง

### Image phase 1 preprocessing contract — 2026-07-23

- เพิ่ม `src/lib/domain/dataset-preprocessing.ts`
- ล็อก contract `image-preprocess-v1`:
  - target `224 × 224`
  - resize แบบ `contain`
  - color space `sRGB`
  - หมุนตาม EXIF ด้วย `exif-rotate`
  - normalize ค่า pixel เป็น `0..1`
  - รองรับ jpg/jpeg/png/webp ไม่เกิน 10 MB
- DatasetItem จาก media intake เก็บ width, height, format และ bytes จาก Firestore media metadata
- Exporter จะไม่รวมรายการที่ผ่าน review แต่ metadata ภาพไม่พร้อมสำหรับ preprocessing
- Manifest มีส่วน `preprocessing` เพื่อให้ขั้นตอนถัดไปใช้ contract เดียวกัน
- เพิ่ม unit tests สำหรับ metadata ที่ถูกต้องและ metadata ที่ไม่ปลอดภัย
- Verification หลังแก้:
  - `npm run firebase:verify`: 49 files / 106 tests ผ่าน
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `git diff --check`: ผ่าน
- สถานะ: preprocessing contract พร้อม แต่ยังไม่มีการดาวน์โหลด/ถอดรหัส/resize ภาพจริง และยังไม่มี model training/inference
- ขั้นถัดไป: เพิ่ม image decoder แบบ server-side หรือ worker ที่ทำตาม contract และสร้าง output artifact ที่ตรวจสอบซ้ำได้

### Image phase 1 server-side image decoder — 2026-07-23

- เพิ่ม direct dependency `sharp` สำหรับ server-side image decoding และ transformation
- เพิ่ม `src/lib/image/image-preprocessor.ts`:
  - ตรวจ metadata ก่อน download
  - อนุญาตเฉพาะ HTTPS Cloudinary URL เพื่อหลีกเลี่ยง arbitrary host/SSRF ใน worker นี้
  - decode ภาพด้วย Sharp และอ่าน EXIF orientation
  - resize เป็น 224×224 แบบ contain โดยเติมพื้นหลังสีขาว
  - encode output เป็น PNG
  - คืน output buffer, dimensions, bytes และ SHA-256 artifact hash
- เพิ่ม tests ที่ใช้ภาพ generated ใน memory ไม่เรียก external network:
  - decode/resize สำเร็จ
  - block host ที่ไม่อนุญาตก่อน fetch
  - fetch และ preprocess Cloudinary URL แบบ mocked
- ยังไม่ได้สร้าง API ที่เก็บ output artifact หรือ batch worker บน Cloudinary/Cloud Tasks; module นี้เป็น deterministic preprocessing building block ก่อน
- Verification หลังแก้:
  - `npm run firebase:verify`: 50 files / 109 tests ผ่าน
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `git diff --check`: ผ่าน
- สถานะ: image decoding/preprocessing ทำงานใน library แล้ว แต่ยังไม่มี classifier, training pipeline หรือ inference endpoint
- ขั้นถัดไป: สร้าง preprocessing job API ที่รับ export version, ประมวลผลทีละ item, เก็บ artifact metadata/status และ retry ได้โดยไม่ประมวลผลซ้ำ

### Image phase 1 preprocessing job API — 2026-07-23

- เพิ่ม `src/lib/image/preprocessing-job.ts` เป็น job runner ที่ประมวลผลทีละ DatasetItem
- job status: `queued`, `processing`, `completed`, `failed`
- เก็บ artifact metadata ต่อ item: status, PNG dimensions, bytes, SHA-256 และ error แบบไม่เปิดเผยข้อมูลลับ
- item ที่ decode ไม่ผ่านจะถูกบันทึกเป็น failed แต่ไม่หยุด item อื่นใน batch
- เพิ่ม `POST /api/dataset/preprocess`:
  - รับ export ID ที่ authenticated user เป็นเจ้าของ
  - โหลด item IDs จาก export record ฝั่ง server
  - จำกัดไม่เกิน 20 items ต่อ job เพื่อควบคุม serverless runtime
  - บันทึก job ใน `users/{uid}/preprocessingJobs`
  - รองรับ `retryOf` เพื่อเชื่อม retry กับ job เดิม
  - คืน HTTP 201 เมื่อสำเร็จทั้งหมด และ 207 เมื่อมีบาง item failed
- เพิ่ม tests สำหรับ mixed success/failure และ authentication route guard
- ยังไม่เก็บ binary output ลง Cloudinary/Storage; ตอนนี้เก็บเฉพาะ metadata/hash เพื่อยืนยัน preprocessing determinism
- Verification หลังแก้:
  - `npm run firebase:verify`: 52 files / 111 tests ผ่าน
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `git diff --check`: ผ่าน
- สถานะ: pipeline สามารถ decode/preprocess และบันทึก job status ได้ แต่ยังไม่มี artifact storage สำหรับนำ PNG ไปฝึกโมเดล
- ขั้นถัดไป: เพิ่ม storage ของ preprocessed artifact และหน้าแสดง job progress/retry ใน Image Review

### Image phase 1 Cloudinary preprocessed artifact storage — 2026-07-23

- เพิ่ม `src/lib/image/cloudinary-preprocessed-uploader.ts` สำหรับอัปโหลด PNG ที่ preprocess แล้วไป Cloudinary ด้วย signed upload ฝั่ง server
- ใช้ Cloudinary config/signature เดิมของระบบ และไม่ส่ง `CLOUDINARY_API_SECRET` ไป client
- ใช้ public ID แบบ deterministic `preprocessed-{datasetItemId}` เพื่อให้ retry ของ item เดิมไม่สร้างชื่อ artifact แบบสุ่มซ้ำซ้อน
- ขยาย artifact ใน preprocessing job ให้เก็บ `publicId` และ `secureUrl` เพิ่มจาก status, dimensions, bytes, SHA-256 และ error
- ปรับ `POST /api/dataset/preprocess` ให้ preprocess แล้วอัปโหลด artifact ต่อ item ก่อนบันทึกผล job
- เพิ่ม unit test สำหรับ signed Cloudinary upload โดย mock fetch และตรวจ endpoint, form data และ URL ที่คืนกลับ
- ถ้า upload รายการใดล้มเหลว รายการนั้นถูกบันทึกเป็น `failed` โดยไม่ทำให้รายการอื่นใน batch หยุดทั้งหมด
- Verification หลังแก้:
  - `npm run firebase:verify`: 53 files / 112 tests ผ่าน
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `git diff --check`: ผ่าน
- สถานะ: pipeline สามารถสร้าง PNG artifact และเก็บ URL/hash สำหรับนำไปตรวจหรือเตรียม dataset ต่อได้ แต่ยังไม่มี classifier, training pipeline, inference endpoint หรือหน้า job progress/retry
- ขั้นถัดไป: เพิ่มหน้าแสดง preprocessing job progress/retry ใน Dataset Review หรือเริ่มออกแบบ model-ready dataset export จาก artifact ที่ประมวลผลแล้ว

### Image phase 1 preprocessing job progress/retry UI — 2026-07-23

- เพิ่ม `GET /api/dataset/preprocess?limit=20` สำหรับโหลด preprocessing jobs ของผู้ใช้ที่ authenticated เท่านั้น
- เพิ่ม `src/components/dataset/preprocessing-jobs.tsx` แสดงสถานะ job, progress count, progress bar, จำนวน artifact ที่พร้อม/ล้มเหลว และลิงก์ Cloudinary เมื่อมี `secureUrl`
- เพิ่มปุ่ม retry สำหรับ job ที่มีรายการล้มเหลว โดยสร้าง export ใหม่และเชื่อม `retryOf` กับ job เดิมเพื่อรักษา audit trail
- เชื่อมหน้า `Image Review` ให้สร้าง export และเริ่ม preprocessing ได้จากปุ่มเดียว พร้อมโหลดสถานะ jobs ล่าสุด
- ปรับการดาวน์โหลด manifest ให้ใช้ JSON response จาก export API และยังคงสร้างไฟล์ดาวน์โหลดให้ผู้ใช้
- เพิ่ม responsive layout สำหรับมือถือ และตรวจไม่ให้เกิด horizontal overflow
- เพิ่ม route test สำหรับ authentication guard ของ GET jobs
- Sandbox verification:
  - demo mode เปิดหน้า Image Review สำเร็จ
  - desktop 1440px: ไม่มี horizontal overflow
  - mobile 390px: ไม่มี horizontal overflow
  - screenshot ตรวจแล้ว empty state และ navigation แสดงผลปกติ
- สถานะ: ผู้ใช้ authenticated สามารถดู job progress และ retry จาก Image Review ได้ แต่ยังไม่มี background queue จริง; API ปัจจุบันประมวลผลใน request เดียวและจำกัด 20 รายการต่อ job
- Verification หลังแก้:
  - `npm run firebase:verify`: 53 files / 113 tests ผ่าน
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `git diff --check`: ผ่าน
- ขั้นถัดไป: เพิ่ม model-ready dataset export ที่ใช้ preprocessed artifact โดยตรง หรือย้าย preprocessing ไป background queue เพื่อไม่ผูกกับ serverless request timeout

### Image phase 1 model-ready dataset export — 2026-07-23

- เพิ่ม `src/lib/domain/model-ready-exporter.ts` สำหรับสร้าง manifest `image-dataset-model-ready-v1`
- Model-ready manifest จะรวมเฉพาะรายการที่ผ่าน review/label และมี artifact ที่ preprocess สำเร็จครบ พร้อม `artifactUrl`, `artifactPublicId`, `artifactSha256` และ `sourceAssetUrl`
- ถ้า job ยังไม่ `completed`, artifact ขาด, หรือ item ใน job ไม่ตรงกับรายการ dataset ระบบจะหยุด export ด้วยสถานะ conflict แทนการสร้าง manifest ไม่สมบูรณ์
- เพิ่ม `POST /api/dataset/model-export` รับ `jobId`, ตรวจ owner scope, สร้างประวัติที่ `users/{uid}/modelExports/{exportId}` และคืน JSON สำหรับดาวน์โหลด
- เพิ่มปุ่ม `ดาวน์โหลด model-ready manifest` ใน preprocessing job ที่เสร็จสมบูรณ์
- เพิ่ม unit tests สำหรับ completed artifact และ incomplete job รวมถึง auth guard ของ API
- Sandbox หลังแก้ยังตรวจได้ว่า Image Review demo mode render ปกติและไม่มี horizontal overflow ที่ 390px/1440px
- Verification หลังแก้:
  - `npm run firebase:verify`: 55 files / 116 tests ผ่าน
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `git diff --check`: ผ่าน
- สถานะ: มี manifest ที่ชี้ไปยังภาพ preprocess แล้วและพร้อมส่งต่อเข้า training pipeline แต่ยังไม่มีการ train model หรือ inference endpoint
- ขั้นถัดไป: เพิ่ม background queue/worker สำหรับ batch ใหญ่ หรือเริ่มสร้าง training dataset connector และ validation report

### Image phase 1 training readiness report — 2026-07-23

- เพิ่ม `src/lib/domain/training-readiness.ts` สำหรับตรวจคุณภาพ model-ready manifest ก่อนส่งเข้า training
- รายงานตรวจ:
  - จำนวนภาพรวมและ split counts
  - จำนวนภาพต่อ class จาก scientific name + cultivar
  - duplicate artifact SHA-256 ระหว่างรายการ
  - class ที่ไม่มีตัวอย่างใน train split
  - train/validation/test split ที่ว่าง
- เพิ่ม `POST /api/dataset/training-report` ตรวจ owner/job/artifact ก่อนสร้างรายงาน
- บันทึกประวัติใน `users/{uid}/trainingReports/{reportId}` และดาวน์โหลด JSON จากหน้า Image Review
- ปุ่มใหม่ใน job ที่ completed: `ตรวจความพร้อมฝึกโมเดล`
- รายงานที่มี warning จะไม่ถูกแสดงเป็น ready และระบบจะแจ้งจำนวนจุดที่ต้องตรวจ
- เพิ่ม unit tests สำหรับ class count, split warning และ authentication guard
- Sandbox verification:
  - Image Review demo mode render สำเร็จ
  - desktop และ mobile ไม่มี horizontal overflow
- Verification หลังแก้:
  - `npm run firebase:verify`: 57 files / 118 tests ผ่าน
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `git diff --check`: ผ่าน
- สถานะ: ระบบตรวจความพร้อมของ dataset ก่อนฝึกได้แล้ว แต่ยังไม่มี model training, inference หรือ background queue
- ขั้นถัดไป: เพิ่ม background queue/worker สำหรับ preprocessing batch ใหญ่ หรือเชื่อม external training pipeline หลัง dataset พร้อม

### Knowledge library foundation — 2026-07-23

- ล็อก product direction ใหม่: Philodendron Lab จะเป็นห้องสมุดความรู้พืช + taxonomy catalog + evidence library + tissue-culture playbook ไม่ใช่เฉพาะเครื่องมือบันทึกการทดลอง
- เริ่ม schema ให้รองรับพืชทุกวงศ์ แต่ seed ข้อมูลตั้งต้นเฉพาะ Araceae/Philodendron
- เพิ่ม `src/lib/domain/knowledge-library.ts`:
  - `TaxonRecord` แยก family, genus, species, cultivar, hybrid และ trade-name
  - `KnowledgeClaim` แยกหมวด taxonomy, biology, ecology, toxicity, propagation, tissue-culture และ identification
  - `TissueCulturePlaybook` ผูกชนิดพืชกับวิธีทดลองและ protocol version
  - `KnowledgeLibraryRecord` เป็น aggregate สำหรับหน้า knowledge detail ในอนาคต
- seed catalog ปัจจุบันมี Araceae, Philodendron, P. erubescens, Pink Princess, P. bipennifolium และ Violin variegated โดยยังติด `Pending review` และยังไม่เติม claim ทางชีววิทยาโดยไม่มี source
- เพิ่มตัวค้น taxon จาก scientific name, display name, synonym และ common name
- ล็อก workflow ระยะยาว:
  - image processing เสนอ candidate
  - ผู้ใช้ยืนยันชนิด
  - ระบบค้น source จาก Crossref/OpenAlex/PubMed และ URL/DOI ที่ผู้ใช้เพิ่ม
  - สกัด claims พร้อม reference/evidence state
  - สร้าง SOP draft และให้ผู้ใช้ review/approve
  - ต้นที่ 2/3 ชนิดเดียวกันใช้ SOP version เดิม แต่สร้าง Plant/Lot และ snapshot แยก
- ยังไม่มี automated source discovery, knowledge UI หรือ image classifier จริงใน checkpoint นี้
- Verification หลังแก้:
  - `npm run firebase:verify`: 58 files / 120 tests ผ่าน
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `git diff --check`: ผ่าน
- ขั้นถัดไป: สร้าง Firestore repository และหน้า Knowledge Library สำหรับค้น taxonomy ก่อนเชื่อม source ingestion

### Knowledge Library MVP — 2026-07-23

- เพิ่ม `KnowledgeLibraryRepository` พร้อม memory repository และ Firestore repository แบบ owner-scoped
- Firestore path สำหรับ catalog คือ `users/{uid}/knowledgeTaxa/{taxonId}` และถ้ายังไม่มีข้อมูลจะใช้ starter taxonomy ที่ติด `Pending review` เป็น fallback แบบอ่านอย่างเดียว
- เพิ่มหน้า `/knowledge` และ navigation item `Knowledge`
- หน้า Knowledge Library รองรับ:
  - ค้น scientific name, display name, synonym และ common/trade name
  - แสดง hierarchy parent, rank, source count และ evidence state
  - แสดง biology claims และ tissue-culture playbooks เมื่อมีข้อมูลที่ review แล้ว
  - แสดง empty state และข้อความชัดเจนเมื่อยังไม่มี source/claim/playbook
- เพิ่ม responsive layout สำหรับ desktop/mobile และไม่แสดงข้อมูลชีววิทยาที่ไม่มี source เป็นข้อเท็จจริง
- เพิ่ม tests สำหรับ repository owner scope และ Knowledge Library rendering
- Sandbox verification:
  - `/knowledge` demo mode โหลด taxonomy ได้และพบ Pink Princess
  - desktop: viewport 1280px, ไม่มี horizontal overflow
  - mobile: viewport 390px, ไม่มี horizontal overflow
- Verification หลังแก้:
  - `npm run firebase:verify`: 60 files / 122 tests ผ่าน
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `git diff --check`: ผ่าน
- สถานะ: มี knowledge catalog/search foundation แล้ว แต่ยังไม่มี source ingestion, claim review UI, image candidate matching หรือการสร้าง SOP จาก claims
- ขั้นถัดไป: เพิ่ม source registry และ evidence claim ingestion/review ก่อนเชื่อม automated SOP drafting

### Knowledge source registry and claim review — 2026-07-23

- เพิ่ม `KnowledgeSource` และ `SourceClaim` domain model แยก source metadata ออกจาก claim ที่สกัด/เขียนจาก source
- Source รองรับ journal, book, database, website และ user note พร้อม URL, DOI, authors, publication date, license และ notes
- Claim รองรับ taxon, category, statement, evidence state และ review state
- เพิ่ม memory/Firestore repository แบบ owner-scoped:
  - `users/{uid}/knowledgeSources/{sourceId}`
  - `users/{uid}/sourceClaims/{claimId}`
- เพิ่ม Source Registry UI ใน `/knowledge` สำหรับลงทะเบียน DOI/URL
- เพิ่ม Claim Review UI สำหรับสร้าง claim แบบ `Pending review` และ approve/reject พร้อม reviewer note
- ระบบไม่เลื่อน claim เป็น `Verified` โดยอัตโนมัติ และยังไม่มี web crawler/AI extraction ใน checkpoint นี้
- Sandbox verification:
  - Source Registry แสดงใน demo mode
  - Pink Princess แสดงใน taxonomy selector
  - desktop 1280px และ mobile 390px ไม่มี horizontal overflow
- Verification หลังแก้:
  - `npm run firebase:verify`: 61 files / 123 tests ผ่าน
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `git diff --check`: ผ่าน
- สถานะ: ผู้ใช้สามารถเก็บ source และ review claim ได้แล้ว แต่ยังต้องเพิ่ม source discovery จาก Crossref/OpenAlex/PubMed และตัวสร้าง SOP draft
- ขั้นถัดไป: เพิ่ม source ingestion adapter และ import metadata จาก DOI/URL ก่อนสร้าง claim draft

### Source discovery adapter — 2026-07-23

- เพิ่ม identifier utilities สำหรับ normalize DOI และอ่าน PubMed/OpenAlex work ID จาก URL
- เพิ่ม `POST /api/knowledge/source-discovery` แบบ authenticated server-side lookup
- รองรับ provider ในรอบนี้:
  - Crossref จาก DOI หรือ doi.org URL
  - PubMed จาก PubMed URL
  - OpenAlex จาก OpenAlex work URL
- API คืนเฉพาะ metadata draft: provider, title, URL, DOI, authors, publication date และ source type
- จำกัด input ให้เป็น DOI/PubMed/OpenAlex identifier เพื่อป้องกัน arbitrary URL fetch/SSRF
- เพิ่มปุ่ม `ดึง metadata` ใน Source Registry เพื่อเติมฟอร์มให้ผู้ใช้ตรวจ ก่อนกดบันทึก source
- metadata ที่ดึงได้ยังไม่สร้าง claim และยังไม่เป็น Verified อัตโนมัติ
- เพิ่ม tests สำหรับ identifier parsing และ authentication guard
- Sandbox verification:
  - ปุ่ม Source discovery แสดงใน Knowledge Library
  - desktop 1280px และ mobile 390px ไม่มี horizontal overflow
- Verification หลังแก้:
  - `npm run firebase:verify`: 63 files / 126 tests ผ่าน
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `git diff --check`: ผ่าน
- สถานะ: ระบบนำ DOI/URL ที่รองรับมาเติม metadata ได้แล้ว แต่ยังไม่มี full-text extraction, claim draft อัตโนมัติ หรือ source deduplication
- ขั้นถัดไป: เพิ่ม source deduplication และ claim draft workflow จาก metadata/full text ที่ผู้ใช้อนุญาต

### Source deduplication and claim draft labeling — 2026-07-23

- เพิ่ม `canonicalSourceUrl` เพื่อลบ fragment, tracking parameters กลุ่ม `utm_*`, ปรับตัวพิมพ์ และตัด slash ท้าย URL ก่อนเปรียบเทียบ
- เพิ่ม `isDuplicateSource` ให้ตรวจ DOI ที่ normalize แล้วก่อนบันทึก และใช้ canonical URL เป็น fallback
- Memory repository และ Firestore repository ปฏิเสธ source ซ้ำด้วย error `Source already registered` เพื่อป้องกัน registry มีรายการเดิมหลายครั้ง
- เพิ่ม regression tests สำหรับ URL ซ้ำ, DOI ซ้ำ และ URL ที่มี tracking parameter
- ปรับข้อความหลังบันทึก claim ให้ระบุว่าเป็น `claim draft` และ `Pending review`; ระบบยังไม่มี automatic full-text/AI extraction และไม่เลื่อน evidence เป็น Verified เอง
- Verification:
  - `npm run firebase:verify`: 64 files / 129 tests ผ่าน
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `git diff --check`: ผ่าน (มีเพียงคำเตือน line ending จาก Git บน Windows)
- Sandbox check: เปิด local `/knowledge` ได้ แต่ session ใน browser sandbox ค้างที่ Firebase session loading เนื่องจาก local environment ไม่มี Firebase configuration จึงตรวจ visual state ผ่าน browser runtime ไม่จบในรอบนี้; ได้ตรวจ route/build และ component/repository tests แทน ไม่อ้างว่า sandbox flow สำเร็จ
- สถานะ: source registry กัน DOI/URL ซ้ำแล้ว และ claim ถูกระบุเป็น draft อย่างโปร่งใส
- ขั้นถัดไป: เพิ่ม source list/duplicate warning ที่เห็นก่อน submit และออกแบบ full-text/claim extraction แบบ user-approved ก่อนเชื่อม AI

### Source list and duplicate warning UI — 2026-07-23

- เพิ่มรายการ `Registered Sources` ในหน้า `/knowledge` แสดงชื่อ source, ประเภท, DOI และลิงก์เปิดแหล่งข้อมูล
- เพิ่ม client-side duplicate warning ทันทีเมื่อ URL/DOI ที่กรอกซ้ำกับ source เดิม
- ปุ่มบันทึก source ถูก disable เมื่อพบรายการซ้ำ และยังคงมี repository-side guard เป็นชั้นป้องกันที่สอง
- ปรับ Source Registry และ Claim form ให้ใช้คำว่า `claim draft` ชัดเจน
- เพิ่ม responsive CSS สำหรับ source rows และ long Thai/source titles
- เพิ่ม component regression test ตรวจ source list และ claim draft wording
- Verification:
  - `npm run firebase:verify`: 65 files / 130 tests ผ่าน
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
- Sandbox check: local browser route ยังติดสถานะ Firebase session loading เพราะไม่มี Firebase configuration ใน environment ของ sandbox; จึงไม่สามารถยืนยัน visual state ผ่าน authenticated/demo UI ได้ในรอบนี้ และบันทึกไว้เป็น known limitation
- สถานะ: source registry แสดงรายการเดิมและแจ้งเตือนซ้ำก่อน submit แล้ว
- ขั้นถัดไป: เพิ่ม source detail/metadata edit และเริ่ม workflow สร้าง claim draft จาก full text ที่ผู้ใช้เลือกและอนุญาต

### Authorized evidence excerpt for claim drafts — 2026-07-23

- เพิ่ม `evidenceExcerpt` ใน `SourceClaim` แบบ optional เพื่อรองรับข้อมูลเก่าที่อาจยังไม่มี excerpt
- Claim ใหม่ต้องมีข้อความจาก source ที่ไม่ว่าง มิฉะนั้น repository จะปฏิเสธด้วย `Evidence excerpt required`
- หน้า Knowledge เพิ่มช่องวาง excerpt/full-text summary และ checkbox ยืนยันว่าผู้ใช้มีสิทธิ์ใช้ข้อความดังกล่าว
- ระบบยังไม่ทำ automatic full-text extraction และไม่ส่งข้อมูลไป AI; ผู้ใช้เป็นผู้เลือกและเขียน claim draft เอง
- Claim ใหม่ยังคงเริ่มที่ `Pending review` และไม่ถูกนำไปแสดงเป็น Verified ก่อน reviewer approve
- เพิ่ม regression test สำหรับการปฏิเสธ claim ที่ไม่มี evidence excerpt
- Verification:
  - `npm run firebase:verify`: 65 files / 131 tests ผ่าน
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
- Sandbox check: local browser ยังติด Firebase session loading เมื่อไม่มี Firebase configuration จึงไม่สามารถยืนยันหน้า authenticated/demo ด้วย browser ได้ในรอบนี้; route compile และ tests ผ่าน และข้อจำกัดถูกบันทึกไว้
- สถานะ: claim draft มีหลักฐานประกอบและ consent gate แล้ว
- ขั้นถัดไป: เพิ่ม source detail/edit และจัดเก็บตำแหน่งอ้างอิง เช่น page/section/table ของ excerpt

### Evidence location for claim review — 2026-07-23

- เพิ่ม `evidenceLocation` ใน `SourceClaim` แบบ optional เพื่อรองรับข้อมูลเก่า
- Claim ใหม่ต้องระบุตำแหน่งหลักฐาน เช่น `p. 4, Table 2`, `Results ย่อหน้า 3` หรือ `URL#section`
- เพิ่มช่อง `ตำแหน่งหลักฐาน` ใน Claim draft form
- แสดงตำแหน่งหลักฐานในรายการ Claims รอตรวจ เพื่อช่วย reviewer ตรวจย้อนกลับ
- Memory และ Firestore repository ตรวจทั้ง excerpt และ evidence location ก่อนบันทึก
- เพิ่ม regression coverage สำหรับ claim ที่ไม่มี excerpt และ claim ที่ไม่มี location
- Verification:
  - `npm run firebase:verify`: 65 files / 131 tests ผ่าน
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
- Sandbox check: local browser ยังค้างที่ Firebase session loading เนื่องจากไม่มี Firebase configuration; ได้บันทึก known limitation ไว้ และไม่อ้างว่า authenticated UI ผ่าน sandbox
- สถานะ: claim draft มีข้อความหลักฐาน, ตำแหน่งอ้างอิง และ consent gate ครบ
- ขั้นถัดไป: เพิ่ม source detail/edit และลิงก์ review จาก claim กลับไปยัง source metadata

### Source detail, metadata edit และ linked claims — 2026-07-23

- เพิ่ม route `/knowledge/sources/[sourceId]` สำหรับเปิดรายละเอียด source รายตัว
- เพิ่มหน้าแก้ไข metadata ได้แก่ title, URL, DOI, source type, authors, published date, license และ notes
- เพิ่ม `updateSource` ใน KnowledgeSourceRepository ทั้ง Memory และ Firestore
- ป้องกัน source identity เปลี่ยนระหว่างแก้ไข และตรวจ DOI/URL ซ้ำโดยไม่นับ source ตัวเอง
- เพิ่ม test ยืนยันว่า metadata update คง `id` และ `createdAt` เดิม
- จาก source registry เพิ่มลิงก์ `ดูรายละเอียด` และลิงก์เปิดต้นฉบับแยกกัน
- หน้า detail แสดง claims ที่อ้าง source นั้น พร้อม review state, evidence excerpt, evidence location และ evidence state
- เพิ่มลิงก์จาก claim กลับไปยัง claim review ใน Knowledge Library
- เพิ่ม missing/error/loading state สำหรับ source detail และรักษา owner repository boundary เดิม
- Verification:
  - `npm run firebase:verify`: 65 files / 132 tests ผ่าน
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน และมี route `/knowledge/sources/[sourceId]`
  - `git diff --check`: ผ่าน
- Sandbox check: local browser ยังติด Firebase session loading เนื่องจากไม่มี Firebase configuration; ไม่อ้างว่า authenticated/demo UI ผ่าน sandbox และข้อจำกัดนี้ยังคงเป็น known limitation
- สถานะ: source metadata แก้ไขได้โดยไม่ทำลาย identity และ reviewer เห็นหลักฐานที่เชื่อมกับ source เดียวกันได้
- ขั้นถัดไป: ทำ claim review deep-link ให้เลือก claim จาก query string ได้จริง และเพิ่ม audit event สำหรับการแก้ source metadata

### Claim deep-link และ source metadata audit — 2026-07-23

- เพิ่ม deep-link จาก source detail ไปยัง `/knowledge?claim={claimId}`
- Knowledge Library อ่าน claim id หลัง mount และส่งเข้า Source Registry
- claim ที่ตรงกับ deep-link จะมี anchor id, highlight และ focus style เพื่อให้ reviewer หาได้ทันที
- เพิ่ม `KnowledgeSourceAuditEvent` สำหรับ `created` และ `updated`
- Memory repository เก็บ audit source ตาม source id และ Firestore เก็บใน `knowledgeSources/{sourceId}/auditEvents`
- `createSource` และ `updateSource` บันทึก before/after snapshot ตามเหตุการณ์
- Source detail แสดงประวัติ metadata พร้อมเวลาและ before/after แบบ expandable
- เพิ่ม regression test ว่า source update คง identity และสร้าง audit sequence `created`, `updated`
- แก้ Next.js build issue จาก `useSearchParams` โดยอ่าน query หลัง mount เพื่อคง static route behavior
- Verification:
  - `npm run firebase:verify`: 65 files / 132 tests ผ่าน
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน และมี route `/knowledge/sources/[sourceId]`
  - `git diff --check`: ผ่าน
- Sandbox check: Firebase emulator ผ่านครบ; authenticated browser sandbox ยังติด session loading เมื่อไม่มี local Firebase configuration จึงยังไม่อ้างว่า UI cloud session ผ่าน
- สถานะ: reviewer เปิด claim ที่เจาะจงจาก source detail ได้ และแก้ metadata ย้อนตรวจ audit ได้
- ขั้นถัดไป: เพิ่ม source/claim audit เข้า unified research timeline และเริ่ม source-to-taxon claim summary ใน Knowledge Library

### Unified research activity และ taxon claim summary — 2026-07-23

- เพิ่ม `KnowledgeResearchTimeline` ในหน้า Knowledge Library
- timeline รวม source registration, source metadata update, claim draft creation และ claim review ใน feed เดียว
- จำกัด feed ล่าสุด 12 เหตุการณ์และเรียงจากใหม่ไปเก่า พร้อม state label และเวลา
- Knowledge Library รับ source claims และ sources เพิ่มเติมจาก repository เดิม
- หน้า taxon แสดงจำนวน claims รวมทั้ง claims ที่อยู่ใน library และ claim drafts/reviews ที่เชื่อมกับ taxon
- แสดงชื่อ source และ review state ของ source claim ใต้ claim ที่เกี่ยวข้อง
- แก้จำนวน sources ให้รวม source ที่ถูกอ้างผ่าน source claim เมื่อ taxon record ยังไม่มี sourceIds ครบ
- ไม่ยกระดับ claim draft เป็น Verified อัตโนมัติ; evidence/review state เดิมยังแสดงตามข้อมูลจริง
- Verification:
  - `npm run firebase:verify`: 65 files / 132 tests ผ่าน
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `git diff --check`: ผ่าน
- Sandbox check: Firebase emulator ผ่านครบ; authenticated browser sandbox ยังมี known limitation เรื่อง Firebase session loading เมื่อไม่มี local configuration
- สถานะ: ผู้ใช้ค้น taxon แล้วเห็น claim summary และ activity ของ source/claim ในหน้าเดียว
- ขั้นถัดไป: เพิ่มการกรอง timeline ตาม taxon/source และทำ claim review audit แบบ persisted ไม่ใช่เพียง derived activity

### Timeline filters และ persisted claim review audit — 2026-07-24

- เพิ่มตัวกรอง activity timeline ตาม `Source` และ `Taxon`
- Timeline ใช้ claim audit ที่โหลดจาก repository เพื่อแสดงเหตุการณ์สร้าง claim และ review claim แบบ persisted
- เพิ่ม `SourceClaimAuditEvent` พร้อม action `created` และ `reviewed`
- Memory repository เก็บ claim audit ต่อ claim และ Firestore เก็บใน `sourceClaims/{claimId}/auditEvents`
- การสร้างและ review claim บันทึก before/after snapshot พร้อม sourceId และ taxonId
- หน้า Knowledge โหลด audit ของ claims ทั้งหมดและส่งเข้า timeline
- เพิ่ม test ยืนยัน claim audit sequence `created`, `reviewed`
- Legacy claims ที่ยังไม่มี audit collection ยังคงอ่านได้ และจะแสดงเฉพาะ activity ที่มีจริง
- Verification:
  - `npm run firebase:verify`: 65 files / 132 tests ผ่าน
  - `npm run lint`: ผ่านแบบไม่มี warning
  - `npm run build`: ผ่าน
  - `git diff --check`: ผ่าน
- Sandbox check: Firebase emulator ผ่านครบ; authenticated browser sandbox ยังมี known limitation เรื่อง Firebase session loading เมื่อไม่มี local configuration
- สถานะ: reviewer กรอง activity ตามแหล่งอ้างอิง/ชนิดพืช และตรวจประวัติ claim review แบบถาวรได้
- ขั้นถัดไป: เพิ่ม audit viewer แบบเจาะ source/taxon และเชื่อม claim ที่ Approved เข้า playbook/protocol โดยไม่ข้าม evidence gate

### Audit viewer และ Approved claim → playbook draft gate — 2026-07-24

- เพิ่ม domain gate `canCreatePlaybookDraft` ตรวจ source, `Approved` review state, evidence excerpt และ evidence location
- เพิ่ม `createPlaybookDraftInput` เพื่อสร้าง seed ที่คง evidence state และ reference ไปยัง claim/source
- เพิ่ม `createDraftFromClaim` ใน Memory และ Firestore protocol repository
- Draft ที่สร้างจาก claim มี status `Draft`, version ยัง `publishedAt: null` และบันทึก claim/source references
- เพิ่ม protocol audit action `created_from_claim`
- เพิ่ม `KnowledgeAuditViewer` แยกจาก timeline สำหรับกรอง Source/Taxon และดู before/after
- เพิ่มปุ่ม `สร้าง playbook draft` เฉพาะ claim ที่ `Approved`; claim อื่นไม่แสดงปุ่ม
- เชื่อม action ไปยัง protocol detail ของ draft ใหม่ โดยไม่ publish อัตโนมัติ
- เพิ่ม test-first coverage:
  - Approved claim gate ผ่าน/ไม่ผ่าน
  - Memory/Firestore draft creation และ unpublished state
  - audit viewer rendering
  - Approved-only UI action
- Verification:
  - `npm run firebase:verify`: 67 files / 137 tests ผ่าน
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `git diff --check`: ผ่าน
- Sandbox/emulator: Firebase Auth/Firestore emulator ผ่านครบ; browser authenticated sandbox ยังมี known limitation เรื่อง Firebase session loading เมื่อไม่มี local configuration
- สถานะ: evidence ที่ Approved แล้วสามารถเริ่ม playbook draft ได้อย่างมี traceability และ audit viewer แยกกรองได้
- ขั้นถัดไป: เพิ่ม protocol detail แสดง claim/source provenance และเพิ่ม explicit gate ก่อน publish playbook draft

### Merge feature/protocol-media-navigation เข้า master — 2026-07-24

- ผู้ใช้เลือก merge งานกลับเข้า `master` แบบ local merge
- แก้ merge conflicts ใน `handoff.md`, Plant navigation, `MediaStrip` และ dataset exporter โดยคงทั้ง legacy exporter และ dataset manifest ใหม่ไว้ร่วมกัน
- คง Plant Record workflow สำหรับผู้เริ่มต้นที่ `/plants` และเมนู `Knowledge` / `Image review` ใน app shell
- คง lightbox ที่รองรับ `Escape`, focus และ soft-delete/restore รวมถึง dataset intake action
- Verification หลัง merge:
  - `npm test -- --run`: 66 test files ผ่าน, 4 integration suites ถูก skip เมื่อไม่ได้เปิด emulator; 134 tests ผ่าน
  - `npm run firebase:verify`: 70 test files / 144 tests ผ่านครบด้วย Auth + Firestore emulator
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `git diff --check`: ผ่าน
- แก้ dependency workspace ที่ขาดโดยรัน `npm install --no-audit --no-fund`; package manifest และ lockfile มี `@firebase/rules-unit-testing` อยู่แล้ว
- Known limitation เดิมยังคงอยู่: browser sandbox ที่ไม่มี Firebase configuration อาจค้างที่ session loading; emulator verification ผ่านครบแล้ว
- สถานะ: merge พร้อม commit ใน `master`; ยังไม่ได้ push production ตามตัวเลือก merge local

### Philodendron Knowledge Base และ Detailed Manual — 2026-07-24

- เพิ่ม domain knowledge รุ่นแรกสำหรับ Philodendron โดยแยก Araceae → Philodendron → species → cultivar/trade-name
- เพิ่ม taxonomy snapshot จาก Kew POWO/WCVP: 151 accepted genera ใน Araceae และ 629 accepted Philodendron species ณ วันที่ 2026-07-24; จำนวนเป็น snapshot ไม่ใช่จำนวน cultivar/trade-name ถาวร
- เพิ่ม source register สำหรับ Kew POWO, Pink Princess tissue-culture papers ปี 2023/2025 และ Violin evidence gap
- เพิ่ม monograph 4 หมวดสำหรับ Pink Princess และ Violin: Taxonomy, Biology, Identification, Tissue culture
- เพิ่ม guided tissue-culture manual 18 ขั้น ครอบคลุมการรับต้น, กักต้น, เลือกข้อ, ตำแหน่งตัด, ตู้/อุปกรณ์, อาหาร, ฟอก, ลงอาหาร, contamination, multiplication, rooting, acclimatization, ลายด่าง, troubleshooting, evidence review, export และปิด Lot
- Pink Princess ระบุผลจากงานตรงพันธุ์เป็น `Verified` เฉพาะ claim ที่มี source; workflow รวมยังเป็น `Adapted` และต้อง validate กับห้องทดลองจริง
- Violin variegated ถูกเก็บเป็น trade-name ใต้ `Philodendron bipennifolium` และ protocol ทั้งหมดเริ่มที่ `Experimental`/`Adapted` เนื่องจากยังไม่มีหลักฐานตรงพันธุ์ในฐานข้อมูล
- เพิ่ม route `/knowledge/taxa/[taxonId]` สำหรับอ่าน monograph และปุ่มเริ่ม Plant Record พร้อม prefill แบบไม่ยกระดับความมั่นใจอัตโนมัติ
- Knowledge Library เชื่อมลิงก์ไปยัง taxon detail และยังคง source/claim/audit workflow เดิม
- เพิ่ม Markdown handoff/manual ใน `docs/philodendron/`
- Verification:
  - `npm test -- --run`: 68 files / 139 tests ผ่าน, 4 integration suites skip เมื่อไม่ได้เปิด emulator
  - `npm run firebase:verify`: 72 files / 149 tests ผ่านด้วย Auth + Firestore emulator
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน และมี route `/knowledge/taxa/[taxonId]`
  - `git diff --check`: ผ่าน; มีเฉพาะคำเตือน line ending ของ Windows
  - HTTP sandbox: `/`, `/knowledge`, Pink Princess taxon detail และ Violin taxon detail ตอบ HTTP 200
- Browser CLI `agent-browser` ไม่มีใน environment นี้ จึงตรวจ route ผ่าน local HTTP/server response แทน และไม่อ้างว่า visual browser automation ผ่าน
- เพิ่ม `scripts/import-philodendron-wcvp.mjs` และ generated catalog จาก WCVP v15 ที่กรอง accepted Philodendron species ได้ 628 records; เก็บ source/version แยกจาก POWO page snapshot ที่แสดง 629
- สถานะ: คู่มือและหน้าออนไลน์รุ่นแรกพร้อมตรวจ review; taxonomy catalog รุ่นแรกมี accepted species records จาก WCVP v15 แล้ว แต่ monograph ละเอียดยังมีเฉพาะ Pink Princess และ Violin
- ขั้นถัดไป: ตรวจความต่าง 628/629 กับ WCVP/POWO รอบถัดไป แล้วค่อยเพิ่ม monograph ชนิดอื่นตามหลักฐาน

### ติดตั้ง agent-browser CLI — 2026-07-24

- ติดตั้ง `agent-browser` แบบ global เวอร์ชัน `0.33.0`
- ตรวจคำสั่งด้วย `agent-browser --version` สำเร็จ
- เปิด local dev server ที่ `http://127.0.0.1:3000/knowledge` ด้วย agent-browser สำเร็จ
- ตรวจ URL ปัจจุบันและสร้าง screenshot ที่ `C:\Users\HP\Documents\Codex\2026-07-22\knowledge-browser-check.png`
- Visual check พบหน้า Firebase setup gate ตามที่ออกแบบไว้ เมื่อ local environment ยังไม่มี Firebase configuration; ไม่ใช่ runtime crash
- ขั้นต่อไป: ใช้ agent-browser ตรวจ responsive, keyboard, focus, long Thai text และ taxon detail หลังเติม environment หรือใช้ emulator configuration

### Agent-browser UI verification และแก้ contrast — 2026-07-24

- ตรวจ `/knowledge` ด้วย `agent-browser` ที่ viewport 390, 1024 และ 1440 px; สร้าง screenshot สำหรับแต่ละขนาด
- เปิด demo mode แล้วตรวจ Knowledge Library จาก accessibility snapshot พบรายการ Philodendron และ evidence labels แสดงผลจริง
- เปิด Taxon Detail ของ Pink Princess สำเร็จที่ `/knowledge/taxa/cultivar-pink-princess`
- ตรวจ keyboard focus ด้วยการกด Tab และตรวจ `document.activeElement`; focus เคลื่อนไปยัง link/button ได้
- ตรวจ reduced-motion และ horizontal overflow ที่ 390 px; `scrollWidth` เท่ากับ viewport width
- axe audit รอบแรกพบ color-contrast violation ใน mobile navigation, sign-out, breadcrumb และ eyebrow
- ปรับ `--muted` และ `--faint` ใน `src/app/globals.css` ให้ผ่าน WCAG AA; audit รอบสองไม่พบ violation เหลือเพียง incomplete จาก gradient ของ Firebase setup gate
- Verification หลังแก้:
  - `npm run lint`: ผ่าน
  - `npm test -- --run`: 68 files / 140 tests ผ่าน, 4 suites skip โดยไม่เปิด emulator
  - `npm run build`: ผ่าน และมี route Taxon Detail
  - `npm run firebase:verify`: 72 files / 150 tests ผ่านด้วย Auth + Firestore emulator
- สถานะ: UI verification รุ่นนี้ผ่านและแก้ accessibility contrast แล้ว; ยังต้องทดสอบ authenticated Firebase flow เมื่อ environment จริงพร้อม

### ตรวจ Violin และเส้นทางเริ่ม Plant Record — 2026-07-24

- เปิด Knowledge Library ใน demo mode และเลือก `Violin variegated` สำเร็จ
- เปิด Taxon Detail ที่ `/knowledge/taxa/trade-name-violin-variegated` สำเร็จ
- ตรวจพบชื่อแสดงเป็น `Philodendron bipennifolium ‘Violin’ variegated` และ evidence state เป็น Experimental ตามข้อกำหนด
- ตรวจว่าคู่มือมี 4 หมวดและ 18 ขั้นเหมือน Pink Princess แต่ไม่ยกระดับหลักฐานของ Violin เป็น Verified
- กด `เริ่ม Plant Record` สำเร็จ และระบบนำไป `/plants/new?taxon=trade-name-violin-variegated`
- ตรวจ prefill สำเร็จ: suspected species เป็น `Violin variegated` และ confidence เป็น `Low`
- สถานะ: เส้นทางค้นหา → taxon detail → Plant Record ใช้งานได้ใน demo mode; authenticated Firebase flow ยังรอ environment จริง

### เพิ่มตารางสูตรอาหารใน Monograph — 2026-07-24

- เพิ่ม `MediaRecipe` ใน domain model สำหรับ Establishment, Multiplication และ Rooting
- แต่ละสูตรมี evidence state, source IDs, pH เป้าหมาย, note และ batch volumes 100/250/500/1,000 mL
- แสดงส่วนประกอบ MS, sucrose, agar และฮอร์โมนเป็นค่าต่อลิตร พร้อมคำนวณปริมาณตาม batch ในหน้าเว็บ
- ระบุชัดว่าปริมาณฮอร์โมนต้องใช้ stock solution และค่าตารางเป็นจุดตั้งต้น ไม่ใช่การรับรองทุกห้องทดลอง
- Pink Princess: ตารางเต็มเป็น Adapted; claim BAP 1.0 mg/L และ IBA 3.0 mg/L ยังคง Verified เฉพาะตามงานวิจัยที่อ้าง
- Violin: ตารางทั้งหมดคงสถานะ Experimental/Adapted เนื่องจากยังไม่มี protocol ตรงพันธุ์
- ตรวจ agent-browser ที่ 390 px แล้วพบตารางอ่านได้ผ่าน horizontal table wrapper และไม่มี page overflow
- Verification:
  - targeted domain/component tests: 6 passed
  - `npm run lint`: ผ่าน
  - `npm test -- --run`: 68 files / 140 tests ผ่าน
  - `npm run build`: ผ่าน
  - `npm run firebase:verify`: 72 files / 150 tests ผ่าน

### เพิ่มคู่มือตำแหน่งตัดและการฟอก — 2026-07-24

- เพิ่ม `ExplantGuide` แยกตาม Pink Princess และ Violin variegated
- คู่มือแสดงเป้าหมาย explant, แผนผังตำแหน่งตัด, ขนาดก่อนฟอก/หลังฟอก และข้อควรเลือกบนต้นแม่
- Pink Princess: แนะนำเก็บยอด+ข้อ/ตาข้าง; ขนาดก่อนฟอกประมาณ 40–60 mm และหลังฟอกประมาณ 20–30 mm
- Violin: แนะนำเก็บยอด/ข้อที่มีตาข้างชัด; ขนาดก่อนฟอกประมาณ 40–60 mm และหลังฟอกประมาณ 15–25 mm
- เพิ่มตาราง trial ฟอกแบบ `Experimental` พร้อม active chlorine, เวลา และจำนวนรอบล้าง; ไม่มีค่าชุดใดถูกแสดงเป็น Verified
- เพิ่ม safety notes เรื่อง active chlorine, การห้ามผสมสาร และการล้างด้วยน้ำปลอดเชื้อ
- Agent-browser ตรวจหน้า Pink Princess ที่ 390 px พบ overflow จากตารางฟอก (`scrollWidth 595`) แล้วแก้ด้วย `min-width: 0` และ table wrapper; ตรวจซ้ำเหลือ `scrollWidth 390`
- Verification หลังแก้:
  - targeted tests: 6 passed
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `npm run firebase:verify`: 72 files / 150 tests ผ่าน
- สถานะ: คู่มือมีรายละเอียดตำแหน่งตัดและ trial ฟอกสำหรับทั้งสองต้นแล้ว แต่ค่าฟอกยังเป็น Experimental/Adapted ต้อง validate กับต้นจริงและผลิตภัณฑ์ที่ใช้จริง

### เชื่อม Taxon/Plant Record ไป Experiment Lot — 2026-07-24

- ปรับหน้า `/experiments/new` ให้โหลด Plant Record เมื่อเข้าด้วย `?plantId=`
- ส่งชื่อพืชจาก Plant Record เข้า Lot Form และแสดงข้อความแนะนำสำหรับผู้เริ่มต้น
- แนะนำ template อัตโนมัติจากชื่อที่บันทึก: Pink Princess, Violin หรือ Generic Philodendron fallback
- ปรับตัวเลือก `คู่มือเริ่มต้น` ให้เป็น controlled select และแสดง evidence state ของ template
- ยังให้ผู้ใช้เปลี่ยน template เองได้ก่อนสร้าง Lot
- Sandbox agent-browser ตรวจ `/experiments/new` ที่ 390px สำเร็จ และไม่พบ page overflow
- เพิ่ม test การ prefill Plant Record + recommended template
- Verification:
  - `npm test -- --run`: 68 files / 141 tests ผ่าน, 4 suites skip
  - `npm run build`: ผ่าน
  - `npm run firebase:verify`: 72 files / 151 tests ผ่าน
  - `npm run lint`: ผ่าน
- สถานะ: เส้นทางเริ่มจาก Plant Record ไปเลือกคู่มือและสร้าง Lot ชัดขึ้น; การโหลดข้อมูล Plant Record จริงต้องทดสอบอีกครั้งใน authenticated Firebase environment

### เชื่อม Monograph เข้ากับ Guided Runner — 2026-07-24

- Pink Princess และ Violin template เปลี่ยนจากชุดขั้นมาตรฐาน 13 ขั้นเป็นขั้นจาก monograph โดยตรง 18 ขั้น
- แต่ละ step ใน Runner ได้ title, instruction, materials, critical controls, safety, measurement, pass/fail criteria, evidence state และ source references จากคู่มือเดียวกัน
- Generic Philodendron ยังคง fallback 13 ขั้นเพื่อรองรับชนิดที่ยังไม่มี monograph
- Violin ทุกขั้นไม่ถูกยกระดับเป็น Verified; Pink Princess มี source references ตามหลักฐานที่มี แต่ workflow เต็มยังรักษาสถานะ Adapted
- แก้ TypeScript measurement unit mapping ให้ใช้ `MeasurementUnit` ของ domain กลาง
- Verification:
  - `npm test -- --run`: 68 files / 141 tests ผ่าน
  - `npm run build`: ผ่าน
  - `npm run firebase:verify`: 72 files / 151 tests ผ่าน
  - `npm run lint`: ผ่าน
  - `git diff --check`: ผ่าน มีเฉพาะคำเตือน line ending Windows
- สถานะ: คู่มือที่ผู้ใช้อ่านและขั้นที่ผู้ใช้ทำใน Lot ใช้ข้อมูลชุดเดียวกันแล้ว; authenticated end-to-end ยังเป็นขั้นตรวจถัดไป

### Sandbox ทดสอบสร้าง Lot และ Guided Runner — 2026-07-24

- เปิด `/experiments/new` ใน Demo mode ที่ viewport 390 px
- กรอก Lot ID `PPP-SANDBOX-001`, ชื่อพืช Pink Princess และเลือก `template-pink-princess-nodal`
- สร้าง Lot สำเร็จและถูกนำไป `/experiments/PPP-SANDBOX-001`
- ตรวจพบ Runner แสดงครบ 18 ขั้น ตั้งแต่ baseline ถึง closeout
- บันทึก step 1 ด้วย note และสถานะ Passed สำเร็จ; รายการเปลี่ยนเป็น `Passed`
- กดถัดไปสำเร็จและ Runner แสดง step 2 พร้อม form note/status ใหม่
- ตรวจ page overflow ที่ 390 px: `scrollWidth` เท่ากับ viewport
- สถานะ: Demo workflow สร้าง Lot → บันทึกผล → ไปขั้นถัดไปทำงานจริง; ต้องทำซ้ำด้วย authenticated Firebase และข้อมูล Plant Record จริงเมื่อ environment พร้อม

### Sandbox ทดสอบ Violin และ Needs review — 2026-07-24

- เปิด `/experiments/new` ใน Demo mode และสร้าง Lot `VIO-SANDBOX-001`
- เลือก `Violin variegated · Nodal culture · Experimental` สำเร็จ
- Runner แสดงครบ 18 ขั้น และยังไม่พบ step ใดถูกแสดงเป็น Verified
- เลือก step 4 `เลือกยอด/ข้อ/ตาข้าง` แล้วบันทึก note พร้อมสถานะ `Needs review`
- รายการ step เปลี่ยนเป็น `Needs review` สำเร็จ โดยไม่บังคับให้ผู้ใช้กดผ่านเมื่อหลักฐานยังไม่พอ
- สถานะ: Violin workflow รองรับผลที่ยังไม่ชัดเจนตาม evidence policy; authenticated Firebase flow ยังรอตรวจด้วยบัญชีจริง

### เพิ่มหลักฐานภาพประจำ Guided Protocol step — 2026-07-24

- เพิ่ม `evidenceObservationId` ใน `ProtocolStepRun` เพื่อผูกหลักฐานภาพกับขั้นตอนที่ถูกบันทึกจริง
- เมื่อบันทึก step ครั้งแรก ระบบสร้าง observation container ภายในสำหรับภาพหลักฐานโดยอัตโนมัติ และติด `kind: protocol-step-evidence` เพื่อไม่ให้ปนกับ Observation Timeline หลัก
- Guided Runner แสดง `MediaUploader` และ `MediaStrip` หลังมีการบันทึกผลขั้นนั้นแล้ว โดยยังใช้ `/api/media/sign` และ Cloudinary security flow เดิม
- ระบบยังคงบังคับ required note/measurement ก่อนบันทึก และไม่เปิดช่อง upload ก่อนมี Lot/observation target ที่ถูกต้อง
- เพิ่ม unit test สำหรับการแสดง photo evidence controls และเพิ่ม optional observation metadata สำหรับการซ่อน system evidence container
- Sandbox ตรวจด้วย `agent-browser` ที่ `/experiments/PHOTO-SANDBOX-001` ใน Demo mode:
  - สร้าง Pink Princess Lot สำเร็จ
  - Runner แสดง 18 ขั้น
  - ก่อนบันทึก step มีข้อความให้บันทึกผลก่อนจึงอัปโหลดรูปได้
  - หลังบันทึก step 1 สถานะ Passed แล้ว ปุ่มเลือกไฟล์/คำอธิบายภาพ/เพิ่มรูปแสดงครบ
  - viewport 390 px ไม่มี horizontal overflow (`scrollWidth=390`, `viewport=390`)
- Verification:
  - targeted tests: 2 files / 3 tests ผ่าน
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
- ข้อจำกัดที่ยังเหลือ: การอัปโหลดไฟล์จริงต้องตรวจด้วย authenticated Firebase + Cloudinary environment เพราะ Demo mode ไม่มี Firebase user token

### ปรับการแก้ไขหลักฐานภาพใน Runner — 2026-07-24

- แก้การบันทึก step เดิมให้คง `evidenceObservationId` เดิม ป้องกันการสร้าง observation container ซ้ำเมื่อแก้ผลขั้นตอน
- เพิ่มการลบแบบ soft delete และกู้คืนรูปจากส่วนหลักฐานภาพใน Guided Runner โดยตรง
- ใช้ repository เดิมและ owner/lot/observation validation เดิม ไม่เปิด target upload ใหม่ที่ข้าม security boundary
- Verification หลังแก้:
  - `npm test -- --run`: 69 files ผ่าน, 4 skipped; 142 passed, 10 skipped
  - `npm run firebase:verify`: 73 files / 152 tests ผ่านบน Auth + Firestore emulator
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `git diff --check`: ผ่าน มีเฉพาะคำเตือน line ending Windows
- สถานะ: Guided Protocol มี workflow หลักฐานครบ note + measurement + photo พร้อม soft delete/restore; ยังต้องใช้ Firebase/Cloudinary production credentials เพื่อทดสอบ binary upload จริงก่อนเปิดใช้ production

### เพิ่ม completion gate ใน Guided Runner — 2026-07-24

- ปุ่ม `ถัดไป` ถูก disable จนกว่าจะบันทึกผลขั้นปัจจุบันแล้ว
- แสดงคำแนะนำภาษาไทยชัดเจนว่าให้บันทึกผลก่อนจึงไปต่อได้
- เพิ่ม regression test สำหรับ gate และคง photo-evidence test ไว้
- Sandbox ผ่านที่ `/experiments/GATE-SANDBOX-001` ใน Demo mode viewport 390 px:
  - ก่อนบันทึก: `ถัดไป` disabled
  - หลังบันทึก note + Passed: `ถัดไป` enabled
  - หลังบันทึก: controls รูปภาพและ `เพิ่มรูป` แสดงครบ
- Verification:
  - targeted Runner tests: 2 ผ่าน
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
- สถานะ: Guided workflow ไม่อนุญาตให้ข้ามขั้นโดยไม่ยืนยันผล; binary upload production ยังต้องตรวจด้วย credentials จริง

### ปรับคำแนะนำตามผลจริง — 2026-07-24

- เปลี่ยน completion gate ให้ไปขั้นถัดไปได้เฉพาะเมื่อสถานะปัจจุบันเป็น `Passed`
- `Needs review` จะแสดงคำแนะนำให้ตรวจเพิ่ม/แก้ไขก่อน และปุ่ม `ถัดไป` ยังคง disabled
- `Failed` จะแสดงคำแนะนำให้ทำตาม `nextActionOnFail` และบันทึกผลใหม่ก่อน
- เพิ่ม regression test สำหรับสถานะ `Needs review`
- Sandbox สร้าง `STATUS-SANDBOX-001` และบันทึก step เป็น `Needs review` สำเร็จ; step list แสดงสถานะถูกต้องและ `ถัดไป` disabled
- Verification:
  - targeted Runner tests: 3 ผ่าน
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
- สถานะ: Runner นำทางตามผลจริงแล้ว ไม่ให้มือใหม่ข้ามผลที่ยังไม่ผ่านการยืนยัน

### แก้ Vercel signed-upload 503 จาก firebase-admin ESM — 2026-07-24

- Root cause จาก Vercel Runtime Logs: `firebase-admin/auth` รุ่นที่ติดตั้งโหลด `jwks-rsa` แบบ CommonJS ซึ่งพยายาม `require()` package `jose` แบบ ESM ทำให้ route `/api/media/sign` ล้มด้วย `ERR_REQUIRE_ESM`
- แยกการสร้าง Firebase Admin App ออกจากการโหลด Firebase Admin Auth โดยเพิ่ม `getAdminApp()` ใน `src/lib/firebase/admin.ts`
- เปลี่ยน API routes ที่ใช้ Firestore ให้เรียก `getAdminApp()` โดยตรง และไม่โหลด `firebase-admin/auth` ในเส้นทาง server เหล่านั้น
- ไม่ลด security boundary: route ยังตรวจ Firebase ID token และตรวจ Lot/Observation ownership ก่อนสร้าง signed upload
- Verification:
  - targeted media/admin tests: ผ่าน; integration tests ที่ไม่เปิด emulatorถูก skip ตามเงื่อนไข
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `npm run firebase:verify`: 73 files / 154 tests ผ่าน
  - local sandbox route ที่ 390px: ไม่มี horizontal overflow
- ขั้นถัดไป: commit และ push fix นี้ แล้วทดสอบ Preview upload จริงอีกครั้ง; ไม่ต้องเปลี่ยน private key หาก Runtime Log ยืนยัน ESM error นี้

### แก้ตำแหน่งกู้คืนรูปของ Guided Step — 2026-07-24

- แก้ปัญหารูปที่ soft-delete แล้วหายจาก state จนไม่เห็นปุ่ม `กู้คืนรูป`
- โหลด media ของ observation รวมรายการ deleted ไว้ใน state เสมอ
- Observation Timeline ยังคงกรองรายการ deleted ตาม checkbox เดิม
- Guided Step evidence แสดงรายการ deleted พร้อมปุ่ม `กู้คืนรูป` ในส่วน `หลักฐานภาพของขั้นนี้` โดยตรง
- เพิ่ม test ยืนยันว่า `MediaStrip` แสดง restore action สำหรับ media ที่มี `deletedAt`
- Verification:
  - `npm run firebase:verify`: 73 files / 155 tests ผ่าน
  - targeted media tests: 3 ผ่าน
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `git diff --check`: ผ่าน
- สถานะ: ลบและกู้คืนรูปได้จากจุดเดียวกันทั้ง Observation media และ Guided Step evidence

### เพิ่ม Plant Profile → Experiment Lots summary — 2026-07-24

- Plant Profile โหลด Plant Record และ Experiment Lots ที่มี `plantId` ตรงกันจาก repository เดียวกับหน้า Experiment
- แสดง progress แบบ `ผ่าน/บันทึกแล้ว`, status, stage, วันที่แก้ไขล่าสุด และลิงก์เปิด Lot
- ถ้ายังไม่มี Lot จะแสดง empty state พร้อมปุ่มเริ่ม Lot แรก
- เพิ่ม component test สำหรับ lot progress summary
- Sandbox `agent-browser` ที่ `/plants`, viewport 390 px:
  - AuthGate → Demo mode ทำงาน
  - Plant empty state แสดงถูกต้องเมื่อยังไม่มี Plant Record
  - ไม่มี horizontal overflow (`scrollWidth=390`, `viewport=390`)
- Verification:
  - `npm run firebase:verify`: 74 files / 156 tests ผ่าน
  - targeted Plant Profile test: ผ่าน
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
- สถานะ: Plant Profile พร้อมเป็นศูนย์กลางเชื่อมต้นไม้กับ Lot; ข้อมูล Lot จะแสดงเมื่อ Plant Record นั้นถูกใช้สร้าง Lot จริง

### เชื่อม Plant Record กับ Taxon Knowledge — 2026-07-24

- เพิ่ม `taxonId` ใน `PlantRecord` เพื่อเก็บความสัมพันธ์กับรายการ Taxon จริง ไม่อาศัยชื่อพืชแบบข้อความอย่างเดียว
- การเริ่มสร้าง Plant Record จากหน้า Taxon เช่น Pink Princess จะบันทึกทั้ง `taxonId`, ชื่อที่คาดว่าเป็น และระดับความมั่นใจ
- หน้า Plant Profile แสดง Taxon ที่เชื่อมอยู่ ลิงก์กลับไป Taxon Detail และ evidence state ของรายการนั้น
- หน้า Start New Plant แสดงลิงก์ `เปิดข้อมูลชนิดพืช` เมื่อมี Taxon prefill เพื่อให้มือใหม่ย้อนกลับไปอ่าน Biology, Identification และ Tissue Culture ก่อนเริ่ม Lot
- อัปเดต domain test ให้ยืนยันว่า prefill คืน `taxonId` และไม่ทำให้ template ต้นฉบับถูกแก้
- Verification:
  - targeted knowledge/repository tests: 2 files / 7 tests ผ่าน
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `npm run firebase:verify`: 74 files / 156 tests ผ่าน
  - sandbox `agent-browser` ที่ `/plants/new?taxon=cultivar-pink-princess`: Demo mode, Taxon link และ Pink Princess prefill แสดงถูกต้อง; viewport 390 px ไม่มี horizontal overflow
- สถานะ: Plant Record เชื่อมกลับ Knowledge Base ได้แล้ว; ขั้นต่อไปคือทำ Taxon Detail ให้เริ่ม Plant Record/Lot ด้วย context เดียวกันครบทั้ง flow และเพิ่ม migration ตรวจข้อมูลเก่า

### ส่ง Taxon context ต่อถึง Experiment Lot — 2026-07-24

- เพิ่ม `taxonId` ใน `ExperimentLot` เพื่อไม่ให้ Lot สูญเสียความสัมพันธ์กับ Taxon เมื่อชื่อพืชถูกแก้ภายหลัง
- เพิ่ม `templateIdForTaxon()` ให้การเลือกคู่มืออิง Taxon ID เป็นหลัก: Pink Princess → nodal template, Violin → nodal template, อื่น ๆ → Generic fallback
- หน้า Experiment New รับ `taxon`, `plant` และ `plantId` จาก context ได้ ทำให้เปิด flow ต่อจาก Taxon/Plant ได้แม้ demo mode มีการ reload หน้า
- Lot Form แสดงข้อความว่าเชื่อม Taxon Knowledge แล้ว และส่งความสัมพันธ์ไปพร้อมข้อมูล Lot
- Migration ของ legacy Experiment Lot รักษา `plantId`, `taxonId`, `templateId` และ `method` เมื่อข้อมูลเดิมมีฟิลด์เหล่านี้
- Verification:
  - `npm run firebase:verify`: 74 files / 158 tests ผ่าน
  - targeted template/migration/Lot Form tests: 3 files / 8 tests ผ่าน
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `git diff --check`: ผ่าน
  - sandbox ที่ 390 px: Taxon Detail แสดงคู่มือ 18 ขั้นและปุ่มเริ่ม Plant Record; Experiment New จาก context แสดง Pink Princess template และ Taxon guidance; ไม่มี horizontal overflow
- สถานะ: Taxon → Plant Record → Experiment Lot มี context ต่อเนื่องใน domain และ UI แล้ว; ขั้นถัดไปคือทำ Taxon Detail/Plant Profile แสดง protocol ที่เลือกและความคืบหน้าของ Lot แบบรวมศูนย์

### รวม protocol progress และยกระดับ Protocol Authoring — 2026-07-24

- Plant Profile แสดง protocol title, protocol version, template/method, evidence state, จำนวนขั้นที่ผ่าน และวันที่แก้ไขล่าสุดของทุก Lot
- ปุ่มสร้าง Lot ใหม่จาก Plant Profile รักษา `plantId` และไม่หลุดออกจาก context ของต้นนั้น
- Protocol Detail เพิ่ม `คัดลอกเป็น Draft` โดยสร้าง Protocol ใหม่จาก version ที่เลือก ไม่แก้ต้นฉบับ
- Protocol Editor เพิ่มการแก้ `Source IDs`, `Claim IDs` และ `Reference IDs` รายขั้น พร้อมเก็บกลับทั้ง Memory และ Firestore repository
- Published version ยังคง immutable; การแก้จากหน้า Edit จะสร้าง draft version ใหม่ตามกลไกเดิม
- Version history เพิ่ม compare summary ระหว่างสอง version ล่าสุด พร้อมจำนวน step ที่เปลี่ยน source และ claim
- Monograph เพิ่มลิงก์ source จริงระดับ claim และ Reference Register พร้อม source type/access date
- Verification:
  - targeted authoring/summary/monograph tests: 6 files / 14 tests ผ่านรวมกับ regression ที่เกี่ยวข้อง
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
- สถานะ: ข้อมูลจาก Taxon, Plant Profile, Protocol และ Lot ถูกอ่านต่อเนื่องมากขึ้น; ก่อนส่ง production ต้องรัน full emulator suite และตรวจ Preview/UI ทุก breakpoint

### Final verification รอบล่าสุด — 2026-07-24

- branch หลักของ repository คือ `master` และ merge งาน knowledge/protocol authoring แล้วที่ commit `439cc2a`
- `origin/master` ตรงกับ local `master` หลัง push สำเร็จ
- `npm run firebase:verify`: Firebase Auth/Firestore emulator ทำงาน และผ่าน 74 test files / 161 tests
- `npm run lint`: ผ่าน
- `npm run build`: ผ่านด้วย Next.js 16.2.11 และ TypeScript ตรวจผ่าน
- sandbox local ตรวจ Taxon Detail และ Protocol Detail ที่ 390, 1024 และ 1440 px:
  - ไม่มี horizontal overflow
  - ข้อความไทยยาวและ evidence/reference section แสดงได้
  - Protocol Detail แสดง `คัดลอกเป็น Draft`, `แก้ไข`, ขั้นตอน และสถานะ evidence
  - keyboard Tab เปลี่ยน focus ได้ แต่ใน local dev มี Next.js Dev Tools portal เป็นจุดรับ focus แรก ต้องตรวจซ้ำใน Preview production โดยปิด dev tools
- หลัง push `master` แล้ว Vercel สร้าง Production deployment `74f0309` สำเร็จและแสดงสถานะ `Ready`; production domain `https://tissue-experiment-93.vercel.app` และ route knowledge ตอบ HTTP 200
- deployment alias ถูก Vercel Deployment Protection ให้ sign in ก่อน จึงไม่ใช้ alias เป็นหลักฐาน UI โดยตรง; production domain แสดง Firebase Auth Gate ถูกต้องเมื่อยังไม่ได้ login
- การตรวจ authenticated Preview ที่เคยทำสำเร็จยืนยันการบันทึก step และการโหลด media บน Preview เดิมแล้ว แต่ต้องตรวจซ้ำกับ deployment ที่มาจาก `master` ก่อนปิด milestone production
- สถานะ: โค้ด, automated verification และ production deployment พร้อม; งานค้างสุดท้ายคือ authenticated flow บน deployment ล่าสุด และ UI keyboard/focus รอบ production ก่อนเริ่ม Image Processing

### Authenticated production flow ผ่าน — 2026-07-24

- Vercel dashboard ยืนยัน deployment จาก `master` commit `5af2dfd` เป็น `Production · Ready` (alias: `tissue-experiment-93-8o45dotzh-pslllanybk-2845s-projects.vercel.app`)
- เปิด production domain และกด `Sign in with Google` สำเร็จ; Firebase session แสดง `FIREBASE`
- เปิด Lot `QA-PREVIEW-20260723` บน production และตรวจ Guided Protocol จริง:
  - step baseline แสดง `Passed`
  - กด `บันทึกผลขั้นนี้` แล้วได้สถานะ `บันทึกผลแล้ว`
  - พื้นที่หลักฐานภาพเปิดหลังบันทึก step
- signed upload ผ่านจริง:
  - เลือกไฟล์ทดสอบ
  - เพิ่มคำอธิบายภาพ
  - อัปโหลด Cloudinary สำเร็จและภาพ render ใน figure
  - ลบแบบ soft delete แล้วปุ่มเปลี่ยนเป็น `กู้คืนรูป`
  - กู้คืนสำเร็จและปุ่มกลับเป็น `ลบรูป`
  - audit history ยังแสดง event ของ media
- production keyboard check: หลัง focus locator ที่ตรวจได้ กด Tab แล้ว focus อยู่บนลิงก์จริง (`A`, `/experiments`) ไม่ใช่ body
- local sandbox responsive matrix ที่ 390/1024/1440 px ผ่าน ไม่มี horizontal overflow; production authenticated flow ผ่านที่ deployment ล่าสุด
- สถานะ: ข้อ 1–6 ของ guided workflow project ผ่านหลักฐานแล้ว; เริ่ม Image Processing phase ต่อจาก reviewed dataset/preprocessing pipeline ได้

### เริ่ม Image Processing phase หลัง project หลักผ่าน — 2026-07-24

- เริ่มจาก pipeline ที่มีอยู่ใน `master` โดยไม่อ้างว่าเป็นโมเดลจำแนกชนิดพืชแล้ว:
  - Observation media → Dataset Review Queue
  - provenance/label review และ owner-scoped Firestore repository
  - dataset manifest พร้อม train/validation/test split ระดับ Lot
  - server-side `sharp` preprocessing เป็น PNG 224×224 พร้อม orientation, sRGB, hash และ Cloudinary artifact
  - preprocessing job status/retry, model-ready export และ training-readiness report
- `image-analyzer.ts` เดิมยังเป็น heuristic สำหรับสี/ลายด่าง ไม่ใช่ species classifier และห้ามแสดงผลเป็น `Verified`
- กติกาของ phase นี้ยังคงเดิม: ภาพจากผู้ใช้ต้องผ่าน provenance/label review ก่อนรวมเป็น training data; image processing เสนอ candidate เท่านั้น ผู้ใช้ต้องยืนยันชนิด
- ยังไม่สร้าง automatic species prediction, model training หรือ inference endpoint เพราะยังไม่มี dataset ที่ผ่านการ review จำนวนเพียงพอสำหรับประเมินความแม่นยำ
- สถานะ: Image Processing เริ่มต้นอย่างเป็นทางการด้วย data/preprocessing foundation แล้ว; milestone ถัดไปคือ baseline candidate model และ evaluation report หลังมีภาพที่ผู้ใช้ยืนยัน label

### เพิ่มคู่มือเจือจาง stock solution สำหรับ batch เล็ก — 2026-07-24

- เพิ่ม `calculateIntermediateStockDilution` ใน `src/lib/domain/medium-calculations.ts` สำหรับคำนวณตาม `C1V1 = C2V2`
- รองรับการคำนวณ source stock, diluent, working stock และปริมาตรที่ต้องเติมในอาหาร batch สุดท้าย
- เพิ่มคำเตือนเมื่อปริมาตรที่ต้องดูดต่ำกว่าเกณฑ์ micropipette ที่กำหนด
- เพิ่ม test สำหรับการเจือจาง 1 mg/mL → 0.1 mg/mL และกรณีปริมาตร 5 µL ที่เล็กเกินไป
- เพิ่มคำแนะนำในหน้า Philodendron Monograph: ติดฉลาก working stock, ตรวจช่วงเครื่องมือ, ห้ามเติมน้ำเพิ่มโดยไม่คำนวณใหม่ และไม่แทนที่คำแนะนำของผู้ผลิตสาร
- สถานะ: เสร็จระดับคู่มือและตัวคำนวณ domain; ต้องใช้ค่าความเข้มข้น stock ตามฉลากจริงของผู้ใช้ก่อนนำไปผสม

### แก้ Firestore undefined field ตอนสร้าง Experiment Lot — 2026-07-24

- สาเหตุ: หน้า `experiments/new` สร้าง draft protocol จาก template โดยไม่ได้ส่ง `claimIds` และ `sourceIds`; repository เดิมใส่คีย์ทั้งสองเป็น `undefined` ลงใน ProtocolVersion
- Firestore ไม่อนุญาตให้เขียน field ที่มีค่า `undefined` จึงเกิด `Function WriteBatch.set() called with invalid data` ที่ path `protocols/{protocolId}/versions/{versionId}`
- แก้ repository ให้ normalize ค่า optional arrays เป็น `[]` ตอน `createDraft` และ `saveDraftVersion`
- เพิ่ม regression test เพื่อป้องกันการส่ง `undefined` ลง version document อีก
- สถานะ: แก้ที่ต้นเหตุแล้ว; ต้องตรวจ production flow สร้าง Lot หลัง Vercel deploy ใหม่

### เพิ่ม Soft delete / Restore สำหรับ Experiment Lot — 2026-07-24

- เพิ่ม `deletedAt` ให้ `ExperimentLot` และ normalize Lot เดิมให้เป็น `null` เมื่อยังไม่ถูกลบ
- เพิ่ม `softDeleteLot` และ `restoreLot` ใน memory/Firestore repository
- รายการ Lots ซ่อนรายการที่ถูกลบโดยค่าเริ่มต้น และมี checkbox `แสดงถังขยะ`
- เพิ่มปุ่ม `เก็บเข้าถังขยะ` และ `กู้คืน Lot` ทั้งหน้า Experiment List และหน้า Lot Detail
- การลบ/กู้คืนบันทึก audit event ของ entity ประเภท `lot` พร้อม before/after snapshot
- การลบเป็นแบบ reversible ไม่ลบ observations, media, protocol progress หรือ audit history ถาวร
- สถานะ: test, lint, build และ Firebase emulator ผ่าน; รอ Vercel deploy เพื่อทดสอบ production UI

### แก้ Protocol template nested undefined — 2026-07-25

- สาเหตุเพิ่มเติมของ `WriteBatch.set() called with invalid data`: `stepsForTemplate("template-pink-princess-nodal")` มี optional fields บางขั้นเป็น `undefined` ภายใน array `steps`
- เพิ่ม `removeUndefined` แบบ recursive ก่อนบันทึก `ProtocolVersion` ใน `createDraft`, `createDraftFromClaim` และ `saveDraftVersion`
- เพิ่ม regression test ด้วย Pink Princess template จริง ตรวจทั้งระดับ version และ nested step fields
- สถานะ: แก้ต้นเหตุที่สองแล้ว; ต้อง deploy commit ใหม่และทดสอบสร้าง Lot จากหน้าเว็บอีกครั้ง

### แก้ Lot optional field เป็น undefined (`plantId`) — 2026-07-25

- สาเหตุ: `LotForm` ใส่ optional fields เช่น `plantId`, `taxonId`, `templateId` และ `method` เป็น `undefined` เมื่อผู้ใช้สร้าง Lot โดยไม่เริ่มจาก Plant Record
- Firestore ไม่อนุญาตให้เขียน field ที่มีค่า `undefined` จึงเกิด error ที่ `lots/{lotId}.plantId`
- เพิ่มการล้าง `undefined` แบบ recursive ก่อนสร้าง Lot และเพิ่ม regression test ที่จำลองค่า optional fields ว่าง
- สถานะ: แก้แล้ว; ต้อง deploy commit ใหม่และทดสอบสร้าง Lot จากหน้าเว็บอีกครั้ง

### Production deployment policy — ใช้ main/master แทน Preview — 2026-07-25

- ห้ามใช้ URL จาก Preview deployment เป็น URL หลักสำหรับการทดสอบผู้ใช้หรือ production verification
- ให้ตั้งค่า Vercel Project → Settings → Git → Production Branch เป็น `master` ซึ่งเป็น branch หลักที่เชื่อมกับ workflow ปัจจุบัน
- branch `main` ต้อง push ให้ตรงกับ `master` ทุกครั้ง หาก GitHub เปลี่ยน default branch เป็น `main` ให้ปรับ Production Branch ของ Vercel เป็น `main` และตรวจว่า commit ตรงกับ `master`
- หลัง push ให้ตรวจตามลำดับ: GitHub `master`/`main` commit เดียวกัน → Vercel Production Deployment สถานะ Ready → Production Domain → login และ flow สำคัญ
- Preview ใช้ได้เฉพาะตรวจ branch ชั่วคราว ห้ามใช้เป็นหลักฐานว่า production deploy สำเร็จ
- ก่อนส่งงานทุกครั้งต้องบันทึก commit, branch ที่ push, Production URL และผลตรวจใน `handoff.md`

### Sterilization profiles + Beginner Guided Workflow — 2026-07-25

- เพิ่มวิธีฆ่าเชื้ออาหารที่เลือกและล็อกต่อ Lot:
  - `haiter-chemical` สำหรับการใช้ Haiter/NaOCl แบบ Home Lab — แสดง `Experimental`
  - `pressure-sterilization` สำหรับหม้อนึ่งแรงดัน — แสดงตาม evidence state ของ profile
- เพิ่ม snapshot ของวิธีฆ่าเชื้อใน `ExperimentLot` เพื่อให้สูตร ความเข้มข้น ปริมาตร และเวอร์ชัน profile ย้อนตรวจได้ และไม่เปลี่ยนตาม template ภายหลัง
- เพิ่มตัวคำนวณ Haiter จาก `% active chlorine` บนฉลาก, ค่าเป้าหมาย, ปริมาตรอาหาร และขีดจำกัดเครื่องมือ; ถ้าปริมาตรต่ำเกินวัด ระบบต้องเตือนให้เจือจางอย่างมีโครงสร้างแทนการเดา
- เพิ่ม Beginner Wizard 5 ขั้น: ระบุต้นไม้ → เลือกคู่มือ → เลือกวิธีฆ่าเชื้อ → ตรวจอุปกรณ์ → ตรวจสรุปและสร้าง Lot
- เปลี่ยน Lot ID ที่ระบบเสนอเป็น `LOT-YYYYMMDD-HHMMSS` เพื่อป้องกัน Lot หลายรายการในวันเดียวกันชนกัน
- ปรับ Guided Protocol ให้ลำดับจริงเป็น:
  1. baseline/สุขภาพ/ยืนยันชนิด
  2. ทำเครื่องหมาย explant โดยยังไม่ตัด
  3. เตรียมและฆ่าเชื้ออาหารตาม profile
  4. Blank test หรือบันทึกเหตุผลที่ข้าม
  5. เตรียมพื้นที่และตรวจ readiness
  6. จึงปลดล็อกขั้นตัดและฟอก explant
- ขั้นหลัง readiness แสดงสถานะล็อกชัดเจน และไม่ให้ข้ามไปตัดต้นก่อนอาหาร อุปกรณ์ พื้นที่ และการตัดสินใจเรื่อง Blank พร้อม
- ปรับ visual hierarchy/contrast สำหรับผู้เริ่มต้น และเพิ่ม CTA `เริ่มจากต้นไม้ 1 ต้น`
- Browser sandbox ยืนยัน flow Pink Princess + Haiter จริง:
  - คำนวณ Haiter 6% → เป้าหมาย 0.003% สำหรับอาหาร 1,000 mL ได้ 0.5 mL
  - checklist อุปกรณ์ gate ปุ่มถัดไป
  - สร้าง Lot สำเร็จ
  - Guided Runner เรียง 10 ขั้นเตรียมการก่อนขั้น `ตัดและเตรียม explant`
  - ขั้นตัดและขั้นถัดไปถูกล็อกด้วยข้อความ `รอตรวจความพร้อม`
- ผลตรวจล่าสุด:
  - `npm test`: 74 files ผ่าน, 4 skipped; 181 tests ผ่าน, 10 skipped
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `npm run firebase:verify`: Auth/Firestore emulator ผ่าน 78 files / 191 tests
- หลัง commit ให้ push `master` และ `main` ให้ชี้ commit เดียวกัน แล้วรอ Vercel Production deployment ก่อนถือว่าเผยแพร่เสร็จ
- implementation commit `b497735510e50266f28a73f2cb2d5f3b49d80e07` ถูก push ไป `master` และ `main` แล้ว
- Vercel Production deployment `dpl_86cLqFcUoP5pYd7EF7xSatVfNZUC` สถานะ `READY`; production alias คือ `https://tissue-experiment-93.vercel.app`

### แก้ Plant Record optional `taxonId` เป็น undefined — 2026-07-25

- อาการ production: `Function setDoc() called with invalid data` ที่ `plants/{plantId}.taxonId`
- สาเหตุ: ฟอร์มสร้างต้นไม้โดยไม่ได้เริ่มจากหน้า Taxon ส่ง `taxonId: undefined`; Firestore ไม่ยอมรับค่า `undefined`
- เพิ่ม `sanitizePlantForFirestore` แบบ recursive และเรียกก่อน `setDoc` ทั้ง `create` และ `update`
- เพิ่ม regression test ที่ยืนยันว่า optional `taxonId` ถูกตัดออกจาก payload แทนการบันทึกเป็น `undefined`
- ผลตรวจ:
  - `npm test`: 75 files ผ่าน, 4 skipped; 182 tests ผ่าน, 10 skipped
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `npm run firebase:verify`: Auth/Firestore emulator ผ่าน 79 files / 192 tests

### แก้ Lot ที่เลือกวิธีฆ่าเชื้อแล้วถูกอ่านเป็น Legacy — 2026-07-25

- อาการ: Lot ที่สร้างผ่าน Beginner Wizard และเลือก Haiter/หม้อนึ่งแล้ว ยังแสดง `LEGACY LOT`
- สาเหตุ: Firestore write มี `sterilization` ถูกต้อง แต่ `normalizeExperimentLot()` ใน read-path สร้าง object ใหม่โดยไม่คัดลอก `sterilization` และ `protocolVersionId`
- แก้ normalizer ให้รักษา locked sterilization snapshot และ protocol version ของ Lot รุ่นใหม่ โดยยังรองรับข้อมูล legacy เดิม
- Lot ที่สร้างไว้แล้วไม่ต้องสร้างใหม่ หาก document เดิมมี snapshot อยู่; หลัง production deploy และ refresh จะเปิด Guided Protocol ได้
- เพิ่ม regression test ด้วย Lot ที่มี Haiter snapshot จริง
- ผลตรวจ:
  - focused migration/repository tests: 10 ผ่าน
  - `npm test`: 75 files ผ่าน, 4 skipped; 183 tests ผ่าน, 10 skipped
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `npm run firebase:verify`: Auth/Firestore emulator ผ่าน 79 files / 193 tests

### เพิ่มขั้นตอน Working dilution สำหรับ Haiter แบบมือใหม่ — 2026-07-25

- เพิ่ม guided step `เตรียม Working dilution เมื่อปริมาตรตรงเล็กเกินวัด` หลังขั้นคำนวณ direct dose
- ขั้นตอนอธิบายครบ:
  - เปรียบเทียบ direct dose กับค่าต่ำสุดของเครื่องมือ
  - เลือก dilution factor
  - คำนวณ `Cworking = Csource ÷ dilution factor`
  - ตัวอย่าง 1:10 จาก Haiter 6%: Haiter 1 mL + สารเจือจาง 9 mL = working solution 0.6%
  - คำนวณ `CworkingV1 = CtargetVfinal` ใหม่
  - ตรวจว่า V1 ใหม่อยู่ในช่วงวัดได้; ถ้ายังต่ำให้หยุดและคำนวณใหม่
- เพิ่มช่องบันทึก Csource, dilution factor, Cworking, ปริมาตร Haiter, ปริมาตรสารเจือจาง และ V1 ใหม่
- กรณี direct dose วัดได้อยู่แล้ว ให้บันทึกว่าไม่ต้องทำ working dilution โดยไม่บังคับกรอก measurement ที่ไม่เกี่ยวข้อง
- เพิ่ม safety/critical controls: ห้ามนับหยด ห้ามผสมกับกรดหรือแอมโมเนีย ต้องใช้สารเจือจางตาม Protocol และติดฉลากทันที
- ผลตรวจ:
  - focused profile tests: 8 ผ่าน
  - `npm test`: 75 files ผ่าน, 4 skipped; 184 tests ผ่าน, 10 skipped
  - `npm run lint` และ `npm run build`: ผ่าน
  - `npm run firebase:verify`: Auth/Firestore emulator ผ่าน 79 files / 194 tests

### อนุมัติ Zero-Knowledge + Senior-Friendly Design B — 2026-07-25

- ผู้ใช้ยืนยันว่าการจำลอง beginner ต้องถือว่าไม่มีความรู้เรื่องพืช เพาะเลี้ยงเนื้อเยื่อ แล็บ อุปกรณ์ หน่วย หรือสมการ
- เลือก visual direction B จาก visual companion
- ล็อกมาตรฐาน: Thai body 18px ขึ้นไป, ปุ่มขั้นต่ำ 48×48px, primary 56px, photo action 60px, WCAG AA, zoom 200%, ภาษาไทยธรรมดา และมี uncertainty path
- ขอบเขตคือ rewrite Guided Protocol ครบ 22 ขั้น และ review UX/UI ทั้งระบบ
- design spec: `docs/superpowers/specs/2026-07-25-zero-knowledge-senior-friendly-design.md`
- ยังไม่เริ่ม implementation จนกว่าผู้ใช้จะ review และอนุมัติ written spec

### อนุมัติ spec และจัดทำ implementation plan — 2026-07-25

- ผู้ใช้อนุมัติ `docs/superpowers/specs/2026-07-25-zero-knowledge-senior-friendly-design.md`
- สร้างแผน TDD 8 งานที่ `docs/superpowers/plans/2026-07-25-zero-knowledge-senior-friendly.md`
- แผนครอบคลุม domain contract, rewrite 22 ขั้น, Haiter action planner, runner, photo UX, visual tokens, system-wide review และ automated browser verification
- ขั้นถัดไปต้องเลือกวิธี execution ก่อนเริ่มแก้ production code

### Implement Zero-Knowledge + Senior-Friendly Design B — 2026-07-25

- ผู้ใช้เลือก Inline Execution (ตัวเลือก 2) และอนุมัติให้ดำเนินงานตาม spec
- เพิ่ม zero-knowledge domain contract:
  - `BeginnerInstruction`, `BeginnerMaterial`, `UncertaintyPath`
  - ทุกขั้นต้องบอกสิ่งที่ทำ สิ่งที่ห้าม สิ่งที่มองหา อุปกรณ์ วิธีทำ เงื่อนไขหยุด หลักฐาน checklist และทางเลือกเมื่อไม่แน่ใจ
  - validation ปฏิเสธ beginner guidance ที่มีโครงสร้างไม่ครบ
- ปรับ Template:
  - Pink Princess, Violin variegated และ Generic Philodendron มี beginner guidance ทุก base step
  - เมื่อประกอบ Haiter profile แล้วได้ user-visible journey 22 ขั้นคงที่
  - readiness gate อยู่ก่อนการตัด explant และขั้นหลัง readiness ถูกล็อก
- เพิ่ม `createHaiterActionPlan`:
  - ผู้ใช้กรอกตัวเลขจากฉลาก ปริมาตรอาหาร และค่าต่ำสุดของอุปกรณ์
  - direct example 6% / 1,000 mL แสดงให้ตวง 0.50 mL
  - working dilution example 6% / 100 mL แสดงให้ตวง 1.00 mL + น้ำปลอดเชื้อ 9.00 mL แล้วใช้ 0.50 mL
  - primary instructions ไม่แสดง C1V1/C2V2; สมการอยู่เฉพาะ science disclosure
  - หากข้อมูลหรืออุปกรณ์ไม่พอ ระบบ block และห้ามเดา
- Guided Runner:
  - แสดงลำดับสำหรับมือใหม่ครบทุกหัวข้อ
  - มีปุ่ม `ฉันหาไม่เจอ`, `ฉันไม่แน่ใจ`, `ฉันไม่มีอุปกรณ์นี้`
  - แยก `บันทึกร่าง`, `ยืนยันผลของขั้นนี้`, `ไปขั้นถัดไป`
  - required note/measurement/photo ถูกตรวจตอนยืนยัน
  - published version เก่าที่ไม่มี beginner contract แสดง migration state
- Photo evidence:
  - ปุ่มเลือก/ถ่ายรูปเต็มความกว้างและสูงอย่างน้อย 60px
  - อธิบายเหตุผลและสิ่งที่ต้องอยู่ในภาพ
  - ต้องบันทึกร่างก่อนอัปโหลด แล้วจึงยืนยันผล
- Senior-friendly visual contract:
  - `Noto Sans Thai` เป็นฟอนต์หลักของข้อความไทย
  - body 18px, label 16px, metadata 14px
  - target ขั้นต่ำ 48×48px, primary 56px, photo 60px
  - focus 3px, reduced motion, wrap/overflow safety
  - เมนูหลักเปลี่ยนเป็นภาษาไทยแบบเน้นงาน
- เพิ่ม `npm run ui:verify` ด้วย Playwright และ system Chrome:
  - ตรวจ 390px, 1024px, 1440px
  - ตรวจ body font, target size, horizontal overflow, framework overlay, console error และ keyboard focus
  - จำลองสร้าง Pink Princess Haiter Lot จริงใน demo mode และตรวจ Guided Runner 22 ขั้น
- ผลตรวจล่าสุด:
  - focused tests: 19 ผ่าน
  - full `npm test` ก่อน emulator: 81 files ผ่าน, 4 skipped; 210 tests ผ่าน, 10 skipped
  - `npm run firebase:verify`: 85 files / 220 tests ผ่าน
  - `npm run lint`: ผ่าน 0 warning
  - `npm run build`: ผ่าน
  - `npm run ui:verify`: ผ่าน 390, 1024, 1440px
  - sandbox ไม่มี console error, error overlay หรือ horizontal overflow ในเส้นทางที่ตรวจ
- Dependency advisory:
  - `npm audit` รายงาน 35 รายการ (moderate 9, high 26, critical 0)
  - ยังไม่ใช้ `npm audit fix --force`; ต้อง triage แยกเพื่อหลีกเลี่ยง breaking update
- ไฟล์ภาพ sandbox:
  - `C:\Users\HP\AppData\Local\Temp\philodendron-wizard-390.png`
  - `C:\Users\HP\AppData\Local\Temp\philodendron-haiter-390.png`
  - `C:\Users\HP\AppData\Local\Temp\philodendron-runner-390.png`
- Git และ deployment:
  - implementation commit `e11b68d1cc3d007e413ecc5605a6f5a6241cdb31`
  - push แล้วทั้ง `origin/master` และ `origin/main`
  - Vercel production deployment `dpl_3bWgLNb3q1tC4dTXtpRBrUyQrNg6` สถานะ `READY`
  - Vercel main deployment `dpl_6uRdrHgdhzkrgE1UnHfcBBn1PuwQ` สถานะ `READY`
  - production URL `https://tissue-experiment-93.vercel.app/` ตอบ HTTP 200 และพบชื่อระบบใน HTML
  - full authenticated production flow ยังต้องตรวจด้วย session ผู้ใช้จริงเมื่อมีการเปลี่ยน Firebase/Auth; รอบนี้ยืนยัน full flow ผ่าน local demo sandbox และ Firebase emulator แล้ว
- ขั้นถัดไป:
  - triage npm advisories แยกตาม production/dev dependency
  - ทำ authenticated production smoke ซ้ำเมื่อแก้ Auth, Firestore rules, media upload หรือ environment variables

## Milestone — แก้ Guided Runner ไม่มีช่องกรอก Haiter (2026-07-25)

- ผู้ใช้พบว่าขั้น `ให้ระบบหาปริมาตร Haiter ที่ต้องใช้` แสดงคำสั่งให้กรอกข้อมูล แต่ไม่มีช่องกรอกจริง
- Root cause:
  - เครื่องคำนวณเดิมอยู่เฉพาะ Beginner Lot Wizard
  - `calculate-haiter-dose` ไม่มี measurement schema
  - Guided Runner จึงแสดงข้อความและ checklist แต่ไม่ render input หรือผลคำนวณ
- การแก้ไข:
  - เพิ่มช่องกรอกติดกับคำอธิบายในขั้นเดียวกัน 3 ช่อง:
    - เปอร์เซ็นต์จากฉลาก Haiter
    - ปริมาตรอาหารทั้งหมด
    - ปริมาตรต่ำสุดที่อุปกรณ์ตวงได้
  - ใช้ target chlorine จาก Protocol/Lot snapshot และแสดงให้ผู้ใช้ทราบโดยไม่ให้เดาค่าเอง
  - แสดงคำสั่ง direct dose หรือ working dilution ทันทีใต้ช่องกรอก
  - prefill เปอร์เซ็นต์และปริมาตรอาหารจาก Lot ที่สร้างผ่าน Wizard
  - เพิ่ม measurement gate เพื่อห้ามยืนยันขั้นเมื่อค่าบังคับไม่ครบ
- Regression/verification:
  - เขียน regression test ก่อนแก้และยืนยันว่า fail เพราะไม่มี inline calculator
  - focused tests 18 ผ่าน
  - full tests 81 files ผ่าน + 4 skipped; 211 tests ผ่าน + 10 skipped
  - Firebase emulator 85 files / 221 tests ผ่าน
  - lint ผ่าน
  - production build ผ่าน
  - sandbox UI verification ผ่านที่ 390, 1024 และ 1440px
  - UI script ตรวจเพิ่มว่าขั้น Haiter มีช่องกรอกและแสดงคำสั่ง working dilution จริง

## Image Processing — Pilot training gate v2 (2026-07-25)

- เดินต่อจาก pipeline ที่มีอยู่จริง:
  - reviewed DatasetItem
  - Lot-level train/validation/test split
  - PNG 224×224 preprocessing artifact
  - model-ready manifest
- ปรับ `training-readiness` จากการตรวจเพียงว่ามี split หรือไม่ เป็นเกณฑ์ pilot สำหรับจำแนกอย่างน้อย 2 คลาส:
  - อย่างน้อย 20 ภาพ train ต่อคลาส
  - อย่างน้อย 5 ภาพ validation ต่อคลาส
  - อย่างน้อย 5 ภาพ test ต่อคลาส
  - อย่างน้อย 3 Lot อิสระต่อคลาส
  - artifact hash ซ้ำเป็น blocker เพื่อป้องกันภาพเดียวกันรั่วข้าม record
- รายงาน schema ใหม่ `training-readiness-v2` เพิ่ม:
  - `policy`
  - `classSplitCounts`
  - `blockers`
  - จำนวนภาพและจำนวน Lot แยกตามชนิด/สายพันธุ์
- เพิ่ม `TrainingReadinessPanel` ในหน้า Image Review:
  - แสดงว่า “พร้อม” หรือ “ยังไม่พร้อม”
  - แสดงจำนวนภาพ train/validation/test และ Lot ต่อคลาส
  - บอกจำนวนภาพที่ต้องเพิ่มเป็นข้อความภาษาไทย
  - ยังคงดาวน์โหลด JSON report สำหรับ audit ได้
- สถานะทางวิทยาศาสตร์:
  - เกณฑ์นี้เป็น pilot engineering gate ไม่ใช่หลักฐานว่าจำนวนดังกล่าวรับประกันความแม่นยำ
  - ยังไม่มีการ train หรือ inference จริง เพราะต้องมีข้อมูลอย่างน้อย Pink Princess และ Violin ที่ผ่าน review ตามเกณฑ์ก่อน
  - prediction ในอนาคตต้องแสดงเป็น candidate พร้อม confidence และให้มนุษย์ยืนยัน ห้ามแสดงเป็น Verified อัตโนมัติ
- ผลตรวจ:
  - focused tests 5 ผ่าน
  - full tests 82 files ผ่าน + 4 skipped; 214 tests ผ่าน + 10 skipped
  - Firebase Auth/Firestore emulator 86 files / 224 tests ผ่าน
  - lint ผ่าน
  - production build ผ่าน
  - sandbox UI verification ผ่าน 390, 1024 และ 1440px
- ขั้นถัดไป:
  - เก็บและ review ภาพอย่างน้อย 2 คลาสให้ผ่าน gate
  - เมื่อ report `ready: true` จึงสร้าง baseline transfer-learning training run, evaluation report และ versioned model artifact

## Mobile Protocol readability audit (2026-07-25)

- ตรวจหน้า Protocol ที่เกี่ยวข้องครบ:
  - Protocol list
  - Protocol detail และ version history
  - Protocol editor
  - Guided Protocol Runner
- แก้สาเหตุข้อความไทยถูกบีบบนมือถือ:
  - ยกเลิกการใช้ Geist Mono กับข้อความไทยประเภท metadata, evidence label, step kicker และข้อความย่อย
  - เก็บ mono font ไว้เฉพาะ code, Lot ID และ version ID
  - เปลี่ยนการตัดคำในพื้นผิว Protocol จาก `overflow-wrap:anywhere` เป็นการตัดคำปกติ
  - ให้หัวข้อขั้นตอนกับ evidence label เรียงแนวตั้งเมื่อจอแคบ
  - ลด padding ซ้อนใน Guided Runner และเพิ่ม `min-width:0` ให้ grid children
  - จัด Protocol list/detail/editor actions เป็นแนวตั้งบนมือถือ
  - เพิ่มขนาดพื้นที่กดลิงก์/ปุ่มให้ไม่น้อยกว่า 48×48px
- เพิ่ม UI regression checks:
  - ตรวจ Protocol list/detail/edit/runner โดยตรง
  - ตรวจข้อความไทยไม่ใช้ mono font
  - ตรวจพื้นที่ข้อความบนมือถือไม่แคบกว่า 250px
  - ตรวจ heading ของ Guided Runner เรียงแนวตั้ง
  - ตรวจ horizontal overflow และ touch targets
- ผลตรวจสุดท้าย:
  - `npm run ui:verify` ผ่าน 390, 1024 และ 1440px
  - `npm run lint` ผ่าน
  - `npm run build` ผ่าน
  - `npm test` ผ่าน 82 files + 4 skipped; 214 tests + 10 skipped
  - `npm run firebase:verify` ผ่าน 86 files / 224 tests
- Git และ production:
  - implementation commit `57045329706487e93b5901ece63cdea331566f8e`
  - push implementation แล้วทั้ง `origin/master` และ `origin/main`
  - production URL `https://tissue-experiment-93.vercel.app/` ตอบ HTTP 200
  - ตรวจพบ CSS ใหม่ของ mobile Protocol และ Training Readiness บน production แล้ว

## Image Processing — class/lot stratified dataset split v2 (2026-07-25)

- ปรับ dataset manifest จากการแบ่ง split ด้วย hash ของ Lot อย่างเดียวเป็น `class-lot-stratified-v2`
- เหตุผล: วิธีเดิมอาจทำให้ Lot ของคลาสเดียวกันไปอยู่ train หรือ validation/test เพียงชุดเดียว แม้มีหลาย Lot ทำให้ readiness report ไม่สะท้อน dataset ที่พร้อม train อย่างถูกต้อง
- กติกาใหม่:
  - ภาพจาก Lot เดียวกันยังอยู่ split เดียวกันเสมอ ป้องกันข้อมูลรั่วระหว่างภาพชุดเดียวกัน
  - จัดกลุ่ม Lot แยกตาม `scientificName · cultivarName`
  - ถ้ามีอย่างน้อย 3 Lot ต่อคลาส ระบบจะกระจาย Lot อย่างน้อยหนึ่งชุดไป train, validation และ test
  - Lot เพิ่มเติมกระจายตามสัดส่วนเป้าหมาย 70/20/10 แบบ deterministic
  - ใช้ stable hash เพื่อให้ export ซ้ำได้ผลเดิมโดยไม่สุ่ม
- เปลี่ยน schema เพื่อแยกจาก manifest เก่า:
  - `image-dataset-v2`
  - `image-dataset-model-ready-v2`
- เพิ่มการตรวจว่า split ของคลาสเดียวกันกระจายครบสามชุดเมื่อมี 3 Lot
- ผลตรวจหลังแก้:
  - focused tests 9 ผ่าน
  - full tests 82 files / 215 tests ผ่าน + 10 skipped
  - Firebase emulator 86 files / 225 tests ผ่าน
  - lint ผ่าน
  - production build ผ่าน
  - sandbox UI verification ผ่าน 390, 1024 และ 1440px
- ขั้นถัดไป:
  - เก็บภาพที่ผ่าน provenance/label review ให้ครบอย่างน้อย 3 Lot ต่อคลาส
  - preprocess แล้วสร้าง readiness report v2
  - เมื่อ `ready: true` จึงต่อ baseline training/evaluation จริง

## Image Processing — baseline centroid training/evaluation (2026-07-25)

- เพิ่ม `src/lib/image/baseline-classifier.ts` เป็น baseline ที่รันได้จริงด้วย `sharp`:
  - resize/อ่านภาพ RGB
  - สร้าง feature vector จากค่าเฉลี่ย, ส่วนเบี่ยงเบน, histogram สี และสัดส่วน pixel ที่เข้าเกณฑ์ variegation
  - train centroid แยกตาม class
  - ประเมิน validation/test พร้อม accuracy, per-class accuracy และ confusion matrix
  - ตรวจไม่ให้ Lot เดียวกันอยู่ทั้ง train และ evaluation
- เพิ่ม API `POST /api/dataset/baseline`:
  - ต้อง login
  - ตรวจ ownership ของ preprocessing job และ dataset items
  - หยุดที่ HTTP 409 พร้อม readiness report หาก dataset ยังไม่พร้อม
  - ดึงเฉพาะ preprocessed artifact จาก Cloudinary และจำกัดขนาด/host ของไฟล์
  - บันทึก model/evaluation เป็น `trainingRuns` พร้อม schema และ warnings
- เพิ่มปุ่ม `เริ่ม baseline training` ในหน้า Image Review
- สถานะทางวิทยาศาสตร์:
  - baseline นี้ใช้ตรวจ pipeline และเป็นจุดอ้างอิงเริ่มต้นเท่านั้น
  - ยังไม่ใช่โมเดลระบุสายพันธุ์ที่พร้อมใช้จริง และผลต้องผ่าน human review
  - ยังไม่มีการสร้างผลลัพธ์จริงใน production เพราะ dataset ยังไม่ผ่าน readiness gate
- ผลตรวจ:
  - baseline tests 5 ผ่าน
  - full tests 84 files / 220 tests ผ่าน + 10 skipped
  - Firebase emulator 88 files / 230 tests ผ่าน
  - lint และ production build ผ่าน
  - sandbox UI verification ผ่าน 390, 1024 และ 1440px

## Mobile responsive audit — Android/iPhone/iPad (2026-07-25)

- ปรับ responsive layer ท้าย `src/app/globals.css` ให้ override กฎ desktop-first เดิมอย่างเป็นระบบ โดยเน้น:
  - Android ขนาดเล็ก 360px, mobile 390px, iPad 768px และ tablet 1024px
  - ข้อความไทยใช้ขนาดและ line-height ที่อ่านได้ ไม่ถูกบีบหรือใช้ mono โดยไม่จำเป็น
  - grid children มี `min-width: 0` ลดการดันกรอบออกนอกจอ
  - data list, observation, dataset review, knowledge และ monograph เปลี่ยนเป็น single-column เมื่อเหมาะสม
  - ปุ่ม filter และปุ่มขึ้น/ลง/ลบใน Protocol editor มีพื้นที่กดอย่างน้อย 48px
  - ปุ่มภาษาไทยอนุญาตให้ขึ้นบรรทัดใหม่ และตัดคำตามธรรมชาติ
  - ป้องกัน horizontal overflow ของ document โดยไม่บังคับให้เนื้อหาตารางอ่านยาก
- ปรับ `scripts/verify-accessible-ui.mjs`:
  - เพิ่ม viewport 360px และ 768px
  - ตรวจ flow หลักตั้งแต่ login/demo, navigation, Protocol list/detail/edit, wizard และ Guided Runner
  - ทำการ submit wizard ให้ทนต่อ React rerender ระหว่างจอเล็ก
- ผลตรวจ:
  - `npm run lint` ผ่าน
  - `npm run build` ผ่าน
  - `npm test` ผ่าน 89 files / 231 tests (10 skipped)
  - `npm run firebase:verify` ผ่าน 89 files / 231 tests
  - production sandbox `npm run ui:verify` ผ่าน 360, 390, 768, 1024 และ 1440px
  - browser sandbox เดินตรวจเมนู Plants, Experiments, Protocols, Knowledge, Research และ Image Review ที่ 390px ผ่านครบ
- หมายเหตุ: dev server เดิมค้างใน Firebase loading สำหรับ Playwright จึงใช้ production server ที่ `http://127.0.0.1:3200` เป็น sandbox render source เพื่อหลีกเลี่ยงผลตรวจลวงจาก HMR/dev auth timing
- งาน image processing เดิมยังอยู่ในชุดเดียวกัน และยังไม่ถือว่าพร้อมใช้งานจริงจนกว่าจะมี dataset ผ่าน provenance/label review ครบตาม readiness gate

## Mobile visual correction after real sandbox review (2026-07-25)

- พบจากภาพ render จริงว่าการแก้รอบก่อนยังไม่ครอบคลุม breakpoint 768–820px:
  - sidebar desktop ยังแสดงบน tablet บางขนาด
  - ตาราง Experiment ถูกบีบจนชื่อพืช/Protocol ขึ้นทีละตัวอักษร
  - Guided Runner ยังแบ่งพื้นที่เป็นสองคอลัมน์ ทำให้เนื้อหากลางแคบ
  - action buttons ของ runner แคบและอ่านยาก
- แก้โดยเพิ่ม mobile layout ที่ `max-width: 820px`:
  - ซ่อน sidebar และใช้ topbar/mobile navigation
  - เปลี่ยน Experiment table เป็น stacked record layout
  - เปลี่ยน Guided Runner เป็นคอลัมน์เดียว และให้ step list เลื่อนแนวนอน
  - จัด action buttons เป็น grid ที่อ่านได้ และเป็น single-column บนจอเล็กกว่า 480px
- ตรวจภาพจริงใน sandbox ที่ 800px และ 390px หลังแก้ พบว่า sidebar หาย, ตารางอ่านได้, Wizard เต็มกรอบ และปุ่มไม่ถูกบีบ
- ผลตรวจหลังแก้:
  - `npm run lint` ผ่าน
  - `npm run build` ผ่าน
  - `npm run ui:verify` ผ่าน 360, 390, 768, 1024 และ 1440px
## Beginner manual standard and source-to-draft workflow (2026-07-25)

ต้องมีการบันทึกทุกครั้งที่งานจบ

## 2026-07-26 — ลบข้อความ fallback ที่ไม่ใช่ภาษาคู่มือ

- ผู้ใช้พบข้อความ `คำสั่งว่าต้องตวงจากขวดโดยตรงหรือทำสารเจือจางก่อน` ซึ่งเป็นคำอธิบายเชิงระบบ ไม่ได้บอกว่าต้องตรวจข้อมูลอะไรจริง
- เปลี่ยนหัวข้อ `สิ่งที่ต้องตรวจให้พบ` เป็น `ข้อมูลหรือผลที่ต้องตรวจ`
- ขั้นคำนวณ Haiter ระบุข้อมูลที่ต้องตรวจจริง 4 รายการ: % NaOCl, ปริมาตรอาหาร, ขีดต่ำสุดของอุปกรณ์ตวง และผลคำนวณพร้อมวิธีตวง/เจือจาง
- เอาคำอธิบาย purpose ที่สร้างอัตโนมัติออกจากรายการอุปกรณ์ เหลือรายการชื่อสารและอุปกรณ์แบบคู่มือ
- เพิ่มเนื้อหามือใหม่เฉพาะสำหรับ Working dilution แทน fallback ทั่วไป
- เพิ่ม automated test ห้ามข้อความ placeholder เช่น `ผลที่ขั้นตอนนี้ระบุ`, `มองหาผลที่ระบุ` และ `คำสั่งว่าต้องตวง` ปรากฏใน Sterilization Profile
- ผลตรวจ:
  - `npm test`: 225 ผ่าน, 10 skipped
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `npm run ui:verify`: ผ่านครบ 360-1920px

## 2026-07-26 — ปรับ Guided Protocol เป็น “คู่มือ + แบบบันทึก”

- ผู้ใช้แจ้งว่าแม่แบบเดิมที่แสดง `หน้าตา:` และ `ใช้เพื่อ:` ซ้ำทุกอุปกรณ์อ่านยากและไม่เหมือนคู่มือปฏิบัติ
- ตรวจ `D:\plant in jars\PLANTS IN JARS PROTOCOL LIBARARY v2 (1).pdf` แบบเรนเดอร์ภาพครบ 28 หน้า
- ใช้เฉพาะแนวคิดด้าน information architecture จากเอกสาร: explant, sterilization, media, aseptic procedure, notes และ sources; ไม่คัดลอกข้อความหรือสูตร เนื่องจากเอกสารระบุห้ามทำซ้ำ/เผยแพร่
- แยกพื้นที่ Guided Protocol ในแต่ละขั้นเป็น 2 โหมด:
  - `1. อ่านคู่มือ` สำหรับเป้าหมาย ก่อนเริ่ม สิ่งที่ต้องตรวจ อุปกรณ์/สาร วิธีทำ จุดหยุด หลักฐาน และเหตุผล
  - `2. บันทึกผลขั้นนี้` สำหรับค่าที่วัด note รูป สถานะ และปุ่มควบคุมขั้นตอน
- เพิ่ม CTA `อ่านจบแล้ว ไปบันทึกผลขั้นนี้` และปุ่มย้อนกลับไปอ่านคู่มือ
- เอาคำว่า `หน้าตา:` และ `ใช้เพื่อ:` ออกจากหน้าคู่มือหลัก เปลี่ยนเป็นชื่ออุปกรณ์พร้อมคำอธิบายสั้น และคำเตือนให้ตรวจฉลาก
- เปลี่ยนชื่อหัวข้อให้เป็นภาษาคู่มือ เช่น `เป้าหมายของขั้นนี้`, `อุปกรณ์และสารที่ใช้`, `วิธีทำ`, `หยุดและตรวจสอบใหม่เมื่อ`
- ผลตรวจ:
  - `npm test`: 224 ผ่าน, 10 skipped
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `npm run ui:verify`: ผ่านครบ 360-1920px
- ตรวจภาพ iPhone SE หลังแก้แล้ว โหมดอ่านคู่มือมีลำดับชัดและไม่พบข้อความ/กรอบถูกตัด

## 2026-07-26 — แก้การตรวจ UI ที่ผ่านปลอมและข้อความคู่มือถูกตัด

- ผู้ใช้พบข้อความใน Guided Protocol ถูกตัดด้านขวาบนมือถือ แม้ `npm run ui:verify` รอบก่อนรายงานว่าผ่าน
- สาเหตุคือการตรวจเดิมวัดเฉพาะ horizontal overflow ของทั้งเอกสาร ขณะที่ `overflow-x: hidden` สามารถซ่อน overflow ภายในกรอบได้
- เพิ่มการตรวจ clipping รายองค์ประกอบสำหรับกรอบคู่มือ รายการอุปกรณ์ ขั้นตอน หัวข้อ และข้อความ โดยตรวจทั้ง `scrollWidth > clientWidth` และขอบ element ที่เกิน viewport
- ตัวตรวจ Guided Protocol เปิดตรวจทุกขั้นที่เข้าถึงได้ ไม่ตรวจเฉพาะขั้นแรกและขั้นคำนวณ Haiter
- ปรับรายการอุปกรณ์บนมือถือให้ไม่มี padding ของ list ที่บีบเนื้อหา พร้อมกำหนด `min-width: 0`, `max-width: 100%`, `white-space: normal` และ `overflow-wrap: anywhere`
- แก้ URL sandbox จาก `127.0.0.1` เป็น `localhost` เพื่อไม่ให้ Next.js บล็อกไฟล์ hydration แบบ cross-origin
- ทำให้ demo session อยู่ต่อระหว่าง route reload ด้วย `sessionStorage` เพื่อให้การทดสอบ direct routes ตรวจหน้าจริง ไม่ใช่หน้า loading ของ Auth
- ผลตรวจล่าสุด:
  - `npm test`: 223 ผ่าน, 10 skipped
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `npm run ui:verify`: ผ่าน 360, 375, 390, 412, 428, 600, 744, 768, 820, 834, 1024, 1280, 1440 และ 1920px
- ตรวจภาพ `iphone-se-guided-runner.png` หลังแก้แล้ว ข้อความและกรอบคู่มือไม่ถูกตัด

- ปรับมาตรฐานคู่มือ/Protocol: ต้องเขียนให้คนที่ไม่เคยรู้เรื่องพืชหรือเพาะเลี้ยงเนื้อเยื่อมาก่อนทำตามได้ โดยทุกขั้นต้องตอบให้ครบว่า “กำลังทำอะไร, ทำไปทำไม, ต้องเตรียมอะไร, ทำอย่างไรทีละข้อ, ต้องตรวจอะไร, ต้องบันทึกอะไร, ผ่านเมื่อไร, ไม่ผ่านทำอะไรต่อ”
- ห้ามใช้ศัพท์ย่อเป็นคำสั่งลอย ๆ เช่น `C1V1 = C2V2` โดยไม่แปลเป็นภาษาคน ตัวอย่างและตารางต้องบอกว่าตวงอะไร กี่ mL/µL เติมอะไร และต้องติดฉลากอย่างไร ส่วนศัพท์วิชาการให้ย้ายไว้ในกล่อง “ศัพท์/เหตุผล” หลังคำอธิบายหลัก
- คู่มือการเลือก explant ต้องสอนตั้งแต่ศูนย์: อธิบายว่า “ข้อ” คือจุดที่ก้านใบ/กาบใบต่อกับลำต้น, วิธีสังเกตตาข้าง, วิธีเลือกข้อที่แข็งแรง, จุดตัดก่อนฟอกและการตัดแต่งหลังฟอก พร้อมภาพจำลองหรือภาพต้นจริงเมื่อมี หากไม่มีภาพต้นจริงต้องระบุชัดว่าเป็นภาพจำลองและห้ามใช้แทนการยืนยันต้นจริง
- เพิ่มภาพจำลองใน `src/components/knowledge/philodendron-monograph.tsx` สำหรับตายอด, ข้อ/ตาข้าง และตำแหน่งตัดใต้ข้อ รวมคำเตือนว่าเป็นภาพจำลอง ไม่ใช่ภาพต้นจริง
- เพิ่ม global button feedback ใน `src/app/globals.css`: hover, active/pressed, focus-visible, disabled และ spinner เมื่อ action async ส่ง `aria-busy=true` เพื่อให้ผู้ใช้รู้ว่าการกดมีผล แม้เป็นปุ่ม legacy

### การสร้างคู่มือสำหรับต้นชนิดใหม่

ไม่จำเป็นต้องให้ผู้ช่วยเขียนคู่มือสดทีละต้นแบบไม่มีระบบ ระบบมี draft-and-review pipeline แล้ว:

1. ลงทะเบียน taxon/ชื่อการค้าและ parent species
2. ดึง metadata จาก DOI/URL แล้วเก็บ source ใน Source Registry
3. สกัด claim พร้อม excerpt และตำแหน่งหลักฐาน
4. Reviewer อนุมัติหรือปฏิเสธ claim
5. จาก claim ที่ Approved สร้าง `playbook draft`
6. ผู้ดูแลปรับขั้นตอนให้เป็น beginner manual, ใส่ภาพ/diagram, checklist, critical controls และ evidence state
7. Publish เป็น protocol version; ผู้ใช้สร้างสำเนาใน Lot ของตัวเอง

ระบบต้องไม่ยกระดับ AI/ร่างอัตโนมัติเป็น Verified และไม่ publish เอง หากไม่มีหลักฐานตรงพันธุ์ให้ใช้ Adapted/Experimental/Pending review พร้อมบอกข้อจำกัด ผู้ดูแลต้องเปรียบเทียบแหล่งอนุกรมวิธาน เช่น Kew/IPNI กับคู่มือ extension/สารานุกรมและงาน peer-reviewed ก่อนอนุมัติเนื้อหา คู่มือการขยายพันธุ์ทั่วไปใช้เป็นหลักการ Adapted เท่านั้น ไม่ใช่หลักฐาน tissue culture ตรงพันธุ์

แหล่งเริ่มต้นสำหรับการทบทวนเนื้อหา: Kew POWO, IPNI, NC State Extension, Virginia Tech Extension และ UNH Extension โดยต้องเก็บ URL, วันที่เข้าถึง และระดับหลักฐานไว้ใน source registry

## Mobile overflow correction after iPhone SE review (2026-07-25)

- พบจากภาพจริงที่ 375px ว่า checklist “ตรวจว่าพร้อมไปต่อหรือยัง” และปุ่ม “ถ้ายังไม่แน่ใจ” ล้นด้านขวา เพราะ flex/grid child ยังรักษาความกว้างตามข้อความยาว
- เพิ่มกฎ mobile ใน `src/app/globals.css` ให้ guide, readiness panel และ uncertainty actions มี `min-width: 0`, `max-width: 100%`, และให้ข้อความ/ปุ่มตัดบรรทัดตามธรรมชาติ
- ปุ่ม uncertainty เปลี่ยนเป็นเต็มความกว้างของกรอบบน mobile เพื่อให้กดง่ายและไม่ถูกตัด
- ตรวจซ้ำด้วย production sandbox ที่ 360, 390, 768, 1024 และ 1440px: ผ่าน

## Explant reference gallery (2026-07-25)

- เพิ่ม `ExplantReference` ใน domain manual และเพิ่ม Reference Gallery ในหน้า monograph
- Pink Princess แสดงภาพจำลอง, แหล่งอธิบาย shoot tip/axillary node และงานวิจัยตรงพันธุ์ที่ใช้ PLB เป็น explant พร้อมแยกชัดเจนว่า PLB paper ไม่ใช่ภาพตัดข้อจากต้นแม่
- Violin แสดงภาพจำลองและ evidence gap ว่ายังไม่มีภาพ/protocol ตรง cultivar ใน registry
- ภาพจากภายนอกเก็บเป็นลิงก์พร้อมคำอธิบาย/ระดับหลักฐาน ไม่ดึงภาพจาก Google มาคัดลอกโดยไม่มี license
- เพิ่มแนวทางต่อยอด: เมื่อผู้ใช้อัปโหลดภาพต้นจริง ระบบควรสร้าง annotated reference เฉพาะต้นนั้น และเก็บภาพต้นฉบับ/ผู้ตรวจ/วันที่ไว้ใน audit

## Lot detail mobile header correction (2026-07-25)

- พบจากภาพ iPhone SE ว่า `.lot-detail-heading` ยังเป็น flex row บน mobile ทำให้ชื่อพืช/Protocol ถูกบีบเป็นตัวอักษรแนวตั้ง
- แก้ที่ `src/app/globals.css` ให้ header เป็นคอลัมน์บนจอไม่เกิน 700px, ลูกแต่ละส่วนกว้างเต็มกรอบ และอนุญาตให้ Lot ID/ชื่อ Protocol ตัดบรรทัดได้
- ตรวจ `lint`, `build` และ production UI sandbox ที่ 360, 390, 768, 1024 และ 1440px ผ่าน

## Experiment list mobile table correction (2026-07-25)

- พบจากภาพจริงที่ `/experiments` ว่ากฎ table mobile หลายชุดชนกัน ทำให้ cell ชื่อพืช/Protocol มีความกว้างใกล้ศูนย์และแสดงทีละตัวอักษร
- เพิ่ม override ที่ max-width 820px ให้แต่ละ Lot เป็นแถวหนึ่งคอลัมน์, label/value ใช้ flex, และทุก cell/child มี `min-width: 0`
- ผลคือชื่อพืช, Protocol, Stage, อายุ, สถานะ และการจัดการไม่ถูกบีบเป็นแนวตั้งบน iPhone/iPad
- ตรวจ `lint`, `build` และ production UI sandbox ที่ 360, 390, 768, 1024 และ 1440px ผ่าน

## Exhaustive responsive sandbox matrix (2026-07-26)

- ขยาย `scripts/verify-accessible-ui.mjs` ให้ตรวจ 14 viewport presets ครอบคลุมมือถือ Android/iPhone, tablet Android, iPad mini/9/Air/Pro และ desktop:
  - 360, 375, 390, 412, 428, 600, 744, 768, 820, 834, 1024, 1280, 1440 และ 1920 px
- ทุก viewport ตรวจ route หลัก: Overview, Plants, Experiments, Protocols, Knowledge, Research และ Image Review
- เพิ่ม route ตรวจโดยตรงสำหรับ Plant creation, Experiment creation, Protocol creation, Taxon detail, Source detail เมื่อมีข้อมูล และ Plant detail เมื่อมี record
- ตรวจ flow จริงของ Protocol detail/edit และ Guided Protocol Runner ตั้งแต่สร้าง Lot เลือกวิธีฟอกแบบ Haiter/NaOCl กรอกค่าคำนวณ working dilution ตรวจ checklist จนถึงเปิด runner
- ตรวจ body text, ฟอนต์ขั้นต่ำ 18px, horizontal overflow, framework error overlay, ขนาด interactive target ขั้นต่ำ 48x48, keyboard focus และข้อความไทยใน protocol ไม่ใช้ `word-break: break-all`
- บันทึก full-page screenshots ทุก route/viewport ไว้ใน `work/ui-audit/` ซึ่งเป็นโฟลเดอร์ audit ที่ไม่ commit เข้า repository
- ผล sandbox ล่าสุด: `npm run ui:verify` ผ่านครบทั้ง 14 viewport และสร้าง screenshot audit 196 ไฟล์
- ภาพตรวจด้วยตาเพิ่มเติมที่ iPhone SE, iPad 9 และ iPad Pro 12 พบว่า Experiment list เปลี่ยนเป็น stacked record ที่อ่านได้ และ Guided Runner ไม่บีบข้อความ/ปุ่มเป็นแนวตั้ง
- หากพบปัญหาจากอุปกรณ์จริงที่ไม่อยู่ใน preset ให้เพิ่ม preset ตามขนาดจริงแล้วรัน matrix ใหม่ก่อน release ห้ามสรุปว่าผ่านจาก desktop เพียงอย่างเดียว

## Collapsible navigation and protocol step drawer (2026-07-26)

- ปรับ `LabShell` สำหรับความกว้างไม่เกิน 1100px ให้ซ่อน sidebar เดิมและใช้ hamburger menu แทน เพื่อคืนพื้นที่อ่านบน iPad/Android tablet
- เมนูหลักเปิด/ปิดได้ด้วยปุ่มขนาดกดง่าย มี `aria-expanded`, `aria-controls`, label ภาษาไทย และสถานะ hamburger → close เมื่อเปิด
- เมื่อเลือกเมนู ระบบปิดเมนูอัตโนมัติ ไม่บังหน้าเนื้อหา และยังคง active route ให้เห็นชัด
- ปรับ `GuidedProtocolRunner` ให้รายการขั้นตอน 22 ขั้นย่อเป็นปุ่ม `เปิดรายการขั้นตอน` บน tablet/mobile; เปิดแล้วจึงแสดงรายการทั้งหมด และบนจอเล็กใช้แถบเลื่อนแนวนอน
- หน้าคู่มือยังคงแสดงขั้นตอนปัจจุบันเต็มความกว้าง จึงไม่ถูกบีบจาก sidebar ซ้ายบน iPad 9/Pro
- เพิ่ม sandbox assertions สำหรับ hamburger: เริ่มต้นปิด, เปิดแล้วเห็นเมนู, ปิดกลับได้ และปรับ flow ให้เปิดรายการขั้นตอนก่อนตรวจขั้น Haiter
- ตรวจภาพจริงหลังแก้ที่ iPad 9, iPad Pro 12 และมือถือ พร้อม matrix 14 viewport ผ่านครบ

## Beginner end-to-end sandbox review (2026-07-26)

- จำลองผู้ใช้ที่ไม่มีพื้นฐานผ่านเมนู `เริ่มต้น → ต้นไม้ของฉัน → สร้าง Plant Record → สร้าง Experiment Lot → Guided Protocol → คู่มือและ Protocol → คลังความรู้ → ตรวจงานวิจัย → ตรวจรูปภาพ`
- สร้าง Plant Record และ Lot แบบ Haiter ใน demo จริง แล้วบันทึกผลขั้นตอนใน Guided Runner
- พบ release blockers/ข้อบกพร่องสำคัญ:
  - เมื่อเริ่ม Lot จาก Plant Profile ชื่อและ `plantId` ไม่ถูกส่งเข้า Wizard; ช่องชื่อพืชว่างและ template เริ่มต้นเป็น Generic ทำให้ Lot ไม่เชื่อมกับ Plant Record และเสี่ยงเลือกคู่มือผิด
  - ขั้น `เตรียมอาหารแบบ Haiter` ใช้ข้อความ material/evidence แบบ generic ว่าให้ถ่ายภาพต้นไม้และตำแหน่งทำงาน ซึ่งผิดบริบทของการเตรียมอาหาร; รายการอุปกรณ์ก็เป็นคำกว้าง ๆ ว่า “อุปกรณ์ที่ระบุในขั้นนี้”
  - `profileStep` ไม่มี next action เมื่อผ่าน/ไม่ผ่าน จึงเกิดกล่องคำแนะนำว่างในบางขั้น
  - กด `ถัดไป` ใน Guided Runner แล้วไม่เลื่อนกลับหัวขั้นตอน; วัดได้จาก `scrollY` 2545.6 → 2944.8 หลังเปลี่ยนจากขั้น 7 เป็นขั้น 8
  - Knowledge Library ของ Pink Princess แสดง `Claims 0` และ “ยังไม่มี playbook” แต่ Taxon Detail มี monograph, claims, คู่มือ 18 ขั้น และสูตรครบแล้ว เป็น schema/repository state ที่ขัดกันและทำให้มือใหม่ไม่รู้ว่าคู่มือมีจริงหรือไม่
  - Dashboard แสดง `6 Protocol steps` แต่คู่มือปัจจุบันมี 18/22 ขั้น จึงเป็นตัวเลข seed/legacy ที่ทำให้เข้าใจผิด
- Responsive checks แบบ browser emulator:
  - ตรวจ route หลัก 7 หน้าและ route สำคัญ 4 หน้า ที่ iPhone SE 375×667, Android 412×915, iPad 9 768×1024 และ iPad Pro 1024×1366
  - route หลักไม่เกิด body-level horizontal overflow
  - Taxon Detail บนมือถือมีตารางสูตรกว้าง 391px ภายในพื้นที่เนื้อหาประมาณ 331–368px และอาศัย container ซ่อน/เลื่อน; ควรทำ mobile recipe cards หรือมีคำใบ้การเลื่อน
  - Wizard `/experiments/new` บนมือถือวาง stepper 5 ขั้นกว้างเกิน viewport; ขั้น 3–5 อยู่นอกจอแม้ body ไม่รายงาน overflow เพราะ parent ซ่อน/scroll
  - form labels และ status บางส่วนยังใช้ 10–11px; ลิงก์อ้างอิงใน monograph สูงเพียง 15–33px ต่ำกว่า touch target ที่เหมาะกับผู้สูงอายุ
- เมนู Research ใช้งานแบบ read-only ได้ แต่การ์ดหลักฐานไม่มีลิงก์เปิด source โดยตรง จึงตรวจสอบแหล่งที่มาได้ไม่ต่อเนื่อง
- เมนู Image Review แสดง empty state ถูกต้อง แต่ไม่มี CTA อธิบายเส้นทาง “ไปเพิ่ม Observation/รูป” ทำให้มือใหม่ติดอยู่ที่คิวว่าง
- Verification:
  - `npm test`: ผ่าน 221 tests, skip 10 ในการรันปกติ
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `npm run firebase:verify`: ผ่าน 231 tests บน Auth/Firestore emulator
  - `npm run ui:verify`: ไม่ผ่านหลังเพิ่ม hamburger navigation เพราะ helper `returnToApp()` ยังรอ `.lab-route-topbar:visible, .lab-route-sidebar:visible`; ต้องอัปเดต selector/flow ให้รู้จัก mobile/tablet hamburger ก่อนถือว่า release gate ผ่าน

## UI verification gate repair (2026-07-26)

- แก้ `scripts/verify-accessible-ui.mjs` ให้ตรวจ readiness จาก `.lab-route-shell:visible` ซึ่งใช้ร่วมกันได้ทั้ง desktop sidebar และ mobile/tablet hamburger
- แก้ `returnToApp()` ให้รอ AuthGate แสดงปุ่ม demo ก่อนคลิก แทนการตรวจ `isVisible()` ทันทีหลัง `domcontentloaded` ซึ่งเกิด race condition ได้
- `npm run ui:verify` ผ่านครบ 14 viewport: 360, 375, 390, 412, 428, 600, 744, 768, 820, 834, 1024, 1280, 1440 และ 1920px
- ตรวจซ้ำแล้ว `npm test`, `npm run lint` และ `npm run build` ผ่าน

## Beginner workflow consistency and mobile completion (2026-07-26)

- เปลี่ยนคำแนะนำของ Sterilization Profile จากข้อความ generic เป็นข้อมูลเฉพาะบริบท:
  - อ่านฉลาก Haiter ให้ถ่ายเฉพาะฉลากและคัดลอกเปอร์เซ็นต์
  - ขั้นคำนวณระบุสิ่งที่ต้องกรอกและไม่บังคับรูป
  - ขั้นเตรียมอาหารระบุ MS, sucrose, agar, stock hormone, pH, เครื่องชั่ง/ตวง, Haiter, ภาชนะและ PPE พร้อมลำดับทำจริง
  - ขั้น Blank ให้ตรวจ/ถ่ายภาชนะ Blank ไม่ใช่ต้นไม้
  - ขั้นหม้อนึ่งแยกการเตรียมอาหารกับการเดินเครื่องและข้อห้ามด้านแรงดัน
  - readiness gate ตรวจอาหาร Blank พื้นที่ และเครื่องมือก่อนเปิดขั้นตัดต้น
- ทุก profile step มี objective, expected result, pass/fail criteria และ next action ที่ไม่ว่าง
- Guided Runner ใช้ `scrollIntoView` และย้าย focus กลับหัวเนื้อหาเมื่อเปลี่ยนขั้น รองรับ reduced motion; UI matrix มี assertion ตรวจตำแหน่งหลังเลือกขั้น
- เพิ่ม `knowledge-seed.ts` เพื่อสร้าง claims/playbook จาก monograph เดียวกัน:
  - Pink Princess แสดง 5 claims และ active nodal playbook v0.1.0
  - Violin แสดง evidence gap และ Experimental playbook
  - memory และ Firestore fallback hydrate record เก่าที่ claims/playbooks ว่าง จึงไม่ขัดกับ Taxon Detail
- Mobile UX:
  - Wizard ใช้ progress summary “ขั้นที่ n จาก 5” บนจอเล็ก แทน stepper แนวนอนที่ซ่อนขั้นท้าย
  - ตารางสูตรเปลี่ยนเป็น ingredient cards บนจอ ≤600px พร้อม label ปริมาตรทุกค่า
  - เพิ่มขนาดข้อความ monograph และ touch target ของลิงก์อ้างอิง
- Image Review empty state มีลำดับ 3 ขั้นและ CTA ไปเพิ่มรูปใน Experiment หรือเริ่ม Plant Record
- Research cards เปิด source โดยตรงเมื่อมี URL และแสดงสถานะชัดเจนเมื่อทะเบียนยังไม่มี URL
- Verification หลังแก้:
  - `npm test`: ผ่าน 223 tests, skip 10
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `npm run firebase:verify`: ผ่าน 233 tests บน Auth/Firestore emulator
  - `npm run ui:verify`: ผ่านครบ 14 viewport ตั้งแต่ 360 ถึง 1920px รวม auto-scroll assertion

## 2026-07-27 — Beginner end-to-end audit (diagnosis only)

- จำลองผู้ใช้ไม่มีพื้นฐานใน production build local ที่ `http://localhost:3100` และใช้ Demo mode
- สร้าง Plant Record, เริ่ม Wizard, เลือก Pink Princess + nodal culture + Haiter, กรอก explant 3 ชิ้น/กระปุกเพาะ 3 ใบ และสร้าง Lot `LOT-20260727-052337`
- อ่านและกรอก Guided Protocol จริงทีละขั้นจนพบ release blockers ต่อไปนี้:
  - Plant Record ไม่มีช่องอัปโหลดภาพ baseline แม้ขั้นแรกของ Protocol บังคับภาพ
  - ลิงก์จาก Plant Profile ไป Wizard ส่ง `plantId` มา แต่ Wizard ไม่ hydrate ชื่อ/ชนิด/Taxon และเลือก Generic template เป็นค่าเริ่มต้น
  - รายการอุปกรณ์ใน Wizard ไม่ครอบคลุม MS salts, sucrose, agar, stock hormone, เครื่องชั่ง, pH, PPE และพื้นที่สะอาด
  - Summary ของ Wizard ไม่แสดงสูตร 165 mL, จำนวนภาชนะ, pH และค่าตวง Haiter ที่คำนวณแล้ว
  - Step gate ถูกข้ามได้: เลือก Passed + บันทึกร่างแล้วปุ่มขั้นถัดไปเปิด แม้ยังไม่มีรูปบังคับและยังไม่กด “ยืนยันผลของขั้นนี้”
  - readiness checkbox ของขั้นก่อนรั่วไปขั้นถัดไป ไม่ reset เมื่อเปลี่ยน step
  - material matcher แปล “แว่นขยาย” เป็นแว่นนิรภัย (“บังด้านหน้าและด้านข้าง”)
  - รายการอุปกรณ์จำนวนมากยังใช้ข้อความ generic “1 ชิ้นหรือ 1 ชุด” และ “ตรงกับชื่อนี้” ซึ่งมือใหม่ใช้เลือกของจริงไม่ได้
  - ขั้นเตรียมอาหารยังอ้าง “ตามสูตร/ตาม Protocol/ตามเงื่อนไข” โดยไม่แสดงค่าของ Lot ในหน้าเดียว
  - ปุ่ม “เปิดสูตรอาหารและเครื่องคำนวณ” เปิดหน้าที่มีเพียงตาราง 100/250/500/1,000 mL และตัวอย่าง working stock ไม่มี input หรือเครื่องคำนวณ interactive
  - Dashboard แสดง “6 Protocol steps” ขัดกับ Guided Protocol ของ Lot ที่มี 22 ขั้น
  - Demo mode ไม่เก็บ Plant/Lot หลัง reload; กลับเข้า URL เดิมแล้วขึ้น “ไม่พบ Lot”
- สิ่งที่ทำงานถูกต้อง:
  - Wizard เตือนและบล็อกเมื่อกระปุกเพาะน้อยกว่าจำนวน explant
  - เมนูหลัก, Plants, Experiments, Protocols, Knowledge, Research และ Dataset Review เปิดได้โดยไม่มี console error
  - Dataset Review มี empty state และเส้นทางกลับไปเพิ่มรูป
  - ขั้นเตรียมอาหารระบุถูกว่าต้องถ่ายฉลาก batch/ภาชนะอาหาร ไม่ใช่ต้นไม้
- ข้อสรุป: ระบบยังไม่พร้อมให้มือใหม่เริ่มทดลองจริงแบบอาศัยหน้าจอเพียงอย่างเดียว จนกว่าจะแก้ required-evidence gate, แสดงค่าคำนวณของ Lot ในขั้นเตรียมอาหาร, ทำ calculator จริง, แก้ Plant→Wizard hydration และแก้คำอธิบายอุปกรณ์

## 2026-07-27 — Beginner audit blocker fixes

- แก้ required-evidence gate:
  - `บันทึกร่าง` บันทึกสถานะ `Pending` เสมอ ไม่สามารถทำให้ขั้นผ่านหรือเปิดปุ่มขั้นถัดไป
  - `ยืนยันผลของขั้นนี้` เท่านั้นที่บันทึก `Passed/Needs review/Failed` และยังตรวจ note, measurement, photo และ readiness ตามข้อกำหนด
- reset Beginner checklist ทุกครั้งที่เปลี่ยนขั้นด้วย step-specific component key ป้องกัน checkbox รั่วข้ามขั้น
- แก้ Plant → Experiment Wizard:
  - ใช้ query parameter ผ่าน `useSearchParams` ภายใต้ Suspense
  - hydrate Plant name, taxon และเลือก Pink Princess/Violin template ที่ตรงกับ Plant ก่อน render Wizard
- เพิ่ม equipment checklist ของ Haiter และหม้อนึ่งให้ครอบคลุม MS salts, sucrose, agar, stock hormone, เครื่องชั่ง, pH, ภาชนะ, PPE และพื้นที่ทำงาน
- Summary Wizard แสดงปริมาตรอาหารรวม จำนวนกระปุกแยกประเภท ค่า source/target chlorine และคำสั่งตวง
- เพิ่มเครื่องคำนวณสูตรจริงใน Taxon monograph:
  - เลือกระยะ Establishment/Multiplication/Rooting
  - กรอกกระปุกเพาะ, Blank, สำรอง, mL ต่อกระปุก และ % เผื่อสูญเสีย
  - คำนวณปริมาตรรวมและส่วนผสมตาม batch จริง
  - แยกคำเตือนว่าค่าฮอร์โมน mg ต้องแปลงผ่าน stock/working stock ไม่ใช่ตวงเป็น mg โดยตรง
- แก้ material guidance:
  - “แว่นขยาย” ไม่ถูกตีความเป็นแว่นนิรภัยแล้ว
  - เพิ่มคำอธิบายเฉพาะสำหรับ MS basal salts, sucrose, agar, stock hormone, เครื่องชั่ง และ Haiter
- เพิ่ม regression tests สำหรับ draft status, magnifying glass และ recipe calculator
- Browser sandbox ยืนยัน:
  - calculator render พร้อม 5 numeric inputs + recipe selector
  - ค่าเริ่มต้น 5 กระปุกคำนวณ 138 mL
  - เปลี่ยนเป็นกระปุกเพาะ 4 ใบแล้วคำนวณใหม่เป็น 165 mL สำหรับ 6 กระปุก
  - Plant Pink Princess เปิด Wizard แล้วเลือก Pink Princess template และเก็บชื่อ Plant ถูกต้อง
- Verification:
  - `npm test -- --run`: ผ่าน 235 tests, skip 10
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `npm run firebase:verify`: ผ่าน 245 tests บน Auth/Firestore emulator
  - `npm run ui:verify`: ผ่าน 14 viewport ตั้งแต่ 360 ถึง 1920px

## 2026-07-27 — Working Stock Calculator สำหรับปริมาตรต่ำกว่าที่เครื่องมือตวงได้

- เพิ่มเครื่องคำนวณ `Working Stock` แบบ interactive ในหน้า Monograph/สูตรอาหาร
- ช่องกรอก:
  - มวลสารที่สูตรต้องการ (mg)
  - ความเข้มข้น stock เดิมบนฉลาก (mg/mL)
  - ปริมาตรต่ำสุดที่เครื่องมือตวงได้ (mL)
  - ปริมาตร working stock ที่ต้องการเตรียม (mL)
- ระบบแยก `mg` ออกจาก `mL` ชัดเจน และไม่ให้ผู้ใช้เดาปริมาตร
- ระบบเลือก dilution แบบ 1:10, 1:100 หรือ 1:1000 ที่ทำให้ทั้งการเตรียมและการเติมอยู่ในช่วงที่เครื่องมือตวงได้
- ตัวอย่างที่ยืนยันใน browser sandbox:
  - ต้องการ 0.0065 mg
  - stock เดิม 1 mg/mL
  - เครื่องมือตวงต่ำสุด 0.1 mL
  - เตรียม working stock 10 mL
  - ผล: เจือจาง 1:100 โดยตวง stock เดิม 0.1 mL + ตัวทำละลายที่ฉลากอนุญาต 9.9 mL
  - ได้ working stock 0.01 mg/mL และตวง 0.65 mL ใส่อาหาร
- เพิ่มลิงก์ `คำนวณ working stock ปริมาตรเล็ก` จากขั้นเตรียมอาหารใน Guided Protocol โดยตรง
- ข้อจำกัดด้านความปลอดภัย:
  - ระบบไม่สมมติว่าน้ำเป็นตัวทำละลาย
  - ผู้ใช้ต้องตรวจตัวทำละลาย/วิธีละลายจากฉลากหรือเอกสารของสาร
  - หากไม่มี dilution ที่เครื่องมือตวงได้ ระบบบล็อกและให้เพิ่มปริมาตร working stock หรือเปลี่ยนเครื่องมือ
- Verification:
  - `npm test -- --run`: ผ่าน 240 tests, skip 10
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `npm run firebase:verify`: ผ่าน 250 tests
  - `npm run ui:verify`: ผ่าน 14 viewport ตั้งแต่ 360 ถึง 1920px
  - Browser sandbox: ยืนยันค่าตัวอย่างและคำสั่งตวงครบทุกบรรทัด

## 2026-07-27 — เพิ่มการฆ่าเชื้อภาชนะเพาะและฝาใน Guided Protocol

- แก้ช่องว่างที่ Protocol เดิมกล่าวถึง “ภาชนะพร้อม” แต่ไม่สอนวิธีทำให้ภาชนะและฝาปลอดเชื้อ
- Guided Protocol แบบ Haiter เพิ่มเป็น 23 ขั้น โดยมีขั้นใหม่ `ฆ่าเชื้อภาชนะเพาะและฝาแบบ Haiter` ก่อนแบ่งอาหาร
- ขั้น Haiter สอนทีละข้อ:
  - ตรวจรอยแตก รอยบิ่น การบิดงอ ฝาปิด และคราบ
  - ล้างน้ำยาล้างภาชนะ ล้างจนไม่มีฟอง และล้างรอบสุดท้ายด้วยน้ำกลั่น/deionized
  - เตรียม 5% v/v ของผลิตภัณฑ์ bleach ตาม CSUP: ผลิตภัณฑ์ 5 mL แล้วเติมน้ำให้ครบ 100 mL
  - เตือนชัดว่า 5% v/v ของผลิตภัณฑ์ไม่ใช่ active chlorine 5%
  - ให้สารสัมผัสผิวด้านใน ขอบปาก และฝา
  - คว่ำภาชนะ/ฝาบนถาดที่ผ่านสาร 10 นาที
  - ห้ามล้างซ้ำด้วยน้ำที่ไม่ได้ทำให้ปลอดเชื้อ
  - ติดรหัสและแยก Blank control
- ขั้นดังกล่าวมีสถานะ `Experimental` เพราะเป็นการประยุกต์จากงาน CSUP/ภาชนะ non-autoclavable ไม่ใช่งานตรง Pink Princess หรือ Violin
- เพิ่มแหล่งอ้างอิง:
  - Peiris et al. 2012, CSUP technique, DOI 10.4038/jnsfsr.v40i1.4168
  - Matsumoto et al. 2009, Acta Horticulturae 839:42, DOI 10.17660/ActaHortic.2009.839.42
- Guided Protocol แบบหม้อนึ่งเพิ่มขั้น `ตรวจและเตรียมภาชนะเพาะสำหรับหม้อนึ่ง`:
  - ต้องมีข้อมูลยืนยันว่าภาชนะ/ฝาทน 121°C และแรงดัน
  - ล้างคราบ ติดป้ายทนความร้อน และแยก Blank
  - ระบุชัดว่าการล้างยังไม่ทำให้ปลอดเชื้อ ภาชนะ ฝา และอาหารจะถูกฆ่าเชื้อพร้อมกันในรอบหม้อนึ่ง
- ทั้งสองวิธีบังคับ note + รูปหลักฐานก่อนยืนยันผ่าน
- Dashboard demo step count ปรับจาก 22 เป็น 23 ให้ตรงกับ workflow
- Verification:
  - `npm test -- --run`: ผ่าน 242 tests, skip 10
  - `npm run firebase:verify`: ผ่าน 252 tests
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `npm run ui:verify`: ผ่าน 14 viewport ตั้งแต่ 360 ถึง 1920px

## 2026-07-27 — Close remaining beginner audit findings

- ปิดข้อ 3: ขั้นเตรียมอาหารแสดงสูตรของ Lot ในหน้า Protocol โดยตรง:
  - ปริมาตรรวมของ Lot
  - MS strength
  - sucrose, agar และฮอร์โมนตามปริมาตรจริง
  - pH เป้าหมาย
  - ยังมีลิงก์ไปเครื่องคำนวณเพื่อปรับจำนวนกระปุก
- ปิดข้อ 4: Plant Record มีช่องเพิ่มรูป baseline ทั้งต้น:
  - รับเฉพาะไฟล์ภาพ
  - จำกัด 350 KB เพื่อไม่ให้ Firestore document เกินขีดจำกัด
  - แสดง preview ก่อนบันทึก
  - เก็บใน `baselineMediaIds` ของ Plant Record
- ปิดข้อ 9:
  - เพิ่มคำอธิบายเฉพาะสำหรับพื้นที่สะอาด รูป/ข้อมูลต้นไม้ และภาชนะ
  - fallback ไม่ใช้ข้อความ “1 ชิ้นหรือ 1 ชุด” อีกต่อไป
  - fallback บังคับตรวจชื่อ ฉลาก ขนาด หรือช่วงวัด และให้หยุดเมื่อข้อมูลไม่ครบ
- ปิดข้อ 10: Dashboard แสดง 22 Protocol steps และขอบเขต progress 0–21 ตรงกับ Guided Protocol ปัจจุบัน
- ปิดข้อ 11: Demo mode ใช้ localStorage persistence สำหรับ:
  - Plant Records
  - Experiment Lots, Observations และ audit events
  - Protocol/versions/audit
  - Protocol Step Runs
- Browser sandbox ยืนยัน:
  - สร้าง Plant `Persistence Audit` แล้ว reload หน้า Plant ยังอยู่
  - สร้าง Lot `LOT-20260727-060637` แล้ว reload หน้า Lot และ Protocol ยังอยู่
  - Wizard มี checklist 10 รายการ และ Summary แสดง 110 mL, 4 กระปุก, ฉลาก 6%
  - ขั้นเตรียมอาหารแสดง 110 mL, sucrose 3.3 g, agar 0.825 g และ pH 5.7–5.8
  - Dashboard แสดง 22 Protocol steps
- Verification:
  - `npm test -- --run`: ผ่าน 237 tests, skip 10
  - `npm run lint`: ผ่านโดยไม่มี warning
  - `npm run build`: ผ่าน
  - `npm run firebase:verify`: ผ่าน 247 tests
  - `npm run ui:verify`: ผ่าน 14 viewport ตั้งแต่ 360 ถึง 1920px

## 2026-07-27 — SAB และการฆ่าเชื้อพื้นที่ตามอุปกรณ์จริง

- ก่อนรอบนี้ Protocol กล่าวถึงการเตรียมพื้นที่ปลอดเชื้อแบบกว้างเกินไป และยังไม่มี input สำหรับสร้างคำแนะนำตามอุปกรณ์ที่ผู้ใช้มีจริง
- Wizard ขั้นอุปกรณ์รองรับข้อมูลเพิ่ม:
  - พื้นที่ทำงาน: Still-Air Box (SAB) หรือตู้ลมสะอาด
  - สารเช็ดพื้นผิว: alcohol หรือ Haiter ตามฉลาก
  - วิธีใช้: เช็ด หรือพ่นลงผ้าแล้วเช็ด
  - alcohol percent หรือเปอร์เซ็นต์ Haiter จากฉลาก/เป้าหมาย/ปริมาตรที่จะผสม
  - contact time จากฉลาก
  - รายการอุปกรณ์อื่นที่ผู้ใช้มีจริง
- Guided Protocol นำค่าเหล่านี้มาสร้างคู่มือเฉพาะ Lot:
  - สอนทำความสะอาดคราบที่มองเห็นก่อนฆ่าเชื้อ
  - ถ้าใช้ SAB ให้ปิดช่อง เปิดทิ้งให้อากาศนิ่งอย่างน้อย 15 นาทีหลังจัดของ
  - ถ้าเลือกพ่น ให้พ่นสารลงผ้านอก SAB แล้วเช็ด ไม่พ่นเป็นละอองภายในกล่อง
  - ถ้าเลือก Haiter จะแสดงปริมาตรจากขวด ปริมาตรน้ำ และปริมาตรรวมจากค่าที่กรอก
  - แสดงอุปกรณ์ที่ผู้ใช้กรอกไว้ในรายการของที่ต้องเตรียม
  - บังคับบันทึก note และภาพสภาพพื้นที่ก่อนผ่านขั้น
- กฎความปลอดภัย:
  - ห้ามผสมหรือใช้ Haiter ทับกับ alcohol, กรด, ammonia หรือผลิตภัณฑ์ทำความสะอาดอื่น
  - ห้ามมีเปลวไฟ ความร้อน หรือประกายไฟใกล้ alcohol
  - ไม่พ่นสารเข้าตู้ลม/HEPA หรือสร้างละอองในพื้นที่ปิด
  - contact time ต้องมาจากฉลากผลิตภัณฑ์ ผู้ใช้ต้องกรอกก่อนสร้าง Lot
- Lot เก่าที่ไม่มี workspace snapshot จะแสดงคำเตือนและไม่เดาค่าการฆ่าเชื้อแทนผู้ใช้ ต้องสร้าง Lot ใหม่ผ่าน Wizard
- แหล่งอ้างอิงด้านความปลอดภัยเพิ่มจาก CDC และ WHO/NCBI และติดสถานะ `Adapted`
- Verification:
  - `npm test -- --run`: ผ่าน 247 tests, skip 10
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `npm run firebase:verify`: ผ่าน 257 tests
  - `npm run ui:verify`: ผ่านเส้นทาง Wizard → Lot → Guided Protocol ที่ 14 viewport ตั้งแต่ 360 ถึง 1920px

## 2026-07-27 — สูตรอาหารและเครื่องคำนวณภายใน Lot

- แก้สาเหตุที่ Wizard แสดง 110 mL แต่หน้า recipes กลับคำนวณ 138 mL:
  - เดิม Lot เก็บเพียง `mediumVolumeMl` ส่วนหน้า recipes มีค่าเริ่มต้นเครื่องคำนวณของตนเอง
  - เพิ่ม `MediumBatchSnapshot` เป็นแหล่งข้อมูลกลาง เก็บจำนวน explant, กระปุกเพาะ, Blank, สำรอง, mL ต่อกระปุก, เปอร์เซ็นต์เผื่อสูญเสีย, ปริมาตรใช้งาน และปริมาตรรวม
  - validation ปฏิเสธข้อมูลเมื่อยอดรวมกระปุก ปริมาตรใช้งาน หรือปริมาตร Lot ไม่ตรงกับ snapshot
- ขั้นเตรียมอาหารแสดงข้อมูลในหน้าเดียว ไม่บังคับเปิดหน้าอื่น:
  - ชื่อสูตรและสถานะหลักฐาน
  - ปริมาตรจริงจาก batch ของ Lot
  - จำนวนกระปุกแยกเพาะ/Blank/สำรอง
  - MS strength, sucrose, agar, BAP/NAA และ pH ตามปริมาตรจริง
  - เครื่องคำนวณ stock แยกแต่ละฮอร์โมน
  - ผู้ใช้กรอกเฉพาะความเข้มข้น mg/mL จากฉลาก stock ระบบแสดงคำสั่งตวงโดยตรงหรือสร้าง working stock ทีละข้อ
- คำสั่งในคู่มือขั้นเตรียมอาหารเปลี่ยนจาก “ตามสูตร/ตาม Protocol” เป็นตัวเลขจริงของ Lot
- ลิงก์ภายนอกเหลือไว้เฉพาะอ่านที่มาของสูตร ไม่ใช่ขั้นตอนบังคับ
- แก้ไม่ให้กรอบสูตรอาหารแสดงผิดในทุก profile step; แสดงเฉพาะ `prepare-haiter-medium` หรือ `prepare-pressure-medium`
- Batch planner แสดงทั้งวิธี Haiter และหม้อนึ่งแรงดัน ไม่ซ่อนค่าปริมาตรเมื่อเลือกหม้อนึ่ง
- เพิ่ม `UI_VIEWPORT` ให้สคริปต์ sandbox เลือกตรวจ viewport เดียวระหว่างวินิจฉัยได้ โดยค่าเริ่มต้นยังตรวจครบ 14 ขนาด
- Verification:
  - `npm test -- --run`: ผ่าน 249 tests, skip 10
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `npm run firebase:verify`: ผ่าน 259 tests
  - `npm run ui:verify`: ผ่าน 14 viewport ตั้งแต่ 360 ถึง 1920px

## 2026-07-27 — ลบคำกำกวม “ตามวิธีของห้อง”

- ห้ามใช้ข้อความ “ทำให้วุ้นละลายตามวิธีของห้อง” ใน Protocol มือใหม่
- ขั้นเตรียมอาหารแสดงวิธีตรง:
  - เติมน้ำให้ครบปริมาตร batch และใช้ภาชนะทนความร้อนที่มีพื้นที่ว่างเหนือของเหลว
  - ให้ความร้อนระดับต่ำถึงปานกลางและใช้แท่งแก้วคนต่อเนื่อง
  - ตรวจว่าไม่มีเม็ดหรือก้อน agar เกาะแท่งแก้วและของเหลวสม่ำเสมอ
  - ถ้าฟองสูงใกล้ล้น ให้ปิดความร้อนและยกออกด้วยถุงมือกันความร้อน
- วิธี Haiter:
  - ปิดคลุมภาชนะอย่างหลวมเพื่อกันฝุ่น
  - ใช้เทอร์โมมิเตอร์รอให้อาหารลดถึง 55–60°C ก่อนเติม Haiter
  - เติมตามค่าที่ระบบคำนวณ คน แบ่ง และติดฉลาก
- วิธีหม้อนึ่ง:
  - แบ่งอาหารลงภาชนะทนแรงดัน ปิดตามคู่มือภาชนะ ติดฉลาก แล้วไปขั้นฆ่าเชื้อด้วยแรงดัน
- เพิ่มเตาให้ความร้อน ภาชนะทนความร้อน แท่งแก้ว เทอร์โมมิเตอร์ และถุงมือกันความร้อนใน checklist อุปกรณ์
- เพิ่ม automated test ป้องกันคำ “วิธีของห้อง” กลับเข้าคู่มือ
- Verification:
  - targeted test: ผ่าน 16 tests
  - `npm run lint`: ผ่าน
  - `npm run build`: ผ่าน
  - `npm run firebase:verify`: ผ่าน 260 tests
  - `npm run ui:verify`: ผ่าน 14 viewport ตั้งแต่ 360 ถึง 1920px
