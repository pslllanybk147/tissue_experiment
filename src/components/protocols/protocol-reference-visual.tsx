import type { ProtocolVisualAid } from "@/lib/domain/models";

export function ProtocolReferenceVisual({ visual }: { visual: ProtocolVisualAid }) {
  return (
    <figure className="protocol-visual-aid">
      <div
        className={`protocol-visual-canvas protocol-visual-${visual.kind}`}
        role="img"
        aria-label={visual.title}
      >
        {visual.kind === "node-cut-diagram" ? <NodeCutDiagram />
          : visual.kind === "medium-placement-diagram" ? <MediumPlacementDiagram />
            : visual.kind === "contamination-diagram" ? <ContaminationDiagram />
              : <ProcessFlowDiagram labels={visual.labels ?? []} />}
      </div>
      <figcaption>
        <strong>{visual.title}</strong>
        <p>{visual.caption}</p>
        <div className="protocol-visual-meta">
          <span>{visual.evidenceState}</span>
          {visual.sourceUrl ? (
            <a href={visual.sourceUrl} target="_blank" rel="noreferrer">
              {visual.sourceLabel ?? "เปิดแหล่งอ้างอิง"} ↗
            </a>
          ) : null}
        </div>
      </figcaption>
    </figure>
  );
}

function ProcessFlowDiagram({ labels }: { labels: string[] }) {
  const items = labels.length ? labels : ["อ่านคำแนะนำ", "ทำตามลำดับ", "ตรวจผล"];
  return (
    <ol className="visual-process-flow">
      {items.slice(0, 3).map((label, index) => (
        <li key={`${index}-${label}`}><span>{index + 1}</span><strong>{label}</strong></li>
      ))}
    </ol>
  );
}

function ContaminationDiagram() {
  return (
    <div className="visual-contamination-grid">
      <span className="visual-clean"><i />ปกติ: ไม่มีเส้นใยหรือเมือก</span>
      <span className="visual-mold"><i />รา: มีเส้นใยหรือปุยแผ่ออก</span>
      <span className="visual-slime"><i />แบคทีเรีย: มีเมือกหรือฝ้ารอบชิ้นพืช</span>
      <span className="visual-browning"><i />Browning: เนื้อเยื่อหรือน้ำอาหารเปลี่ยนน้ำตาล</span>
    </div>
  );
}
function NodeCutDiagram() {
  return (
    <>
      <span className="visual-tip">ตายอด</span>
      <span className="visual-stem" />
      <span className="visual-leaf visual-leaf-top" />
      <span className="visual-leaf visual-leaf-bottom" />
      <span className="visual-node visual-node-top">ข้อ + ตาข้าง</span>
      <span className="visual-node visual-node-bottom">ข้อถัดไป</span>
      <span className="visual-cut-line">แนวตัดใต้ข้อ</span>
      <span className="visual-keep">ส่วนนี้เก็บเป็น explant</span>
    </>
  );
}

function MediumPlacementDiagram() {
  return (
    <>
      <span className="visual-vessel" />
      <span className="visual-medium">อาหารวุ้น</span>
      <span className="visual-explant" />
      <span className="visual-shoot">ยอดอยู่เหนือวุ้น</span>
      <span className="visual-base">โคนแตะอาหารเล็กน้อย</span>
    </>
  );
}
