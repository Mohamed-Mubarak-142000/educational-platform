import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getMyAssignments, type TeacherAssignment } from "@/api/teacherAssignmentApi";
import { getExamsByAssignment, type Exam } from "@/api/examApi";
import { getLocalizedName } from "@/lib/localeUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared";
import { spacing } from "@/lib/constants";
import { PlusCircle, FileText, Clock, Users } from "lucide-react";

function getSubject(a: TeacherAssignment) {
  return typeof a.subjectId === "object" ? a.subjectId : null;
}
function getGrade(a: TeacherAssignment) {
  return typeof a.gradeId === "object" ? a.gradeId : null;
}

export default function TeacherExams() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ["my-assignments"],
    queryFn: getMyAssignments,
  });

  const { data: exams = [], isLoading: examsLoading } = useQuery({
    queryKey: ["exams-by-assignment", selectedAssignmentId],
    queryFn: () => getExamsByAssignment(selectedAssignmentId!),
    enabled: !!selectedAssignmentId,
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t("examsTitle", { defaultValue: "Exams" })}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("examsSubtitle", {
              defaultValue: "Create a comprehensive, timed exam for one of your subjects.",
            })}
          </p>
        </div>
        {selectedAssignmentId && (
          <Button
            className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
            onClick={() => navigate("/teacher/exams/new", { state: { assignmentId: selectedAssignmentId } })}
          >
            <PlusCircle className="w-4 h-4" />
            {t("createExam", { defaultValue: "Create exam" })}
          </Button>
        )}
      </div>

      {/* Assignment picker — pills, not a <select> */}
      {assignmentsLoading ? (
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-32 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState description={t("noAssignmentsYet", { defaultValue: "You have no assigned subjects yet." })} />
      ) : (
        <div className="flex gap-2 flex-wrap">
          {assignments.map((a) => {
            const subject = getSubject(a);
            const grade = getGrade(a);
            const active = selectedAssignmentId === a._id;
            return (
              <button
                key={a._id}
                type="button"
                onClick={() => setSelectedAssignmentId(a._id)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  active
                    ? "bg-violet-600 border-violet-600 text-white"
                    : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-violet-400"
                }`}
              >
                {subject ? getLocalizedName(subject, i18n.language) : t("subject")}
                {grade ? ` — ${getLocalizedName(grade, i18n.language)}` : ""}
              </button>
            );
          })}
        </div>
      )}

      {/* Exams for the selected assignment */}
      {selectedAssignmentId && (
        <div className="space-y-3">
          {examsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : exams.length === 0 ? (
            <EmptyState description={t("noExamsYet", { defaultValue: "No exams created yet for this subject." })} />
          ) : (
            exams.map((exam) => (
              <Card key={exam._id} className="border border-slate-200 dark:border-slate-800">
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
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge(exam.status)}`}>
                      {t(`examStatus_${exam.status}`, { defaultValue: exam.status })}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => navigate(`/teacher/exams/${exam._id}/submissions`)}
                    >
                      <Users className="w-3.5 h-3.5" />
                      {t("viewSubmissions", { defaultValue: "Submissions" })}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
