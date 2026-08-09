import { parseContextualTerms, parseTerms } from "@/lib/manual/terms";
import { TermHelp } from "./term-help";

export { landmarkByTermId } from "./term-help";

/** ค้นคำศัพท์ข้ามทุกทรง เพราะคำเดียวกันอาจถูกนิยามไว้ในทรงที่ต่างจากที่ผู้ใช้กำลังอ่าน
 *  ทรงแรกที่นิยามคำนั้นชนะ ซึ่งพอสำหรับตอนนี้เพราะคำที่ซ้ำกันข้ามทรงมีความหมายเดียวกัน */
function ContextualText({ source }: { source: string }) {
  return <>{parseContextualTerms(source).map((span, index) => span.kind === "text"
    ? <span key={index}>{span.text}</span>
    : <TermHelp key={index} termId={span.termId}>{span.text}</TermHelp>)}</>;
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
        if (span.kind === "text") return <ContextualText key={index} source={span.text} />;
        return <TermHelp key={index} termId={span.termId}>{span.text}</TermHelp>;
      })}
    </>
  );
}
