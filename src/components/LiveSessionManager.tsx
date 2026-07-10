import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as liveClassroomApi from "@/api/liveClassroomApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  Clock,
  User,
  Book,
  Calendar,
  CheckCircle2,
  Play,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface SessionCardProps {
  session: any;
  onJoin: (roomId: string) => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, onJoin }) => {
  const { status } = liveClassroomApi.getSessionTimeStatus(session);
  const canJoinNow = liveClassroomApi.canJoinSessionNow(session);

  const statusColors = {
    active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    "starting-soon":
      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    upcoming: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    ended: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-lg">Live Session</CardTitle>
          </div>
          <Badge className={statusColors[status as keyof typeof statusColors]}>
            {status === "starting-soon"
              ? "Starting Soon"
              : status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Student Info */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <User className="w-4 h-4" />
          <span>Student: {session.studentId?.name || "Unknown"}</span>
        </div>

        {/* Subject */}
        {session.subjectId && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Book className="w-4 h-4" />
            <span>{session.subjectId.name}</span>
          </div>
        )}

        {/* Time */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span>
            {status === "active"
              ? "Started " +
                formatDistanceToNow(new Date(session.startTime), {
                  addSuffix: true,
                })
              : "Starts " +
                formatDistanceToNow(new Date(session.startTime), {
                  addSuffix: true,
                })}
          </span>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>
            Duration:{" "}
            {liveClassroomApi.formatSessionDuration(session.scheduledDuration)}
          </span>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => onJoin(session.roomId)}
          disabled={!canJoinNow}
          className="w-full mt-2"
          variant={status === "active" ? "default" : "secondary"}
        >
          {status === "active" ? (
            <>
              <Play className="w-4 h-4 mr-2" />
              Join Now
            </>
          ) : canJoinNow ? (
            <>
              <Play className="w-4 h-4 mr-2" />
              Join Session
            </>
          ) : (
            <>
              <Clock className="w-4 h-4 mr-2" />
              Not Ready Yet
            </>
          )}
        </Button>

        {!canJoinNow && status !== "ended" && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Available 15 min before start time
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export const LiveSessionManager: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();

    // Poll for updates every 30 seconds
    const interval = setInterval(loadSessions, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadSessions = async () => {
    try {
      const data = await liveClassroomApi.getTeacherActiveSessions();
      setSessions(data || []);
    } catch (error: any) {
      console.error("Failed to load sessions:", error);
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = (roomId: string) => {
    navigate(`/live-session/${roomId}/lobby`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Live Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeSessions = sessions.filter(
    (s) =>
      s.status === "active" ||
      liveClassroomApi.getSessionTimeStatus(s).status === "starting-soon",
  );
  const upcomingSessions = sessions.filter(
    (s) =>
      s.status === "scheduled" &&
      liveClassroomApi.getSessionTimeStatus(s).status === "upcoming",
  );

  return (
    <div className="space-y-6">
      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Active & Starting Soon
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSessions.map((session) => (
              <SessionCard
                key={session._id}
                session={session}
                onJoin={handleJoinSession}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Upcoming
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingSessions.map((session) => (
              <SessionCard
                key={session._id}
                session={session}
                onJoin={handleJoinSession}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {sessions.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Live Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No active or upcoming sessions</p>
              <p className="text-sm mt-1">
                Sessions will appear here when students request live lessons
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LiveSessionManager;
