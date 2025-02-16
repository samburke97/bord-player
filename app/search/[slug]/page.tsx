import SearchClient from "./SearchClient";

export default async function Search({ params }: { params: { slug: string } }) {
  return <SearchClient searchTerm={decodeURIComponent(params.slug)} />;
}
