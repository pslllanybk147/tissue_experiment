import type { EquipmentProfileV2 } from "./equipment-profile";
import { resolveTrialArmReadinesses, type TrialArmReadiness } from "@/lib/trials/trial-readiness";

export type ReadinessStatus = "ready" | "experimental" | "blocked" | "unknown";
export type ReadinessCapabilityId =
  | "sterile-medium"
  | "sterile-water"
  | "sterile-vessel"
  | "surface-decontam"
  | "sterile-tools"
  | "clean-workspace";

export type ReadinessCapability = {
  id: ReadinessCapabilityId;
  title: string;
  status: ReadinessStatus;
  have: string;
  missing: string;
  next: string;
};

export type TrialReadiness = {
  overall: ReadinessStatus;
  capabilities: ReadinessCapability[];
  blockers: ReadinessCapability[];
  cautions: string[];
  arms: TrialArmReadiness[];
  armBlockers: TrialArmReadiness[];
};

const statusRank: Record<ReadinessStatus, number> = { ready: 3, experimental: 2, unknown: 1, blocked: 0 };

function weakest(statuses: ReadinessStatus[]): ReadinessStatus {
  return statuses.reduce((current, status) => statusRank[status] < statusRank[current] ? status : current, "ready");
}

export function resolveTrialReadiness(profile: EquipmentProfileV2): TrialReadiness {
  const hasChemicalMediumOption = profile.chemicals.bleach.percentWw > 0 || profile.chemicals.nadcc.availableChlorinePercent > 0;
  const selectedMediumMethod = profile.medium.sterilizationMethod;
  const quantity = (id: EquipmentProfileV2["inventory"][number]["id"]) => profile.inventory.find((item) => item.id === id)?.quantity ?? 0;
  const hasCuttingTools = quantity("forceps") > 0 && quantity("scissors") > 0 && (quantity("scalpel-narrow") > 0 || quantity("scalpel-wide") > 0);
  const hasBleach = profile.chemicals.bleach.percentWw > 0;
  const hasNadcc = profile.chemicals.nadcc.availableChlorinePercent > 0;
  const alcoholPercent = profile.chemicals.alcohol.percent;
  const hasStove = quantity("picnic-gas-stove") > 0;
  const hasLamp = quantity("alcohol-lamp") > 0;
  const waterSterile = profile.water.sterile;
  const waterMethod = profile.water.sterilizationMethod?.trim();

  // ข้อความ "ยังขาดอะไร" ต้องคำนวณจากโปรไฟล์จริงเสมอ เดิมหลายจุดเป็นสตริงตายตัว
  // จนการ์ดใบเดียวกันบอกว่า "มีแอลกอฮอล์ 70%" แล้วบรรทัดถัดไปบอกว่า "ที่มีเป็น 75% ไม่ใช่ 70%"
  // และการ์ดที่ผ่านแล้วก็ยังขึ้นว่ายังขาดอยู่ เพราะไม่เคยมีเคส "ครบแล้ว"
  const nothingMissing = "";
  const chemicalList = [
    hasBleach ? `Haiter ${profile.chemicals.bleach.percentWw}% w/w` : null,
    hasNadcc ? `NaDCC ${profile.chemicals.nadcc.availableChlorinePercent}%` : null,
  ].filter(Boolean).join(" และ ");

  const toolCautions = [
    alcoholPercent > 0 && (alcoholPercent < 70 || alcoholPercent > 80)
      ? `แอลกอฮอล์ที่บันทึกไว้เป็น ${alcoholPercent}% อยู่นอกช่วง 70–80% ที่ใช้ฆ่าเชื้อได้ผล`
      : null,
    hasLamp && !profile.workspace.openFlameFuelAvailable ? "ตะเกียงไม่มีเชื้อเพลิง จึงเผาเครื่องมือไม่ได้" : null,
  ].filter((item): item is string => item !== null);

  const vesselCautions = [
    "กระปุกพลาสติกไม่ได้ระบุว่าทนความดัน",
    selectedMediumMethod ? null : "ยังไม่ได้เลือกวิธีฆ่าเชื้ออาหารและภาชนะ",
  ].filter((item): item is string => item !== null);

  const capabilities: ReadinessCapability[] = [
    {
      id: "sterile-medium",
      title: "อาหารเลี้ยงเชื้อ",
      status: hasChemicalMediumOption && selectedMediumMethod ? "experimental" : "blocked",
      have: hasChemicalMediumOption ? `มี ${chemicalList}` : "ยังไม่พบวิธีฆ่าเชื้ออาหารจากข้อมูลที่บันทึก",
      missing: selectedMediumMethod
        ? "ไม่มีหม้อนึ่งหรือหม้ออัดแรงดัน วิธีใช้สารเคมีที่เลือกยังเป็นวิธีทดลอง"
        : "ยังไม่ได้เลือกว่าจะฆ่าเชื้ออาหารด้วย Haiter หรือ NaDCC",
      next: selectedMediumMethod
        ? "ทำกระปุกเปล่าควบคุมจากอาหาร batch เดียวกันและบันทึกค่าที่ใช้จริง"
        : "เลือกวิธีฆ่าเชื้ออาหารหนึ่งวิธีในหน้าอุปกรณ์ก่อนเริ่ม",
    },
    {
      id: "sterile-water",
      title: "น้ำปลอดเชื้อสำหรับล้าง",
      status: waterSterile && Boolean(waterMethod) ? "ready" : "blocked",
      have: `มีน้ำเปล่า ${profile.water.sourcePpm} ppm`
        + (waterSterile && waterMethod ? ` · ฆ่าเชื้อด้วยวิธี: ${waterMethod}` : ""),
      missing: waterSterile
        ? (waterMethod ? nothingMissing : "ติ๊กว่าน้ำผ่านการฆ่าเชื้อแล้ว แต่ยังไม่ได้พิมพ์ว่าใช้วิธีอะไร")
        : `น้ำ ${profile.water.sourcePpm} ppm ยังไม่ใช่น้ำปลอดเชื้อ เพราะยังไม่ผ่านการฆ่าเชื้อ`,
      next: waterSterile && waterMethod
        ? "ถ้าเปลี่ยนวิธีหรือเตรียมน้ำชุดใหม่ ให้กลับมาแก้ข้อความวิธีที่ทำจริงด้วย"
        : hasStove
          ? "ต้มน้ำให้เดือดในภาชนะที่มีฝา ปิดฝาทิ้งจนเย็น หรือซื้อน้ำปลอดเชื้อมาใช้ แล้วพิมพ์วิธีที่ทำจริงลงช่องด้านบน (การต้มไม่ฆ่าสปอร์ ให้ถือเป็นวิธีทดลองและทำกระปุกเปล่าคุมเสมอ)"
          : "ซื้อน้ำปลอดเชื้อหรือเตรียมด้วยวิธีที่ตรวจสอบได้ แล้วพิมพ์วิธีที่ทำจริงลงช่องด้านบน",
    },
    {
      id: "sterile-vessel",
      title: "ภาชนะเพาะ",
      status: profile.containers.cultureJar50Ml > 0 ? "experimental" : "blocked",
      have: `มีกระปุกพลาสติกประมาณ 50 mL จำนวน ${profile.containers.cultureJar50Ml} ใบ และโหลแก้ว ${profile.containers.glassJar250Ml} ใบ`,
      missing: vesselCautions.join(" และ "),
      next: "ใช้วิธีเคมีกับกระปุกพลาสติกตาม protocol ที่เลือก และกันกระปุกเปล่าไว้ตรวจการปนเปื้อน",
    },
    {
      id: "surface-decontam",
      title: "ฟอกผิวชิ้นพืช",
      // มี Haiter อย่างเดียวก็ทำแขนควบคุมกับ T1 ได้ ไม่จำเป็นต้องมีครบสองสารถึงจะเริ่ม
      status: hasBleach || hasNadcc ? "experimental" : "blocked",
      have: hasBleach || hasNadcc ? `ตามฉลากมี ${chemicalList}` : "ยังไม่ได้บันทึกสารสำหรับฟอกผิว",
      missing: hasBleach || hasNadcc
        ? "ยังไม่มีความเข้มข้นและเวลาฟอกที่พิสูจน์ตรงกับพันธุ์ที่จะเพาะและกับของชุดนี้"
        : "ยังไม่มีสารฟอกผิวที่อ่านค่าคลอรีนออกฤทธิ์ได้",
      next: "เริ่มจากแขนควบคุมและ T1/T2 ก่อน แล้วบันทึกความเข้มข้น เวลาจริง และอาการเสียหาย",
    },
    {
      id: "sterile-tools",
      title: "คีม กรรไกร และมีด",
      status: hasCuttingTools ? "experimental" : "blocked",
      have: hasCuttingTools
        ? [
          "มีคีม กรรไกร มีด",
          hasStove ? "เตาแก๊ส" : null,
          alcoholPercent > 0 ? `แอลกอฮอล์ ${alcoholPercent}%` : null,
        ].filter(Boolean).join(" และ ")
        : "ยังบันทึกคีม กรรไกร หรือมีดไม่ครบ",
      missing: toolCautions.length > 0 ? toolCautions.join(" และ ") : nothingMissing,
      next: hasStove
        ? "ใช้วิธีต้มเครื่องมือและจุ่มแอลกอฮอล์โดยไม่ใช้เปลวไฟในพื้นที่พลาสติก พร้อมบันทึกวิธีที่ทำจริง"
        : "หาแหล่งความร้อนสำหรับต้มเครื่องมือ หรือใช้วิธีจุ่มแอลกอฮอล์อย่างเดียวแล้วบันทึกว่าเป็นวิธีทดลอง",
    },
    {
      id: "clean-workspace",
      title: "พื้นที่ทำงานสะอาด",
      status: profile.workspace.sab || profile.workspace.plasticRoom ? "ready" : "blocked",
      have: [
        profile.workspace.sab ? "มีตู้ SAB" : null,
        profile.workspace.plasticRoom ? "ห้องพลาสติก 2 × 2 m" : null,
        `กระปุกเพาะ ${profile.containers.cultureJar50Ml} ใบ`,
      ].filter(Boolean).join(" · "),
      missing: profile.workspace.sab || profile.workspace.plasticRoom
        ? "ยังต้องวางลำดับนำของสะอาดเข้าพื้นที่ทำงานและแยกของใช้แล้ว"
        : "ยังไม่มีพื้นที่บังลมสำหรับทำงานสะอาด",
      next: profile.workspace.sab
        ? "จัดด้านสะอาดและด้านของใช้แล้วใน SAB และเก็บเตาแก๊สกับตะเกียงไว้นอกห้องพลาสติก"
        : "หาตู้บังลมหรือกล่องใสที่ปิดลมได้ก่อนเริ่มงานที่ต้องเปิดภาชนะ",
    },
  ];

  const arms = resolveTrialArmReadinesses(profile);

  // คำเตือนต้องมาจากของที่บันทึกไว้จริง ไม่ใช่รายการตายตัวที่พูดถึงของที่ผู้ใช้อาจไม่มี
  const cautions = [
    hasLamp && !profile.workspace.openFlameFuelAvailable
      ? "มีตะเกียงแอลกอฮอล์แต่ไม่มีเชื้อเพลิง จึงห้ามนับว่าใช้วิธีเผาเครื่องมือได้"
      : null,
    profile.workspace.plasticRoom
      ? "ห้องคลุมพลาสติกและละอองแอลกอฮอล์ติดไฟได้ ห้ามใช้เปลวไฟภายในห้องหรือ SAB"
      : "ละอองแอลกอฮอล์ติดไฟได้ ห้ามใช้เปลวไฟในพื้นที่ที่เพิ่งพ่นแอลกอฮอล์",
    !waterSterile
      ? `น้ำ ${profile.water.sourcePpm} ppm ไม่ได้แปลว่าปลอดเชื้อ และห้ามใช้แทนน้ำปลอดเชื้อโดยไม่มีขั้นฆ่าเชื้อ`
      : "ค่า ppm ของน้ำบอกแค่ปริมาณแร่ธาตุ ไม่ได้บอกว่าปลอดเชื้อ ให้ยึดวิธีฆ่าเชื้อที่บันทึกไว้เป็นหลัก",
  ].filter((item): item is string => item !== null);

  return {
    overall: weakest([...capabilities.map((item) => item.status), ...arms.map((item) => item.status)]),
    capabilities,
    blockers: capabilities.filter((item) => item.status === "blocked"),
    cautions,
    arms,
    armBlockers: arms.filter((item) => item.status === "blocked"),
  };
}
