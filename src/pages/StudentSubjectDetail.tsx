import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getLocalizedName } from '@/lib/localeUtils';
import {
  getSubjectById,
  getUnitsBySubject,
  getLessonsByUnit,
  getQuizByAttached,
  getEnrolledUnitIds,
  enrollInUnit,
  getUnitAvailability,
  getSchedulesBySubject,
  enrollInLiveLesson,
  type Subject,
  type Unit,
  type Lesson,
  type Quiz,
  type UnitAvailability,
  type TeacherSchedule,
} from '@/api/subjectApi';
import { submitPayment, uploadPaymentProof } from '@/api/adminApi';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/ToastProvider';
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
  CalendarClock,
  CreditCard,
  Video,
  Users,
  UserCheck,
} from 'lucide-react';
import { spacing } from '@/lib/constants';
import StudentQuizModal from '@/components/StudentQuizModal';

// ── Quiz badge ──────────────────────────────────────────────────────

const DAY_ORDER = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
type DayName = (typeof DAY_ORDER)[number];

type LiveSchedule = TeacherSchedule & { day: DayName };

function isDayName(day: string): day is DayName {
  return DAY_ORDER.includes(day as DayName);
}

function QuizBadge({ attachedToId, label }: { attachedToId: string; label: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { data: quiz } = useQuery<Quiz | null>({
    queryKey: ['unit-quiz', attachedToId],
    queryFn: () => getQuizByAttached(attachedToId),
  });
  if (!quiz) return null;
  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex-shrink-0"
      >
        <ClipboardList className="w-3 h-3" />
        {t('submitQuiz')}
      </button>
      <StudentQuizModal open={open} onClose={() => setOpen(false)} quizId={quiz._id} quizTitle={quiz.title || label} />
    </>
  );
}

// ── Unit accordion (enrolled → open content | not enrolled → locked) ──

