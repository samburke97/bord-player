// app/HomeCarousels.tsx
import { fetchCentersForCarousel } from "@/app/actions/centers/fetchCentersForCarousel";
import Carousel from "@/components/homepage/Carousel";

export default async function HomeCarousels() {
  const recentCenters = await fetchCentersForCarousel({
    type: "recent",
    limit: 12,
  });

  const popularCenters = await fetchCentersForCarousel({
    type: "popular",
    limit: 12,
  });

  return (
    <section className="py-[124px]">
      <div>
        {recentCenters.length > 0 && (
          <Carousel title="Recently Added" centers={recentCenters} />
        )}
        {popularCenters.length > 0 && (
          <Carousel title="Popular Places" centers={popularCenters} />
        )}
      </div>
    </section>
  );
}
