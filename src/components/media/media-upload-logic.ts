import type { ObservationMedia } from "../../lib/domain/models";

export const acceptedMediaTypes = "image/jpeg,image/png,image/webp";

export async function readApiError(response: Response, fallback: string): Promise<string> {
  try {
    const body = await response.json() as { error?: string | { message?: string } };
    if (typeof body.error === "string") return body.error;
    if (body.error?.message) return body.error.message;
    return `${fallback} (HTTP ${response.status})`;
  } catch {
    return `${fallback} (HTTP ${response.status})`;
  }
}

type UploadUser = {
  uid: string;
  getIdToken: (forceRefresh?: boolean) => Promise<string>;
};

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

type ObjectUrlApi = {
  createObjectURL: (file: File) => string;
  revokeObjectURL: (url: string) => void;
};

export function createPreviewLifecycle(urlApi: ObjectUrlApi) {
  let currentUrl = "";
  return {
    replace(file: File | null) {
      const nextUrl = file ? urlApi.createObjectURL(file) : "";
      if (currentUrl) urlApi.revokeObjectURL(currentUrl);
      currentUrl = nextUrl;
      return currentUrl;
    },
    dispose() {
      if (!currentUrl) return;
      urlApi.revokeObjectURL(currentUrl);
      currentUrl = "";
    },
  };
}

export function resetFileInput(input: Pick<HTMLInputElement, "value"> | null): void {
  if (input) input.value = "";
}

export async function uploadObservationMedia({
  file,
  lotId,
  observationId,
  caption,
  user,
  fetcher,
  now,
  onUploaded,
  onStatus,
}: {
  file: File;
  lotId: string;
  observationId: string;
  caption: string;
  user: UploadUser;
  fetcher: FetchLike;
  now: () => string;
  onUploaded: (media: ObservationMedia) => Promise<void>;
  onStatus?: (status: string) => void;
}): Promise<ObservationMedia> {
  onStatus?.("กำลังขอลายเซ็น…");
  const token = await user.getIdToken(true);
  const signedResponse = await fetcher("/api/media/sign", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ lotId, observationId, mimeType: file.type, bytes: file.size }),
  });
  if (!signedResponse.ok) throw new Error(await readApiError(signedResponse, "ขอลายเซ็นอัปโหลดไม่สำเร็จ"));
  const signed = await signedResponse.json() as {
    apiKey: string;
    timestamp: number;
    signature: string;
    folder: string;
    publicId: string;
    cloudName: string;
  };

  onStatus?.("กำลังอัปโหลด…");
  const form = new FormData();
  form.set("file", file);
  form.set("api_key", signed.apiKey);
  form.set("timestamp", String(signed.timestamp));
  form.set("signature", signed.signature);
  form.set("folder", signed.folder);
  form.set("public_id", signed.publicId);
  const upload = await fetcher(`https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  if (!upload.ok) throw new Error(await readApiError(upload, "อัปโหลดภาพไม่สำเร็จ"));
  const result = await upload.json() as {
    public_id: string;
    secure_url: string;
    width: number;
    height: number;
    format: ObservationMedia["format"];
    bytes: number;
  };
  const timestamp = now();
  const media: ObservationMedia = {
    id: signed.publicId,
    ownerId: user.uid,
    lotId,
    observationId,
    cloudinaryPublicId: result.public_id,
    secureUrl: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
    caption,
    capturedAt: null,
    createdBy: user.uid,
    createdAt: timestamp,
    updatedAt: timestamp,
    deletedAt: null,
  };
  await onUploaded(media);
  return media;
}
