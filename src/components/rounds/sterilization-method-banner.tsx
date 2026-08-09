import { RichText } from "@/components/guide/rich-text";
import type { LotSterilizationSnapshot } from "@/lib/domain/models";

/** ขั้นฟอกฆ่าเชื้อมีเนื้อหาชุดเดียวใช้ร่วมกันทุกแขนงของชุดทดลอง (ไม่แยกคู่มือต่อแขนง)
 *  แบนเนอร์นี้จึงเป็นตัวบอกส่วนต่างเฉพาะแขนงทับเนื้อหาเดิม แทนที่จะแยกคำสั่งทำเป็นคนละชุด
 *  เห็นเฉพาะรอบที่เป็นแขนงของชุดทดลองเปรียบเทียบ (มี lot.sterilization) รอบทั่วไปไม่แสดงอะไร */
export function SterilizationMethodBanner({ sterilization }: { sterilization: LotSterilizationSnapshot | undefined }) {
  if (!sterilization) return null;

  if (sterilization.method === "nadcc-soak") {
    return (
      <div className="pl-card" style={{ background: "var(--pl-stop)", marginTop: "18px" }}>
        <p className="pl-mono" style={{ color: "var(--pl-ink-2)" }}>แขนงนี้ข้ามขั้น Haiter ทั้งขั้น</p>
        <div className="pl-lede" style={{ marginTop: "8px" }}>
          <RichText
            source={
              "ขั้นตอนด้านล่างเขียนไว้สำหรับ Haiter ไม่ใช้กับแขนงนี้ ให้แช่ชิ้นพืชใน[[nadcc|NaDCC]] เจือจางให้ได้คลอรีนออกฤทธิ์ " +
              "ประมาณ 300 ppm นาน 24 ถึง 48 ชั่วโมงแทน (ตามสูตร Parkinson et al. 1996 ดู new_idea.md หัวข้อ 14) " +
              "แล้วล้างด้วยน้ำปลอดเชื้อธรรมดาตามปกติ ไม่ต้องทำ rinse คลอรีนต่ออีก เพราะแขนงนี้ทดสอบว่าตัดขั้น Haiter " +
              "ทิ้งไปเลยได้ไหม ไม่ใช่การเสริม rinse หลัง Haiter แบบ T1/T2"
            }
          />
        </div>
      </div>
    );
  }

  const rinseMethod = sterilization.rinseWater?.method;
  if (rinseMethod === "low-dose-hypochlorite" || rinseMethod === "nadcc") {
    const termId = rinseMethod === "nadcc" ? "nadcc" : "";
    const volume = sterilization.rinseWater?.volumePerContainerMl ?? 50;
    const product = rinseMethod === "nadcc" ? "NaDCC" : "NaClO";
    return (
      <div className="pl-card" style={{ background: "var(--pl-sunk)", marginTop: "18px" }}>
        <p className="pl-mono" style={{ color: "var(--pl-ink-2)" }}>ขั้นทดลองเสริมหลังฟอก</p>
        <p className="pl-lede" style={{ marginTop: "8px" }}>
          หลังครบเวลาฟอกแล้ว ให้ล้างชิ้นพืชใน R1–R3 ภาชนะละ {volume} mL รอบละ 1 นาที ด้วยน้ำล้างคลอรีนต่ำ {product} 300 ppm
          {rinseMethod === "nadcc" ? <RichText source={` ([[${termId}|NaDCC]])`} /> : null}
          น้ำนี้ไม่ใช่น้ำปลอดเชื้อและใช้เฉพาะแขนทดลองนี้ ไม่ต้องเติม final rinse ด้วยน้ำปลอดเชื้อธรรมดา
        </p>
      </div>
    );
  }

  return null;
}
