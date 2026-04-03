// ─────────────────────────────────────────────────────────────────
//  Mock Subject API
//  Covers Stages → Subjects → Units → Lessons hierarchy
// ─────────────────────────────────────────────────────────────────

import {
  MOCK_STAGES,
  MOCK_SUBJECTS,
  MOCK_UNITS,
  MOCK_UNIT_LESSONS,
  MOCK_UNIT_COMMENTS,
  MOCK_UNIT_QUIZZES,
  MOCK_MCQ_QUESTIONS,
  MOCK_UNIT_ENROLLMENTS,
  MOCK_LESSON_PARTS,
  MOCK_UNIT_AVAILABILITY,
  MOCK_QUIZ_GRADES,
  MOCK_TEACHER_SCHEDULES,
  MOCK_USERS,
  generateId,
  type MockStage,
  type MockSubject,
  type MockUnit,
  type MockUnitLesson,
  type MockComment,
  type MockUnitQuiz,
  type MockMCQQuestion,
  type MockUnitEnrollment,
  type MockLessonPart,
  type MockUnitAvailability,
  type AvailabilityStatus,
  type MockQuizGrade,
  type MockTeacherSchedule,
  type DayOfWeek,
} from './data';

const delay = (ms = 250) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// Mutable in-memory stores
const stages: MockStage[] = [...MOCK_STAGES];
const subjects: MockSubject[] = [...MOCK_SUBJECTS];
const units: MockUnit[] = [...MOCK_UNITS];
const enrollments: MockUnitEnrollment[] = [...MOCK_UNIT_ENROLLMENTS];
const lessons: MockUnitLesson[] = [...MOCK_UNIT_LESSONS];
const comments: MockComment[] = [...MOCK_UNIT_COMMENTS];
const lessonParts: MockLessonPart[] = [...MOCK_LESSON_PARTS];
const unitAvailability: MockUnitAvailability[] = [...MOCK_UNIT_AVAILABILITY];
const quizGrades: MockQuizGrade[] = [...MOCK_QUIZ_GRADES];
const teacherSchedules: MockTeacherSchedule[] = [...MOCK_TEACHER_SCHEDULES];

type ApiError = Error & { response: { status: number; data: { message: string } } };
function makeApiError(status: number, message: string): ApiError {
  const err = new Error(message) as ApiError;
  err.response = { status, data: { message } };
  return err;
}

// ── Stages ─────────────────────────────────────────────────────────

export const getStages = async () => {
  await delay();
  return [...stages].sort((a, b) => a.order - b.order);
};

export const getStageById = async (id: string) => {
  await delay();
  const stage = stages.find((s) => s._id === id);
  if (!stage) throw makeApiError(404, 'Stage not found');
  return { ...stage };
};

export const createStage = async (data: Record<string, unknown>) => {
  await delay();
  const newStage: MockStage = {
    _id: generateId('stage'),
    name: data.name as string,
    description: (data.description as string) || '',
    icon: (data.icon as string) || '📚',
    color: (data.color as string) || 'blue',
    order: stages.length + 1,
    createdAt: new Date().toISOString(),
  };
  stages.push(newStage);
  return newStage;
};

export const updateStage = async (id: string, data: Record<string, unknown>) => {
  await delay();
  const index = stages.findIndex((s) => s._id === id);
  if (index === -1) throw makeApiError(404, 'Stage not found');
  stages[index] = { ...stages[index], ...data, _id: id } as MockStage;
  return stages[index];
};

export const deleteStage = async (id: string) => {
  await delay();
  const index = stages.findIndex((s) => s._id === id);
  if (index !== -1) stages.splice(index, 1);
  return { message: 'Stage deleted successfully' };
};

// ── Subjects ───────────────────────────────────────────────────────

export const getSubjects = async () => {
  await delay();
  return [...subjects];
};

export const getSubjectsByStage = async (stageId: string) => {
  await delay();
  return subjects.filter((s) => s.stageId === stageId);
};

