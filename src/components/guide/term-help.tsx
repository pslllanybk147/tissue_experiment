import { growthForms } from "@/lib/manual/forms/registry";
import type { Landmark } from "@/lib/manual/forms/types";
import { contextualTermById } from "@/lib/manual/terms";
import { substanceById } from "@/lib/manual/substances";

export function landmarkByTermId(termId: string): Landmark | null {
  for (const form of growthForms) {
    const found = form.landmarks.find((landmark) => landmark.id === termId);
    if (found) return found;
  }
  return null;
}

export function TermHelp({ termId, children }: { termId: string; children: React.ReactNode }) {
  const landmark = landmarkByTermId(termId);
  const contextual = landmark ? null : contextualTermById(termId);
  const substance = substanceById(termId);
  if (!contextual && !landmark && !substance) return <span>{children}</span>;

  return (
    <details className="pl-term">
      <summary className="pl-term-word">{children}</summary>
      <div className="pl-term-body" role="definition">
        {contextual ? (
          <>
            <p className="pl-term-line"><b>หมายถึง</b> {contextual.definition}</p>
            <p className="pl-term-line"><b>ดูจากของจริงอย่างไร</b> {contextual.practicalCue}</p>
          </>
        ) : landmark ? (
          <>
            <p className="pl-term-line"><b>หมายถึง</b> {landmark.whatItIs}</p>
            <p className="pl-term-line"><b>ดูจากของจริงอย่างไร</b> {landmark.howToFind}</p>
            {landmark.confusedWith ? <p className="pl-term-line"><b>อย่าสับสน</b> {landmark.confusedWith}</p> : null}
          </>
        ) : substance ? (
          <>
            <p className="pl-term-line"><b>หมายถึง</b> {substance.whatItIs}</p>
            <p className="pl-term-line"><b>ซื้อที่ไหน</b> {substance.whereToBuy}</p>
            {substance.substitute ? <p className="pl-term-line"><b>ใช้อะไรแทนได้</b> {substance.substitute}</p> : null}
            {substance.caution ? <p className="pl-term-line"><b>ข้อควรระวัง</b> {substance.caution}</p> : null}
          </>
        ) : null}
      </div>
    </details>
  );
}
