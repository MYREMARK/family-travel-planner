"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sparkles, X, ExternalLink, User, MapPin, AlertCircle,
  ChevronRight, Utensils, Hotel, Compass, CalendarDays,
} from "lucide-react";

const GPT_URL = "https://chatgpt.com/g/g-p-686e6dd8cb0881919d1e1d0e9d9b6b64-rhodes-family-trip";

const QUICK_QUESTIONS = [
  { q: "מה הכי מומלץ לילדים ברודוס?",   icon: Compass  },
  { q: "איפה אפשר לאכול טבעוני?",        icon: Utensils },
  { q: "מה כדאי לראות ביום ראשון?",      icon: CalendarDays },
  { q: "אלרגיה לחלב — מה לשים לב?",     icon: AlertCircle  },
];

function openGPT(question?: string) {
  const url = question
    ? `${GPT_URL}?q=${encodeURIComponent(question)}`
    : GPT_URL;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function TravelAssistant() {
  const [open,   setOpen]   = useState(false);
  const [wf,     setWf]     = useState<Record<string, { status: string; pct: number }> | null>(null);
  const [budget, setBudget] = useState<{ totalPlanned?: number; totalActual?: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ftp-workflow-v3");
      if (raw) setWf(JSON.parse(raw));
    } catch { /* ignore */ }
    try {
      const raw = localStorage.getItem("ftp-budget-v1");
      if (raw) {
        const b = JSON.parse(raw);
        const totalPlanned = (b.categories ?? []).reduce((s: number, c: { planned: number }) => s + c.planned, 0);
        const totalActual  = (b.expenses  ?? []).reduce((s: number, e: { amount:  number }) => s + e.amount,  0);
        setBudget({ totalPlanned, totalActual });
      }
    } catch { /* ignore */ }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const daysLeft = Math.max(0, Math.ceil((new Date("2026-09-07").getTime() - Date.now()) / 86_400_000));
  const completedSteps = wf
    ? Object.values(wf).filter(s => s.status === "complete").length
    : 2;

  return (
    <>
      {/* ── FAB ──────────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        aria-label="פתח עוזר נסיעות"
        className="fixed z-40 flex items-center gap-2 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 md:hidden"
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 70px)",
          left: 16,
          background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
          color: "#fff",
          border: "none",
          borderRadius: 28,
          padding: "12px 18px 12px 14px",
          boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
          fontFamily: "'Rubik', system-ui, sans-serif",
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        <Sparkles className="h-5 w-5 flex-shrink-0" />
        עוזר נסיעות
      </button>

      {/* ── Backdrop ─────────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)" }}
          aria-hidden
        />
      )}

      {/* ── Slide-up panel ───────────────────────────────────────────── */}
      <div
        ref={panelRef}
        className="fixed left-0 right-0 z-50 md:hidden"
        style={{
          bottom: 0,
          background: "#fff",
          borderRadius: "24px 24px 0 0",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
          maxHeight: "88vh",
          overflowY: "auto",
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
          fontFamily: "'Rubik', system-ui, sans-serif",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full" style={{ background: "#e5e5e5" }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4 pt-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{ background: "linear-gradient(135deg, #7c3aed18, #4f46e518)" }}>
              <Sparkles className="h-6 w-6" style={{ color: "#7c3aed" }} />
            </div>
            <div>
              <p style={{ fontSize: 19, fontWeight: 800, color: "#171717", lineHeight: 1 }}>עוזר נסיעות</p>
              <p style={{ fontSize: 13, color: "#a3a3a3", marginTop: 2 }}>AI לרודוס 2026</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="cursor-pointer rounded-xl p-2 transition-colors hover:bg-neutral-100" aria-label="סגור">
            <X className="h-5 w-5 text-neutral-400" />
          </button>
        </div>

        <div className="space-y-5 px-5">

          {/* Trip summary */}
          <div className="overflow-hidden rounded-2xl" style={{ background: "#171717" }}>
            <div className="p-4">
              <p style={{ fontSize: 13, fontWeight: 700, color: "#737373", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                סיכום הטיול
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: String(daysLeft), label: "ימים לטיול" },
                  { val: `${completedSteps}/7`,  label: "שלבים" },
                  { val: budget ? `₪${Math.round((budget.totalPlanned ?? 0) - (budget.totalActual ?? 0)).toLocaleString()}` : "₪9,388", label: "תקציב נותר" },
                ].map(({ val, label }) => (
                  <div key={label} className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.07)" }}>
                    <p style={{ fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{val}</p>
                    <p style={{ fontSize: 11, color: "#737373", marginTop: 3 }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Family profile */}
          <div className="rounded-2xl p-4" style={{ border: "1px solid #f0f0f0" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#a3a3a3", marginBottom: 10 }}>פרופיל משפחה</p>
            <div className="space-y-2">
              {[
                { name: "אבא (מארק)",  age: "41", note: "מארגן" },
                { name: "נועם",         age: "13", note: "מתבגר" },
                { name: "מעיין",        age: "10", note: "אלרגית לחלב" },
              ].map(p => (
                <div key={p.name} className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: "#f5f5f5" }}>
                    <User className="h-3.5 w-3.5 text-neutral-400" />
                  </div>
                  <span style={{ fontSize: 15, color: "#171717", flex: 1 }}>{p.name}</span>
                  <span style={{ fontSize: 13, color: "#a3a3a3" }}>{p.note}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-xl p-2.5" style={{ background: "#fef9ec" }}>
              <AlertCircle className="h-4 w-4 flex-shrink-0" style={{ color: "#ca8a04" }} />
              <span style={{ fontSize: 13, color: "#92400e" }}>אלרגיה לחלב + תזונה טבעונית — ייתכן שמעיין</span>
            </div>
          </div>

          {/* Rhodes tips */}
          <div className="rounded-2xl p-4" style={{ border: "1px solid #f0f0f0" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#a3a3a3", marginBottom: 10 }}>המלצות מהירות</p>
            <div className="space-y-2">
              {[
                { icon: Hotel,     text: "In Camera Boutique — מרכז העיר העתיקה" },
                { icon: Utensils,  text: "ONO — הטבעוני הכי טוב ברודוס" },
                { icon: Compass,   text: "Knights Street — חובה עם הילדים" },
                { icon: MapPin,    text: "Lindos — שעה ורבע מהעיר" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-2.5">
                  <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: "#7c3aed" }} />
                  <span style={{ fontSize: 14, color: "#525252", lineHeight: 1.4 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick questions */}
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#a3a3a3", marginBottom: 10 }}>שאל את העוזר</p>
            <div className="space-y-2">
              {QUICK_QUESTIONS.map(({ q, icon: Icon }) => (
                <button key={q} onClick={() => openGPT(q)}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-2xl p-4 text-right transition-colors hover:bg-neutral-50 active:bg-neutral-100"
                  style={{ border: "1px solid #f0f0f0", background: "#fff" }}>
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{ background: "#f5f3ff" }}>
                    <Icon className="h-4.5 w-4.5" style={{ color: "#7c3aed" }} />
                  </div>
                  <span style={{ fontSize: 15, color: "#171717", flex: 1, lineHeight: 1.4 }}>{q}</span>
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-neutral-300" />
                </button>
              ))}
            </div>
          </div>

          {/* Open GPT CTA */}
          <button
            onClick={() => openGPT()}
            className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl py-4 transition-opacity hover:opacity-90 active:opacity-80"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              color: "#fff",
              border: "none",
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            <Sparkles className="h-5 w-5" />
            פתח עוזר AI ברודוס
            <ExternalLink className="h-4 w-4 opacity-70" />
          </button>

          <p style={{ fontSize: 12, color: "#d1d5db", textAlign: "center", paddingBottom: 4 }}>
            נפתח ב-ChatGPT עם הקשר הטיול שלכם
          </p>
        </div>
      </div>
    </>
  );
}
