import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { createNotificationConnection } from "@/services/notificationHub";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type NotificationDto = {
  notificationId: number;
  title: string;
  type: string;
  message: string;
  targetUrl?: string;
  createdAt: string;
};

// ✅ Mapping keyword → route
const titleRouteMappings: { keyword: string; route: string }[] = [
  { keyword: "invoice", route: "/invoices" }, // ✅ match route khai báo
  { keyword: "lịch hẹn", route: "/appointments" },
  { keyword: "điều trị", route: "/patient/treatment-records" },
  { keyword: "thẻ bảo hành", route: "/assistant/warranty-cards" },
  { keyword: "đơn thuốc", route: "/prescription-templates" },
  { keyword: "nhiệm vụ", route: "/assistant/assigned-tasks" },
];

function mapTitleToRoute(type: string): string {
  const lower = type.toLowerCase().trim();
  for (const mapping of titleRouteMappings) {
    if (lower.includes(mapping.keyword.toLowerCase())) {
      return mapping.route;
    }
  }
  return "/";
}

export function NotificationButton() {
  const [showList, setShowList] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token") || "";

    const connection = createNotificationConnection(token);
    connection.start().catch(console.error);

    axios
      .get<NotificationDto[]>(`${import.meta.env.VITE_API_BASE_URL}/notifications`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setNotifications(Array.isArray(res.data) ? res.data : []);
      })
      .catch(console.error);

    connection.on("ReceiveNotification", (notification: NotificationDto) => {
      toast.info(notification.title);
      setNotifications((prev) => [notification, ...prev]);
      setHasUnread(true);
      audioRef.current?.play().catch((err) => {
        console.warn("Không thể phát âm thanh:", err);
      });
    });

    return () => {
      connection.stop();
    };
  }, []);

  const handleClick = () => {
    setShowList((prev) => !prev);
    setHasUnread(false);
  };

  const handleNotificationClick = (notification: NotificationDto) => {
    const route = mapTitleToRoute(notification.type);
    console.log("Navigating to:", route);
    navigate(route);
    setShowList(false);
  };

  return (
    <div className="relative inline-block text-left">
      <audio ref={audioRef} src="/sound/inflicted-601.ogg" preload="auto" />
      <button
        onClick={handleClick}
        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full relative"
        title="Thông báo"
      >
        <Bell className="h-5 w-5" />
        {hasUnread && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>

      {showList && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded shadow-lg z-50">
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">Không có thông báo.</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.notificationId}
                  onClick={() => handleNotificationClick(n)}
                  className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="font-medium">{n.title}</div>
                  <div className="text-sm text-gray-600">{n.message}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}