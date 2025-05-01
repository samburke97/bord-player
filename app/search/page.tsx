"use server";

import { Suspense } from "react";
import SearchClient from "./SearchClient";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <main>
      <Suspense>
        <SearchClient />
      </Suspense>
    </main>
  );
}
