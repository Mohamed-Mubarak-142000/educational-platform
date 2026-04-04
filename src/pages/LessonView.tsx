import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
} from '@/api/subjectApi';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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
} from 'lucide-react';
import StudentQuizModal from '@/components/StudentQuizModal';
import { useAuth } from '@/context/AuthContext';

// ── Animated accordion for sidebar units ──────────────────────────

function SidebarUnit({
  unit,
  activeLessonId,
  subjectId: _subjectId,
  onLessonClick,
}: {
  unit: any;
  activeLessonId: string;
  subjectId: string;
  onLessonClick: (lesson: any) => void;
}) {
  const { data: lessons = [] } = useQuery({
    queryKey: ['unit-lessons', unit._id],
    queryFn: () => getLessonsByUnit(unit._id),
  });

  const hasActive = lessons.some((l: any) => l._id === activeLessonId);
  const [open, setOpen] = useState(hasActive || unit.order === 1);
  const { t } = useTranslation();

  // Re-open if active lesson moves into this unit
  useEffect(() => { if (hasActive) setOpen(true); }, [hasActive]);

  return (
    <div className="border-b border-slate-100 dark:border-slate-800/60 last:border-b-0">
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-left"
        onClick={() => setOpen((o: boolean) => !o)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex-shrink-0 w-6 h-6 rounded-md bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
            {unit.order}
          </span>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate leading-snug">
            {unit.title}
          </span>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 ml-2"
        >
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="pb-1">
              {lessons.map((lesson: any) => {
                const isActive = lesson._id === activeLessonId;
                return (
                  <button
                    key={lesson._id}
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
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Lesson Parts Section ──────────────────────────────────────────

function LessonPartsSection({ lessonId, studentId }: { lessonId: string; studentId?: string }) {
  const { data: parts = [], isLoading } = useQuery({
    queryKey: ['lesson-parts', lessonId],
    queryFn: () => getPartsByLesson(lessonId),
  });

  const { data: grades = [] } = useQuery({
    queryKey: ['student-grades', studentId],
    queryFn: () => getGradesByStudent(studentId!),
    enabled: !!studentId,
  });

  const saveGradeMutation = useMutation({
    mutationFn: (g: { quizId: string; score: number; correct: number; total: number }) =>
      saveQuizGrade(studentId!, g.quizId, g.score, g.correct, g.total),
  });

  if (isLoading || parts.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-slate-200">
        <Layers className="w-4 h-4 text-blue-600" />
        Lesson Parts ({parts.length})
      </h2>
      <div className="space-y-4">
        {(parts as any[]).map((part, idx) => {
          return (
            <PartCard
              key={part._id}
              part={part}
              index={idx}
              studentId={studentId}
              grades={grades}
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
  onSaveGrade,
}: {
  part: any;
  index: number;
  studentId?: string;
  grades: any[];
  onSaveGrade: (quizId: string, score: number, correct: number, total: number) => void;
}) {
  const [open, setOpen] = useState(index === 0);
  const [quizOpen, setQuizOpen] = useState(false);

  const { data: partQuiz } = useQuery({
    queryKey: ['unit-quiz', part._id],
    queryFn: () => getQuizByAttached(part._id),
  });

  const existingGrade = partQuiz
    ? grades.find((g: any) => g.quizId === partQuiz._id)
    : null;

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
      {/* Part header */}
      <button
        className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-left"
        onClick={() => setOpen((o: boolean) => !o)}
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
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </motion.span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
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
                  <iframe src={part.media.videoUrl} title={part.title} className="w-full h-full" allowFullScreen />
                </div>
              )}
              {/* Part audio */}
              {part.media?.audioUrl && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1"><Volume2 className="w-3.5 h-3.5" />Audio</p>
                  <audio src={part.media.audioUrl} controls className="w-full" />
                </div>
              )}
              {/* Model explanation for this part */}
              {part.media?.modelExplanation && (
                <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-3 border border-purple-100 dark:border-purple-800/20">
                  <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1 flex items-center gap-1"><Box className="w-3.5 h-3.5" />3D Model Notes</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{part.media.modelExplanation}</p>
                </div>
              )}
              {/* Part quiz */}
              {partQuiz && (
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-200 dark:border-blue-800/30 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm text-slate-900 dark:text-slate-100">{partQuiz.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Part quiz</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {existingGrade ? (
                      <div className="flex items-center gap-2">
                        <span className={`flex items-center gap-1 text-sm font-semibold ${existingGrade.score >= 60 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {existingGrade.score >= 60 ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          {existingGrade.score}%
                        </span>
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setQuizOpen(true)}>
                          Retry
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs" onClick={() => setQuizOpen(true)}>
                        <ClipboardList className="w-3.5 h-3.5 mr-1" />
                        Take Quiz
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
          quizTitle={partQuiz.title}
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
  const { t } = useTranslation();
  const [text, setText] = useState('');

  const { data: comments = [] } = useQuery({
    queryKey: ['lesson-comments', lessonId],
    queryFn: () => getCommentsByLesson(lessonId),
  });

  const addMutation = useMutation({
    mutationFn: (t: string) => addLessonComment(lessonId, t),
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
          <p className="text-sm text-slate-400 dark:text-slate-500 italic text-center py-4">
            {t('lessonNoComments')}
          </p>
        ) : (
          comments.map((c: any) => (
            <div key={c._id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs flex-shrink-0">
                {c.userId?.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{c.userId?.name}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{c.text}</p>
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
  const { t } = useTranslation();
  const { user } = useAuth();
  const subjectId = searchParams.get('subjectId') || '';
  const fromStudent = searchParams.get('from') === 'student' || user?.role === 'Student';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeLessonId, setActiveLessonId] = useState<string>(lessonId || '');
  const [quizOpen, setQuizOpen] = useState(false);

  const { data: subject } = useQuery({
    queryKey: ['subject', subjectId],
    queryFn: () => getSubjectById(subjectId),
    enabled: !!subjectId,
  });

  const { data: units = [] } = useQuery({
    queryKey: ['units', subjectId],
    queryFn: () => getUnitsBySubject(subjectId),
    enabled: !!subjectId,
  });

  // Check for a quiz attached to this lesson
  const { data: lessonQuiz } = useQuery({
    queryKey: ['unit-quiz', activeLessonId],
    queryFn: () => getQuizByAttached(activeLessonId),
    enabled: !!activeLessonId,
  });

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', activeLessonId],
    queryFn: () => getLessonById(activeLessonId),
    enabled: !!activeLessonId,
  });

  const handleLessonClick = (l: any) => {
    setActiveLessonId(l._id);
    setSidebarOpen(false);
    const fromParam = fromStudent ? '&from=student' : '';
    window.history.replaceState(null, '', `/lesson/${l._id}?subjectId=${subjectId}${fromParam}`);
  };

  const backPath = fromStudent
    ? subjectId ? `/student/subjects/${subjectId}` : '/student/learn'
    : subjectId ? `/admin/subjects/${subjectId}` : '/admin/subjects';

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
          subjectId={subjectId}
          onLessonClick={handleLessonClick}
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
          subjectId={subjectId}
          onLessonClick={handleLessonClick}
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
                    <span className="font-medium">{subject.name}</span>
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
            {lesson.videoUrl ? (
              <div className="rounded-2xl overflow-hidden bg-black shadow-2xl aspect-video w-full">
                {lesson.videoUrl.includes('youtube') ? (
                  <iframe
                    src={lesson.videoUrl}
                    title={lesson.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video src={lesson.videoUrl} controls className="w-full h-full" />
                )}
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 aspect-video flex items-center justify-center border border-slate-200 dark:border-slate-700 w-full">
                <div className="text-center space-y-3 text-slate-400 dark:text-slate-500">
                  <PlayCircle className="w-16 h-16 mx-auto opacity-40" />
                  <p className="text-sm">{t('lessonNoVideo')}</p>
                </div>
              </div>
            )}

            {/* Description */}
            {lesson.description && (
              <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />{t('lessonAbout')}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{lesson.description}</p>
              </div>
            )}

            {/* Lesson Quiz */}
            {lessonQuiz && (
              <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-6 border border-blue-200 dark:border-blue-800/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{lessonQuiz.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Lesson quiz — test your knowledge</p>
                  </div>
                </div>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
                  onClick={() => setQuizOpen(true)}
                >
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Start Quiz
                </Button>
              </div>
            )}

            {/* Quiz Modal */}
            {lessonQuiz && (
              <StudentQuizModal
                open={quizOpen}
                onClose={() => setQuizOpen(false)}
                quizId={lessonQuiz._id}
                quizTitle={lessonQuiz.title}
              />
            )}

            {/* Attachments */}
            {lesson.pdfUrl && (
              <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-blue-600" />{t('lessonAttachments')}
                </h2>
                <a
                  href={lesson.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors text-sm font-medium"
                >
                  <FileText className="w-5 h-5" />{t('lessonPdfDownload')}
                </a>
              </div>
            )}

            {/* Audio Recording */}
            {lesson.audioUrl && (
              <div className="bg-rose-50 dark:bg-rose-900/10 rounded-2xl p-6 border border-rose-200 dark:border-rose-800/30">
                <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-slate-200 mb-3">
                  <Volume2 className="w-4 h-4 text-rose-600" />
                  Audio Explanation
                </h2>
                <audio src={lesson.audioUrl} controls className="w-full" />
              </div>
            )}

            {/* 3D Model + Written Explanation */}
            {(lesson.modelUrl || lesson.modelExplanation) && (
              <div className="bg-purple-50 dark:bg-purple-900/10 rounded-2xl p-6 border border-purple-200 dark:border-purple-800/30 space-y-4">
                <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-slate-200">
                  <Box className="w-4 h-4 text-purple-600" />
                  3D Model
                </h2>
                {lesson.modelUrl && (
                  <div className="rounded-xl overflow-hidden border border-purple-200 dark:border-purple-800/40 aspect-video bg-slate-900">
                    {/* @ts-expect-error model-viewer web component */}
                    <model-viewer
                      src={lesson.modelUrl}
                      auto-rotate
                      camera-controls
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                )}
                {lesson.modelExplanation && (
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-purple-100 dark:border-purple-800/20">
                    <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1.5">Explanation</p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{lesson.modelExplanation}</p>
                  </div>
                )}
              </div>
            )}

            {/* Lesson Parts */}
            <LessonPartsSection lessonId={activeLessonId} studentId={user?._id} />

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
  subjectId,
  onLessonClick,
  onClose,
  showClose,
}: {
  units: any[];
  activeLessonId: string;
  subjectId: string;
  onLessonClick: (l: any) => void;
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
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-8">{t('lessonNoUnits')}</p>
          ) : (
            units.map((unit: any) => (
              <SidebarUnit
                key={unit._id}
                unit={unit}
                activeLessonId={activeLessonId}
                subjectId={subjectId}
                onLessonClick={onLessonClick}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </>
  );
}
