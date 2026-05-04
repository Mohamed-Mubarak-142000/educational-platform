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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  createLiveLessonRequest,
  calculateLessonPrice,
} from "@/api/liveLessonApi";
import { useToast } from "./ui/use-toast";

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

  const estimatedPrice = calculateLessonPrice(
    teacherPricePerHour,
    duration,
    requestType === "instant" ? urgencyLevel : "medium",
  );

  const createRequestMutation = useMutation({
    mutationFn: createLiveLessonRequest,
    onSuccess: (data) => {
      pushToast({
        title: t("requestSent"),
        description: t("liveLessonRequestSentDesc"),
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["my-requests"] });
      onRequestCreated?.(data._id);
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      pushToast({
        title: t("requestFailed"),
        description: error.response?.data?.message || t("somethingWentWrong"),
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setRequestType("scheduled");
    setDuration(60);
    setUrgencyLevel("medium");
    setDescription("");
    setPreferredDateTime("");
  };

  const handleSubmit = () => {
    if (requestType === "scheduled" && !preferredDateTime) {
      pushToast({
        title: t("validationError"),
        description: t("pleaseSelectDateTime"),
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      pushToast({
        title: t("validationError"),
        description: t("pleaseDescribeWhatYouNeedHelp"),
        variant: "destructive",
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

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 2); // Minimum 2 hours from now
    return now.toISOString().slice(0, 16);
  };

  return (
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
                    <Video className="w-5 h-5 text-blue-600" />
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

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Request Type */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t("whenDoYouNeedTheLesson")}
                  </Label>
                  <RadioGroup
                    value={requestType}
                    onValueChange={(value) =>
                      setRequestType(value as RequestType)
                    }
                    className="grid grid-cols-2 gap-3"
                  >
                    <div>
                      <RadioGroupItem
                        value="scheduled"
                        id="scheduled"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="scheduled"
                        className="flex flex-col items-center justify-between rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/80 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 dark:peer-data-[state=checked]:bg-blue-900/20 transition-all"
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
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem
                        value="instant"
                        id="instant"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="instant"
                        className="flex flex-col items-center justify-between rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/80 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 dark:peer-data-[state=checked]:bg-blue-900/20 transition-all"
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
                      </Label>
                    </div>
                  </RadioGroup>
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
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <Select
                      value={urgencyLevel}
                      onValueChange={(value) =>
                        setUrgencyLevel(value as UrgencyLevel)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">
                          {t("urgencyLow")} (+0%)
                        </SelectItem>
                        <SelectItem value="medium">
                          {t("urgencyMedium")} (+0%)
                        </SelectItem>
                        <SelectItem value="high">
                          {t("urgencyHigh")} (+25%)
                        </SelectItem>
                        <SelectItem value="critical">
                          {t("urgencyCritical")} (+50%)
                        </SelectItem>
                      </SelectContent>
                    </Select>
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
                  <Select
                    value={String(duration)}
                    onValueChange={(value) => setDuration(Number(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 {t("minutes")}</SelectItem>
                      <SelectItem value="60">60 {t("minutes")}</SelectItem>
                      <SelectItem value="90">90 {t("minutes")}</SelectItem>
                      <SelectItem value="120">120 {t("minutes")}</SelectItem>
                    </SelectContent>
                  </Select>
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
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {t("estimatedPrice")}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {estimatedPrice} {t("egp")}
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

              {/* Footer */}
              <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between gap-4">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  disabled={createRequestMutation.isPending}
                >
                  {t("cancel")}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createRequestMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {createRequestMutation.isPending
                    ? t("sending")
                    : t("sendRequest")}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
