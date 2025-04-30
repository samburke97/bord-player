"use server";

import { Suspense } from "react";
import { SearchProvider } from "@/store/context/search-context";
import SearchClient from "./searchClient";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <SearchProvider>
      <main>
        <Suspense>
          <SearchClient />
        </Suspense>
      </main>
    </SearchProvider>
  );
}
