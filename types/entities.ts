import type { BaseEntity, Link, Social } from "./base";

export interface Tags extends BaseEntity {
  icon?: string;
}

export interface Facility {
  id: string;
  name: string;
}

export interface Sport {
  id: string;
  name: string;
  imageUrl?: string | null;
}

export interface Tag {
  id: string;
  name: string;
}

export interface OpeningHour {
  dayOfWeek: number; // 0 = Monday, 1 = Tuesday, etc.
  isOpen: boolean;
  openTime: string; // "HH:MM" format
  closeTime: string; // "HH:MM" format
}

// Base center interface for all center data
export interface CenterSummary {
  id: string;
  name: string;
  address: string | null;
  imageUrl: string | null;
  sports: Array<{
    id: string;
    name: string;
  }>;
  facilities: Array<{
    id: string;
    name: string;
  }>;
  isActive: boolean;
}
export interface Group extends BaseEntity {
  tag_count: number;
  sports: Array<{ id: string; name: string }>;
  tags: Array<{ id: string; name: string }>;
}

// Center types
export interface Center {
  id: string;
  name: string;
  address: string | null;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  logoUrl: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  isOpenNow: boolean;
  type?: string | null;
  locationNotice?: string;
  distance?: number;

  // Relationships
  images: string[];
  facilities: Facility[];
  tags: Tag[];
  sports: Sport[];
  openingHours: OpeningHours[];
  socials: SocialLink[];
  links: WebLink[];
  activities: Activity[];
}

export interface Facility {
  id: string;
  name: string;
  imageUrl: string | null;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Sport {
  id: string;
  name: string;
}

export interface OpeningHours {
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  isToday: boolean;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

export interface WebLink {
  id: string;
  type: string;
  url: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  buttonTitle: string;
  buttonLink: string;
  type: string;
  displayOrder: number;
  pricing: ActivityPricing[];
}

export interface ActivityPricing {
  id: string;
  price: number;
  playerType: string;
  duration: string | null;
  priceType: string;
}

// Days of the week mapping for readable display
export const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
