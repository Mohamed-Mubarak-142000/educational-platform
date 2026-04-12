import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getSubjectById,
  getUnitsBySubject,
  getLessonsByUnit,
  getPartsByLesson,
  createUnit,
  updateUnit,
  deleteUnit,
  deleteLesson,
  getQuizByAttached,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuestionsByQuiz,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getUnitAvailability,
  setUnitAvailability,
  type Subject,
  type Unit,
  type Lesson,
  type LessonPart,
  type Quiz,
  type QuizQuestion,
  type UnitAvailability,
  type UnitAvailabilityInput,
} from '@/api/subjectApi';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useTranslation } from 'react-i18next';
import { getLocalizedName } from '@/lib/localeUtils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  PlayCircle,
  FileText,
  Clock,
  BookOpen,
  Layers,
  ClipboardList,
  Lock,
  Unlock,
  CalendarClock,
  Settings2,
} from 'lucide-react';
import { cardVariants, buttonVariants, spacing } from '@/lib/constants';

// ── Types & helpers ────────────────────────────────────────────────

type UnitForm = { title: string; description: string };

const emptyUnitForm: UnitForm = { title: '', description: '' };

function AvailabilityBadge({ status }: { status?: string }) {
  const { t } = useTranslation();
  if (!status || status === 'available') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/40">
      <Unlock className="w-2.5 h-2.5" />{t('available')}
    </span>
  );
  if (status === 'locked') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/40">
      <Lock className="w-2.5 h-2.5" />{t('locked')}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/40">
      <CalendarClock className="w-2.5 h-2.5" />{t('upcoming')}
    </span>
  );
}

