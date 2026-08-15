import JSZip from "jszip";
import { saveAs } from "file-saver";
import { processWithConcurrency } from "@/common/utils/batch-process";

interface Media {
  url: string;
  mimeType: string;
  key: string;
}

export type ZipOptions = {
  filename?: string;
  concurrency?: number;
  onProgress?: (done: number, total: number) => void;
};

function getExtensionFromMimeOrKey(mimeType: string, key?: string): string {
  const fromKey = key?.split(".").pop();
  if (fromKey && fromKey.length <= 5) return `.${fromKey}`;
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/heic": ".heic",
    "image/heif": ".heif",
    "image/heif-sequence": ".heifs",
    "video/mp4": ".mp4",
    "video/quicktime": ".mov",
  };
  return map[mimeType] ?? "";
}

function sanitizeFilenamePart(input: string): string {
  const name = input.split("/").pop() || input;
  return name.replace(/[^\w-]+/g, "_").slice(0, 60);
}

export async function downloadMediaAsZip(
  media: Media[],
  options: ZipOptions = {},
): Promise<void> {
  const filename = options.filename ?? "media.zip";
  const concurrency = Math.max(1, Math.min(options.concurrency ?? 4, 8));
  const zip = new JSZip();

  let completed = 0;
  const total = media.length;

  const downloadMedia = async (item: Media) => {
    try {
      const response = await fetch(item.url);
      if (!response.ok) throw new Error(`Failed to fetch ${item.url}`);
      const blob = await response.blob();

      const base = sanitizeFilenamePart(item.key);
      const ext = getExtensionFromMimeOrKey(item.mimeType, item.key);
      const name = `${base}${ext || ""}`;

      zip.file(`${filename}/${name}`, blob);
    } catch {
      // Skip failed items silently
    } finally {
      completed += 1;
      options.onProgress?.(completed, total);
    }
  };

  await processWithConcurrency(media, concurrency, downloadMedia);

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, filename);
}
