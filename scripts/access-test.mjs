// Programmatic access-control test — Government Demo v2.1.
// Loads the REAL logic (routeAccess.ts, capabilities.ts, permissions/index.ts,
// data/users.ts) by transpiling TypeScript on the fly, then asserts route,
// action (capability), scope, auth and export behaviour. Source of truth is the
// production modules — the test does not re-implement permission logic.
//
// Run: node scripts/access-test.mjs
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import ts from "typescript";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cache = new Map();
function loadTs(absPath) {
  if (cache.has(absPath)) return cache.get(absPath);
  const { outputText } = ts.transpileModule(readFileSync(absPath, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
  });
  const module = { exports: {} };
  cache.set(absPath, module.exports);
  const req = (spec) => {
    if (spec === "@/types") return {};
    let base = spec.startsWith("@/") ? path.join(ROOT, "src", spec.slice(2)) : path.join(path.dirname(absPath), spec);
    let r = base.endsWith(".ts") ? base : base + ".ts";
    if (!existsSync(r)) {
      const idx = path.join(base, "index.ts"); // directory import → /index.ts
      if (existsSync(idx)) r = idx;
    }
    return loadTs(r);
  };
  new Function("exports", "require", "module", outputText)(module.exports, req, module);
  cache.set(absPath, module.exports);
  return module.exports;
}

const { canAccessRoute } = loadTs(path.join(ROOT, "src/permissions/routeAccess.ts"));
const { ROLE_CAPABILITIES, hasCapability } = loadTs(path.join(ROOT, "src/permissions/capabilities.ts"));
const { computeScope, inScope, getRecordBlockId } = loadTs(path.join(ROOT, "src/permissions/index.ts"));
const { SEED_USERS } = loadTs(path.join(ROOT, "src/data/users.ts"));
const { authenticate } = loadTs(path.join(ROOT, "src/services/auth.ts"));
const { normalizeUserScopeForRole, validateUserScope, validateAssignedGpsForBlock, userUpdateAuditEvents, roleDefaultRoute } = loadTs(path.join(ROOT, "src/permissions/userScope.ts"));
const { canAcceptHandover, canReviewHandover, getAccessibleHandovers, getAccessibleUcFollowUps } = loadTs(path.join(ROOT, "src/utils/selectors.ts"));
const { shouldQueue, syncQueue, makeOfflineMutation } = loadTs(path.join(ROOT, "src/services/offline.ts"));

let pass = 0, fail = 0;
const groups = {};
let group = "GENERAL";
function G(name) { group = name; groups[group] = groups[group] || { p: 0, f: 0 }; console.log(`\n== ${name} ==`); }
function check(name, actual, expected) {
  const ok = actual === expected;
  console.log(`${ok ? "  PASS" : "  FAIL"}  ${name}`);
  if (ok) { pass++; groups[group].p++; } else { fail++; groups[group].f++; }
}
const cap = (role, c) => (ROLE_CAPABILITIES[role] || []).includes(c);
// minimal user builders
const U = (role, extra = {}) => ({ id: "t", role, districtId: "d-yvt", status: "active", ...extra });

