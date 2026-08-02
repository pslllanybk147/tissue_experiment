import Link from "next/link";

export type PlantPickerItem = {
  slug: string;
  scientificName: string;
  commonName: string;
  summary: string;
  stepCount: number;
  durationLabel: string;
};

export function PlantPicker({ plants }: { plants: PlantPickerItem[] }) {
  return (
    <>
      <h1 className="pl-h1">จะเพาะต้นอะไรดี</h1>
      <p className="pl-lede" style={{ marginBottom: "22px" }}>
        เลือกต้นแล้วอ่านคู่มือได้เลย ยังไม่ต้องสมัครสมาชิก
      </p>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
        {plants.map((plant) => (
          <li key={plant.slug}>
            <Link
              className="pl-card pl-link"
              href={`/guide/${plant.slug}`}
              style={{ display: "block", color: "inherit", textDecoration: "none" }}
            >
              <p className="pl-h2">{plant.commonName}</p>
              <p className="pl-meta" style={{ fontStyle: "italic" }}>{plant.scientificName}</p>
              <p className="pl-lede" style={{ marginTop: "8px" }}>{plant.summary}</p>
              <p className="pl-mono" style={{ marginTop: "10px" }}>
                {plant.stepCount} ขั้น · {plant.durationLabel}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
