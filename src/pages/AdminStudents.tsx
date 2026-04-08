import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { deleteStudent, getStudents, getSubscriptions } from '@/api/adminApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useTranslation } from 'react-i18next';
import { useCRUDOperations } from '@/hooks';
import { cardVariants, buttonVariants, spacing } from '@/lib/constants';
import { PageHeader, DataTable, ErrorState } from '@/components/shared';
import type { TableColumn } from '@/components/shared';
import { Pencil, Trash2, Plus, Eye } from 'lucide-react';

export default function AdminStudents() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const { data: students = [], isLoading: studentsLoading, isError: studentsError, refetch: refetchStudents } = useQuery({
    queryKey: ['students'],
    queryFn: getStudents,
  });
  
  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: getSubscriptions,
  });

  // CRUD operations hook
  const { deleteMutation } = useCRUDOperations({
    queryKey: ['students'],
    queryFn: getStudents,
    deleteFn: deleteStudent,
    deleteSuccessMessage: t('toastStudentDeleted'),
  });

  const subscriptionMap = useMemo(() => {
    const map = new Map<string, any>();
    subscriptions.forEach((sub: any) => {
      map.set(sub.studentId?._id || sub.studentId, sub);
    });
    return map;
  }, [subscriptions]);

  const handleDelete = (studentId: string) => {
    setSelectedStudentId(studentId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (selectedStudentId) {
      deleteMutation.mutate(selectedStudentId);
    }
    setDeleteConfirmOpen(false);
    setSelectedStudentId(null);
  };

  // Define table columns
  const columns: TableColumn[] = [
    { 
      key: 'profileImage', 
      label: t('photo'), 
      render: (v, row: any) => v ? (
        <img src={v} alt={t('profilePhotoAlt')} className="w-10 h-10 rounded-full object-cover" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
          {(row?.name || 'U')[0]}
        </div>
      )
    },
    { key: 'name', label: t('name') },
    { key: 'email', label: t('email') },
    { key: 'phone', label: t('phone'), render: (v) => v || '-' },
    { 
      key: '_id', 
      label: t('plan'), 
      render: (v) => subscriptionMap.get(v)?.plan || t('noPlan') 
    },
    { 
      key: '_id', 
      label: t('subscription'), 
      render: (v) => subscriptionMap.get(v)?.status || t('inactive') 
    },
  ];

  return (
    <div className={spacing.pageContainer}>
      <PageHeader
        title={t('adminStudents')}
        subtitle={t('adminStudentsSubtitle')}
        action={
          <Button 
            onClick={() => navigate('/admin/students/new')} 
            className={buttonVariants.primary}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('addStudent')}
          </Button>
        }
      />

      <Card className={cardVariants.default}>
        <CardHeader>
          <CardTitle>{t('studentsTableTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {studentsError ? (
            <ErrorState onRetry={refetchStudents} />
          ) : (
          <DataTable
            columns={columns}
            data={students}
            isLoading={studentsLoading}
            actions={(student: any) => (
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  title={t('view')}
                  className="h-8 w-8 p-0"
                  onClick={() => navigate(`/admin/students/${student._id}`)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  title={t('edit')}
                  className="h-8 w-8 p-0"
                  onClick={() => navigate(`/admin/students/${student._id}/edit`)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  title={t('delete')}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  onClick={() => handleDelete(student._id)}
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
        description={t('confirmDeleteStudent')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
