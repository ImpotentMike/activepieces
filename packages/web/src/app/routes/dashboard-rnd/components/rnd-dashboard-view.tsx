import { FAILED_STATES, FlowRunCountByDay } from '@activepieces/shared';
import dayjs from 'dayjs';
import { t } from 'i18next';
import { ArrowRight, CircleAlert, Workflow, Zap } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { authenticationSession } from '@/lib/authentication-session';
import { cn, DASHBOARD_CONTENT_PADDING_X } from '@/lib/utils';

import {
  RecentRuns,
  RecentRunRow,
} from '../../dashboard/components/recent-runs';
import {
  dashboardData,
  DashboardQueryState,
} from '../../dashboard/lib/dashboard-data';
import { DashboardWorkflowCounts } from '../../dashboard/lib/dashboard-synthetic-data';
import { rndDashboardData, RndPlanUsage } from '../lib/rnd-dashboard-data';

import { PlanUsageCard } from './plan-usage-card';
import { RndKpiCard } from './rnd-kpi-card';
import { RunVolumePanel } from './run-volume-panel';
import { SuccessRateGauge } from './success-rate-gauge';

const SERIES_DAYS = 30;

export function RndDashboardView({
  series,
  workflowCounts,
  recentRuns,
  planUsage,
  projectId,
  state,
}: RndDashboardViewProps) {
  const navigate = useNavigate();

  const last7Window = useMemo(
    () => ({
      createdAfter: dayjs().subtract(6, 'day').startOf('day').toISOString(),
      createdBefore: dayjs().toISOString(),
    }),
    [],
  );

  const stats7 = rndDashboardData.windowStats({ series, days: 7 });
  const stats30 = rndDashboardData.windowStats({ series, days: SERIES_DAYS });
  const successTrend = rndDashboardData.successRateTrend({ series });

  const workflowsHref =
    authenticationSession.appendProjectRoutePrefix('/automations');

  return (
    <div
      className={cn('flex flex-col gap-5 pt-5', DASHBOARD_CONTENT_PADDING_X)}
    >
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="flex flex-col gap-5 xl:col-span-2">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <RndKpiCard
              label={t('Runs · last 7 days')}
              value={stats7.total.toLocaleString()}
              icon={Zap}
              trend={stats7.totalTrend}
              state={state}
              footnote={t('{succeeded} succeeded · {failed} failed', {
                succeeded: stats7.succeeded.toLocaleString(),
                failed: stats7.failed.toLocaleString(),
              })}
              aria-label={t('Runs in the last 7 days')}
              onClick={() =>
                navigate(
                  dashboardData.buildRunsHref({
                    projectId,
                    timeWindow: last7Window,
                  }),
                )
              }
            />
            <RndKpiCard
              label={t('Total workflows')}
              value={(workflowCounts?.total ?? 0).toLocaleString()}
              icon={Workflow}
              state={state}
              footnote={t('{published} live · {draft} draft', {
                published: workflowCounts?.published ?? 0,
                draft: workflowCounts?.draft ?? 0,
              })}
              aria-label={t('Total workflows in this project')}
              onClick={() => navigate(workflowsHref)}
            />
            <RndKpiCard
              label={t('Active workflows')}
              value={(workflowCounts?.published ?? 0).toLocaleString()}
              icon={Workflow}
              tone="success"
              state={state}
              footnote={t('Published and live')}
              aria-label={t('Active workflows')}
              onClick={() => navigate(workflowsHref)}
            />
            <RndKpiCard
              label={t('Failed · last 7 days')}
              value={stats7.failed.toLocaleString()}
              icon={CircleAlert}
              tone="destructive"
              trend={stats7.failedTrend}
              invertTrend
              state={state}
              footnote={t('Across all workflows')}
              aria-label={t('Failed runs in the last 7 days')}
              onClick={() =>
                navigate(
                  dashboardData.buildRunsHref({
                    projectId,
                    statuses: FAILED_STATES,
                    timeWindow: last7Window,
                  }),
                )
              }
            />
          </div>

          <RunVolumePanel series={series} state={state} />

          <section data-slot="rnd-recent-runs" className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="m-0 text-[15px] font-semibold tracking-tight text-foreground">
                {t('Recent runs')}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() =>
                  navigate(
                    authenticationSession.appendProjectRoutePrefix('/runs'),
                  )
                }
              >
                {t('View all runs')}
                <ArrowRight className="size-4" />
              </Button>
            </div>
            <RecentRuns
              runs={recentRuns}
              state={state}
              onRowClick={(run) =>
                navigate(`/projects/${run.projectId}/runs/${run.id}`)
              }
            />
          </section>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-1">
          <PlanUsageCard
            usage={planUsage}
            onViewBilling={() => navigate('/platform/setup/billing')}
          />
          <SuccessRateGauge
            successRate={stats30.successRate}
            trend={successTrend}
            succeeded={stats30.succeeded}
            failed={stats30.failed}
            state={state}
          />
        </div>
      </div>
    </div>
  );
}

export type RndDashboardViewProps = {
  series: FlowRunCountByDay[];
  workflowCounts: DashboardWorkflowCounts | undefined;
  recentRuns: RecentRunRow[];
  planUsage: RndPlanUsage;
  projectId: string;
  state: DashboardQueryState;
};
