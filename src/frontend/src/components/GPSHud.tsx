import { AlertCircle, Clock, MapPin, Navigation } from "lucide-react";
import type { GPSPosition } from "../hooks/useGPS";

interface GPSHudProps {
  position: GPSPosition | null;
  isTracking: boolean;
  error: string | null;
}

export default function GPSHud({ position, isTracking, error }: GPSHudProps) {
  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div
      className="bg-foreground text-primary-foreground px-4 py-2"
      data-ocid="gps.hud.panel"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4 text-xs">
        {/* Tracking status */}
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isTracking && position
                ? "bg-green-400 gps-pulse"
                : "bg-yellow-400"
            }`}
          />
          <span
            className={
              isTracking && position
                ? "text-green-400 font-semibold"
                : "text-yellow-400"
            }
          >
            {isTracking && position
              ? "Tracking Active"
              : error
                ? "GPS Error"
                : "Acquiring GPS..."}
          </span>
        </div>

        {error && (
          <div
            className="flex items-center gap-1 text-red-400"
            data-ocid="gps.error_state"
          >
            <AlertCircle className="w-3 h-3" />
            <span>{error}</span>
          </div>
        )}

        {position && (
          <>
            <div className="flex items-center gap-1 text-white/80">
              <MapPin className="w-3 h-3 text-primary" />
              <span>
                <span className="text-white/50">Lat:</span>{" "}
                <span className="font-mono text-white">
                  {position.latitude.toFixed(6)}
                </span>
              </span>
              <span className="text-white/30 mx-1">|</span>
              <span>
                <span className="text-white/50">Lng:</span>{" "}
                <span className="font-mono text-white">
                  {position.longitude.toFixed(6)}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-1 text-white/80">
              <Navigation className="w-3 h-3 text-primary" />
              <span>
                <span className="text-white/50">Alt:</span>{" "}
                <span className="font-mono text-white">
                  {position.altitude !== null
                    ? `${position.altitude.toFixed(1)} m`
                    : "N/A"}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-1 text-white/80 ml-auto">
              <Clock className="w-3 h-3 text-primary" />
              <span className="text-white/50">Updated:</span>{" "}
              <span className="font-mono text-white">
                {formatTime(position.lastUpdated)}
              </span>
              <span className="text-white/30 mx-1">·</span>
              <span className="font-mono text-white">
                {formatDate(position.lastUpdated)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
