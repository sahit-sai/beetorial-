// ====================================================================
// Beetorial Security & Activity Audit Logging Service
// ====================================================================

import { AuditLog } from '../types'
import { isSupabaseConfigured, supabase } from './supabase'

const AUDIT_STORAGE_KEY = 'beetorial_audit_logs_v1'

const INITIAL_DEMO_LOGS: AuditLog[] = [
  {
    id: 'AUD-001',
    actor_id: 'e0000000-0000-0000-0000-000000000005',
    actor_name: 'Kavita Sundaram',
    actor_role: 'super_admin',
    action: 'SYSTEM_INITIALIZE',
    resource_type: 'platform',
    resource_id: 'beetorial-core',
    metadata: { environment: 'verified_sandbox', rbac_enforced: true },
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'AUD-002',
    actor_id: 'd0000000-0000-0000-0000-000000000004',
    actor_name: 'Vikram Patel',
    actor_role: 'admin',
    action: 'ASSIGN_ROLE',
    resource_type: 'profiles',
    resource_id: 'c0000000-0000-0000-0000-000000000003',
    metadata: { granted_role: 'teacher', target_name: 'Ms. Priya Sharma' },
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'AUD-003',
    actor_id: 'c0000000-0000-0000-0000-000000000003',
    actor_name: 'Ms. Priya Sharma',
    actor_role: 'teacher',
    action: 'CREATE_HOMEWORK',
    resource_type: 'homework',
    resource_id: '44444444-4444-4444-4444-444444444441',
    metadata: { title: 'Fractions Practice Sheet #4' },
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  }
]

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
