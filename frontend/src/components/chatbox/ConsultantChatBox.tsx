import { useEffect, useRef, useState, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { useChatHubGuest } from "@/hooks/useChatHubGuest";

const CONSULTANT = { id: "10", name: "Nhân viên tư vấn" };

type ChatMessage = {
  messageId?: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp?: string;
};

function getOrCreateGuestId(): string {
  let id = localStorage.getItem("guestId");
  if (!id) {
    id = uuidv4();
    localStorage.setItem("guestId", id);
  }
  return id;
}

export default function ConsultantChatBox() {
  const guestId = getOrCreateGuestId();
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnreadMessage, setHasUnreadMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastProcessedMessage = useRef<string>("");

  const { realtimeMessages, sendMessage, fetchChatHistory } =
    useChatHubGuest(guestId);

  // Khởi tạo audio cho notification
  useEffect(() => {
    audioRef.current = new Audio("/sound/inflicted-601.ogg");
    audioRef.current.volume = 0.5;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    fetchChatHistory(CONSULTANT.id).then(setHistory);
  }, [guestId, fetchChatHistory]);

  const allMessages = useMemo(() => {
    const merged = [...history, ...realtimeMessages].filter(
      (m) =>
        (m.senderId === guestId && m.receiverId === CONSULTANT.id) ||
        (m.receiverId === guestId && m.senderId === CONSULTANT.id)
    );

    const seen = new Set<string>();
    const unique = merged.filter((msg) => {
      // Ưu tiên dùng messageId nếu có
      let key = msg.messageId;

      if (!key) {
        // Nếu không có messageId, tạo key theo nội dung
        const ts = msg.timestamp
          ? Math.floor(new Date(msg.timestamp).getTime() / 1000) // Làm tròn về giây
          : "";
        key = `${msg.senderId}-${msg.receiverId}-${msg.message}-${ts}`;
      }

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return unique.sort(
      (a, b) =>
        new Date(a.timestamp || "").getTime() -
        new Date(b.timestamp || "").getTime()
    );
  }, [history, realtimeMessages, guestId]);

  // Xử lý tin nhắn mới với âm thanh và hiệu ứng đỏ
  useEffect(() => {
    if (realtimeMessages.length === 0) return;

    const lastMsg = realtimeMessages[realtimeMessages.length - 1];
    const messageKey = `${lastMsg.senderId}-${lastMsg.message}-${lastMsg.timestamp}`;

    // Tránh xử lý cùng một tin nhắn nhiều lần
    if (lastProcessedMessage.current === messageKey) return;
    lastProcessedMessage.current = messageKey;

    // Nếu tin nhắn đến từ consultant và chatbox đang đóng
    if (
      lastMsg.senderId === CONSULTANT.id &&
      lastMsg.receiverId === guestId &&
      !isOpen
    ) {
      setHasUnreadMessage(true);

      // Phát âm thanh thông báo
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((err) => {
          console.log("Could not play notification sound:", err);
        });
      }
    }
  }, [realtimeMessages, guestId, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    // ✅ Gọi sendMessage từ hook
    sendMessage(text);
    setInput("");
  };

  const handleOpenChat = () => {
    setIsOpen(true);
    // Tắt thông báo đỏ khi mở chat
    setHasUnreadMessage(false);
  };

  const formatTime = (ts?: string) => {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={handleOpenChat}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: hasUnreadMessage ? "#ef4444" : "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "9999px",
            padding: "12px 20px",
            fontSize: 16,
            fontWeight: 600,
            boxShadow: hasUnreadMessage
              ? "0 4px 12px rgba(239, 68, 68, 0.4), 0 0 20px rgba(239, 68, 68, 0.3)"
              : "0 4px 12px rgba(0,0,0,0.2)",
            cursor: "pointer",
            zIndex: 999,
            animation: hasUnreadMessage ? "pulse 2s infinite" : "none",
          }}
        >
          💬 Hỗ trợ
          {hasUnreadMessage && (
            <span
              style={{
                position: "absolute",
                top: -8,
                right: -8,
                background: "#ffffff",
                color: "#ef4444",
                fontSize: 12,
                fontWeight: "bold",
                borderRadius: "50%",
                width: 20,
                height: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                animation: "bounce 1s infinite",
              }}
            >
              !
            </span>
          )}
        </button>
      )}

      {isOpen && (
        <div
          style={{
            width: 350,
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 4px 24px rgba(0,0,0,0.13)",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            fontFamily: "inherit",
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: 18,
                color: "#2563eb",
                letterSpacing: 0.5,
              }}
            >
              🎧 Chat với nhân viên tư vấn
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                fontSize: 20,
                color: "#999",
                cursor: "pointer",
              }}
              title="Đóng"
            >
              ×
            </button>
          </div>

          <div
            style={{
              height: 240,
              overflowY: "auto",
              background: "#f6f8fa",
              borderRadius: 12,
              padding: 12,
              marginBottom: 12,
              border: "1px solid #e5e7eb",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {allMessages.length === 0 && (
              <div
                style={{
                  color: "#888",
                  textAlign: "center",
                  marginTop: 40,
                }}
              >
                Chưa có tin nhắn nào
              </div>
            )}
            {allMessages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf:
                    msg.senderId === guestId ? "flex-end" : "flex-start",
                  background:
                    msg.senderId === guestId ? "#2563eb" : "#e0e7ff",
                  color: msg.senderId === guestId ? "#fff" : "#1e293b",
                  borderRadius: 12,
                  padding: "8px 14px",
                  maxWidth: "80%",
                  boxShadow:
                    msg.senderId === guestId
                      ? "0 2px 8px #2563eb22"
                      : "0 2px 8px #64748b22",
                  marginBottom: 2,
                  fontSize: 15,
                  wordBreak: "break-word",
                }}
                title={msg.senderId === guestId ? "Bạn" : CONSULTANT.name}
              >
                <span style={{ fontWeight: 500 }}>
                  {msg.senderId === guestId ? "Bạn" : CONSULTANT.name}:
                </span>{" "}
                {msg.message}
                <span
                  style={{
                    display: "block",
                    fontSize: 11,
                    color: "#cbd5e1",
                    marginTop: 2,
                    textAlign: "right",
                  }}
                >
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              style={{
                flex: 1,
                border: "1px solid #d1d5db",
                borderRadius: 8,
                padding: "8px 10px",
                fontSize: 15,
                outline: "none",
                background: "#f9fafb",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
            />
            <button
              onClick={handleSend}
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 18px",
                fontWeight: 600,
                fontSize: 15,
                cursor: input.trim() ? "pointer" : "not-allowed",
                opacity: input.trim() ? 1 : 0.6,
                boxShadow: "0 2px 8px #2563eb22",
              }}
              disabled={!input.trim()}
            >
              Gửi
            </button>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes bounce {
          0%,
          20%,
          50%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-4px);
          }
          60% {
            transform: translateY(-2px);
          }
        }
      `}</style>
    </>
  );
}