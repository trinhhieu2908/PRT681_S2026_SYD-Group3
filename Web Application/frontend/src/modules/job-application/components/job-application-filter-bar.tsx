import {
  CalendarRange,
  Filter,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { JobApplicationFilters } from "@/modules/job-application/model/requests";
import { JobApplicationStatus } from "@/modules/job-application/model/responses";

const statuses: JobApplicationStatus[] = [
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
  "Archived",
];

interface JobApplicationFilterBarProps {
  searchTerm: string;
  filters: JobApplicationFilters;
  onSearchChange: (value: string) => void;
  onApplyFilters: (filters: JobApplicationFilters) => void;
  onClearAll: () => void;
}

const countFilters = (filters: JobApplicationFilters) =>
  Object.values(filters).filter(Boolean).length;

const JobApplicationFilterBar = ({
  searchTerm,
  filters,
  onSearchChange,
  onApplyFilters,
  onClearAll,
}: JobApplicationFilterBarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draftFilters, setDraftFilters] =
    useState<JobApplicationFilters>(filters);
  const [dateRangeError, setDateRangeError] = useState<string | null>(null);
  const activeFilterCount = countFilters(filters);
  const hasCriteria = searchTerm.trim().length > 0 || activeFilterCount > 0;

  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  const handleApplyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      draftFilters.fromDate &&
      draftFilters.toDate &&
      draftFilters.fromDate > draftFilters.toDate
    ) {
      setDateRangeError("From date cannot be later than to date.");
      return;
    }

    setDateRangeError(null);
    onApplyFilters({
      ...draftFilters,
      platform: draftFilters.platform?.trim() || undefined,
    });
    setIsOpen(false);
  };

  const handleResetFilters = () => {
    setDraftFilters({});
    setDateRangeError(null);
    onApplyFilters({});
  };

  const handleClearAll = () => {
    setDraftFilters({});
    setDateRangeError(null);
    onClearAll();
  };

  return (
    <div className="mt-6 rounded-[1.5rem] border border-gray-200 bg-white p-3 shadow-[0_16px_42px_-32px_rgba(15,23,42,0.45)] sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="job-application-search" className="sr-only">
            Search job applications by company or role
          </label>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            id="job-application-search"
            type="search"
            value={searchTerm}
            maxLength={150}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by company or role..."
            className="h-12 rounded-xl border-0 bg-gray-50 pl-12 pr-11 shadow-none ring-1 ring-inset ring-gray-200 focus-visible:ring-2 focus-visible:ring-primary-500 [&::-webkit-search-cancel-button]:appearance-none"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-200 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-12 flex-1 rounded-xl px-4 sm:flex-none"
            onClick={() => setIsOpen((current) => !current)}
            aria-expanded={isOpen}
            aria-controls="job-application-filters"
          >
            <SlidersHorizontal />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-700 px-1.5 text-[0.65rem] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {hasCriteria && (
            <Button
              type="button"
              variant="ghost"
              className="h-12 rounded-xl px-4 text-gray-600"
              onClick={handleClearAll}
            >
              Clear all
            </Button>
          )}
        </div>
      </div>

      {isOpen && (
        <form
          id="job-application-filters"
          onSubmit={handleApplyFilters}
          className="mt-4 border-t border-gray-100 px-1 pt-4"
        >
          <div className="mb-4 flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary-700" />
            <p className="text-sm font-semibold text-gray-900">
              Narrow your application trail
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <label
                htmlFor="job-application-status"
                className="text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                Status
              </label>
              <Select
                value={draftFilters.status ?? "all"}
                onValueChange={(value) =>
                  setDraftFilters((current) => ({
                    ...current,
                    status:
                      value === "all"
                        ? undefined
                        : (value as JobApplicationStatus),
                  }))
                }
              >
                <SelectTrigger
                  id="job-application-status"
                  className="rounded-xl bg-white"
                >
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="job-application-platform"
                className="text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                Platform
              </label>
              <Input
                id="job-application-platform"
                value={draftFilters.platform ?? ""}
                maxLength={50}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    platform: event.target.value,
                  }))
                }
                placeholder="e.g. LinkedIn"
                className="rounded-xl bg-white"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="job-application-from-date"
                className="text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                From date
              </label>
              <Input
                id="job-application-from-date"
                type="date"
                value={draftFilters.fromDate ?? ""}
                onChange={(event) => {
                  setDateRangeError(null);
                  setDraftFilters((current) => ({
                    ...current,
                    fromDate: event.target.value || undefined,
                  }));
                }}
                className="rounded-xl bg-white"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="job-application-to-date"
                className="text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                To date
              </label>
              <Input
                id="job-application-to-date"
                type="date"
                value={draftFilters.toDate ?? ""}
                min={draftFilters.fromDate}
                onChange={(event) => {
                  setDateRangeError(null);
                  setDraftFilters((current) => ({
                    ...current,
                    toDate: event.target.value || undefined,
                  }));
                }}
                className="rounded-xl bg-white"
              />
            </div>
          </div>

          {dateRangeError && (
            <p role="alert" className="mt-3 text-sm font-medium text-rose-600">
              {dateRangeError}
            </p>
          )}

          <div className="mt-5 flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-xs text-gray-500">
              <CalendarRange className="h-4 w-4" />
              Date filters include both selected dates.
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                className="rounded-full"
                onClick={handleResetFilters}
              >
                Reset filters
              </Button>
              <Button type="submit" className="rounded-full px-5">
                Apply filters
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default JobApplicationFilterBar;
