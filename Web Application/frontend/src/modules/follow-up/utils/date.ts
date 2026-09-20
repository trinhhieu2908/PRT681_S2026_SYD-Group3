export type FollowUpUrgency = "overdue" | "today" | "upcoming";

const millisecondsPerDay = 86_400_000;

const getTodayUtcKey = () => new Date().toISOString().slice(0, 10);

export const getFollowUpTiming = (
  dueDate: string,
  isOverdue: boolean,
): { urgency: FollowUpUrgency; label: string } => {
  const differenceInDays = Math.round(
    (Date.parse(`${dueDate}T00:00:00Z`) -
      Date.parse(`${getTodayUtcKey()}T00:00:00Z`)) /
      millisecondsPerDay,
  );

  if (isOverdue || differenceInDays < 0) {
    const overdueDays = Math.abs(differenceInDays);
    return {
      urgency: "overdue",
      label: `${overdueDays} day${overdueDays === 1 ? "" : "s"} overdue`,
    };
  }

  if (differenceInDays === 0) {
    return { urgency: "today", label: "Due today" };
  }

  if (differenceInDays === 1) {
    return { urgency: "upcoming", label: "Due tomorrow" };
  }

  return { urgency: "upcoming", label: `Due in ${differenceInDays} days` };
};
