import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/ToastProvider";
import { Check, Copy, Loader2, ShieldCheck, Upload } from "lucide-react";
import { MANUAL_PAYMENT_METHODS, type ManualPaymentMethod } from "@/lib/paymentMethods";
import {
  uploadManualPaymentProof,
  createManualPaymentRequest,
  getSubscriptionQuote,
  type ManualPaymentRequest,
} from "@/api/manualPaymentApi";
import type { SubscriptionPlan } from "@/api/paymobApi";

export type ManualPaymentTarget =
  | { kind: "liveLesson"; requestId: string; amountEGP: number }
  | {
      kind: "subject" | "unit";
      teacherId: string;
      subjectId: string;
      gradeId: string;
      unitId?: string;
      plan: SubscriptionPlan;
    };

interface ManualPaymentModalProps {
  open: boolean;
  onClose: () => void;
  target: ManualPaymentTarget;
  onSubmitted?: (request: ManualPaymentRequest) => void;
}

export default function ManualPaymentModal({
  open,
  onClose,
  target,
  onSubmitted,
}: ManualPaymentModalProps) {
  const { t } = useTranslation();
  const { pushToast } = useToast();
  const [method, setMethod] = useState<ManualPaymentMethod>("InstaPay");
  const [senderNote, setSenderNote] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState<ManualPaymentRequest | null>(null);

  useEffect(() => {
    if (open) {
      setMethod("InstaPay");
      setSenderNote("");
      setProofFile(null);
      setSubmitted(null);
    }
  }, [open]);

  const isLiveLesson = target.kind === "liveLesson";

  const { data: quote, isLoading: quoteLoading } = useQuery({
    queryKey: [
      "subscription-quote",
      !isLiveLesson ? target.teacherId : null,
      !isLiveLesson ? target.subjectId : null,
      !isLiveLesson ? target.gradeId : null,
      !isLiveLesson ? target.unitId : null,
      !isLiveLesson ? target.plan : null,
    ],
    queryFn: () =>
      getSubscriptionQuote({
        teacherId: (target as Extract<ManualPaymentTarget, { kind: "subject" | "unit" }>).teacherId,
        subjectId: (target as Extract<ManualPaymentTarget, { kind: "subject" | "unit" }>).subjectId,
        gradeId: (target as Extract<ManualPaymentTarget, { kind: "subject" | "unit" }>).gradeId,
        unitId: (target as Extract<ManualPaymentTarget, { kind: "subject" | "unit" }>).unitId,
        subscriptionType: target.kind as "subject" | "unit",
        plan: (target as Extract<ManualPaymentTarget, { kind: "subject" | "unit" }>).plan,
      }),
    enabled: open && !isLiveLesson,
  });

  const amountEGP = isLiveLesson ? target.amountEGP : quote?.amountEGP;

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!proofFile) throw new Error("proof required");
      const { url } = await uploadManualPaymentProof(proofFile);
      if (isLiveLesson) {
        return createManualPaymentRequest({
          method,
          proofUrl: url,
          senderNote: senderNote || undefined,
          liveLessonRequestId: target.requestId,
        });
      }
      return createManualPaymentRequest({
        method,
        proofUrl: url,
        senderNote: senderNote || undefined,
        teacherId: target.teacherId,
        subjectId: target.subjectId,
        gradeId: target.gradeId,
        unitId: target.unitId,
        subscriptionType: target.kind,
        plan: target.plan,
      });
    },
    onSuccess: (request) => {
      setSubmitted(request);
      onSubmitted?.(request);
    },
    onError: (error: any) => {
      pushToast({
        type: "error",
        title: t("requestFailed"),
        description: error.response?.data?.message || t("somethingWentWrong"),
      });
    },
  });

  const selectedMethod = MANUAL_PAYMENT_METHODS.find((m) => m.id === method)!;

  const copyNumber = () => {
    if (!selectedMethod.number) return;
    navigator.clipboard.writeText(selectedMethod.number);
    pushToast({ type: "success", title: t("copied", { defaultValue: "Copied" }) });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("manualPaymentTitle", { defaultValue: "Pay by bank/wallet transfer" })}
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto">
              <Check className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {t("manualPaymentSubmittedTitle", { defaultValue: "Submitted for review" })}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t("manualPaymentSubmittedDesc", {
                  defaultValue:
                    "An admin will review your proof and confirm your payment shortly.",
                })}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-4 py-2 text-sm font-mono">
              {submitted.referenceCode}
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={onClose}>
              {t("close")}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4 flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {t("amountToTransfer", { defaultValue: "Amount to send" })}
              </span>
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {quoteLoading && !isLiveLesson ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  `${amountEGP ?? "—"} ${t("egp")}`
                )}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {MANUAL_PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={`rounded-lg border p-2 text-xs font-semibold text-center transition-all ${
                    method === m.id
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  {t(m.labelKey, { defaultValue: m.defaultLabel })}
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/10 p-4 space-y-2">
              {selectedMethod.number && (
                <div className="flex items-center justify-between">
                  <span dir="ltr" className="font-mono text-lg font-bold text-slate-900 dark:text-slate-100">
                    {selectedMethod.number}
                  </span>
                  <Button variant="outline" size="sm" onClick={copyNumber} className="gap-1.5">
                    <Copy className="w-3.5 h-3.5" />
                    {t("copy", { defaultValue: "Copy" })}
                  </Button>
                </div>
              )}
              <p className="text-xs text-amber-800 dark:text-amber-300">
                {t(selectedMethod.instructionsKey, { defaultValue: selectedMethod.defaultInstructions })}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("paymentProofUpload", { defaultValue: "Payment proof screenshot" })}
              </label>
              <label className="flex items-center gap-2 justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg py-4 cursor-pointer hover:border-blue-400 transition-colors text-sm text-slate-500 dark:text-slate-400">
                <Upload className="w-4 h-4" />
                {proofFile ? proofFile.name : t("chooseFile", { defaultValue: "Choose file" })}
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("senderNoteLabel", { defaultValue: "Sender phone number (optional)" })}
              </label>
              <Textarea
                value={senderNote}
                onChange={(e) => setSenderNote(e.target.value)}
                placeholder={t("senderNotePlaceholder", {
                  defaultValue: "The number you sent from, to help us match your transfer",
                })}
                rows={2}
                className="resize-none"
                maxLength={300}
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              {t("manualPaymentReviewNotice", {
                defaultValue: "Manual payments are reviewed by an admin before access is unlocked.",
              })}
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={onClose} disabled={submitMutation.isPending}>
                {t("cancel")}
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => submitMutation.mutate()}
                disabled={!proofFile || submitMutation.isPending || (!isLiveLesson && !quote)}
              >
                {submitMutation.isPending ? t("sending") : t("submitForReview", { defaultValue: "Submit for review" })}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
