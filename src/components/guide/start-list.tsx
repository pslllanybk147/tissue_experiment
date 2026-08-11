import Link from "next/link";
import { formById } from "@/lib/manual/forms/registry";
import { plantImageUrl } from "@/lib/manual/plant-images";
import { plantPacks } from "@/lib/manual/registry";

const difficultyLabel: Record<1 | 2 | 3, string> = {
  1: "ง่ายสุดสำหรับมือใหม่",
  2: "ปานกลาง",
  3: "ยาก ควรผ่านทรงง่ายมาก่อน",
};

export function StartList() {
  return (
    <section className="cl-public-section cl-atlas-reading">
      <header className="cl-page-heading">
        <div>
          <p className="cl-chapter-kicker">เริ่มต้นคู่มือ</p>
          <h1>เลือกต้นที่จะเพาะ</h1>
          <p>แตะการ์ดต้นที่ตรงกับต้นของคุณเพื่อเปิดคู่มือได้เลย</p>
        </div>
      </header>

      <ul className="cl-plant-grid" aria-label="ชนิดพืช">
        {plantPacks.map((pack) => {
          const image = plantImageUrl(pack.slug);
          const form = pack.growthFormId ? formById(pack.growthFormId) : null;

          return (
            <li key={pack.slug}>
              <Link className="cl-plant-card" href={`/guide/${pack.slug}`}>
                <div
                  className="cl-plant-card-image"
                  style={image ? { backgroundImage: `url(${image})` } : undefined}
                  role="img"
                  aria-label={pack.commonName}
                >
                  {!image ? (
                    <span className="cl-plant-card-placeholder" aria-hidden="true">
                      {pack.commonName.charAt(0)}
                    </span>
                  ) : null}
                </div>
                <strong>{pack.commonName}</strong>
                <em>{pack.scientificName}</em>
                {form ? (
                  <small>{difficultyLabel[form.beginnerDifficulty]}</small>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>

      <footer className="cl-public-links">
      <p>
        ไม่รู้ว่าต้นของคุณตรงกับชนิดไหนในนี้?{" "}
        <Link className="cl-inline-link" href="/find">ไล่ดูจากลักษณะต้น</Link>
      </p>
      <p>
        รู้ชื่อต้นอยู่แล้ว?{" "}
        <Link className="cl-inline-link" href="/search">ค้นหาโดยตรง</Link>
      </p>
      </footer>
    </section>
  );
}
