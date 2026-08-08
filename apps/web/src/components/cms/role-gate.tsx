import type { UserRole } from "@lore-addict/types";
import { canAccess, type PERMISSIONS } from "@/config/roles";

export interface RoleGateProps {
  role: UserRole;
  permission: keyof typeof PERMISSIONS;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * UI-layer convenience only — hiding a button here is about not showing
 * people controls they can't use, not security. The corresponding RLS
 * policy (see 0002_content.sql) is what actually stops the mutation if
 * someone reaches the action anyway.
 */
export function RoleGate({ role, permission, children, fallback = null }: RoleGateProps) {
  if (!canAccess(role, permission)) return <>{fallback}</>;
  return <>{children}</>;
}
