import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import {
  getUnitsBySubject,
  getEnrolledUnitIds,
  getStages,
  getSubjectsByStage,
  type Unit,
  type Subject,
  type Stage,
} from "@/api/subjectApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StudentLiveSessions } from "@/components/StudentLiveSessions";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import {
  User,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  TrendingUp,
  Layers,
  ArrowRight,
  Phone,
  Mail,
  Award,
} from "lucide-react";
import { spacing } from "@/lib/constants";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/shared";
import { getLocalizedName } from "@/lib/localeUtils";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
);

// ── Color palette for subjects ────────────────────────────────────
const PALETTE: Record<
  string,
  { bg: string; text: string; border: string; hex: string; hexLight: string }
> = {
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-700/40",
    hex: "#10b981",
    hexLight: "#d1fae5",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-700/40",
    hex: "#3b82f6",
    hexLight: "#dbeafe",
  },
  violet: {
    bg: "bg-violet-50 dark:bg-violet-900/20",
    text: "text-violet-700 dark:text-violet-300",
    border: "border-violet-200 dark:border-violet-700/40",
    hex: "#8b5cf6",
    hexLight: "#ede9fe",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-700/40",
    hex: "#f59e0b",
    hexLight: "#fef3c7",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-900/20",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-700/40",
    hex: "#f43f5e",
    hexLight: "#ffe4e6",
  },
};
function palette(c: string) {
  return PALETTE[c] ?? PALETTE.blue;
}

function SubjectCardSkeleton() {
  return (
    <div className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse">
      <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-56 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-2 w-full rounded bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

// ── Subject progress card with mini doughnut ─────────────────────

function SubjectCard({
  subject,
  enrolledUnitIds,
  navigate,
}: {
  subject: Subject;
  enrolledUnitIds: string[];
  navigate: ReturnType<typeof useNavigate>;
}) {
  const { i18n, t } = useTranslation();
  const { data: units, isLoading } = useQuery<Unit[]>({
    queryKey: ["units", subject._id],
    queryFn: () => getUnitsBySubject(subject._id),
  });

  const resolvedUnits = units ?? [];
  const showSkeleton = isLoading || units === undefined;

  const total = resolvedUnits.length;
  const enrolled = resolvedUnits.filter((unit: Unit) =>
    enrolledUnitIds.includes(unit._id),
  ).length;
  const pct = total > 0 ? Math.round((enrolled / total) * 100) : 0;
  const pal = palette(subject.color ?? "blue");

  const donutData = {
    datasets: [
      {
        data: [enrolled, Math.max(0, total - enrolled)],
        backgroundColor: [pal.hex, "#e2e8f0"],
        borderWidth: 0,
        cutout: "72%",
      },
    ],
  };

  return (
    <motion.button
      whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.18 }}
      onClick={() => navigate(`/student/subjects/${subject._id}`)}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-colors ${pal.bg} ${pal.border}`}
    >
      {/* Mini doughnut */}
      <div className="relative w-14 h-14 flex-shrink-0">
        {showSkeleton ? (
          <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
        ) : (
          <>
            <Doughnut
              data={donutData}
              options={{
                plugins: {
                  tooltip: { enabled: false },
                  legend: { display: false },
                },
                animation: false,
                responsive: true,
                maintainAspectRatio: true,
              }}
            />
            <span
              className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${pal.text}`}
            >
              {pct}%
            </span>
          </>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-lg">{subject.icon}</span>
          <span className={`font-semibold text-sm truncate ${pal.text}`}>
            {getLocalizedName(subject, i18n.language)}
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
          {subject.description}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: pal.hex }}
            />
          </div>
          {showSkeleton ? (
            <span className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
          ) : (
            <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
              {enrolled}/{total} {t("unitPlural")}
            </span>
          )}
        </div>
      </div>

      <ArrowRight className={`w-4 h-4 flex-shrink-0 opacity-50 ${pal.text}`} />
    </motion.button>
  );
}

