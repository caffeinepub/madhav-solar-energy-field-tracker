import { Button } from "@/components/ui/button";
import { Clock, Download, MapPin, Mountain, User, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { PhotoRecord } from "../backend";

interface PhotoModalProps {
  photo: PhotoRecord | null;
  index: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function PhotoModal({
  photo,
  index,
  isOpen,
  onClose,
}: PhotoModalProps) {
  if (!photo) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          data-ocid="photos.modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative max-w-4xl w-full bg-card rounded-xl overflow-hidden shadow-elevated"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              data-ocid="photos.modal.close_button"
              onClick={onClose}
              className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Photo */}
            <div className="relative">
              <img
                src={photo.blob.getDirectURL()}
                alt={`Field site ${index + 1}`}
                className="w-full object-contain max-h-[70vh]"
              />
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            </div>

            {/* Metadata footer */}
            <div className="p-5 bg-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-primary font-semibold uppercase tracking-wider mb-2">
                    Field Record #{index + 1} · MADHAV SOLAR ENERGY
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Coordinates
                        </div>
                        <div className="font-mono font-medium">
                          {photo.latitude.toFixed(6)}°,{" "}
                          {photo.longitude.toFixed(6)}°
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Mountain className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Altitude
                        </div>
                        <div className="font-mono font-medium">
                          {photo.altitude.toFixed(1)} m
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Date &amp; Time
                        </div>
                        <div className="font-medium">{photo.dateString}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Technician
                        </div>
                        <div className="font-medium">
                          {photo.technicianName}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <a
                  href={photo.blob.getDirectURL()}
                  download={`site-${index + 1}.jpg`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 flex-shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
