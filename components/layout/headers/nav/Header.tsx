"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Container from "@/components/layout/Container";
import IconButton from "@/components/ui/IconButton";
import SearchBar from "@/components/ui/searchbar/SearchBar";
import DesktopNav from "./DesktopNav";
import MobileNav from "./MobileNav";
import { NavItem } from "@/types/navigation";
import styles from "./Header.module.css";

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

  const isSearchPage = pathname?.includes("/search") || false;

  useEffect(() => {
    if (mobileMenuOpen && !isLargeScreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleResize = () => {
      const prevIsLargeScreen = isLargeScreen;
      const isNowLargeScreen = window.innerWidth >= 768;

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

      if (
        wasShowingSearchInNav &&
        !newShowSearchInNav &&
        isLargeScreen &&
        mobileMenuOpen
      ) {
        setMobileMenuOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
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

  const renderMobileMenu = () => {
    if (!isLargeScreen) {
      return <MobileNav isOpen={mobileMenuOpen} navItems={fullNavItems} />;
    }
    return null;
  };

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
            <div className={styles.search}>
              {(isLargeScreen && (isSearchPage || showSearchInNav)) ||
              (!isLargeScreen && showSearchInMobile) ||
              isSearchPage ? (
                <SearchBar placeholder="Search for sports & activities" />
              ) : null}
            </div>
          )}

          <div className={styles.mobileControls} id="menu-button-container">
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

            {renderDesktopDropdown()}
          </div>
        </div>
      </Container>

      {renderMobileMenu()}
    </header>
  );
}
