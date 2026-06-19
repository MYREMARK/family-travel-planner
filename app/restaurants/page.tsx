"use client";

import { useState } from "react";
import {
  Leaf, ShieldAlert, DollarSign, MapPin, Navigation,
  Star, ChevronDown, ChevronUp, Utensils, Filter,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────
// Distances from Avalon Boutique Hotel (New Town, ~12 min walk to Old Town gate)
const RESTAURANTS = [
  // ── Rhodes New Town (close to Avalon) ──────────────────────────────────────
  {
    id: "annies-vegan",
    name: "Annie's Vegan Kitchen",
    area: "New Town",
    areaHe: "ניו טאון",
    cuisine: "טבעוני מלא",
    description: "המטבח הטבעוני הכי טוב ברודוס. מגוון אדיר, ידידותי לאלרגיות, סביבה אינטימית.",
    veganScore: 100,
    milkAllergyScore: 99,
    price: 1,
    priceLabel: "$",
    distanceMinutes: 3,
    distanceMeters: 220,
    lat: 36.4448,
    lng: 28.2225,
    tags: ["100% טבעוני", "אלרגיה בטוחה", "מחיר נמוך"],
    mustTry: "Bowl טחינה-ירקות צלויים",
    openingHours: "12:00–22:00",
    mapsUrl: "https://maps.google.com/?q=Annie's+Vegan+Kitchen+Rhodes+Greece",
    navFromAvalon: "https://www.google.com/maps/dir/Avalon+Boutique+Hotel+Rhodes/Annie's+Vegan+Kitchen+Rhodes",
  },
  {
    id: "t-veg",
    name: "T Veg",
    area: "New Town",
    areaHe: "ניו טאון",
    cuisine: "טבעוני יצירתי",
    description: "מסעדה טבעונית עם תפריט יצירתי ומחירים נגישים. פופולרי בקרב מקומיים.",
    veganScore: 95,
    milkAllergyScore: 92,
    price: 1,
    priceLabel: "$",
    distanceMinutes: 5,
    distanceMeters: 380,
    lat: 36.4452,
    lng: 28.2230,
    tags: ["טבעוני", "מקומי", "מחיר נגיש"],
    mustTry: "Burger טבעוני בורגר ביתי",
    openingHours: "11:00–21:30",
    mapsUrl: "https://maps.google.com/?q=T+Veg+Rhodes+Greece",
    navFromAvalon: "https://www.google.com/maps/dir/Avalon+Boutique+Hotel+Rhodes/T+Veg+Rhodes",
  },
  {
    id: "platanos",
    name: "Platanos",
    area: "New Town",
    areaHe: "ניו טאון",
    cuisine: "יווני מסורתי",
    description: "מסעדה יוונית קלאסית עם הרבה אפשרויות טבעוניות. נוף לעץ פלטנוס עתיק.",
    veganScore: 72,
    milkAllergyScore: 80,
    price: 2,
    priceLabel: "$$",
    distanceMinutes: 6,
    distanceMeters: 450,
    lat: 36.4449,
    lng: 28.2228,
    tags: ["יווני", "נוף יפה", "טבעוני חלקי"],
    mustTry: "פלטת יהודה — זיתים, חצילים, ירקות",
    openingHours: "12:00–23:00",
    mapsUrl: "https://maps.google.com/?q=Platanos+Restaurant+Rhodes",
    navFromAvalon: "https://www.google.com/maps/dir/Avalon+Boutique+Hotel+Rhodes/Platanos+Restaurant+Rhodes",
  },
  // ── Rhodes Old Town (12–20 min walk from Avalon) ───────────────────────────
  {
    id: "ono",
    name: "ONO Greek Fusion",
    area: "Old Town",
    areaHe: "עיר עתיקה",
    cuisine: "פיוז'ן יווני טבעוני",
    description: "הפנינה הנסתרת של רודוס. מטבח פיוז'ן יצירתי עם דגש טבעוני. הכי WOW לסעודת ערב.",
    veganScore: 95,
    milkAllergyScore: 90,
    price: 2,
    priceLabel: "$$",
    distanceMinutes: 14,
    distanceMeters: 1050,
    lat: 36.4430,
    lng: 28.2250,
    tags: ["פיוז'ן", "WOW", "ארוחת ערב", "טבעוני"],
    mustTry: "Hummus bowl עם תמרים ושקדים",
    openingHours: "18:00–23:30",
    mapsUrl: "https://maps.google.com/?q=ONO+Greek+Fusion+Rhodes+Old+Town",
    navFromAvalon: "https://www.google.com/maps/dir/Avalon+Boutique+Hotel+Rhodes/ONO+Greek+Fusion+Rhodes",
  },
  {
    id: "rubisco",
    name: "RuBisCo",
    area: "Old Town",
    areaHe: "עיר עתיקה",
    cuisine: "Plant-Based Fine Dining",
    description: "מסעדת Fine Dining צמחונית-טבעונית בלב העיר העתיקה. חוויה קולינרית מרשימה.",
    veganScore: 88,
    milkAllergyScore: 85,
    price: 3,
    priceLabel: "$$$",
    distanceMinutes: 15,
    distanceMeters: 1100,
    lat: 36.4432,
    lng: 28.2248,
    tags: ["Fine Dining", "צמחוני", "רומנטי"],
    mustTry: "תפריט ה-Chef: 5 מנות צמחוניות",
    openingHours: "19:00–00:00",
    mapsUrl: "https://maps.google.com/?q=RuBisCo+Restaurant+Rhodes",
    navFromAvalon: "https://www.google.com/maps/dir/Avalon+Boutique+Hotel+Rhodes/RuBisCo+Rhodes",
  },
  {
    id: "meltemi",
    name: "Meltemi Fish Tavern",
    area: "Old Town",
    areaHe: "עיר עתיקה",
    cuisine: "פירות ים + ירקות",
    description: "טברנה מסורתית עם נוף לחומות. הרבה מנות ירקות וסלטים בטוחים לאלרגיה.",
    veganScore: 65,
    milkAllergyScore: 82,
    price: 2,
    priceLabel: "$$",
    distanceMinutes: 16,
    distanceMeters: 1200,
    lat: 36.4428,
    lng: 28.2255,
    tags: ["נוף", "מסורתי", "ירקות"],
    mustTry: "סלט יווני + פטה בצד (בקשו ללא גבינה)",
    openingHours: "12:00–23:00",
    mapsUrl: "https://maps.google.com/?q=Meltemi+Tavern+Rhodes+Old+Town",
    navFromAvalon: "https://www.google.com/maps/dir/Avalon+Boutique+Hotel+Rhodes/Meltemi+Tavern+Rhodes",
  },
  {
    id: "old-town-market-cafe",
    name: "Old Market Café",
    area: "Old Town",
    areaHe: "עיר עתיקה",
    cuisine: "קפה + אוכל קל",
    description: "קפה ברחובות ימי-הביניים. ארוחות בוקר טבעוניות, עוגיות, שייקים. מושלם להפסקה.",
    veganScore: 80,
    milkAllergyScore: 88,
    price: 1,
    priceLabel: "$",
    distanceMinutes: 13,
    distanceMeters: 980,
    lat: 36.4435,
    lng: 28.2245,
    tags: ["קפה", "ארוחת בוקר", "טבעוני"],
    mustTry: "Açaí bowl + קפה יווני",
    openingHours: "08:00–20:00",
    mapsUrl: "https://maps.google.com/?q=Old+Town+Market+Cafe+Rhodes",
    navFromAvalon: "https://www.google.com/maps/dir/Avalon+Boutique+Hotel+Rhodes/Old+Town+Cafe+Rhodes",
  },
  // ── Lindos ─────────────────────────────────────────────────────────────────
  {
    id: "melenos",
    name: "Melenos Lindos",
    area: "Lindos",
    areaHe: "לינדוס",
    cuisine: "יווני מודרני",
    description: "המסעדה הכי יפה ברודוס. נוף מדהים לאקרופוליס ולמפרץ. חוויה בלתי נשכחת.",
    veganScore: 78,
    milkAllergyScore: 75,
    price: 3,
    priceLabel: "$$$",
    distanceMinutes: 65,
    distanceMeters: 55000,
    lat: 36.0917,
    lng: 28.0855,
    tags: ["Lindos", "נוף מדהים", "WOW", "ארוחת ערב"],
    mustTry: "Imam Bayildi — חצילים ממולאים",
    openingHours: "19:00–23:00",
    mapsUrl: "https://maps.google.com/?q=Melenos+Lindos+Restaurant",
    navFromAvalon: "https://www.google.com/maps/dir/Avalon+Boutique+Hotel+Rhodes/Melenos+Lindos",
  },
  {
    id: "kalypso",
    name: "Kalypso Roof Garden",
    area: "Lindos",
    areaHe: "לינדוס",
    cuisine: "מדיטרני + טבעוני",
    description: "מסעדת גג בלינדוס עם נוף פנורמי. תפריט גמיש לטבעוניים. אווירה מיוחדת.",
    veganScore: 80,
    milkAllergyScore: 78,
    price: 2,
    priceLabel: "$$",
    distanceMinutes: 60,
    distanceMeters: 55000,
    lat: 36.0910,
    lng: 28.0848,
    tags: ["גג", "נוף", "Lindos", "טבעוני חלקי"],
    mustTry: "Mezze plate — 8 מנות קטנות",
    openingHours: "12:00–22:00",
    mapsUrl: "https://maps.google.com/?q=Kalypso+Roof+Garden+Lindos",
    navFromAvalon: "https://www.google.com/maps/dir/Avalon+Boutique+Hotel+Rhodes/Kalypso+Roof+Garden+Lindos",
  },
] as const;

type Restaurant = typeof RESTAURANTS[number];
type Area = "הכל" | "New Town" | "Old Town" | "Lindos";

// ─── Noam/Maayan/Family scores per restaurant ─────────────────────────────────
// Noam (13.5): Astronomy, HP, Rock/Guitars, Grunge — SEVERE milk allergy
// Maayan (10.5): K-Pop, Animals, Shopping, Interactive — mild dust allergy
const PERSON_SCORES: Record<string, { noam: number; maayan: number; family: number }> = {
  "annies-vegan":       { noam: 9, maayan: 8,  family: 10 }, // 100% safe, best allergy score
  "t-veg":              { noam: 8, maayan: 8,  family: 9  }, // close, safe, burgers
  "platanos":           { noam: 6, maayan: 7,  family: 7  }, // traditional, ask about allergy
  "ono":                { noam: 8, maayan: 7,  family: 8  }, // WOW fine dining
  "rubisco":            { noam: 8, maayan: 7,  family: 8  }, // fine dining
  "meltemi":            { noam: 6, maayan: 7,  family: 7  }, // traditional, check allergy
  "old-town-market-cafe": { noam: 7, maayan: 8, family: 8 }, // casual, açaí
  "melenos":            { noam: 7, maayan: 8,  family: 8  }, // best views in Rhodes
  "kalypso":            { noam: 7, maayan: 9,  family: 9  }, // Lindos rooftop WOW
};

// ─── Score bar (person) ───────────────────────────────────────────────────────
function PersonScoreBar({ score, color, label }: { score: number; color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ fontSize: 10, fontWeight: 700, color, minWidth: 42 }}>{label}</span>
      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 4, background: "#f5f5f5" }}>
        <div className="h-full rounded-full" style={{ width: `${score * 10}%`, background: color }} />
      </div>
      <span style={{ fontSize: 10, color: "#a3a3a3", minWidth: 16, textAlign: "right" }}>{score}</span>
    </div>
  );
}

