class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private iceCandidatesQueue: RTCIceCandidateInit[] = [];
  private isNegotiating = false;

  private configuration: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
    ],
  };

  /**
   * Initialize local media stream (video + audio)
   */
  async initializeMedia(
    videoEnabled = true,
    audioEnabled = true,
  ): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: videoEnabled
          ? {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user",
            }
          : false,
        audio: audioEnabled
          ? {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            }
          : false,
      });

      console.log("[WebRTC] Local stream initialized");
      return this.localStream;
    } catch (error) {
      console.error("[WebRTC] Error accessing media devices:", error);
      throw new Error("Failed to access camera/microphone");
    }
  }

  /**
   * Create peer connection
   */
  createPeerConnection(
    onIceCandidate: (candidate: RTCIceCandidateInit) => void,
    onTrack: (stream: MediaStream) => void,
    onConnectionStateChange?: (state: RTCPeerConnectionState) => void,
  ): RTCPeerConnection {
    this.peerConnection = new RTCPeerConnection(this.configuration);

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        onIceCandidate(event.candidate.toJSON());
      }
    };

    // Handle incoming tracks
    this.peerConnection.ontrack = (event) => {
      console.log("[WebRTC] Remote track received:", event.track.kind);

      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
      }

      this.remoteStream.addTrack(event.track);
      onTrack(this.remoteStream);
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      console.log("[WebRTC] Connection state:", state);

      if (onConnectionStateChange && state) {
        onConnectionStateChange(state);
      }

      if (state === "failed") {
        this.restartIce();
      }
    };

    // Handle ICE connection state
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log(
        "[WebRTC] ICE connection state:",
        this.peerConnection?.iceConnectionState,
      );
    };

    // Handle negotiation needed
    this.peerConnection.onnegotiationneeded = async () => {
      if (this.isNegotiating) {
        console.log("[WebRTC] Already negotiating, skipping");
        return;
      }

      console.log("[WebRTC] Negotiation needed");
      this.isNegotiating = true;
    };

    // Add local tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });
    }

    console.log("[WebRTC] Peer connection created");
    return this.peerConnection;
  }

  /**
   * Create and send offer
   */
  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error("Peer connection not initialized");
    }

    try {
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await this.peerConnection.setLocalDescription(offer);
      console.log("[WebRTC] Offer created");

      return offer;
    } catch (error) {
      console.error("[WebRTC] Error creating offer:", error);
      throw error;
    }
  }

  /**
   * Handle incoming offer
   */
  async handleOffer(
    offer: RTCSessionDescriptionInit,
  ): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error("Peer connection not initialized");
    }

    try {
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer),
      );
      console.log("[WebRTC] Remote offer set");

      // Process queued ICE candidates
      await this.processIceCandidatesQueue();

      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      console.log("[WebRTC] Answer created");

      this.isNegotiating = false;
      return answer;
    } catch (error) {
      console.error("[WebRTC] Error handling offer:", error);
      this.isNegotiating = false;
      throw error;
    }
  }

  /**
   * Handle incoming answer
   */
  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error("Peer connection not initialized");
    }

    try {
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer),
      );
      console.log("[WebRTC] Remote answer set");

      // Process queued ICE candidates
      await this.processIceCandidatesQueue();

      this.isNegotiating = false;
    } catch (error) {
      console.error("[WebRTC] Error handling answer:", error);
      this.isNegotiating = false;
      throw error;
    }
  }

  /**
   * Add ICE candidate
   */
  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) {
      console.log("[WebRTC] Peer connection not ready, queuing candidate");
      this.iceCandidatesQueue.push(candidate);
      return;
    }

    if (!this.peerConnection.remoteDescription) {
      console.log("[WebRTC] Remote description not set, queuing candidate");
      this.iceCandidatesQueue.push(candidate);
      return;
    }

    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      console.log("[WebRTC] ICE candidate added");
    } catch (error) {
      console.error("[WebRTC] Error adding ICE candidate:", error);
    }
  }

  /**
   * Process queued ICE candidates
   */
  private async processIceCandidatesQueue(): Promise<void> {
    if (this.iceCandidatesQueue.length === 0) return;

    console.log(
      `[WebRTC] Processing ${this.iceCandidatesQueue.length} queued ICE candidates`,
    );

    for (const candidate of this.iceCandidatesQueue) {
      await this.addIceCandidate(candidate);
    }

    this.iceCandidatesQueue = [];
  }

  /**
   * Toggle video
   */
  toggleVideo(enabled: boolean): boolean {
    if (!this.localStream) return false;

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = enabled;
      console.log("[WebRTC] Video:", enabled ? "enabled" : "disabled");
      return true;
    }
    return false;
  }

  /**
   * Toggle audio
   */
  toggleAudio(enabled: boolean): boolean {
    if (!this.localStream) return false;

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = enabled;
      console.log("[WebRTC] Audio:", enabled ? "enabled" : "disabled");
      return true;
    }
    return false;
  }

  /**
   * Start screen sharing
   */
  async startScreenShare(): Promise<MediaStream> {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always",
        } as any,
        audio: false,
      });

      // Replace video track
      if (this.peerConnection && this.localStream) {
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = this.peerConnection
          .getSenders()
          .find((s) => s.track?.kind === "video");

        if (sender) {
          await sender.replaceTrack(videoTrack);

          // Stop screen share when user stops it from browser
          videoTrack.onended = () => {
            this.stopScreenShare();
          };
        }
      }

      console.log("[WebRTC] Screen sharing started");
      return screenStream;
    } catch (error) {
      console.error("[WebRTC] Error starting screen share:", error);
      throw error;
    }
  }

  /**
   * Stop screen sharing
   */
  async stopScreenShare(): Promise<void> {
    if (!this.localStream || !this.peerConnection) return;

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      const sender = this.peerConnection
        .getSenders()
        .find((s) => s.track?.kind === "video");
      if (sender) {
        await sender.replaceTrack(videoTrack);
      }
    }

    console.log("[WebRTC] Screen sharing stopped");
  }

  /**
   * Restart ICE connection
   */
  private async restartIce(): Promise<void> {
    if (!this.peerConnection) return;

    try {
      const offer = await this.peerConnection.createOffer({ iceRestart: true });
      await this.peerConnection.setLocalDescription(offer);
      console.log("[WebRTC] ICE restart initiated");
    } catch (error) {
      console.error("[WebRTC] ICE restart failed:", error);
    }
  }

  /**
   * Get local stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * Get remote stream
   */
  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  /**
   * Get connection stats
   */
  async getStats(): Promise<RTCStatsReport | null> {
    if (!this.peerConnection) return null;

    try {
      return await this.peerConnection.getStats();
    } catch (error) {
      console.error("[WebRTC] Error getting stats:", error);
      return null;
    }
  }

  /**
   * Close connection and cleanup
   */
  close(): void {
    // Stop local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.remoteStream = null;
    this.iceCandidatesQueue = [];
    this.isNegotiating = false;

    console.log("[WebRTC] Connection closed and cleaned up");
  }
}

// Export singleton instance
export const webrtcService = new WebRTCService();
export default webrtcService;
