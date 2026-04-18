import api from './axiosConfig';
import type { Subject, TeacherSchedule } from './subjectApi';

/** Days of the week used in teacher scheduling. */
export type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export type Teacher = {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  bio?: string;
  stageId?: string;
  stageIds?: Array<string | { _id: string; name: string; nameAr?: string; icon?: string; color?: string }>;
  subjectIds?: Array<string | { _id: string; name: string; nameAr?: string; icon?: string; color?: string; description?: string }>;
  status?: string;
  profileImage?: string;
  cvUrl?: string | null;
  availableDays?: string[];
  availableHours?: Record<string, { start?: string; end?: string }>;
  createdAt?: string;
  subjects?: Subject[];
  totalStudentCount?: number;
  schedules?: TeacherSchedule[];
  application?: TeacherApplication | null;
};

export type TeacherApplication = {
  status?: string;
  phone?: string;
  availableDays?: string[];
  zoomLink?: string;
  rejectionReason?: string;
  availableHours?: Record<string, { start?: string; end?: string }>;
};

export type TeacherApplicationRecord = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Pending' | 'Under Evaluation' | 'Accepted' | 'Rejected';
  profileImageUrl?: string;
  availableDays: string[];
  availableHours?: Record<string, { start?: string; end?: string }>;
  cvUrl?: string;
  zoomLink?: string;
  rejectionReason?: string;
  stageId?: string;
  stageIds?: string[];
  subjectIds?: string[];
  gradeIds?: string[];
  teacherId?: string;
};

export type Student = {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  stageId?: string;
  parentEmail?: string;
  subscribeLiveLessons?: boolean;
  profileImage?: string;
  createdAt?: string;
  status?: string;
  subscribedSubjects?: Subject[];
};

export type TeacherInput = {
  name: string;
  email: string;
  phone: string;
  bio?: string;
  subject?: string;
  stageId?: string;
  stageIds?: string[];
  subjectIds?: string[];
  profileImage?: string;
  cvUrl?: string;
  availableDays?: string[];
  availableHours?: Record<string, { start?: string; end?: string }>;
};

export type StudentInput = {
  name: string;
  email: string;
  phone?: string;
  stageId?: string;
  parentEmail?: string;
  subscribeLiveLessons?: boolean;
  status?: string;
  profileImage?: string;
};

export type Payment = {
  _id: string;
  plan: string;
  method: string;
  status: string;
  amount?: number;
  createdAt?: string;
  screenshotUrl?: string;
  studentId?: string | { _id?: string; name?: string; email?: string };
};

export type PaymentSubmission = {
  plan: string;
  amount: number;
  method: string;
  screenshotUrl: string;
};

export type PaymentUploadResponse = {
  url: string;
};

export type TeacherApplicationUploadResponse = {
  url: string;
};

export type TeacherApplicationInput = {
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  profileImageUrl?: string;
  cvUrl?: string;
  stageId?: string;
  stageIds?: string[];
  subjectIds?: string[];
  gradeIds?: string[];
  availableDays?: string[];
  availableHours?: Record<string, { start?: string; end?: string }>;
};

export const getTeachers = async (): Promise<Teacher[]> => {
  const response = await api.get<Teacher[]>('/users/teachers');
  return response.data;
};

export const getTeacherById = async (id: string): Promise<Teacher> => {
  const response = await api.get<Teacher>(`/users/teachers/${id}`);
  return response.data;
};

export const createTeacher = async (data: TeacherInput): Promise<Teacher> => {
  const response = await api.post<Teacher>('/users/teachers', data);
  return response.data;
};

export const updateTeacher = async (id: string, data: TeacherInput): Promise<Teacher> => {
  const response = await api.put<Teacher>(`/users/teachers/${id}`, data);
  return response.data;
};

export const deleteTeacher = async (id: string): Promise<{ message?: string }> => {
  const response = await api.delete<{ message?: string }>(`/users/teachers/${id}`);
  return response.data;
};

export const getStudents = async (): Promise<Student[]> => {
  const response = await api.get<Student[]>('/users/students');
  return response.data;
};

export const getStudentById = async (id: string): Promise<Student> => {
  const response = await api.get<Student>(`/users/students/${id}`);
  return response.data;
};

export const createStudent = async (data: StudentInput): Promise<Student> => {
  const response = await api.post<Student>('/users/students', data);
  return response.data;
};

export const updateStudent = async (id: string, data: StudentInput): Promise<Student> => {
  const response = await api.put<Student>(`/users/students/${id}`, data);
  return response.data;
};

export const deleteStudent = async (id: string): Promise<{ message?: string }> => {
  const response = await api.delete<{ message?: string }>(`/users/students/${id}`);
  return response.data;
};

export const getPayments = async (status?: string): Promise<Payment[]> => {
  const response = await api.get<Payment[]>('/payments', { params: status ? { status } : undefined });
  return response.data;
};

export const approvePayment = async (id: string): Promise<{ message?: string }> => {
  const response = await api.post<{ message?: string }>(`/payments/${id}/approve`);
  return response.data;
};

export const rejectPayment = async (id: string): Promise<{ message?: string }> => {
  const response = await api.post<{ message?: string }>(`/payments/${id}/reject`);
  return response.data;
};

export const getMyPayments = async (): Promise<Payment[]> => {
  const response = await api.get<Payment[]>('/payments/my');
  return response.data;
};

export const submitPayment = async (data: PaymentSubmission): Promise<Payment> => {
  const response = await api.post<Payment>('/payments', data);
  return response.data;
};

export const uploadPaymentProof = async (file: File): Promise<PaymentUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<PaymentUploadResponse>('/payments/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const uploadTeacherApplicationFile = async (file: File): Promise<TeacherApplicationUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<TeacherApplicationUploadResponse>('/teacher-applications/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};


export const getTeacherApplications = async (): Promise<TeacherApplicationRecord[]> => {
  const response = await api.get<TeacherApplicationRecord[]>('/teacher-applications');
  return response.data;
};

export const submitTeacherApplication = async (data: TeacherApplicationInput): Promise<{ message?: string }> => {
  const response = await api.post<{ message?: string }>('/teacher-applications', data);
  return response.data;
};

export const reviewTeacherApplication = async (
  id: string,
  action: 'evaluate' | 'accept' | 'reject',
  payload?: { zoomLink?: string; rejectionReason?: string }
) => {
  const response = await api.post<{ message?: string }>(`/teacher-applications/${id}/review`, { action, ...payload });
  return response.data;
};
