"use client";

import type { ReactNode } from "react";
import { useAuth } from "./auth-provider";

export function AuthGate({ children }: { children: ReactNode }) {
  const { session, signIn, useDemo } = useAuth();

  if (session.status === "loading") return <main className="auth-screen"><div className="auth-card"><span className="auth-mark">PL</span><p className="eyebrow">SECURE WORKSPACE</p><h1>กำลังตรวจสอบการเข้าใช้งาน</h1><p>รอสักครู่…</p><div className="auth-loading" aria-label="Loading" /></div></main>;

  if (session.status === "unconfigured") return <main className="auth-screen"><div className="auth-card"><span className="auth-mark">PL</span><p className="eyebrow">SECURE WORKSPACE</p><h1>ยังไม่ได้เชื่อมบัญชี</h1><p>เครื่องนี้ยังไม่ได้ตั้งค่าบัญชีสำหรับเก็บข้อมูลบนคลาวด์ คุณเข้าโหมดทดลองใช้ได้เลย ทำได้ครบทุกอย่างยกเว้นการแนบรูป</p><button className="primary-button auth-action" onClick={useDemo}>เข้าโหมดทดลองใช้</button><small>ข้อมูลโหมดทดลองเก็บไว้ในเบราว์เซอร์ของเครื่องนี้เท่านั้น ไม่หายเมื่อรีเฟรช แต่จะหายถ้าล้างข้อมูลเบราว์เซอร์ และไม่ซิงก์ไปเครื่องอื่น</small></div></main>;

  if (session.status === "signed-out") return <main className="auth-screen"><div className="auth-card"><span className="auth-mark">PL</span><p className="eyebrow">PRIVATE RESEARCH LAB</p><h1>เข้าสู่ Plantlover Lab</h1><p>ต้องยืนยันตัวตนก่อนดูหรือแก้ไข protocol, experiment lots และ research review</p><button className="primary-button auth-action" onClick={() => void signIn()}>Sign in with Google</button><small>Firestore rules จำกัดข้อมูลตาม owner UID</small></div></main>;

  return <>{children}</>;
}
