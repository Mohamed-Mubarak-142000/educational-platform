import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getMyExams, type Exam } from "@/api/examApi";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/shared";
import { spacing } from "@/lib/constants";
import { FileText, Clock } from "lucide-react";

export default function StudentExams() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: exams = [], isLoading } = useQuery({
    queryKey: ["my-exams"],
    queryFn: getMyExams,
  });

  const statusBadge = (status: Exam["status"]) => {
    const map: Record<Exam["status"], string> = {
      scheduled: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
      active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
      closed: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    };
    return map[status];
  };

  return (
    <div className={`${spacing.pageContainer} space-y-6`}>
      <PageHeader
        title={t("myExamsTitle", { defaultValue: "My exams" })}
        subtitle={t("myExamsSubtitle", {
          defaultValue: "Exams scheduled by your teachers across every subject you're subscribed to.",
        })}
      />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : exams.length === 0 ? (
        <EmptyState description={t("noExamsYet", { defaultValue: "No exams have been scheduled yet." })} />
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => (
            <Card
              key={exam._id}
              className="border border-slate-200 dark:border-slate-800 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/exams/${exam._id}`)}
            >
              <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{exam.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {new Date(exam.scheduledStart).toLocaleString()} · {exam.durationMinutes} {t("minutes")}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${statusBadge(exam.status)}`}>
                  {t(`examStatus_${exam.status}`, { defaultValue: exam.status })}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
