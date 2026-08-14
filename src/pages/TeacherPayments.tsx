import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getManualPaymentRequests,
  approveManualPaymentRequest,
  rejectManualPaymentRequest,
  type ManualPaymentRequest,
} from "@/api/manualPaymentApi";
import { MANUAL_PAYMENT_METHODS } from "@/lib/paymentMethods";
import { fetchPlatformConfig } from "@/api/platformConfigApi";
import { useDebouncedValue } from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/ToastProvider";
import { useTranslation } from "react-i18next";
import {
  SkeletonTable,
  EmptyState,
  PageHeader,
  DataTable,
  FilterDialog,
  MultiSelectDropdown,
  SearchInput,
  type TableColumn,
  type MultiSelectOption,
} from "@/components/shared";
import { spacing, cardVariants } from "@/lib/constants";
import { RefreshCw, ImageIcon, Check, X } from "lucide-react";

/** studentId comes back either populated (object) or as a bare id string. */
function refName(ref: { name?: string } | string | undefined): string {
  if (!ref) return "—";
  if (typeof ref === "string") return ref;
  return ref.name ?? "—";
}

export default function TeacherPayments() {
  const { t } = useTranslation();
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const [rejectTarget, setRejectTarget] = useState<ManualPaymentRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebouncedValue(searchQuery);
  const [selectedMethodIds, setSelectedMethodIds] = useState<string[]>([]);
  const [purposeFilter, setPurposeFilter] = useState<"all" | ManualPaymentRequest["purpose"]>("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const params = {
    status: "Pending" as const,
    search: debouncedSearch || undefined,
    method: selectedMethodIds,
    purpose: purposeFilter !== "all" ? purposeFilter : undefined,
    sortBy,
    sortOrder,
  };

  const {
    data: requests = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["teacher-manual-payment-requests", JSON.stringify(params)],
    queryFn: () => getManualPaymentRequests(params),
  });

  // Public — no auth required — used only to preview what the teacher will
  // actually net once approved (the real number is computed server-side at
  // approval time, this is just a heads-up).
  const { data: platformConfig } = useQuery({
    queryKey: ["platform-config"],
    queryFn: fetchPlatformConfig,
    staleTime: 5 * 60 * 1000,
  });

  const estimateNetEGP = (row: ManualPaymentRequest): number => {
    const settings = platformConfig?.settings;
    if (!settings) return row.amountEGP;
    if (row.purpose === "liveLesson") {
      const rate = (settings.commissionRateBps ?? 3000) / 10000;
      return row.amountEGP * (1 - rate);
    }
    const flatFeeEGP = (settings.subscriptionFlatFeeCents ?? 5000) / 100;
    return Math.max(0, row.amountEGP - flatFeeEGP);
  };

  const methodOptions: MultiSelectOption[] = MANUAL_PAYMENT_METHODS.map((method) => ({
    id: method.id,
    label: t(method.labelKey, { defaultValue: method.defaultLabel }),
  }));

  const activeFilterCount = selectedMethodIds.length + (purposeFilter !== "all" ? 1 : 0);

  const resetFilters = () => {
    setSelectedMethodIds([]);
    setPurposeFilter("all");
  };

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveManualPaymentRequest(id),
    onSuccess: () => {
      pushToast({
        title: t("manualPaymentApproved", { defaultValue: "Payment approved" }),
        type: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["teacher-manual-payment-requests"] });
      queryClient.invalidateQueries({ queryKey: ["my-earnings"] });
      queryClient.invalidateQueries({ queryKey: ["my-earnings-summary"] });
    },
    onError: (err: any) => {
      pushToast({
        title: t("actionFailed", { defaultValue: "Action failed" }),
        description: err.response?.data?.message || t("somethingWentWrong"),
        type: "error",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      rejectManualPaymentRequest(id, reason),
    onSuccess: () => {
      pushToast({
        title: t("manualPaymentRejected", { defaultValue: "Payment rejected" }),
        type: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["teacher-manual-payment-requests"] });
      setRejectTarget(null);
      setRejectReason("");
    },
    onError: (err: any) => {
      pushToast({
        title: t("actionFailed", { defaultValue: "Action failed" }),
        description: err.response?.data?.message || t("somethingWentWrong"),
        type: "error",
      });
    },
  });

  const columns = useMemo<TableColumn<ManualPaymentRequest>[]>(
    () => [
      {
        key: "createdAt",
        label: t("date"),
        render: (value) =>
          value
            ? new Date(value as string).toLocaleDateString(undefined, {
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
        render: (value) => refName(value as ManualPaymentRequest["studentId"]),
      },
      {
        key: "method",
        label: t("method", { defaultValue: "Method" }),
        render: (value) => {
          const method = MANUAL_PAYMENT_METHODS.find((m) => m.id === value);
          return (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {method ? t(method.labelKey, { defaultValue: method.defaultLabel }) : String(value)}
            </span>
          );
        },
      },
      {
        key: "amountEGP",
        label: t("amount"),
        render: (value, row) => (
          <div>
            <span className="font-medium">
              {value as number} {t("currencyEgp")}
            </span>
            <div className="text-xs text-emerald-600 dark:text-emerald-400">
              {t("netEarning")}: {estimateNetEGP(row).toFixed(2)} {t("currencyEgp")}
            </div>
          </div>
        ),
      },
      {
        key: "purpose",
        label: t("subscriptionTypeLabel"),
        render: (value) => <span className="capitalize">{String(value)}</span>,
      },
      {
        key: "referenceCode",
        label: t("referenceCode", { defaultValue: "Reference" }),
        render: (value) => (
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
            {String(value)}
          </span>
        ),
      },
      {
        key: "proofUrl",
        label: t("proof", { defaultValue: "Proof" }),
        sortable: false,
        render: (value) => (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setProofPreview(value as string)}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            {t("view", { defaultValue: "View" })}
          </Button>
        ),
      },
    ],
    [t, platformConfig],
  );

  return (
    <div className={`${spacing.pageContainer} space-y-6`}>
      <PageHeader
        title={t("manualPaymentRequests", { defaultValue: "Manual payment requests" })}
        subtitle={t("teacherPaymentsSubtitle", {
          defaultValue: "Review and approve your students' payment proofs",
        })}
        action={
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            {t("refresh", { defaultValue: "Refresh" })}
          </Button>
        }
      />

      <Card className={`${cardVariants.default} border-0 shadow-none rounded-[2rem]`}>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            {t("pendingRequests", { defaultValue: "Pending requests" })}
            {requests.length > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                {requests.length} {t("pending", { defaultValue: "pending" })}
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-3">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t("searchByNamePlaceholder")}
              className="w-full sm:w-64"
            />
            <FilterDialog activeCount={activeFilterCount} onReset={resetFilters}>
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

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  {t("filterByPurpose")}
                </label>
                <select
                  value={purposeFilter}
                  onChange={(e) => setPurposeFilter(e.target.value as typeof purposeFilter)}
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
            <SkeletonTable columns={7} />
          ) : requests.length === 0 ? (
            <EmptyState
              description={t("noManualPaymentsPending", {
                defaultValue: "No manual payment requests waiting for review.",
              })}
            />
          ) : (
            <DataTable<ManualPaymentRequest>
              columns={columns}
              data={requests}
              pageSize={20}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={(key, order) => {
                setSortBy(key);
                setSortOrder(order);
              }}
              actions={(row) => (
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                    onClick={() => approveMutation.mutate(row._id)}
                    disabled={approveMutation.isPending}
                  >
                    <Check className="w-3.5 h-3.5" />
                    {t("approve", { defaultValue: "Approve" })}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900/40 dark:hover:bg-red-900/20 gap-1"
                    onClick={() => setRejectTarget(row)}
                  >
                    <X className="w-3.5 h-3.5" />
                    {t("reject", { defaultValue: "Reject" })}
                  </Button>
                </div>
              )}
            />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!rejectTarget}
        title={t("confirmRejectTitle", { defaultValue: "Reject this payment?" })}
        description={t("confirmRejectDescription", {
          defaultValue: "The student will see this request as rejected.",
        })}
        confirmLabel={t("reject", { defaultValue: "Reject" })}
        tone="danger"
        onCancel={() => {
          setRejectTarget(null);
          setRejectReason("");
        }}
        onConfirm={async () => {
          if (!rejectTarget) return;
          await rejectMutation.mutateAsync({
            id: rejectTarget._id,
            reason: rejectReason || undefined,
          });
        }}
      >
        <Textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder={t("rejectReasonPlaceholder", { defaultValue: "Reason (optional)" })}
          rows={2}
          className="resize-none mt-2"
        />
      </ConfirmDialog>

      <Dialog open={!!proofPreview} onOpenChange={(v) => !v && setProofPreview(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("paymentProofUpload", { defaultValue: "Payment proof screenshot" })}</DialogTitle>
          </DialogHeader>
          {proofPreview && (
            <img
              src={proofPreview}
              alt="proof"
              className="w-full max-h-[70vh] object-contain rounded-lg border border-slate-200 dark:border-slate-800"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
