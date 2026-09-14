import {
  MODAL_VIEWS,
  useModalAction,
  useModalState,
} from "@/common/components/modal/modal-context";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Spinner } from "@/common/components/ui/spinner";
import { lazy, Suspense, useEffect } from "react";

const CreateJobApplicationForm = lazy(
  () =>
    import("@/modules/job-application/components/create-job-application-form"),
);
const DocumentPreviewModal = lazy(
  () => import("@/modules/document/components/document-preview-modal"),
);

const ManagedModal = () => {
  const { isOpen, view } = useModalState();
  const { toggleModal, resetModal } = useModalAction();

  useEffect(() => {
    if (!isOpen && !!view) {
      const timeoutId = window.setTimeout(() => {
        resetModal();
      }, 150);

      return () => window.clearTimeout(timeoutId);
    }
  }, [isOpen, resetModal, view]);

  const renderContent = () => {
    switch (view) {
      case MODAL_VIEWS.CREATE_JOB_APPLICATION:
        return (
          <Suspense fallback={null}>
            <CreateJobApplicationForm />
          </Suspense>
        );
      case MODAL_VIEWS.PREVIEW_DOCUMENT:
        return (
          <Suspense
            fallback={
              <DialogContent className="flex h-[94dvh] w-[calc(100vw-1rem)] max-w-7xl items-center justify-center bg-gray-100">
                <DialogTitle className="sr-only">Document preview</DialogTitle>
                <Spinner className="h-7 w-7 border-t-primary-600" />
              </DialogContent>
            }
          >
            <DocumentPreviewModal />
          </Suspense>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={toggleModal}>
      {renderContent()}
    </Dialog>
  );
};

export default ManagedModal;
