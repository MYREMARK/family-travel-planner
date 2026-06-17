"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plane, Hotel, Utensils, Bus, ShoppingBag, Compass,
  AlertCircle, Plus, Trash2, Download, FileJson,
  TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp,
  Edit2, Check, X,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface BudgetCategory {
  id:      string;
  label:   string;
  planned: number;
  color:   string;
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
  currency:   string;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────
const DEFAULT_CATEGORIES: BudgetCategory[] = [
  { id: "flights",    label: "טיסות",    planned: 3992, color: "#7c3aed" },
  { id: "hotel",      label: "מלון",     planned: 2896, color: "#3b82f6" },
  { id: "food",       label: "אוכל",     planned: 1200, color: "#22c55e" },
  { id: "transport",  label: "תחבורה",   planned: 300,  color: "#f59e0b" },
  { id: "shopping",   label: "קניות",    planned: 1000, color: "#ec4899" },
  { id: "activities", label: "אטרקציות", planned: 0,    color: "#06b6d4" },
  { id: "emergency",  label: "חירום",    planned: 500,  color: "#ef4444" },
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

const DEFAULT_STATE: BudgetState = {
  categories: DEFAULT_CATEGORIES,
  expenses:   [],
  currency:   "₪",
};

const STORAGE_KEY = "ftp-budget-v1";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return Math.round(n).toLocaleString("he-IL");
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("he-IL", { day: "numeric", month: "short" });
}

// ─── Mini bar chart ───────────────────────────────────────────────────────────
function BarChart({ items }: { items: { label: string; planned: number; actual: number; color: string }[] }) {
  const maxVal = Math.max(...items.map(i => Math.max(i.planned, i.actual)), 1);
  return (
    <div className="space-y-3">
      {items.map(item => {
        const plannedPct = (item.planned / maxVal) * 100;
        const actualPct  = (item.actual  / maxVal) * 100;
        const over       = item.actual > item.planned && item.planned > 0;
        return (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between">
              <span style={{ fontSize: 13, color: "#525252" }}>{item.label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: over ? "#ef4444" : "#171717" }}>
                ₪{fmt(item.actual)} / ₪{fmt(item.planned)}
              </span>
            </div>
            <div className="relative h-3 overflow-hidden rounded-full bg-neutral-100">
              {/* Planned bar */}
              <div className="absolute inset-y-0 right-0 rounded-full opacity-30 transition-all duration-500"
                style={{ width: `${plannedPct}%`, background: item.color }} />
              {/* Actual bar */}
              <div className="absolute inset-y-0 right-0 rounded-full transition-all duration-500"
                style={{ width: `${actualPct}%`, background: over ? "#ef4444" : item.color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Donut chart (SVG) ───────────────────────────────────────────────────────
function DonutChart({ pct, color, label, value }: { pct: number; color: string; label: string; value: string }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const dash = Math.min(pct, 100) / 100 * circ;
  return (
    <div className="flex flex-col items-center">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#f0f0f0" strokeWidth="10" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }} />
        <text x="48" y="44" textAnchor="middle" dominantBaseline="middle"
          fontSize="14" fontWeight="800" fill="#171717">{Math.round(pct)}%</text>
        <text x="48" y="60" textAnchor="middle" fontSize="9" fill="#a3a3a3">{label}</text>
      </svg>
      <p style={{ fontSize: 14, fontWeight: 700, color: "#171717", marginTop: 2 }}>{value}</p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function BudgetPage() {
  const [data, setData]           = useState<BudgetState>(DEFAULT_STATE);
  const [loaded, setLoaded]       = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [editCatId, setEditCatId] = useState<string | null>(null);
  const [editVal,   setEditVal]   = useState("");
  const [form, setForm] = useState({
    date:        todayISO(),
    categoryId:  "food",
    description: "",
    amount:      "",
    notes:       "",
  });

  // Load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData(JSON.parse(raw));
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  // Auto-save
  const save = useCallback((next: BudgetState) => {
    setData(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }, []);

  // Computed
  const totalPlanned = data.categories.reduce((s, c) => s + c.planned, 0);
  const actualByCat  = Object.fromEntries(
    data.categories.map(c => [c.id, data.expenses.filter(e => e.categoryId === c.id).reduce((s, e) => s + e.amount, 0)])
  );
  const totalActual    = Object.values(actualByCat).reduce((s, v) => s + v, 0);
  const totalRemaining = totalPlanned - totalActual;
  const utilPct        = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0;
  const tripDays       = 4;
  const avgPerDay      = totalRemaining > 0 ? totalRemaining / tripDays : 0;
  const overBudgetCats = data.categories.filter(c => actualByCat[c.id] > c.planned && c.planned > 0);

  // Add expense
  const addExpense = () => {
    if (!form.description || !form.amount) return;
    const expense: Expense = {
      id:          uid(),
      date:        form.date,
      categoryId:  form.categoryId,
      description: form.description,
      amount:      parseFloat(form.amount),
      notes:       form.notes,
    };
    save({ ...data, expenses: [expense, ...data.expenses] });
    setForm({ date: todayISO(), categoryId: form.categoryId, description: "", amount: "", notes: "" });
    setShowForm(false);
  };

  const deleteExpense = (id: string) =>
    save({ ...data, expenses: data.expenses.filter(e => e.id !== id) });

  const startEditCat = (cat: BudgetCategory) => {
    setEditCatId(cat.id);
    setEditVal(String(cat.planned));
  };

  const saveEditCat = (id: string) => {
    const val = parseFloat(editVal);
    if (isNaN(val)) { setEditCatId(null); return; }
    save({
      ...data,
      categories: data.categories.map(c => c.id === id ? { ...c, planned: val } : c),
    });
    setEditCatId(null);
  };

  // Export JSON
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ ...data, exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `budget-${todayISO()}.json`; a.click();
  };

  // Export PDF (print)
  const exportPDF = () => window.print();

  if (!loaded) return null;

  const catItems = data.categories.map(c => ({ ...c, actual: actualByCat[c.id] ?? 0 }));

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Rubik', system-ui, sans-serif" }}>
      <div className="mx-auto max-w-2xl px-4 pb-32 pt-10 space-y-8">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-end justify-between">
          <div>
            <p style={{ fontSize: 15, color: "#a3a3a3", marginBottom: 4 }}>רודוס · ספטמבר 2026</p>
            <h1 style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.1, color: "#171717", letterSpacing: "-0.02em" }}>
              מרכז תקציב
            </h1>
          </div>
          <div className="flex gap-2">
            <button onClick={exportJSON} className="cursor-pointer rounded-xl p-2.5 transition-colors hover:bg-neutral-100"
              style={{ border: "1px solid #e5e5e5", background: "#fff" }} aria-label="ייצא JSON">
              <FileJson className="h-5 w-5 text-neutral-500" />
            </button>
            <button onClick={exportPDF} className="cursor-pointer rounded-xl p-2.5 transition-colors hover:bg-neutral-100"
              style={{ border: "1px solid #e5e5e5", background: "#fff" }} aria-label="הדפס PDF">
              <Download className="h-5 w-5 text-neutral-500" />
            </button>
          </div>
        </div>

        {/* ── Over-budget alert ───────────────────────────────────────── */}
        {overBudgetCats.length > 0 && (
          <div className="flex items-start gap-3 rounded-2xl p-4" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#dc2626", marginBottom: 2 }}>חריגה מתקציב</p>
              <p style={{ fontSize: 14, color: "#b91c1c", lineHeight: 1.5 }}>
                {overBudgetCats.map(c => c.label).join(", ")} — עבר את הסכום המתוכנן
              </p>
            </div>
          </div>
        )}

        {/* ── Overview hero card ──────────────────────────────────────── */}
        <div className="overflow-hidden rounded-3xl" style={{ background: "#171717" }}>
          <div className="p-6">
            {/* Total + remaining */}
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p style={{ fontSize: 14, color: "#737373", marginBottom: 4 }}>תקציב כולל</p>
                <p style={{ fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1 }}>
                  ₪{fmt(totalPlanned)}
                </p>
              </div>
              <div className="text-left" style={{ direction: "ltr" }}>
                <p style={{ fontSize: 13, color: "#737373", marginBottom: 4 }}>נותר</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: totalRemaining >= 0 ? "#4ade80" : "#f87171", lineHeight: 1 }}>
                  ₪{fmt(Math.abs(totalRemaining))}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="mb-1.5 flex justify-between">
                <span style={{ fontSize: 13, color: "#737373" }}>הוצא: ₪{fmt(totalActual)}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: utilPct > 90 ? "#f87171" : "#fff" }}>
                  {Math.round(utilPct)}% נוצל
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.12)" }}>
                <div className="h-2.5 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, utilPct)}%`, background: utilPct > 100 ? "#ef4444" : utilPct > 80 ? "#f59e0b" : "#22c55e" }} />
              </div>
            </div>

            {/* 3 stats */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "מתוכנן",      val: `₪${fmt(totalPlanned)}`,  sub: "סה״כ תקציב" },
                { label: "הוצא",        val: `₪${fmt(totalActual)}`,   sub: "עד כה" },
                { label: "ממוצע/יום",   val: `₪${fmt(avgPerDay)}`,     sub: `${tripDays} ימים` },
              ].map(({ label, val, sub }) => (
                <div key={label} className="rounded-2xl p-3 text-center" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <p style={{ fontSize: 11, color: "#737373", marginBottom: 3 }}>{label}</p>
                  <p style={{ fontSize: 16, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{val}</p>
                  <p style={{ fontSize: 10, color: "#525252", marginTop: 2 }}>{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Category budgets ────────────────────────────────────────── */}
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#171717", marginBottom: 12 }}>קטגוריות תקציב</h2>
          <div className="space-y-2">
            {catItems.map(cat => {
              const diff   = cat.planned - cat.actual;
              const isOver = cat.actual > cat.planned && cat.planned > 0;
              const pct    = cat.planned > 0 ? Math.min(100, (cat.actual / cat.planned) * 100) : 0;
              const Icon   = CAT_ICONS[cat.id] ?? Compass;
              const editing = editCatId === cat.id;

              return (
                <div key={cat.id} className="overflow-hidden rounded-2xl" style={{ border: isOver ? "1px solid #fecaca" : "1px solid #f0f0f0", background: "#fff" }}>
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                        style={{ background: cat.color + "18" }}>
                        <Icon className="h-4.5 w-4.5" style={{ color: cat.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: 15, fontWeight: 600, color: "#171717" }}>{cat.label}</span>
                          {isOver && <AlertCircle className="h-4 w-4 text-red-500" />}
                        </div>
                        <div className="mt-0.5 flex items-center gap-3">
                          {/* Planned — editable */}
                          {editing ? (
                            <div className="flex items-center gap-1">
                              <span style={{ fontSize: 12, color: "#a3a3a3" }}>₪</span>
                              <input
                                type="number"
                                value={editVal}
                                onChange={e => setEditVal(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") saveEditCat(cat.id); if (e.key === "Escape") setEditCatId(null); }}
                                className="w-20 rounded-lg border border-neutral-200 px-2 py-0.5 text-sm"
                                style={{ fontSize: 13 }}
                                autoFocus
                              />
                              <button onClick={() => saveEditCat(cat.id)} className="cursor-pointer rounded-md p-1 text-green-600 hover:bg-green-50">
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => setEditCatId(null)} className="cursor-pointer rounded-md p-1 text-neutral-400 hover:bg-neutral-100">
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => startEditCat(cat)} className="group flex cursor-pointer items-center gap-1 rounded-lg px-1 py-0.5 transition-colors hover:bg-neutral-100">
                              <span style={{ fontSize: 13, color: "#737373" }}>מתוכנן: ₪{fmt(cat.planned)}</span>
                              <Edit2 className="h-3 w-3 text-neutral-300 opacity-0 transition-opacity group-hover:opacity-100" />
                            </button>
                          )}
                          <span style={{ fontSize: 13, color: isOver ? "#dc2626" : "#525252" }}>
                            הוצא: ₪{fmt(cat.actual)}
                          </span>
                        </div>
                      </div>
                      {/* Diff */}
                      <div className="flex-shrink-0 flex items-center gap-1"
                        style={{ color: diff >= 0 ? "#16a34a" : "#dc2626" }}>
                        {diff >= 0
                          ? <TrendingDown className="h-4 w-4" />
                          : <TrendingUp   className="h-4 w-4" />
                        }
                        <span style={{ fontSize: 13, fontWeight: 700 }}>
                          {diff >= 0 ? `+₪${fmt(diff)}` : `-₪${fmt(Math.abs(diff))}`}
                        </span>
                      </div>
                    </div>

                    {/* Mini progress */}
                    {cat.planned > 0 && (
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                        <div className="h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: isOver ? "#ef4444" : cat.color }} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Add expense ─────────────────────────────────────────────── */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#171717" }}>רישום הוצאה</h2>
            <button onClick={() => setShowForm(v => !v)}
              className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 transition-colors hover:bg-neutral-50"
              style={{ border: "1px solid #e5e5e5", fontSize: 15, fontWeight: 600, color: "#171717" }}>
              {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showForm ? "ביטול" : "הוסף הוצאה"}
            </button>
          </div>

          {showForm && (
            <div className="rounded-3xl p-5 space-y-3" style={{ border: "1px solid #e5e5e5", background: "#fafafa" }}>
              {/* Date + Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#737373", display: "block", marginBottom: 4 }}>תאריך</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5"
                    style={{ fontSize: 15 }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#737373", display: "block", marginBottom: 4 }}>קטגוריה</label>
                  <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5"
                    style={{ fontSize: 15 }}>
                    {data.categories.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#737373", display: "block", marginBottom: 4 }}>תיאור</label>
                <input type="text" placeholder="למשל: ארוחת ערב ONO" value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5"
                  style={{ fontSize: 15 }} />
              </div>

              {/* Amount */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#737373", display: "block", marginBottom: 4 }}>סכום (₪)</label>
                <input type="number" placeholder="0" value={form.amount} min="0"
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5"
                  style={{ fontSize: 15 }} />
              </div>

              {/* Notes */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#737373", display: "block", marginBottom: 4 }}>הערות</label>
                <input type="text" placeholder="אופציונלי" value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5"
                  style={{ fontSize: 15 }} />
              </div>

              <button onClick={addExpense}
                className="w-full cursor-pointer rounded-2xl py-3.5 transition-opacity hover:opacity-80"
                style={{ background: "#171717", color: "#fff", fontSize: 16, fontWeight: 700, border: "none" }}>
                הוסף הוצאה
              </button>
            </div>
          )}
        </div>

        {/* ── Expense list ────────────────────────────────────────────── */}
        {data.expenses.length > 0 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#171717", marginBottom: 12 }}>הוצאות ({data.expenses.length})</h2>
            <div className="space-y-2">
              {data.expenses.map(exp => {
                const cat  = data.categories.find(c => c.id === exp.categoryId);
                const Icon = cat ? (CAT_ICONS[cat.id] ?? Compass) : Compass;
                return (
                  <div key={exp.id} className="flex items-center gap-3 rounded-2xl p-4"
                    style={{ border: "1px solid #f0f0f0", background: "#fff" }}>
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{ background: (cat?.color ?? "#737373") + "18" }}>
                      <Icon className="h-4 w-4" style={{ color: cat?.color ?? "#737373" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 15, fontWeight: 600, color: "#171717", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {exp.description}
                      </p>
                      <p style={{ fontSize: 13, color: "#a3a3a3" }}>{cat?.label} · {fmtDate(exp.date)}</p>
                      {exp.notes && <p style={{ fontSize: 12, color: "#a3a3a3", marginTop: 1 }}>{exp.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span style={{ fontSize: 16, fontWeight: 700, color: "#171717" }}>₪{fmt(exp.amount)}</span>
                      <button onClick={() => deleteExpense(exp.id)} className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-red-50"
                        aria-label="מחק הוצאה">
                        <Trash2 className="h-4 w-4 text-neutral-300 hover:text-red-400 transition-colors" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Charts ─────────────────────────────────────────────────── */}
        <div>
          <button onClick={() => setShowCharts(v => !v)}
            className="flex w-full cursor-pointer items-center justify-between rounded-2xl p-4 transition-colors hover:bg-neutral-50"
            style={{ border: "1px solid #e5e5e5", background: "#fff" }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: "#171717" }}>גרפים וניתוח</span>
            {showCharts ? <ChevronUp className="h-5 w-5 text-neutral-400" /> : <ChevronDown className="h-5 w-5 text-neutral-400" />}
          </button>

          {showCharts && (
            <div className="mt-3 space-y-5">
              {/* Bar chart */}
              <div className="rounded-2xl p-5" style={{ border: "1px solid #f0f0f0" }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#171717", marginBottom: 12 }}>מתוכנן מול בפועל</p>
                <BarChart items={catItems.map(c => ({
                  label:   c.label,
                  planned: c.planned,
                  actual:  c.actual,
                  color:   c.color,
                }))} />
                <div className="mt-3 flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-4 rounded-full opacity-30 bg-neutral-400" />
                    <span style={{ fontSize: 12, color: "#a3a3a3" }}>מתוכנן</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-4 rounded-full bg-neutral-700" />
                    <span style={{ fontSize: 12, color: "#a3a3a3" }}>בפועל</span>
                  </div>
                </div>
              </div>

              {/* Donut charts */}
              <div className="grid grid-cols-3 gap-3 rounded-2xl p-5" style={{ border: "1px solid #f0f0f0" }}>
                <DonutChart pct={utilPct}       color="#7c3aed" label="ניצול"   value={`₪${fmt(totalActual)}`} />
                <DonutChart pct={totalRemaining > 0 ? (totalRemaining / totalPlanned) * 100 : 0} color="#22c55e" label="נותר" value={`₪${fmt(Math.max(0, totalRemaining))}`} />
                <DonutChart pct={Math.min(100, avgPerDay / (totalPlanned / tripDays) * 100)} color="#f59e0b" label="יומי" value={`₪${fmt(avgPerDay)}`} />
              </div>

              {/* Allocation breakdown */}
              <div className="rounded-2xl p-5" style={{ border: "1px solid #f0f0f0" }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#171717", marginBottom: 12 }}>הקצאת תקציב</p>
                {catItems.filter(c => c.planned > 0).map(cat => (
                  <div key={cat.id} className="mb-2 flex items-center gap-2">
                    <div className="h-3 w-3 flex-shrink-0 rounded-full" style={{ background: cat.color }} />
                    <span style={{ fontSize: 13, color: "#525252", flex: 1 }}>{cat.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#171717" }}>
                      {Math.round(cat.planned / totalPlanned * 100)}%
                    </span>
                    <span style={{ fontSize: 13, color: "#a3a3a3" }}>₪{fmt(cat.planned)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Savings calc ────────────────────────────────────────────── */}
        <div className="rounded-2xl p-5" style={{ background: totalRemaining >= 0 ? "#f0fdf4" : "#fef2f2", border: `1px solid ${totalRemaining >= 0 ? "#bbf7d0" : "#fecaca"}` }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: totalRemaining >= 0 ? "#15803d" : "#dc2626", marginBottom: 8 }}>
            {totalRemaining >= 0 ? "נותר לטיול" : "חריגה מתקציב"}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p style={{ fontSize: 26, fontWeight: 900, color: totalRemaining >= 0 ? "#16a34a" : "#ef4444", lineHeight: 1 }}>
                ₪{fmt(Math.abs(totalRemaining))}
              </p>
              <p style={{ fontSize: 13, color: "#737373", marginTop: 2 }}>{totalRemaining >= 0 ? "יתרה" : "חריגה"}</p>
            </div>
            <div>
              <p style={{ fontSize: 26, fontWeight: 900, color: "#171717", lineHeight: 1 }}>₪{fmt(avgPerDay)}</p>
              <p style={{ fontSize: 13, color: "#737373", marginTop: 2 }}>ממוצע ליום שנותר</p>
            </div>
          </div>
        </div>

        {/* ── Export ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={exportJSON}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl py-4 transition-colors hover:bg-neutral-50"
            style={{ border: "1px solid #e5e5e5", fontSize: 15, fontWeight: 600, color: "#525252" }}>
            <FileJson className="h-5 w-5" />
            ייצוא JSON
          </button>
          <button onClick={exportPDF}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl py-4 transition-colors hover:bg-neutral-50"
            style={{ border: "1px solid #e5e5e5", fontSize: 15, fontWeight: 600, color: "#525252" }}>
            <Download className="h-5 w-5" />
            ייצוא PDF
          </button>
        </div>

      </div>
    </div>
  );
}
