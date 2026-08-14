import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  getMyEarningsSummary,
  getMyEarnings,
  getMyPayouts,
  type TeacherEarning,
  type TeacherEarningStatus,
  type TeacherPayout,
} from "@/api/teacherEarningsApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PageHeader,
  DataTable,
  FilterDialog,
  SkeletonStatsGrid,
  SkeletonTable,
  EmptyState,
  ErrorState,
  type TableColumn,
} from "@/components/shared";
import { spacing, cardVariants } from "@/lib/constants";
import { getLocalizedName } from "@/lib/localeUtils";
import { Wallet, TrendingUp, CheckCircle2 } from "lucide-react";

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <Card className={`${cardVariants.default} border-0 shadow-none`}>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{title}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
          </div>
          <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: TeacherEarningStatus }) {
  const { t } = useTranslation();
  const cfg: Record<TeacherEarningStatus, string> = {
    available:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/40",
    paid_out:
      "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800/40",
    clawed_back:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/40",
  };
  const labelKey: Record<TeacherEarningStatus, string> = {
    available: "earningStatusAvailable",
    paid_out: "earningStatusPaidOut",
    clawed_back: "earningStatusClawedBack",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${cfg[status]}`}>
      {t(labelKey[status])}
    </span>
  );
}

function refName(ref: { name?: string } | string | undefined): string {
  if (!ref) return "—";
  if (typeof ref === "string") return ref;
  return ref.name ?? "—";
}

const EGP = (cents: number) => `${(cents / 100).toFixed(2)} EGP`;

export default function TeacherEarnings() {
  const { t, i18n } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<"all" | TeacherEarningStatus>("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["my-earnings-summary"],
    queryFn: getMyEarningsSummary,
  });

  const earningsParams = {
    status: statusFilter !== "all" ? statusFilter : undefined,
    sortBy,
    sortOrder,
  };

  const {
    data: earnings = [],
    isLoading: earningsLoading,
    isError: earningsError,
    refetch: refetchEarnings,
  } = useQuery({
    queryKey: ["my-earnings", JSON.stringify(earningsParams)],
    queryFn: () => getMyEarnings(earningsParams),
  });

  const {
    data: payouts = [],
    isLoading: payoutsLoading,
    isError: payoutsError,
    refetch: refetchPayouts,
  } = useQuery({
    queryKey: ["my-payouts"],
    queryFn: getMyPayouts,
  });

  const activeFilterCount = statusFilter !== "all" ? 1 : 0;
  const resetFilters = () => setStatusFilter("all");

  const earningsColumns: TableColumn<TeacherEarning>[] = [
    {
      key: "createdAt",
      label: t("date"),
      render: (v) =>
        v
          ? new Date(v as string).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "—",
    },
    {
      key: "studentId",
      label: t("student", { defaultValue: "Student" }),
      sortable: false,
      render: (v) => refName(v as TeacherEarning["studentId"]),
    },
    {
      key: "subjectId",
      label: t("subject"),
      sortable: false,
      render: (v, row) => {
        if (row.subscriptionType === "liveLesson") return t("subscriptionTypeLiveLesson");
        const subject = v as TeacherEarning["subjectId"];
        return subject && typeof subject === "object"
          ? getLocalizedName(subject as { name: string; nameAr?: string }, i18n.language)
          : "—";
      },
    },
    {
      key: "grossAmountCents",
      label: t("grossAmount"),
      render: (v) => EGP(v as number),
    },
    {
      key: "platformFeeCents",
      label: t("platformFee"),
      render: (v) => <span className="text-slate-400">-{EGP(v as number)}</span>,
    },
    {
      key: "netEarningCents",
      label: t("netEarning"),
      render: (v) => <span className="font-semibold">{EGP(v as number)}</span>,
    },
    {
      key: "status",
      label: t("status"),
      render: (v) => <StatusBadge status={v as TeacherEarningStatus} />,
    },
  ];

  const payoutColumns: TableColumn<TeacherPayout>[] = [
    {
      key: "createdAt",
      label: t("date"),
      render: (v) =>
        v
          ? new Date(v as string).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "—",
    },
    {
      key: "amountCents",
      label: t("amount"),
      render: (v) => <span className="font-semibold">{EGP(v as number)}</span>,
    },
    {
      key: "method",
      label: t("method", { defaultValue: "Method" }),
      render: (v) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {t(`payoutMethod${v}`, { defaultValue: String(v) })}
        </span>
      ),
    },
    {
      key: "reference",
      label: t("referenceNote"),
      render: (v) => <span className="text-slate-500 dark:text-slate-400">{(v as string) || "—"}</span>,
    },
  ];

  return (
    <div className={`${spacing.pageContainer} space-y-6`}>
      <PageHeader title={t("myEarnings")} subtitle={t("myEarningsSubtitle")} />

      {summaryLoading || !summary ? (
        <SkeletonStatsGrid items={3} />
      ) : (
        <div className="rounded-[2rem] bg-white dark:bg-slate-900 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            <StatCard title={t("totalEarned")} value={EGP(summary.totalNetCents)} icon={TrendingUp} color="bg-violet-600" />
            <StatCard title={t("availableBalance")} value={EGP(summary.availableCents)} icon={Wallet} color="bg-emerald-600" />
            <StatCard title={t("paidOutSoFar")} value={EGP(summary.paidOutCents)} icon={CheckCircle2} color="bg-slate-500" />
          </div>
        </div>
      )}

      <Card className={`${cardVariants.default} border-0 shadow-none rounded-[2rem]`}>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-lg font-semibold">{t("myEarnings")}</CardTitle>
          <FilterDialog activeCount={activeFilterCount} onReset={resetFilters}>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">{t("status")}</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100"
              >
                <option value="all">{t("allOption")}</option>
                <option value="available">{t("earningStatusAvailable")}</option>
                <option value="paid_out">{t("earningStatusPaidOut")}</option>
                <option value="clawed_back">{t("earningStatusClawedBack")}</option>
              </select>
            </div>
          </FilterDialog>
        </CardHeader>
        <CardContent className={spacing.cardPadding}>
          {earningsLoading ? (
            <SkeletonTable columns={7} />
          ) : earningsError ? (
            <ErrorState onRetry={refetchEarnings} />
          ) : earnings.length === 0 ? (
            <EmptyState description={t("noEarningsYet")} />
          ) : (
            <DataTable<TeacherEarning>
              columns={earningsColumns}
              data={earnings}
              pageSize={20}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={(key, order) => {
                setSortBy(key);
                setSortOrder(order);
              }}
            />
          )}
        </CardContent>
      </Card>

      <Card className={`${cardVariants.default} border-0 shadow-none rounded-[2rem]`}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t("payoutHistory")}</CardTitle>
        </CardHeader>
        <CardContent className={spacing.cardPadding}>
          {payoutsLoading ? (
            <SkeletonTable columns={4} />
          ) : payoutsError ? (
            <ErrorState onRetry={refetchPayouts} />
          ) : payouts.length === 0 ? (
            <EmptyState description={t("noPayoutsYet")} />
          ) : (
            <DataTable<TeacherPayout> columns={payoutColumns} data={payouts} pageSize={20} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
