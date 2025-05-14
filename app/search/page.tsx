import SearchClient from "@/components/search/SearchClient";
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
      <SearchClient />
    </main>
  );
}
