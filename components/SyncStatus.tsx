"use client";

import { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

export function SyncStatus() {
  const [online,   setOnline]   = useState(true);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncing,  setSyncing]  = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setOnline(navigator.onLine);

    const stored = localStorage.getItem("ftp-last-sync");
    if (stored) setLastSync(stored);

    const markSync = () => {
      const t = new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
      setLastSync(t);
      try { localStorage.setItem("ftp-last-sync", t); } catch { /* ignore */ }
    };

    const handleOnline = () => {
      setOnline(true);
      setSyncing(true);
      setTimeout(() => { setSyncing(false); markSync(); }, 1200);
    };
    const handleOffline = () => setOnline(false);

    window.addEventListener("online",  handleOnline);
    window.addEventListener("offline", handleOffline);

    // Mark initial sync
    markSync();

    return () => {
      window.removeEventListener("online",  handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (syncing) {
    return (
      <div className="flex items-center gap-1.5">
        <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-500" />
        <span style={{ fontSize: 12, color: "#b45309" }}>מסנכרן...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {online
        ? <Wifi    className="h-3.5 w-3.5 text-green-500" />
        : <WifiOff className="h-3.5 w-3.5 text-red-400"   />
      }
      <span style={{ fontSize: 12, color: online ? "#16a34a" : "#ef4444" }}>
        {online
          ? lastSync ? `עודכן ${lastSync}` : "מחובר"
          : "לא מחובר — עובד offline"}
      </span>
    </div>
  );
}
