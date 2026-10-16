import {
  Archive,
  ArchiveRestore,
  ChevronRight,
  CircleDot,
  MessageSquareText,
  Trophy,
  UserRoundX,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { useConfirmation } from "@/common/components/confirmation-modal/confirmation-modal-context";
import { Button } from "@/common/components/ui/button";
import { Spinner } from "@/common/components/ui/spinner";
import { cn } from "@/common/utils";
import { formatDate } from "@/common/utils/date";
import JobApplicationStatusBadge from "@/modules/job-application/components/job-application-status-badge";
import { useUnarchiveJobApplication } from "@/modules/job-application/hooks/useUnarchiveJobApplication";
import { useUpdateJobApplicationStatus } from "@/modules/job-application/hooks/useUpdateJobApplicationStatus";
import {
  JobApplicationResponse,
  JobApplicationStatus,
} from "@/modules/job-application/model/responses";

interface StatusAction {
  status: JobApplicationStatus;
  label: string;
  description: string;
  icon: LucideIcon;
  skipToOffer?: boolean;
  confirmation?: {
    title: string;
    message: string;
    confirmText: string;
    variant: "warning" | "destructive";
  };
}

const actionsByStatus: Record<JobApplicationStatus, StatusAction[]> = {
  Applied: [
    {
      status: "Interview",
      label: "Move to interview",
      description: "The conversation is moving forward",
      icon: MessageSquareText,
    },
    {
      status: "Offer",
      label: "Record an offer",
      description: "Skip the interview stage",
      icon: Trophy,
      skipToOffer: true,
      confirmation: {
        title: "Skip straight to offer?",
        message:
          "This records an offer directly from Applied and intentionally skips the Interview stage.",
        confirmText: "Record offer",
        variant: "warning",
      },
    },
    {
      status: "Rejected",
      label: "Mark as rejected",
      description: "The company closed this opportunity",
      icon: XCircle,
      confirmation: {
        title: "Mark this application as rejected?",
        message:
          "After this change, the application can only be archived. This action cannot move back to Applied.",
        confirmText: "Mark rejected",
        variant: "destructive",
      },
    },
    {
      status: "Withdrawn",
      label: "Withdraw application",
      description: "You are stepping away from this role",
      icon: UserRoundX,
      confirmation: {
        title: "Withdraw this application?",
        message:
          "After withdrawing, the application can only be archived. This action cannot move back to Applied.",
        confirmText: "Withdraw",
        variant: "warning",
      },
    },
  ],
  Interview: [
    {
      status: "Offer",
      label: "Record an offer",
      description: "Celebrate a successful outcome",
      icon: Trophy,
    },
    {
      status: "Rejected",
      label: "Mark as rejected",
      description: "The company closed this opportunity",
      icon: XCircle,
      confirmation: {
        title: "Mark this application as rejected?",
        message:
          "After this change, the application can only be archived. It cannot return to Interview.",
        confirmText: "Mark rejected",
        variant: "destructive",
      },
    },
    {
      status: "Withdrawn",
      label: "Withdraw application",
      description: "You are stepping away from this role",
      icon: UserRoundX,
      confirmation: {
        title: "Withdraw this application?",
        message:
          "After withdrawing, the application can only be archived. It cannot return to Interview.",
        confirmText: "Withdraw",
        variant: "warning",
      },
    },
  ],
  Offer: [
    {
      status: "Withdrawn",
      label: "Decline offer",
      description: "Record that you chose not to proceed",
      icon: UserRoundX,
      confirmation: {
        title: "Decline this offer?",
        message:
          "The application will move to Withdrawn and can only be archived afterward.",
        confirmText: "Decline offer",
        variant: "warning",
      },
    },
    {
      status: "Archived",
      label: "Archive application",
      description: "Move it out of your active journey",
      icon: Archive,
      confirmation: {
        title: "Archive this application?",
        message:
          "It will leave the active workflow. You can restore it to Offer later.",
        confirmText: "Archive",
        variant: "warning",
      },
    },
  ],
  Rejected: [
    {
      status: "Archived",
      label: "Archive application",
      description: "Move it out of your active journey",
      icon: Archive,
      confirmation: {
        title: "Archive this application?",
        message:
          "It will leave the active workflow. You can restore it to Rejected later.",
        confirmText: "Archive",
        variant: "warning",
      },
    },
  ],
  Withdrawn: [
    {
      status: "Archived",
      label: "Archive application",
      description: "Move it out of your active journey",
      icon: Archive,
      confirmation: {
        title: "Archive this application?",
        message:
          "It will leave the active workflow. You can restore it to Withdrawn later.",
        confirmText: "Archive",
        variant: "warning",
      },
    },
  ],
  Archived: [],
};

const statusDescriptions: Record<JobApplicationStatus, string> = {
  Applied: "Sent and waiting for the next signal.",
  Interview: "The conversation is actively moving forward.",
  Offer: "An offer has been received for this role.",
  Rejected: "This opportunity has reached its end.",
  Withdrawn: "You chose not to continue with this role.",
  Archived: "Stored outside your active application workflow.",
};

interface JobApplicationStatusControlProps {
  application: JobApplicationResponse;
  className?: string;
}

const JobApplicationStatusControl = ({
  application,
  className,
}: JobApplicationStatusControlProps) => {
  const confirm = useConfirmation();
  const {
    updateStatus,
    isUpdating,
    pendingStatus,
    error: updateError,
    reset: resetUpdate,
  } = useUpdateJobApplicationStatus(application.id);
  const {
    unarchive,
    isUnarchiving,
    error: unarchiveError,
    reset: resetUnarchive,
  } = useUnarchiveJobApplication(application.id);
  const actions = actionsByStatus[application.currentStatus];
  const isBusy = isUpdating || isUnarchiving;
  const error = updateError ?? unarchiveError;

  const handleStatusAction = async (action: StatusAction) => {
    resetUpdate();
    resetUnarchive();

    const confirmation = action.confirmation ?? {
      title: `Move application to ${action.status}?`,
      message: `This status change cannot be rolled back to ${application.currentStatus}. Please confirm that you want to continue.`,
      confirmText: `Move to ${action.status}`,
      variant: "warning" as const,
    };
    const confirmed = await confirm({
      title: confirmation.title,
      message: confirmation.message,
      confirmText: confirmation.confirmText,
      cancelText: "Keep current status",
      variant: confirmation.variant,
    });

    if (!confirmed) {
      return;
    }

    updateStatus({
      newStatus: action.status,
      skipToOffer: action.skipToOffer ?? false,
    });
  };

  const handleUnarchive = async () => {
    resetUpdate();
    resetUnarchive();

    const confirmed = await confirm({
      title: "Restore this application?",
      message:
        "This will change the application from Archived back to the stage it held immediately before archiving.",
      confirmText: "Restore application",
      cancelText: "Keep archived",
      variant: "warning",
    });

    if (!confirmed) {
      return;
    }

    unarchive();
  };

  return (
    <aside
      className={cn(
        "overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm",
        className,
      )}
    >
      <div className="border-b border-gray-100 bg-gradient-to-br from-gray-950 to-primary-900 p-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">
          Current stage
        </p>
        <div className="mt-4">
          <JobApplicationStatusBadge
            status={application.currentStatus}
            className="border-white/20 bg-white/10 text-white shadow-none"
          />
        </div>
        <p className="mt-4 text-sm leading-6 text-gray-300">
          {statusDescriptions[application.currentStatus]}
        </p>
      </div>

      <div className="p-5">
        {application.currentStatus === "Archived" ? (
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <ArchiveRestore className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-semibold text-gray-950">
              Return to your journey
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Restore this application to the stage it held immediately before
              being archived.
            </p>
            <Button
              type="button"
              className="mt-5 w-full rounded-xl"
              disabled={isBusy}
              onClick={() => void handleUnarchive()}
            >
              {isUnarchiving ? (
                <>
                  <Spinner size="sm" />
                  Restoring...
                </>
              ) : (
                <>
                  <ArchiveRestore />
                  Restore application
                </>
              )}
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2">
              <CircleDot className="h-4 w-4 text-primary-700" />
              <h2 className="text-sm font-semibold text-gray-950">
                Choose the next move
              </h2>
            </div>
            <p className="mt-2 text-xs leading-5 text-gray-500">
              Only transitions allowed from {application.currentStatus} are
              shown.
            </p>

            <div className="mt-4 space-y-2">
              {actions.map((action) => {
                const Icon = action.icon;
                const isThisActionPending =
                  isUpdating && pendingStatus === action.status;

                return (
                  <button
                    key={action.status}
                    type="button"
                    disabled={isBusy}
                    onClick={() => void handleStatusAction(action)}
                    className="group flex w-full items-center gap-3 rounded-xl border border-gray-200 px-3 py-3 text-left transition hover:border-primary-200 hover:bg-primary-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition group-hover:bg-white group-hover:text-primary-700">
                      {isThisActionPending ? (
                        <Spinner size="sm" className="border-t-primary-600" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-gray-900">
                        {action.label}
                      </span>
                      <span className="mt-0.5 block text-xs leading-5 text-gray-500">
                        {action.description}
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-primary-700 motion-reduce:transform-none" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-700"
          >
            {error.message}
          </p>
        )}

        {application.updatedAtUtc && (
          <p className="mt-5 border-t border-gray-100 pt-4 text-xs text-gray-500">
            Last updated {formatDate(application.updatedAtUtc, "datetime")}
          </p>
        )}
      </div>
    </aside>
  );
};

export default JobApplicationStatusControl;
