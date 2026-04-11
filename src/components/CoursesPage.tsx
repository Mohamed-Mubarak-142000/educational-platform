/**
 * CoursesPage – shared courses listing page used by both AdminCourses and TeacherCourses.
 *
 * Renders the exact same UI for admin and teacher. The only differences are:
 *  - basePath  (navigation prefix)
 *  - queryKey  (React Query cache key)
 *  - queryFn   (API call – getCourses vs getMyCourses)
 *  - title / subtitle (i18n strings passed in)
 *  - showTeacher (admin sees teacher column, teacher doesn't need it)
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteCourse, type Course } from '@/api/courseApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useTranslation } from 'react-i18next';
import { useCRUDOperations } from '@/hooks';
import { cardVariants, buttonVariants, spacing } from '@/lib/constants';
import { PageHeader, DataTable, ErrorState } from '@/components/shared';
import type { TableColumn } from '@/components/shared';
import { Pencil, Trash2, Plus, Eye } from 'lucide-react';

interface CoursesPageProps {
  /** Navigation prefix, e.g. '/admin/courses' or '/teacher/courses' */
  basePath: string;
  /** React Query cache key */
  queryKey: string[];
  /** API fetch function */
  queryFn: () => Promise<Course[]>;
  /** Localised page title */
  title: string;
  /** Localised page subtitle */
  subtitle: string;
  /** When true, add a Teacher column (admin view). Default: false */
  showTeacher?: boolean;
}

export default function CoursesPage({
  basePath,
  queryKey,
  queryFn,
  title,
  subtitle,
  showTeacher = false,
}: CoursesPageProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const { data: courses, deleteMutation, isLoading, isError, refetch } =
    useCRUDOperations({
      queryKey,
      queryFn,
      deleteFn: deleteCourse,
      deleteSuccessMessage: t('toastCourseDeleted'),
    });

  const handleDelete = (courseId: string) => {
    setSelectedCourseId(courseId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (selectedCourseId) deleteMutation.mutate(selectedCourseId);
    setDeleteConfirmOpen(false);
    setSelectedCourseId(null);
  };

  const columns: TableColumn[] = [
    { key: 'title', label: t('title') },
    { key: 'price', label: t('price'), render: (v) => `$${v}` },
    ...(showTeacher
      ? [
          {
            key: 'teacherId.name',
            label: t('teacher'),
            render: (v: unknown) => (typeof v === 'string' && v ? v : '-'),
          } satisfies TableColumn,
        ]
      : []),
    {
      key: 'stageId.name',
      label: t('stage'),
      render: (v) => (typeof v === 'string' && v ? v : '-'),
    },
    {
      key: 'subjectId.name',
      label: t('subject'),
      render: (v) => (typeof v === 'string' && v ? v : '-'),
    },
  ];

  return (
    <div className={spacing.pageContainer}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        action={
          <Button
            onClick={() => navigate(`${basePath}/new`)}
            className={buttonVariants.primary}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('addCourse')}
          </Button>
        }
      />

      <Card className={cardVariants.default}>
        <CardHeader>
          <CardTitle>{t('coursesTableTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isError ? (
            <ErrorState onRetry={refetch} />
          ) : (
            <DataTable
              columns={columns}
              data={courses}
              isLoading={isLoading}
              actions={(course: Course) => (
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    title={t('view')}
                    className="h-8 w-8 p-0"
                    onClick={() => navigate(`${basePath}/${course._id}`)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    title={t('edit')}
                    className="h-8 w-8 p-0"
                    onClick={() => navigate(`${basePath}/${course._id}/edit`)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    title={t('delete')}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    onClick={() => handleDelete(course._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteConfirmOpen}
        title={t('confirmDelete')}
        description={t('confirmDeleteCourse')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setSelectedCourseId(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
