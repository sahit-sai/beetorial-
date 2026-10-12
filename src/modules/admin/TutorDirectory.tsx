import React, { useEffect, useState } from 'react'
import { Users, Search, Mail, Phone, Award } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Panel } from '../../components/common/Panel'
import { EmptyState } from '../../components/common/EmptyState'
import { DataService } from '../../lib/dataService'
import { Profile } from '../../types'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'

export const TutorDirectory: React.FC = () => {
  const [tutors, setTutors] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const profiles = await DataService.getProfiles()
      setTutors(profiles.filter((p) => p.role === 'teacher'))
      setLoading(false)
    }
    loadData()
  }, [])

  const filtered = tutors.filter(
    (t) =>
      t.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (t.email && t.email.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <AppShell
      title="Tutor Faculty & Teaching Roster"
      subtitle="Verified subject specialists, assigned teaching capacity and performance ratings."
      activeRole="admin"
    >
      {loading ? (
        <LoadingSpinner message="Loading teaching faculty directory..." />
      ) : (
        <div className="dashboard-grid">
          <div className="dashboard-col" style={{ gridColumn: '1 / -1' }}>
            <Panel title="Active Teaching Faculty" subtitle="All accredited educators active on Beetorial.">
              <div className="table-search" style={{ marginBottom: '16px' }}>
                <Search size={14} />
                <input
                  placeholder="Search tutors by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {filtered.length === 0 ? (
                <div style={{ padding: '24px 0' }}>
                  <EmptyState
                    icon={Users}
                    title="No tutors registered yet"
                    description="Verified teachers and tutors will appear here once onboarded into the academy."
                  />
                </div>
              ) : (
                <div className="data-list">
                  {filtered.map((t) => (
                    <div key={t.id} className="data-row" style={{ padding: '16px 0' }}>
                      <div className="user-avatar" style={{ width: '40px', height: '40px', fontSize: '14px' }}>
                        {t.full_name.charAt(0)}
                      </div>
                      <div className="data-main">
                        <b>{t.full_name}</b>
                        <small style={{ marginTop: '3px' }}>
                          <Mail size={11} style={{ verticalAlign: 'middle' }} /> {t.email || 'No email registered'}
                          {t.phone && (
                            <> · <Phone size={11} style={{ verticalAlign: 'middle' }} /> {t.phone}</>
                          )}
                        </small>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background: '#e6f8ec',
                            color: '#24845a',
                            textTransform: 'uppercase',
                          }}
                        >
                          Active Tutor
                        </span>
                      </div>
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
