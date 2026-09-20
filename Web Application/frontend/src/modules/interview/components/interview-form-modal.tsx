import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock, MapPin, UserRound, Video } from "lucide-react";
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
import { useCreateInterview } from "@/modules/interview/hooks/useCreateInterview";
import { useUpdateInterview } from "@/modules/interview/hooks/useUpdateInterview";
import { isInterviewModalPayload } from "@/modules/interview/model/interview-modal";
import type {
  CreateInterviewRequest,
  UpdateInterviewRequest,
} from "@/modules/interview/model/requests";
import {
  INTERVIEW_FIELD_LIMITS,
  interviewFormSchema,
  type InterviewFormValues,
} from "@/modules/interview/model/schemas";
import { toDateTimeLocalValue } from "@/modules/interview/utils/date";

const toOptionalValue = (value: string): string | null =>
  value.length > 0 ? value : null;

const getDefaultInterviewTime = () => {
  const date = new Date();
  date.setHours(date.getHours() + 1, 0, 0, 0);
  return toDateTimeLocalValue(date.toISOString());
};

const InterviewFormModal = () => {
  const { data } = useModalState();
  const { closeModal } = useModalAction();
  const payload = isInterviewModalPayload(data) ? data : null;
  const interview = payload?.interview;
  const isEditing = Boolean(interview);
  const {
    createInterview,
    isCreating,
    error: createError,
  } = useCreateInterview(payload?.jobApplicationId ?? "", {
    onSuccess: closeModal,
  });
  const {
    updateInterview,
    isUpdating,
    error: updateError,
  } = useUpdateInterview(payload?.jobApplicationId ?? "", interview?.id ?? "", {
    onSuccess: closeModal,
  });
  const {
    register,
    handleSubmit,
    formState: { dirtyFields, errors },
  } = useForm<InterviewFormValues>({
    resolver: zodResolver(interviewFormSchema),
    defaultValues: {
      title: interview?.title ?? "",
      interviewType: interview?.interviewType ?? "",
      scheduledAtLocal: interview
        ? toDateTimeLocalValue(interview.scheduledAtUtc)
        : getDefaultInterviewTime(),
      location: interview?.location ?? "",
      meetingLink: interview?.meetingLink ?? "",
      contactName: interview?.contactName ?? "",
      contactEmail: interview?.contactEmail ?? "",
      contactPhone: interview?.contactPhone ?? "",
      notes: interview?.notes ?? "",
    },
  });

  if (!payload) {
    return (
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Interview unavailable</DialogTitle>
          <DialogDescription>
            The interview form could not be opened. Close this window and try
            again.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    );
  }

  const isSaving = isCreating || isUpdating;
  const requestError = isEditing ? updateError : createError;

  const onSubmit = (values: InterviewFormValues) => {
    const scheduledAtUtc = new Date(values.scheduledAtLocal).toISOString();

    if (isEditing) {
      const request: UpdateInterviewRequest = {};
      if (dirtyFields.title) request.title = values.title;
      if (dirtyFields.interviewType)
        request.interviewType = values.interviewType;
      if (dirtyFields.scheduledAtLocal) request.scheduledAtUtc = scheduledAtUtc;
      if (dirtyFields.location) request.location = values.location;
      if (dirtyFields.meetingLink) request.meetingLink = values.meetingLink;
      if (dirtyFields.contactName) request.contactName = values.contactName;
      if (dirtyFields.contactEmail) request.contactEmail = values.contactEmail;
      if (dirtyFields.contactPhone) request.contactPhone = values.contactPhone;
      if (dirtyFields.notes) request.notes = values.notes;
      updateInterview(request);
      return;
    }

    const request: CreateInterviewRequest = {
      title: values.title,
      interviewType: values.interviewType,
      scheduledAtUtc,
      location: toOptionalValue(values.location),
      meetingLink: toOptionalValue(values.meetingLink),
      contactName: toOptionalValue(values.contactName),
      contactEmail: toOptionalValue(values.contactEmail),
      contactPhone: toOptionalValue(values.contactPhone),
      notes: toOptionalValue(values.notes),
    };
    createInterview(request);
  };

  const fieldError = (message?: string) =>
    message ? (
      <p role="alert" className="mt-1.5 text-xs font-medium text-rose-600">
        {message}
      </p>
    ) : null;

  return (
    <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Edit interview" : "Add interview"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Update this interview round without changing the others."
            : "Schedule another interview round for this application."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <section className="rounded-2xl border border-primary-100 bg-primary-50/40 p-4 sm:p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary-900">
            <CalendarClock className="h-4 w-4" />
            Interview schedule
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="interview-title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="interview-title"
                {...register("title")}
                maxLength={INTERVIEW_FIELD_LIMITS.title}
                placeholder="e.g. Second-round interview"
                disabled={isSaving}
                autoFocus
              />
              {fieldError(errors.title?.message)}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="interview-type" className="text-sm font-medium">
                Interview type
              </label>
              <Input
                id="interview-type"
                {...register("interviewType")}
                maxLength={INTERVIEW_FIELD_LIMITS.interviewType}
                list="interview-type-suggestions"
                placeholder="e.g. Technical"
                disabled={isSaving}
              />
              <datalist id="interview-type-suggestions">
                <option value="Phone screen" />
                <option value="Recruiter" />
                <option value="Technical" />
                <option value="Behavioural" />
                <option value="Hiring manager" />
                <option value="Panel" />
                <option value="Final" />
              </datalist>
              {fieldError(errors.interviewType?.message)}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="scheduled-at" className="text-sm font-medium">
                Date and time
              </label>
              <Input
                id="scheduled-at"
                type="datetime-local"
                {...register("scheduledAtLocal")}
                disabled={isSaving}
              />
              {fieldError(errors.scheduledAtLocal?.message)}
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <MapPin className="h-4 w-4 text-primary-600" />
            Place or meeting
          </div>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="interview-location"
                className="text-sm text-gray-700"
              >
                Location <span className="text-gray-400">(optional)</span>
              </label>
              <Input
                id="interview-location"
                {...register("location")}
                maxLength={INTERVIEW_FIELD_LIMITS.location}
                placeholder="Office, room, or address"
                disabled={isSaving}
              />
              {fieldError(errors.location?.message)}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="meeting-link" className="text-sm text-gray-700">
                Meeting link <span className="text-gray-400">(optional)</span>
              </label>
              <div className="relative">
                <Video className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <Input
                  id="meeting-link"
                  type="url"
                  {...register("meetingLink")}
                  maxLength={INTERVIEW_FIELD_LIMITS.meetingLink}
                  placeholder="https://..."
                  disabled={isSaving}
                  className="pl-9"
                />
              </div>
              {fieldError(errors.meetingLink?.message)}
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <UserRound className="h-4 w-4 text-primary-600" />
            Employer contact
            <span className="font-normal text-gray-400">(optional)</span>
          </div>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label htmlFor="contact-name" className="text-sm text-gray-700">
                Name
              </label>
              <Input
                id="contact-name"
                {...register("contactName")}
                maxLength={INTERVIEW_FIELD_LIMITS.contactName}
                disabled={isSaving}
              />
              {fieldError(errors.contactName?.message)}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="contact-email" className="text-sm text-gray-700">
                Email
              </label>
              <Input
                id="contact-email"
                type="email"
                {...register("contactEmail")}
                maxLength={INTERVIEW_FIELD_LIMITS.contactEmail}
                disabled={isSaving}
              />
              {fieldError(errors.contactEmail?.message)}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="contact-phone" className="text-sm text-gray-700">
                Phone
              </label>
              <Input
                id="contact-phone"
                type="tel"
                {...register("contactPhone")}
                maxLength={INTERVIEW_FIELD_LIMITS.contactPhone}
                disabled={isSaving}
              />
              {fieldError(errors.contactPhone?.message)}
            </div>
          </div>
        </section>

        <div className="space-y-1.5">
          <label
            htmlFor="interview-notes"
            className="text-sm font-medium text-gray-800"
          >
            Notes <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <Textarea
            id="interview-notes"
            {...register("notes")}
            maxLength={INTERVIEW_FIELD_LIMITS.notes}
            placeholder="Topics to prepare, people attending, or anything worth remembering..."
            disabled={isSaving}
          />
          {fieldError(errors.notes?.message)}
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
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Spinner size="sm" />}
            {isSaving
              ? isEditing
                ? "Saving..."
                : "Adding..."
              : isEditing
                ? "Save interview"
                : "Add interview"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default InterviewFormModal;