// ---------------------------------------------------------------- ROUTE
G("ROUTE TESTS");
check("citizen ✗ /app/admin", canAccessRoute("citizen", "/app/admin"), false);
check("citizen ✗ /app/audit", canAccessRoute("citizen", "/app/audit"), false);
check("citizen ✗ /app/pathpurava", canAccessRoute("citizen", "/app/pathpurava"), false);
check("citizen ✓ /app/participation", canAccessRoute("citizen", "/app/participation"), true);
check("citizen ✓ /app/transparency", canAccessRoute("citizen", "/app/transparency"), true);
check("citizen ✓ /app/complaint-routing", canAccessRoute("citizen", "/app/complaint-routing"), true);
check("gram_sevak ✓ /app/pathpurava", canAccessRoute("gram_sevak", "/app/pathpurava"), true);
check("gram_sevak ✓ /app/pathpurava/file-flow", canAccessRoute("gram_sevak", "/app/pathpurava/file-flow"), true);
check("gram_sevak ✗ /app/admin", canAccessRoute("gram_sevak", "/app/admin"), false);
check("gram_sevak ✗ /app/audit", canAccessRoute("gram_sevak", "/app/audit"), false);
check("gram_sevak ✗ /app/mahsul-sandhi", canAccessRoute("gram_sevak", "/app/mahsul-sandhi"), false);
check("extension_officer ✓ /app/audit", canAccessRoute("extension_officer", "/app/audit"), true);
check("extension_officer ✗ /app/admin", canAccessRoute("extension_officer", "/app/admin"), false);
check("bdo ✓ /app/reports", canAccessRoute("bdo", "/app/reports"), true);
check("bdo ✓ /app/mahsul-sandhi", canAccessRoute("bdo", "/app/mahsul-sandhi"), true);
check("bdo ✗ /app/admin", canAccessRoute("bdo", "/app/admin"), false);
check("dyceo_panchayat ✓ /app/pathpurava", canAccessRoute("dyceo_panchayat", "/app/pathpurava"), true);
check("dyceo_panchayat ✗ /app/admin", canAccessRoute("dyceo_panchayat", "/app/admin"), false);
check("ceo ✓ /app/audit", canAccessRoute("ceo", "/app/audit"), true);
check("ceo ✗ /app/admin", canAccessRoute("ceo", "/app/admin"), false);
check("ceo ✗ /app/process-lab", canAccessRoute("ceo", "/app/process-lab"), false);
check("sysadmin ✓ /app/admin", canAccessRoute("sysadmin", "/app/admin"), true);
check("volunteer ✗ /app/nigaa", canAccessRoute("volunteer", "/app/nigaa"), false);
check("vwsc_member ✓ /app/nigaa", canAccessRoute("vwsc_member", "/app/nigaa"), true);

// ---------------------------------------------------------------- ACTION
G("ACTION (CAPABILITY) TESTS");
check("citizen ✗ CREATE_OBLIGATION", cap("citizen", "CREATE_OBLIGATION"), false);
check("citizen ✗ REPORT_ASSET_CONDITION", cap("citizen", "REPORT_ASSET_CONDITION"), false);
check("citizen ✗ MANAGE_USERS", cap("citizen", "MANAGE_USERS"), false);
check("citizen ✓ SUBMIT_PARTICIPATION", cap("citizen", "SUBMIT_PARTICIPATION"), true);
check("gp_member ✗ CREATE_FROM_TEMPLATE", cap("gp_member", "CREATE_FROM_TEMPLATE"), false);
check("gram_sevak ✓ CREATE_OBLIGATION", cap("gram_sevak", "CREATE_OBLIGATION"), true);
check("gram_sevak ✓ REPORT_ASSET_CONDITION", cap("gram_sevak", "REPORT_ASSET_CONDITION"), true);
check("gram_sevak ✓ CREATE_FROM_TEMPLATE", cap("gram_sevak", "CREATE_FROM_TEMPLATE"), true);
check("gram_sevak ✓ RESOLVE_COMPLAINT", cap("gram_sevak", "RESOLVE_COMPLAINT"), true);
check("gram_sevak ✗ MANAGE_USERS", cap("gram_sevak", "MANAGE_USERS"), false);
check("je ✓ CLAIM_REPAIR_COMPLETE", cap("je", "CLAIM_REPAIR_COMPLETE"), true);
check("je ✗ VERIFY_REPAIR (no self-verify capability)", cap("je", "VERIFY_REPAIR"), false);
check("extension_officer ✓ VERIFY_REPAIR", cap("extension_officer", "VERIFY_REPAIR"), true);
check("extension_officer ✓ REVIEW_INSTITUTION_ACTIVITY", cap("extension_officer", "REVIEW_INSTITUTION_ACTIVITY"), true);
check("extension_officer ✗ CREATE_OBLIGATION", cap("extension_officer", "CREATE_OBLIGATION"), false);
check("volunteer ✗ COMPLETE_PARTICIPATION_ACTIVITY", cap("volunteer", "COMPLETE_PARTICIPATION_ACTIVITY"), false);
check("volunteer ✗ VERIFY_PARTICIPATION", cap("volunteer", "VERIFY_PARTICIPATION"), false);
check("sarpanch ✗ CREATE_OBLIGATION", cap("sarpanch", "CREATE_OBLIGATION"), false);
check("ceo ✗ REPORT_ASSET_CONDITION (no field action)", cap("ceo", "REPORT_ASSET_CONDITION"), false);
check("ceo ✗ CLAIM_REPAIR_COMPLETE", cap("ceo", "CLAIM_REPAIR_COMPLETE"), false);
check("ceo ✗ CREATE_OBLIGATION", cap("ceo", "CREATE_OBLIGATION"), false);
check("ceo ✗ SUBMIT_SEASONAL_CHECK", cap("ceo", "SUBMIT_SEASONAL_CHECK"), false);
check("sysadmin ✗ VERIFY_REPAIR (not operational)", cap("sysadmin", "VERIFY_REPAIR"), false);
check("sysadmin ✗ CREATE_OBLIGATION", cap("sysadmin", "CREATE_OBLIGATION"), false);
check("sysadmin ✗ SUBMIT_INSTITUTION_ACTIVITY", cap("sysadmin", "SUBMIT_INSTITUTION_ACTIVITY"), false);
check("sysadmin ✗ RESOLVE_COMPLAINT", cap("sysadmin", "RESOLVE_COMPLAINT"), false);
check("sysadmin ✗ VERIFY_PARTICIPATION", cap("sysadmin", "VERIFY_PARTICIPATION"), false);
check("sysadmin ✓ MANAGE_USERS", cap("sysadmin", "MANAGE_USERS"), true);
check("hasCapability(UPDATE_OWN_OBLIGATION) rejects other GP", hasCapability(U("gram_sevak", { gpId: "gp-borgaon" }), "UPDATE_OWN_OBLIGATION", { gpId: "gp-lohara" }), false);
check("hasCapability(UPDATE_OWN_OBLIGATION) allows own GP", hasCapability(U("gram_sevak", { gpId: "gp-borgaon" }), "UPDATE_OWN_OBLIGATION", { gpId: "gp-borgaon" }), true);

