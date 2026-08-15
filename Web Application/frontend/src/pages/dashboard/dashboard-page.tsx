import {
  BriefcaseBusiness,
  CalendarClock,
  MailCheck,
  TrendingUp,
} from "lucide-react";

const summaryItems = [
  {
    label: "Applications",
    value: "-",
    icon: BriefcaseBusiness,
  },
  {
    label: "Interviews",
    value: "-",
    icon: CalendarClock,
  },
  {
    label: "Follow ups",
    value: "-",
    icon: MailCheck,
  },
  {
    label: "Success rate",
    value: "-",
    icon: TrendingUp,
  },
];

const DashboardPage = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <p className="text-sm font-medium text-primary-600">JobTrack</p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-950">Dashboard</h1>
        <p className="mt-3 max-w-2xl text-gray-600">
          Your job application workspace is ready. Feature pages can be added
          here as the backend modules are implemented.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">
                  {item.label}
                </p>
                <Icon className="h-5 w-5 text-primary-500" />
              </div>
              <p className="mt-4 text-3xl font-semibold text-gray-950">
                {item.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardPage;
