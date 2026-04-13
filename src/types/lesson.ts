/**
 * Shared types and utilities for the LessonForm component.
 *
 * Kept in a separate file so LessonForm.tsx only exports a React component,
 * which is required for React Fast Refresh to work correctly.
 */

export type LessonMedia = {
  videoUrl: string;
  pdfUrl: string;
  imageUrl: string;
  modelUrl: string;
  modelExplanation: string;
  audioUrl: string;
};

export type PartQuizQuestion = {
  id: string;
  question: string;
  options: [string, string, string, string];
  /** Index of the correct option (0–3) */
  correctIndex: number;
};

export type LessonPart = {
  id: string;
  title: string;
  content: string;
  media: LessonMedia;
  quiz: PartQuizQuestion[];
};

export type LessonFormData = {
  title: string;
  description: string;
  media: LessonMedia;
  order: number;
  parts: LessonPart[];
};

export const emptyMedia = (): LessonMedia => ({
  videoUrl: '',
  pdfUrl: '',
  imageUrl: '',
  modelUrl: '',
  modelExplanation: '',
  audioUrl: '',
});
