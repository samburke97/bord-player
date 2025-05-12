// components/ui/SearchBar/hooks/useSearchResults.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { debounce } from "lodash";
import { fetchSearchResults } from "@/app/actions/search/fetchSearchResults";

export function useSearchResults(
  isSearchPage: boolean,
  searchTerm: string,
  initialSearchTerm: string,
  isUserEditingRef: React.MutableRefObject<boolean>
) {
  const [state, setState] = useState({
    inputValue: "",
    results: null as any,
    isLoading: false,
  });

  // Destructure state
  const { inputValue, results, isLoading } = state;

  // Helper to update state
  const updateState = useCallback((newState: Partial<typeof state>) => {
    setState((prev) => ({ ...prev, ...newState }));
  }, []);

  // Initialize input value - only use search term if on search page
  useEffect(() => {
    if (!isUserEditingRef.current) {
      const value = isSearchPage ? searchTerm || initialSearchTerm || "" : "";
      updateState({ inputValue: value });
    }
  }, [
    searchTerm,
    initialSearchTerm,
    isSearchPage,
    updateState,
    isUserEditingRef,
  ]);

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
    [debouncedFetchSuggestions, updateState, isUserEditingRef]
  );

  // Clear search handler
  const clearSearch = useCallback(() => {
    updateState({ inputValue: "", results: null });
    isUserEditingRef.current = true;
  }, [updateState, isUserEditingRef]);

  // Check if there are no results
  const hasNoResults = Boolean(
    results &&
      results.tags?.length === 0 &&
      results.sports?.length === 0 &&
      results.centers?.length === 0
  );

  return {
    inputValue,
    results,
    isLoading,
    hasNoResults,
    handleInputChange,
    clearSearch,
    updateState,
  };
}
