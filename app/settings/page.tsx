"use client";

import { useState, useRef } from "react";
import {
  Download, Upload, Trash2, RefreshCw,
  CheckCircle2, Info, Wifi, Languages, AlertCircle,
  ChevronDown, ChevronUp, Copy, Check,
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

// ─── Greek language data ───────────────────────────────────────────────────────
interface Phrase { greek: string; english: string; hebrew: string; pronunciation: string; }

const ALLERGY_EMERGENCY: Phrase[] = [
  { greek: "Έχω σοβαρή αλλεργία στο γάλα", english: "I have a severe milk allergy", hebrew: "יש לי אלרגיה חמורה לחלב", pronunciation: "E-ho so-va-RI a-ler-GI-a sto GA-la" },
  { greek: "Αυτό μπορεί να είναι επικίνδυνο", english: "This can be dangerous", hebrew: "זה יכול להיות מסוכן", pronunciation: "Af-TO bo-RI na I-ne e-pi-KIN-di-no" },
  { greek: "Παρακαλώ ελέγξτε τα συστατικά", english: "Please check the ingredients", hebrew: "בבקשה בדקו את הרכיבים", pronunciation: "Pa-ra-ka-LO e-LEGX-te ta si-sta-ti-KA" },
  { greek: "Χωρίς γάλα", english: "No milk", hebrew: "ללא חלב", pronunciation: "Ho-RIS GA-la" },
  { greek: "Χωρίς τυρί", english: "No cheese", hebrew: "ללא גבינה", pronunciation: "Ho-RIS ti-RI" },
  { greek: "Χωρίς βούτυρο", english: "No butter", hebrew: "ללא חמאה", pronunciation: "Ho-RIS VOU-ti-ro" },
  { greek: "Χωρίς κρέμα", english: "No cream", hebrew: "ללא שמנת", pronunciation: "Ho-RIS KRE-ma" },
  { greek: "Χωρίς γιαούρτι", english: "No yogurt", hebrew: "ללא יוגורט", pronunciation: "Ho-RIS ya-OUR-ti" },
];

const CATEGORIES: { id: string; label: string; labelEn: string; phrases: Phrase[] }[] = [
  {
    id: "greetings", label: "ברכות", labelEn: "Greetings",
    phrases: [
      { greek: "Γεια σου", english: "Hello / Hi", hebrew: "שלום / היי", pronunciation: "Ya SOO" },
      { greek: "Καλημέρα", english: "Good Morning", hebrew: "בוקר טוב", pronunciation: "Ka-li-ME-ra" },
      { greek: "Καλησπέρα", english: "Good Evening", hebrew: "ערב טוב", pronunciation: "Ka-lis-PE-ra" },
      { greek: "Ευχαριστώ", english: "Thank You", hebrew: "תודה", pronunciation: "Ef-ha-ris-TO" },
      { greek: "Παρακαλώ", english: "Please / You're Welcome", hebrew: "בבקשה / אין על מה", pronunciation: "Pa-ra-ka-LO" },
      { greek: "Ναι", english: "Yes", hebrew: "כן", pronunciation: "Ne" },
      { greek: "Όχι", english: "No", hebrew: "לא", pronunciation: "O-hi" },
      { greek: "Αντίο", english: "Goodbye", hebrew: "להתראות", pronunciation: "A-DI-o" },
      { greek: "Συγγνώμη", english: "Excuse me / Sorry", hebrew: "סליחה", pronunciation: "sig-NO-mi" },
    ],
  },
  {
    id: "restaurants", label: "מסעדות", labelEn: "Restaurants",
    phrases: [
      { greek: "Τον λογαριασμό, παρακαλώ", english: "The bill, please", hebrew: "חשבון, בבקשה", pronunciation: "ton lo-ga-ri-as-MO, pa-ra-ka-LO" },
      { greek: "Πόσο κάνει αυτό;", english: "How much does this cost?", hebrew: "כמה זה עולה", pronunciation: "PO-so KA-ni af-TO" },
      { greek: "Μπορώ να πληρώσω με κάρτα;", english: "Can I pay by card?", hebrew: "אפשר לשלם בכרטיס", pronunciation: "bo-RO na pli-RO-so me KAR-ta" },
      { greek: "Έχετε vegan επιλογές;", english: "Do you have vegan options?", hebrew: "יש אפשרויות טבעוניות", pronunciation: "E-he-te vegan e-pi-lo-GES" },
      { greek: "Χωρίς γαλακτοκομικά", english: "Without dairy products", hebrew: "ללא מוצרי חלב", pronunciation: "Ho-RIS ga-lak-to-ko-mi-KA" },
      { greek: "Είναι νόστιμο!", english: "It is delicious!", hebrew: "זה טעים", pronunciation: "I-ne NOS-ti-mo" },
      { greek: "Νερό, παρακαλώ", english: "Water, please", hebrew: "מים, בבקשה", pronunciation: "ne-RO, pa-ra-ka-LO" },
    ],
  },
  {
    id: "shopping", label: "קניות", labelEn: "Shopping",
    phrases: [
      { greek: "Πόσο κάνει;", english: "How much is it?", hebrew: "כמה זה עולה", pronunciation: "PO-so KA-ni" },
      { greek: "Έχετε άλλο μέγεθος;", english: "Do you have another size?", hebrew: "יש במידה אחרת", pronunciation: "E-he-te A-lo ME-ge-thos" },
      { greek: "Απλώς κοιτάζω", english: "Just looking", hebrew: "רק מסתכל", pronunciation: "Ap-LOS ki-TA-zo" },
      { greek: "Μπορώ να το δοκιμάσω;", english: "Can I try it on?", hebrew: "אני יכול לנסות", pronunciation: "bo-RO na to do-ki-MA-so" },
      { greek: "Πολύ ακριβό", english: "Too expensive", hebrew: "יקר מדי", pronunciation: "po-LI a-kri-VO" },
      { greek: "Έχετε έκπτωση;", english: "Do you have a discount?", hebrew: "יש הנחה", pronunciation: "E-he-te EK-pTo-si" },
    ],
  },
  {
    id: "directions", label: "כיוונים", labelEn: "Directions",
    phrases: [
      { greek: "Πού είναι...;", english: "Where is...?", hebrew: "איפה נמצא", pronunciation: "Pou I-ne" },
      { greek: "Πού είναι η τουαλέτα;", english: "Where is the bathroom?", hebrew: "איפה השירותים", pronunciation: "Pou I-ne i tua-LE-ta" },
      { greek: "Δεξιά", english: "Right", hebrew: "ימינה", pronunciation: "dex-i-A" },
      { greek: "Αριστερά", english: "Left", hebrew: "שמאלה", pronunciation: "a-ris-te-RA" },
      { greek: "Ευθεία", english: "Straight ahead", hebrew: "ישר", pronunciation: "ef-THI-a" },
      { greek: "Μακριά;", english: "Is it far?", hebrew: "זה רחוק", pronunciation: "ma-kri-A" },
      { greek: "Μπορείτε να με βοηθήσετε;", english: "Can you help me?", hebrew: "תוכלו לעזור לי", pronunciation: "bo-RI-te na me vo-i-THI-se-te" },
    ],
  },
  {
    id: "emergency", label: "חירום", labelEn: "Emergency",
    phrases: [
      { greek: "Χρειάζομαι βοήθεια!", english: "I need help!", hebrew: "אני צריך עזרה", pronunciation: "hri-A-zo-me vo-I-thi-a" },
      { greek: "Καλέστε ασθενοφόρο!", english: "Call an ambulance!", hebrew: "קראו לאמבולנס", pronunciation: "ka-LE-ste as-the-no-FO-ro" },
      { greek: "Πού είναι το φαρμακείο;", english: "Where is the pharmacy?", hebrew: "איפה בית מרקחת", pronunciation: "Pou I-ne to far-ma-KI-o" },
      { greek: "Τηλεφωνήστε την αστυνομία", english: "Call the police", hebrew: "התקשרו למשטרה", pronunciation: "ti-le-fo-NI-ste tin as-ti-no-MI-a" },
    ],
  },
  {
    id: "numbers", label: "מספרים", labelEn: "Numbers",
    phrases: [
      { greek: "Ένα", english: "1 — One", hebrew: "אחד", pronunciation: "E-na" },
      { greek: "Δύο", english: "2 — Two", hebrew: "שניים", pronunciation: "DI-o" },
      { greek: "Τρία", english: "3 — Three", hebrew: "שלושה", pronunciation: "TRI-a" },
      { greek: "Τέσσερα", english: "4 — Four", hebrew: "ארבעה", pronunciation: "TE-se-ra" },
      { greek: "Πέντε", english: "5 — Five", hebrew: "חמישה", pronunciation: "PEN-de" },
      { greek: "Έξι", english: "6 — Six", hebrew: "שישה", pronunciation: "EX-i" },
      { greek: "Εφτά", english: "7 — Seven", hebrew: "שבעה", pronunciation: "ef-TA" },
      { greek: "Οχτώ", english: "8 — Eight", hebrew: "שמונה", pronunciation: "oh-TO" },
      { greek: "Εννέα", english: "9 — Nine", hebrew: "תשעה", pronunciation: "e-NE-a" },
      { greek: "Δέκα", english: "10 — Ten", hebrew: "עשרה", pronunciation: "DE-ka" },
      { greek: "Είκοσι", english: "20 — Twenty", hebrew: "עשרים", pronunciation: "I-ko-si" },
      { greek: "Πενήντα", english: "50 — Fifty", hebrew: "חמישים", pronunciation: "pe-NIN-da" },
      { greek: "Εκατό", english: "100 — One hundred", hebrew: "מאה", pronunciation: "e-ka-TO" },
    ],
  },
];

// ─── Phrase row ────────────────────────────────────────────────────────────────
function PhraseRow({ p, accentColor = "#0284c7" }: { p: Phrase; accentColor?: string }) {
  const [copied, setCopied] = useState(false);

  const copyGreek = () => {
    navigator.clipboard.writeText(p.greek).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl p-3.5" style={{ border: "1px solid #f0f0f0", background: "#fff" }}>
      {/* Greek + copy */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span style={{ fontSize: 18, fontWeight: 800, color: "#171717", lineHeight: 1.3 }}>
          {p.greek}
        </span>
        <button
          onClick={copyGreek}
          className="flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-xl transition-colors hover:bg-neutral-100"
          style={{ border: "1px solid #f0f0f0", background: copied ? "#f0fdf4" : "#fff" }}
          aria-label="העתק">
          {copied
            ? <Check className="h-3.5 w-3.5 text-green-500" />
            : <Copy className="h-3.5 w-3.5 text-neutral-400" />
          }
        </button>
      </div>
      {/* Pronunciation */}
      <div className="mb-2 rounded-lg px-2.5 py-1.5" style={{ background: "#f8f8f8" }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: accentColor, fontStyle: "italic" }}>
          {p.pronunciation}
        </p>
      </div>
      {/* Hebrew + English */}
      <div className="flex items-center justify-between gap-2">
        <span style={{ fontSize: 14, color: "#171717", fontWeight: 600 }}>{p.hebrew}</span>
        <span style={{ fontSize: 13, color: "#737373" }}>{p.english}</span>
      </div>
    </div>
  );
}

// ─── Greek cheat sheet ─────────────────────────────────────────────────────────
function GreekCheatSheet() {
  const [activeCategory, setActiveCategory] = useState<string | null>("greetings");

  return (
    <div>
      {/* Section header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "#1d4ed8" }}>
          <Languages className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: "#171717", lineHeight: 1.1 }}>יוונית לטיול</h2>
          <p style={{ fontSize: 14, color: "#737373", marginTop: 2 }}>מדריך שפה מהיר · Greek Cheat Sheet</p>
        </div>
      </div>

      {/* ── MILK ALLERGY EMERGENCY CARD ── always visible, first ── */}
      <div className="mb-6 overflow-hidden rounded-3xl" style={{ background: "#7f1d1d", border: "2px solid #dc2626" }}>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0" style={{ color: "#fca5a5" }} />
            <span style={{ fontSize: 14, fontWeight: 800, color: "#fca5a5", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              כרטיס חירום — אלרגיה לחלב · נועם
            </span>
          </div>

          {/* Big show-me card */}
          <div className="rounded-2xl p-4 mb-4" style={{ background: "#fff" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#dc2626", marginBottom: 8 }}>הראו כרטיס זה למלצר</p>
            <p style={{ fontSize: 22, fontWeight: 900, color: "#171717", lineHeight: 1.4, marginBottom: 4 }}>
              Έχω σοβαρή αλλεργία στο γάλα
            </p>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#737373", marginBottom: 4 }}>
              I have a severe milk allergy — This can be dangerous
            </p>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#dc2626" }}>
              יש לי אלרגיה חמורה לחלב — זה יכול להיות מסוכן
            </p>
          </div>

          {/* Quick no-list */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { greek: "Χωρίς γάλα",     he: "ללא חלב",   pron: "Ho-RIS GA-la" },
              { greek: "Χωρίς τυρί",     he: "ללא גבינה", pron: "Ho-RIS ti-RI" },
              { greek: "Χωρίς βούτυρο",  he: "ללא חמאה",  pron: "Ho-RIS VOU-ti-ro" },
              { greek: "Χωρίς κρέμα",    he: "ללא שמנת",  pron: "Ho-RIS KRE-ma" },
              { greek: "Χωρίς γιαούρτι", he: "ללא יוגורט", pron: "Ho-RIS ya-OUR-ti" },
              { greek: "Χωρίς βούτυρο",  he: "ללא חמאה",  pron: "Ho-RIS VOU-ti-ro" },
            ].map(item => (
              <div key={item.greek} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.12)" }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{item.greek}</p>
                <p style={{ fontSize: 11, color: "#fca5a5", fontStyle: "italic" }}>{item.pron}</p>
                <p style={{ fontSize: 12, color: "#fecaca", marginTop: 2 }}>{item.he}</p>
              </div>
            ))}
          </div>

          {/* Full allergy phrases */}
          <div className="space-y-2">
            {ALLERGY_EMERGENCY.map(p => (
              <div key={p.greek} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 3 }}>{p.greek}</p>
                    <p style={{ fontSize: 11, color: "#fca5a5", fontStyle: "italic", marginBottom: 4 }}>{p.pronunciation}</p>
                    <p style={{ fontSize: 12, color: "#fecaca" }}>{p.hebrew}</p>
                  </div>
                  <CopyButton text={p.greek} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CATEGORY TABS ── */}
      <div className="mb-4 flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            className="cursor-pointer rounded-full px-3 py-2 transition-all"
            style={{
              fontSize: 13, fontWeight: 700,
              background: activeCategory === cat.id ? "#171717" : "#f5f5f5",
              color:      activeCategory === cat.id ? "#fff"     : "#525252",
              border: "none",
            }}>
            {cat.label}
            <span style={{ fontSize: 11, opacity: 0.6, marginRight: 4 }}>{cat.labelEn}</span>
          </button>
        ))}
      </div>

      {/* Active category phrases */}
      {activeCategory && (() => {
        const cat = CATEGORIES.find(c => c.id === activeCategory);
        if (!cat) return null;
        return (
          <div className="space-y-2">
            <p style={{ fontSize: 12, fontWeight: 700, color: "#a3a3a3", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
              {cat.label} · {cat.labelEn}
            </p>
            {cat.phrases.map(p => (
              <PhraseRow key={p.greek} p={p} accentColor="#1d4ed8" />
            ))}
          </div>
        );
      })()}

      {/* Tip */}
      <div className="mt-5 rounded-2xl p-4" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#1d4ed8", marginBottom: 4 }}>טיפ לשימוש</p>
        <p style={{ fontSize: 13, color: "#1e40af", lineHeight: 1.6 }}>
          לחצו על אייקון ההעתקה ← ← ← כדי להעתיק את הטקסט היווני ולשלוח במסעדה.
          לכרטיס האלרגיה של נועם — הראו את הכרטיס האדום למלצר לפני ההזמנה.
        </p>
      </div>
    </div>
  );
}

// ─── Copy button helper ────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy}
      className="flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-xl transition-colors"
      style={{ background: "rgba(255,255,255,0.15)", border: "none" }}
      aria-label="העתק">
      {copied
        ? <Check className="h-3.5 w-3.5" style={{ color: "#4ade80" }} />
        : <Copy className="h-3.5 w-3.5" style={{ color: "#fca5a5" }} />
      }
    </button>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [toast, setToast]           = useState<{ msg: string; ok: boolean } | null>(null);
  const [showGreek, setShowGreek]   = useState(false);
  const fileRef                     = useRef<HTMLInputElement>(null);

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
          <p style={{ fontSize: 17, color: "#737373" }}>גיבוי, יוונית ומידע על האפליקציה</p>
        </div>

        {/* ── GREEK LANGUAGE SECTION ── */}
        <div>
          <button
            onClick={() => setShowGreek(v => !v)}
            className="flex w-full cursor-pointer items-center justify-between rounded-2xl p-5 transition-colors hover:bg-neutral-50"
            style={{ border: "2px solid #1d4ed8", background: showGreek ? "#eff6ff" : "#fff" }}>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl" style={{ background: "#1d4ed8" }}>
                <Languages className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p style={{ fontSize: 18, fontWeight: 800, color: "#171717" }}>יוונית לטיול · Greek Cheat Sheet</p>
                <p style={{ fontSize: 14, color: "#737373", marginTop: 2 }}>ברכות, מסעדות, חירום, קניות, מספרים</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              {!showGreek && (
                <span className="rounded-full px-2 py-0.5" style={{ fontSize: 10, fontWeight: 700, background: "#fef2f2", color: "#dc2626" }}>
                  כרטיס אלרגיה
                </span>
              )}
              {showGreek
                ? <ChevronUp className="h-5 w-5 text-neutral-400" />
                : <ChevronDown className="h-5 w-5 text-neutral-400" />
              }
            </div>
          </button>

          {showGreek && (
            <div className="mt-4">
              <GreekCheatSheet />
            </div>
          )}
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
              ["טיול",    "רודוס, יוון"],
              ["תאריכים", "7–10 ספטמבר 2026"],
              ["נוסעים",  "מארק + נועם (13.5) + מעיין (10.5)"],
              ["גרסה",    "2.1 — PWA"],
              ["אחסון",   "Local Storage"],
              ["Offline", "מלא — ללא אינטרנט"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border-b border-neutral-100 py-3 last:border-0">
                <span style={{ fontSize: 15, color: "#737373" }}>{k}</span>
                <span style={{ fontSize: 15, fontWeight: 500, color: "#171717" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PWA install */}
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

        {/* Danger zone */}
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
