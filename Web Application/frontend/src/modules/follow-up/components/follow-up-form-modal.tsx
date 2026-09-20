import { zodResolver } from "@hookform/resolvers/zod";
import { BellRing, CalendarDays } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  useModalAction,
  useModalState,
} from "@/common/components/modal/modal-context";
import { Button } from "@/common/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Input } from "@/common/components/ui/input";
import { Spinner } from "@/common/components/ui/spinner";
import { Textarea } from "@/common/components/ui/textarea";
import { useCreateFollowUp } from "@/modules/follow-up/hooks/useCreateFollowUp";
import { useUpdateFollowUp } from "@/modules/follow-up/hooks/useUpdateFollowUp";
import { isFollowUpModalPayload } from "@/modules/follow-up/model/follow-up-modal";
import type {
  CreateFollowUpRequest,
  UpdateFollowUpRequest,
} from "@/modules/follow-up/model/requests";
import {
  FOLLOW_UP_FIELD_LIMITS,
  followUpFormSchema,
  getTodayUtcDate,
  type FollowUpFormValues,
} from "@/modules/follow-up/model/schemas";

const FollowUpFormModal = () => {
  const { data } = useModalState();
  const { closeModal } = useModalAction();
  const payload = isFollowUpModalPayload(data) ? data : null;
  const followUp = payload?.followUp;
  const isEditing = Boolean(followUp);
  const {
    createFollowUp,
    isCreating,
    error: createError,
  } = useCreateFollowUp(payload?.jobApplicationId ?? "", {
    onSuccess: closeModal,
  });
  const {
    updateFollowUp,
    isUpdating,
    error: updateError,
  } = useUpdateFollowUp(payload?.jobApplicationId ?? "", followUp?.id ?? "", {
    onSuccess: closeModal,
  });
  const {
    register,
    handleSubmit,
    formState: { dirtyFields, errors, isDirty },
  } = useForm<FollowUpFormValues>({
    resolver: zodResolver(followUpFormSchema),
    defaultValues: {
      title: followUp?.title ?? "",
      dueDate: followUp?.dueDate ?? getTodayUtcDate(),
      notes: followUp?.notes ?? "",
    },
  });

  if (!payload) {
    return (
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Follow-up unavailable</DialogTitle>
          <DialogDescription>
            The follow-up form could not be opened. Close this window and try
            again.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    );
  }

  const isSaving = isCreating || isUpdating;
  const requestError = isEditing ? updateError : createError;

  const onSubmit = (values: FollowUpFormValues) => {
    if (isEditing) {
      const request: UpdateFollowUpRequest = {};
      if (dirtyFields.title) request.title = values.title;
      if (dirtyFields.dueDate) request.dueDate = values.dueDate;
      if (dirtyFields.notes) request.notes = values.notes;
      updateFollowUp(request);
      return;
    }

    const request: CreateFollowUpRequest = {
      title: values.title,
      dueDate: values.dueDate,
      notes: values.notes || null,
    };
    createFollowUp(request);
  };

  return (
    <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-xl">
      <DialogHeader>
        <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary-50 text-secondary-700 ring-1 ring-secondary-100">
          <BellRing className="h-5 w-5" />
        </div>
        <DialogTitle>
          {isEditing ? "Edit follow-up" : "Add follow-up"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Adjust what needs to happen next or move its due date."
            : "Set the next action for this application so it stays visible."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div className="space-y-1.5">
          <label htmlFor="follow-up-title" className="text-sm font-medium">
            Next action
          </label>
          <Input
            id="follow-up-title"
            {...register("title")}
            maxLength={FOLLOW_UP_FIELD_LIMITS.title}
            placeholder="e.g. Send thank-you email"
            disabled={isSaving}
            autoFocus
          />
          {errors.title?.message && (
            <p role="alert" className="text-xs font-medium text-rose-600">
              {errors.title.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="follow-up-due-date" className="text-sm font-medium">
            Due date
          </label>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="follow-up-due-date"
              type="date"
              {...register("dueDate")}
              min={isEditing ? undefined : getTodayUtcDate()}
              disabled={isSaving}
              className="pl-9"
            />
          </div>
          {errors.dueDate?.message && (
            <p role="alert" className="text-xs font-medium text-rose-600">
              {errors.dueDate.message}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Choose today or a future date.
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="follow-up-notes" className="text-sm font-medium">
            Notes <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <Textarea
            id="follow-up-notes"
            {...register("notes")}
            maxLength={FOLLOW_UP_FIELD_LIMITS.notes}
            placeholder="What should you mention or prepare?"
            disabled={isSaving}
          />
          {errors.notes?.message && (
            <p role="alert" className="text-xs font-medium text-rose-600">
              {errors.notes.message}
            </p>
          )}
        </div>

        {requestError && (
          <p
            role="alert"
            className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {requestError.message}
          </p>
        )}

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={closeModal}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving || (isEditing && !isDirty)}>
            {isSaving && <Spinner size="sm" />}
            {isSaving
              ? "Saving..."
              : isEditing
                ? "Save follow-up"
                : "Add follow-up"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default FollowUpFormModal;
