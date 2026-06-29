import { t } from 'i18next';
import { ArrowUpRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import { PfCard } from '@/components/custom/pf-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { RndPlanUsage } from '../lib/rnd-dashboard-data';
import { rndStyles } from '../lib/rnd-styles';
import { usePrefersReducedMotion } from '../lib/use-prefers-reduced-motion';

export function PlanUsageCard({ usage, onViewBilling }: PlanUsageCardProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [width, setWidth] = useState(prefersReducedMotion ? usage.percent : 0);
  const isMetered = usage.kind === 'metered';
  const unit = t(usage.unitKey);

  useEffect(() => {
    if (prefersReducedMotion) {
      setWidth(usage.percent);
      return;
    }
    const id = requestAnimationFrame(() => setWidth(usage.percent));
    return () => cancelAnimationFrame(id);
  }, [usage.percent, prefersReducedMotion]);

  return (
    <PfCard data-slot="rnd-plan-usage" className={cn(rndStyles.panel, 'gap-4')}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <h3 className="m-0 text-[15px] font-semibold tracking-tight text-foreground">
            {t('Plan usage')}
          </h3>
          <p className="m-0 mt-0.5 text-[12.5px] text-muted-foreground">
            {isMetered
              ? t('Current billing period')
              : t('No limits on your plan')}
          </p>
        </div>
        {onViewBilling ? (
          <button
            type="button"
            onClick={onViewBilling}
            aria-label={t('View billing')}
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-gray-200 text-muted-foreground transition-colors hover:bg-gray-50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/40"
          >
            <ArrowUpRight className="size-4" />
          </button>
        ) : null}
      </div>

      {isMetered ? (
        <>
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-[26px] font-bold leading-none tracking-tight tabular-nums text-foreground">
                {nf(usage.used)}
                <span className="text-base font-semibold text-muted-foreground">
                  {` / ${nf(usage.limit ?? 0)}`}
                </span>
              </span>
              <span className="text-[12px] text-muted-foreground">{unit}</span>
            </div>
            <span
              className={cn(
                'text-[13px] font-semibold tabular-nums',
                percentToneClass(usage.percent),
              )}
            >
              {t('{percent}% used', { percent: usage.percent })}
            </span>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-primary-600 transition-[width] duration-700 ease-out motion-reduce:transition-none"
              style={{
                width: `${width}%`,
                backgroundImage: rndStyles.stripesAccent,
              }}
            />
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-2">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-1 text-[12px] font-semibold text-primary-700 dark:bg-primary-950/50 dark:text-primary-300">
            <span className="size-1.5 rounded-full bg-primary-500" />
            {t('Unlimited')}
          </span>
          <span className="text-[26px] font-bold leading-none tracking-tight tabular-nums text-foreground">
            {nf(usage.used)}
          </span>
          <span className="text-[12px] text-muted-foreground">{unit}</span>
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 pt-3.5">
        <span className="text-[12px] text-muted-foreground">
          {isMetered && usage.unitKey === 'AI credits'
            ? t('Resets in {count, plural, =1 {1 day} other {# days}}', {
                count: usage.resetInDays,
              })
            : t('Included with your plan')}
        </span>
        {onViewBilling ? (
          <Button variant="outline" size="sm" onClick={onViewBilling}>
            {t('View billing')}
          </Button>
        ) : null}
      </div>
    </PfCard>
  );
}

function percentToneClass(percent: number): string {
  if (percent >= 90) return 'text-destructive-600';
  if (percent >= 75) return 'text-warning-600';
  return 'text-primary-700 dark:text-primary-400';
}

function nf(value: number): string {
  return value.toLocaleString();
}

type PlanUsageCardProps = {
  usage: RndPlanUsage;
  onViewBilling?: () => void;
};
