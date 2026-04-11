// ─────────────────────────────────────────────────────────────────
//  Mock Course API
//  Same function signatures as the real courseApi.ts.
// ─────────────────────────────────────────────────────────────────

import {
  MOCK_COURSES,
  MOCK_SECTIONS,
  MOCK_LESSONS,
  MOCK_ENROLLMENTS,
  MOCK_COMMENTS,
  MOCK_USERS,
  generateId,
  type MockCourse,
  type MockSection,
  type MockLesson,
  type MockEnrollment,
  type MockComment,
} from './data';

const delay = (ms = 250) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// Mutable in-memory store (re-initialised from mock data on each page load)
const courses: MockCourse[] = [...MOCK_COURSES];
const sections: MockSection[] = [...MOCK_SECTIONS];
const lessons: MockLesson[] = [...MOCK_LESSONS];
const enrollments: MockEnrollment[] = [...MOCK_ENROLLMENTS];
const comments: MockComment[] = [...MOCK_COMMENTS];

type ApiError = Error & { response: { status: number; data: { message: string } } };

function makeApiError(status: number, message: string): ApiError {
  const err = new Error(message) as ApiError;
  err.response = { status, data: { message } };
  return err;
}

function getCourseTeacherId(c: MockCourse): string {
  return typeof c.teacherId === 'string' ? c.teacherId : c.teacherId._id;
}

function getCurrentUserId(): string {
  try {
    const user = JSON.parse(localStorage.getItem('mockAuthUser') || '{}') as { _id?: string };
    return user._id || '';
  } catch {
    return '';
  }
}

// ── Courses ────────────────────────────────────────────────────────

export const getCourses = async (params?: { teacherId?: string; stageId?: string; subjectId?: string }) => {
  await delay();
  let result = [...courses];
  if (params?.teacherId) result = result.filter((c) => getCourseTeacherId(c) === params.teacherId);
  if (params?.stageId) result = result.filter((c) => c.stageId === params.stageId);
  if (params?.subjectId) result = result.filter((c) => c.subjectId === params.subjectId);
  return result;
};

export const createCourse = async (data: Record<string, unknown>) => {
  await delay();
  const teacherIdRaw = (data.teacherId as string) || getCurrentUserId();
  const teacher = MOCK_USERS.find((u) => u._id === teacherIdRaw);
  const stageId = data.stageId as string;
  const subjectId = data.subjectId as string;
  if (!stageId || !subjectId) throw makeApiError(400, 'Stage and subject are required');
  const newCourse: MockCourse = {
    _id: generateId('course'),
    title: data.title as string,
    description: data.description as string,
    teacherId: teacher
      ? { _id: teacher._id, name: teacher.name }
      : teacherIdRaw,
    stageId,
    subjectId,
    price: Number(data.price) || 0,
    thumbnail: data.thumbnail as string | undefined,
    createdAt: new Date().toISOString(),
  };
  courses.push(newCourse);
  return newCourse;
};

export const updateCourse = async (id: string, data: Record<string, unknown>) => {
  await delay();
  const index = courses.findIndex((c) => c._id === id);
  if (index === -1) throw makeApiError(404, 'Course not found');
  courses[index] = { ...courses[index], ...data, _id: id } as MockCourse;
  return courses[index];
};

export const deleteCourse = async (id: string) => {
  await delay();
  const index = courses.findIndex((c) => c._id === id);
  if (index !== -1) courses.splice(index, 1);
  return { message: 'Course deleted successfully' };
};

export const enrollCourse = async (courseId: string) => {
  await delay();
  const studentId = getCurrentUserId();
  const already = enrollments.find(
    (e) => e.studentId === studentId && e.courseId === courseId
  );
  if (already) throw makeApiError(400, 'Already enrolled in this course');
  const enrollment: MockEnrollment = {
    _id: generateId('enroll'),
    studentId,
    courseId,
    createdAt: new Date().toISOString(),
  };
  enrollments.push(enrollment);
  return { message: 'Enrolled successfully', enrollment };
};

export const getCourseById = async (id: string) => {
  await delay();
  const course = courses.find((c) => c._id === id);
  if (!course) throw makeApiError(404, 'Course not found');
  return course;
};

export const getEnrolledCourses = async () => {
  await delay();
  const studentId = getCurrentUserId();
  const enrolledIds = enrollments
    .filter((e) => e.studentId === studentId)
    .map((e) => e.courseId);
  return courses.filter((c) => enrolledIds.includes(c._id));
};

export const getMyCourses = async (params?: { stageId?: string; subjectId?: string }) => {
  await delay();
  const teacherId = getCurrentUserId();
  let result = courses.filter((c) => getCourseTeacherId(c) === teacherId);
  if (params?.stageId) result = result.filter((c) => c.stageId === params.stageId);
  if (params?.subjectId) result = result.filter((c) => c.subjectId === params.subjectId);
  return result;
};

export const getCoursesByTeacher = async (teacherId: string, params?: { stageId?: string; subjectId?: string }) => {
  await delay();
  let result = courses.filter((c) => getCourseTeacherId(c) === teacherId);
  if (params?.stageId) result = result.filter((c) => c.stageId === params.stageId);
  if (params?.subjectId) result = result.filter((c) => c.subjectId === params.subjectId);
  return result;
};

// ── Sections & Lessons ─────────────────────────────────────────────

export const getSections = async (courseId: string) => {
  await delay();
  return sections
    .filter((s) => s.courseId === courseId)
    .sort((a, b) => a.order - b.order);
};

export const getLessons = async (sectionId: string) => {
  await delay();
  return lessons
    .filter((l) => l.sectionId === sectionId)
    .sort((a, b) => a.order - b.order);
};

export const getLessonsByCourse = async (courseId: string) => {
  await delay();
  return lessons
    .filter((l) => l.courseId === courseId)
    .sort((a, b) => a.order - b.order);
};

export const createLessonForCourse = async (courseId: string, data: Record<string, unknown>) => {
  await delay();
  const newLesson = {
    _id: generateId('lesson'),
    sectionId: '',
    courseId,
    title: data.title as string,
    description: data.description as string | undefined,
    videoUrl: data.videoUrl as string | undefined,
    pdfUrl: data.pdfUrl as string | undefined,
    imageUrl: data.imageUrl as string | undefined,
    modelUrl: data.modelUrl as string | undefined,
    order: Number(data.order) || 1,
    duration: data.duration as number | undefined,
    createdAt: new Date().toISOString(),
  };
  lessons.push(newLesson);
  return newLesson;
};

// ── Discussions ────────────────────────────────────────────────────

export const getComments = async (lessonId: string) => {
  await delay();
  return comments.filter((c) => c.lessonId === lessonId);
};

export const addComment = async (data: { lessonId: string; text: string }) => {
  await delay();
  const userId = getCurrentUserId();
  const user = MOCK_USERS.find((u) => u._id === userId);
  const newComment: MockComment = {
    _id: generateId('comment'),
    lessonId: data.lessonId,
    userId: { _id: userId, name: user?.name || 'User' },
    text: data.text,
    createdAt: new Date().toISOString(),
  };
  comments.push(newComment);
  return newComment;
};
