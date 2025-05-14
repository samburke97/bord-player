"use client";

import { useRef, memo, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/store/store";
import styles from "./SearchBar.module.css";
import MobileSearchView from "./MobileSearchView";
import DesktopSearchView from "./DesktopSearchView";
import { useSearchDropdown } from "./hooks/useSearchDropDown";
import { useSearchResults } from "./hooks/useSearchResults";
import { useSearchNavigation } from "./hooks/useSearchNavigation";

interface SearchBarProps {
  className?: string;
  onDropdownChange?: (isOpen: boolean) => void;
  initialSearchTerm?: string;
  placeholder?: string;
  onSearch?: (term: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

function SearchBar({
  className,
  onDropdownChange,
  initialSearchTerm = "",
  placeholder = "Search for sports & activities",
  onSearch,
  onFocus,
  onBlur,
}: SearchBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isSearchPage = pathname === "/search";
  const searchTerm = useAppSelector((state) => state.search.searchTerm);

  const inputRef = useRef<HTMLInputElement>(null);
  const isUserEditingRef = useRef(false);

  // Prefetch search page for faster navigation
  useEffect(() => {
    if (!isSearchPage) {
      router.prefetch("/search");
    }
  }, [isSearchPage, router]);

  const {
    containerRef,
    dropdownRef,
    isDropdownOpen,
    isMobileView,
    dropdownPosition,
    handleInputFocus,
    closeDropdown,
  } = useSearchDropdown(onDropdownChange);

  const {
    inputValue,
    results,
    isLoading,
    hasNoResults,
    handleInputChange,
    clearSearch,
  } = useSearchResults(
    isSearchPage,
    searchTerm,
    initialSearchTerm,
    isUserEditingRef
  );

  const { handleOptionSelect, handleSearchSubmit } = useSearchNavigation(
    results,
    inputValue,
    isSearchPage,
    onSearch,
    isUserEditingRef,
    closeDropdown
  );

  const containerClass = isMobileView
    ? styles.mobileContainer
    : `${styles.searchContainer} ${className || ""}`;

  const handleFocus = () => {
    handleInputFocus();
    if (onFocus) onFocus();
  };

  const handleBlur = () => {
    if (onBlur) onBlur();
  };

  if (isMobileView) {
    return (
      <MobileSearchView
        containerRef={containerRef}
        containerClass={containerClass}
        inputRef={inputRef}
        inputValue={inputValue}
        placeholder={placeholder}
        isLoading={isLoading}
        results={results}
        hasNoResults={hasNoResults}
        handleInputChange={handleInputChange}
        clearSearch={clearSearch}
        handleOptionSelect={handleOptionSelect}
        closeDropdown={closeDropdown}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    );
  }

  return (
    <DesktopSearchView
      containerRef={containerRef}
      containerClass={containerClass}
      inputRef={inputRef}
      dropdownRef={dropdownRef}
      inputValue={inputValue}
      placeholder={placeholder}
      isDropdownOpen={isDropdownOpen}
      isSearchPage={isSearchPage}
      isLoading={isLoading}
      results={results}
      hasNoResults={hasNoResults}
      dropdownPosition={dropdownPosition}
      handleInputChange={handleInputChange}
      handleInputFocus={handleFocus}
      clearSearch={clearSearch}
      handleOptionSelect={handleOptionSelect}
      handleSearchSubmit={handleSearchSubmit}
      onBlur={handleBlur}
    />
  );
}

export default memo(SearchBar);
