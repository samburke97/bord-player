import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get IP address from request headers
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ip = forwardedFor ? forwardedFor.split(",")[0] : realIp || "";

    console.log("Geolocation API called with IP headers:", {
      forwardedFor,
      realIp,
      resolvedIp: ip,
    });

    if (!ip || ip === "127.0.0.1" || ip === "::1") {
      console.log(
        "Local development IP detected, trying alternative IP lookup"
      );

      // For local development, try to get external IP
      try {
        const externalIpResponse = await fetch(
          "https://api.ipify.org?format=json"
        );
        if (externalIpResponse.ok) {
          const externalIpData = await externalIpResponse.json();

          if (externalIpData.ip) {
            console.log(
              "Using external IP for geolocation:",
              externalIpData.ip
            );
            const geoResponse = await fetch(
              `https://ipapi.co/${externalIpData.ip}/json/`
            );

            if (geoResponse.ok) {
              const geoData = await geoResponse.json();
              console.log("IP geolocation successful:", {
                city: geoData.city,
                region: geoData.region,
                country: geoData.country_name,
                latitude: geoData.latitude,
                longitude: geoData.longitude,
              });

              return NextResponse.json({
                latitude: geoData.latitude,
                longitude: geoData.longitude,
                city: geoData.city,
                region: geoData.region,
                country: geoData.country_name,
                source: "external-ip",
              });
            }
          }
        }
      } catch (externalIpError) {
        console.error("External IP lookup failed:", externalIpError);
      }

      console.log("Could not determine IP location");
      // Return error status
      return NextResponse.json(
        {
          error: "Could not determine location from local IP",
        },
        { status: 422 }
      );
    }

    console.log(`Calling IP geolocation API with IP: ${ip}`);
    // Call free IP geolocation API
    const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`);

    if (!geoResponse.ok) {
      console.error(`IP API responded with ${geoResponse.status}`);
      throw new Error(`IP API responded with ${geoResponse.status}`);
    }

    const geoData = await geoResponse.json();
    console.log("Raw geolocation response:", geoData);

    // Check if the API returned error or valid coordinates
    if (geoData.error || !geoData.latitude || !geoData.longitude) {
      console.error(
        "IP Geolocation error:",
        geoData.error || "No coordinates returned"
      );
      // Return error status
      return NextResponse.json(
        {
          error: "Invalid response from IP geolocation service",
        },
        { status: 500 }
      );
    }

    console.log("IP geolocation successful:", {
      city: geoData.city,
      region: geoData.region,
      country: geoData.country_name,
      latitude: geoData.latitude,
      longitude: geoData.longitude,
    });

    return NextResponse.json({
      latitude: geoData.latitude,
      longitude: geoData.longitude,
      city: geoData.city,
      region: geoData.region,
      country: geoData.country_name,
      source: "ip",
    });
  } catch (error) {
    console.error("Geolocation API error:", error);
    // Return error status
    return NextResponse.json(
      {
        error: "Geolocation API error",
      },
      { status: 500 }
    );
  }
}
