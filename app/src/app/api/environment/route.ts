import { NextRequest, NextResponse } from "next/server";
import { getTideForecast, getWeather } from "@/lib/environment";
import { sunTimes } from "@/lib/sun";
import { moonPhase } from "@/lib/moonphase";
import { goodFishingDay } from "@/lib/goodFishingDay";
import { localDate } from "@/lib/dates";

// Client-side entry point (used by NearMe, which only has a browser-geolocation
// point, not a server-rendered page) into the same environment data EnvironmentPanel
// uses server-side. Read-only, no auth needed — it's all public location data.
export async function GET(request: NextRequest) {
  const lat = parseFloat(request.nextUrl.searchParams.get("lat") ?? "");
  const lng = parseFloat(request.nextUrl.searchParams.get("lng") ?? "");
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json({ error: "lat/lng required" }, { status: 400 });
  }

  const today = new Date();
  const [tide, weather] = await Promise.all([getTideForecast(lat, lng), getWeather(lat, lng)]);
  const sun = sunTimes(today, lat, lng);
  const moon = moonPhase(localDate(today));
  const gfd = goodFishingDay(localDate(today), tide, weather);

  return NextResponse.json({
    tide,
    weather,
    sunrise: sun.sunrise,
    sunset: sun.sunset,
    moon,
    goodFishingDay: gfd,
  });
}
