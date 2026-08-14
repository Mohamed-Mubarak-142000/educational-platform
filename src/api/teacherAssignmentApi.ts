import api from './axiosConfig';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export type TeacherAssignment = {
  _id: string;
  teacherId:
    | string
    | {
        _id: string;
        name: string;
        email: string;
        bio?: string;
        profileImage?: string;
        isAvailableForInstantLessons?: boolean;
        instantLessonPricePerHour?: number;
      };
  subjectId: string | { _id: string; name: string; nameAr?: string; icon?: string; color?: string };
  gradeId: string | { _id: string; name: string; nameAr?: string; stageId?: string };
  isPrimary: boolean;
};

export type AssignmentContentLesson = {
  _id: string;
  unitId?: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  order?: number;
  duration?: number;
  videoUrl?: string;
  pdfUrl?: string;
  audioUrl?: string;
  imageUrl?: string;
  modelUrl?: string;
  modelExplanation?: string;
  isPublished?: boolean;
  isFree?: boolean;
  locked?: boolean;
  isUnlocked?: boolean;
};

export type AssignmentContentUnit = {
  _id: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  order?: number;
  price?: number;
  isPublished?: boolean;
  isUnlocked?: boolean;
  lessons: AssignmentContentLesson[];
};

export type AssignmentContent = {
  assignment: TeacherAssignment;
  units: AssignmentContentUnit[];
  access?: { subject: boolean; unitIds: string[] };
};

export type TeacherAssignmentInput = {
  teacherId: string;
  subjectId: string;
  gradeId: string;
  isPrimary?: boolean;
};

// ─────────────────────────────────────────────────────────────────
// CRUD
// ─────────────────────────────────────────────────────────────────

export const getAssignments = async (filters?: {
  teacherId?: string;
  subjectId?: string;
  gradeId?: string;
}): Promise<TeacherAssignment[]> =>
  (await api.get<TeacherAssignment[]>('/teacher-assignments', { params: filters })).data;

export const getMyAssignments = async (): Promise<TeacherAssignment[]> =>
  (await api.get<TeacherAssignment[]>('/teacher-assignments/mine')).data;

export const createAssignment = async (
  data: TeacherAssignmentInput
): Promise<TeacherAssignment> =>
  (await api.post<TeacherAssignment>('/teacher-assignments', data)).data;

export const updateAssignment = async (
  id: string,
  data: { isPrimary: boolean }
): Promise<TeacherAssignment> =>
  (await api.put<TeacherAssignment>(`/teacher-assignments/${id}`, data)).data;

export const deleteAssignment = async (id: string): Promise<{ message: string }> =>
  (await api.delete<{ message: string }>(`/teacher-assignments/${id}`)).data;

// ─────────────────────────────────────────────────────────────────
// Assignment-based unit management (teacher workspace)
// ─────────────────────────────────────────────────────────────────

export type UnitInput = {
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  isPublished?: boolean;
};

export const createUnitForAssignment = async (
  assignmentId: string,
  data: UnitInput
): Promise<{ _id: string; title: string; order: number }> =>
  (await api.post(`/teacher-assignments/${assignmentId}/units`, data)).data;

export const getUnitsForAssignment = async (
  assignmentId: string
): Promise<{ _id: string; title: string; order: number; isPublished: boolean }[]> =>
  (await api.get(`/teacher-assignments/${assignmentId}/units`)).data;

export const getAssignmentContent = async (assignmentId: string): Promise<AssignmentContent> =>
  (await api.get<AssignmentContent>(`/teacher-assignments/${assignmentId}/content`)).data;

// ─────────────────────────────────────────────────────────────────
// Student-facing: get teachers for a given subject+grade
// ─────────────────────────────────────────────────────────────────
export const getPublicAssignments = async (filters: {
  subjectId?: string;
  gradeId?: string;
}): Promise<TeacherAssignment[]> =>
  (await api.get<TeacherAssignment[]>('/teacher-assignments/public', { params: filters })).data;

// Student-facing: get teachers for a given subject+stage
export const getTeachersBySubjectStage = async (filters: {
  subjectId: string;
  stageId: string;
}): Promise<TeacherAssignment[]> =>
  (await api.get<TeacherAssignment[]>('/teacher-assignments/by-subject-stage', { params: filters })).data;

// Public-facing: preview a teacher's units/lessons for a subject+grade —
// first lesson per unit is unlocked, everything else stays locked. No auth required.
export type PublicAssignmentContent = {
  assignment: TeacherAssignment;
  units: AssignmentContentUnit[];
};

export const getPublicAssignmentContent = async (filters: {
  subjectId: string;
  gradeId: string;
  teacherId: string;
}): Promise<PublicAssignmentContent> =>
  (await api.get<PublicAssignmentContent>('/teacher-assignments/public-content', { params: filters })).data;

// Public-facing: full teacher profile — bio, subjects taught, availability,
// scheduled live lessons. No contact/account info, no auth required.
export type PublicTeacherProfile = {
  _id: string;
  name?: string;
  bio?: string;
  profileImage?: string;
  isAvailableForInstantLessons?: boolean;
  instantLessonPricePerHour?: number;
  createdAt?: string;
  availableDays?: string[];
  availableHours?: Record<string, { start?: string; end?: string }>;
  totalStudentCount?: number;
  subjects?: Array<{
    _id: string;
    name: string;
    nameAr?: string;
    icon?: string;
    color?: string;
    description?: string;
    studentCount?: number;
  }>;
  schedules?: Array<{
    _id: string;
    day: string;
    startTime: string;
    endTime: string;
    subjectId?: string | { _id: string; name: string; nameAr?: string };
  }>;
  assignmentStages?: Array<{ _id: string; name: string; nameAr?: string; icon?: string; color?: string }>;
  assignmentGrades?: Array<{ _id: string; name: string; nameAr?: string; stageId?: { _id: string; name: string; nameAr?: string } }>;
  assignmentSubjects?: Array<{ _id: string; name: string; nameAr?: string; icon?: string; color?: string; description?: string }>;
};

export const getPublicTeacherProfile = async (teacherId: string): Promise<PublicTeacherProfile> =>
  (await api.get<PublicTeacherProfile>(`/users/teachers/${teacherId}/public-profile`)).data;

// ─────────────────────────────────────────────────────────────────
// Teacher dashboard stats
// ─────────────────────────────────────────────────────────────────
export type MonthStat = { year: number; month: number; count: number };

export type TeacherDashboardData = {
  studentsCount: number;
  subjectsCount: number;
  stagesCount: number;
  unitsCount: number;
  lessonsCount: number;
  quizzesCount: number;
  studentGrowth: MonthStat[];
  contentStats: MonthStat[];
};

export const getTeacherDashboard = async (): Promise<TeacherDashboardData> =>
  (await api.get<TeacherDashboardData>('/teacher-assignments/dashboard')).data;

// ─────────────────────────────────────────────────────────────────
// Helper: get all teachers for a given subject+grade combo
// ─────────────────────────────────────────────────────────────────
export const getTeachersForSubjectGrade = async (
  subjectId: string,
  gradeId: string
): Promise<TeacherAssignment[]> => getAssignments({ subjectId, gradeId });
