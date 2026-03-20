import { CronJob, CronDelivery } from '@/lib/types'
import { execSync } from 'child_process'
import { parseSchedule, describeCron } from './cron-utils'
import { requireEnv } from '@/lib/env'
import { loadRegistry } from '@/lib/agents-registry'

/** Extract JSON from CLI output that may contain ANSI-colored plugin logs */
function extractCliJson(raw: string): unknown {
  const clean = raw.replace(/\x1b\[[0-9;]*m/g, '')
  try { return JSON.parse(clean) } catch {}
  const arrStart = clean.indexOf('[')
  const objStart = clean.indexOf('{')
  const start = arrStart === -1 ? objStart : objStart === -1 ? arrStart : Math.min(arrStart, objStart)
  if (start === -1) throw new Error('No JSON in CLI output')
  const opener = clean[start]
  const closer = opener === '[' ? ']' : '}'
  let depth = 0, inStr = false, esc = false
  for (let i = start; i < clean.length; i++) {
    const ch = clean[i]
    if (esc) { esc = false; continue }
    if (ch === '\\' && inStr) { esc = true; continue }
    if (ch === '"') { inStr = !inStr; continue }
    if (inStr) continue
    if (ch === opener) depth++
    else if (ch === closer && --depth === 0) return JSON.parse(clean.slice(start, i + 1))
  }
  throw new Error('Unterminated JSON')
}

// Cache to avoid repeated CLI calls
let _cronCache: { data: CronJob[]; ts: number } | null = null
const CRON_CACHE_TTL = 60_000 // 60 seconds

/**
 * Match a cron job name to an agent by prefix.
 * Tries each known agent ID as a prefix (longest first to avoid
 * partial matches, e.g. "seo-team" matches before "seo").
 */
function matchAgent(name: string, agentIds: string[]): string | null {
  const sorted = [...agentIds].sort((a, b) => b.length - a.length)
  for (const id of sorted) {
    if (name === id || name.startsWith(id + '-')) return id
  }
  return null
}

export async function getCrons(): Promise<CronJob[]> {
  if (_cronCache && Date.now() - _cronCache.ts < CRON_CACHE_TTL) {
    return _cronCache.data
  }
  const data = await _getCronsUncached()
  _cronCache = { data, ts: Date.now() }
  return data
}

async function _getCronsUncached(): Promise<CronJob[]> {
  try {
    const openclawBin = requireEnv('OPENCLAW_BIN')
    const raw = execSync(`${openclawBin} cron list --json`, {
      encoding: 'utf-8',
      timeout: 10000,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsed = extractCliJson(raw) as any
    const jobs: unknown[] = Array.isArray(parsed)
      ? parsed
      : parsed.jobs ?? parsed.data ?? []

    // Load known agent IDs for dynamic cron-to-agent matching
    const agentIds = loadRegistry().map(a => a.id)

    return jobs.map((job: unknown) => {
      const j = job as Record<string, unknown>
      const state = (j.state as Record<string, unknown>) || {}
      const name = String(j.name || '')
      const { expression: schedule, timezone } = parseSchedule(j.schedule)

      // Status can be in state.status or directly on j.status
      const rawStatus = state.status ?? j.status ?? ''
      let status: 'ok' | 'error' | 'idle' = 'idle'
      if (rawStatus === 'error' || rawStatus === 'failed') {
        status = 'error'
      } else if (rawStatus === 'ok' || rawStatus === 'success' || rawStatus === 'completed') {
        status = 'ok'
      }

      // nextRun: try state.nextRunAtMs first, then state.nextRunAt
      const nextRunMs = state.nextRunAtMs ?? state.nextRunAt ?? j.nextRunAtMs ?? j.nextRunAt
      const nextRun = nextRunMs
        ? new Date(Number(nextRunMs)).toISOString()
        : null

      // lastRun: try state.lastRunAtMs, state.lastRunAt, or top-level equivalents
      const lastRunRaw = state.lastRunAtMs ?? state.lastRunAt ?? j.lastRunAtMs ?? j.lastRunAt ?? j.last
      const lastRun = lastRunRaw
        ? (typeof lastRunRaw === 'number' ? new Date(lastRunRaw).toISOString() : String(lastRunRaw))
        : null

      const lastError = (state.lastError ?? state.error ?? j.lastError) ? String(state.lastError ?? state.error ?? j.lastError) : null

      // Delivery config
      const rawDelivery = j.delivery as Record<string, unknown> | undefined
      let delivery: CronDelivery | null = null
      if (rawDelivery && typeof rawDelivery === 'object') {
        delivery = {
          mode: String(rawDelivery.mode || ''),
          channel: String(rawDelivery.channel || ''),
          to: rawDelivery.to ? String(rawDelivery.to) : null,
        }
      }

      // Rich state fields
      const lastDurationMs = typeof state.lastDurationMs === 'number' ? state.lastDurationMs : null
      const consecutiveErrors = typeof state.consecutiveErrors === 'number' ? state.consecutiveErrors : 0
      const lastDeliveryStatus = typeof state.lastDeliveryStatus === 'string' ? state.lastDeliveryStatus : null

      // Use explicit agentId from raw data first, fall back to name-based matching
      const rawAgentId = typeof j.agentId === 'string' ? j.agentId : null
      const resolvedAgentId = rawAgentId && agentIds.includes(rawAgentId)
        ? rawAgentId
        : (rawAgentId || matchAgent(name, agentIds))

      return {
        id: String(j.id || j.name || ''),
        name,
        schedule,
        scheduleDescription: describeCron(schedule),
        timezone,
        status,
        lastRun,
        nextRun,
        lastError,
        agentId: resolvedAgentId,
        description: typeof j.description === 'string' ? j.description : null,
        enabled: j.enabled !== false,
        delivery,
        lastDurationMs,
        consecutiveErrors,
        lastDeliveryStatus,
      }
    })
  } catch (err) {
    throw new Error(
      `Failed to fetch cron jobs: ${err instanceof Error ? err.message : String(err)}`
    )
  }
}
