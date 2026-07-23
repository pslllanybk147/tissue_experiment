type FirebaseProjectEnvironment = Readonly<Record<string, string | undefined>>;

function cleanProjectId(value: string | undefined): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
    || (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

export function getFirebaseProjectId(environment: FirebaseProjectEnvironment): string {
  return cleanProjectId(environment.FIREBASE_ADMIN_PROJECT_ID)
    || cleanProjectId(environment.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
}

let jwksClient: ReturnType<typeof import("jose")["createRemoteJWKSet"]> | null = null;

export async function verifyFirebaseToken(idToken: string): Promise<{ uid: string }> {
  const projectId = getFirebaseProjectId(process.env);
  if (!projectId) {
    throw new Error("Missing FIREBASE_ADMIN_PROJECT_ID or NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  }

  const { createRemoteJWKSet, jwtVerify } = await import("jose");
  jwksClient ??= createRemoteJWKSet(
    new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
  );

  try {
    const { payload } = await jwtVerify(idToken, jwksClient, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });

    if (typeof payload.sub === "string" && payload.sub) {
      return { uid: payload.sub };
    }
    throw new Error("Invalid token subject (sub claim missing)");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`JWT verification failed (project ${projectId}): ${message}`);
  }
}
