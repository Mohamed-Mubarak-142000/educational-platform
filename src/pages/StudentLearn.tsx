import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { getStageById, getSubjectsByStage, type Stage, type Subject } from '@/api/subjectApi';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { ChevronRight, GraduationCap, AlertCircle } from 'lucide-react';
import { spacing } from '@/lib/constants';
import { getLocalizedName } from '@/lib/localeUtils';

const SUBJECT_COLORS: Record<string, string> = {
  emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50',
  blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/50',
  violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800/50',
  amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50',
  rose: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50',
};
function sColor(c: string) { return SUBJECT_COLORS[c] ?? SUBJECT_COLORS.blue; }

const STAGE_COLORS: Record<string, string> = {
  emerald: 'from-emerald-500 to-teal-600',
  blue: 'from-blue-500 to-indigo-600',
  violet: 'from-violet-500 to-purple-600',
  amber: 'from-amber-500 to-orange-600',
  rose: 'from-rose-500 to-pink-600',
};
function sgColor(c: string) { return STAGE_COLORS[c] ?? STAGE_COLORS.blue; }

export default function StudentLearn() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const stageId = user?.stageId || '';

  const { data: stage } = useQuery<Stage>({
    queryKey: ['stage', stageId],
    queryFn: () => getStageById(stageId),
    enabled: !!stageId,
  });

  const { data: subjects = [], isLoading } = useQuery<Subject[]>({
    queryKey: ['subjects-by-stage', stageId],
    queryFn: () => getSubjectsByStage(stageId),
    enabled: !!stageId,
  });

  if (!stageId) {
    return (
      <div className={spacing.pageContainer}>
        <div className="max-w-md mx-auto mt-12">
          <Card className="border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/10">
            <CardContent className="py-10 text-center space-y-4">
              <AlertCircle className="w-10 h-10 mx-auto text-amber-500" />
              <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{t('noStageSet')}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t('setStageInProfile')}
                </p>
              </div>
              <Button
                onClick={() => navigate('/student')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {t('goToProfile')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={spacing.pageContainer}>
      {/* Stage header */}
      {stage && (
        <div className={`bg-gradient-to-r ${sgColor(stage.color ?? 'blue')} rounded-2xl px-6 py-5 mb-8 flex items-center gap-4`}>
          <span className="text-4xl">{stage.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-white">{getLocalizedName(stage, i18n.language)}</h1>
            {stage.description && (
              <p className="text-sm text-white/80 mt-0.5">{stage.description}</p>
            )}
          </div>
        </div>
      )}

      {/* Subjects */}
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('availableSubjects')}</h2>
        <span className="text-sm text-slate-400 dark:text-slate-500 ml-1">
          ({subjects.length})
        </span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <Card className="border border-slate-200 dark:border-slate-800 border-dashed">
          <CardContent className="py-16 text-center">
            <EmptyState
              description={`${t('noSubjectsAvailable')} ${t('checkBackSoon')}`}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {subjects.map((subject: Subject) => (
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
              </div>
              <ChevronRight className="w-4 h-4 opacity-50 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
