import { BellRing, Plus, RefreshCw } from "lucide-react";
import { useMemo } from "react";
import { useConfirmation } from "@/common/components/confirmation-modal/confirmation-modal-context";
import {
  MODAL_VIEWS,
  useModalAction,
} from "@/common/components/modal/modal-context";
import { Button } from "@/common/components/ui/button";
import FollowUpCard from "@/modules/follow-up/components/follow-up-card";
import { useDeleteFollowUp } from "@/modules/follow-up/hooks/useDeleteFollowUp";
import { useFollowUps } from "@/modules/follow-up/hooks/useFollowUps";
import { useUpdateFollowUpCompletion } from "@/modules/follow-up/hooks/useUpdateFollowUpCompletion";
import type { FollowUpResponse } from "@/modules/follow-up/model/responses";

interface JobApplicationFollowUpsProps {
  jobApplicationId: string;
}

const JobApplicationFollowUps = ({
  jobApplicationId,
}: JobApplicationFollowUpsProps) => {
  const { openModal } = useModalAction();
  const confirm = useConfirmation();
  const {
    data = [],
    isPending,
    error,
    refetch,
  } = useFollowUps(jobApplicationId);
  const { deleteFollowUp, deletingFollowUpId } =
    useDeleteFollowUp(jobApplicationId);
  const { updateCompletion, updatingFollowUpId } =
    useUpdateFollowUpCompletion();

  const { open, completed } = useMemo(() => {
    const byDueDate = (first: FollowUpResponse, second: FollowUpResponse) =>
      first.dueDate.localeCompare(second.dueDate);

    return {
      open: data.filter((item) => !item.isCompleted).sort(byDueDate),
      completed: data
        .filter((item) => item.isCompleted)
        .sort(byDueDate)
        .reverse(),
    };
  }, [data]);

  const openCreateForm = () => {
    openModal(MODAL_VIEWS.CREATE_FOLLOW_UP, { jobApplicationId });
  };

  const openEditForm = (followUp: FollowUpResponse) => {
    openModal(MODAL_VIEWS.EDIT_FOLLOW_UP, {
      jobApplicationId,
      followUp,
    });
  };

  const handleDelete = async (followUp: FollowUpResponse) => {
    const confirmed = await confirm({
      title: `Delete ${followUp.title}?`,
      message: "This follow-up will be permanently removed.",
      confirmText: "Delete follow-up",
      cancelText: "Keep follow-up",
      variant: "destructive",
    });

    if (confirmed) {
      void deleteFollowUp(followUp.id).catch(() => undefined);
    }
  };

  const renderFollowUp = (followUp: FollowUpResponse) => {
    const isBusy =
      deletingFollowUpId === followUp.id || updatingFollowUpId === followUp.id;

    return (
      <FollowUpCard
        key={followUp.id}
        followUp={followUp}
        onEdit={() => openEditForm(followUp)}
        onDelete={() => void handleDelete(followUp)}
        onToggleCompletion={() =>
          updateCompletion({
            jobApplicationId,
            followUpId: followUp.id,
            isCompleted: !followUp.isCompleted,
          })
        }
        isBusy={isBusy}
      />
    );
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-gray-100 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary-50 text-secondary-700 ring-1 ring-secondary-100">
            <BellRing className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-950">
              Follow-up actions
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Turn the next step into something you can finish.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          className="self-start rounded-full sm:self-auto"
          onClick={openCreateForm}
        >
          <Plus />
          Add follow-up
        </Button>
      </div>

      <div className="p-5 sm:p-6">
        {isPending ? (
          <div className="space-y-3" aria-label="Loading follow-ups">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-2xl border border-gray-200 bg-gray-50"
              />
            ))}
          </div>
        ) : error ? (
          <div className="flex min-h-44 flex-col items-center justify-center rounded-2xl border border-rose-100 bg-rose-50/50 px-5 text-center">
            <p className="font-semibold text-gray-950">
              Follow-ups could not be loaded
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
          <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/60 px-6 text-center">
            <BellRing className="h-7 w-7 text-primary-600" />
            <p className="mt-3 font-semibold text-gray-950">
              Nothing to follow up yet
            </p>
            <p className="mt-1 max-w-sm text-sm leading-6 text-gray-600">
              Add a reminder for the next email, call, or preparation task.
            </p>
          </div>
        ) : (
          <div className="space-y-7">
            {open.length > 0 && (
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-primary-700">
                    To do
                  </h3>
                  <span className="text-xs text-gray-500">
                    {open.length} open
                  </span>
                </div>
                <div className="space-y-3">{open.map(renderFollowUp)}</div>
              </div>
            )}

            {completed.length > 0 && (
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                    Done
                  </h3>
                  <span className="text-xs text-gray-500">
                    {completed.length} completed
                  </span>
                </div>
                <div className="space-y-3">{completed.map(renderFollowUp)}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default JobApplicationFollowUps;
