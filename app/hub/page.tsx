"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Globe, Plane, Building2, BookOpen, Shield, Car, Ship,
  Landmark, Utensils, FileText, Upload, Download, Share2,
  Trash2, X, ZoomIn, ZoomOut, RotateCw, Search, Phone,
  Wifi, ChevronDown, ChevronUp, ExternalLink, AlertCircle,
  Clock, MapPin, Languages, Check, Copy, Plus, Info,
  ScanLine, CheckCircle2, CreditCard, Navigation, Star,
  Sparkles, ChevronRight, ArrowRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type DocType =
  | "boarding-pass" | "flight-ticket" | "hotel" | "passport"
  | "insurance"     | "car-rental"    | "ferry" | "museum"
  | "restaurant"    | "vaccination"   | "other";

interface ExtractedData {
  // Flight
  flightNumber?:  string; airline?:    string; departure?:     string;
  arrival?:       string; departureTime?: string; arrivalTime?: string;
  gate?:          string; seat?:       string; terminal?:      string;
  pnr?:           string; passengerName?: string;
  // Hotel
  hotelName?:     string; checkIn?:    string; checkOut?:      string;
  bookingNumber?: string; address?:    string; phone?:         string;
  // Passport
  fullName?:      string; passportNumber?: string; nationality?: string;
  expiryDate?:    string;
  // Insurance
  insurer?:       string; policyNumber?: string; emergencyPhone?: string;
  coverageStart?: string; coverageEnd?:  string;
  // Car rental
  rentalCompany?: string; pickupTime?: string; returnTime?:    string;
  pickupLocation?: string; confirmationNumber?: string; vehicleType?: string;
  // Restaurant
  restaurantName?: string; reservationDate?: string; reservationTime?: string;
  guests?:         string;
}

interface TravelDoc {
  id:          string;
  type:        DocType;
  title:       string;
  description: string;
  uploadedAt:  string;
  fileName:    string;
  fileMime:    string;
  fileSize:    number;
  data:        ArrayBuffer;
  extracted:   ExtractedData;
  tags:        string[];
}

// ─── IndexedDB helpers ─────────────────────────────────────────────────────────
const DB_NAME = "ftp-docs-v1";
const STORE   = "docs";

function openDB(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = e => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE))
        db.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = e => res((e.target as IDBOpenDBRequest).result);
    req.onerror   = ()  => rej(req.error);
  });
}
async function dbSave(doc: TravelDoc) {
  const db = await openDB();
  return new Promise<void>((res, rej) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(doc);
    tx.oncomplete = () => res();
    tx.onerror    = ()  => rej(tx.error);
  });
}
async function dbGetAll(): Promise<TravelDoc[]> {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx  = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => res(req.result || []);
    req.onerror   = ()  => rej(req.error);
  });
}
async function dbDelete(id: string) {
  const db = await openDB();
  return new Promise<void>((res, rej) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => res();
    tx.onerror    = ()  => rej(tx.error);
  });
}

// ─── Document type config ──────────────────────────────────────────────────────
type LIcon = React.FC<{ className?: string; style?: React.CSSProperties }>;
interface DocConfig { label: string; icon: LIcon; color: string; bg: string; tags: string[] }
const DOC_CONFIG: Record<DocType, DocConfig> = {
  "boarding-pass":  { label: "כרטיס עלייה",    icon: Plane as LIcon,    color: "#7c3aed", bg: "#f5f3ff", tags: ["טיסות"]    },
  "flight-ticket":  { label: "כרטיס טיסה",      icon: Plane as LIcon,    color: "#7c3aed", bg: "#f5f3ff", tags: ["טיסות"]    },
  "hotel":          { label: "הזמנת מלון",      icon: Building2 as LIcon, color: "#0284c7", bg: "#eff6ff", tags: ["לינה"]     },
  "passport":       { label: "דרכון",           icon: BookOpen as LIcon, color: "#171717", bg: "#f5f5f5", tags: ["זהות"]     },
  "insurance":      { label: "ביטוח נסיעות",    icon: Shield as LIcon,   color: "#16a34a", bg: "#f0fdf4", tags: ["ביטוח"]    },
  "car-rental":     { label: "השכרת רכב",       icon: Car as LIcon,      color: "#f59e0b", bg: "#fff7ed", tags: ["תחבורה"]   },
  "ferry":          { label: "כרטיס מעבורת",    icon: Ship as LIcon,     color: "#0284c7", bg: "#eff6ff", tags: ["תחבורה"]   },
  "museum":         { label: "כרטיס מוזיאון",   icon: Landmark as LIcon, color: "#ec4899", bg: "#fdf2f8", tags: ["כרטיסים"]  },
  "restaurant":     { label: "הזמנת מסעדה",     icon: Utensils as LIcon, color: "#16a34a", bg: "#f0fdf4", tags: ["הזמנות"]   },
  "vaccination":    { label: "תעודת חיסון",     icon: Shield as LIcon,   color: "#f59e0b", bg: "#fff7ed", tags: ["בריאות"]   },
  "other":          { label: "מסמך אחר",        icon: FileText as LIcon, color: "#737373", bg: "#f5f5f5", tags: ["אחר"]      },
};

const WALLET_TYPES: DocType[] = ["boarding-pass", "hotel", "passport", "insurance"];

