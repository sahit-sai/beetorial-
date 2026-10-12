import React, { useEffect, useState } from 'react'
import { CalendarDays, Check, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Panel } from '../../components/common/Panel'
import { EmptyState } from '../../components/common/EmptyState'
import { DataService } from '../../lib/dataService'
import { AttendanceStatus, ClassSession } from '../../types'
import { useAuth } from '../../lib/authContext'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'

interface AttendanceRecordItem {
  id: string
  classId: string
  studentId: string
  studentName: string
  classTitle: string
  sessionTime: string
  status: AttendanceStatus
  notes: string
}

export const AttendanceView: React.FC = () => {
  const { user } = useAuth()
  const [classes, setClasses] = useState<ClassSession[]>([])
  const [records, setRecords] = useState<AttendanceRecordItem[]>([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const classList = await DataService.getClasses()
      setClasses(classList)

      const items: AttendanceRecordItem[] = classList.map((cls) => ({
        id: `att-${cls.id}`,
        classId: cls.id,
        studentId: cls.student_id || 'std-unknown',
        studentName: cls.student_name || 'Enrolled Student',
        classTitle: cls.course_title || 'Class Session',
        sessionTime: new Date(cls.starts_at).toLocaleString(),
        status: cls.status === 'completed' ? 'present' : 'present',
        notes: cls.status === 'completed' ? 'Completed scheduled session.' : 'Scheduled session attendance.',
      }))
      setRecords(items)
      setLoading(false)
    }
    loadData()
  }, [])

  const handleStatusChange = async (index: number, newStatus: AttendanceStatus) => {
    const updated = [...records]
    updated[index].status = newStatus
    setRecords(updated)

    await DataService.recordAttendance(
      {
        class_id: updated[index].classId,
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

      {loading ? (
        <LoadingSpinner message="Loading attendance records..." />
      ) : (
        <div className="dashboard-grid">
          <div className="dashboard-col" style={{ gridColumn: '1 / -1' }}>
            <Panel
              title="Class Attendance Records"
              subtitle="Verified presence logged in student profile and visible to parents."
            >
              {records.length === 0 ? (
                <div style={{ padding: '24px 0' }}>
                  <EmptyState
                    icon={CalendarDays}
                    title="No attendance records"
                    description="Attendance logs will appear here once live classes are scheduled and conducted."
                  />
                </div>
              ) : (
                <div className="data-list">
                  {records.map((item, idx) => (
                    <div key={item.id} className="data-row" style={{ padding: '16px 0' }}>
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
              )}
            </Panel>
          </div>
        </div>
      )}
    </AppShell>
  )
}
