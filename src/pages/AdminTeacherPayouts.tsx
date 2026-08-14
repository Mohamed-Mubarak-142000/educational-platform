import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  getPayoutsOverview,
  getTeacherBalances,
  getPayoutHistory,
  createPayout,
  type TeacherBalance,
} from "@/api/teacherPayoutApi";
import type { PayoutMethod, TeacherPayout } from "@/api/teacherEarningsApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/ToastProvider";
import {
  PageHeader,
  DataTable,
  FilterDialog,
  MultiSelectDropdown,
  SearchInput,
  SkeletonStatsGrid,
  SkeletonTable,
  EmptyState,
  ErrorState,
  type TableColumn,
  type MultiSelectOption,
} from "@/components/shared";
import { spacing, cardVariants } from "@/lib/constants";
import { useDebouncedValue } from "@/hooks";
import { TrendingUp, Wallet, CheckCircle2, Users } from "lucide-react";

const PAYOUT_METHODS: { id: PayoutMethod; labelKey: string }[] = [
  { id: "InstaPay", labelKey: "payoutMethodInstaPay" },
  { id: "VodafoneCash", labelKey: "payoutMethodVodafoneCash" },
  { id: "BankTransfer", labelKey: "payoutMethodBankTransfer" },
  { id: "Other", labelKey: "payoutMethodOther" },
];

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

function refName(ref: { name?: string } | string | undefined): string {
  if (!ref) return "—";
  if (typeof ref === "string") return ref;
  return ref.name ?? "—";
}

const EGP = (cents: number) => `${(cents / 100).toFixed(2)} EGP`;

