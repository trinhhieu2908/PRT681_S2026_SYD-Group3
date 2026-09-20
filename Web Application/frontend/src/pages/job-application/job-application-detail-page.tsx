import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  ExternalLink,
  Monitor,
  RefreshCw,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/common/components/ui/button";
import { formatDate } from "@/common/utils/date";
import JobApplicationDocuments from "@/modules/document/components/job-application-documents";
import JobApplicationFollowUps from "@/modules/follow-up/components/job-application-follow-ups";
import JobApplicationInterviews from "@/modules/interview/components/job-application-interviews";
import InlineEditableField from "@/modules/job-application/components/inline-editable-field";
import JobApplicationStatusBadge from "@/modules/job-application/components/job-application-status-badge";
import JobApplicationStatusControl from "@/modules/job-application/components/job-application-status-control";
import { useJobApplication } from "@/modules/job-application/hooks/useJobApplication";
import { useUpdateJobApplication } from "@/modules/job-application/hooks/useUpdateJobApplication";
import {
  JOB_APPLICATION_FIELD_LIMITS,
  validateApplicationDate,
  validateCompanyName,
  validateOptionalJobApplicationUrl,
  validatePlatform,
  validateRoleTitle,
} from "@/modules/job-application/model/schemas";
import { routes } from "@/routes/routes";

const DetailLoading = () => {
  return (
    <div className="mx-auto max-w-5xl animate-pulse">
      <div className="h-10 w-40 rounded-lg bg-gray-200" />
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        <div className="h-16 w-16 rounded-2xl bg-gray-200" />
        <div className="mt-6 h-5 w-32 rounded bg-gray-200" />
        <div className="mt-3 h-9 w-2/3 rounded bg-gray-200" />
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-24 rounded-xl bg-gray-100" />
          ))}
        </div>
      </div>
    </div>
  );
};

const JobApplicationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isPending, error, refetch } = useJobApplication(id);
  const { updateField, isUpdating } = useUpdateJobApplication(id ?? "");

  if (isPending) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <DetailLoading />
      </div>
    );
  }

  if (!id || error || !data) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <Button asChild variant="ghost" className="-ml-3">
            <Link to={routes.jobApplicationsPath}>
              <ArrowLeft />
              Back to applications
            </Link>
          </Button>
          <div className="mt-6 flex min-h-80 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 text-center shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              <BriefcaseBusiness size={26} />
            </div>
            <h1 className="mt-5 text-xl font-semibold text-gray-950">
              Application unavailable
            </h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-gray-600">
              {error instanceof Error
                ? error.message
                : "This job application could not be found."}
            </p>
            {id && (
              <Button
                type="button"
                variant="outline"
                className="mt-5"
                onClick={() => void refetch()}
              >
                <RefreshCw />
                Try again
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const companyInitial = data.companyName.trim().charAt(0).toUpperCase() || "J";
  const links: Array<{
    field: "jobLink" | "portfolioLink" | "gitHubLink";
    label: string;
    description: string;
    href: string | null;
    placeholder: string;
  }> = [
    {
      field: "jobLink",
      label: "Job listing",
      description: "Open the original role listing",
      href: data.jobLink,
      placeholder: "https://company.com/jobs/...",
    },
    {
      field: "portfolioLink",
      label: "Portfolio",
      description: "View the portfolio used for this application",
      href: data.portfolioLink,
      placeholder: "https://yourportfolio.com",
    },
    {
      field: "gitHubLink",
      label: "GitHub",
      description: "View the related GitHub profile or repository",
      href: data.gitHubLink,
      placeholder: "https://github.com/...",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <Button asChild variant="ghost" className="-ml-3">
          <Link to={routes.jobApplicationsPath}>
            <ArrowLeft />
            Back to applications
          </Link>
        </Button>

        <section className="relative mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500" />
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-1 gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 text-2xl font-bold text-primary-800 ring-1 ring-primary-200">
                {companyInitial}
              </div>
              <div className="min-w-0 flex-1">
                <InlineEditableField
                  label="Company name"
                  value={data.companyName}
                  validate={validateCompanyName}
                  maxLength={JOB_APPLICATION_FIELD_LIMITS.companyName}
                  placeholder="Company name"
                  disabled={isUpdating}
                  inputClassName="h-9 max-w-md"
                  onSave={(value) =>
                    updateField("companyName", value ?? data.companyName)
                  }
                  renderValue={(value) => (
                    <p className="break-words font-medium text-primary-700">
                      {value}
                    </p>
                  )}
                />
                <InlineEditableField
                  label="Role title"
                  value={data.roleTitle}
                  validate={validateRoleTitle}
                  maxLength={JOB_APPLICATION_FIELD_LIMITS.roleTitle}
                  placeholder="Role title"
                  disabled={isUpdating}
                  className="mt-1"
                  inputClassName="h-11 max-w-xl text-lg font-semibold"
                  onSave={(value) =>
                    updateField("roleTitle", value ?? data.roleTitle)
                  }
                  renderValue={(value) => (
                    <h1 className="break-words text-2xl font-semibold tracking-tight text-gray-950 sm:text-3xl">
                      {value}
                    </h1>
                  )}
                />
              </div>
            </div>
            <JobApplicationStatusBadge status={data.currentStatus} />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <Monitor className="h-5 w-5 text-primary-600" />
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                Platform
              </p>
              <InlineEditableField
                label="Platform"
                value={data.platform}
                validate={validatePlatform}
                maxLength={JOB_APPLICATION_FIELD_LIMITS.platform}
                placeholder="e.g. LinkedIn"
                disabled={isUpdating}
                className="mt-1"
                inputClassName="h-9"
                displayClassName="font-semibold text-gray-900"
                onSave={(value) =>
                  updateField("platform", value ?? data.platform)
                }
              />
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <CalendarDays className="h-5 w-5 text-primary-600" />
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                Application date
              </p>
              <InlineEditableField
                label="Application date"
                value={data.applicationDate.slice(0, 10)}
                type="date"
                validate={validateApplicationDate}
                normalizeValue={(value) => value}
                disabled={isUpdating}
                className="mt-1"
                inputClassName="h-9"
                displayClassName="font-semibold text-gray-900"
                onSave={(value) =>
                  updateField(
                    "applicationDate",
                    value ?? data.applicationDate.slice(0, 10),
                  )
                }
                renderValue={() => (
                  <p>{formatDate(data.applicationDate, "long")}</p>
                )}
              />
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <Clock3 className="h-5 w-5 text-primary-600" />
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                Added
              </p>
              <p className="mt-1 font-semibold text-gray-900">
                {formatDate(data.createdAtUtc, "long")}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <JobApplicationStatusControl
            application={data}
            className="lg:col-start-2 lg:row-start-1"
          />

          <div className="space-y-6 lg:col-start-1 lg:row-start-1">
            <JobApplicationInterviews jobApplicationId={data.id} />

            <JobApplicationFollowUps jobApplicationId={data.id} />

            <JobApplicationDocuments application={data} />

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-950">
                Application links
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Resources saved with this opportunity.
              </p>

              <div className="mt-5 grid gap-3">
                {links.map((link) => (
                  <div
                    key={link.field}
                    className="rounded-xl border border-gray-200 p-4 transition hover:border-primary-200 hover:bg-primary-50/30"
                  >
                    <p className="font-semibold text-gray-900">{link.label}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {link.description}
                    </p>
                    <InlineEditableField
                      label={`${link.label} link`}
                      value={link.href}
                      type="url"
                      validate={validateOptionalJobApplicationUrl}
                      maxLength={JOB_APPLICATION_FIELD_LIMITS.url}
                      placeholder={link.placeholder}
                      emptyActionLabel="Add link"
                      disabled={isUpdating}
                      className="mt-3"
                      inputClassName="h-10"
                      onSave={(value) => updateField(link.field, value)}
                      renderValue={(value) => (
                        <a
                          href={value}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-w-0 items-center gap-2 break-all text-sm font-semibold text-primary-700 hover:text-primary-900 hover:underline"
                        >
                          {value}
                          <ExternalLink className="h-4 w-4 shrink-0" />
                        </a>
                      )}
                    />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationDetailPage;
