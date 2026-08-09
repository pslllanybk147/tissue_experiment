import rawMetadata from "../../../public/illustrations/metadata.json";

export const GENERATED_DIAGRAM_DISCLAIMER = "ภาพประกอบ ไม่ใช่ภาพตัวอย่างผลทดลองจริง";

export type IllustrationSourceType = "generated-diagram" | "licensed-reference" | "user-evidence";

export type IllustrationMetadata = {
  id: string;
  file: string;
  altTh: string;
  purpose: string;
  sourceType: IllustrationSourceType;
  createdAt: string;
  prompt: string;
  disclaimer: string;
};

export const illustrationMetadata = rawMetadata as IllustrationMetadata[];

export function illustrationMetaById(id?: string): IllustrationMetadata | null {
  if (!id) return null;
  return illustrationMetadata.find((item) => item.id === id) ?? null;
}
