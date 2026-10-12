// ====================================================================
// Beetorial Security & Activity Audit Logging Service
// ====================================================================

import { AuditLog } from '../types'
import { isSupabaseConfigured, supabase } from './supabase'

const AUDIT_STORAGE_KEY = 'beetorial_audit_logs_v1'

const INITIAL_DEMO_LOGS: AuditLog[] = []

export function getLocalAuditLogs(): AuditLog[] {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch (err) {
    console.error('Failed to read audit logs from storage:', err)
  }
  return INITIAL_DEMO_LOGS
}

export function saveLocalAuditLogs(logs: AuditLog[]): void {
  try {
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs))
  } catch (err) {
    console.error('Failed to save audit logs to storage:', err)
  }
}

export async function logSecurityEvent(
  action: string,
  resourceType: string,
  resourceId?: string | null,
  metadata: Record<string, any> = {},
  actor?: { id?: string; name?: string; role?: any }
): Promise<void> {
  const timestamp = new Date().toISOString()

  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.rpc('log_audit_event', {
        p_action: action,
        p_resource_type: resourceType,
        p_resource_id: resourceId ?? null,
        p_metadata: metadata,
      })
      if (!error) return
      console.warn('Supabase audit rpc error, falling back to local audit buffer:', error.message)
    } catch (e) {
      console.warn('Audit RPC call failed:', e)
    }
  }

  // Local persistent audit log buffer
  const existing = getLocalAuditLogs()
  const newEntry: AuditLog = {
    id: `AUD-${Date.now().toString(36).toUpperCase()}`,
    actor_id: actor?.id ?? 'anon',
    actor_name: actor?.name ?? (actor?.role ? `${actor.role} user` : 'Platform User'),
    actor_role: actor?.role ?? 'support',
    action,
    resource_type: resourceType,
    resource_id: resourceId ?? null,
    metadata,
    created_at: timestamp,
  }

  saveLocalAuditLogs([newEntry, ...existing])
}
