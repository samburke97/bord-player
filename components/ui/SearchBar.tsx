"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { debounce } from "lodash";
import { fetchSearchResults } from "@/app/actions/search/fetchSearchResults";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSearchTerm } from "@/store/redux/features/searchSlice";
import styles from "./SearchBar.module.css";
import { createSearchUrl } from "@/lib/utils/urlUtils";

// Default sports list for suggestions
const DEFAULT_SPORTS = [
  { name: "Bouldering", image: "/images/search/bouldering.png" },
  { name: "Football", image: "/images/search/football.png" },
  { name: "Padel", image: "/images/search/padel.png" },
  { name: "Tennis", image: "/images/search/tennis.png" },
  { name: "Swimming", image: "/images/search/swimming.png" },
  { name: "Basketball", image: "/images/search/basketball.png" },
];

interface SearchBarProps {
  className?: string;
  onDropdownChange?: (isOpen: boolean) => void;
  initialSearchTerm?: string;
  placeholder?: string;
  onSearch?: (term: string) => void;
}

// SearchResultItem component for better rendering performance
const SearchResultItem = memo(
  ({
    id,
    name,
    image,
    onClick,
  }: {
    id: string;
    name: string;
    image: string;
    onClick: (name: string) => void;
  }) => {
    const fallbackImage = "/icons/utility-outline/add-image.svg";

    return (
      <div className={styles.optionRow} onClick={() => onClick(name)}>
        <Image
          src={image}
          alt={name}
          width={40}
          height={40}
          className={styles.centerImage}
          onError={(e) => {
            e.currentTarget.src = fallbackImage;
          }}
        />
        <span>{name}</span>
        <div className={styles.spacer}></div>
        <Image
          src="/icons/utility-outline/right.svg"
          alt="Go"
          width={16}
          height={16}
        />
      </div>
    );
  }
);

SearchResultItem.displayName = "SearchResultItem";

