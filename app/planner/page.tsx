"use client";

import { useState } from "react";
import {
  Plane, Hotel, Utensils, Compass, Camera, ShoppingBag,
  Star, Moon, Sun, Coffee, MapPin, Navigation,
  Clock, AlertCircle, Leaf, Music, BookOpen, Telescope,
  ChevronDown, ChevronUp, ExternalLink, Sparkles,
  Eye, DollarSign, Guitar, Disc, PawPrint,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
// Noam (13.5): Astronomy, Harry Potter, Rock/Guitars, Grunge Fashion
//              SEVERE MILK ALLERGY — always check!
// Maayan (10.5): K-Pop, Dance, Animals, Shopping, Interactive experiences
interface Event {
  time: string;
  label: string;
  detail: string;
  icon: React.FC<{ className?: string; style?: React.CSSProperties }>;
  type: string;
  tags: string[];
  cost: string | null;
  mapsUrl?: string;
  travelTime?: string;
  noamScore?: number;       // 1-10 — Astronomy, HP, Rock, Grunge
  maayanScore?: number;     // 1-10 — K-Pop, Animals, Shopping, Dance
  familyScore?: number;     // 1-10 — shared experience quality
  noamNote?: string;
  maayanNote?: string;
  allergyRating?: "safe" | "ok" | "ask";
  veganAvailable?: boolean;
  tip?: string;
  wow?: boolean;
  harryPotter?: boolean;
  kpop?: boolean;
  astronomy?: boolean;
  veganFriendly?: boolean;
  profitisIlias?: boolean;
  primaryFor?: "noam" | "maayan" | "family";
}

// ─── Itinerary ────────────────────────────────────────────────────────────────
const DAYS: {
  day: number; date: string; dayLabel: string; title: string; subtitle: string;
  color: string; bg: string;
  noamHighlight: string; maayanHighlight: string; familyHighlight: string;
  events: Event[];
}[] = [
  // ── DAY 1 ─────────────────────────────────────────────────────────────────
  {
    day: 1,
    date: "ספטמבר 7, 2026",
    dayLabel: "יום ראשון",
    title: "יום הגעה — התאקלמות",
    subtitle: "טיסה מוקדמת, עיר עתיקה, ארוחת ערב טבעונית",
    color: "#7c3aed",
    bg: "#f5f3ff",
    noamHighlight: "Knights Street — Harry Potter atmosphere",
    maayanHighlight: "חומות העיר — Photography spots",
    familyHighlight: "Medieval City — כניסה חינם לכולם",
    events: [
      {
        time: "07:05",
        label: "נחיתה — Diagoras Airport, Rhodes",
        detail: "RHO · מונית לAvalon ~€15 · 20 דקות",
        icon: Plane, type: "flight",
        tags: ["הגעה"],
        cost: "€15 מונית",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Rhodes+Airport+Diagoras",
        travelTime: "20 דקות לAvalon",
        noamScore: 5, maayanScore: 6, familyScore: 7,
        allergyRating: "safe", veganAvailable: true,
        noamNote: "הרגע הראשון ברודוס — ראה ים כחול מהחלון",
        maayanNote: "מסע מתחיל! ציפייה לבעלי החיים ולקניות",
      },
      {
        time: "08:30",
        label: "Avalon Boutique Hotel — השארת מזוודות",
        detail: "הגיעו לפני הצ'ק אין · השאירו מזוודות בקבלה · בקשו early check-in",
        icon: Hotel, type: "hotel",
        tags: ["New Town", "הכנה"],
        cost: "כלול",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Avalon+Boutique+Hotel+Rhodes",
        travelTime: "נקודת ייחוס",
        noamScore: 5, maayanScore: 5, familyScore: 6,
        allergyRating: "safe", veganAvailable: true,
        tip: "בקשו early check-in — לפעמים מאפשרים",
      },
      {
        time: "09:00",
        label: "ארוחת בוקר — Annie's Vegan Kitchen",
        detail: "3 דקות מAvalon · Açaí bowl, קפה, מאפים טבעוניים · 100% ללא חלב",
        icon: Coffee, type: "food",
        tags: ["טבעוני 100%", "3 דק' מהמלון", "בטוח לאלרגיה"],
        cost: "₪40 לאדם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Annie's+Vegan+Kitchen+Rhodes",
        travelTime: "3 דקות הליכה",
        noamScore: 8, maayanScore: 8, familyScore: 9,
        allergyRating: "safe", veganAvailable: true, veganFriendly: true,
        noamNote: "100% בטוח לאלרגיה לחלב — ארוחת בוקר ללא דאגות",
        maayanNote: "Açaí bowl צבעוני, smoothies — Instagram-perfect",
        tip: "בקשו Açaí bowl עם חלב שקדים — הכי טעים",
        primaryFor: "family",
      },
      {
        time: "10:00",
        label: "Medieval City of Rhodes",
        detail: "12 דקות מAvalon · שוטטו ברחובות האבן · כניסה חינם",
        icon: Compass, type: "activity",
        tags: ["חינם", "Harry Potter", "Photography"],
        cost: "חינם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Medieval+City+of+Rhodes",
        travelTime: "12 דקות הליכה",
        noamScore: 9, maayanScore: 7, familyScore: 9,
        allergyRating: "safe", veganAvailable: true,
        noamNote: "Knights Street = Diagon Alley. Harry Potter vibes מלאים",
        maayanNote: "חנויות, צבעים, אווירה — K-Pop photography vibes",
        harryPotter: true, wow: true,
        tip: "הכניסה לעיר חינם · Knights Street — הרחוב הכי יפה",
        primaryFor: "noam",
      },
      {
        time: "14:00",
        label: "צ'ק אין — Avalon",
        detail: "פתחו את החדר · מנוחה קצרה אחרי הטיסה",
        icon: Hotel, type: "hotel",
        tags: ["הוזמן"],
        cost: "כלול",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Avalon+Boutique+Hotel+Rhodes",
        travelTime: "המלון",
        noamScore: 5, maayanScore: 5, familyScore: 6,
        allergyRating: "safe", veganAvailable: true,
      },
      {
        time: "17:30",
        label: "חומות העיר העתיקה — Sunset Walk",
        detail: "Old Town Walls · נוף פנורמי לים · Golden hour photography",
        icon: Camera, type: "activity",
        tags: ["Photography", "נוף", "Sunset"],
        cost: "€6 לאדם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Rhodes+Old+Town+Walls",
        travelTime: "12 דקות הליכה",
        noamScore: 8, maayanScore: 9, familyScore: 9,
        allergyRating: "safe", veganAvailable: true,
        noamNote: "נוף לכוכבים עולים — atmosphere מושלם לפני הלילה",
        maayanNote: "Golden hour photography — תמונות K-Pop aesthetic מושלמות",
        wow: true, primaryFor: "maayan",
      },
      {
        time: "19:30",
        label: "ארוחת ערב — T Veg",
        detail: "5 דקות מAvalon · Burger טבעוני, סלטים · בטוח לאלרגיה",
        icon: Utensils, type: "food",
        tags: ["טבעוני", "5 דק' מהמלון", "בטוח לאלרגיה"],
        cost: "₪55 לאדם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=T+Veg+Rhodes",
        travelTime: "5 דקות הליכה",
        noamScore: 7, maayanScore: 8, familyScore: 8,
        allergyRating: "safe", veganAvailable: true, veganFriendly: true,
        noamNote: "Burger טבעוני — ללא חלב בכלל",
        maayanNote: "אווירה צבעונית, תפריט ידידותי",
      },
    ],
  },

  // ── DAY 2 ─────────────────────────────────────────────────────────────────
  {
    day: 2,
    date: "ספטמבר 8, 2026",
    dayLabel: "יום שני",
    title: "Lindos — יום ה-WOW",
    subtitle: "אקרופוליס, מפרץ כחול, סמטאות לבנות, ארוחת ערב Fine Dining",
    color: "#0284c7",
    bg: "#f0f9ff",
    noamHighlight: "Acropolis — היסטוריה, ארכיאולוגיה, Harry Potter feeling",
    maayanHighlight: "Lindos alleys — K-Pop photography, קניות, בתים לבנים",
    familyHighlight: "St Paul's Bay — מים טורקיז, משפחה שלמה",
    events: [
      {
        time: "08:30",
        label: "נסיעה ל-Lindos",
        detail: "אוטובוס 015 · €3 לנפש · 55 דקות · נוף לים כל הדרך",
        icon: MapPin, type: "transport",
        tags: ["55 ק\"מ", "€3 לנפש"],
        cost: "€3 לאדם / €35 מונית",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Lindos+Rhodes+Greece",
        travelTime: "55 דקות",
        noamScore: 6, maayanScore: 6, familyScore: 7,
        allergyRating: "safe", veganAvailable: true,
        tip: "אוטובוס 015 · יוצא כל שעה מהתחנה המרכזית. קחו מים!",
      },
      {
        time: "09:30",
        label: "Acropolis of Lindos",
        detail: "עלייה לאקרופוליס · נוף פנורמי עצור נשימה · ילדים עד 18 חינם!",
        icon: Compass, type: "activity",
        tags: ["WOW", "HP vibes", "ילדים חינם"],
        cost: "€6 לאדם (ילדים עד 18 חינם)",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Acropolis+of+Lindos",
        travelTime: "55 דק' מAvalon",
        noamScore: 10, maayanScore: 8, familyScore: 10,
        allergyRating: "safe", veganAvailable: true,
        noamNote: "היסטוריה עתיקה + נוף = חוויה כמו Hogwarts castle. נועם חינם!",
        maayanNote: "נוף עצום, תמונות מלכה, Instagram-perfect · מעיין חינם!",
        harryPotter: true, wow: true, primaryFor: "noam",
        tip: "הגיעו לפני 10:00 — פחות קהל. הצל מועט, קחו כובע!",
      },
      {
        time: "11:00",
        label: "St Paul's Bay",
        detail: "מפרץ קדוש · מים טורקיז שקופים · שחייה בבוקר",
        icon: Sun, type: "activity",
        tags: ["חינם", "שחייה", "Photography"],
        cost: "חינם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=St+Paul's+Bay+Lindos",
        travelTime: "2 דקות מהאקרופוליס",
        noamScore: 8, maayanScore: 9, familyScore: 10,
        allergyRating: "safe", veganAvailable: true,
        noamNote: "מים שקטים, נוף לאקרופוליס — magical atmosphere",
        maayanNote: "מים כחולים שקופים — חלומי! תמונות K-Pop aesthetic",
        wow: true, primaryFor: "family",
        tip: "הכי יפה בשעות הבוקר — מים שקטים לפני הצהרון",
      },
      {
        time: "12:00",
        label: "סמטאות Lindos הלבנות",
        detail: "בתים לבנים, חנויות מקומיות, תכשיטים — ייחודי לגמרי",
        icon: Camera, type: "activity",
        tags: ["Photography", "K-Pop vibes", "קניות"],
        cost: "חינם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Lindos+village+white+streets",
        travelTime: "כפר לינדוס",
        noamScore: 7, maayanScore: 10, familyScore: 8,
        allergyRating: "safe", veganAvailable: true,
        noamNote: "חנויות מוזיקה קטנות ייתכן — שווה לחקור",
        maayanNote: "K-Pop vibes מלאים! בתים לבנים = תמונות מושלמות. קניות!",
        kpop: true, primaryFor: "maayan",
      },
      {
        time: "13:30",
        label: "ארוחת צהריים — Kalypso Roof Garden",
        detail: "Rooftop · נוף פנורמי לאקרופוליס ולים · תפריט מדיטרני",
        icon: Utensils, type: "food",
        tags: ["Rooftop", "נוף WOW", "ציינו אלרגיה"],
        cost: "₪90 לאדם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Kalypso+Restaurant+Lindos",
        travelTime: "כפר לינדוס",
        noamScore: 7, maayanScore: 8, familyScore: 9,
        allergyRating: "ok", veganAvailable: true, veganFriendly: true,
        noamNote: "ציינו אלרגיה לחלב חמורה! יש אפשרויות בטוחות",
        maayanNote: "לאכול על גג עם נוף לים — חוויה מיוחדת",
        tip: "ציינו בהזמנה: אלרגיה חמורה לחלב עבור נועם. בקשו ישיבה בצד הים.",
      },
      {
        time: "16:30",
        label: "חזרה לרודוס",
        detail: "אוטובוס 015 חזרה · 55 דקות",
        icon: MapPin, type: "transport",
        tags: ["€3"],
        cost: "€3 לאדם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Lindos+bus+stop",
        travelTime: "55 דקות",
        noamScore: 4, maayanScore: 4, familyScore: 5,
        allergyRating: "safe", veganAvailable: true,
      },
      {
        time: "19:00",
        label: "הליכת ערב — עיר עתיקה",
        detail: "Old Town · תאורת לילה · Harry Potter atmosphere בשיאו",
        icon: Moon, type: "activity",
        tags: ["חינם", "Harry Potter", "Photography"],
        cost: "חינם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Rhodes+Old+Town+evening",
        travelTime: "12 דקות מAvalon",
        noamScore: 9, maayanScore: 8, familyScore: 9,
        allergyRating: "safe", veganAvailable: true,
        noamNote: "HP vibes בלילה — תאורת פנסים על האבנות",
        maayanNote: "תמונות לילה, חנויות פתוחות, אווירה",
        harryPotter: true, wow: true,
      },
      {
        time: "20:30",
        label: "ארוחת ערב — RuBisCo Fine Dining",
        detail: "15 דקות מAvalon · עיר עתיקה · הזמינו מראש! ציינו אלרגיה.",
        icon: Utensils, type: "food",
        tags: ["Fine Dining", "הזמינו מראש", "ציינו אלרגיה"],
        cost: "₪160 לאדם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=RuBisCo+Restaurant+Rhodes",
        travelTime: "15 דקות מAvalon",
        noamScore: 8, maayanScore: 7, familyScore: 8,
        allergyRating: "ok", veganAvailable: true, veganFriendly: true,
        noamNote: "הזמינו מראש + ציינו אלרגיה חמורה לחלב",
        maayanNote: "Fine dining experience — צלחות יפות, אווירה מיוחדת",
        wow: true,
        tip: "הזמינו 2 ימים מראש! ציינו בדיוק: 'severe dairy allergy'",
      },
    ],
  },

  // ── DAY 3 ─────────────────────────────────────────────────────────────────
  {
    day: 3,
    date: "ספטמבר 9, 2026",
    dayLabel: "יום שלישי",
    title: "תרבות, טווסים וכוכבים",
    subtitle: "Filerimos, ארמון האבירים, Knights Street, Profitis Ilias לילה",
    color: "#16a34a",
    bg: "#f0fdf4",
    noamHighlight: "Palace of Grand Master + Profitis Ilias astronomy night",
    maayanHighlight: "Filerimos — טווסים חופשיים! · בעלי חיים ייחודי",
    familyHighlight: "Knights Street — Diagon Alley · חינם · wow לכולם",
    events: [
      {
        time: "08:30",
        label: "ארוחת בוקר — Annie's Vegan Kitchen",
        detail: "3 דקות מAvalon · ארוחת בוקר מלאה לפני היום הארוך",
        icon: Coffee, type: "food",
        tags: ["טבעוני 100%", "3 דק' מהמלון", "בטוח לאלרגיה"],
        cost: "₪40 לאדם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Annie's+Vegan+Kitchen+Rhodes",
        travelTime: "3 דקות הליכה",
        noamScore: 9, maayanScore: 8, familyScore: 9,
        allergyRating: "safe", veganAvailable: true, veganFriendly: true,
        noamNote: "בטוח לחלוטין — ארוחת בוקר ללא מתח אלרגיה",
        maayanNote: "Smoothie bowls, אווירה מושלמת לתחילת יום",
        primaryFor: "family",
      },
      {
        time: "09:30",
        label: "Filerimos — מנזר, טווסים ונוף לAvalon",
        detail: "14 ק\"מ · מונית €12 · מנזר מהמאה ה-14 · טווסים הולכים חופשי בשביל!",
        icon: Compass, type: "activity",
        tags: ["WOW", "בעלי חיים", "טווסים!", "Photography"],
        cost: "€3 כניסה · €12 מונית הלוך",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Filerimos+Rhodes+Greece",
        travelTime: "20 דקות מונית",
        noamScore: 7, maayanScore: 10, familyScore: 9,
        allergyRating: "safe", veganAvailable: true,
        noamNote: "מנזר היסטורי מרשים + נוף לכל האי — atmospheric",
        maayanNote: "טווסים הולכים חופשי! בעלי חיים ייחודי לגמרי — מעיין תשגע!",
        wow: true, primaryFor: "maayan",
        tip: "הטווסים מסתובבים חופשי בשביל! הגיעו ב-09:30 לפני החום.",
      },
      {
        time: "13:00",
        label: "ארוחת צהריים — Annie's Vegan Kitchen",
        detail: "חזרה לרודוס · 3 דקות מAvalon · מנוחה בין לבין",
        icon: Utensils, type: "food",
        tags: ["טבעוני 100%", "קרוב", "בטוח"],
        cost: "₪45 לאדם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Annie's+Vegan+Kitchen+Rhodes",
        travelTime: "3 דקות מAvalon",
        noamScore: 8, maayanScore: 8, familyScore: 9,
        allergyRating: "safe", veganAvailable: true, veganFriendly: true,
        noamNote: "100% בטוח — אכול בלי לשאול שאלות",
        maayanNote: "מגוון טבעוני צבעוני",
      },
      {
        time: "14:30",
        label: "Palace of the Grand Master — Hogwarts Castle",
        detail: "ארמון הגרנד מאסטר · עיר עתיקה · 13 דקות מAvalon · ילדים עד 18 חינם!",
        icon: BookOpen, type: "activity",
        tags: ["WOW", "Harry Potter", "ילדים חינם", "Photography"],
        cost: "€8 לאדם (ילדים עד 18 חינם)",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Palace+of+the+Grand+Master+Rhodes",
        travelTime: "13 דקות הליכה",
        noamScore: 10, maayanScore: 7, familyScore: 9,
        allergyRating: "safe", veganAvailable: true,
        noamNote: "HOGWARTS! המקום הכי HP ברודוס. נועם חינם!",
        maayanNote: "ארמון ציורי, תמונות יפות, אווירה מיוחדת · מעיין חינם!",
        harryPotter: true, wow: true, primaryFor: "noam",
        tip: "נועם ומעיין חינם! מסדרונות ארוכים, חדרי אבן — Hogwarts ממש.",
      },
      {
        time: "16:00",
        label: "Street of the Knights — Diagon Alley",
        detail: "הרחוב ההיסטורי של אבירי יוחנן · אבן עתיקה · HP vibes שלמים",
        icon: Compass, type: "activity",
        tags: ["חינם", "Harry Potter", "Photography"],
        cost: "חינם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Street+of+the+Knights+Rhodes",
        travelTime: "ליד ארמון הגרנד מאסטר",
        noamScore: 9, maayanScore: 8, familyScore: 9,
        allergyRating: "safe", veganAvailable: true,
        noamNote: "DIAGON ALLEY! צלם בכניסות הסמטאות",
        maayanNote: "תמונות בסגנון K-Pop + HP hybrid — unique",
        harryPotter: true, wow: true,
      },
      {
        time: "17:00",
        label: "מנוחה במלון — הכנה ללילה הגדול",
        detail: "17:00–19:00 · חיוני לפני Profitis Ilias · הורידו Stellarium עכשיו",
        icon: Moon, type: "rest",
        tags: ["חשוב", "הכנה", "הורידו Stellarium"],
        cost: null,
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Avalon+Boutique+Hotel+Rhodes",
        travelTime: "המלון",
        noamScore: 6, maayanScore: 5, familyScore: 6,
        allergyRating: "safe", veganAvailable: true,
        noamNote: "הורד Stellarium עכשיו! תכנן מה תחפש בשמיים",
        maayanNote: "מנוחה + תכנון מחר",
        astronomy: true,
        tip: "הורידו Stellarium (חינם), SkySafari, Sky Guide עכשיו — בפסגה קליטה חלשה!",
      },
      {
        time: "20:00",
        label: "ארוחת ערב — T Veg",
        detail: "5 דקות מAvalon · ארוחה קלה לפני הנסיעה לProfitis Ilias",
        icon: Utensils, type: "food",
        tags: ["טבעוני", "מהיר", "5 דק' מהמלון"],
        cost: "₪55 לאדם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=T+Veg+Rhodes",
        travelTime: "5 דקות הליכה",
        noamScore: 7, maayanScore: 7, familyScore: 8,
        allergyRating: "safe", veganAvailable: true, veganFriendly: true,
        noamNote: "ארוחה בטוחה לפני הכוכבים — ללא חלב",
        maayanNote: "מהיר ומשביע לפני הלילה",
      },
      {
        time: "21:00",
        label: "יציאה ל-Profitis Ilias",
        detail: "מונית מAvalon · ~€20 · 45 דקות · גובה 798 מ'",
        icon: Navigation, type: "transport",
        tags: ["Astronomy", "לילה", "חשוב"],
        cost: "€20 מונית",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Profitis+Ilias+Rhodes",
        travelTime: "45 דקות",
        noamScore: 9, maayanScore: 7, familyScore: 8,
        allergyRating: "safe", veganAvailable: true,
        astronomy: true,
        tip: "קחו: סוודר, מים, פנס ראש, טלפון מלא. בלילה בהר קריר!",
      },
      {
        time: "21:45",
        label: "Profitis Ilias — ספירת כוכבים",
        detail: "798 מטר · Milky Way גלוי · אפלה מוחלטת · אין אורות עיר",
        icon: Telescope, type: "activity",
        tags: ["Astronomy", "WOW", "Milky Way", "נועם-highlight"],
        cost: "חינם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Profitis+Ilias+summit+Rhodes",
        travelTime: "798 מ' גובה",
        noamScore: 10, maayanScore: 8, familyScore: 10,
        allergyRating: "safe", veganAvailable: true,
        noamNote: "ASTRONOMY WOW! Milky Way בעין רגילה. חוויה שתישאר כל החיים",
        maayanNote: "כוכבים יפים + ביחד עם המשפחה בחושך — מרגש",
        astronomy: true, wow: true, profitisIlias: true, primaryFor: "noam",
        tip: "הורד Stellarium מראש · ספטמבר = Milky Way בשיא. תנו לעיניים 20 דק' להתרגל.",
      },
      {
        time: "23:45",
        label: "חזרה למלון",
        detail: "מונית חזרה לAvalon · ~€20 · 45 דקות",
        icon: Hotel, type: "transport",
        tags: ["לילה", "מונית"],
        cost: "€20 מונית",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Avalon+Boutique+Hotel+Rhodes",
        travelTime: "45 דקות",
        noamScore: 4, maayanScore: 4, familyScore: 5,
        allergyRating: "safe", veganAvailable: true,
      },
    ],
  },

  // ── DAY 4 ─────────────────────────────────────────────────────────────────
  {
    day: 4,
    date: "ספטמבר 10, 2026",
    dayLabel: "יום רביעי",
    title: "יום עזיבה — קניות וטיסה",
    subtitle: "בוקר קניות, ארוחה אחרונה, טיסה הביתה",
    color: "#ca8a04",
    bg: "#fef9ec",
    noamHighlight: "חנויות Grunge + Rock Merchandise בדרך לשדה",
    maayanHighlight: "Zara, Bershka, Stradivarius — K-Pop fashion haul",
    familyHighlight: "Annie's breakfast — ארוחת פרידה מושלמת",
    events: [
      {
        time: "08:30",
        label: "ארוחת בוקר — Annie's Vegan Kitchen",
        detail: "ארוחה אחרונה · 3 דקות מAvalon · פינוק סיום הטיול",
        icon: Coffee, type: "food",
        tags: ["טבעוני 100%", "אחרון", "בטוח"],
        cost: "₪40 לאדם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Annie's+Vegan+Kitchen+Rhodes",
        travelTime: "3 דקות הליכה",
        noamScore: 9, maayanScore: 8, familyScore: 9,
        allergyRating: "safe", veganAvailable: true, veganFriendly: true,
        noamNote: "ארוחת פרידה בטוחה לחלוטין",
        maayanNote: "Açaí bowl אחרון! לשמור זיכרון",
        primaryFor: "family",
      },
      {
        time: "09:30",
        label: "קניות — Zara, Bershka, Pull&Bear, Stradivarius",
        detail: "כולן ב-Mandraki Area · 8-10 דקות מAvalon · Y2K + Grunge + K-Pop",
        icon: ShoppingBag, type: "shopping",
        tags: ["Y2K", "Grunge", "K-Pop Fashion"],
        cost: "לפי קניות",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Mandraki+shopping+Rhodes",
        travelTime: "8-10 דקות הליכה",
        noamScore: 7, maayanScore: 10, familyScore: 8,
        allergyRating: "safe", veganAvailable: true,
        noamNote: "Grunge + Rock aesthetic בBershka/Pull&Bear — בדוק T-shirts",
        maayanNote: "K-Pop fashion HAUL! Zara + Stradivarius = paradise",
        kpop: true, primaryFor: "maayan",
        tip: "Zara → Bershka → Pull&Bear → Stradivarius — הכל ב-10 דקות הליכה",
      },
      {
        time: "11:30",
        label: "ארוחת צהריים — T Veg",
        detail: "5 דקות מAvalon · ארוחה קלה לפני הנסיעה לשדה",
        icon: Utensils, type: "food",
        tags: ["טבעוני", "מהיר"],
        cost: "₪40 לאדם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=T+Veg+Rhodes",
        travelTime: "5 דקות הליכה",
        noamScore: 7, maayanScore: 7, familyScore: 8,
        allergyRating: "safe", veganAvailable: true, veganFriendly: true,
        noamNote: "ארוחה בטוחה לפני הטיסה",
        maayanNote: "מהיר ומשביע",
      },
      {
        time: "12:15",
        label: "חזרה למלון — צ'ק אאוט",
        detail: "איסוף מזוודות + צ'ק אאוט · בקשו late checkout אם צריך",
        icon: Hotel, type: "hotel",
        tags: ["חשוב"],
        cost: null,
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Avalon+Boutique+Hotel+Rhodes",
        travelTime: "המלון",
        noamScore: 3, maayanScore: 4, familyScore: 4,
        allergyRating: "safe", veganAvailable: true,
        tip: "בקשו late checkout — לפעמים מאפשרים עד 13:00",
      },
      {
        time: "12:40",
        label: "מונית לשדה התעופה",
        detail: "מAvalon לDiagoras Airport · €15 · 20 דקות",
        icon: Navigation, type: "transport",
        tags: ["חשוב"],
        cost: "€15 מונית",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Rhodes+Airport+Diagoras",
        travelTime: "20 דקות",
        noamScore: 3, maayanScore: 3, familyScore: 4,
        allergyRating: "safe", veganAvailable: true,
        tip: "הזמינו מונית דרך קבלת המלון מראש!",
      },
      {
        time: "15:10",
        label: "טיסה חזרה — RHO → TLV",
        detail: "ביי רודוס · הזיכרונות נשארים לנצח",
        icon: Plane, type: "flight",
        tags: ["חזרה הביתה"],
        cost: "כלול",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Rhodes+Airport+Diagoras",
        travelTime: "טיסה",
        noamScore: 6, maayanScore: 7, familyScore: 7,
        allergyRating: "safe", veganAvailable: true,
        noamNote: "כבר מתכנן לאן לצפות בכוכבים בפעם הבאה",
        maayanNote: "כבר מתכננת K-Pop tour לסיאול",
      },
    ],
  },
];

// ─── Discovery data ────────────────────────────────────────────────────────────
const MUSIC_DISCOVERY = [
  { name: "Manolis Music Store",   type: "guitar",  note: "גיטרות + כלי נגינה · New Town", mapsUrl: "https://www.google.com/maps/search/?api=1&query=music+store+Rhodes+Greece", noamScore: 9 },
  { name: "Vinyl & Records Shop",  type: "vinyl",   note: "תקליטים + Rock · עיר עתיקה",    mapsUrl: "https://www.google.com/maps/search/?api=1&query=vinyl+records+Rhodes+Greece",  noamScore: 10 },
  { name: "Rhodes Music Centre",   type: "store",   note: "כלי נגינה, מיתרים, אביזרים",     mapsUrl: "https://www.google.com/maps/search/?api=1&query=music+instruments+Rhodes",     noamScore: 8 },
  { name: "Rock Merchandise Shop", type: "merch",   note: "חולצות להקות, רוק מרצ'נדייז",   mapsUrl: "https://www.google.com/maps/search/?api=1&query=rock+merchandise+Rhodes",       noamScore: 9 },
  { name: "Alternative Music Bar", type: "live",    note: "מוזיקה חיה · Rock · New Town",    mapsUrl: "https://www.google.com/maps/search/?api=1&query=live+music+rock+bar+Rhodes",   noamScore: 9 },
  { name: "Street Musicians",      type: "live",    note: "מוזיקאים רחוב · עיר עתיקה בערב", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Rhodes+Old+Town+street+music", noamScore: 7 },
];

const ANIMAL_DISCOVERY = [
  { name: "Filerimos Peacocks",      note: "טווסים חופשיים בשביל המנזר — חוויה ייחודית!",         mapsUrl: "https://www.google.com/maps/search/?api=1&query=Filerimos+Rhodes+Greece",          maayanScore: 10 },
  { name: "Valley of the Butterflies", note: "אלפי פרפרים · 25 ק\"מ מרודוס · ביולי-ספטמבר",      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Valley+of+the+Butterflies+Rhodes",  maayanScore: 9  },
  { name: "Kallithea Springs",       note: "ים שקוף + דגים לצד ספינות טבילה",                       mapsUrl: "https://www.google.com/maps/search/?api=1&query=Kallithea+Springs+Rhodes",          maayanScore: 8  },
  { name: "Rhodes Aquarium",         note: "מוזיאון ימי · חיות ים בייחוד לילדים",                   mapsUrl: "https://www.google.com/maps/search/?api=1&query=Rhodes+Aquarium+Greece",            maayanScore: 8  },
  { name: "Donkey Rides (Lindos)",   note: "חמורים בלינדוס — מסורת מקומית · ב-Acropolis path",      mapsUrl: "https://www.google.com/maps/search/?api=1&query=donkey+rides+Lindos+Rhodes",        maayanScore: 9  },
  { name: "Faliraki Wildlife Park",  note: "פארק חיות · קרוב לרודוס · משפחתי",                     mapsUrl: "https://www.google.com/maps/search/?api=1&query=Faliraki+wildlife+park+Rhodes",     maayanScore: 8  },
];

const SHOPPING_DISCOVERY = [
  // Fashion
  { name: "Zara",            style: "Y2K Fashion",        area: "New Town",   distance: "8 דק'",  noamScore: 6, maayanScore: 9,  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Zara+Rhodes+Greece" },
  { name: "Bershka",         style: "Y2K + Grunge",       area: "New Town",   distance: "9 דק'",  noamScore: 8, maayanScore: 8,  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Bershka+Rhodes+Greece" },
  { name: "Pull&Bear",       style: "Grunge + Street",    area: "New Town",   distance: "9 דק'",  noamScore: 9, maayanScore: 7,  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Pull+Bear+Rhodes+Greece" },
  { name: "Stradivarius",    style: "Y2K + Boho",         area: "New Town",   distance: "10 דק'", noamScore: 5, maayanScore: 10, mapsUrl: "https://www.google.com/maps/search/?api=1&query=Stradivarius+Rhodes+Greece" },
  { name: "H&M",             style: "Y2K Budget",         area: "New Town",   distance: "7 דק'",  noamScore: 5, maayanScore: 8,  mapsUrl: "https://www.google.com/maps/search/?api=1&query=HM+Rhodes+Greece" },
  // Noam's stores
  { name: "Vintage Shops",   style: "Vintage Y2K + Grunge", area: "עיר עתיקה", distance: "15 דק'", noamScore: 10, maayanScore: 7, mapsUrl: "https://www.google.com/maps/search/?api=1&query=vintage+shops+Rhodes+Old+Town" },
  { name: "Rock Merch Shop", style: "Band T-Shirts + Rock", area: "New Town",  distance: "10 דק'", noamScore: 10, maayanScore: 5, mapsUrl: "https://www.google.com/maps/search/?api=1&query=rock+merchandise+Rhodes" },
  { name: "Alternative Store", style: "Grunge + Alternative", area: "עיר עתיקה", distance: "15 דק'", noamScore: 9, maayanScore: 6, mapsUrl: "https://www.google.com/maps/search/?api=1&query=alternative+fashion+Rhodes" },
];

// ─── Event type colors ─────────────────────────────────────────────────────────
const TYPE_STYLE: Record<string, { color: string; bg: string }> = {
  flight:    { color: "#7c3aed", bg: "#f5f3ff" },
  food:      { color: "#16a34a", bg: "#f0fdf4" },
  activity:  { color: "#0284c7", bg: "#eff6ff" },
  shopping:  { color: "#ec4899", bg: "#fdf2f8" },
  hotel:     { color: "#0284c7", bg: "#eff6ff" },
  transport: { color: "#f59e0b", bg: "#fff7ed" },
  rest:      { color: "#a3a3a3", bg: "#fafafa" },
};

// ─── Score bar ─────────────────────────────────────────────────────────────────
function ScoreBar({ score, color, label }: { score: number; color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ fontSize: 10, fontWeight: 700, color, minWidth: 46 }}>{label}</span>
      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 5, background: "#f5f5f5" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${score * 10}%`, background: color }} />
      </div>
      <span style={{ fontSize: 10, color: "#a3a3a3", minWidth: 20, textAlign: "right" }}>{score}</span>
    </div>
  );
}

// ─── Primary badge ─────────────────────────────────────────────────────────────
function PrimaryBadge({ primaryFor }: { primaryFor?: "noam" | "maayan" | "family" }) {
  if (!primaryFor) return null;
  const map = {
    noam:   { label: "★ נועם", color: "#7c3aed", bg: "#f5f3ff" },
    maayan: { label: "★ מעיין", color: "#ec4899", bg: "#fdf2f8" },
    family: { label: "★ משפחה", color: "#ca8a04", bg: "#fef9ec" },
  };
  const m = map[primaryFor];
  return (
    <span className="rounded-full px-2 py-0.5" style={{ fontSize: 10, fontWeight: 800, background: m.bg, color: m.color }}>
      {m.label}
    </span>
  );
}

// ─── Allergy badge ─────────────────────────────────────────────────────────────
function AllergyBadge({ rating }: { rating?: "safe" | "ok" | "ask" }) {
  if (!rating) return null;
  const map = {
    safe: { label: "✓ בטוח לנועם", color: "#15803d", bg: "#f0fdf4" },
    ok:   { label: "⚠ ציין אלרגיה", color: "#b45309", bg: "#fef9ec" },
    ask:  { label: "✗ שאל מלצר",   color: "#dc2626", bg: "#fef2f2" },
  };
  const m = map[rating];
  return (
    <span className="rounded-full px-2 py-0.5" style={{ fontSize: 10, fontWeight: 700, background: m.bg, color: m.color }}>
      {m.label}
    </span>
  );
}

// ─── Event row ─────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EventRow({ e }: { e: any }) {
  const [expanded, setExpanded] = useState(false);
  const s = TYPE_STYLE[e.type as string] ?? TYPE_STYLE.activity;
  const Icon = e.icon as React.FC<{ className?: string; style?: React.CSSProperties }>;
  const hasExtra = e.tip || e.noamNote || e.maayanNote;

  return (
    <div className="flex gap-3">
      {/* Time */}
      <div className="flex flex-col items-center">
        <span style={{ fontSize: 12, fontWeight: 700, color: "#a3a3a3", minWidth: 44, textAlign: "center" }}>
          {e.time}
        </span>
        <div className="mt-1 flex-1 w-px bg-neutral-100" />
      </div>

      {/* Card */}
      <div className="mb-2 flex-1 overflow-hidden rounded-2xl"
        style={{ border: "1px solid #f0f0f0", background: "#fff" }}>
        <div className="p-3">
          <div className="flex items-start gap-2.5">
            {/* Icon */}
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: s.bg }}>
              <Icon className="h-5 w-5" style={{ color: s.color }} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Title row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#171717" }}>{e.label}</span>
                    {e.wow && <Star className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#ca8a04" }} />}
                    {e.harryPotter && <span className="rounded-full px-1.5 py-0.5" style={{ fontSize: 10, fontWeight: 700, background: "#7c3aed22", color: "#7c3aed" }}>HP</span>}
                    {e.kpop && <span className="rounded-full px-1.5 py-0.5" style={{ fontSize: 10, fontWeight: 700, background: "#ec489922", color: "#ec4899" }}>K-Pop</span>}
                    {e.astronomy && <Telescope className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#0284c7" }} />}
                    {e.veganFriendly && <Leaf className="h-3.5 w-3.5 flex-shrink-0 text-green-500" />}
                    {e.primaryFor && <PrimaryBadge primaryFor={e.primaryFor} />}
                  </div>
                  <p style={{ fontSize: 13, color: "#737373", marginTop: 2, lineHeight: 1.4 }}>{e.detail}</p>
                </div>
                {e.cost && (
                  <span className="flex-shrink-0 rounded-xl px-2 py-1"
                    style={{ fontSize: 11, fontWeight: 700,
                      background: e.cost === "חינם" ? "#f0fdf4" : "#f5f5f5",
                      color:      e.cost === "חינם" ? "#16a34a"  : "#525252" }}>
                    {e.cost}
                  </span>
                )}
              </div>

              {/* 3-score bars */}
              {(e.noamScore || e.maayanScore || e.familyScore) && (
                <div className="mt-2.5 space-y-1">
                  {e.noamScore   && <ScoreBar score={e.noamScore}   color="#7c3aed" label="נועם" />}
                  {e.maayanScore && <ScoreBar score={e.maayanScore} color="#ec4899" label="מעיין" />}
                  {e.familyScore && <ScoreBar score={e.familyScore} color="#ca8a04" label="משפחה" />}
                </div>
              )}

              {/* Allergy */}
              {e.allergyRating && (
                <div className="mt-2">
                  <AllergyBadge rating={e.allergyRating} />
                </div>
              )}

              {/* Maps + travel time + expand */}
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                {e.mapsUrl && (
                  <a href={e.mapsUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-lg px-2 py-1 transition-colors hover:bg-neutral-50"
                    style={{ fontSize: 11, fontWeight: 600, color: "#0284c7", textDecoration: "none", border: "1px solid #e0f2fe" }}>
                    <ExternalLink className="h-3 w-3" />
                    מפה
                  </a>
                )}
                {e.travelTime && (
                  <span className="flex items-center gap-1" style={{ fontSize: 11, color: "#a3a3a3" }}>
                    <Clock className="h-3 w-3" />
                    {e.travelTime}
                  </span>
                )}
                {hasExtra && (
                  <button onClick={() => setExpanded(v => !v)}
                    className="mr-auto flex cursor-pointer items-center gap-1 transition-opacity hover:opacity-70"
                    style={{ fontSize: 11, color: "#a3a3a3", background: "none", border: "none", padding: 0 }}>
                    {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    {expanded ? "פחות" : "פרטים"}
                  </button>
                )}
              </div>

              {/* Expanded */}
              {expanded && (
                <div className="mt-2 space-y-2">
                  {e.noamNote && (
                    <div className="flex items-start gap-2 rounded-xl p-2.5" style={{ background: "#f5f3ff" }}>
                      <Star className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" style={{ color: "#7c3aed" }} />
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", marginBottom: 2 }}>נועם (13.5)</p>
                        <span style={{ fontSize: 12, color: "#4c1d95", lineHeight: 1.5 }}>{e.noamNote}</span>
                      </div>
                    </div>
                  )}
                  {e.maayanNote && (
                    <div className="flex items-start gap-2 rounded-xl p-2.5" style={{ background: "#fdf2f8" }}>
                      <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" style={{ color: "#ec4899" }} />
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#ec4899", marginBottom: 2 }}>מעיין (10.5)</p>
                        <span style={{ fontSize: 12, color: "#9d174d", lineHeight: 1.5 }}>{e.maayanNote}</span>
                      </div>
                    </div>
                  )}
                  {e.tip && (
                    <div className="flex items-start gap-2 rounded-xl p-2.5" style={{ background: "#fef9ec" }}>
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" style={{ color: "#ca8a04" }} />
                      <span style={{ fontSize: 12, color: "#92400e", lineHeight: 1.5 }}>{e.tip}</span>
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

// ─── Astronomy section ─────────────────────────────────────────────────────────
function AstronomySection() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(v => !v)}
        className="flex w-full cursor-pointer items-center justify-between rounded-2xl p-4"
        style={{ background: "#0f172a", border: "none" }}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: "#1e3a5f" }}>
            <Telescope className="h-5 w-5" style={{ color: "#93c5fd" }} />
          </div>
          <div className="text-right">
            <p style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>Profitis Ilias — ספירת כוכבים</p>
            <p style={{ fontSize: 12, color: "#64748b" }}>מדריך אסטרונומיה לנועם · יום 3 · 21:45–23:15</p>
          </div>
        </div>
        {open ? <ChevronUp className="h-5 w-5 flex-shrink-0" style={{ color: "#64748b" }} />
               : <ChevronDown className="h-5 w-5 flex-shrink-0" style={{ color: "#64748b" }} />}
      </button>

      {open && (
        <div className="mt-2 space-y-4 rounded-2xl p-5" style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: "#93c5fd" }}>למה Profitis Ilias?</p>
          {[
            { t: "798 מ' גובה", d: "מעל האוויר העכור — שמיים צלולים. Milky Way בעין רגילה." },
            { t: "אפלה מוחלטת", d: "אין אורות עיר בפסגה. זיהום אור = אפס." },
            { t: "אוויר ים נקי", d: "רוחות ים מנקות האווירה — שקיפות אסטרונומית מעולה בספטמבר." },
            { t: "קל להגיע", d: "מונית מרודוס — 45 דקות. ללא ציוד מיוחד." },
          ].map(item => (
            <div key={item.t} className="rounded-xl p-3" style={{ background: "#1e293b" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{item.t}</p>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>{item.d}</p>
            </div>
          ))}
          <div style={{ height: 1, background: "#1e293b" }} />
          <p style={{ fontSize: 13, fontWeight: 800, color: "#93c5fd" }}>אפליקציות לנועם</p>
          {[
            { name: "Stellarium", note: "חינם · AR מצלמה · מזהה כל כוכב", badge: "חינם" },
            { name: "SkySafari",  note: "מפות שמיים · עקיבת כוכבי לכת",  badge: "₪" },
            { name: "Sky Guide",  note: "הכי יפה · Apple only",            badge: "₪" },
          ].map(app => (
            <div key={app.name} className="flex items-center gap-3 rounded-xl p-3" style={{ background: "#1e293b" }}>
              <Telescope className="h-5 w-5 flex-shrink-0" style={{ color: "#93c5fd" }} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{app.name}</p>
                  <span className="rounded-full px-2 py-0.5" style={{ fontSize: 10, fontWeight: 700, background: "#0f172a", color: "#93c5fd" }}>{app.badge}</span>
                </div>
                <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{app.note}</p>
              </div>
            </div>
          ))}
          <div className="rounded-xl p-3" style={{ background: "#1e3a5f" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#93c5fd" }}>זמן מומלץ: 21:30–22:30</p>
            <p style={{ fontSize: 12, color: "#bfdbfe", marginTop: 3 }}>ספטמבר = Milky Way בשיא. תנו לעיניים 20 דקות להתרגל לחושך. קחו סוודר!</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Music discovery section ───────────────────────────────────────────────────
function MusicDiscovery() {
  const [open, setOpen] = useState(false);
  const typeIcon = (t: string) => {
    if (t === "guitar") return Guitar;
    if (t === "vinyl")  return Disc;
    return Music;
  };
  return (
    <div>
      <button onClick={() => setOpen(v => !v)}
        className="flex w-full cursor-pointer items-center justify-between rounded-2xl p-4"
        style={{ background: "#1c1917", border: "none" }}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: "#292524" }}>
            <Guitar className="h-5 w-5" style={{ color: "#f97316" }} />
          </div>
          <div className="text-right">
            <p style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>מוזיקה ברודוס — לנועם</p>
            <p style={{ fontSize: 12, color: "#78716c" }}>גיטרות · ויניל · Rock · מוזיקה חיה</p>
          </div>
        </div>
        {open ? <ChevronUp className="h-5 w-5 flex-shrink-0" style={{ color: "#78716c" }} />
               : <ChevronDown className="h-5 w-5 flex-shrink-0" style={{ color: "#78716c" }} />}
      </button>

      {open && (
        <div className="mt-2 space-y-2 rounded-2xl p-4" style={{ background: "#1c1917", border: "1px solid #292524" }}>
          <div className="rounded-xl p-3 mb-3" style={{ background: "#7c3aed22", border: "1px solid #7c3aed44" }}>
            <p style={{ fontSize: 12, color: "#c4b5fd" }}>
              <strong style={{ color: "#a78bfa" }}>נועם:</strong> חפש חנויות מוזיקה בשוטטות בעיר העתיקה ובניו טאון.
              Rhodes Old Town נפלא לחנויות ויניל ואלטרנטיבי.
              Google Maps עשוי לחשוף חנויות שלא מפורסמות.
            </p>
          </div>
          {MUSIC_DISCOVERY.map(item => {
            const ItemIcon = typeIcon(item.type);
            return (
              <div key={item.name} className="flex items-center gap-3 rounded-xl p-3" style={{ background: "#292524" }}>
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: "#1c1917" }}>
                  <ItemIcon className="h-4 w-4" style={{ color: "#f97316" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{item.name}</p>
                  <p style={{ fontSize: 12, color: "#a8a29e", marginTop: 2 }}>{item.note}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full px-2 py-1" style={{ fontSize: 10, fontWeight: 800, background: "#7c3aed22", color: "#a78bfa" }}>
                    נועם {item.noamScore}/10
                  </span>
                  <a href={item.mapsUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-neutral-800"
                    style={{ border: "1px solid #44403c" }}>
                    <ExternalLink className="h-3.5 w-3.5" style={{ color: "#78716c" }} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Animal discovery section ──────────────────────────────────────────────────
function AnimalDiscovery() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(v => !v)}
        className="flex w-full cursor-pointer items-center justify-between rounded-2xl p-4"
        style={{ background: "#052e16", border: "none" }}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: "#14532d" }}>
            <PawPrint className="h-5 w-5" style={{ color: "#4ade80" }} />
          </div>
          <div className="text-right">
            <p style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>בעלי חיים ברודוס — למעיין</p>
            <p style={{ fontSize: 12, color: "#166534" }}>טווסים · פרפרים · דגים · חוויות טבע</p>
          </div>
        </div>
        {open ? <ChevronUp className="h-5 w-5 flex-shrink-0" style={{ color: "#166534" }} />
               : <ChevronDown className="h-5 w-5 flex-shrink-0" style={{ color: "#166534" }} />}
      </button>

      {open && (
        <div className="mt-2 space-y-2 rounded-2xl p-4" style={{ background: "#052e16", border: "1px solid #14532d" }}>
          {ANIMAL_DISCOVERY.map(item => (
            <div key={item.name} className="flex items-center gap-3 rounded-xl p-3" style={{ background: "#14532d" }}>
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: "#052e16" }}>
                <PawPrint className="h-4 w-4" style={{ color: "#4ade80" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{item.name}</p>
                <p style={{ fontSize: 12, color: "#4ade80", marginTop: 2, lineHeight: 1.4 }}>{item.note}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full px-2 py-1" style={{ fontSize: 10, fontWeight: 800, background: "#ec489922", color: "#f9a8d4" }}>
                  מעיין {item.maayanScore}/10
                </span>
                <a href={item.mapsUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-lg p-2"
                  style={{ border: "1px solid #166534" }}>
                  <ExternalLink className="h-3.5 w-3.5" style={{ color: "#4ade80" }} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Shopping discovery section ────────────────────────────────────────────────
function ShoppingDiscovery() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(v => !v)}
        className="flex w-full cursor-pointer items-center justify-between rounded-2xl p-4"
        style={{ border: "1px solid #f0f0f0", background: "#fff" }}>
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" style={{ color: "#ec4899" }} />
          <span style={{ fontSize: 17, fontWeight: 700, color: "#171717" }}>קניות — Y2K, Grunge, K-Pop, Rock</span>
        </div>
        {open ? <ChevronUp className="h-5 w-5 text-neutral-400" /> : <ChevronDown className="h-5 w-5 text-neutral-400" />}
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          {/* Score legend */}
          <div className="flex gap-4 rounded-2xl p-3" style={{ background: "#fafafa", border: "1px solid #f0f0f0" }}>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: "#7c3aed" }} />
              <span style={{ fontSize: 11, color: "#525252" }}>נועם (Grunge/Rock)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: "#ec4899" }} />
              <span style={{ fontSize: 11, color: "#525252" }}>מעיין (K-Pop/Y2K)</span>
            </div>
          </div>
          {SHOPPING_DISCOVERY.map(store => (
            <div key={store.name} className="rounded-2xl p-4" style={{ border: "1px solid #f0f0f0" }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: "#fdf2f8" }}>
                  <ShoppingBag className="h-5 w-5" style={{ color: "#ec4899" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#171717" }}>{store.name}</p>
                  <p style={{ fontSize: 12, color: "#a3a3a3" }}>{store.area} · {store.distance}</p>
                  <p style={{ fontSize: 11, color: "#ec4899", fontWeight: 600, marginTop: 2 }}>{store.style}</p>
                </div>
                <a href={store.mapsUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-xl px-3 py-2 transition-colors hover:bg-neutral-100"
                  style={{ border: "1px solid #e5e5e5", fontSize: 13, fontWeight: 600, color: "#171717", textDecoration: "none" }}>
                  <Navigation className="h-3.5 w-3.5" />
                  מפה
                </a>
              </div>
              <div className="space-y-1">
                <ScoreBar score={store.noamScore}   color="#7c3aed" label="נועם" />
                <ScoreBar score={store.maayanScore} color="#ec4899" label="מעיין" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function PlannerPage() {
  const [activeDay, setActiveDay] = useState(0);
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

        {/* Family profile bar */}
        <div className="rounded-2xl p-4" style={{ background: "#fafafa", border: "1px solid #f0f0f0" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#a3a3a3", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>פרופיל המשפחה</p>
          <div className="grid grid-cols-2 gap-3">
            {/* Noam */}
            <div className="rounded-2xl p-3" style={{ background: "#f5f3ff", border: "1px solid #ddd6fe" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: "#7c3aed" }} />
                <span style={{ fontSize: 14, fontWeight: 800, color: "#4c1d95" }}>נועם · 13.5</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {["אסטרונומיה", "Harry Potter", "גיטרות/Rock", "Grunge"].map(t => (
                  <span key={t} className="rounded-full px-2 py-0.5" style={{ fontSize: 10, fontWeight: 600, background: "#7c3aed22", color: "#7c3aed" }}>{t}</span>
                ))}
              </div>
              <div className="flex items-center gap-1.5 rounded-lg p-2" style={{ background: "#fef2f2" }}>
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#dc2626" }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: "#991b1b" }}>אלרגיה חמורה לחלב — עדיפות עליונה</span>
              </div>
            </div>
            {/* Maayan */}
            <div className="rounded-2xl p-3" style={{ background: "#fdf2f8", border: "1px solid #fbcfe8" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: "#ec4899" }} />
                <span style={{ fontSize: 14, fontWeight: 800, color: "#9d174d" }}>מעיין · 10.5</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {["K-Pop", "בעלי חיים", "קניות", "ריקוד"].map(t => (
                  <span key={t} className="rounded-full px-2 py-0.5" style={{ fontSize: 10, fontWeight: 600, background: "#ec489922", color: "#ec4899" }}>{t}</span>
                ))}
              </div>
              <div className="flex items-center gap-1.5 rounded-lg p-2" style={{ background: "#fef9ec" }}>
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#ca8a04" }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: "#92400e" }}>אלרגיה קלה לאבק · לא מסכנת חיים</span>
              </div>
            </div>
          </div>
        </div>

        {/* Day selector */}
        <div className="grid grid-cols-4 gap-2">
          {DAYS.map((d, i) => (
            <button key={d.day} onClick={() => setActiveDay(i)}
              className="cursor-pointer rounded-2xl p-3 text-center transition-all"
              style={{
                border: `2px solid ${activeDay === i ? d.color : "#f0f0f0"}`,
                background: activeDay === i ? d.bg : "#fff",
                minHeight: 56,
              }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: activeDay === i ? d.color : "#a3a3a3", lineHeight: 1 }}>יום {d.day}</p>
              <p style={{ fontSize: 10, color: activeDay === i ? d.color : "#d1d5db", marginTop: 3 }}>
                {d.dayLabel.split(" ")[1] ?? d.dayLabel}
              </p>
            </button>
          ))}
        </div>

        {/* Day header */}
        <div className="overflow-hidden rounded-3xl" style={{ background: "#171717" }}>
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p style={{ fontSize: 13, color: "#737373", marginBottom: 3 }}>{day.date}</p>
                <h2 style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>{day.title}</h2>
                <p style={{ fontSize: 14, color: "#a3a3a3", marginTop: 4 }}>{day.subtitle}</p>
              </div>
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl" style={{ background: day.bg }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: day.color }}>{day.day}</span>
              </div>
            </div>
            {/* Highlights per person */}
            <div className="mt-4 space-y-2">
              <div className="flex items-start gap-2 rounded-xl p-2.5" style={{ background: "rgba(124,58,237,0.15)" }}>
                <Star className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" style={{ color: "#a78bfa" }} />
                <span style={{ fontSize: 12, color: "#c4b5fd", lineHeight: 1.4 }}><strong style={{ color: "#a78bfa" }}>נועם:</strong> {day.noamHighlight}</span>
              </div>
              <div className="flex items-start gap-2 rounded-xl p-2.5" style={{ background: "rgba(236,72,153,0.15)" }}>
                <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" style={{ color: "#f9a8d4" }} />
                <span style={{ fontSize: 12, color: "#f9a8d4", lineHeight: 1.4 }}><strong style={{ color: "#f9a8d4" }}>מעיין:</strong> {day.maayanHighlight}</span>
              </div>
              <div className="flex items-start gap-2 rounded-xl p-2.5" style={{ background: "rgba(202,138,4,0.15)" }}>
                <Eye className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" style={{ color: "#fde68a" }} />
                <span style={{ fontSize: 12, color: "#fde68a", lineHeight: 1.4 }}><strong style={{ color: "#fde68a" }}>משפחה:</strong> {day.familyHighlight}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Events timeline */}
        <div className="space-y-0.5">
          {day.events.map((e, i) => <EventRow key={i} e={e} />)}
        </div>

        {/* Discovery sections */}
        <AstronomySection />
        <MusicDiscovery />
        <AnimalDiscovery />
        <ShoppingDiscovery />

      </div>
    </div>
  );
}
