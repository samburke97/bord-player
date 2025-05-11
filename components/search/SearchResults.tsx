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
  onCenterClick: (id: string) => void;
  onCenterHover: (id: string | null) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  centers,
  isLoading,
  activePin,
  searchTerm,
  onCenterClick,
  onCenterHover,
}) => {
  // Loading state
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading results...</p>
      </div>
    );
  }

  // Empty state
  if (centers.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyIcon}>
          <p>Search</p>
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

  // Results state
  return (
    <div className={styles.resultsContainer}>
      <div className={styles.resultsHeader}>
        <h2 className={styles.resultsTitle}>
          {centers.length} {centers.length === 1 ? "center" : "centers"} found
          {searchTerm ? ` for "${searchTerm}"` : ""}
        </h2>
      </div>

      <div className={styles.resultsList}>
        {centers.map((center) => (
          <CenterCard
            key={center.id}
            center={center}
            isActive={activePin === center.id}
            onMouseEnter={() => onCenterHover(center.id)}
            onMouseLeave={() => onCenterHover(null)}
            onClick={() => onCenterClick(center.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default memo(SearchResults);