// ─── Utilities ─────────────────────────────────────────────────────────────────
function formatSize(b: number) {
  if (b < 1024)         return `${b} B`;
  if (b < 1024 * 1024)  return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

async function extractPDFText(buf: ArrayBuffer): Promise<string> {
  try {
    const raw = new TextDecoder("latin1").decode(buf);
    const texts: string[] = [];
    // BT...ET text blocks
    for (const block of (raw.match(/BT[\s\S]*?ET/g) || [])) {
      for (const m of (block.match(/\(([^)\\]*(?:\\.[^)\\]*)*)\)\s*T[jJ]/g) || [])) {
        const t = m.match(/\(([^)\\]*(?:\\.[^)\\]*)*)\)/);
        if (t) texts.push(t[1]);
      }
      for (const m of (block.match(/\[(.*?)\]\s*TJ/g) || [])) {
        for (const s of (m.match(/\(([^)]+)\)/g) || [])) texts.push(s.slice(1, -1));
      }
    }
    return texts.join(" ").replace(/\\[rn]/g, " ").replace(/\s+/g, " ").trim();
  } catch { return ""; }
}

function extractFields(text: string, type: DocType): ExtractedData {
  const d: ExtractedData = {};
  const t = text.toUpperCase();

  if (type === "boarding-pass" || type === "flight-ticket") {
    const fn = text.match(/\b([A-Z]{2}\d{3,4})\b/); if (fn) d.flightNumber = fn[1];
    const pnr = text.match(/\b([A-Z]{6})\b/);        if (pnr) d.pnr = pnr[1];
    const seat = text.match(/\b(\d{1,2}[A-F])\b/i);  if (seat) d.seat = seat[1].toUpperCase();
    const times = text.match(/\b(\d{2}:\d{2})\b/g);
    if (times?.[0]) d.departureTime = times[0];
    if (times?.[1]) d.arrivalTime   = times[1];
    const ap = text.match(/\b([A-Z]{3})\b/g)?.filter(x => !/THE|AND|FOR|TJJ|BET/.test(x));
    if (ap?.[0]) d.departure = ap[0];
    if (ap?.[1]) d.arrival   = ap[ap.length - 1];
    const gate = text.match(/GATE\s*([A-Z0-9]+)/i); if (gate) d.gate = gate[1];
    const name = text.match(/(?:MR|MRS|MS|DR|PASSENGER)[.\s]+([A-Z][A-Z\s]+)/i);
    if (name) d.passengerName = name[1].trim();
  }
  if (type === "hotel") {
    const booking = text.match(/(?:booking|reservation|confirmation)[:\s#]*([A-Z0-9]{5,12})/i);
    if (booking) d.bookingNumber = booking[1];
    const dates = text.match(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/g);
    if (dates?.[0]) d.checkIn  = dates[0];
    if (dates?.[1]) d.checkOut = dates[1];
    const phone = text.match(/(?:tel|phone|call)[:\s]*(\+?[\d\s\-()]{8,15})/i);
    if (phone) d.phone = phone[1].trim();
  }
  if (type === "passport") {
    const num = text.match(/[A-Z]{1,2}\d{7}/); if (num) d.passportNumber = num[0];
    const exp = text.match(/\d{2}\s*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*\d{4}/i);
    if (exp) d.expiryDate = exp[0];
  }
  if (type === "insurance") {
    const pol = text.match(/policy\s*(?:no|number|#)[:\s]*([A-Z0-9\-]{5,20})/i);
    if (pol) d.policyNumber = pol[1];
    const tel = text.match(/(?:emergency|assist)[^0-9]*(\+?[\d\s\-()]{8,15})/i);
    if (tel) d.emergencyPhone = tel[1].trim();
  }
  if (type === "car-rental") {
    const conf = text.match(/(?:confirmation|booking|reference)[:\s#]*([A-Z0-9]{5,12})/i);
    if (conf) d.confirmationNumber = conf[1];
  }
  if (type === "restaurant") {
    const guests = text.match(/\b(\d+)\s*(?:guests?|people|persons?|covers?)\b/i);
    if (guests) d.guests = guests[1];
    const times = text.match(/\b(\d{1,2}:\d{2})\b/g);
    if (times?.[0]) d.reservationTime = times[0];
  }
  void t;
  return d;
}

// ─── Document Viewer ───────────────────────────────────────────────────────────
function DocViewer({ doc, onClose, onDelete }: { doc: TravelDoc; onClose: () => void; onDelete: (id: string) => void }) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    const blob = new Blob([doc.data], { type: doc.fileMime });
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [doc]);

  const isImage = doc.fileMime.startsWith("image/");
  const isPDF   = doc.fileMime === "application/pdf";

  const download = () => {
    if (!blobUrl) return;
    const a = document.createElement("a"); a.href = blobUrl;
    a.download = doc.fileName; a.click();
  };

  const share = async () => {
    if (!blobUrl) return;
    try {
      const blob = new Blob([doc.data], { type: doc.fileMime });
      const file = new File([blob], doc.fileName, { type: doc.fileMime });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: doc.title });
      } else {
        await navigator.clipboard.writeText(doc.title);
        setShared(true); setTimeout(() => setShared(false), 2000);
      }
    } catch { /* user cancelled */ }
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col" style={{ background: "#000" }}>
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between px-4 py-3 safe-area-top"
        style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)" }}>
        <button onClick={onClose} className="cursor-pointer rounded-full p-2" style={{ background: "rgba(255,255,255,0.15)", border: "none" }}>
          <X className="h-5 w-5 text-white" />
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }} className="flex-1 mx-3 truncate text-center">{doc.title}</span>
        <div className="flex gap-2">
          <button onClick={share} className="cursor-pointer rounded-full p-2" style={{ background: shared ? "#16a34a" : "rgba(255,255,255,0.15)", border: "none" }}>
            {shared ? <Check className="h-5 w-5 text-white" /> : <Share2 className="h-5 w-5 text-white" />}
          </button>
          <button onClick={download} className="cursor-pointer rounded-full p-2" style={{ background: "rgba(255,255,255,0.15)", border: "none" }}>
            <Download className="h-5 w-5 text-white" />
          </button>
          <button onClick={() => { onDelete(doc.id); onClose(); }}
            className="cursor-pointer rounded-full p-2" style={{ background: "rgba(220,38,38,0.3)", border: "none" }}>
            <Trash2 className="h-5 w-5 text-red-400" />
          </button>
        </div>
      </div>

      {/* Document */}
      <div className="flex-1 overflow-auto flex items-center justify-center" style={{ position: "relative" }}>
        {!blobUrl && (
          <div className="flex items-center gap-2" style={{ color: "#737373" }}>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span style={{ fontSize: 14 }}>טוען...</span>
          </div>
        )}
        {blobUrl && isImage && (
          <img src={blobUrl} alt={doc.title}
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain",
              transform: `scale(${scale}) rotate(${rotation}deg)`, transition: "transform 0.2s", touchAction: "pinch-zoom" }} />
        )}
        {blobUrl && isPDF && (
          <object data={blobUrl} type="application/pdf" style={{ width: "100%", height: "100%" }}>
            <div className="flex flex-col items-center gap-4 p-8">
              <FileText className="h-16 w-16" style={{ color: "#737373" }} />
              <p style={{ color: "#fff", textAlign: "center" }}>הדפדפן לא תומך בתצוגה מוטמעת</p>
              <button onClick={download} className="rounded-2xl px-6 py-3 cursor-pointer"
                style={{ background: "#fff", color: "#171717", fontWeight: 700, border: "none" }}>
                הורד לצפייה
              </button>
            </div>
          </object>
        )}
        {blobUrl && !isImage && !isPDF && (
          <div className="flex flex-col items-center gap-4 p-8">
            <FileText className="h-16 w-16" style={{ color: "#737373" }} />
            <p style={{ color: "#fff", fontSize: 16 }}>{doc.fileName}</p>
            <button onClick={download} className="rounded-2xl px-6 py-3 cursor-pointer"
              style={{ background: "#fff", color: "#171717", fontWeight: 700, border: "none" }}>
              הורד קובץ
            </button>
          </div>
        )}
      </div>

      {/* Image controls */}
      {isImage && blobUrl && (
        <div className="flex flex-shrink-0 items-center justify-center gap-3 py-4"
          style={{ background: "rgba(0,0,0,0.6)" }}>
          <button onClick={() => setScale(s => Math.max(0.5, s - 0.25))}
            className="cursor-pointer rounded-full p-3" style={{ background: "rgba(255,255,255,0.15)", border: "none" }}>
            <ZoomOut className="h-5 w-5 text-white" />
          </button>
          <span style={{ fontSize: 13, color: "#fff", minWidth: 40, textAlign: "center" }}>{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(3, s + 0.25))}
            className="cursor-pointer rounded-full p-3" style={{ background: "rgba(255,255,255,0.15)", border: "none" }}>
            <ZoomIn className="h-5 w-5 text-white" />
          </button>
          <button onClick={() => setRotation(r => (r + 90) % 360)}
            className="cursor-pointer rounded-full p-3" style={{ background: "rgba(255,255,255,0.15)", border: "none" }}>
            <RotateCw className="h-5 w-5 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Upload sheet ──────────────────────────────────────────────────────────────
const DOC_TYPE_LIST: DocType[] = [
  "boarding-pass","flight-ticket","hotel","passport",
  "insurance","car-rental","ferry","museum","restaurant","vaccination","other"
];

function UploadSheet({ onSave, onClose }: { onSave: (doc: TravelDoc) => void; onClose: () => void }) {
  const [step, setStep]               = useState<"type" | "scan" | "form">("type");
  const [docType, setDocType]         = useState<DocType>("other");
  const [title, setTitle]             = useState("");
  const [description, setDescription] = useState("");
  const [extracted, setExtracted]     = useState<ExtractedData>({});
  const [fileData, setFileData]       = useState<{ buf: ArrayBuffer; mime: string; name: string; size: number } | null>(null);
  const fileRef                       = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File, type: DocType) => {
    setStep("scan");
    const buf = await file.arrayBuffer();
    setFileData({ buf, mime: file.type, name: file.name, size: file.size });
    // Auto title from filename
    setTitle(file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
    // Try extraction
    let text = "";
    if (file.type === "application/pdf") text = await extractPDFText(buf);
    const fields = extractFields(text, type);
    setExtracted(fields);
    await new Promise(r => setTimeout(r, 1800)); // scanning animation
    setStep("form");
  }, []);

  const handleSave = async () => {
    if (!fileData || !title.trim()) return;
    const cfg = DOC_CONFIG[docType];
    const doc: TravelDoc = {
      id:          uid(),
      type:        docType,
      title:       title.trim(),
      description: description.trim(),
      uploadedAt:  new Date().toISOString(),
      fileName:    fileData.name,
      fileMime:    fileData.mime,
      fileSize:    fileData.size,
      data:        fileData.buf,
      extracted,
      tags:        cfg.tags,
    };
    await dbSave(doc);
    onSave(doc);
    onClose();
  };

  const cfg = DOC_CONFIG[docType];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-end"
      style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div className="w-full max-w-xl overflow-hidden rounded-t-3xl"
        style={{ background: "#fff", maxHeight: "88vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full" style={{ background: "#d4d4d4" }} />
        </div>

        {/* STEP: choose type */}
        {step === "type" && (
          <div className="p-5">
            <h2 style={{ fontSize: 22, fontWeight: 900, color: "#171717", marginBottom: 4 }}>העלה מסמך</h2>
            <p style={{ fontSize: 14, color: "#737373", marginBottom: 20 }}>בחר סוג מסמך ואז בחר קובץ</p>
            <div className="grid grid-cols-3 gap-3">
              {DOC_TYPE_LIST.map(t => {
                const c = DOC_CONFIG[t];
                const Icon = c.icon;
                return (
                  <button key={t} onClick={() => {
                    setDocType(t);
                    fileRef.current?.click();
                  }} className="cursor-pointer flex flex-col items-center gap-2 rounded-2xl p-3 transition-all hover:scale-105"
                    style={{ border: `2px solid ${docType === t ? c.color : "#f0f0f0"}`, background: docType === t ? c.bg : "#fff" }}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: c.bg }}>
                      <Icon style={{ width: 20, height: 20, color: c.color }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#171717", textAlign: "center", lineHeight: 1.3 }}>{c.label}</span>
                  </button>
                );
              })}
            </div>
            <input ref={fileRef} type="file" accept="image/*,.pdf,.heic" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f, docType); }} />
          </div>
        )}

        {/* STEP: scanning */}
        {step === "scan" && (
          <div className="flex flex-col items-center gap-6 p-10">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full"
              style={{ background: cfg.bg, border: `3px solid ${cfg.color}` }}>
              <ScanLine className="h-10 w-10 animate-pulse" style={{ color: cfg.color }} />
              <div className="absolute inset-0 animate-ping rounded-full opacity-20" style={{ background: cfg.color }} />
            </div>
            <div className="text-center">
              <p style={{ fontSize: 20, fontWeight: 800, color: "#171717", marginBottom: 6 }}>מנתח מסמך...</p>
              <p style={{ fontSize: 14, color: "#737373" }}>מחלץ מידע אוטומטית</p>
            </div>
            <div className="flex gap-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="h-2 w-2 rounded-full animate-bounce"
                  style={{ background: cfg.color, animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* STEP: form */}
        {step === "form" && (
          <div className="p-5 pb-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: cfg.bg }}>
                {(() => { const Icon = cfg.icon; return <Icon style={{ width: 22, height: 22, color: cfg.color }} />; })()}
              </div>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "#171717" }}>{cfg.label}</h2>
                <div className="flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "#16a34a" }} />
                  <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 600 }}>מסמך נותח בהצלחה</span>
                </div>
              </div>
            </div>

            {/* Title */}
            <label style={{ fontSize: 13, fontWeight: 700, color: "#737373" }}>שם המסמך *</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              className="mt-1 mb-4 w-full rounded-2xl px-4 py-3 text-right"
              style={{ border: "1.5px solid #e5e5e5", fontSize: 16, fontWeight: 500, outline: "none", color: "#171717" }}
              placeholder="כרטיס עלייה — ת״א → רודוס" />

            {/* Description */}
            <label style={{ fontSize: 13, fontWeight: 700, color: "#737373" }}>תיאור (אופציונלי)</label>
            <input value={description} onChange={e => setDescription(e.target.value)}
              className="mt-1 mb-4 w-full rounded-2xl px-4 py-3 text-right"
              style={{ border: "1.5px solid #e5e5e5", fontSize: 15, outline: "none", color: "#171717" }}
              placeholder="מידע נוסף..." />

            {/* Extracted fields */}
            {Object.keys(extracted).length > 0 && (
              <div className="mb-5 rounded-2xl p-4" style={{ background: "#f8f8f8" }}>
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" style={{ color: "#7c3aed" }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#7c3aed" }}>מידע שנמצא אוטומטית</span>
                </div>
                <div className="space-y-2">
                  {Object.entries(extracted).map(([k, v]) => {
                    if (!v) return null;
                    const labels: Record<string, string> = {
                      flightNumber: "מספר טיסה", pnr: "מספר הזמנה (PNR)", seat: "מושב",
                      departure: "נמל המראה", arrival: "נמל נחיתה", departureTime: "שעת המראה",
                      arrivalTime: "שעת נחיתה", gate: "שער", passengerName: "שם נוסע",
                      bookingNumber: "מספר הזמנה", checkIn: "צ׳ק אין", checkOut: "צ׳ק אאוט",
                      phone: "טלפון", passportNumber: "מספר דרכון", expiryDate: "תוקף",
                      policyNumber: "מספר פוליסה", emergencyPhone: "טלפון חירום",
                      confirmationNumber: "מספר אישור", guests: "מספר סועדים",
                      reservationDate: "תאריך", reservationTime: "שעה",
                    };
                    return (
                      <div key={k} className="flex items-center justify-between">
                        <span style={{ fontSize: 12, color: "#737373" }}>{labels[k] || k}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#171717" }}>{v}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {Object.keys(extracted).length === 0 && (
              <div className="mb-5 rounded-2xl p-4 flex items-center gap-3" style={{ background: "#fef9ec" }}>
                <AlertCircle className="h-4 w-4 flex-shrink-0" style={{ color: "#b45309" }} />
                <span style={{ fontSize: 13, color: "#92400e" }}>לא הצלחנו לחלץ מידע אוטומטית — הזן ידנית אם צריך</span>
              </div>
            )}

            <button onClick={handleSave} disabled={!title.trim()}
              className="w-full cursor-pointer rounded-2xl py-4 transition-opacity disabled:opacity-40"
              style={{ background: "#171717", color: "#fff", fontWeight: 800, fontSize: 17, border: "none" }}>
              שמור מסמך
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Document card ─────────────────────────────────────────────────────────────
function DocCard({ doc, onClick }: { doc: TravelDoc; onClick: () => void }) {
  const cfg  = DOC_CONFIG[doc.type];
  const Icon = cfg.icon;
  const date = new Date(doc.uploadedAt).toLocaleDateString("he-IL", { day: "numeric", month: "short" });

  return (
    <button onClick={onClick}
      className="flex cursor-pointer gap-3 rounded-2xl p-4 w-full text-right transition-all hover:shadow-sm"
      style={{ border: "1px solid #f0f0f0", background: "#fff" }}>
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: cfg.bg }}>
        <Icon style={{ width: 22, height: 22, color: cfg.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: 15, fontWeight: 700, color: "#171717" }} className="truncate">{doc.title}</p>
        <p style={{ fontSize: 13, color: "#737373", marginTop: 2 }}>{cfg.label}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {doc.extracted.flightNumber && (
            <span className="rounded-full px-2 py-0.5" style={{ fontSize: 11, fontWeight: 700, background: "#f5f3ff", color: "#7c3aed" }}>
              {doc.extracted.flightNumber}
            </span>
          )}
          {doc.extracted.pnr && (
            <span className="rounded-full px-2 py-0.5" style={{ fontSize: 11, fontWeight: 700, background: "#eff6ff", color: "#0284c7" }}>
              {doc.extracted.pnr}
            </span>
          )}
          {doc.extracted.seat && (
            <span className="rounded-full px-2 py-0.5" style={{ fontSize: 11, background: "#f5f5f5", color: "#525252" }}>
              מושב {doc.extracted.seat}
            </span>
          )}
          {doc.extracted.checkIn && (
            <span className="rounded-full px-2 py-0.5" style={{ fontSize: 11, background: "#f0fdf4", color: "#16a34a" }}>
              צ׳ק אין {doc.extracted.checkIn}
            </span>
          )}
          <span style={{ fontSize: 11, color: "#a3a3a3", marginRight: "auto" }}>{formatSize(doc.fileSize)} · {date}</span>
        </div>
      </div>
    </button>
  );
}

// ─── Travel Wallet ─────────────────────────────────────────────────────────────
function TravelWallet({ docs, onOpen, onUpload }: {
  docs: TravelDoc[]; onOpen: (d: TravelDoc) => void; onUpload: () => void;
}) {
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 900, color: "#171717", marginBottom: 12 }}>ארנק נסיעה</h2>
      <div className="grid grid-cols-2 gap-3">
        {WALLET_TYPES.map(type => {
          const cfg  = DOC_CONFIG[type];
          const Icon = cfg.icon;
          const doc  = docs.filter(d => d.type === type)[0];
          return (
            <button key={type}
              onClick={() => doc ? onOpen(doc) : onUpload()}
              className="cursor-pointer flex flex-col items-start gap-3 rounded-2xl p-4 transition-all hover:shadow-md"
              style={{ border: `2px solid ${doc ? cfg.color + "33" : "#f0f0f0"}`, background: doc ? cfg.bg : "#fafafa", minHeight: 120 }}>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: doc ? cfg.color : "#e5e5e5" }}>
                <Icon style={{ width: 20, height: 20, color: doc ? "#fff" : "#a3a3a3" }} />
              </div>
              <div className="flex-1">
                <p style={{ fontSize: 14, fontWeight: 800, color: doc ? cfg.color : "#a3a3a3", lineHeight: 1.2 }}>{cfg.label}</p>
                {doc ? (
                  <p style={{ fontSize: 12, color: "#525252", marginTop: 2 }} className="truncate">{doc.title}</p>
                ) : (
                  <div className="mt-1.5 flex items-center gap-1">
                    <Plus className="h-3 w-3" style={{ color: "#a3a3a3" }} />
                    <span style={{ fontSize: 11, color: "#a3a3a3" }}>הוסף</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Static sections ───────────────────────────────────────────────────────────
function HotelSection() {
  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: "#0c1a2e", border: "1px solid #1e3a5f" }}>
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "#1e3a5f" }}>
            <Building2 className="h-6 w-6" style={{ color: "#93c5fd" }} />
          </div>
          <div>
            <p style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>Avalon Boutique Hotel</p>
            <p style={{ fontSize: 13, color: "#64748b" }}>Rhodes Old Town</p>
          </div>
        </div>
        <div className="space-y-2 mb-4">
          {[
            { label: "צ׳ק אין",      value: "7 ספטמבר 2026, 14:00" },
            { label: "צ׳ק אאוט",     value: "10 ספטמבר 2026, 12:00" },
            { label: "לילות",         value: "3 לילות" },
            { label: "כתובת",         value: "Old Town, Rhodes 851 00, Greece" },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-1.5 border-b border-white border-opacity-5 last:border-0">
              <span style={{ fontSize: 13, color: "#64748b" }}>{r.label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{r.value}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <a href="tel:+302241001000"
            className="flex items-center justify-center gap-2 rounded-2xl py-3 transition-colors hover:opacity-80"
            style={{ background: "#1e3a5f", textDecoration: "none" }}>
            <Phone className="h-4 w-4" style={{ color: "#93c5fd" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#93c5fd" }}>התקשר</span>
          </a>
          <a href="https://www.google.com/maps/search/?api=1&query=Avalon+Boutique+Hotel+Rhodes+Old+Town"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl py-3 transition-colors hover:opacity-80"
            style={{ background: "#1e3a5f", textDecoration: "none" }}>
            <Navigation className="h-4 w-4" style={{ color: "#93c5fd" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#93c5fd" }}>מפה</span>
          </a>
        </div>
      </div>
    </div>
  );
}

function EmergencySection() {
  const numbers = [
    { label: "חירום כללי (יוון)",     number: "112",           color: "#dc2626", icon: AlertCircle },
    { label: "מד״א / אמבולנס",        number: "166",           color: "#dc2626", icon: AlertCircle },
    { label: "משטרה יוון",            number: "100",           color: "#1d4ed8", icon: Phone },
    { label: "כיבוי אש",              number: "199",           color: "#f59e0b", icon: Phone },
    { label: "שגרירות ישראל ביוון",   number: "+30 210 671 9530", color: "#0284c7", icon: Phone },
    { label: "בית חולים — רודוס",     number: "+30 22410 22222", color: "#16a34a", icon: MapPin },
  ];
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 900, color: "#171717", marginBottom: 12 }}>🚨 חירום</h2>
      <div className="space-y-2">
        {numbers.map(n => {
          const Icon = n.icon;
          return (
            <a key={n.number} href={`tel:${n.number.replace(/\s/g, "")}`}
              className="flex items-center gap-3 rounded-2xl p-4 transition-all hover:shadow-sm"
              style={{ border: "1px solid #f0f0f0", background: "#fff", textDecoration: "none" }}>
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                style={{ background: n.color + "15" }}>
                <Icon className="h-5 w-5" style={{ color: n.color }} />
              </div>
              <div className="flex-1">
                <p style={{ fontSize: 14, fontWeight: 600, color: "#171717" }}>{n.label}</p>
                <p style={{ fontSize: 16, fontWeight: 800, color: n.color }}>{n.number}</p>
              </div>
              <Phone className="h-4 w-4 flex-shrink-0" style={{ color: "#a3a3a3" }} />
            </a>
          );
        })}
      </div>
    </div>
  );
}

function TripInfoSection() {
  const items = [
    { label: "טיסה הלוך",    value: "FR3512 — TLV → RHO", sub: "7 ספטמבר · 05:20 → 07:05" },
    { label: "טיסה חזור",    value: "FR3513 — RHO → TLV", sub: "10 ספטמבר · 15:10 → 19:30" },
    { label: "אזור זמן",     value: "EEST (UTC+3)",       sub: "כמו ישראל בקיץ" },
    { label: "מטבע",         value: "אירו (€)",           sub: "כרטיסים קבילים בכל מקום" },
    { label: "שפה",          value: "יוונית",             sub: "אנגלית נפוצה מאוד" },
    { label: "חשמל",         value: "230V / Type F",      sub: "כמו ישראל" },
  ];
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 900, color: "#171717", marginBottom: 12 }}>🧳 פרטי הטיול</h2>
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #f0f0f0" }}>
        {items.map((item, i) => (
          <div key={item.label} className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: i < items.length - 1 ? "1px solid #f8f8f8" : "none" }}>
            <div>
              <p style={{ fontSize: 13, color: "#737373" }}>{item.label}</p>
              <p style={{ fontSize: 12, color: "#a3a3a3" }}>{item.sub}</p>
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#171717", textAlign: "left" }}>{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConnectivitySection() {
  const [copied, setCopied] = useState(false);
  const wifiPass = "Avalon2026";
  const copy = () => {
    navigator.clipboard.writeText(wifiPass).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 900, color: "#171717", marginBottom: 12 }}>📶 קישוריות</h2>
      <div className="space-y-3">
        <div className="rounded-2xl p-4" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
          <div className="flex items-center gap-2 mb-2">
            <Wifi className="h-5 w-5 text-green-600" />
            <p style={{ fontSize: 16, fontWeight: 800, color: "#171717" }}>WiFi המלון</p>
          </div>
          <p style={{ fontSize: 13, color: "#737373", marginBottom: 3 }}>רשת: <strong style={{ color: "#171717" }}>Avalon_Guest</strong></p>
          <div className="flex items-center gap-2">
            <p style={{ fontSize: 13, color: "#737373" }}>סיסמה: <strong style={{ color: "#171717" }}>{wifiPass}</strong></p>
            <button onClick={copy} className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-green-100"
              style={{ border: "none", background: "transparent" }}>
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-green-600" />}
            </button>
          </div>
        </div>
        <div className="rounded-2xl p-4" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-5 w-5 text-blue-600" />
            <p style={{ fontSize: 16, fontWeight: 800, color: "#171717" }}>eSIM — יוון</p>
          </div>
          <p style={{ fontSize: 13, color: "#1e40af", lineHeight: 1.6 }}>
            קנו eSIM לפני הטיסה — אפשרויות:
            Airalo · Holafly · Bnesim<br />
            בחרו חבילת נתונים של לפחות 5GB ל-10 ימים
          </p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: "#fef9ec", border: "1px solid #fde68a" }}>
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-5 w-5 text-amber-600" />
            <p style={{ fontSize: 16, fontWeight: 800, color: "#171717" }}>נקודת גישה</p>
          </div>
          <p style={{ fontSize: 13, color: "#92400e" }}>
            הגדר Hotspot מהנייד של מארק כגיבוי לנועם ומעיין — שם רשת + סיסמה ברורים
          </p>
        </div>
      </div>
    </div>
  );
}

