import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { deleteStudent, getStudents, type Student } from '@/api/adminApi';
import { getStages, type Stage } from '@/api/subjectApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useTranslation } from 'react-i18next';
import { useCRUDOperations, useDebouncedValue } from '@/hooks';
import { cardVariants, buttonVariants, spacing } from '@/lib/constants';
import { PageHeader, DataTable, ErrorState, FilterDialog, MultiSelectDropdown, SearchInput } from '@/components/shared';
import type { TableColumn, MultiSelectOption } from '@/components/shared';
import { getLocalizedName } from '@/lib/localeUtils';
import { Pencil, Trash2, Plus, Eye } from 'lucide-react';

type StatusFilter = 'all' | 'Active' | 'Inactive';

export default function AdminStudents() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery);
  const [selectedStageIds, setSelectedStageIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const studentListParams = {
    search: debouncedSearch || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    stageIds: selectedStageIds,
    sortBy,
    sortOrder,
  };

  const { data: students = [], isLoading: studentsLoading, isError: studentsError, refetch: refetchStudents } = useQuery<Student[]>({
    queryKey: ['students', JSON.stringify(studentListParams)],
    queryFn: () => getStudents(studentListParams),
  });

  const { data: stages = [] } = useQuery<Stage[]>({
    queryKey: ['stages'],
    queryFn: getStages,
  });

  // CRUD operations hook
  const { deleteMutation } = useCRUDOperations({
    queryKey: ['students'],
    queryFn: () => getStudents(),
    deleteFn: deleteStudent,
    deleteSuccessMessage: t('toastStudentDeleted'),
  });

  const activeFilterCount = selectedStageIds.length + (statusFilter !== 'all' ? 1 : 0);

  const resetFilters = () => {
    setSelectedStageIds([]);
    setStatusFilter('all');
  };

  const stageOptions: MultiSelectOption[] = stages.map((stage) => ({
    id: stage._id,
    label: getLocalizedName(stage, i18n.language),
    icon: stage.icon,
  }));

  const handleDelete = (studentId: string) => {
    setSelectedStudentId(studentId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedStudentId) {
      await deleteMutation.mutateAsync(selectedStudentId);
    }
    setDeleteConfirmOpen(false);
    setSelectedStudentId(null);
  };

  // Define table columns
  const columns: TableColumn<Student>[] = [
    {
      key: 'profileImage',
      label: t('photo'),
      sortable: false,
      render: (v, row) => typeof v === 'string' && v ? (
        <img src={v} alt={t('profilePhotoAlt')} className="w-10 h-10 rounded-full object-cover" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
          {(row?.name || 'U')[0]}
        </div>
      )
    },
    { key: 'name', label: t('name') },
    { key: 'email', label: t('email') },
    {
      key: 'stageId',
      label: t('stage'),
      sortable: false,
      render: (v) => {
        const stage = stages.find((s) => s._id === v);
        return stage ? getLocalizedName(stage, i18n.language) : '-';
      },
    },
    { key: 'phone', label: t('phone'), render: (v) => (typeof v === 'string' && v ? v : '-') },
    { key: 'status', label: t('status') },
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

      <Card className={`${cardVariants.default} border-0 shadow-none rounded-[2rem]`}>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle>{t('studentsTableTitle')}</CardTitle>
          <div className="flex items-center gap-3">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('searchStudentPlaceholder')}
              className="w-full sm:w-64"
            />
            <FilterDialog activeCount={activeFilterCount} onReset={resetFilters}>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  {t('stage')}
                </label>
                <MultiSelectDropdown
                  options={stageOptions}
                  selectedIds={selectedStageIds}
                  onChange={setSelectedStageIds}
                  placeholder={t('selectStagesPlaceholder')}
                  selectedCountLabel={(count) => t('stagesSelectedCount', { count })}
                  emptyMessage={t('noStages')}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  {t('status')}
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100"
                >
                  <option value="all">{t('allStatuses')}</option>
                  <option value="Active">{t('active')}</option>
                  <option value="Inactive">{t('inactive')}</option>
                </select>
              </div>
            </FilterDialog>
          </div>
        </CardHeader>
        <CardContent>
          {studentsError ? (
            <ErrorState onRetry={refetchStudents} />
          ) : (
          <DataTable
            columns={columns}
            data={students}
            isLoading={studentsLoading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={(key, order) => {
              setSortBy(key);
              setSortOrder(order);
            }}
            actions={(student) => (
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