function LessonRow({
  lesson,
  subjectId,
  index,
  onEditLesson,
  onDeleteLesson,
  onAddLessonQuiz,
  navigate,
}: {
  lesson: Lesson;
  subjectId: string;
  index: number;
  onEditLesson: (lesson: Lesson) => void;
  onDeleteLesson: (lessonId: string) => void;
  onAddLessonQuiz: (lessonId: string, lessonTitle: string) => void;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const { t } = useTranslation();
  const { data: parts = [] } = useQuery<LessonPart[]>({
    queryKey: ['lesson-parts', lesson._id],
    queryFn: () => getPartsByLesson(lesson._id),
  });

  const { data: lessonQuiz } = useQuery<Quiz | null>({
    queryKey: ['unit-quiz', lesson._id],
    queryFn: () => getQuizByAttached(lesson._id),
  });

  return (
    <div className="px-6 py-3.5">
      <div className="flex items-center gap-4 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors rounded-lg px-2 py-2">
        <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-medium text-slate-500 flex-shrink-0">
          {index + 1}
        </span>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {lesson.videoUrl ? (
            <PlayCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
          ) : (
            <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
          )}
          <span
            className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            onClick={() => navigate(`/lesson/${lesson._id}?subjectId=${subjectId}`)}
          >
            {lesson.title}
          </span>
        </div>
        {lesson.duration && (
          <span className="hidden sm:flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 flex-shrink-0">
            <Clock className="w-3 h-3" />
            {lesson.duration}m
          </span>
        )}
        {lessonQuiz && (
          <span className="hidden sm:flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 px-2 py-1 rounded-full flex-shrink-0">
            <ClipboardList className="w-3 h-3" /> {t('quizLabel')}
          </span>
        )}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onEditLesson(lesson)}
            title={t('editLesson')}
          >
            <Pencil className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
            onClick={() => onDeleteLesson(lesson._id)}
            title={t('deleteLesson')}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
            onClick={() => onAddLessonQuiz(lesson._id, lesson.title)}
            title={t('manageLessonQuiz')}
          >
            <ClipboardList className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {parts.length > 0 && (
        <div className="mt-2 ms-10 space-y-1">
          {parts.map((part, partIndex) => (
            <div
              key={part._id}
              className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 px-3 py-1.5 rounded-lg"
            >
              <span className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-700 text-[10px] flex items-center justify-center flex-shrink-0">
                {partIndex + 1}
              </span>
              <span className="truncate">{part.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────

function LessonsAccordionItem({
  unit,
  subjectId,
  onEditLesson,
  onDeleteLesson,
  onAddLesson,
  onEditUnit,
  onDeleteUnit,
  onAddUnitQuiz,
  onAddLessonQuiz,
  onManageAvailability,
  navigate,
}: {
  unit: Unit;
  subjectId: string;
  onEditLesson: (lesson: Lesson, unitId: string) => void;
  onDeleteLesson: (lessonId: string) => void;
  onAddLesson: (unitId: string) => void;
  onEditUnit: (unit: Unit) => void;
  onDeleteUnit: (unitId: string) => void;
  onAddUnitQuiz: (unitId: string, unitTitle: string) => void;
  onAddLessonQuiz: (lessonId: string, lessonTitle: string) => void;
  onManageAvailability: (unit: Unit) => void;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);

  const { data: lessons = [], isLoading } = useQuery<Lesson[]>({
    queryKey: ['unit-lessons', unit._id],
    queryFn: () => getLessonsByUnit(unit._id),
  });

  const { data: availabilityList = [] } = useQuery<UnitAvailability[]>({
    queryKey: ['unit-availability'],
    queryFn: getUnitAvailability,
  });
  const availability = availabilityList.find((item) => item.unitId === unit._id);

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Unit header */}
      <div
        className="flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-slate-900/60 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors select-none"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
            {unit.order ?? 0}
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{unit.title}</p>
            {unit.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{unit.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
          <span className="hidden sm:flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
            <BookOpen className="w-3 h-3" />
            {t('lessonCount', { count: lessons.length })}
          </span>
          <AvailabilityBadge status={availability?.status} />
          {/* Unit actions — always visible, stopPropagation so accordion doesn't toggle */}
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onEditUnit(unit)}
              title={t('editUnit')}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
              onClick={() => onDeleteUnit(unit._id)}
              title={t('deleteUnit')}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
              onClick={() => onAddUnitQuiz(unit._id, unit.title)}
              title={t('manageUnitQuiz')}
            >
              <ClipboardList className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400"
              onClick={() => onManageAvailability(unit)}
              title={t('manageAvailability')}
            >
              <Settings2 className="w-3.5 h-3.5" />
            </Button>
          </div>
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </motion.span>
        </div>
      </div>

      {/* Animated lessons list */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="lessons"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
        <div className="bg-white dark:bg-slate-950">
          {isLoading ? (
            <div className="px-6 py-4 space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : lessons.length === 0 ? (
            <div className="px-6 py-6 text-center">
              <EmptyState description={t('noLessonsInUnit')} className="py-6" />
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {lessons.map((lesson, idx) => (
                <LessonRow
                  key={lesson._id}
                  lesson={lesson}
                  subjectId={subjectId}
                  index={idx}
                  onEditLesson={(l) => onEditLesson(l, unit._id)}
                  onDeleteLesson={onDeleteLesson}
                  onAddLessonQuiz={onAddLessonQuiz}
                  navigate={navigate}
                />
              ))}
            </div>
          )}
          <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800/50">
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-8 text-xs font-medium"
              onClick={(e) => { e.stopPropagation(); onAddLesson(unit._id); }}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> {t('addLesson')}
            </Button>
          </div>
        </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Quiz Dialog ────────────────────────────────────────────────────

type QForm = { text: string; optA: string; optB: string; optC: string; optD: string; correct: number };
const emptyQForm: QForm = { text: '', optA: '', optB: '', optC: '', optD: '', correct: 0 };
const OPT_LABELS = ['A', 'B', 'C', 'D'] as const;
const OPT_KEYS = ['optA', 'optB', 'optC', 'optD'] as const;

function QuizDialog({
  open,
  onClose,
  attachedTo,
  attachedToId,
  attachedTitle,
}: {
  open: boolean;
  onClose: () => void;
  attachedTo: 'unit' | 'lesson';
  attachedToId: string;
  attachedTitle: string;
}) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [view, setView] = useState<'main' | 'question'>('main');
  const [createTitle, setCreateTitle] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [confirmDeleteQuiz, setConfirmDeleteQuiz] = useState(false);
  const [qForm, setQForm] = useState<QForm>(emptyQForm);
  const [editQId, setEditQId] = useState<string | null>(null);
  const [deleteQId, setDeleteQId] = useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setView('main');
      setCreateTitle('');
      setEditingTitle(false);
      setConfirmDeleteQuiz(false);
      setQForm(emptyQForm);
      setEditQId(null);
      setDeleteQId(null);
    }
  }, [open, attachedToId]);

  const invalidateQuiz = () => qc.invalidateQueries({ queryKey: ['unit-quiz', attachedToId] });
  const invalidateQuestions = (quizId: string) => qc.invalidateQueries({ queryKey: ['quiz-questions', quizId] });

  const { data: quiz, isLoading: quizLoading } = useQuery<Quiz | null>({
    queryKey: ['unit-quiz', attachedToId],
    queryFn: () => getQuizByAttached(attachedToId),
    enabled: open && !!attachedToId,
  });

  const { data: questions = [] } = useQuery<QuizQuestion[]>({
    queryKey: ['quiz-questions', quiz?._id],
    queryFn: () => getQuestionsByQuiz(quiz!._id),
    enabled: !!quiz?._id && open,
  });

  const createQuizMut = useMutation({
    mutationFn: () => createQuiz({ attachedTo, attachedToId, title: createTitle.trim() }),
    onSuccess: () => { invalidateQuiz(); setCreateTitle(''); },
  });

  const updateQuizMut = useMutation({
    mutationFn: (title: string) => updateQuiz(quiz!._id, { title }),
    onSuccess: () => { invalidateQuiz(); setEditingTitle(false); },
  });

  const deleteQuizMut = useMutation({
    mutationFn: () => deleteQuiz(quiz!._id),
    onSuccess: () => { invalidateQuiz(); setConfirmDeleteQuiz(false); },
  });

  const createQMut = useMutation({
    mutationFn: () => createQuestion(quiz!._id, {
      text: qForm.text.trim(),
      options: [qForm.optA.trim(), qForm.optB.trim(), qForm.optC.trim(), qForm.optD.trim()],
      correctAnswer: qForm.correct as 0 | 1 | 2 | 3,
    }),
    onSuccess: () => { invalidateQuestions(quiz!._id); setView('main'); setQForm(emptyQForm); },
  });

  const updateQMut = useMutation({
    mutationFn: () => updateQuestion(editQId!, {
      text: qForm.text.trim(),
      options: [qForm.optA.trim(), qForm.optB.trim(), qForm.optC.trim(), qForm.optD.trim()],
      correctAnswer: qForm.correct as 0 | 1 | 2 | 3,
    }),
    onSuccess: () => { invalidateQuestions(quiz!._id); setView('main'); setQForm(emptyQForm); setEditQId(null); },
  });

  const deleteQMut = useMutation({
    mutationFn: (id: string) => deleteQuestion(id),
    onSuccess: () => { invalidateQuestions(quiz!._id); setDeleteQId(null); },
  });

  const openAddQuestion = () => { setEditQId(null); setQForm(emptyQForm); setView('question'); };
  const openEditQuestion = (q: QuizQuestion) => {
    setEditQId(q._id);
    setQForm({ text: q.text, optA: q.options[0], optB: q.options[1], optC: q.options[2], optD: q.options[3], correct: q.correctAnswer });
    setView('question');
  };

  const qFormValid = qForm.text.trim() && qForm.optA.trim() && qForm.optB.trim() && qForm.optC.trim() && qForm.optD.trim();

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-[580px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="truncate">{t('quizTitleWithAttachment', { title: attachedTitle })}</span>
            {quiz && (
              <span className="text-xs font-normal text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full flex-shrink-0">
                {t('questionCount', { count: questions.length })}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {view === 'main' ? (
            <div className="space-y-4 py-2">
              {quizLoading ? (
                <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
              ) : !quiz ? (
                /* ── Create quiz form ── */
                <div className="space-y-3">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t('noQuizAttached', { attachedTo })}
                  </p>
                  <div>
                    <Label className="text-xs text-slate-500 mb-1 block">{t('quizTitleLabel')}</Label>
                    <Input
                      value={createTitle}
                      onChange={(e) => setCreateTitle(e.target.value)}
                      placeholder={t('quizTitlePlaceholder', { title: attachedTitle })}
                      onKeyDown={(e) => { if (e.key === 'Enter' && createTitle.trim()) createQuizMut.mutate(); }}
                    />
                  </div>
                  <Button
                    className={buttonVariants.primary + ' w-full'}
                    onClick={() => createQuizMut.mutate()}
                    disabled={!createTitle.trim() || createQuizMut.isPending}
                  >
                    {createQuizMut.isPending ? t('creating') : t('createQuiz')}
                  </Button>
                </div>
              ) : (
                /* ── Quiz exists ── */
                <div className="space-y-4">
                  {/* Quiz title bar */}
                  <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/40">
                    <ClipboardList className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    {editingTitle ? (
                      <div className="flex-1 flex items-center gap-2">
                        <Input
                          value={titleDraft}
                          onChange={(e) => setTitleDraft(e.target.value)}
                          className="h-7 text-sm"
                          autoFocus
                        />
                        <Button size="sm" className="h-7 px-3 text-xs" onClick={() => updateQuizMut.mutate(titleDraft)} disabled={!titleDraft.trim() || updateQuizMut.isPending}>
                          {updateQuizMut.isPending ? t('loadingEllipsis') : t('save')}
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setEditingTitle(false)}>
                          {t('cancel')}
                        </Button>
                      </div>
                    ) : confirmDeleteQuiz ? (
                      <div className="flex-1 flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-red-600 dark:text-red-400 font-medium">{t('deleteQuizConfirm')}</span>
                        <Button size="sm" className="h-6 px-2 text-xs bg-red-600 hover:bg-red-700 text-white" onClick={() => deleteQuizMut.mutate()} disabled={deleteQuizMut.isPending}>
                          {deleteQuizMut.isPending ? t('loadingEllipsis') : t('confirmDelete')}
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setConfirmDeleteQuiz(false)}>
                          {t('cancel')}
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{quiz.title ?? t('quizLabel')}</span>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 flex-shrink-0" onClick={() => { setTitleDraft(quiz.title ?? ''); setEditingTitle(true); }} title={t('editQuizTitle')}>
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 flex-shrink-0 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500" onClick={() => setConfirmDeleteQuiz(true)} title={t('deleteQuizTitle')}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Questions section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {t('questionsCount', { count: questions.length })}
                      </h4>
                      <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-7 text-xs font-medium" onClick={openAddQuestion}>
                        <Plus className="w-3 h-3 mr-1" /> {t('addQuestion')}
                      </Button>
                    </div>

                    {questions.length === 0 ? (
                      <div className="py-6 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                        <EmptyState description={t('noQuestionsYet')} className="py-6" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {questions.map((q, idx) => (
                          <div key={q._id} className="border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 flex-1">
                                <span className="text-slate-400 dark:text-slate-500 mr-1.5">{idx + 1}.</span>
                                {q.text}
                              </p>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {deleteQId === q._id ? (
                                  <>
                                    <span className="text-xs text-red-500">{t('deleteConfirmShort')}</span>
                                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-white bg-red-500 hover:bg-red-600" onClick={() => deleteQMut.mutate(q._id)} disabled={deleteQMut.isPending}>
                                      {t('yes')}
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setDeleteQId(null)}>
                                      {t('no')}
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => openEditQuestion(q)} title={t('editQuestion')}>
                                      <Pencil className="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500" onClick={() => setDeleteQId(q._id)} title={t('deleteQuestion')}>
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                              {q.options.map((opt, i) => (
                                <div
                                  key={i}
                                  className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded ${
                                    i === q.correctAnswer
                                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium border border-green-200 dark:border-green-800/40'
                                      : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                                  }`}
                                >
                                  <span className={`font-bold flex-shrink-0 ${i === q.correctAnswer ? 'text-green-700 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                    {OPT_LABELS[i]}
                                  </span>
                                  <span className="truncate">{opt}</span>
                                  {i === q.correctAnswer && <span className="ml-auto flex-shrink-0">✓</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── Question form ── */
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => { setView('main'); setQForm(emptyQForm); setEditQId(null); }}>
                  {t('back')}
                </Button>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {editQId ? t('editQuestion') : t('newQuestion')}
                </h3>
              </div>
              <div>
                <Label className="text-xs text-slate-500 mb-1 block">{t('questionRequiredLabel')}</Label>
                <Textarea
                  value={qForm.text}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setQForm((f) => ({ ...f, text: e.target.value }))}
                  placeholder={t('questionPlaceholderExample')}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-500 block">{t('questionOptionsHelp')}</Label>
                {OPT_KEYS.map((key, i) => (
                  <div
                    key={key}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                      qForm.correct === i
                        ? 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setQForm((f) => ({ ...f, correct: i }))}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs font-bold transition-colors ${
                        qForm.correct === i
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-400'
                      }`}
                      title={t('markOptionCorrect', { option: OPT_LABELS[i] })}
                    >
                      {OPT_LABELS[i]}
                    </button>
                    <Input
                      value={qForm[key]}
                      onChange={(e) => setQForm((f) => ({ ...f, [key]: e.target.value }))}
                      placeholder={t('optionPlaceholder', { option: OPT_LABELS[i] })}
                      className="h-8 text-sm border-0 shadow-none focus-visible:ring-0 bg-transparent p-0"
                    />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => { setView('main'); setQForm(emptyQForm); setEditQId(null); }}>
                  {t('cancel')}
                </Button>
                <Button
                  className={buttonVariants.primary}
                  onClick={() => editQId ? updateQMut.mutate() : createQMut.mutate()}
                  disabled={(editQId ? updateQMut.isPending : createQMut.isPending) || !qFormValid}
                >
                  {(editQId ? updateQMut.isPending : createQMut.isPending)
                    ? t('saving')
                    : editQId ? t('saveChanges') : t('addQuestion')}
                </Button>
              </DialogFooter>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Component ─────────────────────────────────────────────────

interface SubjectDetailPageProps {
  /** '/admin/subjects' or '/teacher/subjects' */
  basePath: string;
}

export default function SubjectDetailPage({ basePath }: SubjectDetailPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: subjectId } = useParams<{ id: string }>();
  const gradeId = location.state?.gradeId as string | undefined;
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const monthNames = [
    t('monthShortJan'),
    t('monthShortFeb'),
    t('monthShortMar'),
    t('monthShortApr'),
    t('monthShortMay'),
    t('monthShortJun'),
    t('monthShortJul'),
    t('monthShortAug'),
    t('monthShortSep'),
    t('monthShortOct'),
    t('monthShortNov'),
    t('monthShortDec'),
  ];

  // Unit dialog state
  const [unitFormOpen, setUnitFormOpen] = useState(false);
  const [editUnitId, setEditUnitId] = useState<string | null>(null);
  const [unitForm, setUnitForm] = useState(emptyUnitForm);
  const [deleteUnitId, setDeleteUnitId] = useState<string | null>(null);

  // Lesson dialog state — replaced by page navigation
  const [deleteLessonId, setDeleteLessonId] = useState<string | null>(null);

  // Quiz dialog state
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [quizTarget, setQuizTarget] = useState<{ id: string; title: string; type: 'unit' | 'lesson' } | null>(null);

  // Availability dialog state
  const [availabilityDialogOpen, setAvailabilityDialogOpen] = useState(false);
  const [availabilityUnit, setAvailabilityUnit] = useState<Unit | null>(null);
  const [availabilityForm, setAvailabilityForm] = useState<UnitAvailabilityInput>({
    status: 'available',
    availableMonth: '',
    availableYear: '',
    note: '',
  });

  // Data
  const { data: subject, isLoading: subjectLoading } = useQuery<Subject>({
    queryKey: ['subject', subjectId],
    queryFn: () => getSubjectById(subjectId!),
    enabled: !!subjectId,
  });

  const { data: units = [], isLoading: unitsLoading } = useQuery<Unit[]>({
    queryKey: ['units', subjectId],
    queryFn: () => getUnitsBySubject(subjectId!),
    enabled: !!subjectId,
  });

  const invalidateUnits = () => queryClient.invalidateQueries({ queryKey: ['units', subjectId] });
  const invalidateLessons = (unitId: string) => queryClient.invalidateQueries({ queryKey: ['unit-lessons', unitId] });

  // Availability
  const { data: availabilityList = [] } = useQuery<UnitAvailability[]>({
    queryKey: ['unit-availability'],
    queryFn: getUnitAvailability,
  });
  const setAvailabilityMutation = useMutation({
    mutationFn: ({ unitId, data }: { unitId: string; data: typeof availabilityForm }) => setUnitAvailability(unitId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unit-availability'] });
      setAvailabilityDialogOpen(false);
    },
  });

  // Unit mutations
  const createUnitMutation = useMutation({
    mutationFn: (data: UnitForm) => createUnit(subjectId!, data, gradeId),
    onSuccess: () => { invalidateUnits(); setUnitFormOpen(false); setUnitForm(emptyUnitForm); },
  });

  const updateUnitMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UnitForm }) => updateUnit(id, data),
    onSuccess: () => { invalidateUnits(); setUnitFormOpen(false); setEditUnitId(null); setUnitForm(emptyUnitForm); },
  });

  const deleteUnitMutation = useMutation({
    mutationFn: (id: string) => deleteUnit(id),
    onSuccess: () => { invalidateUnits(); setDeleteUnitId(null); },
  });

  // Lesson mutations — delete only (create/update live on AdminLessonForm page)
  const deleteLessonMutation = useMutation({
    mutationFn: (id: string) => deleteLesson(id),
    onSuccess: () => {
      units.forEach((unit) => invalidateLessons(unit._id));
      setDeleteLessonId(null);
    },
  });

  // Handlers
  const openAddUnit = () => { setEditUnitId(null); setUnitForm(emptyUnitForm); setUnitFormOpen(true); };
  const openEditUnit = (unit: Unit) => { setEditUnitId(unit._id); setUnitForm({ title: unit.title, description: unit.description || '' }); setUnitFormOpen(true); };

  const openAddLesson = (unitId: string) => navigate(`${basePath}/${subjectId}/units/${unitId}/lessons/new`);
  const openEditLesson = (lesson: Lesson, unitId: string) => navigate(`${basePath}/${subjectId}/units/${unitId}/lessons/${lesson._id}/edit`);

  const openUnitQuiz = (unitId: string, unitTitle: string) => { setQuizTarget({ id: unitId, title: unitTitle, type: 'unit' }); setQuizDialogOpen(true); };
  const openLessonQuiz = (lessonId: string, lessonTitle: string) => { setQuizTarget({ id: lessonId, title: lessonTitle, type: 'lesson' }); setQuizDialogOpen(true); };

  const openManageAvailability = (unit: Unit) => {
    const existing = availabilityList.find((item) => item.unitId === unit._id);
    const status: UnitAvailabilityInput['status'] =
      existing?.status === 'locked' || existing?.status === 'upcoming' ? existing.status : 'available';
    setAvailabilityUnit(unit);
    setAvailabilityForm({
      status,
      availableMonth: existing?.availableMonth ? String(existing.availableMonth) : '',
      availableYear: existing?.availableYear ? String(existing.availableYear) : '',
      note: existing?.note || '',
    });
    setAvailabilityDialogOpen(true);
  };

  const handleUnitSubmit = () => {
    if (!unitForm.title.trim()) return;
    if (editUnitId) {
      updateUnitMutation.mutate({ id: editUnitId, data: unitForm });
    } else {
      if (!gradeId) {
        alert(t('errorGradeRequired') || 'Please navigate to this subject from a specific grade to create units.');
        return;
      }
      createUnitMutation.mutate(unitForm);
    }
  };

  if (subjectLoading) {
    return (
      <div className={`${spacing.pageContainer} py-12 text-center text-slate-500`}>
        Loading subject...
      </div>
    );
  }

  if (!subject) {
    return (
      <div className={`${spacing.pageContainer} py-12 text-center`}>
        <p className="text-slate-500 mb-4">{t('subjectNotFound')}</p>
        <Button variant="outline" onClick={() => navigate(basePath)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Subjects
        </Button>
      </div>
    );
  }

  const unitsPending = createUnitMutation.isPending || updateUnitMutation.isPending;

  return (
    <div className={spacing.pageContainer}>
      {/* Back + header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(basePath)} className="flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Subjects
          </Button>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{subject.icon}</span>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{getLocalizedName(subject, i18n.language)}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">{subject.description}</p>
            </div>
          </div>
        </div>
        <Button onClick={openAddUnit} className={buttonVariants.primary}>
          <Plus className="w-4 h-4 mr-2" />
          {t('addUnit')}
        </Button>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-6 mb-6 px-1">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Layers className="w-4 h-4" />
          <span><strong className="text-slate-700 dark:text-slate-300">{units.length}</strong> Unit{units.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <BookOpen className="w-4 h-4" />
          <span>{t('lessonsInsideUnit')}</span>
        </div>
      </div>

      {/* Units accordion */}
      {unitsLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : units.length === 0 ? (
        <Card className={cardVariants.default}>
          <CardContent className="py-16 text-center">
            <EmptyState
              description={t('noUnitsYet')}
              action={(
                <Button onClick={openAddUnit} className={buttonVariants.primary}>
                  <Plus className="w-4 h-4 mr-2" /> {t('addUnit')}
                </Button>
              )}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {units.map((unit) => (
            <LessonsAccordionItem
              key={unit._id}
              unit={unit}
              subjectId={subjectId!}
              onEditLesson={openEditLesson}
              onDeleteLesson={setDeleteLessonId}
              onAddLesson={openAddLesson}
              onEditUnit={openEditUnit}
              onDeleteUnit={setDeleteUnitId}
              onAddUnitQuiz={openUnitQuiz}
              onAddLessonQuiz={openLessonQuiz}
              onManageAvailability={openManageAvailability}
              navigate={navigate}
            />
          ))}
        </div>
      )}

      {/* Unit Form Dialog */}
      <Dialog open={unitFormOpen} onOpenChange={(open) => { if (!open) { setUnitFormOpen(false); setEditUnitId(null); setUnitForm(emptyUnitForm); } }}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>{editUnitId ? t('editUnit') : t('addNewUnit')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs text-slate-500 mb-1 block">{t('unitTitleLabel')}</Label>
              <Input
                value={unitForm.title}
                onChange={(e) => setUnitForm((f) => ({ ...f, title: e.target.value }))}
                placeholder={t('unitTitlePlaceholder')}
              />
            </div>
            <div>
              <Label className="text-xs text-slate-500 mb-1 block">{t('descriptionOptional')}</Label>
              <Textarea
                value={unitForm.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setUnitForm((f) => ({ ...f, description: e.target.value }))}
                placeholder={t('unitDescriptionPlaceholder')}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setUnitFormOpen(false); setEditUnitId(null); setUnitForm(emptyUnitForm); }}>
              {t('cancel')}
            </Button>
            <Button className={buttonVariants.primary} onClick={handleUnitSubmit} disabled={unitsPending || !unitForm.title.trim()}>
              {unitsPending ? t('saving') : editUnitId ? t('saveChanges') : t('addUnit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Unit Confirm */}
      <ConfirmDialog
        open={!!deleteUnitId}
        title={t('deleteUnit')}
        description={t('deleteUnitConfirm')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        onConfirm={async () => { if (deleteUnitId) await deleteUnitMutation.mutateAsync(deleteUnitId); }}
        onCancel={() => setDeleteUnitId(null)}
      />

      {/* Delete Lesson Confirm */}
      <ConfirmDialog
        open={!!deleteLessonId}
        title={t('deleteLesson')}
        description={t('deleteLessonConfirm')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        onConfirm={async () => { if (deleteLessonId) await deleteLessonMutation.mutateAsync(deleteLessonId); }}
        onCancel={() => setDeleteLessonId(null)}
      />

      {/* Quiz Dialog */}
      {quizTarget && (
        <QuizDialog
          open={quizDialogOpen}
          onClose={() => { setQuizDialogOpen(false); setQuizTarget(null); }}
          attachedTo={quizTarget.type}
          attachedToId={quizTarget.id}
          attachedTitle={quizTarget.title}
        />
      )}

      {/* Unit Availability Dialog */}
      <Dialog open={availabilityDialogOpen} onOpenChange={(o) => { if (!o) setAvailabilityDialogOpen(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-purple-600" />
              {t('unitAvailabilityTitle', { title: availabilityUnit?.title ?? '' })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs text-slate-500 mb-2 block">{t('status')}</Label>
              <div className="flex gap-2 flex-wrap">
                {(['available', 'locked', 'upcoming'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setAvailabilityForm((p) => ({ ...p, status: s }))}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all capitalize ${
                      availabilityForm.status === s
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {t(s)}
                  </button>
                ))}
              </div>
            </div>

            {availabilityForm.status === 'upcoming' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-slate-500 mb-1 block">{t('availableFromMonth')}</Label>
                  <select
                    value={availabilityForm.availableMonth}
                    onChange={(e) => setAvailabilityForm((p) => ({ ...p, availableMonth: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm px-3 py-2"
                  >
                    <option value="">{t('selectMonth')}</option>
                    {monthNames.map((m, i) => (
                      <option key={i + 1} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 mb-1 block">{t('year')}</Label>
                  <Input
                    type="number"
                    placeholder={new Date().getFullYear().toString()}
                    value={availabilityForm.availableYear}
                    onChange={(e) => setAvailabilityForm((p) => ({ ...p, availableYear: e.target.value }))}
                  />
                </div>
              </div>
            )}

            <div>
              <Label className="text-xs text-slate-500 mb-1 block">{t('noteOptional')}</Label>
              <Input
                placeholder={t('availabilityNotePlaceholder')}
                value={availabilityForm.note}
                onChange={(e) => setAvailabilityForm((p) => ({ ...p, note: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAvailabilityDialogOpen(false)}>{t('cancel')}</Button>
            <Button
              className={buttonVariants.primary}
              disabled={setAvailabilityMutation.isPending}
              onClick={() => {
                if (!availabilityUnit) return;
                setAvailabilityMutation.mutate({
                  unitId: availabilityUnit._id,
                  data: {
                    status: availabilityForm.status,
                    availableMonth: availabilityForm.availableMonth,
                    availableYear: availabilityForm.availableYear,
                    note: availabilityForm.note,
                  },
                });
              }}
            >
              {setAvailabilityMutation.isPending ? t('saving') : t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