export const getSubjectById = async (id: string) => {
  await delay();
  const subject = subjects.find((s) => s._id === id);
  if (!subject) throw makeApiError(404, 'Subject not found');
  return { ...subject };
};

export const createSubject = async (data: Record<string, unknown>) => {
  await delay();
  const teacherIdRaw = data.teacherId as string;
  const teacher = MOCK_USERS.find((u) => u._id === teacherIdRaw);
  const newSubject: MockSubject = {
    _id: generateId('subject'),
    stageId: data.stageId as string,
    name: data.name as string,
    description: data.description as string,
    color: (data.color as string) || 'blue',
    icon: (data.icon as string) || '📚',
    teacherId: teacher ? { _id: teacher._id, name: teacher.name } : (teacherIdRaw || 'Unknown'),
    createdAt: new Date().toISOString(),
  };
  subjects.push(newSubject);
  return newSubject;
};

export const updateSubject = async (id: string, data: Record<string, unknown>) => {
  await delay();
  const index = subjects.findIndex((s) => s._id === id);
  if (index === -1) throw makeApiError(404, 'Subject not found');
  subjects[index] = { ...subjects[index], ...data, _id: id } as MockSubject;
  return subjects[index];
};

export const deleteSubject = async (id: string) => {
  await delay();
  const index = subjects.findIndex((s) => s._id === id);
  if (index !== -1) subjects.splice(index, 1);
  return { message: 'Subject deleted successfully' };
};

// ── Units ──────────────────────────────────────────────────────────

export const getUnitsBySubject = async (subjectId: string) => {
  await delay();
  return units.filter((u) => u.subjectId === subjectId).sort((a, b) => a.order - b.order);
};

export const getUnitById = async (id: string) => {
  await delay();
  const unit = units.find((u) => u._id === id);
  if (!unit) throw makeApiError(404, 'Unit not found');
  return { ...unit };
};

export const createUnit = async (subjectId: string, data: Record<string, unknown>) => {
  await delay();
  const existingUnits = units.filter((u) => u.subjectId === subjectId);
  const newUnit: MockUnit = {
    _id: generateId('unit'),
    subjectId,
    title: data.title as string,
    description: data.description as string | undefined,
    order: existingUnits.length + 1,
    createdAt: new Date().toISOString(),
  };
  units.push(newUnit);
  return newUnit;
};

export const updateUnit = async (id: string, data: Record<string, unknown>) => {
  await delay();
  const index = units.findIndex((u) => u._id === id);
  if (index === -1) throw makeApiError(404, 'Unit not found');
  units[index] = { ...units[index], ...data, _id: id } as MockUnit;
  return units[index];
};

export const deleteUnit = async (id: string) => {
  await delay();
  const index = units.findIndex((u) => u._id === id);
  if (index !== -1) units.splice(index, 1);
  return { message: 'Unit deleted successfully' };
};

// ── Lessons ────────────────────────────────────────────────────────

export const getLessonsByUnit = async (unitId: string) => {
  await delay();
  return lessons.filter((l) => l.unitId === unitId).sort((a, b) => a.order - b.order);
};

export const getLessonById = async (id: string) => {
  await delay();
  const lesson = lessons.find((l) => l._id === id);
  if (!lesson) throw makeApiError(404, 'Lesson not found');
  return { ...lesson };
};

export const createLesson = async (unitId: string, data: Record<string, unknown>) => {
  await delay();
  const existingLessons = lessons.filter((l) => l.unitId === unitId);
  const newLesson: MockUnitLesson = {
    _id: generateId('ul'),
    unitId,
    title: data.title as string,
    description: data.description as string | undefined,
    videoUrl: data.videoUrl as string | undefined,
    pdfUrl: data.pdfUrl as string | undefined,
    order: existingLessons.length + 1,
    duration: data.duration ? Number(data.duration) : undefined,
    createdAt: new Date().toISOString(),
  };
  lessons.push(newLesson);
  return newLesson;
};

