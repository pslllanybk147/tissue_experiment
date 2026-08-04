import type { ReactElement, ReactNode } from "react";

const LINE = "var(--pl-line)";

function Frame({ children, tone = "var(--pl-sky)" }: { children: ReactNode; tone?: string }) {
  return (
    <svg
      viewBox="0 0 320 150"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", width: "100%", height: "auto" }}
    >
      <rect width="320" height="150" fill={tone} />
      <g stroke={LINE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {children}
      </g>
    </svg>
  );
}

function ReceiveBaseline() {
  return (
    <Frame>
      <rect x="34" y="86" width="66" height="44" rx="6" fill="var(--pl-leaf)" />
      <path d="M67 86V50" />
      <path d="M67 62c-16 0-24-9-24-19 13-4 24 5 24 19z" fill="var(--pl-leaf)" />
      <path d="M67 72c16 0 24-9 24-19-13-4-24 5-24 19z" fill="var(--pl-pink)" />
      <rect x="176" y="46" width="110" height="76" rx="10" fill="var(--pl-card)" />
      <circle cx="231" cy="84" r="21" fill="var(--pl-sky)" />
      <circle cx="231" cy="84" r="9" fill="var(--pl-card)" />
      <rect x="196" y="34" width="30" height="14" rx="5" fill="var(--pl-card)" />
      <path d="M140 84h22" />
      <path d="M154 76l9 8-9 8" />
    </Frame>
  );
}

function QuarantineCheck() {
  return (
    <Frame tone="var(--pl-sunk)">
      <rect x="30" y="30" width="118" height="94" rx="10" fill="var(--pl-card)" strokeDasharray="9 8" />
      <path d="M89 112V64" />
      <path d="M89 78c-14 0-21-8-21-17 12-3 21 5 21 17z" fill="var(--pl-leaf)" />
      <path d="M89 90c14 0 21-8 21-17-12-3-21 5-21 17z" fill="var(--pl-leaf)" />
      <rect x="182" y="40" width="106" height="72" rx="10" fill="var(--pl-card)" />
      <circle cx="216" cy="70" r="16" />
      <path d="M228 82l16 16" />
      <circle cx="252" cy="60" r="5" fill="var(--pl-red)" stroke="none" />
      <circle cx="264" cy="86" r="4" fill="var(--pl-red)" stroke="none" />
    </Frame>
  );
}

function IdentifyCompare() {
  return (
    <Frame>
      <rect x="26" y="32" width="122" height="90" rx="10" fill="var(--pl-card)" />
      <path d="M87 108V60" />
      <path d="M87 74c-15 0-22-8-22-18 13-3 22 6 22 18z" fill="var(--pl-leaf)" />
      <path d="M87 86c15 0 22-8 22-18-13-3-22 6-22 18z" fill="var(--pl-pink)" />
      <rect x="172" y="32" width="122" height="90" rx="10" fill="var(--pl-card)" />
      <path d="M233 108V60" />
      <path d="M233 74c-15 0-22-8-22-18 13-3 22 6 22 18z" fill="var(--pl-leaf)" />
      <path d="M233 86c15 0 22-8 22-18-13-3-22 6-22 18z" fill="var(--pl-leaf)" />
      <path d="M154 60v34" strokeDasharray="6 7" />
    </Frame>
  );
}

function NodeCutDiagram() {
  return (
    <Frame>
      <path d="M160 20v112" strokeWidth="9" stroke="var(--pl-leaf)" />
      <path d="M160 20v112" />
      <path d="M160 62c-22 0-32-10-32-22 18-5 32 6 32 22z" fill="var(--pl-leaf)" />
      <circle cx="160" cy="76" r="12" fill="var(--pl-yellow)" />
      <path d="M112 104h96" stroke="var(--pl-red)" strokeDasharray="8 7" />
      <path d="M232 76h34" />
      <path d="M232 104h34" stroke="var(--pl-red)" />
      <circle cx="272" cy="76" r="6" fill="var(--pl-yellow)" />
      <circle cx="272" cy="104" r="6" fill="var(--pl-red)" />
    </Frame>
  );
}

function CutExplant() {
  return (
    <Frame tone="var(--pl-sunk)">
      <path d="M92 30v92" strokeWidth="9" stroke="var(--pl-leaf)" />
      <path d="M92 30v92" />
      <circle cx="92" cy="70" r="11" fill="var(--pl-yellow)" />
      <path d="M56 96h72" stroke="var(--pl-red)" strokeDasharray="8 7" />
      <path d="M186 62l38 26" />
      <path d="M186 88l38-26" />
      <circle cx="182" cy="58" r="9" fill="var(--pl-card)" />
      <circle cx="182" cy="92" r="9" fill="var(--pl-card)" />
      <path d="M244 60v30" />
      <path d="M258 60v30" />
    </Frame>
  );
}

// วาดทับจากภาพถ่าย Philodendron bipennifolium (CC BY-SA, เครดิต Makoto Makoto ผ่าน GBIF
// occurrence 3949841382) เป็นภาพโครงสร้างระดับสปีชีส์เท่านั้น ไม่ใช่ภาพลายด่างของพันธุ์ Violin
// ด่างโดยตรง — ดูคำบรรยายที่ illustrationCredits ด้านล่าง
function CutExplantViolinTraced() {
  return (
    <Frame tone="var(--pl-sunk)">
      <path d="M40 130C34 106 38 84 50 68C60 54 75 62 92 60" strokeWidth="6" stroke="var(--pl-leaf)" fill="none" />
      <path
        d="M101.6,37.5 L73.7,22.5 L71.2,33.8 Q71.2,33.8 76.8,44.4 L82.4,55.0 Q82.4,55.0 81.8,57.5 L81.2,60.0 Q81.2,60.0 79.3,70.0 L77.4,80.0 L101.6,118.8 L124.6,80.0 Q124.6,80.0 123.9,70.0 L123.3,60.0 Q123.3,60.0 121.4,57.5 L119.6,55.0 Q119.6,55.0 125.5,44.4 L131.4,33.8 L128.9,26.9 L101.6,37.5 Z"
        fill="var(--pl-leaf)"
      />
      <path d="M10 96h60" stroke="var(--pl-red)" strokeDasharray="8 7" />
      <circle cx="38" cy="96" r="9" fill="var(--pl-yellow)" />
      <path d="M186 62l38 26" />
      <path d="M186 88l38-26" />
      <circle cx="182" cy="58" r="9" fill="var(--pl-card)" />
      <circle cx="182" cy="92" r="9" fill="var(--pl-card)" />
      <path d="M244 60v30" />
      <path d="M258 60v30" />
    </Frame>
  );
}

function PrepMedia() {
  return (
    <Frame tone="var(--pl-sunk)">
      <rect x="34" y="44" width="76" height="80" rx="8" fill="var(--pl-card)" />
      <rect x="42" y="86" width="60" height="34" rx="5" fill="var(--pl-agar)" />
      <path d="M26 44h92" />
      <circle cx="196" cy="80" r="34" fill="var(--pl-card)" />
      <path d="M196 80V56" />
      <path d="M196 80l16 12" />
      <rect x="252" y="52" width="42" height="60" rx="7" fill="var(--pl-yellow)" />
      <path d="M262 68h22M262 82h22M262 96h14" strokeWidth="2.5" />
    </Frame>
  );
}

function SterilizeTimer() {
  return (
    <Frame>
      <path d="M70 34h74v76a10 10 0 0 1-10 10H80a10 10 0 0 1-10-10z" fill="var(--pl-card)" />
      <path d="M74 78h66v32a8 8 0 0 1-8 8H82a8 8 0 0 1-8-8z" fill="var(--pl-agar)" />
      <path d="M62 34h90" />
      <path d="M95 94c-6-4-4-11 3-12 6-1 10 4 8 9-2 4-7 5-11 3z" fill="var(--pl-pink)" />
      <path d="M120 102c-6-4-4-11 3-12 6-1 10 4 8 9-2 4-7 5-11 3z" fill="var(--pl-pink)" />
      <circle cx="240" cy="78" r="36" fill="var(--pl-yellow)" />
      <path d="M240 78V54M240 78l16 12" />
      <path d="M230 34h20" />
      <path d="M168 78h26" />
      <path d="M186 70l10 8-10 8" />
    </Frame>
  );
}

function MediumPlacement() {
  return (
    <Frame>
      <rect x="42" y="40" width="88" height="86" rx="9" fill="var(--pl-card)" />
      <rect x="50" y="92" width="72" height="28" rx="5" fill="var(--pl-agar)" />
      <path d="M86 92V58" />
      <path d="M86 70c-13 0-19-7-19-15 11-3 19 5 19 15z" fill="var(--pl-leaf)" />
      <circle cx="86" cy="60" r="7" fill="var(--pl-yellow)" />
      <rect x="190" y="40" width="88" height="86" rx="9" fill="var(--pl-card)" />
      <rect x="198" y="92" width="72" height="28" rx="5" fill="var(--pl-agar)" />
      <path d="M234 100v14" />
      <circle cx="234" cy="112" r="7" fill="var(--pl-red)" />
      <path d="M212 26l44 30M256 26l-44 30" stroke="var(--pl-red)" strokeWidth="4" />
    </Frame>
  );
}

function ContaminationCompare() {
  return (
    <Frame>
      <rect x="40" y="38" width="90" height="88" rx="9" fill="var(--pl-card)" />
      <rect x="48" y="94" width="74" height="26" rx="5" fill="var(--pl-agar)" />
      <path d="M85 94V64" />
      <path d="M85 76c-12 0-18-7-18-14 11-3 18 4 18 14z" fill="var(--pl-leaf)" />
      <rect x="190" y="38" width="90" height="88" rx="9" fill="var(--pl-card)" />
      <rect x="198" y="94" width="74" height="26" rx="5" fill="var(--pl-agar)" />
      <circle cx="222" cy="82" r="13" fill="var(--pl-sunk)" />
      <circle cx="248" cy="94" r="9" fill="var(--pl-sunk)" />
      <path d="M212 70l-8-8M232 70l8-8M222 66v-10" strokeWidth="2.5" />
      <path d="M204 26h62" stroke="var(--pl-red)" strokeWidth="4" />
    </Frame>
  );
}

function MultiplyShoots() {
  return (
    <Frame tone="var(--pl-sunk)">
      <rect x="34" y="44" width="72" height="80" rx="8" fill="var(--pl-card)" />
      <rect x="42" y="96" width="56" height="22" rx="5" fill="var(--pl-agar)" />
      <path d="M70 96V70" />
      <path d="M70 80c-11 0-16-6-16-13 10-2 16 4 16 13z" fill="var(--pl-leaf)" />
      <path d="M124 84h30" />
      <path d="M144 76l10 8-10 8" />
      <rect x="176" y="44" width="112" height="80" rx="8" fill="var(--pl-card)" />
      <rect x="184" y="96" width="96" height="22" rx="5" fill="var(--pl-agar)" />
      <path d="M206 96V72M232 96V64M258 96V74" />
      <path d="M206 80c-9 0-13-5-13-11 8-2 13 4 13 11z" fill="var(--pl-leaf)" />
      <path d="M232 74c9 0 13-5 13-11-8-2-13 4-13 11z" fill="var(--pl-leaf)" />
      <path d="M258 82c-9 0-13-5-13-11 8-2 13 4 13 11z" fill="var(--pl-leaf)" />
    </Frame>
  );
}

function Rooting() {
  return (
    <Frame tone="var(--pl-sunk)">
      <rect x="106" y="30" width="108" height="94" rx="9" fill="var(--pl-card)" />
      <rect x="114" y="92" width="92" height="26" rx="5" fill="var(--pl-agar)" />
      <path d="M160 92V52" />
      <path d="M160 66c-14 0-21-8-21-16 12-3 21 5 21 16z" fill="var(--pl-leaf)" />
      <path d="M160 76c14 0 21-8 21-16-12-3-21 5-21 16z" fill="var(--pl-leaf)" />
      <path d="M160 92l-20 20M160 92l20 20M160 92v22" strokeWidth="2.5" />
    </Frame>
  );
}

function Acclimatize() {
  return (
    <Frame>
      <path d="M40 120h100" />
      <rect x="46" y="92" width="88" height="28" rx="5" fill="var(--pl-leaf)" />
      <path d="M90 92V56" />
      <path d="M90 70c-13 0-20-8-20-16 12-3 20 5 20 16z" fill="var(--pl-leaf)" />
      <path d="M46 44a44 44 0 0 1 88 0" strokeDasharray="8 8" />
      <path d="M180 120h100" />
      <rect x="186" y="92" width="88" height="28" rx="5" fill="var(--pl-leaf)" />
      <path d="M230 92V44" />
      <path d="M230 62c-15 0-23-9-23-18 14-3 23 6 23 18z" fill="var(--pl-leaf)" />
      <path d="M230 76c15 0 23-9 23-18-14-3-23 6-23 18z" fill="var(--pl-leaf)" />
      <path d="M262 30l12-12M274 44h16" strokeWidth="2.5" />
    </Frame>
  );
}

function MonitorVariegation() {
  return (
    <Frame>
      <rect x="28" y="34" width="118" height="88" rx="10" fill="var(--pl-card)" />
      <path d="M87 108V64" />
      <path d="M87 78c-16 0-24-9-24-18 14-4 24 6 24 18z" fill="var(--pl-leaf)" />
      <path d="M87 90c16 0 24-9 24-18-14-4-24 6-24 18z" fill="var(--pl-pink)" />
      <rect x="174" y="34" width="118" height="88" rx="10" fill="var(--pl-card)" />
      <path d="M233 108V64" />
      <path d="M233 78c-16 0-24-9-24-18 14-4 24 6 24 18z" fill="var(--pl-pink)" />
      <path d="M233 90c16 0 24-9 24-18-14-4-24 6-24 18z" fill="var(--pl-leaf)" />
      <path d="M152 62v34" strokeDasharray="6 7" />
    </Frame>
  );
}

function CloseRound() {
  return (
    <Frame tone="var(--pl-sunk)">
      <rect x="74" y="26" width="120" height="100" rx="9" fill="var(--pl-card)" />
      <path d="M92 52h84M92 72h84M92 92h56" strokeWidth="2.5" />
      <circle cx="228" cy="94" r="30" fill="var(--pl-green)" />
      <path d="M214 94l10 11 20-23" strokeWidth="5" />
    </Frame>
  );
}

function BrowningCompare() {
  return (
    <Frame tone="var(--pl-sunk)">
      {/* ซ้าย ฟอกแรงเกิน ชิ้นซีดขาวและขอบละลาย */}
      <rect x="26" y="34" width="122" height="88" rx="10" fill="var(--pl-card)" />
      <path d="M87 104V70" />
      <path d="M87 82c-14 0-21-8-21-16 12-3 21 5 21 16z" fill="var(--pl-card)" strokeDasharray="5 5" />
      <path d="M46 58h20M112 58h20" strokeWidth="2.5" />
      {/* ขวา ฟีนอลิก รอยตัดดำและลามลงวุ้น */}
      <rect x="172" y="34" width="122" height="88" rx="10" fill="var(--pl-card)" />
      <rect x="180" y="96" width="106" height="18" rx="4" fill="var(--pl-leaf)" />
      <path d="M233 96V70" />
      <path d="M233 82c-14 0-21-8-21-16 12-3 21 5 21 16z" fill="var(--pl-leaf)" />
      <circle cx="233" cy="96" r="11" fill="var(--pl-ink)" stroke="none" />
      <circle cx="233" cy="96" r="11" />
      <path d="M160 58v40" strokeDasharray="6 7" />
    </Frame>
  );
}

export const illustrations: Record<string, () => ReactElement> = {
  "browning-compare": BrowningCompare,
  "receive-baseline": ReceiveBaseline,
  "quarantine-check": QuarantineCheck,
  "identify-compare": IdentifyCompare,
  "node-cut-diagram": NodeCutDiagram,
  "cut-explant": CutExplant,
  "cut-explant-violin-bipennifolium": CutExplantViolinTraced,
  "prep-media": PrepMedia,
  "sterilize-timer": SterilizeTimer,
  "medium-placement": MediumPlacement,
  "contamination-compare": ContaminationCompare,
  "multiply-shoots": MultiplyShoots,
  rooting: Rooting,
  acclimatize: Acclimatize,
  "monitor-variegation": MonitorVariegation,
  "close-round": CloseRound,
};

/** เครดิตบังคับสำหรับภาพที่วาดทับจากรูปถ่ายจริง (ต่างจากภาพ generic ที่วาดเองล้วน)
 *  ตามเงื่อนไข CC BY-SA ที่ต้องให้เครดิตต้นฉบับเสมอเมื่อทำงานดัดแปลง */
export const illustrationCredits: Partial<Record<string, string>> = {
  "cut-explant-violin-bipennifolium":
    "วาดทับจากภาพถ่าย Philodendron bipennifolium โดย Makoto Makoto (CC BY-SA ผ่าน GBIF) " +
    "เป็นภาพโครงสร้างอ้างอิงระดับสปีชีส์เท่านั้น ไม่ใช่ภาพลายด่างของพันธุ์ Violin ด่างโดยตรง " +
    "และไม่ใช่คำแนะนำตำแหน่งตัดที่ยืนยันแล้วสำหรับพันธุ์นี้",
};

export function Illustration({ id }: { id?: string }): ReactElement | null {
  if (!id) return null;
  const Component = illustrations[id];
  return Component ? <Component /> : null;
}
