"use client";

import { RoleId } from "@/types";
import { useAuth } from "@/services/store";
import {
  CitizenDashboard,
  GramSabhaMemberDashboard,
  VolunteerDashboard,
  ShgDashboard,
  VwscDashboard,
  GpStaffDashboard,
  GramSevakDashboard,
  JeDashboard,
} from "./field";
import { GpMemberDashboard, UpSarpanchDashboard, SarpanchDashboard } from "./gp";
import {
  BdoDashboard,
  ExtensionOfficerDashboard,
  AbdoDashboard,
  BlockDeptOfficerDashboard,
  BlockElectedDashboard,
} from "./block";
import {
  DyCeoPanchayatDashboard,
  DyCeoDeptHeadDashboard,
  AdditionalCeoDashboard,
  CeoDashboard,
  ZpElectedDashboard,
} from "./district";
import { SysadminDashboard } from "./system";

const REGISTRY: Record<RoleId, React.ComponentType> = {
  citizen: CitizenDashboard,
  gram_sabha_member: GramSabhaMemberDashboard,
  volunteer: VolunteerDashboard,
  shg_rep: ShgDashboard,
  vwsc_member: VwscDashboard,
  gp_member: GpMemberDashboard,
  up_sarpanch: UpSarpanchDashboard,
  sarpanch: SarpanchDashboard,
  gp_staff: GpStaffDashboard,
  gram_sevak: GramSevakDashboard,
  je: JeDashboard,
  extension_officer: ExtensionOfficerDashboard,
  abdo: AbdoDashboard,
  ps_member: () => <BlockElectedDashboard title="Panchayat Samiti Member" />,
  up_sabhapati: () => <BlockElectedDashboard title="Up-Sabhapati" />,
  sabhapati: () => <BlockElectedDashboard title="Sabhapati" />,
  bdo: BdoDashboard,
  block_dept_officer: BlockDeptOfficerDashboard,
  dyceo_panchayat: DyCeoPanchayatDashboard,
  dyceo_dept_head: DyCeoDeptHeadDashboard,
  additional_ceo: AdditionalCeoDashboard,
  zp_member: () => <ZpElectedDashboard title="Zilla Parishad Member" />,
  zp_vice_president: () => <ZpElectedDashboard title="ZP Vice-President" />,
  zp_president: () => <ZpElectedDashboard title="ZP President" />,
  ceo: CeoDashboard,
  sysadmin: SysadminDashboard,
};

export function RoleDashboard() {
  const { user } = useAuth();
  if (!user) return null;
  const Cmp = REGISTRY[user.role] ?? CitizenDashboard;
  return <Cmp />;
}
