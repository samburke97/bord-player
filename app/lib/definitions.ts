// definitions.ts

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

export type Center = {
  id: string;
  name: string;
  description: string;
  images: string[];
  last_edited?: Date | null;
  address?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  links?: Array<{ id: string; type: LinkOptions; url: string }>;
  socials?: Array<{ id: string; platform: SocialOptions; url: string }>;
  establishment?: Array<{ id: string; name: string }>;
  sports?: Array<{ id: string; name: string }>;
  facilities?: Array<{ id: string; name: string }>;
  is_active: boolean | null;
};

export type Sport = {
  id: string;
  name: string;
  icon?: string;
  image_url?: string;
  last_edited?: Date | null;
};

export type Tags = {
  id: string;
  name: string;
  icon?: string;
  last_edited?: Date;
};

export type Group = {
  id: string;
  name: string;
  last_edited: Date;
  tag_count: number;
  sports: Array<{ id: string; name: string }>;
  tags: Array<{ id: string; name: string }>;
};
