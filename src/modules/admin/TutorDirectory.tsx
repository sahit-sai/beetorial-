import React, { useState } from 'react'
import { Users, Search, CheckCircle, Award, Mail, Phone } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Panel } from '../../components/common/Panel'

interface TutorRecord {
  id: string
  name: string
  subject: string
  qualification: string
  studentsCount: number
  rating: string
  status: 'active' | 'onboarding'
}

export const TutorDirectory: React.FC = () => {
  const [search, setSearch] = useState('')

  const tutors: TutorRecord[] = [
    {
      id: 'TUT-101',
      name: 'Ms. Priya Sharma',
      subject: 'Mathematics & Science',
      qualification: 'M.Sc. Mathematics · 7 Yrs Exp',
      studentsCount: 14,
      rating: '4.9 ★',
      status: 'active',
    },
    {
      id: 'TUT-102',
      name: 'Dr. Anand Iyer',
      subject: 'Physics & Chemistry',
      qualification: 'Ph.D. Physical Sciences · 12 Yrs Exp',
      studentsCount: 18,
      rating: '5.0 ★',
      status: 'active',
    },
    {
      id: 'TUT-103',
      name: 'Sarah Joseph',
      subject: 'English & Literature',
      qualification: 'M.A. English Literature · 5 Yrs Exp',
      studentsCount: 12,
      rating: '4.8 ★',
      status: 'active',
    },
  ]

  const filtered = tutors.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppShell
      title="Tutor Faculty & Teaching Roster"
      subtitle="Verified subject specialists, assigned teaching capacity and performance ratings."
      activeRole="admin"
    >
      <div className="dashboard-grid">
        <div className="dashboard-col" style={{ gridColumn: '1 / -1' }}>
          <Panel title="Active Teaching Faculty" subtitle="All accredited educators active on Beetorial.">
            <div className="table-search" style={{ marginBottom: '16px' }}>
              <Search size={14} />
              <input
                placeholder="Search tutors by name or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="data-list">
              {filtered.map((t) => (
                <div key={t.id} className="data-row" style={{ padding: '16px 0' }}>
                  <div className="user-avatar" style={{ width: '40px', height: '40px', fontSize: '14px' }}>
                    {t.name.charAt(0)}
                  </div>
                  <div className="data-main">
                    <b>{t.name} · {t.subject}</b>
                    <small style={{ marginTop: '3px' }}>
                      {t.qualification} · Active Students: {t.studentsCount}
                    </small>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--purple)' }}>
                      {t.rating}
                    </span>
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
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  )
}
