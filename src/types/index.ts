// ============================================================================
// Yavatmal Unified Panchayat Operations Platform — Core Domain Types
// Working demonstration prototype. Not an official Government system.
// ============================================================================

// ---------------------------------------------------------------------------
// Roles & Permissions
// ---------------------------------------------------------------------------

export type RoleId =
  | "citizen"
  | "gram_sabha_member"
  | "volunteer"
  | "shg_rep"
  | "vwsc_member"
  | "gp_member"
  | "up_sarpanch"
  | "sarpanch"
  | "gp_staff"
  | "gram_sevak"
  | "je"
  | "extension_officer"
  | "abdo"
  | "ps_member"
  | "up_sabhapati"
  | "sabhapati"
  | "bdo"
  | "block_dept_officer"
  | "dyceo_panchayat"
  | "dyceo_dept_head"
  | "additional_ceo"
  | "zp_member"
  | "zp_vice_president"
  | "zp_president"
  | "ceo"
  | "sysadmin";

export type ScopeLevel = "public" | "gp" | "block" | "district" | "system";

export type PermissionType =
  | "VIEW"
  | "CREATE"
  | "EDIT"
  | "SUBMIT"
  | "REVIEW"
  | "RETURN"
  | "VERIFY"
  | "ESCALATE"
  | "CLOSE"
  | "ASSIGN"
  | "EXPORT"
  | "ADMIN";

export type DataClassification = "PUBLIC" | "INTERNAL" | "RESTRICTED";

export interface RoleDefinition {
  id: RoleId;
  name: string;
  nameMr: string;
  group:
    | "public"
    | "gp_elected"
    | "gp_ops"
    | "block"
    | "district"
    | "system";
  scope: ScopeLevel;
  permissions: PermissionType[];
  description: string;
  /** Preferred device experience for this role. */
  device: "mobile" | "desktop" | "both";
  /** Dashboard component key */
  dashboard: string;
}

// ---------------------------------------------------------------------------
// Hierarchy
// ---------------------------------------------------------------------------

export interface District {
  id: string;
  name: string;
  nameMr: string;
  state: string;
}

export interface Block {
  id: string;
  districtId: string;
  name: string;
  nameMr: string;
  isPilot?: boolean;
  /** Illustrative only — NOT an official block GP count. Use demoGpsLoaded() for UI. */
  demoIllustrativeGpCount: number;
}

export interface GramPanchayat {
  id: string;
  blockId: string;
  districtId: string;
  name: string;
  nameMr: string;
  population: number;
  isPilot?: boolean;
}

export interface Department {
  id: string;
  name: string;
  nameMr: string;
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // demo only
  role: RoleId;
  districtId?: string;
  blockId?: string;
  gpId?: string;
  assignedGpIds?: string[]; // extension officers etc.
  departmentId?: string;
  phone?: string;
  avatarColor?: string;
  status?: "active" | "disabled";
  transferState?: "active" | "transferred" | "on_leave";
}

// ---------------------------------------------------------------------------
// Source references (Government systems remain source of truth)
// ---------------------------------------------------------------------------

export type SourceSystem =
  | "eGramSwaraj"
  | "AuditOnline"
  | "SAMARTH"
  | "Aaple Sarkar"
  | "Gram Manchitra"
  | "Panchayat NIRNAY"
  | "JJM"
  | "ZPFMS"
  | "Government GR"
  | "Internal Order";

export interface SourceReference {
  system: SourceSystem;
  referenceId?: string;
  documentName?: string;
  date?: string;
}

// ---------------------------------------------------------------------------
// PATHPURAVA — Obligations
// ---------------------------------------------------------------------------

export type ObligationSourceType =
  | "Government Resolution"
  | "Circular"
  | "Department Order"
  | "Meeting Decision"
  | "Gram Sabha Resolution"
  | "Audit Para"
  | "Utilisation Certificate Deadline"
  | "Scheme Deadline"
  | "Court Direction"
  | "Seasonal Duty"
  | "Cross-department Commitment"
  | "Internal Review Decision";

