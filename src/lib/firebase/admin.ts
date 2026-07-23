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

export function getAdminAuth() {
  const projectId = cleanEnv(process.env.FIREBASE_ADMIN_PROJECT_ID);
  const clientEmail = cleanEnv(process.env.FIREBASE_ADMIN_CLIENT_EMAIL);
  let privateKey = cleanEnv(process.env.FIREBASE_ADMIN_PRIVATE_KEY);
  if (privateKey.includes("\\n")) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin is not configured");
  }

  const app = getApps()[0] ?? initializeApp({
    credential: cert({ projectId, clientEmail, privateKey })
  });

  return getAuth(app);
}

