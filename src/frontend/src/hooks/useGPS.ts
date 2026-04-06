import { useCallback, useEffect, useRef, useState } from "react";

export interface GPSPosition {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number;
  lastUpdated: Date;
}

export interface GPSState {
  position: GPSPosition | null;
  isTracking: boolean;
  error: string | null;
  isSupported: boolean;
}

export function useGPS() {
  const [state, setState] = useState<GPSState>({
    position: null,
    isTracking: false,
    error: null,
    isSupported: typeof navigator !== "undefined" && "geolocation" in navigator,
  });

  const watchIdRef = useRef<number | null>(null);
  const isSupported = state.isSupported;

  const startTracking = useCallback(() => {
    if (!isSupported) {
      setState((prev) => ({ ...prev, error: "Geolocation not supported" }));
      return;
    }

    setState((prev) => ({ ...prev, isTracking: true, error: null }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setState((prev) => ({
          ...prev,
          position: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            altitude: pos.coords.altitude,
            accuracy: pos.coords.accuracy,
            lastUpdated: new Date(),
          },
          error: null,
          isTracking: true,
        }));
      },
      (err) => {
        let msg = "Location error";
        if (err.code === err.PERMISSION_DENIED)
          msg = "Location permission denied";
        else if (err.code === err.POSITION_UNAVAILABLE)
          msg = "Position unavailable";
        else if (err.code === err.TIMEOUT) msg = "Location request timed out";
        setState((prev) => ({ ...prev, error: msg, isTracking: false }));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  }, [isSupported]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setState((prev) => ({ ...prev, isTracking: false }));
  }, []);

  // Start on mount
  useEffect(() => {
    startTracking();
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [startTracking]);

  return { ...state, startTracking, stopTracking };
}