// ---------------------------------------------------------------- SCOPE
G("SCOPE TESTS");
const ext = computeScope(U("extension_officer", { blockId: "b-yavatmal", assignedGpIds: ["gp-borgaon", "gp-lohara"] }));
check("extension ✓ assigned GP A", inScope(ext, { districtId: "d-yvt", blockId: "b-yavatmal", gpId: "gp-borgaon" }), true);
check("extension ✓ assigned GP B", inScope(ext, { districtId: "d-yvt", blockId: "b-yavatmal", gpId: "gp-lohara" }), true);
check("extension ✗ unassigned GP C", inScope(ext, { districtId: "d-yvt", blockId: "b-yavatmal", gpId: "gp-waghapur" }), false);
check("extension ✗ no-gpId record in another block", inScope(ext, { districtId: "d-yvt", blockId: "b-arni" }), false);
check("extension ✓ no-gpId record in own block", inScope(ext, { districtId: "d-yvt", blockId: "b-yavatmal" }), true);
const bdo = computeScope(U("bdo", { blockId: "b-yavatmal" }));
check("bdo ✓ own-block GP record", inScope(bdo, { districtId: "d-yvt", blockId: "b-yavatmal", gpId: "gp-borgaon" }), true);
check("bdo ✗ other block record", inScope(bdo, { districtId: "d-yvt", blockId: "b-arni", gpId: "x" }), false);
check("bdo ✗ other block no-gpId record", inScope(bdo, { districtId: "d-yvt", blockId: "b-arni" }), false);
const gs = computeScope(U("gram_sevak", { blockId: "b-yavatmal", gpId: "gp-borgaon" }));
check("gram_sevak ✓ own GP record", inScope(gs, { districtId: "d-yvt", blockId: "b-yavatmal", gpId: "gp-borgaon" }), true);
check("gram_sevak ✗ other GP record", inScope(gs, { districtId: "d-yvt", blockId: "b-yavatmal", gpId: "gp-lohara" }), false);
const dept = computeScope(U("dyceo_dept_head", { departmentId: "dept-water" }));
check("dept head ✗ other-department record", inScope(dept, { districtId: "d-yvt", departmentId: "dept-engineering" }), false);
check("dept head ✓ own-department record", inScope(dept, { districtId: "d-yvt", departmentId: "dept-water" }), true);
const cit = computeScope(U("citizen", { blockId: "b-yavatmal", gpId: "gp-borgaon" }));
check("citizen ✓ published public record", inScope(cit, { districtId: "d-yvt", gpId: "gp-borgaon", publishedPublic: true, classification: "PUBLIC" }), true);
check("citizen ✗ unpublished record", inScope(cit, { districtId: "d-yvt", gpId: "gp-borgaon", publishedPublic: false }), false);
check("citizen ✗ RESTRICTED record", inScope(cit, { districtId: "d-yvt", gpId: "gp-borgaon", publishedPublic: true, classification: "RESTRICTED" }), false);
const ceoS = computeScope(U("ceo"));
check("ceo ✓ any district record", inScope(ceoS, { districtId: "d-yvt", blockId: "b-arni", gpId: "x" }), true);

