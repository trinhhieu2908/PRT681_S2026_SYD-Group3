import { ConfirmationProvider } from "@/common/components/confirmation-modal/confirmation-modal-context";
import { DrawerProvider, ManagedDrawer } from "@/common/components/drawer";
import ErrorBoundary from "@/common/components/error-boundary/error-boundary";
import Sidebar from "@/common/components/layout/sidebar";
import ManagedModal from "@/common/components/modal/manage-modal";
import { ModalProvider } from "@/common/components/modal/modal-context";
import ManagedSheet from "@/common/components/sheet/manage-sheet";
import { SheetProvider } from "@/common/components/sheet/sheet-context";
import PageLoadingScreen from "@/common/components/ui/page-loading-screen";
import { ReactNode, Suspense } from "react";
import { Outlet } from "react-router-dom";

interface DashboardLayoutProps {
  children?: ReactNode;
}

const Layout = ({ children }: DashboardLayoutProps) => {
  return (
    <ErrorBoundary>
      <ConfirmationProvider>
        <ModalProvider>
          <SheetProvider>
            <DrawerProvider>
              <div className="min-h-screen bg-gray-50">
                {/* Left Sidebar */}
                <Sidebar />

                {/* Main Content Area */}
                <div className="ml-64 flex flex-col min-h-screen">
                  <main className="flex-1">
                    <Suspense fallback={<PageLoadingScreen />}>
                      {children || <Outlet />}
                    </Suspense>
                  </main>
                </div>

                {/* Modal and Sheet Managers */}
                <ManagedModal />
                <ManagedSheet />
                <ManagedDrawer />
              </div>
            </DrawerProvider>
          </SheetProvider>
        </ModalProvider>
      </ConfirmationProvider>
    </ErrorBoundary>
  );
};

export default Layout;
