"use client";

import { useState } from "react";
import { itinerary } from "@/data/rhodes";
import {
  MapPin, Clock, ShieldAlert, Utensils, Landmark,
  Waves, Bus, ShoppingBag, ChevronLeft,
  ExternalLink, Leaf, AlertTriangle, ArrowLeft,
} from "lucide-react";

// ─── helpers ──────────────────────────────────────────────────────────────────
const EVENT_META = {
  restaurant: { Icon: Utensils,    color: "#16a34a", bg: "#f0fdf4", label: "מסעדה"   },
  attraction: { Icon: Landmark,    color: "#7c3aed", bg: "#f5f3ff", label: "אטרקציה" },
  beach:      { Icon: Waves,       color: "#0284c7", bg: "#f0f9ff", label: "חוף"      },
  transport:  { Icon: Bus,         color: "#525252", bg: "#fafafa", label: "תחבורה"   },
  activity:   { Icon: ShoppingBag, color: "#b45309", bg: "#fffbeb", label: "פעילות"   },
} as const;

function mapsUrl(lat: number, lng: number, title: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(title)}&center=${lat},${lng}`;
}

function BudgetBar({ cost, max }: { cost: number; max: number }) {
  const pct = Math.min(100, Math.round((cost / max) * 100));
  const color = pct > 100 ? "#dc2626" : pct > 85 ? "#ca8a04" : "#16a34a";
  return (
    <div>
      <div className="mb-1.5 flex justify-between">
        <span style={{ fontSize: 16, color: "#737373" }}>עלות יום</span>
        <span style={{ fontSize: 17, fontWeight: 700, color: "#171717" }}>
          €{cost} <span style={{ fontWeight: 400, color: "#a3a3a3" }}>/ €{max}</span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────
export default function PlannerPage() {
  const [activeDay, setActiveDay] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = itinerary as any[];
  const day  = data[activeDay];
  const events: any[] = day.events ?? [];

  const veganCount   = events.filter((e: any) => e.type === "restaurant" && String(e.allergyNote ?? "").includes("✅")).length;
  const warningCount = events.filter((e: any) => String(e.allergyNote ?? "").includes("⚠️")).length;

  const totalCost  = data.reduce((s: number, d: any) => s + (d.estimatedCost ?? 0), 0);
  const totalStops = data.flatMap((d: any) => d.events ?? []).length;
  const totalVegan = data.flatMap((d: any) => d.events ?? []).filter((e: any) => String(e.allergyNote ?? "").includes("✅")).length;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Rubik', system-ui, sans-serif" }}>
      <div className="mx-auto max-w-2xl px-6 pb-24 pt-10">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="mb-10">
          <p style={{ fontSize: 16, color: "#a3a3a3", marginBottom: 8 }}>רודוס · יולי 2025</p>
          <h1 style={{ fontSize: 40, fontWeight: 900, lineHeight: 1.1, color: "#171717", letterSpacing: "-0.02em", marginBottom: 10 }}>
            המסלול המומלץ
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.65, color: "#525252" }}>
            5 ימים לאבא, נועם ומעיין — ללא טרקים, מתחיל אחרי 10:00, עם שקיעות,
            Harry Potter vibes ומסעדות טבעוניות בכל יום.
          </p>
        </div>

        {/* ── Trip summary pills ───────────────────────────────────────── */}
        <div className="mb-8 grid grid-cols-3 gap-3">
          {[
            { val: `€${totalCost}`, label: "עלות כוללת" },
            { val: `${totalStops}`, label: "עצירות" },
            { val: `${totalVegan}`, label: "מסעדות מאושרות" },
          ].map(({ val, label }) => (
            <div key={label} className="rounded-2xl p-4 text-center" style={{ background: "#fafafa", border: "1px solid #f0f0f0" }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: "#171717", lineHeight: 1 }}>{val}</p>
              <p style={{ fontSize: 14, color: "#a3a3a3", marginTop: 4 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* ── Day tabs ────────────────────────────────────────────────── */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {itinerary.map((d, i) => (
            <button
              key={d.day}
              onClick={() => setActiveDay(i)}
              className="flex-shrink-0 cursor-pointer rounded-2xl px-4 py-3 text-right transition-all duration-200"
              style={{
                background: i === activeDay ? "#171717" : "#f5f5f5",
                color:      i === activeDay ? "#ffffff" : "#525252",
                fontWeight: i === activeDay ? 700 : 500,
                fontSize: 15,
                border: "none",
              }}
            >
              <span style={{ display: "block", fontSize: 12, opacity: 0.6, marginBottom: 2 }}>יום {d.day}</span>
              {d.emoji} {d.title.split("—")[0].trim()}
            </button>
          ))}
        </div>

        {/* ── Day card ─────────────────────────────────────────────────── */}
        <div className="mb-6 rounded-3xl bg-neutral-50 p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p style={{ fontSize: 14, color: "#a3a3a3", marginBottom: 4 }}>יום {day.day} מתוך 5</p>
              <h2 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.25, color: "#171717" }}>
                {day.emoji} {day.title}
              </h2>
            </div>
            <div className="flex-shrink-0 rounded-2xl bg-white px-4 py-3 text-center" style={{ border: "1px solid #e5e5e5" }}>
              <p style={{ fontSize: 24, fontWeight: 800, color: "#171717", lineHeight: 1 }}>€{day.estimatedCost}</p>
              <p style={{ fontSize: 13, color: "#a3a3a3", marginTop: 2 }}>ליום</p>
            </div>
          </div>

          <BudgetBar cost={day.estimatedCost} max={150} />

          <div className="mt-4 flex flex-wrap gap-2">
            {veganCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: "#f0fdf4", fontSize: 15, fontWeight: 500, color: "#16a34a" }}>
                <Leaf className="h-3.5 w-3.5" />
                {veganCount} מסעדות טבעוניות מאושרות
              </span>
            )}
            {warningCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: "#fff7ed", fontSize: 15, fontWeight: 500, color: "#ea580c" }}>
                <AlertTriangle className="h-3.5 w-3.5" />
                לבדוק אלרגיה ב-{warningCount} מקומות
              </span>
            )}
          </div>
        </div>

        {/* ── Events ───────────────────────────────────────────────────── */}
        <div className="relative space-y-4">
          <div className="absolute right-[27px] top-10 h-[calc(100%-5rem)] w-px" style={{ background: "#e5e5e5" }} />

          {events.map((event: any) => {
            const meta = ((EVENT_META as unknown) as Record<string, typeof EVENT_META.activity>)[event.type as string] ?? EVENT_META.activity;
            const Icon = meta.Icon;
            const url  = mapsUrl(event.lat, event.lng, event.title);
            const isVegan   = event.allergyNote?.includes("✅");
            const isWarning = event.allergyNote?.includes("⚠️");

            return (
              <div key={event.time + event.title} className="relative flex gap-4">

                {/* time + icon */}
                <div className="flex w-14 flex-shrink-0 flex-col items-center gap-1 pt-1.5">
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#a3a3a3" }}>{event.time}</span>
                  <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full" style={{ background: meta.bg, border: `2px solid ${meta.color}30` }}>
                    <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
                  </div>
                </div>

                {/* card */}
                <div className="mb-2 flex-1 overflow-hidden rounded-2xl transition-shadow duration-200 hover:shadow-md" style={{ border: "1px solid #f0f0f0", background: "#fff" }}>

                  {/* main content */}
                  <div className="p-5 pb-3">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <span className="mb-1.5 inline-block rounded-full px-2.5 py-0.5" style={{ fontSize: 12, fontWeight: 600, background: meta.bg, color: meta.color }}>
                          {meta.label}
                        </span>
                        <h3 style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.3, color: "#171717" }}>
                          {event.title}
                        </h3>
                      </div>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="cursor-pointer rounded-xl p-2 transition-colors hover:bg-neutral-100" aria-label={`פתח ${event.title} במפה`}>
                        <MapPin className="h-5 w-5 text-neutral-300 hover:text-neutral-500 transition-colors" />
                      </a>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1" style={{ fontSize: 15, color: "#737373" }}>
                        <Clock className="h-3.5 w-3.5" />
                        {event.duration}
                      </span>
                      <span style={{ fontSize: 15, fontWeight: 500, color: event.cost === 0 ? "#16a34a" : "#171717" }}>
                        {event.cost === 0 ? "חינם" : `€${event.cost}`}
                      </span>
                    </div>
                  </div>

                  {/* tags */}
                  {event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 px-5 pb-3">
                      {(event.tags as string[]).map((tag: string) => (
                        <span key={tag} className="rounded-full" style={{ fontSize: 13, padding: "2px 10px", background: "#f5f5f5", color: "#525252" }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* allergy */}
                  {event.allergyNote && (
                    <div className="flex items-start gap-2 px-5 py-3" style={{
                      background: isVegan ? "#f0fdf4" : "#fff7ed",
                      borderTop: `1px solid ${isVegan ? "#bbf7d0" : "#fed7aa"}`,
                    }}>
                      {isVegan
                        ? <Leaf        className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                        : <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-500" />
                      }
                      <p style={{ fontSize: 15, lineHeight: 1.5, color: isVegan ? "#15803d" : "#9a3412", fontWeight: 500 }}>
                        {isVegan ? `טבעוני ללא חלב — ${event.allergyNote}` : `שימו לב: ${event.allergyNote}`}
                      </p>
                    </div>
                  )}

                  {/* vibe note */}
                  {(event as any).note && (
                    <div className="px-5 py-3" style={{ borderTop: "1px solid #f5f5f5" }}>
                      <p style={{ fontSize: 15, lineHeight: 1.55, color: "#737373", fontStyle: "italic" }}>
                        {(event as any).note}
                      </p>
                    </div>
                  )}

                  {/* map link */}
                  <a href={url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-end gap-1.5 px-5 py-3 transition-colors hover:bg-neutral-50"
                    style={{ borderTop: "1px solid #f5f5f5", fontSize: 14, fontWeight: 500, color: "#a3a3a3", textDecoration: "none" }}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    נווט ב-Google Maps
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Day navigation ───────────────────────────────────────────── */}
        <div className="mt-10 flex items-center justify-between gap-4">
          <button
            onClick={() => setActiveDay(d => Math.max(0, d - 1))}
            disabled={activeDay === 0}
            className="flex cursor-pointer items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-5 py-3.5 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30"
            style={{ fontSize: 16, fontWeight: 500, color: "#171717" }}
          >
            <ChevronLeft className="h-5 w-5 rotate-180" />
            קודם
          </button>
          <span style={{ fontSize: 15, color: "#a3a3a3" }}>
            {activeDay + 1} / {itinerary.length}
          </span>
          <button
            onClick={() => setActiveDay(d => Math.min(itinerary.length - 1, d + 1))}
            disabled={activeDay === itinerary.length - 1}
            className="flex cursor-pointer items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-5 py-3.5 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30"
            style={{ fontSize: 16, fontWeight: 500, color: "#171717" }}
          >
            הבא
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        {/* ── Flight reminder ───────────────────────────────────────────── */}
        <div className="mt-10 flex items-center justify-between gap-4 rounded-2xl p-5" style={{ background: "#fafafa", border: "1px solid #e5e5e5" }}>
          <div>
            <p style={{ fontSize: 17, fontWeight: 600, color: "#171717" }}>עוד לא הזמנתם טיסה?</p>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "#737373" }}>יולי עמוס — מושבים מתמלאים מהר.</p>
          </div>
          <a
            href="https://www.elal.com/heb/israel"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-[#171717] px-5 py-3 text-white transition-opacity hover:opacity-90"
            style={{ fontSize: 16, fontWeight: 600, textDecoration: "none" }}
          >
            אל על
            <ArrowLeft className="h-4 w-4" />
          </a>
        </div>

      </div>
    </div>
  );
}
