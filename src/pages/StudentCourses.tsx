import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  getEnrolledUnitIds,
  getUnitById,
  getSubjectById,
  getLessonsByUnit,
  getQuizByAttached,
  getSubjectsByStage,
} from '@/api/subjectApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  ChevronDown,
  PlayCircle,
  FileText,
  Clock,
  ClipboardList,
  Layers,
  User,
  Lock,
  ArrowRight,
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
        Quiz
      </button>
      <StudentQuizModal open={open} onClose={() => setOpen(false)} quizId={quiz._id} quizTitle={quiz.title || label} />
    </>
  );
}

// ── Enrolled unit card ───────────────────────────────────────────────
function EnrolledUnitCard({ unitId, navigate }: { unitId: string; navigate: ReturnType<typeof useNavigate> }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);

  const { data: unit } = useQuery({ queryKey: ['unit', unitId], queryFn: () => getUnitById(unitId) });
  const { data: lessons = [] } = useQuery({ queryKey: ['unit-lessons', unitId], queryFn: () => getLessonsByUnit(unitId) });

  if (!unit) return <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />;

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <div
        className="flex items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-slate-900/60 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors select-none"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{unit.order}</span>
          <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{unit.title}</p>
        </div>
        <div className="flex items-center gap-2 ml-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <span className="hidden sm:flex items-center gap-1 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
            <BookOpen className="w-3 h-3" />{lessons.length}
          </span>
          <QuizBadge attachedToId={unitId} label={`${unit.title} Quiz`} />
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}>
            <ChevronDown className="w-4 h-4 text-slate-500 cursor-pointer" />
          </motion.span>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="lessons" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: 'easeInOut' }} style={{ overflow: 'hidden' }}>
            <div className="bg-white dark:bg-slate-950">
              {lessons.length === 0 ? (
                <div className="px-6 py-5 text-center">
                  <p className="text-sm text-slate-400 dark:text-slate-500">{t('noLessonsInUnit')}</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {lessons.map((lesson: any, idx: number) => (
                    <div key={lesson._id} className="flex items-center gap-4 px-6 py-3 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                      <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-medium text-slate-500 flex-shrink-0">{idx + 1}</span>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {lesson.videoUrl ? <PlayCircle className="w-4 h-4 text-blue-500 flex-shrink-0" /> : <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                          onClick={() => navigate(`/lesson/${lesson._id}?subjectId=${unit.subjectId}&from=student`)}>
                          {lesson.title}
                        </span>
                      </div>
                      {lesson.duration && (
                        <span className="hidden sm:flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
                          <Clock className="w-3 h-3" />{lesson.duration}m
                        </span>
                      )}
                      <QuizBadge attachedToId={lesson._id} label={`${lesson.title} Quiz`} />
                      <Button size="sm" variant="ghost" className="h-7 px-2.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex-shrink-0"
                        onClick={() => navigate(`/lesson/${lesson._id}?subjectId=${unit.subjectId}&from=student`)}>
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
    </div>
  );
}

// ── Teacher section — groups enrolled units under one teacher ────────
function TeacherSection({
  teacherId,
  teacherName,
  unitIds,
  navigate,
}: {
  teacherId: string;
  teacherName: string;
  unitIds: string[];
  navigate: ReturnType<typeof useNavigate>;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useTranslation();

  // Generate initials avatar
  const initials = teacherName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');

  // Assign each teacher a stable color based on id
  const colors = ['bg-blue-600', 'bg-violet-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600'];
  const colorIdx = teacherId.charCodeAt(teacherId.length - 1) % colors.length;
  const avatarBg = colors[colorIdx];

  return (
    <Card className="border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Teacher header */}
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center gap-3 px-5 py-4 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className={`w-9 h-9 rounded-xl ${avatarBg} flex items-center justify-center flex-shrink-0`}>
          <span className="text-white text-sm font-bold">{initials}</span>
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{teacherName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{unitIds.length} {t(unitIds.length === 1 ? 'unitSingular' : 'unitPlural')} {t('enrolledBadge').toLowerCase()}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="hidden sm:flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 px-2 py-0.5 rounded-full font-medium">
            <User className="w-3 h-3" />Teacher
          </span>
          <motion.span animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </motion.span>
        </div>
      </button>

      {/* Units under this teacher */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div key="units" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: 'hidden' }}>
            <div className="p-4 space-y-3 bg-white dark:bg-slate-950">
              {unitIds.map((uid) => (
                <EnrolledUnitCard key={uid} unitId={uid} navigate={navigate} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ── Subject row for "available from teacher but not enrolled" ────────
function AvailableSubjectRow({ subject, navigate }: { subject: any; navigate: ReturnType<typeof useNavigate> }) {
  return (
    <button
      type="button"
      onClick={() => navigate(`/student/subjects/${subject._id}`)}
      className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors text-left group"
    >
      <span className="text-2xl flex-shrink-0">{subject.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{subject.name}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5"><Lock className="w-3 h-3" />Subscribe to access units</p>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
    </button>
  );
}

// ── Inner component that resolves a unit's teacher ───────────────────
function UnitTeacherResolver({
  unitId,
  onResolved,
}: {
  unitId: string;
  onResolved: (unitId: string, teacherId: string, teacherName: string) => void;
}) {
  const { data: unit } = useQuery({ queryKey: ['unit', unitId], queryFn: () => getUnitById(unitId) });
  const { data: subject } = useQuery({
    queryKey: ['subject', unit?.subjectId],
    queryFn: () => getSubjectById(unit!.subjectId),
    enabled: !!unit?.subjectId,
  });

  // Report upward when resolved
  if (unit && subject) {
    const tid = typeof subject.teacherId === 'object' ? subject.teacherId._id : subject.teacherId as string;
    const tname = typeof subject.teacherId === 'object' ? subject.teacherId.name : 'Unknown Teacher';
    onResolved(unitId, tid, tname);
  }

  return null; // purely data-fetching, no UI
}

// ── Main Page ──────────────────────────────────────────────────────
export default function StudentCourses() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: enrolledUnitIds = [], isLoading } = useQuery({
    queryKey: ['enrolled-units', user?._id],
    queryFn: () => getEnrolledUnitIds(user!._id),
    enabled: !!user?._id,
  });

  // Stage subjects for "other available subjects" section
  const { data: stageSubjects = [] } = useQuery({
    queryKey: ['subjects-by-stage', user?.stageId],
    queryFn: () => getSubjectsByStage(user!.stageId!),
    enabled: !!user?.stageId,
  });

  // Build teacher → unit mapping
  const [teacherMap, setTeacherMap] = useState<Record<string, { name: string; unitIds: string[] }>>({});

  const handleUnitResolved = useMemo(
    () => (unitId: string, teacherId: string, teacherName: string) => {
      setTeacherMap((prev) => {
        if (prev[teacherId]?.unitIds.includes(unitId)) return prev; // no-op
        const existing = prev[teacherId] || { name: teacherName, unitIds: [] };
        return {
          ...prev,
          [teacherId]: { name: teacherName, unitIds: [...existing.unitIds, unitId] },
        };
      });
    },
    []
  );

  const teacherEntries = Object.entries(teacherMap);

  return (
    <div className={spacing.pageContainer}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('myCourses')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('enrolledByTeacherDesc')}</p>
        </div>
      </div>

      {/* Hidden resolvers */}
      {enrolledUnitIds.map((uid: string) => (
        <UnitTeacherResolver key={uid} unitId={uid} onResolved={handleUnitResolved} />
      ))}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
        </div>
      ) : enrolledUnitIds.length === 0 ? (
        <Card className="border border-slate-200 dark:border-slate-800 border-dashed">
          <CardContent className="py-16 text-center">
            <Layers className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <p className="text-slate-500 mb-2">{t('notEnrolledYet')}</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mb-5">{t('browseSubjectsHint')}</p>
            <Button onClick={() => navigate('/student/learn')} className="bg-blue-600 hover:bg-blue-700 text-white">
              {t('browseSubjects')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {/* Grouped by teacher */}
          {teacherEntries.length > 0 ? (
            teacherEntries.map(([tid, { name, unitIds }]) => (
              <TeacherSection key={tid} teacherId={tid} teacherName={name} unitIds={unitIds} navigate={navigate} />
            ))
          ) : (
            // Still resolving — show skeleton
            <div className="space-y-3">
              {[1, 2].map((i) => <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
            </div>
          )}

          {/* Other available subjects in student's stage (not enrolled) */}
          {stageSubjects.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 mt-6">
                {t('otherSubjectsInStage')}
              </p>
              <div className="space-y-2">
                {stageSubjects
                  .filter(() => true)
                  .map((subject: any) => (
                    <AvailableSubjectRow key={subject._id} subject={subject} navigate={navigate} />
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
