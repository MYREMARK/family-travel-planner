"use client";

import { useState } from "react";
import {
  Plane, Hotel, Utensils, Compass, Camera, ShoppingBag,
  Star, Moon, Sun, Coffee, MapPin, Navigation,
  Clock, AlertCircle, Leaf, Music, BookOpen, Telescope,
  ChevronDown, ChevronUp, ExternalLink, Sparkles,
  Eye, Guitar, Disc, PawPrint, Hourglass, RefreshCw,
  ShieldAlert, ShieldCheck,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
// Noam (13.5): Astronomy, Harry Potter, Rock/Guitars, Grunge Fashion
//              SEVERE MILK ALLERGY — always check! Avoid cross-contamination.
// Maayan (10.5): K-Pop, Dance, Animals, Shopping, Interactive experiences
// Avalon Boutique Hotel is INSIDE Rhodes Old Town (9 Haritos St), steps from
// the Palace of the Grand Master — all geography below is based on that.
interface Event {
  time: string;
  label: string;
  detail: string;
  icon: React.FC<{ className?: string; style?: React.CSSProperties }>;
  type: string;
  tags: string[];
  cost: string | null;
  mapsUrl?: string;
  travelTime?: string;      // זמן הליכה/נסיעה משוער
  distancePrev?: string;    // מרחק מהפעילות הקודמת
  duration?: string;        // משך הפעילות המשוער
  transportOption?: string; // אפשרות תחבורה
  altOption?: string;       // אפשרות חלופית / מסעדת גיבוי
  safetyNote?: string;      // הערת בטיחות ספציפית לאירוע
  wowLevel?: number;        // רמת WOW 1–10
  cuisine?: string;         // סוג מטבח/אווירה (למסעדות)
  veganStatus?: string;     // מעמד טבעוני מדויק
  allergyConfidence?: string; // רמת ביטחון לגבי אלרגיית החלב, בלשון כנה
  whySelected?: string;     // למה נבחרה המסעדה הזו דווקא כאן
  priceLevel?: "€" | "€€" | "€€€"; // רמת מחיר יחסית
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

interface DaySummary {
  safety: "🟢" | "🟡" | "🔴";
  safetyNote: string;
  foodSafety: "🟢" | "🟡" | "🔴";
  walkingComfort: "🟢" | "🟡" | "🔴";
  wow: number;    // 1-10
  value: number;  // 1-10
  noamWillLove: string;
  maayanWillLove: string;
}

const SAFETY_BOILERPLATE =
  "לא נמצאו כרגע דיווחים על אירוע פוליטי, הפגנה או אירוע חריג באזור ובשעות המתוכננות. מומלץ לבצע בדיקה חוזרת סמוך ליציאה.";

// Required exact-meaning disclaimer for every restaurant that is NOT fully vegan.
const NOT_FULLY_VEGAN =
  "לא מסעדה טבעונית לחלוטין. יש לוודא את נושא אלרגיית החלב והימנעות מזיהום צולב ישירות מול הצוות לפני ההזמנה.";

// ─── Itinerary ────────────────────────────────────────────────────────────────
const DAYS: {
  day: number; date: string; dayLabel: string; title: string; subtitle: string;
  color: string; bg: string;
  noamHighlight: string; maayanHighlight: string; familyHighlight: string;
  events: Event[];
  summary: DaySummary;
}[] = [
  // ── DAY 1 — Mon Sept 7 ───────────────────────────────────────────────────
  {
    day: 1,
    date: "ספטמבר 7, 2026 · יום שני",
    dayLabel: "יום ראשון",
    title: "יום הגעה — יום קל, בלי לחץ",
    subtitle: "טיסת לילה כמעט ללא שינה + צ'ק אין רק ב-14:00 → יום הכי קל בטיול, בכוונה",
    color: "#7c3aed",
    bg: "#f5f3ff",
    noamHighlight: "סמטאות העיר העתיקה ליד המלון — כבר בתוך אווירת הארי פוטר",
    maayanHighlight: "חומות העיר בשקיעה — נקודת צילום רגועה לסיום היום",
    familyHighlight: "אין שום צורך להספיק הרבה — Avalon נמצא בלב העיר העתיקה, הכל בהישג יד",
    events: [
      {
        time: "07:05",
        label: "נחיתה — Diagoras Airport, Rhodes",
        detail: "RHO · המלון עצמו נמצא בלב העיר העתיקה, לא ב'עיר החדשה' — מונית ישירה",
        icon: Plane, type: "flight",
        tags: ["הגעה"],
        cost: "€27–35 מונית (מחיר רשמי מהשדה, מאומת בחיפוש עדכני)",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Rhodes+Airport+Diagoras",
        travelTime: "כ-25 דקות מונית לעיר העתיקה",
        distancePrev: "—", duration: "—",
        noamScore: 5, maayanScore: 6, familyScore: 7,
        allergyRating: "safe", veganAvailable: true,
        noamNote: "הרגע הראשון ברודוס — ים כחול מהחלון",
        maayanNote: "מסע מתחיל! ציפייה לטווסים ולקניות",
        tip: "מוניות רשמיות כחולות-כהות עם גג לבן, בתחנה הרשמית מחוץ ליציאה. בקיץ לפעמים גובים €30–40 — בקשו מונה או מחיר קבוע מראש.",
      },
      {
        time: "07:45",
        label: "Avalon Boutique Hotel — השארת מזוודות",
        detail: "המלון בלב העיר העתיקה, ממש ליד ארמון הגרנד מאסטר · אין צ'ק אין מוקדם — השאירו מזוודות בקבלה",
        icon: Hotel, type: "hotel",
        tags: ["עיר עתיקה", "הכנה"],
        cost: "כלול",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Avalon+Boutique+Hotel+Rhodes",
        travelTime: "יעד מרכזי לכל שאר היום",
        distancePrev: "מהשדה — ~14 ק\"מ", duration: "10 דקות",
        noamScore: 5, maayanScore: 5, familyScore: 6,
        allergyRating: "safe", veganAvailable: true,
        tip: "בקשו early check-in בנימוס — לעיתים מאפשרים, אבל אל תסמכו על זה. המלון עצמו נמצא בתוך העיר העתיקה — כל מה שמתוכנן היום הוא הליכה של דקות ספורות.",
      },
      {
        time: "08:00",
        label: "שוטטות קלה בסמטאות העיר העתיקה",
        detail: "רחובות אבן מימי הביניים ממש ליד המלון — אין צורך להתרחק כלל. חלונות ראווה של ThriftIT (וינטג'/יד-שנייה) ו-Eclectia (בוטיק מקומי) בסביבה",
        icon: Camera, type: "activity",
        tags: ["Harry Potter", "וינטג'", "קרוב למלון", "ללא מאמץ"],
        cost: "חינם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Rhodes+Old+Town",
        travelTime: "0-5 דקות מהמלון",
        distancePrev: "צמוד למלון", duration: "כ-45 דקות, קצב חופשי",
        noamScore: 8, maayanScore: 7, familyScore: 8,
        allergyRating: "safe", veganAvailable: true,
        noamNote: "ThriftIT — חנות וינטג'/יד-שנייה עם פוטנציאל לפריטי Grunge, ממש בעיר העתיקה",
        maayanNote: "סמטאות אבן, חלונות ראווה — פתיחה רגועה ליום עם הרבה תמונות",
        harryPotter: true, wowLevel: 6, primaryFor: "family",
        tip: "בכוונה לא תכננו כאן כניסה בתשלום לשום אתר — רק הליכה חופשית. המטרה: להתרשם מהאזור, לא 'להספיק'.",
      },
      {
        time: "09:00",
        label: "ארוחת בוקר — ONO Vegan & Vegetarian",
        detail: "כמה דקות הליכה מ-Avalon · מסעדה צמחונית עם תפריט טבעוני מסומן בבירור, ידידותית לכשרות · פתוחה 9:00–22:30 (סגורה בימי א')",
        icon: Coffee, type: "food",
        tags: ["טבעוני מסומן", "קרוב למלון", "מטבח לא טבעוני בלעדי"],
        cost: "€8–12 לאדם (משוער)",
        cuisine: "צמחוני/טבעוני, ים-תיכוני", priceLevel: "€€",
        veganStatus: "מסעדה צמחונית (לא טבעונית בלעדית) — כל מנה מסומנת בבירור Vegan/Vegetarian בתפריט",
        allergyConfidence: "בינונית-גבוהה: תפריט מסומן ברור, אך לא אותר פרוטוקול רשמי למניעת זיהום צולב. יש לבקש מהצוות במפורש.",
        whySelected: "פתוחה בדיוק בשעה שצריך (9:00), הכי קרובה למלון, האפשרות המהימנה ביותר לבוקר הראשון אחרי טיסת לילה — משמשת כ'עוגן הבטיחות' של הטיול.",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=ONO+Vegan+Vegetarian+Restaurant+Rhodes",
        travelTime: "5 דקות הליכה",
        distancePrev: "כ-300 מ'", duration: "כ-45 דקות",
        noamScore: 7, maayanScore: 7, familyScore: 8,
        allergyRating: "ok", veganAvailable: true, veganFriendly: true,
        noamNote: "המטבח אינו טבעוני בלעדי — הזמינו רק מנות המסומנות Vegan בתפריט, וציינו לצוות במפורש 'severe dairy allergy, please avoid cross-contamination'",
        maayanNote: "שקשוקה טבעונית / פנקייק נוטלה טבעוני — אופציה טעימה לבוקר ראשון",
        tip: "לא מצאנו פרוטוקול רשמי ומאומת למניעת זיהום צולב — לכן זו לא 'אפשרות בטוחה' באופן מוחלט, אלא אפשרות טובה בתנאי שמבקשים במפורש זהירות. לא מסעדה טבעונית לחלוטין — יש לוודא את נושא האלרגיה לחלב וזיהום צולב ישירות מול הצוות לפני ההזמנה.",
        altOption: "Bon Bonheur (מאפייה, עיר עתיקה) — בייגל אבוקדו טבעוני, וופלים, דונאטס. לא מאפייה טבעונית ייעודית — יש לוודא היעדר חלב בכל פריט ספציפי מול הצוות לפני הזמנה.",
      },
      {
        time: "10:15",
        label: "Sakellaridis Music Shop — לנועם",
        detail: "Museum Square 9, בעיר העתיקה · חנות כלי נגינה ותיקה (פועלת מ-1947) · מאומתת בחיפוש עדכני",
        icon: Guitar, type: "shopping",
        tags: ["מוזיקה", "לנועם", "מאומת"],
        cost: "חינם (כניסה/הצצה)",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Sakellaridis+Music+Shop+Museum+Square+Rhodes",
        travelTime: "5 דקות הליכה",
        distancePrev: "כ-350 מ'", duration: "10–15 דקות",
        noamScore: 9, maayanScore: 3, familyScore: 5,
        allergyRating: "safe", veganAvailable: true,
        noamNote: "חנות מוזיקה אמיתית ומאומתת בעיר העתיקה, לא סתם המלצה כללית — שווה הצצה גם בלי לקנות",
        wowLevel: 7, primaryFor: "noam",
        tip: "לא בונים סביבה מסלול שלם — רק עצירה קצרה ואופציונלית בדרך.",
      },
      {
        time: "12:00",
        label: "ארוחת צהריים — Zaytouna (מטבח לבנוני)",
        detail: "רחוב סוקרטוס 42, על הרחוב הראשי של העיר העתיקה · מטבח לבנוני — פלאפל, חומוס, פיתות · חוויה שונה לגמרי מהבוקר",
        icon: Utensils, type: "food",
        tags: ["מטבח שונה", "רחוב ראשי", "ציינו אלרגיה"],
        cost: "€5–10 לאדם (משוער)",
        cuisine: "לבנוני", priceLevel: "€",
        veganStatus: "לא מסעדה טבעונית ייעודית — אך רוב המנות העיקריות (פלאפל, חומוס, פיתה) טבעוניות מטבען. לא אותר תיעוד רשמי לגבי אלרגיה לחלב.",
        allergyConfidence: "בינונית: המנות עצמן נטולות חלב באופן טבעי, אך אין מידע מאומת על זיהום צולב במטבח. יש לציין אלרגיה חמורה במפורש ולבקש הכנה נפרדת.",
        whySelected: "ממש על הרחוב שכבר משוטטים בו (סוקרטוס), מטבח שונה לגמרי מהבוקר הטבעוני-ים-תיכוני — הזדמנות לגיוון אמיתי בלי לסטות מהמסלול.",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Zaytouna+Rhodes+Sokratous",
        travelTime: "8 דקות הליכה",
        distancePrev: "כ-500 מ'", duration: "כ-30 דקות",
        noamScore: 6, maayanScore: 7, familyScore: 7,
        allergyRating: "ok", veganAvailable: true,
        noamNote: "פלאפל וחומוס נטולי חלב מטבעם — אבל בקשו לוודא הכנה נפרדת בשל האלרגיה החמורה",
        tip: "ארוחה קלה-בינונית בכוונה — לא ארוחה מלאה מדי, כי הבוקר כבר היה מלא. שומרים כוחות למחר. לא מסעדה טבעונית — ודאו את נושא האלרגיה לחלב וזיהום צולב ישירות מול הצוות.",
        altOption: "RuBisCo (מיצים/סמוזי, אותו רחוב) — בקשו קערת אסאי/סמוזי עם חלב שקדים בלבד, ללא דבש וללא אבקת חלבון מי גבינה. גם כאן לא מסעדה טבעונית מלאה.",
      },
      {
        time: "14:00",
        label: "צ'ק אין — Avalon",
        detail: "פתחו את החדר · מנוחה קצרה אחרי לילה כמעט ללא שינה",
        icon: Hotel, type: "hotel",
        tags: ["הוזמן"],
        cost: "כלול",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Avalon+Boutique+Hotel+Rhodes",
        travelTime: "המלון",
        distancePrev: "—", duration: "—",
        noamScore: 5, maayanScore: 5, familyScore: 6,
        allergyRating: "safe", veganAvailable: true,
      },
      {
        time: "15:00",
        label: "מנוחה חופשית במלון",
        detail: "בכוונה אין כאן שום תוכנית — מנוחה אמיתית לפני שממשיכים",
        icon: Moon, type: "rest",
        tags: ["חובה", "מנוחה"],
        cost: null,
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Avalon+Boutique+Hotel+Rhodes",
        travelTime: "המלון",
        distancePrev: "—", duration: "כ-2 שעות",
        noamScore: 4, maayanScore: 4, familyScore: 6,
        allergyRating: "safe", veganAvailable: true,
      },
      {
        time: "17:30",
        label: "חומות העיר העתיקה — הליכה קלה בשקיעה",
        detail: "Old Town Walls · נוף פנורמי לים · טיול קצר וקל בלבד — כמבוקש ליום הראשון",
        icon: Camera, type: "activity",
        tags: ["Photography", "נוף", "Sunset", "קצר וקל"],
        cost: "€6 לאדם (משוער)",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Rhodes+Old+Town+Walls",
        travelTime: "2 דקות הליכה",
        distancePrev: "כ-150 מ'", duration: "כ-45 דקות, הליכה שטוחה וקלה",
        noamScore: 8, maayanScore: 9, familyScore: 9,
        allergyRating: "safe", veganAvailable: true,
        noamNote: "נוף רגוע לפני הלילה — אווירה שקטה",
        maayanNote: "Golden hour photography — תמונות יפות בלי מאמץ",
        wow: true, wowLevel: 8, primaryFor: "maayan",
        tip: "הליכה שטוחה לגמרי, בלי מדרגות משמעותיות. אם מרגישים עייפים — אפשר לוותר על זה בלי לפספס הרבה.",
      },
      {
        time: "19:30",
        label: "ארוחת ערב — ONO (שוב, בכוונה מפורשת)",
        detail: "יום ראשון עייף — חוזרים למקום מוכר ובטוח שכבר ביקרתם בו הבוקר, במקום להתנסות במסעדה חדשה ובלתי מוכרת בלילה הראשון",
        icon: Utensils, type: "food",
        tags: ["חזרה מוצדקת", "5 דק' מהמלון"],
        cost: "€10–15 לאדם (משוער)",
        cuisine: "צמחוני/טבעוני, ים-תיכוני", priceLevel: "€€",
        veganStatus: "מסעדה צמחונית עם מנות טבעוניות מסומנות בבירור (לא טבעונית בלעדית)",
        allergyConfidence: "בינונית-גבוהה — כבר ביקרתם שם הבוקר, הצוות מכיר את הבקשה, פחות אי-ודאות מניסיון במקום חדש",
        whySelected: "חזרה מכוונת, לא חוסר יצירתיות: יום ראשון עם לילה כמעט ללא שינה הוא לא הזמן לנסות מקום לא מוכר. עדיפות מוצהרת לוודאות על פני גיוון בלילה הזה בלבד.",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=ONO+Vegan+Vegetarian+Restaurant+Rhodes",
        travelTime: "5 דקות הליכה",
        distancePrev: "כ-300 מ'", duration: "כ-1 שעה",
        noamScore: 7, maayanScore: 6, familyScore: 8,
        allergyRating: "ok", veganAvailable: true, veganFriendly: true,
        tip: "הזמינו שוב רק מנות מסומנות Vegan וציינו את האלרגיה. לא מסעדה טבעונית לחלוטין — ודאו זיהום צולב מול הצוות. עדיפות לפשטות ולוודאות ביום הכי עייף של הטיול.",
        altOption: "Archipelagos (כיכר היפוקרטס, כ-6 דק') — תפריט עם מנות טבעוניות/צמחוניות/ללא גלוטן מסומנות, נוף לחומות ולכיכר. גם כאן לא מסעדה טבעונית — ודאו אלרגיה מול הצוות.",
      },
    ],
    summary: {
      safety: "🟢",
      safetyNote: SAFETY_BOILERPLATE + " יוון נמצאת ברמת התראה מוגברת עבור ישראלים (בעיקר סביב הפגנות ואזורי חיי לילה) — לא רלוונטי למסלול המשפחתי השקט הזה, אך כדאי להיות מודעים ולהימנע מלענוד סמלים ישראליים/יהודיים בולטים בציבור.",
      foodSafety: "🟡",
      walkingComfort: "🟢",
      wow: 6,
      value: 8,
      noamWillLove: "חנות המוזיקה הוותיקה והסמטאות שכבר מרגישות כמו הארי פוטר",
      maayanWillLove: "השקיעה מהחומות וחלונות הראווה בעיר העתיקה",
    },
  },

  // ── DAY 2 — Tue Sept 8 ───────────────────────────────────────────────────
  {
    day: 2,
    date: "ספטמבר 8, 2026 · יום שלישי",
    dayLabel: "יום שני",
    title: "Lindos — יום ה-WOW",
    subtitle: "אקרופוליס, מפרץ כחול, סמטאות לבנות, ארוחת ערב בעיר העתיקה",
    color: "#0284c7",
    bg: "#f0f9ff",
    noamHighlight: "Acropolis — היסטוריה, נוף, תחושת מבצר עתיק",
    maayanHighlight: "St Paul's Bay + סמטאות Lindos — צילום, מים טורקיז",
    familyHighlight: "אפשר לדלג על הטיפוס באקרופוליס עם רכיבת חמור מסורתית",
    events: [
      {
        time: "07:45",
        label: "ארוחת בוקר — במלון (Avalon)",
        detail: "ארוחת בוקר כלולה במלון עצמו · אפשרויות צמחוניות/טבעוניות לפי המלון · הכי הגיוני לפני יציאה מוקדמת ל-Lindos — אין צורך לצאת ולחזור",
        icon: Coffee, type: "food",
        tags: ["כלול במלון", "לא יוצאים", "ציינו אלרגיה"],
        cost: "כלול בהזמנה",
        cuisine: "ארוחת בוקר יוונית/בופה", priceLevel: "€",
        veganStatus: "לא מסעדה טבעונית — לפי מידע כללי על המלון יש אפשרויות צמחוניות/טבעוניות/מקומיות בארוחת הבוקר, אך לא אותר תיעוד ספציפי לגבי אלרגיית חלב.",
        allergyConfidence: "לא ידועה במדויק — יש לדבר עם צוות המלון מראש (אפילו בערב הקודם) ולבקש לוודא אפשרויות נטולות חלב וזיהום צולב לפני הבוקר.",
        whySelected: "יום עם יציאה מוקדמת (08:30) ל-Lindos — אכילה במלון עצמו חוסכת זמן וגם מוסיפה גיוון אמיתי: חוויה שונה מכל הארוחות האחרות בטיול.",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Avalon+Boutique+Hotel+Rhodes",
        travelTime: "המלון עצמו",
        distancePrev: "—", duration: "כ-30 דקות",
        noamScore: 5, maayanScore: 5, familyScore: 6,
        allergyRating: "ask", veganAvailable: true,
        noamNote: "דברו עם צוות המלון על האלרגיה מראש — רצוי כבר בערב הקודם, לא רק בבוקר",
        tip: "לא בדקנו פרוטוקול אלרגיה ספציפי מול המלון — זו הזדמנות טובה לשאול בקבלה כבר ביום ההגעה, כדי לדעת מה אפשרי לפני הבוקר הזה.",
        altOption: "אם מעדיפים לצאת: ONO (5 דק' מהמלון, פותח 9:00 — אך זה יאחר את האוטובוס של 08:30, אז זה בעיקר גיבוי אם משנים שעת יציאה).",
      },
      {
        time: "08:30",
        label: "נסיעה ל-Lindos",
        detail: "אוטובוס 015 מהתחנה המרכזית · מחיר מאומת: €5.50 לנפש · יציאות תכופות מהבוקר",
        icon: MapPin, type: "transport",
        tags: ["€5.50 מאומת", "כ-50 ק\"מ"],
        cost: "€5.50 לאדם (מאומת) / מונית ~€35–40 (משוער)",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Lindos+Rhodes+Greece",
        travelTime: "כ-45–55 דקות, תלוי בתנועה",
        distancePrev: "מהמלון לתחנה המרכזית — 10 דק' הליכה", duration: "כ-50 דקות נסיעה",
        transportOption: "אוטובוס KTEL קו 015 (זול וקבוע) או מונית פרטית (גמיש יותר בשעות)",
        noamScore: 6, maayanScore: 6, familyScore: 7,
        allergyRating: "safe", veganAvailable: true,
        tip: "יציאות בערך: 08:00, 09:00, 09:30... קחו מים ובדקו לוח זמנים עדכני ב-ktelrodou.gr לפני היציאה.",
      },
      {
        time: "09:30",
        label: "Acropolis of Lindos",
        detail: "עלייה לאקרופוליס · נוף פנורמי עצור נשימה · ילדים עד 18 (לא-אזרחי האיחוד האירופי) חינם בהצגת דרכון",
        icon: Compass, type: "activity",
        tags: ["WOW", "ילדים חינם", "יש אפשרות בלי טיפוס"],
        cost: "€6 לאדם (משוער) · ילדים עד 18 חינם (לאמת בקופה עם דרכון)",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Acropolis+of+Lindos",
        travelTime: "55 דק' מ-Avalon",
        distancePrev: "בכניסה לכפר Lindos", duration: "כ-1.5 שעות",
        transportOption: "עלייה ברגל (מדרגות אבן, כ-10 דקות טיפוס מתון) או רכיבת חמור ממרכז הכפר — מסורת מקומית, אופציה קלה יותר לילדות שלא רוצות לטפס",
        altOption: "לילדות שמעדיפות לא לטפס כלל: רכיבת חמורים עד קרוב לפסגה",
        noamScore: 10, maayanScore: 8, familyScore: 10,
        allergyRating: "safe", veganAvailable: true,
        noamNote: "היסטוריה עתיקה + נוף = חוויה שמרגישה כמו טירת פנטזיה",
        maayanNote: "נוף עצום, תמונות מרשימות · ואם לא בא כוח לטפס — יש חמורים",
        wow: true, wowLevel: 10, primaryFor: "noam",
        tip: "הגיעו לפני 10:00 — פחות קהל. אין הרבה צל, קחו כובע ומים.",
      },
      {
        time: "11:00",
        label: "St Paul's Bay",
        detail: "מפרץ קדוש · מים טורקיז שקופים · שחייה בבוקר, ללא הליכה משמעותית",
        icon: Sun, type: "activity",
        tags: ["חינם", "שחייה", "Photography"],
        cost: "חינם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=St+Paul's+Bay+Lindos",
        travelTime: "2 דקות מהאקרופוליס",
        distancePrev: "כ-400 מ'", duration: "כ-1 שעה",
        noamScore: 8, maayanScore: 9, familyScore: 10,
        allergyRating: "safe", veganAvailable: true,
        noamNote: "מים שקטים, נוף לאקרופוליס — אווירה מיוחדת",
        maayanNote: "מים כחולים שקופים — מהיפים באי",
        wow: true, wowLevel: 9, primaryFor: "family",
        tip: "הכי יפה בשעות הבוקר — מים שקטים לפני שמתמלא.",
      },
      {
        time: "12:00",
        label: "סמטאות Lindos הלבנות",
        detail: "בתים לבנים, חנויות מקומיות, תכשיטים — ייחודי לגמרי, הליכה שטוחה בתוך הכפר",
        icon: Camera, type: "activity",
        tags: ["Photography", "קניות", "ללא מאמץ"],
        cost: "חינם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Lindos+village+white+streets",
        travelTime: "בתוך כפר לינדוס",
        distancePrev: "צמוד", duration: "כ-1 שעה",
        noamScore: 7, maayanScore: 10, familyScore: 8,
        allergyRating: "safe", veganAvailable: true,
        maayanNote: "בתים לבנים = תמונות מושלמות. יש גם כמה חנויות תכשיטים ואופנה קטנות",
        primaryFor: "maayan",
      },
      {
        time: "13:30",
        label: "ארוחת צהריים — T-Veg",
        detail: "מסעדה טבעונית 100% ב-Lindos · גג עם נוף לאקרופוליס ולמפרץ · בדרך כלל פתוחה 9:00–15:00 בימות חול (ערב רק שישי-שבת בהזמנה) — הכי בטוח מבחינת האלרגיה כי כל המטבח טבעוני",
        icon: Utensils, type: "food",
        tags: ["טבעוני 100%", "Rooftop", "נוף WOW"],
        cost: "€10–15 לאדם (משוער)",
        cuisine: "טבעוני, גריל/בורגרים/סלטים", priceLevel: "€€",
        veganStatus: "100% טבעוני — כל המטבח, לא רק חלק מהתפריט",
        allergyConfidence: "גבוהה: מטבח טבעוני מלא — אין מוצרי חלב בבניין כלל. עדיין מומלץ לציין אלרגיה חמורה במפורש (יתכן שימוש בחמאה טבעונית/אגוזים שדורש תשומת לב לרגישויות אחרות).",
        whySelected: "אנחנו פיזית ב-Lindos באותו רגע, המסעדה בתוך הכפר עצמו (לא דורשת נסיעה נוספת), ו-100% טבעונית — השילוב הכי בטוח וגיאוגרפית הגיוני בכל הטיול.",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=T-Veg+Lindos+Rhodes",
        travelTime: "בתוך כפר לינדוס",
        distancePrev: "כ-200 מ'", duration: "כ-1 שעה",
        noamScore: 8, maayanScore: 8, familyScore: 9,
        allergyRating: "safe", veganAvailable: true, veganFriendly: true,
        noamNote: "מטבח טבעוני מלא — הכי פשוט ובטוח לאלרגיה שנמצא בכל המסלול",
        maayanNote: "לאכול על גג עם נוף לים — חוויה מיוחדת",
        wow: true, wowLevel: 8,
        tip: "מקום קטן ומבוקש בעונה — אם אפשר, התקשרו/הודיעו מראש שמגיעים.",
        altOption: "Kalypso Roof Garden — נוף מרשים לא פחות לאקרופוליס, אך אינה מסעדה טבעונית מלאה (יש גם בשר/דגים בתפריט) — רק כגיבוי אם T-Veg סגורה, וחובה לציין אלרגיה חמורה במפורש.",
      },
      {
        time: "16:30",
        label: "חזרה לרודוס",
        detail: "אוטובוס 015 חזרה",
        icon: MapPin, type: "transport",
        tags: ["€5.50"],
        cost: "€5.50 לאדם (מאומת)",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Lindos+bus+stop",
        travelTime: "כ-50 דקות",
        distancePrev: "—", duration: "כ-50 דקות",
        noamScore: 4, maayanScore: 4, familyScore: 5,
        allergyRating: "safe", veganAvailable: true,
      },
      {
        time: "19:00",
        label: "הליכת ערב — עיר עתיקה",
        detail: "Old Town · תאורת לילה · ממש ליד המלון, בלי צורך בתחבורה",
        icon: Moon, type: "activity",
        tags: ["חינם", "Photography", "קרוב למלון"],
        cost: "חינם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Rhodes+Old+Town+evening",
        travelTime: "2 דקות מ-Avalon",
        distancePrev: "מהתחנה המרכזית — 10 דק'", duration: "כ-45 דקות",
        noamScore: 9, maayanScore: 8, familyScore: 9,
        allergyRating: "safe", veganAvailable: true,
        noamNote: "תאורת פנסים על האבנים בלילה — אווירה מיוחדת",
        maayanNote: "תמונות לילה, חנויות פתוחות",
        harryPotter: true, wow: true, wowLevel: 8,
      },
      {
        time: "20:30",
        label: "ארוחת ערב — Marco Polo Mansion",
        detail: "מתחם ארמון עות'מאני מהמאה ה-15, חצר פנימית שקטה בעיר העתיקה · מסעדה מיוחדת ורומנטית, מטבח ים-תיכוני-פיוז'ן · חובה הזמנה מראש",
        icon: Utensils, type: "food",
        tags: ["מיוחד", "הזמינו מראש בהחלט", "ציינו אלרגיה"],
        cost: "€25–40 לאדם (משוער — מסעדת יוקרה)",
        cuisine: "ים-תיכוני / פיוז'ן, Fine Dining", priceLevel: "€€€",
        veganStatus: "לא מסעדה טבעונית — לפי מידע כללי 'יכולה להתאים' לטבעונים/צמחונים/ללא גלוטן, אך לא אותר תיעוד ספציפי על אופן הטיפול באלרגיית חלב.",
        allergyConfidence: "נמוכה-בינונית: הצהרה כללית על גמישות בתפריט, לא פרוטוקול אלרגיה מפורט. " + NOT_FULLY_VEGAN,
        whySelected: "יום ה-WOW של הטיול — זו ההזדמנות המתבקשת לארוחת הערב ה'מיוחדת' שביקשתם: חצר היסטורית, אווירה שונה לגמרי מכל ארוחה אחרת. חובה להזמין מראש (המקום ידוע כמלא כמעט תמיד).",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Marco+Polo+Mansion+Restaurant+Rhodes",
        travelTime: "8 דקות מ-Avalon",
        distancePrev: "כ-500 מ'", duration: "כ-1.5 שעות",
        noamScore: 7, maayanScore: 7, familyScore: 8,
        allergyRating: "ask", veganAvailable: true,
        noamNote: "אווירה של ארמון עתיק — מתאים לתחושת הפנטזיה, אך לא מותאם ספציפית לאלרגיה כמו T-Veg",
        maayanNote: "חצר קסומה, תאורה יפה — מקום שווה לתמונות ולזיכרון",
        wow: true, wowLevel: 9,
        tip: "הזמינו מראש (טלפונית) לפחות יום-יומיים מראש — המקום מתמלא. בעת ההזמנה ציינו במפורש 'severe dairy allergy' ובקשו לוודא עם השף לפני ההגעה, לא רק בשולחן.",
        altOption: "Archipelagos (כיכר היפוקרטס, כ-6 דק' מהמלון) — לא דורש הזמנה קפדנית כמו Marco Polo, תפריט עם מנות טבעוניות/צמחוניות/ללא גלוטן מסומנות, נוף לחומות העיר העתיקה. גם כאן — " + NOT_FULLY_VEGAN,
      },
    ],
    summary: {
      safety: "🟢",
      safetyNote: SAFETY_BOILERPLATE,
      foodSafety: "🟡",
      walkingComfort: "🟡",
      wow: 9,
      value: 8,
      noamWillLove: "האקרופוליס עם תחושת המבצר העתיק והנוף המדהים",
      maayanWillLove: "המים הטורקיז של מפרץ פאולוס הקדוש והסמטאות הלבנות",
    },
  },

  // ── DAY 3 — Wed Sept 9 ───────────────────────────────────────────────────
  {
    day: 3,
    date: "ספטמבר 9, 2026 · יום רביעי",
    dayLabel: "יום שלישי",
    title: "תרבות, טווסים וכוכבים",
    subtitle: "Filerimos, ארמון האבירים, Knights Street, Profitis Ilias בלילה",
    color: "#16a34a",
    bg: "#f0fdf4",
    noamHighlight: "ארמון הגרנד מאסטר + לילה אסטרונומי ב-Profitis Ilias",
    maayanHighlight: "Filerimos — טווסים חופשיים, מאומת ואמיתי!",
    familyHighlight: "ארמון הגרנד מאסטר ורחוב האבירים ממש ליד המלון",
    events: [
      {
        time: "08:30",
        label: "ארוחת בוקר — Old Town Corner Bakery",
        detail: "מאפייה בעיר העתיקה, כמה דקות מ-Avalon · קולוֹרי (בייגל שומשום), חומוס, טוסט גבינה טבעונית · בוקר קליל ושונה לפני יום עמוס",
        icon: Coffee, type: "food",
        tags: ["מאפייה", "מטבח שונה", "ציינו אלרגיה"],
        cost: "€4–8 לאדם (משוער)",
        cuisine: "מאפייה יוונית + פריטים טבעוניים", priceLevel: "€",
        veganStatus: "לא מאפייה טבעונית ייעודית — יש כמה פריטים טבעוניים מזוהים (קולוֹרי, חומוס, טוסט 'גבינה' טבעונית), לא כל התפריט.",
        allergyConfidence: "בינונית: הפריטים הטבעוניים ידועים, אך אין מידע מאומת על זיהום צולב במאפייה. " + NOT_FULLY_VEGAN,
        whySelected: "בוקר קליל ושונה מהותית מהבוקר הכבד יותר של יום 1 — מאפייה במקום מסעדה, קרוב לחלוטין למלון, ומכין לפני יום ארוך (Filerimos + ארמון + פרופיטיס אליאס בלילה).",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Old+Town+Corner+Bakery+Rhodes",
        travelTime: "5 דקות הליכה",
        distancePrev: "כ-300 מ'", duration: "כ-30 דקות",
        noamScore: 6, maayanScore: 6, familyScore: 7,
        allergyRating: "ok", veganAvailable: true,
        noamNote: "בקשו לוודא איזה פריטים באמת נטולי חלב — לא כל המאפייה טבעונית",
        maayanNote: "וופל/גלידת סורבה טבעונית אפשרית בהמשך הרחוב ב-Waffle Art אם בא כוח למתוק",
        altOption: "ONO (5 דק' מהמלון) — מוכר ובטוח מיום 1, גיבוי אמין אם המאפייה לא מתאימה או סגורה.",
      },
      {
        time: "09:30",
        label: "Filerimos — מנזר, טווסים ונוף",
        detail: "כ-14 ק\"מ · מונית ~€12–15 (משוער) · מנזר מהמאה ה-14 · טווסים הולכים חופשי בשביל — מאומת בחיפוש עדכני, לא סיפור עירוני",
        icon: Compass, type: "activity",
        tags: ["WOW", "בעלי חיים — מאומת", "טווסים!"],
        cost: "€3 כניסה (משוער) · €12–15 מונית הלוך (משוער)",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Filerimos+Rhodes+Greece",
        travelTime: "20 דקות מונית",
        distancePrev: "מהמלון — 14 ק\"מ", duration: "כ-1.5 שעות",
        noamScore: 7, maayanScore: 10, familyScore: 9,
        allergyRating: "safe", veganAvailable: true,
        noamNote: "מנזר היסטורי מרשים + נוף לכל האי",
        maayanNote: "טווסים הולכים חופשי בשביל — לא אגדה, מאומת בביקורות עדכניות. מעיין תשגע!",
        wow: true, wowLevel: 9, primaryFor: "maayan",
        tip: "הטווסים מסתובבים חופשי בשביל! הגיעו ב-09:30 לפני החום. השביל שטוח ונגיש, בלי טיפוס.",
      },
      {
        time: "13:00",
        label: "ארוחת צהריים — PITAFAN (גיירוס טבעוני)",
        detail: "חזרה לעיר העתיקה, לכיוון הנמל · גיירוס/פיתה טבעונית אמיתית בתפריט · פתוח ג'-א' 11:30–24:00 (סגור בימי ב')",
        icon: Utensils, type: "food",
        tags: ["מטבח שונה", "סטריט פוד", "ציינו אלרגיה"],
        cost: "€6–10 לאדם (משוער)",
        cuisine: "יווני — גיירוס/פיתה, סטריט פוד", priceLevel: "€",
        veganStatus: "לא מסעדה טבעונית — אך יש אפשרות גיירוס טבעוני מפורשת בתפריט (לא רק סלט בלי בשר)",
        allergyConfidence: "בינונית: יש אפשרות טבעונית מוגדרת, אך לא אותר מידע על זיהום צולב במטבח משותף לבשר/חלב. " + NOT_FULLY_VEGAN,
        whySelected: "חוזרים לעיר העתיקה מפילרימוס בכל מקרה — זו הזדמנות לחוויה שלישית שונה (סטריט פוד יווני) אחרי צמחוני-ים-תיכוני (יום 1) ולבנוני (יום 1). קרוב למלון, בדרך הטבעית בחזרה.",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Pitafan+Yeeros+Rhodes+Old+Town",
        travelTime: "5 דקות מ-Avalon",
        distancePrev: "מפילרימוס — 20 דק' מונית", duration: "כ-30 דקות",
        noamScore: 7, maayanScore: 7, familyScore: 7,
        allergyRating: "ok", veganAvailable: true,
        noamNote: "בקשו לוודא שהגריל של הגיירוס הטבעוני נפרד מהבשר/הרטבים עם חלב",
        maayanNote: "חוויית 'סטריט פוד' יווני אמיתי — שונה מכל ארוחה קודמת בטיול",
        altOption: "ONO (5 דק' מהמלון) — מוכר ובטוח, גיבוי קבוע. אפשרות נוספת לחוויה מיוחדת: Annie's Vegan Food & Bar (Pop-up, 100% טבעוני), פתוחה בדרך כלל בימי ד' 11:00–15:00 לפי המידע שמצאנו — אך זה Pop-up שדורש הזמנה מראש בוואטסאפ ולא מאומת שעדיין פעיל בקיץ 2026.",
      },
      {
        time: "14:30",
        label: "Palace of the Grand Master",
        detail: "ארמון הגרנד מאסטר · ממש בעיר העתיקה, כמה דקות מ-Avalon · ילדים עד 18 (לא-אזרחי האיחוד האירופי) חינם בהצגת דרכון",
        icon: BookOpen, type: "activity",
        tags: ["WOW", "Harry Potter", "ילדים חינם", "צמוד למלון"],
        cost: "€8 לאדם (משוער) · ילדים עד 18 חינם (לאמת בקופה עם דרכון)",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Palace+of+the+Grand+Master+Rhodes",
        travelTime: "2 דקות הליכה מ-Avalon",
        distancePrev: "כ-150 מ'", duration: "כ-1.5 שעות",
        noamScore: 10, maayanScore: 7, familyScore: 9,
        allergyRating: "safe", veganAvailable: true,
        noamNote: "מסדרונות אבן ארוכים, חדרי אבן — אווירת טירה עתיקה מלאה",
        maayanNote: "ארמון ציורי, תמונות יפות",
        harryPotter: true, wow: true, wowLevel: 9, primaryFor: "noam",
        tip: "נועם ומעיין חינם עם דרכון! זה כמעט חצר אחורית של המלון — אין צורך בתכנון נסיעה.",
      },
      {
        time: "16:00",
        label: "Street of the Knights",
        detail: "הרחוב ההיסטורי של אבירי יוחנן · אבן עתיקה · ממש ליד ארמון הגרנד מאסטר",
        icon: Compass, type: "activity",
        tags: ["חינם", "Harry Potter", "צמוד למלון"],
        cost: "חינם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Street+of+the+Knights+Rhodes",
        travelTime: "מיד ליד ארמון הגרנד מאסטר",
        distancePrev: "צמוד", duration: "כ-30 דקות",
        noamScore: 9, maayanScore: 8, familyScore: 9,
        allergyRating: "safe", veganAvailable: true,
        noamNote: "צלמו בכניסות הסמטאות — האבן העתיקה מרגישה קולנועית",
        harryPotter: true, wow: true, wowLevel: 8,
      },
      {
        time: "17:00",
        label: "מנוחה במלון — הכנה ללילה הגדול",
        detail: "17:00–19:00 · חיוני לפני Profitis Ilias · הורידו Stellarium עכשיו",
        icon: Moon, type: "rest",
        tags: ["חשוב", "הכנה"],
        cost: null,
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Avalon+Boutique+Hotel+Rhodes",
        travelTime: "המלון",
        distancePrev: "—", duration: "כ-2 שעות",
        noamScore: 6, maayanScore: 5, familyScore: 6,
        allergyRating: "safe", veganAvailable: true,
        noamNote: "הורד Stellarium עכשיו! תכנן מה תחפש בשמיים",
        astronomy: true,
        tip: "הורידו Stellarium (חינם), SkySafari, Sky Guide עכשיו — בפסגה קליטה חלשה!",
      },
      {
        time: "19:30",
        label: "ארוחת ערב — ONO (חזרה מוצדקת שלישית)",
        detail: "ארוחה קלה וממוקדת לפני נסיעת הלילה ל-Profitis Ilias — לא זמן לנסות מקום לא מוכר",
        icon: Utensils, type: "food",
        tags: ["מהיר ובטוח", "5 דק' מהמלון"],
        cost: "€8–12 לאדם (משוער)",
        cuisine: "צמחוני/טבעוני, ים-תיכוני", priceLevel: "€€",
        veganStatus: "מסעדה צמחונית עם מנות טבעוניות מסומנות (לא טבעונית בלעדית)",
        allergyConfidence: "בינונית-גבוהה — מקום מוכר ובטוח מהביקורים הקודמים בטיול",
        whySelected: "לפני נסיעת לילה של 45 דקות להר — הערב הזה דורש ודאות ומהירות, לא ניסוי. זו הפעם השלישית והאחרונה שחוזרים לכאן בכוונה, ומכאן ואילך אין עוד חזרות בטיול.",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=ONO+Vegan+Vegetarian+Restaurant+Rhodes",
        travelTime: "5 דקות הליכה",
        distancePrev: "כ-300 מ'", duration: "כ-45 דקות",
        noamScore: 7, maayanScore: 7, familyScore: 8,
        allergyRating: "ok", veganAvailable: true, veganFriendly: true,
        noamNote: "ארוחה קלה לפני הכוכבים — לא כבדה מדי. " + NOT_FULLY_VEGAN,
        altOption: "RuBisCo (מיצים/סמוזי, כ-8 דק') — אם רוצים משהו קליל וממש מהיר במקום ארוחה מלאה. גם כאן לא מטבח טבעוני בלעדי.",
      },
      {
        time: "21:00",
        label: "יציאה ל-Profitis Ilias",
        detail: "מונית מ-Avalon · גובה 798 מ'",
        icon: Navigation, type: "transport",
        tags: ["Astronomy", "לילה", "הזמינו מונית מראש"],
        cost: "€20–25 מונית (משוער) הלוך",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Profitis+Ilias+Rhodes",
        travelTime: "45 דקות",
        distancePrev: "—", duration: "45 דקות נסיעה",
        transportOption: "מונית פרטית מוזמנת מראש — מומלץ להזמין גם את הנסיעה חזרה מראש, לא לסמוך על מציאת מונית באתר בלילה",
        safetyNote: "לא אותר מידע ספציפי המצביע על בעיה בטיחותית באתר עצמו. בכל זאת: הזמינו מונית הלוך-חזור מראש, ודאו טלפון טעון וכיסוי סלולרי, ואל תתפצלו כקבוצה.",
        noamScore: 9, maayanScore: 7, familyScore: 8,
        allergyRating: "safe", veganAvailable: true,
        astronomy: true,
        tip: "קחו: סוודר, מים, פנס ראש, טלפון מלא. בלילה בהר קריר!",
      },
      {
        time: "21:45",
        label: "Profitis Ilias — ספירת כוכבים",
        detail: "798 מטר · Milky Way גלוי · אפלה יחסית · אין אורות עיר קרובים",
        icon: Telescope, type: "activity",
        tags: ["Astronomy", "WOW", "Milky Way", "נועם-highlight"],
        cost: "חינם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Profitis+Ilias+summit+Rhodes",
        travelTime: "798 מ' גובה",
        distancePrev: "—", duration: "כ-1.5 שעות",
        safetyNote: "כמו בכל אתר מבודד בלילה — לא מומלץ להישאר לבד או להתרחק מהקבוצה. אין תאורת רחוב באתר, הביאו פנס.",
        noamScore: 10, maayanScore: 8, familyScore: 10,
        allergyRating: "safe", veganAvailable: true,
        noamNote: "ASTRONOMY WOW! Milky Way בעין רגילה. חוויה שתישאר כל החיים",
        maayanNote: "כוכבים יפים ביחד עם המשפחה בחושך — מרגש",
        astronomy: true, wow: true, wowLevel: 10, profitisIlias: true, primaryFor: "noam",
        tip: "הורד Stellarium מראש · ספטמבר = Milky Way בשיא. תנו לעיניים 20 דק' להתרגל.",
      },
      {
        time: "23:45",
        label: "חזרה למלון",
        detail: "מונית חזרה ל-Avalon (מוזמנת מראש)",
        icon: Hotel, type: "transport",
        tags: ["לילה", "מונית מוזמנת מראש"],
        cost: "€20–25 מונית (משוער)",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Avalon+Boutique+Hotel+Rhodes",
        travelTime: "45 דקות",
        distancePrev: "—", duration: "45 דקות",
        noamScore: 4, maayanScore: 4, familyScore: 5,
        allergyRating: "safe", veganAvailable: true,
      },
    ],
    summary: {
      safety: "🟢",
      safetyNote: SAFETY_BOILERPLATE + " נסיעת הלילה להר מחייבת מונית מוזמנת מראש הלוך וחזור.",
      foodSafety: "🟡",
      walkingComfort: "🟢",
      wow: 9,
      value: 7,
      noamWillLove: "מסדרונות ארמון הגרנד מאסטר ולילה עם שביל החלב בפרופיטיס אליאס",
      maayanWillLove: "הטווסים החופשיים בפילרימוס",
    },
  },

  // ── DAY 4 — Thu Sept 10 ──────────────────────────────────────────────────
  {
    day: 4,
    date: "ספטמבר 10, 2026 · יום חמישי",
    dayLabel: "יום רביעי",
    title: "יום עזיבה — קניות וטיסה",
    subtitle: "בוקר קניות, ארוחה אחרונה, טיסה הביתה. לא ישנים בלילה של ה-10.",
    color: "#ca8a04",
    bg: "#fef9ec",
    noamHighlight: "ThriftIT (ליד המלון) + חנויות Grunge ב'עיר החדשה'",
    maayanHighlight: "Zara, Bershka, Stradivarius — K-Pop fashion haul",
    familyHighlight: "בוקר אחרון במאפייה חדשה + ארוחת פרידה ב-Rustico — עוד שתי חוויות שלא היו בטיול",
    events: [
      {
        time: "08:30",
        label: "ארוחת בוקר — Bon Bonheur",
        detail: "מאפייה בעיר העתיקה, כמה דקות מ-Avalon · בייגל אבוקדו טבעוני, וופלים, דונאטס · בוקר אחרון קליל ושונה",
        icon: Coffee, type: "food",
        tags: ["מאפייה", "מטבח שונה", "ציינו אלרגיה"],
        cost: "€5–9 לאדם (משוער)",
        cuisine: "מאפייה/בראנץ' מודרני", priceLevel: "€",
        veganStatus: "לא מאפייה טבעונית ייעודית — יש פריטים טבעוניים מזוהים (בייגל אבוקדו, ככל הנראה חלק מהוופלים/דונאטס), לא כל התפריט.",
        allergyConfidence: "בינונית: לא אותר תיעוד רשמי על זיהום צולב. " + NOT_FULLY_VEGAN,
        whySelected: "בוקר אחרון — הזדמנות לחוויה שונה מהמאפייה של יום 3 ומ-ONO, לפני יום קניות וטיסה. עדיין קרוב מאוד למלון.",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Bon+Bonheur+Rhodes",
        travelTime: "5 דקות הליכה",
        distancePrev: "כ-300 מ'", duration: "כ-45 דקות",
        noamScore: 6, maayanScore: 7, familyScore: 7,
        allergyRating: "ok", veganAvailable: true,
        maayanNote: "וופל אחרון! לשמור זיכרון",
        altOption: "ONO (5 דק' מהמלון) — האפשרות הכי מוכרת ובטוחה, אם מעדיפים ודאות ביום הטיסה.",
      },
      {
        time: "09:30",
        label: "קניות — Zara, Bershka, Pull&Bear, Stradivarius",
        detail: "כולן ב'עיר החדשה' סביב Mandraki · הליכה ~15–20 דקות מהעיר העתיקה (המלון), או מונית קצרה · Y2K + Grunge + K-Pop",
        icon: ShoppingBag, type: "shopping",
        tags: ["Y2K", "Grunge", "K-Pop Fashion"],
        cost: "לפי קניות",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Mandraki+shopping+Rhodes",
        travelTime: "15–20 דקות הליכה מ-Avalon (העיר החדשה) או מונית קצרה €6–8 (משוער)",
        distancePrev: "כ-1.3 ק\"מ", duration: "כ-2 שעות",
        noamScore: 7, maayanScore: 10, familyScore: 8,
        allergyRating: "safe", veganAvailable: true,
        noamNote: "Grunge + Rock aesthetic בBershka/Pull&Bear — בדוק T-shirts",
        maayanNote: "K-Pop fashion HAUL! Zara + Stradivarius = paradise",
        kpop: true, wowLevel: 6, primaryFor: "maayan",
        altOption: "קרוב יותר למלון, בלי לנסוע כלל: ThriftIT (וינטג'/יד-שנייה, Grunge) ו-Eclectia (בוטיק מקומי) בעיר העתיקה עצמה",
        tip: "Zara → Bershka → Pull&Bear → Stradivarius — כולן קרובות זו לזו ב'עיר החדשה'.",
      },
      {
        time: "11:30",
        label: "ארוחת צהריים — Rustico",
        detail: "עיר עתיקה, פטיו חיצוני · תפריט צמחוני נפרד עם כמות הגונה של אפשרויות טבעוניות · ארוחה אחרונה לפני החזרה למלון ולשדה",
        icon: Utensils, type: "food",
        tags: ["מטבח שונה", "פטיו", "ציינו אלרגיה"],
        cost: "€10–16 לאדם (משוער)",
        cuisine: "ים-תיכוני/איטלקי, פטיו חיצוני", priceLevel: "€€",
        veganStatus: "לא מסעדה טבעונית — תפריט צמחוני נפרד עם 'כמות הגונה' של אפשרויות טבעוניות (לפי ביקורות), אין אימות פרטני מעבר לכך.",
        allergyConfidence: "בינונית: אין מידע מאומת על פרוטוקול זיהום צולב. " + NOT_FULLY_VEGAN,
        whySelected: "לא אותרה מסעדה טבעונית/ידידותית מאומתת ליד אזור הקניות ב'עיר החדשה' (Mandraki) — לכן חוזרים לעיר העתיקה לארוחה האחרונה, במקום להתפשר על בטיחות האלרגיה. Rustico שונה מכל מסעדה קודמת בטיול (פטיו איטלקי-ים-תיכוני).",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Rustico+Restaurant+Rhodes+Old+Town",
        travelTime: "5 דקות מ-Avalon",
        distancePrev: "מ'עיר החדשה' — 15-20 דק'", duration: "כ-45 דקות",
        noamScore: 6, maayanScore: 6, familyScore: 7,
        allergyRating: "ok", veganAvailable: true,
        noamNote: "ארוחה אחרונה לפני הטיסה — לא הזמן להסתכן, ודאו אלרגיה במפורש",
        altOption: "ONO (5 דק' מהמלון) — האפשרות הכי מוכרת ובטוחה בטיול, גיבוי מומלץ ביום הטיסה עצמו.",
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
        distancePrev: "—", duration: "20 דקות",
        noamScore: 3, maayanScore: 4, familyScore: 4,
        allergyRating: "safe", veganAvailable: true,
        tip: "בקשו late checkout — לפעמים מאפשרים עד 13:00",
      },
      {
        time: "12:40",
        label: "מונית לשדה התעופה",
        detail: "מ-Avalon (עיר עתיקה) ל-Diagoras Airport",
        icon: Navigation, type: "transport",
        tags: ["חשוב", "מאומת"],
        cost: "€27–35 מונית (מחיר רשמי מהשדה, מאומת)",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Rhodes+Airport+Diagoras",
        travelTime: "כ-25 דקות",
        distancePrev: "כ-14 ק\"מ", duration: "25 דקות",
        noamScore: 3, maayanScore: 3, familyScore: 4,
        allergyRating: "safe", veganAvailable: true,
        tip: "הזמינו מונית דרך קבלת המלון מראש! ודאו מונה או מחיר קבוע.",
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
        distancePrev: "—", duration: "—",
        noamScore: 6, maayanScore: 7, familyScore: 7,
        allergyRating: "safe", veganAvailable: true,
        noamNote: "כבר מתכנן לאן לצפות בכוכבים בפעם הבאה",
        maayanNote: "כבר מתכננת K-Pop tour לסיאול",
      },
    ],
    summary: {
      safety: "🟢",
      safetyNote: SAFETY_BOILERPLATE,
      foodSafety: "🟡",
      walkingComfort: "🟢",
      wow: 6,
      value: 7,
      noamWillLove: "חיפוש פריטי Grunge/Rock ב-ThriftIT ובחנויות הרשת",
      maayanWillLove: "האולינג של האופנה ב-Zara/Stradivarius/Bershka",
    },
  },
];

// ─── Discovery data ────────────────────────────────────────────────────────────
const MUSIC_DISCOVERY = [
  { name: "Sakellaridis Music Shop", type: "guitar", note: "כלי נגינה, פועלת מ-1947 · Museum Square 9, עיר עתיקה · מאומת בחיפוש עדכני", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Sakellaridis+Music+Shop+Rhodes", noamScore: 9 },
  { name: "Karavellakis Music House", type: "store", note: "כלי נגינה ואביזרים ברודוס, מ-1974 · מיקום המדויק לא אומת במלואו — כדאי לבדוק לפני הליכה ייעודית", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Karavellakis+Music+House+Rhodes", noamScore: 7 },
  { name: "מוזיקאי רחוב בעיר העתיקה", type: "live", note: "בערבי קיץ אפשר להיתקל במוזיקאי רחוב בסמטאות — לא מובטח, תלוי מזל וזמן", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Rhodes+Old+Town+street+music", noamScore: 6 },
];

const ANIMAL_DISCOVERY = [
  { name: "Filerimos Peacocks",      note: "טווסים חופשיים בשביל המנזר — מאומת בביקורות עדכניות, לא רק סיפור",         mapsUrl: "https://www.google.com/maps/search/?api=1&query=Filerimos+Rhodes+Greece",          maayanScore: 10 },
  { name: "Valley of the Butterflies", note: "אלפי פרפרים · כ-25 ק\"מ מרודוס · עונתי (בעיקר יולי-ספטמבר, כדאי לוודא)",      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Valley+of+the+Butterflies+Rhodes",  maayanScore: 9  },
  { name: "Kallithea Springs",       note: "ים שקוף + דגים לצד ספינות טבילה",                       mapsUrl: "https://www.google.com/maps/search/?api=1&query=Kallithea+Springs+Rhodes",          maayanScore: 8  },
  { name: "Donkey Rides (Lindos)",   note: "חמורים בלינדוס — מסורת מקומית, גם אלטרנטיבה לטיפוס לאקרופוליס",      mapsUrl: "https://www.google.com/maps/search/?api=1&query=donkey+rides+Lindos+Rhodes",        maayanScore: 9  },
];

const SHOPPING_DISCOVERY = [
  // Old Town — steps from Avalon, verified
  { name: "ThriftIT",   style: "וינטג' / יד-שנייה + Grunge", area: "עיר עתיקה — ליד המלון", distance: "5 דק'",  noamScore: 9, maayanScore: 6, mapsUrl: "https://www.google.com/maps/search/?api=1&query=ThriftIT+Rhodes" },
  { name: "Eclectia",   style: "בוטיק מקומי, סגנון ייחודי",   area: "עיר עתיקה — ליד המלון", distance: "5 דק'",  noamScore: 6, maayanScore: 7, mapsUrl: "https://www.google.com/maps/search/?api=1&query=Eclectia+Rhodes" },
  // New Town — a real walk or short taxi from Avalon
  { name: "Zara",            style: "Y2K Fashion",        area: "עיר חדשה — Mandraki",   distance: "15–18 דק'",  noamScore: 6, maayanScore: 9,  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Zara+Rhodes+Greece" },
  { name: "Bershka",         style: "Y2K + Grunge",       area: "עיר חדשה — Mandraki",   distance: "15–18 דק'",  noamScore: 8, maayanScore: 8,  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Bershka+Rhodes+Greece" },
  { name: "Pull&Bear",       style: "Grunge + Street",    area: "עיר חדשה — Mandraki",   distance: "15–18 דק'",  noamScore: 9, maayanScore: 7,  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Pull+Bear+Rhodes+Greece" },
  { name: "Stradivarius",    style: "Y2K + Boho",         area: "עיר חדשה — Mandraki",   distance: "18–20 דק'", noamScore: 5, maayanScore: 10, mapsUrl: "https://www.google.com/maps/search/?api=1&query=Stradivarius+Rhodes+Greece" },
  { name: "H&M",             style: "Y2K Budget",         area: "עיר חדשה — Mandraki",   distance: "15 דק'",  noamScore: 5, maayanScore: 8,  mapsUrl: "https://www.google.com/maps/search/?api=1&query=HM+Rhodes+Greece" },
];

// ─── Hero images ──────────────────────────────────────────────────────────────
// Default image per event type
const TYPE_IMAGE: Record<string, string> = {
  flight:    "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=70",
  hotel:     "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=70",
  food:      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=70",
  activity:  "https://images.unsplash.com/photo-1485872299829-c673f5194813?auto=format&fit=crop&w=800&q=70",
  shopping:  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=70",
  transport: "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&w=800&q=70",
  rest:      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=70",
};

// Per-event overrides — keyed by event label (partial match via startsWith)
const EVENT_IMAGE_OVERRIDES: Record<string, string> = {
  "נחיתה":                   "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=70",
  "Avalon Boutique Hotel":   "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=70",
  "ONO":                     "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=70",
  "שוטטות":                  "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=70",
  "חומות העיר העתיקה":       "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=70",
  "RuBisCo":                 "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=70",
  "Sakellaridis":            "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=800&q=70",
  "Lindos":                  "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=70",
  "Acropolis of Lindos":     "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=70",
  "St Paul's Bay":           "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=70",
  "T-Veg":                   "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=70",
  "פילרימוס":                "https://images.unsplash.com/photo-1557683311-eac922347aa1?auto=format&fit=crop&w=800&q=70",
  "Filerimos":                "https://images.unsplash.com/photo-1557683311-eac922347aa1?auto=format&fit=crop&w=800&q=70",
  "Palace of the Grand Master": "https://images.unsplash.com/photo-1569587112025-0d460e81a126?auto=format&fit=crop&w=800&q=70",
  "Street of the Knights":  "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=70",
  "Profitis Ilias":          "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=800&q=70",
  "קניות — Zara":            "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=70",
};

function getEventImage(label: string, type: string): string {
  const override = Object.keys(EVENT_IMAGE_OVERRIDES).find(key => label.includes(key));
  return override ? EVENT_IMAGE_OVERRIDES[override] : (TYPE_IMAGE[type] ?? TYPE_IMAGE.activity);
}

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
    safe: { label: "✓ מטבח טבעוני מלא", color: "#15803d", bg: "#f0fdf4" },
    ok:   { label: "⚠ ציינו אלרגיה + בקשו זהירות", color: "#b45309", bg: "#fef9ec" },
    ask:  { label: "✗ לא מאומת כבטוח — שאלו לפני", color: "#dc2626", bg: "#fef2f2" },
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
  const hasExtra = e.tip || e.noamNote || e.maayanNote || e.altOption || e.safetyNote || e.transportOption || e.duration || e.distancePrev;

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

        {/* Hero image */}
        {e.type !== "rest" && e.type !== "transport" && (
          <div style={{ position: "relative", height: 140, overflow: "hidden", background: "#f5f5f5" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getEventImage(e.label as string, e.type as string)}
              alt={e.label as string}
              loading="lazy"
              onError={(ev) => { (ev.target as HTMLImageElement).style.display = "none"; }}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            {/* Gradient overlay for readability */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55) 100%)",
            }} />
            {/* Time chip on image */}
            <div style={{
              position: "absolute", top: 10, right: 10,
              background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
              borderRadius: 10, padding: "3px 8px",
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{e.time}</span>
            </div>
            {/* Type icon on image */}
            <div style={{
              position: "absolute", bottom: 10, left: 10,
              background: s.bg, borderRadius: 10, padding: "4px 8px",
              display: "flex", alignItems: "center", gap: 4,
            }}>
              <Icon style={{ width: 14, height: 14, color: s.color }} />
            </div>
          </div>
        )}

        <div className="p-3">
          <div className="flex items-start gap-2.5">
            {/* Icon — only shown for rest/transport (no hero) */}
            {(e.type === "rest" || e.type === "transport") && (
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: s.bg }}>
                <Icon className="h-5 w-5" style={{ color: s.color }} />
              </div>
            )}

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

              {/* Allergy — only meaningful for food events */}
              {e.type === "food" && e.allergyRating && (
                <div className="mt-2">
                  <AllergyBadge rating={e.allergyRating} />
                </div>
              )}

              {/* Restaurant info block — cuisine, vegan status, price, why here */}
              {e.type === "food" && (e.cuisine || e.veganStatus || e.priceLevel || e.whySelected) && (
                <div className="mt-2 rounded-xl p-2.5 space-y-1.5" style={{ background: "#fafafa" }}>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {e.cuisine && (
                      <span className="rounded-full px-2 py-0.5" style={{ fontSize: 10, fontWeight: 700, background: "#fff", border: "1px solid #e5e5e5", color: "#525252" }}>
                        {e.cuisine}
                      </span>
                    )}
                    {e.priceLevel && (
                      <span className="rounded-full px-2 py-0.5" style={{ fontSize: 10, fontWeight: 700, background: "#fff", border: "1px solid #e5e5e5", color: "#525252" }}>
                        {e.priceLevel}
                      </span>
                    )}
                  </div>
                  {e.veganStatus && (
                    <p style={{ fontSize: 11, color: "#15803d", lineHeight: 1.5 }}><strong>מעמד טבעוני:</strong> {e.veganStatus}</p>
                  )}
                  {e.allergyConfidence && (
                    <p style={{ fontSize: 11, color: "#b45309", lineHeight: 1.5 }}><strong>ביטחון לגבי האלרגיה:</strong> {e.allergyConfidence}</p>
                  )}
                  {e.whySelected && (
                    <p style={{ fontSize: 11, color: "#525252", lineHeight: 1.5 }}><strong>למה כאן:</strong> {e.whySelected}</p>
                  )}
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
                  {(e.duration || e.distancePrev) && (
                    <div className="flex flex-wrap items-center gap-3 rounded-xl p-2.5" style={{ background: "#fafafa" }}>
                      {e.duration && (
                        <div className="flex items-center gap-1.5">
                          <Hourglass className="h-3.5 w-3.5" style={{ color: "#737373" }} />
                          <span style={{ fontSize: 11, color: "#525252" }}>משך: {e.duration}</span>
                        </div>
                      )}
                      {e.distancePrev && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" style={{ color: "#737373" }} />
                          <span style={{ fontSize: 11, color: "#525252" }}>מרחק מהקודם: {e.distancePrev}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {e.transportOption && (
                    <div className="flex items-start gap-2 rounded-xl p-2.5" style={{ background: "#fff7ed" }}>
                      <Navigation className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" style={{ color: "#c2410c" }} />
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#c2410c", marginBottom: 2 }}>אפשרות תחבורה</p>
                        <span style={{ fontSize: 12, color: "#9a3412", lineHeight: 1.5 }}>{e.transportOption}</span>
                      </div>
                    </div>
                  )}
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
                  {e.altOption && (
                    <div className="flex items-start gap-2 rounded-xl p-2.5" style={{ background: "#f0f9ff" }}>
                      <RefreshCw className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" style={{ color: "#0284c7" }} />
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#0284c7", marginBottom: 2 }}>{e.type === "food" ? "מסעדת גיבוי" : "אפשרות חלופית"}</p>
                        <span style={{ fontSize: 12, color: "#075985", lineHeight: 1.5 }}>{e.altOption}</span>
                      </div>
                    </div>
                  )}
                  {e.safetyNote && (
                    <div className="flex items-start gap-2 rounded-xl p-2.5" style={{ background: "#fef2f2" }}>
                      <ShieldAlert className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" style={{ color: "#dc2626" }} />
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#dc2626", marginBottom: 2 }}>הערת בטיחות</p>
                        <span style={{ fontSize: 12, color: "#991b1b", lineHeight: 1.5 }}>{e.safetyNote}</span>
                      </div>
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

// ─── Day summary card ──────────────────────────────────────────────────────────
function DaySummaryCard({ summary }: { summary: DaySummary }) {
  const statusRow = (icon: string, label: string, value: string) => (
    <div className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid #f8f8f8" }}>
      <span style={{ fontSize: 13, color: "#525252" }}>{icon} {label}</span>
      <span style={{ fontSize: 15 }}>{value}</span>
    </div>
  );
  return (
    <div className="rounded-2xl p-4" style={{ border: "1px solid #f0f0f0", background: "#fff" }}>
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck className="h-4 w-4" style={{ color: "#171717" }} />
        <span style={{ fontSize: 14, fontWeight: 800, color: "#171717" }}>סיכום היום</span>
      </div>
      {statusRow("", "סטטוס בטיחות", summary.safety)}
      {statusRow("", "Food Safety", summary.foodSafety)}
      {statusRow("", "Walking Comfort", summary.walkingComfort)}
      <div className="py-2 space-y-1.5" style={{ borderBottom: "1px solid #f8f8f8" }}>
        <ScoreBar score={summary.wow}   color="#ca8a04" label="WOW" />
        <ScoreBar score={summary.value} color="#16a34a" label="שווה כסף" />
      </div>
      <div className="pt-2 space-y-1.5">
        <p style={{ fontSize: 12, color: "#7c3aed" }}><strong>נועם צפויה לאהוב:</strong> {summary.noamWillLove}</p>
        <p style={{ fontSize: 12, color: "#ec4899" }}><strong>מעיין צפויה לאהוב:</strong> {summary.maayanWillLove}</p>
      </div>
      <div className="mt-3 flex items-start gap-2 rounded-xl p-2.5" style={{ background: "#fafafa" }}>
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" style={{ color: "#737373" }} />
        <span style={{ fontSize: 11, color: "#737373", lineHeight: 1.5 }}>{summary.safetyNote}</span>
      </div>
    </div>
  );
}

// ─── Trip safety banner ────────────────────────────────────────────────────────
function TripSafetyBanner() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(v => !v)}
        className="flex w-full cursor-pointer items-center justify-between rounded-2xl p-4"
        style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: "#fee2e2" }}>
            <ShieldAlert className="h-5 w-5" style={{ color: "#dc2626" }} />
          </div>
          <div className="text-right">
            <p style={{ fontSize: 15, fontWeight: 800, color: "#171717" }}>בטיחות — מה שמצאנו, נכון לתחילת אוגוסט 2026</p>
            <p style={{ fontSize: 12, color: "#991b1b" }}>לא "בטוח לחלוטין" — יש להיות מודעים ולבדוק שוב לפני הטיסה</p>
          </div>
        </div>
        {open ? <ChevronUp className="h-5 w-5 flex-shrink-0" style={{ color: "#991b1b" }} />
               : <ChevronDown className="h-5 w-5 flex-shrink-0" style={{ color: "#991b1b" }} />}
      </button>
      {open && (
        <div className="mt-2 space-y-2 rounded-2xl p-4" style={{ background: "#fff", border: "1px solid #fecaca" }}>
          <p style={{ fontSize: 13, color: "#171717", lineHeight: 1.6 }}>
            במהלך אוגוסט 2026 פרסם משרד החוץ הישראלי התרעה לישראלים ביוון לקראת הפגנות אנטי-ישראליות ברחבי המדינה, כולל המלצה לשמור על פרופיל נמוך, להימנע מסמלים ישראליים/יהודיים בולטים, ולהתרחק מהפגנות והתקהלויות. יוון מדורגת ברמת התראה 2 מתוך 4 (&quot;אמצעי זהירות מוגברים&quot;) עבור ישראלים.
          </p>
          <p style={{ fontSize: 13, color: "#171717", lineHeight: 1.6 }}>
            ברודוס עצמה תועדו בעבר הפגנות אנטי-ישראליות (בעיקר בזיקה לעגינת ספינות שיוט ישראליות בנמל) וכן אירוע תקיפה חד-פעמי שדווח כנגד קבוצת בני נוער ישראלים ליד מועדון לילה בשעות הלילה המאוחרות.
          </p>
          <div className="rounded-xl p-3" style={{ background: "#f0fdf4" }}>
            <p style={{ fontSize: 12, color: "#15803d", lineHeight: 1.6 }}>
              <strong>למה זה פחות רלוונטי למסלול הזה:</strong> המסלול שלנו הוא משפחתי, יומי, בלי חיי לילה ובלי אזור הנמל בשעות עגינת ספינות. עדיין — מומלץ: לא לענוד תכשיטים/סמלים ישראליים בולטים בציבור, להימנע מכל הפגנה או התקהלות פוליטית גם מסקרנות, ולעקוב אחר עדכוני משרד החוץ סמוך ליציאה.
            </p>
          </div>
          <p style={{ fontSize: 11, color: "#a3a3a3", lineHeight: 1.5 }}>
            מקור: התרעות והכתבות פורסמו סביב 9–10 באוגוסט 2026. המידע עלול להשתנות — יש לבדוק שוב קרוב לתאריך הטיסה (7 בספטמבר 2026).
          </p>
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
            <p style={{ fontSize: 12, color: "#78716c" }}>גיטרות · כלי נגינה · מאומת בחיפוש עדכני</p>
          </div>
        </div>
        {open ? <ChevronUp className="h-5 w-5 flex-shrink-0" style={{ color: "#78716c" }} />
               : <ChevronDown className="h-5 w-5 flex-shrink-0" style={{ color: "#78716c" }} />}
      </button>

      {open && (
        <div className="mt-2 space-y-2 rounded-2xl p-4" style={{ background: "#1c1917", border: "1px solid #292524" }}>
          <div className="rounded-xl p-3 mb-3" style={{ background: "#7c3aed22", border: "1px solid #7c3aed44" }}>
            <p style={{ fontSize: 12, color: "#c4b5fd" }}>
              <strong style={{ color: "#a78bfa" }}>לנועם:</strong> לא אותרה חנות תקליטים (Vinyl) מאומתת ברודוס בחיפוש שביצענו — יש דיווח לא-מאומת ברשתות חברתיות על חנות בשם &quot;Rhodes Vinyl&quot;, אך לא הצלחנו לאשר מיקום או שעות פעילות. כדאי לשאול בקבלת המלון או לחפש בזמן הטיול עצמו.
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
            <p style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>בעלי חיים וטבע ברודוס — למעיין</p>
            <p style={{ fontSize: 12, color: "#166534" }}>טווסים · פרפרים · חוויות טבע נגישות</p>
          </div>
        </div>
        {open ? <ChevronUp className="h-5 w-5 flex-shrink-0" style={{ color: "#166534" }} />
               : <ChevronDown className="h-5 w-5 flex-shrink-0" style={{ color: "#166534" }} />}
      </button>

      {open && (
        <div className="mt-2 space-y-2 rounded-2xl p-4" style={{ background: "#052e16", border: "1px solid #14532d" }}>
          <div className="rounded-xl p-3 mb-1" style={{ background: "#166534" }}>
            <p style={{ fontSize: 12, color: "#bbf7d0", lineHeight: 1.6 }}>
              🦕 <strong style={{ color: "#dcfce7" }}>דינוזאורים:</strong> בדקנו במיוחד — לא אותרה תערוכה, מוזיאון או פארק דינוזאורים איכותי ומאומת ברודוס לקיץ 2026. במקום להוסיף אטרקציה חלשה רק כדי &quot;לסמן V&quot;, בחרנו שלא לשלב את הנושא הזה במסלול. אם יתגלה מידע עדכני יותר לפני הטיול, אפשר להוסיף.
            </p>
          </div>
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
          <span style={{ fontSize: 17, fontWeight: 700, color: "#171717" }}>קניות — Y2K, Grunge, K-Pop, Vintage</span>
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
            { t: "798 מ' גובה", d: "מעל האוויר העכור — שמיים צלולים יחסית. Milky Way נראה בעין רגילה." },
            { t: "מעט אורות סביב", d: "אין ריכוז עירוני גדול בפסגה עצמה." },
            { t: "אוויר ים נקי", d: "רוחות ים מנקות האווירה — שקיפות אסטרונומית טובה בספטמבר." },
            { t: "קל להגיע", d: "מונית מרודוס — 45 דקות. ללא ציוד מיוחד, אך מומלץ להזמין מונית הלוך-חזור מראש." },
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

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function PlannerPage() {
  const [activeDay, setActiveDay] = useState(0);
  const day = DAYS[activeDay];

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Rubik', system-ui, sans-serif" }}>
      <div className="mx-auto max-w-2xl px-4 pb-36 pt-10 space-y-6 md:max-w-3xl">

        {/* Header */}
        <div>
          <p style={{ fontSize: 15, color: "#a3a3a3", marginBottom: 4 }}>Avalon Boutique Hotel · עיר עתיקה, רודוס · ספטמבר 2026</p>
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
                <span style={{ fontSize: 10, fontWeight: 700, color: "#991b1b" }}>אלרגיה חמורה לחלב — עדיפות עליונה, הימנעות מזיהום צולב</span>
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
                <span style={{ fontSize: 10, fontWeight: 700, color: "#92400e" }}>רגישות קלה לאבק · לא מסכנת חיים</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trip-wide safety banner */}
        <TripSafetyBanner />

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

        {/* Day summary */}
        <DaySummaryCard summary={day.summary} />

        {/* Discovery sections */}
        <AstronomySection />
        <MusicDiscovery />
        <AnimalDiscovery />
        <ShoppingDiscovery />

      </div>
    </div>
  );
}