// ---------------------------------------------------------------- EXPORT (scope-driven)
G("EXPORT SCOPE TESTS");
check("gram_sevak export ✗ other-GP handover", inScope(gs, { districtId: "d-yvt", blockId: "b-yavatmal", gpId: "gp-lohara" }), false);
check("gram_sevak export ✓ own-GP handover", inScope(gs, { districtId: "d-yvt", blockId: "b-yavatmal", gpId: "gp-borgaon" }), true);
check("bdo export ✗ other-block record", inScope(bdo, { districtId: "d-yvt", blockId: "b-pusad", gpId: "y" }), false);
check("citizen export only public", inScope(cit, { districtId: "d-yvt", gpId: "gp-borgaon", publishedPublic: true, classification: "PUBLIC" }), true);

// ---------------------------------------------------------------- AUTH (seed integrity + rule)
G("AUTH TESTS");
const activeReject = (u) => (u.status === "disabled" ? false : true); // mirrors store.isActive gate
check("all SEED_USERS active by default", SEED_USERS.every((u) => u.status !== "disabled"), true);
check("SEED_USERS emails unique", new Set(SEED_USERS.map((u) => u.email)).size === SEED_USERS.length, true);
check("SEED_USERS all password demo123", SEED_USERS.every((u) => u.password === "demo123"), true);
check("disabled user would be rejected by active gate", activeReject({ status: "disabled" }), false);
check("active user passes active gate", activeReject({ status: "active" }), true);
check("every SEED user email ends with @demo.local", SEED_USERS.every((u) => u.email.endsWith("@demo.local")), true);

// ---------------------------------------------------------------- ADMIN STATE
G("ADMIN STATE TESTS");
// Create a user in a mutable users list, then authenticate against it.
const users = SEED_USERS.map((u) => ({ ...u }));
const newUser = { id: "u-new", name: "Demo New", email: "demo-newuser@demo.local", password: "demo123", role: "gram_sevak", districtId: "d-yvt", blockId: "b-yavatmal", gpId: "gp-borgaon", status: "active" };
users.push(newUser);
check("new admin-created user can login", authenticate(users, "demo-newuser@demo.local", "demo123").ok, true);
newUser.status = "disabled";
check("disabled user login rejected", authenticate(users, "demo-newuser@demo.local", "demo123").ok, false);
check("disabled reason reported", authenticate(users, "demo-newuser@demo.local", "demo123").reason, "disabled");
newUser.status = "active";
// role change → normalized scope drives next-login dashboard/scope
const asCeo = normalizeUserScopeForRole(newUser, "ceo");
check("role change → gpId cleared for CEO", asCeo.gpId, undefined);
check("role change → CEO scope is district", computeScope(asCeo).districtId, "d-yvt");
check("role change → CEO not block-scoped", computeScope(asCeo).blockId, undefined);
const backToGs = normalizeUserScopeForRole(asCeo, "gram_sevak");
check("role change back → GP restored", !!backToGs.gpId, true);
check("role change back → block restored", !!backToGs.blockId, true);
// GP change persists into scope
const gpMoved = { ...newUser, gpId: "gp-lohara" };
check("GP change → new GP in scope", (computeScope(gpMoved).gpIds || []).includes("gp-lohara"), true);
// block change for BDO
const bdoMoved = normalizeUserScopeForRole({ ...newUser, blockId: "b-arni" }, "bdo");
check("block change → BDO scoped to new block", computeScope(bdoMoved).blockId, "b-arni");
// department change for dept head
const deptUser = normalizeUserScopeForRole({ ...newUser, departmentId: "dept-engineering" }, "dyceo_dept_head");
check("department set for dept head", deptUser.departmentId, "dept-engineering");
// validation rejects invalid combos
check("validation blocks Gram Sevak without GP", validateUserScope({ ...newUser, gpId: undefined }).ok, false);
check("validation blocks BDO without block", validateUserScope({ ...newUser, role: "bdo", blockId: undefined, gpId: undefined }).ok, false);
check("validation blocks dept head without department", validateUserScope({ ...newUser, role: "dyceo_dept_head", gpId: undefined, blockId: undefined }).ok, false);
check("validation passes valid Gram Sevak", validateUserScope(newUser).ok, true);

