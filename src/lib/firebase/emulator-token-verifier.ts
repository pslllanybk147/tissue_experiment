export async function verifyEmulatorToken(idToken: string, projectId: string): Promise<{ uid: string }> {
  const { getApps, initializeApp } = await import("firebase-admin/app");
  const { getAuth } = await import("firebase-admin/auth");
  const app = getApps()[0] ?? initializeApp({ projectId });
  const decoded = await getAuth(app).verifyIdToken(idToken);
  return { uid: decoded.uid };
}
