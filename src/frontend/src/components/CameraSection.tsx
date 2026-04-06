import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Camera,
  CameraOff,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Mountain,
  Navigation,
  RotateCcw,
  ShieldOff,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useCamera } from "../camera/useCamera";
import type { GPSPosition } from "../hooks/useGPS";
import { useAddPhotoRecord } from "../hooks/useQueries";

interface CapturedPhoto {
  dataUrl: string;
  position: GPSPosition;
  capturedAt: Date;
  address: string;
}

interface CameraSectionProps {
  position: GPSPosition | null;
  technicianName: string;
}

export default function CameraSection({
  position,
  technicianName,
}: CameraSectionProps) {
  const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [flashActive, setFlashActive] = useState(false);

  // Live clock — ticks every second
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Reverse geocoding
  const [address, setAddress] = useState<string>("Acquiring address...");
  const lastGeocodedRef = useRef<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (!position) return;

    const { latitude: lat, longitude: lon } = position;

    // Avoid re-fetching if coords haven't changed significantly
    if (lastGeocodedRef.current) {
      const prev = lastGeocodedRef.current;
      const distLat = Math.abs(prev.lat - lat);
      const distLon = Math.abs(prev.lon - lon);
      if (distLat < 0.0001 && distLon < 0.0001) return;
    }

    lastGeocodedRef.current = { lat, lon };
    setAddress("Acquiring address...");

    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      { headers: { "Accept-Language": "en" } },
    )
      .then((res) => res.json())
      .then((data) => {
        const raw: string = data?.display_name ?? "";
        const truncated = raw.length > 60 ? `${raw.slice(0, 57)}...` : raw;
        setAddress(truncated || "Address unavailable");
      })
      .catch(() => setAddress("Address unavailable"));
  }, [position]);

  const addPhotoRecord = useAddPhotoRecord();

  const {
    isActive,
    isSupported,
    error,
    isLoading,
    startCamera,
    stopCamera,
    capturePhoto,
    videoRef,
    canvasRef,
  } = useCamera({ facingMode: "environment", quality: 0.85 });

  // Keep a stable ref so the mount effect doesn't need the functions in its dep array
  const cameraActionsRef = useRef({ startCamera, stopCamera });
  cameraActionsRef.current = { startCamera, stopCamera };

  // Auto-start camera on mount with a small delay to let the DOM fully render
  // the video element before we try to attach a stream to it.
  useEffect(() => {
    const timer = setTimeout(() => {
      cameraActionsRef.current.startCamera();
    }, 300);
    return () => {
      clearTimeout(timer);
      cameraActionsRef.current.stopCamera();
    };
  }, []);

  const handleStartCamera = async () => {
    setCapturedPhoto(null);
    await startCamera();
  };

  const handleCapture = async () => {
    if (!isActive) return;

    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 350);

    const file = await capturePhoto();
    if (!file) {
      toast.error("Failed to capture photo");
      return;
    }

    const dataUrl = await fileToDataUrl(file);
    const pos = position || {
      latitude: 21.6006,
      longitude: 71.2209,
      altitude: 45,
      accuracy: 10,
      lastUpdated: new Date(),
    };

    setCapturedPhoto({
      dataUrl,
      position: pos,
      capturedAt: new Date(),
      address,
    });

    await stopCamera();
  };

  const handleSave = async () => {
    if (!capturedPhoto) return;
    setIsSaving(true);
    try {
      const bytes = dataUrlToBytes(capturedPhoto.dataUrl);
      const blob = ExternalBlob.fromBytes(bytes);
      const id = crypto.randomUUID();
      const pos = capturedPhoto.position;
      const dateString = capturedPhoto.capturedAt.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      await addPhotoRecord.mutateAsync({
        id,
        photo: {
          blob,
          latitude: pos.latitude,
          longitude: pos.longitude,
          altitude: pos.altitude ?? 0,
          dateString,
          timestamp: BigInt(capturedPhoto.capturedAt.getTime()),
          technicianName: technicianName || "Field Agent",
        },
      });

      toast.success("Photo saved to backend!");
      setCapturedPhoto(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save photo. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetake = async () => {
    setCapturedPhoto(null);
    await handleStartCamera();
  };

  // Format current time: "06 Apr 2026  14:35:22"
  const formattedTime = currentTime.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const isPermissionError = error?.type === "permission";

  return (
    <section className="py-8" id="camera-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Capture Site Photo
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Capture geo-tagged photos with live GPS coordinates, altitude, and
            address data.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-card overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" />
                {capturedPhoto ? "Photo Preview" : "Camera Preview"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Outer wrapper always holds minHeight so the card never collapses */}
              <div
                className="relative bg-gray-950"
                style={{ minHeight: "300px" }}
              >
                {flashActive && (
                  <div className="absolute inset-0 bg-white z-20 pointer-events-none shutter-flash" />
                )}

                {capturedPhoto ? (
                  <div className="relative">
                    <img
                      src={capturedPhoto.dataUrl}
                      alt="Captured field site"
                      className="w-full object-cover"
                      style={{ maxHeight: "400px" }}
                    />
                    {/* Captured photo overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <div className="text-white text-xs space-y-1 font-mono">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-primary" />
                          <span>
                            {capturedPhoto.position.latitude.toFixed(6)},{" "}
                            {capturedPhoto.position.longitude.toFixed(6)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Mountain className="w-3 h-3 text-primary" />
                          <span>
                            Alt:{" "}
                            {capturedPhoto.position.altitude !== null
                              ? `${capturedPhoto.position.altitude.toFixed(1)} m`
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-primary" />
                          <span>
                            {capturedPhoto.capturedAt.toLocaleString("en-US", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                              hour12: false,
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Navigation className="w-3 h-3 text-primary" />
                          <span className="truncate">
                            {capturedPhoto.address}
                          </span>
                        </div>
                        <div className="text-primary font-semibold">
                          MADHAV SOLAR ENERGY · AMRELI, GJ
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/*
                      Video element is ALWAYS rendered and ALWAYS has display:block.
                      We use visibility + height to show/hide it rather than
                      conditionally rendering it — this ensures the stream can
                      attach in any browser without race conditions.
                    */}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      controls={false}
                      style={{
                        display: "block",
                        width: "100%",
                        minHeight: "300px",
                        objectFit: "cover",
                        // Keep visible always so the stream can play;
                        // overlays below cover the blank frame when inactive.
                        visibility: isActive ? "visible" : "hidden",
                        position: isActive ? "relative" : "absolute",
                        top: 0,
                        left: 0,
                      }}
                    />

                    {/* Placeholder shown when camera is NOT active */}
                    {!isActive && (
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                        style={{ minHeight: "300px" }}
                      >
                        {isSupported === false ? (
                          <>
                            <CameraOff className="w-12 h-12 text-white/40" />
                            <p className="text-sm text-white/60">
                              Camera not supported in this browser
                            </p>
                          </>
                        ) : isPermissionError ? (
                          <>
                            <ShieldOff className="w-12 h-12 text-red-400" />
                            <p className="text-sm text-red-300 text-center px-6">
                              Camera permission denied — please allow camera
                              access in your browser settings
                            </p>
                            <Button
                              data-ocid="camera.retry.button"
                              size="sm"
                              variant="outline"
                              onClick={handleStartCamera}
                              className="text-white border-white/30 hover:bg-white/10"
                            >
                              Retry
                            </Button>
                          </>
                        ) : error ? (
                          <>
                            <CameraOff className="w-10 h-10 text-red-400" />
                            <p
                              className="text-sm text-center text-red-300 px-6"
                              data-ocid="camera.error_state"
                            >
                              {error.message}
                            </p>
                            <Button
                              data-ocid="camera.retry.button"
                              size="sm"
                              variant="outline"
                              onClick={handleStartCamera}
                              className="text-white border-white/30 hover:bg-white/10"
                            >
                              Retry
                            </Button>
                          </>
                        ) : isLoading ? (
                          <>
                            <Loader2
                              className="w-10 h-10 animate-spin text-primary"
                              data-ocid="camera.loading_state"
                            />
                            <p className="text-sm text-white/60">
                              Starting camera...
                            </p>
                          </>
                        ) : (
                          <>
                            <Camera className="w-12 h-12 text-white/40" />
                            <p className="text-sm text-white/60">
                              Tap Start Camera
                            </p>
                          </>
                        )}
                      </div>
                    )}

                    {/* Live overlay on the video viewfinder */}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-3 pt-10">
                        <div className="text-white text-xs space-y-1 font-mono">
                          <div className="flex items-center gap-1.5">
                            <Camera className="w-3 h-3 text-primary flex-shrink-0" />
                            <span>{formattedTime}</span>
                          </div>
                          {position ? (
                            <>
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 text-primary flex-shrink-0" />
                                <span>
                                  {position.latitude.toFixed(6)},{" "}
                                  {position.longitude.toFixed(6)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Mountain className="w-3 h-3 text-primary flex-shrink-0" />
                                <span>
                                  Alt:{" "}
                                  {position.altitude !== null
                                    ? `${position.altitude.toFixed(1)} m`
                                    : "N/A"}
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-primary flex-shrink-0" />
                              <span className="text-white/60">
                                Acquiring GPS...
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <Navigation className="w-3 h-3 text-primary flex-shrink-0" />
                            <span className="truncate max-w-full">
                              {address}
                            </span>
                          </div>
                          <div className="text-primary font-bold tracking-wide">
                            MADHAV SOLAR ENERGY · AMRELI, GJ
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Canvas must always be in the DOM for capturePhoto() */}
                    <canvas ref={canvasRef} style={{ display: "none" }} />
                  </>
                )}
              </div>

              <div className="p-4 flex gap-3 justify-center">
                {capturedPhoto ? (
                  <>
                    <Button
                      data-ocid="camera.retake.button"
                      variant="outline"
                      onClick={handleRetake}
                      className="flex-1 gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Retake
                    </Button>
                    <Button
                      data-ocid="camera.save.button"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Save Photo
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    {!isActive ? (
                      <Button
                        data-ocid="camera.start.button"
                        onClick={handleStartCamera}
                        disabled={isLoading || isSupported === false}
                        className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />{" "}
                            Starting...
                          </>
                        ) : (
                          <>
                            <Camera className="w-4 h-4" /> Start Camera
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        data-ocid="camera.capture.button"
                        onClick={handleCapture}
                        disabled={!isActive || isLoading}
                        size="lg"
                        className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-6 text-base font-semibold rounded-full"
                      >
                        <Camera className="w-5 h-5" />
                        Capture Photo
                      </Button>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right side: Live Location Data card */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Live Location Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {position ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-accent/50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">
                        Latitude
                      </div>
                      <div className="font-mono text-sm font-semibold text-foreground">
                        {position.latitude.toFixed(6)}°
                      </div>
                    </div>
                    <div className="bg-accent/50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">
                        Longitude
                      </div>
                      <div className="font-mono text-sm font-semibold text-foreground">
                        {position.longitude.toFixed(6)}°
                      </div>
                    </div>
                    <div className="bg-accent/50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">
                        Altitude
                      </div>
                      <div className="font-mono text-sm font-semibold text-foreground">
                        {position.altitude !== null
                          ? `${position.altitude.toFixed(1)} m`
                          : "N/A"}
                      </div>
                    </div>
                    <div className="bg-accent/50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">
                        Accuracy
                      </div>
                      <div className="font-mono text-sm font-semibold text-foreground">
                        ±{position.accuracy.toFixed(0)} m
                      </div>
                    </div>
                  </div>

                  {/* Date & Time (live clock) */}
                  <div className="bg-accent/50 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">
                      Date &amp; Time
                    </div>
                    <div className="font-mono text-sm font-semibold text-foreground">
                      {formattedTime}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="bg-accent/50 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Navigation className="w-3 h-3" />
                      Address
                    </div>
                    <div className="text-sm font-semibold text-foreground leading-snug">
                      {address}
                    </div>
                  </div>

                  <div className="bg-accent/50 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">
                      Last Updated
                    </div>
                    <div className="text-sm font-semibold text-foreground">
                      {position.lastUpdated.toLocaleString("en-US", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: false,
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 rounded-lg p-3">
                    <span className="w-2 h-2 rounded-full bg-green-500 gps-pulse" />
                    GPS signal active · Auto-updating
                  </div>
                </>
              ) : (
                <div
                  className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2"
                  data-ocid="camera.gps.loading_state"
                >
                  <MapPin className="w-8 h-8" />
                  <p className="text-sm">Acquiring GPS signal...</p>
                  <p className="text-xs">Allow location access when prompted</p>
                </div>
              )}

              <div className="border-t border-border pt-4">
                <div className="text-xs text-muted-foreground mb-2">Site</div>
                <div className="font-semibold text-sm text-foreground">
                  AMRELI, GUJARAT
                </div>
                <div className="text-xs text-muted-foreground">
                  Madhav Solar Energy · Field Operations
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function dataUrlToBytes(dataUrl: string): Uint8Array<ArrayBuffer> {
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
