import { FlowStatus, PopulatedMcpServer } from '@activepieces/shared';
import { t } from 'i18next';

import { PfStatusPill } from '@/components/custom/pf-status-pill';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function McpFlows({ mcpServer }: McpFlowsProps) {
  const flows = mcpServer?.flows ?? [];

  if (flows.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          {t(
            'No MCP flows yet. Create a flow with an MCP Trigger to expose it as a tool on this server.',
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden divide-y">
      {flows.map((flow) => {
        const isEnabled = flow.status === FlowStatus.ENABLED;
        return (
          <div
            key={flow.id}
            className="flex items-center justify-between px-4 py-3"
          >
            <span className="text-sm font-medium">
              {flow.version.displayName}
            </span>
            <PfStatusPill status={isEnabled ? 'published' : 'paused'} />
          </div>
        );
      })}
    </div>
  );
}

type McpFlowsProps = {
  mcpServer: PopulatedMcpServer;
};
