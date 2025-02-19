"use client";

import { useState, useEffect } from "react";
import NavBar from "./ui/components/NavBar";
import { usePathname } from "next/navigation";
import { Provider } from "react-redux";
import { store } from "@/store/store";

export default function RootClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1023);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const shouldHideNavBar = pathname.startsWith("/search") && !isLargeScreen;

  return (
    <Provider store={store}>
      {!shouldHideNavBar && <NavBar />}
      {children}
    </Provider>
  );
}
