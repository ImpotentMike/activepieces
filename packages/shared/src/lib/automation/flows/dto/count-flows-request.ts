import { z } from 'zod'
import { OptionalBooleanFromQuery } from '../../../core/common/base-model'
import { FlowStatus } from '../flow'

export const CountFlowsRequest = z.object({
    projectId: z.string(),
    folderId: z.string().optional(),
    status: z.enum(FlowStatus).optional(),
    hasPublishedVersion: OptionalBooleanFromQuery,
})

export type CountFlowsRequest = z.infer<typeof CountFlowsRequest>
