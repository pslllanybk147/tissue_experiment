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

export const illustrations: Record<string, () => ReactElement> = {
  "receive-baseline": ReceiveBaseline,
  "quarantine-check": QuarantineCheck,
  "identify-compare": IdentifyCompare,
  "node-cut-diagram": NodeCutDiagram,
  "cut-explant": CutExplant,
  "prep-media": PrepMedia,
  "sterilize-timer": SterilizeTimer,
};

export function Illustration({ id }: { id?: string }): ReactElement | null {
  if (!id) return null;
  const Component = illustrations[id];
  return Component ? <Component /> : null;
}
