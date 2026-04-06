import { useEffect, useRef } from "react";
import type { PhotoRecord } from "../backend";
import type { GPSPosition } from "../hooks/useGPS";

interface LiveMapProps {
  position: GPSPosition | null;
  photoRecords: PhotoRecord[];
  height?: string;
}

const LEAFLET_CSS =
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
const LEAFLET_JS =
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";

let leafletScriptPromise: Promise<void> | null = null;

function loadLeaflet(): Promise<void> {
  if (leafletScriptPromise) return leafletScriptPromise;

  leafletScriptPromise = new Promise((resolve, reject) => {
    // Inject CSS if not already present
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }

    // If L is already on window, resolve immediately
    if ((window as any).L) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = LEAFLET_JS;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Leaflet"));
    document.head.appendChild(script);
  });

  return leafletScriptPromise;
}

export default function LiveMap({
  position,
  photoRecords,
  height = "450px",
}: LiveMapProps) {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<any>(null);
  const photoMarkersRef = useRef<any[]>([]);
  const initializedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (initializedRef.current || !mapContainerRef.current) return;

      try {
        await loadLeaflet();
      } catch {
        return;
      }

      if (!isMounted || !mapContainerRef.current) return;

      const L = (window as any).L;
      if (!L) return;

      // Fix default icon paths
      const proto = L.Icon.Default.prototype as any;
      // biome-ignore lint/performance/noDelete: Required Leaflet icon fix
      delete proto._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const defaultCenter: [number, number] = [21.6006, 71.2209];
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
      initializedRef.current = true;

      const liveIcon = L.divIcon({
        html: `<div style="
          width: 20px; height: 20px;
          background: #F59E0B;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 0 0 4px rgba(245,158,11,0.4);
          animation: gps-pulse 2s ease-in-out infinite;
        "></div>`,
        className: "",
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      markerRef.current = L.marker(defaultCenter, { icon: liveIcon }).addTo(
        map,
      );
      markerRef.current
        .bindPopup("<b>\uD83D\uDCCD Current Position</b><br>Amreli, Gujarat")
        .openPopup();
    };

    initMap();

    return () => {
      isMounted = false;
    };
  }, []);

  // Update live position marker
  useEffect(() => {
    if (!mapRef.current || !markerRef.current || !position) return;

    const latlng: [number, number] = [position.latitude, position.longitude];
    markerRef.current.setLatLng(latlng);
    markerRef.current.setPopupContent(
      `<b>\uD83D\uDCCD Live Position</b><br>Lat: ${position.latitude.toFixed(6)}<br>Lng: ${position.longitude.toFixed(6)}<br>Alt: ${
        position.altitude !== null ? `${position.altitude.toFixed(1)} m` : "N/A"
      }<br><small>Updated: ${position.lastUpdated.toLocaleTimeString()}</small>`,
    );
    mapRef.current.setView(latlng, mapRef.current.getZoom(), { animate: true });
  }, [position]);

  // Add photo markers
  useEffect(() => {
    const L = (window as any).L;
    if (!mapRef.current || !L) return;

    for (const m of photoMarkersRef.current) {
      m.remove();
    }
    photoMarkersRef.current = [];

    for (const [idx, record] of photoRecords.entries()) {
      const photoIcon = L.divIcon({
        html: `<div style="
          width: 28px; height: 28px;
          background: white;
          border: 2.5px solid #F59E0B;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          font-size: 14px;
        ">\uD83D\uDCF7</div>`,
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([record.latitude, record.longitude], {
        icon: photoIcon,
      })
        .addTo(mapRef.current)
        .bindPopup(
          `<b>Photo #${idx + 1}</b><br>${record.technicianName}<br>${record.dateString}<br>Alt: ${record.altitude.toFixed(1)} m`,
        );
      photoMarkersRef.current.push(marker);
    }
  }, [photoRecords]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height }}
      className="w-full rounded-lg border border-border overflow-hidden"
      data-ocid="map.canvas_target"
    />
  );
}
