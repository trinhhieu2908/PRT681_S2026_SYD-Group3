import { BellRing, CheckCheck, RefreshCw } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/common/components/ui/button";
import { Spinner } from "@/common/components/ui/spinner";
import FollowUpCard from "@/modules/follow-up/components/follow-up-card";
import { usePendingFollowUps } from "@/modules/follow-up/hooks/usePendingFollowUps";
import { useUpdateFollowUpCompletion } from "@/modules/follow-up/hooks/useUpdateFollowUpCompletion";
import {
  getFollowUpTiming,
  type FollowUpUrgency,
} from "@/modules/follow-up/utils/date";

const FOLLOW_UP_GROUPS: Array<{
  urgency: FollowUpUrgency;
  title: string;
  description: string;
  className: string;
}> = [
  {
    urgency: "overdue",
    title: "Overdue",
    description: "Past the due date and still open",
    className: "text-rose-700",
  },
  {
    urgency: "today",
    title: "Due today",
    description: "Actions to complete before the day ends",
    className: "text-amber-700",
  },
  {
    urgency: "upcoming",
    title: "Coming next",
    description: "Open actions ordered by due date",
    className: "text-primary-700",
  },
];

const FollowUpPage = () => {
  const {
    data: pendingFollowUps = [],
    isPending,
    isFetching,
    error,
    refetch,
  } = usePendingFollowUps();
  const { updateCompletion, updatingFollowUpId } =
    useUpdateFollowUpCompletion();

  const groups = useMemo(() => {
    return FOLLOW_UP_GROUPS.map((group) => ({
      ...group,
      items: pendingFollowUps.filter(
        (followUp) =>
          getFollowUpTiming(followUp.dueDate, followUp.isOverdue).urgency ===
          group.urgency,
      ),
    })).filter((group) => group.items.length > 0);
  }, [pendingFollowUps]);

  const overdueCount = groups.find((group) => group.urgency === "overdue")
    ?.items.length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-5 border-b border-gray-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-secondary-700">
              <BellRing className="h-4 w-4" />
              Needs attention
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-gray-950">
              Open follow-ups
            </h1>
            <p className="mt-2 text-sm leading-6 text-gray-600 sm:text-base">
              Keep recruiter check-ins, thank-you messages, and application
              actions moving on time.
            </p>
          </div>

          {!isPending && !error && (
            <div className="flex items-center gap-5 self-start sm:self-auto">
              <div>
                <p className="text-2xl font-semibold text-gray-950">
                  {pendingFollowUps.length}
                </p>
                <p className="text-xs font-medium text-gray-500">Open</p>
              </div>
              <div className="h-10 w-px bg-gray-200" />
              <div>
                <p className="text-2xl font-semibold text-rose-700">
                  {overdueCount ?? 0}
                </p>
                <p className="text-xs font-medium text-gray-500">Overdue</p>
              </div>
            </div>
          )}
        </header>

        {isFetching && !isPending && (
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
            <Spinner size="sm" className="border-t-primary-600" />
            Refreshing follow-ups
          </div>
        )}

        <div className="mt-7">
          {isPending ? (
            <div className="space-y-8" aria-label="Loading follow-ups">
              {Array.from({ length: 2 }).map((_, groupIndex) => (
                <section key={groupIndex}>
                  <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    {Array.from({ length: 2 }).map((__, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="h-40 animate-pulse rounded-2xl border border-gray-200 bg-white"
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : error ? (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-rose-100 bg-rose-50/50 px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                <RefreshCw className="h-5 w-5" />
              </div>
              <p className="mt-4 font-semibold text-gray-950">
                Follow-ups could not be loaded
              </p>
              <p className="mt-1 max-w-md text-sm text-gray-600">
                {error instanceof Error
                  ? error.message
                  : "Please try again in a moment."}
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-4 rounded-full"
                onClick={() => void refetch()}
              >
                <RefreshCw />
                Try again
              </Button>
            </div>
          ) : pendingFollowUps.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50/60 px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                <CheckCheck className="h-6 w-6" />
              </div>
              <p className="mt-4 text-lg font-semibold text-emerald-950">
                You're all caught up
              </p>
              <p className="mt-1 max-w-md text-sm leading-6 text-emerald-800">
                New follow-ups added to a job application will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-9">
              {groups.map((group) => (
                <section key={group.urgency}>
                  <div className="mb-4 flex items-end justify-between gap-4">
                    <div>
                      <h2
                        className={`text-sm font-bold uppercase tracking-[0.16em] ${group.className}`}
                      >
                        {group.title}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        {group.description}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600 ring-1 ring-gray-200">
                      {group.items.length}
                    </span>
                  </div>

                  <div className="grid items-start gap-3 lg:grid-cols-2">
                    {group.items.map((followUp) => (
                      <FollowUpCard
                        key={followUp.id}
                        followUp={followUp}
                        showApplication
                        onToggleCompletion={() =>
                          updateCompletion({
                            jobApplicationId: followUp.jobApplicationId,
                            followUpId: followUp.id,
                            isCompleted: true,
                          })
                        }
                        isBusy={updatingFollowUpId === followUp.id}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowUpPage;
