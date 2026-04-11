import api from './axiosConfig';
import type { Stage, Subject } from './subjectApi';

export type TeacherStudent = {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  stageId?: string | { _id?: string; name?: string };
  status?: string;
  createdAt?: string;
};

/**
 * Get students enrolled in any of the currently logged-in teacher's courses.
 */
export const getMyStudents = async (): Promise<TeacherStudent[]> => {
  const response = await api.get<TeacherStudent[]>('/users/my-students');
  return response.data;
};

/**
 * Get the teacher's assigned stages from their profile (populated).
 * Derives from the AuthUser profile that already returns stageIds as string[].
 * We resolve them via the public stages list on the frontend.
 * This helper is a convenience wrapper re-exporting from subjectApi.
 */
export { getStages as getAssignedStages, getSubjectsByStage as getAssignedSubjects } from './subjectApi';

/** Types re-exported for consumers */
export type { Stage, Subject };
