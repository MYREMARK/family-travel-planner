"use client";

import { useState, useEffect } from "react";
import {
  CalendarDays, Plane, Hotel, Utensils, Compass,
  PackageCheck, CheckCircle2, Clock, Circle, Lock,
  AlertCircle, Luggage,
} from "lucide-react";

type StepId     = "destination" | "flights" | "hotel" | "restaurants" | "activities" | "packing" | "ready";
type StepStatus = "complete" | "current" | "locked";
interface StepState { status: StepStatus; completionDate?: string; pct: number }
type WorkflowState = Record<StepId, StepState>;

const DEFAULT_WF: WorkflowState = {
  destination: { status: "complete", completionDate: "2026-05-01", pct: 100 },
  flights:     { status: "complete", completionDate: "2026-06-16", pct: 100 },
  hotel:       { status: "complete", completionDate: "2026-06-18", pct: 100 },
  restaurants: { status: "locked",   pct: 0 },
  activities:  { status: "locked",   pct: 0 },
  packing:     { status: "locked",   pct: 0 },
  ready:       { status: "locked",   pct: 0 },
};

interface Milestone {
  id:       string;
  label:    string;
  subLabel: string;
  date:     string | null;
  daysFromNow: number | null;
  icon:     React.FC<{ className?: string; style?: React.CSSProperties }>;
  status:   "done" | "current" | "future" | "trip";
  color:    string;
  bg:       string;
  note?:    string;
}

function daysUntil(isoDate: string): number {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const target = new Date(isoDate);
  return Math.ceil((target.getTime() - now.getTime()) / 86_400_000);
}

function fmtDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
}

function getMilestones(wf: WorkflowState): Milestone[] {
  const today  = new Date().toISOString().slice(0, 10);

  const items: Milestone[] = [
    {
      id: "today", label: "היום",
      subLabel: new Date().toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" }),
      date: today, daysFromNow: 0,
      icon: Clock, status: "done", color: "#171717", bg: "#f5f5f5",
    },
    {
      id: "flights-booked", label: "טיסות נרכשו",
      subLabel: wf.flights.completionDate ? fmtDate(wf.flights.completionDate) : "הושלם",
      date: wf.flights.completionDate ?? null,
      daysFromNow: wf.flights.completionDate ? daysUntil(wf.flights.completionDate) : null,
      icon: Plane,
      status: wf.flights.status === "complete" ? "done" : "future",
      color: "#7c3aed", bg: "#f5f3ff",
      note: "✈ אל-על TLV→RHO",
    },
    {
      id: "hotel-booking", label: "הזמנת מלון",
      subLabel: wf.hotel.status === "complete"
        ? (wf.hotel.completionDate ? fmtDate(wf.hotel.completionDate) : "הושלם")
        : "בהקדם האפשרי",
      date: wf.hotel.completionDate ?? null,
      daysFromNow: null,
      icon: Hotel,
      status: wf.hotel.status === "complete" ? "done" : wf.hotel.status === "current" ? "current" : "future",
      color: "#3b82f6", bg: "#eff6ff",
      note: "Avalon Boutique Hotel — New Town · הוזמן!",
    },
    {
      id: "restaurants-plan", label: "תכנון מסעדות",
      subLabel: wf.restaurants.status === "complete" ? "הושלם" : "לאחר הזמנת מלון",
      date: null, daysFromNow: null,
      icon: Utensils,
      status: wf.restaurants.status === "complete" ? "done" : wf.restaurants.status === "current" ? "current" : "future",
      color: "#22c55e", bg: "#f0fdf4",
      note: "ONO, RuBisCo, Annie's Vegan",
    },
    {
      id: "activities-plan", label: "תכנון אטרקציות",
      subLabel: wf.activities.status === "complete" ? "הושלם" : "לאחר תכנון מסעדות",
      date: null, daysFromNow: null,
      icon: Compass,
      status: wf.activities.status === "complete" ? "done" : wf.activities.status === "current" ? "current" : "future",
      color: "#06b6d4", bg: "#ecfeff",
      note: "Knights St, Lindos, שקיעות",
    },
    {
      id: "packing", label: "אריזה",
      subLabel: wf.packing.status === "complete" ? "הושלם" : "שבועיים לפני הטיול",
      date: "2026-08-24",
      daysFromNow: daysUntil("2026-08-24"),
      icon: PackageCheck,
      status: wf.packing.status === "complete" ? "done" : wf.packing.status === "current" ? "current" : "future",
      color: "#f59e0b", bg: "#fff7ed",
      note: "אל תשכחו תרופות לאלרגיה לחלב!",
    },
    {
      id: "check-in", label: "צ'ק אין מקוון",
      subLabel: "6 ספטמבר 2026",
      date: "2026-09-06",
      daysFromNow: daysUntil("2026-09-06"),
      icon: AlertCircle,
      status: daysUntil("2026-09-06") <= 0 ? "done" : "future",
      color: "#ec4899", bg: "#fdf2f8",
      note: "אל-על — 24 שעות לפני הטיסה",
    },
    {
      id: "travel-day", label: "יום הטיסה",
      subLabel: "7 ספטמבר 2026",
      date: "2026-09-07",
      daysFromNow: daysUntil("2026-09-07"),
      icon: Luggage,
      status: "trip",
      color: "#ca8a04", bg: "#fef9ec",
      note: "TLV → RHO · רודוס מחכה!",
    },
  ];

  return items;
}

