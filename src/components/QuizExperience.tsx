import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared';
import { Clock, CheckCircle2, XCircle, ClipboardList, Trophy } from 'lucide-react';
import {
  getQuestionsByQuiz,
  saveQuizGrade,
  type LessonPartQuizItem,
  type QuizQuestion,
  type QuizGradeResult,
} from '@/api/subjectApi';

const OPT_LABELS = ['A', 'B', 'C', 'D'] as const;

type NormalizedQuestion = {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
};

type QuizSource =
  | { mode: 'attached'; quizId: string; timeLimitMinutes?: number; studentId?: string }
  | { mode: 'inline'; questions: LessonPartQuizItem[] };

type QuizExperienceProps = {
  title?: string;
  source: QuizSource;
  previewMode?: boolean;
  onComplete?: (_score: number, _correctCount: number, _total: number) => void;
  className?: string;
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function QuizExperience({
  title,
  source,
  previewMode,
  onComplete,
  className,
}: QuizExperienceProps) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<'taking' | 'result'>('taking');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  // Correct answers are withheld from the fetched questions while a student
  // is taking the quiz; they're only revealed once the server confirms the
  // graded attempt, via this state.
  const [result, setResult] = useState<QuizGradeResult | null>(null);

  const isAttached = source.mode === 'attached';
  const quizId = isAttached ? source.quizId : '';
  const timeLimitMinutes = isAttached ? source.timeLimitMinutes : undefined;

  const { data: fetchedQuestions = [], isLoading } = useQuery<QuizQuestion[]>({
    queryKey: ['quiz-questions', quizId],
    queryFn: () => getQuestionsByQuiz(quizId),
    enabled: isAttached && !!quizId,
  });

  const normalizedQuestions: NormalizedQuestion[] = useMemo(() => {
    if (isAttached) {
      return fetchedQuestions.map((q) => ({
        id: q._id,
        text: q.text,
        options: q.options,
        // -1 (no match) until the server reveals it post-submission.
        correctIndex: result?.correctAnswers[q._id] ?? q.correctAnswer ?? -1,
      }));
    }
    return source.questions.map((q, idx) => ({
      id: `inline-${idx}`,
      text: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
    }));
  }, [isAttached, fetchedQuestions, source, result]);

  const saveGradeMutation = useMutation({
    mutationFn: (submittedAnswers: Record<string, number>) => saveQuizGrade(quizId, submittedAnswers),
  });

  const inlineCount = source.mode === 'inline' ? source.questions.length : 0;

  useEffect(() => {
    setPhase('taking');
    setCurrentIndex(0);
    setAnswers({});
    setResult(null);
    if (isAttached && timeLimitMinutes && timeLimitMinutes > 0 && !previewMode) {
      setTimeLeft(timeLimitMinutes * 60);
    } else {
      setTimeLeft(null);
    }
  }, [isAttached, quizId, source.mode, timeLimitMinutes, inlineCount, previewMode]);

  useEffect(() => {
    if (previewMode || phase !== 'taking' || timeLeft === null || isLoading) return;
    const id = window.setInterval(() => {
      setTimeLeft((prev) => (prev === null ? prev : Math.max(0, prev - 1)));
    }, 1000);
    return () => clearInterval(id);
  }, [previewMode, phase, timeLeft, isLoading]);

  useEffect(() => {
    if (!previewMode && phase === 'taking' && timeLeft === 0) {
      submit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase, previewMode]);

  const questions = normalizedQuestions;
  const total = questions.length;
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const canSelect = !previewMode && phase === 'taking';
  const showCorrect = previewMode || phase === 'result';

  const correctCount = questions.filter(
    (q) => answers[q.id] !== undefined && answers[q.id] === q.correctIndex
  ).length;
  const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  function submit() {
    if (previewMode) return;
    const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    if (isAttached && source.studentId) {
      saveGradeMutation.mutate(answers, { onSuccess: setResult });
    }
    setPhase('result');
    onComplete?.(score, correctCount, total);
  }

  function reset() {
    setPhase('taking');
    setCurrentIndex(0);
    setAnswers({});
    setResult(null);
    if (isAttached && timeLimitMinutes && timeLimitMinutes > 0 && !previewMode) {
      setTimeLeft(timeLimitMinutes * 60);
    }
  }

  if (isLoading) {
    return (
      <div className={`rounded-2xl border border-slate-200 dark:border-slate-800 p-6 ${className ?? ''}`}>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (total === 0) {
    return <EmptyState description={t('quizNoQuestions', { defaultValue: 'No questions in this quiz yet.' })} className="py-6" />;
  }

  return (
    <div className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden ${className ?? ''}`}>
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
        <div className="flex items-center gap-2 min-w-0">
          <ClipboardList className="w-4 h-4 text-violet-600 flex-shrink-0" />
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
            {title ?? t('quizLabel')}
          </span>
          {previewMode && (
            <span className="text-[10px] uppercase tracking-wide bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 px-2 py-0.5 rounded-full font-semibold">
              {t('quizPreviewTitle', { defaultValue: 'Quiz Preview' })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {t('questionPrefix', { defaultValue: 'Q' })}{currentIndex + 1} / {total}
          </span>
          {timeLeft !== null && (
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-semibold ${
              timeLeft <= 60
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              {formatTime(timeLeft)}
            </span>
          )}
        </div>
      </div>

      <div className="px-5 py-6">
        {phase === 'taking' ? (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
              <span className="text-slate-400 dark:text-slate-500 font-normal mr-1.5">
                {t('questionPrefix', { defaultValue: 'Question' })}{currentIndex + 1}.
              </span>
              {currentQuestion.text}
            </p>
            <div className="grid grid-cols-1 gap-2">
              {currentQuestion.options.map((opt, i) => {
                const chosen = answers[currentQuestion.id] === i;
                const isCorrect = i === currentQuestion.correctIndex;
                const showCorrectStyling = showCorrect && isCorrect;
                const showWrongStyling = showCorrect && chosen && !isCorrect;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (!canSelect) return;
                      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: i }));
                    }}
                    disabled={!canSelect}
                    className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-colors ${
                      showCorrectStyling
                        ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 font-medium'
                        : showWrongStyling
                        ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 line-through'
                        : chosen
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-800 dark:text-violet-200 font-medium'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      showCorrectStyling
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : showWrongStyling
                        ? 'border-red-500 bg-red-500 text-white'
                        : chosen
                        ? 'border-violet-500 bg-violet-500 text-white'
                        : 'border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400'
                    }`}>
                      {OPT_LABELS[i]}
                    </span>
                    <span className="flex-1 leading-snug">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-3xl font-black ${
                pct >= 70 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                : pct >= 40 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              }`}>
                <Trophy className="w-7 h-7" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {correctCount} / {total}
                </p>
                <p className={`text-sm font-semibold mt-1 ${
                  pct >= 70 ? 'text-emerald-600 dark:text-emerald-400'
                  : pct >= 40 ? 'text-amber-600 dark:text-amber-400'
                  : 'text-red-600 dark:text-red-400'
                }`}>
                  {pct}% — {pct >= 70 ? t('quizExcellent') : pct >= 40 ? t('quizKeepPracticing') : t('quizNeedsImprovement')}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('quizAnswerReview')}</h4>
              {questions.map((q, idx) => {
                const chosen = answers[q.id];
                const isCorrect = chosen === q.correctIndex;
                const notAnswered = chosen === undefined;
                return (
                  <div
                    key={q.id}
                    className={`rounded-xl border p-4 space-y-2.5 ${
                      notAnswered
                        ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40'
                        : isCorrect
                        ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-900/10'
                        : 'border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/10'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {notAnswered ? (
                        <span className="text-slate-400 text-xs font-bold flex-shrink-0 mt-0.5">–</span>
                      ) : isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      )}
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 flex-1 leading-snug">
                        <span className="text-slate-400 dark:text-slate-500 font-normal mr-1">
                          {t('questionPrefix', { defaultValue: 'Question' })}{idx + 1}.
                        </span>
                        {q.text}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 pl-6">
                      {q.options.map((opt, i) => {
                        const isChosenOption = i === chosen;
                        const isCorrectOption = i === q.correctIndex;
                        let cls = 'text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 ';
                        if (isCorrectOption) cls += 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-semibold';
                        else if (isChosenOption && !isCorrectOption) cls += 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 line-through';
                        else cls += 'text-slate-500 dark:text-slate-500';
                        return (
                          <div key={i} className={cls}>
                            <span className="font-bold flex-shrink-0">{OPT_LABELS[i]}</span>
                            <span className="truncate">{opt}</span>
                            {isCorrectOption && <span className="ml-auto flex-shrink-0">✓</span>}
                          </div>
                        );
                      })}
                    </div>
                    {notAnswered && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 pl-6 italic">
                        {t('quizNotAnswered')} {OPT_LABELS[q.correctIndex]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
        {phase === 'taking' ? (
          <>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {previewMode
                ? t('quizPreviewTitle', { defaultValue: 'Preview mode' })
                : t('quizAnsweredCount', { count: answeredCount, total })}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
              >
                {t('previous', { defaultValue: 'Previous' })}
              </Button>
              {currentIndex < total - 1 ? (
                <Button
                  size="sm"
                  className="bg-violet-600 hover:bg-violet-700 text-white"
                  onClick={() => setCurrentIndex((prev) => Math.min(total - 1, prev + 1))}
                >
                  {t('next', { defaultValue: 'Next' })}
                </Button>
              ) : (
                !previewMode && (
                  <Button
                    size="sm"
                    className="bg-violet-600 hover:bg-violet-700 text-white"
                    onClick={submit}
                    disabled={answeredCount < total}
                  >
                    {t('submitQuiz')}
                  </Button>
                )
              )}
            </div>
          </>
        ) : (
          <>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('quizCompleteLabel')}
            </p>
            <Button variant="outline" size="sm" onClick={reset}>
              {t('retry')}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
