import { ArrowRight, CalendarDays, Monitor } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDate, parseApiDate } from "@/common/utils/date";
import JobApplicationStatusBadge from "@/modules/job-application/components/job-application-status-badge";
import {
  JobApplicationResponse,
  JobApplicationStatus,
} from "@/modules/job-application/model/responses";
import { routes } from "@/routes/routes";

interface JobApplicationCardProps {
  application: JobApplicationResponse;
}

interface StatusTheme {
  accent: string;
  glow: string;
  dot: string;
  message: string;
}

const statusThemes: Record<JobApplicationStatus, StatusTheme> = {
  Applied: {
    accent: "bg-sky-500",
    glow: "bg-sky-300/20",
    dot: "bg-sky-500",
    message: "Your journey has started",
  },
  Interview: {
    accent: "bg-violet-500",
    glow: "bg-violet-300/20",
    dot: "bg-violet-500",
    message: "A conversation is in motion",
  },
  Offer: {
    accent: "bg-emerald-500",
    glow: "bg-emerald-300/20",
    dot: "bg-emerald-500",
    message: "A new chapter is within reach",
  },
  Rejected: {
    accent: "bg-rose-500",
    glow: "bg-rose-300/20",
    dot: "bg-rose-500",
    message: "This path has closed",
  },
  Withdrawn: {
    accent: "bg-slate-500",
    glow: "bg-slate-300/20",
    dot: "bg-slate-500",
    message: "You chose a different path",
  },
  Archived: {
    accent: "bg-amber-500",
    glow: "bg-amber-300/20",
    dot: "bg-amber-500",
    message: "Tucked away for reference",
  },
};

const getDateParts = (date: string) => {
  try {
    const parsedDate = parseApiDate(date);

    return {
      day: parsedDate.toLocaleDateString("en-AU", {
        day: "2-digit",
        timeZone: "Australia/Sydney",
      }),
      month: parsedDate.toLocaleDateString("en-AU", {
        month: "short",
        timeZone: "Australia/Sydney",
      }),
      year: parsedDate.toLocaleDateString("en-AU", {
        year: "numeric",
        timeZone: "Australia/Sydney",
      }),
    };
  } catch {
    return { day: "--", month: "---", year: "----" };
  }
};

const JobApplicationCard = ({ application }: JobApplicationCardProps) => {
  const companyInitial =
    application.companyName.trim().charAt(0).toUpperCase() || "J";
  const theme = statusThemes[application.currentStatus];
  const date = getDateParts(application.applicationDate);

  return (
    <Link
      to={routes.getJobApplicationDetailPath(application.id)}
      className="group relative grid gap-3 rounded-[1.75rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-4 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:gap-5 sm:rounded-none"
      aria-label={`View ${application.roleTitle} at ${application.companyName}`}
    >
      <div className="relative z-10 hidden items-start justify-center sm:flex">
        <div className="flex h-20 w-20 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white text-center shadow-sm transition duration-300 group-hover:-translate-y-0.5 group-hover:border-primary-200 group-hover:shadow-md motion-reduce:transform-none">
          <span className="text-2xl font-bold leading-none text-gray-950">
            {date.day}
          </span>
          <span className="mt-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-primary-700">
            {date.month} {date.year}
          </span>
        </div>
      </div>

      <article className="relative min-w-0 overflow-hidden rounded-[1.75rem] border border-gray-200 bg-white shadow-[0_12px_32px_-24px_rgba(15,23,42,0.45)] transition duration-300 group-hover:-translate-y-0.5 group-hover:border-gray-300 group-hover:shadow-[0_24px_48px_-26px_rgba(15,118,110,0.35)] motion-reduce:transform-none">
        <div className={`absolute inset-y-0 left-0 w-1.5 ${theme.accent}`} />
        <div
          className={`pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full blur-3xl transition duration-500 group-hover:scale-125 ${theme.glow}`}
        />

        <div className="relative px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex items-start gap-4">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-950 text-xl font-bold text-white shadow-lg shadow-gray-950/10">
              <div className="absolute -right-3 -top-3 h-8 w-8 rounded-full bg-primary-500/40 blur-md" />
              <span className="relative">{companyInitial}</span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-primary-700">
                    {application.companyName}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold leading-7 tracking-tight text-gray-950 sm:text-2xl">
                    {application.roleTitle}
                  </h2>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <JobApplicationStatusBadge
                    status={application.currentStatus}
                  />
                  <span className="hidden h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition duration-300 group-hover:translate-x-1 group-hover:border-primary-200 group-hover:bg-primary-50 group-hover:text-primary-700 motion-reduce:transform-none sm:flex">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-gray-100 pt-4 text-sm text-gray-600">
                <span className="inline-flex min-w-0 items-center gap-2">
                  <Monitor className="h-4 w-4 shrink-0 text-gray-400" />
                  <span className="truncate">{application.platform}</span>
                </span>
                <span className="inline-flex items-center gap-2 sm:hidden">
                  <CalendarDays className="h-4 w-4 text-gray-400" />
                  {formatDate(application.applicationDate, "short")}
                </span>
                <span className="inline-flex items-center gap-2 text-gray-500">
                  <span
                    className={`h-2 w-2 rounded-full ${theme.dot}`}
                    aria-hidden="true"
                  />
                  {theme.message}
                </span>
                <span className="ml-auto inline-flex items-center gap-2 font-semibold text-primary-700 sm:hidden">
                  View details
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default JobApplicationCard;
