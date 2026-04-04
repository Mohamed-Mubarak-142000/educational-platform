import api from './axiosConfig';

// ── Stages ────────────────────────────────────────────────────────
export const getStages = async () => (await api.get('/stages')).data;
export const getStageById = async (id: string) => (await api.get(`/stages/${id}`)).data;
export const createStage = async (data: any) => (await api.post('/stages', data)).data;
export const updateStage = async (id: string, data: any) => (await api.put(`/stages/${id}`, data)).data;
export const deleteStage = async (id: string) => (await api.delete(`/stages/${id}`)).data;

// ── Subjects ──────────────────────────────────────────────────────
export const getSubjects = async () => (await api.get('/subjects')).data;
export const getSubjectsByStage = async (stageId: string) => (await api.get(`/stages/${stageId}/subjects`)).data;
export const getSubjectById = async (id: string) => (await api.get(`/subjects/${id}`)).data;
export const createSubject = async (data: any) => (await api.post('/subjects', data)).data;
export const updateSubject = async (id: string, data: any) => (await api.put(`/subjects/${id}`, data)).data;
export const deleteSubject = async (id: string) => (await api.delete(`/subjects/${id}`)).data;

// ── Units ─────────────────────────────────────────────────────────
export const getUnitsBySubject = async (subjectId: string) => (await api.get(`/subjects/${subjectId}/units`)).data;
export const getUnitById = async (id: string) => (await api.get(`/units/${id}`)).data;
export const createUnit = async (subjectId: string, data: any) => (await api.post(`/subjects/${subjectId}/units`, data)).data;
export const updateUnit = async (id: string, data: any) => (await api.put(`/units/${id}`, data)).data;
export const deleteUnit = async (id: string) => (await api.delete(`/units/${id}`)).data;

// ── Lessons ───────────────────────────────────────────────────────
export const getLessonsByUnit = async (unitId: string) => (await api.get(`/units/${unitId}/lessons`)).data;
export const getLessonById = async (id: string) => (await api.get(`/lessons/${id}`)).data;
export const createLesson = async (unitId: string, data: any) => (await api.post(`/units/${unitId}/lessons`, data)).data;
export const updateLesson = async (id: string, data: any) => (await api.put(`/lessons/${id}`, data)).data;
export const deleteLesson = async (id: string) => (await api.delete(`/lessons/${id}`)).data;

// ── Comments ──────────────────────────────────────────────────────
export const getCommentsByLesson = async (lessonId: string) => (await api.get(`/lessons/${lessonId}/comments`)).data;
export const addLessonComment = async (lessonId: string, text: string) => (await api.post(`/lessons/${lessonId}/comments`, { text })).data;

// ── Lesson Parts ──────────────────────────────────────────────────
export const getPartsByLesson = async (lessonId: string) => (await api.get(`/lessons/${lessonId}/parts`)).data;
export const createLessonPart = async (lessonId: string, data: any) => (await api.post(`/lessons/${lessonId}/parts`, data)).data;
export const deleteLessonPart = async (id: string) => (await api.delete(`/lessons/parts/${id}`)).data;

// ── Unit Quizzes ──────────────────────────────────────────────────
export const getQuizByAttached = async (attachedToId: string) => (await api.get(`/quizzes/attached/${attachedToId}`)).data;
export const createQuiz = async (data: any) => (await api.post('/quizzes/unit', data)).data;
export const updateQuiz = async (id: string, data: any) => (await api.put(`/quizzes/unit/${id}`, data)).data;
export const deleteQuiz = async (id: string) => (await api.delete(`/quizzes/unit/${id}`)).data;

// ── MCQ Questions ─────────────────────────────────────────────────
export const getQuestionsByQuiz = async (quizId: string) => (await api.get(`/quizzes/${quizId}/questions`)).data;
export const createQuestion = async (quizId: string, data: any) => (await api.post(`/quizzes/${quizId}/questions`, data)).data;
export const updateQuestion = async (id: string, data: any) => (await api.put(`/quizzes/questions/${id}`, data)).data;
export const deleteQuestion = async (id: string) => (await api.delete(`/quizzes/questions/${id}`)).data;

// ── Unit Enrollment ───────────────────────────────────────────────
export const getEnrolledUnitIds = async (studentId: string) => (await api.get(`/units/enrolled/${studentId}`)).data;
export const enrollInUnit = async (_studentId: string, unitId: string) => (await api.post('/units/enroll', { unitId })).data;

// ── Unit Availability ─────────────────────────────────────────────
export const getUnitAvailability = async () => (await api.get('/units/availability')).data;
export const setUnitAvailability = async (unitId: string, data: any) => (await api.put(`/units/${unitId}/availability`, data)).data;

// ── Quiz Grades ───────────────────────────────────────────────────
export const saveQuizGrade = async (
  _studentId: string,
  quizId: string,
  score: number,
  correctCount: number,
  totalQuestions: number
) => (await api.post('/quizzes/grades', { quizId, score, correctCount, totalQuestions })).data;

export const getGradesByStudent = async (studentId: string) => (await api.get(`/quizzes/grades/student/${studentId}`)).data;
export const getGradesByQuiz = async (quizId: string) => (await api.get(`/quizzes/grades/quiz/${quizId}`)).data;