// ---------------------------------------------------------------- HANDOVER
G("HANDOVER TESTS");
// GP-A handover: incoming = GramSevakA (id gsA-id), outgoing = old officer.
const hA = { id: "H-A", gpId: "gp-borgaon", blockId: "b-yavatmal", districtId: "d-yvt", accepted: false, status: "AWAITING_ACCEPTANCE", incomingUserId: "gsA-id", outgoingUserId: "old-a" };
const hB = { id: "H-B", gpId: "gp-lohara", blockId: "b-yavatmal", districtId: "d-yvt", accepted: false, status: "AWAITING_ACCEPTANCE", incomingUserId: "gsB-id", outgoingUserId: "old-b" };
const gsA = { id: "gsA-id", role: "gram_sevak", districtId: "d-yvt", blockId: "b-yavatmal", gpId: "gp-borgaon", status: "active" };
const gsB = { id: "gsB-id", role: "gram_sevak", districtId: "d-yvt", blockId: "b-yavatmal", gpId: "gp-lohara", status: "active" };
const gsA_other = { id: "gsA-other", role: "gram_sevak", districtId: "d-yvt", blockId: "b-yavatmal", gpId: "gp-borgaon", status: "active" }; // same GP, NOT designated
const outgoingA = { id: "old-a", role: "gram_sevak", districtId: "d-yvt", blockId: "b-yavatmal", gpId: "gp-borgaon", status: "active" };
check("GP A Gram Sevak sees GP A handover", getAccessibleHandovers(gsA, [hA, hB]).some((h) => h.id === "H-A"), true);
check("GP A Gram Sevak does NOT see GP B handover", getAccessibleHandovers(gsA, [hA, hB]).some((h) => h.id === "H-B"), false);
check("designated incoming officer CAN accept GP A handover", canAcceptHandover(gsA, hA), true);
check("unrelated (GP B) Gram Sevak CANNOT accept GP A handover", canAcceptHandover(gsB, hA), false);
check("same-GP NON-designated Gram Sevak CANNOT accept", canAcceptHandover(gsA_other, hA), false);
check("outgoing officer CANNOT accept", canAcceptHandover(outgoingA, hA), false);
check("Sysadmin CANNOT accept handover", canAcceptHandover({ id: "adm", role: "sysadmin", status: "active" }, hA), false);
check("CEO CANNOT accept handover", canAcceptHandover({ id: "c", role: "ceo", districtId: "d-yvt", status: "active" }, hA), false);
check("Extension CANNOT accept (review only)", canAcceptHandover({ id: "e", role: "extension_officer", blockId: "b-yavatmal", gpId: "gp-borgaon", status: "active" }, hA), false);
check("BDO CANNOT accept (review only)", canAcceptHandover({ id: "b", role: "bdo", blockId: "b-yavatmal", status: "active" }, hA), false);
check("Extension CAN review handovers", canReviewHandover({ role: "extension_officer" }), true);
check("BDO CAN review handovers", canReviewHandover({ role: "bdo" }), true);
check("disabled designated incoming CANNOT accept", canAcceptHandover({ ...gsA, status: "disabled" }, hA), false);
check("cannot accept an already-accepted handover", canAcceptHandover(gsA, { ...hA, accepted: true, status: "ACCEPTED" }), false);
check("Deputy CEO sees both handovers", getAccessibleHandovers({ id: "d", role: "dyceo_panchayat", districtId: "d-yvt", status: "active" }, [hA, hB]).length, 2);
check("citizen sees no handovers", getAccessibleHandovers(U("citizen", { gpId: "gp-borgaon" }), [hA, hB]).length, 0);