export type ObligationStatus =
  | "NEW"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "WAITING"
  | "BLOCKED"
  | "UNDER_REVIEW"
  | "RETURNED"
  | "COMPLETED"
  | "VERIFIED"
  | "OVERDUE"
  | "CANCELLED";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type BlockerCategory =
  | "Technical Sanction Pending"
  | "Fund Release Pending"
  | "Other Department Pending"
  | "Gram Sabha Required"
  | "Material Pending"
  | "Contractor Delay"
  | "Staff Vacancy"
  | "Document Pending"
  | "Field Verification Pending"
  | "Citizen Document Pending"
  | "Procurement Pending"
  | "Other";

export interface Blocker {
  id: string;
  category: BlockerCategory;
  note: string;
  raisedBy: string;
  raisedOn: string;
  resolved?: boolean;
  resolvedOn?: string;
}

export interface Evidence {
  id: string;
  name: string;
  type: "photo" | "document" | "note";
  uploadedBy: string;
  uploadedOn: string;
  note?: string;
  /** Small images are persisted as a data URL (demo browser only). */
  dataUrl?: string;
  size?: number;
  mimeType?: string;
  storageMode?: "LOCAL_DEMO" | "METADATA_ONLY";
}

export interface TimelineEvent {
  id: string;
  ts: string;
  actor: string;
  actorRole: RoleId;
  action: string;
  fromStatus?: string;
  toStatus?: string;
  comment?: string;
}

export interface Obligation {
  id: string;
  title: string;
  titleMr?: string;
  description: string;
  sourceType: ObligationSourceType;
  source: SourceReference;
  scope: ScopeLevel;
  districtId: string;
  blockId?: string;
  gpId?: string;
  departmentId?: string;
  responsibleRole: RoleId;
  assignedUserId?: string;
  createdOn: string;
  dueDate: string;
  priority: Priority;
  status: ObligationStatus;
  blockers: Blocker[];
  dependencyIds?: string[];
  lastActivity: string;
  evidence: Evidence[];
  reviewStatus?: "pending" | "approved" | "returned";
  escalationLevel: number; // 0 gp, 1 block, 2 district
  completionDate?: string;
  classification: DataClassification;
  publishedPublic?: boolean;
  timeline: TimelineEvent[];
}

// ---------------------------------------------------------------------------
// NIGAA — Assets
// ---------------------------------------------------------------------------

export type AssetType =
  | "Hand Pump"
  | "Borewell"
  | "Water Tank"
  | "Pipeline"
  | "Public Toilet"
  | "Waste Facility"
  | "Drainage Asset"
  | "Streetlight"
  | "Plantation Site"
  | "School Facility"
  | "Other";

export type AssetCondition =
  | "FUNCTIONAL"
  | "PARTIALLY_FUNCTIONAL"
  | "NON_FUNCTIONAL"
  | "UNDER_REPAIR"
  | "NOT_FOUND"
  | "NOT_ACCESSIBLE"
  | "DECOMMISSIONED"
  | "CHECK_DUE";

export interface AssetInspection {
  id: string;
  ts: string;
  by: string;
  byRole: RoleId;
  condition: AssetCondition;
  note?: string;
  photo?: string;
  issueCategory?: string;
}

export interface Asset {
  id: string;
  code: string; // e.g. HP-018 (for QR)
  name: string;
  type: AssetType;
  govAssetRef?: string;
  sourceSystem?: SourceSystem;
  districtId: string;
  blockId: string;
  gpId: string;
  condition: AssetCondition;
  lastChecked?: string;
  checkedBy?: string;
  nextCheck?: string;
  gps?: { lat: number; lng: number };
  issue?: string;
  repairRequired?: boolean;
  repairOwnerRole?: RoleId;
  targetResolution?: string;
  repeatedFailureCount: number;
  classification: DataClassification;
  publishedPublic?: boolean;
  inspections: AssetInspection[];
  // For plantation
  plantedCount?: number;
  survivingCount?: number;
  lastSurvivalCheck?: string;
}

export type RepairStatus =
  | "REPORTED"
  | "ASSIGNED"
  | "INSPECTED"
  | "REPAIR_IN_PROGRESS"
  | "REPAIR_CLAIMED_COMPLETE"
  | "VERIFICATION_PENDING"
  | "VERIFIED"
  | "CLOSED";

