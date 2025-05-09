import { useRef, useCallback, useEffect } from "react";
import mapboxgl from "mapbox-gl";

export function useMapMovement(
  mapRef: React.MutableRefObject<mapboxgl.Map | null>
) {
  const isUserControllingRef = useRef(false);
  const lastInteractionTimeRef = useRef(0);
  const scheduledCenteringRef = useRef<{
    lngLat: [number, number];
    zoom?: number;
    options?: mapboxgl.AnimationOptions;
  } | null>(null);

  // Call this when you want to center the map on a point
  const centerMapSafely = useCallback(
    (
      lngLat: [number, number],
      zoom: number | undefined = undefined,
      options: mapboxgl.AnimationOptions = {}
    ) => {
      if (!mapRef.current) return;

      // If user is actively controlling the map, don't interrupt
      if (isUserControllingRef.current) {
        // Schedule this centering for later when user stops interacting
        scheduledCenteringRef.current = { lngLat, zoom, options };
        return;
      }

      // If it's been less than 500ms since last user interaction, defer
      const timeSinceLastInteraction =
        Date.now() - lastInteractionTimeRef.current;
      if (timeSinceLastInteraction < 500) {
        scheduledCenteringRef.current = { lngLat, zoom, options };

        // Set a timeout to apply this change later
        setTimeout(() => {
          if (scheduledCenteringRef.current && mapRef.current) {
            const { lngLat, zoom, options } = scheduledCenteringRef.current;
            scheduledCenteringRef.current = null;

            if (zoom !== undefined) {
              mapRef.current.easeTo({
                center: lngLat,
                zoom,
                ...options,
                duration: 600, // Slower animation for smoother transition
              });
            } else {
              mapRef.current.easeTo({
                center: lngLat,
                ...options,
                duration: 600,
              });
            }
          }
        }, 500 - timeSinceLastInteraction);

        return;
      }

      // Safe to center the map now
      if (zoom !== undefined) {
        mapRef.current.easeTo({
          center: lngLat,
          zoom,
          ...options,
          duration: 600, // Slower duration for smoother transitions
        });
      } else {
        mapRef.current.easeTo({
          center: lngLat,
          ...options,
          duration: 600,
        });
      }
    },
    [mapRef]
  );

  // Set up event listeners to track user interaction
  useEffect(() => {
    if (!mapRef.current) return;

    const handleDragStart = () => {
      isUserControllingRef.current = true;
    };

    const handleDragEnd = () => {
      isUserControllingRef.current = false;
      lastInteractionTimeRef.current = Date.now();
    };

    const handleZoomStart = () => {
      isUserControllingRef.current = true;
    };

    const handleZoomEnd = () => {
      isUserControllingRef.current = false;
      lastInteractionTimeRef.current = Date.now();
    };

    const map = mapRef.current;
    map.on("dragstart", handleDragStart);
    map.on("dragend", handleDragEnd);
    map.on("zoomstart", handleZoomStart);
    map.on("zoomend", handleZoomEnd);

    // Set up a check to process any pending centering operations
    const checkPendingOperations = () => {
      if (
        !isUserControllingRef.current &&
        scheduledCenteringRef.current &&
        Date.now() - lastInteractionTimeRef.current > 500 &&
        mapRef.current
      ) {
        const { lngLat, zoom, options } = scheduledCenteringRef.current;
        scheduledCenteringRef.current = null;

        if (zoom !== undefined) {
          mapRef.current.easeTo({
            center: lngLat,
            zoom,
            ...options,
            duration: 600,
          });
        } else {
          mapRef.current.easeTo({
            center: lngLat,
            ...options,
            duration: 600,
          });
        }
      }
    };

    const interval = setInterval(checkPendingOperations, 200);

    return () => {
      map.off("dragstart", handleDragStart);
      map.off("dragend", handleDragEnd);
      map.off("zoomstart", handleZoomStart);
      map.off("zoomend", handleZoomEnd);
      clearInterval(interval);
    };
  }, [mapRef]);

  return { centerMapSafely, isUserControlling: isUserControllingRef };
}
