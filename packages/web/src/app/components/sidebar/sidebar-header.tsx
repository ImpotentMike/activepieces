import { ApEdition, ApFlagId } from '@activepieces/shared';
import { t } from 'i18next';
import { ChevronsUpDown, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useEmbedding } from '@/components/providers/embed-provider';
import { Button } from '@/components/ui/button';
import {
  SidebarHeader,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar-shadcn';
import { PlatformSwitcher } from '@/features/projects';
import { useAuthorization } from '@/hooks/authorization-hooks';
import { flagsHooks } from '@/hooks/flags-hooks';
import { platformHooks } from '@/hooks/platform-hooks';
import { determineDefaultRoute } from '@/lib/route-utils';
import { cn } from '@/lib/utils';

export const AppSidebarHeader = () => {
  const { embedState } = useEmbedding();
  const { data: edition } = flagsHooks.useFlag<ApEdition>(ApFlagId.EDITION);
  const showSwitcher = edition === ApEdition.CLOUD && !embedState.isEmbedded;
  const { state, toggleSidebar } = useSidebar();
  const { platform: currentPlatform } = platformHooks.useCurrentPlatform();
  const { checkAccess } = useAuthorization();
  const defaultRoute = determineDefaultRoute(checkAccess);
  const branding = flagsHooks.useWebsiteBranding();
  const navigate = useNavigate();
  const isCollapsed = state === 'collapsed';

  const brandMark = (
    <button
      type="button"
      onClick={() => navigate(defaultRoute || '/')}
      className="flex items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
      aria-label={t('home')}
    >
      <img
        src={branding.logos.logoIconUrl}
        alt={branding.websiteName}
        className="h-8 w-8 shrink-0"
        draggable={false}
      />
    </button>
  );

  if (isCollapsed) {
    return (
      <SidebarHeader>
        <div className="flex items-center justify-center">{brandMark}</div>
      </SidebarHeader>
    );
  }

  const wordmark = (
    <span className="truncate text-base font-semibold text-sidebar-foreground">
      {branding.websiteName}
    </span>
  );

  return (
    <SidebarHeader>
      <div className="flex w-full items-center justify-between gap-2">
        {showSwitcher ? (
          <PlatformSwitcher>
            <SidebarMenuButton
              className={cn(
                'h-9! w-auto! flex-1 min-w-0 px-2! gap-2! bg-transparent! hover:bg-sidebar-accent',
              )}
            >
              {brandMark}
              <span className="truncate text-base font-semibold text-sidebar-foreground flex-1 text-left">
                {currentPlatform?.name ?? branding.websiteName}
              </span>
              <ChevronsUpDown className="ml-auto size-3.5! shrink-0 text-muted-foreground" />
            </SidebarMenuButton>
          </PlatformSwitcher>
        ) : (
          <div className="flex items-center gap-2 min-w-0">
            {brandMark}
            {wordmark}
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-sidebar-foreground"
          aria-label="Toggle sidebar"
        >
          <Menu className="size-4" />
        </Button>
      </div>
    </SidebarHeader>
  );
};