// ── Teacher Schedules ─────────────────────────────────────────────
export const getSchedulesBySubject = async (subjectId: string) => (await api.get(`/teacher-schedules/subject/${subjectId}`)).data;
export const getSchedulesByTeacher = async (teacherId: string) => (await api.get(`/teacher-schedules/teacher/${teacherId}`)).data;
export const getStudentSchedules = async (_studentId: string) => (await api.get('/teacher-schedules/student')).data;
export const enrollInLiveLesson = async (_studentId: string, scheduleId: string) => (await api.post(`/teacher-schedules/${scheduleId}/enroll`, {})).data;
export const createTeacherSchedule = async (data: any) => (await api.post('/teacher-schedules', data)).data;
export const updateTeacherSchedule = async (id: string, data: any) => (await api.put(`/teacher-schedules/${id}`, data)).data;
export const deleteTeacherSchedule = async (id: string) => (await api.delete(`/teacher-schedules/${id}`)).data;


/* ── Real API implementation (restore when backend is ready) ────────
import api from './axiosConfig';

// Stages
export const getStages = async () => (await api.get('/stages')).data;
export const getStageById = async (id: string) => (await api.get(`/stages/${id}`)).data;
export const createStage = async (data: any) => (await api.post('/stages', data)).data;
export const updateStage = async (id: string, data: any) => (await api.put(`/stages/${id}`, data)).data;
export const deleteStage = async (id: string) => (await api.delete(`/stages/${id}`)).data;

// Subjects
export const getSubjects = async () => (await api.get('/subjects')).data;
export const getSubjectsByStage = async (stageId: string) => (await api.get(`/stages/${stageId}/subjects`)).data;
export const getSubjectById = async (id: string) => (await api.get(`/subjects/${id}`)).data;
export const createSubject = async (data: any) => (await api.post('/subjects', data)).data;
export const updateSubject = async (id: string, data: any) => (await api.put(`/subjects/${id}`, data)).data;
export const deleteSubject = async (id: string) => (await api.delete(`/subjects/${id}`)).data;

// Units
export const getUnitsBySubject = async (subjectId: string) => (await api.get(`/subjects/${subjectId}/units`)).data;
export const getUnitById = async (id: string) => (await api.get(`/units/${id}`)).data;
export const createUnit = async (subjectId: string, data: any) => (await api.post(`/subjects/${subjectId}/units`, data)).data;
export const updateUnit = async (id: string, data: any) => (await api.put(`/units/${id}`, data)).data;
export const deleteUnit = async (id: string) => (await api.delete(`/units/${id}`)).data;

// Lessons
export const getLessonsByUnit = async (unitId: string) => (await api.get(`/units/${unitId}/lessons`)).data;
export const getLessonById = async (id: string) => (await api.get(`/lessons/${id}`)).data;
export const createLesson = async (unitId: string, data: any) => (await api.post(`/units/${unitId}/lessons`, data)).data;
export const updateLesson = async (id: string, data: any) => (await api.put(`/lessons/${id}`, data)).data;
export const deleteLesson = async (id: string) => (await api.delete(`/lessons/${id}`)).data;

// Comments
export const getCommentsByLesson = async (lessonId: string) => (await api.get(`/lessons/${lessonId}/comments`)).data;
export const addLessonComment = async (lessonId: string, text: string) => (await api.post(`/lessons/${lessonId}/comments`, { text })).data;
─────────────────────────────────────────────────────────────────── */


/* ── Real API implementation (restore when backend is ready) ────────
import api from './axiosConfig';

// Subjects
export const getSubjects = async () => (await api.get('/subjects')).data;
export const getSubjectById = async (id: string) => (await api.get(`/subjects/${id}`)).data;
export const createSubject = async (data: any) => (await api.post('/subjects', data)).data;
export const updateSubject = async (id: string, data: any) => (await api.put(`/subjects/${id}`, data)).data;
export const deleteSubject = async (id: string) => (await api.delete(`/subjects/${id}`)).data;

// Units
export const getUnitsBySubject = async (subjectId: string) => (await api.get(`/subjects/${subjectId}/units`)).data;
export const getUnitById = async (id: string) => (await api.get(`/units/${id}`)).data;
export const createUnit = async (subjectId: string, data: any) => (await api.post(`/subjects/${subjectId}/units`, data)).data;
export const updateUnit = async (id: string, data: any) => (await api.put(`/units/${id}`, data)).data;
export const deleteUnit = async (id: string) => (await api.delete(`/units/${id}`)).data;

// Lessons
export const getLessonsByUnit = async (unitId: string) => (await api.get(`/units/${unitId}/lessons`)).data;
export const getLessonById = async (id: string) => (await api.get(`/lessons/${id}`)).data;
export const createLesson = async (unitId: string, data: any) => (await api.post(`/units/${unitId}/lessons`, data)).data;
export const updateLesson = async (id: string, data: any) => (await api.put(`/lessons/${id}`, data)).data;
export const deleteLesson = async (id: string) => (await api.delete(`/lessons/${id}`)).data;

// Comments
export const getCommentsByLesson = async (lessonId: string) => (await api.get(`/lessons/${lessonId}/comments`)).data;
export const addLessonComment = async (lessonId: string, text: string) => (await api.post(`/lessons/${lessonId}/comments`, { text })).data;
─────────────────────────────────────────────────────────────────── */
