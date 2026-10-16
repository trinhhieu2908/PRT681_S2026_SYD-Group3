import {
  ArrowRight,
  CalendarClock,
  ExternalLink,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Trash2,
  UserRound,
  Video,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/common/components/ui/button";
import { formatDate } from "@/common/utils/date";
import type { InterviewCardData } from "@/modules/interview/model/responses";
import { formatInterviewTiming } from "@/modules/interview/utils/date";
import { routes } from "@/routes/routes";

interface InterviewCardProps {
  interview: InterviewCardData;
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
  showApplication?: boolean;
}

const InterviewCard = ({
  interview,
  onEdit,
  onDelete,
  isDeleting = false,
  showApplication = false,
}: InterviewCardProps) => {
  const application =
    "companyName" in interview
      ? {
          companyName: interview.companyName,
          roleTitle: interview.roleTitle,
        }
      : null;
  const isPast = new Date(interview.scheduledAtUtc).getTime() < Date.now();

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        isPast ? "border-gray-200 opacity-80" : "border-primary-100"
      }`}
    >
      {!isPast && (
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary-500 to-secondary-500" />
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex shrink-0 items-center gap-3 sm:block sm:w-20 sm:text-center">
          <div className="rounded-xl bg-primary-50 px-3 py-2 text-primary-800 ring-1 ring-primary-100">
            <p className="text-xs font-bold uppercase tracking-[0.12em]">
              {new Date(interview.scheduledAtUtc).toLocaleDateString("en-AU", {
                month: "short",
                timeZone: "Australia/Sydney",
              })}
            </p>
            <p className="text-2xl font-bold leading-tight">
              {new Date(interview.scheduledAtUtc).toLocaleDateString("en-AU", {
                day: "numeric",
                timeZone: "Australia/Sydney",
              })}
            </p>
          </div>
          <p className="text-xs font-semibold text-primary-700 sm:mt-2">
            {formatInterviewTiming(interview.scheduledAtUtc)}
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="break-words text-lg font-semibold text-gray-950">
                  {interview.title}
                </h3>
                <span className="rounded-full bg-secondary-50 px-2.5 py-1 text-xs font-semibold text-secondary-700 ring-1 ring-inset ring-secondary-100">
                  {interview.interviewType}
                </span>
              </div>
              {showApplication && application && (
                <p className="mt-1 text-sm font-medium text-gray-600">
                  {application.roleTitle} at {application.companyName}
                </p>
              )}
            </div>

            {(onEdit || onDelete) && (
              <div className="flex shrink-0 gap-1">
                {onEdit && (
                  <button
                    type="button"
                    onClick={onEdit}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    aria-label={`Edit ${interview.title}`}
                    title="Edit interview"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={onDelete}
                    disabled={isDeleting}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`Delete ${interview.title}`}
                    title="Delete interview"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1.5 font-medium text-gray-800">
              <CalendarClock className="h-4 w-4 text-primary-600" />
              {formatDate(interview.scheduledAtUtc, "datetime-short")}
            </span>
            {interview.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary-600" />
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
                <Video className="h-4 w-4" />
                Join meeting
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          {(interview.contactName ||
            interview.contactEmail ||
            interview.contactPhone) && (
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
              {interview.contactName && (
                <span className="inline-flex items-center gap-1.5">
                  <UserRound className="h-3.5 w-3.5" />
                  {interview.contactName}
                </span>
              )}
              {interview.contactEmail && (
                <a
                  href={`mailto:${interview.contactEmail}`}
                  className="inline-flex items-center gap-1.5 hover:text-primary-700 hover:underline"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {interview.contactEmail}
                </a>
              )}
              {interview.contactPhone && (
                <a
                  href={`tel:${interview.contactPhone}`}
                  className="inline-flex items-center gap-1.5 hover:text-primary-700 hover:underline"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {interview.contactPhone}
                </a>
              )}
            </div>
          )}

          {interview.notes && (
            <p className="mt-4 whitespace-pre-wrap rounded-xl bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-600">
              {interview.notes}
            </p>
          )}

          {showApplication && (
            <Button asChild variant="ghost" size="sm" className="mt-3 -ml-3">
              <Link
                to={routes.getJobApplicationDetailPath(
                  interview.jobApplicationId,
                )}
              >
                View application
                <ArrowRight />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
};

export default InterviewCard;
