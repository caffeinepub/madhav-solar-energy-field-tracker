import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Image, MapPin, Mountain, ZoomIn } from "lucide-react";
import { useState } from "react";
import type { PhotoRecord } from "../backend";

interface PhotoFeedProps {
  photos: PhotoRecord[];
  isLoading: boolean;
  onPhotoClick: (photo: PhotoRecord, index: number) => void;
}

export default function PhotoFeed({
  photos,
  isLoading,
  onPhotoClick,
}: PhotoFeedProps) {
  return (
    <section className="py-8 bg-background" id="photos-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground">
              Site Photos
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Geo-tagged field photos with GPS metadata
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {photos.length} photo{photos.length !== 1 ? "s" : ""} recorded
          </div>
        </div>

        {isLoading ? (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            data-ocid="photos.loading_state"
          >
            {["a", "b", "c", "d", "e", "f", "g", "h"].map((key) => (
              <Skeleton key={key} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 text-muted-foreground"
            data-ocid="photos.empty_state"
          >
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
              <Image className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              No photos yet
            </h3>
            <p className="text-sm">
              Capture your first field photo using the camera above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <PhotoTile
                key={`photo-${photo.timestamp}-${index}`}
                photo={photo}
                index={index}
                onClick={() => onPhotoClick(photo, index)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function PhotoTile({
  photo,
  index,
  onClick,
}: {
  photo: PhotoRecord;
  index: number;
  onClick: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const imgUrl = photo.blob.getDirectURL();

  return (
    <button
      type="button"
      data-ocid={`photos.item.${index + 1}`}
      className="relative group rounded-lg overflow-hidden bg-gray-100 aspect-square cursor-pointer shadow-xs hover:shadow-card transition-shadow w-full"
      onClick={onClick}
    >
      {imgError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Image className="w-8 h-8 text-gray-400" />
        </div>
      ) : (
        <img
          src={imgUrl}
          alt={`Field site ${index + 1}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgError(true)}
        />
      )}

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Metadata overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1">
          <MapPin className="w-2.5 h-2.5 text-primary flex-shrink-0" />
          <span className="font-mono truncate">
            {photo.latitude.toFixed(4)}, {photo.longitude.toFixed(4)}
          </span>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <Mountain className="w-2.5 h-2.5 text-primary flex-shrink-0" />
          <span>{photo.altitude.toFixed(1)} m</span>
          <span className="mx-1 text-white/40">·</span>
          <Clock className="w-2.5 h-2.5 text-primary flex-shrink-0" />
          <span className="truncate">{photo.dateString}</span>
        </div>
      </div>

      {/* Index badge */}
      <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-1.5 py-0.5 rounded">
        #{index + 1}
      </div>

      {/* Actions */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <span
          data-ocid={`photos.view.button.${index + 1}`}
          className="w-6 h-6 bg-black/60 hover:bg-black/80 rounded flex items-center justify-center text-white"
          title="View full screen"
        >
          <ZoomIn className="w-3 h-3" />
        </span>
      </div>
    </button>
  );
}
