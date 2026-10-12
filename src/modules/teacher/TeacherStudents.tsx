import React, { useState } from 'react'
import { Users, Mail, Phone, CalendarCheck, Search } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Panel } from '../../components/common/Panel'

interface StudentRosterItem {
  id: string
  name: string
  grade: string
  parentName: string
  parentEmail: string
  parentPhone: string
  attendancePct: number
  avgScore: number
}

export const TeacherStudents: React.FC = () => {
  const [search, setSearch] = useState('')

  const students: StudentRosterItem[] = [
    {
      id: 'st-1',
      name: 'Aditi Raman',
      grade: 'Grade 8',
      parentName: 'Ananya Raman',
      parentEmail: 'parent@beetorial.example',
      parentPhone: '+91 98765 43210',
      attendancePct: 96,
      avgScore: 92,
    },
    {
      id: 'st-2',
      name: 'Rahul Sharma',
      grade: 'Grade 6',
      parentName: 'Sanjay Sharma',
      parentEmail: 'sanjay@example.com',
      parentPhone: '+91 98765 22222',
      attendancePct: 90,
      avgScore: 84,
    },
    {
      id: 'st-3',
      name: 'Meera K.',
      grade: 'Grade 5',
      parentName: 'Kavita K.',
      parentEmail: 'kavita@example.com',
      parentPhone: '+91 98765 33333',
      attendancePct: 100,
      avgScore: 88,
    },
  ]

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.parentName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppShell
      title="Student Directory & Guardian Contacts"
      subtitle="Class roster with contact info, attendance records and average performance."
      activeRole="teacher"
    >
      <div className="dashboard-grid">
        <div className="dashboard-col" style={{ gridColumn: '1 / -1' }}>
          <Panel title="Enrolled Students Roster" subtitle="Learners assigned to your active tutoring sections.">
            <div className="table-search" style={{ marginBottom: '16px' }}>
              <Search size={14} />
              <input
                placeholder="Search by student or parent name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="data-list">
              {filtered.map((s) => (
                <div key={s.id} className="data-row" style={{ padding: '16px 0' }}>
                  <div className="user-avatar" style={{ width: '38px', height: '38px', fontSize: '13px' }}>
                    {s.name.charAt(0)}
                  </div>
                  <div className="data-main">
                    <b>{s.name} ({s.grade})</b>
                    <small style={{ marginTop: '3px' }}>
                      Guardian: {s.parentName} · <Mail size={11} style={{ verticalAlign: 'middle' }} /> {s.parentEmail} · <Phone size={11} style={{ verticalAlign: 'middle' }} /> {s.parentPhone}
                    </small>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '9px', color: '#858ca2' }}>Attendance</span>
                      <b style={{ display: 'block', fontSize: '12px', color: '#24845a' }}>{s.attendancePct}%</b>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '9px', color: '#858ca2' }}>Avg Score</span>
                      <b style={{ display: 'block', fontSize: '12px', color: 'var(--purple)' }}>{s.avgScore}/100</b>
                    </div>
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
