import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTeachersDirectory } from '@/api/teacherDirectoryApi';
import { getStages, type Stage } from '@/api/subjectApi';
import { getLocalizedName } from '@/lib/localeUtils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/shared';
import { Search, Users } from 'lucide-react';
import { spacing } from '@/lib/constants';

const colorByIndex = ['from-blue-500 to-indigo-600', 'from-emerald-500 to-teal-600', 'from-amber-500 to-orange-600', 'from-rose-500 to-pink-600', 'from-violet-500 to-purple-600'];

function getStageName(stageId?: string | { _id?: string; name?: string; nameAr?: string }, stages?: Stage[], language = 'en') {
  if (!stageId) return '';
  if (typeof stageId === 'object') return getLocalizedName(stageId as { name: string; nameAr?: string }, language);
  const found = stages?.find((s) => s._id === stageId);
  return found ? getLocalizedName(found, language) : '';
}

export default function StudentTeachers() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('');

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ['teachers-directory'],
    queryFn: getTeachersDirectory,
  });

  const { data: stages = [] } = useQuery<Stage[]>({
    queryKey: ['stages'],
    queryFn: getStages,
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return teachers.filter((teacher) => {
      const stageName = getStageName(teacher.stageId, stages, i18n.language).toLowerCase();
      const matchesStage = stageFilter ? (typeof teacher.stageId === 'string' ? teacher.stageId === stageFilter : teacher.stageId?._id === stageFilter) : true;
      const matchesQuery = q
        ? [teacher.name, teacher.subject, stageName].some((v) => (v || '').toLowerCase().includes(q))
        : true;
      return matchesStage && matchesQuery;
    });
  }, [teachers, query, stageFilter, stages, i18n.language]);

  return (
    <div className={spacing.pageContainer}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" /> {t('teachersDirectoryTitle')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('teachersDirectorySubtitle')}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchTeacherPlaceholder')}
              className="pl-9"
            />
          </div>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="h-10 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm"
          >
            <option value="">{t('allStages')}</option>
            {stages.map((stage) => (
              <option key={stage._id} value={stage._id}>
                {getLocalizedName(stage, i18n.language)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border border-slate-200 dark:border-slate-800 border-dashed">
          <CardContent className="py-16 text-center">
            <EmptyState description={t('noTeachersFound')} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((teacher, idx) => {
            const stageName = getStageName(teacher.stageId, stages, i18n.language);
            return (
              <Card key={teacher._id} className="border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className={`h-16 bg-gradient-to-r ${colorByIndex[idx % colorByIndex.length]}`} />
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl">
                      {teacher.profileImage ? (
                        <img src={teacher.profileImage} alt={teacher.name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <span>{(teacher.name || '?').slice(0, 1)}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{teacher.name}</p>
                      {teacher.subject && <p className="text-xs text-slate-500 truncate">{teacher.subject}</p>}
                    </div>
                  </div>
                  {stageName && (
                    <div className="text-xs text-slate-500">{t('stage')}: {stageName}</div>
                  )}
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => navigate(`/student/teachers/${teacher._id}`)}
                  >
                    {t('viewTeacherProfile')}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
