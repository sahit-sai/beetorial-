import React, { useEffect, useState } from 'react'
import { ShieldCheck, Download, Search, RefreshCw, FileText } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Panel } from '../../components/common/Panel'
import { DataService } from '../../lib/dataService'
import { AuditLog } from '../../types'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { EmptyState } from '../../components/common/EmptyState'

export const AuditActivity: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchLogs = async () => {
    setLoading(true)
    const data = await DataService.getAuditLogs()
    setLogs(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const handleExportCSV = () => {
    const headers = ['ID', 'Actor Name', 'Actor Role', 'Action', 'Resource Type', 'Resource ID', 'Timestamp']
    const rows = logs.map((l) => [
      String(l.id),
      `"${(l.actor_name || '').replace(/"/g, '""')}"`,
      l.actor_role || '',
      `"${l.action.replace(/"/g, '""')}"`,
      l.resource_type,
      l.resource_id || '',
      l.created_at,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `beetorial-audit-events-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.resource_type.toLowerCase().includes(search.toLowerCase()) ||
      (l.actor_name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppShell
      title="Security & Operational Audit Activity"
      subtitle="Complete, immutable record of privileged actions, role changes and security events."
      activeRole="super_admin"
    >
      {loading ? (
        <LoadingSpinner message="Loading audit trails..." />
      ) : (
        <div className="dashboard-grid">
          <div className="dashboard-col" style={{ gridColumn: '1 / -1' }}>
            <Panel
              title="Security Event Log"
              subtitle="Events logged with verified actor identity and metadata."
              action={
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" className="subtle-button" onClick={fetchLogs}>
                    <RefreshCw size={12} /> Refresh
                  </button>
                  <button type="button" className="button button-primary" onClick={handleExportCSV} style={{ padding: '8px 12px', fontSize: '10px' }}>
                    <Download size={13} /> Export CSV Audit Trail
                  </button>
                </div>
              }
            >
              <div className="table-search" style={{ marginBottom: '16px' }}>
                <Search size={14} />
                <input
                  placeholder="Search by action, resource type or actor name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {filtered.length === 0 ? (
                <EmptyState
                  icon={ShieldCheck}
                  title="No Audit Records"
                  description={
                    search
                      ? `No audit events matching "${search}".`
                      : 'No system security events recorded yet.'
                  }
                />
              ) : (
                <div className="data-list">
                  {filtered.map((log) => (
                    <div key={log.id} className="data-row" style={{ padding: '14px 0', alignItems: 'flex-start' }}>
                      <div className="data-mark" style={{ background: '#f5f3ff', color: 'var(--purple)', marginTop: '2px' }}>
                        <ShieldCheck size={16} />
                      </div>
                      <div className="data-main">
                        <b>{log.action} · {log.resource_type.toUpperCase()}</b>
                        <small style={{ marginTop: '2px' }}>
                          Actor: {log.actor_name || 'System Actor'} ({log.actor_role || 'system'}) {log.resource_id && `· Resource: ${log.resource_id}`}
                        </small>
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <small style={{ marginTop: '4px', fontFamily: 'monospace', color: '#555d78' }}>
                            {JSON.stringify(log.metadata)}
                          </small>
                        )}
                      </div>
                      <time style={{ fontSize: '9px', color: '#858ca2', whiteSpace: 'nowrap' }}>
                        {new Date(log.created_at).toLocaleString()}
                      </time>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        </div>
      )}
    </AppShell>
  )
}
