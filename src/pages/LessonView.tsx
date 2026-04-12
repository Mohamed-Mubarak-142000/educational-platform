import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLocalizedName } from '@/lib/localeUtils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getLessonById,
  getSubjectById,
  getUnitsBySubject,
  getLessonsByUnit,
  getCommentsByLesson,
  addLessonComment,
  getQuizByAttached,
  getPartsByLesson,
  saveQuizGrade,
  getGradesByStudent,
  type Subject,
  type Unit,
  type Lesson,
  type LessonPart,
  type LessonComment,
  type Quiz,
  type QuizGrade,
} from '@/api/subjectApi';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmptyState, PdfViewer, RenderIfExists } from '@/components/shared';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
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
} from 'lucide-react';
import StudentQuizModal from '@/components/StudentQuizModal';
import { useAuth } from '@/context/AuthContext';
import LessonModelViewer from '@/components/LessonModelViewer';

// ── Animated accordion for sidebar units ──────────────────────────

const isYouTubeUrl = (url?: string) => !!url && (url.includes('youtube.com') || url.includes('youtu.be'));

function getYouTubeEmbedUrl(url?: string) {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.includes('youtube.com/embed/')) return trimmed;

  const match = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  if (match?.[1]) return `https://www.youtube.com/embed/${match[1]}`;
  return '';
}

