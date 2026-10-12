import React, { useEffect, useState } from 'react'
import { BookOpen, Clock3, CalendarDays } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Panel } from '../../components/common/Panel'
import { MeetingLauncher } from '../../components/providers/MeetingLauncher'
import { DataService } from '../../lib/dataService'
import { ClassSession } from '../../types'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { EmptyState } from '../../components/common/EmptyState'

export const StudentClasses: React.FC = () => {
  const [classes, setClasses] = useState<ClassSession[]>([])
  const [loading, setLoading] = useState(true)

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
      title="My Scheduled Classes & Lessons"
      subtitle="Join live sessions with your tutors and review your learning calendar."
      activeRole="student"
    >
      {loading ? (
        <LoadingSpinner message="Loading class schedule..." />
      ) : (
        <div className="dashboard-grid">
          <div className="dashboard-col" style={{ gridColumn: '1 / -1' }}>
            <Panel
              title="Class Timetable & Video Rooms"
              subtitle="Click 'Join' to launch the verified meeting room when class begins."
            >
              {classes.length === 0 ? (
                <div style={{ padding: '24px 0' }}>
                  <EmptyState
                    icon={BookOpen}
                    title="No classes scheduled"
                    description="Your upcoming tutoring classes and video rooms will appear here once booked by your tutor."
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
                          <small>Tutor: {cls.teacher_name || 'Assigned Tutor'} · 1-on-1 Session</small>
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
                            Lesson Completed
                          </span>
                        )}
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
