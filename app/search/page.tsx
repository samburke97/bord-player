import { Suspense } from "react";
import SearchClient from "./SearchClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Sports & Activities Near You | Bord",
  description:
    "Find sports centers, facilities and activities near you. Filter by sport, location, and more.",
  openGraph: {
    title: "Search Sports & Activities Near You | Bord",
    description:
      "Find sports centers, facilities and activities near you. Filter by sport, location, and more.",
    url: "https://bordfinder.com/search",
    type: "website",
  },
};

interface SearchPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <main>
      <Suspense
        fallback={
          <div className="w-full h-screen flex items-center justify-center">
            <div className="animate-pulse w-8 h-8 bg-gray-400 rounded-full"></div>
          </div>
        }
      >
        <SearchClient />
      </Suspense>
    </main>
  );
}