function UnitRow({
  unit,
  subjectId,
  enrolled,
  onSubscribe,
  subscribing,
  availabilityStatus,
  isBlocked,
  navigate,
}: {
  unit: Unit;
  subjectId: string;
  enrolled: boolean;
  onSubscribe: (unit: Unit) => void;
  subscribing: boolean;
  availabilityStatus?: string;
  isBlocked?: boolean;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(enrolled);

  const { data: lessons = [], isLoading } = useQuery<Lesson[]>({
    queryKey: ['unit-lessons', unit._id],
    queryFn: () => getLessonsByUnit(unit._id),
    enabled: enrolled,
  });

  return (
    <div className={`border rounded-xl overflow-hidden shadow-sm transition-colors ${
      enrolled
        ? 'border-slate-200 dark:border-slate-800'
        : 'border-slate-200/70 dark:border-slate-800/60 opacity-90'
    }`}>
      {/* Header */}
      <div
        className={`flex items-center justify-between px-5 py-4 transition-colors select-none ${
          enrolled
            ? 'bg-slate-50 dark:bg-slate-900/60 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60'
            : 'bg-slate-50/60 dark:bg-slate-900/40 cursor-default'
        }`}
        onClick={() => enrolled && setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className={`w-8 h-8 rounded-lg text-white text-sm font-bold flex items-center justify-center flex-shrink-0 ${enrolled ? 'bg-blue-600' : 'bg-slate-400 dark:bg-slate-600'}`}>
            {unit.order}
          </span>
          <div className="min-w-0">
            <p className={`font-semibold truncate ${enrolled ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>
              {unit.title}
            </p>
            {unit.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{unit.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {enrolled ? (
            <>
              <span className="hidden sm:flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 px-2 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> {t('enrolledBadge')}
              </span>
              <QuizBadge attachedToId={unit._id} label={t('quizTitleSuffix', { title: unit.title })} />
              <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}
                onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}>
                <ChevronDown className="w-4 h-4 text-slate-500 cursor-pointer" />
              </motion.span>
            </>
          ) : availabilityStatus === 'upcoming' ? (
            <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 px-2 py-1 rounded-full">
              <CalendarClock className="w-3 h-3" /> {t('comingSoon')}
            </span>
          ) : availabilityStatus === 'locked' || isBlocked ? (
            <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
              <Lock className="w-3 h-3" /> {isBlocked ? t('completePreviousFirst') : t('lockedUnit')}
            </span>
          ) : (
            <>
              <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                <Lock className="w-3 h-3" /> {t('notEnrolledLabel')}
              </span>
              <Button
                size="sm"
                className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white ml-1 flex-shrink-0 gap-1"
                onClick={() => onSubscribe(unit)}
                disabled={subscribing}
              >
                <CreditCard className="w-3 h-3" />
                  {subscribing ? t('loadingEllipsis') : t('subscribeCta')}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Lessons (only visible when enrolled & open) */}
      <AnimatePresence initial={false}>
        {enrolled && open && (
          <motion.div key="lessons" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: 'easeInOut' }} style={{ overflow: 'hidden' }}>
            <div className="bg-white dark:bg-slate-950">
              {isLoading ? (
                <div className="px-6 py-4 space-y-2">
                  {[1, 2].map((i) => <div key={i} className="h-11 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />)}
                </div>
              ) : lessons.length === 0 ? (
                <div className="px-6 py-6 text-center">
                  <EmptyState description={t('noLessonsInUnit')} className="py-6" />
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {lessons.map((lesson, idx) => (
                    <div key={lesson._id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                      <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-medium text-slate-500 flex-shrink-0">{idx + 1}</span>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {lesson.videoUrl ? <PlayCircle className="w-4 h-4 text-blue-500 flex-shrink-0" /> : <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                        <span
                          className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          onClick={() => navigate(`/lesson/${lesson._id}?subjectId=${subjectId}&from=student`)}
                        >
                          {lesson.title}
                        </span>
                      </div>
                      {lesson.duration && (
                        <span className="hidden sm:flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 flex-shrink-0">
                          <Clock className="w-3 h-3" />{lesson.duration}m
                        </span>
                      )}
                      <QuizBadge attachedToId={lesson._id} label={t('quizTitleSuffix', { title: lesson.title })} />
                      <Button size="sm" variant="ghost" className="h-7 px-2.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex-shrink-0"
                        onClick={() => navigate(`/lesson/${lesson._id}?subjectId=${subjectId}&from=student`)}
                      >
                        {t('view')}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Locked preview */}
      {!enrolled && (
        <div className="bg-gradient-to-b from-slate-50 dark:from-slate-900/40 to-white dark:to-slate-950 px-6 py-5 text-center border-t border-slate-100 dark:border-slate-800/40">
          <Lock className="w-7 h-7 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
          <p className="text-xs text-slate-400 dark:text-slate-500">{t('subscribeToUnlock')}</p>
        </div>
      )}
    </div>
  );
}

// ── Live Sessions Section ──────────────────────────────────────────

function LiveSessionsSection({ subjectId, studentId }: { subjectId: string; studentId?: string }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: schedules = [], isLoading } = useQuery<TeacherSchedule[]>({
    queryKey: ['subject-schedules', subjectId],
    queryFn: () => getSchedulesBySubject(subjectId),
    enabled: !!subjectId,
  });

  const normalized: LiveSchedule[] = schedules.filter(
    (item): item is LiveSchedule => isDayName(item.day)
  );

  const enrollMutation = useMutation({
    mutationFn: (scheduleId: string) => enrollInLiveLesson(studentId!, scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject-schedules', subjectId] });
      queryClient.invalidateQueries({ queryKey: ['student-schedule', studentId] });
    },
  });

  if (isLoading) return null;
  if (normalized.length === 0) {
    return <EmptyState description={t('noSchedule')} className="py-6" />;
  }

  function timeLabel(t: string) {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  const sorted = [...normalized].sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
  );

  return (
    <div className="mt-8">
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-slate-200 mb-4">
        <Video className="w-4 h-4 text-violet-600" />
        {t('liveSessions')}
        <span className="ml-1 text-xs font-normal text-slate-400 dark:text-slate-500">
          {t('maxStudentsPerGroup')}
        </span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((s) => {
          const isFull = (s.enrolledStudents?.length ?? 0) >= s.maxStudents;
          const isEnrolled = studentId ? s.enrolledStudents?.includes(studentId) : false;
          const spots = s.maxStudents - (s.enrolledStudents?.length ?? 0);

          return (
            <motion.div
              key={s._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-xl p-4 shadow-sm transition-colors ${
                isEnrolled
                  ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/40'
                  : isFull
                  ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-70'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 transition-colors'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    {s.teacherName ?? 'Unknown Teacher'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t(`dayName_${s.day}`)}</p>
                </div>
                {isEnrolled && (
                  <span className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700/50 px-2 py-0.5 rounded-full flex-shrink-0">
                    <UserCheck className="w-3 h-3" /> {t('enrolledBadge')}
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
                    <span className="ml-1 text-emerald-600 dark:text-emerald-400">({t('spotsLeft', { count: spots })})</span>
                  )}
                </div>
                {!isEnrolled && (
                  <Button
                    size="sm"
                    disabled={isFull || enrollMutation.isPending || !studentId}
                    onClick={() => enrollMutation.mutate(s._id)}
                    title={isFull ? t('groupFullTitle') : undefined}
                    className={`h-7 px-3 text-xs flex-shrink-0 ${
                      isFull
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-violet-600 hover:bg-violet-700 text-white'
                    }`}
                  >
                    {isFull ? t('groupFull') : enrollMutation.isPending ? t('loadingEllipsis') : t('joinGroup')}
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
  const { id: subjectId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { pushToast } = useToast();

  const unitPaymentMethods = [
    { value: 'Vodafone Cash', label: t('vodafoneCash') },
    { value: 'InstaPay', label: t('instaPay') },
  ];

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('Vodafone Cash');
  const [paymentFile, setPaymentFile] = useState<File | null>(null);

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

  const { data: enrolledUnitIds = [] } = useQuery<string[]>({
    queryKey: ['enrolled-units', user?._id],
    queryFn: () => getEnrolledUnitIds(user!._id),
    enabled: !!user?._id,
  });

  const { data: availabilityList = [] } = useQuery<UnitAvailability[]>({
    queryKey: ['unit-availability'],
    queryFn: getUnitAvailability,
  });

  const enrollMutation = useMutation({
    mutationFn: (unitId: string) => enrollInUnit(user!._id, unitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrolled-units', user?._id] });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: uploadPaymentProof,
    onError: () => pushToast({ type: 'error', title: t('toastUploadFailed') }),
  });

  const submitPaymentMutation = useMutation({
    mutationFn: submitPayment,
    onError: () => pushToast({ type: 'error', title: t('toastActionFailed') }),
  });

  const openPaymentDialog = (unit: Unit) => {
    setSelectedUnit(unit);
    setPaymentMethod('Vodafone Cash');
    setPaymentFile(null);
    setPaymentOpen(true);
  };

  const submitUnitPayment = async () => {
    if (!selectedUnit) return;
    if (!paymentFile) {
      pushToast({ type: 'error', title: t('toastUploadRequired') });
      return;
    }

    const upload = await uploadMutation.mutateAsync(paymentFile);
    await submitPaymentMutation.mutateAsync({
      plan: `Unit: ${selectedUnit.title}`,
      amount: selectedUnit.price ?? selectedUnit.amount ?? 0,
      method: paymentMethod,
      screenshotUrl: upload.url,
    });

    await enrollMutation.mutateAsync(selectedUnit._id);
    pushToast({ type: 'success', title: t('toastPaymentSubmitted') });
    setPaymentOpen(false);
    setPaymentFile(null);
  };

  if (subjectLoading) {
    return (
      <div className={`${spacing.pageContainer} py-12 text-center text-slate-500`}>{t('loadingSubject')}</div>
    );
  }

  if (!subject) {
    return (
      <div className={`${spacing.pageContainer} py-12 text-center`}>
        <p className="text-slate-500 mb-4">{t('subjectNotFound')}</p>
        <Button variant="outline" onClick={() => navigate('/student/learn')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> {t('backToLearn')}
        </Button>
      </div>
    );
  }

  const enrolledCount = units.filter((unit) => enrolledUnitIds.includes(unit._id)).length;

  return (
    <div className={spacing.pageContainer}>
      {/* Back + header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/student/learn')} className="flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> {t('back')}
          </Button>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{subject.icon}</span>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{getLocalizedName(subject, i18n.language)}</h1>
              {subject.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400">{subject.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 mb-6 px-1">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Layers className="w-4 h-4" />
          <span><strong className="text-slate-700 dark:text-slate-300">{units.length}</strong> {t(units.length === 1 ? 'unitSingular' : 'unitPlural')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          <span><strong>{enrolledCount}</strong> {t('enrolledBadge')}</span>
        </div>
        {enrolledCount < units.length && (
          <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500">
            <Lock className="w-4 h-4" />
            <span><strong>{units.length - enrolledCount}</strong> {t('availableToSubscribe')}</span>
          </div>
        )}
      </div>

      {/* Units */}
      {unitsLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
        </div>
      ) : units.length === 0 ? (
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="py-16 text-center">
            <EmptyState description={t('noUnitsYet')} />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {units.map((unit, idx) => {
            const avail = availabilityList.find((item) => item.unitId === unit._id);
            const availStatus = avail?.status;
            // Enforce order: all previous units must be enrolled before this one is accessible
            const prevEnrolled = units.slice(0, idx).every((prior) => enrolledUnitIds.includes(prior._id));
            const isBlocked = idx > 0 && !prevEnrolled && !enrolledUnitIds.includes(unit._id);
            return (
              <UnitRow
                key={unit._id}
                unit={unit}
                subjectId={subjectId!}
                enrolled={enrolledUnitIds.includes(unit._id)}
                onSubscribe={openPaymentDialog}
                subscribing={enrollMutation.isPending}
                availabilityStatus={availStatus}
                isBlocked={isBlocked}
                navigate={navigate}
              />
            );
          })}
        </div>
      )}

      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('submitPayment')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/60">
              <p className="text-sm text-slate-500">{t('plan')}</p>
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {selectedUnit ? `Unit: ${selectedUnit.title}` : '-'}
              </p>
              <p className="text-sm text-slate-500 mt-3">{t('amount')}</p>
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {selectedUnit?.price ?? selectedUnit?.amount ?? 0}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('paymentMethod')}</p>
              <div className="flex flex-wrap gap-2">
                {unitPaymentMethods.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setPaymentMethod(item.value)}
                    className={`rounded-full px-4 py-2 text-sm border ${paymentMethod === item.value ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/80 dark:bg-slate-900/60">
              <p className="text-sm text-slate-500">{t('sendPaymentTo')}</p>
              <p className="text-lg font-semibold">01050867135</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('uploadProof')}</p>
              <input type="file" accept="image/*" onChange={(e) => setPaymentFile(e.target.files?.[0] || null)} />
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setPaymentOpen(false)}>
                {t('cancel')}
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={submitUnitPayment}
                disabled={uploadMutation.isPending || submitPaymentMutation.isPending || enrollMutation.isPending}
              >
                {submitPaymentMutation.isPending ? t('loadingEllipsis') : t('submitPayment')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Live Sessions ── */}
      <LiveSessionsSection subjectId={subjectId!} studentId={user?._id} />
    </div>
  );
}

