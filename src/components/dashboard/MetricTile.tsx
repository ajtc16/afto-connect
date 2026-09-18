import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function MetricTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-2 font-display text-3xl font-semibold tabular-nums">
        {value}
      </p>
    </Card>
  );
}
