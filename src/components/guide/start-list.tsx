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
    <>
      <h1 className="pl-h1">เลือกต้นที่จะเพาะ</h1>
      <p className="pl-lede" style={{ marginBottom: "20px" }}>
        แตะการ์ดต้นที่ตรงกับต้นของคุณเพื่อเปิดคู่มือได้เลย
      </p>

      <ul className="pl-plant-grid">
        {plantPacks.map((pack) => {
          const image = plantImageUrl(pack.slug);
          const form = pack.growthFormId ? formById(pack.growthFormId) : null;

          return (
            <li key={pack.slug}>
              <Link className="pl-plant-card pl-link" href={`/guide/${pack.slug}`}>
                <div
                  className="pl-plant-card-image"
                  style={image ? { backgroundImage: `url(${image})` } : undefined}
                  role="img"
                  aria-label={pack.commonName}
                >
                  {!image ? (
                    <span className="pl-plant-card-placeholder" aria-hidden="true">
                      {pack.commonName.charAt(0)}
                    </span>
                  ) : null}
                </div>
                <p className="pl-h2" style={{ marginTop: "10px" }}>{pack.commonName}</p>
                <p className="pl-meta">{pack.scientificName}</p>
                {form ? (
                  <p className="pl-meta" style={{ marginTop: "2px" }}>{difficultyLabel[form.beginnerDifficulty]}</p>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="pl-meta" style={{ marginTop: "22px" }}>
        ไม่รู้ว่าต้นของคุณตรงกับชนิดไหนในนี้?{" "}
        <Link className="pl-link" href="/find">ไล่ดูจากลักษณะต้น</Link>
      </p>
    </>
  );
}
