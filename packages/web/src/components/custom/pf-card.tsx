import { cva, type VariantProps } from 'class-variance-authority';
import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  MoreHorizontal,
} from 'lucide-react';
import { Slot } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { PfStatusPill, type PfStatusPillStatus } from './pf-status-pill';

const cardVariants = cva(
  'relative flex w-full min-w-0 flex-col rounded-xl border border-gray-200 bg-background text-left text-foreground shadow-xs transition-[border-color,box-shadow,transform] duration-150 ease-out',
  {
    variants: {
      variant: {
        default: '',
        clickable:
          'cursor-pointer hover:-translate-y-px hover:border-gray-300 hover:shadow-md focus-visible:border-primary-600 focus-visible:ring-[3px] focus-visible:ring-primary-600/35 focus-visible:outline-none focus-visible:shadow-md',
        disabled: 'cursor-not-allowed bg-gray-50 opacity-60',
      },
      density: {
        default: 'gap-3.5 p-5',
        compact: 'gap-2.5 p-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      density: 'default',
    },
  },
);

function PfCard({
  className,
  variant,
  density,
  asChild = false,
  ...props
}: PfCardProps) {
  const Comp = asChild ? Slot.Root : 'div';
  return (
    <Comp
      data-slot="pf-card"
      data-variant={variant ?? 'default'}
      className={cn(cardVariants({ variant, density }), className)}
      {...props}
    />
  );
}

function PfCardHead({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="pf-card-head"
      className={cn('flex min-w-0 items-start gap-3', className)}
      {...props}
    />
  );
}

function PfCardMark({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="pf-card-mark"
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-700 text-[11px] font-bold text-primary-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function PfCardTitleWrap({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="pf-card-title-wrap"
      className={cn('flex min-w-0 flex-1 flex-col', className)}
      {...props}
    />
  );
}

function PfCardTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return (
    <h3
      data-slot="pf-card-title"
      className={cn(
        'm-0 line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight break-words text-foreground',
        className,
      )}
      {...props}
    />
  );
}

function PfCardSubtitle({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="pf-card-subtitle"
      className={cn(
        'mt-0.5 line-clamp-1 text-[12.5px] text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

function PfCardDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="pf-card-description"
      className={cn(
        'm-0 line-clamp-3 text-[13px] leading-normal text-gray-700 dark:text-gray-300',
        className,
      )}
      {...props}
    />
  );
}

function PfCardMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="pf-card-menu-trigger"
      aria-hidden="true"
      className={cn(
        'inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground',
        className,
      )}
      {...props}
    >
      {children ?? <MoreHorizontal className="size-3.5" />}
    </span>
  );
}

function PfCardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="pf-card-footer"
      className={cn(
        'mt-auto flex items-center justify-between gap-2 border-t border-gray-100 pt-3',
        className,
      )}
      {...props}
    />
  );
}

