import api from './axiosConfig';

export type Exam = {
  _id: string;
  title: string;
  timeLimit: number;
  lessonId?: string | { _id?: string };
  courseId?: string;
  createdAt?: string;
};

export type ExamInput = {
  title: string;
  timeLimit: number;
  lessonId?: string;
  courseId?: string;
};

export type ExamResult = {
  _id: string;
  score: number;
  studentId?: { _id?: string; name?: string; email?: string };
};

export const createExam = async (data: ExamInput): Promise<Exam> => {
  const response = await api.post<Exam>('/quizzes', data);
  return response.data;
};

export const getExams = async (): Promise<Exam[]> => {
  const response = await api.get<Exam[]>('/quizzes');
  return response.data;
};

export const getMyExams = async (): Promise<Exam[]> => {
  const response = await api.get<Exam[]>('/quizzes/my');
  return response.data;
};

export const updateExam = async (id: string, data: ExamInput): Promise<Exam> => {
  const response = await api.put<Exam>(`/quizzes/${id}`, data);
  return response.data;
};

export const deleteExam = async (id: string): Promise<{ message?: string }> => {
  const response = await api.delete<{ message?: string }>(`/quizzes/${id}`);
  return response.data;
};

export const getExamDetails = async (id: string): Promise<Exam> => {
  const response = await api.get<Exam>(`/quizzes/${id}`);
  return response.data;
};

export const getExamResults = async (id: string): Promise<ExamResult[]> => {
  const response = await api.get<ExamResult[]>(`/quizzes/${id}/results`);
  return response.data;
};

export const getExamsByCourse = async (courseId: string): Promise<Exam[]> => {
  const response = await api.get<Exam[]>(`/quizzes/course/${courseId}`);
  return response.data;
};
