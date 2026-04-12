import React, { type ReactNode } from 'react';
import { useRBAC } from '../hooks/useRBAC';

/**
 * RBACGuard Component
 * Conditionally renders children based on role or permission
 * 
 * @example
 * <RBACGuard roles={['Admin']}>
 *   <AdminOnlyContent />
 * </RBACGuard>
 * 
 * @example
 * <RBACGuard permission="canCreateSubjects">
 *   <CreateSubjectButton />
 * </RBACGuard>
 */

interface RBACGuardProps {
  children: ReactNode;
  roles?: Array<'Admin' | 'Teacher' | 'Student'>;
  permission?: keyof ReturnType<typeof useRBAC>;
  fallback?: ReactNode;
}

export const RBACGuard: React.FC<RBACGuardProps> = ({
  children,
  roles,
  permission,
  fallback = null,
}) => {
  const rbac = useRBAC();

  // Check role-based access
  if (roles) {
    const hasRole = roles.includes(rbac.role as 'Admin' | 'Teacher' | 'Student');
    if (!hasRole) return <>{fallback}</>;
  }

  // Check permission-based access
  if (permission) {
    const hasPermission = rbac[permission];
    if (!hasPermission) return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * AdminOnly Component
 * Renders children only for Admin role
 */
export const AdminOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
  children,
  fallback = null,
}) => {
  const { isAdmin } = useRBAC();
  return isAdmin ? <>{children}</> : <>{fallback}</>;
};

/**
 * TeacherOnly Component
 * Renders children only for Teacher role
 */
export const TeacherOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
  children,
  fallback = null,
}) => {
  const { isTeacher } = useRBAC();
  return isTeacher ? <>{children}</> : <>{fallback}</>;
};

/**
 * AdminOrTeacher Component
 * Renders children for Admin or Teacher roles
 */
export const AdminOrTeacher: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
  children,
  fallback = null,
}) => {
  const { isAdminOrTeacher } = useRBAC();
  return isAdminOrTeacher ? <>{children}</> : <>{fallback}</>;
};

/**
 * StudentOnly Component
 * Renders children only for Student role
 */
export const StudentOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
  children,
  fallback = null,
}) => {
  const { isStudent } = useRBAC();
  return isStudent ? <>{children}</> : <>{fallback}</>;
};

/**
 * RoleSwitch Component
 * Renders different content based on user role
 * 
 * @example
 * <RoleSwitch
 *   admin={<AdminDashboard />}
 *   teacher={<TeacherDashboard />}
 *   student={<StudentDashboard />}
 * />
 */
interface RoleSwitchProps {
  admin?: ReactNode;
  teacher?: ReactNode;
  student?: ReactNode;
  fallback?: ReactNode;
}

export const RoleSwitch: React.FC<RoleSwitchProps> = ({
  admin,
  teacher,
  student,
  fallback = null,
}) => {
  const { role } = useRBAC();

  switch (role) {
    case 'Admin':
      return <>{admin || fallback}</>;
    case 'Teacher':
      return <>{teacher || fallback}</>;
    case 'Student':
      return <>{student || fallback}</>;
    default:
      return <>{fallback}</>;
  }
};

/**
 * ConditionalRender Component
 * Renders children based on a permission check function
 * 
 * @example
 * <ConditionalRender condition={(rbac) => rbac.canEditUnit(unit.createdBy)}>
 *   <EditButton />
 * </ConditionalRender>
 */
interface ConditionalRenderProps {
  children: ReactNode;
  condition: (rbac: ReturnType<typeof useRBAC>) => boolean;
  fallback?: ReactNode;
}

export const ConditionalRender: React.FC<ConditionalRenderProps> = ({
  children,
  condition,
  fallback = null,
}) => {
  const rbac = useRBAC();
  const shouldRender = condition(rbac);

  return shouldRender ? <>{children}</> : <>{fallback}</>;
};
