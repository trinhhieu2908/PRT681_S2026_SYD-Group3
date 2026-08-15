import { ConfirmationData } from "@/common/components/confirmation-modal/confirmation-modal-context";
import { Button } from "@/common/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import React from "react";

const ConfirmationModal: React.FC<{
  data: ConfirmationData;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ data, onConfirm, onCancel }) => {
  const {
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default",
  } = data;

  const getVariantStyles = () => {
    switch (variant) {
      case "destructive":
        return {
          icon: "⚠️",
          confirmButton: "bg-red-600 hover:bg-red-700 text-white",
          iconColor: "text-red-600",
        };
      case "warning":
        return {
          icon: "⚠️",
          confirmButton: "bg-yellow-600 hover:bg-yellow-700 text-white",
          iconColor: "text-yellow-600",
        };
      case "success":
        return {
          icon: "✅",
          confirmButton: "bg-green-600 hover:bg-green-700 text-white",
          iconColor: "text-green-600",
        };
      case "error":
        return {
          icon: "❌",
          confirmButton: "bg-red-600 hover:bg-red-700 text-white",
          iconColor: "text-red-600",
        };
      default:
        return {
          icon: "❓",
          confirmButton: "bg-blue-600 hover:bg-blue-700 text-white",
          iconColor: "text-blue-600",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className={`text-xl ${styles.iconColor}`}>{styles.icon}</span>
            {title}
          </DialogTitle>
          <DialogDescription className="text-left">{message}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 sm:flex-none"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className={`flex-1 sm:flex-none ${styles.confirmButton}`}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;
