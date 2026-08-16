import { Inbox } from "lucide-react";

interface NoContentProps {
  message?: string;
}

export const NoContent = ({ message }: NoContentProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-4 px-6 text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mb-3">
        <Inbox className="w-8 h-8 text-secondary-500" />
      </div>

      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        {message || "No content available"}
      </h3>
    </div>
  );
};
