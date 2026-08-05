import Link from "next/link";
import type { GrowthForm } from "@/lib/manual/forms/types";
import { EvidenceBadge } from "./evidence-badge";
import { RichText } from "./rich-text";

export type FormPlantLink = { slug: string; commonName: string };

const directionLabel = { above: "เหนือ", below: "ใต้" } as const;

export function FormDetail({ form, plants }: { form: GrowthForm; plants: FormPlantLink[] }) {
  const explant = form.defaultExplant;
  const anchor = form.landmarks.find((landmark) => landmark.id === explant.landmarkId);

  return (
    <>
      <h1 className="pl-h1">{form.label}</h1>
      <p className="pl-lede" style={{ marginTop: "8px" }}>{form.plainDescription}</p>

      {form.referenceImageId ? null : (
        <div className="pl-card" style={{ marginTop: "18px", background: "var(--pl-sunk)" }}>
          <p style={{ margin: 0, fontWeight: 700 }}>ทรงนี้ยังไม่มีภาพอ้างอิง</p>
          <p className="pl-lede" style={{ marginTop: "6px" }}>
            ให้ใช้คำอธิบายวิธีหาข้างล่างเทียบกับต้นจริงที่อยู่ตรงหน้าคุณ
            เราไม่เอาภาพวาดมาแทนเพื่อให้ดูเหมือนมี เพราะภาพที่ไม่ตรงต้นทำให้ตัดผิดตำแหน่งได้
          </p>
        </div>
      )}

      <h2 className="pl-h2" style={{ marginTop: "26px" }}>จุดสังเกตที่ต้องหาให้เจอ</h2>
      <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
        {form.landmarks.map((landmark) => (
          <li className="pl-card" key={landmark.id}>
            <p className="pl-h2">{landmark.term}</p>
            {landmark.aka?.length ? (
              <p className="pl-meta" style={{ marginTop: "2px" }}>เรียกอีกอย่างว่า {landmark.aka.join(" · ")}</p>
            ) : null}
            <p className="pl-lede" style={{ marginTop: "8px" }}>{landmark.whatItIs}</p>
            <p className="pl-lede" style={{ marginTop: "6px" }}><b>หายังไง</b> {landmark.howToFind}</p>
            {landmark.confusedWith ? (
              <p className="pl-lede" style={{ marginTop: "6px" }}><b>อย่าสับสน</b> {landmark.confusedWith}</p>
            ) : null}
          </li>
        ))}
      </ul>

      <h2 className="pl-h2" style={{ marginTop: "26px" }}>ต้นทรงนี้ตัดตรงไหน</h2>
      <div className="pl-card" style={{ marginTop: "12px" }}>
        <p className="pl-lede">
          ตัด{directionLabel[explant.direction]}
          <RichText source={`[[${explant.landmarkId}|${anchor?.term ?? explant.landmarkId}]]`} />
          {" "}{explant.offsetMm} มม. ให้ได้ชิ้นยาว {explant.sizeMm[0]} ถึง {explant.sizeMm[1]} มม.
        </p>
        <p style={{ marginTop: "12px" }}>
          <EvidenceBadge level={explant.evidence.level} />
        </p>
        {explant.evidence.note ? (
          <p className="pl-meta" style={{ marginTop: "8px" }}>{explant.evidence.note}</p>
        ) : null}
      </div>

      {plants.length > 0 ? (
        <>
          <h2 className="pl-h2" style={{ marginTop: "26px" }}>ต้นที่มีคู่มือเฉพาะในทรงนี้</h2>
          <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
            {plants.map((plant) => (
              <li key={plant.slug}>
                <Link
                  className="pl-card pl-link"
                  href={`/guide/${plant.slug}`}
                  style={{ display: "block", color: "inherit", textDecoration: "none" }}
                >
                  <p className="pl-h2">{plant.commonName}</p>
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="pl-lede" style={{ marginTop: "26px" }}>
          ยังไม่มีพืชชนิดใดในทรงนี้ที่มีคู่มือเฉพาะ
        </p>
      )}

      <p className="pl-meta" style={{ marginTop: "26px" }}>
        ต้นของคุณไม่เหมือนที่อธิบายไว้ข้างบน? <Link className="pl-link" href="/find">กลับไปเลือกทรงใหม่</Link>
      </p>
    </>
  );
}
