import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

import { cn } from '@/lib/utils';

import { PfTrend } from '../../dashboard/lib/dashboard-data';

export function RndTrendPill({
  direction,
  value,
  invert = false,
  className,
}: RndTrendPillProps) {
  const Icon =
    direction === 'up'
      ? ArrowUpRight
      : direction === 'down'
      ? ArrowDownRight
      : Minus;
  const isGood =
    direction === 'flat'
      ? null
      : invert
      ? direction === 'down'
      : direction === 'up';

  return (
    <span
      data-slot="rnd-trend-pill"
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full px-2 py-[3px] text-[11.5px] font-semibold leading-none tabular-nums',
        isGood === null && 'bg-gray-100 text-gray-600',
        isGood === true && 'bg-success-100 text-success-700',
        isGood === false && 'bg-destructive-100 text-destructive-700',
        className,
      )}
    >
      <Icon className="size-3" />
      {value}
    </span>
  );
}

export type RndTrendPillProps = PfTrend & {
  invert?: boolean;
  className?: string;
};