export interface RepairTicket {
  id: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  districtId: string;
  blockId: string;
  gpId: string;
  reportedBy: string;
  reportedOn: string;
  issue: string;
  priority: Priority;
  status: RepairStatus;
  assignedToRole?: RoleId;
  assignedToUserId?: string;
  claimedCompleteBy?: string;
  verifiedBy?: string;
  closedOn?: string;
  ageDays?: number;
  timeline: TimelineEvent[];
}

// ---------------------------------------------------------------------------
// Seasonal Readiness
// ---------------------------------------------------------------------------

export type SeasonCycle =
  | "PRE_SUMMER"
  | "PRE_MONSOON"
  | "MONSOON"
  | "POST_MONSOON"
  | "SANITATION_DRIVE"
  | "SCHOOL_REOPENING"
  | "FESTIVAL_SANITATION"
  | "PLANTATION_MAINTENANCE";

export type SeasonalTaskStatus = "PENDING" | "IN_PROGRESS" | "DONE" | "OVERDUE";

export interface SeasonalTask {
  id: string;
  cycle: SeasonCycle;
  title: string;
  titleMr?: string;
  districtId: string;
  blockId: string;
  gpId: string;
  assignedRole: RoleId;
  dueDate: string;
  status: SeasonalTaskStatus;
  evidence?: Evidence[];
  completedOn?: string;
}

// ---------------------------------------------------------------------------
// Seva Ghadyal — Service applications
// ---------------------------------------------------------------------------

export type ServiceStatus =
  | "RECEIVED"
  | "IN_PROGRESS"
  | "PENDING_DOCS"
  | "COMPLETED"
  | "REJECTED";

export interface ServiceApplication {
  id: string;
  service: string;
  serviceMr?: string;
  citizenName: string; // internal demo only
  districtId: string;
  blockId: string;
  gpId: string;
  receivedDate: string;
  expectedDate: string;
  stage: string;
  responsibleDesk: string;
  status: ServiceStatus;
  daysElapsed: number;
  overdue: boolean;
  classification: DataClassification;
}

// ---------------------------------------------------------------------------
// Gram Sabha
// ---------------------------------------------------------------------------

export interface GramSabhaDecision {
  id: string;
  meetingId: string;
  decision: string;
  decisionMr?: string;
  date: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  department?: string;
  dueDate?: string;
  completedDate?: string;
  actionTaken?: string;
  classification: DataClassification;
  publishedPublic?: boolean;
}

export interface GramSabhaMeeting {
  id: string;
  districtId: string;
  blockId: string;
  gpId: string;
  type: "upcoming" | "previous";
  date: string;
  noticeDate: string;
  attendance: number;
  quorumRequired: number;
  quorumMet: boolean;
  departmentsInvited: string[];
  departmentsAttended: string[];
  decisions: string[]; // decision ids
}

// ---------------------------------------------------------------------------
// Village Institutions
// ---------------------------------------------------------------------------

export type InstitutionCategory =
  | "VWSC"
  | "SHG"
  | "Village Organisation"
  | "School Management Committee"
  | "Health/Sanitation Committee"
  | "Youth Group"
  | "Farmer Group";

export interface VillageInstitution {
  id: string;
  name: string;
  category: InstitutionCategory;
  districtId: string;
  blockId: string;
  gpId: string;
  chairContact: string;
  responsibility: string;
  lastMeeting?: string;
  nextMeeting?: string;
  assignedObligationIds?: string[];
  status: "active" | "attention";
  // performance based on actual assigned activity
  assignedTasks: number;
  completedTasks: number;
}

// ---------------------------------------------------------------------------
// Participation / Shramdaan
// ---------------------------------------------------------------------------

export type ContributionType =
  | "Labour"
  | "Skill"
  | "Material"
  | "Equipment"
  | "Service"
  | "Non-cash Support";

export interface Volunteer {
  id: string;
  userId?: string;
  name: string;
  skills: string[];
  totalHours: number;
  activitiesJoined: string[];
}

export interface ParticipationActivity {
  id: string;
  title: string;
  titleMr?: string;
  districtId: string;
  blockId: string;
  gpId: string;
  date: string;
  status: "OPEN" | "IN_PROGRESS" | "COMPLETED";
  needsVolunteers: number;
  registeredVolunteers: string[]; // volunteer ids / names
  needs: string[];
  contributionTypes: ContributionType[];
  verifiedHours?: number;
  impact?: string;
  evidence?: Evidence[];
  classification: DataClassification;
  publishedPublic?: boolean;
}

