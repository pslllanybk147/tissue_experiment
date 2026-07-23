import { NextResponse } from "next/server";
import { runPreprocessingJob, type PreprocessingJob } from "../../../../lib/image/preprocessing-job";
import { preprocessDatasetItem } from "../../../../lib/image/image-preprocessor";
import { uploadPreprocessedImage } from "../../../../lib/image/cloudinary-preprocessed-uploader";
import { getCloudinaryConfig } from "../../../../lib/cloudinary/config";
import type { DatasetItem } from "../../../../lib/domain/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_ITEMS = 20;

async function authenticate(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new Response(JSON.stringify({ error: "Authentication required" }), { status: 401 });
  const { verifyFirebaseToken } = await import("../../../../lib/firebase/token-verifier");
  try { return (await verifyFirebaseToken(header.slice(7))).uid; } catch { throw new Response(JSON.stringify({ error: "Invalid authentication" }), { status: 401 }); }
}

export async function POST(request: Request) {
  try {
    const uid = await authenticate(request);
    const body = await request.json() as { exportId?: unknown; retryOf?: unknown };
    if (typeof body.exportId !== "string" || !body.exportId || body.exportId.length > 160) return NextResponse.json({ error: "Invalid exportId" }, { status: 400 });
    const { getFirestore } = await import("firebase-admin/firestore");
    const { getAdminAuth } = await import("../../../../lib/firebase/admin");
    const firestore = getFirestore(getAdminAuth().app);
    const exportSnapshot = await firestore.doc(`users/${uid}/datasetExports/${body.exportId}`).get();
    if (!exportSnapshot.exists) return NextResponse.json({ error: "Export not found" }, { status: 404 });
    const exportRecord = exportSnapshot.data() as { ownerId?: string; itemIds?: unknown };
    if (exportRecord.ownerId !== uid || !Array.isArray(exportRecord.itemIds) || exportRecord.itemIds.some(item => typeof item !== "string")) return NextResponse.json({ error: "Invalid export record" }, { status: 409 });
    if (exportRecord.itemIds.length > MAX_ITEMS) return NextResponse.json({ error: `Preprocessing จำกัดไม่เกิน ${MAX_ITEMS} รูปต่อ job` }, { status: 413 });
    const itemSnapshots = await firestore.getAll(...exportRecord.itemIds.map(itemId => firestore.doc(`users/${uid}/datasetItems/${itemId}`)));
    const items = itemSnapshots.filter(snapshot => snapshot.exists).map(snapshot => snapshot.data() as DatasetItem);
    if (items.length !== exportRecord.itemIds.length) return NextResponse.json({ error: "Export contains missing dataset items" }, { status: 409 });
    const jobRef = firestore.collection(`users/${uid}/preprocessingJobs`).doc();
    const now = new Date().toISOString();
    const queued: PreprocessingJob = { id: jobRef.id, ownerId: uid, exportId: body.exportId, retryOf: typeof body.retryOf === "string" ? body.retryOf : null, status: "queued", itemIds: items.map(item => item.id), processedCount: 0, artifacts: [], createdAt: now, updatedAt: now };
    await jobRef.set(queued);
    const processing = { ...queued, status: "processing" as const, updatedAt: new Date().toISOString() };
    await jobRef.set(processing);
    const cloudinary = getCloudinaryConfig();
    const completed = await runPreprocessingJob(processing, items, async item => {
      const image = await preprocessDatasetItem(item);
      const uploaded = await uploadPreprocessedImage({ uid, lotId: item.lotId, observationId: item.observationId, datasetItemId: item.id, image, config: cloudinary });
      return { ...image, ...uploaded };
    });
    await jobRef.set(completed);
    return NextResponse.json(completed, { status: completed.status === "completed" ? 201 : 207, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Response) return new NextResponse(error.body, { status: error.status, headers: { "content-type": "application/json" } });
    console.error("dataset preprocessing job failure", { errorName: error instanceof Error ? error.name : "UnknownError" });
    return NextResponse.json({ error: "Preprocessing job unavailable" }, { status: 503 });
  }
}
