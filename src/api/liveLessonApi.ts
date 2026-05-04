import axiosInstance from "./axiosConfig";

export interface LiveLessonRequest {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  teacherId: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
    instantLessonPricePerHour?: number;
  };
  subjectId?: {
    _id: string;
    name: string;
    nameAr?: string;
    icon?: string;
  };
  gradeId?: {
    _id: string;
    name: string;
    nameAr?: string;
  };
  requestType: "instant" | "scheduled";
  preferredDateTime?: string;
  duration: number;
  description?: string;
  urgencyLevel: "low" | "medium" | "high" | "critical";
  status:
    | "pending"
    | "matched"
    | "accepted"
    | "declined"
    | "completed"
    | "cancelled"
    | "expired";
  sessionStartTime?: string;
  sessionEndTime?: string;
  meetingLink?: string;
  meetingId?: string;
  meetingPassword?: string;
  priceEGP: number;
  paymentId?: string;
  paymentStatus: "pending" | "paid" | "refunded" | "failed";
  studentNotes?: string;
  teacherNotes?: string;
  declineReason?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LiveSession {
  _id: string;
  requestId?: string;
  scheduleId?: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  teacherId: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  subjectId: {
    _id: string;
    name: string;
    nameAr?: string;
    icon?: string;
  };
  gradeId?: {
    _id: string;
    name: string;
    nameAr?: string;
  };
  startTime: string;
  endTime: string;
  actualDuration?: number;
  scheduledDuration: number;
  meetingLink: string;
  meetingId?: string;
  meetingPassword?: string;
  recordingUrl?: string;
  status: "scheduled" | "active" | "completed" | "cancelled" | "no-show";
  studentRating?: number;
  teacherRating?: number;
  studentFeedback?: string;
  teacherFeedback?: string;
  finalPrice: number;
  paymentId?: string;
  sessionNotes?: string;
  studentJoinedAt?: string;
  teacherJoinedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLiveLessonRequestParams {
  teacherId: string;
  subjectId?: string;
  gradeId?: string;
  requestType: "instant" | "scheduled";
  preferredDateTime?: string;
  duration: number;
  description?: string;
  urgencyLevel?: "low" | "medium" | "high" | "critical";
}

export interface TeacherAvailability {
  isAvailableForInstantLessons: boolean;
  instantLessonPricePerHour: number;
  maxConcurrentSessions: number;
  onlineStatus: "online" | "offline" | "busy" | "away";
}

// ────────────── STUDENT API CALLS ──────────────

export const createLiveLessonRequest = async (
  params: CreateLiveLessonRequestParams,
): Promise<LiveLessonRequest> => {
  const { data } = await axiosInstance.post("/live-lessons/request", params);
  return data;
};

export const getMyRequests = async (
  status?: string,
): Promise<LiveLessonRequest[]> => {
  const { data } = await axiosInstance.get("/live-lessons/my-requests", {
    params: { status },
  });
  return data;
};

export const cancelRequest = async (
  requestId: string,
): Promise<{ message: string }> => {
  const { data } = await axiosInstance.delete(
    `/live-lessons/requests/${requestId}`,
  );
  return data;
};

export const getMySessions = async (
  status?: string,
): Promise<LiveSession[]> => {
  const { data } = await axiosInstance.get("/live-lessons/my-sessions", {
    params: { status },
  });
  return data;
};

// ────────────── TEACHER API CALLS ──────────────

export const getPendingRequests = async (): Promise<LiveLessonRequest[]> => {
  const { data } = await axiosInstance.get("/live-lessons/pending-requests");
  return data;
};

export const acceptRequest = async (
  requestId: string,
  params?: { proposedStartTime?: string; sessionNotes?: string },
): Promise<LiveSession> => {
  const { data } = await axiosInstance.post(
    `/live-lessons/requests/${requestId}/accept`,
    params,
  );
  return data;
};

export const declineRequest = async (
  requestId: string,
  reason?: string,
): Promise<{ message: string }> => {
  const { data } = await axiosInstance.post(
    `/live-lessons/requests/${requestId}/decline`,
    { reason },
  );
  return data;
};

export const updateTeacherAvailability = async (
  params: Partial<TeacherAvailability>,
): Promise<TeacherAvailability> => {
  const { data } = await axiosInstance.patch(
    "/live-lessons/teacher/availability",
    params,
  );
  return data;
};

export const getTeacherSessions = async (
  status?: string,
): Promise<LiveSession[]> => {
  const { data } = await axiosInstance.get("/live-lessons/teacher/sessions", {
    params: { status },
  });
  return data;
};

// ────────────── SHARED API CALLS ──────────────

export const getSessionDetails = async (
  sessionId: string,
): Promise<LiveSession> => {
  const { data } = await axiosInstance.get(
    `/live-lessons/sessions/${sessionId}`,
  );
  return data;
};

export const rateSession = async (
  sessionId: string,
  rating: number,
  feedback?: string,
): Promise<{ message: string }> => {
  const { data } = await axiosInstance.post(
    `/live-lessons/sessions/${sessionId}/rate`,
    {
      rating,
      feedback,
    },
  );
  return data;
};

// ────────────── ADMIN API CALLS ──────────────

export const getAllRequests = async (): Promise<LiveLessonRequest[]> => {
  const { data } = await axiosInstance.get("/live-lessons/admin/all-requests");
  return data;
};

export const getAllSessions = async (): Promise<LiveSession[]> => {
  const { data } = await axiosInstance.get("/live-lessons/admin/all-sessions");
  return data;
};

// ────────────── HELPER FUNCTIONS ──────────────

export const calculateLessonPrice = (
  pricePerHour: number,
  durationMinutes: number,
  urgencyLevel: "low" | "medium" | "high" | "critical" = "medium",
): number => {
  const durationHours = durationMinutes / 60;
  let price = pricePerHour * durationHours;

  // Surge pricing
  if (urgencyLevel === "critical") {
    price *= 1.5;
  } else if (urgencyLevel === "high") {
    price *= 1.25;
  }

  return Math.round(price);
};

export const formatSessionTime = (
  startTime: string,
  endTime: string,
): string => {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return `${formatTime(start)} - ${formatTime(end)}`;
};

export const getSessionDuration = (
  startTime: string,
  endTime: string,
): number => {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  return Math.round((end - start) / (1000 * 60)); // Minutes
};

export const isSessionUpcoming = (session: LiveSession): boolean => {
  return (
    session.status === "scheduled" && new Date(session.startTime) > new Date()
  );
};

export const isSessionActive = (session: LiveSession): boolean => {
  const now = new Date();
  const start = new Date(session.startTime);
  const end = new Date(session.endTime);
  return session.status === "active" || (now >= start && now <= end);
};
