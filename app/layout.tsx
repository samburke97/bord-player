import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import RootClientLayout from "./RootClientLayout";
import Script from "next/script";
import "@/app/styles/globals.css";

// Load Inter font with optimized loading
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-family",
  preload: true,
});

// Rich metadata for SEO
export const metadata: Metadata = {
  metadataBase: new URL("https://bordfinder.com"),
  title: {
    template: "%s | Bord - Find Sports & Activities Near You",
    default: "Bord - Find Sports & Activities Near You",
  },
  description:
    "Discover and book sports activities and facilities near you. Find courts, fields, classes and more with Bord's intuitive search platform.",
  keywords: [
    "sports booking",
    "activities near me",
    "sports centers",
    "tennis courts",
    "football pitches",
    "swimming pools",
    "fitness classes",
    "sports facilities",
  ],
  authors: [{ name: "Bord Sports Ltd", url: "https://bordfinder.com" }],
  creator: "Bord Sports Ltd",
  publisher: "Bord Sports Ltd",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://bordfinder.com",
    languages: {
      en: "https://bordfinder.com",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://bordfinder.com",
    title: "Bord - Find Sports & Activities Near You",
    description: "Discover and book sports activities and facilities near you.",
    siteName: "Bord Finder",
    images: [
      {
        url: "https://bordfinder.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Bord Sports - Find and book sports activities near you",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bord - Find Sports & Activities Near You",
    description: "Discover and book sports activities and facilities near you.",
    creator: "@bordsports",
    images: ["https://bordfinder.com/twitter-image.jpg"],
  },
  verification: {
    google: "google-site-verification-code",
  },
  category: "sports",
};

// Viewport settings for responsive design
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>

      <body className={`${inter.className} antialiased`}>
        {/* Structured data for Organization */}
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SportsOrganization",
              name: "Bord Sports",
              url: "https://bordfinder.com",
              logo: "https://bordfinder.com/logo.png",
              sameAs: [
                "https://instagram.com/bordsports",
                "https://facebook.com/bordsports",
                "https://linkedin.com/company/bordsports",
              ],
              description:
                "Bord connects players with sports and activity centers worldwide.",
            }),
          }}
        />
        {/* Website schema */}
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              url: "https://bordfinder.com",
              name: "Bord - Find Sports & Activities Near You",
              description:
                "Discover and book sports activities and facilities near you.",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://bordfinder.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <RootClientLayout>
          <main>{children}</main>
        </RootClientLayout>
      </body>
    </html>
  );
}
