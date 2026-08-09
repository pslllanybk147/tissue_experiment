import type { TrialArmRole } from "@/lib/domain/models";

export type JarAllocation = {
  allocations: Record<TrialArmRole, number>;
  reserved: number;
  unassigned: number;
};

function requireWhole(value: number, label: string) {
  if (!Number.isInteger(value) || value < 0) throw new Error(`${label}ต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป`);
}

export function allocateTrialJars(
  total: number,
  roles: readonly TrialArmRole[],
  requestedReserved: number,
): JarAllocation {
  requireWhole(total, "จำนวนกระปุกทั้งหมด");
  requireWhole(requestedReserved, "จำนวนกระปุกสำรอง");
  if (new Set(roles).size !== roles.length) throw new Error("ชื่อแขนทดลองต้องไม่ซ้ำกัน");

  const reserved = Math.min(total, requestedReserved);
  const available = total - reserved;
  const perRole = roles.length > 0 ? Math.floor(available / roles.length) : 0;
  let remainder = roles.length > 0 ? available % roles.length : available;
  const allocations = { "control-a": 0, "control-b": 0, t1: 0, t2: 0, t3: 0 } satisfies Record<TrialArmRole, number>;

  for (const role of roles) {
    allocations[role] = perRole + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
  }
  const assigned = Object.values(allocations).reduce((sum, value) => sum + value, 0);
  return { allocations, reserved, unassigned: total - reserved - assigned };
}
