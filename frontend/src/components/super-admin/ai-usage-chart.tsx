import { Card, CardContent, CardHeader } from "@/components/ui/card";

export interface AiUsageSeriesPoint {
  month: string;
  descriptions: number;
  summaries: number;
}

interface AiUsageChartProps {
  title: string;
  description: string;
  data: AiUsageSeriesPoint[];
}

const CHART_HEIGHT = 220;
const CHART_PADDING = 24;

function createPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return "";
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");
}

function getCoordinates(data: AiUsageSeriesPoint[]) {
  const xStep = data.length > 1 ? (100 - CHART_PADDING * 2) / (data.length - 1) : 0;
  const maxValue = Math.max(...data.map((item) => Math.max(item.descriptions, item.summaries)), 1);

  return data.map((item, index) => {
    const x = CHART_PADDING + index * xStep;
    return {
      month: item.month,
      x,
      descriptionsY: CHART_HEIGHT - CHART_PADDING - (item.descriptions / maxValue) * (CHART_HEIGHT - CHART_PADDING * 2),
      summariesY: CHART_HEIGHT - CHART_PADDING - (item.summaries / maxValue) * (CHART_HEIGHT - CHART_PADDING * 2),
    };
  });
}

export function AiUsageChart({ title, description, data }: AiUsageChartProps) {
  const coordinates = getCoordinates(data);
  const descriptionsPath = createPath(coordinates.map((item) => ({ x: item.x, y: item.descriptionsY })));
  const summariesPath = createPath(coordinates.map((item) => ({ x: item.x, y: item.summariesY })));

  return (
    <Card className="rounded-[1.75rem] border-zinc-200 dark:border-zinc-800">
      <CardHeader className="border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-3xl font-semibold text-zinc-950 dark:text-white">Monthly AI Usage</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Usage trends for AI generation activity.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-2 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
              Descriptions
            </div>
            <div className="flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-2 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
              Summaries
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.5rem] bg-zinc-50 p-4 dark:bg-zinc-900">
          <svg viewBox="0 0 100 220" className="h-[220px] w-full">
            <defs>
              <linearGradient id="descriptions-gradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.24" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="summaries-gradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.24" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
              </linearGradient>
            </defs>

            <path
              d={`${descriptionsPath} L ${coordinates[coordinates.length - 1].x} ${CHART_HEIGHT - CHART_PADDING} L ${coordinates[0].x} ${CHART_HEIGHT - CHART_PADDING} Z`}
              fill="url(#descriptions-gradient)"
              opacity="0.75"
            />
            <path
              d={`${summariesPath} L ${coordinates[coordinates.length - 1].x} ${CHART_HEIGHT - CHART_PADDING} L ${coordinates[0].x} ${CHART_HEIGHT - CHART_PADDING} Z`}
              fill="url(#summaries-gradient)"
              opacity="0.75"
            />

            <path
              d={descriptionsPath}
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={summariesPath}
              fill="none"
              stroke="#f97316"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <g className="text-zinc-400 dark:text-zinc-500" fill="currentColor">
              {coordinates.map((item) => (
                <text key={item.month} x={item.x} y={CHART_HEIGHT - 6} fontSize="3.5" textAnchor="middle">
                  {item.month}
                </text>
              ))}
            </g>
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}
