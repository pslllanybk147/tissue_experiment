import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 160;
}

export async function POST(request: Request) {
  try {
    const header = request.headers.get("authorization");
    if (!header?.startsWith("Bearer ")) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const { verifyFirebaseToken } = await import("../../../../lib/firebase/token-verifier");
    let uid: string;
    try { uid = (await verifyFirebaseToken(header.slice(7))).uid; } catch { return NextResponse.json({ error: "Invalid authentication" }, { status: 401 }); }

    let body: { lotId?: unknown; observationId?: unknown; mediaId?: unknown };
    try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
    if (!validId(body.lotId) || !validId(body.observationId) || !validId(body.mediaId)) return NextResponse.json({ error: "Invalid media target" }, { status: 400 });

    const { getFirestore } = await import("firebase-admin/firestore");
    const { getAdminApp } = await import("../../../../lib/firebase/admin");
    const firestore = getFirestore(getAdminApp());
    const base = `users/${uid}/lots/${body.lotId}`;
    const lotRef = firestore.doc(base);
    const observationRef = firestore.doc(`${base}/observations/${body.observationId}`);
    const mediaRef = firestore.doc(`${base}/observations/${body.observationId}/media/${body.mediaId}`);
    const [lot, observation, media] = await Promise.all([lotRef.get(), observationRef.get(), mediaRef.get()]);
    if (!lot.exists || !observation.exists || !media.exists) return NextResponse.json({ error: "Media target not found" }, { status: 404 });
    const mediaData = media.data() as { ownerId?: string; lotId?: string; observationId?: string; secureUrl?: string; width?: number; height?: number; format?: "jpg" | "jpeg" | "png" | "webp"; bytes?: number; deletedAt?: string | null };
    if (mediaData.ownerId !== uid || mediaData.lotId !== body.lotId || mediaData.observationId !== body.observationId || !mediaData.secureUrl) return NextResponse.json({ error: "Media target not found" }, { status: 404 });
    if (mediaData.deletedAt) return NextResponse.json({ error: "Deleted media cannot enter review" }, { status: 409 });

    const existing = await firestore.collection(`users/${uid}/datasetItems`).where("mediaId", "==", body.mediaId).limit(1).get();
    if (!existing.empty) return NextResponse.json({ item: existing.docs[0].data(), created: false });
    const now = new Date().toISOString();
    const ref = firestore.collection(`users/${uid}/datasetItems`).doc();
    const item = { id: ref.id, ownerId: uid, mediaId: body.mediaId, lotId: body.lotId, observationId: body.observationId, assetUrl: mediaData.secureUrl, width: mediaData.width, height: mediaData.height, format: mediaData.format, bytes: mediaData.bytes, provenance: { kind: "user-captured", sourceUrl: null, license: null, attribution: null, provenanceId: `observation:${body.observationId}:media:${body.mediaId}`, status: "Pending review", reviewedBy: null, reviewedAt: null, note: "สร้างจาก Observation media; รอตรวจ provenance" }, label: null, reviewStatus: "Pending review", includedInTraining: false, createdAt: now, updatedAt: now };
    const auditRef = firestore.collection(`${base}/auditEvents`).doc();
    const audit = { id: auditRef.id, lotId: body.lotId, ownerId: uid, entityType: "media", entityId: body.mediaId, action: "dataset_queued", actorId: uid, occurredAt: now, before: null, after: { datasetItemId: ref.id, reviewStatus: "Pending review" } };
    const batch = firestore.batch();
    batch.set(ref, item);
    batch.set(auditRef, audit);
    await batch.commit();
    return NextResponse.json({ item, created: true }, { status: 201 });
  } catch (error) {
    console.error("dataset intake failure", { errorName: error instanceof Error ? error.name : "UnknownError" });
    return NextResponse.json({ error: "Dataset intake unavailable" }, { status: 503 });
  }
}
