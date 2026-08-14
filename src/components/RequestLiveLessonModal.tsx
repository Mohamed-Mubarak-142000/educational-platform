import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  X,
  Clock,
  Calendar,
  AlertCircle,
  Video,
  DollarSign,
  Landmark,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  createLiveLessonRequest,
  calculateLessonPrice,
} from "@/api/liveLessonApi";
import ManualPaymentModal from "./ManualPaymentModal";
import { useToast } from "./ui/ToastProvider";

interface RequestLiveLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId: string;
  teacherName: string;
  teacherPricePerHour: number;
  subjectId?: string;
  subjectName?: string;
  gradeId?: string;
  onRequestCreated?: (requestId: string) => void;
}

type RequestType = "instant" | "scheduled";
type UrgencyLevel = "low" | "medium" | "high" | "critical";

const DURATIONS = [30, 60, 90, 120];

export default function RequestLiveLessonModal({
  isOpen,
  onClose,
  teacherId,
  teacherName,
  teacherPricePerHour,
  subjectId,
  subjectName,
  gradeId,
  onRequestCreated,
}: RequestLiveLessonModalProps) {
  const { t } = useTranslation();
  const { pushToast } = useToast();
  const queryClient = useQueryClient();

  const [requestType, setRequestType] = useState<RequestType>("scheduled");
  const [duration, setDuration] = useState(60);
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel>("medium");
  const [description, setDescription] = useState("");
  const [preferredDateTime, setPreferredDateTime] = useState("");

  // Payment step — shown once the request has been created and is awaiting payment.
  const [createdRequest, setCreatedRequest] = useState<{
    id: string;
    priceEGP: number;
  } | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualSubmitted, setManualSubmitted] = useState(false);

  const estimatedPrice = calculateLessonPrice(
    teacherPricePerHour,
    duration,
    requestType === "instant" ? urgencyLevel : "medium",
  );

  const createRequestMutation = useMutation({
    mutationFn: createLiveLessonRequest,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["my-requests"] });
      onRequestCreated?.(data._id);
      // The request now exists but isn't confirmed until it's paid for —
      // let the student choose how to pay next.
      setCreatedRequest({ id: data._id, priceEGP: data.priceEGP });
    },
    onError: (error: any) => {
      pushToast({
        title: t("requestFailed"),
        description: error.response?.data?.message || t("somethingWentWrong"),
        type: "error",
      });
    },
  });

  const resetForm = () => {
    setRequestType("scheduled");
    setDuration(60);
    setUrgencyLevel("medium");
    setDescription("");
    setPreferredDateTime("");
    setCreatedRequest(null);
    setManualOpen(false);
    setManualSubmitted(false);
  };

  const handleSubmit = () => {
    if (requestType === "scheduled" && !preferredDateTime) {
      pushToast({
        title: t("validationError"),
        description: t("pleaseSelectDateTime"),
        type: "error",
      });
      return;
    }

    if (!description.trim()) {
      pushToast({
        title: t("validationError"),
        description: t("pleaseDescribeWhatYouNeedHelp"),
        type: "error",
      });
      return;
    }

    createRequestMutation.mutate({
      teacherId,
      subjectId,
      gradeId,
      requestType,
      duration,
      description,
      urgencyLevel: requestType === "instant" ? urgencyLevel : "medium",
      preferredDateTime:
        requestType === "scheduled" ? preferredDateTime : undefined,
    });
  };

  const handleManualSubmitted = () => {
    queryClient.invalidateQueries({ queryKey: ["my-requests"] });
    setManualSubmitted(true);
  };

  const handleManualClose = () => {
    setManualOpen(false);
    if (manualSubmitted) {
      onClose();
      resetForm();
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 2); // Minimum 2 hours from now
    return now.toISOString().slice(0, 16);
  };

  const isSubmitting = createRequestMutation.isPending;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Video className="w-5 h-5 text-violet-600" />
                      {t("requestLiveLesson")}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {t("with")} {teacherName}
                      {subjectName && ` • ${subjectName}`}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {createdRequest ? (
                  <div className="p-6 space-y-6">
                    <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg p-4 flex items-center justify-between">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {t("amountToPay", { defaultValue: "Amount to pay" })}
                      </span>
                      <span className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                        {createdRequest.priceEGP} {t("currencyEgp")}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {t("choosePaymentMethodDesc", {
                        defaultValue: "Your request is saved — confirm it by paying via bank/wallet transfer.",
                      })}
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        type="button"
                        onClick={() => setManualOpen(true)}
                        className="flex items-center gap-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 p-4 text-left hover:border-violet-400 transition-all"
                      >
                        <Landmark className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {t("payManually", { defaultValue: "InstaPay / Vodafone Cash / Fawry" })}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {t("payManuallyDesc", { defaultValue: "Reviewed by an admin before confirmation" })}
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                ) : (
                <div className="p-6 space-y-6">
                  {/* Request Type */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {t("whenDoYouNeedTheLesson")}
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        aria-pressed={requestType === "scheduled"}
                        onClick={() => setRequestType("scheduled")}
                        className={`flex flex-col items-center justify-between rounded-lg border-2 p-4 transition-all ${
                          requestType === "scheduled"
                            ? "border-violet-600 bg-violet-50 dark:bg-violet-900/20"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80"
                        }`}
                      >
                        <Calendar className="w-6 h-6 mb-2 text-slate-600 dark:text-slate-400" />
                        <div className="text-center">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {t("scheduleLater")}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {t("pickDateTime")}
                          </div>
                        </div>
                      </button>
                      <button
                        type="button"
                        aria-pressed={requestType === "instant"}
                        onClick={() => setRequestType("instant")}
                        className={`flex flex-col items-center justify-between rounded-lg border-2 p-4 transition-all ${
                          requestType === "instant"
                            ? "border-violet-600 bg-violet-50 dark:bg-violet-900/20"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80"
                        }`}
                      >
                        <Clock className="w-6 h-6 mb-2 text-slate-600 dark:text-slate-400" />
                        <div className="text-center">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {t("instantAsap")}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {t("asap")}
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* DateTime Picker (scheduled) */}
                  {requestType === "scheduled" && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="datetime"
                        className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                      >
                        {t("preferredDateTime")}
                      </Label>
                      <input
                        type="datetime-local"
                        id="datetime"
                        value={preferredDateTime}
                        onChange={(e) => setPreferredDateTime(e.target.value)}
                        min={getMinDateTime()}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  )}

                  {/* Urgency Level (instant) */}
                  {requestType === "instant" && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="urgency"
                        className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                      >
                        {t("urgencyLevel")}
                      </Label>
                      <select
                        id="urgency"
                        value={urgencyLevel}
                        onChange={(e) =>
                          setUrgencyLevel(e.target.value as UrgencyLevel)
                        }
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      >
                        <option value="low">{t("urgencyLow")} (+0%)</option>
                        <option value="medium">{t("urgencyMedium")} (+0%)</option>
                        <option value="high">{t("urgencyHigh")} (+25%)</option>
                        <option value="critical">
                          {t("urgencyCritical")} (+50%)
                        </option>
                      </select>
                    </div>
                  )}

                  {/* Duration */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="duration"
                      className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                    >
                      {t("lessonDuration")}
                    </Label>
                    <select
                      id="duration"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      {DURATIONS.map((mins) => (
                        <option key={mins} value={mins}>
                          {mins} {t("minutes")}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                    >
                      {t("whatDoYouNeedHelpWith")}
                    </Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t("describeTopicsOrQuestions")}
                      rows={4}
                      className="resize-none"
                      maxLength={500}
                    />
                    <div className="text-xs text-slate-400 dark:text-slate-500 text-right">
                      {description.length}/500
                    </div>
                  </div>

                  {/* Price Estimate */}
                  <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {t("estimatedPrice")}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                        {estimatedPrice} {t("currencyEgp")}
                      </div>
                    </div>
                    {requestType === "instant" && urgencyLevel !== "medium" && (
                      <div className="flex items-start gap-2 mt-2 text-xs text-slate-600 dark:text-slate-400">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{t("surgePricingAppliedForUrgency")}</span>
                      </div>
                    )}
                  </div>
                </div>
                )}

                {/* Footer */}
                {!createdRequest && (
                <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between gap-4">
                  <Button
                    variant="ghost"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    {isSubmitting ? t("sending") : t("sendRequest")}
                  </Button>
                </div>
                )}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {createdRequest && (
        <ManualPaymentModal
          open={manualOpen}
          onClose={handleManualClose}
          target={{
            kind: "liveLesson",
            requestId: createdRequest.id,
            amountEGP: createdRequest.priceEGP,
          }}
          onSubmitted={handleManualSubmitted}
        />
      )}
    </>
  );
}
