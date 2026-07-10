import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { getLocalizedName } from "@/lib/localeUtils";
import {
  getSubjectById,
  getSubjectTeacherContent,
  type SubjectTeacherContent,
  getQuizByAttached,
  getSchedulesBySubject,
  enrollInLiveLesson,
  type Subject,
  type Quiz,
  type TeacherSchedule,
} from "@/api/subjectApi";
// adminApi upload no longer used in this file
import {
  type AssignmentContentUnit,
  type AssignmentContentLesson,
} from "@/api/teacherAssignmentApi";
import {
  createCheckoutIntention,
  type SubscriptionPlan,
} from "@/api/paymobApi";
import PaymobCheckoutModal from "@/components/PaymobCheckoutModal";
import ManualPaymentModal from "@/components/ManualPaymentModal";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/ToastProvider";
import {
  ArrowLeft,
  ChevronDown,
  PlayCircle,
  FileText,
  Clock,
  Layers,
  ClipboardList,
  Lock,
  CheckCircle2,
  CreditCard,
  Landmark,
  Video,
  Users,
  UserCheck,
} from "lucide-react";
import { spacing } from "@/lib/constants";
import StudentQuizModal from "@/components/StudentQuizModal";

// ── Quiz badge ──────────────────────────────────────────────────────

const DAY_ORDER = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
type DayName = (typeof DAY_ORDER)[number];

type LiveSchedule = TeacherSchedule & { day: DayName };

function isDayName(day: string): day is DayName {
  return DAY_ORDER.includes(day as DayName);
}

function QuizBadge({
  attachedToId,
  label,
}: {
  attachedToId: string;
  label: string;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { data: quiz } = useQuery<Quiz | null>({
    queryKey: ["unit-quiz", attachedToId],
    queryFn: () => getQuizByAttached(attachedToId),
  });
  if (!quiz) return null;
  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex-shrink-0"
      >
        <ClipboardList className="w-3 h-3" />
        {t("submitQuiz")}
      </button>
      <StudentQuizModal
        open={open}
        onClose={() => setOpen(false)}
        quizId={quiz._id}
        quizTitle={quiz.title || label}
        timeLimitMinutes={quiz.timeLimit}
      />
    </>
  );
}

function SkeletonLine({ className }: { className: string }) {
  return (
    <div
      className={`rounded bg-slate-200 dark:bg-slate-800 animate-pulse ${className}`}
    />
  );
}

function UnitSkeleton() {
  return (
    <div className="border rounded-xl overflow-hidden shadow-sm border-slate-200 dark:border-slate-800 animate-pulse">
      <div className="px-5 py-4 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-2">
            <SkeletonLine className="h-4 w-40" />
            <SkeletonLine className="h-3 w-28" />
          </div>
        </div>
        <SkeletonLine className="h-6 w-20" />
      </div>
      <div className="bg-white dark:bg-slate-950">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-6 py-3.5 border-t border-slate-100 dark:border-slate-800/50"
          >
            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="flex-1 space-y-2">
              <SkeletonLine className="h-3 w-1/2" />
              <SkeletonLine className="h-3 w-1/3" />
            </div>
            <SkeletonLine className="h-5 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

function TeacherContentSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <UnitSkeleton key={i} />
      ))}
    </div>
  );
}

// ── Unit accordion (access → open content | locked → subscribe) ──

