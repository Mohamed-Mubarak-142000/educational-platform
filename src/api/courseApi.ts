import api from './axiosConfig';

export type TeacherRef = string | { _id: string; name?: string };
export type StageRef = string | { _id: string; name?: string };
export type SubjectRef = string | { _id: string; name?: string };

export type Course = {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  teacherId?: TeacherRef;
  stageId?: StageRef;
  subjectId?: SubjectRef;
  price?: number;
  createdAt?: string;
};

export type CourseInput = {
  title: string;
  description?: string;
  thumbnail?: string;
  teacherId?: string;
  stageId: string;
  subjectId: string;
  price?: number;
};

export type CourseSection = {
  _id: string;
  title: string;
};

export type Lesson = {
  _id: string;
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

export type LessonComment = {
  _id: string;
  text: string;
  createdAt?: string;
  userId?: { _id?: string; name?: string };
};

export const getCourses = async (params?: { teacherId?: string; stageId?: string; subjectId?: string }): Promise<Course[]> => {
  const response = await api.get<Course[]>('/courses', { params });
  return response.data;
};

export const createCourse = async (data: CourseInput): Promise<Course> => {
  const response = await api.post<Course>('/courses', data);
  return response.data;
};

export const updateCourse = async (id: string, data: CourseInput): Promise<Course> => {
  const response = await api.put<Course>(`/courses/${id}`, data);
  return response.data;
};

export const deleteCourse = async (id: string): Promise<{ message?: string }> => {
  const response = await api.delete<{ message?: string }>(`/courses/${id}`);
  return response.data;
};

export const enrollCourse = async (courseId: string): Promise<{ message?: string }> => {
  const response = await api.post<{ message?: string }>('/courses/enroll', { courseId });
  return response.data;
};

export const getCourseById = async (id: string): Promise<Course> => {
  const response = await api.get<Course>(`/courses/${id}`);
  return response.data;
};

export const getEnrolledCourses = async (): Promise<Course[]> => {
  const response = await api.get<Course[]>('/courses/enrolled');
  return response.data;
};

export const getMyCourses = async (params?: { stageId?: string; subjectId?: string }): Promise<Course[]> => {
  const response = await api.get<Course[]>('/courses/my', { params });
  return response.data;
};

export const getCoursesByTeacher = async (teacherId: string, params?: { stageId?: string; subjectId?: string }): Promise<Course[]> => {
  const response = await api.get<Course[]>(`/courses/teacher/${teacherId}`, { params });
  return response.data;
};

export const getSections = async (courseId: string): Promise<CourseSection[]> => {
  const response = await api.get<CourseSection[]>(`/lessons/sections/${courseId}`);
  return response.data;
};

export const getLessons = async (sectionId: string): Promise<Lesson[]> => {
  const response = await api.get<Lesson[]>(`/lessons/${sectionId}`);
  return response.data;
};

export const getLessonsByCourse = async (courseId: string): Promise<Lesson[]> => {
  const response = await api.get<Lesson[]>(`/lessons/course/${courseId}`);
  return response.data;
};

export const createLessonForCourse = async (courseId: string, data: LessonInput): Promise<Lesson> => {
  const response = await api.post<Lesson>('/lessons', { ...data, courseId });
  return response.data;
};

export const updateLesson = async (id: string, data: Partial<LessonInput>): Promise<Lesson> => {
  const response = await api.put<Lesson>(`/lessons/${id}`, data);
  return response.data;
};

export const deleteLesson = async (id: string): Promise<{ message?: string }> => {
  const response = await api.delete<{ message?: string }>(`/lessons/${id}`);
  return response.data;
};

export const getComments = async (lessonId: string): Promise<LessonComment[]> => {
  const response = await api.get<LessonComment[]>(`/discussions/${lessonId}`);
  return response.data;
};

export const addComment = async (data: { lessonId: string; text: string }): Promise<LessonComment> => {
  const response = await api.post<LessonComment>('/discussions', data);
  return response.data;
};
