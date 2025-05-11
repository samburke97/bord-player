// app/actions/getGeolocation.ts
"use server";

export async function getGeolocation(ip?: string) {
  try {
    // Use the IP-API service to get location based on IP
    // Note: In production, consider using a paid service with higher limits and reliability
    const apiUrl = ip
      ? `http://ip-api.com/json/${ip}?fields=status,message,lat,lon,city,country,regionName,query`
      : "http://ip-api.com/json/?fields=status,message,lat,lon,city,country,regionName,query";

    const response = await fetch(apiUrl, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`IP geolocation API error: ${response.status}`);
    }

    const data = await response.json();

    // Check if we got valid location data
    if (data.status !== "success" || !data.lat || !data.lon) {
      // Return null values to indicate we couldn't determine location
      return {
        latitude: null,
        longitude: null,
        city: null,
        country: null,
        region: null,
        source: "unknown",
        error: "Could not determine location from IP address",
      };
    }

    // Return the actual location data
    return {
      latitude: data.lat,
      longitude: data.lon,
      city: data.city || null,
      region: data.regionName || null,
      country: data.country || null,
      source: "ip-api",
      error: null,
    };
  } catch (error) {
    console.error("Geolocation error:", error);

    // Return error information instead of a fallback location
    return {
      latitude: null,
      longitude: null,
      city: null,
      region: null,
      country: null,
      source: "error",
      error: "Failed to determine location",
    };
  }
}
