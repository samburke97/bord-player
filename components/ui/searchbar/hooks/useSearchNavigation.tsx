import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/store";
import { setSearchTerm, resetSearch } from "@/store/features/searchSlice";
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
  const navigationInProgressRef = useRef(false);

  // Navigate to search page with optimizations
  const navigateToSearch = useCallback(
    (
      term: string = "",
      centerMatch: { id: string; [key: string]: any } | null = null
    ) => {
      if (navigationInProgressRef.current) return;
      navigationInProgressRef.current = true;

      // If we have an exact center match, go directly to center page
      if (centerMatch) {
        router.push(`/centers/${centerMatch.id}`);
        navigationInProgressRef.current = false;
        return;
      }

      // Update Redux search term first for immediate UI feedback
      dispatch(setSearchTerm(term));

      // On search page, update the URL without navigation to avoid a full page reload
      if (isSearchPage) {
        // Update the URL - this should trigger the search through URL parameter effect
        const currentUrl = new URL(window.location.href);
        const searchParams = new URLSearchParams(currentUrl.search);

        if (term) {
          searchParams.set("q", term);
        } else {
          searchParams.delete("q");
        }

        // Use history.replaceState for instant URL update without navigation
        const newUrl = `${currentUrl.pathname}?${searchParams.toString()}`;
        window.history.replaceState(null, "", newUrl);

        // Execute search immediately using the thunk (avoid waiting for URL effect)
        dispatch(executeSearch({ forceUpdate: true }));
      } else {
        // For non-search pages, navigate to search page with the term
        router.push(`/search${term ? `?q=${encodeURIComponent(term)}` : ""}`);
      }

      // Reset navigation flag after a short delay
      setTimeout(() => {
        navigationInProgressRef.current = false;
      }, 300);
    },
    [dispatch, router, isSearchPage]
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
