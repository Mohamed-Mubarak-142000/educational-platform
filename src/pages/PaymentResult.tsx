import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  BookOpen,
  ReceiptText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPaymentStatus, type PaymentStatus } from "@/api/paymobApi";
import { spacing } from "@/lib/constants";

type ResultState = "loading" | "success" | "failed" | "pending";

function mapStatusToResult(status: PaymentStatus | undefined): ResultState {
  if (!status) return "loading";
  if (status === "success") return "success";
  if (status === "pending") return "pending";
  return "failed";
}

export default function PaymentResult() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const successParam = searchParams.get("success");
  const paymentId = searchParams.get("payment_id");
  const statusParam = searchParams.get("status") as PaymentStatus | null;

  // Poll payment status if we have a paymentId (webhook may not have fired yet)
  const [pollCount, setPollCount] = useState(0);
  const maxPolls = 8;

  const { data: paymentData, isLoading } = useQuery({
    queryKey: ["payment-status", paymentId, pollCount],
    queryFn: () => getPaymentStatus(paymentId!),
    enabled: !!paymentId && (statusParam === null || statusParam === "pending"),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "success" || status === "failed") return false;
      if (pollCount >= maxPolls) return false;
      return 3000; // poll every 3 seconds
    },
  });

  useEffect(() => {
    if (
      paymentData &&
      (paymentData.status === "success" || paymentData.status === "failed")
    )
      return;
    const interval = setInterval(() => setPollCount((c) => c + 1), 3000);
    return () => clearInterval(interval);
  }, [paymentData]);

  // Determine result state
  const finalStatus: PaymentStatus | undefined =
    paymentData?.status ??
    statusParam ??
    (successParam === "true"
      ? "success"
      : successParam === "false"
        ? "failed"
        : undefined);

  const resultState: ResultState =
    isLoading && !statusParam ? "loading" : mapStatusToResult(finalStatus);

  const config: Record<
    ResultState,
    {
      icon: React.ReactNode;
      titleKey: string;
      messageKey: string;
      bg: string;
      iconColor: string;
    }
  > = {
    loading: {
      icon: <Clock className="w-16 h-16 animate-pulse" />,
      titleKey: "paymentProcessing",
      messageKey: "paymentProcessingMessage",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-500",
    },
    success: {
      icon: <CheckCircle2 className="w-16 h-16" />,
      titleKey: "paymentSuccess",
      messageKey: "paymentSuccessMessage",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      iconColor: "text-emerald-500",
    },
    failed: {
      icon: <XCircle className="w-16 h-16" />,
      titleKey: "paymentFailed",
      messageKey: "paymentFailedMessage",
      bg: "bg-red-50 dark:bg-red-900/20",
      iconColor: "text-red-500",
    },
    pending: {
      icon: <Clock className="w-16 h-16 animate-pulse" />,
      titleKey: "paymentPending",
      messageKey: "paymentPendingMessage",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      iconColor: "text-amber-500",
    },
  };

  const { icon, titleKey, messageKey, bg, iconColor } = config[resultState];

  return (
    <div
      className={`${spacing.pageContainer} flex items-center justify-center min-h-[60vh]`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="border border-slate-200 dark:border-slate-800 shadow-lg">
          <CardContent className="py-10 text-center space-y-6">
            {/* Icon */}
            <div
              className={`mx-auto w-28 h-28 rounded-full ${bg} flex items-center justify-center`}
            >
              <span className={iconColor}>{icon}</span>
            </div>

            {/* Text */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {t(titleKey)}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {t(messageKey)}
              </p>
            </div>

            {/* Payment details */}
            {paymentData && (
              <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-4 text-left space-y-2 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">
                    {t("amount")}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {(paymentData.amountCents / 100).toLocaleString("ar-EG")}{" "}
                    {t("currencyEgp")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">
                    {t("plan")}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {t(`plan${paymentData.plan}`)} ({paymentData.planDays}{" "}
                    {t("days")})
                  </span>
                </div>
                {paymentData.paymobTransactionId && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                      {t("transactionId")}
                    </span>
                    <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
                      #{paymentData.paymobTransactionId}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3">
              {resultState === "success" && (
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full gap-2"
                  onClick={() => navigate("/student/learn")}
                >
                  <BookOpen className="w-4 h-4" />
                  {t("startLearning")}
                </Button>
              )}

              {resultState === "failed" && (
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full gap-2"
                  onClick={() => navigate(-1)}
                >
                  {t("retryPayment")}
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => navigate("/student/payments-record")}
              >
                <ReceiptText className="w-4 h-4" />
                {t("paymentHistory")}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-1 text-slate-500"
                onClick={() => navigate("/student")}
              >
                <ArrowLeft className="w-4 h-4" />
                {t("backToDashboard")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
