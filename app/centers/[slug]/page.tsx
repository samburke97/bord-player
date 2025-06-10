// app/centers/[slug]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import CenterDetailsClient from "./CenterDetailsClient";
import type { Center } from "@/types/entities";

type Params = {
  slug: string;
};

export default function CenterDetailsPage({ params }: { params: Params }) {
  const [center, setCenter] = useState<Center | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadCenter() {
      try {
        // You'll need to create this API route
        const response = await fetch(`/api/centers/${params.slug}`);

        if (!response.ok) {
          setError(true);
          return;
        }

        const data = await response.json();
        setCenter(data);
      } catch (err) {
        console.error("Error loading center:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadCenter();
  }, [params.slug]);

  if (loading) return <div>Loading...</div>;
  if (error || !center) return notFound();

  return <CenterDetailsClient center={center} />;
}
