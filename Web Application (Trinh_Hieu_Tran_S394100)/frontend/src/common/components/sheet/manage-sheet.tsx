import {
  useSheetAction,
  useSheetState,
} from "@/common/components/sheet/sheet-context";
import { Sheet } from "@/common/components/ui/sheet";
import { useEffect } from "react";

const ManagedSheet = () => {
  const { isOpen, view } = useSheetState();
  const { toggleSheet, resetSheet } = useSheetAction();

  useEffect(() => {
    if (!isOpen && !!view) {
      setTimeout(() => {
        resetSheet();
      }, 150);
    }
  }, [isOpen, resetSheet, view]);

  return <Sheet open={isOpen} onOpenChange={toggleSheet} />;
};

export default ManagedSheet;
