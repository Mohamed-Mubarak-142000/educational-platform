/**
 * CourseDetailPage – shared component used by both AdminCourseDetail and TeacherCourseDetail.
 *
 * Renders the full course detail screen (course info card + course-based lesson list
 * with add, edit, delete, and reorder actions).
 *
 * The only difference between the admin and teacher views is the navigation base path.
 */

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCourseById,
  getLessonsByCourse,
  updateLesson,
  deleteLesson,
  type Course,
  type Lesson,
} from '@/api/courseApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { getLocalizedName } from '@/lib/localeUtils';
import { spacing, cardVariants } from '@/lib/constants';
import {
  ArrowLeft,
  Pencil,
  Plus,
  PlayCircle,
  FileText,
  Trash2,
  ChevronUp,
  ChevronDown,
  DollarSign,
  User,
} from 'lucide-react';
import { EmptyState } from '@/components/shared';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/ToastProvider';

interface CourseDetailPageProps {
  /** '/admin/courses' or '/teacher/courses' */
  basePath: string;
}

export default function CourseDetailPage({ basePath }: CourseDetailPageProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { pushToast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US';

  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: ['course', id],
    queryFn: () => getCourseById(id as string),
    enabled: !!id,
  });

  const { data: lessons = [], isLoading: lessonsLoading } = useQuery<Lesson[]>({
    queryKey: ['course-lessons', id],
    queryFn: () => getLessonsByCourse(id as string),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: (lessonId: string) => deleteLesson(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-lessons', id] });
      setDeletingId(null);
      pushToast({ type: 'success', title: t('toastLessonDeleted') });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: ({ lessonId, order }: { lessonId: string; order: number }) =>
      updateLesson(lessonId, { order }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-lessons', id] });
    },
  });

  function handleMove(index: number, direction: 'up' | 'down') {
    const sorted = [...lessons].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const current = sorted[index];
    const target = sorted[targetIndex];
    const currentOrder = current.order ?? index + 1;
    const targetOrder = target.order ?? targetIndex + 1;

    reorderMutation.mutate({ lessonId: current._id, order: targetOrder });
    reorderMutation.mutate({ lessonId: target._id, order: currentOrder });
  }

  if (courseLoading) {
    return (
      <div className={`${spacing.pageContainer} py-12 text-center text-slate-500`}>
        {t('loading')}
      </div>
    );
  }

  if (!course) {
    return (
      <div className={`${spacing.pageContainer} py-12 text-center`}>
        <p className="text-slate-500 mb-4">{t('courseNotFound')}</p>
        <Button variant="outline" onClick={() => navigate(basePath)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> {t('backToCourses')}
        </Button>
      </div>
    );
  }

  const stageName =
    typeof course.stageId === 'object' && course.stageId
      ? getLocalizedName(course.stageId as { name: string; nameAr?: string }, i18n.language)
      : undefined;
  const subjectName =
    typeof course.subjectId === 'object' ? course.subjectId?.name : undefined;
  const teacherName =
    typeof course.teacherId === 'object'
      ? course.teacherId?.name
      : (course.teacherId as string | undefined);

  return (
    <div className={spacing.pageContainer}>
      {/* ── Header row ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(basePath)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> {t('backToCourses')}
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`${basePath}/${course._id}/edit`)}
            className="flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" /> {t('edit')}
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => navigate(`${basePath}/${course._id}/lessons/new`)}
          >
            <Plus className="w-4 h-4 mr-2" /> {t('addLesson')}
          </Button>
        </div>
      </div>

      {/* ── Course info card ────────────────────────────────────── */}
      <Card className={`${cardVariants.default} mb-6`}>
        <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-6">
          {course.thumbnail && (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}
          <CardTitle className="text-2xl">{course.title}</CardTitle>
          {course.description && (
            <p className="text-slate-500 mt-2 leading-relaxed">{course.description}</p>
          )}
          {/* Stage / Subject badges */}
          <div className="flex flex-wrap gap-2 mt-3">
            {stageName && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
                {t('stage')}: {stageName}
              </span>
            )}
            {subjectName && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                {t('subject')}: {subjectName}
              </span>
            )}
          </div>
        </CardHeader>

        {/* Meta fields row */}
        <CardContent className="pt-6">
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {course.price !== undefined && (
              <div className="space-y-1">
                <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> {t('price')}
                </dt>
                <dd className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  ${course.price}
                </dd>
              </div>
            )}
            {teacherName && (
              <div className="space-y-1">
                <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <User className="w-3 h-3" /> {t('teacher')}
                </dt>
                <dd className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {teacherName}
                </dd>
              </div>
            )}
            {course.createdAt && (
              <div className="space-y-1">
                <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {t('createdAt')}
                </dt>
                <dd className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {new Date(course.createdAt).toLocaleDateString(locale)}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* ── Lesson list card ────────────────────────────────────── */}
      <Card className={cardVariants.default}>
        <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              {t('courseLessonsTitle')}
            </CardTitle>
            <span className="text-xs text-slate-400">
              {lessons.length} {t('lessonCount')}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {lessonsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
                />
              ))}
            </div>
          ) : lessons.length === 0 ? (
            <div className="py-8">
              <EmptyState description={t('noLessons')} />
              <div className="text-center mt-4">
                <Button
                  onClick={() => navigate(`${basePath}/${course._id}/lessons/new`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" /> {t('addLesson')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {[...lessons]
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((lesson, index, sorted) => (
                  <div
                    key={lesson._id}
                    className="flex items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    {/* Left: icon + title */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs text-slate-500 font-medium">
                        {index + 1}
                      </span>
                      {lesson.videoUrl ? (
                        <PlayCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 dark:text-slate-100 truncate">
                          {lesson.title}
                        </p>
                        {lesson.description && (
                          <p className="text-xs text-slate-500 truncate">
                            {lesson.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={index === 0 || reorderMutation.isPending}
                        title={t('moveUp')}
                        onClick={() => handleMove(index, 'up')}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={index === sorted.length - 1 || reorderMutation.isPending}
                        title={t('moveDown')}
                        onClick={() => handleMove(index, 'down')}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8"
                        onClick={() => navigate(`/lesson/${lesson._id}`)}
                      >
                        {t('view')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() =>
                          navigate(
                            `${basePath}/${course._id}/lessons/${lesson._id}/edit`
                          )
                        }
                      >
                        <Pencil className="w-3 h-3 mr-1" /> {t('edit')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => setDeletingId(lesson._id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deletingId}
        title={t('deleteLesson')}
        description={t('deleteLessonConfirm')}
        confirmLabel={t('confirmDelete')}
        tone="danger"
        onConfirm={async () => {
          if (deletingId) await deleteMutation.mutateAsync(deletingId);
        }}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
