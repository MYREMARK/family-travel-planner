"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Hotel, Utensils, Compass, PackageCheck,
  ArrowLeft, CalendarDays, Clock, CheckCircle2,
  AlertCircle, Zap,
} from "lucide-react";

const TRIP_DATE  = new Date("2026-09-07");
const STORAGE_KEY = "ftp-workflow-v3";

type StepId     = "destination" | "flights" | "hotel" | "restaurants" | "activities" | "packing" | "ready";
type StepStatus = "complete" | "current" | "locked";
interface StepState { status: StepStatus; completionDate?: string; pct: number }
type WorkflowState = Record<StepId, StepState>;

const DEFAULT: WorkflowState = {
  destination: { status: "complete", completionDate: "2026-05-01", pct: 100 },
  flights:     { status: "complete", completionDate: "2026-06-16", pct: 100 },
  hotel:       { status: "current",  pct: 0 },
  restaurants: { status: "locked",   pct: 0 },
  activities:  { status: "locked",   pct: 0 },
  packing:     { status: "locked",   pct: 0 },
  ready:       { status: "locked",   pct: 0 },
};

interface Task {
  id: string;
  priority: "urgent" | "soon" | "later";
  icon: React.FC<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  description: string;
  action: string;
  href: string;
  color: string;
  bg: string;
}

function getTasks(wf: WorkflowState, daysLeft: number): Task[] {
  const tasks: Task[] = [];

  if (wf.hotel.status === "current") {
    tasks.push({
      id: "book-hotel",
      priority: "urgent",
      icon: Hotel,
      title: "הזמינו מלון",
      description: `נותרו ${daysLeft} ימים — ספטמבר מתמלא. In Camera Art Boutique הוא המלון המומלץ.`,
      action: "ראה המלצות מלון",
      href: "/",
      color: "#ef4444",
      bg: "#fef2f2",
    });
  }

  if (wf.restaurants.status === "current") {
    tasks.push({
      id: "plan-restaurants",
      priority: "urgent",
      icon: Utensils,
      title: "תכנוני מסעדות",
      description: "4 מסעדות טבעוניות ובטוחות לאלרגיה לחלב ממתינות לבחירה.",
      action: "ראה מסעדות",
      href: "/restaurants",
      color: "#16a34a",
      bg: "#f0fdf4",
    });
  }

  if (wf.activities.status === "current") {
    tasks.push({
      id: "plan-activities",
      priority: "urgent",
      icon: Compass,
      title: "תכנוני אטרקציות",
      description: "7 חוויות ממתינות — Harry Potter alleys, שקיעות, ספירת כוכבים.",
      action: "ראה אטרקציות",
      href: "/planner",
      color: "#7c3aed",
      bg: "#f5f3ff",
    });
  }

  if (wf.packing.status === "current") {
    tasks.push({
      id: "packing",
      priority: "urgent",
      icon: PackageCheck,
      title: "מלאו את הצ'קליסט",
      description: "68 פריטים לאריזה — כולל תרופות לאלרגיה לחלב (קריטי!).",
      action: "פתח צ'קליסט",
      href: "/checklist",
      color: "#b45309",
      bg: "#fff7ed",
    });
  }

  if (wf.hotel.status !== "complete") {
    tasks.push({
      id: "check-insurance",
      priority: "soon",
      icon: AlertCircle,
      title: "בדקו ביטוח נסיעות",
      description: "ביטוח עם כיסוי אלרגיה חמורה — חשוב מאוד לפני הנסיעה.",
      action: "הוסף לצ'קליסט",
      href: "/checklist",
      color: "#0284c7",
      bg: "#f0f9ff",
    });
  }

  if (daysLeft < 30 && wf.packing.status !== "complete") {
    tasks.push({
      id: "start-packing",
      priority: "soon",
      icon: PackageCheck,
      title: "התחילו לארוז",
      description: `${daysLeft} ימים לטיול — זמן טוב להתחיל לאסוף.`,
      action: "פתח צ'קליסט",
      href: "/checklist",
      color: "#b45309",
      bg: "#fff7ed",
    });
  }

  return tasks;
}

function daysUntil(date: Date) {
  const now = new Date(); now.setHours(0,0,0,0);
  return Math.max(0, Math.ceil((date.getTime() - now.getTime()) / 86_400_000));
}

function overallPct(wf: WorkflowState) {
  const STEPS = ["destination","flights","hotel","restaurants","activities","packing","ready"] as StepId[];
  return Math.round(STEPS.filter(id => wf[id].status === "complete").length / STEPS.length * 100);
}

const PRIORITY_LABEL = { urgent: "דחוף עכשיו", soon: "בקרוב", later: "אחר כך" };
const PRIORITY_COLOR = { urgent: "#ef4444", soon: "#f59e0b", later: "#a3a3a3" };

