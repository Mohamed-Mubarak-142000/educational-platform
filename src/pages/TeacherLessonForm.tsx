/**
 * AdminLessonForm Page
 *
 * Full-page form for adding or editing a lesson.
 * Routes:
 *   /admin/subjects/:subjectId/units/:unitId/lessons/new
 *   /admin/subjects/:subjectId/units/:unitId/lessons/:lessonId/edit
 *
 * On save → navigates back to the subject detail page.
 * All functionalities (PDF upload, lesson parts, localization) are
 * handled by the LessonForm component.
 */

import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getLessonById,
  createLesson,
  updateLesson,
  getPartsByLesson,
  createLessonPart,
  deleteLessonPart,
  type LessonInput,
  type LessonPart as LessonPartResponse,
  type LessonPartQuizItem,
} from '@/api/subjectApi';
import LessonFormComponent from '@/components/LessonForm';
import {
  type LessonFormData,
  type LessonPart,
  type LessonMedia,
  emptyMedia,
} from '@/types/lesson';
import { FormPageLayout } from '@/components/shared';
import { BookOpen } from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[120, 80, 200, 160, 140].map((h, i) => (
        <div
          key={i}
          style={{ height: h }}
          className="rounded-xl bg-slate-100 dark:bg-slate-800 w-full"
        />
      ))}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────

export default function TeacherLessonForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Route params: subjectId + unitId always present; lessonId only for edit mode.
  const { subjectId, unitId, lessonId } = useParams<{
    subjectId: string;
    unitId: string;
    lessonId?: string;
  }>();

  const isEditMode = !!lessonId;
  const backPath = `/teacher/subjects/${subjectId}`;

  // ── Fetch existing lesson data (edit mode) ──────────────────────

  const { data: lessonData, isLoading: lessonLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => getLessonById(lessonId!),
    enabled: isEditMode,
  });

  const { data: partsData = [], isLoading: partsLoading } = useQuery({
    queryKey: ['lesson-parts', lessonId],
    queryFn: () => getPartsByLesson(lessonId!),
    enabled: isEditMode,
  });

  // ── Combine into LessonFormData initial data ────────────────────

  const initialData: Partial<LessonFormData> | undefined = isEditMode
    ? lessonData
      ? {
          title: lessonData.title ?? '',
          description: lessonData.description ?? '',
          media: {
            videoUrl: lessonData.videoUrl ?? '',
            pdfUrl: lessonData.pdfUrl ?? '',
            imageUrl: lessonData.imageUrl ?? '',
            modelUrl: lessonData.modelUrl ?? '',
            modelExplanation: lessonData.modelExplanation ?? '',
            audioUrl: lessonData.audioUrl ?? '',
          } satisfies LessonMedia,
          order: lessonData.order ?? 1,
          parts: partsData.map((p: LessonPartResponse): LessonPart => ({
            id: p._id,
            title: p.title,
            content: p.content ?? '',
            media: {
              videoUrl: p.media?.videoUrl ?? '',
              pdfUrl: p.media?.pdfUrl ?? '',
              imageUrl: p.media?.imageUrl ?? '',
              modelUrl: p.media?.modelUrl ?? '',
              modelExplanation: p.media?.modelExplanation ?? '',
              audioUrl: p.media?.audioUrl ?? '',
            },
            quiz: (p.quiz ?? []).map((q: LessonPartQuizItem) => ({
              id: `q-${Math.random().toString(36).slice(2)}`,
              question: q.question,
              options: q.options as [string, string, string, string],
              correctIndex: q.correctIndex,
            })),
          })),
        }
      : undefined   // still loading
    : {
        title: '',
        description: '',
        media: emptyMedia(),
        order: 1,
        parts: [],
      };

  // ── Save mutation (create or update lesson + parts) ─────────────

  const normalizeYouTubeUrl = (url?: string) => {
    if (!url) return '';
    const trimmed = url.trim();
    if (!trimmed) return '';

    const match = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
    if (match?.[1]) return `https://www.youtube.com/embed/${match[1]}`;
    return trimmed;
  };

  const saveMutation = useMutation({
    mutationFn: async (data: LessonFormData) => {
      const payload: LessonInput = {
        title: data.title,
        description: data.description,
        videoUrl: normalizeYouTubeUrl(data.media.videoUrl) || data.media.videoUrl,
        pdfUrl: data.media.pdfUrl,
        imageUrl: data.media.imageUrl,
        modelUrl: data.media.modelUrl,
        modelExplanation: data.media.modelExplanation,
        audioUrl: data.media.audioUrl,
        order: data.order,
      };

      let savedLesson: { _id: string };

      if (isEditMode && lessonId) {
        savedLesson = await updateLesson(lessonId, payload);
        // Delete all existing parts, then recreate from form state
        const existing = await getPartsByLesson(lessonId);
        await Promise.all(existing.map((p: LessonPartResponse) => deleteLessonPart(p._id)));
      } else {
        savedLesson = await createLesson(unitId!, payload);
      }

      if (data.parts.length > 0) {
        await Promise.all(
          data.parts.map((p, i) =>
            createLessonPart(savedLesson._id, {
              title: p.title,
              content: p.content,
              order: i + 1,
              media: {
                ...p.media,
                videoUrl: normalizeYouTubeUrl(p.media?.videoUrl) || p.media?.videoUrl,
              },
              quiz: p.quiz.map((q) => ({
                question: q.question,
                options: q.options,
                correctIndex: q.correctIndex,
              })),
            })
          )
        );
      }

      return savedLesson;
    },
    onSuccess: () => {
      // Invalidate the unit's lesson list and parts cache
      queryClient.invalidateQueries({ queryKey: ['unit-lessons', unitId] });
      queryClient.invalidateQueries({ queryKey: ['lesson-parts', lessonId] });
      navigate(backPath);
    },
  });

  // ── Render ──────────────────────────────────────────────────────

  const isDataLoading = isEditMode && (lessonLoading || partsLoading);

  return (
    <FormPageLayout
      title={
        isEditMode
          ? t('editLesson')
          : t('addLesson')
      }
      subtitle={
        isEditMode
          ? t('enterLessonTitle')     // reused as a generic "fill in details" hint
          : undefined
      }
      backTo={backPath}
      backLabel={t('back')}
    >
      {/* Breadcrumb hint */}
      <div className="flex items-center gap-2 mb-6 text-xs text-slate-500 dark:text-slate-400">
        <BookOpen className="w-3.5 h-3.5" />
        <span>
          {isEditMode ? t('editLesson') : t('addLesson')}
          {' — '}
          {t('lessonCourseContent')}
        </span>
      </div>

      {isDataLoading ? (
        <LoadingSkeleton />
      ) : (
        <LessonFormComponent
          key={lessonId ?? 'new'}
          initialData={initialData}
          isLoading={saveMutation.isPending}
          onSubmit={(data) => saveMutation.mutate(data)}
          onCancel={() => navigate(backPath)}
        />
      )}
    </FormPageLayout>
  );
}
