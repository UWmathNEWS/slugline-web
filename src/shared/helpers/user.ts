import { User, UserRole } from "../types";

export const GROUPS = {
  Contributor: [] as string[], // without typecast, is treated as never[]
  Copyeditor: ["Contributor"],
  Editor: ["Copyeditor", "Contributor"],
};

/**
 * Returns whether a user holds privileges that are at least the given role.
 *
 * @param user The user to test
 * @param role The role to test against
 */
export const atLeast = (user: User | null, role: UserRole) => {
  if (!user) return false;
  return (
    user.is_staff || user.role === role || GROUPS[user.role].includes(role)
  );
};
