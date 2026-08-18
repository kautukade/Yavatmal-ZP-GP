import {
  AssetCondition,
  ObligationStatus,
  Priority,
  RepairStatus,
  SeasonalTaskStatus,
  ServiceStatus,
} from "@/types";

export type Tone = "green" | "amber" | "red" | "blue" | "slate" | "teal" | "violet";

export const toneClasses: Record<Tone, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  amber: "bg-amber-50 text-amber-800 ring-amber-600/20",
  red: "bg-rose-50 text-rose-700 ring-rose-600/20",
  blue: "bg-brand-50 text-brand-700 ring-brand-600/20",
  slate: "bg-slate-100 text-slate-700 ring-slate-500/20",
  teal: "bg-teal-50 text-teal-700 ring-teal-600/20",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/20",
};

export const toneDot: Record<Tone, string> = {
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-rose-500",
  blue: "bg-brand-500",
  slate: "bg-slate-400",
  teal: "bg-teal-500",
  violet: "bg-violet-500",
};

interface LabelInfo {
  en: string;
  mr: string;
  tone: Tone;
}

export const OBLIGATION_STATUS: Record<ObligationStatus, LabelInfo> = {
  NEW: { en: "New", mr: "नवीन", tone: "slate" },
  ASSIGNED: { en: "Assigned", mr: "नियुक्त", tone: "blue" },
  IN_PROGRESS: { en: "In Progress", mr: "प्रगतीपथावर", tone: "blue" },
  WAITING: { en: "Waiting", mr: "प्रतीक्षेत", tone: "amber" },
  BLOCKED: { en: "Blocked", mr: "अडथळा", tone: "red" },
  UNDER_REVIEW: { en: "Under Review", mr: "पुनरावलोकनात", tone: "violet" },
  RETURNED: { en: "Returned", mr: "परत पाठवले", tone: "amber" },
  COMPLETED: { en: "Completed", mr: "पूर्ण", tone: "teal" },
  VERIFIED: { en: "Verified", mr: "पडताळणी झाली", tone: "green" },
  OVERDUE: { en: "Overdue", mr: "मुदतबाह्य", tone: "red" },
  CANCELLED: { en: "Cancelled", mr: "रद्द", tone: "slate" },
};

export const ASSET_CONDITION: Record<AssetCondition, LabelInfo> = {
  FUNCTIONAL: { en: "Functional", mr: "कार्यरत", tone: "green" },
  PARTIALLY_FUNCTIONAL: { en: "Partially Functional", mr: "अंशतः कार्यरत", tone: "amber" },
  NON_FUNCTIONAL: { en: "Non-functional", mr: "बंद", tone: "red" },
  UNDER_REPAIR: { en: "Under Repair", mr: "दुरुस्तीत", tone: "amber" },
  NOT_FOUND: { en: "Not Found", mr: "आढळले नाही", tone: "slate" },
  NOT_ACCESSIBLE: { en: "Not Accessible", mr: "पोहोचता आले नाही", tone: "slate" },
  DECOMMISSIONED: { en: "Decommissioned", mr: "निष्क्रिय", tone: "slate" },
  CHECK_DUE: { en: "Check Due", mr: "तपासणी बाकी", tone: "amber" },
};

export const REPAIR_STATUS: Record<RepairStatus, LabelInfo> = {
  REPORTED: { en: "Reported", mr: "नोंदवले", tone: "amber" },
  ASSIGNED: { en: "Assigned", mr: "नियुक्त", tone: "blue" },
  INSPECTED: { en: "Inspected", mr: "तपासले", tone: "blue" },
  REPAIR_IN_PROGRESS: { en: "Repair In Progress", mr: "दुरुस्ती सुरू", tone: "blue" },
  REPAIR_CLAIMED_COMPLETE: { en: "Repair Claimed Complete", mr: "दुरुस्ती पूर्ण (दावा)", tone: "violet" },
  VERIFICATION_PENDING: { en: "Verification Pending", mr: "पडताळणी बाकी", tone: "violet" },
  VERIFIED: { en: "Verified", mr: "पडताळणी झाली", tone: "green" },
  CLOSED: { en: "Closed", mr: "बंद केले", tone: "green" },
};

export const PRIORITY: Record<Priority, LabelInfo> = {
  LOW: { en: "Low", mr: "कमी", tone: "slate" },
  MEDIUM: { en: "Medium", mr: "मध्यम", tone: "blue" },
  HIGH: { en: "High", mr: "उच्च", tone: "amber" },
  CRITICAL: { en: "Critical", mr: "अत्यावश्यक", tone: "red" },
};

export const SEASONAL_STATUS: Record<SeasonalTaskStatus, LabelInfo> = {
  PENDING: { en: "Pending", mr: "प्रलंबित", tone: "slate" },
  IN_PROGRESS: { en: "In Progress", mr: "प्रगतीपथावर", tone: "blue" },
  DONE: { en: "Done", mr: "पूर्ण", tone: "green" },
  OVERDUE: { en: "Overdue", mr: "मुदतबाह्य", tone: "red" },
};

export const SERVICE_STATUS: Record<ServiceStatus, LabelInfo> = {
  RECEIVED: { en: "Received", mr: "प्राप्त", tone: "blue" },
  IN_PROGRESS: { en: "In Progress", mr: "प्रगतीपथावर", tone: "blue" },
  PENDING_DOCS: { en: "Pending Docs", mr: "कागदपत्रे बाकी", tone: "amber" },
  COMPLETED: { en: "Completed", mr: "पूर्ण", tone: "green" },
  REJECTED: { en: "Rejected", mr: "नाकारले", tone: "red" },
};

export const CYCLE_LABEL: Record<string, LabelInfo> = {
  PRE_SUMMER: { en: "Pre-Summer", mr: "उन्हाळापूर्व", tone: "amber" },
  PRE_MONSOON: { en: "Pre-Monsoon", mr: "पावसाळापूर्व", tone: "teal" },
  MONSOON: { en: "Monsoon", mr: "पावसाळा", tone: "blue" },
  POST_MONSOON: { en: "Post-Monsoon", mr: "पावसाळ्यानंतर", tone: "slate" },
  SANITATION_DRIVE: { en: "Sanitation Drive", mr: "स्वच्छता मोहीम", tone: "green" },
  SCHOOL_REOPENING: { en: "School Reopening", mr: "शाळा पुन्हा सुरू", tone: "violet" },
  FESTIVAL_SANITATION: { en: "Festival Sanitation", mr: "सण स्वच्छता", tone: "amber" },
  PLANTATION_MAINTENANCE: { en: "Plantation Maintenance", mr: "वृक्ष देखभाल", tone: "green" },
};

export type RagStatus = "GREEN" | "AMBER" | "RED";
export const ragTone: Record<RagStatus, Tone> = { GREEN: "green", AMBER: "amber", RED: "red" };
export const ragLabel: Record<RagStatus, LabelInfo> = {
  GREEN: { en: "On Track", mr: "सुस्थितीत", tone: "green" },
  AMBER: { en: "Attention", mr: "लक्ष द्या", tone: "amber" },
  RED: { en: "Critical", mr: "गंभीर", tone: "red" },
};
