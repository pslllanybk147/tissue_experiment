"use client";

import { useSyncExternalStore } from "react";
import { OfflineBanner } from "./offline-banner";

function subscribe(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

// อ่านสถานะจากเบราว์เซอร์โดยตรงแทนการเก็บใน state เพื่อไม่ให้ค่าที่ render
// บนเซิร์ฟเวอร์กับบนเบราว์เซอร์ไม่ตรงกัน ฝั่งเซิร์ฟเวอร์ถือว่าออนไลน์เสมอ
export function useIsOnline(): boolean {
  return useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
}

export function OnlineStatus() {
  const online = useIsOnline();
  return online ? null : <OfflineBanner />;
}
