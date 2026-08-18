# Access Matrix — All 26 Roles

Generated from `src/data/roles.ts` + `src/permissions/capabilities.ts`.
Regenerate with `node scripts/gen-access-matrix.mjs`. Validated by `npm run test:access`.

> Demo-level role-based access simulation with centralized permission enforcement.
> RESTRICTED-classified records (personnel-sensitive, beneficiary personal data,
> confidential audit material) are never exposed to public roles and never rendered
> on public pages.

| Role | Scope | Dashboard | Can View | Create | Review | Verify | Escalate | Admin | Data Access | Operational Mutation Rights |
|---|---|---|---|:--:|:--:|:--:|:--:|:--:|---|---|
| Public Citizen | public | citizen | Public | — | — | — | — | — | PUBLIC | submit participation, submit complaint |
| Gram Sabha Member | public | gram_sabha_member | Public | — | — | — | — | — | PUBLIC | — (read/oversight only) |
| Volunteer / Shramdaan | public | volunteer | Public | — | — | — | — | — | PUBLIC | submit participation |
| SHG / Community Group Rep | public | shg_rep | Public | — | — | — | — | — | PUBLIC | submit institution activity, submit participation |
| Village Committee / VWSC Member | gp | vwsc | GP | ✓ | — | — | — | — | PUBLIC + INTERNAL (no RESTRICTED) | report asset condition, create repair ticket, submit seasonal check, submit institution activity, submit participation, submit complaint |
| Gram Panchayat Member | gp | gp_member | GP | — | — | — | — | — | PUBLIC + INTERNAL (no RESTRICTED) | — (read/oversight only) |
| Up-Sarpanch | gp | up_sarpanch | GP | — | ✓ | — | ✓ | — | PUBLIC + INTERNAL (no RESTRICTED) | — (read/oversight only) |
| Sarpanch | gp | sarpanch | GP | — | ✓ | — | ✓ | — | PUBLIC + INTERNAL (no RESTRICTED) | — (read/oversight only) |
| Gram Panchayat Staff | gp | gp_staff | GP | ✓ | — | — | — | — | PUBLIC + INTERNAL (no RESTRICTED) | report asset condition, submit seasonal check, submit participation, submit complaint |
| Gram Sevak / VDO | gp | gram_sevak | GP | ✓ | ✓ | ✓ | ✓ | — | PUBLIC + INTERNAL (no RESTRICTED) | create obligation, update own obligation, report asset condition, create repair ticket, assign repair, verify repair, submit seasonal check, submit participation, complete participation activity, create from template, manage file flow, resolve complaint, submit complaint |
| Junior Engineer / Technical | block | je | Block | — | — | — | — | — | PUBLIC + INTERNAL (no RESTRICTED) | report asset condition, update repair, claim repair complete |
| Extension Officer – GP | block | extension_officer | Block | — | ✓ | ✓ | ✓ | — | PUBLIC + INTERNAL (no RESTRICTED) | verify repair, resolve complaint |
| Assistant BDO | block | abdo | Block | — | ✓ | ✓ | ✓ | — | PUBLIC + INTERNAL (no RESTRICTED) | verify repair, resolve complaint |
| Panchayat Samiti Member | block | ps_member | Block | — | — | — | — | — | PUBLIC + INTERNAL (no RESTRICTED) | — (read/oversight only) |
| Up-Sabhapati | block | up_sabhapati | Block | — | — | — | — | — | PUBLIC + INTERNAL (no RESTRICTED) | — (read/oversight only) |
| Sabhapati | block | sabhapati | Block | — | — | — | — | — | PUBLIC + INTERNAL (no RESTRICTED) | — (read/oversight only) |
| Block Development Officer | block | bdo | Block | ✓ | ✓ | ✓ | ✓ | — | PUBLIC + INTERNAL (no RESTRICTED) | assign repair, verify repair, manage file flow, resolve complaint |
| Block Department Officer | block | block_dept_officer | Block | — | ✓ | ✓ | ✓ | — | PUBLIC + INTERNAL (no RESTRICTED) | verify repair, resolve complaint |
| Deputy CEO – Panchayat | district | dyceo_panchayat | District | — | ✓ | — | ✓ | — | PUBLIC + INTERNAL (no RESTRICTED) | — (read/oversight only) |
| Deputy CEO / Dept Head | district | dyceo_dept_head | District | — | ✓ | — | ✓ | — | PUBLIC + INTERNAL (no RESTRICTED) | — (read/oversight only) |
| Additional CEO | district | additional_ceo | District | — | ✓ | — | ✓ | — | PUBLIC + INTERNAL (no RESTRICTED) | — (read/oversight only) |
| Zilla Parishad Member | district | zp_member | District | — | — | — | — | — | PUBLIC + INTERNAL (no RESTRICTED) | — (read/oversight only) |
| ZP Vice-President | district | zp_vice_president | District | — | — | — | — | — | PUBLIC + INTERNAL (no RESTRICTED) | — (read/oversight only) |
| ZP President | district | zp_president | District | — | — | — | — | — | PUBLIC + INTERNAL (no RESTRICTED) | — (read/oversight only) |
| Chief Executive Officer – ZP | district | ceo | District | — | — | — | — | — | PUBLIC + INTERNAL (no RESTRICTED) | — (read/oversight only) |
| System Administrator | system | sysadmin | Config | — | — | — | — | ✓ | Config + audit (no RESTRICTED) | — (read/oversight only) |

## Notes
- **Visibility ≠ edit rights.** Higher roles can view aggregated lower-level data but cannot rewrite original GP evidence.
- **CEO** is strategic/read: no create, verify or admin capability.
- **System Administrator** manages users/config and views audit, but has no VERIFY capability — it cannot silently alter a verified operational outcome.
- **Verification separation:** a user who claims a high-priority repair cannot verify their own closure (enforced in the repair workflow).
