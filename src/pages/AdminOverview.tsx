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
import { getTeachers, getStudents, getPayments } from '@/api/adminApi';
import { getCourses } from '@/api/courseApi';
import { getExams } from '@/api/examApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

const buildMonthLabels = (count: number) => {
  const labels: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(date.toLocaleString('en-US', { month: 'short' }));
  }
  return labels;
};

export default function AdminOverview() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [revenueView, setRevenueView] = useState<'line' | 'bar'>('line');
  const [growthView, setGrowthView] = useState<'line' | 'bar'>('bar');
  const [paymentsView, setPaymentsView] = useState<'pie' | 'bar'>('pie');
  const { data: teachers = [] } = useQuery({ queryKey: ['teachers'], queryFn: getTeachers });
  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: getStudents });
  const { data: courses = [] } = useQuery({ queryKey: ['courses'], queryFn: getCourses });
  const { data: exams = [] } = useQuery({ queryKey: ['exams'], queryFn: getExams });
  const { data: payments = [] } = useQuery({ queryKey: ['payments'], queryFn: () => getPayments() });

  const totals = useMemo(() => {
    const approved = payments.filter((p: any) => p.status === 'Approved');
    const revenue = approved.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    const activeSubscriptions = approved.length;
    return {
      teachers: teachers.length,
      students: students.length,
      courses: courses.length,
      exams: exams.length,
      revenue,
      activeSubscriptions,
    };
  }, [teachers, students, courses, exams, payments]);

  const revenueChart = useMemo(() => {
    const labels = buildMonthLabels(6);
    const monthlyTotals = labels.map(() => 0);
    payments
      .filter((p: any) => p.status === 'Approved')
      .forEach((payment: any) => {
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
    const labels = buildMonthLabels(6);
    const monthly = labels.map(() => 0);
    students.forEach((student: any) => {
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
    const vodafone = payments.filter((p: any) => p.method === 'Vodafone Cash').length;
    const instaPay = payments.filter((p: any) => p.method === 'InstaPay').length;
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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' as const },
    },
  };

  return (
    <div className="px-6 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card
          className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/admin/students')}
        >
          <CardHeader>
            <CardTitle>{t('totalStudents')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totals.students}</p>
          </CardContent>
        </Card>
        <Card
          className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/admin/teachers')}
        >
          <CardHeader>
            <CardTitle>{t('totalTeachers')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totals.teachers}</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/admin/courses')}
        >
          <CardHeader>
            <CardTitle>{t('totalCourses')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totals.courses}</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/admin/exams')}
        >
          <CardHeader>
            <CardTitle>{t('totalExams')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totals.exams}</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/admin/payments')}
        >
          <CardHeader>
            <CardTitle>{t('totalRevenue')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${totals.revenue}</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/admin/payments')}
        >
          <CardHeader>
            <CardTitle>{t('activeSubscriptions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totals.activeSubscriptions}</p>
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
        <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 xl:col-span-2">
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
      </div>
    </div>
  );
}
