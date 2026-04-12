import api from './axiosConfig';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export type LessonProgress = {
  _id: string;
  lessonId: string | { _id: string; title: string; unitId: string };
  completed: boolean;
  watchedPercentage: number;
  completedPartIds: string[];
  lastAccessedAt: string;
};

export type UnitProgress = {
  _id?: string;
  unitId: string | { _id: string; title: string; subjectId: string; gradeId: string };
  completedLessonIds: string[];
  totalLessons: number;
  percentage: number;
  lastAccessedAt?: string;
};

export type SubjectProgress = {
  _id?: string;
  subjectId: string | { _id: string; name: string; nameAr: string; icon: string; color: string };
  gradeId: string | { _id: string; name: string; nameAr: string };
  completedUnitIds: string[];
  totalUnits: number;
  percentage: number;
  lastAccessedAt?: string;
};

export type OverallProgress = {
  lessonProgresses: LessonProgress[];
  unitProgresses: UnitProgress[];
  subjectProgresses: SubjectProgress[];
};

export type UpdateLessonProgressInput = {
  lessonId: string;
  watchedPercentage: number;
  completedPartId?: string;
};

// ─────────────────────────────────────────────────────────────────
// API calls
// ─────────────────────────────────────────────────────────────────

/** Upsert lesson progress (call whenever the student watches/completes a lesson) */
export const updateLessonProgress = async (
  data: UpdateLessonProgressInput
): Promise<LessonProgress> =>
  (await api.post<LessonProgress>('/progress/lesson', data)).data;

/** Get all progress for the logged-in student */
export const getMyProgress = async (): Promise<OverallProgress> =>
  (await api.get<OverallProgress>('/progress')).data;

/** Get unit-level progress */
export const getUnitProgress = async (unitId: string): Promise<UnitProgress> =>
  (await api.get<UnitProgress>(`/progress/unit/${unitId}`)).data;

/** Get subject-level progress for a specific grade context */
export const getSubjectProgress = async (
  subjectId: string,
  gradeId: string
): Promise<SubjectProgress> =>
  (await api.get<SubjectProgress>(`/progress/subject/${subjectId}/grade/${gradeId}`)).data;

/** Admin/Teacher: all students' progress for a unit */
export const getUnitProgressAll = async (
  unitId: string
): Promise<(UnitProgress & { studentId: { _id: string; name: string; email: string } })[]> =>
  (await api.get(`/progress/unit/${unitId}/all`)).data;
