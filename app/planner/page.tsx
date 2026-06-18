"use client";

import { useState } from "react";
import {
  Plane, Hotel, Utensils, Compass, Camera, ShoppingBag,
  Star, Moon, Sun, Coffee, MapPin, Navigation,
  Clock, AlertCircle, Leaf, Music, BookOpen, Telescope,
  Tag, ChevronDown, ChevronUp, ExternalLink, Sparkles,
  Eye, DollarSign,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
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
  familyFit?: string;
  daughtersWillLove?: string;
  wowScore?: number;
  valueScore?: number;
  allergyRating?: "safe" | "ok" | "ask";
  veganAvailable?: boolean;
  tip?: string;
  wow?: boolean;
  harryPotter?: boolean;
  kpop?: boolean;
  astronomy?: boolean;
  veganFriendly?: boolean;
  profitisIlias?: boolean;
}

// ─── Itinerary data ───────────────────────────────────────────────────────────
const DAYS: { day: number; date: string; dayLabel: string; title: string; subtitle: string; color: string; bg: string; events: Event[] }[] = [
  {
    day: 1,
    date: "ספטמבר 7, 2026",
    dayLabel: "יום ראשון",
    title: "יום הגעה — התאקלמות",
    subtitle: "טיסה מוקדמת, עיר עתיקה בסיוב, ארוחת ערב טבעונית",
    color: "#7c3aed",
    bg: "#f5f3ff",
    events: [
      {
        time: "05:20",
        label: "טיסה מ-TLV",
        detail: "TLV → RHO · הגיעו לשדה תעופה שעה לפני",
        icon: Plane,
        type: "flight",
        tags: ["חובה"],
        cost: "כלול בתקציב",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Ben+Gurion+Airport+Tel+Aviv",
        travelTime: "שדה תעופה",
        wowScore: 6,
        valueScore: 9,
        allergyRating: "safe",
        veganAvailable: true,
        tip: "צ'ק אין אונליין ב-6 ספטמבר! תרופות אלרגיה בתיק יד.",
        daughtersWillLove: "ההתרגשות של הטיסה — תחילת ההרפתקה!",
      },
      {
        time: "07:05",
        label: "נחיתה — Diagoras Airport, Rhodes",
        detail: "נמל תעופה רודוס (RHO) · מונית לAvalom: ~€15, 20 דק'",
        icon: Plane,
        type: "flight",
        tags: ["הגעה"],
        cost: "€15 מונית",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Rhodes+Airport+Diagoras",
        travelTime: "20 דקות לAvalon",
        wowScore: 5,
        valueScore: 8,
        allergyRating: "safe",
        veganAvailable: true,
        daughtersWillLove: "הים הכחול מהחלון ברגע הנחיתה",
      },
      {
        time: "08:30",
        label: "הגעה ל-Avalon · השארת מזוודות",
        detail: "הגיעו לAvalon לפני הצ'ק אין · השאירו מזוודות בקבלה",
        icon: Hotel,
        type: "hotel",
        tags: ["הכנה", "New Town"],
        cost: "כלול",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Avalon+Boutique+Hotel+Rhodes",
        travelTime: "נקודת ייחוס",
        wowScore: 7,
        valueScore: 9,
        allergyRating: "safe",
        veganAvailable: true,
        familyFit: "מלון בוטיק מרכזי — מרחק הליכה מכל האטרקציות",
        daughtersWillLove: "הסטייל של המלון, בריכה, אווירה יוונית",
        tip: "בקשו early check-in — לפעמים מאפשרים",
      },
      {
        time: "09:00",
        label: "ארוחת בוקר — Annie's Vegan Kitchen",
        detail: "3 דקות מAvalon · Açaí bowl, קפה, מאפים טבעוניים",
        icon: Coffee,
        type: "food",
        tags: ["טבעוני 100%", "3 דק' מהמלון"],
        cost: "₪40 לאדם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Annie's+Vegan+Kitchen+Rhodes",
        travelTime: "3 דקות הליכה",
        wowScore: 8,
        valueScore: 9,
        allergyRating: "safe",
        veganAvailable: true,
        veganFriendly: true,
        familyFit: "100% טבעוני · ללא מוצרי חלב בכלל · המקום הכי בטוח לאלרגיה",
        daughtersWillLove: "Açaí bowl צבעוני, smoothies טרופיים",
        tip: "בקשו את ה-Açaí bowl עם חלב שקדים — הכי טעים!",
      },
      {
        time: "10:00",
        label: "Medieval City of Rhodes — עיר ימי-הביניים",
        detail: "12 דקות מAvalon · שוטטו ברחובות האבן · Harry Potter atmosphere!",
        icon: Compass,
        type: "activity",
        tags: ["חינם", "Harry Potter vibes", "Photography"],
        cost: "חינם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Medieval+City+of+Rhodes",
        travelTime: "12 דקות הליכה",
        wowScore: 9,
        valueScore: 10,
        allergyRating: "safe",
        veganAvailable: true,
        familyFit: "רחובות אבן עתיקים — בדיוק כמו Diagon Alley. חינם לחלוטין.",
        daughtersWillLove: "הסמטאות הצרות, חנויות וינטאג', אווירת Harry Potter מלאה",
        harryPotter: true,
        wow: true,
        tip: "הכניסה לעיר העתיקה חינם. Knights Street — הרחוב הכי יפה.",
      },
      {
        time: "14:00",
        label: "צ'ק אין — Avalon Boutique Hotel",
        detail: "New Town · 3 לילות · פתחו את החדר, רחצה אחרי הטיסה",
        icon: Hotel,
        type: "hotel",
        tags: ["הוזמן", "New Town"],
        cost: "כלול",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Avalon+Boutique+Hotel+Rhodes",
        travelTime: "נקודת מוצא",
        wowScore: 7,
        valueScore: 9,
        allergyRating: "safe",
        veganAvailable: true,
        familyFit: "מלון נוח, מרכזי, מוזמן — מנוחה לפני הערב",
        daughtersWillLove: "לסדר את החדר, לצאת למרפסת, לנשום אוויר ים",
      },
      {
        time: "17:30",
        label: "הליכה על חומות העיר העתיקה",
        detail: "Old Town Walls · נוף לים מכל הצדדים · Photography spot",
        icon: Camera,
        type: "activity",
        tags: ["Photography", "נוף", "כניסה בתשלום"],
        cost: "€6 לאדם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Rhodes+Old+Town+Walls",
        travelTime: "12 דקות הליכה",
        wowScore: 9,
        valueScore: 8,
        allergyRating: "safe",
        veganAvailable: true,
        familyFit: "הליכה פנורמית על החומות ללא מדרגות קשות · נוף 360°",
        daughtersWillLove: "נוף לים, צילומים מהחומות, תאורת זהב לפנות ערב",
        wow: true,
        tip: "Golden hour = תאורה מושלמת לצילום",
      },
      {
        time: "19:30",
        label: "ארוחת ערב — T Veg",
        detail: "5 דקות מAvalon · Burger טבעוני, סלטים, תפריט מלא",
        icon: Utensils,
        type: "food",
        tags: ["טבעוני", "5 דק' מהמלון", "מחיר נגיש"],
        cost: "₪55 לאדם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=T+Veg+Rhodes",
        travelTime: "5 דקות הליכה",
        wowScore: 7,
        valueScore: 9,
        allergyRating: "safe",
        veganAvailable: true,
        veganFriendly: true,
        familyFit: "מסעדה טבעונית ידידותית לאלרגיה לחלב · תפריט שילדים אוהבים",
        daughtersWillLove: "Burgers טבעוניים, שייקים, אווירת קיץ",
      },
    ],
  },
  {
    day: 2,
    date: "ספטמבר 8, 2026",
    dayLabel: "יום שני",
    title: "Lindos — יום ה-WOW",
    subtitle: "אקרופוליס, מפרץ כחול, סמטאות לבנות, ארוחה עם נוף",
    color: "#0284c7",
    bg: "#f0f9ff",
    events: [
      {
        time: "08:30",
        label: "נסיעה ל-Lindos",
        detail: "אוטובוס 015 מהתחנה המרכזית · €3 לנפש · 55 דקות",
        icon: MapPin,
        type: "transport",
        tags: ["55 ק\"מ", "€3 באוטובוס"],
        cost: "€3 לאדם / €35 מונית",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Lindos+Rhodes+Greece",
        travelTime: "55 דקות",
        wowScore: 5,
        valueScore: 10,
        allergyRating: "safe",
        veganAvailable: true,
        familyFit: "אוטובוס נוח עם נוף לים לאורך כל הדרך",
        daughtersWillLove: "נוף לים מהאוטובוס, ציפייה ל-Lindos",
        tip: "אוטובוס 015 · יוצא כל שעה. קחו מים!",
      },
      {
        time: "09:30",
        label: "Acropolis of Lindos",
        detail: "עלייה לאקרופוליס · נוף פנורמי עצור נשימה · גרם מדרגות בינוני",
        icon: Compass,
        type: "activity",
        tags: ["WOW", "Photography", "היסטוריה"],
        cost: "€6 לאדם (ילדים עד 18 חינם)",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Acropolis+of+Lindos",
        travelTime: "55 דק' מAvalon",
        wowScore: 10,
        valueScore: 9,
        allergyRating: "safe",
        veganAvailable: true,
        familyFit: "ילדים עד 18 חינם! נוף מהיר שלא ישכחו לעולם",
        daughtersWillLove: "הנוף לים הכחול, הרגשה של מלכה על הגבעה, צילומים",
        wow: true,
        tip: "הגיעו לפני 10:00 — פחות קהל, פחות חום. הצל מועט!",
      },
      {
        time: "11:00",
        label: "St Paul's Bay — מפרץ אפוסטולוס פאולוס",
        detail: "מפרץ הגעה של פאולוס השליח · מים טורקיז שקופים · שקט ויפה",
        icon: Sun,
        type: "activity",
        tags: ["Photography", "מפרץ", "שחייה"],
        cost: "חינם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=St+Paul's+Bay+Lindos",
        travelTime: "2 דקות מהאקרופוליס",
        wowScore: 10,
        valueScore: 10,
        allergyRating: "safe",
        veganAvailable: true,
        familyFit: "מים שקטים, לא עמוק — מושלם לילדים. כניסה חינם.",
        daughtersWillLove: "מים כחולים שקופים, חול לבן, צילומים Instagram-perfect",
        wow: true,
        tip: "הכי יפה בשעות הבוקר — מים שקטים לפני הצהרון",
      },
      {
        time: "12:00",
        label: "סמטאות Lindos הלבנות",
        detail: "שוטטו בין הבתים הלבנים של לינדוס · חנויות מקומיות, מזכרות",
        icon: Camera,
        type: "activity",
        tags: ["Photography", "Y2K vibes", "חינם"],
        cost: "חינם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Lindos+village+white+streets",
        travelTime: "כפר לינדוס",
        wowScore: 8,
        valueScore: 10,
        allergyRating: "safe",
        veganAvailable: true,
        familyFit: "קסם של כפר לבן — צילומים מהממים ללא עלות",
        daughtersWillLove: "בתים לבנים עם פרחים, חנויות תכשיטים, vibes K-Pop",
        kpop: true,
        tip: "חנויות הוינטאג' — Y2K vibes אמיתיים לצד הים",
      },
      {
        time: "13:30",
        label: "ארוחת צהריים — Kalypso Roof Garden",
        detail: "נוף פנורמי לאקרופוליס ולים · תפריט מדיטרני · Rooftop מדהים",
        icon: Utensils,
        type: "food",
        tags: ["נוף WOW", "Rooftop", "מדיטרני"],
        cost: "₪90 לאדם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Kalypso+Restaurant+Lindos",
        travelTime: "כפר לינדוס",
        wowScore: 9,
        valueScore: 7,
        allergyRating: "ok",
        veganAvailable: true,
        veganFriendly: true,
        familyFit: "נוף לאקרופוליס תוך כדי אכילה — חוויה שלמה",
        daughtersWillLove: "לאכול על גג עם נוף לים, סלטים טריים, freshness יוונית",
        tip: "בקשו ישיבה בצד הים · ציינו אלרגיה לחלב בהזמנה",
      },
      {
        time: "16:30",
        label: "חזרה לרודוס",
        detail: "אוטובוס 015 חזרה לרודוס · 55 דקות",
        icon: MapPin,
        type: "transport",
        tags: ["€3"],
        cost: "€3 לאדם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Lindos+bus+stop+Rhodes",
        travelTime: "55 דקות",
        wowScore: 4,
        valueScore: 10,
        allergyRating: "safe",
        veganAvailable: true,
        daughtersWillLove: "נרדמות באוטובוס עם נוף לים",
      },
      {
        time: "19:00",
        label: "הליכת ערב — עיר עתיקה",
        detail: "Old Town Rhodes · תאורת לילה על האבנים · קסם ימי-ביניימי",
        icon: Moon,
        type: "activity",
        tags: ["חינם", "Harry Potter", "Photography"],
        cost: "חינם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Rhodes+Old+Town+evening",
        travelTime: "12 דקות מAvalon",
        wowScore: 9,
        valueScore: 10,
        allergyRating: "safe",
        veganAvailable: true,
        familyFit: "תאורת ערב על האבנות — Harry Potter atmosphere בשיאו",
        daughtersWillLove: "פנסי הרחוב, חנויות וינטאג', אווירת קסם בלילה",
        harryPotter: true,
        wow: true,
      },
      {
        time: "20:30",
        label: "ארוחת ערב — RuBisCo Fine Dining",
        detail: "15 דקות מAvalon · עיר עתיקה · Fine Dining — הזמינו מראש!",
        icon: Utensils,
        type: "food",
        tags: ["Fine Dining", "טבעוני", "הזמנה מראש"],
        cost: "₪160 לאדם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=RuBisCo+Restaurant+Rhodes",
        travelTime: "15 דקות מAvalon",
        wowScore: 9,
        valueScore: 7,
        allergyRating: "safe",
        veganAvailable: true,
        veganFriendly: true,
        familyFit: "ארוחת הגאלה — חוויה קולינרית ברמה גבוהה",
        daughtersWillLove: "Fine Dining experience, צלחות יפות, אווירה מיוחדת",
        tip: "הזמינו מקום יומיים מראש! ציינו אלרגיה לחלב.",
        wow: true,
      },
    ],
  },
  {
    day: 3,
    date: "ספטמבר 9, 2026",
    dayLabel: "יום שלישי",
    title: "תרבות, מנזרים וכוכבים",
    subtitle: "Filerimos, ארמון האבירים, Harry Potter streets, ספירת כוכבים בProfitis Ilias",
    color: "#16a34a",
    bg: "#f0fdf4",
    events: [
      {
        time: "08:30",
        label: "ארוחת בוקר / ברנץ' — Annie's Vegan Kitchen",
        detail: "3 דקות מAvalon · ארוחת בוקר מלאה לפני היום הגדול",
        icon: Coffee,
        type: "food",
        tags: ["טבעוני 100%", "3 דק' מהמלון"],
        cost: "₪40 לאדם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Annie's+Vegan+Kitchen+Rhodes",
        travelTime: "3 דקות הליכה",
        wowScore: 8,
        valueScore: 9,
        allergyRating: "safe",
        veganAvailable: true,
        veganFriendly: true,
        familyFit: "התחלת היום בצורה בטוחה לחלוטין מבחינת אלרגיה",
        daughtersWillLove: "Smoothie bowls, טוסט אבוקדו, בוקר רגוע לפני הטיול",
      },
      {
        time: "09:30",
        label: "Filerimos — מנזר, טווסים ונוף",
        detail: "14 ק\"מ מAvalon · מונית €12 · מנזר היסטורי + טווסים חיים + נוף לאי כולו",
        icon: Compass,
        type: "activity",
        tags: ["WOW", "Photography", "טבע", "היסטוריה"],
        cost: "€3 כניסה · €12 מונית הלוך",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Filerimos+Rhodes+Greece",
        travelTime: "20 דקות מונית",
        wowScore: 9,
        valueScore: 9,
        allergyRating: "safe",
        veganAvailable: true,
        familyFit: "ללא מאמץ פיזי · מסלול קל על הגבעה · ייחודי ולא צפוף",
        daughtersWillLove: "טווסים שהולכים חופשי (!) בשביל, נוף לכל האי, מנזר ציורי",
        wow: true,
        tip: "הטווסים מסתובבים חופשי בשביל! הגיעו ב-09:30 לפני החום.",
      },
      {
        time: "13:00",
        label: "ארוחת צהריים — Annie's Vegan Kitchen",
        detail: "חזרה לרודוס · 3 דקות מAvalon · המסעדה הטבעונית הטובה ביותר",
        icon: Utensils,
        type: "food",
        tags: ["טבעוני 100%", "קרוב"],
        cost: "₪45 לאדם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Annie's+Vegan+Kitchen+Rhodes",
        travelTime: "3 דקות מAvalon",
        wowScore: 8,
        valueScore: 9,
        allergyRating: "safe",
        veganAvailable: true,
        veganFriendly: true,
        familyFit: "בטוח לחלוטין לאלרגיה, מגוון, קרוב למלון",
        daughtersWillLove: "הזדמנות לנסות דברים חדשים מהתפריט",
      },
      {
        time: "14:30",
        label: "Palace of the Grand Master",
        detail: "ארמון הגרנד מאסטר · עיר עתיקה · 13 דקות מAvalon · Hogwarts ממש!",
        icon: BookOpen,
        type: "activity",
        tags: ["WOW", "Harry Potter", "היסטוריה", "Photography"],
        cost: "€8 לאדם (ילדים עד 18 חינם)",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Palace+of+the+Grand+Master+Rhodes",
        travelTime: "13 דקות הליכה",
        wowScore: 10,
        valueScore: 9,
        allergyRating: "safe",
        veganAvailable: true,
        familyFit: "ילדים עד 18 חינם! הארמון הכי מרשים ברודוס — בדיוק כמו Hogwarts Castle",
        daughtersWillLove: "מסדרונות ארוכים, חדרי אבן, אווירת Harry Potter מלאה",
        harryPotter: true,
        wow: true,
        tip: "הכי מרשים בשעות אחה\"צ — אור טבעי מהחלונות. ילדים חינם!",
      },
      {
        time: "16:00",
        label: "Street of the Knights — Diagon Alley",
        detail: "הרחוב ההיסטורי של אבירי יוחנן · אבן מדרכות עתיקה · HP vibes שלמים",
        icon: Compass,
        type: "activity",
        tags: ["חינם", "Harry Potter", "Photography"],
        cost: "חינם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Street+of+the+Knights+Rhodes",
        travelTime: "ליד ארמון הגרנד מאסטר",
        wowScore: 9,
        valueScore: 10,
        allergyRating: "safe",
        veganAvailable: true,
        familyFit: "הרחוב הנשמר ביותר ברודוס · בחינם · חייב להיות בכל ביקור",
        daughtersWillLove: "בדיוק כמו Diagon Alley! צלמו בכניסה לסמטאות",
        harryPotter: true,
        wow: true,
        tip: "צלמו בפינות הסמטאות — vibes שלמים של Harry Potter",
      },
      {
        time: "17:00",
        label: "מנוחה במלון",
        detail: "17:00–19:00 · מנוחה לפני הלילה הגדול",
        icon: Moon,
        type: "rest",
        tags: ["חשוב", "לפני הלילה"],
        cost: null,
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Avalon+Boutique+Hotel+Rhodes",
        travelTime: "המלון",
        wowScore: 5,
        valueScore: 10,
        allergyRating: "safe",
        veganAvailable: true,
        familyFit: "חיוני לפני ספירת הכוכבים — הלילה יתחיל ב-21:00",
        daughtersWillLove: "מנוחה, תוכניות ללילה, הכנת האפליקציות לכוכבים",
        tip: "הכינו Stellarium / SkySafari / Sky Guide מראש!",
      },
      {
        time: "20:00",
        label: "ארוחת ערב — T Veg",
        detail: "5 דקות מAvalon · ארוחה קלה לפני הנסיעה לProfitis Ilias",
        icon: Utensils,
        type: "food",
        tags: ["טבעוני", "5 דק' מהמלון", "מהיר"],
        cost: "₪55 לאדם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=T+Veg+Rhodes",
        travelTime: "5 דקות הליכה",
        wowScore: 7,
        valueScore: 9,
        allergyRating: "safe",
        veganAvailable: true,
        veganFriendly: true,
        familyFit: "ארוחה מהירה ובטוחה לאלרגיה לפני הלילה",
        daughtersWillLove: "ארוחה ידידותית, מהירה, כדי לצאת לכוכבים",
      },
      {
        time: "21:00",
        label: "יציאה ל-Profitis Ilias",
        detail: "מונית מAvalon · ~€20 · 45 דקות עלייה להר · גובה 798 מ'",
        icon: Navigation,
        type: "transport",
        tags: ["חשוב", "Astronomy", "לילה"],
        cost: "€20 מונית",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Profitis+Ilias+Rhodes+Greece",
        travelTime: "45 דקות",
        wowScore: 8,
        valueScore: 9,
        allergyRating: "safe",
        veganAvailable: true,
        familyFit: "הנהג יחכה למטה או תזמינו חזרה. קחו מים וסוודר.",
        daughtersWillLove: "הנסיעה בחושך עם ציפייה לכוכבים",
        tip: "קחו סוודר! בלילה בהר קריר. פנס ראש = bonus",
        astronomy: true,
      },
      {
        time: "21:45",
        label: "Profitis Ilias — ספירת כוכבים",
        detail: "798 מטר · Milky Way גלוי בספטמבר · אחד המקומות הטובים ביותר ברודוס לאסטרונומיה",
        icon: Telescope,
        type: "activity",
        tags: ["Astronomy", "WOW", "Milky Way", "לילה"],
        cost: "חינם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Profitis+Ilias+summit+Rhodes",
        travelTime: "798 מ' גובה",
        wowScore: 10,
        valueScore: 10,
        allergyRating: "safe",
        veganAvailable: true,
        familyFit: "חוויה שתישאר לכולם כל החיים — שמיים מושלמים ב-798 מ'",
        daughtersWillLove: "Milky Way בעיניים, כוכבי נופל, מזלות · Stellarium מראה איפה הכל",
        astronomy: true,
        wow: true,
        profitisIlias: true,
        tip: "הכינו Stellarium/SkySafari מראש · ספטמבר = Milky Way בשיא. אין אורות עיר!",
      },
      {
        time: "23:45",
        label: "חזרה למלון",
        detail: "מונית חזרה לAvalon · ~€20",
        icon: Hotel,
        type: "transport",
        tags: ["לילה"],
        cost: "€20 מונית",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Avalon+Boutique+Hotel+Rhodes",
        travelTime: "45 דקות",
        wowScore: 4,
        valueScore: 8,
        allergyRating: "safe",
        veganAvailable: true,
        daughtersWillLove: "שינה בדרך חזרה עם מלא כוכבים בראש",
      },
    ],
  },
  {
    day: 4,
    date: "ספטמבר 10, 2026",
    dayLabel: "יום רביעי",
    title: "יום עזיבה — קניות וטיסה",
    subtitle: "בוקר קניות, ארוחה אחרונה, טיסה הביתה",
    color: "#ca8a04",
    bg: "#fef9ec",
    events: [
      {
        time: "08:30",
        label: "ארוחת בוקר — Annie's Vegan Kitchen",
        detail: "ארוחה אחרונה בAnnie's · 3 דקות מAvalon · פינוק סיום",
        icon: Coffee,
        type: "food",
        tags: ["טבעוני 100%", "אחרון"],
        cost: "₪40 לאדם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Annie's+Vegan+Kitchen+Rhodes",
        travelTime: "3 דקות הליכה",
        wowScore: 8,
        valueScore: 9,
        allergyRating: "safe",
        veganAvailable: true,
        veganFriendly: true,
        familyFit: "ארוחת פרידה במסעדה הטובה ביותר של הטיול",
        daughtersWillLove: "אחת אחרונה מהSmoothie bowl המושלם",
      },
      {
        time: "09:30",
        label: "קניות — Zara, Bershka, Pull&Bear, Stradivarius",
        detail: "כולן ברחוב Mandraki Area · 8-10 דקות מAvalon · Y2K + Grunge",
        icon: ShoppingBag,
        type: "shopping",
        tags: ["Y2K", "Grunge", "Fashion"],
        cost: "לפי קניות",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Mandraki+shopping+Rhodes",
        travelTime: "8-10 דקות הליכה",
        wowScore: 8,
        valueScore: 8,
        allergyRating: "safe",
        veganAvailable: true,
        familyFit: "כל הרשתות באזור אחד · קניות מרוכזות ויעילות",
        daughtersWillLove: "Y2K fashion, Grunge vibes, בגדי קיץ, תכשיטים",
        tip: "Zara → Bershka → Pull&Bear → Stradivarius — הכל ב-10 דקות הליכה",
      },
      {
        time: "11:30",
        label: "ארוחת צהריים — T Veg",
        detail: "5 דקות מAvalon · ארוחה קלה לפני הנסיעה לשדה תעופה",
        icon: Utensils,
        type: "food",
        tags: ["טבעוני", "מהיר"],
        cost: "₪40 לאדם",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=T+Veg+Rhodes",
        travelTime: "5 דקות הליכה",
        wowScore: 7,
        valueScore: 9,
        allergyRating: "safe",
        veganAvailable: true,
        veganFriendly: true,
        familyFit: "ארוחה קלה ובטוחה לפני הטיסה",
        daughtersWillLove: "Burger קל אחרי הקניות",
      },
      {
        time: "12:15",
        label: "חזרה למלון",
        detail: "איסוף מזוודות + צ'ק אאוט",
        icon: Hotel,
        type: "hotel",
        tags: ["חשוב"],
        cost: null,
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Avalon+Boutique+Hotel+Rhodes",
        travelTime: "המלון",
        wowScore: 4,
        valueScore: 10,
        allergyRating: "safe",
        veganAvailable: true,
        familyFit: "צ'ק אאוט וסידור מזוודות",
        daughtersWillLove: "ארגון הקניות, תכנון מה קנינו",
        tip: "בקשו late checkout אם צריך — לפעמים מאפשרים עד 13:00",
      },
      {
        time: "12:40",
        label: "מונית לשדה התעופה",
        detail: "מAvalon לDiagoras Airport · ~€15 · 20 דקות",
        icon: Navigation,
        type: "transport",
        tags: ["חשוב"],
        cost: "€15 מונית",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Rhodes+Airport+Diagoras",
        travelTime: "20 דקות",
        wowScore: 3,
        valueScore: 9,
        allergyRating: "safe",
        veganAvailable: true,
        familyFit: "הזמינו מונית מראש דרך המלון",
        daughtersWillLove: "פרידה מרודוס, חלום על הטיול הבא",
        tip: "הזמינו מונית דרך הקבלה של המלון מראש!",
      },
      {
        time: "13:05",
        label: "הגעה לשדה התעופה",
        detail: "Diagoras Airport RHO · שעתיים לפני הטיסה",
        icon: Plane,
        type: "flight",
        tags: ["הגעה לנמל"],
        cost: null,
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Rhodes+Airport+Diagoras",
        travelTime: "שדה תעופה",
        wowScore: 4,
        valueScore: 10,
        allergyRating: "safe",
        veganAvailable: true,
        daughtersWillLove: "Duty free, עוד קניות קטנות",
      },
      {
        time: "15:10",
        label: "טיסה חזרה — RHO → TLV",
        detail: "שלא יגמר · אבל הזיכרונות נשארים לנצח",
        icon: Plane,
        type: "flight",
        tags: ["חזרה הביתה"],
        cost: "כלול בתקציב",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Rhodes+Airport+Diagoras",
        travelTime: "טיסה",
        wowScore: 7,
        valueScore: 9,
        allergyRating: "safe",
        veganAvailable: true,
        daughtersWillLove: "כבר מתכננות את הטיול הבא",
      },
    ],
  },
];

