import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminPaymentsAnalytics,
  refundPayment,
  type Payment,
} from "@/api/paymentApi";
import { useDebouncedValue } from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/ToastProvider";
import { useTranslation } from "react-i18next";
import {
  SkeletonStatsGrid,
  SkeletonTable,
  EmptyState,
  ErrorState,
  PageHeader,
  DataTable,
  FilterDialog,
  SearchInput,
  type TableColumn,
} from "@/components/shared";
import { spacing, cardVariants } from "@/lib/constants";
import {
  TrendingUp,
  CreditCard,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react";

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  color,
  className = "",
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  className?: string;
}) {
  return (
    <Card className={`${cardVariants.default} ${className}`}>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              {title}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {value}
            </p>
            {sub && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {sub}
              </p>
            )}
          </div>
          <div
            className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const cfg: Record<string, { cls: string; icon: React.ReactNode }> = {
    success: {
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/40",
      icon: <CheckCircle2 className="w-3 h-3" />,
    },
    failed: {
      cls: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/40",
      icon: <XCircle className="w-3 h-3" />,
    },
    pending: {
      cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/40",
      icon: <Clock className="w-3 h-3" />,
    },
    refunded: {
      cls: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800/40",
      icon: <RefreshCw className="w-3 h-3" />,
    },
    voided: {
      cls: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800/40",
      icon: <AlertTriangle className="w-3 h-3" />,
    },
    expired: {
      cls: "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-900/20 dark:text-slate-500 dark:border-slate-800/40",
      icon: <Clock className="w-3 h-3" />,
    },
  };
  const { cls, icon } = cfg[status] ?? cfg.failed;
  const labelKey = `paymentStatus${status.charAt(0).toUpperCase() + status.slice(1)}`;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${cls}`}
    >
      {icon} {t(labelKey)}
    </span>
  );
}

/** teacherId/studentId/subjectId come back either populated (object) or as a bare id string. */
function refName(ref: { name?: string } | string | undefined): string {
  if (!ref) return "—";
  if (typeof ref === "string") return ref;
  return ref.name ?? "—";
}

export default function AdminPayments() {
  const { t } = useTranslation();
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const [refundTarget, setRefundTarget] = useState<Payment | null>(null);
  const [refundReason, setRefundReason] = useState("");

  // Recent payments: search + filters (resolved server-side)
  const [paymentsSearchQuery, setPaymentsSearchQuery] = useState("");
  const debouncedPaymentsSearch = useDebouncedValue(paymentsSearchQuery);
  const [statusFilter, setStatusFilter] = useState<"all" | Payment["status"]>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | Payment["subscriptionType"]>("all");
  const [paymentsSortBy, setPaymentsSortBy] = useState("createdAt");
  const [paymentsSortOrder, setPaymentsSortOrder] = useState<"asc" | "desc">("desc");

  const analyticsParams = {
    search: debouncedPaymentsSearch || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    subscriptionType: typeFilter !== "all" ? typeFilter : undefined,
    sortBy: paymentsSortBy,
    sortOrder: paymentsSortOrder,
  };

  const {
    data: analytics,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-analytics", JSON.stringify(analyticsParams)],
    queryFn: () => getAdminPaymentsAnalytics(analyticsParams),
  });

  const paymentsActiveFilterCount = (statusFilter !== "all" ? 1 : 0) + (typeFilter !== "all" ? 1 : 0);

  const resetPaymentsFilters = () => {
    setStatusFilter("all");
    setTypeFilter("all");
  };

  const refundMutation = useMutation({
    mutationFn: ({ paymentId, reason }: { paymentId: string; reason?: string }) =>
      refundPayment(paymentId, reason),
    onSuccess: () => {
      pushToast({
        title: t("refundSuccessful", { defaultValue: "Payment refunded" }),
        type: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
      setRefundTarget(null);
      setRefundReason("");
    },
    onError: (err: any) => {
      pushToast({
        title: t("refundFailed", { defaultValue: "Refund failed" }),
        description: err.response?.data?.message || t("somethingWentWrong"),
        type: "error",
      });
    },
  });

  const columns = useMemo<TableColumn<Payment>[]>(
    () => [
      {
        key: "createdAt",
        label: t("date"),
        render: (value) =>
          value
            ? new Date(value as string).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "—",
      },
      {
        key: "studentId",
        label: t("student", { defaultValue: "Student" }),
        sortable: false,
        render: (value) => refName(value as Payment["studentId"]),
      },
      {
        key: "teacherId",
        label: t("teacher", { defaultValue: "Teacher" }),
        sortable: false,
        render: (value) => refName(value as Payment["teacherId"]),
      },
      {
        key: "amountCents",
        label: t("grossAmount"),
        render: (value, row) => (
          <span className="font-medium">
            {((value as number) / 100).toFixed(2)} {row.currency}
          </span>
        ),
      },
      {
        key: "platformFeeCents",
        label: t("platformFee"),
        sortable: false,
        render: (value) =>
          value === undefined ? (
            <span className="text-slate-400">—</span>
          ) : (
            <span className="text-slate-400">-{((value as number) / 100).toFixed(2)} {t("currencyEgp")}</span>
          ),
      },
      {
        key: "netEarningCents",
        label: t("netEarning"),
        sortable: false,
        render: (value) =>
          value === undefined ? (
            <span className="text-slate-400">—</span>
          ) : (
            <span className="font-semibold">{((value as number) / 100).toFixed(2)} {t("currencyEgp")}</span>
          ),
      },
      {
        key: "subscriptionType",
        label: t("subscriptionTypeLabel"),
        render: (value) => (
          <span className="capitalize">{(value as string) || "—"}</span>
        ),
      },
      {
        key: "status",
        label: t("status"),
        render: (value) => <StatusBadge status={value as string} />,
      },
      {
        key: "paymentMethod",
        label: t("paymentMethod", { defaultValue: "Method" }),
        render: (value) => (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {(value as string) || "N/A"}
          </span>
        ),
      },
    ],
    [t],
  );

  if (isError) {
    return (
      <div className={spacing.pageContainer}>
        <PageHeader
          title={t("adminPayments", { defaultValue: "Payments" })}
          subtitle={t("adminPaymentsSubtitle", {
            defaultValue: "Revenue, subscriptions and refunds",
          })}
        />
        <ErrorState
          description={
            error instanceof Error ? error.message : t("errorLoadingPayments")
          }
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className={`${spacing.pageContainer} space-y-6`}>
      <PageHeader
        title={t("adminPayments", { defaultValue: "Payments" })}
        subtitle={t("adminPaymentsSubtitle", {
          defaultValue: "Revenue, subscriptions and refunds",
        })}
        action={
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            {t("refresh", { defaultValue: "Refresh" })}
          </Button>
        }
      />

      {isLoading || !analytics ? (
        <SkeletonStatsGrid items={4} />
      ) : (
        <div className="rounded-[2rem] bg-white dark:bg-slate-900 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <StatCard
              title={t("totalRevenue", { defaultValue: "Total revenue" })}
              value={`${analytics.totalRevenueEGP.toLocaleString()} ${t("currencyEgp")}`}
              sub={t("revenueMonthYearSub", {
                defaultValue: "This month {{month}} · This year {{year}}",
                month: analytics.revenueThisMonthEGP.toLocaleString(),
                year: analytics.revenueThisYearEGP.toLocaleString(),
              })}
              icon={TrendingUp}
              color="bg-emerald-600"
              className="border-0 shadow-none"
            />
            <StatCard
              title={t("activeSubscriptions", { defaultValue: "Active subscriptions" })}
              value={String(analytics.activeSubscriptions)}
              sub={t("lifetimeAccessNotice", { defaultValue: "One-time payment — access never expires." })}
              icon={Users}
              color="bg-violet-600"
              className="border-0 shadow-none"
            />
            <StatCard
              title={t("paymentStatusSuccess")}
              value={String(analytics.successCount)}
              icon={CheckCircle2}
              color="bg-emerald-500"
              className="border-0 shadow-none"
            />
            <StatCard
              title={t("paymentStatusFailed")}
              value={String(analytics.failedCount)}
              sub={`${analytics.refundedCount} ${t("paymentStatusRefunded")}`}
              icon={CreditCard}
              color="bg-red-500"
              className="border-0 shadow-none"
            />
          </div>
        </div>
      )}

      <Card className={`${cardVariants.default} border-0 shadow-none rounded-[2rem]`}>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-lg font-semibold">
            {t("recentPayments", { defaultValue: "Recent payments" })}
          </CardTitle>
          <div className="flex items-center gap-3">
            <SearchInput
              value={paymentsSearchQuery}
              onChange={setPaymentsSearchQuery}
              placeholder={t("searchByNamePlaceholder")}
              className="w-full sm:w-64"
            />
            <FilterDialog activeCount={paymentsActiveFilterCount} onReset={resetPaymentsFilters}>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  {t("status")}
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100"
                >
                  <option value="all">{t("allStatuses")}</option>
                  <option value="success">{t("paymentStatusSuccess")}</option>
                  <option value="pending">{t("paymentStatusPending")}</option>
                  <option value="failed">{t("paymentStatusFailed")}</option>
                  <option value="refunded">{t("paymentStatusRefunded")}</option>
                  <option value="voided">{t("paymentStatusVoided")}</option>
                  <option value="expired">{t("paymentStatusExpired")}</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  {t("filterByType")}
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100"
                >
                  <option value="all">{t("allOption")}</option>
                  <option value="subject">{t("subscriptionTypeSubject")}</option>
                  <option value="unit">{t("subscriptionTypeUnit")}</option>
                  <option value="liveLesson">{t("subscriptionTypeLiveLesson")}</option>
                </select>
              </div>
            </FilterDialog>
          </div>
        </CardHeader>
        <CardContent className={spacing.cardPadding}>
          {isLoading ? (
            <SkeletonTable columns={9} />
          ) : !analytics || analytics.recentPayments.length === 0 ? (
            <EmptyState description={t("noPaymentsYet")} />
          ) : (
            <DataTable<Payment>
              columns={columns}
              data={analytics.recentPayments}
              pageSize={20}
              sortBy={paymentsSortBy}
              sortOrder={paymentsSortOrder}
              onSortChange={(key, order) => {
                setPaymentsSortBy(key);
                setPaymentsSortOrder(order);
              }}
              actions={(row) =>
                row.status === "success" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900/40 dark:hover:bg-red-900/20"
                    onClick={() => setRefundTarget(row)}
                  >
                    {t("refund", { defaultValue: "Refund" })}
                  </Button>
                ) : null
              }
            />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!refundTarget}
        title={t("confirmRefundTitle", { defaultValue: "Refund this payment?" })}
        description={t("confirmRefundDescription", {
          defaultValue:
            "This marks the payment as refunded and revokes the student's access. There is no payment gateway to call automatically — you must manually send the money back to the student via the same method they paid with (InstaPay/Vodafone Cash/Fawry).",
        })}
        confirmLabel={t("refund", { defaultValue: "Refund" })}
        tone="danger"
        onCancel={() => {
          setRefundTarget(null);
          setRefundReason("");
        }}
        onConfirm={async () => {
          if (!refundTarget) return;
          await refundMutation.mutateAsync({
            paymentId: refundTarget._id,
            reason: refundReason || undefined,
          });
        }}
      >
        <Textarea
          value={refundReason}
          onChange={(e) => setRefundReason(e.target.value)}
          placeholder={t("refundReasonPlaceholder", {
            defaultValue: "Reason (optional)",
          })}
          rows={2}
          className="resize-none mt-2"
        />
      </ConfirmDialog>
    </div>
  );
}
