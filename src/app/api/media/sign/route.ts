import { NextResponse } from "next/server";

import { getCloudinaryConfig } from "../../../../lib/cloudinary/config";
import { buildSignedUpload } from "../../../../lib/cloudinary/signature";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  let phase = "request";
  try {
    const header = request.headers.get("authorization");
    if (!header?.startsWith("Bearer ")) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    phase = "firebase";
    let uid: string;
    try {
      const { verifyFirebaseToken } = await import("../../../../lib/firebase/admin");
      const verified = await verifyFirebaseToken(header.slice(7));
      uid = verified.uid;
    } catch (adminErr) {
      const details = adminErr instanceof Error ? adminErr.message : "invalid";
      if (details.startsWith("Missing variables:")) {
        return NextResponse.json({ error: `Firebase Admin configuration invalid (${details})` }, { status: 503 });
      }
      return NextResponse.json({ error: `Invalid authentication (${details})` }, { status: 401 });
    }

    phase = "request";
    let body: { lotId?: string; observationId?: string; mimeType?: string; bytes?: number };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    if (!body.lotId || !body.observationId || !body.mimeType || !allowed.has(body.mimeType) || !Number.isFinite(body.bytes) || body.bytes! < 0 || body.bytes! > 10_000_000) return NextResponse.json({ error: "Invalid image" }, { status: 400 });

    phase = "cloudinary";
    try {
      const config = getCloudinaryConfig();
      const signed = buildSignedUpload({ uid, lotId: body.lotId, observationId: body.observationId, timestamp: Math.floor(Date.now() / 1000), apiSecret: config.apiSecret });
      return NextResponse.json({ ...signed, cloudName: config.cloudName, apiKey: config.apiKey });
    } catch {
      return NextResponse.json({ error: "Media service unavailable" }, { status: 503 });
    }
  } catch (error) {
    console.error("media-sign unexpected failure", { phase, errorName: error instanceof Error ? error.name : "UnknownError" });
    return NextResponse.json({ error: `Media signing failed during ${phase}` }, { status: 500 });
  }
}
