import { t } from 'i18next';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
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
 * The toggle for a Draft workflow.
 *
 * Off and visually disabled, in the same column position as every other row's
 * toggle. Clicking it never does nothing silently and never auto-publishes:
 * publishing is a deliberate act and goes through the Publish action, which
 * opens the workflow in the builder.
 *
 * Hover copy is BOB-148 Scenario 1's wording; the click popover carries the
 * fuller explanation plus the action.
 */
export const DraftToggle = ({ canPublish, onPublish }: DraftToggleProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <div
              role="button"
              tabIndex={0}
              aria-label={t('Workflow is a draft')}
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
          {t('Publish this workflow to enable it')}
        </TooltipContent>
      </Tooltip>
      <PopoverContent side="bottom" align="start" className="w-[280px]">
        <div className="space-y-3 text-sm">
          <p>
            {canPublish
              ? t('This workflow is still a draft. Publish it to turn it on.')
              : t(
                  'This workflow is still a draft. Only an Admin can publish it.',
                )}
          </p>
          {canPublish && (
            <Button
              size="sm"
              onClick={() => {
                setIsPopoverOpen(false);
                onPublish();
              }}
            >
              {t('Publish')}
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export type DraftToggleProps = {
  canPublish: boolean;
  /** Opens the workflow in the builder, where publishing actually happens. */
  onPublish: () => void;
};
