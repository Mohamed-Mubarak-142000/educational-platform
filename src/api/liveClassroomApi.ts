import axiosInstance from "./axiosConfig";

export interface LiveClassroomSession {
  _id: string;
  teacherId: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  studentId: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  subjectId?: {
    _id: string;
    name: string;
    nameAr?: string;
    icon?: string;
  };
  requestId?: string;
  scheduleId?: string;
  roomId: string;
  status: "scheduled" | "active" | "ended" | "cancelled";
  startTime: string;
  endTime?: string;
  scheduledDuration: number;
  actualDuration?: number;
  teacherJoinedAt?: string;
  studentJoinedAt?: string;
  lastActivityAt?: string;
  recordingUrl?: string;
  whiteboardActions: number;
  chatMessages: number;
  connectionQuality?: "excellent" | "good" | "fair" | "poor";
  price?: number;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LiveSessionParticipant {
  _id: string;
  sessionId: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  role: "teacher" | "student";
  joinedAt: string;
  leftAt?: string;
  videoEnabled: boolean;
  audioEnabled: boolean;
  screenSharing: boolean;
  whiteboardDraws: number;
  chatMessagesSent: number;
  disconnections: number;
  sessionDuration?: number;
}

export interface CreateSessionParams {
  teacherId: string;
  studentId: string;
  subjectId?: string;
  requestId?: string;
  scheduleId?: string;
  scheduledDuration: number;
  startTime?: string;
  price?: number;
  paymentId?: string;
}

export interface SessionStats {
  sessionId: string;
  roomId: string;
  status: string;
  duration: {
    scheduled: number;
    actual?: number;
  };
  timestamps: {
    start: string;
    end?: string;
    teacherJoined?: string;
    studentJoined?: string;
  };
  engagement: {
    whiteboardActions: number;
    chatMessages: number;
  };
  participants: Array<{
    user: {
      _id: string;
      name: string;
      profileImage?: string;
    };
    role: string;
    joinedAt: string;
    leftAt?: string;
    duration?: number;
    whiteboardDraws: number;
    chatMessagesSent: number;
    disconnections: number;
  }>;
}

// ────────────── SESSION MANAGEMENT ──────────────

export const createLiveSession = async (
  params: CreateSessionParams,
): Promise<LiveClassroomSession> => {
  const { data } = await axiosInstance.post("/live-classroom/create", params);
  return data;
};

export const getSessionDetails = async (
  identifier: string,
): Promise<{
  session: LiveClassroomSession;
  participants: LiveSessionParticipant[];
}> => {
  const { data } = await axiosInstance.get(
    `/live-classroom/session/${identifier}`,
  );
  return data;
};

export const endSession = async (
  sessionId: string,
): Promise<{ message: string; session: LiveClassroomSession }> => {
  const { data } = await axiosInstance.post(
    `/live-classroom/session/${sessionId}/end`,
  );
  return data;
};

export const canJoinSession = async (
  roomId: string,
): Promise<{
  canJoin: boolean;
  reason?: string;
  startTime?: string;
  status?: string;
  session?: {
    _id: string;
    roomId: string;
    status: string;
    startTime: string;
  };
}> => {
  const { data } = await axiosInstance.get(
    `/live-classroom/can-join/${roomId}`,
  );
  return data;
};

export const getSessionStats = async (
  sessionId: string,
): Promise<SessionStats> => {
  const { data } = await axiosInstance.get(
    `/live-classroom/stats/${sessionId}`,
  );
  return data;
};

// ────────────── TEACHER ROUTES ──────────────

export const getTeacherActiveSessions = async (): Promise<
  LiveClassroomSession[]
> => {
  const { data } = await axiosInstance.get("/live-classroom/teacher/active");
  return data;
};

export const getTeacherSessionHistory = async (
  page = 1,
  limit = 20,
): Promise<{
  sessions: LiveClassroomSession[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> => {
  const { data } = await axiosInstance.get("/live-classroom/teacher/history", {
    params: { page, limit },
  });
  return data;
};

// ────────────── STUDENT ROUTES ──────────────

export const getStudentSessions = async (
  status?: string,
): Promise<LiveClassroomSession[]> => {
  const { data } = await axiosInstance.get("/live-classroom/student/sessions", {
    params: { status },
  });
  return data;
};

// ────────────── ADMIN ROUTES ──────────────

export const getAllSessions = async (
  status?: string,
  page = 1,
  limit = 50,
): Promise<{
  sessions: LiveClassroomSession[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> => {
  const { data } = await axiosInstance.get("/live-classroom/admin/all", {
    params: { status, page, limit },
  });
  return data;
};

// ────────────── HELPER FUNCTIONS ──────────────

export const formatSessionDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

export const getSessionTimeStatus = (
  session: LiveClassroomSession,
): {
  status: "upcoming" | "starting-soon" | "active" | "ended";
  message: string;
} => {
  const now = new Date();
  const startTime = new Date(session.startTime);
  const diffMinutes = (startTime.getTime() - now.getTime()) / (1000 * 60);

  if (session.status === "ended" || session.status === "cancelled") {
    return { status: "ended", message: "Session ended" };
  }

  if (session.status === "active") {
    return { status: "active", message: "Live now" };
  }

  if (diffMinutes > 15) {
    return {
      status: "upcoming",
      message: `Starts in ${Math.round(diffMinutes)} minutes`,
    };
  }

  if (diffMinutes > 0) {
    return { status: "starting-soon", message: "Starting soon" };
  }

  return { status: "starting-soon", message: "Join now" };
};

export const canJoinSessionNow = (session: LiveClassroomSession): boolean => {
  const now = new Date();
  const startTime = new Date(session.startTime);
  const diffMinutes = (now.getTime() - startTime.getTime()) / (1000 * 60);

  // Can join 15 minutes before start time
  return (
    (session.status === "scheduled" || session.status === "active") &&
    diffMinutes >= -15
  );
};
