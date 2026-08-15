import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/common/components/ui/tooltip";
import { cn } from "@/common/utils";
import { RotateCcw } from "lucide-react";

interface RefreshButtonProps {
  refetch: () => void;
  isRefetching: boolean;
  size?: "sm" | "md" | "lg";
}
export const RefreshButton = ({
  refetch,
  isRefetching,
  size = "md",
}: RefreshButtonProps) => {
  const handleRefreshProject = () => {
    refetch();
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className="bg-transparent"
          onClick={handleRefreshProject}
          disabled={isRefetching}
        >
          <RotateCcw
            className={cn(
              "w-7 h-7",
              size === "sm" && "w-5 h-5",
              size === "lg" && "w-9 h-9",
              isRefetching && "animate-[spin_1s_linear_infinite_reverse]",
            )}
          />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Refresh</p>
      </TooltipContent>
    </Tooltip>
  );
};
