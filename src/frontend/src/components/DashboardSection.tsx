import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, MapPin, Mountain, RefreshCw } from "lucide-react";
import type { PhotoRecord } from "../backend";
import type { GPSPosition } from "../hooks/useGPS";
import LiveMap from "./LiveMap";

interface DashboardSectionProps {
  position: GPSPosition | null;
  isTracking: boolean;
  photoRecords: PhotoRecord[];
  photosLoading: boolean;
  onPhotoClick: (photo: PhotoRecord, index: number) => void;
}

export default function DashboardSection({
  position,
  isTracking,
  photoRecords,
  photosLoading,
  onPhotoClick,
}: DashboardSectionProps) {
  return (
    <section className="py-8" id="dashboard-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Live Dashboard
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time GPS map with auto-updating location marker
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map – 2/3 width on desktop */}
          <div className="lg:col-span-2">
            <Card className="shadow-card overflow-hidden">
              <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Live Field Map
                </CardTitle>
                <div className="flex items-center gap-1.5 text-xs">
                  <span
                    className={`w-2 h-2 rounded-full ${isTracking && position ? "bg-green-500 gps-pulse" : "bg-gray-300"}`}
                  />
                  <span
                    className={
                      isTracking && position
                        ? "text-green-600"
                        : "text-muted-foreground"
                    }
                  >
                    {isTracking && position ? "Live" : "Offline"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <LiveMap
                  position={position}
                  photoRecords={photoRecords}
                  height="460px"
                />
              </CardContent>
            </Card>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Live location card */}
            <Card className="shadow-card">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${isTracking && position ? "bg-green-500 gps-pulse" : "bg-gray-300"}`}
                  />
                  Live Location
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                {position ? (
                  <>
                    <LocationRow
                      icon={<MapPin className="w-3.5 h-3.5 text-primary" />}
                      label="Latitude"
                      value={`${position.latitude.toFixed(6)}°`}
                    />
                    <LocationRow
                      icon={<MapPin className="w-3.5 h-3.5 text-primary" />}
                      label="Longitude"
                      value={`${position.longitude.toFixed(6)}°`}
                    />
                    <LocationRow
                      icon={<Mountain className="w-3.5 h-3.5 text-primary" />}
                      label="Altitude"
                      value={
                        position.altitude !== null
                          ? `${position.altitude.toFixed(1)} m`
                          : "N/A"
                      }
                    />
                    <LocationRow
                      icon={<Clock className="w-3.5 h-3.5 text-primary" />}
                      label="Updated"
                      value={position.lastUpdated.toLocaleTimeString("en-IN")}
                    />
                    <div className="pt-1">
                      <div className="text-xs text-muted-foreground mb-1">
                        Date:{" "}
                        {position.lastUpdated.toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Accuracy: ±{position.accuracy.toFixed(0)} m
                      </div>
                    </div>
                  </>
                ) : (
                  <div
                    className="space-y-2"
                    data-ocid="dashboard.gps.loading_state"
                  >
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="text-xs text-muted-foreground pt-2">
                      Acquiring GPS...
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Site photos feed */}
            <Card className="shadow-card">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Recent Photos</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {photoRecords.length} total
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                {photosLoading ? (
                  <div
                    className="grid grid-cols-2 gap-2"
                    data-ocid="dashboard.photos.loading_state"
                  >
                    {["a", "b", "c", "d"].map((key) => (
                      <Skeleton
                        key={key}
                        className="aspect-square rounded-md"
                      />
                    ))}
                  </div>
                ) : photoRecords.length === 0 ? (
                  <div
                    className="text-center py-6 text-xs text-muted-foreground"
                    data-ocid="dashboard.photos.empty_state"
                  >
                    No photos yet
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {photoRecords.slice(0, 6).map((photo, idx) => (
                      <button
                        key={`photo-${photo.timestamp}-${idx}`}
                        type="button"
                        data-ocid={`dashboard.photo.item.${idx + 1}`}
                        className="relative aspect-square rounded-md overflow-hidden cursor-pointer group w-full"
                        onClick={() => onPhotoClick(photo, idx)}
                      >
                        <img
                          src={photo.blob.getDirectURL()}
                          alt={`Field site ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-1">
                          <div className="text-white text-xs truncate font-mono">
                            {photo.latitude.toFixed(4)},
                            {photo.longitude.toFixed(4)}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

function LocationRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="font-mono text-sm font-semibold text-foreground">
        {value}
      </div>
    </div>
  );
}
