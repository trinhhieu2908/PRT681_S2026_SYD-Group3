export type DocumentPreviewKind = "resume" | "cover-letter";

export interface DocumentPreviewPayload {
  jobApplicationId: string;
  documentKind: DocumentPreviewKind;
}

export const isDocumentPreviewPayload = (
  value: unknown,
): value is DocumentPreviewPayload => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<DocumentPreviewPayload>;

  return (
    typeof payload.jobApplicationId === "string" &&
    (payload.documentKind === "resume" ||
      payload.documentKind === "cover-letter")
  );
};