const GREEK_MINI: { greek: string; pronunciation: string; hebrew: string; en: string }[] = [
  { greek: "Γεια σου",               pronunciation: "Ya SOO",              hebrew: "שלום",              en: "Hello"           },
  { greek: "Ευχαριστώ",              pronunciation: "Ef-ha-ris-TO",        hebrew: "תודה",              en: "Thank you"       },
  { greek: "Πόσο κάνει;",            pronunciation: "PO-so KA-ni",         hebrew: "כמה זה עולה",       en: "How much?"       },
  { greek: "Έχω αλλεργία στο γάλα", pronunciation: "E-ho a-ler-GI-a GA-la", hebrew: "אלרגיה לחלב",   en: "Milk allergy"    },
  { greek: "Χωρίς γάλα",             pronunciation: "Ho-RIS GA-la",        hebrew: "ללא חלב",           en: "No milk"         },
  { greek: "Πού είναι η τουαλέτα;",  pronunciation: "Pou I-ne tua-LE-ta",  hebrew: "איפה השירותים",     en: "Where's bathroom" },
  { greek: "Τον λογαριασμό",         pronunciation: "ton lo-ga-ri-as-MO",  hebrew: "חשבון בבקשה",       en: "The bill"        },
  { greek: "Χρειάζομαι βοήθεια!",   pronunciation: "hri-A-zo-me vo-I-thia", hebrew: "אני צריך עזרה",  en: "I need help!"    },
];

