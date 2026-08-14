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

export type StudentSubscriptionEntry = {
  student: {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
    profileImage?: string;
    status?: string;
    joinedAt?: string;
  };
  subscription: {
    plan: string;
    status: string;
    startDate?: string;
    endDate?: string;
  } | null;
  payment: {
    amount: number;
    method: string;
    status: string;
    submittedAt?: string;
  } | null;
  enrolledUnits: { unitId: string; title: string }[];
};

export type MyUnitStudentsResponse = {
  totalStudents: number;
  students: StudentSubscriptionEntry[];
};

export type MyStudentsListParams = {
  search?: string;
  status?: string;
  stageIds?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

/**
 * Get students enrolled in any of the currently logged-in teacher's courses.
 */
export const getMyStudents = async (params?: MyStudentsListParams): Promise<TeacherStudent[]> => {
  const response = await api.get<TeacherStudent[]>('/users/my-students', {
    params: {
      search: params?.search || undefined,
      status: params?.status || undefined,
      stageIds: params?.stageIds?.length ? params.stageIds.join(',') : undefined,
      sortBy: params?.sortBy,
      sortOrder: params?.sortOrder,
    },
  });
  return response.data;
};

/**
 * Get students enrolled in teacher's units — includes subscription and payment info.
 */
export const getMyUnitStudents = async (): Promise<MyUnitStudentsResponse> => {
  const response = await api.get<MyUnitStudentsResponse>('/users/my-unit-students');
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
