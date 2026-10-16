import { ExternalLink, FileText, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  useModalAction,
  useModalState,
} from "@/common/components/modal/modal-context";
import { Button } from "@/common/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Spinner } from "@/common/components/ui/spinner";
import { useDocumentPreview } from "@/modules/document/hooks/useDocumentPreview";
import { isDocumentPreviewPayload } from "@/modules/document/model/document-preview";

const OFFICE_VIEWER_URL = "https://view.officeapps.live.com/op/embed.aspx?src=";

const getExtension = (fileName: string) => {
  const lastDotIndex = fileName.lastIndexOf(".");
  return lastDotIndex >= 0
    ? fileName.slice(lastDotIndex + 1).toLowerCase()
    : "file";
};

const DocumentPreviewModal = () => {
  const { data: modalData } = useModalState();
  const { closeModal } = useModalAction();
  const payload = isDocumentPreviewPayload(modalData) ? modalData : null;
  const {
    data: document,
    isPending,
    isFetching,
    error,
    refetch,
  } = useDocumentPreview(payload?.jobApplicationId, payload?.documentKind);
  const [isFrameLoading, setIsFrameLoading] = useState(true);
  const [frameFailed, setFrameFailed] = useState(false);

  const isPdf = Boolean(
    document &&
      (document.contentType.toLowerCase() === "application/pdf" ||
        getExtension(document.fileName) === "pdf"),
  );
  const previewUrl = useMemo(() => {
    if (!document) {
      return "";
    }

    return isPdf
      ? `${document.presignUrl}#view=FitH`
      : `${OFFICE_VIEWER_URL}${encodeURIComponent(document.presignUrl)}`;
  }, [document, isPdf]);

  useEffect(() => {
    setIsFrameLoading(true);
    setFrameFailed(false);
  }, [previewUrl]);

  const documentLabel =
    payload?.documentKind === "cover-letter" ? "Cover letter" : "Resume";
  const isLoading = Boolean(payload) && (isPending || isFetching);

  return (
    <DialogContent className="flex h-[94dvh] w-[calc(100vw-1rem)] max-w-7xl flex-col gap-0 overflow-hidden border-gray-200 bg-gray-100 p-0 shadow-2xl sm:rounded-2xl">
      <DialogHeader className="shrink-0 border-b border-gray-200 bg-white px-5 py-4 pr-14 text-left sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <DialogDescription className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-700">
                {documentLabel} preview
              </DialogDescription>
              <DialogTitle className="mt-1 truncate text-base text-gray-950 sm:text-lg">
                {document?.fileName ?? `Current ${documentLabel.toLowerCase()}`}
              </DialogTitle>
            </div>
          </div>

          {document && !isLoading && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="mr-0 w-fit shrink-0 bg-white sm:mr-1"
            >
              <a href={document.presignUrl} target="_blank" rel="noreferrer">
                Open original
                <ExternalLink />
              </a>
            </Button>
          )}
        </div>
      </DialogHeader>

      <div className="relative min-h-0 flex-1 overflow-hidden bg-gray-200">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-100 text-center">
            <Spinner className="h-7 w-7 border-t-primary-600" />
            <p className="mt-4 text-sm font-medium text-gray-700">
              Preparing document preview...
            </p>
          </div>
        )}

        {!isLoading && (error || !payload || !document) && (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-950">
              Preview unavailable
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-gray-600">
              {error instanceof Error
                ? error.message
                : "The selected document could not be loaded."}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {payload && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void refetch()}
                >
                  <RefreshCw />
                  Try again
                </Button>
              )}
              <Button type="button" onClick={closeModal}>
                Close
              </Button>
            </div>
          </div>
        )}

        {!isLoading && document && !error && (
          <>
            {isFrameLoading && !frameFailed && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-100 text-center">
                <Spinner className="h-7 w-7 border-t-primary-600" />
                <p className="mt-4 text-sm font-medium text-gray-700">
                  Loading {getExtension(document.fileName).toUpperCase()}{" "}
                  file...
                </p>
              </div>
            )}

            {frameFailed ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <h3 className="text-lg font-semibold text-gray-950">
                  The preview could not be displayed
                </h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-gray-600">
                  You can still open the original file in a new tab.
                </p>
                <Button asChild className="mt-5">
                  <a
                    href={document.presignUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open original
                    <ExternalLink />
                  </a>
                </Button>
              </div>
            ) : (
              <iframe
                key={previewUrl}
                src={previewUrl}
                title={`${documentLabel} preview: ${document.fileName}`}
                className="h-full w-full border-0 bg-white"
                onLoad={() => setIsFrameLoading(false)}
                onError={() => {
                  setIsFrameLoading(false);
                  setFrameFailed(true);
                }}
                allowFullScreen
              />
            )}
          </>
        )}
      </div>

      {!isLoading && document && !error && !isPdf && (
        <p className="shrink-0 border-t border-gray-200 bg-white px-5 py-2 text-center text-xs text-gray-500">
          Word documents are displayed through Microsoft Office Viewer.
        </p>
      )}
    </DialogContent>
  );
};

export default DocumentPreviewModal;
