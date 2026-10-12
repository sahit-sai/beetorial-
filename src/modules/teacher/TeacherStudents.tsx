import React, { useEffect, useState } from 'react'
import { Users, Mail, Phone, CalendarCheck, Search } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Panel } from '../../components/common/Panel'
import { EmptyState } from '../../components/common/EmptyState'
import { DataService } from '../../lib/dataService'
import { Profile } from '../../types'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'

export const TeacherStudents: React.FC = () => {
  const [students, setStudents] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const profiles = await DataService.getProfiles()
      setStudents(profiles.filter((p) => p.role === 'student'))
      setLoading(false)
    }
    loadData()
  }, [])

  const filtered = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <AppShell
      title="Student Directory & Guardian Contacts"
      subtitle="Class roster with contact info, attendance records and average performance."
      activeRole="teacher"
    >
      {loading ? (
        <LoadingSpinner message="Loading enrolled students roster..." />
      ) : (
        <div className="dashboard-grid">
          <div className="dashboard-col" style={{ gridColumn: '1 / -1' }}>
            <Panel title="Enrolled Students Roster" subtitle="Learners assigned to your active tutoring sections.">
              <div className="table-search" style={{ marginBottom: '16px' }}>
                <Search size={14} />
                <input
                  placeholder="Search by student name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {filtered.length === 0 ? (
                <div style={{ padding: '24px 0' }}>
                  <EmptyState
                    icon={Users}
                    title="No students enrolled yet"
                    description="Learners assigned to your courses will appear here with guardian contact details and academic stats."
                  />
                </div>
              ) : (
                <div className="data-list">
                  {filtered.map((s) => (
                    <div key={s.id} className="data-row" style={{ padding: '16px 0' }}>
                      <div className="user-avatar" style={{ width: '38px', height: '38px', fontSize: '13px' }}>
                        {s.full_name.charAt(0)}
                      </div>
                      <div className="data-main">
                        <b>{s.full_name}</b>
                        <small style={{ marginTop: '3px' }}>
                          <Mail size={11} style={{ verticalAlign: 'middle' }} /> {s.email || 'No email registered'}
                          {s.phone && (
                            <> · <Phone size={11} style={{ verticalAlign: 'middle' }} /> {s.phone}</>
                          )}
                        </small>
                      </div>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '9px', color: '#858ca2' }}>Status</span>
                          <b style={{ display: 'block', fontSize: '12px', color: '#24845a' }}>Active</b>
                        </div>
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
