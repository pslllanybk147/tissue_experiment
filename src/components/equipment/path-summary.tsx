import { EvidenceBadge, evidenceLabel } from "@/components/guide/evidence-badge";
import { capabilityLabel, equipmentLabel } from "@/lib/equipment/capabilities";
import type { ResolvedPath } from "@/lib/equipment/resolve-path";
import type { ReadinessStatus, TrialReadiness } from "@/lib/equipment/trial-readiness";

const readinessLabel: Record<ReadinessStatus, string> = {
  ready: "พร้อม",
  experimental: "ใช้ได้แบบทดลอง",
  blocked: "ยังทำไม่ได้",
  unknown: "ยังไม่ทราบ",
};

function ReadinessSummary({ readiness }: { readiness: TrialReadiness }) {
  return (
    <section className="cl-workspace-section">
      <div className="cl-status-notice" data-tone={readiness.overall === "blocked" ? "blocked" : "success"}>
        <h2 className="pl-h2">{readiness.overall === "blocked" ? "ยังเริ่มชุดทดลองจริงไม่ได้" : "สถานะความพร้อมของชุดทดลอง"}</h2>
        <p className="pl-lede" style={{ marginTop: "6px" }}>สถานะรวม: {readinessLabel[readiness.overall]} · ดูเหตุผลแยกทีละหัวข้อด้านล่าง</p>
      </div>
      <div className="cl-readiness-list">
        {readiness.capabilities.map((item) => (
          <article className="cl-readiness-item" data-status={item.status} key={item.id}>
            <p className="pl-mono">{readinessLabel[item.status]}</p>
            <h3 className="pl-h2" style={{ marginTop: "4px" }}>{item.title}</h3>
            <p className="pl-lede" style={{ marginTop: "8px" }}><strong>มีอะไร</strong> {item.have}</p>
            <p className="pl-lede" style={{ marginTop: "6px" }}><strong>ยังขาดอะไร</strong> {item.missing}</p>
            <p className="pl-lede" style={{ marginTop: "6px" }}><strong>ทำอะไรต่อ</strong> {item.next}</p>
          </article>
        ))}
      </div>
      <section className="cl-equipment-section">
        <h3 className="pl-h2">ความพร้อมแยกตามแขนทดลอง</h3>
        <p className="pl-meta" style={{ marginTop: "6px" }}>chlorinated rinse เป็นน้ำ rinse ทดลอง ไม่ใช่น้ำปลอดเชื้อ และไม่ปลดล็อกแขนที่ต้องใช้น้ำปลอดเชื้อ</p>
        <div className="cl-readiness-list">
          {readiness.arms.map((arm) => (
            <article key={arm.armRole} className="cl-readiness-item" data-status={arm.status}>
              <p className="pl-mono">{readinessLabel[arm.status]}</p>
              <h4 className="pl-h2" style={{ marginTop: "4px" }}>{arm.title}</h4>
              <p className="pl-lede" style={{ marginTop: "6px" }}><strong>ต้องใช้</strong> {arm.requiredResources.join(" · ")}</p>
              {arm.blockers.length > 0 ? <p className="pl-lede" style={{ marginTop: "6px" }}><strong>ยังขาด</strong> {arm.blockers.join(" · ")}</p> : null}
              <p className="pl-lede" style={{ marginTop: "6px" }}><strong>ทำอะไรต่อ</strong> {arm.next}</p>
            </article>
          ))}
        </div>
      </section>
      <div className="cl-status-notice" data-tone="warning">
        <h3 className="pl-h2">ข้อควรระวังที่ห้ามข้าม</h3>
        <ul style={{ margin: "8px 0 0", paddingLeft: "20px" }}>
          {readiness.cautions.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>
    </section>
  );
}

export function PathSummary({ path, readiness }: { path?: ResolvedPath; readiness?: TrialReadiness }) {
  if (readiness) return <ReadinessSummary readiness={readiness} />;
  if (!path) return null;
  return (
    <section className="cl-workspace-section">
      <h2 className="pl-h2">เส้นทางที่ระบบจัดให้</h2>

      <div className="cl-readiness-list">
        {path.capabilities.map((item) => (
          <article
            className="cl-readiness-item"
            key={item.capability}
            data-status={item.method ? "ready" : "blocked"}
          >
            <p className="pl-mono">{capabilityLabel[item.capability]}</p>

            {item.method ? (
              <>
                <p className="pl-h2" style={{ marginTop: "4px" }}>{item.method.title}</p>
                {item.method.evidence.note ? (
                  <p className="pl-lede" style={{ marginTop: "6px" }}>{item.method.evidence.note}</p>
                ) : null}
                {item.method.caution ? (
                  <p className="pl-lede" style={{ marginTop: "6px" }}>
                    <strong>ข้อควรระวัง</strong> {item.method.caution}
                  </p>
                ) : null}
                <p style={{ marginTop: "10px" }}><EvidenceBadge level={item.method.evidence.level} /></p>
              </>
            ) : (
              <>
                <p className="pl-h2" style={{ marginTop: "4px" }}>ยังทำไม่ได้ด้วยของที่มี</p>
                <p className="pl-lede" style={{ marginTop: "6px" }}>
                  เลือกทางใดทางหนึ่งด้านล่างแล้วเพิ่มของที่ต้องใช้ ระบบจะไม่เลือกให้เพราะแต่ละทางมีความเสี่ยงต่างกัน
                </p>
                <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                  {item.alternatives.map((option) => (
                    <li className="pl-card" key={option.id} style={{ background: "var(--pl-sunk)" }}>
                      <p style={{ margin: 0, fontWeight: 700 }}>{option.title}</p>
                      <p className="pl-meta" style={{ marginTop: "4px" }}>
                        ต้องมี {option.requires.map((id) => equipmentLabel[id]).join(" และ ")}
                      </p>
                      {option.evidence.note ? (
                        <p className="pl-lede" style={{ marginTop: "6px" }}>{option.evidence.note}</p>
                      ) : null}
                      {option.caution ? (
                        <p className="pl-lede" style={{ marginTop: "6px" }}>
                          <strong>ข้อควรระวัง</strong> {option.caution}
                        </p>
                      ) : null}
                      <p style={{ marginTop: "10px" }}><EvidenceBadge level={option.evidence.level} /></p>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </article>
        ))}
      </div>

      <div className="pl-card" style={{ marginTop: "14px", background: path.overallLevel ? "var(--pl-yellow)" : "var(--pl-stop)", color: path.overallLevel ? "var(--pl-chip-ink)" : undefined }}>
        <p className="pl-mono" style={{ color: path.overallLevel ? "var(--pl-chip-ink)" : undefined }}>
          ระดับของเส้นทางนี้ทั้งเส้น
        </p>
        <p style={{ margin: "4px 0 0", fontSize: "22px", fontWeight: 800 }}>
          {path.overallLevel ? evidenceLabel[path.overallLevel] : "ยังสรุปไม่ได้"}
        </p>
        <p style={{ margin: "8px 0 0", fontSize: "14px" }}>
          {path.overallLevel
            ? "ระดับรวมเท่ากับจุดที่อ่อนที่สุดของเส้นทาง ไม่ใช่จุดที่แข็งที่สุด"
            : "ยังมีสิ่งที่ทำไม่ได้อยู่ จึงยังบอกระดับของทั้งเส้นทางไม่ได้ ต้องเติมของให้ครบก่อน"}
        </p>
      </div>

      <p className="pl-meta" style={{ marginTop: "18px" }}>
        ไม่รู้จักสารที่ระบบเอ่ยชื่อ?{" "}
        <a className="pl-link" href="/substances">
          ดูว่าคืออะไร ซื้อที่ไหน และถ้าไม่มีใช้อะไรแทน
        </a>
      </p>
    </section>
  );
}
