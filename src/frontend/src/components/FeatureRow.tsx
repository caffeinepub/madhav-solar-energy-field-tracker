import { Camera, MapIcon, Navigation, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    icon: Navigation,
    title: "LIVE GPS TRACKING",
    description:
      "Continuous location updates via watchPosition API with altitude, accuracy, and timestamp.",
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    icon: MapIcon,
    title: "GEO-MAPPING SITE DATA",
    description:
      "Interactive Leaflet map with photo pin markers, auto-pan to current position.",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: Camera,
    title: "SECURE PHOTO CAPTURE",
    description:
      "Device camera integration with GPS metadata overlay — lat, lng, altitude, date.",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    icon: RefreshCw,
    title: "AUTOMATIC UPDATES",
    description:
      "Location auto-refreshes as you move. Map marker follows your GPS signal in real time.",
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
];

export default function FeatureRow() {
  return (
    <section className="bg-card border-b border-border py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="flex flex-col items-center text-center p-4 rounded-xl hover:shadow-card transition-shadow"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-3`}
                >
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3
                  className={`font-heading text-xs font-bold tracking-wider ${feature.color} mb-2`}
                >
                  {feature.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
