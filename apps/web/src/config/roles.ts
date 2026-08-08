import type { UserRole } from "@lore-addict/types";

/**
 * The permission matrix from ARCHITECTURE.md Section 4, as code. This is
 * consulted by UI-layer guards (route layouts, conditional rendering) — the
 * database's RLS policies enforce the same rules independently. If this
 * matrix and a policy ever disagree, RLS wins; this file is the second
 * enforcement layer, not the first (see Section 3's "enforced twice"
 * principle).
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 0,
  moderator: 1,
  author: 2,
  editor: 3,
  admin: 4,
};

export function hasRoleAtLeast(role: UserRole, minimum: UserRole): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minimum];
}

export const PERMISSIONS = {
  ACCESS_STUDIO: ["author", "editor", "admin", "moderator"] as UserRole[],
  PUBLISH_ANY_ARTICLE: ["editor", "admin"] as UserRole[],
  EDIT_ANY_ARTICLE: ["editor", "admin"] as UserRole[],
  MODERATE_COMMENTS: ["moderator", "editor", "admin"] as UserRole[],
  MANAGE_USERS: ["admin"] as UserRole[],
  MANAGE_AD_SLOTS: ["admin"] as UserRole[],
  VIEW_SITE_ANALYTICS: ["editor", "admin"] as UserRole[],
} as const;

export function canAccess(
  role: UserRole,
  permission: keyof typeof PERMISSIONS,
): boolean {
  return (PERMISSIONS[permission] as UserRole[]).includes(role);
}
