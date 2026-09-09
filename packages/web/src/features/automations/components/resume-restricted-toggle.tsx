import { t } from 'i18next';
import { useState } from 'react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * The toggle for a Paused workflow the current role may not resume.
 *
 * The switch stays in the same column position, off and visually disabled, so
 * the row shape is identical across every row — it is never removed.
 *
 * The explanation opens on hover AND on click. Click matters because disabled
 * controls are not hoverable on touch. A natively disabled control fires no
 * pointer events at all, so `pointer-events-none` moves them to the wrapper,
 * which is the anchor for both the tooltip and the popover.
 *
 * The next step is plain text rather than a link, deliberately. The sidebar's
 * `/settings/team` route is dead (nothing registers it) and the only real
 * members UI is ProjectSettingsDialog, which lives under `app/` and cannot be
 * imported from a feature (enforced by import/no-restricted-paths). Naming
 * where to look beats inventing a request-access flow.
 */
export const ResumeRestrictedToggle = () => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <div
              role="button"
              tabIndex={0}
              aria-label={t('Resume restricted')}
              className="flex cursor-not-allowed items-center justify-center"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsPopoverOpen(true);
                }
              }}
            >
              <Switch
                checked={false}
                disabled
                className="pointer-events-none"
              />
            </div>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {t('Only an Admin can resume this workflow.')}
        </TooltipContent>
      </Tooltip>
      <PopoverContent side="bottom" align="start" className="w-[280px]">
        <div className="space-y-2 text-sm">
          <p>
            {t(
              'Only an Admin can resume this workflow. Ask your project Admin to turn it back on.',
            )}
          </p>
          <p className="text-muted-foreground">
            {t(
              'Your project Admins are listed under Project settings, Members.',
            )}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};
