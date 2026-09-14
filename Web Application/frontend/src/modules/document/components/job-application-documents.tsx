import {
  CheckCircle2,
  Eye,
  FileText,
  FileUser,
  Files,
  RefreshCw,
  Upload,
} from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";
import {
  MODAL_VIEWS,
  useModalAction,
} from "@/common/components/modal/modal-context";
import { Button } from "@/common/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Spinner } from "@/common/components/ui/spinner";
import { formatDate } from "@/common/utils/date";
import { useAttachResume } from "@/modules/document/hooks/useAttachResume";
import { useResumes } from "@/modules/document/hooks/useResumes";
import { useUploadCoverLetter } from "@/modules/document/hooks/useUploadCoverLetter";
import { useUploadResume } from "@/modules/document/hooks/useUploadResume";
import type {
  DocumentPreviewKind,
  DocumentPreviewPayload,
} from "@/modules/document/model/document-preview";
import { JobApplicationDetailResponse } from "@/modules/job-application/model/responses";

const DOCUMENT_ACCEPT = ".pdf,.doc,.docx";
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];

const validateDocumentFile = (file: File): string | null => {
  const normalizedName = file.name.trim();
  const extension = normalizedName
    .slice(normalizedName.lastIndexOf("."))
    .toLowerCase();

  if (!normalizedName) {
    return "Select a file to upload.";
  }

  if (normalizedName.length > 255) {
    return "The filename cannot exceed 255 characters.";
  }

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return "Only PDF, DOC, and DOCX files are supported.";
  }

  return null;
};

interface JobApplicationDocumentsProps {
  application: JobApplicationDetailResponse;
}

