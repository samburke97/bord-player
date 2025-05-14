import { useState, useEffect, useCallback, useRef } from "react";
import { debounce } from "lodash";
import { fetchSearchResults } from "@/app/actions/search/fetchSearchResults";

/**
 * Enhanced version of useSearchResults hook with request deduplication
 * This is a simpler approach that doesn't require React Query
 */
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
    hasNoResults: false,
  });

  // Destructure state
  const { inputValue, results, isLoading, hasNoResults } = state;

  // Request tracking for deduplication
  const lastRequestRef = useRef<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);

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

  // Debounced search function with request tracking
  const fetchSuggestions = useCallback(
    debounce(async (value: string) => {
      if (value.length < 2) {
        updateState({ results: null, isLoading: false, hasNoResults: false });
        return;
      }

      // Generate a request key for deduplication
      const requestKey = `suggestions-${value}`;

      // Skip duplicate requests
      if (requestKey === lastRequestRef.current) {
        console.log("Skipping duplicate suggestion request");
        return;
      }

      // Store the request key
      lastRequestRef.current = requestKey;

      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create a new abort controller
      abortControllerRef.current = new AbortController();

      updateState({ isLoading: true });

      try {
        const searchResults = await fetchSearchResults(value);

        // Check if this is still the latest request
        if (requestKey !== lastRequestRef.current) {
          console.log("Ignoring outdated suggestion results");
          return;
        }

        // Check for no results
        const noResults =
          searchResults &&
          searchResults.tags?.length === 0 &&
          searchResults.sports?.length === 0 &&
          searchResults.centers?.length === 0;

        updateState({
          results: searchResults,
          isLoading: false,
          hasNoResults: noResults,
        });
      } catch (error) {
        console.error("Error fetching suggestions:", error);

        // Only update state if this is still the current request
        if (requestKey === lastRequestRef.current) {
          updateState({
            results: {
              tags: [],
              sports: [],
              centers: [],
              query: value,
            },
            isLoading: false,
            hasNoResults: true,
          });
        }
      }
    }, 300),
    [updateState]
  );

  // Clean up debounce and abort controller on unmount
  useEffect(() => {
    return () => {
      fetchSuggestions.cancel();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchSuggestions]);

  // Input change handler
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      updateState({ inputValue: value });
      isUserEditingRef.current = true;

      if (value.length >= 2) {
        fetchSuggestions(value);
      } else {
        updateState({ results: null, hasNoResults: false });
      }
    },
    [fetchSuggestions, updateState, isUserEditingRef]
  );

  // Clear search handler
  const clearSearch = useCallback(() => {
    updateState({ inputValue: "", results: null, hasNoResults: false });
    isUserEditingRef.current = false;
  }, [updateState, isUserEditingRef]);

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