const SHOPPING_STORES = [
  { name: "Zara",         area: "ניו טאון",   distance: "8 דקות",  style: "Y2K Fashion",    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Zara+Rhodes+Greece" },
  { name: "Bershka",      area: "ניו טאון",   distance: "9 דקות",  style: "Y2K + Grunge",   mapsUrl: "https://www.google.com/maps/search/?api=1&query=Bershka+Rhodes+Greece" },
  { name: "Pull&Bear",    area: "ניו טאון",   distance: "9 דקות",  style: "Grunge + Street", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Pull+Bear+Rhodes+Greece" },
  { name: "Stradivarius", area: "ניו טאון",   distance: "10 דקות", style: "Y2K + Boho",     mapsUrl: "https://www.google.com/maps/search/?api=1&query=Stradivarius+Rhodes+Greece" },
  { name: "H&M",          area: "ניו טאון",   distance: "7 דקות",  style: "Y2K Budget",     mapsUrl: "https://www.google.com/maps/search/?api=1&query=HM+Rhodes+Greece" },
  { name: "Vintage Shops", area: "עיר עתיקה", distance: "15 דקות", style: "Vintage Y2K",    mapsUrl: "https://www.google.com/maps/search/?api=1&query=vintage+shops+Rhodes+Old+Town" },
];

// ─── Type colors ───────────────────────────────────────────────────────────────
const TYPE_STYLE: Record<string, { color: string; bg: string }> = {
  flight:    { color: "#7c3aed", bg: "#f5f3ff" },
  food:      { color: "#16a34a", bg: "#f0fdf4" },
  activity:  { color: "#0284c7", bg: "#eff6ff" },
  shopping:  { color: "#ec4899", bg: "#fdf2f8" },
  hotel:     { color: "#0284c7", bg: "#eff6ff" },
  transport: { color: "#f59e0b", bg: "#fff7ed" },
  rest:      { color: "#a3a3a3", bg: "#fafafa" },
};

// ─── Score dots ───────────────────────────────────────────────────────────────
function ScoreDots({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          className="rounded-full"
          style={{
            width: 5, height: 5,
            background: i < score ? color : "#e5e5e5",
          }}
        />
      ))}
    </div>
  );
}

