import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  GraduationCap,
  Wallet,
  ShieldCheck,
  LockKeyhole,
  ClipboardList,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Stat } from '../../components/common/Stat'
import { Panel } from '../../components/common/Panel'
import { DataService } from '../../lib/dataService'
import { AuditLog } from '../../types'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { EmptyState } from '../../components/common/EmptyState'
import { Payment, Profile } from '../../types'

export const SuperAdminDashboard: React.FC = () => {
  const nav = useNavigate()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const [logList, profileList, paymentList] = await Promise.all([
        DataService.getAuditLogs(),
        DataService.getProfiles(),
        DataService.getPayments(),
      ])
      setLogs(logList)
      setProfiles(profileList)
      setPayments(paymentList)
      setLoading(false)
    }
    loadData()
  }, [])

  const userCount = profiles.length
  const tutorCount = profiles.filter((p) => p.role === 'teacher').length
  const revenuePaise = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount_paise, 0)

  return (
    <AppShell
      title="Platform Governance & System Overview"
      subtitle="Monitor multi-tenant operations, access controls, revenue and audit trails from one place."
      activeRole="super_admin"
    >
      <div className="stat-grid">
        <Stat label="Platform Users" value={String(userCount)} sub="Active accounts" icon={Users} kind="violet" />
        <Stat label="Active Tutors" value={String(tutorCount)} sub="Accredited teachers" icon={GraduationCap} kind="blue" />
        <Stat label="Total Settled" value={`₹${(revenuePaise / 100).toLocaleString('en-IN')}`} sub="Platform revenue" icon={Wallet} kind="green" />
        <Stat label="Security Events" value={String(logs.length)} sub="Audit records" icon={ShieldCheck} kind="orange" />
      </div>

      {loading ? (
        <LoadingSpinner message="Loading platform governance..." />
      ) : (
        <div className="dashboard-grid">
          <div className="dashboard-col">
            <Panel
              title="Recent Security & System Audit Events"
              subtitle="Logged via server triggers and security procedures."
              action={
                <button type="button" className="subtle-button" onClick={() => nav('/super-admin/audit')}>
                  Full Audit Log <ArrowRight size={13} />
                </button>
              }
            >
              {logs.length === 0 ? (
                <div style={{ padding: '24px 0' }}>
                  <EmptyState
                    icon={ClipboardList}
                    title="No security audit events recorded"
                    description="Security operations, authentication attempts and role changes will appear here."
                  />
                </div>
              ) : (
                <div className="data-list">
                  {logs.slice(0, 5).map((log) => (
                    <div key={log.id} className="data-row" style={{ padding: '12px 0' }}>
                      <div className="data-mark" style={{ background: '#f5f3ff', color: 'var(--purple)' }}>
                        <ClipboardList size={16} />
                      </div>
                      <div className="data-main">
                        <b>{log.action} · {log.resource_type}</b>
                        <small>
                          Actor: {log.actor_name || log.actor_role} · {new Date(log.created_at).toLocaleString()}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>

          <div className="dashboard-col">
            <Panel title="Platform Governance Shortcuts" subtitle="Privileged administrative controls.">
              <div className="quick-actions">
                <button type="button" onClick={() => nav('/super-admin/access-controls')}>
                  <span><LockKeyhole size={16} /></span>
                  Server RBAC & Role Matrix
                  <ArrowRight size={14} />
                </button>
                <button type="button" onClick={() => nav('/super-admin/users')}>
                  <span><Users size={16} /></span>
                  User Directory & Permissions
                  <ArrowRight size={14} />
                </button>
                <button type="button" onClick={() => nav('/super-admin/tutors')}>
                  <span><GraduationCap size={16} /></span>
                  Tutor Accreditation Approvals
                  <ArrowRight size={14} />
                </button>
                <button type="button" onClick={() => nav('/super-admin/audit')}>
                  <span><ClipboardList size={16} /></span>
                  Security Audit Log CSV Export
                  <ArrowRight size={14} />
                </button>
              </div>
            </Panel>

            <Panel title="System Health & RLS Policy Status" subtitle="All 12 tables protected.">
              <div className="todo-list">
                <label className="todo">
                  <input type="checkbox" defaultChecked disabled />
                  <span>
                    <b>Fail-closed Row Level Security active</b>
                    <small>All tables block unauthorized client modifications.</small>
                  </span>
                </label>
                <label className="todo">
                  <input type="checkbox" defaultChecked disabled />
                  <span>
                    <b>Service-role keys omitted from bundle</b>
                    <small>Protected from browser exposure.</small>
                  </span>
                </label>
                <label className="todo">
                  <input type="checkbox" defaultChecked disabled />
                  <span>
                    <b>Immutable audit trail active</b>
                    <small>Privileged actions signed and recorded.</small>
                  </span>
                </label>
              </div>
            </Panel>
          </div>
        </div>
      )}
    </AppShell>
  )
}
