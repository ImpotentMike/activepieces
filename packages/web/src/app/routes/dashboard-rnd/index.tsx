import dayjs from 'dayjs';
import { t } from 'i18next';
import { Workflow } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { PageHeader } from '@/components/custom/page-header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getProjectName, projectCollectionUtils } from '@/features/projects';
import { authenticationSession } from '@/lib/authentication-session';
import { cn } from '@/lib/utils';

import { PrimaryDashboardView } from '../dashboard/components/dashboard-view';
import { dashboardData } from '../dashboard/lib/dashboard-data';
import { dashboardSyntheticData } from '../dashboard/lib/dashboard-synthetic-data';

import { RndDashboardView } from './components/rnd-dashboard-view';
import { rndDashboardData, RndPlanUsage } from './lib/rnd-dashboard-data';
import { rndStyles } from './lib/rnd-styles';

const SERIES_DAYS = 30;

export default function DashboardRndPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = authenticationSession.getProjectId()!;
  const { project } = projectCollectionUtils.useCurrentProject();

  const design = parseDesign(searchParams.get('design'));
  const [rndRangeDays, setRndRangeDays] = useState(7);
  const rndUpdatedAt = useMemo(() => Date.now(), []);

  const demoData = useMemo(
    () => dashboardSyntheticData.build({ projectId }),
    [projectId],
  );

  const series = useMemo(
    () =>
      dashboardData.fillDailySeries({
        counts: demoData.runsByDay,
        days: SERIES_DAYS,
      }),
    [demoData],
  );

  const planUsage = useMemo(() => buildDemoUsage(), []);

  const workflowsHref =
    authenticationSession.appendProjectRoutePrefix('/automations');
  const greeting = `${t(rndDashboardData.greetingKey(new Date().getHours()))}${
    project ? `, ${getProjectName(project)}` : ''
  }`;

  const setDesign = (next: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('design', next);
    setSearchParams(params, { replace: true });
  };

  return (
    <div
      className={cn(
        'flex w-full flex-col',
        design === 'rnd'
          ? cn('pb-10', rndStyles.canvas)
          : 'gap-4 bg-[var(--pf-page-bg)] pb-8',
      )}
    >
      <PageHeader
        breadcrumb={<span>{t('Dashboard R&D')}</span>}
        title={greeting}
        description={t('Compare dashboard design iterations on showcase data')}
        leftContent={
          <span className="ms-3 inline-flex items-center gap-1.5 rounded-full border border-warning-100 bg-warning-50 px-2.5 py-1 text-[11.5px] font-medium text-warning-700">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-warning-500"
            />
            {t('Showcase data')}
          </span>
        }
        rightContent={
          <div className="flex flex-wrap items-center gap-2">
            <Tabs value={design} onValueChange={setDesign}>
              <TabsList
                className="h-8"
                aria-label={t('Switch dashboard design')}
              >
                <TabsTrigger value="rnd" className="text-xs">
                  {t('R&D')}
                </TabsTrigger>
                <TabsTrigger value="primary" className="text-xs">
                  {t('Primary')}
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(workflowsHref)}
            >
              <Workflow className="size-4" />
              {t('View workflows')}
            </Button>
          </div>
        }
      />

      {design === 'rnd' ? (
        <RndDashboardView
          series={series}
          workflowCounts={demoData.workflowCounts}
          recentRuns={demoData.recentRuns}
          planUsage={planUsage}
          projectId={projectId}
          state="ready"
        />
      ) : (
        <PrimaryDashboardView
          series={series}
          rangeDays={rndRangeDays}
          workflowCounts={demoData.workflowCounts}
          recentRuns={demoData.recentRuns}
          flaggedRuns={dashboardData.flaggedRuns({
            runs: demoData.recentRuns,
            limit: 5,
          })}
          flaggedCount={demoData.flaggedTotal}
          totalRunsAllTime={demoData.totalRunsAllTime}
          workflowCountsState="ready"
          runsState="ready"
          recentRunsState="ready"
          flaggedState="ready"
          projectId={projectId}
          lastUpdated={rndUpdatedAt}
          isRefreshing={false}
          onRangeChange={setRndRangeDays}
          onRefresh={() => {
            /* showcase data is static */
          }}
        />
      )}
    </div>
  );
}

function parseDesign(value: string | null): RndDesign {
  if (value === 'primary') {
    return value;
  }
  return 'rnd';
}

function buildDemoUsage(): RndPlanUsage {
  const resetInDays = Math.max(0, dayjs().endOf('month').diff(dayjs(), 'day'));
  return {
    kind: 'metered',
    unitKey: 'AI credits',
    used: 12840,
    limit: 20000,
    percent: 64,
    resetInDays,
  };
}

type RndDesign = 'rnd' | 'primary';
