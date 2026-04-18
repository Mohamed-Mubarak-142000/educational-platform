import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  isAdmin,
  isTeacher,
  isStudent,
  isAdminOrTeacher,
  canManageStages,
  canManageGrades,
  canCreateSubjects,
  canViewSubject,
  canEditSubject,
  canCreateUnits,
  canEditUnit,
  canCreateLessons,
  canEditLesson,
  canDelete,
  canManageUsers,
  canViewStudents,
  canManageTeacherAssignments,
  getAllowedActions,
  getRoleDisplayName,
  canAccessAdminPanel,
  getDashboardRoute,
} from '../utils/rbac';

/**
 * useRBAC Hook
 * Provides role-based access control utilities in React components
 * 
 * @example
 * const { isAdmin, canCreateSubjects, allowedActions } = useRBAC();
 * 
 * if (canCreateSubjects) {
 *   // Show create button
 * }
 */
export const useRBAC = () => {
  const { user } = useAuth();

  const rbac = useMemo(() => {
    return {
      // User info
      user,
      role: user?.role,
      roleDisplayName: user ? getRoleDisplayName(user.role as 'Admin' | 'Teacher' | 'Student') : null,

      // Role checks
      isAdmin: isAdmin(user),
      isTeacher: isTeacher(user),
      isStudent: isStudent(user),
      isAdminOrTeacher: isAdminOrTeacher(user),

      // Permission checks
      canManageStages: canManageStages(user),
      canManageGrades: canManageGrades(user),
      canCreateSubjects: canCreateSubjects(user),
      canManageUsers: canManageUsers(user),
      canViewStudents: canViewStudents(user),
      canManageTeacherAssignments: canManageTeacherAssignments(user),
      canAccessAdminPanel: canAccessAdminPanel(user),

      // Dynamic permission checks (pass parameters)
      canViewSubject: (subjectId?: string) => canViewSubject(user, subjectId),
      canEditSubject: (subjectId?: string) => canEditSubject(user, subjectId),
      canCreateUnits: (subjectId?: string, gradeId?: string) =>
        canCreateUnits(user, subjectId, gradeId),
      canEditUnit: (unitCreatedBy?: string) => canEditUnit(user, unitCreatedBy),
      canCreateLessons: (unitCreatedBy?: string) => canCreateLessons(user, unitCreatedBy),
      canEditLesson: (lessonTeacherId?: string) => canEditLesson(user, lessonTeacherId),
      canDelete: (createdBy?: string) => canDelete(user, createdBy),

      // Helper to get all allowed actions for a resource
      getAllowedActions: (
        resourceType: 'stage' | 'grade' | 'subject' | 'unit' | 'lesson',
        createdBy?: string
      ) => getAllowedActions(user, resourceType, createdBy),

      // Navigation
      getDashboardRoute: () => getDashboardRoute(user),
    };
  }, [user]);

  return rbac;
};

/**
 * Hook to check if user has specific role(s)
 * 
 * @example
 * const hasPermission = useHasRole('Admin', 'Teacher');
 */
export const useHasRole = (...roles: Array<'Admin' | 'Teacher' | 'Student'>): boolean => {
  const { user } = useAuth();
  return user && user.role ? roles.includes(user.role as 'Admin' | 'Teacher' | 'Student') : false;
};

/**
 * Hook to get scoped data filter for teachers
 * Returns filter params for API calls
 * 
 * @example
 * const filter = useScopeFilter();
 * // Use filter in API calls to get only assigned content
 */
export const useScopeFilter = () => {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user) return null;

    if (user.role === 'Admin') {
      // Admin sees everything, no filter needed
      return null;
    }

    if (user.role === 'Teacher') {
      // Teacher filter by assignments
      // Note: Backend will enforce the actual filtering
      // This is just for client-side awareness
      return {
        role: 'Teacher',
        teacherId: user._id,
      };
    }

    return null;
  }, [user]);
};
