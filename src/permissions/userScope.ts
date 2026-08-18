// Centralized user-scope normalization, validation and default-route logic.
// Used by the Admin editor, the role switcher and the access-test suite.
import { RoleId, User } from "@/types";
import { ROLES } from "@/data/roles";
import { GPS, gpsInBlock, PILOT_GPS } from "@/data/hierarchy";

type ScopeLevel = "public" | "gp" | "block" | "district" | "system";

/** Which scope fields a role legitimately requires. */
export function scopeRequirements(role: RoleId): { district: boolean; block: boolean; gp: boolean; assignedGps: boolean; department: boolean } {
  const scope: ScopeLevel = ROLES[role].scope;
  const isDeptHead = role === "block_dept_officer" || role === "dyceo_dept_head";
  const isExtension = role === "extension_officer";
  return {
    district: scope !== "system",
    block: scope === "gp" || scope === "block",
    gp: scope === "gp",
    assignedGps: isExtension,
    department: isDeptHead,
  };
}

/**
 * Return a copy of `user` with scope fields made consistent with `newRole`.
 * Removes stale/incompatible values and fills sensible defaults so the account
 * is always valid for its role.
 */
export function normalizeUserScopeForRole(user: User, newRole: RoleId): User {
  const req = scopeRequirements(newRole);
  const next: User = { ...user, role: newRole };

  next.districtId = req.district ? user.districtId ?? "d-yvt" : undefined;

  if (req.block) {
    next.blockId = user.blockId ?? "b-yavatmal";
  } else {
    next.blockId = undefined;
  }

  if (req.gp) {
    // keep GP only if it belongs to the (resolved) block; else pick first in block
    const block = next.blockId ?? "b-yavatmal";
    const inBlock = gpsInBlock(block).map((g) => g.id);
    next.gpId = user.gpId && inBlock.includes(user.gpId) ? user.gpId : inBlock[0];
  } else {
    next.gpId = undefined;
  }

  if (req.assignedGps) {
    next.blockId = user.blockId ?? "b-yavatmal";
    // Only keep assigned GPs that belong to the (resolved) block — never cross-block.
    const inBlock = gpsInBlock(next.blockId).map((g) => g.id);
    const kept = (user.assignedGpIds ?? []).filter((id) => inBlock.includes(id));
    next.assignedGpIds = kept.length ? kept : inBlock.slice(0, Math.min(2, inBlock.length));
  } else {
    next.assignedGpIds = undefined;
  }

  next.departmentId = req.department ? user.departmentId ?? "dept-water" : undefined;

  return next;
}

export interface ScopeValidation {
  ok: boolean;
  errors: string[];
}

/** Every assigned GP must belong to the user's selected block (no cross-block). */
export function validateAssignedGpsForBlock(user: User): boolean {
  if (!user.assignedGpIds?.length || !user.blockId) return true;
  const inBlock = new Set(gpsInBlock(user.blockId).map((g) => g.id));
  return user.assignedGpIds.every((id) => inBlock.has(id));
}

/** Reject invalid role/scope combinations before saving. */
export function validateUserScope(user: User): ScopeValidation {
  const req = scopeRequirements(user.role);
  const errors: string[] = [];
  if (!user.name?.trim()) errors.push("Name is required.");
  if (!user.email?.trim()) errors.push("Email is required.");
  if (req.district && !user.districtId) errors.push("District is required for this role.");
  if (req.block && !user.blockId) errors.push("Block is required for this role.");
  if (req.gp && !user.gpId) errors.push("Gram Panchayat is required for this role.");
  if (req.department && !user.departmentId) errors.push("Department is required for this role.");
  if (req.assignedGps && (!user.assignedGpIds || user.assignedGpIds.length === 0))
    errors.push("At least one assigned Gram Panchayat is required (or mark 'No GPs Assigned').");
  if (req.assignedGps && !validateAssignedGpsForBlock(user))
    errors.push("Assigned Gram Panchayats must belong to the selected block.");
  // GP must belong to the selected block
  if (user.gpId && user.blockId) {
    const gp = GPS.find((g) => g.id === user.gpId);
    if (gp && gp.blockId !== user.blockId) errors.push("Selected Gram Panchayat does not belong to the selected block.");
  }
  return { ok: errors.length === 0, errors };
}

export interface UserAuditEvent {
  action: string;
  fromStatus?: string;
  toStatus?: string;
  comment?: string;
}

/**
 * Compare an old and updated user and produce the precise audit events —
 * used by BOTH the Edit User drawer and the quick enable/disable toggle so a
 * status transition is ALWAYS auditable regardless of entry point.
 */
export function userUpdateAuditEvents(oldUser: User | null, next: User): UserAuditEvent[] {
  const events: UserAuditEvent[] = [];
  if (!oldUser) {
    events.push({ action: `USER_CREATED — ${next.name} (${ROLES[next.role].name})` });
    return events;
  }
  if (oldUser.role !== next.role)
    events.push({ action: `USER_ROLE_CHANGED — ${next.name}`, fromStatus: ROLES[oldUser.role].name, toStatus: ROLES[next.role].name });
  if (oldUser.blockId !== next.blockId || oldUser.gpId !== next.gpId)
    events.push({ action: `USER_SCOPE_CHANGED — ${next.name}`, comment: `block ${oldUser.blockId ?? "—"}→${next.blockId ?? "—"}, gp ${oldUser.gpId ?? "—"}→${next.gpId ?? "—"}` });
  if (JSON.stringify(oldUser.assignedGpIds ?? []) !== JSON.stringify(next.assignedGpIds ?? []))
    events.push({ action: `USER_GP_ASSIGNMENT_CHANGED — ${next.name}`, comment: `${(oldUser.assignedGpIds ?? []).length}→${(next.assignedGpIds ?? []).length} GPs` });
  if (oldUser.departmentId !== next.departmentId)
    events.push({ action: `USER_DEPARTMENT_CHANGED — ${next.name}`, fromStatus: oldUser.departmentId ?? "—", toStatus: next.departmentId ?? "—" });
  const wasActive = oldUser.status !== "disabled";
  const isActiveNow = next.status !== "disabled";
  if (wasActive && !isActiveNow) events.push({ action: `USER_DISABLED — ${next.name}`, fromStatus: "active", toStatus: "disabled" });
  if (!wasActive && isActiveNow) events.push({ action: `USER_ENABLED — ${next.name}`, fromStatus: "disabled", toStatus: "active" });
  return events;
}

/** Where a role should land when its current route becomes unauthorized. */
export function roleDefaultRoute(role: RoleId): string {
  const scope = ROLES[role].scope;
  if (scope === "public") return "/public";
  if (role === "sysadmin") return "/app/admin";
  return "/app";
}
