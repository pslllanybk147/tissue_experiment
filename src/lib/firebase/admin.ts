import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function cleanEnv(val: string | undefined): string {
  if (!val) return "";
  let trimmed = val.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    trimmed = trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

export function formatPrivateKey(key: string | undefined): string {
  if (!key) return "";
  let cleaned = cleanEnv(key);
  cleaned = cleaned.replace(/\\n/g, "\n");

  const beginMarker = "-----BEGIN PRIVATE KEY-----";
  const endMarker = "-----END PRIVATE KEY-----";

  if (cleaned.includes(beginMarker) && cleaned.includes(endMarker)) {
    const startIndex = cleaned.indexOf(beginMarker) + beginMarker.length;
    const endIndex = cleaned.indexOf(endMarker);
    const base64Body = cleaned.slice(startIndex, endIndex).replace(/\s+/g, "");

    const lines = base64Body.match(/.{1,64}/g) ?? [base64Body];
    return `${beginMarker}\n${lines.join("\n")}\n${endMarker}\n`;
  }

  return cleaned;
}

export function getAdminAuth() {
  const projectId = cleanEnv(process.env.FIREBASE_ADMIN_PROJECT_ID);
  const clientEmail = cleanEnv(process.env.FIREBASE_ADMIN_CLIENT_EMAIL);
  const privateKey = formatPrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY);

  const missing: string[] = [];
  if (!projectId) missing.push("FIREBASE_ADMIN_PROJECT_ID");
  if (!clientEmail) missing.push("FIREBASE_ADMIN_CLIENT_EMAIL");
  if (!privateKey) missing.push("FIREBASE_ADMIN_PRIVATE_KEY");

  if (missing.length > 0) {
    throw new Error(`Missing variables: ${missing.join(", ")}`);
  }

  try {
    const app = getApps()[0] ?? initializeApp({
      credential: cert({ projectId, clientEmail, privateKey })
    });
    return getAuth(app);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Credential parsing failed";
    throw new Error(`Initialization failed: ${msg}`);
  }
}



