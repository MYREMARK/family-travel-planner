"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  MapPin, Plane, Hotel, Utensils, Compass, PackageCheck, Rocket,
  CheckCircle2, Circle, Lock, ChevronDown, ChevronUp, ExternalLink,
  Star, Leaf, ShieldAlert, CalendarDays, Clock, ArrowLeft,
} from "lucide-react";
import { hotels, planningRestaurants, planningActivities } from "@/data/rhodes";

// ─── Types & constants ────────────────────────────────────────────────────────
const TRIP_DATE = new Date("2026-09-07");
const STORAGE_KEY = "ftp-workflow-v3";

type StepId = "destination" | "flights" | "hotel" | "restaurants" | "activities" | "packing" | "ready";
type StepStatus = "complete" | "current" | "locked";

interface StepState {
  status: StepStatus;
  completionDate?: string;
  pct: number;
}
type WorkflowState = Record<StepId, StepState>;

const STEP_DEFS: { id: StepId; label: string; Icon: React.FC<{ className?: string; style?: React.CSSProperties }> }[] = [
  { id: "destination", label: "יעד נבחר",      Icon: MapPin       },
  { id: "flights",     label: "טיסות הוזמנו",   Icon: Plane        },
  { id: "hotel",       label: "מלון הוזמן",      Icon: Hotel        },
  { id: "restaurants", label: "מסעדות תוכננו",   Icon: Utensils     },
  { id: "activities",  label: "אטרקציות תוכננו", Icon: Compass      },
  { id: "packing",     label: "צ'קליסט מוכן",    Icon: PackageCheck },
  { id: "ready",       label: "מוכנים לטיול!",   Icon: Rocket       },
];

const STEP_ORDER = STEP_DEFS.map(s => s.id);

const DEFAULT_WORKFLOW: WorkflowState = {
  destination: { status: "complete", completionDate: "2026-05-01", pct: 100 },
  flights:     { status: "complete", completionDate: "2026-06-16", pct: 100 },
  hotel:       { status: "complete", completionDate: "2026-06-18", pct: 100 },
  restaurants: { status: "current",  pct: 0 },
  activities:  { status: "locked",   pct: 0 },
  packing:     { status: "locked",   pct: 0 },
  ready:       { status: "locked",   pct: 0 },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function daysUntilTrip() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((TRIP_DATE.getTime() - now.getTime()) / 86_400_000));
}

function overallPct(wf: WorkflowState) {
  const done = STEP_ORDER.filter(id => wf[id].status === "complete").length;
  return Math.round((done / STEP_ORDER.length) * 100);
}

function currentStepId(wf: WorkflowState): StepId {
  return STEP_ORDER.find(id => wf[id].status === "current") ?? "ready";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("he-IL", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Score pill ───────────────────────────────────────────────────────────────
function ScorePill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl p-3" style={{ background: "#fafafa", border: "1px solid #f0f0f0", minWidth: 52 }}>
      <span style={{ fontSize: 17, fontWeight: 800, color, lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: 11, color: "#a3a3a3", textAlign: "center", lineHeight: 1.3, marginTop: 3 }}>{label}</span>
    </div>
  );
}

