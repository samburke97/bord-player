"use client";

import React, { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import styles from "./LocationSection.module.css";

interface LocationSectionProps {
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
}

const LocationSection: React.FC<LocationSectionProps> = ({
  address,
  latitude,
  longitude,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    // Set your Mapbox access token
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

    // Check if coordinates are available
    if (!latitude || !longitude || !mapContainer.current) {
      return;
    }

    // Create map instance
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [longitude, latitude],
      zoom: 14,
      interactive: false,
      attributionControl: false,
    });

    // Add marker
    const markerElement = document.createElement("div");
    markerElement.className = styles.customMapMarker;

    const marker = new mapboxgl.Marker({
      element: markerElement,
    })
      .setLngLat([longitude, latitude])
      .addTo(map.current);

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [latitude, longitude]);

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Location</h2>

      <div className={styles.mapContainer} ref={mapContainer}>
        {(!latitude || !longitude) && (
          <div className={styles.fallbackContainer}>
            <div className={styles.mapMarker}></div>
            <p className={styles.fallbackText}>Location unavailable</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default LocationSection;
