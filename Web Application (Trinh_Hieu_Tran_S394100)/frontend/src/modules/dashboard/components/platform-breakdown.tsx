import { BarChart3 } from "lucide-react";
import type { DashboardPlatformCountResponse } from "@/modules/dashboard/model/responses";

interface PlatformBreakdownProps {
  platforms: DashboardPlatformCountResponse[];
}

const PlatformBreakdown = ({ platforms }: PlatformBreakdownProps) => {
  const maximumCount = Math.max(...platforms.map((item) => item.count), 1);

  return (
    <section className="rounded-[1.75rem] border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary-50 text-secondary-700 ring-1 ring-secondary-100">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary-700">
            Sources
          </p>
          <h2 className="mt-1 text-xl font-semibold text-gray-950">
            Applications by platform
          </h2>
        </div>
      </div>

      {platforms.length === 0 ? (
        <div className="mt-6 flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/70 px-5 text-center">
          <BarChart3 className="h-7 w-7 text-gray-400" />
          <p className="mt-3 font-semibold text-gray-900">
            No platform data yet
          </p>
          <p className="mt-1 text-sm leading-6 text-gray-500">
            Platforms appear here after you add an application.
          </p>
        </div>
      ) : (
        <div className="mt-6 max-h-[22rem] space-y-5 overflow-y-auto pr-1">
          {platforms.map((item, index) => (
            <div key={item.platform}>
              <div className="flex items-center justify-between gap-4 text-sm">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-500">
                    {index + 1}
                  </span>
                  <span className="truncate font-semibold text-gray-800">
                    {item.platform}
                  </span>
                </div>
                <span className="shrink-0 font-bold text-gray-950">
                  {item.count}
                </span>
              </div>
              <div className="ml-9 mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-secondary-500 to-primary-500"
                  style={{ width: `${(item.count / maximumCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default PlatformBreakdown;
