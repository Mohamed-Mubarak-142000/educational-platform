/**
 * Route utilities — shared across the app.
 * Kept in a separate file so components/RequireAuth.tsx only exports components,
 * which is required for React Fast Refresh to work correctly.
 */

export type Role = 'Admin' | 'Teacher' | 'Student';

/**
 * Returns the "home" route for a given role.
 * Used after login, registration, email verification, and password change.
 */
export const roleHome = (role?: Role): string => {
  if (role === 'Admin') return '/admin';
  if (role === 'Teacher') return '/teacher';
  return '/student';
};
