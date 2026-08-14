import api from "./axiosConfig";

export type ExamQuestionInput = {
  text: string;
  options: string[];
  correctAnswer: number;
};

export type ExamQuestion = {
  _id: string;
  text: string;
  options: string[];
  correctAnswer?: number; // only present for the owning teacher/admin
};

export type Exam = {
  _id: string;
  teacherId: string;
  assignmentId: string;
  subjectId: string;
  gradeId: string;
  title: string;
  scheduledStart: string;
  durationMinutes: number;
  status: "scheduled" | "active" | "closed";
  createdAt?: string;
};

export type CreateExamPayload = {
  assignmentId: string;
  title: string;
  scheduledStart: string;
  durationMinutes: number;
  questions: ExamQuestionInput[];
};

export const createExam = async (
  payload: CreateExamPayload,
): Promise<{ exam: Exam; notifiedCount: number }> => {
  const response = await api.post<{ exam: Exam; notifiedCount: number }>("/exams", payload);
  return response.data;
};

export const getExamsByAssignment = async (assignmentId: string): Promise<Exam[]> => {
  const response = await api.get<Exam[]>(`/exams/assignment/${assignmentId}`);
  return response.data;
};

export const getMyExams = async (): Promise<Exam[]> => {
  const response = await api.get<Exam[]>("/exams/mine");
  return response.data;
};

// Teacher/Admin view: full exam + questions with correctAnswer.
export type ExamOwnerView = { exam: Exam; questions: ExamQuestion[] };

// Student view: status-gated, never includes correctAnswer.
export type ExamStudentView =
  | { status: "scheduled"; title: string; scheduledStart: string; serverNow: string }
  | { status: "active"; title: string; questions: ExamQuestion[]; serverNow: string; endsAt: string }
  | { status: "closed"; alreadySubmitted: true; score: number; correctCount: number; totalQuestions: number }
  | { status: "closed"; alreadySubmitted: false };

export const getExam = async (examId: string): Promise<ExamOwnerView | ExamStudentView> => {
  const response = await api.get<ExamOwnerView | ExamStudentView>(`/exams/${examId}`);
  return response.data;
};

export type SubmitExamPayload = {
  answers: { questionId: string; selected: number }[];
  autoSubmitted?: boolean;
};

export type SubmitExamResponse = {
  score: number;
  correctCount: number;
  totalQuestions: number;
  alreadySubmitted: boolean;
};

export const submitExam = async (
  examId: string,
  payload: SubmitExamPayload,
): Promise<SubmitExamResponse> => {
  const response = await api.post<SubmitExamResponse>(`/exams/${examId}/submit`, payload);
  return response.data;
};

export type ExamSubmission = {
  _id: string;
  studentId: { _id: string; name?: string; email?: string } | string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  autoSubmitted: boolean;
  submittedAt: string;
};

export const getExamSubmissions = async (examId: string): Promise<ExamSubmission[]> => {
  const response = await api.get<ExamSubmission[]>(`/exams/${examId}/submissions`);
  return response.data;
};
