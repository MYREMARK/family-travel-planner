export type Role = "adult" | "child";

export interface FamilyMember {
  name: string;
  role: Role;
  age: number;
}

export interface FamilyProfile {
  name: string;
  members: FamilyMember[];
  allergies: string[];
  dietary: string[];
  interests: string[];
  preferences: string[];
  habits: { wakeTime: string; avoids: string[] };
  goal: string;
  budgetPerDay: number;
  currency: string;
}

export interface FitBreakdown {
  label: string;
  score: number;
  color: string;
}

export interface BudgetCategory {
  label: string;
  amount: number;
  pct: number;
  color: string;
}

export interface DestinationTag {
  label: string;
  type: "positive" | "warning";
}

export interface Destination {
  name: string;
  country: string;
  emoji: string;
  dates: { start: string; end: string; nights: number };
  fitScore: number;
  fitBreakdown: FitBreakdown[];
  tags: DestinationTag[];
  budget: { total: number; breakdown: BudgetCategory[] };
  stats: { label: string; value: string }[];
}

export type EventType = "attraction" | "restaurant" | "beach" | "transport" | "activity";
export type SafetyStatus = true | false | "partial";

export interface ItineraryEvent {
  time: string;
  title: string;
  type: EventType;
  tags: string[];
  cost: number;
  duration: string;
  lat: number;
  lng: number;
  allergyNote?: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  emoji: string;
  estimatedCost: number;
  events: ItineraryEvent[];
}

export interface Hotel {
  id: number;
  name: string;
  stars: number;
  location: string;
  distanceSea: string;
  pricePerNight: number;
  familyScore: number;
  recommended: boolean;
  amenities: string[];
  bookingUrl: string;
  familySafe: boolean;
  warningNote?: string;
}

export interface Restaurant {
  id: number;
  name: string;
  stars: number;
  location: string;
  cuisine: string;
  priceRange: string;
  glutenFree: boolean;
  nutFree: boolean;
  allergyNote: string;
  tags: string[];
  safe: SafetyStatus;
  warningNote?: string;
}
