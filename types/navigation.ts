import { ReactNode } from "react";

export interface NavItem {
  href: string;
  label: string;
  ariaLabel?: string;
  title?: string;
  icon?: string;
}

export interface NavLinkProps {
  href: string;
  children: ReactNode;
  ariaLabel?: string;
  title?: string;
  variant?: "desktop" | "mobile";
  icon?: string;
}

export interface DesktopNavProps {
  navItems: NavItem[];
  showLinks?: boolean;
}

export interface MobileNavProps {
  isOpen: boolean;
  navItems: NavItem[];
}

export interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}
export * from "./navigation";
