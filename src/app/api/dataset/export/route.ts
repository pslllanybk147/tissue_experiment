import { NextResponse } from "next/server";
import { buildDatasetManifest } from "../../../../lib/domain/dataset-exporter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authenticate(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new Response(JSON.stringify({ error: "Authentication required" }), { status: 401 });
  const { verifyFirebaseToken } = await import("../../../../lib/firebase/token-verifier");
  try { return (await verifyFirebaseToken(header.slice(7))).uid; } catch { throw new Response(JSON.stringify({ error: "Invalid authentication" }), { status: 401 }); }
}

async function getManifest(uid: string) {
  const { getFirestore } = await import("firebase-admin/firestore");
  const { getAdminAuth } = await import("../../../../lib/firebase/admin");
  const firestore = getFirestore(getAdminAuth().app);
  const snapshot = await firestore.collection(`users/${uid}/datasetItems`).get();
  return { firestore, manifest: buildDatasetManifest(snapshot.docs.map(item => item.data() as Parameters<typeof buildDatasetManifest>[0][number])) };
}

export async function GET(request: Request) {
  try {
    const uid = await authenticate(request);
    const { manifest } = await getManifest(uid);
    return NextResponse.json(manifest, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Response) return new NextResponse(error.body, { status: error.status, headers: { "content-type": "application/json" } });
    console.error("dataset export failure", { errorName: error instanceof Error ? error.name : "UnknownError" });
    return NextResponse.json({ error: "Dataset export unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const uid = await authenticate(request);
    const { firestore, manifest } = await getManifest(uid);
    const id = `export-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    const record = { id, ownerId: uid, schemaVersion: manifest.schemaVersion, generatedAt: manifest.generatedAt, itemCount: manifest.itemCount, itemIds: manifest.items.map(item => item.id), splitCounts: manifest.splitCounts, splitStrategy: "lot-hash-v1" };
    await firestore.doc(`users/${uid}/datasetExports/${id}`).set(record);
    return NextResponse.json({ ...manifest, exportId: id }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Response) return new NextResponse(error.body, { status: error.status, headers: { "content-type": "application/json" } });
    console.error("dataset export history failure", { errorName: error instanceof Error ? error.name : "UnknownError" });
    return NextResponse.json({ error: "Dataset export unavailable" }, { status: 503 });
  }
}
