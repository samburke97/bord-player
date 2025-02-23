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
  last_edited?: Date | null;
}

export interface Link {
  id: string;
  type: LinkOptions;
  url: string;
}

export interface Social {
  id: string;
  platform: SocialOptions;
  url: string;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface Location {
  latitude: number;
  longitude: number;
}
