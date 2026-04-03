// ─── MOCK MODE ────────────────────────────────────────────────────
// Backend is temporarily unavailable (MongooseServerSelectionError).
// Exporting from the mock layer instead of the real API.
// To restore the real API: remove the export line below and uncomment
// the implementation that follows.
export * from './mock/authApi';

/* ── Real API implementation (restore when backend is ready) ────────
import api from './axiosConfig';

export const login = async (data: any) => {
  const response = await api.post('/users/login', data);
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/users/logout');
  return response.data;
};

export const register = async (data: any) => {
  const response = await api.post('/users/register', data);
  return response.data;
};

export const verifyOTP = async (data: any) => {
  const response = await api.post('/users/verify', data);
  return response.data;
};

export const resendOTP = async (data: any) => {
  const response = await api.post('/users/resend-otp', data);
  return response.data;
};

export const forgotPassword = async (data: any) => {
  const response = await api.post('/users/forgot-password', data);
  return response.data;
};

export const resetPassword = async (data: any) => {
  const response = await api.post('/users/reset-password', data);
  return response.data;
};

export const changePassword = async (data: any) => {
  const response = await api.post('/users/change-password', data);
  return response.data;
};

export const createTeacher = async (data: any) => {
  const response = await api.post('/users/teachers', data);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};
─────────────────────────────────────────────────────────────────── */
