import { CalendarClock, Plus, RefreshCw } from "lucide-react";
import { useMemo } from "react";
import { useConfirmation } from "@/common/components/confirmation-modal/confirmation-modal-context";
import {
  MODAL_VIEWS,
  useModalAction,
} from "@/common/components/modal/modal-context";
import { Button } from "@/common/components/ui/button";
import InterviewCard from "@/modules/interview/components/interview-card";
import { useDeleteInterview } from "@/modules/interview/hooks/useDeleteInterview";
import { useInterviews } from "@/modules/interview/hooks/useInterviews";
import type { InterviewResponse } from "@/modules/interview/model/responses";

interface JobApplicationInterviewsProps {
  jobApplicationId: string;
}

const InterviewListSkeleton = () => (
  <div className="space-y-3" aria-label="Loading interviews">
    {Array.from({ length: 2 }).map((_, index) => (
      <div
        key={index}
        className="h-40 animate-pulse rounded-2xl border border-gray-200 bg-gray-50"
      />
    ))}
  </div>
);

const JobApplicationInterviews = ({
  jobApplicationId,
}: JobApplicationInterviewsProps) => {
  const { openModal } = useModalAction();
  const confirm = useConfirmation();
  const {
    data = [],
    isPending,
    error,
    refetch,
  } = useInterviews(jobApplicationId);
  const { deleteInterview, deletingInterviewId } =
    useDeleteInterview(jobApplicationId);

  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    const sorted = [...data].sort(
      (first, second) =>
        new Date(first.scheduledAtUtc).getTime() -
        new Date(second.scheduledAtUtc).getTime(),
    );

    return {
      upcoming: sorted.filter(
        (interview) => new Date(interview.scheduledAtUtc).getTime() >= now,
      ),
      past: sorted
        .filter(
          (interview) => new Date(interview.scheduledAtUtc).getTime() < now,
        )
        .reverse(),
    };
  }, [data]);

  const openCreateForm = () => {
    openModal(MODAL_VIEWS.CREATE_INTERVIEW, { jobApplicationId });
  };

  const openEditForm = (interview: InterviewResponse) => {
    openModal(MODAL_VIEWS.EDIT_INTERVIEW, {
      jobApplicationId,
      interview,
    });
  };

  const handleDelete = async (interview: InterviewResponse) => {
    const confirmed = await confirm({
      title: `Delete ${interview.title}?`,
      message:
        "This interview round will be permanently removed from the application.",
      confirmText: "Delete interview",
      cancelText: "Keep interview",
      variant: "destructive",
    });

    if (confirmed) {
      void deleteInterview(interview.id).catch(() => undefined);
    }
  };

  const renderInterview = (interview: InterviewResponse) => (
    <InterviewCard
      key={interview.id}
      interview={interview}
      onEdit={() => openEditForm(interview)}
      onDelete={() => void handleDelete(interview)}
      isDeleting={deletingInterviewId === interview.id}
    />
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-secondary-50/70 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-950">
              Interview journey
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Keep every round, contact, and meeting detail together.
            </p>
          </div>
        </div>
        <Button
          type="button"
          className="self-start rounded-full sm:self-auto"
          onClick={openCreateForm}
        >
          <Plus />
          Add interview
        </Button>
      </div>

      <div className="p-5 sm:p-6">
        {isPending ? (
          <InterviewListSkeleton />
        ) : error ? (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-rose-100 bg-rose-50/50 px-5 text-center">
            <p className="font-semibold text-gray-950">
              Interviews could not be loaded
            </p>
            <p className="mt-1 text-sm text-gray-600">
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
        ) : data.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-primary-200 bg-primary-50/30 px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary-700 shadow-sm ring-1 ring-primary-100">
              <CalendarClock className="h-6 w-6" />
            </div>
            <p className="mt-4 font-semibold text-gray-950">
              No interview rounds yet
            </p>
            <p className="mt-1 max-w-sm text-sm leading-6 text-gray-600">
              When the conversation starts, add each round here so nothing gets
              lost between invitations.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-5 rounded-full"
              onClick={openCreateForm}
            >
              <Plus />
              Schedule the first round
            </Button>
          </div>
        ) : (
          <div className="space-y-7">
            {upcoming.length > 0 && (
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-primary-700">
                    Coming up
                  </h3>
                  <span className="text-xs text-gray-500">
                    {upcoming.length} scheduled
                  </span>
                </div>
                <div className="space-y-3">{upcoming.map(renderInterview)}</div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                    Earlier rounds
                  </h3>
                  <span className="text-xs text-gray-500">
                    {past.length} recorded
                  </span>
                </div>
                <div className="space-y-3">{past.map(renderInterview)}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default JobApplicationInterviews;
