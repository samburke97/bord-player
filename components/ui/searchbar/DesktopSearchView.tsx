import React from "react";
import Image from "next/image";
import styles from "./SearchBar.module.css";
import SearchResults from "./SearchResults";

interface DesktopSearchViewProps {
  containerRef: React.RefObject<HTMLDivElement>;
  containerClass: string;
  inputRef: React.RefObject<HTMLInputElement>;
  dropdownRef: React.RefObject<HTMLDivElement>;
  inputValue: string;
  placeholder: string;
  isDropdownOpen: boolean;
  isSearchPage: boolean;
  isLoading: boolean;
  results: any;
  hasNoResults: boolean;
  dropdownPosition: { top: number; left: number; width: number };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleInputFocus: () => void;
  clearSearch: () => void;
  handleOptionSelect: (option: string) => void;
  handleSearchSubmit: (e: React.FormEvent) => void;
  onBlur?: () => void;
}

const DesktopSearchView: React.FC<DesktopSearchViewProps> = ({
  containerRef,
  containerClass,
  inputRef,
  dropdownRef,
  inputValue,
  placeholder,
  isDropdownOpen,
  isSearchPage,
  isLoading,
  results,
  hasNoResults,
  dropdownPosition,
  handleInputChange,
  handleInputFocus,
  clearSearch,
  handleOptionSelect,
  handleSearchSubmit,
  onBlur,
}) => {
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
          onBlur={onBlur}
          className={styles.searchInput}
          title={placeholder}
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

            {/* Browse all option when input is empty */}
            {!inputValue && isSearchPage && (
              <div
                className={styles.optionRow}
                onClick={() => handleOptionSelect("")}
              >
                <div className={styles.iconWrapper}>
                  <Image
                    src="/icons/nav-outline/search.svg"
                    alt="Browse"
                    width={18}
                    height={18}
                  />
                </div>
                <span>Browse all centers</span>
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
      )}
    </div>
  );
};

export default DesktopSearchView;
