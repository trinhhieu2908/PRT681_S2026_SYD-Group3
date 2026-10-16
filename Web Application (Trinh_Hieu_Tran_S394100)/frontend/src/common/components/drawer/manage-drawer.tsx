import {
  useDrawerAction,
  useDrawerState,
} from "@/common/components/drawer/drawer-context";
import { Drawer } from "@/common/components/ui/drawer";
import { useEffect } from "react";

const ManagedDrawer = () => {
  const { isOpen, view } = useDrawerState();
  const { toggleDrawer, resetDrawer } = useDrawerAction();

  useEffect(() => {
    if (!isOpen && !!view) {
      setTimeout(() => {
        resetDrawer();
      }, 150);
    }
  }, [isOpen, resetDrawer, view]);

  return <Drawer open={isOpen} onOpenChange={toggleDrawer} />;
};

export default ManagedDrawer;
