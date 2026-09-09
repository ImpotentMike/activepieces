import { PopulatedFlow, isNil } from '@activepieces/shared';

import type { SelectedItemsMap, TreeItem } from './types';
import { getItemKey } from './utils';

/**
 * Resolves a selection back to full flow rows.
 *
 * The selection map stores only type and id, but the bulk pause dialog needs
 * each workflow's name and lifecycle state. Rows are already in memory, so no
 * refetch is needed — and this reads `selectableItems`, not `rootFlows`, so
 * flows selected inside an expanded folder are not silently dropped.
 */
const selectedFlowRows = ({
  selectableItems,
  selectedItems,
}: {
  selectableItems: TreeItem[];
  selectedItems: SelectedItemsMap;
}): PopulatedFlow[] =>
  selectableItems
    .filter((item) => selectedItems.has(getItemKey(item)))
    .filter(isFlowRow)
    .map((item) => item.data);

const isFlowRow = (
  item: TreeItem,
): item is TreeItem & { data: PopulatedFlow } =>
  item.type === 'flow' && !isNil(item.data);

export const workflowSelectionUtils = { selectedFlowRows };