export default function TodayPage() {
  const [wf, setWf] = useState<WorkflowState>(DEFAULT);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setWf(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const daysLeft = daysUntil(TRIP_DATE);
  const pct      = overallPct(wf);
  const tasks    = getTasks(wf, daysLeft);
  const top      = tasks[0];

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Rubik', system-ui, sans-serif" }}>
      <div className="mx-auto max-w-2xl px-6 pb-24 pt-10 space-y-10">

        {/* Header */}
        <div>
          <p style={{ fontSize: 16, color: "#a3a3a3", marginBottom: 6 }}>היום · {new Date().toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" })}</p>
          <h1 style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.1, color: "#171717", letterSpacing: "-0.02em" }}>
            מה לעשות<br />עכשיו?
          </h1>
        </div>

        {/* Trip countdown */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { val: String(daysLeft), label: "ימים לטיול" },
            { val: `${pct}%`,        label: "הושלם" },
            { val: `${tasks.length}`,label: "משימות פתוחות" },
          ].map(({ val, label }) => (
            <div key={label} className="rounded-2xl p-4 text-center" style={{ background: "#fafafa", border: "1px solid #f0f0f0" }}>
              <p style={{ fontSize: 26, fontWeight: 900, color: "#171717", lineHeight: 1 }}>{val}</p>
              <p style={{ fontSize: 13, color: "#a3a3a3", marginTop: 4 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* #1 Priority */}
        {top && (
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#a3a3a3", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              עדיפות עליונה עכשיו
            </p>
            <div className="overflow-hidden rounded-3xl" style={{ background: "#171717" }}>
              <div className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: top.bg }}>
                    <top.icon className="h-6 w-6" style={{ color: top.color }} />
                  </div>
                  <span className="rounded-full px-3 py-1" style={{ fontSize: 13, fontWeight: 700, background: "rgba(239,68,68,0.15)", color: "#fca5a5" }}>
                    {PRIORITY_LABEL[top.priority]}
                  </span>
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 8 }}>{top.title}</h2>
                <p style={{ fontSize: 16, lineHeight: 1.6, color: "#a3a3a3", marginBottom: 20 }}>{top.description}</p>
                <Link href={top.href}
                  className="inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-[#171717] transition-opacity hover:opacity-90"
                  style={{ background: "#fff", fontSize: 16, fontWeight: 700, textDecoration: "none" }}>
                  {top.action}
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Remaining tasks */}
        {tasks.length > 1 && (
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#a3a3a3", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              שאר המשימות
            </p>
            <div className="space-y-3">
              {tasks.slice(1).map(task => (
                <Link key={task.id} href={task.href}
                  className="flex items-center gap-4 rounded-2xl p-4 transition-colors hover:bg-neutral-50"
                  style={{ border: "1px solid #f0f0f0", textDecoration: "none" }}>
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: task.bg }}>
                    <task.icon className="h-5 w-5" style={{ color: task.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 16, fontWeight: 600, color: "#171717" }}>{task.title}</p>
                    <p style={{ fontSize: 14, color: PRIORITY_COLOR[task.priority], marginTop: 2 }}>
                      {PRIORITY_LABEL[task.priority]}
                    </p>
                  </div>
                  <ArrowLeft className="h-4 w-4 flex-shrink-0 text-neutral-300" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All complete */}
        {tasks.length === 0 && (
          <div className="rounded-3xl p-8 text-center" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#15803d", marginBottom: 8 }}>הכל מוכן!</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: "#16a34a" }}>כל המשימות הושלמו. רודוס מחכה לכם.</p>
          </div>
        )}

        {/* Trip timeline */}
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#a3a3a3", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            ציר זמן
          </p>
          <div className="space-y-2">
            {[
              { icon: Zap,          label: "היום",               sub: new Date().toLocaleDateString("he-IL"),                      done: true  },
              { icon: Hotel,        label: "הזמנת מלון",          sub: "בהקדם האפשרי",                                              done: wf.hotel.status === "complete" },
              { icon: Utensils,     label: "תכנון מסעדות",        sub: "לאחר הזמנת מלון",                                           done: wf.restaurants.status === "complete" },
              { icon: PackageCheck, label: "אריזה",               sub: "שבועיים לפני הטיול",                                        done: wf.packing.status === "complete" },
              { icon: CalendarDays, label: "יום הטיסה",           sub: "7 ספטמבר 2026",                                             done: false },
            ].map(({ icon: Icon, label, sub, done }) => (
              <div key={label} className="flex items-center gap-4 rounded-xl p-3"
                style={{ background: done ? "#f0fdf4" : "#fafafa", border: `1px solid ${done ? "#bbf7d0" : "#f0f0f0"}` }}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
                  style={{ background: done ? "#dcfce7" : "#f5f5f5" }}>
                  <Icon className="h-4 w-4" style={{ color: done ? "#16a34a" : "#a3a3a3" }} />
                </div>
                <div className="flex-1">
                  <p style={{ fontSize: 15, fontWeight: 600, color: done ? "#15803d" : "#171717" }}>{label}</p>
                  <p style={{ fontSize: 13, color: "#a3a3a3" }}>{sub}</p>
                </div>
                {done && <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500" />}
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/planner" className="block rounded-2xl p-4 transition-colors hover:bg-neutral-50"
            style={{ border: "1px solid #e5e5e5", textDecoration: "none" }}>
            <CalendarDays className="mb-2 h-5 w-5 text-neutral-400" />
            <p style={{ fontSize: 15, fontWeight: 600, color: "#171717" }}>מסלול 4 ימים</p>
            <p style={{ fontSize: 13, color: "#a3a3a3" }}>שעות ומסעדות</p>
          </Link>
          <Link href="/checklist" className="block rounded-2xl p-4 transition-colors hover:bg-neutral-50"
            style={{ border: "1px solid #e5e5e5", textDecoration: "none" }}>
            <PackageCheck className="mb-2 h-5 w-5 text-neutral-400" />
            <p style={{ fontSize: 15, fontWeight: 600, color: "#171717" }}>צ'קליסט</p>
            <p style={{ fontSize: 13, color: "#a3a3a3" }}>68 פריטים</p>
          </Link>
        </div>

      </div>
    </div>
  );
}
