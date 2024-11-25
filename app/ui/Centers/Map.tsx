"use client";

import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import styles from "./Map.module.css";

mapboxgl.accessToken =
  "pk.eyJ1Ijoic2FtaXNib3JkIiwiYSI6ImNtM211eDF1djA0aTAyaW9paTlzdjZxOGYifQ.JpqQGl5Lmyq-eH0HMDORXQ";

const MapComponent: React.FC<{ latitude: number; longitude: number }> = ({
  latitude,
  longitude,
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [markerPosition, setMarkerPosition] = useState<{
    x: number;
    y: number;
  }>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/samisbord/cm3h9lzqc002h01sq4zx18vbq",
      center: [longitude, latitude],
      zoom: 14,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on("load", () => {
      const initialPosition = map.project([longitude, latitude]);
      setMarkerPosition({
        x: initialPosition.x,
        y: initialPosition.y,
      });
    });

    map.on("move", () => {
      const newPosition = map.project([longitude, latitude]);
      setMarkerPosition({
        x: newPosition.x,
        y: newPosition.y,
      });
    });

    return () => {
      map.remove();
    };
  }, [latitude, longitude]);

  return (
    <div className={styles.map}>
      <div ref={mapContainer} className={styles.mapContainer}></div>
      <div
        className={styles.marker}
        style={{
          left: `${markerPosition.x}px`,
          top: `${markerPosition.y}px`,
        }}
      >
        <img
          src="/images/location.svg"
          alt="Location Marker"
          className={`${styles.image}`}
        />
      </div>
    </div>
  );
};

export default MapComponent;
