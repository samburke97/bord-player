"use client";

import { useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  setSearchTerm,
  resetSearch,
  setLoading,
} from "@/store/features/searchSlice";
import { createSearchUrl } from "@/lib/utils/urlUtils";
import { executeSearch } from "@/store/features/searchThunk";

export function useSearchNavigation(
  results: any,
  inputValue: string,
  isSearchPage: boolean,
  onSearch?: (term: string) => void,
  isUserEditingRef?: React.MutableRefObject<boolean>,
  closeDropdown?: () => void
) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const mapView = useAppSelector((state) => state.search.mapView);
  const navigationInProgressRef = useRef(false);
  const prevPathRef = useRef<string | null>(null);

  // Prefetch search page for faster transitions
  useEffect(() => {
    try {
      router.prefetch("/search");
    } catch (error) {
      // Ignore if prefetch isn't available
    }
  }, [router]);

  // Navigate to search page with optimizations
  const navigateToSearch = useCallback(
    (
      term: string = "",
      centerMatch: { id: string; [key: string]: any } | null = null
    ) => {
      if (navigationInProgressRef.current) return;
      navigationInProgressRef.current = true;

      // Clean up old search results first
      if (!isSearchPage) {
        dispatch(resetSearch());
      }

      // Then update the search term
      dispatch(setSearchTerm(term));
      dispatch(setLoading(true));

      // If we have an exact center match, go directly to center page
      if (centerMatch) {
        router.push(`/centers/${centerMatch.id}`);
        navigationInProgressRef.current = false;
        return;
      }

      // Get map parameters
      let centerParam: [number, number] | undefined;
      let distanceParam: number | undefined;

      if (mapView) {
        centerParam = [mapView.center.latitude, mapView.center.longitude];
        distanceParam = mapView.distance;
      }

      // Create search URL
      const searchUrl = createSearchUrl({
        query: term,
        center: centerParam,
        distance: distanceParam,
      });

      // CHANGED: Always use router.push, even on the search page
      // This forces a full navigation and re-fetching of data
      router.push(searchUrl);

      // If we're on the search page, also explicitly trigger a new search
      // This ensures results update even if the navigation doesn't fully reload
      if (isSearchPage && mapView) {
        dispatch(executeSearch({ forceUpdate: true }));
      }

      // Reset navigation flag after a short delay
      setTimeout(() => {
        navigationInProgressRef.current = false;
      }, 300);
    },
    [dispatch, router, mapView, isSearchPage]
  );

  // Option selection handler
  const handleOptionSelect = useCallback(
    (option: string) => {
      // Check if option matches a center
      const exactCenterMatch = results?.centers?.find(
        (center: any) => center.name.toLowerCase() === option.toLowerCase()
      );

      // If we have a search handler, use it
      if (onSearch) {
        onSearch(option);
        if (closeDropdown) closeDropdown();
        if (isUserEditingRef) isUserEditingRef.current = false;
        return;
      }

      // Otherwise navigate
      navigateToSearch(option, exactCenterMatch);
      if (closeDropdown) closeDropdown();
      if (isUserEditingRef) isUserEditingRef.current = false;
    },
    [results, onSearch, navigateToSearch, closeDropdown, isUserEditingRef]
  );

  // Form submission handler
  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      // Check for exact center match
      const exactCenterMatch = results?.centers?.find(
        (center: any) => center.name.toLowerCase() === inputValue.toLowerCase()
      );

      // If we have a search handler, use it
      if (onSearch) {
        onSearch(inputValue);
        if (closeDropdown) closeDropdown();
        if (isUserEditingRef) isUserEditingRef.current = false;
        return;
      }

      // Otherwise navigate to search
      navigateToSearch(inputValue, exactCenterMatch);
      if (closeDropdown) closeDropdown();
      if (isUserEditingRef) isUserEditingRef.current = false;
    },
    [
      inputValue,
      results,
      onSearch,
      navigateToSearch,
      closeDropdown,
      isUserEditingRef,
    ]
  );

  return {
    handleOptionSelect,
    handleSearchSubmit,
    navigateToSearch,
  };
}
