import { NextResponse } from "next/server";
import { buildModelReadyManifest } from "../../../../lib/domain/model-ready-exporter";
import { buildTrainingReadinessReport } from "../../../../lib/domain/training-readiness";
import type { DatasetItem } from "../../../../lib/domain/models";
import type { PreprocessingJob } from "../../../../lib/image/preprocessing-job";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authenticate(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new Response(JSON.stringify({ error: "Authentication required" }), { status: 401 });
  const { verifyFirebaseToken } = await import("../../../../lib/firebase/token-verifier");
  try { return (await verifyFirebaseToken(header.slice(7))).uid; } catch { throw new Response(JSON.stringify({ error: "Invalid authentication" }), { status: 401 }); }
}

export async function POST(request: Request) {
  try {
    const uid = await authenticate(request);
    const body = await request.json() as { jobId?: unknown };
    if (typeof body.jobId !== "string" || !body.jobId || body.jobId.length > 160) return NextResponse.json({ error: "Invalid jobId" }, { status: 400 });
    const { getFirestore } = await import("firebase-admin/firestore");
    const { getAdminAuth } = await import("../../../../lib/firebase/admin");
    const firestore = getFirestore(getAdminAuth().app);
    const jobSnapshot = await firestore.doc(`users/${uid}/preprocessingJobs/${body.jobId}`).get();
    if (!jobSnapshot.exists) return NextResponse.json({ error: "Preprocessing job not found" }, { status: 404 });
    const job = jobSnapshot.data() as PreprocessingJob;
    if (job.ownerId !== uid) return NextResponse.json({ error: "Preprocessing job not found" }, { status: 404 });
    const snapshots = await firestore.getAll(...job.itemIds.map(itemId => firestore.doc(`users/${uid}/datasetItems/${itemId}`)));
    const items = snapshots.filter(snapshot => snapshot.exists).map(snapshot => snapshot.data() as DatasetItem);
    if (items.length !== job.itemIds.length) return NextResponse.json({ error: "Preprocessing job contains missing dataset items" }, { status: 409 });
    const manifest = buildModelReadyManifest(items, job);
    const report = buildTrainingReadinessReport(manifest);
    const reportId = `training-report-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    await firestore.doc(`users/${uid}/trainingReports/${reportId}`).set({ id: reportId, ownerId: uid, ...report });
    return NextResponse.json({ ...report, reportId }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Response) return new NextResponse(error.body, { status: error.status, headers: { "content-type": "application/json" } });
    if (error instanceof Error && /Preprocessed artifact|not complete/.test(error.message)) return NextResponse.json({ error: error.message }, { status: 409 });
    console.error("training readiness report failure", { errorName: error instanceof Error ? error.name : "UnknownError" });
    return NextResponse.json({ error: "Training readiness report unavailable" }, { status: 503 });
  }
}