export const updateLesson = async (id: string, data: Record<string, unknown>) => {
  await delay();
  const index = lessons.findIndex((l) => l._id === id);
  if (index === -1) throw makeApiError(404, 'Lesson not found');
  lessons[index] = { ...lessons[index], ...data, _id: id } as MockUnitLesson;
  return lessons[index];
};

export const deleteLesson = async (id: string) => {
  await delay();
  const index = lessons.findIndex((l) => l._id === id);
  if (index !== -1) lessons.splice(index, 1);
  return { message: 'Lesson deleted successfully' };
};

// ── Comments ───────────────────────────────────────────────────────

export const getCommentsByLesson = async (lessonId: string) => {
  await delay();
  return comments.filter((c) => c.lessonId === lessonId).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
};

export const addLessonComment = async (lessonId: string, text: string) => {
  await delay();
  try {
    const user = JSON.parse(localStorage.getItem('mockAuthUser') || '{}') as { _id?: string; name?: string };
    const newComment: MockComment = {
      _id: generateId('uc'),
      lessonId,
      userId: { _id: user._id || 'anon', name: user.name || 'Anonymous' },
      text,
      createdAt: new Date().toISOString(),
    };
    comments.push(newComment);
    return newComment;
  } catch {
    throw makeApiError(400, 'Failed to add comment');
  }
};

// ── Unit / Lesson Quizzes ─────────────────────────────────────────

const unitQuizzes: MockUnitQuiz[] = [...MOCK_UNIT_QUIZZES];
const mcqQuestions: MockMCQQuestion[] = [...MOCK_MCQ_QUESTIONS];

export const getQuizByAttached = async (attachedToId: string): Promise<MockUnitQuiz | null> => {
  await delay();
  return unitQuizzes.find((q) => q.attachedToId === attachedToId) ?? null;
};

export const createQuiz = async (data: {
  attachedTo: 'unit' | 'lesson';
  attachedToId: string;
  title: string;
}): Promise<MockUnitQuiz> => {
  await delay();
  const existing = unitQuizzes.find((q) => q.attachedToId === data.attachedToId);
  if (existing) throw makeApiError(400, 'A quiz already exists for this unit/lesson');
  const newQuiz: MockUnitQuiz = {
    _id: generateId('uquiz'),
    ...data,
    createdAt: new Date().toISOString(),
  };
  unitQuizzes.push(newQuiz);
  return newQuiz;
};

export const updateQuiz = async (id: string, data: { title: string }): Promise<MockUnitQuiz> => {
  await delay();
  const index = unitQuizzes.findIndex((q) => q._id === id);
  if (index === -1) throw makeApiError(404, 'Quiz not found');
  unitQuizzes[index] = { ...unitQuizzes[index], ...data };
  return unitQuizzes[index];
};

export const deleteQuiz = async (id: string): Promise<{ message: string }> => {
  await delay();
  const index = unitQuizzes.findIndex((q) => q._id === id);
  if (index !== -1) unitQuizzes.splice(index, 1);
  // Remove all questions belonging to this quiz
  const toRemove = mcqQuestions.reduce<number[]>((acc, q, i) => {
    if (q.quizId === id) acc.push(i);
    return acc;
  }, []);
  toRemove.reverse().forEach((i) => mcqQuestions.splice(i, 1));
  return { message: 'Quiz deleted successfully' };
};

// ── MCQ Questions ─────────────────────────────────────────────────

export const getQuestionsByQuiz = async (quizId: string): Promise<MockMCQQuestion[]> => {
  await delay();
  return mcqQuestions.filter((q) => q.quizId === quizId);
};

export const createQuestion = async (
  quizId: string,
  data: { text: string; options: [string, string, string, string]; correctAnswer: 0 | 1 | 2 | 3 }
): Promise<MockMCQQuestion> => {
  await delay();
  const newQ: MockMCQQuestion = {
    _id: generateId('mcq'),
    quizId,
    ...data,
    createdAt: new Date().toISOString(),
  };
  mcqQuestions.push(newQ);
  return newQ;
};

