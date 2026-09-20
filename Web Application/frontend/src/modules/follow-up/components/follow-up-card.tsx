import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  Pencil,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/common/components/ui/button";
import { formatDate } from "@/common/utils/date";
import type { FollowUpCardData } from "@/modules/follow-up/model/responses";
import { getFollowUpTiming } from "@/modules/follow-up/utils/date";
import { routes } from "@/routes/routes";

interface FollowUpCardProps {
  followUp: FollowUpCardData;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleCompletion?: () => void;
  isBusy?: boolean;
  showApplication?: boolean;
}

const FollowUpCard = ({
  followUp,
  onEdit,
  onDelete,
  onToggleCompletion,
  isBusy = false,
  showApplication = false,
}: FollowUpCardProps) => {
  const isCompleted = "isCompleted" in followUp ? followUp.isCompleted : false;
  const application =
    "companyName" in followUp
      ? {
          companyName: followUp.companyName,
          roleTitle: followUp.roleTitle,
        }
      : null;
  const timing = getFollowUpTiming(followUp.dueDate, followUp.isOverdue);

  return (
    <article
      className={`rounded-2xl border p-4 transition sm:p-5 ${
        isCompleted
          ? "border-emerald-100 bg-emerald-50/40"
          : followUp.isOverdue
            ? "border-rose-200 bg-rose-50/40 shadow-sm"
            : "border-gray-200 bg-white shadow-sm hover:border-primary-200"
      }`}
    >
      <div className="flex items-start gap-3">
        {onToggleCompletion ? (
          <button
            type="button"
            onClick={onToggleCompletion}
            disabled={isBusy}
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 ${
              isCompleted
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-primary-50 hover:text-primary-700"
            }`}
            aria-label={
              isCompleted ? "Reopen follow-up" : "Mark follow-up done"
            }
            title={isCompleted ? "Reopen" : "Mark done"}
          >
            {isCompleted ? (
              <Check className="h-5 w-5" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </button>
        ) : (
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  className={`break-words font-semibold ${
                    isCompleted ? "text-gray-500 line-through" : "text-gray-950"
                  }`}
                >
                  {followUp.title}
                </h3>
                {followUp.isOverdue && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Overdue
                  </span>
                )}
                {isCompleted && (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                    Completed
                  </span>
                )}
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
                    disabled={isBusy}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50"
                    aria-label={`Edit ${followUp.title}`}
                    title="Edit follow-up"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={onDelete}
                    disabled={isBusy}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:opacity-50"
                    aria-label={`Delete ${followUp.title}`}
                    title="Delete follow-up"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <p
              className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                followUp.isOverdue ? "text-rose-700" : "text-gray-600"
              }`}
            >
              <CalendarDays className="h-4 w-4" />
              {formatDate(`${followUp.dueDate}T00:00:00Z`, "long")}
            </p>
            {!isCompleted && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  timing.urgency === "overdue"
                    ? "bg-rose-100 text-rose-700"
                    : timing.urgency === "today"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-gray-100 text-gray-600"
                }`}
              >
                {timing.label}
              </span>
            )}
          </div>

          {followUp.notes && (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-600">
              {followUp.notes}
            </p>
          )}

          {showApplication && (
            <Button asChild variant="ghost" size="sm" className="mt-3 -ml-3">
              <Link
                to={routes.getJobApplicationDetailPath(
                  followUp.jobApplicationId,
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

export default FollowUpCard;