function SidebarUnit({
  unit,
  activeLessonId,
  activePartId,
  subjectId: _subjectId,
  onLessonClick,
  onPartClick,
}: {
  unit: Unit;
  activeLessonId: string;
  activePartId: string;
  subjectId: string;
  onLessonClick: (lesson: Lesson) => void;
  onPartClick: (lesson: Lesson, part: LessonPart) => void;
}) {
  const { data: lessons = [] } = useQuery<Lesson[]>({
    queryKey: ['unit-lessons', unit._id],
    queryFn: () => getLessonsByUnit(unit._id),
  });

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
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="pb-1">
              {lessons.map((lesson) => (
                <SidebarLesson
                  key={lesson._id}
                  lesson={lesson}
                  activeLessonId={activeLessonId}
                  activePartId={activePartId}
                  onLessonClick={onLessonClick}
                  onPartClick={onPartClick}
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
}: {
  lesson: Lesson;
  activeLessonId: string;
  activePartId: string;
  onLessonClick: (lesson: Lesson) => void;
  onPartClick: (lesson: Lesson, part: LessonPart) => void;
}) {
  const { t } = useTranslation();
  const { data: parts = [] } = useQuery<LessonPart[]>({
    queryKey: ['lesson-parts', lesson._id],
    queryFn: () => getPartsByLesson(lesson._id),
  });

  const isActive = lesson._id === activeLessonId;

  return (
    <div className="space-y-1">
      <button
        className={`w-full flex items-center gap-2.5 pl-8 pr-4 py-2.5 text-left transition-colors ${
          isActive
            ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-600'
            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border-l-2 border-transparent'
        }`}
        onClick={() => onLessonClick(lesson)}
      >
        {lesson.videoUrl ? (
          <PlayCircle className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
        ) : (
          <FileText className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
        )}
        <span className={`text-xs leading-snug truncate flex-1 ${isActive ? 'font-semibold text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400'}`}>
          {lesson.title}
        </span>
        {lesson.duration && (
          <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0 ml-auto pl-1">
            {lesson.duration} {t('minutesShort')}
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
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
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
}: {
  lessonId: string;
  studentId?: string;
  activePartId?: string;
}) {
  const { t } = useTranslation();
  const { data: parts = [], isLoading } = useQuery<LessonPart[]>({
    queryKey: ['lesson-parts', lessonId],
    queryFn: () => getPartsByLesson(lessonId),
  });

  const { data: grades = [] } = useQuery<QuizGrade[]>({
    queryKey: ['student-grades', studentId],
    queryFn: () => getGradesByStudent(studentId!),
    enabled: !!studentId,
  });

  const saveGradeMutation = useMutation({
    mutationFn: (g: { quizId: string; score: number; correct: number; total: number }) =>
      saveQuizGrade(studentId!, g.quizId, g.score, g.correct, g.total),
  });

  useEffect(() => {
    if (!activePartId) return;
    const el = document.getElementById(`part-${activePartId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activePartId, parts.length]);

  if (isLoading) return null;
  if (parts.length === 0) {
    return <EmptyState description={t('lessonNoParts')} className="py-8" />;
  }

  return (
    <div className="space-y-4">
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-slate-200">
        <Layers className="w-4 h-4 text-blue-600" />
        {t('lessonParts')} ({parts.length})
      </h2>
      <div className="space-y-4">
        {parts.map((part, idx) => {
          return (
            <PartCard
              key={part._id}
              part={part}
              index={idx}
              studentId={studentId}
              grades={grades}
              activePartId={activePartId}
              onSaveGrade={(quizId, score, correct, total) =>
                saveGradeMutation.mutate({ quizId, score, correct, total })
              }
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
  grades,
  activePartId,
  onSaveGrade,
}: {
  part: LessonPart;
  index: number;
  studentId?: string;
  grades: QuizGrade[];
  activePartId?: string;
  onSaveGrade: (quizId: string, score: number, correct: number, total: number) => void;
}) {
  const { t } = useTranslation();
  const isActivePart = !!activePartId && part._id === activePartId;
  const [open, setOpen] = useState(index === 0);
  const isOpen = open || isActivePart;
  const partRef = useRef<HTMLDivElement | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);

  const { data: partQuiz } = useQuery<Quiz | null>({
    queryKey: ['unit-quiz', part._id],
    queryFn: () => getQuizByAttached(part._id),
  });

  const existingGrade = partQuiz
    ? grades.find((grade) => grade.quizId === partQuiz._id)
    : null;

  useEffect(() => {
    if (isActivePart) {
      partRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
          <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{part.title}</span>
        </div>
        <div className="flex items-center gap-2">
          {existingGrade && (
            <span className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded-full">
              <Award className="w-3 h-3" />
              {existingGrade.score}%
            </span>
          )}
          <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </motion.span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-5 py-4 space-y-4 bg-white dark:bg-slate-950">
              {/* Written content */}
              {part.content && (
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{part.content}</p>
              )}
              {/* Part video */}
              {part.media?.videoUrl && (
                <div className="rounded-xl overflow-hidden aspect-video bg-black">
                  {isYouTubeUrl(part.media.videoUrl) ? (
                    <iframe src={part.media.videoUrl} title={part.title} className="w-full h-full" allowFullScreen />
                  ) : (
                    <video src={part.media.videoUrl} controls className="w-full h-full" />
                  )}
                </div>
              )}
              {/* Part audio */}
              {part.media?.audioUrl && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1"><Volume2 className="w-3.5 h-3.5" />{t('audioLabel')}</p>
                  <audio src={part.media.audioUrl} controls className="w-full" />
                </div>
              )}
              {/* Model explanation for this part */}
              {part.media?.modelExplanation && (
                <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-3 border border-purple-100 dark:border-purple-800/20">
                  <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1 flex items-center gap-1"><Box className="w-3.5 h-3.5" />{t('modelNotesLabel')}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{part.media.modelExplanation}</p>
                </div>
              )}
              {/* Part quiz */}
              {partQuiz && (
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-200 dark:border-blue-800/30 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm text-slate-900 dark:text-slate-100">{partQuiz.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('partQuizLabel')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {existingGrade ? (
                      <div className="flex items-center gap-2">
                        <span className={`flex items-center gap-1 text-sm font-semibold ${existingGrade.score >= 60 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {existingGrade.score >= 60 ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          {existingGrade.score}%
                        </span>
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setQuizOpen(true)}>
                          {t('retry')}
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs" onClick={() => setQuizOpen(true)}>
                        <ClipboardList className="w-3.5 h-3.5 mr-1" />
                        {t('takeQuiz')}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {partQuiz && (
        <StudentQuizModal
          open={quizOpen}
          onClose={() => setQuizOpen(false)}
          quizId={partQuiz._id}
          quizTitle={partQuiz.title ?? t('quizLabel')}
          onComplete={(score, correct, total) => {
            onSaveGrade(partQuiz._id, score, correct, total);
          }}
        />
      )}
    </div>
  );
}

// ── Comments Section ───────────────────────────────────────────────

function CommentsSection({ lessonId }: { lessonId: string }) {
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US';
  const [text, setText] = useState('');

  const { data: comments = [] } = useQuery<LessonComment[]>({
    queryKey: ['lesson-comments', lessonId],
    queryFn: () => getCommentsByLesson(lessonId),
  });

  const addMutation = useMutation({
    mutationFn: (commentText: string) => addLessonComment(lessonId, commentText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-comments', lessonId] });
      setText('');
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
        {t('lessonDiscussion')} ({comments.length})
      </h3>
      <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('lessonCommentPlaceholder')}
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
      <div className="space-y-4">
        {comments.length === 0 ? (
          <EmptyState description={t('lessonNoComments')} className="py-8" />
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs flex-shrink-0">
                {comment.userId?.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{comment.userId?.name}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString(locale) : '-'}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{comment.text}</p>
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
  const subjectId = searchParams.get('subjectId') || '';
  const fromStudent = searchParams.get('from') === 'student' || user?.role === 'Student';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const activeLessonId = lessonId || '';
  const activePartId = searchParams.get('partId') || '';

  const { data: subject } = useQuery<Subject>({
    queryKey: ['subject', subjectId],
    queryFn: () => getSubjectById(subjectId),
    enabled: !!subjectId,
  });

  const { data: units = [] } = useQuery<Unit[]>({
    queryKey: ['units', subjectId],
    queryFn: () => getUnitsBySubject(subjectId),
    enabled: !!subjectId,
  });

  // Check for a quiz attached to this lesson
  const { data: lessonQuiz } = useQuery<Quiz | null>({
    queryKey: ['unit-quiz', activeLessonId],
    queryFn: () => getQuizByAttached(activeLessonId),
    enabled: !!activeLessonId,
  });

  const { data: lesson, isLoading } = useQuery<Lesson>({
    queryKey: ['lesson', activeLessonId],
    queryFn: () => getLessonById(activeLessonId),
    enabled: !!activeLessonId,
  });

  const handleLessonClick = (selectedLesson: Lesson) => {
    setSidebarOpen(false);
    const fromParam = fromStudent ? '&from=student' : '';
    navigate(`/lesson/${selectedLesson._id}?subjectId=${subjectId}${fromParam}`, { replace: true });
  };

  const handlePartClick = (selectedLesson: Lesson, part: LessonPart) => {
    setSidebarOpen(false);
    const fromParam = fromStudent ? '&from=student' : '';
    navigate(`/lesson/${selectedLesson._id}?subjectId=${subjectId}${fromParam}&partId=${part._id}`, { replace: true });
  };

  const backPath = fromStudent
    ? subjectId ? `/student/subjects/${subjectId}` : '/student/learn'
    : subjectId ? `/admin/subjects/${subjectId}` : '/admin/subjects';

  const pdfUrl = lesson?.pdfUrl ?? '';
  const modelUrl = lesson?.modelUrl ?? '';

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
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="fixed top-16 left-0 h-[calc(100vh-4rem)] z-50 lg:hidden w-72
          bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-xl"
      >
        <SidebarInner
          units={units}
          activeLessonId={activeLessonId}
          activePartId={activePartId}
          subjectId={subjectId}
          onLessonClick={handleLessonClick}
          onPartClick={handlePartClick}
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
          units={units}
          activeLessonId={activeLessonId}
          activePartId={activePartId}
          subjectId={subjectId}
          onLessonClick={handleLessonClick}
          onPartClick={handlePartClick}
        />
      </aside>

      {/* ── Lesson Content — own scroll column ── */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* Mobile header bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
            {lesson?.title || t('lessonLoading')}
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-slate-400 dark:text-slate-500">
            <div className="text-center space-y-3">
              <BookOpen className="w-10 h-10 mx-auto animate-pulse" />
              <p>{t('lessonLoading')}</p>
            </div>
          </div>
        ) : !lesson ? (
          <div className="flex items-center justify-center h-64 text-slate-400">{t('lessonNotFound')}</div>
        ) : (
          <motion.div
            key={activeLessonId}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="px-6 py-8 space-y-8 max-w-full"
          >
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm -mt-2">
              <button
                onClick={() => navigate(backPath)}
                className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {t('back')}
              </button>
              {subject && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">/</span>
                  <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <span className="text-base leading-none">{subject.icon}</span>
                    <span className="font-medium">{getLocalizedName(subject, i18n.language)}</span>
                  </span>
                </>
              )}
            </nav>

            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {lesson.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                {lesson.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />{lesson.duration} {t('minutesShort')}
                  </span>
                )}
                {lesson.videoUrl && (
                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <PlayCircle className="w-4 h-4" />{t('lessonVideoLabel')}
                  </span>
                )}
                {lesson.pdfUrl && (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <FileText className="w-4 h-4" />{t('lessonPdfAvailable')}
                  </span>
                )}
              </div>
            </div>

       

            {/* Video Player */}
            <RenderIfExists value={lesson.videoUrl} emptyMessage={t('lessonNoVideo')} emptyClassName="py-12">
              <div className="rounded-2xl overflow-hidden bg-black shadow-2xl aspect-video w-full">
                {isYouTubeUrl(lesson.videoUrl) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(lesson.videoUrl) || lesson.videoUrl}
                    title={lesson.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video src={lesson.videoUrl} controls className="w-full h-full" />
                )}
              </div>
            </RenderIfExists>

            {/* Description */}
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />{t('lessonAbout')}
              </h2>
              <div className="space-y-4">
                <RenderIfExists value={lesson.description} emptyMessage={t('lessonNoDescription')} emptyClassName="py-6">
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                    {lesson.description}
                  </p>
                </RenderIfExists>
                <RenderIfExists value={lesson.imageUrl} emptyMessage={t('noImage')} emptyClassName="py-6">
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                    <img
                      src={lesson.imageUrl}
                      alt={lesson.title}
                      className="w-full max-h-80 object-cover"
                    />
                  </div>
                </RenderIfExists>
              </div>
            </div>

            {/* Lesson Quiz */}
            {lessonQuiz && (
              <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-6 border border-blue-200 dark:border-blue-800/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{lessonQuiz.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('lessonQuizSubtitle')}</p>
                  </div>
                </div>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
                  onClick={() => setQuizOpen(true)}
                >
                  <ClipboardList className="w-4 h-4 mr-2" />
                  {t('startQuiz')}
                </Button>
              </div>
            )}

            {/* Quiz Modal */}
            {lessonQuiz && (
              <StudentQuizModal
                open={quizOpen}
                onClose={() => setQuizOpen(false)}
                quizId={lessonQuiz._id}
                quizTitle={lessonQuiz.title ?? t('quizLabel')}
              />
            )}

            {/* Attachments */}
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-blue-600" />{t('lessonAttachments')}
              </h2>
              <RenderIfExists value={lesson.pdfUrl} emptyMessage={t('lessonNoPdf')} emptyClassName="py-8">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPdfPreviewOpen((prev) => !prev)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      {pdfPreviewOpen ? t('close') : t('viewPdf')}
                    </Button>
                    <a
                      href={pdfUrl}
                      download
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      {t('downloadPdf')}
                    </a>
                  </div>
                  {pdfPreviewOpen && (
                    <div className="mt-4">
                      <PdfViewer url={pdfUrl} className="border-slate-200 dark:border-slate-800" />
                    </div>
                  )}
                </div>
              </RenderIfExists>
            </div>

            {/* Audio Recording */}
            <div className="bg-rose-50 dark:bg-rose-900/10 rounded-2xl p-6 border border-rose-200 dark:border-rose-800/30">
              <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-slate-200 mb-3">
                <Volume2 className="w-4 h-4 text-rose-600" />
                {t('audioExplanation')}
              </h2>
              <RenderIfExists value={lesson.audioUrl} emptyMessage={t('lessonNoAudio')} emptyClassName="py-6">
                <audio controls className="w-full" preload="none">
                  <source src={lesson.audioUrl} />
                </audio>
              </RenderIfExists>
            </div>

            {/* 3D Model + Written Explanation */}
            <div className="bg-purple-50 dark:bg-purple-900/10 rounded-2xl p-6 border border-purple-200 dark:border-purple-800/30 space-y-4">
              <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-slate-200">
                <Box className="w-4 h-4 text-purple-600" />
                {t('model3dLabel')}
              </h2>
              <RenderIfExists value={lesson.modelUrl || lesson.modelExplanation} emptyMessage={t('lessonNo3dModel')} emptyClassName="py-8">
                <div className="space-y-4">
                  <RenderIfExists value={lesson.modelUrl} emptyMessage={t('lessonNo3dModel')} emptyClassName="py-6">
                    <div className="rounded-xl overflow-hidden border border-purple-200 dark:border-purple-800/40 aspect-video bg-slate-900">
                      <LessonModelViewer modelUrl={modelUrl} />
                    </div>
                  </RenderIfExists>
                  <RenderIfExists value={lesson.modelExplanation} emptyMessage={t('noData')} emptyClassName="py-6">
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-purple-100 dark:border-purple-800/20">
                      <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1.5">{t('explanationLabel')}</p>
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                        {lesson.modelExplanation}
                      </p>
                    </div>
                  </RenderIfExists>
                </div>
              </RenderIfExists>
            </div>

            {/* Lesson Parts */}
            <LessonPartsSection lessonId={activeLessonId} studentId={user?._id} activePartId={activePartId} />

            {/* Comments */}
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
              <CommentsSection lessonId={activeLessonId} />
            </div>

            <div className="h-8" />
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
}: {
  units: Unit[];
  activeLessonId: string;
  activePartId: string;
  subjectId: string;
  onLessonClick: (lesson: Lesson) => void;
  onPartClick: (lesson: Lesson, part: LessonPart) => void;
  onClose?: () => void;
  showClose?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <>
      {/* Sidebar header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none">
          {t('lessonCourseContent')}
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
          {units.length === 0 ? (
            <EmptyState description={t('lessonNoUnits')} className="py-8" />
          ) : (
            units.map((unit) => (
              <SidebarUnit
                key={unit._id}
                unit={unit}
                activeLessonId={activeLessonId}
                activePartId={activePartId}
                subjectId={subjectId}
                onLessonClick={onLessonClick}
                onPartClick={onPartClick}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </>
  );
}
