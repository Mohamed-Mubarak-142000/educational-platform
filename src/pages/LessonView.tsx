import { useState, useEffect, useRef, type ReactNode } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getLocalizedName } from "@/lib/localeUtils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLessonById,
  getSubjectById,
  getUnitsBySubject,
  getLessonsByUnit,
  getCommentsByLesson,
  addLessonComment,
  getQuizByAttached,
  getPartsByLesson,
  getGradesByStudent,
  type Subject,
  type Unit,
  type Lesson,
  type LessonPart,
  type LessonComment,
  type Quiz,
  type QuizGrade,
} from "@/api/subjectApi";
import {
  getAssignmentContent,
  type AssignmentContentUnit,
} from "@/api/teacherAssignmentApi";
import { updateLessonProgress } from "@/api/progressApi";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState, PdfViewer, RenderIfExists } from "@/components/shared";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/ToastProvider";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  PlayCircle,
  FileText,
  Clock,
  MessageSquare,
  Paperclip,
  Send,
  Menu,
  X,
  BookOpen,
  ClipboardList,
  Volume2,
  Box,
  Layers,
  Award,
  CheckCircle2,
  XCircle,
  Eye,
  Download,
  Lock,
} from "lucide-react";
import QuizExperience from "@/components/QuizExperience";
import { useAuth } from "@/context/AuthContext";
import LessonModelViewer from "@/components/LessonModelViewer";

// ── Animated accordion for sidebar units ──────────────────────────

const isYouTubeUrl = (url?: string) =>
  !!url && (url.includes("youtube.com") || url.includes("youtu.be"));

function SkeletonLine({ className }: { className: string }) {
  return (
    <div
      className={`rounded bg-slate-200 dark:bg-slate-800 animate-pulse ${className}`}
    />
  );
}

