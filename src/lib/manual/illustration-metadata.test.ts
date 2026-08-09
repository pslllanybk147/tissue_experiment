import { describe, expect, it } from "vitest";
import { illustrations } from "@/components/guide/illustrations";
import { GENERATED_DIAGRAM_DISCLAIMER, illustrationMetadata } from "./illustration-metadata";

describe("illustration metadata", () => {
  it("มี metadata ภาษาไทยและแหล่งที่มาสำหรับภาพทุกภาพที่ render ได้", () => {
    expect(new Set(illustrationMetadata.map((item) => item.id))).toEqual(new Set(Object.keys(illustrations)));
    for (const item of illustrationMetadata) {
      expect(item.altTh).toMatch(/[ก-๙]/);
      expect(item.purpose).toMatch(/[ก-๙]/);
      expect(item.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(["generated-diagram", "licensed-reference", "user-evidence"]).toContain(item.sourceType);
    }
  });

  it("ภาพวาดขึ้นใหม่ทุกภาพมีคำเตือนตายตัว", () => {
    for (const item of illustrationMetadata.filter((entry) => entry.sourceType === "generated-diagram")) {
      expect(item.disclaimer).toBe(GENERATED_DIAGRAM_DISCLAIMER);
    }
  });

  it("ไม่อ้างภาพหลักฐานผู้ใช้เป็นภาพประกอบในคู่มือ", () => {
    expect(illustrationMetadata.some((item) => item.sourceType === "user-evidence")).toBe(false);
  });
});
