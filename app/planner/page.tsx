"use client";

import { useState } from "react";
import {
  Plane, Hotel, Utensils, Compass, Camera, ShoppingBag,
  Star, Moon, Sun, Sunset, Coffee, MapPin, Navigation,
  Clock, AlertCircle, Leaf, Music, BookOpen, Telescope,
  DollarSign, Tag, ChevronDown, ChevronUp,
} from "lucide-react";

// ─── Itinerary data ───────────────────────────────────────────────────────────
// Hotel: Avalon Boutique Hotel, New Town — 12 min walk to Old Town
const DAYS = [
  {
    day: 1,
    date: "ספטמבר 7, 2026",
    dayLabel: "יום ראשון",
    title: "יום הגעה — קל ומרגיע",
    subtitle: "טיסה מוקדמת, התאקלמות, עיר עתיקה בסיוב",
    color: "#7c3aed",
    bg: "#f5f3ff",
    events: [
      {
        time: "05:20",
        label: "טיסה מ-TLV",
        detail: "אל-על TLV → RHO · הגעו לשדה תעופה לפחות שעה לפני",
        icon: Plane,
        type: "flight",
        tags: ["חובה"],
        cost: "כלול",
        tip: "צ'ק אין אונליין ב-6 ספטמבר! תרופות אלרגיה בתיק יד.",
      },
      {
        time: "07:05",
        label: "נחיתה ברודוס",
        detail: "נמל תעופה רודוס (RHO) · Diagoras Airport",
        icon: Plane,
        type: "flight",
        tags: [],
        cost: null,
        tip: "מונית לAvalon: ~€15, 20 דקות",
      },
      {
        time: "08:00",
        label: "ארוחת בוקר — Annie's Vegan Kitchen",
        detail: "3 דקות מהמלון · Açaí bowl, קפה, מאפים טבעוניים",
        icon: Coffee,
        type: "food",
        tags: ["טבעוני 100%", "קרוב למלון"],
        cost: "₪40 לאדם",
        veganFriendly: true,
        tip: "בקשו את ה-Açaí bowl עם חלב שקדים",
      },
      {
        time: "09:30",
        label: "סיוב ראשון — עיר עתיקה",
        detail: "הליכה קלה ברחובות ימי-הביניים · 12 דקות מהמלון",
        icon: Compass,
        type: "activity",
        tags: ["חינם", "Harry Potter vibes"],
        cost: "חינם",
        tip: "הרחובות הצרים של Knights Street — בדיוק כמו Diagon Alley!",
        harryPotter: true,
      },
      {
        time: "11:00",
        label: "קניות — ניו טאון",
        detail: "Zara, Bershka, Pull&Bear, Stradivarius · כל הרשתות באזור אחד",
        icon: ShoppingBag,
        type: "shopping",
        tags: ["Y2K Fashion", "Grunge"],
        cost: "לפי קניות",
        tip: "כולם ברחוב Mandraki — פחות מ-10 דקות מהמלון",
      },
      {
        time: "13:00",
        label: "ארוחת צהריים — T Veg",
        detail: "5 דקות מהמלון · Burger טבעוני, סלטים",
        icon: Utensils,
        type: "food",
        tags: ["טבעוני", "מחיר נגיש"],
        cost: "₪55 לאדם",
        veganFriendly: true,
      },
      {
        time: "14:00",
        label: "צ'ק אין — Avalon Boutique Hotel",
        detail: "New Town · 3 לילות",
        icon: Hotel,
        type: "hotel",
        tags: ["הוזמן"],
        cost: "כלול",
        tip: "אם אין חדר עדיין — השאירו מזוודות ובקשו early check-in",
      },
      {
        time: "15:30",
        label: "מנוחה + נמנום",
        detail: "חשוב! יצאתם מוקדם מאוד — מנוחה לפני הערב",
        icon: Moon,
        type: "rest",
        tags: ["חשוב"],
        cost: null,
      },
      {
        time: "18:30",
        label: "הליכת ערב — חומות העיר העתיקה",
        detail: "12 דקות הליכה · טיול קצר על שפת הנמל",
        icon: Compass,
        type: "activity",
        tags: ["חינם", "רומנטי"],
        cost: "חינם",
      },
      {
        time: "19:30",
        label: "שקיעה — Palace of Grand Masters",
        detail: "הנקודה הכי יפה לשקיעה ביום הראשון",
        icon: Sun,
        type: "activity",
        tags: ["חינם", "Photography"],
        cost: "חינם",
        tip: "הכינו מצלמה — הצבעים מדהימים",
      },
      {
        time: "20:30",
        label: "ארוחת ערב — ONO Greek Fusion",
        detail: "14 דקות מהמלון · עיר עתיקה · הזמינו מקום מראש!",
        icon: Utensils,
        type: "food",
        tags: ["WOW", "טבעוני"],
        cost: "₪120 לאדם",
        veganFriendly: true,
        tip: "הכי מומלצת! בקשו ישיבה בפנים לאווירה מיוחדת",
      },
    ],
  },
  {
    day: 2,
    date: "ספטמבר 8, 2026",
    dayLabel: "יום שני",
    title: "Lindos — יום ה-WOW",
    subtitle: "האקרופוליס, המפרץ הכחול, צילום, קניות",
    color: "#0284c7",
    bg: "#f0f9ff",
    events: [
      {
        time: "07:30",
        label: "ארוחת בוקר מוקדמת",
        detail: "Old Market Café · 13 דקות מהמלון · Açaí + קפה",
        icon: Coffee,
        type: "food",
        tags: ["מוקדם", "טבעוני"],
        cost: "₪35 לאדם",
        veganFriendly: true,
      },
      {
        time: "08:30",
        label: "נסיעה ל-Lindos",
        detail: "אוטובוס מתחנה מרכזית (€3 לנפש) · 55 דקות · או מונית €35",
        icon: MapPin,
        type: "transport",
        tags: ["55 ק\"מ", "€3 באוטובוס"],
        cost: "€3 באוטובוס / €35 מונית",
        tip: "אוטובוס 015 · יוצא כל שעה מהתחנה המרכזית",
      },
      {
        time: "09:30",
        label: "Acropolis of Lindos",
        detail: "עלייה לאקרופוליס · נוף פנורמי מדהים · גרם מדרגות",
        icon: Compass,
        type: "activity",
        tags: ["WOW", "Photography", "היסטוריה"],
        cost: "€6 לאדם (ילדים חינם)",
        tip: "הגיעו מוקדם לפני הצהרון — צל מועט בשעות החמות",
        wow: true,
      },
      {
        time: "11:00",
        label: "St Paul's Bay — חוף נסתר",
        detail: "מפרץ הגעה של פאולוס השליח · מים טורקיז שקופים",
        icon: Sunset,
        type: "activity",
        tags: ["חוף", "שחייה", "Photography"],
        cost: "חינם",
        tip: "הכי יפה בשעות הבוקר — מים שקטים",
        wow: true,
      },
      {
        time: "12:30",
        label: "קניות בכפר לינדוס",
        detail: "חנויות Y2K, מזכרות, אמנות מקומית · רחובות לבנים",
        icon: ShoppingBag,
        type: "shopping",
        tags: ["Y2K", "מזכרות"],
        cost: "לפי קניות",
        tip: "חנויות ה-vintage בכפר — Y2K vibes אמיתיים",
      },
      {
        time: "13:30",
        label: "ארוחת צהריים — Kalypso Roof Garden",
        detail: "נוף פנורמי ללינדוס · תפריט מדיטרני",
        icon: Utensils,
        type: "food",
        tags: ["נוף WOW", "מדיטרני"],
        cost: "₪90 לאדם",
        veganFriendly: true,
      },
      {
        time: "15:00",
        label: "ריף שחייה + Beach Time",
        detail: "Lindos Beach · חוף עם מים כחולים שקופים",
        icon: Sun,
        type: "activity",
        tags: ["חוף", "שחייה", "מנוחה"],
        cost: "שכירת כיסא: €8",
      },
      {
        time: "17:00",
        label: "חזרה לרודוס",
        detail: "אוטובוס 015 חזרה · 55 דקות",
        icon: MapPin,
        type: "transport",
        tags: ["€3"],
        cost: "€3 באוטובוס",
      },
      {
        time: "19:00",
        label: "שקיעה — נמל מנדרקי",
        detail: "נמל הצבאים האגדי · הכי יפה לצילום שקיעה",
        icon: Camera,
        type: "activity",
        tags: ["Photography", "K-Pop vibes", "חינם"],
        cost: "חינם",
        tip: "רקע מושלם לצילומים K-Pop aesthetic!",
        kpop: true,
      },
      {
        time: "20:30",
        label: "ארוחת ערב — RuBisCo Fine Dining",
        detail: "15 דקות מהמלון · עיר עתיקה · הזמינו מראש",
        icon: Utensils,
        type: "food",
        tags: ["Fine Dining", "טבעוני"],
        cost: "₪160 לאדם",
        veganFriendly: true,
        tip: "ארוחת הגאלה של הטיול — מומלץ לבוא בסטייל!",
      },
    ],
  },
  {
    day: 3,
    date: "ספטמבר 9, 2026",
    dayLabel: "יום שלישי",
    title: "טבע, תרבות וכוכבים",
    subtitle: "פרפרים, מוזיאון, Harry Potter streets, ספירת כוכבים",
    color: "#16a34a",
    bg: "#f0fdf4",
    events: [
      {
        time: "08:00",
        label: "ארוחת בוקר — Platanos",
        detail: "6 דקות מהמלון · תחת עץ פלטנוס עתיק",
        icon: Coffee,
        type: "food",
        tags: ["יווני", "חוויה"],
        cost: "₪50 לאדם",
        veganFriendly: true,
      },
      {
        time: "09:00",
        label: "Valley of the Butterflies",
        detail: "25 ק\"מ · אוטובוס €4 · עמק ירוק עם אלפי פרפרים · קיר! בקרו בשקט",
        icon: Leaf,
        type: "activity",
        tags: ["טבע", "ייחודי", "משפחה"],
        cost: "€5 כניסה · €4 אוטובוס",
        tip: "חובה לשמור על שקט — פרפרים מגיבים לרעש. קיר מרשים!",
        wow: true,
        valueNote: "חוויה ייחודית שלא ניתן לחוות בחינם — שווה את הכסף",
      },
      {
        time: "11:30",
        label: "Profitis Ilias Mountain",
        detail: "דרך ל-Valley — נוף לכל האי · עצי אורן · מקום לצילום כוכבים לילה",
        icon: Telescope,
        type: "activity",
        tags: ["Astronomy", "נוף", "כוכבים"],
        cost: "חינם",
        tip: "סמנו את המקום לחזרה הלילה לצפייה בכוכבים!",
      },
      {
        time: "13:00",
        label: "חזרה לרודוס — ארוחת צהריים Annie's",
        detail: "3 דקות מהמלון · המסעדה הטבעונית הטובה ביותר",
        icon: Utensils,
        type: "food",
        tags: ["טבעוני 100%", "קרוב"],
        cost: "₪45 לאדם",
        veganFriendly: true,
      },
      {
        time: "14:30",
        label: "Medieval Rhodes Museum",
        detail: "עיר עתיקה · 13 דקות · ארמון האבירים + ארכאולוגיה",
        icon: BookOpen,
        type: "activity",
        tags: ["היסטוריה", "Harry Potter", "תרבות"],
        cost: "€6 לאדם",
        tip: "הארמון מרגיש כמו Hogwarts! נועם ומעיין יאהבו",
        harryPotter: true,
      },
      {
        time: "16:00",
        label: "Knights Street — Harry Potter Walk",
        detail: "הרחוב הכי יפה ברודוס · אבן מדרכות עתיקה · בדיוק כמו Diagon Alley",
        icon: Compass,
        type: "activity",
        tags: ["חינם", "Harry Potter", "Photography"],
        cost: "חינם",
        tip: "הצטלמו בכניסה לסמטאות — vibes שלמים של Diagon Alley!",
        harryPotter: true,
        wow: true,
      },
      {
        time: "17:30",
        label: "קניות — Y2K & Grunge",
        detail: "Bershka + Pull&Bear + Stradivarius · כולם ב-Mandraki",
        icon: ShoppingBag,
        type: "shopping",
        tags: ["Y2K", "Grunge", "Fashion"],
        cost: "לפי קניות",
      },
      {
        time: "19:30",
        label: "ארוחת ערב — Meltemi Tavern",
        detail: "16 דקות מהמלון · עיר עתיקה · נוף לחומות",
        icon: Utensils,
        type: "food",
        tags: ["מסורתי", "נוף"],
        cost: "₪80 לאדם",
        veganFriendly: true,
        tip: "בקשו \"Χωρίς γαλακτοκομικά\" — ללא מוצרי חלב",
      },
      {
        time: "22:00",
        label: "ספירת כוכבים — Mandraki Harbour",
        detail: "ספטמבר = שמיים נהדרים · תצורות כוכבים מדיטרניות",
        icon: Telescope,
        type: "activity",
        tags: ["Astronomy", "לילה", "רומנטי"],
        cost: "חינם",
        tip: "הכינו אפליקציית Star Walk 2! ספטמבר = Milky Way גלוי",
        astronomy: true,
        wow: true,
      },
    ],
  },
  {
    day: 4,
    date: "ספטמבר 10, 2026",
    dayLabel: "יום רביעי",
    title: "יום עזיבה — גמישות מלאה",
    subtitle: "קניות אחרונות, חוף אחרון, טיסה הביתה",
    color: "#ca8a04",
    bg: "#fef9ec",
    events: [
      {
        time: "08:00",
        label: "ארוחת בוקר אחרונה",
        detail: "Annie's Vegan Kitchen · הפעם בישיבה ארוכה — פינוק אחרון",
        icon: Coffee,
        type: "food",
        tags: ["טבעוני", "אחרון"],
        cost: "₪40 לאדם",
        veganFriendly: true,
      },
      {
        time: "09:30",
        label: "קניות אחרונות",
        detail: "Zara + מזכרות אחרונות · מה ששכחתם",
        icon: ShoppingBag,
        type: "shopping",
        tags: ["קניות", "מזכרות"],
        cost: "לפי קניות",
      },
      {
        time: "11:00",
        label: "חוף ניו טאון — Elli Beach",
        detail: "800 מטר מהמלון · חוף עירוני ציבורי · שחייה אחרונה",
        icon: Sun,
        type: "activity",
        tags: ["חוף", "חינם", "שחייה"],
        cost: "חינם",
        tip: "Elli Beach — החוף הנגיש ביותר מהמלון, 10 דקות הליכה",
      },
      {
        time: "13:00",
        label: "ארוחת צהריים קלה",
        detail: "T Veg · 5 דקות מהמלון · פשוט ומהיר",
        icon: Utensils,
        type: "food",
        tags: ["מהיר", "טבעוני"],
        cost: "₪40 לאדם",
        veganFriendly: true,
      },
      {
        time: "14:30",
        label: "צ'ק אאוט + מונית לשדה תעופה",
        detail: "בדקו שעת הטיסה · מונית ~€15 · 20 דקות",
        icon: Plane,
        type: "flight",
        tags: ["חשוב"],
        cost: "€15 מונית",
        tip: "הגיעו 90 דקות לפני שעת הטיסה",
      },
    ],
  },
];

