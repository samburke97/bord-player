"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { debounce } from "lodash";
import { fetchSearchResults } from "@/app/actions/search/fetchSearchResults";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSearchTerm } from "@/store/redux/features/searchSlice";
import styles from "./SearchBar.module.css";
import { useSearchParams } from "next/navigation";
import { createSearchUrl } from "@/lib/utils/urlUtils";
// Default sports list
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
}

export default function SearchBar({
  className,
  onDropdownChange,
  initialSearchTerm = "",
  placeholder = "Search for sports & activities",
}: SearchBarProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchTerm = useAppSelector((state) => state.search.searchTerm);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isUserEditingRef = useRef(false);
  const mapView = useAppSelector((state) => state.search.mapView);

  // Consolidated state
  const [state, setState] = useState({
    inputValue: "",
    isDropdownOpen: false,
    isMobileView: false,
    results: null,
    isLoading: false,
    dropdownPosition: { top: 0, left: 0, width: 0 },
  });

  // Destructure for easier access
  const {
    inputValue,
    isDropdownOpen,
    isMobileView,
    results,
    isLoading,
    dropdownPosition,
  } = state;

  const updateState = (newState) =>
    setState((prev) => ({ ...prev, ...newState }));
  // Calculate dropdown position
  const calculateDropdownPosition = useCallback(() => {
    if (containerRef.current && isDropdownOpen) {
      const rect = containerRef.current.getBoundingClientRect();
      updateState({
        dropdownPosition: {
          top: rect.bottom,
          left: rect.left,
          width: rect.width,
        },
      });
    }
  }, [isDropdownOpen]);

  // Handle screen width changes
  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;

      if (currentWidth >= 1024 && isMobileView) {
        // Transition from mobile to desktop
        updateState({
          isMobileView: false,
          isDropdownOpen: false,
        });
        document.body.style.overflow = ""; // Reset body scroll lock
      } else if (currentWidth < 1024 && isDropdownOpen && !isMobileView) {
        // Transition from desktop to mobile when dropdown is open
        updateState({ isMobileView: true });
        document.body.style.overflow = "hidden"; // Lock body scroll
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobileView, isDropdownOpen]);

  // Update position on resize and scroll
  useEffect(() => {
    if (isDropdownOpen) {
      calculateDropdownPosition();
      window.addEventListener("resize", calculateDropdownPosition);

      // Add scroll event listener to completely reset the input state
      const handleScroll = () => {
        // Completely reset the input state
        updateState({
          isDropdownOpen: false,
          inputValue: "",
          results: null,
        });

        // Blur the input to remove focus
        if (inputRef.current) {
          inputRef.current.blur();
        }

        // Reset the user editing flag
        isUserEditingRef.current = false;
      };
      window.addEventListener("scroll", handleScroll);

      return () => {
        window.removeEventListener("resize", calculateDropdownPosition);
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, [isDropdownOpen, calculateDropdownPosition]);

  // Initialize input value from search term or props
  useEffect(() => {
    if (!isUserEditingRef.current) {
      updateState({ inputValue: searchTerm || initialSearchTerm || "" });
    }
  }, [searchTerm, initialSearchTerm]);

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
  }, []);

  // Prevent body scroll when dropdown is open
  useEffect(() => {
    const preventScroll = (e: WheelEvent) => {
      // Only prevent if dropdown is open and mouse is over dropdown
      if (isDropdownOpen && dropdownRef.current?.contains(e.target as Node)) {
        const dropdown = dropdownRef.current.querySelector(
          `.${styles.optionsContainer}`
        );
        if (dropdown) {
          const { scrollTop, scrollHeight, clientHeight } =
            dropdown as HTMLElement;
          const isAtTop = scrollTop === 0;
          const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5; // 5px buffer

          // Allow scrolling within the dropdown
          if (
            (isAtTop && e.deltaY < 0) || // At top and scrolling up
            (isAtBottom && e.deltaY > 0) // At bottom and scrolling down
          ) {
            // Allow page to scroll
            return;
          }

          // Prevent page from scrolling, let dropdown scroll
          e.stopPropagation();
        }
      }
    };

    // Ensure dropdown is scrollable with both wheel and touch
    window.addEventListener("wheel", preventScroll, { passive: false });

    return () => {
      window.removeEventListener("wheel", preventScroll);
    };
  }, [isDropdownOpen]);

  // Effect to handle body styles when dropdown is open
  useEffect(() => {
    if (isDropdownOpen) {
      // Ensure body doesn't scroll when manipulating dropdown
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "auto";

      // Append a class to the body to create a global stacking context
      document.body.classList.add("dropdown-open");

      // Add touch event listeners for mobile scrolling
      const optionsContainer = dropdownRef.current?.querySelector(
        `.${styles.optionsContainer}`
      );
      if (optionsContainer) {
        optionsContainer.addEventListener(
          "touchstart",
          (e) => e.stopPropagation(),
          { passive: true }
        );
        optionsContainer.addEventListener(
          "touchmove",
          (e) => e.stopPropagation(),
          { passive: true }
        );
      }

      return () => {
        document.body.style.overflow = originalStyle;
        document.body.classList.remove("dropdown-open");
        if (optionsContainer) {
          optionsContainer.removeEventListener("touchstart", (e) =>
            e.stopPropagation()
          );
          optionsContainer.removeEventListener("touchmove", (e) =>
            e.stopPropagation()
          );
        }
      };
    }
  }, [isDropdownOpen]);

  // Search functionality
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
    []
  );

  // Clean up on unmount
  useEffect(() => {
    return () => debouncedFetchSuggestions.cancel();
  }, [debouncedFetchSuggestions]);

  // Event handlers
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    updateState({ inputValue: value });
    isUserEditingRef.current = true;

    if (value.length >= 2) {
      debouncedFetchSuggestions(value);
    } else {
      updateState({ results: null });
    }
  };

  const clearSearch = () => {
    updateState({ inputValue: "", results: null });
    isUserEditingRef.current = true;
  };

  const handleOptionSelect = (option: string) => {
    // First check if the option is a center name from results
    dispatch(setSearchTerm(option));

    const exactCenterMatch = results?.centers?.find(
      (center: any) => center.name.toLowerCase() === option.toLowerCase()
    );

    if (exactCenterMatch) {
      // If it's a center, navigate directly to the center page
      router.push(`/centers/${exactCenterMatch.id}`);
    } else {
      // Otherwise, navigate to the search page with the query
      router.push(`/search?q=${encodeURIComponent(option)}`);
    }

    // Close dropdown and reset state
    updateState({ isDropdownOpen: false, isMobileView: false, inputValue: "" });
    isUserEditingRef.current = false;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Check for exact center match first
    const exactCenterMatch = results?.centers?.find(
      (center: any) => center.name.toLowerCase() === inputValue.toLowerCase()
    );

    dispatch(setSearchTerm(inputValue));

    if (exactCenterMatch) {
      router.push(`/centers/${exactCenterMatch.id}`);
    } else {
      // Get current map view if available
      let center: [number, number] | undefined;
      let distance: number | undefined;

      if (mapView) {
        center = [mapView.center.latitude, mapView.center.longitude];
        distance = mapView.distance;
      }

      // Use the utility function for consistent URL construction
      router.push(
        createSearchUrl({
          query: inputValue,
          center,
          distance,
        })
      );
    }

    updateState({ isDropdownOpen: false, isMobileView: false, inputValue: "" });
    isUserEditingRef.current = false;
  };

  // Handle input focus
  const handleInputFocus = () => {
    updateState({ isDropdownOpen: true });
    calculateDropdownPosition();
    if (window.innerWidth < 1024) {
      updateState({ isMobileView: true });
    }
  };

  // UI helpers
  const hasNoResults =
    results &&
    results.tags?.length === 0 &&
    results.sports?.length === 0 &&
    results.centers?.length === 0;

  const containerClass = isMobileView
    ? styles.mobileContainer
    : `${styles.searchContainer} ${className || ""}`;

  return (
    <div className={containerClass} ref={containerRef}>
      {isMobileView ? (
        // Mobile view
        <>
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
                {renderResultSection(
                  results.tags,
                  (tag) => ({
                    id: tag.id,
                    name: tag.name,
                    image: tag.imageUrl || "/icons/default-tag.svg",
                  }),
                  "tag"
                )}

                {renderResultSection(
                  results.sports,
                  (sport) => ({
                    id: sport.id,
                    name: sport.name,
                    image: sport.imageUrl || "/icons/default-sport.svg",
                  }),
                  "sport"
                )}

                {renderResultSection(
                  results.centers,
                  (center) => ({
                    id: center.id,
                    name: center.name,
                    image: center.logoUrl || "/icons/default-center.svg",
                  }),
                  "center"
                )}
              </>
            )}

            {/* Default sports without header - always show in mobile view when not searching */}
            {(!inputValue || inputValue.length < 2) && !isLoading && (
              <>
                {DEFAULT_SPORTS.map((sport, index) => (
                  <div
                    key={index}
                    className={styles.optionRow}
                    onClick={() => handleOptionSelect(sport.name)}
                  >
                    <Image
                      src={sport.image}
                      alt={sport.name}
                      width={40}
                      height={40}
                      className={styles.centerImage}
                      onError={(e) => {
                        e.currentTarget.src =
                          "/icons/utility-outline/add-image.svg";
                      }}
                    />
                    <span>{sport.name}</span>
                    <div className={styles.spacer}></div>
                    <Image
                      src="/icons/utility-outline/right.svg"
                      alt="Go"
                      width={16}
                      height={16}
                    />
                  </div>
                ))}
              </>
            )}
          </div>
        </>
      ) : (
        // Desktop view (no changes needed here)
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
      )}

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
                {/* Tags section */}
                {renderResultSection(
                  results.tags,
                  (tag) => ({
                    id: tag.id,
                    name: tag.name,
                    image: tag.imageUrl || "/icons/default-tag.svg",
                  }),
                  "tag"
                )}

                {/* Sports section */}
                {renderResultSection(
                  results.sports,
                  (sport) => ({
                    id: sport.id,
                    name: sport.name,
                    image: sport.imageUrl || "/icons/default-sport.svg",
                  }),
                  "sport"
                )}

                {/* Centers section */}
                {renderResultSection(
                  results.centers,
                  (center) => ({
                    id: center.id,
                    name: center.name,
                    image: center.logoUrl || "/icons/default-center.svg",
                  }),
                  "center"
                )}
              </>
            )}

            {/* Default sports without header */}
            {(!inputValue || inputValue.length < 2) && !isLoading && (
              <>
                {DEFAULT_SPORTS.map((sport, index) => (
                  <div
                    key={index}
                    className={styles.optionRow}
                    onClick={() => handleOptionSelect(sport.name)}
                  >
                    <Image
                      src={sport.image}
                      alt={sport.name}
                      width={40}
                      height={40}
                      className={styles.centerImage}
                      onError={(e) => {
                        e.currentTarget.src =
                          "/icons/utility-outline/add-image.svg";
                      }}
                    />
                    <span>{sport.name}</span>
                    <div className={styles.spacer}></div>
                    <Image
                      src="/icons/utility-outline/right.svg"
                      alt="Go"
                      width={16}
                      height={16}
                    />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Helper function to render result sections with appropriate image styling per type
  function renderResultSection(items, mapFn, type = "default") {
    if (!items || items.length === 0) return null;

    return (
      <>
        {items.map((item) => {
          const { id, name, image } = mapFn(item);

          // For centers and sports, display the image directly without wrapper
          const showDirectImage = type === "center" || type === "sport";

          // Default fallback image for missing images
          const fallbackImage = "/icons/utility-outline/add-image.svg";

          return (
            <div
              key={id}
              className={styles.optionRow}
              onClick={() => handleOptionSelect(name)}
            >
              {showDirectImage ? (
                <Image
                  src={image || fallbackImage}
                  alt={name}
                  width={40}
                  height={40}
                  className={styles.centerImage}
                  onError={(e) => {
                    e.currentTarget.src = fallbackImage;
                  }}
                />
              ) : (
                <div className={styles.iconWrapper}>
                  <Image
                    src={image || fallbackImage}
                    alt={name}
                    width={24}
                    height={24}
                    onError={(e) => {
                      e.currentTarget.src = fallbackImage;
                    }}
                  />
                </div>
              )}
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
        })}
      </>
    );
  }
}