// ─── Hotel card ───────────────────────────────────────────────────────────────
function HotelCard({ hotel, onBook }: { hotel: typeof hotels[0]; onBook?: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const s = hotel.scores;

  return (
    <div className="overflow-hidden rounded-3xl transition-shadow hover:shadow-lg"
      style={{ border: hotel.isPrimary ? "2px solid #171717" : "1px solid #e5e5e5", background: "#fff" }}>

      {hotel.isPrimary && (
        <div className="flex items-center justify-center gap-2 py-2.5" style={{ background: "#171717" }}>
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "0.05em" }}>המלצה ראשונה</span>
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        </div>
      )}

      <div className="p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2, color: "#171717", marginBottom: 4 }}>{hotel.name}</h3>
            <p style={{ fontSize: 15, color: "#737373" }}>{hotel.location}</p>
          </div>
          <div className="flex-shrink-0 text-left" style={{ direction: "ltr" }}>
            <p style={{ fontSize: 22, fontWeight: 800, color: "#171717", lineHeight: 1 }}>€{hotel.priceTotal}</p>
            <p style={{ fontSize: 13, color: "#a3a3a3" }}>3 לילות</p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {hotel.tags.map(t => (
            <span key={t} className="rounded-full px-2.5 py-1" style={{ fontSize: 13, background: "#f5f5f5", color: "#525252" }}>{t}</span>
          ))}
        </div>

        <div className="mb-4 grid grid-cols-5 gap-1.5">
          <ScorePill label="Family"  value={s.familyMatch}       color="#7c3aed" />
          <ScorePill label="WOW"     value={s.wow}               color="#f59e0b" />
          <ScorePill label="Value"   value={s.value}             color="#16a34a" />
          <ScorePill label="Allergy" value={s.milkAllergySafety} color="#ef4444" />
          <ScorePill label="Vegan"   value={s.veganScore}        color="#22c55e" />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl p-3" style={{ background: "#f5f5f5" }}>
            <p style={{ fontSize: 12, color: "#a3a3a3", marginBottom: 2 }}>מסעדות טבעוניות</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#171717" }}>{hotel.distanceRestaurants}</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: "#f5f5f5" }}>
            <p style={{ fontSize: 12, color: "#a3a3a3", marginBottom: 2 }}>אטרקציות</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#171717" }}>{hotel.distanceAttractions}</p>
          </div>
        </div>

        <button onClick={() => setExpanded(e => !e)}
          className="mb-4 flex w-full cursor-pointer items-center justify-between rounded-xl p-3 transition-colors hover:bg-neutral-50"
          style={{ border: "1px solid #f0f0f0", background: "transparent" }}>
          <span style={{ fontSize: 15, fontWeight: 500, color: "#525252" }}>למה לבחור כאן?</span>
          {expanded ? <ChevronUp className="h-4 w-4 text-neutral-400" /> : <ChevronDown className="h-4 w-4 text-neutral-400" />}
        </button>

        {expanded && (
          <ul className="mb-4 space-y-2">
            {hotel.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                <span style={{ fontSize: 15, lineHeight: 1.5, color: "#525252" }}>{h}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-3">
          <a href={hotel.bookingUrl} target="_blank" rel="noopener noreferrer"
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl py-3.5 text-white transition-opacity hover:opacity-90"
            style={{ background: "#171717", fontSize: 16, fontWeight: 600, textDecoration: "none" }}>
            הזמן עכשיו
            <ExternalLink className="h-4 w-4" />
          </a>
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name)}&center=${hotel.lat},${hotel.lng}`}
            target="_blank" rel="noopener noreferrer"
            className="flex cursor-pointer items-center justify-center gap-1.5 rounded-2xl border border-neutral-200 px-4 py-3.5 transition-colors hover:bg-neutral-50"
            style={{ fontSize: 15, fontWeight: 500, color: "#525252", textDecoration: "none" }}>
            <MapPin className="h-4 w-4" />
            מפה
          </a>
        </div>

        {hotel.isPrimary && onBook && (
          <button onClick={onBook}
            className="mt-3 w-full cursor-pointer rounded-2xl py-3 transition-colors hover:bg-green-50"
            style={{ border: "1px solid #bbf7d0", fontSize: 15, fontWeight: 600, color: "#16a34a", background: "#f0fdf4" }}>
            ✓ הזמנתי את המלון — המשך לשלב הבא
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Restaurant card ──────────────────────────────────────────────────────────
function RestaurantCard({ r }: { r: typeof planningRestaurants[0] }) {
  const s = r.scores;
  return (
    <div className="overflow-hidden rounded-3xl" style={{ border: "1px solid #e5e5e5", background: "#fff" }}>
      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <span className="mb-1.5 inline-block rounded-full px-2.5 py-0.5" style={{ fontSize: 12, fontWeight: 600, background: "#f0fdf4", color: "#16a34a" }}>
              {r.type}
            </span>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#171717", marginTop: 4 }}>{r.name}</h3>
          </div>
          <div className="flex-shrink-0 text-left" style={{ direction: "ltr" }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#171717" }}>{r.priceRange}</p>
            <p style={{ fontSize: 13, color: "#a3a3a3" }}>€{r.pricePerPerson}/איש</p>
          </div>
        </div>

        <p style={{ fontSize: 15, lineHeight: 1.55, color: "#525252", marginBottom: 12 }}>{r.highlight}</p>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {r.tags.map(t => (
            <span key={t} className="rounded-full px-2.5 py-1" style={{ fontSize: 13, background: "#f5f5f5", color: "#525252" }}>{t}</span>
          ))}
        </div>

        <div className="mb-3 flex items-center gap-2 rounded-xl p-3" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
          <MapPin className="h-3.5 w-3.5 text-green-600" />
          <span style={{ fontSize: 14, color: "#15803d", fontWeight: 500 }}>{r.distanceFromHotel}</span>
        </div>

        <div className="mb-4 grid grid-cols-5 gap-1.5">
          <ScorePill label="Family"  value={s.familyMatch}       color="#7c3aed" />
          <ScorePill label="WOW"     value={s.wow}               color="#f59e0b" />
          <ScorePill label="Value"   value={s.value}             color="#16a34a" />
          <ScorePill label="Allergy" value={s.milkAllergySafety} color="#ef4444" />
          <ScorePill label="Vegan"   value={s.veganScore}        color="#22c55e" />
        </div>

        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name)}&center=${r.lat},${r.lng}`}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-2xl py-3 transition-colors hover:bg-neutral-50"
          style={{ border: "1px solid #e5e5e5", fontSize: 15, fontWeight: 500, color: "#525252", textDecoration: "none" }}>
          <MapPin className="h-4 w-4" />
          פתח במפה
        </a>
      </div>
    </div>
  );
}