export default function TimelinePage() {
  const [wf, setWf] = useState<WorkflowState>(DEFAULT_WF);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ftp-workflow-v3");
      if (raw) setWf(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const milestones = getMilestones(wf);
  const totalDays  = daysUntil("2026-09-07");
  const doneMilestones = milestones.filter(m => m.status === "done").length;

  const StatusIcon = ({ status }: { status: Milestone["status"] }) => {
    if (status === "done")    return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (status === "current") return <div className="h-4 w-4 animate-pulse rounded-full bg-blue-500" />;
    if (status === "trip")    return <div className="h-4 w-4 rounded-full" style={{ background: "#ca8a04" }} />;
    return <Circle className="h-5 w-5 text-neutral-300" />;
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Rubik', system-ui, sans-serif" }}>
      <div className="mx-auto max-w-2xl px-4 pb-36 pt-10 space-y-8 md:max-w-3xl">

        {/* Header */}
        <div>
          <p style={{ fontSize: 15, color: "#a3a3a3", marginBottom: 4 }}>רודוס · ספטמבר 2026</p>
          <h1 style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.1, color: "#171717", letterSpacing: "-0.02em" }}>
            ציר הזמן
          </h1>
        </div>

        {/* Hero countdown */}
        <div className="overflow-hidden rounded-3xl" style={{ background: "#171717" }}>
          <div className="p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p style={{ fontSize: 13, color: "#737373", marginBottom: 3 }}>נותרו</p>
                <p style={{ fontSize: 52, fontWeight: 900, color: "#fff", lineHeight: 1 }}>
                  {totalDays}
                </p>
                <p style={{ fontSize: 18, fontWeight: 600, color: "#a3a3a3" }}>ימים לטיסה</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <CalendarDays className="h-8 w-8 text-neutral-600" />
                <div className="rounded-2xl px-4 py-2 text-center" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <p style={{ fontSize: 11, color: "#737373" }}>7 ספטמבר</p>
                  <p style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>יום טיסה</p>
                </div>
              </div>
            </div>
            {/* Progress of planning */}
            <div className="mb-1.5 flex justify-between">
              <span style={{ fontSize: 13, color: "#737373" }}>אבני דרך שהושלמו: {doneMilestones}/{milestones.length}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{Math.round(doneMilestones / milestones.length * 100)}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.12)" }}>
              <div className="h-2.5 rounded-full transition-all duration-700"
                style={{ width: `${(doneMilestones / milestones.length) * 100}%`, background: "#22c55e" }} />
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute right-[22px] top-0 bottom-0 w-0.5 md:right-[26px]"
            style={{ background: "#f0f0f0" }} />

          <div className="space-y-3">
            {milestones.map((m, i) => {
              const Icon = m.icon;
              const isTrip = m.status === "trip";
              return (
                <div key={m.id} className="relative flex gap-4 md:gap-6">
                  {/* Icon bubble */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm md:h-12 md:w-12"
                      style={{ background: isTrip ? "#171717" : m.status === "done" ? m.bg : m.status === "current" ? m.bg : "#fafafa",
                               border: `2px solid ${m.status === "done" ? m.color + "40" : m.status === "current" ? m.color : "#f0f0f0"}` }}>
                      <Icon className="h-5 w-5"
                        style={{ color: isTrip ? "#ca8a04" : m.status === "done" || m.status === "current" ? m.color : "#a3a3a3" }} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`flex-1 min-w-0 pb-3 ${i < milestones.length - 1 ? "border-b border-neutral-50" : ""}`}>
                    <div className="flex items-start justify-between gap-2 pt-1">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span style={{ fontSize: 16, fontWeight: 700, color: isTrip ? "#ca8a04" : m.status === "done" ? "#16a34a" : m.status === "current" ? m.color : "#171717" }}>
                            {m.label}
                          </span>
                          {m.status === "current" && (
                            <span className="rounded-full px-2.5 py-0.5"
                              style={{ fontSize: 11, fontWeight: 700, background: m.color + "18", color: m.color }}>
                              עכשיו
                            </span>
                          )}
                          {isTrip && (
                            <span className="rounded-full px-2.5 py-0.5"
                              style={{ fontSize: 11, fontWeight: 700, background: "#fef9ec", color: "#92400e" }}>
                              יעד
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 14, color: "#a3a3a3", marginTop: 2 }}>{m.subLabel}</p>
                        {m.note && (
                          <p style={{ fontSize: 13, color: "#737373", marginTop: 4, lineHeight: 1.4 }}>{m.note}</p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <StatusIcon status={m.status} />
                        {m.daysFromNow !== null && m.daysFromNow > 0 && (
                          <span className="rounded-full px-2 py-0.5"
                            style={{ fontSize: 12, fontWeight: 700, background: m.daysFromNow < 30 ? "#fef2f2" : "#f5f5f5",
                                     color: m.daysFromNow < 30 ? "#dc2626" : "#737373" }}>
                            {m.daysFromNow < 0 ? "עבר" : `${m.daysFromNow} ימים`}
                          </span>
                        )}
                        {m.daysFromNow === 0 && (
                          <span className="rounded-full px-2 py-0.5"
                            style={{ fontSize: 12, fontWeight: 700, background: "#f0fdf4", color: "#15803d" }}>
                            היום
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trip dates breakdown */}
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#171717", marginBottom: 12 }}>תאריכי הטיול</h2>
          <div className="space-y-2">
            {[
              { date: "7 ספטמבר",  label: "יום 1 — יום הגעה",     note: "TLV 06:00 → RHO 07:40 · כניסה למלון ורחובות" },
              { date: "8 ספטמבר",  label: "יום 2 — עיר עתיקה",    note: "Knights Street, Acropolis, שקיעה מהחומות" },
              { date: "9 ספטמבר",  label: "יום 3 — Lindos + חוף", note: "Acropolis Lindos + ספירת כוכבים בלילה" },
              { date: "10 ספטמבר", label: "יום 4 — יום עזיבה",    note: "RHO → TLV, חזרה הביתה" },
            ].map(({ date, label, note }) => (
              <div key={date} className="flex items-center gap-4 rounded-2xl p-4"
                style={{ border: "1px solid #f0f0f0", background: "#fff" }}>
                <div className="flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-2xl"
                  style={{ background: "#fef9ec", border: "1px solid #fde68a" }}>
                  <span style={{ fontSize: 11, color: "#ca8a04", fontWeight: 700, lineHeight: 1 }}>ספט</span>
                  <span style={{ fontSize: 18, fontWeight: 900, color: "#92400e", lineHeight: 1 }}>{date.split(" ")[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#171717" }}>{label}</p>
                  <p style={{ fontSize: 13, color: "#a3a3a3", marginTop: 2 }}>{note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key reminders */}
        <div className="rounded-2xl p-5" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#dc2626", marginBottom: 10 }}>תזכורות קריטיות</p>
          <div className="space-y-2">
            {[
              "תרופות לאלרגיה לחלב — אפינפרין + אנטי-היסטמין",
              "צ'ק אין אונליין 24 שעות לפני (6 ספטמבר)",
              "שימו אוכל בשקית נוזלים בבטחה",
              "גיל 10 — ביטוח רפואי כולל אלרגיה חמורה",
            ].map(r => (
              <div key={r} className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                <span style={{ fontSize: 14, color: "#b91c1c", lineHeight: 1.4 }}>{r}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
