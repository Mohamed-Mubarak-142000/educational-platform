import { useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { X, CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { SubscriptionPlan } from "@/api/paymobApi";

interface PaymobCheckoutModalProps {
  open: boolean;
  onClose: () => void;
  iframeUrl: string;
  paymentId: string;
  amountEGP: number;
  /** Omit both for a one-off payment (e.g. a live lesson) that isn't a recurring plan */
  plan?: SubscriptionPlan;
  planDays?: number;
  /** Called when the payment is completed (browser focus returns to this window) */
  onPaymentComplete?: () => void;
}

const PLAN_LABEL_MAP: Record<SubscriptionPlan, string> = {
  Monthly: "planMonthly",
  Quarterly: "planQuarterly",
  Yearly: "planYearly",
};

export default function PaymobCheckoutModal({
  open,
  onClose,
  iframeUrl,
  amountEGP,
  plan,
  planDays,
  onPaymentComplete,
}: PaymobCheckoutModalProps) {
  const { t } = useTranslation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const iframeLoadedRef = useRef(false);

  // Listen for the Paymob postMessage on successful/failed payment
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      // Paymob sends postMessage on completion in some configurations
      if (
        typeof event.data === "object" &&
        event.data !== null &&
        ("success" in event.data || "type" in event.data)
      ) {
        onPaymentComplete?.();
      }
    },
    [onPaymentComplete],
  );

  useEffect(() => {
    if (!open) return;
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [open, handleMessage]);

  // Reset iframe loaded state when modal closes
  useEffect(() => {
    if (!open) {
      iframeLoadedRef.current = false;
    }
  }, [open]);

  const planLabel = plan ? t(PLAN_LABEL_MAP[plan] ?? plan) : undefined;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="p-0 max-w-lg w-full overflow-hidden rounded-2xl"
        style={{ maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                {t("payNow")}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {planLabel ? `${planLabel} — ` : ""}
                {amountEGP.toLocaleString("ar-EG")} {t("currencyEgp")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-2 px-5 py-2 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-800/30">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <p className="text-xs text-emerald-700 dark:text-emerald-300">
            {t("paymobSecurePayment")}
            {planDays ? ` · ${planDays} ${t("days")} ${t("access")}` : ""}
          </p>
        </div>

        {/* Loading overlay (shown while iframe loads) */}
        <div className="relative" style={{ height: "520px" }}>
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-slate-900 z-10 transition-opacity duration-300"
            id="paymob-loading"
            style={{ opacity: 1 }}
          >
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("paymentProcessing")}
            </p>
          </div>

          {iframeUrl && (
            <iframe
              ref={iframeRef}
              src={iframeUrl}
              title={t("payNow")}
              className="w-full h-full border-0"
              allowFullScreen
              onLoad={() => {
                // Hide loading overlay when iframe loads
                const overlay = document.getElementById("paymob-loading");
                if (overlay) overlay.style.opacity = "0";
                setTimeout(() => {
                  if (overlay) overlay.style.display = "none";
                }, 300);
              }}
              sandbox="allow-forms allow-scripts allow-same-origin allow-top-navigation allow-popups allow-popups-to-escape-sandbox"
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {t("poweredByPaymob")}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            {t("cancel")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
