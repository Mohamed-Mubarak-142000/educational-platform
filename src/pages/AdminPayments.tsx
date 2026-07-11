import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminPaymentsAnalytics,
  refundPayment,
  type PaymobPayment,
} from "@/api/paymobApi";
import {
  getManualPaymentRequests,
  approveManualPaymentRequest,
  rejectManualPaymentRequest,
  type ManualPaymentRequest,
} from "@/api/manualPaymentApi";
import { MANUAL_PAYMENT_METHODS } from "@/lib/paymentMethods";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  ImageIcon,
  Check,
  X,
} from "lucide-react";

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <Card className={cardVariants.default}>
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
  const [refundTarget, setRefundTarget] = useState<PaymobPayment | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [rejectTarget, setRejectTarget] = useState<ManualPaymentRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  const {
    data: analytics,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: getAdminPaymentsAnalytics,
  });

  const {
    data: manualRequests = [],
    isLoading: manualLoading,
  } = useQuery({
    queryKey: ["manual-payment-requests", "Pending"],
    queryFn: () => getManualPaymentRequests("Pending"),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveManualPaymentRequest(id),
    onSuccess: () => {
      pushToast({
        title: t("manualPaymentApproved", { defaultValue: "Payment approved" }),
        type: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["manual-payment-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
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
      queryClient.invalidateQueries({ queryKey: ["manual-payment-requests"] });
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

  const manualColumns = useMemo<TableColumn<ManualPaymentRequest>[]>(
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
        render: (value) => (
          <span className="font-medium">
            {value as number} {t("currencyEgp")}
          </span>
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
    [t],
  );

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

  const columns = useMemo<TableColumn<PaymobPayment>[]>(
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
        render: (value) => refName(value as PaymobPayment["studentId"]),
      },
      {
        key: "teacherId",
        label: t("teacher", { defaultValue: "Teacher" }),
        render: (value) => refName(value as PaymobPayment["teacherId"]),
      },
      {
        key: "amountCents",
        label: t("amount"),
        render: (value, row) => (
          <span className="font-medium">
            {((value as number) / 100).toFixed(2)} {row.currency}
          </span>
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
        key: "paymobTransactionId",
        label: t("transactionId"),
        render: (value) => (
          <span
            className="font-mono text-xs text-slate-500 dark:text-slate-400 block truncate max-w-[160px]"
            title={(value as string) || "N/A"}
          >
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatCard
            title={t("totalRevenue", { defaultValue: "Total revenue" })}
            value={`${analytics.totalRevenueEGP.toLocaleString()} ${t("currencyEgp")}`}
            sub={`MRR ${analytics.mrrEGP.toLocaleString()} · ARR ${analytics.arrEGP.toLocaleString()}`}
            icon={TrendingUp}
            color="bg-emerald-600"
          />
          <StatCard
            title={t("activeSubscriptions", { defaultValue: "Active subscriptions" })}
            value={String(analytics.activeSubscriptions)}
            sub={t("expiringSoonCount", {
              defaultValue: "{{count}} expiring soon",
              count: analytics.expiringSoon,
            })}
            icon={Users}
            color="bg-violet-600"
          />
          <StatCard
            title={t("paymentStatusSuccess")}
            value={String(analytics.successCount)}
            icon={CheckCircle2}
            color="bg-emerald-500"
          />
          <StatCard
            title={t("paymentStatusFailed")}
            value={String(analytics.failedCount)}
            sub={`${analytics.refundedCount} ${t("paymentStatusRefunded")}`}
            icon={CreditCard}
            color="bg-red-500"
          />
        </div>
      )}

      <Card className={cardVariants.default}>
        <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            {t("manualPaymentRequests", { defaultValue: "Manual payment requests" })}
            {manualRequests.length > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                {manualRequests.length} {t("pending", { defaultValue: "pending" })}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className={spacing.cardPadding}>
          {manualLoading ? (
            <SkeletonTable columns={7} />
          ) : manualRequests.length === 0 ? (
            <EmptyState
              description={t("noManualPaymentsPending", {
                defaultValue: "No manual payment requests waiting for review.",
              })}
            />
          ) : (
            <DataTable<ManualPaymentRequest>
              columns={manualColumns}
              data={manualRequests}
              pageSize={20}
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

      <Card className={cardVariants.default}>
        <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <CardTitle className="text-lg font-semibold">
            {t("recentPayments", { defaultValue: "Recent payments" })}
          </CardTitle>
        </CardHeader>
        <CardContent className={spacing.cardPadding}>
          {isLoading ? (
            <SkeletonTable columns={7} />
          ) : !analytics || analytics.recentPayments.length === 0 ? (
            <EmptyState description={t("noPaymentsYet")} />
          ) : (
            <DataTable<PaymobPayment>
              columns={columns}
              data={analytics.recentPayments}
              pageSize={20}
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
            "This marks the payment as refunded and revokes the linked subscription. It does not call Paymob automatically — process the actual money transfer there separately.",
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
