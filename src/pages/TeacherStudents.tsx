import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyStudents, type TeacherStudent } from '@/api/teacherApi';
import { getStages, type Stage } from '@/api/subjectApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, ErrorState } from '@/components/shared';
import type { TableColumn } from '@/components/shared';
import { spacing, cardVariants } from '@/lib/constants';
import { getLocalizedName } from '@/lib/localeUtils';
import { Search } from 'lucide-react';

export default function TeacherStudents() {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState('');

  const { data: students = [], isLoading, isError, refetch } = useQuery<TeacherStudent[]>({
    queryKey: ['my-students'],
    queryFn: getMyStudents,
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) =>
      [s.name, s.email, s.phone].some((v) => (v || '').toLowerCase().includes(q))
    );
  }, [students, query]);

  const columns: TableColumn<TeacherStudent>[] = [
    {
      key: 'profileImage',
      label: t('photo'),
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

      <Card className={cardVariants.default}>
        <CardHeader className="space-y-4">
          <CardTitle>
            {filtered.length} {t('students')}
          </CardTitle>
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchStudentPlaceholder')}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isError ? (
            <ErrorState onRetry={refetch} />
          ) : (
            <DataTable<TeacherStudent>
              columns={columns}
              data={filtered}
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
