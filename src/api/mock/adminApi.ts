// ─────────────────────────────────────────────────────────────────
//  Mock Admin API
//  Same function signatures as the real adminApi.ts.
// ─────────────────────────────────────────────────────────────────

import {
  MOCK_USERS,
  MOCK_PAYMENTS,
  MOCK_SUBSCRIPTIONS,
  MOCK_TEACHER_APPLICATIONS,
  generateId,
  type MockUser,
  type MockPayment,
  type MockSubscription,
  type PaymentStatus,
  type MockTeacherApplication,
  type ApplicationStatus,
  type DayOfWeek,
} from './data';

const delay = (ms = 250) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// Mutable in-memory stores
const users: MockUser[] = [...MOCK_USERS];
const payments: MockPayment[] = [...MOCK_PAYMENTS];
const subscriptions: MockSubscription[] = [...MOCK_SUBSCRIPTIONS];
const teacherApplications: MockTeacherApplication[] = [...MOCK_TEACHER_APPLICATIONS];

type ApiError = Error & { response: { status: number; data: { message: string } } };

function makeApiError(status: number, message: string): ApiError {
  const err = new Error(message) as ApiError;
  err.response = { status, data: { message } };
  return err;
}

function getStudentIdStr(s: MockSubscription | MockPayment): string {
  return typeof s.studentId === 'string' ? s.studentId : s.studentId._id;
}

function getCurrentUserId(): string {
  try {
    const user = JSON.parse(localStorage.getItem('mockAuthUser') || '{}') as { _id?: string };
    return user._id || '';
  } catch {
    return '';
  }
}

// ── Teachers ───────────────────────────────────────────────────────

export const getTeachers = async () => {
  await delay();
  return users.filter((u) => u.role === 'Teacher');
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
  users.push(newTeacher);
  return { message: 'Teacher created successfully', user: newTeacher };
};

export const updateTeacher = async (id: string, data: Partial<MockUser>) => {
  await delay();
  const index = users.findIndex((u) => u._id === id);
  if (index === -1) throw makeApiError(404, 'Teacher not found');
  users[index] = { ...users[index], ...data, _id: id, role: 'Teacher' };
  return users[index];
};

export const deleteTeacher = async (id: string) => {
  await delay();
  const index = users.findIndex((u) => u._id === id);
  if (index !== -1) users.splice(index, 1);
  return { message: 'Teacher deleted successfully' };
};

// ── Students ───────────────────────────────────────────────────────

export const getStudents = async () => {
  await delay();
  return users.filter((u) => u.role === 'Student');
};

export const createStudent = async (data: Record<string, string>) => {
  await delay();
  const newStudent: MockUser = {
    _id: generateId('user-student'),
    name: data.name,
    email: data.email,
    role: 'Student',
    phone: data.phone,
    status: 'Active',
    isVerified: true,
    mustChangePassword: false,
    createdAt: new Date().toISOString(),
  };
  users.push(newStudent);
  return { message: 'Student created successfully', user: newStudent };
};

export const updateStudent = async (id: string, data: Partial<MockUser>) => {
  await delay();
  const index = users.findIndex((u) => u._id === id);
  if (index === -1) throw makeApiError(404, 'Student not found');
  users[index] = { ...users[index], ...data, _id: id, role: 'Student' };
  return users[index];
};

export const deleteStudent = async (id: string) => {
  await delay();
  const index = users.findIndex((u) => u._id === id);
  if (index !== -1) users.splice(index, 1);
  return { message: 'Student deleted successfully' };
};

// ── Payments ───────────────────────────────────────────────────────

export const getPayments = async (status?: string) => {
  await delay();
  if (status) return payments.filter((p) => p.status === status);
  return [...payments];
};

export const approvePayment = async (id: string) => {
  await delay();
  const index = payments.findIndex((p) => p._id === id);
  if (index !== -1) {
    payments[index] = {
      ...payments[index],
      status: 'Approved' as PaymentStatus,
      reviewedBy: getCurrentUserId(),
      reviewedAt: new Date().toISOString(),
    };
    // Activate the related subscription
    const studentId = getStudentIdStr(payments[index]);
    const subIndex = subscriptions.findIndex(
      (s) => getStudentIdStr(s) === studentId
    );
    if (subIndex !== -1) {
      subscriptions[subIndex] = {
        ...subscriptions[subIndex],
        status: 'Active',
        plan: payments[index].plan,
        startDate: new Date().toISOString(),
      };
    }
  }
  return { message: 'Payment approved successfully' };
};