const SHOPPING_STORES = [
  { name: "Zara",         area: "ניו טאון",   distance: "8 דקות",  style: "Y2K Fashion",   mapsUrl: "https://maps.google.com/?q=Zara+Rhodes+Greece" },
  { name: "Bershka",      area: "ניו טאון",   distance: "9 דקות",  style: "Y2K + Grunge",  mapsUrl: "https://maps.google.com/?q=Bershka+Rhodes+Greece" },
  { name: "Pull&Bear",    area: "ניו טאון",   distance: "9 דקות",  style: "Grunge + Street", mapsUrl: "https://maps.google.com/?q=Pull+and+Bear+Rhodes+Greece" },
  { name: "Stradivarius", area: "ניו טאון",   distance: "10 דקות", style: "Y2K + Boho",    mapsUrl: "https://maps.google.com/?q=Stradivarius+Rhodes+Greece" },
  { name: "H&M",          area: "ניו טאון",   distance: "7 דקות",  style: "Y2K Budget",    mapsUrl: "https://maps.google.com/?q=H%26M+Rhodes+Greece" },
  { name: "New Yorker",   area: "ניו טאון",   distance: "8 דקות",  style: "Y2K + Grunge",  mapsUrl: "https://maps.google.com/?q=New+Yorker+Rhodes+Greece" },
  { name: "Vintage Shops", area: "עיר עתיקה", distance: "15 דקות", style: "Vintage Y2K",   mapsUrl: "https://maps.google.com/?q=vintage+shops+Rhodes+Old+Town" },
];

