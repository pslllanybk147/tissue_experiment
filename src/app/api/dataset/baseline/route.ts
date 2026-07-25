import { NextResponse } from "next/server";
import { buildModelReadyManifest } from "../../../../lib/domain/model-ready-exporter";
import { buildTrainingReadinessReport } from "../../../../lib/domain/training-readiness";
import type { DatasetItem } from "../../../../lib/domain/models";
import { buildBaselineEvaluation, type BaselineImageExample } from "../../../../lib/image/baseline-classifier";
import type { PreprocessingJob } from "../../../../lib/image/preprocessing-job";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_BASELINE_ITEMS = 240;
const MAX_IMAGE_BYTES = 2_000_000;

async function authenticate(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new Response(JSON.stringify({ error: "Authentication required" }), { status: 401 });
  const { verifyFirebaseToken } = await import("../../../../lib/firebase/token-verifier");
  try { return (await verifyFirebaseToken(header.slice(7))).uid; } catch { throw new Response(JSON.stringify({ error: "Invalid authentication" }), { status: 401 }); }
}

function assertCloudinaryUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:" || (url.hostname !== "cloudinary.com" && !url.hostname.endsWith(".cloudinary.com"))) throw new Error("Baseline artifact host is not allowed");
}

async function loadArtifact(url: string): Promise<Buffer> {
  assertCloudinaryUrl(url);
  const response = await fetch(url, { redirect: "error", cache: "no-store" });
  if (!response.ok) throw new Error(`Baseline artifact download failed (${response.status})`);
  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength > MAX_IMAGE_BYTES) throw new Error("Baseline artifact is too large");
  const buffer = Buffer.from(await response.arrayBuffer());
  if (!buffer.byteLength || buffer.byteLength > MAX_IMAGE_BYTES) throw new Error("Baseline artifact is too large");
  return buffer;
}

export async function POST(request: Request) {
  try {
    const uid = await authenticate(request);
    const body = await request.json() as { jobId?: unknown };
    if (typeof body.jobId !== "string" || !body.jobId || body.jobId.length > 160) return NextResponse.json({ error: "Invalid jobId" }, { status: 400 });
    const { getFirestore } = await import("firebase-admin/firestore");
    const { getAdminApp } = await import("../../../../lib/firebase/admin");
    const firestore = getFirestore(getAdminApp());
    const jobSnapshot = await firestore.doc(`users/${uid}/preprocessingJobs/${body.jobId}`).get();
    if (!jobSnapshot.exists) return NextResponse.json({ error: "Preprocessing job not found" }, { status: 404 });
    const job = jobSnapshot.data() as PreprocessingJob;
    if (job.ownerId !== uid) return NextResponse.json({ error: "Preprocessing job not found" }, { status: 404 });
    const itemSnapshots = await firestore.getAll(...job.itemIds.map((itemId) => firestore.doc(`users/${uid}/datasetItems/${itemId}`)));
    const items = itemSnapshots.filter((snapshot) => snapshot.exists).map((snapshot) => snapshot.data() as DatasetItem);
    if (items.length !== job.itemIds.length) return NextResponse.json({ error: "Preprocessing job contains missing dataset items" }, { status: 409 });
    const manifest = buildModelReadyManifest(items, job);
    const readiness = buildTrainingReadinessReport(manifest);
    if (!readiness.ready) return NextResponse.json({ error: "Dataset is not ready for baseline training", readiness }, { status: 409 });
    if (manifest.items.length > MAX_BASELINE_ITEMS) return NextResponse.json({ error: `Baseline training จำกัดไม่เกิน ${MAX_BASELINE_ITEMS} ภาพต่อ run` }, { status: 413 });
    const artifacts = new Map(job.artifacts.map((artifact) => [artifact.datasetItemId, artifact]));
    const examples: BaselineImageExample[] = await Promise.all(manifest.items.map(async (item) => {
      const artifact = artifacts.get(item.id);
      if (!artifact?.secureUrl) throw new Error(`Preprocessed artifact missing for ${item.id}`);
      return { id: item.id, lotId: item.lotId, label: `${item.scientificName} · ${item.cultivarName}`, split: item.split, buffer: await loadArtifact(artifact.secureUrl) };
    }));
    const result = await buildBaselineEvaluation(examples);
    const runId = `baseline-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    await firestore.doc(`users/${uid}/trainingRuns/${runId}`).set({
      id: runId, ownerId: uid, sourceJobId: job.id, status: "completed", createdAt: result.evaluation.generatedAt,
      schemaVersion: result.evaluation.schemaVersion, model: result.model, evaluation: result.evaluation,
    });
    return NextResponse.json({ runId, readiness, ...result }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Response) return new NextResponse(error.body, { status: error.status, headers: { "content-type": "application/json" } });
    if (error instanceof Error && /Dataset is not ready|Preprocessed artifact|not complete|Baseline artifact|Lot shared|requires at least/.test(error.message)) return NextResponse.json({ error: error.message }, { status: 409 });
    console.error("baseline training failure", { errorName: error instanceof Error ? error.name : "UnknownError" });
    return NextResponse.json({ error: "Baseline training unavailable" }, { status: 503 });
  }
}

export async function GET(request: Request) {
  try {
    const uid = await authenticate(request);
    const requestedLimit = Number(new URL(request.url).searchParams.get("limit") || 10);
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 20) : 10;
    const { getFirestore } = await import("firebase-admin/firestore");
    const { getAdminApp } = await import("../../../../lib/firebase/admin");
    const snapshot = await getFirestore(getAdminApp()).collection(`users/${uid}/trainingRuns`).get();
    const runs = snapshot.docs
      .map((document) => document.data())
      .sort((left, right) => String(right.createdAt || "").localeCompare(String(left.createdAt || "")))
      .slice(0, limit)
      .map((run) => ({
        id: run.id,
        sourceJobId: run.sourceJobId,
        status: run.status,
        createdAt: run.createdAt,
        schemaVersion: run.schemaVersion,
        evaluation: run.evaluation ? {
          validation: run.evaluation.validation ? { total: run.evaluation.validation.total, correct: run.evaluation.validation.correct, accuracy: run.evaluation.validation.accuracy } : null,
          test: run.evaluation.test ? { total: run.evaluation.test.total, correct: run.evaluation.test.correct, accuracy: run.evaluation.test.accuracy } : null,
          warnings: run.evaluation.warnings ?? [],
        } : null,
      }));
    return NextResponse.json({ runs }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Response) return new NextResponse(error.body, { status: error.status, headers: { "content-type": "application/json" } });
    console.error("baseline training run list failure", { errorName: error instanceof Error ? error.name : "UnknownError" });
    return NextResponse.json({ error: "Baseline training runs unavailable" }, { status: 503 });
  }
}
