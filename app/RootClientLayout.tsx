"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import { ThemeProvider } from "@/store/ThemeProvider";
import Header from "@/components/layout/headers/Header";
import Footer from "@/components/layout/Footer";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import SearchInitializer from "@/components/search/SearchInit";

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

  // Check if it's a center detail page (matches pattern /centers/{id})
  const isCenterDetailPage = /^\/centers\/[a-zA-Z0-9-]+$/.test(pathname);

  // For center detail pages, use mediumScreen breakpoint (768px)
  const shouldHideNavBar =
    (pathname.startsWith("/search") && !isLargeScreen) ||
    (isCenterDetailPage && !isMediumScreen);

  // Hide footer on search pages
  const shouldHideFooter = pathname.startsWith("/search");

  return (
    <Provider store={store}>
      <ThemeProvider>
        <SearchInitializer />
        {isClientSide && !shouldHideNavBar && <Header />}
        {children}
        {!shouldHideFooter && <Footer />}
      </ThemeProvider>
    </Provider>
  );
}