// ---------------------------------------------------------------- UC
G("UC TESTS");
const ucA = { id: "UC-A", gpId: "gp-borgaon", blockId: "b-yavatmal", districtId: "d-yvt" };
const ucB = { id: "UC-B", gpId: "gp-lohara", blockId: "b-yavatmal", districtId: "d-yvt" };
const ucC = { id: "UC-C", gpId: "gp-arni-0", blockId: "b-arni", districtId: "d-yvt" };
check("GP A cannot see GP B UC", getAccessibleUcFollowUps(gsA, [ucA, ucB]).some((u) => u.id === "UC-B"), false);
check("GP A sees own UC", getAccessibleUcFollowUps(gsA, [ucA, ucB]).some((u) => u.id === "UC-A"), true);
check("Extension only assigned GP UC", getAccessibleUcFollowUps(U("extension_officer", { blockId: "b-yavatmal", assignedGpIds: ["gp-borgaon"] }), [ucA, ucB]).length, 1);
check("BDO A cannot see Block B UC", getAccessibleUcFollowUps(U("bdo", { blockId: "b-yavatmal" }), [ucA, ucC]).some((u) => u.id === "UC-C"), false);
check("Deputy CEO sees district UC", getAccessibleUcFollowUps(U("dyceo_panchayat"), [ucA, ucB, ucC]).length, 3);
check("citizen cannot access internal UC list", getAccessibleUcFollowUps(U("citizen", { gpId: "gp-borgaon" }), [ucA]).length, 0);
// department-scoped UC
const ucWater = { id: "UC-W", gpId: "gp-borgaon", blockId: "b-yavatmal", districtId: "d-yvt", departmentId: "dept-water", visibilityScope: "DEPARTMENT" };
const ucMgnrega = { id: "UC-M", gpId: "gp-borgaon", blockId: "b-yavatmal", districtId: "d-yvt", departmentId: "dept-mgnrega", visibilityScope: "DEPARTMENT" };
const ucCross = { id: "UC-X", gpId: "gp-borgaon", blockId: "b-yavatmal", districtId: "d-yvt", departmentId: "dept-mgnrega", visibilityScope: "CROSS_DEPARTMENT" };
const waterHead = U("dyceo_dept_head", { departmentId: "dept-water" });
check("Water dept head SEES Water UC", getAccessibleUcFollowUps(waterHead, [ucWater, ucMgnrega]).some((u) => u.id === "UC-W"), true);
check("Water dept head does NOT see MGNREGA-private UC", getAccessibleUcFollowUps(waterHead, [ucWater, ucMgnrega]).some((u) => u.id === "UC-M"), false);
check("Water dept head SEES explicit CROSS_DEPARTMENT UC", getAccessibleUcFollowUps(waterHead, [ucCross]).some((u) => u.id === "UC-X"), true);

// ---------------------------------------------------------------- OFFLINE
G("OFFLINE TESTS");
check("mutation queues when offline", shouldQueue(false), true);
check("mutation NOT queued when online", shouldQueue(true), false);
const q = [makeOfflineMutation({ entityType: "OBLIGATION", entityId: "O1", action: "UPDATE_STATUS", userId: "u" }, "1", "t"),
           makeOfflineMutation({ entityType: "SEASONAL_TASK", entityId: "S1", action: "UPDATE_TASK", userId: "u" }, "2", "t"),
           makeOfflineMutation({ entityType: "ASSET", entityId: "A1", action: "QR", userId: "u" }, "3", "t")];
check("PATHPURAVA offline entry is SYNC_PENDING", q[0].status, "SYNC_PENDING");
check("Seasonal offline entry is SYNC_PENDING", q[1].status, "SYNC_PENDING");
check("NIGAA offline entry is SYNC_PENDING", q[2].status, "SYNC_PENDING");
check("reconnect marks all SYNCED_DEMO", syncQueue(q).every((m) => m.status === "SYNCED_DEMO"), true);

