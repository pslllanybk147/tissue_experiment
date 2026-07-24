import type { ProtocolRecord, ProtocolVersion } from "../domain/models";
import type { KnowledgeSource, SourceClaim } from "../domain/knowledge-sources";
import { createPlaybookDraftInput } from "../domain/approved-claim-gate";
import { nextDraftVersion } from "../domain/protocol-versioning";
import type { ProtocolAuditEvent, ProtocolRepository } from "./protocol-repository";

const clone = <T,>(value: T): T => structuredClone(value);
const slugify = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "protocol";

export function createDefaultSeedProtocols(uid: string): { protocol: ProtocolRecord; version: ProtocolVersion }[] {
  const now = new Date().toISOString();
  return [
    {
      protocol: {
        id: "protocol-nodal-v01",
        ownerId: uid,
        title: "Nodal Establishment & Sterilization Protocol",
        slug: "nodal-establishment-sterilization-protocol",
        plantScope: "Philodendron erubescens & Variegated hybrids",
        evidenceState: "Verified",
        status: "Active",
        currentVersionId: "version-nodal-v01",
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      version: {
        id: "version-nodal-v01",
        protocolId: "protocol-nodal-v01",
        ownerId: uid,
        version: "1.0.0",
        summary: "สูตรมาตรฐานฟอกฆ่าเชื้อชิ้นส่วนข้อตา และลงวุ้นอาหาร MS Base ปลอดเชื้อ",
        changeNote: "การเปิดใช้งานเวอร์ชัน 1.0.0 เริ่มต้น",
        createdBy: uid,
        createdAt: now,
        publishedAt: now,
        steps: [
          {
            id: "step-1",
            order: 1,
            title: "ฟอกฆ่าเชื้อชิ้นส่วนข้อตา (Surface Sterilization)",
            instruction: "นำชิ้นส่วนข้อตาล้างด้วยน้ำยาล้างจานสกัดคราบดิน แช่ใน Sodium Hypochlorite (Haiter) 10-15% + Tween-20 2 หยด นาน 15 นาที เขย่าสม่ำเสมอ",
            durationMinutes: 15,
            criticalControls: ["ควบคุมความเข้มข้น Haiter 10-15%", "จับเวลาเขย่า 15 นาทีเข้มงวด"],
            safetyNotes: ["สวมถุงมือยางและแว่นตานิรภัย"],
            referenceIds: ["L-CHERRY-2022"],
            evidenceState: "Verified",
          },
          {
            id: "step-2",
            order: 2,
            title: "ล้างน้ำกลั่นนึ่งฆ่าเชื้อ 3 ครั้ง (Sterile Water Rinse)",
            instruction: "เทสารฟอกออกในตู้ปลอดเชื้อ ล้างด้วยน้ำกลั่นออโตเคลฟนึ่งฆ่าเชื้อ 3 ครั้ง ทิ้งไว้ครั้งละ 5 นาทีเพื่อล้างคราบคลอรีนออกให้หมด",
            durationMinutes: 15,
            criticalControls: ["ล้างในตู้ Laminar Flow เท่านั้น", "ห้ามเปิดฝาขวดนอกตู้"],
            safetyNotes: ["ระวังความร้อนจากเปลวไฟตะเกียงแอลกอฮอล์"],
            referenceIds: [],
            evidenceState: "Verified",
          },
          {
            id: "step-3",
            order: 3,
            title: "ผ่าตกแต่งเนื้อเยื่อข้อตา (Explant Trimming)",
            instruction: "ใช้มีดผ่าตัด (Scalpel #11) เฉือนชิ้นส่วนเนื้อเยื่อช้ำบริเวณขอบออก ให้เหลือเฉพาะชิ้นส่วนข้อตาชิ้นสมบูรณ์ขนาด 0.5 - 1.0 ซม.",
            durationMinutes: 20,
            criticalControls: ["ลนมีดและปากคีบด้วยไฟก่อนตัดทุกครั้ง"],
            safetyNotes: ["มีดผ่าตัดมีความคมสูง"],
            referenceIds: [],
            evidenceState: "Verified",
          },
          {
            id: "step-4",
            order: 4,
            title: "ปักวางชิ้นส่วนตาลงอาหาร MS Base (Culture Inoculation)",
            instruction: "คีบชิ้นส่วนข้อตาปักลงบนอาหาร MS Base ปราศจากฮอร์โมน ปักให้แนวข้อตาดังกล่าวสัมผัสวุ้นอาหารพอดี",
            durationMinutes: 10,
            criticalControls: ["ห้ามจมชิ้นส่วนข้อตาลงมิดวุ้นเพื่อป้องกันการขาดออกซิเจน"],
            safetyNotes: [],
            referenceIds: ["L-PP-2023"],
            evidenceState: "Verified",
          },
          {
            id: "step-5",
            order: 5,
            title: "ปิดพันปากขวดและบันทึกรหัสล็อต (Sealing & Labeling)",
            instruction: "ปิดฝาขวดและพันปากขวดด้วย Parafilm 2 รอบ เขียนรหัสล็อต รหัสโปรโตคอล และวันที่ลงบนขวดชัดเจน",
            durationMinutes: 5,
            criticalControls: ["พัน Parafilm แน่นหนาป้องกันมดแมลงและความชื้นระเหย"],
            safetyNotes: [],
            referenceIds: [],
            evidenceState: "Verified",
          },
          {
            id: "step-6",
            order: 6,
            title: "ย้ายเข้าห้องเพาะเลี้ยงควบคุมสภาพแวดล้อม (Incubation)",
            instruction: "นำขวดไปวางบนชั้นเพาะเลี้ยง ปรับไฟ LED 16 ชม./วัน อุณหภูมิ 25 ± 2°C ตรวจสังเกตการปนเปื้อนทุก 3 วัน",
            durationMinutes: null,
            criticalControls: ["อุณหภูมิ 25 ± 2°C", "ความเข้มแสง 2,000-3,000 Lux"],
            safetyNotes: [],
            referenceIds: [],
            evidenceState: "Verified",
          },
        ],
      },
    },
    {
      protocol: {
        id: "protocol-multiplication-v01",
        ownerId: uid,
        title: "Shooting & Multiplication Stage II Protocol",
        slug: "shooting-multiplication-stage-ii-protocol",
        plantScope: "Philodendron Pink Princess / White Wizard",
        evidenceState: "Verified",
        status: "Active",
        currentVersionId: "version-multiplication-v01",
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      version: {
        id: "version-multiplication-v01",
        protocolId: "protocol-multiplication-v01",
        ownerId: uid,
        version: "1.0.0",
        summary: "สูตรเร่งการแตกยอดและเพิ่มปริมาณยอดในขวดเพาะเลี้ยงเนื้อเยื่อ (MS + 1.5 mg/L BA)",
        changeNote: "การเปิดใช้งานเวอร์ชัน 1.0.0 เริ่มต้น",
        createdBy: uid,
        createdAt: now,
        publishedAt: now,
        steps: [
          {
            id: "m-step-1",
            order: 1,
            title: "คัดแยกกระจุกยอดที่ตั้งตัวแล้ว (Cluster Selection)",
            instruction: "เลือกขวดเพาะเลี้ยงข้อตาที่แตกยอดแล้วอายุ 21-28 วัน ปราศจากการปนเปื้อน นำเข้าผ่าในตู้ปลอดเชื้อ",
            durationMinutes: 10,
            criticalControls: ["ตรวจดูเชื้อราและแบคทีเรียอย่างละเอียดก่อนเปิดขวด"],
            safetyNotes: [],
            referenceIds: ["L-PP-2023"],
            evidenceState: "Verified",
          },
          {
            id: "m-step-2",
            order: 2,
            title: "ตัดแบ่งยอดเดี่ยว (Single Shoot Separation)",
            instruction: "ใช้มีดผ่าตัดแบ่งกระจุกยอดออกเป็นยอดเดี่ยว ความสูงอย่างน้อย 1.0 ซม. เล็มตัดใบเก่าที่เหลืองออก",
            durationMinutes: 15,
            criticalControls: ["ตัดแยกบริเวณฐานยอดอย่างระมัดระวังไม่ให้ยอดช้ำ"],
            safetyNotes: [],
            referenceIds: [],
            evidenceState: "Verified",
          },
          {
            id: "m-step-3",
            order: 3,
            title: "ย้ายลงอาหาร MS + BA 1.5 mg/L + NAA 0.2 mg/L",
            instruction: "ปักยอดเดี่ยวลงอาหารเร่งยอดขวดละ 4-5 ยอด เว้นระยะห่างสม่ำเสมอเพื่อไม่ให้ใบบดบังแสงกัน",
            durationMinutes: 10,
            criticalControls: ["ใช้สูตรอาหารที่มี Cytokinin เข้มข้นเหมาะสม"],
            safetyNotes: [],
            referenceIds: ["L-PP-2023"],
            evidenceState: "Verified",
          },
        ],
      },
    },
    {
      protocol: {
        id: "protocol-rooting-v01",
        ownerId: uid,
        title: "Rooting & Acclimatization Stage III/IV Protocol",
        slug: "rooting-acclimatization-stage-iii-iv-protocol",
        plantScope: "Philodendron ทุกสายพันธุ์",
        evidenceState: "Verified",
        status: "Active",
        currentVersionId: "version-rooting-v01",
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      version: {
        id: "version-rooting-v01",
        protocolId: "protocol-rooting-v01",
        ownerId: uid,
        version: "1.0.0",
        summary: "สูตรชักนำการเกิดรากและปรับสภาพต้นพืชออกสู่โรงเรือน (1/2 MS + 0.5 mg/L IBA)",
        changeNote: "การเปิดใช้งานเวอร์ชัน 1.0.0 เริ่มต้น",
        createdBy: uid,
        createdAt: now,
        publishedAt: now,
        steps: [
          {
            id: "r-step-1",
            order: 1,
            title: "คัดยอดสมบูรณ์ความยาว > 2.5 ซม. (Shoot Selection for Rooting)",
            instruction: "เลือกยอดที่แข็งแรงมีใบสีเขียวสมบูรณ์ ตัดย้ายลงสูตรอาหารเร่งราก 1/2 MS + IBA 0.5 mg/L เลี้ยง 14-21 วัน",
            durationMinutes: 15,
            criticalControls: ["ย้ายยอดความยาวไม่น้อยกว่า 2.5 ซม."],
            safetyNotes: [],
            referenceIds: [],
            evidenceState: "Verified",
          },
          {
            id: "r-step-2",
            order: 2,
            title: "ล้างวุ้นออกด้วยน้ำสะอาดปราศจากเชื้อ (Agar Washing)",
            instruction: "นำต้นที่มีรากออกจากขวด ล้างเศษวุ้นออกจากรากด้วยน้ำอุ่นสะอาดสม่ำเสมอเพื่อป้องกันการเกิดรากเน่า",
            durationMinutes: 15,
            criticalControls: ["ล้างวุ้นออกให้หมด 100%"],
            safetyNotes: [],
            referenceIds: [],
            evidenceState: "Verified",
          },
          {
            id: "r-step-3",
            order: 3,
            title: "ย้ายปลูกในวัสดุอบความชื้น (Acclimatization)",
            instruction: "ปลูกในวัสดุ Sphagnum Moss + Perlite (1:1) รดน้ำผสมยากันรา อบในถุงพลาสติกใสปิดแน่น 14 วัน",
            durationMinutes: 20,
            criticalControls: ["ควบคุมความชื้นสัมพัทธ์ในถุงอบ > 90%"],
            safetyNotes: [],
            referenceIds: [],
            evidenceState: "Verified",
          },
        ],
      },
    },
  ];
}

export function createMemoryProtocolRepository(uid: string): ProtocolRepository {
  const protocols = new Map<string, ProtocolRecord>();
  const versions = new Map<string, ProtocolVersion[]>();
  const audit = new Map<string, ProtocolAuditEvent[]>();

  // Seed default tissue culture protocols
  const defaultSeeds = createDefaultSeedProtocols(uid);
  for (const seed of defaultSeeds) {
    protocols.set(seed.protocol.id, seed.protocol);
    versions.set(seed.protocol.id, [seed.version]);
  }

  const guard = (ownerId: string) => { if (ownerId !== uid) throw new Error("Owner mismatch"); };
  const event = (protocolId: string, action: ProtocolAuditEvent["action"], before: unknown, after: unknown) => {
    const item: ProtocolAuditEvent = { id: crypto.randomUUID(), protocolId, ownerId: uid, action, occurredAt: new Date().toISOString(), before: before as Record<string, unknown> | null, after: after as Record<string, unknown> | null };
    audit.set(protocolId, [...(audit.get(protocolId) ?? []), item]);
  };
  return {
    async list(ownerId, includeArchived = false) { guard(ownerId); return clone([...protocols.values()].filter(p => includeArchived || p.status !== "Archived")); },
    async get(ownerId, protocolId) { guard(ownerId); const protocol = protocols.get(protocolId); return protocol ? clone({ protocol, versions: versions.get(protocolId) ?? [] }) : null; },
    async createDraft(ownerId, input) {
      guard(ownerId); const now = new Date().toISOString(); const id = `protocol-${crypto.randomUUID()}`; const versionId = `version-${crypto.randomUUID()}`;
      const protocol: ProtocolRecord = { id, ownerId, title: input.title, slug: slugify(input.title), plantScope: input.plantScope, evidenceState: input.evidenceState, status: "Draft", currentVersionId: versionId, createdAt: now, updatedAt: now, deletedAt: null };
      const version: ProtocolVersion = { id: versionId, protocolId: id, ownerId, version: "0.1.0", summary: input.summary, changeNote: input.changeNote, steps: clone(input.steps), createdBy: ownerId, createdAt: now, publishedAt: null };
      protocols.set(id, protocol); versions.set(id, [version]); event(id, "created", null, protocol); return clone(protocol);
    },
    async createDraftFromClaim(ownerId, claim: SourceClaim, source: KnowledgeSource) {
      guard(ownerId); const input = createPlaybookDraftInput(claim, source); const now = new Date().toISOString(); const id = `protocol-${crypto.randomUUID()}`; const versionId = `version-${crypto.randomUUID()}`;
      const protocol: ProtocolRecord = { id, ownerId, title: input.title, slug: slugify(input.title), plantScope: input.plantScope, evidenceState: input.evidenceState, status: "Draft", currentVersionId: versionId, createdAt: now, updatedAt: now, deletedAt: null };
      const version: ProtocolVersion = { id: versionId, protocolId: id, ownerId, version: "0.1.0", summary: input.summary, changeNote: input.changeNote, steps: [], claimIds: input.claimIds, sourceIds: input.sourceIds, createdBy: ownerId, createdAt: now, publishedAt: null };
      protocols.set(id, protocol); versions.set(id, [version]); event(id, "created_from_claim", null, { protocol, version }); return clone(protocol);
    },
    async saveDraftVersion(ownerId, protocolId, versionId, input) {
      guard(ownerId); const protocol = protocols.get(protocolId); const items = versions.get(protocolId) ?? []; const current = items.find(v => v.id === versionId);
      if (!protocol || !current) throw new Error("Protocol not found");
      if (current.publishedAt) throw new Error("Published versions are immutable");
      const updated = { ...current, summary: input.summary, changeNote: input.changeNote, steps: clone(input.steps), claimIds: clone(input.claimIds), sourceIds: clone(input.sourceIds) }; versions.set(protocolId, items.map(v => v.id === versionId ? updated : v)); event(protocolId, "updated", current, updated); return clone(updated);
    },
    async createDraftVersion(ownerId, protocolId, sourceVersionId, changeNote) {
      guard(ownerId); const protocol = protocols.get(protocolId); const items = versions.get(protocolId) ?? []; const source = items.find(v => v.id === sourceVersionId);
      if (!protocol || !source) throw new Error("Protocol not found");
      const now = new Date().toISOString(); const draft: ProtocolVersion = { ...clone(source), id: `version-${crypto.randomUUID()}`, version: nextDraftVersion(source.version), changeNote, createdAt: now, createdBy: ownerId, publishedAt: null };
      const next = { ...protocol, status: "Draft" as const, currentVersionId: draft.id, updatedAt: now }; versions.set(protocolId, [...items, draft]); protocols.set(protocolId, next); event(protocolId, "version_created", source, draft); return clone(draft);
    },
    async activateVersion(ownerId, protocolId, versionId) {
      guard(ownerId); const protocol = protocols.get(protocolId); const items = versions.get(protocolId) ?? []; const current = items.find(v => v.id === versionId);
      if (!protocol || !current) throw new Error("Protocol not found");
      if (protocol.status === "Active" && protocol.currentVersionId === versionId && current.publishedAt) return clone(protocol);
      const now = new Date().toISOString(); const activated = { ...protocol, status: "Active" as const, currentVersionId: versionId, updatedAt: now }; versions.set(protocolId, items.map(v => v.id === versionId ? { ...v, publishedAt: now } : v)); protocols.set(protocolId, activated); event(protocolId, "activated", protocol, activated); return clone(activated);
    },
    async archive(ownerId, protocolId) { guard(ownerId); const current = protocols.get(protocolId); if (!current) throw new Error("Protocol not found"); if (current.status === "Archived") return clone(current); const next = { ...current, status: "Archived" as const, updatedAt: new Date().toISOString() }; protocols.set(protocolId, next); event(protocolId, "archived", current, next); return clone(next); },
    async listAuditEvents(ownerId, protocolId) { guard(ownerId); return clone(audit.get(protocolId) ?? []); },
  };
}
