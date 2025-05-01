"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AnimatePresence } from "framer-motion";
import { useGeolocation } from "@/hooks/useGeolocation";
import LocationPrompt from "@/components/ui/LocationPrompt";

export default function SearchInitializer() {
  const dispatch = useDispatch();
  const {
    latitude,
    longitude,
    error,
    isLoading,
    isLocationPromptVisible,
    retryBrowserLocation,
  } = useGeolocation();

  // Location is handled by the useGeolocation hook now
  // No default to London needed - the hook will try browser location,
  // then IP location, and show a prompt if both fail

  useEffect(() => {
    if (error) {
      console.log("Location error:", error);
    }
  }, [error]);

  return (
    <>
      <AnimatePresence>
        {isLocationPromptVisible && (
          <LocationPrompt onEnableLocation={retryBrowserLocation} />
        )}
      </AnimatePresence>
    </>
  );
}
