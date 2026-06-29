import { t } from 'i18next';
import { useId } from 'react';

import { cn } from '@/lib/utils';

export function WorkflowCompositionBar({
  published,
  draft,
  paused,
}: WorkflowCompositionBarProps) {
  const total = Math.max(1, published + draft + paused);
  const segments = [
    {
      key: 'published',
      label: t('Published'),
      value: published,
      bar: 'bg-primary-600',
      dot: 'bg-primary-600',
    },
    {
      key: 'draft',
      label: t('Draft'),
      value: draft,
      bar: 'bg-gray-300',
      dot: 'bg-gray-300',
    },
    {
      key: 'paused',
      label: t('Paused'),
      value: paused,
      bar: 'bg-warning-500',
      dot: 'bg-warning-500',
    },
  ].filter((segment) => segment.value > 0);

  return (
    <div data-slot="workflow-composition" className="flex flex-col gap-2">
      <div className="flex h-[7px] w-full gap-0.5 overflow-hidden rounded-full">
        {segments.map((segment) => (
          <span
            key={segment.key}
            className={cn('h-full rounded-full', segment.bar)}
            style={{ width: `${(segment.value / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-[11.5px] text-gray-600 dark:text-gray-300">
        {segments.map((segment) => (
          <span key={segment.key} className="inline-flex items-center gap-1.5">
            <span className={cn('size-2 rounded-[3px]', segment.dot)} />
            {segment.label}{' '}
            <b className="font-semibold text-foreground">{segment.value}</b>
          </span>
        ))}
      </div>
    </div>
  );
}

export function RunsSparkline({ values }: RunsSparklineProps) {
  const gradientId = useId().replace(/:/g, '');
  const width = 240;
  const height = 40;
  const pad = 4;

  if (values.length < 2) {
    return <div className="h-10" />;
  }

  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const points: Point[] = values.map((value, index) => [
    pad + (index * (width - 2 * pad)) / (values.length - 1),
    height - pad - ((value - min) / span) * (height - 2 * pad),
  ]);
  const line = smoothPath(points);
  const last = points[points.length - 1];
  const area = `${line} L ${last[0].toFixed(
    1,
  )} ${height} L ${points[0][0].toFixed(1)} ${height} Z`;

  return (
    <svg
      data-slot="runs-sparkline"
      aria-hidden="true"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="h-10 w-full"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0"
            stopColor="hsl(var(--primary-500))"
            stopOpacity="0.22"
          />
          <stop
            offset="1"
            stopColor="hsl(var(--primary-500))"
            stopOpacity="0"
          />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke="hsl(var(--primary-600))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={last[0].toFixed(1)}
        cy={last[1].toFixed(1)}
        r="2.4"
        fill="hsl(var(--primary-600))"
      />
    </svg>
  );
}

export function FailureRatioBar({ succeeded, failed }: FailureRatioBarProps) {
  const total = succeeded + failed;
  const okPercent = total === 0 ? 100 : (succeeded / total) * 100;

  return (
    <div
      data-slot="failure-ratio"
      className="flex h-2 w-full overflow-hidden rounded-full bg-destructive-100"
    >
      <span
        className="h-full bg-success-500"
        style={{ width: `${okPercent}%` }}
      />
      <span
        className="h-full bg-destructive-500"
        style={{ width: `${100 - okPercent}%` }}
      />
    </div>
  );
}

function smoothPath(points: Point[]): string {
  if (points.length < 2) {
    return `M ${points[0][0]} ${points[0][1]}`;
  }
  let d = `M ${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? points[i + 1];
    const c1x = p1[0] + ((p2[0] - p0[0]) / 6) * 1;
    const c1y = p1[1] + ((p2[1] - p0[1]) / 6) * 1;
    const c2x = p2[0] - ((p3[0] - p1[0]) / 6) * 1;
    const c2y = p2[1] - ((p3[1] - p1[1]) / 6) * 1;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(
      2,
    )} ${c2y.toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d;
}

type Point = [number, number];

type WorkflowCompositionBarProps = {
  published: number;
  draft: number;
  paused: number;
};

type RunsSparklineProps = {
  values: number[];
};

type FailureRatioBarProps = {
  succeeded: number;
  failed: number;
};