// ---------------------------------------------------------------------------
// Innovation
// ---------------------------------------------------------------------------

export interface InnovationEntry {
  id: string;
  title: string;
  problem: string;
  solution: string;
  steps: string[];
  responsibleRoles: RoleId[];
  timeframe: string;
  resources: string;
  ruleReference?: string;
  obstacles?: string;
  outcome: string;
  replicationChecklist: string[];
}

export interface InnovationChallenge {
  id: string;
  title: string;
  question: string;
  status: "OPEN" | "REVIEW" | "PILOT" | "COMPLETED";
  createdBy: string;
  submissions: {
    id: string;
    title: string;
    problem: string;
    solution: string;
    expectedResult: string;
    by: string;
    stage: "submitted" | "shortlisted" | "selected" | "pilot" | "completed";
  }[];
}

// ---------------------------------------------------------------------------
// Handover
// ---------------------------------------------------------------------------

export interface Handover {
  id: string;
  outgoingUserId: string;
  outgoingName: string;
  incomingUserId?: string;
  incomingName?: string;
  gpId: string;
  blockId: string;
  districtId: string;
  reason: "transferred" | "long_leave" | "reassigned";
  status?: "AWAITING_ACCEPTANCE" | "ACCEPTED" | "COMPLETED";
  generatedOn: string;
  openObligations: number;
  overdueMatters: number;
  activeBlockers: number;
  pendingAudit: number;
  pendingUC: number;
  seasonalResponsibilities: number;
  keyDecisions: string[];
  keyContacts: string[];
  nextDeadlines: string[];
  accepted?: boolean;
  acceptedOn?: string;
  remarks?: string;
}

// ---------------------------------------------------------------------------
// Notifications & Audit
// ---------------------------------------------------------------------------

export type NotificationType =
  | "task_assigned"
  | "deadline_approaching"
  | "overdue"
  | "blocker_escalated"
  | "evidence_submitted"
  | "review_requested"
  | "repair_assigned"
  | "repair_verified"
  | "seasonal_task_due"
  | "handover_generated"
  | "gramsabha_decision"
  | "innovation_challenge"
  | "volunteer_activity";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  ts: string;
  read: boolean;
  forRoles: RoleId[];
  forUserId?: string;
  blockId?: string;
  gpId?: string;
  link?: string;
  smsPreview?: string;
}

export interface AuditLog {
  id: string;
  ts: string;
  actor: string;
  actorRole: RoleId;
  action: string;
  entity: string;
  entityId: string;
  fromStatus?: string;
  toStatus?: string;
  comment?: string;
}

// ---------------------------------------------------------------------------
// UC follow-up
// ---------------------------------------------------------------------------

export interface UCFollowUp {
  id: string;
  ucRef: string;
  scheme: string;
  gpId: string;
  blockId: string;
  districtId: string;
  departmentId?: string;
  visibilityScope?: "DEPARTMENT" | "CROSS_DEPARTMENT" | "DISTRICT_SHARED" | "PUBLIC";
  amountRef: string;
  dueDate: string;
  responsibleRole: RoleId;
  status: "PENDING" | "IN_PROGRESS" | "BLOCKED" | "SUBMITTED";
  blocker?: string;
  sourceSystem: SourceSystem;
}

// ---------------------------------------------------------------------------
// Convergence
// ---------------------------------------------------------------------------

export interface ConvergenceProject {
  id: string;
  title: string;
  gpId: string;
  blockId: string;
  districtId: string;
  steps: {
    order: number;
    label: string;
    status: "DONE" | "IN_PROGRESS" | "WAITING" | "PENDING";
    waitingOn?: string;
    since?: string;
  }[];
  fundSources: { name: string; ref: string }[];
}

// ---------------------------------------------------------------------------
// Operational metrics & baseline snapshot
// ---------------------------------------------------------------------------

