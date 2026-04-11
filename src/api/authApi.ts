import api from './axiosConfig';

export type AuthUser = {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
  stageId?: string;
  stageIds?: string[];
  subjectIds?: string[];
  phone?: string;
  avatarUrl?: string;
  mustChangePassword?: boolean;
};

export type AuthTokenResponse = {
  token: string;
  user?: AuthUser;
  mustChangePassword?: boolean;
  role?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  parentEmail?: string;
  stageId?: string;
  subscribeLiveLessons?: boolean;
};

export type VerifyOtpPayload = {
  email: string;
  otp: string;
};

export type ResendOtpPayload = {
  email: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  email: string;
  token: string;
  password: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type UpdateProfilePayload = {
  name?: string;
  phone?: string;
  avatarUrl?: string;
};

export type CreateTeacherPayload = Record<string, string | number | boolean | undefined>;

export const login = async (data: LoginPayload): Promise<AuthTokenResponse> => {
  const response = await api.post<AuthTokenResponse>('/users/login', data);
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/users/logout');
  return response.data;
};

export const register = async (data: RegisterPayload): Promise<AuthTokenResponse> => {
  const response = await api.post<AuthTokenResponse>('/users/register', data);
  return response.data;
};

export const verifyOTP = async (data: VerifyOtpPayload): Promise<AuthTokenResponse> => {
  const response = await api.post<AuthTokenResponse>('/users/verify', data);
  return response.data;
};

export const resendOTP = async (data: ResendOtpPayload): Promise<{ message?: string }> => {
  const response = await api.post<{ message?: string }>('/users/resend-otp', data);
  return response.data;
};

export const forgotPassword = async (data: ForgotPasswordPayload): Promise<{ message?: string }> => {
  const response = await api.post<{ message?: string }>('/users/forgot-password', data);
  return response.data;
};

export const resetPassword = async (data: ResetPasswordPayload): Promise<{ message?: string }> => {
  const response = await api.post<{ message?: string }>('/users/reset-password', data);
  return response.data;
};

export const changePassword = async (data: ChangePasswordPayload): Promise<{ message?: string }> => {
  const response = await api.post<{ message?: string }>('/users/change-password', data);
  return response.data;
};

export const createTeacher = async (data: CreateTeacherPayload): Promise<{ message?: string }> => {
  const response = await api.post<{ message?: string }>('/users/teachers', data);
  return response.data;
};

export const getProfile = async (): Promise<AuthUser> => {
  const response = await api.get<AuthUser>('/users/profile');
  return response.data;
};

export const updateProfile = async (data: UpdateProfilePayload): Promise<AuthUser> => {
  const response = await api.put<AuthUser>('/users/profile', data);
  return response.data;
};
