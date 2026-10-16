import { RefreshCw } from "lucide-react";
import {
  MODAL_VIEWS,
  useModalAction,
} from "@/common/components/modal/modal-context";
import { Button } from "@/common/components/ui/button";
import DashboardHero from "@/modules/dashboard/components/dashboard-hero";
import OverdueFollowUpsWidget from "@/modules/dashboard/components/overdue-follow-ups-widget";
import PlatformBreakdown from "@/modules/dashboard/components/platform-breakdown";
import StatusDistribution from "@/modules/dashboard/components/status-distribution";
import UpcomingInterviewsWidget from "@/modules/dashboard/components/upcoming-interviews-widget";
import { useDashboardSummary } from "@/modules/dashboard/hooks/useDashboardSummary";

const DashboardSkeleton = () => (
  <div className="mx-auto max-w-7xl animate-pulse space-y-6">
    <div className="grid min-h-96 gap-10 py-8 lg:grid-cols-2 lg:items-center">
      <div>
        <div className="h-7 w-56 rounded-full bg-gray-200" />
        <div className="mt-8 h-14 w-full max-w-xl rounded-2xl bg-gray-200" />
        <div className="mt-3 h-14 w-3/4 rounded-2xl bg-gray-200" />
        <div className="mt-7 h-12 w-48 rounded-full bg-gray-200" />
      </div>
      <div className="mx-auto h-72 w-72 rounded-full border-[3rem] border-gray-100 bg-gray-200" />
    </div>
    <div className="h-72 rounded-[1.75rem] border border-gray-200 bg-white" />
    <div className="grid gap-6 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-96 rounded-[1.75rem] border border-gray-200 bg-white"
        />
      ))}
    </div>
  </div>
);

const DashboardPage = () => {
  const { openModal } = useModalAction();
  const { data, isPending, isFetching, error, refetch } = useDashboardSummary();

  if (isPending) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <DashboardSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto flex min-h-[32rem] max-w-3xl flex-col items-center justify-center rounded-[2rem] border border-rose-100 bg-gradient-to-br from-white to-rose-50/60 px-6 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
            <RefreshCw className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-xl font-semibold text-gray-950">
            Your dashboard could not be loaded
          </h1>
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
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <DashboardHero
          activeApplicationCount={data.activeApplicationCount}
          upcomingInterviewCount={data.upcomingInterviews.length}
          overdueFollowUpCount={data.overdueFollowUps.length}
          onAddOpportunity={() => openModal(MODAL_VIEWS.CREATE_JOB_APPLICATION)}
        />

        {isFetching && (
          <div className="flex items-center justify-end gap-2 text-xs text-gray-500">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            Refreshing dashboard
          </div>
        )}

        <StatusDistribution
          total={data.activeApplicationCount}
          counts={data.applicationsByStatus}
        />

        <div className="grid items-start gap-6 xl:grid-cols-3">
          <PlatformBreakdown platforms={data.applicationsByPlatform} />
          <UpcomingInterviewsWidget interviews={data.upcomingInterviews} />
          <OverdueFollowUpsWidget followUps={data.overdueFollowUps} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