export default function StudentOverview() {
  const navigate = useNavigate();
  const { user, updateProfileMutation, refreshProfile } = useAuth();
  const { t, i18n } = useTranslation();

  // ── Profile form (name, phone, stage) ──────────────────────────
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [stageId, setStageId] = useState(user?.stageId || "");
  const [saved, setSaved] = useState(false);

  const { data: stages, isLoading: stagesLoading } = useQuery<Stage[]>({
    queryKey: ["stages"],
    queryFn: getStages,
  });

  const { data: subjects, isLoading: subjectsLoading } = useQuery<Subject[]>({
    queryKey: ["stage-subjects", stageId],
    queryFn: () => getSubjectsByStage(stageId),
    enabled: !!stageId,
  });

  const { data: enrolledUnitIds, isLoading: enrolledUnitsLoading } = useQuery<
    string[]
  >({
    queryKey: ["enrolled-units", user?._id],
    queryFn: () => getEnrolledUnitIds(user!._id),
    enabled: !!user?._id,
  });

  const resolvedStages = stages ?? [];
  const resolvedSubjects = subjects ?? [];
  const resolvedEnrolledUnitIds = enrolledUnitIds ?? [];
  const showSubjectsSkeleton =
    !!stageId && (subjectsLoading || subjects === undefined);
  const showHeaderSkeleton =
    stagesLoading || subjectsLoading || enrolledUnitsLoading;

  const handleSave = () => {
    updateProfileMutation.mutate(
      { name: name.trim(), phone: phone.trim(), stageId: stageId || undefined },
      {
        onSuccess: () => {
          refreshProfile();
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        },
      },
    );
  };

  const isDirty =
    name !== (user?.name || "") ||
    phone !== (user?.phone || "") ||
    stageId !== (user?.stageId || "");

  const selectedStage = resolvedStages.find((stage) => stage._id === stageId);

  // ── Stats for bar chart ─────────────────────────────────────────
  const barData = {
    labels: resolvedSubjects.map((subject: Subject) =>
      getLocalizedName(subject, i18n.language),
    ),
    datasets: [
      {
        label: t("enrolledUnitsLabel"),
        data: resolvedSubjects.map(() => 0), // placeholder; SubjectCards compute this individually
        backgroundColor: resolvedSubjects.map(
          (subject: Subject) => palette(subject.color ?? "blue").hex,
        ),
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#94a3b8", font: { size: 11 } },
      },
      y: {
        grid: { color: "#f1f5f9" },
        ticks: { color: "#94a3b8", font: { size: 11 }, stepSize: 1 },
      },
    },
  };

  return (
    <div className={spacing.pageContainer}>
      <div className="space-y-8">
        {/* ── Header banner ── */}
        <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-violet-800 dark:from-violet-700 dark:to-violet-900 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <span className="text-3xl">🎓</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white truncate">
              {t("welcomeBack")},{" "}
              {user?.name?.split(" ")[0] || t("studentLabel")}
            </h1>
            <p className="text-violet-100 text-sm mt-0.5">
              {selectedStage
                ? `${getLocalizedName(selectedStage, i18n.language)} · ${resolvedSubjects.length} ${t("subjectsCount")}`
                : t("noStageAssigned")}
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <div className="text-center bg-white/15 rounded-xl px-4 py-2">
              <p className="text-2xl font-bold text-white">
                {resolvedEnrolledUnitIds.length}
              </p>
              <p className="text-violet-100 text-xs mt-0.5">
                {t("enrolledUnitsCount")}
              </p>
            </div>
            <div className="text-center bg-white/15 rounded-xl px-4 py-2">
              <p className="text-2xl font-bold text-white">
                {resolvedSubjects.length}
              </p>
              <p className="text-violet-100 text-xs mt-0.5">
                {t("subjectsCount")}
              </p>
            </div>
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left: Profile form ── */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-violet-600" />
                  <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {t("studentProfile")}
                  </h2>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-slate-500 mb-1 block">
                      {t("fullNameLabel")}
                    </Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("fullNameLabel")}
                      className="h-9 text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-slate-500 mb-1 block">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {t("phoneLabel")}
                      </span>
                    </Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t("phonePlaceholder")}
                      className="h-9 text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-slate-500 mb-1 block">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {t("emailLabel")}
                      </span>
                    </Label>
                    <Input
                      value={user?.email || ""}
                      disabled
                      className="h-9 text-sm opacity-60 cursor-not-allowed"
                    />
                  </div>

                  {/* Educational stage — editable */}
                  <div>
                    <Label className="text-xs text-slate-500 mb-1 block">
                      <span className="flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        {t("educationalStageLabel")}
                      </span>
                    </Label>
                    <select
                      value={stageId}
                      onChange={(e) => setStageId(e.target.value)}
                      className="h-9 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-sm"
                    >
                      <option value="">{t("selectStagePlaceholder")}</option>
                      {stages?.map((stage) => (
                        <option key={stage._id} value={stage._id}>
                          {getLocalizedName(stage, i18n.language)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <Button
                    onClick={handleSave}
                    disabled={!isDirty || updateProfileMutation.isPending}
                    className="bg-violet-600 hover:bg-violet-700 text-white h-8 px-4 text-xs"
                  >
                    {updateProfileMutation.isPending
                      ? t("savingLabel")
                      : t("saveChanges")}
                  </Button>
                  {saved && (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {t("savedLabel")}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick stats */}
            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-violet-600" />
                  <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {t("progressOverview")}
                  </h2>
                </div>
                <div className="space-y-2.5">
                  {showHeaderSkeleton ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" />
                          {t("enrolledUnitsLabel")}
                        </span>
                        <span className="h-4 w-10 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" />
                          {t("subjectsInStage")}
                        </span>
                        <span className="h-4 w-10 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5" />
                          {t("stageLabel")}
                        </span>
                        <span className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" />
                          {t("enrolledUnitsLabel")}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {resolvedEnrolledUnitIds.length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" />
                          {t("subjectsInStage")}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {resolvedSubjects.length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5" />
                          {t("stageLabel")}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {selectedStage
                            ? getLocalizedName(selectedStage, i18n.language)
                            : t("notAvailableShort")}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Right: Subjects visualization ── */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-violet-600" />
                <h2 className="font-bold text-slate-900 dark:text-slate-100">
                  {t("mySubjects")}
                  {selectedStage && (
                    <span className="ms-2 text-sm font-normal text-slate-400">
                      — {getLocalizedName(selectedStage, i18n.language)}
                    </span>
                  )}
                </h2>
              </div>
              {resolvedSubjects.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/student/learn")}
                  className="text-violet-600 hover:text-violet-700 text-xs h-8"
                >
                  {t("browseAll")} <ArrowRight className="w-3.5 h-3.5 ms-1" />
                </Button>
              )}
            </div>

            {!stageId ? (
              <Card className="border border-slate-200 dark:border-slate-800 border-dashed">
                <CardContent className="py-14">
                  <EmptyState
                    icon={<BookOpen className="w-8 h-8" />}
                    title={t("noStageAssigned")}
                    description={t("contactAdminForStage")}
                  />
                </CardContent>
              </Card>
            ) : showSubjectsSkeleton ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <SubjectCardSkeleton key={i} />
                ))}
              </div>
            ) : resolvedSubjects.length === 0 ? (
              <Card className="border border-slate-200 dark:border-slate-800 border-dashed">
                <CardContent className="py-8">
                  <EmptyState
                    icon={<BookOpen className="w-8 h-8" />}
                    description={t("noSubjectsForStage")}
                  />
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Subject enrollment bar chart */}
                <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
                  <CardContent className="p-5">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                      {t("unitsPerSubject")}
                    </p>
                    <div className="h-32">
                      <Bar data={barData} options={barOptions} />
                    </div>
                  </CardContent>
                </Card>

                {/* Subject cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {resolvedSubjects.map((subject: Subject) => (
                    <SubjectCard
                      key={subject._id}
                      subject={subject}
                      enrolledUnitIds={resolvedEnrolledUnitIds}
                      navigate={navigate}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Live Sessions ── */}
        <div className="col-span-full">
          <StudentLiveSessions />
        </div>
      </div>
    </div>
  );
}
