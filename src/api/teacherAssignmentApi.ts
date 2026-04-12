import api from './axiosConfig';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export type TeacherAssignment = {
  _id: string;
  teacherId: string | { _id: string; name: string; email: string; bio?: string; profileImage?: string };
  subjectId: string | { _id: string; name: string; nameAr?: string; icon?: string; color?: string };
  gradeId: string | { _id: string; name: string; nameAr?: string; stageId?: string };
  isPrimary: boolean;
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
// Student-facing: get teachers for a given subject+grade
// ─────────────────────────────────────────────────────────────────
export const getPublicAssignments = async (filters: {
  subjectId?: string;
  gradeId?: string;
}): Promise<TeacherAssignment[]> =>
  (await api.get<TeacherAssignment[]>('/teacher-assignments/public', { params: filters })).data;

// ─────────────────────────────────────────────────────────────────
// Helper: get all teachers for a given subject+grade combo
// ─────────────────────────────────────────────────────────────────
export const getTeachersForSubjectGrade = async (
  subjectId: string,
  gradeId: string
): Promise<TeacherAssignment[]> => getAssignments({ subjectId, gradeId });
