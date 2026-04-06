import { Button } from "@/components/ui/button";
import { Camera, MapPin, Navigation } from "lucide-react";
import { motion } from "motion/react";

interface HeroProps {
  onStartTracking: () => void;
  onViewPhotos: () => void;
}

export default function Hero({ onStartTracking, onViewPhotos }: HeroProps) {
  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: "520px" }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/assets/generated/solar-farm-hero.dim_1400x600.jpg')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col lg:flex-row items-center gap-10">
        {/* Left: Text content */}
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/40 rounded-full px-3 py-1 mb-4">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span className="text-primary text-xs font-semibold uppercase tracking-wider">
                Field Tracking App · Amreli, Gujarat
              </span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              Efficient Field Tracking &{" "}
              <span className="text-primary">Project Management</span>
            </h1>

            <p className="text-white/70 text-base sm:text-lg mb-8 max-w-xl">
              Real-time GPS location tracking, geo-mapped photo capture, and
              automatic location updates for Madhav Solar Energy field teams
              across Gujarat.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                data-ocid="hero.start_tracking.button"
                onClick={onStartTracking}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2.5 gap-2"
              >
                <Navigation className="w-4 h-4" />
                Start Tracking
              </Button>
              <Button
                data-ocid="hero.view_photos.button"
                onClick={onViewPhotos}
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 font-semibold px-6 py-2.5 gap-2"
              >
                <Camera className="w-4 h-4" />
                View Photos
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Right: Map card */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex-shrink-0 w-full lg:w-80 xl:w-96"
        >
          <div className="bg-white rounded-xl shadow-elevated overflow-hidden border border-white/20">
            <div className="bg-foreground px-4 py-2.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 gps-pulse" />
              <span className="text-white/80 text-xs font-medium">
                Live GPS · AMRELI, GUJARAT
              </span>
            </div>
            <div className="p-1">
              <MiniMapPlaceholder />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function MiniMapPlaceholder() {
  return (
    <div
      className="relative w-full rounded-lg overflow-hidden bg-slate-100"
      style={{ height: "220px" }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          backgroundColor: "#e8f0e8",
        }}
      />
      {/* Road-like lines */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 320 220"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M 0 110 Q 80 90 160 110 Q 240 130 320 110"
          stroke="#c8d8c8"
          strokeWidth="8"
          fill="none"
        />
        <path
          d="M 160 0 Q 140 55 160 110 Q 180 165 160 220"
          stroke="#c8d8c8"
          strokeWidth="6"
          fill="none"
        />
        <path
          d="M 0 160 Q 100 150 200 160 Q 260 165 320 155"
          stroke="#d4e0d4"
          strokeWidth="4"
          fill="none"
        />
      </svg>
      {/* Pulsing dot */}
      <div
        className="absolute"
        style={{ top: "calc(50% - 10px)", left: "calc(50% - 10px)" }}
      >
        <div
          className="w-5 h-5 bg-primary border-2 border-white rounded-full shadow-md"
          style={{ boxShadow: "0 0 0 6px rgba(245,158,11,0.3)" }}
        />
      </div>
      <div className="absolute bottom-2 right-2 bg-white/90 rounded px-2 py-1 text-xs font-medium text-gray-600">
        21.6006°N, 71.2209°E
      </div>
    </div>
  );
}