export const rejectPayment = async (id: string) => {
  await delay();
  const index = payments.findIndex((p) => p._id === id);
  if (index !== -1) {
    payments[index] = {
      ...payments[index],
      status: 'Rejected' as PaymentStatus,
      reviewedBy: getCurrentUserId(),
      reviewedAt: new Date().toISOString(),
    };
  }
  return { message: 'Payment rejected' };
};

export const getMyPayments = async () => {
  await delay();
  const studentId = getCurrentUserId();
  return payments.filter((p) => getStudentIdStr(p) === studentId);
};

export const submitPayment = async (data: Record<string, unknown>) => {
  await delay();
  const studentId = getCurrentUserId();
  const student = users.find((u) => u._id === studentId);
  const newPayment: MockPayment = {
    _id: generateId('pay'),
    studentId: student
      ? { _id: student._id, name: student.name, email: student.email }
      : { _id: studentId, name: 'Unknown', email: '' },
    plan: data.plan as string,
    amount: Number(data.amount) || 0,
    method: data.method as MockPayment['method'],
    screenshotUrl: (data.screenshotUrl as string) || '',
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };
  payments.push(newPayment);
  return { message: 'Payment submitted successfully', payment: newPayment };
};

export const uploadPaymentProof = async (_file: File) => {
  await delay(400);
  return { url: `https://placehold.co/400x300?text=Payment+Proof+${Date.now()}` };
};

// ── Subscriptions ──────────────────────────────────────────────────

export const getMySubscription = async () => {
  await delay();
  const studentId = getCurrentUserId();
  return subscriptions.find((s) => getStudentIdStr(s) === studentId) ?? null;
};

export const getSubscriptions = async () => {
  await delay();
  return [...subscriptions];
};

export const activateSubscription = async (data: Record<string, unknown>) => {
  await delay();
  const studentId = (data.studentId as string) || getCurrentUserId();
  const index = subscriptions.findIndex((s) => getStudentIdStr(s) === studentId);
  if (index !== -1) {
    subscriptions[index] = {
      ...subscriptions[index],
      status: 'Active',
      plan: (data.plan as string) || subscriptions[index].plan,
      startDate: new Date().toISOString(),
    };
    return subscriptions[index];
  }
  const student = users.find((u) => u._id === studentId);
  const newSub: MockSubscription = {
    _id: generateId('sub'),
    studentId: student ? { _id: student._id, name: student.name } : studentId,
    plan: (data.plan as string) || 'Monthly',
    status: 'Active',
    startDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  subscriptions.push(newSub);
  return newSub;
};

export const cancelSubscription = async (data: Record<string, unknown>) => {
  await delay();
  const studentId = (data.studentId as string) || getCurrentUserId();
  const index = subscriptions.findIndex((s) => getStudentIdStr(s) === studentId);
  if (index !== -1) {
    subscriptions[index] = { ...subscriptions[index], status: 'Cancelled' };
  }
  return { message: 'Subscription cancelled' };
};

// ── Teacher Applications ───────────────────────────────────────────

export const getTeacherApplications = async () => {
  await delay();
  return [...teacherApplications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const submitTeacherApplication = async (
  data: Omit<MockTeacherApplication, '_id' | 'status' | 'createdAt'>
): Promise<MockTeacherApplication> => {
  await delay(500);
  const newApp: MockTeacherApplication = {
    _id: generateId('app'),
    ...data,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };
  teacherApplications.push(newApp);
  return newApp;
};

export const reviewTeacherApplication = async (
  id: string,
  action: 'accept' | 'reject',
  payload?: { zoomLink?: string; rejectionReason?: string }
): Promise<MockTeacherApplication> => {
  await delay(400);
  const index = teacherApplications.findIndex((a) => a._id === id);
  if (index === -1) throw new Error('Application not found');
  const updated: MockTeacherApplication = {
    ...teacherApplications[index],
    status: action === 'accept' ? 'Accepted' : ('Rejected' as ApplicationStatus),
    ...(action === 'accept' && payload?.zoomLink ? { zoomLink: payload.zoomLink } : {}),
    ...(action === 'reject' && payload?.rejectionReason
      ? { rejectionReason: payload.rejectionReason }
      : {}),
  };
  teacherApplications[index] = updated;
  // Simulate email being sent (no-op in mock)
  return updated;
};

export { type DayOfWeek };
