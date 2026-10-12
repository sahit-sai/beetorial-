import React, { useEffect, useState } from 'react'
import { Users, Search, Check, ShieldCheck } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Panel } from '../../components/common/Panel'
import { DataService } from '../../lib/dataService'
import { Profile } from '../../types'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'

export const UserManagement: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const data = await DataService.getProfiles()
      setProfiles(data)
      setLoading(false)
    }
    loadData()
  }, [])

  const filtered = profiles.filter(
    (p) =>
      p.full_name.toLowerCase().includes(search.toLowerCase()) ||
      p.role.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppShell
      title="Platform User Management"
      subtitle="Complete register of all users across Parent, Student, Teacher, Admin, Super Admin and Support roles."
      activeRole="super_admin"
    >
      {notice && (
        <div className="inline-notice">
          <Check size={16} />
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)}>✕</button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading user directory..." />
      ) : (
        <div className="dashboard-grid">
          <div className="dashboard-col" style={{ gridColumn: '1 / -1' }}>
            <Panel title="All Platform User Accounts" subtitle="System-wide accounts stored in PostgreSQL profiles.">
              <div className="table-search" style={{ marginBottom: '16px' }}>
                <Search size={14} />
                <input
                  placeholder="Search user profiles by name or role..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="data-list">
                {filtered.map((p) => (
                  <div key={p.id} className="data-row" style={{ padding: '14px 0' }}>
                    <div className="user-avatar" style={{ width: '36px', height: '36px' }}>
                      {p.full_name.charAt(0)}
                    </div>
                    <div className="data-main">
                      <b>{p.full_name}</b>
                      <small>ID: {p.id} · Phone: {p.phone || 'Not set'}</small>
                    </div>
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        padding: '4px 8px',
                        borderRadius: '6px',
                        textTransform: 'uppercase',
                        background: '#eeecff',
                        color: 'var(--purple)',
                      }}
                    >
                      {p.role}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      )}
    </AppShell>
  )
}
