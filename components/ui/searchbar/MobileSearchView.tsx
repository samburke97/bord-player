import React from "react";
import Image from "next/image";
import styles from "./SearchBar.module.css";
import SearchResults from "./SearchResults";

interface MobileSearchViewProps {
  containerRef: React.RefObject<HTMLDivElement>;
  containerClass: string;
  inputRef: React.RefObject<HTMLInputElement>;
  inputValue: string;
  placeholder: string;
  isLoading: boolean;
  results: any;
  hasNoResults: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearSearch: () => void;
  handleOptionSelect: (option: string) => void;
  closeDropdown: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const MobileSearchView: React.FC<MobileSearchViewProps> = ({
  containerRef,
  containerClass,
  inputRef,
  inputValue,
  placeholder,
  isLoading,
  results,
  hasNoResults,
  handleInputChange,
  clearSearch,
  handleOptionSelect,
  closeDropdown,
  onFocus,
  onBlur,
}) => {
  return (
    <div className={containerClass} ref={containerRef}>
      <div className={styles.mobileSearch}>
        <Image
          src="/icons/utility-outline/left.svg"
          alt="Back"
          width={20}
          height={20}
          className={styles.backIcon}
          onClick={() => {
            closeDropdown();
            if (onBlur) onBlur(); // Trigger blur when going back
          }}
        />

        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          className={styles.searchInput}
          autoFocus
          onFocus={onFocus}
          onBlur={onBlur}
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

      <div className={styles.optionsContainer}>
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
        <SearchResults
          results={results}
          inputValue={inputValue}
          isLoading={isLoading}
          onSelect={handleOptionSelect}
        />
      </div>
    </div>
  );
};

export default MobileSearchView;
