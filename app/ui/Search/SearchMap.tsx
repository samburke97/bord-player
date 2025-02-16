"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import styles from "./SearchMap.module.css";
import MapCard from "./MapCard";
import { Center } from "@/app/lib/definitions";
import { Gps, Add, Minus } from "iconsax-react";

mapboxgl.accessToken =
  "pk.eyJ1Ijoic2FtaXNib3JkIiwiYSI6ImNtM211eDF1djA0aTAyaW9paTlzdjZxOGYifQ.JpqQGl5Lmyq-eH0HMDORXQ";

interface SearchMapProps {
  centers: Center[];
  setActivePin: (id: string | null) => void;
  loading: boolean;
  userLocation?: { latitude: number; longitude: number } | null;
  onBoundsChange?:
    | ((bounds: {
        north: number;
        south: number;
        east: number;
        west: number;
      }) => void)
    | null;
  searchTerm: string;
}

const SearchMap: React.FC<SearchMapProps> = ({
  centers,
  setActivePin,
  userLocation,
  loading,
  onBoundsChange,
  searchTerm,
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [activePin, setActivePinState] = useState<string | null>(null);
  const [cardPosition, setCardPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [cardContent, setCardContent] = useState<Center | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const [mapLoading, setMapLoading] = useState(true);

  // Fallback location if user location is not provided
  const defaultLocation = {
    latitude: 51.5074, // London coordinates
    longitude: -0.1278,
  };

  // Create markers function
  const createMarkers = useCallback(() => {
    // Ensure mapRef.current is not null
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // Add new markers
    centers.forEach((center) => {
      const latitude = Number(center.latitude);
      const longitude = Number(center.longitude);

      if (isNaN(latitude) || isNaN(longitude)) return;

      const markerElement = document.createElement("div");
      markerElement.className = "custom-marker";
      markerElement.style.backgroundImage = "url('/images/map/base-pin.svg')";
      markerElement.style.width = "42px";
      markerElement.style.height = "55px";
      markerElement.style.backgroundSize = "cover";
      markerElement.style.backgroundRepeat = "no-repeat";
      markerElement.style.cursor = "pointer";
      markerElement.style.position = "absolute";
      markerElement.style.zIndex = "1000";

      const marker = new mapboxgl.Marker({
        element: markerElement,
        anchor: "bottom",
      })
        .setLngLat([longitude, latitude])
        .addTo(map);

      markersRef.current.set(center.id, marker);

      markerElement.addEventListener("click", (e) => {
        e.stopPropagation();

        // Reset previous active pin
        if (activePin) {
          const prevMarker = markersRef.current.get(activePin);
          if (prevMarker) {
            prevMarker.getElement().style.backgroundImage =
              "url('/images/map/base-pin.svg')";
          }
        }

        setActivePinState(center.id);
        setActivePin(center.id);
        markerElement.style.backgroundImage =
          "url('/images/map/active-pin.svg')";

        const pinPosition = marker.getLngLat();
        const pixelPosition = map.project(pinPosition);

        const isTopHalf =
          pixelPosition.y < mapContainer.current!.clientHeight / 2;
        setCardPosition({
          top: isTopHalf ? pixelPosition.y + 60 : pixelPosition.y - 380,
          left: pixelPosition.x - 175,
        });

        setCardContent(center);
      });
    });
  }, [
    centers,
    activePin,
    setActivePin,
    setActivePinState,
    setCardPosition,
    setCardContent,
  ]);

  useEffect(() => {
    const location = userLocation || defaultLocation;

    if (!mapContainer.current) return;

    // Prevent map reinitialization if already exists
    if (mapRef.current) {
      mapRef.current.setCenter([location.longitude, location.latitude]);
      return;
    }

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/samisbord/cm3h9lzqc002h01sq4zx18vbq",
      attributionControl: false,
      zoom: 13,
      center: [location.longitude, location.latitude],
    });

    mapRef.current = map;

    map.on("load", () => {
      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserLocation: true,
      });
      map.addControl(geolocateControl);

      // Clear MapCard on map movement
      map.on("movestart", () => {
        setActivePinState(null);
        setActivePin(null);
        setCardContent(null);
        setCardPosition(null);
      });

      // Handle bounds change
      map.on("moveend", () => {
        if (onBoundsChange) {
          const bounds = map.getBounds();

          // Null check to satisfy TypeScript
          if (bounds) {
            onBoundsChange({
              north: bounds.getNorth(),
              south: bounds.getSouth(),
              east: bounds.getEast(),
              west: bounds.getWest(),
            });
          }
        }
      });

      setMapLoading(false);

      // Trigger marker creation after map load
      if (centers.length > 0) {
        createMarkers();
      }
    });

    return () => {
      if (mapRef.current) {
        markersRef.current.forEach((marker) => marker.remove());
        mapRef.current.remove();
      }
    };
  }, [userLocation, centers, createMarkers]);

  // Update markers whenever centers change
  useEffect(() => {
    if (!mapRef.current || mapLoading) return;

    createMarkers();
  }, [centers, mapLoading, createMarkers]);

  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  const handleGeolocate = () => {
    const location = userLocation || defaultLocation;
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [location.longitude, location.latitude],
        zoom: 12,
        speed: 0.5,
        curve: 1,
      });
    }
  };

  return (
    <div className={styles.map}>
      <div ref={mapContainer} className={styles.mapContainer}></div>

      {activePin && cardPosition && cardContent && (
        <div
          className={styles.cardWrapper}
          style={{
            position: "absolute",
            top: `${cardPosition.top}px`,
            left: `${cardPosition.left}px`,
            zIndex: 10,
          }}
        >
          <MapCard
            centerName={cardContent.name}
            centerAddress={cardContent.address ?? null}
            centerSports={cardContent.sports?.map((sport) => sport.name) || []}
            centerImage={cardContent.images}
          />
        </div>
      )}

      <div className={styles.customControls}>
        <button onClick={handleGeolocate} className={styles.controlButton}>
          <Gps size={24} variant="Bold" />
        </button>
        <button onClick={handleZoomIn} className={styles.controlButton}>
          <Add size={24} />
        </button>
        <button onClick={handleZoomOut} className={styles.controlButton}>
          <Minus size={24} />
        </button>
      </div>

      {(loading || mapLoading) && (
        <div className={styles.searchIndicator}>
          <span className={styles.loadingDots}>
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default SearchMap;
