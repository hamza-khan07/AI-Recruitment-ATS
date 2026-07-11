import { Card, CardContent, CardHeader } from "@/components/ui/card";

export type AnalyticsSeriesPoint = {
  label: string;
  value: number;
};

interface AnalyticsChartCardProps {
  title: string;
  description: string;
  data: AnalyticsSeriesPoint[];
  valueLabel: string;
  chartType: "area" | "bar";
  accentColor: string;
}

const CHART_HEIGHT = 220;
const CHART_PADDING = 24;

function normalizeData(data: AnalyticsSeriesPoint[]) {
  const values = data.map((item) => item.value);
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);
  const range = maxValue - minValue || 1;

  return data.map((item) => ({
    ...item,
    normalized: (item.value - minValue) / range,
  }));
}

function buildAreaPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return "";
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const last = points[points.length - 1];
  const first = points[0];
  return `${path} L ${last.x} ${CHART_HEIGHT - CHART_PADDING} L ${first.x} ${CHART_HEIGHT - CHART_PADDING} Z`;
}

export function AnalyticsChartCard({ title, description, data, valueLabel, chartType, accentColor }: AnalyticsChartCardProps) {
  const normalized = normalizeData(data);
  const columnWidth = data.length > 1 ? (100 - CHART_PADDING * 2) / (data.length - 1) : 0;

  return (
    <Card className="rounded-[1.75rem] border-zinc-200 dark:border-zinc-800">
      <CardHeader className="border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-3xl font-semibold text-zinc-950 dark:text-white">{valueLabel}</p>
          </div>
          <div className="rounded-2xl bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
            Last 30 days
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[1.5rem] bg-zinc-50 p-4 dark:bg-zinc-900">
          <svg viewBox={`0 0 100 ${CHART_HEIGHT}`} className="h-[220px] w-full">
            <defs>
              <linearGradient id={`gradient-${title.replace(/\s+/g, "-").toLowerCase()}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={accentColor} stopOpacity="0.32" />
                <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
              </linearGradient>
            </defs>

            {chartType === "area" && (
              <>
                <path
                  d={buildAreaPath(
                    normalized.map((item, index) => ({
                      x: CHART_PADDING + index * ((100 - CHART_PADDING * 2) / Math.max(1, data.length - 1)),
                      y: CHART_HEIGHT - CHART_PADDING - item.normalized * (CHART_HEIGHT - CHART_PADDING * 2),
                    }))
                  )}
                  fill={`url(#gradient-${title.replace(/\s+/g, "-").toLowerCase()})`}
                  stroke="none"
                />
                <path
                  d={normalized
                    .map((item, index) => {
                      const x = CHART_PADDING + index * ((100 - CHART_PADDING * 2) / Math.max(1, data.length - 1));
                      const y = CHART_HEIGHT - CHART_PADDING - item.normalized * (CHART_HEIGHT - CHART_PADDING * 2);
                      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke={accentColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}

            {chartType === "bar" && (
              <g>
                {normalized.map((item, index) => {
                  const x = CHART_PADDING + index * (columnWidth + 1.5);
                  const barHeight = item.normalized * (CHART_HEIGHT - CHART_PADDING * 2);
                  return (
                    <rect
                      key={item.label}
                      x={x}
                      y={CHART_HEIGHT - CHART_PADDING - barHeight}
                      width={columnWidth}
                      height={barHeight}
                      rx="3"
                      fill={accentColor}
                      opacity="0.88"
                    />
                  );
                })}
              </g>
            )}

            <g className="text-zinc-400 dark:text-zinc-500" fill="currentColor">
              {data.map((item, index) => {
                const x = CHART_PADDING + index * ((100 - CHART_PADDING * 2) / Math.max(1, data.length - 1));
                return (
                  <text key={item.label} x={x} y={CHART_HEIGHT - 6} fontSize="3.5" textAnchor="middle">
                    {item.label}
                  </text>
                );
              })}
            </g>
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}
