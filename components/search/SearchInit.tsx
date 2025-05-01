// components/SearchInitializer.tsx
"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUserLocation } from "@/store/redux/features/searchSlice";

const DEFAULT_LOCATION = { latitude: 51.5074, longitude: -0.1278 };

export default function SearchInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!navigator.geolocation) {
      dispatch(setUserLocation(DEFAULT_LOCATION));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        dispatch(
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          })
        );
      },
      () => {
        dispatch(setUserLocation(DEFAULT_LOCATION));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [dispatch]);

  return null;
}
