import type { AuthUser } from '../api/authApi';

/**
 * RBAC Helper Functions for Frontend
 * Provides role-based access control utilities
 */

export type UserRole = 'Admin' | 'Teacher' | 'Student';

// ──────────────────────────────────────────────────────────────────────────
// Role Checkers
// ──────────────────────────────────────────────────────────────────────────

export const isAdmin = (user: AuthUser | null): boolean => {
  return user?.role === 'Admin';
};

export const isTeacher = (user: AuthUser | null): boolean => {
  return user?.role === 'Teacher';
};

export const isStudent = (user: AuthUser | null): boolean => {
  return user?.role === 'Student';
};

export const isAdminOrTeacher = (user: AuthUser | null): boolean => {
  return isAdmin(user) || isTeacher(user);
};

// ──────────────────────────────────────────────────────────────────────────
// Permission Checkers
// ──────────────────────────────────────────────────────────────────────────

/**
 * Can manage stages (create, edit, delete)
 * Only Admin can manage stages
 */
export const canManageStages = (user: AuthUser | null): boolean => {
  return isAdmin(user);
};

/**
 * Can manage grades (create, edit, delete)
 * Only Admin can manage grades
 */
export const canManageGrades = (user: AuthUser | null): boolean => {
  return isAdmin(user);
};

/**
 * Can create subjects
 * Only Admin can create subjects (Teachers can view their assigned ones)
 */
export const canCreateSubjects = (user: AuthUser | null): boolean => {
  return isAdmin(user);
};

/**
 * Can view subject (based on assignment)
 * Admin: all subjects
 * Teacher: only assigned subjects (checked via API filter)
 * Student: all subjects
 */
export const canViewSubject = (
  user: AuthUser | null,
  _subjectId?: string
): boolean => {
  if (!user) return false;
  
  if (isAdmin(user)) return true;
  
  if (isTeacher(user)) {
    // Teachers see filtered subjects from API
    // This is just a UI check; backend enforces real access
    return true; // API will filter appropriately
  }
  
  if (isStudent(user)) return true;
  
  return false;
};

/**
 * Can edit subject
 * Only Admin can edit subjects
 */
export const canEditSubject = (
  user: AuthUser | null,
  _subjectId?: string
): boolean => {
  return isAdmin(user);
};

/**
 * Can create units within a subject/grade
 * Teacher ONLY — Admin is blocked by teacherOnly backend middleware
 */
export const canCreateUnits = (
  user: AuthUser | null,
  _subjectId?: string,
  _gradeId?: string
): boolean => {
  // Admin explicitly cannot create units (backend: teacherOnly)
  return isTeacher(user);
};

/**
 * Can edit unit
 * Teacher ONLY — and only units they created
 * Admin is blocked by teacherOnly backend middleware
 */
export const canEditUnit = (
  user: AuthUser | null,
  unitCreatedBy?: string
): boolean => {
  if (!user) return false;
  if (isTeacher(user) && unitCreatedBy) {
    return user._id === unitCreatedBy;
  }
  return false;
};

/**
 * Can create lessons within a unit
 * Teacher ONLY — Admin is blocked by teacherOnly backend middleware
 */
export const canCreateLessons = (
  user: AuthUser | null,
  _unitCreatedBy?: string
): boolean => {
  // Admin explicitly cannot create lessons (backend: teacherOnly)
  return isTeacher(user);
};

/**
 * Can edit lesson
 * Teacher ONLY — and only lessons they created
 * Admin is blocked by teacherOnly backend middleware
 */
export const canEditLesson = (
  user: AuthUser | null,
  lessonTeacherId?: string
): boolean => {
  if (!user) return false;
  if (isTeacher(user) && lessonTeacherId) {
    return user._id === lessonTeacherId;
  }
  return false;
};

/**
 * Can delete resource
 * Admin: yes for subjects (their domain)
 * Teacher: only their own units/lessons
 */
export const canDelete = (
  user: AuthUser | null,
  createdBy?: string
): boolean => {
  if (!user) return false;
  if (isTeacher(user) && createdBy) {
    return user._id === createdBy;
  }
  return false;
};

/**
 * Can manage users (teachers, students)
 * Only Admin
 */
export const canManageUsers = (user: AuthUser | null): boolean => {
  return isAdmin(user);
};

/**
 * Can view students
 * Admin: all students
 * Teacher: students in their subjects (via enrollments)
 * Student: no
 */
export const canViewStudents = (user: AuthUser | null): boolean => {
  return isAdmin(user) || isTeacher(user);
};

/**
 * Can manage teacher assignments
 * Only Admin
 */
export const canManageTeacherAssignments = (user: AuthUser | null): boolean => {
  return isAdmin(user);
};

// ──────────────────────────────────────────────────────────────────────────
// UI Helper Functions
// ──────────────────────────────────────────────────────────────────────────

/**
 * Get allowed actions for a resource based on user role
 */
export const getAllowedActions = (
  user: AuthUser | null,
  resourceType: 'stage' | 'grade' | 'subject' | 'unit' | 'lesson',
  createdBy?: string
) => {
  const actions = {
    create: false,
    edit: false,
    delete: false,
    view: true, // Everyone can view (backend filters appropriately)
  };

  if (!user) return actions;

  switch (resourceType) {
    case 'stage':
    case 'grade':
      if (isAdmin(user)) {
        actions.create = true;
        actions.edit = true;
        actions.delete = true;
      }
      break;

    case 'subject':
      if (isAdmin(user)) {
        actions.create = true;
        actions.edit = true;
        actions.delete = true;
      }
      // Teachers can view but not create/edit/delete subjects
      break;

    case 'unit':
      if (isTeacher(user)) {
        actions.create = true;
        actions.edit = createdBy === user._id;
        actions.delete = createdBy === user._id;
      }
      // Admin: no unit write access (teacherOnly backend)
      break;

    case 'lesson':
      if (isTeacher(user)) {
        actions.create = true;
        actions.edit = createdBy === user._id;
        actions.delete = createdBy === user._id;
      }
      // Admin: no lesson write access (teacherOnly backend)
      break;
  }

  return actions;
};

/**
 * Get user role display name
 */
export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames = {
    Admin: 'Administrator',
    Teacher: 'Teacher',
    Student: 'Student',
  };
  return roleNames[role] || role;
};

/**
 * Check if user can access admin panel
 */
export const canAccessAdminPanel = (user: AuthUser | null): boolean => {
  return isAdminOrTeacher(user);
};

/**
 * Get dashboard route based on role
 */
export const getDashboardRoute = (user: AuthUser | null): string => {
  if (!user) return '/';
  
  if (isAdmin(user)) return '/admin/dashboard';
  if (isTeacher(user)) return '/teacher/dashboard';
  if (isStudent(user)) return '/student/dashboard';
  
  return '/';
};