function PfCardMeta({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="pf-card-meta"
      className={cn(
        'mt-auto flex flex-col gap-2 border-t border-gray-100 pt-3 text-[12.5px] text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

function PfCardMetaRow({
  label,
  icon: Icon,
  children,
  className,
  ...props
}: PfCardMetaRowProps) {
  return (
    <div
      data-slot="pf-card-meta-row"
      className={cn('flex items-center justify-between gap-2', className)}
      {...props}
    >
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        {Icon ? <Icon className="size-3.5 shrink-0" /> : null}
        {label}
      </span>
      <span className="inline-flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-200">
        {children}
      </span>
    </div>
  );
}

function PfStatCard({
  label,
  value,
  unit,
  trend,
  footnote,
  className,
  ...props
}: PfStatCardProps) {
  return (
    <PfCard
      density="compact"
      data-pf-card-variant="stat"
      className={cn(className)}
      {...props}
    >
      <p className="m-0 text-[12.5px] font-medium text-muted-foreground">
        {label}
      </p>
      <div className="flex items-end justify-between gap-3">
        <h2 className="m-0 text-3xl font-semibold leading-[1.05] tracking-tight text-foreground">
          {value}
          {unit ? (
            <span className="ml-1 text-sm font-medium text-muted-foreground">
              {unit}
            </span>
          ) : null}
        </h2>
        {trend ? <PfStatTrend {...trend} /> : null}
      </div>
      {footnote ? (
        <p className="m-0 text-[11.5px] text-muted-foreground">{footnote}</p>
      ) : null}
    </PfCard>
  );
}

function PfStatTrend({ direction, value }: PfStatTrendProps) {
  const Icon =
    direction === 'up'
      ? ArrowUpRight
      : direction === 'down'
      ? ArrowDownRight
      : Minus;
  return (
    <span
      data-slot="pf-stat-trend"
      data-direction={direction}
      className={cn(
        'inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 font-mono text-xs font-medium',
        direction === 'up' && 'bg-success-100 text-success-700',
        direction === 'down' && 'bg-destructive-100 text-destructive-700',
        direction === 'flat' && 'bg-gray-100 text-gray-700',
      )}
    >
      <Icon className="size-3" />
      {value}
    </span>
  );
}

function PfTemplateCard({
  title,
  subtitle,
  description,
  tags,
  pieces,
  ctaLabel = 'Use template',
  className,
  ...props
}: PfTemplateCardProps) {
  return (
    <PfCard
      variant="clickable"
      data-pf-card-variant="template"
      className={cn('group', className)}
      asChild
      {...props}
    >
      <button type="button">
        <PfCardHead>
          <PfCardTitleWrap>
            <PfCardTitle>{title}</PfCardTitle>
            {subtitle ? <PfCardSubtitle>{subtitle}</PfCardSubtitle> : null}
          </PfCardTitleWrap>
          <PfCardMenuTrigger />
        </PfCardHead>
        {description ? (
          <PfCardDescription>{description}</PfCardDescription>
        ) : null}
        <PfCardFooter>
          <div className="flex items-center gap-2">
            {tags?.map((tag) => (
              <span
                key={tag.label}
                data-slot="pf-card-tag"
                data-variant={tag.variant ?? 'default'}
                className={cn(
                  'inline-flex items-center gap-1 rounded-md border px-2 py-px text-[11.5px] font-medium leading-[18px] whitespace-nowrap',
                  tag.variant === 'accent'
                    ? 'border-primary-100 bg-primary-50 text-primary-800'
                    : 'border-gray-200 bg-gray-100 text-gray-700',
                )}
              >
                {tag.label}
              </span>
            ))}
            {pieces && pieces.length > 0 ? (
              <span aria-hidden="true" className="inline-flex items-center">
                {pieces.map((piece, index) => (
                  <span
                    key={`${piece.label}-${index}`}
                    style={{ background: piece.color }}
                    className={cn(
                      'flex size-[22px] items-center justify-center rounded-sm border-[1.5px] border-background font-mono text-[10px] font-bold text-white',
                      index > 0 && '-ml-1.5',
                    )}
                  >
                    {piece.label}
                  </span>
                ))}
              </span>
            ) : null}
          </div>
          <span
            data-slot="pf-template-cta"
            className="pointer-events-none translate-y-0.5 text-[13px] font-medium text-primary-700 opacity-0 transition-[opacity,transform] duration-150 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
          >
            {ctaLabel} →
          </span>
        </PfCardFooter>
      </button>
    </PfCard>
  );
}

function PfProjectCard({
  mark,
  markColor,
  name,
  subtitle,
  description,
  workflows,
  members,
  lastRun,
  className,
  ...props
}: PfProjectCardProps) {
  return (
    <PfCard
      variant="clickable"
      data-pf-card-variant="project"
      className={cn(className)}
      asChild
      {...props}
    >
      <button type="button">
        <PfCardHead>
          <PfCardMark style={markColor ? { background: markColor } : undefined}>
            {mark}
          </PfCardMark>
          <PfCardTitleWrap>
            <PfCardTitle>{name}</PfCardTitle>
            {subtitle ? <PfCardSubtitle>{subtitle}</PfCardSubtitle> : null}
          </PfCardTitleWrap>
          <PfCardMenuTrigger />
        </PfCardHead>
        {description ? (
          <PfCardDescription>{description}</PfCardDescription>
        ) : null}
        <div className="mt-auto grid grid-cols-3 gap-2 border-t border-gray-100 pt-3">
          <PfProjectStat label="Workflows" value={workflows} />
          <PfProjectStat label="Members" value={members} />
          <PfProjectStat label="Last run" value={lastRun} />
        </div>
      </button>
    </PfCard>
  );
}

function PfProjectStat({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-px">
      <span className="text-lg font-semibold leading-none tracking-tight text-foreground">
        {value}
      </span>
      <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
    </div>
  );
}

function PfWorkflowCard({
  name,
  id,
  status,
  meta,
  disabled = false,
  className,
  ...props
}: PfWorkflowCardProps) {
  const Wrapper: React.ElementType = disabled ? 'div' : 'button';
  return (
    <PfCard
      variant={disabled ? 'disabled' : 'clickable'}
      data-pf-card-variant="workflow"
      className={cn(className)}
      asChild
      {...props}
    >
      <Wrapper {...(disabled ? { 'aria-disabled': true } : { type: 'button' })}>
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-col">
            <PfCardTitle className="text-[14.5px]">{name}</PfCardTitle>
            {id ? (
              <span className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                {id}
              </span>
            ) : null}
          </div>
          {status ? <PfStatusPill status={status} size="sm" /> : null}
        </div>
        {meta && meta.length > 0 ? (
          <PfCardMeta>
            {meta.map((row, index) => (
              <PfCardMetaRow
                key={`${row.label}-${index}`}
                label={row.label}
                icon={row.icon}
              >
                {row.value}
              </PfCardMetaRow>
            ))}
          </PfCardMeta>
        ) : null}
      </Wrapper>
    </PfCard>
  );
}

export {
  PfCard,
  PfCardDescription,
  PfCardFooter,
  PfCardHead,
  PfCardMark,
  PfCardMenuTrigger,
  PfCardMeta,
  PfCardMetaRow,
  PfCardSubtitle,
  PfCardTitle,
  PfCardTitleWrap,
  PfProjectCard,
  PfStatCard,
  PfTemplateCard,
  PfWorkflowCard,
  cardVariants as pfCardVariants,
};

export type PfCardVariant = 'default' | 'clickable' | 'disabled';

export type PfCardDensity = 'default' | 'compact';

export type PfCardProps = React.ComponentProps<'div'> &
  VariantProps<typeof cardVariants> & {
    asChild?: boolean;
  };

export type PfStatTrendProps = {
  direction: 'up' | 'down' | 'flat';
  value: React.ReactNode;
};

export type PfStatCardProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  label: React.ReactNode;
  value: React.ReactNode;
  unit?: React.ReactNode;
  trend?: PfStatTrendProps;
  footnote?: React.ReactNode;
};

export type PfTemplateCardPiece = {
  label: string;
  color: string;
};

export type PfTemplateCardTag = {
  label: string;
  variant?: 'default' | 'accent';
};

export type PfTemplateCardProps = Omit<
  React.ComponentProps<'button'>,
  'children'
> & {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  tags?: PfTemplateCardTag[];
  pieces?: PfTemplateCardPiece[];
  ctaLabel?: React.ReactNode;
};

export type PfProjectCardProps = Omit<
  React.ComponentProps<'button'>,
  'children'
> & {
  mark: React.ReactNode;
  markColor?: string;
  name: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  workflows: React.ReactNode;
  members: React.ReactNode;
  lastRun: React.ReactNode;
};

export type PfWorkflowCardMetaRow = {
  label: React.ReactNode;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
};

export type PfWorkflowCardProps = Omit<
  React.ComponentProps<'button'>,
  'children'
> & {
  name: React.ReactNode;
  id?: React.ReactNode;
  status?: PfStatusPillStatus;
  meta?: PfWorkflowCardMetaRow[];
  disabled?: boolean;
};

type PfCardMetaRowProps = React.ComponentProps<'div'> & {
  label: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
};
