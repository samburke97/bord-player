import React, { useRef, useEffect } from "react";
import mapboxgl, { Map } from "mapbox-gl";

// Set your Mapbox access token
mapboxgl.accessToken =
  "pk.eyJ1Ijoic2FtaXNib3JkIiwiYSI6ImNtM211eDF1djA0aTAyaW9paTlzdjZxOGYifQ.JpqQGl5Lmyq-eH0HMDORXQ";

const MapComponent: React.FC = () => {
  // Specify the type as HTMLElement | null for TypeScript
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<Map | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return; // Initialize map only once and check if container is valid

    map.current = new mapboxgl.Map({
      container: mapContainer.current, // Container element for the map
      style: "mapbox://styles/samisbord/cm3h9lzqc002h01sq4zx18vbq", // Custom map style URL
      center: [-73.935242, 40.73061], // Replace with your starting coordinates (longitude, latitude)
      zoom: 10, // Desired zoom level
    });
  }, []);

  return <div ref={mapContainer} style={{ width: "100%", height: "500px" }} />;
};

export default MapComponent;
