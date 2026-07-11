import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import * as liveClassroomApi from "@/api/liveClassroomApi";
import webrtcService from "@/services/webrtcService";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  AlertCircle,
  Clock,
  User,
  Book,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export const SessionLobbyPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [canJoin, setCanJoin] = useState(false);
  const [joinReason, setJoinReason] = useState("");

  // Device states
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [hasVideo, setHasVideo] = useState(true);
  const [hasAudio, setHasAudio] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Permission states
  const [cameraPermission, setCameraPermission] = useState<
    "granted" | "denied" | "prompt"
  >("prompt");
  const [micPermission, setMicPermission] = useState<
    "granted" | "denied" | "prompt"
  >("prompt");

  // Connection test
  const [connectionQuality, setConnectionQuality] = useState<
    "good" | "fair" | "poor"
  >("good");

  // Load session
  useEffect(() => {
    if (!roomId || !user) return;

    const loadSession = async () => {
      try {
        const data = await liveClassroomApi.getSessionDetails(roomId);
        setSession(data.session);

        // Check if can join
        const joinCheck = await liveClassroomApi.canJoinSession(roomId);
        setCanJoin(joinCheck.canJoin);
        setJoinReason(joinCheck.reason || "");

        setLoading(false);
      } catch (error: any) {
        console.error("Failed to load session:", error);
        toast.error("Failed to load session");
        navigate("/dashboard");
      }
    };

    loadSession();
  }, [roomId, user, navigate]);

  // Check permissions
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        // Check camera permission
        const cameraResult = await navigator.permissions.query({
          name: "camera" as PermissionName,
        });
        setCameraPermission(cameraResult.state as any);

        // Check microphone permission
        const micResult = await navigator.permissions.query({
          name: "microphone" as PermissionName,
        });
        setMicPermission(micResult.state as any);

        // Listen for permission changes
        cameraResult.onchange = () => {
          setCameraPermission(cameraResult.state as any);
        };
        micResult.onchange = () => {
          setMicPermission(micResult.state as any);
        };
      } catch (error) {
        console.error("Failed to check permissions:", error);
      }
    };

    checkPermissions();
  }, []);

  // Initialize media preview
  useEffect(() => {
    let mounted = true;

    const initializePreview = async () => {
      try {
        const stream = await webrtcService.initializeMedia(true, true);
        if (!mounted) return;

        setLocalStream(stream);

        // Attach to video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Check if we have video and audio
        const videoTracks = stream.getVideoTracks();
        const audioTracks = stream.getAudioTracks();

        setHasVideo(videoTracks.length > 0);
        setHasAudio(audioTracks.length > 0);

        if (videoTracks.length > 0) setCameraPermission("granted");
        if (audioTracks.length > 0) setMicPermission("granted");

        console.log("✅ Preview initialized");
      } catch (error: any) {
        console.error("Failed to initialize preview:", error);

        if (error.name === "NotAllowedError") {
          setCameraPermission("denied");
          setMicPermission("denied");
          toast.error("Camera/microphone access denied");
        } else {
          toast.error("Failed to access camera/microphone");
        }
      }
    };

    initializePreview();

    return () => {
      mounted = false;
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Test connection quality (simple ping test)
  useEffect(() => {
    const testConnection = async () => {
      const start = Date.now();
      try {
        await fetch(
          import.meta.env.VITE_API_URL || "http://localhost:5000/api",
        );
        const latency = Date.now() - start;

        if (latency < 100) {
          setConnectionQuality("good");
        } else if (latency < 300) {
          setConnectionQuality("fair");
        } else {
          setConnectionQuality("poor");
        }
      } catch (error) {
        setConnectionQuality("poor");
      }
    };

    testConnection();
    const interval = setInterval(testConnection, 5000);

    return () => clearInterval(interval);
  }, []);

  // Toggle video
  const handleToggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks[0].enabled = !videoTracks[0].enabled;
        setVideoEnabled(videoTracks[0].enabled);
      }
    }
  };

  // Toggle audio
  const handleToggleAudio = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks[0].enabled = !audioTracks[0].enabled;
        setAudioEnabled(audioTracks[0].enabled);
      }
    }
  };

  // Join session
  const handleJoinSession = () => {
    if (canJoin) {
      // Navigate to live classroom
      navigate(`/live-session/${roomId}`);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading session...</p>
        </div>
      </div>
    );
  }

  const sessionStatus = session
    ? liveClassroomApi.getSessionTimeStatus(session)
    : { status: "ended" as const, message: "Session ended" };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Session Lobby
          </h1>

          {/* Session Info */}
          {session && (
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                {session.teacherId && (
                  <>
                    <User className="w-4 h-4" />
                    <span>Teacher: {session.teacherId.name || "Unknown"}</span>
                  </>
                )}
              </div>

              {session.subjectId && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Book className="w-4 h-4" />
                  <span>{session.subjectId.name}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>
                  {sessionStatus.status === "active"
                    ? "Active now"
                    : sessionStatus.status === "starting-soon"
                      ? `Starting ${formatDistanceToNow(new Date(session.startTime), { addSuffix: true })}`
                      : sessionStatus.status === "upcoming"
                        ? `Starts ${formatDistanceToNow(new Date(session.startTime), { addSuffix: true })}`
                        : "Ended"}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Video Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Camera & Microphone
            </h2>

            {/* Video Preview */}
            <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4 aspect-video">
              {hasVideo && videoEnabled ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <VideoOff className="w-16 h-16 text-gray-500" />
                </div>
              )}

              {/* Controls */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
                <Button
                  variant={audioEnabled ? "default" : "destructive"}
                  size="sm"
                  onClick={handleToggleAudio}
                  disabled={!hasAudio}
                  className="rounded-full w-12 h-12 p-0"
                >
                  {audioEnabled ? (
                    <Mic className="w-5 h-5" />
                  ) : (
                    <MicOff className="w-5 h-5" />
                  )}
                </Button>

                <Button
                  variant={videoEnabled ? "default" : "destructive"}
                  size="sm"
                  onClick={handleToggleVideo}
                  disabled={!hasVideo}
                  className="rounded-full w-12 h-12 p-0"
                >
                  {videoEnabled ? (
                    <Video className="w-5 h-5" />
                  ) : (
                    <VideoOff className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Device Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Camera</span>
                {cameraPermission === "granted" ? (
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="w-4 h-4" />
                    Ready
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                    <XCircle className="w-4 h-4" />
                    {cameraPermission === "denied" ? "Denied" : "Not allowed"}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Microphone
                </span>
                {micPermission === "granted" ? (
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="w-4 h-4" />
                    Ready
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                    <XCircle className="w-4 h-4" />
                    {micPermission === "denied" ? "Denied" : "Not allowed"}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Connection
                </span>
                <span
                  className={`flex items-center gap-1 ${
                    connectionQuality === "good"
                      ? "text-green-600 dark:text-green-400"
                      : connectionQuality === "fair"
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-red-600 dark:text-red-400"
                  }`}
                >
                  <div className="flex gap-0.5">
                    <div className="w-1 h-3 bg-current rounded-sm"></div>
                    <div
                      className={`w-1 h-4 rounded-sm ${
                        connectionQuality === "good" ||
                        connectionQuality === "fair"
                          ? "bg-current"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    ></div>
                    <div
                      className={`w-1 h-5 rounded-sm ${
                        connectionQuality === "good"
                          ? "bg-current"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    ></div>
                  </div>
                  {connectionQuality.charAt(0).toUpperCase() +
                    connectionQuality.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Right: System Check & Join */}
          <div className="space-y-6">
            {/* System Check */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                System Check
              </h2>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {cameraPermission === "granted" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Camera access granted
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {micPermission === "granted" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Microphone access granted
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    WebRTC supported
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {connectionQuality !== "poor" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Network connection stable
                  </span>
                </div>
              </div>
            </div>

            {/* Join Button */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              {!canJoin && (
                <Alert className="mb-4">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{joinReason}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleJoinSession}
                disabled={
                  !canJoin ||
                  cameraPermission === "denied" ||
                  micPermission === "denied"
                }
                size="lg"
                className="w-full"
              >
                {canJoin ? "Join Session" : "Cannot Join Yet"}
              </Button>

              {sessionStatus.status === "upcoming" && (
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-3">
                  You can join 15 minutes before the session starts
                </p>
              )}
            </div>

            {/* Tips */}
            <div className="bg-violet-50 dark:bg-violet-900/20 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-violet-900 dark:text-violet-200 mb-2">
                Tips for a better experience:
              </h3>
              <ul className="text-sm text-violet-800 dark:text-violet-300 space-y-1">
                <li>• Use headphones to avoid echo</li>
                <li>• Ensure good lighting for video</li>
                <li>• Close other applications using camera/mic</li>
                <li>• Use a stable internet connection</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionLobbyPage;
