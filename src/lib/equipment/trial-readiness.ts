import type { EquipmentProfileV2 } from "./equipment-profile";

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
};

const statusRank: Record<ReadinessStatus, number> = { ready: 3, experimental: 2, unknown: 1, blocked: 0 };

function weakest(statuses: ReadinessStatus[]): ReadinessStatus {
  return statuses.reduce((current, status) => statusRank[status] < statusRank[current] ? status : current, "ready");
}

export function resolveTrialReadiness(profile: EquipmentProfileV2): TrialReadiness {
  const hasChemicalMediumOption = profile.chemicals.bleach.percentWw > 0 || profile.chemicals.nadcc.availableChlorinePercent > 0;
  const capabilities: ReadinessCapability[] = [
    {
      id: "sterile-medium",
      title: "อาหารเลี้ยงเชื้อ",
      status: hasChemicalMediumOption ? "experimental" : "blocked",
      have: hasChemicalMediumOption
        ? `มี Haiter ${profile.chemicals.bleach.percentWw}% w/w และ NaDCC ${profile.chemicals.nadcc.availableChlorinePercent}%`
        : "ยังไม่พบวิธีฆ่าเชื้ออาหารจากข้อมูลที่บันทึก",
      missing: "ไม่มีหม้อนึ่งหรือหม้ออัดแรงดัน วิธีใช้สารเคมียังเป็นวิธีทดลองและต้องเลือกให้ชัดก่อนเริ่ม",
      next: "เลือกวิธีฆ่าเชื้ออาหารหนึ่งวิธี และทำกระปุกเปล่าควบคุมจากอาหารชุดเดียวกัน",
    },
    {
      id: "sterile-water",
      title: "น้ำปลอดเชื้อสำหรับล้าง",
      status: profile.water.sterile && Boolean(profile.water.sterilizationMethod) ? "ready" : "blocked",
      have: `มีน้ำเปล่า ${profile.water.sourcePpm} ppm`,
      missing: profile.water.sterile
        ? "บันทึกว่าน้ำผ่านการฆ่าเชื้อ แต่ยังไม่ได้ระบุวิธี"
        : `น้ำ ${profile.water.sourcePpm} ppm ยังไม่ใช่น้ำปลอดเชื้อ เพราะยังไม่ผ่านการฆ่าเชื้อ`,
      next: "เตรียมน้ำด้วยวิธีที่ตรวจสอบได้ หรือซื้อน้ำปลอดเชื้อ แล้วบันทึกวิธีและวันที่",
    },
    {
      id: "sterile-vessel",
      title: "ภาชนะเพาะ",
      status: profile.containers.cultureJar50Ml > 0 ? "experimental" : "blocked",
      have: `มีกระปุกพลาสติกประมาณ 50 mL จำนวน ${profile.containers.cultureJar50Ml} ใบ และโหลแก้ว ${profile.containers.glassJar250Ml} ใบ`,
      missing: "กระปุกพลาสติกไม่ได้ระบุว่าทนความดัน และยังไม่มีวิธีฆ่าเชื้อที่เลือกไว้",
      next: "ใช้วิธีเคมีกับกระปุกพลาสติกตาม protocol ที่เลือก และกันกระปุกเปล่าไว้ตรวจการปนเปื้อน",
    },
    {
      id: "surface-decontam",
      title: "ฟอกผิวชิ้นพืช",
      status: profile.chemicals.bleach.percentWw > 0 && profile.chemicals.nadcc.availableChlorinePercent > 0 ? "experimental" : "blocked",
      have: `มี Haiter ${profile.chemicals.bleach.percentWw}% w/w และ NaDCC ตามฉลากจริง`,
      missing: "Violin ด่างยังไม่มีค่าที่พิสูจน์ตรงกับของชุดนี้",
      next: "เริ่มจากแขนควบคุมและ T1/T2 ก่อน แล้วบันทึกความเข้มข้น เวลาจริง และอาการเสียหาย",
    },
    {
      id: "sterile-tools",
      title: "คีม กรรไกร และมีด",
      status: profile.inventory.some((entry) => entry.id === "forceps") ? "experimental" : "blocked",
      have: `มีเครื่องมือตัด เตาแก๊ส และแอลกอฮอล์ ${profile.chemicals.alcohol.percent}%`,
      missing: "แอลกอฮอล์ที่มีเป็น 75% ไม่ใช่ 70% และตะเกียงไม่มีเชื้อเพลิง",
      next: "ใช้วิธีต้มเครื่องมือและจุ่มแอลกอฮอล์โดยไม่ใช้เปลวไฟในพื้นที่พลาสติก พร้อมบันทึกวิธีที่ทำจริง",
    },
    {
      id: "clean-workspace",
      title: "พื้นที่ทำงานสะอาด",
      status: profile.workspace.sab ? "ready" : "blocked",
      have: `มี SAB ห้องพลาสติก 2 × 2 m และกระปุกเพาะ ${profile.containers.cultureJar50Ml} ใบ`,
      missing: profile.workspace.sab ? "ยังต้องวางลำดับนำของสะอาดเข้า SAB และแยกของใช้แล้ว" : "ยังไม่มีพื้นที่บังลมสำหรับทำงานสะอาด",
      next: "จัดด้านสะอาดและด้านของใช้แล้วใน SAB และเก็บเตาแก๊สกับตะเกียงไว้นอกห้องพลาสติก",
    },
  ];

  const cautions = [
    "มีตะเกียงแอลกอฮอล์แต่ไม่มีเชื้อเพลิง จึงห้ามนับว่าใช้วิธีเผาเครื่องมือได้",
    "ห้องคลุมพลาสติกและละอองแอลกอฮอล์ติดไฟได้ ห้ามใช้เปลวไฟภายในห้องหรือ SAB",
    "น้ำ 15 ppm ไม่ได้แปลว่าปลอดเชื้อ และห้ามใช้แทนน้ำปลอดเชื้อโดยไม่มีขั้นฆ่าเชื้อ",
  ];

  return {
    overall: weakest(capabilities.map((item) => item.status)),
    capabilities,
    blockers: capabilities.filter((item) => item.status === "blocked"),
    cautions,
  };
}
