import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import {
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  DollarSign,
  CreditCard,
  ClipboardList,
} from 'lucide-react';
import { getTeachers, getStudents, getPayments, getTeacherApplications } from '@/api/adminApi';
import { getCourses } from '@/api/courseApi';
import { getExams } from '@/api/examApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { SkeletonBlock, SkeletonStatsGrid } from '@/components/shared';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

type Teacher = { _id: string };
type Student = { _id: string; createdAt?: string };
type Course = { _id: string };
type Exam = { _id: string };
type Payment = {
  _id: string;
  status?: string;
  amount?: number;
  method?: string;
  createdAt?: string;
};
type TeacherApplicationRecord = {
  _id: string;
  status: 'Pending' | 'Under Evaluation' | 'Accepted' | 'Rejected';
};

const buildMonthLabels = (count: number, locale: string) => {
  const labels: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(date.toLocaleString(locale, { month: 'short' }));
  }
  return labels;
};

export default function AdminOverview() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [revenueView, setRevenueView] = useState<'line' | 'bar'>('line');
  const [growthView, setGrowthView] = useState<'line' | 'bar'>('bar');
  const [paymentsView, setPaymentsView] = useState<'pie' | 'bar'>('pie');
  const [applicationsView, setApplicationsView] = useState<'pie' | 'bar'>('pie');
  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US';
  const { data: teachers = [], isLoading: teachersLoading } = useQuery<Teacher[]>({ queryKey: ['teachers'], queryFn: getTeachers });
  const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({ queryKey: ['students'], queryFn: getStudents });
  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({ queryKey: ['courses'], queryFn: () => getCourses() });
  const { data: exams = [], isLoading: examsLoading } = useQuery<Exam[]>({ queryKey: ['exams'], queryFn: getExams });
  const { data: payments = [], isLoading: paymentsLoading } = useQuery<Payment[]>({ queryKey: ['payments'], queryFn: () => getPayments() });
  const { data: teacherApplications = [], isLoading: applicationsLoading } = useQuery<TeacherApplicationRecord[]>({ queryKey: ['teacherApplications'], queryFn: getTeacherApplications });

  const isLoading = teachersLoading || studentsLoading || coursesLoading || examsLoading || paymentsLoading || applicationsLoading;

  const totals = useMemo(() => {
    const approved = payments.filter((payment) => payment.status === 'Approved');
    const revenue = approved.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const activeSubscriptions = approved.length;
    return {
      teachers: teachers.length,
      students: students.length,
      courses: courses.length,
      exams: exams.length,
      revenue,
      activeSubscriptions,
      teacherApplications: teacherApplications.length,
    };
  }, [teachers, students, courses, exams, payments, teacherApplications]);

  const revenueChart = useMemo(() => {
    const labels = buildMonthLabels(6, locale);
    const monthlyTotals = labels.map(() => 0);
    payments
      .filter((payment) => payment.status === 'Approved')
      .forEach((payment) => {
        if (!payment.createdAt) return;
        const date = new Date(payment.createdAt);
        const monthIndex = (new Date().getMonth() - date.getMonth() + 12) % 12;
        const slot = 5 - monthIndex;
        if (slot >= 0 && slot < 6) {
          monthlyTotals[slot] += payment.amount || 0;
        }
      });

    return {
      labels,
      datasets: [
        {
          label: t('monthlyRevenue'),
          data: monthlyTotals,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.15)',
          tension: 0.35,
          fill: true,
        },
      ],
    };
  }, [payments, t]);

  const studentGrowthChart = useMemo(() => {
    const labels = buildMonthLabels(6, locale);
    const monthly = labels.map(() => 0);
    students.forEach((student) => {
      if (!student.createdAt) return;
      const date = new Date(student.createdAt);
      const monthIndex = (new Date().getMonth() - date.getMonth() + 12) % 12;
      const slot = 5 - monthIndex;
      if (slot >= 0 && slot < 6) {
        monthly[slot] += 1;
      }
    });

    return {
      labels,
      datasets: [
        {
          label: t('studentGrowth'),
          data: monthly,
          backgroundColor: 'rgba(14, 116, 144, 0.5)',
          borderColor: '#0e7490',
          borderRadius: 8,
        },
      ],
    };
  }, [students, t]);

  const paymentSplit = useMemo(() => {
    const vodafone = payments.filter((payment) => payment.method === 'Vodafone Cash').length;
    const instaPay = payments.filter((payment) => payment.method === 'InstaPay').length;
    return {
      labels: [t('vodafoneCash'), t('instaPay')],
      datasets: [
        {
          data: [vodafone, instaPay],
          backgroundColor: ['rgba(59, 130, 246, 0.7)', 'rgba(99, 102, 241, 0.7)'],
          borderWidth: 0,
        },
      ],
    };
  }, [payments, t]);

  const applicationsByStatus = useMemo(() => {
    const pending = teacherApplications.filter((a) => a.status === 'Pending').length;
    const underEvaluation = teacherApplications.filter((a) => a.status === 'Under Evaluation').length;
    const accepted = teacherApplications.filter((a) => a.status === 'Accepted').length;
    const rejected = teacherApplications.filter((a) => a.status === 'Rejected').length;
    return {
      labels: [
        t('applicationStatusPending'),
        t('applicationStatusUnderEvaluation'),
        t('applicationStatusAccepted'),
        t('applicationStatusRejected'),
      ],
      datasets: [
        {
          data: [pending, underEvaluation, accepted, rejected],
          backgroundColor: [
            'rgba(245, 158, 11, 0.7)',
            'rgba(59, 130, 246, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(239, 68, 68, 0.7)',
          ],
          borderWidth: 0,
        },
      ],
    };
  }, [teacherApplications, t]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' as const },
    },
  };

  if (isLoading) {
    return (
      <div className="px-6 py-10">
        <SkeletonStatsGrid items={7} />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
          <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>{t('monthlyRevenue')}</CardTitle>
              <div className="inline-flex rounded-full border border-slate-200 dark:border-slate-800 overflow-hidden">
                <SkeletonBlock className="h-6 w-24" />
              </div>
            </CardHeader>
            <CardContent className="h-72">
              <SkeletonBlock className="h-full w-full" />
            </CardContent>
          </Card>
          <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>{t('studentGrowth')}</CardTitle>
              <div className="inline-flex rounded-full border border-slate-200 dark:border-slate-800 overflow-hidden">
                <SkeletonBlock className="h-6 w-24" />
              </div>
            </CardHeader>
            <CardContent className="h-72">
              <SkeletonBlock className="h-full w-full" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
          <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>{t('paymentsByMethod')}</CardTitle>
              <div className="inline-flex rounded-full border border-slate-200 dark:border-slate-800 overflow-hidden">
                <SkeletonBlock className="h-6 w-24" />
              </div>
            </CardHeader>
            <CardContent className="h-72">
              <SkeletonBlock className="h-full w-full" />
            </CardContent>
          </Card>
          <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>{t('teacherApplicationsByStatus')}</CardTitle>
              <div className="inline-flex rounded-full border border-slate-200 dark:border-slate-800 overflow-hidden">
                <SkeletonBlock className="h-6 w-24" />
              </div>
            </CardHeader>
            <CardContent className="h-72">
              <SkeletonBlock className="h-full w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card
          className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/admin/students')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('totalStudents')}</CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totals.students}</p>
          </CardContent>
        </Card>
        <Card
          className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/admin/teachers')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('totalTeachers')}</CardTitle>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totals.teachers}</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/admin/courses')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('totalCourses')}</CardTitle>
            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
              <BookOpen className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totals.courses}</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/admin/exams')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('totalExams')}</CardTitle>
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totals.exams}</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/admin/payments')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('totalRevenue')}</CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${totals.revenue}</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/admin/payments')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('activeSubscriptions')}</CardTitle>
            <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
              <CreditCard className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totals.activeSubscriptions}</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/admin/teacher-requests')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('totalTeacherApplications')}</CardTitle>
            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
              <ClipboardList className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totals.teacherApplications}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
        <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{t('monthlyRevenue')}</CardTitle>
            <div className="inline-flex rounded-full border border-slate-200 dark:border-slate-800 overflow-hidden">
              <button
                type="button"
                onClick={() => setRevenueView('line')}
                className={`px-3 py-1 text-xs transition-colors ${revenueView === 'line' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
              >
                {t('lineView')}
              </button>
              <button
                type="button"
                onClick={() => setRevenueView('bar')}
                className={`px-3 py-1 text-xs transition-colors ${revenueView === 'bar' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
              >
                {t('barView')}
              </button>
            </div>
          </CardHeader>
          <CardContent className="h-72">
            {revenueView === 'line' ? <Line data={revenueChart} options={chartOptions} /> : <Bar data={revenueChart} options={chartOptions} />}
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{t('studentGrowth')}</CardTitle>
            <div className="inline-flex rounded-full border border-slate-200 dark:border-slate-800 overflow-hidden">
              <button
                type="button"
                onClick={() => setGrowthView('line')}
                className={`px-3 py-1 text-xs transition-colors ${growthView === 'line' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
              >
                {t('lineView')}
              </button>
              <button
                type="button"
                onClick={() => setGrowthView('bar')}
                className={`px-3 py-1 text-xs transition-colors ${growthView === 'bar' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
              >
                {t('barView')}
              </button>
            </div>
          </CardHeader>
          <CardContent className="h-72">
            {growthView === 'line' ? <Line data={studentGrowthChart} options={chartOptions} /> : <Bar data={studentGrowthChart} options={chartOptions} />}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
        <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{t('paymentsByMethod')}</CardTitle>
            <div className="inline-flex rounded-full border border-slate-200 dark:border-slate-800 overflow-hidden">
              <button
                type="button"
                onClick={() => setPaymentsView('pie')}
                className={`px-3 py-1 text-xs transition-colors ${paymentsView === 'pie' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
              >
                {t('pieView')}
              </button>
              <button
                type="button"
                onClick={() => setPaymentsView('bar')}
                className={`px-3 py-1 text-xs transition-colors ${paymentsView === 'bar' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
              >
                {t('barView')}
              </button>
            </div>
          </CardHeader>
          <CardContent className="h-72">
            {paymentsView === 'pie' ? <Pie data={paymentSplit} options={chartOptions} /> : <Bar data={paymentSplit} options={chartOptions} />}
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{t('teacherApplicationsByStatus')}</CardTitle>
            <div className="inline-flex rounded-full border border-slate-200 dark:border-slate-800 overflow-hidden">
              <button
                type="button"
                onClick={() => setApplicationsView('pie')}
                className={`px-3 py-1 text-xs transition-colors ${applicationsView === 'pie' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
              >
                {t('pieView')}
              </button>
              <button
                type="button"
                onClick={() => setApplicationsView('bar')}
                className={`px-3 py-1 text-xs transition-colors ${applicationsView === 'bar' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
              >
                {t('barView')}
              </button>
            </div>
          </CardHeader>
          <CardContent className="h-72">
            {applicationsView === 'pie' ? <Pie data={applicationsByStatus} options={chartOptions} /> : <Bar data={applicationsByStatus} options={chartOptions} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
