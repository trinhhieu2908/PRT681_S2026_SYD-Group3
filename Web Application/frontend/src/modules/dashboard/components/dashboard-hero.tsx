import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  Check,
  ClockAlert,
  Plus,
  Radio,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/common/components/ui/button";
import { routes } from "@/routes/routes";

interface DashboardHeroProps {
  activeApplicationCount: number;
  upcomingInterviewCount: number;
  overdueFollowUpCount: number;
  onAddOpportunity: () => void;
}

const getSydneyGreeting = () => {
  const hour = Number(
    new Intl.DateTimeFormat("en-AU", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: "Australia/Sydney",
    }).format(new Date()),
  );

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const getSydneyDate = () =>
  new Intl.DateTimeFormat("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Australia/Sydney",
  }).format(new Date());

const DashboardHero = ({
  activeApplicationCount,
  upcomingInterviewCount,
  overdueFollowUpCount,
  onAddOpportunity,
}: DashboardHeroProps) => {
  return (
    <section className="relative isolate overflow-hidden py-5 sm:py-8 lg:min-h-[25rem] lg:py-10">
      <div className="pointer-events-none absolute inset-y-0 right-0 -z-20 w-3/5 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.11)_1.2px,transparent_1.2px)] [background-size:24px_24px] [mask-image:linear-gradient(to_left,black,transparent)]" />
      <div className="pointer-events-none absolute right-8 top-1/4 -z-10 h-64 w-64 rounded-full bg-primary-100/70 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/3 -z-10 h-44 w-44 rounded-full bg-secondary-100/70 blur-3xl" />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.8fr)] lg:items-center">
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-primary-700 shadow-sm">
              <Radio className="h-3.5 w-3.5" />
              Live workspace
            </span>
            <span className="text-sm font-medium text-gray-500">
              {getSydneyDate()}
            </span>
          </div>

          <p className="mt-7 text-sm font-semibold text-primary-700">
            {getSydneyGreeting()}
          </p>
          <h1 className="mt-2 max-w-3xl text-4xl font-semibold leading-[0.98] tracking-[-0.05em] text-gray-950 sm:text-5xl lg:text-6xl xl:text-7xl">
            Make the next move count.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
            Your applications, conversations, and next actions—focused into one
            clear view.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              type="button"
              className="h-12 rounded-full bg-gray-950 px-6 text-white shadow-xl shadow-gray-950/15 hover:bg-primary-700"
              onClick={onAddOpportunity}
            >
              <Plus />
              Add opportunity
            </Button>
            <Button
              asChild
              variant="ghost"
              className="h-12 rounded-full px-5 text-gray-700 hover:bg-white hover:text-gray-950 hover:shadow-sm"
            >
              <Link to={routes.jobApplicationsPath}>
                Explore applications
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative mx-auto h-[23rem] w-full max-w-[27rem] sm:h-[25rem]">
          <div className="absolute left-1/2 top-1/2 h-[19rem] w-[19rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-primary-300/80 sm:h-[22rem] sm:w-[22rem]" />
          <div className="absolute left-1/2 top-1/2 h-[14rem] w-[14rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-secondary-200/80 bg-white/40 backdrop-blur-sm sm:h-[16rem] sm:w-[16rem]" />

          <Link
            to={routes.jobApplicationsPath}
            className="group absolute left-1/2 top-1/2 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-gray-950 text-white shadow-[0_30px_70px_-25px_rgba(15,23,42,0.8)] transition hover:scale-[1.03] sm:h-44 sm:w-44"
          >
            <BriefcaseBusiness className="h-5 w-5 text-primary-300" />
            <span className="mt-2 text-5xl font-semibold tracking-[-0.06em]">
              {activeApplicationCount}
            </span>
            <span className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
              Active
            </span>
            <span className="mt-2 flex items-center gap-1 text-xs text-primary-200 opacity-0 transition group-hover:opacity-100">
              View all <ArrowRight className="h-3 w-3" />
            </span>
          </Link>

          <Link
            to={routes.interviewsPath}
            className="absolute right-0 top-2 w-40 rounded-2xl border border-violet-100 bg-white/95 p-4 shadow-[0_18px_45px_-22px_rgba(79,70,229,0.55)] backdrop-blur transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg sm:right-2 sm:top-4 sm:w-44"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                <CalendarClock className="h-4 w-4" />
              </div>
              <span className="text-2xl font-bold text-gray-950">
                {upcomingInterviewCount}
              </span>
            </div>
            <p className="mt-3 text-xs font-semibold text-gray-700">
              Interviews ahead
            </p>
            <p className="mt-0.5 text-[11px] text-gray-500">Next 7 days</p>
          </Link>

          <Link
            to={routes.followUpsPath}
            className={`absolute bottom-2 left-0 w-40 rounded-2xl border bg-white/95 p-4 backdrop-blur transition hover:-translate-y-1 hover:shadow-lg sm:bottom-4 sm:left-2 sm:w-44 ${
              overdueFollowUpCount > 0
                ? "border-rose-100 shadow-[0_18px_45px_-22px_rgba(225,29,72,0.5)] hover:border-rose-200"
                : "border-emerald-100 shadow-[0_18px_45px_-22px_rgba(5,150,105,0.45)] hover:border-emerald-200"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  overdueFollowUpCount > 0
                    ? "bg-rose-50 text-rose-700"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {overdueFollowUpCount > 0 ? (
                  <ClockAlert className="h-4 w-4" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </div>
              <span className="text-2xl font-bold text-gray-950">
                {overdueFollowUpCount}
              </span>
            </div>
            <p className="mt-3 text-xs font-semibold text-gray-700">
              {overdueFollowUpCount > 0 ? "Needs attention" : "All caught up"}
            </p>
            <p className="mt-0.5 text-[11px] text-gray-500">
              Overdue follow-ups
            </p>
          </Link>

          <div className="absolute left-3 top-16 h-3 w-3 rounded-full bg-primary-500 shadow-[0_0_0_7px_rgba(20,184,166,0.12)] sm:left-5 sm:top-20" />
          <div className="absolute bottom-16 right-8 h-2.5 w-2.5 rounded-full bg-secondary-500 shadow-[0_0_0_6px_rgba(99,102,241,0.12)] sm:bottom-20" />
        </div>
      </div>
    </section>
  );
};

export default DashboardHero;
