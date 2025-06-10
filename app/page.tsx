// app/page.tsx
import { Suspense } from "react";
import Container from "@/components/layout/Container";
import Hero from "@/components/homepage/Hero";
import HeroImages from "@/components/homepage/HeroImages";
import ExploreMap from "@/components/homepage/ExploreMap";
import HomeCarousels from "@/components/homepage/HomeCarousels";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <Container>
      <section className="py-[172px]">
        <Hero />
      </section>
      <section>
        <HeroImages />
      </section>
      <Suspense fallback={<div>Loading...</div>}>
        <HomeCarousels />
      </Suspense>
      <section className="pb-[124px]">
        <ExploreMap />
      </section>
    </Container>
  );
}
