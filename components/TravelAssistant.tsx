"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sparkles, X, ExternalLink, User, MapPin, AlertCircle,
  ChevronRight, Utensils, Hotel, Compass, CalendarDays,
  Wallet, CheckCircle2, Clock,
} from "lucide-react";

const GPT_URL = "https://chatgpt.com/g/g-6a317d4a92088191abb687ad50aca7df-mdryk-rvdvs";

const QUICK_QUESTIONS = [
  { q: "מה הכי מומלץ לילדים ברודוס?",   icon: Compass      },
  { q: "איפה אפשר לאכול טבעוני?",        icon: Utensils     },
  { q: "מה כדאי לראות ביום ראשון?",      icon: CalendarDays },
  { q: "אלרגיה לחלב — מה לשים לב?",     icon: AlertCircle  },
];

function openGPT(question?: string) {
  const url = question
    ? `${GPT_URL}?q=${encodeURIComponent(question)}`
    : GPT_URL;
  window.open(url, "_blank", "noopener,noreferrer");
}

interface TripContext {
  daysLeft:       number;
  completedSteps: number;
  budgetRemaining: number;
  currentStage:   string;
  selectedHotel:  string;
}

function loadContext(): TripContext {
  let completedSteps = 2;
  let currentStage   = "בחירת מלון";
  let budgetRemaining = 9888;
  let selectedHotel   = "Avalon Boutique Hotel";

  try {
    const wf = JSON.parse(localStorage.getItem("ftp-workflow-v3") ?? "null");
    if (wf) {
      const steps   = Object.entries(wf) as [string, { status: string; pct: number }][];
      completedSteps = steps.filter(([, s]) => s.status === "complete").length;
      const current  = steps.find(([, s]) => s.status === "current");
      const labelMap: Record<string, string> = {
        destination: "יעד", flights: "טיסות", hotel: "מלון",
        restaurants: "מסעדות", activities: "אטרקציות", packing: "אריזה", ready: "מוכנים!",
      };
      if (current) currentStage = labelMap[current[0]] ?? current[0];
    }
  } catch { /* ignore */ }

  try {
    const b = JSON.parse(localStorage.getItem("ftp-budget-v1") ?? "null");
    if (b) {
      const planned = (b.categories ?? []).reduce((s: number, c: { planned: number; purchased: boolean }) =>
        s + (c.purchased ? 0 : c.planned), 0);
      const actual  = (b.expenses ?? []).reduce((s: number, e: { amount: number }) => s + e.amount, 0);
      const purch   = (b.categories ?? []).filter((c: { purchased: boolean }) => c.purchased)
        .reduce((s: number, c: { planned: number }) => s + c.planned, 0);
      budgetRemaining = planned - actual;
      const hotelCat  = (b.categories ?? []).find((c: { id: string }) => c.id === "hotel");
      if (hotelCat?.purchased) selectedHotel = "הוזמן";
    }
  } catch { /* ignore */ }

  const daysLeft = Math.max(0, Math.ceil((new Date("2026-09-07").getTime() - Date.now()) / 86_400_000));
  return { daysLeft, completedSteps, budgetRemaining, currentStage, selectedHotel };
}

