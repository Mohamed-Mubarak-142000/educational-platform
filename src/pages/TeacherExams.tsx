import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteExam, getMyExams, type Exam } from '@/api/examApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useTranslation } from 'react-i18next';
import { useCRUDOperations } from '@/hooks';
import { cardVariants, buttonVariants, spacing } from '@/lib/constants';
import { PageHeader, DataTable, ErrorState } from '@/components/shared';
import type { TableColumn } from '@/components/shared';
import { Pencil, Trash2, Plus, Eye } from 'lucide-react';

export default function TeacherExams() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

  const { data: exams, deleteMutation, isLoading, isError, refetch } = useCRUDOperations({
    queryKey: ['my-exams'],
    queryFn: getMyExams,
    deleteFn: deleteExam,
    deleteSuccessMessage: t('toastExamDeleted'),
  });

  const handleDelete = (examId: string) => {
    setSelectedExamId(examId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (selectedExamId) deleteMutation.mutate(selectedExamId);
    setDeleteConfirmOpen(false);
    setSelectedExamId(null);
  };

  const columns: TableColumn[] = [
    { key: 'title', label: t('title') },
    { key: 'lessonId', label: t('lesson'), render: (v) => (typeof v === 'object' && v ? (v as any).title || '-' : (typeof v === 'string' && v ? v : '-')) },
    { key: 'timeLimit', label: t('timeLimit'), render: (v) => `${v} ${t('minutesShort')}` },
  ];

  return (
    <div className={spacing.pageContainer}>
      <PageHeader
        title={t('teacherExams')}
        subtitle={t('adminExamsSubtitle')}
        action={
          <Button onClick={() => navigate('/admin/exams/new')} className={buttonVariants.primary}>
            <Plus className="w-4 h-4 mr-2" /> {t('addExam')}
          </Button>
        }
      />

      <Card className={cardVariants.default}>
        <CardHeader>
          <CardTitle>{t('examsTableTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isError ? (
            <ErrorState onRetry={refetch} />
          ) : (
            <DataTable
              columns={columns}
              data={exams}
              isLoading={isLoading}
              actions={(exam: Exam) => (
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title={t('view')} onClick={() => navigate(`/admin/exams/${exam._id}`)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title={t('edit')} onClick={() => navigate(`/admin/exams/${exam._id}/edit`)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700" title={t('delete')} onClick={() => handleDelete(exam._id)}>
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
        description={t('confirmDeleteExam')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        tone="danger"
        onConfirm={confirmDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setSelectedExamId(null); }}
      />
    </div>
  );
}
