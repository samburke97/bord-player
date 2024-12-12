"use client";

import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import styles from "./SearchMap.module.css";

mapboxgl.accessToken =
  "pk.eyJ1Ijoic2FtaXNib3JkIiwiYSI6ImNtM211eDF1djA0aTAyaW9paTlzdjZxOGYifQ.JpqQGl5Lmyq-eH0HMDORXQ";

interface Center {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
}

const SearchMap: React.FC<{ centers: Center[] }> = ({ centers }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [markerPositions, setMarkerPositions] = useState<
    { x: number; y: number }[]
  >([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/samisbord/cm3h9lzqc002h01sq4zx18vbq",
      center: [153.026, -26.65],
      zoom: 10,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on("load", () => {
      const positions: { x: number; y: number }[] = [];
      centers.forEach((center) => {
        if (center.latitude && center.longitude) {
          const position = map.project([center.longitude, center.latitude]);
          positions.push({
            x: position.x,
            y: position.y,
          });
        }
      });

      setMarkerPositions(positions);

      if (centers.length > 0) {
        map.fitBounds([
          [
            Math.min(...centers.map((c) => c.longitude!)),
            Math.min(...centers.map((c) => c.latitude!)),
          ],
          [
            Math.max(...centers.map((c) => c.longitude!)),
            Math.max(...centers.map((c) => c.latitude!)),
          ],
        ]);
      }
    });

    return () => {
      map.remove();
    };
  }, [centers]);

  return (
    <div className={styles.mapContainer}>
      <div ref={mapContainer} className={styles.map}></div>
      {markerPositions.map((position, index) => (
        <div
          key={index}
          className={styles.marker}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
        >
          <img
            src="/images/location.svg"
            alt="Location Marker"
            className={styles.image}
          />
        </div>
      ))}
    </div>
  );
};

export default SearchMap;
