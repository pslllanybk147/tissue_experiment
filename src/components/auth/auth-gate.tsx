"use client";

import type { ReactNode } from "react";
import { useAuth } from "./auth-provider";

export function AuthGate({ children }: { children: ReactNode }) {
  const { session, signIn, useDemo } = useAuth();

  if (session.status === "loading") return <main className="auth-screen"><div className="auth-card"><span className="auth-mark">PL</span><p className="eyebrow">SECURE WORKSPACE</p><h1>กำลังตรวจสอบเซสชัน</h1><p>กำลังเชื่อมต่อ Firebase Authentication…</p><div className="auth-loading" aria-label="Loading" /></div></main>;

  if (session.status === "unconfigured") return <main className="auth-screen"><div className="auth-card"><span className="auth-mark">PL</span><p className="eyebrow">LOCAL DEVELOPMENT</p><h1>Firebase ยังไม่ได้ตั้งค่า</h1><p>เพิ่มค่าใน <code>.env.local</code> เพื่อใช้บัญชีจริง หรือเปิดพื้นที่สาธิตเพื่อทดสอบ workflow โดยไม่เขียนข้อมูลขึ้น cloud</p><button className="primary-button auth-action" onClick={useDemo}>Continue in demo mode</button><small>Demo data จะอยู่ในหน่วยความจำและหายเมื่อ refresh</small></div></main>;

  if (session.status === "signed-out") return <main className="auth-screen"><div className="auth-card"><span className="auth-mark">PL</span><p className="eyebrow">PRIVATE RESEARCH LAB</p><h1>เข้าสู่ Philodendron Lab</h1><p>ต้องยืนยันตัวตนก่อนดูหรือแก้ไข protocol, experiment lots และ research review</p><button className="primary-button auth-action" onClick={() => void signIn()}>Sign in with Google</button><small>Firestore rules จำกัดข้อมูลตาม owner UID</small></div></main>;

  return <>{children}</>;
}
