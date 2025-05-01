import { NextResponse } from "next/server";

export async function GET() {
  try {
    const ipinfoResponse = await tryIpinfo();
    if (ipinfoResponse) return ipinfoResponse;

    const ipApiResponse = await tryIpApi();
    if (ipApiResponse) return ipApiResponse;

    console.error("All geolocation services failed");
    return NextResponse.json(
      { error: "Failed to determine location from IP" },
      { status: 500 }
    );
  } catch (error) {
    console.error("IP Geolocation error:", error);
    return NextResponse.json(
      { error: "Failed to determine location from IP" },
      { status: 500 }
    );
  }
}

async function tryIpinfo() {
  try {
    const apiKey = process.env.IPINFO_TOKEN;

    if (!apiKey) {
      console.log("No IPINFO_TOKEN found, skipping ipinfo.io");
      return null;
    }

    const response = await fetch(`https://ipinfo.io/json?token=${apiKey}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`ipinfo.io API error: ${response.status}`);
    }

    const data = await response.json();

    let latitude = null;
    let longitude = null;

    if (data.loc) {
      const [lat, lng] = data.loc.split(",").map(Number);
      latitude = lat;
      longitude = lng;
    }

    if (!latitude || !longitude) {
      console.log("Invalid location data from ipinfo.io");
      return null;
    }

    return NextResponse.json({
      latitude,
      longitude,
      city: data.city || null,
      region: data.region || null,
      country: data.country || null,
      source: "ipinfo",
      ip: data.ip,
      ...(process.env.NODE_ENV === "development" ? { _raw: data } : {}),
    });
  } catch (error) {
    console.error("ipinfo.io error:", error);
    return null;
  }
}

async function tryIpApi() {
  try {
    const response = await fetch(
      "http://ip-api.com/json/?fields=status,message,lat,lon,city,country,query",
      {
        headers: { Accept: "application/json" },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`ip-api.com API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== "success" || !data.lat || !data.lon) {
      console.log("Invalid location data from ip-api.com");
      return null;
    }

    return NextResponse.json({
      latitude: data.lat,
      longitude: data.lon,
      city: data.city || null,
      country: data.country || null,
      source: "ip-api",
      ip: data.query,
      ...(process.env.NODE_ENV === "development" ? { _raw: data } : {}),
    });
  } catch (error) {
    console.error("ip-api.com error:", error);
    return null;
  }
}
