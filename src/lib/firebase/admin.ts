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

let jwksClient: any = null;

export async function verifyFirebaseToken(idToken: string): Promise<{ uid: string }> {
  const projectId = cleanEnv(process.env.FIREBASE_ADMIN_PROJECT_ID) || cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

  if (!projectId) {
    throw new Error("Missing FIREBASE_ADMIN_PROJECT_ID or NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  }

  const { jwtVerify, createRemoteJWKSet } = await import("jose");

  if (!jwksClient) {
    jwksClient = createRemoteJWKSet(
      new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
    );
  }

  try {
    const { payload } = await jwtVerify(idToken, jwksClient, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });

    if (typeof payload.sub === "string" && payload.sub) {
      return { uid: payload.sub };
    }
    throw new Error("Invalid token subject (sub claim missing)");
  } catch (joseErr) {
    const msg = joseErr instanceof Error ? joseErr.message : String(joseErr);
    throw new Error(`JWT verification failed (project ${projectId}): ${msg}`);
  }
}