function GreekMiniSection() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(text); setTimeout(() => setCopied(null), 2000);
  };
  return (
    <div>
      <button onClick={() => setOpen(v => !v)}
        className="flex w-full cursor-pointer items-center justify-between rounded-2xl p-5 transition-colors hover:bg-neutral-50"
        style={{ border: "1.5px solid #1d4ed8", background: open ? "#eff6ff" : "#fff" }}>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: "#1d4ed8" }}>
            <Languages className="h-5 w-5 text-white" />
          </div>
          <div className="text-right">
            <p style={{ fontSize: 17, fontWeight: 800, color: "#171717" }}>יוונית בסיסית</p>
            <p style={{ fontSize: 13, color: "#737373" }}>8 ביטויים חיוניים לטיול</p>
          </div>
        </div>
        {open ? <ChevronUp className="h-5 w-5 text-neutral-400" /> : <ChevronDown className="h-5 w-5 text-neutral-400" />}
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          {/* Allergy card — always prominent */}
          <div className="rounded-2xl p-4" style={{ background: "#7f1d1d", border: "2px solid #dc2626" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#fca5a5", marginBottom: 6 }}>כרטיס חירום לנועם — הראה למלצר</p>
            <p style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>Έχω σοβαρή αλλεργία στο γάλα</p>
            <p style={{ fontSize: 13, color: "#fca5a5", fontStyle: "italic" }}>E-ho so-va-RI a-ler-GI-a sto GA-la</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#fecaca", marginTop: 4 }}>יש לי אלרגיה חמורה לחלב</p>
          </div>

          {GREEK_MINI.map(p => (
            <button key={p.greek} onClick={() => copy(p.greek)}
              className="flex w-full items-center gap-3 rounded-2xl p-3.5 text-right transition-all cursor-pointer hover:bg-neutral-50"
              style={{ border: "1px solid #f0f0f0", background: copied === p.greek ? "#f0fdf4" : "#fff" }}>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 16, fontWeight: 800, color: "#171717" }}>{p.greek}</p>
                <p style={{ fontSize: 11, color: "#1d4ed8", fontStyle: "italic" }}>{p.pronunciation}</p>
                <p style={{ fontSize: 12, color: "#737373" }}>{p.hebrew} · {p.en}</p>
              </div>
              {copied === p.greek
                ? <Check className="h-4 w-4 flex-shrink-0 text-green-500" />
                : <Copy className="h-4 w-4 flex-shrink-0 text-neutral-400" />
              }
            </button>
          ))}

          <a href="/settings"
            className="flex items-center justify-center gap-2 rounded-2xl py-3 transition-colors hover:bg-neutral-50"
            style={{ border: "1px solid #e5e5e5", textDecoration: "none" }}>
            <Languages className="h-4 w-4 text-blue-600" />
            <span style={{ fontSize: 14, fontWeight: 700, color: "#1d4ed8" }}>לכל המחאות המלאות ← הגדרות</span>
            <ArrowRight className="h-4 w-4 text-blue-400" />
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
type Section = "documents" | "hotel" | "emergency" | "trip" | "connectivity" | "greek";
const SECTIONS: { id: Section; label: string }[] = [
  { id: "documents",    label: "מסמכים"  },
  { id: "hotel",        label: "מלון"    },
  { id: "emergency",    label: "חירום"   },
  { id: "trip",         label: "טיול"    },
  { id: "connectivity", label: "רשת"     },
  { id: "greek",        label: "יוונית"  },
];