const JobApplicationDocuments = ({
  application,
}: JobApplicationDocumentsProps) => {
  const { openModal } = useModalAction();
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const coverLetterInputRef = useRef<HTMLInputElement>(null);
  const [resumeFileError, setResumeFileError] = useState<string | null>(null);
  const [coverLetterFileError, setCoverLetterFileError] = useState<
    string | null
  >(null);
  const {
    data: resumes = [],
    isPending: isLoadingResumes,
    isFetching: isRefreshingResumes,
    error: resumesError,
    refetch: refetchResumes,
  } = useResumes();
  const {
    attachResume,
    isAttaching,
    error: attachError,
    reset: resetAttach,
  } = useAttachResume(application.id);
  const {
    uploadResume,
    isUploading: isUploadingResume,
    error: resumeUploadError,
    reset: resetResumeUpload,
  } = useUploadResume(application.id);
  const {
    uploadCoverLetter,
    isUploading: isUploadingCoverLetter,
    error: coverLetterUploadError,
    reset: resetCoverLetterUpload,
  } = useUploadCoverLetter(application.id, Boolean(application.coverLetter));

  const isResumeBusy = isAttaching || isUploadingResume;

  const openDocumentPreview = (documentKind: DocumentPreviewKind) => {
    const payload: DocumentPreviewPayload = {
      jobApplicationId: application.id,
      documentKind,
    };

    openModal(MODAL_VIEWS.PREVIEW_DOCUMENT, payload);
  };

  const handleResumeSelection = (resumeId: string) => {
    if (resumeId === application.resume?.id) {
      return;
    }

    setResumeFileError(null);
    resetAttach();
    resetResumeUpload();
    attachResume(resumeId);
  };

  const handleResumeFile = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length !== 1) {
      setResumeFileError("Select exactly one resume file.");
      return;
    }

    const file = files[0];
    const validationError = validateDocumentFile(file);

    if (validationError) {
      setResumeFileError(validationError);
      return;
    }

    setResumeFileError(null);
    resetAttach();
    resetResumeUpload();
    uploadResume(file);
  };

  const handleCoverLetterFile = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length !== 1) {
      setCoverLetterFileError("Select exactly one cover letter file.");
      return;
    }

    const file = files[0];
    const validationError = validateDocumentFile(file);

    if (validationError) {
      setCoverLetterFileError(validationError);
      return;
    }

    setCoverLetterFileError(null);
    resetCoverLetterUpload();
    uploadCoverLetter(file);
  };

  const resumeError =
    resumeFileError ?? attachError?.message ?? resumeUploadError?.message;
  const coverLetterError =
    coverLetterFileError ?? coverLetterUploadError?.message;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
          <Files className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-950">
            Application documents
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Record the exact resume and cover letter used for this opportunity.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="flex flex-col rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-primary-50/40 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-800">
              <FileUser className="h-5 w-5" />
            </div>
            {application.resume && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Recorded
              </span>
            )}
          </div>

          <div className="mt-4 min-h-16">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
              Resume
            </p>
            {application.resume ? (
              <button
                type="button"
                onClick={() => openDocumentPreview("resume")}
                className="group mt-1 flex max-w-full items-center gap-2 text-left font-semibold text-primary-700 outline-none hover:text-primary-900 focus-visible:rounded focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                aria-label={`Preview current resume ${application.resume.fileName}`}
              >
                <span className="break-all underline decoration-primary-200 underline-offset-4 group-hover:decoration-primary-600">
                  {application.resume.fileName}
                </span>
                <Eye className="h-4 w-4 shrink-0" />
              </button>
            ) : (
              <p className="mt-1 font-semibold text-gray-950">Not recorded</p>
            )}
            {application.resume && (
              <p className="mt-1 text-xs text-gray-500">
                Selected {formatDate(application.resume.createdAtUtc, "short")}
              </p>
            )}
          </div>

          <div className="mt-5 space-y-2">
            <label
              htmlFor="resume-version-select"
              className="text-xs font-semibold text-gray-700"
            >
              Select a saved resume
            </label>
            <Select
              value={application.resume?.id ?? ""}
              onValueChange={handleResumeSelection}
              disabled={
                isLoadingResumes || isResumeBusy || resumes.length === 0
              }
            >
              <SelectTrigger
                id="resume-version-select"
                className="rounded-xl bg-white"
              >
                <SelectValue
                  placeholder={
                    isLoadingResumes
                      ? "Loading resumes..."
                      : resumes.length === 0
                        ? "No saved resumes"
                        : "Choose a resume"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {resumes.length === 0 ? (
                  <SelectItem value="no-resumes" disabled>
                    No saved resumes
                  </SelectItem>
                ) : (
                  resumes.map((resume) => (
                    <SelectItem key={resume.id} value={resume.id}>
                      {resume.fileName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {resumesError && (
            <div className="mt-3 rounded-xl border border-rose-100 bg-rose-50 p-3">
              <p className="text-xs leading-5 text-rose-700">
                {resumesError.message}
              </p>
              <button
                type="button"
                onClick={() => void refetchResumes()}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:underline"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Try loading again
              </button>
            </div>
          )}

          {resumeError && (
            <p
              role="alert"
              className="mt-3 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-700"
            >
              {resumeError}
            </p>
          )}

          <div className="mt-auto pt-5">
            <input
              ref={resumeInputRef}
              type="file"
              accept={DOCUMENT_ACCEPT}
              onChange={handleResumeFile}
              className="sr-only"
              aria-label="Choose one resume to upload"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-xl bg-white"
              disabled={isResumeBusy}
              onClick={() => resumeInputRef.current?.click()}
            >
              {isUploadingResume ? (
                <>
                  <Spinner size="sm" className="border-t-primary-600" />
                  Uploading resume...
                </>
              ) : isAttaching ? (
                <>
                  <Spinner size="sm" className="border-t-primary-600" />
                  Selecting resume...
                </>
              ) : (
                <>
                  <Upload />
                  Upload resume
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-col rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-secondary-50/50 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary-100 text-secondary-700">
              <FileText className="h-5 w-5" />
            </div>
            {application.coverLetter && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Recorded
              </span>
            )}
          </div>

          <div className="mt-4 min-h-16">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
              Cover letter
            </p>
            {application.coverLetter ? (
              <button
                type="button"
                onClick={() => openDocumentPreview("cover-letter")}
                className="group mt-1 flex max-w-full items-center gap-2 text-left font-semibold text-secondary-700 outline-none hover:text-secondary-900 focus-visible:rounded focus-visible:ring-2 focus-visible:ring-secondary-500 focus-visible:ring-offset-2"
                aria-label={`Preview current cover letter ${application.coverLetter.fileName}`}
              >
                <span className="break-all underline decoration-secondary-200 underline-offset-4 group-hover:decoration-secondary-600">
                  {application.coverLetter.fileName}
                </span>
                <Eye className="h-4 w-4 shrink-0" />
              </button>
            ) : (
              <p className="mt-1 font-semibold text-gray-950">Not recorded</p>
            )}
            {application.coverLetter && (
              <p className="mt-1 text-xs text-gray-500">
                {application.coverLetter.updatedAtUtc
                  ? `Changed ${formatDate(application.coverLetter.updatedAtUtc, "short")}`
                  : `Uploaded ${formatDate(application.coverLetter.createdAtUtc, "short")}`}
              </p>
            )}
          </div>

          <div className="mt-5 rounded-xl border border-dashed border-secondary-200 bg-white/70 px-4 py-3 text-xs leading-5 text-gray-600">
            Uploading a new file replaces the cover letter recorded for this
            application.
          </div>

          {coverLetterError && (
            <p
              role="alert"
              className="mt-3 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-700"
            >
              {coverLetterError}
            </p>
          )}

          <div className="mt-auto pt-5">
            <input
              ref={coverLetterInputRef}
              type="file"
              accept={DOCUMENT_ACCEPT}
              onChange={handleCoverLetterFile}
              className="sr-only"
              aria-label="Choose one cover letter to upload"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-xl bg-white"
              disabled={isUploadingCoverLetter}
              onClick={() => coverLetterInputRef.current?.click()}
            >
              {isUploadingCoverLetter ? (
                <>
                  <Spinner size="sm" className="border-t-secondary-600" />
                  Uploading cover letter...
                </>
              ) : (
                <>
                  <Upload />
                  {application.coverLetter
                    ? "Change cover letter"
                    : "Upload cover letter"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-500">
        PDF, DOC, or DOCX only. Upload one file at a time.
        {isRefreshingResumes && !isLoadingResumes && " Refreshing resumes..."}
      </p>
    </section>
  );
};

export default JobApplicationDocuments;
