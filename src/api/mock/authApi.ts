// ─────────────────────────────────────────────────────────────────
//  Mock Auth API
//  Same function signatures as the real authApi.ts.
//  Simulates login, registration, OTP flow, and profile retrieval.
// ─────────────────────────────────────────────────────────────────

import {
  MOCK_CREDENTIALS,
  MOCK_USERS,
  generateId,
  type MockUser,
} from './data';

const delay = (ms = 250) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const MOCK_USER_KEY = 'mockAuthUser';

// ── Helpers ───────────────────────────────────────────────────────

function findUser(email: string): MockUser | undefined {
  return MOCK_USERS.find((u) => u.email === email);
}

function storeUser(user: MockUser): void {
  localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
}

function makeToken(userId: string): string {
  return `mock-token-${userId}`;
}

type ApiError = Error & { response: { status: number; data: { message: string } } };

function makeApiError(status: number, message: string): ApiError {
  const err = new Error(message) as ApiError;
  err.response = { status, data: { message } };
  return err;
}

function notFound(): never {
  throw makeApiError(401, 'Invalid email or password');
}

// ── Exported mock functions ───────────────────────────────────────

export const login = async (data: { email: string; password: string }) => {
  await delay();
  const user = findUser(data.email);
  if (!user || MOCK_CREDENTIALS[data.email] !== data.password) notFound();
  storeUser(user);
  return { token: makeToken(user._id), ...user };
};

export const logout = async () => {
  await delay();
  localStorage.removeItem(MOCK_USER_KEY);
  return { message: 'Logged out successfully' };
};

export const register = async (_data: unknown) => {
  await delay();
  return { message: 'Registration successful. Please check your email for the OTP.' };
};

export const verifyOTP = async (data: { email?: string; otp?: string }) => {
  await delay();
  // For mock purposes, automatically verify and return a student account
  const email = data?.email;
  const user = email ? findUser(email) : MOCK_USERS.find((u) => u.role === 'Student');
  if (!user) notFound();
  storeUser(user);
  return { token: makeToken(user._id), ...user };
};

export const resendOTP = async (_data: unknown) => {
  await delay();
  return { message: 'OTP resent successfully. Please check your email.' };
};

export const forgotPassword = async (_data: unknown) => {
  await delay();
  return { message: 'Password reset link sent to your email.' };
};

export const resetPassword = async (_data: unknown) => {
  await delay();
  return { message: 'Password reset successfully. You can now log in.' };
};

export const changePassword = async (_data: unknown) => {
  await delay();
  return { message: 'Password changed successfully.' };
};

export const createTeacher = async (data: Record<string, string>) => {
  await delay();
  const newTeacher: MockUser = {
    _id: generateId('user-teacher'),
    name: data.name,
    email: data.email,
    role: 'Teacher',
    phone: data.phone,
    subject: data.subject,
    status: 'Active',
    isVerified: true,
    mustChangePassword: true,
    createdAt: new Date().toISOString(),
  };
  MOCK_USERS.push(newTeacher);
  return { message: 'Teacher created successfully.', user: newTeacher };
};

export const getProfile = async () => {
  await delay(100);
  const stored = localStorage.getItem(MOCK_USER_KEY);
  if (!stored) {
    throw makeApiError(401, 'Unauthorized');
  }
  return JSON.parse(stored) as MockUser;
};

export const updateProfile = async (data: { name?: string; phone?: string; stageId?: string }) => {
  await delay();
  const stored = localStorage.getItem(MOCK_USER_KEY);
  if (!stored) throw makeApiError(401, 'Unauthorized');
  const user = JSON.parse(stored) as MockUser;
  const updated: MockUser = { ...user, ...data };
  // Persist into MOCK_USERS array for consistency
  const idx = MOCK_USERS.findIndex((u) => u._id === user._id);
  if (idx !== -1) Object.assign(MOCK_USERS[idx], data);
  storeUser(updated);
  return updated;
};

