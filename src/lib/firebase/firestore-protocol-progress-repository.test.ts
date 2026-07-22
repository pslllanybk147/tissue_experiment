import { describe, expect, it } from "vitest";
import type { ProtocolStepProgress } from "../domain/models";
import type { ProgressAuditEvent } from "../repositories/protocol-progress-repository";
import { createFirestoreProtocolProgressRepository, type ProgressMutation, type ProgressPersistenceAdapter } from "./firestore-protocol-progress-repository";

function harness() { let record: ProtocolStepProgress|null=null; const mutations:ProgressMutation[]=[]; const audits:ProgressAuditEvent[]=[]; const adapter:ProgressPersistenceAdapter={list:async()=>record?[record]:[],get:async()=>record,commit:async m=>{mutations.push(m);record=m.progress;audits.push(m.audit)},listAudit:async()=>audits}; const repo=createFirestoreProtocolProgressRepository("o1",{adapter,createId:()=>`e${mutations.length+1}`,now:()=>"2026-07-22T00:00:00.000Z"}); return{repo,mutations}; }
describe("Firestore protocol progress",()=>{it("pairs progress and audit and remains idempotent",async()=>{const{repo,mutations}=harness();await repo.complete("o1","l1","p1","v1","s1","done");await repo.complete("o1","l1","p1","v1","s1","done");expect(mutations).toHaveLength(1);expect(mutations[0].audit.action).toBe("completed")});it("rejects another owner",async()=>{await expect(harness().repo.list("o2","l1")).rejects.toThrow("Owner mismatch")})});
