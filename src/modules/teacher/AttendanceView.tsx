import React, { useState } from 'react'
import { CalendarDays, Check, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Panel } from '../../components/common/Panel'
import { DataService } from '../../lib/dataService'
import { AttendanceStatus } from '../../types'
import { useAuth } from '../../lib/authContext'

interface AttendanceEntry {
  studentId: string
  studentName: string
  classTitle: string
  sessionTime: string
  status: AttendanceStatus
  notes: string
}

export const AttendanceView: React.FC = () => {
  const { user } = useAuth()
  const [entries, setEntries] = useState<AttendanceEntry[]>([
    {
      studentId: 'b0000000-0000-0000-0000-000000000002',
      studentName: 'Aditi Raman',
      classTitle: 'Mathematics · Fractions & ratios',
      sessionTime: 'Yesterday, 5:00 PM',
      status: 'present',
      notes: 'Active engagement and good question asking during session.',
    },
    {
      studentId: 'st-2',
      studentName: 'Rahul Sharma',
      classTitle: 'Science · Cell Biology',
      sessionTime: '12 Oct, 4:00 PM',
      status: 'present',
      notes: 'Completed plant cell labeling worksheet accurately.',
    },
    {
      studentId: 'st-3',
      studentName: 'Meera K.',
      classTitle: 'English · Reading Comprehension',
      sessionTime: '11 Oct, 6:00 PM',
      status: 'late',
      notes: 'Joined 10 minutes late due to technical glitch; completed session.',
    },
  ])

  const [notice, setNotice] = useState<string | null>(null)

  const handleStatusChange = async (index: number, newStatus: AttendanceStatus) => {
    const updated = [...entries]
    updated[index].status = newStatus
    setEntries(updated)

    await DataService.recordAttendance(
      {
        class_id: 'cls-102',
        student_id: updated[index].studentId,
        student_name: updated[index].studentName,
        status: newStatus,
        notes: updated[index].notes,
      },
      user
    )

    setNotice(`Attendance updated for ${updated[index].studentName}: ${newStatus.toUpperCase()}`)
  }

  return (
    <AppShell
      title="Attendance Register & Session Logs"
      subtitle="Record student presence, punctuality and session participation notes."
      activeRole="teacher"
    >
      {notice && (
        <div className="inline-notice">
          <Check size={16} />
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)}>✕</button>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="dashboard-col" style={{ gridColumn: '1 / -1' }}>
          <Panel
            title="Class Attendance Records"
            subtitle="Verified presence logged in student profile and visible to parents."
          >
            <div className="data-list">
              {entries.map((item, idx) => (
                <div key={item.studentId} className="data-row" style={{ padding: '16px 0' }}>
                  <div
                    className="data-mark"
                    style={{
                      background:
                        item.status === 'present'
                          ? '#e6f8ec'
                          : item.status === 'late'
                          ? '#fff8e6'
                          : '#fde8e8',
                      color:
                        item.status === 'present'
                          ? '#24845a'
                          : item.status === 'late'
                          ? '#c98a1f'
                          : '#c81e1e',
                    }}
                  >
                    {item.status === 'present' ? (
                      <CheckCircle2 size={16} />
                    ) : item.status === 'late' ? (
                      <Clock size={16} />
                    ) : (
                      <XCircle size={16} />
                    )}
                  </div>

                  <div className="data-main">
                    <b>{item.studentName} · {item.classTitle}</b>
                    <small style={{ marginTop: '3px' }}>Session: {item.sessionTime}</small>
                    <small style={{ marginTop: '4px', color: '#555d78' }}>
                      Teacher Note: "{item.notes}"
                    </small>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    {(['present', 'late', 'absent'] as AttendanceStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleStatusChange(idx, st)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '7px',
                          border: `1px solid ${item.status === st ? 'var(--purple)' : '#e5e8f2'}`,
                          background: item.status === st ? '#eeecff' : '#ffffff',
                          color: item.status === st ? 'var(--purple)' : '#555d78',
                          fontSize: '9px',
                          fontWeight: 700,
                          textTransform: 'capitalize',
                          cursor: 'pointer',
                        }}
                      >
                        {st}
                      </button>
                    ))}
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