function UnitRow({
  unit,
  subjectId,
  assignmentId,
  lessons,
  isUnlocked,
  isSubscribed,
  isPreview,
  onSubscribeUnit,
  subscribing,
  navigate,
}: {
  unit: AssignmentContentUnit;
  subjectId: string;
  assignmentId?: string;
  lessons: AssignmentContentLesson[];
  isUnlocked: boolean;
  isSubscribed: boolean;
  isPreview: boolean;
  onSubscribeUnit: (unit: AssignmentContentUnit) => void;
  subscribing: boolean;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);

  return (
    <div
      className={`border rounded-xl overflow-hidden shadow-sm transition-colors ${
        isUnlocked
          ? "border-slate-200 dark:border-slate-800"
          : "border-slate-200/70 dark:border-slate-800/60 opacity-90"
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-5 py-4 transition-colors select-none ${
          isUnlocked
            ? "bg-slate-50 dark:bg-slate-900/60 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60"
            : "bg-slate-50/60 dark:bg-slate-900/40 cursor-default"
        }`}
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={`w-8 h-8 rounded-lg text-white text-sm font-bold flex items-center justify-center flex-shrink-0 ${isUnlocked ? "bg-blue-600" : "bg-slate-400 dark:bg-slate-600"}`}
          >
            {unit.order ?? 1}
          </span>
          <div className="min-w-0">
            <p
              className={`font-semibold truncate ${isUnlocked ? "text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"}`}
            >
              {unit.title}
            </p>
            {unit.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {unit.description}
              </p>
            )}
          </div>
        </div>

        <div
          className="flex items-center gap-2 ml-4 flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {unit.price !== undefined && (
            <span className="hidden sm:flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
              {t("unitPriceLabel")}: {unit.price}
            </span>
          )}
          {isSubscribed ? (
            <>
              <span className="hidden sm:flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 px-2 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> {t("enrolledBadge")}
              </span>
              <QuizBadge
                attachedToId={unit._id}
                label={t("quizTitleSuffix", { title: unit.title })}
              />
              <motion.span
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((o) => !o);
                }}
              >
                <ChevronDown className="w-4 h-4 text-slate-500 cursor-pointer" />
              </motion.span>
            </>
          ) : isPreview ? (
            <>
              <span className="hidden sm:flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 px-2 py-1 rounded-full">
                <PlayCircle className="w-3 h-3" /> {t("freePreview")}
              </span>
              <motion.span
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((o) => !o);
                }}
              >
                <ChevronDown className="w-4 h-4 text-slate-500 cursor-pointer" />
              </motion.span>
              <Button
                size="sm"
                className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white ml-1 flex-shrink-0 gap-1"
                onClick={() => onSubscribeUnit(unit)}
                disabled={subscribing}
              >
                <CreditCard className="w-3 h-3" />
                {subscribing ? t("loadingEllipsis") : t("subscribeCta")}
              </Button>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                <Lock className="w-3 h-3" /> {t("notEnrolledLabel")}
              </span>
              <Button
                size="sm"
                className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white ml-1 flex-shrink-0 gap-1"
                onClick={() => onSubscribeUnit(unit)}
                disabled={subscribing}
              >
                <CreditCard className="w-3 h-3" />
                {subscribing ? t("loadingEllipsis") : t("subscribeCta")}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Lessons (visible for all units; access enforced per lesson) */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="lessons"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="bg-white dark:bg-slate-950">
              {lessons.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {lessons.map((lesson, idx) => {
                    const lessonUnlocked = lesson.isUnlocked ?? !lesson.locked;
                    return (
                      <div
                        key={lesson._id}
                        className="flex items-center gap-4 px-6 py-3.5 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                      >
                        <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-medium text-slate-500 flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {lessonUnlocked ? (
                            lesson.videoUrl ? (
                              <PlayCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            )
                          ) : (
                            <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <span
                              className={`text-sm font-medium truncate transition-colors block ${lessonUnlocked ? "text-slate-700 dark:text-slate-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400" : "text-slate-400 dark:text-slate-500 cursor-not-allowed"}`}
                              onClick={() => {
                                if (lessonUnlocked) {
                                  const assignmentParam = assignmentId
                                    ? `&assignmentId=${assignmentId}`
                                    : "";
                                  navigate(
                                    `/lesson/${lesson._id}?subjectId=${subjectId}&from=student${assignmentParam}`,
                                  );
                                }
                              }}
                            >
                              {lesson.title}
                            </span>
                            {!lessonUnlocked && (
                              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                                {t("lockedLessonNote")}
                              </span>
                            )}
                          </div>
                          {lesson.isFree && (
                            <span className="ms-2 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                              {t("freePreview")}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                          {lesson.duration && (
                            <span className="hidden sm:flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                              <Clock className="w-3 h-3" />
                              {lesson.duration}m
                            </span>
                          )}
                          {!lessonUnlocked && (
                            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                              {t("lockedUnit")}
                            </span>
                          )}
                          {lessonUnlocked && (
                            <>
                              <QuizBadge
                                attachedToId={lesson._id}
                                label={t("quizTitleSuffix", {
                                  title: lesson.title,
                                })}
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                onClick={() => {
                                  const assignmentParam = assignmentId
                                    ? `&assignmentId=${assignmentId}`
                                    : "";
                                  navigate(
                                    `/lesson/${lesson._id}?subjectId=${subjectId}&from=student${assignmentParam}`,
                                  );
                                }}
                              >
                                {t("view")}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Locked preview */}
      {!isUnlocked && (
        <div className="bg-gradient-to-b from-slate-50 dark:from-slate-900/40 to-white dark:to-slate-950 px-6 py-5 text-center border-t border-slate-100 dark:border-slate-800/40">
          <Lock className="w-7 h-7 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {t("subscribeToUnlock")}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Live Sessions Section ──────────────────────────────────────────

function LiveSessionsSection({
  subjectId,
  studentId,
  schedules,
  isLoading,
}: {
  subjectId: string;
  studentId?: string;
  schedules: TeacherSchedule[];
  isLoading: boolean;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const normalized: LiveSchedule[] = schedules.filter(
    (item): item is LiveSchedule => isDayName(item.day),
  );

  const enrollMutation = useMutation({
    mutationFn: (scheduleId: string) =>
      enrollInLiveLesson(studentId!, scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subject-schedules", subjectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["student-schedule", studentId],
      });
    },
  });

  if (isLoading) {
    return (
      <div className="mt-8">
        <SkeletonLine className="h-5 w-40 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border rounded-xl p-4 border-slate-200 dark:border-slate-800 animate-pulse"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="space-y-2">
                  <SkeletonLine className="h-3 w-24" />
                  <SkeletonLine className="h-3 w-16" />
                </div>
                <SkeletonLine className="h-5 w-12" />
              </div>
              <SkeletonLine className="h-3 w-28 mb-3" />
              <div className="flex items-center justify-between gap-2">
                <SkeletonLine className="h-3 w-20" />
                <SkeletonLine className="h-7 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (normalized.length === 0) return null;

  function timeLabel(t: string) {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
  }

  const sorted = [...normalized].sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day),
  );

  return (
    <div className="mt-8">
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-slate-200 mb-4">
        <Video className="w-4 h-4 text-violet-600" />
        {t("liveSessions")}
        <span className="ml-1 text-xs font-normal text-slate-400 dark:text-slate-500">
          {t("maxStudentsPerGroup")}
        </span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((s) => {
          const isFull = (s.enrolledStudents?.length ?? 0) >= s.maxStudents;
          const isEnrolled = studentId
            ? s.enrolledStudents?.includes(studentId)
            : false;
          const spots = s.maxStudents - (s.enrolledStudents?.length ?? 0);

          return (
            <motion.div
              key={s._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-xl p-4 shadow-sm transition-colors ${
                isEnrolled
                  ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/40"
                  : isFull
                    ? "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-70"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    {s.teacherName ?? t("unknownTeacher")}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {t(`dayName_${s.day}`)}
                  </p>
                </div>
                {isEnrolled && (
                  <span className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700/50 px-2 py-0.5 rounded-full flex-shrink-0">
                    <UserCheck className="w-3 h-3" /> {t("enrolledBadge")}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
                <Clock className="w-3.5 h-3.5" />
                {timeLabel(s.startTime)} – {timeLabel(s.endTime)}
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <Users className="w-3.5 h-3.5" />
                  {s.enrolledStudents?.length ?? 0} / {s.maxStudents}
                  {!isFull && !isEnrolled && (
                    <span className="ml-1 text-emerald-600 dark:text-emerald-400">
                      ({t("spotsLeft", { count: spots })})
                    </span>
                  )}
                </div>
                {!isEnrolled && (
                  <Button
                    size="sm"
                    disabled={isFull || enrollMutation.isPending || !studentId}
                    onClick={() => enrollMutation.mutate(s._id)}
                    title={isFull ? t("groupFullTitle") : undefined}
                    className={`h-7 px-3 text-xs flex-shrink-0 ${
                      isFull
                        ? "bg-slate-200 dark:bg-slate-700 text-slate-500 cursor-not-allowed"
                        : "bg-violet-600 hover:bg-violet-700 text-white"
                    }`}
                  >
                    {isFull
                      ? t("groupFull")
                      : enrollMutation.isPending
                        ? t("loadingEllipsis")
                        : t("joinGroup")}
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────

export default function StudentSubjectDetail() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{
    id?: string;
    subjectId?: string;
    teacherId?: string;
  }>();
  const subjectId = params.subjectId ?? params.id;
  const teacherId = params.teacherId;
  const { user, isLoading: profileLoading } = useAuth();
  const queryClient = useQueryClient();
  const { pushToast } = useToast();
  const gradeId =
    (location.state as { gradeId?: string } | null)?.gradeId ??
    user?.gradeId ??
    "";
  const stageId =
    (location.state as { stageId?: string } | null)?.stageId ??
    user?.stageId ??
    "";

  // ── Paymob checkout state ──
  const [planSelectOpen, setPlanSelectOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] =
    useState<AssignmentContentUnit | null>(null);
  const [requestType, setRequestType] = useState<"subject" | "unit">("subject");
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>("Monthly");
  const [checkoutData, setCheckoutData] = useState<{
    iframeUrl: string;
    paymentId: string;
    amountEGP: number;
    planDays: number;
  } | null>(null);
  const [isInitiating, setIsInitiating] = useState(false);
  const [manualPaymentOpen, setManualPaymentOpen] = useState(false);

  const { data: content, isLoading: contentLoading } =
    useQuery<SubjectTeacherContent>({
      queryKey: ["subject-teacher-content", subjectId, teacherId],
      queryFn: () => getSubjectTeacherContent(subjectId!, teacherId!),
      enabled: !!subjectId && !!teacherId,
    });

  const assignment = content?.assignment;
  const assignmentTeacherId =
    typeof assignment?.teacherId === "string"
      ? assignment.teacherId
      : assignment?.teacherId?._id;
  const assignmentGradeId =
    typeof assignment?.gradeId === "string"
      ? assignment.gradeId
      : assignment?.gradeId?._id;
  const assignmentSubjectId =
    typeof assignment?.subjectId === "string"
      ? assignment.subjectId
      : assignment?.subjectId?._id;
  const resolvedSubjectId = assignmentSubjectId ?? subjectId;
  const assignmentId = content?.assignmentId;
  const unitPrices = (content?.units ?? [])
    .map((unit) => Number(unit.price) || 0)
    .filter((price) => price > 0);
  const minUnitPrice = unitPrices.length ? Math.min(...unitPrices) : 0;
  const maxUnitPrice = unitPrices.length ? Math.max(...unitPrices) : 0;

  const scheduleSubjectId = resolvedSubjectId ?? subjectId;
  const { data: schedules = [], isLoading: schedulesLoading } = useQuery<
    TeacherSchedule[]
  >({
    queryKey: ["subject-schedules", scheduleSubjectId],
    queryFn: () => getSchedulesBySubject(scheduleSubjectId!),
    enabled: !!scheduleSubjectId,
  });

  const { data: subject, isLoading: subjectLoading } = useQuery<Subject>({
    queryKey: ["subject", resolvedSubjectId],
    queryFn: () => getSubjectById(resolvedSubjectId!),
    enabled: !!resolvedSubjectId,
  });

  // Dummy mutation reference kept for type compatibility in UnitRow (subscribing prop)
  const requestMutation = { isPending: isInitiating };

  const openSubjectDialog = () => {
    setSelectedUnit(null);
    setRequestType("subject");
    setSelectedPlan("Monthly");
    setPlanSelectOpen(true);
  };

  const openUnitDialog = (unit: AssignmentContentUnit) => {
    setSelectedUnit(unit);
    setRequestType("unit");
    setSelectedPlan("Monthly");
    setPlanSelectOpen(true);
  };

  const initiatePayment = async () => {
    const teacherIdVal = assignmentTeacherId;
    const gradeIdVal = assignmentGradeId;
    const subjectIdValue = resolvedSubjectId;

    if (!teacherIdVal || !gradeIdVal || !subjectIdValue) {
      pushToast({ type: "error", title: t("toastActionFailed") });
      return;
    }

    if (requestType === "unit" && !selectedUnit) {
      pushToast({ type: "error", title: t("toastActionFailed") });
      return;
    }

    setIsInitiating(true);
    try {
      const result = await createCheckoutIntention({
        teacherId: teacherIdVal,
        subjectId: subjectIdValue,
        gradeId: gradeIdVal,
        unitId: requestType === "unit" ? selectedUnit?._id : undefined,
        subscriptionType: requestType,
        plan: selectedPlan,
      });

      if (result.retryRequired) {
        pushToast({
          type: "error",
          title: result.message ?? t("paymentPending"),
        });
        return;
      }

      setCheckoutData({
        iframeUrl: result.iframeUrl,
        paymentId: result.paymentId,
        amountEGP: result.amountEGP,
        planDays: result.planDays,
      });
      setPlanSelectOpen(false);
      setCheckoutOpen(true);
    } catch (err: any) {
      const message = err?.response?.data?.message ?? t("toastActionFailed");
      pushToast({ type: "error", title: message });
    } finally {
      setIsInitiating(false);
    }
  };

  const handleCheckoutComplete = () => {
    setCheckoutOpen(false);
    queryClient.invalidateQueries({
      queryKey: ["subject-teacher-content", subjectId, teacherId],
    });
    pushToast({ type: "success", title: t("paymentProcessing") });
  };

  useEffect(() => {
    if (!content) return;
    console.log("[student-subject-detail] teacher content", {
      teacherId,
      subjectId,
      units: content.units?.length ?? 0,
      pricing: content.pricing,
      subscriptionStatus: content.subscriptionStatus,
    });
  }, [content, teacherId, subjectId]);

  if (profileLoading) {
    return (
      <div className={spacing.pageContainer}>
        <div className="space-y-6">
          <SkeletonLine className="h-6 w-48" />
          <TeacherContentSkeleton />
        </div>
      </div>
    );
  }

  if (!gradeId && !stageId && teacherId) {
    return (
      <div className={spacing.pageContainer}>
        <Card className="border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/10">
          <CardContent className="py-10 text-center space-y-4">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              {t("noStageSet")}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("setStageInProfile")}
            </p>
            <Button
              onClick={() => navigate("/student")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {t("goToProfile")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!subject && !subjectLoading) {
    return (
      <div className={`${spacing.pageContainer} py-12 text-center`}>
        <p className="text-slate-500 mb-4">{t("subjectNotFound")}</p>
        <Button variant="outline" onClick={() => navigate("/student/learn")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> {t("backToLearn")}
        </Button>
      </div>
    );
  }

  const units = content?.units ?? [];
  const subscribedUnits = units.filter((unit) => unit.isUnlocked).length;
  const lockedUnits = units.length - subscribedUnits;
  const hasSubjectAccess = content?.access?.subject ?? false;
  const subjectPriceRaw = content?.pricing?.subject ?? 0;
  const subjectPrice = subjectPriceRaw > 0 ? subjectPriceRaw : 300;
  const currencyLabel = t("currencyEgp");
  const totalLessons = units.reduce(
    (sum, unit) => sum + (unit.lessons?.length ?? 0),
    0,
  );
  const normalizedSchedules = schedules.filter((item): item is LiveSchedule =>
    isDayName(item.day),
  );
  const showContentSkeleton = contentLoading || !content;
  const showGlobalEmpty =
    !!teacherId &&
    !contentLoading &&
    !schedulesLoading &&
    !!content &&
    units.length === 0 &&
    totalLessons === 0 &&
    normalizedSchedules.length === 0;

  const teacherName =
    typeof assignment?.teacherId === "string"
      ? undefined
      : assignment?.teacherId?.name;

  return (
    <div className={spacing.pageContainer}>
      {/* Back + header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> {t("back")}
          </Button>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          {subjectLoading || !subject ? (
            <div className="flex items-center gap-2">
              <SkeletonLine className="h-8 w-8" />
              <div className="space-y-2">
                <SkeletonLine className="h-4 w-40" />
                <SkeletonLine className="h-3 w-56" />
                <SkeletonLine className="h-3 w-32" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-2xl">{subject.icon}</span>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {getLocalizedName(subject, i18n.language)}
                </h1>
                {subject.description && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {subject.description}
                  </p>
                )}
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {t("subjectPriceLabel")}: {subjectPrice} {currencyLabel}
                </p>
                {teacherName && (
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {t("teacher")}: {teacherName}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        {!hasSubjectAccess && assignmentTeacherId && assignmentGradeId && (
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={openSubjectDialog}
          >
            <CreditCard className="w-4 h-4 mr-2" /> {t("subscribeCta")}
          </Button>
        )}
      </div>

      {/* Stats */}
      {showContentSkeleton ? (
        <div className="flex flex-wrap items-center gap-4 mb-6 px-1">
          <SkeletonLine className="h-4 w-28" />
          <SkeletonLine className="h-4 w-32" />
          <SkeletonLine className="h-4 w-36" />
        </div>
      ) : (
        <div className="flex items-center gap-6 mb-6 px-1">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Layers className="w-4 h-4" />
            <span>
              <strong className="text-slate-700 dark:text-slate-300">
                {units.length}
              </strong>{" "}
              {t(units.length === 1 ? "unitSingular" : "unitPlural")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <CreditCard className="w-4 h-4" />
            <span>
              <strong className="text-slate-700 dark:text-slate-300">
                {subjectPrice}
              </strong>{" "}
              {currencyLabel} {t("subjectPriceLabel")}
            </span>
          </div>
          {minUnitPrice > 0 && (
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <CreditCard className="w-4 h-4" />
              <span>
                <strong className="text-slate-700 dark:text-slate-300">
                  {minUnitPrice === maxUnitPrice
                    ? minUnitPrice
                    : `${minUnitPrice} - ${maxUnitPrice}`}
                </strong>{" "}
                {t("unitPriceLabel")}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              <strong>{subscribedUnits}</strong> {t("enrolledBadge")}
            </span>
          </div>
          {lockedUnits > 0 && (
            <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500">
              <Lock className="w-4 h-4" />
              <span>
                <strong>{lockedUnits}</strong> {t("availableToSubscribe")}
              </span>
            </div>
          )}
        </div>
      )}

      {showGlobalEmpty && (
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="py-16 text-center">
            <EmptyState description={t("noTeacherContent")} />
          </CardContent>
        </Card>
      )}

      {/* Units */}
      {!teacherId ? (
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="py-16 text-center">
            <EmptyState description={t("selectTeacherToContinue")} />
          </CardContent>
        </Card>
      ) : showContentSkeleton ? (
        <TeacherContentSkeleton />
      ) : units.length > 0 ? (
        <div className="space-y-4">
          {units.map((unit) => {
            const unitLessons = unit.lessons ?? [];
            const isSubscribed = !!unit.isUnlocked;
            const hasPreview =
              !isSubscribed && unitLessons.some((lesson) => lesson.isUnlocked);
            const canOpen = isSubscribed || hasPreview;
            return (
              <UnitRow
                key={unit._id}
                unit={unit}
                subjectId={resolvedSubjectId!}
                assignmentId={assignmentId ?? undefined}
                lessons={unitLessons}
                isUnlocked={canOpen}
                isSubscribed={isSubscribed}
                isPreview={hasPreview}
                onSubscribeUnit={openUnitDialog}
                subscribing={requestMutation.isPending}
                navigate={navigate}
              />
            );
          })}
        </div>
      ) : null}

      <Dialog
        open={planSelectOpen}
        onOpenChange={(v) => !v && setPlanSelectOpen(false)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("chooseYourPlan")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Content summary */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/60">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                {t("subscribingTo")}
              </p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {requestType === "subject"
                  ? subject
                    ? getLocalizedName(subject, i18n.language)
                    : t("subject")
                  : (selectedUnit?.title ?? t("unitSingular"))}
              </p>
            </div>

            {/* Plan selector */}
            <div className="grid grid-cols-3 gap-2">
              {(["Monthly", "Quarterly", "Yearly"] as SubscriptionPlan[]).map(
                (plan) => (
                  <button
                    key={plan}
                    type="button"
                    onClick={() => setSelectedPlan(plan)}
                    className={`rounded-xl p-3 border text-sm text-center transition-all ${
                      selectedPlan === plan
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <span className="block">{t(`plan${plan}`)}</span>
                    <span className="block text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {plan === "Monthly"
                        ? "30"
                        : plan === "Quarterly"
                          ? "90"
                          : "365"}{" "}
                      {t("days")}
                    </span>
                  </button>
                ),
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2 w-full"
                onClick={initiatePayment}
                disabled={isInitiating}
              >
                <CreditCard className="w-4 h-4" />
                {isInitiating ? t("loadingEllipsis") : t("payWithCard", { defaultValue: "Pay by card (Paymob)" })}
              </Button>
              <Button
                variant="outline"
                className="gap-2 w-full"
                onClick={() => setManualPaymentOpen(true)}
              >
                <Landmark className="w-4 h-4" />
                {t("payManually", { defaultValue: "InstaPay / Vodafone Cash / Fawry" })}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setPlanSelectOpen(false)}
              >
                {t("cancel")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Paymob checkout iframe modal */}
      {checkoutData && (
        <PaymobCheckoutModal
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          iframeUrl={checkoutData.iframeUrl}
          paymentId={checkoutData.paymentId}
          amountEGP={checkoutData.amountEGP}
          plan={selectedPlan}
          planDays={checkoutData.planDays}
          onPaymentComplete={handleCheckoutComplete}
        />
      )}

      {/* Manual transfer payment modal (InstaPay / Vodafone Cash / Fawry) */}
      {assignmentTeacherId && assignmentGradeId && resolvedSubjectId && (
        <ManualPaymentModal
          open={manualPaymentOpen}
          onClose={() => setManualPaymentOpen(false)}
          target={{
            kind: requestType,
            teacherId: assignmentTeacherId,
            subjectId: resolvedSubjectId,
            gradeId: assignmentGradeId,
            unitId: requestType === "unit" ? selectedUnit?._id : undefined,
            plan: selectedPlan,
          }}
          onSubmitted={() => {
            setManualPaymentOpen(false);
            setPlanSelectOpen(false);
            pushToast({
              type: "success",
              title: t("manualPaymentSubmittedTitle", { defaultValue: "Submitted for review" }),
            });
          }}
        />
      )}

      {/* ── Live Sessions ── */}
      {resolvedSubjectId && (
        <LiveSessionsSection
          subjectId={resolvedSubjectId}
          studentId={user?._id}
          schedules={schedules}
          isLoading={schedulesLoading}
        />
      )}
    </div>
  );
}
