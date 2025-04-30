"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import { DesktopNavProps, NavLinkProps } from "@/types/navigation";
import styles from "./DesktopNav.module.css";

export default function DesktopNav({
  navItems,
  showLinks = true,
}: DesktopNavProps) {
  return (
    <nav
      className={styles.desktopNav}
      aria-label="Primary navigation"
      role="navigation"
      itemScope
      itemType="https://schema.org/SiteNavigationElement"
    >
      {showLinks &&
        navItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            ariaLabel={item.ariaLabel}
            title={item.title}
            variant="desktop"
          >
            {item.label}
          </NavLink>
        ))}

      <Button
        variant="outline"
        size="md"
        iconPath="/icons/utility-filled/profile"
        iconPosition="right"
        onClick={() => (window.location.href = "/login")}
      >
        Sign in
      </Button>
    </nav>
  );
}

function NavLink({ href, children, ariaLabel, title }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={styles.navLink}
      aria-label={ariaLabel}
      title={title}
      itemProp="url"
    >
      <span itemProp="name">{children}</span>
    </Link>
  );
}
