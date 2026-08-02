export function OfflineBanner() {
  return (
    <div
      role="status"
      className="pl-card"
      style={{ background: "var(--pl-yellow)", color: "var(--pl-chip-ink)", marginBottom: "16px" }}
    >
      <p style={{ margin: 0, fontWeight: 700 }}>ตอนนี้ออฟไลน์</p>
      <p style={{ margin: "6px 0 0", fontSize: "14px" }}>
        จดต่อได้ตามปกติ ระบบบันทึกไว้ในเครื่องแล้วและจะซิงก์ขึ้นเซิร์ฟเวอร์ให้เองเมื่อกลับมาออนไลน์
        ช่วงนี้แนบรูปไม่ได้ ให้ถ่ายเก็บไว้ในเครื่องก่อนแล้วค่อยแนบทีหลัง
      </p>
    </div>
  );
}
