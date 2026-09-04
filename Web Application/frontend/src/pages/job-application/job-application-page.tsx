import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import {
  MODAL_VIEWS,
  useModalAction,
} from "@/common/components/modal/modal-context";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Spinner } from "@/common/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { formatDate } from "@/common/utils/date";
import {
  DEFAULT_JOB_APPLICATION_PAGE_SIZE,
  useJobApplications,
} from "@/modules/job-application/hooks/useJobApplications";
import {
  JobApplicationResponse,
  JobApplicationStatus,
} from "@/modules/job-application/model/responses";

const statusStyles: Record<JobApplicationStatus, string> = {
  Applied: "border-blue-200 bg-blue-50 text-blue-700",
  Interview: "border-purple-200 bg-purple-50 text-purple-700",
  Offer: "border-green-200 bg-green-50 text-green-700",
  Rejected: "border-red-200 bg-red-50 text-red-700",
  Withdrawn: "border-gray-200 bg-gray-100 text-gray-700",
  Archived: "border-amber-200 bg-amber-50 text-amber-700",
};

interface ApplicationLinksProps {
  application: JobApplicationResponse;
}

const ApplicationLinks = ({ application }: ApplicationLinksProps) => {
  const links = [
    { label: "Job", href: application.jobLink },
    { label: "Portfolio", href: application.portfolioLink },
    { label: "GitHub", href: application.gitHubLink },
  ].filter((link): link is { label: string; href: string } =>
    Boolean(link.href),
  );

  if (links.length === 0) {
    return <span className="text-gray-400">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary-700 hover:text-primary-900 hover:underline"
        >
          {link.label}
          <ExternalLink size={12} />
        </a>
      ))}
    </div>
  );
};

const JobApplicationPage = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const { openModal } = useModalAction();
  const { data, isPending, isFetching, error, refetch } = useJobApplications(
    pageNumber,
    DEFAULT_JOB_APPLICATION_PAGE_SIZE,
  );

  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const pageSize = data?.pageSize ?? DEFAULT_JOB_APPLICATION_PAGE_SIZE;
  const rangeStart = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const rangeEnd = Math.min(pageNumber * pageSize, totalCount);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary-700">
              Application tracker
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-950">
              Job applications
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Track every opportunity in one place.
            </p>
          </div>

          <Button
            type="button"
            className="h-11 self-start px-5 sm:self-auto"
            onClick={() => openModal(MODAL_VIEWS.CREATE_JOB_APPLICATION)}
          >
            <Plus />
            Create job application
          </Button>
        </div>

        <section className="mt-8 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex min-h-14 items-center justify-between border-b border-gray-200 px-5">
            <p className="text-sm font-medium text-gray-700">
              {totalCount} {totalCount === 1 ? "application" : "applications"}
            </p>
            {isFetching && !isPending && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Spinner size="sm" className="border-t-primary-600" />
                Updating
              </div>
            )}
          </div>

          {isPending ? (
            <div className="flex min-h-72 items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-sm text-gray-500">
                <Spinner className="border-t-primary-600" />
                Loading job applications
              </div>
            </div>
          ) : error ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
              <p className="font-semibold text-gray-900">
                Could not load job applications
              </p>
              <p className="mt-2 max-w-md text-sm text-gray-600">
                {error instanceof Error
                  ? error.message
                  : "Please try again in a moment."}
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-5"
                onClick={() => void refetch()}
              >
                <RefreshCw />
                Try again
              </Button>
            </div>
          ) : data.items.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                <BriefcaseBusiness size={26} />
              </div>
              <p className="mt-4 font-semibold text-gray-900">
                No job applications yet
              </p>
              <p className="mt-2 max-w-sm text-sm text-gray-600">
                Create your first application to start tracking your progress.
              </p>
            </div>
          ) : (
            <Table className="min-w-[900px]">
              <TableHeader className="bg-gray-50">
                <TableRow className="hover:bg-gray-50">
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Application date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Links</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-semibold text-gray-950">
                      {application.companyName}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {application.roleTitle}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {application.platform}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-gray-700">
                      {formatDate(application.applicationDate, "short")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusStyles[application.currentStatus]}
                      >
                        {application.currentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ApplicationLinks application={application} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isPending && !error && totalCount > 0 && (
            <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-600">
                Showing {rangeStart}–{rangeEnd} of {totalCount}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!data.hasPreviousPage || isFetching}
                  onClick={() =>
                    setPageNumber((currentPage) => Math.max(1, currentPage - 1))
                  }
                >
                  <ChevronLeft />
                  Previous
                </Button>
                <span className="min-w-24 text-center text-sm font-medium text-gray-700">
                  Page {data.pageNumber} of {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!data.hasNextPage || isFetching}
                  onClick={() =>
                    setPageNumber((currentPage) => currentPage + 1)
                  }
                >
                  Next
                  <ChevronRight />
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default JobApplicationPage;
