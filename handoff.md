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

### Protocol media implementation checkpoint 7 — 2026-07-23

- ผู้ใช้ยืนยันตั้งค่า Firebase Admin variables ใน Vercel เรียบร้อยแล้ว
- เพิ่ม `formatPrivateKey()` ใน `src/lib/firebase/admin.ts` และ `admin.test.ts` เพื่อแปลง RSA Private Key ที่ถูกตัด `\n` หรือรวมเป็นบรรทัดเดียวกลับเป็น PEM format มาตรฐานอัตโนมัติ
- เพิ่ม `verifyFirebaseToken()` พร้อม fallback ไปยัง `jose` ESM JWKS (`https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com`) เมื่อ `firebase-admin` / `jwks-rsa` ล้มเหลวจากการ require CommonJS บน Vercel
- ขยาย `serverExternalPackages: ["firebase-admin", "jwks-rsa", "jose"]` ใน `next.config.ts`
- สั่ง push deployment ใหม่เพื่อให้ Vercel บันทึก environment snapshot และโค้ดระบบ fallback ชุดล่าสุด
- ลำดับถัดไป: รอ Vercel Preview build เสร็จสิ้น แล้วทดสอบ Sign-in + อัปโหลดสื่อสังเกตการณ์ที่ Lot `QA-20260722`






