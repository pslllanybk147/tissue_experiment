# Rinse Water and Per-Arm Readiness Integration Design

## Goal

เชื่อมระบบ chlorinated rinse เดิมเข้ากับระบบใหม่โดยไม่ทำให้น้ำล้างทดลองถูกตีความเป็นน้ำปลอดเชื้อทั่วไป และไม่ทำให้ชุดทดลอง 5 แขนเริ่มได้ทั้งที่บางแขนยังขาดทรัพยากรสำคัญ

## Locked protocol decision

- T1 ใช้ Haiter เป็นสารฟอกหลัก แล้วใช้น้ำ NaClO 300 ppm ล้าง 3 รอบ รอบละประมาณหนึ่งนาที
- T2 ใช้ Haiter เป็นสารฟอกหลัก แล้วใช้น้ำ NaDCC 300 ppm ล้าง 3 รอบ รอบละประมาณหนึ่งนาที
- T1/T2 ไม่มี final sterile-water rinse เพราะ chlorinated rinse เป็น protocol เฉพาะของขั้น rinse ตาม `new_idea.md` ไม่ใช่น้ำปลอดเชื้อทั่วไป
- Control-A ใช้ Haiter + น้ำปลอดเชื้อ 3 รอบ
- T3 ใช้ NaDCC 300 ppm แช่ 24–48 ชั่วโมง แล้วล้างด้วยน้ำปลอดเชื้อ 3 รอบ
- Control-B เป็นกระปุกเปล่าและไม่ถูกนับว่ามีความพร้อมของ explant rinse

## Architecture

แยก capability `sterile-water` ออกจาก `chlorinated-rinse` อย่างเด็ดขาด น้ำ chlorinated rinse มี active chlorine เพื่อกดเชื้อในน้ำล้าง แต่ไม่ถูกบันทึกเป็นน้ำปลอดเชื้อ ระบบจะเก็บ rinse preparation record ที่มีสถานะ `planned` หรือ `prepared`; เฉพาะ `prepared` ที่มีค่าผลิตภัณฑ์ batch ปริมาตร และเวลาเตรียมครบจึงใช้ปลดล็อกแขน T1/T2

Readiness จะมีผลลัพธ์ระดับแขนทดลอง โดยแต่ละแขนระบุทรัพยากรที่ต้องใช้เอง ส่วน readiness ภาพรวมจะเป็นสถานะต่ำสุดของแขนที่ต้องเปิดใน template 5 แขน ดังนั้นการมี rinse สำหรับ T1/T2 จะไม่ปลดล็อก Control-A หรือ T3 ที่ยังขาด sterile water

## Data flow

1. Equipment profile เก็บข้อมูลน้ำต้นทาง น้ำปลอดเชื้อ และบันทึก rinse ที่ผู้ใช้เตรียมจริงแยกตามวิธี
2. Calculator/recipe เดิมสร้างค่าเป้าหมาย 300 ppm และปริมาตรรวม 3 ภาชนะ
3. ผู้ใช้ยืนยันผลิตภัณฑ์ batch ปริมาตรจริง และเวลาที่เตรียมในหน้าอุปกรณ์
4. `resolveTrialReadiness` อ่านข้อมูลนั้นและคืนสถานะแยกรายแขน
5. New-trial gate แสดง blocker ของแขนที่ขาด และยังไม่สร้างชุดทดลองจนแขนที่ template ต้องใช้พร้อมทั้งหมด
6. Lot snapshot ที่สร้างใหม่เก็บ protocol ที่ล็อกแล้วและสถานะการเตรียม rinse ไม่ถือว่าแผนที่ยังไม่เตรียมเป็นหลักฐาน

## Compatibility

- ข้อมูล equipment profile เดิมที่ไม่มี rinse record จะถูก normalize เป็น `planned` ไม่ทำให้ข้อมูลเดิมพัง
- lot เก่าที่ไม่มีสถานะ rinse จะอ่านได้ในฐานะข้อมูล legacy แต่ไม่ถูกใช้เป็นหลักฐานว่าเตรียม rinse แล้ว
- `RinseWaterMethod` และ calculator เดิมยังคงใช้ชื่อเดิมเพื่อไม่ทำให้ lot/test เก่าพัง
- `water-bleach` ใน generic capability จะยังอยู่ แต่จะไม่ถูกใช้แทน target 300 ppm ของ T1 โดยอัตโนมัติ

## Verification

- ทดสอบ model normalization และการป้องกันสถานะ `planned` ผ่าน readiness
- ทดสอบ readiness ของ Control-A/T1/T2/T3 แยกกัน
- ทดสอบว่า T1/T2 ไม่มี final sterile-water requirement และ T3 ยังมี
- ทดสอบว่า trial gate ยัง block เมื่อ sterile water ของ Control-A/T3 ขาด
- รัน test, lint, build และ UI verification ก่อน publish
