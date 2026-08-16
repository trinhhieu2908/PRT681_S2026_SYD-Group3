import {
  useModalAction,
  useModalState,
} from "@/common/components/modal/modal-context";
import { Dialog } from "@/common/components/ui/dialog";
import { useEffect } from "react";

const ManagedModal = () => {
  const { isOpen, view } = useModalState();
  const { toggleModal, resetModal } = useModalAction();

  useEffect(() => {
    if (!isOpen && !!view) {
      setTimeout(() => {
        resetModal();
      }, 150);
    }
  }, [isOpen, resetModal, view]);

  return <Dialog open={isOpen} onOpenChange={toggleModal} />;
};

export default ManagedModal;
