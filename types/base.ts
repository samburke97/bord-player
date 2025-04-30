// base.ts
export type LinkOptions =
  | "Book Now"
  | "Website"
  | "Directions"
  | "More Info"
  | "Coaching"
  | "Learn More"
  | "First Visit";

export type SocialOptions =
  | "Facebook"
  | "Instagram"
  | "Twitter"
  | "LinkedIn"
  | "Youtube";

export interface BaseEntity {
  id: string;
  name: string;
  lastEdited?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
  deletedAt?: Date | null;
}

export interface Link {
  id: string;
  type: string | null;
  url: string | null;
}

export interface Social {
  id: string;
  platform: string | null;
  url: string | null;
}

export interface Location {
  latitude: number | string | null;
  longitude: number | string | null;
}

export type UserLocation = Location;
