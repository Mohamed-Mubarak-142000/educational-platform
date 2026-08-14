import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { deleteTeacher, getTeachers, type Teacher } from '@/api/adminApi';
import { getSubjects, getStages, type Subject, type Stage } from '@/api/subjectApi';
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

export default function AdminTeachers() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [selectedStageIds, setSelectedStageIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Everything below is resolved server-side: the query key encodes every
  // filter/search/sort input so React Query refetches from the API instead
  // of the frontend slicing an already-fetched list.
  const { data: teachers, deleteMutation, isLoading, isError, refetch } = useCRUDOperations<Teacher, unknown, unknown>({
    queryKey: [
      'teachers',
      JSON.stringify({ search: debouncedSearch, status: statusFilter, selectedSubjectIds, selectedStageIds, sortBy, sortOrder }),
    ],
    queryFn: () =>
      getTeachers({
        search: debouncedSearch || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        subjectIds: selectedSubjectIds,
        stageIds: selectedStageIds,
        sortBy,
        sortOrder,
      }),
    deleteFn: deleteTeacher,
    deleteSuccessMessage: t('toastTeacherDeleted'),
  });

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: () => getSubjects(),
  });

  const { data: stages = [] } = useQuery<Stage[]>({
    queryKey: ['stages'],
    queryFn: getStages,
  });

  const activeFilterCount =
    selectedSubjectIds.length + selectedStageIds.length + (statusFilter !== 'all' ? 1 : 0);

  const resetFilters = () => {
    setSelectedSubjectIds([]);
    setSelectedStageIds([]);
    setStatusFilter('all');
  };

  const subjectOptions: MultiSelectOption[] = subjects.map((subject) => ({
    id: subject._id,
    label: getLocalizedName(subject, i18n.language),
    icon: subject.icon,
  }));

  const stageOptions: MultiSelectOption[] = stages.map((stage) => ({
    id: stage._id,
    label: getLocalizedName(stage, i18n.language),
    icon: stage.icon,
  }));

  const handleDelete = (teacherId: string) => {
    setSelectedTeacherId(teacherId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedTeacherId) {
      await deleteMutation.mutateAsync(selectedTeacherId);
    }
    setDeleteConfirmOpen(false);
    setSelectedTeacherId(null);
  };

  // Define table columns
  const columns: TableColumn<Teacher>[] = [
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
    { key: 'subject', label: t('subject'), render: (v) => (typeof v === 'string' && v ? v : '-') },
    {
      key: 'assignmentStages',
      label: t('assignedStages'),
      sortable: false,
      render: (v) => {
        const teacherStages = Array.isArray(v) ? (v as Teacher['assignmentStages']) : [];
        if (!teacherStages || teacherStages.length === 0) return '-';
        return (
          <div className="flex flex-wrap gap-1">
            {teacherStages.map((stage) => (
              <span
                key={stage._id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/50"
              >
                {stage.icon && <span>{stage.icon}</span>}
                {getLocalizedName(stage, i18n.language)}
              </span>
            ))}
          </div>
        );
      },
    },
    { key: 'phone', label: t('phone'), render: (v) => (typeof v === 'string' && v ? v : '-') },
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

      <Card className={`${cardVariants.default} border-0 shadow-none rounded-[2rem]`}>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle>{t('teachersTableTitle')}</CardTitle>
          <div className="flex items-center gap-3">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('searchTeacherPlaceholder')}
              className="w-full sm:w-64"
            />
            <FilterDialog activeCount={activeFilterCount} onReset={resetFilters}>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                {t('filterBySubject')}
              </label>
              <MultiSelectDropdown
                options={subjectOptions}
                selectedIds={selectedSubjectIds}
                onChange={setSelectedSubjectIds}
                placeholder={t('selectSubjectsPlaceholder')}
                selectedCountLabel={(count) => t('subjectsSelectedCount', { count })}
                emptyMessage={t('noSubjects')}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                {t('assignedStages')}
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
          {isError ? (
            <ErrorState onRetry={refetch} />
          ) : (
          <DataTable
            columns={columns}
            data={teachers ?? []}
            isLoading={isLoading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={(key, order) => {
              setSortBy(key);
              setSortOrder(order);
            }}
            actions={(teacher) => (
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
          )}
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
