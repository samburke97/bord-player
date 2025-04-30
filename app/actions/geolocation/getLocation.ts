"use server";

import { headers } from "next/headers";

// Interface for the return type
interface LocationResult {
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  country: string | null;
  source: string;
}

// Cache IP lookups to avoid rate limiting issues
const locationCache = new Map<string, LocationResult>();

export async function getLocation(): Promise<LocationResult> {
  // Default response - no location found
  const defaultResponse: LocationResult = {
    latitude: null,
    longitude: null,
    city: null,
    country: null,
    source: "unknown",
  };

  try {
    // Get client IP from headers
    const headersList = headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const ip = forwardedFor ? forwardedFor.split(",")[0] : realIp || "";

    console.log("Getting location for IP:", ip || "unknown");

    // If we're in local development
    if (!ip || ip === "127.0.0.1" || ip === "::1") {
      // For development, try to use an alternative service that doesn't rate limit as much
      try {
        // Option 1: Try ipinfo.io - they have a more generous free tier than ipapi.co
        const response = await fetch("https://ipinfo.io/json");

        if (response.ok) {
          const data = await response.json();

          // ipinfo.io returns location as "lat,lng" string
          if (data.loc) {
            const [lat, lng] = data.loc.split(",").map(Number);

            return {
              latitude: lat,
              longitude: lng,
              city: data.city || null,
              country: data.country || null,
              source: "ipinfo",
            };
          }
        }
      } catch (error) {
        console.error("Error getting location from ipinfo:", error);
      }

      // Return default when in development and can't get location
      return defaultResponse;
    }

    // Check if we have the location cached
    if (locationCache.has(ip)) {
      console.log("Using cached location for IP");
      return locationCache.get(ip)!;
    }

    // Try multiple services in sequence to avoid rate limiting
    const services = [
      // Try ipinfo.io first (more generous free tier)
      async () => {
        const response = await fetch("https://ipinfo.io/json");
        if (!response.ok)
          throw new Error(`ipinfo.io returned ${response.status}`);

        const data = await response.json();
        if (!data.loc) throw new Error("No location data from ipinfo.io");

        const [lat, lng] = data.loc.split(",").map(Number);
        return {
          latitude: lat,
          longitude: lng,
          city: data.city || null,
          country: data.country || null,
          source: "ipinfo",
        };
      },

      // Fall back to abstractapi (another option)
      async () => {
        // You would need to sign up for a free API key
        const apiKey = process.env.ABSTRACT_API_KEY || "";
        if (!apiKey) throw new Error("No Abstract API key");

        const response = await fetch(
          `https://ipgeolocation.abstractapi.com/v1/?api_key=${apiKey}&ip_address=${ip}`
        );
        if (!response.ok)
          throw new Error(`abstractapi returned ${response.status}`);

        const data = await response.json();
        return {
          latitude: data.latitude,
          longitude: data.longitude,
          city: data.city || null,
          country: data.country || null,
          source: "abstractapi",
        };
      },

      // Last resort: ipapi.co (most restrictive rate limiting)
      async () => {
        const response = await fetch(`https://ipapi.co/${ip}/json/`);
        if (!response.ok)
          throw new Error(`ipapi.co returned ${response.status}`);

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        return {
          latitude: data.latitude,
          longitude: data.longitude,
          city: data.city || null,
          country: data.country_name || null,
          source: "ipapi",
        };
      },
    ];

    // Try each service in sequence until one works
    for (const getLocationFromService of services) {
      try {
        const locationResult = await getLocationFromService();

        // Cache successful results
        locationCache.set(ip, locationResult);

        return locationResult;
      } catch (error) {
        console.error("Service error:", error);
        // Continue to next service
      }
    }

    // If all services fail, return default
    return defaultResponse;
  } catch (error) {
    console.error("Geolocation error:", error);
    return defaultResponse;
  }
}
