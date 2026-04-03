// ─────────────────────────────────────────────────────────────────
// Subject API — Stages → Subjects → Units → Lessons hierarchy
// Using mock layer while backend is unavailable.
// To switch to real API: remove the export line and uncomment below.
// ─────────────────────────────────────────────────────────────────
export * from './mock/subjectApi';

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
