import { growthForms } from "@/lib/manual/forms/registry";
import type { Landmark } from "@/lib/manual/forms/types";
import { substanceById } from "@/lib/manual/substances";
import { parseTerms } from "@/lib/manual/terms";

/** ค้นคำศัพท์ข้ามทุกทรง เพราะคำเดียวกันอาจถูกนิยามไว้ในทรงที่ต่างจากที่ผู้ใช้กำลังอ่าน
 *  ทรงแรกที่นิยามคำนั้นชนะ ซึ่งพอสำหรับตอนนี้เพราะคำที่ซ้ำกันข้ามทรงมีความหมายเดียวกัน */
export function landmarkByTermId(termId: string): Landmark | null {
  for (const form of growthForms) {
    const found = form.landmarks.find((landmark) => landmark.id === termId);
    if (found) return found;
  }
  return null;
}

/** ใช้ <details> แทน overlay ที่ต้องใช้ JavaScript เพราะเข้าถึงได้ในตัว ทำงานโดยไม่มี JS
 *  และเทสต์ด้วย renderToStaticMarkup ได้ตามข้อจำกัดของโปรเจกต์นี้
 *
 *  ข้อจำกัดที่ตามมา คือ <details> ซ้อนใน <a> ไม่ได้ตามมาตรฐาน HTML
 *  การ์ดที่ทั้งใบเป็นลิงก์จึงต้องใช้ plainText แทน ดู step-map.tsx
 *
 *  termId อาจชี้ไปที่ landmark (จุดสังเกตบนต้น) หรือสารในคลังสาร (substances.ts) ก็ได้
 *  เช็ค landmark ก่อนเพราะเป็นทะเบียนเดิม แล้วค่อยเช็คสาร เนมสเปซทั้งสองไม่ทับกัน (ดู terms.ts) */
export function RichText({ source }: { source: string }) {
  return (
    <>
      {parseTerms(source).map((span, index) => {
        if (span.kind === "text") return <span key={index}>{span.text}</span>;

        const landmark = landmarkByTermId(span.termId);
        if (landmark) {
          return (
            <details key={index} className="pl-term">
              <summary className="pl-term-word">{span.text}</summary>
              <div className="pl-term-body">
                <p className="pl-term-line"><b>คืออะไร</b> {landmark.whatItIs}</p>
                <p className="pl-term-line"><b>หายังไง</b> {landmark.howToFind}</p>
                {landmark.confusedWith ? (
                  <p className="pl-term-line"><b>อย่าสับสน</b> {landmark.confusedWith}</p>
                ) : null}
              </div>
            </details>
          );
        }

        const substance = substanceById(span.termId);
        if (substance) {
          return (
            <details key={index} className="pl-term">
              <summary className="pl-term-word">{span.text}</summary>
              <div className="pl-term-body">
                <p className="pl-term-line"><b>คืออะไร</b> {substance.whatItIs}</p>
                <p className="pl-term-line"><b>ซื้อที่ไหน</b> {substance.whereToBuy}</p>
                {substance.substitute ? (
                  <p className="pl-term-line"><b>ใช้อะไรแทนได้</b> {substance.substitute}</p>
                ) : null}
                {substance.caution ? (
                  <p className="pl-term-line"><b>ข้อควรระวัง</b> {substance.caution}</p>
                ) : null}
              </div>
            </details>
          );
        }

        return <span key={index}>{span.text}</span>;
      })}
    </>
  );
}
