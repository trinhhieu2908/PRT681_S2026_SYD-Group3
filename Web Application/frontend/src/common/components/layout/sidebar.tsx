import logo from "../../../../assets/logo.png";
import { useConfirmation } from "@/common/components/confirmation-modal/confirmation-modal-context";
import Navigation from "@/common/components/layout/navigation";
import { useAuth } from "@/modules/auth/contexts/auth.context";
import { routes } from "@/routes/routes";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const confirm = useConfirmation();

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: "Logout",
      message: "Are you sure you want to logout?",
      confirmText: "Logout",
      cancelText: "Cancel",
      variant: "error",
    });

    if (!confirmed) {
      return;
    }

    logout();
    navigate(routes.loginPath);
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col z-30">
      {/* Logo/Brand */}
      <div className="px-6 py-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <img src={logo} alt="JobTrack" className="h-10 w-10 object-contain" />
          <div>
            <p className="text-lg font-semibold text-gray-950">JobTrack</p>
            <p className="text-xs text-gray-500">Application manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <Navigation />

      {/* Logout Button */}
      <div className="border-t border-gray-200"></div>
      <div className="py-2 px-4 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-4 py-2 rounded-xl text-primary-500 font-medium hover:shadow-xl hover:bg-primary-500 hover:text-white transform hover:scale-[1.02] transition-all duration-300 ease-out group"
        >
          <LogOut
            size={20}
            className="group-hover:rotate-12 group-hover:text-white transition-transform duration-300 text-primary-500"
          />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
