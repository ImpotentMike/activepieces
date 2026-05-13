import { cva, type VariantProps } from 'class-variance-authority';
import { t } from 'i18next';
import * as React from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const pillVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center rounded-full border border-transparent font-medium whitespace-nowrap',
  {
    variants: {
      status: {
        running: 'bg-primary-100 text-primary-800',
        success: 'bg-success-100 text-success-700',
        failed: 'bg-destructive-100 text-destructive-700',
        waiting: 'bg-warning-100 text-warning-700',
        draft: 'bg-background text-gray-700 border-gray-300',
        published: 'bg-success-100 text-success-700',
        paused: 'bg-warning-100 text-warning-700',
        unpublished: 'bg-gray-100 text-gray-600',
      },
      size: {
        md: 'gap-1.5 px-2.5 py-0.5 text-xs leading-[18px]',
        sm: 'gap-[5px] px-2 py-px text-[11px] leading-4',
      },
    },
    defaultVariants: {
      status: 'success',
      size: 'md',
    },
  },
);

const dotVariants = cva('shrink-0 rounded-full motion-reduce:animate-none', {
  variants: {
    status: {
      running: 'bg-primary-600 animate-pf-pulse',
      success: 'bg-success-600',
      failed: 'bg-destructive-600',
      waiting: 'bg-warning-600 animate-pf-pulse',
      draft: 'bg-gray-400',
      published: 'bg-success-600',
      paused: 'bg-warning-600',
      unpublished: 'bg-gray-400',
    },
    size: {
      md: 'size-1.5',
      sm: 'size-[5px]',
    },
  },
  defaultVariants: {
    status: 'success',
    size: 'md',
  },
});

function PfStatusPill({
  status,
  size = 'md',
  withDot = true,
  tooltip,
  scope,
  label,
  className,
  children,
  'aria-label': ariaLabelProp,
  ...spanProps
}: PfStatusPillProps) {
  const visibleLabel = children ?? label ?? t(STATUS_LABEL_KEY[status]);
  const resolvedScope = scope ?? STATUS_SCOPE[status];
  const ariaLabel =
    ariaLabelProp ??
    (resolvedScope === 'run'
      ? `${t('Run status')}: ${visibleLabel}`
      : `${t('Workflow status')}: ${visibleLabel}`);

  const isLiveState = status === 'running' || status === 'waiting';

  const pill = (
    <span
      data-slot="pf-status-pill"
      data-status={status}
      data-size={size}
      role={isLiveState ? 'status' : undefined}
      aria-label={ariaLabel}
      className={cn(pillVariants({ status, size }), className)}
      {...spanProps}
    >
      {withDot ? (
        <span
          aria-hidden="true"
          className={cn(dotVariants({ status, size }))}
        />
      ) : null}
      {visibleLabel}
    </span>
  );

  if (!tooltip) return pill;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0} className="inline-flex outline-none">
          {pill}
        </span>
      </TooltipTrigger>
      <TooltipContent role="tooltip">{tooltip}</TooltipContent>
    </Tooltip>
  );
}

const STATUS_LABEL_KEY: Record<PfStatusPillStatus, string> = {
  running: 'Running',
  success: 'Success',
  failed: 'Failed',
  waiting: 'Waiting',
  draft: 'Draft',
  published: 'Published',
  paused: 'Paused',
  unpublished: 'Unpublished',
};

const STATUS_SCOPE: Record<PfStatusPillStatus, 'run' | 'workflow'> = {
  running: 'run',
  success: 'run',
  failed: 'run',
  waiting: 'run',
  draft: 'workflow',
  published: 'workflow',
  paused: 'workflow',
  unpublished: 'workflow',
};

export { PfStatusPill, pillVariants as pfStatusPillVariants };

export type PfStatusPillStatus =
  | 'running'
  | 'success'
  | 'failed'
  | 'waiting'
  | 'draft'
  | 'published'
  | 'paused'
  | 'unpublished';

export type PfStatusPillSize = 'md' | 'sm';

export type PfStatusPillProps = Omit<React.ComponentProps<'span'>, 'children'> &
  Omit<VariantProps<typeof pillVariants>, 'status' | 'size'> & {
    status: PfStatusPillStatus;
    size?: PfStatusPillSize;
    withDot?: boolean;
    tooltip?: React.ReactNode;
    scope?: 'run' | 'workflow';
    label?: React.ReactNode;
    children?: React.ReactNode;
  };
