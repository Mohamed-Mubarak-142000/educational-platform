import api from './axiosConfig';

export const getCourses = async () => {
  const response = await api.get('/courses');
  return response.data;
};

export const createCourse = async (data: any) => {
  const response = await api.post('/courses', data);
  return response.data;
};

export const updateCourse = async (id: string, data: any) => {
  const response = await api.put(`/courses/${id}`, data);
  return response.data;
};

export const deleteCourse = async (id: string) => {
  const response = await api.delete(`/courses/${id}`);
  return response.data;
};

export const enrollCourse = async (courseId: string) => {
  const response = await api.post('/courses/enroll', { courseId });
  return response.data;
};

export const getCourseById = async (id: string) => {
  const response = await api.get(`/courses/${id}`);
  return response.data;
};

export const getEnrolledCourses = async () => {
  const response = await api.get('/courses/enrolled');
  return response.data;
};

export const getMyCourses = async () => {
  const response = await api.get('/courses/my');
  return response.data;
};

export const getCoursesByTeacher = async (teacherId: string) => {
  const response = await api.get(`/courses/teacher/${teacherId}`);
  return response.data;
};

export const getSections = async (courseId: string) => {
  const response = await api.get(`/lessons/sections/${courseId}`);
  return response.data;
};

export const getLessons = async (sectionId: string) => {
  const response = await api.get(`/lessons/${sectionId}`);
  return response.data;
};

export const getComments = async (lessonId: string) => {
  const response = await api.get(`/discussions/${lessonId}`);
  return response.data;
};

export const addComment = async (data: { lessonId: string; text: string }) => {
  const response = await api.post('/discussions', data);
  return response.data;
};


/* ── Real API implementation (restore when backend is ready) ────────
import api from './axiosConfig';

export const getCourses = async () => {
  const response = await api.get('/courses');
  return response.data;
};

export const createCourse = async (data: any) => {
  const response = await api.post('/courses', data);
  return response.data;
};

export const updateCourse = async (id: string, data: any) => {
  const response = await api.put(`/courses/${id}`, data);
  return response.data;
};

export const deleteCourse = async (id: string) => {
  const response = await api.delete(`/courses/${id}`);
  return response.data;
};

export const enrollCourse = async (courseId: string) => {
  const response = await api.post('/courses/enroll', { courseId });
  return response.data;
};

export const getCourseById = async (id: string) => {
  const response = await api.get(`/courses/${id}`);
  return response.data;
};

export const getEnrolledCourses = async () => {
  const response = await api.get('/courses/enrolled');
  return response.data;
};

export const getMyCourses = async () => {
  const response = await api.get('/courses/my');
  return response.data;
};

export const getCoursesByTeacher = async (teacherId: string) => {
  const response = await api.get(`/courses/teacher/${teacherId}`);
  return response.data;
};

export const getSections = async (courseId: string) => {
  const response = await api.get(`/lessons/sections/${courseId}`);
  return response.data;
};

export const getLessons = async (sectionId: string) => {
  const response = await api.get(`/lessons/${sectionId}`);
  return response.data;
};

export const getComments = async (lessonId: string) => {
  const response = await api.get(`/discussions/${lessonId}`);
  return response.data;
};

export const addComment = async (data: { lessonId: string; text: string }) => {
  const response = await api.post('/discussions', data);
  return response.data;
};
─────────────────────────────────────────────────────────────────── */
