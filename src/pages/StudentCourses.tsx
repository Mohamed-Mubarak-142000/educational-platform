import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { getLocalizedName } from '@/lib/localeUtils';
import { getGradeById, getSubjectsByGrade, type GradeSubjectSummary } from '@/api/gradeApi';
import { getSubjectsByStage, type Subject } from '@/api/subjectApi';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronRight, GraduationCap, AlertCircle } from 'lucide-react';
import { spacing } from '@/lib/constants';

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
      </div>
      <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
    </div>
  );
}

export default function StudentCourses() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, isLoading: profileLoading } = useAuth();

  const gradeId = user?.gradeId || '';
  const stageId = user?.stageId || '';

  const { data: grade } = useQuery({
    queryKey: ['grade', gradeId],
    queryFn: () => getGradeById(gradeId),
    enabled: !!gradeId,
  });

  const { data: subjects, isLoading } = useQuery<GradeSubjectSummary[] | Subject[]>({
    queryKey: gradeId ? ['grade-subjects', gradeId] : ['stage-subjects', stageId],
    queryFn: () => (gradeId ? getSubjectsByGrade(gradeId) : getSubjectsByStage(stageId)),
    enabled: !!gradeId || !!stageId,
  });
  const resolvedSubjects = subjects ?? [];
  const showSkeleton = isLoading || subjects === undefined;

  if (profileLoading) {
    return (
      <div className={spacing.pageContainer}>
        <div className="max-w-md mx-auto mt-12">
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="py-10 text-center space-y-3">
              <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse mx-auto" />
              <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800 mx-auto" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!gradeId && !stageId) {
    return (
      <div className={spacing.pageContainer}>
        <div className="max-w-md mx-auto mt-12">
          <Card className="border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/10">
            <CardContent className="py-10 text-center space-y-4">
              <AlertCircle className="w-10 h-10 mx-auto text-amber-500" />
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{t('noStageSet')}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('setStageInProfile')}</p>
              </div>
              <Button onClick={() => navigate('/student')} className="bg-blue-600 hover:bg-blue-700 text-white">
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
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('stageCourses')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {grade ? getLocalizedName(grade, i18n.language) : t('loading')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <GraduationCap className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('availableSubjects')}</h2>
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
            <EmptyState description={t('noSubjectsAvailable')} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {resolvedSubjects.map((subject: GradeSubjectSummary | Subject) => (
            <button
              key={subject._id}
              onClick={() => navigate(`/student/subjects/${subject._id}`, { state: { gradeId, stageId } })}
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
