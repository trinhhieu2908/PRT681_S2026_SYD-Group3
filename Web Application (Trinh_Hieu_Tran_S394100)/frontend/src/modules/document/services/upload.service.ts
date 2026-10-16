import { StorageContext } from "@/modules/document/model/requests";
import { UploadPresignedUrlResponse } from "@/modules/document/model/responses";
import { documentApi } from "@/modules/document/services/api.service";

export const uploadSingleDocument = async (
  file: File,
  context: StorageContext,
): Promise<UploadPresignedUrlResponse> => {
  const response = await documentApi.generateUploadPresignedUrls({
    context,
    fileNames: [file.name],
  });

  if (response.uploads.length !== 1) {
    throw new Error("The server did not return a valid single-file upload.");
  }

  const upload = response.uploads[0];
  await documentApi.uploadToPresignedUrl(file, upload);

  return upload;
};
