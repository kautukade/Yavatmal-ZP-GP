import { RoleId } from "@/types";
import { roleScope } from "@/permissions";

export interface NavItem {
  key: string;
  path: string;
  label: string;
  labelMr: string;
  icon: string; // lucide icon name
  /** which scopes may see this item. If omitted, all authenticated. */
  scopes?: ("public" | "gp" | "block" | "district" | "system")[];
  /** explicit role allow-list (overrides scopes) */
  roles?: RoleId[];
  /** show in mobile bottom nav */
  mobile?: boolean;
  group: "main" | "modules" | "system";
}

export const NAV_ITEMS: NavItem[] = [
  { key: "home", path: "/app", label: "Home", labelMr: "मुख्यपृष्ठ", icon: "LayoutDashboard", group: "main", mobile: true },
  { key: "mywork", path: "/app/my-work", label: "My Work", labelMr: "माझे काम", icon: "ListChecks", group: "main", mobile: true, scopes: ["gp", "block"] },
  { key: "pathpurava", path: "/app/pathpurava", label: "PATHPURAVA", labelMr: "पाठपुरावा", icon: "FileCheck2", group: "modules", mobile: true, scopes: ["gp", "block", "district", "system"] },
  { key: "nigaa", path: "/app/nigaa", label: "NIGAA", labelMr: "निगा", icon: "Wrench", group: "modules", mobile: true, scopes: ["gp", "block", "district", "system"] },
  { key: "fileflow", path: "/app/pathpurava/file-flow", label: "GP File Flow", labelMr: "फाइल प्रवाह", icon: "FileStack", group: "modules", scopes: ["gp", "block", "district", "system"] },
  { key: "complaints", path: "/app/complaint-routing", label: "Complaint Routing", labelMr: "तक्रार मार्गक्रमण", icon: "Megaphone", group: "modules" },
  { key: "mahsul", path: "/app/mahsul-sandhi", label: "Mahsul Sandhi", labelMr: "महसूल संधी", icon: "IndianRupee", group: "modules", scopes: ["block", "district", "system"] },
  { key: "processlab", path: "/app/process-lab", label: "Process Improvement", labelMr: "प्रक्रिया सुधार", icon: "FlaskConical", group: "modules", scopes: ["gp", "block", "district", "system"] },
  { key: "seasonal", path: "/app/seasonal", label: "Seasonal Readiness", labelMr: "हंगामी सज्जता", icon: "CloudRain", group: "modules", scopes: ["gp", "block", "district", "system"] },
  { key: "services", path: "/app/services", label: "Seva Ghadyal", labelMr: "सेवा घड्याळ", icon: "Clock", group: "modules", scopes: ["gp", "block", "district", "system"] },
  { key: "gramsabha", path: "/app/gramsabha", label: "Gram Sabha", labelMr: "ग्रामसभा", icon: "Users", group: "modules", scopes: ["public", "gp", "block", "district", "system"] },
  { key: "institutions", path: "/app/institutions", label: "Village Institutions", labelMr: "ग्राम संस्था", icon: "Building2", group: "modules", scopes: ["public", "gp", "block", "district", "system"] },
  { key: "participation", path: "/app/participation", label: "Community Participation", labelMr: "समुदाय सहभाग", icon: "HeartHandshake", group: "modules", scopes: ["public", "gp", "block", "district", "system"] },
  { key: "convergence", path: "/app/convergence", label: "Convergence", labelMr: "समन्वय", icon: "GitMerge", group: "modules", scopes: ["gp", "block", "district", "system"] },
  { key: "innovation", path: "/app/innovation", label: "Innovation Library", labelMr: "नवोपक्रम", icon: "Lightbulb", group: "modules", scopes: ["gp", "block", "district", "system"] },
  { key: "transparency", path: "/app/transparency", label: "Public Transparency", labelMr: "पारदर्शकता", icon: "Eye", group: "modules" },
  { key: "reports", path: "/app/reports", label: "Reports", labelMr: "अहवाल", icon: "BarChart3", group: "modules", scopes: ["gp", "block", "district", "system"] },
  { key: "notifications", path: "/app/notifications", label: "Notifications", labelMr: "सूचना", icon: "Bell", group: "main", mobile: true },
  { key: "research", path: "/app/research-map", label: "Research Map", labelMr: "संशोधन नकाशा", icon: "Map", group: "system" },
  { key: "accessmap", path: "/app/access-map", label: "Role & Access Map", labelMr: "भूमिका व प्रवेश", icon: "Network", group: "system" },
  { key: "architecture", path: "/app/architecture", label: "Architecture", labelMr: "आर्किटेक्चर", icon: "Boxes", group: "system" },
  { key: "systemstatus", path: "/app/system-status", label: "Module Status", labelMr: "विभाग स्थिती", icon: "Activity", group: "system" },
  { key: "prodready", path: "/app/production-readiness", label: "Production Readiness", labelMr: "उत्पादन सज्जता", icon: "ServerCog", group: "system" },
  { key: "audit", path: "/app/audit", label: "Audit Trail", labelMr: "लेखापरीक्षण नोंद", icon: "History", group: "system", scopes: ["block", "district", "system"] },
  { key: "users", path: "/app/admin", label: "Users & Roles", labelMr: "वापरकर्ते व भूमिका", icon: "ShieldCheck", group: "system", roles: ["sysadmin"] },
  { key: "settings", path: "/app/settings", label: "Settings", labelMr: "सेटिंग्ज", icon: "Settings", group: "system" },
];

export function navForRole(role: RoleId): NavItem[] {
  const scope = roleScope(role);
  return NAV_ITEMS.filter((item) => {
    if (item.roles) return item.roles.includes(role);
    if (item.scopes) return item.scopes.includes(scope);
    return true;
  });
}

export function mobileNavForRole(role: RoleId): NavItem[] {
  return navForRole(role).filter((i) => i.mobile).slice(0, 5);
}
