export function readDemoState<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

export function writeDemoState<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Demo storage is best-effort; authenticated work uses Firestore.
  }
}

export function demoStorageKey(ownerId: string, domain: string) {
  return `philodendron-lab:demo:${ownerId}:${domain}:v1`;
}
