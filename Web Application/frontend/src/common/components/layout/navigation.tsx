import { routes } from "@/routes/routes";
import {
  BriefcaseBusiness,
  CalendarClock,
  LayoutDashboard,
  ListChecks,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface NavigationProps {
  onNavigate?: () => void;
}

const Navigation = ({ onNavigate }: NavigationProps) => {
  const location = useLocation();

  const navigationItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: routes.homePath,
      active: location.pathname === routes.homePath,
    },
    {
      name: "Job application",
      icon: BriefcaseBusiness,
      path: routes.jobApplicationsPath,
      active: location.pathname.startsWith(routes.jobApplicationsPath),
    },
    {
      name: "Interviews",
      icon: CalendarClock,
      path: routes.interviewsPath,
      active: location.pathname.startsWith(routes.interviewsPath),
    },
    {
      name: "Follow-ups",
      icon: ListChecks,
      path: routes.followUpsPath,
      active: location.pathname.startsWith(routes.followUpsPath),
    },
  ];

  return (
    <nav className="flex-1 px-4 py-6 space-y-2">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            to={item.path}
            onClick={onNavigate}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              item.active
                ? "bg-primary-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <div className="relative">
              <Icon size={22} />
            </div>
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default Navigation;
