"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { MobileNavProps } from "@/types";
import Container from "@/components/layout/Container";
import styles from "./MobileNav.module.css";

interface ExtendedMobileNavProps extends MobileNavProps {
  parentElementId?: string;
}

export default function MobileNav({
  isOpen,
  navItems,
  parentElementId,
}: ExtendedMobileNavProps) {
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check the screen width on component mount and window resize
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 768);
    };

    // Initial check
    handleResize();

    // Add event listener for resize
    window.addEventListener("resize", handleResize);

    // Position the menu relative to the button (for desktop only)
    const positionMenu = () => {
      if (isLargeScreen && parentElementId && menuRef.current) {
        const parentElement = document.getElementById(parentElementId);
        if (parentElement) {
          const parentRect = parentElement.getBoundingClientRect();
          menuRef.current.style.position = "absolute";
          // Let CSS handle the positioning relative to parent
          menuRef.current.style.top = "";
          menuRef.current.style.right = "0";
          menuRef.current.style.width = "260px";
        }
      } else if (!isLargeScreen && menuRef.current) {
        // Reset mobile styling
        menuRef.current.style.position = "fixed";
        menuRef.current.style.width = "100%";
        menuRef.current.style.right = "";
        menuRef.current.style.top = "80px";
      }
    };

    if (isOpen) {
      positionMenu();

      // Focus trap for accessibility
      const focusableElements = menuRef.current?.querySelectorAll(
        'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>;

      if (focusableElements && focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isLargeScreen, isOpen, parentElementId]);

  // Early return if not open to ensure the menu isn't in the DOM at all when closed
  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      id="mobile-menu"
      className={`${styles.mobileMenu} ${isOpen ? styles.mobileMenuOpen : ""} ${
        isLargeScreen ? styles.desktopDropdown : ""
      }`}
      aria-hidden={!isOpen}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      {isLargeScreen ? (
        // Small dropdown menu for desktop
        <div className={styles.menuContainer}>
          <div className={styles.mobileMenuContent}>
            {/* Sign In Card */}
            <div className={styles.mobileMenuCard}>
              <Link href="/login" className={styles.mobileMenuItem}>
                <div className={styles.mobileMenuItemContent}>
                  <div className={styles.mobileMenuIcon}>
                    <Image
                      src="/icons/utility-filled/profile.svg"
                      alt=""
                      width={24}
                      height={24}
                    />
                  </div>
                  <span>Sign In</span>
                </div>
                <div className={styles.mobileMenuChevron}>
                  <Image
                    src="/icons/utility-outline/right.svg"
                    alt=""
                    width={20}
                    height={20}
                  />
                </div>
              </Link>
            </div>

            {/* Navigation Links without cards */}
            <div className={styles.mobileMenuCard}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={styles.mobileMenuItem}
                  aria-label={item.ariaLabel}
                  title={item.title}
                >
                  <div className={styles.mobileMenuItemContent}>
                    <span>{item.label}</span>
                  </div>
                  <div className={styles.mobileMenuChevron}>
                    <Image
                      src="/icons/utility-outline/right.svg"
                      alt=""
                      width={20}
                      height={20}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Full-screen menu for mobile
        <Container>
          <div className={styles.mobileMenuContent}>
            {/* Sign In Card */}
            <div className={styles.mobileMenuCard}>
              <Link href="/login" className={styles.mobileMenuItem}>
                <div className={styles.mobileMenuItemContent}>
                  <div className={styles.mobileMenuIcon}>
                    <Image
                      src="/icons/utility-filled/profile.svg"
                      alt=""
                      width={24}
                      height={24}
                    />
                  </div>
                  <span>Sign In</span>
                </div>
                <div className={styles.mobileMenuChevron}>
                  <Image
                    src="/icons/utility-outline/right.svg"
                    alt=""
                    width={20}
                    height={20}
                  />
                </div>
              </Link>
            </div>

            {/* Navigation Links Card */}
            <div className={styles.mobileMenuCard}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={styles.mobileMenuItem}
                  aria-label={item.ariaLabel}
                  title={item.title}
                >
                  <div className={styles.mobileMenuItemContent}>
                    <span>{item.label}</span>
                  </div>
                  <div className={styles.mobileMenuChevron}>
                    <Image
                      src="/icons/utility-outline/right.svg"
                      alt=""
                      width={20}
                      height={20}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      )}
    </div>
  );
}
