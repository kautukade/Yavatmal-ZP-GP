import { RoleId } from "@/types";
import { ROLES } from "@/data/roles";
import { Capability, ROLE_CAPABILITIES } from "./capabilities";

export interface RouteRule {
  /** path prefix (longest match wins) */
  prefix: string;
  allowedRoles?: RoleId[];
  requiredCapability?: Capability;
  /** if true, any authenticated user may access */
  anyAuth?: boolean;
}

// Roles grouped for convenience
const ALL = Object.keys(ROLES) as RoleId[];
const NON_PUBLIC = ALL.filter((r) => ROLES[r].scope !== "public");
const OPERATIONAL = ALL.filter((r) => ["gp", "block", "district", "system"].includes(ROLES[r].scope));

/**
 * Route rules. The most specific (longest) matching prefix wins.
 * Restricted content must never render before this guard passes.
 */
export const ROUTE_RULES: RouteRule[] = [
  { prefix: "/app/admin", allowedRoles: ["sysadmin"] },
  { prefix: "/app/audit", requiredCapability: "VIEW_AUDIT_LOG" },
  { prefix: "/app/pathpurava/file-flow", requiredCapability: "VIEW_FILE_FLOW" },
  { prefix: "/app/pathpurava", allowedRoles: OPERATIONAL },
  { prefix: "/app/nigaa", allowedRoles: ALL.filter((r) => r !== "citizen" && r !== "gram_sabha_member" && r !== "volunteer" && r !== "shg_rep") },
  { prefix: "/app/complaint-routing", anyAuth: true },
  { prefix: "/app/mahsul-sandhi", requiredCapability: "VIEW_ADOPTION" },
  { prefix: "/app/process-lab", requiredCapability: "MANAGE_PROCESS_IMPROVEMENT" },
  { prefix: "/app/reports", requiredCapability: "EXPORT_DATA" },
  { prefix: "/app/my-work", allowedRoles: OPERATIONAL },
  { prefix: "/app/seasonal", allowedRoles: OPERATIONAL },
  { prefix: "/app/services", allowedRoles: NON_PUBLIC },
  { prefix: "/app/convergence", allowedRoles: OPERATIONAL },
  { prefix: "/app/documents", allowedRoles: OPERATIONAL },
  // Presentation / explainer pages — any authenticated user
  { prefix: "/app/research-map", anyAuth: true },
  { prefix: "/app/access-map", anyAuth: true },
  { prefix: "/app/architecture", anyAuth: true },
  { prefix: "/app/system-status", anyAuth: true },
  { prefix: "/app/production-readiness", anyAuth: true },
  // Broadly viewable modules
  { prefix: "/app/gramsabha", anyAuth: true },
  { prefix: "/app/institutions", anyAuth: true },
  { prefix: "/app/participation", anyAuth: true },
  { prefix: "/app/transparency", anyAuth: true },
  { prefix: "/app/innovation", allowedRoles: NON_PUBLIC },
  { prefix: "/app/notifications", anyAuth: true },
  { prefix: "/app/settings", anyAuth: true },
  { prefix: "/app", anyAuth: true }, // dashboard home
];

export function ruleForPath(path: string): RouteRule | null {
  const matches = ROUTE_RULES.filter((r) => path === r.prefix || path.startsWith(r.prefix + "/") || path.startsWith(r.prefix));
  if (!matches.length) return null;
  // longest prefix wins
  return matches.sort((a, b) => b.prefix.length - a.prefix.length)[0];
}

export function canAccessRoute(role: RoleId | undefined, path: string): boolean {
  if (!role) return false;
  const rule = ruleForPath(path);
  if (!rule) return true; // unknown internal path → allow (dashboards handle their own)
  if (rule.anyAuth) return true;
  if (rule.allowedRoles && rule.allowedRoles.includes(role)) return true;
  if (rule.requiredCapability && (ROLE_CAPABILITIES[role] ?? []).includes(rule.requiredCapability)) return true;
  if (!rule.allowedRoles && !rule.requiredCapability) return true;
  return false;
}
