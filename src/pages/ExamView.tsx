import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getExam, submitExam, type ExamStudentView } from "@/api/examApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { spacing } from "@/lib/constants";
import { Clock, Lock, ShieldCheck, Trophy, XCircle } from "lucide-react";

const OPT_LABELS = ["A", "B", "C", "D", "E", "F"] as const;

function formatDuration(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(sec).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export default function ExamView() {
  const { t } = useTranslation();
  const { examId } = useParams<{ examId: string }>();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [locked, setLocked] = useState(false);
  const [finalResult, setFinalResult] = useState<{ score: number; correctCount: number; totalQuestions: number } | null>(null);
  const clockOffsetRef = useRef(0); // serverNow - Date.now(), applied to keep countdowns accurate

  const { data, isLoading, refetch } = useQuery<ExamStudentView | any>({
    queryKey: ["exam", examId],
    queryFn: () => getExam(examId!),
    enabled: !!examId,
  });

  useEffect(() => {
    if (data && "serverNow" in data && data.serverNow) {
      clockOffsetRef.current = new Date(data.serverNow).getTime() - Date.now();
    }
  }, [data]);

  const status: string | undefined = data?.status;
  const scheduledStart = data && "scheduledStart" in data ? new Date(data.scheduledStart) : null;
  const endsAt = data && "endsAt" in data ? new Date(data.endsAt) : null;

  const submitMutation = useMutation({
    mutationFn: (autoSubmitted: boolean) =>
      submitExam(examId!, {
        answers: Object.entries(answers).map(([questionId, selected]) => ({ questionId, selected })),
        autoSubmitted,
      }),
    onSuccess: (result) => {
      setFinalResult(result);
      setLocked(true);
    },
  });

  const now = () => Date.now() + clockOffsetRef.current;

  // ── Countdown to start (status: scheduled) ──
  const [secondsToStart, setSecondsToStart] = useState<number | null>(null);
  useEffect(() => {
    if (status !== "scheduled" || !scheduledStart) return;
    const tick = () => {
      const remaining = Math.round((scheduledStart.getTime() - now()) / 1000);
      setSecondsToStart(remaining);
      if (remaining <= 0) refetch();
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, scheduledStart?.getTime()]);

  // ── Countdown to end (status: active) ──
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  useEffect(() => {
    if (status !== "active" || !endsAt || locked) return;
    const tick = () => {
      const remaining = Math.round((endsAt.getTime() - now()) / 1000);
      setSecondsLeft(remaining);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, endsAt?.getTime(), locked]);

  // ── Auto-submit when the timer hits zero ──
  useEffect(() => {
    if (status === "active" && !locked && secondsLeft !== null && secondsLeft <= 0 && !submitMutation.isPending) {
      submitMutation.mutate(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, status, locked]);

  // Best-effort tab close once locked — browsers only allow this for
  // script-opened tabs, so it may silently no-op; the lock overlay below is
  // what actually prevents further interaction regardless.
  useEffect(() => {
    if (locked) {
      const id = window.setTimeout(() => {
        window.close();
      }, 4000);
      return () => clearTimeout(id);
    }
  }, [locked]);

  const questions = useMemo(() => (data && "questions" in data ? data.questions : []), [data]);
  const answeredCount = Object.keys(answers).length;

  if (isLoading || !data) {
    return (
      <div className={`${spacing.pageContainer} max-w-2xl mx-auto`}>
        <div className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  // ── Locked / just-submitted screen ──
  if (locked || finalResult) {
    const result = finalResult;
    return (
      <div className={`${spacing.pageContainer} max-w-lg mx-auto`}>
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {t("examSubmittedTitle", { defaultValue: "Time's up — your answers were saved" })}
            </h1>
            {result && (
              <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                {result.score}% ({result.correctCount}/{result.totalQuestions})
              </p>
            )}
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("examSubmittedDesc", { defaultValue: "You can close this tab now." })}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Not started yet ──
  if (status === "scheduled") {
    return (
      <div className={`${spacing.pageContainer} max-w-lg mx-auto`}>
        <Card className="border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/10">
          <CardContent className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{data.title}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("examNotStartedDesc", { defaultValue: "This exam hasn't started yet." })}
            </p>
            {scheduledStart && (
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {t("examStartsAt", { defaultValue: "Starts at" })}: {scheduledStart.toLocaleString()}
              </p>
            )}
            {secondsToStart !== null && secondsToStart > 0 && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 font-mono text-lg font-bold text-amber-700 dark:text-amber-300">
                {formatDuration(secondsToStart)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Closed, no submission from this student ──
  if (status === "closed" && !("questions" in data)) {
    const alreadySubmitted = "alreadySubmitted" in data && data.alreadySubmitted;
    if (alreadySubmitted) {
      return (
        <div className={`${spacing.pageContainer} max-w-lg mx-auto`}>
          <Card className="border border-slate-200 dark:border-slate-800">
            <CardContent className="py-12 text-center space-y-4">
              <Trophy className="w-10 h-10 text-violet-600 mx-auto" />
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {(data as any).score}% ({(data as any).correctCount}/{(data as any).totalQuestions})
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t("examAlreadySubmittedDesc", { defaultValue: "You already submitted this exam." })}
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }
    return (
      <div className={`${spacing.pageContainer} max-w-lg mx-auto`}>
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="py-12 text-center space-y-4">
            <XCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("examMissedDesc", { defaultValue: "This exam has ended and you did not submit it." })}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Active — taking the exam ──
  const timerWarning = secondsLeft !== null && secondsLeft <= 60;

  return (
    <div className={`${spacing.pageContainer} max-w-2xl mx-auto space-y-5 pb-24`}>
      <div className="flex items-center justify-between gap-4 sticky top-0 z-10 bg-slate-50 dark:bg-slate-950 py-3">
        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">{data.title}</h1>
        {secondsLeft !== null && (
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-mono font-semibold flex-shrink-0 ${
              timerWarning
                ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 animate-pulse"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            {formatDuration(secondsLeft)}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-lg px-3 py-2">
        <ShieldCheck className="w-4 h-4 flex-shrink-0" />
        {t("examLiveWarning", {
          defaultValue: "This exam auto-submits and locks when the timer reaches zero.",
        })}
      </div>

      <div className="space-y-6">
        {questions.map((q: any, idx: number) => {
          const chosen = answers[q._id];
          return (
            <div key={q._id} className="space-y-3">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                <span className="text-slate-400 dark:text-slate-500 mr-1.5 font-normal">
                  {t("questionPrefix")}
                  {idx + 1}.
                </span>
                {q.text}
              </p>
              <div className="grid grid-cols-1 gap-2">
                {q.options.map((opt: string, i: number) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, [q._id]: i }))}
                    className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-colors ${
                      chosen === i
                        ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-800 dark:text-violet-200 font-medium"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                        chosen === i
                          ? "border-violet-500 bg-violet-500 text-white"
                          : "border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {OPT_LABELS[i] ?? i + 1}
                    </span>
                    <span className="flex-1 leading-snug">{opt}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {t("quizAnsweredCount", { count: answeredCount, total: questions.length })}
        </p>
        <Button
          className="bg-violet-600 hover:bg-violet-700 text-white"
          onClick={() => submitMutation.mutate(false)}
          disabled={submitMutation.isPending}
        >
          {submitMutation.isPending ? t("sending") : t("submitExam", { defaultValue: "Submit exam" })}
        </Button>
      </div>
    </div>
  );
}
