import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteTeacher, getTeachers } from '@/api/adminApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useTranslation } from 'react-i18next';
import { useCRUDOperations } from '@/hooks';
import { cardVariants, buttonVariants, spacing } from '@/lib/constants';
import { PageHeader, DataTable } from '@/components/shared';
import type { TableColumn } from '@/components/shared';
import { Pencil, Trash2, Plus, Eye } from 'lucide-react';

export default function AdminTeachers() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

  // CRUD operations hook
  const { data: teachers, deleteMutation } = useCRUDOperations({
    queryKey: ['teachers'],
    queryFn: getTeachers,
    deleteFn: deleteTeacher,
    deleteSuccessMessage: t('toastTeacherDeleted'),
  });

  const handleDelete = (teacherId: string) => {
    setSelectedTeacherId(teacherId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (selectedTeacherId) {
      deleteMutation.mutate(selectedTeacherId);
    }
    setDeleteConfirmOpen(false);
    setSelectedTeacherId(null);
  };

  // Define table columns
  const columns: TableColumn[] = [
    { 
      key: 'profileImage', 
      label: t('photo'), 
      render: (v) => v ? (
        <img src={v} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
          {(teachers.find((t: any) => t.profileImage === v)?.name || 'U')[0]}
        </div>
      )
    },
    { key: 'name', label: t('name') },
    { key: 'email', label: t('email') },
    { key: 'subject', label: t('subject'), render: (v) => v || '-' },
    { key: 'phone', label: t('phone'), render: (v) => v || '-' },
    { key: 'status', label: t('status') },
  ];

  return (
    <div className={spacing.pageContainer}>
      <PageHeader
        title={t('adminTeachers')}
        subtitle={t('adminTeachersSubtitle')}
        action={
          <Button 
            onClick={() => navigate('/admin/teachers/new')} 
            className={buttonVariants.primary}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('addTeacher')}
          </Button>
        }
      />

      <Card className={cardVariants.default}>
        <CardHeader>
          <CardTitle>{t('teachersTableTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={teachers}
            actions={(teacher: any) => (
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  title={t('view')}
                  className="h-8 w-8 p-0"
                  onClick={() => navigate(`/admin/teachers/${teacher._id}`)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  title={t('edit')}
                  className="h-8 w-8 p-0"
                  onClick={() => navigate(`/admin/teachers/${teacher._id}/edit`)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  title={t('delete')}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  onClick={() => handleDelete(teacher._id)}
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
        description={t('confirmDeleteTeacher')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
