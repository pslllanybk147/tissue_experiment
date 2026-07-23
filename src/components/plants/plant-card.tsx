import Image from "next/image";
import type { PlantProfile } from "../../lib/domain/plant-profile";

type PlantCardProps = {
  profile: PlantProfile;
};

export function PlantCard({ profile }: PlantCardProps) {
  const difficultyBadgeClass =
    profile.tcDifficulty === "Low"
      ? "badge-healthy"
      : profile.tcDifficulty === "Medium"
      ? "badge-review"
      : "badge-at-risk";

  return (
    <article className="experiment-card plant-card">
      <div className="plant-card-media" style={{ position: "relative", width: "100%", height: 200, borderRadius: 8, overflow: "hidden" }}>
        <Image
          src={profile.referenceImageUrl}
          alt={profile.tradeName}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
          style={{ objectFit: "cover" }}
        />
        <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 4 }}>
          <span className={`badge ${difficultyBadgeClass}`}>
            TC Difficulty: {profile.tcDifficulty}
          </span>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h3 style={{ margin: 0, fontSize: "1.15rem" }}>{profile.cultivarName}</h3>
          <span className="badge" style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.08)" }}>
            {profile.variegationType}
          </span>
        </div>
        <p style={{ margin: "4px 0 8px", fontStyle: "italic", fontSize: "0.85rem", opacity: 0.7 }}>
          {profile.scientificName} ({profile.tradeName})
        </p>
        <p style={{ fontSize: "0.9rem", lineHeight: 1.4, margin: "8px 0" }}>
          {profile.description}
        </p>

        <div style={{ marginTop: 12, padding: 10, borderRadius: 6, background: "rgba(0,0,0,0.2)", fontSize: "0.8rem" }}>
          <div><strong>สูตรอาหารแนะนำ:</strong> {profile.recommendedMedium}</div>
          <div style={{ marginTop: 4 }}><strong>รอบเปลี่ยนวุ้น:</strong> ทุก {profile.subcultureCycleDays} วัน</div>
        </div>

        <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", opacity: 0.85 }}>
          <span>
            📌 <strong>Source:</strong> {profile.licenseInfo.sourceName}
          </span>
          <a
            href={profile.licenseInfo.licenseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="badge"
            style={{ textDecoration: "none", color: "#a3e635", border: "1px solid rgba(163,230,53,0.3)" }}
          >
            {profile.licenseInfo.license}
          </a>
        </div>
      </div>
    </article>
  );
}
