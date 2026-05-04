import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getAdminPaymentsAnalytics,
  refundPayment,
  type PaymobPayment,
} from "@/api/paymobApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/ToastProvider";
import { useTranslation } from "react-i18next";
import { SkeletonTable, EmptyState, ErrorState } from "@/components/shared";
import { spacing, cardVariants } from "@/lib/constants";
import { PageHeader } from "@/components/shared";
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
