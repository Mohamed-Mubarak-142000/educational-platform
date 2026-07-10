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
  Play,
  CheckCircle2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface StudentSessionCardProps {
  session: any;
  onJoin: (roomId: string) => void;
}

const StudentSessionCard: React.FC<StudentSessionCardProps> = ({
  session,
  onJoin,
}) => {
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
            <CardTitle className="text-lg">Live Lesson</CardTitle>
          </div>
          <Badge className={statusColors[status as keyof typeof statusColors]}>
            {status === "starting-soon"
              ? "Starting Soon"
              : status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Teacher Info */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <User className="w-4 h-4" />
          <span>Teacher: {session.teacherId?.name || "Unknown"}</span>
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
        {status === "active" && (
          <div className="pt-2">
            <Button
              onClick={() => onJoin(session.roomId)}
              className="w-full"
              variant="default"
              size="lg"
            >
              <Play className="w-5 h-5 mr-2 animate-pulse" />
              Join Now - Session is Active!
            </Button>
          </div>
        )}

        {status === "starting-soon" && canJoinNow && (
          <div className="pt-2">
            <Button
              onClick={() => onJoin(session.roomId)}
              className="w-full"
              variant="secondary"
            >
              <Play className="w-4 h-4 mr-2" />
              Join Session
            </Button>
          </div>
        )}

        {status === "upcoming" && (
          <div className="pt-2">
            <Button disabled className="w-full" variant="ghost">
              <Clock className="w-4 h-4 mr-2" />
              Not Ready Yet
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              Available 15 min before start time
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const StudentLiveSessions: React.FC = () => {
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
      const data = await liveClassroomApi.getStudentSessions();
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
            My Live Lessons
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
      {/* Active Sessions - PRIORITY */}
      {activeSessions.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-lg border-2 border-green-300 dark:border-green-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 animate-pulse" />
            Active Lessons - Join Now!
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {activeSessions.map((session) => (
              <StudentSessionCard
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
            Upcoming Lessons
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingSessions.map((session) => (
              <StudentSessionCard
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
              My Live Lessons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No scheduled live lessons</p>
              <p className="text-sm mt-1">
                Request a live lesson from your teacher's profile
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentLiveSessions;
