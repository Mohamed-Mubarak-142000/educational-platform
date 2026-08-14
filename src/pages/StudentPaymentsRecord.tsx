import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  getMyPaymentHistory,
  type PaymentStatus,
  type Payment,
} from "@/api/paymentApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DataTable,
  type TableColumn,
  ErrorState,
  PageHeader,
  FilterDialog,
} from "@/components/shared";
import { spacing, cardVariants } from "@/lib/constants";
import {
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

function StatusBadge({ status }: { status: PaymentStatus }) {
  const { t } = useTranslation();
  const cfg: Record<
    PaymentStatus,
    { label: string; cls: string; icon: React.ReactNode }
  > = {
    success: {
      label: t("paymentStatusSuccess"),
      cls: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40",
      icon: <CheckCircle2 className="w-3 h-3" />,
    },
    failed: {
      label: t("paymentStatusFailed"),
      cls: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/40",
      icon: <XCircle className="w-3 h-3" />,
    },
    pending: {
      label: t("paymentStatusPending"),
      cls: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40",
      icon: <Clock className="w-3 h-3" />,
    },
    voided: {
      label: t("paymentStatusVoided"),
      cls: "bg-slate-50 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800/40",
      icon: <AlertCircle className="w-3 h-3" />,
    },
    refunded: {
      label: t("paymentStatusRefunded"),
      cls: "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800/40",
      icon: <RefreshCw className="w-3 h-3" />,
    },
    expired: {
      label: t("paymentStatusExpired"),
      cls: "bg-slate-50 dark:bg-slate-900/20 text-slate-500 dark:text-slate-500 border-slate-200 dark:border-slate-800/40",
      icon: <Clock className="w-3 h-3" />,
    },
  };

  const { label, cls, icon } = cfg[status] ?? cfg.failed;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${cls}`}
    >
      {icon} {label}
    </span>
  );
}

export default function StudentPaymentsRecord() {
  const { t } = useTranslation();
  const [selectedStatus, setSelectedStatus] = useState<PaymentStatus | "all">(
    "all",
  );
  const [selectedType, setSelectedType] = useState<
    Payment["subscriptionType"] | "all"
  >("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const historyParams = {
    status: selectedStatus !== "all" ? selectedStatus : undefined,
    subscriptionType: selectedType !== "all" ? selectedType : undefined,
    sortBy,
    sortOrder,
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["my-payment-history", JSON.stringify(historyParams)],
    queryFn: () => getMyPaymentHistory(1, historyParams),
  });

  const payments = data?.payments ?? [];

  const activeFilterCount =
    (selectedStatus !== "all" ? 1 : 0) + (selectedType !== "all" ? 1 : 0);

  const resetFilters = () => {
    setSelectedStatus("all");
    setSelectedType("all");
  };

  // Define table columns using the DataTable's TableColumn interface
  const columns = useMemo<TableColumn<Payment>[]>(
    () => [
      {
        key: "createdAt",
        label: t("date"),
        sortable: true,
        render: (value) => {
          return new Date((value as string) || "").toLocaleDateString(
            undefined,
            {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            },
          );
        },
      },
      {
        key: "amountCents",
        label: t("amount"),
        sortable: true,
        render: (value, row) => {
          return (
            <span className="font-medium">
              {((value as number) / 100).toFixed(2)} {row.currency}
            </span>
          );
        },
      },
      {
        key: "status",
        label: t("status"),
        sortable: true,
        render: (value) => <StatusBadge status={value as PaymentStatus} />,
      },
      {
        key: "paymentMethod",
        label: t("paymentMethod", { defaultValue: "Method" }),
        render: (value) => (
          <span className="text-muted-foreground">{(value as string) || "N/A"}</span>
        ),
      },
      {
        key: "subscriptionType",
        label: t("subscriptionTypeLabel"),
        sortable: true,
        render: (value) => (
          <span className="capitalize">{(value as string) || "N/A"}</span>
        ),
      },
    ],
    [t],
  );

  if (isError) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <PageHeader
          title={t("paymentsRecord")}
          subtitle={t("paymentsRecordSubtitle")}
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
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <PageHeader
        title={t("paymentsRecord")}
        subtitle={t("paymentsRecordSubtitle")}
      />

      <Card className={`${cardVariants.default} border-0 shadow-none rounded-[2rem]`}>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-lg font-semibold">
            {t("paymentHistory")}
          </CardTitle>
          <div className="flex items-center gap-3">
            <FilterDialog activeCount={activeFilterCount} onReset={resetFilters}>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  {t("status")}
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus(e.target.value as PaymentStatus | "all")
                  }
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
                  value={selectedType}
                  onChange={(e) =>
                    setSelectedType(e.target.value as Payment["subscriptionType"] | "all")
                  }
                  className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100"
                >
                  <option value="all">{t("allOption")}</option>
                  <option value="subject">{t("subscriptionTypeSubject")}</option>
                  <option value="unit">{t("subscriptionTypeUnit")}</option>
                  <option value="liveLesson">{t("subscriptionTypeLiveLesson")}</option>
                </select>
              </div>
            </FilterDialog>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="shrink-0"
              aria-label="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className={spacing.cardPadding}>
          <DataTable<Payment>
            columns={columns}
            data={payments}
            isLoading={isLoading}
            emptyMessage={
              selectedStatus === "all"
                ? t("noPaymentsYet")
                : t("noPaymentsWithStatus")
            }
            pageSize={10}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={(key, order) => {
              setSortBy(key);
              setSortOrder(order);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
