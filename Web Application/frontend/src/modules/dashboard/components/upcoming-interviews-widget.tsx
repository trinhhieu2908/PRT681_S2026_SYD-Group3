import {
  ArrowRight,
  CalendarClock,
  ExternalLink,
  MapPin,
  Video,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/common/components/ui/button";
import { formatDate } from "@/common/utils/date";
import type { UpcomingInterviewResponse } from "@/modules/interview/model/responses";
import { formatInterviewTiming } from "@/modules/interview/utils/date";
import { routes } from "@/routes/routes";

interface UpcomingInterviewsWidgetProps {
  interviews: UpcomingInterviewResponse[];
}

const UpcomingInterviewsWidget = ({
  interviews,
}: UpcomingInterviewsWidgetProps) => {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-gray-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5 sm:p-6">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700 ring-1 ring-violet-100">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">
              Next 7 days
            </p>
            <h2 className="mt-1 text-xl font-semibold text-gray-950">
              Upcoming interviews
            </h2>
          </div>
        </div>
        <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 ring-1 ring-violet-100">
          {interviews.length}
        </span>
      </div>

      {interviews.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
            <CalendarClock className="h-6 w-6" />
          </div>
          <p className="mt-4 font-semibold text-gray-950">
            No interviews in the next 7 days
          </p>
          <p className="mt-1 max-w-sm text-sm leading-6 text-gray-500">
            New interview rounds will appear here as soon as they are added.
          </p>
        </div>
      ) : (
        <div className="max-h-[31rem] divide-y divide-gray-100 overflow-y-auto">
          {interviews.map((interview) => (
            <article
              key={interview.id}
              className="group p-5 transition hover:bg-violet-50/30 sm:p-6"
            >
              <div className="flex gap-4">
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-gray-950 text-white shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary-200">
                    {new Date(interview.scheduledAtUtc).toLocaleDateString(
                      "en-AU",
                      {
                        month: "short",
                        timeZone: "Australia/Sydney",
                      },
                    )}
                  </span>
                  <span className="text-xl font-bold leading-none">
                    {new Date(interview.scheduledAtUtc).toLocaleDateString(
                      "en-AU",
                      {
                        day: "numeric",
                        timeZone: "Australia/Sydney",
                      },
                    )}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-bold text-violet-700 ring-1 ring-violet-100">
                      {formatInterviewTiming(interview.scheduledAtUtc)}
                    </span>
                    <span className="text-xs font-medium text-gray-500">
                      {formatDate(interview.scheduledAtUtc, "time")}
                    </span>
                  </div>
                  <h3 className="mt-2 truncate font-semibold text-gray-950">
                    {interview.title}
                  </h3>
                  <p className="mt-0.5 truncate text-sm text-gray-600">
                    {interview.roleTitle} at {interview.companyName}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                    {interview.location && (
                      <span className="inline-flex items-center gap-1.5 text-gray-500">
                        <MapPin className="h-3.5 w-3.5" />
                        {interview.location}
                      </span>
                    )}
                    {interview.meetingLink && (
                      <a
                        href={interview.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 font-semibold text-primary-700 hover:underline"
                      >
                        <Video className="h-3.5 w-3.5" />
                        Join meeting
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>

                <Link
                  to={routes.getJobApplicationDetailPath(
                    interview.jobApplicationId,
                  )}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-400 transition group-hover:bg-white group-hover:text-primary-700 group-hover:shadow-sm"
                  aria-label={`View ${interview.companyName} application`}
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="border-t border-gray-100 p-4">
        <Button asChild variant="ghost" className="w-full">
          <Link to={routes.interviewsPath}>
            Open interview agenda
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default UpcomingInterviewsWidget;
