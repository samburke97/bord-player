import SearchClient from "@/app/search/[slug]/SearchClient";
import fetchCenters from "@/app/lib/data/centers/fetchCenters";

export default async function Search({ params }: { params: { slug: string } }) {
  const centers = await fetchCenters();
  const searchTerm = decodeURIComponent(params.slug).toLowerCase();

  const filteredCenters = centers.filter((center) => {
    const matchesCenterName = center.name.toLowerCase().includes(searchTerm);
    const matchesSports = center.sports?.some((sport) =>
      sport.name.toLowerCase().includes(searchTerm)
    );
    const matchesTags = center.tags?.some((tag) =>
      tag.name.toLowerCase().includes(searchTerm)
    );
    const matchesFacilities = center.facilities?.some((facility) =>
      facility.name.toLowerCase().includes(searchTerm)
    );
    const matchesDescription = center.description
      .toLowerCase()
      .includes(searchTerm);

    return (
      matchesCenterName ||
      matchesSports ||
      matchesTags ||
      matchesFacilities ||
      matchesDescription
    );
  });

  return <SearchClient centers={filteredCenters} />;
}
