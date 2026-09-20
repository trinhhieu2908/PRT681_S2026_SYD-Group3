import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/common/components/ui/button";
import { Spinner } from "@/common/components/ui/spinner";
import InterviewCard from "@/modules/interview/components/interview-card";
import { useUpcomingInterviews } from "@/modules/interview/hooks/useUpcomingInterviews";
import type { UpcomingInterviewResponse } from "@/modules/interview/model/responses";
import {
  formatInterviewDayHeading,
  getInterviewDateKey,
} from "@/modules/interview/utils/date";
import { routes } from "@/routes/routes";

const WINDOW_OPTIONS = [7, 14, 30] as const;
type InterviewWindow = (typeof WINDOW_OPTIONS)[number];

const AgendaSkeleton = () => (
  <div className="space-y-8" aria-label="Loading upcoming interviews">
    {Array.from({ length: 2 }).map((_, groupIndex) => (
      <div key={groupIndex}>
        <div className="h-5 w-52 animate-pulse rounded bg-gray-200" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 2 }).map((__, itemIndex) => (
            <div
              key={itemIndex}
              className="h-40 animate-pulse rounded-2xl border border-gray-200 bg-white"
            />
          ))}
        </div>
      </div>
    ))}
  </div>
);

const InterviewPage = () => {
  const [days, setDays] = useState<InterviewWindow>(7);
  const {
    data = [],
    isPending,
    isFetching,
    error,
    refetch,
  } = useUpcomingInterviews(days);

  const groups = useMemo(() => {
    return data.reduce<
      Array<{ key: string; interviews: UpcomingInterviewResponse[] }>
    >((result, interview) => {
      const key = getInterviewDateKey(interview.scheduledAtUtc);
      const currentGroup = result[result.length - 1];

      if (currentGroup?.key === key) {
        currentGroup.interviews.push(interview);
      } else {
        result.push({ key, interviews: [interview] });
      }

      return result;
    }, []);
  }, [data]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <section className="relative overflow-hidden rounded-[2rem] bg-gray-950 px-6 py-7 text-white shadow-[0_28px_70px_-38px_rgba(15,118,110,0.8)] sm:px-9 sm:py-9">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-primary-500/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-secondary-500/20 blur-3xl" />
          <div className="relative flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary-200">
                <Sparkles className="h-4 w-4" />
                Your conversation calendar
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:text-5xl">
                Walk into every interview ready.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-gray-300 sm:text-base">
                See every upcoming round, meeting link, and employer contact in
                one focused agenda.
              </p>
            </div>

            <div className="flex min-w-40 items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-gray-950">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold leading-none">
                  {isPending ? "—" : data.length}
                </p>
                <p className="mt-1 text-xs text-gray-300">
                  in the next {days} days
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-700">
                Upcoming agenda
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
                What’s ahead
              </h2>
            </div>

            <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
              {WINDOW_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setDays(option)}
                  className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                    days === option
                      ? "bg-gray-950 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-950"
                  }`}
                  aria-pressed={days === option}
                >
                  {option} days
                </button>
              ))}
            </div>
          </div>

          {isFetching && !isPending && (
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
              <Spinner size="sm" className="border-t-primary-600" />
              Refreshing your agenda
            </div>
          )}

          <div className="mt-6">
            {isPending ? (
              <AgendaSkeleton />
            ) : error ? (
              <div className="flex min-h-72 flex-col items-center justify-center rounded-[1.75rem] border border-rose-100 bg-gradient-to-br from-white to-rose-50/60 px-6 text-center shadow-sm">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
                  <RefreshCw className="h-6 w-6" />
                </div>
                <p className="mt-5 font-semibold text-gray-950">
                  Your interview agenda could not be loaded
                </p>
                <p className="mt-2 max-w-md text-sm leading-6 text-gray-600">
                  {error instanceof Error
                    ? error.message
                    : "Please try again in a moment."}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-5 rounded-full"
                  onClick={() => void refetch()}
                >
                  <RefreshCw />
                  Try again
                </Button>
              </div>
            ) : data.length === 0 ? (
              <div className="relative flex min-h-80 flex-col items-center justify-center overflow-hidden rounded-[1.75rem] border border-dashed border-primary-200 bg-gradient-to-br from-white via-primary-50/60 to-secondary-50/60 px-6 text-center">
                <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-primary-100/80 blur-3xl" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-950 text-white shadow-xl shadow-primary-900/15">
                  <CalendarDays className="h-7 w-7" />
                </div>
                <p className="relative mt-5 text-lg font-semibold text-gray-950">
                  Your next {days} days are clear
                </p>
                <p className="relative mt-2 max-w-md text-sm leading-6 text-gray-600">
                  Add an interview from its job application when a new round is
                  scheduled. It will appear here automatically.
                </p>
                <Button
                  asChild
                  type="button"
                  className="relative mt-6 rounded-full px-5"
                >
                  <Link to={routes.jobApplicationsPath}>
                    View job applications
                    <ArrowRight />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-9">
                {groups.map((group) => (
                  <section key={group.key}>
                    <div className="mb-4 flex items-center gap-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-primary-200 to-transparent" />
                      <h3 className="shrink-0 text-sm font-bold text-gray-800">
                        {formatInterviewDayHeading(
                          group.interviews[0].scheduledAtUtc,
                        )}
                      </h3>
                      <div className="h-px flex-1 bg-gradient-to-l from-primary-200 to-transparent" />
                    </div>
                    <div className="space-y-3">
                      {group.interviews.map((interview) => (
                        <InterviewCard
                          key={interview.id}
                          interview={interview}
                          showApplication
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default InterviewPage;
