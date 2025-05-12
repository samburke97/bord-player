// components/search/SearchResults.tsx
import React, { memo } from "react";
import CenterCard from "./CenterCard";
import type { Center } from "@/types/entities";
import styles from "./SearchResults.module.css";

interface SearchResultsProps {
  centers: Center[];
  isLoading: boolean;
  activePin: string | null;
  searchTerm: string;
  onCenterHover: (id: string | null) => void;
  onCenterClick?: (id: string) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  centers,
  isLoading,
  activePin,
  searchTerm,
  onCenterHover,
  onCenterClick,
}) => {
  if (centers.length === 0 && !isLoading) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyIcon}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <h3 className={styles.emptyTitle}>
          {searchTerm
            ? `No results found for "${searchTerm}"`
            : "No centers found in this area"}
        </h3>
        <p className={styles.emptyText}>
          Try adjusting your search or moving the map to a different area.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.resultsContainer}>
      <div className={styles.resultsList}>
        {centers.map((center) => (
          <CenterCard
            key={center.id}
            center={center}
            isActive={activePin === center.id}
            onMouseEnter={() => onCenterHover(center.id)}
            onMouseLeave={() => onCenterHover(null)}
            onClick={onCenterClick ? () => onCenterClick(center.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export default memo(SearchResults);
