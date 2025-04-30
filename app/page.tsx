"use server";

import Script from "next/script";
import Container from "@/components/layout/Container";
import Hero from "@/components/homepage/Hero";
import Carousel from "@/components/homepage/Carousel";
import HeroImages from "@/components/homepage/HeroImages";
import ExploreMap from "@/components/homepage/ExploreMap";
import { fetchCentersForCarousel } from "@/app/actions/centers/fetchCentersForCarousel";

export default async function HomePage() {
  // Fetch centers for "Recently Added" carousel
  const recentCenters = await fetchCentersForCarousel({
    type: "recent",
    limit: 12,
  });

  // Fetch centers for "Popular Places" carousel
  const popularCenters = await fetchCentersForCarousel({
    type: "popular",
    limit: 12,
  });

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