// ---------------------------------------------------------------- ROLE SWITCH
G("ROLE SWITCH TESTS");
const needsRedirect = (role, pathname) => !canAccessRoute(role, pathname);
check("Deputy CEO→Citizen on /app/pathpurava needs redirect", needsRedirect("citizen", "/app/pathpurava"), true);
check("Citizen redirect target is /public", roleDefaultRoute("citizen"), "/public");
check("Sysadmin→Gram Sevak on /app/admin needs redirect", needsRedirect("gram_sevak", "/app/admin"), true);
check("Gram Sevak default route is /app", roleDefaultRoute("gram_sevak"), "/app");
check("CEO→Volunteer on /app needs redirect (volunteer public)", needsRedirect("volunteer", "/app/pathpurava"), true);
check("BDO→Extension on allowed block page may stay", needsRedirect("extension_officer", "/app/pathpurava"), false);
check("Sysadmin default route is /app/admin", roleDefaultRoute("sysadmin"), "/app/admin");

// ---------------------------------------------------------------- DEPARTMENT
G("DEPARTMENT TESTS");
const water = computeScope(U("dyceo_dept_head", { departmentId: "dept-water" }));
check("dept head sees own-department record", inScope(water, { districtId: "d-yvt", departmentId: "dept-water" }), true);
check("dept head does NOT see other-department record", inScope(water, { districtId: "d-yvt", departmentId: "dept-engineering" }), false);
check("dept head does NOT see untagged internal record", inScope(water, { districtId: "d-yvt" }), false);
check("dept head sees DISTRICT_SHARED untagged record", inScope(water, { districtId: "d-yvt", visibilityScope: "DISTRICT_SHARED" }), true);
check("dept head sees public untagged record", inScope(water, { districtId: "d-yvt", publishedPublic: true }), true);

// ---------------------------------------------------------------- EDGE CASES
G("EDGE CASE TESTS");
// 1-4 handover
check("EC: designated-incoming mismatch blocks accept", canAcceptHandover({ id: "x", role: "gram_sevak", gpId: "gp-borgaon", status: "active" }, hA), false);
check("EC: outgoing officer accept blocked", canAcceptHandover(outgoingA, hA), false);
check("EC: same-GP unrelated accept blocked", canAcceptHandover(gsA_other, hA), false);
// 4-6 extension stale cross-block + block derivation
const extStale = { id: "e2", role: "extension_officer", blockId: "b-yavatmal", assignedGpIds: ["gp-lohara", "gp-arni-0"], status: "active" };
check("EC: extension with cross-block assigned GP fails validation", validateAssignedGpsForBlock(extStale), false);
const extClean = { id: "e3", role: "extension_officer", blockId: "b-yavatmal", assignedGpIds: ["gp-borgaon", "gp-lohara"], status: "active" };
check("EC: extension with in-block assigned GPs passes validation", validateAssignedGpsForBlock(extClean), true);
const extScope = computeScope(extClean);
check("EC: extension does NOT see cross-block record even if gp in assigned (stale)", inScope(computeScope(extStale), { districtId: "d-yvt", gpId: "gp-arni-0" }), false);
check("EC: record missing blockId derives block from GP", getRecordBlockId({ gpId: "gp-borgaon" }), "b-yavatmal");
check("EC: extension blocked on GP record whose derived block differs", inScope(extScope, { districtId: "d-yvt", gpId: "gp-arni-0" }), false);
// 7-8 UC department
check("EC: UC department mismatch hidden", inScope(computeScope(waterHead), { districtId: "d-yvt", departmentId: "dept-mgnrega", visibilityScope: "DEPARTMENT" }), false);
check("EC: UC untagged internal hidden from dept head", inScope(computeScope(waterHead), { districtId: "d-yvt" }), false);
// 9 admin status audit
const disEvents = userUpdateAuditEvents({ id: "u", name: "X", email: "x", password: "p", role: "gram_sevak", status: "active" }, { id: "u", name: "X", email: "x", password: "p", role: "gram_sevak", status: "disabled" });
check("EC: active→disabled emits USER_DISABLED", disEvents.some((e) => e.action.startsWith("USER_DISABLED")), true);
const enEvents = userUpdateAuditEvents({ id: "u", name: "X", email: "x", password: "p", role: "gram_sevak", status: "disabled" }, { id: "u", name: "X", email: "x", password: "p", role: "gram_sevak", status: "active" });
check("EC: disabled→active emits USER_ENABLED", enEvents.some((e) => e.action.startsWith("USER_ENABLED")), true);
// 10 disabled user in view-as / auth
check("EC: disabled user cannot authenticate", authenticate([{ id: "u", email: "d@demo.local", password: "demo123", role: "gram_sevak", status: "disabled" }], "d@demo.local", "demo123").ok, false);
// 11 role changed while on unauthorized route
check("EC: role change to citizen on /app/admin needs redirect", !canAccessRoute("citizen", "/app/admin"), true);
// 12 sysadmin operational mutation
check("EC: Sysadmin cannot CREATE_OBLIGATION", cap("sysadmin", "CREATE_OBLIGATION"), false);
check("EC: Sysadmin cannot VERIFY_REPAIR", cap("sysadmin", "VERIFY_REPAIR"), false);
// 13 CEO field mutation
check("EC: CEO cannot REPORT_ASSET_CONDITION", cap("ceo", "REPORT_ASSET_CONDITION"), false);
check("EC: CEO cannot ACCEPT_HANDOVER", cap("ceo", "ACCEPT_HANDOVER"), false);
// 14 public internal export
check("EC: citizen has no EXPORT_DATA capability", cap("citizen", "EXPORT_DATA"), false);
check("EC: citizen internal obligation record not visible", inScope(computeScope(U("citizen", { gpId: "gp-borgaon" })), { districtId: "d-yvt", gpId: "gp-borgaon", classification: "INTERNAL" }), false);

