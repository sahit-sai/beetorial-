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

export const SuperAdminDashboard: React.FC = () => {
  const nav = useNavigate()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const data = await DataService.getAuditLogs()
      setLogs(data)
      setLoading(false)
    }
    loadData()
  }, [])

  return (
    <AppShell
      title="Platform Governance & System Overview"
      subtitle="Monitor multi-tenant operations, access controls, revenue and audit trails from one place."
      activeRole="super_admin"
    >
      <div className="stat-grid">
        <Stat label="Platform Users" value="2,480" sub="+8.2% this month" icon={Users} kind="violet" />
        <Stat label="Active Tutors" value="164" sub="Across 6 subjects" icon={GraduationCap} kind="blue" />
        <Stat label="Monthly Revenue" value="₹4.8L" sub="+12.4% this month" icon={Wallet} kind="green" />
        <Stat label="Pending Approvals" value="12" sub="Requires review" icon={ShieldCheck} kind="orange" />
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
