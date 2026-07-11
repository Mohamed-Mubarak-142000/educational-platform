import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared';
import { ChevronRight, GraduationCap } from 'lucide-react';
import { spacing } from '@/lib/constants';
import { getLocalizedName } from '@/lib/localeUtils';
import { getSubscribedSubjects, type SubscribedSubject } from '@/api/subjectApi';

const SUBJECT_COLORS: Record<string, string> = {
  emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50',
  blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/50',
  violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800/50',
  amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50',
  rose: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50',
};
function sColor(c: string) { return SUBJECT_COLORS[c] ?? SUBJECT_COLORS.blue; }

function SubjectCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse">
      <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-2 w-full rounded bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
    </div>
  );
}

export default function StudentLearn() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data: subjects, isLoading } = useQuery<SubscribedSubject[]>({
    queryKey: ['subscribed-subjects'],
    queryFn: getSubscribedSubjects,
  });
  const resolvedSubjects = subjects ?? [];
  const showSkeleton = isLoading || subjects === undefined;

  return (
    <div className={spacing.pageContainer}>
      {/* Subjects */}
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap className="w-5 h-5 text-violet-600" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('studentLearn')}</h2>
        <span className="text-sm text-slate-400 dark:text-slate-500 ml-1">({resolvedSubjects.length})</span>
      </div>

      {showSkeleton ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SubjectCardSkeleton key={i} />
          ))}
        </div>
      ) : resolvedSubjects.length === 0 ? (
        <Card className="border border-slate-200 dark:border-slate-800 border-dashed">
          <CardContent className="py-16 text-center">
            <EmptyState description={t('notEnrolledYet')} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {resolvedSubjects.map((subject: SubscribedSubject) => (
            <button
              key={subject._id}
              onClick={() => navigate(`/student/subjects/${subject._id}`)}
              className={`flex items-center gap-4 p-5 rounded-xl border text-left transition-transform hover:scale-[1.015] hover:shadow-md ${sColor(subject.color ?? 'blue')}`}
            >
              <span className="text-3xl flex-shrink-0">{subject.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base truncate">{getLocalizedName(subject, i18n.language)}</p>
                {subject.description && (
                  <p className="text-xs opacity-70 truncate mt-0.5">{subject.description}</p>
                )}
                {subject.progressPercentage !== null && subject.progressPercentage !== undefined && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{t('progressLabel')}</span>
                      <span>{subject.progressPercentage}%</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-violet-600"
                        style={{ width: `${subject.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <ChevronRight className="w-4 h-4 opacity-50 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
