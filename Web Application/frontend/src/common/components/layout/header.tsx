import { Menu, UserRound } from "lucide-react";
import { useAuth } from "@/modules/auth/contexts/auth.context";
import { routes } from "@/routes/routes";
import { useLocation } from "react-router-dom";

interface HeaderProps {
  onOpenSidebar: () => void;
}

const Header = ({ onOpenSidebar }: HeaderProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const pageTitle = location.pathname.startsWith(routes.jobApplicationsPath)
    ? "Job applications"
    : "Dashboard";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 hover:text-gray-950 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary-700">
            JobTrack
          </p>
          <p className="text-base font-semibold text-gray-950">{pageTitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-gray-900">
            {user?.email || "JobTrack user"}
          </p>
          <p className="text-xs text-gray-500">Signed in</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          <UserRound size={19} />
        </div>
      </div>
    </header>
  );
};

export default Header;
