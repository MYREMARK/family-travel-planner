"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plane, Hotel, Utensils, Bus, ShoppingBag, Compass,
  AlertCircle, Plus, Trash2, Download, FileJson,
  TrendingUp, TrendingDown, Edit2, Check, X,
  Star, MapPin, ChevronDown, ChevronUp, CheckCircle2,
  Wallet, RefreshCw, ChevronRight,
} from "lucide-react";
import { DAYS, computeDayCost, computeTripCost, computeMealTypeTotals, GIRLS_SHOPPING_BUDGET_ILS, type Dish } from "@/app/planner/page";
import { EUR_TO_ILS, RATE_SOURCE, ils, fmtMoney, fmtIls, fmtEur, STATUS_LABEL, STATUS_COLOR } from "@/lib/currency";

// ─── Types ────────────────────────────────────────────────────────────────────
interface BudgetCategory {
  id:        string;
  label:     string;
  planned:   number;
  color:     string;
  purchased: boolean;
}

interface Expense {
  id:          string;
  date:        string;
  categoryId:  string;
  description: string;
  amount:      number;
  notes:       string;
}

interface BudgetState {
  categories: BudgetCategory[];
  expenses:   Expense[];
}

// ─── Trip cost model (from the actual itinerary in /planner) ──────────────────
// Single source of truth: DAYS lives in app/planner/page.tsx, this page only
// reads it. Every € figure below flows through the SAME EUR_TO_ILS rate.
const TRIP = computeTripCost();
const MEALS = computeMealTypeTotals();
// Items whose price is confirmed to have been paid but that this session could
// not find/verify a number for (e.g. Rhodes Observatory — already booked, but
// no reliable current ticket price turned up in research). Listed explicitly
// rather than silently treated as €0.
const UNPRICED_BOOKED_ITEMS = DAYS.flatMap(d => d.events)
  .filter(e => e.costStatus === "unknown")
  .map(e => e.label);

// ─── Defaults ─────────────────────────────────────────────────────────────────
// Food/Transport/Activities below are now derived from the real itinerary
// (computeTripCost) instead of placeholder guesses — see the "תקציב מפורט
// לפי המסלול" section further down for the full day-by-day breakdown these
// numbers come from. Flights/Hotel remain the app's stored figures — Hotel is
// now €813 (confirmed, actual amount paid), converted via the single shared rate.
const DEFAULT_CATEGORIES: BudgetCategory[] = [
  { id: "flights",    label: "טיסות",    planned: 3992,    color: "#7c3aed", purchased: true  },
  { id: "hotel",      label: "מלון",     planned: ils(813), color: "#3b82f6", purchased: true  },
  { id: "food",       label: "אוכל",     planned: ils(TRIP.totals.food),       color: "#22c55e", purchased: false },
  { id: "transport",  label: "תחבורה",   planned: ils(TRIP.totals.transport),  color: "#f59e0b", purchased: false },
  { id: "shopping",   label: "קניות",    planned: GIRLS_SHOPPING_BUDGET_ILS,   color: "#ec4899", purchased: false },
  { id: "activities", label: "אטרקציות", planned: ils(TRIP.totals.activities), color: "#06b6d4", purchased: false },
  { id: "emergency",  label: "חירום",    planned: 500,  color: "#ef4444", purchased: false },
];

const CAT_ICONS: Record<string, React.FC<{ className?: string; style?: React.CSSProperties }>> = {
  flights:    Plane,
  hotel:      Hotel,
  food:       Utensils,
  transport:  Bus,
  shopping:   ShoppingBag,
  activities: Compass,
  emergency:  AlertCircle,
};

const DEFAULT_STATE: BudgetState = { categories: DEFAULT_CATEGORIES, expenses: [] };
const STORAGE_KEY = "ftp-budget-v1";
const TRIP_DAYS   = 4;

const fmt      = (n: number) => Math.round(n).toLocaleString("he-IL");
const uid      = () => Math.random().toString(36).slice(2, 10);
const todayISO = () => new Date().toISOString().slice(0, 10);
const fmtDate  = (iso: string) => new Date(iso).toLocaleDateString("he-IL", { day: "numeric", month: "short" });

// ─── Hotel data ───────────────────────────────────────────────────────────────
const HOTELS = [
  {
    id: "avalon", name: "Avalon Boutique Hotel", nameShort: "Avalon",
    price: 813, ils: ils(813), location: "New Town", // €813 confirmed — actual amount paid
    distanceRestaurants: "8 דקות", distanceAttractions: "12 דקות",
    scores: { familyMatch: 88, wow: 87, value: 90, milkAllergy: 82 },
    isPrimary: true,
    bookingUrl: "https://www.booking.com/hotel/gr/avalon-boutique-rhodes.html",
  },
  {
    id: "in-camera", name: "In Camera Art Boutique", nameShort: "In Camera",
    price: 435, ils: 1740, location: "עיר עתיקה",
    distanceRestaurants: "1–3 דקות", distanceAttractions: "0 — בתוך העיר",
    scores: { familyMatch: 95, wow: 93, value: 88, milkAllergy: 90 },
    isPrimary: false,
    bookingUrl: "https://www.booking.com/hotel/gr/in-camera-art-boutique-hotel.html",
  },
] as const;

// ─── Sub-components ───────────────────────────────────────────────────────────
function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="relative h-1.5 overflow-hidden rounded-full bg-neutral-100">
      <div className="h-1.5 rounded-full" style={{ width: `${score}%`, background: color, transition: "width .5s" }} />
    </div>
  );
}

function Donut({ pct, color, label, value }: { pct: number; color: string; label: string; value: string }) {
  const r = 38; const circ = 2 * Math.PI * r; const dash = Math.min(pct, 100) / 100 * circ;
  return (
    <div className="flex flex-col items-center">
      <svg width="90" height="90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#f0f0f0" strokeWidth="10" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ / 4} strokeLinecap="round"
          style={{ transition: "stroke-dasharray .6s ease" }} />
        <text x="48" y="43" textAnchor="middle" fontSize="14" fontWeight="800" fill="#171717">{Math.round(pct)}%</text>
        <text x="48" y="59" textAnchor="middle" fontSize="9" fill="#a3a3a3">{label}</text>
      </svg>
      <p style={{ fontSize: 13, fontWeight: 700, color: "#171717" }}>{value}</p>
    </div>
  );
}

