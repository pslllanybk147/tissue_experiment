import { parseTerms } from "@/lib/manual/terms";
import { TermHelp } from "./term-help";

export { landmarkByTermId } from "./term-help";

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
        return <TermHelp key={index} termId={span.termId}>{span.text}</TermHelp>;
      })}
    </>
  );
}
