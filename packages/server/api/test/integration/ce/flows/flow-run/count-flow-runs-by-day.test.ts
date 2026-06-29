import { FlowRunStatus, FlowVersionState, RunEnvironment } from '@activepieces/shared'
import { FastifyInstance } from 'fastify'
import { StatusCodes } from 'http-status-codes'
import { describeWithAuth } from '../../../../helpers/describe-with-auth'
import { db } from '../../../../helpers/db'
import { createMockFlow, createMockFlowRun, createMockFlowVersion } from '../../../../helpers/mocks'
import { setupTestEnvironment, teardownTestEnvironment } from '../../../../helpers/test-setup'

let app: FastifyInstance | null = null

beforeAll(async () => {
    app = await setupTestEnvironment()
})

afterAll(async () => {
    await teardownTestEnvironment()
})

const DAY_MS = 24 * 60 * 60 * 1000

function middayUtcDaysAgo(daysAgo: number): Date {
    const date = new Date(Date.now() - daysAgo * DAY_MS)
    date.setUTCHours(12, 0, 0, 0)
    return date
}

function utcDayKey(date: Date): string {
    return date.toISOString().slice(0, 10)
}

describeWithAuth('Count flow runs by day endpoint', () => app!, (setup) => {
    it('should group production runs per day with succeeded and failed counts', async () => {
        const ctx = await setup()

        const mockFlow = createMockFlow({ projectId: ctx.project.id })
        await db.save('flow', mockFlow)
        const mockFlowVersion = createMockFlowVersion({
            flowId: mockFlow.id,
            state: FlowVersionState.LOCKED,
        })
        await db.save('flow_version', mockFlowVersion)

        const twoDaysAgo = middayUtcDaysAgo(2)
        const oneDayAgo = middayUtcDaysAgo(1)

        const baseRun = {
            projectId: ctx.project.id,
            flowId: mockFlow.id,
            flowVersionId: mockFlowVersion.id,
            environment: RunEnvironment.PRODUCTION,
        }

        await db.save('flow_run', [
            createMockFlowRun({
                ...baseRun,
                status: FlowRunStatus.SUCCEEDED,
                created: twoDaysAgo.toISOString(),
            }),
            createMockFlowRun({
                ...baseRun,
                status: FlowRunStatus.SUCCEEDED,
                created: twoDaysAgo.toISOString(),
            }),
            createMockFlowRun({
                ...baseRun,
                status: FlowRunStatus.FAILED,
                created: twoDaysAgo.toISOString(),
            }),
            createMockFlowRun({
                ...baseRun,
                status: FlowRunStatus.RUNNING,
                created: oneDayAgo.toISOString(),
            }),
            createMockFlowRun({
                ...baseRun,
                status: FlowRunStatus.SUCCEEDED,
                created: oneDayAgo.toISOString(),
                environment: RunEnvironment.TESTING,
            }),
        ])

        const response = await ctx.get('/v1/flow-runs/count-by-day', {
            projectId: ctx.project.id,
            createdAfter: new Date(Date.now() - 7 * DAY_MS).toISOString(),
        })

        expect(response?.statusCode).toBe(StatusCodes.OK)
        const body = response?.json()
        expect(body.data).toEqual([
            {
                day: utcDayKey(twoDaysAgo),
                total: 3,
                succeeded: 2,
                failed: 1,
            },
            {
                day: utcDayKey(oneDayAgo),
                total: 1,
                succeeded: 0,
                failed: 0,
            },
        ])
    })

    it('should exclude runs created before createdAfter', async () => {
        const ctx = await setup()

        const mockFlow = createMockFlow({ projectId: ctx.project.id })
        await db.save('flow', mockFlow)
        const mockFlowVersion = createMockFlowVersion({
            flowId: mockFlow.id,
            state: FlowVersionState.LOCKED,
        })
        await db.save('flow_version', mockFlowVersion)

        await db.save('flow_run', createMockFlowRun({
            projectId: ctx.project.id,
            flowId: mockFlow.id,
            flowVersionId: mockFlowVersion.id,
            environment: RunEnvironment.PRODUCTION,
            status: FlowRunStatus.SUCCEEDED,
            created: middayUtcDaysAgo(10).toISOString(),
        }))

        const response = await ctx.get('/v1/flow-runs/count-by-day', {
            projectId: ctx.project.id,
            createdAfter: new Date(Date.now() - 7 * DAY_MS).toISOString(),
        })

        expect(response?.statusCode).toBe(StatusCodes.OK)
        expect(response?.json().data).toEqual([])
    })

    it('should reject an invalid timezone', async () => {
        const ctx = await setup()

        const response = await ctx.get('/v1/flow-runs/count-by-day', {
            projectId: ctx.project.id,
            createdAfter: new Date(Date.now() - 7 * DAY_MS).toISOString(),
            timezone: 'Not/AZone',
        })

        expect(response?.statusCode).toBe(StatusCodes.CONFLICT)
    })
})