export default function AdminTeacherPayouts() {
  const { t } = useTranslation();
  const { pushToast } = useToast();
  const queryClient = useQueryClient();

  const [balanceSearch, setBalanceSearch] = useState("");
  const debouncedBalanceSearch = useDebouncedValue(balanceSearch);
  const [balanceSortBy, setBalanceSortBy] = useState("availableCents");
  const [balanceSortOrder, setBalanceSortOrder] = useState<"asc" | "desc">("desc");

  const [historySearch, setHistorySearch] = useState("");
  const debouncedHistorySearch = useDebouncedValue(historySearch);
  const [selectedMethodIds, setSelectedMethodIds] = useState<string[]>([]);
  const [historySortBy, setHistorySortBy] = useState("createdAt");
  const [historySortOrder, setHistorySortOrder] = useState<"asc" | "desc">("desc");

  const [payoutTarget, setPayoutTarget] = useState<TeacherBalance | null>(null);
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>("InstaPay");
  const [payoutReference, setPayoutReference] = useState("");

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ["teacher-payouts-overview"],
    queryFn: getPayoutsOverview,
  });

  const balancesParams = {
    search: debouncedBalanceSearch || undefined,
    sortBy: balanceSortBy,
    sortOrder: balanceSortOrder,
  };

  const {
    data: balances = [],
    isLoading: balancesLoading,
    isError: balancesError,
    refetch: refetchBalances,
  } = useQuery({
    queryKey: ["teacher-balances", JSON.stringify(balancesParams)],
    queryFn: () => getTeacherBalances(balancesParams),
  });

  const historyParams = {
    search: debouncedHistorySearch || undefined,
    method: selectedMethodIds,
    sortBy: historySortBy,
    sortOrder: historySortOrder,
  };

  const {
    data: payoutHistory = [],
    isLoading: historyLoading,
    isError: historyError,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ["teacher-payout-history", JSON.stringify(historyParams)],
    queryFn: () => getPayoutHistory(historyParams),
  });

  const methodOptions: MultiSelectOption[] = PAYOUT_METHODS.map((m) => ({
    id: m.id,
    label: t(m.labelKey),
  }));

  const historyActiveFilterCount = selectedMethodIds.length;
  const resetHistoryFilters = () => setSelectedMethodIds([]);

  const payoutMutation = useMutation({
    mutationFn: createPayout,
    onSuccess: () => {
      pushToast({ title: t("toastCreated"), type: "success" });
      queryClient.invalidateQueries({ queryKey: ["teacher-payouts-overview"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-balances"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-payout-history"] });
      setPayoutTarget(null);
      setPayoutReference("");
    },
    onError: (err: any) => {
      pushToast({
        title: t("toastActionFailed"),
        description: err.response?.data?.message || t("insufficientBalanceError"),
        type: "error",
      });
    },
  });

  const balanceColumns: TableColumn<TeacherBalance>[] = [
    { key: "name", label: t("name") },
    { key: "email", label: t("email") },
    {
      key: "totalEarnedCents",
      label: t("totalEarned"),
      render: (v) => EGP(v as number),
    },
    {
      key: "availableCents",
      label: t("availableBalance"),
      render: (v) => <span className="font-semibold text-emerald-600 dark:text-emerald-400">{EGP(v as number)}</span>,
    },
    {
      key: "totalPaidOutCents",
      label: t("paidOutSoFar"),
      render: (v) => EGP(v as number),
    },
    {
      key: "lastPayoutAt",
      label: t("lastPayout"),
      sortable: false,
      render: (v) => (v ? new Date(v as string).toLocaleDateString() : "—"),
    },
  ];

  const historyColumns: TableColumn<TeacherPayout>[] = [
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
      key: "teacherId",
      label: t("teacher"),
      sortable: false,
      render: (v) => refName(v as TeacherPayout["teacherId"]),
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
      <PageHeader title={t("adminTeacherPayouts")} subtitle={t("adminTeacherPayoutsSubtitle")} />

      {overviewLoading || !overview ? (
        <SkeletonStatsGrid items={4} />
      ) : (
        <div className="rounded-[2rem] bg-white dark:bg-slate-900 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <StatCard
              title={t("totalCommissionCollected")}
              value={EGP(overview.totalPlatformFeeCents)}
              icon={TrendingUp}
              color="bg-emerald-600"
            />
            <StatCard
              title={t("totalOwedToTeachers")}
              value={EGP(overview.totalOwedCents)}
              icon={Wallet}
              color="bg-amber-500"
            />
            <StatCard
              title={t("paidOutSoFar")}
              value={EGP(overview.totalPaidOutCents)}
              icon={CheckCircle2}
              color="bg-violet-600"
            />
            <StatCard
              title={t("teachersWithBalance")}
              value={String(overview.teachersWithBalanceCount)}
              icon={Users}
              color="bg-blue-500"
            />
          </div>
        </div>
      )}

      <Card className={`${cardVariants.default} border-0 shadow-none rounded-[2rem]`}>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-lg font-semibold">{t("teacherBalances")}</CardTitle>
          <SearchInput
            value={balanceSearch}
            onChange={setBalanceSearch}
            placeholder={t("searchTeacherPlaceholder")}
            className="w-full sm:w-64"
          />
        </CardHeader>
        <CardContent className={spacing.cardPadding}>
          {balancesLoading ? (
            <SkeletonTable columns={6} />
          ) : balancesError ? (
            <ErrorState onRetry={refetchBalances} />
          ) : balances.length === 0 ? (
            <EmptyState description={t("noTeachersFound")} />
          ) : (
            <DataTable<TeacherBalance>
              columns={balanceColumns}
              data={balances}
              pageSize={20}
              sortBy={balanceSortBy}
              sortOrder={balanceSortOrder}
              onSortChange={(key, order) => {
                setBalanceSortBy(key);
                setBalanceSortOrder(order);
              }}
              actions={(row) => (
                <Button
                  size="sm"
                  className="bg-violet-600 hover:bg-violet-700 text-white"
                  disabled={row.availableCents <= 0}
                  onClick={() => {
                    setPayoutTarget(row);
                    setPayoutMethod("InstaPay");
                    setPayoutReference("");
                  }}
                >
                  {t("payOut")}
                </Button>
              )}
            />
          )}
        </CardContent>
      </Card>

      <Card className={`${cardVariants.default} border-0 shadow-none rounded-[2rem]`}>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-lg font-semibold">{t("payoutHistory")}</CardTitle>
          <div className="flex items-center gap-3">
            <SearchInput
              value={historySearch}
              onChange={setHistorySearch}
              placeholder={t("searchByNamePlaceholder")}
              className="w-full sm:w-64"
            />
            <FilterDialog activeCount={historyActiveFilterCount} onReset={resetHistoryFilters}>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  {t("filterByMethod")}
                </label>
                <MultiSelectDropdown
                  options={methodOptions}
                  selectedIds={selectedMethodIds}
                  onChange={setSelectedMethodIds}
                  placeholder={t("selectMethodsPlaceholder")}
                  selectedCountLabel={(count) => t("methodsSelectedCount", { count })}
                />
              </div>
            </FilterDialog>
          </div>
        </CardHeader>
        <CardContent className={spacing.cardPadding}>
          {historyLoading ? (
            <SkeletonTable columns={5} />
          ) : historyError ? (
            <ErrorState onRetry={refetchHistory} />
          ) : payoutHistory.length === 0 ? (
            <EmptyState description={t("noPayoutsYet")} />
          ) : (
            <DataTable<TeacherPayout>
              columns={historyColumns}
              data={payoutHistory}
              pageSize={20}
              sortBy={historySortBy}
              sortOrder={historySortOrder}
              onSortChange={(key, order) => {
                setHistorySortBy(key);
                setHistorySortOrder(order);
              }}
            />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!payoutTarget}
        title={t("confirmPayoutTitle")}
        description={
          payoutTarget
            ? `${payoutTarget.name} — ${t("availableBalance")}: ${EGP(payoutTarget.availableCents)}. ${t("confirmPayoutDescription")}`
            : undefined
        }
        confirmLabel={t("payOut")}
        cancelLabel={t("cancel")}
        tone="success"
        onCancel={() => setPayoutTarget(null)}
        onConfirm={async () => {
          if (!payoutTarget) return;
          await payoutMutation.mutateAsync({
            teacherId: payoutTarget.teacherId,
            method: payoutMethod,
            reference: payoutReference || undefined,
          });
        }}
      >
        <div className="space-y-3 mt-2">
          <div className="space-y-1">
            <label className="text-xs text-slate-500 dark:text-slate-400">
              {t("method", { defaultValue: "Method" })}
            </label>
            <select
              value={payoutMethod}
              onChange={(e) => setPayoutMethod(e.target.value as PayoutMethod)}
              className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100"
            >
              {PAYOUT_METHODS.map((m) => (
                <option key={m.id} value={m.id}>
                  {t(m.labelKey)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500 dark:text-slate-400">{t("referenceNote")}</label>
            <Input value={payoutReference} onChange={(e) => setPayoutReference(e.target.value)} />
          </div>
        </div>
      </ConfirmDialog>
    </div>
  );
}
