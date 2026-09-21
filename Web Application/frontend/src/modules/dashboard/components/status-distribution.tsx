import { ArrowRight, Layers3 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/common/components/ui/button";
import type { DashboardStatusCountResponse } from "@/modules/dashboard/model/responses";
import type { JobApplicationStatus } from "@/modules/job-application/model/responses";
import { routes } from "@/routes/routes";

type ActiveStatus = Exclude<JobApplicationStatus, "Archived">;

const STATUS_CONFIG: Array<{
  status: ActiveStatus;
  color: string;
  paleColor: string;
  textColor: string;
  description: string;
}> = [
  {
    status: "Applied",
    color: "bg-sky-500",
    paleColor: "bg-sky-50 ring-sky-100",
    textColor: "text-sky-700",
    description: "Awaiting a response",
  },
  {
    status: "Interview",
    color: "bg-violet-500",
    paleColor: "bg-violet-50 ring-violet-100",
    textColor: "text-violet-700",
    description: "In conversation",
  },
  {
    status: "Offer",
    color: "bg-emerald-500",
    paleColor: "bg-emerald-50 ring-emerald-100",
    textColor: "text-emerald-700",
    description: "Offers received",
  },
  {
    status: "Rejected",
    color: "bg-rose-500",
    paleColor: "bg-rose-50 ring-rose-100",
    textColor: "text-rose-700",
    description: "Closed by employer",
  },
  {
    status: "Withdrawn",
    color: "bg-slate-500",
    paleColor: "bg-slate-100 ring-slate-200",
    textColor: "text-slate-700",
    description: "Closed by you",
  },
];

interface StatusDistributionProps {
  total: number;
  counts: DashboardStatusCountResponse[];
}

const StatusDistribution = ({ total, counts }: StatusDistributionProps) => {
  const countByStatus = new Map(
    counts.map((item) => [item.status, item.count]),
  );

  return (
    <section className="rounded-[1.75rem] border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700 ring-1 ring-primary-100">
            <Layers3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-700">
              Pipeline
            </p>
            <h2 className="mt-1 text-xl font-semibold text-gray-950">
              Applications by status
            </h2>
          </div>
        </div>
        <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
          <Link to={routes.jobApplicationsPath}>
            View all
            <ArrowRight />
          </Link>
        </Button>
      </div>

      <div className="mt-6 flex h-3 overflow-hidden rounded-full bg-gray-100">
        {total > 0 &&
          STATUS_CONFIG.map((item) => {
            const count = countByStatus.get(item.status) ?? 0;
            if (count === 0) return null;

            return (
              <div
                key={item.status}
                className={`${item.color} transition-[width] duration-500`}
                style={{ width: `${(count / total) * 100}%` }}
                title={`${item.status}: ${count}`}
              />
            );
          })}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {STATUS_CONFIG.map((item) => {
          const count = countByStatus.get(item.status) ?? 0;
          return (
            <div
              key={item.status}
              className={`rounded-2xl p-4 ring-1 ring-inset ${item.paleColor}`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className={`text-sm font-semibold ${item.textColor}`}>
                  {item.status}
                </span>
                <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight text-gray-950">
                {count}
              </p>
              <p className="mt-1 text-xs leading-5 text-gray-500">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>

      <Button asChild variant="outline" className="mt-5 w-full sm:hidden">
        <Link to={routes.jobApplicationsPath}>
          View all applications
          <ArrowRight />
        </Link>
      </Button>
    </section>
  );
};

export default StatusDistribution;
