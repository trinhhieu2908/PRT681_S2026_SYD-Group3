import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  ExternalLink,
  Monitor,
  RefreshCw,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/common/components/ui/button";
import { formatDate } from "@/common/utils/date";
import JobApplicationStatusBadge from "@/modules/job-application/components/job-application-status-badge";
import { useJobApplication } from "@/modules/job-application/hooks/useJobApplication";
import { routes } from "@/routes/routes";

const DetailLoading = () => {
  return (
    <div className="mx-auto max-w-5xl animate-pulse">
      <div className="h-10 w-40 rounded-lg bg-gray-200" />
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        <div className="h-16 w-16 rounded-2xl bg-gray-200" />
        <div className="mt-6 h-5 w-32 rounded bg-gray-200" />
        <div className="mt-3 h-9 w-2/3 rounded bg-gray-200" />
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-24 rounded-xl bg-gray-100" />
          ))}
        </div>
      </div>
    </div>
  );
};

const JobApplicationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isPending, error, refetch } = useJobApplication(id);

  if (isPending) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <DetailLoading />
      </div>
    );
  }

  if (!id || error || !data) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <Button asChild variant="ghost" className="-ml-3">
            <Link to={routes.jobApplicationsPath}>
              <ArrowLeft />
              Back to applications
            </Link>
          </Button>
          <div className="mt-6 flex min-h-80 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 text-center shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              <BriefcaseBusiness size={26} />
            </div>
            <h1 className="mt-5 text-xl font-semibold text-gray-950">
              Application unavailable
            </h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-gray-600">
              {error instanceof Error
                ? error.message
                : "This job application could not be found."}
            </p>
            {id && (
              <Button
                type="button"
                variant="outline"
                className="mt-5"
                onClick={() => void refetch()}
              >
                <RefreshCw />
                Try again
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const companyInitial = data.companyName.trim().charAt(0).toUpperCase() || "J";
  const links = [
    {
      label: "Job listing",
      description: "Open the original role listing",
      href: data.jobLink,
    },
    {
      label: "Portfolio",
      description: "View the portfolio used for this application",
      href: data.portfolioLink,
    },
    {
      label: "GitHub",
      description: "View the related GitHub profile or repository",
      href: data.gitHubLink,
    },
  ].filter(
    (link): link is { label: string; description: string; href: string } =>
      Boolean(link.href),
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <Button asChild variant="ghost" className="-ml-3">
          <Link to={routes.jobApplicationsPath}>
            <ArrowLeft />
            Back to applications
          </Link>
        </Button>

        <section className="relative mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500" />
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 text-2xl font-bold text-primary-800 ring-1 ring-primary-200">
                {companyInitial}
              </div>
              <div>
                <p className="font-medium text-primary-700">
                  {data.companyName}
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-950 sm:text-3xl">
                  {data.roleTitle}
                </h1>
              </div>
            </div>
            <JobApplicationStatusBadge status={data.currentStatus} />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <Monitor className="h-5 w-5 text-primary-600" />
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                Platform
              </p>
              <p className="mt-1 font-semibold text-gray-900">
                {data.platform}
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <CalendarDays className="h-5 w-5 text-primary-600" />
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                Application date
              </p>
              <p className="mt-1 font-semibold text-gray-900">
                {formatDate(data.applicationDate, "long")}
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <Clock3 className="h-5 w-5 text-primary-600" />
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                Added
              </p>
              <p className="mt-1 font-semibold text-gray-900">
                {formatDate(data.createdAtUtc, "long")}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-950">
              Application links
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Resources saved with this opportunity.
            </p>

            {links.length > 0 ? (
              <div className="mt-5 grid gap-3">
                {links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4 transition hover:border-primary-200 hover:bg-primary-50/50"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {link.label}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {link.description}
                      </p>
                    </div>
                    <ExternalLink className="h-5 w-5 shrink-0 text-primary-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-gray-200 px-5 py-10 text-center text-sm text-gray-500">
                No links were added to this application.
              </div>
            )}
          </section>

          <aside className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Current stage
            </p>
            <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
              <BriefcaseBusiness size={22} />
            </div>
            <p className="mt-4 text-xl font-semibold text-gray-950">
              {data.currentStatus}
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              This is the latest status recorded for your application.
            </p>
            {data.updatedAtUtc && (
              <p className="mt-5 border-t border-gray-100 pt-4 text-xs text-gray-500">
                Last updated {formatDate(data.updatedAtUtc, "datetime")}
              </p>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationDetailPage;