export const updateQuestion = async (
  id: string,
  data: { text: string; options: [string, string, string, string]; correctAnswer: 0 | 1 | 2 | 3 }
): Promise<MockMCQQuestion> => {
  await delay();
  const index = mcqQuestions.findIndex((q) => q._id === id);
  if (index === -1) throw makeApiError(404, 'Question not found');
  mcqQuestions[index] = { ...mcqQuestions[index], ...data };
  return mcqQuestions[index];
};

export const deleteQuestion = async (id: string): Promise<{ message: string }> => {
  await delay();
  const index = mcqQuestions.findIndex((q) => q._id === id);
  if (index !== -1) mcqQuestions.splice(index, 1);
  return { message: 'Question deleted successfully' };
};

// ── Unit Enrollments ──────────────────────────────────────────────

export const getEnrolledUnitIds = async (studentId: string): Promise<string[]> => {
  await delay(100);
  return enrollments
    .filter((e) => e.studentId === studentId)
    .map((e) => e.unitId);
};

export const enrollInUnit = async (
  studentId: string,
  unitId: string
): Promise<MockUnitEnrollment> => {
  await delay();
  const existing = enrollments.find(
    (e) => e.studentId === studentId && e.unitId === unitId
  );
  if (existing) return existing;
  const newEnrollment: MockUnitEnrollment = {
    _id: generateId('ue'),
    studentId,
    unitId,
    createdAt: new Date().toISOString(),
  };
  enrollments.push(newEnrollment);
  return newEnrollment;
};

// ── Lesson Parts ──────────────────────────────────────────────────

export const getPartsByLesson = async (lessonId: string): Promise<MockLessonPart[]> => {
  await delay(150);
  return lessonParts.filter((p) => p.lessonId === lessonId).sort((a, b) => a.order - b.order);
};

export const createLessonPart = async (
  lessonId: string,
  data: Partial<MockLessonPart>
): Promise<MockLessonPart> => {
  await delay();
  const existing = lessonParts.filter((p) => p.lessonId === lessonId);
  const newPart: MockLessonPart = {
    _id: generateId('part'),
    lessonId,
    title: (data.title as string) || 'New Part',
    content: data.content,
    media: data.media,
    quiz: data.quiz,
    order: existing.length + 1,
    createdAt: new Date().toISOString(),
  };
  lessonParts.push(newPart);
  return newPart;
};

export const updateLessonPart = async (
  id: string,
  data: Partial<MockLessonPart>
): Promise<MockLessonPart> => {
  await delay();
  const index = lessonParts.findIndex((p) => p._id === id);
  if (index === -1) throw makeApiError(404, 'Lesson part not found');
  lessonParts[index] = { ...lessonParts[index], ...data, _id: id };
  return lessonParts[index];
};

export const deleteLessonPart = async (id: string): Promise<{ message: string }> => {
  await delay();
  const index = lessonParts.findIndex((p) => p._id === id);
  if (index !== -1) lessonParts.splice(index, 1);
  return { message: 'Part deleted' };
};

// ── Unit Availability ─────────────────────────────────────────────

export const getUnitAvailability = async (): Promise<MockUnitAvailability[]> => {
  await delay(100);
  return [...unitAvailability];
};

export const getUnitAvailabilityById = async (unitId: string): Promise<MockUnitAvailability | null> => {
  await delay(80);
  return unitAvailability.find((a) => a.unitId === unitId) ?? null;
};

export const setUnitAvailability = async (
  unitId: string,
  data: { status: AvailabilityStatus; availableMonth?: number; availableYear?: number; note?: string }
): Promise<MockUnitAvailability> => {
  await delay();
  const index = unitAvailability.findIndex((a) => a.unitId === unitId);
  const updated: MockUnitAvailability = {
    _id: index >= 0 ? unitAvailability[index]._id : generateId('av'),
    unitId,
    status: data.status,
    availableMonth: data.availableMonth,
    availableYear: data.availableYear,
    note: data.note,
    updatedAt: new Date().toISOString(),
  };
  if (index >= 0) {
    unitAvailability[index] = updated;
  } else {
    unitAvailability.push(updated);
  }
  return updated;
};

