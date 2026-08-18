import { User } from "@/types";

// Demo password for all accounts: demo123
// Neutral demo names only — no real person is associated with any mock
// operational problem (overdue work, broken assets, backlog, etc.).
const PW = "demo123";

export const USERS: User[] = [
  { id: "u-citizen", name: "Demo Citizen", email: "citizen@demo.local", password: PW, role: "citizen", districtId: "d-yvt", blockId: "b-yavatmal", gpId: "gp-borgaon", phone: "+91 90000 00001", avatarColor: "#3366ad" },
  { id: "u-gsmember", name: "Demo Gram Sabha Member", email: "gramsabha@demo.local", password: PW, role: "gram_sabha_member", districtId: "d-yvt", blockId: "b-yavatmal", gpId: "gp-borgaon", avatarColor: "#0f7d73" },
  { id: "u-volunteer", name: "Demo Volunteer", email: "volunteer@demo.local", password: PW, role: "volunteer", districtId: "d-yvt", blockId: "b-yavatmal", gpId: "gp-lohara", avatarColor: "#ea580c" },
  { id: "u-shg", name: "Demo SHG Representative", email: "shg@demo.local", password: PW, role: "shg_rep", districtId: "d-yvt", blockId: "b-yavatmal", gpId: "gp-lohara", avatarColor: "#9333ea" },
  { id: "u-vwsc", name: "Demo VWSC Member", email: "vwsc@demo.local", password: PW, role: "vwsc_member", districtId: "d-yvt", blockId: "b-yavatmal", gpId: "gp-borgaon", avatarColor: "#199e8f" },
  { id: "u-gpmember", name: "Demo GP Member", email: "gpmember@demo.local", password: PW, role: "gp_member", districtId: "d-yvt", blockId: "b-yavatmal", gpId: "gp-borgaon", avatarColor: "#1f4e8f" },
  { id: "u-upsarpanch", name: "Demo Up-Sarpanch", email: "upsarpanch@demo.local", password: PW, role: "up_sarpanch", districtId: "d-yvt", blockId: "b-yavatmal", gpId: "gp-borgaon", avatarColor: "#b45309" },
  { id: "u-sarpanch", name: "Demo Sarpanch", email: "sarpanch@demo.local", password: PW, role: "sarpanch", districtId: "d-yvt", blockId: "b-yavatmal", gpId: "gp-borgaon", avatarColor: "#1a3f73" },
  { id: "u-gpstaff", name: "Demo GP Staff", email: "gpstaff@demo.local", password: PW, role: "gp_staff", districtId: "d-yvt", blockId: "b-yavatmal", gpId: "gp-borgaon", avatarColor: "#0891b2" },
  { id: "u-gramsevak", name: "Demo Gram Sevak", email: "gramsevak@demo.local", password: PW, role: "gram_sevak", districtId: "d-yvt", blockId: "b-yavatmal", gpId: "gp-borgaon", phone: "+91 90000 00010", avatarColor: "#1f4e8f", transferState: "active" },
  { id: "u-gramsevak2", name: "Demo Gram Sevak (B)", email: "gramsevak2@demo.local", password: PW, role: "gram_sevak", districtId: "d-yvt", blockId: "b-yavatmal", gpId: "gp-lohara", avatarColor: "#155e75", transferState: "active" },
  { id: "u-je", name: "Demo Junior Engineer", email: "je@demo.local", password: PW, role: "je", districtId: "d-yvt", blockId: "b-yavatmal", departmentId: "dept-engineering", avatarColor: "#c2410c" },
  { id: "u-extension", name: "Demo Extension Officer", email: "extension@demo.local", password: PW, role: "extension_officer", districtId: "d-yvt", blockId: "b-yavatmal", assignedGpIds: ["gp-borgaon", "gp-lohara", "gp-waghapur", "gp-pimpalgaon", "gp-sawargaon"], avatarColor: "#0f7d73" },
  { id: "u-abdo", name: "Demo Assistant BDO", email: "abdo@demo.local", password: PW, role: "abdo", districtId: "d-yvt", blockId: "b-yavatmal", avatarColor: "#1a3f73" },
  { id: "u-psmember", name: "Demo Panchayat Samiti Member", email: "psmember@demo.local", password: PW, role: "ps_member", districtId: "d-yvt", blockId: "b-yavatmal", avatarColor: "#7c3aed" },
  { id: "u-upsabhapati", name: "Demo Up-Sabhapati", email: "upsabhapati@demo.local", password: PW, role: "up_sabhapati", districtId: "d-yvt", blockId: "b-yavatmal", avatarColor: "#a16207" },
  { id: "u-sabhapati", name: "Demo Sabhapati", email: "sabhapati@demo.local", password: PW, role: "sabhapati", districtId: "d-yvt", blockId: "b-yavatmal", avatarColor: "#1e40af" },
  { id: "u-bdo", name: "Demo BDO", email: "bdo@demo.local", password: PW, role: "bdo", districtId: "d-yvt", blockId: "b-yavatmal", avatarColor: "#173458" },
  { id: "u-blockdept", name: "Demo Block Dept Officer", email: "blockdept@demo.local", password: PW, role: "block_dept_officer", districtId: "d-yvt", blockId: "b-yavatmal", departmentId: "dept-water", avatarColor: "#0e7490" },
  { id: "u-dyceo", name: "Demo Deputy CEO (Panchayat)", email: "dyceo@demo.local", password: PW, role: "dyceo_panchayat", districtId: "d-yvt", avatarColor: "#132a45" },
  { id: "u-dyceodept", name: "Demo Deputy CEO (Department)", email: "dyceodept@demo.local", password: PW, role: "dyceo_dept_head", districtId: "d-yvt", departmentId: "dept-water", avatarColor: "#134f4b" },
  { id: "u-addceo", name: "Demo Additional CEO", email: "additionalceo@demo.local", password: PW, role: "additional_ceo", districtId: "d-yvt", avatarColor: "#1e3a8a" },
  { id: "u-zpmember", name: "Demo ZP Member", email: "zpmember@demo.local", password: PW, role: "zp_member", districtId: "d-yvt", avatarColor: "#6d28d9" },
  { id: "u-zpvp", name: "Demo ZP Vice-President", email: "zpvp@demo.local", password: PW, role: "zp_vice_president", districtId: "d-yvt", avatarColor: "#5b21b6" },
  { id: "u-zppresident", name: "Demo ZP President", email: "zppresident@demo.local", password: PW, role: "zp_president", districtId: "d-yvt", avatarColor: "#1e3a8a" },
  { id: "u-ceo", name: "Demo CEO", email: "ceo@demo.local", password: PW, role: "ceo", districtId: "d-yvt", avatarColor: "#132a45" },
  { id: "u-admin", name: "Demo System Administrator", email: "admin@demo.local", password: PW, role: "sysadmin", avatarColor: "#334155" },
];

/** Immutable seed users. Authentication reads from the editable `state.users`
 *  (initialised from these); RESET DEMO restores state.users from this array. */
export const SEED_USERS = USERS;

export const userById = (id?: string) => USERS.find((u) => u.id === id);
