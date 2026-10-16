import { cn } from "@/common/utils";
import { AlertCircle, ImagePlus, Loader2 } from "lucide-react";
import { useRef, useState } from "react";

interface ImageUploadPlaceholderProps {
  onFilesSelected: (files: File[]) => void;
  isUploading?: boolean;
  progress?: number;
  hasError?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  className?: string;
}

export const ImageUploadPlaceholder = ({
  onFilesSelected,
  isUploading = false,
  progress,
  hasError = false,
  disabled = false,
  multiple = true,
  className,
}: ImageUploadPlaceholderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const isDisabled = disabled || isUploading;

  const handleFiles = (files: FileList | null) => {
    if (!files || isDisabled) return;
    onFilesSelected(Array.from(files));

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    handleFiles(event.dataTransfer.files);
  };

  return (
    <>
      <button
        type="button"
        className={cn(
          "w-14 h-14 flex-shrink-0 rounded-md border border-dashed border-gray-300 bg-gray-50 text-gray-500",
          "flex flex-col items-center justify-center transition-colors",
          "hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600",
          isDragOver && "border-primary-400 bg-primary-50 text-primary-600",
          hasError && "border-red-300 bg-red-50 text-red-500",
          isDisabled &&
            "cursor-not-allowed opacity-70 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-500",
          className,
        )}
        disabled={isDisabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          if (!isDisabled) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        aria-label="Upload images"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {typeof progress === "number" && (
              <span className="text-[10px] leading-none mt-1">{progress}%</span>
            )}
          </>
        ) : hasError ? (
          <AlertCircle className="w-5 h-5" />
        ) : (
          <ImagePlus className="w-5 h-5" />
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        disabled={isDisabled}
        onChange={(event) => handleFiles(event.target.files)}
      />
    </>
  );
};