// ─── Event type colors ────────────────────────────────────────────────────────
const TYPE_STYLE: Record<string, { color: string; bg: string }> = {
  flight:    { color: "#7c3aed", bg: "#f5f3ff" },
  food:      { color: "#16a34a", bg: "#f0fdf4" },
  activity:  { color: "#0284c7", bg: "#eff6ff" },
  shopping:  { color: "#ec4899", bg: "#fdf2f8" },
  hotel:     { color: "#0284c7", bg: "#eff6ff" },
  transport: { color: "#f59e0b", bg: "#fff7ed" },
  rest:      { color: "#a3a3a3", bg: "#fafafa" },
};

// ─── Sub components ───────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EventRow({ e }: { e: any }) {
  const [expanded, setExpanded] = useState(false);
  const s = TYPE_STYLE[e.type as string] ?? TYPE_STYLE.activity;
  const Icon = e.icon as React.FC<{ className?: string; style?: React.CSSProperties }>;
  const hasExtra = e.tip || e.valueNote;

  return (
    <div className="flex gap-3">
      {/* Time + line */}
      <div className="flex flex-col items-center">
        <span style={{ fontSize: 12, fontWeight: 700, color: "#a3a3a3", minWidth: 44, textAlign: "center" }}>
          {e.time}
        </span>
        <div className="mt-1 flex-1 w-px bg-neutral-100" />
      </div>

      {/* Card */}
      <div className="mb-2 flex-1 overflow-hidden rounded-2xl transition-shadow hover:shadow-sm"
        style={{ border: "1px solid #f0f0f0", background: "#fff" }}>
        <div className="p-3">
          <div className="flex items-start gap-2.5">
            {/* Icon */}
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ background: s.bg }}>
              <Icon className="h-4 w-4" style={{ color: s.color }} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#171717" }}>{e.label}</span>
                    {e.wow && <Star className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#ca8a04" }} />}
                    {e.harryPotter && <span className="rounded-full px-1.5 py-0.5" style={{ fontSize: 10, fontWeight: 700, background: "#7c3aed22", color: "#7c3aed" }}>HP</span>}
                    {e.kpop && <span className="rounded-full px-1.5 py-0.5" style={{ fontSize: 10, fontWeight: 700, background: "#ec489922", color: "#ec4899" }}>K-Pop</span>}
                    {e.astronomy && <Telescope className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#0284c7" }} />}
                    {e.veganFriendly && <Leaf className="h-3.5 w-3.5 flex-shrink-0 text-green-500" />}
                  </div>
                  <p style={{ fontSize: 13, color: "#737373", marginTop: 2, lineHeight: 1.4 }}>{e.detail}</p>
                </div>
                {/* Cost */}
                {e.cost && (
                  <span className="flex-shrink-0 rounded-xl px-2 py-1"
                    style={{ fontSize: 11, fontWeight: 700, background: e.cost === "חינם" ? "#f0fdf4" : "#f5f5f5",
                      color: e.cost === "חינם" ? "#16a34a" : "#525252" }}>
                    {e.cost}
                  </span>
                )}
              </div>

              {/* Tags */}
              {e.tags && e.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {e.tags.map((t: string) => (
                    <span key={t} className="rounded-full px-2 py-0.5"
                      style={{ fontSize: 10, fontWeight: 600, background: "#f5f5f5", color: "#525252" }}>
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Tip (collapsed) */}
              {hasExtra && (
                <div>
                  <button onClick={() => setExpanded(v => !v)}
                    className="mt-2 flex cursor-pointer items-center gap-1 text-left transition-colors hover:opacity-70"
                    style={{ fontSize: 12, color: "#a3a3a3", background: "none", border: "none", padding: 0 }}>
                    {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    {expanded ? "פחות" : "טיפ"}
                  </button>
                  {expanded && e.tip && (
                    <div className="mt-2 flex items-start gap-2 rounded-xl p-2.5" style={{ background: "#fef9ec" }}>
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" style={{ color: "#ca8a04" }} />
                      <span style={{ fontSize: 12, color: "#92400e", lineHeight: 1.5 }}>{e.tip}</span>
                    </div>
                  )}
                  {expanded && e.valueNote && (
                    <div className="mt-2 flex items-start gap-2 rounded-xl p-2.5" style={{ background: "#f0fdf4" }}>
                      <Tag className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-600" />
                      <span style={{ fontSize: 12, color: "#15803d", lineHeight: 1.5 }}>{e.valueNote}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PlannerPage() {
  const [activeDay, setActiveDay] = useState(0);
  const [showShopping, setShowShopping] = useState(false);

  const day = DAYS[activeDay];

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Rubik', system-ui, sans-serif" }}>
      <div className="mx-auto max-w-2xl px-4 pb-36 pt-10 space-y-6 md:max-w-3xl">

        {/* Header */}
        <div>
          <p style={{ fontSize: 15, color: "#a3a3a3", marginBottom: 4 }}>Avalon Boutique Hotel · ספטמבר 2026</p>
          <h1 style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.1, color: "#171717", letterSpacing: "-0.02em" }}>
            מסלול הטיול
          </h1>
        </div>

        {/* Interest icons legend */}
        <div className="flex flex-wrap gap-3 rounded-2xl p-4" style={{ background: "#fafafa", border: "1px solid #f0f0f0" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#737373", width: "100%", marginBottom: 4 }}>אייקוני תחומי עניין</p>
          {[
            { icon: Star,      label: "WOW",       color: "#ca8a04" },
            { icon: Music,     label: "K-Pop",      color: "#ec4899" },
            { icon: BookOpen,  label: "Harry Potter", color: "#7c3aed" },
            { icon: Telescope, label: "Astronomy",  color: "#0284c7" },
            { icon: ShoppingBag, label: "Y2K/Grunge", color: "#16a34a" },
            { icon: Leaf,      label: "טבעוני",    color: "#22c55e" },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5" style={{ color }} />
              <span style={{ fontSize: 12, color: "#525252" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Day selector */}
        <div className="grid grid-cols-4 gap-2">
          {DAYS.map((d, i) => (
            <button key={d.day} onClick={() => setActiveDay(i)}
              className="cursor-pointer rounded-2xl p-3 text-center transition-all hover:shadow-sm"
              style={{
                border: `2px solid ${activeDay === i ? d.color : "#f0f0f0"}`,
                background: activeDay === i ? d.bg : "#fff",
              }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: activeDay === i ? d.color : "#a3a3a3", lineHeight: 1 }}>
                יום {d.day}
              </p>
              <p style={{ fontSize: 10, color: activeDay === i ? d.color : "#d1d5db", marginTop: 2 }}>
                {d.dayLabel.split(" ")[1] ?? d.dayLabel}
              </p>
            </button>
          ))}
        </div>

        {/* Active day header */}
        <div className="overflow-hidden rounded-3xl" style={{ background: "#171717" }}>
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p style={{ fontSize: 13, color: "#737373", marginBottom: 3 }}>{day.date}</p>
                <h2 style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>{day.title}</h2>
                <p style={{ fontSize: 14, color: "#a3a3a3", marginTop: 4 }}>{day.subtitle}</p>
              </div>
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl"
                style={{ background: day.bg }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: day.color }}>{day.day}</span>
              </div>
            </div>
            {/* Quick stats */}
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { label: `${day.events.filter(e => e.type === "food").length} ארוחות`, color: "#22c55e" },
                { label: `${day.events.filter(e => e.type === "activity").length} אטרקציות`, color: "#60a5fa" },
                { label: `${day.events.filter(e => e.cost === "חינם").length} חינם`, color: "#4ade80" },
              ].map(({ label, color }) => (
                <span key={label} className="rounded-full px-3 py-1"
                  style={{ fontSize: 12, fontWeight: 700, background: "rgba(255,255,255,0.08)", color }}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Events timeline */}
        <div className="space-y-0.5">
          {day.events.map((e, i) => (
            <EventRow key={i} e={e} />
          ))}
        </div>

        {/* Shopping guide */}
        <div>
          <button onClick={() => setShowShopping(v => !v)}
            className="flex w-full cursor-pointer items-center justify-between rounded-2xl p-4 transition-colors hover:bg-neutral-50"
            style={{ border: "1px solid #e5e5e5" }}>
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" style={{ color: "#ec4899" }} />
              <span style={{ fontSize: 17, fontWeight: 700, color: "#171717" }}>מדריך קניות — Y2K & Grunge</span>
            </div>
            {showShopping ? <ChevronUp className="h-5 w-5 text-neutral-400" /> : <ChevronDown className="h-5 w-5 text-neutral-400" />}
          </button>

          {showShopping && (
            <div className="mt-3 space-y-2">
              {SHOPPING_STORES.map(store => (
                <div key={store.name} className="flex items-center gap-3 rounded-2xl p-4"
                  style={{ border: "1px solid #f0f0f0" }}>
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{ background: "#fdf2f8" }}>
                    <ShoppingBag className="h-5 w-5" style={{ color: "#ec4899" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 15, fontWeight: 700, color: "#171717" }}>{store.name}</p>
                    <p style={{ fontSize: 13, color: "#a3a3a3" }}>{store.area} · {store.distance}</p>
                    <p style={{ fontSize: 12, color: "#ec4899", fontWeight: 600, marginTop: 2 }}>{store.style}</p>
                  </div>
                  <a href={store.mapsUrl} target="_blank" rel="noopener noreferrer"
                    className="flex cursor-pointer items-center gap-1 rounded-xl px-3 py-2 transition-colors hover:bg-neutral-100"
                    style={{ border: "1px solid #e5e5e5", fontSize: 13, fontWeight: 600, color: "#171717", textDecoration: "none" }}>
                    <Navigation className="h-3.5 w-3.5" />
                    מפה
                  </a>
                </div>
              ))}
              <div className="rounded-2xl p-4" style={{ background: "#fdf2f8", border: "1px solid #fbcfe8" }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#9d174d", marginBottom: 4 }}>
                  Y2K + Grunge Shopping Tips
                </p>
                <p style={{ fontSize: 13, color: "#be185d", lineHeight: 1.6 }}>
                  כל הרשתות נמצאות ברחוב Mandraki וסביבתו · 7-10 דקות הליכה מ-Avalon ·
                  חנויות ה-Vintage בעיר העתיקה לאפקט Y2K אותנטי יותר
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Value optimization summary */}
        <div className="rounded-2xl p-5" style={{ border: "1px solid #f0f0f0" }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#171717", marginBottom: 12 }}>אופטימיזציית ערך — סיכום</p>
          <div className="space-y-3">
            {[
              { activity: "Valley of the Butterflies", cost: "€5", verdict: "שמור", reason: "חוויה ייחודית לחלוטין — אין חינם שקול" },
              { activity: "Acropolis Lindos", cost: "€6 (ילדים חינם)", verdict: "שמור", reason: "הנוף של Lindos = חוויית WOW — ₪90 לאדם בוגר" },
              { activity: "Medieval Museum", cost: "€6", verdict: "שמור", reason: "Harry Potter vibes + ילדים ב-€0 — שווה" },
              { activity: "Elli Beach (חוף ניו טאון)", cost: "חינם", verdict: "הוסף", reason: "חוף מעולה 10 דקות מהמלון — ₪0" },
              { activity: "Knights Street Walk", cost: "חינם", verdict: "הוסף", reason: "Diagon Alley vibes — חוויה שלמה בחינם מוחלט" },
              { activity: "Star Gazing בנמל", cost: "חינם", verdict: "הוסף", reason: "ספטמבר = שמים מושלמים + חינם" },
            ].map(({ activity, cost, verdict, reason }) => (
              <div key={activity} className="flex items-start gap-3">
                <span className="mt-0.5 flex-shrink-0 rounded-full px-2 py-0.5"
                  style={{ fontSize: 11, fontWeight: 700,
                    background: verdict === "שמור" ? "#fef9ec" : "#f0fdf4",
                    color:      verdict === "שמור" ? "#92400e" : "#15803d" }}>
                  {verdict === "שמור" ? "₪ שמור" : "✓ חינם"}
                </span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#171717" }}>{activity}</p>
                  <p style={{ fontSize: 13, color: "#737373" }}>{cost} · {reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
