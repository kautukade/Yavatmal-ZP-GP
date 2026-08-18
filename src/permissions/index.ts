import { ROLES } from "@/data/roles";
import { GPS } from "@/data/hierarchy";
import { PermissionType, RoleId, ScopeLevel, User } from "@/types";

/** Resolve a record's block: explicit blockId, else derive from its GP, else null. */
export function getRecordBlockId(rec: { blockId?: string; gpId?: string }): string | null {
  if (rec.blockId) return rec.blockId;
  if (rec.gpId) return GPS.find((g) => g.id === rec.gpId)?.blockId ?? null;
  return null;
}

export interface ScopeFilter {
  districtId?: string;
  blockId?: string;
  gpIds?: string[]; // if defined, restrict to these GPs
  departmentId?: string;
  publicOnly?: boolean;
  systemWide?: boolean;
}

/** Does the user's role hold a given permission? */
export function can(user: User | null, perm: PermissionType): boolean {
  if (!user) return false;
  return ROLES[user.role].permissions.includes(perm);
}

export function roleScope(role: RoleId): ScopeLevel {
  return ROLES[role].scope;
}

/**
 * Compute the data scope for a user. This drives what records they can see.
 * DATA FLOWS UPWARD: higher roles see aggregated lower-level data.
 */
export function computeScope(user: User | null): ScopeFilter {
  if (!user) return { publicOnly: true };
  const scope = roleScope(user.role);
  switch (scope) {
    case "public":
      return { publicOnly: true, districtId: user.districtId, blockId: user.blockId, gpIds: user.gpId ? [user.gpId] : undefined };
    case "gp":
      return { districtId: user.districtId, blockId: user.blockId, gpIds: user.gpId ? [user.gpId] : [] };
    case "block":
      // Extension officers scope to assigned GPs
      if (user.assignedGpIds && user.assignedGpIds.length)
        return { districtId: user.districtId, blockId: user.blockId, gpIds: user.assignedGpIds, departmentId: user.departmentId };
      return { districtId: user.districtId, blockId: user.blockId, departmentId: user.departmentId };
    case "district":
      return { districtId: user.districtId, departmentId: user.departmentId };
    case "system":
      return { systemWide: true };
    default:
      return { publicOnly: true };
  }
}

/** Generic scope match for a record carrying district/block/gp ids. */
export function inScope(
  scope: ScopeFilter,
  rec: { districtId?: string; blockId?: string; gpId?: string; departmentId?: string; publishedPublic?: boolean; classification?: string; visibilityScope?: string }
): boolean {
  if (scope.systemWide) return true;
  if (scope.publicOnly) {
    // Public users see only published + public-classified records within their area
    if (!rec.publishedPublic) return false;
    if (rec.classification === "RESTRICTED") return false;
    return true;
  }
  // District gate.
  if (scope.districtId && rec.districtId && rec.districtId !== scope.districtId) return false;

  // Block and GP gates are enforced INDEPENDENTLY (both must hold). The record's
  // block is derived from its GP when blockId is missing — a missing block is
  // never treated as globally visible.
  const recBlock = getRecordBlockId(rec);
  if (scope.blockId && recBlock && recBlock !== scope.blockId) return false;
  if (scope.gpIds && rec.gpId && !scope.gpIds.includes(rec.gpId)) return false;

  // Department gate. For department-scoped users:
  //  - explicitly shared records (visibilityScope CROSS_DEPARTMENT / DISTRICT_SHARED
  //    / PUBLIC, or published public) are visible regardless of department;
  //  - otherwise a record with a different departmentId is not visible;
  //  - an untagged INTERNAL record (no departmentId, not shared) is NOT visible.
  if (scope.departmentId) {
    const vis = rec.visibilityScope;
    const shared = vis === "CROSS_DEPARTMENT" || vis === "DISTRICT_SHARED" || vis === "PUBLIC" || rec.publishedPublic === true;
    if (!shared) {
      if (rec.departmentId) {
        if (rec.departmentId !== scope.departmentId) return false;
      } else {
        return false;
      }
    }
  }
  return true;
}

/**
 * Can this user EDIT the original evidence/record?
 * Visibility != edit rights. A CEO can see a GP result but must not rewrite
 * the original Gram Sevak evidence.
 */
export function canEditOriginal(user: User | null, rec: { gpId?: string; blockId?: string }): boolean {
  if (!user) return false;
  const scope = roleScope(user.role);
  if (scope === "system") return false; // admin cannot silently rewrite verified gov outcomes
  if (scope === "gp") {
    if (!ROLES[user.role].permissions.includes("EDIT")) return false;
    return rec.gpId === user.gpId;
  }
  // Reviewers can review/return/verify but not overwrite the original evidence content
  return false;
}

export const isPublicRole = (role: RoleId) => roleScope(role) === "public";
export const isFieldRole = (role: RoleId) => ROLES[role].device === "mobile";
