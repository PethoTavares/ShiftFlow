import { Badge } from "@/components/ui/badge";

const variantsByStatus: Record<string, "neutral" | "success" | "warning" | "danger"> = {
  ACTIVE: "success",
  INACTIVE: "danger",
  DRAFT: "neutral",
  UPCOMING: "warning",
  OPEN: "warning",
  IN_PROGRESS: "warning",
  ASSIGNED: "warning",
  CONFIRMED: "success",
  COMPLETED: "neutral",
  CANCELLED: "danger",
  DECLINED: "danger",
  FULL: "success",
};

function formatLabel(status: string) {
  return status.replaceAll("_", " ");
}

type StatusBadgeProps = {
  status: string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant={variantsByStatus[status] ?? "neutral"}>{formatLabel(status)}</Badge>;
}
