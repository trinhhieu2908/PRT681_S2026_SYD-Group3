import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { formatDate } from "@/common/utils/date";
import { DialogTitle, DialogDescription } from "@radix-ui/react-dialog";

interface GalleryMedia {
  id: string;
  url: string;
  alt: string;
  mimeType: string;
  authorName?: string;
  createdAt: string;
}

interface MediaGalleryProps {
  media: GalleryMedia[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export const MediaGallery = ({
  media,
  initialIndex,
  isOpen,
  onClose,
}: MediaGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Reset to initial index when gallery opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  const currentMedia = media[currentIndex];
  const isImage = currentMedia?.mimeType.startsWith("image/");
  const isVideo = currentMedia?.mimeType.startsWith("video/");

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowLeft":
        goToPrevious();
        break;
      case "ArrowRight":
        goToNext();
        break;
      case "Escape":
        onClose();
        break;
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!currentMedia) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle></DialogTitle>
      <DialogDescription></DialogDescription>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-black/90 border-0 overflow-hidden border-gray-100/20">
        <div className="relative w-full h-full flex flex-col">
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white border-0"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Media content */}
          <div className="flex-1 flex items-center justify-center p-4 min-h-0 relative">
            {isImage ? (
              <img
                src={currentMedia.url}
                alt={currentMedia.alt}
                className="max-w-full max-h-full object-contain"
                style={{ maxHeight: "calc(90vh - 100px)" }}
              />
            ) : isVideo ? (
              <video
                src={currentMedia.url}
                controls
                className="max-w-full max-h-full object-contain"
                style={{ maxHeight: "calc(90vh - 100px)" }}
                autoPlay
              />
            ) : (
              <div className="text-white text-center">
                <p>Unsupported media type</p>
                <p className="text-sm text-gray-400">{currentMedia.mimeType}</p>
              </div>
            )}

            {/* Navigation buttons */}
            {media.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white border-0"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white border-0"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}
          </div>

          {/* Media info */}
          <div className="flex-shrink-0 px-4 pb-4">
            <div className="bg-black/50 text-white px-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{currentMedia.alt}</h3>
                  <p className="text-sm text-gray-300">
                    {currentMedia.authorName && `${currentMedia.authorName} • `}
                    {formatDate(currentMedia.createdAt, "datetime-compact")}
                  </p>
                </div>
                <div className="text-sm text-gray-300">
                  {currentIndex + 1} of {media.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
