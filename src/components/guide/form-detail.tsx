import Link from "next/link";
import { cropStyle } from "@/lib/manual/forms/crop";
import type { GrowthForm } from "@/lib/manual/forms/types";
import { EvidenceBadge } from "./evidence-badge";
import { RichText } from "./rich-text";

export type FormPlantLink = { slug: string; commonName: string };

const directionLabel = { above: "เหนือ", below: "ใต้" } as const;

export function FormDetail({ form, plants }: { form: GrowthForm; plants: FormPlantLink[] }) {
  const explant = form.defaultExplant;
  const anchor = form.landmarks.find((landmark) => landmark.id === explant.landmarkId);

  return (
    <article className="cl-guide-article cl-atlas-reading">
      <header className="cl-page-heading"><div><p className="cl-chapter-kicker">คู่มือจำแนกทรง</p><h1>{form.label}</h1><p>{form.plainDescription}</p></div></header>

      {form.referenceImage ? (
        <figure className="pl-figure">
          <div className="pl-figure-stage">
            {/* ใช้ img ธรรมดาไม่ใช่ next/image เพราะไฟล์เป็น static ที่เรารู้ขนาดแน่นอนอยู่แล้ว
                และหมุดต้องวางทับด้วยเปอร์เซ็นต์บนกล่องเดียวกัน */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/forms/${form.referenceImage.file}`}
              alt={form.referenceImage.alt}
              width={form.referenceImage.width}
              height={form.referenceImage.height}
            />
            {form.landmarks.map((landmark, index) =>
              landmark.point ? (
                <span
                  key={landmark.id}
                  className="pl-pin"
                  style={{ left: `${landmark.point.x * 100}%`, top: `${landmark.point.y * 100}%` }}
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
              ) : null,
            )}
          </div>
          <figcaption className="cl-guide-caption">
            ภาพ: {form.referenceImage.speciesShown} · ถ่ายโดย {form.referenceImage.credit} ·{" "}
            {form.referenceImage.license}
            <br />
            ใช้แสดงโครงสร้างของทรงนี้ ไม่ใช่ภาพของทุกชนิดในทรง
          </figcaption>
        </figure>
      ) : (
        <div className="cl-empty-state">
          <strong>ทรงนี้ยังไม่มีภาพอ้างอิง</strong>
          <p>
            ให้ใช้คำอธิบายวิธีหาข้างล่างเทียบกับต้นจริงที่อยู่ตรงหน้าคุณ
            เราไม่เอาภาพวาดมาแทนเพื่อให้ดูเหมือนมี เพราะภาพที่ไม่ตรงต้นทำให้ตัดผิดตำแหน่งได้
          </p>
        </div>
      )}

      <section className="cl-reading-section cl-guide-chapter"><h2>จุดสังเกตที่ต้องหาให้เจอ</h2>
      <ul className="cl-reference-list">
        {form.landmarks.map((landmark, index) => {
          const image = form.referenceImage;
          const swatch = image && landmark.point ? cropStyle(landmark.point, image) : null;

          return (
            <li className="pl-landmark" key={landmark.id}>
              {swatch && image ? (
                <span
                  className="pl-swatch"
                  style={{
                    backgroundImage: `url(/forms/${image.file})`,
                    backgroundSize: swatch.backgroundSize,
                    backgroundPosition: swatch.backgroundPosition,
                  }}
                  aria-hidden="true"
                />
              ) : null}
              <div>
                <h3>
                  {swatch ? `${index + 1} · ` : ""}
                  {landmark.term}
                </h3>
                {landmark.aka?.length ? (
                  <p className="cl-guide-caption">เรียกอีกอย่างว่า {landmark.aka.join(" · ")}</p>
                ) : null}
                <p>{landmark.whatItIs}</p>
                <p><b>หายังไง</b> {landmark.howToFind}</p>
                {landmark.confusedWith ? (
                  <p><b>อย่าสับสน</b> {landmark.confusedWith}</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
      </section>

      <section className="cl-reading-section cl-guide-chapter"><h2>ต้นทรงนี้ตัดตรงไหน</h2>
      <div>
        <p>
          ตัด{directionLabel[explant.direction]}
          <RichText source={`[[${explant.landmarkId}|${anchor?.term ?? explant.landmarkId}]]`} />
          {" "}{explant.offsetMm} มม. ให้ได้ชิ้นยาว {explant.sizeMm[0]} ถึง {explant.sizeMm[1]} มม.
        </p>
        <p>
          <EvidenceBadge level={explant.evidence.level} />
        </p>
        {explant.evidence.note ? (
          <p className="cl-guide-caption">{explant.evidence.note}</p>
        ) : null}
      </div>
      </section>

      {plants.length > 0 ? (
        <>
          <h2 className="cl-guide-subheading">ต้นที่มีคู่มือเฉพาะในทรงนี้</h2>
          <ul className="cl-guide-related-list">
            {plants.map((plant) => (
              <li key={plant.slug}>
                <Link
                  className="cl-choice-row"
                  href={`/guide/${plant.slug}`}
                >
                  <strong>{plant.commonName}</strong>
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="cl-support-copy">
          ยังไม่มีพืชชนิดใดในทรงนี้ที่มีคู่มือเฉพาะ
        </p>
      )}

      <p className="cl-support-copy">
        ต้นของคุณไม่เหมือนที่อธิบายไว้ข้างบน? <Link className="cl-inline-link" href="/find">กลับไปเลือกทรงใหม่</Link>
      </p>
    </article>
  );
}
