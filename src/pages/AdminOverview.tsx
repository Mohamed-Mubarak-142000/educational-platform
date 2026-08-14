import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Line, Bar, Pie } from "react-chartjs-2";
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
} from "chart.js";
import {
  Users,
  GraduationCap,
  DollarSign,
  CreditCard,
  ClipboardList,
} from "lucide-react";
import {
  getTeachers,
  getStudents,
  getTeacherApplications,
} from "@/api/adminApi";
import { getAdminPaymentsAnalytics } from "@/api/paymentApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel } from "@/components/ui/Carousel";
import { useTranslation } from "react-i18next";
import { SkeletonBlock, SkeletonStatsGrid } from "@/components/shared";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
);

type Teacher = { _id: string };
type Student = { _id: string; createdAt?: string };
type TeacherApplicationRecord = {
  _id: string;
  status: "Pending" | "Under Evaluation" | "Accepted" | "Rejected";
};

const buildMonthLabels = (count: number, locale: string) => {
  const labels: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(date.toLocaleString(locale, { month: "short" }));
  }
  return labels;
};

export default function AdminOverview() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [revenueView, setRevenueView] = useState<"line" | "bar">("line");
  const [growthView, setGrowthView] = useState<"line" | "bar">("bar");
  const [paymentsView, setPaymentsView] = useState<"pie" | "bar">("pie");
  const [applicationsView, setApplicationsView] = useState<"pie" | "bar">(
    "pie",
  );
  const locale = i18n.language === "ar" ? "ar-EG" : "en-US";
  const isRtl = i18n.language === "ar";
  const { data: teachers = [], isLoading: teachersLoading } = useQuery<
    Teacher[]
  >({ queryKey: ["teachers"], queryFn: () => getTeachers() });
  const { data: students = [], isLoading: studentsLoading } = useQuery<
    Student[]
  >({ queryKey: ["students"], queryFn: () => getStudents() });
  const { data: analytics, isLoading: paymentsLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => getAdminPaymentsAnalytics(),
  });
  const { data: teacherApplications = [], isLoading: applicationsLoading } =
    useQuery<TeacherApplicationRecord[]>({
      queryKey: ["teacherApplications"],
      queryFn: getTeacherApplications,
    });

  const isLoading =
    teachersLoading ||
    studentsLoading ||
    paymentsLoading ||
    applicationsLoading;

  const totals = useMemo(
    () => ({
      teachers: teachers.length,
      students: students.length,
      revenue: analytics ? analytics.totalRevenueCents / 100 : 0,
      activeSubscriptions: analytics?.activeSubscriptions ?? 0,
      teacherApplications: teacherApplications.length,
    }),
    [teachers, students, analytics, teacherApplications],
  );

  const revenueChart = useMemo(() => {
    const labels = buildMonthLabels(6, locale);
    const monthlyTotals = labels.map(() => 0);
    (analytics?.recentPayments ?? [])
      .filter((p) => p.status === "success")
      .forEach((p) => {
        if (!p.createdAt) return;
        const date = new Date(p.createdAt);
        const monthIndex = (new Date().getMonth() - date.getMonth() + 12) % 12;
        const slot = 5 - monthIndex;
        if (slot >= 0 && slot < 6) {
          monthlyTotals[slot] += (p.amountCents || 0) / 100;
        }
      });

    return {
      labels,
      datasets: [
        {
          label: t("monthlyRevenue"),
          data: monthlyTotals,
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.15)",
          tension: 0.35,
          fill: true,
        },
      ],
    };
  }, [locale, analytics, t]);

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
          label: t("studentGrowth"),
          data: monthly,
          backgroundColor: "rgba(14, 116, 144, 0.5)",
          borderColor: "#0e7490",
          borderRadius: 8,
        },
      ],
    };
  }, [students, t, locale]);

  const paymentSplit = useMemo(() => {
    const success = analytics?.successCount ?? 0;
    const failed = analytics?.failedCount ?? 0;
    return {
      labels: [t("paymentStatusSuccess"), t("paymentStatusFailed")],
      datasets: [
        {
          data: [success, failed],
          backgroundColor: [
            "rgba(59, 130, 246, 0.7)",
            "rgba(239, 68, 68, 0.7)",
          ],
          borderWidth: 0,
        },
      ],
    };
  }, [analytics, t]);

  const applicationsByStatus = useMemo(() => {
    const pending = teacherApplications.filter(
      (a) => a.status === "Pending",
    ).length;
    const underEvaluation = teacherApplications.filter(
      (a) => a.status === "Under Evaluation",
    ).length;
    const accepted = teacherApplications.filter(
      (a) => a.status === "Accepted",
    ).length;
    const rejected = teacherApplications.filter(
      (a) => a.status === "Rejected",
    ).length;
    return {
      labels: [
        t("applicationStatusPending"),
        t("applicationStatusUnderEvaluation"),
        t("applicationStatusAccepted"),
        t("applicationStatusRejected"),
      ],
      datasets: [
        {
          data: [pending, underEvaluation, accepted, rejected],
          backgroundColor: [
            "rgba(245, 158, 11, 0.7)",
            "rgba(59, 130, 246, 0.7)",
            "rgba(16, 185, 129, 0.7)",
            "rgba(239, 68, 68, 0.7)",
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
      legend: { display: true, position: "bottom" as const },
    },
  };

  if (isLoading) {
    return (
      <div className="px-6 py-10">
        <SkeletonStatsGrid items={5} />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
          <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>{t("monthlyRevenue")}</CardTitle>
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
              <CardTitle>{t("studentGrowth")}</CardTitle>
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
              <CardTitle>{t("paymentsByMethod")}</CardTitle>
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
              <CardTitle>{t("teacherApplicationsByStatus")}</CardTitle>
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

  const statCardsConfig = [
    {
      key: "totalStudents",
      value: totals.students,
      Icon: Users,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      onClick: () => navigate("/admin/students"),
    },
    {
      key: "totalTeachers",
      value: totals.teachers,
      Icon: GraduationCap,
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      onClick: () => navigate("/admin/teachers"),
    },
    {
      key: "totalRevenue",
      value: `$${totals.revenue}`,
      Icon: DollarSign,
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
      onClick: () => navigate("/admin/payments"),
    },
    {
      key: "activeSubscriptions",
      value: totals.activeSubscriptions,
      Icon: CreditCard,
      iconBg: "bg-cyan-100 dark:bg-cyan-900/30",
      iconColor: "text-cyan-600 dark:text-cyan-400",
      onClick: () => navigate("/admin/payments"),
    },
    {
      key: "totalTeacherApplications",
      value: totals.teacherApplications,
      Icon: ClipboardList,
      iconBg: "bg-rose-100 dark:bg-rose-900/30",
      iconColor: "text-rose-600 dark:text-rose-400",
      onClick: () => navigate("/admin/teacher-requests"),
    },
  ];

  const statCards = statCardsConfig.map(({ key, value, Icon, iconBg, iconColor, onClick }) => (
    <Card
      key={key}
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-1 px-4 pt-4">
        <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {t(key)}
        </CardTitle>
        <div className={`p-1.5 ${iconBg} rounded-lg`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  ));

  return (
    <div className="px-6 pt-4 pb-10">
      <div className="rounded-[2rem] bg-white dark:bg-slate-900 p-6">
        <Carousel
          items={statCards}
          perView={{ base: 1, md: 2, lg: 4 }}
          isRtl={isRtl}
          autoplayMs={4000}
          showArrows={false}
        />
      </div>

      <div className="rounded-[2rem] bg-white dark:bg-slate-900 p-6 mt-8">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="border-0 shadow-none bg-white/80 dark:bg-slate-900/70">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{t("monthlyRevenue")}</CardTitle>
            <div className="inline-flex rounded-full border border-slate-200 dark:border-slate-800 overflow-hidden">
              <button
                type="button"
                onClick={() => setRevenueView("line")}
                className={`px-3 py-1 text-xs transition-colors ${revenueView === "line" ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}
              >
                {t("lineView")}
              </button>
              <button
                type="button"
                onClick={() => setRevenueView("bar")}
                className={`px-3 py-1 text-xs transition-colors ${revenueView === "bar" ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}
              >
                {t("barView")}
              </button>
            </div>
          </CardHeader>
          <CardContent className="h-72">
            {revenueView === "line" ? (
              <Line data={revenueChart} options={chartOptions} />
            ) : (
              <Bar data={revenueChart} options={chartOptions} />
            )}
          </CardContent>
        </Card>
        <Card className="border-0 shadow-none bg-white/80 dark:bg-slate-900/70">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{t("studentGrowth")}</CardTitle>
            <div className="inline-flex rounded-full border border-slate-200 dark:border-slate-800 overflow-hidden">
              <button
                type="button"
                onClick={() => setGrowthView("line")}
                className={`px-3 py-1 text-xs transition-colors ${growthView === "line" ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}
              >
                {t("lineView")}
              </button>
              <button
                type="button"
                onClick={() => setGrowthView("bar")}
                className={`px-3 py-1 text-xs transition-colors ${growthView === "bar" ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}
              >
                {t("barView")}
              </button>
            </div>
          </CardHeader>
          <CardContent className="h-72">
            {growthView === "line" ? (
              <Line data={studentGrowthChart} options={chartOptions} />
            ) : (
              <Bar data={studentGrowthChart} options={chartOptions} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
        <Card className="border-0 shadow-none bg-white/80 dark:bg-slate-900/70">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{t("paymentsByMethod")}</CardTitle>
            <div className="inline-flex rounded-full border border-slate-200 dark:border-slate-800 overflow-hidden">
              <button
                type="button"
                onClick={() => setPaymentsView("pie")}
                className={`px-3 py-1 text-xs transition-colors ${paymentsView === "pie" ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}
              >
                {t("pieView")}
              </button>
              <button
                type="button"
                onClick={() => setPaymentsView("bar")}
                className={`px-3 py-1 text-xs transition-colors ${paymentsView === "bar" ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}
              >
                {t("barView")}
              </button>
            </div>
          </CardHeader>
          <CardContent className="h-72">
            {paymentsView === "pie" ? (
              <Pie data={paymentSplit} options={chartOptions} />
            ) : (
              <Bar data={paymentSplit} options={chartOptions} />
            )}
          </CardContent>
        </Card>
        <Card className="border-0 shadow-none bg-white/80 dark:bg-slate-900/70">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{t("teacherApplicationsByStatus")}</CardTitle>
            <div className="inline-flex rounded-full border border-slate-200 dark:border-slate-800 overflow-hidden">
              <button
                type="button"
                onClick={() => setApplicationsView("pie")}
                className={`px-3 py-1 text-xs transition-colors ${applicationsView === "pie" ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}
              >
                {t("pieView")}
              </button>
              <button
                type="button"
                onClick={() => setApplicationsView("bar")}
                className={`px-3 py-1 text-xs transition-colors ${applicationsView === "bar" ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}
              >
                {t("barView")}
              </button>
            </div>
          </CardHeader>
          <CardContent className="h-72">
            {applicationsView === "pie" ? (
              <Pie data={applicationsByStatus} options={chartOptions} />
            ) : (
              <Bar data={applicationsByStatus} options={chartOptions} />
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
