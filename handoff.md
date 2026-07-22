ต้องมีการบันทึกทุกครั้งที่งานจบ

# Philodendron Lab — Handoff

## Project purpose

เว็บพื้นที่วิจัยสำหรับจัดการ Protocol, Experiment Lots, งานวิจัย และรูปภาพของโครงการเพาะเลี้ยงเนื้อเยื่อ Philodendron ด่าง โดยใช้แนวทาง visual จาก Gridgeist และออกแบบให้รองรับ desktop/mobile ในระบบเดียวกัน

## Current status

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
