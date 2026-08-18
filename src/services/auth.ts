// Pure authentication helpers (framework-free) so the store AND the access-test
// suite exercise exactly the same logic — no duplicated auth rules in tests.
import { RoleId, User } from "@/types";

export type LoginResult = { ok: boolean; reason?: "invalid" | "disabled"; user?: User };

export const isActive = (u: User) => u.status !== "disabled";

/** Authenticate against the CURRENT users list (state.users), not the seed. */
export function authenticate(users: User[], email: string, password: string): LoginResult {
  const match = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!match || match.password !== password) return { ok: false, reason: "invalid" };
  if (!isActive(match)) return { ok: false, reason: "disabled" };
  return { ok: true, user: match };
}

/** Pick the current active demo user for a role (Quick Switcher / View-As-Role). */
export function activeUserForRole(users: User[], role: RoleId): User | undefined {
  return users.find((u) => u.role === role && isActive(u));
}
