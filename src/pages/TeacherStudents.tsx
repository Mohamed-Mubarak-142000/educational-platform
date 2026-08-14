import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyStudents, type TeacherStudent } from '@/api/teacherApi';
import { getStages, type Stage } from '@/api/subjectApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, ErrorState, FilterDialog, MultiSelectDropdown, SearchInput } from '@/components/shared';
import type { TableColumn, MultiSelectOption } from '@/components/shared';
import { spacing, cardVariants } from '@/lib/constants';
import { getLocalizedName } from '@/lib/localeUtils';
import { useDebouncedValue } from '@/hooks';

type StatusFilter = 'all' | 'Active' | 'Inactive';

export default function TeacherStudents() {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query);
  const [selectedStageIds, setSelectedStageIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const listParams = {
    search: debouncedQuery || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    stageIds: selectedStageIds,
    sortBy,
    sortOrder,
  };

  const { data: students = [], isLoading, isError, refetch } = useQuery<TeacherStudent[]>({
    queryKey: ['my-students', JSON.stringify(listParams)],
    queryFn: () => getMyStudents(listParams),
  });

  const { data: stages = [] } = useQuery<Stage[]>({
    queryKey: ['stages'],
    queryFn: getStages,
  });

  function getStageName(stageId?: string | { _id?: string; name?: string; nameAr?: string }) {
    if (!stageId) return '-';
    if (typeof stageId === 'object') return getLocalizedName(stageId as { name: string; nameAr?: string }, i18n.language) || '-';
    const stage = stages.find((s) => s._id === stageId);
    return stage ? getLocalizedName(stage, i18n.language) : '-';
  }

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

  const columns: TableColumn<TeacherStudent>[] = [
    {
      key: 'profileImage',
      label: t('photo'),
      sortable: false,
      render: (v, row) =>
        typeof v === 'string' && v ? (
          <img src={v} alt="" className="w-9 h-9 rounded-full object-cover" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-semibold">
            {(row?.name || 'U')[0]}
          </div>
        ),
    },
    { key: 'name', label: t('name') },
    { key: 'email', label: t('email') },
    { key: 'phone', label: t('phone'), render: (v) => (typeof v === 'string' && v ? v : '-') },
    {
      key: 'stageId',
      label: t('stage'),
      sortable: false,
      render: (v) => getStageName(v as TeacherStudent['stageId']),
    },
    {
      key: 'status',
      label: t('status'),
      render: (v) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            v === 'Active'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
          }`}
        >
          {v === 'Active' ? t('active') : v === 'Inactive' ? t('inactive') : '-'}
        </span>
      ),
    },
  ];

  return (
    <div className={spacing.pageContainer}>
      <PageHeader title={t('myStudents')} subtitle={t('myStudentsSubtitle')} />

      <Card className={`${cardVariants.default} border-0 shadow-none rounded-[2rem]`}>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle>
            {students.length} {t('students')}
          </CardTitle>
          <div className="flex items-center gap-3">
            <SearchInput
              value={query}
              onChange={setQuery}
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
          {isError ? (
            <ErrorState onRetry={refetch} />
          ) : (
            <DataTable<TeacherStudent>
              columns={columns}
              data={students}
              isLoading={isLoading}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={(key, order) => {
                setSortBy(key);
                setSortOrder(order);
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
