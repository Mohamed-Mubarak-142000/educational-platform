import api from './axiosConfig';

export type Stage = {
  _id: string;
  name: string;
  nameAr?: string;
  description?: string;
  icon?: string;
  color?: string;
  order?: number;
};

export type StageInput = {
  name: string;
  nameAr?: string;
  description?: string;
  icon?: string;
  color?: string;
};

export type Subject = {
  _id: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  icon?: string;
  color?: string;
  category?: string; // 'primary' | 'preparatory' | 'secondary-science' | 'secondary-literary' | 'general'
  suggestedStages?: string[];
  stageId?: string;
  teacherId?: string | { _id?: string; name?: string };
  studentCount?: number;
};

export type SubjectInput = {
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  icon?: string;
  color?: string;
  category?: string;
  stageId?: string;
  teacherId?: string;
};

export type Unit = {
  _id: string;
  title: string;
  description?: string;
  order?: number;
  subjectId?: string;
  price?: number;
  amount?: number;
};

export type UnitInput = {
  title: string;
  description?: string;
  order?: number;
  price?: number;
};

export type Lesson = {
  _id: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  duration?: number;
  order?: number;
  videoUrl?: string;
  pdfUrl?: string;
  audioUrl?: string;
  imageUrl?: string;
  modelUrl?: string;
  modelExplanation?: string;
  unitId?: string;
  teacherId?: string;
  isPublished?: boolean;
  isFree?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type LessonInput = {
  title: string;
  description?: string;
  duration?: number;
  order?: number;
  videoUrl?: string;
  pdfUrl?: string;
  audioUrl?: string;
  imageUrl?: string;
  modelUrl?: string;
  modelExplanation?: string;
};

export type LessonPartMedia = {
  videoUrl?: string;
  pdfUrl?: string;
  imageUrl?: string;
  audioUrl?: string;
  modelUrl?: string;
  modelExplanation?: string;
};

export type LessonPartQuizItem = {
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
};

export type LessonPart = {
  _id: string;
  title: string;
  content?: string;
  media?: LessonPartMedia;
  order?: number;
  quiz?: LessonPartQuizItem[];
};

export type LessonPartInput = {
  title: string;
  content?: string;
  media?: LessonPartMedia;
  order?: number;
  quiz?: LessonPartQuizItem[];
};

export type LessonComment = {
  _id: string;
  text: string;
  createdAt?: string;
  userId?: { _id?: string; name?: string };
};

export type Quiz = {
  _id: string;
  title?: string;
  attachedToId?: string;
  attachedTo?: 'unit' | 'lesson';
};

export type QuizInput = {
  attachedTo: 'unit' | 'lesson';
  attachedToId: string;
  title: string;
};

export type QuizUpdate = {
  title: string;
};

export type QuizQuestion = {
  _id: string;
  text: string;
  options: string[];
  correctAnswer: number;
};

export type QuizQuestionInput = {
  text: string;
  options: string[];
  correctAnswer: 0 | 1 | 2 | 3;
};

export type UnitAvailability = {
  unitId: string;
  status?: 'available' | 'locked' | 'upcoming' | string;
  availableMonth?: number | string;
  availableYear?: number | string;
  note?: string;
};

export type UnitAvailabilityInput = {
  status: 'available' | 'locked' | 'upcoming';
  availableMonth: string;
  availableYear: string;
  note: string;
};

export type QuizGrade = {
  _id?: string;
  quizId: string;
  score: number;
  correctCount?: number;
  totalQuestions?: number;
  completedAt?: string;
};

export type TeacherSchedule = {
  _id: string;
  day: string;
  startTime: string;
  endTime: string;
  subjectName?: string;
  teacherName?: string;
  enrolledStudents?: string[];
  maxStudents: number;
  subjectId?: string | { name?: string };
};

export type TeacherScheduleInput = {
  day: string;
  startTime: string;
  endTime: string;
  subjectId: string;
  maxStudents: number;
};

export type UploadAssetResponse = {
  url: string;
};

// ── Stages ────────────────────────────────────────────────────────
export const getStages = async (): Promise<Stage[]> => (await api.get<Stage[]>('/stages')).data;
export const getStageById = async (id: string): Promise<Stage> => (await api.get<Stage>(`/stages/${id}`)).data;
export const createStage = async (data: StageInput): Promise<Stage> => (await api.post<Stage>('/stages', data)).data;
export const updateStage = async (id: string, data: StageInput): Promise<Stage> => (await api.put<Stage>(`/stages/${id}`, data)).data;
export const deleteStage = async (id: string): Promise<{ message?: string }> => (await api.delete<{ message?: string }>(`/stages/${id}`)).data;

// ── Subjects ──────────────────────────────────────────────────────
export const getSubjects = async (options?: { stageId?: string; stageName?: string }): Promise<Subject[]> => {
  const params = new URLSearchParams();
  if (options?.stageId) params.append('stageId', options.stageId);
  if (options?.stageName) params.append('stageName', options.stageName);
  
  const queryString = params.toString();
  const url = queryString ? `/subjects?${queryString}` : '/subjects';
  
  return (await api.get<Subject[]>(url)).data;
};
export const getSubjectsByStage = async (stageId: string): Promise<Subject[]> => (await api.get<Subject[]>(`/stages/${stageId}/subjects`)).data;
export const getSubjectById = async (id: string): Promise<Subject> => (await api.get<Subject>(`/subjects/${id}`)).data;
export const createSubject = async (data: SubjectInput): Promise<Subject> => (await api.post<Subject>('/subjects', data)).data;
export const updateSubject = async (id: string, data: SubjectInput): Promise<Subject> => (await api.put<Subject>(`/subjects/${id}`, data)).data;
export const deleteSubject = async (id: string): Promise<{ message?: string }> => (await api.delete<{ message?: string }>(`/subjects/${id}`)).data;

// ── Units ─────────────────────────────────────────────────────────
export const getUnitsBySubject = async (subjectId: string): Promise<Unit[]> => (await api.get<Unit[]>(`/subjects/${subjectId}/units`)).data;
export const getUnitById = async (id: string): Promise<Unit> => (await api.get<Unit>(`/units/${id}`)).data;
export const createUnit = async (
  subjectId: string, 
  data: UnitInput, 
  gradeId?: string
): Promise<Unit> => {
  const payload = gradeId ? { ...data, gradeId } : data;
  return (await api.post<Unit>(`/subjects/${subjectId}/units`, payload)).data;
};
export const updateUnit = async (id: string, data: UnitInput): Promise<Unit> => (await api.put<Unit>(`/units/${id}`, data)).data;
export const deleteUnit = async (id: string): Promise<{ message?: string }> => (await api.delete<{ message?: string }>(`/units/${id}`)).data;

// ── Lessons ───────────────────────────────────────────────────────
export const getLessonsByUnit = async (unitId: string): Promise<Lesson[]> => (await api.get<Lesson[]>(`/units/${unitId}/lessons`)).data;
export const getLessonById = async (id: string): Promise<Lesson> => (await api.get<Lesson>(`/lessons/${id}`)).data;
export const createLesson = async (unitId: string, data: LessonInput): Promise<Lesson> => (await api.post<Lesson>(`/units/${unitId}/lessons`, data)).data;
export const updateLesson = async (id: string, data: LessonInput): Promise<Lesson> => (await api.put<Lesson>(`/lessons/${id}`, data)).data;
export const deleteLesson = async (id: string): Promise<{ message?: string }> => (await api.delete<{ message?: string }>(`/lessons/${id}`)).data;

// ── Lesson Media Upload ──────────────────────────────────────────
export const uploadLessonAsset = async (file: File): Promise<UploadAssetResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<UploadAssetResponse>('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// ── Comments ──────────────────────────────────────────────────────
export const getCommentsByLesson = async (lessonId: string): Promise<LessonComment[]> => (await api.get<LessonComment[]>(`/lessons/${lessonId}/comments`)).data;
export const addLessonComment = async (lessonId: string, text: string): Promise<LessonComment> => (await api.post<LessonComment>(`/lessons/${lessonId}/comments`, { text })).data;

// ── Lesson Parts ──────────────────────────────────────────────────
export const getPartsByLesson = async (lessonId: string): Promise<LessonPart[]> => (await api.get<LessonPart[]>(`/lessons/${lessonId}/parts`)).data;
export const createLessonPart = async (lessonId: string, data: LessonPartInput): Promise<LessonPart> => (await api.post<LessonPart>(`/lessons/${lessonId}/parts`, data)).data;
export const deleteLessonPart = async (id: string): Promise<{ message?: string }> => (await api.delete<{ message?: string }>(`/lessons/parts/${id}`)).data;

// ── Unit Quizzes ──────────────────────────────────────────────────
export const getQuizByAttached = async (attachedToId: string): Promise<Quiz | null> => (await api.get<Quiz | null>(`/quizzes/attached/${attachedToId}`)).data;
export const createQuiz = async (data: QuizInput): Promise<Quiz> => (await api.post<Quiz>('/quizzes/unit', data)).data;
export const updateQuiz = async (id: string, data: QuizUpdate): Promise<Quiz> => (await api.put<Quiz>(`/quizzes/unit/${id}`, data)).data;
export const deleteQuiz = async (id: string): Promise<{ message?: string }> => (await api.delete<{ message?: string }>(`/quizzes/unit/${id}`)).data;

// ── MCQ Questions ─────────────────────────────────────────────────
export const getQuestionsByQuiz = async (quizId: string): Promise<QuizQuestion[]> => (await api.get<QuizQuestion[]>(`/quizzes/${quizId}/questions`)).data;
export const createQuestion = async (quizId: string, data: QuizQuestionInput): Promise<QuizQuestion> => (await api.post<QuizQuestion>(`/quizzes/${quizId}/questions`, data)).data;
export const updateQuestion = async (id: string, data: QuizQuestionInput): Promise<QuizQuestion> => (await api.put<QuizQuestion>(`/quizzes/questions/${id}`, data)).data;
export const deleteQuestion = async (id: string): Promise<{ message?: string }> => (await api.delete<{ message?: string }>(`/quizzes/questions/${id}`)).data;

// ── Unit Enrollment ───────────────────────────────────────────────
export const getEnrolledUnitIds = async (studentId: string): Promise<string[]> => (await api.get<string[]>(`/units/enrolled/${studentId}`)).data;
export const enrollInUnit = async (_studentId: string, unitId: string): Promise<{ message?: string }> => (await api.post<{ message?: string }>('/units/enroll', { unitId })).data;

// ── Unit Availability ─────────────────────────────────────────────
export const getUnitAvailability = async (): Promise<UnitAvailability[]> => (await api.get<UnitAvailability[]>('/units/availability')).data;
export const setUnitAvailability = async (unitId: string, data: UnitAvailabilityInput): Promise<UnitAvailability> => (await api.put<UnitAvailability>(`/units/${unitId}/availability`, data)).data;

// ── Quiz Grades ───────────────────────────────────────────────────
export const saveQuizGrade = async (
  _studentId: string,
  quizId: string,
  score: number,
  correctCount: number,
  totalQuestions: number
) => (await api.post<QuizGrade>('/quizzes/grades', { quizId, score, correctCount, totalQuestions })).data;

export const getGradesByStudent = async (studentId: string): Promise<QuizGrade[]> => (await api.get<QuizGrade[]>(`/quizzes/grades/student/${studentId}`)).data;
export const getGradesByQuiz = async (quizId: string): Promise<QuizGrade[]> => (await api.get<QuizGrade[]>(`/quizzes/grades/quiz/${quizId}`)).data;

// ── Teacher Schedules ─────────────────────────────────────────────
export const getSchedulesBySubject = async (subjectId: string): Promise<TeacherSchedule[]> => (await api.get<TeacherSchedule[]>(`/teacher-schedules/subject/${subjectId}`)).data;
export const getSchedulesByTeacher = async (teacherId: string): Promise<TeacherSchedule[]> => (await api.get<TeacherSchedule[]>(`/teacher-schedules/teacher/${teacherId}`)).data;
export const getStudentSchedules = async (_studentId: string): Promise<TeacherSchedule[]> => (await api.get<TeacherSchedule[]>('/teacher-schedules/student')).data;
export const enrollInLiveLesson = async (_studentId: string, scheduleId: string): Promise<TeacherSchedule> => (await api.post<TeacherSchedule>(`/teacher-schedules/${scheduleId}/enroll`, {})).data;
export const createTeacherSchedule = async (data: TeacherScheduleInput): Promise<TeacherSchedule> => (await api.post<TeacherSchedule>('/teacher-schedules', data)).data;
export const updateTeacherSchedule = async (id: string, data: TeacherScheduleInput): Promise<TeacherSchedule> => (await api.put<TeacherSchedule>(`/teacher-schedules/${id}`, data)).data;
export const deleteTeacherSchedule = async (id: string): Promise<{ message?: string }> => (await api.delete<{ message?: string }>(`/teacher-schedules/${id}`)).data;