export function TravelAssistant() {
  const [open, setOpen] = useState(false);
  const [ctx,  setCtx]  = useState<TripContext>({
    daysLeft: 80, completedSteps: 3, budgetRemaining: 5396, currentStage: "מסעדות", selectedHotel: "Avalon Boutique Hotel",
  });
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setCtx(loadContext());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const fmt = (n: number) => Math.round(n).toLocaleString("he-IL");

  return (
    <>
      {/* ── FAB — visible on all breakpoints ───────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        aria-label="פתח עוזר נסיעות"
        className="fixed z-40 flex cursor-pointer items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          // Mobile: bottom-left above nav bar
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 70px)",
          left: 16,
          background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
          color: "#fff",
          border: "none",
          borderRadius: 28,
          padding: "12px 18px 12px 14px",
          boxShadow: "0 4px 24px rgba(124,58,237,0.45)",
          fontFamily: "'Rubik', system-ui, sans-serif",
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        <Sparkles className="h-5 w-5 flex-shrink-0" />
        <span className="hidden sm:inline">Rhodes Travel Assistant</span>
        <span className="sm:hidden">עוזר AI</span>
      </button>

      {/* Override FAB position on desktop */}
      <style>{`
        @media (min-width: 768px) {
          button[aria-label="פתח עוזר נסיעות"] {
            bottom: 32px !important;
            left: 32px !important;
          }
        }
      `}</style>

      {/* ── Backdrop ──────────────────────────────────────────────────────────── */}
      {open && (
        <div className="fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)" }}
          aria-hidden />
      )}

      {/* ── Slide-up panel (mobile) / side panel (desktop) ───────────────────── */}
      <div
        ref={panelRef}
        className="fixed z-50"
        style={{
          // Mobile: bottom sheet
          bottom: 0,
          left: 0,
          right: 0,
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
        {/* Desktop overrides via inline style block */}
        <style>{`
          @media (min-width: 768px) {
            .ta-panel {
              left: auto !important;
              right: 32px !important;
              bottom: 100px !important;
              width: 420px !important;
              border-radius: 24px !important;
              max-height: 80vh !important;
              transform: ${open ? "translateY(0) scale(1)" : "translateY(20px) scale(0.96)"} !important;
              opacity: ${open ? 1 : 0} !important;
              transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.25s ease !important;
            }
          }
        `}</style>

        <div className="ta-panel"
          style={{
            // Inherit from parent — CSS overrides apply for desktop
          }}>

          {/* Handle (mobile) */}
          <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="h-1 w-10 rounded-full" style={{ background: "#e5e5e5" }} />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-4 pt-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl"
                style={{ background: "linear-gradient(135deg, #7c3aed18, #4f46e518)" }}>
                <Sparkles className="h-6 w-6" style={{ color: "#7c3aed" }} />
              </div>
              <div>
                <p style={{ fontSize: 19, fontWeight: 800, color: "#171717", lineHeight: 1 }}>Rhodes Travel Assistant</p>
                <p style={{ fontSize: 13, color: "#a3a3a3", marginTop: 2 }}>AI · רודוס ספטמבר 2026</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="cursor-pointer rounded-xl p-2 transition-colors hover:bg-neutral-100" aria-label="סגור">
              <X className="h-5 w-5 text-neutral-400" />
            </button>
          </div>

          <div className="space-y-4 px-5">

            {/* Trip summary */}
            <div className="overflow-hidden rounded-2xl" style={{ background: "#171717" }}>
              <div className="p-4">
                <p style={{ fontSize: 11, fontWeight: 700, color: "#737373", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  מצב הטיול הנוכחי
                </p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { icon: Clock,        label: "ימים לטיול",  val: String(ctx.daysLeft) },
                    { icon: CheckCircle2, label: "שלבים",       val: `${ctx.completedSteps}/7` },
                    { icon: Wallet,       label: "תקציב נותר",  val: `₪${fmt(Math.max(0, ctx.budgetRemaining))}` },
                    { icon: MapPin,       label: "שלב נוכחי",   val: ctx.currentStage },
                  ].map(({ icon: Icon, label, val }) => (
                    <div key={label} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.07)" }}>
                      <Icon className="mb-1 h-3.5 w-3.5" style={{ color: "#737373" }} />
                      <p style={{ fontSize: 11, color: "#737373", lineHeight: 1 }}>{label}</p>
                      <p style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginTop: 2, lineHeight: 1 }}>{val}</p>
                    </div>
                  ))}
                </div>
                {/* Static context shown to GPT */}
                <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <p style={{ fontSize: 11, color: "#525252", lineHeight: 1.5 }}>
                    יעד: רודוס, יוון · 7–10 ספטמבר 2026 · 3 לילות<br />
                    משפחה: אבא(41) + נועם(13) + מעיין(10) · אלרגיה לחלב + טבעוני<br />
                    מלון: {ctx.selectedHotel}
                  </p>
                </div>
              </div>
            </div>

            {/* Family profile */}
            <div className="rounded-2xl p-4" style={{ border: "1px solid #f0f0f0" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#a3a3a3", marginBottom: 10 }}>פרופיל משפחה</p>
              {[
                { name: "מארק (אבא)", age: "41", note: "מארגן" },
                { name: "נועם",       age: "13", note: "מתבגר" },
                { name: "מעיין",      age: "10", note: "אלרגית לחלב" },
              ].map(p => (
                <div key={p.name} className="flex items-center gap-3 mb-2 last:mb-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: "#f5f5f5" }}>
                    <User className="h-3.5 w-3.5 text-neutral-400" />
                  </div>
                  <span style={{ fontSize: 15, color: "#171717", flex: 1 }}>{p.name}</span>
                  <span style={{ fontSize: 13, color: "#a3a3a3" }}>{p.note}</span>
                </div>
              ))}
              <div className="mt-3 flex items-center gap-2 rounded-xl p-2.5" style={{ background: "#fef9ec" }}>
                <AlertCircle className="h-4 w-4 flex-shrink-0" style={{ color: "#ca8a04" }} />
                <span style={{ fontSize: 13, color: "#92400e" }}>אלרגיה לחלב + תזונה טבעונית (מעיין)</span>
              </div>
            </div>

            {/* Rhodes recommendations */}
            <div className="rounded-2xl p-4" style={{ border: "1px solid #f0f0f0" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#a3a3a3", marginBottom: 10 }}>המלצות מהירות</p>
              {[
                { icon: Hotel,     text: "Avalon Boutique Hotel — New Town, הוזמן!" },
                { icon: Utensils,  text: "ONO — הטבעוני הכי טוב ברודוס" },
                { icon: Compass,   text: "Knights Street — חובה עם הילדים" },
                { icon: MapPin,    text: "Lindos — שעה ורבע נסיעה" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-2.5 mb-2 last:mb-0">
                  <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: "#7c3aed" }} />
                  <span style={{ fontSize: 14, color: "#525252", lineHeight: 1.4 }}>{text}</span>
                </div>
              ))}
            </div>

            {/* Quick questions */}
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#a3a3a3", marginBottom: 10 }}>שאל את העוזר</p>
              <div className="space-y-2">
                {QUICK_QUESTIONS.map(({ q, icon: Icon }) => (
                  <button key={q} onClick={() => openGPT(q)}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-2xl p-3.5 text-right transition-colors hover:bg-neutral-50 active:bg-neutral-100"
                    style={{ border: "1px solid #f0f0f0", background: "#fff" }}>
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: "#f5f3ff" }}>
                      <Icon className="h-4 w-4" style={{ color: "#7c3aed" }} />
                    </div>
                    <span style={{ fontSize: 14, color: "#171717", flex: 1, lineHeight: 1.4 }}>{q}</span>
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-neutral-300" />
                  </button>
                ))}
              </div>
            </div>

            {/* Open GPT CTA */}
            <button onClick={() => openGPT()}
              className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl py-4 transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "#fff", border: "none", fontSize: 16, fontWeight: 700 }}>
              <Sparkles className="h-5 w-5" />
              פתח Rhodes Travel Assistant
              <ExternalLink className="h-4 w-4 opacity-70" />
            </button>

            <p style={{ fontSize: 12, color: "#d1d5db", textAlign: "center", paddingBottom: 8 }}>
              נפתח ב-ChatGPT עם הקשר הטיול שלכם
            </p>

          </div>
        </div>
      </div>
    </>
  );
}
