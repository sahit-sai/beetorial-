import React, { useEffect, useState } from 'react'
import { CalendarDays, Clock3 } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Panel } from '../../components/common/Panel'
import { MeetingLauncher } from '../../components/providers/MeetingLauncher'
import { DataService } from '../../lib/dataService'
import { ClassSession } from '../../types'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { EmptyState } from '../../components/common/EmptyState'

export const AdminSchedule: React.FC = () => {
  const [classes, setClasses] = useState<ClassSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const list = await DataService.getClasses()
      setClasses(list)
      setLoading(false)
    }
    loadData()
  }, [])

  return (
    <AppShell
      title="Academy Timetable & Session Oversight"
      subtitle="Master schedule across all subject tutors, student cohorts and meeting rooms."
      activeRole="admin"
    >
      {loading ? (
        <LoadingSpinner message="Loading master schedule..." />
      ) : (
        <div className="dashboard-grid">
          <div className="dashboard-col" style={{ gridColumn: '1 / -1' }}>
            <Panel title="Platform Session Schedule" subtitle="Live video links and teacher allocations.">
              {classes.length === 0 ? (
                <div style={{ padding: '24px 0' }}>
                  <EmptyState
                    icon={CalendarDays}
                    title="No sessions scheduled"
                    description="The master calendar will populate with timetable entries as teachers schedule lessons."
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
                          <b>{cls.course_title || 'Session'}</b>
                          <small>
                            Tutor: {cls.teacher_name || 'Assigned Tutor'} · Student: {cls.student_name || 'Enrolled Student'}
                          </small>
                          <span>
                            <Clock3 size={13} /> {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                            {' · '}
                            <span style={{ textTransform: 'capitalize', fontWeight: 700, color: cls.status === 'completed' ? '#24845a' : 'var(--purple)' }}>
                              {cls.status}
                            </span>
                          </span>
                        </div>
                        <MeetingLauncher
                          meetingUrl={cls.meeting_url}
                          classTitle={cls.course_title}
                          classId={cls.id}
                        />
                      </div>
                    )
                  })}
                </div>
              )}
            </Panel>
          </div>
        </div>
      )}
    </AppShell>
  )
}
