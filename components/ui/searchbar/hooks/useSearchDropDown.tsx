// components/ui/SearchBar/hooks/useSearchDropdown.ts
"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export function useSearchDropdown(
  onDropdownChange?: (isOpen: boolean) => void
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [state, setState] = useState({
    isDropdownOpen: false,
    isMobileView: false,
    dropdownPosition: { top: 0, left: 0, width: 0 },
  });

  const { isDropdownOpen, isMobileView, dropdownPosition } = state;

  // Helper to update state
  const updateState = useCallback((newState: Partial<typeof state>) => {
    setState((prev) => ({ ...prev, ...newState }));
  }, []);

  // Calculate dropdown position
  const calculateDropdownPosition = useCallback(() => {
    if (!containerRef.current || !isDropdownOpen) return;

    const rect = containerRef.current.getBoundingClientRect();
    updateState({
      dropdownPosition: {
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
      },
    });
  }, [isDropdownOpen, updateState]);

  // Handle screen width changes
  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;

      if (currentWidth >= 1024 && isMobileView) {
        updateState({
          isMobileView: false,
          isDropdownOpen: false,
        });
        document.body.style.overflow = "";
      } else if (currentWidth < 1024 && isDropdownOpen && !isMobileView) {
        updateState({ isMobileView: true });
        document.body.style.overflow = "hidden";
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobileView, isDropdownOpen, updateState]);

  // Update position on resize and scroll
  useEffect(() => {
    if (!isDropdownOpen) return;

    calculateDropdownPosition();

    const handleWindowResize = () => calculateDropdownPosition();

    const handleScroll = () => {
      closeDropdown();
    };

    window.addEventListener("resize", handleWindowResize);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isDropdownOpen, calculateDropdownPosition]);

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
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Input focus handler
  const handleInputFocus = useCallback(() => {
    updateState({ isDropdownOpen: true });
    calculateDropdownPosition();

    if (window.innerWidth < 1024) {
      updateState({ isMobileView: true });
    }
  }, [calculateDropdownPosition, updateState]);

  // Close dropdown
  const closeDropdown = useCallback(() => {
    updateState({
      isDropdownOpen: false,
      isMobileView: false,
    });
  }, [updateState]);

  return {
    containerRef,
    dropdownRef,
    isDropdownOpen,
    isMobileView,
    dropdownPosition,
    calculateDropdownPosition,
    handleInputFocus,
    closeDropdown,
    updateState,
  };
}
