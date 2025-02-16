"use client";

import { useState, useEffect } from "react";
import styles from "./NavBar.module.css";
import Image from "next/image";
import { Bars3Icon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchBar from "./SearchBar/SearchBarClient";

const NavBar = () => {
  const [showSearchInNav, setShowSearchInNav] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      const isNowLargeScreen = window.innerWidth >= 1024;

      if (isNowLargeScreen) {
        setIsMobileMenuOpen(false);
      }
      setIsLargeScreen(isNowLargeScreen);
    };

    const handleScroll = () => {
      const smallScreenThreshold = 250;
      const largeScreenThreshold = 350;
      const scrollThreshold = isLargeScreen
        ? largeScreenThreshold
        : smallScreenThreshold;

      setShowSearchInNav(window.scrollY > scrollThreshold);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isLargeScreen]);

  const isSearchPage = pathname.includes("/search");

  return (
    <nav className={`${styles.nav}`}>
      <div className="content-container">
        <div
          className={`${styles.nav__navbar} ${
            isSearchPage ? styles.nav__searchPage : ""
          }`}
        >
          <div className={`${styles.nav__logoOrSearch}`}>
            {(isLargeScreen || !showSearchInNav) && (
              <Link href={`/`}>
                <Image
                  src="/images/bord.png"
                  alt="Bord Logo"
                  width={78}
                  height={18}
                  layout="intrinsic"
                />
              </Link>
            )}
          </div>

          {isSearchPage || (isLargeScreen && showSearchInNav) ? (
            <div className={`${styles.nav__searchBarLarge}`}>
              <SearchBar />
            </div>
          ) : !isLargeScreen && showSearchInNav ? (
            <div className={`${styles.nav__searchBarSmall}`}>
              <SearchBar />
            </div>
          ) : null}

          <div
            className={`${styles.nav__icon}`}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            <Bars3Icon className="w-[24px] h-[24px]" />
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className={styles.nav__mobileMenu}>
              <button
                className={styles.nav__closeButton}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
