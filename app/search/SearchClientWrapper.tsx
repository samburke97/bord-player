"use client";

import { Suspense } from "react";
import SearchClient from "@/components/search/SearchClient";

function SearchClientContent() {
  return <SearchClient />;
}

export default function SearchClientWrapper() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex items-center justify-center">
          <div className="animate-pulse w-8 h-8 bg-gray-400 rounded-full"></div>
        </div>
      }
    >
      <SearchClientContent />
    </Suspense>
  );
}
