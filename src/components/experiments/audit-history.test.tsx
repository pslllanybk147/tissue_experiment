import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { AuditEvent } from "../../lib/domain/models";
import { AuditHistory } from "./audit-history";

const event: AuditEvent = { id: "a1", lotId: "PPP-001", ownerId: "u1", entityType: "observation", entityId: "o1", action: "updated", actorId: "u1", occurredAt: "2026-07-22T10:00:00Z", before: { note: "เดิม" }, after: { note: "ใหม่" } };
describe("AuditHistory", () => { it("renders immutable audit summaries", () => { const html = renderToStaticMarkup(<AuditHistory events={[event]} />); expect(html).toContain("updated"); expect(html).toContain("เดิม"); expect(html).toContain("ใหม่"); expect(html).not.toContain("ลบ audit"); }); });
