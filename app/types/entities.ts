import type { BaseEntity, Link, Social } from "./base";

export interface Tags extends BaseEntity {
  icon?: string;
}

export interface Sport extends BaseEntity {
  icon?: string;
  image_url?: string;
}

export interface Center extends BaseEntity {
  description: string;
  images: string[];
  address?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  links?: Link[];
  socials?: Social[];
  establishment?: Array<{ id: string; name: string }>;
  sports: Array<{ id: string; name: string }>;
  facilities: Array<{ id: string; name: string }>;
  is_active: boolean | null;
  tags: Tags[];
}

export interface Group extends BaseEntity {
  tag_count: number;
  sports: Array<{ id: string; name: string }>;
  tags: Array<{ id: string; name: string }>;
}
