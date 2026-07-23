import { NextResponse } from "next/server";
import { buildDatasetManifest } from "../../../../lib/domain/dataset-exporter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const header = request.headers.get("authorization");
    if (!header?.startsWith("Bearer ")) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const { verifyFirebaseToken } = await import("../../../../lib/firebase/token-verifier");
    let uid: string;
    try { uid = (await verifyFirebaseToken(header.slice(7))).uid; } catch { return NextResponse.json({ error: "Invalid authentication" }, { status: 401 }); }
    const { getFirestore } = await import("firebase-admin/firestore");
    const { getAdminAuth } = await import("../../../../lib/firebase/admin");
    const firestore = getFirestore(getAdminAuth().app);
    const snapshot = await firestore.collection(`users/${uid}/datasetItems`).get();
    const manifest = buildDatasetManifest(snapshot.docs.map(item => item.data() as Parameters<typeof buildDatasetManifest>[0][number]));
    return NextResponse.json(manifest, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("dataset export failure", { errorName: error instanceof Error ? error.name : "UnknownError" });
    return NextResponse.json({ error: "Dataset export unavailable" }, { status: 503 });
  }
}
