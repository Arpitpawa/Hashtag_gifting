"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell, ShoppingBag, AlertTriangle,
  Star, XCircle, X, CheckCheck,
  Volume2, VolumeX, Settings,
} from "lucide-react";

interface Notification {
  id:      string;
  type:    "new_order" | "low_stock" | "review" | "failed_payment";
  title:   string;
  message: string;
  href:    string;
  time:    string;
  status?: string;
}

const TYPE_CONFIG = {
  new_order:      { icon: <ShoppingBag size={15} />, color: "bg-blue-100 text-blue-600",   label: "Order"   },
  low_stock:      { icon: <AlertTriangle size={15} />, color: "bg-orange-100 text-orange-600", label: "Stock" },
  review:         { icon: <Star size={15} />, color: "bg-yellow-100 text-yellow-600",       label: "Review"  },
  failed_payment: { icon: <XCircle size={15} />, color: "bg-red-100 text-red-600",          label: "Payment" },
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m    = Math.floor(diff / 60000);
  const h    = Math.floor(m / 60);
  const d    = Math.floor(h / 24);
  if (d > 0)   return `${d}d ago`;
  if (h > 0)   return `${h}h ago`;
  if (m > 0)   return `${m}m ago`;
  return "just now";
}

// Audio alert using Web Audio API
function playAlert() {
  try {
    const ctx  = new AudioContext();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch {}
}

const POLL_INTERVAL = 30_000; // 30 seconds

export default function AdminNotifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread,        setUnread]        = useState(0);
  const [open,          setOpen]          = useState(false);
  const [readIds,       setReadIds]       = useState<Set<string>>(new Set());
  const [soundEnabled,  setSoundEnabled]  = useState(true);
  const [browserNotifs, setBrowserNotifs] = useState(false);
  const [lastFetch,     setLastFetch]     = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Request browser notification permission
  const requestBrowserNotifs = async () => {
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    setBrowserNotifs(perm === "granted");
  };

  // Check permission on mount
  useEffect(() => {
    if ("Notification" in window) {
      setBrowserNotifs(Notification.permission === "granted");
    }
    // Load read IDs from localStorage
    try {
      const saved = localStorage.getItem("admin-read-notifications");
      if (saved) setReadIds(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  // Send browser push notification
  const sendPushNotif = useCallback((title: string, body: string, href: string) => {
    if (!browserNotifs || Notification.permission !== "granted") return;
    try {
      const n = new Notification(`🔔 ${title}`, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag:  href,
      });
      n.onclick = () => { router.push(href); n.close(); };
    } catch {}
  }, [browserNotifs, router]);

  // Fetch notifications
  const fetchNotifications = useCallback(async (isInitial = false) => {
    try {
      const params = lastFetch && !isInitial ? `?since=${lastFetch}` : "";
      const res    = await fetch(`/api/admin/notifications${params}`);
      if (!res.ok) return;
      const data   = await res.json();
      const newNotifs: Notification[] = data.notifications || [];

      setLastFetch(data.fetchedAt);

      if (isInitial) {
        setNotifications(newNotifs);
        // Count unread on initial load
        const saved = new Set<string>(JSON.parse(localStorage.getItem("admin-read-notifications") || "[]"));
        setUnread(newNotifs.filter(n => !saved.has(n.id)).length);
        return;
      }

      // On subsequent fetches — find truly NEW ones
      setNotifications(prev => {
        const existingIds = new Set(prev.map(n => n.id));
        const brandNew    = newNotifs.filter(n => !existingIds.has(n.id));

        if (brandNew.length > 0) {
          // Sound alert
          if (soundEnabled) playAlert();

          // Browser push for each new notification
          brandNew.forEach(n => {
            sendPushNotif(n.title, n.message, n.href);
          });

          // Update unread count
          setUnread(u => u + brandNew.length);
        }

        // Merge — new at top
        return [...brandNew, ...prev].slice(0, 50);
      });

    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, [lastFetch, soundEnabled, sendPushNotif]);

  // Initial fetch + polling
  useEffect(() => {
    fetchNotifications(true);
    const interval = setInterval(() => fetchNotifications(false), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = () => {
    const allIds = new Set(notifications.map(n => n.id));
    setReadIds(allIds);
    setUnread(0);
    try { localStorage.setItem("admin-read-notifications", JSON.stringify([...allIds])); } catch {}
  };

  const markRead = (id: string) => {
    const next = new Set(readIds).add(id);
    setReadIds(next);
    setUnread(u => Math.max(0, u - 1));
    try { localStorage.setItem("admin-read-notifications", JSON.stringify([...next])); } catch {}
  };

  const handleClick = (n: Notification) => {
    if (!readIds.has(n.id)) markRead(n.id);
    setOpen(false);
    router.push(n.href);
  };

  return (
    <div ref={dropdownRef} className="relative">

      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[#f5f5f5] transition-colors"
      >
        <Bell size={18} className={unread > 0 ? "text-[#c0555a]" : "text-[#888]"} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#c0555a] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 w-[360px] bg-white rounded-2xl shadow-2xl border border-[#e8e8e8] z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0]">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-[#c0555a]" />
              <span className="text-[14px] font-bold text-[#1a1a1a]">Notifications</span>
              {unread > 0 && (
                <span className="text-[10px] font-bold text-white bg-[#c0555a] px-1.5 py-0.5 rounded-full">{unread} new</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {/* Sound toggle */}
              <button onClick={() => setSoundEnabled(!soundEnabled)}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#f5f5f5] transition-colors"
                title={soundEnabled ? "Mute alerts" : "Enable alerts"}>
                {soundEnabled ? <Volume2 size={13} className="text-[#888]" /> : <VolumeX size={13} className="text-[#aaa]" />}
              </button>
              {/* Browser notif toggle */}
              <button onClick={requestBrowserNotifs}
                className={`w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#f5f5f5] transition-colors ${browserNotifs ? "text-[#c0555a]" : "text-[#aaa]"}`}
                title={browserNotifs ? "Browser notifications on" : "Enable browser notifications"}>
                <Settings size={13} />
              </button>
              {unread > 0 && (
                <button onClick={markAllRead}
                  className="flex items-center gap-1 text-[11px] text-[#c0555a] font-semibold hover:underline px-2">
                  <CheckCheck size={12} /> Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Browser notif prompt */}
          {!browserNotifs && "Notification" in window && Notification.permission !== "denied" && (
            <button onClick={requestBrowserNotifs}
              className="w-full text-left px-4 py-2.5 bg-[#c0555a]/5 border-b border-[#f0f0f0] flex items-center gap-2 hover:bg-[#c0555a]/10 transition-colors">
              <Bell size={13} className="text-[#c0555a] flex-shrink-0" />
              <span className="text-[12px] text-[#c0555a] font-medium">Enable browser notifications for real-time alerts</span>
            </button>
          )}

          {/* List */}
          <div className="overflow-y-auto max-h-[400px]" style={{ scrollbarWidth: "none" }}>
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell size={28} className="text-[#e8e8e8] mx-auto mb-2" />
                <p className="text-[13px] text-[#aaa]">All caught up!</p>
              </div>
            ) : (
              notifications.map(n => {
                const cfg    = TYPE_CONFIG[n.type] || TYPE_CONFIG.new_order;
                const isRead = readIds.has(n.id);
                return (
                  <button key={n.id} onClick={() => handleClick(n)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-3.5 border-b border-[#f8f8f8] hover:bg-[#fafafa] transition-colors ${
                      !isRead ? "bg-[#c0555a]/3" : ""
                    }`}>
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.color}`}>
                      {cfg.icon}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-[13px] font-semibold truncate ${isRead ? "text-[#888]" : "text-[#1a1a1a]"}`}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-[#aaa] flex-shrink-0">{timeAgo(n.time)}</span>
                      </div>
                      <p className="text-[12px] text-[#888] mt-0.5 line-clamp-1">{n.message}</p>
                      {n.status && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-1 inline-block ${
                          n.status === "PAID" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}>{n.status}</span>
                      )}
                    </div>
                    {/* Unread dot */}
                    {!isRead && (
                      <div className="w-2 h-2 bg-[#c0555a] rounded-full flex-shrink-0 mt-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-[#f0f0f0] flex items-center justify-between">
            <p className="text-[11px] text-[#aaa]">Auto-refreshes every 30 seconds</p>
            <button onClick={() => { setOpen(false); fetchNotifications(true); }}
              className="text-[11px] text-[#c0555a] font-semibold hover:underline">
              Refresh now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}