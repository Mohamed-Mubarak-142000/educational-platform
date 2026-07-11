import React, { useEffect, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface VideoStreamProps {
  stream: MediaStream | null;
  name: string;
  role: "teacher" | "student";
  isLocal?: boolean;
  isAudioEnabled?: boolean;
  isVideoEnabled?: boolean;
  isScreenSharing?: boolean;
  onToggleAudio?: () => void;
  onToggleVideo?: () => void;
  onToggleScreen?: () => void;
  className?: string;
  size?: "small" | "medium" | "large";
}

export const VideoStream: React.FC<VideoStreamProps> = ({
  stream,
  name,
  role,
  isLocal = false,
  isAudioEnabled = true,
  isVideoEnabled = true,
  isScreenSharing = false,
  onToggleAudio,
  onToggleVideo,
  onToggleScreen,
  className = "",
  size = "medium",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    video.srcObject = stream;

    // Check if stream has video track
    const videoTracks = stream.getVideoTracks();
    setHasVideo(videoTracks.length > 0 && videoTracks[0].enabled);

    // Monitor track changes
    const handleTrackChange = () => {
      const tracks = stream.getVideoTracks();
      setHasVideo(tracks.length > 0 && tracks[0].enabled);
    };

    videoTracks.forEach((track) => {
      track.addEventListener("ended", handleTrackChange);
      track.addEventListener("mute", handleTrackChange);
      track.addEventListener("unmute", handleTrackChange);
    });

    return () => {
      videoTracks.forEach((track) => {
        track.removeEventListener("ended", handleTrackChange);
        track.removeEventListener("mute", handleTrackChange);
        track.removeEventListener("unmute", handleTrackChange);
      });
    };
  }, [stream]);

  const sizeClasses = {
    small: "h-32 w-48",
    medium: "h-48 w-64",
    large: "h-full w-full",
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const showControls =
    isLocal && (onToggleAudio || onToggleVideo || onToggleScreen);

  return (
    <div
      className={`relative rounded-lg overflow-hidden bg-gray-900 ${sizeClasses[size]} ${className}`}
    >
      {/* Video Element */}
      {hasVideo && isVideoEnabled ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal} // Mute local video to avoid echo
          className="w-full h-full object-cover"
        />
      ) : (
        // Placeholder when video is off
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <Avatar className="w-20 h-20">
            <AvatarImage src="" />
            <AvatarFallback className="text-2xl bg-violet-600 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Name Badge */}
      <div className="absolute bottom-2 left-2 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full flex items-center gap-2">
        <span className="text-white text-sm font-medium">
          {name} {isLocal && "(You)"}
        </span>
        {role === "teacher" && (
          <span className="text-xs bg-violet-600 text-white px-2 py-0.5 rounded-full">
            Teacher
          </span>
        )}
      </div>

      {/* Audio Status Indicator */}
      {!isAudioEnabled && (
        <div className="absolute top-2 right-2 p-1.5 bg-red-600 rounded-full">
          <MicOff className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Screen Sharing Indicator */}
      {isScreenSharing && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-green-600 rounded-full flex items-center gap-1">
          <Monitor className="w-3 h-3 text-white" />
          <span className="text-xs text-white font-medium">Screen</span>
        </div>
      )}

      {/* Local Controls */}
      {showControls && (
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
          {onToggleAudio && (
            <Button
              variant={isAudioEnabled ? "default" : "destructive"}
              size="sm"
              onClick={onToggleAudio}
              className="rounded-full w-10 h-10 p-0"
              title={isAudioEnabled ? "Mute" : "Unmute"}
            >
              {isAudioEnabled ? (
                <Mic className="w-4 h-4" />
              ) : (
                <MicOff className="w-4 h-4" />
              )}
            </Button>
          )}

          {onToggleVideo && (
            <Button
              variant={isVideoEnabled ? "default" : "destructive"}
              size="sm"
              onClick={onToggleVideo}
              className="rounded-full w-10 h-10 p-0"
              title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
            >
              {isVideoEnabled ? (
                <Video className="w-4 h-4" />
              ) : (
                <VideoOff className="w-4 h-4" />
              )}
            </Button>
          )}

          {onToggleScreen && (
            <Button
              variant={isScreenSharing ? "default" : "secondary"}
              size="sm"
              onClick={onToggleScreen}
              className="rounded-full w-10 h-10 p-0"
              title={isScreenSharing ? "Stop sharing" : "Share screen"}
            >
              {isScreenSharing ? (
                <MonitorOff className="w-4 h-4" />
              ) : (
                <Monitor className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      )}

      {/* Connection Quality Indicator */}
      <div className="absolute top-2 right-12 flex gap-0.5">
        <div className="w-1 h-2 bg-green-500 rounded-sm"></div>
        <div className="w-1 h-3 bg-green-500 rounded-sm"></div>
        <div className="w-1 h-4 bg-green-500 rounded-sm"></div>
      </div>
    </div>
  );
};

export default VideoStream;