// ─── Activity card ────────────────────────────────────────────────────────────
function ActivityCard({ a }: { a: typeof planningActivities[0] }) {
  const s = a.scores;
  return (
    <div className="overflow-hidden rounded-3xl" style={{ border: "1px solid #e5e5e5", background: "#fff" }}>
      <div className="p-5">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex-1">
            <span className="mb-1.5 inline-block rounded-full px-2.5 py-0.5" style={{ fontSize: 12, fontWeight: 600, background: "#fafafa", color: "#737373" }}>
              {a.type}
            </span>
            <h3 style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.25, color: "#171717" }}>{a.name}</h3>
          </div>
          <p style={{ fontSize: 17, fontWeight: 700, color: a.cost === 0 ? "#16a34a" : "#171717", flexShrink: 0 }}>
            {a.cost === 0 ? "חינם" : `€${a.cost}`}
          </p>
        </div>

        <p style={{ fontSize: 15, lineHeight: 1.55, color: "#525252", marginBottom: 12 }}>{a.highlight}</p>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {a.tags.map(t => (
            <span key={t} className="rounded-full px-2.5 py-1" style={{ fontSize: 13, background: "#f5f5f5", color: "#525252" }}>{t}</span>
          ))}
        </div>

        <div className="mb-3 flex items-center gap-1.5" style={{ fontSize: 14, color: "#737373" }}>
          <Clock className="h-3.5 w-3.5" />
          {a.duration}
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2">
          <ScorePill label="Family" value={s.familyMatch} color="#7c3aed" />
          <ScorePill label="WOW"    value={s.wow}         color="#f59e0b" />
          <ScorePill label="Value"  value={s.value}       color="#16a34a" />
        </div>

        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.name)}&center=${a.lat},${a.lng}`}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-2xl py-3 transition-colors hover:bg-neutral-50"
          style={{ border: "1px solid #e5e5e5", fontSize: 15, fontWeight: 500, color: "#525252", textDecoration: "none" }}>
          <MapPin className="h-4 w-4" />
          פתח במפה
        </a>
      </div>
    </div>
  );
}

// ─── Stage: Hotel ─────────────────────────────────────────────────────────────
function HotelStage({ onComplete }: { onComplete: () => void }) {
  const [primary, ...alts] = hotels;
  const [showAlts, setShowAlts] = useState(false);
  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: "#171717", marginBottom: 6 }}>איפה ישנים?</h2>
        <p style={{ fontSize: 17, lineHeight: 1.6, color: "#525252" }}>
          3 לילות, 7–10 ספטמבר 2026. 4 אפשרויות מותאמות לאלרגיה לחלב ולעדפות המשפחה.
        </p>
      </div>

      <HotelCard hotel={primary} onBook={onComplete} />

      <button onClick={() => setShowAlts(v => !v)}
        className="flex w-full cursor-pointer items-center justify-between rounded-2xl p-4 transition-colors hover:bg-neutral-50"
        style={{ border: "1px solid #e5e5e5", background: "#fff" }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: "#525252" }}>ראה {alts.length} חלופות נוספות</span>
        {showAlts ? <ChevronUp className="h-5 w-5 text-neutral-400" /> : <ChevronDown className="h-5 w-5 text-neutral-400" />}
      </button>

      {showAlts && (
        <div className="space-y-4">
          {alts.map(h => <HotelCard key={h.id} hotel={h} />)}
        </div>
      )}

      <div className="rounded-2xl p-5" style={{ background: "#fafafa", border: "1px solid #e5e5e5" }}>
        <p style={{ fontSize: 16, fontWeight: 600, color: "#171717", marginBottom: 4 }}>הזמנתם מלון אחר?</p>
        <p style={{ fontSize: 15, color: "#737373", marginBottom: 12 }}>אחרי שהזמנתם — סמנו כאן להמשך.</p>
        <button onClick={onComplete}
          className="w-full cursor-pointer rounded-2xl py-3.5 transition-opacity hover:opacity-80"
          style={{ background: "#171717", fontSize: 16, fontWeight: 700, color: "#fff", border: "none" }}>
          ✓ הזמנתי מלון — עבור לשלב הבא
        </button>
      </div>
    </div>
  );
}

// ─── Stage: Restaurants ───────────────────────────────────────────────────────
function RestaurantStage({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: "#171717", marginBottom: 6 }}>איפה אוכלים?</h2>
        <p style={{ fontSize: 17, lineHeight: 1.6, color: "#525252" }}>
          9 מסעדות נבחרו עבורכם — 100% טבעוניות ובטוחות לאלרגיה לחלב. מרחקים מ-Avalon.
        </p>
        <div className="mt-3 flex items-center gap-2 rounded-xl p-3" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
          <Leaf className="h-4 w-4 text-green-600" />
          <span style={{ fontSize: 15, color: "#15803d", fontWeight: 500 }}>כל המסעדות — ציון אלרגיה לחלב 75+</span>
        </div>
      </div>

      <div className="rounded-2xl p-5" style={{ background: "#fafafa", border: "1px solid #e5e5e5" }}>
        <p style={{ fontSize: 15, color: "#737373", marginBottom: 12 }}>
          המסעדות עברו לטאב הייעודי עם מפה ואפשרות ניווט.
        </p>
        <Link href="/restaurants"
          className="block w-full cursor-pointer rounded-2xl py-3.5 text-center transition-opacity hover:opacity-80"
          style={{ background: "#7c3aed", fontSize: 16, fontWeight: 700, color: "#fff", textDecoration: "none" }}>
          ראה את כל המסעדות ←
        </Link>
      </div>

      <div className="rounded-2xl p-5" style={{ background: "#fff", border: "1px solid #e5e5e5" }}>
        <button onClick={onComplete}
          className="w-full cursor-pointer rounded-2xl py-3.5 transition-opacity hover:opacity-80"
          style={{ background: "#171717", fontSize: 16, fontWeight: 700, color: "#fff", border: "none" }}>
          ✓ תכנוני מסעדות — עבור לאטרקציות
        </button>
      </div>
    </div>
  );
}

// ─── Stage: Activities ────────────────────────────────────────────────────────
function ActivitiesStage({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: "#171717", marginBottom: 6 }}>מה עושים?</h2>
        <p style={{ fontSize: 17, lineHeight: 1.6, color: "#525252" }}>
          7 חוויות — Harry Potter vibes, שקיעות, קניות, אסטרונומיה. ללא טרקים, מתחיל אחרי 10:00.
        </p>
      </div>

      <div className="space-y-4">
        {planningActivities.map(a => <ActivityCard key={a.id} a={a} />)}
      </div>

      <div className="rounded-2xl p-5" style={{ background: "#fafafa", border: "1px solid #e5e5e5" }}>
        <p style={{ fontSize: 15, color: "#737373", marginBottom: 12 }}>
          ראו את <Link href="/planner" className="underline" style={{ color: "#171717" }}>המסלול המלא עם שעות</Link>.
        </p>
        <button onClick={onComplete}
          className="w-full cursor-pointer rounded-2xl py-3.5 transition-opacity hover:opacity-80"
          style={{ background: "#171717", fontSize: 16, fontWeight: 700, color: "#fff", border: "none" }}>
          ✓ תכנוני אטרקציות — עבור לצ'קליסט
        </button>
      </div>
    </div>
  );
}

// ─── Stage: Packing ───────────────────────────────────────────────────────────
function PackingStage({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: "#171717", marginBottom: 6 }}>מה לארוז?</h2>
        <p style={{ fontSize: 17, lineHeight: 1.6, color: "#525252" }}>
          צ'קליסט חכם עם 68 פריטים — מסמכים, ביגוד, בטיחות אלרגיה ועוד.
        </p>
      </div>

      <div className="rounded-3xl p-6" style={{ background: "#fafafa", border: "1px solid #e5e5e5" }}>
        <div className="mb-5 grid grid-cols-3 gap-3">
          {[{ val: "68", label: "פריטים" }, { val: "9", label: "קטגוריות" }, { val: "8", label: "קריטיים" }].map(({ val, label }) => (
            <div key={label} className="rounded-2xl bg-white p-4 text-center" style={{ border: "1px solid #e5e5e5" }}>
              <p style={{ fontSize: 24, fontWeight: 800, color: "#171717", lineHeight: 1 }}>{val}</p>
              <p style={{ fontSize: 13, color: "#a3a3a3", marginTop: 3 }}>{label}</p>
            </div>
          ))}
        </div>

        {["📄 מסמכים + דרכונים", "💊 תרופות לאלרגיה לחלב", "👕 ביגוד לספטמבר", "🏖 ציוד לחוף", "🔌 ציוד אלקטרוני", "🎒 ציוד לילדות"].map(item => (
          <div key={item} className="mb-2 flex items-center gap-3 rounded-xl p-3" style={{ background: "#fff", border: "1px solid #f0f0f0" }}>
            <ShieldAlert className="h-4 w-4 flex-shrink-0 text-neutral-300" />
            <span style={{ fontSize: 15, color: "#525252" }}>{item}</span>
          </div>
        ))}

        <Link href="/checklist"
          className="mt-4 flex items-center justify-center gap-2 rounded-2xl py-4 text-white transition-opacity hover:opacity-90"
          style={{ background: "#171717", fontSize: 16, fontWeight: 700, textDecoration: "none" }}>
          פתח צ'קליסט מלא
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>

      <div className="rounded-2xl p-5" style={{ background: "#fafafa", border: "1px solid #e5e5e5" }}>
        <p style={{ fontSize: 15, color: "#737373", marginBottom: 12 }}>לאחר שמילאתם את הצ'קליסט:</p>
        <button onClick={onComplete}
          className="w-full cursor-pointer rounded-2xl py-3.5 transition-opacity hover:opacity-80"
          style={{ background: "#171717", fontSize: 16, fontWeight: 700, color: "#fff", border: "none" }}>
          ✓ הצ'קליסט מוכן — שלב אחרון!
        </button>
      </div>
    </div>
  );
}

// ─── Stage: Ready ─────────────────────────────────────────────────────────────
function ReadyStage() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl p-8 text-center" style={{ background: "linear-gradient(135deg, #171717 0%, #3b3b3b 100%)" }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 8 }}>מוכנים לטיול!</h2>
        <p style={{ fontSize: 18, lineHeight: 1.6, color: "#a3a3a3" }}>
          כל השלבים הושלמו. רודוס מחכה לאבא, נועם ומעיין.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Link href="/planner" className="block rounded-2xl p-4 text-center transition-colors hover:bg-neutral-50"
          style={{ border: "1px solid #e5e5e5", textDecoration: "none" }}>
          <CalendarDays className="mx-auto mb-2 h-6 w-6 text-neutral-400" />
          <p style={{ fontSize: 15, fontWeight: 600, color: "#171717" }}>מסלול מלא</p>
        </Link>
        <Link href="/checklist" className="block rounded-2xl p-4 text-center transition-colors hover:bg-neutral-50"
          style={{ border: "1px solid #e5e5e5", textDecoration: "none" }}>
          <PackageCheck className="mx-auto mb-2 h-6 w-6 text-neutral-400" />
          <p style={{ fontSize: 15, fontWeight: 600, color: "#171717" }}>צ'קליסט</p>
        </Link>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [workflow, setWorkflow]   = useState<WorkflowState>(DEFAULT_WORKFLOW);
  const [loaded, setLoaded]       = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setWorkflow(JSON.parse(raw) as WorkflowState);
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  const saveWorkflow = useCallback((wf: WorkflowState) => {
    setWorkflow(wf);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(wf)); } catch { /* ignore */ }
  }, []);

  const completeStep = useCallback((id: StepId) => {
    const idx    = STEP_ORDER.indexOf(id);
    const nextId = STEP_ORDER[idx + 1] as StepId | undefined;
    const today  = new Date().toISOString().slice(0, 10);
    setWorkflow(prev => {
      const next: WorkflowState = { ...prev };
      next[id] = { status: "complete", completionDate: today, pct: 100 };
      if (nextId) next[nextId] = { status: "current", pct: 0 };
      saveWorkflow(next);
      return next;
    });
  }, [saveWorkflow]);

  if (!loaded) return null;

  const currentId  = currentStepId(workflow);
  const totalPct   = overallPct(workflow);
  const daysLeft   = daysUntilTrip();
  const doneCount  = STEP_ORDER.filter(id => workflow[id].status === "complete").length;
  const currentDef = STEP_DEFS.find(s => s.id === currentId)!;
  const CurrentIcon = currentDef.Icon;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Rubik', system-ui, sans-serif" }}>
      <div className="mx-auto max-w-2xl px-6 pb-24 pt-10 space-y-12">

        {/* ── Hero progress card ──────────────────────────────────────── */}
        <div className="rounded-3xl p-6" style={{ background: "#171717" }}>
          <div className="mb-5 flex items-start justify-between">
            <div>
              <p style={{ fontSize: 15, color: "#737373", marginBottom: 4 }}>רודוס, יוון</p>
              <h1 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.1, color: "#fff", letterSpacing: "-0.02em" }}>
                איפה אנחנו<br />בתכנון?
              </h1>
            </div>
            <div className="rounded-2xl p-4 text-center" style={{ background: "rgba(255,255,255,0.08)", minWidth: 80 }}>
              <p style={{ fontSize: 32, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{daysLeft}</p>
              <p style={{ fontSize: 13, color: "#737373", marginTop: 2 }}>ימים לטיול</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="mb-1.5 flex justify-between">
              <span style={{ fontSize: 14, color: "#737373" }}>{doneCount} / {STEP_ORDER.length} שלבים</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{totalPct}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.12)" }}>
              <div className="h-2 rounded-full transition-all duration-700"
                style={{ width: `${totalPct}%`, background: totalPct === 100 ? "#22c55e" : "#ca8a04" }} />
            </div>
          </div>

          {/* Current step */}
          <div className="mb-3 flex items-center justify-between rounded-2xl p-4"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div>
              <p style={{ fontSize: 13, color: "#737373", marginBottom: 2 }}>שלב נוכחי</p>
              <p style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>{currentDef.label}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ background: "rgba(202,138,4,0.2)" }}>
              <CurrentIcon className="h-5 w-5" style={{ color: "#ca8a04" }} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-neutral-600" />
            <span style={{ fontSize: 14, color: "#737373" }}>7–10 ספטמבר 2026 · 3 לילות · אבא + נועם + מעיין</span>
          </div>
        </div>

        {/* ── Workflow stepper ────────────────────────────────────────── */}
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#171717", marginBottom: 16 }}>שלבי התכנון</h2>
          <div className="space-y-2">
            {STEP_DEFS.map((step, idx) => {
              const state      = workflow[step.id];
              const isComplete = state.status === "complete";
              const isCurrent  = state.status === "current";
              const isLocked   = state.status === "locked";
              const StepIcon   = step.Icon;

              return (
                <div key={step.id} className="flex items-center gap-4 rounded-2xl p-4"
                  style={{
                    border:      isCurrent ? "2px solid #171717" : "1px solid #f0f0f0",
                    background:  isCurrent ? "#fafafa" : "#fff",
                    opacity:     isLocked ? 0.4 : 1,
                  }}>
                  <div className="flex-shrink-0">
                    {isComplete && <CheckCircle2 className="h-6 w-6 text-green-500" />}
                    {isCurrent  && <Circle       className="h-6 w-6 text-amber-500" />}
                    {isLocked   && <Lock         className="h-6 w-6 text-neutral-300" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span style={{ fontSize: 13, color: "#a3a3a3", flexShrink: 0 }}>{idx + 1}</span>
                      <span style={{ fontSize: 16, fontWeight: isCurrent ? 700 : 500, color: isLocked ? "#a3a3a3" : "#171717" }}>
                        {step.label}
                      </span>
                      {isCurrent && (
                        <span className="rounded-full px-2 py-0.5" style={{ fontSize: 11, fontWeight: 700, background: "#fef3c7", color: "#b45309" }}>
                          עכשיו
                        </span>
                      )}
                    </div>
                    {isComplete && state.completionDate && (
                      <p style={{ fontSize: 13, color: "#16a34a", marginTop: 2 }}>
                        ✓ {formatDate(state.completionDate)}
                      </p>
                    )}
                  </div>
                  {isComplete  && <span style={{ fontSize: 14, fontWeight: 700, color: "#16a34a", flexShrink: 0 }}>100%</span>}
                  {!isComplete && <StepIcon className="h-5 w-5 flex-shrink-0 text-neutral-300" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Current stage divider ───────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-neutral-100" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#a3a3a3", whiteSpace: "nowrap" }}>מה לעשות עכשיו</span>
          <div className="h-px flex-1 bg-neutral-100" />
        </div>

        {/* ── Stage content ───────────────────────────────────────────── */}
        {currentId === "hotel"       && <HotelStage       onComplete={() => completeStep("hotel")}       />}
        {currentId === "restaurants" && <RestaurantStage   onComplete={() => completeStep("restaurants")} />}
        {currentId === "activities"  && <ActivitiesStage   onComplete={() => completeStep("activities")}  />}
        {currentId === "packing"     && <PackingStage      onComplete={() => completeStep("packing")}     />}
        {currentId === "ready"       && <ReadyStage />}

        {/* ── Reset button ─────────────────────────────────────────────── */}
        <div className="text-center">
          <button
            onClick={() => { if (confirm("לאפס את כל ההתקדמות?")) saveWorkflow(DEFAULT_WORKFLOW); }}
            className="cursor-pointer rounded-xl px-4 py-2 transition-colors hover:bg-neutral-100"
            style={{ color: "#d1d5db", background: "transparent", border: "none", fontSize: 13 }}>
            איפוס תהליך
          </button>
        </div>

      </div>
    </div>
  );
}
