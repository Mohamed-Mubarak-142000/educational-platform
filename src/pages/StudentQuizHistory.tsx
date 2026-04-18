/**
 * StudentQuizHistory.tsx
 *
 * Shows a student's quiz attempt history — all submitted quiz grades.
 *
 * Route: /student/quiz-history
 */
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getGradesByStudent, type QuizGrade } from '@/api/subjectApi';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { spacing } from '@/lib/constants';

function ScoreBadge({ score }: { score: number }) {
  if (score >= 70) {
    return (
      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
        <CheckCircle2 className="w-3 h-3" /> {score}%
      </span>
    );
  }
  if (score >= 40) {
    return (
      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
        <Clock className="w-3 h-3" /> {score}%
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40">
      <XCircle className="w-3 h-3" /> {score}%
    </span>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function QuizHistoryRowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm animate-pulse">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
        <div className="min-w-0 space-y-2">
          <div className="h-4 w-44 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
      <div className="h-6 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

export default function StudentQuizHistory() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: grades, isLoading } = useQuery<QuizGrade[]>({
    queryKey: ['quiz-grades', user?._id],
    queryFn: () => getGradesByStudent(user!._id),
    enabled: !!user?._id,
  });
  const resolvedGrades = grades ?? [];
  const showSkeleton = isLoading || grades === undefined;

  return (
    <div className={spacing.pageContainer}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" /> {t('back')}
        </Button>
        <span className="text-slate-300 dark:text-slate-600">/</span>
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t('quizHistoryTitle')}</h1>
        </div>
      </div>

      {/* Content */}
      {showSkeleton ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <QuizHistoryRowSkeleton key={i} />
          ))}
        </div>
      ) : resolvedGrades.length === 0 ? (
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="py-16 text-center">
            <EmptyState description={t('quizHistoryEmpty')} />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {resolvedGrades.map((grade, idx) => (
            <motion.div
              key={grade._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="flex items-center justify-between gap-4 px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-white text-sm ${
                  grade.score >= 70
                    ? 'bg-emerald-500'
                    : grade.score >= 40
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}>
                  {grade.score}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {t('quizHistoryResult', { correct: grade.correctCount, total: grade.totalQuestions })}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {formatDate(grade.completedAt || grade.createdAt)}
                  </p>
                </div>
              </div>
              <ScoreBadge score={grade.score} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
