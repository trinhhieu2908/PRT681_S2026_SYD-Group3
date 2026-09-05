import {
  ArrowRight,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import {
  MODAL_VIEWS,
  useModalAction,
} from "@/common/components/modal/modal-context";
import { Button } from "@/common/components/ui/button";
import { Spinner } from "@/common/components/ui/spinner";
import JobApplicationCard from "@/modules/job-application/components/job-application-card";
import {
  DEFAULT_JOB_APPLICATION_PAGE_SIZE,
  useJobApplications,
} from "@/modules/job-application/hooks/useJobApplications";

const LoadingJourney = () => {
  return (
    <div className="relative space-y-4 before:absolute before:bottom-10 before:left-10 before:top-10 before:hidden before:w-px before:bg-gray-200 sm:before:block">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="relative grid animate-pulse gap-5 sm:grid-cols-[5.5rem_minmax(0,1fr)]"
        >
          <div className="relative z-10 hidden justify-center sm:flex">
            <div className="h-20 w-20 rounded-2xl border border-gray-200 bg-white" />
          </div>
          <div className="rounded-[1.75rem] border border-gray-200 bg-white px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex gap-4">
              <div className="h-14 w-14 shrink-0 rounded-2xl bg-gray-200" />
              <div className="min-w-0 flex-1">
                <div className="h-4 w-28 rounded bg-gray-200" />
                <div className="mt-3 h-7 w-3/5 rounded bg-gray-200" />
                <div className="mt-6 h-4 w-2/5 rounded bg-gray-100" />
              </div>
            </div>
          </div>
        </div>
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
      <div className="mx-auto max-w-6xl">
        <section className="relative overflow-hidden rounded-[2rem] bg-gray-950 px-6 py-7 text-white shadow-[0_28px_70px_-38px_rgba(15,118,110,0.8)] sm:px-9 sm:py-9">
          <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-primary-500/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-36 left-1/3 h-72 w-72 rounded-full bg-secondary-500/20 blur-3xl" />
          <div className="pointer-events-none absolute right-1/3 top-0 h-px w-48 bg-gradient-to-r from-transparent via-primary-300/70 to-transparent" />

          <div className="relative flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary-200">
                <Sparkles className="h-4 w-4" />
                Your search, in motion
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:text-5xl">
                Every opportunity has a story.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-gray-300 sm:text-base">
                Follow each application from the first click to the next chapter
                in your career.
              </p>
            </div>

            <Button
              type="button"
              className="h-12 self-start rounded-full bg-white px-5 text-gray-950 shadow-xl shadow-black/20 hover:bg-primary-50 sm:self-auto"
              onClick={() => openModal(MODAL_VIEWS.CREATE_JOB_APPLICATION)}
            >
              <Plus />
              Add opportunity
            </Button>
          </div>
        </section>

        <section className="mt-9">
          <div className="flex min-h-12 items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-700">
                Application trail
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
                Where your journey stands
              </h2>
            </div>
            {isFetching && !isPending && (
              <div className="flex items-center gap-2 pb-1 text-xs text-gray-500">
                <Spinner size="sm" className="border-t-primary-600" />
                Refreshing your trail
              </div>
            )}
          </div>

          <div className="mt-6">
            {isPending ? (
              <LoadingJourney />
            ) : error ? (
              <div className="flex min-h-72 flex-col items-center justify-center rounded-[1.75rem] border border-rose-100 bg-gradient-to-br from-white to-rose-50/50 px-6 text-center shadow-sm">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
                  <RefreshCw size={24} />
                </div>
                <p className="mt-5 font-semibold text-gray-950">
                  Your application trail could not be loaded
                </p>
                <p className="mt-2 max-w-md text-sm leading-6 text-gray-600">
                  {error instanceof Error
                    ? error.message
                    : "Please try again in a moment."}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-5 rounded-full"
                  onClick={() => void refetch()}
                >
                  <RefreshCw />
                  Try again
                </Button>
              </div>
            ) : data.items.length === 0 ? (
              <div className="relative flex min-h-80 flex-col items-center justify-center overflow-hidden rounded-[1.75rem] border border-dashed border-primary-200 bg-gradient-to-br from-white via-primary-50/50 to-secondary-50/50 px-6 text-center">
                <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-primary-100/70 blur-3xl" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-950 text-white shadow-xl shadow-primary-900/15">
                  <BriefcaseBusiness size={27} />
                </div>
                <p className="relative mt-5 text-lg font-semibold text-gray-950">
                  Your next chapter starts here
                </p>
                <p className="relative mt-2 max-w-sm text-sm leading-6 text-gray-600">
                  Add your first opportunity and watch your job search take
                  shape.
                </p>
                <Button
                  type="button"
                  className="relative mt-6 rounded-full px-5"
                  onClick={() => openModal(MODAL_VIEWS.CREATE_JOB_APPLICATION)}
                >
                  Add your first opportunity
                  <ArrowRight />
                </Button>
              </div>
            ) : (
              <div className="relative space-y-4 before:absolute before:bottom-10 before:left-10 before:top-10 before:hidden before:w-px before:bg-gradient-to-b before:from-primary-200 before:via-gray-200 before:to-secondary-200 sm:before:block">
                {data.items.map((application) => (
                  <JobApplicationCard
                    key={application.id}
                    application={application}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {!isPending && !error && totalCount > 0 && (
          <nav
            className="mt-8 flex flex-col gap-4 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between"
            aria-label="Job application pagination"
          >
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {rangeStart}–{rangeEnd}
              </span>{" "}
              of {totalCount} opportunities
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full px-4"
                disabled={!data.hasPreviousPage || isFetching}
                onClick={() =>
                  setPageNumber((currentPage) => Math.max(1, currentPage - 1))
                }
              >
                <ChevronLeft />
                Previous
              </Button>
              <span className="min-w-20 text-center text-sm font-semibold text-gray-700">
                {data.pageNumber} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full px-4"
                disabled={!data.hasNextPage || isFetching}
                onClick={() => setPageNumber((currentPage) => currentPage + 1)}
              >
                Next
                <ChevronRight />
              </Button>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
};

export default JobApplicationPage;
