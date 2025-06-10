"use server";

import Script from "next/script";
import Container from "@/components/layout/Container";
import Hero from "@/components/homepage/Hero";
import Carousel from "@/components/homepage/Carousel";
import HeroImages from "@/components/homepage/HeroImages";
import ExploreMap from "@/components/homepage/ExploreMap";
import { fetchCentersForCarousel } from "@/app/actions/centers/fetchCentersForCarousel";
import type { CenterSummary } from "@/types/entities";

// Force dynamic rendering to prevent build-time database access
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  let recentCenters: CenterSummary[] = [];
  let popularCenters: CenterSummary[] = [];

  try {
    // Fetch data with error handling
    const [recentResult, popularResult] = await Promise.allSettled([
      fetchCentersForCarousel({
        type: "recent",
        limit: 12,
      }),
      fetchCentersForCarousel({
        type: "popular",
        limit: 12,
      }),
    ]);

    if (recentResult.status === "fulfilled") {
      recentCenters = recentResult.value;
    } else {
      console.error("Failed to fetch recent centers:", recentResult.reason);
    }

    if (popularResult.status === "fulfilled") {
      popularCenters = popularResult.value;
    } else {
      console.error("Failed to fetch popular centers:", popularResult.reason);
    }
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    // Continue with empty arrays - the page will still render
  }

  return (
    <Container>
      <section className="py-[172px]">
        <Hero />
      </section>
      <section>
        <HeroImages />
      </section>
      <section className="py-[124px]">
        <div>
          {recentCenters.length > 0 && (
            <Carousel title="Recently Added" centers={recentCenters} />
          )}
          {popularCenters.length > 0 && (
            <Carousel title="Popular Places" centers={popularCenters} />
          )}
          {popularCenters.length > 0 && (
            <Carousel title="Popular Places" centers={popularCenters} />
          )}
        </div>
      </section>
      <section className="pb-[124px]">
        <ExploreMap />
      </section>
      <Script
        id="homepage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SportsActivityLocation",
            name: "Bord Sports Finder",
            description:
              "Find and book sports activities and facilities near you.",
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate:
                  "https://bordfinder.com/search?location={location}",
              },
              "query-input": "required name=location",
            },
          }),
        }}
      />
    </Container>
  );
}
