import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import socketService from "@/services/socketService";
import webrtcService from "@/services/webrtcService";
import * as liveClassroomApi from "@/api/liveClassroomApi";
import { VideoStream } from "@/components/VideoStream";
import { LiveChatPanel, type ChatMessage } from "@/components/LiveChatPanel";
import {
  CollaborativeWhiteboard,
  type CollaborativeWhiteboardHandle,
} from "@/components/CollaborativeWhiteboard";
import { type DrawAction } from "@/hooks/useWhiteboard";
import { Button } from "@/components/ui/button";
import { PhoneOff, Clock, Book, Maximize2, Minimize2 } from "lucide-react";
import { toast } from "sonner";

interface Participant {
  socketId: string;
  userId: string;
  name: string;
  role: "teacher" | "student";
  videoEnabled: boolean;
  audioEnabled: boolean;
  screenSharing: boolean;
}

export const LiveClassroomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Session state
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  // Media states
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Remote peer states
  const [remotePeerAudio, setRemotePeerAudio] = useState(true);
  const [remotePeerVideo, setRemotePeerVideo] = useState(true);
  const [remotePeerScreen, setRemotePeerScreen] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // UI state
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");

  // Refs
  const whiteboardRef = useRef<CollaborativeWhiteboardHandle>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const isInitiator = useRef(false);

  // Load session details
  useEffect(() => {
    if (!roomId || !user) return;

    const loadSession = async () => {
      try {
        const data = await liveClassroomApi.getSessionDetails(roomId);
        setSession(data.session);

        // Check if user can join
        const canJoin = await liveClassroomApi.canJoinSession(roomId);
        if (!canJoin.canJoin) {
          toast.error(canJoin.reason || "Cannot join session");
          navigate("/dashboard");
          return;
        }

        setLoading(false);
      } catch (error: any) {
        console.error("Failed to load session:", error);
        toast.error(error.response?.data?.message || "Failed to load session");
        navigate("/dashboard");
      }
    };

    loadSession();
  }, [roomId, user, navigate]);

  // Initialize media and join room
  useEffect(() => {
    if (!roomId || !user || loading || !session) return;

    let mounted = true;

    const initialize = async () => {
      try {
        // Connect to Socket.IO
        await socketService.connect();
        console.log("✅ Connected to Socket.IO");

        // Initialize local media
        const stream = await webrtcService.initializeMedia(true, true);
        if (!mounted) return;

        setLocalStream(stream);
        console.log("✅ Local media initialized");

        // Join room — the server resolves the real identity from the JWT
        // itself, this payload is only used for local display fallbacks.
        socketService.joinRoom(roomId, {
          userId: user._id,
          name: user.name ?? "User",
          role: user.role === "Teacher" ? "teacher" : "student",
        });

        setConnectionStatus("connected");
      } catch (error: any) {
        console.error("Failed to initialize:", error);
        toast.error(
          "Failed to initialize media. Please check camera/microphone permissions.",
        );
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [roomId, user, loading, session]);

  // Setup Socket.IO event listeners
  useEffect(() => {
    if (!roomId || !user) return;

    // Room joined
    socketService.on("room-joined", (data: any) => {
      console.log("✅ Room joined:", data);
      setParticipants(data.participants || []);

      // Add system message
      setChatMessages((prev) => [
        ...prev,
        {
          id: `system-${Date.now()}`,
          userId: "system",
          userName: "System",
          message: "You joined the session",
          timestamp: new Date(),
          type: "system",
        },
      ]);
    });

    // User connected
    socketService.on("user-connected", async (data: any) => {
      console.log("👤 User connected:", data);
      setParticipants(data.participants || []);

      // Add system message
      setChatMessages((prev) => [
        ...prev,
        {
          id: `system-${Date.now()}`,
          userId: "system",
          userName: "System",
          message: `${data.user.name} joined the session`,
          timestamp: new Date(),
          type: "system",
        },
      ]);

      // If we're the first one, we become the initiator
      if (
        data.participants &&
        data.participants.length === 2 &&
        !peerConnectionRef.current
      ) {
        isInitiator.current = true;
        await setupPeerConnection(data.socketId);
      }
    });

    // User disconnected
    socketService.on("user-disconnected", (data: any) => {
      console.log("👤 User disconnected:", data);
      setParticipants((prev) =>
        prev.filter((p) => p.socketId !== data.socketId),
      );

      setChatMessages((prev) => [
        ...prev,
        {
          id: `system-${Date.now()}`,
          userId: "system",
          userName: "System",
          message: `${data.user?.name || "A user"} left the session`,
          timestamp: new Date(),
          type: "system",
        },
      ]);

      // Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
        setRemoteStream(null);
      }
    });

    // WebRTC signaling
    socketService.on("offer", async (data: any) => {
      console.log("📞 Received offer from:", data.from);
      if (!peerConnectionRef.current) {
        await setupPeerConnection(data.from);
      }
      const answer = await webrtcService.handleOffer(data.signal);
      socketService.sendAnswer(data.from, answer);
    });

    socketService.on("answer", async (data: any) => {
      console.log("📞 Received answer from:", data.from);
      await webrtcService.handleAnswer(data.signal);
    });

    socketService.on("ice-candidate", async (data: any) => {
      console.log("🧊 Received ICE candidate");
      await webrtcService.addIceCandidate(data.signal);
    });

    // Whiteboard
    socketService.on("whiteboard-draw", (data: any) => {
      console.log("🎨 Received whiteboard action");
      if (whiteboardRef.current?.drawRemoteAction) {
        whiteboardRef.current.drawRemoteAction(data);
      }
    });

    // Chat
    socketService.on("chat-message", (data: any) => {
      console.log("💬 Received chat message:", data);
      setChatMessages((prev) => [
        ...prev,
        {
          id: data.id || `msg-${Date.now()}`,
          userId: data.userId,
          userName: data.userName,
          message: data.message,
          timestamp: new Date(data.timestamp),
          type: "user",
        },
      ]);
    });

    // Media toggle
    socketService.on("peer-media-toggle", (data: any) => {
      console.log("🎥 Peer media toggle:", data);
      if (data.type === "audio") {
        setRemotePeerAudio(data.enabled);
      } else if (data.type === "video") {
        setRemotePeerVideo(data.enabled);
      } else if (data.type === "screen") {
        setRemotePeerScreen(data.enabled);
      }
    });

    // Session ended
    socketService.on("session-ended", (data: any) => {
      console.log("🔚 Session ended:", data);
      toast.info(
        `Session ended by ${data.endedBy === "teacher" ? "teacher" : "inactivity"}`,
      );
      cleanup();
      navigate("/dashboard");
    });

    // Error
    socketService.on("error", (data: any) => {
      console.error("❌ Socket error:", data);
      toast.error(data.message || "An error occurred");
    });

    return () => {
      socketService.off("room-joined");
      socketService.off("user-connected");
      socketService.off("user-disconnected");
      socketService.off("offer");
      socketService.off("answer");
      socketService.off("ice-candidate");
      socketService.off("whiteboard-draw");
      socketService.off("chat-message");
      socketService.off("peer-media-toggle");
      socketService.off("session-ended");
      socketService.off("error");
    };
  }, [roomId, user, navigate]);

  // Setup peer connection
  const setupPeerConnection = async (targetSocketId: string) => {
    try {
      const pc = webrtcService.createPeerConnection(
        // onIceCandidate
        (candidate) => {
          console.log("🧊 Sending ICE candidate");
          socketService.sendIceCandidate(roomId!, candidate, targetSocketId);
        },
        // onTrack
        (stream) => {
          console.log("🎥 Received remote stream");
          setRemoteStream(stream);
        },
        // onConnectionStateChange
        (state) => {
          console.log("🔗 Connection state:", state);
          if (state === "connected") {
            setConnectionStatus("connected");
            toast.success("Connected to peer");
          } else if (state === "disconnected" || state === "failed") {
            setConnectionStatus("disconnected");
            toast.error("Connection lost. Attempting to reconnect...");
          }
        },
      );

      peerConnectionRef.current = pc;

      // If initiator, create offer
      if (isInitiator.current) {
        console.log("📞 Creating offer...");
        const offer = await webrtcService.createOffer();
        socketService.sendOffer(roomId!, offer, targetSocketId);
      }
    } catch (error) {
      console.error("Failed to setup peer connection:", error);
      toast.error("Failed to establish connection");
    }
  };

  // Session timer
  useEffect(() => {
    if (!session?.startTime) return;

    const interval = setInterval(() => {
      const start = new Date(session.startTime).getTime();
      const now = Date.now();
      const duration = Math.floor((now - start) / 1000 / 60); // minutes
      setSessionDuration(duration);
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  // Media controls
  const handleToggleAudio = useCallback(() => {
    const enabled = webrtcService.toggleAudio(!isAudioEnabled);
    setIsAudioEnabled(enabled);
    socketService.toggleMedia(roomId!, user!._id, "audio", enabled);
  }, [isAudioEnabled, roomId, user]);

  const handleToggleVideo = useCallback(() => {
    const enabled = webrtcService.toggleVideo(!isVideoEnabled);
    setIsVideoEnabled(enabled);
    socketService.toggleMedia(roomId!, user!._id, "video", enabled);
  }, [isVideoEnabled, roomId, user]);

  const handleToggleScreen = useCallback(async () => {
    try {
      if (isScreenSharing) {
        await webrtcService.stopScreenShare();
        setIsScreenSharing(false);
        socketService.toggleMedia(roomId!, user!._id, "screen", false);
        toast.success("Screen sharing stopped");
      } else {
        const stream = await webrtcService.startScreenShare();
        setIsScreenSharing(true);
        socketService.toggleMedia(roomId!, user!._id, "screen", true);
        toast.success("Screen sharing started");

        // Listen for screen share stop (user clicked browser stop button)
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          socketService.toggleMedia(roomId!, user!._id, "screen", false);
        };
      }
    } catch (error: any) {
      console.error("Screen share error:", error);
      toast.error("Failed to share screen");
    }
  }, [isScreenSharing, roomId, user]);

  // Whiteboard handler
  const handleWhiteboardDraw = useCallback(
    (action: DrawAction) => {
      socketService.sendWhiteboardAction(roomId!, "draw", action, user!._id);
    },
    [roomId, user],
  );

  // Chat handler
  const handleSendMessage = useCallback(
    (message: string) => {
      const userName = user!.name ?? "User";
      const chatMsg: ChatMessage = {
        id: `msg-${Date.now()}-${user!._id}`,
        message,
        userId: user!._id,
        userName,
        timestamp: new Date(),
        type: "user",
      };

      socketService.sendChatMessage(roomId!, message, user!._id, userName);

      // Add to local state immediately
      setChatMessages((prev) => [...prev, chatMsg]);
    },
    [roomId, user],
  );

  // End session (teacher only)
  const handleEndSession = async () => {
    if (!user || user.role !== "Teacher") return;

    try {
      await liveClassroomApi.endSession(session._id);
      socketService.endSession(roomId!, user._id);
      toast.success("Session ended");
      cleanup();
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Failed to end session:", error);
      toast.error("Failed to end session");
    }
  };

  // Leave session (student)
  const handleLeaveSession = () => {
    cleanup();
    navigate("/dashboard");
  };

  // Cleanup
  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    webrtcService.close();
    socketService.leaveRoom(roomId!);
    socketService.disconnect();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading classroom...
          </p>
        </div>
      </div>
    );
  }

  const isTeacher = user?.role === "Teacher";
  const remotePeer = participants.find((p) => p.userId !== user?._id);

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="font-mono text-lg font-semibold text-gray-900 dark:text-white">
              {Math.floor(sessionDuration / 60)
                .toString()
                .padStart(2, "0")}
              :{(sessionDuration % 60).toString().padStart(2, "0")}
            </span>
          </div>

          {session?.subjectId && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Book className="w-4 h-4" />
              <span className="text-sm">{session.subjectId.name}</span>
            </div>
          )}

          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              connectionStatus === "connected"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : connectionStatus === "connecting"
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}
          >
            {connectionStatus === "connected"
              ? "● Connected"
              : connectionStatus === "connecting"
                ? "● Connecting..."
                : "● Disconnected"}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>

          {isTeacher ? (
            <Button variant="destructive" size="sm" onClick={handleEndSession}>
              <PhoneOff className="w-4 h-4 mr-2" />
              End Session
            </Button>
          ) : (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLeaveSession}
            >
              <PhoneOff className="w-4 h-4 mr-2" />
              Leave
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Videos */}
        <div className="w-80 bg-gray-900 p-4 flex flex-col gap-4">
          {/* Teacher Video (Large) */}
          <VideoStream
            stream={isTeacher ? localStream : remoteStream}
            name={isTeacher ? (user!.name ?? "Teacher") : remotePeer?.name || "Teacher"}
            role="teacher"
            isLocal={isTeacher}
            isAudioEnabled={isTeacher ? isAudioEnabled : remotePeerAudio}
            isVideoEnabled={isTeacher ? isVideoEnabled : remotePeerVideo}
            isScreenSharing={isTeacher ? isScreenSharing : remotePeerScreen}
            onToggleAudio={isTeacher ? handleToggleAudio : undefined}
            onToggleVideo={isTeacher ? handleToggleVideo : undefined}
            onToggleScreen={isTeacher ? handleToggleScreen : undefined}
            size="large"
            className="flex-1"
          />

          {/* Student Video (Small) */}
          <VideoStream
            stream={!isTeacher ? localStream : remoteStream}
            name={!isTeacher ? (user!.name ?? "Student") : remotePeer?.name || "Student"}
            role="student"
            isLocal={!isTeacher}
            isAudioEnabled={!isTeacher ? isAudioEnabled : remotePeerAudio}
            isVideoEnabled={!isTeacher ? isVideoEnabled : remotePeerVideo}
            onToggleAudio={!isTeacher ? handleToggleAudio : undefined}
            onToggleVideo={!isTeacher ? handleToggleVideo : undefined}
            size="small"
          />
        </div>

        {/* Center: Whiteboard */}
        <div className="flex-1">
          <CollaborativeWhiteboard
            ref={whiteboardRef}
            onDraw={handleWhiteboardDraw}
            disabled={false}
            className="h-full"
          />
        </div>

        {/* Right: Chat */}
        <div className="w-80 border-l border-gray-200 dark:border-gray-700">
          <LiveChatPanel
            messages={chatMessages}
            currentUserId={user!._id}
            onSendMessage={handleSendMessage}
            participants={participants.map((p) => ({
              userId: p.userId,
              name: p.name,
              role: p.role,
            }))}
          />
        </div>
      </div>
    </div>
  );
};

export default LiveClassroomPage;
