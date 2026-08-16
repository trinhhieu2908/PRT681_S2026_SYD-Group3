import { FileText, Upload } from "lucide-react";

export const NoFileContent = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <FileText className="w-8 h-8 text-gray-400" />
      </div>

      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No files uploaded yet
      </h3>

      <p className="text-sm text-gray-500 mb-6 max-w-sm">
        Get started by uploading your first document.
        <span className="block">Only support PDF format.</span>
      </p>

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Upload className="w-4 h-4" />
        <span>Click the upload button above to add files</span>
      </div>
    </div>
  );
};
