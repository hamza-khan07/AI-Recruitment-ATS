import type { HTMLAttributes } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface DashboardCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string;
  description: string;
  icon: string;
  trend: string;
}

export function DashboardCard({ title, value, description, icon, trend, className, ...props }: DashboardCardProps) {
  return (
    <Card className={"rounded-3xl p-6 " + (className ?? "")} {...props}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-zinc-100 text-2xl dark:bg-zinc-900">
          {icon}
        </div>
        <div className="rounded-2xl bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
          {trend}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">{title}</p>
        <p className="mt-4 text-3xl font-semibold text-zinc-950 dark:text-white">{value}</p>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{description}</p>
      </div>

      <CardFooter className="mt-6 rounded-3xl bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
        Trend placeholder
      </CardFooter>
    </Card>
  );
}
