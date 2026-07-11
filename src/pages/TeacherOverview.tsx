import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { getTeacherDashboard } from "@/api/teacherAssignmentApi";
import {
  getMyUnitStudents,
  type StudentSubscriptionEntry,
} from "@/api/teacherApi";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { SkeletonBlock, SkeletonStatsGrid } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LiveSessionManager } from "@/components/LiveSessionManager";
import TeacherLiveLessonRequests from "@/components/TeacherLiveLessonRequests";
import {
  User,
  Phone,
  GraduationCap,
  Pencil,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  Layers,
  FileText,
  ClipboardList,
  School,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
);

// ── helpers ──────────────────────────────────────────────────────────────────

const buildMonthLabels = (count: number, locale: string) => {
  const labels: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(
      date.toLocaleString(locale, { month: "short", year: "2-digit" }),
    );
  }
  return labels;
};

/** Map backend MonthStat[] into a 6-slot array aligned with the last 6 calendar months */
const mapToMonthSlots = (
  data: { year: number; month: number; count: number }[],
  slotCount = 6,
): number[] => {
  const slots = Array(slotCount).fill(0);
  const now = new Date();
  data.forEach(({ year, month, count }) => {
    const monthsAgo =
      (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month);
    const slot = slotCount - 1 - monthsAgo;
    if (slot >= 0 && slot < slotCount) slots[slot] = count;
  });
  return slots;
};

