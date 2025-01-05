"use client";

import { useState } from "react";

import { fetchSearchResults } from "./SearchBarServer";
import styles from "./SearchBar.module.css";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface props {
  className?: string;
}

const SearchBar = ({ ...props }) => {
  const router = useRouter();

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

  const handleResultClick = (term: string, type: string) => {
    let encodedTerm = encodeURIComponent(term);

    if (type === "search") {
      const match = term.match(/Search for "(.+?)"/);
      if (match && match[1]) {
        encodedTerm = encodeURIComponent(match[1]);
      }
    }

    console.log("Navigating to:", `/search/${encodedTerm}`);
    router.push(`/search/${encodedTerm}`);
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
      <div className={styles.search}>
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
      </div>

      {isDropdownOpen && (
        <div className={styles.dropdown}>
          {searchText.length < 2 &&
            sports.map((sport) => (
              <div
                className={styles.dropdownItem}
                key={sport.name}
                onClick={() => handleResultClick(sport.name)}
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
                handleResultClick(searchOption.name, searchOption.type)
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
                onClick={() => handleResultClick(result.name)}
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
