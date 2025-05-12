// components/ui/SearchBar/SearchResults.tsx
import React, { memo } from "react";
import SearchResultItem from "./SearchResultItem";

// Default sports list for suggestions
const DEFAULT_SPORTS = [
  { name: "Bouldering", image: "/images/search/bouldering.png" },
  { name: "Football", image: "/images/search/football.png" },
  { name: "Padel", image: "/images/search/padel.png" },
  { name: "Tennis", image: "/images/search/tennis.png" },
  { name: "Swimming", image: "/images/search/swimming.png" },
  { name: "Basketball", image: "/images/search/basketball.png" },
];

interface SearchResultsProps {
  results: any;
  inputValue: string;
  isLoading: boolean;
  onSelect: (name: string) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  inputValue,
  isLoading,
  onSelect,
}) => {
  // Default sports
  if (!inputValue || inputValue.length < 2) {
    return (
      <>
        {DEFAULT_SPORTS.map((sport, index) => (
          <SearchResultItem
            key={index}
            id={`sport-${index}`}
            name={sport.name}
            image={sport.image}
            onClick={onSelect}
          />
        ))}
      </>
    );
  }

  // Search results
  if (results && !isLoading) {
    return (
      <>
        {renderResultSection(results.tags, "tag", onSelect)}
        {renderResultSection(results.sports, "sport", onSelect)}
        {renderResultSection(results.centers, "center", onSelect)}
      </>
    );
  }

  return null;
};

// Helper to render result sections
function renderResultSection(
  items: any[],
  type: "tag" | "sport" | "center",
  onSelectItem: (name: string) => void
) {
  if (!items || items.length === 0) return null;

  return (
    <>
      {items.map((item: any) => {
        const showDirectImage = type === "center" || type === "sport";
        const fallbackImage = "/icons/utility-outline/add-image.svg";
        const image = item.imageUrl || item.logoUrl || fallbackImage;

        return (
          <SearchResultItem
            key={item.id}
            id={item.id}
            name={item.name}
            image={showDirectImage ? image : fallbackImage}
            onClick={onSelectItem}
          />
        );
      })}
    </>
  );
}

export default memo(SearchResults);
