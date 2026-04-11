import { useMemo, useState } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { getMyCourses } from '@/api/courseApi';
import { getExams } from '@/api/examApi';
import { getMyStudents } from '@/api/teacherApi';
import { getSubjects, getUnitsBySubject, type Subject, type Unit } from '@/api/subjectApi';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { SkeletonBlock, SkeletonStatsGrid } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

const CHART_PALETTE = [
  'rgba(59, 130, 246, 0.7)',
  'rgba(99, 102, 241, 0.7)',
  'rgba(16, 185, 129, 0.7)',
  'rgba(245, 158, 11, 0.7)',
  'rgba(239, 68, 68, 0.7)',
  'rgba(139, 92, 246, 0.7)',
];

type TeacherStudent = { _id: string; createdAt?: string };
type MyCourse = { _id: string; createdAt?: string; subjectId?: string | { _id?: string; name?: string } };
type MyExam = { _id: string };

const buildMonthLabels = (count: number) => {
  const labels: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(date.toLocaleString('en-US', { month: 'short' }));
  }
  return labels;
};

function ViewToggle({
  value,
  onChange,
  opts,
}: {
  value: string;
  onChange: (v: string) => void;
  opts: { key: string; label: string }[];
}) {
  return (
    <div className="inline-flex rounded-full border border-slate-200 dark:border-slate-800 overflow-hidden">
      {opts.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          className={`px-3 py-1 text-xs transition-colors ${
            value === opt.key
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function StatCard({
  title,
  value,
  onClick,
}: {
  title: string;
  value: number | string;
  onClick: () => void;
}) {
  return (
    <Card
      className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent><p className="text-3xl font-bold">{value}</p></CardContent>
    </Card>
  );
}

export default function TeacherOverview() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [coursesView, setCoursesView] = useState<'line' | 'bar'>('line');
  const [studentsView, setStudentsView] = useState<'line' | 'bar'>('bar');
  const [unitsView, setUnitsView] = useState<'pie' | 'bar'>('pie');

  const assignedSubjectIds: string[] = useMemo(() => user?.subjectIds ?? [], [user]);
  const assignedStageCount = user?.stageIds?.length ?? 0;

  const { data: courses = [], isLoading: coursesLoading } = useQuery<MyCourse[]>({
    queryKey: ['my-courses'],
    queryFn: () => getMyCourses(),
  });
  const { data: exams = [], isLoading: examsLoading } = useQuery<MyExam[]>({
    queryKey: ['exams'],
    queryFn: getExams,
  });
  const { data: students = [], isLoading: studentsLoading } = useQuery<TeacherStudent[]>({
    queryKey: ['my-students'],
    queryFn: getMyStudents,
  });
  const { data: allSubjects = [], isLoading: subjectsLoading } = useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: getSubjects,
  });

  // Fetch units for every assigned subject in parallel (teacher-scoped)
  const unitQueryResults = useQueries({
    queries: assignedSubjectIds.map((subjectId) => ({
      queryKey: ['units', subjectId],
      queryFn: () => getUnitsBySubject(subjectId),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const isLoading = coursesLoading || examsLoading || studentsLoading || subjectsLoading;
  const unitsLoading = unitQueryResults.some((q) => q.isLoading);

  const assignedSubjects = useMemo(
    () => allSubjects.filter((s) => assignedSubjectIds.includes(s._id)),
    [allSubjects, assignedSubjectIds],
  );

  const unitsBySubject = useMemo(
    () =>
      assignedSubjectIds.map((subjectId, i) => {
        const units: Unit[] = (unitQueryResults[i]?.data as Unit[]) ?? [];
        const subject = assignedSubjects.find((s) => s._id === subjectId);
        return {
          subjectId,
          label: [subject?.icon, subject?.name ?? subjectId].filter(Boolean).join(' '),
          count: units.length,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [assignedSubjectIds, assignedSubjects, unitQueryResults.map((q) => q.dataUpdatedAt).join(',')],
  );

  const totalUnits = useMemo(() => unitsBySubject.reduce((s, x) => s + x.count, 0), [unitsBySubject]);

  const totals = useMemo(
    () => ({
      courses: courses.length,
      students: students.length,
      exams: exams.length,
      units: totalUnits,
      stages: assignedStageCount,
      subjects: assignedSubjectIds.length,
    }),
    [courses, students, exams, totalUnits, assignedStageCount, assignedSubjectIds],
  );

  // ── Chart data ──────────────────────────────────────────────────

  const courseGrowthChart = useMemo(() => {
    const labels = buildMonthLabels(6);
    const monthly = labels.map(() => 0);
    courses.forEach((course) => {
      if (!course.createdAt) return;
      const date = new Date(course.createdAt);
      const monthIndex = (new Date().getMonth() - date.getMonth() + 12) % 12;
      const slot = 5 - monthIndex;
      if (slot >= 0 && slot < 6) monthly[slot] += 1;
    });
    return {
      labels,
      datasets: [{
        label: t('teacherCourses'),
        data: monthly,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.15)',
        tension: 0.35,
        fill: true,
        borderRadius: 8,
      }],
    };
  }, [courses, t]);

  const studentGrowthChart = useMemo(() => {
    const labels = buildMonthLabels(6);
    const monthly = labels.map(() => 0);
    students.forEach((student) => {
      if (!student.createdAt) return;
      const date = new Date(student.createdAt);
      const monthIndex = (new Date().getMonth() - date.getMonth() + 12) % 12;
      const slot = 5 - monthIndex;
      if (slot >= 0 && slot < 6) monthly[slot] += 1;
    });
    return {
      labels,
      datasets: [{
        label: t('teacherStudents'),
        data: monthly,
        backgroundColor: 'rgba(14, 116, 144, 0.5)',
        borderColor: '#0e7490',
        borderRadius: 8,
      }],
    };
  }, [students, t]);

  const unitsPerSubjectChart = useMemo(() => {
    if (unitsBySubject.length === 0) {
      return {
        labels: [t('noData')],
        datasets: [{ data: [0], backgroundColor: [CHART_PALETTE[0]], borderWidth: 0 }],
      };
    }
    return {
      labels: unitsBySubject.map((s) => s.label),
      datasets: [{
        label: t('totalUnits'),
        data: unitsBySubject.map((s) => s.count),
        backgroundColor: CHART_PALETTE.slice(0, unitsBySubject.length),
        borderWidth: 0,
        borderRadius: 6,
      }],
    };
  }, [unitsBySubject, t]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'bottom' as const } },
  };

  const lineBarOpts = [
    { key: 'line', label: t('lineView') },
    { key: 'bar', label: t('barView') },
  ];
  const pieBarOpts = [
    { key: 'pie', label: t('pieView') },
    { key: 'bar', label: t('barView') },
  ];

  if (isLoading) {
    return (
      <div className="px-6 py-10">
        <SkeletonStatsGrid items={6} />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
          {[t('teacherCourses'), t('studentGrowth')].map((title) => (
            <Card key={title} className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70">
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>{title}</CardTitle>
                <SkeletonBlock className="h-6 w-24" />
              </CardHeader>
              <CardContent className="h-72"><SkeletonBlock className="h-full w-full" /></CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
          <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 xl:col-span-2">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>{t('unitsPerSubject')}</CardTitle>
              <SkeletonBlock className="h-6 w-24" />
            </CardHeader>
            <CardContent className="h-72"><SkeletonBlock className="h-full w-full" /></CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-10">
      {/* ── 6 stat cards — mirrors Admin layout ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <StatCard title={t('teacherCourses')}   value={totals.courses}   onClick={() => navigate('/teacher/subjects')} />
        <StatCard title={t('teacherStudents')}   value={totals.students}  onClick={() => navigate('/teacher/students')} />
        <StatCard title={t('teacherExams')}      value={totals.exams}     onClick={() => navigate('/teacher/exams')} />
        <StatCard title={t('totalUnits')}        value={unitsLoading ? '…' : totals.units} onClick={() => navigate('/teacher/subjects')} />
        <StatCard title={t('assignedStages')}    value={totals.stages}    onClick={() => navigate('/teacher/subjects')} />
        <StatCard title={t('assignedSubjects')}  value={totals.subjects}  onClick={() => navigate('/teacher/subjects')} />
      </div>

      {/* ── Row 1: two time-series charts ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
        <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{t('teacherCourses')}</CardTitle>
            <ViewToggle value={coursesView} onChange={(v) => setCoursesView(v as 'line' | 'bar')} opts={lineBarOpts} />
          </CardHeader>
          <CardContent className="h-72">
            {coursesView === 'line'
              ? <Line data={courseGrowthChart} options={chartOptions} />
              : <Bar data={courseGrowthChart} options={chartOptions} />}
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{t('studentGrowth')}</CardTitle>
            <ViewToggle value={studentsView} onChange={(v) => setStudentsView(v as 'line' | 'bar')} opts={lineBarOpts} />
          </CardHeader>
          <CardContent className="h-72">
            {studentsView === 'line'
              ? <Line data={studentGrowthChart} options={chartOptions} />
              : <Bar data={studentGrowthChart} options={chartOptions} />}
          </CardContent>
        </Card>
      </div>

      {/* ── Row 2: units per subject (wide) — mirrors Admin payments chart ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
        <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 xl:col-span-2">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{t('unitsPerSubject')}</CardTitle>
            <ViewToggle value={unitsView} onChange={(v) => setUnitsView(v as 'pie' | 'bar')} opts={pieBarOpts} />
          </CardHeader>
          <CardContent className="h-72">
            {unitsView === 'pie'
              ? <Pie data={unitsPerSubjectChart} options={chartOptions} />
              : <Bar data={unitsPerSubjectChart} options={chartOptions} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
