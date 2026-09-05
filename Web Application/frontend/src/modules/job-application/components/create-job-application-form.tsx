import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useModalAction } from "@/common/components/modal/modal-context";
import { Button } from "@/common/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Input } from "@/common/components/ui/input";
import { useCreateJobApplication } from "@/modules/job-application/hooks/useCreateJobApplication";
import { CreateJobApplicationRequest } from "@/modules/job-application/model/requests";

const optionalUrl = z
  .string()
  .trim()
  .max(2048, { message: "URL cannot exceed 2048 characters" })
  .refine(
    (value) => value.length === 0 || z.string().url().safeParse(value).success,
    { message: "Enter a valid URL" },
  );

const createJobApplicationSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(1, { message: "Company name is required" })
    .max(150, { message: "Company name cannot exceed 150 characters" }),
  roleTitle: z
    .string()
    .trim()
    .min(1, { message: "Role title is required" })
    .max(150, { message: "Role title cannot exceed 150 characters" }),
  platform: z
    .string()
    .trim()
    .min(1, { message: "Platform is required" })
    .max(50, { message: "Platform cannot exceed 50 characters" }),
  jobLink: optionalUrl,
  portfolioLink: optionalUrl,
  gitHubLink: optionalUrl,
});

type CreateJobApplicationFormValues = z.infer<
  typeof createJobApplicationSchema
>;

const toOptionalValue = (value: string): string | null =>
  value.length > 0 ? value : null;

const CreateJobApplicationForm = () => {
  const { closeModal } = useModalAction();
  const { createJobApplication, isLoading, error } = useCreateJobApplication({
    onSuccess: closeModal,
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateJobApplicationFormValues>({
    resolver: zodResolver(createJobApplicationSchema),
    defaultValues: {
      companyName: "",
      roleTitle: "",
      platform: "",
      jobLink: "",
      portfolioLink: "",
      gitHubLink: "",
    },
  });

  const onSubmit = (values: CreateJobApplicationFormValues) => {
    const request: CreateJobApplicationRequest = {
      companyName: values.companyName,
      roleTitle: values.roleTitle,
      platform: values.platform,
      jobLink: toOptionalValue(values.jobLink),
      portfolioLink: toOptionalValue(values.portfolioLink),
      gitHubLink: toOptionalValue(values.gitHubLink),
    };

    createJobApplication(request);
  };

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Create job application</DialogTitle>
        <DialogDescription>
          Add a new opportunity to your application tracker.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="company-name"
              className="text-sm font-semibold text-gray-700"
            >
              Company name
            </label>
            <Input
              id="company-name"
              {...register("companyName")}
              placeholder="e.g. Atlassian"
              disabled={isLoading}
              autoFocus
            />
            {errors.companyName && (
              <p className="text-sm text-red-600">
                {errors.companyName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="role-title"
              className="text-sm font-semibold text-gray-700"
            >
              Role title
            </label>
            <Input
              id="role-title"
              {...register("roleTitle")}
              placeholder="e.g. Software Engineer"
              disabled={isLoading}
            />
            {errors.roleTitle && (
              <p className="text-sm text-red-600">{errors.roleTitle.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="platform"
            className="text-sm font-semibold text-gray-700"
          >
            Platform
          </label>
          <Input
            id="platform"
            {...register("platform")}
            placeholder="e.g. LinkedIn"
            disabled={isLoading}
          />
          {errors.platform && (
            <p className="text-sm text-red-600">{errors.platform.message}</p>
          )}
        </div>

        <div className="rounded-lg border border-primary-100 bg-primary-50 p-4">
          <div className="flex gap-3">
            <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-primary-700" />
            <p className="text-sm leading-6 text-primary-900">
              The application date is set to today and the initial status is set
              to Applied by the API.
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-900">Optional links</p>
          <div className="mt-3 grid gap-4">
            <div className="space-y-2">
              <label htmlFor="job-link" className="text-sm text-gray-600">
                Job listing
              </label>
              <Input
                id="job-link"
                type="url"
                {...register("jobLink")}
                placeholder="https://..."
                disabled={isLoading}
              />
              {errors.jobLink && (
                <p className="text-sm text-red-600">{errors.jobLink.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="portfolio-link"
                  className="text-sm text-gray-600"
                >
                  Portfolio
                </label>
                <Input
                  id="portfolio-link"
                  type="url"
                  {...register("portfolioLink")}
                  placeholder="https://..."
                  disabled={isLoading}
                />
                {errors.portfolioLink && (
                  <p className="text-sm text-red-600">
                    {errors.portfolioLink.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="github-link" className="text-sm text-gray-600">
                  GitHub
                </label>
                <Input
                  id="github-link"
                  type="url"
                  {...register("gitHubLink")}
                  placeholder="https://github.com/..."
                  disabled={isLoading}
                />
                {errors.gitHubLink && (
                  <p className="text-sm text-red-600">
                    {errors.gitHubLink.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-100 bg-red-50 p-4">
            <p className="text-sm text-red-600">
              {error instanceof Error
                ? error.message
                : "Unable to create the job application. Please try again."}
            </p>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={closeModal}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create job application"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default CreateJobApplicationForm;