// ─── Allergy badge ────────────────────────────────────────────────────────────
function AllergyBadge({ rating }: { rating?: "safe" | "ok" | "ask" }) {
  if (!rating) return null;
  const map = {
    safe: { label: "בטוח לאלרגיה", color: "#15803d", bg: "#f0fdf4" },
    ok:   { label: "בד\"כ בטוח", color: "#b45309", bg: "#fef9ec" },
    ask:  { label: "שאלו מלצר",   color: "#dc2626", bg: "#fef2f2" },
  };
  const m = map[rating];
  return (
    <span className="rounded-full px-2 py-0.5" style={{ fontSize: 10, fontWeight: 700, background: m.bg, color: m.color }}>
      {m.label}
    </span>
  );
}

// ─── Event row ────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EventRow({ e }: { e: any }) {
  const [expanded, setExpanded] = useState(false);
  const s = TYPE_STYLE[e.type as string] ?? TYPE_STYLE.activity;
  const Icon = e.icon as React.FC<{ className?: string; style?: React.CSSProperties }>;
  const hasExtra = e.tip || e.familyFit || e.daughtersWillLove;

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
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ background: s.bg }}>
              <Icon className="h-5 w-5" style={{ color: s.color }} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {/* Title + badges */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#171717" }}>{e.label}</span>
                    {e.wow && <Star className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#ca8a04" }} />}
                    {e.harryPotter && (
                      <span className="rounded-full px-1.5 py-0.5" style={{ fontSize: 10, fontWeight: 700, background: "#7c3aed22", color: "#7c3aed" }}>HP</span>
                    )}
                    {e.kpop && (
                      <span className="rounded-full px-1.5 py-0.5" style={{ fontSize: 10, fontWeight: 700, background: "#ec489922", color: "#ec4899" }}>K-Pop</span>
                    )}
                    {e.astronomy && <Telescope className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#0284c7" }} />}
                    {e.veganFriendly && <Leaf className="h-3.5 w-3.5 flex-shrink-0 text-green-500" />}
                    {e.profitisIlias && (
                      <span className="rounded-full px-1.5 py-0.5" style={{ fontSize: 10, fontWeight: 700, background: "#1e3a5f", color: "#93c5fd" }}>★ Stargazing</span>
                    )}
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

              {/* Scores row */}
              {(e.wowScore || e.allergyRating) && (
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  {e.wowScore && (
                    <div className="flex items-center gap-1.5">
                      <Star className="h-3 w-3 flex-shrink-0" style={{ color: "#ca8a04" }} />
                      <ScoreDots score={e.wowScore} color="#ca8a04" />
                      <span style={{ fontSize: 10, color: "#a3a3a3" }}>{e.wowScore}/10</span>
                    </div>
                  )}
                  {e.valueScore && (
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-3 w-3 flex-shrink-0 text-green-500" />
                      <ScoreDots score={e.valueScore} color="#22c55e" />
                      <span style={{ fontSize: 10, color: "#a3a3a3" }}>{e.valueScore}/10</span>
                    </div>
                  )}
                  <AllergyBadge rating={e.allergyRating} />
                  {e.veganAvailable && (
                    <span className="flex items-center gap-0.5 rounded-full px-2 py-0.5" style={{ fontSize: 10, fontWeight: 700, background: "#f0fdf4", color: "#15803d" }}>
                      <Leaf className="h-2.5 w-2.5 flex-shrink-0" />
                      טבעוני
                    </span>
                  )}
                </div>
              )}

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

              {/* Maps + expand */}
              <div className="mt-2 flex items-center gap-2">
                {e.mapsUrl && (
                  <a href={e.mapsUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-lg px-2 py-1 transition-colors hover:bg-neutral-100"
                    style={{ fontSize: 11, fontWeight: 600, color: "#0284c7", textDecoration: "none", border: "1px solid #e0f2fe" }}>
                    <ExternalLink className="h-3 w-3" />
                    Google Maps
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

              {/* Expanded details */}
              {expanded && (
                <div className="mt-2 space-y-2">
                  {e.familyFit && (
                    <div className="flex items-start gap-2 rounded-xl p-2.5" style={{ background: "#eff6ff" }}>
                      <Eye className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" style={{ color: "#0284c7" }} />
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#0284c7", marginBottom: 2 }}>מתאים למשפחה</p>
                        <span style={{ fontSize: 12, color: "#1e40af", lineHeight: 1.5 }}>{e.familyFit}</span>
                      </div>
                    </div>
                  )}
                  {e.daughtersWillLove && (
                    <div className="flex items-start gap-2 rounded-xl p-2.5" style={{ background: "#fdf2f8" }}>
                      <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" style={{ color: "#ec4899" }} />
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#ec4899", marginBottom: 2 }}>הבנות יאהבו</p>
                        <span style={{ fontSize: 12, color: "#9d174d", lineHeight: 1.5 }}>{e.daughtersWillLove}</span>
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

// ─── Astronomy Section ─────────────────────────────────────────────────────────
function AstronomySection() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(v => !v)}
        className="flex w-full cursor-pointer items-center justify-between rounded-2xl p-4 transition-colors hover:opacity-90"
        style={{ background: "#0f172a", border: "none" }}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: "#1e3a5f" }}>
            <Telescope className="h-5 w-5" style={{ color: "#93c5fd" }} />
          </div>
          <div className="text-right">
            <p style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>Profitis Ilias — ספירת כוכבים</p>
            <p style={{ fontSize: 13, color: "#64748b" }}>מדריך אסטרונומיה · יום 3 · 21:45–23:15</p>
          </div>
        </div>
        {open
          ? <ChevronUp className="h-5 w-5 flex-shrink-0" style={{ color: "#64748b" }} />
          : <ChevronDown className="h-5 w-5 flex-shrink-0" style={{ color: "#64748b" }} />
        }
      </button>

      {open && (
        <div className="mt-2 space-y-4 rounded-2xl p-5" style={{ background: "#0f172a", border: "1px solid #1e293b" }}>

          {/* Why Profitis Ilias */}
          <div>
            <p style={{ fontSize: 14, fontWeight: 800, color: "#93c5fd", marginBottom: 10 }}>
              למה Profitis Ilias הוא המקום הטוב ביותר ברודוס לצפייה בכוכבים
            </p>
            <div className="space-y-3">
              {[
                { icon: "🏔", title: "גובה 798 מטר", text: "מעל רוב האווירה העכורה — שמיים צלולים יותר מכל מקום אחר באי" },
                { icon: "🌑", title: "אפלה מוחלטת", text: "אין אורות עיר בפסגה. זיהום אור אפס — Milky Way נראה בעין רגילה" },
                { icon: "🌊", title: "אוויר ימי נקי", text: "רוחות ים מנקות את האווירה — שקיפות אסטרונומית מעולה בספטמבר" },
                { icon: "📍", title: "קל להגיע", text: "מונית מרודוס — 45 דקות. אין צורך בציוד מיוחד או מדריך" },
              ].map(item => (
                <div key={item.title} className="flex gap-3">
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 2 }}>{item.title}</p>
                    <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ height: 1, background: "#1e293b" }} />

          {/* Night vs Day */}
          <div>
            <p style={{ fontSize: 14, fontWeight: 800, color: "#93c5fd", marginBottom: 10 }}>
              למה לילה — לא ביום?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-3" style={{ background: "#1e293b" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", marginBottom: 6 }}>ביום ⛅</p>
                <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>
                  נוף יפה לאי · שווה ביום · אבל הכוכבים לא נראים
                </p>
              </div>
              <div className="rounded-xl p-3" style={{ background: "#1e3a5f", border: "1px solid #3b82f6" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#60a5fa", marginBottom: 6 }}>בלילה ✨</p>
                <p style={{ fontSize: 12, color: "#93c5fd", lineHeight: 1.5 }}>
                  Milky Way, מזלות, כוכבי נופל, כוכבי לכת — בעין רגילה!
                </p>
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: "#1e293b" }} />

          {/* Best hours */}
          <div>
            <p style={{ fontSize: 14, fontWeight: 800, color: "#93c5fd", marginBottom: 10 }}>שעות ספירת הכוכבים הטובות ביותר</p>
            <div className="space-y-2">
              {[
                { time: "21:00–21:30", label: "הגעה + התאקלמות", note: "תנו לעיניים להתרגל לחושך (~20 דק')" },
                { time: "21:30–22:30", label: "Milky Way בשיא", note: "הגלקסיה במיקום הכי גבוה בשמיים" },
                { time: "22:30–23:15", label: "מזלות וכוכבי לכת", note: "זמן להשתמש ב-Stellarium לזיהוי" },
              ].map(h => (
                <div key={h.time} className="flex items-start gap-3 rounded-xl p-3" style={{ background: "#1e293b" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", flexShrink: 0, minWidth: 90 }}>{h.time}</span>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{h.label}</p>
                    <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{h.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ height: 1, background: "#1e293b" }} />

          {/* Apps */}
          <div>
            <p style={{ fontSize: 14, fontWeight: 800, color: "#93c5fd", marginBottom: 10 }}>אפליקציות מומלצות</p>
            <div className="space-y-2">
              {[
                { name: "Stellarium", desc: "הכי מקצועי · AR מצלמה · זיהוי כל כוכב בשמיים", badge: "חינם", badgeColor: "#16a34a", bg: "#f0fdf4" },
                { name: "SkySafari", desc: "מפות שמיים מפורטות · עקיבה אחר כוכבי לכת", badge: "בתשלום", badgeColor: "#0284c7", bg: "#eff6ff" },
                { name: "Sky Guide", desc: "הכי אסתטי · מושלם לילדים · Apple only", badge: "בתשלום", badgeColor: "#7c3aed", bg: "#f5f3ff" },
              ].map(app => (
                <div key={app.name} className="flex items-center gap-3 rounded-xl p-3" style={{ background: "#1e293b" }}>
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: "#0f172a" }}>
                    <Telescope className="h-5 w-5" style={{ color: "#93c5fd" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{app.name}</p>
                      <span className="rounded-full px-2 py-0.5" style={{ fontSize: 10, fontWeight: 700, background: app.bg, color: app.badgeColor }}>{app.badge}</span>
                    </div>
                    <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.4, marginTop: 2 }}>{app.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-xl p-3" style={{ background: "#1e3a5f", border: "1px solid #3b82f6" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#93c5fd", marginBottom: 4 }}>טיפ חשוב לפני היציאה</p>
              <p style={{ fontSize: 12, color: "#bfdbfe", lineHeight: 1.5 }}>
                הורידו את האפליקציות ביום 1 כשיש WiFi. בפסגה עשויה להיות קליטה חלשה.
                קחו: סוודר, מים, פנס ראש, טלפון מלא.
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
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

        {/* Traveler profile */}
        <div className="rounded-2xl p-4" style={{ background: "#fafafa", border: "1px solid #f0f0f0" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#737373", marginBottom: 8 }}>פרופיל המטיילים</p>
          <div className="flex flex-wrap gap-2">
            {[
              { icon: Leaf,       label: "טבעוני 100%",    color: "#16a34a", bg: "#f0fdf4" },
              { icon: AlertCircle, label: "אלרגיה לחלב",    color: "#dc2626", bg: "#fef2f2" },
              { icon: Camera,      label: "Photography",    color: "#0284c7", bg: "#eff6ff" },
              { icon: BookOpen,    label: "Harry Potter",   color: "#7c3aed", bg: "#f5f3ff" },
              { icon: Telescope,   label: "Astronomy",      color: "#0284c7", bg: "#eff6ff" },
              { icon: Music,       label: "K-Pop",          color: "#ec4899", bg: "#fdf2f8" },
              { icon: ShoppingBag, label: "Y2K / Grunge",   color: "#f59e0b", bg: "#fff7ed" },
            ].map(({ icon: Icon, label, color, bg }) => (
              <span key={label} className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                style={{ background: bg, fontSize: 12, fontWeight: 600, color }}>
                <Icon className="h-3.5 w-3.5" />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Day selector */}
        <div className="grid grid-cols-4 gap-2">
          {DAYS.map((d, i) => (
            <button key={d.day} onClick={() => setActiveDay(i)}
              className="cursor-pointer rounded-2xl p-3 text-center transition-all hover:shadow-sm"
              style={{
                border: `2px solid ${activeDay === i ? d.color : "#f0f0f0"}`,
                background: activeDay === i ? d.bg : "#fff",
                minHeight: 56,
              }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: activeDay === i ? d.color : "#a3a3a3", lineHeight: 1 }}>
                יום {d.day}
              </p>
              <p style={{ fontSize: 10, color: activeDay === i ? d.color : "#d1d5db", marginTop: 3 }}>
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
                { label: `${day.events.filter(e => e.allergyRating === "safe").length} בטוחים לאלרגיה`, color: "#86efac" },
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

        {/* Astronomy section — always shown (relevant for Day 3 especially) */}
        <AstronomySection />

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
                <p style={{ fontSize: 14, fontWeight: 700, color: "#9d174d", marginBottom: 4 }}>Y2K + Grunge Shopping Tips</p>
                <p style={{ fontSize: 13, color: "#be185d", lineHeight: 1.6 }}>
                  כל הרשתות נמצאות ברחוב Mandraki וסביבתו · 7-10 דקות הליכה מ-Avalon ·
                  חנויות הוינטאג' בעיר העתיקה לאפקט Y2K אותנטי יותר
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
