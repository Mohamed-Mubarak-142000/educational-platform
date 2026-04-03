// ─────────────────────────────────────────────────────────────────
//  Mock Exam API
//  Same function signatures as the real examApi.ts.
// ─────────────────────────────────────────────────────────────────

import {
  MOCK_QUIZZES,
  MOCK_QUESTIONS,
  MOCK_ANSWERS,
  MOCK_RESULTS,
  MOCK_SECTIONS,
  MOCK_LESSONS,
  generateId,
  type MockQuiz,
  type MockQuestion,
  type MockAnswer,
  type MockResult,
} from './data';

const delay = (ms = 250) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// Mutable in-memory stores
const quizzes: MockQuiz[] = [...MOCK_QUIZZES];
const questions: MockQuestion[] = [...MOCK_QUESTIONS];
const answers: MockAnswer[] = [...MOCK_ANSWERS];
const results: MockResult[] = [...MOCK_RESULTS];

type ApiError = Error & { response: { status: number; data: { message: string } } };

function makeApiError(status: number, message: string): ApiError {
  const err = new Error(message) as ApiError;
  err.response = { status, data: { message } };
  return err;
}

interface QuestionInput {
  question: string;
  type: string;
  answers?: { answerText: string; isCorrect: boolean }[];
}

// ── Exams (quizzes) ────────────────────────────────────────────────

export const getExams = async () => {
  await delay();
  return [...quizzes];
};

export const createExam = async (data: Record<string, unknown>) => {
  await delay();
  const newQuiz: MockQuiz = {
    _id: generateId('quiz'),
    lessonId: (data.lessonId as string) || '',
    title: data.title as string,
    timeLimit: Number(data.timeLimit) || 0,
    createdAt: new Date().toISOString(),
  };
  quizzes.push(newQuiz);

  // Create questions and answers if provided
  const dataQuestions = data.questions as QuestionInput[] | undefined;
  if (Array.isArray(dataQuestions)) {
    for (const q of dataQuestions) {
      const newQ: MockQuestion = {
        _id: generateId('q'),
        quizId: newQuiz._id,
        question: q.question,
        type: q.type as MockQuestion['type'],
        createdAt: new Date().toISOString(),
      };
      questions.push(newQ);
      if (Array.isArray(q.answers)) {
        for (const a of q.answers) {
          answers.push({
            _id: generateId('ans'),
            questionId: newQ._id,
            answerText: a.answerText,
            isCorrect: !!a.isCorrect,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }
  }

  return newQuiz;
};

export const updateExam = async (id: string, data: Record<string, unknown>) => {
  await delay();
  const index = quizzes.findIndex((q) => q._id === id);
  if (index === -1) throw makeApiError(404, 'Exam not found');
  quizzes[index] = { ...quizzes[index], ...data, _id: id } as MockQuiz;
  return quizzes[index];
};

export const deleteExam = async (id: string) => {
  await delay();
  const index = quizzes.findIndex((q) => q._id === id);
  if (index !== -1) quizzes.splice(index, 1);
  return { message: 'Exam deleted successfully' };
};

export const getExamDetails = async (id: string) => {
  await delay();
  const quiz = quizzes.find((q) => q._id === id);
  if (!quiz) throw makeApiError(404, 'Exam not found');
  const examQuestions = questions
    .filter((q) => q.quizId === id)
    .map((q) => ({
      ...q,
      answers: answers.filter((a) => a.questionId === q._id),
    }));
  return { ...quiz, questions: examQuestions };
};

export const getExamResults = async (id: string) => {
  await delay();
  return results.filter((r) => r.quizId === id);
};

export const getExamsByCourse = async (courseId: string) => {
  await delay();
  // Find lesson IDs that belong to this course's sections
  const sectionIds = MOCK_SECTIONS.filter((s) => s.courseId === courseId).map(
    (s) => s._id
  );
  const lessonIds = MOCK_LESSONS.filter((l) => sectionIds.includes(l.sectionId)).map(
    (l) => l._id
  );
  return quizzes.filter((q) => lessonIds.includes(q.lessonId));
};
