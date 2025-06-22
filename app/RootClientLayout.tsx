"use client";

import { Provider } from "react-redux";
import { SessionProvider } from "next-auth/react";
import { store } from "@/store/store";
import { ThemeProvider } from "@/store/ThemeProvider";
import Header from "@/components/layout/headers/nav/Header";
import Footer from "@/components/layout/Footer";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function RootClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isMediumScreen, setIsMediumScreen] = useState(false);
  const [isClientSide, setIsClientSide] = useState(false);

  useEffect(() => {
    setIsClientSide(true);

    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1023);
      setIsMediumScreen(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const isCenterDetailPage = /^\/centers\/[a-zA-Z0-9-]+$/.test(pathname);
  const isSearchPage = pathname.startsWith("/search");

  // Check if current page is an auth page that should not have header/footer
  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/auth/");

  // On search pages, hide main header below 1023px
  // On center detail pages, hide header below 768px
  // On auth pages, always hide header and footer
  const shouldHideNavBar =
    isAuthPage ||
    (isSearchPage && !isLargeScreen) ||
    (isCenterDetailPage && !isMediumScreen);

  const shouldHideFooter = isSearchPage || isAuthPage;

  // Add a class to the body when on search page
  useEffect(() => {
    if (isClientSide) {
      if (isSearchPage) {
        document.body.classList.add("search-page");
      } else {
        document.body.classList.remove("search-page");
      }
    }

    return () => {
      if (isClientSide) {
        document.body.classList.remove("search-page");
      }
    };
  }, [isSearchPage, isClientSide]);

  return (
    <Provider store={store}>
      <SessionProvider>
        <ThemeProvider>
          {isClientSide && !shouldHideNavBar && <Header />}
          <main className={isSearchPage ? "search-page-main" : ""}>
            {children}
          </main>
          {!shouldHideFooter && <Footer />}
        </ThemeProvider>
      </SessionProvider>
    </Provider>
  );
}
