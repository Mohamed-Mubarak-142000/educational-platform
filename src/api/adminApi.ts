import api from './axiosConfig';

export const getTeachers = async () => {
  const response = await api.get('/users/teachers');
  return response.data;
};

export const createTeacher = async (data: any) => {
  const response = await api.post('/users/teachers', data);
  return response.data;
};

export const updateTeacher = async (id: string, data: any) => {
  const response = await api.put(`/users/teachers/${id}`, data);
  return response.data;
};

export const deleteTeacher = async (id: string) => {
  const response = await api.delete(`/users/teachers/${id}`);
  return response.data;
};

export const getStudents = async () => {
  const response = await api.get('/users/students');
  return response.data;
};

export const createStudent = async (data: any) => {
  const response = await api.post('/users/students', data);
  return response.data;
};

export const updateStudent = async (id: string, data: any) => {
  const response = await api.put(`/users/students/${id}`, data);
  return response.data;
};

export const deleteStudent = async (id: string) => {
  const response = await api.delete(`/users/students/${id}`);
  return response.data;
};

export const getPayments = async (status?: string) => {
  const response = await api.get('/payments', { params: status ? { status } : undefined });
  return response.data;
};

export const approvePayment = async (id: string) => {
  const response = await api.post(`/payments/${id}/approve`);
  return response.data;
};

export const rejectPayment = async (id: string) => {
  const response = await api.post(`/payments/${id}/reject`);
  return response.data;
};

export const getMyPayments = async () => {
  const response = await api.get('/payments/my');
  return response.data;
};

export const submitPayment = async (data: any) => {
  const response = await api.post('/payments', data);
  return response.data;
};

export const uploadPaymentProof = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/payments/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getMySubscription = async () => {
  const response = await api.get('/subscriptions/me');
  return response.data;
};

export const getSubscriptions = async () => {
  const response = await api.get('/subscriptions');
  return response.data;
};

export const activateSubscription = async (data: any) => {
  const response = await api.post('/subscriptions/activate', data);
  return response.data;
};

export const cancelSubscription = async (data: any) => {
  const response = await api.post('/subscriptions/cancel', data);
  return response.data;
};

export const getTeacherApplications = async () => {
  const response = await api.get('/teacher-applications');
  return response.data;
};

export const submitTeacherApplication = async (data: any) => {
  const response = await api.post('/teacher-applications', data);
  return response.data;
};

export const reviewTeacherApplication = async (
  id: string,
  action: 'accept' | 'reject',
  payload?: { zoomLink?: string; rejectionReason?: string }
) => {
  const response = await api.post(`/teacher-applications/${id}/review`, { action, ...payload });
  return response.data;
};


/* ── Real API implementation (restore when backend is ready) ────────
import api from './axiosConfig';

export const getTeachers = async () => {
  const response = await api.get('/users/teachers');
  return response.data;
};

export const createTeacher = async (data: any) => {
  const response = await api.post('/users/teachers', data);
  return response.data;
};

export const updateTeacher = async (id: string, data: any) => {
  const response = await api.put(`/users/teachers/${id}`, data);
  return response.data;
};

export const deleteTeacher = async (id: string) => {
  const response = await api.delete(`/users/teachers/${id}`);
  return response.data;
};

export const getStudents = async () => {
  const response = await api.get('/users/students');
  return response.data;
};

export const createStudent = async (data: any) => {
  const response = await api.post('/users/students', data);
  return response.data;
};

export const updateStudent = async (id: string, data: any) => {
  const response = await api.put(`/users/students/${id}`, data);
  return response.data;
};

export const deleteStudent = async (id: string) => {
  const response = await api.delete(`/users/students/${id}`);
  return response.data;
};

export const getPayments = async (status?: string) => {
  const response = await api.get('/payments', { params: status ? { status } : undefined });
  return response.data;
};

export const approvePayment = async (id: string) => {
  const response = await api.post(`/payments/${id}/approve`);
  return response.data;
};

export const rejectPayment = async (id: string) => {
  const response = await api.post(`/payments/${id}/reject`);
  return response.data;
};

export const getMyPayments = async () => {
  const response = await api.get('/payments/my');
  return response.data;
};

export const submitPayment = async (data: any) => {
  const response = await api.post('/payments', data);
  return response.data;
};

export const uploadPaymentProof = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/payments/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getMySubscription = async () => {
  const response = await api.get('/subscriptions/me');
  return response.data;
};

export const getSubscriptions = async () => {
  const response = await api.get('/subscriptions');
  return response.data;
};

export const activateSubscription = async (data: any) => {
  const response = await api.post('/subscriptions/activate', data);
  return response.data;
};

export const cancelSubscription = async (data: any) => {
  const response = await api.post('/subscriptions/cancel', data);
  return response.data;
};
─────────────────────────────────────────────────────────────────── */
