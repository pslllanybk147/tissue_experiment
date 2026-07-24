# Audit Viewer and Approved Claim Gate — Design

## Goal

ทำให้ผู้ใช้ตรวจสอบประวัติ source/taxon/claim แบบเจาะจง และเปลี่ยน claim ที่ผ่านการอนุมัติแล้วไปเป็น playbook draft ได้โดยไม่ข้าม evidence gate หรือ publish อัตโนมัติ

## Scope

### Audit viewer

- เพิ่ม filter ในหน้า Knowledge สำหรับ source และ taxon
- แสดงเหตุการณ์ source metadata และ claim review จาก persisted audit
- แสดง before/after ที่อ่านได้ และลิงก์กลับไปยัง source หรือ claim
- claims รุ่นเก่าที่ไม่มี audit ต้องยังแสดงได้ โดยไม่สร้างข้อมูลย้อนหลังขึ้นมาเอง

### Approved claim gate

- เพิ่ม action `สร้าง playbook draft` เฉพาะ claim ที่ `Approved`
- ตรวจว่ามี source, evidence excerpt และ evidence location ก่อนสร้าง
- ใช้ข้อมูล claim เป็น seed ของ draft โดยไม่เปลี่ยน claim และไม่ publish protocol
- claim ที่ Pending review, Rejected, Adapted หรือ Experimental ใช้สร้าง draft ไม่ได้
- playbook draft ต้องมี status `Draft`, evidence state คงตาม claim และมี source/claim references

## Architecture

Knowledge source repository เป็น boundary หลักสำหรับ source, claim และ audit event. UI จะโหลด audit แบบ owner-scoped ผ่าน repository เดิม ไม่อ่าน Firestore ตรงจาก component. Playbook draft ใช้ repository/domain ของ protocol ที่มีอยู่แล้ว หรือ adapter เล็กที่บันทึก draft พร้อม claim/source references หาก protocol repository ยังไม่รองรับ fields นี้ โดย draft เป็น immutable input snapshot หลังสร้าง.

## Error and permission behavior

- owner mismatch และ entity not found ต้องถูกปฏิเสธใน Memory และ Firestore เหมือนกัน
- claim ที่ไม่ Approved แสดงข้อความเหตุผล ไม่ทำ mutation
- missing evidence แสดง error ที่ผู้ใช้แก้ได้
- published protocol ไม่ถูกแก้จาก flow นี้
- ไม่เปิดเผยรายละเอียด Firebase/credential error ให้ client

## Verification

- TDD: repository gate และ audit tests ต้อง fail ก่อน implementation
- `npm run firebase:verify`
- `npm run lint`
- `npm run build`
- sandbox/emulator ก่อนส่งงาน
- อัปเดต `handoff.md` ทุกครั้งที่งานจบ โดยบรรทัดแรกต้องคงเป็น `ต้องมีการบันทึกทุกครั้งที่งานจบ`
