import {
  PROJECT_COLOR_PALETTE,
  PlatformRole,
  TeamProjectsLimit,
} from '@activepieces/shared';
import { t } from 'i18next';
import {
  ChevronDown,
  Diamond,
  FileText,
  Settings,
  Shield,
  Unplug,
  Users,
  Workflow,
  Zap,
} from 'lucide-react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDebounce } from 'use-debounce';

import { SearchInput } from '@/components/custom/search-input';
import { LayoutGridIcon } from '@/components/icons/layout-grid';
import { PuzzleIcon } from '@/components/icons/puzzle';
import { useEmbedding } from '@/components/providers/embed-provider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar-shadcn';
import { VirtualizedScrollArea } from '@/components/ui/virtualized-scroll-area';
import {
  CreateProjectButton,
  getProjectName,
  projectCollectionUtils,
} from '@/features/projects';
import { useIsPlatformAdmin } from '@/hooks/authorization-hooks';
import { platformHooks } from '@/hooks/platform-hooks';
import { userHooks } from '@/hooks/user-hooks';
import { authenticationSession } from '@/lib/authentication-session';
import { cn } from '@/lib/utils';

import { recordAccess } from '../../global-search/access-history';
import { STATIC_PAGES } from '../../global-search/static-pages';
import { ApSidebarItem, SidebarItemType } from '../ap-sidebar-item';
import ProjectSideBarItem from '../project';
import { AppSidebarHeader } from '../sidebar-header';
import { SidebarUser } from '../sidebar-user';

