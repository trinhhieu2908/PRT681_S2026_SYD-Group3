import { ConfirmationProvider } from "@/common/components/confirmation-modal/confirmation-modal-context";
import { DrawerProvider, ManagedDrawer } from "@/common/components/drawer";
import ErrorBoundary from "@/common/components/error-boundary/error-boundary";
import Header from "@/common/components/layout/header";
import Sidebar from "@/common/components/layout/sidebar";
import ManagedModal from "@/common/components/modal/manage-modal";
import { ModalProvider } from "@/common/components/modal/modal-context";
import ManagedSheet from "@/common/components/sheet/manage-sheet";
import { SheetProvider } from "@/common/components/sheet/sheet-context";
import PageLoadingScreen from "@/common/components/ui/page-loading-screen";
import { ReactNode, Suspense, useState } from "react";
import { Outlet } from "react-router-dom";

interface DashboardLayoutProps {
  children?: ReactNode;
}

const Layout = ({ children }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ErrorBoundary>
      <ConfirmationProvider>
        <ModalProvider>
          <SheetProvider>
            <DrawerProvider>
              <div className="min-h-screen bg-gray-50">
                <Sidebar
                  isOpen={isSidebarOpen}
                  onClose={() => setIsSidebarOpen(false)}
                />

                {isSidebarOpen && (
                  <button
                    type="button"
                    className="fixed inset-0 z-30 bg-gray-950/40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                    aria-label="Close navigation menu"
                  />
                )}

                <div className="flex min-h-screen flex-col lg:ml-64">
                  <Header onOpenSidebar={() => setIsSidebarOpen(true)} />
                  <main className="flex-1">
                    <Suspense fallback={<PageLoadingScreen />}>
                      {children || <Outlet />}
                    </Suspense>
                  </main>
                </div>

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
