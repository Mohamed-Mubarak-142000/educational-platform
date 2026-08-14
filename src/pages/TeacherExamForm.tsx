import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { createExam, type ExamQuestionInput } from "@/api/examApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/ToastProvider";
import { spacing } from "@/lib/constants";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

type DraftQuestion = {
  key: number;
  text: string;
  options: string[];
  correctAnswer: number;
};

let nextKey = 1;
function newQuestion(): DraftQuestion {
  return { key: nextKey++, text: "", options: ["", "", "", ""], correctAnswer: 0 };
}

export default function TeacherExamForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { pushToast } = useToast();
  const assignmentId = (location.state as { assignmentId?: string } | null)?.assignmentId;

  const [title, setTitle] = useState("");
  const [scheduledStart, setScheduledStart] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [questions, setQuestions] = useState<DraftQuestion[]>([newQuestion()]);

  const addQuestion = () => setQuestions((qs) => [...qs, newQuestion()]);
  const removeQuestion = (key: number) => setQuestions((qs) => qs.filter((q) => q.key !== key));

  const updateQuestion = (key: number, patch: Partial<DraftQuestion>) =>
    setQuestions((qs) => qs.map((q) => (q.key === key ? { ...q, ...patch } : q)));

  const updateOption = (key: number, index: number, value: string) =>
    setQuestions((qs) =>
      qs.map((q) => {
        if (q.key !== key) return q;
        const options = [...q.options];
        options[index] = value;
        return { ...q, options };
      }),
    );

  const addOption = (key: number) =>
    setQuestions((qs) => qs.map((q) => (q.key === key ? { ...q, options: [...q.options, ""] } : q)));

  const removeOption = (key: number, index: number) =>
    setQuestions((qs) =>
      qs.map((q) => {
        if (q.key !== key) return q;
        const options = q.options.filter((_, i) => i !== index);
        const correctAnswer = q.correctAnswer >= options.length ? 0 : q.correctAnswer;
        return { ...q, options, correctAnswer };
      }),
    );

  const createMutation = useMutation({
    mutationFn: createExam,
    onSuccess: (data) => {
      pushToast({
        type: "success",
        title: t("examCreatedTitle", { defaultValue: "Exam created" }),
        description: t("examCreatedDesc", {
          defaultValue: "{{count}} students were notified by email.",
          count: data.notifiedCount,
        }),
      });
      navigate("/teacher/exams");
    },
    onError: (error: any) => {
      pushToast({
        type: "error",
        title: t("toastActionFailed"),
        description: error.response?.data?.message || t("somethingWentWrong"),
      });
    },
  });

  const isValid =
    !!assignmentId &&
    title.trim().length > 0 &&
    scheduledStart.length > 0 &&
    durationMinutes >= 1 &&
    questions.length > 0 &&
    questions.every((q) => q.text.trim().length > 0 && q.options.filter((o) => o.trim().length > 0).length >= 2);

  const handleSubmit = () => {
    if (!assignmentId || !isValid) return;
    const payloadQuestions: ExamQuestionInput[] = questions.map((q) => ({
      text: q.text.trim(),
      options: q.options.map((o) => o.trim()).filter(Boolean),
      correctAnswer: q.correctAnswer,
    }));
    createMutation.mutate({
      assignmentId,
      title: title.trim(),
      scheduledStart: new Date(scheduledStart).toISOString(),
      durationMinutes,
      questions: payloadQuestions,
    });
  };

  if (!assignmentId) {
    return (
      <div className={spacing.pageContainer}>
        <Card className="border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/10">
          <CardContent className="py-10 text-center space-y-4">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              {t("selectSubjectFirst", { defaultValue: "Pick a subject first." })}
            </p>
            <Button onClick={() => navigate("/teacher/exams")} className="bg-violet-600 hover:bg-violet-700 text-white">
              {t("back")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`${spacing.pageContainer} space-y-6 max-w-3xl`}>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/teacher/exams")} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" />
          {t("back")}
        </Button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {t("createExam", { defaultValue: "Create exam" })}
        </h1>
      </div>

      <Card className="border border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-base">{t("examDetails", { defaultValue: "Exam details" })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t("examTitleLabel", { defaultValue: "Title" })}</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("examTitlePlaceholder", { defaultValue: "Mid-term comprehensive exam" })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t("scheduledStartLabel", { defaultValue: "Scheduled start" })}</Label>
              <input
                type="datetime-local"
                value={scheduledStart}
                onChange={(e) => setScheduledStart(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("durationMinutesLabel", { defaultValue: "Duration (minutes)" })}</Label>
              <Input
                type="number"
                min={1}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Math.max(1, Number(e.target.value) || 1))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {questions.map((q, qIndex) => (
          <Card key={q.key} className="border border-slate-200 dark:border-slate-800">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                  {t("questionNumberLabel", { defaultValue: "Question {{n}}", n: qIndex + 1 })}
                </p>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(q.key)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                    aria-label={t("removeQuestion", { defaultValue: "Remove question" })}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Textarea
                value={q.text}
                onChange={(e) => updateQuestion(q.key, { text: e.target.value })}
                placeholder={t("questionTextPlaceholder", { defaultValue: "Question text" })}
                rows={2}
                className="resize-none"
              />
              <div className="space-y-2">
                {q.options.map((opt, optIndex) => (
                  <div key={optIndex} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${q.key}`}
                      checked={q.correctAnswer === optIndex}
                      onChange={() => updateQuestion(q.key, { correctAnswer: optIndex })}
                      className="w-4 h-4 accent-violet-600 flex-shrink-0"
                      aria-label={t("markAsCorrect", { defaultValue: "Mark as correct answer" })}
                    />
                    <Input
                      value={opt}
                      onChange={(e) => updateOption(q.key, optIndex, e.target.value)}
                      placeholder={t("optionPlaceholder", { defaultValue: "Option {{n}}", n: optIndex + 1 })}
                    />
                    {q.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(q.key, optIndex)}
                        className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                        aria-label={t("removeOption", { defaultValue: "Remove option" })}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="gap-1.5 text-violet-600" onClick={() => addOption(q.key)}>
                  <Plus className="w-3.5 h-3.5" />
                  {t("addOption", { defaultValue: "Add option" })}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button variant="outline" className="w-full gap-2" onClick={addQuestion}>
          <Plus className="w-4 h-4" />
          {t("addQuestion", { defaultValue: "Add question" })}
        </Button>
      </div>

      <div className="flex justify-end gap-2 pb-8">
        <Button variant="outline" onClick={() => navigate("/teacher/exams")}>
          {t("cancel")}
        </Button>
        <Button
          className="bg-violet-600 hover:bg-violet-700 text-white"
          disabled={!isValid || createMutation.isPending}
          onClick={handleSubmit}
        >
          {createMutation.isPending ? t("sending") : t("createExam", { defaultValue: "Create exam" })}
        </Button>
      </div>
    </div>
  );
}
