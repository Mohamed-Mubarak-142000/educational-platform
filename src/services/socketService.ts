import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Connect to Socket.IO server
   */
  connect(): Promise<Socket> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve(this.socket);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        reject(new Error("Not authenticated"));
        return;
      }

      this.socket = io(SOCKET_URL, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        timeout: 20000,
        auth: { token },
      });

      this.socket.on("connect", () => {
        console.log("[Socket.IO] Connected:", this.socket?.id);
        this.reconnectAttempts = 0;
        resolve(this.socket!);
      });

      this.socket.on("connect_error", (error) => {
        console.error("[Socket.IO] Connection error:", error);
        this.reconnectAttempts++;

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error("Failed to connect to server"));
        }
      });

      this.socket.on("disconnect", (reason) => {
        console.log("[Socket.IO] Disconnected:", reason);
      });

      this.socket.on("error", (error: { message: string }) => {
        console.error("[Socket.IO] Error:", error.message);
      });
    });
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Join a room
   */
  joinRoom(
    roomId: string,
    user: {
      userId: string;
      role: "teacher" | "student";
      name: string;
      profileImage?: string;
    },
  ) {
    if (!this.socket) {
      throw new Error("Socket not connected");
    }

    this.socket.emit("join-room", { roomId, user });
  }

  /**
   * Leave room
   */
  leaveRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit("leave-room", { roomId });
    }
  }

  /**
   * Send WebRTC offer
   */
  sendOffer(roomId: string, signal: any, to?: string) {
    if (!this.socket) return;
    this.socket.emit("offer", { roomId, signal, to });
  }

  /**
   * Send WebRTC answer
   */
  sendAnswer(to: string, signal: any) {
    if (!this.socket) return;
    this.socket.emit("answer", { signal, to });
  }

  /**
   * Send ICE candidate
   */
  sendIceCandidate(roomId: string, signal: any, to?: string) {
    if (!this.socket) return;
    this.socket.emit("ice-candidate", { roomId, signal, to });
  }

  /**
   * Send whiteboard action
   */
  sendWhiteboardAction(
    roomId: string,
    action: "draw" | "erase" | "clear" | "undo" | "redo",
    data: any,
    userId: string,
  ) {
    if (!this.socket) return;
    this.socket.emit("whiteboard-draw", { roomId, action, data, userId });
  }

  /**
   * Send chat message
   */
  sendChatMessage(
    roomId: string,
    message: string,
    userId: string,
    userName: string,
  ) {
    if (!this.socket) return;
    this.socket.emit("chat-message", {
      roomId,
      message,
      userId,
      userName,
      timestamp: Date.now(),
    });
  }

  /**
   * Toggle media (video/audio/screen)
   */
  toggleMedia(
    roomId: string,
    userId: string,
    type: "video" | "audio" | "screen",
    enabled: boolean,
  ) {
    if (!this.socket) return;
    this.socket.emit("toggle-media", { roomId, userId, type, enabled });
  }

  /**
   * End session (teacher only)
   */
  endSession(roomId: string, userId: string) {
    if (!this.socket) return;
    this.socket.emit("end-session", { roomId, userId });
  }

  /**
   * Register event listeners
   */
  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  /**
   * Remove event listener
   */
  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