export default function HubPage() {
  const [docs,      setDocs]      = useState<TravelDoc[]>([]);
  const [viewing,   setViewing]   = useState<TravelDoc | null>(null);
  const [uploading, setUploading] = useState(false);
  const [section,   setSection]   = useState<Section>("documents");
  const [search,    setSearch]    = useState("");
  const [loaded,    setLoaded]    = useState(false);

  // Load docs from IndexedDB
  useEffect(() => {
    dbGetAll().then(d => { setDocs(d); setLoaded(true); }).catch(() => setLoaded(true));
  }, []);

  const handleSave = (doc: TravelDoc) => {
    setDocs(prev => [doc, ...prev.filter(d => d.id !== doc.id)]);
  };
  const handleDelete = async (id: string) => {
    await dbDelete(id).catch(() => {});
    setDocs(prev => prev.filter(d => d.id !== id));
  };

  const filteredDocs = docs.filter(d =>
    !search ||
    d.title.includes(search) ||
    d.extracted.flightNumber?.includes(search) ||
    d.extracted.pnr?.toLowerCase().includes(search.toLowerCase()) ||
    d.extracted.bookingNumber?.toLowerCase().includes(search.toLowerCase())
  );

  // Smart reminders based on docs
  const now = new Date();
  const reminders: string[] = [];
  docs.forEach(d => {
    if ((d.type === "boarding-pass" || d.type === "flight-ticket") && d.extracted.departureTime) {
      const depDate = new Date(d.uploadedAt); // placeholder — no date from extracted
      void depDate;
    }
    if (d.type === "passport" && d.extracted.expiryDate) {
      reminders.push(`דרכון — בדוק תוקף: ${d.extracted.expiryDate}`);
    }
  });
  const trip = new Date("2026-09-07T05:20:00");
  const daysToTrip = Math.ceil((trip.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen" style={{ background: "#f8f8f8", fontFamily: "'Rubik', system-ui, sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40" style={{ background: "rgba(248,248,248,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #f0f0f0" }}>
        <div className="mx-auto max-w-2xl px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: "#171717", lineHeight: 1.1 }}>מרכז הטיול</h1>
              <p style={{ fontSize: 13, color: "#737373" }}>
                {daysToTrip > 0 ? `${daysToTrip} ימים לרודוס 🇬🇷` : "רודוס — ספטמבר 2026"}
              </p>
            </div>
            <button onClick={() => setUploading(true)}
              className="flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-3 transition-colors hover:opacity-80"
              style={{ background: "#171717", border: "none" }}>
              <Upload className="h-4 w-4 text-white" />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>העלה</span>
            </button>
          </div>
          {/* Search */}
          <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5" style={{ background: "#fff", border: "1px solid #e5e5e5" }}>
            <Search className="h-4 w-4 text-neutral-400 flex-shrink-0" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="חפש מסמך, מספר הזמנה, מספר טיסה..."
              style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: "#171717", background: "transparent", textAlign: "right" }}
            />
          </div>
        </div>
        {/* Section tabs */}
        <div className="flex overflow-x-auto gap-2 px-5 pb-4 no-scrollbar"
          style={{ scrollbarWidth: "none" }}>
          {SECTIONS.map(s => (
            <button key={s.id}
              onClick={() => setSection(s.id)}
              className="cursor-pointer flex-shrink-0 rounded-full px-4 py-2 transition-all"
              style={{
                fontSize: 13, fontWeight: 700, border: "none",
                background: section === s.id ? "#171717" : "#fff",
                color:      section === s.id ? "#fff"     : "#525252",
                boxShadow:  section === s.id ? "none"     : "0 1px 3px rgba(0,0,0,0.06)",
              }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-5 py-6 pb-32 space-y-8">
        {/* Smart reminder */}
        {daysToTrip > 0 && daysToTrip <= 14 && (
          <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "#f5f3ff", border: "1px solid #ddd6fe" }}>
            <Clock className="h-5 w-5 flex-shrink-0" style={{ color: "#7c3aed" }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: "#4c1d95" }}>
              {daysToTrip} ימים לטיסה — וודא שכל המסמכים מוכנים!
            </span>
          </div>
        )}

        {/* Travel wallet — always visible at top */}
        {(section === "documents" || !search) && section === "documents" && (
          <>
            <TravelWallet docs={docs} onOpen={setViewing} onUpload={() => setUploading(true)} />

            {/* Documents list */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "#171717" }}>
                  המסמכים שלי
                  {docs.length > 0 && (
                    <span className="mr-2 rounded-full px-2 py-0.5" style={{ fontSize: 12, fontWeight: 700, background: "#f5f5f5", color: "#737373" }}>
                      {docs.length}
                    </span>
                  )}
                </h2>
                <button onClick={() => setUploading(true)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2 transition-colors hover:bg-neutral-100"
                  style={{ border: "1.5px dashed #d4d4d4", background: "transparent" }}>
                  <Plus className="h-4 w-4 text-neutral-400" />
                  <span style={{ fontSize: 13, color: "#737373" }}>הוסף</span>
                </button>
              </div>

              {!loaded && (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-500" />
                </div>
              )}

              {loaded && filteredDocs.length === 0 && !search && (
                <div className="flex flex-col items-center gap-4 rounded-3xl py-12 px-6 text-center"
                  style={{ border: "2px dashed #e5e5e5", background: "#fafafa" }}>
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "#f5f5f5" }}>
                    <FileText className="h-8 w-8 text-neutral-300" />
                  </div>
                  <div>
                    <p style={{ fontSize: 18, fontWeight: 800, color: "#737373", marginBottom: 6 }}>אין מסמכים עדיין</p>
                    <p style={{ fontSize: 14, color: "#a3a3a3", lineHeight: 1.5 }}>העלה כרטיסי עלייה, הזמנות מלון, דרכונים וביטוח — הכל בהישג יד</p>
                  </div>
                  <button onClick={() => setUploading(true)}
                    className="cursor-pointer rounded-2xl px-6 py-3 transition-colors hover:opacity-80"
                    style={{ background: "#171717", color: "#fff", fontWeight: 800, border: "none" }}>
                    העלה את המסמך הראשון
                  </button>
                </div>
              )}

              {loaded && filteredDocs.length === 0 && search && (
                <div className="rounded-2xl py-8 text-center" style={{ background: "#fafafa" }}>
                  <p style={{ color: "#737373" }}>לא נמצאו תוצאות עבור &quot;{search}&quot;</p>
                </div>
              )}

              {filteredDocs.length > 0 && (
                <div className="space-y-2">
                  {filteredDocs.map(d => (
                    <DocCard key={d.id} doc={d} onClick={() => setViewing(d)} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {section === "hotel"        && <HotelSection />}
        {section === "emergency"    && <EmergencySection />}
        {section === "trip"         && <TripInfoSection />}
        {section === "connectivity" && <ConnectivitySection />}
        {section === "greek"        && <GreekMiniSection />}
      </div>

      {/* Upload sheet */}
      {uploading && (
        <UploadSheet onSave={handleSave} onClose={() => setUploading(false)} />
      )}

      {/* Document viewer */}
      {viewing && (
        <DocViewer doc={viewing} onClose={() => setViewing(null)} onDelete={handleDelete} />
      )}
    </div>
  );
}
