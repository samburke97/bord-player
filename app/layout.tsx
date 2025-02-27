import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RootClientLayout from "./RootClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "bord Sports",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <RootClientLayout>{children}</RootClientLayout>
      </body>
    </html>
  );
}