// ── Quiz Grades ───────────────────────────────────────────────────

export const saveQuizGrade = async (
  studentId: string,
  quizId: string,
  score: number,
  correctCount: number,
  totalQuestions: number
): Promise<MockQuizGrade> => {
  await delay();
  // Allow re-taking - add a new grade entry each time
  const grade: MockQuizGrade = {
    _id: generateId('grade'),
    studentId,
    quizId,
    score,
    correctCount,
    totalQuestions,
    completedAt: new Date().toISOString(),
  };
  quizGrades.push(grade);
  return grade;
};

export const getGradesByStudent = async (studentId: string): Promise<MockQuizGrade[]> => {
  await delay(100);
  return quizGrades.filter((g) => g.studentId === studentId);
};

export const getGradesByQuiz = async (quizId: string): Promise<MockQuizGrade[]> => {
  await delay(100);
  return quizGrades.filter((g) => g.quizId === quizId);
};

// ── Teacher Schedules (Live Lessons) ──────────────────────────────

export const getSchedulesBySubject = async (subjectId: string): Promise<MockTeacherSchedule[]> => {
  await delay(150);
  return teacherSchedules.filter((s) => s.subjectId === subjectId && s.isActive);
};

export const getSchedulesByTeacher = async (teacherId: string): Promise<MockTeacherSchedule[]> => {
  await delay(100);
  return teacherSchedules.filter((s) => s.teacherId === teacherId);
};

export const getStudentSchedules = async (studentId: string): Promise<(MockTeacherSchedule & { teacherName: string; subjectName: string })[]> => {
  await delay(150);
  const enrolled = teacherSchedules.filter((s) => s.enrolledStudents.includes(studentId));
  return enrolled.map((s) => {
    const teacher = MOCK_USERS.find((u) => u._id === s.teacherId);
    const subject = subjects.find((sub) => sub._id === s.subjectId);
    return {
      ...s,
      teacherName: teacher?.name ?? 'Unknown',
      subjectName: subject?.name ?? 'Unknown',
    };
  });
};

export const enrollInLiveLesson = async (
  studentId: string,
  scheduleId: string
): Promise<MockTeacherSchedule> => {
  await delay();
  const index = teacherSchedules.findIndex((s) => s._id === scheduleId);
  if (index === -1) throw makeApiError(404, 'Schedule not found');
  const sched = teacherSchedules[index];
  if (sched.enrolledStudents.length >= sched.maxStudents) {
    throw makeApiError(400, 'This group is full');
  }
  if (!sched.enrolledStudents.includes(studentId)) {
    teacherSchedules[index] = {
      ...sched,
      enrolledStudents: [...sched.enrolledStudents, studentId],
    };
  }
  return teacherSchedules[index];
};

export const createTeacherSchedule = async (
  data: Omit<MockTeacherSchedule, '_id' | 'enrolledStudents' | 'createdAt'>
): Promise<MockTeacherSchedule> => {
  await delay();
  const newSched: MockTeacherSchedule = {
    _id: generateId('sched'),
    ...data,
    enrolledStudents: [],
    createdAt: new Date().toISOString(),
  };
  teacherSchedules.push(newSched);
  return newSched;
};

export const updateTeacherSchedule = async (
  id: string,
  data: Partial<MockTeacherSchedule>
): Promise<MockTeacherSchedule> => {
  await delay();
  const index = teacherSchedules.findIndex((s) => s._id === id);
  if (index === -1) throw makeApiError(404, 'Schedule not found');
  teacherSchedules[index] = { ...teacherSchedules[index], ...data, _id: id };
  return teacherSchedules[index];
};

export const deleteTeacherSchedule = async (id: string): Promise<{ message: string }> => {
  await delay();
  const index = teacherSchedules.findIndex((s) => s._id === id);
  if (index !== -1) teacherSchedules.splice(index, 1);
  return { message: 'Schedule deleted' };
};

export { type DayOfWeek };