function SidebarSkeleton() {
  return (
    <div className="px-4 py-3 space-y-3">
      <SkeletonLine className="h-3 w-28" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center gap-2">
            <SkeletonLine className="h-5 w-5" />
            <SkeletonLine className="h-3 w-32" />
          </div>
          <div className="pl-6 space-y-1.5">
            <SkeletonLine className="h-3 w-24" />
            <SkeletonLine className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

function LessonContentSkeleton() {
  return (
    <div className="px-6 py-8 space-y-6">
      <div className="space-y-3">
        <SkeletonLine className="h-4 w-24" />
        <SkeletonLine className="h-8 w-2/3" />
        <SkeletonLine className="h-4 w-40" />
      </div>
      <div className="rounded-2xl bg-slate-100 dark:bg-slate-900/60 aspect-video animate-pulse" />
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
        <SkeletonLine className="h-4 w-32" />
        <SkeletonLine className="h-3 w-full" />
        <SkeletonLine className="h-3 w-5/6" />
      </div>
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
        <SkeletonLine className="h-4 w-28" />
        <SkeletonLine className="h-3 w-full" />
        <SkeletonLine className="h-3 w-4/6" />
      </div>
    </div>
  );
}

function getYouTubeEmbedUrl(url?: string) {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (trimmed.includes("youtube.com/embed/")) return trimmed;

  const match = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  );
  if (match?.[1]) return `https://www.youtube.com/embed/${match[1]}`;
  return "";
}

type StepKey = "learn" | "practice" | "quiz" | "complete";

const STEP_ORDER: StepKey[] = ["learn", "practice", "quiz", "complete"];

function StepProgress({
  active,
  completed,
}: {
  active: StepKey;
  completed?: boolean;
}) {
  const { t } = useTranslation();
  const labelMap: Record<StepKey, string> = {
    learn: t("lessonStepLearn", { defaultValue: "Learn" }),
    practice: t("lessonStepPractice", { defaultValue: "Practice" }),
    quiz: t("lessonStepQuiz", { defaultValue: "Quiz" }),
    complete: t("lessonStepComplete", { defaultValue: "Complete" }),
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {STEP_ORDER.map((step, idx) => {
        const isActive = step === active;
        const isDone =
          completed || STEP_ORDER.indexOf(step) < STEP_ORDER.indexOf(active);
        return (
          <div key={step} className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                isDone
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/40"
                  : isActive
                    ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/40"
                    : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800"
              }`}
            >
              {idx + 1}. {labelMap[step]}
            </span>
            {idx < STEP_ORDER.length - 1 && (
              <span className="text-slate-300 dark:text-slate-700">/</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepSection({
  step,
  title,
  icon,
  children,
}: {
  step: number;
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
        <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
          {step}
        </span>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
          {icon}
          {title}
        </div>
      </div>
      <div className="px-6 py-5 space-y-6">{children}</div>
    </section>
  );
}

type SidebarUnitItem = Unit & { lessons?: Lesson[] };

function SidebarUnit({
  unit,
  activeLessonId,
  activePartId,
  subjectId: _subjectId,
  onLessonClick,
  onPartClick,
  isFirstUnit,
}: {
  unit: SidebarUnitItem;
  activeLessonId: string;
  activePartId: string;
  subjectId: string;
  onLessonClick: (lesson: Lesson) => void;
  onPartClick: (lesson: Lesson, part: LessonPart) => void;
  isFirstUnit?: boolean;
}) {
  const prefetchedLessons = unit.lessons;
  const { data: unitLessons = [] } = useQuery<Lesson[]>({
    queryKey: ["unit-lessons", unit._id],
    queryFn: () => getLessonsByUnit(unit._id),
    enabled: !prefetchedLessons,
  });
  const lessons = prefetchedLessons ?? unitLessons;

  const hasActive = lessons.some((lesson) => lesson._id === activeLessonId);
  const [open, setOpen] = useState(unit.order === 1);
  const isOpen = open || hasActive;

  return (
    <div className="border-b border-slate-100 dark:border-slate-800/60 last:border-b-0">
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-left"
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex-shrink-0 w-6 h-6 rounded-md bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
            {unit.order ?? 0}
          </span>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate leading-snug">
            {unit.title}
          </span>
        </div>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 ml-2"
        >
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="pb-1">
              {lessons.map((lesson, idx) => (
                <SidebarLesson
                  key={lesson._id}
                  lesson={lesson}
                  activeLessonId={activeLessonId}
                  activePartId={activePartId}
                  onLessonClick={onLessonClick}
                  onPartClick={onPartClick}
                  isStartHere={
                    !!isFirstUnit && (lesson.order === 1 || idx === 0)
                  }
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarLesson({
  lesson,
  activeLessonId,
  activePartId,
  onLessonClick,
  onPartClick,
  isStartHere,
}: {
  lesson: Lesson;
  activeLessonId: string;
  activePartId: string;
  onLessonClick: (lesson: Lesson) => void;
  onPartClick: (lesson: Lesson, part: LessonPart) => void;
  isStartHere?: boolean;
}) {
  const { t } = useTranslation();
  const locked = !!lesson.locked;
  const { data: parts = [] } = useQuery<LessonPart[]>({
    queryKey: ["lesson-parts", lesson._id],
    queryFn: () => getPartsByLesson(lesson._id),
    enabled: !locked,
  });

  const isActive = lesson._id === activeLessonId;

  return (
    <div className="space-y-1">
      <button
        className={`w-full flex items-center gap-2.5 pl-8 pr-4 py-2.5 text-left transition-colors ${
          isActive
            ? "bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-600"
            : locked
              ? "border-l-2 border-transparent text-slate-400 dark:text-slate-500 cursor-not-allowed"
              : "hover:bg-slate-50 dark:hover:bg-slate-800/40 border-l-2 border-transparent"
        }`}
        onClick={() => !locked && onLessonClick(lesson)}
        disabled={locked}
      >
        {locked ? (
          <Lock
            className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-blue-600" : "text-slate-400"}`}
          />
        ) : lesson.videoUrl ? (
          <PlayCircle
            className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-blue-600" : "text-slate-400"}`}
          />
        ) : (
          <FileText
            className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-blue-600" : "text-slate-400"}`}
          />
        )}
        <span
          className={`text-xs leading-snug truncate flex-1 ${isActive ? "font-semibold text-blue-700 dark:text-blue-300" : "text-slate-600 dark:text-slate-400"}`}
        >
          {lesson.title}
        </span>
        {isStartHere && !locked && (
          <span className="text-[10px] uppercase tracking-wide bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
            Start here
          </span>
        )}
        {lesson.duration && (
          <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0 ml-auto pl-1">
            {lesson.duration} {t("minutesShort")}
          </span>
        )}
      </button>

      {parts.length > 0 && (
        <div className="ms-11 pb-1">
          {parts.map((part, idx) => {
            const partActive = isActive && part._id === activePartId;
            return (
              <button
                key={part._id}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-left text-[11px] transition-colors ${
                  partActive
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                }`}
                onClick={() => onPartClick(lesson, part)}
              >
                <span className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-700 text-[10px] flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </span>
                <span className="truncate">{part.title}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Lesson Parts Section ──────────────────────────────────────────

function LessonPartsSection({
  lessonId,
  studentId,
  activePartId,
  isTeacher,
}: {
  lessonId: string;
  studentId?: string;
  activePartId?: string;
  isTeacher?: boolean;
}) {
  const { t } = useTranslation();
  const { data: parts, isLoading } = useQuery<LessonPart[]>({
    queryKey: ["lesson-parts", lessonId],
    queryFn: () => getPartsByLesson(lessonId),
  });

  const resolvedParts = parts ?? [];
  const showSkeleton = isLoading || parts === undefined;

  const { data: grades = [] } = useQuery<QuizGrade[]>({
    queryKey: ["student-grades", studentId],
    queryFn: () => getGradesByStudent(studentId!),
    enabled: !!studentId,
  });

  useEffect(() => {
    if (!activePartId) return;
    const el = document.getElementById(`part-${activePartId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activePartId, resolvedParts.length]);

  if (showSkeleton) {
    return (
      <div className="space-y-4">
        <SkeletonLine className="h-4 w-32" />
        {[1, 2].map((i) => (
          <div
            key={i}
            className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden animate-pulse"
          >
            <div className="px-5 py-4 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SkeletonLine className="h-7 w-7" />
                <SkeletonLine className="h-3 w-40" />
              </div>
              <SkeletonLine className="h-4 w-4" />
            </div>
            <div className="px-5 py-4 space-y-3 bg-white dark:bg-slate-950">
              <SkeletonLine className="h-3 w-full" />
              <SkeletonLine className="h-3 w-5/6" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (resolvedParts.length === 0) {
    return <EmptyState description={t("lessonNoParts")} className="py-8" />;
  }

  return (
    <div className="space-y-4">
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-slate-200">
        <Layers className="w-4 h-4 text-blue-600" />
        {t("lessonParts")} ({resolvedParts.length})
      </h2>
      <div className="space-y-4">
        {resolvedParts.map((part, idx) => {
          return (
            <PartCard
              key={part._id}
              part={part}
              index={idx}
              studentId={studentId}
              grades={grades}
              activePartId={activePartId}
              isTeacher={isTeacher}
            />
          );
        })}
      </div>
    </div>
  );
}

function PartCard({
  part,
  index,
  studentId,
  grades,
  activePartId,
  isTeacher,
}: {
  part: LessonPart;
  index: number;
  studentId?: string;
  grades: QuizGrade[];
  activePartId?: string;
  isTeacher?: boolean;
}) {
  const { t } = useTranslation();
  const isActivePart = !!activePartId && part._id === activePartId;
  const [open, setOpen] = useState(index === 0);
  const isOpen = open || isActivePart;
  const partRef = useRef<HTMLDivElement | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);

  const { data: partQuiz } = useQuery<Quiz | null>({
    queryKey: ["unit-quiz", part._id],
    queryFn: () => getQuizByAttached(part._id),
  });

  const existingGrade = partQuiz
    ? grades.find((grade) => grade.quizId === partQuiz._id)
    : null;

  useEffect(() => {
    if (isActivePart) {
      partRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isActivePart]);

  return (
    <div
      id={`part-${part._id}`}
      ref={partRef}
      className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
    >
      {/* Part header */}
      <button
        className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-left"
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
            {index + 1}
          </span>
          <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
            {part.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {existingGrade && (
            <span className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded-full">
              <Award className="w-3 h-3" />
              {existingGrade.score}%
            </span>
          )}
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </motion.span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-5 py-4 space-y-4 bg-white dark:bg-slate-950">
              {/* Written content */}
              {part.content && (
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                  {part.content}
                </p>
              )}
              {/* Part video */}
              {part.media?.videoUrl && (
                <div className="rounded-xl overflow-hidden aspect-video bg-black">
                  {isYouTubeUrl(part.media.videoUrl) ? (
                    <iframe
                      src={part.media.videoUrl}
                      title={part.title}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={part.media.videoUrl}
                      controls
                      className="w-full h-full"
                    />
                  )}
                </div>
              )}
              {/* Part audio */}
              {part.media?.audioUrl && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5" />
                    {t("audioLabel")}
                  </p>
                  <audio
                    src={part.media.audioUrl}
                    controls
                    className="w-full"
                  />
                </div>
              )}
              {/* Model explanation for this part */}
              {part.media?.modelExplanation && (
                <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-3 border border-purple-100 dark:border-purple-800/20">
                  <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1 flex items-center gap-1">
                    <Box className="w-3.5 h-3.5" />
                    {t("modelNotesLabel")}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {part.media.modelExplanation}
                  </p>
                </div>
              )}
              {/* Inline quiz embedded in lesson part (created via LessonForm) */}
              {part.quiz && part.quiz.length > 0 && (
                <QuizExperience
                  title={t("partQuizLabel")}
                  source={{ mode: "inline", questions: part.quiz }}
                  previewMode={isTeacher ?? false}
                />
              )}
              {/* Part quiz (UnitQuiz — separate collection, created via quiz manager) */}
              {partQuiz && (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-200 dark:border-blue-800/30 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-sm text-slate-900 dark:text-slate-100">
                        {partQuiz.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t("partQuizLabel")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {existingGrade ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex items-center gap-1 text-sm font-semibold ${existingGrade.score >= 60 ? "text-emerald-600" : "text-red-500"}`}
                          >
                            {existingGrade.score >= 60 ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            {existingGrade.score}%
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => setQuizOpen(true)}
                          >
                            {t("retry")}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs"
                          onClick={() => setQuizOpen(true)}
                        >
                          <ClipboardList className="w-3.5 h-3.5 mr-1" />
                          {t("takeQuiz")}
                        </Button>
                      )}
                    </div>
                  </div>

                  {quizOpen && (
                    <div className="space-y-3">
                      <QuizExperience
                        title={partQuiz.title ?? t("quizLabel")}
                        source={{
                          mode: "attached",
                          quizId: partQuiz._id,
                          timeLimitMinutes: partQuiz.timeLimit,
                          studentId: studentId,
                        }}
                        previewMode={isTeacher ?? false}
                      />
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setQuizOpen(false)}
                        >
                          {t("close")}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Comments Section ───────────────────────────────────────────────

function CommentsSection({ lessonId }: { lessonId: string }) {
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "ar" ? "ar-EG" : "en-US";
  const [text, setText] = useState("");

  const { data: comments, isLoading } = useQuery<LessonComment[]>({
    queryKey: ["lesson-comments", lessonId],
    queryFn: () => getCommentsByLesson(lessonId),
  });
  const resolvedComments = comments ?? [];
  const showSkeleton = isLoading || comments === undefined;

  const addMutation = useMutation({
    mutationFn: (commentText: string) =>
      addLessonComment(lessonId, commentText),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["lesson-comments", lessonId],
      });
      setText("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addMutation.mutate(text.trim());
  };

  return (
    <div>
      <h3 className="flex items-center gap-2 text-base font-semibold mb-4 text-slate-800 dark:text-slate-200">
        <MessageSquare className="w-4 h-4 text-blue-600" />
        {t("lessonDiscussion")} ({resolvedComments.length})
      </h3>
      {showSkeleton ? (
        <div className="space-y-4 mb-6">
          <div className="flex gap-3">
            <SkeletonLine className="h-16 w-full" />
            <SkeletonLine className="h-9 w-10" />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("lessonCommentPlaceholder")}
            rows={2}
            className="flex-1 resize-none text-sm"
          />
          <Button
            type="submit"
            size="sm"
            className="self-end bg-blue-600 hover:bg-blue-700 text-white px-3 h-9"
            disabled={addMutation.isPending || !text.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      )}
      <div className="space-y-4">
        {showSkeleton ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <SkeletonLine className="h-8 w-8" />
                <div className="flex-1 space-y-2">
                  <SkeletonLine className="h-3 w-32" />
                  <SkeletonLine className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : resolvedComments.length === 0 ? (
          <EmptyState description={t("lessonNoComments")} className="py-8" />
        ) : (
          resolvedComments.map((comment) => (
            <div key={comment._id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs flex-shrink-0">
                {comment.userId?.name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {comment.userId?.name}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {comment.createdAt
                      ? new Date(comment.createdAt).toLocaleDateString(locale)
                      : t("notAvailableShort")}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {comment.text}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
// Renders INSIDE the DashboardLayout content area.
// Layout: [Lesson Sidebar (units/lessons)] | [Lesson Content]

export default function LessonView() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { pushToast } = useToast();
  const subjectId = searchParams.get("subjectId") || "";
  const assignmentId = searchParams.get("assignmentId") || "";
  const fromStudent =
    searchParams.get("from") === "student" || user?.role === "Student";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const activeLessonId = lessonId || "";
  const activePartId = searchParams.get("partId") || "";
  const lastViewedLessonId = useRef<string | null>(null);
  const [completedLessonId, setCompletedLessonId] = useState<string | null>(
    null,
  );
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastProgressSentAt = useRef<number>(0);
  const resumeKey = activeLessonId ? `lesson-resume:${activeLessonId}` : "";

  const { data: assignmentContent, isLoading: assignmentContentLoading } =
    useQuery({
      queryKey: ["assignment-content", assignmentId],
      queryFn: () => getAssignmentContent(assignmentId),
      enabled: !!assignmentId && fromStudent,
    });

  const assignment = assignmentContent?.assignment;
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
  const resolvedSubjectId = subjectId || assignmentSubjectId || "";

  const { data: subject, isLoading: subjectLoading } = useQuery<Subject>({
    queryKey: ["subject", resolvedSubjectId],
    queryFn: () => getSubjectById(resolvedSubjectId),
    enabled: !!resolvedSubjectId,
  });

  const { data: units = [], isLoading: unitsLoading } = useQuery<Unit[]>({
    queryKey: ["units", resolvedSubjectId],
    queryFn: () => getUnitsBySubject(resolvedSubjectId),
    enabled: !!resolvedSubjectId && !(fromStudent && assignmentId),
  });

  // Check for a quiz attached to this lesson
  const { data: lessonQuiz } = useQuery<Quiz | null>({
    queryKey: ["unit-quiz", activeLessonId],
    queryFn: () => getQuizByAttached(activeLessonId),
    enabled: !!activeLessonId,
  });

  const {
    data: lesson,
    isLoading,
    error: lessonError,
  } = useQuery<Lesson>({
    queryKey: ["lesson", activeLessonId],
    queryFn: () => getLessonById(activeLessonId),
    enabled: !!activeLessonId,
    retry: (count, error: any) => {
      if (error?.response?.status === 403) return false;
      return count < 2;
    },
  });

  const progressMutation = useMutation({
    mutationFn: updateLessonProgress,
    retry: 1,
    onError: () => pushToast({ type: "error", title: t("toastActionFailed") }),
  });

  const assignmentLesson = assignmentContent?.units
    .flatMap((unit) =>
      unit.lessons.map((lessonItem) => ({ ...lessonItem, unitId: unit._id })),
    )
    .find((item) => item._id === activeLessonId);

  const activeUnitId =
    (lesson?.unitId as string | undefined) ?? assignmentLesson?.unitId;
  const { data: activeUnitLessons = [] } = useQuery<Lesson[]>({
    queryKey: ["unit-lessons", activeUnitId],
    queryFn: () => getLessonsByUnit(activeUnitId!),
    enabled: !!activeUnitId && !(fromStudent && assignmentContent),
  });
  const lessonStatus = (lessonError as any)?.response?.status as
    | number
    | undefined;
  const lessonLocked =
    fromStudent && (lessonStatus === 403 || !!assignmentLesson?.locked);

  const sidebarUnits: SidebarUnitItem[] =
    fromStudent && assignmentContent
      ? assignmentContent.units.map((unit) => ({
          ...(unit as AssignmentContentUnit),
          lessons: unit.lessons as Lesson[],
        }))
      : units;

  const sidebarLoading = fromStudent ? assignmentContentLoading : unitsLoading;

  const accessStatus = (() => {
    if (!fromStudent) return "subscribed";
    const subjectAccess = assignmentContent?.access?.subject ?? false;
    const unitAccess = activeUnitId
      ? assignmentContent?.access?.unitIds?.includes(activeUnitId)
      : false;
    const unlockedLesson = assignmentLesson && !assignmentLesson.locked;
    if (subjectAccess || unitAccess || unlockedLesson) return "subscribed";
    return "none";
  })();

  const sortedUnits = [...(sidebarUnits ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  const lessonSequence: Lesson[] = (() => {
    if (fromStudent && assignmentContent?.units?.length) {
      return sortedUnits.flatMap((unit) =>
        [...(unit.lessons ?? [])].sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0),
        ),
      );
    }
    if (activeUnitLessons.length > 0) {
      return [...activeUnitLessons].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
      );
    }
    return [];
  })();

  const currentLessonIndex = lessonSequence.findIndex(
    (item) => item._id === activeLessonId,
  );
  const prevLesson =
    currentLessonIndex > 0 ? lessonSequence[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex >= 0 && currentLessonIndex < lessonSequence.length - 1
      ? lessonSequence[currentLessonIndex + 1]
      : null;
  const activeStep: StepKey = activePartId ? "practice" : "learn";

  useEffect(() => {
    if (!fromStudent || !activeLessonId || lessonLocked) return;
    if (lastViewedLessonId.current === activeLessonId) return;
    lastViewedLessonId.current = activeLessonId;
    progressMutation.mutate({ lessonId: activeLessonId, watchedPercentage: 5 });
  }, [fromStudent, activeLessonId, lessonLocked, progressMutation]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !fromStudent || lessonLocked || !activeLessonId) return;

    const handleLoadedMetadata = () => {
      if (!resumeKey) return;
      const saved = Number(localStorage.getItem(resumeKey) ?? "0");
      if (Number.isFinite(saved) && saved > 1 && saved < video.duration - 1) {
        video.currentTime = saved;
      }
    };

    const handleTimeUpdate = () => {
      if (!video.duration || !resumeKey) return;
      const now = Date.now();
      if (now - lastProgressSentAt.current < 15000) {
        localStorage.setItem(resumeKey, String(video.currentTime));
        return;
      }
      lastProgressSentAt.current = now;
      localStorage.setItem(resumeKey, String(video.currentTime));
      const percentage = Math.min(
        100,
        Math.round((video.currentTime / video.duration) * 100),
      );
      progressMutation.mutate({
        lessonId: activeLessonId,
        watchedPercentage: percentage,
      });
    };

    const handleEnded = () => {
      localStorage.setItem(resumeKey, "0");
      progressMutation.mutate(
        { lessonId: activeLessonId, watchedPercentage: 100 },
        { onSuccess: () => setCompletedLessonId(activeLessonId) },
      );
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [fromStudent, lessonLocked, activeLessonId, resumeKey, progressMutation]);

  const handleLessonClick = (selectedLesson: Lesson) => {
    setSidebarOpen(false);
    const fromParam = fromStudent ? "&from=student" : "";
    const assignmentParam = assignmentId ? `&assignmentId=${assignmentId}` : "";
    navigate(
      `/lesson/${selectedLesson._id}?subjectId=${resolvedSubjectId}${fromParam}${assignmentParam}`,
      { replace: true },
    );
  };

  const handlePartClick = (selectedLesson: Lesson, part: LessonPart) => {
    setSidebarOpen(false);
    const fromParam = fromStudent ? "&from=student" : "";
    const assignmentParam = assignmentId ? `&assignmentId=${assignmentId}` : "";
    navigate(
      `/lesson/${selectedLesson._id}?subjectId=${resolvedSubjectId}${fromParam}${assignmentParam}&partId=${part._id}`,
      { replace: true },
    );
  };

  const backPath = fromStudent
    ? resolvedSubjectId
      ? `/student/subjects/${resolvedSubjectId}`
      : "/student/learn"
    : resolvedSubjectId
      ? `/admin/subjects/${resolvedSubjectId}`
      : "/admin/subjects";

  const pdfUrl = lesson?.pdfUrl ?? "";
  const modelUrl = lesson?.modelUrl ?? "";

  return (
    // Two independent scroll columns — sidebar and content each have their own
    // overflow-y-auto, so the sidebar stays fully fixed while lesson content scrolls.
    <div className="flex h-full bg-white dark:bg-slate-950 overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Mobile sliding sidebar (drawer) ── */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="fixed top-16 left-0 h-[calc(100vh-4rem)] z-50 lg:hidden w-72
          bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-xl"
      >
        <SidebarInner
          units={sortedUnits}
          activeLessonId={activeLessonId}
          activePartId={activePartId}
          subjectId={resolvedSubjectId}
          onLessonClick={handleLessonClick}
          onPartClick={handlePartClick}
          isLoading={sidebarLoading}
          onClose={() => setSidebarOpen(false)}
          showClose
        />
      </motion.aside>

      {/*
        Desktop lesson sidebar — h-full = exact viewport height, own overflow-y-auto
        so it never moves with the lesson content. ml-4 = gap from dashboard sidebar.
      */}
      <aside className="hidden lg:flex flex-col w-80 flex-shrink-0 h-full overflow-y-auto ml-4">
        <SidebarInner
          units={sortedUnits}
          activeLessonId={activeLessonId}
          activePartId={activePartId}
          subjectId={resolvedSubjectId}
          onLessonClick={handleLessonClick}
          onPartClick={handlePartClick}
          isLoading={sidebarLoading}
        />
      </aside>

      {/* ── Lesson Content — own scroll column ── */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* Sticky guided header */}
        <div className="sticky top-0 z-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate(backPath)}
                className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {t("back")}
              </button>
              <div className="min-w-0">
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {subjectLoading
                    ? t("loading")
                    : subject
                      ? getLocalizedName(subject, i18n.language)
                      : t("notAvailableShort")}
                </p>
                <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {lesson?.title || t("lessonLoading")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                disabled={!prevLesson}
                onClick={() => prevLesson && handleLessonClick(prevLesson)}
                className="hidden sm:inline-flex"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                {t("previous", { defaultValue: "Previous" })}
              </Button>
              <Button
                size="sm"
                disabled={!nextLesson}
                onClick={() => nextLesson && handleLessonClick(nextLesson)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {t("next", { defaultValue: "Next" })}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
          <div className="px-4 sm:px-6 pb-3">
            <StepProgress
              active={activeStep}
              completed={completedLessonId === activeLessonId}
            />
          </div>
        </div>

        {isLoading ? (
          <LessonContentSkeleton />
        ) : !lesson ? (
          <div className="flex items-center justify-center h-64 text-slate-400">
            {t("lessonNotFound")}
          </div>
        ) : (
          <motion.div
            key={activeLessonId}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="px-6 py-6 space-y-6 max-w-full relative"
          >
            {lessonLocked && (
              <div className="sticky top-16 z-10">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur px-5 py-4 shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <Lock className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {t("lessonLockedTitle")}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {t("lessonLockedDesc", {
                          defaultValue:
                            "Subscribe to unlock this lesson and its quizzes.",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(backPath)}
                      >
                        {t("back")}
                      </Button>
                      {assignmentTeacherId &&
                        resolvedSubjectId && (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() =>
                              navigate(
                                `/student/subjects/${resolvedSubjectId}/teachers/${assignmentTeacherId}`,
                                {
                                  state: {
                                    gradeId: assignmentGradeId,
                                    assignmentId,
                                  },
                                },
                              )
                            }
                          >
                            {t("subscribeCta")}
                          </Button>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div
              className={
                lessonLocked ? "pointer-events-none select-none opacity-70" : ""
              }
            >
              {/* Step 1: Learn */}
              <StepSection
                step={1}
                title={t("lessonStepLearn", { defaultValue: "Learn" })}
                icon={<BookOpen className="w-4 h-4 text-blue-600" />}
              >
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                  {lesson.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {lesson.duration} {t("minutesShort")}
                    </span>
                  )}
                  {lesson.videoUrl && (
                    <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                      <PlayCircle className="w-4 h-4" />
                      {t("lessonVideoLabel")}
                    </span>
                  )}
                  {lesson.pdfUrl && (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <FileText className="w-4 h-4" />
                      {t("lessonPdfAvailable")}
                    </span>
                  )}
                  {fromStudent && (
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        accessStatus === "subscribed"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/40"
                          : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                      }`}
                    >
                      {accessStatus === "subscribed"
                        ? t("subscriptionStatusSubscribed")
                        : t("subscriptionStatusNone")}
                    </span>
                  )}
                </div>

                <RenderIfExists
                  value={lesson.videoUrl}
                  emptyMessage={t("lessonNoVideo")}
                  emptyClassName="py-10"
                >
                  <div className="rounded-2xl overflow-hidden bg-black shadow-2xl aspect-video w-full">
                    {isYouTubeUrl(lesson.videoUrl) ? (
                      <iframe
                        src={
                          getYouTubeEmbedUrl(lesson.videoUrl) || lesson.videoUrl
                        }
                        title={lesson.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        ref={videoRef}
                        src={lesson.videoUrl}
                        controls
                        className="w-full h-full"
                      />
                    )}
                  </div>
                </RenderIfExists>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      {t("lessonAbout")}
                    </h3>
                    <RenderIfExists
                      value={lesson.description}
                      emptyMessage={t("lessonNoDescription")}
                      emptyClassName="py-4"
                    >
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                        {lesson.description}
                      </p>
                    </RenderIfExists>
                    <RenderIfExists
                      value={lesson.imageUrl}
                      emptyMessage={t("noImage")}
                      emptyClassName="py-4"
                    >
                      <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                        <img
                          src={lesson.imageUrl}
                          alt={lesson.title}
                          className="w-full max-h-72 object-cover"
                        />
                      </div>
                    </RenderIfExists>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-blue-600" />
                      {t("lessonAttachments")}
                    </h3>
                    <RenderIfExists
                      value={lesson.pdfUrl}
                      emptyMessage={t("lessonNoPdf")}
                      emptyClassName="py-4"
                    >
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setPdfPreviewOpen((prev) => !prev)}
                            className="flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            {pdfPreviewOpen ? t("close") : t("viewPdf")}
                          </Button>
                          <a
                            href={pdfUrl}
                            download
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors text-sm font-medium"
                          >
                            <Download className="w-4 h-4" />
                            {t("downloadPdf")}
                          </a>
                        </div>
                        {pdfPreviewOpen && (
                          <div className="mt-3">
                            <PdfViewer
                              url={pdfUrl}
                              className="border-slate-200 dark:border-slate-800"
                            />
                          </div>
                        )}
                      </div>
                    </RenderIfExists>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        {t("audioExplanation")}
                      </h4>
                      <RenderIfExists
                        value={lesson.audioUrl}
                        emptyMessage={t("lessonNoAudio")}
                        emptyClassName="py-3"
                      >
                        <audio controls className="w-full" preload="none">
                          <source src={lesson.audioUrl} />
                        </audio>
                      </RenderIfExists>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/10 rounded-2xl p-5 border border-purple-200 dark:border-purple-800/30 space-y-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    <Box className="w-4 h-4 text-purple-600" />
                    {t("model3dLabel")}
                  </h3>
                  <RenderIfExists
                    value={lesson.modelUrl || lesson.modelExplanation}
                    emptyMessage={t("lessonNo3dModel")}
                    emptyClassName="py-6"
                  >
                    <div className="space-y-4">
                      <RenderIfExists
                        value={lesson.modelUrl}
                        emptyMessage={t("lessonNo3dModel")}
                        emptyClassName="py-4"
                      >
                        <div className="rounded-xl overflow-hidden border border-purple-200 dark:border-purple-800/40 aspect-video bg-slate-900">
                          <LessonModelViewer modelUrl={modelUrl} />
                        </div>
                      </RenderIfExists>
                      <RenderIfExists
                        value={lesson.modelExplanation}
                        emptyMessage={t("noData")}
                        emptyClassName="py-4"
                      >
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-purple-100 dark:border-purple-800/20">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1.5">
                            {t("explanationLabel")}
                          </p>
                          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                            {lesson.modelExplanation}
                          </p>
                        </div>
                      </RenderIfExists>
                    </div>
                  </RenderIfExists>
                </div>
              </StepSection>

              {/* Step 2: Practice */}
              <StepSection
                step={2}
                title={t("lessonStepPractice", { defaultValue: "Practice" })}
                icon={<Layers className="w-4 h-4 text-blue-600" />}
              >
                <LessonPartsSection
                  lessonId={activeLessonId}
                  studentId={user?._id}
                  activePartId={activePartId}
                  isTeacher={user?.role === "Teacher"}
                />
              </StepSection>

              {/* Step 3: Quiz */}
              <StepSection
                step={3}
                title={t("lessonStepQuiz", { defaultValue: "Quiz" })}
                icon={<ClipboardList className="w-4 h-4 text-blue-600" />}
              >
                {lessonQuiz ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-6 border border-blue-200 dark:border-blue-800/30 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${user?.role === "Teacher" ? "bg-amber-500" : "bg-blue-600"}`}
                        >
                          {user?.role === "Teacher" ? (
                            <Eye className="w-5 h-5 text-white" />
                          ) : (
                            <ClipboardList className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {lessonQuiz.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {user?.role === "Teacher"
                              ? t("quizPreviewTitle")
                              : t("lessonQuizSubtitle")}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant={
                          user?.role === "Teacher" ? "outline" : "default"
                        }
                        className={
                          user?.role === "Teacher"
                            ? "border-amber-500 text-amber-700 dark:text-amber-400 flex-shrink-0 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                            : "bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
                        }
                        onClick={() => setQuizOpen((prev) => !prev)}
                      >
                        {user?.role === "Teacher" ? (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            {t("previewQuiz")}
                          </>
                        ) : (
                          <>
                            <ClipboardList className="w-4 h-4 mr-2" />
                            {t("startQuiz")}
                          </>
                        )}
                      </Button>
                    </div>

                    {quizOpen && (
                      <div className="space-y-3">
                        <QuizExperience
                          title={lessonQuiz.title ?? t("quizLabel")}
                          source={{
                            mode: "attached",
                            quizId: lessonQuiz._id,
                            timeLimitMinutes: lessonQuiz.timeLimit,
                            studentId: user?._id,
                          }}
                          previewMode={user?.role === "Teacher"}
                        />
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setQuizOpen(false)}
                          >
                            {t("close")}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <EmptyState
                    description={t("lessonNoQuiz", {
                      defaultValue: "No quiz yet for this lesson.",
                    })}
                    className="py-8"
                  />
                )}
              </StepSection>

              {/* Step 4: Complete */}
              <StepSection
                step={4}
                title={t("lessonStepComplete", { defaultValue: "Complete" })}
                icon={<Award className="w-4 h-4 text-blue-600" />}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {t("lessonCompletionTitle", {
                        defaultValue: "Mark this lesson complete",
                      })}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {t("lessonCompletionDesc", {
                        defaultValue:
                          "Finish this step to unlock your next lesson.",
                      })}
                    </p>
                  </div>
                  {fromStudent && (
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => {
                        progressMutation.mutate(
                          { lessonId: activeLessonId, watchedPercentage: 100 },
                          {
                            onSuccess: () =>
                              setCompletedLessonId(activeLessonId),
                          },
                        );
                      }}
                      disabled={
                        progressMutation.isPending ||
                        completedLessonId === activeLessonId
                      }
                    >
                      {progressMutation.isPending
                        ? t("loadingEllipsis")
                        : completedLessonId === activeLessonId
                          ? t("lessonCompletedLabel")
                          : t("markCompleted")}
                    </Button>
                  )}
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                  <CommentsSection lessonId={activeLessonId} />
                </div>

                {nextLesson && (
                  <div className="flex items-center justify-between gap-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-200 dark:border-blue-800/30">
                    <div className="min-w-0">
                      <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wide font-semibold">
                        {t("nextUp", { defaultValue: "Next up" })}
                      </p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {nextLesson.title}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => handleLessonClick(nextLesson)}
                    >
                      {t("nextLesson", { defaultValue: "Go to next lesson" })}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </StepSection>

              <div className="h-4" />
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function SidebarInner({
  units,
  activeLessonId,
  activePartId,
  subjectId,
  onLessonClick,
  onPartClick,
  onClose,
  showClose,
  isLoading,
}: {
  units: SidebarUnitItem[];
  activeLessonId: string;
  activePartId: string;
  subjectId: string;
  onLessonClick: (lesson: Lesson) => void;
  onPartClick: (lesson: Lesson, part: LessonPart) => void;
  onClose?: () => void;
  showClose?: boolean;
  isLoading?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <>
      {/* Sidebar header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none">
          {t("lessonCourseContent")}
        </p>
        {showClose && onClose && (
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Units tree */}
      <ScrollArea className="flex-1">
        <div className="py-1">
          {isLoading ? (
            <SidebarSkeleton />
          ) : units.length === 0 ? (
            <EmptyState description={t("lessonNoUnits")} className="py-8" />
          ) : (
            units.map((unit, idx) => (
              <SidebarUnit
                key={unit._id}
                unit={unit}
                activeLessonId={activeLessonId}
                activePartId={activePartId}
                subjectId={subjectId}
                onLessonClick={onLessonClick}
                onPartClick={onPartClick}
                isFirstUnit={idx === 0}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </>
  );
}
