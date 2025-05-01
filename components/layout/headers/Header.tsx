"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Container from "@/components/layout/Container";
import IconButton from "@/components/ui/IconButton";
import SearchBar from "@/components/ui/SearchBar";
import DesktopNav from "./DesktopNav";
import MobileNav from "./MobileNav";
import { NavItem } from "@/types/navigation";
import styles from "./Header.module.css";

// Define navigation items to avoid duplication
const navItems: NavItem[] = [
  {
    href: "/explore",
    label: "Explore",
    ariaLabel: "Explore sports and activities",
    title: "Explore sports and activities",
  },
  {
    href: "/business",
    label: "Business",
    ariaLabel: "Business solutions",
    title: "Solutions for sports businesses",
  },
];

// Additional navigation items for mobile menu
const fullNavItems: NavItem[] = [
  ...navItems,
  {
    href: "/deals",
    label: "Deals",
    ariaLabel: "View current deals",
    title: "View current deals",
  },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchInNav, setShowSearchInNav] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const pathname = usePathname();

  // Check if we're on the search page
  const isSearchPage = pathname?.includes("/search") || false;

  useEffect(() => {
    // Lock body scroll when mobile menu is open
    if (mobileMenuOpen && !isLargeScreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleResize = () => {
      const prevIsLargeScreen = isLargeScreen;
      const isNowLargeScreen = window.innerWidth >= 768;

      // When screen size changes, close the menu to avoid inconsistent states
      if (prevIsLargeScreen !== isNowLargeScreen && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }

      setIsLargeScreen(isNowLargeScreen);
    };

    const handleScroll = () => {
      const smallScreenThreshold = 250;
      const largeScreenThreshold = 350;
      const scrollThreshold = isLargeScreen
        ? largeScreenThreshold
        : smallScreenThreshold;

      const wasShowingSearchInNav = showSearchInNav;
      const newShowSearchInNav = window.scrollY > scrollThreshold;

      setShowSearchInNav(newShowSearchInNav);

      // Only close mobile menu if transitioning from scrolled state to non-scrolled state
      // AND we're on a large screen where desktop nav will appear
      if (
        wasShowingSearchInNav &&
        !newShowSearchInNav &&
        isLargeScreen &&
        mobileMenuOpen
      ) {
        setMobileMenuOpen(false);
      }
    };

    // Handle clicks outside the menu to close it
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Close menu if clicking outside and menu is open
      if (
        mobileMenuOpen &&
        !target.closest("#mobile-menu") &&
        !target.closest("#menu-button")
      ) {
        setMobileMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("click", handleClickOutside);
      // Reset body overflow when component unmounts
      document.body.style.overflow = "";
    };
  }, [isLargeScreen, mobileMenuOpen, showSearchInNav]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Separated rendering for mobile vs desktop menus
  const renderMobileMenu = () => {
    if (!isLargeScreen) {
      return <MobileNav isOpen={mobileMenuOpen} navItems={fullNavItems} />;
    }
    return null;
  };

  // Desktop dropdown menu
  const renderDesktopDropdown = () => {
    if (isLargeScreen) {
      return (
        <MobileNav
          isOpen={mobileMenuOpen && (showSearchInNav || isSearchPage)}
          navItems={fullNavItems}
          parentElementId="menu-button-container"
        />
      );
    }
    return null;
  };

  // Mobile view: determine if logo should be visible
  const showLogoInMobile = !showSearchInNav || mobileMenuOpen;

  // Mobile view: determine if search should be visible
  const showSearchInMobile = showSearchInNav && !mobileMenuOpen;

  // Set header content class based on conditions
  const headerContentClass = `${styles.headerContent} ${
    showSearchInNav || isSearchPage ? styles.contentScrolled : ""
  }`;

  return (
    <header
      className={`${styles.header} ${
        showSearchInNav || isSearchPage ? styles.headerScrolled : ""
      } ${isSearchPage ? styles.isSearchPage : ""} ${
        mobileMenuOpen && !isLargeScreen ? styles.mobileMenuActive : ""
      }`}
      role="banner"
      aria-label="Site header"
    >
      <Container>
        <div className={headerContentClass}>
          {/* Logo - conditionally visible on mobile, always visible on desktop */}
          {(isLargeScreen || showLogoInMobile) && (
            <Link
              href="/"
              className={styles.logo}
              aria-label="Bord Home"
              title="Bord - Find Sports & Activities"
            >
              <Image
                src="/bord.svg"
                alt="Bord Logo"
                width={60}
                height={60}
                priority
              />
            </Link>
          )}

          {/* Desktop Navigation - not in search mode */}
          {isLargeScreen && !showSearchInNav && !isSearchPage ? (
            <div className={styles.desktopNav}>
              <DesktopNav navItems={navItems} showLinks={true} />
            </div>
          ) : (
            /* Search and Desktop Nav - conditionally visible */
            <div className={styles.search}>
              {/* Search Bar */}
              {(isLargeScreen && (isSearchPage || showSearchInNav)) ||
              (!isLargeScreen && showSearchInMobile) ||
              isSearchPage ? (
                <SearchBar placeholder="Search for sports & activities" />
              ) : null}
            </div>
          )}

          {/* Mobile Menu Button - conditionally visible based on screen size and nav state */}
          <div className={styles.mobileControls} id="menu-button-container">
            {/* Only show menu button when desktop nav is not visible */}
            {(showSearchInNav || isSearchPage || !isLargeScreen) && (
              <IconButton
                id="menu-button"
                icon={
                  <Image
                    src={
                      mobileMenuOpen
                        ? "/icons/utility-outline/cross.svg"
                        : "/icons/utility-outline/menu.svg"
                    }
                    alt={mobileMenuOpen ? "Close menu" : "Open menu"}
                    width={24}
                    height={24}
                  />
                }
                size="md"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                onClick={toggleMobileMenu}
              />
            )}

            {/* Desktop dropdown menu */}
            {renderDesktopDropdown()}
          </div>
        </div>
      </Container>

      {/* Mobile Menu for small screens */}
      {renderMobileMenu()}
    </header>
  );
}
