import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQuestionsByQuiz } from '@/api/subjectApi';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { EmptyState } from '@/components/shared';
import { Clock, CheckCircle2, XCircle, ClipboardList, Trophy } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────

type Phase = 'taking' | 'result';

type QuizQuestion = {
  _id: string;
  text: string;
  options: string[];
  correctAnswer: number;
};

const OPT_LABELS = ['A', 'B', 'C', 'D'] as const;

// Default quiz time limit in seconds (10 minutes)
const DEFAULT_TIME_SECONDS = 10 * 60;

// ── Timer helpers ──────────────────────────────────────────────────

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ── StudentQuizModal ───────────────────────────────────────────────

export default function StudentQuizModal({
  open,
  onClose,
  quizId,
  quizTitle,
  onComplete,
}: {
  open: boolean;
  onClose: () => void;
  quizId: string;
  quizTitle: string;
  onComplete?: (score: number, correctCount: number, total: number) => void;
}) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>('taking');
  // questionId → chosen option index (0–3)
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME_SECONDS);

  // Reset state every time dialog is opened
  useEffect(() => {
    if (open) {
      setPhase('taking');
      setAnswers({});
      setTimeLeft(DEFAULT_TIME_SECONDS);
    }
  }, [open, quizId]);

  const { data: questions = [], isLoading } = useQuery<QuizQuestion[]>({
    queryKey: ['quiz-questions', quizId],
    queryFn: () => getQuestionsByQuiz(quizId),
    enabled: open && !!quizId,
  });

  // ── Submission ───────────────────────────────────────────────────
  const submit = useCallback(() => {
    setPhase('result');
    // Calculate score at submission time
    const correct = questions.filter(
      (q) => answers[q._id] !== undefined && answers[q._id] === q.correctAnswer
    ).length;
    const total = questions.length;
    const pctScore = total > 0 ? Math.round((correct / total) * 100) : 0;
    onComplete?.(pctScore, correct, total);
  }, [questions, answers, onComplete]);

  // ── Countdown timer (only active while taking) ───────────────────
  useEffect(() => {
    if (!open || phase !== 'taking' || isLoading) return;
    if (timeLeft <= 0) { submit(); return; }
    const id = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [open, phase, timeLeft, isLoading, submit]);

  // ── Score calculation ────────────────────────────────────────────
  const score = questions.filter(
    (q) => answers[q._id] !== undefined && answers[q._id] === q.correctAnswer
  ).length;

  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  const timerWarning = timeLeft <= 60;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-[620px] max-h-[88vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Sticky header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 bg-white dark:bg-slate-900">
          <DialogHeader className="flex-1 min-w-0">
            <DialogTitle className="flex items-center gap-2 text-base truncate">
              <ClipboardList className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="truncate">{quizTitle}</span>
            </DialogTitle>
          </DialogHeader>
          {phase === 'taking' && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-mono font-semibold flex-shrink-0 ml-4 ${
                timerWarning
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait" initial={false}>
            {phase === 'taking' ? (
              <motion.div
                key="taking"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
                className="px-6 py-5 space-y-6"
              >
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                    ))}
                  </div>
                ) : questions.length === 0 ? (
                  <EmptyState description={t('quizNoQuestions')} className="py-12" />
                ) : (
                  questions.map((q, idx) => {
                    const chosen = answers[q._id];
                    return (
                      <div key={q._id} className="space-y-3">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                          <span className="text-slate-400 dark:text-slate-500 mr-1.5 font-normal">{t('questionPrefix')}{idx + 1}.</span>
                          {q.text}
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {q.options.map((opt, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setAnswers((prev) => ({ ...prev, [q._id]: i }))}
                              className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-colors ${
                                chosen === i
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 font-medium'
                                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <span
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                                  chosen === i
                                    ? 'border-blue-500 bg-blue-500 text-white'
                                    : 'border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400'
                                }`}
                              >
                                {OPT_LABELS[i]}
                              </span>
                              <span className="flex-1 leading-snug">{opt}</span>
                            </button>
                          ))}
                        </div>
                        {idx < questions.length - 1 && (
                          <div className="border-b border-slate-100 dark:border-slate-800/60 pt-2" />
                        )}
                      </div>
                    );
                  })
                )}
              </motion.div>
            ) : (
              /* ── Results ── */
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28 }}
                className="px-6 py-8 space-y-6"
              >
                {/* Score card */}
                <div className="text-center space-y-3">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-3xl font-black ${
                    pct >= 70 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : pct >= 40 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }`}>
                    <Trophy className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-slate-900 dark:text-slate-100">
                      {score} / {questions.length}
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

                {/* Per-question review */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('quizAnswerReview')}</h4>
                  {questions.map((q, idx) => {
                    const chosen = answers[q._id];
                    const correct = q.correctAnswer;
                    const isCorrect = chosen === correct;
                    const notAnswered = chosen === undefined;
                    return (
                      <div
                        key={q._id}
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
                            <span className="text-slate-400 dark:text-slate-500 font-normal mr-1">{t('questionPrefix')}{idx + 1}.</span>
                            {q.text}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 pl-6">
                          {q.options.map((opt, i) => {
                            const isChosenOption = i === chosen;
                            const isCorrectOption = i === correct;
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
                          <p className="text-xs text-slate-400 dark:text-slate-500 pl-6 italic">{t('quizNotAnswered')} {OPT_LABELS[correct]}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sticky footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex-shrink-0 bg-white dark:bg-slate-900">
          {phase === 'taking' ? (
            <>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {t('quizAnsweredCount', { count: Object.keys(answers).length, total: questions.length })}
              </p>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={submit}
                disabled={isLoading || questions.length === 0}
              >
                {t('submitQuiz')}
              </Button>
            </>
          ) : (
            <>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('quizCompleteLabel')}
              </p>
              <Button variant="outline" onClick={onClose}>
                {t('close')}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