// ─── Score badge ──────────────────────────────────────────────────────────────
function ScoreBadge({ score, label, color, bg }: { score: number; label: string; color: string; bg: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl px-3 py-1.5" style={{ background: bg, minWidth: 56 }}>
      <span style={{ fontSize: 16, fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
      <span style={{ fontSize: 10, color, opacity: 0.8, lineHeight: 1.2, textAlign: "center" }}>{label}</span>
    </div>
  );
}

// ─── Price dots ───────────────────────────────────────────────────────────────
function PriceDots({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map(i => (
        <DollarSign key={i} className="h-3.5 w-3.5" style={{ color: i <= level ? "#ca8a04" : "#e5e5e5" }} />
      ))}
    </div>
  );
}

// ─── Restaurant card ──────────────────────────────────────────────────────────
function RestaurantCard({ r }: { r: Restaurant }) {
  const [expanded, setExpanded] = useState(false);
  const isClose = r.distanceMinutes <= 8;

  return (
    <div className="overflow-hidden rounded-2xl transition-shadow hover:shadow-md"
      style={{ border: "1px solid #f0f0f0", background: "#fff" }}>

      {/* Area badge + distance */}
      <div className="flex items-center justify-between px-4 pt-3 pb-0">
        <span className="rounded-full px-2.5 py-1"
          style={{ fontSize: 11, fontWeight: 700,
            background: r.area === "New Town" ? "#eff6ff" : r.area === "Old Town" ? "#fef9ec" : "#f0fdf4",
            color:      r.area === "New Town" ? "#1d4ed8" : r.area === "Old Town" ? "#92400e" : "#15803d" }}>
          {r.areaHe}
        </span>
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" style={{ color: isClose ? "#22c55e" : "#a3a3a3" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: isClose ? "#16a34a" : "#737373" }}>
            {r.distanceMinutes < 60 ? `${r.distanceMinutes} דקות` : `${Math.round(r.distanceMinutes / 60)}+ שעות`}
          </span>
        </div>
      </div>

      <div className="p-4 pt-2">
        {/* Name + cuisine */}
        <div className="mb-2">
          <h3 style={{ fontSize: 18, fontWeight: 800, color: "#171717", lineHeight: 1.2 }}>{r.name}</h3>
          <p style={{ fontSize: 13, color: "#a3a3a3", marginTop: 2 }}>{r.cuisine}</p>
        </div>

        {/* Scores row */}
        <div className="mb-3 flex gap-2">
          <ScoreBadge score={r.veganScore}      label="טבעוני"   color="#16a34a" bg="#f0fdf4" />
          <ScoreBadge score={r.milkAllergyScore} label="אלרגיה"   color="#0284c7" bg="#f0f9ff" />
          <div className="flex flex-1 flex-col justify-center gap-1 pr-2">
            <PriceDots level={r.price} />
            <p style={{ fontSize: 12, color: "#737373" }}>רמת מחיר</p>
          </div>
        </div>

        {/* Person scores */}
        {PERSON_SCORES[r.id] && (
          <div className="mb-3 rounded-xl p-3" style={{ background: "#fafafa", border: "1px solid #f0f0f0" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#a3a3a3", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              ציון אישי
            </p>
            <div className="space-y-1.5">
              <PersonScoreBar score={PERSON_SCORES[r.id].noam}   color="#7c3aed" label="נועם" />
              <PersonScoreBar score={PERSON_SCORES[r.id].maayan} color="#ec4899" label="מעיין" />
              <PersonScoreBar score={PERSON_SCORES[r.id].family} color="#ca8a04" label="משפחה" />
            </div>
          </div>
        )}

        {/* Description */}
        <p style={{ fontSize: 14, color: "#525252", lineHeight: 1.6, marginBottom: 12 }}>{r.description}</p>

        {/* Tags */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {r.tags.map(tag => (
            <span key={tag} className="rounded-full px-2 py-0.5"
              style={{ fontSize: 11, fontWeight: 600, background: "#f5f5f5", color: "#525252" }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Must try */}
        <div className="mb-3 flex items-start gap-2 rounded-xl p-2.5" style={{ background: "#fef9ec" }}>
          <Star className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: "#ca8a04" }} />
          <span style={{ fontSize: 13, color: "#92400e" }}>חובה לנסות: {r.mustTry}</span>
        </div>

        {/* Expanded: hours */}
        {expanded && (
          <div className="mb-3 flex items-center gap-2 rounded-xl p-2.5" style={{ background: "#f5f5f5" }}>
            <Utensils className="h-4 w-4 flex-shrink-0 text-neutral-400" />
            <span style={{ fontSize: 13, color: "#525252" }}>שעות פתיחה: {r.openingHours}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <a href={r.navFromAvalon} target="_blank" rel="noopener noreferrer"
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl py-3 transition-opacity hover:opacity-80"
            style={{ background: "#171717", color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 700 }}>
            <Navigation className="h-4 w-4" />
            נווט
          </a>
          <button onClick={() => setExpanded(v => !v)}
            className="cursor-pointer rounded-xl px-3 transition-colors hover:bg-neutral-100"
            style={{ border: "1px solid #e5e5e5", color: "#737373" }}
            aria-label="פרטים נוספים">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Map embed (Google Maps static) ──────────────────────────────────────────
function MapView({ area }: { area: Area }) {
  const coords: Record<string, string> = {
    "הכל":     "36.4440,28.2240",
    "New Town": "36.4452,28.2228",
    "Old Town": "36.4435,28.2250",
    "Lindos":   "36.0917,28.0855",
  };
  const zoom: Record<string, number> = { "הכל": 14, "New Town": 15, "Old Town": 15, "Lindos": 15 };
  const center = coords[area];
  const z      = zoom[area];

  return (
    <div className="overflow-hidden rounded-2xl" style={{ border: "1px solid #f0f0f0" }}>
      <div className="relative" style={{ paddingBottom: "56.25%" }}>
        <iframe
          title="מפת מסעדות"
          className="absolute inset-0 h-full w-full"
          style={{ border: 0 }}
          src={`https://maps.google.com/maps?q=${center}&z=${z}&output=embed`}
          loading="lazy"
          allowFullScreen
        />
      </div>
      {/* Quick navigate to area from Avalon */}
      <div className="flex items-center justify-between p-3" style={{ background: "#fafafa" }}>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-neutral-400" />
          <span style={{ fontSize: 13, color: "#525252" }}>
            {area === "הכל" ? "כל האזורים" : area === "Lindos" ? "לינדוס — 55 ק\"מ מהמלון" : `${area} — ליד המלון`}
          </span>
        </div>
        <a href={`https://www.google.com/maps/dir/Avalon+Boutique+Hotel+Rhodes/${area === "Old Town" ? "Rhodes+Old+Town" : area === "Lindos" ? "Lindos+Village" : "Rhodes+New+Town"}`}
          target="_blank" rel="noopener noreferrer"
          className="flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 transition-colors hover:bg-neutral-100"
          style={{ fontSize: 12, fontWeight: 600, color: "#171717", textDecoration: "none", border: "1px solid #e5e5e5" }}>
          <Navigation className="h-3 w-3" />
          נווט לאזור
        </a>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RestaurantsPage() {
  const [area, setArea]           = useState<Area>("הכל");
  const [showMap, setShowMap]     = useState(false);
  const [filterVegan, setFilterVegan] = useState(false);

  const areas: Area[] = ["הכל", "New Town", "Old Town", "Lindos"];

  const filtered = [...RESTAURANTS]
    .filter(r => area === "הכל" || r.area === area)
    .filter(r => !filterVegan || r.veganScore >= 90)
    .sort((a, b) => a.distanceMinutes - b.distanceMinutes);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Rubik', system-ui, sans-serif" }}>
      <div className="mx-auto max-w-2xl px-4 pb-36 pt-10 space-y-6 md:max-w-4xl">

        {/* Header */}
        <div>
          <p style={{ fontSize: 15, color: "#a3a3a3", marginBottom: 4 }}>מסעדות · רודוס 2026</p>
          <h1 style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.1, color: "#171717", letterSpacing: "-0.02em" }}>
            מסעדות
          </h1>
          <p style={{ fontSize: 15, color: "#737373", marginTop: 6, lineHeight: 1.5 }}>
            מרחקים מ-Avalon Boutique Hotel · ידידותי לאלרגיה לחלב
          </p>
        </div>

        {/* Hotel reference */}
        <div className="flex items-center gap-3 rounded-2xl p-4" style={{ background: "#f5f3ff", border: "1px solid #e9d5ff" }}>
          <MapPin className="h-5 w-5 flex-shrink-0" style={{ color: "#7c3aed" }} />
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#6d28d9" }}>נקודת ייחוס: Avalon Boutique Hotel</p>
            <p style={{ fontSize: 13, color: "#8b5cf6" }}>New Town · כל המרחקים מחושבים מהמלון</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {areas.map(a => (
            <button key={a} onClick={() => setArea(a)}
              className="cursor-pointer rounded-full px-4 py-2 transition-colors"
              style={{ fontSize: 14, fontWeight: 600,
                background: area === a ? "#171717" : "#f5f5f5",
                color:      area === a ? "#fff"    : "#525252",
                border:     "none" }}>
              {a === "הכל" ? "כל האזורים" : a === "Old Town" ? "עיר עתיקה" : a === "New Town" ? "ניו טאון" : "לינדוס"}
            </button>
          ))}
          <button onClick={() => setFilterVegan(v => !v)}
            className="flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 transition-colors"
            style={{ fontSize: 14, fontWeight: 600,
              background: filterVegan ? "#16a34a" : "#f0fdf4",
              color:      filterVegan ? "#fff"    : "#16a34a",
              border: `1px solid ${filterVegan ? "#16a34a" : "#bbf7d0"}` }}>
            <Leaf className="h-3.5 w-3.5" />
            100% טבעוני
          </button>
          <button onClick={() => setShowMap(v => !v)}
            className="flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 transition-colors hover:bg-neutral-100"
            style={{ fontSize: 14, fontWeight: 600, background: showMap ? "#171717" : "#f5f5f5",
              color: showMap ? "#fff" : "#525252", border: "none" }}>
            <MapPin className="h-3.5 w-3.5" />
            מפה
          </button>
        </div>

        {/* Allergy key */}
        <div className="flex flex-wrap gap-3 rounded-2xl p-4" style={{ background: "#f0f9ff", border: "1px solid #bae6fd" }}>
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-green-600" />
            <span style={{ fontSize: 13, color: "#0369a1" }}>ציון טבעוני — גבוה = יותר אפשרויות</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-blue-600" />
            <span style={{ fontSize: 13, color: "#0369a1" }}>ציון אלרגיה — גבוה = יותר בטוח לחלב</span>
          </div>
        </div>

        {/* Map */}
        {showMap && <MapView area={area} />}

        {/* Desktop 2-col */}
        <div className={`${filtered.length > 2 ? "md:grid md:grid-cols-2 md:gap-6" : ""} space-y-4 md:space-y-0`}>
          {filtered.length === 0 ? (
            <div className="col-span-2 rounded-2xl p-8 text-center" style={{ border: "1px solid #f0f0f0" }}>
              <p style={{ fontSize: 16, color: "#a3a3a3" }}>לא נמצאו מסעדות בסינון זה</p>
            </div>
          ) : (
            filtered.map(r => (
              <div key={r.id}>
                <RestaurantCard r={r} />
              </div>
            ))
          )}
        </div>

        {/* Allergy note */}
        <div className="flex items-start gap-3 rounded-2xl p-4" style={{ background: "#fef9ec", border: "1px solid #fde68a" }}>
          <ShieldAlert className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: "#ca8a04" }} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#92400e", marginBottom: 4 }}>טיפ לאלרגיה לחלב</p>
            <p style={{ fontSize: 13, color: "#a16207", lineHeight: 1.6 }}>
              בכל מסעדה, בקשו <strong>"No dairy, milk allergy"</strong> ביוונית: <strong>"Χωρίς γαλακτοκομικά"</strong>.
              מסעדות עם ציון 90+ מומלצות במיוחד עבור מעיין.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
