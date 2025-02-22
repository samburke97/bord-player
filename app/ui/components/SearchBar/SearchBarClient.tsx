"use client";

import { useState, useEffect } from "react";
import { fetchSearchResults } from "./SearchBarServer";
import styles from "./SearchBar.module.css";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { addRecentSearch } from "@/store/features/searchSlice";
import { RootState } from "@/store/store";

interface props {
  className?: string;
}

const SearchBar = ({ ...props }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mapBounds = useSelector((state: RootState) => state.search.mapBounds);

  const [searchText, setSearchText] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isMobileView, setIsMobileView] = useState(false);

  const sports = [
    { name: "Bouldering", image: "/images/search/bouldering.png" },
    { name: "Football", image: "/images/search/football.png" },
    { name: "Padel", image: "/images/search/padel.png" },
    { name: "Tennis", image: "/images/search/tennis.png" },
    { name: "Swimming", image: "/images/search/swimming.png" },
    { name: "Basketball", image: "/images/search/basketball.png" },
  ];

  useEffect(() => {
    const match = pathname.match(/\/search\/(.+)/);
    if (match && match[1]) {
      const term = decodeURIComponent(match[1]);
      setSearchText(term);
      handleInputChange({
        target: { value: term },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [pathname]);

  const handleInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const query = event.target.value;
    setSearchText(query);

    if (query.length >= 2) {
      const results = await fetchSearchResults(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const clearSearch = () => {
    setSearchText("");
    setSearchResults([]);
  };

  const handleFocus = () => {
    setIsDropdownOpen(true);
    if (window.innerWidth <= 1023) {
      setIsMobileView(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsDropdownOpen(false);
    }, 200);
  };

  const handleCloseSearch = () => {
    setIsMobileView(false);
    setSearchText("");
    setSearchResults([]);
  };

  // Helper function to create search URL with bounds preserved
  const createSearchUrl = (term: string) => {
    // Start with the base search path
    let url = `/search/${encodeURIComponent(term)}`;

    // Only preserve bounds if we're on a search page and have bounds
    if (pathname.startsWith("/search/") && mapBounds) {
      // Keep the current bounds from the Redux store
      url = `${url}?north=${mapBounds.north}&south=${mapBounds.south}&east=${mapBounds.east}&west=${mapBounds.west}`;
    }

    return url;
  };

  const handleResultClick = (term: string, type: string, id: string) => {
    // For centers with exact name match, navigate directly to the center page
    if (type === "center") {
      router.push(`/centers/${id}`);
      return;
    }

    let searchTerm = term;
    if (type === "search") {
      const match = term.match(/Search for "(.+?)"/);
      if (match && match[1]) {
        searchTerm = match[1];
      }
    }

    // Add to recent searches
    dispatch(addRecentSearch(searchTerm));

    // Use the helper to create search URL with preserved bounds
    const searchUrl = createSearchUrl(searchTerm);

    // Use router.replace instead of push to avoid adding to history
    // This creates a smoother experience similar to Freshers map
    router.replace(searchUrl);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if there's an exact center match in searchResults
    const exactCenterMatch = searchResults.find(
      (result) =>
        result.type === "center" &&
        result.name.toLowerCase() === searchText.toLowerCase()
    );

    if (exactCenterMatch) {
      // Navigate directly to the center page
      router.push(`/centers/${exactCenterMatch.id}`);
    } else {
      // Add to recent searches
      dispatch(addRecentSearch(searchText));

      // Use the helper to create search URL with preserved bounds
      const searchUrl = createSearchUrl(searchText);

      // Use router.replace instead of push
      router.replace(searchUrl);
    }
  };

  const dynamicResults = searchResults.filter(
    (result) => result.type !== "search"
  );
  const searchOption = searchResults.find((result) => result.type === "search");

  return (
    <div
      className={`${isMobileView ? styles.mobileContainer : styles.container} ${
        props.className
      }`}
    >
      <form onSubmit={handleSearchSubmit} className={styles.search}>
        {isMobileView ? (
          <ChevronLeftIcon
            className={styles.backIcon}
            onClick={handleCloseSearch}
          />
        ) : (
          <MagnifyingGlassIcon className={styles.icon} />
        )}
        <input
          type="text"
          placeholder="What are you feeling like?"
          value={searchText}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {searchText && (
          <XMarkIcon className={styles.clearIcon} onClick={clearSearch} />
        )}
      </form>

      {isDropdownOpen && (
        <div className={styles.dropdown}>
          {searchText.length < 2 &&
            sports.map((sport) => (
              <div
                className={styles.dropdownItem}
                key={sport.name}
                onClick={() =>
                  handleResultClick(sport.name, "sport", sport.name)
                }
              >
                <div className={styles.dropdownSport}>
                  <div className={styles.imageContainer}>
                    <img
                      src={sport.image}
                      alt={sport.name}
                      className={styles.image}
                    />
                  </div>
                  <span>{sport.name}</span>
                </div>
                <ChevronRightIcon className={styles.arrowIcon} />
              </div>
            ))}

          {searchText.length >= 2 && searchOption && (
            <div
              className={styles.dropdownItem}
              key={searchOption.id}
              onClick={() =>
                handleResultClick(
                  searchOption.name,
                  searchOption.type,
                  searchOption.id
                )
              }
            >
              <div className={styles.dropdownSport}>
                <div className={styles.imageContainer}>
                  <img
                    src="/images/search/search.svg"
                    alt="Search Icon"
                    className={styles.searchImage}
                  />
                </div>
                <span>{searchOption.name}</span>
              </div>
              <ChevronRightIcon className={styles.arrowIcon} />
            </div>
          )}

          {searchText.length >= 2 &&
            dynamicResults.map((result) => (
              <div
                className={styles.dropdownItem}
                key={result.id}
                onClick={() =>
                  handleResultClick(result.name, result.type, result.id)
                }
              >
                <div className={styles.dropdownSport}>
                  {result.type === "sport" ? (
                    <div className={styles.imageContainer}>
                      <img
                        src={result.image}
                        alt={result.name}
                        className={styles.image}
                      />
                    </div>
                  ) : (
                    <div className={styles.imageContainer}>
                      <img
                        src="/images/search/aero.svg"
                        alt="Aero icon"
                        className={styles.searchImage}
                      />
                    </div>
                  )}

                  <span>{result.name}</span>
                </div>
                <ChevronRightIcon className={styles.arrowIcon} />
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