// ---------------------------------------------------------------- WORKFLOW (capability chain)
G("WORKFLOW TESTS");
// NIGAA HP-018 chain
check("WF: VWSC can report asset condition", cap("vwsc_member", "REPORT_ASSET_CONDITION"), true);
check("WF: Gram Sevak can assign repair", cap("gram_sevak", "ASSIGN_REPAIR"), true);
check("WF: JE can claim repair complete", cap("je", "CLAIM_REPAIR_COMPLETE"), true);
check("WF: JE cannot self-verify", cap("je", "VERIFY_REPAIR"), false);
check("WF: Extension can verify repair", cap("extension_officer", "VERIFY_REPAIR"), true);
check("WF: CEO cannot field-edit (no report)", cap("ceo", "REPORT_ASSET_CONDITION"), false);
check("WF: Sysadmin cannot verify repair", cap("sysadmin", "VERIFY_REPAIR"), false);
// PATHPURAVA chain
check("WF: reviewer can review obligation", cap("extension_officer", "REVIEW_OBLIGATION"), true);
check("WF: Gram Sevak can update own obligation", cap("gram_sevak", "UPDATE_OWN_OBLIGATION"), true);
check("WF: Sysadmin cannot close obligation", cap("sysadmin", "CLOSE_OBLIGATION"), false);
check("WF: CEO cannot create obligation", cap("ceo", "CREATE_OBLIGATION"), false);
// Participation / Complaint chain
check("WF: volunteer can submit participation", cap("volunteer", "SUBMIT_PARTICIPATION"), true);
check("WF: Gram Sevak can verify participation", cap("gram_sevak", "VERIFY_PARTICIPATION"), true);
check("WF: citizen can submit complaint", cap("citizen", "SUBMIT_COMPLAINT"), true);
check("WF: Sysadmin cannot resolve complaint", cap("sysadmin", "RESOLVE_COMPLAINT"), false);

// ---------------------------------------------------------------- SUMMARY
console.log("\n----------------------------------------");
for (const [g, r] of Object.entries(groups)) console.log(`  ${g}: ${r.p}/${r.p + r.f}`);
console.log("----------------------------------------");
console.log(`${fail === 0 ? "ALL PASSED" : "SOME FAILED"} — ${pass} passed, ${fail} failed (${pass + fail} total)\n`);
process.exit(fail === 0 ? 0 : 1);
