import api from './axiosConfig';

export type AuthUser = {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
  stageId?: string;
  gradeId?: string;
  stageIds?: string[];
  subjectIds?: string[];
  phone?: string;
  avatarUrl?: string;
  profileImage?: string;
  bio?: string;
  availableDays?: string[];
  availableHours?: Record<string, { start?: string; end?: string }>;
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
  stageId?: string;
  avatarUrl?: string;
  profileImage?: string;
  bio?: string;
  availableDays?: string[];
  availableHours?: Record<string, { start?: string; end?: string }>;
  stageIds?: string[];
  subjectIds?: string[];
  /** If provided, upload this file as the profile avatar */
  avatarFile?: File;
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
  const { avatarFile, ...rest } = data;

  // If a file is supplied build multipart/form-data; otherwise keep JSON
  if (avatarFile) {
    const form = new FormData();
    form.append('avatar', avatarFile);
    if (rest.name !== undefined) form.append('name', rest.name ?? '');
    if (rest.phone !== undefined) form.append('phone', rest.phone ?? '');
    if (rest.stageId !== undefined) form.append('stageId', rest.stageId ?? '');
    if (rest.bio !== undefined) form.append('bio', rest.bio ?? '');
    if (rest.availableDays !== undefined) form.append('availableDays', JSON.stringify(rest.availableDays));
    if (rest.availableHours !== undefined) form.append('availableHours', JSON.stringify(rest.availableHours));
    if (rest.stageIds !== undefined) form.append('stageIds', JSON.stringify(rest.stageIds));
    if (rest.subjectIds !== undefined) form.append('subjectIds', JSON.stringify(rest.subjectIds));
    const response = await api.put<AuthUser>('/users/profile', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  const response = await api.put<AuthUser>('/users/profile', rest);
  return response.data;
};
