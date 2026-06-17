"use client";

import { useState, useRef } from "react";
import {
  Download, Upload, Trash2, RefreshCw,
  CheckCircle2, Info, Wifi,
} from "lucide-react";
import { SyncStatus } from "@/components/SyncStatus";

const WORKFLOW_KEY = "ftp-workflow-v3";
const CHECKLIST_KEY = "ftp-checklist-v1";

function exportData() {
  const data = {
    exportedAt: new Date().toISOString(),
    version:    "2.0",
    workflow:   (() => { try { return JSON.parse(localStorage.getItem(WORKFLOW_KEY) || "{}"); } catch { return {}; } })(),
    checklist:  (() => { try { return JSON.parse(localStorage.getItem(CHECKLIST_KEY) || "{}"); } catch { return {}; } })(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `travel-planner-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData(json: string): { ok: boolean; msg: string } {
  try {
    const data = JSON.parse(json);
    if (data.workflow)  localStorage.setItem(WORKFLOW_KEY,  JSON.stringify(data.workflow));
    if (data.checklist) localStorage.setItem(CHECKLIST_KEY, JSON.stringify(data.checklist));
    return { ok: true, msg: "הנתונים שוחזרו בהצלחה! טוען מחדש..." };
  } catch {
    return { ok: false, msg: "קובץ לא תקין — וודאו שהוא גובה JSON מהאפליקציה." };
  }
}

export default function SettingsPage() {
  const [toast, setToast]   = useState<{ msg: string; ok: boolean } | null>(null);
  const fileRef             = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const handleExport = () => {
    exportData();
    showToast("גיבוי הורד בהצלחה", true);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = importData(ev.target?.result as string);
      showToast(result.msg, result.ok);
      if (result.ok) setTimeout(() => window.location.reload(), 1500);
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (!confirm("למחוק את כל ההתקדמות? פעולה זו אינה ניתנת לביטול.")) return;
    localStorage.removeItem(WORKFLOW_KEY);
    localStorage.removeItem(CHECKLIST_KEY);
    showToast("הנתונים נמחקו. טוען מחדש...", true);
    setTimeout(() => window.location.reload(), 1500);
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Rubik', system-ui, sans-serif" }}>
      <div className="mx-auto max-w-2xl px-6 pb-24 pt-10 space-y-10">

        {/* Header */}
        <div>
          <h1 style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.1, color: "#171717", letterSpacing: "-0.02em", marginBottom: 6 }}>
            הגדרות
          </h1>
          <p style={{ fontSize: 17, color: "#737373" }}>גיבוי, ייבוא ואיפוס נתונים</p>
        </div>

        {/* Sync status */}
        <div className="rounded-2xl p-5" style={{ border: "1px solid #e5e5e5" }}>
          <div className="mb-3 flex items-center gap-2">
            <Wifi className="h-5 w-5 text-neutral-400" />
            <span style={{ fontSize: 17, fontWeight: 600, color: "#171717" }}>סטטוס חיבור</span>
          </div>
          <SyncStatus />
          <p style={{ fontSize: 14, color: "#a3a3a3", marginTop: 8, lineHeight: 1.5 }}>
            האפליקציה עובדת גם ללא אינטרנט. כל הנתונים נשמרים מקומית.
          </p>
        </div>

        {/* Backup */}
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#a3a3a3", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            גיבוי ושחזור
          </p>
          <div className="space-y-3">

            {/* Export */}
            <button onClick={handleExport}
              className="flex w-full cursor-pointer items-center gap-4 rounded-2xl p-5 transition-colors hover:bg-neutral-50"
              style={{ border: "1px solid #e5e5e5", background: "#fff", textAlign: "right" }}>
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl" style={{ background: "#f0fdf4" }}>
                <Download className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 17, fontWeight: 600, color: "#171717" }}>ייצוא גיבוי JSON</p>
                <p style={{ fontSize: 14, color: "#737373" }}>הורד את כל ההגדרות וההתקדמות</p>
              </div>
            </button>

            {/* Import */}
            <button onClick={() => fileRef.current?.click()}
              className="flex w-full cursor-pointer items-center gap-4 rounded-2xl p-5 transition-colors hover:bg-neutral-50"
              style={{ border: "1px solid #e5e5e5", background: "#fff", textAlign: "right" }}>
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl" style={{ background: "#f0f9ff" }}>
                <Upload className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 17, fontWeight: 600, color: "#171717" }}>ייבוא גיבוי</p>
                <p style={{ fontSize: 14, color: "#737373" }}>שחזר מקובץ JSON קודם</p>
              </div>
            </button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

          </div>
        </div>

        {/* App info */}
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#a3a3a3", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            מידע על האפליקציה
          </p>
          <div className="rounded-2xl p-5" style={{ background: "#fafafa", border: "1px solid #e5e5e5" }}>
            {[
              ["טיול",       "רודוס, יוון"],
              ["תאריכים",    "7–10 ספטמבר 2026"],
              ["נוסעים",     "אבא + נועם + מעיין"],
              ["גרסה",       "2.0 — PWA"],
              ["אחסון",      "Local Storage"],
              ["Offline",    "מלא — ללא אינטרנט"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border-b border-neutral-100 py-3 last:border-0">
                <span style={{ fontSize: 15, color: "#737373" }}>{k}</span>
                <span style={{ fontSize: 15, fontWeight: 500, color: "#171717" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PWA install hint */}
        <div className="rounded-2xl p-5" style={{ background: "#fef3c7", border: "1px solid #fde68a" }}>
          <div className="mb-2 flex items-center gap-2">
            <Info className="h-5 w-5 text-amber-600" />
            <span style={{ fontSize: 16, fontWeight: 700, color: "#b45309" }}>התקינו כ-App</span>
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: "#92400e" }}>
            ב-iPhone: Safari → שתף → &quot;הוסף למסך הבית&quot;<br />
            ב-Android: Chrome → תפריט (⋮) → &quot;הוסף למסך הבית&quot;
          </p>
        </div>

        {/* Reset — danger zone */}
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#a3a3a3", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            אזור מסוכן
          </p>
          <button onClick={handleReset}
            className="flex w-full cursor-pointer items-center gap-4 rounded-2xl p-5 transition-colors hover:bg-red-50"
            style={{ border: "1px solid #fecaca", background: "#fff", textAlign: "right" }}>
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl" style={{ background: "#fef2f2" }}>
              <Trash2 className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 17, fontWeight: 600, color: "#ef4444" }}>מחק כל הנתונים</p>
              <p style={{ fontSize: 14, color: "#737373" }}>איפוס מוחלט — לא ניתן לשחזר</p>
            </div>
          </button>
        </div>

      </div>

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-24 left-4 right-4 flex items-center gap-3 rounded-2xl p-4 shadow-lg transition-all duration-300 md:bottom-6 md:left-auto md:right-6 md:max-w-sm"
          style={{ background: toast.ok ? "#171717" : "#ef4444", zIndex: 100 }}>
          {toast.ok
            ? <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-400" />
            : <RefreshCw    className="h-5 w-5 flex-shrink-0 text-white" />
          }
          <span style={{ fontSize: 15, fontWeight: 500, color: "#fff" }}>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