export interface OperationalMetrics {
  activeObligations: number;
  overdueObligations: number;
  blockedObligations: number;
  completionPct: number;
  totalAssets: number;
  functionalAssets: number;
  nonFunctionalAssets: number;
  assetFunctionalityPct: number;
  openRepairs: number;
  overdueRepairs: number;
  repairMedianAge: number;
  readinessPct: number;
  participation: number;
  systemicBlockerCount: number;
}

// ---------------------------------------------------------------------------
// GP File Flow
// ---------------------------------------------------------------------------

export type FileFlowStatus =
  | "RECEIVED"
  | "UNDER_PROCESS"
  | "WAITING"
  | "FORWARD_PENDING"
  | "RETURNED"
  | "COMPLETED";

export interface GpFile {
  id: string;
  title: string;
  titleMr?: string;
  source: string;
  districtId: string;
  blockId: string;
  gpId: string;
  receivedDate: string;
  currentDesk: string;
  currentHolder: string;
  pendingSince: string;
  nextAction: string;
  dueDate: string;
  status: FileFlowStatus;
  blocker?: string;
  linkedObligationId?: string;
  govReference?: string;
}

// ---------------------------------------------------------------------------
// Complaint Routing
// ---------------------------------------------------------------------------

export type ComplaintStatus =
  | "RECEIVED"
  | "CLASSIFIED"
  | "ROUTED"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

export type ComplaintAuthority =
  | "Gram Panchayat"
  | "Engineering"
  | "Water & Sanitation"
  | "Sanitation"
  | "MGNREGA"
  | "Other ZP Department"
  | "External Department";

export interface Complaint {
  id: string;
  category: string;
  description: string;
  districtId: string;
  blockId: string;
  gpId: string;
  citizenName: string;
  suggestedAuthority: ComplaintAuthority;
  isExternal: boolean;
  status: ComplaintStatus;
  createdOn: string;
  timeline: TimelineEvent[];
}

// ---------------------------------------------------------------------------
// Mahsul Sandhi — SAMARTH adoption
// ---------------------------------------------------------------------------

export type AdoptionState = "NOT_STARTED" | "IN_PROGRESS" | "ACTIVE" | "NEEDS_SUPPORT";

export interface AdoptionChecklistItem {
  key: string;
  label: string;
  labelMr: string;
  state: AdoptionState;
}

export interface AdoptionRecord {
  id: string;
  gpId: string;
  blockId: string;
  districtId: string;
  items: AdoptionChecklistItem[];
}

// ---------------------------------------------------------------------------
// Process Improvement Lab
// ---------------------------------------------------------------------------

export interface ProcessExperiment {
  id: string;
  experiment: string;
  problem: string;
  baselineMetric: string;
  baselineValue: number;
  intervention: string;
  startDate: string;
  endDate?: string;
  currentValue: number;
  unit: string;
  owner: string;
  ownerRole: RoleId;
  status: "PLANNED" | "RUNNING" | "COMPLETED";
  evidence?: string;
  metricSource?: "MANUAL" | "LIVE";
  liveMetricKey?: string;
}

// ---------------------------------------------------------------------------
// Root demo state
// ---------------------------------------------------------------------------

export interface OfflineMutation {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  createdAt: string;
  userId: string;
  status: "SYNC_PENDING" | "LOCAL_APPLIED" | "SYNCED_DEMO" | "FAILED";
}

export interface DemoState {
  version: number;
  baseline?: OperationalMetrics;
  gpFiles?: GpFile[];
  complaints?: Complaint[];
  adoption?: AdoptionRecord[];
  experiments?: ProcessExperiment[];
  offlineQueue?: OfflineMutation[];
  obligations: Obligation[];
  assets: Asset[];
  repairs: RepairTicket[];
  seasonalTasks: SeasonalTask[];
  services: ServiceApplication[];
  gramSabhaMeetings: GramSabhaMeeting[];
  gramSabhaDecisions: GramSabhaDecision[];
  institutions: VillageInstitution[];
  volunteers: Volunteer[];
  activities: ParticipationActivity[];
  innovations: InnovationEntry[];
  challenges: InnovationChallenge[];
  handovers: Handover[];
  notifications: AppNotification[];
  auditLogs: AuditLog[];
  ucFollowUps: UCFollowUp[];
  convergence: ConvergenceProject[];
  users: User[];
}
