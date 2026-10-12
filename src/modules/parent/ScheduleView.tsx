import React, { useEffect, useState } from 'react'
import { CalendarDays, Clock3, Plus, Check } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Panel } from '../../components/common/Panel'
import { MeetingLauncher } from '../../components/providers/MeetingLauncher'
import { DataService } from '../../lib/dataService'
import { ClassSession } from '../../types'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { EmptyState } from '../../components/common/EmptyState'

export const ScheduleView: React.FC = () => {
  const [classes, setClasses] = useState<ClassSession[]>([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const data = await DataService.getClasses()
      setClasses(data)
      setLoading(false)
    }
    loadData()
  }, [])

  return (
    <AppShell
      title="Tutoring Calendar & Live Classes"
      subtitle="Upcoming scheduled sessions, meeting links and past completed attendance."
      activeRole="parent"
    >
      {notice && (
        <div className="inline-notice">
          <Check size={16} />
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)}>✕</button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading calendar timetable..." />
      ) : (
        <div className="dashboard-grid">
          <div className="dashboard-col">
            <Panel
              title="Scheduled Tutoring Sessions"
              subtitle="Join video session when teacher opens classroom."
              action={
                <button
                  type="button"
                  className="subtle-button"
                  onClick={() => setNotice('Session reschedule request submitted to tutor.')}
                >
                  <Plus size={13} /> Request Reschedule
                </button>
              }
            >
              {classes.length === 0 ? (
                <div style={{ padding: '20px 0' }}>
                  <EmptyState
                    icon={CalendarDays}
                    title="No sessions scheduled"
                    description="Upcoming live tutoring classes will be listed here once scheduled by your tutor."
                  />
                </div>
              ) : (
                <div className="data-list">
                  {classes.map((cls) => {
                    const startTime = new Date(cls.starts_at)
                    return (
                      <div key={cls.id} className="lesson-row" style={{ padding: '16px 0', borderBottom: '1px solid #f0f1f7' }}>
                        <div className="lesson-date">
                          <small>{startTime.toLocaleString('en-US', { month: 'short' }).toUpperCase()}</small>
                          <b>{startTime.getDate()}</b>
                        </div>
                        <div className="lesson-info">
                          <b>{cls.course_title || 'Tutoring Session'}</b>
                          <small>Tutor: {cls.teacher_name || 'Assigned Tutor'} · 1-on-1 Online</small>
                          <span>
                            <Clock3 size={13} /> {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                            {' · '}
                            <span style={{ textTransform: 'capitalize', fontWeight: 700, color: cls.status === 'completed' ? '#24845a' : 'var(--purple)' }}>
                              {cls.status}
                            </span>
                          </span>
                        </div>
                        {cls.status === 'scheduled' ? (
                          <MeetingLauncher
                            meetingUrl={cls.meeting_url}
                            classTitle={cls.course_title}
                            classId={cls.id}
                          />
                        ) : (
                          <span style={{ fontSize: '10px', color: '#24845a', fontWeight: 700, background: '#e5f8eb', padding: '6px 10px', borderRadius: '7px' }}>
                            Completed
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </Panel>
          </div>

          <div className="dashboard-col">
            <Panel title="Schedule Preferences & Reminders" subtitle="Automated SMS and WhatsApp notifications.">
              <div className="todo-list">
                <label className="todo">
                  <input type="checkbox" defaultChecked />
                  <span>
                    <b>Session reminder 1 hour before</b>
                    <small>Sent via WhatsApp to registered guardian mobile number.</small>
                  </span>
                </label>
                <label className="todo">
                  <input type="checkbox" defaultChecked />
                  <span>
                    <b>Post-class summary notes</b>
                    <small>Summary email with practice worksheet sent after each lesson.</small>
                  </span>
                </label>
                <label className="todo">
                  <input type="checkbox" defaultChecked />
                  <span>
                    <b>Weekly milestone recap</b>
                    <small>Consolidated report delivered every Sunday evening.</small>
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