export function ProjectDashboardSidebar({
  className,
}: { className?: string } = {}) {
  const { embedState } = useEmbedding();
  const { data: currentUser } = userHooks.useCurrentUser();
  const isPlatformAdmin = useIsPlatformAdmin();
  const projectPrefix = authenticationSession.appendProjectRoutePrefix('');
  const hasProject = projectPrefix.startsWith('/projects/');

  const buildItems: SidebarItemType[] = [
    {
      type: 'link',
      to: hasProject
        ? authenticationSession.appendProjectRoutePrefix('/dashboard')
        : '/',
      label: t('Dashboard'),
      icon: LayoutGridIcon,
      show: true,
      hasPermission: true,
      isSubItem: false,
    },
    {
      type: 'link',
      to: hasProject
        ? authenticationSession.appendProjectRoutePrefix('/automations')
        : '/',
      label: t('Workflows'),
      icon: Workflow,
      show: true,
      hasPermission: true,
      isSubItem: false,
    },
    {
      type: 'link',
      to: hasProject
        ? authenticationSession.appendProjectRoutePrefix('/runs')
        : '/runs',
      label: t('Runs'),
      icon: Zap,
      show: true,
      hasPermission: true,
      isSubItem: false,
    },
    {
      type: 'link',
      to: hasProject
        ? authenticationSession.appendProjectRoutePrefix('/connections')
        : '/connections',
      label: t('Connections'),
      icon: Unplug,
      show: true,
      hasPermission: true,
      isSubItem: false,
    },
    {
      type: 'link',
      to: '/platform/setup/pieces',
      label: t('Connectors'),
      icon: PuzzleIcon,
      show: true,
      hasPermission: true,
      isSubItem: false,
    },
  ];

  const adminItems: SidebarItemType[] = [
    {
      type: 'link',
      to: hasProject
        ? authenticationSession.appendProjectRoutePrefix('/settings/team')
        : '/settings/team',
      label: t('Team'),
      icon: Users,
      show: true,
      hasPermission: true,
      isSubItem: false,
    },
    {
      type: 'link',
      to: '/platform/security/audit-logs',
      label: t('Audit Log'),
      icon: FileText,
      show: true,
      hasPermission: true,
      isSubItem: false,
    },
    {
      type: 'link',
      to: hasProject
        ? authenticationSession.appendProjectRoutePrefix('/settings')
        : '/settings',
      label: t('Project Settings'),
      icon: Settings,
      show: true,
      hasPermission: true,
      isSubItem: false,
      isActive: (pathname) =>
        pathname.includes('/settings') && !pathname.includes('/settings/team'),
    },
  ];

  return (
    !embedState.hideSideNav && (
      <Sidebar
        collapsible="icon"
        id={SIDEBAR_ID}
        className={cn('max-h-[100vh]', className)}
      >
        <AppSidebarHeader />

        <SidebarContent className="overflow-x-hidden">
          <SidebarGroup>
            <ProjectSelectorPill />
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>{t('Build')}</SidebarGroupLabel>
            <SidebarMenu>
              {buildItems.map((item) => (
                <ApSidebarItem key={item.label} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroup>

          {(isPlatformAdmin ||
            currentUser?.platformRole === PlatformRole.ADMIN) && (
            <SidebarGroup>
              <SidebarGroupLabel>{t('Admin')}</SidebarGroupLabel>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <ApSidebarItem key={item.label} {...item} />
                ))}
              </SidebarMenu>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter>
          {isPlatformAdmin && !embedState.isEmbedded && (
            <SidebarMenu>
              <ApSidebarItem
                type="link"
                to="/platform/projects"
                label={t('Super Admin Settings')}
                icon={Shield}
                isSubItem={false}
                show={true}
                hasPermission={true}
                onClick={() => {
                  const page = STATIC_PAGES.find(
                    (p) =>
                      p.href === '/platform/projects' &&
                      p.id === 'page-platform-admin',
                  );
                  if (page)
                    recordAccess({
                      id: page.id,
                      type: 'page',
                      label: page.label,
                      href: page.href,
                    });
                }}
              />
            </SidebarMenu>
          )}
          <SidebarUser />
        </SidebarFooter>
      </Sidebar>
    )
  );
}

function ProjectSelectorPill() {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: projects } = projectCollectionUtils.useAll();
  const { project: currentProject } =
    projectCollectionUtils.useCurrentProject();
  const { platform } = platformHooks.useCurrentPlatform();
  const { data: currentUser } = userHooks.useCurrentUser();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const isCollapsed = state === 'collapsed';

  useEffect(() => {
    if (!open) setSearchQuery('');
  }, [open]);

  const displayProjects = useMemo(() => {
    if (debouncedSearchQuery.length === 0) return projects;
    const q = debouncedSearchQuery.toLowerCase();
    return projects.filter((p) => p.displayName.toLowerCase().includes(q));
  }, [debouncedSearchQuery, projects]);

  const handleProjectSelect = useCallback(
    (projectId: string) => {
      const project = projects.find((p) => p.id === projectId);
      if (project) {
        const palette = project.icon
          ? PROJECT_COLOR_PALETTE[project.icon.color]
          : null;
        const name = getProjectName(project);
        recordAccess({
          id: `project-${projectId}`,
          type: 'project',
          label: name,
          href: `/projects/${projectId}/automations`,
          iconBgColor: palette?.color,
          iconTextColor: palette?.textColor,
          iconLetter: name.charAt(0).toUpperCase(),
        });
      }
      projectCollectionUtils.setCurrentProject(projectId);
      navigate(`/projects/${projectId}/automations`);
      setOpen(false);
    },
    [navigate, projects],
  );

  const shouldShowCreateButton =
    platform.plan.teamProjectsLimit !== TeamProjectsLimit.NONE &&
    currentUser?.platformRole === PlatformRole.ADMIN;

  if (!currentProject) return null;

  const projectName = getProjectName(currentProject);
  const palette = currentProject.icon
    ? PROJECT_COLOR_PALETTE[currentProject.icon.color]
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex h-8 items-center gap-1.5 rounded-lg border border-sidebar-border bg-sidebar-foreground/[0.02] shadow-sm transition-colors hover:bg-sidebar-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
            isCollapsed ? 'w-8 justify-center p-1.5' : 'w-full px-2.5 py-1.5',
          )}
          aria-label={t('Switch project')}
        >
          {palette ? (
            <span
              className="flex size-4 shrink-0 items-center justify-center rounded text-[10px] font-bold"
              style={{
                backgroundColor: palette.color,
                color: palette.textColor,
              }}
            >
              {projectName.charAt(0).toUpperCase()}
            </span>
          ) : (
            <Diamond className="size-4 shrink-0 text-sidebar-foreground/70" />
          )}
          {!isCollapsed && (
            <>
              <span className="flex-1 truncate text-left text-sm font-medium text-sidebar-foreground">
                {projectName}
              </span>
              <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[280px] p-2"
        align="start"
        side={isCollapsed ? 'right' : 'bottom'}
        sideOffset={6}
      >
        <SearchInput
          placeholder={t('Search projects...')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e)}
          className="h-8 mb-2"
          autoFocus
        />
        <div className="max-h-[280px] overflow-hidden">
          {displayProjects.length > 0 ? (
            <VirtualizedScrollArea
              className="h-[280px]"
              items={displayProjects}
              estimateSize={() => 35}
              getItemKey={(index) => displayProjects[index]?.id ?? index}
              overscan={10}
              renderItem={(project) => (
                <SidebarMenuItem className="w-full">
                  <ProjectSideBarItem
                    key={project.id}
                    project={project}
                    isCurrentProject={location.pathname.includes(
                      `/projects/${project.id}`,
                    )}
                    handleProjectSelect={handleProjectSelect}
                  />
                </SidebarMenuItem>
              )}
            />
          ) : (
            <div className="px-2 py-3 text-sm text-muted-foreground">
              {t('No projects found.')}
            </div>
          )}
        </div>
        {shouldShowCreateButton && (
          <div className="mt-2 border-t border-sidebar-border pt-2">
            <CreateProjectButton
              variant="sidebar-menu"
              projects={projects ?? []}
              onCreate={(project) => {
                setOpen(false);
                navigate(`/projects/${project.id}/flows`);
              }}
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export const SIDEBAR_ID = 'project-sidebar';
