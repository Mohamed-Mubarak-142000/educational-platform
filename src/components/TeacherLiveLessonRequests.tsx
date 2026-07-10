import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Clock,
  Calendar,
  User,
  BookOpen,
  Check,
  X,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  DollarSign,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import {
  getPendingRequests,
  acceptRequest,
  declineRequest,
  type LiveLessonRequest,
} from "@/api/liveLessonApi";
import { useToast } from "./ui/ToastProvider";

export default function TeacherLiveLessonRequests() {
  const { t } = useTranslation();
  const { pushToast } = useToast();
  const queryClient = useQueryClient();

  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [proposedTime, setProposedTime] = useState("");

  const { data: requests, isLoading } = useQuery({
    queryKey: ["pending-requests"],
    queryFn: getPendingRequests,
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const acceptMutation = useMutation({
    mutationFn: ({
      requestId,
      proposedStartTime,
    }: {
      requestId: string;
      proposedStartTime?: string;
    }) => acceptRequest(requestId, { proposedStartTime }),
    onSuccess: () => {
      pushToast({
        title: t("requestAccepted"),
        description: t("liveLessonScheduledSuccessfully"),
        type: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["pending-requests"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-sessions"] });
      setExpandedRequest(null);
      setProposedTime("");
    },
    onError: (error: any) => {
      pushToast({
        title: t("acceptFailed"),
        description: error.response?.data?.message || t("somethingWentWrong"),
        type: "error",
      });
    },
  });

  const declineMutation = useMutation({
    mutationFn: ({
      requestId,
      reason,
    }: {
      requestId: string;
      reason?: string;
    }) => declineRequest(requestId, reason),
    onSuccess: () => {
      pushToast({
        title: t("requestDeclined"),
        description: t("studentWillBeNotified"),
        type: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["pending-requests"] });
      setExpandedRequest(null);
      setDeclineReason("");
    },
    onError: (error: any) => {
      pushToast({
        title: t("declineFailed"),
        description: error.response?.data?.message || t("somethingWentWrong"),
        type: "error",
      });
    },
  });

  const handleAccept = (requestId: string) => {
    acceptMutation.mutate({
      requestId,
      proposedStartTime: proposedTime || undefined,
    });
  };

  const handleDecline = (requestId: string) => {
    if (!declineReason.trim()) {
      pushToast({
        title: t("reasonRequired"),
        description: t("pleaseProvideDeclineReason"),
        type: "error",
      });
      return;
    }
    declineMutation.mutate({ requestId, reason: declineReason });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300 border-red-200 dark:border-red-800";
      case "high":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300 border-orange-200 dark:border-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
      default:
        return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return t("justNow");
    if (diffMins < 60) return t("minutesAgo", { count: diffMins });
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return t("hoursAgo", { count: diffHours });
    const diffDays = Math.floor(diffHours / 24);
    return t("daysAgo", { count: diffDays });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 animate-pulse"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="text-center py-12">
        <Video className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {t("noPendingRequests")}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("newRequestsWillAppearHere")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {requests.map((request: LiveLessonRequest) => {
          const isExpanded = expandedRequest === request._id;
          const isPending =
            acceptMutation.isPending || declineMutation.isPending;

          return (
            <motion.div
              key={request._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div
                className="p-4 cursor-pointer"
                onClick={() =>
                  setExpandedRequest(isExpanded ? null : request._id)
                }
              >
                <div className="flex items-start gap-4">
                  {/* Student Avatar */}
                  <div className="flex-shrink-0">
                    {request.studentId.profileImage ? (
                      <img
                        src={request.studentId.profileImage}
                        alt={request.studentId.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                        {request.studentId.name}
                      </h4>
                      <Badge className={getUrgencyColor(request.urgencyLevel)}>
                        {t(
                          `urgency${request.urgencyLevel.charAt(0).toUpperCase() + request.urgencyLevel.slice(1)}`,
                        )}
                      </Badge>
                      {request.requestType === "instant" && (
                        <Badge
                          variant="outline"
                          className="border-orange-500 text-orange-600 dark:text-orange-400"
                        >
                          {t("instant")}
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                      {request.subjectId && (
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{request.subjectId.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {request.duration} {t("minutes")}
                        </span>
                      </div>
                      {request.requestType === "scheduled" &&
                        request.preferredDateTime && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(
                                request.preferredDateTime,
                              ).toLocaleString()}
                            </span>
                          </div>
                        )}
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {request.priceEGP} {t("egp")}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      {formatTimeAgo(request.createdAt)}
                    </p>
                  </div>

                  {/* Expand Icon */}
                  <div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-200 dark:border-slate-800"
                  >
                    <div className="p-4 space-y-4 bg-slate-50 dark:bg-slate-800/50">
                      {/* Description */}
                      {request.description && (
                        <div>
                          <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {t("studentNeeds")}
                          </h5>
                          <p className="text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded-lg">
                            {request.description}
                          </p>
                        </div>
                      )}

                      {/* Payment Status */}
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {t("paymentStatus")}:
                        </h5>
                        <Badge
                          variant={
                            request.paymentStatus === "paid"
                              ? "default"
                              : "outline"
                          }
                          className={
                            request.paymentStatus === "paid"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                              : ""
                          }
                        >
                          {t(
                            `payment${request.paymentStatus.charAt(0).toUpperCase() + request.paymentStatus.slice(1)}`,
                          )}
                        </Badge>
                      </div>

                      {/* Propose Time (for scheduled) */}
                      {request.requestType === "scheduled" && (
                        <div>
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                            {t("proposeAlternativeTime")} ({t("optional")})
                          </label>
                          <input
                            type="datetime-local"
                            value={proposedTime}
                            onChange={(e) => setProposedTime(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm"
                          />
                        </div>
                      )}

                      {/* Decline Reason */}
                      {request.paymentStatus === "paid" && (
                        <div>
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                            {t("declineReason")} ({t("required")})
                          </label>
                          <Textarea
                            value={declineReason}
                            onChange={(e) => setDeclineReason(e.target.value)}
                            placeholder={t("explainWhyYouCantTakeThisSession")}
                            rows={2}
                            className="resize-none text-sm"
                          />
                        </div>
                      )}

                      {/* Payment Warning */}
                      {request.paymentStatus !== "paid" && (
                        <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            {t("paymentNotYetConfirmed")}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-3 pt-2">
                        <Button
                          onClick={() => handleAccept(request._id)}
                          disabled={
                            isPending || request.paymentStatus !== "paid"
                          }
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          {t("acceptRequest")}
                        </Button>
                        <Button
                          onClick={() => handleDecline(request._id)}
                          disabled={isPending}
                          variant="outline"
                          className="flex-1 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          <X className="w-4 h-4 mr-2" />
                          {t("decline")}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
