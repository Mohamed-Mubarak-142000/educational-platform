import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteCourse, getCourses } from '@/api/courseApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useTranslation } from 'react-i18next';
import { useCRUDOperations } from '@/hooks';
import { cardVariants, buttonVariants, spacing } from '@/lib/constants';
import { PageHeader, DataTable } from '@/components/shared';
import type { TableColumn } from '@/components/shared';
import { Pencil, Trash2, Plus, Eye } from 'lucide-react';

export default function AdminCourses() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // CRUD operations hook
  const { data: courses, deleteMutation } = useCRUDOperations({
    queryKey: ['courses'],
    queryFn: getCourses,
    deleteFn: deleteCourse,
    deleteSuccessMessage: t('toastCourseDeleted'),
  });

  const handleDelete = (courseId: string) => {
    setSelectedCourseId(courseId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (selectedCourseId) {
      deleteMutation.mutate(selectedCourseId);
    }
    setDeleteConfirmOpen(false);
    setSelectedCourseId(null);
  };

  // Define table columns
  const columns: TableColumn[] = [
    { key: 'title', label: t('title') },
    { key: 'price', label: t('price'), render: (v) => `$${v}` },
    { key: 'teacherId.name', label: t('teacher'), render: (v) => v || '-' },
  ];

  return (
    <div className={spacing.pageContainer}>
      <PageHeader
        title={t('adminCourses')}
        subtitle={t('adminCoursesSubtitle')}
        action={
          <Button 
            onClick={() => navigate('/admin/courses/new')} 
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
          <DataTable
            columns={columns}
            data={courses}
            actions={(course: any) => (
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  title={t('view')}
                  className="h-8 w-8 p-0"
                  onClick={() => navigate(`/admin/courses/${course._id}`)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  title={t('edit')}
                  className="h-8 w-8 p-0"
                  onClick={() => navigate(`/admin/courses/${course._id}/edit`)}
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
