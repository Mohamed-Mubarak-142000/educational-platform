import api from './axiosConfig';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export type Grade = {
  _id: string;
  stageId: string | { _id: string; name: string; nameAr?: string };
  name: string;
  nameAr: string;
  order: number;
};

export type GradeInput = {
  stageId: string;
  name: string;
  nameAr?: string;
  order?: number;
};

export type GradeSubjectSummary = {
  /** _id of the GradeSubject junction row */
  gradeSubjectId: string;
  _id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  color: string;
  order: number;
};

// ─────────────────────────────────────────────────────────────────
// Grade CRUD
// ─────────────────────────────────────────────────────────────────

/** Get all grades; optionally filter by stageId */
export const getGrades = async (stageId?: string): Promise<Grade[]> => {
  const params = stageId ? { stageId } : undefined;
  return (await api.get<Grade[]>('/grades', { params })).data;
};

export const getGradeById = async (id: string): Promise<Grade> =>
  (await api.get<Grade>(`/grades/${id}`)).data;

export const createGrade = async (data: GradeInput): Promise<Grade> =>
  (await api.post<Grade>('/grades', data)).data;

export const updateGrade = async (id: string, data: Partial<GradeInput>): Promise<Grade> =>
  (await api.put<Grade>(`/grades/${id}`, data)).data;

export const deleteGrade = async (id: string): Promise<{ message: string }> =>
  (await api.delete<{ message: string }>(`/grades/${id}`)).data;

// ─────────────────────────────────────────────────────────────────
// Grade ↔ Subject assignments
// ─────────────────────────────────────────────────────────────────

/** Subjects assigned to a grade (returns enriched Subject data) */
export const getSubjectsByGrade = async (gradeId: string): Promise<GradeSubjectSummary[]> =>
  (await api.get<GradeSubjectSummary[]>(`/grades/${gradeId}/subjects`)).data;

/** Assign an existing Subject to a grade */
export const assignSubjectToGrade = async (
  gradeId: string,
  subjectId: string,
  order?: number
): Promise<{ _id: string; gradeId: string; subjectId: string; order: number }> =>
  (
    await api.post(`/grades/${gradeId}/subjects`, { subjectId, order: order ?? 0 })
  ).data;

/** Remove a Subject from a grade */
export const removeSubjectFromGrade = async (
  gradeId: string,
  subjectId: string
): Promise<{ message: string }> =>
  (await api.delete(`/grades/${gradeId}/subjects/${subjectId}`)).data;
