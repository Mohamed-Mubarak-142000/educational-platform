import api from './axiosConfig';

export const createExam = async (data: any) => {
  const response = await api.post('/quizzes', data);
  return response.data;
};

export const getExams = async () => {
  const response = await api.get('/quizzes');
  return response.data;
};

export const updateExam = async (id: string, data: any) => {
  const response = await api.put(`/quizzes/${id}`, data);
  return response.data;
};

export const deleteExam = async (id: string) => {
  const response = await api.delete(`/quizzes/${id}`);
  return response.data;
};

export const getExamDetails = async (id: string) => {
  const response = await api.get(`/quizzes/${id}`);
  return response.data;
};

export const getExamResults = async (id: string) => {
  const response = await api.get(`/quizzes/${id}/results`);
  return response.data;
};

export const getExamsByCourse = async (courseId: string) => {
  const response = await api.get(`/quizzes/course/${courseId}`);
  return response.data;
};


/* ── Real API implementation (restore when backend is ready) ────────
import api from './axiosConfig';

export const createExam = async (data: any) => {
  const response = await api.post('/quizzes', data);
  return response.data;
};

export const getExams = async () => {
  const response = await api.get('/quizzes');
  return response.data;
};

export const updateExam = async (id: string, data: any) => {
  const response = await api.put(`/quizzes/${id}`, data);
  return response.data;
};

export const deleteExam = async (id: string) => {
  const response = await api.delete(`/quizzes/${id}`);
  return response.data;
};

export const getExamDetails = async (id: string) => {
  const response = await api.get(`/quizzes/${id}`);
  return response.data;
};

export const getExamResults = async (id: string) => {
  const response = await api.get(`/quizzes/${id}/results`);
  return response.data;
};

export const getExamsByCourse = async (courseId: string) => {
  const response = await api.get(`/quizzes/course/${courseId}`);
  return response.data;
};
─────────────────────────────────────────────────────────────────── */
