import Link from "next/link";
import { philodendronSources, type PhilodendronMonograph as Monograph } from "../../lib/domain/philodendron-knowledge";
import { MediaRecipeCalculator } from "./media-recipe-calculator";
import { WorkingStockCalculator } from "./working-stock-calculator";

function evidenceClass(value: string) { return `evidence-label evidence-${value.toLowerCase().replaceAll(" ", "-")}`; }
function scaledAmount(amountPerLiter: number, unit: string, volume: number) {
  if (unit === "×") return `${amountPerLiter}×`;
  const amount = amountPerLiter * volume / 1000;
  return `${Number(amount.toFixed(4))} ${unit.replace("/L", "")}`;
}

export function PhilodendronMonograph({ monograph }: { monograph: Monograph }) {
  return <div className="monograph-layout">
    <header className="route-heading">
      <div><p className="eyebrow">PHILODENDRON MONOGRAPH</p><h1>{monograph.title}</h1><p>{monograph.subtitle}</p></div>
      <div className="route-actions"><span className={evidenceClass(monograph.tissueCulture.steps[0].evidenceState)}>{monograph.tissueCulture.steps[0].evidenceState}</span><Link className="primary-button" href={`/plants/new?taxon=${encodeURIComponent(monograph.taxonId)}`}>เริ่ม Plant Record</Link></div>
    </header>
    <div className="experiment-surface form-alert"><strong>ขอบเขตหลักฐาน:</strong> {monograph.tissueCulture.disclaimer}</div>
    <div className="monograph-sections">
      {monograph.sections.map((section) => <section className="experiment-surface" key={section.id} id={section.id}>
        <div className="knowledge-detail-heading"><div><p className="eyebrow">KNOWLEDGE SECTION</p><h2>{section.title}</h2></div><span className={evidenceClass(section.claims[0]?.evidenceState ?? "Pending review")}>{section.claims[0]?.evidenceState ?? "Pending review"}</span></div>
        <p>{section.summary}</p>
        {section.claims.length ? <ul>{section.claims.map((claim) => <li key={claim.id}>{claim.statement} <span className={evidenceClass(claim.evidenceState)}>{claim.evidenceState}</span>{claim.note && <small className="knowledge-claim-source">{claim.note}</small>}<small className="knowledge-claim-source">อ้างอิง: {claim.sourceIds.map((sourceId) => { const source = philodendronSources.find((item) => item.id === sourceId); return source ? <a href={source.url} key={source.id} target="_blank" rel="noreferrer">{source.title}</a> : <span key={sourceId}>{sourceId}</span>; })}</small></li>)}</ul> : <p className="muted-copy">ยังไม่มี claim ที่ผ่านการตรวจ</p>}
      </section>)}
    </div>
    <section className="experiment-surface" id="tissue-culture">
      <div className="knowledge-detail-heading"><div><p className="eyebrow">GUIDED TISSUE-CULTURE MANUAL</p><h2>คู่มือ 18 ขั้น</h2></div><span>{monograph.tissueCulture.steps.length} steps</span></div>
      <p>{monograph.tissueCulture.mediaNotes.join(" ")}</p>
      <div className="media-recipe-list" id="media-recipes">
        <MediaRecipeCalculator recipes={monograph.tissueCulture.mediaRecipes} />
        {monograph.tissueCulture.mediaRecipes.map((recipe) => <article className="media-recipe" key={recipe.id}>
          <div className="knowledge-detail-heading"><div><h3>{recipe.title}</h3><p>pH เป้าหมาย {recipe.pH} · batch {recipe.batchVolumes.join(" / ")} mL</p></div><span className={evidenceClass(recipe.evidenceState)}>{recipe.evidenceState}</span></div>
          <div className="media-recipe-table-wrap"><table className="media-recipe-table"><thead><tr><th>สาร/องค์ประกอบ</th>{recipe.batchVolumes.map((volume) => <th key={volume}>{volume} mL</th>)}</tr></thead><tbody>{recipe.ingredients.map((ingredient) => <tr key={ingredient.name}><th>{ingredient.name}<small>{ingredient.note}</small></th>{recipe.batchVolumes.map((volume) => <td data-label={`${volume} mL`} key={volume}>{scaledAmount(ingredient.amountPerLiter, ingredient.unit, volume)}</td>)}</tr>)}</tbody></table></div>
          <p className="muted-copy">{recipe.note} ปรับ pH ก่อนทำให้วุ้นแข็ง และบันทึก batch ID ทุกครั้ง</p>
        </article>)}
      </div>
      <WorkingStockCalculator />
      <section className="experiment-surface medium-dilution-guide" aria-labelledby="medium-dilution-title">
        <div className="knowledge-detail-heading"><div><p className="eyebrow">SMALL-VOLUME STOCK GUIDE</p><h3 id="medium-dilution-title">เมื่อปริมาตรฮอร์โมนน้อยเกินกว่าจะตวง</h3></div><span>สูตร C1V1 = C2V2</span></div>
        <p>ถ้าปริมาตรสารตั้งต้นที่ต้องเติมน้อยจนหลอดดูดของคุณดูดไม่ได้อย่างแม่นยำ ให้เจือจางสารนั้นเป็นขวดเล็กอีกขวดก่อน ขวดเล็กนี้เรียกว่า <strong>working stock</strong> แล้วจึงตวง working stock ในปริมาตรที่มากขึ้นลงในอาหาร ห้ามเดาปริมาตรหรือเติมน้ำเพิ่มโดยไม่คำนวณใหม่</p>
        <ol>
          <li>อ่านฉลากสารตั้งต้นก่อน เช่น “1 mg/mL” และจดไว้</li>
          <li>เลือกความเข้มข้นใหม่ที่เครื่องมือวัดได้ง่าย เช่น “0.1 mg/mL”</li>
          <li>ผสมสารตั้งต้นกับตัวทำละลายที่ผู้ผลิตระบุ แล้วติดฉลากชื่อสาร ความเข้มข้น วันที่ และผู้เตรียม</li>
          <li>คำนวณปริมาตรของ working stock ที่ต้องเติมในอาหารชุดสุดท้าย แล้วบันทึกในใบงาน</li>
        </ol>
        <div className="form-alert"><strong>ตัวอย่างแบบไม่ต้องจำศัพท์:</strong> มีสารตั้งต้น 1 mg/mL แต่ต้องการสารที่อ่อนลง 10 เท่า ปริมาตร 10 mL → ตวงสารตั้งต้น 1 mL แล้วเติมตัวทำละลายที่เหมาะสม 9 mL. ถ้าต้องการ BAP 0.5 mg/L ในอาหาร 100 mL และ working stock มีความเข้มข้น 0.1 mg/mL → เติม working stock 0.5 mL (500 µL)</div>
        <details className="beginner-science"><summary>ศัพท์และสูตรสำหรับคนที่ต้องการตรวจซ้ำ</summary><p>หลักการนี้เขียนย่อว่า C₁V₁ = C₂V₂: ความเข้มข้นเดิม × ปริมาตรที่ใช้ = ความเข้มข้นใหม่ × ปริมาตรสุดท้าย แต่ให้ใช้ค่าที่คำนวณแล้วในตารางของระบบ ไม่ต้องคำนวณในหัว</p></details>
        <p className="muted-copy">หากยังไม่แน่ใจ ให้หยุดและตรวจคู่มือการละลาย/ความปลอดภัยของผู้ผลิตสารก่อน ห้ามใช้ตัวทำละลายแทนน้ำโดยเดาเอง และตรวจช่วงการตวงของ micropipette ทุกครั้ง</p>
      </section>
      <section className="explant-guide" aria-labelledby="explant-guide-title">
        <div className="knowledge-detail-heading"><div><p className="eyebrow">CUT & STERILIZATION GUIDE</p><h3 id="explant-guide-title">ตำแหน่งตัดและการฟอก</h3><p>{monograph.tissueCulture.explantGuide.target}</p></div><span className={evidenceClass(monograph.tissueCulture.explantGuide.evidenceState)}>{monograph.tissueCulture.explantGuide.evidenceState}</span></div>
        <div className="beginner-cut-guide"><div><p className="eyebrow">สำหรับผู้เริ่มต้น</p><h4>ดู “ข้อ” ก่อนคิดเรื่องการตัด</h4><p>ข้อคือจุดบนลำต้นที่ก้านใบหรือกาบใบต่อเข้ากับลำต้น ตาข้างมักซ่อนอยู่ใกล้จุดนี้ ไม่ใช่ช่วงลำต้นเรียบระหว่างใบ</p><ol><li>มองหาจุดที่ก้านใบต่อกับลำต้น แล้วทำเครื่องหมายไว้</li><li>เลือกข้อที่ยังเขียว แข็ง ไม่ดำ ไม่ช้ำ และมีตาหรือยอดอ่อนให้เห็น</li><li>ถ่ายรูปต้นทั้งต้นและรูปใกล้ข้อก่อนตัด เพื่อเทียบลายด่างภายหลัง</li><li>ตัดเผื่อความยาวไว้ก่อนฟอก แล้วค่อยตัดแต่งด้านนอกออกในพื้นที่สะอาดตามขนาดของคู่มือนี้</li></ol></div><div className="explant-visual" role="img" aria-label="ภาพจำลองลำต้น แสดงตายอด ข้อ ตาข้าง และตำแหน่งตัดใต้ข้อ"><span className="explant-label explant-label-top">ตายอด</span><span className="explant-stem" /><span className="explant-leaf explant-leaf-one" /><span className="explant-leaf explant-leaf-two" /><span className="explant-node explant-node-one">ข้อ + ตาข้าง</span><span className="explant-node explant-node-two">ข้อ</span><span className="explant-cut">ตำแหน่งตัดใต้ข้อ</span><span className="explant-caption">ภาพจำลอง ไม่ใช่ภาพต้นจริง</span></div></div>
        <section className="explant-reference-gallery" aria-labelledby="explant-reference-gallery-title"><div className="knowledge-detail-heading"><div><p className="eyebrow">REFERENCE GALLERY</p><h4 id="explant-reference-gallery-title">ภาพและแหล่งอ้างอิงตำแหน่ง explant</h4><p>ภาพจากแหล่งอื่นจะไม่ถูกใช้แทนการยืนยันต้นจริง และจะแสดงที่มา/ระดับหลักฐานทุกครั้ง</p></div><span>{monograph.tissueCulture.explantReferences.length} items</span></div><div className="explant-reference-grid">{monograph.tissueCulture.explantReferences.map((reference) => <article className="explant-reference-card" key={reference.id}><div className={`explant-reference-preview explant-reference-${reference.kind}`} aria-hidden="true">{reference.kind === "diagram" ? <><span className="reference-stem" /><span className="reference-node" /><span className="reference-cut-line" /></> : <span>{reference.kind === "research" ? "RESEARCH" : "SOURCE"}</span>}</div><div><span className={evidenceClass(reference.evidenceState)}>{reference.evidenceState}</span><h5>{reference.title}</h5><p>{reference.description}</p>{reference.url ? <a href={reference.url} target="_blank" rel="noreferrer">{reference.label} ↗</a> : <small>{reference.label}</small>}</div></article>)}</div></section>
        <div className="explant-guide-grid"><div><h4>ภาพจำลองตำแหน่งตัด</h4><ol className="cut-diagram">{monograph.tissueCulture.explantGuide.cutDiagram.map((line) => <li key={line}>{line}</li>)}</ol><h4>ขนาดชิ้นพืช</h4><p><strong>ก่อนฟอก:</strong> {monograph.tissueCulture.explantGuide.preSterilizationSize}</p><p><strong>หลังฟอก:</strong> {monograph.tissueCulture.explantGuide.finalExplantSize}</p><h4>ข้อควรจำ</h4><ul>{monograph.tissueCulture.explantGuide.selectionNotes.map((note) => <li key={note}>{note}</li>)}</ul></div><div><h4>ชุดทดลองฟอก</h4><div className="sterilization-table-wrap"><table className="sterilization-table"><thead><tr><th>ชุด</th><th>Active chlorine</th><th>เวลา</th><th>ล้าง</th><th>สถานะ</th></tr></thead><tbody>{monograph.tissueCulture.explantGuide.sterilizationTrials.map((trial) => <tr key={trial.id}><th>{trial.id}</th><td>{trial.activeChlorinePercent}%</td><td>{trial.exposureMinutes} min</td><td>{trial.sterileRinses} รอบ</td><td><span className={evidenceClass(trial.evidenceState)}>{trial.evidenceState}</span><small>{trial.note}</small></td></tr>)}</tbody></table></div><ul>{monograph.tissueCulture.explantGuide.safetyNotes.map((note) => <li key={note}>{note}</li>)}</ul></div></div>
      </section>
      <div className="monograph-step-list">{monograph.tissueCulture.steps.map((step) => <article className="protocol-reading-step monograph-step" key={step.id}>
        <span>{step.order}</span><div><div className="knowledge-detail-heading"><h3>{step.title}</h3><span className={evidenceClass(step.evidenceState)}>{step.evidenceState}</span></div><p><strong>ทำเพื่อ:</strong> {step.objective}</p><h4>วิธีทำ</h4><ol>{step.instructions.map((instruction) => <li key={instruction}>{instruction}</li>)}</ol><h4>เตรียมอะไร</h4><p>{step.materials.join(" · ")}</p><h4>จุดควบคุมและความปลอดภัย</h4><ul>{[...step.criticalControls, ...step.safetyNotes].map((item) => <li key={item}>{item}</li>)}</ul><p><strong>ผลที่ควรเห็น:</strong> {step.expectedResult}</p><p><strong>ผ่านเมื่อ:</strong> {step.passCriteria.join("; ")}</p><p><strong>ไม่ผ่านเมื่อ:</strong> {step.failCriteria.join("; ")}</p>{step.measurements && <p><strong>ค่าที่ต้องบันทึก:</strong> {step.measurements.map((measurement) => `${measurement.label} (${measurement.unit})`).join(" · ")}</p>}</div>
      </article>)}</div>
    </section>
    <section className="experiment-surface" aria-labelledby="monograph-references"><div className="knowledge-detail-heading"><div><p className="eyebrow">REFERENCE REGISTER</p><h2 id="monograph-references">แหล่งอ้างอิงของคู่มือนี้</h2></div><span>{monograph.sourceIds.length} sources</span></div><ul>{monograph.sourceIds.map((sourceId) => { const source = philodendronSources.find((item) => item.id === sourceId); return <li key={sourceId}>{source ? <><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a> · {source.sourceType} · accessed {source.accessedAt}</> : sourceId}</li>; })}</ul><p className="muted-copy">Verified ใช้ได้เมื่อมี source รองรับ; Adapted/Experimental คือส่วนที่ต้องบันทึกผลจากห้องทดลองของผู้ใช้เอง</p></section>
  </div>;
}
