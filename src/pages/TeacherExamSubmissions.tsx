import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getExamSubmissions } from "@/api/examApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState, DataTable, type TableColumn } from "@/components/shared";
import { spacing, cardVariants } from "@/lib/constants";
import { ArrowLeft } from "lucide-react";
import type { ExamSubmission } from "@/api/examApi";

function refName(ref: { name?: string } | string | undefined): string {
  if (!ref) return "—";
  if (typeof ref === "string") return ref;
  return ref.name ?? "—";
}

export default function TeacherExamSubmissions() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { examId } = useParams<{ examId: string }>();

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["exam-submissions", examId],
    queryFn: () => getExamSubmissions(examId!),
    enabled: !!examId,
  });

  const columns: TableColumn<ExamSubmission>[] = [
    { key: "studentId", label: t("student", { defaultValue: "Student" }), render: (v) => refName(v as ExamSubmission["studentId"]) },
    {
      key: "score",
      label: t("score", { defaultValue: "Score" }),
      sortable: true,
      render: (v, row) => (
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {v as number}% ({row.correctCount}/{row.totalQuestions})
        </span>
      ),
    },
    {
      key: "autoSubmitted",
      label: t("submissionType", { defaultValue: "Submitted" }),
      render: (v) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {v ? t("autoSubmitted", { defaultValue: "Auto (time ran out)" }) : t("manualSubmitted", { defaultValue: "Manually" })}
        </span>
      ),
    },
    {
      key: "submittedAt",
      label: t("date"),
      sortable: true,
      render: (v) => new Date(v as string).toLocaleString(),
    },
  ];

  return (
    <div className={`${spacing.pageContainer} space-y-6`}>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/teacher/exams")} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" />
          {t("back")}
        </Button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {t("examSubmissionsTitle", { defaultValue: "Exam results" })}
        </h1>
      </div>

      <Card className={`${cardVariants.default} border-0 shadow-none rounded-[2rem]`}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            {t("viewSubmissions", { defaultValue: "Submissions" })}
          </CardTitle>
        </CardHeader>
        <CardContent className={spacing.cardPadding}>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : submissions.length === 0 ? (
            <EmptyState description={t("noSubmissionsYet", { defaultValue: "No student has submitted this exam yet." })} />
          ) : (
            <DataTable<ExamSubmission> columns={columns} data={submissions} pageSize={20} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
