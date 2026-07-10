import React, { useEffect, useRef, useState } from "react";
import { Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  type: "user" | "system";
}

interface LiveChatPanelProps {
  messages: ChatMessage[];
  currentUserId: string;
  onSendMessage: (message: string) => void;
  participants: Array<{ userId: string; name: string; role: string }>;
  className?: string;
}

export const LiveChatPanel: React.FC<LiveChatPanelProps> = ({
  messages,
  currentUserId,
  onSendMessage,
  participants,
  className = "",
}) => {
  const [inputMessage, setInputMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showParticipants, setShowParticipants] = useState(false);

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      onSendMessage(inputMessage.trim());
      setInputMessage("");
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div
      className={`flex flex-col h-full bg-white dark:bg-gray-800 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Live Chat
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowParticipants(!showParticipants)}
          className="text-gray-600 dark:text-gray-400"
        >
          <Users className="w-4 h-4 mr-1" />
          {participants.length}
        </Button>
      </div>

      {/* Participants List (collapsible) */}
      {showParticipants && (
        <div className="border-b border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Participants
          </h4>
          <div className="space-y-2">
            {participants.map((participant) => (
              <div
                key={participant.userId}
                className="flex items-center gap-2 text-sm"
              >
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs bg-blue-600 text-white">
                    {getInitials(participant.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-gray-900 dark:text-white">
                  {participant.name}
                </span>
                {participant.role === "teacher" && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
                    Teacher
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.userId === currentUserId;
              const isSystem = msg.type === "system";

              if (isSystem) {
                return (
                  <div
                    key={msg.id}
                    className="text-center text-xs text-gray-500 dark:text-gray-400 py-1"
                  >
                    {msg.message}
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
                >
                  {!isOwn && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="text-xs bg-blue-600 text-white">
                        {getInitials(msg.userName)}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`flex flex-col ${
                      isOwn ? "items-end" : "items-start"
                    } max-w-[75%]`}
                  >
                    {!isOwn && (
                      <span className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        {msg.userName}
                      </span>
                    )}
                    <div
                      className={`px-3 py-2 rounded-lg ${
                        isOwn
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                      }`}
                    >
                      <p className="text-sm break-words">{msg.message}</p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(msg.timestamp), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="p-3 border-t border-gray-200 dark:border-gray-700"
      >
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            maxLength={500}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!inputMessage.trim()}
            className="flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {inputMessage.length}/500
        </div>
      </form>
    </div>
  );
};

export default LiveChatPanel;
