import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
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
} from '@/api/subjectApi';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  ChevronDown,
  PlayCircle,
  FileText,
  Clock,
  BookOpen,
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

function QuizBadge({ attachedToId, label }: { attachedToId: string; label: string }) {
  const [open, setOpen] = useState(false);
  const { data: quiz } = useQuery({
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
        Start Quiz
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
  isBlocked,   // true if a previous unit is not enrolled (enforce order)
  navigate,
}: {
  unit: any;
  subjectId: string;
  enrolled: boolean;
  onSubscribe: () => void;
  subscribing: boolean;
  availabilityStatus?: string;
  isBlocked?: boolean;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const [open, setOpen] = useState(enrolled);

  const { data: lessons = [], isLoading } = useQuery({
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
                <CheckCircle2 className="w-3 h-3" /> Enrolled
              </span>
              <QuizBadge attachedToId={unit._id} label={`${unit.title} Quiz`} />
              <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}
                onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}>
                <ChevronDown className="w-4 h-4 text-slate-500 cursor-pointer" />
              </motion.span>
            </>
          ) : availabilityStatus === 'upcoming' ? (
            <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 px-2 py-1 rounded-full">
              <CalendarClock className="w-3 h-3" /> Coming Soon
            </span>
          ) : availabilityStatus === 'locked' || isBlocked ? (
            <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
              <Lock className="w-3 h-3" /> {isBlocked ? 'Complete previous unit first' : 'Locked'}
            </span>
          ) : (
            <>
              <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                <Lock className="w-3 h-3" /> Not enrolled
              </span>
              <Button
                size="sm"
                className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white ml-1 flex-shrink-0 gap-1"
                onClick={onSubscribe}
                disabled={subscribing}
              >
                <CreditCard className="w-3 h-3" />
                {subscribing ? '...' : 'Subscribe'}
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
                  <p className="text-sm text-slate-400 dark:text-slate-500">No lessons in this unit yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {lessons.map((lesson: any, idx: number) => (
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
                      <QuizBadge attachedToId={lesson._id} label={`${lesson.title} Quiz`} />
                      <Button size="sm" variant="ghost" className="h-7 px-2.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex-shrink-0"
                        onClick={() => navigate(`/lesson/${lesson._id}?subjectId=${subjectId}&from=student`)}
                      >
                        View
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
          <p className="text-xs text-slate-400 dark:text-slate-500">Subscribe to unlock lessons, videos, and quizzes for this unit.</p>
        </div>
      )}
    </div>
  );
}

// ── Live Sessions Section ──────────────────────────────────────────

function LiveSessionsSection({ subjectId, studentId }: { subjectId: string; studentId?: string }) {
  const queryClient = useQueryClient();

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['subject-schedules', subjectId],
    queryFn: () => getSchedulesBySubject(subjectId),
    enabled: !!subjectId,
  });

  const enrollMutation = useMutation({
    mutationFn: (scheduleId: string) => enrollInLiveLesson(studentId!, scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject-schedules', subjectId] });
      queryClient.invalidateQueries({ queryKey: ['student-schedule', studentId] });
    },
  });

  if (isLoading || schedules.length === 0) return null;

  const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function timeLabel(t: string) {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  const sorted = [...schedules].sort(
    (a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
  );

  return (
    <div className="mt-8">
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-slate-200 mb-4">
        <Video className="w-4 h-4 text-violet-600" />
        Live Sessions
        <span className="ml-1 text-xs font-normal text-slate-400 dark:text-slate-500">
          (Max 5 students per group)
        </span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((s: any) => {
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
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.day}</p>
                </div>
                {isEnrolled && (
                  <span className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700/50 px-2 py-0.5 rounded-full flex-shrink-0">
                    <UserCheck className="w-3 h-3" /> Enrolled
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
                    <span className="ml-1 text-emerald-600 dark:text-emerald-400">({spots} spot{spots !== 1 ? 's' : ''} left)</span>
                  )}
                </div>
                {!isEnrolled && (
                  <Button
                    size="sm"
                    disabled={isFull || enrollMutation.isPending || !studentId}
                    onClick={() => enrollMutation.mutate(s._id)}
                    title={isFull ? 'This group is full' : undefined}
                    className={`h-7 px-3 text-xs flex-shrink-0 ${
                      isFull
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-violet-600 hover:bg-violet-700 text-white'
                    }`}
                  >
                    {isFull ? 'Full' : enrollMutation.isPending ? '...' : 'Join Group'}
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
  const navigate = useNavigate();
  const { id: subjectId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: subject, isLoading: subjectLoading } = useQuery({
    queryKey: ['subject', subjectId],
    queryFn: () => getSubjectById(subjectId!),
    enabled: !!subjectId,
  });

  const { data: units = [], isLoading: unitsLoading } = useQuery({
    queryKey: ['units', subjectId],
    queryFn: () => getUnitsBySubject(subjectId!),
    enabled: !!subjectId,
  });

  const { data: enrolledUnitIds = [] } = useQuery({
    queryKey: ['enrolled-units', user?._id],
    queryFn: () => getEnrolledUnitIds(user!._id),
    enabled: !!user?._id,
  });

  const { data: availabilityList = [] } = useQuery({
    queryKey: ['unit-availability'],
    queryFn: getUnitAvailability,
  });

  const enrollMutation = useMutation({
    mutationFn: (unitId: string) => enrollInUnit(user!._id, unitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrolled-units', user?._id] });
    },
  });

  if (subjectLoading) {
    return (
      <div className={`${spacing.pageContainer} py-12 text-center text-slate-500`}>Loading subject...</div>
    );
  }

  if (!subject) {
    return (
      <div className={`${spacing.pageContainer} py-12 text-center`}>
        <p className="text-slate-500 mb-4">Subject not found.</p>
        <Button variant="outline" onClick={() => navigate('/student/learn')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Learn
        </Button>
      </div>
    );
  }

  const enrolledCount = units.filter((u: any) => (enrolledUnitIds as string[]).includes(u._id)).length;

  return (
    <div className={spacing.pageContainer}>
      {/* Back + header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/student/learn')} className="flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Learn
          </Button>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{subject.icon}</span>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{subject.name}</h1>
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
          <span><strong className="text-slate-700 dark:text-slate-300">{units.length}</strong> Unit{units.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          <span><strong>{enrolledCount}</strong> Enrolled</span>
        </div>
        {enrolledCount < units.length && (
          <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500">
            <Lock className="w-4 h-4" />
            <span><strong>{units.length - enrolledCount}</strong> Available to subscribe</span>
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
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <p className="text-slate-500">No units in this subject yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {units.map((unit: any, idx: number) => {
            const avail = availabilityList.find((a: any) => a.unitId === unit._id);
            const availStatus = avail?.status;
            // Enforce order: all previous units must be enrolled before this one is accessible
            const prevEnrolled = units.slice(0, idx).every((u: any) => (enrolledUnitIds as string[]).includes(u._id));
            const isBlocked = idx > 0 && !prevEnrolled && !(enrolledUnitIds as string[]).includes(unit._id);
            return (
              <UnitRow
                key={unit._id}
                unit={unit}
                subjectId={subjectId!}
                enrolled={(enrolledUnitIds as string[]).includes(unit._id)}
                onSubscribe={() => enrollMutation.mutate(unit._id)}
                subscribing={enrollMutation.isPending}
                availabilityStatus={availStatus}
                isBlocked={isBlocked}
                navigate={navigate}
              />
            );
          })}
        </div>
      )}

      {/* ── Live Sessions ── */}
      <LiveSessionsSection subjectId={subjectId!} studentId={user?._id} />
    </div>
  );
}