// Main search bar component
function SearchBar({
  className,
  onDropdownChange,
  initialSearchTerm = "",
  placeholder = "Search for sports & activities",
  onSearch,
}: SearchBarProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchTerm = useAppSelector((state) => state.search.searchTerm);
  const mapView = useAppSelector((state) => state.search.mapView);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isUserEditingRef = useRef(false);

  // State
  const [state, setState] = useState({
    inputValue: initialSearchTerm || "",
    isDropdownOpen: false,
    isMobileView: false,
    results: null as any,
    isLoading: false,
    dropdownPosition: { top: 0, left: 0, width: 0 },
  });

  // Destructure state
  const {
    inputValue,
    isDropdownOpen,
    isMobileView,
    results,
    isLoading,
    dropdownPosition,
  } = state;

  // Helper to update state
  const updateState = useCallback((newState: Partial<typeof state>) => {
    setState((prev) => ({ ...prev, ...newState }));
  }, []);

  // Calculate dropdown position
  const calculateDropdownPosition = useCallback(() => {
    if (!containerRef.current || !isDropdownOpen) return;

    const rect = containerRef.current.getBoundingClientRect();
    updateState({
      dropdownPosition: {
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
      },
    });
  }, [isDropdownOpen, updateState]);

  // Handle screen width changes
  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;

      if (currentWidth >= 1024 && isMobileView) {
        updateState({
          isMobileView: false,
          isDropdownOpen: false,
        });
        document.body.style.overflow = "";
      } else if (currentWidth < 1024 && isDropdownOpen && !isMobileView) {
        updateState({ isMobileView: true });
        document.body.style.overflow = "hidden";
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobileView, isDropdownOpen, updateState]);

  // Update position on resize and scroll
  useEffect(() => {
    if (!isDropdownOpen) return;

    calculateDropdownPosition();

    const handleWindowResize = () => calculateDropdownPosition();

    const handleScroll = () => {
      updateState({
        isDropdownOpen: false,
        inputValue: "",
        results: null,
      });

      if (inputRef.current) {
        inputRef.current.blur();
      }

      isUserEditingRef.current = false;
    };

    window.addEventListener("resize", handleWindowResize);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isDropdownOpen, calculateDropdownPosition, updateState]);

  // Initialize input value from search term or props
  useEffect(() => {
    if (!isUserEditingRef.current) {
      updateState({ inputValue: searchTerm || initialSearchTerm || "" });
    }
  }, [searchTerm, initialSearchTerm, updateState]);

  // Notify parent about dropdown state
  useEffect(() => {
    if (onDropdownChange) {
      onDropdownChange(isDropdownOpen || isMobileView);
    }
  }, [isDropdownOpen, isMobileView, onDropdownChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        updateState({ isDropdownOpen: false });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [updateState]);

  // Debounced search function
  const debouncedFetchSuggestions = useCallback(
    debounce(async (value: string) => {
      if (value.length < 2) {
        updateState({ results: null, isLoading: false });
        return;
      }

      updateState({ isLoading: true });

      try {
        const searchResults = await fetchSearchResults(value);
        updateState({ results: searchResults, isLoading: false });
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        updateState({
          results: {
            tags: [],
            sports: [],
            centers: [],
            query: value,
          },
          isLoading: false,
        });
      }
    }, 300),
    [updateState]
  );

  // Clean up debounce on unmount
  useEffect(() => {
    return () => debouncedFetchSuggestions.cancel();
  }, [debouncedFetchSuggestions]);

  // Input change handler
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      updateState({ inputValue: value });
      isUserEditingRef.current = true;

      if (value.length >= 2) {
        debouncedFetchSuggestions(value);
      } else {
        updateState({ results: null });
      }
    },
    [debouncedFetchSuggestions, updateState]
  );

  // Clear search handler
  const clearSearch = useCallback(() => {
    updateState({ inputValue: "", results: null });
    isUserEditingRef.current = true;

    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [updateState]);

  // Option selection handler
  const handleOptionSelect = useCallback(
    (option: string) => {
      // First check if the option is a center name from results
      dispatch(setSearchTerm(option));

      const exactCenterMatch = results?.centers?.find(
        (center: any) => center.name.toLowerCase() === option.toLowerCase()
      );

      if (exactCenterMatch) {
        // Navigate directly to center page
        router.push(`/centers/${exactCenterMatch.id}`);
      } else {
        // Navigate to search page with the query
        if (onSearch) {
          onSearch(option);
        } else {
          // Get current map view if available
          let center: [number, number] | undefined;
          let distance: number | undefined;

          if (mapView) {
            center = [mapView.center.latitude, mapView.center.longitude];
            distance = mapView.distance;
          }

          // Navigate to search page
          router.push(
            createSearchUrl({
              query: option,
              center,
              distance,
            })
          );
        }
      }

      // Reset state
      updateState({
        isDropdownOpen: false,
        isMobileView: false,
        inputValue: option,
      });

      isUserEditingRef.current = false;
    },
    [dispatch, results, router, mapView, onSearch, updateState]
  );

  // Form submission handler
  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!inputValue.trim()) return;

      dispatch(setSearchTerm(inputValue));

      // Check for exact center match
      const exactCenterMatch = results?.centers?.find(
        (center: any) => center.name.toLowerCase() === inputValue.toLowerCase()
      );

      if (exactCenterMatch) {
        router.push(`/centers/${exactCenterMatch.id}`);
      } else {
        if (onSearch) {
          onSearch(inputValue);
        } else {
          // Get current map view if available
          let center: [number, number] | undefined;
          let distance: number | undefined;

          if (mapView) {
            center = [mapView.center.latitude, mapView.center.longitude];
            distance = mapView.distance;
          }

          // Navigate to search page
          router.push(
            createSearchUrl({
              query: inputValue,
              center,
              distance,
            })
          );
        }
      }

      // Reset state
      updateState({
        isDropdownOpen: false,
        isMobileView: false,
        inputValue,
      });

      isUserEditingRef.current = false;
    },
    [inputValue, dispatch, results, router, mapView, onSearch, updateState]
  );

  // Input focus handler
  const handleInputFocus = useCallback(() => {
    updateState({ isDropdownOpen: true });
    calculateDropdownPosition();

    if (window.innerWidth < 1024) {
      updateState({ isMobileView: true });
    }
  }, [calculateDropdownPosition, updateState]);

  // Check if there are no results
  const hasNoResults = Boolean(
    results &&
      results.tags?.length === 0 &&
      results.sports?.length === 0 &&
      results.centers?.length === 0
  );

  // Container class based on view mode
  const containerClass = isMobileView
    ? styles.mobileContainer
    : `${styles.searchContainer} ${className || ""}`;

  // Render result section
  const renderResultSection = useCallback(
    (
      items: any[],
      type: "tag" | "sport" | "center",
      onSelectItem: (name: string) => void
    ) => {
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
    },
    []
  );

  // Render default sports
  const renderDefaultSports = useCallback(() => {
    if (inputValue && inputValue.length >= 2) return null;

    return DEFAULT_SPORTS.map((sport, index) => (
      <SearchResultItem
        key={index}
        id={`sport-${index}`}
        name={sport.name}
        image={sport.image}
        onClick={handleOptionSelect}
      />
    ));
  }, [inputValue, handleOptionSelect]);

  // Mobile view
  if (isMobileView) {
    return (
      <div className={containerClass} ref={containerRef}>
        <div className={styles.mobileSearch}>
          <Image
            src="/icons/utility-outline/left.svg"
            alt="Back"
            width={20}
            height={20}
            className={styles.backIcon}
            onClick={() =>
              updateState({ isMobileView: false, isDropdownOpen: false })
            }
          />

          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            className={styles.searchInput}
            autoFocus
          />

          {inputValue && (
            <Image
              src="/icons/utility-outline/cross.svg"
              alt="Clear"
              width={20}
              height={20}
              className={styles.clearIcon}
              onClick={clearSearch}
            />
          )}
        </div>

        <div className={styles.mobileOptionsContainer}>
          {/* Search for term option */}
          {inputValue.length >= 2 && (
            <div
              className={styles.optionRow}
              onClick={() => handleOptionSelect(inputValue)}
            >
              <div className={styles.iconWrapper}>
                <Image
                  src="/icons/nav-outline/search.svg"
                  alt="Search"
                  width={18}
                  height={18}
                />
              </div>
              <span>Search for "{inputValue}"</span>
              <div className={styles.spacer}></div>
              <Image
                src="/icons/utility-outline/right.svg"
                alt="Go"
                width={16}
                height={16}
              />
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <span>Loading results...</span>
            </div>
          )}

          {/* No results message */}
          {!isLoading && hasNoResults && inputValue.length >= 2 && (
            <div className={styles.noResults}>
              No results found for "{inputValue}"
            </div>
          )}

          {/* Search results */}
          {results && !isLoading && inputValue.length >= 2 && (
            <>
              {renderResultSection(results.tags, "tag", handleOptionSelect)}
              {renderResultSection(results.sports, "sport", handleOptionSelect)}
              {renderResultSection(
                results.centers,
                "center",
                handleOptionSelect
              )}
            </>
          )}

          {/* Default sports */}
          {renderDefaultSports()}
        </div>
      </div>
    );
  }

  // Desktop view
  return (
    <div className={containerClass} ref={containerRef}>
      <form
        onSubmit={handleSearchSubmit}
        className={`${styles.inputContainer} ${
          isDropdownOpen ? "" : styles.inputContainerClosed
        }`}
      >
        <Image
          src="/icons/nav-outline/search.svg"
          alt="Search"
          width={20}
          height={20}
        />

        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className={styles.searchInput}
        />

        {inputValue && (
          <Image
            src="/icons/utility-outline/cross.svg"
            alt="Clear"
            width={20}
            height={20}
            className={styles.clearIcon}
            onClick={clearSearch}
          />
        )}
      </form>

      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className={styles.dropdown}
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
          }}
        >
          <div className={styles.optionsContainer}>
            {/* Search for term option */}
            {inputValue.length >= 2 && (
              <div
                className={styles.optionRow}
                onClick={() => handleOptionSelect(inputValue)}
              >
                <div className={styles.iconWrapper}>
                  <Image
                    src="/icons/nav-outline/search.svg"
                    alt="Search"
                    width={18}
                    height={18}
                  />
                </div>
                <span>Search for "{inputValue}"</span>
                <div className={styles.spacer}></div>
                <Image
                  src="/icons/utility-outline/right.svg"
                  alt="Go"
                  width={16}
                  height={16}
                />
              </div>
            )}

            {/* Loading state */}
            {isLoading && (
              <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <span>Loading results...</span>
              </div>
            )}

            {/* No results message */}
            {!isLoading && hasNoResults && inputValue.length >= 2 && (
              <div className={styles.noResults}>
                No results found for "{inputValue}"
              </div>
            )}

            {/* Search results */}
            {results && !isLoading && (
              <>
                {renderResultSection(results.tags, "tag", handleOptionSelect)}
                {renderResultSection(
                  results.sports,
                  "sport",
                  handleOptionSelect
                )}
                {renderResultSection(
                  results.centers,
                  "center",
                  handleOptionSelect
                )}
              </>
            )}

            {/* Default sports */}
            {renderDefaultSports()}
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(SearchBar);
