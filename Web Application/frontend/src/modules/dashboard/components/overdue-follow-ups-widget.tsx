import { AlertTriangle, ArrowRight, Check, ClockAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/common/components/ui/button";
import { formatDate } from "@/common/utils/date";
import { useUpdateFollowUpCompletion } from "@/modules/follow-up/hooks/useUpdateFollowUpCompletion";
import type { PendingFollowUpResponse } from "@/modules/follow-up/model/responses";
import { getFollowUpTiming } from "@/modules/follow-up/utils/date";
import { routes } from "@/routes/routes";

interface OverdueFollowUpsWidgetProps {
  followUps: PendingFollowUpResponse[];
}

const OverdueFollowUpsWidget = ({ followUps }: OverdueFollowUpsWidgetProps) => {
  const { updateCompletion, updatingFollowUpId } =
    useUpdateFollowUpCompletion();

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-gray-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5 sm:p-6">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700 ring-1 ring-rose-100">
            <ClockAlert className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-700">
              Needs attention
            </p>
            <h2 className="mt-1 text-xl font-semibold text-gray-950">
              Overdue follow-ups
            </h2>
          </div>
        </div>
        <span className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 ring-1 ring-rose-100">
          {followUps.length}
        </span>
      </div>

      {followUps.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
            <Check className="h-6 w-6" />
          </div>
          <p className="mt-4 font-semibold text-gray-950">Nothing overdue</p>
          <p className="mt-1 max-w-sm text-sm leading-6 text-gray-500">
            You are caught up. Open actions that pass their due date will show
            here.
          </p>
        </div>
      ) : (
        <div className="max-h-[31rem] divide-y divide-gray-100 overflow-y-auto">
          {followUps.map((followUp) => {
            const timing = getFollowUpTiming(
              followUp.dueDate,
              followUp.isOverdue,
            );
            const isCompleting = updatingFollowUpId === followUp.id;

            return (
              <article
                key={followUp.id}
                className="group p-5 transition hover:bg-rose-50/30 sm:p-6"
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      updateCompletion({
                        jobApplicationId: followUp.jobApplicationId,
                        followUpId: followUp.id,
                        isCompleted: true,
                      })
                    }
                    disabled={isCompleting}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`Mark ${followUp.title} complete`}
                    title="Mark complete"
                  >
                    <Check className="h-4 w-4" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                        <AlertTriangle className="h-3 w-3" />
                        {timing.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        Due{" "}
                        {formatDate(`${followUp.dueDate}T00:00:00Z`, "long")}
                      </span>
                    </div>
                    <h3 className="mt-2 break-words font-semibold text-gray-950">
                      {followUp.title}
                    </h3>
                    <p className="mt-0.5 truncate text-sm text-gray-600">
                      {followUp.roleTitle} at {followUp.companyName}
                    </p>
                    {followUp.notes && (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                        {followUp.notes}
                      </p>
                    )}
                  </div>

                  <Link
                    to={routes.getJobApplicationDetailPath(
                      followUp.jobApplicationId,
                    )}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-400 transition group-hover:bg-white group-hover:text-primary-700 group-hover:shadow-sm"
                    aria-label={`View ${followUp.companyName} application`}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="border-t border-gray-100 p-4">
        <Button asChild variant="ghost" className="w-full">
          <Link to={routes.followUpsPath}>
            Open follow-up list
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default OverdueFollowUpsWidget;
