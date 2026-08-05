import Link from "next/link";
import { plainText } from "@/lib/manual/terms";
import type { ResolvedManual } from "@/lib/manual/types";
import { EvidenceBadge, evidenceLabel } from "./evidence-badge";

export function StepMap({ manual }: { manual: ResolvedManual }) {
  const unsupported = manual.steps.filter((step) => step.evidence.level === "unsupported");

  return (
    <>
      <h1 className="pl-h1">{manual.commonName}</h1>
      <p className="pl-meta" style={{ fontStyle: "italic" }}>{manual.scientificName}</p>
      <p className="pl-lede" style={{ marginTop: "10px" }}>{manual.summary}</p>
      <p className="pl-mono" style={{ marginTop: "10px" }}>
        {manual.steps.length} ขั้น · {manual.durationLabel}
      </p>

      {unsupported.length > 0 ? (
        <div className="pl-card" style={{ background: "var(--pl-stop)", marginTop: "18px" }}>
          <p style={{ margin: 0, fontWeight: 700 }}>
            คู่มือนี้มี {unsupported.length} ขั้นที่ยังไม่มีงานรองรับ
          </p>
          <p className="pl-lede" style={{ marginTop: "6px" }}>
            ขั้นเหล่านี้ยังไม่มีงานวิจัยที่ทำกับพันธุ์นี้โดยตรง ให้ทำกระปุกเปล่าคุมทุกรอบและบันทึกผลจริงไว้เสมอ
          </p>
        </div>
      ) : null}

      <ol style={{ listStyle: "none", margin: "22px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
        {manual.steps.map((step) => (
          <li key={step.id}>
            <Link
              className="pl-card pl-link"
              href={`/guide/${manual.slug}/step/${step.order + 1}`}
              style={{ display: "block", color: "inherit", textDecoration: "none" }}
            >
              <p className="pl-mono">ขั้นที่ {step.order + 1}</p>
              <p className="pl-h2" style={{ marginTop: "4px" }}>{step.title}</p>
              {/* ใช้ข้อความล้วนเพราะการ์ดทั้งใบอยู่ในลิงก์ ซึ่งซ้อน details ไม่ได้ตามมาตรฐาน HTML
                  คำอธิบายศัพท์อยู่ที่หน้าขั้นเดียว (step-detail) ซึ่งไม่ได้อยู่ในลิงก์ */}
              <p className="pl-lede" style={{ marginTop: "4px" }}>{plainText(step.summary)}</p>
              <p style={{ marginTop: "10px" }}>
                <EvidenceBadge level={step.evidence.level} />
              </p>
            </Link>
          </li>
        ))}
      </ol>

      <div className="pl-card" style={{ marginTop: "22px", background: "var(--pl-sunk)" }}>
        <p className="pl-h2">พร้อมลงมือแล้วหรือยัง</p>
        <p className="pl-lede" style={{ marginTop: "6px" }}>
          อ่านให้จบก่อนเริ่มจะดีที่สุด พอกดเริ่มแล้วระบบจะจำให้ว่าทำถึงขั้นไหนและบันทึกค่าที่วัดได้ไว้ให้
        </p>
        <p style={{ marginTop: "14px" }}>
          <Link
            className="pl-chip pl-link"
            href={`/my/rounds/new?slug=${manual.slug}`}
            style={{ background: "var(--pl-yellow)", textDecoration: "none", fontSize: "14px", padding: "8px 16px" }}
          >
            เริ่มรอบเพาะของฉัน
          </Link>
        </p>
        <p className="pl-meta" style={{ marginTop: "10px" }}>ต้องล็อกอินตอนกดปุ่มนี้ เพื่อเก็บบันทึกไว้ให้คุณ</p>
      </div>

      <p className="pl-meta" style={{ marginTop: "20px" }}>
        คำอธิบายระดับหลักฐาน · {evidenceLabel["species-direct"]} คือมีงานวิจัยที่ทำกับพันธุ์นี้โดยตรง ·{" "}
        {evidenceLabel.adapted} คือมีงานรองรับแต่ทำกับพืชอื่น · {evidenceLabel.unsupported} คือยังไม่มีงานตีพิมพ์รองรับ
      </p>
    </>
  );
}
