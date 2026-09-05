import {
  MODAL_VIEWS,
  useModalAction,
  useModalState,
} from "@/common/components/modal/modal-context";
import { Dialog } from "@/common/components/ui/dialog";
import { lazy, Suspense, useEffect } from "react";

const CreateJobApplicationForm = lazy(
  () =>
    import("@/modules/job-application/components/create-job-application-form"),
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
