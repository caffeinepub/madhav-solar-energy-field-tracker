import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import type { PhotoRecord } from "./backend";
import { useGPS } from "./hooks/useGPS";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useGetPhotoRecords,
} from "./hooks/useQueries";

import CameraSection from "./components/CameraSection";
import DashboardSection from "./components/DashboardSection";
import FeatureRow from "./components/FeatureRow";
import Footer from "./components/Footer";
import GPSHud from "./components/GPSHud";
import Header from "./components/Header";
import Hero from "./components/Hero";
import PhotoFeed from "./components/PhotoFeed";
import PhotoModal from "./components/PhotoModal";
import ProfileSetupModal from "./components/ProfileSetupModal";

export default function App() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [selectedPhoto, setSelectedPhoto] = useState<{
    photo: PhotoRecord;
    index: number;
  } | null>(null);
  const [technicianName, setTechnicianName] = useState("");

  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();
  const { data: photoRecords = [], isLoading: photosLoading } =
    useGetPhotoRecords();

  const gps = useGPS();

  const showProfileSetup =
    isAuthenticated &&
    !profileLoading &&
    profileFetched &&
    userProfile === null;
  const currentName = userProfile?.name || technicianName || "";

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    // Smooth scroll to section
    const el = document.getElementById(`${section}-section`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handlePhotoClick = (photo: PhotoRecord, index: number) => {
    setSelectedPhoto({ photo, index });
  };

  const handleStartTracking = () => {
    handleSectionChange("dashboard");
    gps.startTracking();
  };

  const handleViewPhotos = () => {
    handleSectionChange("photos");
    const el = document.getElementById("photos-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        userName={currentName}
      />

      <GPSHud
        position={gps.position}
        isTracking={gps.isTracking}
        error={gps.error}
      />

      <main className="flex-1">
        <Hero
          onStartTracking={handleStartTracking}
          onViewPhotos={handleViewPhotos}
        />

        <FeatureRow />

        <div id="dashboard-section">
          <DashboardSection
            position={gps.position}
            isTracking={gps.isTracking}
            photoRecords={photoRecords}
            photosLoading={photosLoading}
            onPhotoClick={handlePhotoClick}
          />
        </div>

        <div className="border-t border-border">
          <CameraSection position={gps.position} technicianName={currentName} />
        </div>

        <div id="photos-section">
          <PhotoFeed
            photos={photoRecords}
            isLoading={photosLoading}
            onPhotoClick={handlePhotoClick}
          />
        </div>
      </main>

      <Footer />

      <PhotoModal
        photo={selectedPhoto?.photo || null}
        index={selectedPhoto?.index ?? 0}
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />

      <ProfileSetupModal
        isOpen={showProfileSetup}
        onComplete={(name) => setTechnicianName(name)}
      />

      <Toaster richColors position="top-right" />
    </div>
  );
}