// ── sub-components ────────────────────────────────────────────────────────────

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
              ? "bg-violet-600 text-white"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function StatCard({
  icon: Icon,
  title,
  value,
  color,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  value: number | string;
  color: string;
  onClick: () => void;
}) {
  return (
    <Card
      className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-4 pt-6">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function SubscriptionBadge({ status }: { status?: string }) {
  if (status === "active")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300">
        <CheckCircle2 className="w-3 h-3" /> Active
      </span>
    );
  if (status === "expired")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
        <XCircle className="w-3 h-3" /> Expired
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
      <Clock className="w-3 h-3" /> —
    </span>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function TeacherOverview() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "ar" ? "ar-EG" : "en-US";
  const navigate = useNavigate();
  const { user } = useAuth();

  const [studentsView, setStudentsView] = useState<"line" | "bar">("bar");
  const [contentView, setContentView] = useState<"line" | "bar">("bar");
  const [studentsTab, setStudentsTab] = useState<"list" | "subscriptions">(
    "list",
  );

  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ["teacher-dashboard"],
    queryFn: getTeacherDashboard,
  });

  const { data: unitStudentsData, isLoading: unitStudentsLoading } = useQuery({
    queryKey: ["my-unit-students"],
    queryFn: getMyUnitStudents,
  });

  const isLoading = dashboardLoading;
  const unitStudents: StudentSubscriptionEntry[] =
    unitStudentsData?.students ?? [];
  const totalUnitStudents = unitStudentsData?.totalStudents ?? 0;

  // ── chart data ──────────────────────────────────────────────────────────────

  const monthLabels = useMemo(() => buildMonthLabels(6, locale), [locale]);

  const studentGrowthChart = useMemo(
    () => ({
      labels: monthLabels,
      datasets: [
        {
          label: t("teacherStudents"),
          data: mapToMonthSlots(dashboard?.studentGrowth ?? []),
          backgroundColor: "rgba(14, 116, 144, 0.5)",
          borderColor: "#0e7490",
          borderRadius: 6,
        },
      ],
    }),
    [dashboard?.studentGrowth, monthLabels, t],
  );

  const contentActivityChart = useMemo(
    () => ({
      labels: monthLabels,
      datasets: [
        {
          label: t("totalLessons"),
          data: mapToMonthSlots(dashboard?.contentStats ?? []),
          backgroundColor: "rgba(99, 102, 241, 0.5)",
          borderColor: "#6366f1",
          tension: 0.35,
          fill: true,
          borderRadius: 6,
        },
      ],
    }),
    [dashboard?.contentStats, monthLabels, t],
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  };

  const lineBarOpts = [
    { key: "line", label: t("lineView") },
    { key: "bar", label: t("barView") },
  ];

  // ── loading skeleton ────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="px-6 py-10">
        <SkeletonStatsGrid items={6} />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
          {[t("studentGrowth"), t("contentActivity")].map((title) => (
            <Card
              key={title}
              className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70"
            >
              <CardHeader>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <SkeletonBlock className="h-full w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <div className="px-6 py-10 space-y-10">
      {/* ── Teacher Profile Card ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="flex-shrink-0">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <User className="w-8 h-8 text-violet-600 dark:text-violet-400" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {user?.name ?? t("name")}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {user?.email}
                </p>
                {user?.phone && (
                  <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mt-1">
                    <Phone className="w-3.5 h-3.5" />
                    {user.phone}
                  </p>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="flex-shrink-0"
                onClick={() => navigate("/teacher/profile/edit")}
              >
                <Pencil className="w-3.5 h-3.5 mr-1.5" />
                {t("editProfile")}
              </Button>
            </div>
            {user?.bio && (
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                {user.bio}
              </p>
            )}
            {user?.availableDays && user.availableDays.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {user.availableDays.map((day) => (
                  <span
                    key={day}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/30"
                  >
                    <Clock className="w-3 h-3" />
                    {day}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 6 Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <StatCard
          icon={GraduationCap}
          title={t("teacherStudents")}
          value={dashboard?.studentsCount ?? 0}
          color="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400"
          onClick={() => navigate("/teacher/students")}
        />
        <StatCard
          icon={BookOpen}
          title={t("assignedSubjects")}
          value={dashboard?.subjectsCount ?? 0}
          color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          onClick={() => navigate("/teacher/subjects")}
        />
        <StatCard
          icon={School}
          title={t("assignedStages")}
          value={dashboard?.stagesCount ?? 0}
          color="bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
          onClick={() => navigate("/teacher/subjects")}
        />
        <StatCard
          icon={Layers}
          title={t("totalUnits")}
          value={dashboard?.unitsCount ?? 0}
          color="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
          onClick={() => navigate("/teacher/subjects")}
        />
        <StatCard
          icon={FileText}
          title={t("totalLessons")}
          value={dashboard?.lessonsCount ?? 0}
          color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
          onClick={() => navigate("/teacher/subjects")}
        />
        <StatCard
          icon={ClipboardList}
          title={t("totalQuizzes")}
          value={dashboard?.quizzesCount ?? 0}
          color="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
          onClick={() => navigate("/teacher/exams")}
        />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{t("studentGrowth")}</CardTitle>
            <ViewToggle
              value={studentsView}
              onChange={(v) => setStudentsView(v as "line" | "bar")}
              opts={lineBarOpts}
            />
          </CardHeader>
          <CardContent className="h-72">
            {studentsView === "line" ? (
              <Line data={studentGrowthChart} options={chartOptions} />
            ) : (
              <Bar data={studentGrowthChart} options={chartOptions} />
            )}
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{t("contentActivity")}</CardTitle>
            <ViewToggle
              value={contentView}
              onChange={(v) => setContentView(v as "line" | "bar")}
              opts={lineBarOpts}
            />
          </CardHeader>
          <CardContent className="h-72">
            {contentView === "line" ? (
              <Line data={contentActivityChart} options={chartOptions} />
            ) : (
              <Bar data={contentActivityChart} options={chartOptions} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Students & Subscriptions ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 overflow-hidden">
            {(
              [
                { key: "list", label: t("myStudents"), icon: GraduationCap },
                {
                  key: "subscriptions",
                  label: t("subscriptions"),
                  icon: CreditCard,
                },
              ] as const
            ).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setStudentsTab(key)}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium transition-colors ${
                  studentsTab === key
                    ? "bg-violet-600 text-white"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {totalUnitStudents} {t("students")}
          </span>
        </div>

        {unitStudentsLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <SkeletonBlock key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : unitStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500 gap-3">
            <GraduationCap className="w-10 h-10" />
            <p className="text-sm">{t("noStudentsYet")}</p>
          </div>
        ) : studentsTab === "list" ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {unitStudents.map((entry) => (
              <div
                key={entry.student._id}
                className="flex items-center gap-4 px-6 py-4"
              >
                <div className="flex-shrink-0">
                  {entry.student.profileImage ? (
                    <img
                      src={entry.student.profileImage}
                      alt={entry.student.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300">
                      {entry.student.name?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                    {entry.student.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {entry.student.email}
                  </p>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-1">
                  <SubscriptionBadge status={entry.subscription?.status} />
                  <span className="text-xs text-slate-400">
                    {entry.enrolledUnits.length} {t("enrolledUnits")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3 text-left">{t("studentName")}</th>
                  <th className="px-4 py-3 text-left">{t("plan")}</th>
                  <th className="px-4 py-3 text-left">
                    {t("subscriptionStatus")}
                  </th>
                  <th className="px-4 py-3 text-left">{t("enrolledUnits")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {unitStudents.map((entry) => (
                  <tr
                    key={entry.student._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-3 font-medium text-slate-800 dark:text-slate-200">
                      {entry.student.name}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 capitalize">
                      {entry.subscription?.plan ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <SubscriptionBadge status={entry.subscription?.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {entry.enrolledUnits.length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pending Live Lesson Requests ── */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t("liveLessonRequests", { defaultValue: "Live Lesson Requests" })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TeacherLiveLessonRequests />
        </CardContent>
      </Card>

      {/* ── Live Sessions ── */}
      <div className="space-y-4">
        <LiveSessionManager />
      </div>
    </div>
  );
}
