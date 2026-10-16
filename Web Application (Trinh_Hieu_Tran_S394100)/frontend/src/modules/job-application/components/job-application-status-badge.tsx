import { Badge } from "@/common/components/ui/badge";
import { cn } from "@/common/utils";
import { JobApplicationStatus } from "@/modules/job-application/model/responses";

const statusStyles: Record<
  JobApplicationStatus,
  { badge: string; dot: string }
> = {
  Applied: {
    badge: "border-sky-200 bg-sky-50 text-sky-700",
    dot: "bg-sky-500",
  },
  Interview: {
    badge: "border-violet-200 bg-violet-50 text-violet-700",
    dot: "bg-violet-500",
  },
  Offer: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  Rejected: {
    badge: "border-rose-200 bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
  Withdrawn: {
    badge: "border-slate-200 bg-slate-100 text-slate-700",
    dot: "bg-slate-500",
  },
  Archived: {
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
};

interface JobApplicationStatusBadgeProps {
  status: JobApplicationStatus;
  className?: string;
}

const JobApplicationStatusBadge = ({
  status,
  className,
}: JobApplicationStatusBadgeProps) => {
  const style = statusStyles[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-2 rounded-full px-3 py-1.5 font-semibold shadow-sm",
        style.badge,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      {status}
    </Badge>
  );
};

export default JobApplicationStatusBadge;
