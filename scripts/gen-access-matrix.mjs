// Generates ACCESS_MATRIX.md from the real ROLES + ROLE_CAPABILITIES source.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import ts from "typescript";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cache = new Map();
function loadTs(absPath) {
  if (cache.has(absPath)) return cache.get(absPath);
  const { outputText } = ts.transpileModule(readFileSync(absPath, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 } });
  const module = { exports: {} };
  cache.set(absPath, module.exports);
  const req = (spec) => {
    if (spec === "@/types") return {};
    let r = spec.startsWith("@/") ? path.join(ROOT, "src", spec.slice(2)) : path.join(path.dirname(absPath), spec);
    if (!r.endsWith(".ts")) r += ".ts";
    return loadTs(r);
  };
  new Function("exports", "require", "module", outputText)(module.exports, req, module);
  cache.set(absPath, module.exports);
  return module.exports;
}

const { ROLES, ROLE_LIST } = loadTs(path.join(ROOT, "src/data/roles.ts"));
const { ROLE_CAPABILITIES } = loadTs(path.join(ROOT, "src/permissions/capabilities.ts"));
const has = (r, c) => (ROLE_CAPABILITIES[r] || []).includes(c);
const yn = (b) => (b ? "✓" : "—");

const OPS = ["CREATE_OBLIGATION", "UPDATE_OWN_OBLIGATION", "REPORT_ASSET_CONDITION", "CREATE_REPAIR_TICKET", "ASSIGN_REPAIR", "UPDATE_REPAIR", "CLAIM_REPAIR_COMPLETE", "VERIFY_REPAIR", "SUBMIT_SEASONAL_CHECK", "SUBMIT_INSTITUTION_ACTIVITY", "SUBMIT_PARTICIPATION", "COMPLETE_PARTICIPATION_ACTIVITY", "CREATE_FROM_TEMPLATE", "MANAGE_FILE_FLOW", "RESOLVE_COMPLAINT", "SUBMIT_COMPLAINT"];
const rows = ROLE_LIST.map((r) => {
  const id = r.id;
  const create = has(id, "CREATE_OBLIGATION") || has(id, "CREATE_REPAIR_TICKET") || has(id, "CREATE_SERVICE_ENTRY") || has(id, "MANAGE_FILE_FLOW");
  const review = has(id, "REVIEW_OBLIGATION") || has(id, "REVIEW_SEASONAL_CHECK") || has(id, "REVIEW_INSTITUTION_ACTIVITY");
  const verify = has(id, "VERIFY_OBLIGATION") || has(id, "VERIFY_REPAIR") || has(id, "VERIFY_PARTICIPATION");
  const escalate = has(id, "ESCALATE_OBLIGATION");
  const admin = has(id, "MANAGE_USERS");
  const data = r.scope === "public" ? "PUBLIC" : r.scope === "system" ? "Config + audit (no RESTRICTED)" : "PUBLIC + INTERNAL (no RESTRICTED)";
  const view = { public: "Public", gp: "GP", block: "Block", district: "District", system: "Config" }[r.scope];
  const ops = OPS.filter((c) => has(id, c)).map((c) => c.replace(/_/g, " ").toLowerCase());
  const opsCol = ops.length ? ops.join(", ") : "— (read/oversight only)";
  return `| ${r.name} | ${r.scope} | ${r.dashboard} | ${view} | ${yn(create)} | ${yn(review)} | ${yn(verify)} | ${yn(escalate)} | ${yn(admin)} | ${data} | ${opsCol} |`;
});

const md = `# Access Matrix — All 26 Roles

Generated from \`src/data/roles.ts\` + \`src/permissions/capabilities.ts\`.
Regenerate with \`node scripts/gen-access-matrix.mjs\`. Validated by \`npm run test:access\`.

> Demo-level role-based access simulation with centralized permission enforcement.
> RESTRICTED-classified records (personnel-sensitive, beneficiary personal data,
> confidential audit material) are never exposed to public roles and never rendered
> on public pages.

| Role | Scope | Dashboard | Can View | Create | Review | Verify | Escalate | Admin | Data Access | Operational Mutation Rights |
|---|---|---|---|:--:|:--:|:--:|:--:|:--:|---|---|
${rows.join("\n")}

## Notes
- **Visibility ≠ edit rights.** Higher roles can view aggregated lower-level data but cannot rewrite original GP evidence.
- **CEO** is strategic/read: no create, verify or admin capability.
- **System Administrator** manages users/config and views audit, but has no VERIFY capability — it cannot silently alter a verified operational outcome.
- **Verification separation:** a user who claims a high-priority repair cannot verify their own closure (enforced in the repair workflow).
`;

writeFileSync(path.join(ROOT, "ACCESS_MATRIX.md"), md);
console.log("Wrote ACCESS_MATRIX.md with", rows.length, "roles.");
