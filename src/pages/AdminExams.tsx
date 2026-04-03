import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteExam, getExams } from '@/api/examApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useTranslation } from 'react-i18next';
import { useCRUDOperations } from '@/hooks';
import { cardVariants, buttonVariants, spacing } from '@/lib/constants';
import { PageHeader, DataTable } from '@/components/shared';
import type { TableColumn } from '@/components/shared';
import { Pencil, Trash2, Plus, Eye } from 'lucide-react';

export default function AdminExams() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

  // CRUD operations hook
  const { data: exams, deleteMutation } = useCRUDOperations({
    queryKey: ['exams'],
    queryFn: getExams,
    deleteFn: deleteExam,
    deleteSuccessMessage: t('toastExamDeleted'),
  });

  const handleDelete = (examId: string) => {
    setSelectedExamId(examId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (selectedExamId) {
      deleteMutation.mutate(selectedExamId);
    }
    setDeleteConfirmOpen(false);
    setSelectedExamId(null);
  };

  // Define table columns
  const columns: TableColumn[] = [
    { key: 'title', label: t('title') },
    { key: 'lessonId', label: t('lessonId'), render: (v) => v || '-' },
    { key: 'timeLimit', label: t('timeLimit'), render: (v) => `${v} ${t('minutesShort')}` },
  ];

  return (
    <div className={spacing.pageContainer}>
      <PageHeader
        title={t('adminExams')}
        subtitle={t('adminExamsSubtitle')}
        action={
          <Button 
            onClick={() => navigate('/admin/exams/new')} 
            className={buttonVariants.primary}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('addExam')}
          </Button>
        }
      />

      <Card className={cardVariants.default}>
        <CardHeader>
          <CardTitle>{t('examsTableTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={exams}
            actions={(exam: any) => (
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  title={t('view')}
                  className="h-8 w-8 p-0"
                  onClick={() => navigate(`/admin/exams/${exam._id}`)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  title={t('edit')}
                  className="h-8 w-8 p-0"
                  onClick={() => navigate(`/admin/exams/${exam._id}/edit`)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  title={t('delete')}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  onClick={() => handleDelete(exam._id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* Results are now in the detail page at /admin/exams/:id */}

      <ConfirmDialog
        open={deleteConfirmOpen}
        title={t('confirmDelete')}
        description={t('confirmDeleteExam')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setSelectedExamId(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
