"use client";

import { useEffect, useState } from "react";

export type CurrentCityState =
  | { status: "loading" }
  | { status: "ready"; city: string; country: string | null }
  | { status: "unavailable" };

export function useCurrentCity() {
  const [state, setState] = useState<CurrentCityState>({ status: "loading" });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ status: "unavailable" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const params = new URLSearchParams({
            lat: String(position.coords.latitude),
            lon: String(position.coords.longitude),
          });

          const response = await fetch(`/api/reverse-geocode?${params}`);
          const data = await response.json();

          if (response.ok && data.city) {
            setState({
              status: "ready",
              city: data.city,
              country: data.country ?? null,
            });
          } else {
            setState({ status: "unavailable" });
          }
        } catch {
          setState({ status: "unavailable" });
        }
      },
      () => setState({ status: "unavailable" }),
      { timeout: 10000, maximumAge: 600000 }
    );
  }, []);

  return state;
}
