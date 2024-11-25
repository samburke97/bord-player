"use client";

import NavBar from "./ui/components/NavBar";

export default function RootClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavBar />
      {children}
    </>
  );
}