// Reasonable per-dish family quantity — never assumes 3 full mains automatically.
// Shareable sides (hummus, salads) get "1, לשיתוף"; mains get "כ-2, לא בהכרח 3 שלמות"
// since the girls often split or go lighter — matches how the meal totals were built.
function dishQtyNote(name: string): string {
  if (/חומוס|Hummus|סלט|Salad|גפן|Vine Leaves/i.test(name)) return "1 מנה, לשיתוף בין השלושה";
  return "כ-2 מנות ל-3 אנשים (לא תמיד 3 שלמות — לפעמים חולקים)";
}

function StatusChip({ status }: { status: "confirmed" | "estimated" | "unknown" }) {
  return (
    <span className="rounded-full px-2 py-0.5" style={{ fontSize: 9, fontWeight: 700, background: STATUS_COLOR[status].bg, color: STATUS_COLOR[status].color }}>
      {STATUS_LABEL[status]}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BudgetPage() {
  const [data,          setData]          = useState<BudgetState>(DEFAULT_STATE);
  const [loaded,        setLoaded]        = useState(false);
  const [showForm,      setShowForm]      = useState(false);
  const [showCharts,    setShowCharts]    = useState(false);
  const [showDaily,     setShowDaily]     = useState(true);
  const [showDishes,    setShowDishes]    = useState(false);
  const [openDay,       setOpenDay]       = useState<number | null>(1);
  const [showHotels,    setShowHotels]    = useState(true);
  const [editCatId,     setEditCatId]     = useState<string | null>(null);
  const [editVal,       setEditVal]       = useState("");
  const [selectedHotel, setSelectedHotel] = useState<string>("avalon");
  const [form, setForm] = useState({
    date: todayISO(), categoryId: "food", description: "", amount: "", notes: "",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as BudgetState;
        parsed.categories = parsed.categories.map((c, i) => ({
          ...DEFAULT_CATEGORIES[i] ?? c, ...c,
          purchased: c.purchased ?? (DEFAULT_CATEGORIES[i]?.purchased ?? false),
        }));
        setData(parsed);
      }
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  const save = useCallback((next: BudgetState) => {
    setData(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }, []);

  // Purchased → actual = planned automatically
  const actualByCat: Record<string, number> = {};
  for (const cat of data.categories) {
    actualByCat[cat.id] = cat.purchased
      ? cat.planned
      : data.expenses.filter(e => e.categoryId === cat.id).reduce((s, e) => s + e.amount, 0);
  }

  const totalPlanned   = data.categories.reduce((s, c) => s + c.planned, 0);
  const totalActual    = Object.values(actualByCat).reduce((s, v) => s + v, 0);
  const totalRemaining = totalPlanned - totalActual;
  const utilPct        = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0;
  const avgDailyBudget = totalPlanned / TRIP_DAYS;
  const avgDailyActual = totalActual  / TRIP_DAYS;
  const overBudgetCats = data.categories.filter(c => !c.purchased && actualByCat[c.id] > c.planned && c.planned > 0);

  const togglePurchased = (id: string) =>
    save({ ...data, categories: data.categories.map(c => c.id === id ? { ...c, purchased: !c.purchased } : c) });

  const startEdit = (cat: BudgetCategory) => { setEditCatId(cat.id); setEditVal(String(cat.planned)); };
  const saveEdit  = (id: string) => {
    const val = parseFloat(editVal);
    if (!isNaN(val)) save({ ...data, categories: data.categories.map(c => c.id === id ? { ...c, planned: val } : c) });
    setEditCatId(null);
  };

  const addExpense = () => {
    if (!form.description || !form.amount) return;
    save({ ...data, expenses: [{ id: uid(), date: form.date, categoryId: form.categoryId, description: form.description, amount: parseFloat(form.amount), notes: form.notes }, ...data.expenses] });
    setForm({ date: todayISO(), categoryId: form.categoryId, description: "", amount: "", notes: "" });
    setShowForm(false);
  };

  const deleteExpense = (id: string) => save({ ...data, expenses: data.expenses.filter(e => e.id !== id) });

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ ...data, exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `budget-${todayISO()}.json`; a.click();
  };

  if (!loaded) return null;

  const catItems = data.categories.map(c => ({ ...c, actual: actualByCat[c.id] ?? 0 }));

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Rubik', system-ui, sans-serif" }}>
      <div className="mx-auto max-w-2xl px-4 pb-36 pt-10 space-y-8 md:max-w-5xl">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <p style={{ fontSize: 15, color: "#a3a3a3", marginBottom: 4 }}>רודוס · ספטמבר 2026</p>
            <h1 style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.1, color: "#171717", letterSpacing: "-0.02em" }}>מרכז תקציב</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={exportJSON} className="cursor-pointer rounded-xl p-2.5 transition-colors hover:bg-neutral-100"
              style={{ border: "1px solid #e5e5e5" }} aria-label="JSON"><FileJson className="h-5 w-5 text-neutral-500" /></button>
            <button onClick={() => window.print()} className="cursor-pointer rounded-xl p-2.5 transition-colors hover:bg-neutral-100"
              style={{ border: "1px solid #e5e5e5" }} aria-label="PDF"><Download className="h-5 w-5 text-neutral-500" /></button>
          </div>
        </div>

        {/* ── Exchange rate — used consistently for every € figure on this page ── */}
        <div className="flex items-center gap-3 rounded-2xl p-4" style={{ background: "#f5f3ff", border: "1px solid #ddd6fe" }}>
          <RefreshCw className="h-5 w-5 flex-shrink-0" style={{ color: "#7c3aed" }} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 800, color: "#4c1d95" }}>שער חליפין בשימוש: €1 ≈ ₪{EUR_TO_ILS}</p>
            <p style={{ fontSize: 11, color: "#7c3aed" }}>מקור: {RATE_SOURCE} · אותו שער בדיוק בכל מקום באפליקציה</p>
          </div>
        </div>

        {/* ── Final summary — the whole trip in one glance ── */}
        {(() => {
          const flightsIls  = 3992;
          const hotelIls    = ils(813); // €813 confirmed — actual amount paid
          const foodIls     = ils(TRIP.totals.food);
          const attrIls     = ils(TRIP.totals.activities);
          const transIls    = ils(TRIP.totals.transport);
          const shopIls     = GIRLS_SHOPPING_BUDGET_ILS;
          const otherIls    = 0;
          const grandTotal  = flightsIls + hotelIls + foodIls + attrIls + transIls + shopIls + otherIls;
          const rows = [
            { icon: "✈️", label: "טיסות",     val: flightsIls, status: "confirmed" as const },
            { icon: "🏨", label: "מלון",       val: hotelIls,   status: "confirmed" as const },
            { icon: "🍽️", label: "אוכל",       val: foodIls,    status: "estimated" as const },
            { icon: "🎟️", label: "אטרקציות",   val: attrIls,    status: "confirmed" as const },
            { icon: "🚕", label: "תחבורה",     val: transIls,   status: "estimated" as const },
            { icon: "🛍️", label: "קניות",      val: shopIls,    status: "estimated" as const },
            { icon: "💳", label: "אחר",        val: otherIls,   status: "unknown" as const },
          ];
          return (
            <div className="overflow-hidden rounded-3xl" style={{ background: "#171717" }}>
              <div className="p-6">
                <p style={{ fontSize: 13, color: "#a3a3a3", marginBottom: 4 }}>סיכום כולל — כל הטיול</p>
                <div className="mb-5 space-y-2">
                  {rows.map(r => (
                    <div key={r.label} className="flex items-center justify-between">
                      <span style={{ fontSize: 14, color: "#e5e5e5" }}>{r.icon} {r.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full px-2 py-0.5" style={{ fontSize: 9, fontWeight: 700, background: STATUS_COLOR[r.status].bg, color: STATUS_COLOR[r.status].color }}>
                          {STATUS_LABEL[r.status]}
                        </span>
                        <span style={{ fontSize: 15, fontWeight: 700, color: "#fff", minWidth: 90, textAlign: "left", direction: "ltr" }}>{fmtIls(r.val)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-end justify-between border-t pt-4" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>TOTAL TRIP</span>
                  <div style={{ textAlign: "left", direction: "ltr" }}>
                    <p style={{ fontSize: 30, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{fmtEur(grandTotal / EUR_TO_ILS)}</p>
                    <p style={{ fontSize: 13, color: "#a3a3a3" }}>≈ {fmtIls(grandTotal)}</p>
                  </div>
                </div>
                {UNPRICED_BOOKED_ITEMS.length > 0 && (
                  <div className="mt-4 rounded-xl p-3" style={{ background: "rgba(220,38,38,0.15)" }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#fca5a5" }}>🔴 לא כלול בסכום — לא אותר מחיר מאומת:</p>
                    <p style={{ fontSize: 12, color: "#fecaca", marginTop: 2 }}>{UNPRICED_BOOKED_ITEMS.join(", ")} — כבר הוזמן ושולם, אך המחיר בפועל לא ידוע לנו. אנא הוסיפו את הסכום מאישור ההזמנה.</p>
                  </div>
                )}
                <div className="mt-3 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <p style={{ fontSize: 12, color: "#a3a3a3", lineHeight: 1.6 }}>
                    🛍️ תקציב קניות לבנות: <strong style={{ color: "#fff" }}>₪{GIRLS_SHOPPING_BUDGET_ILS.toLocaleString("he-IL")}</strong> סה"כ לשתיהן ·
                    הערכה: <strong style={{ color: "#4ade80" }}>ריאלי</strong> (פירוט למטה בסעיף הקניות)
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Over-budget alert */}
        {overBudgetCats.length > 0 && (
          <div className="flex items-start gap-3 rounded-2xl p-4" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#dc2626" }}>חריגה מתקציב</p>
              <p style={{ fontSize: 14, color: "#b91c1c" }}>{overBudgetCats.map(c => c.label).join(", ")} עברו את הסכום המתוכנן</p>
            </div>
          </div>
        )}

        {/* ── Budget Intelligence Dashboard ── */}
        <div className="overflow-hidden rounded-3xl" style={{ background: "#171717" }}>
          <div className="p-6">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p style={{ fontSize: 13, color: "#737373", marginBottom: 3 }}>תקציב כולל</p>
                <p style={{ fontSize: 38, fontWeight: 900, color: "#fff", lineHeight: 1 }}>₪{fmt(totalPlanned)}</p>
              </div>
              <div style={{ direction: "ltr" }}>
                <p style={{ fontSize: 13, color: "#737373", marginBottom: 3 }}>נותר</p>
                <p style={{ fontSize: 30, fontWeight: 800, lineHeight: 1, color: totalRemaining >= 0 ? "#4ade80" : "#f87171" }}>
                  ₪{fmt(Math.abs(totalRemaining))}
                </p>
              </div>
            </div>
            <div className="mb-5">
              <div className="mb-1.5 flex justify-between">
                <span style={{ fontSize: 13, color: "#737373" }}>הוצא: ₪{fmt(totalActual)}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: utilPct > 90 ? "#f87171" : "#fff" }}>{Math.round(utilPct)}% נוצל</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.12)" }}>
                <div className="h-2.5 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, utilPct)}%`, background: utilPct > 100 ? "#ef4444" : utilPct > 80 ? "#f59e0b" : "#22c55e" }} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
              {[
                { label: "מתוכנן",        val: `₪${fmt(totalPlanned)}`   },
                { label: "הוצא",          val: `₪${fmt(totalActual)}`    },
                { label: "נותר",          val: `₪${fmt(Math.abs(totalRemaining))}` },
                { label: "ניצול",         val: `${Math.round(utilPct)}%` },
                { label: "יומי (תקציב)", val: `₪${fmt(avgDailyBudget)}` },
                { label: "יומי (בפועל)", val: `₪${fmt(avgDailyActual)}` },
              ].map(({ label, val }) => (
                <div key={label} className="rounded-2xl p-3 text-center" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <p style={{ fontSize: 9, color: "#737373", marginBottom: 3, lineHeight: 1.3 }}>{label}</p>
                  <p style={{ fontSize: 13, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 2-col on desktop ── */}
        <div className="md:grid md:grid-cols-2 md:gap-8">

          {/* LEFT: Categories + Savings */}
          <div className="space-y-8">
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#171717", marginBottom: 12 }}>קטגוריות תקציב</h2>
              <div className="space-y-2">
                {catItems.map(cat => {
                  const diff    = cat.planned - cat.actual;
                  const isOver  = !cat.purchased && cat.actual > cat.planned && cat.planned > 0;
                  const pct     = cat.planned > 0 ? Math.min(100, (cat.actual / cat.planned) * 100) : 0;
                  const Icon    = CAT_ICONS[cat.id] ?? Compass;
                  const editing = editCatId === cat.id;
                  return (
                    <div key={cat.id} className="overflow-hidden rounded-2xl"
                      style={{ border: isOver ? "1px solid #fecaca" : cat.purchased ? "1px solid #bbf7d0" : "1px solid #f0f0f0",
                               background: cat.purchased ? "#f0fdf4" : "#fff" }}>
                      <div className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                            style={{ background: cat.color + "18" }}>
                            <Icon className="h-4 w-4" style={{ color: cat.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span style={{ fontSize: 15, fontWeight: 600, color: "#171717" }}>{cat.label}</span>
                              {cat.purchased && (
                                <span className="flex items-center gap-1 rounded-full px-2 py-0.5"
                                  style={{ background: "#dcfce7", fontSize: 11, fontWeight: 700, color: "#15803d" }}>
                                  <CheckCircle2 className="h-3 w-3" />שולם
                                </span>
                              )}
                              {isOver && <AlertCircle className="h-4 w-4 text-red-500" />}
                            </div>
                            <div className="mt-0.5 flex flex-wrap items-center gap-x-3">
                              {editing ? (
                                <div className="flex items-center gap-1">
                                  <span style={{ fontSize: 12, color: "#a3a3a3" }}>₪</span>
                                  <input type="number" value={editVal} onChange={e => setEditVal(e.target.value)}
                                    onKeyDown={e => { if (e.key === "Enter") saveEdit(cat.id); if (e.key === "Escape") setEditCatId(null); }}
                                    className="w-20 rounded-lg border border-neutral-200 px-2 py-0.5" style={{ fontSize: 13 }} autoFocus />
                                  <button onClick={() => saveEdit(cat.id)} className="cursor-pointer rounded-md p-1 text-green-600 hover:bg-green-50"><Check className="h-3.5 w-3.5" /></button>
                                  <button onClick={() => setEditCatId(null)} className="cursor-pointer rounded-md p-1 text-neutral-400 hover:bg-neutral-100"><X className="h-3.5 w-3.5" /></button>
                                </div>
                              ) : (
                                <button onClick={() => !cat.purchased && startEdit(cat)}
                                  className="group flex items-center gap-1 rounded-lg px-1 py-0.5"
                                  style={{ cursor: cat.purchased ? "default" : "pointer" }}>
                                  <span style={{ fontSize: 13, color: "#737373" }}>מתוכנן: ₪{fmt(cat.planned)}</span>
                                  {!cat.purchased && <Edit2 className="h-3 w-3 text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                </button>
                              )}
                              <span style={{ fontSize: 13, color: cat.purchased ? "#16a34a" : isOver ? "#dc2626" : "#525252" }}>
                                {cat.purchased ? "⮕ אוטומטי:" : "בפועל:"} ₪{fmt(cat.actual)}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            <div className="flex items-center gap-1" style={{ color: diff >= 0 ? "#16a34a" : "#dc2626" }}>
                              {diff >= 0 ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                              <span style={{ fontSize: 13, fontWeight: 700 }}>{diff >= 0 ? `+₪${fmt(diff)}` : `-₪${fmt(Math.abs(diff))}`}</span>
                            </div>
                            <button onClick={() => togglePurchased(cat.id)} className="cursor-pointer rounded-xl px-2.5 py-1 transition-colors"
                              style={{ fontSize: 11, fontWeight: 600,
                                background: cat.purchased ? "#dcfce7" : "#fafafa",
                                color:      cat.purchased ? "#15803d" : "#737373",
                                border:     `1px solid ${cat.purchased ? "#bbf7d0" : "#e5e5e5"}` }}>
                              {cat.purchased ? "שולם ✓" : "סמן שולם"}
                            </button>
                          </div>
                        </div>
                        {cat.planned > 0 && (
                          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                            <div className="h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, background: cat.purchased ? "#22c55e" : isOver ? "#ef4444" : cat.color }} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Savings */}
            <div className="rounded-2xl p-5"
              style={{ background: totalRemaining >= 0 ? "#f0fdf4" : "#fef2f2",
                       border: `1px solid ${totalRemaining >= 0 ? "#bbf7d0" : "#fecaca"}` }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: totalRemaining >= 0 ? "#15803d" : "#dc2626", marginBottom: 10 }}>
                {totalRemaining >= 0 ? "מחשבון חיסכון" : "חריגה מתקציב"}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p style={{ fontSize: 28, fontWeight: 900, lineHeight: 1, color: totalRemaining >= 0 ? "#16a34a" : "#ef4444" }}>₪{fmt(Math.abs(totalRemaining))}</p>
                  <p style={{ fontSize: 13, color: "#737373", marginTop: 3 }}>{totalRemaining >= 0 ? "יתרה פנויה" : "חריגה"}</p>
                </div>
                <div>
                  <p style={{ fontSize: 28, fontWeight: 900, color: "#171717", lineHeight: 1 }}>₪{fmt(Math.max(0, totalRemaining) / TRIP_DAYS)}</p>
                  <p style={{ fontSize: 13, color: "#737373", marginTop: 3 }}>ממוצע ליום שנותר</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Hotel Decision Center + Expense */}
          <div className="mt-8 space-y-8 md:mt-0">

            {/* Hotel Decision Center */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#171717" }}>מרכז בחירת מלון</h2>
                <button onClick={() => setShowHotels(v => !v)}
                  className="flex cursor-pointer items-center gap-1 rounded-xl px-3 py-1.5 transition-colors hover:bg-neutral-50"
                  style={{ border: "1px solid #e5e5e5", fontSize: 13, color: "#737373" }}>
                  {showHotels ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  {showHotels ? "כווץ" : "פרט"}
                </button>
              </div>

              {/* Price cards */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                {HOTELS.map(h => {
                  const isSelected = selectedHotel === h.id;
                  return (
                    <button key={h.id} onClick={() => setSelectedHotel(h.id)}
                      className="cursor-pointer rounded-2xl p-4 text-right transition-all hover:shadow-md"
                      style={{ border: `2px solid ${isSelected ? "#171717" : "#f0f0f0"}`, background: isSelected ? "#fafafa" : "#fff" }}>
                      {h.isPrimary && (
                        <div className="mb-2 flex items-center gap-1" style={{ fontSize: 10, fontWeight: 700, color: "#ca8a04" }}>
                          <Star className="h-3 w-3" />מומלץ
                        </div>
                      )}
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#171717", lineHeight: 1.3 }}>{h.name}</p>
                      <p style={{ fontSize: 12, color: "#a3a3a3", marginTop: 2 }}>{h.location}</p>
                      <p style={{ fontSize: 24, fontWeight: 900, color: "#171717", marginTop: 6, lineHeight: 1 }}>€{h.price}</p>
                      <p style={{ fontSize: 11, color: "#a3a3a3" }}>≈ ₪{h.ils.toLocaleString()}</p>
                    </button>
                  );
                })}
              </div>

              {/* Price diff — computed both ways so this stays correct regardless of which
                  hotel is actually cheaper (Avalon's confirmed €813 now exceeds In Camera's
                  €435 estimate, reversing which side "saves"). */}
              <div className="mb-3 flex items-center justify-center gap-2 rounded-xl p-3" style={{ background: "#f5f5f5" }}>
                <Wallet className="h-4 w-4 text-neutral-400" />
                <span style={{ fontSize: 13, color: "#525252" }}>
                  הפרש: <strong>€{Math.abs(HOTELS[0].price - HOTELS[1].price)}</strong> (₪{Math.abs(HOTELS[0].ils - HOTELS[1].ils).toLocaleString()}) —
                  {HOTELS[0].price < HOTELS[1].price
                    ? ` ${HOTELS[0].nameShort} זול יותר`
                    : ` ${HOTELS[1].nameShort} זול יותר (משוער — ${HOTELS[0].nameShort} הוא הסכום המאומת בפועל)`}
                </span>
              </div>

              {/* Scores table */}
              <div className="overflow-hidden rounded-2xl" style={{ border: "1px solid #f0f0f0" }}>
                {([
                  { label: "התאמה למשפחה",     key: "familyMatch", color: "#7c3aed" },
                  { label: "WOW Factor",         key: "wow",         color: "#3b82f6" },
                  { label: "ערך לכסף",          key: "value",       color: "#22c55e" },
                  { label: "אלרגיה לחלב",       key: "milkAllergy", color: "#f59e0b" },
                ] as const).map(({ label, key, color }, i) => (
                  <div key={key} className="p-4" style={{ borderBottom: i < 3 ? "1px solid #fafafa" : "none" }}>
                    <div className="mb-2 flex items-center justify-between">
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#525252" }}>{label}</span>
                      <div className="flex gap-4">
                        {HOTELS.map(h => (
                          <span key={h.id} style={{ fontSize: 13, fontWeight: 700, color: "#171717", minWidth: 36, textAlign: "center" }}>{h.scores[key]}</span>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {HOTELS.map(h => <ScoreBar key={h.id} score={h.scores[key]} color={color} />)}
                    </div>
                    <div className="mt-1 grid grid-cols-2 gap-1">
                      {HOTELS.map(h => <span key={h.id} style={{ fontSize: 10, color: "#d1d5db", textAlign: "center" }}>{h.nameShort}</span>)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Distance + booking */}
              {showHotels && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {HOTELS.map(h => (
                    <div key={h.id} className="rounded-2xl p-4" style={{ border: "1px solid #f0f0f0" }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#171717", marginBottom: 8 }}>{h.nameShort}</p>
                      <div className="space-y-2 mb-3">
                        <div className="flex items-start gap-2">
                          <Utensils className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-neutral-300" />
                          <span style={{ fontSize: 12, color: "#525252" }}>מסעדות: {h.distanceRestaurants}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-neutral-300" />
                          <span style={{ fontSize: 12, color: "#525252" }}>אטרקציות: {h.distanceAttractions}</span>
                        </div>
                      </div>
                      <a href={h.bookingUrl} target="_blank" rel="noopener noreferrer"
                        className="block cursor-pointer rounded-xl py-2 text-center transition-opacity hover:opacity-80"
                        style={{ background: "#171717", color: "#fff", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                        הזמן ב-Booking
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommendation */}
              <div className="mt-3 flex items-start gap-3 rounded-2xl p-4"
                style={{ background: "#fef9ec", border: "1px solid #fde68a" }}>
                <Star className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: "#ca8a04" }} />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#92400e" }}>הוזמן: Avalon Boutique Hotel</p>
                  <p style={{ fontSize: 13, color: "#a16207", lineHeight: 1.5 }}>
                    בלב העיר העתיקה (לא New Town) · צעדים מארמון הגרנד מאסטר · ערך מצוין (90/100)
                  </p>
                </div>
              </div>

              {/* Price confirmed — was previously flagged as a discrepancy (€390 vs ₪2,896);
                  resolved with the actual paid amount. */}
              <div className="mt-3 flex items-start gap-3 rounded-2xl p-4" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: "#16a34a" }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#15803d" }}>🟢 מחיר המלון מאומת</p>
                  <p style={{ fontSize: 12, color: "#166534", lineHeight: 1.6, marginTop: 3 }}>
                    <strong>{fmtEur(813)} (≈ {fmtIls(ils(813))})</strong> — הסכום ששולם בפועל עבור כל השהות, לפי אישור המשתמש.
                    זה מחליף את שני המספרים הסותרים שהופיעו כאן קודם (€390 / ₪2,896), שלא היה להם מקור מאומת.
                  </p>
                </div>
              </div>
            </div>

            {/* Add expense */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#171717" }}>רישום הוצאה</h2>
                <button onClick={() => setShowForm(v => !v)}
                  className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 transition-colors hover:bg-neutral-50"
                  style={{ border: "1px solid #e5e5e5", fontSize: 15, fontWeight: 600, color: "#171717" }}>
                  {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {showForm ? "ביטול" : "הוסף"}
                </button>
              </div>
              {showForm && (
                <div className="rounded-3xl p-5 space-y-3" style={{ border: "1px solid #e5e5e5", background: "#fafafa" }}>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: "#737373", display: "block", marginBottom: 4 }}>תאריך</label>
                      <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                        className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5" style={{ fontSize: 15 }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: "#737373", display: "block", marginBottom: 4 }}>קטגוריה</label>
                      <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                        className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5" style={{ fontSize: 15 }}>
                        {data.categories.filter(c => !c.purchased).map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#737373", display: "block", marginBottom: 4 }}>תיאור</label>
                    <input type="text" placeholder="ארוחת ערב ONO" value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5" style={{ fontSize: 15 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#737373", display: "block", marginBottom: 4 }}>סכום (₪)</label>
                    <input type="number" placeholder="0" value={form.amount} min="0"
                      onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                      className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5" style={{ fontSize: 15 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#737373", display: "block", marginBottom: 4 }}>הערות</label>
                    <input type="text" placeholder="אופציונלי" value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5" style={{ fontSize: 15 }} />
                  </div>
                  <button onClick={addExpense}
                    className="w-full cursor-pointer rounded-2xl py-3.5 transition-opacity hover:opacity-80"
                    style={{ background: "#171717", color: "#fff", fontSize: 16, fontWeight: 700, border: "none" }}>
                    הוסף הוצאה
                  </button>
                </div>
              )}
            </div>

            {/* Expense list */}
            {data.expenses.length > 0 && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#171717", marginBottom: 12 }}>הוצאות ({data.expenses.length})</h2>
                <div className="space-y-2">
                  {data.expenses.map(exp => {
                    const cat  = data.categories.find(c => c.id === exp.categoryId);
                    const Icon = cat ? (CAT_ICONS[cat.id] ?? Compass) : Compass;
                    return (
                      <div key={exp.id} className="flex items-center gap-3 rounded-2xl p-4" style={{ border: "1px solid #f0f0f0" }}>
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                          style={{ background: (cat?.color ?? "#737373") + "18" }}>
                          <Icon className="h-4 w-4" style={{ color: cat?.color ?? "#737373" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p style={{ fontSize: 15, fontWeight: 600, color: "#171717", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{exp.description}</p>
                          <p style={{ fontSize: 13, color: "#a3a3a3" }}>{cat?.label} · {fmtDate(exp.date)}</p>
                          {exp.notes && <p style={{ fontSize: 12, color: "#a3a3a3" }}>{exp.notes}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span style={{ fontSize: 16, fontWeight: 700, color: "#171717" }}>₪{fmt(exp.amount)}</span>
                          <button onClick={() => deleteExpense(exp.id)} className="cursor-pointer rounded-lg p-1.5 hover:bg-red-50" aria-label="מחק">
                            <Trash2 className="h-4 w-4 text-neutral-300 hover:text-red-400 transition-colors" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Daily budget — day by day, from the actual itinerary ── */}
        <div>
          <button onClick={() => setShowDaily(v => !v)}
            className="flex w-full cursor-pointer items-center justify-between rounded-2xl p-4 transition-colors hover:bg-neutral-50"
            style={{ border: "1px solid #e5e5e5" }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: "#171717" }}>תקציב יומי לפי המסלול</span>
            {showDaily ? <ChevronUp className="h-5 w-5 text-neutral-400" /> : <ChevronDown className="h-5 w-5 text-neutral-400" />}
          </button>
          {showDaily && (
            <div className="mt-3 space-y-2">
              {TRIP.perDay.map(({ day, title, cost }) => {
                const dayMeta = DAYS.find(d => d.day === day)!;
                const isOpen = openDay === day;
                return (
                  <div key={day} className="overflow-hidden rounded-2xl" style={{ border: "1px solid #f0f0f0" }}>
                    <button onClick={() => setOpenDay(isOpen ? null : day)}
                      className="flex w-full cursor-pointer items-center justify-between p-4 text-right transition-colors hover:bg-neutral-50">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: dayMeta.bg }}>
                          <span style={{ fontSize: 14, fontWeight: 900, color: dayMeta.color }}>{day}</span>
                        </div>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#171717" }}>{title}</p>
                          <p style={{ fontSize: 11, color: "#a3a3a3" }}>{dayMeta.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div style={{ textAlign: "left", direction: "ltr" }}>
                          <p style={{ fontSize: 15, fontWeight: 800, color: "#171717" }}>{fmtEur(cost.total)}</p>
                          <p style={{ fontSize: 10, color: "#a3a3a3" }}>≈ {fmtIls(ils(cost.total))}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 flex-shrink-0 text-neutral-300" style={{ transform: isOpen ? "rotate(-90deg)" : "none", transition: "transform .2s" }} />
                      </div>
                    </button>
                    {isOpen && (
                      <div className="border-t p-4" style={{ borderColor: "#f0f0f0", background: "#fafafa" }}>
                        <div className="space-y-1.5">
                          {([
                            ["🎟️ אטרקציות", cost.activities],
                            ["🚕 תחבורה",   cost.transport],
                            ["🍽️ אוכל",     cost.food],
                            ["🛍️ קניות",    cost.shopping],
                            ["💳 אחר",      cost.other],
                          ] as const).filter(([, v]) => v > 0).map(([label, v]) => (
                            <div key={label} className="flex items-center justify-between">
                              <span style={{ fontSize: 13, color: "#525252" }}>{label}</span>
                              <span style={{ fontSize: 13, fontWeight: 700, color: "#171717" }}>{fmtMoney(v)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 flex items-center justify-between border-t pt-2" style={{ borderColor: "#e5e5e5" }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: "#171717" }}>סה"כ יום {day}</span>
                          <span style={{ fontSize: 15, fontWeight: 900, color: "#171717" }}>{fmtMoney(cost.total)}</span>
                        </div>
                        <p style={{ fontSize: 11, color: "#a3a3a3", marginTop: 4 }}>
                          🟢 מאומת: {fmtMoney(cost.confirmed)} · 🟡 משוער: {fmtMoney(cost.estimated)}
                          {DAYS.find(d => d.day === day)!.events.some(e => e.costStatus === "unknown") && " · 🔴 יש פריט/ים ללא מחיר ידוע (ראו למטה)"}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="rounded-2xl p-4" style={{ background: "#171717" }}>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>סה"כ 4 ימים (אוכל + תחבורה + אטרקציות)</span>
                  <div style={{ textAlign: "left", direction: "ltr" }}>
                    <p style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>{fmtEur(TRIP.totals.total)}</p>
                    <p style={{ fontSize: 12, color: "#a3a3a3" }}>≈ {fmtIls(ils(TRIP.totals.total))}</p>
                  </div>
                </div>
                <p style={{ fontSize: 11, color: "#737373", marginTop: 6 }}>
                  לא כולל טיסות, מלון (יש להם קטגוריה נפרדת למעלה) או קניות הבנות (₪{GIRLS_SHOPPING_BUDGET_ILS} — תקציב קבוע, לא נספר פה).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Food budget by meal type ── */}
        <div className="rounded-2xl p-4" style={{ border: "1px solid #f0f0f0" }}>
          <div className="mb-3 flex items-center gap-2">
            <Utensils className="h-4 w-4" style={{ color: "#22c55e" }} />
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#171717" }}>תרחיש תקציב אוכל — לפי סוג ארוחה</h2>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: "בוקר",   val: MEALS.breakfast },
              { label: "צהריים", val: MEALS.lunch },
              { label: "ערב",    val: MEALS.dinner },
            ].map(m => (
              <div key={m.label} className="rounded-xl p-3 text-center" style={{ background: "#f0fdf4" }}>
                <p style={{ fontSize: 11, color: "#166534" }}>{m.label}</p>
                <p style={{ fontSize: 15, fontWeight: 900, color: "#15803d", marginTop: 2 }}>{fmtEur(m.val)}</p>
                <p style={{ fontSize: 10, color: "#16a34a" }}>≈ {fmtIls(ils(m.val))}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t pt-2" style={{ borderColor: "#f0f0f0" }}>
            <span style={{ fontSize: 12, color: "#525252" }}>ממוצע יומי (4 ימים)</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#171717" }}>{fmtMoney(MEALS.dailyAverage)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span style={{ fontSize: 13, fontWeight: 800, color: "#171717" }}>סה"כ אוכל לכל הטיול</span>
            <span style={{ fontSize: 15, fontWeight: 900, color: "#171717" }}>{fmtMoney(MEALS.tripFood)}</span>
          </div>
          <p style={{ fontSize: 10, color: "#a3a3a3", marginTop: 6 }}>
            כולל את כל המנות הטבעוניות המומלצות שנחקרו (ONO, T-Veg, Zaytouna, PITAFAN, Rustico ועוד) · 🟡 רוב הסכומים משוערים — ראו סטטוס מדויק בכל מסעדה למטה.
          </p>
        </div>

        {/* ── Restaurant & dish prices ── */}
        <div>
          <button onClick={() => setShowDishes(v => !v)}
            className="flex w-full cursor-pointer items-center justify-between rounded-2xl p-4 transition-colors hover:bg-neutral-50"
            style={{ border: "1px solid #e5e5e5" }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: "#171717" }}>מחירי מסעדות ומנות מומלצות</span>
            {showDishes ? <ChevronUp className="h-5 w-5 text-neutral-400" /> : <ChevronDown className="h-5 w-5 text-neutral-400" />}
          </button>
          {showDishes && (
            <div className="mt-3 space-y-3">
              {DAYS.flatMap(d => d.events)
                .filter(e => e.type === "food" && e.dishes && e.dishes.length > 0)
                .map((e, i) => (
                  <div key={e.label + i} className="rounded-2xl p-4" style={{ border: "1px solid #f0f0f0" }}>
                    <div className="mb-1 flex items-center justify-between">
                      <p style={{ fontSize: 15, fontWeight: 800, color: "#171717" }}>{e.label.replace(/^ארוחת (בוקר|צהריים|ערב) — /, "")}</p>
                      {e.costPerPersonEUR != null && (
                        <span style={{ fontSize: 11, color: "#a3a3a3" }}>≈ {fmtMoney(e.costPerPersonEUR)} לאדם</span>
                      )}
                    </div>
                    <div className="space-y-2 mt-2">
                      {(e.dishes as Dish[]).map(d => (
                        <div key={d.name} className="rounded-xl p-2.5" style={{ background: "#fafafa" }}>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#171717" }}>{d.name}</span>
                            {d.priceEUR != null ? (
                              <>
                                <span className="rounded-full px-2 py-0.5" style={{ fontSize: 10, fontWeight: 800, background: "#171717", color: "#fff" }}>{fmtMoney(d.priceEUR)}</span>
                                <StatusChip status={d.priceStatus ?? "estimated"} />
                              </>
                            ) : <StatusChip status="unknown" />}
                          </div>
                          <p style={{ fontSize: 11, color: "#a3a3a3", marginTop: 3 }}>כמות מומלצת למשפחה: {dishQtyNote(d.name)}</p>
                        </div>
                      ))}
                    </div>
                    {e.costFamilyEUR != null && e.costFamilyEUR > 0 && (
                      <div className="mt-2 flex items-center justify-between border-t pt-2" style={{ borderColor: "#f0f0f0" }}>
                        <span style={{ fontSize: 12, color: "#525252" }}>סה"כ ארוחה משוער (3 אנשים)</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: "#171717" }}>{fmtMoney(e.costFamilyEUR)}</span>
                      </div>
                    )}
                  </div>
                ))}
              <p style={{ fontSize: 11, color: "#a3a3a3", lineHeight: 1.6 }}>
                רוב מחירי המנות הבודדות מסומנים 🟡 משוער — התפריטים המדויקים של המסעדות הקטנות לא היו זמינים לחיפוש עם מחירים פר-מנה. הטווח הכללי לאדם בכל מסעדה (למעלה) מבוסס על מחקר שוק רחב יותר, ועדיין ריאלי גם אם המנה הבודדת לא מאומתת.
              </p>
            </div>
          )}
        </div>

        {/* ── Girls' shopping budget ── */}
        <div className="rounded-3xl p-5" style={{ border: "1px solid #f0f0f0" }}>
          <div className="mb-3 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" style={{ color: "#ec4899" }} />
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#171717" }}>תקציב קניות לבנות</h2>
          </div>
          <p style={{ fontSize: 13, color: "#525252", lineHeight: 1.6, marginBottom: 12 }}>
            מחקר מחירים אמיתי: חולצת בסיס ב-Zara היא <strong>€9.95–15.95</strong> (מאומת, אתר Zara הרשמי, 2026) · H&M דומה בערך, קצת זול יותר (<strong>~€7–12</strong>, משוער) ·
            צמידים בדוכני עיר עתיקה נעים בין <strong>€8.50–25</strong> בחנויות תיירים/בוטיק (מאומת) — אך דוכני רחוב זולים בהרבה קיימים בדרך כלל, ומחיריהם לא אותרו במפורש (משוער €3–8).
          </p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "Low",       ils: 200, color: "#a3a3a3" },
              { label: "Realistic", ils: 500, color: "#16a34a" },
              { label: "Comfortable", ils: 800, color: "#0284c7" },
            ].map(t => (
              <div key={t.label} className="rounded-2xl p-3 text-center" style={{ border: `1.5px solid ${t.color}33`, background: `${t.color}0d` }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: t.color }}>{t.label}</p>
                <p style={{ fontSize: 18, fontWeight: 900, color: "#171717", marginTop: 4 }}>₪{t.ils}</p>
                <p style={{ fontSize: 10, color: "#a3a3a3" }}>≈ {fmtEur(t.ils / EUR_TO_ILS)}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl p-4" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: "#15803d" }}>✅ ₪{GIRLS_SHOPPING_BUDGET_ILS} לשתי הבנות יחד: ריאלי — ואף עם רווח</p>
            <p style={{ fontSize: 12, color: "#166534", lineHeight: 1.7, marginTop: 6 }}>
              ₪{GIRLS_SHOPPING_BUDGET_ILS} (≈ {fmtEur(GIRLS_SHOPPING_BUDGET_ILS / EUR_TO_ILS)}) נמצא מעל טווח ה-&quot;Realistic&quot; ומתקרב ל-&quot;Comfortable&quot; שלמעלה, בהנחה שקונים ברשתות
              כמו Zara/Bershka/H&M/ThriftIT ולא בבוטיקים היקרים בעיר העתיקה. חלוקה מוצעת (2-3 חולצות + מכנס אחד לכל בת, כמה צמידים זולים, מזכרות קטנות):
              כ-€130–170 (₪450–600) לשתיהן ביחד — משאיר כ-₪400–550 רזרבה לקניות ספונטניות או הפתעות.
            </p>
            <p style={{ fontSize: 12, color: "#166534", lineHeight: 1.7, marginTop: 6 }}>
              <strong>איך להישאר בתקציב:</strong> העדיפו את הרשתות (Zara/Bershka/H&M) ואת ThriftIT ליד המלון על פני דוכני תכשיטים בעיר העתיקה — שם צמיד יכול לעלות €20-25, פי 3-5 מדוכן רחוב פשוט. קבעו "תקרה לפריט" מראש (למשל חולצה עד ₪50, צמיד עד ₪25) לפני שיוצאים.
            </p>
          </div>
        </div>

        {/* ── Charts ── */}
        <div>
          <button onClick={() => setShowCharts(v => !v)}
            className="flex w-full cursor-pointer items-center justify-between rounded-2xl p-4 transition-colors hover:bg-neutral-50"
            style={{ border: "1px solid #e5e5e5" }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: "#171717" }}>גרפים וניתוח</span>
            {showCharts ? <ChevronUp className="h-5 w-5 text-neutral-400" /> : <ChevronDown className="h-5 w-5 text-neutral-400" />}
          </button>
          {showCharts && (
            <div className="mt-3 space-y-4">
              <div className="grid grid-cols-3 gap-3 rounded-2xl p-5 md:grid-cols-6" style={{ border: "1px solid #f0f0f0" }}>
                <Donut pct={utilPct} color="#7c3aed" label="ניצול" value={`₪${fmt(totalActual)}`} />
                <Donut pct={totalPlanned > 0 ? (Math.max(0, totalRemaining) / totalPlanned) * 100 : 0} color="#22c55e" label="נותר" value={`₪${fmt(Math.max(0, totalRemaining))}`} />
                <Donut pct={avgDailyBudget > 0 ? Math.min(100, (avgDailyActual / avgDailyBudget) * 100) : 0} color="#f59e0b" label="יומי" value={`₪${fmt(avgDailyActual)}`} />
                {catItems.filter(c => c.purchased).slice(0, 3).map(c => (
                  <Donut key={c.id} pct={100} color="#22c55e" label={c.label} value={`₪${fmt(c.planned)}`} />
                ))}
              </div>
              <div className="rounded-2xl p-5" style={{ border: "1px solid #f0f0f0" }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#171717", marginBottom: 12 }}>מתוכנן מול בפועל</p>
                <div className="space-y-3">
                  {catItems.map(cat => {
                    const maxVal = Math.max(...catItems.map(c => Math.max(c.planned, c.actual)), 1);
                    const pp = (cat.planned / maxVal) * 100;
                    const ap = (cat.actual  / maxVal) * 100;
                    const over = cat.actual > cat.planned && cat.planned > 0 && !cat.purchased;
                    return (
                      <div key={cat.id}>
                        <div className="mb-1 flex justify-between">
                          <span style={{ fontSize: 13, color: "#525252" }}>{cat.label}{cat.purchased ? " ✓" : ""}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: over ? "#ef4444" : "#171717" }}>₪{fmt(cat.actual)} / ₪{fmt(cat.planned)}</span>
                        </div>
                        <div className="relative h-3 overflow-hidden rounded-full bg-neutral-100">
                          <div className="absolute inset-y-0 right-0 rounded-full opacity-30" style={{ width: `${pp}%`, background: cat.color }} />
                          <div className="absolute inset-y-0 right-0 rounded-full transition-all duration-500"
                            style={{ width: `${ap}%`, background: over ? "#ef4444" : cat.purchased ? "#22c55e" : cat.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Export ── */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={exportJSON} className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl py-4 transition-colors hover:bg-neutral-50"
            style={{ border: "1px solid #e5e5e5", fontSize: 15, fontWeight: 600, color: "#525252" }}>
            <FileJson className="h-5 w-5" />ייצוא JSON
          </button>
          <button onClick={() => window.print()} className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl py-4 transition-colors hover:bg-neutral-50"
            style={{ border: "1px solid #e5e5e5", fontSize: 15, fontWeight: 600, color: "#525252" }}>
            <Download className="h-5 w-5" />ייצוא PDF
          </button>
        </div>

      </div>
    </div>
  );
}
